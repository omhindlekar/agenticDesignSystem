import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { HANDOFF_VALIDATORS } from '../../packages/schemas/src/handoff-registry.js';
import { PipelineSchema } from '../../packages/schemas/src/pipeline.js';
import { RunLogWriter } from '../../packages/run-log/src/index.js';
import type { Pipeline, PipelineStep } from '../../packages/schemas/src/pipeline.js';
import type { ContextPack } from '../../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { QAReport } from '../../packages/schemas/src/qa-report.js';
import type { RunLogEntry } from '../../packages/schemas/src/run-log-entry.js';
import type { TaskInput, OrchestratorResult } from './schema.js';

export interface AgentStepResult {
  result: unknown;
  costUsd: number;
  /** Anything the agent noticed and treated as data (logged and reported). */
  flags?: string[];
}

/** What every agent runner receives: the task, every earlier step's output, and feedback on retry. */
export interface AgentRunInput {
  taskId: string;
  brief: string;
  runId: string;
  /** Validated outputs of earlier steps, by agent name. */
  outputs: Record<string, unknown>;
  previousError?: string | undefined;
}

export type AgentRunner = (input: AgentRunInput) => Promise<AgentStepResult>;

interface Config {
  retryLimit: number;
  costCapPerRunUsd: number;
  maxCallsPerRun?: number | undefined;
}

export interface OrchestratorDeps {
  /** Runners by agent name (agents/registry.ts). */
  agents?: Record<string, AgentRunner>;
  /** Defaults to config/pipeline.json. */
  pipeline?: Pipeline;
  /** Shorthands kept for the three original agents. */
  contextRunner?: (input: { taskId: string; task: string }) => Promise<ContextPack>;
  composerRunner?: (input: {
    taskId: string;
    brief: string;
    contextPack: ContextPack;
    previousError?: string | undefined;
  }) => Promise<AgentStepResult>;
  builderRunner?: (input: {
    taskId: string;
    spec: ScreenSpec;
    contextPack: ContextPack;
    previousError?: string | undefined;
  }) => Promise<AgentStepResult>;
  config?: Config;
  repoRoot?: string;
  logWriter?: Pick<RunLogWriter, 'write'>;
  /** Fixed run id, for replay. */
  runId?: string;
}

const title = (agent: string) => agent.charAt(0).toUpperCase() + agent.slice(1);

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as Config;
  return { retryLimit: raw.retryLimit, costCapPerRunUsd: raw.costCapPerRunUsd, maxCallsPerRun: raw.maxCallsPerRun };
}

export function loadPipeline(repoRoot: string): Pipeline {
  return PipelineSchema.parse(JSON.parse(readFileSync(join(repoRoot, 'config', 'pipeline.json'), 'utf8')));
}

/** Maps the original runner shorthands onto the registry shape. */
function legacyRunners(deps: OrchestratorDeps): Record<string, AgentRunner> {
  const runners: Record<string, AgentRunner> = {};
  if (deps.contextRunner) {
    const run = deps.contextRunner;
    runners['context'] = async ({ taskId, brief }) => ({ result: await run({ taskId, task: brief }), costUsd: 0 });
  }
  if (deps.composerRunner) {
    const run = deps.composerRunner;
    runners['composer'] = ({ taskId, brief, outputs, previousError }) =>
      run({ taskId, brief, contextPack: outputs['context'] as ContextPack, previousError });
  }
  if (deps.builderRunner) {
    const run = deps.builderRunner;
    runners['builder'] = ({ taskId, outputs, previousError }) =>
      run({
        taskId,
        spec: outputs['composer'] as ScreenSpec,
        contextPack: outputs['context'] as ContextPack,
        previousError,
      });
  }
  return runners;
}

