# Cratylus early needs_split sidecar review

Scope: `obs_cratylus_0023`, `0040`, `0082`, `0099`, `0102`,
`0113`, `0125`, `0131`, `0136`, `0140`, `0149`, `0156`,
`0158`, `0162`, `0167`, `0170`.

Method: read `wiki/observations/cratylus.md`; resolved current and
candidate spans with `resolveSourceSpan("cratylus", span)` against
`raw/plato/greek/cratylus.txt`; checked adjacent Cratylus records for
duplication pressure. No translation files, provider-backed runs, Pioneer, or
non-dry-run review commands were used. This file is advisory only; no
canonical `wiki/` or `raw/` file was edited.

Format flags:

- Current blocks with scalar-indicator placeholders to clean up:
  `obs_cratylus_0040` (`|`), `obs_cratylus_0099` (`|`),
  `obs_cratylus_0125` (`>`), `obs_cratylus_0131` (`|`),
  `obs_cratylus_0136` (`>-`), `obs_cratylus_0140` (`|`),
  `obs_cratylus_0170` (`>`).
- Parsed `greek_terms` values in this target set did not contain literal
  bullet prefixes, `|`, `>`, `>-`, or romanized term strings. Some current
  `english_gloss` values contain romanization, but replacement records below do
  not carry `english_gloss`.

## obs_cratylus_0023

Decision: reject as standalone. The supported content is already covered by
accepted `obs_cratylus_0022` / `obs_cratylus_0024` for the natural action
criterion and `obs_cratylus_0025` for the speaking/naming transfer.

```yaml
observation_id: obs_cratylus_0023
span: 387b
start_char: 7089
end_char: 7459
text_sha256: 5af2d338cbc690e985e301742e03e07247bf06d11a2a4966c4273b1e5060d6f8
feature_family: craft_analogy
feature_label: craft_what_to_whom_sequence
greek_terms: [τὸ λέγειν, πράξεών]
observation: "Reject as standalone: 387b supports only the local step that speaking is classified as an action under the natural-correctness pattern."
textual_basis: "The terms τὸ λέγειν and πράξεών support the speaking-as-action step, but the nature/opinion criterion and the naming transfer are already separately accepted nearby."
limits: "Do not preserve a duplicate record unless the ledger explicitly wants a separate speaking-only bridge record."
review_status: rejected
```

## obs_cratylus_0040

Decision: accept with narrowed span and cleaned prose. Remove Callias and
Protagoras details; those are at 391c and are already covered by accepted
`obs_cratylus_0049`.

Current flags: `observation: |`, `textual_basis: |`, `limits: |`.

```yaml
observation_id: obs_cratylus_0040
span: 391b
start_char: 14441
end_char: 14881
text_sha256: d1664bddc2adfb23b4de533e9edd3bfb336db9cb0e2ba021dfd8a987f782ec08
feature_family: prosopography
feature_label: sophists_named_by_trade
greek_terms: [σοφισταί, ἐπισταμένων, χρήματα]
observation: "At 391b Socrates identifies the sophists as the knowledgeable paid class to consult about name-correctness."
textual_basis: "The inquiry is directed to the ἐπισταμένων, and Socrates names the σοφισταί while mentioning payment and gratitude."
limits: "This records the professional class named in the passage; it does not include the 391c Callias/Protagoras material or decide whether the recommendation is sincere."
review_status: accepted
```

## obs_cratylus_0082

Decision: accept with widened span. The current span cuts off the sudden-wisdom
claim before the explicit completion at 396d.

```yaml
observation_id: obs_cratylus_0082
span: 396c-396d
start_char: 25178
end_char: 25979
text_sha256: cdb61a6521795c3c08eaf193f6d7747814afbedb2a7c72fe477a3c28a4ccd478
feature_family: irony_marker
feature_label: socratic_self_deprecation
greek_terms: [σοφίας, ἐξαίφνης, προσπέπτωκεν, ἐνθουσιῶντες]
observation: "At 396c-396d Socrates describes his etymological fluency as a sudden wisdom whose persistence or failure remains to be tested, and Hermogenes likens the performance to inspired utterance."
textual_basis: "The 396c σοφίας / ἐξαίφνης phrasing is completed by 396d προσπέπτωκεν, followed by Hermogenes' comparison to ἐνθουσιῶντες."
limits: "This records an in-text self-characterization and response; it does not decide whether the etymologies are sincere, inspired, or intentionally comic."
review_status: accepted
```

