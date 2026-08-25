# Lesser Hippias needs_split scratch repair review

Scope: independent advisory review of the 16 current `needs_split` records in
`wiki/observations/lesser-hippias.md`.

Method: inspected the current ledger records, same-span accepted neighbors, and
Greek source spans from `raw/plato/greek/lesser-hippias.txt` using
`resolveSourceSpan("lesser-hippias", span)` from
`packages/harness/src/source.ts`. No translation files, Pioneer,
provider-backed harness/review paths, external model/provider runs,
non-dry-run `review-segmented`, or `review-queue` were used. Greek passages are
not copied below; only short `greek_terms` are cited.

Summary: `accept_narrowed=15`, `reject=1`, `leave_blocked_source_ref=0`.

## obs_lesser-hippias_0003

- Recommendation: `accept_narrowed`.
- Exact source ref: `363b-363c`; `start=325`; `end=1080`;
  `sha=fc055705a2dabc30820ebf89eae87063a54433fe044eea0cff07528524ae46d9`.
- Feature decision: keep
  `dramatic_case_setup/homeric_poem_ranking_as_entry_point`
  (`feature_candidate_1376`).
- Suggested `greek_terms`: [`Ἰλιὰς`, `Ὀδύσσεια`, `κάλλιον`,
  `ἀμείνων`, `Ἀχιλλεὺς`, `Ὀδυσσέως`].
- Replacement guidance: narrow to Socrates' launch question: he reports
  Apemantus' Iliad/Odyssey ranking as grounded in Achilles being better than
  Odysseus, then uses that reported ranking to ask what Hippias says about the
  two men.
- Limits guidance: do not include Eudicus' mediation of the exchange or
  Hippias' festival self-presentation; accepted neighbors already carry those
  opening dramatic functions.

## obs_lesser-hippias_0007

- Recommendation: `accept_narrowed`.
- Exact source ref: `364a`; `start=1308`; `end=1731`;
  `sha=23644d89987a188652091a8ed5418ff54d5f1673697e3cac88ffe90711bacd0b`.
- Feature decision: keep `prosopography/sophist_self_advertisement`
  (`feature_candidate_1380`).
- Suggested `greek_terms`: [`Ὀλυμπίασιν ἀγωνίζεσθαι`, `οὐδενὶ`,
  `κρείττονι`, `ἐμαυτοῦ`, `ἐνέτυχον`].
- Replacement guidance: narrow to Hippias' maximal self-advertisement at
  Olympia: since beginning to compete at Olympia, he says he has never met
  anyone superior to himself in anything.
- Limits guidance: do not include Socrates' follow-up question at `364b` or
  the later Homeric ranking; this record should only preserve Hippias'
  self-claim.

## obs_lesser-hippias_0018

- Recommendation: `accept_narrowed`.
- Exact source ref: `366d`; `start=6605`; `end=6931`;
  `sha=9a325064cdfefc0806782b47ab3eb67599e47061e4c283f48967be19a66f4461`.
- Feature decision: keep
  `elenchus/expertise_claim_narrowed_by_craft_test`
  (`feature_candidate_1096`).
- Suggested `greek_terms`: [`δυνατώτατος`, `σοφώτατος`, `ἄριστος`,
  `λογιστικά`].
- Replacement guidance: narrow to the calculation-domain claim: Socrates gets
  Hippias to say he is not only most able and wisest in calculation, but also
  best in the same respect.
- Limits guidance: do not duplicate the accepted handwriting model in
  `obs_lesser-hippias_0020` or the same-span assent pattern in
  `obs_lesser-hippias_0019`.

## obs_lesser-hippias_0024

- Recommendation: `accept_narrowed`.
- Exact source ref: `367d`; `start=8575`; `end=8962`;
  `sha=b358d02998c15ae7d42aae4ba7b8eee9946b62aa37b27433c88c02fa3a8d4137`.
- Feature decision: keep `elenchus/assent_chain`
  (`feature_candidate_071`).
- Suggested `greek_terms`: [`γεωμετρίας`, `δυνατώτατος`,
  `ψεύδεσθαι`, `ἀληθῆ λέγειν`, `διαγραμμάτων`, `ναί`].
