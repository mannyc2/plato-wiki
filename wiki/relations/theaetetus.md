```yaml
relation_id: rel_theaetetus_0001
pair_id: pair_theaetetus_00001
claim_a: claim_theaetetus_0002
claim_b: claim_theaetetus_0003
relation_kind: restatement
resolution: standing
basis: "Claim A records the tautology that the wise are wise by wisdom (σοφίᾳ σοφοὶ οἱ σοφοί at 145d). Claim B records that wisdom does not differ from knowledge and that the knowledgeable are wise about the same things (145e). The two claims are adjacent turns in a single assent chain: Socrates secures the tautology at 145d, then immediately extends it at 145e by equating wisdom (σοφία) with knowledge (ἐπιστήμη). Claim B does not contradict or revise Claim A; it preserves the tautology and builds on it with an additional identity. Both claims stand as asserted within the same examination segment."
limits: This relation observes textual proximity and logical compatibility only. It does not assess whether the identity of wisdom and knowledge is philosophically defensible or whether Theaetetus's assent is critically examined later in the dialogue.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0002
pair_id: pair_theaetetus_00002
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0004
relation_kind: tension
resolution: standing
basis: "Claim A identifies wisdom and knowledge as the same (145e: ταὐτὸν ἄρα ἐπιστήμη καὶ σοφία), while claim B records Socrates' aporia about what knowledge itself is (145e: ἀπορῶ … ἐπιστήμη ὅτι ποτὲ τυγχάνει ὄν). They are not contradictory because one can affirm the identity of wisdom and knowledge and still be unable to define knowledge. The shared term ἐπιστήμη links them but their contents operate at different levels—one is an extensional claim about co-reference, the other is an avowed inability to give an intensional account."
limits: This relation is confined to the surface claims as stated in 145e-146a. It does not assess whether Socrates' aporia is genuine, whether the identity thesis is undermined by the subsequent failure to define knowledge, or whether any later passage resolves the tension.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0003
pair_id: pair_theaetetus_00003
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0005
relation_kind: revision
resolution: superseded
basis: Claim theaetetus_0003 records Theaetetus's agreement that wisdom (σοφία) is identical to knowledge (ἐπιστήμη) at 145e. Claim theaetetus_0005 records Theaetetus's first attempt to define what knowledge is at 146c-146d by enumerating subject-matters (geometry, shoemaking, other crafts). The second claim does not contradict or simply restate the first; it moves from an identification of knowledge with wisdom to a substantive definitional proposal about knowledge's content, thereby revising and extending the earlier bare identity claim.
limits: Both claims have final_status left_standing. This relation captures only that claim 0005 builds on and adds content to claim 0003's identification; it does not evaluate the adequacy of either claim, nor does it address Socrates' subsequent challenge to the enumeration. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0005 to final_status revised; prose above describes the pre-threading state.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0004
pair_id: pair_theaetetus_00004
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0076
relation_kind: restatement
resolution: standing
basis: Both claims frame the dialogue's investigation in terms of what ἐπιστήμη is identical to or different from. Claim 0003 posits the identity of σοφία and ἐπιστήμη (145e); claim 0076 restates the programmatic question as whether ἐπιστήμη and αἴσθησις are the same or different (163a). The shared structure is the identification/differentiation of ἐπιστήμη with another term.
limits: This restatement relation is limited to the structural recurrence of the 'X is the same as or different from ἐπιστήμη' formula. The two claims instantiate the formula with different paired terms (σοφία vs. αἴσθησις) and at different stages of the argument, so this is not a verbatim recurrence.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0005
pair_id: pair_theaetetus_00005
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0172
relation_kind: tension
resolution: verbal_only
basis: "Claim 0003 asserts that wisdom (σοφία) and knowledge (ἐπιστήμη) are identical — the knowledgeable and the wise concern the same things. Claim 0172 locates knowledge in reasoning about sense-perceptions (ἐν τῷ συλλογισμῷ), not in the perceptions themselves, because being and truth are graspable there. These claims pull in different directions: the early claim identifies knowledge with wisdom without restriction, while the later claim restricts knowledge's locus to reasoning as opposed to perception. The tension is verbal rather than substantive because the identity thesis (0003) at 145e does not specify the locus of knowledge or wisdom, and the later restriction at 186d does not deny the identity of wisdom and knowledge. The later passage narrows where knowledge is found without contradicting the earlier claim about what knowledge is equivalent to."
limits: The verbal distinction rests on the observation that claim 0003 makes an identity claim about the objects of knowledge and wisdom (ἃ ἐπιστήμονες, ταῦτα σοφοί) without addressing the cognitive faculty or locus, while claim 0172 addresses the locus (reasoning vs. perception) without addressing the wisdom-knowledge relation. The pair does not constitute a genuine conflict across these different axes.
resolution_ref:
  stephanus_span: 145e
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 145e
    start_marker: 145e
    end_marker: 145e
    start_char: 7102
    end_char: 7387
    text_sha256: 636fdb796ea37088337a54069c53bde3f5b57431f191e48031fec4c16028715e
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0006
pair_id: pair_theaetetus_00006
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0173
relation_kind: tension
resolution: standing
basis: "Claim A (145e) asserts that wisdom (σοφία) and knowledge (ἐπιστήμη) are identical, while Claim B (186d-186e) asserts that knowledge is other than sense-perception (αἴσθησις). These two claims share the term ἐπιστήμη but address different contrasts: A equates knowledge with wisdom, B distinguishes knowledge from sense-perception. The claims are not formally contradictory because they can both stand simultaneously — knowledge can be the same as wisdom and different from sense-perception without conflict. However, they pull against each other insofar as A's positive identification of knowledge with wisdom leaves unstated what knowledge excludes, while B's negative delimitation of knowledge from perception implicitly narrows the domain of what knowledge is. Both claims have final_status left_standing."
limits: This record does not claim that the two passages are in formal contradiction. It registers only that they address the nature of ἐπιστήμη from different angles — one by identification, one by differentiation — and that this juxtaposition creates a textual tension worth noting.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0007
pair_id: pair_theaetetus_00007
claim_a: claim_theaetetus_0003
claim_b: claim_theaetetus_0177
relation_kind: restatement
resolution: standing
basis: "Claim 0003 states that wisdom (σοφία) and knowledge (ἐπιστήμη) are identical — that the knowledgeable are wise about the same things (145e). Claim 0177 defines knowledge (ἐπιστήμη) as true judgment (ἀληθὴς δόξα, 187b). The two claims operate on different levels: claim 0003 equates ἐπιστήμη with σοφία, while claim 0177 offers a definition of ἐπιστήμη in terms of δόξα. There is no conflict on their face because claim 0177 does not address whether σοφία differs from ἐπιστήμη, nor does claim 0003 specify what ἐπιστήμη is. Both remain left_standing and address the same core term (ἐπιστήμη) from distinct angles."
limits: This relation records only that the two claims coexist without formal contradiction regarding the term ἐπιστήμη. It does not evaluate whether the definition of ἐπιστήμη as true judgment is compatible with the identity of σοφία and ἐπιστήμη, nor does it track later refutations of the true-judgment definition.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0008
pair_id: pair_theaetetus_00008
claim_a: claim_theaetetus_0004
claim_b: claim_theaetetus_0005
relation_kind: tension
resolution: superseded
basis: "Claim A records Socrates' avowed aporia about what knowledge itself is (145e). Claim B records Theaetetus's first answer listing geometry, shoemaking, and other crafts as knowledge (146c-d). They pull against each other because Theaetetus offers a list of knowledges while Socrates has just declared he cannot grasp what knowledge is, but they are not formally contradictory: Socrates' aporia is about grasping the definition, not about denying that these items are called knowledge."
limits: This records a dramatic tension in the dialogue's opening exchange, not a logical contradiction. Whether Theaetetus's answer actually resolves Socrates' aporia is evaluated elsewhere. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0005 to final_status revised; prose above describes the pre-threading state.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0009
pair_id: pair_theaetetus_00009
claim_a: claim_theaetetus_0004
claim_b: claim_theaetetus_0076
relation_kind: restatement
resolution: standing
basis: Both claims articulate the same overarching question about the nature of knowledge (ἐπιστήμη). Claim A (145e-146a) records Socrates' avowed aporia about what knowledge itself is; Claim B (163a) restates the same guiding question in terms of whether knowledge and perception are the same or different. The latter narrows the inquiry to the specific identification under examination without altering the content of the question.
limits: This records that the same definitional question is restated at a later point in the dialogue. It does not assert that the two claims are identical in wording or that the intervening argument is irrelevant.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0010
pair_id: pair_theaetetus_00010
claim_a: claim_theaetetus_0004
claim_b: claim_theaetetus_0172
relation_kind: revision
resolution: superseded
basis: Claim A records Socrates' avowed aporia about what knowledge is (145e-146a, final_status left_standing). Claim B records the thesis that knowledge is not in sense-perceptions but in reasoning about them, where being and truth can be grasped (186d, final_status posed_only). Claim B substantively modifies the inquiry state by narrowing the question from open aporia to a locative delimitation of episteme, ruling out sense-perceptions as its locus.
limits: "Claim B is posed_only and does not provide a completed definition of knowledge; it delimits where knowledge is not and where it may be found. The revision is directional: Claim A opens the question, Claim B advances it."
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0011
pair_id: pair_theaetetus_00011
claim_a: claim_theaetetus_0004
claim_b: claim_theaetetus_0173
relation_kind: restatement
resolution: standing
basis: Both claims assert that the nature of epistêmê is not yet grasped or remains unidentified. Claim 0004 records Socrates' opening aporia that he cannot adequately grasp what knowledge is (145e-146a); claim 0173 records Theaetetus' concluding assertion that knowledge has been shown to be other than sense-perception and is now most manifestly distinct (186d-186e). The later claim narrows one candidate (aisthêsis) from the field but does not itself supply a positive definition, so the underlying aporia about what epistêmê positively is persists across both. The claims are compatible restatements of the ongoing definitional search rather than rivals.
limits: This records compatibility between the opening aporia and the negative result that knowledge is not perception; it does not claim that the dialogue has arrived at a positive definition of epistêmê by 186e.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0012
pair_id: pair_theaetetus_00012
claim_a: claim_theaetetus_0004
claim_b: claim_theaetetus_0177
relation_kind: tension
resolution: standing
basis: "Claim A reports Socrates' aporia about grasping what knowledge (episteme) itself is (145e-146a). Claim B records Theaetetus' proposed definition of knowledge as true judgment (alethes doxa) (187b). These are not contradictory: Socrates' avowed inability at the dialogue's opening is a personal stance, not a denial that a definition could be offered later. However, they pull against one another because the definition proposed in claim B purports to answer the very question that claim A says Socrates cannot adequately grasp, creating a dramatic tension between the opening aporia and the candidate definition offered much later in the dialogue."
limits: Both claims have final_status left_standing. This record does not assess whether Theaetetus' definition resolves Socrates' aporia or survives subsequent refutation. The tension is between the opening avowal of ignorance and the later positive proposal, not between the propositional contents of the two claims as such.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0013
pair_id: pair_theaetetus_00013
claim_a: claim_theaetetus_0005
claim_b: claim_theaetetus_0076
relation_kind: revision
resolution: superseded
basis: "Both claims share the definiendum ἐπιστήμη (knowledge). Claim_a (146c-d) offers Theaetetus's first definition: knowledge is the various sciences (geometry, astronomy) and crafts (shoemaking, artisan τέχναι), enumerating kinds of knowledge rather than giving a unitary account. Claim_b (163a) restates the guiding question that frames the subsequent Protagorean/Heraclitean thesis under examination — whether knowledge and perception (ἐπιστήμη τε καὶ αἴσθησις) are the same or different. Socrates explicitly marks this as a change of direction ('ἄλλῃ δὴ σκεπτέον'), so claim_b does not directly revise claim_a's enumeration but moves the inquiry from a list-of-examples definition to the identity-or-difference thesis. The relation is one of revision because claim_b replaces claim_a's definitional framework with a new thesis; both claims are left_standing, so the resolution is standing."
limits: This records that the inquiry reorients from enumerating knowledge-kinds to examining the knowledge-perception identity thesis. It does not judge whether the Protagorean thesis is correct, nor does it assert that claim_a was refuted (Socrates merely called it a 'many and varied' answer to a request for one thing). Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0005 to final_status revised; prose above describes the pre-threading state.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0014
pair_id: pair_theaetetus_00014
claim_a: claim_theaetetus_0005
claim_b: claim_theaetetus_0172
relation_kind: revision
resolution: superseded
basis: Claim_a (146c-146d) lists particular crafts and sciences as exhaustive instances of knowledge. Claim_b (186d) relocates knowledge from the domain of crafts and sense-perceptions to reasoning (syllogismos) about being and truth. The later claim substantively modifies the earlier by shifting the criterion from enumerating knowledge's branches to identifying its cognitive locus.
limits: This does not assess whether Theaetetus's enumeration was already implicitly pointing toward reasoning. It records the textual trajectory from the first definition attempt to the examination's culminating thesis.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0015
pair_id: pair_theaetetus_00015
claim_a: claim_theaetetus_0005
claim_b: claim_theaetetus_0173
relation_kind: tension
resolution: superseded
basis: "Claim A presents Theaetetus's first definitional proposal that knowledge is geometry and other sciences plus crafts like shoemaking — a multiplicity of ἐπιστῆμαι. Claim B asserts that knowledge is other than sense-perception (αἴσθησις), a negative delimitation reached after the Protagorean/Heraclitean refutation. They pull in different directions: A treats knowledge as enumerable τέχναι and μαθήματα, while B draws a boundary against αἴσθησις without defining knowledge positively. They are not formally contradictory because A does not equate knowledge with sense-perception, and B does not deny that geometry or shoemaking could be instances of knowledge."
limits: Both claims have final_status left_standing. This relation records a structural tension between the enumeration approach (146c-d) and the negative delimitation (186d-e) within the dialogue's progressive inquiry. It does not assert that Theaetetus or Socrates holds both claims simultaneously, nor does it resolve whether the crafts enumerated in A would survive the critique of perception in B. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0005 to final_status revised; prose above describes the pre-threading state.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0016
pair_id: pair_theaetetus_00016
claim_a: claim_theaetetus_0005
claim_b: claim_theaetetus_0177
relation_kind: revision
resolution: superseded
basis: "Claim A (146c-146d) defines knowledge as geometry, shoemaking, and the other crafts — an enumeration by instances. Claim B (187b) defines knowledge as true judgment — a definition by epistemic kind. Both are candidate answers to the same 'what is knowledge?' question, but claim B moves from a list of knowledge-bearing domains to a structural account of the knowledge relation itself, substituting a genus (true judgment) for a collection of crafts. The shift is substantive: crafts are practices or bodies of expertise; true judgment is a doxastic state. Claim B does not deny that geometry or shoemaking are knowledge; it proposes a different explanatory level."
limits: Both claims are left standing as proposals within the dialogue. This record notes the substantive shift in definitional strategy (enumeration-by-instances to genus-statement) without adjudicating whether the later proposal is correct or whether Socrates or Theaetetus later refutes either. The relation is confined to the textual fact that claim B replaces the enumerative approach of claim A with a new candidate, not merely restating it. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0005 to final_status revised; prose above describes the pre-threading state.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0017
pair_id: pair_theaetetus_00017
claim_a: claim_theaetetus_0029
claim_b: claim_theaetetus_0032
relation_kind: restatement
resolution: verbal_only
basis: "Claim A states that knowledge is nothing other than perception (ἐπιστήμη is αἴσθησις). Claim B states that perception is always of what is and is unerring, just as knowledge is. Claim B unpacks an implication of the identification in Claim A: if knowledge is perception, then perception must share knowledge's properties (unerring, directed at what is). The two claims restate the same identification-equivalence in different directions."
limits: The resolution is verbal_only because claim B has final_status posed_only, not left_standing; the standing constraint is not met. The distinction is formal — claim A is offered as a definition, claim B is drawn as a posed implication — and no single Stephanus span distinguishes them beyond the gap between 151e and 152c. This record does not track whether the identification survives later examination.
review_status: rejected
resolution_ref:
  stephanus_span: 152c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 152c
    start_marker: 152c
    end_marker: 152c
    start_char: 20374
    end_char: 20769
    text_sha256: 5f4d9bed56b9d4a5327bbc2385c473c0a0b33fd2530e9baf38e6a441a07ee4aa
```

