# Plato Wiki Extraction Protocol

## Purpose

This project is a neutral, source-bound Plato textual-fact compiler. Extraction
produces records, not readings. Question-driven comparison is a separate,
reviewed ontology lane built from accepted records.

## Canonical source

Read Greek only from `raw/plato/greek/` during extraction and source
adjudication. Do not read translations. Every persisted source assertion must be
checkable from a copied `source_ref` whose offsets and hash resolve against that
Greek source.

## Observation boundary

An observation states one atomic fact present in its cited span. It records:

```yaml
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6e
source_ref:
  source_path: raw/plato/greek/euthyphro.txt
  stephanus_span: 5d-6e
  start_marker: 5d
  end_marker: 6e
  start_char: 0
  end_char: 0
  text_sha256: ""
greek_terms: []
english_gloss: ""
observation: ""
textual_basis: ""
limits: ""
review_status: unreviewed
```

Use `wiki_source_span` and copy the returned `source_ref` unchanged. Persist
references rather than excerpts. Greek script belongs only in `greek_terms`;
`observation`, `textual_basis`, `limits`, and `english_gloss` are English.
`english_gloss` is review convenience, not evidence.

Do not encode topics, textual functions, presentation forms, dramatic context,
or summaries in the observation identity. Comparison axes, concepts, and
many-to-many observation memberships live only in `wiki/ontology` and require
their own concept-first review.

## Forbidden extraction claims

Do not record:

- Plato's hidden or secret intention;
- claims that a passage is esoteric;
- external interpretive frameworks;
- psychological motives not directly stated in the text;
- synthesis across uncited spans;
- absence or counterevidence inferred merely from a rejected review record.

## Extraction workflow

For each dialogue:

1. Read the complete canonical Greek source.
2. Segment by Stephanus range without reducing the coverage denominator.
3. Extract locally checkable, atomic observations.
4. Resolve every citation with `wiki_source_span`.
5. State what each record does not establish in `limits`.
6. Validate drafts with `wiki_stage_observation` or segmented deltas with
   `wiki_append_observations`.
7. Commit a whole-dialogue ledger exactly once with
   `wiki_commit_observation`.
8. Do not edit ontology memberships or synthesis views during extraction.

Bias toward underclaiming. Omission can be repaired; interpretation in the
source-bound ledger corrupts downstream comparison.

## Review workflow

Review every observation, including rejected records. Check source fidelity,
span accuracy, atomicity, omissions, duplications, record type, neutrality, and
status. End with `accepted`, `rejected`, or `needs_split`; do not treat rejection
as counterevidence or textual absence.

Ontology review is separate. Each comparison axis asks one precise
cross-dialogue question, each concept answers within that axis, and memberships
link accepted observations many-to-many with explicit assignment bases. See
`docs/ontology-vnext.md`.

## Artifact boundary

Canonical semantic lanes are ledgers or strict data files:

```text
raw/plato/greek/
wiki/observations/
wiki/claims/
wiki/relations/
wiki/commentary/
wiki/ontology/axes.jsonl
wiki/ontology/concepts.jsonl
wiki/ontology/memberships.jsonl
wiki/ingest-log.md
```

Clusters, dossiers, registries, and reader pages are deterministic projections,
not peer ontologies. The harness appends run history to `wiki/ingest-log.md`;
agents do not write it directly.
