# Meno reported-turn acceptance

- date: 2026-08-16
- scope: `turn_meno_0003`, `turn_meno_0056`, `turn_meno_0062`, `turn_meno_0066`, `turn_meno_0072`, `turn_meno_0361`, `turn_meno_0478`, and `turn_meno_0566`
- source: `raw/plato/greek/meno.txt`, SHA-256 `91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99`
- turn index: `derived/plato/turns/meno.toon`, SHA-256 `c9c5aafaa857b23b3fa214279a3d9a1ecb78170a8368f5469c97716236dc65ea`
- scope census: `wiki/review/2026-07-26-meno-reported-turn-scope-census.md`

## Decision

Accepted all eight source-bounded cohorts in `wiki/voices/meno.md`: eight
printed-ΣΩ. frames and eleven depth-2 spans.

The counterfactual questioners in 0003, 0056, 0062, 0066, 0072, and 0361 are
retained as direct speech but remain unresolved whenever the Greek gives only
τις, ὁ ἐρωτῶν, a third-person verb, or a collective. The first child of 0072
alone resolves to ΜΕΝ. through its second-person `εἶπες ὅτι` formula.

The 0478 whole-turn `{quote}` is retained and resolves to ΘΕΟΓ.: `οὗ λέγει` is
anchored to the immediately preceding `Θέογνιν τὸν ποιητὴν`. The 0566 Laconian
acclamation is one marker-inclusive child across `φασίν`; its plural owner stays
unresolved rather than being collapsed into Socrates.

Only `ΣΩ.`, `ΜΕΝ.`, and `ΘΕΟΓ.` are added to the Meno voice registry, solely to
name the source-licensed chains. No cutover, voice join, claim attribution, or
other corpus family changes.

## Method

Direct review used the Greek source, exact turn index, scope census, and
`docs/voices-protocol.md`. No translation, doctrine, style, alternation, or
speaker carry-forward was used.

## Verification

- `bun run harness derive voices meno` compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
