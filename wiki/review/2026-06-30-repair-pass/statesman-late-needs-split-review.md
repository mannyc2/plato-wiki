# Statesman Late Needs-Split Sidecar Review

Scope: `obs_statesman_0213`, `obs_statesman_0219`, `obs_statesman_0221`, `obs_statesman_0222`, `obs_statesman_0227`, `obs_statesman_0231`, `obs_statesman_0232`, `obs_statesman_0233`, `obs_statesman_0239`, `obs_statesman_0243`, `obs_statesman_0244`, `obs_statesman_0246`, `obs_statesman_0256`, `obs_statesman_0258`, `obs_statesman_0262`, `obs_statesman_0266`, `obs_statesman_0267`, `obs_statesman_0272`, `obs_statesman_0281`, `obs_statesman_0284`, `obs_statesman_0299`.

Method: read `wiki/observations/statesman.md`; resolved current and candidate spans with `resolveSourceSpan("statesman", span)` against `raw/plato/greek/statesman.txt`; checked immediately nearby accepted and rejected observations for duplicate pressure. No translations, Pioneer, provider-backed harness runs, review-queue, or review-segmented commands were used.

## Recommendations

### obs_statesman_0213

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0214` already covers the medical analogy that begins after this marker, so this record should stop with the rule-classification criterion.

```yaml
observation_id: obs_statesman_0213
span: 293a
start_char: 73872
end_char: 74291
text_sha256: b1d4087d09d26686619c611d72ec594c34c2f3a31e1c0a6caada617088a94cc5
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: ["βασιλικὸν", "ὀρθὴν ἀρχὴν", "ὀλίγους", "ἑκόντων", "ἀκόντων", "γράμματα", "τέχνην"]
observation: The Stranger locates correct rule with one, two, or very few rulers, and classifies those rulers by art rather than by consent, written rules, or wealth.
textual_basis: At 293a, Young Socrates recalls the royal classification, and the Stranger says correct rule should be sought around one, two, or very few. The same marker says such rulers should be counted as ruling by art whether subjects consent or not, whether rules are written or unwritten, and whether the rulers are rich or poor.
limits: This record stops before the medical analogy that begins after the marker and is handled by the following accepted observation.
review_status: accepted
```

### obs_statesman_0219

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0220` records the stubborn-person simile in the next marker; this record should preserve only the stated reason law lacks precision.

```yaml
observation_id: obs_statesman_0219
span: 294b
start_char: 76446
end_char: 76832
text_sha256: 1cbf664bf82249d4a59a521d3d5ea2582bd672b60660debc19e26cd94a2f103a
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: ["δικαιότατον", "βέλτιστον", "ἀνομοιότητες", "πράξεων", "ἡσυχίαν", "ἁπλοῦν", "τέχνην"]
observation: The Stranger states why law cannot command the exact best and just rule for all cases: people and actions differ, and human affairs do not remain fixed.
textual_basis: At 294b, the argument says exact universal command is blocked by differences among people and actions and by the instability of human affairs. It concludes that no art can declare one simple rule about all people for all time.
limits: This record does not include the personified-law simile in the following marker.
review_status: accepted
```

### obs_statesman_0221

Recommendation: accept cleaned record. Duplicate pressure: `obs_statesman_0222` continues the athletic example into the coarser group rule, so this record should cover only the introduction of the training analogy and the impossibility of individual fine-tuning.

```yaml
observation_id: obs_statesman_0221
span: 294d
start_char: 77273
end_char: 77740
text_sha256: 6cb806b550112401e7bcf4cfd09650318b9f587ad6622f7d366d677302ad6fec
feature_family: craft_analogy
feature_label: expert_craft_analogy
greek_terms: ["ἀσκήσεις", "δρόμον", "φιλονικίας", "τέχνῃ γυμναζόντων", "λεπτουργεῖν", "σώματι", "προστάττοντες"]
observation: The Stranger introduces group athletic training as the analogy for law: trainers working by art cannot prescribe a finely fitted regimen for each individual in mass competitive exercises.
textual_basis: At 294d, the discussion turns from why law is not most exact to group exercises for contests. The Stranger recalls the commands of artful trainers and says they do not think individual fine-tuning is possible when prescribing what fits each body.
limits: This marker introduces the analogy but does not yet state the coarser group rule or the transfer to the lawgiver.
review_status: accepted
```

