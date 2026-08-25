# Laches needs_split scratch repair review

Scope: 15 current `needs_split` records in `wiki/observations/laches.md`.

Method: inspected the current ledger records, same-span accepted/rejected
neighbors, and Greek source spans from `raw/plato/greek/laches.txt` using
`resolveSourceSpan("laches", span)` from `packages/harness/src/source.ts`. No
translation files, Pioneer, provider-backed harness/review paths, external
model/provider runs, non-dry-run `review-segmented`, or `review-queue` were
used. Greek passages are not copied below; only short `greek_terms` are cited.

Summary: `accept_narrowed=14`, `reject=1`, `leave_blocked_source_ref=0`.

## obs_laches_0015

- Recommendation: `accept_narrowed`.
- Exact source ref: `181b`; `start=5118`; `end=5549`;
  `sha=cab3eb4b349402f7f2be9cc4385f7c35a92e3ca45eb51747928eb30ba1a8704a`.
- Feature decision: keep
  `dramatic_case_setup/character_expresses_goodwill_toward_socrates`
  (`feature_candidate_1479`).
- Suggested `greek_terms`: [`ἐπαινός`, `ἀξίων πιστεύεσθαι`, `χαίρω`,
  `εὐδοκιμεῖς`, `εὐνούστατον`].
- Replacement guidance: narrow the record to Lysimachus' response to Laches'
  praise: Lysimachus treats the praise of Socrates as credible, says he is glad
  at Socrates' good reputation, and asks Socrates to regard him as strongly
  well-disposed.
- Limits guidance: do not repeat the Delium/`orthos` character record already
  accepted in `obs_laches_0014`; do not infer later dramatic consequences of
  Lysimachus' goodwill.

## obs_laches_0017

- Recommendation: `accept_narrowed`.
- Exact source ref: `182c`; `start=7626`; `end=8132`;
  `sha=ae5a78c59176c1b2bfa5afd8383daa03ae3c4abb672f07729367f0af8c76ba4d`.
- Feature decision: keep
  `definition_ladder/courage_introduced_as_effect`
  (`feature_candidate_1525`).
- Suggested `greek_terms`: [`ἐπιστήμη`, `θαρραλεώτερον`,
  `ἀνδρειότερον`].
- Replacement guidance: keep only the local claim that the speaker presents
  hoplomachy as making a man in war more confident and more courageous than
  before.
- Limits guidance: do not claim that courage is being defined here, that the
  speaker equates courage with hoplomachy, or that the dialogue endorses the
  promotional claim.

## obs_laches_0018

- Recommendation: `accept_narrowed`.
- Exact source ref: `182c-182d`; `start=7626`; `end=8548`;
  `sha=b22941546967a2eddc251c3ba3b800c5062b24dcd7fee7dc91270cf9ecb9a14b`.
- Feature decision: keep
  `dramatic_case_setup/aesthetic_advantage_appeal`
  (`feature_candidate_1526`).
- Suggested `greek_terms`: [`εὐσχημονέστερον`, `φαίνεσθαι`, `δεινότερος`,
  `εὐσχημοσύνην`].
- Replacement guidance: source-correct the record because `182c` alone cuts
  off the sentence. The durable record is the speaker's minor supplemental
  claim that hoplomachy makes a man appear more graceful where that appearance
  is fitting and therefore more formidable to enemies.
- Limits guidance: do not evaluate the appeal as ironic or sound; the record
  should note only the aesthetic/formidable-appearance supplement to the
  hoplomachy pitch.

## obs_laches_0035

- Recommendation: `accept_narrowed`.
- Exact source ref: `180c-180d`; `start=3491`; `end=4314`;
  `sha=c6b1e797bbfeaec9d8263f70975e7bfcefb6901937a1e47b8b19b5570b1b2178`.
- Feature decision: keep `prosopography/nicias_seconding_testimony`
  (`feature_candidate_1588`).
- Suggested `greek_terms`: [`προυξένησε`, `ὑεῖ`,
  `διδάσκαλον μουσικῆς`, `Ἀγαθοκλέους`, `Δάμωνα`].
- Replacement guidance: source-correct the record because the current
  `180b-180c` span ends mid-statement. The repaired observation should isolate
  Nicias' seconding testimony: Socrates recently introduced Damon, a pupil of
  Agathocles, as a music teacher for Nicias' son.
- Limits guidance: do not duplicate `obs_laches_0033` or `obs_laches_0034`,
  which already cover Laches' recommendation of Socrates as demesman and
  educational resource.

## obs_laches_0038

- Recommendation: `accept_narrowed`.
- Exact source ref: `184e`; `start=12729`; `end=13145`;
  `sha=3721500659aa92f76ddee6f9516b3a10d3d34e30a56cde1206d840d976335f78`.
- Feature decision: keep `turn_geometry/procedural_agreement_to_inquire`
  (`feature_candidate_1105`), though the replacement prose should describe a
  procedural redirection rather than an agreement.
