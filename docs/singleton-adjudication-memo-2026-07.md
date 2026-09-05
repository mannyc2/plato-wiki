# Singleton Adjudication Memo, 2026-07

> Historical v1 adjudication record. Its label decisions remain provenance,
> not an active ontology or alias layer.

## Context

The label quality review produced a 320-entry stratified sample of uncovered singleton labels
under `docs/label-normalization-standards.md`. The singleton adjudication standard adjudicated that
sample without modifying observation ledgers, the feature registry, clusters,
or any `review_status` values. The purpose is to decide whether the singleton
tail is mostly legitimate function granularity, same-function merge work,
passage-summary leakage, topic-registry content, or a mixture.

## Method

The sample was adjudicated in `wiki/review/2026-07-singleton-adjudication/sample.json`.
Each entry received one of four values:

- `keep_distinct_function`
- `merge_candidate`
- `passage_summary_relabel`
- `topic_registry`

The checker command was:

```bash
bun scripts/singleton-adjudication-2026-07/check.ts
```

Per-stratum intervals below use the normal approximation
`p +/- 1.96 * sqrt(p * (1 - p) / n)`, clamped to `[0, 1]`. Weighted overall
shares use the stratified estimator `sum(weight_h * p_h)`, where
`weight_h = stratum_population / universeSize`; weighted standard errors use
`sqrt(sum(weight_h^2 * p_h * (1 - p_h) / n_h))`.

The agreement check was a same-session repeat pass, not a different model or
operator. It is recorded in
`wiki/review/2026-07-singleton-adjudication/notes.md` as a consistency check:
32/32 four-way classifications matched. This is weaker than the independent
review The singleton adjudication standard prefers.

## Findings

Weighted composition of the singleton tail:

| category | weighted share | 95% CI | sample count |
|---|---:|---:|---:|
| keep_distinct_function | 44.0% | [38.9%, 49.1%] | 142/320 |
| merge_candidate | 32.0% | [28.0%, 36.1%] | 102/320 |
| passage_summary_relabel | 0.3% | [0.0%, 0.9%] | 1/320 |
| topic_registry | 23.6% | [20.3%, 27.0%] | 75/320 |

Per-stratum composition:

| stratum | n | keep | merge | passage | topic |
|---|---:|---:|---:|---:|---:|
| craft_analogy | 28 | 10/28 35.7% [18.0%, 53.5%] | 16/28 57.1% [38.8%, 75.5%] | 0/28 0.0% [0.0%, 0.0%] | 2/28 7.1% [0.0%, 16.7%] |
| elenchus | 28 | 12/28 42.9% [24.5%, 61.2%] | 15/28 53.6% [35.1%, 72.0%] | 1/28 3.6% [0.0%, 10.4%] | 0/28 0.0% [0.0%, 0.0%] |
| turn_geometry | 28 | 11/28 39.3% [21.2%, 57.4%] | 17/28 60.7% [42.6%, 78.8%] | 0/28 0.0% [0.0%, 0.0%] | 0/28 0.0% [0.0%, 0.0%] |
| definition_ladder | 24 | 5/24 20.8% [4.6%, 37.1%] | 19/24 79.2% [62.9%, 95.4%] | 0/24 0.0% [0.0%, 0.0%] | 0/24 0.0% [0.0%, 0.0%] |
| dramatic_case_setup | 18 | 13/18 72.2% [51.5%, 92.9%] | 3/18 16.7% [0.0%, 33.9%] | 0/18 0.0% [0.0%, 0.0%] | 2/18 11.1% [0.0%, 25.6%] |
| prosopography | 17 | 9/17 52.9% [29.2%, 76.7%] | 8/17 47.1% [23.3%, 70.8%] | 0/17 0.0% [0.0%, 0.0%] | 0/17 0.0% [0.0%, 0.0%] |
| myth_demarcation | 13 | 6/13 46.2% [19.1%, 73.3%] | 7/13 53.8% [26.7%, 80.9%] | 0/13 0.0% [0.0%, 0.0%] | 0/13 0.0% [0.0%, 0.0%] |
| irony_marker | 13 | 7/13 53.8% [26.7%, 80.9%] | 6/13 46.2% [19.1%, 73.3%] | 0/13 0.0% [0.0%, 0.0%] | 0/13 0.0% [0.0%, 0.0%] |
| forms_trajectory | 12 | 6/12 50.0% [21.7%, 78.3%] | 6/12 50.0% [21.7%, 78.3%] | 0/12 0.0% [0.0%, 0.0%] | 0/12 0.0% [0.0%, 0.0%] |
| frame_depth | 12 | 8/12 66.7% [40.0%, 93.3%] | 4/12 33.3% [6.7%, 60.0%] | 0/12 0.0% [0.0%, 0.0%] | 0/12 0.0% [0.0%, 0.0%] |
| laws-only passthrough | 83 | 24/83 28.9% [19.2%, 38.7%] | 0/83 0.0% [0.0%, 0.0%] | 0/83 0.0% [0.0%, 0.0%] | 59/83 71.1% [61.3%, 80.8%] |
| other | 44 | 31/44 70.5% [57.0%, 83.9%] | 1/44 2.3% [0.0%, 6.7%] | 0/44 0.0% [0.0%, 0.0%] | 12/44 27.3% [14.1%, 40.4%] |