### obs_statesman_0222

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0223` covers the precise lawgiver limit and written or unwritten laws at 295a, so this record should not claim the contract material that continues beyond 294e.

```yaml
observation_id: obs_statesman_0222
span: 294e
start_char: 77740
end_char: 78150
text_sha256: 2a37df4fd763e269f68cf5c04bc454a25f64a182e748ed7831ffbb9ce07c2b46
feature_family: craft_analogy
feature_label: lawgiving_expertise_as_techne
greek_terms: ["παχύτερον", "πολλοὺς", "τάξιν", "ἴσους πόνους", "νομοθέτην", "ἀγέλαις", "δικαίου"]
observation: The athletic analogy is completed as a model for general lawgiving: trainers set a coarser order for many bodies, and the lawgiver is then compared to one supervising herds concerning justice.
textual_basis: At 294e, trainers are said to make a coarser order for many bodies and to assign equal labors to groups that start and stop together. The marker then transfers the pattern to the lawgiver as supervisor of herds concerning justice.
limits: The marker only begins the move toward mutual dealings; the fuller account of contracts and written or unwritten law belongs to the following accepted observation.
review_status: accepted
```

### obs_statesman_0227

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0226` covers the medical written-instruction example, and accepted `obs_statesman_0228` covers the reported persuasion requirement.

```yaml
observation_id: obs_statesman_0227
span: 295e
start_char: 79775
end_char: 80174
text_sha256: f164bd68dc40021f0d1568183711ff849a7965a18308bf6841b30e8fefde30b6
feature_family: craft_analogy
feature_label: lawgiving_expertise_as_techne
greek_terms: ["ἀληθεῖ τέχνῃ", "νομοθετημάτων", "δίκαια", "ἄδικα", "ἄγραφα", "νομοθετήσαντι", "ἀγέλαις"]
observation: The Stranger transfers the medical example back to lawgiving by asking whether written and unwritten civic laws should bind a later expert in the same rigid way.
textual_basis: At 295e, the argument calls rigid expert adherence to such instructions laughable in true art, then turns to someone who has written or set down unwritten laws for human herds about just, unjust, noble, shameful, good, and bad things.
limits: The question about later expert prescription continues beyond this marker and leads into the common persuasion requirement in the next accepted observation.
review_status: accepted
```

### obs_statesman_0231

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0230` gives the political-art error criterion, while `obs_statesman_0232` gives the truest boundary in the next marker.

```yaml
observation_id: obs_statesman_0231
span: 296d
start_char: 81433
end_char: 81851
text_sha256: 55c35cdf663beb2339e4bb7179c84e3ecf24a2740170dbbb45e7c5985f4e278b
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: ["βίας", "αἰσχρὰ", "ἄδικα", "κακὰ", "πλούσιος", "πένης", "γράμματα"]
observation: The Stranger rejects a blame formula for beneficial political compulsion, then tests whether the wealth or poverty of the compeller can determine whether the compelled action is just.
textual_basis: At 296d, the argument says criticism of such force would be laughable if it called the compelled people sufferers of shameful, unjust, and bad treatment. It then asks whether compulsion is just when performed by a rich person and unjust when performed by a poor person.
limits: The beneficial-action boundary is completed in the following marker; this record preserves only the rejection of blame terms and the wealth test.
review_status: accepted
```

### obs_statesman_0232

Recommendation: accept cleaned record. Duplicate pressure: `obs_statesman_0233` completes the pilot analogy, so this record should keep only the criterion stated before that analogy.

```yaml
observation_id: obs_statesman_0232
span: 296e
start_char: 81851
end_char: 82092
text_sha256: ff04664a51a9fdc5ec6994ccb8ca8f48baa5805256d35c04e85811f6a1cc257a
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: ["σύμφορα", "ἀληθινώτατον", "ὀρθῆς πόλεως", "σοφὸς", "ἀγαθὸς", "διοικήσει", "κυβερνήτης"]
observation: The Stranger states the truest boundary for correct city administration: a wise and good ruler acts beneficially for the ruled, regardless of persuasion, wealth, poverty, written rules, or action beside written rules.
textual_basis: At 296e, the argument names beneficial action as the truest boundary of correct civic administration and assigns this administration to the wise and good ruler.
limits: The pilot comparison starts at the end of the marker but is completed in the following record.
review_status: accepted
```

### obs_statesman_0233

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0234` supplies the no-error condition in the next marker, so this record should stop with the pilot analogy and its transfer to rule.

