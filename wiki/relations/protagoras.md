```yaml
relation_id: rel_protagoras_0001
pair_id: pair_protagoras_00001
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0013
relation_kind: restatement
resolution: verbal_only
basis: "Both claims advance the same overarching thesis: universal participation in justice (ἀρετή understood as a political virtue) explains how cities exist, and the phenomenon of good fathers with bad sons is not an objection to that thesis but a consequence of it. Claim 0011 states the thesis directly: every citizen must share in justice/moderation/piety for a city to exist. Claim 0013 extends the same thesis by analogical argument: if everyone shared in flute-playing as they do in justice, variability in outcomes would still occur. The two spans are distinct but the content is a restatement of the same core position, not a revision or contradiction."
limits: Claim 0011 has final_status posed_only and claim 0013 has final_status left_standing. The resolution is verbal_only because the two claims appear at different moments in Protagoras's speech and the later span does not formally withdraw or refute the earlier one — it applies the same thesis to a specific objection. This does not assess whether the flute-playing analogy is valid or whether Socrates accepts the reasoning.
review_status: rejected
resolution_ref:
  stephanus_span: 327a-327c
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 327a-327c
    start_marker: 327a
    end_marker: 327c
    start_char: 36103
    end_char: 37399
    text_sha256: 74221a5b2734621913289d8c8926a54d2782214abe40bc24c022a394342cd217
```

```yaml
relation_id: rel_protagoras_0002
pair_id: pair_protagoras_00002
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0016
relation_kind: restatement
resolution: verbal_only
basis: "In claim A (324d-325b), Protagoras bundles δικαιοσύνη, σωφροσύνη, and τὸ ὅσιον together under the single heading ἀνδρὸς ἀρετή. In claim B (329c-329d), Socrates refers back to that earlier bundling and asks for clarification: is virtue one thing with these as parts or are these all names for the same single thing. The content of claim B is not a new thesis but Socrates' restatement of how Protagoras originally presented the virtue collection, now framed as a question. Both claims record the same conceptual grouping of justice, temperance, and holiness as 'one thing' called virtue."
limits: Both claims have final_status posed_only, not left_standing, so standing is inapplicable. The relation is supported by the explicit verbal link at 329c where Socrates says 'you said that Zeus sent justice and shame... and again in many places in your speeches justice and temperance and holiness and all these things were spoken of by you as being collectively one thing, virtue.' The restatement is verbal and explicit in the text.
resolution_ref:
  stephanus_span: 329c-329d
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 329c-329d
    start_marker: 329c
    end_marker: 329d
    start_char: 40852
    end_char: 41706
    text_sha256: b5ae1cdc3738494437adf547cbfbc39d6c1be39771e060f065ad0cabdb211d2a
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0003
pair_id: pair_protagoras_00003
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0021
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 324d-325b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 324d-325b
    start_marker: 324d
    end_marker: 325b
    start_char: 31368
    end_char: 32862
    text_sha256: 664f98b2c4b11afce4b1aade56fa7e461a0217986159d58253c88c76bda8290f
basis: Both claims address the relationship among virtue parts involving justice (δικαιοσύνη) and holiness (ὅσιον/ὁσιότης). Claim A asserts that justice, moderation, and piety are collectively a single thing ('a man's virtue') necessary for political life (324d-325b). Claim B asserts that justice is such as to be just and holiness is such as to be holy, each having the character corresponding to its name (330c-330e). The claims pull against each other — claim A folds justice and piety into a unity, while claim B treats them as distinct parts with distinct self-predicative characters — but the passages occur at different argumentative moments and do not state incompatible propositions on the same terms.
limits: Claim A is Protagoras's thesis posed for examination; claim B is Socrates' thesis that Protagoras agrees to. The relation is limited to textual tension between unity-of-virtue and distinct-parts characterizations of justice and holiness. The verbal distinction is that claim A speaks in political-pedagogical terms (what every citizen must share), while claim B speaks in logical-definitional terms (each virtue part's self-predicative character). Neither claim has been refuted; claim A has final_status posed_only and claim B has final_status left_standing.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0004
pair_id: pair_protagoras_00004
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0022
relation_kind: restatement
resolution: superseded
basis: Both claims assert that justice and holiness/piety are closely linked or identical. In claim_protagoras_0011 (324d-325b, posed_only), Protagoras groups δικαιοσύνη, σωφροσύνη, and ὅσιον together as a single thing (ἀνδρὸς ἀρετή). In claim_protagoras_0022 (331a-331b, left_standing), Socrates asserts that justice is holy and holiness is just, and that they are either the same or most similar. Claim_protagoras_0022 restates the justice-holiness unity in narrower terms (without σωφροσύνη), and its different final_status (left_standing vs posed_only) means it supersedes the earlier posed-only formulation.
limits: Does not establish that Socrates and Protagoras are using the same criteria for sameness. Protagoras's thesis includes σωφροσύνη as a third term while Socrates's thesis omits it. The superseded resolution reflects that claim_protagoras_0022 is a narrower restatement with a more definitive status, but does not imply Socrates is directly revising Protagoras's thesis.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0005
pair_id: pair_protagoras_00005
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0026
relation_kind: tension
resolution: verbal_only
basis: Both claims involve σωφροσύνη as a component of the broader aretē debate. Claim 0011 has Protagoras bundling σωφροσύνη, δικαιοσύνη, and τὸ ὅσιον into a single thing (ἀνδρὸς ἀρετή) that every citizen must share for the city to exist. Claim 0026 has Socrates isolating σωφροσύνη in a dialectical move about contraries, where ἀφροσύνη is opposite both σοφία and σωφροσύνη, and each contrary has only one contrary — a structural premise that may later trouble the unity claim in 0011 but does not yet contradict it. The two claims stand at different argumentative moments (Protagoras's great speech vs. Socrates's cross-examination) and are not stated as mutually exclusive propositions.
limits: "No formal contradiction is established at 332a-332c itself. The tension lies in the structural implication of the one-contrary premise: if σωφροσύνη and σοφία share the same contrary (ἀφροσύνη), they may collapse into one, which would support rather than undermine the unity thesis of claim 0011. The record does not adjudicate whether the later argument succeeds."
review_status: accepted
resolution_ref:
  stephanus_span: 332a-332c
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332a-332c
    start_marker: 332a
    end_marker: 332c
    start_char: 46405
    end_char: 47785
    text_sha256: 32a7915a502eaa038adb2a8387c014e746b51c876fbce7eb0ddd5be145b7a273
```

