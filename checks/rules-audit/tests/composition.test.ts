import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditComposition } from '../composition.js';
import type { ComponentNode, ScreenSpec } from '../../../packages/schemas/src/screen-spec.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const n = (component: string, props: Record<string, unknown> = {}, children?: ComponentNode[], extra: Partial<ComponentNode> = {}): ComponentNode => ({
  component,
  props,
  tokenRefs: [],
  states: ['default'],
  ...(children ? { children } : {}),
  ...extra,
});
const spec = (tree: ComponentNode): ScreenSpec => ({ taskId: 't', screenType: 'auth', template: tree.component, tree, statesCovered: ['default'] });
const ids = (s: ScreenSpec) => auditComposition(s, root).map((f) => f.ruleId);

/** A sign-in screen that keeps every composition and copy rule. */
const signIn = () =>
  n('auth-page', { title: 'Sign in', description: 'Use the email address registered to your account.' }, [
    n('input', { label: 'Email address', type: 'email' }, undefined, { slot: 'form' }),
    n('input', { label: 'Password', type: 'password' }, undefined, { slot: 'form' }),
    n('link', { href: '#forgot', children: 'Forgot your password?' }, undefined, { slot: 'secondaryActions' }),
    n('button', { label: 'Sign in', type: 'submit' }, undefined, { slot: 'primaryAction' }),
  ]);

describe('FR-21 composition rules (DS-P)', () => {
  it('FR-21: a well-formed template screen has no findings', () => {
    expect(auditComposition(spec(signIn()), root)).toEqual([]);
  });

  it('FR-21: DS-P-001 the root is a page template or PageShell', () => {
    expect(ids(spec(n('stack', {}, [n('input', { label: 'Email address' })])))).toContain('DS-P-001');
    expect(ids(spec(n('page-shell', {}, [n('container', { size: 'sm' }, [n('input', { label: 'Email address' })])])))).not.toContain('DS-P-001');
  });

  it('FR-21: DS-P-002 one primary action per view; a modal is its own view', () => {
    const t = signIn();
    t.children!.push(n('button', { label: 'Sign in with single sign-on' }, undefined, { slot: 'alternative' }));
    expect(ids(spec(t))).toContain('DS-P-002');
    const ok = signIn();
    ok.children!.push(n('button', { label: 'Sign in with single sign-on', variant: 'outlined' }, undefined, { slot: 'alternative' }));
    expect(ids(spec(ok))).not.toContain('DS-P-002');
  });

  it('FR-21: DS-P-003 the template owns the h1, and a level-3 section sits inside a section', () => {
    const t = signIn();
    t.children!.unshift(n('heading', { level: 1, children: 'Welcome back' }, undefined, { slot: 'form' }));
    expect(ids(spec(t))).toContain('DS-P-003');
    const s = n('settings-page', { title: 'Settings' }, [n('section', { title: 'Profile', headingLevel: 3 }, [n('input', { label: 'Full name' })], { slot: 'sections' })]);
    expect(ids(spec(s))).toContain('DS-P-003');
  });

  it('FR-21: DS-P-005 the danger zone comes last, and destructive actions live in it or a modal', () => {
    const s = n('settings-page', { title: 'Settings' }, [
      n('section', { title: 'Profile' }, [n('input', { label: 'Full name' })], { slot: 'sections' }),
      n('button', { label: 'Delete account', tone: 'danger' }, undefined, { slot: 'sections' }),
    ]);
    expect(ids(spec(s))).toContain('DS-P-005');
    const order = n('settings-page', { title: 'Settings' }, [
      n('section', { title: 'Delete account', variant: 'danger' }, [n('button', { label: 'Delete account', tone: 'danger', variant: 'outlined' })], { slot: 'dangerZone' }),
      n('section', { title: 'Profile' }, [n('input', { label: 'Full name' })], { slot: 'sections' }),
    ]);
    expect(ids(spec(order))).toContain('DS-P-005');
  });

  it('FR-21: DS-P-006 more than six fields in one group need sections', () => {
    const fields = Array.from({ length: 7 }, (_, i) => n('input', { label: `Field ${i + 1}` }, undefined, { slot: 'form' }));
    const t = n('auth-page', { title: 'Create your account' }, [...fields, n('button', { label: 'Create account' }, undefined, { slot: 'primaryAction' })]);
    expect(ids(spec(t))).toContain('DS-P-006');
  });

  it('FR-21: DS-P-007 every required slot is filled, by a prop or a child, with a component it accepts', () => {
    const missing = n('auth-page', { title: 'Sign in' }, [n('input', { label: 'Email address' }, undefined, { slot: 'form' })]);
    expect(auditComposition(spec(missing), root).find((f) => f.ruleId === 'DS-P-007')?.message).toMatch(/primaryAction/);
    const wrong = signIn();
    wrong.children![0]!.component = 'table';
    expect(ids(spec(wrong))).toContain('DS-P-007');
    const unknown = signIn();
    unknown.children![0]!.slot = 'sidebar';
    expect(ids(spec(unknown))).toContain('DS-P-007');
  });

  it('FR-21: DS-P-008 fields on a bare PageShell sit inside a narrow Container', () => {
    expect(ids(spec(n('page-shell', {}, [n('input', { label: 'Email address' })])))).toContain('DS-P-008');
    expect(ids(spec(n('page-shell', {}, [n('container', { size: 'lg' }, [n('input', { label: 'Email address' })])])))).toContain('DS-P-008');
  });

  it('FR-21: DS-P-009 a destructive action is confirmed in a Modal', () => {
    const s = n('settings-page', { title: 'Settings' }, [
      n('section', { title: 'Profile' }, [n('input', { label: 'Full name' })], { slot: 'sections' }),
      n('section', { title: 'Delete account', variant: 'danger' }, [n('button', { label: 'Delete account', tone: 'danger', variant: 'outlined' })], { slot: 'dangerZone' }),
    ]);
    expect(ids(spec(s))).toContain('DS-P-009');
    s.children!.push(n('modal', { title: 'Delete your account?' }, [n('button', { label: 'Delete account', tone: 'danger' })], { slot: 'dangerZone' }));
    expect(ids(spec(s))).not.toContain('DS-P-009');
  });
});

