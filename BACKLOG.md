# Deterministic Data Backlog

This backlog lists mechanical data we can derive from Greek Plato text and then
provide to the agent. The goal is to make the model responsible for local
judgment, not for counting, offset math, source hashing, span lookup, speaker
segmentation, or token census.

## Priority 0: Ontology vNext Validation And Audit Closure

### Validate Every Canonical Semantic Lane From `validate`

Problem: repository validation must establish one coherent source-to-view graph,
not a collection of independently valid files.

Work:

- Validate every `wiki/observations/*.md` ledger and exact Greek source anchor.
- Validate strict `wiki/ontology/{axes,concepts,memberships}.jsonl` together,
  including derived IDs, closed schemas, comparison questions, references, and
  accepted-observation membership targets.
- Validate claims, relations, commentary citations, voices, and every graph
  reference against the same accepted canonical set.
- Reject classification fields in observation records and reject any reader or
  projection that bypasses the canonical ontology lane.
- Report paths and concise issue counts while keeping malformed-input cases in
  focused validator tests.

Output:

- `bun run validate` fails on any invalid semantic record, edge, ontology row,
  or deterministic projection.

Why it matters:

- Schema changes become safer.
- Generated wiki artifacts cannot silently drift from their canonical inputs.

### Axis, Concept, And Membership Quality Report

Problem: question-driven comparison still needs an audit view for overly broad,
singleton-heavy, or weakly populated concepts.

Work:

- List every axis with its dimension and exact cross-dialogue question.
- Count concepts, memberships, accepted observations, and represented dialogues
  per axis.
- Report cross-dialogue concepts, singleton concepts, and accepted observations
  without a membership.
- Show a bounded set of observation IDs for each quality finding.

Output:

- The static quality page and validation summary derive only from validated
  axes, concepts, memberships, and accepted observations.

Why it matters:

- Review can refine comparison questions without changing source-bound facts.
- Quality work remains measurable without creating a second classification
  authority.

## Priority 1: Citation Geometry

### Stephanus Span Index

Problem: the model should not reason about character offsets or span
boundaries.

Work:

- Parse every `raw/plato/greek/*.txt` file.
- Record every Stephanus marker and character offset.
- Create a deterministic span index per dialogue.

Suggested output:

```text
derived/plato/stephanus/euthyphro.toon
```

Suggested record:

```text
dialogue: euthyphro
source_path: raw/plato/greek/euthyphro.txt
source_sha256: ""
markers[1]:
  marker | start_char | end_char
  2a     | 0          | 282
```

Tools affected:

- `wiki_source_span`
- future `wiki_stephanus_index`

Why it matters:

- Span resolution becomes inspectable.
- Derived records can cite the same coordinate system.

### Source Ref Auditor

Problem: source refs are validated on write, but we need a standalone audit
that can detect source drift.

Work:

- Scan observation ledgers.
- Recompute every `source_ref.text_sha256`.
- Report stale offsets or mismatched hashes.

Output:

- CLI command or validation section.

Why it matters:

- If raw text changes, the wiki tells us what needs regeneration.

## Priority 2: Speaker Turns

### Done: Speaker Turn Extractor

Problem: turn geometry and speaker-role observations should not require the
model to infer speaker boundaries from raw text each time.

Work:

- Parse speaker labels from Greek text format.
- Emit one TOON row per speaker turn.
- Assign stable `turn_id`.
- Include Stephanus envelope, character range, speaker, text hash, and Greek
  character counts. `token_count` is deferred to the Greek token index.

Suggested output:

```text
derived/plato/turns/euthyphro.toon
```

Suggested record:

```text
turns[1]:
  turn_id             | dialogue  | speaker  | stephanus_start | stephanus_end | start_char | end_char | text_sha256 | greek_char_count | token_count
  turn_euthyphro_0001 | euthyphro | Socrates | 2a              | 2b            | 0          | 745      | ""          | 745              | 120
```

Observation schema impact:

```yaml
derived_ref:
  kind: speaker_turn
  path: derived/plato/turns/euthyphro.toon
  ids: [turn_euthyphro_0001]
```

Why it matters:

- Enables `turn_geometry`.
- Enables speaker-conditioned metrics.
- Reduces whole-file reading.

### Turn Lookup Tool

Problem: if turns exist only as files, the agent may still copy too much
context.

Work:

- Add `wiki_turns_for_span`.
- Input: dialogue and Stephanus span.
- Output: compact turn records and optional short excerpts.
- Return derived refs for citation.

Why it matters:

- The agent can cite turn IDs instead of re-parsing the file.

## Priority 3: Greek Token And Anchor Indexes

### Done: Greek Token Index

Problem: term counting should be deterministic.

Work:

- Tokenize Greek text conservatively.
- Preserve original token, normalized token, character offsets, Stephanus
  envelope, and speaker turn ID when available.
