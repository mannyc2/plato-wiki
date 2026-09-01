```yaml
relation_id: rel_gorgias_0001
pair_id: pair_gorgias_00001
claim_a: claim_gorgias_0007
claim_b: claim_gorgias_0013
relation_kind: tension
resolution: verbal_only
basis: |
  Both claims use the shared phrase πειθοῦς δημιουργός ("craftsman of persuasion"). Claim A (453a) defines rhetoric as craftsman of persuasion whose whole business culminates in producing persuasion in the souls of listeners. Claim B (453e) extends the same phrase to arithmetic, noting that arithmetic too appears to be a craftsman of persuasion. The claims are not formally contradictory—both can be true if multiple crafts are craftsmen of persuasion—but they pull against each other because claim A uses the phrase as rhetoric's defining sum (τὸ κεφάλαιον), and claim B's extension implicitly challenges whether "craftsman of persuasion" is sufficient to distinguish rhetoric from other crafts.
limits: |
  The tension is recognized but unresolved in the cited span; the distinction between kinds of persuasion (ποίας πειθοῦς) is explicitly raised at 453e as the next move in the examination but not yet recorded. This relation does not decide whether the tension is eventually dissolved or sharpened.
resolution_ref:
  stephanus_span: 453e
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 453e
    start_marker: 453e
    end_marker: 453e
    start_char: 13896
    end_char: 14268
    text_sha256: 60af028423f13c1c4cf23b573f066fe3cb553bb5a265a317bbaa91bbd0d5f5ae
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0002
pair_id: pair_gorgias_00002
claim_a: claim_gorgias_0034
claim_b: claim_gorgias_0035
relation_kind: revision
resolution: superseded
basis: "Socrates takes Gorgias's claim (the rhetorician is more persuasive than the doctor before a crowd on health matters) and draws out a more general reformulation: the non-knower will be more persuasive than the knower among non-knowers. Gorgias concedes each step (ἀληθῆ λέγεις, πάνυ γε, ναί), so the second claim is not a contradiction but a logically derived restatement that makes explicit what was implicit about the epistemic asymmetry. The scope restriction (ἔν γε ὄχλῳ) is preserved in both claims by the clause 'among non-knowers' (ἐν τοῖς μὴ εἰδόσιν)."
limits: This records the textual relation between the two thesis-statements as they stand in the dialogue. It does not evaluate whether Socrates's derivation is formally valid or whether Gorgias ought to have conceded it.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0003
pair_id: pair_gorgias_00003
claim_a: claim_gorgias_0035
claim_b: claim_gorgias_0037
relation_kind: revision
resolution: verbal_only
basis: "Claim A (459a-459b) derives a specific consequence from the doctor-rhetorician analogy: the non-knower will be more persuasive than the knower among non-knowers whenever the rhetorician is more persuasive than the doctor. Claim B (459b-459c) generalises this pattern to all other crafts and adds the characterisation of rhetoric as a 'mechanism of persuasion' (μηχανὴν πειθοῦς) aimed at appearing rather than knowing. The movement from the particular case to the universal scope plus the new μηχανὴ πειθοῦς formulation is a substantive modification, not a mere restatement. The apparent conflict between claim A's final_status (posed_only) and claim B's final_status (left_standing) is dissolved by the explicit textual distinction: at 459b Socrates marks the generalisation explicitly with 'οὐκοῦν καὶ περὶ τὰς ἄλλας ἁπάσας τέχνας ὡσαύτως ἔχει' (likewise concerning all the other crafts), moving from the doctor case to a universal claim, which is a new thesis rather than a restatement of the earlier posed thesis."
limits: The revision relation tracks the textual movement from the doctor-specific case to the universal claim about all crafts. Gorgias's reply at 459c responds to claim B but does not withdraw or refute it. Claim A is posed_only (not left_standing), so standing resolution is inapplicable; verbal_only captures the explicit distinction in the text.
review_status: rejected
resolution_ref:
  stephanus_span: 459b
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 459b
    start_marker: 459b
    end_marker: 459b
    start_char: 24542
    end_char: 24980
    text_sha256: e7e3ee798eb916aad6ea72ff15c4977fa92d50bd0d278767f6bb457642436024
```

```yaml
relation_id: rel_gorgias_0004
pair_id: pair_gorgias_00004
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0057
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 463d
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 463d
    start_marker: 463d
    end_marker: 463d
    start_char: 33128
    end_char: 33453
    text_sha256: da9683fd1c26bf5f9875dcc1bbc54d0d3f0c7357e574d5e3df1912feec4e0c8f
basis: "Both claims center on Socrates's treatment of rhetoric as shameful (αἰσχρόν). At 459c-459e, Socrates poses for examination whether the rhetorician, not knowing what is just/unjust, noble/shameful, or good/bad, merely devises persuasion to seem to know among non-knowers — a condition that would make rhetoric shameful. At 463d, Socrates asserts that rhetoric is shameful, glossing this with 'for I call bad things shameful' (τὰ γὰρ κακὰ αἰσχρὰ καλῶ). The apparent difference in status — posed question vs. assertion — is dissolved by the fact that both passages express the same Socratic evaluation: rhetoric is shameful because it lacks knowledge of normative categories."
limits: "claim_gorgias_0039 has final_status: posed_only, while claim_gorgias_0057 has final_status: left_standing. The relation records a thematic restatement of the same underlying evaluation across two passages. The 463d explicit assertion of shamefulness gives voice to what the 459c-459e framing question already presupposes, and Socrates's caveat at 463d ('I answer as though you already know what I mean') signals that he takes the earlier discussion as grounds."
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0005
pair_id: pair_gorgias_00005
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0076
relation_kind: tension
resolution: verbal_only
basis: "Claim A (459c-459e) is Socrates's posed question whether the rhetorician lacks knowledge of good/bad/noble/shameful/just/unjust, having only persuasion to seem knowledgeable among non-knowers. Claim B (467e) is Polus's endorsed tripartite classification of all existing things as good, bad, or neither-good-nor-bad (μεταξὺ τούτων). Both claims deploy the good/bad (ἀγαθόν/κακόν) vocabulary and concern knowledge or classification of these normative categories. Tension arises because claim A treats these as domains the rhetorician may be ignorant of while still practicing, whereas claim B presupposes things are cleanly classifiable as good, bad, or intermediate — a framework that, if the rhetorician lacks the relevant knowledge, he cannot reliably apply. The two claims are not formally contradictory: claim A poses a question (final_status: posed_only) about the rhetorician's epistemic condition, while claim B states an ontological classification schema as a premise. The distinction between the two claims is explicit: claim A concerns an epistemic stance (whether someone knows) about a specific agent (the rhetorician), while claim B concerns a general ontological classification of things (τῶν ὄντων)."
limits: This records a tension in the shared good/bad vocabulary across the two passages, not a formal contradiction. Claim A is posed_only and not yet resolved; claim B is left_standing. The verbal distinction is that one is epistemic (about knowing good/bad) and the other is ontological (about what things are good/bad).
review_status: rejected
resolution_ref:
  stephanus_span: 459c-467e
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 459c-459e
    start_marker: 459c
    end_marker: 459e
    start_char: 24980
    end_char: 26174
    text_sha256: 01a048a17338898286fed28a731efe7a97d68214d3b6a0696a52122061709d24
```

