# Greater Hippias needs_split scratch review

Scope: all records currently marked `needs_split` in
`wiki/observations/greater-hippias.md`.

Method: inspected the current ledger blocks and resolved source spans from
`raw/plato/greek/greater-hippias.txt` using the local `resolveSourceSpan()`
helper in `packages/harness/src/source.ts`. No translations, Pioneer,
provider-backed harness/model runs, `review-segmented`, `review-queue`, or
canonical edits were used. Greek is cited only as short terms.

All current `source_ref` hashes for the reviewed records match the deterministic
resolver. Defects below are record-scope, duplication, label, or marker-boundary
defects, not stale offsets.

Summary:

- `accept_narrowed`: `obs_greater-hippias_0010`,
  `obs_greater-hippias_0064`, `obs_greater-hippias_0083`,
  `obs_greater-hippias_0097`, `obs_greater-hippias_0126`,
  `obs_greater-hippias_0130`
- `split`: `obs_greater-hippias_0045`, `obs_greater-hippias_0100`
- `reject`: `obs_greater-hippias_0075`
- `blocked_source_ref`: none

## obs_greater-hippias_0010

- Current: `282c-282d`;
  `prosopography/sophist_named_with_earnings`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `282c`
  (`start=2391`, `end=2788`,
  `sha=aba7135b1e06370f9007ed601709165dbbe49f954f97eb6fbba35fdeca6ca3ad`).
- Suggested family/label: keep
  `prosopography/sophist_named_with_earnings`; if normalizing labels later,
  consider whether it should merge with a public-sophist appearance label rather
  than the craft-earnings label.
- Rationale: `282c` supports a narrow Prodicus record: Socrates names Prodicus
  and associates him with public arrival from Ceos, council speech, private
  displays, association with young men, and remarkable money. The `282d`
  material about Gorgias/Prodicus/Protagoras earning more than craftsmen is
  already covered by accepted `obs_greater-hippias_0011`, and the ancient-wise
  foil is already covered by accepted `obs_greater-hippias_0012`.
- Suggested `greek_terms`: [`Πρόδικος`, `δημοσίᾳ`, `ἐκ Κέω`,
  `ἐν τῇ βουλῇ`, `ἐπιδείξεις`, `χρήματα`].

## obs_greater-hippias_0045

- Current: `288a-288b`; `definition_ladder/definition_by_example`.
- Recommendation: `split`.
- Suggested retained split source span: `288b-288c`
  (`start=14543`, `end=15416`,
  `sha=69ac0aa9928d6159d6b3f6b476e774d1185d6857ce6ae9e7b061926f332c862c`).
- Suggested retained split family/label:
  `definition_ladder/definition_tested_by_case`.
- Suggested retained split rationale: `288b-288c` supports the projected
  questioner testing the maiden answer with further beautiful-item cases,
  especially mare and lyre. This is not another definition-by-example record;
  it is the testing sequence that follows Hippias' example-answer.
- Suggested retained split `greek_terms`: [`θήλεια ἵππος`, `χρησμῷ`,
  `λύρα`, `καλή`].
- Duplicate/reject piece: the `288a` maiden-answer replay is not worth a new
  retained record unless the main repair wants a second-level replay of an
  already accepted observation. Accepted `obs_greater-hippias_0040` already
  records the maiden example, accepted `obs_greater-hippias_0046` records the
  reported-dialogue frame, and rejected `obs_greater-hippias_0047` already
  marks the overclaimed form-request version.

## obs_greater-hippias_0064

- Current: `291d-291e`; `definition_ladder/candidate_label_here`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `291d-291e`
  (`start=22019`, `end=22936`,
  `sha=6ec30a90f1460a74e50bc6cfe3bc789c19eb6531547df0c7b4c7b96503598bb7`).
- Suggested family/label: change to
  `definition_ladder/definition_proposed`.
- Rationale: the source supports one retained definition-ladder record: Hippias
  proposes the finest life for a man as a sequence of outward goods, honor,
  old age, burial of parents, and burial by descendants. The procedural
  challenge before the proposal is already accepted in
  `obs_greater-hippias_0066`, and Socrates' mock praise after it is already
  accepted in `obs_greater-hippias_0065`.
- Suggested `greek_terms`: [`κάλλιστον`, `ἀεὶ`, `παντὶ`, `πανταχοῦ`,
  `πλουτοῦντι`, `ὑγιαίνοντι`, `τιμωμένῳ`, `ταφῆναι`].

## obs_greater-hippias_0075

- Current: `294a-294b`;
  `definition_ladder/definition_revised_after_objection`.
- Recommendation: `reject`.
- Exact current source span: `294a-294b`
  (`start=27507`, `end=28364`,
  `sha=f5eecb174a7702d491af3d05cae90b2237e7c74a9aebf9ad3278793c2b643343`).
- Rationale: the current record is not a clean definition revision. Its
  dilemma and appearance/deception refutation are already accepted as
  `obs_greater-hippias_0077` under `elenchus/socratic_dilemma`, while the
  largeness/beauty causal analogy is already accepted as
  `obs_greater-hippias_0076`. The later rejection of the fitting candidate is
  also covered by accepted `obs_greater-hippias_0081`.
- Suggested `greek_terms` if a maintainer keeps any prose: [`τὸ πρέπον`,
  `φαίνεσθαι`, `εἶναι`, `ἀπάτη`, `τῷ ὑπερέχοντι`].

## obs_greater-hippias_0083

