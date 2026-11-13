import { readFile, readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { resolveSemanticTokens } from '../../scripts/build-tokens.js';
import { checkContrast } from './contrast.js';

export interface LintViolation {
  file: string;
  line: number;
  column: number;
  pattern: string;
  match: string;
  ruleId: 'FR-1';
  /** The rules.yaml rule this violation breaks, when there is one. */
  ruleRef?: string;
}

type LintRule = {
  pattern: string;
  regex: RegExp;
  ruleRef?: string;
};

/** Every rules.yaml ID token lint can cite. A test keeps this in step with rules.yaml. */
export const RULE_REFS = [
  'DS-T-001',
  'DS-T-002',
  'DS-T-003',
  'DS-T-004',
  'DS-L-001',
  'DS-L-002',
  'DS-L-003',
  'DS-A-001',
  'DS-A-006',
  'DS-T-005',
  'DS-M-001',
] as const;

const LINT_RULES: LintRule[] = [
  {
    pattern: 'hex-color',
    // #rgb, #rgba, #rrggbb, #rrggbbaa anywhere, including var() fallbacks,
    // and %23-encoded hex inside SVG data URIs.
    regex: /(?:#|%23)(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g,
    ruleRef: 'DS-T-001',
  },
  {
    pattern: 'rgb-color',
    regex: /\brgba?\s*\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+/g,
    ruleRef: 'DS-T-001',
  },
  {
    pattern: 'hsl-color',
    regex: /\bhsla?\s*\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%/g,
    ruleRef: 'DS-T-001',
  },
  {
    pattern: 'hardcoded-spacing',
    // margin/padding/gap with a bare px value (not inside var())
    regex: /(?:margin|padding|gap)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
    ruleRef: 'DS-T-002',
  },
  {
    pattern: 'hardcoded-radius',
    // border-radius / borderRadius with a bare px value
    regex: /(?:border-?[Rr]adius)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
    ruleRef: 'DS-T-003',
  },
  {
    pattern: 'non-zero-radius',
    // Any border radius (shorthand, per-corner, CSS or camelCase) other than 0 or var(--radius-*).
    regex:
      /\bborder(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius\s*:\s*['"]?(?=[^\s'"])(?!(?:0(?:px)?\s*['"]?\s*(?:[;,}]|$)|var\(--radius-))[^;,}\n]+|\bborder(?:Top|Bottom|Start|End)?(?:Left|Right|Start|End)?Radius\s*:\s*['"]?(?=[^\s'"])(?!(?:0(?:px)?\s*['"]?\s*(?:[;,}]|$)|var\(--radius-))[^;,}\n]+/g,
    ruleRef: 'DS-T-004',
  },
  {
    pattern: 'hardcoded-shadow',
    // Elevation comes from borders; a shadow must be none or a semantic token.
    regex: /\bbox-?[Ss]hadow\s*:\s*['"]?(?=[^\s'"])(?!none\b|var\(--(?:shadow|elevation)-)[^;,}\n]+/g,
    ruleRef: 'DS-L-002',
  },
  {
    pattern: 'hardcoded-font-size',
    regex: /font-?[Ss]ize\s*:\s*['"]?\d/g,
    ruleRef: 'DS-L-001',
  },
  {
    pattern: 'hardcoded-font-weight',
    regex: /font-?[Ww]eight\s*:\s*['"]?\d/g,
    ruleRef: 'DS-L-001',
  },
  {
    pattern: 'hardcoded-font-family',
    // Anything other than var(...) or inherit
    regex: /font-?[Ff]amily\s*:\s*(?!['"]?(?:var\(|inherit))['"]?[A-Za-z"]/g,
    ruleRef: 'DS-L-001',
  },
  {
    pattern: 'hardcoded-line-height',
    regex: /line-?[Hh]eight\s*:\s*['"]?\d/g,
    ruleRef: 'DS-L-001',
  },
  {
    pattern: 'hardcoded-letter-spacing',
    regex: /letter-?[Ss]pacing\s*:\s*['"]?(?=[^\s'"])(?!var\(|normal\b|inherit\b|0\s*(?:['"]|[;,}]|$))[^;,}\n]+/g,
    ruleRef: 'DS-L-001',
  },
  {
    pattern: 'hardcoded-duration',
    // A literal time (150ms, 1s) anywhere in a transition or animation declaration.
    regex: /\b(?:transition|animation)(?:-?(?:[Dd]uration|[Dd]elay))?\s*:[^;}\n]*?(?<![\w.-])\d*\.?\d+m?s\b/g,
    ruleRef: 'DS-M-001',
  },
  {
    pattern: 'hardcoded-opacity',
    // Opacity other than 0, 1 or a token.
    regex: /\bopacity\s*:\s*['"]?(?!(?:0|1)\s*(?:['"]|[;,}]|$)|var\()\d*\.?\d+/g,
    ruleRef: 'DS-T-005',
  },
  {
    pattern: 'hardcoded-color-mix-percent',
    // A literal percentage inside color-mix(); the amount must come from an opacity token.
    regex: /color-mix\((?:[^()]|\([^()]*\))*?(?<![\w-])\d+(?:\.\d+)?%/g,
    ruleRef: 'DS-T-005',
  },
  {
    pattern: 'hardcoded-border-width',
    // border, border-width, border-top, ... starting with a literal px width
    regex: /\bborder(?:-?(?:[Ww]idth|[Tt]op|[Rr]ight|[Bb]ottom|[Ll]eft))?\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
  {
    pattern: 'hardcoded-outline',
    regex: /\boutline(?:-?(?:[Ww]idth|[Oo]ffset))?\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
  {
    pattern: 'hardcoded-z-index',
    regex: /z-?[Ii]ndex\s*:\s*['"]?-?\d/g,
  },
];

export function lintString(content: string, fileName = '<generated>'): LintViolation[] {
  const lines = content.split('\n');
  const violations: LintViolation[] = [];

  for (const { pattern, regex, ruleRef } of LINT_RULES) {
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx] ?? '';
      // Skip comment lines
      if (/^\s*\/\//.test(line)) continue;

      const localRegex = new RegExp(regex.source, regex.flags);
      let match: RegExpExecArray | null;
      while ((match = localRegex.exec(line)) !== null) {
        violations.push({
          file: fileName,
          line: lineIdx + 1,
          column: match.index + 1,
          pattern,
          match: match[0],
          ruleId: 'FR-1',
          ...(ruleRef ? { ruleRef } : {}),
        });
      }
    }
  }

  return violations;
}

// ── Font roles (DS-L-003) ─────────────────────────────────────────────────────

/** Selectors for text that must use the SemiCondensed display font. */
const DISPLAY_ROLE = /\.ads-button\b|__label\b|__title\b|__heading\b|\bbadge\b|(?:^|[\s,>+~])(?:th|h[1-6])\b/;
/** Selectors for text that must use the Saira body font. */
const BODY_ROLE = /__field\b|__message\b|__body\b|__helper\b/;
const DISPLAY_FONT = /var\(--font-family-display\)/;

/**
 * Headings, buttons, labels, table headers and badges use var(--font-family-display);
 * inputs, helper text and body copy do not. A role's base rule (a bare class such as
 * `.ads-button`) must set the display font itself; modifier rules may inherit it.
 */
export function lintFontRoles(css: string, fileName = '<generated>'): LintViolation[] {
  const violations: LintViolation[] = [];
  const baseRoles = new Map<string, number>();
  const hasFamily = new Set<string>();
  const block = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;

  while ((m = block.exec(css)) !== null) {
    const selectorText = (m[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const body = m[2] ?? '';
    const line = css.slice(0, m.index + (m[0].length - m[0].trimStart().length)).split('\n').length;
    const family = /font-family\s*:\s*([^;]+)/.exec(body)?.[1]?.trim();
    const selectors = selectorText.split(',').map((x) => x.trim());
    const push = (pattern: string, match: string): void => {
      violations.push({ file: fileName, line, column: 1, pattern, match, ruleId: 'FR-1', ruleRef: 'DS-L-003' });
    };

    for (const sel of selectors) {
      const isBase = /^\.[\w-]+$/.test(sel);
      if (DISPLAY_ROLE.test(` ${sel}`)) {
        if (family !== undefined && !DISPLAY_FONT.test(family)) push('display-font-role', `${sel} { font-family: ${family} }`);
        if (isBase && !baseRoles.has(sel)) baseRoles.set(sel, line);
        if (family !== undefined) hasFamily.add(sel);
      } else if (BODY_ROLE.test(sel) && family !== undefined && DISPLAY_FONT.test(family)) {
        push('body-font-role', `${sel} { font-family: ${family} }`);
      }
    }
  }

  for (const [sel, line] of baseRoles) {
    if (!hasFamily.has(sel)) {
      violations.push({
        file: fileName,
        line,
        column: 1,
        pattern: 'display-font-role',
        match: `${sel} does not set font-family: var(--font-family-display)`,
        ruleId: 'FR-1',
        ruleRef: 'DS-L-003',
      });
    }
  }
  return violations;
}

// ── Motion guard (DS-M-001) ───────────────────────────────────────────────────

const MOTION_GUARD = /@media\s*\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)\s*\{/g;

/** Character ranges of every `@media (prefers-reduced-motion: no-preference) { ... }` block. */
function guardedRanges(css: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(MOTION_GUARD.source, 'g');
  while ((m = re.exec(css)) !== null) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
      i++;
    }
    ranges.push([m.index, i]);
  }
  return ranges;
}

/** Transitions and animations may only run inside the no-preference guard; `none` is allowed anywhere. */
export function lintMotionGuard(css: string, fileName = '<generated>'): LintViolation[] {
  const ranges = guardedRanges(css);
  const violations: LintViolation[] = [];
  const re = /\b(transition|animation)(?:-[a-z-]+)?\s*:\s*([^;}]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    if (/^none\b/.test((m[2] ?? '').trim())) continue;
    const at = m.index;
    if (ranges.some(([a, b]) => at > a && at < b)) continue;
    const line = css.slice(0, at).split('\n').length;
    violations.push({
      file: fileName,
      line,
      column: at - css.lastIndexOf('\n', at - 1),
      pattern: 'motion-outside-reduced-motion-guard',
      match: m[0].trim(),
      ruleId: 'FR-1',
      ruleRef: 'DS-M-001',
    });
  }
  return violations;
}

// ── Token files: square corners (DS-T-004) ────────────────────────────────────

interface RawToken {
  name: string;
  tier: string;
  value?: string;
  reference?: string;
  description?: string;
}

const readTokens = (repoRoot: string, file: string): RawToken[] =>
  (JSON.parse(readFileSync(join(repoRoot, 'tokens', file), 'utf8')) as { tokens: RawToken[] }).tokens;

/**
 * Flags any radius token that is not 0. With no `tokens` argument it checks
 * tokens/primitives.json and tokens/semantic.json under `repoRoot`.
 */
export function lintTokenFiles(tokens?: RawToken[], fileName = 'tokens', repoRoot = process.cwd()): LintViolation[] {
  const sets: Array<[string, RawToken[]]> = tokens
    ? [[fileName, tokens]]
    : [
        ['tokens/primitives.json', readTokens(repoRoot, 'primitives.json')],
        ['tokens/semantic.json', readTokens(repoRoot, 'semantic.json')],
      ];
  const primitiveValues = new Map<string, string>();
  for (const [, list] of sets) for (const t of list) if (t.value !== undefined) primitiveValues.set(t.name, t.value);

  const violations: LintViolation[] = [];
  for (const [file, list] of sets) {
    list.forEach((t, i) => {
      if (!t.name.startsWith('radius-')) return;
      const value = t.value ?? primitiveValues.get(t.reference ?? '') ?? '';
      if (parseFloat(value) !== 0) {
        violations.push({
          file,
          line: i + 1,
          column: 1,
          pattern: 'non-zero-radius-token',
          match: `${t.name}: ${value}`,
          ruleId: 'FR-1',
          ruleRef: 'DS-T-004',
        });
      }
    });
  }
  return violations;
}

/** Names of every semantic token. Components may reference only these via var(--name). */
export function loadSemanticTokenNames(repoRoot: string): Set<string> {
  const raw = JSON.parse(readFileSync(join(repoRoot, 'tokens', 'semantic.json'), 'utf8')) as {
    tokens: Array<{ name: string }>;
  };
  return new Set(raw.tokens.map((t) => t.name));
}

/** Flags every var(--x) whose x is not a semantic token (primitives and unknown names). */
export function lintTokenReferences(
  content: string,
  fileName: string,
  semanticNames: Set<string>,
): LintViolation[] {
  const violations: LintViolation[] = [];
  const lines = content.split('\n');
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx] ?? '';
    const re = /var\(\s*--([a-z0-9-]+)\s*[,)]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      const name = m[1] ?? '';
      if (!semanticNames.has(name)) {
        violations.push({
          file: fileName,
          line: lineIdx + 1,
          column: m.index + 1,
          pattern: 'non-semantic-token',
          match: `var(--${name})`,
          ruleId: 'FR-1',
        });
      }
    }
  }
  return violations;
}

