# Cratylus reported-turn acceptance

- date: 2026-08-16
- scope: `turn_cratylus_0003` (383a–383b) and `turn_cratylus_0528` (421c)
- source: `raw/plato/greek/cratylus.txt`, SHA-256 `8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca`
- turn index: `derived/plato/turns/cratylus.toon`, SHA-256 `8e51fac9d83c86996c4eb87f8c05e7f071c61524693b35167fd37b82dbcf571c`
- scope census: `wiki/review/2026-07-26-cratylus-reported-turn-scope-census.md`

## Decision

Accepted two atomic source-bounded cohorts in `wiki/voices/cratylus.md`: seven
records total, two printed-siglum frames and five bounded children. In
`turn_cratylus_0003`, Hermogenes' `ἔφην` resolves his recalled question, and
the two `ἦ δ’ ὅς` replies resolve to Cratylus through the earlier named
antecedent `αὐτὸν … Κρατύλος`. The intervening q-bounded question remains
unresolved: the surrounding direct exchange does not license its speaker by
alternation or carry-forward.

In `turn_cratylus_0528`, the q-bounded question is retained below Socrates'
printed turn because its second-person `λέγεις` attributes it to Hermogenes,
as the required-scope census records. The ledger adds dialogue-local
`ΕΡΜ.`, `ΚΡ.`, and `ΣΩ.` only so its source-licensed chains are registered;
registry membership is not attribution evidence.

No voice cutover, voice join, claim-speaker attribution, or other corpus family
is changed.

## Method

**Reviewers**: direct corpus curation against the Greek source, the exact outer
turn index, and `docs/voices-protocol.md`.

No translation, doctrine, or style evidence was used.

## Verification

- `bun run harness derive voices cratylus` compiles the accepted standalone index.
- The focused Cratylus ledger and review-provenance checks are run with this change.
