import { describe, it, expect } from 'vitest';
import { HandoffMessageSchema } from '../src/handoff-message.js';

const validHandoff = {
  runId: 'run-abc123',
  from: 'composer',
  to: 'builder',
  schemaVersion: '1.0.0',
  payload: { taskId: 'task-001', tree: {} },
  attempt: 1,
  timestamp: '2026-11-13T10:00:00.000Z',
};

describe('FR-8 HandoffMessageSchema', () => {
  it('FR-8: accepts a valid handoff message', () => {
    expect(HandoffMessageSchema.safeParse(validHandoff).success).toBe(true);
  });

  it('FR-8: rejects attempt less than 1', () => {
    expect(HandoffMessageSchema.safeParse({ ...validHandoff, attempt: 0 }).success).toBe(false);
  });

  it('FR-8: rejects a non-ISO-8601 timestamp', () => {
    expect(HandoffMessageSchema.safeParse({ ...validHandoff, timestamp: 'not-a-date' }).success).toBe(false);
  });

  it('FR-8: rejects a message missing runId', () => {
    const { runId: _r, ...noRun } = validHandoff;
    expect(HandoffMessageSchema.safeParse(noRun).success).toBe(false);
  });

  it('FR-8: accepts any payload shape (unknown type)', () => {
    expect(HandoffMessageSchema.safeParse({ ...validHandoff, payload: [1, 2, 3] }).success).toBe(true);
    expect(HandoffMessageSchema.safeParse({ ...validHandoff, payload: 'string-payload' }).success).toBe(true);
  });

  it('FR-8: rejects attempt > retryLimit (3) with max 3 enforcement', () => {
    expect(HandoffMessageSchema.safeParse({ ...validHandoff, attempt: 4 }).success).toBe(false);
  });
});
