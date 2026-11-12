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
      checks: [
        { checkName: 'token-lint', status: 'pass', failingRuleIds: [] },
      ],
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
      checks: [
        { checkName: 'visual-regression', status: 'skipped', failingRuleIds: [] },
      ],
    };
    expect(QAReportSchema.safeParse(skipped).success).toBe(true);
  });
});
