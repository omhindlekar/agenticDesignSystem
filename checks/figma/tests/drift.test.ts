import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPayload,
  buildPushScripts,
  figmaName,
  scopesFor,
  sourceHashes,
  MANIFEST,
} from '../../../scripts/figma-sync.js';
import type { SyncManifest } from '../../../scripts/figma-sync.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');

describe('FR-2, BR-4 Figma library in step with the repo (one-way push)', () => {
  const payload = buildPayload(root);

  it('FR-2: the push covers every token collection, the type roles, elevation and every component', () => {
    expect(payload.collections.map((c) => [c.name, c.modes])).toEqual([
      ['Primitives', ['Value']],
      ['Color', ['Light', 'Dark', 'High contrast']],
      ['Semantic', ['Comfortable', 'Compact']],
    ]);
    expect(payload.textStyles).toHaveLength(12);
    expect(payload.effectStyles.map((e) => e.name)).toEqual([
      'Elevation/0',
      'Elevation/1',
      'Elevation/2',
      'Elevation/3',
      'Elevation/4',
    ]);
    expect(payload.components.length).toBeGreaterThanOrEqual(42);
  });

  it('FR-2: semantic variables alias primitives in every mode, with web code syntax and explicit scopes', () => {
    const primitives = new Set(payload.collections[0]!.variables.map((v) => v.name));
    for (const c of payload.collections.slice(1)) {
      for (const v of c.variables) {
        expect(v.css).toMatch(/^var\(--[a-z0-9-]+\)$/);
        for (const m of c.modes)
          expect(primitives.has((v.values[m] as { alias: string }).alias), `${v.name} ${m}`).toBe(true);
      }
    }
    expect(payload.collections.flatMap((c) => c.variables).some((v) => v.scopes.includes('ALL_SCOPES'))).toBe(false);
  });

  it('FR-2: names, scopes and opacity units map for Figma', () => {
    expect(figmaName('color-text-primary')).toBe('color/text/primary');
    expect(figmaName('space-component-padding-md')).toBe('space/component-padding-md');
    expect(scopesFor('color-text-link', 'COLOR', 'semantic')).toEqual(['TEXT_FILL']);
    expect(scopesFor('color-border-input', 'COLOR', 'semantic')).toEqual(['STROKE_COLOR']);
    expect(scopesFor('color-white', 'COLOR', 'primitive')).toEqual([]);
    const opacity = payload.collections[0]!.variables.find((v) => v.name === 'opacity/38');
    expect(opacity?.values['Value']).toBe(38);
  });

  it('BR-4: the push scripts are generated from the repo and fit the use_figma size limit', () => {
    const scripts = buildPushScripts(payload, root);
    expect(Object.keys(scripts)).toHaveLength(11);
    for (const [name, code] of Object.entries(scripts)) expect(code.length, name).toBeLessThan(50_000);
  });

  it('BR-4: the push scripts are incremental, so pushing to the live library never duplicates anything', () => {
    const scripts = buildPushScripts(payload, root);
    for (const [name, code] of Object.entries(scripts)) {
      // Every create is guarded by a lookup of what already exists in the file.
      if (/createVariableCollection\(/.test(code)) expect(code, name).toMatch(/getLocalVariableCollectionsAsync/);
      if (/createVariable\(/.test(code)) expect(code, name).toMatch(/getLocalVariablesAsync/);
      if (/createTextStyle\(/.test(code)) expect(code, name).toMatch(/getLocalTextStylesAsync/);
      if (/createEffectStyle\(/.test(code)) expect(code, name).toMatch(/getLocalEffectStylesAsync/);
    }
    expect(scripts['03-pages-icons.js']).toMatch(/GLY_HAVE/);
    expect(scripts['10-layout.js']).toMatch(/'Layout'/);
    expect(scripts['11-templates.js']).toMatch(/'Templates'/);
    expect(scripts['03-pages-icons.js']).toMatch(/'Layout','Templates'/);
  });

  it('BR-4: Figma is not behind the repo — tokens and component metadata match the last recorded push', () => {
    const file = join(root, MANIFEST);
    expect(existsSync(file), 'run npm run figma:sync -- record after pushing').toBe(true);
    const manifest = JSON.parse(readFileSync(file, 'utf8')) as SyncManifest;
    const now = sourceHashes(root);
    expect(manifest.fileKey).toMatch(/^[0-9a-zA-Z]{22,}$/);
    expect(manifest.hashes.tokens, 'tokens changed since the last Figma push').toBe(now.tokens);
    expect(manifest.hashes.components, 'component metadata changed since the last Figma push').toEqual(now.components);
    expect(manifest.counts.components).toBe(payload.components.length);
  });
});
