/**
 * QA check: visual regression against the approved baseline for this screen (FR-10).
 * Baselines live in evals/baselines/<id>.png and change only through an approved PR
 * (npm run baselines:approve). With no approved baseline the check is skipped, never passed.
 */
import { existsSync, readFileSync } from 'node:fs';
import { guardedFs } from '../../packages/permissions/src/index.js';
import { join } from 'node:path';
import { comparePngs } from './compare.js';
import type { VisualConfig } from './compare.js';
import type { QaCheck } from '../qa-check.js';

export const BASELINE_DIR = join('evals', 'baselines');

export function visualConfig(repoRoot: string): VisualConfig {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'config', 'defaults.json'), 'utf8')) as {
    visual?: Partial<VisualConfig>;
  };
  return { pixelThreshold: raw.visual?.pixelThreshold ?? 0.1, maxDiffRatio: raw.visual?.maxDiffRatio ?? 0.001 };
}

const check: QaCheck = {
  name: 'visual',
  async run({ baselineId, repoRoot, render, evidenceDir }) {
    if (!baselineId)
      return { status: 'skipped', reason: 'This screen has no baseline id (not a golden-set run).', findings: [] };
    const baseline = join(repoRoot, BASELINE_DIR, `${baselineId}.png`);
    if (!existsSync(baseline))
      return {
        status: 'skipped',
        reason: `No approved baseline for "${baselineId}"; approve one with npm run baselines:approve -- ${baselineId}.`,
        findings: [],
      };
    const { screenshot } = await render();
    const actual = await screenshot();
    const cfg = visualConfig(repoRoot);
    const cmp = comparePngs(actual, readFileSync(baseline), cfg);
    const evidence: string[] = [];
    if (evidenceDir && (cmp.ratio > cfg.maxDiffRatio || cmp.sizeChanged)) {
      const fs = guardedFs('qa', repoRoot);
      fs.mkdir(evidenceDir);
      fs.writeFile(join(evidenceDir, `${baselineId}.actual.png`), actual);
      evidence.push(join(evidenceDir, `${baselineId}.actual.png`));
      if (cmp.diffPng) {
        fs.writeFile(join(evidenceDir, `${baselineId}.diff.png`), cmp.diffPng);
        evidence.push(join(evidenceDir, `${baselineId}.diff.png`));
      }
    }
    if (cmp.sizeChanged)
      return {
        status: 'fail',
        reason: 'The screen size changed from the baseline.',
        evidence,
        findings: [
          {
            ruleId: 'DS-V-001',
            message: `The screen is a different size from the approved baseline "${baselineId}".`,
            evidence: evidence[0] ?? baseline,
          },
        ],
      };
    if (cmp.ratio > cfg.maxDiffRatio)
      return {
        status: 'fail',
        reason: `${(cmp.ratio * 100).toFixed(2)}% of pixels changed (limit ${(cfg.maxDiffRatio * 100).toFixed(2)}%).`,
        evidence,
        findings: [
          {
            ruleId: 'DS-V-001',
            message: `${cmp.changedPixels} pixels differ from the approved baseline "${baselineId}"; if the change is intended, approve a new baseline.`,
            evidence: evidence[1] ?? evidence[0] ?? baseline,
          },
        ],
      };
    return {
      status: 'pass',
      reason: `Matches the approved baseline (${cmp.changedPixels} pixels differ).`,
      findings: [],
    };
  },
};
export default check;
