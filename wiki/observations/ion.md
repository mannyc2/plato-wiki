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
greek_terms:
  - Ἀσκληπιείων
  - ῥαψῳδῶν ἀγῶνα
  - Παναθήναια
  - τὰ πρῶτα τῶν ἄθλων
english_gloss: ""
observation: The dialogue opens with Socrates asking Ion where he has come from. Ion reports he has arrived from Epidaurus and the Asclepieia, where the Epidaurians hold a rhapsodic contest in honor of the god. Ion has just won first prize and is heading next to the Panathenaea. Ion adds that winning the Panathenaea depends on the god's will.
textual_basis: At 530a, Ion states he has come from Epidaurus and the Asclepieia. Socrates asks whether the Epidaurians hold a rhapsodic contest for the god; Ion confirms. At 530b, Ion reports winning first prize. Socrates says let us see that we win the Panathenaea too and Ion replies that will be if god wills.
limits: This observation notes the dramatic framing through contest culture and the initial mention of divine will. It does not interpret the religious significance of the Asclepieia or Panathenaea beyond what the text states.
review_status: rejected
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
greek_terms:
  - ἑρμηνέα
  - τοῦ ποιητοῦ τῆς διανοίας
  - συνείη
  - τὰ λεγόμενα ὑπὸ τοῦ ποιητοῦ
  - ἐκμανθάνειν
english_gloss: ""
observation: "Socrates defines what a good rhapsode must be: the rhapsode must understand the things said by the poet, not merely the verses. The rhapsode must become the interpreter of the poet's thought for the audience. Without knowing what the poet means, the rhapsode cannot perform this well."
textual_basis: At 530c, Socrates states that no one could ever become a good rhapsode without understanding what is said by the poet. The rhapsode must become the interpreter of the poet's thought (dianoia) to the listeners. To do this well without knowing what the poet says is impossible. Ion agrees this is the largest part of his craft's work.
limits: This observation records Socrates' initial definition of the rhapsode's function. It does not assess whether this definition is Socrates' own view or a dialectical premise, nor whether it is later modified or abandoned.
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
greek_terms:
  - Στησίμβροτος ὁ Θάσιος
  - Γλαύκων
  - Ὁμηριδῶν
  - χρυσῷ στεφάνῳ στεφανωθῆναι
  - κεκόσμηκα
english_gloss: ""
observation: "Ion names three prior interpreters of Homer against whom he measures himself: Metrodorus of Lampsacus, Stesimbrotus of Thasos, and Glaucon. Ion claims none of them — nor anyone else ever — has produced as many fine thoughts about Homer as he has. He adds that he has adorned Homer so well that he deserves a golden crown from the Homeridae, a guild or association devoted to Homer."
textual_basis: At 530c-d, Ion states that neither Metrodorus of Lampsacus nor Stesimbrotus of Thasos nor Glaucon nor anyone else who has ever lived has had so many fine thoughts about Homer to express as he has. At 530d, Ion adds that he has adorned Homer so well that he thinks he deserves to be crowned with a golden crown by the Homeridae.
limits: This records the named cast of Homeric exegetes and the Homeridae reference. It does not assess the historical accuracy of Ion's claims or the nature of the Homeridae as an institution.
review_status: rejected
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
greek_terms:
  - Ὁμήρου μόνον
  - Ἡσιόδου
  - Ἀρχιλόχου
  - μαντικῆς
  - μάντεών
english_gloss: ""
observation: "Socrates asks whether Ion is skilled only about Homer or also about Hesiod and Archilochus. Ion answers: only Homer, since that seems sufficient. Socrates then introduces a test case: when Homer and Hesiod speak about the same subjects (e.g. prophecy), Ion claims he could explain both equally well. But when pressed about who judges prophecy passages better — Ion or a good seer — Ion concedes the seer would judge better. Socrates notes the contradiction: if Ion had art-knowledge, he would be able to judge both agreed and disputed content across poets."
textual_basis: "At 531a, Ion restricts his expertise to Homer alone. Socrates tests this at 531b with the case of prophecy (mantike): Homer and Hesiod both speak about mantic matters; who judges better, Ion or a seer? Ion says the seer. Socrates points out at 531b-c that if Ion were a seer, he could judge both similar and dissimilar statements. The implication is that Ion's restricted expertise does not behave like craft-knowledge."
limits: This records the opening of the specialization elenchus. It does not determine whether Ion's answer is consistent or whether Socrates' analogy between poetic expertise and mantic expertise is valid.
review_status: rejected
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
greek_terms:
  - ἀριθμητικὴν τέχνην
  - ἰατρός
  - ὁ αὐτὸς γνώσεται
  - πολέμου
  - ὁμιλιῶν
  - θεῶν
  - οὐρανίων
  - Ἅιδου
english_gloss: ""
observation: "Socrates argues through craft analogies that the same person who possesses a whole craft can judge both good and bad practitioners of that craft. The arithmetician judges both good and bad speakers about numbers (531e); the doctor judges both good and bad speakers about healthy foods (531e-532a). By parity of reasoning, someone with knowledge of poetry as a whole should judge all poets — both Homer (good) and the rest (worse) — since all poets treat the same subjects: war, human interactions, gods, heavenly phenomena, the underworld, and the births of gods and heroes (531c-531d)."
textual_basis: "At 531c-531d, Socrates lists the topics all poets share: war, human associations (good and bad, private individuals and craftsmen), gods' interactions with each other and with humans, heavenly events, the underworld, and births of gods and heroes. Ion agrees. At 531d, Ion concedes that other poets treat the same subjects but not as well as Homer. At 531e-532a, Socrates establishes the principle through arithmetic and medicine that the same person who knows the craft judges both good and bad speakers. At 532a-b, he applies this to poetry: if Ion recognizes Homer as good, he should also recognize the worse poets as worse."
limits: This records the craft-whole analogy structure. It does not assess whether Ion could in fact recognize bad poets as bad without being able to speak about them, nor whether poetic subject-matter overlap is sufficient to establish a single craft.
review_status: rejected
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
greek_terms:
  - νυστάζω
  - ἐγρήγορα
  - εὐπορῶ
  - τέχνῃ καὶ ἐπιστήμῃ
  - ποιητικὴ γάρ πού ἐστιν τὸ ὅλον
  - ἰδιώτην
  - Πολυγνώτου
  - Δαιδάλου
  - Ὀλύμπου
  - Θαμύρου
  - Ὀρφέως
  - Φημίου
english_gloss: ""
observation: "Ion describes a distinctive asymmetry in his own attention: when someone discusses any other poet, he dozes off and cannot contribute anything worthwhile; when Homer is mentioned, he immediately wakes up, pays attention, and has plenty to say (532c). Socrates concludes this shows Ion lacks craft-knowledge about Homer, since anyone with a whole craft can judge all practitioners. He supports this with analogies from painting (Polygnotus vs. other painters), sculpture (Daedalus, Epeius, Theodorus), and music (Olympus, Thamyras, Orpheus, Phemius): in none of these crafts does a connoisseur judge only one practitioner well (532e-533c). Socrates also self-deprecates as a mere private individual who speaks only the truth (532d-e)."
textual_basis: At 532c, Ion describes dozing and waking in response to different poets. Socrates at 532c states it is clear to everyone that Ion is unable to speak about Homer by craft and knowledge, because if he had the craft he could speak about all poets — poetry is a whole. At 532d-e, Socrates calls himself a private individual (idiotes). At 532e-533c, the painting, sculpture, and music analogies are introduced, each showing that no one is expert about one practitioner but helpless about others in the same craft.
limits: This records Ion's self-reported attention pattern and the craft analogies used against it. It does not interpret whether Socrates' self-deprecation is ironic or assess whether the analogies are valid.
review_status: rejected
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
greek_terms:
  - Μαγνῆτιν
  - Ἡρακλείαν
  - ὁρμαθὸς
  - ἔνθεοι
  - κατεχόμενοι
  - κορυβαντιῶντες
  - βακχεύουσι
  - μέλιτται
  - κοῦφον
  - πτηνὸν
  - ἱερόν
  - ἔκφρων
  - θείᾳ μοίρᾳ
  - Τύννιχος ὁ Χαλκιδεύς
  - εὕρημά τι Μοισᾶν
english_gloss: ""
observation: Socrates proposes that Ion's ability to speak well about Homer comes not from craft but from divine power. He introduces the analogy of the Heraclean (magnet) stone, which not only attracts iron rings but imparts to them the power to attract further rings, forming a long chain suspended from the stone. Likewise, the Muse makes some people inspired, and through these inspired ones others are seized, forming a chain of enthusiasm. Good epic poets and lyric poets produce their beautiful works not by craft but while possessed and out of their minds, like Corybants or Bacchants (533e-534b). The poet is a light, winged, sacred thing, unable to compose until inspired and out of his mind. As evidence, Socrates cites Tynnichus the Chalcidian, who composed nothing else of note but produced the paean that everyone sings — the most beautiful of all songs — which he himself called a discovery of the Muses. God deliberately used the worst poet to sing the most beautiful song (534d-535a).
textual_basis: At 533d, Socrates states that Ion's ability is not craft but a divine power that moves him, like the stone Euripides called Magnesian and most call Heraclean. The magnet stone and ring chain spans 533d-533e. The description of poets as inspired and possessed spans 533e-534b. The poet described as a light, winged, and sacred thing is at 534b. The Tynnichus evidence is at 534d-535a.
limits: This records the divine inspiration theory as Socrates presents it. It does not assess whether Socrates endorses this theory or uses it dialectically, nor whether the Tynnichus example is historically verifiable.
review_status: rejected
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
greek_terms:
  - ἑρμηνέων ἑρμηνῆς
  - ἐκπλήξῃς
  - Ὀδυσσέα
  - Ἀχιλλέα
  - Ἀνδρομάχην
  - Ἑκάβην
  - Πρίαμον
  - δακρύων
  - ὀρθαὶ αἱ τρίχες
  - ἡ καρδία πηδᾷ
  - δακτυλίων
  - χορευτῶν
  - κατέχεται
  - κορυβαντιῶντες
  - θείᾳ μοίρᾳ καὶ κατοκωχῇ
