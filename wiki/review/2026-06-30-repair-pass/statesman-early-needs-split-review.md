# Statesman early needs_split sidecar review

Scope: `obs_statesman_0002`, `0012`, `0035`, `0041`, `0042`,
`0065`, `0105`, `0121`, `0139`, `0147`, `0159`, `0161`, `0167`,
`0179`, `0180`, `0195`, `0196`, `0201`, `0202`, `0204`, `0208`.

Method: read `wiki/observations/statesman.md`; resolved current and
candidate spans with `resolveSourceSpan("statesman", span)` against
`raw/plato/greek/statesman.txt`; checked adjacent accepted and rejected
Statesman records for duplicate pressure. No translation files, Pioneer,
external model/provider runs, review queue, or segmented review commands were
used. This file is advisory only; no canonical `wiki/` or `raw/` file was
edited.

## obs_statesman_0002

Decision: accept with narrowed span. Keep only the opening project marker; do
not preserve the current claim that depends on external publication history.
Nearby `obs_statesman_0001` is already rejected for overextended dialogue
linking, and `obs_statesman_0003` covers the immediately following ranking
exchange.

```yaml
observation_id: obs_statesman_0002
span: 257a
start_char: 10
end_char: 350
text_sha256: a51ff07511473d0c25000a2893cc8f523b2571f82245da497917bd1856994e80
feature_family: dramatic_case_setup
feature_label: tripartite_dialogue_program
greek_terms: [τριπλασίαν, πολιτικὸν, φιλόσοφον]
observation: "At 257a Theodorus tells Socrates that his gratitude will become triple once the statesman and the philosopher have been worked out for him."
textual_basis: "The sentence connects triple gratitude with two further inquiry targets after Socrates thanks Theodorus for the present introductions."
limits: "This records only the dramatic projection of further work in the opening exchange. It does not claim that any later dialogue was completed or that the three figures have already been fully ranked."
review_status: accepted
```

## obs_statesman_0012

Decision: accept with widened span and relabel as a definitional division.
`obs_statesman_0010` already carries the form-language method at 258c and
`obs_statesman_0011` carries the responsibility negotiation, so this record
should start at the craft/knowledge distinction and include the marker where
the two branches are named.

```yaml
observation_id: obs_statesman_0012
span: 258d-258e
start_char: 2641
end_char: 3474
text_sha256: 55506e6d524a3751be3e827f1f85f2157088439c38f13696a488320fc4a9e9b5
feature_family: definition_ladder
feature_label: definition_by_dichotomous_division
greek_terms: ["ψιλαὶ τῶν πράξεών", "τὸ δὲ γνῶναι παρέσχοντο μόνον", πρακτικὴν, γνωστικήν]
observation: "At 258d-258e the Stranger divides knowledge by its relation to action, distinguishing knowledge-only arts from arts whose knowledge is joined to making, and then naming the two branches as practical and cognitive."
textual_basis: "The passage contrasts arithmetic and related arts with carpentry and handwork, then directs all knowledge to be divided into the two named branches."
limits: "This does not include the preceding one-form methodological program or the following question about whether political, royal, masterly, and household management names mark one art or many."
review_status: accepted
```

## obs_statesman_0035

Decision: split into two accepted records. The current record tries to carry
two examples of the same division error and the corrected alternatives. Nearby
`obs_statesman_0034` already covers the Stranger's announcement of the error,
and `obs_statesman_0036` covers the respondent's request for correction.

```yaml
observation_id: obs_statesman_new_1
span: 262c-262d
start_char: 10211
end_char: 11020
text_sha256: 83cd455712e25cdeef2e1a6a5622b17c0b227b260dc5c1df4cd6bd7bb22db15f
feature_family: definition_ladder
feature_label: false_dichotomy_by_asymmetric_partition
greek_terms: [Ἑλληνικὸν, βάρβαρον, γένος, κλήσει]
observation: "At 262c-262d the Stranger illustrates a faulty division by describing a split that isolates the Hellenic as one part and treats all other peoples as one kind because they receive one shared name."
textual_basis: "The example separates one named group from all others, then notes that the remaining groups are many and mutually discordant despite being gathered under a single designation."
limits: "This record covers only the human-group example. It does not include the number example or the later preferred alternatives."
review_status: accepted
```

