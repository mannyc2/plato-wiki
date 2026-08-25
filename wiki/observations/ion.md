# Ion — Observation Ledger

## Review pass 2026-06-14T00-19-55-334Z

Reviewed all 14 observations. One source_ref mismatch corrected (obs_ion_0007 — wrong end_char and sha256; replaced with canonical wiki_source_span output). All observations locally checkable, no esotericism claims, feature labels appropriate. All accepted.

## Observations

```yaml
observation_id: obs_ion_0001
source_work: Ion
stephanus_span: 530a-530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530a-530b
  start_marker: 530a
  end_marker: 530b
  start_char: 0
  end_char: 775
  text_sha256: 9740569771dc3f9d0dfc1cb81f2aed05480596f87406384341bf7c6bbe01c8d2
greek_terms: [Ἀσκληπιείων, ῥαψῳδῶν ἀγῶνα, Παναθήναια, τὰ πρῶτα τῶν ἄθλων]
english_gloss: ""
feature_family: dramatic_case_setup
feature_id: feature_candidate_122
feature_label: contest_victory_opening
observation: "The dialogue opens with Socrates asking Ion where he has come from. Ion reports he has arrived from Epidaurus and the Asclepieia, where the Epidaurians hold a rhapsodic contest in honor of the god. Ion has just won first prize and is heading next to the Panathenaea. Ion adds that winning the Panathenaea depends on the god's will."
textual_basis: "At 530a, Ion states he has come from Epidaurus and the Asclepieia. Socrates asks whether the Epidaurians hold a rhapsodic contest for the god; Ion confirms. At 530b, Ion reports winning first prize. Socrates says let us see that we win the Panathenaea too and Ion replies that will be if god wills."
limits: "This observation notes the dramatic framing through contest culture and the initial mention of divine will. It does not interpret the religious significance of the Asclepieia or Panathenaea beyond what the text states."
review_status: accepted
```

```yaml
observation_id: obs_ion_0002
source_work: Ion
stephanus_span: 530c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530c
  start_marker: 530c
  end_marker: 530c
  start_char: 775
  end_char: 1237
  text_sha256: d1e1b29fecc18fb2c7020ce5cd5dd6b38ad9ff048d45f1555360cd06fc82fac2
greek_terms: [ἑρμηνέα, τοῦ ποιητοῦ τῆς διανοίας, συνείη, τὰ λεγόμενα ὑπὸ τοῦ ποιητοῦ, ἐκμανθάνειν]
english_gloss: ""
feature_family: definition_ladder
feature_id: feature_candidate_490
feature_label: definition_proposed
observation: "Socrates defines what a good rhapsode must be: the rhapsode must understand the things said by the poet, not merely the verses. The rhapsode must become the interpreter of the poet's thought for the audience. Without knowing what the poet means, the rhapsode cannot perform this well."
textual_basis: "At 530c, Socrates states that no one could ever become a good rhapsode without understanding what is said by the poet. The rhapsode must become the interpreter of the poet's thought (dianoia) to the listeners. To do this well without knowing what the poet says is impossible. Ion agrees this is the largest part of his craft's work."
limits: "This observation records Socrates' initial definition of the rhapsode's function. It does not assess whether this definition is Socrates' own view or a dialectical premise, nor whether it is later modified or abandoned."
review_status: accepted
```

