# Phaedrus reported-turn acceptance

- date: 2026-08-17
- scope: turn_phaedrus_0039, turn_phaedrus_0040, turn_phaedrus_0041, turn_phaedrus_0042, turn_phaedrus_0069, turn_phaedrus_0070, turn_phaedrus_0074, turn_phaedrus_0075, turn_phaedrus_0076, turn_phaedrus_0077, turn_phaedrus_0160, turn_phaedrus_0201, turn_phaedrus_0225, turn_phaedrus_0276, turn_phaedrus_0278, turn_phaedrus_0282, turn_phaedrus_0286, turn_phaedrus_0319, turn_phaedrus_0331, turn_phaedrus_0348, and turn_phaedrus_0349
- source: raw/plato/greek/phaedrus.txt, SHA-256 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
- turn index: derived/plato/turns/phaedrus.toon, SHA-256 99106f1748e8506a919c4ea341527c9d2e608ebced3c1ee87089fb37093942ee
- scope census: wiki/review/2026-07-26-phaedrus-reported-turn-scope-census.md

## Decision

Accepted all twenty-one source-bounded cohorts in wiki/voices/phaedrus.md:
twenty-one printed frames and twenty-three depth-2 child spans.

The Lysias/non-lover material is split at the source's actual interior
resumptions and Socrates' own asides, rather than attributed by turn
alternation. All nested terminals remain unresolved: the continuing written
speech, the staged or generic speakers, the personified art of speech, the
constructed defendant, and the Egyptian mythic speakers have no
already-registered local terminal owner. The q-bounded Muses invocation at
237a is Socrates' own speech and remains in its printed frame.

Only the required printed frame sigla ΦΑΙ. and ΣΩ. are added locally. No
cutover, voice join, claim attribution, or other corpus-family change is made.

## Method

Direct review used the Greek source, exact turn index, scope census, and
docs/voices-protocol.md. No translation, doctrine, style, alternation, or
cross-turn owner carry-forward was used.

## Verification

- bun run harness derive voices phaedrus compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
