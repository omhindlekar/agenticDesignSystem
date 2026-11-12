import type { BuilderInput } from './schema.js';
import type { LintViolation } from '../../checks/token-lint/index.js';

export function buildBuilderPrompt(input: BuilderInput): string {
  const componentList = input.contextPack.componentIds.map((c) => `- ${c.id}`).join('\n');
  const tokenList = input.contextPack.tokenIds.map((t) => `- ${t.id}`).join('\n');
  const specJson = JSON.stringify(input.spec, null, 2);

  return `You are a UI builder for a design system. Given a screen specification, generate a single React TSX file.

SCREEN SPECIFICATION:
${specJson}

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

type LintViolationInMemory = Omit<LintViolation, 'file'>;

interface ValidationResult {
  valid: boolean;
  violations: LintViolationInMemory[];
}

const LINT_RULES = [
  {
    pattern: 'hex-color',
    regex: /(?<!var\([^)]*)'?"?#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
  },
  {
    pattern: 'rgb-color',
    regex: /\brgba?\s*\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+/g,
  },
  {
    pattern: 'hsl-color',
    regex: /\bhsla?\s*\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%/g,
  },
  {
    pattern: 'hardcoded-spacing',
    regex: /(?:margin|padding|gap)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
  {
    pattern: 'hardcoded-radius',
    regex: /(?:border-?[Rr]adius)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
] as const;

export function validateBuilderOutput(tsx: string): ValidationResult {
  const lines = tsx.split('\n');
  const violations: LintViolationInMemory[] = [];

  for (const { pattern, regex } of LINT_RULES) {
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx] ?? '';
      if (/^\s*\/\//.test(line)) continue;

      const localRegex = new RegExp(regex.source, regex.flags);
      let match: RegExpExecArray | null;
      while ((match = localRegex.exec(line)) !== null) {
        violations.push({
          line: lineIdx + 1,
          column: match.index + 1,
          pattern,
          match: match[0],
          ruleId: 'FR-1',
        });
      }
    }
  }

  return { valid: violations.length === 0, violations };
}
