/**
 * FR-1 token lint extensions: non-zero radius, every form of hardcoded hex,
 * the display-font role rule, and a clean run over components/.
 */
import { describe, it, expect } from 'vitest';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  lintString,
  lintFontRoles,
  lintTokenFiles,
  lintMotionGuard,
  lintDirectory,
  loadSemanticTokenNames,
} from '../index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const patterns = (css: string): string[] => lintString(css, 'x.css').map((v) => v.pattern);

describe('FR-1 token-lint: square corners (DS-T-004)', () => {
  it.each([
    'border-radius: 4px;',
    'border-radius: 0.5rem;',
    'border-radius: 50%;',
    'border-top-left-radius: 2px;',
    "borderRadius: '8px',",
    'border-radius: 0 4px;',
  ])('FR-1: flags non-zero radius in "%s"', (css) => {
    expect(patterns(css)).toContain('non-zero-radius');
  });

  it.each(['border-radius: 0;', 'border-radius: 0px;', 'border-radius: var(--radius-component-sm);'])(
    'FR-1: allows "%s"',
    (css) => {
      expect(patterns(css)).not.toContain('non-zero-radius');
    },
  );

  it('FR-1: non-zero-radius violations cite DS-T-004', () => {
    expect(lintString('border-radius: 50%;')[0]?.ruleRef).toBe('DS-T-004');
  });

  it('FR-1: token files with a non-zero radius are flagged', () => {
    const v = lintTokenFiles(
      [{ name: 'radius-sm', tier: 'primitive', value: '4px', description: 'x' }],
      'primitives.json',
    );
    expect(v.map((x) => x.pattern)).toEqual(['non-zero-radius-token']);
  });

  it('FR-1: the real token files have no non-zero radius', () => {
    expect(lintTokenFiles(undefined, undefined, root)).toEqual([]);
  });
});

describe('FR-1 token-lint: hardcoded hex anywhere (DS-T-001)', () => {
  it('FR-1: flags a hex fallback inside var()', () => {
    expect(patterns('color: var(--color-text-primary, #333333);')).toContain('hex-color');
  });

  it('FR-1: flags a URL-encoded hex inside an SVG data URI', () => {
    expect(patterns(`mask: url("data:image/svg+xml,<svg fill='%23ffffff'/>");`)).toContain('hex-color');
  });

  it('FR-1: does not flag an id selector or a ref like #main', () => {
    expect(patterns('a[href="#main"] { color: var(--color-text-link); }')).not.toContain('hex-color');
  });
});

describe('FR-1 token-lint: display font for headings, buttons and labels (DS-L-003)', () => {
  it('FR-1: flags a button that uses the body font', () => {
    const v = lintFontRoles('.ads-button {\n  font-family: var(--font-family-body);\n}\n', 'button.css');
    expect(v.map((x) => x.pattern)).toEqual(['display-font-role']);
    expect(v[0]?.ruleRef).toBe('DS-L-003');
  });

  it('FR-1: flags a label rule that never sets a font family', () => {
    const v = lintFontRoles('.ads-field__label {\n  font-size: var(--font-size-label-md);\n}\n', 'shared.css');
    expect(v.map((x) => x.pattern)).toEqual(['display-font-role']);
  });

  it('FR-1: passes titles, headings and labels that use the display font', () => {
    const css = [
      '.ads-modal__title { font-family: var(--font-family-display); }',
      '.ads-field__label { font-family: var(--font-family-display); }',
      '.x th, .x .ads-badge { font-family: var(--font-family-display); }',
    ].join('\n');
    expect(lintFontRoles(css, 'ok.css')).toEqual([]);
  });

  it('FR-1: modifier rules for a role may omit font-family', () => {
    const css = '.ads-button { font-family: var(--font-family-display); }\n.ads-button[data-size="sm"] { font-size: var(--font-size-label-sm); }\n';
    expect(lintFontRoles(css, 'b.css')).toEqual([]);
  });

  it('FR-1: body roles (input field) must not use the display font', () => {
    const v = lintFontRoles('.ads-input__field { font-family: var(--font-family-display); }', 'input.css');
    expect(v.map((x) => x.pattern)).toEqual(['body-font-role']);
  });
});

describe('FR-1 token-lint: components/ is clean', () => {
  it('FR-1: components/ has 0 violations, including radius, hex and font roles', async () => {
    const v = await lintDirectory(join(root, 'components'), undefined, loadSemanticTokenNames(root));
    expect(v.map((x) => `${x.file}:${x.line} [${x.pattern}] ${x.match}`)).toEqual([]);
  });
});

describe('FR-1 token-lint: phase 1.7 foundations', () => {
  it.each([
    ['letter-spacing: 0.5px;', 'hardcoded-letter-spacing', 'DS-L-001'],
    ['transition: color 150ms ease;', 'hardcoded-duration', 'DS-M-001'],
    ['animation: spin 1s linear infinite;', 'hardcoded-duration', 'DS-M-001'],
    ['opacity: 0.38;', 'hardcoded-opacity', 'DS-T-005'],
    ['background: color-mix(in srgb, var(--color-text-primary) 38%, transparent);', 'hardcoded-color-mix-percent', 'DS-T-005'],
  ])('FR-1: flags "%s" as %s citing %s', (css, pattern, ref) => {
    const v = lintString(css).filter((x) => x.pattern === pattern);
    expect(v.length, css).toBe(1);
    expect(v[0]?.ruleRef).toBe(ref);
  });

  it.each([
    'letter-spacing: var(--type-body1-letter-spacing);',
    'transition: color var(--motion-duration-standard) var(--motion-easing-standard);',
    'opacity: 0;',
    'opacity: 1;',
    'opacity: var(--opacity-state-hover);',
    'color: color-mix(in srgb, currentColor calc(var(--opacity-disabled) * 100%), transparent);',
    'box-shadow: var(--elevation-2);',
  ])('FR-1: allows "%s"', (css) => {
    expect(lintString(css)).toEqual([]);
  });

  it('FR-1: flags a transition outside a prefers-reduced-motion: no-preference block (DS-M-001)', () => {
    const css = '.a {\n  transition: color var(--motion-duration-standard) ease;\n}\n';
    const v = lintFontRoles(css, 'a.css').concat(lintString(css)).map((x) => x.pattern);
    expect(v).not.toContain('hardcoded-duration');
    const guard = lintMotionGuard(css, 'a.css');
    expect(guard.map((x) => [x.pattern, x.ruleRef])).toEqual([['motion-outside-reduced-motion-guard', 'DS-M-001']]);
  });

  it('FR-1: allows motion inside the no-preference guard, and transition: none anywhere', () => {
    const css = [
      '.a { transition: none; }',
      '@media (prefers-reduced-motion: no-preference) {',
      '  .a {',
      '    transition: color var(--motion-duration-standard) var(--motion-easing-standard);',
      '  }',
      '  .b { animation: ads-spin calc(var(--motion-duration-standard) * 6) linear infinite; }',
      '}',
    ].join('\n');
    expect(lintMotionGuard(css, 'a.css')).toEqual([]);
  });
});
