import { describe, it, expect } from 'vitest';
import { PatternSpecSchema } from '../src/pattern-spec.js';
import { DesignDossierSchema } from '../src/design-dossier.js';
import { HANDOFF_VALIDATORS } from '../src/handoff-registry.js';

const src = (n: number) => ({
  url: `https://example.org/guidance/${n}`,
  title: `Guidance ${n}`,
  publisher: 'Example design system',
  retrievedAt: '2026-11-16',
});
const part = (id: string, slot: string, accepts: string[], required = true) => ({
  id,
  purpose: `The ${id} part`,
  slot,
  accepts,
  required,
});

export const validPattern = () => ({
  id: 'login',
  version: '1.0.0',
  screenType: 'auth',
  researchedAt: '2026-11-16',
  expiresAt: '2027-02-14',
  model: 'claude-sonnet-5-5',
  templateTarget: 'auth-page/centred',
  checklist: [
    { id: 'label-fields', statement: 'Every field has a visible label.', strength: 'must', sources: [src(1)] },
    { id: 'one-primary', statement: 'One primary action.', strength: 'must', sources: [src(2)] },
    { id: 'generic-error', statement: 'Errors never say which detail was wrong.', strength: 'must', sources: [src(3)] },
  ],
  teardown: [1, 2, 3].map((n) => ({
    product: `Product ${n}`,
    url: `https://product${n}.example.com/login`,
    retrievedAt: '2026-11-16',
    structure: ['Logo', 'Title', 'Email', 'Password', 'Sign in'],
    decisions: ['Recovery link sits under the password field.'],
  })),
  synthesis: {
    requiredParts: [
      part('title', 'title', ['heading']),
      part('email', 'form', ['input']),
      part('password', 'form', ['input']),
      part('submit', 'primaryAction', ['button']),
    ],
    optionalParts: [part('recovery', 'secondaryActions', ['link'], false)],
    order: ['title', 'email', 'password', 'recovery', 'submit'],
    spacing: [{ between: 'fields', token: 'space-component-gap-md' }],
    copyRules: [{ text: 'The button says Sign in.', from: ['one-primary'] }],
    errorRules: [{ text: 'Say the email or password is incorrect, never which.', from: ['generic-error'] }],
  },
  referencesUsed: [],
});

const validDossier = () => ({
  id: 'dossier-1',
  taskId: 'task-1',
  createdAt: '2026-11-16T10:00:00.000Z',
  classification: {
    screenType: 'auth',
    userGoal: 'Sign in quickly and safely.',
    platform: 'web-responsive',
    context: 'Returning users on shared office computers.',
    confidence: 0.9,
  },
  pattern: { id: 'login', version: '1.0.0', cacheHit: true, spec: validPattern() },
  synthesis: {
    parts: [
      { ...part('title', 'title', ['heading']), fromBrief: false },
      { ...part('email', 'form', ['input']), fromBrief: false },
      { ...part('password', 'form', ['input']), fromBrief: false },
      { ...part('sso', 'alternative', ['button']), fromBrief: true },
      { ...part('submit', 'primaryAction', ['button']), fromBrief: false },
    ],
    order: ['title', 'email', 'password', 'submit', 'sso'],
  },
  innovations: [
    {
      id: 'innovation-1',
      change: 'Warn under Keep me signed in that it is not for shared computers.',
      rationale: 'Many users sign in on shared office computers.',
      risk: 'One more line of text near the form.',
      rulesChecked: [{ ruleId: 'DS-W-003', ok: true, note: 'Helper text, not a placeholder.' }],
      unconventional: false,
    },
  ],
  assumptions: ['Accounts use email addresses, not usernames.'],
  openQuestions: ['How long does Keep me signed in last?'],
  provenance: { model: 'claude-sonnet-5-5', calls: 1, references: [] },
  flags: [],
});

