import { describe, it, expect, afterEach } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pageLayerEnforced } from '../src/index.js';
import { loadDataStore } from '../../../agents/context/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
afterEach(() => delete process.env['ADS_PAGE_LAYER']);

describe('FR-21: one switch for the page layer', () => {
  it('FR-21: it is off in config until the Composer composes from templates', () => {
    expect(pageLayerEnforced(root)).toBe(false);
  });

  it('FR-21: while off, the Context agent leaves composition, copy and strategy rules out', async () => {
    const off = await loadDataStore(root);
    expect(off.rules.some((r) => /^DS-[PWS]-/.test(r.id))).toBe(false);
    process.env['ADS_PAGE_LAYER'] = '1';
    const on = await loadDataStore(root);
    expect(on.rules.filter((r) => /^DS-P-/.test(r.id))).toHaveLength(9);
    expect(on.rules.filter((r) => /^DS-W-/.test(r.id))).toHaveLength(6);
    expect(on.rules.filter((r) => /^DS-S-/.test(r.id))).toHaveLength(3);
  });
});
