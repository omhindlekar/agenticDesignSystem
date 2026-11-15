import { z } from 'zod';
import { RunOutcomeSchema } from '../../packages/schemas/src/run-log-entry.js';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import { QAReportSchema } from '../../packages/schemas/src/qa-report.js';

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
  /** The last QA report, present once QA has run. */
  qaReport: QAReportSchema.optional(),
  /** Attempts made per agent, by agent name (1 = first try passed; retries = attempts - 1). */
  attempts: z.record(z.number().int().min(0)),
  /** True when every step passed on its first attempt, QA included (first-pass QA rate). */
  firstPass: z.boolean(),
  /** Total model-backed agent calls in this run. */
  calls: z.number().int().min(0),
  /** Total recorded cost in USD for this run. */
  costUsd: z.number().min(0),
  /** Things agents flagged and treated as data, such as instructions inside the brief. */
  flags: z.array(z.string()),
});

export type TaskInput = z.infer<typeof TaskInputSchema>;
export type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;