```yaml
relation_id: rel_gorgias_0006
pair_id: pair_gorgias_00006
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0090
relation_kind: tension
resolution: verbal_only
basis: "Both claims involve the concept of the unjust (ἄδικον) but operate at different levels. Claim A (459c-459e) is Socrates' posed question about whether the rhetorician knows or merely simulates knowledge about justice and injustice — it is a methodological framing question, not a thesis about the unjust person. Claim B (472d) is Polus' substantive thesis that an unjust man committing injustice can be happy. The shared term ἄδικον creates a topical connection but no logical contradiction: claim A questions epistemic competence about justice and injustice, while claim B asserts a possibility about the unjust person's happiness. Neither claim directly affirms or denies the other's content."
limits: Claim A has status posed_only, not left_standing, so resolution cannot be standing. The claims address different domains — epistemic stance versus substantive ethics — which dissolves any apparent conflict. No resolving span provides an explicit distinction; the separation is inherent in the different speech contexts and claim kinds.
resolution_ref:
  stephanus_span: 459c-459e
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 459c-459e
    start_marker: 459c
    end_marker: 459e
    start_char: 24980
    end_char: 26174
    text_sha256: 01a048a17338898286fed28a731efe7a97d68214d3b6a0696a52122061709d24
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0007
pair_id: pair_gorgias_00007
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0091
relation_kind: tension
resolution: verbal_only
basis: "Claim A poses for examination the thesis that the rhetorician, while not knowing what is just or unjust, has devised persuasion to seem to know among non-knowers. Claim B asserts that an unjust man who commits injustice cannot be happy. They share the concept of injustice (ἄδικον / ἀδικοῦντα) but operate at different levels: claim A concerns the rhetorician's cognitive relation to justice (knowledge versus persuasion), while claim B concerns the happiness-consequence of unjust action. The apparent tension dissolves because claim A is posed as a question at 459c-459e — it does not assert that the rhetorician is in fact ignorant of justice, but sets up the examination. Claim B is an assertion about the unhappiness of the unjust, not about the cognitive state of rhetoricians."
limits: Claim A has final_status posed_only, claim B has final_status left_standing. The verbal distinction between a posed question about epistemic standing and an assertion about unjust action and happiness prevents a contradiction. The record does not address whether the dialogue later links rhetorical ignorance to injustice.
resolution_ref:
  stephanus_span: 459c-459e
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 459c-459e
    start_marker: 459c
    end_marker: 459e
    start_char: 24980
    end_char: 26174
    text_sha256: 01a048a17338898286fed28a731efe7a97d68214d3b6a0696a52122061709d24
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0008
pair_id: pair_gorgias_00008
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0251
relation_kind: revision
resolution: superseded
basis: Claim A (459c-459e) poses for examination the thesis that a rhetorician does not know the noble (καλόν) and shameful but merely persuades non-knowers. Claim B (503a-503b) asserts that there is a noble (καλόν) rhetoric that strives to make souls good, distinct from shameful flattery. Claim B revises the scope of the earlier posed-for-examination thesis by introducing a twofold distinction of rhetoric that was not present in Claim A. The earlier thesis treated rhetoric as a unitary phenomenon of seeming-knowledge; the later claim explicitly divides rhetoric into a noble kind and a shameful flattery kind.
limits: Claim A has final_status posed_only, which is not left_standing. Claim B is left_standing. The later claim supersedes the earlier posed thesis by introducing a distinction that the earlier passage did not entertain. This is a revision superseding the earlier formulation, not a contradiction, because the later claim does not deny that a shameful rhetoric of seeming-knowledge exists; it adds a second kind.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0009
pair_id: pair_gorgias_00009
claim_a: claim_gorgias_0041
claim_b: claim_gorgias_0043
relation_kind: revision
resolution: standing
basis: "Claim 0041 asserts a conditional necessity: if Gorgias makes someone a rhetorician, that person must know the just and unjust, either beforehand or by learning from Gorgias. Claim 0043 takes the learning branch of that conditional and extends it by stacking the learned-is-just principle to conclude the rhetorician must be just and wish to do just things. The second claim does not merely restate the first; it adds a substantive moral-psychological inference not yet present in 0041."
limits: Both claims have final_status left_standing within the dialectical exchange. The revision is an expansion, not a contradiction; whether the inference from knowing justice to being just and doing just things is valid is contested elsewhere in the dialogue but is not settled in these spans.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0010
pair_id: pair_gorgias_00010
claim_a: claim_gorgias_0044
claim_b: claim_gorgias_0098
relation_kind: restatement
resolution: standing
basis: Both claims are Socratic theses about αδικεῖν (committing injustice). Claim 0044 asserts that the just person will never wish to commit injustice, linking justice to a refusal to commit injustice. Claim 0098 asserts the stronger thesis that committing injustice is worse than suffering injustice. The former is a narrower claim about the just person's will; the latter is an absolute comparative claim about the badness of committing injustice. They share the same trajectory — committing injustice is a bad to be avoided — but 0098 expands from the just person's disposition to a universal ranking.
limits: "Both claims have final_status left_standing, so no resolution by refutation is available. The relation does not assert formal logical equivalence: 0044 is about the just person's will (βουλήσεται), while 0098 is a comparative claim (κάκιον) about the acts themselves. The shared term αδικεῖν and the common Socratic direction warrant restatement rather than mere tension."
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0011
pair_id: pair_gorgias_00011
claim_a: claim_gorgias_0044
claim_b: claim_gorgias_0279
relation_kind: tension
resolution: standing
basis: "Claim A (460c) holds that the just person — and by extension the just rhetorician — will never wish to commit injustice (ἀδικεῖν). Claim B (510e) holds that a person who assimilates to an unjust ruler will be disposed to commit as much injustice as possible and avoid penalty. The two claims are not formally contradictory because they speak of different subjects: the just rhetorician in A versus the courtier of an unjust ruler in B. However, they pull against each other because A's principle suggests a just person simply never wills injustice, while B describes a mechanism by which a person — through assimilation to an unjust ruler — becomes disposed to maximize injustice, leaving open whether the agent in B was originally just or became unjust through the assimilation."
limits: Both claims have final_status left_standing and were asserted by Socrates in different contexts (Gorgias in A, Callicles in B). This relation notes the tension in the surface logic across the two passages but does not assert that Socrates is inconsistent, nor does it reconcile the two claims. The records do not address whether the agent in B could have been just before the assimilation described.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0012
pair_id: pair_gorgias_00012
claim_a: claim_gorgias_0049
claim_b: claim_gorgias_0050
relation_kind: restatement
resolution: standing
basis: Socrates applies the identical formula ἐμπειρία ... χάριτος καὶ ἡδονῆς ἀπεργασίας (an empirical knack concerned with producing gratification and pleasure) first to rhetoric at 462c and then to opso-poetic at 462d-462e, explicitly presenting the latter as a parallel case that shares the same characterization.
limits: Both claims are left standing and Socrates treats them as structurally parallel; this record does not assert that the two are identical practices, only that they are described with the same formal definitional structure and predicate.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0013
pair_id: pair_gorgias_00013
claim_a: claim_gorgias_0052
claim_b: claim_gorgias_0053
relation_kind: restatement
resolution: standing
basis: "Both claims assert that a named practice (rhetoric in 0052, opso-poetic in 0053) falls under the heading of flattery (κολακείαν), which is characterized as non-technical, empirical, and belonging to a conjectural soul. Claim 0052 introduces flattery as the genus under which what Socrates calls rhetoric falls; claim 0053 states that flattery has many parts and names opso-poetic as an example. Both claims are asserted by Socrates at adjacent Stephanus 463a-463b and share the same core structure: flattery is a non-craft genus whose species appear craft-like but are only empirical knacks. Claim 0053 extends the partition by naming a different species (opso-poetic) while reiterating the epistemic contrast between real craft and empirical routine."
limits: This record does not claim the two species (rhetoric, opso-poetic) are identical or equivalent, only that both are placed under the same genus of flattery with the same epistemic characterization. Both claims have final_status left_standing, and the relation is checked against their stated content only. No additional structural claim about the full partition is implied.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0014
pair_id: pair_gorgias_00014
claim_a: claim_gorgias_0052
claim_b: claim_gorgias_0322
relation_kind: restatement
resolution: standing
basis: Both claims use ψυχή in the context of a bipartite anthropology in which soul and body are distinct, separable components of a living person. Claim A (463a-463b) describes a pursuit belonging to a soul of a certain character (στοχαστικῆς, ἀνδρείας, δεινῆς προσομιλεῖν), implying the soul is a distinct bearer of traits. Claim B (524b-524c) explicitly defines death as the separation of soul and body (δυοῖν πραγμάτοιν διάλυσις, τῆς ψυχῆς καὶ τοῦ σώματος), and states each retains its condition after separation. The two claims restate the same underlying anthropology — soul-as-distinct-entity bearing traits — at different levels of explicitness, without tension.
limits: This record identifies only the shared bipartite anthropology (soul as distinct, trait-bearing entity). It does not claim that claim A asserts an afterlife doctrine, nor does it address whether the soul in 463a-463b is separable from body in the same sense as in 524b-524c. The shared term ψυχῆς is necessary but not sufficient for a relation; the restatement finding rests on the parallel structural role of soul as a bearer of condition/character in a person.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0015
pair_id: pair_gorgias_00015
claim_a: claim_gorgias_0064
claim_b: claim_gorgias_0065
relation_kind: revision
resolution: standing
basis: "claim_gorgias_0064 develops the κομμωτική–γυμναστική analogy with an extended characterisation (mischievous, deceptive, etc.) at 465a–465b; claim_gorgias_0065 at 465b–465c then sets out the full fourfold proportional analogy (κομμωτική:γυμναστική :: σοφιστική:νομοθετική and ὀψοποιική:ἰατρική :: ῥητορική:δικαιοσύνη), explicitly invoking the geometric manner of exposition. Claim B restates claim A's half of the analogy while adding the legislative/justice pair, making it a substantive expansion rather than a bare repetition."
limits: Checked scope is the text at 465a–465c. Both claims are left_standing; the relation is revision only insofar as claim B incorporates and extends claim A's analogical content. It does not imply that claim A is replaced or superseded.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0016
pair_id: pair_gorgias_00016
claim_a: claim_gorgias_0080
claim_b: claim_gorgias_0106
relation_kind: revision
resolution: standing
basis: "At 469c Socrates states a conditional preference (if it were necessary to choose, he would choose to suffer injustice rather than do it). At 474b, Socrates expands the thesis into a universal comparative claim: he, Polus, and all people hold that doing injustice is worse (κάκιον) than suffering injustice, and that not paying the penalty is worse than paying it. The 474b formulation adds the comparative 'worse' and extends the scope to all people, making it a substantive development of the earlier conditional preference."
limits: Both claims remain left_standing, so no resolution by refutation or withdrawal is available. This relation tracks the textual development from a personal conditional stance to a universal comparative claim; it does not assess whether the 474b thesis is consistent with the 469c conditional.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0017
pair_id: pair_gorgias_00017
claim_a: claim_gorgias_0083
claim_b: claim_gorgias_0084
relation_kind: revision
resolution: refuted_resolved
basis: Claim A records Polus' concession at 469e that the dagger-in-the-marketplace scenario does not constitute μέγα δύνασθαι (great power). Claim B records Socrates' reformulation at 470a that μέγα δύνασθαι consists in acting beneficially (ὠφελίμως πράττειν). Socrates builds on Polus' concession to redefine great power as inherently tied to beneficial action, moving from the negative admission ('not that way') to a positive conditional account.
limits: "The revision is a dialectical move: Polus' concession (refuted_conceded) eliminates one account of great power, and Socrates immediately supplies a reformulated conditional account at 470a. The records capture this sequence; the relation does not verify that Polus explicitly endorses the positive reformulation."
review_status: rejected
resolution_ref:
  stephanus_span: 469e-470a
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 469e-470a
    start_marker: 469e
    end_marker: 470a
    start_char: 45286
    end_char: 46136
    text_sha256: b47be012f2b36d65e1cc58f1ce7a38ca69ea9c1638c501954ab55ae4e186a81c
```