english_gloss: ""
observation: "Ion accepts Socrates' theory at 535a, saying Socrates' words touch his soul and that good poets interpret the gods by divine dispensation. Socrates then extends the chain: rhapsodes interpret the poets, making them interpreters of interpreters (535a). At 535b-c, Socrates asks Ion about his state during performances of Homeric scenes (Odysseus on the threshold, Achilles rushing at Hector, pitiable scenes of Andromache, Hecuba, Priam). Ion reports his eyes fill with tears during pitiable passages, his hair stands on end and his heart pounds during fearful ones (535c). Socrates notes the absurdity: a man adorned in festival costume weeping or terrified when he has lost nothing (535d). Ion confirms he watches the audience from the platform and sees them weeping and terrified too; he must attend to them because their emotions affect his income — if he makes them cry he will laugh all the way to the bank, if he makes them laugh he will weep over lost money (535e). Socrates maps this onto the ring chain: the audience is the last ring, Ion the rhapsode is the middle ring, the poet is the first ring, and god draws souls through all of them (535e-536a). Ion is specifically possessed by Homer: when another poet is sung he sleeps, when Homer is sung he wakes and his soul dances (536b-c) — like Corybants who only respond sharply to the song of the god possessing them (536c)."
textual_basis: "At 535a, the formulation interpreters of interpreters. At 535b-c, Ion reports physical reactions: tears for pitiable scenes, hair standing up and heart pounding for fearful ones. At 535d-e, audience observation and financial incentive. At 535e-536a, the ring chain: audience as last ring, rhapsode as middle, poet as first. At 536b-d, the Corybantic comparison and Ion's soul dancing when Homer is mentioned."
limits: This records the completed ring chain and Ion's performance phenomenology. It does not interpret the irony of Ion's financial calculation at 535e or assess whether his description of physical reactions is credible.
review_status: rejected
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
greek_terms:
  - μαινόμενος
  - ἡνιοχείας
  - Νέστωρ
  - Ἀντιλόχῳ
  - ἱπποδρομίᾳ
  - κυβερνητικῇ
  - ἑκάστῃ τῶν τεχνῶν ἀποδέδοταί τι ὑπὸ τοῦ θεοῦ ἔργον
english_gloss: ""
observation: "Ion resists the possession diagnosis at 536d: he would be surprised if Socrates could persuade him that he praises Homer while possessed and mad. Socrates shifts strategy: he offers to hear Ion speak about Homer, but first asks a preliminary question — about which of Homer's topics does Ion speak well? Ion claims all of them (536e). Socrates begins testing with the craft of charioteering. He asks Ion to recite Nestor's advice to Antilochus about the turn in the chariot race for Patroclus (537a-b). Ion recites the passage from memory. Socrates then asks: who judges better whether Homer speaks correctly about this — a doctor or a charioteer? Ion says the charioteer, because he possesses that craft (537c). Socrates then establishes a principle: each craft has been assigned by god a specific function that it alone is equipped to know; what we know by the pilot's craft we do not know by medicine, nor vice versa (537c-537d). Two crafts are different when they have knowledge of different subject matters (537d-538a). Therefore someone who does not possess a craft cannot judge what is well said or done in that craft's domain (538a-b). Applied to the charioteering example: Ion, who is a rhapsode not a charioteer, cannot judge Homer's charioteering content better than a charioteer (538b)."
textual_basis: At 536d, Ion's resistance. At 536e-537a, Socrates asks about which topics Ion speaks well; Ion says all. At 537a-b, the charioteering recitation from memory. At 537c-538b, the principle that each craft has its own domain (ergon) assigned by god and that only the relevant craftsman can judge content within that domain.
limits: This records the shift from inspiration to craft-content testing and the one-craft-one-domain principle. It does not assess whether the principle is consistently applied or whether there is a meta-craft for judging Homer as a whole.
review_status: rejected
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
greek_terms:
  - Μαχάονι
  - Ἑκαμήδη
  - κυκεῶνα
  - ἰατρικῆς
  - ἁλιευτικῆς
  - μολυβδαίνῃ
  - Θεοκλύμενος
  - Μελαμποδιδῶν
  - αἰετὸς
  - δράκοντα
english_gloss: ""
observation: "Socrates applies the one-craft-one-domain principle to three further Homeric passages, each assigned to a specific craft: (1) Hecamede's posset for the wounded Machaon — a Pramnian wine with grated goat's cheese and onion (538b-c). Ion agrees this is for the doctor's craft to judge, not the rhapsode's. (2) The fishing passage: the lead weight like a plummet descending, with a bull's horn attached, bringing woe to ravenous fish (538c-d). Ion agrees this is for the fisherman's craft. (3) Two prophetic passages: Theoclymenus the seer of the Melampodidae addressing the suitors in the Odyssey — darkness covering their heads, wailing, tears, ghosts filling the courtyard, the sun perished from heaven (538e-539b); and the eagle-snake omen during the teichomachy in the Iliad — an eagle carrying a blood-red snake that bites back and is dropped among the troops (539b-539d). Socrates says these are for the seer to examine and judge. Ion agrees in each case."
textual_basis: At 538b-c, the medical passage with Hecamede's posset for Machaon. At 538c-d, the fishing passage with the lead weight and bull's horn. At 538e-539d, the two prophetic passages (Theoclymenus in the Odyssey and the eagle-snake omen in the Iliad). In each case, Ion concedes the relevant craftsman — doctor, fisherman, seer — judges the content, not the rhapsode.
limits: This records the sequence of craft-specific tests. It does not assess whether these passages also contain content that a rhapsode might legitimately judge, such as narrative effectiveness or characterization.
review_status: rejected
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
greek_terms:
  - ἅπαντα
  - ἐπιλήσμονα
  - ἃ πρέπει
  - ἀνδρὶ
  - γυναικί
  - δούλῳ
  - ἐλευθέρῳ
  - ἀρχομένῳ
  - ἄρχοντι
  - βουκόλῳ
  - ταλασιουργῷ
  - στρατηγῷ
english_gloss: ""
observation: "Socrates asks Ion to specify what, of Homer's content, properly belongs to the rhapsode's craft to judge (539e). Ion initially says everything. Socrates reminds him that he previously agreed the rhapsodic craft is different from the charioteer's and therefore knows different things (539e-540a). Ion then contracts his claim: the rhapsode judges what is fitting for a man to say and for a woman, for a slave and for a free person, for a subject and for a ruler (540b). Socrates tests each type: (a) what is fitting for a ruler on a storm-tossed ship — Ion concedes the pilot judges better (540b); (b) what is fitting for a ruler of a sick person — the doctor judges better (540c); (c) what is fitting for a slave cowherd calming angry cattle — the cowherd (540c); (d) what is fitting for a woman wool-worker about wool-working — not the rhapsode (540c-d). Finally, Ion claims the rhapsode knows what is fitting for a man who is a general exhorting soldiers (540d)."
textual_basis: At 539e, Ion says everything (hapanta). At 540a, Socrates reminds him of the prior agreement. At 540b, Ion's revised claim about fitting speech for character types (man, woman, slave, free, subject, ruler). At 540b-d, each type is tested against a relevant craft. At 540d, Ion retains only the general's speech as the rhapsode's domain.
limits: This records the domain contraction and the eventual narrowing to generalship. It does not assess whether the fitting-speech criterion is a plausible account of the rhapsode's art or whether Ion has simply been cornered.
review_status: rejected
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
greek_terms:
  - στρατηγική
  - ἄριστος ῥαψῳδὸς
  - ἐκ τῶν Ὁμήρου μαθών
english_gloss: ""
observation: "Socrates asks whether the rhapsodic craft is the same as the generals' craft. Ion says they are one and the same (540e-541a). Socrates draws the inference: whoever is a good rhapsode is also a good general. Ion enthusiastically agrees. But when Socrates asks whether the converse holds — that whoever is a good general is also a good rhapsode — Ion denies it (541a). He maintains only the one-way identity: the good rhapsode is necessarily a good general (541b). Socrates then asks: since Ion is the best rhapsode among the Greeks, is he also the best general? Ion says yes, and claims he learned it from Homer (541b)."
textual_basis: At 540e-541a, Ion identifies rhapsodic and strategic craft as one (mia). At 541a, he denies the converse (good general implies good rhapsode). At 541b, Ion claims to be the best general of the Greeks and says he learned generalship from Homer.
limits: This records Ion's extraordinary claim of craft identity. It does not assess whether the asymmetric identity of crafts is logically coherent or whether Ion's claim is meant to be taken seriously.
review_status: rejected
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
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: "Socrates asks why Ion, being the best rhapsode and best general, does not serve as a general but only travels around performing. Ion replies that Ephesus is ruled and generaled by Athens and does not need a general, and Athens and Sparta would not elect him because they think themselves sufficient (541b-c). Socrates counters by naming three foreigners whom Athens has repeatedly elected as generals: Apollodorus of Cyzicus, Phanosthenes of Andros, and Heraclides of Clazomenae (541c-d). He adds that the Ephesians are Athenian colonists of old and Ephesus is inferior to no city (541d-e)."
textual_basis: At 541c, Ion explains his city's political subordination to Athens. At 541c-d, Socrates names Apollodorus of Cyzicus, Phanosthenes of Andros, and Heraclides of Clazomenae as foreign generals elected by Athens. At 541d-e, the Athenian-Ephesian colonial relationship is noted.
limits: This records the prosopography of foreign Athenian generals and the political relationship between Athens and Ephesus. It does not assess the historical accuracy of these references.
review_status: rejected
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
greek_terms:
  - Πρωτεὺς
  - παντοδαπὸς
  - στρεφόμενος ἄνω καὶ κάτω
  - τεχνικὸς
  - θείᾳ μοίρᾳ κατεχόμενος
  - ἄδικος
  - θεῖος
english_gloss: ""
observation: "Socrates accuses Ion of evading the demand to demonstrate his expertise about Homer. He compares Ion to Proteus, who changes into every shape, twisting up and down, until finally escaping by appearing as a general (541e-542a). Socrates then offers Ion a forced choice: if Ion is a craftsman who promised to display his Homeric wisdom but deceives, he is unjust; if he is not a craftsman but is possessed by divine dispensation from Homer, knowing nothing yet speaking many fine things about the poet, then he is not unjust. Socrates asks Ion to choose: does he want to be considered an unjust man or a divine one? Ion chooses the finer option — to be considered divine rather than technical about Homer (542b)."
textual_basis: "At 541e-542a, the Proteus comparison and the accusation of evasion. At 542a, the dichotomy: if technical (technikos), unjust; if divinely possessed (theia moira katechomenos), not unjust. At 542b, Ion's choice: the divine is much finer (polu gar kallion to theion nomizesthai)."
limits: This records the dialogue's closing move and Ion's final choice. It does not assess whether the dichotomy is exhaustive or whether Ion's choice is coerced by the structure of Socrates' argument.
review_status: rejected
```

```yaml
observation_id: obs_ion_0015
source_work: Ion
stephanus_span: 530a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530a
  start_marker: 530a
  end_marker: 530a
  start_char: 0
  end_char: 294
  text_sha256: 1f0b8dd05dc92f6bdb89178383673981d2ac693b83693b2840b795c56d8cbd7f
greek_terms:
  - Ἀσκληπιείων
  - ῥαψῳδῶν ἀγῶνα
english_gloss: ""
observation: Socrates asks Ion where he has come from.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0016
source_work: Ion
stephanus_span: 530a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530a
  start_marker: 530a
  end_marker: 530a
  start_char: 0
  end_char: 294
  text_sha256: 1f0b8dd05dc92f6bdb89178383673981d2ac693b83693b2840b795c56d8cbd7f
greek_terms:
  - Ἀσκληπιείων
  - ῥαψῳδῶν ἀγῶνα