```yaml
relation_id: rel_theaetetus_0018
pair_id: pair_theaetetus_00018
claim_a: claim_theaetetus_0029
claim_b: claim_theaetetus_0153
relation_kind: revision
resolution: superseded
basis: Claim A (151e) records Theaetetus's initial definition that knowledge is nothing other than perception. Claim B (182e) records Socrates's later argument that, under the universal-motion hypothesis, the identification of knowledge with perception collapses into 'no more knowledge than not-knowledge.' Claim B does not withdraw or replace the definition; it demonstrates aporia for that definition under the stated hypothesis. Both claims remain left_standing in final_status, and claim B operates as a dialectical development rather than a formal contradiction of claim A.
limits: This relation notes that claim B builds on claim A by re-examining the same definition under a specific hypothesis (universal motion) and exposing a problem. It does not assert that the definition is refuted simpliciter, nor does it claim that Theaetetus concedes the refutation. The resolution is standing because neither claim has been withdrawn or refuted in final_status. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0029 to final_status revised; prose above describes the pre-threading state.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0019
pair_id: pair_theaetetus_00019
claim_a: claim_theaetetus_0029
claim_b: claim_theaetetus_0275
relation_kind: revision
resolution: superseded
basis: "claim_theaetetus_0029 records Theaetetus' proposal that knowledge is nothing other than perception (αἴσθησις), offered at 151e as the dialogue's first definition candidate. claim_theaetetus_0275 records Socrates' negative conclusion at 210a-210b that knowledge is neither perception, nor true judgement, nor true judgement with an account added. The latter claim encompasses and rejects the former: the initial definition is one of three examined candidates that the dialogue's argumentation finds inadequate. Both claims have final_status left_standing because each correctly reports what is said at its respective point in the dialogue, but claim_b represents a later stage of inquiry that revises the status of the proposal recorded in claim_a."
limits: This relation records the textual trajectory from early definition proposal to final negative conclusion. Both claims are marked left_standing as accurate reports of what is said, not as endorsed theses. The relation does not assess whether the intervening arguments (151e-186e) succeed in refuting the perception definition, nor does it claim Socrates holds a positive doctrine. Resolution updated from standing to superseded on 2026-07-12 by the claim-fate pilot Phase 2 after operator-authorized stance-event threading changed claim_theaetetus_0029 to final_status revised; prose above describes the pre-threading state.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0020
pair_id: pair_theaetetus_00020
claim_a: claim_theaetetus_0032
claim_b: claim_theaetetus_0153
relation_kind: revision
resolution: superseded
basis: "Claim A (152c) asserts that perception is unerring and of what-is, just as knowledge is. Claim B (182e) restates that perception-is-knowledge was the agreed thesis, then reports that under the universal-motion hypothesis perception turns out to be no more perception than not-perception, and therefore the answer 'knowledge is perception' is no more knowledge than not-knowledge. Claim B revisits the same thesis with a substantive modification: the earlier claim that perception is always of what-is and unerring is replaced by the finding that under universal motion the thesis collapses into indeterminacy. Claim A is posed_only; claim B is left_standing and supersedes it."
limits: This relation is confined to the textual arc from the posing of the Protagorean implication (152c) to its collapse under universal motion (182e). It does not address whether the refutation is independent of the universal-motion hypothesis, nor does it evaluate whether Theaetetus's original definition survives this refutation in other forms.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0021
pair_id: pair_theaetetus_00021
claim_a: claim_theaetetus_0032
claim_b: claim_theaetetus_0275
relation_kind: revision
resolution: superseded
basis: Claim A (152c) presents perception as always of what-is and unerring, as knowledge is — a thesis posed for examination as an implication of Protagoras's view. Claim B (210a-210b) concludes that knowledge is neither perception nor true judgement nor true judgement with an account. The later claim explicitly negates what the earlier claim provisionally entertained. This is not a contradiction (where both stand and cannot both be true) because the earlier claim has final_status 'posed_only' and was always a step in the examination, not a settled assertion. The later claim supersedes it as the dialogue's negative conclusion.
limits: This relation captures the structural arc from a thesis posed for examination to its rejection. It does not assess whether the refutation of the Protagorean/Heraclitean basis is sound, nor does it address the parallel rejections of true judgement and true judgement with an account. The negative conclusion at 210a-210b does not assert a positive doctrine about what knowledge is.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0022
pair_id: pair_theaetetus_00022
claim_a: claim_theaetetus_0062
claim_b: claim_theaetetus_0081
relation_kind: restatement
resolution: standing
basis: "Both claims articulate the same identity between a sensory quality and perception within the Protagorean/Heraclitean framework. Claim A (159c-159d) states that sweetness and the perception of sweetness are jointly generated twin offspring — the perception arises from the patient. Claim B (163d) states that seeing (ὁρᾶν) is perceiving (αἰσθάνεσθαι) and sight (ὄψις) is perception (αἴσθησις). Both assert that a specific sense-act and the corresponding perception are the same thing; claim A develops the generative mechanism, claim B presents the abstract identity as a premise for further argument. The content is the same relation stated in two registers: one mechanistic-genetic, one definitional."
limits: This relation is confined to the textual claim that perception is identical with the sensory quality or sense-act. It does not address whether Socrates endorses either formulation or whether the later passage (163d-163e) silently revises rather than restates. Both claims have final_status left_standing within the reviewed claim ledger.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0023
pair_id: pair_theaetetus_00023
claim_a: claim_theaetetus_0076
claim_b: claim_theaetetus_0167
relation_kind: restatement
resolution: standing
basis: "claim_0076 frames the whole argument as tending toward whether ἐπιστήμη and αἴσθησις are ταὐτὸν or ἕτερον (163a). claim_0167 states that the soul examines the οὐσία of ταὐτὸν and ἕτερον (among other κοινά) by itself, without the senses (186a-186b). This is not a contradiction or tension: claim_0076 sets up the governing question, and claim_0167 gives the positive result of the soul's independent examination of same-and-different — the framework announced in 163a reaches its doctrinal resolution in 186a-b. The content of claim_0167 is a restatement of the question's conceptual terrain (same/different) now placed in the soul's own activity."
limits: "The two claims are not identical in scope: 0076 presents the framing question, while 0167 presents the soul's capacity regarding those very terms. The relation is restatement because the same pair of concepts (ταὐτὸν/ἕτερον) recurs as the object of inquiry in both, not because the claims are lexically equivalent."
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0024
pair_id: pair_theaetetus_00024
claim_a: claim_theaetetus_0076
claim_b: claim_theaetetus_0172
relation_kind: revision
resolution: superseded
basis: "Both spans address the question whether knowledge (ἐπιστήμη) and perception (αἴσθησις) are the same or different. At 163a Socrates restates this as the open question toward which the whole argument tends. At 186d he delivers the answer: knowledge is not in the sense-perceptions but in the reasoning (συλλογισμῷ) about them, because being and truth are graspable only there. The 186d claim does not merely restate the 163a question; it resolves it with a substantive positive thesis about the locus of knowledge, thereby revising the open framing into a determinate position."
limits: The revision is doctrinal in direction (locus of knowledge is reasoning, not perception) but does not give a full account of what the reasoning consists in. Theaetetusʼs assent at 186d leaves the claim posed rather than fully examined, so the revision stands as the dialogue's provisional outcome, not as a settled doctrine.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0025
pair_id: pair_theaetetus_00025
claim_a: claim_theaetetus_0076
claim_b: claim_theaetetus_0173
relation_kind: revision
resolution: standing
basis: "Claim A (163a) restates the guiding question of the argument — whether ἐπιστήμη and αἴσθησις are the same (ταὐτὸν) or different (ἕτερον) — without deciding it. Claim B (186d-186e) delivers the argued conclusion that they are not the same and that knowledge is other than perception. The content of B is the substantive resolution of the inquiry framed in A: where A poses the disjunction, B affirms one disjunct on the basis of the intervening διαφορά argument. The relation is revision rather than contradiction because the earlier claim is an open question, not an assertion of identity; the later claim replaces the open posture with a determinate answer."
limits: This relation records the logical arc from framing question to concluding thesis. It does not assess whether the intervening argument successfully establishes the conclusion, nor does it endorse the claim that the refutation of perception-as-knowledge is final.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0026
pair_id: pair_theaetetus_00026
claim_a: claim_theaetetus_0076
claim_b: claim_theaetetus_0177
relation_kind: restatement
resolution: standing
basis: "Both claims concern the nature of episteme. Claim A (163a, ΣΩ.) frames the guiding question of the whole argument: whether episteme and aisthesis are the same or different (εἰ ἄρα ἐστὶν ἐπιστήμη τε καὶ αἴσθησις ταὐτὸν ἢ ἕτερον). Claim B (187b, ΘΕΑΙ.) proposes a candidate definition that episteme is true judgment (ἀληθὴς δόξα). Claim B is not a restatement of Claim A; Claim A poses a question about the identity or difference of episteme and aisthesis, while Claim B offers a positive identification of episteme with alethes doxa after the perceptually-grounded definitions have been set aside. The same term (ἐπιστήμη) appears in both, but the propositional content differs: one is an interrogative programmatic statement, the other is a definitional proposal."
limits: Both claims have final_status left_standing as records of what was said. The relation is rejected because the two claims perform different dialectical functions (framing question vs. definition proposal) and address different relata (episteme-aisthesis vs. episteme-alethes doxa). The shared term ἐπιστήμη does not by itself constitute restatement.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0027
pair_id: pair_theaetetus_00027
claim_a: claim_theaetetus_0077
claim_b: claim_theaetetus_0079
relation_kind: restatement
resolution: verbal_only
basis: "Both claims are posed-for-examination questions that press the same problem from different angles — whether perception (seeing/hearing) can be identical to knowing. Claim 0077 tests the identity of perception and knowledge through the examples of hearing foreign speech and seeing unknown letters. Claim 0079 tests the same identity through memory: whether someone who learned and remembers something thereby knows it, even without current perception. The shared term ἐπίστασθαι anchors both as variants of the same examination strategy against the perception-is-knowledge thesis. Since both claims have final_status posed_only (not left_standing), resolution cannot be standing; the apparent tension between perception-based and memory-based knowing is a verbal rather than substantive conflict, since both are posed as open questions pressing the same thesis from complementary sides."
limits: This relation is confined to the structural role of these questions in Socrates' examination of Theaetetus' thesis; it does not assert that the two questions are logically equivalent in all respects. The memory case adds a temporal dimension (past learning) not present in the foreign-speech case.
review_status: rejected
resolution_ref:
  stephanus_span: 163b-163d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 163b
    start_marker: 163b
    end_marker: 163b
    start_char: 43342
    end_char: 43832
    text_sha256: 3f438867b409b14f7a7dc8bee83c96f6144ad95170b718d3339b9ed360da8854
```