/** Plain-language feedback for the step that must fix a failed QA report. */
export function qaFeedback(report: QAReport): string {
  const lines = (report.findings ?? []).map(
    (f) =>
      `- ${f.ruleId}${f.criterion ? ` (WCAG ${f.criterion})` : ''}: ${f.message}${f.evidence ? ` [${f.evidence}]` : ''}`,
  );
  const failed = report.checks.filter((c) => c.status === 'fail').map((c) => `${c.checkName}: ${c.reason ?? 'failed'}`);
  return `QA failed. Fix these and return the whole file again.\n${[...failed, ...lines].join('\n')}`;
}

export async function runOrchestrator(input: TaskInput, deps: OrchestratorDeps): Promise<OrchestratorResult> {
  const runId = deps.runId ?? randomUUID();
  const repoRoot = deps.repoRoot ?? join(new URL(import.meta.url).pathname, '..', '..', '..');
  const config = deps.config ?? loadConfig(repoRoot);
  const pipeline = deps.pipeline ?? loadPipeline(repoRoot);
  const runners: Record<string, AgentRunner> = { ...legacyRunners(deps), ...(deps.agents ?? {}) };
  const logWriter = deps.logWriter;
  const maxCalls = config.maxCallsPerRun ?? Infinity;

  let cost = 0;
  let calls = 0;
  const attempts: Record<string, number> = Object.fromEntries(
    pipeline.steps.filter((s) => s.modelBacked || s.retry?.on === 'qa-fail').map((s) => [s.agent, 0]),
  );
  const outputs: Record<string, unknown> = {};
  const flags: string[] = [];
  let firstPass = true;

  const log = async (
    agent: string,
    inputHash: string,
    output: unknown,
    started: number,
    outcome: RunLogEntry['outcome'],
    stepCost: number,
    extra: { flags?: string[]; ruleIds?: string[] } = {},
  ) => {
    if (!logWriter) return;
    // Timings and the run id vary between runs of the same work; leave them out of the hash
    // so a replay of the same run hashes the same (FR-19, NFR-5).
    const out =
      output === undefined
        ? ''
        : typeof output === 'string'
          ? output
          : JSON.stringify(output, (k, v: unknown) => (k === 'durationMs' ? undefined : v)).replaceAll(runId, '<run>');
    await logWriter.write({
      runId,
      agent,
      inputHash,
      outputHash: RunLogWriter.hashContent(out),
      toolsUsed: [],
      ruleIdsConsulted: extra.ruleIds ?? [],
      durationMs: Date.now() - started,
      outcome,
      timestamp: new Date().toISOString(),
      costUsd: stepCost,
      ...(extra.flags && extra.flags.length ? { flags: extra.flags } : {}),
    });
  };

  const finish = (outcome: OrchestratorResult['outcome'], error?: string): OrchestratorResult => {
    const byOutput = (name: string) => {
      const step = pipeline.steps.find((s) => s.output === name);
      return step ? outputs[step.agent] : undefined;
    };
    const s = byOutput('screen-spec') as ScreenSpec | undefined;
    const tsx = byOutput('tsx') as string | undefined;
    const qa = byOutput('qa-report') as QAReport | undefined;
    return {
      taskId: input.taskId,
      runId,
      outcome,
      ...(error !== undefined ? { error } : {}),
      ...(s !== undefined ? { spec: s } : {}),
      ...(outcome === 'pass' && tsx !== undefined ? { tsx } : {}),
      ...(qa !== undefined ? { qaReport: qa } : {}),
      attempts: { ...attempts },
      firstPass: outcome === 'pass' && firstPass,
      calls,
      costUsd: cost,
      flags: [...flags],
    };
  };

  /** Guards that run after every model-backed call. Returns an escalation error, if any. */
  const guard = async (after: string): Promise<string | undefined> => {
    let error: string | undefined;
    if (calls >= maxCalls) error = `Max calls per run exceeded after ${after}: ${calls} >= ${maxCalls}`;
    else if (cost >= config.costCapPerRunUsd)
      error = `Cost cap exceeded after ${after}: $${cost.toFixed(4)} >= $${config.costCapPerRunUsd}`;
    if (error)
      await log('orchestrator', RunLogWriter.hashContent(input.taskId), undefined, Date.now(), 'escalate', cost);
    return error;
  };

  /**
   * Runs one step with its schema retries. Returns undefined on success (output stored)
   * or an escalation error.
   */
  const runStep = async (step: PipelineStep, feedback?: string): Promise<string | undefined> => {
    const runner = runners[step.agent];
    const validate = HANDOFF_VALIDATORS[step.output];
    if (!runner) return `${title(step.agent)} agent failed: no runner registered for "${step.agent}"`;
    if (!validate) return `${title(step.agent)} agent failed: no schema registered for output "${step.output}"`;
    const retries = step.retry?.on === 'schema' ? config.retryLimit : 0;
    const inputHash = RunLogWriter.hashContent(
      JSON.stringify({ taskId: input.taskId, brief: input.brief, step: step.agent }),
    );
    let previousError = feedback;
    let stepCost = 0;
    let made = 0;
    const started = Date.now();
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      made++;
      try {
        const res = await runner({ taskId: input.taskId, brief: input.brief, runId, outputs, previousError });
        stepCost += res.costUsd;
        if (res.flags?.length) flags.push(...res.flags.filter((f) => !flags.includes(f)));
        outputs[step.agent] = validate(res.result);
        if (step.modelBacked) {
          calls += made;
          cost += stepCost;
          attempts[step.agent] = (attempts[step.agent] ?? 0) + made;
        }
        if (made > 1) firstPass = false;
        const qa = step.output === 'qa-report' ? (outputs[step.agent] as QAReport) : undefined;
        await log(
          step.agent,
          inputHash,
          outputs[step.agent],
          started,
          qa?.overallStatus === 'fail' ? 'fail' : 'pass',
          stepCost,
          {
            ...(res.flags ? { flags: res.flags } : {}),
            ...(qa ? { ruleIds: qa.checks.flatMap((c) => c.failingRuleIds) } : {}),
          },
        );
        return undefined;
      } catch (err) {
        previousError = err instanceof Error ? err.message : String(err);
      }
    }
    if (step.modelBacked) {
      calls += made;
      cost += stepCost;
      attempts[step.agent] = (attempts[step.agent] ?? 0) + made;
    }
    delete outputs[step.agent];
    await log(step.agent, inputHash, undefined, started, 'escalate', stepCost);
    return retries > 0
      ? `${title(step.agent)} failed after ${made} attempt(s): ${previousError ?? 'unknown'}`
      : `${title(step.agent)} agent failed: ${previousError ?? 'unknown'}`;
  };

  const steps = pipeline.steps;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    const error = await runStep(step);
    if (error) return finish('escalate', error);
    if (step.modelBacked) {
      const g = await guard(step.agent);
      if (g) return finish('escalate', g);
    }
    if (step.retry?.on !== 'qa-fail') continue;

    // A failing QA report goes back to an earlier step as feedback; then everything after it runs again.
    attempts[step.agent] = 1;
    const targetIndex = steps.findIndex((s) => s.agent === (step.retry?.feedbackTo ?? step.agent));
    let report = outputs[step.agent] as QAReport;
    for (let round = 1; report.overallStatus === 'fail'; round++) {
      firstPass = false;
      if (round > config.retryLimit) {
        return finish(
          'fail',
          `${title(step.agent)} failed after ${attempts[step.agent]} attempt(s): ${qaFeedback(report)}`,
        );
      }
      for (let j = targetIndex; j <= i; j++) {
        const again = steps[j]!;
        // Every step that runs again sees the findings: the spec step fixes spec problems,
        // the build step fixes token and accessibility problems.
        const err = await runStep(again, qaFeedback(report));
        if (err) return finish('escalate', err);
        if (again.modelBacked) {
          const g = await guard(again.agent);
          if (g) return finish('escalate', g);
        }
      }
      attempts[step.agent] = (attempts[step.agent] ?? 0) + 1;
      report = outputs[step.agent] as QAReport;
    }
  }
  return finish('pass');
}