```yaml
observation_id: obs_statesman_0233
span: 297a
start_char: 82092
end_char: 82431
text_sha256: 428422b01cb2464b5505a0b1d011a7ab9d3d805db0b732351c3b5d74ea2f2e2b
feature_family: craft_analogy
feature_label: expert_craft_analogy
greek_terms: ["ναυτῶν", "συμφέρον", "γράμματα", "τέχνην", "νόμον", "ὀρθὴ", "πολιτεία", "νόμων"]
observation: The pilot analogy makes art rather than written rules the operative law: the pilot preserves fellow sailors by watching their advantage, and the same pattern is transferred to correct government.
textual_basis: At 297a, the pilot is described as preserving fellow sailors by attending to their advantage and by providing art as law instead of setting down writings. The marker then applies the same pattern to capable rulers and a correct constitution in which the force of art is stronger than the laws.
limits: The condition under which intelligent rulers avoid error continues in the next accepted observation.
review_status: accepted
```

### obs_statesman_0239

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0238` covers the first medical side of the abuse hypothetical; accepted `obs_statesman_0240` begins the reform by assembly.

```yaml
observation_id: obs_statesman_0239
span: 298b
start_char: 84599
end_char: 84997
text_sha256: f447dfc0dc612aebd09149430b99eb86b9c4ffb46a914def3f1549c5a3aa32ee
feature_family: craft_analogy
feature_label: expert_abuse_hypothetical
greek_terms: ["χρήματα", "μισθὸν", "ἀποκτεινύασιν", "κυβερνῆται", "σφάλματα", "θάλατταν", "κακουργοῦσιν", "βουλευσαίμεθα"]
observation: The abuse hypothetical escalates: doctors are imagined killing patients for payment, and pilots are imagined abandoning passengers, causing disasters at sea, throwing people into the water, and doing other wrongs.
textual_basis: At 298b, the imagined doctors receive payment from relatives or enemies of a sick person and kill the patient. The marker then gives the pilot side of the hypothetical, including abandonment, disasters at sea, throwing people into the water, and other wrongdoing, before proposing deliberation about these crafts.
limits: This is a constructed accusation within the analogy, not a factual report about doctors or pilots.
review_status: accepted
```

### obs_statesman_0243

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0242` covers the written-rule regime and annual officials; this record should keep only the audit and accusation machinery that is actually within 299a.

```yaml
observation_id: obs_statesman_0243
span: 299a
start_char: 86378
end_char: 86768
text_sha256: 7be2cdbe59f8806fb7685e1234ad2f3207fac3dbe956aa099e92628d969bb524
feature_family: craft_analogy
feature_label: expert_accountability_to_written_rules
greek_terms: ["λαχόντας", "ἄρξαντας", "εὐθύνειν", "κατηγορεῖν", "γράμματα", "ἔθη", "καταψηφισθῇ", "ἀποτίνειν"]
observation: The hypothetical makes former yearly rulers face audit: they are brought in, anyone may accuse them of steering ships or treating patients contrary to the writings and ancestral customs, and convicted persons receive a penalty or payment.
textual_basis: At 299a, former rulers are brought in for audit, and anyone who wishes may accuse them of not steering ships according to the writings or ancestral customs. The same procedure is applied to treatment of the sick, and conviction leads to an assessed penalty or payment.
limits: The court setup begins before this marker and is not restated here; this record preserves the audit and accusation action inside the current span.
review_status: accepted
```