export async function lintFile(filePath: string, semanticNames?: Set<string>): Promise<LintViolation[]> {
  const source = await readFile(filePath, 'utf8');
  const violations = lintString(source, filePath);
  if (extname(filePath) === '.css') {
    violations.push(...lintFontRoles(source, filePath), ...lintMotionGuard(source, filePath));
  }
  if (semanticNames) violations.push(...lintTokenReferences(source, filePath, semanticNames));
  return violations;
}

export async function lintDirectory(
  dir: string,
  extensions: string[] = ['.tsx', '.ts', '.css', '.scss'],
  semanticNames?: Set<string>,
): Promise<LintViolation[]> {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const violations: LintViolation[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      violations.push(...(await lintDirectory(fullPath, extensions, semanticNames)));
    } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
      violations.push(...(await lintFile(fullPath, semanticNames)));
    }
  }

  return violations;
}

// CLI entrypoint
if (process.argv[1] && statSync(process.argv[1]).ino === statSync(new URL(import.meta.url).pathname).ino) {
  const targetDir = process.argv[2] ?? 'components';
  const repoRoot = process.cwd();
  lintDirectory(targetDir, undefined, loadSemanticTokenNames(repoRoot)).then((violations) => {
    violations.push(...lintTokenFiles(undefined, undefined, repoRoot));
    for (const c of checkContrast(resolveSemanticTokens(repoRoot))) {
      violations.push({
        file: 'tokens/semantic.json',
        line: 0,
        column: 0,
        pattern: 'contrast',
        match: `${c.fg} (${c.fgValue}) on ${c.bg} (${c.bgValue}) is ${c.ratio.toFixed(2)}:1, needs ${c.min}:1`,
        ruleId: 'FR-1',
        ruleRef: c.ruleRef,
      });
    }
    if (violations.length === 0) {
      console.log('token-lint: 0 violations');
      process.exit(0);
    }
    for (const v of violations) {
      const ref = v.ruleRef ? ` ${v.ruleRef}` : '';
      console.error(`${v.file}:${v.line}:${v.column} [${v.pattern}${ref}] ${v.match}`);
    }
    console.error(`\ntoken-lint: ${violations.length} violation(s) — rule FR-1`);
    process.exit(1);
  });
}
