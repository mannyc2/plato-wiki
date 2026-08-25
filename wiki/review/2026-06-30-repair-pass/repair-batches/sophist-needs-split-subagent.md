# Sophist needs_split scratch repair review

Scope: advisory review of the 22 current `needs_split` records listed by the
main thread in `wiki/observations/sophist.md`.

Method: inspected the target records, same-span and adjacent accepted/rejected
records, existing labels/clusters where relevant, and exact Greek source spans
from `raw/plato/greek/sophist.txt` using `resolveSourceSpan("sophist", span)`
from `packages/harness/src/source.ts`. No translation files, Pioneer,
provider-backed review queues, external model/provider harness runs,
non-dry-run `review-segmented`, or `review-queue` were used. Greek passages are
not quoted below; only short `greek_terms` are cited.

Summary: `accept_narrowed=17`, `split_into_records=0`, `reject=5`,
`leave_blocked_source_ref=0`.

## obs_sophist_0028

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `220d-221a`; `start=8481`; `end=9622`;
  `sha=3b380e3ef055e77f6bf39e41f9140f2159de4ebecc7352861acec78494cc135f`.
- Feature decision: keep
  `definition_ladder/formal_classification_distinction`; this matches accepted
  `obs_sophist_0031` better than moving to a broader diairesis label.
- Suggested `greek_terms`: [`πληκτική`, `πυρευτική`, `ἀγκιστρευτικόν`,
  `τριοδοντία`, `κάτωθεν`, `ἄνω`].
- Replacement guidance: source-complete the record so the hook-fishing branch
  is not cut off at the end of 220e. Keep one narrow record for the sequential
  classification of striking-hunting into fire/night, hook-and-trident/day, and
  the trident/hook contrast.
- Limits guidance: do not duplicate same-span `obs_sophist_0029`'s minimal
  assent pattern or `obs_sophist_0030`'s operational naming record. Do not use
  this as a general defense of the method.

## obs_sophist_0041

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `221b-221c`; `start=9622`; `end=10417`;
  `sha=4da3a3ef89495607042d66a82d0a30b1e31f19edc7f482292915ce2b9b551308`.
- Feature decision: keep
  `definition_ladder/definition_by_dichotomous_division`.
- Suggested `greek_terms`: [`συμπάσης τέχνης`, `κτητικόν`, `χειρωτικόν`,
  `θηρευτικόν`, `ζῳοθηρικόν`, `ἐνυγροθηρικόν`, `ἀσπαλιευτική`].
- Replacement guidance: make this a recapitulation of the completed angler
  chain from the whole of art down to angling. The current `221a-221b` span
  cuts off the final naming step; `221b-221c` contains the recapitulation and
  terminus.
- Limits guidance: do not restate same-span `obs_sophist_0042`'s separate
  point that name and account have been adequately agreed. Do not present the
  recap as a new division.

## obs_sophist_0063

- Recommendation: `accept_narrowed`.
- Exact source ref: keep `228a-228b`; `start=22630`; `end=23348`;
  `sha=a654a6233c702f7645231dacf12a590be141f12e27b25471f045d3fe48028156`.
- Feature decision: keep `craft_analogy/body_soul_evil_analogy`.
- Suggested `greek_terms`: [`νόσον`, `αἶσχος`, `στάσιν`, `συγγενῆ`,
  `ψυχῆς`, `πονηρίαν`].
- Replacement guidance: narrow to the body/soul disease analogy: bodily disease
  is clarified through `στάσις`, and internal psychic conflict among naturally
  kindred elements is named disease/wickedness of soul.
- Limits guidance: do not say this span maps bodily ugliness to psychic
  ignorance; that continuation belongs to later accepted records
  `obs_sophist_0068` and `obs_sophist_0069`. Do not duplicate same-span
  `obs_sophist_0064`'s definitions of `στάσις` and `αἶσχος` or
  `obs_sophist_0065`'s internal-conflict catalogue.

