import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TokenSchema } from '../../../packages/schemas/src/token.js';
import type { Token } from '../../../packages/schemas/src/token.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

function loadTokenFile(filename: string): { tokens: unknown[] } {
  const raw = readFileSync(join(root, 'tokens', filename), 'utf8');
  return JSON.parse(raw) as { tokens: unknown[] };
}

describe('FR-1 Token file structure', () => {
  it('FR-1: primitives.json contains only primitive-tier tokens', () => {
    const { tokens } = loadTokenFile('primitives.json');
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      const result = TokenSchema.safeParse(token);
      expect(result.success, `Token ${(token as Record<string, unknown>)['name']} failed schema`).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe('primitive');
      }
    }
  });

  it('FR-1: semantic.json contains only semantic-tier tokens', () => {
    const { tokens } = loadTokenFile('semantic.json');
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) {
      const result = TokenSchema.safeParse(token);
      expect(result.success, `Token ${(token as Record<string, unknown>)['name']} failed schema`).toBe(true);
      if (result.success) {
        expect(result.data.tier).toBe('semantic');
      }
    }
  });

  it('FR-1: every semantic token references a known primitive', () => {
    const { tokens: primitives } = loadTokenFile('primitives.json');
    const { tokens: semantics } = loadTokenFile('semantic.json');

    const primitiveNames = new Set(
      primitives
        .map((t) => TokenSchema.parse(t))
        .filter((t): t is Extract<Token, { tier: 'primitive' }> => t.tier === 'primitive')
        .map((t) => t.name),
    );

    for (const token of semantics) {
      const parsed = TokenSchema.parse(token);
      if (parsed.tier === 'semantic') {
        expect(
          primitiveNames.has(parsed.reference),
          `Semantic token "${parsed.name}" references unknown primitive "${parsed.reference}"`,
        ).toBe(true);
      }
    }
  });

  it('FR-1: token names are unique across both files', () => {
    const { tokens: primitives } = loadTokenFile('primitives.json');
    const { tokens: semantics } = loadTokenFile('semantic.json');
    const all = [...primitives, ...semantics].map((t) => TokenSchema.parse(t).name);
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });

  it('FR-1: primitives cover color, space, radius, font-size, font-weight categories', () => {
    const { tokens } = loadTokenFile('primitives.json');
    const names = tokens.map((t) => TokenSchema.parse(t).name);
    expect(names.some((n) => n.startsWith('color-'))).toBe(true);
    expect(names.some((n) => n.startsWith('space-'))).toBe(true);
    expect(names.some((n) => n.startsWith('radius-'))).toBe(true);
    expect(names.some((n) => n.startsWith('font-size-'))).toBe(true);
    expect(names.some((n) => n.startsWith('font-weight-'))).toBe(true);
  });
});
