import { describe, it, expect } from 'vitest';
import { GoldenBriefSchema } from '../src/golden-brief.js';
import { PermissionsSchema } from '../src/permissions.js';
import { RunRecordSchema } from '../src/run-record.js';
import { RunLogEntrySchema } from '../src/run-log-entry.js';

describe('Golden set: GoldenBriefSchema', () => {
  const brief = {
    id: 'sign-in',
    screenType: 'authentication',
    brief: 'A sign-in card with email and password inputs and a primary sign-in button',
    expectedComponents: ['card', 'input', 'button'],
    forbiddenComponents: ['modal'],
    forbiddenPatterns: ['More than one contained button'],
    passCriteria: ['Every QA check passes'],
  };
  it('FR-7: accepts a reference brief with expected and forbidden components', () => {
    expect(GoldenBriefSchema.safeParse(brief).success).toBe(true);
  });
  it('FR-7: requires at least one expected component and one pass criterion', () => {
    expect(GoldenBriefSchema.safeParse({ ...brief, expectedComponents: [] }).success).toBe(false);
    expect(GoldenBriefSchema.safeParse({ ...brief, passCriteria: [] }).success).toBe(false);
  });
  it('FR-7: ids are kebab-case file names', () => {
    expect(GoldenBriefSchema.safeParse({ ...brief, id: 'Sign In' }).success).toBe(false);
  });
});

describe('NFR-7 PermissionsSchema', () => {
  it('NFR-7: accepts per-agent read, write and never lists', () => {
    const p = { agents: { qa: { read: ['generated/**'], write: ['runs/**'], never: ['evals/baselines/**'] } } };
    expect(PermissionsSchema.safeParse(p).success).toBe(true);
  });
});

describe('FR-19 RunRecordSchema and run log flags', () => {
  it('FR-19: a run record holds what replay needs and no secrets', () => {
    const r = {
      runId: 'r1',
      taskId: 't1',
      brief: 'A settings page',
      schemaVersion: '1.1.0',
      configHash: 'abc',
      provider: 'fake',
      model: 'claude-sonnet-4-6',
      flags: [],
      startedAt: new Date().toISOString(),
    };
    expect(RunRecordSchema.safeParse(r).success).toBe(true);
    expect(Object.keys(RunRecordSchema.shape)).not.toContain('apiKey');
  });
  it('FR-19: run log entries can carry flags', () => {
    const e = {
      runId: 'r1',
      agent: 'context',
      inputHash: 'a',
      outputHash: 'b',
      toolsUsed: [],
      ruleIdsConsulted: [],
      durationMs: 1,
      outcome: 'pass',
      timestamp: new Date().toISOString(),
      flags: ['instruction-in-brief'],
    };
    expect(RunLogEntrySchema.safeParse(e).success).toBe(true);
  });
});
