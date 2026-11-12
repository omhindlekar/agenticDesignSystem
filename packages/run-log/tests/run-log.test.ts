import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RunLogWriter } from '../src/index.js';
import type { RunLogEntry } from '@ads/schemas';

const makeEntry = (overrides: Partial<RunLogEntry> = {}): RunLogEntry => ({
  runId: 'run-test-001',
  agent: 'builder',
  inputHash: 'sha256:aabbcc',
  outputHash: 'sha256:ddeeff',
  toolsUsed: ['read_file'],
  ruleIdsConsulted: ['DS-001'],
  durationMs: 500,
  outcome: 'pass',
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('FR-19 RunLogWriter', () => {
  let tmpDir: string;
  let writer: RunLogWriter;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), 'ads-run-log-'));
    writer = new RunLogWriter(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('FR-19: writes an entry and reads it back', async () => {
    const entry = makeEntry();
    await writer.write(entry);
    const entries = await writer.read(entry.runId);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject(entry);
  });

  it('FR-19: writes multiple entries for the same run', async () => {
    const e1 = makeEntry({ agent: 'composer', outcome: 'pass' });
    const e2 = makeEntry({ agent: 'builder', outcome: 'fail' });
    await writer.write(e1);
    await writer.write(e2);
    const entries = await writer.read(e1.runId);
    expect(entries).toHaveLength(2);
  });

  it('FR-19: returns empty array for unknown runId', async () => {
    const entries = await writer.read('run-does-not-exist');
    expect(entries).toHaveLength(0);
  });

  it('FR-19: input hash round-trips unchanged (determinism check)', async () => {
    const entry = makeEntry({ inputHash: 'sha256:fixed-hash' });
    await writer.write(entry);
    const [read] = await writer.read(entry.runId);
    expect(read?.inputHash).toBe('sha256:fixed-hash');
  });

  it('FR-19: hashContent produces consistent sha256 for the same input', () => {
    const h1 = RunLogWriter.hashContent('{"taskId":"t1"}');
    const h2 = RunLogWriter.hashContent('{"taskId":"t1"}');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('FR-19: hashContent produces different hashes for different inputs', () => {
    const h1 = RunLogWriter.hashContent('{"taskId":"t1"}');
    const h2 = RunLogWriter.hashContent('{"taskId":"t2"}');
    expect(h1).not.toBe(h2);
  });

  it('FR-19: validates entry against schema before writing', async () => {
    const invalid = { runId: '', agent: 'builder' } as unknown as RunLogEntry;
    await expect(writer.write(invalid)).rejects.toThrow();
  });
});
