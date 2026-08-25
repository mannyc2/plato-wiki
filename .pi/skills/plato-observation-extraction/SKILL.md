---
name: plato-observation-extraction
description: Extract checkable Plato text observations into wiki ledgers without producing interpretive readings.
---

# Plato Observation Extraction

Use this skill when ingesting or reviewing a Plato dialogue in this repository.

The goal is to compile textual records, not interpretations. Do not generate
hidden-doctrine claims or hypotheses. Extract checkable observations that a
reviewer can verify against the cited source ref and Stephanus span.

## Required Context

The harness provides the extraction protocol and current feature registry in
the system prompt. Do not read them through tools during a run.

## Text Inputs

Read Greek text from `raw/plato/greek/`.

Do not read translation files during extraction. The Greek text is the canonical
source for source refs, spans, and observation records.

## Extraction Rules

Every observation must include:

- a stable `observation_id`
- `source_work`
- `stephanus_span`
- `source_ref` copied unchanged from `wiki_source_span`
- `feature_family`
- `feature_label`; the harness assigns `feature_id`
- one local, checkable `observation`
- `textual_basis`
- `limits`
- `review_status`

Observation records store source references, not source snippets. Use the
`wiki_source_span` excerpt only to inspect the span; do not persist it. Keep
Greek only in `greek_terms`. Write `observation`, `textual_basis`, `limits`,
and `english_gloss` in English with Stephanus refs.

During ingest, call `wiki_stage_observation` for drafts and retries. This
validates the ledger without writing wiki files or synchronizing the feature
registry. If `wiki_stage_observation` rejects the ledger, fix the concise
validation feedback and call it again. Once the complete dialogue ledger is
accepted, call `wiki_commit_observation` exactly once.

During review, use `wiki_write_observation` for observation-ledger edits.

## Forbidden In Extraction

Do not write:

- claims about Plato's hidden intention
- claims that a passage is esoteric
- claims about external interpretive frameworks
- psychological motives not directly stated by the text
- synthesis across uncited spans

If a possible observation needs multiple spans, cite every span explicitly and
state the limit of the comparison.

## Feature Candidates

Feature families are a soft controlled vocabulary. Use a seed family when it
fits; otherwise use a narrow lowercase snake_case passthrough family so the
hole remains visible. Feature labels are candidates within a family. Review may
accept, merge, split, or reject them.

Use the injected current feature registry context:

- Reuse an existing feature candidate when the new observation fits it.
- Add a new mechanical `feature_label` only when no existing candidate fits.
- Keep `feature_family` stable when reusing an existing candidate.
- Prefer narrow observable labels over broad theoretical labels.
- Do not rename or merge feature candidates during extraction.
- Put rename, split, merge, or rejection proposals in the review notes.

## Output Files

Write dialogue observations to:

```text
wiki/observations/<dialogue-slug>.md
```

During ingest, `wiki_commit_observation` synchronizes:

```text
wiki/features-so-far.md
```

Do not call `wiki_write_feature_registry` during ingest. That tool is reserved
for review passes. Do not append feature candidates or run history by hand.

The harness appends the operation to:

```text
wiki/ingest-log.md
```

Do not write the ingest log yourself.

Do not create synthesis essays during extraction.

## Review Pass

Use a review pass after extraction to mark observations and feature candidates
as `accepted`, `rejected`, or `needs_split`.

The review pass may propose merges and renames. It should still avoid
interpretive synthesis.
