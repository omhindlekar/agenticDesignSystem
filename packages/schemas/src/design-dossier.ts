import { z } from 'zod';
import { OwnWords, PartSchema, PatternSpecSchema } from './pattern-spec.js';

/**
 * The design dossier: the Strategist's output for one brief (FR-22). It embeds the pattern
 * spec it used, so the run log alone replays it, and adds what is specific to the brief:
 * the classification, the parts the brief adds, deliberate improvements and open questions.
 */
export const InnovationSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    change: OwnWords,
    rationale: OwnWords,
    risk: OwnWords,
    /** The rules this change was checked against, and whether it keeps them. */
    rulesChecked: z.array(z.object({ ruleId: z.string().regex(/^DS-[A-Z]-\d{3}$/), ok: z.boolean(), note: OwnWords }).strict()).min(1),
    unconventional: z.boolean(),
  })
  .strict();

export const DesignDossierSchema = z
  .object({
    id: z.string().min(1),
    taskId: z.string().min(1),
    createdAt: z.string().datetime(),
    classification: z
      .object({
        screenType: z.string().min(1),
        userGoal: OwnWords,
        platform: z.enum(['web-desktop', 'web-mobile', 'web-responsive']),
        context: OwnWords,
        confidence: z.number().min(0).max(1),
        /** For a multi-screen pattern, which screen this run builds. */
        flowScreen: z.string().min(1).optional(),
      })
      .strict(),
    pattern: z.object({ id: z.string().min(1), version: z.string().min(1), cacheHit: z.boolean(), spec: PatternSpecSchema }).strict(),
    synthesis: z
      .object({
        parts: z.array(PartSchema.extend({ fromBrief: z.boolean() }).strict()).min(1),
        order: z.array(z.string().min(1)).min(1),
      })
      .strict(),
    innovations: z.array(InnovationSchema).max(2),
    assumptions: z.array(OwnWords),
    openQuestions: z.array(OwnWords),
    provenance: z
      .object({
        model: z.string().min(1),
        calls: z.number().int().min(0),
        /** Path of the research tool log (searches and fetches), when research ran. */
        researchLog: z.string().min(1).optional(),
        references: z.array(z.object({ file: z.string().min(1), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).strict()),
      })
      .strict(),
    /** Instruction-like text found in the brief or in fetched pages; never followed (CLAUDE.md). */
    flags: z.array(z.string()),
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.innovations.filter((i) => i.unconventional).length > 1)
      ctx.addIssue({ code: 'custom', path: ['innovations'], message: 'at most one unconventional innovation' });
    const ids = d.synthesis.parts.map((p) => p.id);
    const required = d.pattern.spec.flow && d.classification.flowScreen
      ? (d.pattern.spec.flow.screens.find((s) => s.id === d.classification.flowScreen)?.parts ?? [])
      : d.pattern.spec.synthesis.requiredParts.map((p) => p.id);
    for (const id of required)
      if (!ids.includes(id))
        ctx.addIssue({ code: 'custom', path: ['synthesis', 'parts'], message: `required part "${id}" of the pattern is missing` });
    const order = d.synthesis.order;
    if (new Set(order).size !== order.length || order.length !== ids.length || order.some((id) => !ids.includes(id)))
      ctx.addIssue({ code: 'custom', path: ['synthesis', 'order'], message: 'the order lists every part exactly once' });
    if (d.classification.flowScreen !== undefined) {
      const screens = d.pattern.spec.flow?.screens.map((s) => s.id) ?? [];
      if (!screens.includes(d.classification.flowScreen))
        ctx.addIssue({ code: 'custom', path: ['classification', 'flowScreen'], message: 'not a screen of the pattern flow' });
    }
  });

export type DesignDossier = z.infer<typeof DesignDossierSchema>;
export type Innovation = z.infer<typeof InnovationSchema>;