```yaml
observation_id: obs_statesman_new_2
span: 262d-262e
start_char: 10619
end_char: 11433
text_sha256: 11ab7be592857ae8b93013ce499f33f4cea5251f336ebf400436af9447ab0279
feature_family: definition_ladder
feature_label: false_dichotomy_by_asymmetric_partition
greek_terms: [μυριάδα, εἶδος, γένος, ἀρτίῳ, περιττῷ, ἄρρενι, θήλει]
observation: "At 262d-262e the Stranger gives a second faulty division, cutting off a myriad from all numbers and treating the remainder as one kind, then contrasts that with dividing number by even and odd and humans by male and female."
textual_basis: "The passage first describes the one-sided number cut and the naming of the remainder, then states two more orderly alternatives for number and human classification."
limits: "This records the illustrative method contrast. It does not decide how the correction applies to every later division in the dialogue."
review_status: accepted
```

## obs_statesman_0041

Decision: accept with narrowed span and merged label. Nearby
`obs_statesman_0040` covers the species/part distinction and
`obs_statesman_0042` should carry the diagnosis of the earlier animal
division.

```yaml
observation_id: obs_statesman_0041
span: 263c
start_char: 12277
end_char: 12683
text_sha256: cf28e004ea558beb61cc7f4d5874d2d5df8d67dad55bbe4abd1fc563b2273f4a
feature_family: turn_geometry
feature_label: speaker_acknowledges_digression
greek_terms: [ἀποπλανήσεως]
observation: "At 263c the Stranger explicitly asks where the wandering-off began and uses that question to turn the discussion back to the earlier animal division."
textual_basis: "The passage names the wandering away and asks for its point of origin before recalling the prior division into humans and all other animals."
limits: "This record captures the discourse-management move only. It does not carry the substantive diagnosis of the division error."
review_status: accepted
```

## obs_statesman_0042

Decision: accept with widened span. The diagnosis begins in 263c and is
completed in 263d. The crane counterexample later in the widened span is
already separate duplicate pressure and should remain outside the prose.

```yaml
observation_id: obs_statesman_0042
span: 263c-263d
start_char: 12277
end_char: 13093
text_sha256: a2a9a1c0094005eeb30a4a9cf50f4f63cf3791e030f5c9b080a03065c7549218
feature_family: definition_ladder
feature_label: division_error_diagnosed
greek_terms: [μέρος, γένος, θηρία]
observation: "At 263c-263d the Stranger diagnoses the earlier animal division as removing the human part and then treating the remaining animals as one kind because they all received the same name."
textual_basis: "The passage recalls the two-part animal division, says the human part was removed, and explains that the rest appeared to be one kind only because a common animal name was applied to all of them."
limits: "This does not restate the preceding abstract species/part rule, and it does not include the later counterexample about a nonhuman classifier."
review_status: accepted
```

## obs_statesman_0065

Decision: accept with widened span and cleaned prose. The current span cuts the
Stranger's challenge before the claim that the account has not been fully
completed.

```yaml
observation_id: obs_statesman_0065
span: 267c-267d
start_char: 20579
end_char: 21421
text_sha256: 28c7138ce25dfe80de7ded50bd279de6ca09d42b721bb1969314aa43cb02a701
feature_family: turn_geometry
feature_label: assent_with_qualification_chain
greek_terms: [παντάπασι, "παντάπασιν ἱκανῶς", ἐλλείπει, τελέως]
observation: "At 267c-267d Young Socrates gives emphatic assent that the sought political branch has been reached, and the Stranger immediately challenges whether the proposed account has been stated sufficiently and fully completed."
textual_basis: "The exchange pairs the respondent's strong agreement with the Stranger's follow-up questions about sufficiency and completion."
limits: "This records the turn pattern and procedural challenge. It does not claim that the definition is finally refuted or that the dialogue has reached aporia."
review_status: accepted
```

## obs_statesman_0105

