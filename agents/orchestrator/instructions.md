# Orchestrator agent — instructions

## Purpose

Coordinates the full generation pipeline: Context → Composer → Builder. Validates every
handoff against its Zod schema. Retries agents up to `retryLimit` (from `config/defaults.json`)
on schema failure, then escalates. Never crashes silently.

## Permitted reads

- `config/defaults.json`
- `runs/<runId>/log.jsonl` (run log, read for replay)

## Permitted writes

- `runs/<runId>/log.jsonl` (run log entries)
- `runs/<runId>/screen.tsx` (Builder output staging area)

## Outcomes

Every run ends with exactly one of: `pass`, `fail`, `escalate`, `retry`.

## Error handling

- Context agent runtime error → `escalate` immediately (no retry).
- Composer or Builder schema-validation failure → retry up to `retryLimit`, then `escalate`.
- Cost cap exceeded at any point → `escalate`.
