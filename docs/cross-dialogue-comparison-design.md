# Cross-Dialogue Comparison Design

## Cluster Keys

The primary cluster key is `feature_family + feature_label`. That pair is deterministic, already assigned in every observation, and is the field the label reuse contract pressures the model to reuse as a recurring textual type. Secondary display keys are dialogue slug, Stephanus span, review status, and short `greek_terms`; these refine browsing but do not decide membership. Speaker and structural role are deferred until speaker-turn and anchor indexes exist.

## Accepted-Only Filter

User-facing clusters include only observations with `review_status: accepted`.
Current ledgers for Apology, Crito, Euthyphro, Ion, and Meno have been reviewed,
so accepted-only output is available. A preview mode may still include
`unreviewed` records for newly ingested ledgers, but it must be labeled
`PRE-CONVERGENCE PREVIEW` until review has driven those records out of
`unreviewed`.

## Output Shape

The build should emit one file per family under `wiki/clusters/<family>.md`. Each file contains descriptive cluster records only:

```yaml
cluster_id: cluster_elenchus_assent_chain
feature_family: elenchus
feature_label: assent_chain
observation_ids: [obs_crito_0001, obs_meno_0001]
dialogues: [crito, meno]
spans:
  obs_crito_0001: 48a-48c
  obs_meno_0001: 70a-70b
```

No synthesis prose belongs in cluster output. Human-facing pages can render the records, but the artifact itself should remain a reproducible index.

## Determinism And Auditability

Cluster generation is a pure read over observation ledgers. It performs no model call and cites observation ids rather than interpreting them. Sorting is stable by family, label, and observation id. Regenerating clusters after unchanged ledgers must produce byte-identical output.

## Missing-Features Report

The missing-obvious-features report should compare anchor-rich spans against observation coverage. It is blocked on the anchor occurrence index from the backlog. Until anchors exist, the build plan should include only the cluster builder and leave missing-feature reporting as a later phase.

## Convergence Gate

Clusters become meaningful only after review and label reuse converge. The build plan should require: `accepted` observations > 0, cross-dialogue labels >= 10, and median observations per non-singleton label >= 2. Until then, only preview output is allowed and must be labeled pre-convergence.

## Prototype Findings

The prototype originally produced zero accepted-only clusters before review was
exercised. Current runs have accepted observations, but the output remains
singleton-heavy until the global label-normalization pass reduces passage-
specific labels. `bun run harness clusters --include-unreviewed` is still only a
preview mode for newly ingested, not-yet-reviewed ledgers.