### obs_statesman_0244

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0245` completes prosecution and punishment in 299c, so this record should only record the anti-inquiry law as introduced in 299b.

```yaml
observation_id: obs_statesman_0244
span: 299b
start_char: 86768
end_char: 87219
text_sha256: cb439227a183861ad3eb528c9c877ea4737661e5a9466c775991b106b023784c
feature_family: craft_analogy
feature_label: expert_inquiry_criminalized_by_law
greek_terms: ["νόμον", "ἀλήθειαν", "γράμματα", "σοφιζόμενος", "μετεωρολόγον", "ἀδολέσχην", "σοφιστήν", "διαφθείροντα"]
observation: The hypothetical adds a law against investigating navigational or medical truth contrary to the writings: such an investigator is denied the craft names and is instead labeled as a speculative talker, sophist, and corrupter of younger people.
textual_basis: At 299b, after Young Socrates accepts penalties for voluntary rule under the imagined system, the Stranger adds a law against someone investigating nautical or medical truth contrary to the writings and reasoning about such matters. The marker denies this person the names of doctor and pilot and applies hostile labels before beginning the corruption charge.
limits: The prosecution procedure, persuasion charge, and penalty continue in the following accepted observation.
review_status: accepted
```

### obs_statesman_0246

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0247` covers the final addition of games and arithmetic and the stated destruction of the arts.

```yaml
observation_id: obs_statesman_0246
span: 299d
start_char: 87670
end_char: 88119
text_sha256: 5bd29953196feeea348b3253c6071135f48ccefa2c89ec0fcfd1b35a51273f63
feature_family: craft_analogy
feature_label: written_rules_replace_expert_judgment
greek_terms: ["γεγραμμένα", "πάτρια ἔθη", "ἐπιστήμας", "στρατηγικῆς", "θηρευτικῆς", "γραφικῆς", "μιμητικῆς", "τεκτονικῆς", "γεωργίας", "συγγράμματα"]
observation: The Stranger generalizes the imagined written-rule regime beyond medicine and navigation by applying it to military art, hunting, painting, imitation, carpentry, manufacture, agriculture, plant care, horse-breeding, herd management, divination, and service arts.
textual_basis: At 299d, the argument first refers back to written rules and ancestral customs, then asks what would happen if the same arrangement governed a list of other sciences and crafts, including military, hunting, painting, imitation, building, manufacture, agriculture, plant care, animal care, divination, and service arts.
limits: The list continues into the next marker, where games and arithmetic are added and the destruction of the arts is stated.
review_status: accepted
```

### obs_statesman_0256

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0257` explains the turn to written rules after the absence of such a ruler; this record should stay with the contrast between fear of one-person abuse and the exact correct case.

```yaml
observation_id: obs_statesman_0256
span: 301d
start_char: 91920
end_char: 92286
text_sha256: fc0602a67882dbace0311e8aec418dced588202c10984db15170e54f4fa5e890
feature_family: definition_ladder
feature_label: criterion_for_evaluative_classification
greek_terms: ["ἀρετῆς", "ἐπιστήμης", "δίκαια", "ὅσια", "διανέμειν", "διακυβερνῶντα", "ὀρθὴν", "πολιτείαν"]
observation: The Stranger contrasts distrust of one-person rule with the correct case: people fear discretionary harm, but a ruler who rules with virtue and knowledge and distributes just and holy things correctly would govern the only exactly correct constitution.
textual_basis: At 301d, the feared one-person ruler is described as able to harm, kill, and injure at will. The same marker sets this against a ruler acting with virtue and knowledge, distributing just and holy things correctly to all, and happily governing the only exactly correct constitution.
limits: This record does not include the following explanation for why cities turn to written documents in the absence of such a ruler.
review_status: accepted
```

### obs_statesman_0258

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0257` covers the second-best turn to writings, while accepted `obs_statesman_0259` covers the following political ignorance charge and ranking task.