## obs_sophist_0072

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `229d-230a`; `start=25700`; `end=26797`;
  `sha=b76ed4b4ec1b0989dbc48a5c4f38516be86e2f2862a0d6216e494936c0944bf6`.
- Feature decision: keep
  `definition_ladder/definition_by_dichotomous_division`.
- Suggested `greek_terms`: [`δημιουργικὰς διδασκαλίας`, `παιδείαν`,
  `διαίρεσιν`, `τραχυτέρα`, `λειότερον`, `νουθετητικήν`].
- Replacement guidance: keep the nested classification of instruction:
  craft-instruction versus education, then discursive instruction by rougher
  and smoother road, with the rougher branch named as admonitory instruction.
  The current span ends before that branch is source-complete.
- Limits guidance: do not include Theaetetus' procedural assent as the main
  observation; `obs_sophist_0073` should own that. Do not carry the later
  elenchus-as-purgation account into this record.

## obs_sophist_0073

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `229d`; `start=25700`; `end=26077`;
  `sha=7c80666b3d1c07154d52d7d2519f7e22f233cadb73eb9ac3cb963ad6696fb1c3`.
- Feature decision: keep `turn_geometry/procedural_agreement_to_inquire`.
- Suggested `greek_terms`: [`σκεπτέον`, `ἄτομον`, `διαίρεσιν`,
  `σκοπεῖν`].
- Replacement guidance: isolate the agenda-setting question about whether the
  classification admits a further named division and Theaetetus' explicit
  agreement to examine it.
- Limits guidance: do not include the rough/smooth road division from 229e or
  the admonitory branch from 230a.

## obs_sophist_0100

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `235d-235e`;
  `start=37411`; `end=38129`;
  `sha=045d443d4bcff2288acc1148453afcdf2de57dc71f921e38953cd9446360a2c2`.
- Feature decision: do not keep
  `definition_ladder/definition_by_dichotomous_contrast` here.
- Suggested `greek_terms`: [`μιμητικῆς`, `εἴδη`, `εἰκαστικὴν`,
  `παραδείγματος`, `συμμετρίας`].
- Replacement guidance: reject as duplicate and premature. Same-span accepted
  `obs_sophist_0099` already records the first branch of the mimetic-art
  division; the second branch is not named or defined until 236b-236c and is
  better handled by `obs_sophist_0112`/`obs_sophist_0114`.
- Limits guidance: do not infer a full two-branch contrast from 235d-235e
  alone.

## obs_sophist_0101

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `235e-236a`; `start=37807`; `end=38486`;
  `sha=bea2a7df7dc72076019ca1fc71a73a705abdd5fbf69d8013f0f62d5ee07929e3`.
- Feature decision: keep `craft_analogy/visual_arts_analogy`.
- Suggested `greek_terms`: [`μεγάλων`, `πλάττουσιν`, `γράφουσιν`,
  `ἀληθινὴν συμμετρίαν`, `δημιουργοὶ`, `δοξούσας`].
- Replacement guidance: source-complete the visual-arts example: large-scale
  sculpting/painting abandons true proportions and uses proportions that appear
  beautiful from the viewer's position.
- Limits guidance: do not call this a general critique of visual art. Do not
  duplicate `obs_sophist_0099`'s eikastic branch or `obs_sophist_0112`'s
  eikon/phantasma opposition.

## obs_sophist_0102

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `235b`; `start=36544`; `end=36981`;
  `sha=0b1d823929251689fd1acefecefebce6a5b5f0bc366a7cf2ee337cfee55a874a`.
- Feature decision: change from
  `definition_ladder/definition_by_dichotomous_division` to the existing
  reusable label `definition_ladder/sophist_defined_by_genus`.
- Suggested `greek_terms`: [`θαυματοποιῶν`, `γένους`, `σοφιστής`].
- Replacement guidance: narrow to the genus-placement claim: the sophist is
  put among wonder-workers before the image-making division begins.
- Limits guidance: do not include the hunt/capture metaphor, already accepted
  in `obs_sophist_0103`, or the universalizing method claim, already accepted
  in `obs_sophist_0104`.

