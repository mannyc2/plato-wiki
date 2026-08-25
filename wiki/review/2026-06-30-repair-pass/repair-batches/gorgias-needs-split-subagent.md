# Gorgias needs_split repair report

Scope: advisory review of the 13 current `needs_split` records in
`wiki/observations/gorgias.md`.

Constraints observed: Greek source only, no translations, no Pioneer, no
provider-backed review queues, no external model harness/provider runs, and no
canonical file edits.

Summary:

- `accept_narrowed`: 12
- `reject`: 1
- `leave_blocked_source_ref`: 0

## Recommendations

### obs_gorgias_0051

Recommendation: `accept_narrowed`

Source ref: keep `462d-462e`.

Feature: keep `craft_analogy / feature_candidate_1455 / techne_denied_empiria_tribe_called`.

Greek terms: `ὀψοποιία`, `τέχνη`, `ἐμπειρία τις`, `χάριτος καὶ ἡδονῆς`, `ἐπιτηδεύσεως μόριον`, `διακωμῳδεῖν`.

Replacement guidance:

- Observation: Socrates uses cookery as the immediate control case: he denies
  that cookery is a craft, calls it an experience/routine for producing
  gratification and pleasure, and then places cookery and rhetoric within the
  same broader pursuit without making them identical.
- Textual basis: 462d has Polus ask about the earlier `empeiria` claim and
  Socrates redirecting to cookery; Socrates denies cookery is a craft and calls
  it an experience for gratification and pleasure. At 462e, Polus asks whether
  cookery and rhetoric are the same, and Socrates says cookery is a part of the
  same pursuit. The Gorgias hesitation should be kept as a reception marker, not
  as a separate theory claim.
- Limits: Do not say this span itself proves the full later account of why
  rhetoric lacks craft status. Later accepted records at 463a-463b and
  464d-465a already carry the fuller craft-denial argument.

### obs_gorgias_0093

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 471c-471d
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 471c-471d
  start_marker: 471c
  end_marker: 471d
  start_char: 48613
  end_char: 49515
  text_sha256: ae8630c39d4fe49a3ddf8f1379cbffe27132127b654935f288ecf81aebd1e842
```

Feature: keep `elenchus / feature_candidate_1809 / common_opinion_deployed_as_challenge`.

Greek terms: `εὐδαίμων γενέσθαι δικαίως`, `ἀθλιώτατός`, `εὐδαιμονέστατος`, `δέξαιτ᾽ ἂν`.

Replacement guidance:

- Observation: Polus presses Socrates' unjust-happiness thesis with the
  Archelaus example by describing the murder of the child heir and then adding
  that no Athenian, beginning with Socrates, would prefer to be another
  Macedonian rather than Archelaus.
- Textual basis: 471c supplies the child-heir episode and the contrast between
  "most wretched" and "happiest"; 471d supplies the audience-preference
  challenge. Together they make the passage a common-opinion challenge rather
  than just a prosopographical crime catalog.
- Limits: Do not state Polus' common-opinion challenge as if it were Socrates'
  conclusion. Same-span accepted records already cover the Archelaus narrative
  and the sustained speech form.

### obs_gorgias_0128

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 477a
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 477a
  start_marker: 477a
  end_marker: 477a
  start_char: 60143
  end_char: 60502
  text_sha256: 96ca621e379a7964e44865f17c85bf6a21dc0856613193479b548e51d1fc7653
```

Feature: keep `elenchus / feature_candidate_987 / psychic_harm_claim`.

Greek terms: `ὠφελεῖται`, `βελτίων τὴν ψυχὴν`, `δικαίως κολάζεται`, `κακίας ψυχῆς`.

Replacement guidance:

- Observation: Socrates states that just punishment benefits the punished
  person by making the soul better and releasing the person from vice of soul.
- Textual basis: 477a contains the move from good things suffered in punishment
  to benefit, then identifies the benefit as the soul becoming better if the
  punishment is just and as release from soul-vice.
