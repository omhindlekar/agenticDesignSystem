# Agentic Design System: BRD and PRD

Nov 13, 2026 · @Om

Origin: the foundation (tokens, components and written rules that an agent follows) comes from the Dive Radio episode "Design Systems for Agents". The multi-agent structure, automated checks, maintenance agents and governance are extensions designed for this project. Build in phase order: phases 0 to 2 are the core, and phases 3 and 4 follow once the core passes its golden set.

## Summary

This document specifies a multi-agent design system: a set of cooperating AI agents that generate, check, document and maintain UI against one source of truth, so designers and developers stop re-reading the design system and stop iterating by hand. It is written to be handed to Claude Code for implementation.

**Problem.** People read the design system, interpret it, and apply it inconsistently. Every inconsistency is found late and fixed by hand. Documentation, tokens and variants drift between Figma and code.

**Solution.** The rules live in machine-readable files. Specialised agents read only the rules they need, produce work, and pass it through automated checks. A person approves only work that has already passed. Every failure becomes a new rule.

**What Claude Code builds.** A monorepo containing the token and component sources, a rules and metadata layer, an orchestrator, six agents with typed handoffs, an automated check pipeline, a golden-set evaluation suite, and generated documentation.

## Business requirements: objectives and success metrics

The business case is faster, more consistent UI delivery with less review effort. Targets below are starting values to confirm against a baseline measured in phase 0.

| ID | Objective | Metric | Target |
| --- | --- | --- | --- |
| BR-1 | Cut time to produce a compliant screen | Median brief-to-approved-screen time | 60% lower than baseline |
| BR-2 | Reduce design-system violations reaching review | Violations per PR at human review | Under 1 |
| BR-3 | Remove manual iteration on rules | Rounds of rework per screen | 2 or fewer |
| BR-4 | Keep Figma, code and docs in sync | Token and variant drift items open | 0 at each release |
| BR-5 | Make documentation self-maintaining | Components with docs updated in the same PR as the change | 100% |
| BR-6 | Make the system trustworthy for non-experts | Share of generated screens passing all automated checks first time | 80% by end of phase 3 |
| BR-7 | Keep human control | Changes to published components merged without human approval | 0 |

## Business requirements: scope, stakeholders, assumptions

**In scope**

- Web UI components and screens built in React and TypeScript
- Tokens, components, rules and metadata as the single source of truth
- Six agents plus an orchestrator, with typed handoffs
- Automated checks: token lint, visual regression, accessibility, rules audit
- Generated documentation, changelog and versioning
- Figma sync through the Figma MCP, and Storybook as the component catalogue

**Out of scope for v1**

- Native mobile (iOS, Android) and email templates
- Multi-brand theming beyond one extra theme used to prove reuse
- Autonomous publishing with no human approval

| Stakeholder | Interest | Decision right |
| --- | --- | --- |
| Design system owner | Integrity of tokens, components and rules | Approves all changes to published components |
| Product designers | Fast, on-brand screens and variations | Request generation, review output |
| Front-end developers | Correct, accessible, reusable code | Review and merge generated code |
| Product managers | Predictable delivery | Accept scope and phase gates |
| Accessibility lead | WCAG 2.2 AA conformance | Can block any release |

**Assumptions**

- Figma is the design source and a Git repository holds the code; both can be reached by tooling.
- Claude Code has permission to run the repo's tests, linters and Storybook locally and in CI.
- A baseline of current screens and components exists to seed the golden set.

**Constraints**

- Humans approve every change to a published component, token or rule.
- Agents get least-privilege access: each agent can only read and write what its role needs.
- Every agent action is logged and replayable.

## Product requirements: users and user stories

| ID | As a | I want to | So that |
| --- | --- | --- | --- |
| US-1 | Product designer | Describe a screen in plain language and get an on-brand result | I do not read the design system first |
| US-2 | Product designer | Ask for 10 to 15 variations of one screen | I can explore without breaking rules |
| US-3 | Front-end developer | Receive code that uses only approved components and tokens | Review is fast and safe |
| US-4 | Design system owner | Change a token once and have it propagate everywhere with a reviewable diff | Components never drift |
| US-5 | Design system owner | See which rules agents break most often | I fix the rule, not the people |
| US-6 | Design system owner | Add a new component and have docs, variants and tests drafted for me | Maintenance stays low |
| US-7 | Accessibility lead | Have every output checked for contrast, focus and labels before review | Issues are caught early |
| US-8 | Any user | Be told exactly why an output was rejected and what rule applies | I understand without reading the whole system |

