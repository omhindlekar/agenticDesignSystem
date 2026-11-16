import { describe, it, expect, afterAll } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGolden, loadGoldenSet, GATE } from '../golden.js';
import { DEMO_BRIEF } from '../generate.js';
import { closeRenderer } from '../../checks/render/render.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
afterAll(closeRenderer);

describe('FR-6, FR-7: golden set runner', () => {
  it('FR-7: the golden set loads 20 schema-valid briefs with one adversarial brief', () => {
    const set = loadGoldenSet(root);
    expect(set).toHaveLength(20);
    expect(set.filter((b) => b.adversarial).map((b) => b.id)).toEqual(['injection-attempt']);
  });

  it('FR-6, FR-7, FR-9: a recorded brief runs the whole pipeline, QA included, and is measured', async () => {
    // The demo brief has hand-written fixtures, so this tests the runner, not the model.
    const demo = { ...loadGoldenSet(root).find((b) => b.id === 'sign-in')!, id: 'demo', brief: DEMO_BRIEF };
    const report = await runGolden(root, { briefs: [demo], print: () => {} });
    expect(report.briefs).toBe(1);
    const r = report.results[0]!;
    expect(r).toMatchObject({
      id: 'demo',
      outcome: 'pass',
      firstPass: true,
      qa: 'pass',
      missingComponents: [],
      forbiddenUsed: [],
      passed: true,
    });
    expect(r.contextShare).toBeLessThan(0.3);
    expect(report.metrics.firstPassRate).toBe(1);
    expect(report.gate.passed).toBe(true);
  }, 120_000);

  it('FR-7: filtering to unknown ids runs nothing, and the gate thresholds are the PRD targets', async () => {
    const report = await runGolden(root, { only: ['__none__'], print: () => {} });
    expect(report.briefs).toBe(0);
    expect(GATE.firstPassRate).toBe(0.8);
  });
});
