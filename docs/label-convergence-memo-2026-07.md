# Label Convergence Memo, 2026-07

> Historical v1 adjudication record. The label-keyed ontology it evaluated was
> retired by the ontology vNext hard cut and is not a peer representation.

## Context

The corpus now has 27 dialogues and the current accepted-only lens reports
7,332 accepted observations. The project already ran one global ingest and
label-normalization sequence through plans 019 and 020, and the
2026-07-02 direction note in `plans/README.md` explicitly deferred any
second normalization run until this measured freeze-vs-normalize decision.
This memo decides whether the label layer is converged enough to use as a
stable clustering substrate, whether a narrow follow-up pass is warranted,
or whether a full second global pass has evidence behind it.

## Method

The numbers below come from
`scripts/label-convergence-2026-07/stats.ts`, run as:

```bash
bun scripts/label-convergence-2026-07/stats.ts
```

Accepted-only is the primary lens because generated clusters are
accepted-only. All-record numbers are secondary and are included to match
the current `bun run harness labels audit` header.

## Gate Measurement

The design-doc gate says:

> Clusters become meaningful only after review and label reuse converge. The build plan should require: `accepted` observations > 0, cross-dialogue labels >= 10, and median observations per non-singleton label >= 2.

Measured accepted-only values:

- Accepted observations: 7,332 > 0.
- Cross-dialogue labels: 475 >= 10.
- Median observations per non-singleton label: 3 >= 2.

The formal gate passes. The third criterion is structurally weak: once
singletons are excluded, every remaining label has at least 2 observations
by definition, so the median is almost guaranteed to satisfy the gate. The
real question is whether the singleton tail represents mergeable
same-function variants or mostly legitimate topic-distinct labels.

## Distribution and Composition

```text
# Label Convergence Stats

## Accepted-only

Totals:
- labels: 3850
- observations: 7332
- singleton labels: 3074
- within-dialogue-reuse labels: 301
- cross-dialogue labels: 475

Observations per label:
- 1: 3074
- 2: 335
- 3-5: 273
- 6-10: 94
- >10: 74
- mean, all labels: 1.9
- median, all labels: 1
- mean, non-singleton labels: 5.49
- median, non-singleton labels: 3

Cross-dialogue depth:
- labels spanning >=2 dialogues: 475
- labels spanning >=3 dialogues: 226
- labels spanning >=5 dialogues: 99
- top 20:
  - turn_geometry/procedural_agreement_to_inquire — 20 dialogues, 79 observations
  - definition_ladder/definition_proposed — 19 dialogues, 58 observations
  - turn_geometry/recapitulation_or_restart — 18 dialogues, 72 observations
  - elenchus/assent_chain — 17 dialogues, 104 observations
  - irony_marker/mock_deference — 17 dialogues, 62 observations
  - turn_geometry/argument_transition_marker — 17 dialogues, 53 observations
  - irony_marker/knowledge_disavowal — 17 dialogues, 40 observations
  - definition_ladder/definiendum_marked_for_inquiry — 15 dialogues, 40 observations
  - definition_ladder/definition_revised_after_objection — 15 dialogues, 34 observations
  - elenchus/aporia_reported — 15 dialogues, 30 observations
  - elenchus/forced_alternative — 14 dialogues, 52 observations
  - prosopography/figures_or_types_as_evidence — 14 dialogues, 37 observations
  - craft_analogy/expert_craft_analogy — 14 dialogues, 34 observations
  - elenchus/scope_delimitation — 14 dialogues, 29 observations
  - definition_ladder/definition_established_by_assent_chain — 13 dialogues, 28 observations
  - craft_analogy/craft_analogy — 13 dialogues, 22 observations
  - turn_geometry/speaker_introduces_argumentative_procedure — 12 dialogues, 41 observations
  - turn_geometry/hypothetical_prompt_or_scenario — 12 dialogues, 35 observations
  - elenchus/refutation_by_counterexample — 12 dialogues, 31 observations
  - craft_analogy/humble_craft_as_methodological_paradigm — 12 dialogues, 19 observations

Family composition:
- total families: 504
- families whose labels are all singletons: 440
- singleton labels only in laws: 970/3074 (31.55%)
- seed-family labels: 2596; seed-family observations: 5943
- passthrough-family labels: 1254; passthrough-family observations: 1389
- top 20 families by singleton-label count:
  - craft_analogy: 312
  - elenchus: 279
  - turn_geometry: 263
  - definition_ladder: 236
  - dramatic_case_setup: 175
  - prosopography: 159
  - irony_marker: 137
  - myth_demarcation: 133
  - forms_trajectory: 111
  - frame_depth: 64
  - legislative_method: 39
  - constitutional_design: 36
  - closure_type: 33
  - perception_generation: 33
  - teleological_structure: 32
  - education_law: 31
  - etymology_analysis: 27
  - elemental_theory: 21
  - ethical_training: 19
  - music_law: 18

## All records

Totals:
- labels: 3892
- observations: 7470
- singleton labels: 3097
- within-dialogue-reuse labels: 306
- cross-dialogue labels: 489

Observations per label:
- 1: 3097
- 2: 345
- 3-5: 280
- 6-10: 93
- >10: 77
- mean, all labels: 1.92
- median, all labels: 1
- mean, non-singleton labels: 5.5
- median, non-singleton labels: 3

Cross-dialogue depth:
- labels spanning >=2 dialogues: 489
- labels spanning >=3 dialogues: 231
- labels spanning >=5 dialogues: 101
- top 20:
  - turn_geometry/procedural_agreement_to_inquire — 20 dialogues, 80 observations
  - definition_ladder/definition_proposed — 19 dialogues, 60 observations
  - turn_geometry/recapitulation_or_restart — 18 dialogues, 73 observations
  - elenchus/assent_chain — 17 dialogues, 104 observations
  - irony_marker/mock_deference — 17 dialogues, 64 observations
  - turn_geometry/argument_transition_marker — 17 dialogues, 55 observations
  - irony_marker/knowledge_disavowal — 17 dialogues, 42 observations
  - definition_ladder/definiendum_marked_for_inquiry — 15 dialogues, 41 observations
  - definition_ladder/definition_revised_after_objection — 15 dialogues, 41 observations
  - elenchus/aporia_reported — 15 dialogues, 30 observations
  - elenchus/forced_alternative — 14 dialogues, 53 observations
  - prosopography/figures_or_types_as_evidence — 14 dialogues, 38 observations
  - craft_analogy/expert_craft_analogy — 14 dialogues, 35 observations
  - elenchus/scope_delimitation — 14 dialogues, 30 observations
  - definition_ladder/definition_established_by_assent_chain — 13 dialogues, 28 observations
  - craft_analogy/craft_analogy — 13 dialogues, 24 observations
  - turn_geometry/speaker_introduces_argumentative_procedure — 12 dialogues, 41 observations
  - turn_geometry/hypothetical_prompt_or_scenario — 12 dialogues, 35 observations
  - elenchus/refutation_by_counterexample — 12 dialogues, 31 observations
  - craft_analogy/humble_craft_as_methodological_paradigm — 12 dialogues, 21 observations

Family composition:
- total families: 505
- families whose labels are all singletons: 441
- singleton labels only in laws: 972/3097 (31.39%)
- seed-family labels: 2635; seed-family observations: 6078
- passthrough-family labels: 1257; passthrough-family observations: 1392
- top 20 families by singleton-label count:
  - craft_analogy: 315
  - elenchus: 281
  - turn_geometry: 265
  - definition_ladder: 238
  - dramatic_case_setup: 177
  - prosopography: 164
  - irony_marker: 136
  - myth_demarcation: 132
  - forms_trajectory: 113
  - frame_depth: 67
  - legislative_method: 39
  - constitutional_design: 36
  - closure_type: 34
  - perception_generation: 33
  - teleological_structure: 32
  - education_law: 31
  - etymology_analysis: 27
  - elemental_theory: 21
  - ethical_training: 19
  - music_law: 18
```