```yaml
relation_id: rel_theaetetus_0028
pair_id: pair_theaetetus_00028
claim_a: claim_theaetetus_0077
claim_b: claim_theaetetus_0081
relation_kind: revision
resolution: verbal_only
resolution_ref:
  stephanus_span: 163d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 163d
    start_marker: 163d
    end_marker: 163d
    start_char: 44173
    end_char: 44602
    text_sha256: f91c6bd8e747240f8c0dd84f1053df0bfda9ac9f396322a7a6dbe88092722e8e
basis: "Claim 0077 is posed_only (not left_standing) and claim 0081 is left_standing, so 'standing' does not apply. Neither claim is refuted/withdrawn/revised, so 'refuted_resolved' does not apply. No explicit verbal distinction dissolves an apparent conflict between the claims themselves. The claims are not in conflict: 0077 poses a broad question about perception and knowledge, while 0081 secures agreement on one narrower premise (seeing=perceiving). The apparent tension — that 0077 questions whether perception entails knowledge while 0081 asserts the seeing-perception equivalence — is dissolved by recognizing the different discursive roles: one is a question posed for examination, the other an asserted premise."
limits: The resolution 'verbal_only' is used because the different final_statuses (posed_only vs. left_standing) and the distinct discursive functions (question vs. asserted premise) dissolve any apparent conflict between the claims. The relation does not evaluate whether the seeing-is-perceiving premise is sound or whether it adequately responds to the questions raised at 163b.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0029
pair_id: pair_theaetetus_00029
claim_a: claim_theaetetus_0079
claim_b: claim_theaetetus_0082
relation_kind: tension
resolution: verbal_only
basis: "Claim 0079 poses a problem for the perception-is-knowledge thesis by asking whether someone who remembers something they once learned does not know it. Claim 0082 asserts, as a premise drawn from that same thesis, that the one who has seen something has become knowledgeable of what he saw. The claims pull against one another within Socrates's elenchus, but the apparent conflict is dissolved by an explicit distinction in the text: claim 0079 is posed_only — it is a question put for examination, not an endorsed assertion — whereas claim 0082 is left_standing as an asserted premise. The difference in final_status and claim_kind (posed_for_examination vs. asserted) provides the verbal distinction that resolves the tension."
limits: The tension is internal to Socrates's elenchus at 163d-163e. The perception-is-knowledge thesis from which claim 0082 derives may face subsequent refutation, but this relation is limited to the pair as recorded.
review_status: rejected
resolution_ref:
  stephanus_span: 163d-163e
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 163d-163e
    start_marker: 163d
    end_marker: 163e
    start_char: 44173
    end_char: 45006
    text_sha256: 5b317b3333011f6564f5541449c8176abcdf55d9d2a8517782bce2ebc3c390a9
```

