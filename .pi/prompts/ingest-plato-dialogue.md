# Ingest Plato Dialogue

Ingest `$1` using the Plato observation extraction protocol.

Read only `raw/plato/greek/$1.txt`.

Produce `wiki/observations/$1.md` as a ledger of neutral source-bound textual
facts. Classification is not part of extraction: do not add comparison-axis or
concept fields and do not edit `wiki/ontology`.

Constraints:

- Extract records, not readings.
- Every observation must be checkable from its cited Stephanus span.
- Use `wiki_source_span` for every `source_ref` and copy the returned object
  unchanged.
- Store source references, not source snippets.
- Keep Greek only in `greek_terms`; write prose fields in English.
- Keep each record atomic and state its evidentiary limits.
- Do not claim esotericism, hidden intention, or external interpretation.
- Use `wiki_stage_observation` for drafts and retries, then call
  `wiki_commit_observation` exactly once for the accepted complete ledger.
- Do not write synthesis pages or the ingest log; the harness records run
  history automatically.
