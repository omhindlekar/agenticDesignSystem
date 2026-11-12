import { z } from 'zod';

export const ContextInputSchema = z.object({
  taskId: z.string().min(1),
  task: z.string(),
});

export type ContextInput = z.infer<typeof ContextInputSchema>;