## System architecture

&#91;embedded content: multi-agent flow · orchestrator, 6 agents, 2 human gates\]

Every handoff passes through the orchestrator. A failed check returns the work for up to two retries, then escalates to a person. Recurring failures feed the Maintainer, which drafts rule changes for the design system owner to approve.

## Agent roster

One orchestrator coordinates six specialist agents. Each agent has one job, a typed input and output, and the minimum access it needs. Agents never talk to each other directly: all handoffs go through the orchestrator as schema-validated messages.

| Agent | Job | Reads | Writes | Human gate |
| --- | --- | --- | --- | --- |
| Orchestrator | Parses the request, plans tasks, routes work, enforces contracts, retries twice, then escalates | Request, task state, run log | Task plan, run log | None; escalates to a person on repeated failure |
| Context agent | Picks only the tokens, components and rules relevant to the task and returns a context pack | Tokens, component metadata, rules | Context pack (read-only output) | None |
| Composer agent | Turns the brief and context pack into a screen spec: a component tree with token references | Context pack, brief | Screen spec | None |
| Builder agent | Turns a screen spec into React and TypeScript code and, when asked, Figma frames | Screen spec, component source | Code branch, Figma frames | Code merge by a developer |
| QA agent | Runs token lint, visual regression, accessibility checks and a rules audit; returns a pass or fail report with the rule cited | Build output, rules, baselines | QA report | Accessibility lead can block |
| Maintainer agent | Applies token and component changes, detects Figma-to-code drift, checks variants are complete | Tokens, components, Figma file | Change proposal as a PR | Design system owner approves every change |
| Docs agent | Regenerates component docs, variant tables and the changelog; proposes the version bump | Components, PR diff | Docs, changelog, version proposal | Reviewed inside the same PR |

**Rules that apply to every agent**

- Output must validate against its schema or the orchestrator rejects it.
- No agent can edit rules or tokens except the Maintainer agent, and only through a PR.
- Every call is logged with inputs, outputs, tools used and the rule IDs consulted.

## Functional requirements

Priority: P0 must ship in v1, P1 should, P2 later. Each requirement has a test that proves it.

| ID | Requirement | Priority | Acceptance criteria |
| --- | --- | --- | --- |
| FR-1 | Tokens exist in two tiers: primitives and semantic | P0 | Every component style references a semantic token; lint finds 0 raw color, spacing or radius values |
| FR-2 | Tokens are the single source and sync to Figma variables and code | P0 | A token change produces matching Figma and code diffs; drift report is empty after sync |
| FR-3 | Every component has metadata: purpose, variants, states, props, when to use, when not to, related components, anti-patterns | P0 | Schema validation passes for 100% of components |
| FR-4 | Rules are written as IDs with a scope, a statement and a check | P0 | Each rule maps to at least one automated check or is marked manual |
| FR-5 | Context agent returns only relevant rules for a task | P0 | Context pack is under 30% of total rule text for the golden set |
| FR-6 | Composer produces a valid screen spec from a plain-language brief | P0 | Spec validates against the screen-spec schema; uses only registered components |
| FR-7 | Builder generates code from a spec using only approved components and tokens | P0 | Token lint and type check pass with 0 errors |
| FR-8 | Orchestrator rejects any handoff that fails its schema and retries at most twice | P0 | Test sends malformed output; run ends in escalation, not a crash |
| FR-9 | QA agent runs token lint, visual regression, accessibility and rules audit | P0 | Report lists each check with pass or fail and the rule ID for each failure |
| FR-10 | Visual regression compares against approved baselines | P0 | Unintended pixel change above threshold fails the run; baselines updated only by approval |
| FR-11 | Accessibility checks cover contrast, focus order, labels and touch targets | P0 | WCAG 2.2 AA automated checks pass; failures cite the success criterion |
| FR-12 | Generate N variations of one screen within the rules | P1 | 15 variations all pass QA with no manual edits in at least 80% of runs |
| FR-13 | Maintainer agent applies a token or component change across the system as a PR | P0 | PR contains code, Figma sync, updated docs and changelog; no direct commits |
| FR-14 | Drift detection between Figma and code runs on a schedule | P1 | Drift report produced weekly and on every release |
| FR-15 | Docs agent regenerates docs and variant tables on each component change | P0 | No component changes merge with stale docs; CI check enforces it |
| FR-16 | Versioning uses semantic versions with deprecation notices | P1 | Breaking change forces a major bump and lists affected components |
| FR-17 | Every failed check can be turned into a proposed rule | P1 | Insight report lists top recurring failures with a draft rule for each |
| FR-18 | Humans approve any change to a published component, token or rule | P0 | Branch protection blocks merge without owner approval |
| FR-19 | Full run log is stored and replayable | P0 | A past run can be replayed from its log and produce the same checks |
| FR-20 | Rejections explain the rule that applies in one sentence | P1 | QA report text includes rule ID and a plain-language reason |

