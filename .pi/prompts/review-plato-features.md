# Review Plato Feature Candidates

Review the observation ledger for `$1`.

The extraction protocol is in the system prompt. The current feature registry
is provided by the harness at run start and refreshed if it changes during the
run.

Read:

- `wiki/observations/$1.md`
- source passages in `raw/plato/greek/$1.txt` as needed

Check:

- every observation has a Stephanus span
- every observation has a `source_ref`
- source refs resolve to raw Greek offsets and hashes
- each observation is local to its cited span
- no observation claims esotericism, hidden intent, or external interpretation
- each `feature_label` names a recurring textual phenomenon, not passage-specific
  content
- each observation is compared against the existing feature registry before
  keeping its current label
- new feature candidates are not duplicates of existing candidates
- passage-specific singleton labels are renamed to an existing recurring label
  when the phenomenon matches
- passthrough feature families are useful and narrow, or are noted for later
  promotion if they recur across dialogues
- overbroad feature candidates are marked `needs_split`
- weak or unsupported observations are marked `rejected`

Required write-back workflow:

- For every observation in the ledger, set `review_status` to `accepted`,
  `rejected`, or `needs_split`; never leave `unreviewed` after review.
- If a feature label changes, update the observation ledger first, then update
  `wiki/features-so-far.md` so every observation id appears under the feature
  id assigned by the written observation ledger.
- Reconcile prior decisions recorded in `wiki/review/*.md` into canonical
  observation statuses and feature-registry decisions where they apply.
- Persist the full updated observation ledger with `wiki_write_observation`.
- Add review notes and propose feature merges, splits, or renames where needed.
- If feature-registry decisions are needed, persist the full updated
  `wiki/features-so-far.md` with `wiki_write_feature_registry`. If no registry
  changes are needed, do not rewrite the registry.

The review is complete only when no observation in the ledger remains
`unreviewed`.

The harness records the `wiki/ingest-log.md` entry automatically; do not write it.

Do not add interpretive synthesis.
