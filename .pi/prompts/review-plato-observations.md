# Review Plato Observations

Review the complete observation ledger for `$1`.

The extraction protocol is in the system prompt.

Read:

- `wiki/observations/$1.md`
- source passages in `raw/plato/greek/$1.txt` as needed

For every observation:

- verify its `source_ref` with `wiki_source_span`
- check that it states a neutral textual fact local to the cited Greek span
- check span accuracy, atomicity, duplication, record type, and status
- reject unsupported or interpretive records and mark records needing division as
  `needs_split`
- set `review_status` to `accepted`, `rejected`, or `needs_split`

Persist the complete ledger with `wiki_write_observation`. Do not edit
`wiki/ontology`; comparison-axis and concept memberships have a separate reviewed
workflow. The review is complete only when no observation remains `unreviewed`.

The harness records `wiki/ingest-log.md` automatically. Do not add interpretive
synthesis.
