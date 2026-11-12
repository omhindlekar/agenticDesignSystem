import { z } from 'zod';
import { RunOutcomeSchema } from '../../packages/schemas/src/run-log-entry.js';

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
});

export type TaskInput = z.infer<typeof TaskInputSchema>;
export type OrchestratorResult = z.infer<typeof OrchestratorResultSchema>;
