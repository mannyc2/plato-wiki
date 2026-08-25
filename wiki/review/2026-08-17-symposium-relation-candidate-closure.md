# Symposium relation candidate-key closure

- date: 2026-08-17
- scope: `relations/symposium`
- canonical source: `raw/plato/greek/symposium.txt`

## Deterministic delta

The current candidate set has ten stable keys. The prior ledger contained one
stale key, `symposium::claim_symposium_0009::claim_symposium_0019`, and omitted
two current keys:

- `symposium::claim_symposium_0105::claim_symposium_0124`
- `symposium::claim_symposium_0105::claim_symposium_0128`

The stale row was removed without renumbering surviving relation IDs. The two
missing keys were added as terminally rejected decisions with new stable IDs
`rel_symposium_0010` and `rel_symposium_0011`.

## Greek-led decision

Both added candidates arise only from the normalized speech formula `ἔφη`.
The 202d-202e question that Socrates does not regard Eros as a god is not
restated, answered, or revised by either the 206a refinement about possessing
the good or the 206c clarification about pregnancy and birth. The compact
`resolution_ref` slices, together with the linked claim-ledger source refs,
bound this negative disposition to the canonical Greek text.

## Terminal review

All ten current candidate keys have exactly one terminal disposition. This
receipt covers only the `symposium` relation scope; it makes no broader corpus
or plan-closure claim.

## Focused verification

- Direct candidate/ledger check: `10/10`, exact keys, zero validation issues,
  `accepted=6`, `rejected=4`, `unreviewed=0`, `needs_split=0`.
- `bun run harness relations-segmented symposium --dry-run`: zero adjudication
  batches.
- `bun run harness relations-review-segmented symposium --dry-run`: zero
  review batches.