- Limits: Do not keep the current "greatest evil" claim in this record unless
  the span is expanded much farther into 477b-477e. The nearby accepted
  `obs_gorgias_0127` already records the assent-chain structure.

### obs_gorgias_0209

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 490c-490e
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 490c-490e
  start_marker: 490c
  end_marker: 490e
  start_char: 87313
  end_char: 88576
  text_sha256: 56942491ad65716e0de15fe0c738dc2decbd240c5aeee8dd37c201d0416ad8fa
```

Feature: keep `craft_analogy / feature_candidate_2448 / craft_analogy_rejected_by_respondent`.

Greek terms: `σιτία`, `ποτά`, `ἰατρούς`, `φλυαρίας`, `οὐ ταῦτα λέγω`, `ἱματίων`, `ὑποδήματα`, `φλυαρεῖς`.

Replacement guidance:

- Observation: Callicles rejects Socrates' domain-specific craft examples for
  interpreting "the better should have more": food, drink, medical, clothing,
  shoe, and seed examples are treated as irrelevant to Callicles' intended
  claim.
- Textual basis: 490c-490e contains Callicles' first dismissal of food, drink,
  and doctors as drivel, his denial that food or drink is at issue, Socrates'
  clothing and shoe examples, Callicles' second "drivel" response, and the
  agricultural seed example.
- Limits: This records Callicles' rejection of craft examples in this turn. It
  does not prove the analogies are invalid, and it should not be generalized to
  all craft analogy use in the dialogue.

### obs_gorgias_0233

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 499a-499b
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 499a-499b
  start_marker: 499a
  end_marker: 499b
  start_char: 104829
  end_char: 105674
  text_sha256: de524e954cbb7cc322190babec2ec16946308a976628798b0c82143ea380f92c
```

Feature: keep `elenchus / feature_candidate_425 / reductio_conclusion`.

Greek terms: `ἀγαθὸν τὸν χαίροντα`, `κακὸν τὸν ἀνιώμενον`, `ὁμοίως`, `κακὸς καὶ ἀγαθὸς`, `μᾶλλον ἀγαθὸς ὁ κακός`.

Replacement guidance:

- Observation: Socrates draws a reductio from the hedonist premises: if the
  joyful person is good, the distressed person bad, and good and bad people can
  rejoice and be distressed alike, the bad person becomes good and bad like the
  good person, or even more good.
- Textual basis: 499a-499b completes the conclusion that is cut off in the
  current source ref. The record should start with the recapitulated premises
  and end with the absurd consequence.
- Limits: Do not retain the current note that the segment cuts off mid-sentence
  after repairing the source ref. The record should not assess whether Callicles'
  later response diagnoses an equivocation.

### obs_gorgias_0251

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 501e-502a
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 501e-502a
  start_marker: 501e
  end_marker: 502a
  start_char: 110615
  end_char: 111427
  text_sha256: e9cf6d92720377ea5234f310ea31bf6c60fa1a825cb9e99a3d660eb346605bd1
```

Feature: change away from `expert_craft_analogy`. Suggested feature:
`craft_analogy / new_candidate / pleasure_practice_catalog`.

Greek terms: `αὐλητικήν`, `ἡδονὴν μόνον διώκειν`, `κιθαριστική`, `χορῶν διδασκαλία`, `διθυράμβων ποίησις`, `βελτίους γίγνοιντο`, `χαριεῖσθαι`.

Replacement guidance:

- Observation: Socrates catalogs public musical and poetic performance
  practices as candidates for the class of practices that pursue audience
  pleasure rather than improvement.
- Textual basis: 501e introduces flute-playing as pursuing pleasure only, then
  adds contest kithara-playing, chorus teaching, and dithyramb composition. At
  502a, the Cinesias example completes the contrast between making listeners
  better and gratifying the crowd.
- Limits: This is not an `expert_craft_analogy` record: no expert authority is
  being used as a judge. It is a practice-catalog step inside the pleasure vs.
  improvement classification. I did not find an existing label that names this
  exact function without collapsing it into a broader music-law or expert-craft
  topic.

### obs_gorgias_0258

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 504d-504e
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 504d-504e
  start_marker: 504d
  end_marker: 504e
  start_char: 116413
  end_char: 117293
  text_sha256: 63afeeb476647102a5abbce642e14e1cd3efccc99ef091fe1a8921ccd7b22f1f
```

