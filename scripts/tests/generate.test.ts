import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGenerate, taskIdForBrief, DEMO_BRIEF } from '../generate.js';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import { RunLogWriter } from '../../packages/run-log/src/index.js';
import { validateBuilderOutput, typeCheckBuilderOutput } from '../../agents/builder/tools.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../..');

// These tests always use the fake provider, whatever the developer's shell says.
const savedProvider = process.env['MODEL_PROVIDER'];
let work: string;
beforeAll(() => {
  process.env['MODEL_PROVIDER'] = 'fake';
  work = mkdtempSync(join(tmpdir(), 'ads-generate-'));
});
afterAll(() => {
  if (savedProvider === undefined) delete process.env['MODEL_PROVIDER'];
  else process.env['MODEL_PROVIDER'] = savedProvider;
  rmSync(work, { recursive: true, force: true });
});

function dirs(name: string) {
  return { outDir: join(work, name, 'generated'), runsDir: join(work, name, 'runs') };
}

describe('npm run generate (fake provider)', () => {
  it('FR-6/FR-7: demo brief runs end to end and passes', async () => {
    const lines: string[] = [];
    const res = await runGenerate(DEMO_BRIEF, { repoRoot, ...dirs('demo'), print: (l) => lines.push(l) });

    expect(res.exitCode).toBe(0);
    expect(res.result.outcome).toBe('pass');

    // FR-6: the spec validates and uses only registered components
    const spec = ScreenSpecSchema.parse(res.result.spec);
    const ids = JSON.stringify(spec.tree).match(/"component":"([^"]+)"/g) ?? [];
    expect(ids.length).toBeGreaterThan(1);

    // FR-7: the TSX is written, passes token lint and type-checks against the real components
    expect(res.tsxPath).toBeDefined();
    const tsx = readFileSync(res.tsxPath ?? '', 'utf8');
    expect(tsx).toContain("from '@ads/components'");
    expect(validateBuilderOutput(tsx).valid).toBe(true);
    expect(typeCheckBuilderOutput(tsx, repoRoot).valid).toBe(true);

    // Output: spec, run id, retries and call count
    const out = lines.join('\n');
    expect(out).toContain('"tree"');
    expect(out).toContain(`Run id:     ${res.result.runId}`);
    expect(out).toMatch(/Retries:\s+composer 0, builder 0/);
    expect(out).toMatch(/Calls:\s+2/);
    expect(out).toMatch(/Provider:\s+fake/);
  });

  it('FR-19: the run log is written with an entry per agent', async () => {
    const d = dirs('log');
    const res = await runGenerate(DEMO_BRIEF, { repoRoot, ...d, print: () => {} });
    const entries = await new RunLogWriter(d.runsDir).read(res.result.runId);
    expect(entries.map((e) => e.agent)).toEqual(['context', 'composer', 'builder']);
    expect(entries.every((e) => e.outcome === 'pass')).toBe(true);
  });

  it('FR-8: an unrecorded brief under the fake provider escalates cleanly with a hint, no crash', async () => {
    const lines: string[] = [];
    const d = dirs('unknown');
    const res = await runGenerate('A dashboard nobody recorded a fixture for', {
      repoRoot,
      ...d,
      print: (l) => lines.push(l),
    });
    expect(res.exitCode).toBe(1);
    expect(res.result.outcome).toBe('escalate');
    expect(res.result.attempts.composer).toBe(3);
    expect(res.tsxPath).toBeUndefined();
    expect(existsSync(d.outDir)).toBe(false);
    expect(lines.join('\n')).toMatch(/MODEL_PROVIDER=cli/);
  });

  it('taskId is derived from the brief so fixtures replay deterministically', () => {
    expect(taskIdForBrief(DEMO_BRIEF)).toBe(taskIdForBrief(DEMO_BRIEF));
    expect(taskIdForBrief('a')).not.toBe(taskIdForBrief('b'));
    expect(taskIdForBrief('a')).toMatch(/^gen-[0-9a-f]{12}$/);
  });
});