- Do not lemmatize until the token index is stable.

Suggested output:

```text
derived/plato/tokens/euthyphro.toon
```

Suggested record:

```text
tokens[1]:
  token_id             | dialogue  | turn_id             | surface | normalized | start_char | end_char | stephanus
  tok_euthyphro_000001 | euthyphro | turn_euthyphro_0001 | δίκην   | δικην      | 42         | 47       | 2a
```

Why it matters:

- Enables anchor census without LLM counting.
- Enables word-boundary anchor matching: the exact-substring scan produces
  in-word false positives (e.g. ναί inside εἶναί at sophist 247a - the
  only advisory row in the 2026-07-02 missing-features report; see
  wiki/review/2026-07-02-anchor-report-disposition.md).
- Supports later Greek-only batch metrics.

### Done: Anchor Lexicon

Problem: the agent needs known cues without being told to overinterpret them.

Work:

- Maintain a small project lexicon of observable Greek anchors.
- Group anchors by detection purpose, not by theory.
- Include exact forms first; add normalization only after token index is stable.

Suggested output:

```text
derived/plato/anchors/lexicon.toml
```

Initial groups:

- definition prompts: `τί ἐστι`, `εἶδος`, `ἰδέα`, `οὐσία`
- assent and concession: `ναί`, `πάνυ γε`, `ὁμολογεῖς`
- aporia and reset: `ἀπορεῖν`, `πάλιν`
- divine/legal terms: `ὅσιον`, `ἀνόσιον`, `δίκη`, `γραφή`
- irony markers: `εἰρων`
- method terms: `ὑπόθεσις`, `μαιευτική`, `κατ' εἴδη`

Why it matters:

- Helps extraction without telling the model what to conclude.

### Done: Token-Backed Anchor Occurrence Index

Problem: if the model has to search raw text manually, it will miss or invent
occurrences.

Work:

- Run anchor lexicon against token and phrase indexes.
- Emit occurrence records with offsets, span, token IDs, and turn ID.

Suggested output:

```text
derived/plato/anchors/euthyphro.toon
```

Why it matters:

- Supports observations grounded in exact Greek cues.
- Makes missed obvious features easier to audit.

## Priority 4: Turn Geometry Metrics

### Done: Turn Length Metrics

Problem: `turn_geometry` should be measured, not guessed.

Work:

- Compute character and token count per turn.
- Compute per-speaker distributions.
- Mark unusually long turns relative to local dialogue distribution.

Suggested output:

```text
derived/plato/metrics/turn-lengths/euthyphro.toon
```

Why it matters:

- Supports brachylogia/makrologia observations.
- Helps detect set speeches.

### Done: Assent Density Metrics

Problem: elenctic collapse into assent is a pattern, but raw impressions are
weak.

Work:

- Count assent tokens per turn and per speaker.
- Compute stretches of short assent turns.
- Link each count to token IDs.

Suggested output:

```text
derived/plato/metrics/assent/euthyphro.toon
```

Why it matters:

- Gives the agent evidence for turn-geometry records.
- Enables cross-dialogue comparison.

### Done: Procedure Demand Detector

Problem: explicit demands for short answers or procedure shifts should be found
systematically.

Work:

- Search for Greek anchors for brevity, length, answering, asking, and
  procedure.
- Emit candidate spans for review by the agent.

Why it matters:

- Helps with `turn_geometry`.
- Avoids missing overt procedural disputes.

## Priority 5: Dialogue Metadata

### Dialogue Manifest

Problem: dialogue-level metadata should not be repeated or inferred by each
run.

Work:

- Create a manually reviewed manifest.
- Include dialogue slug, title, available Greek file, extraction status,
  authenticity status, broad chronology bin if used, speakers, and notes.

Suggested output:

```text
derived/plato/metadata/dialogues.toml
```

Suggested record:

```toml
[[dialogues]]
slug = "euthyphro"
title = "Euthyphro"
greek_path = "raw/plato/greek/euthyphro.txt"
authenticity_status = "genuine"
chronology_bin = "early"
speakers = ["Socrates", "Euthyphro"]
extraction_status = "ingested"
```

Why it matters:

- Keeps metadata out of observation prose.
- Supports later comparison and scheduling.

### Speaker Directory

Problem: prosopography needs stable identity records, not repeated local
guesses.

Work:

- Create speaker identity records.
- Include name, normalized name, dialogue appearances, role/type, and known
  historical notes only when reviewed.

Suggested output:

```text
derived/plato/metadata/speakers.toml
```

Why it matters:

- Supports `prosopography`.
- Prevents repeated model invention of identity facts.

## Priority 6: Structural Skeletons

### Frame Skeleton

Problem: frame depth is often dialogue-level structure and should not be
rediscovered from scratch.