```yaml
relation_id: rel_gorgias_0018
pair_id: pair_gorgias_00018
claim_a: claim_gorgias_0088
claim_b: claim_gorgias_0089
relation_kind: restatement
resolution: standing
basis: "Both claims are drawn from the same 471a span and articulate the same underlying thesis: the unjust person is wretched (ἄθλιος). Claim A (Polus) states that Archelaus is wretched according to Socrates' own argument; claim B (Socrates) states the general principle that a person is wretched if and only if he is unjust. Claim B supplies the universal conditional that claim A applies to the specific case of Archelaus, so they are restatements of the same position at different levels of generality."
limits: This record does not assess whether Polus himself endorses the principle or whether Socrates would concede the application to Archelaus without further qualification. The relation is limited to the textual compatibility of the two claim contents as recorded.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0019
pair_id: pair_gorgias_00019
claim_a: claim_gorgias_0088
claim_b: claim_gorgias_0094
relation_kind: restatement
resolution: standing
basis: Both claims assert, using the same Greek term ἄθλιος, that an unjust person (Archelaus in claim_a, the unjust man generally in claim_b) is wretched. Claim_a presents this as an inference Polus draws from Socrates' own argument; claim_b is Socrates' explicit statement that the unjust man is in every case wretched (ἄθλιος). Claim_b generalizes the predicate that claim_a applies to a specific case.
limits: This relation does not establish that Socrates concedes that Archelaus is unjust, nor that the two speakers agree about what makes Archelaus wretched. Claim_b adds a comparative dimension (more/less wretched depending on punishment) that claim_a does not address.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0020
pair_id: pair_gorgias_00020
claim_a: claim_gorgias_0089
claim_b: claim_gorgias_0094
relation_kind: revision
resolution: standing
basis: "Claim A (471a) states the simple conditional: a person is wretched (ἄθλιος) if and only if unjust (ἄδικος). Claim B (472e) retains that the unjust person is in every case wretched (πάντως μὲν ἄθλιος), but introduces a comparative gradation within wretchedness: the unpunished unjust person is more wretched (ἀθλιώτερος), and the punished unjust person is less wretched (ἧττον δὲ ἄθλιος). This adds a new axis of comparison absent from the earlier claim. The core binary link between injustice and wretchedness is preserved, but the comparative framework constitutes a substantive refinement rather than a simple restatement."
limits: This record does not resolve whether the comparatives in Claim B are consistent with the biconditional in Claim A; it only notes that Claim B adds a new distinction not present in Claim A. Both claims remain left_standing in their respective records.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0021
pair_id: pair_gorgias_00021
claim_a: claim_gorgias_0090
claim_b: claim_gorgias_0091
relation_kind: contradiction
resolution: standing
basis: "Polus affirms that an unjust man who commits injustice can be μακάριον (472d). Socrates asserts that this is ἀδύνατον — impossible (472d). The two claims are mutually exclusive: one asserts a possibility, the other denies it outright for the same subject (ἄδικον ὄντα καὶ ἀδικοῦντα)."
limits: Both claims have final_status left_standing within the dialogue at this point; the contradiction is not yet resolved by argument, merely registered as the first disputed point (ἓν μὲν τουτὶ ἀμφισβητοῦμεν). The record does not assess whether subsequent elenchus resolves the contradiction.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0022
pair_id: pair_gorgias_00022
claim_a: claim_gorgias_0092
claim_b: claim_gorgias_0093
relation_kind: contradiction
resolution: standing
basis: "Claim 0092 asserts the unjust man who suffers justice (δίκης) and punishment (τιμωρίας) is most wretched (ἀθλιώτατος, 472d). Claim 0093 asserts the unjust man who does not suffer justice (μὴ τυγχάνῃ δίκης) is happy (εὐδαίμων, 472e). Polus endorses both claims in adjacent steps of the same exchange. The two claims are formally contradictory as stated: they assign opposite value predicates—happiness and extreme wretchedness—to the two mutually exclusive and jointly exhaustive possibilities for the unjust man (suffering justice or not). If one claim is true the other must be false, so they cannot both stand as stated."
limits: This record does not assess whether Polus is aware of the contradiction or whether Socrates exposes it; both claims have final_status left_standing and the contradiction is established from the claim contents alone. The record does not evaluate the further Socratic claim at 472e that the unjust man is wretched in both cases.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0023
pair_id: pair_gorgias_00023
claim_a: claim_gorgias_0092
claim_b: claim_gorgias_0094
relation_kind: revision
resolution: standing
basis: "Polus at 472d asserts the punished unjust man is 'most wretched' (ἀθλιώτατος) without comparing the punished to the unpunished case. Socrates at 472e immediately restates the position in comparative terms: the unjust man is wretched in every case, but more wretched (ἀθλιώτερος) if unpunished and less wretched if punished. Socrates thus introduces a comparative scale that Polus had not articulated — the claim is modified from a single-case superlative to a two-case comparative ranking — while preserving the core shared premise that the unjust man who suffers punishment is wretched."
limits: This record does not establish that Polus would accept Socrates' comparative formulation; the revision is performed by Socrates, and Polus's assent is elicited only in the subsequent exchange. It does not assess whether the superlative and comparative formulations are logically equivalent.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0024
pair_id: pair_gorgias_00024
claim_a: claim_gorgias_0093
claim_b: claim_gorgias_0096
relation_kind: tension
resolution: standing
basis: Both claims involve εὐδαίμων as a shared term, but operate at different levels. Claim 0093 is a substantive thesis by Polus that the unpunished unjust man is happy. Claim 0096 is a meta-claim by Socrates that knowing who is happy is among the finest things to know. The tension is that Polus asserts a definite happiness claim while Socrates frames the very question of happiness as something most shameful not to know—which implicitly calls into question whether Polus has adequately investigated the matter before asserting it. The claims are not logically contradictory as stated; Polus could be happy while believing the question is important, or he could be happy while failing to see its importance.
limits: "This does not establish formal contradiction. The claims are about different objects (a specific happiness attribution vs. the epistemic status of happiness questions). The tension is pragmatic: Socrates' framing casts doubt on whether Polus' assertion is well-founded, but Polus does not concede anything here and his claim remains left_standing."
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0025
pair_id: pair_gorgias_00025
claim_a: claim_gorgias_0096
claim_b: claim_gorgias_0134
relation_kind: restatement
resolution: standing
basis: "Both claims share the superlative κάλλιστον applied to a normative domain: Socrates asserts that knowing who is happy is among the finest things (472c-472d), while Polus asserts that justice (δίκη) surpasses money-making and medicine in fineness (478b). The term κάλλιστον recurs across both passages as a shared evaluative predicate, but the domains differ — Socrates predicates fineness of knowledge about happiness, Polus predicates it of justice as a practice. The shared lexical marker is real but the content is not identical."
limits: This relation records the recurrence of the evaluative καλλιστον across two speakers in different contexts. It does not claim that Polus is echoing Socrates, that either speaker uses κάλλιστον with the same criterion, or that the two claims form a single argumentative line. Both claims have final_status left_standing and the relation is limited to the two cited spans.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0026
pair_id: pair_gorgias_00026
claim_a: claim_gorgias_0098
claim_b: claim_gorgias_0099
relation_kind: contradiction
resolution: standing
basis: "Both claims are asserted in the same span (473a). Socrates restates his thesis that committing injustice (ἀδικεῖν) is worse than suffering injustice (ἀδικεῖσθαι), and Polus confirms the opposite thesis — that suffering injustice is worse. The two content statements are mutually exclusive on the same evaluative axis: each ranks ἀδικεῖν and ἀδικεῖσθαι in inverse order of badness."
limits: This record registers a direct opposition between two standing theses in 473a. It does not resolve which thesis is correct or track subsequent argument. Both claims have final_status left_standing at this point in the text.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0027
pair_id: pair_gorgias_00027
claim_a: claim_gorgias_0098
claim_b: claim_gorgias_0279
relation_kind: tension
resolution: standing
basis: "Claim A asserts that committing injustice (ἀδικεῖν) is worse than suffering it. Claim B describes a consequence of imitating an unjust ruler: one will be disposed to commit as much injustice as possible while avoiding penalty. Both claims are left_standing and share the term ἀδικεῖν, but they differ in scope: A is a normative ranking (worse/better), while B is a predictive claim about dispositional outcomes. They pull against each other because B describes a scenario where one seeks to commit injustice and escape penalty—a course that A implies is the worse path—yet neither claim formally contradicts the other as stated. No passage explicitly reconciles or distinguishes them."
limits: This pair is scoped to the two claim records as stated. Claim A is recalled at 473a from earlier argument; claim B is posed at 510e in a different dramatic context with Callicles. The tension is noted but not adjudicated as contradiction because the claims operate at different levels (normative vs. predictive) and neither has been refuted or withdrawn. This record does not track whether later passages implicitly resolve the tension.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0028
pair_id: pair_gorgias_00028
claim_a: claim_gorgias_0102
claim_b: claim_gorgias_0103
relation_kind: contradiction
resolution: standing
basis: Polus (claim_gorgias_0102) asserts that the unjust would-be tyrant who is caught and tortured is more wretched (εὐδαιμονέστερος…ἔσται) than the one who escapes and rules as he wishes. Socrates (claim_gorgias_0103) denies Polus's comparative term outright, asserting that neither man will ever be happier than the other (εὐδαιμονέστερος μὲν τοίνυν οὐδέποτε ἔσται οὐδέτερος αὐτῶν), and instead identifies the unpunished escapee as the more wretched one (ἀθλιώτερος). The two claims address the same two figures with the shared term εὐδαιμονέστερος and yield opposite comparative rankings, so they cannot both stand as stated.
limits: This relation treats the two claims as textually contradictory at 473b-473d. It does not adjudicate which speaker is correct or whether later argumentative moves resolve the disagreement. Both claims have final_status left_standing, so the contradiction is noted as unresolved within the examined span.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0029
pair_id: pair_gorgias_00029
claim_a: claim_gorgias_0108
claim_b: claim_gorgias_0117
relation_kind: revision
resolution: standing
basis: At 474c Polus asserts that suffering injustice (τὸ ἀδικεῖσθαι) is κάκιον than doing injustice (τὸ ἀδικεῖν). At 475d Socrates presents a new finding—doing injustice (τὸ ἀδικεῖν) is now also shown to be κάκιον than suffering injustice—explicitly marked as a reversal of the earlier position (νῦν δέ γε κάκιον ἐφάνη). The later claim supersedes the earlier Polus position on which act is worse, while both remain left_standing as recorded thesis events in the dialogue.
limits: Both claims are left_standing in their respective records. The relation captures the textual reversal of the worse-judgment from 474c to 475d without evaluating whether the reversal follows logically from the intervening agreement about shamefulness.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0030
pair_id: pair_gorgias_00030
claim_a: claim_gorgias_0109
claim_b: claim_gorgias_0110
relation_kind: contradiction
resolution: verbal_only
basis: |
  Polus asserts at 474c that doing injustice is more shameful (αἴσχιον) than suffering injustice, but denies that it is also worse (κάκιον). Socrates poses the conditional that if doing injustice is more shameful, then it is also worse, and Polus immediately rejects that inference with ἥκιστά γε. The apparent contradiction is that Polus holds αἴσχιον without conceding κάκιον. The explicit verbal distinction between αἴσχιον and κάκιον dissolves the appearance of contradiction: Polus treats the two predicates as not co-extensive.
limits: |
  This pair captures the immediate distinction at 474c. Whether Socrates can compel Polus to accept that αἴσχιον entails κάκιον is examined in the subsequent elenchus (474c-475e). The verbal distinction is explicit in the text but may not be stable.
review_status: rejected
resolution_ref:
  stephanus_span: 474c
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 474c
    start_marker: 474c
    end_marker: 474c
    start_char: 54876
    end_char: 55275
    text_sha256: 04d335b15372324ecc291fb7e3957ed4aec25532461e815ee9669b040a08f98b
```

