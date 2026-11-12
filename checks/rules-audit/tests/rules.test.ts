import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import { RuleSchema } from '../../../packages/schemas/src/rule.js';
import type { Rule } from '../../../packages/schemas/src/rule.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

function loadRules(): Rule[] {
  const raw = readFileSync(join(root, 'rules', 'rules.yaml'), 'utf8');
  const parsed = yamlLoad(raw) as { rules: unknown[] };
  return parsed.rules.map((r) => RuleSchema.parse(r));
}

describe('FR-4 rules.yaml: structure and schema', () => {
  it('FR-4: rules.yaml exists and is non-empty', () => {
    const rules = loadRules();
    expect(rules.length).toBeGreaterThan(0);
  });

  it('FR-4: every rule passes RuleSchema validation', () => {
    const raw = readFileSync(join(root, 'rules', 'rules.yaml'), 'utf8');
    const parsed = yamlLoad(raw) as { rules: unknown[] };
    for (const r of parsed.rules) {
      const result = RuleSchema.safeParse(r);
      expect(result.success, `Rule failed schema: ${JSON.stringify(r)}`).toBe(true);
    }
  });

  it('FR-4: every rule id is unique', () => {
    const rules = loadRules();
    const ids = rules.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('FR-4: every auto rule has a checkName field', () => {
    const rules = loadRules();
    for (const rule of rules.filter((r) => r.check === 'auto')) {
      expect(
        rule.checkName,
        `Auto rule "${rule.id}" is missing checkName`,
      ).toBeTruthy();
    }
  });

  it('FR-4: every checkName on an auto rule is a known check', () => {
    const knownChecks = new Set(['token-lint', 'a11y', 'visual', 'rules-audit']);
    const rules = loadRules();
    for (const rule of rules.filter((r) => r.check === 'auto')) {
      expect(
        knownChecks.has(rule.checkName!),
        `Rule "${rule.id}" has unknown checkName "${rule.checkName}"`,
      ).toBe(true);
    }
  });

  it('FR-4: there are at least 12 rules (enough for the 30% context threshold)', () => {
    expect(loadRules().length).toBeGreaterThanOrEqual(12);
  });

  it('FR-4: every rule has a non-empty appliesTo array', () => {
    for (const rule of loadRules()) {
      expect(rule.appliesTo.length, `Rule "${rule.id}" has empty appliesTo`).toBeGreaterThan(0);
    }
  });

  it('FR-4: rules cover all POC components in their appliesTo fields', () => {
    const poc = ['button', 'input', 'select', 'checkbox', 'card', 'modal'];
    const covered = new Set(loadRules().flatMap((r) => r.appliesTo));
    for (const c of poc) {
      expect(covered.has(c), `No rule applies to "${c}"`).toBe(true);
    }
  });

  it('FR-4: mix of auto and manual rules exists', () => {
    const rules = loadRules();
    expect(rules.some((r) => r.check === 'auto')).toBe(true);
    expect(rules.some((r) => r.check === 'manual')).toBe(true);
  });

  it('FR-4: mix of error and warning severities exists', () => {
    const rules = loadRules();
    expect(rules.some((r) => r.severity === 'error')).toBe(true);
    expect(rules.some((r) => r.severity === 'warning')).toBe(true);
  });
});
