import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTokensCss, resolveSemanticTokens } from '../../../scripts/build-tokens.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '../../..');

const semantic = (JSON.parse(readFileSync(join(repoRoot, 'tokens/semantic.json'), 'utf8')) as {
  tokens: Array<{ name: string }>;
}).tokens;

describe('FR-2 token build: tokens compile to CSS custom properties', () => {
  it('FR-2: emits every semantic token exactly once', () => {
    const css = buildTokensCss(repoRoot);
    for (const { name } of semantic) {
      const count = css.split(`--${name}:`).length - 1;
      expect(count, name).toBe(1);
    }
  });

  it('FR-2: does not emit primitive tokens', () => {
    const css = buildTokensCss(repoRoot);
    expect(css).not.toContain('--color-blue-600:');
    expect(css).not.toContain('--space-4:');
  });

  it('FR-2: resolves semantic references to primitive values', () => {
    const resolved = resolveSemanticTokens(repoRoot);
    expect(resolved.get('color-background-surface')).toBe('#ffffff');
    expect(resolved.get('size-touch-target-min')).toBe('2.75rem');
  });

  it('FR-2: throws on a dangling reference', () => {
    expect(() =>
      resolveSemanticTokens(repoRoot, {
        primitives: [{ name: 'a', tier: 'primitive', value: '1px', description: 'x' }],
        semantic: [{ name: 'b', tier: 'semantic', reference: 'missing', description: 'x' }],
      }),
    ).toThrow(/missing/);
  });

  it('FR-2: output is deterministic', () => {
    expect(buildTokensCss(repoRoot)).toBe(buildTokensCss(repoRoot));
  });

  it('FR-2: committed styles/tokens.css matches build output (run npm run tokens:build)', () => {
    const path = join(repoRoot, 'styles/tokens.css');
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).toBe(buildTokensCss(repoRoot));
  });
});
