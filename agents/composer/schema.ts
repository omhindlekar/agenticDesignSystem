import { z } from 'zod';
import { ContextPackSchema } from '../../packages/schemas/src/context-pack.js';

export const ComposerInputSchema = z.object({
  taskId: z.string().min(1),
  brief: z.string().min(1),
  contextPack: ContextPackSchema,
});

export type ComposerInput = z.infer<typeof ComposerInputSchema>;