```yaml
observation_id: obs_ion_0003
source_work: Ion
stephanus_span: 530c-530d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530c-530d
  start_marker: 530c
  end_marker: 530d
  start_char: 775
  end_char: 1648
  text_sha256: 50717923447efa6299cebef53f75d275c2139fa96cdf67ab0daa3af7efaa973b
greek_terms: [Μητρόδωρος ὁ Λαμψακηνὸς, Στησίμβροτος ὁ Θάσιος, Γλαύκων, Ὁμηριδῶν, χρυσῷ στεφάνῳ στεφανωθῆναι, κεκόσμηκα]
english_gloss: ""
feature_family: prosopography
feature_id: feature_candidate_1079
feature_label: figures_or_types_as_evidence
observation: "Ion names three prior interpreters of Homer against whom he measures himself: Metrodorus of Lampsacus, Stesimbrotus of Thasos, and Glaucon. Ion claims none of them — nor anyone else ever — has produced as many fine thoughts about Homer as he has. He adds that he has adorned Homer so well that he deserves a golden crown from the Homeridae, a guild or association devoted to Homer."
textual_basis: "At 530c-d, Ion states that neither Metrodorus of Lampsacus nor Stesimbrotus of Thasos nor Glaucon nor anyone else who has ever lived has had so many fine thoughts about Homer to express as he has. At 530d, Ion adds that he has adorned Homer so well that he thinks he deserves to be crowned with a golden crown by the Homeridae."
limits: "This records the named cast of Homeric exegetes and the Homeridae reference. It does not assess the historical accuracy of Ion's claims or the nature of the Homeridae as an institution."
review_status: accepted
```

```yaml
observation_id: obs_ion_0004
source_work: Ion
stephanus_span: 531a-531c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531a-531c
  start_marker: 531a
  end_marker: 531c
  start_char: 1648
  end_char: 2925
  text_sha256: d0a33f32a496fee31e3942be72de0b3d7ff5c2fe528a27133d82936d0b735137
greek_terms: [Ὁμήρου μόνον, Ἡσιόδου, Ἀρχιλόχου, μαντικῆς, μάντεών]
english_gloss: ""
feature_family: elenchus
feature_id: feature_candidate_1096
feature_label: expertise_claim_narrowed_by_craft_test
observation: "Socrates asks whether Ion is skilled only about Homer or also about Hesiod and Archilochus. Ion answers: only Homer, since that seems sufficient. Socrates then introduces a test case: when Homer and Hesiod speak about the same subjects (e.g. prophecy), Ion claims he could explain both equally well. But when pressed about who judges prophecy passages better — Ion or a good seer — Ion concedes the seer would judge better. Socrates notes the contradiction: if Ion had art-knowledge, he would be able to judge both agreed and disputed content across poets."
textual_basis: "At 531a, Ion restricts his expertise to Homer alone. Socrates tests this at 531b with the case of prophecy (mantike): Homer and Hesiod both speak about mantic matters; who judges better, Ion or a seer? Ion says the seer. Socrates points out at 531b-c that if Ion were a seer, he could judge both similar and dissimilar statements. The implication is that Ion's restricted expertise does not behave like craft-knowledge."
limits: "This records the opening of the specialization elenchus. It does not determine whether Ion's answer is consistent or whether Socrates' analogy between poetic expertise and mantic expertise is valid."
review_status: accepted
```

```yaml
observation_id: obs_ion_0005
source_work: Ion
stephanus_span: 531c-532b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531c-532b
  start_marker: 531c
  end_marker: 532b
  start_char: 2487
  end_char: 4760
  text_sha256: 64c6a5db6d7b801d7cf6e258fbf9f825d7b830725d8c19f8c200ab9b95a195ed
greek_terms: [ἀριθμητικὴν τέχνην, ἰατρός, ὁ αὐτὸς γνώσεται, πολέμου, ὁμιλιῶν, θεῶν, οὐρανίων, Ἅιδου]
english_gloss: ""
feature_family: craft_analogy
feature_id: feature_candidate_043
feature_label: expert_craft_analogy
observation: "Socrates argues through craft analogies that the same person who possesses a whole craft can judge both good and bad practitioners of that craft. The arithmetician judges both good and bad speakers about numbers (531e); the doctor judges both good and bad speakers about healthy foods (531e-532a). By parity of reasoning, someone with knowledge of poetry as a whole should judge all poets — both Homer (good) and the rest (worse) — since all poets treat the same subjects: war, human interactions, gods, heavenly phenomena, the underworld, and the births of gods and heroes (531c-531d)."
textual_basis: "At 531c-531d, Socrates lists the topics all poets share: war, human associations (good and bad, private individuals and craftsmen), gods' interactions with each other and with humans, heavenly events, the underworld, and births of gods and heroes. Ion agrees. At 531d, Ion concedes that other poets treat the same subjects but not as well as Homer. At 531e-532a, Socrates establishes the principle through arithmetic and medicine that the same person who knows the craft judges both good and bad speakers. At 532a-b, he applies this to poetry: if Ion recognizes Homer as good, he should also recognize the worse poets as worse."
limits: "This records the craft-whole analogy structure. It does not assess whether Ion could in fact recognize bad poets as bad without being able to speak about them, nor whether poetic subject-matter overlap is sufficient to establish a single craft."
review_status: accepted
```

