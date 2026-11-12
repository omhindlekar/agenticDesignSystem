import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import { ContextPackSchema } from '../../packages/schemas/src/context-pack.js';
import { RunLogWriter } from '../../packages/run-log/src/index.js';
import type { ContextPack } from '../../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../../packages/schemas/src/screen-spec.js';
import type { RunLogEntry } from '../../packages/schemas/src/run-log-entry.js';
import type { TaskInput, OrchestratorResult } from './schema.js';

export interface AgentStepResult {
  result: unknown;
  costUsd: number;
}

interface Config {
  retryLimit: number;
  costCapPerRunUsd: number;
  maxCallsPerRun?: number;
}

export interface OrchestratorDeps {
  contextRunner: (input: { taskId: string; task: string }) => Promise<ContextPack>;
  composerRunner: (input: {
    taskId: string;
    brief: string;
    contextPack: ContextPack;
    previousError?: string;
  }) => Promise<AgentStepResult>;
  builderRunner: (input: {
    taskId: string;
    spec: ScreenSpec;
    contextPack: ContextPack;
    previousError?: string;
  }) => Promise<AgentStepResult>;
  config?: Config;
  repoRoot?: string;
  logWriter?: Pick<RunLogWriter, 'write'>;
}

function loadConfig(repoRoot: string): Config {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as {
    retryLimit: number;
    costCapPerRunUsd: number;
    maxCallsPerRun?: number;
  };
  return { retryLimit: raw.retryLimit, costCapPerRunUsd: raw.costCapPerRunUsd, maxCallsPerRun: raw.maxCallsPerRun };
}

type RetrySuccess<T> = { kind: 'success'; value: T; costUsd: number; attempts: number };
type RetryFailure = { kind: 'failure'; error: string; costUsd: number; attempts: number };

async function withRetry<T>(
  fn: (previousError: string | undefined) => Promise<AgentStepResult>,
  validate: (v: unknown) => T,
  retryLimit: number,
): Promise<RetrySuccess<T> | RetryFailure> {
  let lastError: string | undefined;
  let totalCost = 0;

  for (let attempt = 1; attempt <= retryLimit + 1; attempt++) {
    try {
      const { result, costUsd } = await fn(lastError);
      totalCost += costUsd;
      const validated = validate(result);
      return { kind: 'success', value: validated, costUsd: totalCost, attempts: attempt };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt === retryLimit + 1) break;
    }
  }

  return { kind: 'failure', error: lastError ?? 'unknown', costUsd: totalCost, attempts: retryLimit + 1 };
}

function makeLogEntry(
  runId: string,
  agent: string,
  inputHash: string,
  outputHash: string,
  durationMs: number,
  outcome: RunLogEntry['outcome'],
  costUsd?: number,
): RunLogEntry {
  return {
    runId,
    agent,
    inputHash,
    outputHash,
    toolsUsed: [],
    ruleIdsConsulted: [],
    durationMs,
    outcome,
    timestamp: new Date().toISOString(),
    ...(costUsd !== undefined ? { costUsd } : {}),
  };
}

