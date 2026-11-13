/**
 * FR-11 / NFR-9: token-level contrast check (WCAG 2.2 AA, SC 1.4.3 and 1.4.11).
 * Runs as part of token lint so a token change cannot regress contrast.
 */
import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSemanticTokens } from '../../../scripts/build-tokens.js';
import { contrastRatio, buildContrastPairs, checkContrast } from '../contrast.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-11 contrast: ratio maths', () => {
  it('FR-11: black on white is 21:1 and white on white is 1:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });
});

describe('FR-11 contrast: pair coverage', () => {
  const tokens = resolveSemanticTokens(root);
  const pairs = buildContrastPairs(tokens);
  const has = (fg: string, bg: string): boolean => pairs.some((p) => p.fg === fg && p.bg === bg);

  it('FR-11: every text token is checked against every surface at 4.5:1', () => {
    const texts = [...tokens.keys()].filter(
      (n) => n.startsWith('color-text-') && !['color-text-disabled', 'color-text-inverse', 'color-text-on-success'].includes(n),
    );
    for (const t of texts) {
      for (const s of ['color-background-page', 'color-background-surface', 'color-background-raised', 'color-background-sunken']) {
        expect(has(t, s), `${t} on ${s}`).toBe(true);
      }
    }
  });

  it('FR-11: control borders and the focus ring are checked at 3:1', () => {
    for (const b of ['color-border-input', 'color-border-input-hover', 'color-border-interactive', 'color-border-danger', 'color-interactive-focus-ring']) {
      const p = pairs.find((x) => x.fg === b && x.bg === 'color-background-page');
      expect(p?.min, b).toBe(3);
    }
  });

  it('FR-11: inverse text on filled buttons and blue 900 on lime fills are checked', () => {
    expect(has('color-text-inverse', 'color-interactive-default')).toBe(true);
    expect(has('color-text-inverse', 'color-interactive-active')).toBe(true);
    expect(has('color-text-on-success', 'color-status-success-fill')).toBe(true);
  });
});

describe('FR-11 contrast: current tokens', () => {
  it('FR-11: all semantic pairs meet WCAG 2.2 AA', () => {
    const violations = checkContrast(resolveSemanticTokens(root));
    expect(violations.map((v) => `${v.fg} on ${v.bg}: ${v.ratio.toFixed(2)} < ${v.min}`)).toEqual([]);
  });
});

describe('FR-11 contrast: regressions are caught', () => {
  it('FR-11: lime 500 as success text on white fails and cites DS-A-006', () => {
    const tokens = new Map(resolveSemanticTokens(root));
    tokens.set('color-text-success', '#84CC16');
    const v = checkContrast(tokens).filter((x) => x.fg === 'color-text-success');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]?.ruleRef).toBe('DS-A-006');
  });

  it('FR-11: a light blue 400 focus ring fails 3:1 and cites DS-A-001', () => {
    const tokens = new Map(resolveSemanticTokens(root));
    tokens.set('color-interactive-focus-ring', '#4DA6DC');
    const v = checkContrast(tokens).filter((x) => x.fg === 'color-interactive-focus-ring');
    expect(v.length).toBeGreaterThan(0);
    expect(v[0]?.ruleRef).toBe('DS-A-001');
  });

  it('FR-11: a neutral 300 input border fails 3:1', () => {
    const tokens = new Map(resolveSemanticTokens(root));
    tokens.set('color-border-input', '#BDC1C7');
    expect(checkContrast(tokens).some((x) => x.fg === 'color-border-input')).toBe(true);
  });

  it('FR-11: a non-hex colour value is reported, not skipped', () => {
    const tokens = new Map(resolveSemanticTokens(root));
    tokens.set('color-text-primary', 'rebeccapurple');
    expect(checkContrast(tokens).some((x) => x.fg === 'color-text-primary')).toBe(true);
  });
});
