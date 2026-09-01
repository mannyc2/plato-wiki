# Segmented Ingest Design

## Purpose And Authority Boundary

Segmented ingest exhausts a Greek dialogue through bounded source-first reads.
It writes neutral source-bound observations only. Comparison axes, concepts, and
many-to-many memberships are reviewed separately under `wiki/ontology/`;
extraction neither reads nor mutates that classification lane.

## Segmentation Unit

Use ordered Stephanus-marker batches from `derived/plato/stephanus/*.toon`.
Segments have hard boundaries at marker starts and target about 30 KB of source
text by default. The planner covers the requested Greek range deterministically;
sampling may order segments but may not reduce the coverage denominator.

## Delta Write Contract

Each segment writes only new fenced strict-YAML records through
`wiki_append_observations`. The writer:

- treats submitted observation IDs as temporary and assigns the next persisted
  dialogue-local IDs;
- rejects bare YAML and exact duplicate source-bound observations;
- permits a shared span only for distinct atomic textual facts;
- validates the complete resulting ledger, including exact source offsets and
  hashes, bounded evidence prose, and allowed review states; and
- writes the ledger only after validation succeeds.

An empty segment still calls `wiki_append_observations` with empty content. The
harness then records an explicit `no_observations` coverage row instead of
inferring completion from silence.

## Resume Semantics

Resume state is canonical on disk. The planner combines exact observation source
ranges with `wiki/observations/segment-coverage.jsonl`. A coverage row records
the deterministic segment coordinates, run ID, segment index, and either
`processed` or `no_observations`. A segment is complete only when an observation
or explicit coverage row reaches its end boundary. Session transcripts explain
the run but are not the resume authority.

Gap-directed ingest deliberately replans uncovered source intervals even when a
prior coarse segment has a zero-result receipt. That makes a later exhaustive
coverage pass possible without treating the earlier model judgment as textual
absence.

## Orchestration And Context Budget

Use one model conversation per segment. The harness supplies the extraction
protocol and the bounded Greek slice, requires a write-tool call, validates the
delta, records coverage, and only then advances. It does not inject a growing
classification catalog into extraction context.

The default 30 KB grid keeps source and output bounded. The model should append
after no more than four source-span calls; six is the hard limit, leaving room
for one validation repair. Whole-dialogue ingest remains a separate workflow:
it stages validated drafts with `wiki_stage_observation` and persists the final
ledger once through `wiki_commit_observation`.

## Invariants And Verification

- Read `raw/plato/greek/<dialogue>.txt` only through exact source-span tools.
- Store source references and hashes, not copied Greek passages.
- Keep each observation atomic, neutral, and locally checkable.
- Treat zero results as coverage receipts, never as absence or counterevidence.
- Keep extraction and ontology classification as separate reviewed workflows.
- Reject a segment after validation failures unless a later append succeeds.

Verify planner behavior and write semantics with the segment and wiki-tool test
suites, then run `bun run test`, `bun run typecheck`, and `bun run validate`.
