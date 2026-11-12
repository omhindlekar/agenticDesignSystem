import { describe, it, expect } from 'vitest';
import { RunLogEntrySchema } from '../src/run-log-entry.js';

const validEntry = {
  runId: 'run-abc123',
  agent: 'builder',
  inputHash: 'sha256:abc123def456',
  outputHash: 'sha256:789ghi012jkl',
  toolsUsed: ['read_file', 'write_file'],
  ruleIdsConsulted: ['DS-001', 'DS-002'],
  durationMs: 1234,
  outcome: 'pass',
  timestamp: '2026-11-13T10:00:00.000Z',
  costUsd: 0.0023,
};

describe('FR-19 RunLogEntrySchema', () => {
  it('FR-19: accepts a valid run log entry', () => {
    expect(RunLogEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it('FR-19: accepts an entry without costUsd (optional)', () => {
    const { costUsd: _c, ...noCost } = validEntry;
    expect(RunLogEntrySchema.safeParse(noCost).success).toBe(true);
  });

  it('FR-19: rejects an unknown outcome', () => {
    expect(RunLogEntrySchema.safeParse({ ...validEntry, outcome: 'maybe' }).success).toBe(false);
  });

  it('FR-19: rejects a negative durationMs', () => {
    expect(RunLogEntrySchema.safeParse({ ...validEntry, durationMs: -1 }).success).toBe(false);
  });

  it('FR-19: rejects a non-ISO-8601 timestamp', () => {
    expect(RunLogEntrySchema.safeParse({ ...validEntry, timestamp: '13/11/2026' }).success).toBe(false);
  });

  it('FR-19: accepts all valid outcome values', () => {
    for (const outcome of ['pass', 'fail', 'escalate', 'retry'] as const) {
      expect(RunLogEntrySchema.safeParse({ ...validEntry, outcome }).success).toBe(true);
    }
  });
});
