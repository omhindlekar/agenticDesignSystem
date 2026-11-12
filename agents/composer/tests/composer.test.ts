import { describe, it, expect } from 'vitest';
import { buildComposerPrompt, parseComposerResponse } from '../tools.js';
import type { ComposerInput } from '../schema.js';

const composerInput: ComposerInput = {
  taskId: 'task-001',
  brief: 'A screen with a primary button that submits a form',
  contextPack: {
    taskId: 'task-001',
    tokenIds: [
      { id: 'color-interactive-default', reason: 'used by button' },
      { id: 'space-component-padding-md', reason: 'used by button' },
    ],
    componentIds: [{ id: 'button', reason: 'score 2' }],
    ruleIds: [{ id: 'DS-T-001', reason: 'applies to button' }],
  },
};

const validSpecJson = JSON.stringify({
  taskId: 'task-001',
  tree: {
    component: 'button',
    props: { label: 'Submit', variant: 'primary' },
    tokenRefs: ['color-interactive-default'],
    states: ['default'],
  },
  statesCovered: ['default'],
});

describe('FR-6: Composer prompt building', () => {
  it('FR-6: prompt includes the brief text', () => {
    const prompt = buildComposerPrompt(composerInput);
    expect(prompt).toContain('primary button');
  });

  it('FR-6: prompt lists component IDs from context pack', () => {
    const prompt = buildComposerPrompt(composerInput);
    expect(prompt).toContain('button');
  });

  it('FR-6: prompt lists token IDs from context pack', () => {
    const prompt = buildComposerPrompt(composerInput);
    expect(prompt).toContain('color-interactive-default');
  });

  it('FR-6: prompt forbids hardcoded values', () => {
    const prompt = buildComposerPrompt(composerInput);
    expect(prompt.toLowerCase()).toMatch(/hardcod|literal|hex|rgb/);
  });
});

describe('FR-6: Composer response parsing', () => {
  it('FR-6: parses valid ScreenSpec JSON from model response', () => {
    const spec = parseComposerResponse('task-001', validSpecJson);
    expect(spec.taskId).toBe('task-001');
    expect(spec.tree.component).toBe('button');
  });

  it('FR-6: parses ScreenSpec when wrapped in markdown code fence', () => {
    const fenced = `\`\`\`json\n${validSpecJson}\n\`\`\``;
    const spec = parseComposerResponse('task-001', fenced);
    expect(spec.taskId).toBe('task-001');
  });

  it('FR-6: throws on invalid JSON', () => {
    expect(() => parseComposerResponse('task-001', 'not json')).toThrow();
  });

  it('FR-6: throws when response does not match ScreenSpec schema', () => {
    const invalid = JSON.stringify({ taskId: 'task-001', foo: 'bar' });
    expect(() => parseComposerResponse('task-001', invalid)).toThrow();
  });

  it('FR-6: spec uses only component IDs from context pack (no unregistered components)', () => {
    const spec = parseComposerResponse('task-001', validSpecJson);
    const registeredIds = new Set(composerInput.contextPack.componentIds.map((c) => c.id));
    function checkNode(node: typeof spec.tree): void {
      expect(registeredIds.has(node.component)).toBe(true);
      node.children?.forEach(checkNode);
    }
    checkNode(spec.tree);
  });
});

describe('FR-6: Composer integration (requires ANTHROPIC_API_KEY)', () => {
  const hasKey = !!process.env['ANTHROPIC_API_KEY'];

  it.skipIf(!hasKey)('FR-6: runComposer returns valid ScreenSpec from real API', async () => {
    const { runComposer } = await import('../index.js');
    const spec = await runComposer(composerInput);
    expect(spec.taskId).toBe('task-001');
    expect(spec.tree.component).toBeTruthy();
  });
});
