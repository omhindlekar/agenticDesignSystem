import { describe, it, expect } from 'vitest';
import { PipelineSchema } from '../src/pipeline.js';

const pipeline = {
  schemaVersion: '1.1.0',
  steps: [
    { agent: 'context', output: 'context-pack', modelBacked: false },
    { agent: 'composer', output: 'screen-spec', modelBacked: true, retry: { on: 'schema' } },
    { agent: 'builder', output: 'tsx', modelBacked: true, retry: { on: 'schema' } },
    { agent: 'qa', output: 'qa-report', modelBacked: false, retry: { on: 'qa-fail', feedbackTo: 'builder' } },
  ],
};

describe('NFR-10 PipelineSchema', () => {
  it('NFR-10: accepts the context → composer → builder → qa pipeline', () => {
    expect(PipelineSchema.safeParse(pipeline).success).toBe(true);
  });
  it('NFR-10: feedback can only go to an earlier step', () => {
    const bad = structuredClone(pipeline);
    bad.steps[3]!.retry = { on: 'qa-fail', feedbackTo: 'docs' };
    expect(PipelineSchema.safeParse(bad).success).toBe(false);
  });
  it('NFR-10: each agent runs once', () => {
    const bad = structuredClone(pipeline);
    bad.steps.push({ agent: 'qa', output: 'qa-report', modelBacked: false });
    expect(PipelineSchema.safeParse(bad).success).toBe(false);
  });
  it('NFR-10: the repo pipeline config is valid', async () => {
    const { readFileSync } = await import('node:fs');
    const { join, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
    expect(PipelineSchema.parse(JSON.parse(readFileSync(join(root, 'config', 'pipeline.json'), 'utf8')))).toEqual(
      pipeline,
    );
  });
});
