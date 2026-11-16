# Showcase: Review and send

The "Review and send" brief (Northwind Business, ₹8,45,000 to a supplier paid once before),
run through the full pipeline with the real model. **The screen is the pipeline's output,
copied verbatim and not edited.**

| | |
|---|---|
| Run | `9cff59a3-e12f-4e92-866c-c5a075a4d434`, 2026-11-17 |
| Model | `claude-sonnet-4-6` through the claude CLI (Om's subscription) |
| Pipeline | Context → Composer → Builder → QA (no Strategist yet) |
| Outcome | **Escalated, QA failed**: stopped at the 10-call cap after 5 Composer, 3 Builder and 1 QA retry |
| QA | token lint pass · **rules audit fail** · accessibility pass · visual skipped (no baseline) |

## Files

- `screen.tsx`: the generated screen, verbatim.
- `spec.json`: the Composer's final screen spec.
- `context-pack.json`: the components, tokens and rules the Context agent selected.
- `qa-report.json`: the final QA report.
- `run.json` and `run-log.jsonl`: the run record and log, so the run can be replayed.

## There is no design direction

The Strategist agent, which writes the design direction, is phase 2c PR 5 and is not built
yet. When it is, this brief is re-run and its direction is saved here.

## What QA found, and what it could not see

- **Rules audit failed, DS-C-004:** cards are nested inside cards (the summary card holds four detail cards).
- **Not caught by any check yet** (the page-layer rules and the design review come in phase 2c PRs 6–7):
  - no page frame, and content pinned left at a fixed width instead of a template (DS-P-001)
  - inline layout styles (DS-P-004)
  - "Edit recipient" and "Edit account" are links to `#edit-…` that open nothing, so a detail cannot really be edited in place
  - pressing Send without a code shows no error; there is no validation
  - the amount and the fee have no Change link
  - at phone width the amount, at display size, breaks across two lines ("INR / 8,45,000")

## Stories

Showcase / Review and send: Default, Editing a detail, One-time code, Error, Dark, Mobile
(375px). Interactions are scripted with play functions; they drive the generated UI and never
change it.