english_gloss: ""
observation: Ion says that he has arrived from Epidaurus and the Asclepieia.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0017
source_work: Ion
stephanus_span: 530a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530a
  start_marker: 530a
  end_marker: 530a
  start_char: 0
  end_char: 294
  text_sha256: 1f0b8dd05dc92f6bdb89178383673981d2ac693b83693b2840b795c56d8cbd7f
greek_terms:
  - Ἀσκληπιείων
  - ῥαψῳδῶν ἀγῶνα
english_gloss: ""
observation: Ion confirms that the Epidaurians hold a rhapsodic contest in honor of the god.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0018
source_work: Ion
stephanus_span: 530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b
  start_marker: 530b
  end_marker: 530b
  start_char: 294
  end_char: 775
  text_sha256: 7d2b4a6d79c9f42dabd0bd79895d1f37026a5c3dc7715448bef50f5b51d0974c
greek_terms:
  - Παναθήναια
  - τὰ πρῶτα τῶν ἄθλων
english_gloss: ""
observation: Ion says that he won first prize in the contest.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0019
source_work: Ion
stephanus_span: 530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b
  start_marker: 530b
  end_marker: 530b
  start_char: 294
  end_char: 775
  text_sha256: 7d2b4a6d79c9f42dabd0bd79895d1f37026a5c3dc7715448bef50f5b51d0974c
greek_terms:
  - Παναθήναια
  - τὰ πρῶτα τῶν ἄθλων
english_gloss: ""
observation: Socrates urges Ion to win at the Panathenaea as well.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0020
source_work: Ion
stephanus_span: 530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b
  start_marker: 530b
  end_marker: 530b
  start_char: 294
  end_char: 775
  text_sha256: 7d2b4a6d79c9f42dabd0bd79895d1f37026a5c3dc7715448bef50f5b51d0974c
greek_terms:
  - Παναθήναια
  - τὰ πρῶτα τῶν ἄθλων
english_gloss: ""
observation: Ion says that victory at the Panathenaea will occur if the god wills it.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0021
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
greek_terms:
  - Στησίμβροτος ὁ Θάσιος
  - Γλαύκων
  - Ὁμηριδῶν
  - χρυσῷ στεφάνῳ στεφανωθῆναι
  - κεκόσμηκα
english_gloss: ""
observation: Ion names Metrodorus of Lampsacus, Stesimbrotus of Thasos, and Glaucon as earlier interpreters of Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0022
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
greek_terms:
  - Στησίμβροτος ὁ Θάσιος
  - Γλαύκων
  - Ὁμηριδῶν
  - χρυσῷ στεφάνῳ στεφανωθῆναι
  - κεκόσμηκα
english_gloss: ""
observation: Ion claims that neither those named interpreters nor anyone else has expressed as many fine thoughts about Homer as he has.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0023
source_work: Ion
stephanus_span: 530d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530d
  start_marker: 530d
  end_marker: 530d
  start_char: 1237
  end_char: 1648
  text_sha256: 3406d87fe3a23c20ecfd586d9e9cc5fb640f62ff0db490fc58c588fc14c13218
greek_terms:
  - Στησίμβροτος ὁ Θάσιος
  - Γλαύκων
  - Ὁμηριδῶν
  - χρυσῷ στεφάνῳ στεφανωθῆναι
  - κεκόσμηκα
english_gloss: ""
observation: Ion says that he has adorned Homer so well that the Homeridae should crown him with a gold crown.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0024
source_work: Ion
stephanus_span: 531a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531a
  start_marker: 531a
  end_marker: 531a
  start_char: 1648
  end_char: 2023
  text_sha256: f5ffea8022451f8fe68bb830144887f8d574aced0a674493202c1b9604817c9d
greek_terms:
  - Ὁμήρου μόνον
  - Ἡσιόδου
  - Ἀρχιλόχου
english_gloss: ""
observation: Socrates asks whether Ion is skilled only about Homer or also about Hesiod and Archilochus.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0025
source_work: Ion
stephanus_span: 531a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531a
  start_marker: 531a
  end_marker: 531a
  start_char: 1648
  end_char: 2023
  text_sha256: f5ffea8022451f8fe68bb830144887f8d574aced0a674493202c1b9604817c9d
greek_terms:
  - Ὁμήρου μόνον
  - Ἡσιόδου
  - Ἀρχιλόχου
english_gloss: ""
observation: Ion says that he is skilled only about Homer and that this is sufficient for him.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0026
source_work: Ion
stephanus_span: 531a-531b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531a-531b
  start_marker: 531a
  end_marker: 531b
  start_char: 1648
  end_char: 2487
  text_sha256: 5dd90bc3b1a259f59db8c24eba23cf0c785701d56c665805b87220b84a084ee7
greek_terms:
  - Ὁμήρου μόνον
  - Ἡσιόδου
  - Ἀρχιλόχου
  - μαντικῆς
  - μάντεών
english_gloss: ""
observation: Ion says that he could explain Homer and Hesiod equally well where they speak about the same subjects.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0027
source_work: Ion
stephanus_span: 531b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531b
  start_marker: 531b
  end_marker: 531b
  start_char: 2023
  end_char: 2487
  text_sha256: 925b58a3d0199708f6a6e7cdfe720d9a4263253fa6618e236edc5867046d0cc3
greek_terms:
  - μαντικῆς
  - μάντεών
english_gloss: ""
observation: Ion says that a good seer would judge the poets' statements about prophecy better than he would.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0028
source_work: Ion
stephanus_span: 531b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531b
  start_marker: 531b
  end_marker: 531b
  start_char: 2023
  end_char: 2487
  text_sha256: 925b58a3d0199708f6a6e7cdfe720d9a4263253fa6618e236edc5867046d0cc3
greek_terms:
  - μαντικῆς
  - μάντεών
english_gloss: ""
observation: Socrates says that a seer able to explain matching statements about prophecy would also know how to explain differing statements about prophecy.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0029
source_work: Ion
stephanus_span: 531c-531d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531c-531d
  start_marker: 531c
  end_marker: 531d
  start_char: 2487
  end_char: 3332
  text_sha256: 13ac3579ea63892cac0c2da249f01eff0bb599b40575c3cd49d87ead4392b880
greek_terms:
  - πολέμου
  - ὁμιλιῶν
  - θεῶν
  - οὐρανίων
  - Ἅιδου
english_gloss: ""
observation: Socrates says that poets treat war, human associations, divine interactions, heavenly events, the underworld, and the births of gods and heroes.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0030
source_work: Ion
stephanus_span: 531d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531d
  start_marker: 531d
  end_marker: 531d
  start_char: 2925
  end_char: 3332
  text_sha256: 1a4b82533f06fe54ec01ada062b14e15527260c15dae913e471d529cd145cac2
greek_terms:
  []
english_gloss: ""
observation: Ion agrees that other poets treat the same subjects as Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0031
source_work: Ion
stephanus_span: 531d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531d
  start_marker: 531d
  end_marker: 531d
  start_char: 2925
  end_char: 3332
  text_sha256: 1a4b82533f06fe54ec01ada062b14e15527260c15dae913e471d529cd145cac2
greek_terms:
  []
english_gloss: ""
observation: Ion says that Homer treats those subjects better than the other poets do.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0032
source_work: Ion
stephanus_span: 531d-531e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531d-531e
  start_marker: 531d
  end_marker: 531e
  start_char: 2925
  end_char: 3872
  text_sha256: 3750af61260aae4d3af1de790510e127b321537f8993a957b8ee2f0474f4d5b6
greek_terms:
  - ἀριθμητικὴν τέχνην
  - ἰατρός
  - ὁ αὐτὸς γνώσεται
english_gloss: ""
observation: Socrates says that the person who knows arithmetic judges both good and bad statements about number.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0033
source_work: Ion
stephanus_span: 531e-532a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531e-532a
  start_marker: 531e
  end_marker: 532a
  start_char: 3332
  end_char: 4304
  text_sha256: 3a3db2179ca374fc3f9f1634adf82f1e55f00449fd1c2d85a9b111b37344fad5
greek_terms:
  - ἀριθμητικὴν τέχνην
  - ἰατρός
  - ὁ αὐτὸς γνώσεται
english_gloss: ""
observation: Socrates says that the doctor judges both good and bad statements about healthy foods.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0034
source_work: Ion
stephanus_span: 532a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532a
  start_marker: 532a
  end_marker: 532a
  start_char: 3872
  end_char: 4304
  text_sha256: 841451dcbd5aaae802c0e2352967934c1676a5c18609c6e46b1c69317d64869c
greek_terms:
  []
english_gloss: ""
observation: Socrates says that whoever cannot identify a bad statement about a subject also cannot identify a good statement about that subject.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0035
source_work: Ion
stephanus_span: 532a-532b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532a-532b
  start_marker: 532a
  end_marker: 532b
  start_char: 3872
  end_char: 4760
  text_sha256: 48f3127007b025b9c2e647694c68f903cf1c2c4f26aa03c4edcdebacfc9f140d
greek_terms:
  []
english_gloss: ""
observation: Socrates infers that a person who judges Homer as the better poet should also judge the other poets as worse when they speak about the same subjects.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0036
source_work: Ion
stephanus_span: 532c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532c
  start_marker: 532c
  end_marker: 532c
  start_char: 4760
  end_char: 5189
  text_sha256: 976fb9ed5ebdc09fa3e8365a6cd117f36b56658989bd3ef9a0ba9f77b0c4c1a6
greek_terms:
  - νυστάζω
  - ἐγρήγορα
  - εὐπορῶ
  - τέχνῃ καὶ ἐπιστήμῃ
  - ποιητικὴ γάρ πού ἐστιν τὸ ὅλον
english_gloss: ""
observation: Ion says that he grows drowsy and cannot contribute anything worthwhile when someone discusses another poet.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0037
source_work: Ion
stephanus_span: 532c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532c
  start_marker: 532c
  end_marker: 532c
  start_char: 4760
  end_char: 5189
  text_sha256: 976fb9ed5ebdc09fa3e8365a6cd117f36b56658989bd3ef9a0ba9f77b0c4c1a6
greek_terms:
  - νυστάζω
  - ἐγρήγορα
  - εὐπορῶ
  - τέχνῃ καὶ ἐπιστήμῃ
  - ποιητικὴ γάρ πού ἐστιν τὸ ὅλον
english_gloss: ""
observation: Ion says that he wakes, attends, and finds words readily when someone mentions Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0038
source_work: Ion
stephanus_span: 532c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532c
  start_marker: 532c
  end_marker: 532c
  start_char: 4760
  end_char: 5189
  text_sha256: 976fb9ed5ebdc09fa3e8365a6cd117f36b56658989bd3ef9a0ba9f77b0c4c1a6
greek_terms:
  - νυστάζω
  - ἐγρήγορα
  - εὐπορῶ
  - τέχνῃ καὶ ἐπιστήμῃ
  - ποιητικὴ γάρ πού ἐστιν τὸ ὅλον