### Phase 2c additions: page layer and Strategist

Added in phase 2c, after real briefs produced bare screens that still passed QA. Pending Om's approval in the phase 2c PRs.

| ID | Requirement | Priority | Acceptance |
|---|---|---|---|
| FR-21 | Screens are composed from layout components and page templates with named slots, never from inline layout | P0 | Every generated screen has a template or PageShell root, fills its template's required slots and has no inline layout styles (DS-P-001, DS-P-004, DS-P-007) |
| FR-22 | A Strategist agent produces a design dossier for every brief before the Composer runs | P0 | The dossier validates against its schema, is stored in the run log and replays without model or web calls |
| FR-23 | Research is cached as versioned pattern specs per screen type, with an expiry | P1 | A cache hit makes no web calls; a spec older than 90 days counts as a miss; Om's references/ notes outrank web research |
| FR-24 | Every best-practice item cites its source, and research is in our own words | P0 | Each checklist item has a source URL and retrieval date that the research log shows was fetched; no 8-word run is copied from a source; no screenshots are stored |
| FR-25 | Deliberate improvements are traceable | P1 | Every departure from the pattern links to an innovation with rationale, risk and a rules check; at most one is unconventional, and it is flagged |
| FR-26 | The spec contains every required part of the screen's pattern, in order | P0 | The pattern-completeness check passes |
| FR-27 | Screens carry real copy: specific headings, verb-first buttons, labels and helper text | P1 | Copy rules DS-W-001 to DS-W-006 pass |

Non-functional: **NFR-13** the Strategist writes only `patterns/*.json`; a test proves it cannot write anywhere else.

## Data contracts and repository layout

Everything agents read or write is a typed file. Claude Code should define each schema first (JSON Schema or Zod), then build against it.

```markdown
repo/
  AGENTS.md                  # shared instructions every agent loads
  tokens/
    primitives.json          # raw values
    semantic.json            # meaning-based names, reference primitives
  components/
    <name>/
      <name>.tsx
      <name>.meta.json       # purpose, variants, states, props, when/when-not, related, anti-patterns
      <name>.stories.tsx
  rules/
    rules.yaml               # rule IDs, scope, statement, check, severity
  agents/
    orchestrator/  context/  composer/  builder/  qa/  maintainer/  docs/
    each: instructions.md, schema.ts, tools.ts, tests/
  checks/
    token-lint/  visual/  a11y/  rules-audit/
  evals/
    golden-set/              # reference briefs and expected-pass criteria
    baselines/               # approved screenshots
  docs/                      # generated; never edited by hand
  runs/                      # run logs, one folder per run
```

| Contract | Key fields | Used by |
| --- | --- | --- |
| Token | name, tier (primitive or semantic), value or reference, description, deprecated | Maintainer, Builder, token lint |
| Component metadata | id, purpose, variants, states, props, whenToUse, whenNotToUse, related, antiPatterns, tokensUsed, a11yNotes | Context, Composer, Docs |
| Rule | id, scope, statement, severity, check (auto or manual), appliesTo, example, counterExample | Context, QA |
| Context pack | taskId, tokenIds, componentIds, ruleIds, reason per item | Composer, Builder |
| Screen spec | taskId, tree of components with props and token references, states covered | Builder, QA |
| QA report | taskId, checks with status, failing ruleIds, plain-language reason, evidence links | Orchestrator, Maintainer |
| Handoff message | runId, from, to, schemaVersion, payload, attempt number, timestamp | Orchestrator |
| Run log entry | runId, agent, input hash, output hash, tools used, ruleIds consulted, duration, outcome | All; replay and telemetry |

