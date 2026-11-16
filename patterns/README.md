# Pattern specs

One JSON file per screen type (for example `login.json`, `checkout-form.json`): the cached,
versioned research the Strategist agent builds design dossiers from (FR-23).

Each spec validates against `packages/schemas/src/pattern-spec.ts` and holds:

- a best-practice **checklist**, where every item cites a source URL and retrieval date (FR-24)
- a **teardown** of 3 to 5 products, in our own words; no copied text, no screenshots
- the **synthesis**: required and optional parts, their order and template slots, spacing
  tokens, and copy and error rules traced to the checklist
- an **expiry** at most 90 days after the research, and the `references/` notes it read

## How specs change

- The Strategist writes here, and only here (`patterns/*.json`, NFR-13). A cache hit uses
  the spec with no web calls; a missing or expired spec triggers live research.
- New or refreshed specs reach `main` only through a pull request Om approves, like visual
  baselines.
- Replays and the golden set use the dossier frozen in the run log, so an expired spec
  never changes a recorded result; a separate report lists specs due for refresh.
