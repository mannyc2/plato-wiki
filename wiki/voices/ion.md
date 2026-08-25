# Ion — Voice Ledger

Reported-speech structure for the two outer turns marked `required` in
`wiki/reported-turn-scopes.json`. This ledger is reviewed directly against
`raw/plato/greek/ion.txt`; it records the transmitted Nestor quotation and
Ion's explicitly staged counterfactual question without activating any
claim-speaker cutover.

All four records are accepted as one atomic cohort under
`wiki/review/2026-08-16-ion-reported-turn-acceptance.md`. The later Homeric
quotations inside `turn_ion_0120` remain Socrates' argumentative citations, as
the reviewed scope census determines.

## Records

```yaml
voice_id: voice_ion_0001
source_work: Ion
outer_turn_id: turn_ion_0089
stephanus_span: 537a-537b
char_span:
  start_char: 14609
  end_char: 14909
source_path: raw/plato/greek/ion.txt
source_sha256: "0528d703134b2f59f3db31bad84bafb320e5022e1d7660cf64d72034cb29c93d"
span_sha256: "c07e1c05d816bef488c13830fb88232dc4de367ae51d6e01912c81550b5ef165"
voice_chain: ["ΙΩΝ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΙΩΝ."
    start_char: 14609
    end_char: 14613
limits: "The printed siglum opens Ion's recitation; it does not assign the bounded Homeric advice below to Ion."
review_status: accepted
```

```yaml
voice_id: voice_ion_0002
source_work: Ion
outer_turn_id: turn_ion_0089
stephanus_span: 537a-537b
char_span:
  start_char: 14614
  end_char: 14908
source_path: raw/plato/greek/ion.txt
source_sha256: "0528d703134b2f59f3db31bad84bafb320e5022e1d7660cf64d72034cb29c93d"
span_sha256: "84faab4b55a46221d4ff63fb1444d0a0336dde71e7a448d00a1fab44fcd1f870"
voice_chain: ["ΙΩΝ.", "ΝΕΣ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: "λέγει Νέστωρ"
    start_char: 14508
    end_char: 14520
limits: "The preceding 537a formula names Nestor as the owner of the directly quoted advice; it begins 106 characters before this child and is the source's introduction to this recitation."
review_status: accepted
```

```yaml
voice_id: voice_ion_0003
source_work: Ion
outer_turn_id: turn_ion_0120
stephanus_span: 538d-539d
char_span:
  start_char: 17471
  end_char: 18752
source_path: raw/plato/greek/ion.txt
source_sha256: "0528d703134b2f59f3db31bad84bafb320e5022e1d7660cf64d72034cb29c93d"
span_sha256: "2f01754a54bafd067a2c834e725200f1cf3bc6d3e54dfd579329b2eec28f6fdf"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 17471
    end_char: 17474
limits: "The printed siglum opens Socrates' turn. Its two later Homeric verse blocks are citations held inside his argument and do not create further records."
review_status: accepted
```

```yaml
voice_id: voice_ion_0004
source_work: Ion
outer_turn_id: turn_ion_0120
stephanus_span: 538d-538e
char_span:
  start_char: 17513
  end_char: 17757
source_path: raw/plato/greek/ion.txt
source_sha256: "0528d703134b2f59f3db31bad84bafb320e5022e1d7660cf64d72034cb29c93d"
span_sha256: "af1785f445188eef68b9bc7365d717c957670530730f0803e6ccfbe36c42ede2"
voice_chain: ["ΣΩ.", "ΙΩΝ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: "σοῦ ἐρομένου, εἰ ἔροιό με"
    start_char: 17486
    end_char: 17511
limits: "The second-person genitive absolute and optative introduce the {q}-bounded counterfactual utterance as Ion's question to Socrates. The text identifies the staged owner despite its counterfactual mood."
review_status: accepted
```