- Replacement guidance: narrow to the geometry step: Socrates asks whether the
  same geometer is most able to lie and tell the truth about diagrams, and
  Hippias gives the short assent.
- Limits guidance: do not retain the current astronomy language; `367e` only
  announces the astronomer after the geometric conclusion and is already partly
  covered by accepted `obs_lesser-hippias_0026`.

## obs_lesser-hippias_0025

- Recommendation: `accept_narrowed`.
- Exact source ref: `367d`; `start=8575`; `end=8962`;
  `sha=b358d02998c15ae7d42aae4ba7b8eee9946b62aa37b27433c88c02fa3a8d4137`.
- Feature decision: keep `turn_geometry/procedural_agreement_to_inquire`
  (`feature_candidate_1105`).
- Suggested `greek_terms`: [`βούλει`, `σκεψώμεθα`, `εἰ ... σὺ βούλει`,
  `ἄλλοθι`, `γεωμετρίας`].
- Replacement guidance: narrow to the procedural permission before the
  geometry test: Socrates proposes examining the issue elsewhere, and Hippias
  consents on the condition that Socrates wants to do so.
- Limits guidance: do not claim Hippias separately consents to astronomy at
  `367e`; there Socrates announces the next examination after Hippias' assent
  to the geometric result.

## obs_lesser-hippias_0029

- Recommendation: `accept_narrowed`.
- Exact source ref: `368a`; `start=9383`; `end=9799`;
  `sha=59f0ac7ab5d6b043f09a0a321c17c01f919ee5a6062af2ff449c8dbafe88bc31`.
- Feature decision: keep `elenchus/parallel_predicate_chain`
  (`feature_candidate_1638`).
- Suggested `greek_terms`: [`ἀστρονομίᾳ`, `ψευδής`,
  `ἀγαθὸς ἀστρονόμος`, `ἀληθής τε καὶ ψευδής`, `ἔοικεν`].
- Replacement guidance: narrow to the astronomy repetition: Socrates applies
  the same truthful/false predicate chain to the astronomer and secures
  Hippias' assent that the same person will be both truthful and false in
  astronomy.
- Limits guidance: do not include the all-sciences challenge at `368b` or the
  prior arithmetic/calculation material; those are separate steps.

## obs_lesser-hippias_0031

- Recommendation: `accept_narrowed`.
- Exact source ref: `368b`; `start=9799`; `end=10175`;
  `sha=64b9c4ef8b6bdc7ef0e90a51e1496a40d7e4d6b0af370215ce4aca9b9709a728`.
- Feature decision: keep
  `craft_analogy/polymathy_as_universal_craft_mastery`
  (`feature_candidate_1640`).
- Suggested `greek_terms`: [`πασῶν τῶν ἐπιστημῶν`,
  `πλείστας τέχνας`, `σοφώτατος`, `Ὀλυμπίαν`,
  `ἅπαντα σαυτοῦ ἔργα`].
- Replacement guidance: narrow to Socrates' pivot from all sciences to
  Hippias' advertised polymathy: Socrates invites Hippias to examine all
  sciences and immediately grounds that challenge in Hippias' claim to be
  wisest in the most crafts.
- Limits guidance: do not enumerate the full self-made object and performance
  catalog here; `368c-368d` should carry that catalog.

## obs_lesser-hippias_0042

- Recommendation: `accept_narrowed`.
- Exact source ref: `369e`; `start=12975`; `end=13261`;
  `sha=35089c1197ac25d7a1ce6c265f575db9a900e3b624e2e6f687c6b7c6fbb61778`.
- Feature decision: keep `dramatic_case_setup/initial_question_stated`
  (`feature_candidate_083`).
- Suggested `greek_terms`: [`ἐννενόηκα`, `ἔπεσιν`, `Ἀχιλλέα`,
  `Ὀδυσσέα`, `ἀλαζόνα`, `ἄτοπον`].
- Replacement guidance: narrow to Socrates' topic-anchoring move: he says he
  noticed something strange in the verses Hippias cited, where Achilles
  addresses Odysseus as a braggart.
- Limits guidance: do not include Socrates' broader self-described
  questioning method from `369d`; accepted `obs_lesser-hippias_0040` and
  `obs_lesser-hippias_0041` already cover that preamble.