describe('FR-27 copy rules (DS-W)', () => {
  const withTitle = (title: string) => ({ ...signIn(), props: { ...signIn().props, title } });

  it('FR-27: DS-W-001 headings are specific and in sentence case', () => {
    expect(ids(spec(withTitle('Login Screen')))).toContain('DS-W-001');
    expect(ids(spec(withTitle('Sign In To Your Business Account')))).toContain('DS-W-001');
    expect(ids(spec(withTitle('Sign in to Northwind Business')))).not.toContain('DS-W-001');
  });

  it('FR-27: DS-W-002 buttons say what happens, never Submit or OK', () => {
    const t = signIn();
    t.children![3]!.props['label'] = 'Submit';
    expect(ids(spec(t))).toContain('DS-W-002');
    t.children![3]!.props['label'] = 'OK';
    expect(ids(spec(t))).toContain('DS-W-002');
  });

  it('FR-27: DS-W-004 errors are one sentence that says what to do', () => {
    const t = signIn();
    t.children![0]!.props['errorMessage'] = 'Invalid';
    expect(ids(spec(t))).toContain('DS-W-004');
    t.children![0]!.props['errorMessage'] = 'Enter an email address. It should look like name@company.com. Try again.';
    expect(ids(spec(t))).toContain('DS-W-004');
    t.children![0]!.props['errorMessage'] = 'Enter an email address in the format name@company.com';
    expect(ids(spec(t))).not.toContain('DS-W-004');
  });

  it('FR-27: DS-W-005 no placeholder copy anywhere', () => {
    for (const bad of ['Lorem ipsum dolor', 'Label', 'Title', 'TODO add copy', 'Button']) {
      const t = signIn();
      t.children![0]!.props['label'] = bad;
      expect(ids(spec(t)), bad).toContain('DS-W-005');
    }
  });

  it('FR-27: DS-W-005 judges only copy, not technical props such as type or name', () => {
    const t = signIn();
    Object.assign(t.children![0]!.props, { type: 'text', name: 'name' });
    expect(ids(spec(t))).not.toContain('DS-W-005');
  });

  it('FR-27: DS-W-006 a description is one short sentence (140 characters at most)', () => {
    expect(ids(spec({ ...signIn(), props: { title: 'Sign in', description: 'x '.repeat(80) } }))).toContain('DS-W-006');
  });
});

describe('FR-21 page-layer rules are switched by config until the Composer uses templates', () => {
  const bare = spec(n('stack', {}, [n('button', { label: 'Submit' })]));
  const ctx = (s: ScreenSpec, tsx = '<div style={{ padding: 8 }} />') =>
    ({ taskId: 't', runId: 'r', spec: s, tsx, repoRoot: root, render: async () => { throw new Error('not rendered'); } }) as never;

  it('FR-21: off by default: the QA checks report no DS-P or DS-W findings', async () => {
    delete process.env['ADS_PAGE_LAYER'];
    const { default: audit } = await import('../audit.js');
    const { default: lint } = await import('../../token-lint/qa.js');
    const all = [...(await audit.run(ctx(bare))).findings, ...(await lint.run(ctx(bare))).findings].map((f) => f.ruleId);
    expect(all.filter((id) => /^DS-[PW]-/.test(id))).toEqual([]);
  });

  it('FR-21: on: rules-audit adds composition and copy findings, token lint adds DS-P-004', async () => {
    process.env['ADS_PAGE_LAYER'] = '1';
    try {
      const { default: audit } = await import('../audit.js');
      const { default: lint } = await import('../../token-lint/qa.js');
      const a = (await audit.run(ctx(bare))).findings.map((f) => f.ruleId);
      expect(a).toEqual(expect.arrayContaining(['DS-P-001', 'DS-W-002']));
      expect((await lint.run(ctx(bare))).findings.map((f) => f.ruleId)).toContain('DS-P-004');
    } finally {
      delete process.env['ADS_PAGE_LAYER'];
    }
  });
});
