import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDataStore } from '../../../agents/context/index.js';
import { selectContext } from '../../../agents/context/tools.js';
import { DEMO_BRIEF } from '../../../scripts/generate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

/**
 * The Context agent matches brief keywords against each component's id, purpose and
 * variants. A new component whose purpose contains an incidental word ("button",
 * "primary", "sign") would be pulled into unrelated briefs. These cases pin the
 * selection, so metadata wording is fixed in metadata, never in the agent.
 */
describe('FR-3 metadata keeps context selection precise', () => {
  const cases: Array<[string, string[]]> = [
    [DEMO_BRIEF, ['button', 'card', 'checkbox', 'icon-button', 'input']],
    ['create a primary button', ['button', 'icon-button']],
  ];
  it.each(cases)('FR-3: "%s" selects exactly the expected components', async (task, expected) => {
    const store = await loadDataStore(root);
    const pack = selectContext({ taskId: 't', task } as Parameters<typeof selectContext>[0], store);
    expect(pack.componentIds.map((c) => c.id).sort()).toEqual(expected);
  });
});
