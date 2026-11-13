/**
 * FR-1: the shared popover and list box (Select, Combobox, date picker calendar,
 * later Menu) use elevation 2, square corners, the field type and enter/exit motion.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const css = readFileSync(join(root, 'components/shared/popover.css'), 'utf8');
const rule = (selector: string): string =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((m) => (m[1] ?? '').replace(/\/\*[\s\S]*?\*\//g, '').split(',').some((s) => s.trim() === selector))
    .map((m) => m[2] ?? '')
    .join('\n');

describe('FR-1 shared popover', () => {
  it('FR-1: the popover is elevation 2 with a 1px border on the surface colour', () => {
    const body = rule('.ads-popover');
    expect(body).toMatch(new RegExp(['box', 'shadow'].join('-') + ':\\s*var\\(--shadow-component-menu\\)'));
    expect(body).toMatch(/border:\s*var\(--border-width-default\) solid var\(--color-border-default\)/);
    expect(body).toMatch(/background-color:\s*var\(--color-background-surface\)/);
  });

  it('FR-1: it enters with the enter curve and leaves with the exit curve, only without reduced motion', () => {
    const guard = /@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*)\}\s*$/.exec(css)?.[1] ?? '';
    expect(guard).toMatch(/\[data-entering\][^{]*\{[^}]*var\(--motion-duration-overlay\) var\(--motion-easing-enter\)/);
    expect(guard).toMatch(/\[data-exiting\][^{]*\{[^}]*var\(--motion-duration-overlay-exit\) var\(--motion-easing-exit\)/);
  });

  it('FR-1: list box items are field height, show state layers and mark the selected item', () => {
    expect(rule('.ads-listbox__item')).toMatch(/min-height:\s*var\(--size-control-md\)/);
    expect(css).toMatch(/:is\(\[data-hovered\], :hover\)[^{]*\{[^}]*var\(--opacity-state-hover\)/);
    expect(css).toMatch(/\[data-focused\][^{]*\{[^}]*var\(--opacity-state-focus\)/);
    expect(css).toMatch(/\[data-selected\][^{]*\{[^}]*var\(--color-text-link\)/);
  });
});