```yaml
relation_id: rel_protagoras_0006
pair_id: pair_protagoras_00006
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0027
relation_kind: tension
resolution: verbal_only
basis: Both claims use σωφροσύνη as a term and both are posed-only theses accepted by Protagoras at their respective moments, but they pull in different directions. Claim A (324d-325b) treats σωφροσύνη as part of a single unified 'man's virtue' alongside δικαιοσύνη and τὸ ὅσιον, a package every citizen must share. Claim B (332c-332e) treats σωφροσύνη as one distinct virtue with its own single contrary (ἀφροσύνη), in a context where Socrates is pressing Protagoras on whether virtue's parts (σοφία, σωφροσύνη, ἀνδρεία, δικαιοσύνη, ὁσιότης) are distinct and each with its own δύναμις.
limits: Both claims are posed-only and not refuted or withdrawn. The claims operate at different argumentative levels — claim A is about the necessary civic minimum for political existence, claim B is about the logical structure of contrary relations — and a verbal distinction in scope may dissolve the apparent tension. Checked scope is the claim texts as recorded; full resolution would require a reading of Protagoras's virtue-part thesis at 329d-330b and the unity arguments that follow.
resolution_ref:
  stephanus_span: 324d-325b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 324d-325b
    start_marker: 324d
    end_marker: 325b
    start_char: 31368
    end_char: 32862
    text_sha256: 664f98b2c4b11afce4b1aade56fa7e461a0217986159d58253c88c76bda8290f
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0007
pair_id: pair_protagoras_00007
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0028
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 333a-333b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 333a-333b
    start_marker: 333a
    end_marker: 333b
    start_char: 48519
    end_char: 49380
    text_sha256: 0052599126360a70228b55290ca414937cb128c8533a9e22cf62dfa795c41c0d
basis: "Claim A treats σωφροσύνη (moderation/temperance) as one of the virtue-components that together constitute a single thing called 'a man's virtue,' which every citizen must share. Claim B presents Socrates' dilemma that either each thing has exactly one contrary or σωφροσύνη and σοφία are not distinct parts of virtue with unlike powers — a dilemma that calls the distinctness of the parts into question. These are not formally contradictory as stated, because claim A is Protagoras's positive thesis about civic virtue and claim B is a later dialectical challenge, but they pull against each other: if the parts-of-virtue thesis collapses under the one-contrary principle, then treating σωφροσύνη as a distinct shareable component (as in claim A) is threatened."
limits: Both claims have final_status posed_only. The tension is identified within the scope of the two claims as stated. The cited resolution span (333a-333b) records Socrates pressing the dilemma on Protagoras, who concedes reluctantly, and Socrates drawing the consequence that σωφροσύνη and σοφία would be one thing. This verbal resolution dissolves the tension in favor of claim B's trajectory, but the relation record notes that the tension between the two claims as stated is resolved by this explicit dialectical move.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0008
pair_id: pair_protagoras_00008
claim_a: claim_protagoras_0011
claim_b: claim_protagoras_0044
relation_kind: tension
resolution: verbal_only
basis: "Both claims address whether justice, moderation, piety, and associated virtue-names name one thing or several. Claim A (324d-325b) has Protagoras assert that δικαιοσύνη, σωφροσύνη, and τὸ ὅσιον are συλλήβδην ἓν — collectively one thing called ἀνδρὸς ἀρετή — as a necessary political condition. Claim B (349b) has Socrates restate the original question as a live disjunction: the five virtue-names (now expanded to include σοφία and ἀνδρεία) either name one single thing or each has its own distinct οὐσία and δύναμις. The claims pull against one another because Protagoras already gave a one-thing answer for three of the five terms, yet at 349b Socrates presents the unity-versus-distinctness of all five as still undecided. The apparent conflict dissolves through an explicit verbal distinction: Protagoras bundles only three terms (δικαιοσύνη, σωφροσύνη, τὸ ὅσιον) under the single heading ἀνδρὸς ἀρετή at 324e-325a, whereas Socrates's disjunction at 349b names five terms and adds σοφία and ἀνδρεία, which Protagoras had not yet treated. The expansion of the set from three to five virtue-names means Protagoras's earlier one-thing thesis does not directly answer the broader five-term question."
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
limits: This record identifies the verbal shift from a three-term bundle (ἀνδρὸς ἀρετή) to a five-term disjunction as dissolving the apparent conflict. It does not establish that Protagoras explicitly retracts his earlier thesis or that the dialogue treats the tension as settled. Both claims have final_status posed_only.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0009
pair_id: pair_protagoras_00009
claim_a: claim_protagoras_0012
claim_b: claim_protagoras_0013
relation_kind: restatement
resolution: standing
basis: Both claims are part of Protagoras's extended speech and serve the same thesis that virtue is teachable. Claim 0012 describes the universal system of upbringing as evidence for teachability. Claim 0013 uses the flute-playing analogy to explain why universal teachability does not produce uniform results — sons of virtuous fathers may still fall short. The second claim extends and reinforces the first rather than contradicting, tensing with, or revising it.
limits: The relation is assessed within Protagoras's single continuous speech (325c-327c). Claim 0013 is an analogical elaboration of a residual objection to the claim in 0012, not a separate thesis. Both claims have final_status left_standing and the checked scope is confined to the argumentative structure of Protagoras's Great Speech.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0010
pair_id: pair_protagoras_00010
claim_a: claim_protagoras_0012
claim_b: claim_protagoras_0016
relation_kind: tension
resolution: verbal_only
basis: "Claim 0012 asserts that virtue (ἀρετή) is universally and systematically taught in Athenian upbringing, implying it is a teachable unified practice. Claim 0016 records Socrates asking Protagoras whether virtue is one single thing under many names or a whole with distinct parts (μόρια). The apparent tension — between a broad pedagogical claim about the teachability of virtue and a question that problematizes its unity — is dissolved by the explicit distinction in kind between the two speech events: claim 0012 is a thesis asserted by Protagoras as evidence for virtue's teachability (span 325c-326e), while claim 0016 is a clarifying question posed by Socrates for examination (span 329c-329d) that has not yet been resolved into any thesis. The question in 0016 does not contradict the descriptive account in 0012; it operates at a different level of analysis."
limits: This is a tension only in apparent subject-matter overlap (both involve ἀρετή). The two claims are different speech-act types (asserted thesis vs. posed question) and address different dimensions of virtue (pedagogical practice vs. conceptual structure). The relation does not imply that Protagoras's account of upbringing is undermined by Socrates' later question.
resolution_ref:
  stephanus_span: 329c-329d
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 329c-329d
    start_marker: 329c
    end_marker: 329d
    start_char: 40852
    end_char: 41706
    text_sha256: b5ae1cdc3738494437adf547cbfbc39d6c1be39771e060f065ad0cabdb211d2a
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0011
pair_id: pair_protagoras_00011
claim_a: claim_protagoras_0012
claim_b: claim_protagoras_0073
relation_kind: tension
resolution: standing
basis: Claim A (325c-326e) presents a sustained argument that Athenian upbringing practices demonstrate that virtue (ἀρετή) is universally treated as teachable. Claim B (360e-361b) notes that Socrates's own argument that virtue is knowledge would imply it is most teachable, contradicting an earlier position that virtue is not teachable. The two claims pull in opposite directions on the teachability of virtue — claim A marshals empirical evidence for teachability, while claim B flags the paradox that the dialogue's reasoning both supports and undermines teachability — but they are not formally contradictory as stated because claim A is Protagoras's positive case and claim B is Socrates's meta-commentary on the argument's self-subverting outcome.
limits: Both claims have final_status left_standing. This relation captures only the directional tension on the διδακτόν question; it does not claim that Protagoras's speech (claim A) is directly addressed or refuted by Socrates's closing remarks (claim B). The dialogue ends in aporia and does not adjudicate between the two positions.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0012
pair_id: pair_protagoras_00012
claim_a: claim_protagoras_0013
claim_b: claim_protagoras_0016
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 329c-329d
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 329c-329d
    start_marker: 329c
    end_marker: 329d
    start_char: 40852
    end_char: 41706
    text_sha256: b5ae1cdc3738494437adf547cbfbc39d6c1be39771e060f065ad0cabdb211d2a
basis: Claim A (327a-327c) uses the flute-playing analogy to explain why good fathers can have bad sons and vice versa, treating virtue (ἀρετή) and justice (δικαιοσύνη) as distributable among people. Claim B (329c-329d) poses the question of whether virtue is one thing with justice, temperance, and holiness as parts or whether these are all names for the same single thing. The apparent pull is dissolved by recognizing that A is a myth-based analogical argument concluding Protagoras's Great Speech, while B opens a new dialectical inquiry with a framing question. The shift in genre and context — from rhetorical display to elenctic examination — constitutes an explicit distinction that accounts for the differing treatments of virtue and justice across the two spans.
limits: Claim A has final_status left_standing; Claim B has final_status posed_only. This record identifies the genre and dialogic-context shift as the verbal distinction dissolving apparent tension. It does not assess whether Protagoras's eventual answer to the question in B would conflict with or support the claims in A.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0013
pair_id: pair_protagoras_00013
claim_a: claim_protagoras_0013
claim_b: claim_protagoras_0021
relation_kind: restatement
resolution: standing
basis: Both claims use δικαιοσύνη in independent argumentative contexts that do not intersect. Claim 0013 employs justice as part of a thought experiment about universal participation and intergenerational transmission of virtue (327a-327c). Claim 0021 asserts the self-predicative character of justice and holiness as distinct virtue parts (330c-330e). The shared term does not indicate textual dependence, conflict, or restatement.
limits: Does not assess whether the self-predication claim in 0021 is compatible with the universal-participation claim in 0013 across the whole dialogue; limits the finding to the cited spans.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0014
pair_id: pair_protagoras_00014
claim_a: claim_protagoras_0013
claim_b: claim_protagoras_0044
relation_kind: tension
resolution: verbal_only
basis: "Both claims share the term δικαιοσύνη. Claim A (327a-327c) argues via the flute-playing analogy that universal participation in teaching justice explains why good fathers can have bad sons — justice is treated as something everyone shares and teaches. Claim B (349b) poses the unity/disunity question about five virtue-names including justice, asking whether they are one thing or distinct beings. Neither claim asserts or denies what the other asserts, and the difference in final_status (left_standing vs. posed_only) does not arise from one refuting the other. Instead, the claims address different questions: claim A concerns teachability and intergenerational transmission of virtue, while claim B concerns the metaphysical relationship among virtue-names. The explicit distinction in discursive context dissolves any apparent conflict."
limits: This records a thematic adjacency around δικαιοσύνη, not a formal contradiction. Claim A does not address the unity question, and claim B does not address the teachability-of-justice argument. The verbal_only resolution reflects that the two claims operate at different levels of the discussion and do not directly bear on each other.
review_status: rejected
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
```