english_gloss: ""
observation: Socrates says that Ion's unequal responses show that he cannot speak about Homer by craft and knowledge.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0039
source_work: Ion
stephanus_span: 532d-532e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532d-532e
  start_marker: 532d
  end_marker: 532e
  start_char: 5189
  end_char: 6082
  text_sha256: 24fd7013cb704228ce44ad127d03bfc58ea71cab75f559983b373a9f8b5cd88e
greek_terms:
  - ἰδιώτην
  - Πολυγνώτου
english_gloss: ""
observation: Socrates describes himself as a private person who says only what is true.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0040
source_work: Ion
stephanus_span: 532e-533a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532e-533a
  start_marker: 532e
  end_marker: 533a
  start_char: 5590
  end_char: 6471
  text_sha256: 5ea13413b8fbe91a13630a25fe8f9d9847f3666646edfe28ce5be94ed5fced80
greek_terms:
  - ἰδιώτην
  - Πολυγνώτου
  - Δαιδάλου
english_gloss: ""
observation: Socrates says that no judge of painting can assess Polygnotus alone while becoming drowsy and speechless before every other painter.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0041
source_work: Ion
stephanus_span: 533a-533b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533a-533b
  start_marker: 533a
  end_marker: 533b
  start_char: 6082
  end_char: 6921
  text_sha256: 8174461e782e58a88766e495973e70faf4016d3ec339dc89a82a1786db630aba
greek_terms:
  - Πολυγνώτου
  - Δαιδάλου
  - Ὀλύμπου
  - Θαμύρου
english_gloss: ""
observation: Socrates says that no judge of sculpture can explain the work of only Daedalus, Epeius, or Theodorus while failing before every other sculptor.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0042
source_work: Ion
stephanus_span: 533b-533c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533b-533c
  start_marker: 533b
  end_marker: 533c
  start_char: 6471
  end_char: 7350
  text_sha256: f56b9e87966a15999f5e47f24f2c27fa63caf789e46e1513bd0ce7cf8deebec4
greek_terms:
  - εὐπορῶ
  - Ὀλύμπου
  - Θαμύρου
  - Ὀρφέως
  - Φημίου
english_gloss: ""
observation: Socrates says that no judge of music or rhapsody can explain only one named practitioner while failing to judge the others.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0043
source_work: Ion
stephanus_span: 533d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533d
  start_marker: 533d
  end_marker: 533d
  start_char: 7350
  end_char: 7740
  text_sha256: cc2fa16a23e79720c9bc0c72dd25d31dcfa394ac6abf18e4dcd630a18cb46e73
greek_terms:
  - Μαγνῆτιν
  - Ἡρακλείαν
english_gloss: ""
observation: Socrates says that divine power rather than craft moves Ion to speak well about Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0044
source_work: Ion
stephanus_span: 533d-533e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533d-533e
  start_marker: 533d
  end_marker: 533e
  start_char: 7350
  end_char: 8201
  text_sha256: 3b5243e14a0a41a623e989dde03e573d578d3459834e57ce1fd035742debb957
greek_terms:
  - Μαγνῆτιν
  - Ἡρακλείαν
  - ὁρμαθὸς
  - ἔνθεοι
  - κατεχόμενοι
  - κορυβαντιῶντες
english_gloss: ""
observation: Socrates says that the Heraclean stone attracts iron rings and gives each ring power to attract another ring.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0045
source_work: Ion
stephanus_span: 533e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533e
  start_marker: 533e
  end_marker: 533e
  start_char: 7740
  end_char: 8201
  text_sha256: fdb225c33383c6699aa22a11ab436850a151d65472880e9e3f70d982e75e1c4f
greek_terms:
  - ὁρμαθὸς
  - ἔνθεοι
  - κατεχόμενοι
  - κορυβαντιῶντες
english_gloss: ""
observation: Socrates compares the chain of rings to a chain of inspired people suspended from the Muse.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0046
source_work: Ion
stephanus_span: 533e-534a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533e-534a
  start_marker: 533e
  end_marker: 534a
  start_char: 7740
  end_char: 8591
  text_sha256: 615378d017521e6fd92ddb647fcfe43bfd1162e3128e495883e597f95e6bd588
greek_terms:
  - ὁρμαθὸς
  - ἔνθεοι
  - κατεχόμενοι
  - κορυβαντιῶντες
  - βακχεύουσι
english_gloss: ""
observation: Socrates says that good epic and lyric poets compose while inspired and possessed rather than by craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0047
source_work: Ion
stephanus_span: 534a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534a
  start_marker: 534a
  end_marker: 534a
  start_char: 8201
  end_char: 8591
  text_sha256: 36575ea5d3bea4f7080bb1b2ebb89b46c658fff56fa8029a0dfeba5cf666d979
greek_terms:
  - κατεχόμενοι
  - βακχεύουσι
english_gloss: ""
observation: Socrates compares lyric poets in their inspired state to Corybants and Bacchants who act while out of their minds.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0048
source_work: Ion
stephanus_span: 534b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534b
  start_marker: 534b
  end_marker: 534b
  start_char: 8591
  end_char: 9042
  text_sha256: c14d36274752f18e5222f5c31b277e1e635e6808302d76b9eaea43d93351fb4a
greek_terms:
  - μέλιτται
  - κοῦφον
  - πτηνὸν
  - ἱερόν
  - ἔκφρων
english_gloss: ""
observation: Socrates calls the poet a light, winged, sacred thing that cannot compose until inspired and out of its mind.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0049
source_work: Ion
stephanus_span: 534c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534c
  start_marker: 534c
  end_marker: 534c
  start_char: 9042
  end_char: 9488
  text_sha256: 517225ecae4a68c2f44c4bd482523946f26808099ee387238f2b012f826d702e
greek_terms:
  - θείᾳ μοίρᾳ
english_gloss: ""
observation: Socrates says that each poet composes well only in the genre toward which the Muse has impelled that poet.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0050
source_work: Ion
stephanus_span: 534c-534d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534c-534d
  start_marker: 534c
  end_marker: 534d
  start_char: 9042
  end_char: 9936
  text_sha256: 36922a0bc7d5225b1576a099fcf728b59742b3d86d734a4ec5adbeb15abfca63
greek_terms:
  - θείᾳ μοίρᾳ
  - Τύννιχος ὁ Χαλκιδεύς
english_gloss: ""
observation: Socrates says that the god removes the poets' understanding and uses them as servants through whom the god speaks.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0051
source_work: Ion
stephanus_span: 534d-534e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534d-534e
  start_marker: 534d
  end_marker: 534e
  start_char: 9488
  end_char: 10280
  text_sha256: 66ca1c7e457451eaef703f84621298e05da9e8a1e04a9d4a8beec156db3a89b3
greek_terms:
  - κατεχόμενοι
  - Τύννιχος ὁ Χαλκιδεύς
  - εὕρημά τι Μοισᾶν
english_gloss: ""
observation: Socrates says that Tynnichus composed no other memorable poem but produced a paean that everyone sings.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0052
source_work: Ion
stephanus_span: 534d-534e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534d-534e
  start_marker: 534d
  end_marker: 534e
  start_char: 9488
  end_char: 10280
  text_sha256: 66ca1c7e457451eaef703f84621298e05da9e8a1e04a9d4a8beec156db3a89b3
greek_terms:
  - κατεχόμενοι
  - Τύννιχος ὁ Χαλκιδεύς
  - εὕρημά τι Μοισᾶν
english_gloss: ""
observation: Socrates reports that Tynnichus called his paean a discovery of the Muses.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0053
source_work: Ion
stephanus_span: 534e-535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534e-535a
  start_marker: 534e
  end_marker: 535a
  start_char: 9936
  end_char: 10664
  text_sha256: adbbabb6f036a3316d07ca480b3bd3e50f6e6aafac3df02571c07642231777bd
greek_terms:
  - κατεχόμενοι
  - θείᾳ μοίρᾳ
  - εὕρημά τι Μοισᾶν
english_gloss: ""
observation: Socrates says that the god deliberately used the poorest poet to sing the most beautiful song.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0054
source_work: Ion
stephanus_span: 535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535a
  start_marker: 535a
  end_marker: 535a
  start_char: 10280
  end_char: 10664
  text_sha256: 1ec819919b7d75ff8943667b3a821c94ee2f070af44c98e508636759aef779e6
greek_terms:
  - ἑρμηνέων ἑρμηνῆς
english_gloss: ""
observation: Ion says that Socrates' account touches his soul.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0055
source_work: Ion
stephanus_span: 535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535a
  start_marker: 535a
  end_marker: 535a
  start_char: 10280
  end_char: 10664
  text_sha256: 1ec819919b7d75ff8943667b3a821c94ee2f070af44c98e508636759aef779e6
greek_terms:
  - ἑρμηνέων ἑρμηνῆς
english_gloss: ""
observation: Ion agrees that good poets interpret the gods by divine dispensation.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0056
source_work: Ion
stephanus_span: 535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535a
  start_marker: 535a
  end_marker: 535a
  start_char: 10280
  end_char: 10664
  text_sha256: 1ec819919b7d75ff8943667b3a821c94ee2f070af44c98e508636759aef779e6
greek_terms:
  - ἑρμηνέων ἑρμηνῆς
english_gloss: ""
observation: Socrates says that rhapsodes interpret poets and therefore are interpreters of interpreters.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0057
source_work: Ion
stephanus_span: 535b-535c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535b-535c
  start_marker: 535b
  end_marker: 535c
  start_char: 10664
  end_char: 11432
  text_sha256: fff563ef83d63a8544c1150b16b7efdc3ffcea1cd0bc9543afa4f71f2f4d9632
greek_terms:
  - ἐκπλήξῃς
  - Ὀδυσσέα
  - Ἀχιλλέα
  - Ἀνδρομάχην
  - Ἑκάβην
  - Πρίαμον
  - δακρύων
  - ὀρθαὶ αἱ τρίχες
  - ἡ καρδία πηδᾷ
english_gloss: ""
observation: Socrates asks Ion about his state while performing frightening or pitiable Homeric scenes.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0058
source_work: Ion
stephanus_span: 535c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535c
  start_marker: 535c
  end_marker: 535c
  start_char: 11048
  end_char: 11432
  text_sha256: 7d3b9a436c8892bf4aff5e4f253a0a77211f109afec715e8e76cf1b981361b42
greek_terms:
  - δακρύων
  - ὀρθαὶ αἱ τρίχες
  - ἡ καρδία πηδᾷ
english_gloss: ""
observation: Ion says that his eyes fill with tears during pitiable passages.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0059
source_work: Ion
stephanus_span: 535c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535c
  start_marker: 535c
  end_marker: 535c
  start_char: 11048
  end_char: 11432
  text_sha256: 7d3b9a436c8892bf4aff5e4f253a0a77211f109afec715e8e76cf1b981361b42
greek_terms:
  - δακρύων
  - ὀρθαὶ αἱ τρίχες
  - ἡ καρδία πηδᾷ
