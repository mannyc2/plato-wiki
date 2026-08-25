# Theaetetus Early Needs-Split Review

Method: inspected `wiki/observations/theaetetus.md`, checked same-span and nearby accepted or rejected records for duplicate pressure, and resolved every recommended span with `resolveSourceSpan("theaetetus", span)` against `raw/plato/greek/theaetetus.txt`. No translations, Pioneer, review queue, segmented review, external LLMs, or provider-backed harness runs were used.

## obs_theaetetus_0005

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0002` already records the broader written-dialogue frame and `obs_theaetetus_0003` already records memory and correction. This record should keep only the editorial conversion of narrated speech into direct dialogue.

```yaml
observation_id: obs_theaetetus_0005
span: 143c
start_char: 2196
end_char: 2577
text_sha256: 732e2b068833a85be5b85bf2295942f48a4c393667a5b20d84f1095a90255aef
feature_family: frame_depth
feature_label: direct_dialogue_conversion
greek_terms: [διηγήσεις, ἔγραψα, ἐξελὼν]
observation: "Euclides says he removed intervening narrator formulae and wrote the exchange as Socrates speaking directly with the interlocutors."
textual_basis: "At 143c, Euclides names the intervening reports between speeches, gives examples involving the speaker and respondent, and says he wrote the conversation directly after removing such material."
limits: "This records an editorial frame device. It does not repeat the earlier memory-and-correction procedure or evaluate the reliability of the written account."
review_status: accepted
```

## obs_theaetetus_0006

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0005` should cover the direct-dialogue conversion; `obs_theaetetus_0002` already covers the broader book frame. This record should keep only the in-frame reading setup.

```yaml
observation_id: obs_theaetetus_0006
span: 143c
start_char: 2196
end_char: 2577
text_sha256: 732e2b068833a85be5b85bf2295942f48a4c393667a5b20d84f1095a90255aef
feature_family: frame_depth
feature_label: written_text_read_aloud
greek_terms: [παῖ, βιβλίον, λέγε]
observation: "Euclides hands the written text to a servant and commands him to read it aloud, making the main dialogue a performed reading inside the frame."
textual_basis: "At 143c, after Terpsion accepts the editorial method, Euclides addresses the servant, refers to the book, and commands the reading."
limits: "This records the reading arrangement in the frame. It does not describe Euclides' earlier composition procedure or the content of the embedded conversation."
review_status: accepted
```

## obs_theaetetus_0011

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0001` already records the wounded Theaetetus frame encounter, and `obs_theaetetus_0002` records the written dialogue frame. This record should keep the intermediate oral-transmission layer from Socrates to Euclides.

```yaml
observation_id: obs_theaetetus_0011
span: 142c-142d
start_char: 670
end_char: 1365
text_sha256: a4008dfa9faf3528bd323743a51d9d8b0e9488c7437b8aa8a0d2fd9a1eb76979
feature_family: frame_depth
feature_label: reported_dialogue_frame
greek_terms: [διηγήσατο, λόγους, ἀπὸ στόματος]
observation: "Euclides says Socrates once recounted to him the speeches from the earlier conversation with Theaetetus, and Terpsion asks whether Euclides can recount them."
textual_basis: "At 142c-142d, Euclides recalls Socrates' earlier encounter with Theaetetus, says Socrates later recounted the speeches to him, and answers Terpsion's request by denying that he can give them orally from memory."
limits: "This records a transmission layer in the frame. It does not include the later written-redaction procedure or the earlier wounded-arrival scene."
review_status: accepted
```

## obs_theaetetus_0013

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0001` already records the wounded military return, while `obs_theaetetus_0009` and `obs_theaetetus_0010` record the later physical and character portraits. This record should keep Socrates' reported youth appraisal and prediction.

