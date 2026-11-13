import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkComponent,
  checkProps,
  checkVariants,
  checkCssStates,
  checkStories,
  extractProps,
  parseRootAttributes,
  type StoryCoverage,
} from '../parity.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const POC_COMPONENTS = ['button', 'input', 'select', 'checkbox', 'card', 'modal', 'icon'] as const;

describe('FR-3 component ↔ metadata parity (real components)', () => {
  for (const name of POC_COMPONENTS) {
    it(`FR-3: ${name} matches its metadata (props, variants, states, stories)`, async () => {
      const issues = await checkComponent(join(root, 'components', name));
      expect(issues.map((i) => `${i.kind}: ${i.message}`)).toEqual([]);
    });
  }
});

describe('FR-3 parity checker catches mismatches', () => {
  const meta = {
    id: 'widget',
    variants: ['primary', 'secondary'],
    states: ['default', 'hover', 'focus', 'disabled'],
    props: [
      { name: 'label', type: 'string', required: true },
      { name: 'variant', type: "'primary' | 'secondary'", required: false },
    ],
  };

  it('FR-3: flags a prop in metadata that the component lacks, and the reverse', () => {
    const issues = checkProps(meta, [
      { name: 'variant', type: "'primary' | 'secondary'", required: false },
      { name: 'extra', type: 'string', required: false },
    ]);
    const text = issues.map((i) => i.message).join('\n');
    expect(text).toMatch(/label.*missing from component/);
    expect(text).toMatch(/extra.*not in metadata/);
  });

  it('FR-3: flags required/optional and type mismatches', () => {
    const issues = checkProps(meta, [
      { name: 'label', type: 'number', required: false },
      { name: 'variant', type: "'primary' | 'secondary'", required: false },
    ]);
    const text = issues.map((i) => i.message).join('\n');
    expect(text).toMatch(/label.*required/);
    expect(text).toMatch(/label.*type/);
  });

  it('FR-3: flags a variant missing from the component and an extra one', () => {
    const issues = checkVariants(meta, [{ name: 'variant', type: "'primary' | 'tertiary'", required: false }]);
    const text = issues.map((i) => i.message).join('\n');
    expect(text).toMatch(/secondary.*missing from component/);
    expect(text).toMatch(/tertiary.*not in metadata/);
  });

  it('FR-3: accepts deprecated variant aliases declared in metadata, and only those', () => {
    const withAliases = { ...meta, deprecatedVariants: { tertiary: 'secondary' } };
    const ok = checkVariants(withAliases, [{ name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", required: false }]);
    expect(ok).toEqual([]);
    const missing = checkVariants(withAliases, [{ name: 'variant', type: "'primary' | 'secondary'", required: false }]);
    expect(missing.map((i) => i.message).join('\n')).toMatch(/deprecated alias "tertiary".*missing from component/);
    const badTarget = checkVariants(
      { ...meta, deprecatedVariants: { tertiary: 'quaternary' } },
      [{ name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", required: false }],
    );
    expect(badTarget.map((i) => i.message).join('\n')).toMatch(/tertiary.*maps to "quaternary"/);
  });

  it('FR-3: flags a state with no CSS selector and a CSS state not in metadata', () => {
    const css = `.w:hover {} .w[data-state~="disabled"] {} .w[data-state~="loading"] {}`;
    const text = checkCssStates(meta, css).map((i) => i.message).join('\n');
    expect(text).toMatch(/focus.*no CSS selector/);
    expect(text).toMatch(/loading.*not in metadata/);
    expect(text).not.toMatch(/hover/);
  });

  it('FR-3: flags uncovered and unknown story variants/states, and rendering mismatches', () => {
    const stories: StoryCoverage[] = [
      { name: 'Primary', ads: { variant: 'primary' }, root: { variant: 'primary', states: ['default'] } },
      { name: 'Ghost', ads: { variant: 'ghost' }, root: { variant: 'ghost', states: ['default'] } },
      { name: 'Disabled', ads: { state: 'disabled' }, root: { variant: 'primary', states: ['default'] } },
      { name: 'Hover', ads: { state: 'hover' }, root: { variant: 'primary', states: ['default'] } },
      { name: 'Untagged', ads: {}, root: { variant: 'primary', states: ['default'] } },
    ];
    const text = checkStories(meta, stories).map((i) => i.message).join('\n');
    expect(text).toMatch(/variant "secondary" has no story/);
    expect(text).toMatch(/state "focus" has no story/);
    expect(text).toMatch(/state "default" has no story/);
    expect(text).toMatch(/Ghost.*variant "ghost" not in metadata/);
    expect(text).toMatch(/Disabled.*does not render data-state "disabled"/);
    expect(text).toMatch(/Untagged.*parameters\.ads/);
  });

  it('FR-3: reads prop names, optionality and types from a TSX interface', () => {
    const props = extractProps(join(__dirname, '../fixtures/bad-widget/bad-widget.tsx'), 'BadWidgetProps');
    expect(props).toEqual([
      { name: 'label', type: 'string', required: true },
      { name: 'variant', type: "'primary' | 'tertiary'", required: false },
      { name: 'aria-label', type: 'string', required: false },
    ]);
  });

  it('FR-3: parses root data-variant and data-state from rendered markup only', () => {
    const attrs = parseRootAttributes(
      '<div class="x" data-variant="a" data-state="open loading"><button data-variant="ghost" data-state="default"></button></div>',
    );
    expect(attrs).toEqual({ variant: 'a', states: ['open', 'loading'] });
  });

  it('FR-3: whole-component check fails on a mismatched fixture component', async () => {
    const issues = await checkComponent(join(__dirname, '../fixtures/bad-widget'));
    const kinds = new Set(issues.map((i) => i.kind));
    expect(kinds).toEqual(new Set(['prop', 'variant', 'state', 'story']));
  });
});
