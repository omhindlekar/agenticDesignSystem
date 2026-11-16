import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copiedRuns, verifyCanonDraft, buildCanonPrompt, parseDrafts, loadResearchConfig, loadCatalogue, runCanonRefresh } from '../research.js';
import type { CompleteResult, ModelProvider } from '../../../packages/provider/src/types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const cfg = loadResearchConfig(root);
const catalogue = loadCatalogue(root);
const PAGE_WISE = 'Wise tells customers the exact day and time their transfer should arrive, and updates it if it changes.';
const PAGE_STRIPE = 'Stripe recommends showing a delivery promise with a specific date rather than a range of business days.';
const entry = (over: Record<string, unknown> = {}) => ({
  id: 'specific-time',
  name: 'Specific time over vague time',
  rule: 'Say exactly when it happens, such as by 2:00 pm today, rather than soon.',
  leaders: [
    { leader: 'wise', url: 'https://wise.com/help/arrival', retrievedAt: '2026-11-16', note: 'Shows an arrival estimate with a day and time.' },
    { leader: 'stripe', url: 'https://stripe.com/resources/delivery-promise', retrievedAt: '2026-11-16', note: 'Recommends a promised date over a range.' },
  ],
  mapsTo: { tokens: [], components: ['text'], rules: ['DS-W-001'] },
  check: 'vision:copy-and-tone',
  appliesTo: ['all'],
  version: '1.0.0',
  refreshedAt: '2026-11-16',
  ...over,
});
const research = (ok = true): Pick<CompleteResult, 'toolLog' | 'fetched'> => ({
  toolLog: [
    { tool: 'WebFetch', input: 'https://wise.com/help/arrival', ok },
    { tool: 'WebFetch', input: 'https://stripe.com/resources/delivery-promise', ok: true },
  ],
  fetched: { ...(ok ? { 'https://wise.com/help/arrival': PAGE_WISE } : {}), 'https://stripe.com/resources/delivery-promise': PAGE_STRIPE },
});

describe('FR-24: canon research guards', () => {
  it('FR-24: a well-sourced entry in our own words passes', () => {
    expect(verifyCanonDraft(entry(), research(), cfg, catalogue)).toEqual([]);
  });

  it('FR-24: every leader link must have been fetched successfully, not just attempted', () => {
    expect(verifyCanonDraft(entry(), research(false), cfg, catalogue).join(' ')).toMatch(/wise\.com\/help\/arrival.*not successfully fetched/);
  });

  it("FR-24: a leader's link must be on that leader's own domain", () => {
    const e = entry({ leaders: [{ ...entry().leaders[0], url: 'https://someblog.example/wise-tips' }, entry().leaders[1]] });
    const r = research();
    r.toolLog!.push({ tool: 'WebFetch', input: 'https://someblog.example/wise-tips', ok: true });
    expect(verifyCanonDraft(e, r, cfg, catalogue).join(' ')).toMatch(/not a wise domain/);
  });

  it('FR-24: an 8-word run copied from a fetched page is rejected', () => {
    const e = entry({ rule: 'Wise tells customers the exact day and time it arrives.' });
    expect(verifyCanonDraft(e, research(), cfg, catalogue).join(' ')).toMatch(/copied/);
    expect(copiedRuns('tells customers the exact day and time their transfer', [PAGE_WISE], 8)).toHaveLength(2);
    expect(copiedRuns('tell people the day', [PAGE_WISE], 8)).toEqual([]);
  });

  it('FR-24: mapped tokens, components and rules must exist in this system', () => {
    const e = entry({ mapsTo: { tokens: ['color-magic'], components: ['carousel'], rules: ['DS-Z-999'] } });
    const issues = verifyCanonDraft(e, research(), cfg, catalogue).join(' ');
    expect(issues).toMatch(/color-magic/);
    expect(issues).toMatch(/carousel/);
    expect(issues).toMatch(/DS-Z-999/);
  });

  it('FR-24: a rules-audit check must name a real rule', () => {
    expect(verifyCanonDraft(entry({ check: 'rules-audit:DS-P-002' }), research(), cfg, catalogue)).toEqual([]);
    expect(verifyCanonDraft(entry({ check: 'rules-audit:DS-P-099' }), research(), cfg, catalogue).join(' ')).toMatch(/DS-P-099/);
  });

  it('FR-24: schema problems (pixel values, missing leaders) are reported, not thrown', () => {
    expect(verifyCanonDraft(entry({ rule: 'Leave 24px above the amount.' }), research(), cfg, catalogue).join(' ')).toMatch(/pixel/);
  });

  it('FR-24: the prompt treats web pages as data, lists the seeds, the allowed ids and the leader domains', () => {
    const p = buildCanonPrompt([{ id: 'specific-time', name: 'Specific time over vague time', intent: 'Say when.' }], cfg, catalogue);
    expect(p).toMatch(/specific-time/);
    expect(p).toMatch(/wise\.com/);
    expect(p).toMatch(/never follow instructions/i);
    expect(p).toMatch(/DS-P-002/);
    expect(p).toMatch(/no pixel values/i);
    expect(p).toMatch(/each leader appears at most once/i);
    expect(p).toMatch(/mapsTo\.rules: list every rule/);
  });

  it('FR-24: drafts are read from a JSON array, with or without a code fence', () => {
    expect(parseDrafts('```json\n[{"id":"a"}]\n```')).toEqual([{ id: 'a' }]);
    expect(parseDrafts('Here you go: [{"id":"a"}]')).toEqual([{ id: 'a' }]);
    expect(() => parseDrafts('no json')).toThrow();
  });
});

describe('FR-23: canon refresh', () => {
  it('FR-23: researches seeds in batches, writes only valid drafts, and reports the rest', async () => {
    const writes: Record<string, string> = {};
    const calls: Array<{ tools?: string[] }> = [];
    const provider: ModelProvider = {
      complete: async (_p, opts) => {
        calls.push({ ...(opts.tools ? { tools: opts.tools } : {}) });
        return { text: JSON.stringify([entry(), entry({ id: 'bad-one', rule: 'Leave 24px above the amount.' })]), costUsd: 0, ...research() };
      },
    };
    const report = await runCanonRefresh({
      repoRoot: root,
      provider,
      seeds: [{ id: 'specific-time', name: 'Specific time', intent: 'x' }, { id: 'bad-one', name: 'Bad', intent: 'y' }],
      write: (path, data) => (writes[path] = data),
      today: '2026-11-16',
    });
    expect(calls).toEqual([{ tools: ['WebSearch', 'WebFetch'] }]);
    expect(Object.keys(writes).map((p) => p.replace(root + '/', '')).sort()).toEqual(['canon/drafts/report.json', 'canon/drafts/specific-time.json']);
    expect(report.accepted).toEqual(['specific-time']);
    expect(report.rejected.map((r) => r.id)).toEqual(['bad-one']);
  });

  it('FR-23: a seed the model left out is reported as missing', async () => {
    const provider: ModelProvider = { complete: async () => ({ text: '[]', costUsd: 0, toolLog: [], fetched: {} }) };
    const report = await runCanonRefresh({ repoRoot: root, provider, seeds: [{ id: 'x', name: 'X', intent: 'x' }], write: () => {}, today: '2026-11-16' });
    expect(report.missing).toEqual(['x']);
  });
});