```yaml
relation_id: rel_theaetetus_0030
pair_id: pair_theaetetus_00030
claim_a: claim_theaetetus_0079
claim_b: claim_theaetetus_0083
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 163e-164b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 163e-164b
    start_marker: 163e
    end_marker: 164b
    start_char: 44602
    end_char: 45836
    text_sha256: e82f0997e19399fa3d803a395052defe18f0682352ccda3e71f8e4b58954f332
basis: "Claim 0079 poses the problem in interrogative form: can one who learned and remembers something not know it? Claim 0083 restates the same challenge in declarative, elaborated form, unpacking the closed-eyes scenario (μύσῃ) and making explicit the logical steps from 'seeing is knowing' to the contradictory result. Both claims articulate the same objection to the perception-is-knowledge thesis."
limits: The two claims are not identical in wording; 0083 adds the μύσῃ scenario and the explicit premise chain. The relation is a restatement, not a revision, because 0083 does not substantively modify 0079's content — it unpacks it. Both claims have final_status posed_only, not left_standing.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0031
pair_id: pair_theaetetus_00031
claim_a: claim_theaetetus_0079
claim_b: claim_theaetetus_0171
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 186c-186d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186c-186d
    start_marker: 186c
    end_marker: 186d
    start_char: 91967
    end_char: 92769
    text_sha256: 4730c252daa48362112be70f785f2471cac1f8459de85c867ff6e6165e829b23
basis: "Both claims address what it takes for someone to be ἐπιστήμων. Claim 0079 presses the problem that memory-without-current-perception seems to threaten the perception-is-knowledge thesis: if someone learned something and remembers it, does he not know it? Claim 0171 asserts that without attaining truth (ἀληθείας) one cannot be ἐπιστήμων of something. At 186c-d, Socrates explicitly distinguishes the domain of sense-perception (παθήμασιν) from the domain of reasoning about being and truth (συλλογισμῷ), and concludes that knowledge is not in perceptions but in reasoning about them. This distinction dissolves the apparent tension: claim 0079 operates within the perception-is-knowledge framework that claim 0171's context has already begun to dismantle by relocating knowledge to the soul's independent grasp of being and truth."
limits: The verbal-only resolution cites the explicit distinction at 186c-d between perception and the soul's reasoning. It does not assert that 0079 is logically refuted by 0171, only that the argumentative framework shift at 186c-d explains why the two claims pull in different directions without formal contradiction.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0032
pair_id: pair_theaetetus_00032
claim_a: claim_theaetetus_0082
claim_b: claim_theaetetus_0171
relation_kind: tension
resolution: verbal_only
basis: "claim_a (163e) asserts that seeing makes one knowledgeable of what one saw, drawn from the earlier perception=knowledge identification. claim_b (186c-d) asserts that knowledge is impossible without attaining truth. The tension between them is dissolved at 186d-e where Socrates draws a distinction between perception (παθήμασιν) and the reasoning about perceptions (συλλογισμῷ), concluding that knowledge is not in the former but in the latter. The seeing-based knowing of claim_a is thus distinguished from the truth-requiring episteme of claim_b: they are not about the same thing."
limits: This resolution relies on the distinction drawn at 186d-e, where perception and reasoning-about-perception are treated as different domains. claim_a belongs to the perception=knowledge thesis that is being examined; claim_b belongs to the argument that knowledge requires being and truth and is found in reasoning, not in perception.
resolution_ref:
  stephanus_span: 186d-186e
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186d-186e
    start_marker: 186d
    end_marker: 186e
    start_char: 92364
    end_char: 93157
    text_sha256: 909ee501e500041a09bd14aa13a821386d5929eb0481d0ccac900e32995161b0
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0033
pair_id: pair_theaetetus_00033
claim_a: claim_theaetetus_0153
claim_b: claim_theaetetus_0275
relation_kind: restatement
resolution: standing
basis: Both claims assert that knowledge is not perception. Claim 0153 makes this point conditionally within the universal-motion refutation at 182e (the definition 'knowledge is perception' yields no more knowledge than not-knowledge under universal motion). Claim 0275 states it unconditionally at the dialogue's close at 210a-210b (knowledge is neither perception, nor true judgement, nor true judgement with an account). The later claim subsumes the perceptual prong of the earlier conditional finding but adds the two additional prongs (true judgement, true judgement with account). The core denial that knowledge is perception is the same textual content.
limits: This record treats claim 0153's conditional context as a subset of claim 0275's final negative conclusion. It does not claim that the two claims are identical in scope or that their argumentative contexts are the same. Claim 0275 adds refutations of two further definitions; only the perception prong is shared.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0034
pair_id: pair_theaetetus_00034
claim_a: claim_theaetetus_0165
claim_b: claim_theaetetus_0166
relation_kind: restatement
resolution: verbal_only
basis: "Both claims concern the placement of ousia (being). In claim_a Socrates poses the thesis that ousia most of all accompanies everything and asks Theaetetus where he places it. In claim_b Theaetetus answers by asserting that the soul itself by itself reaches out after ousia and that ousia belongs among those things the soul examines through itself. Claim_b is the response to the question posed in claim_a, and the two together occupy the same dialogic exchange at 186a: Socrates supplies the definiendum (ousia as that which accompanies everything) and Theaetetus supplies the placement (among what the soul examines through itself). They are not contradictory; claim_b fills in the answer to claim_a's question."
limits: This relation is checked against the immediate exchange at 186a only. It does not assess whether later passages test or revise the claim that the soul reaches out after ousia by itself. The resolution is verbal_only because claim_a has final_status posed_only rather than left_standing; the pair cannot be resolved as standing.
resolution_ref:
  stephanus_span: 186a
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a
    start_marker: 186a
    end_marker: 186a
    start_char: 91156
    end_char: 91545
    text_sha256: e1c0b0b14da0b524469b8c35ebb1838f933275f15353bf9a9c8804bbb9749877
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0035
pair_id: pair_theaetetus_00035
claim_a: claim_theaetetus_0165
claim_b: claim_theaetetus_0167
relation_kind: restatement
resolution: verbal_only
basis: "Both claims concern the soul's grasp of ousia (being). Claim A records Socrates posing that ousia most of all accompanies everything (186a). Claim B records Theaetetus affirming that the soul examines the ousia of pairs like like/unlike, same/different, fine/shameful, good/bad, reckoning past and present against future (186a-186b). The two claims occupy a continuous exchange: Socrates asks where Theaetetus places ousia, Theaetetus answers, Socrates prompts with specific pairs, and Theaetetus expands the answer. Claim B is the fuller, elaborated version of the thesis introduced in claim A. No contradiction arises; the claims are compatible and mutually reinforcing."
limits: "The apparent tension between claim A's posed_only final_status and claim B's left_standing final_status is dissolved by the fact that these are consecutive moves in a single dialectical exchange: Socrates poses the thesis as a question, and Theaetetus immediately affirms and elaborates it in the reply that claim B records. The two records capture different speech-act moments within the same stretch of text, not conflicting positions."
review_status: rejected
resolution_ref:
  stephanus_span: 186a-186b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a-186b
    start_marker: 186a
    end_marker: 186b
    start_char: 91156
    end_char: 91967
    text_sha256: bbe952c4273cb58e93d7d919dc652e30a92ede46a5181cf6b6eb1d90c9dd3dec
```

```yaml
relation_id: rel_theaetetus_0036
pair_id: pair_theaetetus_00036
claim_a: claim_theaetetus_0165
claim_b: claim_theaetetus_0168
relation_kind: restatement
resolution: verbal_only
basis: "Both claims address ousia as something the soul itself reaches for or judges. Claim A (186a) states that ousia most of all accompanies everything, and Theaetetus places it among things the soul itself reaches for on its own. Claim B (186b) states that the soul itself, going back over and comparing them, tries to judge ousia for us. The second claim specifies the soul's activity (comparing, judging ousia of opposites) in relation to a particular perceptual pair (hard/soft), while the first claim introduces the general principle that ousia belongs to the soul's own domain. The content recurs as a restatement rather than a revision: the second claim fills out the mechanism by which the soul apprehends ousia without altering the thesis."
limits: Both claims are posed_only (neither is left_standing). The relation treats claim B as a restatement of the same thesis applied to a concrete instance; it does not assess whether the claims would hold under cross-examination or whether ousia's scope differs between the two passages.
review_status: rejected
resolution_ref:
  stephanus_span: 186a-186b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a
    start_marker: 186a
    end_marker: 186a
    start_char: 91156
    end_char: 91545
    text_sha256: e1c0b0b14da0b524469b8c35ebb1838f933275f15353bf9a9c8804bbb9749877
```

