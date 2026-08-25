# Plato Wiki Extraction Protocol

## Purpose

This project is a Plato textual fact compiler, not an esotericism detector.

Ingest Plato dialogues and produce structured, checkable records about the text.
If larger interpretive patterns exist, they should become visible from
accumulated records rather than from prompting an LLM to find them.

The extraction agent must produce records, not readings.

## Scope

This wiki extracts observations from Plato only.

Secondary literature and external interpretive frameworks are out of scope for
extraction. This avoids blending source evidence with interpretive claims.

Default dialogue queue:

1. `Euthyphro`
2. `Apology`
3. `Republic I`

The queue may change, but an ingest command should process one dialogue at a
time.

## Text Inputs

The harness provides this protocol and the current feature registry in the
system prompt.

Read Greek text from `raw/plato/greek/`. Do not read translation files during
extraction. The Greek text is the canonical source for source refs, spans, and
observation records.

## Core Rule

Every observation must be checkable from the cited passage.

A valid observation does not say what Plato secretly means. It says what is
present in the text, where it appears, and why the observation is a textual
feature rather than an interpretation.

Forbidden in the extraction layer:

- Claims about Plato's secret intention
- Claims that a passage is esoteric
- Claims about what an external interpretive framework would say
- Psychological motives not directly stated in the text
- Synthesis across uncited spans

Do not include those claims in extraction records.

## Feature Discovery

The feature registry grows from recurring, checkable phenomena in the text.
Feature families are observation types. Feature labels are narrower candidates
inside those families. Review may accept, merge, split, or reject labels and may
promote recurring passthrough families into the seed list.

Seed feature families:

- `dramatic_case_setup`: lawsuit, indictment, public setting, reported case, or
  legal-religious stakes that establish why the dialogue is occurring.
- `turn_geometry`: short-answer/set-speech contest, turn-length pressure,
  assent density, respondent collapse, or explicit procedure control.
- `prosopography`: named historical cast, role/type, cross-dialogue recurrence,
  or externally known identity used as dramatic data.
- `elenchus`: assent chain, refutation, contradiction, aporia, reset, or forced
  alternative.
- `definition_ladder`: definiendum, numbered or successive definition attempt,
  revision, failure mode, or return to the same definition target.
- `myth_demarcation`: bounded myth, mythic proof, myth/logos hedge, divine or
  poetic narrative used as an argumentative unit.
- `frame_depth`: reported dialogue frame, embedded report, transmission device,
  memory or reliability hedge.
- `craft_analogy`: craft/source domain mapped onto a target domain, including
  cases where the analogy is rejected or strained.
- `forms_trajectory`: form-language, essence/property contrast, participation
  or separation vocabulary, or critique of form-style claims.
- `irony_marker`: explicit knowledge-disavowal, mock-deference, or in-text
  accusation of irony.
- `closure_type`: aporetic close, myth close, prayer, doctrine, departure, or
  final speech-act.

If no seed family fits, use a narrow lowercase snake_case passthrough family.
Do not force a record into a seed family just to avoid a new value.

Use the current `features-so-far` context during extraction:

- The harness provides the current `features-so-far` list before ingesting a new
  passage.
- If a new observation fits an existing feature candidate, reuse the existing
  family and label.
- If it does not fit, create a new family/label pair.
- Treat `feature_label` as a recurring textual phenomenon, not as a summary of
  one passage's content. Put passage-specific content in `observation`,
  `textual_basis`, and `limits`; reuse an existing label when the same
  observable pattern recurs.
- Do not create broad abstract labels when a narrower observable label is
  enough.
- Do not rename existing labels during an ingest pass. Rename only during a
  review pass.

Candidate labels should be mechanical, for example:

```yaml
feature_family: definition_ladder
feature_label: definition_revised_after_objection
```

The harness normalizes `feature_family` and `feature_label`, then assigns
`feature_id` when `wiki_write_observation` accepts the ledger.

This lets the corpus teach the schema without allowing unlimited schema drift.

## Observation Record

