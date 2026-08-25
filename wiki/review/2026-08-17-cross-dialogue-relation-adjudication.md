# Cross-dialogue relation adjudication

- date: 2026-08-17
- scope: `relations/cross-dialogue`
- source: canonical accepted claim records with their Greek source spans in the
  referenced dialogue files

## Decision

The deterministic cross-dialogue candidate set contains 1,448 stable keys. The
existing 1,302 relation rows were retained. The 146 currently missing keys
were reviewed individually against both linked claim records and their
source-bound Greek spans.

- 14 decisions are substantive relations: 6 restatements and 8 tensions, with
  no contradictions. The accepted set is limited to explicit recurrences or
  bounded pressure around virtue and teachability, true belief and knowledge,
  and recollection; it does not treat shared Greek vocabulary as sufficient.
- 132 candidates are terminally rejected because the shared normalized term is
  incidental to distinct propositions. Rejected records remain explicit
  terminal decisions with `review_status: rejected`; rows involving a revised
  claim use a checked `verbal_only` resolution reference.
- No candidate was marked `needs_split`.

The accepted new rows are exactly `rel_cross-dialogue_1410`,
`rel_cross-dialogue_1418`, `rel_cross-dialogue_1440`–`1442`,
`rel_cross-dialogue_1444`–`1447`, `rel_cross-dialogue_1457`,
`rel_cross-dialogue_1469`, `rel_cross-dialogue_1472`,
`rel_cross-dialogue_1485`, and `rel_cross-dialogue_1488`. The remaining 132
new rows from `rel_cross-dialogue_1343` through `rel_cross-dialogue_1488` are
rejected. No claim or observation ledgers were changed.

## Verification

- Deterministic candidate coverage: 1,448/1,448 exact stable keys.
- Cross-dialogue relation ledger validator: 0 issues.
- Terminal statuses in this delta: accepted 14, rejected 132, needs_split 0.
