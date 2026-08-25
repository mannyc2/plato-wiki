# Theaetetus Late Needs-Split Review

Method: inspected `wiki/observations/theaetetus.md`, checked nearby accepted or rejected records for duplicate pressure, and resolved every recommended span with `resolveSourceSpan("theaetetus", span)` against `raw/plato/greek/theaetetus.txt`. No translations, review queue, segmented review, external LLMs, or provider-backed harness runs were used.

## obs_theaetetus_0296

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0295` already records the aporia and threatened absurdities at `190d-190e`; this record should keep only the procedural deferral at `190e`.

```yaml
observation_id: obs_theaetetus_0296
span: 190e
start_char: 101025
end_char: 101428
text_sha256: 37d56d153bd57922a53a2b469ea0a377810278c7e3218623baaebd8b3f1ecc5a
feature_family: elenchus
feature_label: truth_priority_procedure
greek_terms: [πανταχῇ, αἰσχυνοίμην, ἀποροῦμεν]
observation: "Socrates refuses to state the threatened absurd consequences before he has tried to examine the question in every direction."
textual_basis: "At 190e, after Theaetetus asks which consequences would follow, Socrates says he will not state them before completing the examination and gives shame at forced agreement while still at a loss as his reason."
limits: "This records a procedural deferral inside the false-opinion inquiry. It does not identify the threatened consequences or claim that the inquiry has been resolved."
review_status: accepted
```

## obs_theaetetus_0325

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0326` already records the next marker's confirmation of the proposed account, so this record should cover the proposal and Theaetetus' immediate examples without importing the later confirmation.

```yaml
observation_id: obs_theaetetus_0325
span: 189b-189c
start_char: 97693
end_char: 98568
text_sha256: 7209cca1a54f38afc708f8d5e6e8a497dae966e25213f31347b2fdd7fe54c57d
feature_family: definition_ladder
feature_label: definition_proposed
greek_terms: [ἀλλοδοξίαν, ψευδῆ δόξαν, ἕτερον, ἁμαρτάνων]
observation: "Socrates proposes false opinion as one existent thing being exchanged for another in thought, and Theaetetus accepts the proposal with contrary-quality examples."
textual_basis: "At 189b-189c, after rejecting non-being as the source of false opinion, Socrates names the alternative and describes error as taking one thing for another; Theaetetus then supplies examples using opposite qualities."
limits: "This records the introduction of the account. It does not include the later objection or the later confirmation of the account's name."
review_status: accepted
```

## obs_theaetetus_0330

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0327` through `obs_theaetetus_0329` cover excluded cases in the knowledge and perception matrix; this record should keep the positive mismatch case.

```yaml
observation_id: obs_theaetetus_0330
span: 194a
start_char: 107670
end_char: 108116
text_sha256: e54e9817e323834f0798d16028b6496cba91a657966b57709122e11c56f9f5ee
feature_family: craft_analogy
feature_label: wax_block_impression_mismatch
greek_terms: [ψευδῆ δόξαν, σημείω, αἴσθησιν, τοξότην, ἁμαρτεῖν]
observation: "Socrates identifies false opinion within the wax-block model as a mismatch between signs and present perceptions, compared to a poor archer missing the target."
textual_basis: "At 194a, Socrates describes having signs and perceptions but not fitting each sign to its proper perception, and he uses the archer image to mark the miss."
limits: "This records the positive mismatch case inside the model. It does not prove the model adequate or record the wider summary that follows."
review_status: accepted
```

## obs_theaetetus_0340

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0339` already records the possession-without-active-holding setup at `197c`; this record should avoid duplicating that and keep the relocation of the aviary into the soul.

```yaml
observation_id: obs_theaetetus_0340
span: 197d
start_char: 115328
end_char: 115740
text_sha256: f276a4731ba9bec1beed7b0341936927ad4ab86ec6b1c6aa03791c085e2458d1
feature_family: craft_analogy
feature_label: aviary_knowledge_possession_analogy
greek_terms: [ψυχαῖς, περιστερεῶνά, ὀρνίθων]
observation: "Socrates moves from the external bird-house comparison to an aviary placed in each soul, populated by many kinds of birds arranged in groups, small sets, and singly."
textual_basis: "At 197d, after Theaetetus accepts the availability of catching and releasing birds, Socrates proposes constructing an aviary in each soul with varied groupings of birds."
limits: "This records the cognitive image's placement and internal arrangement. It does not yet identify the birds as knowledges or explain false opinion."
review_status: accepted
```

