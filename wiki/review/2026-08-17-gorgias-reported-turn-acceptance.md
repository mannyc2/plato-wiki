# Gorgias reported-turn acceptance

- date: 2026-08-17
- scope: turn_gorgias_0087, turn_gorgias_0089, turn_gorgias_0097, turn_gorgias_0135, turn_gorgias_0151, turn_gorgias_0364, turn_gorgias_0998, turn_gorgias_1095, turn_gorgias_1103, and turn_gorgias_1104
- source: raw/plato/greek/gorgias.txt, SHA-256 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
- turn index: derived/plato/turns/gorgias.toon, SHA-256 fcc226d7b29d0d505a1d9b05c037c18cae9fdc24e33d3f3c1ce159097226e4fa
- scope census: wiki/review/2026-07-26-gorgias-reported-turn-scope-census.md

## Decision

Accepted ten source-bounded cohorts in wiki/voices/gorgias.md: ten printed
ΣΩ. frames and twenty-nine depth-2 spans.

At 452a-d, the direct Greek reporting formulas license the one staged doctor,
trainer, and money-maker. Their later q fragments are resolved only through
same-turn, hash-bounded review contexts that retain the interposed inquit as
narration rather than infer alternation. At 469e, the second-person formula
licenses Polus's projected reply. At 523c, the named formula licenses Zeus,
and the later q fragments are bounded by the same local Zeus context.

Indefinite questioners and accusers, plural prospective students, the generic
doctor at 522a, and the q speech that continues over the 523e printed boundary
remain unresolved. The 469d first-person hypothetical is Socrates' own speech
and remains in the printed frame, not a child.

Only source-licensed dialogue-local sigla are added: ΣΩ., ΙΑΤ., ΠΑΙΔ., ΧΡΗΜ.,
ΠΩΛ., and ΖΕΥΣ. No cutover, voice join, claim attribution, or other corpus
family changes.

## Method

Direct review used the Greek source, exact turn index, scope census, and
docs/voices-protocol.md. No translation, doctrine, style, alternation, or
cross-turn speaker carry-forward was used.

## Verification

- bun run harness derive voices gorgias compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