```yaml
observation_id: obs_ion_0006
source_work: Ion
stephanus_span: 532c-533c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532c-533c
  start_marker: 532c
  end_marker: 533c
  start_char: 4760
  end_char: 7350
  text_sha256: a17e7d222998ef5521ca8253e88f90fc2a334f56d221278f23f2fe9942c243f5
greek_terms: [νυστάζω, ἐγρήγορα, εὐπορῶ, τέχνῃ καὶ ἐπιστήμῃ, ποιητικὴ γάρ πού ἐστιν τὸ ὅλον, ἰδιώτην, Πολυγνώτου, Δαιδάλου, Ὀλύμπου, Θαμύρου, Ὀρφέως, Φημίου]
english_gloss: ""
feature_family: elenchus
feature_id: feature_candidate_1096
feature_label: expertise_claim_narrowed_by_craft_test
observation: "Ion describes a distinctive asymmetry in his own attention: when someone discusses any other poet, he dozes off and cannot contribute anything worthwhile; when Homer is mentioned, he immediately wakes up, pays attention, and has plenty to say (532c). Socrates concludes this shows Ion lacks craft-knowledge about Homer, since anyone with a whole craft can judge all practitioners. He supports this with analogies from painting (Polygnotus vs. other painters), sculpture (Daedalus, Epeius, Theodorus), and music (Olympus, Thamyras, Orpheus, Phemius): in none of these crafts does a connoisseur judge only one practitioner well (532e-533c). Socrates also self-deprecates as a mere private individual who speaks only the truth (532d-e)."
textual_basis: "At 532c, Ion describes dozing and waking in response to different poets. Socrates at 532c states it is clear to everyone that Ion is unable to speak about Homer by craft and knowledge, because if he had the craft he could speak about all poets — poetry is a whole. At 532d-e, Socrates calls himself a private individual (idiotes). At 532e-533c, the painting, sculpture, and music analogies are introduced, each showing that no one is expert about one practitioner but helpless about others in the same craft."
limits: "This records Ion's self-reported attention pattern and the craft analogies used against it. It does not interpret whether Socrates' self-deprecation is ironic or assess whether the analogies are valid."
review_status: accepted
```

```yaml
observation_id: obs_ion_0007
source_work: Ion
stephanus_span: 533d-535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533d-535a
  start_marker: 533d
  end_marker: 535a
  start_char: 7350
  end_char: 10664
  text_sha256: b255477d2bf65fc294c2ba5b87b8ea82f54b5bd6a61bab8b1397959143f2a76a
greek_terms: [Μαγνῆτιν, Ἡρακλείαν, ὁρμαθὸς, ἔνθεοι, κατεχόμενοι, κορυβαντιῶντες, βακχεύουσι, μέλιτται, κοῦφον, πτηνὸν, ἱερόν, ἔκφρων, θείᾳ μοίρᾳ, Τύννιχος ὁ Χαλκιδεύς, εὕρημά τι Μοισᾶν]
english_gloss: ""
feature_family: divine_inspiration
feature_id: feature_candidate_1098
feature_label: inspiration_chain_model
observation: "Socrates proposes that Ion's ability to speak well about Homer comes not from craft but from divine power. He introduces the analogy of the Heraclean (magnet) stone, which not only attracts iron rings but imparts to them the power to attract further rings, forming a long chain suspended from the stone. Likewise, the Muse makes some people inspired, and through these inspired ones others are seized, forming a chain of enthusiasm. Good epic poets and lyric poets produce their beautiful works not by craft but while possessed and out of their minds, like Corybants or Bacchants (533e-534b). The poet is a light, winged, sacred thing, unable to compose until inspired and out of his mind. As evidence, Socrates cites Tynnichus the Chalcidian, who composed nothing else of note but produced the paean that everyone sings — the most beautiful of all songs — which he himself called a discovery of the Muses. God deliberately used the worst poet to sing the most beautiful song (534d-535a)."
textual_basis: "At 533d, Socrates states that Ion's ability is not craft but a divine power that moves him, like the stone Euripides called Magnesian and most call Heraclean. The magnet stone and ring chain spans 533d-533e. The description of poets as inspired and possessed spans 533e-534b. The poet described as a light, winged, and sacred thing is at 534b. The Tynnichus evidence is at 534d-535a."
limits: "This records the divine inspiration theory as Socrates presents it. It does not assess whether Socrates endorses this theory or uses it dialectically, nor whether the Tynnichus example is historically verifiable."
review_status: accepted
```

