# Six-Family Label Normalization Review — 2026-08-17

## Result

Baseline: `5f67119f252089bdd84778d5bb7a9e9497ace64c`.

The accepted review covers 1,077 labels and 2,263 observation memberships in
`frame_depth`, `myth_demarcation`, `forms_trajectory`, `prosopography`,
`irony_marker`, and `dramatic_case_setup`. It keeps 1,021 labels and merges 56
source labels into 30 existing targets. No label is created, no family changes,
and all 2,581 out-of-scope rows remain `todo`.

## Family decisions

| family | keeps | merges | changed records | changed ledgers |
|---|---:|---:|---:|---:|
| `frame_depth` | 66 | 19 | 20 | 13 |
| `myth_demarcation` | 173 | 17 | 18 | 9 |
| `forms_trajectory` | 149 | 20 | 20 | 7 |
| `prosopography` | 217 | 0 | 0 | 0 |
| `irony_marker` | 171 | 0 | 0 | 0 |
| `dramatic_case_setup` | 245 | 0 | 0 | 0 |
| **total** | **1,021** | **56** | **58** | **19 unique** |

All 58 changed records are accepted observations. The two approved corrections
retain `prosopography/named_historical_cast` and
`prosopography/named_historical_figure` instead of merging either into
`figures_or_types_as_evidence`; the complete source and target memberships are
recorded in `docs/feature-normalization-decision-2026-08.md`.

## Review method

Six primary Luna reviews read complete family memberships. Targeted Luna
repairs replaced generic rationale templates exposed by the main agent's
deterministic keep samples. The main agent reviewed every merge program,
complete target membership, all 115 accepted-map overlaps, and 111 stratified
keep labels. The prior-decision checker records 113 preserved decisions and two
exact approved corrections.

## Merge programs and affected records

- `forms_trajectory/city_soul_isomorphism_asserted` <- `city_soul_isomorphism_claim`
  Question: How does the argument assert structural correspondence between city and soul?
  Changed: `obs_republic_0793` (435c-435e).
- `forms_trajectory/form_sensible_contrast` <- `incorporeal_forms_as_true_being`
  Question: How does the text distinguish intelligible form-being from sensible particulars or bodies?
  Changed: `obs_sophist_0319` (246a-246c).
- `forms_trajectory/greatest_kinds_enumeration` <- `great_kinds_enumerated`
  Question: How does enumeration of the greatest kinds establish the ontological field of inquiry?
  Changed: `obs_sophist_0320` (255d-256a).
- `forms_trajectory/image_truth_deficiency_contrast` <- `appearance_reality_distinction`
  Question: How does the appearance/reality contrast test or reorganize the claim under examination?
  Changed: `obs_greater-hippias_0167` (298e-299b).
- `forms_trajectory/intelligible_paradigm_for_cosmos` <- `cosmos_as_image_of_paradigm`, `visible_living_thing_as_image`
  Question: How does the cosmos receive intelligible structure by relation to its paradigm?
  Changed: `obs_timaeus_0069` (29a-29b), `obs_timaeus_0132` (30d).
- `forms_trajectory/ousia_stability_contrast` <- `stable_ousia_conclusion`
  Question: How does stable ousia answer a relativist or flux alternative?
  Changed: `obs_cratylus_0021` (386d-386e).
- `forms_trajectory/participation_vocabulary_in_deduction` <- `opposite_predicates_resolved_by_distinct_participations`, `participation_distinction`, `participation_terminology_non_form_context`, `participation_vocabulary`, `participation_vocabulary_negated`, `participation_vocabulary_non_being`, `predication_by_participation`
  Question: How does participation language carry a step of the deduction or explain predication?
  Changed: `obs_parmenides_0198` (161e-162a), `obs_parmenides_0200` (162b-162c), `obs_parmenides_0237` (159d), `obs_parmenides_0245` (142c-142e), `obs_parmenides_0248` (163c-163e), `obs_sophist_0232` (256a-256b), `obs_sophist_0321` (255d-256a).
- `forms_trajectory/participation_whole_part_dilemma` <- `participation_by_part_or_whole_dilemma`
  Question: How does the whole/part dilemma pressure the account of participation?
  Changed: `obs_parmenides_0032` (131d-131e).
- `forms_trajectory/receiver_must_lack_received_forms` <- `receiver_takes_no_entering_form`
  Question: How does absence of received forms define the receiver's function?
  Changed: `obs_timaeus_0185` (50c).
- `forms_trajectory/self_subsistent_form_named` <- `self_subsistent_being_denied`
  Question: How does the argument formulate self-subsistence as a property at issue?
  Changed: `obs_theaetetus_0117` (160b-160c).