The singleton tail is large: accepted-only labels have median reuse of 1,
and 3,074 of 3,850 labels are singletons. But the cross-dialogue layer is
not thin: 475 accepted-only labels already cross dialogues, including 99
labels spanning at least five dialogues. Laws-only singleton labels account
for 970 accepted-only singletons, about a third of the tail, consistent
with many legally topic-distinct records rather than obvious same-function
duplicates. The remaining singleton mass is concentrated in broad seed
families such as `craft_analogy`, `elenchus`, `turn_geometry`, and
`definition_ladder`; this stats pass does not itself prove that those are
same-function variants eligible for merging under the standards document.

## Options

**A. Freeze.** Declare the label layer converged; clusters usable; revisit
only on new evidence. Cost: none. Risk: some genuinely mergeable variants
stay split, slightly weakening cross-dialogue clusters.

**B. Targeted pass.** Normalize only named families where the stats show
many same-function singleton variants; scoped `labels plan` under the
standards doc. Cost: one bounded LLM/review pass plus operator review.
Risk: moderate churn in those families' feature ids.

**C. Full second global pass.** global-label-normalization-scale rerun. Cost: large: LLM
work plus full re-review provenance per AGENTS.md. Risk: churn across
7,332 stable accepted records for diminishing returns, given the standards
forbid topic merges and many Laws singletons are topics.

## Recommendation

Recommend A: freeze. The formal convergence gate passes, the reusable
cross-dialogue layer is substantial, and the stats do not identify named
families with at least about 10 demonstrably same-function singleton
variants each. A targeted B pass should require a separate semantic sample
that names those families and shows the standards document would actually
license their merges. Do not run C on this evidence.

## Decision

```text
Decision: A (freeze) (operator)
Date: 2026-07-03
Follow-up plan required: no
```

## Reproduce

```bash
bun scripts/label-convergence-2026-07/stats.ts
```
