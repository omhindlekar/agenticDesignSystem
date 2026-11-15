/**
 * FR-1, FR-3: the phase 1.7 foundations are applied in each component stylesheet,
 * and every component's metadata carries a short spec that names real tokens.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
const rule = (id: string, selector: string): string => {
  const found = rules(css(id)).filter((r) => splitSelectors(r.selector).some((s) => s === selector));
  expect(found.length, `${id}: ${selector}`).toBeGreaterThan(0);
  return found.map((r) => r.body).join('\n');
};
const decl = (prop: string, token: string): RegExp => new RegExp(`${prop}:\\s*var\\(--${token}\\)`);

describe('FR-1 Button applies the foundations', () => {
  it.each([
    ['.ads-button', 'size-control-md', 'space-component-padding-md'],
    ['.ads-button[data-size="sm"]', 'size-control-sm', 'space-component-padding-md'],
    ['.ads-button[data-size="lg"]', 'size-control-lg', 'space-component-padding-lg'],
  ])('FR-1: %s is %s tall with %s horizontal padding', (selector, height, padding) => {
    const body = rule('button', selector);
    expect(body).toMatch(decl('min-height', height));
    expect(body).toMatch(decl('padding-inline', padding));
  });

  it('FR-1: button text uses the button type role (SemiCondensed 500, no uppercase)', () => {
    const body = rule('button', '.ads-button');
    for (const p of ['family', 'size', 'weight', 'line-height', 'letter-spacing']) {
      expect(body).toMatch(decl(p === 'family' ? 'font-family' : p === 'size' ? 'font-size' : p === 'weight' ? 'font-weight' : p, `type-button-${p}`));
    }
    expect(body).toMatch(/text-transform:\s*none/);
  });

  it('FR-1: loading keeps the width by hiding, not removing, the label', () => {
    expect(css('button')).toMatch(/\[data-state~="loading"\][^{]*\.ads-button__label[^{]*\{[^}]*opacity:\s*0/);
  });

  it('FR-1: contained buttons keep the darker hover and pressed fills; others use the state layer', () => {
    expect(css('button')).toMatch(/data-variant="contained"\][^{]*:hover[^{]*\{[^}]*var\(--color-interactive-hover\)/);
    expect(css('button')).toMatch(/data-variant="contained"\][^{]*:active[^{]*\{[^}]*var\(--color-interactive-active\)/);
    const tsx = readFileSync(join(root, 'components', 'button', 'button.tsx'), 'utf8');
    expect(tsx).toMatch(/ads-state-layer/);
  });
});

describe('FR-1 fields apply the foundations', () => {
  it.each(['input', 'select'])('FR-1: %s field is 40px tall, body 1 text, with a 1px input border', (id) => {
    const body = rule(id, `.ads-${id}__field`);
    expect(body).toMatch(decl('min-height', 'size-control-md'));
    expect(body).toMatch(decl('font-size', 'type-body1-size'));
    expect(body).toMatch(/border:\s*var\(--border-width-default\) solid var\(--color-border-input\)/);
  });

  it.each(['input', 'select'])('FR-1: %s error state is a red border only, with no tinted fill', (id) => {
    const body = rule(id, `.ads-${id}[data-state~="error"] .ads-${id}__field`);
    expect(body).toMatch(decl('border-color', 'color-border-danger'));
    expect(body).not.toMatch(/background/);
  });

  it.each([
    ['input', '.ads-input__field:focus-visible'],
    ['select', '.ads-select__field:is([data-focus-visible], :focus-visible)'],
  ])('FR-1: %s focus is the 2px blue 600 ring with no tint', (id, selector) => {
    const body = rule(id, selector);
    expect(body).toMatch(/outline:\s*var\(--border-width-focus\) solid var\(--color-interactive-focus-ring\)/);
    expect(body).toMatch(decl('outline-offset', 'focus-ring-offset'));
    expect(body).not.toMatch(/background/);
  });

  it('FR-1: labels use the label role and messages use the caption role', () => {
    const shared = readFileSync(join(root, 'components', 'shared', 'shared.css'), 'utf8');
    const label = rules(shared).find((r) => r.selector === '.ads-field__label')?.body ?? '';
    const msg = rules(shared).find((r) => r.selector === '.ads-field__message')?.body ?? '';
    expect(label).toMatch(decl('font-size', 'type-label-size'));
    expect(label).toMatch(decl('font-family', 'type-label-family'));
    expect(msg).toMatch(decl('font-size', 'type-caption-size'));
  });
});

describe('FR-1 Checkbox applies the foundations', () => {
  it('FR-1: 20px box inside a 40px hit area', () => {
    expect(rule('checkbox', '.ads-checkbox__box')).toMatch(decl('width', 'size-control-indicator'));
    const control = rule('checkbox', '.ads-checkbox__control');
    expect(control).toMatch(decl('width', 'size-hit-area'));
    expect(control).toMatch(decl('height', 'size-hit-area'));
  });

  it('FR-1: the hit area carries the state layer on hover and focus', () => {
    const c = css('checkbox');
    expect(c).toMatch(/:hover[^{]*\.ads-checkbox__layer[^{]*\{[^}]*var\(--opacity-state-hover\)/);
    expect(c).toMatch(/:focus-visible[^{]*\.ads-checkbox__layer[^{]*\{[^}]*var\(--opacity-state-focus\)/);
  });

  it('FR-1: label is 14px', () => {
    expect(rule('checkbox', '.ads-checkbox__label')).toMatch(decl('font-size', 'type-label-size'));
  });
});

describe('FR-1 Card applies the foundations', () => {
  it('FR-1: elevation 1 with the 1px border; interactive lifts to elevation 2 on hover', () => {
    const base = rule('card', '.ads-card');
    expect(base).toMatch(decl('box-shadow', 'elevation-1'));
    expect(base).toMatch(/border:\s*var\(--border-width-default\) solid var\(--color-border-default\)/);
    const lift = new RegExp(`data-variant="interactive"\\][^{]*:hover[^{]*\\{[^}]*${decl('box-shadow', 'elevation-2').source}`);
    expect(css('card')).toMatch(lift);
  });

  it('FR-1: padding is 16 for sm and md, 24 for lg', () => {
    expect(rule('card', '.ads-card')).toMatch(decl('padding', 'space-component-padding-md'));
    expect(rule('card', '.ads-card[data-padding="sm"]')).toMatch(decl('padding', 'space-component-padding-md'));
    expect(rule('card', '.ads-card[data-padding="lg"]')).toMatch(decl('padding', 'space-component-padding-lg'));
  });

  it('FR-1: header title is h4 and subtitle is body 2 in the secondary colour', () => {
    expect(rule('card', '.ads-card__title')).toMatch(decl('font-size', 'type-h4-size'));
    const sub = rule('card', '.ads-card__subtitle');
    expect(sub).toMatch(decl('font-size', 'type-body2-size'));
    expect(sub).toMatch(decl('color', 'color-text-secondary'));
  });
});

describe('FR-1 Modal applies the foundations', () => {
  it('FR-1: elevation 4, 24px padding, h3 title, body 1 text', () => {
    const panel = rule('modal', '.ads-modal__panel');
    expect(panel).toMatch(decl('box-shadow', 'elevation-4'));
    expect(panel).toMatch(decl('padding', 'space-component-padding-lg'));
    expect(rule('modal', '.ads-modal__title')).toMatch(decl('font-size', 'type-h3-size'));
    expect(rule('modal', '.ads-modal__body')).toMatch(decl('font-size', 'type-body1-size'));
  });

  it('FR-1: scrim and panel animate over the 200ms overlay duration', () => {
    expect(css('modal')).toMatch(/animation:[^;]*var\(--motion-duration-overlay\)/);
  });
});

describe('FR-3 metadata spec', () => {
  const semantic = new Set(
    (JSON.parse(readFileSync(join(root, 'tokens', 'semantic.json'), 'utf8')) as { tokens: Array<{ name: string }> }).tokens.map(
      (t) => t.name,
    ),
  );

  it.each(['button', 'input', 'select', 'checkbox', 'card', 'modal', 'icon', 'icon-button', 'textarea', 'search-field', 'field', 'radio-group', 'switch', 'segmented-control', 'slider', 'number-field', 'combobox', 'date-picker', 'spinner', 'progress-bar', 'banner', 'toast-region', 'badge', 'tooltip', 'popover', 'menu', 'drawer', 'link', 'tabs', 'breadcrumbs', 'side-nav', 'app-header'])('FR-3: %s metadata has a spec naming only real tokens', (id) => {
    const meta = JSON.parse(readFileSync(join(root, 'components', id, `${id}.meta.json`), 'utf8')) as {
      spec?: Record<string, string[]>;
    };
    expect(meta.spec, `${id}.spec`).toBeDefined();
    for (const key of ['anatomy', 'sizes', 'typography', 'states', 'motion']) {
      expect(Array.isArray(meta.spec?.[key]) && (meta.spec?.[key]?.length ?? 0) > 0, `${id}.spec.${key}`).toBe(true);
    }
    const text = JSON.stringify(meta.spec);
    for (const m of text.matchAll(/`([a-z][a-z0-9-]+)`/g)) {
      expect(semantic.has(m[1] ?? ''), `${id}.spec names unknown token ${m[1]}`).toBe(true);
    }
  });
});

describe('FR-1 icons come only from the Icon component', () => {
  it('FR-1: the hand-drawn shared icon set is retired', async () => {
    const { existsSync } = await import('node:fs');
    expect(existsSync(join(root, 'components', 'shared', 'icons.tsx'))).toBe(false);
  });

  it('FR-1: the select chevron is the keyboard_arrow_down icon', () => {
    const tsx = readFileSync(join(root, 'components', 'select', 'select.tsx'), 'utf8');
    expect(tsx).toMatch(/<Icon name="keyboard_arrow_down"/);
  });
});