```yaml
observation_id: obs_statesman_0258
span: 302a
start_char: 92726
end_char: 93190
text_sha256: 6d579935ae06ed5bec3c990098942974a0601cea73d5fb086cd32cc7e06f48e3
feature_family: craft_analogy
feature_label: expert_craft_analogy
greek_terms: ["πράξεις", "πόλις", "πλοῖα", "κυβερνητῶν", "ναυτῶν", "μοχθηρίαν", "ἄγνοιαν"]
observation: The Stranger compares many cities to ships that sink because of bad pilots and sailors who are deeply ignorant about the greatest matters, while also noting the natural strength by which some cities remain stable for a long time.
textual_basis: At 302a, the city is described as naturally strong because some cities remain stable and are not overturned for a very long time. The same marker compares many cities to ships that sink and are destroyed because of the badness and ignorance of pilots and sailors.
limits: This records only the city-ship comparison and its stated cause; the following marker completes the charge that political actors think they possess knowledge they lack.
review_status: accepted
```

### obs_statesman_0262

Recommendation: split into two accepted records. Duplicate pressure: accepted `obs_statesman_0261` already reopens democracy as double, and accepted `obs_statesman_0263` ranks few-rule and democracy. The current block combines the legality divider with the separate monarchy ranking.

```yaml
observation_id: obs_statesman_0262
span: 302e
start_char: 94369
end_char: 94907
text_sha256: 080b0e305261805ee5555c925ff07cab3c57078ad0a5d477187f67ad70f7c999
feature_family: constitutional_typology
feature_label: regime_legality_bifurcation
greek_terms: ["νόμους", "παρανόμως", "ὀρθὴν", "παράνομον", "ἔννομον", "διχοτομεῖ"]
observation: Lawful and unlawful rule become the divider for democracy and for the other non-true constitutions after the correct constitution has been set aside.
textual_basis: At 302e, the Stranger says that ruling according to laws and unlawfully belongs to democracy and the other regimes. He explains that this cut was not useful while they were seeking the correct constitution, but after that constitution is removed, lawful and unlawful rule divide each of the remaining constitutions.
limits: This record covers the legality divider only; the monarchy ranking in the same marker should be separated into its own record.
review_status: accepted
```

```yaml
observation_id: obs_statesman_new_1
span: 302e
start_char: 94369
end_char: 94907
text_sha256: 080b0e305261805ee5555c925ff07cab3c57078ad0a5d477187f67ad70f7c999
feature_family: constitutional_typology
feature_label: monarchy_ranked_by_legality
greek_terms: ["μοναρχία", "γράμμασιν", "ἀγαθοῖς", "νόμους", "ἀρίστη", "ἄνομος", "χαλεπὴ", "βαρυτάτη"]
observation: Monarchy is ranked by its relation to good written laws: monarchy joined to such laws is best among the six non-true constitutions, while lawless monarchy is the harshest and most burdensome to live with.
textual_basis: At 302e, after the legality divider has been stated, the Stranger says monarchy yoked to good writings called laws is best of all six constitutions, while lawless monarchy is harsh and most burdensome to share life with.
limits: This record concerns only the monarchy ranking. The ranking of few-rule and democracy is handled in the next accepted observation.
review_status: accepted
```

### obs_statesman_0266

Recommendation: accept cleaned record. Duplicate pressure: `obs_statesman_0267` spells out the gold-purification analogy, and accepted `obs_statesman_0268` applies it to related auxiliary arts.

