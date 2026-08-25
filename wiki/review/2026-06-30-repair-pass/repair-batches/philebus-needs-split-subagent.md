# Philebus needs_split scratch repair review

Scope: advisory review of 21 current `needs_split` records in
`wiki/observations/philebus.md`.

Method: inspected current Philebus ledger records, same-span accepted/rejected
neighbors, existing cluster labels, and Greek source spans from
`raw/plato/greek/philebus.txt` using `resolveSourceSpan("philebus", span)` from
`packages/harness/src/source.ts`. No translation files, Pioneer,
provider-backed review queues, external model/provider runs, non-dry-run
`review-segmented`, or `review-queue` were used. Greek passages are not copied
below; only short `greek_terms` are cited.

Summary: `accept_narrowed=17`, `split_into_records=2`, `reject=2`,
`leave_blocked_source_ref=0`.

## obs_philebus_0011

- Recommendation: `accept_narrowed`.
- Exact source ref: `12e`; `start=3069`; `end=3442`;
  `sha=e698d04f47979e2d53965e12df4b810c1f7ba4ba797a9558b964b554e81fb203`.
- Feature decision: keep `elenchus/genus_parts_analogy_refutation`.
- Suggested `greek_terms`: [`χρῶμα`, `μέλαν`, `λευκόν`, `σχῆμα`,
  `γένει`, `μέρη`].
- Replacement guidance: narrow to Socrates' color/shape counterexample against
  Protarchus' claim that generic sameness makes pleasure simply like pleasure.
  The record should say that one genus can contain opposed parts.
- Limits guidance: do not repeat `obs_philebus_0010`'s opposed-character
  pleasure setup or `obs_philebus_0012`'s vocative/tonal marker. Do not claim
  the analogy proves a full taxonomy of pleasure.

## obs_philebus_0039

- Recommendation: `accept_narrowed`.
- Exact source ref: `16e-17a`; `start=11239`; `end=11915`;
  `sha=7bd0231eced1b62fe2cf717623a917ed5d64c42f36760d98e022cb16f33bddff`.
- Feature decision: change from
  `turn_geometry/methodological_program_declaration` to
  `forms_trajectory/eristic_dialectic_contrast_via_eide`.
- Suggested `greek_terms`: [`οἱ δὲ νῦν τῶν ἀνθρώπων`, `τὰ δὲ μέσα`,
  `διαλεκτικῶς`, `ἐριστικῶς`].
- Replacement guidance: source-correct the record because `16d-16e` cuts off
  the contrast. Keep only the completed claim that current inquirers jump from
  one to unlimited and miss the intermediates, which marks the dialectic/eristic
  contrast.
- Limits guidance: do not duplicate `obs_philebus_0037`'s divine method record
  or `obs_philebus_0038`'s divine-source frame. Do not infer a sociological
  claim about contemporary thinkers beyond the local procedural contrast.

## obs_philebus_0042

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `17e-18a`; `start=13126`;
  `end=13921`;
  `sha=62179f508ab40192902d0adcfb1499acf0a57047b988e9f0a7f41430bd8bf5c9`.
- Feature decision: do not keep
  `definition_ladder/definitional_method_demonstrated`.
- Suggested `greek_terms`: [`σοφός`, `ἔμφρων`, `ἐλλόγιμον`,
  `ἐνάριθμον`, `ἀριθμόν`].
- Replacement guidance: reject this target as a duplicate/misalabeled composite.
  The cognitive criterion is already accepted in `obs_philebus_0043`, and the
  methodological/procedural continuation should be handled under
  `obs_philebus_0044`.
- Limits guidance: do not create a definition-demonstration record from this
  span; no specific definiendum is defined here.

## obs_philebus_0044

- Recommendation: `split_into_records`.
- Exact source refs:
  - `18a`; `start=13498`; `end=13921`;
    `sha=f2d96d232de9d19116a31ea9bbaaaac2e2a63538731bb9f00a9e9e93884f8cba`.
  - `18a-18b`; `start=13498`; `end=14348`;
    `sha=f427aa6b9d6460f71816f3669c4d0eed7d51b9424e50f06c4a86146dd53b6f25`.