english_gloss: ""
observation: Ion says that his hair stands on end and his heart pounds during frightening passages.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0060
source_work: Ion
stephanus_span: 535d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535d
  start_marker: 535d
  end_marker: 535d
  start_char: 11432
  end_char: 11854
  text_sha256: 39995521c13cc22ebb5ecc238309bc141f4731a769027a80a52c2b35ec3bb832
greek_terms:
  []
english_gloss: ""
observation: Socrates describes Ion as weeping or terrified while wearing festival finery despite having suffered no loss.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0061
source_work: Ion
stephanus_span: 535d-535e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535d-535e
  start_marker: 535d
  end_marker: 535e
  start_char: 11432
  end_char: 12334
  text_sha256: c6d1da2e81b508d5b1d7a8bb9803ed1427bc5fed65df9f9fa2fbdd0f22014b46
greek_terms:
  - δακτυλίων
english_gloss: ""
observation: Ion says that he sees members of his audience weeping and looking terrified as he performs.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0062
source_work: Ion
stephanus_span: 535e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535e
  start_marker: 535e
  end_marker: 535e
  start_char: 11854
  end_char: 12334
  text_sha256: a7c80b3e5f334e4c81efeecc6d39ea6af6a335c8a301bbfcd48227d1e06b655b
greek_terms:
  - δακτυλίων
english_gloss: ""
observation: Ion says that making the audience weep brings him profit, whereas making them laugh causes him a financial loss.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0063
source_work: Ion
stephanus_span: 535e-536a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535e-536a
  start_marker: 535e
  end_marker: 536a
  start_char: 11854
  end_char: 12772
  text_sha256: 098186eec85a924000533a727c526e810731e979a5b9d62c09c7c54ce4ac91f9
greek_terms:
  - δακτυλίων
  - χορευτῶν
  - κατέχεται
english_gloss: ""
observation: Socrates identifies the audience as the last rings, the rhapsode as the middle ring, and the poet as the first ring in the inspired chain.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0064
source_work: Ion
stephanus_span: 536a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536a
  start_marker: 536a
  end_marker: 536a
  start_char: 12334
  end_char: 12772
  text_sha256: b7e248b1861c2c13594a7b3700014a0fdd4927f019bb5cbbaf30e3c5e4aa8c9f
greek_terms:
  - δακτυλίων
  - χορευτῶν
  - κατέχεται
english_gloss: ""
observation: Socrates says that the god draws human souls through the linked poet, rhapsode, and audience.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0065
source_work: Ion
stephanus_span: 536b-536c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536b-536c
  start_marker: 536b
  end_marker: 536c
  start_char: 12772
  end_char: 13614
  text_sha256: e57fe1f39052fd166a413ce20e5324d3b3064a64d640be944aecf1d597827874
greek_terms:
  - δακτυλίων
  - κορυβαντιῶντες
  - θείᾳ μοίρᾳ καὶ κατοκωχῇ
english_gloss: ""
observation: Socrates says that Ion sleeps when another poet is sung but wakes and finds words when Homer is sung.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0066
source_work: Ion
stephanus_span: 536c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536c
  start_marker: 536c
  end_marker: 536c
  start_char: 13228
  end_char: 13614
  text_sha256: 1c68d9ed4711ad5ea0d9f49844109e8e6c0504e04cedda19dd9771e85b3f3188
greek_terms:
  - κορυβαντιῶντες
  - θείᾳ μοίρᾳ καὶ κατοκωχῇ
english_gloss: ""
observation: Socrates compares Ion's Homer-specific response to Corybants who respond sharply only to the song of the god possessing them.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0067
source_work: Ion
stephanus_span: 536d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536d
  start_marker: 536d
  end_marker: 536d
  start_char: 13614
  end_char: 14033
  text_sha256: 3a6fc6526bf7c59c09e5bf24464e43e9961e34fc047460d447c0d36160144c83
greek_terms:
  []
english_gloss: ""
observation: Socrates concludes that Ion praises Homer by divine dispensation rather than by craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0068
source_work: Ion
stephanus_span: 536d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536d
  start_marker: 536d
  end_marker: 536d
  start_char: 13614
  end_char: 14033
  text_sha256: 3a6fc6526bf7c59c09e5bf24464e43e9961e34fc047460d447c0d36160144c83
greek_terms:
  - μαινόμενος
english_gloss: ""
observation: Ion doubts that Socrates could persuade him that he praises Homer while possessed and mad.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0069
source_work: Ion
stephanus_span: 536d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536d
  start_marker: 536d
  end_marker: 536d
  start_char: 13614
  end_char: 14033
  text_sha256: 3a6fc6526bf7c59c09e5bf24464e43e9961e34fc047460d447c0d36160144c83
greek_terms:
  - μαινόμενος
english_gloss: ""
observation: Ion says that Socrates would not consider him possessed after hearing him speak about Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0070
source_work: Ion
stephanus_span: 536e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536e
  start_marker: 536e
  end_marker: 536e
  start_char: 14033
  end_char: 14323
  text_sha256: f5a075f16734f51422ffa250378c460a0c17d0d58d5d653477689dcc32e724b3
greek_terms:
  []
english_gloss: ""
observation: Socrates agrees to hear Ion after Ion answers which Homeric subjects he can discuss well.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0071
source_work: Ion
stephanus_span: 536e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536e
  start_marker: 536e
  end_marker: 536e
  start_char: 14033
  end_char: 14323
  text_sha256: f5a075f16734f51422ffa250378c460a0c17d0d58d5d653477689dcc32e724b3
greek_terms:
  []
english_gloss: ""
observation: Ion claims that he can speak well about every subject treated by Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0072
source_work: Ion
stephanus_span: 537a-537b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537a-537b
  start_marker: 537a
  end_marker: 537b
  start_char: 14323
  end_char: 14949
  text_sha256: e2548f5705f45a6c5555f7a662de85ff8a60fcde378ed1d8d55b5e9b18cfa326
greek_terms:
  - ἡνιοχείας
  - Νέστωρ
  - Ἀντιλόχῳ
  - ἱπποδρομίᾳ
english_gloss: ""
observation: Socrates asks Ion to recite Nestor's advice to Antilochus about turning in the chariot race for Patroclus.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0073
source_work: Ion
stephanus_span: 537a-537b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537a-537b
  start_marker: 537a
  end_marker: 537b
  start_char: 14323
  end_char: 14949
  text_sha256: e2548f5705f45a6c5555f7a662de85ff8a60fcde378ed1d8d55b5e9b18cfa326
greek_terms:
  - ἡνιοχείας
  - Νέστωρ
  - Ἀντιλόχῳ
  - ἱπποδρομίᾳ
english_gloss: ""
observation: Ion recites Nestor's chariot-racing advice from memory.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0074
source_work: Ion
stephanus_span: 537c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537c
  start_marker: 537c
  end_marker: 537c
  start_char: 14949
  end_char: 15332
  text_sha256: 85705af3dcdc41fd180cb8328e41d45c654463e5601e952c751a80ccea9e3a67
greek_terms:
  - κυβερνητικῇ
  - ἑκάστῃ τῶν τεχνῶν ἀποδέδοταί τι ὑπὸ τοῦ θεοῦ ἔργον
english_gloss: ""
observation: Ion says that a charioteer judges Homer's charioteering passage better than a doctor because the charioteer possesses that craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0075
source_work: Ion
stephanus_span: 537c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537c
  start_marker: 537c
  end_marker: 537c
  start_char: 14949
  end_char: 15332
  text_sha256: 85705af3dcdc41fd180cb8328e41d45c654463e5601e952c751a80ccea9e3a67
greek_terms:
  - κυβερνητικῇ
  - ἑκάστῃ τῶν τεχνῶν ἀποδέδοταί τι ὑπὸ τοῦ θεοῦ ἔργον
english_gloss: ""
observation: Socrates says that the god assigns each craft a distinct work that it is able to know.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0076
source_work: Ion
stephanus_span: 537d-537e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537d-537e
  start_marker: 537d
  end_marker: 537e
  start_char: 15332
  end_char: 16093
  text_sha256: f877319dcdeacc1481ebb872e2411c4c9b94f2806dcdd95098d5b0546277eea4
greek_terms:
  []
english_gloss: ""
observation: Socrates says that crafts are different when they know different objects.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0077
source_work: Ion
stephanus_span: 537e-538a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537e-538a
  start_marker: 537e
  end_marker: 538a
  start_char: 15675
  end_char: 16477
  text_sha256: 19ec3aba1c1baf8d611450fc9ff4ec5d7dddd406441353ce7b90673972e80520
greek_terms:
  []
english_gloss: ""
observation: Socrates says that the same craft necessarily knows the same objects and a different craft necessarily knows different objects.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0078
source_work: Ion
stephanus_span: 538a-538b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538a-538b
  start_marker: 538a
  end_marker: 538b
  start_char: 16093
  end_char: 16895
  text_sha256: 3a473ad4db104c3e6ae9938794871079ded09162959c56ae778f88579908fe67
greek_terms:
  []
english_gloss: ""
observation: Socrates says that a person who lacks a craft cannot judge well what is said or done within that craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0079
source_work: Ion
stephanus_span: 538b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538b
  start_marker: 538b
  end_marker: 538b
  start_char: 16477
  end_char: 16895
  text_sha256: d0edc8fbcd4bacf85bccb30291e7220945a5c638247013ca74ea9f871c852cd9
greek_terms:
  []
english_gloss: ""
observation: Ion agrees that a charioteer judges Homer's charioteering passage better than a rhapsode does.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0080
source_work: Ion
stephanus_span: 538b-538c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538b-538c
  start_marker: 538b
  end_marker: 538c
  start_char: 16477
  end_char: 17174
  text_sha256: a682259d7c52ba6fe68f4c34c465a15a41a5a188c77f6d42c83cb2e51b07285e
greek_terms:
  - Μαχάονι
  - Ἑκαμήδη
  - κυκεῶνα
  - ἰατρικῆς
english_gloss: ""
observation: Ion agrees that medicine should judge Homer's description of the drink Hecamede gives the wounded Machaon.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0081
source_work: Ion
stephanus_span: 538c-538d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538c-538d
  start_marker: 538c
  end_marker: 538d
  start_char: 16895
  end_char: 17524
  text_sha256: 70a251c803fb1e8710095e9a41868e3b98e24f06cf50e39f10880bf5cbcb5d9f
greek_terms:
  - ἰατρικῆς
  - ἁλιευτικῆς
  - μολυβδαίνῃ
english_gloss: ""
observation: Ion agrees that fishing should judge Homer's description of the lead weight and bull's horn descending among fish.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0082
source_work: Ion
stephanus_span: 538e-539b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538e-539b
  start_marker: 538e
  end_marker: 539b
  start_char: 17524
  end_char: 18398
  text_sha256: ae1c2cfea40cec7ee14cc84ac0e2feed5c8456bd319a9fae837267a928c49c6e
greek_terms:
  - Θεοκλύμενος
  - Μελαμποδιδῶν
  - αἰετὸς
