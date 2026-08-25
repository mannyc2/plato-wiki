# Singleton Adjudication Notes, 2026-07-03

## Method

- Standard: `docs/label-normalization-standards.md`.
- Sample: `wiki/review/2026-07-singleton-adjudication/sample.json`.
- Checker: `bun scripts/singleton-adjudication-2026-07/check.ts`.
- Primary pass: Codex session, 2026-07-03, in file-order batches of 20.
- Decision surface: sampled label, observation record, and same-family label inventory from `wiki/label-audit.md`.
- Scope statement: no observation ledger, feature registry, cluster file, ingest log, or `review_status` value was modified.

The pass followed the standards bias: when a sampled singleton could plausibly
share a topic with an existing label but the same repeatable textual function
was not clear, it was marked `keep_distinct_function`. Laws-only statute,
office, penalty, and doctrine labels were marked `topic_registry` unless the
label named an explicit textual operation such as a thought experiment, legal
prelude, legislative-method move, grouping operation, or diagnostic sequence.

## Batch Log

| Batch | Entries | Operator/model | Verification |
|---:|---:|---|---|
| 1 | 1-20 | Codex primary pass | checker: 300 unfilled, 0 problems |
| 2 | 21-40 | Codex primary pass | checker: 280 unfilled, 0 problems |
| 3 | 41-60 | Codex primary pass | checker: 260 unfilled, 0 problems |
| 4 | 61-80 | Codex primary pass | checker: 240 unfilled, 0 problems |
| 5 | 81-100 | Codex primary pass | checker: 220 unfilled, 0 problems |
| 6 | 101-120 | Codex primary pass | checker: 200 unfilled, 0 problems |
| 7 | 121-140 | Codex primary pass | checker: 180 unfilled, 0 problems |
| 8 | 141-160 | Codex primary pass | checker: 160 unfilled, 0 problems |
| 9 | 161-180 | Codex primary pass | checker: 140 unfilled, 0 problems |
| 10 | 181-200 | Codex primary pass | checker: 120 unfilled, 0 problems |
| 11 | 201-220 | Codex primary pass | checker: 100 unfilled, 0 problems |
| 12 | 221-240 | Codex primary pass | checker: 80 unfilled, 0 problems |
| 13 | 241-260 | Codex primary pass | checker: 60 unfilled, 0 problems |
| 14 | 261-280 | Codex primary pass | checker: 40 unfilled, 0 problems |
| 15 | 281-300 | Codex primary pass | checker: 20 unfilled, 0 problems |
| 16 | 301-320 | Codex primary pass | checker: 0 unfilled, 0 problems |

## Repeat-Pass Check

The singleton adjudication standard asks for an independent second pass by a different model or the
operator. No external reviewer or subagent was used in this session, so this
is a same-session repeat pass rather than a fully independent agreement check.
Use it as a consistency check, not as strong independent validation.

Subset rule: sort entries by `family::label`, take every 10th entry starting
at index 0. Subset size: 32.

Agreement on the four-way classification: 32/32 = 100%.