Each extracted observation should have this shape:

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
feature_family: definition_ladder
feature_label: candidate_label_here
observation: ""
textual_basis: ""
limits: ""
review_status: unreviewed
```

Field requirements:

- `observation_id`: stable local identifier.
- `source_work`: Plato work or bounded work segment.
- `stephanus_span`: required.
- `source_ref`: required. Use `wiki_source_span` and copy its `source_ref`
  object unchanged; do not calculate offsets.
- `greek_terms`: optional short Greek tokens only. Greek belongs here, not in
  `observation`, `textual_basis`, `limits`, or `english_gloss`.
- `english_gloss`: optional review text; not evidence.
- `feature_family`: seed family or normalized passthrough family.
- `feature_label`: short human-readable label.
- `feature_id`: assigned by the harness after normalizing `feature_family` and
  `feature_label` when the ledger is written.
- `observation`: one checkable claim about the cited text.
- `textual_basis`: why the observation follows from the citation.
- `limits`: what the observation does not prove.
- `review_status`: one of `unreviewed`, `accepted`, `rejected`, or `needs_split`.

## Extraction Pass

For each dialogue:

1. Use the harness-provided protocol and feature registry context.
2. Read the Greek source for the dialogue.
3. Segment the dialogue by Stephanus range.
4. Extract observations that are locally checkable from each segment.
5. Use `wiki_source_span` for every observation's cited span.
6. Reuse existing feature candidates when possible.
7. Add new feature families or labels only when the observation type is not
   already covered.
8. Validate drafts and retries with `wiki_stage_observation`.
9. Commit the final accepted staged ledger exactly once with
   `wiki_commit_observation`.
10. Let `wiki_commit_observation` synchronize `features-so-far` from accepted
   observation feature families and labels.
11. Do not write synthesis pages during the extraction pass.

Observation records store source references, not source snippets. The raw Greek
text remains the citation source. Use `wiki_source_span` to inspect the span and
persist the returned `source_ref`; do not persist the excerpt. If exact wording
matters, put only the relevant short tokens in `greek_terms` and explain the
basis in English with Stephanus references.

`wiki_stage_observation` validates this boundary during ingest. If the tool
rejects a ledger, use its concise feedback to revise the records and call the
tool again. Do not commit until the full dialogue ledger has been accepted.

During ingest, do not call `wiki_write_feature_registry`; committed observation
ledgers update `features-so-far` deterministically. During review,
`wiki_write_feature_registry` validates the full feature registry before
replacing `wiki/features-so-far.md`. Review updates should use that tool, not
append operations. If the tool rejects the registry, use its concise feedback to
revise the full registry and call the tool again.

The extraction pass should bias toward underclaiming. A missing observation can
be left out; an interpretive observation contaminates the ledger.

## Review Pass

After each dialogue ingest, run a review pass that checks:

- Every observation has a Stephanus span.
- Every observation has a `source_ref` from `wiki_source_span`.
- The cited source hash and offsets resolve back to the raw text.
- The observation is local to its cited span.
- The observation does not claim esotericism, hidden intent, or external
  interpretation.
- New feature candidates are not duplicates of existing candidates.
- Overbroad feature candidates are split.
- Nearly identical feature candidates are merged.

Review may rename, merge, split, accept, or reject feature candidates.

Review should not add interpretive synthesis.

Global label normalization is separate from extraction. When normalizing
labels, follow `docs/label-normalization-standards.md` and the project-local
skill `.pi/skills/plato-label-normalization/SKILL.md`. Merge labels by
repeatable textual function, not by topic, and preserve observation prose,
source refs, Greek terms, limits, and review status.

## Wiki Shape

Wiki artifacts should be ledgers and indexes, not essays.

Suggested structure:

```text
.pi/
  skills/
    plato-observation-extraction/
      SKILL.md
    plato-label-normalization/
      SKILL.md
  prompts/
    ingest-plato-dialogue.md
    review-plato-features.md
raw/
  plato/
    greek/
wiki/
  observations/
    euthyphro.md
    apology.md
    republic-i.md
  features-so-far.md
  ingest-log.md
docs/
  plato-wiki-extraction-protocol.md
  pi-agent-core-wiki-runner.md
  label-normalization-standards.md
```

`features-so-far.md` should list feature candidates, examples, and review
decisions.

`ingest-log.md` should be append-only and record each extraction or review pass.