```yaml
relation_id: rel_gorgias_0031
pair_id: pair_gorgias_00031
claim_a: claim_gorgias_0109
claim_b: claim_gorgias_0115
relation_kind: restatement
resolution: standing
basis: Both claims use the same core term αἴσχιον (more shameful) and agree that doing injustice is more shameful than suffering it. Claim B makes explicit the inference from that shared premise to the further conclusion that doing injustice is worse (κάκιον), which claim A does not state but also does not deny. Claim A reports Polus's concession; claim B reports Socrates drawing the consequence Polus has already conceded. The two records cover successive moments in a single elenchus chain rather than independent theses.
limits: This relation registers only the textual continuity of the αἴσχιον premise across 474c–475c. It does not assess whether the inference to κάκιον is valid, whether Polus would accept the intermediate premise about pain and badness on reflection, or whether the dialogue later reopens this conclusion.
review_status: accepted
resolution_ref:
  stephanus_span: 474c-475c
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 474c-475c
    start_marker: 474c
    end_marker: 475c
    start_char: 54876
    end_char: 57375
    text_sha256: da0905ad1ee398df6d7e121e8d62bc9e5476a2c1e789b3e8797565e4b1c5e07a
```

```yaml
relation_id: rel_gorgias_0032
pair_id: pair_gorgias_00032
claim_a: claim_gorgias_0109
claim_b: claim_gorgias_0148
relation_kind: tension
resolution: standing
basis: "Both claims address what is more shameful (αἴσχιον) regarding doing injustice (τὸ ἀδικεῖν) versus suffering injustice (τὸ ἀδικεῖσθαι), but they frame the comparison on different grounds. Polus at 474c asserts without qualification that doing injustice is more shameful than suffering it. Callicles at 483a-483b introduces a nature/convention distinction: by nature (φύσει) suffering injustice is more shameful and worse; by convention (νόμῳ) doing injustice is more shameful. Callicles's nature claim reverses Polus's ranking, while his convention claim aligns with Polus. Neither claim is refuted in its own segment, so the tension between the two rankings stands unresolved at the text level."
limits: This records a standing tension between two characters' assertions about the more-shameful ranking. It does not resolve whether Callicles's nature/convention framework is meant to supersede Polus's flat claim, nor does it infer authorial intent.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0033
pair_id: pair_gorgias_00033
claim_a: claim_gorgias_0110
claim_b: claim_gorgias_0115
relation_kind: revision
resolution: superseded
basis: Claim A at 474c poses the conditional that if doing injustice is more shameful (αἴσχιον) than suffering injustice, then it is also worse (κάκιον). Claim B at 475b–475c supplies the missing premise (the more shameful surpasses in pain or in badness), eliminates pain, and concludes that doing injustice surpasses in badness and is therefore worse. Claim B thus restates the conditional from Claim A as a concluded argument with additional premises filled in, superseding the bare conditional with a fully reasoned conclusion.
limits: This relation records the logical development from posed conditional to concluded argument; it does not assess whether the premises about the fine and shameful are correct.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0034
pair_id: pair_gorgias_00034
claim_a: claim_gorgias_0110
claim_b: claim_gorgias_0148
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 474c-483b
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 474c
    start_marker: 474c
    end_marker: 474c
    start_char: 54876
    end_char: 55275
    text_sha256: 04d335b15372324ecc291fb7e3957ed4aec25532461e815ee9669b040a08f98b
basis: "Both claims link αἴσχιον and κάκιον but assign the alignment to opposite sides of the doing/suffering injustice pair. Socrates at 474c poses a conditional (if doing injustice is more shameful, it is also worse), while Callicles at 483a-483b asserts the opposite ranking under the nature/convention distinction. The apparent conflict is dissolved because Callicles' nature/convention framework introduces a distinction absent from Socrates' conditional: Callicles grants that by convention doing injustice is more shameful, matching the premise Socrates poses, while claiming nature reverses it."
limits: "This is not a formal contradiction because Socrates' claim is a conditional posed for examination (final_status: posed_only) rather than an assertion, and Callicles explicitly distinguishes nature from convention. The tension persists across the dialogue but the nature/convention distinction provides a verbal framework that prevents the two claims from being strictly incompatible as stated."
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0035
pair_id: pair_gorgias_00035
claim_a: claim_gorgias_0112
claim_b: claim_gorgias_0121
relation_kind: restatement
resolution: superseded
basis: Claim 0112 proposes that fine things (καλά) are so on account of usefulness (χρείαν) or pleasure (ἡδονήν) or both. Claim 0121 states that all just things (δίκαια) are fine insofar as they are just. The later claim applies the καλά predicate to a particular domain (justice) without reiterating or altering the earlier usefulness/pleasure criterion. Neither claim has been refuted or withdrawn; claim 0121 supersedes 0112 only in the narrow sense that it extends the scope of 'fine' to the just without revisiting the two grounds.
limits: The pair does not record a formal contradiction or an explicit cross-reference; 476b does not invoke usefulness or pleasure. Claim 0121 does not formally revise claim 0112; the relation is limited to the sequence in which a general account of καλά is followed by a domain-specific application.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0036
pair_id: pair_gorgias_00036
claim_a: claim_gorgias_0112
claim_b: claim_gorgias_0125
relation_kind: restatement
resolution: verbal_only
basis: "Claim 0112 at 474d-474e proposes that all fine things (καλά) are called fine either on account of usefulness (χρείαν) or pleasure (ἡδονήν) or both. Claim 0125 at 476e-477a applies that same criterion to the one being punished: since undergoing just things is fine, and fine things are good because they are either pleasant or beneficial (ἡδέα ἢ ὠφέλιμα), the punished undergoes good things. At 477a Socrates explicitly invokes the earlier criterion (ἢ γὰρ ἡδέα ἢ ὠφέλιμα) as the reason fine things are good, directly recapitulating the 474d-474e definition. This is the same content restated in a new application."
limits: claim_a has final_status posed_only, not left_standing, so standing resolution is unavailable. The restatement is the same criterion for καλόν as ἡδύ or ὠφέλιμον applied to the punishment chain. No explicit distinction dissolves an apparent conflict; the pair simply shows the criterion being reused without modification.
resolution_ref:
  stephanus_span: 477a
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 477a
    start_marker: 477a
    end_marker: 477a
    start_char: 60143
    end_char: 60502
    text_sha256: 96ca621e379a7964e44865f17c85bf6a21dc0856613193479b548e51d1fc7653
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0037
pair_id: pair_gorgias_00037
claim_a: claim_gorgias_0113
claim_b: claim_gorgias_0330
relation_kind: restatement
resolution: verbal_only
resolution_ref:
  stephanus_span: 475a
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 475a
    start_marker: 475a
    end_marker: 475a
    start_char: 56104
    end_char: 56525
    text_sha256: b9bca2863bf5a0f089770da52efb666cfd06f70de9859b1fefd3e828838420f2
basis: "Both claims deploy αἰσχρὸν as predicate of a state defined by opposition to the fine (καλόν). At 475a Socrates defines the shameful as the opposite of the fine, namely by pain (λύπῃ) and badness (κακῷ). At 527d-527e Socrates calls it shameful (αἰσχρὸν) that he and his interlocutors, being as they now appear, put on airs while never holding the same views about the same things, especially the greatest matters — this being the depth of their lack of education (ἀπαιδευσίας). The late passage applies the same evaluative term to a condition of contradictory belief and ignorance, which instantiates the 475a definition: contradictory belief is a form of badness (κακόν), and ignorance is a defect, so the application of αἰσχρὸν to it is consistent with the earlier definition. No revision, tension, or contradiction is present; the later passage restates the term's evaluative force in a concrete application without altering the earlier definition."
limits: Claim A has final_status posed_only rather than left_standing, so resolution=standing does not apply. The resolution is verbal_only because the 475a definition of αἰσχρὸν by λύπῃ and κακῷ remains the explicit framework in which the 527d-e application operates; the later passage applies αἰσχρὸν to contradictory belief and ignorance — both forms of κακόν — without altering the predicate's content. This relation treats only the compatibility of the two claim contents as stated; it does not claim that Socrates intended the 527d-e passage as an explicit restatement of the 475a definition.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0038
pair_id: pair_gorgias_00038
claim_a: claim_gorgias_0115
claim_b: claim_gorgias_0148
relation_kind: contradiction
resolution: standing
basis: "Claim A (Socrates, 475b-475c) concludes that doing injustice is worse (κάκιον) than suffering it, because it is more shameful (αἴσχιον) and the more shameful surpasses in badness (κακῷ) not pain (λύπῃ). Claim B (Callicles, 483a-483b) asserts the reverse by nature: whatever is worse (κάκιον) is also more shameful, so suffering injustice is by nature more shameful. The two claims share the same conceptual mapping between shamefulness (αἴσχιον) and badness (κάκιον) but arrive at opposite conclusions about whether doing or suffering injustice is worse and more shameful."
limits: Both claims have final_status left_standing and are voiced by different speakers within elenctic contexts. Callicles introduces a nature/convention distinction absent from Socrates' argument, so the contradiction operates at the level of stated theses without adjudicating whether the nature/convention framing undermines the shared premises. The pair is not resolved within the dialogue span covered by these two records.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0039
pair_id: pair_gorgias_00039
claim_a: claim_gorgias_0121
claim_b: claim_gorgias_0125
relation_kind: revision
resolution: superseded
basis: "Claim A (476b) asserts that all just things are fine (καλά) insofar as they are just — a general claim about the character of just things. Claim B (476e-477a) extends this by applying it to the specific case of the one being punished: the punished undergoes just things, therefore fine things, and then further claims that fine things are good (either pleasant or beneficial), so the punished undergoes good things. Claim B does not simply restate A; it adds the substantive step that fine things are good (ἀγαθά) and applies the earlier premise to a concrete case. The relation is revision, not contradiction, because B builds on A rather than opposing it."
limits: Claim A has final_status posed_only; claim B has final_status left_standing. Since B incorporates and extends A within a standing argument, B supersedes A in the argument chain. Does not evaluate whether the move from καλά to ἀγαθά is valid.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0040
pair_id: pair_gorgias_00040
claim_a: claim_gorgias_0132
claim_b: claim_gorgias_0137
relation_kind: restatement
resolution: superseded
basis: Both claims assert that paying the penalty (δίκην διδόναι) releases one from wickedness (πονηρίας). Claim A (478a) states it as release from the greatest evil; claim B (478d-478e) recapitulates the same point and adds the metaphor of justice as medicine (ἰατρικὴ πονηρίας) that makes one more just. The core proposition is repeated, not contradicted.
limits: Claim A has final_status posed_only, while claim B has final_status left_standing. Claim B restates the same thesis with fuller elaboration and receives explicit assent, standing as the operative version.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0041
pair_id: pair_gorgias_00041
claim_a: claim_gorgias_0133
claim_b: claim_gorgias_0134
relation_kind: revision
resolution: standing
basis: "Both claims are left_standing and share the term δίκη. Claim A (Socrates at 478a-478b) establishes that δίκη releases from ἀκολασίας and ἀδικίας analogously to how medicine releases from sickness and money-making from poverty. Claim B (Polus at 478b) adds an evaluative ranking: δίκη πολὺ διαφέρει in fineness (κάλλιστον) over χρηματιστική and ἰατρική. Claim B does not deny the analogical function asserted in claim A; it layers a comparative value judgment on top of the already-agreed scheme. This is a revision because Polus introduces a substantive new claim — the superior fineness of δίκη — that extends the prior thesis rather than merely repeating it."
limits: The relation is confined to these two claims as stated. It does not assess whether the καλόν criterion Socrates subsequently applies (pleasure, benefit, or both) undercuts Polus' ranking, nor does it evaluate whether the analogy between δίκη and the other arts ultimately holds. Both claims are left_standing in their respective segments, so no resolution by refutation is available.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0042
pair_id: pair_gorgias_00042
claim_a: claim_gorgias_0133
claim_b: claim_gorgias_0137
relation_kind: restatement
resolution: standing
basis: "Both claims present δίκη/δικαιοσύνη as a curative or remedial force: claim_a analogizes justice to medicine releasing one from injustice (ἀδικίας), while claim_b sharpens this into the direct formulation that justice makes the punished more just (δικαιοτέρους) and serves as medicine (ἰατρικὴ) for wickedness (πονηρίας). The second claim refines the analogy but does not alter the core thesis."
limits: The checked scope is confined to Socrates' analogy between justice and medicine across 478a-478e; this does not assess whether the analogy holds in the broader dialogue or whether Polus fully grasps the implication.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0043
pair_id: pair_gorgias_00043
claim_a: claim_gorgias_0134
claim_b: claim_gorgias_0137
relation_kind: restatement
resolution: standing
basis: "Both claims assert that δίκη (justice/punishment) is superlatively beneficial. In 478b, Polus states δίκη far surpasses money-making and medicine in fineness (κάλλιστον). Socrates in 478d-478e develops this into a specific claim: δίκη makes those punished more just (δικαιοτέρους ποιεῖ) and becomes a medicine (ἰατρική) for wickedness (πονηρίας). Polus assents to both. The later claim unpacks the earlier value-judgment by giving δίκη a remedial function, but the core content—that δίκη is the finest remedy—is not substantively modified; it is elaborated with an explanatory mechanism."
limits: This relation does not address whether the remedial mechanism (making one more just through punishment) would satisfy the earlier, less specific claim about fineness under all circumstances. Both claims stand in the text with Polus's assent; no refutation or withdrawal occurs in the immediate context.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0044
pair_id: pair_gorgias_00044
claim_a: claim_gorgias_0141
claim_b: claim_gorgias_0143
relation_kind: restatement
resolution: standing
basis: Both claims are Socrates's own theses about the greater wretchedness (ἀθλιώτερον) of the unjust or unhealthy-souled condition. Claim_a asserts that living with a rotten, unjust, unholy soul is more wretched than living with an unhealthy body. Claim_b restates and extends this by asserting that the one who commits injustice is always more wretched than the one who suffers it, and the unpunished more wretched than the punished — which presupposes the same ranking of soul-harm over body-harm that claim_a states directly.
limits: The claims appear at different moments in the same extended speech (479b–479e), so claim_b does not independently re-argue the thesis but recalls it as already proven. Both claims have final_status left_standing, and there is no textual revision, tension, or contradiction between them.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0045
pair_id: pair_gorgias_00045
claim_a: claim_gorgias_0141
claim_b: claim_gorgias_0205
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 493e-494a
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 493e-494a
    start_marker: 493e
    end_marker: 494a
    start_char: 94335
    end_char: 95185
    text_sha256: e8a33f577b0b856e2c2f0fd8966884ea0614ffc97870845166515fbb25c201e4
basis: "Both claims use σαθρά imagery to contrast healthy and unhealthy conditions. claim_a asserts that a rotten (σαθρᾷ) and unjust soul is more wretched than an unhealthy body and is left_standing. claim_b poses the jar image where the orderly life is better than the licentious life, using σαθρά for the leaky jars. The apparent pull toward the same conclusion is dissolved by an explicit contextual distinction: claim_a is a thesis within the Polus exchange about punishment and the soul's health, while claim_b is a posed image in the Callicles exchange about pleasure and the good life, rejected by Callicles at 494a. The two claims operate in different argumentative contexts with different respondents."
limits: This record does not claim that the two passages express the same doctrine. The shared σαθρά vocabulary is noted but the claims address different targets (soul-health vs. life-order). claim_b has final_status posed_only, so a standing resolution is not applicable.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0046
pair_id: pair_gorgias_00046
claim_a: claim_gorgias_0142
claim_b: claim_gorgias_0279
relation_kind: restatement
resolution: standing
basis: Both claims state that committing injustice without paying the penalty (ἀδικοῦντα μὴ διδόναι δίκην) is the worst or primary disposition. At 479d Socrates ranks it as the greatest evil by nature (πάντων μέγιστόν τε καὶ πρῶτον κακῶν). At 510e Socrates describes the one who assimilates to an unjust ruler as aiming to commit as much injustice as possible and to avoid paying the penalty (ὡς πλεῖστα ἀδικεῖν καὶ ἀδικοῦντα μὴ διδόναι δίκην); this applies the same ranked framework to a concrete power scenario. No term in either passage qualifies or revises the ranking.
limits: Both claims share the evaluative ranking of unpunished injustice as the worst condition; 479d states it as a general thesis derived from premises, while 510e applies it forward to predict what a power-seeker will pursue. The relation is restatement of the ranking, not of every surrounding dialectical move. Both claims are left_standing; the relation does not check whether Callicles would endorse 479d's premises.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0047
pair_id: pair_gorgias_00047
claim_a: claim_gorgias_0142
claim_b: claim_gorgias_0314
relation_kind: restatement
resolution: standing
basis: Both claims assert that doing injustice (τὸ ἀδικεῖν) is the greatest evil, subordinating other feared things to it. Claim 0142 ranks committing injustice as the second-greatest evil and committing injustice without paying the penalty as the greatest. Claim 0314 asserts that no rational person fears dying itself; what is feared is doing injustice. Both place the wrongness of committing injustice above other apparent evils.
limits: "The two claims are not identical in wording or argumentative context: 0142 is a ranking within a punishment framework derived from prior premises, while 0314 is a standalone assertion about fear of death versus fear of injustice. The records do not check whether Socrates would accept the full hierarchy of 0142 at 522e alongside the claim that fear of injustice is what is truly feared."
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0048
pair_id: pair_gorgias_00048
claim_a: claim_gorgias_0157
claim_b: claim_gorgias_0158
relation_kind: restatement
resolution: standing
basis: claim_gorgias_0157 asserts that philosophizing past youth is καταγέλαστον for an older man; claim_gorgias_0158 restates the same thesis through an analogy comparing the older philosophizing man to an adult who lisps or plays, also described as καταγέλαστον. Both claims share the core evaluative content and the same speaker (Callicles) in directly adjacent Stephanus spans (485a and 485b-485c). Claim 0158 elaborates the single thesis of claim 0157 with a vivid analogy rather than introducing a distinct or modified claim.
limits: Both claims are left standing as assertions by Callicles; the pair is examined only within the cited 485a-485c text. Whether Socrates later challenges or refutes this thesis is outside this relation's scope.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0049
pair_id: pair_gorgias_00049
claim_a: claim_gorgias_0185
claim_b: claim_gorgias_0187
relation_kind: revision
resolution: standing
basis: "Both claims occur at 489e under Socratic questioning. In claim_a Callicles says the better (βελτίους) are the better ones (ἀμείνους), a circular response that Socrates immediately calls out as merely using names without clarifying anything. Under further pressure, claim_b gives substantive content: the better and stronger are the more intelligent (φρονιμωτέρους). Claim_b revises claim_a by replacing the empty tautology with the specific criterion of intelligence."
limits: Both claims have final_status left_standing. This relation records the textual sequence in which claim_b modifies claim_a; it does not settle whether Callicles endorses the revision or merely concedes under dialectical pressure. The checked scope is the visible textual succession within 489e.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0050
pair_id: pair_gorgias_00050
claim_a: claim_gorgias_0192
claim_b: claim_gorgias_0218
relation_kind: tension
resolution: standing
basis: "Both claims share the term φρόνιμοι (intelligent) and are asserted by Callicles as left_standing claims. In 491b Callicles identifies the stronger as those who are intelligent (φρόνιμοι) about city affairs and courageous — this is a positive definition of an elite type. In 498a he claims that the intelligent and the unintelligent do not differ much in pleasure and pain, which treats intelligence as irrelevant to a distinct domain (affective experience). These claims pull in different directions — the first makes intelligence a defining trait of the superior; the second makes it nearly indifferent — but they are not formally contradictory because they operate on distinct axes: one defines who counts as stronger in political terms, the other addresses affective response to pleasure and pain."
limits: This is a tension, not a contradiction, because Callicles could consistently hold that intelligence distinguishes the stronger politically while granting that it does not strongly differentiate felt pleasure and pain. The record does not assess whether this tension destabilizes Callicles' broader position or whether Socrates exploits it later.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0051
pair_id: pair_gorgias_00051
claim_a: claim_gorgias_0209
claim_b: claim_gorgias_0210
relation_kind: restatement
resolution: superseded
basis: "Both claims state the same proposition—that each person stops being thirsty (παύεται διψῶν) and taking pleasure (ἡδόμενος) at the same time—at the same Stephanus span (497c). Claim A is Socrates posing the thesis for examination (final_status: posed_only); Claim B is Callicles assenting to it (final_status: left_standing). The content is identical; the difference is only in stance: posed by Socrates, then asserted by Callicles."
limits: This records textual identity of content. It does not assess whether Callicles later contradicts or qualifies this assent elsewhere in the dialogue. Only Claim B carries left_standing status; Claim A is posed_only and does not independently stand.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0052
pair_id: pair_gorgias_00052
claim_a: claim_gorgias_0271
claim_b: claim_gorgias_0274
relation_kind: restatement
resolution: superseded
basis: "Both claims assert the same thesis: that to avoid doing injustice one must prepare some power and craft (δύναμίν τινα καὶ τέχνην). In 509e Socrates poses this as a question (with the additional explanatory clause 'on the grounds that without learning and practice one will do injustice'), and in 510a, after Callicles grants the point with 'ἔστω σοι τοῦτο,' Socrates restates the same thesis as an assertion: 'παρασκευαστέον ἐστὶ δύναμίν τινα καὶ τέχνην, ὅπως μὴ ἀδικήσωμεν.' The 510a assertion supersedes the earlier posed version by converting it from an open question into an agreed premise."
limits: The restatement is narrower in phrasing (omitting the μάθῃ/ἀσκήσῃ elaboration), but the operative thesis — that δύναμίς τις καὶ τέχνη must be prepared in order not to do injustice — is unchanged. The earlier claim is posed_only and is superseded by the accepted, left_standing version at 510a.
review_status: accepted
```