```yaml
observation_id: obs_statesman_0266
span: 303d
start_char: 96123
end_char: 96545
text_sha256: 78d7e609720e15b62a788f79757f8ae17b098a4208637674408ccc9ce62f334b
feature_family: methodological_distinction
feature_label: related_classes_harder_to_separate
greek_terms: ["θίασον", "χωριστέον", "πολιτικῆς", "τέχνης", "συγγενές", "βασιλικῷ", "χρυσὸν", "καθαίρουσι"]
observation: After separating the false political troupe with difficulty, the Stranger marks a harder remaining task: another class is closer to the royal kind and harder to understand, so the inquiry is compared to gold purification.
textual_basis: At 303d, the previously separated group is described as a troupe that had to be divided from political art and has only just been separated with great difficulty. The Stranger then says a harder case remains because it is more related to the royal kind and harder to learn, and he introduces the gold-purification comparison.
limits: The material details of the refining comparison belong to the following record, and the application to auxiliary arts belongs to the accepted record after that.
review_status: accepted
```

### obs_statesman_0267

Recommendation: accept cleaned record. Duplicate pressure: accepted `obs_statesman_0268` already handles the application to related political arts, so this record should stay with the refining model itself.

```yaml
observation_id: obs_statesman_0267
span: 303e
start_char: 96545
end_char: 97071
text_sha256: 49ab445bdb4a3d6c4a2e4c48c621742c3bda06ba12e2699ef3f00bb20b2a8777
feature_family: craft_analogy
feature_label: gold_purification_model_for_diairesis
greek_terms: ["χρυσοῦ", "τίμια", "πυρὶ", "χαλκὸς", "ἄργυρος", "ἀδάμας", "βασάνων", "ἀκήρατον"]
observation: The refining comparison is spelled out: after alien materials are removed, valuable things related to gold remain mixed with it and are separated only through fire and testing until pure gold can be seen by itself.
textual_basis: At 303e, the Stranger says precious materials related to gold remain mixed in after the first separation and names metals and testing by fire as the way they are removed, allowing pure gold to be seen alone.
limits: The end of the marker begins applying the analogy to related arts, but that application is already covered by the following accepted observation.
review_status: accepted
```

### obs_statesman_0272

Recommendation: accept narrowed record. Duplicate pressure: accepted `obs_statesman_0271` covers rhetoric as subordinate to politics, and accepted `obs_statesman_0273` covers the royal mastery of military craft. This record should be narrowed to the military deliberation distinction inside 304e.

```yaml
observation_id: obs_statesman_0272
span: 304e
start_char: 98672
end_char: 99197
text_sha256: 9afcbbea6517e3b6fc873752c659476200d0563083dca4d13868cc8a90876572
feature_family: craft_analogy
feature_label: master_craft_distinguished_from_subordinate_crafts
greek_terms: ["πολεμητέον", "στρατηγικὴ", "πολεμικὴ", "φιλίας", "διαβουλεύσασθαι", "ἑτέραν"]
observation: Military practice is treated as artful execution, while the knowledge that decides whether to make war or settle through friendship is separated from that military craft.
textual_basis: At 304e, Young Socrates grants that the power by which generalship and military practice act is artful. The Stranger then asks whether the knowledge that deliberates about war or friendship is the same as or different from that craft, and Young Socrates answers that it must be different.
limits: The opening sentence repeats the rhetoric separation already handled by the previous accepted observation, and the royal mastery of military craft is stated in the next accepted observation.
review_status: accepted
```

### obs_statesman_0281

Recommendation: accept with widened span. Duplicate pressure: accepted `obs_statesman_0280` covers the paired-opposites method in 306c; the widened record should use that overlap only to source the full domain collection and should not replace the accepted method record.