## obs_theaetetus_0343

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0342` introduces arithmetic as the hunt for even and odd knowledges; `obs_theaetetus_0344` tests the arithmetician. This record should only capture the vocabulary assignment for transfer and possession.

```yaml
observation_id: obs_theaetetus_0343
span: 198b
start_char: 116465
end_char: 116877
text_sha256: c2516ede84124717c3c92b97b706e763afb9ffadf05eb74d12bf7965ae372a8a
feature_family: craft_analogy
feature_label: aviary_knowledge_possession_analogy
greek_terms: [ἐπιστήμας τῶν ἀριθμῶν, διδάσκειν, μανθάνειν, κεκτῆσθαι]
observation: "Socrates assigns teaching, learning, and knowing language to the transfer and possession of number-knowledges within the aviary model."
textual_basis: "At 198b, he says the art has number-knowledges to hand, hands them over to another, and names the giver as teaching, the receiver as learning, and the possessor as knowing by possession in the aviary."
limits: "This records terminology inside the analogy. It does not test whether possession is the same as active use."
review_status: accepted
```

## obs_theaetetus_0347

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0346` covers the first unwanted naming consequence; `obs_theaetetus_0348` begins the wrong-catch explanation. This record should sit between them as the rejection of the opposite wording and the retained possession/having distinction.

```yaml
observation_id: obs_theaetetus_0347
span: 199a
start_char: 118008
end_char: 118470
text_sha256: db35e934a5c24931f2893934f53d23e7f0e97ae20ccebae4f0ba2663ab9c9fc3
feature_family: elenchus
feature_label: false_dichotomy_rejected
greek_terms: [οὐκ ἐπίσταται, ἄλογον, ὀνομάτων, κεκτῆσθαι, ἔχειν, ψευδῆ δόξαν]
observation: "Theaetetus rejects the claim that the expert will count or read what he does not know, and Socrates sets aside the naming dispute while preserving the distinction between possessing knowledge and having it ready."
textual_basis: "At 199a, Theaetetus calls the opposite wording unreasonable. Socrates then says the names need not matter because the inquiry has already distinguished possession from active having, while still allowing false opinion about the object."
limits: "This records the rejection of the naming horns and the retained distinction. It does not yet explain the wrong-catch mechanism."
review_status: accepted
```

## obs_theaetetus_0349

Recommendation: split into accepted records.

Nearby pressure: `obs_theaetetus_0348` already records the wrong-catch mechanism, and `obs_theaetetus_0350` records the resulting objection. The split keeps the stated true/false outcome separate from the objection marker.

```yaml
observation_id: obs_theaetetus_0349
span: 199b-199c
start_char: 118470
end_char: 119324
text_sha256: 7288efc3693b39d03f0fd69cfc9fb2738a2409cf3706c0db5c0c5b6ec9410929
feature_family: definition_ladder
feature_label: false_judgment_named_as_outcome
greek_terms: [ἀψευδεῖν, τὰ ὄντα δοξάζειν, ἀληθῆ, ψευδῆ δόξαν]
observation: "The aviary model states its outcome rule: catching the intended knowledge yields true opinion, while missing and taking another knowledge yields false opinion."
textual_basis: "At 199b-199c, Socrates contrasts taking the intended knowledge with taking another in its place and says the account now permits both true and false opinion."
limits: "This records the model's stated outcome rule. It does not treat the model as accepted or record the more serious objection that follows."
review_status: accepted
```

```yaml
observation_id: obs_theaetetus_new_1
span: 199c
start_char: 118901
end_char: 119324
text_sha256: 2a6317ca21f34013ad5bb286e942d137a3e3c13e77cbaafdccd348eb27930f48
feature_family: definition_ladder
feature_label: definition_hedged_by_initial_concession
greek_terms: [ἀπηλλάγμεθα, μεταλλαγὴ, ψευδὴς δόξα]
observation: "Socrates says the aviary exchange account has escaped the earlier worry about not knowing what one knows, but then flags a more serious problem if false opinion is an exchange of knowledges."
textual_basis: "At 199c, Socrates marks the prior difficulty as avoided under possession language and immediately introduces a more troublesome condition tied to the exchange of knowledges."
limits: "This records the concession-plus-objection marker. The detailed objection is recorded in the next accepted observation."
review_status: accepted
```