## obs_lesser-hippias_0043

- Recommendation: `accept_narrowed`.
- Exact source ref option A: `368c`; `start=10175`; `end=10630`;
  `sha=d125aab3156e668f2fc4f6b0db7ebbda023821a1d0df1b9add34185f13c3867`.
- Exact source ref option B: `368d`; `start=10630`; `end=11021`;
  `sha=f584e0a0008445c6e1a8e4ea583a22d748f63ee1bfc05fcccc4b8d9a3d2f453e`.
- Feature decision: keep `prosopography/sophist_self_presentation`
  (`feature_candidate_1377`), but split the current omnibus catalog into two
  accepted records if applying the repair.
- Suggested `greek_terms` option A: [`δακτυλίους γλύφειν`, `σφραγῖδα`,
  `στλεγγίδα`, `λήκυθον`, `ὑποδήματα`, `ἱμάτιον`, `ζώνην`].
- Suggested `greek_terms` option B: [`ποιήματα`, `ἔπη`, `τραγῳδίας`,
  `διθυράμβους`, `λόγους`, `ῥυθμῶν`, `ἁρμονιῶν`,
  `γραμμάτων ὀρθότητος`].
- Replacement guidance: split into a bodily artifact self-presentation record
  at `368c` and a poetic/technical expertise self-presentation record at
  `368d`.
- Limits guidance: do not include Socrates' memory-disavowal or the reported
  crowd reaction as part of either replacement; accepted
  `obs_lesser-hippias_0044` and `obs_lesser-hippias_0045` already cover those
  functions.

## obs_lesser-hippias_0049

- Recommendation: `accept_narrowed`.
- Exact source ref: `371b-371c`; `start=15499`; `end=16087`;
  `sha=94288bf29098be978375fc13f76893928e9627daf662c617b8ecc4e7d0cae7d7`.
- Feature decision: keep `frame_depth/embedded_homeric_quotation`
  (`feature_candidate_1800`).
- Suggested `greek_terms`: [`ἐν οἷς λέγει`, `οὐ γὰρ πρὶν`, `Ἕκτορα`,
  `Μυρμιδόνων`, `σὺ δὴ οὖν`].
- Replacement guidance: source-correct the record: the embedded quotation is
  introduced at `371b` and continues through `371c`, after which Socrates
  turns back to Hippias with an interpretive question.
- Limits guidance: do not use the current `371c-371d` span for the quotation
  record; it misses the introduction and first quoted line while pulling in
  the separate character-consistency challenge covered by accepted neighbors.

## obs_lesser-hippias_0052

- Recommendation: `accept_narrowed`.
- Exact source ref: `371a`; `start=15067`; `end=15499`;
  `sha=70954b5300271267c235f0b13c1391d628106f00caa364cad29cb961ded3a050`.
- Feature decision: keep
  `dramatic_case_setup/thesis_stated_in_opening_exchange`
  (`feature_candidate_1285`).
- Suggested `greek_terms`: [`οὐκ ἐξ ἐπιβουλῆς`, `Ἀχιλλέα`,
  `ψεύδεσθαι`, `γόης`, `ἐπίβουλος`, `ἀλαζονείᾳ`].
- Replacement guidance: narrow to Socrates' formulation of Hippias' thesis and
  counter-thesis: Hippias says Achilles does not lie from design, while
  Socrates immediately casts Achilles as deceptive and plotting.
- Limits guidance: do not include the Homeric quotation introduced at `371b`;
  accepted `obs_lesser-hippias_0054` and the repaired `0049` should carry the
  quotation authority/frame.

## obs_lesser-hippias_0057

- Recommendation: `reject`.
- Rejection reason: duplicate and interpretive.
- Source status: the local phrase is deterministic within `371e`; `start=16492`;
  `end=16875`;
  `sha=f31bb79c30c8a183483fa15b711d53c049645801fe5248766d0f73b4ad28deff`.
- Explanation: the source supports Socrates' immediate inference that Odysseus
  is better than Achilles "as it seems," followed by Hippias' rejection. It does
  not by itself support the current record's claim of ironic function or
  anticipated predictable rejection.
