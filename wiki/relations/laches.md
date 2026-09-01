```yaml
relation_id: rel_laches_0001
pair_id: pair_laches_00001
claim_a: claim_laches_0026
claim_b: claim_laches_0033
relation_kind: contradiction
resolution: standing
basis: Claim 0026 records Nicias agreeing at 198a that courage is one part (μόριον) of virtue among others. Claim 0033 records Socrates concluding at 199e that Nicias's account makes courage the whole of virtue (σύμπασα ἀρετή), not a part. These two claims are in formal contradiction about whether courage, under Nicias's account, is a part or the whole of virtue. Both claims have final_status left_standing, so the contradiction remains unresolved in the text.
limits: The contradiction is internal to the dialectical argument; the text does not adjudicate whether the 198a agreement or the 199e inference is the correct analysis. Both are recorded as what was said and agreed at each moment.
review_status: accepted
```

```yaml
relation_id: rel_laches_0002
pair_id: pair_laches_00002
claim_a: claim_laches_0026
claim_b: claim_laches_0034
relation_kind: contradiction
resolution: refuted_resolved
basis: Claim 0026 records Nicias agreeing at 198a that courage is a part of virtue. Claim 0034 records Nicias conceding at 199e that what has now been said about courage does not appear to be a part of virtue. Nicias's concession in 0034 directly retracts the position affirmed in 0026. Claim 0034 has final_status refuted (refuted_conceded), which resolves the contradiction by indicating the 198a position no longer stands.
limits: "The resolution is dialectical: Nicias concedes the argument has failed on its own premises. The record does not assert that courage is or is not a part of virtue in fact, only that the attempted definition collapsed."
resolution_ref:
  stephanus_span: 199e
  source_ref:
    source_path: raw/plato/greek/laches.txt
    stephanus_span: 199e
    start_marker: 199e
    end_marker: 199e
    start_char: 43857
    end_char: 44314
    text_sha256: b0133bfc23a53cf43218845cf8217403cfc8ec8187fb6eda67439cb9f4aba720
review_status: accepted
```

```yaml
relation_id: rel_laches_0003
pair_id: pair_laches_00003
claim_a: claim_laches_0027
claim_b: claim_laches_0028
relation_kind: restatement
resolution: standing
basis: "Claim 0027 records Socrates at 198b defining fearful things (δεινά) as those that produce fear (δέος), and fear as the expectation of future evil. Claim 0028 records Nicias at 198c agreeing with the same formulation: fearful things are future evils and confident things are future non-evils or goods. Nicias's agreement is a direct restatement of Socrates's formulation, not a modification."
limits: This relation captures the agreement at the level of the stated thesis. It does not address whether Nicias later departs from this understanding in subsequent exchanges.
review_status: accepted
```

```yaml
relation_id: rel_laches_0004
pair_id: pair_laches_00004
claim_a: claim_laches_0028
claim_b: claim_laches_0032
relation_kind: tension
resolution: standing
basis: "Claim 0028 records Nicias agreeing at 198c that confident things are future non-evils or goods (ἀγαθά). Claim 0032 records Nicias conceding at 199d that a person with knowledge of all goods (ἀγαθά) and evils would lack no part of virtue. The tension lies in scope: at 198c goods are confined to future goods in the context of fear/confidence; at 199d the goods-and-evils knowledge has expanded to all times, which transforms courage from a delimited knowledge into comprehensive virtue-knowledge. The claims are not contradictory as stated, but the 199d concession pulls the 198c framework toward a much broader scope than Nicias originally endorsed."
limits: The tension is structural within the argument's unfolding, not a formal contradiction. Both claims record what Nicias agreed to at each stage. The record does not assess whether Nicias should have anticipated the expansion.
review_status: accepted
```

```yaml
relation_id: rel_laches_0005
pair_id: pair_laches_00005
claim_a: claim_laches_0029
claim_b: claim_laches_0030
relation_kind: restatement
resolution: standing
basis: Claim 0029 records Socrates asserting at 198d that the same knowledge (ἐπιστήμη) covers past, present, and future matters of its domain. Claim 0030 records Nicias agreeing at 199a that the same knowledge concerns things that will be, are becoming, and have happened. Nicias's agreement is a restatement of Socrates's thesis using nearly the same terms (γιγνομένων/γιγνομένων, γεγονότων/γεγονότος, ἐσομένων/γενήσεται), with no substantive modification.
limits: The relation captures agreement at the level of the stated epistemic thesis. Both claims are left_standing. The record does not address whether this thesis is independently defensible.
review_status: accepted
```

```yaml
relation_id: rel_laches_0006
pair_id: pair_laches_00006
claim_a: claim_laches_0029
claim_b: claim_laches_0031
relation_kind: revision
resolution: superseded
basis: "Claim 0029 records the general epistemic thesis that the same knowledge covers all times. Claim 0031 records Socrates at 199b-199c applying that thesis specifically to courage: if courage is knowledge of fearful and confident things, and the same knowledge covers past, present, and future, then courage concerns goods and evils at all times. Claim 0031 is a revision/extension rather than a mere restatement: it takes the general premise from 0029 and derives a specific consequence for the definition of courage that was not stated in 0029. Claim 0031 has final_status posed_only, so it supersedes 0029 only as a proposed application."
limits: Claim 0031 has final_status posed_only, indicating the inference is posed for examination rather than endorsed. The relation records the logical dependency between the general premise and its application.
review_status: accepted
```

