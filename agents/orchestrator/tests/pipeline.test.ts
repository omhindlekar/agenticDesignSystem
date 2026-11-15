import { describe, it, expect, vi } from 'vitest';
import { runOrchestrator, qaFeedback } from '../tools.js';
import type { AgentRunner, OrchestratorDeps } from '../tools.js';
import type { QAReport } from '../../../packages/schemas/src/qa-report.js';
import type { Pipeline } from '../../../packages/schemas/src/pipeline.js';
import type { RunLogEntry } from '../../../packages/schemas/src/run-log-entry.js';
import { HANDOFF_VALIDATORS } from '../../../packages/schemas/src/handoff-registry.js';

const input = { taskId: 't1', brief: 'A settings page', schemaVersion: '1.1.0' };
const pack = { taskId: 't1', tokenIds: [], componentIds: [{ id: 'button', reason: 'x' }], ruleIds: [] };
const spec = {
  taskId: 't1',
  tree: { component: 'button', props: { label: 'Save' }, tokenRefs: [], states: ['default'] },
  statesCovered: ['default'],
};
const passing: QAReport = {
  taskId: 't1',
  overallStatus: 'pass',
  checks: [{ checkName: 'token-lint', status: 'pass', failingRuleIds: [] }],
  findings: [],
};
const failing: QAReport = {
  taskId: 't1',
  overallStatus: 'fail',
  checks: [{ checkName: 'token-lint', status: 'fail', failingRuleIds: ['DS-T-001'], reason: '1 violation' }],
  findings: [
    {
      checkName: 'token-lint',
      ruleId: 'DS-T-001',
      message: 'Use a colour token instead of #fff.',
      evidence: 'screen.tsx:3',
    },
  ],
};

function deps(qa: AgentRunner, extra: Partial<OrchestratorDeps> = {}) {
  const entries: RunLogEntry[] = [];
  const builder = vi.fn().mockResolvedValue({ result: 'export function Screen() { return null; }', costUsd: 0 });
  const d: OrchestratorDeps = {
    agents: {
      context: vi.fn().mockResolvedValue({ result: pack, costUsd: 0 }),
      composer: vi.fn().mockResolvedValue({ result: spec, costUsd: 0 }),
      builder,
      qa,
      ...(extra.agents ?? {}),
    },
    config: { retryLimit: 2, costCapPerRunUsd: 1, maxCallsPerRun: 10 },
    logWriter: { write: async (e: RunLogEntry) => void entries.push(e) },
    ...(extra.pipeline ? { pipeline: extra.pipeline } : {}),
  };
  return { d, builder, entries };
}

