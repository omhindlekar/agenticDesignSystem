import { readFileSync, existsSync } from 'node:fs';
import { guardedFs } from '../../packages/permissions/src/index.js';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { lintString } from '../../checks/token-lint/index.js';
import type { LintViolation } from '../../checks/token-lint/index.js';
import type { BuilderInput } from './schema.js';

/** Import path for design-system components in generated code. */
export const COMPONENTS_IMPORT = '@ads/components';

export interface ComponentApi {
  id: string;
  exportName: string;
  props: Array<{ name: string; type: string; required: boolean }>;
}

function exportNameFor(id: string): string {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Reads the public API of each component from its metadata (components/<id>/<id>.meta.json).
 * Metadata is kept in sync with the code by the FR-3 parity test.
 */
export function loadComponentApis(repoRoot: string, ids: string[]): ComponentApi[] {
  const apis: ComponentApi[] = [];
  for (const id of ids) {
    const metaPath = join(repoRoot, 'components', id, `${id}.meta.json`);
    if (!existsSync(metaPath)) continue;
    const meta = JSON.parse(readFileSync(metaPath, 'utf8')) as {
      props: Array<{ name: string; type: string; required: boolean }>;
    };
    apis.push({
      id,
      exportName: exportNameFor(id),
      props: meta.props.map(({ name, type, required }) => ({ name, type, required })),
    });
  }
  return apis;
}

function describeApis(apis: ComponentApi[]): string {
  return apis
    .map((api) => {
      const props = api.props
        .map((p) => (p.required ? `    ${p.name}: ${p.type} (required)` : `    ${p.name}?: ${p.type}`))
        .join('\n');
      return `- ${api.exportName} (spec id "${api.id}")\n${props}`;
    })
    .join('\n');
}

export function buildBuilderPrompt(
  input: BuilderInput,
  previousError?: string,
  componentApis: ComponentApi[] = [],
): string {
  const componentList =
    componentApis.length > 0
      ? describeApis(componentApis)
      : input.contextPack.componentIds.map((c) => `- ${c.id}`).join('\n');
  const importNames = componentApis.map((a) => a.exportName).join(', ') || '<Component>';
  const tokenList = input.contextPack.tokenIds.map((t) => `- ${t.id}`).join('\n');
  const specJson = JSON.stringify(input.spec, null, 2);

  const retrySection = previousError
    ? `\nPREVIOUS ATTEMPT FAILED — fix this error before returning:\n${previousError}\n`
    : '';

  return `You are a UI builder for a design system. Given a screen specification, generate a single React TSX file.

SCREEN SPECIFICATION:
${specJson}
${retrySection}
APPROVED COMPONENTS (import and use only these, with exactly these props):
${componentList}

Import them from the design system package, for example:
import { ${importNames} } from '${COMPONENTS_IMPORT}';

APPROVED TOKENS — use as CSS custom properties only, e.g. var(--color-interactive-default):
${tokenList}

OUTPUT REQUIREMENTS:
- Return a single valid TSX file. You may wrap it in a \`\`\`tsx code fence.
- Default-export one function component: \`export default function Screen() { ... }\`.
- Render every component in the spec with the matching design-system component. Never re-create
  a button, input, select, checkbox, card or modal with plain HTML.
- Use plain elements only for layout and headings, styled with \`style={{ ... }}\` and CSS custom
  properties: \`var(--<token-id>)\`.
- Do NOT hardcode hex colours, rgb(), rgba(), literal px values for spacing or border-radius.
  Every colour, spacing, and radius value MUST be a var(--token-id) reference.
- The JSX runtime is automatic; you do not need to import React. Import hooks from 'react' if used.
- Do not import anything other than 'react' and '${COMPONENTS_IMPORT}'.
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

export function typeCheckBuilderOutput(tsx: string, root: string): TypeCheckResult {
  // tsc runs with the scratch folder as cwd, so every path it gets must be absolute.
  const repoRoot = resolve(root);
  // A unique directory per call: parallel runs (test workers, concurrent generates)
  // must not overwrite or delete each other's files. It lives under repoRoot so
  // 'react' and the components resolve from the repo's node_modules.
  const fs = guardedFs('builder', repoRoot);
  const checkDir = fs.mkdtemp(join(repoRoot, '.ads-typecheck-tmp-'));

  try {
    fs.writeFile(join(checkDir, 'screen.tsx'), tsx);
    fs.writeFile(
      join(checkDir, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          noEmit: true,
          strict: true,
          types: [],
          // Resolve generated imports to the real component source, so props are checked.
          paths: { [COMPONENTS_IMPORT]: [join(repoRoot, 'components', 'index.ts')] },
        },
        include: ['screen.tsx'],
      }),
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
      fs.rm(checkDir);
    } catch {
      // best-effort cleanup
    }
  }
}
