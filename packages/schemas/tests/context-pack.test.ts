import { describe, it, expect } from 'vitest';
import { ContextPackSchema } from '../src/context-pack.js';

const validPack = {
  taskId: 'task-001',
  tokenIds: [{ id: 'color-interactive-default', reason: 'Button uses this token for its background' }],
  componentIds: [{ id: 'button', reason: 'Primary action on the screen' }],
  ruleIds: [{ id: 'DS-001', reason: 'All colours must reference a semantic token' }],
};

describe('FR-5 ContextPackSchema', () => {
  it('FR-5: accepts a valid context pack', () => {
    expect(ContextPackSchema.safeParse(validPack).success).toBe(true);
  });

  it('FR-5: requires a reason on every tokenId item', () => {
    const bad = {
      ...validPack,
      tokenIds: [{ id: 'color-interactive-default' }],
    };
    expect(ContextPackSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-5: requires a reason on every componentId item', () => {
    const bad = {
      ...validPack,
      componentIds: [{ id: 'button' }],
    };
    expect(ContextPackSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-5: requires a reason on every ruleId item', () => {
    const bad = {
      ...validPack,
      ruleIds: [{ id: 'DS-001' }],
    };
    expect(ContextPackSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-5: accepts an empty context pack (no matching tokens/components/rules)', () => {
    expect(
      ContextPackSchema.safeParse({
        taskId: 'task-002',
        tokenIds: [],
        componentIds: [],
        ruleIds: [],
      }).success,
    ).toBe(true);
  });

  it('FR-5: rejects a pack without a taskId', () => {
    const { taskId: _t, ...noTask } = validPack;
    expect(ContextPackSchema.safeParse(noTask).success).toBe(false);
  });
});
