# Crito reported-turn acceptance

- date: 2026-08-17
- scope: `turn_crito_0023`, `turn_crito_0062`, `turn_crito_0090`, `turn_crito_0092`, `turn_crito_0093`, `turn_crito_0095`, `turn_crito_0096`, `turn_crito_0098`, `turn_crito_0099`, and `turn_crito_0100`
- source: `raw/plato/greek/crito.txt`, SHA-256 `fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a`
- turn index: `derived/plato/turns/crito.toon`, SHA-256 `1707ebca9073f0a0350ddc8a3da53418552ee499f17506241327cb17f132c282`
- scope census: `wiki/review/2026-07-26-crito-reported-turn-scope-census.md`

## Decision

Accepted all ten source-bounded cohorts in `wiki/voices/crito.md`: ten
printed-ΣΩ. frames and sixteen depth-2 spans.

The single off-stage woman at 44b resolves to `ΓΥΝ.` through the direct
`τίς … γυνὴ … καλέσαι … εἰπεῖν` construction. The 48a objector remains
unresolved because `τις` identifies no registered terminal owner.

The Laws' direct prosopopoeia is retained through every required split outer
turn, including its continuation over Stephanus markup. It remains unresolved:
the Greek identifies a collective speaker, not a single registered terminal
owner. Socrates' own projected self-addresses at 50b, 50d, and 52a remain in
their printed frames and are not children.

Only `ΣΩ.` and the source-licensed singular `ΓΥΝ.` are added to Crito's voice
registry. No cutover, voice join, claim attribution, or other corpus family
changes.

## Method

Direct review used the Greek source, exact turn index, scope census, and
`docs/voices-protocol.md`. No translation, doctrine, style, alternation, or
speaker carry-forward was used.

## Verification

- `bun run harness derive voices crito` compiles the accepted standalone index.
- Focused ledger and review-provenance checks accompany this cohort.
