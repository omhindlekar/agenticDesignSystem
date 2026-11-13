/**
 * FR-1, FR-2: breakpoints, layout grid and density, plus the JSON token export.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokensCss, buildTokensJson, resolveSemanticTokens, loadThemes } from '../../../scripts/build-tokens.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const sem = resolveSemanticTokens(root);
const rem = (v: string | undefined): number => parseFloat(v ?? '') * (v?.endsWith('rem') ? 16 : 1);

describe('FR-1 layout tokens', () => {
  it.each([
    ['breakpoint-sm', '600px'],
    ['breakpoint-md', '900px'],
    ['breakpoint-lg', '1200px'],
    ['breakpoint-xl', '1536px'],
    ['layout-columns-sm', '4'],
    ['layout-columns-md', '8'],
    ['layout-columns-lg', '12'],
    ['layout-gutter-sm', '16px'],
    ['layout-gutter-lg', '24px'],
    ['layout-margin-sm', '16px'],
    ['layout-margin-md', '24px'],
    ['layout-margin-lg', '32px'],
  ])('FR-1: %s is %s', (name, value) => {
    expect(sem.get(name)).toBe(value);
  });
});

describe('FR-1 density', () => {
  const compact = loadThemes(root).find((t) => t.attribute === 'data-density' && t.value === 'compact');

  it('FR-1: a compact density mode exists and steps every control height down', () => {
    expect(compact).toBeDefined();
    const css = buildTokensCss(root);
    const blockCss = /\[data-density="compact"\] \{([^}]*)\}/.exec(css)?.[1] ?? '';
    const val = (n: string): number => rem(new RegExp(`--${n}: ([^;]+);`).exec(blockCss)?.[1]);
    expect(val('size-control-sm')).toBe(28);
    expect(val('size-control-md')).toBe(32);
    expect(val('size-control-lg')).toBe(40);
  });

  it('FR-1: compact can scope any subtree, not only the page', () => {
    expect(buildTokensCss(root)).toMatch(/\n\[data-density="compact"\] \{/);
  });

  it('NFR-9: every compact target stays at least 24px (WCAG 2.2 SC 2.5.8)', () => {
    const css = buildTokensCss(root);
    const blockCss = /\[data-density="compact"\] \{([^}]*)\}/.exec(css)?.[1] ?? '';
    for (const m of blockCss.matchAll(/--(size-control-[a-z]+|size-hit-area): ([^;]+);/g)) {
      expect(rem(m[2]), m[1]).toBeGreaterThanOrEqual(24);
    }
  });
});

describe('FR-2 JSON token export', () => {
  it('FR-2: styles/tokens.json matches the build (run npm run tokens:build)', () => {
    const committed = readFileSync(join(root, 'styles/tokens.json'), 'utf8');
    expect(committed).toBe(JSON.stringify(buildTokensJson(root), null, 2) + '\n');
  });

  it('FR-2: the export has the base tokens and each theme and density override', () => {
    const json = buildTokensJson(root);
    expect(json.base['breakpoint-md']).toBe('900px');
    expect(Object.keys(json.themes).sort()).toEqual(['dark', 'high-contrast']);
    expect(Object.keys(json.densities).sort()).toEqual(['comfortable', 'compact']);
  });
});

describe('FR-1 density: comfortable reset', () => {
  it('FR-1: comfortable resets exactly the tokens compact changes, to their base values', () => {
    const modes = loadThemes(root).filter((t) => t.attribute === 'data-density');
    const compact = modes.find((t) => t.value === 'compact');
    const comfortable = modes.find((t) => t.value === 'comfortable');
    const base = JSON.parse(readFileSync(join(root, 'tokens/semantic.json'), 'utf8')) as { tokens: Array<{ name: string; reference: string }> };
    const ref = new Map(base.tokens.map((t) => [t.name, t.reference]));
    expect(comfortable?.tokens.map((t) => t.name).sort()).toEqual(compact?.tokens.map((t) => t.name).sort());
    for (const t of comfortable?.tokens ?? []) expect(t.reference, t.name).toBe(ref.get(t.name));
  });
});