- Feature decision: split into
  `turn_geometry/question_deferred_for_later_examination` for the Philebus
  interruption/deferral, and `turn_geometry/methodological_program_declaration`
  for the symmetrical one/unlimited method statement.
- Suggested `greek_terms`: [`τί δή ποτε`, `τί ποτε βουλόμενος`,
  `δράσω ταῦτα`, `ἀριθμόν`, `τὸ ἐναντίον`, `τὸ ἄπειρον`].
- Replacement guidance: record 1 should isolate Philebus' request for the point
  of the account and Socrates' promise to answer after a little more. Record 2
  should isolate the rule that inquiry should move through number rather than
  immediately from one to unlimited or from unlimited to one.
- Limits guidance: do not include `17e`'s cognitive criterion already accepted
  in `obs_philebus_0043`. In the `18a-18b` record, do not let the Theuth/letters
  example become the observation; it begins in the source span but is covered by
  later accepted records.

## obs_philebus_0084

- Recommendation: `accept_narrowed`.
- Exact source ref: `24a`; `start=25313`; `end=25751`;
  `sha=cfdcf12ba55df817ba6a88b13993f73c5b9a56b2329e34e4c1229c5f7f76fe05`.
- Feature decision: keep
  `definition_ladder/criterion_for_evaluative_classification`.
- Suggested `greek_terms`: [`ἄπειρον`, `πέρας ἔχον`, `θερμοτέρου`,
  `ψυχροτέρου`, `μᾶλλον`, `ἧττον`].
- Replacement guidance: narrow to the first criterion for identifying the
  unlimited: the hotter/colder cases are tested by the presence of more and
  less.
- Limits guidance: do not repeat `obs_philebus_0083`'s marking of the unlimited
  and limit as the two kinds under inquiry. Do not claim the criterion is
  exhaustive.

## obs_philebus_0088

- Recommendation: `accept_narrowed`.
- Exact source ref: `24d-24e`; `start=26571`; `end=27425`;
  `sha=6063b2c2259299f32139823b180b69cd1b70e984eec19104bad1601dfd29bdd9`.
- Feature decision: keep
  `definition_ladder/criterion_for_evaluative_classification`.
- Suggested `greek_terms`: [`μᾶλλον`, `ἧττον`, `σφόδρα`, `ἠρέμα`,
  `τὸ ποσόν`, `σημεῖον`].
- Replacement guidance: keep the sign/criterion record: what admits more/less
  and intensity/mildness belongs to the unlimited, while quantity halts that
  progression.
- Limits guidance: do not include Protarchus' difficulty marker
  (`obs_philebus_0089`) or Socrates' scope-shortening move
  (`obs_philebus_0090`).

## obs_philebus_0115

- Recommendation: `accept_narrowed`.
- Exact source ref: `30b-30c`; `start=37958`; `end=38778`;
  `sha=8a6133e5090a042e5f5f06ccf499d665a61b09b46762f4c236f7c41ec5c54318`.
- Feature decision: keep `ontological_schema/schema_recapitulation`.
- Suggested `greek_terms`: [`τέταρτον`, `ἄπειρον`, `πέρας`, `αἰτία`,
  `σοφία`, `νοῦς`].
- Replacement guidance: narrow the prose to Socrates' recall of the cause as
  the fourth kind operating with unlimited and limit in the cosmos. State that
  wisdom/intellect names the ordering cause.
- Limits guidance: do not present this span as a clean four-item enumeration;
  the mixed kind is not restated here. Do not duplicate `obs_philebus_0116`'s
  craft/ordering verbs or `obs_philebus_0117`'s short-assent pattern.

## obs_philebus_0125

- Recommendation: `accept_narrowed`.
- Exact source ref: `29b`; `start=35960`; `end=36349`;
  `sha=eed2b49d9ca0dd1b115fb01f96aac9d3d607750f0330060c8af116c6cc6043d2`.
- Feature decision: change from
  `forms_trajectory/one_over_many_form_reasoning` to
  `microcosm_macrocosm/local_cosmic_instance_contrast`.
- Suggested `greek_terms`: [`μικρόν`, `φαῦλον`, `εἰλικρινές`,
  `δύναμιν`, `πῦρ`, `παρ’ ἡμῖν`, `ἐν τῷ παντί`].
