/**
 * npm run replay -- <runId> [runsDir]
 *
 * Replays a past run from its record and log (FR-19, NFR-5): the same brief goes through the
 * same pipeline with the replay provider, which answers only from recorded responses and
 * never calls a model. Every logged step must give the same input hash, output hash and
 * outcome. Exit 0 when the replay is identical, 1 when it differs, 2 on a usage error.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RunRecordSchema } from '../packages/schemas/src/run-record.js';
import { RunLogWriter } from '../packages/run-log/src/index.js';
import { runGenerate } from './generate.js';
import type { RunLogEntry } from '../packages/schemas/src/run-log-entry.js';

export interface ReplayResult {
  runId: string;
  replayRunId: string;
  identical: boolean;
  steps: number;
  differences: string[];
}

const signature = (e: RunLogEntry) =>
  `${e.agent} ${e.outcome} in=${e.inputHash.slice(7, 19)} out=${e.outputHash.slice(7, 19)}`;

export async function replayRun(runId: string, opts: { repoRoot: string; runsDir?: string }): Promise<ReplayResult> {
  const runsDir = opts.runsDir ?? join(opts.repoRoot, 'runs');
  const recordPath = join(runsDir, runId, 'run.json');
  if (!existsSync(recordPath))
    throw new Error(`No run record at ${recordPath}; only runs made since phase 2b can be replayed.`);
  const record = RunRecordSchema.parse(JSON.parse(readFileSync(recordPath, 'utf8')));
  const original = await new RunLogWriter(runsDir).read(runId);

  const before = process.env['MODEL_PROVIDER'];
  process.env['MODEL_PROVIDER'] = 'replay';
  const replayDir = join(runsDir, 'replays');
  let replayRunId: string;
  try {
    const { result } = await runGenerate(record.brief, {
      repoRoot: opts.repoRoot,
      runsDir: replayDir,
      outDir: join(opts.repoRoot, 'generated', 'replays'),
      print: () => {},
      ...(record.baselineId ? { baselineId: record.baselineId } : {}),
    });
    replayRunId = result.runId;
  } finally {
    if (before === undefined) delete process.env['MODEL_PROVIDER'];
    else process.env['MODEL_PROVIDER'] = before;
  }
  const replayed = await new RunLogWriter(replayDir).read(replayRunId);

  const a = original.map(signature);
  const b = replayed.map(signature);
  const differences: string[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    if (a[i] !== b[i]) differences.push(`step ${i + 1}: was "${a[i] ?? '(none)'}", replay "${b[i] ?? '(none)'}"`);
  return { runId, replayRunId, identical: differences.length === 0, steps: a.length, differences };
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(thisFile).ino) {
  const [runId, runsDir] = process.argv.slice(2);
  if (!runId) {
    console.error('Usage: npm run replay -- <runId> [runsDir]');
    process.exit(2);
  }
  replayRun(runId, { repoRoot: join(dirname(thisFile), '..'), ...(runsDir ? { runsDir } : {}) })
    .then((r) => {
      console.log(
        `Replayed ${r.runId} as ${r.replayRunId}: ${r.steps} step(s), ${r.identical ? 'identical' : 'DIFFERENT'}.`,
      );
      for (const d of r.differences) console.log(`  ${d}`);
      process.exit(r.identical ? 0 : 1);
    })
    .catch((err: unknown) => {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(2);
    });
}
