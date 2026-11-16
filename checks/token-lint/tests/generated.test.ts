import { describe, it, expect } from 'vitest';
import { lintGeneratedLayout } from '../generated.js';

describe('FR-21 DS-P-004: generated screens take layout only from layout components and templates', () => {
  it('FR-21: flags inline layout styles, even with tokens', () => {
    const tsx = `export default () => (<div style={{ display: 'flex', gap: 'var(--space-component-gap-md)' }}><Input label="Email" /></div>);`;
    const v = lintGeneratedLayout(tsx);
    expect(v.map((x) => x.match)).toEqual(['display', 'gap']);
    expect(v.every((x) => x.ruleRef === 'DS-P-004')).toBe(true);
  });

  it.each(['margin', 'marginTop', 'padding', 'paddingInline', 'width', 'maxWidth', 'height', 'gridTemplateColumns', 'flexDirection', 'background', 'backgroundColor', 'position'])(
    'FR-21: flags %s in a style prop',
    (prop) => {
      expect(lintGeneratedLayout(`<div style={{ ${prop}: 'x' }} />`).map((x) => x.match)).toEqual([prop]);
    },
  );

  it('FR-21: flags a style block and className-based layout utilities', () => {
    expect(lintGeneratedLayout('<style>{`.x { display: grid }`}</style>').map((x) => x.pattern)).toContain('style-element');
  });

  it('FR-21: allows screens composed from templates and layout components', () => {
    const tsx = `import { AuthPage, Stack, Input, Button } from '@ads/components';
export default function Screen() {
  return (
    <AuthPage title="Sign in" primaryAction={<Button label="Sign in" type="submit" />}>
      <Stack gap="md"><Input label="Email address" type="email" /></Stack>
    </AuthPage>
  );
}`;
    expect(lintGeneratedLayout(tsx)).toEqual([]);
  });

  it('FR-21: reports the line and column of each finding', () => {
    const v = lintGeneratedLayout('const a = 1;\n<div style={{ padding: 8 }} />');
    expect(v[0]).toMatchObject({ line: 2, match: 'padding' });
  });
});
