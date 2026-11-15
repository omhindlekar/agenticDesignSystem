import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGenerate, DEMO_BRIEF } from '../generate.js';
import { replayRun } from '../replay.js';
import { closeRenderer } from '../../checks/render/render.js';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
afterAll(closeRenderer);

describe('FR-19, NFR-5: a past run replays from its log and gives the same results', () => {
  it('FR-19: the demo run replays identically, step by step, QA included', async () => {
    const runsDir = mkdtempSync(join(tmpdir(), 'ads-replay-'));
    const { result } = await runGenerate(DEMO_BRIEF, {
      repoRoot,
      runsDir,
      outDir: join(runsDir, 'out'),
      print: () => {},
      baselineId: 'sign-in',
    });
    expect(result.outcome).toBe('pass');
    const r = await replayRun(result.runId, { repoRoot, runsDir });
    expect(r.differences).toEqual([]);
    expect(r.identical).toBe(true);
    expect(r.steps).toBe(4);
  }, 120_000);

  it('FR-19: a changed log is reported as a difference', async () => {
    const runsDir = mkdtempSync(join(tmpdir(), 'ads-replay-'));
    const { result } = await runGenerate(DEMO_BRIEF, {
      repoRoot,
      runsDir,
      outDir: join(runsDir, 'out'),
      print: () => {},
    });
    const logPath = join(runsDir, result.runId, 'log.jsonl');
    const lines = readFileSync(logPath, 'utf8').trim().split('\n');
    const builder = JSON.parse(lines[2]!) as { outputHash: string };
    builder.outputHash = `sha256:${'0'.repeat(64)}`;
    lines[2] = JSON.stringify(builder);
    writeFileSync(logPath, lines.join('\n') + '\n');
    const r = await replayRun(result.runId, { repoRoot, runsDir });
    expect(r.identical).toBe(false);
    expect(r.differences[0]).toMatch(/^step 3: was "builder pass/);
  }, 120_000);

  it('FR-19: a run record stores the brief and the baseline id, and no secrets', async () => {
    const runsDir = mkdtempSync(join(tmpdir(), 'ads-replay-'));
    const { result } = await runGenerate(DEMO_BRIEF, {
      repoRoot,
      runsDir,
      outDir: join(runsDir, 'out'),
      print: () => {},
      baselineId: 'sign-in',
    });
    const record = JSON.parse(readFileSync(join(runsDir, result.runId, 'run.json'), 'utf8')) as Record<string, unknown>;
    expect(record['brief']).toBe(DEMO_BRIEF);
    expect(record['baselineId']).toBe('sign-in');
    expect(JSON.stringify(record)).not.toMatch(/api[_-]?key|token":|secret/i);
  }, 120_000);
});
