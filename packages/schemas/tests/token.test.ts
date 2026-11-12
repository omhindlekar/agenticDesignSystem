import { describe, it, expect } from 'vitest';
import { TokenSchema } from '../src/token.js';

describe('FR-1 TokenSchema', () => {
  it('FR-1: accepts a valid primitive token', () => {
    const result = TokenSchema.safeParse({
      name: 'color-blue-500',
      tier: 'primitive',
      value: '#3b82f6',
      description: 'Blue 500',
      deprecated: false,
    });
    expect(result.success).toBe(true);
  });

  it('FR-1: accepts a valid semantic token', () => {
    const result = TokenSchema.safeParse({
      name: 'color-interactive-default',
      tier: 'semantic',
      reference: 'color-blue-500',
      description: 'Default interactive element colour',
      deprecated: false,
    });
    expect(result.success).toBe(true);
  });

  it('FR-1: rejects a primitive token without a value', () => {
    const result = TokenSchema.safeParse({
      name: 'color-blue-500',
      tier: 'primitive',
      description: 'Blue 500',
    });
    expect(result.success).toBe(false);
  });

  it('FR-1: rejects a semantic token without a reference', () => {
    const result = TokenSchema.safeParse({
      name: 'color-interactive-default',
      tier: 'semantic',
      description: 'Default interactive colour',
    });
    expect(result.success).toBe(false);
  });

  it('FR-1: rejects an unknown tier', () => {
    const result = TokenSchema.safeParse({
      name: 'color-blue-500',
      tier: 'design',
      value: '#3b82f6',
      description: 'Blue 500',
    });
    expect(result.success).toBe(false);
  });

  it('FR-1: deprecated defaults to false when omitted', () => {
    const result = TokenSchema.safeParse({
      name: 'color-blue-500',
      tier: 'primitive',
      value: '#3b82f6',
      description: 'Blue 500',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.deprecated).toBe(false);
  });
});