Feature: keep `craft_analogy / feature_candidate_2697 / rhetor_as_techne_practitioner`.

Greek terms: `ψυχῆς τάξεσι`, `νόμιμόν τε καὶ νόμος`, `ὁ ῥήτωρ ἐκεῖνος`, `τεχνικός τε καὶ ἀγαθός`, `δικαιοσύνη`, `σωφροσύνη`.

Replacement guidance:

- Observation: Socrates defines the good and skilled orator by orientation
  toward lawful order in souls: such an orator directs speeches, actions,
  gifts, and removals toward producing justice and moderation in citizens while
  removing injustice and license.
- Textual basis: 504d names the soul's orderings as law/lawfulness and
  identifies them with justice and moderation; 504d-504e then says the skilled
  and good orator looks to these outcomes in every rhetorical or civic action.
- Limits: This is a normative description of the true orator, not evidence that
  any actual Gorgias speaker possesses that craft.

### obs_gorgias_0275

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 506b
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 506b
  start_marker: 506b
  end_marker: 506b
  start_char: 119661
  end_char: 120079
  text_sha256: 11105786c3395e385bd0ba61482cea44d46b601197ec8a4e1b8474a134aa81da
```

Feature: keep `myth_demarcation / feature_candidate_2754 / mythic_paradigm_invoked_in_argument`.

Greek terms: `Ἀμφίονος`, `Ζήθου`, `ῥῆσιν`, `ἀντὶ`.

Replacement guidance:

- Observation: Socrates marks the stalled exchange with Callicles through the
  Amphion/Zethus speech pair, saying he would have liked to continue until he
  returned Amphion's speech in place of Zethus' speech.
- Textual basis: 506b explicitly names Amphion and Zethus and frames Socrates'
  hoped-for continuation as replacing one speech with the other.
- Limits: Do not claim from this span alone that the full earlier mythic
  opposition is sustained or subverted. The record should note the local
  allusive marker only.

### obs_gorgias_0300

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 508b-508c
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 508b-508c
  start_marker: 508b
  end_marker: 508c
  start_char: 123804
  end_char: 124708
  text_sha256: cc9a41bc44b8184b442c3a46cfcbf2fe9b240833df8367f730f850e462d5c296
```

Feature: keep `turn_geometry / feature_candidate_1124 / recapitulation_or_restart`.

Greek terms: `τὰ πρόσθεν ἐκεῖνα`, `συμβαίνει πάντα`, `κατηγορητέον`, `ῥητορικῇ`, `ἀληθῆ ἄρα ἦν`.

Replacement guidance:

- Observation: Socrates recapitulates the earlier consequences: one must use
  rhetoric to accuse oneself, son, or companion when injustice occurs; Polus'
  shame-concession about doing injustice being worse than suffering it was
  true; and Gorgias' justice concession also follows.
- Textual basis: 508b explicitly marks the recurrence of earlier points and
  begins the self-accusation/rhetoric summary; 508c completes the Polus and
  Gorgias concession summary.
- Limits: This is a recapitulation/reset marker. Do not use it to re-argue the
  validity of the earlier conclusions.

### obs_gorgias_0302

Recommendation: `reject`

Reason:

- The record is source-supported only if the span is repaired to
  `503e-504a`; the current `503d-503e` source ref cuts off before the whole
  ordered product is completed.
- More importantly, the durable content duplicates accepted
  `obs_gorgias_0301`, which already records the good speaker/craftsman not
  acting at random, looking toward a target, and imposing order, fit, and
  harmony on the product.