## obs_theaetetus_0353

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0352` covers the immediate objection to the ignorance-bird repair; this record should start at `200a` only to capture the return-to-aporia and critic introduction.

```yaml
observation_id: obs_theaetetus_0353
span: 200a-200b
start_char: 120147
end_char: 120980
text_sha256: d9b9f7ff46b25e89896e9480c81dfe128380a5e8414a0d2a541f369add938b5a
feature_family: turn_geometry
feature_label: speaker_ventriloquism
greek_terms: [πρώτην ἀπορίαν, ἐλεγκτικός, γελάσας, ἐπιστήμην, ἀνεπιστημοσύνην]
observation: "Socrates says the inquiry has returned to its first impasse and voices an imagined elenctic critic who reposes the knowing and not-knowing alternatives for knowledge and ignorance."
textual_basis: "At 200a-200b, Socrates introduces a laughing critic in reported speech after the ignorance-bird repair fails, and the critic asks whether knowledge and ignorance are known together, not known, or mixed across known and unknown cases."
limits: "This is Socrates' hypothetical critic, not a new dramatic speaker. It does not include the regress continuation at the next marker."
review_status: accepted
```

## obs_theaetetus_0354

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0353` should carry the critic's introduction; this record should carry the regress pressure inside the critic's speech.

```yaml
observation_id: obs_theaetetus_0354
span: 200b-200c
start_char: 120548
end_char: 121399
text_sha256: ae3343679212b1801402c90629ce84410b07564fc9ebd0d184a569a589097954
feature_family: elenchus
feature_label: meta_knowledge_regress_objection
greek_terms: [ἐπιστῆμαι, ἀνεπιστημοσυνῶν, περιστερεῶσιν, κηρίνοις πλάσμασι, μυριάκις]
observation: "The imagined critic objects that adding further knowledges of knowledges and ignorances would send the account around the same problem repeatedly without progress."
textual_basis: "At 200b-200c, the critic asks whether knowledges of knowledges and ignorances must be enclosed in further aviaries or waxen models, and says this would force repeated circular motion."
limits: "This records the regress-style objection within the quoted critic's speech. It does not assess every possible metacognitive account."
review_status: accepted
```

## obs_theaetetus_0355

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0354` covers the critic's regress objection; this record should carry Socrates' methodological conclusion from that objection.

```yaml
observation_id: obs_theaetetus_0355
span: 200c-200d
start_char: 120980
end_char: 121764
text_sha256: 6ed95ee23e949e71b9b844dd1cbc6476df6d0dab41fb026d71a591f5d677893b
feature_family: elenchus
feature_label: knowledge_priority_argument
greek_terms: [ψευδῆ δόξαν, προτέραν, ἐπιστήμης, ἀδύνατον, ἱκανῶς]
observation: "Socrates concludes that the inquiry was wrong to seek false opinion before knowledge, because false opinion cannot be known before knowledge itself has been adequately grasped."
textual_basis: "At 200c-200d, after the critic's objection, Socrates asks whether the argument rightly rebukes the prior order of inquiry and states that the earlier target is impossible to know before knowledge has been sufficiently taken up."
limits: "This records the priority claim and reset pressure. It does not define knowledge."
review_status: accepted
```

## obs_theaetetus_0360

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0359` has already refuted true opinion alone through the courtroom case; this record should begin with Theaetetus' recollection of the received formula.

```yaml
observation_id: obs_theaetetus_0360
span: 201c-201d
start_char: 122946
end_char: 123765
text_sha256: f51fad1f3b28c92f9b7d9dc155997e8ce9d141c8640def32d127f309ddb688e9
feature_family: definition_ladder
feature_label: definition_introduced_as_received_opinion
greek_terms: [μετὰ λόγου, ἀληθῆ δόξαν, ἄλογον, ἐπιστητά, ἐπελελήσμην]
observation: "Theaetetus recalls a received definition according to which true opinion with an account is knowledge, while accountless true opinion is outside knowledge."
textual_basis: "At 201c-201d, after the courtroom counterexample, Theaetetus says he had forgotten something heard from someone else and then states the distinction between true opinion with an account and true opinion without an account."
limits: "This records the received definition as introduced by Theaetetus. It does not yet define account or test the formula."
review_status: accepted
```

