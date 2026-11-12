import { describe, it, expect } from 'vitest';
import { collectMetrics, type BaselineMetrics } from '../index.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

describe('Phase-0-exit-criteria: baseline metrics collection', () => {
  it('Phase-0: collectMetrics returns a valid BaselineMetrics object', async () => {
    const metrics = await collectMetrics(root);
    expect(metrics).toMatchObject<Partial<BaselineMetrics>>({
      tokenCount: expect.any(Number),
      primitiveTokenCount: expect.any(Number),
      semanticTokenCount: expect.any(Number),
      ruleCount: expect.any(Number),
      componentCount: expect.any(Number),
      lintViolations: expect.any(Number),
      collectedAt: expect.any(String),
      phase: '0',
    });
  });

  it('Phase-0: tokenCount equals primitiveTokenCount + semanticTokenCount', async () => {
    const metrics = await collectMetrics(root);
    expect(metrics.tokenCount).toBe(metrics.primitiveTokenCount + metrics.semanticTokenCount);
  });

  it('Phase-0: primitiveTokenCount is greater than 0', async () => {
    const metrics = await collectMetrics(root);
    expect(metrics.primitiveTokenCount).toBeGreaterThan(0);
  });

  it('Phase-0: semanticTokenCount is greater than 0', async () => {
    const metrics = await collectMetrics(root);
    expect(metrics.semanticTokenCount).toBeGreaterThan(0);
  });

  it('Phase-0: collectedAt is a valid ISO-8601 timestamp', async () => {
    const metrics = await collectMetrics(root);
    expect(() => new Date(metrics.collectedAt).toISOString()).not.toThrow();
  });

  it('Phase-0: lintViolations is 0 for the phase-0 components directory (empty)', async () => {
    const metrics = await collectMetrics(root);
    expect(metrics.lintViolations).toBe(0);
  });
});
