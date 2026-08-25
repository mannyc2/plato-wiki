# Six-Family Feature Normalization Decision

## Ratification

The operator explicitly authorized the six-family normalization decision on 2026-08-17 and
instructed the team to finish it with Luna subagents. This decision records
that authorization. The exact execution baseline is
`5f67119f252089bdd84778d5bb7a9e9497ace64c`.

This is a targeted normalization pass, not a second global sweep. It reopens
the historical label freeze only for these six seed families:

| Order | Family | Labels | Observations | Singletons | Uncovered singletons | Accepted-map overlaps |
|---:|---|---:|---:|---:|---:|---:|
| 1 | `frame_depth` | 85 | 146 | 67 | 64 | 8 |
| 2 | `myth_demarcation` | 190 | 437 | 132 | 131 | 17 |
| 3 | `forms_trajectory` | 169 | 361 | 113 | 102 | 33 |
| 4 | `prosopography` | 217 | 478 | 164 | 160 | 14 |
| 5 | `irony_marker` | 171 | 367 | 136 | 124 | 14 |
| 6 | `dramatic_case_setup` | 245 | 474 | 177 | 170 | 29 |
| **Total** |  | **1,077** | **2,263** | **789** | **751** | **115** |

These are the six largest uncovered singleton surfaces among the seed
families not covered by the July targeted pass. Every other family remains
frozen.

## Decision Boundary

- Every current label in the six families receives an explicit `keep` or
  `merge` disposition.
- A merge is accepted only for the same repeatable textual function, within
  the same family, when complete source and target membership answers one
  comparison question.
- This pass creates no labels, changes no family, keeps no alias, and sets no
  minimum merge count.
- Observation prose, textual basis, limits, source references, Greek terms,
  and review status remain unchanged. Local detail stays in those fields.
- Existing accepted June and July dispositions remain authoritative. Any
  proposed correction requires a separately recorded operator decision before
  application.
- The review may consult canonical Greek only when the ledgers are
  insufficient. English sources and translations are excluded.

The resulting hard cutover may reduce labels where the evidence supports a
shared function. A distinct or uncertain function remains a valid `keep`;
coverage of the review surface is the goal, not count reduction.

## Approved Prior-Disposition Corrections

The operator's 2026-08-17 instruction to begin execution with full approval
and finish the six-family normalization work covers the decision's three explicitly named prior-conflict
leads. Complete source and target membership review produced these exact
decisions:

```json
[
  {
    "family": "prosopography",
    "label": "named_historical_cast",
    "old_action": "merge",
    "old_to": {
      "family": "prosopography",
      "label": "figures_or_types_as_evidence"
    },
    "new_action": "keep",
    "new_to": null
  },
  {
    "family": "prosopography",
    "label": "named_historical_figure",
    "old_action": "merge",
    "old_to": {
      "family": "prosopography",
      "label": "figures_or_types_as_evidence"
    },
    "new_action": "keep",
    "new_to": null
  }
]
```

`named_historical_cast` is retained because its accepted memberships perform
cast introduction, role placement, or historical naming, not one uniform use
of a figure as argumentative evidence. The affected source records are
`obs_charmides_0011` (154c-154d), `obs_gorgias_0440` (447d-448c),
`obs_laches_0004` (179a-179b), `obs_lesser-hippias_0046` (370d-370e),
`obs_menexenus_0011` (235e-236a), `obs_menexenus_0014` (236a-236b),
`obs_menexenus_0033` (239d-239e), and `obs_parmenides_0010`
(127d-127e). The rejected `obs_euthydemus_0022` (273b-273c) remains
counterevidence and is not relabeled.

`named_historical_figure` is retained because its accepted memberships mix
simple naming, recollection, attribution, and comparison; they do not all
perform the target's evidentiary function. The affected source records are
`obs_charmides_0005` (153c-153d), `obs_charmides_0070` (163c-163d),
`obs_cratylus_0151` (413b-413c), `obs_critias_0050` (113a),
`obs_phaedrus_0059` (235c), `obs_phaedrus_0203` (261d-261e),
`obs_protagoras_0013` (311b-311c), `obs_theaetetus_0074` (151e-152a), and
`obs_theaetetus_0155` (164e-165a).

The complete 38-record target membership of
`figures_or_types_as_evidence` was also reviewed. It includes genuine
authorities, comparators, examples, cast references, and generic types, so it
cannot supply one narrow comparison question for either source set. The
separate lead `forms_trajectory/appearance_reality_distinction` remains on
its accepted target after complete source and target review; no correction is
authorized for it.

## Approved Execution Prerequisite

The first family apply exposed that the commentary dossier rewriter changed
the formatting of unrelated quoted references. Commit `8ef3e00` fixes that
generic defect and adds regression coverage proving that unchanged lines stay
byte-identical and changed lines replace only the merged key.

The accepted Lesser Hippias commentary quality audit and its dependent
screenplay were hash-bound to a dossier key changed by this normalization.
The operator approved retiring both artifacts rather than rebinding their old
audit evidence or running a new audit. Commit `c54de6b` records the retirement,
regenerates the affected coverage reports, and leaves the independent accepted
speaker-attribution plan intact.

Semantic review metrics and map provenance remain anchored to
`5f67119f252089bdd84778d5bb7a9e9497ace64c`. Immutable-field and out-of-scope
cutover comparisons use the clean post-prerequisite baseline
`c54de6b1f84afaa63d459c22a5b34a263827abc2`; it contains no observation or
commentary label cutover.
