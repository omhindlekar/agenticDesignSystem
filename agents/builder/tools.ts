import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { lintString } from '../../checks/token-lint/index.js';
import type { LintViolation } from '../../checks/token-lint/index.js';
import type { BuilderInput } from './schema.js';

export function buildBuilderPrompt(input: BuilderInput, previousError?: string): string {
  const componentList = input.contextPack.componentIds.map((c) => `- ${c.id}`).join('\n');
  const tokenList = input.contextPack.tokenIds.map((t) => `- ${t.id}`).join('\n');
  const specJson = JSON.stringify(input.spec, null, 2);

  const retrySection = previousError
    ? `\nPREVIOUS ATTEMPT FAILED — fix this error before returning:\n${previousError}\n`
    : '';

  return `You are a UI builder for a design system. Given a screen specification, generate a single React TSX file.

SCREEN SPECIFICATION:
${specJson}
${retrySection}
APPROVED COMPONENTS (import and use only these):
${componentList}

APPROVED TOKENS — use as CSS custom properties only, e.g. var(--color-interactive-default):
${tokenList}

OUTPUT REQUIREMENTS:
- Return a single valid TSX file. You may wrap it in a \`\`\`tsx code fence.
- Export one named function \`Screen\` as the default React component.
- Use \`style={{ ... }}\` with CSS custom properties: \`var(--<token-id>)\`.
- Do NOT hardcode hex colours, rgb(), rgba(), literal px values for spacing or border-radius.
  Every colour, spacing, and radius value MUST be a var(--token-id) reference.
- Import React at the top: \`import React from 'react';\`
- Do not import anything outside of React and the approved component list.
- Keep the implementation minimal and faithful to the spec.`;
}

export function parseBuilderResponse(raw: string): string {
  // Strip optional markdown code fence (tsx, ts, or plain)
  return raw
    .replace(/^```(?:tsx?|javascript|js)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim();
}

export interface ValidationResult {
  valid: boolean;
  violations: LintViolation[];
}

export function validateBuilderOutput(tsx: string): ValidationResult {
  const violations = lintString(tsx, '<generated>');
  return { valid: violations.length === 0, violations };
}

export interface TypeCheckResult {
  valid: boolean;
  errors: string[];
}

export function typeCheckBuilderOutput(tsx: string, repoRoot: string): TypeCheckResult {
  const checkDir = join(repoRoot, '.ads-typecheck-tmp');

  mkdirSync(checkDir, { recursive: true });

  try {
    writeFileSync(join(checkDir, 'screen.tsx'), tsx, 'utf8');
    writeFileSync(
      join(checkDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM'],
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          noEmit: true,
          strict: false,
          moduleResolution: 'node',
        },
        include: ['screen.tsx'],
      }),
      'utf8',
    );

    const tscPath = join(repoRoot, 'node_modules', '.bin', 'tsc');
    const proc = spawnSync(tscPath, ['--project', 'tsconfig.json'], {
      encoding: 'utf8',
      cwd: checkDir,
    });

    if (proc.status === 0) return { valid: true, errors: [] };

    const output = (proc.stdout ?? '') + (proc.stderr ?? '');
    const errors = output.split('\n').filter(Boolean);
    return { valid: false, errors };
  } finally {
    try {
      rmSync(checkDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
}
