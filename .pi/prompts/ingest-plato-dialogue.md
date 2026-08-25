# Ingest Plato Dialogue

Ingest `$1` using the Plato observation extraction protocol.

The extraction protocol is in the system prompt. The current feature registry
is provided by the harness at run start and refreshed if it changes during the
run.

Read:

- `raw/plato/greek/$1.txt`

Produce:

- `wiki/observations/$1.md`
- synchronized feature candidates in `wiki/features-so-far.md` through
  `wiki_commit_observation`

Constraints:

- Extract records, not readings.
- The harness records the `wiki/ingest-log.md` entry automatically; do not write it.
- Every observation must be checkable from the cited Stephanus span.
- Use `wiki_source_span` for every observation's `source_ref`; copy the returned
  `source_ref` object unchanged.
- Store source references, not source snippets. Do not persist the
  `wiki_source_span` excerpt.
- Keep Greek only in `greek_terms`. Write `observation`, `textual_basis`,
  `limits`, and `english_gloss` in English with Stephanus refs.
- Use English only for short review glosses.
- Reuse feature candidates when possible.
- Provide `feature_family` and `feature_label` for each observation. Prefer the
  seed families in the protocol. If none fits, use a narrow lowercase
  snake_case passthrough family.
- `feature_label` names a recurring textual phenomenon, not the content of one
  passage. Reuse an existing label when the same observable pattern recurs; put
  passage-specific content in `observation`, not the label.
- Do not invent or preserve `feature_id`; `wiki_write_observation` assigns it
  after normalizing `feature_family` and `feature_label`.
- Add only feature families and labels during extraction. Preserve existing
  feature statuses and notes.
- Do not claim esotericism, hidden intention, or external interpretation.
- Do not write synthesis pages.
- Use `wiki_stage_observation` for drafts and retries. This validates the
  ledger but does not write wiki files or sync the feature registry.
- If `wiki_stage_observation` rejects the ledger, fix the concise validation
  feedback and call it again.
- Call `wiki_commit_observation` exactly once after the full dialogue ledger has
  been accepted by `wiki_stage_observation`.
- Do not call `wiki_write_feature_registry` during ingest. The observation write
  commit tool synchronizes `wiki/features-so-far.md`.