## obs_theaetetus_0364

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0361` through `obs_theaetetus_0363` cover the dream account's element/composite contrast; this record should only complete the knowledge criterion and acceptance at `202c`.

```yaml
observation_id: obs_theaetetus_0364
span: 202c
start_char: 124911
end_char: 125316
text_sha256: b70caf7cbd63fc5de0e5eb677eca0dc08b5174cf6c03703964f40b717fe93ecc
feature_family: definition_ladder
feature_label: account_giving_as_knowledge_criterion
greek_terms: [ἄνευ λόγου, ἀληθῆ δόξαν, γιγνώσκειν, δοῦναί τε καὶ δέξασθαι λόγον, ἐπιστήμην]
observation: "Socrates completes the proposed criterion by saying that truth without an account is not knowledge, while adding an account leaves the subject fully disposed toward knowledge; Theaetetus accepts the formula."
textual_basis: "At 202c, Socrates contrasts true opinion without account with the ability to give and receive an account, then asks whether Theaetetus has heard the dream in this way and whether he accepts true opinion with account as knowledge."
limits: "This records acceptance at this stage of the inquiry. It does not show that the later examination will preserve the criterion."
review_status: accepted
```

## obs_theaetetus_0365

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0364` records the accepted criterion; `obs_theaetetus_0366` begins the letter-and-syllable test. This record is the hinge between provisional acceptance and objection.

```yaml
observation_id: obs_theaetetus_0365
span: 202d
start_char: 125316
end_char: 125719
text_sha256: 72ee7639f57a35e3f1f7b2e73a0809a83e2add1cdeb13279c094cdba134e813a
feature_family: definition_ladder
feature_label: definition_hedged_by_initial_concession
greek_terms: [ἐπιστήμη, λόγου, ὀρθῆς δόξης, ἀπαρέσκει, στοιχεῖα]
observation: "Socrates treats knowledge as true opinion with account as provisionally plausible, then immediately marks one troubling point in the element-and-syllable formulation."
textual_basis: "At 202d, Socrates asks whether they have found what many wise people sought, says knowledge without account and right opinion would be hard to identify, and then states that one part of the account displeases him."
limits: "This records a provisional concession followed by an objection marker. It does not state the objection's resolution."
review_status: accepted
```

## obs_theaetetus_0380

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0379` recalls the indivisible-form premise, and `obs_theaetetus_0381` records the final rejection at `205e`; this record should keep the `205d` consequence without duplicating the final rejection.

```yaml
observation_id: obs_theaetetus_0380
span: 205d
start_char: 131421
end_char: 131866
text_sha256: 3b7b393b7b066c0fb2e35fba72daf37d2c16001f5f64af38f1134e2891404a0f
feature_family: definition_ladder
feature_label: definition_yields_unwanted_consequence
greek_terms: [μονοειδές, ἀμέριστον, συλλαβὴ, στοιχεῖα, γνωσταὶ, ῥηταὶ]
observation: "Socrates says a partless syllable falls into the same form as the element, while a syllable made of many elements as a whole would make syllables and elements alike knowable and sayable."
textual_basis: "At 205d, Socrates identifies the partless syllable with the element's one-form status and then states that, if the syllable is many elements as a whole, the earlier part-whole result makes both syllables and elements knowable and sayable."
limits: "This records the two pressures as far as they are stated at 205d. The explicit final rejection of the element-syllable contrast follows in the next accepted record."
review_status: accepted
```

## obs_theaetetus_0387

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0386` rejects the vocal-expression sense and notes the transition; this record should widen enough to include the new answer-through-elements sense and the wagon illustration.

```yaml
observation_id: obs_theaetetus_0387
span: 206e-207a
start_char: 133913
end_char: 134670
text_sha256: 93f25199594d56c9571bb0fc36c2caae8cd967729eafdd712ca6b8cd6972dff4
feature_family: definition_ladder
feature_label: account_as_elemental_enumeration
greek_terms: [ἑκατὸν, δούραθ, ἁμάξης, τροχοί, ἄξων, ζυγόν]
observation: "After setting aside vocal expression as insufficient, Socrates introduces a second sense of account as answering what a thing is through its elements, illustrated by the wagon example."
textual_basis: "At 206e-207a, Socrates says the speaker may have meant the ability to answer through elements, then uses the wagon case by contrasting a partial parts list with a complete enumeration."
limits: "This records the proposed second sense and its first illustration. It does not yet state the expert-knower consequence or test the proposal."
review_status: accepted
```