## obs_sophist_0111

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `236a-236b`;
  `start=38129`; `end=38884`;
  `sha=7ad356340a2ba7c715dad973e9e839eef410dd4748b2388307ac8ead0f3a675f`.
- Feature decision: do not keep
  `definition_ladder/definition_by_dichotomous_division` here.
- Suggested `greek_terms`: [`εἰκαστικήν`, `φάντασμα`, `εἰκόνα`,
  `συμμετρίας`].
- Replacement guidance: reject as duplicate/overwide. Same-span accepted
  `obs_sophist_0112` already records the eikon/phantasma opposition, while
  `obs_sophist_0114` should own the actual completion of the named twofold
  division at 236c.
- Limits guidance: do not use 236a-236b to say `φανταστική` is already named;
  the naming occurs at 236c.

## obs_sophist_0113

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `236a-236b`;
  `start=38129`; `end=38884`;
  `sha=7ad356340a2ba7c715dad973e9e839eef410dd4748b2388307ac8ead0f3a675f`.
- Feature decision: do not keep
  `craft_analogy/demiurgos_production_mapping`; that existing label is a bad
  fit for this visual-art example.
- Suggested `greek_terms`: [`δημιουργοὶ`, `συμμετρίας`, `εἰδώλοις`,
  `δοξούσας`].
- Replacement guidance: reject as duplicate/mislabel. The salvageable content
  belongs in the repaired `obs_sophist_0101` visual-arts analogy and the
  accepted `obs_sophist_0112` oppositional definition.
- Limits guidance: do not merge this with the Timaeus-style
  `demiurgos_production_mapping` cluster; this passage concerns craftsmen's
  optical proportioning, not demiurgic distribution/delegation.

## obs_sophist_0114

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `236c`; `start=38884`; `end=39278`;
  `sha=05ae08774fdfd6a424a26e58bf5ccb47d9d34087b855e171879b6435d7a8816a`.
- Feature decision: keep
  `definition_ladder/definition_by_dichotomous_division`.
- Suggested `greek_terms`: [`φάντασμα`, `εἰκόνα`, `φανταστικήν`,
  `εἰκαστικήν`, `εἰδωλοποιικῆς`].
- Replacement guidance: isolate the completion of the named bifurcation:
  image-making has the two forms eikastic and fantastic.
- Limits guidance: do not include the 236d assent-quality check, already
  accepted in `obs_sophist_0115`, and do not restate the visual-art example.

## obs_sophist_0166

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `249b-249c`;
  `start=64453`; `end=65269`;
  `sha=47d9c8d64372b8333550add5f93700df5eab58871e38b5554bf47b4f5f8153c9`.
- Feature decision: do not keep `elenchus/cognitive_triad_threatened`.
- Suggested `greek_terms`: [`ἐπιστήμην`, `φρόνησιν`, `νοῦν`,
  `ἀφανίζων`, `μαχετέον`].
- Replacement guidance: reject as duplicate/overclaim. Accepted
  `obs_sophist_0164` already records that the two extreme ontological
  positions eliminate `νοῦν`; accepted `obs_sophist_0165` already records the
  combat mandate against eliminating `ἐπιστήμη`, `φρόνησις`, or `νοῦς`.
- Limits guidance: do not say the full triad is shown to be eliminated by both
  extreme positions; the text broadens to the triad in the combat mandate.

## obs_sophist_0203

- Recommendation: `accept_narrowed`.
- Exact source ref: keep `254e-255a`; `start=75954`; `end=76640`;
  `sha=cebbe0afa9913c91d5feb9c0f2dfc709e50f31b655555e2804d73fdf02e125be`.
- Feature decision: change from
  `forms_trajectory/one_over_many_form_reasoning` to the existing reusable
  label `elenchus/reductio_by_identification`.
- Suggested `greek_terms`: [`ταὐτόν`, `θάτερον`, `κίνησις`, `στάσις`,
  `μεταβάλλειν`].