```yaml
relation_id: rel_protagoras_0015
pair_id: pair_protagoras_00015
claim_a: claim_protagoras_0013
claim_b: claim_protagoras_0073
relation_kind: tension
resolution: standing
basis: Claim A (327a-327c) asserts via analogy that universal teaching does not guarantee uniform success in virtue, and so good fathers may have bad sons — which explains why virtue appears both universally shared and unequally distributed. Claim B (360e-361b) observes that if virtue is knowledge, then it would be most teachable, and that this contradicts Socrates' earlier position that virtue is not teachable. The two claims pull in different directions — A explains uneven transmission of virtue under universal teaching, while B frames the teachability of virtue as conditional on its being knowledge — but they are not formally contradictory. A does not deny that virtue is teachable; it only explains variance in outcomes. B does not deny that variance exists; it notes the paradox of teachability given the knowledge-identification.
limits: This relation is checked as a standing tension between two claims both left standing in the Protagoras. It does not assess whether the two claims could be reconciled under a unified theory of virtue, nor does it evaluate whether Socrates' framing in B is sincere or ironic. Both claims are asserted by Socrates at different moments in the dialogue.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0016
pair_id: pair_protagoras_00016
claim_a: claim_protagoras_0014
claim_b: claim_protagoras_0015
relation_kind: restatement
resolution: standing
basis: "Both claims advance the same core thesis within Protagoras's speech (327c-328c): that participation in any civilized society with laws and education imparts a baseline of virtue to everyone, making it difficult to distinguish a specialist teacher. Claim 0014 uses the flute-player and Pherecrates analogies to argue that even the most unjust person in a lawful society is a practitioner (δημιουργόν) of justice compared with those raised without laws. Claim 0015 generalizes this by asserting that everyone is a teacher of virtue to the extent of their ability (καθ' ὅσον δύνανται ἕκαστος), just as everyone is a teacher of Greek, which explains why specialist teachers are hard to identify. The second claim explicitly draws the conclusion toward which the first claim's analogies were building: the difficulty of finding a virtue-teacher follows from universal baseline participation. Both claims belong to the same continuous argumentative arc at 327c-328c and assert the same thesis at different levels of explicitness."
limits: This relation captures the textual continuity of Protagoras's argument from comparative analogy (0014) to explicit generalization and application to the teacher problem (0015). It does not assess whether the argument is valid, whether Protagoras's self-endorsement is warranted, or whether the claim that everyone teaches virtue contradicts other positions in the dialogue.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0017
pair_id: pair_protagoras_00017
claim_a: claim_protagoras_0014
claim_b: claim_protagoras_0021
relation_kind: tension
resolution: standing
basis: Both claims address justice (δίκαιον) but in different argumentative contexts. Claim 0014 asserts that even the most unjust person raised in a law-governed society has a baseline competence in justice compared with those entirely without civic formation — a comparative, counterfactual claim about socialization's minimal product. Claim 0021 asserts that justice has the character of being just (self-predication), a claim about the nature of the virtue itself agreed to by Protagoras in the elenctic examination of virtue-parts. The claims pull in different directions — one treats justice as a matter of degree acquired through habituation, the other as a formal property — but they do not contradict each other as stated, because they operate at different levels of analysis (sociological baseline versus definitional essence).
limits: Both claims have final_status left_standing in their respective records. This tension is noted as standing because neither claim has been refuted, withdrawn, or revised, and no explicit verbal distinction in the text reconciles them. The tension is between a socialization-based comparative claim (327c-327e) and a formal/definitional claim (330c-330e); whether these are ultimately compatible in Plato's view is not adjudicated here.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0018
pair_id: pair_protagoras_00018
claim_a: claim_protagoras_0014
claim_b: claim_protagoras_0022
relation_kind: tension
resolution: standing
basis: Both claims involve δικαιον / δικαιοσύνην but address different questions. Claim A (327c-327e) makes a comparative claim about the baseline of justice produced by socialization in any law-governed society — even an unjust person raised amid laws is a craftsman of justice relative to those with no education or compulsion. Claim B (331a-331b) asserts an identity or near-identity between justice and holiness. Claim A concerns what level of justice arises from social compulsion; claim B concerns what justice is in relation to another virtue. The claims pull in different directions — A frames justice as a minimal civic byproduct, B frames it as coextensive with holiness — but neither claim formally negates the other, because A speaks comparatively and B speaks definitionally.
limits: Checked spans 327c-327e and 331a-331b do not provide an explicit resolution. Both claims have final_status left_standing. The tension is between a comparative claim about the social baseline of justice and a definitional claim about justice's relation to holiness; neither passage addresses the other's framing. This does not decide whether the claims are reconcilable at a deeper level.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0019
pair_id: pair_protagoras_00019
claim_a: claim_protagoras_0014
claim_b: claim_protagoras_0028
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 332e-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332e-333a
    start_marker: 332e
    end_marker: 333a
    start_char: 48147
    end_char: 48965
    text_sha256: b053ec3dea4da6986c16fb962fe0428a6e2529c8b984b3e5c6a8f3f5835a2247
basis: "Both claims share the term ἀρετῆς but operate in different argumentative registers. Claim A (327c-327e) is a comparative claim about the baseline of justice produced by socialization into any νόμοις-governed community, using δημιουργὸν δίκαιον as a relative standard. Claim B (332e-333a) poses a formal dilemma about whether σωφροσύνη and σοφία are distinct μόρια ἀρετῆς, given the principle that each thing has exactly one contrary. The shared term ἀρετῆς functions differently: in claim A as a general societal capacity, in claim B as a whole whose parts are under examination. The claims are not formally contradictory because they address different questions (baseline socialization versus internal part-structure of virtue). The verbal distinction between ἀρετή as a cultivated societal disposition versus ἀρετή as a whole composed of parts dissolves the apparent conflict."
limits: The two claims are separated by several Stephanus pages and belong to different phases of the dialogue (the Great Speech versus the subsequent elenctic examination). The tension does not entail that Protagoras or Socrates holds inconsistent views; it reflects the dialogue's movement between different modes of argument about ἀρετή. Claim B has final_status posed_only, so the dilemma is presented without resolution at this stage.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0020
pair_id: pair_protagoras_00020
claim_a: claim_protagoras_0015
claim_b: claim_protagoras_0028
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 332e-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332e-333a
    start_marker: 332e
    end_marker: 333a
    start_char: 48147
    end_char: 48965
    text_sha256: b053ec3dea4da6986c16fb962fe0428a6e2529c8b984b3e5c6a8f3f5835a2247
basis: Both claims involve ἀρετῆς, but they address different questions. Claim A (327e-328c) concerns the pedagogy of virtue — everyone teaches it, so a specialist is hard to distinguish. Claim B (332e-333a) concerns the mereology of virtue — whether σωφροσύνη and σοφία can be distinct parts with unlike powers given the one-contrary principle. The apparent pull between them dissolves when one notes that claim A is about the universal accessibility of virtue-teaching (a practical, pedagogical claim), while claim B is about the formal structure of virtue's parts (a logical, definitional dilemma posed by Socrates). They operate in different domains and do not directly engage each other. Moreover, claim B is posed_only as a dilemma for Protagoras to resolve; it is not asserted as a settled thesis.
limits: The verbal distinction is between pedagogical universality (claim A) and mereological distinctness (claim B). This does not mean the dialogue resolves the underlying tension between these domains — only that the two claims, as stated in their respective passages, are not in formal contradiction.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0021
pair_id: pair_protagoras_00021
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0021
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 330c-330e
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 330c-330e
    start_marker: 330c
    end_marker: 330e
    start_char: 42885
    end_char: 44248
    text_sha256: de9f017bac2ee907798c1d06c0dda0331bcb9ce4cbb90b6f83e16ddf59e62f3f
basis: "Claim A (329c-329d) frames the virtue-unity question — whether δικαιοσύνη, σωφροσύνη, and ὁσιότης are parts of a single ἀρετή or names for the same thing — with Protagoras answering they are parts. Claim B (330c-330e) draws out the self-predicative character of δικαιοσύνη and ὁσιότης (justice is just, holiness is holy). At 330e the embedded questioner highlights a tension: if each virtue part is wholly what it is, how can they be distinct parts rather than one? The apparent conflict between parts-thesis and self-predication is explicitly voiced at claim B's span, but no verbal distinction dissolves it — the text leaves the problem open as a dialectical question."
limits: Claim A has final_status posed_only (a question posed, not a standing claim) and claim B has final_status left_standing. The relation is tension, not contradiction, because the two claims are not formally contradictory — Protagoras assents to both, and the apparent strain is raised as an unanswered question. The resolution ref points to claim B's span where the tension is most explicitly surfaced.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0022
pair_id: pair_protagoras_00022
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0026
relation_kind: tension
resolution: verbal_only
basis: "Both claims share σωφροσύνη and are posed by Socrates: claim_a frames the part-vs-name question about virtue including σωφροσύνη as a candidate μόριον (329c-329d), while claim_b secures Protagoras' agreement that ἀφροσύνη is the contrary of both σοφία and σωφροσύνη and that each contrary has exactly one contrary (332a-332c). The structural tension is that if each contrary has only one contrary, then σωφροσύνη and σοφία sharing the same contrary ἀφροσύνη pushes toward their identity, which would undercut the parts model Protagoras favored in claim_a. Socrates makes this tension explicit at 332e-333a by asking whether to abandon the 'one contrary per thing' principle or the earlier claim that σοφία and σωφροσύνη are distinct parts of virtue. The tension is verbal because it arises from a dialectical examination of what was previously agreed, and Socrates frames it as a choice among prior statements rather than a settled contradiction."
limits: Both claims are posed_only; neither has been refuted or withdrawn. The resolution is verbal_only because Socrates explicitly identifies the tension between prior agreements at 332e-333a and poses it as a dialectical problem to be resolved, without asserting a final contradiction.
resolution_ref:
  stephanus_span: 332e-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332e-333a
    start_marker: 332e
    end_marker: 333a
    start_char: 48147
    end_char: 48965
    text_sha256: b053ec3dea4da6986c16fb962fe0428a6e2529c8b984b3e5c6a8f3f5835a2247
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0023
pair_id: pair_protagoras_00023
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0027
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 329c-332e
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 329c-329d
    start_marker: 329c
    end_marker: 329d
    start_char: 40852
    end_char: 41706
    text_sha256: b5ae1cdc3738494437adf547cbfbc39d6c1be39771e060f065ad0cabdb211d2a
basis: "Claim 0016 frames σωφροσύνη as one candidate part (μόριον) of virtue whose relation to the whole is under examination. Claim 0027 treats σωφροσύνη as a term that can enter into a contrary relation with folly (ἀφροσύνη) for dialectical purposes. Neither claim asserts anything about σωφροσύνη that directly contradicts the other; but the framing differs: claim 0016 makes σωφροσύνη's status as a part or name of virtue the open question, while claim 0027 deploys it within a premise about contraries without resolving the parts/whole question. The verbal distinction is that the two claims use σωφροσύνη in different argumentative contexts (taxonomy of virtue parts vs. contrary relations), and no claim at either span asserts that the two uses are incompatible."
limits: This record does not claim that the two claims are contradictory. Both claims are posed_only, and the tension derives from differing argumentative contexts rather than from any logical incompatibility at their respective spans. The relation is confined to the two cited spans and does not adjudicate whether the contrary premise is later deployed to refute the parts thesis.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0024
pair_id: pair_protagoras_00024
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0028
relation_kind: tension
resolution: verbal_only
basis: "Both claims record Socrates posing framing questions about the unity or plurality of virtue and its parts. Claim A (329c-329d) asks whether virtue is one thing with justice, temperance, and holiness as parts or as names for the same single thing. Claim B (332e-333a) presents a dilemma that assumes temperance and wisdom are distinct parts of virtue with unlike powers, then brings the 'one contrary to one thing' principle to bear against that assumption. Together they show a progression: what began as an open question about part-whole relations in Claim A has developed into a dilemma that pressures Protagoras's part-based account in Claim B. They are not contradictory because Claim A merely poses a question without asserting an answer, while Claim B operates within the terms Protagoras accepted after Claim A. They are not a restatement because Claim B introduces the additional 'one contrary' principle and specifically targets the wisdom/temperance pair."
limits: Both claims are 'posed_only' by Socrates; neither is asserted as a conclusion held by any speaker. The apparent tension between the open framing question and the dilemma's assumptions is dissolved by recognizing that Claim A is a request for clarification, not a thesis, while Claim B uses the answer Protagoras gave to that request as the target of the dilemma. The claims occur at different dramatic moments separated by intervening argumentation.
resolution_ref:
  stephanus_span: 329c-329d
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 329c-329d
    start_marker: 329c
    end_marker: 329d
    start_char: 40852
    end_char: 41706
    text_sha256: b5ae1cdc3738494437adf547cbfbc39d6c1be39771e060f065ad0cabdb211d2a
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0025
pair_id: pair_protagoras_00025
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0044
relation_kind: restatement
resolution: verbal_only
basis: "Both claims record Socrates posing the same framing disjunction about the unity of virtue. Claim 0016 at 329c-329d asks whether virtue is one thing with justice, temperance, and holiness as its parts, or whether these are all names for the same single underlying thing. Claim 0044 at 349b restates the same disjunction about five virtue-names (wisdom, temperance, courage, justice, piety), asking whether they name one single underlying thing or each has its own distinct being and power. The vocabulary and structure repeat: the same either/or framing recurs."
limits: The second formulation adds σοφία and ἀνδρεία to the list of named virtues and phrases the options more abstractly (ἴδιος οὐσία, δύναμιν), but the underlying disjunction is unchanged. Claim 0016 frames it as parts-vs.-names, claim 0044 as one-pragma-vs.-distinct-ousia, which are the same alternatives. This record does not address whether an answer to the disjunction has been given in the intervening discussion or whether any implicit narrowing has occurred.
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0026
pair_id: pair_protagoras_00026
claim_a: claim_protagoras_0016
claim_b: claim_protagoras_0073
relation_kind: tension
resolution: verbal_only
basis: "claim_a records Socrates' opening question about whether virtue (ἀρετή) is one thing with justice, temperance, and holiness as its parts or whether these are all names for the same single thing (329c-329d). claim_b records the closing observation (360e-361b) that if virtue as a whole is knowledge (ἐπιστήμη), then it would be teachable — which contradicts Socrates' earlier position that virtue is not teachable. The two claims bookend the dialogue's investigation: the first poses the unity-of-virtue question, the second notes the paradoxical result of the investigation. They are not contradictory as stated, since claim_a merely frames a question (final_status: posed_only) while claim_b records a self-diagnosed tension in the argument's outcome (final_status: left_standing). The apparent conflict between 'virtue is not teachable' (Socrates' earlier position referenced in claim_b) and 'if virtue is knowledge it is teachable' is explicitly noted by Socrates in the closing speech as a paradox requiring further examination, not resolved."
limits: This relation captures only the structural relationship between the dialogue's opening frame question and closing diagnostic remark. It does not adjudicate whether the unity-of-virtue thesis is actually established or whether Protagoras' part-model or identity-model is correct. The verbal distinction is that claim_a is a posed question, not a thesis, while claim_b is a diagnostic observation. The tension between Socrates' earlier and later positions is explicitly flagged but unresolved at this span.
resolution_ref:
  stephanus_span: 360e-361b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 360e-361b
    start_marker: 360e
    end_marker: 361b
    start_char: 106492
    end_char: 107792
    text_sha256: 366641b4d4a97930cbeb70d78aa2307681fc9b85a8b5938a42f085e654e915e9
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0027
pair_id: pair_protagoras_00027
claim_a: claim_protagoras_0021
claim_b: claim_protagoras_0022
relation_kind: tension
resolution: standing
basis: "Claim A (330c-330e) establishes that justice is just and holiness is holy — each virtue part has the character corresponding to its name. Socrates leads Protagoras to agree. Claim B (331a-331b) has Socrates asserting on his own behalf that justice is holy and holiness is just, and that they are either the same or most similar. The two claims pull against each other: Claim A treats justice and holiness as having their own distinct self-predicative characters (justice is just, holiness is holy), while Claim B asserts that each also bears the other's character (justice is holy, holiness is just), moving toward sameness. This is not a formal contradiction — Claim A does not deny that justice could also be holy — but the trajectory from distinct self-predication to cross-predication generates unresolved friction."
limits: Both claims have final_status left_standing. The relation records the tension between the distinct-parts self-predication in 330c-330e and the cross-predication thesis in 331a-331b. Does not assess whether Protagoras' subsequent resistance at 331b-c resolves or deepens the tension.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0028
pair_id: pair_protagoras_00028
claim_a: claim_protagoras_0021
claim_b: claim_protagoras_0044
relation_kind: restatement
resolution: verbal_only
basis: "Both claims frame the same core question: whether virtue-terms (δικαιοσύνη, ὁσιότης among others) name distinct things each with its own being and power or whether they reduce to a single underlying thing. Claim 21 records Socrates eliciting Protagoras' agreement that justice is such as to be just and holiness such as to be holy (i.e., each has a character proper to its name), which is the distinct-parts side of the disjunction. Claim 44 restates the disjunction itself in Socrates' own words at 349b, posing the same question about whether the five virtue-names are names for one thing or each has its own οὐσία and δύναμις."
limits: "Claim 21 has final_status left_standing; claim 44 has final_status posed_only. Because claim 44 is not left_standing, the standing resolution does not apply. The apparent tension is verbal: claim 21 is an intermediate step exploring the distinct-parts answer, while claim 44 explicitly frames the open question."
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0029
pair_id: pair_protagoras_00029
claim_a: claim_protagoras_0026
claim_b: claim_protagoras_0027
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 332a-332c
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332a-332c
    start_marker: 332a
    end_marker: 332c
    start_char: 46405
    end_char: 47785
    text_sha256: 32a7915a502eaa038adb2a8387c014e746b51c876fbce7eb0ddd5be145b7a273
basis: Claim B explicitly recalls the premises of Claim A and recapitulates them without modification. At 332e Socrates says μέμνησαι οὖν ὅτι ἐν τοῖς ἔμπροσθεν ὡμολόγηται ἡμῖν, explicitly flagging that the same agreement is being recalled, not an independent or conflicting claim. No substantive revision or contradiction is present.
limits: Both claims are posed_only in the text; neither is refuted, withdrawn, or left_standing. The relation records a textual restatement, not an adjudication of the premise.
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0030
pair_id: pair_protagoras_00030
claim_a: claim_protagoras_0026
claim_b: claim_protagoras_0028
relation_kind: tension
resolution: verbal_only
basis: "Claim A records that at 332a-332c Socrates, with Protagoras' agreement, establishes the premise that each contrary has exactly one contrary. Claim B records that at 332e-333a Socrates uses that premise to pose a dilemma against the thesis that wisdom and temperance are distinct parts of virtue. The two claims are successive stages of one argument rather than competing statements: A describes the securing of the premise, B describes its dialectical deployment. No conflict exists between claiming that the premise was established and claiming that it was then applied."
limits: Does not assert contradiction or substantive revision. Only records that the two claims describe different moments in a single dialectical sequence.
review_status: accepted
resolution_ref:
  stephanus_span: 332a-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332a-333a
    start_marker: 332a
    end_marker: 333a
    start_char: 46405
    end_char: 48965
    text_sha256: 3ea6ee45b3dad652b8efb22839ade4241e2f3f0f95a0e9d960ef3d1491821515
```