describe('FR-9: QA is a pipeline step, and a failed report goes back to Builder', () => {
  it('FR-9: a first-pass run passes QA with no retries', async () => {
    const { d } = deps(vi.fn().mockResolvedValue({ result: passing, costUsd: 0 }));
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('pass');
    expect(r.firstPass).toBe(true);
    expect(r.qaReport?.overallStatus).toBe('pass');
    expect(r.attempts).toEqual({ composer: 1, builder: 1, qa: 1 });
  });

  it('FR-9, FR-20: QA findings are sent to Builder, which retries, and the run then passes (not first-pass)', async () => {
    const qa = vi
      .fn()
      .mockResolvedValueOnce({ result: failing, costUsd: 0 })
      .mockResolvedValueOnce({ result: passing, costUsd: 0 });
    const { d, builder } = deps(qa);
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('pass');
    expect(r.firstPass).toBe(false);
    expect(r.attempts).toEqual({ composer: 1, builder: 2, qa: 2 });
    const feedback = (builder.mock.calls[1]![0] as { previousError: string }).previousError;
    expect(feedback).toContain('DS-T-001');
    expect(feedback).toContain('Use a colour token instead of #fff.');
  });

  it('FR-9: a report that keeps failing ends the run as fail with the last report', async () => {
    const { d } = deps(vi.fn().mockResolvedValue({ result: failing, costUsd: 0 }));
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('fail');
    expect(r.tsx).toBeUndefined();
    expect(r.qaReport?.overallStatus).toBe('fail');
    expect(r.attempts['qa']).toBe(3);
    expect(r.error).toMatch(/Qa failed after 3 attempt/);
  });

  it('NFR-4: QA failures count towards the call cap through the Builder retries', async () => {
    const { d } = deps(vi.fn().mockResolvedValue({ result: failing, costUsd: 0 }));
    d.config = { retryLimit: 2, costCapPerRunUsd: 1, maxCallsPerRun: 3 };
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('escalate');
    expect(r.error).toMatch(/max calls/i);
  });

  it('FR-19: every step, QA included, is logged; a failed report logs its rule ids', async () => {
    const qa = vi
      .fn()
      .mockResolvedValueOnce({ result: failing, costUsd: 0 })
      .mockResolvedValueOnce({ result: passing, costUsd: 0 });
    const { d, entries } = deps(qa);
    await runOrchestrator(input, d);
    expect(entries.map((e) => `${e.agent}:${e.outcome}`)).toEqual([
      'context:pass',
      'composer:pass',
      'builder:pass',
      'qa:fail',
      'builder:pass',
      'qa:pass',
    ]);
    expect(entries[3]!.ruleIdsConsulted).toEqual(['DS-T-001']);
  });

  it('FR-20: QA feedback lists each failing rule with its one-sentence reason', () => {
    expect(qaFeedback(failing)).toBe(
      'QA failed. Fix these and return the whole file again.\ntoken-lint: 1 violation\n- DS-T-001: Use a colour token instead of #fff. [screen.tsx:3]',
    );
  });
});

describe('NFR-10: adding an agent needs a pipeline entry and a runner, not orchestrator code', () => {
  it('NFR-10: a new deterministic step runs from config alone', async () => {
    const pipeline: Pipeline = {
      schemaVersion: '1.1.0',
      steps: [
        { agent: 'context', output: 'context-pack', modelBacked: false },
        { agent: 'composer', output: 'screen-spec', modelBacked: true, retry: { on: 'schema' } },
        { agent: 'reviewer', output: 'screen-spec', modelBacked: false },
        { agent: 'builder', output: 'tsx', modelBacked: true, retry: { on: 'schema' } },
        { agent: 'qa', output: 'qa-report', modelBacked: false, retry: { on: 'qa-fail', feedbackTo: 'builder' } },
      ],
    };
    const reviewer = vi
      .fn()
      .mockImplementation(async ({ outputs }: { outputs: Record<string, unknown> }) => ({
        result: outputs['composer'],
        costUsd: 0,
      }));
    const { d } = deps(vi.fn().mockResolvedValue({ result: passing, costUsd: 0 }), { pipeline, agents: { reviewer } });
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('pass');
    expect(reviewer).toHaveBeenCalledOnce();
  });

  it('NFR-4: a step with no registered runner escalates with a clear error, never silently', async () => {
    const { d } = deps(vi.fn());
    d.agents = { ...d.agents };
    delete d.agents['qa'];
    const r = await runOrchestrator(input, d);
    expect(r.outcome).toBe('escalate');
    expect(r.error).toMatch(/no runner registered for "qa"/);
  });

  it('NFR-10: every handoff output named in config/pipeline.json has a validator', async () => {
    const { loadPipeline } = await import('../tools.js');
    const { join, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
    for (const s of loadPipeline(root).steps) expect(HANDOFF_VALIDATORS[s.output], s.output).toBeTypeOf('function');
  });
});

describe('Injection safety: flags from agents reach the result and the log', () => {
  it('FR-19: a flag raised by the context step is reported and logged', async () => {
    const { d, entries } = deps(vi.fn().mockResolvedValue({ result: passing, costUsd: 0 }), {
      agents: {
        context: vi
          .fn()
          .mockResolvedValue({
            result: pack,
            costUsd: 0,
            flags: ['instruction-in-brief: "ignore previous instructions"'],
          }),
      },
    });
    const r = await runOrchestrator(input, d);
    expect(r.flags).toEqual(['instruction-in-brief: "ignore previous instructions"']);
    expect(entries[0]!.flags).toEqual(r.flags);
  });
});
