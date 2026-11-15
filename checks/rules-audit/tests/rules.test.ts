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
    const poc = ['button', 'input', 'select', 'checkbox', 'card', 'modal', 'icon', 'icon-button', 'textarea', 'search-field', 'field', 'radio-group', 'switch', 'segmented-control', 'slider', 'number-field', 'combobox', 'date-picker', 'spinner', 'progress-bar', 'banner', 'toast-region', 'badge', 'tooltip', 'popover', 'menu', 'drawer', 'link', 'tabs', 'breadcrumbs', 'side-nav', 'app-header'];
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

describe('FR-4 rules.yaml: visual direction rules', () => {
  it.each([
    ['DS-T-004', 'token-lint', /radius/i],
    ['DS-A-006', 'token-lint', /lime/i],
    ['DS-L-003', 'token-lint', /font-family-display/],
  ])('FR-4: %s exists, is an auto %s check and states its intent', (id, checkName, statement) => {
    const rule = loadRules().find((r) => r.id === id);
    expect(rule, `${id} missing`).toBeDefined();
    expect(rule?.check).toBe('auto');
    expect(rule?.checkName).toBe(checkName);
    expect(rule?.statement).toMatch(statement);
  });

  it('FR-4: every ruleRef emitted by token lint is a rule in rules.yaml', async () => {
    const { RULE_REFS } = await import('../../token-lint/index.js');
    const ids = new Set(loadRules().map((r) => r.id));
    for (const ref of RULE_REFS) expect(ids.has(ref), ref).toBe(true);
  });
});

describe('FR-4 rules.yaml: icons', () => {
  it('FR-4: DS-I-001 governs icons, is checked by token-lint and applies to icon and icon-button', () => {
    const r = loadRules().find((x) => x.id === 'DS-I-001');
    expect(r?.checkName).toBe('token-lint');
    expect(r?.statement).toMatch(/Icon/);
    expect(r?.statement).toMatch(/label/);
    expect(r?.appliesTo).toEqual(expect.arrayContaining(['icon', 'icon-button']));
  });
});

describe('FR-4 rules.yaml: phase 1.7 foundations', () => {
  const rule = (id: string): Rule | undefined => loadRules().find((r) => r.id === id);
  it('FR-4: DS-M-001 requires motion tokens and the reduced-motion guard', () => {
    expect(rule('DS-M-001')?.checkName).toBe('token-lint');
    expect(rule('DS-M-001')?.statement).toMatch(/prefers-reduced-motion/);
  });
  it('FR-4: DS-T-005 requires opacity tokens for state layers and disabled content', () => {
    expect(rule('DS-T-005')?.checkName).toBe('token-lint');
    expect(rule('DS-T-005')?.statement).toMatch(/opacity-state|opacity-disabled/);
  });
  it('FR-4: DS-A-003 cites SC 2.5.8 with a 24px minimum', () => {
    expect(rule('DS-A-003')?.statement).toMatch(/2\.5\.8/);
    expect(rule('DS-A-003')?.statement).toMatch(/24/);
  });
  it('FR-4: DS-L-002 takes shadows only from elevation tokens', () => {
    expect(rule('DS-L-002')?.statement).toMatch(/elevation/);
  });
  it('FR-4: DS-A-001 states the disabled exemption', () => {
    expect(rule('DS-A-001')?.statement).toMatch(/disabled/i);
  });
});

describe('FR-4 rules.yaml: pickers', () => {
  it('FR-4: DS-C-006 points native and hand-rolled pickers to Select, Combobox and DatePicker', () => {
    const r = loadRules().find((x) => x.id === 'DS-C-006');
    expect(r?.checkName).toBe('token-lint');
    for (const name of ['Select', 'Combobox', 'DatePicker']) expect(r?.statement).toContain(name);
    expect(r?.appliesTo).toEqual(expect.arrayContaining(['select', 'combobox', 'date-picker']));
  });
});
