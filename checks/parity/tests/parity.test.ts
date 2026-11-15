/**
 * Industry-baseline scorecard (benchmark/industry-baseline.json): a capability is
 * baseline when at least 3 of Material 3, Carbon, Atlassian, Polaris and Fluent 2 ship it.
 */
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadScorecard, parityReport, ScorecardSchema } from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('Parity scorecard: data', () => {
  const card = loadScorecard(root);

  it('validates against the scorecard schema', () => {
    expect(ScorecardSchema.safeParse(card).success).toBe(true);
  });

  it('records a source URL for each of the five systems', () => {
    expect(Object.keys(card.sources).sort()).toEqual(['atlassian', 'carbon', 'fluent2', 'material3', 'polaris']);
  });

  it('capability ids are unique', () => {
    const ids = card.capabilities.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('baseline is true exactly when at least 3 of the 5 ship it', () => {
    for (const c of card.capabilities) {
      const count = Object.values(c.shippedBy).filter(Boolean).length;
      expect(c.baseline, c.id).toBe(count >= 3);
    }
  });

  it('every done capability has evidence, and every evidence path exists', () => {
    for (const c of card.capabilities) {
      if (c.status === 'done') expect(c.evidence.length, c.id).toBeGreaterThan(0);
      for (const p of c.evidence) expect(existsSync(join(root, p)), `${c.id}: ${p}`).toBe(true);
    }
  });

  it('every partial capability explains what is missing', () => {
    for (const c of card.capabilities.filter((x) => x.status === 'partial')) {
      expect(c.note, c.id).toBeTruthy();
    }
  });

  it('every baseline capability is scheduled in a parity phase, not "later"', () => {
    for (const c of card.capabilities.filter((x) => x.baseline)) {
      expect(c.phase, c.id).toMatch(/^1\.\d+$/);
    }
  });
});

describe('Parity scorecard: report', () => {
  it('reports parity per area as done over baseline, ignoring non-baseline capabilities', () => {
    const report = parityReport({
      description: 'x',
      verifiedOn: '2026-01-01',
      sources: { material3: 'a', carbon: 'b', atlassian: 'c', polaris: 'd', fluent2: 'e' },
      capabilities: [
        { id: 'a', area: 'inputs', name: 'A', shippedBy: { material3: true, carbon: true, atlassian: true, polaris: false, fluent2: false }, baseline: true, verified: true, status: 'done', phase: '1.10', evidence: [] },
        { id: 'b', area: 'inputs', name: 'B', shippedBy: { material3: true, carbon: true, atlassian: true, polaris: false, fluent2: false }, baseline: true, verified: true, status: 'partial', phase: '1.10', evidence: [], note: 'n' },
        { id: 'c', area: 'inputs', name: 'C', shippedBy: { material3: true, carbon: false, atlassian: false, polaris: false, fluent2: false }, baseline: false, verified: true, status: 'missing', phase: 'later', evidence: [] },
      ],
    });
    expect(report.areas.inputs).toEqual({ baseline: 2, done: 1, partial: 1, missing: 0, percent: 50 });
    expect(report.overall.percent).toBe(50);
    expect(report.gaps.map((g) => g.id)).toEqual(['b']);
  });
});

describe('Parity scorecard: phase gates', () => {
  // Each finished parity phase adds its area here, so it cannot slip back below 100%.
  const GATED_AREAS = ['foundations', 'inputs', 'feedback', 'overlays', 'navigation', 'data-display', 'actions', 'quality', 'docs-tooling'];

  it.each(GATED_AREAS)('%s is at 100% of the industry baseline', (area) => {
    const report = parityReport(loadScorecard(root));
    const gaps = report.gaps.filter((g) => g.area === area).map((g) => `${g.id} (${g.status})`);
    expect(gaps).toEqual([]);
    expect(report.areas[area]?.percent).toBe(100);
  });
});