english_gloss: ""
observation: Socrates assigns the judgment of Theoclymenus' prophecy to the seer's craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0083
source_work: Ion
stephanus_span: 539b-539d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539b-539d
  start_marker: 539b
  end_marker: 539d
  start_char: 18165
  end_char: 18952
  text_sha256: f207cde5b29b0e9b1e01c58e8e1794971c6c53635e4eba7cf84cf1bbe8bc05e5
greek_terms:
  - αἰετὸς
  - δράκοντα
english_gloss: ""
observation: Socrates assigns the judgment of the eagle-and-snake omen in the Iliad to the seer's craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0084
source_work: Ion
stephanus_span: 539d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539d
  start_marker: 539d
  end_marker: 539d
  start_char: 18625
  end_char: 18952
  text_sha256: 5820a3097912fadfd9655a982952b76ccca8a12638ed92d9a40c3e76b3e9b205
greek_terms:
  []
english_gloss: ""
observation: Ion agrees that the seer should examine and judge prophetic passages.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0085
source_work: Ion
stephanus_span: 539e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539e
  start_marker: 539e
  end_marker: 539e
  start_char: 18952
  end_char: 19338
  text_sha256: cb1007f85443f8032dc357d4222c30ba87e2381f88618b81e8fd9c8639474129
greek_terms:
  - ἅπαντα
  - ἐπιλήσμονα
english_gloss: ""
observation: Socrates asks Ion to identify which Homeric passages belong to the rhapsode's craft to examine and judge.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0086
source_work: Ion
stephanus_span: 539e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539e
  start_marker: 539e
  end_marker: 539e
  start_char: 18952
  end_char: 19338
  text_sha256: cb1007f85443f8032dc357d4222c30ba87e2381f88618b81e8fd9c8639474129
greek_terms:
  - ἅπαντα
  - ἐπιλήσμονα
english_gloss: ""
observation: Ion initially says that every Homeric passage belongs to the rhapsode's craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0087
source_work: Ion
stephanus_span: 539e-540a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539e-540a
  start_marker: 539e
  end_marker: 540a
  start_char: 18952
  end_char: 19648
  text_sha256: a2350cf5b6691873282034af330847b2b9e270576ad68d6d0b975c44094cbff2
greek_terms:
  - ἅπαντα
  - ἐπιλήσμονα
english_gloss: ""
observation: Socrates reminds Ion that he agreed that rhapsody and charioteering are different crafts and know different objects.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0088
source_work: Ion
stephanus_span: 540b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540b
  start_marker: 540b
  end_marker: 540b
  start_char: 19648
  end_char: 20050
  text_sha256: 6820a30147245a832ef5ce6d29cf2abad7e11a1c686a882c9e4be4687433023c
greek_terms:
  - ἅπαντα
  - ἃ πρέπει
  - ἀνδρὶ
  - γυναικί
  - δούλῳ
  - ἐλευθέρῳ
  - ἀρχομένῳ
  - ἄρχοντι
english_gloss: ""
observation: Ion says that a rhapsode judges what is fitting for men, women, slaves, free people, subjects, and rulers to say.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0089
source_work: Ion
stephanus_span: 540b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540b
  start_marker: 540b
  end_marker: 540b
  start_char: 19648
  end_char: 20050
  text_sha256: 6820a30147245a832ef5ce6d29cf2abad7e11a1c686a882c9e4be4687433023c
greek_terms:
  - ἅπαντα
  - ἃ πρέπει
  - ἀνδρὶ
  - γυναικί
  - δούλῳ
  - ἐλευθέρῳ
  - ἀρχομένῳ
  - ἄρχοντι
english_gloss: ""
observation: Ion concedes that a pilot better judges what a ruler should say on a storm-tossed ship.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0090
source_work: Ion
stephanus_span: 540c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540c
  start_marker: 540c
  end_marker: 540c
  start_char: 20050
  end_char: 20405
  text_sha256: 0d90b465d73be56866a87a7d24726233951a6904591d8e54a3bf85cb8555a8ee
greek_terms:
  - ἃ πρέπει
  - δούλῳ
  - ἄρχοντι
  - βουκόλῳ
  - ταλασιουργῷ
english_gloss: ""
observation: Ion concedes that a doctor better judges what a ruler should say to a sick person.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0091
source_work: Ion
stephanus_span: 540c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540c
  start_marker: 540c
  end_marker: 540c
  start_char: 20050
  end_char: 20405
  text_sha256: 0d90b465d73be56866a87a7d24726233951a6904591d8e54a3bf85cb8555a8ee
greek_terms:
  - ἃ πρέπει
  - δούλῳ
  - ἄρχοντι
  - βουκόλῳ
  - ταλασιουργῷ
english_gloss: ""
observation: Ion concedes that a cowherd better judges what a slave should say while calming angry cattle.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0092
source_work: Ion
stephanus_span: 540c-540d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540c-540d
  start_marker: 540c
  end_marker: 540d
  start_char: 20050
  end_char: 20759
  text_sha256: e3db4f072d20b6346fbd79a8e68d6c8e409f051d630c5599e9238beccc49b8a8
greek_terms:
  - ἃ πρέπει
  - ἀνδρὶ
  - δούλῳ
  - ἄρχοντι
  - βουκόλῳ
  - ταλασιουργῷ
  - στρατηγῷ
english_gloss: ""
observation: Ion concedes that a rhapsode does not judge what a woman working wool should say about wool-working.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0093
source_work: Ion
stephanus_span: 540d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540d
  start_marker: 540d
  end_marker: 540d
  start_char: 20405
  end_char: 20759
  text_sha256: e67d0a5aa22eacf0a4cf6be56ae3aa0f57dfa566ab0b1871b40d2a39e8a14afe
greek_terms:
  - ἀνδρὶ
  - στρατηγῷ
english_gloss: ""
observation: Ion says that a rhapsode knows what a general should say while exhorting soldiers.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0094
source_work: Ion
stephanus_span: 540e-541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540e-541a
  start_marker: 540e
  end_marker: 541a
  start_char: 20759
  end_char: 21613
  text_sha256: c284e8573ce2a71c0d099fc995ed3b1fc27a31dd905b6fe22e9ff0c172338f5a
greek_terms:
  []
english_gloss: ""
observation: Socrates asks whether rhapsody and generalship are one craft or two.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0095
source_work: Ion
stephanus_span: 541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a
  start_marker: 541a
  end_marker: 541a
  start_char: 21229
  end_char: 21613
  text_sha256: 6255fba5da1a2303673ebe4f3ff9df63785d5397f0cda093620fb53fbddda90e
greek_terms:
  []
english_gloss: ""
observation: Ion says that rhapsody and generalship are one craft.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0096
source_work: Ion
stephanus_span: 541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a
  start_marker: 541a
  end_marker: 541a
  start_char: 21229
  end_char: 21613
  text_sha256: 6255fba5da1a2303673ebe4f3ff9df63785d5397f0cda093620fb53fbddda90e
greek_terms:
  []
english_gloss: ""
observation: Ion agrees that every good rhapsode is also a good general.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0097
source_work: Ion
stephanus_span: 541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a
  start_marker: 541a
  end_marker: 541a
  start_char: 21229
  end_char: 21613
  text_sha256: 6255fba5da1a2303673ebe4f3ff9df63785d5397f0cda093620fb53fbddda90e
greek_terms:
  []
english_gloss: ""
observation: Ion denies that every good general is also a good rhapsode.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0098
source_work: Ion
stephanus_span: 541a-541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a-541b
  start_marker: 541a
  end_marker: 541b
  start_char: 21229
  end_char: 22010
  text_sha256: fdd9b91fb3c3f3d3e57b20c11440e644823d300f3f903a81bcef54a1662ee3eb
greek_terms:
  - ἄριστος ῥαψῳδὸς
  - ἐκ τῶν Ὁμήρου μαθών
english_gloss: ""
observation: Ion maintains that every good rhapsode is necessarily a good general.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0099
source_work: Ion
stephanus_span: 541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541b
  start_marker: 541b
  end_marker: 541b
  start_char: 21613
  end_char: 22010
  text_sha256: 41db0e0e0b0683b984a985c02c222903c3a8b50416b7c588b9e03999b0dd8454
greek_terms:
  - ἄριστος ῥαψῳδὸς
  - ἐκ τῶν Ὁμήρου μαθών
english_gloss: ""
observation: Ion claims that he is the best general among the Greeks.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0100
source_work: Ion
stephanus_span: 541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541b
  start_marker: 541b
  end_marker: 541b
  start_char: 21613
  end_char: 22010
  text_sha256: 41db0e0e0b0683b984a985c02c222903c3a8b50416b7c588b9e03999b0dd8454
greek_terms:
  - ἄριστος ῥαψῳδὸς
  - ἐκ τῶν Ὁμήρου μαθών
english_gloss: ""
observation: Ion says that he learned generalship from Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0101
source_work: Ion
stephanus_span: 541b-541c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541b-541c
  start_marker: 541b
  end_marker: 541c
  start_char: 21613
  end_char: 22446
  text_sha256: b9e670d74358e3b131607d3103200feaef7bf7e4f0eef0c2798ab11af47c2a4b
greek_terms:
  - στρατηγὸν
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates asks why Ion performs as a rhapsode but does not serve as a general.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0102
source_work: Ion
stephanus_span: 541c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541c
  start_marker: 541c
  end_marker: 541c
  start_char: 22010
  end_char: 22446
  text_sha256: d7c80f9d2232584a4b3e0ab79f6b282b1a4d3863eae430c5dcc4a4dd6ca11d7b
greek_terms:
  - στρατηγὸν
  - Ἀθηναῖοι
english_gloss: ""
observation: Ion says that Ephesus is ruled and commanded by Athens and therefore needs no general of its own.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0103
source_work: Ion
stephanus_span: 541c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541c
  start_marker: 541c
  end_marker: 541c
  start_char: 22010
  end_char: 22446
  text_sha256: d7c80f9d2232584a4b3e0ab79f6b282b1a4d3863eae430c5dcc4a4dd6ca11d7b
greek_terms:
  - στρατηγὸν
  - Ἀθηναῖοι
english_gloss: ""
observation: Ion says that Athens and Sparta would not elect him because they consider themselves sufficient.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0104
source_work: Ion
stephanus_span: 541c-541d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541c-541d
  start_marker: 541c
  end_marker: 541d
  start_char: 22010
  end_char: 22792
  text_sha256: ebd71c752c07eb467f91a4ad3e7db261755464d13fba528058d029c4ae120c82
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates says that Athens repeatedly elected Apollodorus of Cyzicus as a general although he was a foreigner.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0105
source_work: Ion
stephanus_span: 541d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541d
  start_marker: 541d
  end_marker: 541d
  start_char: 22446
  end_char: 22792
  text_sha256: 9978c48d4cf645bfbea2d9af02e03b6dfa1129de2a54b9b4308794158978ac75
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates says that Athens appointed Phanosthenes of Andros to offices although he was a foreigner.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0106
source_work: Ion
stephanus_span: 541d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541d
  start_marker: 541d
  end_marker: 541d
  start_char: 22446
  end_char: 22792
  text_sha256: 9978c48d4cf645bfbea2d9af02e03b6dfa1129de2a54b9b4308794158978ac75
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates says that Athens appointed Heraclides of Clazomenae to offices although he was a foreigner.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0107
source_work: Ion
stephanus_span: 541d-541e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541d-541e
  start_marker: 541d
  end_marker: 541e
  start_char: 22446
  end_char: 23250
  text_sha256: 42e6ffdb4c171bbf0b96b8ed7079e83ee52cbf5a608a2be6dbf2d4b5f86b1a25
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates says that the Ephesians were Athenians in ancient times.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0108
source_work: Ion
stephanus_span: 541d-541e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541d-541e
  start_marker: 541d
  end_marker: 541e
  start_char: 22446
  end_char: 23250
  text_sha256: 42e6ffdb4c171bbf0b96b8ed7079e83ee52cbf5a608a2be6dbf2d4b5f86b1a25