Decision: accept with widened span. `obs_statesman_0104` already covers the
purpose marker at 274b, and `obs_statesman_0106` covers the divine gift
catalogue beginning later, so keep this record to the vulnerability account.

```yaml
observation_id: obs_statesman_0105
span: 274b-274c
start_char: 35078
end_char: 35916
text_sha256: ed61e5f8db62ceb69105b8678e1c3a14357baad6aaf3396357237b0771d4e743
feature_family: myth_demarcation
feature_label: mythic_aetiology
greek_terms: [δαίμονος, ἐπιμελείας, ἀφύλακτοι, ἄτεχνοι, ἀπορίαις]
observation: "At 274b-274c the Stranger explains early human vulnerability after the caretaker daemon withdrew: wild animals became dangerous, humans were weak and unprotected, and they lacked the means and crafts needed for self-support."
textual_basis: "The passage links the loss of divine care with hostile animals, defenseless humans, lack of automatic food, lack of provisioning skill, and severe difficulty."
limits: "This records a mythic cause for the human condition. It does not evaluate the truth of the myth or include the following catalogue of divine gifts."
review_status: accepted
```

## obs_statesman_0121

Decision: accept with widened span and a sharper label. The sculptor analogy
is completed in 277b, where the Stranger applies it to the oversized myth.
`obs_statesman_0120` carries the corrected forcible/voluntary division and
`obs_statesman_0122` carries the joint-assent demand.

```yaml
observation_id: obs_statesman_0121
span: 277a-277b
start_char: 41054
end_char: 41817
text_sha256: 1e41480e3882edb2d9210a778922e9329df290c1897930f3d7ef4a3dcb9d1c2e
feature_family: craft_analogy
feature_label: craft_overextension_analogy
greek_terms: [ἀνδριαντοποιοὶ, σχῆμα, πλείω, μείζω, μύθου]
observation: "At 277a-277b the Stranger compares their overextended demonstration to sculptors who add too many and too large parts at the wrong moment, saying the king's figure is not yet complete."
textual_basis: "The analogy names sculptors adding more than needed, then applies the same fault to the use of an oversized myth in the current demonstration."
limits: "This records the craft analogy for excessive elaboration. It does not assess whether the myth is philosophically necessary or include the prior division of human care."
review_status: accepted
```

## obs_statesman_0139

Decision: accept with widened span. The current span reaches the clothing name
but cuts off the craft name, which appears at 280a. `obs_statesman_0137`
carries the full division tree, so this record should focus on the naming
terminus.

```yaml
observation_id: obs_statesman_0139
span: 279e-280a
start_char: 46410
end_char: 47129
text_sha256: ff6e5a98cdb2a5d95a901998e1e29c1b60227e006016dc9260ac45248dfe75a3
feature_family: definition_ladder
feature_label: naming_via_division_terminus
greek_terms: [ἱμάτια, ἐκαλέσαμεν, ἱματιουργικήν, ὑφαντικήν]
observation: "At 279e-280a the division reaches self-bound protective coverings, gives them a clothing name, and then names the craft that chiefly cares for them from that product, treating it here as weaving."
textual_basis: "The passage first names the product reached by the division, then names the supervising craft from the product and equates that craft name with weaving for the present purpose."
limits: "This records the naming endpoint. It does not restate the full preceding division tree or judge whether the craft name is adequate."
review_status: accepted
```

## obs_statesman_0147

Decision: accept with widened span but keep the prose narrow. The opening
division starts at 279c and continues into 279d. Nearby `obs_statesman_0145`
and `obs_statesman_0146` cover the weaving paradigm setup and procedure, while
`obs_statesman_0137` covers the later full tree.

```yaml
observation_id: obs_statesman_0147
span: 279c-279d
start_char: 45634
end_char: 46410
text_sha256: fb82b4c9daa0a317967d9a654e7eefca459b362523aca6bb9d0a6b453a40039d
feature_family: definition_ladder
feature_label: definition_by_dichotomous_division
greek_terms: [ποιεῖν, πάσχειν, ἀμυντήρια, ἀλεξιφάρμακα, προβλήματα]
observation: "At 279c-279d the Stranger begins the weaving paradigm division by separating things made or acquired for doing from defensive things against suffering, then starts subdividing the defensive branch."
textual_basis: "The passage states the first two branches for all made or acquired things and then divides defensive items into further classes."
limits: "This records the opening of the division only. It does not cover the paradigm proposal or the full later route to clothing."
review_status: accepted
```