- Keeping both would create two records for the same local craft-analogy move.

Optional main-thread note: if canonical repair wants the fullest source support
for the accepted local observation, inspect whether `obs_gorgias_0301` itself
should be reconciled to `503e-504a`; that is separate from preserving this
duplicate `needs_split` record.

### obs_gorgias_0323

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 513a-513b
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 513a-513b
  start_marker: 513a
  end_marker: 513b
  start_char: 133579
  end_char: 134477
  text_sha256: 887e4fc538afb2a09ab35319e9ccdf6039c870b1641f29c4e4c740901d260f10
```

Feature: keep `craft_analogy / feature_candidate_2884 / craft_transmission_doubt`.

Greek terms: `παραδώσειν`, `τέχνην τινὰ τοιαύτην`, `μέγα δύνασθαι`, `ἀνόμοιον`, `ὁμοιότατον`, `πολιτικὸν καὶ ῥητορικόν`.

Replacement guidance:

- Observation: Socrates doubts that anyone can hand over a craft that would
  make Callicles powerful in Athens while unlike the Athenian constitution; he
  says political and rhetorical success requires becoming naturally similar to
  the people addressed.
- Textual basis: 513a introduces the supposed transmissible craft; 513b
  completes what the craft would have to do and gives Socrates' rejection of
  that strategy.
- Limits: This should remain a craft-transmission test inside Socrates'
  political warning, not a general claim that political education is impossible.
  Same-span accepted records already cover the Thessalian moon analogy and the
  shared-risk framing.

### obs_gorgias_0328

Recommendation: `accept_narrowed`

Revised span/source_ref:

```yaml
stephanus_span: 514c
source_ref:
  source_path: raw/plato/greek/gorgias.txt
  stephanus_span: 514c
  start_marker: 514c
  end_marker: 514c
  start_char: 136368
  end_char: 136816
  text_sha256: 798136607ec794f5e591691e277cae82eae133c9b37e9258a7cdcf06b59f6d86
```

Feature: keep `craft_analogy / feature_candidate_2942 / craft_competence_prior_to_public_works`.

Greek terms: `διδάσκαλον`, `οἰκοδομήματα`, `ἴδια`, `δημοσίοις ἔργοις`, `ἀνόητον`.

Replacement guidance:

- Observation: Socrates completes the building analogy by contrasting a
  sensible move into public works after good teachers and many good private
  buildings with the foolishness of attempting public works without a teacher
  or worthwhile buildings.
- Textual basis: 514c contains both sides of the public-works threshold: good
  teachers and private products license public work; no teacher or worthless
  products make public work foolish.
- Limits: Accepted `obs_gorgias_0326` already records the two-part examination
  at 514a-514b. This record should not repeat that whole test; it should keep
  the distinct public-works threshold at 514c.

### obs_gorgias_0385

Recommendation: `accept_narrowed`

Source ref: keep `524e-525a`.

Feature: keep `ethical_inversion_maxim / feature_candidate_2298 / ethical_inversion_maxim`.

Greek terms: `οὐκ εἰδὼς ὅτου ἐστίν`, `μεγάλου βασιλέως`, `δυνάστου`, `οὐδὲν ὑγιὲς`, `ἐξουσίας`, `τρυφῆς`, `ὕβρεως`, `ἀκρατίας`, `ἀτίμως`.

Replacement guidance:

- Observation: The myth strips worldly rank from judgment: Rhadamanthys does
  not know whose soul he examines, and a great king or dynast can appear with a
  diseased and dishonored soul because of injustice, falsehood, power, luxury,
  hubris, and lack of self-control.
- Textual basis: 524e marks anonymous inspection and the king/dynast case;
  525a gives the soul's deforming causes and the dishonorable dispatch to
  punishment.
- Limits: Remove the current claim that "a private person could fare better";
  that comparison is not in 524e-525a. Same-span accepted records already cover
  post-mortem penal dispatch and visible soul stigmata; this record should
  isolate the rank/status inversion.
