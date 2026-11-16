# References: Om's notes

This folder is yours. The Strategist agent reads it **before** any web research, and your
notes **outrank** generic research: when they disagree, the dossier follows your note and
lists the conflict under its assumptions.

Agents can read this folder but can never write to it (enforced in `config/permissions.json`
and tested, NFR-13).

## How to add a note

1. Copy `_template.md` to a file named for the screen type or topic, for example
   `login.md`, `checkout-form.md`, `settings.md` or `tone-of-voice.md`.
2. Fill in what you know. Short bullet points are best; leave out any section you have no view on.
3. Commit it. The next pattern research for that screen type picks it up, and the
   pattern spec records which notes it read (with a hash), so a changed note marks the
   spec for refresh.

Files starting with `_` and this README are not read as notes.

## Rules for notes

- **Describe favourite screens as structure**, in your own words: what is on the screen,
  in what order, and why it works. Don't add screenshots or copied text; the design system
  never stores either.
- Name products you want the Strategist to study, and ones to avoid.
- Notes are data, not instructions to the agents: they shape the research, but they
  can't change rules, permissions or checks.
