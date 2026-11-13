/**
 * FR-1 visual direction (phase 1.6): square corners, Saira fonts, brand colour ramps.
 * These pin the agreed design decisions so a later token edit cannot silently undo them.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSemanticTokens } from '../../../scripts/build-tokens.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

function primitives(): Map<string, string> {
  const raw = JSON.parse(readFileSync(join(root, 'tokens', 'primitives.json'), 'utf8')) as {
    tokens: Array<{ name: string; value: string }>;
  };
  return new Map(raw.tokens.map((t) => [t.name, t.value]));
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const RAMPS = ['blue', 'light-blue', 'lime', 'neutral', 'red', 'amber'];

describe('FR-1 visual direction: colour ramps', () => {
  it.each(RAMPS)('FR-1: %s ramp has every step from 50 to 900 as a hex value', (ramp) => {
    const prim = primitives();
    for (const step of STEPS) {
      const value = prim.get(`color-${ramp}-${step}`);
      expect(value, `color-${ramp}-${step} missing`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each([
    ['color-blue-600', '#285bb0'],
    ['color-blue-900', '#0a2057'],
    ['color-light-blue-400', '#4da6dc'],
    ['color-lime-500', '#84cc16'],
    ['color-lime-700', '#4d7c0f'],
    ['color-neutral-500', '#7a808a'],
    ['color-neutral-600', '#666666'],
    ['color-neutral-25', '#fafbfc'],
    ['color-white', '#ffffff'],
  ])('FR-1: anchor %s is exactly %s', (name, hex) => {
    expect(primitives().get(name)).toBe(hex);
  });

  it('FR-1: old gray, green and yellow ramps are gone', () => {
    const names = [...primitives().keys()];
    expect(names.filter((n) => /^color-(gray|green|yellow)-/.test(n))).toEqual([]);
  });
});

describe('FR-1 visual direction: semantic mapping', () => {
  const sem = (): Map<string, string> => resolveSemanticTokens(root);
  const prim = primitives();
  it.each([
    ['color-background-page', 'color-white'],
    ['color-background-raised', 'color-neutral-25'],
    ['color-background-sunken', 'color-neutral-50'],
    ['color-interactive-default', 'color-blue-600'],
    ['color-interactive-hover', 'color-blue-700'],
    ['color-interactive-active', 'color-blue-800'],
    ['color-interactive-focus-ring', 'color-blue-600'],
    ['color-background-focus-tint', 'color-light-blue-50'],
    ['color-text-secondary', 'color-neutral-600'],
    ['color-border-default', 'color-neutral-200'],
    ['color-border-input', 'color-neutral-500'],
    ['color-border-input-hover', 'color-neutral-600'],
    ['color-interactive-disabled', 'color-neutral-100'],
    ['color-text-disabled', 'color-neutral-500'],
    ['color-text-success', 'color-lime-700'],
    ['color-status-success-fill', 'color-lime-500'],
    ['color-text-on-success', 'color-blue-900'],
    ['color-text-info', 'color-light-blue-700'],
  ])('FR-1: %s resolves to %s', (semantic, primitive) => {
    expect(sem().get(semantic)).toBe(prim.get(primitive));
  });

  it('FR-1: text primary is neutral 900 or blue 900', () => {
    expect([prim.get('color-neutral-900'), prim.get('color-blue-900')]).toContain(sem().get('color-text-primary'));
  });

  it('FR-1: focus ring is 2px with a 2px offset', () => {
    expect(sem().get('border-width-focus')).toBe('2px');
    expect(sem().get('focus-ring-offset')).toBe('2px');
  });
});

describe('FR-1 visual direction: square corners and flat elevation', () => {
  it('FR-1: every radius primitive is 0', () => {
    for (const [name, value] of primitives()) {
      if (name.startsWith('radius-')) expect(parseFloat(value), name).toBe(0);
    }
  });

  it('FR-1: every semantic radius token resolves to 0', () => {
    const radii = [...resolveSemanticTokens(root)].filter(([n]) => n.startsWith('radius-'));
    expect(radii.length).toBeGreaterThan(0);
    for (const [name, value] of radii) expect(parseFloat(value), name).toBe(0);
  });

  it('FR-1: every semantic shadow token resolves to none', () => {
    for (const [name, value] of resolveSemanticTokens(root)) {
      if (name.startsWith('shadow-')) expect(value, name).toBe('none');
    }
  });
});

describe('FR-1 visual direction: fonts', () => {
  it('FR-1: body font is Saira and display font is Saira Semi Condensed', () => {
    const sem = resolveSemanticTokens(root);
    expect(sem.get('font-family-body')).toMatch(/^'Saira',/);
    expect(sem.get('font-family-display')).toMatch(/^'Saira Semi Condensed',/);
  });

  it('FR-1: weights 400, 500, 600 and 700 exist as primitives', () => {
    const values = [...primitives()].filter(([n]) => n.startsWith('font-weight-')).map(([, v]) => v);
    expect(values).toEqual(expect.arrayContaining(['400', '500', '600', '700']));
  });

  it('FR-1: fonts are bundled locally for every weight, not loaded from a CDN', () => {
    const css = readFileSync(join(root, 'components', 'shared', 'fonts.css'), 'utf8');
    for (const pkg of ['saira', 'saira-semi-condensed']) {
      for (const w of [400, 500, 600, 700]) expect(css).toContain(`@fontsource/${pkg}/${w}.css`);
    }
    expect(css).not.toMatch(/https?:\/\//);
  });
});
