import { describe, it, expect } from 'vitest';
import { QAReportSchema } from '../src/qa-report.js';

const validReport = {
  taskId: 'task-001',
  overallStatus: 'fail',
  checks: [
    {
      checkName: 'token-lint',
      status: 'fail',
      failingRuleIds: ['DS-001'],
      reason: 'Found hardcoded colour #3b82f6 in Button.tsx line 12',
      evidenceLinks: ['runs/run-abc/token-lint-output.json'],
    },
    {
      checkName: 'accessibility',
      status: 'pass',
      failingRuleIds: [],
    },
  ],
};

describe('FR-9 QAReportSchema', () => {
  it('FR-9: accepts a valid QA report', () => {
    expect(QAReportSchema.safeParse(validReport).success).toBe(true);
  });

  it('FR-9: accepts an all-pass report', () => {
    const passing = {
      taskId: 'task-002',
      overallStatus: 'pass',
      checks: [{ checkName: 'token-lint', status: 'pass', failingRuleIds: [] }],
    };
    expect(QAReportSchema.safeParse(passing).success).toBe(true);
  });

  it('FR-9: rejects an unknown overall status', () => {
    expect(QAReportSchema.safeParse({ ...validReport, overallStatus: 'unknown' }).success).toBe(false);
  });

  it('FR-9: rejects a check with an unknown status', () => {
    const bad = {
      ...validReport,
      checks: [{ checkName: 'token-lint', status: 'maybe', failingRuleIds: [] }],
    };
    expect(QAReportSchema.safeParse(bad).success).toBe(false);
  });

  it('FR-9: rejects a report missing taskId', () => {
    const { taskId: _t, ...noTask } = validReport;
    expect(QAReportSchema.safeParse(noTask).success).toBe(false);
  });

  it('FR-9: accepts skipped checks', () => {
    const skipped = {
      taskId: 'task-003',
      overallStatus: 'pass',
      checks: [{ checkName: 'visual-regression', status: 'skipped', failingRuleIds: [] }],
    };
    expect(QAReportSchema.safeParse(skipped).success).toBe(true);
  });
});

describe('FR-9, FR-20 QAReportSchema findings', () => {
  const finding = {
    checkName: 'token-lint',
    ruleId: 'DS-001',
    message: 'Use a colour token instead of #3b82f6.',
    evidence: 'screen.tsx:12',
  };
  it('FR-20: accepts findings that explain every failing rule in one sentence', () => {
    expect(QAReportSchema.safeParse({ ...validReport, findings: [finding] }).success).toBe(true);
  });
  it('FR-20: rejects a failing rule with no finding explaining it', () => {
    expect(QAReportSchema.safeParse({ ...validReport, findings: [] }).success).toBe(false);
  });
  it('FR-11: an accessibility finding can cite the WCAG success criterion', () => {
    const a11y = {
      checkName: 'accessibility',
      ruleId: 'DS-A-001',
      criterion: '1.4.3',
      message: 'Text contrast is 3.1:1; it needs 4.5:1.',
    };
    expect(QAReportSchema.safeParse({ ...validReport, findings: [finding, a11y] }).success).toBe(true);
  });
  it('FR-9: overallStatus must agree with the checks', () => {
    expect(QAReportSchema.safeParse({ ...validReport, overallStatus: 'pass' }).success).toBe(false);
    const allPass = {
      taskId: 't',
      overallStatus: 'fail',
      checks: [{ checkName: 'x', status: 'pass', failingRuleIds: [] }],
    };
    expect(QAReportSchema.safeParse(allPass).success).toBe(false);
  });
  it('FR-9: skipped checks are allowed in a passing report', () => {
    const r = {
      taskId: 't',
      overallStatus: 'pass',
      checks: [{ checkName: 'visual', status: 'skipped', failingRuleIds: [], reason: 'No approved baseline.' }],
    };
    expect(QAReportSchema.safeParse(r).success).toBe(true);
  });
});
