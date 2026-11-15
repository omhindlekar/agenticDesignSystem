import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataStore } from '../../../agents/context/index.js';
import { selectContext } from '../../../agents/context/tools.js';
import { DEMO_BRIEF } from '../../../scripts/generate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

/**
 * The Context agent selects a component when the brief names every word of its id
 * (phase 2b; before, any word of its purpose counted, which pulled in 15–27 components
 * per brief and most of the rule text). These cases pin the selection.
 */
describe('FR-3 metadata keeps context selection precise', () => {
  const cases: Array<[string, string[]]> = [
    [DEMO_BRIEF, ['button', 'card', 'checkbox', 'input']],
    ['create a primary button', ['button']],
    ['An app shell with an app header and a side navigation', ['app-header', 'side-nav']],
    ['A data table with sortable columns', ['table']],
    ['Three pricing cards with buttons', ['button', 'card']],
  ];
  it.each(cases)('FR-3: "%s" selects exactly the expected components', async (task, expected) => {
    const store = await loadDataStore(root);
    const pack = selectContext({ taskId: 't', task } as Parameters<typeof selectContext>[0], store);
    expect(pack.componentIds.map((c) => c.id).sort()).toEqual(expected);
  });
});