| # | observation_id | label | first pass | repeat pass | match |
|---:|---|---|---|---|---|
| 1 | obs_laws_1166 | advocacy_corruption_prelude/advocacy_craft_is_condemned_when_it_makes_victory_indifferent_to_justice | topic_registry | topic_registry | yes |
| 2 | obs_laws_0924 | civic_education/athlete_abstinence_precedent_cited_for_sexual_restraint | topic_registry | topic_registry | yes |
| 3 | obs_laws_1046 | cosmological_account/soulless_elements_without_mind_god_art | topic_registry | topic_registry | yes |
| 4 | obs_republic_0751 | craft_analogy/divine_rewards_for_justice | topic_registry | topic_registry | yes |
| 5 | obs_gorgias_0331 | craft_analogy/navigation_craft_as_rhetoric_comparison | merge_candidate | merge_candidate | yes |
| 6 | obs_cratylus_0003 | definition_ladder/definiendum_announced_without_definition | merge_candidate | merge_candidate | yes |
| 7 | obs_cratylus_0132 | definition_ladder/etymology_from_compound | merge_candidate | merge_candidate | yes |
| 8 | obs_greater-hippias_0151 | definition_ladder/temporal_universality_test | merge_candidate | merge_candidate | yes |
| 9 | obs_theaetetus_0197 | dramatic_case_setup/forensic_vs_abstract_inquiry_contrast | keep_distinct_function | keep_distinct_function | yes |
| 10 | obs_phaedrus_0191 | dramatic_case_setup/reported_public_criticism | keep_distinct_function | keep_distinct_function | yes |
| 11 | obs_laws_0790 | education_law/infant_distress_reduction_rejects_pleasure_maximization | topic_registry | topic_registry | yes |
| 12 | obs_euthydemus_0139 | elenchus/benefit_regress_argument | keep_distinct_function | keep_distinct_function | yes |
| 13 | obs_protagoras_0140 | elenchus/principle_stated_then_applied_to_refute | merge_candidate | merge_candidate | yes |
| 14 | obs_lesser-hippias_0078 | elenchus/short_assent_sequence | merge_candidate | merge_candidate | yes |
| 15 | obs_cratylus_0058 | etymology_analysis/natural_kind_name_principle | keep_distinct_function | keep_distinct_function | yes |
| 16 | obs_parmenides_0045 | forms_trajectory/participation_as_likeness_homonymy_pair | keep_distinct_function | keep_distinct_function | yes |
| 17 | obs_critias_0090 | frame_depth/incredibility_hedge | keep_distinct_function | keep_distinct_function | yes |
| 18 | obs_laws_0807 | gymnastics_law/contests_limited_to_practices_useful_for_war_peace_and_household | topic_registry | topic_registry | yes |
| 19 | obs_parmenides_0225 | instant_of_change/between_state_predicate_cancellation | keep_distinct_function | keep_distinct_function | yes |
| 20 | obs_euthydemus_0232 | irony_marker/reported_self_description_subverted | keep_distinct_function | keep_distinct_function | yes |
| 21 | obs_laws_0592 | lawgiving_method/constitution_preceded_by_herd_purification_model | keep_distinct_function | keep_distinct_function | yes |
| 22 | obs_laws_1110 | market_oath_law/market_selling_bars_two_prices_praise_and_oaths | topic_registry | topic_registry | yes |
| 23 | obs_charmides_0028 | medical_caution/treatment_separation_named_as_error | keep_distinct_function | keep_distinct_function | yes |
| 24 | obs_laws_0236 | myth_demarcation/divine_gift_hedge | merge_candidate | merge_candidate | yes |
| 25 | obs_cratylus_0295 | name_image_theory/imperfect_components_allowed_if_type_present | keep_distinct_function | keep_distinct_function | yes |
| 26 | obs_laws_0441 | political_regime_diagnosis/lawless_freedom_decline_sequence | keep_distinct_function | keep_distinct_function | yes |
| 27 | obs_timaeus_0099 | prosopography/few_many_audience_distinction | keep_distinct_function | keep_distinct_function | yes |
| 28 | obs_laws_0394 | prosopography/victory_defeat_group_profile | merge_candidate | merge_candidate | yes |
| 29 | obs_parmenides_0142 | spatial_reasoning/touch_requires_adjacency | keep_distinct_function | keep_distinct_function | yes |
| 30 | obs_laws_0060 | turn_geometry/dialogue_civility_norm | keep_distinct_function | keep_distinct_function | yes |
| 31 | obs_theaetetus_0277 | turn_geometry/procedure_control_by_respondent | merge_candidate | merge_candidate | yes |
| 32 | obs_gorgias_0139 | turn_geometry/sole_respondent_designation | merge_candidate | merge_candidate | yes |
