# Republic commentary direct-curation receipt

- date: 2026-08-17
- scope: `wiki/commentary/republic.md`
- curator: Luna, direct curation
- model attribution: `author: model`; no Opus or Claude campaign was used or claimed
- source: `raw/plato/greek/republic.txt`

## Decision

The initial validator-clean draft was rejected in semantic coordination
review: it shifted the Books III–VI arguments and mislabeled the
many-headed-beast passage as the three pleasures. The ledger was rebuilt from
the Greek transitions. Per-book checks now confirm Book I’s challenge through
367e and city construction at 368a–376e; imitation, music, and guardian
selection at 377a–412b; noble lie, common guardian life, and the happiness
objection at 412c–427d; Book IV virtues and tripartite justice at 427e–449a;
the first two Book V waves at 449b–471c; philosopher-rule and the third wave
at 471d–502c; good/sun/line, cave, mathematical training, and dialectic at
502d–543a; regime decline beginning at 543b; tyrant misery and three pleasures
at 576c–588a; and the many-headed beast/justice image at 588b–595a. Every
block has an exact Greek `source_ref`, matching hash, and terminal
`review_status: accepted`.

## Validation

- Actual `validateCommentaryLedger("wiki/commentary/republic.md", content)`
  with the default citation index — 0 issues.
- `bun run harness commentary briefs republic` — 19 focused briefs generated.
- `bun test packages/harness/src/wiki/commentary-validator.test.ts` — 29 pass,
  0 fail.
- `git diff --check -- wiki/commentary/republic.md` — passed.
- The first structurally-valid draft was not counted as reviewed; all listed
  semantic shifts were corrected before acceptance.

No code, configuration, generated aggregate, audit, campaign, or other
dialogue file was changed.