```yaml
observation_id: obs_ion_0008
source_work: Ion
stephanus_span: 535a-536d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535a-536d
  start_marker: 535a
  end_marker: 536d
  start_char: 10280
  end_char: 14033
  text_sha256: 8713a973b2a07ee9cf142b88068370b77dd10bf731e917ac7f44805a93fce7bf
greek_terms: [ἑρμηνέων ἑρμηνῆς, ἐκπλήξῃς, Ὀδυσσέα, Ἀχιλλέα, Ἀνδρομάχην, Ἑκάβην, Πρίαμον, δακρύων, ὀρθαὶ αἱ τρίχες, ἡ καρδία πηδᾷ, δακτυλίων, χορευτῶν, κατέχεται, κορυβαντιῶντες, θείᾳ μοίρᾳ καὶ κατοκωχῇ]
english_gloss: ""
feature_family: divine_inspiration
feature_id: feature_candidate_1098
feature_label: inspiration_chain_model
observation: "Ion accepts Socrates' theory at 535a, saying Socrates' words touch his soul and that good poets interpret the gods by divine dispensation. Socrates then extends the chain: rhapsodes interpret the poets, making them interpreters of interpreters (535a). At 535b-c, Socrates asks Ion about his state during performances of Homeric scenes (Odysseus on the threshold, Achilles rushing at Hector, pitiable scenes of Andromache, Hecuba, Priam). Ion reports his eyes fill with tears during pitiable passages, his hair stands on end and his heart pounds during fearful ones (535c). Socrates notes the absurdity: a man adorned in festival costume weeping or terrified when he has lost nothing (535d). Ion confirms he watches the audience from the platform and sees them weeping and terrified too; he must attend to them because their emotions affect his income — if he makes them cry he will laugh all the way to the bank, if he makes them laugh he will weep over lost money (535e). Socrates maps this onto the ring chain: the audience is the last ring, Ion the rhapsode is the middle ring, the poet is the first ring, and god draws souls through all of them (535e-536a). Ion is specifically possessed by Homer: when another poet is sung he sleeps, when Homer is sung he wakes and his soul dances (536b-c) — like Corybants who only respond sharply to the song of the god possessing them (536c)."
textual_basis: "At 535a, the formulation interpreters of interpreters. At 535b-c, Ion reports physical reactions: tears for pitiable scenes, hair standing up and heart pounding for fearful ones. At 535d-e, audience observation and financial incentive. At 535e-536a, the ring chain: audience as last ring, rhapsode as middle, poet as first. At 536b-d, the Corybantic comparison and Ion's soul dancing when Homer is mentioned."
limits: "This records the completed ring chain and Ion's performance phenomenology. It does not interpret the irony of Ion's financial calculation at 535e or assess whether his description of physical reactions is credible."
review_status: accepted
```