## obs_statesman_0159

Decision: accept with widened span. The craft-dependence argument starts at
284a and is completed in 284b. `obs_statesman_0158` already carries the
twofold measurement distinction, and `obs_statesman_0171` covers the following
comparison with the prior dialogue.

```yaml
observation_id: obs_statesman_0159
span: 284a-284b
start_char: 55208
end_char: 56065
text_sha256: c21a583784ab491e2b6b2529cfc16f9e23a08ea474bc201a3b050db05a8d7adb
feature_family: craft_analogy
feature_label: craft_depends_on_due_measure
greek_terms: [τέχνας, πολιτικὴν, ὑφαντικὴν, μέτριον, πλέον, ἔλαττον, μέτρον]
observation: "At 284a-284b the Stranger argues that allowing greater and smaller only in relation to each other would destroy the crafts, including the political art and weaving, because such crafts preserve measure by guarding excess and deficiency in practice."
textual_basis: "The passage names the political art and weaving, says the argument would eliminate crafts and their works, and then states that these crafts produce good and fine results by preserving measure."
limits: "This records the craft-dependence argument. It does not restate the prior twofold measurement distinction or the later comparison with another inquiry."
review_status: accepted
```

## obs_statesman_0161

Decision: accept with widened span. The first measurement type begins in 283d
but the comparison is not complete until 283e. Nearby `obs_statesman_0160`
covers the act of dividing measurement into two parts.

```yaml
observation_id: obs_statesman_0161
span: 283d-283e
start_char: 54190
end_char: 55208
text_sha256: fc03812c4b0d2a1ed5a10bebfed6dc1a49a74a3a10b9a4dcc99e7fe017561c9c
feature_family: definition_ladder
feature_label: relative_measure_articulated
greek_terms: [μεῖζον, ἐλάττονος, τοὔλαττον, "τοῦ μείζονος"]
observation: "At 283d-283e the Stranger articulates relative measurement by asking whether the greater must be called greater only than the lesser and the lesser only than the greater."
textual_basis: "The passage sets up the first branch of measurement and receives assent to the paired greater-lesser relation before moving to the second standard."
limits: "This record covers only the relative measurement branch. It does not include the full later contrast with the due measure."
review_status: accepted
```

## obs_statesman_0167

Decision: accept with widened span. The current 271b span cuts off the
earthborn clause, which is completed at 271c. `obs_statesman_0089` already
covers the preceding age-reversal details.

```yaml
observation_id: obs_statesman_0167
span: 271b-271c
start_char: 28678
end_char: 29556
text_sha256: 80d24f20156ccb9552205ca23d00338d8c72a2c219e4048c411ad3fb7fff80a9
feature_family: myth_demarcation
feature_label: cosmic_reversal_physiology
greek_terms: [πρεσβύτας, παιδὸς, τετελευτηκότων, ἀναβιωσκομένους, γηγενεῖς]
observation: "At 271b-271c the Stranger extends the reversal of aging into a reversal of death and birth, saying the dead reassemble and revive from the earth and that earthborn beings follow necessarily from this reversed account."
textual_basis: "The passage moves from elders returning toward childhood to dead bodies in the earth being reconstituted and revived, then completes the account by naming earthborn generation."
limits: "This records the mythic physiology of reversal. It does not assert the truth of the cosmology or interpret its political significance."
review_status: accepted
```

## obs_statesman_0179

Decision: accept with widened span and sharper label. The self-critique begins
at 286b but is completed at 286c. `obs_statesman_0180` should carry the rule
that follows from this recollection.