- Current: `294e-295a`;
  `irony_marker/socratic_personification_of_inquiry`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `295a-295b`
  (`start=29755`, `end=30581`,
  `sha=afcf3eb8d8463c8ca7cf6f0b1de4857eecf99e988ab6c3ebbc48fc3a566bd793`).
- Suggested family/label: keep
  `irony_marker/socratic_personification_of_inquiry`.
- Rationale: the personification is at `295a` and completes at `295b`; the
  current span starts too early with the fitting-candidate rejection and cuts
  off before the key escape/run-away verb. Revise the prose to record Socrates'
  warning against boasting and his personification of the object of inquiry as
  liable to become angry and escape, not as "causing more trouble." Hippias'
  self-promotion in the same area is already accepted as
  `obs_greater-hippias_0082`.
- Suggested `greek_terms`: [`μὴ μέγα`, `ὅσα πράγματα`, `ὀργισθέν`,
  `ἀποδρᾷ`].

## obs_greater-hippias_0097

- Current: `298a-298b`;
  `prosopography/socrates_refers_to_self_in_third_person`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `298b-298c`
  (`start=36655`, `end=37451`,
  `sha=ba60be3aefb34123d172887be4438ba04ead03d12c6cfd89bad34cc5dc3d43bb`).
- Suggested family/label: keep
  `prosopography/socrates_refers_to_self_in_third_person`.
- Rationale: the current span starts with definition material already accepted
  in `obs_greater-hippias_0095` and `obs_greater-hippias_0096`, then cuts off
  before the third-person self-reference completes. The retained record should
  focus on Socrates naming "the son of Sophroniscus" as the self before whom he
  would be ashamed to make unexamined claims. The oath should be treated as
  local texture, not a second observation.
- Suggested `greek_terms`: [`τὸν Σωφρονίσκου`, `ἀνερεύνητα`,
  `ὡς εἰδότα`, `ἃ μὴ οἶδα`].

## obs_greater-hippias_0100

- Current: `296c-296d`;
  `definition_ladder/definition_abandoned_and_qualified`.
- Recommendation: `split`.
- Suggested split A source span: `296c-296d`
  (`start=32720`, `end=33534`,
  `sha=6252c272d8aaf529354e732171fca19e38cb241139a30aa72170e9638988bde2`).
- Suggested split A family/label:
  `definition_ladder/definition_rejected_by_bad_use`.
- Suggested split A rationale: `296c-296d` supports the rejection of the simple
  "powerful and useful" candidate because power/usefulness can be directed
  toward bad action. This is the abandonment half of the current combined
  record.
- Suggested split A `greek_terms`: [`κακά`, `ἀγαθά`, `δύναμιν`,
  `χρήσιμα`, `πολλοῦ δεῖ`].
- Suggested split B source span: `296d-296e`
  (`start=33102`, `end=33993`,
  `sha=5ee6dc09e2274d7f1ab11c72e6fa1471c8e0e440549a76a7401440d52d00134d`).
- Suggested split B family/label:
  `definition_ladder/definition_revised_after_objection`.
- Suggested split B rationale: `296d-296e` supports the qualified replacement:
  the relevant useful/powerful thing is directed toward good, which immediately
  transitions into the beneficial candidate. Accepted
  `obs_greater-hippias_0098` covers the resulting beneficial definition at
  `296e-297a`; this split should stay on the revision step, not repeat the
  whole beneficial-cause chain.
- Suggested split B `greek_terms`: [`οἴχεται`, `ἁπλῶς`, `ἀγαθά`,
  `χρήσιμον`, `ὠφέλιμον`].
- Duplicate/reject note: rejected `obs_greater-hippias_0101` already isolates
  the involuntary-error premise as an overclaim; do not revive that as a split.

## obs_greater-hippias_0126

- Current: `304a-304b`;
  `turn_geometry/socratic_procedure_explained`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `304a`
  (`start=49528`, `end=49977`,
  `sha=487967653fa77533c18dceb05a07ddaa58c6b340e9cbf2c9c60a32d7c81f51ba`).
- Suggested family/label: change to
  `turn_geometry/respondent_criticizes_short_question_method`.
- Rationale: the salvageable record is Hippias' pejorative characterization of
  Socrates' piecemeal method as scraps/clippings divided small. The public
  speech, institutional venues, prizes, and salvation contrast is already
  accepted as `obs_greater-hippias_0127`, and Socrates' response is already
  accepted as `obs_greater-hippias_0128`.
- Suggested `greek_terms`: [`κνήσματα`, `περιτμήματα`, `κατὰ βραχύ`].

## obs_greater-hippias_0130

- Current: `303a-303b`; `elenchus/forced_alternative`.
- Recommendation: `accept_narrowed`.
- Suggested exact source span: `303a-303c`
  (`start=47094`, `end=48415`,
  `sha=475e1339ec4d6464cd56ff4989a3e5e11081159783bdba7944582beff5a6d2ce`).
- Suggested family/label: keep `elenchus/forced_alternative`.
- Rationale: the forced alternative begins at `303a`, is explicitly posed at
  `303b`, and completes at `303c` when the mathematical examples finish and
  Hippias chooses the distributive pattern. The current `303a-303b` span cuts
  off mid-example before the choice. Accepted `obs_greater-hippias_0131`
  already records the mathematical hypotheticals as turn-geometry test
  scenarios, so this repaired record should stay on the elenctic alternative
  and Hippias' answer.
- Suggested `greek_terms`: [`ἑκάτερον`, `ἀμφότερον`, `ποτέρων`,
  `τὸ καλόν`, `ἄρτια`, `περιττά`, `ἀρρήτων`, `ῥητά`].