```yaml
relation_id: rel_theaetetus_0037
pair_id: pair_theaetetus_00037
claim_a: claim_theaetetus_0165
claim_b: claim_theaetetus_0169
relation_kind: restatement
resolution: verbal_only
basis: "Both claims concern ousia as a pervasive feature of things grasped by the soul through reasoning rather than bodily perception. Claim A says ousia most of all accompanies everything and the soul pursues it by itself. Claim B elaborates the same thesis, specifying the cognitive mechanism: sense-perceptions (pathemata) reach the soul through the body from birth, but calculations (analogismata) toward ousia and benefit come only through difficulty and education. The elaboration does not alter the core thesis but unpacks how the soul's grasp of ousia works."
limits: "Both claims have final_status posed_only, not left_standing, so standing does not apply. No refutation or withdrawal is recorded for either claim. The apparent difference is verbal: claim B expands the epistemic distinction already implicit in claim A's contrast between soul-by-itself pursuits and other cognitive avenues. The same ousia thesis spans both passages, with 186b-186c supplying the explanatory frame for what 186a asserts."
resolution_ref:
  stephanus_span: 186a-186c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a-186c
    start_marker: 186a
    end_marker: 186c
    start_char: 91156
    end_char: 92364
    text_sha256: 4f04d9b360cc624e02f6819cdc88a56c38da2df898ee2a85fd6771599fc9c7d2
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0038
pair_id: pair_theaetetus_00038
claim_a: claim_theaetetus_0165
claim_b: claim_theaetetus_0239
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 202b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 202b
    start_marker: 202b
    end_marker: 202b
    start_char: 124475
    end_char: 124911
    text_sha256: f6c3ea935cb5ccb5b21559c25b0f08011d435376381f30449d651d05e64eaca8
basis: "Both claims use οὐσίαν but apply it to different domains. Claim A at 186a has ousia as that which most of all accompanies everything, placed among the κοινὰ reached by the soul itself. Claim B at 202b restricts ousia of a logos to a weaving-together of names in the dream doctrine. The two uses of ousia are verbally distinct: one is universal accompaniment, the other is name-combination constituting a logos. No formal contradiction arises because οὐσία is not used in the same sense across the two claims."
limits: This does not adjudicate whether the dream doctrine's account of ousia is compatible with the 186a account. Claim A has final_status posed_only (not yet affirmed or denied by Theaetetus/the interlocutor as a settled thesis), while Claim B is reported as part of the dream doctrine and left_standing as a report. The verbal distinction is observable in the text; it does not resolve any underlying philosophical tension.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0039
pair_id: pair_theaetetus_00039
claim_a: claim_theaetetus_0166
claim_b: claim_theaetetus_0167
relation_kind: restatement
resolution: standing
basis: Claim 0166 states the general thesis that the soul by itself reaches out after ousia and that ousia belongs among what the soul examines through itself. Claim 0167 elaborates the same thesis by enumerating specific pairs whose ousia the soul examines (like/unlike, same/different, fine/shameful, good/bad) and adds the temporal-reckoning dimension (past/present/future). Both claims are Theaetetus' contiguous answers to Socrates' questioning at 186a-186b; claim 0167 makes the content of claim 0166 more specific but does not alter the thesis.
limits: Both claims have final_status left_standing. The relation is checked within the immediate 186a-186b exchange. The record does not claim the enumeration in 0167 is exhaustive or that the relation holds against later passages in the dialogue.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0040
pair_id: pair_theaetetus_00040
claim_a: claim_theaetetus_0166
claim_b: claim_theaetetus_0168
relation_kind: restatement
resolution: superseded
basis: Both claims assert that the soul itself by itself grasps being (ousia). Claim 0166 has Theaetetus asserting that the soul reaches out after ousia through itself (186a), and claim 0168 has Socrates reformulating the same point with the additional specification that the soul goes back over and compares things with each other to judge ousia, what the two are, their opposition, and the ousia of the opposition (186b). The core thesis — that ousia is the soul's own object, examined through itself without the senses — is preserved across both. The 186b formulation adds detail about comparative activity and the ousia of opposition but does not alter the fundamental claim.
limits: Claim 0166 has final_status left_standing and claim 0168 has final_status posed_only. The 186b formulation builds on and replaces the simpler 186a formulation by adding the comparative dimension, so the later formulation supersedes the earlier one for the purposes of the dialectical sequence. The record does not assess whether the 186b formulation implies a different epistemic status than 186a.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0041
pair_id: pair_theaetetus_00041
claim_a: claim_theaetetus_0166
claim_b: claim_theaetetus_0169
relation_kind: restatement
resolution: verbal_only
basis: |
  Both claims articulate the same ontological-epistemological hierarchy. Claim 0166 (Theaetetus, 186a) asserts that the soul itself by itself reaches out after being (ousia) and that ousia belongs among the things the soul examines through itself. Claim 0169 (Socrates, 186b-186c) develops the same distinction by contrasting sense-perceptions (pathemata) that reach the soul through the body with calculations (analogismata) concerning being and benefit that come only with difficulty through education. The shared term ousia anchors both claims: claim 0166 names ousia as the object of the soul's self-directed inquiry; claim 0169 expands this by specifying the process (analogismata) and the preconditions (education, time, practice) for reaching ousia. Socrates' formulation does not alter Theaetetus' thesis but articulates it in greater detail.
limits: |
  Claim 0166 has final_status left_standing and claim 0169 has final_status posed_only, so the standing resolution is unavailable. The relation is resolved as verbal_only because the difference between the claims is one of elaboration rather than substantive modification: claim 0169 expands the same thesis with greater specificity about process and preconditions without altering the core claim. The pair is treated as a restatement rather than a revision because no substantive modification of the core thesis is present.
review_status: rejected
resolution_ref:
  stephanus_span: 186b-186c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186b-186c
    start_marker: 186b
    end_marker: 186c
    start_char: 91545
    end_char: 92364
    text_sha256: ea004192586b20698fc76fcb77101c491e8a494fc51a820810df5c65fe8af028
```

```yaml
relation_id: rel_theaetetus_0042
pair_id: pair_theaetetus_00042
claim_a: claim_theaetetus_0166
claim_b: claim_theaetetus_0239
relation_kind: tension
resolution: standing
basis: "Both claims use ουσιαν in different contexts. Claim 0166 describes the soul's independent grasp of being (ousia) among the κοινά it examines through itself, while claim 0239 describes the being (ousia) of a logos as a weaving-together of names, reported as part of Socrates's dream doctrine. The shared term ουσιαν links them conceptually—in both cases ousia is something toward which cognitive activity reaches—but they address different domains: the soul's noetic grasp of being versus the linguistic constitution of a logos. They are not contradictory, since one concerns what the soul pursues by itself and the other concerns what constitutes a logos's ousia, but they pull in different directions about where ousia is located (in the soul's independent activity versus in composite naming)."
limits: "This relation is checked within the Theaetetus only and does not assess whether the two claims would conflict under a unified theory of ousia. Both claims have final_status left_standing. The tension is noted because the shared term ουσιαν appears in contrasting frameworks: one about the soul's self-sufficient reach, the other about linguistic composite structure."
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0043
pair_id: pair_theaetetus_00043
claim_a: claim_theaetetus_0167
claim_b: claim_theaetetus_0168
relation_kind: restatement
resolution: verbal_only
basis: "Both claims describe the soul's examination of being (ousia) by itself through comparison and reckoning. Claim_a (Theaetetus at 186a-b) lists the objects of this activity — like/unlike, same/different, fine/shameful, good/bad — and states the soul reckons past and present in relation to the future. Claim_b (Socrates at 186b, with Theaetetus assenting) restates the same structure with hardness/softness as the example pair: the soul goes back over them, compares them, and tries to judge their being, what the two are, their opposition, and the being of the opposition. The two claims cover the same cognitive operation (soul-by-itself examining ousia through comparison), differing only in which pairs of opposites are instanced."
limits: Claim_b (claim_theaetetus_0168) has final_status posed_only, which does not meet the standing requirement. Resolution set to verbal_only because Socrates' formulation at 186b explicitly restates the same cognitive structure Theaetetus assented to, using fresh example terms (hard/soft) and making the opposition explicit, which dissolves any appearance of a distinct claim.
resolution_ref:
  stephanus_span: 186a-186b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a-186b
    start_marker: 186a
    end_marker: 186b
    start_char: 91156
    end_char: 91967
    text_sha256: bbe952c4273cb58e93d7d919dc652e30a92ede46a5181cf6b6eb1d90c9dd3dec
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0044
pair_id: pair_theaetetus_00044
claim_a: claim_theaetetus_0167
claim_b: claim_theaetetus_0169
relation_kind: restatement
resolution: verbal_only
basis: "Both claims address the soul's grasp of ousia and the objects through which it is known. Claim A records Theaetetus' assertion that the soul examines the ousia of pairs like like/unlike, same/different, fine/shameful, good/bad, reckoning past and present in relation to future. Claim B records Socrates' formulation that sense-perceptions (pathemata) arrive through the body at birth to humans and beasts, while calculations (analogismata) concerning these toward ousia and benefit come only through difficulty, time, practice, and education. The two claims are complementary articulations of the same distinction: claim A describes what the soul does by itself (examine ousia of common terms), claim B describes the developmental contrast between innate sense-perception and hard-won ousia-directed reasoning. Both are left standing in the dialogue and cohere as progressive clarifications of one thesis rather than competing claims."
limits: This record treats the pair as a restatement across two adjacent Stephanus spans (186a-186b and 186b-186c) spoken by different interlocutors (Theaetetus and Socrates). It does not claim the two passages are verbally identical, only that they articulate the same core distinction between bodily perception and the soul's independent grasp of ousia. The restatement judgement is confined to the textual content of these two records; it does not address other passages in the dialogue.
resolution_ref:
  stephanus_span: 186b-186c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186a-186c
    start_marker: 186a
    end_marker: 186c
    start_char: 91156
    end_char: 92364
    text_sha256: 4f04d9b360cc624e02f6819cdc88a56c38da2df898ee2a85fd6771599fc9c7d2
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0045
pair_id: pair_theaetetus_00045
claim_a: claim_theaetetus_0167
claim_b: claim_theaetetus_0239
relation_kind: tension
resolution: standing
basis: "Both claims use οὐσίαν (ousia) in importantly different contexts. Claim A (186a-186b) describes the soul's examination of the being of common notions (like/unlike, same/different, fine/shameful, good/bad) by itself, reaching toward being through its own activity. Claim B (202b) reports the dream doctrine's account of logos-ousia as a weaving-together of names, where the being of a logos just is composed name-structures. The shared term οὐσίαν does not pick out the same subject: in A the soul examines the being of relational and evaluative things; in B a logos has its being as name-complex. There is no formal contradiction because the claims address different domains (soul's cognitive objects vs. logos's compositional structure), but the recurrence of the high-theoretic term οὐσίαν in two accounts of what being consists in — one through the soul's own reckoning, one through linguistic composition — creates a textual tension that the dialogue does not explicitly resolve."
limits: Both claims have final_status left_standing. Socrates reports the dream doctrine in B without adopting it, and Theaetetus assents to the soul's independent examination of being in A under Socratic questioning. This relation does not assert that the dialogue intends to juxtapose these passages; it records only that the shared term and the differing accounts of where being is grasped (soul's self-activity vs. name-weaving) pull in different directions without formal contradiction.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0046
pair_id: pair_theaetetus_00046
claim_a: claim_theaetetus_0168
claim_b: claim_theaetetus_0169
relation_kind: restatement
resolution: verbal_only
basis: "Both claims distinguish sense-perception from the soul's own activities concerning ousia. Claim 0168 states that the soul itself, by going back over and comparing, tries to judge ousia and opposition for us. Claim 0169 states that sense-perceptions (pathemata) are present from birth while calculations (analogismata) about ousia and benefit come with difficulty through education. The two claims appear in consecutive turns within the same passage (186b–186c) and articulate the same distinction: the body-dependent sense channel versus the soul's own comparative reckoning toward ousia. Claim 0169 generalizes the distinction into a nature-versus-education thesis, while claim 0168 gives a concrete instance (hardness/softness). Both are posed by Socrates and assented to by Theaetetus; neither is refuted, withdrawn, or revised."
limits: Both claims have final_status posed_only rather than left_standing, so resolution cannot be standing. The apparent difference in scope (concrete instance vs. general thesis) is a verbal distinction in the way the same underlying contrast is articulated, not a substantive disagreement. Whether this distinction holds across other dialogue passages is not assessed here.
review_status: rejected
resolution_ref:
  stephanus_span: 186b-186c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186b-186c
    start_marker: 186b
    end_marker: 186c
    start_char: 91545
    end_char: 92364
    text_sha256: ea004192586b20698fc76fcb77101c491e8a494fc51a820810df5c65fe8af028
```