## obs_cratylus_0099

Decision: accept with widened span. The Tethys derivation starts in 402c and
is completed in 402d.

Current flags: `observation: |`, `textual_basis: |`, `limits: |`.

```yaml
observation_id: obs_cratylus_0099
span: 402c-402d
start_char: 37225
end_char: 37969
text_sha256: 8b72f5deeee5fd2b7ae02e37bf089b7916d6912f8348610a7da3e726a1a1f8b5
feature_family: etymology_method
feature_label: etymology_by_phonetic_gloss
greek_terms: [Τηθύς, πηγῆς, διαττώμενον, ἠθούμενον]
observation: "At 402c-402d Socrates treats Tethys as a concealed spring-name formed from terms for straining-through and filtering."
textual_basis: "The derivation links Τηθύς with πηγῆς, διαττώμενον, and ἠθούμενον across the marker boundary."
limits: "This records the local phonetic-gloss procedure; it does not assess linguistic validity or the larger Heraclitean argument."
review_status: accepted
```

## obs_cratylus_0102

Decision: accept with cleaned terms and prose.

```yaml
observation_id: obs_cratylus_0102
span: 401e-402a
start_char: 36168
end_char: 36829
text_sha256: 916036e27847180d8d79b81d89b5bc257c90dc15e1265c225cd83cac812bc1d2
feature_family: etymology_analysis
feature_label: etymology_supported_by_philosophical_doctrine
greek_terms: [σμῆνος σοφίας, Ἡράκλειτον, Ῥέαν, Κρόνον, πάντα χωρεῖ]
observation: "At 401e-402a Socrates connects the analysis of Rhea and Kronos with Heraclitean flux doctrine."
textual_basis: "The passage introduces a σμῆνος σοφίας, names Ἡράκλειτον, and applies flux language to Ῥέαν and Κρόνον."
limits: "This records the cited doctrinal support inside the etymological analysis; it does not claim Plato endorses the doctrine or the etymology."
review_status: accepted
```

## obs_cratylus_0113

Decision: accept with narrowed span and cleaned prose. Drop the incomplete
alternative account, which continues past 402e.

```yaml
observation_id: obs_cratylus_0113
span: 402e
start_char: 37969
end_char: 38325
text_sha256: 5092cb7ec548f29fbc90f25351832390591741da1f88a532d33ce22dc9d89b47
feature_family: etymological_decomposition
feature_label: phonetic_adjustment_for_elegance
greek_terms: [Ποσειδῶνα, ποσίδεσμον, ε, εὐπρεπείας]
observation: "At 402e Socrates adds that the epsilon in the Poseidon derivation is inserted for euphony."
textual_basis: "The Poseidon / ποσίδεσμον derivation is followed by the explicit ε and εὐπρεπείας note."
limits: "This records only the euphonic insertion within the Poseidon etymology; it does not choose between later alternative derivations."
review_status: accepted
```

## obs_cratylus_0125

Decision: accept with span adjusted to complete the Leto/Letho clause.

Current flags: `observation: >`, `textual_basis: >`, `limits: >`.

```yaml
observation_id: obs_cratylus_0125
span: 406a-406b
start_char: 44421
end_char: 45425
text_sha256: 943d041b239c62c08172013d4290e50f6197215d1afa79d5c3d2c7387b64ef56
feature_family: etymological_decomposition
feature_label: dialectal_variant_as_etymological_evidence
greek_terms: [Λητώ, Ληθώ, πρᾳότητος, ἐθελήμονα, λεῖον]
observation: "At 406a-406b Socrates supports the Leto derivation by appealing to the foreign form Letho and its fit with gentleness and smoothness."
textual_basis: "The passage moves from Λητώ and πρᾳότητος to the foreign Ληθώ form and the λεῖον characterization."
limits: "This records the dialectal-variant move; it does not assess whether the derivation is linguistically valid or endorsed."
review_status: accepted
```

