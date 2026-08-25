# Meno — Voice Ledger

Greek-only reported-speech structure for all eight required outer turns in
`wiki/reported-turn-scopes.json`. The six counterfactual-person cases and the
Laconian collective are retained without invented terminal owners; Meno and
Theognis are resolved only where the Greek identifies them.

All nineteen records are accepted as eight atomic cohorts under
`wiki/review/2026-08-16-meno-reported-turn-acceptance.md`. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records

```yaml
voice_id: voice_meno_0001
source_work: Meno
outer_turn_id: turn_meno_0003
stephanus_span: "70c-71b"
char_span:
  start_char: 814
  end_char: 1703
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "7060fafeab6f9fa957b55816d84507af89f715ac40fdbc8a53c4d77968e7ac16"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 814
    end_char: 817
limits: "The printed siglum frames Socrates' turn; it does not assign the hypothetical stranger's bounded reply below to him."
review_status: accepted
```

```yaml
voice_id: voice_meno_0002
source_work: Meno
outer_turn_id: turn_meno_0003
stephanus_span: "71a"
char_span:
  start_char: 1056
  end_char: 1299
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "e263c8e27bc9c75135d49fd03f8705fbbd6f7bcf8fc3034650443635db3c9401"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The q-bounded reply is introduced by τινα … ἐρεῖ; its hypothetical first-person speaker is an indefinite person, not a registered terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_meno_0003
source_work: Meno
outer_turn_id: turn_meno_0056
stephanus_span: "74b"
char_span:
  start_char: 7492
  end_char: 7829
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "fd81bccbd6af5b08d62a76767fc634b90d89b0b923c8b62778ee653319f8cfcc"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 7492
    end_char: 7495
review_status: accepted
```

```yaml
voice_id: voice_meno_0004
source_work: Meno
outer_turn_id: turn_meno_0056
stephanus_span: "74b"
char_span:
  start_char: 7655
  end_char: 7688
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "740dde12f42c4715637a39d6525efe09047ced559c66a4926a7f5d25fd97057f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The counterfactual τίς … ἀνέροιτο names no person. Its q-bounded question is retained without a terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_meno_0005
source_work: Meno
outer_turn_id: turn_meno_0056
stephanus_span: "74b"
char_span:
  start_char: 7744
  end_char: 7799
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "f2712ceace64f11b5fa34e93e36ec50b3cb5d8b3ccbe40e4988339d667159507"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The follow-up εἶπεν returns to the same hypothetical questioner, but no name or registered singular role identifies that speaker."
review_status: accepted
```

```yaml
voice_id: voice_meno_0006
source_work: Meno
outer_turn_id: turn_meno_0062
stephanus_span: "74c"
char_span:
  start_char: 7968
  end_char: 8189
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "d2091b96dc309e9120cf3a0a6cd9a9e58fa45c3daccdbb5c5f0beb4390cd16fc"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 7968
    end_char: 7971
review_status: accepted
```

```yaml
voice_id: voice_meno_0007
source_work: Meno
outer_turn_id: turn_meno_0062
stephanus_span: "74c"
char_span:
  start_char: 8085
  end_char: 8135
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "4e13cb72779256614f39ec52b918a14fb85c3a0e58a44b1cfb88ceabdcfc57e1"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "ὁ ἐρωτῶν identifies only the generic contingent questioner; the source supplies no registered terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_meno_0008
source_work: Meno
outer_turn_id: turn_meno_0066
stephanus_span: "74d-74e"
char_span:
  start_char: 8327
  end_char: 8739
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "c17a1a95e61d59024902302f5a5c9da72e7cd93057221c0503c69127c73755c3"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 8327
    end_char: 8330
review_status: accepted
```

```yaml
voice_id: voice_meno_0009
source_work: Meno
outer_turn_id: turn_meno_0066
stephanus_span: "74d-74e"
char_span:
  start_char: 8381
  end_char: 8719
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "c5068a08e37f8b3dc172cc9948238a01a7a53f5a3e15d9594904b46964c9ae21"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "Third-singular ἔλεγεν has no named or registered subject. Its resemblance to Socrates' method in ὥσπερ ἐγώ is not owner evidence."
review_status: accepted
```

```yaml
voice_id: voice_meno_0010
source_work: Meno
outer_turn_id: turn_meno_0072
stephanus_span: "74e-75a"
char_span:
  start_char: 9018
  end_char: 9566
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "629477cf3405fc6421761e18a2a197f23ec356c45f551256964ba356dd402f98"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 9018
    end_char: 9021
review_status: accepted
```

