import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintFile, lintTokenReferences, loadSemanticTokenNames } from '../index.js';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, '../fixtures');
const repoRoot = join(__dirname, '../../..');

describe('FR-1 token-lint: typography, border and stacking values', () => {
  const patterns = [
    'hardcoded-font-size',
    'hardcoded-font-weight',
    'hardcoded-font-family',
    'hardcoded-line-height',
    'hardcoded-border-width',
    'hardcoded-outline',
    'hardcoded-z-index',
  ];

  for (const pattern of patterns) {
    it(`FR-1: flags ${pattern}`, async () => {
      const violations = await lintFile(join(fixturesDir, 'hardcoded-typography.css'));
      expect(violations.filter((v) => v.pattern === pattern).length).toBeGreaterThan(0);
    });
  }

  it('FR-1: CSS using only var(--semantic) values has zero violations', async () => {
    expect(await lintFile(join(fixturesDir, 'token-good.css'))).toHaveLength(0);
  });
});

describe('FR-1 token-lint: components reference semantic tokens only', () => {
  const semantic = loadSemanticTokenNames(repoRoot);

  it('FR-1: loads every semantic token name', () => {
    expect(semantic.has('color-interactive-default')).toBe(true);
    expect(semantic.has('color-blue-600')).toBe(false);
  });

  it('FR-1: flags a primitive token reference', () => {
    const content = readFileSync(join(fixturesDir, 'primitive-ref.css'), 'utf8');
    const v = lintTokenReferences(content, 'primitive-ref.css', semantic);
    expect(v.map((x) => x.match)).toEqual(['var(--color-blue-600)', 'var(--not-a-token)']);
    expect(v.every((x) => x.pattern === 'non-semantic-token' && x.ruleId === 'FR-1')).toBe(true);
  });

  it('FR-1: semantic references pass', () => {
    const content = readFileSync(join(fixturesDir, 'token-good.css'), 'utf8');
    expect(lintTokenReferences(content, 'token-good.css', semantic)).toHaveLength(0);
  });
});

describe('FR-1 token-lint: directory scan with semantic names', () => {
  it('FR-1: lintDirectory reports non-semantic references when names are supplied', async () => {
    const { lintDirectory } = await import('../index.js');
    const v = await lintDirectory(fixturesDir, ['.css'], loadSemanticTokenNames(repoRoot));
    expect(v.some((x) => x.pattern === 'non-semantic-token' && x.file.includes('primitive-ref'))).toBe(true);
    expect(v.filter((x) => x.file.includes('token-good'))).toHaveLength(0);
  });
});
