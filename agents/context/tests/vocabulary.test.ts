import { describe, it, expect, beforeAll } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { loadDataStore, selectContext } from '../tools.js';
import { DEMO_BRIEF } from '../../../scripts/generate.js';
import type { DataStore } from '../tools.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
let store: DataStore;
beforeAll(async () => {
  store = await loadDataStore(root);
});
const ids = (task: string) => selectContext({ taskId: 't', task }, store).componentIds.map((c) => c.id);
const REVIEW_BRIEF =
  'Design the "Review and send" screen shown before a business owner sends INR 8,45,000 to a supplier. Must include: amount, recipient (name, bank, last 4 digits), the account it comes from, the arrival estimate and any fee. A way to edit any detail without starting over. A light caution that this recipient is new. A required one-time code confirmation before sending. One clear "Send INR 8,45,000" action and a quiet way to go back.';

describe('FR-5: briefs need not name components', () => {
  it('FR-5: the Review and send brief selects the components it describes, though it names none', () => {
    expect(ids(REVIEW_BRIEF)).toEqual(expect.arrayContaining(['card', 'text', 'input', 'link', 'modal', 'banner', 'button']));
  });

  it('FR-5: each component chosen from a concept says which words implied it', () => {
    const pack = selectContext({ taskId: 't', task: 'a one-time code before you can send' }, store);
    expect(pack.componentIds.find((c) => c.id === 'input')?.reason).toMatch(/one-time code/);
    expect(pack.componentIds.find((c) => c.id === 'button')?.reason).toMatch(/send/);
  });

  it('FR-5: words match whole, so "postcode" is not "code" and "background" is not "back"', () => {
    expect(ids('a soft background behind the hero')).not.toContain('button');
    expect(ids('enter a promo code')).not.toContain('input');
  });

  it('FR-5, NFR-5: the demo brief selects exactly what it did before, so recorded responses still replay', () => {
    expect(ids(DEMO_BRIEF).sort()).toEqual(['button', 'card', 'checkbox', 'input']);
  });

  it('FR-5, NFR-6: the Review and send brief still loads under 30% of the rule text', () => {
    const pack = selectContext({ taskId: 't', task: REVIEW_BRIEF }, store);
    const total = store.rules.map((r) => r.statement).join('').length;
    const used = store.rules.filter((r) => pack.ruleIds.some((x) => x.id === r.id)).map((r) => r.statement).join('').length;
    expect(used / total).toBeLessThan(0.3);
  });

  it('FR-5: the vocabulary names only real components', () => {
    const vocab = JSON.parse(readFileSync(join(root, 'agents', 'context', 'vocabulary.json'), 'utf8')) as { concepts: Array<{ components: string[] }> };
    const known = new Set(store.components.map((c) => c.id));
    expect(vocab.concepts.flatMap((c) => c.components).filter((c) => !known.has(c))).toEqual([]);
  });
});