## obs_cratylus_0131

Decision: split into two accepted records. The current record conflates the
seasons derivation at 410c with the separate one-referent/two-name analysis at
410d-410e.

Current flags: `observation: |`, `textual_basis: |`, `limits: |`.

```yaml
observation_id: obs_cratylus_0131
span: 410c
start_char: 53314
end_char: 53760
text_sha256: 98657ef346f794e4316f9a2cebf38377111bf7a9ba2e35115a7cb454f014e8ad
feature_family: definition_ladder
feature_label: definition_by_name_etymology
greek_terms: [ὧραι, ΗΟΡΑΙ, ὁρίζειν]
observation: "At 410c Socrates derives the seasons from old Attic spelling and the delimiting function."
textual_basis: "The ὧραι / ΗΟΡΑΙ analysis is tied directly to ὁρίζειν within the 410c marker."
limits: "This record covers only the seasons derivation, not the following eniautos/etos two-name analysis."
review_status: accepted
```

```yaml
observation_id: obs_cratylus_split_0131_a
span: 410d-410e
start_char: 53760
end_char: 54398
text_sha256: 5450b0bc8176d795abc4975b3ed40e2de27a8e581a9b61ca637471efcd32c581
feature_family: definition_ladder
feature_label: definition_by_name_etymology
greek_terms: [ἐνιαυτός, ἔτος, ἐν ἑαυτῷ, ἐτάζει, Ζῆνα, Δία]
observation: "At 410d-410e Socrates treats eniautos and etos as two names from one account, paralleling the earlier split between Zena and Dia."
textual_basis: "The passage states that ἐνιαυτός and ἔτος risk being one thing, derives them from ἐν ἑαυτῷ and ἐτάζει, and compares the split to Ζῆνα / Δία."
limits: "This records the one-account/two-name procedure; it does not evaluate the earlier Zeus comparison or the linguistic validity of either derivation."
review_status: accepted
```

## obs_cratylus_0136

Decision: reject as standalone. The Euthyphro wording is inside a Homeric
quotation, not a direct dramatic reference to Plato's Euthyphro; the
Cratylus/Hermogenes naming premise is already covered by opening records and
`obs_cratylus_0133`.

Current flags: `observation: >-`, `textual_basis: >-`, `limits: >-`.

```yaml
observation_id: obs_cratylus_0136
span: 407d-407e
start_char: 47622
end_char: 48393
text_sha256: 4d00e1b6221b80d05b91a652390164694ba8179d93663979b5cd2727a3f7a952
feature_family: prosopography
feature_label: cross_dialogue_character_ref
greek_terms: [Εὐθύφρονος ἵπποι, Ἑρμογένη, Κρατύλος]
observation: "Reject as standalone: the current record conflates a Homeric Euthyphro phrase with the already-established Hermogenes/Cratylus naming premise."
textual_basis: "At 407d the Εὐθύφρονος ἵπποι wording is embedded in a quotation formula; at 407e the Ἑρμογένη / Κρατύλος point restates a premise already recorded elsewhere."
limits: "Do not treat the quotation as a cross-dialogue character reference, and do not duplicate the Hermogenes naming premise."
review_status: rejected
```

## obs_cratylus_0140

Decision: split into two accepted records. Aither is complete at 410b; the
earth/Gaia point is completed at 410c.

Current flags: `observation: |`, `textual_basis: |`, `limits: |`.

```yaml
observation_id: obs_cratylus_0140
span: 410b
start_char: 52826
end_char: 53314
text_sha256: 952ff561358c6ea7c717b44b20d294328fd259db38e64503763eda12166b769e
feature_family: etymological_analysis
feature_label: etymology_from_compound
greek_terms: [αἰθήρ, ἀεὶ θεῖ, ἀειθεήρ]
observation: "At 410b Socrates derives aither from always-running language and proposes a compound form."
textual_basis: "The αἰθήρ analysis is tied to ἀεὶ θεῖ and the proposed ἀειθεήρ form within the same marker."
limits: "This record covers aither only; it does not include the following earth/Gaia derivation."
review_status: accepted
```

