import { describe, it, expect, vi } from 'vitest';
import { runOrchestrator } from '../tools.js';
import type { ContextPack } from '../../../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../../../packages/schemas/src/screen-spec.js';

const SCHEMA_VERSION = '1.0.0';

const mockContextPack: ContextPack = {
  taskId: 'task-001',
  tokenIds: [{ id: 'color-background-surface', reason: 'used by button' }],
  componentIds: [{ id: 'button', reason: 'score 2' }],
  ruleIds: [],
};

const mockScreenSpec: ScreenSpec = {
  taskId: 'task-001',
  tree: {
    component: 'button',
    props: { label: 'Submit' },
    tokenRefs: ['color-background-surface'],
    states: ['default'],
  },
  statesCovered: ['default'],
};

const validTsx = `
import React from 'react';
export function Screen() {
  return <button style={{ background: 'var(--color-background-surface)' }}>Submit</button>;
}
`.trim();

function makeContextRunner() {
  return vi.fn().mockResolvedValue(mockContextPack);
}

function makeComposerRunner(result: unknown = mockScreenSpec) {
  return vi.fn().mockResolvedValue(result);
}

function makeBuilderRunner(result: unknown = validTsx) {
  return vi.fn().mockResolvedValue(result);
}

describe('FR-8: Orchestrator schema validation and retry', () => {
  it('FR-8: returns pass when all agents succeed on first attempt', async () => {
    const result = await runOrchestrator(
      { taskId: 'task-001', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner: makeContextRunner(),
        composerRunner: makeComposerRunner(),
        builderRunner: makeBuilderRunner(),
      },
    );
    expect(result.outcome).toBe('pass');
    expect(result.tsx).toBe(validTsx);
  });

  it('FR-8: retries composer on schema-invalid response and escalates after retryLimit', async () => {
    const composerRunner = vi.fn().mockResolvedValue({ not: 'a valid screen spec' });
    const result = await runOrchestrator(
      { taskId: 'task-002', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner: makeContextRunner(),
        composerRunner,
        builderRunner: makeBuilderRunner(),
      },
    );
    expect(result.outcome).toBe('escalate');
    // Called 1 (initial) + retryLimit (2) = 3 times total
    expect(composerRunner).toHaveBeenCalledTimes(3);
  });

  it('FR-8: retries builder on schema-invalid response and escalates after retryLimit', async () => {
    const builderRunner = vi.fn().mockResolvedValue(42); // not a string
    const result = await runOrchestrator(
      { taskId: 'task-003', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner: makeContextRunner(),
        composerRunner: makeComposerRunner(),
        builderRunner,
      },
    );
    expect(result.outcome).toBe('escalate');
    expect(builderRunner).toHaveBeenCalledTimes(3);
  });

  it('FR-8: escalates immediately on context agent runtime error (no retry)', async () => {
    const contextRunner = vi.fn().mockRejectedValue(new Error('context failed'));
    const composerRunner = makeComposerRunner();
    const result = await runOrchestrator(
      { taskId: 'task-004', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner,
        composerRunner,
        builderRunner: makeBuilderRunner(),
      },
    );
    expect(result.outcome).toBe('escalate');
    expect(composerRunner).not.toHaveBeenCalled();
  });

  it('FR-8: succeeds on second attempt when composer returns valid spec after one failure', async () => {
    const composerRunner = vi
      .fn()
      .mockResolvedValueOnce({ bad: 'payload' })
      .mockResolvedValueOnce(mockScreenSpec);
    const result = await runOrchestrator(
      { taskId: 'task-005', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner: makeContextRunner(),
        composerRunner,
        builderRunner: makeBuilderRunner(),
      },
    );
    expect(result.outcome).toBe('pass');
    expect(composerRunner).toHaveBeenCalledTimes(2);
  });

  it('FR-8: escalates when cost cap is exceeded', async () => {
    const expensiveComposer = vi.fn().mockImplementation(() => {
      throw Object.assign(new Error('cost cap exceeded'), { code: 'COST_CAP' });
    });
    const result = await runOrchestrator(
      { taskId: 'task-006', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      {
        contextRunner: makeContextRunner(),
        composerRunner: expensiveComposer,
        builderRunner: makeBuilderRunner(),
      },
    );
    expect(result.outcome).toBe('escalate');
  });
});
