# Meno relation adjudication

- date: 2026-08-17
- scope: `relations/meno`
- source: `raw/plato/greek/meno.txt`, with linked claim spans checked in the
  canonical accepted claim ledger

## Decision

The deterministic Meno candidate set contains 33 keys. The existing
`rel_meno_0001` row was retained; the 32 omitted keys were adjudicated against
both linked claim records and their Greek spans.

- 8 decisions are substantive relations: 2 tensions, 4 restatements, and 2
  revisions. Their shared propositions are explicit in the cited claims:
  implication-level virtue/teachability pressure, true-belief/knowledge
  refinement, and repeated non-teachability conclusions.
- 24 candidates are terminally rejected because normalized-term overlap does
  not connect the propositions. These rows retain the closest schema fields
  for the candidate and pair-specific compatibility/nonrelation bases; their
  `review_status` is `rejected`, not accepted.
- No candidate was marked `needs_split`.

The accepted relation rows are `rel_meno_0014`, `rel_meno_0015`,
`rel_meno_0024`, and `rel_meno_0028`–`rel_meno_0032`; the other new rows are
rejected lexical or scope-distinct non-relations.
The second-pass check rejected `rel_meno_0016` and `rel_meno_0033` because
recoverable/stable knowledge can coexist with civic success by true belief; it
also narrowed `rel_meno_0024` from contradiction to tension because its
conditional does not itself assert the antecedent. Every new row cites only
`claim_meno_*` records and Meno Greek spans, with no translation extraction or
cross-scope inference.

## Verification

- Deterministic candidate coverage: 33/33 exact stable keys.
- Relation ledger validator: 0 issues.
- Terminal statuses in this delta: accepted 8, rejected 24, needs_split 0.
