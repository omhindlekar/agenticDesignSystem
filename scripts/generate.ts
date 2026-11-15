/**
 * npm run generate -- "<brief>"
 *
 * Runs the Orchestrator end to end (Context → Composer → Builder) with the provider
 * from config (default: fake; MODEL_PROVIDER=cli for a real model). Prints the screen
 * spec and a run summary, writes the generated TSX to generated/<runId>/screen.tsx
 * (gitignored) and the run log to runs/<runId>/log.jsonl.
 *
 * Exit code 0 on pass, 1 on escalate/fail, 2 on usage error.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runOrchestrator } from '../agents/orchestrator/index.js';
import type { OrchestratorResult } from '../agents/orchestrator/index.js';
import { randomUUID } from 'node:crypto';
import { loadDataStore, detectInstructions } from '../agents/context/index.js';
import { createAgentRegistry } from '../agents/registry.js';
import { RunRecordSchema } from '../packages/schemas/src/run-record.js';
import { RunLogWriter } from '../packages/run-log/src/index.js';
import { resolveProviderName } from '../packages/provider/src/index.js';
import type { ProviderConfig } from '../packages/provider/src/index.js';

/** The brief with recorded fixtures, so it runs offline under the fake provider. */
export const DEMO_BRIEF =
  'A sign-in card with email and password inputs, a remember-me checkbox and a primary sign-in button';

export const SCHEMA_VERSION = '1.1.0';

/** Deterministic task id: the same brief gives the same prompts, so fixtures replay. */
export function taskIdForBrief(brief: string): string {
  return `gen-${createHash('sha256').update(brief).digest('hex').slice(0, 12)}`;
}

export interface GenerateOptions {
  repoRoot: string;
  outDir?: string;
  runsDir?: string;
  print?: (line: string) => void;
  /** Golden-set id: the visual check compares against evals/baselines/<id>.png. */
  baselineId?: string;
  /** Fixed run id (replay). */
  runId?: string;
}

export interface GenerateResult {
  exitCode: number;
  result: OrchestratorResult;
  tsxPath?: string;
}

export async function runGenerate(brief: string, opts: GenerateOptions): Promise<GenerateResult> {
  const { repoRoot } = opts;
  const outDir = opts.outDir ?? join(repoRoot, 'generated');
  const runsDir = opts.runsDir ?? join(repoRoot, 'runs');
  const print = opts.print ?? ((line: string) => console.log(line));
  const show = (path: string): string => relative(process.cwd(), path) || path;

  const config = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as ProviderConfig;
  const provider = resolveProviderName(config);
  const taskId = taskIdForBrief(brief);
  const store = await loadDataStore(repoRoot);

  const runId = opts.runId ?? randomUUID();
  const configText = ['defaults.json', 'pipeline.json']
    .map((f) => readFileSync(join(repoRoot, 'config', f), 'utf8'))
    .join('\n');
  const record = RunRecordSchema.parse({
    runId,
    taskId,
    brief,
    schemaVersion: SCHEMA_VERSION,
    configHash: createHash('sha256').update(configText).digest('hex').slice(0, 16),
    provider,
    model: config.model,
    flags: detectInstructions(brief),
    startedAt: new Date().toISOString(),
  });
  mkdirSync(join(runsDir, runId), { recursive: true });
  writeFileSync(join(runsDir, runId, 'run.json'), `${JSON.stringify(record, null, 2)}\n`);

  const result = await runOrchestrator(
    { taskId, brief, schemaVersion: SCHEMA_VERSION },
    {
      repoRoot,
      runId,
      logWriter: new RunLogWriter(runsDir),
      agents: createAgentRegistry({
        repoRoot,
        store,
        runsDir,
        ...(opts.baselineId ? { baselineId: opts.baselineId } : {}),
      }),
    },
  );

  if (result.spec) {
    print('Screen spec:');
    print(JSON.stringify(result.spec, null, 2));
    print('');
  }

  let tsxPath: string | undefined;
  if (result.outcome === 'pass' && result.tsx !== undefined) {
    const dir = join(outDir, result.runId);
    mkdirSync(dir, { recursive: true });
    tsxPath = join(dir, 'screen.tsx');
    writeFileSync(tsxPath, result.tsx.endsWith('\n') ? result.tsx : `${result.tsx}\n`, 'utf8');
  }

  const row = (label: string, value: string) => print(`${`${label}:`.padEnd(12)}${value}`);
  row('Run id', result.runId);
  row('Task id', result.taskId);
  row('Provider', `${provider} (model ${config.model})`);
  row('Outcome', result.outcome);
  row(
    'Retries',
    Object.entries(result.attempts)
      .map(([agent, n]) => `${agent} ${Math.max(n - 1, 0)}`)
      .join(', '),
  );
  if (result.qaReport) {
    row(
      'QA',
      `${result.qaReport.overallStatus}${result.firstPass ? ' (first pass)' : ''}: ${result.qaReport.checks.map((c) => `${c.checkName} ${c.status}`).join(', ')}`,
    );
    for (const f of result.qaReport.findings ?? [])
      print(
        `  ${f.ruleId}${f.criterion ? ` (WCAG ${f.criterion})` : ''}: ${f.message}${f.evidence ? ` [${f.evidence}]` : ''}`,
      );
  }
  if (result.flags.length) row('Flagged', result.flags.join('; '));
  row('Calls', String(result.calls));
  row('Cost', `$${result.costUsd.toFixed(4)}${provider === 'claude-cli' ? ' (not reported by the CLI provider)' : ''}`);
  if (tsxPath) row('Generated', show(tsxPath));
  row('Run log', show(join(runsDir, result.runId, 'log.jsonl')));

  if (result.outcome !== 'pass') {
    print('');
    print(`Error: ${result.error ?? 'unknown error'}`);
    if (provider === 'fake') {
      print('');
      print('The fake provider only replays recorded briefs. Either try the demo brief:');
      print(`  npm run generate -- "${DEMO_BRIEF}"`);
      print('or run against a real model:');
      print('  MODEL_PROVIDER=cli npm run generate -- "<brief>"');
    }
    return { exitCode: 1, result };
  }

  return { exitCode: 0, result, ...(tsxPath !== undefined ? { tsxPath } : {}) };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const brief = process.argv.slice(2).join(' ').trim();
  if (!brief) {
    console.error('Usage: npm run generate -- "<brief>"');
    console.error(`Example: npm run generate -- "${DEMO_BRIEF}"`);
    process.exit(2);
  }
  runGenerate(brief, { repoRoot: join(dirname(thisFile), '..') })
    .then(({ exitCode }) => process.exit(exitCode))
    .catch((err: unknown) => {
      console.error(`generate: unexpected error: ${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
      process.exit(1);
    });
}