```yaml
relation_id: rel_laches_0007
pair_id: pair_laches_00007
claim_a: claim_laches_0031
claim_b: claim_laches_0034
relation_kind: contradiction
resolution: refuted_resolved
basis: "Claim 0031 records Socrates positing at 199b-199c that courage, as knowledge of fearful and confident things extended across all times, is nearly the whole of virtue. Claim 0034 records Nicias conceding at 199e that what has now been said about courage does not appear to be a part of virtue. These claims pull in opposite directions: 0031 frames the expanded definition as a consequence Nicias must face, and 0034 records Nicias accepting that the consequence collapses his position. Claim 0034 has final_status refuted, resolving the tension by showing the definitional project failed."
limits: Claim 0031 is posed_only, not endorsed, so the contradiction is dialectical. The record does not assert that the inference in 0031 is valid, only that Nicias's concession in 0034 confirms the argument's collapse.
resolution_ref:
  stephanus_span: 199e
  source_ref:
    source_path: raw/plato/greek/laches.txt
    stephanus_span: 199e
    start_marker: 199e
    end_marker: 199e
    start_char: 43857
    end_char: 44314
    text_sha256: b0133bfc23a53cf43218845cf8217403cfc8ec8187fb6eda67439cb9f4aba720
review_status: accepted
```

```yaml
relation_id: rel_laches_0008
pair_id: pair_laches_00008
claim_a: claim_laches_0031
claim_b: claim_laches_0035
relation_kind: tension
resolution: verbal_only
basis: "Claim 0031 records Socrates posing the inference that courage, on Nicias's definition, becomes nearly the whole of virtue. Claim 0035 records Socrates declaring at 199e that courage has not been found. These are not contradictory: claim 0031 offers a conditional derivation (if Nicias's definition, then courage ≈ whole virtue) with status posed_only, while claim 0035 announces the negative result of the inquiry. The verbal distinction is that 0031 is a conditional posed for examination, not an endorsed claim, while 0035 is an asserted negative verdict."
limits: "The verbal distinction resolves the apparent tension: one is a posed conditional, the other an asserted conclusion. The relation does not assess whether the failure to find courage follows validly from the premises."
resolution_ref:
  stephanus_span: 199e
  source_ref:
    source_path: raw/plato/greek/laches.txt
    stephanus_span: 199e
    start_marker: 199e
    end_marker: 199e
    start_char: 43857
    end_char: 44314
    text_sha256: b0133bfc23a53cf43218845cf8217403cfc8ec8187fb6eda67439cb9f4aba720
review_status: accepted
```

```yaml
relation_id: rel_laches_0009
pair_id: pair_laches_00009
claim_a: claim_laches_0033
claim_b: claim_laches_0034
relation_kind: revision
resolution: refuted_resolved
basis: Claim 0033 records Socrates asserting at 199e that Nicias's account makes courage not a part of virtue but the whole. Claim 0034 records Nicias conceding at 199e that what has now been said about courage does not appear to be a part of virtue. Nicias's concession revises the dialectical position from Socrates's assertion of contradiction to Nicias's acceptance of that conclusion in his own voice. Claim 0034 has final_status refuted, which resolves the exchange.
limits: The relation captures Nicias's concession as a revision that incorporates Socrates's conclusion. It does not claim the two claims are identical in wording.
resolution_ref:
  stephanus_span: 199e
  source_ref:
    source_path: raw/plato/greek/laches.txt
    stephanus_span: 199e
    start_marker: 199e
    end_marker: 199e
    start_char: 43857
    end_char: 44314
    text_sha256: b0133bfc23a53cf43218845cf8217403cfc8ec8187fb6eda67439cb9f4aba720
review_status: accepted
```

```yaml
relation_id: rel_laches_0010
pair_id: pair_laches_00010
claim_a: claim_laches_0034
claim_b: claim_laches_0035
relation_kind: tension
resolution: refuted_resolved
basis: "Claim 0034 records Nicias conceding that courage under his account is not a part of virtue. Claim 0035 records Socrates declaring that courage has not been found. The tension is that claim 0034 is a specific concession about one definition (Nicias's), while claim 0035 generalizes to the whole inquiry: courage itself has not been found. The move from 'this account fails' to 'courage has not been found' is not a strict entailment, since other accounts might yet succeed. Claim 0034 has final_status refuted, resolving the local concession and leaving claim 0035 standing as the inquiry's negative result."
limits: Both claims are in the same 199e span and concern the inquiry's outcome. The tension is between a local concession and a global negative verdict, not a formal contradiction. The record does not assess whether Socrates's generalization is warranted.
resolution_ref:
  stephanus_span: 199e
  source_ref:
    source_path: raw/plato/greek/laches.txt
    stephanus_span: 199e
    start_marker: 199e
    end_marker: 199e
    start_char: 43857
    end_char: 44314
    text_sha256: b0133bfc23a53cf43218845cf8217403cfc8ec8187fb6eda67439cb9f4aba720
review_status: accepted
```