describe('FR-23, FR-24 PatternSpecSchema', () => {
  it('FR-23: accepts a valid pattern spec', () => {
    const r = PatternSpecSchema.safeParse(validPattern());
    expect(r.success, JSON.stringify(!r.success && r.error.issues)).toBe(true);
  });

  it('FR-24: every checklist item cites at least one source with a URL and retrieval date', () => {
    const p = validPattern();
    p.checklist[0]!.sources = [];
    expect(PatternSpecSchema.safeParse(p).success).toBe(false);
    const q = validPattern();
    (q.checklist[0]!.sources[0] as { retrievedAt: string }).retrievedAt = 'last week';
    expect(PatternSpecSchema.safeParse(q).success).toBe(false);
  });

  it('FR-24: research text is short, our own words: any string over 200 characters is rejected', () => {
    const p = validPattern();
    p.teardown[0]!.decisions = ['x'.repeat(201)];
    expect(PatternSpecSchema.safeParse(p).success).toBe(false);
  });

  it('FR-24: no screenshots or other extra fields can be stored (strict objects)', () => {
    const p = { ...validPattern(), teardown: validPattern().teardown.map((t) => ({ ...t, screenshot: 'data:image/png;base64,AAAA' })) };
    expect(PatternSpecSchema.safeParse(p).success).toBe(false);
    expect(PatternSpecSchema.safeParse({ ...validPattern(), images: [] }).success).toBe(false);
  });

  it('FR-23: a spec expires at most 90 days after its research, and not before it', () => {
    expect(PatternSpecSchema.safeParse({ ...validPattern(), expiresAt: '2027-02-15' }).success).toBe(false);
    expect(PatternSpecSchema.safeParse({ ...validPattern(), expiresAt: '2026-11-15' }).success).toBe(false);
  });

  it('FR-23: the teardown covers 3 to 5 products', () => {
    const p = validPattern();
    expect(PatternSpecSchema.safeParse({ ...p, teardown: p.teardown.slice(0, 2) }).success).toBe(false);
    expect(PatternSpecSchema.safeParse({ ...p, teardown: [...p.teardown, ...p.teardown] }).success).toBe(false);
  });

  it('FR-24: copy and error rules trace to checklist items that exist', () => {
    const p = validPattern();
    p.synthesis.copyRules[0]!.from = ['not-an-item'];
    expect(PatternSpecSchema.safeParse(p).success).toBe(false);
  });

  it('FR-26: the order lists every required part exactly once, and only known parts', () => {
    const p = validPattern();
    p.synthesis.order = ['title', 'email', 'submit'];
    expect(PatternSpecSchema.safeParse(p).success).toBe(false);
    const q = validPattern();
    q.synthesis.order = [...q.synthesis.order, 'mystery'];
    expect(PatternSpecSchema.safeParse(q).success).toBe(false);
  });

  it('FR-23: a flow pattern lists its screens, each with known parts', () => {
    const flow = { screens: [{ id: 'request', title: 'Request a link', parts: ['title', 'email', 'submit'] }, { id: 'sent', title: 'Check your email', parts: ['title'] }] };
    expect(PatternSpecSchema.safeParse({ ...validPattern(), flow }).success).toBe(true);
    flow.screens[1]!.parts = ['nope'];
    expect(PatternSpecSchema.safeParse({ ...validPattern(), flow }).success).toBe(false);
  });
});

describe('FR-22, FR-25 DesignDossierSchema', () => {
  it('FR-22: accepts a valid dossier', () => {
    const r = DesignDossierSchema.safeParse(validDossier());
    expect(r.success, JSON.stringify(!r.success && r.error.issues)).toBe(true);
  });

  it('FR-26: the dossier keeps every required part of its pattern', () => {
    const d = validDossier();
    d.synthesis.parts = d.synthesis.parts.filter((p) => p.id !== 'password');
    d.synthesis.order = d.synthesis.order.filter((id) => id !== 'password');
    expect(DesignDossierSchema.safeParse(d).success).toBe(false);
  });

  it('FR-25: at most two innovations, at most one unconventional, each with a rules check', () => {
    const d = validDossier();
    const inv = d.innovations[0]!;
    expect(DesignDossierSchema.safeParse({ ...d, innovations: [inv, { ...inv, id: 'i2' }, { ...inv, id: 'i3' }] }).success).toBe(false);
    expect(
      DesignDossierSchema.safeParse({ ...d, innovations: [{ ...inv, unconventional: true }, { ...inv, id: 'i2', unconventional: true }] }).success,
    ).toBe(false);
    expect(DesignDossierSchema.safeParse({ ...d, innovations: [{ ...inv, rulesChecked: [] }] }).success).toBe(false);
  });

  it('FR-22: the dossier is a registered pipeline handoff, validated like every other', () => {
    expect(() => HANDOFF_VALIDATORS['design-dossier']!(validDossier())).not.toThrow();
    expect(() => HANDOFF_VALIDATORS['design-dossier']!({ ...validDossier(), innovations: 'none' })).toThrow();
  });

  it('FR-22: classification confidence is between 0 and 1, and the platform is known', () => {
    const d = validDossier();
    expect(DesignDossierSchema.safeParse({ ...d, classification: { ...d.classification, confidence: 1.5 } }).success).toBe(false);
    expect(DesignDossierSchema.safeParse({ ...d, classification: { ...d.classification, platform: 'watch' } }).success).toBe(false);
  });

  it('FR-23: a flow screen must be one the pattern defines', () => {
    const d = validDossier();
    d.pattern.spec = { ...validPattern(), flow: { screens: [{ id: 'request', title: 'Request', parts: ['title'] }, { id: 'sent', title: 'Sent', parts: ['title'] }] } } as never;
    expect(DesignDossierSchema.safeParse({ ...d, classification: { ...d.classification, flowScreen: 'sent' } }).success).toBe(true);
    expect(DesignDossierSchema.safeParse({ ...d, classification: { ...d.classification, flowScreen: 'reset' } }).success).toBe(false);
  });
});