## Non-functional requirements

The numbers are proposed targets; confirm them with the design system owner.

| ID | Area | Requirement | Target |
| --- | --- | --- | --- |
| NFR-1 | Speed | Brief to checked screen, single screen | Under 5 minutes |
| NFR-2 | Speed | QA pipeline on one screen | Under 2 minutes |
| NFR-3 | Cost | Model and compute cost per generated screen | Set a budget in phase 0; hard cap enforced by the orchestrator |
| NFR-4 | Reliability | Runs that end in a defined outcome (pass, fail or escalate) | 100%; no silent failures |
| NFR-5 | Determinism | Same spec and baselines give the same check results | 100% on replay |
| NFR-6 | Context size | Rules loaded per task | Under 30% of total rule text |
| NFR-7 | Security | Agent access | Least privilege per agent; secrets never in prompts or logs |
| NFR-8 | Auditability | Agent actions logged and retained | All runs, 12 months |
| NFR-9 | Accessibility | Generated UI | WCAG 2.2 AA |
| NFR-10 | Maintainability | Adding a new agent or check | Only a schema, an instruction file and tests; no orchestrator code change |
| NFR-11 | Portability | Model dependence | Agents run against a configurable model; swap needs no code change |
| NFR-12 | Test coverage | Schemas, checks and orchestrator logic | At least 90% line coverage; golden set passes before any release |

## Governance, security and permissions

Agents can propose and build; only people can publish. The permission model enforces this in the repository, not in the prompts.

| Agent | Can read | Can write | Cannot |
| --- | --- | --- | --- |
| Orchestrator | Run state, logs | Run state, logs | Touch source files |
| Context | tokens, components, rules | Nothing | Write anywhere |
| Composer | Context pack, brief | Screen spec | Edit components or rules |
| Builder | Spec, component source | Feature branches only | Merge, edit tokens, rules or baselines |
| QA | Build output, rules, baselines | QA report | Change code, rules or baselines |
| Maintainer | Whole repo, Figma file | PR branches for tokens, components, rules | Merge its own PR |
| Docs | Components, PR diff | `docs/`, changelog on PR branches | Edit source, tokens or rules |

- **Change control.** Branch protection requires design system owner approval for `tokens/`, `components/` and `rules/`, and accessibility lead approval when a11y checks fail or are changed.
- **Baselines.** Visual baselines change only through an approved PR, never automatically.
- **Secrets.** Figma and Git credentials live in the environment, scoped per agent, and never appear in prompts or logs.
- **Prompt-injection safety.** Content from briefs, Figma text layers and web pages is treated as data. Agents ignore instructions found there and flag them in the run log.
- **Spend limits.** The orchestrator enforces a per-run and per-day cost cap and stops runs that exceed it.
- **Kill switch.** One setting disables all agent writes while leaving read-only checks running.

## Evaluation and quality

A release is allowed only when the golden set passes. Evaluation measures the agents, not just the output.

**Golden set.** 20 reference briefs covering the main screen types, each with expected components, forbidden patterns and pass criteria. It is re-run after every change to a token, component, rule, agent instruction or model.

| Metric | Definition | Target |
| --- | --- | --- |
| First-pass QA rate | Runs passing every check with no retry | 80% by phase 3 |
| Rule violation rate | Failed rule checks per generated screen | Under 0.5 |
| Retry rate | Handoffs rejected by schema | Under 5% |
| Escalation rate | Runs needing a human before review | Under 10% |
| Context precision | Rules in the context pack that the output actually needed | Over 80% |
| Drift items | Open Figma-to-code differences | 0 at release |
| Doc freshness | Components whose docs match their code | 100% |
| Human edit distance | Lines a reviewer changes before merge | Falling release over release |

**Feedback loop.** After each release the QA agent summarises the most frequent failures. The Maintainer agent drafts a rule or metadata change for each, as a PR the design system owner reviews. This is how the system stops needing constant manual iteration.

## Phased delivery

