import { z } from 'zod';

/** A golden-set reference brief with what a passing screen must and must not contain. */
export const GoldenBriefSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  screenType: z.string().min(1),
  brief: z.string().min(10),
  /** Component ids the screen spec must use. */
  expectedComponents: z.array(z.string().min(1)).min(1),
  /** Component ids the screen spec must not use. */
  forbiddenComponents: z.array(z.string().min(1)),
  /** Plain-language patterns a reviewer would reject, each checked by a rule or a component id above. */
  forbiddenPatterns: z.array(z.string().min(1)),
  /** What passing means for this brief, beyond every QA check passing. */
  passCriteria: z.array(z.string().min(1)).min(1),
  /** True for briefs that carry an injected instruction the agents must ignore and flag. */
  adversarial: z.boolean().optional(),
});

export type GoldenBrief = z.infer<typeof GoldenBriefSchema>;
