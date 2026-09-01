# Ingest Plato Segment

Ingest only `$4` from Plato dialogue `$1`.

Read `raw/plato/greek/$1.txt` only through `wiki_source_span` for `$4`. Do not
read the existing observation ledger; the append tool handles duplicate
detection.

Start with one full-segment source-span call. Use a narrower call only after
deciding to create a record that requires a narrower exact reference. Make no
more than four calls unless validation requires one correction; the hard limit
is six. Write at most three high-signal atomic observations.

Produce fenced YAML observation records through `wiki_append_observations`.
Use temporary observation IDs; the writer assigns persisted IDs. Multiple
records may share a span when they state distinct facts, but do not submit an
exact duplicate source-bound observation.

Every record must be neutral and checkable from its copied `source_ref`. Store
references, not excerpts. Keep Greek only in `greek_terms` and prose fields in
English. Classification is not part of extraction: do not add comparison-axis
or concept fields and do not edit `wiki/ontology`.

If the segment has no extractable record, call `wiki_append_observations` with
empty content. Do not draft in the assistant message, write synthesis, or edit
the ingest log.
