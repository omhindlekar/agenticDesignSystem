import { z } from 'zod';

const ReasonedItemSchema = z.object({
  id: z.string().min(1),
  reason: z.string().min(1),
});

export const ContextPackSchema = z.object({
  taskId: z.string().min(1),
  tokenIds: z.array(ReasonedItemSchema),
  componentIds: z.array(ReasonedItemSchema),
  ruleIds: z.array(ReasonedItemSchema),
});

export type ContextPack = z.infer<typeof ContextPackSchema>;
export type ReasonedItem = z.infer<typeof ReasonedItemSchema>;