- Suggested `greek_terms`: [`ἐπιστήμῃ`, `πλήθει`,
  `πρῶτον αὐτὸ τοῦτο σκέψασθαι`].
- Replacement guidance: narrow to Socrates' interruption of the requested
  vote: he contrasts following the many with following the trained expert and
  says the group must first examine the prior issue before deciding.
- Limits guidance: the fuller expert criterion is completed at `185a` and
  should be handled by `obs_laches_0042`; do not duplicate
  `obs_laches_0036`'s knowledge-over-majority principle or
  `obs_laches_0037`'s athletic-trainer analogy except as immediate local
  context.

## obs_laches_0042

- Recommendation: `accept_narrowed`.
- Exact source ref: `185a`; `start=13145`; `end=13628`;
  `sha=2c8036bd81e5f3696c9fba483718a89d7e149460961daa524488e41ac6b2f76c`.
- Feature decision: keep `dramatic_case_setup/initial_question_stated`
  (`feature_candidate_083`).
- Suggested `greek_terms`: [`τεχνικός`, `πείθεσθαι`, `ἑνὶ`,
  `κτήματος`, `ὑέων`, `χρηστῶν`].
- Replacement guidance: narrow to the `185a` frame: if any one of those present
  is expert in the matter, the others should obey that one; if not, they should
  seek another, because the decision concerns the sons as the household's
  greatest possession and whether they become good or the opposite.
- Limits guidance: do not include `185b`'s later methodological question about
  how to identify the expert; accepted neighbors `obs_laches_0043` and
  `obs_laches_0044` already cover that procedural follow-up.

## obs_laches_0051

- Recommendation: `accept_narrowed`.
- Exact source ref: `187d`; `start=18846`; `end=19212`;
  `sha=ea72bf114d46fe6c2249bb495f7539c125bf342dee1e5403b2faf0eff2d26eb3`.
- Feature decision: keep `turn_geometry/procedural_agreement_to_inquire`
  (`feature_candidate_1105`).
- Suggested `greek_terms`: [`κοινῇ μετὰ Σωκράτους σκέψασθε`,
  `διδόντες`, `δεχόμενοι λόγον`, `βουλευόμεθα`].
- Replacement guidance: narrow to Lysimachus' explicit proposal that Nicias and
  Laches examine the matter jointly with Socrates, giving and receiving an
  account from one another.
- Limits guidance: do not revive rejected `obs_laches_0052` or
  `obs_laches_0053`; keep the record on the turn-procedure move, not a broad
  paternal-education setup or a full formalization of all consultation terms.

## obs_laches_0058

- Recommendation: `accept_narrowed`.
- Exact source ref: `188b`; `start=20140`; `end=20533`;
  `sha=b45217d53af6bfed0fe6d031be3fe713a41f4968c044576b20708055e5991ad2`.
- Feature decision: keep `elenchus/socratic_testing_expected`
  (`feature_candidate_1710`).
- Suggested `greek_terms`: [`ἄηθες`, `ἀηδές`, `βασανίζεσθαι`,
  `πάλαι`].
- Replacement guidance: narrow to Nicias' statement that being tested by
  Socrates is neither unfamiliar nor unpleasant for him, and that he had
  already expected the conversation to shift under Socrates' presence.
- Limits guidance: do not duplicate `obs_laches_0060`, which already records
  the subject shift from the young men to the interlocutors themselves; this
  record should preserve Nicias' explicit attitude toward Socratic testing.

## obs_laches_0069

- Recommendation: `reject`.
- Rejection reason: duplicate and overbroad.
- Source status: the current `189e-190a` source ref is deterministic
  (`start=23402`; `end=24322`;
  `sha=83b4f0620c49b7483b726f95ac9652a8d3b3a163c4201c46d1fe4fe20f65ca79`),
  but the record combines multiple already-covered functions.
- Explanation: accepted `obs_laches_0070` already records the epistemic
  condition and sight/eye analogy; accepted `obs_laches_0071` already records
  the metacognitive pause. A narrowed repair from `obs_laches_0069` would
  mostly restate those accepted neighbors.
- Replacement guidance: reject rather than add a duplicate accepted record.

## obs_laches_0075

- Recommendation: `accept_narrowed`.
- Exact source ref: `186b`; `start=15818`; `end=16270`;
  `sha=9794014284d2f8500a8b9d7c72a4dc2c7d2b32332564914058b8a17ac3e8a95c`.
- Feature decision: keep
  `dramatic_case_setup/criterion_for_adviser_expertise`
  (`feature_candidate_1794`).
- Suggested `greek_terms`: [`διδάξαντες`, `διδάσκαλον`, `ἔργα`,
  `ἀγαθοὶ`, `κινδυνεύειν`, `διαφθείροντας`].
- Replacement guidance: narrow to the adviser-qualification test at `186b`:
  one must either have teachers who taught the relevant matter or be able to
  point to people made acknowledgedly good through oneself; otherwise one
  should seek others and avoid risking the companions' sons.