```yaml
observation_id: obs_cratylus_split_0140_a
span: 410c
start_char: 53314
end_char: 53760
text_sha256: 98657ef346f794e4316f9a2cebf38377111bf7a9ba2e35115a7cb454f014e8ad
feature_family: etymological_analysis
feature_label: etymology_supported_by_poetic_evidence
greek_terms: [γῆ, γαῖαν, γεννήτειρα, γεγάασιν]
observation: "At 410c Socrates says earth is clearer as Gaia and supports the derivation with a Homeric form tied to generation."
textual_basis: "The γῆ / γαῖαν move is followed by γεννήτειρα and the Homeric γεγάασιν support."
limits: "This records the poetic-evidence move for the earth-name only; it does not assert that Homer proves the etymology."
review_status: accepted
```

## obs_cratylus_0149

Decision: accept with a sharper label and cleaned prose.

```yaml
observation_id: obs_cratylus_0149
span: 413b-413c
start_char: 58859
end_char: 59746
text_sha256: addd6860be23033b16ca6936d0e314afa300c1d9d276b7fd031ee6c2f4e148e7
feature_family: definition_ladder
feature_label: competing_definitions_reported
greek_terms: [δίκαιον, ἥλιον, πῦρ, θερμόν, νοῦν]
observation: "At 413b-413c Socrates reports a sequence of competing accounts of the just: sun, fire, the hot in fire, and nous."
textual_basis: "The passage repeats δίκαιον while moving through ἥλιον, πῦρ, θερμόν, and νοῦν as rival reported answers."
limits: "This records the reported sequence; it does not endorse any account or duplicate the separate Anaxagoras prosopography record."
review_status: accepted
```

## obs_cratylus_0156

Decision: split into two accepted records. The gender/sex terms are one local
chain at 414a; the thallein growth derivation crosses into 414b and should not
be folded into the gender label.

```yaml
observation_id: obs_cratylus_0156
span: 414a
start_char: 60499
end_char: 60980
text_sha256: 7d600b8e4ac16a2cbae5091733ea01d79471bdf8e1f9e02ca05d3d7c92c74bf2
feature_family: etymological_analysis
feature_label: etymological_play_with_gender_terms
greek_terms: [ἄρρεν, ἀνήρ, ἄνῳ ῥοῇ, γυνή, γονή, θῆλυ, θηλή]
observation: "At 414a Socrates links male, man, woman, female, and breast terms to flow, generation, and nursing language."
textual_basis: "The marker connects ἄρρεν / ἀνήρ with ἄνῳ ῥοῇ, γυνή with γονή, and θῆλυ with θηλή."
limits: "This record covers the gender/sex-term chain only; it does not include the separate thallein growth derivation."
review_status: accepted
```

```yaml
observation_id: obs_cratylus_split_0156_a
span: 414a-414b
start_char: 60499
end_char: 61365
text_sha256: 0645ecc2b0d95cf4d57899ae1b21a56e9182e1d23c23c6134f9413bb45b1260a
feature_family: etymological_analysis
feature_label: etymology_from_compound
greek_terms: [θάλλειν, αὔξην, θεῖν, ἅλλεσθαι]
observation: "At 414a-414b Socrates explains thallein as a growth term formed from running and leaping language."
textual_basis: "The θάλλειν / αὔξην setup at 414a is completed at 414b by the θεῖν and ἅλλεσθαι components."
limits: "This records a separate compound-style derivation; it does not assess linguistic validity or Socrates' endorsement."
review_status: accepted
```

## obs_cratylus_0158

Decision: accept with span widened to include the letter-operation explanation.

```yaml
observation_id: obs_cratylus_0158
span: 414b-414c
start_char: 60980
end_char: 61849
text_sha256: 979145bb1391182200e1d973cd6194c38f21e590ccc2ff95fc204b0be22fc929
feature_family: etymological_analysis
feature_label: etymology_from_compound
greek_terms: [τέχνην, ἕξιν νοῦ, ταῦ, χεῖ, νῦ, ἦτα]
observation: "At 414b-414c Socrates analyzes techne as hexis nou and explains the result through letter removal and insertion."
textual_basis: "The τέχνην / ἕξιν νοῦ statement at 414b is completed by the ταῦ, χεῖ, νῦ, and ἦτα letter operations at 414c."
limits: "This records the local compound-and-letter procedure; it does not carry forward the later general warning about arbitrary letter changes."
review_status: accepted
```