Work:

- Record frame type per dialogue.
- Record embedded narrator levels when determinable.
- Record frame-entry and frame-exit spans.

Suggested output:

```text
derived/plato/structure/frames.toml
```

Why it matters:

- Supports `frame_depth`.
- Helps distinguish direct dialogue from reported dialogue.

### Closure Skeleton

Problem: closure type can be curated after one careful pass.

Work:

- Record final span, final speaker, closure kind, and final speech-act.
- Link to observation IDs after review.

Suggested output:

```text
derived/plato/structure/closures.toml
```

Why it matters:

- Supports `closure_type`.
- Helps compare aporetic, mythic, prayer, doctrine, and departure endings.

### Definition Ladder Index

Problem: definition attempts are partly interpretive but can be structured
after observation records exist.

Work:

- Read accepted `definition_ladder` observations.
- Group by dialogue and definiendum.
- Assign attempt indexes.
- Link failure modes when accepted.

Suggested output:

```text
derived/plato/structure/definition-ladders.toml
```

Why it matters:

- Avoids making every ingest run maintain global sequence state.
- Enables convergence-rate analysis later.

## Priority 7: Stylometric And Prosodic Metrics

### Particle Frequency Metrics

Problem: particle distribution is a batch statistic, not an LLM task.

Work:

- Count selected particles per dialogue, span, speaker, and turn.
- Store counts with token IDs.

Suggested particles:

- `μήν`
- `τοίνυν`
- `καίτοι`
- `γάρ`
- `οὖν`
- `δή`

Why it matters:

- Supports style-clock analysis without asking the model to count.

### Hiatus And Clausula Metrics

Problem: stylometric prosody requires specialized deterministic processing.

Work:

- Decide whether current raw Greek formatting is sufficient.
- Implement only if text normalization is defensible.
- Emit dialogue-level and span-level metrics.

Why it matters:

- Supports chronology and authenticity comparison later.
- Should not block observation extraction.

## Priority 8: Harness Tools For Derived Data

### `wiki_derived_read`

Problem: derived files should be readable through a constrained tool, not
through broad file access.

Work:

- Allow reads under `derived/plato/**`.
- Return byte counts and record transcript events.
- Keep outputs bounded.

### `wiki_anchor_search`

Problem: the agent needs targeted access to anchor occurrences.

Work:

- Input: dialogue, anchor group or normalized token, optional span.
- Output: occurrence records with derived refs.
- Avoid returning large excerpts by default.

### `wiki_turn_metrics`

Problem: turn metrics should be queryable without dumping raw derived files.

Work:

- Input: dialogue, optional speaker and span.
- Output: compact metrics and derived refs.

## Priority 9: Review And Comparison Reports

### Done: Missing Obvious Features Report

Problem: the system needs coverage checks, not just validation.

Work:

- Compare derived anchor occurrences against observation ledgers.
- Report anchor-rich spans without corresponding observations.
- Keep report advisory, not blocking.

Why it matters:

- Helps detect if an ingest pass missed obvious local features.

### Cross-Dialogue Cluster Builder

Problem: comparative analysis should operate on accepted records, not raw
model impressions.

Work:

- Join accepted observations through canonical concept memberships.
- Emit one validated JSONL projection per comparison axis, with concepts as the
  grouping units.
- Keep Greek anchors, speakers, and structural roles as secondary filters, not
  competing membership keys.
- Emit descriptive clusters only.
- No doctrinal synthesis.

Suggested output:

```text
wiki/clusters/<axis_key>.jsonl
```

Why it matters:

- Creates the material for later interpretation while keeping the layers clean.

### Usage And Cost Regression Report

Problem: prompt/context growth can silently increase cost.

Work:

- Compare usage across runs by provider, dialogue, command, and transcript.
- Flag large input, output, or cache changes.

Why it matters:

- Helps keep the harness efficient as derived context grows.

## Promotion Criteria For Derived Data

A derived dataset should become agent-visible only when:

- records are reproducible from checked-in inputs
- each record has stable IDs
- records cite raw Greek or another deterministic record
- validator coverage exists
- output size is bounded enough for tool use
- the agent instructions explain when to use it

## Canonical Change Closure Gate

A change to canonical corpus data is complete only when:

1. Greek source spans, semantic ledgers, ontology rows, and dependent graph
   references all validate.
2. Every affected item has a terminal disposition and required review receipt.
3. Clusters, dossiers, joins, indexes, and site artifacts regenerate twice from
   a clean output state with byte-identical results.
4. The snapshot-bound audit verifier proves exact partition coverage and final
   set equality.
5. `bun run test`, `bun run typecheck`, `bun run validate`, and
   `git diff --check` all pass on the exact committed candidate.

These gates preserve the source coordinate grid while preventing a generated
view or review artifact from becoming a second source of truth.