- Limits guidance: do not include Socrates' self-disavowal or deference to
  Nicias and Laches at `186c`; those are already covered by accepted
  `obs_laches_0076` and `obs_laches_0077`.

## obs_laches_0094

- Recommendation: `accept_narrowed`.
- Exact source ref: `193a`; `start=30168`; `end=30610`;
  `sha=e55e4343d8153cbcd9dcb3a65493c4d4d3975cd81b209f2843c07c3d32daa9be`.
- Feature decision: switch to existing
  `elenchus/refutation_by_counterexample` (`feature_candidate_1083`) rather
  than keeping `contrary_example_chain`.
- Suggested `greek_terms`: [`φρονίμως λογιζόμενον`, `βοηθήσουσιν`,
  `χωρία`, `ὑπομένειν`, `καρτερεῖν`].
- Replacement guidance: narrow to the first contrary case: Socrates contrasts
  a fighter enduring with calculation, support, weaker opponents, and better
  ground against an opposing fighter willing to stand and endure under worse
  conditions, asking which is more courageous.
- Limits guidance: do not include the craft cases at `193b`; those should be
  handled by `obs_laches_0095`.

## obs_laches_0095

- Recommendation: `accept_narrowed`.
- Exact source ref: `193b`; `start=30610`; `end=30953`;
  `sha=b52b0ea1b704493c9948f74f119418e8106756112d82e90e7b7334612ed991a0`.
- Feature decision: keep
  `craft_analogy/craft_knowledge_undermines_virtue`
  (`feature_candidate_1911`).
- Suggested `greek_terms`: [`ἐπιστήμης ἱππικῆς`, `ἱππομαχίᾳ`,
  `σφενδονητικῆς`, `τοξικῆς`, `τέχνης`].
- Replacement guidance: narrow to the craft sequence at `193b`: Socrates gets
  Laches to say that endurance with horsemanship, slinging, archery, or another
  craft is less courageous than endurance without that knowledge.
- Limits guidance: do not include the preceding tactical battlefield contrast
  at `193a`; do not infer a general Platonic verdict on craft knowledge.

## obs_laches_0118

- Recommendation: `accept_narrowed`.
- Exact source ref: `195b-195c`; `start=34563`; `end=35508`;
  `sha=6836db8ea593a97a99e7d8ebb190b7cd2917dbb7ba1768acc0d997c7f849a5a7`.
- Feature decision: keep
  `craft_analogy/craft_expertise_counterexample_to_virtue`
  (`feature_candidate_2154`).
- Suggested `greek_terms`: [`ἰατροί`, `γεωργοί`, `δημιουργοί`,
  `δεινά`, `θαρραλέα`, `ἀνδρεῖοι`].
- Replacement guidance: source-correct the record because `195a-195b` cuts off
  the craft counterexample before its completion. The repaired record should
  isolate Laches' counterexample: doctors, farmers, and other craftsmen know
  terrible and confidence-inspiring things in their own crafts without thereby
  being courageous.
- Limits guidance: do not duplicate `obs_laches_0117`'s abuse-to-teaching
  procedural move at `195a` or `obs_laches_0119`'s mutual empty-speech
  accusation.

## obs_laches_0135

- Recommendation: `accept_narrowed`.
- Exact source ref: `199a`; `start=42232`; `end=42641`;
  `sha=22431192e6a015bf81fafe79fcbe15394cb26650f76289bc8ecc64478a670f80`.
- Feature decision: keep `craft_analogy/craft_hierarchy_argument`
  (`feature_candidate_2230`).
- Suggested `greek_terms`: [`νόμος`, `στρατηγὸν`, `μάντεως`,
  `ἄρχειν`, `ἐπιστήμη`].
- Replacement guidance: narrow to the general/seer hierarchy at `199a`:
  Socrates gets Laches to agree that law orders the general to rule the seer,
  not the seer to rule the general, before turning to Nicias about knowledge of
  future, present, and past things.
- Limits guidance: do not claim that the hierarchy alone proves the later
  definition revision; rejected `obs_laches_0134` should not be revived.

## obs_laches_0137

- Recommendation: `accept_narrowed`.
- Exact source ref: `199d`; `start=43404`; `end=43857`;
  `sha=dc299a2f3429258ffd4ffa1d568e50758ff2e4eba5c346518a1d5d03317cad06`.
- Feature decision: keep `elenchus/reductio_conclusion`
  (`feature_candidate_425`).
- Suggested `greek_terms`: [`ἀρετῆς`, `ἀγαθὰ`, `κακὰ`,
  `σωφροσύνης`, `δικαιοσύνης`, `ὁσιότητος`].
- Replacement guidance: narrow to the reductio conclusion: Socrates asks
  whether someone who knew all goods and evils across temporal modes would lack
  any virtue, including temperance, justice, or piety.
- Limits guidance: do not duplicate `obs_laches_0136`, which already covers
  the expansion of courage into knowledge of all goods and evils at `199c`;
  this record should preserve only the consequence that the possessor would
  lack no part of virtue.
