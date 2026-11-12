import { z } from 'zod';

export const HandoffMessageSchema = z.object({
  runId: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  schemaVersion: z.string().min(1),
  payload: z.unknown(),
  attempt: z.number().int().min(1).max(3),
  timestamp: z.string().datetime(),
});

export type HandoffMessage = z.infer<typeof HandoffMessageSchema>;