```yaml
relation_id: rel_protagoras_0031
pair_id: pair_protagoras_00031
claim_a: claim_protagoras_0026
claim_b: claim_protagoras_0044
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
basis: Both claims pose the relationship between σοφία and σωφροσύνη as an open question for examination. Claim 0026 records the premise that each contrary has exactly one contrary, which sets up the problem that σοφία and σωφροσύνη share the same contrary (ἀφροσύνη). Claim 0044 restates the broader framing question—whether the five virtue-names name one thing or distinct beings—within which that problem is embedded. Both are posed for examination with final_status posed_only and neither resolves the relationship.
limits: This is a restatement of a shared framing question across different dialogue segments, not a formal contradiction. The relation does not adjudicate whether the virtue-unity question is answered later. Both claims have final_status posed_only, so resolution cannot be standing.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0032
pair_id: pair_protagoras_00032
claim_a: claim_protagoras_0026
claim_b: claim_protagoras_0067
relation_kind: tension
resolution: verbal_only
basis: "Both claims deploy σοφία in arguments that equate a vice with ignorance, but they operate under different argumentative frameworks and premises. Claim 0026 establishes at 332a-332c that each contrary has exactly one contrary, with folly as opposite of σοφία and also opposite of σωφροσύνη, a premise Socrates uses to challenge Protagoras' unity-of-virtues thesis. Claim 0067 asserts at 358a-358c that being stronger than oneself is nothing other than σοφία, within the conditional framework that the pleasant is good. Neither refutes, revises, nor restates the other. The shared term σοφία appears in distinct logical contexts: in 0026 it is a contrary in a structure of opposites, and in 0067 it is identified with self-mastery under a hedonistic premise."
limits: Does not adjudicate whether the earlier contrary-structure argument and the later hedonistic calculus are mutually consistent. The tension is noted solely at the level of σοφία's argumentative role across the dialogue; no claim about Protagoras' or Socrates' intent is made.
resolution_ref:
  stephanus_span: 332a-332c
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332a-332c
    start_marker: 332a
    end_marker: 332c
    start_char: 46405
    end_char: 47785
    text_sha256: 32a7915a502eaa038adb2a8387c014e746b51c876fbce7eb0ddd5be145b7a273
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0033
pair_id: pair_protagoras_00033
claim_a: claim_protagoras_0026
claim_b: claim_protagoras_0072
relation_kind: restatement
resolution: verbal_only
basis: Both claims assert a structure where a virtue is identified with σοφία as the contrary of a form of ignorance or folly. At 332a-332c, σοφία is established as the contrary of ἀφροσύνη and temperance is the contrary of folly, with the premise that each contrary has exactly one contrary. At 359d-360d, courage (ἀνδρεία) is identified as σοφία of what is and is not terrible, and cowardice as ἀμαθία of the same, making courage the contrary of that ignorance. The later passage applies the same σοφία-as-virtue structure to a different virtue without modifying the logical framework. The apparent conflict—that claim_a is posed_only while claim_b is left_standing—is dissolved by the explicit distinction that the earlier passage is a premise-gathering step whose status was never resolved rather than a rejected claim.
limits: The earlier claim (0026) was posed for examination and its final_status is posed_only, meaning it was never accepted as standing or formally rejected. The restatement relation captures the structural recurrence without asserting that the earlier claim was endorsed. The verbal distinction between posed_only and left_standing dissolves any apparent conflict.
review_status: accepted
resolution_ref:
  stephanus_span: 332a-332c
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332a-332c
    start_marker: 332a
    end_marker: 332c
    start_char: 46405
    end_char: 47785
    text_sha256: 32a7915a502eaa038adb2a8387c014e746b51c876fbce7eb0ddd5be145b7a273
```

