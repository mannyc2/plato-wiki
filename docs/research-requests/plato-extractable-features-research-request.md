# Historical Research Request: Extractable Literary Features In Plato

> Archived pre-vNext research input. Its sample feature fields and requested
> output shape are preserved as provenance, not as a live schema or extraction
> instruction. Current source records and comparison ontology are governed by
> `SPEC.md`, `docs/plato-wiki-extraction-protocol.md`, and
> `docs/ontology-vnext.md`.

You are a literary research agent with strong knowledge of Plato, Greek
literature, dialogue form, philology, narratology, rhetoric, and ancient
philosophical writing. Recommend what structured textual features can be
extracted from Plato's writings in a way that is checkable from the text.

This request is self-contained. Do not assume prior chat context.

## Project Goal

We are building an LLM-maintained Plato observation wiki.

The wiki should not ask an LLM to produce hidden-doctrine claims, authorial
intention claims, or school-specific readings. The wiki should accumulate structured,
checkable textual records from Plato's writings. If larger interpretive patterns
exist, they should become visible from those records later.

The desired extraction layer is closer to a ledger of textual facts than a set
of interpretations.

## Source Assumptions

- The source corpus is Plato's writings.
- Greek text is preferred for anchoring features.
- Records should cite Stephanus spans.
- Important Greek terms may be recorded, but long quotations should not be
  copied into records.
- Translation can help a human understand the passage, but extracted features
  should remain anchored to the Greek and the Stephanus location.

## Current Record Shape

Each observation is intended to be a local, checkable claim about a bounded
passage:

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
feature_id: feature_candidate_001
feature_label: candidate_label_here
observation: ""
textual_basis: ""
limits: ""
review_status: unreviewed
```

The important fields for your research are:

- `stephanus_span`: where the feature occurs.
- `greek_terms`: short Greek terms that matter to the feature.
- `feature_label`: a mechanical label for the kind of textual phenomenon.
- `observation`: one checkable claim about the cited span.
- `textual_basis`: why the claim follows from the cited span.
- `limits`: what the observation does not prove.

## What We Need From You

Produce a research memo on extractable feature types in Plato. Focus on features
that can be identified repeatedly across dialogues without turning into broad
interpretive readings.

Please answer these questions.

## 1. Feature Families

What feature families should an extraction system look for in Plato?

Consider categories such as:

- question and answer patterns
- definition requests and definition failures
- revisions after objection
- aporia and unresolved endings
- explicit methodological statements
- analogy, image, myth, and example
- legal, religious, civic, erotic, mathematical, or craft vocabulary
- oath, prayer, prophecy, divine sign, daimonion, dream, oracle, or ritual
  references
- speaker entrance, exit, interruption, refusal, evasion, silence, or change of
  role
- changes in who controls the conversation
- reported speech, embedded narrative, mythic narrative, or frame narrative
- contradictions, reversals, circular returns, or repeated formulations
- part-whole, cause-effect, genus-species, same-different, one-many, or
  appearance-being distinctions
- named figures, authorities, poets, sophists, politicians, craftsmen, gods, and
  heroes
- shifts between playful, serious, ironic, coercive, pedagogical, and adversarial
  tones, when textually checkable
- formal placement features such as opening setting, midpoint turn, closing
  gesture, delayed answer, or return to an earlier term

Add better categories where this list is weak.

## 2. Observable Versus Interpretive

For each feature family, distinguish:

- what can be extracted as a checkable observation
- what should be left for later interpretation
- common failure modes where an extractor will overclaim

Example:

- Checkable: Socrates asks for the single `eidos` by which all pious things are
  pious at `Euthyphro 5d-6e`.
- Not extraction-layer: Plato secretly signals that piety is impossible.

## 3. Greek Anchors

Which Greek terms, formulae, particles, or constructions are especially useful
as anchors for extractable features?

Please include examples where relevant, such as:

- terms for form, being, likeness, difference, cause, part, whole, knowledge,
  opinion, craft, justice, piety, nobility, shame, fear, eros, law, city, soul,
  god, and measure
- recurring Socratic verbs or phrases for asking, examining, agreeing,
  refuting, knowing, seeming, wondering, and being at a loss
- particles or discourse markers that signal correction, contrast, concession,
  return, or transition

Do not provide long Greek quotations. Short terms or formulae are enough.

## 4. Local And Cross-Dialogue Features

Which features are best extracted locally from one span, and which features
require cross-span or cross-dialogue tracking?

For cross-dialogue features, propose a conservative way to record them without
letting the extractor synthesize interpretations too early.

Example distinction:

- Local: a speaker revises a definition after a stated objection.
- Cross-dialogue: similar definition-revision sequences appear in multiple
  dialogues.

## 5. Candidate Schema

Propose a compact schema for feature candidates.

Current rough shape:

```yaml
feature_id: feature_candidate_001
proposed_name: definition_revised_after_objection
status: candidate
observations:
  - obs_euthyphro_0009
notes: ""
```

Should feature candidates also track:

- feature family
- required textual signals
- optional textual signals
- negative examples
- reliability level
- local versus cross-dialogue scope
- Greek anchor terms
- review notes

Recommend the minimum useful schema. Avoid a giant unstable schema.

## 6. Extraction Method

Recommend an extraction method that helps a model produce records rather than
readings.

Questions:

- Should extraction begin with a fixed list of feature families, or should it
  allow the corpus to grow the feature list?
- Should feature families be supplied as "features so far" to each run?
- How many observations per dialogue is a reasonable first pass?
- Should the agent process by Stephanus segment, dramatic scene, argument unit,
  speaker turn, or another unit?
- What should be reviewed by a second pass?

## 7. Evaluation

How should we evaluate whether extracted features are useful?

Please propose checks such as:

- citation accuracy
- whether the observation is local to the cited span
- whether Greek anchors are relevant
- whether the feature label is too broad or too narrow
- whether multiple observations are duplicates
- whether the extraction misses obvious formal features
- whether the feature would help later comparison across dialogues

## 8. Anti-Goals

Please explicitly identify feature types that should not be extracted at this
stage because they are too interpretive, too speculative, or too dependent on a
secondary tradition.

Examples may include:

- claims about hidden doctrine
- claims that a passage is intentionally esoteric
- claims about Plato's psychological motive
- claims about what an external interpreter would infer
- synthesis across distant passages without an explicit recorded relation

## Desired Output

Please produce:

1. A prioritized taxonomy of extractable feature families.
2. For each family, 2-5 concrete examples from Plato with Stephanus references.
3. A list of Greek anchors useful for extraction.
4. A minimal candidate-feature schema.
5. A recommended extraction workflow.
6. A review checklist for feature quality.
7. A list of anti-goals and common overclaim patterns.

The output should be practical enough to update an LLM extraction protocol.
