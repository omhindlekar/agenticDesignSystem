import { z } from 'zod';

/**
 * runs/<runId>/run.json: what a run was asked to do, so it can be replayed (FR-19).
 * Holds the brief and configuration fingerprint only; never secrets.
 */
export const RunRecordSchema = z.object({
  runId: z.string().min(1),
  taskId: z.string().min(1),
  brief: z.string().min(1),
  schemaVersion: z.string().min(1),
  /** sha256 of config/defaults.json and config/pipeline.json at run time. */
  configHash: z.string().min(1),
  provider: z.string().min(1),
  model: z.string().min(1),
  /** Instruction-like text found in the brief, treated as data and flagged. */
  flags: z.array(z.string()),
  /** Golden-set id when the run compared against a visual baseline. */
  baselineId: z.string().optional(),
  startedAt: z.string().datetime(),
});

export type RunRecord = z.infer<typeof RunRecordSchema>;