- Replacement guidance: record the local/cosmic contrast: the elements in us
  are small, impure, and weak compared with the corresponding element in the
  whole.
- Limits guidance: do not call these elements Forms or make a technical
  one-over-many claim. The dependency claim belongs to accepted
  `obs_philebus_0113`.

## obs_philebus_0180

- Recommendation: `accept_narrowed`.
- Exact source ref: `42d`; `start=62964`; `end=63361`;
  `sha=a51f5ebeca7f299c9f80d286d4a6c22244edd5ccc64bea0b51f0c08657b63bb4`.
- Feature decision: keep
  `definition_ladder/characteristic_catalogue_for_definiendum`.
- Suggested `greek_terms`: [`κενώσεσι`, `αὔξαις`, `φθίσεσι`, `λῦπαι`,
  `ἀλγηδόνες`, `ὀδύναι`, `κατάστασιν`, `ἡδονή`].
- Replacement guidance: narrow to the catalogue of bodily processes and
  affective names, ending with restoration to natural condition being called
  pleasure.
- Limits guidance: do not include the separate `42e` no-motion/no-affection
  consequence unless a new record is deliberately added for it.

## obs_philebus_0212

- Recommendation: `accept_narrowed`.
- Exact source ref: `48d`; `start=75241`; `end=75635`;
  `sha=45941d4fd77b42dc9ff35df77ebbe86bbeaa497ae197bf7dd8d30be0c2c9f574`.
- Feature decision: keep `maxim_reference/delphic_inscription_citation`.
- Suggested `greek_terms`: [`τὸ μηδαμῇ γιγνώσκειν αὑτόν`,
  `ὑπὸ τοῦ γράμματος`, `τριχῇ τέμνειν`].
- Replacement guidance: narrow to Socrates' setup of self-ignorance as the
  contrary of the inscriptional self-knowledge maxim.
- Limits guidance: do not include the tripartite division of self-ignorance
  already accepted in `obs_philebus_0211`, or Socrates' procedural takeover in
  `obs_philebus_0213`.

## obs_philebus_0214

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `44d-44e`;
  `start=67086`; `end=67932`;
  `sha=bc2c0194005d412efd417538a31333ae09aca41c6ef64c7a90a94860523042fa`.
- Feature decision: do not keep
  `prosopography/opponent_group_introduced_by_position` here.
- Suggested `greek_terms`: [`δυσχεράσματα`, `δυσχερείας`, `δυσχερέσιν`].
- Replacement guidance: reject as duplicate pressure. The anonymous opponent
  group is already introduced by position in accepted `obs_philebus_0202`;
  `obs_philebus_0215` already covers the ally/chase framing, and
  `obs_philebus_0216` covers the extreme-case method.
- Limits guidance: do not create a second prosopography introduction from the
  later pursuit of the same group.

## obs_philebus_0223

- Recommendation: `accept_narrowed`.
- Exact source ref: `51a-51b`; `start=79952`; `end=80786`;
  `sha=d24d8b2afa233d9ee695ae701db89669fd7bacb407c7f6c1c1a98f6bdc523cf3`.
- Feature decision: keep
  `definition_ladder/definition_by_dichotomous_contrast`.
- Suggested `greek_terms`: [`λυπῶν παῦλαν`, `δοκούσας`,
  `οὔσας δ’ οὐδαμῶς`, `ἀληθεῖς`].
- Replacement guidance: keep only the apparent-versus-true pleasure contrast
  and the rejection of the all-pleasures-as-cessations thesis as its pivot.
- Limits guidance: do not include the positive criterion for true pleasures;
  accepted `obs_philebus_0224` owns that criterion.

## obs_philebus_0226

- Recommendation: `accept_narrowed`.
- Exact source ref: `52a`; `start=81943`; `end=82271`;
  `sha=b9e5e60444f5aadb8195df0e30bb5c193adc690eea53b16de5ca1313258d5826`.
- Feature decision: keep
  `definition_ladder/pleasure_kind_defined_by_absence_of_pain_mix`.
- Suggested `greek_terms`: [`μαθήματα`, `πείνας`, `ἀλγηδόνας`,
  `πληρωθεῖσιν`, `ἀποβολαί`, `λήθης`].