export async function runOrchestrator(
  input: TaskInput,
  deps: OrchestratorDeps,
): Promise<OrchestratorResult> {
  const runId = randomUUID();
  const repoRoot = deps.repoRoot ?? join(new URL(import.meta.url).pathname, '..', '..', '..');
  const config = deps.config ?? loadConfig(repoRoot);
  const logWriter = deps.logWriter;

  let cumulativeCost = 0;
  let totalCalls = 0;
  const maxCalls = config.maxCallsPerRun ?? Infinity;

  // Step 1: Context agent (no retry — runtime errors escalate immediately)
  let contextPack: ContextPack;
  const ctxStart = Date.now();
  try {
    const raw = await deps.contextRunner({ taskId: input.taskId, task: input.brief });
    contextPack = ContextPackSchema.parse(raw);
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'context',
        RunLogWriter.hashContent(input.brief),
        RunLogWriter.hashContent(JSON.stringify(contextPack)),
        Date.now() - ctxStart, 'pass', 0,
      ));
    }
  } catch (err) {
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'context',
        RunLogWriter.hashContent(input.brief),
        RunLogWriter.hashContent(''),
        Date.now() - ctxStart, 'escalate', 0,
      ));
    }
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Context agent failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // Step 2: Composer agent (retry up to retryLimit on schema failure)
  const composerStart = Date.now();
  const composerResult = await withRetry(
    (previousError) =>
      deps.composerRunner({ taskId: input.taskId, brief: input.brief, contextPack, previousError }),
    (v) => ScreenSpecSchema.parse(v),
    config.retryLimit,
  );

  if (logWriter) {
    await logWriter.write(makeLogEntry(
      runId, 'composer',
      RunLogWriter.hashContent(JSON.stringify({ taskId: input.taskId, brief: input.brief })),
      RunLogWriter.hashContent(composerResult.kind === 'success' ? JSON.stringify(composerResult.value) : ''),
      Date.now() - composerStart,
      composerResult.kind === 'success' ? 'pass' : 'escalate',
      composerResult.costUsd,
    ));
  }

  cumulativeCost += composerResult.costUsd;
  totalCalls += composerResult.attempts;

  if (composerResult.kind === 'failure') {
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Composer failed after ${composerResult.attempts} attempt(s): ${composerResult.error}`,
    };
  }

  // Max-calls check after composer (guards CLI provider where costUsd is always 0)
  if (totalCalls >= maxCalls) {
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'orchestrator',
        RunLogWriter.hashContent(input.taskId),
        RunLogWriter.hashContent(''),
        0, 'escalate', cumulativeCost,
      ));
    }
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Max calls per run exceeded after composer: ${totalCalls} >= ${maxCalls}`,
    };
  }

  // Cost cap check after composer
  if (cumulativeCost >= config.costCapPerRunUsd) {
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'orchestrator',
        RunLogWriter.hashContent(input.taskId),
        RunLogWriter.hashContent(''),
        0, 'escalate', cumulativeCost,
      ));
    }
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Cost cap exceeded after composer: $${cumulativeCost.toFixed(4)} >= $${config.costCapPerRunUsd}`,
    };
  }

  const spec = composerResult.value;

  // Step 3: Builder agent (retry up to retryLimit on schema failure)
  const builderStart = Date.now();
  const builderResult = await withRetry(
    (previousError) =>
      deps.builderRunner({ taskId: input.taskId, spec, contextPack, previousError }),
    (v) => {
      if (typeof v !== 'string') throw new Error(`Builder must return a string, got ${typeof v}`);
      return v;
    },
    config.retryLimit,
  );

  if (logWriter) {
    await logWriter.write(makeLogEntry(
      runId, 'builder',
      RunLogWriter.hashContent(JSON.stringify({ taskId: input.taskId })),
      RunLogWriter.hashContent(builderResult.kind === 'success' ? builderResult.value : ''),
      Date.now() - builderStart,
      builderResult.kind === 'success' ? 'pass' : 'escalate',
      builderResult.costUsd,
    ));
  }

  cumulativeCost += builderResult.costUsd;
  totalCalls += builderResult.attempts;

  if (builderResult.kind === 'failure') {
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Builder failed after ${builderResult.attempts} attempt(s): ${builderResult.error}`,
    };
  }

  // Max-calls check after builder
  if (totalCalls >= maxCalls) {
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'orchestrator',
        RunLogWriter.hashContent(input.taskId),
        RunLogWriter.hashContent(''),
        0, 'escalate', cumulativeCost,
      ));
    }
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Max calls per run exceeded after builder: ${totalCalls} >= ${maxCalls}`,
    };
  }

  // Cost cap check after builder
  if (cumulativeCost >= config.costCapPerRunUsd) {
    if (logWriter) {
      await logWriter.write(makeLogEntry(
        runId, 'orchestrator',
        RunLogWriter.hashContent(input.taskId),
        RunLogWriter.hashContent(''),
        0, 'escalate', cumulativeCost,
      ));
    }
    return {
      taskId: input.taskId,
      runId,
      outcome: 'escalate',
      error: `Cost cap exceeded after builder: $${cumulativeCost.toFixed(4)} >= $${config.costCapPerRunUsd}`,
    };
  }

  return {
    taskId: input.taskId,
    runId,
    outcome: 'pass',
    tsx: builderResult.value,
  };
}