```yaml
observation_id: obs_ion_0009
source_work: Ion
stephanus_span: 536d-538b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536d-538b
  start_marker: 536d
  end_marker: 538b
  start_char: 13614
  end_char: 16895
  text_sha256: 6f321ffe0366e34399965d738fabd3734d4d265f49efc16a77dfce39bd6cfbf7
greek_terms: [μαινόμενος, ἡνιοχείας, Νέστωρ, Ἀντιλόχῳ, ἱπποδρομίᾳ, κυβερνητικῇ, ἑκάστῃ τῶν τεχνῶν ἀποδέδοταί τι ὑπὸ τοῦ θεοῦ ἔργον]
english_gloss: ""
feature_family: elenchus
feature_id: feature_candidate_1096
feature_label: expertise_claim_narrowed_by_craft_test
observation: "Ion resists the possession diagnosis at 536d: he would be surprised if Socrates could persuade him that he praises Homer while possessed and mad. Socrates shifts strategy: he offers to hear Ion speak about Homer, but first asks a preliminary question — about which of Homer's topics does Ion speak well? Ion claims all of them (536e). Socrates begins testing with the craft of charioteering. He asks Ion to recite Nestor's advice to Antilochus about the turn in the chariot race for Patroclus (537a-b). Ion recites the passage from memory. Socrates then asks: who judges better whether Homer speaks correctly about this — a doctor or a charioteer? Ion says the charioteer, because he possesses that craft (537c). Socrates then establishes a principle: each craft has been assigned by god a specific function that it alone is equipped to know; what we know by the pilot's craft we do not know by medicine, nor vice versa (537c-537d). Two crafts are different when they have knowledge of different subject matters (537d-538a). Therefore someone who does not possess a craft cannot judge what is well said or done in that craft's domain (538a-b). Applied to the charioteering example: Ion, who is a rhapsode not a charioteer, cannot judge Homer's charioteering content better than a charioteer (538b)."
textual_basis: "At 536d, Ion's resistance. At 536e-537a, Socrates asks about which topics Ion speaks well; Ion says all. At 537a-b, the charioteering recitation from memory. At 537c-538b, the principle that each craft has its own domain (ergon) assigned by god and that only the relevant craftsman can judge content within that domain."
limits: "This records the shift from inspiration to craft-content testing and the one-craft-one-domain principle. It does not assess whether the principle is consistently applied or whether there is a meta-craft for judging Homer as a whole."
review_status: accepted
```

```yaml
observation_id: obs_ion_0010
source_work: Ion
stephanus_span: 538b-539d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538b-539d
  start_marker: 538b
  end_marker: 539d
  start_char: 16477
  end_char: 18952
  text_sha256: 3d7a49ea6248f49fd0c4ee4e26e64e41daa6e0c5ee6fb99f5ba234e5694724fb
greek_terms: [Μαχάονι, Ἑκαμήδη, κυκεῶνα, ἰατρικῆς, ἁλιευτικῆς, μολυβδαίνῃ, Θεοκλύμενος, Μελαμποδιδῶν, αἰετὸς, δράκοντα, μάντεως]
english_gloss: ""
feature_family: craft_analogy
feature_id: feature_candidate_043
feature_label: expert_craft_analogy
observation: "Socrates applies the one-craft-one-domain principle to three further Homeric passages, each assigned to a specific craft: (1) Hecamede's posset for the wounded Machaon — a Pramnian wine with grated goat's cheese and onion (538b-c). Ion agrees this is for the doctor's craft to judge, not the rhapsode's. (2) The fishing passage: the lead weight like a plummet descending, with a bull's horn attached, bringing woe to ravenous fish (538c-d). Ion agrees this is for the fisherman's craft. (3) Two prophetic passages: Theoclymenus the seer of the Melampodidae addressing the suitors in the Odyssey — darkness covering their heads, wailing, tears, ghosts filling the courtyard, the sun perished from heaven (538e-539b); and the eagle-snake omen during the teichomachy in the Iliad — an eagle carrying a blood-red snake that bites back and is dropped among the troops (539b-539d). Socrates says these are for the seer to examine and judge. Ion agrees in each case."
textual_basis: "At 538b-c, the medical passage with Hecamede's posset for Machaon. At 538c-d, the fishing passage with the lead weight and bull's horn. At 538e-539d, the two prophetic passages (Theoclymenus in the Odyssey and the eagle-snake omen in the Iliad). In each case, Ion concedes the relevant craftsman — doctor, fisherman, seer — judges the content, not the rhapsode."
limits: "This records the sequence of craft-specific tests. It does not assess whether these passages also contain content that a rhapsode might legitimately judge, such as narrative effectiveness or characterization."
review_status: accepted
```

