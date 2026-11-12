import { z } from 'zod';
import { ScreenSpecSchema } from '../../packages/schemas/src/screen-spec.js';
import { ContextPackSchema } from '../../packages/schemas/src/context-pack.js';

export const BuilderInputSchema = z.object({
  taskId: z.string().min(1),
  spec: ScreenSpecSchema,
  contextPack: ContextPackSchema,
});

export const BuilderOutputSchema = z.object({
  taskId: z.string().min(1),
  tsx: z.string().min(1),
});

export type BuilderInput = z.infer<typeof BuilderInputSchema>;
export type BuilderOutput = z.infer<typeof BuilderOutputSchema>;