```yaml
voice_id: voice_meno_0011
source_work: Meno
outer_turn_id: turn_meno_0072
stephanus_span: "75a"
char_span:
  start_char: 9154
  end_char: 9231
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "496441975bae1a913d0e0028592f8f93749e2aeee81368ac2a06b8b47b11366a"
voice_chain: ["ΣΩ.", "ΜΕΝ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπες ὅτι"
    start_char: 9144
    end_char: 9153
limits: "The second-person reporting formula introduces the q-bounded reply as Meno's counterfactual answer; it is not a recap of an on-stage Meno turn."
review_status: accepted
```

```yaml
voice_id: voice_meno_0012
source_work: Meno
outer_turn_id: turn_meno_0072
stephanus_span: "75a"
char_span:
  start_char: 9260
  end_char: 9319
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "a556f6a03b795445c08fb1556c7462b44c99a01c28d7d80ade6a5cb76cf9856a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The response follows ἐθαύμασε καὶ εἶπεν, but the hypothetical questioner is neither named nor a registered singular role."
review_status: accepted
```

```yaml
voice_id: voice_meno_0013
source_work: Meno
outer_turn_id: turn_meno_0072
stephanus_span: "75a"
char_span:
  start_char: 9384
  end_char: 9488
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "5a74ac423d12a9a2fad24abdc2ab240ff5501208a49a75250d89fff64c74eb40"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "εἴ τίς σε ἐρωτῴη stages an indefinite speaker. The surrounding address to Meno identifies the addressee, not the q-bounded questioner."
review_status: accepted
```

```yaml
voice_id: voice_meno_0014
source_work: Meno
outer_turn_id: turn_meno_0361
stephanus_span: "86e-87c"
char_span:
  start_char: 33564
  end_char: 34713
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "c70cb650527a82d3a389b83992dd49c4c344cd4caeb318e13d2cc0cf032e00fe"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 33564
    end_char: 33567
review_status: accepted
```

```yaml
voice_id: voice_meno_0015
source_work: Meno
outer_turn_id: turn_meno_0361
stephanus_span: "87a-87b"
char_span:
  start_char: 33771
  end_char: 34222
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "23a5d950b147ae8c60b5edd65c1d978a1eafc80f0be4b8e4dbb60fafb51f9ee7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The q answer belongs to indefinite τις in a geometer comparison. The preceding οἱ γεωμέτραι is collective, not a single registered owner."
review_status: accepted
```

```yaml
voice_id: voice_meno_0016
source_work: Meno
outer_turn_id: turn_meno_0478
stephanus_span: "95d-95e"
char_span:
  start_char: 51170
  end_char: 51405
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "2d20e0c1eb342e9a7db0cd95855e81dc471c5079c1858dd2b053a84fdc95d7ac"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 51170
    end_char: 51173
limits: "The printed siglum opens the attribution clause; the whole-turn quotation below is not Socrates' own argument."
review_status: accepted
```

```yaml
voice_id: voice_meno_0017
source_work: Meno
outer_turn_id: turn_meno_0478
stephanus_span: "95d-95e"
char_span:
  start_char: 51204
  end_char: 51404
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "38cbe3c33389b248f769415d578823876f6b7e2ed1b677cda620ec4890ff7322"
voice_chain: ["ΣΩ.", "ΘΕΟΓ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    role: cue
    text: "οὗ λέγει"
    start_char: 51193
    end_char: 51201
    antecedent_text: "Θέογνιν τὸν ποιητὴν"
    antecedent_start_char: 51098
    antecedent_end_char: 51117
limits: "The antecedent in the immediately preceding Socrates turn names Theognis; the whole {quote} span is his directly attributed elegiac speech."
review_status: accepted
```

```yaml
voice_id: voice_meno_0018
source_work: Meno
outer_turn_id: turn_meno_0566
stephanus_span: "99d"
char_span:
  start_char: 59362
  end_char: 59533
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "51a6e21a5babef5ddfc282f93e6229a1a3be89fb946a3fc38a8ff695e48467cf"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 59362
    end_char: 59365
limits: "The printed frame encloses a direct collective Laconian acclamation; it does not make the split q span Socrates' speech."
review_status: accepted
```

```yaml
voice_id: voice_meno_0019
source_work: Meno
outer_turn_id: turn_meno_0566
stephanus_span: "99d"
char_span:
  start_char: 59489
  end_char: 59532
source_path: raw/plato/greek/meno.txt
source_sha256: "91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99"
span_sha256: "825508c4a79e745b36f3736fbc9d0862c05340acb07fab55572473b604728c15"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "φασίν reports one direct utterance by the plural Laconians. Its two q pieces and intervening formula remain one unresolved collective child."
review_status: accepted
```