## obs_theaetetus_0389

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0388` covers the letter-model analogy; this record should keep the wagon version of the account-as-enumeration consequence.

```yaml
observation_id: obs_theaetetus_0389
span: 207b-207c
start_char: 134670
end_char: 135508
text_sha256: 418a16c6223492da5f686115f9c4a26fd581db555dddd357fecaa8e63c761062
feature_family: definition_ladder
feature_label: account_as_elemental_enumeration
greek_terms: [λόγον, ἀληθεῖ δόξῃ, τεχνικόν, ἐπιστήμονα, στοιχείων, ὅλον]
observation: "Socrates states that completing the wagon as a whole through its elements would add account to true opinion and make the person expert and knowledgeable about the wagon."
textual_basis: "At 207b-207c, Socrates distinguishes correct but incomplete answers from expert speech and applies the point to the wagon: the person able to go through the full elemental account adds account to true opinion."
limits: "This records the promised function of elemental enumeration. It does not show that the proposal survives the following spelling test."
review_status: accepted
```

## obs_theaetetus_0402

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0401` sets up the knowledge-of-difference objection, and `obs_theaetetus_0403` records the aporetic closure. This record should bridge them by including the circular formula and full rejection list.

```yaml
observation_id: obs_theaetetus_0402
span: 210a-210b
start_char: 140479
end_char: 141279
text_sha256: 420d8ffe39be98de3c113bf8ff78cfee16a59cbc0b45a73fe1aa33def71273ad
feature_family: elenchus
feature_label: knowledge_priority_argument
greek_terms: [ἐπιστήμην, δόξα ὀρθὴ, διαφορότητος, αἴσθησις, λόγος]
observation: "Socrates states that the difference-account reading would define knowledge as correct opinion with knowledge of difference, making the account circular, and then rejects perception, true opinion, and true opinion with account as knowledge."
textual_basis: "At 210a-210b, Socrates formulates the circular answer and calls it foolish to define knowledge by adding knowledge while seeking knowledge; he then lists the three examined candidates as not being knowledge."
limits: "This records the final rejection of the examined definitions. It does not supply a replacement definition."
review_status: accepted
```

## obs_theaetetus_0404

Recommendation: split into accepted records.

Nearby pressure: `obs_theaetetus_0403` already records the aporetic midwifery closure at `210b`; the split keeps the stated effect of the examination separate from the claim about the craft's limited power and divine allotment.

```yaml
observation_id: obs_theaetetus_0404
span: 210b-210c
start_char: 140862
end_char: 141685
text_sha256: 3181fe0b9691e5c1e2ec8ca860dc0291fcec2b04971543447e1ed20e5bf446f4
feature_family: craft_analogy
feature_label: midwife_craft_effect
greek_terms: [ἐγκύμων, ἐξέτασιν, σωφρόνως]
observation: "Socrates says the present examination can improve Theaetetus' future intellectual pregnancy, or, if he is empty, make him less burdensome by not thinking he knows what he does not know."
textual_basis: "At 210b-210c, after the products of the inquiry are declared empty, Socrates describes the later effect of the present examination on either future pregnancy or empty confidence."
limits: "This records the stated effect of the examination. It does not by itself record the explicit limit of Socrates' craft."
review_status: accepted
```

```yaml
observation_id: obs_theaetetus_new_2
span: 210c
start_char: 141279
end_char: 141685
text_sha256: 99acd7038fbb1606cc29efccee9c753e79d1743b7ee7ee9b872d8e4a7f712547
feature_family: craft_analogy
feature_label: midwife_craft_claimed
greek_terms: [τέχνη, μαιείαν, ἐκ θεοῦ]
observation: "Socrates limits his craft to the stated effect and says that he and his mother received midwifery by divine allotment."
textual_basis: "At 210c, Socrates says his craft can do only this and no more, disclaims the possession of other knowledge, and assigns his midwifery and his mother's midwifery to a divine allotment."
limits: "This records Socrates' in-text claim about his practice. It does not verify the divine allotment outside the dialogue."
review_status: accepted
```
