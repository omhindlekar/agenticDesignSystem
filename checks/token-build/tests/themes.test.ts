/**
 * FR-1, FR-2, FR-11: dark and high-contrast themes are semantic overrides that
 * compile into the same tokens.css, and every theme passes its contrast bar.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokensCss, resolveSemanticTokens, resolveTheme, loadThemes } from '../../../scripts/build-tokens.js';
import { checkContrast, AA, HIGH_CONTRAST } from '../../token-lint/contrast.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const prim = new Set(
  (JSON.parse(readFileSync(join(root, 'tokens/primitives.json'), 'utf8')) as { tokens: Array<{ name: string }> }).tokens.map((t) => t.name),
);
const semantic = resolveSemanticTokens(root);

describe('FR-1 themes: override files', () => {
  it('FR-1: dark and high-contrast theme files exist', () => {
    const files = readdirSync(join(root, 'tokens/themes'));
    expect(files).toEqual(expect.arrayContaining(['dark.json', 'high-contrast.json']));
  });

  it.each(['dark', 'high-contrast'])('FR-1: every %s override names an existing semantic token and a known primitive', (name) => {
    const theme = loadThemes(root).find((t) => t.value === name);
    expect(theme?.tokens.length).toBeGreaterThan(0);
    for (const t of theme?.tokens ?? []) {
      expect(semantic.has(t.name), `${name}: unknown semantic ${t.name}`).toBe(true);
      expect(prim.has(t.reference), `${name}: unknown primitive ${t.reference}`).toBe(true);
    }
  });

  it('FR-1: dark surfaces step lighter as they rise (page, then surface and raised)', () => {
    const dark = resolveTheme(root, 'dark');
    const lum = (hex: string): number => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
    expect(lum(dark.get('color-background-raised') ?? '')).toBeGreaterThan(lum(dark.get('color-background-page') ?? ''));
  });
});

describe('FR-2 themes: compiled CSS', () => {
  const css = buildTokensCss(root);

  it('FR-2: emits light as :root, dark and high contrast as data-theme blocks, and dark for prefers-color-scheme', () => {
    expect(css).toMatch(/:root \{[^}]*color-scheme: light;/);
    expect(css).toMatch(/:root\[data-theme="dark"\] \{[^}]*color-scheme: dark;/);
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme\]\) \{[^}]*color-scheme: dark;/);
    expect(css).toMatch(/:root\[data-theme="high-contrast"\] \{/);
  });

  it('FR-2: theme blocks contain only the overridden tokens', () => {
    const dark = loadThemes(root).find((t) => t.value === 'dark');
    const block = /:root\[data-theme="dark"\] \{([^}]*)\}/.exec(css)?.[1] ?? '';
    const names = [...block.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]);
    expect(names.sort()).toEqual((dark?.tokens.map((t) => t.name) ?? []).sort());
  });
});

describe('FR-11 themes: contrast', () => {
  it('FR-11: the light theme passes WCAG 2.2 AA', () => {
    expect(checkContrast(resolveTheme(root, 'light'), AA)).toEqual([]);
  });

  it('FR-11: the dark theme passes WCAG 2.2 AA', () => {
    const v = checkContrast(resolveTheme(root, 'dark'), AA);
    expect(v.map((x) => `${x.fg} on ${x.bg}${x.layer ? ` + ${x.layer.opacity}` : ''}: ${x.ratio.toFixed(2)} < ${x.min}`)).toEqual([]);
  });

  it('FR-11: the high-contrast theme reaches 7:1 for text and 4.5:1 for boundaries', () => {
    expect(HIGH_CONTRAST).toEqual({ text: 7, ui: 4.5 });
    const v = checkContrast(resolveTheme(root, 'high-contrast'), HIGH_CONTRAST);
    expect(v.map((x) => `${x.fg} on ${x.bg}${x.layer ? ` + ${x.layer.opacity}` : ''}: ${x.ratio.toFixed(2)} < ${x.min}`)).toEqual([]);
  });
});