```yaml
observation_id: obs_theaetetus_0013
span: 142c-142d
start_char: 670
end_char: 1365
text_sha256: a4008dfa9faf3528bd323743a51d9d8b0e9488c7437b8aa8a0d2fd9a1eb76979
feature_family: prosopography
feature_label: character_description_by_speaker
greek_terms: [μειρακίῳ, φύσιν, ἐλλόγιμον]
observation: "Euclides reports that Socrates admired Theaetetus' nature when Theaetetus was a youth and predicted that he would become distinguished if he reached maturity."
textual_basis: "At 142c-142d, Euclides attributes to Socrates both an admiration of Theaetetus' nature after conversation and a prediction about his future distinction."
limits: "This records the reported character appraisal. It does not repeat the military-return frame or assess the truth of the prediction."
review_status: accepted
```

## obs_theaetetus_0039

Recommendation: reject as standalone.

Nearby pressure: `obs_theaetetus_0038` already records midwifery's expert craft domains, including matchmaking, and `obs_theaetetus_0040` already records drugs and incantations. The remaining type-characterization is not enough for a separate prosopography record.

```yaml
observation_id: obs_theaetetus_0039
span: 149d-149e
start_char: 14466
end_char: 15232
text_sha256: 72fea7d637aa228656c1545165e06da1a8ea3ab792221b9016e678a9900570b3
feature_family: prosopography
feature_label: figures_or_types_as_evidence
greek_terms: [μαῖαι, προμνήστριαι, πάσσοφοι]
observation: "Socrates characterizes midwives as especially skilled matchmakers who know how to pair women and men for the best children."
textual_basis: "At 149d-149e, the passage assigns matchmaking expertise to midwives and compares that expertise with other parts of their craft."
limits: "Reject as standalone because the accepted craft-analogy record already captures this midwifery domain, and the passage is not introducing a distinct named figure or social role."
review_status: rejected
```

## obs_theaetetus_0046

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0044` already records the mathematical dichotomy, and `obs_theaetetus_0045` was rejected as an unnecessary analogy record. This record should keep only the embedded report of a prior collaborative inquiry.

```yaml
observation_id: obs_theaetetus_0046
span: 147d-148a
start_char: 10536
end_char: 11716
text_sha256: fae468701f52237220be57580aacf4832d71b405c54071114598596144bf7ffd
feature_family: frame_depth
feature_label: embedded_report_narrative
greek_terms: [διαλεγομένοις, ὁμωνύμῳ, λέγε]
observation: "Theaetetus reports a prior inquiry conducted with the younger Socrates, and the present Socrates prompts him to narrate its result."
textual_basis: "At 147d-148a, Theaetetus names the companion, describes what the pair attempted after Theodorus' lesson, and then gives the classification after Socrates' prompt."
limits: "This records the embedded report structure. It does not duplicate the mathematical classification itself or treat the companion's identity as a separate prosopographic claim."
review_status: accepted
```

## obs_theaetetus_0071

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0070` already records the broad motion-rest antithesis, and `obs_theaetetus_0072` records the evidential marker. This record should keep the body-soul parallel that requires `153c` to complete the soul side.

```yaml
observation_id: obs_theaetetus_0071
span: 153b-153c
start_char: 22079
end_char: 22883
text_sha256: 78464fb7123bfe02355317b151fa5fdde3587cf701636a215f0ffa78955bedbe
feature_family: craft_analogy
feature_label: physical_mental_parallel_drawn
greek_terms: [γυμνασίων, κινήσεως, ἡσυχίας, ἀμελετησίας]
observation: "Socrates draws a structural parallel between bodily condition and psychic condition: exercise and motion preserve the body, while learning and practice preserve and improve the soul."
textual_basis: "At 153b-153c, Socrates first contrasts bodily preservation through exercise and motion with bodily destruction through rest and idleness, then applies the same motion-rest pattern to learning, practice, and ignorance in the soul."
limits: "This records the stated parallel. It does not decide whether the larger motion thesis is true or whether the parallel proves that thesis."
review_status: accepted
```

