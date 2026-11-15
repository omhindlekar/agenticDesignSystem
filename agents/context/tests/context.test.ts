import { describe, it, expect, beforeAll } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectContext, loadDataStore } from '../tools.js';
import type { DataStore } from '../tools.js';
import { ContextPackSchema } from '../../../packages/schemas/src/context-pack.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

let store: DataStore;

beforeAll(async () => {
  store = await loadDataStore(root);
});

describe('FR-5 Context agent: context pack validity', () => {
  it('FR-5: selectContext returns a valid ContextPack', () => {
    const pack = selectContext({ taskId: 'task-001', task: 'create a primary button' }, store);
    expect(ContextPackSchema.safeParse(pack).success).toBe(true);
  });

  it('FR-5: every item in the pack has a non-empty reason', () => {
    const pack = selectContext({ taskId: 'task-002', task: 'build a login form with email input and submit button' }, store);
    for (const item of [...pack.tokenIds, ...pack.componentIds, ...pack.ruleIds]) {
      expect(item.reason.length, `Item "${item.id}" has empty reason`).toBeGreaterThan(0);
    }
  });

  it('FR-5: empty task returns an empty pack without throwing', () => {
    const pack = selectContext({ taskId: 'task-003', task: '' }, store);
    expect(ContextPackSchema.safeParse(pack).success).toBe(true);
    expect(pack.componentIds).toHaveLength(0);
    expect(pack.tokenIds).toHaveLength(0);
    expect(pack.ruleIds).toHaveLength(0);
  });
});

describe('FR-5 Context agent: relevance filtering', () => {
  it('FR-5: button task includes button in componentIds', () => {
    const pack = selectContext({ taskId: 'task-004', task: 'create a primary button' }, store);
    const ids = pack.componentIds.map((c) => c.id);
    expect(ids).toContain('button');
  });

  it('FR-5: button task does not include unrelated components (modal, card)', () => {
    const pack = selectContext({ taskId: 'task-005', task: 'create a primary button' }, store);
    const ids = pack.componentIds.map((c) => c.id);
    expect(ids).not.toContain('modal');
    expect(ids).not.toContain('card');
  });

  it('FR-5: button task includes button-scoped rules in ruleIds', () => {
    const pack = selectContext({ taskId: 'task-006', task: 'create a primary button' }, store);
    const ruleIds = pack.ruleIds.map((r) => r.id);
    expect(ruleIds.length).toBeGreaterThan(0);
    // All returned rules must apply to button
    for (const ruleId of ruleIds) {
      const rule = store.rules.find((r) => r.id === ruleId);
      expect(rule?.appliesTo).toContain('button');
    }
  });

  it('FR-5: modal task includes modal in componentIds', () => {
    const pack = selectContext({ taskId: 'task-007', task: 'show a confirmation modal dialog' }, store);
    const ids = pack.componentIds.map((c) => c.id);
    expect(ids).toContain('modal');
  });

  it('FR-5: button task includes tokens from button tokensUsed', () => {
    const pack = selectContext({ taskId: 'task-008', task: 'create a primary button' }, store);
    const tokenIds = pack.tokenIds.map((t) => t.id);
    expect(tokenIds).toContain('color-interactive-default');
  });
});

describe('FR-5 Context agent: 30% rule-text threshold (NFR-6)', () => {
  it('FR-5: focused button task returns rule text under 30% of total', () => {
    const pack = selectContext({ taskId: 'task-009', task: 'create a primary button' }, store);
    const totalChars = store.rules.reduce((n, r) => n + r.statement.length, 0);
    const selectedChars = pack.ruleIds.reduce((n, item) => {
      const rule = store.rules.find((r) => r.id === item.id);
      return n + (rule?.statement.length ?? 0);
    }, 0);
    const ratio = selectedChars / totalChars;
    expect(ratio, `Context rule text ratio ${(ratio * 100).toFixed(1)}% exceeds 30%`).toBeLessThan(0.3);
  });

  it('FR-5: focused input task returns rule text under 30% of total', () => {
    const pack = selectContext({ taskId: 'task-010', task: 'add an email input field' }, store);
    const totalChars = store.rules.reduce((n, r) => n + r.statement.length, 0);
    const selectedChars = pack.ruleIds.reduce((n, item) => {
      const rule = store.rules.find((r) => r.id === item.id);
      return n + (rule?.statement.length ?? 0);
    }, 0);
    const ratio = selectedChars / totalChars;
    expect(ratio, `Context rule text ratio ${(ratio * 100).toFixed(1)}% exceeds 30%`).toBeLessThan(0.3);
  });
});

describe('FR-5 Context agent: data store loading', () => {
  it('FR-5: loadDataStore loads every component that has metadata', async () => {
    const { readdirSync, existsSync } = await import('node:fs');
    const ids = readdirSync(join(root, 'components')).filter((d) => existsSync(join(root, 'components', d, `${d}.meta.json`)));
    expect(store.components.map((c) => c.id).sort()).toEqual(ids.sort());
  });

  it('FR-5: loadDataStore loads at least 15 rules', () => {
    expect(store.rules.length).toBeGreaterThanOrEqual(15);
  });

  it('FR-5: loadDataStore loads both primitive and semantic tokens', () => {
    expect(store.tokens.some((t) => t.tier === 'primitive')).toBe(true);
    expect(store.tokens.some((t) => t.tier === 'semantic')).toBe(true);
  });
});