## obs_cratylus_0162

Decision: split into two accepted records. The dikaion/diaion derivation at
412e and the dikaion/aition/Dia report at 413a are separate source-backed
claims.

```yaml
observation_id: obs_cratylus_0162
span: 412e
start_char: 58209
end_char: 58399
text_sha256: e7dcc548ec63c22ca017cb933ea39a28fa3c49486e84c86c59285e72a6b9e5d3
feature_family: etymology_analysis
feature_label: etymology_from_compound
greek_terms: [δίκαιον, διαϊόν, κάππα, εὐστομίας]
observation: "At 412e Socrates derives dikaion from diaion with kappa added for euphony."
textual_basis: "The δίκαιον / διαϊόν analysis is immediately paired with κάππα and εὐστομίας."
limits: "This covers only the compound-plus-letter derivation, not the following reported teaching about cause and Dia."
review_status: accepted
```

```yaml
observation_id: obs_cratylus_split_0162_a
span: 413a
start_char: 58399
end_char: 58859
text_sha256: 32cdd7ab9364101334d3c28c0325425f762b37371151b6def2b6ec9b3c4d3439
feature_family: etymology_analysis
feature_label: god_name_equated_with_abstractum
greek_terms: [δίκαιον, αἴτιον, Δία, ἐν ἀπορρήτοις]
observation: "At 413a Socrates reports a teaching that identifies the just with the cause and says this is rightly called Dia."
textual_basis: "The report links δίκαιον, αἴτιον, and Δία, while marking the source frame with ἐν ἀπορρήτοις."
limits: "This records the reported etymological equation; it does not claim that Socrates endorses it or that the secret-source frame is historically reliable."
review_status: accepted
```

## obs_cratylus_0167

Decision: accept with cleaned prose. Keep as one serial-method record rather
than splitting every affect term.

```yaml
observation_id: obs_cratylus_0167
span: 419b-419c
start_char: 71137
end_char: 72099
text_sha256: b24151c4bda8395b70774488ed209b887d3ca2173d3cb8557cf7fcdfa0d44160
feature_family: etymology
feature_label: etymology_by_decomposition
greek_terms: [ἡδονή, ὄνησις, λύπη, διάλυσις, ἀνία, ἰέναι, ἀλγηδών, ἀλγεινόν, ὀδύνη, ἔνδυσις, ἀχθηδών, χαρά, διάχυσις]
observation: "At 419b-419c Socrates applies decomposition and phonetic association to a run of affect terms."
textual_basis: "The passage links ἡδονή with ὄνησις, λύπη with διάλυσις, ἀνία with ἰέναι, and continues the same procedure through ἀλγηδών, ὀδύνη, ἀχθηδών, and χαρά."
limits: "This records the local etymological procedure across a compact serial list; it does not assess the derivations or replace the separate record for the serial-question structure."
review_status: accepted
```

## obs_cratylus_0170

Decision: accept with narrowed span and cleaned prose focused on the unique
methodological warning. The first-name burial and Sphinx material are already
covered by accepted `obs_cratylus_0168` and `obs_cratylus_0169`.

Current flags: `observation: >`, `textual_basis: >`, `limits: >`.

```yaml
observation_id: obs_cratylus_0170
span: 414d
start_char: 61849
end_char: 62315
text_sha256: e43ec01af00c1ed00319c16e6d403b4bcab6b71de7613323170fb57221c93ed0
feature_family: etymology_analysis
feature_label: methodological_warning_against_arbitrary_letter_change
greek_terms: [ἐντιθέναι, ἐξαιρεῖν, πολλὴ εὐπορία, προσαρμόσειεν]
observation: "At 414d Socrates warns that unrestricted letter insertion and removal would let anyone fit any name to any thing."
textual_basis: "The warning uses ἐντιθέναι and ἐξαιρεῖν, then names πολλὴ εὐπορία and the ability to προσαρμόσειεν a name to anything."
limits: "This records the methodological warning only; it does not decide how far the warning applies to Socrates' own preceding etymologies."
review_status: accepted
```
