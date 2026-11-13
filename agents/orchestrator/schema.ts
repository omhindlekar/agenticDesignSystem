import { z } from 'zod';
import { RunOutcomeSchema } from '../../packages/schemas/src/run-log-entry.js';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';

export const TaskInputSchema = z.object({
  taskId: z.string().min(1),
  brief: z.string().min(1),
  schemaVersion: z.string().min(1),
});

export const OrchestratorResultSchema = z.object({
  taskId: z.string().min(1),
  runId: z.string().min(1),
  outcome: RunOutcomeSchema,
  tsx: z.string().optional(),
  error: z.string().optional(),
  /** The validated Composer output, present once the Composer step has passed. */
  spec: ScreenSpecSchema.optional(),
  /** Attempts made per agent (1 = first try passed; retries = attempts - 1). */
  attempts: z.object({ composer: z.number().int().min(0), builder: z.number().int().min(0) }),
  /** Total model-backed agent calls in this run. */
  calls: z.number().int().min(0),
  /** Total recorded cost in USD for this run. */
  costUsd: z.number().min(0),
});

export type TaskInput = z.infer<typeof TaskInputSchema>;
export type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;
