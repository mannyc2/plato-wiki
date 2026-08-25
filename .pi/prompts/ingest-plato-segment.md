# Ingest Plato Segment

Ingest only `$4` from Plato dialogue `$1`.

The extraction protocol is in the system prompt. The current feature registry
is provided by the harness at run start and refreshed if it changes during the
run.

Read:

- `raw/plato/greek/$1.txt`, but only through `wiki_source_span` for `$4`
- Do not read `wiki/observations/$1.md`; the append tool handles duplicate
  detection from the on-disk ledger.

Read discipline:

- Start by calling `wiki_source_span` once for `stephanus_span: "$4"` with a
  large enough `max_chars` to read the whole current segment.
- Do not page through every Stephanus marker in the segment.
- Only call `wiki_source_span` again for a narrower span when you have already
  decided to create an observation and need the exact `source_ref` for that
  observation.
- Prefer `stephanus_span: "$4"` and the full-segment `source_ref` for
  observations unless the record mentions only a strictly narrower span. If an
  observation mentions more than one Stephanus marker inside `$4`, use `$4`.
- If validation reports `out_of_span_reference` for a marker that is still
  inside `$4`, widen that observation to `$4` and copy a fresh `source_ref` for
  `$4`; do not keep retrying the narrower span.
- If validation reports `greek_outside_terms`, do not call `wiki_source_span`
  again. Rewrite the same selected records immediately, remove all Greek script
  from `observation`, `textual_basis`, `limits`, and `english_gloss`, keep only
  short tokens in `greek_terms`, then call `wiki_append_observations` again.
  Before retrying, scan every prose field for Greek letters; do not leave
  parenthetical Greek terms, quoted Greek formulas, or Greek words inside
  English explanations.
- Do not exhaustively enumerate the segment. Write at most 3 high-signal
  observation records for this segment.
- Call `wiki_append_observations` after no more than 4 total
  `wiki_source_span` calls unless tool validation feedback requires one
  correction pass.
- `wiki_source_span` has a hard limit of 6 calls in a segmented ingest segment.
  If you reach the limit, append the selected records or call
  `wiki_append_observations` with `content: ""`.

Produce:

- new fenced YAML observation records for `$4` appended to
  `wiki/observations/$1.md` through `wiki_append_observations`
- synchronized feature candidates in `wiki/features-so-far.md` through the
  append tool

Do not draft observations, explain your choices, summarize the passage, or
print YAML in the assistant message. Use `wiki_append_observations` for the
segment result.

Fence every observation record as a Markdown YAML code block. Do not send bare
YAML to `wiki_append_observations`.

Constraints:

- Extract records, not readings.
- Stay within segment `$4` (`$2` through `$3`). Do not add observations whose
  cited `source_ref` starts outside this segment.
- Each observation's `stephanus_span` and copied `source_ref` must cover every
  Stephanus reference mentioned in that observation's `observation`,
  `textual_basis`, and `limits` fields.
- Use `wiki_source_span` for every observation's `source_ref`; copy the returned
  `source_ref` object unchanged.
- Multiple observations may cite the same `source_ref` span when the same Greek
  marker contains distinct textual phenomena. Do not emit two observations with
  the same `source_ref` span and the same `feature_label`.
- If validation reports `duplicate_source_feature_anchor`, do not resubmit the
  same anchor. Remove the duplicate record from the retry. If no unique records
  remain for the segment, call `wiki_append_observations` with `content: ""`.
- Store source references, not source snippets. Do not persist the
  `wiki_source_span` excerpt.
- Keep Greek only in `greek_terms`. Write `observation`, `textual_basis`,
  `limits`, and `english_gloss` in English with Stephanus refs.
- Do not put Greek script in `observation`, `textual_basis`, `limits`, or
  `english_gloss`; the append tool rejects those fields when they contain Greek
  characters.
- Reuse feature candidates and existing labels when possible.
- Provide `feature_family` and `feature_label` for each observation. Prefer the
  seed families in the protocol. If none fits, use a narrow lowercase
  snake_case passthrough family.
- `feature_label` names a recurring textual phenomenon, not the content of one
  passage. Reuse an existing label when the same observable pattern recurs; put
  passage-specific content in `observation`, not the label.
- Treat `observation_id` as temporary during segmented append. The append tool
  assigns the persisted IDs from the current ledger, so do not advance or
  preserve draft IDs after validation feedback.
- Do not invent or preserve `feature_id`; `wiki_append_observations` assigns it
  after normalizing `feature_family` and `feature_label`.
- Add only feature families and labels during extraction. Preserve existing
  feature statuses and notes.
- Do not claim esotericism, hidden intention, or external interpretation.
- Do not write synthesis pages.
- Do not call `wiki_stage_observation` or `wiki_commit_observation`; this is a
  segmented append run.
- Call `wiki_append_observations` once with the new records for this segment. If
  the segment has no extractable records, call `wiki_append_observations` with
  `content: ""`.
- The harness records the `wiki/ingest-log.md` entry automatically; do not write
  it.