## obs_theaetetus_0094

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0093` already records the myth boundary at `156c`; this record should keep the proposition extracted from that account and the speed-slowness condition that continues into `156d`.

```yaml
observation_id: obs_theaetetus_0094
span: 156c-156d
start_char: 28765
end_char: 29541
text_sha256: 5651a6197eae620c6455a92adf162550e46db0687971c879fbf1c9381b1f2333
feature_family: definition_ladder
feature_label: hypothesis_condition_stated
greek_terms: [μῦθος, κινεῖται, τάχος, βραδυτὴς]
observation: "Socrates restates the account as a kinetic hypothesis: all the relevant things are in motion, and their motion includes speed and slowness."
textual_basis: "At 156c-156d, after asking what the preceding account means, Socrates says it means that all these things move and immediately begins distinguishing slow and fast motion."
limits: "This records the hypothesis restatement and the beginning of its internal distinction. It does not decide whether the hypothesis is accepted or refuted later."
review_status: accepted
```

## obs_theaetetus_0125

Recommendation: accept cleaned and narrowed/widened record.

Nearby pressure: `obs_theaetetus_0124` already records perception as begetting, and `obs_theaetetus_0126` records non-repeatability. This record should move to `160a-160b`, where the relational necessity is stated and completed.

```yaml
observation_id: obs_theaetetus_0125
span: 160a-160b
start_char: 36607
end_char: 37509
text_sha256: 5dbd0acfd8ce905d0626c9b3038d3958efb7b4f3cd36d78d704185957e946e31
feature_family: relational_necessity
feature_label: perceiver_must_perceive_something
greek_terms: [ἀνάγκη, τινὸς γίγνεσθαι, ἀδύνατον γίγνεσθαι]
observation: "Socrates states that when a perceiver becomes perceiving, the perceiver must become perceiving of something; perceiving nothing is ruled out."
textual_basis: "At 160a-160b, the argument uses necessity language for the perceiver's relation to an object and then states that becoming perceiving while perceiving nothing is impossible."
limits: "This records the relational condition for perception within the local account. It does not assess the account's validity or include the broader reciprocal-being conclusion that follows."
review_status: accepted
```

## obs_theaetetus_0159

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0158` already records the procedural redirect at `163a`, and `obs_theaetetus_0160` should record Theaetetus' narrowed reply. This record should keep only Socrates' two counterexamples.

```yaml
observation_id: obs_theaetetus_0159
span: 163b
start_char: 43342
end_char: 43832
text_sha256: 3f438867b409b14f7a7dc8bee83c96f6144ad95170b718d3339b9ed360da8854
feature_family: elenchus
feature_label: counterexample_via_sensory_cognition
greek_terms: [ἀκούειν, ἐπίστασθαι, γράμματα]
observation: "Socrates tests the identification of knowledge with perception by asking whether hearing an unfamiliar language or seeing unknown letters should count as knowledge."
textual_basis: "At 163b, Socrates presents the hearing case and the letter-seeing case as questions about whether perception should be treated as knowing."
limits: "This records the counterexample setup. It does not include Theaetetus' narrowing reply or judge whether the counterexamples defeat the thesis."
review_status: accepted
```

## obs_theaetetus_0160

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0159` should keep Socrates' counterexample setup. This record should keep the respondent's qualification, which continues into `163c`.

```yaml
observation_id: obs_theaetetus_0160
span: 163b-163c
start_char: 43342
end_char: 44173
text_sha256: 645d069a5507554a62573c3abf8b67d6ec6700908ad1c79e1c26f8b676ddf142
feature_family: definition_ladder
feature_label: thesis_narrowed_under_pressure
greek_terms: [ὁρῶμέν, ἀκούομεν, σχῆμα, χρῶμα, ὀξύτητα, βαρύτητα]
observation: "Theaetetus qualifies the knowledge-as-perception thesis by saying that in such cases one knows only the perceptible aspect, not what a teacher or interpreter would teach about it."
textual_basis: "At 163b-163c, after Socrates' examples, Theaetetus distinguishes what is seen or heard from what requires instruction about letters or speech."
limits: "This records the narrowing move. It does not claim that the revised thesis succeeds or that it remains stable under later questioning."
review_status: accepted
```

## obs_theaetetus_0163

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0162` already records Socrates' prosopopoeia. This record should keep the procedural rule within the impersonated speech, which is completed at `166b`.

