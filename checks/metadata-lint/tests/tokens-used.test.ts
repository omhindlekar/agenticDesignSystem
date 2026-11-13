/**
 * FR-3: each component's metadata tokensUsed matches the semantic tokens its CSS
 * actually references: its own stylesheet plus the shared helper classes it renders.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const COMPONENTS = ['button', 'input', 'select', 'checkbox', 'card', 'modal', 'icon', 'icon-button', 'textarea', 'search-field', 'field', 'radio-group', 'switch', 'segmented-control'];

const varsIn = (css: string): Set<string> => new Set([...css.matchAll(/var\(--([a-z0-9-]+)/g)].map((m) => m[1] ?? ''));

/** Shared class prefix → tokens its rules reference (e.g. "ads-field" covers .ads-field__label). */
function sharedTokensByClass(): Map<string, Set<string>> {
  const css = readFileSync(join(root, 'components', 'shared', 'shared.css'), 'utf8');
  const out = new Map<string, Set<string>>();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const prefix = /\.(ads-[a-z-]+?)(?:__|\[|\s|:|$)/.exec((m[1] ?? '').trim())?.[1];
    if (!prefix) continue;
    const set = out.get(prefix) ?? new Set<string>();
    for (const v of varsIn(m[2] ?? '')) set.add(v);
    out.set(prefix, set);
  }
  return out;
}

describe('FR-3 metadata: tokensUsed matches component CSS', () => {
  const shared = sharedTokensByClass();

  it.each(COMPONENTS)('FR-3: %s tokensUsed equals the tokens its CSS references', (id) => {
    const dir = join(root, 'components', id);
    const expected = varsIn(readFileSync(join(dir, `${id}.css`), 'utf8'));
    const tsx = readFileSync(join(dir, `${id}.tsx`), 'utf8');
    for (const [prefix, tokens] of shared) {
      if (tsx.includes(prefix)) for (const t of tokens) expected.add(t);
    }
    const meta = JSON.parse(readFileSync(join(dir, `${id}.meta.json`), 'utf8')) as { tokensUsed: string[] };
    expect([...meta.tokensUsed].sort()).toEqual([...expected].sort());
  });
});