```yaml
relation_id: rel_theaetetus_0047
pair_id: pair_theaetetus_00047
claim_a: claim_theaetetus_0168
claim_b: claim_theaetetus_0239
relation_kind: tension
resolution: verbal_only
basis: "Both claims involve the term οὐσίαν (being) and concern what a cognitive achievement consists in. Claim 0168 (186b) says the soul itself, going back over and comparing perceptions, tries to judge the being (ousia) of things like hardness/softness and their opposition. Claim 0239 (202b) reports a dream doctrine according to which the being of a logos is a weaving-together (συμπλοκή) of names. Both claims share the vocabulary of ousia and the structure of a composite achievement (comparison of perceptions vs. weaving of names), but they operate on different domains: 0168 is about the soul's epistemic access to being through perceptual comparison, while 0239 is about the ontological constitution of a logos from names. The two are not contradictory, since one could hold both that the soul judges ousia through comparison and that the ousia of a logos is a name-weaving, without inconsistency. The tension lies in whether the cognitive comparison in 0168 is the same kind of activity as the name-weaving in 0239, or whether the dream doctrine's account of logos is compatible with the soul's independent access to ousia described at 186b."
limits: This record does not assess whether the dream doctrine is later refuted, nor whether Socrates endorses either claim. Claim 0168 has final_status posed_only while claim 0239 has final_status left_standing; the verbal distinction is that 0168 concerns the soul judging ousia of perceptible pairs, while 0239 concerns the ousia of a logos as a name-composite. These are different subject matters and the shared term οὐσίαν does not by itself create a contradiction.
resolution_ref:
  stephanus_span: 186b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186b
    start_marker: 186b
    end_marker: 186b
    start_char: 91545
    end_char: 91967
    text_sha256: c5d0fec62535db855ba5250fac265d217b1737658df692538d3c2523c3ba9eb8
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0048
pair_id: pair_theaetetus_00048
claim_a: claim_theaetetus_0169
claim_b: claim_theaetetus_0239
relation_kind: tension
resolution: verbal_only
basis: |
  Both claims use the term οὐσίαν (being), but in different contexts. Claim A (186b-186c) treats the soul's calculations (ἀναλογίσματα) toward οὐσία and benefit as a cognitive achievement reached with difficulty through education. Claim B (202b) treats λόγου οὐσίαν as a weaving-together of names (ὀνομάτων συμπλοκήν), reported as part of the dream doctrine. The two claims do not directly address the same question — one concerns how παθήματα relate to the soul's grasp of being, the other offers an account of what a logos is — but they pull against each other in that claim A places the soul's access to οὐσία in a difficult rational process, while claim B's dream-theoretic account grounds logos-being in name-combination, which may not require the same kind of soul-led calculation.
limits: |
  This tension is limited to the shared term οὐσίαν. The claims deploy it in different argumentative contexts (perception-to-knowledge ladder vs. dream doctrine). The tension does not amount to a formal contradiction because the two theses address different targets (grasp of being from sense-perceptions vs. the being of a logos). The tension would become sharper only if it were shown that the dream doctrine's account of logos is incompatible with the soul's calculative access to being.
resolution_ref:
  stephanus_span: 186c-186e;202b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186b-186c
    start_marker: 186b
    end_marker: 186c
    start_char: 91545
    end_char: 92364
    text_sha256: ea004192586b20698fc76fcb77101c491e8a494fc51a820810df5c65fe8af028
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0049
pair_id: pair_theaetetus_00049
claim_a: claim_theaetetus_0170
claim_b: claim_theaetetus_0171
relation_kind: restatement
resolution: verbal_only
basis: "Claim 0170 asserts that attaining truth is impossible without attaining being (ousia). Claim 0171 asserts that where one fails to attain truth, knowledge cannot arise. These are adjacent steps in a single chain of reasoning at 186c-d: Socrates first secures the point about truth-and-being, then draws the epistemic consequence. They are not in conflict or tension; claim 0171 builds on 0170 by extending the truth-condition into the domain of knowledge. Both claims have final_status posed_only, so standing does not apply. The explicit distinction between them is that 0170 links truth to ousia while 0171 links truth to episteme: the object of each claim differs by the explicit term used (οὐσίας vs. ἐπιστήμων)."
limits: These are two distinct logical claims in the same argument chain, not a literal repetition. Neither claim has been refuted, revised, or left standing; both are merely posed.
review_status: rejected
resolution_ref:
  stephanus_span: 186c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186c
    start_marker: 186c
    end_marker: 186c
    start_char: 91967
    end_char: 92364
    text_sha256: c1e005863f7e6f4c038d2f1d4f5afb44fa566c044342a49d1be650f7d208a2b3
```

```yaml
relation_id: rel_theaetetus_0050
pair_id: pair_theaetetus_00050
claim_a: claim_theaetetus_0170
claim_b: claim_theaetetus_0172
relation_kind: restatement
resolution: verbal_only
basis: Claim 0170 asserts a general principle (truth requires being); claim 0172 applies that principle to the specific domain of knowledge, locating episteme in reasoning rather than sense-perceptions precisely because being and truth are graspable only there. The second claim is the direct conclusion of the line of argument that includes the first claim as a premise.
limits: Both claims are posed only. The relation is confined to the sequential logical dependency visible at 186c–186d; it does not assess whether either claim is independently tested later in the dialogue.
resolution_ref:
  stephanus_span: 186c-186d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186c-186d
    start_marker: 186c
    end_marker: 186d
    start_char: 91967
    end_char: 92769
    text_sha256: 4730c252daa48362112be70f785f2471cac1f8459de85c867ff6e6165e829b23
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0051
pair_id: pair_theaetetus_00051
claim_a: claim_theaetetus_0171
claim_b: claim_theaetetus_0172
relation_kind: revision
resolution: verbal_only
basis: "Both claims are posed by Socrates in the same passage (186c-186d) and share the core term ἀληθείας. Claim 0171 states a general principle: one who fails to attain truth about something can never have knowledge of it. Claim 0172 applies that principle to a specific domain, locating knowledge in reasoning (συλλογισμός) about sense-perceptions rather than in the sense-perceptions (παθήμασιν) themselves, on the grounds that being and truth are graspable in reasoning but not in perception. Claim 0172 substantively extends claim 0171 from a negative epistemic principle to a positive thesis about where knowledge resides, making the relation a revision rather than a bare restatement. The claims do not conflict; the distinction is explicit in the text where claim 0172 draws the contrast between perception (παθήμασιν) and reasoning (συλλογισμός)."
limits: Both claims share final_status posed_only; Theaetetus assents to each. The relation is assessed only within the scope of 186c-186d. No later revision or refutation is captured here.
review_status: rejected
resolution_ref:
  stephanus_span: 186c-186d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186c-186d
    start_marker: 186c
    end_marker: 186d
    start_char: 91967
    end_char: 92769
    text_sha256: 4730c252daa48362112be70f785f2471cac1f8459de85c867ff6e6165e829b23
```