greek_terms:
  - Φανοσθένη τὸν Ἄνδριον
  - Ἡρακλείδην τὸν Κλαζομένιον
  - ξένον ὄντα
  - στρατηγὸν
  - Ἐφέσιοι
  - Ἀθηναῖοι
english_gloss: ""
observation: Socrates says that Ephesus is inferior to no city.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0109
source_work: Ion
stephanus_span: 541e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541e
  start_marker: 541e
  end_marker: 541e
  start_char: 22792
  end_char: 23250
  text_sha256: 8104aa090f548780d04e532bea8889dc80bc6d0067e7156b1ee68799b1ff885d
greek_terms:
  - Πρωτεὺς
  - παντοδαπὸς
  - στρεφόμενος ἄνω καὶ κάτω
english_gloss: ""
observation: Socrates accuses Ion of deceiving him after promising but failing to display his knowledge about Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0110
source_work: Ion
stephanus_span: 541e-542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541e-542a
  start_marker: 541e
  end_marker: 542a
  start_char: 22792
  end_char: 23636
  text_sha256: b1c2cfddf428728bcd2333045cc05ea7082ac0583a6ee0d2d9907af3f7979cef
greek_terms:
  - Πρωτεὺς
  - παντοδαπὸς
  - στρεφόμενος ἄνω καὶ κάτω
  - τεχνικὸς
  - θείᾳ μοίρᾳ κατεχόμενος
  - ἄδικος
  - θεῖος
english_gloss: ""
observation: Socrates compares Ion's evasions to Proteus changing shape until he finally appears as a general.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0111
source_work: Ion
stephanus_span: 542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542a
  start_marker: 542a
  end_marker: 542a
  start_char: 23250
  end_char: 23636
  text_sha256: 3d606aff0b5eb5355b9dd766f17ef506504c223977e3ba1176cefae022ecac67
greek_terms:
  - τεχνικὸς
  - θείᾳ μοίρᾳ κατεχόμενος
  - ἄδικος
  - θεῖος
english_gloss: ""
observation: Socrates says that Ion is unjust if he possesses a craft yet deceives Socrates after promising a display.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0112
source_work: Ion
stephanus_span: 542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542a
  start_marker: 542a
  end_marker: 542a
  start_char: 23250
  end_char: 23636
  text_sha256: 3d606aff0b5eb5355b9dd766f17ef506504c223977e3ba1176cefae022ecac67
greek_terms:
  - τεχνικὸς
  - θείᾳ μοίρᾳ κατεχόμενος
  - ἄδικος
  - θεῖος
english_gloss: ""
observation: Socrates says that Ion is not unjust if divine possession makes him speak finely about Homer without knowledge.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0113
source_work: Ion
stephanus_span: 542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542a
  start_marker: 542a
  end_marker: 542a
  start_char: 23250
  end_char: 23636
  text_sha256: 3d606aff0b5eb5355b9dd766f17ef506504c223977e3ba1176cefae022ecac67
greek_terms:
  - τεχνικὸς
  - θείᾳ μοίρᾳ κατεχόμενος
  - ἄδικος
  - θεῖος
english_gloss: ""
observation: Socrates asks Ion to choose whether he wishes to be regarded as unjust or divine.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0114
source_work: Ion
stephanus_span: 542b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542b
  start_marker: 542b
  end_marker: 542b
  start_char: 23636
  end_char: 23821
  text_sha256: 85a204e054d53bebb77b39b426289d4310075dc97ae79980f71f94c0098ae06f
greek_terms:
  []
english_gloss: ""
observation: Ion says that it is much finer to be regarded as divine.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0115
source_work: Ion
stephanus_span: 542b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542b
  start_marker: 542b
  end_marker: 542b
  start_char: 23636
  end_char: 23821
  text_sha256: 85a204e054d53bebb77b39b426289d4310075dc97ae79980f71f94c0098ae06f
greek_terms:
  []
english_gloss: ""
observation: Socrates grants Ion the description of a divine rather than technical praiser of Homer.
textual_basis: The frozen Greek interval separately states this proposition within the audited record's original source bounds.
limits: This replacement preserves one explicit textual act or proposition and does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0116
source_work: Ion
stephanus_span: 530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b
  start_marker: 530b
  end_marker: 530b
  start_char: 294
  end_char: 775
  text_sha256: 7d2b4a6d79c9f42dabd0bd79895d1f37026a5c3dc7715448bef50f5b51d0974c
greek_terms:
  []
english_gloss: ""
observation: Socrates says that the rhapsode's craft requires rhapsodes to adorn their bodies and appear as beautiful as possible.
textual_basis: The exact cited Greek interval explicitly supplies this single textual fact.
limits: This observation records only the explicit source statement; it does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0117
source_work: Ion
stephanus_span: 530b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b
  start_marker: 530b
  end_marker: 530b
  start_char: 294
  end_char: 775
  text_sha256: 7d2b4a6d79c9f42dabd0bd79895d1f37026a5c3dc7715448bef50f5b51d0974c
greek_terms:
  []
english_gloss: ""
observation: Socrates says that the rhapsode's craft requires sustained engagement with many good poets.
textual_basis: The exact cited Greek interval explicitly supplies this single textual fact.
limits: This observation records only the explicit source statement; it does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0118
source_work: Ion
stephanus_span: 530b-530c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530b-530c
  start_marker: 530b
  end_marker: 530c
  start_char: 294
  end_char: 1237
  text_sha256: 5a6ec2fd68a4c68f6e2042f4b43abf61e61dd660372bd4938ee9d292c2a57600
greek_terms:
  []