- Replacement guidance: reject rather than preserve a separate irony record.
  Accepted `obs_lesser-hippias_0055` already records the inference and
  Hippias' rejection, and accepted `obs_lesser-hippias_0056` records the appeal
  to common opinion and law.

## obs_lesser-hippias_0064

- Recommendation: `accept_narrowed`.
- Exact source ref: `374c`; `start=21794`; `end=22166`;
  `sha=9b39a07384b9fb23b5f4593ceb1191fc43febd4b9c2b4769c28eb7bf4ab83a4f`.
- Feature decision: keep `elenchus/assent_chain`
  (`feature_candidate_071`).
- Suggested `greek_terms`: [`φαίνεται`, `τὴν ἑκουσίως`, `ναί`,
  `τἀγαθά`, `πόδας`].
- Replacement guidance: narrow to Hippias' short assents in the voice and feet
  portion of the bodily-domain chain: he accepts the voluntarily discordant
  voice as better, accepts the involuntary one as worse, and chooses good
  possessions before Socrates turns to feet.
- Limits guidance: do not retain the full strength/posture/voice/feet catalog
  in this assent-chain record; the domain-parallel structure belongs in
  `obs_lesser-hippias_0065`.

## obs_lesser-hippias_0065

- Recommendation: `accept_narrowed`.
- Exact source ref: `374b-374c`; `start=21395`; `end=22166`;
  `sha=2ebd477e3bc4111a635a3ac07f9a955b78056c80f8af7eb58ad1671790c2c307`.
- Feature decision: keep `elenchus/parallel_predicate_chain`
  (`feature_candidate_1638`).
- Suggested `greek_terms`: [`ἰσχὺν`, `εὐσχημοσύνην`, `φωνῆς`,
  `πόδας`, `ἑκουσίως`, `ἀκουσίως`].
- Replacement guidance: preserve the formal chain across bodily domains:
  Socrates applies the voluntary/involuntary contrast to strength, posture,
  voice, and the beginning of the feet example before the argument proceeds to
  later senses and instruments.
- Limits guidance: do not extend this record into `374d-374e`; accepted
  neighbors already cover the later feet, eye, sense, and instrument
  extensions.

## obs_lesser-hippias_0069

- Recommendation: `accept_narrowed`.
- Exact source ref: `375a`; `start=22987`; `end=23417`;
  `sha=e440ba11a0e9f3940706212ac7386ee23b0a955e19152ad92b77b283484695a2`.
- Feature decision: keep `craft_analogy/soul_as_artifact_possession`
  (`feature_candidate_2058`).
- Suggested `greek_terms`: [`ψυχὴν κεκτῆσθαι ἵππου`,
  `τῇ ἀμείνονι ... ψυχῇ ἵππου`, `κυνὸς`,
  `ζῴων πάντων`, `ἀνθρώπου ψυχὴν`].
- Replacement guidance: narrow to the repeated possessive construction:
  Socrates speaks of having/acquiring the soul of a horse, dog, other animals,
  and an archer as the argument transfers the voluntary/involuntary test to
  soul-capacities.
- Limits guidance: do not include the medicine and all-crafts extension from
  `375b-375c`; that belongs in `obs_lesser-hippias_0070`.

## obs_lesser-hippias_0070

- Recommendation: `accept_narrowed`.
- Exact source ref: `375b-375c`; `start=23417`; `end=24239`;
  `sha=717ecd508246fb3ac17d432df4f79bde59c07eb51142326d533416bd2a74df3e`.
- Feature decision: keep `craft_analogy/craft_analogy_chain`
  (`feature_candidate_2059`).
- Suggested `greek_terms`: [`τοξικήν`, `ἰατρικῇ`, `τέχνῃ`,
  `κιθαριστικωτέρα`, `αὐλητικωτέρα`, `τὰς τέχνας`,
  `τὰς ἐπιστήμας`].
- Replacement guidance: source-correct and narrow to the craft sequence from
  archery through medicine and musical crafts, ending with the general formula
  that applies the voluntary/involuntary contrast to crafts and sciences.
- Limits guidance: the current `375a-375b` source ref cuts off the universal
  crafts/sciences phrase at the Stephanus boundary. Do not include the horse
  and dog soul-possession setup except as immediate context handled by
  `obs_lesser-hippias_0069`.