```yaml
observation_id: obs_statesman_0179
span: 286b-286c
start_char: 59803
end_char: 60667
text_sha256: 66ea2328196db89aeca0e144639236e25a3245fc31f39e489ce0dc9ce78cf1fc
feature_family: turn_geometry
feature_label: speaker_self_critique_of_length
greek_terms: [μελέτη, μακρολογίαν, ὑφαντικὴν, ἀνείλιξιν, "μὴ ὄντος", μακρὰ]
observation: "At 286b-286c the Stranger recalls the participants' discomfort with lengthy discussions of weaving, cosmic unwinding, and the account of not-being, and says they reproached themselves over the risk of speaking needlessly and at length."
textual_basis: "The passage lists the three extended discussions, identifies concern over their length, and completes the point by describing self-reproach over unnecessary and lengthy speech."
limits: "This records the self-critique of discourse length. It does not decide whether the discussions were actually excessive and does not include the rule for future praise and blame."
review_status: accepted
```

## obs_statesman_0180

Decision: accept with widened span. The rule against judging length merely
against length completes at 286d. Nearby `obs_statesman_0181` already carries
the further priority of division by kinds.

```yaml
observation_id: obs_statesman_0180
span: 286c-286d
start_char: 60263
end_char: 61098
text_sha256: c05a0eb7709aaf2b34a6d420478900f931427288f4f957fd30066cb6aa018552
feature_family: turn_geometry
feature_label: methodological_program_declaration
greek_terms: [ψόγον, ἔπαινον, βραχύτητος, μήκους, πρέπον]
observation: "At 286c-286d the Stranger says future praise and blame of brevity and length should not judge lengths against one another, but should judge them by the relevant measure of fittingness."
textual_basis: "The passage explicitly joins praise and blame with brevity and length, rejects comparison of lengths with each other, and names fittingness as the relevant standard."
limits: "This record captures the negative rule and its immediate standard. It does not include the following ranking of method over speed, which is already accepted nearby."
review_status: accepted
```

## obs_statesman_0195

Decision: accept cleaned as a narrow remaining-candidate record. The following
records work through the candidate groups one by one, so do not widen this
record into the purchased-slave or free-service material.

```yaml
observation_id: obs_statesman_0195
span: 289c
start_char: 66483
end_char: 66918
text_sha256: e5cfa61154545190a318e2e01d465d6328983b865e7f08a469290ee3161d6d9b
feature_family: elenchus
feature_label: scope_delimitation
greek_terms: [ἀγελαιοτροφικὴ, δούλων, ὑπηρετῶν, συναίτιοι]
observation: "At 289c the Stranger leaves slaves and servants as the remaining field to examine after the herd-rearing division and the separation of co-causes, expecting the rivals to the king to become visible there."
textual_basis: "The passage says the prior herd-rearing division has taken in the tame-animal field except slaves, then identifies slaves and servants as what remains while setting aside the other co-causes."
limits: "This records the narrowing of the candidate field. It does not identify the purchased-slave group or the later free-service groups."
review_status: accepted
```

## obs_statesman_0196

Decision: reject as standalone. The marker is a transition to closer
examination and begins naming purchased persons, but the supported exclusion is
completed in accepted `obs_statesman_0197`.

```yaml
observation_id: obs_statesman_0196
span: 289d
start_char: 66918
end_char: 67285
text_sha256: bd047e34e92cb09220e082c25c2b5a42910f460325c963b2215e9c953225d868
feature_family: elenchus
feature_label: scope_delimitation
greek_terms: [βασιλικῆς, πολιτικῆς, ὑπηρέτας, ὠνητούς]
observation: "Reject as standalone: 289d only transitions from separated co-causes to a closer examination of the remaining servants and begins to name purchased persons."
textual_basis: "The marker says the remaining candidates should be examined more closely and starts to introduce the purchased group, but the explicit exclusion of slaves from royal craft is completed in the next accepted record."
limits: "Do not preserve this unless the ledger needs a transition-only record between the remaining-candidate setup and the accepted exclusion of slaves."
review_status: rejected
```

## obs_statesman_0201

Decision: accept with widened span. The priestly exchange starts at 290c and
is completed at 290d. `obs_statesman_0200` carries the diviner and priest
introduction, while `obs_statesman_0202` carries the civic office examples.

