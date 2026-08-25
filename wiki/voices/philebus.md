# Philebus — Voice Ledger

Greek-only reported-speech structure for the five outer turns marked required in
`wiki/reported-turn-scopes.json`: `turn_philebus_0540`, `turn_philebus_1070`,
`turn_philebus_1072`, `turn_philebus_1074`, and `turn_philebus_1075`.

All ten records are accepted as five atomic cohorts under
`wiki/review/2026-08-16-philebus-reported-turn-acceptance.md`. The ledger keeps
indefinite and collective staged speakers unresolved; it does not activate a
voice cutover or create a voice join.

## Records

```yaml
voice_id: voice_philebus_0001
source_work: Philebus
outer_turn_id: turn_philebus_0540
stephanus_span: "38c-38d"
char_span:
  start_char: 54962
  end_char: 55139
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "cb81179dbc2c24686f25e356b119705e8666f720e3de0b45c78f06357bee6148"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 54962
    end_char: 54965
limits: "The printed siglum opens Socrates' outer turn; it does not assign the bounded hypothetical self-question below to him."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0002
source_work: Philebus
outer_turn_id: turn_philebus_0540
stephanus_span: "38c-38d"
char_span:
  start_char: 54966
  end_char: 55051
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "9226c942544ff8e832863a6a63c9f0270389d0f71144214874ab810e1588db50"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The unmarked question is directly staged for indefinite τις by the surrounding αὐτὸς αὑτὸν … ἀνέροιτ’ ἂν and ταῦτ’ εἰπεῖν ἄν τις; no named or registered terminal owner is supplied."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0003
source_work: Philebus
outer_turn_id: turn_philebus_1070
stephanus_span: "63b-63c"
char_span:
  start_char: 104146
  end_char: 104438
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "e4d5ec0719c64a3cb9ba2db37d9b0cbe049cd0f48908b94a4e0a6cf523860308"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 104146
    end_char: 104149
limits: "The printed siglum frames the direct reply quoted below; it does not make the plural staged reply Socrates' own speech."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0004
source_work: Philebus
outer_turn_id: turn_philebus_1070
stephanus_span: "63b-63c"
char_span:
  start_char: 104180
  end_char: 104437
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "d9666573144a80b405d69517279d3785782b8ce9fca7d066301431a4c0a3e5c5"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The q-bounded reply is staged for the plural pleasures by the immediately preceding αὐτὰς … λέγειν construction. The source supplies no single registered terminal owner, so it cannot resolve to the printed ΣΩ."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0005
source_work: Philebus
outer_turn_id: turn_philebus_1072
stephanus_span: "63c"
char_span:
  start_char: 104491
  end_char: 104719
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "31f47e5ced86986e721ce011573d94b27c6246cf55ba33f22c032a7d2e67533c"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 104491
    end_char: 104494
review_status: accepted
```

```yaml
voice_id: voice_philebus_0006
source_work: Philebus
outer_turn_id: turn_philebus_1072
stephanus_span: "63c"
char_span:
  start_char: 104671
  end_char: 104718
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "db06649acd62fd75069a4c90c67715856c3140f594588c49767d2b28e7b048ca"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The two q-bounded pieces and intervening φαῖεν ἂν ἴσως form one reply by the plural νοῦς-and-φρόνησις pair. No individual terminal owner is named or registered."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0007
source_work: Philebus
outer_turn_id: turn_philebus_1074
stephanus_span: "63d-63e"
char_span:
  start_char: 104731
  end_char: 105239
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "ee6c00fb7560dc947a53a5c9900f4a3d2a32286e3de094afab4a24ebb088502e"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 104737
    end_char: 104740
review_status: accepted
```

```yaml
voice_id: voice_philebus_0008
source_work: Philebus
outer_turn_id: turn_philebus_1074
stephanus_span: "63d-63e"
char_span:
  start_char: 104931
  end_char: 105238
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "13bf2f7006e0a3030507479465441c35afd6246badb1f298039ccdcac51d67f7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The answer's ὦ Σώκρατες excludes the printed speaker, but its ἴσως φαῖεν ἄν is plural and supplies no single terminal owner."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0009
source_work: Philebus
outer_turn_id: turn_philebus_1075
stephanus_span: "63e-64a"
char_span:
  start_char: 105239
  end_char: 105920
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "d326b0e5f879729bf95b7bf130c1b30366c352ed19da513f7a33b2f4cdecfbea"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 105239
    end_char: 105242
limits: "The printed siglum opens Socrates' outer turn; the q-bounded answer below ends before his closing attribution."
review_status: accepted
```

```yaml
voice_id: voice_philebus_0010
source_work: Philebus
outer_turn_id: turn_philebus_1075
stephanus_span: "63e-64a"
char_span:
  start_char: 105243
  end_char: 105790
source_path: raw/plato/greek/philebus.txt
source_sha256: "8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807"
span_sha256: "5dcac632976b14e4691525907f0ce20b961dc4b3db0735c3b3924cf9d77e6c30"
voice_chain: ["ΣΩ.", "ΝΟΥΣ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: "τὸν νοῦν φήσομεν ὑπέρ τε αὑτοῦ καὶ μνήμης καὶ δόξης ὀρθῆς ἀποκρίνασθαι"
    start_char: 105833
    end_char: 105903
limits: "The q-bounded quotation stops before Socrates' afterword, whose closing formula identifies νοῦς as the answerer."
review_status: accepted
```
