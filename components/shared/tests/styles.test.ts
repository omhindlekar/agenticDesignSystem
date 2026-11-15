/**
 * Style contracts that CSS-in-jsdom cannot observe, checked on the stylesheets:
 * disabled behaviour, card borders and the spinner (FR-1, FR-11 / NFR-9).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSemanticTokens } from '../../../scripts/build-tokens.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

/** Splits a selector list on top-level commas, so :is(a, b) stays whole. */
const splitSelectors = (list: string): string[] => {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};
const css = (id: string): string => readFileSync(join(root, 'components', id, `${id}.css`), 'utf8');
const rules = (src: string): Array<{ selector: string; body: string }> =>
  [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: (m[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').trim(),
    body: m[2] ?? '',
  }));
const NATIVE = { input: '.ads-input__field', select: '.ads-select__field', checkbox: '.ads-checkbox__box' };
const COMPONENTS = ['button', 'input', 'select', 'checkbox', 'card'];

describe('FR-1 disabled controls', () => {
  it('FR-1: disabled text is neutral 500 on a neutral 100 fill with a neutral 300 border', () => {
    const t = resolveSemanticTokens(root);
    const prim = JSON.parse(readFileSync(join(root, 'tokens', 'primitives.json'), 'utf8')) as {
      tokens: Array<{ name: string; value: string }>;
    };
    const p = new Map(prim.tokens.map((x) => [x.name, x.value]));
    expect(t.get('color-text-disabled')).toBe(p.get('color-neutral-500'));
    expect(t.get('color-interactive-disabled')).toBe(p.get('color-neutral-100'));
    expect(t.get('color-border-disabled')).toBe(p.get('color-neutral-300'));
  });

  it.each(COMPONENTS)('FR-1: %s sets cursor: not-allowed when disabled', (id) => {
    const disabled = rules(css(id)).filter((r) => /disabled/.test(r.selector));
    expect(disabled.some((r) => /cursor:\s*not-allowed/.test(r.body)), id).toBe(true);
  });

  it.each(COMPONENTS)('FR-1: every %s hover rule excludes disabled controls', (id) => {
    for (const r of rules(css(id)).filter((x) => /:hover/.test(x.selector))) {
      for (const sel of splitSelectors(r.selector)) {
        expect(sel, `${id}: ${sel.trim()}`).toMatch(/:not\(\[aria-disabled\]\)|:not\(:disabled\)|:not\(\[data-disabled\]\)/);
      }
    }
  });

  it.each(Object.entries(NATIVE))('FR-1: %s shows no focus ring when natively disabled', (id, field) => {
    const r = rules(css(id)).find((x) => splitSelectors(x.selector).some((s) => s === `${field}:disabled`));
    expect(r?.body, `${field}:disabled rule`).toMatch(/outline:\s*none/);
  });

  it.each(['button', 'card'])(
    'FR-11: %s keeps its focus ring when aria-disabled, because it stays in the tab order (WCAG 2.4.7)',
    (id) => {
      const disabled = rules(css(id)).filter((r) => /disabled/.test(r.selector));
      expect(disabled.some((r) => /outline:\s*none/.test(r.body))).toBe(false);
    },
  );
});

describe('FR-1 cards stay distinct from the page without shadow or radius', () => {
  const card = rules(css('card'));

  it('FR-1: the base card has a 1px neutral 200 border on the raised surface', () => {
    const base = card.find((r) => r.selector === '.ads-card');
    expect(base?.body).toMatch(/border:\s*var\(--border-width-default\) solid var\(--color-border-default\)/);
    expect(base?.body).toMatch(/background-color:\s*var\(--color-background-raised\)/);
    expect(resolveSemanticTokens(root).get('border-width-default')).toBe('1px');
  });

  it('FR-1: the flat (sunken) card keeps the same border', () => {
    const flat = card.find((r) => r.selector === '.ads-card[data-variant="flat"]');
    expect(flat?.body).toMatch(/background-color:\s*var\(--color-background-sunken\)/);
    expect(flat?.body).not.toMatch(/border/);
  });
});

describe('FR-11 spinner', () => {
  const shared = readFileSync(join(root, 'components', 'shared', 'shared.css'), 'utf8');

  it('FR-1: the spinner has a neutral 200 track and a blue 600 indicator', () => {
    const t = resolveSemanticTokens(root);
    const prim = JSON.parse(readFileSync(join(root, 'tokens', 'primitives.json'), 'utf8')) as {
      tokens: Array<{ name: string; value: string }>;
    };
    expect(t.get('color-spinner-track')).toBe(prim.tokens.find((x) => x.name === 'color-neutral-200')?.value);
    const spinner = rules(shared).find((r) => r.selector === '.ads-spinner');
    expect(spinner?.body).toMatch(/border:[^;]*var\(--color-spinner-track\)/);
    expect(spinner?.body).toMatch(/border-top-color:\s*var\(--color-interactive-default\)/);
  });

  it('FR-11: under prefers-reduced-motion the spinner is replaced by a static "Loading" label', () => {
    const media = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(shared)?.[1] ?? '';
    expect(media).toMatch(/\.ads-spinner\s*\{[^}]*display:\s*none/);
    expect(media).toMatch(/\.ads-spinner__text\s*\{[^}]*display:\s*inline/);
    const button = readFileSync(join(root, 'components', 'button', 'button.tsx'), 'utf8');
    expect(button).toMatch(/className="ads-spinner__text"[^>]*>\s*Loading\s*</);
    const modal = readFileSync(join(root, 'components', 'modal', 'modal.tsx'), 'utf8');
    // The modal already shows a visible "Loading" next to its spinner.
    expect(modal).toMatch(/className="ads-spinner"[^>]*\/>\s*<span>Loading<\/span>/);
  });
});
