/**
 * FR-1: the icon set is generated from a curated list of Material Symbols Sharp
 * icons into components/icon/icons.generated.ts, with no colour baked in.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIconsModule } from '../../../scripts/build-icons.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const list = (JSON.parse(readFileSync(join(root, 'components/icon/icon-list.json'), 'utf8')) as { icons: string[] }).icons;

describe('FR-1 icon generator', () => {
  it('FR-1: committed icons.generated.ts matches a fresh build (run npm run icons:build)', () => {
    const committed = readFileSync(join(root, 'components/icon/icons.generated.ts'), 'utf8');
    expect(committed).toBe(buildIconsModule(root));
  });

  it('FR-1: every curated name is in the generated IconName union and path map', () => {
    const mod = buildIconsModule(root);
    for (const name of list) {
      expect(mod).toContain(`'${name}'`);
      expect(mod).toMatch(new RegExp(`\\b${name}: '[^']+'`));
    }
  });

  it('FR-1: the curated list is sorted and has no duplicates', () => {
    expect([...list].sort()).toEqual(list);
    expect(new Set(list).size).toBe(list.length);
  });

  it('FR-1: no fill, stroke or colour value is baked into the generated paths', () => {
    const mod = buildIconsModule(root);
    expect(mod).not.toMatch(/fill|stroke|#[0-9a-f]{3,8}\b|rgb\(/i);
  });

  it('FR-1: an unknown icon name fails the build', () => {
    expect(() => buildIconsModule(root, ['not_a_real_icon'])).toThrow(/not_a_real_icon/);
  });
});