Each phase ends with exit criteria that must pass before the next begins.

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| 0. Foundation | Measure baselines; set tokens in two tiers; write schemas; repo layout; CI skeleton | Schemas validate; token lint runs in CI; baseline metrics recorded |
| 1. Knowledge layer | Component metadata, rules file, `AGENTS.md`, Context agent | 100% of in-scope components have valid metadata; FR-3, FR-4, FR-5 pass |
| 2. Generate and check | Orchestrator, Composer, Builder, QA agent, four checks, run logs | FR-6 to FR-11 and FR-19 pass on the golden set |
| 3. Maintain | Maintainer and Docs agents, drift detection, versioning, approval gates | FR-13 to FR-16 and FR-18 pass; first-pass QA rate at 80% |
| 4. Learn and scale | Insight reports, variations at scale, second theme, telemetry dashboard | FR-12 and FR-17 pass; second theme built with no new rules |

## Risks and open questions

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Agents produce plausible but off-system UI | Inconsistent product | Token lint and rules audit block output; golden set gates releases |
| Rules grow stale or contradict each other | Agents behave unpredictably | Each rule has an owner and a check; QA flags conflicting rules; quarterly review |
| Context too large, quality and cost degrade | Slow, expensive, vague output | Scoped context pack with a size target; measure context precision |
| Agents cascade errors through handoffs | Bad work reaches review | Schema validation on every handoff; retry cap; escalate on failure |
| Figma and code drift apart | Broken trust in the system | Single token source; scheduled drift check; Maintainer opens fix PRs |
| Visual regression noise from rendering differences | Flaky checks, ignored failures | Pinned browser and fonts in CI; per-component thresholds |
| Over-reliance on automation | Quality issues missed | Human approval on all published changes; accessibility lead veto |
| Prompt injection through briefs or Figma text | Unintended agent actions | Treat external text as data; least-privilege tools; log and flag |
| Model changes alter behaviour | Regressions with no code change | Pin the model version; re-run the golden set before upgrading |
| Cost runaway | Budget overrun | Per-run and daily caps; kill switch |

**Decisions**

- **Release 1 is a proof of concept** that demonstrates building one design system end to end. Scope: phases 0 to 2 only.
- **POC components (proposed, to confirm):** Button, Input, Select, Checkbox, Card and Modal. There are no existing screens to baseline against, so the golden set uses new briefs and the visual baselines come from the POC's own first approved components.
- **Token source:** the code repository (`tokens/`). Tokens are pushed one way from the repo to Figma.
- **Storybook and visual regression:** not in use today. Proposed: add Storybook as the component catalogue and use Playwright snapshot tests for visual regression, so no paid service is needed. Revisit after the POC.
- **Cost budget:** not set for the POC. Keep the per-run cap configurable with a low default, and record cost per run so a real budget can be set later.
- **Design system owner and accessibility lead:** Om holds both roles for the POC. Approvals still go through pull requests, and agents still cannot merge.

## Claude Code implementation brief

Give Claude Code this section together with the functional requirements and data contracts. Work phase by phase and stop at each exit gate for review.

**Working rules**

1. Define schemas before any agent code; every handoff is validated against one.
2. Write the test for each requirement first, then implement it. Cite the requirement ID in the test name.
3. Keep each agent in its own folder with `instructions.md`, `schema.ts`, `tools.ts` and tests. Do not share state between agents except through orchestrator handoffs.
4. Enforce permissions in the repository (branch protection, scoped credentials), not only in prompts.
5. Never edit `docs/` by hand; generate it.
6. Make the model, cost caps and retry limit configuration, not constants.
7. Commit in small steps. Open a PR per phase and list which requirement IDs it satisfies.

**Build order**

1. Repo layout, CI, schema package, run-log writer.
2. Token files in two tiers and the token lint check.
3. Component metadata for the in-scope components and the rules file with check mappings.
4. Context agent and its tests.
5. Orchestrator with handoff validation, retries and escalation.
6. Composer and Builder agents on the golden set.
7. QA agent with visual regression, accessibility and rules audit.
8. Maintainer agent, drift detection and approval gates.
9. Docs agent, changelog and versioning.
10. Insight reports, variation generation and the golden-set dashboard.

**Definition of done**

- Every P0 requirement has a passing automated test.
- The golden set passes with a first-pass QA rate of at least 80%.
- No agent can write outside its permitted paths, proven by a test.
- A past run replays from its log and produces the same results.
- Docs, changelog and versions generate in CI with no manual step.

**Do not**

- Let agents merge their own work or edit baselines.
- Hardcode colors, spacing or radii anywhere.
- Add a new agent or check by changing orchestrator code.
