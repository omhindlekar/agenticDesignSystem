import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBuilderPrompt, parseBuilderResponse, validateBuilderOutput, typeCheckBuilderOutput } from '../tools.js';
import type { BuilderInput } from '../schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');

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

  it('FR-7: prompt includes previousError when provided', () => {
    const prompt = buildBuilderPrompt(builderInput, 'token lint: hex color at line 5');
    expect(prompt).toContain('token lint: hex color at line 5');
  });

  it('FR-7: prompt without previousError contains no previous-attempt section', () => {
    const prompt = buildBuilderPrompt(builderInput);
    expect(prompt).not.toContain('PREVIOUS ATTEMPT FAILED');
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

describe('FR-7: Builder output validation — token lint via checks/token-lint', () => {
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

  it('FR-7: violation objects come from checks/token-lint (have file, line, column, pattern, ruleId)', () => {
    const result = validateBuilderOutput(dirtyTsx);
    const v = result.violations[0]!;
    expect(typeof v.file).toBe('string');
    expect(typeof v.line).toBe('number');
    expect(typeof v.column).toBe('number');
    expect(v.ruleId).toBe('FR-1');
  });
});

describe('FR-7: Builder output validation — TypeScript type check', () => {
  it('FR-7: clean React TSX passes TypeScript type check', () => {
    const result = typeCheckBuilderOutput(cleanTsx, repoRoot);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('FR-7: TSX with a syntax error fails TypeScript type check', () => {
    const badTsx = `export function Screen() { return <div props={unclosed; }; }`;
    const result = typeCheckBuilderOutput(badTsx, repoRoot);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('FR-7: Builder integration (requires a live provider)', () => {
  // Runs when MODEL_PROVIDER=api (ANTHROPIC_API_KEY set) or MODEL_PROVIDER=claude-cli
  const hasLiveProvider =
    !!process.env['ANTHROPIC_API_KEY'] || process.env['MODEL_PROVIDER'] === 'claude-cli';

  it.skipIf(!hasLiveProvider)('FR-7: runBuilder returns TSX that passes token lint and type check', async () => {
    const { runBuilder } = await import('../index.js');
    const output = await runBuilder(builderInput, undefined, repoRoot);
    expect(output.tsx).toMatch(/export (default )?function/);
    const lintResult = validateBuilderOutput(output.tsx);
    expect(lintResult.valid).toBe(true);
    const typeResult = typeCheckBuilderOutput(output.tsx, repoRoot);
    expect(typeResult.valid).toBe(true);
  });
});

describe('FR-7: Builder uses the real design-system components', () => {
  const apis = [
    {
      id: 'button',
      exportName: 'Button',
      props: [
        { name: 'label', type: 'string', required: true },
        { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", required: false },
      ],
    },
  ];

  it('FR-7: prompt tells the model to import components from @ads/components', () => {
    const prompt = buildBuilderPrompt(builderInput, undefined, apis);
    expect(prompt).toContain("from '@ads/components'");
    expect(prompt).toContain('Button');
  });

  it('FR-7: prompt lists each component prop with its type and whether it is required', () => {
    const prompt = buildBuilderPrompt(builderInput, undefined, apis);
    expect(prompt).toContain('label: string (required)');
    expect(prompt).toContain("variant?: 'primary' | 'secondary' | 'ghost' | 'danger'");
  });

  it('FR-7: loadComponentApis reads export names and props from component metadata', async () => {
    const { loadComponentApis } = await import('../tools.js');
    const loaded = loadComponentApis(repoRoot, ['button', 'input']);
    expect(loaded.map((a) => a.exportName)).toEqual(['Button', 'Input']);
    expect(loaded[0]?.props.find((p) => p.name === 'label')?.required).toBe(true);
  });

  it('FR-7: TSX importing @ads/components with valid props passes type check', () => {
    const tsx = `import { Button, Input } from '@ads/components';
export default function Screen() {
  return (
    <div style={{ gap: 'var(--space-component-gap-md)' }}>
      <Input label="Email" type="email" />
      <Button label="Save" variant="primary" />
    </div>
  );
}`;
    const result = typeCheckBuilderOutput(tsx, repoRoot);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('FR-7: TSX using a design-system component with a wrong prop fails type check', () => {
    const tsx = `import { Button } from '@ads/components';
export default function Screen() {
  return <Button label="Save" variant="huge" />;
}`;
    expect(typeCheckBuilderOutput(tsx, repoRoot).valid).toBe(false);
  });

  it('FR-7: TSX missing a required prop fails type check', () => {
    const tsx = `import { Button } from '@ads/components';
export default function Screen() {
  return <Button variant="primary" />;
}`;
    expect(typeCheckBuilderOutput(tsx, repoRoot).valid).toBe(false);
  });
});