```yaml
relation_id: rel_protagoras_0034
pair_id: pair_protagoras_00034
claim_a: claim_protagoras_0027
claim_b: claim_protagoras_0028
relation_kind: restatement
resolution: verbal_only
basis: "Both claims record the same dialectical move: claim_protagoras_0027 records Socrates' recapitulation (with Protagoras' agreement) of the premise that each contrary has exactly one contrary and that folly is the contrary of temperance (332c-332e); claim_protagoras_0028 records the immediately subsequent step where Socrates poses the dilemma that applies that same agreed premise against the distinct-parts thesis (332e-333a). The second claim is not a revision of the first but a consecutive application of it. Neither claim has final_status left_standing; both are posed_only, so resolution standing does not apply. There is no tension or contradiction, only a sequential restatement of the same premise being deployed."
limits: The relation covers only the textual compatibility of the two claims as recorded. It does not assess whether Socrates' application of the premise to the dilemma is valid, nor whether Protagoras later undermines the premise. The relation is confined to the spans cited by each claim.
review_status: rejected
resolution_ref:
  stephanus_span: 332c-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332c-333a
    start_marker: 332c
    end_marker: 333a
    start_char: 47298
    end_char: 48965
    text_sha256: 0ec49acdaae12df86f1899b8219ec2226fcd9ec4233d054b77a5827b45292fb1
```