- Replacement guidance: record the reductio: identifying Same or Other with
  Motion or Rest makes one opposite change into the other.
- Limits guidance: do not frame this as one-over-many form reasoning. Do not
  duplicate `obs_sophist_0202`'s forced alternative about whether Same and
  Other are additional genera.

## obs_sophist_0206

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `254d`; `start=75506`; `end=75954`;
  `sha=4a32b3ae2fd4aee77a4b60538c12be081bd305a9c6b86f4f70cfc88a54aaeb24`.
- Feature decision: the current family is wrong. Change away from
  `turn_geometry/algebraic_other_and_same_operator`. I did not find an existing
  reusable label that precisely fits; use a narrow forms label such as
  `forms_trajectory/same_other_self_relation_formula` if this record is kept.
- Suggested `greek_terms`: [`τρία`, `ἕκαστον`, `ἕτερόν`, `ταὐτόν`,
  `ἑαυτῷ`].
- Replacement guidance: keep only the substantive formula that each of the
  three kinds is other than the other two and the same as itself.
- Limits guidance: drop the minimal-assent/turn-geometry claim. Do not identify
  this formula with the later established forms of Same and Other, and do not
  duplicate `obs_sophist_0204` or `obs_sophist_0205`.

## obs_sophist_0224

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `256d-256e`; `start=79603`; `end=80349`;
  `sha=dc15c362720b1c02b8c3537200ca892245e6883001b594559e80a8729fd48b1d`.
- Feature decision: keep `forms_trajectory/not_being_necessity_claim`.
- Suggested `greek_terms`: [`τὸ μὴ ὂν`, `ἐξ ἀνάγκης`, `κινήσεως`,
  `θατέρου φύσις`, `μετέχει`].
- Replacement guidance: source-complete the necessity claim: not-being applies
  to motion and all kinds through the nature of the Other, while the relevant
  things also are because they partake of Being.
- Limits guidance: do not duplicate `obs_sophist_0223`'s five-kinds framework
  setup. Do not import the later negation-as-otherness-not-contrariety analysis
  from 257b-258d.

## obs_sophist_0235

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `260d-260e`; `start=87760`; `end=88506`;
  `sha=1fc26139f2878fe559ce077a42c888b5859548d07fb283606005881cf15d9f83`.
- Feature decision: keep `turn_geometry/speaker_ventriloquism`.
- Suggested `greek_terms`: [`τάχα δ’ ἂν φαίη`, `λόγον`, `δόξαν`,
  `μὴ ὄντος`, `διαμάχοιτο`].
- Replacement guidance: isolate the Stranger's voiced hypothetical objection:
  the sophist may concede some participation in not-being while denying that
  speech and opinion participate, thereby trying to protect image-making and
  appearance-making from the refutation.
- Limits guidance: do not keep the rejected `obs_sophist_0234` synthesis about
  falsehood, deception, and images as this record's claim. Do not evaluate
  whether the ventriloquized objection succeeds.

## obs_sophist_0253

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `261a`; `start=88506`; `end=89004`;
  `sha=21541b8f9148a5cb243e698dc489ac2f44caab186d757f40061bd8affa737b63`.
- Feature decision: keep `elenchus/opponent_must_fight_through_preliminaries`.
- Suggested `greek_terms`: [`δυσθήρευτον`, `προβλημάτων γέμειν`,
  `διαμάχεσθαι`, `μὴ ὄν`, `προβληθέν`].
- Replacement guidance: narrow to Theaetetus' procedural diagnosis: the sophist
  is hard to hunt because each thrown-forward problem has to be fought through
  before reaching him.
- Limits guidance: do not include the Stranger's 260e program for investigating
  speech, opinion, and appearance except as immediate context. Do not turn the
  record into a hidden-theme claim.

## obs_sophist_0274

- Recommendation: `reject`.
- Exact source ref: no replacement. Current source ref `264c-264d`;
  `start=95559`; `end=96394`;
  `sha=4205a5414b6c2cf4daf2138bf41f37e860758fc3552c36cd4df85560c2437ca4`.
