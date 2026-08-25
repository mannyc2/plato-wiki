# Greater Hippias reported-turn acceptance

- date: 2026-08-17
- scope: all forty-six required outer turns in wiki/reported-turn-scopes.json for greater-hippias
- source: raw/plato/greek/greater-hippias.txt, SHA-256 ccda6820c403e75c99d26a990c1c993a5f25d2ff5a2da6cef872ce204e9666b4
- turn index: derived/plato/turns/greater-hippias.toon, SHA-256 6809ef43af975ec38dec56b5468c179848f232f5255d68dcbceda001ead5fd5d
- scope census: wiki/review/2026-07-26-greater-hippias-reported-turn-scope-census.md

## Decision

Accepted all forty-six source-bounded cohorts in
wiki/voices/greater-hippias.md: forty-six printed ΣΩ. frames and eighty-one
depth-2 q-bounded spans.

Every nested terminal remains unresolved. The Greek transmits an interrogator
through direct q-bounded speech, including future-projected questions and
continued whole-turn fragments, but the dialogue has no registered terminal
owner for that interrogator. The q-bounded Heraclitean verse in 0121,
Socrates' own projected q speech in 0283, and the closing proverb in 0357
remain in their frames. Indirect or on-stage recaps within the 0173 and 0187
interrogator spans produce no further child level.

Only the printed frame siglum ΣΩ. is added locally. No cutover, voice join,
claim attribution, or other corpus-family change is made.

## Method

Direct review used the Greek source, exact turn index, scope census, and
docs/voices-protocol.md. No translation, doctrine, style, alternation, or
speaker carry-forward was used.

## Verification

- bun run harness derive voices greater-hippias compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
