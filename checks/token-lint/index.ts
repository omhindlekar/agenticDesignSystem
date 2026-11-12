import { readFile, readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import { existsSync, statSync } from 'node:fs';

export interface LintViolation {
  file: string;
  line: number;
  column: number;
  pattern: string;
  match: string;
  ruleId: 'FR-1';
}

type LintRule = {
  pattern: string;
  regex: RegExp;
};

const LINT_RULES: LintRule[] = [
  {
    pattern: 'hex-color',
    // Matches #rgb, #rrggbb, #rrggbbaa — but not inside CSS var() references
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
    // margin/padding/gap with a bare px value (not inside var())
    regex: /(?:margin|padding|gap)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
  {
    pattern: 'hardcoded-radius',
    // border-radius / borderRadius with a bare px value
    regex: /(?:border-?[Rr]adius)\s*:\s*['"]?\d+(?:\.\d+)?px/g,
  },
  {
    pattern: 'hardcoded-font-size',
    regex: /font-?[Ss]ize\s*:\s*['"]?\d/g,
  },
  {
    pattern: 'hardcoded-font-weight',
    regex: /font-?[Ww]eight\s*:\s*['"]?\d/g,
  },
  {
    pattern: 'hardcoded-font-family',
    // Anything other than var(...) or inherit
    regex: /font-?[Ff]amily\s*:\s*(?!['"]?(?:var\(|inherit))['"]?[A-Za-z"]/g,
  },
  {
    pattern: 'hardcoded-line-height',
    regex: /line-?[Hh]eight\s*:\s*['"]?\d/g,
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

  for (const { pattern, regex } of LINT_RULES) {
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
        });
      }
    }
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
  lintDirectory(targetDir, undefined, loadSemanticTokenNames(process.cwd())).then((violations) => {
    if (violations.length === 0) {
      console.log('token-lint: 0 violations');
      process.exit(0);
    }
    for (const v of violations) {
      console.error(`${v.file}:${v.line}:${v.column} [${v.pattern}] ${v.match}`);
    }
    console.error(`\ntoken-lint: ${violations.length} violation(s) — rule FR-1`);
    process.exit(1);
  });
}
