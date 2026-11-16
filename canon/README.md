# Craft canon

Named principles distilled from UI and UX leaders (Apple, Linear, Stripe, Vercel, Wise,
Carbon and Material): one file per principle, `canon/<id>.json`, validated by
`packages/schemas/src/canon-entry.ts`. The Strategist applies them, below accessibility,
the brief, the system and Om's references in precedence.

- **Our own words.** Each entry is a one-line rule, the leaders who use it (at least two,
  each with a link to a page that was actually fetched and the date), how it maps to our
  tokens, components and rules, and how QA verifies it. No screenshots, no copied text, no
  pixel values.
- **Refreshed only on request:** `npm run canon:refresh [-- <id…>]` researches the
  principles in `seed-list.json` with the real model's web tools and writes **drafts** to
  `canon/drafts/`, with `report.json` listing anything rejected and why. Briefs never
  trigger a refresh.
- **Om promotes drafts** by moving them from `canon/drafts/` to `canon/` in a pull request.
  The Strategist can write drafts, never approved entries (`config/permissions.json`, NFR-13).
