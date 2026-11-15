import { z } from 'zod';

export const CheckStatusSchema = z.enum(['pass', 'fail', 'skipped']);

/** One problem a check found, in plain language, with the rule it breaks (FR-9, FR-20). */
export const QAFindingSchema = z.object({
  checkName: z.string().min(1),
  ruleId: z.string().min(1),
  /** WCAG success criterion, for accessibility findings (FR-11), e.g. "1.4.3". */
  criterion: z.string().optional(),
  /** One sentence a person can act on. */
  message: z.string().min(1),
  /** Where it was found: a file and line, a spec node path, or a screenshot. */
  evidence: z.string().optional(),
});

const CheckResultSchema = z.object({
  checkName: z.string().min(1),
  status: CheckStatusSchema,
  failingRuleIds: z.array(z.string()),
  reason: z.string().optional(),
  evidenceLinks: z.array(z.string()).optional(),
  durationMs: z.number().int().min(0).optional(),
});

export const QAReportSchema = z
  .object({
    taskId: z.string().min(1),
    overallStatus: CheckStatusSchema,
    checks: z.array(CheckResultSchema),
    findings: z.array(QAFindingSchema).optional(),
    durationMs: z.number().int().min(0).optional(),
  })
  .superRefine((report, ctx) => {
    // A report fails exactly when one of its checks fails.
    const anyFail = report.checks.some((c) => c.status === 'fail');
    if (anyFail && report.overallStatus !== 'fail') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'overallStatus must be fail when a check fails' });
    }
    if (!anyFail && report.overallStatus === 'fail') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'overallStatus is fail but no check failed' });
    }
    // Every failing rule id is explained by a finding.
    if (report.findings) {
      const explained = new Set(report.findings.map((f) => f.ruleId));
      for (const c of report.checks)
        for (const id of c.failingRuleIds)
          if (!explained.has(id))
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: `failing rule ${id} has no finding explaining it` });
    }
  });

export type QAReport = z.infer<typeof QAReportSchema>;
export type CheckResult = z.infer<typeof CheckResultSchema>;
export type QAFinding = z.infer<typeof QAFindingSchema>;
