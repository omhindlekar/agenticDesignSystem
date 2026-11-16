import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { approveBaselines, CANDIDATE_DIR, BASELINE_DIR } from '../baselines.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const fakeRepo = () => {
  const dir = mkdtempSync(join(tmpdir(), 'ads-baselines-'));
  cpSync(join(root, 'evals', 'golden-set'), join(dir, 'evals', 'golden-set'), { recursive: true });
  mkdirSync(join(dir, CANDIDATE_DIR), { recursive: true });
  return dir;
};

describe('FR-10: approving visual baselines', () => {
  it('FR-10: approve copies only the named candidates into evals/baselines', () => {
    const dir = fakeRepo();
    writeFileSync(join(dir, CANDIDATE_DIR, 'sign-in.png'), 'png');
    writeFileSync(join(dir, CANDIDATE_DIR, 'settings.png'), 'png');
    expect(approveBaselines(dir, ['sign-in'])).toEqual(['sign-in']);
    expect(readdirSync(join(dir, BASELINE_DIR))).toEqual(['sign-in.png']);
  });
  it('FR-10: approve refuses ids that are not golden briefs, and missing candidates', () => {
    const dir = fakeRepo();
    expect(() => approveBaselines(dir, ['made-up'])).toThrow(/not a golden-set id/);
    expect(() => approveBaselines(dir, ['sign-in'])).toThrow(/baselines:propose first/);
    expect(() => approveBaselines(dir, [])).toThrow(/Name the baselines/);
    expect(existsSync(join(dir, BASELINE_DIR, 'sign-in.png'))).toBe(false);
  });
});