```yaml
observation_id: obs_theaetetus_0163
span: 166a-166b
start_char: 49109
end_char: 50013
text_sha256: 87039fd25b3722e2dd7ba5a9489d8701e86c0fef801ad2643a561ebb80ccf2f1
feature_family: turn_geometry
feature_label: absent_interlocutor_refutation_rule
greek_terms: [δι' ἐρωτήσεως, ἀποκρινάμενος, σφάλληται, ἐλέγχομαι]
observation: "The impersonated Protagoras states a rule for testing an absent speaker: the absent speaker is refuted only if the respondent answers as that speaker would and then goes wrong."
textual_basis: "At 166a-166b, the impersonated speech distinguishes a respondent who answers as Protagoras would from one who answers differently, assigning refutation accordingly."
limits: "This records the stated procedural rule inside Socrates' impersonation. It does not decide whether the rule is followed or whether it represents the historical Protagoras."
review_status: accepted
```

## obs_theaetetus_0192

Recommendation: accept cleaned and narrowed record.

Nearby pressure: `obs_theaetetus_0191` already records the Pindar citation, and `obs_theaetetus_0193` records the philosopher type. This record should keep the named Thales example.

```yaml
observation_id: obs_theaetetus_0192
span: 174a
start_char: 66102
end_char: 66511
text_sha256: db8b8e5c8102c89716988874db6d9e0f0bfa037f36f853a44da22d2b04e6d25c
feature_family: prosopography
feature_label: historical_exemplum_in_argument
greek_terms: [Θαλῆν, Θρᾷττά, φρέαρ, σκῶμμα]
observation: "Socrates uses Thales as a named example of the philosopher who attends to heavenly things while missing what lies nearby."
textual_basis: "At 174a, Socrates names Thales, describes his fall into a well while looking upward, and reports the servant's mockery before generalizing the joke."
limits: "This records the named exemplum. It does not assess the anecdote's historical accuracy or repeat the preceding Pindar citation."
review_status: accepted
```

## obs_theaetetus_0207

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0206` already records the correction of common opinion about injustice's penalty. This record should start at the answer naming the paradigms and include `177a`, where the likeness consequence is completed.

```yaml
observation_id: obs_theaetetus_0207
span: 176e-177a
start_char: 71997
end_char: 72694
text_sha256: 92facc0d4389151872de3fd1a3ad0caf2a9fe6cb2bef6c3fa456da24e4ee2db8
feature_family: forms_trajectory
feature_label: two_paradigms_contrasted
greek_terms: [παραδειγμάτων, ἐν τῷ ὄντι ἑστώτων, θείου, ἀθέου, ὁμοιούμενοι]
observation: "Socrates contrasts two paradigms standing in being: a divine and happiest paradigm and a godless and most wretched paradigm, with unjust people unknowingly becoming like the latter."
textual_basis: "At 176e-177a, Socrates answers the question about the inescapable penalty by naming the two paradigms and then says the unjust fail to see their likeness relation to them."
limits: "This records the paradigm contrast and the stated likeness consequence. It does not claim that these paradigms are technical Forms or evaluate the ethics of the argument."
review_status: accepted
```

## obs_theaetetus_0219

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0218` already records the necessity that evils remain around mortal nature. This record should start at `176a` and include `176b`, where the flight formula and god-likeness explanation are completed.

