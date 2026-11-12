import { z } from 'zod';

export const RunOutcomeSchema = z.enum(['pass', 'fail', 'escalate', 'retry']);

export const RunLogEntrySchema = z.object({
  runId: z.string().min(1),
  agent: z.string().min(1),
  inputHash: z.string().min(1),
  outputHash: z.string().min(1),
  toolsUsed: z.array(z.string()),
  ruleIdsConsulted: z.array(z.string()),
  durationMs: z.number().int().min(0),
  outcome: RunOutcomeSchema,
  timestamp: z.string().datetime(),
  costUsd: z.number().min(0).optional(),
});

export type RunLogEntry = z.infer<typeof RunLogEntrySchema>;
export type RunOutcome = z.infer<typeof RunOutcomeSchema>;
