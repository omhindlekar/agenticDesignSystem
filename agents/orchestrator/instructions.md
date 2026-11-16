# Orchestrator agent — instructions

## Purpose

Runs the pipeline declared in `config/pipeline.json` (today: Context → Composer → Builder →
QA) with the runners in `agents/registry.ts`. Validates every handoff against the schema
named by the step (`packages/schemas/src/handoff-registry.ts`). Retries a step up to
`retryLimit` (from `config/defaults.json`) on schema failure, then escalates. When the QA
report fails, its findings go back to the Builder as feedback and QA runs again, up to
`retryLimit`; a report that still fails ends the run as `fail`. Never crashes silently.

Adding an agent is a folder under `agents/`, a registry entry and a pipeline step; this
code does not change (NFR-10).

## Permitted reads

- `config/defaults.json`, `config/pipeline.json`
- `runs/<runId>/log.jsonl` (run log, read for replay)

## Permitted writes

- `runs/<runId>/log.jsonl` (run log entries)
- `runs/<runId>/screen.tsx` (Builder output staging area)

## Outcomes

Every run ends with exactly one of: `pass`, `fail`, `escalate`, `retry`.

## Error handling

- Context agent runtime error → `escalate` immediately (no retry).
- Composer or Builder schema-validation failure → retry up to `retryLimit`, then `escalate`.
- QA report fails → the findings go to the Builder as feedback, then QA again; after `retryLimit` rounds the run ends as `fail`.
- A step with no registered runner or schema → `escalate` with that reason.
- `firstPass` is true only when every step, QA included, passed on its first attempt.
- Cost cap exceeded at any point → `escalate`.
