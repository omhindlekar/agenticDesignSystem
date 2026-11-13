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

describe('FR-1 visual direction: square corners', () => {
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

// ── Phase 1.7 foundations ───────────────────────────────────────────────────

const TYPE_ROLES: Array<[string, string, string, string, string, 'display' | 'body']> = [
  // role, size, weight, line-height, letter-spacing, family
  ['display', '3rem', '600', '1.167', '-0.01em', 'display'],
  ['h1', '2.125rem', '600', '1.235', '0', 'display'],
  ['h2', '1.5rem', '600', '1.334', '0', 'display'],
  ['h3', '1.25rem', '600', '1.4', '0.0075em', 'display'],
  ['h4', '1.125rem', '600', '1.444', '0', 'display'],
  ['subtitle', '1rem', '500', '1.5', '0.009em', 'body'],
  ['body1', '1rem', '400', '1.5', '0.009em', 'body'],
  ['body2', '0.875rem', '400', '1.43', '0.0107em', 'body'],
  ['button', '0.875rem', '500', '1.75', '0.03em', 'display'],
  ['label', '0.875rem', '500', '1.43', '0.007em', 'display'],
  ['caption', '0.75rem', '400', '1.66', '0.033em', 'body'],
  ['overline', '0.75rem', '600', '2.66', '0.083em', 'display'],
];

describe('FR-1 foundations: type scale', () => {
  const sem = resolveSemanticTokens(root);
  it.each(TYPE_ROLES)('FR-1: type-%s is %s / %s / %s / %s', (role, size, weight, lh, ls, family) => {
    expect(sem.get(`type-${role}-size`)).toBe(size);
    expect(sem.get(`type-${role}-weight`)).toBe(weight);
    expect(sem.get(`type-${role}-line-height`)).toBe(lh);
    expect(sem.get(`type-${role}-letter-spacing`)).toBe(ls);
    expect(sem.get(`type-${role}-family`)).toBe(sem.get(`font-family-${family}`));
  });

  it('FR-1: body 1 is 16px, body 2 is 14px and caption is 12px', () => {
    expect(sem.get('type-body1-size')).toBe('1rem');
    expect(sem.get('type-body2-size')).toBe('0.875rem');
    expect(sem.get('type-caption-size')).toBe('0.75rem');
  });
});

describe('FR-1 foundations: spacing and control heights', () => {
  const sem = resolveSemanticTokens(root);
  it('FR-1: every space primitive is on the 4px base', () => {
    for (const [name, value] of primitives()) {
      if (!/^space-\d+$/.test(name)) continue;
      expect(parseFloat(value) % 4, `${name} ${value}`).toBe(0);
    }
  });

  it.each([
    ['size-control-sm', '2rem'],
    ['size-control-md', '2.5rem'],
    ['size-control-lg', '3rem'],
    ['size-hit-area', '2.5rem'],
    ['space-component-padding-field', '12px'],
    ['border-width-control', '2px'],
    ['z-index-state-layer', '-1'],
    ['size-icon-sm', '1rem'],
    ['size-icon-md', '1.25rem'],
    ['size-icon-lg', '1.5rem'],
  ])('FR-1: %s is %s', (name, value) => {
    expect(sem.get(name)).toBe(value);
  });
});

describe('FR-1 foundations: elevation', () => {
  const sem = resolveSemanticTokens(root);
  it('FR-1: elevation 0 is none and 1 to 4 are blue 900 tinted shadows that grow', () => {
    expect(sem.get('elevation-0')).toBe('none');
    let lastBlur = 0;
    for (const level of [1, 2, 3, 4]) {
      const v = sem.get(`elevation-${level}`) ?? '';
      expect(v, `elevation-${level}`).toMatch(/^(?:0 \d+px \d+px rgba\(10,32,87,0?\.\d+\)(?:, )?)+$/);
      const blur = Math.max(...[...v.matchAll(/0 \d+px (\d+)px/g)].map((m) => Number(m[1])));
      expect(blur).toBeGreaterThan(lastBlur);
      lastBlur = blur;
    }
  });

  it.each([
    ['shadow-component-card', 'elevation-1'],
    ['shadow-component-focus', 'elevation-2'],
    ['shadow-component-menu', 'elevation-2'],
    ['shadow-component-modal', 'elevation-4'],
  ])('FR-1: %s resolves to %s', (component, level) => {
    expect(sem.get(component)).toBe(sem.get(level));
  });
});

describe('FR-1 foundations: state layers and motion', () => {
  const sem = resolveSemanticTokens(root);
  const prim = primitives();
  it.each([
    ['opacity-state-hover', '0.08'],
    ['opacity-state-focus', '0.12'],
    ['opacity-state-pressed', '0.16'],
    ['opacity-disabled', '0.38'],
    ['motion-duration-standard', '150ms'],
    ['motion-duration-fast', '150ms'],
    ['motion-duration-overlay', '200ms'],
  ])('FR-1: %s is %s', (name, value) => {
    expect(sem.get(name)).toBe(value);
  });

  it('FR-1: state layer colours come from the brand palette', () => {
    expect(sem.get('color-state-layer')).toBe(prim.get('color-blue-600'));
    expect(sem.get('color-state-layer-danger')).toBe(prim.get('color-red-600'));
  });

  it('FR-1: the standard easing is a cubic-bezier curve', () => {
    expect(sem.get('motion-easing-standard')).toMatch(/^cubic-bezier\(/);
  });
});
