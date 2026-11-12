import { describe, it, expect, vi } from 'vitest';
import { runOrchestrator } from '../tools.js';
import type { AgentStepResult, OrchestratorDeps } from '../tools.js';
import type { ContextPack } from '../../../packages/schemas/src/context-pack.js';
import type { ScreenSpec } from '../../../packages/schemas/src/screen-spec.js';
import type { RunLogEntry } from '../../../packages/schemas/src/run-log-entry.js';

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

const validTsx = `import React from 'react';
export function Screen() {
  return <button style={{ background: 'var(--color-background-surface)' }}>Submit</button>;
}`;

function makeContextRunner() {
  return vi.fn().mockResolvedValue(mockContextPack);
}

function makeComposerRunner(result: unknown = mockScreenSpec, costUsd = 0.01): () => Promise<AgentStepResult> {
  return vi.fn().mockResolvedValue({ result, costUsd });
}

function makeBuilderRunner(result: unknown = validTsx, costUsd = 0.02): () => Promise<AgentStepResult> {
  return vi.fn().mockResolvedValue({ result, costUsd });
}

function makeLogWriter() {
  const entries: RunLogEntry[] = [];
  return {
    write: vi.fn().mockImplementation(async (entry: RunLogEntry) => {
      entries.push(entry);
    }),
    entries,
  };
}

function makeDeps(overrides: Partial<OrchestratorDeps> = {}): OrchestratorDeps {
  return {
    contextRunner: makeContextRunner(),
    composerRunner: makeComposerRunner(),
    builderRunner: makeBuilderRunner(),
    config: { retryLimit: 2, costCapPerRunUsd: 1.0 },
    ...overrides,
  };
}

describe('FR-8: Orchestrator schema validation and retry', () => {
  it('FR-8: returns pass when all agents succeed on first attempt', async () => {
    const result = await runOrchestrator(
      { taskId: 'task-001', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps(),
    );
    expect(result.outcome).toBe('pass');
    expect(result.tsx).toBe(validTsx);
  });

  it('FR-8: retries composer on schema-invalid response and escalates after retryLimit', async () => {
    const composerRunner = vi.fn().mockResolvedValue({ result: { not: 'a valid screen spec' }, costUsd: 0.01 });
    const result = await runOrchestrator(
      { taskId: 'task-002', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ composerRunner }),
    );
    expect(result.outcome).toBe('escalate');
    // Called 1 (initial) + retryLimit (2) = 3 times total
    expect(composerRunner).toHaveBeenCalledTimes(3);
  });

  it('FR-8: retries builder on schema-invalid response and escalates after retryLimit', async () => {
    const builderRunner = vi.fn().mockResolvedValue({ result: 42, costUsd: 0.02 }); // not a string
    const result = await runOrchestrator(
      { taskId: 'task-003', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ builderRunner }),
    );
    expect(result.outcome).toBe('escalate');
    expect(builderRunner).toHaveBeenCalledTimes(3);
  });

  it('FR-8: escalates immediately on context agent runtime error (no retry)', async () => {
    const contextRunner = vi.fn().mockRejectedValue(new Error('context failed'));
    const composerRunner = makeComposerRunner();
    const result = await runOrchestrator(
      { taskId: 'task-004', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ contextRunner, composerRunner }),
    );
    expect(result.outcome).toBe('escalate');
    expect(composerRunner).not.toHaveBeenCalled();
  });

  it('FR-8: succeeds on second attempt when composer returns valid spec after one failure', async () => {
    const composerRunner = vi
      .fn()
      .mockResolvedValueOnce({ result: { bad: 'payload' }, costUsd: 0.01 })
      .mockResolvedValueOnce({ result: mockScreenSpec, costUsd: 0.01 });
    const result = await runOrchestrator(
      { taskId: 'task-005', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ composerRunner }),
    );
    expect(result.outcome).toBe('pass');
    expect(composerRunner).toHaveBeenCalledTimes(2);
  });

  it('FR-8: escalates when composer throws a runtime error', async () => {
    const composerRunner = vi.fn().mockRejectedValue(new Error('API error'));
    const result = await runOrchestrator(
      { taskId: 'task-006', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ composerRunner }),
    );
    expect(result.outcome).toBe('escalate');
  });
});

describe('FR-8: Orchestrator retry passes previous error to agent', () => {
  it('FR-8: composer receives previousError on second attempt', async () => {
    const composerRunner = vi
      .fn()
      .mockResolvedValueOnce({ result: { bad: 'payload' }, costUsd: 0.01 })
      .mockResolvedValueOnce({ result: mockScreenSpec, costUsd: 0.01 });

    await runOrchestrator(
      { taskId: 'task-007', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ composerRunner }),
    );

    const firstCall = composerRunner.mock.calls[0] as [{ previousError?: string }];
    const secondCall = composerRunner.mock.calls[1] as [{ previousError?: string }];
    expect(firstCall[0]?.previousError).toBeUndefined();
    expect(secondCall[0]?.previousError).toBeTruthy();
  });

  it('FR-8: builder receives previousError on second attempt', async () => {
    const builderRunner = vi
      .fn()
      .mockResolvedValueOnce({ result: 42, costUsd: 0.02 }) // invalid: not string
      .mockResolvedValueOnce({ result: validTsx, costUsd: 0.02 });

    await runOrchestrator(
      { taskId: 'task-008', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ builderRunner }),
    );

    const secondCall = builderRunner.mock.calls[1] as [{ previousError?: string }];
    expect(secondCall[0]?.previousError).toBeTruthy();
  });
});