- Replacement guidance: narrow to pleasures of learning and the absence of
  prior hunger/pain as their purity test, including the question about whether
  forgetting naturally produces pain.
- Limits guidance: do not include the smell-pleasure class from `51e`; the
  rejected neighbor `obs_philebus_0225` already marks that overreach.

## obs_philebus_0229

- Recommendation: `split_into_records`.
- Exact source refs:
  - `39e`; `start=57439`; `end=57893`;
    `sha=807206a045e49f72759e39dcb681f014a7fa86508f5b4484b12f71316443b1e3`.
  - `40a`; `start=57893`; `end=58272`;
    `sha=dca1fab395a32d604f7ab01924d2fb1a70a7bea388fc320dbb53a726c1343897`.
- Feature decision: keep `definition_ladder/definition_established_by_assent_chain`
  for the hopes-as-future/always-filled chain; use
  `definition_ladder/definition_established_by_assent_chain` again, or a later
  deliberately normalized craft-image label, for the hopes-as-inner-logoi/image
  chain. Do not use `myth_demarcation/incantation_segment`.
- Suggested `greek_terms`: [`ἐλπίδες`, `γέμομεν`, `λόγοι`,
  `φαντάσματα`, `ἐζωγραφημένα`].
- Replacement guidance: record 1 should isolate the rapid assent chain that
  makes hopes future-directed and pervasive through life. Record 2 should
  isolate the subsequent assent chain that names hopes as internal logoi and
  painted images.
- Limits guidance: do not include the `θεοφιλής` moral criterion already
  accepted in `obs_philebus_0228`; do not revive the rejected myth/incantation
  framing from `obs_philebus_0227`.

## obs_philebus_0239

- Recommendation: `accept_narrowed`.
- Exact source ref: `52c`; `start=82679`; `end=83088`;
  `sha=91b3e7706292f955156ef6d2802617ca4b5fbd0744ac4c52369c5e42a0f8b423`.
- Feature decision: change from
  `forms_trajectory/one_over_many_form_reasoning` to
  `definition_ladder/criterion_for_evaluative_classification`.
- Suggested `greek_terms`: [`σφοδραῖς`, `ἀμετρίαν`, `ἐμμετρίαν`,
  `ἀπείρου`, `ἧττον`, `μᾶλλον`].
- Replacement guidance: record the classification of intense pleasures under
  the unlimited by the more/less criterion and the contrast with due measure.
- Limits guidance: do not repeat `obs_philebus_0237`'s learning-pleasure
  classification or `obs_philebus_0238`'s pure/impure dichotomy.

## obs_philebus_0266

- Recommendation: `accept_narrowed`.
- Exact source ref: `38e-39a`; `start=55393`; `end=56225`;
  `sha=c7b7cd955df249b5b4e1e93a5439b9b6c59ef6c7c55486b5d3b117ae7ed4a7ad`.
- Feature decision: keep `craft_analogy/soul_book_analogy`.
- Suggested `greek_terms`: [`ψυχὴ`, `βιβλίῳ`, `μνήμη`,
  `αἰσθήσεσι`, `γράφειν`, `γραμματεύς`].
- Replacement guidance: source-correct the record because `38d-38e` only
  introduces the book comparison at the end. The durable record needs the
  introduction at `38e` and the writing mechanism at `39a`.
- Limits guidance: do not duplicate `obs_philebus_0267`'s logos-from-doxa
  record or `obs_philebus_0268`'s internal-question account of doxa. Do not
  extend into the painter/craftsman model accepted in `obs_philebus_0181`.

## obs_philebus_0301

- Recommendation: `accept_narrowed`.
- Exact source ref: `59b`; `start=96091`; `end=96531`;
  `sha=6f557ba15d1a8541c5b814c0a5959aa0842673eb33c2119fba2bd05df21e4cb2`.
- Feature decision: change from `prosopography/cross_dialogue_recurrence` to
  `turn_geometry/participant_dismissal`.
- Suggested `greek_terms`: [`σὲ καὶ ἐμὲ καὶ Γοργίαν καὶ Φίληβον`,
  `χαίρειν ἐᾶν`, `διαμαρτύρασθαι`, `τῷ λόγῳ`].
- Replacement guidance: record the turn-structure move: Socrates dismisses the
  named participants, including Gorgias and Philebus, and shifts testimony to
  the argument itself.
