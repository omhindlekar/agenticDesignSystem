import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { runQa, loadChecks } from '../tools.js';
import { closeRenderer } from '../../../checks/render/render.js';
import { auditSpec } from '../../../checks/rules-audit/audit.js';
import visual from '../../../checks/visual/qa.js';
import { comparePngs } from '../../../checks/visual/compare.js';
import type { ScreenSpec } from '../../../packages/schemas/src/screen-spec.js';
import type { QaCheck } from '../../../checks/qa-check.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const demoTsx = readFileSync(join(root, 'evals/fixtures/demo/sign-in.screen.tsx'), 'utf8');
const demoSpec = JSON.parse(readFileSync(join(root, 'evals/fixtures/demo/sign-in.spec.json'), 'utf8')) as ScreenSpec;
const input = { taskId: demoSpec.taskId, runId: 'qa-test', spec: demoSpec, tsx: demoTsx };
afterAll(closeRenderer);

const node = (component: string, props: Record<string, unknown> = {}, children?: ScreenSpec['tree'][]) => ({
  component,
  props,
  tokenRefs: [],
  states: ['default'],
  ...(children ? { children } : {}),
});
const spec = (tree: ScreenSpec['tree']): ScreenSpec => ({ taskId: 't', tree, statesCovered: ['default'] });

describe('FR-9: QA agent runs the four checks and reports each one', () => {
  it('FR-9, FR-11: the demo sign-in screen passes token lint, rules audit and accessibility; visual is skipped without a baseline', async () => {
    const r = await runQa(input, { repoRoot: root });
    expect(r.checks.map((c) => [c.checkName, c.status])).toEqual([
      ['token-lint', 'pass'],
      ['rules-audit', 'pass'],
      ['a11y', 'pass'],
      ['visual', 'skipped'],
    ]);
    expect(r.overallStatus).toBe('pass');
    expect(r.findings).toEqual([]);
  }, 60_000);

  it('FR-9, FR-20: a hardcoded colour fails token lint with the rule id and a one-sentence fix', async () => {
    const tsx = demoTsx.replace("color: 'var(--color-text-primary)'", "color: '#1b1f27'");
    const r = await runQa({ ...input, tsx }, { repoRoot: root });
    expect(r.overallStatus).toBe('fail');
    const f = r.findings!.find((x) => x.checkName === 'token-lint')!;
    expect(f.ruleId).toBe('DS-T-001');
    expect(f.message).toBe('Use a colour token, var(--color-…), instead of #1b1f27.');
    expect(f.evidence).toMatch(/^screen\.tsx:\d+:\d+$/);
  }, 60_000);

  it('FR-11: an unlabelled field fails accessibility and cites WCAG and DS-A-004', async () => {
    const tsx = `export default function Screen() { return <form><input type="text" /></form>; }`;
    const r = await runQa({ ...input, tsx }, { repoRoot: root });
    const a11y = r.findings!.filter((x) => x.checkName === 'a11y');
    expect(a11y.length).toBeGreaterThan(0);
    expect(a11y[0]!.ruleId).toBe('DS-A-004');
    expect(a11y[0]!.criterion).toMatch(/^\d\.\d\.\d+$/);
  }, 60_000);

  it('FR-11: a positive tabindex breaks focus order and is reported against 2.4.3', async () => {
    const tsx = `import { Button } from '@ads/components';
export default function Screen() { return <div><Button label="First" /><span tabIndex={2}>Odd</span></div>; }`;
    const r = await runQa({ ...input, tsx }, { repoRoot: root });
    expect(r.findings!.some((f) => f.criterion === '2.4.3' && f.ruleId === 'DS-A-008')).toBe(true);
  }, 60_000);

  it('DS-Q-001: a screen that does not render fails QA instead of passing silently', async () => {
    const r = await runQa({ ...input, tsx: 'export const nothing = 1;' }, { repoRoot: root });
    expect(r.overallStatus).toBe('fail');
    expect(r.findings!.some((f) => f.ruleId === 'DS-Q-001')).toBe(true);
  }, 60_000);

  it('NFR-5: the same spec and TSX give the same report', async () => {
    const strip = (r: Awaited<ReturnType<typeof runQa>>) =>
      JSON.stringify({ ...r, durationMs: 0, checks: r.checks.map((c) => ({ ...c, durationMs: 0 })) });
    const a = await runQa(input, { repoRoot: root });
    const b = await runQa(input, { repoRoot: root });
    expect(strip(a)).toBe(strip(b));
  }, 60_000);

  it('NFR-2: QA on one screen stays within the 2-minute budget', async () => {
    const budget = (
      JSON.parse(readFileSync(join(root, 'config/defaults.json'), 'utf8')) as { qa: { budgetMs: number } }
    ).qa.budgetMs;
    const r = await runQa(input, { repoRoot: root });
    expect(r.durationMs!).toBeLessThan(budget);
  }, 60_000);
});

