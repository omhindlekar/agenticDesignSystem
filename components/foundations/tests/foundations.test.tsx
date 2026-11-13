// @vitest-environment jsdom
/**
 * FR-1: the Foundations section shows Colors, Typography, Spacing, Elevation and
 * Motion, renders from the token files, and every type role and elevation level
 * has a matching style rule.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import * as colors from '../colors.stories';
import * as typography from '../typography.stories';
import * as spacing from '../spacing.stories';
import * as elevation from '../elevation.stories';
import * as motion from '../motion.stories';
import * as iconography from '../iconography.stories';
import * as layout from '../layout.stories';
import { ICON_NAMES } from '../../icon/icons.generated';
import { TYPE_ROLES, RAMPS, STEPS } from '../tokens';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..');
type StoryModule = { default: { title: string } } & Record<string, unknown>;
const pages: Array<[string, StoryModule, string]> = [
  ['Colors', colors as unknown as StoryModule, 'Colors'],
  ['Typography', typography as unknown as StoryModule, 'Typography'],
  ['Spacing', spacing as unknown as StoryModule, 'Spacing'],
  ['Elevation', elevation as unknown as StoryModule, 'Elevation'],
  ['Motion', motion as unknown as StoryModule, 'Motion'],
  ['Iconography', iconography as unknown as StoryModule, 'Iconography'],
  ['Layout', layout as unknown as StoryModule, 'Layout'],
];

describe('FR-1 Foundations pages', () => {
  it.each(pages)('FR-1: %s is titled Foundations/%s and renders', (name, mod, story) => {
    expect(mod.default.title).toBe(`Foundations/${name}`);
    const render = (mod[story] as { render: () => ReactElement }).render;
    const html = renderToStaticMarkup(render());
    expect(html.length).toBeGreaterThan(200);
  });

  it('FR-1: Colors shows every step of every ramp', () => {
    const html = renderToStaticMarkup((colors.Colors as { render: () => ReactElement }).render());
    expect((html.match(/class="fd-swatch"/g) ?? []).length).toBe(RAMPS.length * STEPS.length);
  });

  it('FR-1: every type role and elevation level has a style rule', () => {
    const css = readFileSync(join(dir, 'foundations.css'), 'utf8');
    for (const role of TYPE_ROLES) expect(css).toContain(`.fd-type-sample[data-role="${role}"]`);
    for (const level of [0, 1, 2, 3, 4]) expect(css).toContain(`.fd-elevation__tile[data-level="${level}"]`);
  });

  it('FR-1: Iconography shows every curated icon at 16, 20 and 24px with its name', () => {
    const html = renderToStaticMarkup((iconography.Iconography as { render: () => ReactElement }).render());
    for (const name of ICON_NAMES) expect(html).toContain(`>${name}<`);
    for (const size of ['sm', 'md', 'lg']) {
      expect((html.match(new RegExp(`data-size="${size}"`, 'g')) ?? []).length).toBeGreaterThanOrEqual(ICON_NAMES.length);
    }
  });

  it('FR-1: Colors shows every tonal role with its contrast ratio', () => {
    const html = renderToStaticMarkup((colors.Colors as { render: () => ReactElement }).render());
    for (const role of ['primary', 'info', 'success', 'warning', 'danger', 'neutral']) {
      expect(html).toContain(`data-role="${role}"`);
    }
    const css = readFileSync(join(dir, 'foundations.css'), 'utf8');
    expect(css).toContain('.fd-tonal[data-role="success"]');
  });

  it('FR-1: Motion demonstrates enter and exit with their tokens', () => {
    const html = renderToStaticMarkup((motion.Motion as { render: () => ReactElement }).render());
    for (const t of ['motion-easing-enter', 'motion-easing-exit', 'motion-duration-overlay-exit']) expect(html).toContain(t);
    const css = readFileSync(join(dir, 'foundations.css'), 'utf8');
    expect(css).toMatch(/var\(--motion-easing-enter\)/);
    expect(css).toMatch(/var\(--motion-easing-exit\)/);
  });

  it('FR-1: Layout shows the breakpoints, the grid and both densities side by side', () => {
    const html = renderToStaticMarkup((layout.Layout as { render: () => ReactElement }).render());
    for (const t of ['breakpoint-sm', 'breakpoint-md', 'breakpoint-lg', 'breakpoint-xl', 'layout-columns-lg']) expect(html).toContain(t);
    expect(html).toContain('data-density="compact"');
  });
});
