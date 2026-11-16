import { z } from 'zod';
import { OwnWords } from './pattern-spec.js';

/**
 * A craft-canon entry: one named principle distilled from UI and UX leaders, in canon/<id>.json
 * (FR-24). Our own words, with links; no screenshots, no copied text, no pixel values. Drafts
 * come from `npm run canon:refresh` into canon/drafts/; Om promotes them by pull request.
 */
export const CANON_LEADERS = ['apple', 'linear', 'stripe', 'vercel', 'wise', 'carbon', 'material'] as const;

/** The craft rubric's items (rules/craft-rubric.md, phase 2c PR 7): what `vision:<item>` may name. */
export const CRAFT_RUBRIC_ITEMS = [
  'hierarchy',
  'outcome-clarity',
  'information-order',
  'type-rhythm',
  'spacing-rhythm',
  'alignment',
  'copy-and-tone',
  'action-hierarchy',
  'states',
  'trust-and-polish',
] as const;

const Day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'a date as YYYY-MM-DD');

export const CanonEntrySchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1).max(60),
    /** One line, at most 140 characters. */
    rule: OwnWords.pipe(z.string().max(140).regex(/^[^\n]+$/, 'one line')),
    leaders: z
      .array(z.object({ leader: z.enum(CANON_LEADERS), url: z.string().url(), retrievedAt: Day, note: OwnWords }).strict())
      .min(2)
      .refine((ls) => new Set(ls.map((l) => l.leader)).size === ls.length, 'each leader once'),
    /** Where the principle lives in this system; ids are checked against tokens, components and rules. */
    mapsTo: z.object({ tokens: z.array(z.string()), components: z.array(z.string()), rules: z.array(z.string()) }).strict(),
    /** How QA verifies it: a rules-audit rule, a craft-rubric item scored by the vision review, or manual. */
    check: z
      .string()
      .regex(/^(?:rules-audit:DS-[A-Z]-\d{3}|vision:[a-z-]+|manual)$/)
      .refine((c) => !c.startsWith('vision:') || (CRAFT_RUBRIC_ITEMS as readonly string[]).includes(c.slice(7)), 'vision:<item> must be a craft-rubric item'),
    /** Screen types it applies to, or ["all"]. */
    appliesTo: z.array(z.string().min(1)).min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    refreshedAt: Day,
  })
  .strict();

export type CanonEntry = z.infer<typeof CanonEntrySchema>;