- `forms_trajectory/sensory_route_denied` <- `soul_grasps_common_terms_through_itself`, `soul_perceives_common_without_organ`
  Question: How does the argument deny a sensory route to common or intelligible objects?
  Changed: `obs_theaetetus_0256` (185c-185d), `obs_theaetetus_0263` (185e-186a).
- `forms_trajectory/threefold_form_copy_space_schema` <- `third_genus_added_to_model_copy_schema`
  Question: How does the third genus revise a two-term model/copy account?
  Changed: `obs_timaeus_0177` (48e).
- `frame_depth/embedded_dialogue_within_speech` <- `embedded_household_elenchus`
  Question: How does an embedded dialogue create another level of interlocution?
  Changed: `obs_greater-hippias_0141` (304c-304d).
- `frame_depth/embedded_literary_quotation` <- `embedded_author_quotation`, `embedded_homeric_quotation`
  Question: How does an embedded literary voice create an additional speech layer?
  Changed: `obs_charmides_0016` (155d-155e), `obs_lesser-hippias_0049` (371b-371c).
- `frame_depth/hypothetical_interlocutor_report` <- `imagined_interlocutor_speech`, `projected_interlocutor_rebuke`, `projected_interrogator`
  Question: How does an imagined interlocutor externalize an objection or examination?
  Changed: `obs_greater-hippias_0051` (290a-290b), `obs_greater-hippias_0069` (292c-292d), `obs_greater-hippias_0150` (292e).
- `frame_depth/narrator_memory_disclaimer` <- `memory_hedge`, `memory_hedge_by_age`, `narrator_memory_lapse`, `reported_speech_memory_hedge`
  Question: How does a memory disclaimer limit the fidelity of the reported discourse?
  Changed: `obs_critias_0077` (117d-117e), `obs_euthydemus_0142` (290e-291a), `obs_laches_0073` (189c-189d), `obs_phaedrus_0011` (228c-228d).
- `frame_depth/piety_constraint_on_logos` <- `inquiry_domain_restricted_by_piety`
  Question: How does a piety constraint delimit the inquiry's permissible domain?
  Changed: `obs_cratylus_0093` (400d).
- `frame_depth/play_serious_contrast_marker` <- `dialogic_method_framed_as_play`
  Question: How does play-language qualify the status of the framed inquiry?
  Changed: `obs_laws_0306` (684e-685a).
- `frame_depth/reported_narrative_marker` <- `previous_day_summary_as_frame_device`
  Question: How does reference to prior-day discourse activate the current narrative frame?
  Changed: `obs_timaeus_0014` (18e-19a).
- `frame_depth/speaker_ventriloquism` <- `socratic_prosopopoeia`
  Question: How does ventriloquized speech insert another voice into the dialogue?
  Changed: `obs_theaetetus_0162` (165e-166a).
- `frame_depth/transmission_chain_cited` <- `archival_transmission_claim`, `named_transmission_chain`, `reported_ancient_inscriptional_source`, `reported_dialogue_with_named_transmission_chain`, `reported_speech_with_transmission_hedge`
  Question: How does a transmission chain authorize and qualify access to the reported account?
  Changed: `obs_menexenus_0085` (246c-246d), `obs_menexenus_0095` (248e), `obs_parmenides_0004` (126c-127a), `obs_timaeus_0038` (23a), `obs_timaeus_0053` (25d-25e), `obs_timaeus_0357` (22c-23a).
- `myth_demarcation/cosmic_cycle_narrative` <- `age_standstill_reversal`, `cosmic_cycle_myth`
  Question: How does the myth narrate the operation of a cosmic cycle?
  Changed: `obs_statesman_0084` (270c-270d), `obs_statesman_0086` (270a-270b).
- `myth_demarcation/myth_logos_boundary` <- `doctrine_called_mythos`, `logos_mythos_contrast_in_argument`, `myth_closure_to_logos_pivot`, `myth_logos_transition`
  Question: How does the passage mark the boundary between mythic telling and logos?
  Changed: `obs_philebus_0021` (13e-14a), `obs_protagoras_0097` (324c-324d), `obs_statesman_0305` (273d-274a), `obs_theaetetus_0146` (164d-164e).
- `myth_demarcation/myth_logos_hedge` <- `mythic_report_hedge`
  Question: How does the speaker hedge a mythic report while retaining its argumentative use?
  Changed: `obs_laws_1269` (683d-684c).
- `myth_demarcation/myth_tellers_as_elder_chorus_successor` <- `myth_telling_assigned_to_non_singers`
  Question: Who is authorized to transmit the myth, and what replaces expert poetic authority?
  Changed: `obs_laws_1265` (664b-664d).
