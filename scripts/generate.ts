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
import { loadDataStore, runContextAgent } from '../agents/context/index.js';
import { runComposerWithCost } from '../agents/composer/index.js';
import { runBuilderWithCost } from '../agents/builder/index.js';
import { RunLogWriter } from '../packages/run-log/src/index.js';
import { resolveProviderName } from '../packages/provider/src/index.js';
import type { ProviderConfig } from '../packages/provider/src/index.js';

/** The brief with recorded fixtures, so it runs offline under the fake provider. */
export const DEMO_BRIEF =
  'A sign-in card with email and password inputs, a remember-me checkbox and a primary sign-in button';

const SCHEMA_VERSION = '1.0.0';

/** Deterministic task id: the same brief gives the same prompts, so fixtures replay. */
export function taskIdForBrief(brief: string): string {
  return `gen-${createHash('sha256').update(brief).digest('hex').slice(0, 12)}`;
}

export interface GenerateOptions {
  repoRoot: string;
  outDir?: string;
  runsDir?: string;
  print?: (line: string) => void;
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

  const result = await runOrchestrator(
    { taskId, brief, schemaVersion: SCHEMA_VERSION },
    {
      repoRoot,
      logWriter: new RunLogWriter(runsDir),
      contextRunner: async ({ taskId: id, task }) => runContextAgent({ taskId: id, task }, store),
      composerRunner: async ({ taskId: id, brief: b, contextPack, previousError }) => {
        const { spec, costUsd } = await runComposerWithCost({ taskId: id, brief: b, contextPack }, previousError, repoRoot);
        return { result: spec, costUsd };
      },
      builderRunner: async ({ taskId: id, spec, contextPack, previousError }) => {
        const { output, costUsd } = await runBuilderWithCost({ taskId: id, spec, contextPack }, previousError, repoRoot);
        return { result: output.tsx, costUsd };
      },
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
  row('Retries', `composer ${Math.max(result.attempts.composer - 1, 0)}, builder ${Math.max(result.attempts.builder - 1, 0)}`);
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
      console.error(`generate: unexpected error: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
      process.exit(1);
    });
}