english_gloss: ""
observation: Socrates calls Homer the best and most divine poet while describing the rhapsode's required engagement with him.
textual_basis: The exact cited Greek interval explicitly supplies this single textual fact.
limits: This observation records only the explicit source statement; it does not infer endorsement, absence, counterevidence, or a general doctrine.
review_status: accepted
```

```yaml
observation_id: obs_ion_0119
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
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: A rhapsode must become an interpreter of the poet's thought for the hearers, and it is impossible to do this well without knowing what the poet means."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0001
review_status: accepted
```

```yaml
observation_id: obs_ion_0120
source_work: Ion
stephanus_span: 530d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 530d
  start_marker: 530d
  end_marker: 530d
  start_char: 1237
  end_char: 1648
  text_sha256: 3406d87fe3a23c20ecfd586d9e9cc5fb640f62ff0db490fc58c588fc14c13218
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion claims to speak about Homer better than any other person, naming Metrodorus of Lampsacus, Stesimbrotus of Thasos, and Glaucon as inferior in producing many fine thoughts about Homer."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0002
review_status: accepted
```

```yaml
observation_id: obs_ion_0121
source_work: Ion
stephanus_span: 531a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531a
  start_marker: 531a
  end_marker: 531a
  start_char: 1648
  end_char: 2023
  text_sha256: f5ffea8022451f8fe68bb830144887f8d574aced0a674493202c1b9604817c9d
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion claims expertise only about Homer, not about Hesiod or Archilochus."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0003
review_status: accepted
```

```yaml
observation_id: obs_ion_0122
source_work: Ion
stephanus_span: 531e-532a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 531e-532a
  start_marker: 531e
  end_marker: 532a
  start_char: 3332
  end_char: 4304
  text_sha256: 3a3db2179ca374fc3f9f1634adf82f1e55f00449fd1c2d85a9b111b37344fad5
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The person who can recognize who speaks well on a subject can also recognize who speaks badly on the same subject; if someone cannot recognize the bad speaker, he clearly cannot recognize the good one either."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0005
review_status: accepted
```

```yaml
observation_id: obs_ion_0123
source_work: Ion
stephanus_span: 532a-532b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532a-532b
  start_marker: 532a
  end_marker: 532b
  start_char: 3872
  end_char: 4760
  text_sha256: 48f3127007b025b9c2e647694c68f903cf1c2c4f26aa03c4edcdebacfc9f140d
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Since Ion claims to know the good speaker (Homer), and the poets treat the same subjects, Ion should also recognize that the other poets speak worse on those same subjects."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0006
review_status: accepted
```

```yaml
observation_id: obs_ion_0124
source_work: Ion
stephanus_span: 532c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532c
  start_marker: 532c
  end_marker: 532c
  start_char: 4760
  end_char: 5189
  text_sha256: 976fb9ed5ebdc09fa3e8365a6cd117f36b56658989bd3ef9a0ba9f77b0c4c1a6
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion's inability to speak about other poets shows that he does not speak about Homer by art and knowledge, because if he could speak by art, he would be able to speak about all poets, since poetic art is a whole."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0007
review_status: accepted
```

```yaml
observation_id: obs_ion_0125
source_work: Ion
stephanus_span: 532d-532e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 532d-532e
  start_marker: 532d
  end_marker: 532e
  start_char: 5189
  end_char: 6082
  text_sha256: 24fd7013cb704228ce44ad127d03bfc58ea71cab75f559983b373a9f8b5cd88e
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: When one takes any whole art, the same mode of inquiry applies to all the arts, as illustrated by painting: someone who can judge Polygnotus' works must also be able to judge other painters' works."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0008
review_status: accepted
```

```yaml
observation_id: obs_ion_0126
source_work: Ion
stephanus_span: 533d-533e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 533d-533e
  start_marker: 533d
  end_marker: 533e
  start_char: 7350
  end_char: 8201
  text_sha256: 3b5243e14a0a41a623e989dde03e573d578d3459834e57ce1fd035742debb957
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion's ability to speak well about Homer is not by art but by a divine power that moves him, like the magnetic stone that not only attracts iron rings but imparts power to them to attract others in a chain."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0009
review_status: accepted
```

```yaml
observation_id: obs_ion_0127
source_work: Ion
stephanus_span: 534b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534b
  start_marker: 534b
  end_marker: 534b
  start_char: 8591
  end_char: 9042
  text_sha256: c14d36274752f18e5222f5c31b277e1e635e6808302d76b9eaea43d93351fb4a
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: A poet is a light, winged, and sacred thing, unable to compose until he is inspired and out of his mind and his intellect is no longer in him."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0011
review_status: accepted
```

```yaml
observation_id: obs_ion_0128
source_work: Ion
stephanus_span: 534c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534c
  start_marker: 534c
  end_marker: 534c
  start_char: 9042
  end_char: 9488
  text_sha256: 517225ecae4a68c2f44c4bd482523946f26808099ee387238f2b012f826d702e
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Because poets compose not by art but by divine dispensation, each is able to compose well only in the single genre to which the Muse has impelled him — dithyrambs, encomia, hyporchemata, epic, or iambics — and is worthless in the others."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0012
review_status: accepted
```

```yaml
observation_id: obs_ion_0129
source_work: Ion
stephanus_span: 534c-534d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534c-534d
  start_marker: 534c
  end_marker: 534d
  start_char: 9042
  end_char: 9936
  text_sha256: 36922a0bc7d5225b1576a099fcf728b59742b3d86d734a4ec5adbeb15abfca63
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The god takes away the intellect of poets and uses them as servants, along with oracle-givers and divine prophets, so that hearers may know that it is not they who speak these valuable things — since they lack intellect — but the god himself speaks through them."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0013
review_status: accepted
```

```yaml
observation_id: obs_ion_0130
source_work: Ion
stephanus_span: 534d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534d
  start_marker: 534d
  end_marker: 534d
  start_char: 9488
  end_char: 9936
  text_sha256: 6816e1f8990da156cc6c7b66596f88156722b7ffaf9b8839208c6fe549013e50
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Tynnichus the Chalcidian composed no other poem worth mentioning but produced the paean that everyone sings, which is nearly the most beautiful of all songs — offered as the greatest proof of the divine-dispensation thesis."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0014
review_status: accepted
```

```yaml
observation_id: obs_ion_0131
source_work: ion
stephanus_span: 534e-535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 534e-535a
  start_marker: 534e
  end_marker: 535a
  start_char: 9936
  end_char: 10664
  text_sha256: adbbabb6f036a3316d07ca480b3bd3e50f6e6aafac3df02571c07642231777bd
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Beautiful poems are divine and belong to the gods, not human; poets are nothing but interpreters of the gods, each possessed by whatever god possesses him."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0015
review_status: accepted
```

```yaml
observation_id: obs_ion_0132
source_work: ion
stephanus_span: 535a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535a
  start_marker: 535a
  end_marker: 535a
  start_char: 10280
  end_char: 10664
  text_sha256: 1ec819919b7d75ff8943667b3a821c94ee2f070af44c98e508636759aef779e6
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Rhapsodes are interpreters of the poets, and therefore interpreters of interpreters."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0016
review_status: accepted
```

```yaml
observation_id: obs_ion_0133
source_work: ion
stephanus_span: 535b-535d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535b-535d
  start_marker: 535b
  end_marker: 535d
  start_char: 10664
  end_char: 11854
  text_sha256: da253ed622d4a69aca6575f73b79dbaaf499ae3927d66d2d7f1711f569c62588
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: When a rhapsode performs well, he is not in his right mind but outside himself, with his soul believing it is present at the events described."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0017
review_status: accepted
```

```yaml
observation_id: obs_ion_0134
source_work: ion
stephanus_span: 535e-536a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 535e-536a
  start_marker: 535e
  end_marker: 536a
  start_char: 11854
  end_char: 12772
  text_sha256: 098186eec85a924000533a727c526e810731e979a5b9d62c09c7c54ce4ac91f9
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The god draws human souls through a chain of possession—poet as first ring, rhapsode and actor as middle ring, spectator as last ring—like magnetic power transmitted through rings from the Heraclean stone."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0018
review_status: accepted
```

```yaml
observation_id: obs_ion_0135
source_work: ion
stephanus_span: 536b-536c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 536b-536c
  start_marker: 536b
  end_marker: 536c
  start_char: 12772
  end_char: 13614
  text_sha256: e57fe1f39052fd166a413ce20e5324d3b3064a64d640be944aecf1d597827874
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion speaks well about Homer not by art or knowledge but by divine lot and possession, just as Corybantes perceive only the song of the god possessing them."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0019
review_status: accepted
```

```yaml
observation_id: obs_ion_0136
source_work: ion
stephanus_span: 539d-540a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 539d-540a
  start_marker: 539d
  end_marker: 540a
  start_char: 18625
  end_char: 19648
  text_sha256: 44c27c7d30c83360496c862f285c3dc6de7f18c7b475896f98158bd49c38ea3a
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The rhapsode and rhapsodic art know everything in Homer."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0021
review_status: accepted
```

```yaml
observation_id: obs_ion_0137
source_work: Ion
stephanus_span: 540c-540d
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 540c-540d
  start_marker: 540c
  end_marker: 540d
  start_char: 20050
  end_char: 20759
  text_sha256: e3db4f072d20b6346fbd79a8e68d6c8e409f051d630c5599e9238beccc49b8a8
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The rhapsode knows what it is fitting for a man who is a general to say when exhorting his soldiers."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0022
review_status: accepted
```

```yaml
observation_id: obs_ion_0138
source_work: Ion
stephanus_span: 541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a
  start_marker: 541a
  end_marker: 541a
  start_char: 21229
  end_char: 21613
  text_sha256: 6255fba5da1a2303673ebe4f3ff9df63785d5397f0cda093620fb53fbddda90e
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: The rhapsodic art and the general's art are one and the same."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0023
review_status: accepted
```

```yaml
observation_id: obs_ion_0139
source_work: Ion
stephanus_span: 541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541b
  start_marker: 541b
  end_marker: 541b
  start_char: 21613
  end_char: 22010
  text_sha256: 41db0e0e0b0683b984a985c02c222903c3a8b50416b7c588b9e03999b0dd8454
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion is the best rhapsode among the Greeks and also the best general among the Greeks, having learned these things from Homer."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0025
review_status: accepted
```

```yaml
observation_id: obs_ion_0140
source_work: Ion
stephanus_span: 541c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541c
  start_marker: 541c
  end_marker: 541c
  start_char: 22010
  end_char: 22446
  text_sha256: d7c80f9d2232584a4b3e0ab79f6b282b1a4d3863eae430c5dcc4a4dd6ca11d7b
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ephesus is ruled and commanded by the Athenians and has no need of a general, while Athens and Sparta would not choose Ion as general because they consider themselves sufficient."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0026
review_status: accepted
```

```yaml
observation_id: obs_ion_0141
source_work: Ion
stephanus_span: 541e-542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541e-542a
  start_marker: 541e
  end_marker: 542a
  start_char: 22792
  end_char: 23636
  text_sha256: b1c2cfddf428728bcd2333045cc05ea7082ac0583a6ee0d2d9907af3f7979cef
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: If Ion truly possesses an art and knowledge by which he is able to praise Homer, then he acts unjustly by failing to demonstrate what he knows despite having promised to do so."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0027
review_status: accepted
```

```yaml
observation_id: obs_ion_0142
source_work: Ion
stephanus_span: 542a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542a
  start_marker: 542a
  end_marker: 542a
  start_char: 23250
  end_char: 23636
  text_sha256: 3d606aff0b5eb5355b9dd766f17ef506504c223977e3ba1176cefae022ecac67
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: If Ion is not possessed of an art but is divinely possessed and says many fine things about Homer while knowing nothing, then he does no wrong."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0028
review_status: accepted
```

```yaml
observation_id: obs_ion_0143
source_work: Ion
stephanus_span: 542b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 542b
  start_marker: 542b
  end_marker: 542b
  start_char: 23636
  end_char: 23821
  text_sha256: 85a204e054d53bebb77b39b426289d4310075dc97ae79980f71f94c0098ae06f
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: It is far better to be considered divine than unjust."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0029
review_status: accepted
```

```yaml
observation_id: obs_ion_0144
source_work: ion
stephanus_span: 537c
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537c
  start_marker: 537c
  end_marker: 537c
  start_char: 14949
  end_char: 15332
  text_sha256: 85705af3dcdc41fd180cb8328e41d45c654463e5601e952c751a80ccea9e3a67
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Socrates says that the god assigns each craft a distinct work that it is able to know."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0031
review_status: accepted
```

```yaml
observation_id: obs_ion_0145
source_work: ion
stephanus_span: 537d-537e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537d-537e
  start_marker: 537d
  end_marker: 537e
  start_char: 15332
  end_char: 16093
  text_sha256: f877319dcdeacc1481ebb872e2411c4c9b94f2806dcdd95098d5b0546277eea4
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Socrates says that crafts are different when they know different objects."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0032
review_status: accepted
```

```yaml
observation_id: obs_ion_0146
source_work: ion
stephanus_span: 537e
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 537e
  start_marker: 537e
  end_marker: 537e
  start_char: 15675
  end_char: 16093
  text_sha256: e3e57c1248e0700a6635bc0484114929273a2fbc92ef890a61e5bab0eb0b7127
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Socrates says that the same craft necessarily knows the same objects."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0033
review_status: accepted
```

```yaml
observation_id: obs_ion_0147
source_work: ion
stephanus_span: 538a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538a
  start_marker: 538a
  end_marker: 538a
  start_char: 16093
  end_char: 16477
  text_sha256: ce136aa9c7b9b9f45436a8e45c2199c5fe96709c2032994d3f618c9084e4583c
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Socrates says that different crafts necessarily know different objects."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0034
review_status: accepted
```

```yaml
observation_id: obs_ion_0148
source_work: ion
stephanus_span: 538a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 538a
  start_marker: 538a
  end_marker: 538a
  start_char: 16093
  end_char: 16477
  text_sha256: ce136aa9c7b9b9f45436a8e45c2199c5fe96709c2032994d3f618c9084e4583c
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Socrates says that a person who lacks a craft cannot judge well what is said or done within that craft."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0035
review_status: accepted
```

```yaml
observation_id: obs_ion_0149
source_work: Ion
stephanus_span: 541a-541b
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a-541b
  start_marker: 541a
  end_marker: 541b
  start_char: 21229
  end_char: 22010
  text_sha256: fdd9b91fb3c3f3d3e57b20c11440e644823d300f3f903a81bcef54a1662ee3eb
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion agrees that every good rhapsode is also a good general."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0036
review_status: accepted
```

```yaml
observation_id: obs_ion_0150
source_work: Ion
stephanus_span: 541a
source_ref:
  source_path: raw/plato/greek/ion.txt
  stephanus_span: 541a
  start_marker: 541a
  end_marker: 541a
  start_char: 21229
  end_char: 21613
  text_sha256: 6255fba5da1a2303673ebe4f3ff9df63785d5397f0cda093620fb53fbddda90e
greek_terms:
  []
english_gloss: ""
observation: "The cited passage explicitly states: Ion denies that every good general is also a good rhapsode."
textual_basis: The exact cited Greek interval explicitly supplies this attributed proposition.
limits: This observation records only the exact source attribution; it does not infer endorsement, truth, absence, counterevidence, or a general doctrine.
supports_claim_ids:
  - claim_ion_0037
review_status: accepted
```
