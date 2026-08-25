# Review Plato Observation Batch

Review only this observation batch for `$1`:

```text
$2
```

Batch index:

```text
$3
```

The extraction protocol is in the system prompt. The current feature registry
is provided by the harness at run start and refreshed if it changes during the
run.

Read:

- `wiki/observations/$1.md`
- source passages in `raw/plato/greek/$1.txt` as needed

For each target observation id:

- verify the existing `source_ref` with `wiki_source_span`
- check that the observation is local to its cited Greek span
- compare its `feature_family` and `feature_label` against the existing feature
  registry
- reuse an existing recurring label when the phenomenon matches
- do not invent a new feature label or candidate during segmented review
- do not change `feature_family`, `feature_label`, `feature_id`, or the feature
  registry during segmented review; label normalization happens after all
  ledgers have been ingested and reviewed
- set `review_status` to `accepted`, `rejected`, or `needs_split`

Write-back workflow:

- Persist only target review-status decisions with
  `wiki_update_review_statuses`.
- Do not call `wiki_write_observation` during segmented review unless explicitly
  repairing a full-ledger validation failure outside the normal batch workflow.
- Do not call `wiki_write_feature_registry` during segmented review.
- Do not write `wiki/ingest-log.md`; the harness records run history.

This batch is complete only when every target observation id is no longer
`unreviewed`. Non-target observations may remain `unreviewed`.

Do not add interpretive synthesis.