```yaml
observation_id: obs_statesman_0281
span: 306c-306d
start_char: 102127
end_char: 102962
text_sha256: a423aed4a4f4b0b881212a72fec034b217435f7fd04427037233ccde0de23464
feature_family: definition_ladder
feature_label: evaluative_terms_collected_by_domain
greek_terms: ["ἀρετῆς", "καλὰ", "δύο", "ἐναντία", "ὀξύτητα", "τάχος", "σώματα", "ψυχαῖς", "φωνῆς", "μουσικὴ", "γραφικὴ"]
observation: The Stranger collects sharpness and speed as praised examples across bodies, souls, voice, music, and painting while setting up the inquiry into opposed forms among things called fine.
textual_basis: Across 306c-306d, the Stranger says they should examine things called fine that are set into two opposed forms, then names sharpness and speed across bodily, psychic, vocal, and mimetic domains and asks whether Young Socrates has encountered praise of such cases.
limits: The paired-opposites method itself is already covered by the previous accepted observation. This record preserves the domain collection that is cut off by the current 306d-only span.
review_status: accepted
```

### obs_statesman_0284

Recommendation: accept with widened span. Duplicate pressure: accepted `obs_statesman_0283` covers the praise-name side through fitting slowness, and accepted `obs_statesman_0285` covers the civic-faction consequence. The current record needs 307c only to complete the paired blame-name reversal.

```yaml
observation_id: obs_statesman_0284
span: 307b-307c
start_char: 103904
end_char: 104767
text_sha256: f35f1a7ecd73f278b073a41fab7e7f5bd6d7b87d0a0ba62807f3adf74953892d
feature_family: definition_ladder
feature_label: timeliness_reverses_evaluative_predicates
greek_terms: ["καιρῷ", "κοσμιότητος", "ἄκαιρα", "ψέγομεν", "ὑβριστικὰ", "μανικὰ", "βαρύτερα", "βραδύτερα", "μαλακώτερα", "δειλὰ", "βλακικά"]
observation: The Stranger makes timing govern evaluative names: fitting slowness receives an orderly name, but when either opposed tendency is untimely, speakers shift to blame-names for the sharp and fast side and for the heavy and slow side.
textual_basis: Across 307b-307c, fitting slowness in music receives the orderly name rather than the courageous name. The Stranger then says that when both opposed tendencies become untimely, the names are reassigned for blame, first for sharper, faster, harder cases and then for heavier, slower, softer cases.
limits: This record stops with the paired blame-name reversal. The later account of opposed character types becoming civic faction is handled by the following accepted observation.
review_status: accepted
```

### obs_statesman_0299

Recommendation: accept narrowed record. Duplicate pressure: accepted `obs_statesman_0298` covers the marriage-bond diagnosis before this span, and accepted `obs_statesman_0300` covers the royal weaving that begins at the end of 310e.

```yaml
observation_id: obs_statesman_0299
span: 310d-310e
start_char: 111291
end_char: 112273
text_sha256: 787743e934ff9a42105a5b19411d99ed8191462f05f07eec4b6676d08210fb6c
feature_family: virtue_ruler_alignment
feature_label: unmixed_character_lines_degenerate
greek_terms: ["ἀνδρείαν", "ἄμεικτος", "σώφρονι φύσει", "μανίαις", "αἰδοῦς", "ἀκέραστος", "τόλμης", "νωθεστέρα", "ἀναπηροῦσθαι", "γενέσεσιν"]
observation: The Stranger explains why unmixed character lines are defective across generations: courage without moderation first flourishes in strength but ends in madness, while reserve without daring courage becomes too sluggish and finally disabled.
textual_basis: At 310d-310e, the argument says unmixed courage over many generations first reaches strength and then flowers into madness. It then says a soul full of reserve and unmixed with daring courage becomes more sluggish than the due measure and ends by being disabled.
limits: The preceding same-type marriage diagnosis is covered by the previous accepted observation, and the royal weaving remedy that begins at the end of 310e is covered by the following accepted observation.
review_status: accepted
```
