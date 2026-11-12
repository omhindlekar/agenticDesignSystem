import { z } from 'zod';

export const RuleSeveritySchema = z.enum(['error', 'warning', 'info']);
export const RuleCheckSchema = z.enum(['auto', 'manual']);

export const RuleSchema = z.object({
  id: z.string().min(1),
  scope: z.string().min(1),
  statement: z.string().min(1),
  severity: RuleSeveritySchema,
  check: RuleCheckSchema,
  appliesTo: z.array(z.string()).min(1),
  checkName: z.string().optional(),
  example: z.string().optional(),
  counterExample: z.string().optional(),
});

export type Rule = z.infer<typeof RuleSchema>;
