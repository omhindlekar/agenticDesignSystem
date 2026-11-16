import { z } from 'zod';

const PropSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  required: z.boolean(),
  description: z.string().min(1),
});

/** A named region of a page template, and the components that may fill it (phase 2c). */
export const SlotSchema = z.object({
  name: z.string().min(1),
  required: z.boolean(),
  accepts: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
});

export const ComponentMetadataSchema = z.object({
  id: z.string().min(1),
  purpose: z.string().min(1),
  variants: z.array(z.string()),
  states: z.array(z.string()),
  props: z.array(PropSchema),
  whenToUse: z.array(z.string()).min(1),
  whenNotToUse: z.array(z.string()).min(1),
  related: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  tokensUsed: z.array(z.string()),
  a11yNotes: z.array(z.string()),
  /** component (default), layout (a primitive that only arranges) or template (a page with slots). */
  kind: z.enum(['component', 'layout', 'template']).optional(),
  slots: z.array(SlotSchema).optional(),
});

export type ComponentMetadata = z.infer<typeof ComponentMetadataSchema>;