- `myth_demarcation/mythic_exemplum_in_argument` <- `agricultural_gift_exemplum_in_history`, `myth_exemplum_in_argument`, `mythic_named_precedent`, `mythic_paradigm_invoked_in_argument`
  Question: How does a mythic example function within an argument?
  Changed: `obs_gorgias_0275` (506b), `obs_laws_0297` (687d-687e), `obs_laws_0760` (782b), `obs_phaedrus_0326` (255b-255d).
- `myth_demarcation/mythic_narrative_transition` <- `reported_myth_introduction`
  Question: How does the dialogue signal entry into or exit from mythic narration?
  Changed: `obs_republic_0770` (359b-359d).
- `myth_demarcation/poetic_citation_as_argument` <- `poetic_quotation_as_evidence`, `poetic_quotation_in_argument`
  Question: How does a poetic citation function as support within an argument?
  Changed: `obs_lesser-hippias_0085` (370a-370d), `obs_phaedrus_0207` (266a-266b), `obs_philebus_0206` (47e-48a).
- `myth_demarcation/proverb_as_argument` <- `mythic_proverb_as_argument`
  Question: How does a proverb supply argumentative pressure or evidence?
  Changed: `obs_laws_0352` (641c).
- `myth_demarcation/traditional_account_cited_with_hedge` <- `traditional_account_truth_query`
  Question: How does the speaker qualify a traditional account while citing it?
  Changed: `obs_laws_1267` (676c-677b).

## Hard-cutover integrity

The fixed serial order was frame, myth, forms, prosopography, irony, then
dramatic setup. Apply changed 20 records in 13 ledgers for `frame_depth`, 18
records in nine ledgers for `myth_demarcation`, and 20 records in seven
ledgers for `forms_trajectory`; the three zero-merge families changed no
ledger. Two commentary lines changed exact dossier keys, in Menexenus and
Lesser Hippias. Unchanged quoted dossier lines remained byte-identical after
the regression fix in `8ef3e00`.

`final-integrity` passed against the clean post-prerequisite baseline
`c54de6b1f84afaa63d459c22a5b34a263827abc2` before dependent hashes were
refreshed. Observation path sets and counts are unchanged; after stripping
`feature_family`, `feature_id`, and `feature_label`, every observation ledger
is byte-identical. Commentary ledgers exactly equal the generic hard-cutover
rewrite. Raw sources, claims, relations, turns, tokens, voices, reported
turns, apparatus, and the post-retirement audio tree are byte-identical. Every
merged source key is absent and every target key remains present.

Because observation-turn joins bind the SHA-256 of the complete observation
ledger, the 19 changed ledgers made those joins stale even though no
join-relevant field changed. `bun run harness derive joins` rebound exactly
those 19 artifacts. An exact diff guard proved that only each
`ledger_sha256` header changed: every join row, turn-index binding, and other
derived artifact remains byte-identical. Completeness then returned
`CMP-DERIVED` to 27/27 current.

The separately approved prerequisite retired the stale Lesser Hippias
quality-audit manifest and its dependent screenplay without rebinding old
evidence or running a new audit. The accepted speaker-attribution plan remains
intact; current coverage reports honestly mark writing audit and screenplay as
pending.

## Final metrics and gates

All-record labels moved from 3,658 to 3,602 and singletons from 2,900 to
2,837. Accepted-only labels moved from 3,617 to 3,561 and singletons from
2,878 to 2,815. Accepted non-singleton observation share rose from 60.7% to
61.6%; accepted cross-dialogue observation share rose from 49.8% to 50.6%.
Disposition coverage is now 2,333 covered and 1,269 uncovered labels, with
1,648 covered and 1,189 uncovered singletons.

Two full regeneration passes produced 504 cluster files, 747 dossier
artifacts, and 3,498 site files with identical aggregate SHA-256
`ce94bf4f9c34abf37bc1fbac6f6564db3425e4ee82d889649d9827aeae87f5ad`.

Final gates passed:

- `bun run ci`: 936 harness tests and four CLI tests passed; typecheck,
  validation, and the temporary-directory site build also passed.
- `bun run completeness -- --target knowledge-base --allow-incomplete`:
  diagnostic exited zero. The target remains incomplete only for the existing
  `CMP-WRITING-AUDIT` product gate; every source, observation, claim,
  relation, derived-artifact, reported-turn, comparison, site, English,
  reading, and audio-truth family passes.
- `bun run release:audit -- --target knowledge-base --allow-incomplete`:
  diagnostic exited zero. Its expected release blockers remain `PUB-TARGET`,
  `PUB-PROVENANCE`, `PUB-TREE`, and `PUB-LICENSE`; CI and exposed audio truth
  pass.
- `git diff --check`: passed with no output.

These incomplete product gates predate and remain outside this normalization;
none was bypassed or represented as complete.
