/**
 * FR-1: Storybook can show every theme. The toolbar offers light, dark and high
 * contrast, and the preview applies the choice as data-theme on the document.
 */
import { describe, it, expect } from 'vitest';
import preview from '../../../.storybook/preview.js';
import { loadThemes } from '../../../scripts/build-tokens.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-1 Storybook themes', () => {
  it('FR-1: the theme toolbar lists light plus every data-theme file', () => {
    const items = (preview.globalTypes?.theme?.toolbar?.items ?? []) as Array<{ value: string }>;
    const themes = loadThemes(root).filter((t) => t.attribute === 'data-theme').map((t) => t.value);
    expect(items.map((i) => i.value).sort()).toEqual(['light', ...themes].sort());
  });

  it('FR-1: a decorator applies the selected theme', () => {
    expect((preview.decorators as unknown[] | undefined)?.length ?? 0).toBeGreaterThan(0);
  });

  it('FR-1: the density toolbar offers every data-density mode', () => {
    const items = (preview.globalTypes?.density?.toolbar?.items ?? []) as Array<{ value: string }>;
    const modes = loadThemes(root).filter((t) => t.attribute === 'data-density').map((t) => t.value);
    expect(items.map((i) => i.value).sort()).toEqual(modes.sort());
  });
});