```yaml
observation_id: obs_ion_0011
source_work: Ion
stephanus_span: 539e-540e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539e-540e
  start_marker: 539e
  end_marker: 540e
  start_char: 18952
  end_char: 21229
  text_sha256: d9991a67f78d1e9bdff9431b8d9233a5cb492b99b7d343bf861cf2209096b665
greek_terms: [ἅπαντα, ἐπιλήσμονα, ἃ πρέπει, ἀνδρὶ, γυναικί, δούλῳ, ἐλευθέρῳ, ἀρχομένῳ, ἄρχοντι, βουκόλῳ, ταλασιουργῷ, στρατηγῷ]
english_gloss: ""
feature_family: elenchus
feature_id: feature_candidate_1096
feature_label: expertise_claim_narrowed_by_craft_test
observation: "Socrates asks Ion to specify what, of Homer's content, properly belongs to the rhapsode's craft to judge (539e). Ion initially says everything. Socrates reminds him that he previously agreed the rhapsodic craft is different from the charioteer's and therefore knows different things (539e-540a). Ion then contracts his claim: the rhapsode judges what is fitting for a man to say and for a woman, for a slave and for a free person, for a subject and for a ruler (540b). Socrates tests each type: (a) what is fitting for a ruler on a storm-tossed ship — Ion concedes the pilot judges better (540b); (b) what is fitting for a ruler of a sick person — the doctor judges better (540c); (c) what is fitting for a slave cowherd calming angry cattle — the cowherd (540c); (d) what is fitting for a woman wool-worker about wool-working — not the rhapsode (540c-d). Finally, Ion claims the rhapsode knows what is fitting for a man who is a general exhorting soldiers (540d)."
textual_basis: "At 539e, Ion says everything (hapanta). At 540a, Socrates reminds him of the prior agreement. At 540b, Ion's revised claim about fitting speech for character types (man, woman, slave, free, subject, ruler). At 540b-d, each type is tested against a relevant craft. At 540d, Ion retains only the general's speech as the rhapsode's domain."
limits: "This records the domain contraction and the eventual narrowing to generalship. It does not assess whether the fitting-speech criterion is a plausible account of the rhapsode's art or whether Ion has simply been cornered."
review_status: accepted
```

```yaml
observation_id: obs_ion_0012
source_work: Ion
stephanus_span: 540d-541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540d-541b
  start_marker: 540d
  end_marker: 541b
  start_char: 20405
  end_char: 22010
  text_sha256: 1e7c530e88cbd132d2a2e093d24b48342e00b55b60a7c129429485b3f99d135a
greek_terms: [στρατηγική, μίαν τέχνην, ἄριστος ῥαψῳδὸς, ἄριστος στρατηγὸς, ἐκ τῶν Ὁμήρου μαθών]
english_gloss: ""
feature_family: elenchus
feature_id: feature_candidate_1096
feature_label: expertise_claim_narrowed_by_craft_test
observation: "Socrates asks whether the rhapsodic craft is the same as the generals' craft. Ion says they are one and the same (540e-541a). Socrates draws the inference: whoever is a good rhapsode is also a good general. Ion enthusiastically agrees. But when Socrates asks whether the converse holds — that whoever is a good general is also a good rhapsode — Ion denies it (541a). He maintains only the one-way identity: the good rhapsode is necessarily a good general (541b). Socrates then asks: since Ion is the best rhapsode among the Greeks, is he also the best general? Ion says yes, and claims he learned it from Homer (541b)."
textual_basis: "At 540e-541a, Ion identifies rhapsodic and strategic craft as one (mia). At 541a, he denies the converse (good general implies good rhapsode). At 541b, Ion claims to be the best general of the Greeks and says he learned generalship from Homer."
limits: "This records Ion's extraordinary claim of craft identity. It does not assess whether the asymmetric identity of crafts is logically coherent or whether Ion's claim is meant to be taken seriously."
review_status: accepted
```

