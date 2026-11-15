import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintForcedColors, lintLogicalProperties } from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-1 token lint: forced colours (DS-A-007)', () => {
  it('FR-1: flags token colours inside a forced-colors block', () => {
    const css = '@media (forced-colors: active) {\n  .x[data-selected] { background-color: var(--color-container-primary); }\n}\n';
    expect(lintForcedColors(css).map((v) => v.pattern)).toEqual(['token-colour-in-forced-colors']);
  });
  it('FR-1: flags system colours outside a forced-colors block', () => {
    expect(lintForcedColors('.x { color: Highlight; }').map((v) => v.pattern)).toEqual(['system-colour-outside-forced-colors']);
  });
  it('FR-1: accepts system colours and non-colour tokens inside the block', () => {
    const css =
      '@media (forced-colors: active) {\n  .x { forced-color-adjust: none; background-color: Highlight; outline: var(--border-width-default) solid CanvasText; }\n}\n';
    expect(lintForcedColors(css)).toEqual([]);
  });
});

describe('FR-1 token lint: logical properties (DS-L-004)', () => {
  it('FR-1: flags physical left/right properties and text alignment', () => {
    const css = '.x { padding-left: 0; margin-right: 0; left: 0; text-align: right; border-left-color: red; float: left; }';
    expect(lintLogicalProperties(css)).toHaveLength(6);
  });
  it('FR-1: accepts logical properties', () => {
    const css = '.x { padding-inline-start: 0; inset-inline-end: 0; text-align: start; border-inline-start: 0; }';
    expect(lintLogicalProperties(css)).toEqual([]);
  });
  it('FR-1: a horizontal translate needs a [dir="rtl"] rule in the same file', () => {
    expect(lintLogicalProperties('.x { transform: translateX(100%); }').map((v) => v.pattern)).toEqual(['translate-without-rtl']);
    expect(lintLogicalProperties('.x { transform: translateX(100%); }\n[dir="rtl"] .x { transform: translateX(-100%); }')).toEqual([]);
  });
});

/**
 * A component that shows a state by fill (selected, checked, current, a progress or
 * slider fill, an indicator bar) must say how that state looks with forced colours.
 */
describe('NFR-9 forced colours: every filled state has a forced-colors rule', () => {
  const STATE_FILL =
    /(?:data-selected|selected"|checked|:checked|indeterminate|aria-current|__fill|__dot|__thumb|::after)[^{]*\{[^}]*background(?:-color)?\s*:/;
  const ids = readdirSync(join(root, 'components')).filter((id) => existsSync(join(root, 'components', id, `${id}.meta.json`)));
  const filled = ids.filter((id) => {
    const css = join(root, 'components', id, `${id}.css`);
    return existsSync(css) && STATE_FILL.test(readFileSync(css, 'utf8'));
  });
  it('NFR-9: the check finds the components that draw states with fills', () => {
    expect(filled).toEqual(expect.arrayContaining(['checkbox', 'switch', 'slider', 'tabs', 'tree', 'table', 'list', 'side-nav']));
  });
  it.each(filled)('NFR-9: %s has an @media (forced-colors: active) rule', (id) => {
    expect(readFileSync(join(root, 'components', id, `${id}.css`), 'utf8')).toMatch(/@media \(forced-colors: active\)/);
  });
});
