import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ComponentMetadataSchema } from '../../../packages/schemas/src/component-metadata.js';
import { TokenSchema } from '../../../packages/schemas/src/token.js';
import type { Token } from '../../../packages/schemas/src/token.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

const POC_COMPONENTS = ['button', 'input', 'select', 'checkbox', 'card', 'modal', 'icon', 'icon-button', 'textarea', 'search-field', 'field', 'radio-group', 'switch', 'segmented-control', 'slider', 'number-field', 'combobox', 'date-picker', 'spinner', 'progress-bar', 'banner', 'toast-region', 'badge', 'tooltip', 'popover', 'menu', 'drawer', 'link', 'tabs', 'breadcrumbs', 'side-nav', 'app-header', 'table', 'list', 'tag-group', 'avatar', 'avatar-group', 'divider', 'tree', 'image', 'text', 'heading', 'container', 'stack', 'grid', 'section', 'page-shell'] as const;

function loadMeta(name: string) {
  const path = join(root, 'components', name, `${name}.meta.json`);
  const raw = readFileSync(path, 'utf8');
  return JSON.parse(raw) as unknown;
}

function loadSemanticTokenNames(): Set<string> {
  const raw = readFileSync(join(root, 'tokens', 'semantic.json'), 'utf8');
  const { tokens } = JSON.parse(raw) as { tokens: unknown[] };
  return new Set(
    tokens
      .map((t) => TokenSchema.parse(t))
      .filter((t): t is Extract<Token, { tier: 'semantic' }> => t.tier === 'semantic')
      .map((t) => t.name),
  );
}

describe('FR-3 component metadata: all POC components', () => {
  it('FR-3: meta.json file exists for every POC component', () => {
    for (const name of POC_COMPONENTS) {
      const path = join(root, 'components', name, `${name}.meta.json`);
      expect(existsSync(path), `Missing ${name}.meta.json`).toBe(true);
    }
  });

  it('FR-3: 100% of POC component metadata files pass schema validation', () => {
    let passed = 0;
    for (const name of POC_COMPONENTS) {
      const result = ComponentMetadataSchema.safeParse(loadMeta(name));
      expect(result.success, `${name}.meta.json failed: ${!result.success ? JSON.stringify(result.error.issues) : ''}`).toBe(true);
      if (result.success) passed++;
    }
    expect(passed).toBe(POC_COMPONENTS.length);
  });

  it('FR-3: each metadata id matches its folder name', () => {
    for (const name of POC_COMPONENTS) {
      const result = ComponentMetadataSchema.safeParse(loadMeta(name));
      if (result.success) {
        expect(result.data.id).toBe(name);
      }
    }
  });

  it('FR-3: every tokensUsed entry references a known semantic token', () => {
    const semanticNames = loadSemanticTokenNames();
    for (const name of POC_COMPONENTS) {
      const result = ComponentMetadataSchema.safeParse(loadMeta(name));
      if (result.success) {
        for (const token of result.data.tokensUsed) {
          expect(
            semanticNames.has(token),
            `${name}.meta.json references unknown semantic token "${token}"`,
          ).toBe(true);
        }
      }
    }
  });

  it('FR-3: every component has at least one whenToUse and one whenNotToUse entry', () => {
    for (const name of POC_COMPONENTS) {
      const result = ComponentMetadataSchema.safeParse(loadMeta(name));
      if (result.success) {
        expect(result.data.whenToUse.length, `${name} has no whenToUse`).toBeGreaterThanOrEqual(1);
        expect(result.data.whenNotToUse.length, `${name} has no whenNotToUse`).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('FR-3: every component has at least one a11yNote', () => {
    for (const name of POC_COMPONENTS) {
      const result = ComponentMetadataSchema.safeParse(loadMeta(name));
      if (result.success) {
        expect(result.data.a11yNotes.length, `${name} has no a11yNotes`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('FR-3 component metadata: per-component spot checks', () => {
  it('FR-3: button has contained, outlined and text variants; the old names are deprecated aliases', () => {
    const raw = loadMeta('button') as { deprecatedVariants?: Record<string, string> };
    const result = ComponentMetadataSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.variants).toEqual(['contained', 'outlined', 'text']);
    }
    expect(raw.deprecatedVariants).toEqual({ primary: 'contained', secondary: 'outlined', ghost: 'text', danger: 'contained' });
  });

  it('FR-3: input has disabled state', () => {
    const result = ComponentMetadataSchema.safeParse(loadMeta('input'));
    if (result.success) {
      expect(result.data.states).toContain('disabled');
    }
  });

  it('FR-3: modal has open and closed states', () => {
    const result = ComponentMetadataSchema.safeParse(loadMeta('modal'));
    if (result.success) {
      expect(result.data.states).toContain('open');
      expect(result.data.states).toContain('closed');
    }
  });
});
