import { describe, it, expect } from 'vitest';
import { buildBuilderPrompt, parseBuilderResponse, validateBuilderOutput } from '../tools.js';
import type { BuilderInput } from '../schema.js';

const builderInput: BuilderInput = {
  taskId: 'task-001',
  spec: {
    taskId: 'task-001',
    tree: {
      component: 'button',
      props: { label: 'Submit', variant: 'primary' },
      tokenRefs: ['color-interactive-default', 'space-component-padding-md'],
      states: ['default'],
    },
    statesCovered: ['default'],
  },
  contextPack: {
    taskId: 'task-001',
    tokenIds: [
      { id: 'color-interactive-default', reason: 'used by button' },
      { id: 'space-component-padding-md', reason: 'used by button' },
    ],
    componentIds: [{ id: 'button', reason: 'score 2' }],
    ruleIds: [],
  },
};

const cleanTsx = `
import React from 'react';

export function Screen() {
  return (
    <button
      style={{
        background: 'var(--color-interactive-default)',
        padding: 'var(--space-component-padding-md)',
      }}
    >
      Submit
    </button>
  );
}
`.trim();

const dirtyTsx = `
import React from 'react';

export function Screen() {
  return (
    <button style={{ background: '#3b82f6', padding: '16px' }}>
      Submit
    </button>
  );
}
`.trim();

describe('FR-7: Builder prompt building', () => {
  it('FR-7: prompt includes component IDs from context pack', () => {
    const prompt = buildBuilderPrompt(builderInput);
    expect(prompt).toContain('button');
  });

  it('FR-7: prompt includes token IDs from context pack', () => {
    const prompt = buildBuilderPrompt(builderInput);
    expect(prompt).toContain('color-interactive-default');
  });

  it('FR-7: prompt instructs use of CSS custom properties', () => {
    const prompt = buildBuilderPrompt(builderInput);
    expect(prompt).toMatch(/var\(--/);
  });

  it('FR-7: prompt forbids hardcoded values', () => {
    const prompt = buildBuilderPrompt(builderInput);
    expect(prompt.toLowerCase()).toMatch(/hardcod|literal|hex|rgb/);
  });
});

describe('FR-7: Builder response parsing', () => {
  it('FR-7: extracts TSX from plain response', () => {
    const tsx = parseBuilderResponse(cleanTsx);
    expect(tsx).toContain('export function Screen');
  });

  it('FR-7: extracts TSX from markdown tsx code fence', () => {
    const fenced = `\`\`\`tsx\n${cleanTsx}\n\`\`\``;
    const tsx = parseBuilderResponse(fenced);
    expect(tsx).toContain('export function Screen');
  });

  it('FR-7: extracts TSX from markdown ts code fence', () => {
    const fenced = `\`\`\`ts\n${cleanTsx}\n\`\`\``;
    const tsx = parseBuilderResponse(fenced);
    expect(tsx).toContain('export function Screen');
  });
});

describe('FR-7: Builder output validation — token lint', () => {
  it('FR-7: clean TSX using CSS vars passes token lint', () => {
    const result = validateBuilderOutput(cleanTsx);
    expect(result.violations).toHaveLength(0);
    expect(result.valid).toBe(true);
  });

  it('FR-7: TSX with hardcoded hex color fails token lint', () => {
    const result = validateBuilderOutput(dirtyTsx);
    expect(result.valid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('FR-7: TSX with hardcoded px spacing fails token lint', () => {
    const spaceTsx = `export function S() { return <div style={{ padding: '16px' }} /> }`;
    const result = validateBuilderOutput(spaceTsx);
    expect(result.valid).toBe(false);
  });
});

describe('FR-7: Builder integration (requires ANTHROPIC_API_KEY)', () => {
  const hasKey = !!process.env['ANTHROPIC_API_KEY'];

  it.skipIf(!hasKey)('FR-7: runBuilder returns TSX that passes token lint', async () => {
    const { runBuilder } = await import('../index.js');
    const output = await runBuilder(builderInput);
    expect(output.tsx).toContain('export function');
    const result = validateBuilderOutput(output.tsx);
    expect(result.valid).toBe(true);
  });
});