```yaml
relation_id: rel_gorgias_0053
pair_id: pair_gorgias_00053
claim_a: claim_gorgias_0074
claim_b: claim_gorgias_0076
relation_kind: revision
resolution: standing
basis: The later value-and-end analysis refines the earlier appeal to an apparent best by distinguishing the good pursued from intermediate actions.
limits: This is a local argumentative refinement, not an identity of every apparent-best judgment with the later taxonomy.
review_status: rejected
```

```yaml
relation_id: rel_gorgias_0054
pair_id: pair_gorgias_00054
claim_a: claim_gorgias_0039
claim_b: claim_gorgias_0074
relation_kind: tension
resolution: verbal_only
resolution_ref:
  stephanus_span: 459c-459e
  source_ref:
    source_path: raw/plato/greek/gorgias.txt
    stephanus_span: 459c-459e
    start_marker: 459c
    end_marker: 459e
    start_char: 24980
    end_char: 26174
    text_sha256: 01a048a17338898286fed28a731efe7a97d68214d3b6a0696a52122061709d24
basis: No substantive relation is established. Claim A poses whether a rhetorician can appear to know the good and bad while lacking that knowledge; claim B is Polus's concession that acting on what merely seems best without intelligence is not good and is bad. The shared κακόν does not make the action-conditioned judgment in B an affirmation, denial, or development of the question about rhetoric in A.
limits: This rejects the deterministic candidate after checking the cited Greek spans only. It does not decide whether later passages connect rhetorical ignorance to bad action; those would require an explicit separately grounded relation.
review_status: rejected
```
