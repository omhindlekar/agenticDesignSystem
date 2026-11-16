import { describe, it, expect } from 'vitest';
import { CanonEntrySchema } from '../src/canon-entry.js';
import { OwnWords } from '../src/pattern-spec.js';

const leader = (id: string, n: number) => ({ leader: id, url: `https://${id}.example.com/guide/${n}`, retrievedAt: '2026-11-16', note: `How ${id} applies it.` });
export const validEntry = () => ({
  id: 'specific-time',
  name: 'Specific time over vague time',
  rule: 'Say exactly when something happens, such as by 2:00 pm today, not soon or in a few days.',
  leaders: [leader('wise', 1), leader('stripe', 2)],
  mapsTo: { tokens: [], components: ['text', 'card'], rules: ['DS-W-001'] },
  check: 'vision:copy-and-tone',
  appliesTo: ['all'],
  version: '1.0.0',
  refreshedAt: '2026-11-16',
});

describe('FR-24 CanonEntrySchema', () => {
  it('FR-24: accepts a valid canon entry', () => {
    const r = CanonEntrySchema.safeParse(validEntry());
    expect(r.success, JSON.stringify(!r.success && r.error.issues)).toBe(true);
  });

  it('FR-24: a principle needs at least two leaders, each with a source URL and retrieval date', () => {
    expect(CanonEntrySchema.safeParse({ ...validEntry(), leaders: [leader('wise', 1)] }).success).toBe(false);
    expect(CanonEntrySchema.safeParse({ ...validEntry(), leaders: [leader('wise', 1), { ...leader('stripe', 2), retrievedAt: 'today' }] }).success).toBe(false);
  });

  it('FR-24: leaders are the named seven; the same leader cannot count twice', () => {
    expect(CanonEntrySchema.safeParse({ ...validEntry(), leaders: [leader('wise', 1), leader('acme', 2)] }).success).toBe(false);
    expect(CanonEntrySchema.safeParse({ ...validEntry(), leaders: [leader('wise', 1), leader('wise', 2)] }).success).toBe(false);
  });

  it('FR-24: the rule is one line of at most 140 characters', () => {
    expect(CanonEntrySchema.safeParse({ ...validEntry(), rule: 'x'.repeat(141) }).success).toBe(false);
    expect(CanonEntrySchema.safeParse({ ...validEntry(), rule: 'One line.\nTwo lines.' }).success).toBe(false);
  });

  it('FR-24: says how QA verifies it', () => {
    for (const check of ['rules-audit:DS-P-002', 'vision:hierarchy', 'vision:outcome-clarity', 'manual'])
      expect(CanonEntrySchema.safeParse({ ...validEntry(), check }).success, check).toBe(true);
    expect(CanonEntrySchema.safeParse({ ...validEntry(), check: 'eyeball' }).success).toBe(false);
    expect(CanonEntrySchema.safeParse({ ...validEntry(), check: 'vision:vibes' }).success).toBe(false);
  });

  it('FR-24: no screenshots or extra fields', () => {
    expect(CanonEntrySchema.safeParse({ ...validEntry(), image: 'x.png' }).success).toBe(false);
  });
});

describe('FR-24: pixel-value guard on research text', () => {
  it.each(['Use 16px between fields', 'a 2rem gap', 'set 12 pt type', 'pad by 1.5em'])('FR-24: rejects "%s"', (t) => {
    expect(OwnWords.safeParse(t).success).toBe(false);
  });

  it.each(['Use the space-component-gap-md token between fields', 'Two columns on wide screens', 'Arrives by 2:00 pm today', 'PSD2 rules for 2 factors'])(
    'FR-24: allows "%s"',
    (t) => {
      expect(OwnWords.safeParse(t).success).toBe(true);
    },
  );

  it('FR-24: a canon rule with a pixel value is rejected', () => {
    expect(CanonEntrySchema.safeParse({ ...validEntry(), rule: 'Keep 24px between sections.' }).success).toBe(false);
  });
});