- Limits guidance: do not make a cross-corpus or historical claim about Gorgias
  from this local span. The existing accepted
  `prosopography/cross_dialogue_recurrence` member is not a good comparison
  target for this record.

## obs_philebus_0309

- Recommendation: `accept_narrowed`.
- Exact source ref: `57b-57c`; `start=92248`; `end=93073`;
  `sha=b50e6915b41278393a548e60aa82f1d19e87e040512049a7bb8bba7061e40467`.
- Feature decision: change from
  `definition_ladder/one_over_many_form_reasoning` to
  `definition_ladder/homonymous_name_split_into_kinds`.
- Suggested `greek_terms`: [`ὁμώνυμον`, `μιᾶς`, `δυοῖν`,
  `σαφὲς`, `καθαρὸν`, `ἀκριβέστερον`].
- Replacement guidance: source-correct the record because `57b` cuts off the
  sentence. The repaired record should isolate the classificatory warning that
  one homonymous craft-name can conceal two kinds with different clarity or
  purity.
- Limits guidance: do not call this form reasoning or resolve which crafts are
  being judged beyond the local one-name/two-kinds contrast.

## obs_philebus_0333

- Recommendation: `accept_narrowed`.
- Exact source ref: `66a-66c`; `start=109677`; `end=110927`;
  `sha=f9f5b17b252b91c027f97daca7793098b55ed65bcd35d6c09c90de1a73eea09e`.
- Feature decision: keep `definition_ladder/ranked_goods_hierarchy`.
- Suggested `greek_terms`: [`πρῶτον`, `δεύτερον`, `τρίτον`,
  `τέταρτα`, `πέμπτας`, `μέτρον`, `νοῦν`, `φρόνησιν`].
- Replacement guidance: source-correct to include the first rank at `66a`.
  The repaired record should state the ranked hierarchy through the fifth rank:
  measure/timeliness, symmetry/beauty/completeness, intellect/wisdom, sciences
  and crafts and true opinions, then painless/pure pleasures.
- Limits guidance: do not treat the Orphic sixth-generation citation as another
  goods-rank; accepted `obs_philebus_0334` owns the closure citation. Do not
  include Protarchus' assent pattern; that is `obs_philebus_0335`.

## obs_philebus_0335

- Recommendation: `accept_narrowed`.
- Exact source ref: `66b-66c`; `start=110132`; `end=110927`;
  `sha=4f582ab38e10fc49958d28996a74db412b365faf0092919bda0fda6946fcdb3f`.
- Feature decision: change from `elenchus/protarchus_acquiescence_series` to
  `turn_geometry/respondent_minimal_assent`.
- Suggested `greek_terms`: [`ἔοικε γοῦν`, `ἴσως`, `τάχ’ ἄν`,
  `ἴσως`].
- Replacement guidance: record the minimal assent pattern across Socrates'
  ordinal placements. The label should not be character-specific and should not
  imply refutation.
- Limits guidance: do not infer conviction, irony, or defeat from the assent
  markers. Do not duplicate `obs_philebus_0333`'s hierarchy or
  `obs_philebus_0334`'s Orphic closure.

## obs_philebus_0342

- Recommendation: `accept_narrowed`.
- Exact source ref: `62a-62b`; `start=101524`; `end=102282`;
  `sha=8dc4aeac1d7ca087a9a770fe5fb68a64eca886ee3f35f6df1e7a8eac7f785ea1`.
- Feature decision: change from `forms_trajectory/divine_as_paradigm` to
  `definition_ladder/sufficiency_test_for_knowledge_mix`.
- Suggested `greek_terms`: [`κύκλου`, `σφαίρας`, `θείας`,
  `ἀνθρωπίνην`, `ἱκανῶς`, `γελοίαν`].
- Replacement guidance: source-correct because `62a` cuts off the question and
  answer. Record the sufficiency test: divine/geometrical knowledge without the
  human/applied sphere and circles is not enough for the mixed life under
  examination.
- Limits guidance: do not describe the divine as a paradigm or infer an
  ontological hierarchy from this span. Do not duplicate `obs_philebus_0340`'s
  being/becoming distinction or `obs_philebus_0341`'s hypothetical mixing
  procedure.
