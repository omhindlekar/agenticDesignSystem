import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintFile, lintDirectory, type LintViolation } from '../index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');

describe('FR-1 token-lint: hardcoded value detection', () => {
  it('FR-1: flags hex colour in a TSX file', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    const hexViolations = violations.filter((v) => v.pattern === 'hex-color');
    expect(hexViolations.length).toBeGreaterThan(0);
  });

  it('FR-1: flags rgb/rgba colour literals', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    const rgbViolations = violations.filter((v) => v.pattern === 'rgb-color');
    expect(rgbViolations.length).toBeGreaterThan(0);
  });

  it('FR-1: flags hardcoded px spacing values', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    const spacingViolations = violations.filter((v) => v.pattern === 'hardcoded-spacing');
    expect(spacingViolations.length).toBeGreaterThan(0);
  });

  it('FR-1: flags hardcoded px border-radius values', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    const radiusViolations = violations.filter((v) => v.pattern === 'hardcoded-radius');
    expect(radiusViolations.length).toBeGreaterThan(0);
  });

  it('FR-1: returns zero violations for a file using semantic tokens', async () => {
    const violations = await lintFile(join(fixturesDir, 'token-good.tsx'));
    expect(violations).toHaveLength(0);
  });

  it('FR-1: each violation includes file, line, column, pattern and ruleId', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    for (const v of violations) {
      expect(v.file).toBeTruthy();
      expect(v.line).toBeGreaterThan(0);
      expect(v.column).toBeGreaterThan(0);
      expect(v.pattern).toBeTruthy();
      expect(v.ruleId).toBe('FR-1');
    }
  });

  it('FR-1: lintDirectory scans all matching files and aggregates violations', async () => {
    const violations = await lintDirectory(fixturesDir, ['.tsx']);
    const badFileViolations = violations.filter((v) => v.file.includes('hardcoded-bad'));
    const goodFileViolations = violations.filter((v) => v.file.includes('token-good'));
    expect(badFileViolations.length).toBeGreaterThan(0);
    expect(goodFileViolations).toHaveLength(0);
  });
});

describe('FR-1 token-lint: violation shape', () => {
  it('FR-1: violation objects satisfy the LintViolation type', async () => {
    const violations = await lintFile(join(fixturesDir, 'hardcoded-bad.tsx'));
    const v = violations[0] as LintViolation;
    expect(typeof v.file).toBe('string');
    expect(typeof v.line).toBe('number');
    expect(typeof v.column).toBe('number');
    expect(typeof v.pattern).toBe('string');
    expect(typeof v.ruleId).toBe('string');
    expect(typeof v.match).toBe('string');
  });
});
