import { z } from 'zod';

/** Where each agent may read and write (PRD: governance). Paths are repo-relative globs. */
export const AgentPermissionsSchema = z.object({
  read: z.array(z.string().min(1)),
  write: z.array(z.string().min(1)),
  /** Paths the agent must never write, even if a write glob would match. */
  never: z.array(z.string().min(1)),
});

export const PermissionsSchema = z.object({
  agents: z.record(AgentPermissionsSchema),
});

export type AgentPermissions = z.infer<typeof AgentPermissionsSchema>;
export type Permissions = z.infer<typeof PermissionsSchema>;