describe('FR-9: rules audit on the screen spec', () => {
  const ids = (t: ScreenSpec['tree']) => auditSpec(spec(t), root).map((f) => f.ruleId);
  it('DS-C-002: a destructive button without the danger tone', () => {
    expect(ids(node('button', { label: 'Delete project' }))).toEqual(['DS-C-002']);
    expect(ids(node('button', { label: 'Delete project', tone: 'danger' }))).toEqual([]);
  });
  it('DS-C-003: Select with fewer than four options', () => {
    expect(
      ids(
        node('select', {
          label: 'Plan',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        }),
      ),
    ).toEqual(['DS-C-003']);
  });
  it('DS-C-004 and DS-C-005: Card in Card, Modal in Modal', () => {
    expect(ids(node('card', {}, [node('card')]))).toEqual(['DS-C-004']);
    expect(ids(node('modal', { title: 'A' }, [node('modal', { title: 'B' })]))).toEqual(['DS-C-005']);
  });
  it('DS-C-007 and DS-C-008: interactive tooltip content, menu used for navigation', () => {
    expect(ids(node('tooltip', { content: { link: true } }))).toEqual(['DS-C-007']);
    expect(ids(node('menu', { label: 'Go', items: [{ id: 'a', label: 'Home', href: '/' }] }))).toEqual(['DS-C-008']);
  });
  it('DS-C-009: unknown components and props not in the metadata', () => {
    expect(ids(node('carousel'))).toEqual(['DS-C-009']);
    expect(ids(node('button', { label: 'Go', href: '/home' }))).toEqual(['DS-C-009']);
    expect(auditSpec(spec(node('button', { label: 'Go', href: '/home' })), root)[0]!.message).toBe(
      'button has no "href" prop; use only the props its metadata lists.',
    );
  });
  it('FR-9: the demo spec breaks no component rule', () => {
    expect(auditSpec(demoSpec, root)).toEqual([]);
  });
});

describe('FR-10: visual regression against an approved baseline', () => {
  const png = (w: number, h: number, fill: number) => {
    const p = new PNG({ width: w, height: h });
    p.data.fill(fill);
    return PNG.sync.write(p);
  };
  const fakeRepo = () => {
    const dir = mkdtempSync(join(tmpdir(), 'ads-visual-'));
    mkdirSync(join(dir, 'evals', 'baselines'), { recursive: true });
    mkdirSync(join(dir, 'config'));
    copyFileSync(join(root, 'config/defaults.json'), join(dir, 'config/defaults.json'));
    copyFileSync(join(root, 'config/permissions.json'), join(dir, 'config/permissions.json'));
    writeFileSync(join(dir, 'evals/baselines/screen.png'), png(10, 10, 255));
    return dir;
  };
  const ctx = (repoRoot: string, shot: Buffer, baselineId?: string) => ({
    taskId: 't',
    runId: 'r',
    spec: demoSpec,
    tsx: '',
    repoRoot,
    baselineId,
    evidenceDir: join(repoRoot, 'runs', 'r', 'qa'),
    render: async () => ({ page: undefined as never, screenshot: async () => shot, close: async () => {} }),
  });
  it('FR-10: matches when nothing changed', async () => {
    const dir = fakeRepo();
    expect((await visual.run(ctx(dir, png(10, 10, 255), 'screen'))).status).toBe('pass');
  });
  it('FR-10: a change above the threshold fails with DS-V-001 and writes the diff as evidence', async () => {
    const dir = fakeRepo();
    const r = await visual.run(ctx(dir, png(10, 10, 0), 'screen'));
    expect(r.status).toBe('fail');
    expect(r.findings[0]!.ruleId).toBe('DS-V-001');
    expect(r.evidence!.some((e) => e.endsWith('screen.diff.png'))).toBe(true);
  });
  it('FR-10: with no approved baseline the check is skipped, never passed', async () => {
    const dir = fakeRepo();
    const r = await visual.run(ctx(dir, png(10, 10, 255), 'missing'));
    expect(r.status).toBe('skipped');
    expect(r.reason).toMatch(/baselines:approve -- missing/);
  });
  it('FR-10: a different size is a change', () => {
    expect(comparePngs(png(10, 10, 0), png(12, 10, 0), { pixelThreshold: 0.1, maxDiffRatio: 0.001 }).sizeChanged).toBe(
      true,
    );
  });
});

describe('NFR-10: a new check is a module plus a registry entry', () => {
  it('NFR-10: QA runs a check added only through a registry file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ads-registry-'));
    mkdirSync(join(dir, 'checks'));
    writeFileSync(
      join(dir, 'checks/always-fail.ts'),
      `export default { name: 'x', async run() { return { status: 'fail', reason: 'demo', findings: [{ ruleId: 'DS-C-009', message: 'Demo finding.' }] }; } };`,
    );
    writeFileSync(
      join(dir, 'checks/registry.json'),
      JSON.stringify({ checks: [{ name: 'always-fail', module: 'checks/always-fail.ts' }] }),
    );
    const checks = await loadChecks(dir);
    expect(checks.map((c) => c.name)).toEqual(['always-fail']);
    const r = await runQa(input, { repoRoot: root, checks });
    expect(r.checks).toEqual([
      expect.objectContaining({ checkName: 'always-fail', status: 'fail', failingRuleIds: ['DS-C-009'] }),
    ]);
  });
  it('NFR-10: the repo registry lists the four PRD checks', async () => {
    expect((await loadChecks(root)).map((c: QaCheck) => c.name)).toEqual([
      'token-lint',
      'rules-audit',
      'a11y',
      'visual',
    ]);
  });
});