```yaml
relation_id: rel_theaetetus_0052
pair_id: pair_theaetetus_00052
claim_a: claim_theaetetus_0172
claim_b: claim_theaetetus_0173
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 186d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 186d
    start_marker: 186d
    end_marker: 186d
    start_char: 92364
    end_char: 92769
    text_sha256: 0ba630dfa4af4fe07d147e054f6fe6c740b369fca9aab47587dadb19b72a995a
basis: "Both claims assert the same core thesis: knowledge (episteme) is not in sense-perception (pathemasin / aisthesis) but in reasoning about them, and therefore knowledge and sense-perception are not the same. Claim A (Socrates, 186d) states it positively — knowledge is in the reasoning (syllogismos) about sense-perceptions because being and truth are graspable there. Claim B (Theaetetus, 186d-186e) draws the negative conclusion — sense-perception and knowledge are not the same. The apparent difference (posed_only vs. left_standing final_status) is dissolved by the text: Theaetetus assents to Socrates's formulation at 186d (φαίνεται), then at 186e he restates the conclusion as now manifest. The difference is only one of speaker and formulation direction (positive vs. negative), not of content."
limits: The claim that knowledge is other than sense-perception is established in this passage; what knowledge positively is remains undefined. The two records express the same distinction from complementary angles.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0053
pair_id: pair_theaetetus_00053
claim_a: claim_theaetetus_0172
claim_b: claim_theaetetus_0177
relation_kind: revision
resolution: verbal_only
basis: "Claim A (186d) asserts that knowledge is not in sense-perceptions but in reasoning about them. Claim B (187b) proposes that knowledge is true judgment. Claim A's final_status is 'posed_only'; Claim B's is 'left_standing'. The apparent movement from one to the other is a revision in the dialogue's definitional sequence: Claim B replaces the broad reasoning-vs.-perception contrast with a specific cognitive product (true judgment). At 187b, Socrates invites Theaetetus to speak again on what knowledge is after the earlier attempts, and Theaetetus offers the new candidate, explicitly distinguishing true judgment from false judgment. This explicit procedural reset dissolves any conflict between the two claims as competing accounts."
limits: The relation records textual succession, not logical entailment. Claim A was posed as a distinction about the locus of knowledge but was not itself a definition; Claim B is the next candidate definition. The relation does not claim that Claim B logically follows from Claim A.
resolution_ref:
  stephanus_span: 187b
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 187b
    start_marker: 187b
    end_marker: 187b
    start_char: 93574
    end_char: 94026
    text_sha256: e9c61800ccad358a5ce230aa68e62c4eb55ff8f9e8acb5ac14c065efd2fdc09a
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0054
pair_id: pair_theaetetus_00054
claim_a: claim_theaetetus_0173
claim_b: claim_theaetetus_0177
relation_kind: tension
resolution: standing
basis: "Claim 0173 concludes that knowledge and sense-perception are not the same (186d-186e). Claim 0177 proposes that knowledge is true judgment (187b). These are not formally contradictory — rejecting the identity of knowledge and perception does not conflict with proposing true judgment as the definition of knowledge — but the two claims inhabit different phases of the inquiry: the first closes the perception chapter and the second opens the judgment chapter. The tension arises from the structural proximity of a negative conclusion followed by a positive candidate that is not yet tested."
limits: Both claims are left standing as of their respective passage contexts. This relation does not assess whether the true-judgment definition will later be refuted, nor does it claim that the two statements logically conflict.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0055
pair_id: pair_theaetetus_00055
claim_a: claim_theaetetus_0174
claim_b: claim_theaetetus_0214
relation_kind: tension
resolution: standing
basis: "Both claims are procedural method_rule statements about the inquiry into knowledge. Claim 0174 reports at 187a that enough progress has been made to stop seeking knowledge in sense-perception and to seek it instead in what the soul does by itself. Claim 0214 reports at 196d-196e that it is shameless to declare what knowing is when the whole inquiry has been a search for knowledge as something not yet known. The two claims pull against one another: the earlier asserts a positive methodological reorientation (seeking knowledge in the soul's own activity), while the later frames any positive declaration about knowing as shameless given the inquiry's ignorance. They are not formally contradictory, since the 187a claim is about where to look and the 196d-196e claim is about the impropriety of declaring a result."
limits: Both claims have final_status left_standing and the record does not adjudicate whether Socrates' shamelessness charge at 196d-196e is meant to retroactively undercut the 187a methodological stance. The tension is recorded as a textual relation between two standing procedural remarks; no resolution is imposed.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0056
pair_id: pair_theaetetus_00056
claim_a: claim_theaetetus_0179
claim_b: claim_theaetetus_0181
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 187d-187e
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 187d-187e
    start_marker: 187d
    end_marker: 187e
    start_char: 94419
    end_char: 95233
    text_sha256: 38401fef6e9674cd6d93ee2653c660eb05c3b69e72c72072f0d3f2b5435609da
basis: "Both claims articulate the same problem in successive steps. Claim A (187d) reports Socrates' long-standing personal aporia about what false judgment (ψευδῆ δόξαν) is. Claim B (187e) frames the same phenomenon in impersonal terms as what 'we say' — that false judgment exists and some judge falsely while others judge truly — and poses it for examination. Claim B restates the same target phenomenon (false judgment) from the first-person perplexity of claim A into a communal thesis ready for inquiry. The content of claim B does not modify or contradict claim A; it formulates the shared premise that claim A's aporia presupposes. The apparent difference between aporia (claim A) and confident assertion (claim B) is verbal: claim A presents the internal state, claim B presents the shared linguistic practice that claim A's perplexity already targets."
limits: This record notes that the two claims present the same core subject (false judgment) in different rhetorical frames. It does not claim that the move from first-person aporia to communal thesis is dialectically neutral, only that claim B restates the phenomenon claim A confesses to not understanding.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0057
pair_id: pair_theaetetus_00057
claim_a: claim_theaetetus_0220
claim_b: claim_theaetetus_0221
relation_kind: restatement
resolution: standing
basis: "Both claims develop the same aviary analogy (περιστερεῶνα). Claim 0220 introduces the possession/having distinction — one can possess knowledge without having it in hand, just as one possesses birds in an aviary and can take hold of them at will. Claim 0221 extends the same model by mapping the contents of the aviary onto the soul: the birds are knowledges (ἐπιστήμας), arranged in flocks, small groups, or flying singly. Claim 0221 elaborates the image introduced in 0220 without altering its core claim; the two claims are contiguous in Stephanus pagination (197c-197d → 197d-197e) and both are spoken by ΣΩ."
limits: This relation records that the two claims restate and elaborate the same aviary model across adjacent spans. It does not assess whether the analogy succeeds in explaining false judgment, nor does it address the subsequent critique at 199c-200d. Both claims are left_standing in their respective ledgers.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0058
pair_id: pair_theaetetus_00058
claim_a: claim_theaetetus_0228
claim_b: claim_theaetetus_0229
relation_kind: revision
resolution: verbal_only
basis: "Claim A (0228) presents the mechanism for false judgment within the aviary model: mistaking one knowledge for another, like taking a ringdove instead of a pigeon. Claim B (0229) is Socrates' immediate follow-up in 199c, raising the difficulty that the very exchange (μεταλλαγὴ) of knowledges producing false judgment is strange. The two claims are in revision relation: claim B revises the standing of the mechanism by introducing a new difficulty. The apparent tension between an asserted mechanism and its immediate problematization is resolved by the explicit verbal distinction in 199c itself: Socrates first states the mechanism as a hypothesis and then immediately frames its difficulty as a distinct, newly appearing problem (δεινότερον μέντοι πάθος ἄλλο παραφαίνεσθαι). The distinction between the mechanism's assertion and its difficulty is drawn explicitly in the text."
limits: This records the immediate textual sequence where the aviary model's account of false judgment as knowledge-exchange is proposed and then immediately challenged, with the text itself distinguishing the two moments. It does not assess whether the distinction ultimately holds up.
resolution_ref:
  stephanus_span: 199c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 199c
    start_marker: 199c
    end_marker: 199c
    start_char: 118901
    end_char: 119324
    text_sha256: 2a6317ca21f34013ad5bb286e942d137a3e3c13e77cbaafdccd348eb27930f48
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0059
pair_id: pair_theaetetus_00059
claim_a: claim_theaetetus_0239
claim_b: claim_theaetetus_0240
relation_kind: restatement
resolution: standing
basis: "Both claims are adjacent moments in Socrates's report of the dream doctrine at 202b-c. Claim A identifies the being (οὐσίαν) of a logos as a weaving-together (συμπλοκήν) of names. Claim B states that true opinion without an account (λόγου) is not knowledge but true opinion with an account is. The second claim presupposes the first: the account whose presence makes the difference is itself the name-weaving that constitutes a logos. Claim B restates the logos-as-weaving thesis in application to the knowledge/true-opinion distinction."
limits: Both claims have final_status left_standing as reported theses within the dream doctrine. This relation does not claim that Socrates or Theaetetus endorses the doctrine. The restatement is within the scope of 202a-c; it says nothing about later dialogue developments.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0060
pair_id: pair_theaetetus_00060
claim_a: claim_theaetetus_0242
claim_b: claim_theaetetus_0247
relation_kind: revision
resolution: superseded
basis: "Claim A flags the dream doctrine thesis (elements unknowable, syllables knowable) as objectionable and in need of examination. Claim B develops one horn of Socrates's subsequent examination: if a syllable is both its elements (as Theaetetus concedes at 203c), knowing the syllable requires knowing each element, which undermines the element/syllable asymmetry that Claim A questions. Claim B thus specifies the argumentative reason why the thesis flagged in Claim A is unsustainable, moving from a flagged dissatisfaction to a concrete refutation of the dream doctrine's position."
limits: Claim B does not itself declare the dream doctrine refuted; it shows that the asymmetry collapses if syllable = sum of elements. The resolution is superseded rather than refuted_resolved because Claim A is unresolved_challenge (not yet refuted), but Claim B's argument makes Claim A's flagged objection precise.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0061
pair_id: pair_theaetetus_00061
claim_a: claim_theaetetus_0244
claim_b: claim_theaetetus_0245
relation_kind: tension
resolution: standing
basis: Both claims are left standing in the text. Claim A (Socrates' question-driven conclusion) states that the syllable SO has an account (its elements sigma and omega). Claim B (Theaetetus's reply) states that sigma, as an element, cannot be given an account in terms of further elements — it is an unvoiced noise. These claims pull against each other because the syllable's account depends on elements that are themselves declared unaccountable, but the text does not mark either as refuted or withdrawn.
limits: Checked scope is 203a-203b only; does not resolve whether the tension is addressed later in the dialogue. Both claims are attributed to Theaetetus under Socratic questioning.
review_status: accepted
```

