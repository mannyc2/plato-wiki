# Meno voice and claim-speaker hard cut

**Reviewer**: Codex reconciliation of the exhaustive source-first and
record-first findings against `raw/plato/greek/meno.txt` only.

## Decision

Retire the 95d-e Theognis poetry cohort under the separately bound scope
correction. Register `ΛΑΚ.` as the Laconians collectively and resolve
`voice_meno_0019` from the exact outer turn containing `οἱ Λάκωνες ... φασίν`.
Activate Meno so the Laconian acclamation is materialized without changing
ordinary printed Socrates speech, including the retired poetry turn.

## Method

No translation, doctrine, or style evidence was used. The cutover adds no
legacy alias or fallback reader.

## Verification

PASS. The accepted voice index contains 17 records after retiring the two
poetic-citation records. Twenty-six formerly blocking accepted claims now carry
exact, contained, hash-checked owner anchors recorded item-by-item in
`2026-08-30-meno-claim-speaker-anchors.json` (SHA-256
`dee9382aad415d294ccb0e5bc8a3a7b54fb5ba4d6eccd213cbe0fb3196822b0f`).
The reviewed migration applied two speaker changes with zero accepted blockers;
verification proves all 53 accepted claims match current authority. The one
non-accepted claim remains excluded from the all-or-nothing accepted cutover.
The materialized join contains 99 record rows and 57 stance rows.

Final artifact hashes before this receipt was closed:

- voice index: `d66ae65bc18062c619df9c9016f6dbc4a2225a473a5ec7c8515ed3d17e948de9`
- claim ledger: `2e31a06bffe0e8c8e91d3cc15544a1c726a883d7d4a0f2f26c5e42ee02fd9b57`
- migration plan: `9c55c9c0ae8b8d286295ae7d41153a1ff3709c3eb3bc3883dc201b984265bc05`
- voice join: `274cff1ca244c0cf0af986607818c91e2553a7f7a408dcc233beae8fac14aa20`
