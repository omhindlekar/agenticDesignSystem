import { z } from 'zod';

/**
 * The orchestrator's pipeline, read from config/pipeline.json (NFR-10). Adding an agent
 * means a registry entry, a schema, instructions and tests, plus a step here; the
 * orchestrator code does not change.
 */
export const PipelineStepSchema = z.object({
  /** Registry name of the agent that runs this step. */
  agent: z.string().min(1),
  /** Which schema validates this step's output (a key of the handoff schema registry). */
  output: z.string().min(1),
  /** Model-backed steps count towards calls and cost; deterministic ones do not. */
  modelBacked: z.boolean(),
  retry: z
    .object({
      /** schema: retry this step when its output fails validation. qa-fail: when its report fails, re-run feedbackTo. */
      on: z.enum(['schema', 'qa-fail']),
      /** Step to re-run with the failure as feedback (defaults to this step). */
      feedbackTo: z.string().min(1).optional(),
    })
    .optional(),
});

export const PipelineSchema = z
  .object({
    schemaVersion: z.string().min(1),
    steps: z.array(PipelineStepSchema).min(1),
  })
  .superRefine((p, ctx) => {
    const names = p.steps.map((s) => s.agent);
    if (new Set(names).size !== names.length)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'each agent runs once' });
    p.steps.forEach((s, i) => {
      const target = s.retry?.feedbackTo;
      if (target && !names.slice(0, i).includes(target))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${s.agent}: feedbackTo ${target} must be an earlier step`,
        });
    });
  });

export type PipelineStep = z.infer<typeof PipelineStepSchema>;
export type Pipeline = z.infer<typeof PipelineSchema>;
