import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { assertCanWrite, guardedFs, globToRegExp, loadPermissions, REPO_ROOT, PermissionError } from '../src/index.js';

const can = (agent: string, path: string) => {
  try {
    assertCanWrite(agent, path);
    return true;
  } catch (e) {
    if (e instanceof PermissionError) return false;
    throw e;
  }
};

describe('NFR-7: no agent can write outside its permitted paths', () => {
  const AGENTS = Object.keys(loadPermissions().agents);
  const PROTECTED = [
    'tokens/semantic.json',
    'components/button/button.tsx',
    'rules/rules.yaml',
    'evals/baselines/sign-in.png',
  ];

  it('NFR-7: the PRD agents all have permissions', () => {
    expect(AGENTS.sort()).toEqual(['builder', 'composer', 'context', 'docs', 'maintainer', 'orchestrator', 'qa']);
  });

  it.each(['orchestrator', 'context', 'composer', 'builder', 'qa'])(
    'NFR-7: %s cannot write tokens, components, rules or baselines',
    (agent) => {
      for (const p of PROTECTED) expect(can(agent, p), `${agent} → ${p}`).toBe(false);
    },
  );

  it('NFR-7: no agent, Maintainer included, can write approved visual baselines', () => {
    for (const a of AGENTS) expect(can(a, 'evals/baselines/sign-in.png'), a).toBe(false);
  });

  it('NFR-7: context and composer write nothing at all', () => {
    for (const p of ['runs/x/log.jsonl', 'generated/x/screen.tsx', 'README.md']) {
      expect(can('context', p)).toBe(false);
      expect(can('composer', p)).toBe(false);
    }
  });

  it('NFR-7: each agent can write its own outputs and nothing beside them', () => {
    expect(can('orchestrator', 'runs/abc/log.jsonl')).toBe(true);
    expect(can('orchestrator', 'generated/abc/screen.tsx')).toBe(false);
    expect(can('builder', 'generated/abc/screen.tsx')).toBe(true);
    expect(can('builder', '.ads-typecheck-tmp-x1/screen.tsx')).toBe(true);
    expect(can('builder', 'runs/abc/log.jsonl')).toBe(false);
    expect(can('qa', 'runs/abc/qa/sign-in.diff.png')).toBe(true);
    expect(can('qa', 'runs/abc/log.jsonl')).toBe(false);
    expect(can('docs', 'docs/button.md')).toBe(true);
    expect(can('docs', 'components/button/button.meta.json')).toBe(false);
    expect(can('maintainer', 'tokens/semantic.json')).toBe(true);
  });

  it('NFR-7: writes outside the repository are refused unless they are temp scratch files', () => {
    expect(can('qa', join(tmpdir(), 'ads-render-1', 'index.html'))).toBe(true);
    expect(can('qa', '/etc/hosts')).toBe(false);
    expect(can('builder', join(REPO_ROOT, '..', 'elsewhere.txt'))).toBe(false);
  });

  it('NFR-7: an unknown agent can write nothing', () => {
    expect(can('rogue', 'runs/x/log.jsonl')).toBe(false);
  });

  it('NFR-7: the guarded writer throws before touching the disk', () => {
    expect(() => guardedFs('qa').writeFile(join(REPO_ROOT, 'rules', 'rules.yaml'), 'x')).toThrow(PermissionError);
    expect(readFileSync(join(REPO_ROOT, 'rules', 'rules.yaml'), 'utf8')).toContain('rules:');
  });

  it('NFR-7: globs match by path segment', () => {
    expect(globToRegExp('runs/*/qa/**').test('runs/abc/qa/x.png')).toBe(true);
    expect(globToRegExp('runs/*/qa/**').test('runs/abc/def/qa/x.png')).toBe(false);
    expect(globToRegExp('docs/**').test('docs')).toBe(true);
    expect(globToRegExp('**').test('anything/at/all')).toBe(true);
  });
});

describe('NFR-7: agents and QA checks write only through the guard', () => {
  const WRITE =
    /\b(writeFileSync|appendFileSync|mkdirSync|mkdtempSync|rmSync|copyFileSync|renameSync|unlinkSync|writeFile|appendFile|mkdir|rm|unlink)\s*\(/;
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) return f === 'tests' || f === 'fixtures' ? [] : files(p);
      return /\.tsx?$/.test(f) ? [p] : [];
    });
  const scanned = [
    ...files(join(REPO_ROOT, 'agents')),
    ...files(join(REPO_ROOT, 'checks', 'render')),
    ...files(join(REPO_ROOT, 'checks', 'visual')),
    ...[
      'checks/a11y/qa.ts',
      'checks/token-lint/qa.ts',
      'checks/rules-audit/audit.ts',
      'packages/run-log/src/index.ts',
    ].map((f) => join(REPO_ROOT, f)),
  ].filter(existsSync);

  it('NFR-7: no agent or QA check calls a file-writing function directly', () => {
    const offenders = scanned.filter((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .some(
          (line) =>
            WRITE.test(line) &&
            !/fs\.(writeFile|appendFile|mkdir|mkdtemp|rm)\(/.test(line) &&
            !/^\s*(\/\/|\*)/.test(line),
        ),
    );
    expect(offenders.map((f) => f.replace(REPO_ROOT + '/', ''))).toEqual([]);
  });

  it('NFR-7: the scan covers every agent folder that has code', () => {
    expect(scanned.some((f) => f.includes('/agents/qa/'))).toBe(true);
    expect(scanned.some((f) => f.includes('/agents/builder/'))).toBe(true);
  });
});

describe('FR-10: baselines change only by approval', () => {
  it('FR-10: no agent or QA check imports the baseline approval script', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : [];
      });
    const importers = [...files(join(REPO_ROOT, 'agents')), ...files(join(REPO_ROOT, 'checks'))].filter((f) =>
      /from ['"][^'"]*scripts\/baselines/.test(readFileSync(f, 'utf8')),
    );
    expect(importers).toEqual([]);
  });
});
