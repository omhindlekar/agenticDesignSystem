import { z } from 'zod';

export type ComponentNode = {
  component: string;
  props: Record<string, unknown>;
  tokenRefs: string[];
  states: string[];
  children?: ComponentNode[] | undefined;
  /** The named slot of the parent template this node fills (phase 2c). */
  slot?: string | undefined;
  /** The dossier's required part this node fulfils. */
  part?: string | undefined;
  /** Id of the dossier innovation that justifies a departure from the pattern. */
  deviation?: string | undefined;
};

export const ComponentNodeSchema: z.ZodType<ComponentNode> = z.lazy(() =>
  z.object({
    component: z.string().min(1),
    props: z.record(z.unknown()),
    tokenRefs: z.array(z.string()),
    states: z.array(z.string()),
    children: z.array(ComponentNodeSchema).optional(),
    slot: z.string().min(1).optional(),
    part: z.string().min(1).optional(),
    deviation: z.string().min(1).optional(),
  }),
);

export const ScreenSpecSchema = z.object({
  taskId: z.string().min(1),
  /** Classified screen type, for example auth, settings or dashboard (phase 2c). */
  screenType: z.string().min(1).optional(),
  /** Id of the page template at the root of the tree. */
  template: z.string().min(1).optional(),
  /** Id of the design dossier the spec was composed from. */
  dossierId: z.string().min(1).optional(),
  tree: ComponentNodeSchema,
  statesCovered: z.array(z.string()),
});

export type ScreenSpec = z.infer<typeof ScreenSpecSchema>;