```yaml
observation_id: obs_statesman_0201
span: 290c-290d
start_char: 68529
end_char: 69341
text_sha256: 7226e1059fb3576c5d1e7287b39de5b0ed9f95754062c89f6b239008eb9b2b1c
feature_family: craft_analogy
feature_label: piety_service_exchange_analogy
greek_terms: [ἱερέων, θυσιῶν, εὐχαῖς, "διακόνου τέχνης"]
observation: "At 290c-290d the Stranger presents the priestly class as skilled in giving human gifts to gods through sacrifices and asking goods from gods through prayers, classifying both actions as parts of a serving craft."
textual_basis: "The passage introduces the priestly class, describes the two directions of exchange, and then classifies both as parts of service."
limits: "This records the assigned priestly service function. It does not identify priesthood with political craft or include the later examples of priestly status attached to ruling offices."
review_status: accepted
```

## obs_statesman_0202

Decision: accept cleaned. The Egyptian and Greek examples perform one textual
function: they show civic overlap between priestly status and high office.
`obs_statesman_0201` already carries the exchange-service definition.

```yaml
observation_id: obs_statesman_0202
span: 290e
start_char: 69341
end_char: 69763
text_sha256: 3fb8c90de07f801b083b9a53360e84672a70673b6f58f6b8cca6d464c53e9b02
feature_family: prosopography
feature_label: figures_or_types_as_evidence
greek_terms: [βασιλέα, ἱερατικῆς, ἀρχαῖς, "ἀρχαίων θυσιῶν"]
observation: "At 290e the Stranger gives civic examples in which priestly function attaches to high office, including Egyptian kingship and Greek offices responsible for major sacrifices."
textual_basis: "The passage says Egyptian kings may not rule apart from priesthood, then adds Greek cases where major sacrifices are assigned to major offices, including the local lot-drawn king's ancestral sacrifices."
limits: "This records examples used for comparison. It does not prove that priesthood is the same art as statesmanship."
review_status: accepted
```

## obs_statesman_0204

Decision: accept with widened span. The typological crowd description begins
at 291a and continues into 291b. `obs_statesman_0203` carries the procedural
announcement, and `obs_statesman_0205` carries the later identification of the
chief sophistic rival.

```yaml
observation_id: obs_statesman_0204
span: 291a-291b
start_char: 69763
end_char: 70542
text_sha256: 049e60ceef6bec96b7e9f679af874b4b4228102d1d59264d5979e526e37fb320
feature_family: prosopography
feature_label: figures_or_types_as_evidence
greek_terms: [πάμφυλόν, λέουσι, Κενταύροις, Σατύροις, ἰδέας, δύναμιν]
observation: "At 291a-291b the Stranger characterizes the remaining political crowd as many-formed, comparing its members to mixed or shifting types and saying they quickly exchange forms and powers with one another."
textual_basis: "The passage first introduces a very numerous and many-formed crowd, then gives a sequence of type-comparisons and states that their forms and powers change rapidly into one another."
limits: "This records the typological imagery. It does not identify the crowd with the sophistic rival, which is stated in the next accepted record."
review_status: accepted
```

## obs_statesman_0208

Decision: accept cleaned. `obs_statesman_0206` and `obs_statesman_0207` carry
the constitutional naming setup, and `obs_statesman_0210` carries the
replacement criterion. This record should keep the question that places the
external criteria under review.

```yaml
observation_id: obs_statesman_0208
span: 292a
start_char: 71758
end_char: 72170
text_sha256: 6c0cf4b7d64743011c2f8c826ddead47571155ff658115049d86fb3394ceaf26
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: [πολιτειῶν, ὅροις, βιαίῳ, ἑκουσίῳ, γραμμάτων, νόμων]
observation: "At 292a the Stranger asks whether any constitution is correctly bounded by the familiar external criteria of one, few, or many rulers; wealth or poverty; force or willingness; and written law or lawlessness."
textual_basis: "The passage first notes that democracy keeps the same name despite variations in force, willingness, and law observance, then asks whether any constitution can be correctly defined by the listed boundaries."
limits: "This records the criteria being put under question. It does not state the replacement criterion, which is introduced later."
review_status: accepted
```