```yaml
relation_id: rel_theaetetus_0062
pair_id: pair_theaetetus_00062
claim_a: claim_theaetetus_0249
claim_b: claim_theaetetus_0257
relation_kind: revision
resolution: superseded
basis: Claim A (203e) revises the earlier syllable-as-sum view by proposing the syllable is a single form (εἶδος, ἰδέα μία) arising from elements but distinct from them. Claim B (205d) draws the consequence that if the syllable has no parts and is one form (μία ἰδέα), it falls into the same form (εἶδος) as the element — which undermines the very distinction claim A introduced. Claim B thus supersedes claim A by showing that the 'single form' proposal collapses into the element-form it was meant to escape.
limits: The revision is recognized here as a textual movement within the Theaetetus syllable passage. Both claims are spoken by Socrates. The record does not assess whether the collapse at 205d is itself later revised or whether the argument is sound.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0063
pair_id: pair_theaetetus_00063
claim_a: claim_theaetetus_0250
claim_b: claim_theaetetus_0251
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 204a
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 204a
    start_marker: 204a
    end_marker: 204a
    start_char: 128096
    end_char: 128520
    text_sha256: e81587aa8dddec2e5923cd265312be2bca3092ec4f1399b3a2eee37bc9c2e846
basis: "Both claims appear in immediate succession within Socrates' same speech at 204a. Claim 0250 states that on the one-form view a syllable should have no parts; claim 0251 states that where there are parts, the whole must be all the parts or a distinct single form. The two claims articulate complementary limbs of a single disjunction: the one-form view (μία ἰδέα) excludes composition from parts, and the whole-is-parts distinction dissolves any apparent tension between them."
limits: The relation is limited to the textual fit between the two claims as posed in 204a-204b. Both claims have final_status posed_only, not left_standing, so standing resolution does not apply. The verbal distinction between the no-parts consequence and the whole/parts disjunction is explicit in Socrates' own articulation.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0064
pair_id: pair_theaetetus_00064
claim_a: claim_theaetetus_0250
claim_b: claim_theaetetus_0257
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 205d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 205d
    start_marker: 205d
    end_marker: 205d
    start_char: 131421
    end_char: 131866
    text_sha256: 3b7b393b7b066c0fb2e35fba72daf37d2c16001f5f64af38f1134e2891404a0f
basis: "Both claims trace the same conditional chain: if the syllable is a single form (μία ἰδέα) arising from combined elements, then it has no parts (204a); and if it has no parts and is one form, then it falls into the same form as the element (205d). Claim B resumes the conditional consequence stated in claim A and draws the next logical step, with Theaetetus agreeing at both points. There is no revision, contradiction, or tension between the two claims as stated; claim B builds on the conditional setup posed in claim A. Claim A has final_status posed_only while claim B has left_standing; the apparent status difference is verbal only because both are conditionals explicitly posed by Socrates and accepted by Theaetetus within the same unfolding argument, and the later re-statement at 205d resolves any doubt about whether the conditional chain still holds."
limits: Checked scope is the thesis-level content of each claim record. The relation does not assess whether Socrates ultimately endorses either conditional, nor whether the broader dream-theory argument survives. Both claims have Theaetetus's assent and neither is refuted or withdrawn.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0065
pair_id: pair_theaetetus_00065
claim_a: claim_theaetetus_0251
claim_b: claim_theaetetus_0254
relation_kind: revision
resolution: verbal_only
basis: At 204a-204b Socrates poses the question whether 'whole' (ὅλον) and 'all' (πᾶν) are the same or different, and Theaetetus ventures they are different (ἕτερον). At 205a Socrates leads him through a series of questions about completeness and absence, after which Theaetetus answers that πᾶν and ὅλον no longer seem to differ (οὐδὲν διαφέρειν). The explicit distinction at 204a-b (the question itself demarcates the two terms as candidates for difference) is resolved when Theaetetus at 205a collapses the distinction under Socrates' questioning about whether something from which nothing is absent is thereby both whole and all.
limits: This records the move from a tentative distinction to a collapse of that distinction within the same examination sequence. It does not address whether Socrates' reformulation at 205a genuinely eliminates the distinction or merely leads Theaetetus to overlook it. The earlier claim was posed for examination (posed_only), not independently argued, and the later claim is reached through Socratic questioning (left_standing), so the revision tracks the dialectical trajectory rather than a settled philosophical position.
review_status: rejected
resolution_ref:
  stephanus_span: 205a
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 205a
    start_marker: 205a
    end_marker: 205a
    start_char: 130030
    end_char: 130472
    text_sha256: 56b3b2550a477c7abfbac967b00a70f8ca155c068d5e27a0986f9461acdd641f
```

```yaml
relation_id: rel_theaetetus_0066
pair_id: pair_theaetetus_00066
claim_a: claim_theaetetus_0255
claim_b: claim_theaetetus_0257
relation_kind: restatement
resolution: standing
basis: "Both claims express the same consequence of the same line of argument: if the syllable has no parts, it is one indivisible form. Claim 0255 states that the syllable would be 'one indivisible form' (μία τις ἰδέα ἀμέριστος) at 205c. Claim 0257 states that the syllable falls into the same form as the element — i.e., is partless and one form (μία ἰδέα) — at 205d. The second claim makes explicit the comparison with the element that was latent in the first, but the core content is identical: a partless syllable is one indivisible form."
limits: The small difference is that claim 0257 explicitly equates the syllable's form with the element's (εἰς ταὐτὸν … εἶδος ἐκείνῳ), while claim 0255 simply states the result without the comparison. This is elaboration of the same point, not a modification. Both claims are left standing and unconditionally agreed to by Theaetetus.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0067
pair_id: pair_theaetetus_00067
claim_a: claim_theaetetus_0263
claim_b: claim_theaetetus_0267
relation_kind: revision
resolution: verbal_only
basis: Claim 0263 restates the element-by-element logos form of the definition 'right opinion with logos' as applied to the wagon example, while claim 0267 asserts that this element-by-element form has now been examined but a third remaining form of logos exists. The latter revises the dialectical landscape by advancing past the construal examined in the former.
limits: "Both claims can stand because they address different moments in the dialectical progression: 0263 poses the element-by-element construal for examination, while 0267 notes that examination has occurred and a further form remains."
resolution_ref:
  stephanus_span: 208b-208c
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 208b-208c
    start_marker: 208b
    end_marker: 208c
    start_char: 136721
    end_char: 137593
    text_sha256: 65be24efe0fb269191f1467d8720a3f57ede76736c128d0ae45b74ceb16e5170
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0068
pair_id: pair_theaetetus_00068
claim_a: claim_theaetetus_0263
claim_b: claim_theaetetus_0269
relation_kind: restatement
resolution: verbal_only
basis: "Both claims restate the unnamed definer's third-form-of-logos thesis — that knowledge is true opinion with logos. Claim 0263 applies it to the wagon example (logos as traversal through the hundred elements), while claim 0269 restates the general principle using the differentia formulation (grasping the differentiating mark). They are consecutive articulations of the same thesis, not competing accounts. In the dialogue, Socrates presents claim 0263 first (207c), Theaetetus recalls there is still a remaining form, and Socrates supplies claim 0269 as that third form (208c-208d). The apparent variation is verbal only: the wagon-element illustration and the differentia formulation both express the same underlying thesis that logos consists in enumerating the parts or marks that distinguish the object."
limits: "Both are restatements of the definer's position, not Socrates' own endorsement. This relation does not assess whether either formulation of the logos-as-differentia thesis succeeds. The two claims use different illustrations (wagon elements vs. sun's brightness) but converge on the same structural point: logos supplies what distinguishes a thing from others."
review_status: rejected
resolution_ref:
  stephanus_span: 208c-208d
  source_ref:
    source_path: raw/plato/greek/theaetetus.txt
    stephanus_span: 208c-208d
    start_marker: 208c
    end_marker: 208d
    start_char: 137118
    end_char: 137980
    text_sha256: cc13700c9b8efcd759e1d391a0566019513d3903b28b95f88bed1e11f791edc1
```

```yaml
relation_id: rel_theaetetus_0069
pair_id: pair_theaetetus_00069
claim_a: claim_theaetetus_0267
claim_b: claim_theaetetus_0269
relation_kind: restatement
resolution: standing
basis: "Both claims describe the same third form of logos — the differentia account ('to loipon eidos ton trion' at 208c). Claim 0267 announces that this form remains to be examined after the element-by-element path was refuted. Claim 0269 unpacks what that third form consists in: grasping the differentia of a thing whereby it differs from others, as opposed to grasping only common features. The second claim is a specification of the first, not a revision or contradiction; the content of the third form is merely elaborated in 0269 using the sun illustration."
limits: Checked against the spans 208b-208c and 208c-208d. Both claims have final_status left_standing and neither refutes or modifies the other. The relation does not assess whether the differentia account of logos succeeds or whether Socrates endorses it.
review_status: rejected
```

```yaml
relation_id: rel_theaetetus_0070
pair_id: pair_theaetetus_00070
claim_a: claim_theaetetus_0269
claim_b: claim_theaetetus_0270
relation_kind: restatement
resolution: standing
basis: "Both claims articulate the third form of logos under examination: knowledge is right opinion plus the differentia (διαφορά) that distinguishes a thing from others. Claim 0269 states the principle using the sun example as illustration (208c-d: 'τὴν διαφορὰν ἑκάστου ἂν λαμβάνῃς ᾗ τῶν ἄλλων διαφέρει, λόγον...λήψῃ'). Claim 0270 restates the same thesis in the knowledge-becoming register (208e: 'ὃς δ' ἂν μετ' ὀρθῆς δόξης...τὴν διαφορὰν τῶν ἄλλων προσλάβῃ, αὐτοῦ ἐπιστήμων γεγονὼς ἔσται'). The second formulation adds the temporal dimension ('γεγονὼς...πρότερον ἦν δοξαστής') but does not modify the core differentia account."
limits: Both claims are left standing as thesis-statements under examination, not as endorsed conclusions. The restatement relation is confined to the content of the third-form-of-logos account itself; it does not assess whether the two formulations are logically equivalent in all respects, nor does it track the subsequent refutation that begins after 208e.
review_status: rejected
```