```yaml
observation_id: obs_ion_0013
source_work: Ion
stephanus_span: 541b-541e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541b-541e
  start_marker: 541b
  end_marker: 541e
  start_char: 21613
  end_char: 23250
  text_sha256: 12466e13f480fb6e8ee40a357bbbade2c1ef013f7aa563a238410e36d555e8be
greek_terms: [Ἀπολλόδωρον τὸν Κυζικηνόν, Φανοσθένη τὸν Ἄνδριον, Ἡρακλείδην τὸν Κλαζομένιον, ξένον ὄντα, στρατηγὸν, Ἐφέσιοι, Ἀθηναῖοι]
english_gloss: ""
feature_family: prosopography
feature_id: feature_candidate_1079
feature_label: figures_or_types_as_evidence
observation: "Socrates asks why Ion, being the best rhapsode and best general, does not serve as a general but only travels around performing. Ion replies that Ephesus is ruled and generaled by Athens and does not need a general, and Athens and Sparta would not elect him because they think themselves sufficient (541b-c). Socrates counters by naming three foreigners whom Athens has repeatedly elected as generals: Apollodorus of Cyzicus, Phanosthenes of Andros, and Heraclides of Clazomenae (541c-d). He adds that the Ephesians are Athenian colonists of old and Ephesus is inferior to no city (541d-e)."
textual_basis: "At 541c, Ion explains his city's political subordination to Athens. At 541c-d, Socrates names Apollodorus of Cyzicus, Phanosthenes of Andros, and Heraclides of Clazomenae as foreign generals elected by Athens. At 541d-e, the Athenian-Ephesian colonial relationship is noted."
limits: "This records the prosopography of foreign Athenian generals and the political relationship between Athens and Ephesus. It does not assess the historical accuracy of these references."
review_status: accepted
```

```yaml
observation_id: obs_ion_0014
source_work: Ion
stephanus_span: 541e-542b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541e-542b
  start_marker: 541e
  end_marker: 542b
  start_char: 22792
  end_char: 23821
  text_sha256: f02126d04fc16355208768591a5133ce98dba09879a66619006cfa39dd572171
greek_terms: [Πρωτεὺς, παντοδαπὸς, στρεφόμενος ἄνω καὶ κάτω, τεχνικὸς, θείᾳ μοίρᾳ κατεχόμενος, ἄδικος, θεῖος]
english_gloss: ""
feature_family: closure_type
feature_id: feature_candidate_135
feature_label: forced_dichotomy_close
observation: "Socrates accuses Ion of evading the demand to demonstrate his expertise about Homer. He compares Ion to Proteus, who changes into every shape, twisting up and down, until finally escaping by appearing as a general (541e-542a). Socrates then offers Ion a forced choice: if Ion is a craftsman who promised to display his Homeric wisdom but deceives, he is unjust; if he is not a craftsman but is possessed by divine dispensation from Homer, knowing nothing yet speaking many fine things about the poet, then he is not unjust. Socrates asks Ion to choose: does he want to be considered an unjust man or a divine one? Ion chooses the finer option — to be considered divine rather than technical about Homer (542b)."
textual_basis: "At 541e-542a, the Proteus comparison and the accusation of evasion. At 542a, the dichotomy: if technical (technikos), unjust; if divinely possessed (theia moira katechomenos), not unjust. At 542b, Ion's choice: the divine is much finer (polu gar kallion to theion nomizesthai)."
limits: "This records the dialogue's closing move and Ion's final choice. It does not assess whether the dichotomy is exhaustive or whether Ion's choice is coerced by the structure of Socrates' argument."
review_status: accepted
```
