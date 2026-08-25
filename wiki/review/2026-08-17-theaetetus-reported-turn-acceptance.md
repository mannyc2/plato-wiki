# Theaetetus reported-turn acceptance

- date: 2026-08-17
- scope: turn_theaetetus_0189, turn_theaetetus_0234, turn_theaetetus_0292, turn_theaetetus_0302, turn_theaetetus_0351, turn_theaetetus_0353, turn_theaetetus_0355, turn_theaetetus_0356, turn_theaetetus_0357, turn_theaetetus_0514, turn_theaetetus_0606, turn_theaetetus_0729, turn_theaetetus_0731, turn_theaetetus_0733, turn_theaetetus_0812, and turn_theaetetus_0853
- source: raw/plato/greek/theaetetus.txt, SHA-256 96b88e1f11fdcd0b3b5318857d95dfb7aa66825e786b3f27460f8043688df0ee
- turn index: derived/plato/turns/theaetetus.toon, SHA-256 7521a9787c1c43eefc9102d9dc606a9980eee129ce0a17d15634810c3263f12b
- scope census: wiki/review/2026-07-26-theaetetus-reported-turn-scope-census.md

## Decision

Accepted sixteen source-bounded cohorts in wiki/voices/theaetetus.md: sixteen
printed ΣΩ. frames and twenty-three depth-2 spans.

The second-person forms φαίης and εἴποις resolve only Theaetetus's projected
speech, and ὁ γὰρ ἐλεγκτικὸς ἐκεῖνος γελάσας φήσει resolves the one definite
singular refuter. The generic ἀνέκπληκτος ἀνήρ, indefinite and collective
questioners, bare φησί fragments, and the 166a–168c implied-Protagoras speech
remain unresolved. The latter has no local terminal owner; naming Protagoras
there would repeat the prohibited cross-turn carry-forward inference.

Only source-licensed dialogue-local sigla are added: ΣΩ., ΘΕΑΙ., and ΕΛΕΓΚ.
No cutover, voice join, claim attribution, or other corpus family changes.

## Method

Direct review used the Greek source, exact turn index, scope census, and
docs/voices-protocol.md. No translation, doctrine, style, alternation, or
cross-turn speaker carry-forward was used.

## Verification

- bun run harness derive voices theaetetus compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
