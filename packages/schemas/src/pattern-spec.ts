import { z } from 'zod';

/**
 * A pattern spec: cached, versioned research for one screen type, in patterns/<id>.json
 * (FR-23, FR-24). Objects are strict, so nothing beyond these fields — no screenshots, no
 * copied page text — can be stored. Every string is short, in our own words.
 */

/** Research text: one short statement in our own words. */
export const OwnWords = z.string().trim().min(1).max(200);
const Id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase words joined by hyphens');
const Day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'a date as YYYY-MM-DD');

export const SourceSchema = z
  .object({
    url: z.string().url(),
    title: z.string().trim().min(1).max(200),
    publisher: z.string().trim().min(1).max(100),
    retrievedAt: Day,
  })
  .strict();

export const ChecklistItemSchema = z
  .object({
    id: Id,
    statement: OwnWords,
    strength: z.enum(['must', 'should']),
    sources: z.array(SourceSchema).min(1),
  })
  .strict();

export const TeardownSchema = z
  .object({
    product: z.string().trim().min(1).max(80),
    url: z.string().url(),
    retrievedAt: Day,
    structure: z.array(OwnWords).min(1),
    decisions: z.array(OwnWords).min(1),
  })
  .strict();

export const PartSchema = z
  .object({
    id: Id,
    purpose: OwnWords,
    /** The template slot this part fills. */
    slot: z.string().min(1),
    /** Component ids that may fulfil it. */
    accepts: z.array(z.string().min(1)).min(1),
    required: z.boolean(),
    copy: OwnWords.optional(),
  })
  .strict();

const TracedRule = z.object({ text: OwnWords, from: z.array(Id).min(1) }).strict();

export const PatternSpecSchema = z
  .object({
    id: Id,
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'a semantic version'),
    screenType: Id,
    researchedAt: Day,
    expiresAt: Day,
    model: z.string().min(1),
    /** The page template it targets, as <template-id> or <template-id>/<variant>. */
    templateTarget: z.string().regex(/^[a-z-]+(?:\/[a-z0-9-]+)?$/),
    checklist: z.array(ChecklistItemSchema).min(3),
    teardown: z.array(TeardownSchema).min(3).max(5),
    synthesis: z
      .object({
        requiredParts: z.array(PartSchema).min(1),
        optionalParts: z.array(PartSchema),
        order: z.array(Id).min(1),
        spacing: z.array(z.object({ between: OwnWords, token: z.string().min(1) }).strict()),
        copyRules: z.array(TracedRule),
        errorRules: z.array(TracedRule),
      })
      .strict(),
    flow: z
      .object({
        screens: z.array(z.object({ id: Id, title: OwnWords, parts: z.array(Id).min(1) }).strict()).min(2),
      })
      .strict()
      .optional(),
    /** Om's references/ files read for this spec, with a hash of their content. */
    referencesUsed: z.array(z.object({ file: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).strict()),
  })
  .strict()
  .superRefine((p, ctx) => {
    const days = (Date.parse(p.expiresAt) - Date.parse(p.researchedAt)) / 86_400_000;
    if (!(days > 0 && days <= 90))
      ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'must be 1 to 90 days after researchedAt' });
    const checklist = new Set(p.checklist.map((c) => c.id));
    for (const [key, rules] of [['copyRules', p.synthesis.copyRules], ['errorRules', p.synthesis.errorRules]] as const)
      rules.forEach((r, i) =>
        r.from.forEach((f) => {
          if (!checklist.has(f))
            ctx.addIssue({ code: 'custom', path: ['synthesis', key, i, 'from'], message: `"${f}" is not a checklist item` });
        }),
      );
    const parts = [...p.synthesis.requiredParts, ...p.synthesis.optionalParts].map((x) => x.id);
    const known = new Set(parts);
    if (known.size !== parts.length) ctx.addIssue({ code: 'custom', path: ['synthesis'], message: 'part ids must be unique' });
    const order = p.synthesis.order;
    if (new Set(order).size !== order.length)
      ctx.addIssue({ code: 'custom', path: ['synthesis', 'order'], message: 'each part appears once' });
    for (const id of order)
      if (!known.has(id)) ctx.addIssue({ code: 'custom', path: ['synthesis', 'order'], message: `"${id}" is not a part` });
    for (const r of p.synthesis.requiredParts)
      if (!order.includes(r.id))
        ctx.addIssue({ code: 'custom', path: ['synthesis', 'order'], message: `required part "${r.id}" is missing` });
    p.flow?.screens.forEach((s, i) =>
      s.parts.forEach((id) => {
        if (!known.has(id))
          ctx.addIssue({ code: 'custom', path: ['flow', 'screens', i, 'parts'], message: `"${id}" is not a part` });
      }),
    );
  });

export type PatternSpec = z.infer<typeof PatternSpecSchema>;
export type Part = z.infer<typeof PartSchema>;
