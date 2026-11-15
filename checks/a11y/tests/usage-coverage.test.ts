import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The shape of parameters.usage (see .storybook/usage/usage-page.tsx). */
interface UsageSpec {
  pairs: Array<{ do: { caption: string }; dont: { caption: string; antiPattern: string } }>;
  textOnly?: Record<string, string>;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const ids = readdirSync(join(root, 'components')).filter((id) => existsSync(join(root, 'components', id, `${id}.meta.json`)));

/** Usage guidance with do and don't examples for every component (industry baseline: usage-docs). */
describe('FR-3 usage docs: do and don’t for every component', () => {
  it.each(ids)('FR-3: %s has a usage page with captioned do and don’t pairs covering every anti-pattern', async (id) => {
    const file = join(root, 'components', id, `${id}.usage.stories.tsx`);
    expect(existsSync(file), `${id}.usage.stories.tsx`).toBe(true);
    const mod = (await import(file)) as { default: { title: string; parameters: { usage: UsageSpec } } };
    const spec = mod.default.parameters.usage;
    const meta = JSON.parse(readFileSync(join(root, 'components', id, `${id}.meta.json`), 'utf8')) as { antiPatterns: string[] };

    expect(mod.default.title.startsWith('Usage/')).toBe(true);
    expect(spec.pairs.length).toBeGreaterThan(0);
    for (const pair of spec.pairs) {
      expect(pair.do.caption.trim()).not.toBe('');
      expect(pair.dont.caption.trim()).not.toBe('');
      expect(meta.antiPatterns, 'a don’t quotes a metadata anti-pattern word for word').toContain(pair.dont.antiPattern);
    }
    const textOnly = spec.textOnly ?? {};
    for (const [anti, reason] of Object.entries(textOnly)) {
      expect(meta.antiPatterns).toContain(anti);
      expect(reason.trim(), `reason for text-only "${anti}"`).not.toBe('');
    }
    const covered = new Set([...spec.pairs.map((p) => p.dont.antiPattern), ...Object.keys(textOnly)]);
    expect(meta.antiPatterns.filter((a) => !covered.has(a))).toEqual([]);
  });
});
