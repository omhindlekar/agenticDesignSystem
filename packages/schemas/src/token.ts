import { z } from 'zod';

export const TokenTierSchema = z.enum(['primitive', 'semantic']);

export const TokenSchema = z.discriminatedUnion('tier', [
  z.object({
    name: z.string().min(1),
    tier: z.literal('primitive'),
    value: z.string().min(1),
    description: z.string().min(1),
    deprecated: z.boolean().default(false),
  }),
  z.object({
    name: z.string().min(1),
    tier: z.literal('semantic'),
    reference: z.string().min(1),
    description: z.string().min(1),
    deprecated: z.boolean().default(false),
  }),
]);

export type Token = z.infer<typeof TokenSchema>;