```yaml
observation_id: obs_theaetetus_0219
span: 176a-176b
start_char: 70284
end_char: 71138
text_sha256: b0a1123285e058fff65f390aa55d96f9c672285463ad08a1b01f0e0b64138c52
feature_family: closure_type
feature_label: ethical_exhortation
greek_terms: [ἐνθένδε, ἐκεῖσε, φεύγειν, ὁμοίωσις θεῷ]
observation: "Socrates draws an exhortation from the necessity of evils: one must try to flee from here to there as quickly as possible, and this flight is becoming like god as far as possible."
textual_basis: "At 176a-176b, after stating that evils cannot be destroyed and are not among the gods, Socrates gives the practical consequence and defines the flight in terms of god-likeness."
limits: "This records the exhortation structure. It does not treat the flight as literal travel or resolve the metaphysical status of god-likeness."
review_status: accepted
```

## obs_theaetetus_0240

Recommendation: accept cleaned and widened record.

Nearby pressure: `obs_theaetetus_0239` already records the linguistic refutation of the flux thesis, and `obs_theaetetus_0241` records Theodorus' release from answering. This record should keep Socrates' phase-boundary statement at `183b-183c`.

```yaml
observation_id: obs_theaetetus_0240
span: 183b-183c
start_char: 85204
end_char: 86088
text_sha256: 3c36262cbd28744009e726666ffeda418fcc7c73cdac985e9feebdb5ef67a220
feature_family: closure_type
feature_label: argument_unit_transition
greek_terms: [ἀπηλλάγμεθα, μέτρον, συγχωροῦμεν, αἴσθησιν]
observation: "Socrates marks release from Theodorus' companion while stating that the measure doctrine and the identification of knowledge with perception have not been conceded under the universal-motion method."
textual_basis: "At 183b-183c, Socrates says they are released from the companion, refuses the measure claim unless qualified by wisdom, and refuses the knowledge-perception identification under the motion method."
limits: "This records an argument-unit transition. It does not evaluate the success of the preceding refutation or include Theodorus' later procedural release."
review_status: accepted
```

## obs_theaetetus_0260

Recommendation: reject as standalone.

Nearby pressure: `obs_theaetetus_0256` already records the soul/organ contrast for common terms at `185c-185d`, and `obs_theaetetus_0257` already records the catalog. The current `185a-185b` span sets up the question but does not yet support the claim that the soul grasps common terms through itself.

```yaml
observation_id: obs_theaetetus_0260
span: 185a-185b
start_char: 88965
end_char: 89818
text_sha256: f121c969356750fbe08a3bfd3ef5edca6200ba093b4eb37601f976f25b3f978c
feature_family: forms_trajectory
feature_label: soul_grasps_common_terms
greek_terms: [κοινὸν, διανοῇ]
observation: "Socrates asks Theaetetus to consider features common to sound and color, including being, difference, sameness, number, likeness, and unlikeness."
textual_basis: "At 185a-185b, the exchange moves from the separation of hearing and sight to questions about what one thinks concerning both sound and color."
limits: "Reject as standalone because the accepted later records already capture the common-term catalog and the soul-without-organ distinction, while this span alone does not support the stronger soul-grasp claim."
review_status: rejected
```

## obs_theaetetus_0261

Recommendation: accept cleaned record.

Nearby pressure: `obs_theaetetus_0259` already records the premise separating sense domains, and `obs_theaetetus_0260` should be rejected as duplicative. This record should keep the local assent cadence.

```yaml
observation_id: obs_theaetetus_0261
span: 185a-185b
start_char: 88965
end_char: 89818
text_sha256: f121c969356750fbe08a3bfd3ef5edca6200ba093b4eb37601f976f25b3f978c
feature_family: elenchus
feature_label: assent_chain
greek_terms: [πῶς γὰρ οὐκ ἐθελήσω, οὐ γὰρ οὖν, ἔγωγε, τί μήν, καὶ τοῦτο, ἴσως]
observation: "Theaetetus gives a sequence of short assents as Socrates moves from the separation of sense domains to common features considered about both sound and color."
textual_basis: "At 185a-185b, Theaetetus repeatedly answers with brief affirmations as Socrates advances through the sense-domain premise, being, difference, sameness, number, and likeness."
limits: "This records the turn pattern. It does not claim that the assents establish the later soul-without-organ conclusion or evaluate the argument's validity."
review_status: accepted
```
