# Menexenus — Voice Ledger

Greek-only reported-speech structure for all fourteen required outer turns in
`wiki/reported-turn-scopes.json`. Aspasia's single bounded oration crosses the
236d–249c printed frames; the fathers' collective direct address is retained
below it without an invented terminal owner.

All thirty-one records are accepted as fourteen atomic cohorts under
`wiki/review/2026-08-17-menexenus-reported-turn-acceptance.md`. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records

```yaml
voice_id: voice_menexenus_0001
source_work: Menexenus
outer_turn_id: turn_menexenus_0025
stephanus_span: "236c-237a"
char_span:
  start_char: 4442
  end_char: 5319
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "7d1518b0367cc4c27e0ed004c992158864bf38dfd6ce14fdc7e165487e935b69"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 4442
    end_char: 4445
limits: "Socrates' frame introduces the start of the bounded Aspasia oration; it does not make the following oration his own speech."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0002
source_work: Menexenus
outer_turn_id: turn_menexenus_0025
stephanus_span: "236d-237a"
char_span:
  start_char: 4664
  end_char: 5319
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "99459ca36f4fb4e9b612706019d3dac14d8b6be8076d5cb642481cb8484483a2"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
limits: "The opening feminine report and the 249d ownership formula bracket one continuous Aspasia oration across the re-set printed frames."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0003
source_work: Menexenus
outer_turn_id: turn_menexenus_0026
stephanus_span: "237a-237e"
char_span:
  start_char: 5319
  end_char: 7205
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "6f885ddee6dc80a60b418c9c265755bec05e4ae3c2f32e2002613e1f6416433a"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 5319
    end_char: 5322
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0004
source_work: Menexenus
outer_turn_id: turn_menexenus_0026
stephanus_span: "237a-237e"
char_span:
  start_char: 5323
  end_char: 7205
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "c09a9ef1eb42a26fd7b574a2ff66c6ed8d898ca6c4d23180bb70465860f1c5b3"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0005
source_work: Menexenus
outer_turn_id: turn_menexenus_0027
stephanus_span: "237e-238e"
char_span:
  start_char: 7205
  end_char: 9108
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "1913e6a8f97c140755f2720217011cebf740651b66496a2041e9ba6d16a10100"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 7205
    end_char: 7208
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0006
source_work: Menexenus
outer_turn_id: turn_menexenus_0027
stephanus_span: "237e-238e"
char_span:
  start_char: 7209
  end_char: 9108
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "1ed6bcd00b187b50fc92c6dcdc267075b2be712d98478d63d4252231f0b5b856"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0007
source_work: Menexenus
outer_turn_id: turn_menexenus_0028
stephanus_span: "238e-239e"
char_span:
  start_char: 9108
  end_char: 11079
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "23bba8a0a5b19b4dec43d82f8162f512c022ec0f24c1ec4db2696460a08e4293"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 9108
    end_char: 9111
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0008
source_work: Menexenus
outer_turn_id: turn_menexenus_0028
stephanus_span: "238e-239e"
char_span:
  start_char: 9112
  end_char: 11079
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "77b8424b609badca364d8d2435336630525eba12e04c11c35fa9286c260d31bc"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0009
source_work: Menexenus
outer_turn_id: turn_menexenus_0029
stephanus_span: "239e-240e"
char_span:
  start_char: 11079
  end_char: 13199
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "d529aff142533f5ed6ade334f554aa311ee1c96add3bd6c1bf9ec47afbb20b24"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 11079
    end_char: 11082
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0010
source_work: Menexenus
outer_turn_id: turn_menexenus_0029
stephanus_span: "239e-240e"
char_span:
  start_char: 11083
  end_char: 13199
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "b23c292368cb747ab32e105bada0c90ce2fd3bbf129b01c2b24eebb6c50f2441"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0011
source_work: Menexenus
outer_turn_id: turn_menexenus_0030
stephanus_span: "240e-241e"
char_span:
  start_char: 13199
  end_char: 15125
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "2ec90d8ffec55da7b078d41d00fc6f56cafb7714d157e6a63484183625d62456"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 13199
    end_char: 13202
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0012
source_work: Menexenus
outer_turn_id: turn_menexenus_0030
stephanus_span: "240e-241e"
char_span:
  start_char: 13203
  end_char: 15125
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "6c750b1df45bb7eee1bc234225f9688a598b7a0de6a9ab5d3d24efd061bf1ae9"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0013
source_work: Menexenus
outer_turn_id: turn_menexenus_0031
stephanus_span: "241e-242e"
char_span:
  start_char: 15125
  end_char: 16971
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "b97897fba13b51ac1bff17b7671a017e5cfa8f3d86489921edc9eccf753fd3a3"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 15125
    end_char: 15128
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0014
source_work: Menexenus
outer_turn_id: turn_menexenus_0031
stephanus_span: "241e-242e"
char_span:
  start_char: 15133
  end_char: 16971
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "1fcb11c246f883a5704e5bb4af5538c4f6787eb72d827497b8d2e1da130a8f21"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0015
source_work: Menexenus
outer_turn_id: turn_menexenus_0032
stephanus_span: "242e-243e"
char_span:
  start_char: 16971
  end_char: 18939
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "8e8ec1d8a2b9effff478679453a158480d664c1066ecff128a11763b11828b63"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 16971
    end_char: 16974
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0016
source_work: Menexenus
outer_turn_id: turn_menexenus_0032
stephanus_span: "242e-243e"
char_span:
  start_char: 16975
  end_char: 18939
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "f0b4afc076433a803e3c8dcfd23c4f0b5f30521148f063ed6c88fefb8734cf82"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0017
source_work: Menexenus
outer_turn_id: turn_menexenus_0033
stephanus_span: "243e-244e"
char_span:
  start_char: 18939
  end_char: 20931
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "8c361a7a084a3c665ed6f525102cd9ccada0e29ad740f6d3dbb5af6eef225dba"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 18939
    end_char: 18942
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0018
source_work: Menexenus
outer_turn_id: turn_menexenus_0033
stephanus_span: "243e-244e"
char_span:
  start_char: 18943
  end_char: 20931
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "bc38c1719c9544e37081040c64164b7e523b6251517ffa7a78cc4662b4ae6fa4"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0019
source_work: Menexenus
outer_turn_id: turn_menexenus_0034
stephanus_span: "244e-245e"
char_span:
  start_char: 20931
  end_char: 22923
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "d4e1fe27832ee6da156f221cbf19eedf458f37fa64b77a2887ec4fdb61f53545"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 20931
    end_char: 20934
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0020
source_work: Menexenus
outer_turn_id: turn_menexenus_0034
stephanus_span: "244e-245e"
char_span:
  start_char: 20935
  end_char: 22923
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "31a33df456a1458a30ed25bf903ce6b27fe0afcbae5781a70e700e9c39b61e93"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0021
source_work: Menexenus
outer_turn_id: turn_menexenus_0035
stephanus_span: "245e-246e"
char_span:
  start_char: 22923
  end_char: 25032
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "54ab6502ef2e0fcfa8dfe04beade22821ec2a3e8b6625e993976af8d678b7746"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 22923
    end_char: 22926
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0022
source_work: Menexenus
outer_turn_id: turn_menexenus_0035
stephanus_span: "245e-246e"
char_span:
  start_char: 22927
  end_char: 25032
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "6ad4b869a27d3a9238301abc56b32488795f94a02024088991bb39995c4607f1"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
limits: "The father's direct address begins below this Aspasia frame at 246d."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0023
source_work: Menexenus
outer_turn_id: turn_menexenus_0035
stephanus_span: "246d-246e"
char_span:
  start_char: 24221
  end_char: 25031
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "aaa862cc24ed3f142e166d2c997f9575766c8b34955813158e4d37de9b8f0ee8"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 3
resolution: unresolved
unresolved_reason: "The direct address is attributed to the plural πατέρες and resumed as ἐκεῖνοι; it has no single registered terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0024
source_work: Menexenus
outer_turn_id: turn_menexenus_0036
stephanus_span: "246e-247e"
char_span:
  start_char: 25032
  end_char: 27020
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "6f39c8894b1fada980df690587fbf2dea41ae63ef0b0678e76fc3f42abb13e05"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 25032
    end_char: 25035
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0025
source_work: Menexenus
outer_turn_id: turn_menexenus_0036
stephanus_span: "246e-247e"
char_span:
  start_char: 25036
  end_char: 27020
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "a74c194f4fa0278c062b7f49d8a18e7534108cc584b89d2f1324c32194b05476"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0026
source_work: Menexenus
outer_turn_id: turn_menexenus_0036
stephanus_span: "246e-247e"
char_span:
  start_char: 25036
  end_char: 27019
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "ea694dab2071df3894bed6c4429817b59012df74269f23094d5d0277f66f8a7d"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 3
resolution: unresolved
unresolved_reason: "The sustained direct address remains the plural πατέρες/ἐκεῖνοι voice, not a single registered terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0027
source_work: Menexenus
outer_turn_id: turn_menexenus_0037
stephanus_span: "247e-248e"
char_span:
  start_char: 27020
  end_char: 28956
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "ccfb2d89375b19df001b2e58b180a8c71781fdd86c9af0b6fee52b14f4f0e907"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 27020
    end_char: 27023
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0028
source_work: Menexenus
outer_turn_id: turn_menexenus_0037
stephanus_span: "247e-248e"
char_span:
  start_char: 27024
  end_char: 28956
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "9fcd002634bfe688a7b0ac08964b9dc58df98b90f7ce9c49ad8cbbc96ee50658"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0029
source_work: Menexenus
outer_turn_id: turn_menexenus_0037
stephanus_span: "247e-248d"
char_span:
  start_char: 27024
  end_char: 28603
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "17e2283927442002b841628bddffce6f3760f8ff3e33ff62d4186060c21c6914"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 3
resolution: unresolved
unresolved_reason: "The sustained direct address remains the plural πατέρες/ἐκεῖνοι voice, not a single registered terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0030
source_work: Menexenus
outer_turn_id: turn_menexenus_0038
stephanus_span: "248e-249d"
char_span:
  start_char: 28956
  end_char: 30446
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "6949b2e2fe8f284b5f8690aa6c4f3693b0e25b1bcc9b5a5668d1539346830793"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 28956
    end_char: 28959
review_status: accepted
```

```yaml
voice_id: voice_menexenus_0031
source_work: Menexenus
outer_turn_id: turn_menexenus_0038
stephanus_span: "248e-249c"
char_span:
  start_char: 28960
  end_char: 30375
source_path: raw/plato/greek/menexenus.txt
source_sha256: "e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007"
span_sha256: "1041425a5e137962f0decd326210e5c1a35312d3dee11030343a93a787983e9c"
voice_chain: ["ΣΩ.", "ΑΣΠ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. "
    start_char: 4590
    end_char: 4660
  - kind: formula_bounded_continuation
    text: "οὗτός σοι ὁ λόγος, ὦ Μενέξενε, Ἀσπασίας τῆς Μιλησίας ἐστίν."
    start_char: 30386
    end_char: 30445
limits: "The 249d formula follows this direct segment and names Aspasia as the λόγος owner."
review_status: accepted
```