The tail is not one thing. The sample supports three conclusions:

- A large share is defensible singleton function granularity.
- A large but target-concentrated share is same-function merge work in seed
  families.
- Laws-only passthrough labels are mostly topic-registry content, not merge
  candidates.
- Passage-summary relabeling is negligible in this sample.

## Named Families

These merge-candidate groups reached at least three sampled sources pointing
to the same existing target.

| family | target | sampled sources | shared textual function | comparison question |
|---|---|---:|---|---|
| craft_analogy | expert_craft_analogy | 5 | Craft expertise credentials, products, or examples test competence or authority. | How does craft expertise validate, challenge, or delimit a claim to competence? |
| definition_ladder | definition_proposed | 4 | A working definition is explicitly stated for the inquiry. | How does the dialogue introduce a definition to advance or stabilize the inquiry? |
| definition_ladder | definition_tested_by_case | 3 | A proposed definition is tested against a concrete case, material example, domain shift, or temporal condition. | How does a case pressure the definition's adequacy? |
| elenchus | assent_chain | 3 | Sequential respondent assents build a premise chain toward a conclusion. | How does the argument use assent sequence to force or prepare a conclusion? |
| turn_geometry | explicit_procedure_control | 3 | A speaker explicitly controls, sets, or limits the procedure of inquiry. | How does the speaker shape what kind of exchange can proceed? |

## Options

**A. Accept the measured tail composition and keep the freeze.** Appropriate if
the operator treats the merge-candidate share as real but not worth immediate
label churn before v1.0.

**B. License a targeted pass restricted to the named families and targets.**
The pass should use a new plan and `labels plan/validate/apply --family` under
`docs/label-normalization-standards.md`.

**C. Accept the tail overall and run the targeted pass for named groups only.**
This keeps the v1.0 freeze posture while acknowledging that the sample names
several concrete same-function groups.

## Recommendation

Choose **C**. The keep-distinct plus topic-registry shares are large enough to
reject a full second normalization sweep. The named merge groups are concrete
enough to justify a later narrow plan if the operator wants to reduce obvious
same-function splits without reopening the full label layer.

The same-session repeat-pass limitation means this memo should not be treated
as a fully independent semantic audit. It is still sufficient to name the
follow-up targets because the targets are narrow and would require their own
validated merge map before any ledger rewrite.

## Decision

```text
Decision: C (accept measured tail; license named targeted follow-up only) (operator)
Date: 2026-07-04
Named families licensed (if b/c): craft_analogy; definition_ladder; elenchus; turn_geometry
Follow-up plan required: yes
```

## Reproduce

```bash
bun scripts/singleton-adjudication-2026-07/check.ts
```