describe('FR-8: Orchestrator run log and cost tracking', () => {
  it('FR-8: writes a RunLogEntry for each agent step', async () => {
    const logWriter = makeLogWriter();
    await runOrchestrator(
      { taskId: 'task-009', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ logWriter }),
    );
    // Expect at least entries for composer and builder (context has no LLM cost)
    expect(logWriter.write).toHaveBeenCalled();
    const agents = logWriter.entries.map((e) => e.agent);
    expect(agents).toContain('composer');
    expect(agents).toContain('builder');
  });

  it('FR-8: RunLogEntry for composer step includes costUsd', async () => {
    const logWriter = makeLogWriter();
    await runOrchestrator(
      { taskId: 'task-010', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ logWriter, composerRunner: makeComposerRunner(mockScreenSpec, 0.05) }),
    );
    const composerEntry = logWriter.entries.find((e) => e.agent === 'composer');
    expect(composerEntry?.costUsd).toBe(0.05);
  });

  it('FR-8: escalates when a single step cost exceeds the per-run cap', async () => {
    // Composer costs more than the entire cap
    const composerRunner = makeComposerRunner(mockScreenSpec, 2.0);
    const result = await runOrchestrator(
      { taskId: 'task-011', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 1.0 }, composerRunner }),
    );
    expect(result.outcome).toBe('escalate');
    expect(result.error).toMatch(/cost cap/i);
  });

  it('FR-8: escalates when cumulative cost across steps exceeds the cap', async () => {
    // Each step is under the cap individually but together they exceed it
    const composerRunner = makeComposerRunner(mockScreenSpec, 0.6);
    const builderRunner = makeBuilderRunner(validTsx, 0.6);
    const result = await runOrchestrator(
      { taskId: 'task-012', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({
        config: { retryLimit: 2, costCapPerRunUsd: 1.0 },
        composerRunner,
        builderRunner,
      }),
    );
    expect(result.outcome).toBe('escalate');
    expect(result.error).toMatch(/cost cap/i);
  });

  it('FR-8: RunLogEntry for escalated run has outcome escalate', async () => {
    const logWriter = makeLogWriter();
    const composerRunner = makeComposerRunner(mockScreenSpec, 2.0);
    await runOrchestrator(
      { taskId: 'task-013', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 1.0 }, composerRunner, logWriter }),
    );
    const escalateEntry = logWriter.entries.find((e) => e.outcome === 'escalate');
    expect(escalateEntry).toBeTruthy();
  });
});

// ─── NFR-11 fix-5: maxCallsPerRun enforcement ────────────────────────────────

describe('NFR-11 fix-5: Orchestrator maxCallsPerRun enforcement', () => {
  it('NFR-11: fix-5: escalates when total call count after composer >= maxCallsPerRun', async () => {
    // composer succeeds on first attempt (1 call), maxCallsPerRun = 1 → escalate before builder
    const result = await runOrchestrator(
      { taskId: 'task-014', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 100.0, maxCallsPerRun: 1 } }),
    );
    expect(result.outcome).toBe('escalate');
    expect(result.error).toMatch(/max calls/i);
  });

  it('NFR-11: fix-5: escalates when total call count after builder >= maxCallsPerRun', async () => {
    // composer = 1 call, builder = 1 call → total = 2; maxCallsPerRun = 2 → escalate after builder
    const result = await runOrchestrator(
      { taskId: 'task-015', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 100.0, maxCallsPerRun: 2 } }),
    );
    expect(result.outcome).toBe('escalate');
    expect(result.error).toMatch(/max calls/i);
  });

  it('NFR-11: fix-5: does not escalate when call count stays under maxCallsPerRun', async () => {
    // composer = 1 call, builder = 1 call → total = 2; maxCallsPerRun = 10 → pass
    const result = await runOrchestrator(
      { taskId: 'task-016', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 100.0, maxCallsPerRun: 10 } }),
    );
    expect(result.outcome).toBe('pass');
  });

  it('NFR-11: fix-5: retries count towards maxCallsPerRun total', async () => {
    // composer fails once then succeeds → 2 composer calls + 1 builder = 3; limit = 3 → escalate
    const composerRunner = vi
      .fn()
      .mockResolvedValueOnce({ result: { bad: 'payload' }, costUsd: 0 })
      .mockResolvedValueOnce({ result: mockScreenSpec, costUsd: 0 });
    const result = await runOrchestrator(
      { taskId: 'task-017', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({
        config: { retryLimit: 2, costCapPerRunUsd: 100.0, maxCallsPerRun: 3 },
        composerRunner,
      }),
    );
    expect(result.outcome).toBe('escalate');
    expect(result.error).toMatch(/max calls/i);
  });

  it('NFR-11: fix-5: escalation message mentions the call count and limit', async () => {
    const result = await runOrchestrator(
      { taskId: 'task-018', brief: 'A primary button', schemaVersion: SCHEMA_VERSION },
      makeDeps({ config: { retryLimit: 2, costCapPerRunUsd: 100.0, maxCallsPerRun: 1 } }),
    );
    expect(result.error).toMatch(/1/);
  });
});