```yaml
relation_id: rel_protagoras_0035
pair_id: pair_protagoras_00035
claim_a: claim_protagoras_0027
claim_b: claim_protagoras_0044
relation_kind: tension
resolution: verbal_only
basis: "Both claims share the term σωφροσύνη but operate at different argumentative levels. Claim A (332c-332e) records the agreed premise that each contrary has exactly one contrary and that folly is the contrary of temperance. Claim B (349b) poses the broader methodological question whether the five virtue-names name one underlying thing or five distinct beings with their own powers. The apparent tension is verbal: the two claims address different dialectical moments (axiom-recital versus framing question) and do not assert incompatible propositions about σωφροσύνη."
limits: The verbal distinction dissolves the appearance of conflict at the propositional level but does not adjudicate whether Socrates' later deployment of the one-contrary principle succeeds against Protagoras' distinct-parts thesis.
resolution_ref:
  stephanus_span: 349b
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 349b
    start_marker: 349b
    end_marker: 349b
    start_char: 82117
    end_char: 82451
    text_sha256: af7d2d475e2114d7f07e9a5ce0e37b194b1b2000adff43160d2821f2eaeb94b8
review_status: rejected
```

```yaml
relation_id: rel_protagoras_0036
pair_id: pair_protagoras_00036
claim_a: claim_protagoras_0028
claim_b: claim_protagoras_0044
relation_kind: restatement
resolution: superseded
basis: Both claims are posed by Socrates as disjunctions about whether virtue-terms name one thing or many distinct things. Claim 0028 narrows the dilemma to sophia and sophrosyne as parts of virtue with the 'one contrary per thing' principle as a constraint; claim 0044 broadens to five virtue-names and the one-thing-versus-distinct-being-and-power framing. The later passage (349b) explicitly restates the earlier examination's core question at greater scope, which Socrates signals by recalling the earlier inquiry.
limits: This does not establish which side of the disjunction Socrates endorses, nor whether the five-term version revises the two-term version substantively. Both remain posed_only in final_status.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0037
pair_id: pair_protagoras_00037
claim_a: claim_protagoras_0028
claim_b: claim_protagoras_0067
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 332e-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332e-333a
    start_marker: 332e
    end_marker: 333a
    start_char: 48147
    end_char: 48965
    text_sha256: b053ec3dea4da6986c16fb962fe0428a6e2529c8b984b3e5c6a8f3f5835a2247
basis: "Both claims deploy σοφία as the positive contrary of folly/ignorance in a structural opposition. In claim_a (332e-333a), the principle ἓν ἑνὶ μόνον ἐναντίον forces σοφία and σωφροσύνη toward identity because each shares ἀφροσύνη as its contrary. In claim_b (358a-358c), σοφία is equated with being κρείττω ἑαυτοῦ and explicitly opposed to ἀμαθία — the same structural role in a contrary pair. The distinction is verbal rather than substantive: claim_a presents the dilemma as posed for examination (posed_only), while claim_b presents the endorsed conclusion (left_standing), so the different final_status values reflect the dramatic arc rather than a genuine conflict."
limits: "Claim_a has final_status posed_only, not left_standing, so resolution cannot be standing. The verbal distinction lies in the dramatic frame: 332e-333a poses the identity of σοφία and σωφροσύνη as a dilemma requiring resolution, while 358a-358c asserts σοφία as the contrary of ἀμαθία as an agreed conclusion. The shared structural role of σοφία as contrary to folly/ignorance is noted, but the earlier passage frames it as problematic and the later as settled."
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0038
pair_id: pair_protagoras_00038
claim_a: claim_protagoras_0028
claim_b: claim_protagoras_0072
relation_kind: tension
resolution: verbal_only
basis: "Both claims concern wisdom (σοφία) as part of virtue, but they operate on different definitional fronts. Claim A (332e-333a) treats the formal principle that each thing has exactly one contrary, applied to σοφία and σωφροσύνη as possibly distinct parts of virtue. Claim B (359d-360d) identifies courage (ἀνδρεία) as wisdom of what is terrible, making σοφία equivalent to a different virtue entirely. The two theses do not directly contradict because they address different virtue-parts (temperance vs. courage) and different argumentative contexts, but they pull against each other: if σοφία is identified with both σωφροσύνη (via the one-contrary principle) and ἀνδρεία, then σωφροσύνη and ἀνδρεία would collapse into the same thing, which the text has not yet established."
limits: The tension is verbal_only because the two claims apply the same term σοφία to different virtue-parts (σωφροσύνη vs. ἀνδρεία) in different argumentative contexts. The distinct targets dissolve any formal contradiction. Claim A is posed_only; Claim B is left_standing.
resolution_ref:
  stephanus_span: 332e-333a
  source_ref:
    source_path: raw/plato/greek/protagoras.txt
    stephanus_span: 332e-333a
    start_marker: 332e
    end_marker: 333a
    start_char: 48147
    end_char: 48965
    text_sha256: b053ec3dea4da6986c16fb962fe0428a6e2529c8b984b3e5c6a8f3f5835a2247
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0039
pair_id: pair_protagoras_00039
claim_a: claim_protagoras_0032
claim_b: claim_protagoras_0034
relation_kind: revision
resolution: standing
basis: "Claim A records the mere circulation of Pittacus' saying 'it is hard to be good' as a premise. Claim B articulates Socrates' exegetical claim that Simonides disagreed with that saying and substituted the becoming-formula. The two claims are not contradictory: claim A is a factual premise, claim B is the interpretive consequence drawn from it within Socrates' reconstruction of the poem. They form an argumentative sequence, not a rivalry."
limits: This relation covers only the text as Socrates presents it. It does not assess whether Simonides actually responded to Pittacus or whether Socrates' reading is correct.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0040
pair_id: pair_protagoras_00040
claim_a: claim_protagoras_0032
claim_b: claim_protagoras_0039
relation_kind: revision
resolution: standing
basis: "Claim 0032 records Socrates' report that Pittacus' saying 'it is hard to be good' circulated and was praised by the wise. Claim 0039 reports Socrates' interpretive conclusion that Simonides held Pittacus' saying to be mistaken because it conflates becoming good (possible) with being good (impossible). The two claims are not contradictory: 0032 establishes the saying as a premise, and 0039 presents the revisionary reanalysis that Simonides allegedly applied to it. The relation is revision because claim 0039 restates the content of Pittacus' claim through a distinction (γενέσθαι vs. ἔμμεναι) that substantively modifies its meaning."
limits: Both claims have final_status left_standing. The revision is Socrates' account of Simonides' position, not an independently verified doctrinal change. The checked scope is confined to the Protagoras text; no external evidence about Pittacus or Simonides is invoked.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0041
pair_id: pair_protagoras_00041
claim_a: claim_protagoras_0034
claim_b: claim_protagoras_0039
relation_kind: restatement
resolution: standing
basis: "Both claims articulate the same core thesis from Socrates' interpretation of Simonides: becoming good (γενέσθαι) is hard but possible, while being good (ἔμμεναι) is not what Pittacus' saying properly identifies. Claim 0034 introduces the exegetical mechanism (the μὲν in the poem signals contest with Pittacus), and claim 0039 restates the resulting distinction as Simonides' position in fuller form."
limits: Both claims are Socrates' interpretive reconstruction of Simonides' poem, offered at different moments in the same speech (343c-d vs. 344e). This records a textual recurrence of the same interpretive thesis, not an endorsement by either Socrates or Plato of the becoming/being distinction.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0042
pair_id: pair_protagoras_00042
claim_a: claim_protagoras_0044
claim_b: claim_protagoras_0067
relation_kind: revision
resolution: superseded
basis: Both claims belong to the same virtue-inquiry arc. Claim 44 poses the disjunctive question — whether the five virtue-names name one thing or distinct beings with their own powers — using σοφία as one term in the list. Claim 67 offers a later answer-style thesis that reduces being-stronger-than-oneself to σοφία (and being-weaker-than-oneself to ἀμαθία). Claim 67 does not merely restate the disjunction but supplies a substantive doctrine of σοφία-as-knowledge governing action, which revises the open question posed in claim 44.
limits: Claim 67 applies σοφία within the hedonistic-conditional argument and does not address the other four virtue-names (σωφροσύνη, ἀνδρεία, δικαιοσύνη, ὁσιότης) individually; the revision is therefore partial and does not close the full disjunction of claim 44.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0043
pair_id: pair_protagoras_00043
claim_a: claim_protagoras_0044
claim_b: claim_protagoras_0072
relation_kind: revision
resolution: superseded
basis: "Claim A at 349b poses a disjunction whether the five virtue-names — including σοφία and ἀνδρεία — name one thing or each has its own distinct being and power. Claim B at 359d-360d asserts a specific identity-relation between courage (ἀνδρεία) and wisdom (σοφία): cowardice is ignorance of what is terrible, and courage is wisdom of what is terrible, as its contrary. Claim B resolves part of the open disjunction in Claim A by advancing a substantive thesis that courage is a form of wisdom, thereby moving from a posed question to a definite identifying claim. The relation is a revision because Claim B supplies a determinate answer to a question left open in Claim A rather than merely restating it."
limits: "Claim A is posed as a question for examination (final_status: posed_only) rather than asserted, so Claim B does not contradict Claim A but supersedes its open state. Claim B identifies courage with wisdom specifically; it does not decide the full five-term disjunction. Protagoras falls silent at the final step (360d), so his acceptance is ambiguous even though Socrates treats it as demonstrated."
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0044
pair_id: pair_protagoras_00044
claim_a: claim_protagoras_0053
claim_b: claim_protagoras_0065
relation_kind: restatement
resolution: standing
basis: Both claims assert that episteme is a ruling, sufficient power. Claim A (352b-352d) states that episteme is a noble thing able to rule the human being and that phronesis suffices to aid the human being. Claim B (357a-357b) argues that the measuring art, which examines excess, deficiency, and equality relative to one another, must necessarily be techne kai episteme — craft and knowledge. The second claim applies the same epistemic sufficiency thesis to a specific art (the measuring art), grounding it in the structural necessity that measurement is knowledge. There is no contradiction; claim B instantiates rather than revises claim A.
limits: Both claims have final_status left_standing. This relation is checked only within the Protagoras dialogue spans 352b-352d and 357a-357b. Does not address whether the measuring-art identification is consistent with all uses of episteme elsewhere in the corpus.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0045
pair_id: pair_protagoras_00045
claim_a: claim_protagoras_0053
claim_b: claim_protagoras_0073
relation_kind: tension
resolution: standing
basis: "Claim A (352b-352d) presents the thesis that epistēmē is powerful, ruling, and sufficient to aid the human being such that one who knows good and bad cannot be mastered; Socrates elicits Protagoras's assent to this thesis. Claim B (360e-361b) presents the argumentative outcome that if virtue is wholly epistēmē, it would be most teachable, which Socrates notes contradicts his own earlier position that virtue is not teachable. Both claims turn on epistēmē as a ruling or defining element, but they address different entailments: A concerns the internal sovereignty of knowledge over action (akrasia question), while B concerns the teachability of virtue once it is identified with knowledge. Both claims are attributed to Socrates and both have final_status left_standing within their respective contexts."
limits: This relation is checked only within the two cited spans. It does not assess whether Socrates personally endorses either thesis, nor does it resolve the larger paradox that 361a-b personifies as the argument's own self-accusation. The tension is structural — the same term (epistēmē) is deployed for different argumentative purposes — rather than a formal logical contradiction.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0046
pair_id: pair_protagoras_00046
claim_a: claim_protagoras_0065
claim_b: claim_protagoras_0073
relation_kind: tension
resolution: standing
basis: "Both claims share the premise that ἐπιστήμη is a determinant of teachability, but they operate at different levels: claim_a asserts locally that the measuring art (μετρητική) is a τέχνη and ἐπιστήμη because it examines excess and deficiency, while claim_b steps back to note that if virtue as a whole (including justice, temperance, courage) is ἐπιστήμη, then virtue would be most teachable, contradicting Socrates' earlier position. The two claims are not directly contradictory as stated since claim_a does not itself assert that virtue is knowledge, and claim_b does not deny that a particular art is knowledge; rather, claim_b frames the consequence of the broader thesis that everything (πάντα χρήματα) is knowledge. The term ἐπιστήμη functions in both but at different scopes: a specific art's epistemic status versus virtue's global identification with knowledge. The tension is that claim_a contributes to the chain of reasoning that claim_b later personifies as producing a paradox."
limits: This relation does not resolve the broader paradox that Socrates personifies at 361a-b; it only marks the textual tension between the local identification of the measuring art as knowledge and the retrospective framing of that entire chain as generating a self-contradiction with Socrates' earlier anti-teachability stance. Both claims remain left_standing in the text.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0047
pair_id: pair_protagoras_00047
claim_a: claim_protagoras_0066
claim_b: claim_protagoras_0067
relation_kind: restatement
resolution: standing
basis: Both claims identify being overcome by pleasure (ἡδονῆς ἥττω) as ignorance (ἀμαθία). Claim 0066 asserts that errors in pleasure-pain choice come from lack of knowledge and the measuring art, making being overcome by pleasure the greatest ignorance. Claim 0067 restates this with the conditional premise (if the pleasant is good) and adds the positive corollary that being stronger than oneself is wisdom (σοφία). Claim 0067 does not modify the core identification; it elaborates on the same thesis in a dialectically framed conditional.
limits: The two claims are adjacent in the same argument (357c–358c). Claim 0067 adds a conditional premise and a positive corollary, but the core thesis that ἡδονῆς ἥττω is ἀμαθία is identical. Does not assess whether the conditional framing in 0067 constitutes a rhetorical or dialectical modification; treats the identification as stable across both spans.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0048
pair_id: pair_protagoras_00048
claim_a: claim_protagoras_0066
claim_b: claim_protagoras_0072
relation_kind: restatement
resolution: standing
basis: Both claims identify a specific vice as ignorance (ἀμαθία). Claim 0066 identifies being overcome by pleasure as the greatest ignorance; claim 0072 identifies cowardice as ignorance of what is and is not terrible. Both share the structural thesis that a particular moral failing reduces to a cognitive deficiency, and both use ἀμαθία as the explanatory term. The claims are instances of the same thesis pattern applied to different domains (pleasure-pain choice vs. fear of terrible things) rather than one revising the other.
limits: Does not assert that the two claims are identical in scope or that the argument in 359d-360d formally cites 357c-357e. Both claims are left standing and are compatible as coordinated instances of the ignorance thesis, not as logical entailments of each other.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0049
pair_id: pair_protagoras_00049
claim_a: claim_protagoras_0067
claim_b: claim_protagoras_0072
relation_kind: restatement
resolution: standing
basis: "Both claims identify ignorance (ἀμαθία) as the cause of a specific moral failing and wisdom (σοφία) as the corresponding virtue. Claim 0067: being weaker than oneself is ἀμαθία, being stronger than oneself is σοφία (358a-358c). Claim 0072: cowardice is ἀμαθία of what is and is not terrible, courage is σοφία of what is and is not terrible (359d-360d). The second claim applies the same ignorance/wisdom structure to the specific domain of the terrible, as an instance of the general principle in the first claim."
limits: Claim 0067 is conditional on the premise that the pleasant is good; claim 0072 is derived from that conditional argument and extends the ignorance/wisdom mapping to a specific virtue pair. Both claims have final_status left_standing within the dialectical context of Socrates' argument with Protagoras. The relation does not address whether Protagoras fully accepts claim 0072, given his silence at 360d.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0050
pair_id: pair_protagoras_00050
claim_a: claim_protagoras_0068
claim_b: claim_protagoras_0069
relation_kind: restatement
resolution: standing
basis: Claim B (358d-359a) extends claim A (358c-358d) by applying the same principle — no one willingly goes toward what he believes bad — specifically to feared objects, having first established that what one fears is believed to be bad. The core thesis is identical; claim B adds a deductive step without modifying the original claim's content.
limits: Both claims are left_standing by the speaker. The restatement is checked across the shared Stephanus range 358c-359a. Claim B depends on claim A as a premise; that dependence does not make the pair a revision, since claim A is not altered.
review_status: accepted
```

```yaml
relation_id: rel_protagoras_0051
pair_id: pair_protagoras_00051
claim_a: claim_protagoras_0073
claim_b: claim_protagoras_0075
relation_kind: tension
resolution: standing
basis: "Both claims report Socrates's stated outcomes of two argumentative threads at the dialogue's close. Claim 0073 records that the argument that virtue is knowledge (all things including justice, temperance, courage are knowledge) would make virtue most teachable — contradicting Socrates's earlier opening position. Claim 0075 records the converse outcome of the earlier thread: virtue appeared more as something other than knowledge, which would make it least teachable. The two claims capture opposite horns of the same final aporia, not a direct contradiction between the claims themselves. Each claim reports a distinct conditional outcome (if virtue is knowledge → most teachable; if virtue appeared as other than knowledge → least teachable), and both are left standing together as the unresolved paradox Socrates describes at 361c."
limits: This records that the two claims pull against each other in framing the same final aporia; it does not resolve which conditional holds, nor does it establish a formal logical contradiction between the two claim contents as stated. Both claims are left standing, and the tension is the point of the closing scene.
review_status: accepted
```
