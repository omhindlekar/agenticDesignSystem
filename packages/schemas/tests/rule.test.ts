import { describe, it, expect } from 'vitest';
import { RuleSchema } from '../src/rule.js';

const validRule = {
  id: 'DS-001',
  scope: 'token',
  statement: 'All colours must reference a semantic token',
  severity: 'error',
  check: 'auto',
  appliesTo: ['components'],
  example: 'color: var(--color-interactive-default)',
  counterExample: 'color: #3b82f6',
};

describe('FR-4 RuleSchema', () => {
  it('FR-4: accepts a valid rule', () => {
    expect(RuleSchema.safeParse(validRule).success).toBe(true);
  });

  it('FR-4: accepts a manual rule without example fields', () => {
    const { example: _e, counterExample: _ce, ...minimal } = validRule;
    expect(RuleSchema.safeParse({ ...minimal, check: 'manual' }).success).toBe(true);
  });

  it('FR-4: rejects an unknown severity', () => {
    expect(RuleSchema.safeParse({ ...validRule, severity: 'critical' }).success).toBe(false);
  });

  it('FR-4: rejects an unknown check type', () => {
    expect(RuleSchema.safeParse({ ...validRule, check: 'maybe' }).success).toBe(false);
  });

  it('FR-4: rejects a rule with an empty appliesTo array', () => {
    expect(RuleSchema.safeParse({ ...validRule, appliesTo: [] }).success).toBe(false);
  });

  it('FR-4: rejects a rule missing an id', () => {
    const { id: _id, ...noId } = validRule;
    expect(RuleSchema.safeParse(noId).success).toBe(false);
  });
});
