import { z } from 'zod';

export const CheckStatusSchema = z.enum(['pass', 'fail', 'skipped']);

const CheckResultSchema = z.object({
  checkName: z.string().min(1),
  status: CheckStatusSchema,
  failingRuleIds: z.array(z.string()),
  reason: z.string().optional(),
  evidenceLinks: z.array(z.string()).optional(),
});

export const QAReportSchema = z.object({
  taskId: z.string().min(1),
  overallStatus: CheckStatusSchema,
  checks: z.array(CheckResultSchema),
});

export type QAReport = z.infer<typeof QAReportSchema>;
export type CheckResult = z.infer<typeof CheckResultSchema>;