- Feature decision: do not keep
  `definition_ladder/dichotomous_division_step` here.
- Suggested `greek_terms`: [`διαιρέσεων`, `εἰκαστικήν`, `φανταστικήν`,
  `σχίζοντες διχῇ`].
- Replacement guidance: reject as duplicate. Accepted `obs_sophist_0273`
  already records the recall/restart of the diairetic procedure, and accepted
  `obs_sophist_0275` already records the transition from the falsehood argument
  back to deceptive art.
- Limits guidance: do not make a separate division-step record from the
  unfinished `σχίζοντες διχῇ` setup at the end of 264d.

## obs_sophist_0283

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `241a-241b`; `start=47796`; `end=48683`;
  `sha=d6f29555d9f8484b6d7e93b1dff176461c7c729f17024c09aff28b4e3e32fc20`.
- Feature decision: keep `elenchus/forced_concession`.
- Suggested `greek_terms`: [`ψευδῆ`, `δόξαις`, `λόγους`, `μὴ ὄντι`,
  `τὸ ὂν`, `ἀπορίας`].
- Replacement guidance: source-complete Theaetetus' recollection that false
  speech/opinion forces the inquiry to attach being to not-being despite the
  earlier impossibility claim.
- Limits guidance: keep the many-objections remark as consequence/context, not
  a separate synthesis. Do not include the later solution to falsehood.

## obs_sophist_0294

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `245d-245e`; `start=57034`; `end=57887`;
  `sha=b01dac6ebe6c0d75603a54a0955773a057b78580fd1988c710c2139e5e1c3c17`.
- Feature decision: keep `elenchus/aporia_reported`.
- Suggested `greek_terms`: [`ἀπορίας`, `πλάνην`, `ὂν`, `ἓν`,
  `ἱκανῶς`].
- Replacement guidance: source-complete the aporia closure: the preceding
  being-inquiry generates further difficulties, Theaetetus names the increasing
  wandering, and the Stranger marks the survey as sufficient before turning to
  other speakers.
- Limits guidance: do not claim every ontology has been examined. Do not
  duplicate `obs_sophist_0292` or `obs_sophist_0293` on part/whole
  consequences.

## obs_sophist_0303

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `268b-268c`; `start=103100`; `end=103957`;
  `sha=3a61ce737abdb5e33c26de8b562c242d2a5e6c2c331b37a57bcded9f1e69f51e`.
- Feature decision: keep `definition_ladder/naming_via_division_terminus`.
- Suggested `greek_terms`: [`σοφὸν`, `σοφιστικόν`, `μιμητὴς`,
  `παρωνύμιον`, `ὄντως σοφιστήν`].
- Replacement guidance: source-complete Theaetetus' naming move: the private
  short-speech imitator cannot be called wise because he has been set down as
  not knowing, so he receives the derivative name sophist.
- Limits guidance: do not include the backward recomposition of the full
  division; `obs_sophist_0304` should own that.

## obs_sophist_0304

- Recommendation: `accept_narrowed`.
- Exact source ref: revise to `268c-268d`; `start=103551`; `end=104196`;
  `sha=a86d5e8f24b68d452bef678051ca44d77807a23000c6cfa87698bb7284def02d`.
- Feature decision: keep `definition_ladder/naming_via_division_terminus`.
- Suggested `greek_terms`: [`συνδήσομεν`, `ἀπὸ τελευτῆς ἐπ’ ἀρχήν`,
  `ἐναντιοποιολογικῆς`, `εἰρωνικοῦ`, `δοξαστικῆς`, `θαυματοποιικὸν`].
- Replacement guidance: source-complete the Stranger's backward recomposition
  of the final sophist-name through the completed divisions.
- Limits guidance: do not fold Theaetetus' derivative-name decision from
  `obs_sophist_0303` into this record. Do not claim the final formula erases
  the earlier partial definitions.
