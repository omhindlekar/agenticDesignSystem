import { z } from 'zod';

export type ComponentNode = {
  component: string;
  props: Record<string, unknown>;
  tokenRefs: string[];
  states: string[];
  children?: ComponentNode[] | undefined;
};

export const ComponentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() =>
  z.object({
    component: z.string().min(1),
    props: z.record(z.unknown()),
    tokenRefs: z.array(z.string()),
    states: z.array(z.string()),
    children: z.array(ComponentNodeSchema).optional(),
  }),
);

export const ScreenSpecSchema = z.object({
  taskId: z.string().min(1),
  tree: ComponentNodeSchema,
  statesCovered: z.array(z.string()),
});

export type ScreenSpec = z.infer<typeof ScreenSpecSchema>;
