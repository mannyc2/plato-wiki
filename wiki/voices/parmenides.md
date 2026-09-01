# Parmenides — Voice Ledger

Canonical reported-speech curation for the single unlabelled outer turn.
The source establishes Cephalus as the frame narrator, then explicitly
transmits Antiphon's account of Pythodorus's account. The records below retain
that source-attested narration chain without assigning any of the direct
dialogue inside it by doctrinal content, style, or alternation.

The sole outer-turn cohort remains unreviewed while the Greek direct-speech
spans below the Pythodorus frame are curated together. Nothing here activates a
claim-speaker cutover.

## Records

```yaml
voice_id: voice_parmenides_0001
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126a-166c
char_span:
  start_char: 0
  end_char: 85707
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
voice_chain:
  - ΚΕΦ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: unlabelled_turn_frame
    role: cue
    text: ὦ Κέφαλε
    start_char: 164
    end_char: 172
limits: The printed turn speaker is the metadata literal (none). Adeimantus's vocative identifies the first-person frame narrator as Cephalus; the frame owns narration only.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0002
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126a
char_span:
  start_char: 152
  end_char: 223
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 32c30007a2ca0ca2abd210f6d568574d2a223fe43d0d7d7d9599d00359bcf4c1
voice_chain:
  - ΚΕΦ.
  - ΑΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Ἀδείμαντος, Χαῖρ’, ἔφη
    start_char: 138
    end_char: 162
limits: The named formula straddles the first word of Adeimantus's greeting and identifies its speaker without relying on the immediately following vocative.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0003
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126a
char_span:
  start_char: 226
  end_char: 295
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 134ca757595c8d00c2006fc0a6209514a8069de43c510fb79916ab28d1c0086a
voice_chain:
  - ΚΕΦ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον ἐγώ
    start_char: 240
    end_char: 249
limits: Cephalus reports his own bounded answer inside the Cephalus frame; the adjacent repeated terminal is licensed by the first-person reporting formula.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0004
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126a-126b
char_span:
  start_char: 298
  end_char: 334
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: c483a52f44bb1d595b2d5d9f75592af2d1f738e65c8ea7ca6eddd25f1a69feaa
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The bare ἔφη transmits a direct prompt but supplies no independently licensed terminal owner; the earlier named Adeimantus formula is not carried forward.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0005
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126b
char_span:
  start_char: 337
  end_char: 548
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 5b2677529bdc24f20306107eaba13fcbd762edc313ee1814f6c6e5583cfe37c3
voice_chain:
  - ΚΕΦ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: καὶ ἐγὼ εἶπον
    start_char: 338
    end_char: 351
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0006
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126b
char_span:
  start_char: 551
  end_char: 566
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d8aa35fb9780da39b69a32fcb2cf8dac9531f4c35b1c1f243301e139a0d01aa3
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The brief assent is followed only by bare ἔφη; its owner is not separately licensed by the Greek.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0007
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126b
char_span:
  start_char: 569
  end_char: 582
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 9af458bc5cdb2e7ef8bec1ca7c089c756545691a65aa299ca9d3be38a8fdcfea
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The question is bounded direct speech, but the source gives neither a name nor a reporting formula for its owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0008
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126b
char_span:
  start_char: 585
  end_char: 620
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 79cdb27a173b95f103ddee3e81ee24d8ed6cfcb88d364578f3c968d96868696f
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The answer and follow-up question carry no owner-bearing formula; the surrounding exchange cannot license a terminal owner by alternation.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0009
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126b-126c
char_span:
  start_char: 623
  end_char: 884
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0647e2707f102f1a88a2a02781f3645f076348ead380328caf97910602486f2b
voice_chain:
  - ΚΕΦ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον ἐγώ
    start_char: 630
    end_char: 639
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0010
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126c
char_span:
  start_char: 887
  end_char: 908
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 761314bffc3d6b4af088eac9e1945667b017b6ceda02a31468dea9fbef4af12a
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The direct assent is introduced only by bare ἔφη, so its owner remains unlicensed.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0011
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126c
char_span:
  start_char: 911
  end_char: 953
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 93536ae50e60eb083d3d74dab0deba2e413ad2236167b6144d69a6fbdc7b4b3e
voice_chain:
  - ΚΕΦ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 927
    end_char: 932
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0012
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 126c-127a
char_span:
  start_char: 956
  end_char: 1198
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 42436ab0d6ef733fabddb21877e8f62003a7e0607dc0cb0472823bf1066c2a91
voice_chain:
  - ΚΕΦ.
depth: 2
resolution: unresolved
unresolved_reason: The invitation is direct speech introduced only by bare ἔφη; no named or person-marked owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0013
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 127a-166c
char_span:
  start_char: 1549
  end_char: 85707
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: c81d3b58470bb55d770407d22b0d9b94c37d88d411fd2950ea37603e52a2452c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη δὲ δὴ ὁ Ἀντιφῶν λέγειν
    start_char: 1549
    end_char: 1575
limits: Cephalus reports Antiphon as the narrator of the account beginning here. This record does not identify the owners of the direct dialogue nested below it.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0014
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 127a-166c
char_span:
  start_char: 1593
  end_char: 85707
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2dc8403e4ccd12df685e31d933d16a246ca9708757c732662342e4ae0cb6eaff
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: λέγειν τὸν Πυθόδωρον
    start_char: 1569
    end_char: 1589
limits: Antiphon's report names Pythodorus as the speaker of the account. The nested direct dialogue begins later and retains separate records.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0015
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 127e
char_span:
  start_char: 2693
  end_char: 2897
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 84c7eece6ebc3815e911115bb31e9ebbf31af7340d29fbce30713d737dad24d9
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: τὸν οὖν Σωκράτη ἀκούσαντα πάλιν τε κελεῦσαι τὴν πρώτην ὑπόθεσιν τοῦ πρώτου λόγου ἀναγνῶναι, καὶ ἀναγνωσθείσης, {127e} πῶς, φάναι
    start_char: 2575
    end_char: 2703
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0016
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 127e
char_span:
  start_char: 2900
  end_char: 2925
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6b7d5eea1a583b66803ac267163683421bfa5250c7dfe78280bb351eba3b348b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΖΗΝ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: οὕτω, φάναι τὸν Ζήνωνα
    start_char: 2901
    end_char: 2923
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0017
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 127e-128a
char_span:
  start_char: 2928
  end_char: 3371
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0bdb992a7dff0016726e976b6bdf3a66512aca484c60cfe68e136d55a709d61e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0018
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 128a
char_span:
  start_char: 3374
  end_char: 3445
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: cfcb67a3bf77e57bd66d1b21bcc1a69f97238f4fb4ef2d9ec5927a1a5413fa5a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΖΗΝ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: οὔκ, ἀλλά, φάναι τὸν Ζήνωνα
    start_char: 3375
    end_char: 3402
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0019
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 128a-128b
char_span:
  start_char: 3448
  end_char: 4053
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2a55fde993397b898c010108ad2d928c4e30f70e233063600d923e9a46b445a0
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: μανθάνω, εἰπεῖν τὸν Σωκράτη
    start_char: 3449
    end_char: 3476
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0020
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 128b-128e
char_span:
  start_char: 4056
  end_char: 5203
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: bf591c23e8b3f4f985c210b66ebc3a28c7bfbfb9cbfb10bcdbce77514e159c7b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΖΗΝ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ναί, φάναι τὸν Ζήνωνα
    start_char: 4057
    end_char: 4078
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0021
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 128e-130a
char_span:
  start_char: 5206
  end_char: 7504
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b11c0f6d6e50c5b0b0b20cb3a182269126b3e77102a8d7acf058a5a6e26846ee
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἀλλ’ ἀποδέχομαι, φάναι τὸν Σωκράτη
    start_char: 5207
    end_char: 5241
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0022
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130a-130b
char_span:
  start_char: 7818
  end_char: 8117
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f8160f40fdbd79d5ad55f339cfdc42aa496b3d7c52a45b5b717f579e7fb18506
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: εἰπεῖν τὸν Παρμενίδην
    start_char: 7783
    end_char: 7804
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0023
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130b
char_span:
  start_char: 8120
  end_char: 8148
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3e50b7a77c09ca02c75b435e9150d1f566c38d7f5e2017d705c8f16d28dc5a01
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔμοιγε, φάναι τὸν Σωκράτη
    start_char: 8121
    end_char: 8146
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0024
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130b
char_span:
  start_char: 8151
  end_char: 8279
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f112d0f1cb3fba26a03eb8bd7d1a75089ec201d3be56987b877f9f57429f7506
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἦ καὶ τὰ τοιαῦτα, εἰπεῖν τὸν Παρμενίδην
    start_char: 8152
    end_char: 8191
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0025
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130b-130c
char_span:
  start_char: 8282
  end_char: 8302
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6432eb5af51f7db7c3a3eb96eeb7abd2aa2fce53878c994ede31de7937dbc2ba
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0026
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130c
char_span:
  start_char: 8305
  end_char: 8417
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e5339f7ee96c0b7eba3f48518762478858f39ad07ceb25263ce07822fde5aa78
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0027
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130c
char_span:
  start_char: 8420
  end_char: 8529
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: fa5f954db991947c5326141f2c9351ce02f369af987d3962086687c65a7e2b48
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0028
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130c-130d
char_span:
  start_char: 8532
  end_char: 8800
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: bbe7358d282cdfe416d475961a7169fa41426d8c8f673b0f2f029da78ddfda1e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0029
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130d-130e
char_span:
  start_char: 8803
  end_char: 9189
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 7f8dbc1e7bcfa2069309dbbd782ea17e2d7ca1cacba2bbfbac3a8ea09e858713
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: οὐδαμῶς, φάναι τὸν Σωκράτη
    start_char: 8804
    end_char: 8830
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0030
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 130e-131a
char_span:
  start_char: 9192
  end_char: 9641
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8b99dca1fabd6a106ed0d0697cd56592e5c21a07b4f210ee4e49ec201f518a91
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: νέος γὰρ εἶ ἔτι, φάναι τὸν Παρμενίδην
    start_char: 9193
    end_char: 9230
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0031
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131a
char_span:
  start_char: 9644
  end_char: 9673
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 37e1e575dc2dd6bebbb0f26a6f53c7dd8b37195e7d511a8928658c77646295db
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πάνυ γε, φάναι τὸν Σωκράτη
    start_char: 9645
    end_char: 9671
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0032
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131a
char_span:
  start_char: 9676
  end_char: 9798
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f386346f40f92126ca54bd35639554d47cd861bc4363d1b3ca2934a996112dba
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0033
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131a
char_span:
  start_char: 9801
  end_char: 9821
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a5a003d8d13111ed7b7339f531effa17a102e6ccaa60e45c904c60757ece3e31
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0034
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131a
char_span:
  start_char: 9824
  end_char: 9902
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b461125b8daca8aa8a4eb7440343a516eb9ceee353fa84260d35c42eb9ca853a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0035
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131a-131b
char_span:
  start_char: 9905
  end_char: 9984
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: c74742d9d648d8d826f3dd3b2d99f22ead5bd28e336757354fafc72e1d3aa366
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: τί γὰρ κωλύει, φάναι τὸν Σωκράτη
    start_char: 9906
    end_char: 9938
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0036
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131b
char_span:
  start_char: 9987
  end_char: 10089
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 62eece421c65882ef3cace628f6dc6fc1b7d5137f241a6fbcdf7006019b4f2c4
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0037
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131b
char_span:
  start_char: 10092
  end_char: 10299
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: fc1e2ddd383b08376e690b82b92f5677fb4909f64b167871a269aa1f35552e18
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0038
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131b-131c
char_span:
  start_char: 10302
  end_char: 10476
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 08e14088333f0080b17ae4961efea6b2a8ccf69d3f22360a83170120c2a14159
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0039
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10479
  end_char: 10493
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 87dfdcaeb70c704b41d489ac5df317988a2ad9f55876b701e726f02063a4b17d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0040
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10496
  end_char: 10566
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2d37bb50f37acbd3c91b16ce61491f1196e87fabaecd93d280962b98c9498b7d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0041
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10569
  end_char: 10577
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0b08358483dfc936c17e4c8f65ccabd232a164c3e1e3aac5132329cc9b8faee8
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0042
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10580
  end_char: 10729
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: c5cc2f4df7b3e221227a587bff936bedd7fb27eda7beb03b85df604f1ff88c09
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0043
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10732
  end_char: 10751
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f2b6fb015465b6036dd9dfffa576a7dbbf4c1b5c28ff2e8365164c5ae1b79711
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0044
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10754
  end_char: 10848
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 4d468a1df7d1708dec7f59c35784ec8d0b5b77abd271d6081a95f3b077f3d6a4
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0045
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c
char_span:
  start_char: 10851
  end_char: 10869
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 10efe306aabe4d7769009db9b6430335aa073f4b1d7777e336071ebe5fb8c2a6
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0046
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131c-131d
char_span:
  start_char: 10872
  end_char: 11036
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 556bb74b8c191f0feb2139e99cb889fe65c2cb134b0761c800ea55072390aa7c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0047
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131d
char_span:
  start_char: 11039
  end_char: 11054
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b12ce408b5c5d1c903cba28f0539b27a89aeb9b63498aed4225612306d575ec2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0048
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131d
char_span:
  start_char: 11057
  end_char: 11167
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 71ce8dd6b41e550ca070e362883861fe859d45d0073a2faba7add8e6c29ffaf5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0049
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131d
char_span:
  start_char: 11170
  end_char: 11181
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6714dd5330a24250dd298c0fe7c06db33a4d000806741e18d2065d9659189e2d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0050
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131d-131e
char_span:
  start_char: 11184
  end_char: 11415
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 11f65f842d964bd9809f252f315c0dfb9212824ca1d4a4d126111a0ae503b8b3
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0051
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131e
char_span:
  start_char: 11418
  end_char: 11452
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0e3b437ad719411ea7a998128b86403b4d98b6e388f6ff4cf232e61c0c40d7ec
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0052
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131e
char_span:
  start_char: 11455
  end_char: 11581
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a58234323846af1b9e6114a7007a7fd7d55ec13f97346f5f822c1722a069047b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0053
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131e
char_span:
  start_char: 11584
  end_char: 11667
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: ebcce5f00e94a3fe35b29a2a1e4118ded6c66c061a27e5419880b1d3feab4d3f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0054
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131e
char_span:
  start_char: 11670
  end_char: 11702
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: dc5eef021980d5fe97f5b433acae35b453241b5c03f7ad7427551b056ceb5680
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0055
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 131e-132a
char_span:
  start_char: 11705
  end_char: 11723
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d0bfe1251dc84023dc8dcde2d21613d434951bb55ad220e24f85a6241e5a4e10
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0056
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132a
char_span:
  start_char: 11726
  end_char: 11904
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f6387a65c036b9ec4363a03ac3e966d1607b9dfd0f50fc481685f0e457ceeb27
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0057
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132a
char_span:
  start_char: 11907
  end_char: 11929
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 29068722e1e53ba9b760fe49bffe75d2ec8a0229dbf84fa2d36641a2ac1532af
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0058
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132a
char_span:
  start_char: 11932
  end_char: 12070
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 71b23e0d5cb2dfde7fd295124a2b9bd77aded072f67a0df07cf68fcc22b4643f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0059
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132a
char_span:
  start_char: 12073
  end_char: 12082
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 943ef1cb02a7da0072ae38e5a0e74e23b95da84c8b6f0b7337774abae9391a69
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0060
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132a-132b
char_span:
  start_char: 12085
  end_char: 12317
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 1cefa4aa2635867aae241cf16f991eb2fff395af2ee7c116b3e499c9d47268d9
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0061
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132b
char_span:
  start_char: 12320
  end_char: 12523
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a1e99a02ddc7395a5f415c6468ef29399f8ef1bd1f1de1e013d405869f398d9a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἀλλά, φάναι, ὦ Παρμενίδη, τὸν Σωκράτη
    start_char: 12321
    end_char: 12358
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0062
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132b
char_span:
  start_char: 12526
  end_char: 12590
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 08d741eefa642e5d435211d9222229a21af5409ab88b0361532d025e3fd4282c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0063
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132b
char_span:
  start_char: 12593
  end_char: 12617
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b25a08e4303523883462cb9d1f53373175fe6c7f3a058da3cc1a0a233556cd51
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0064
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132b
char_span:
  start_char: 12620
  end_char: 12633
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: da1d6c9578ae3152f0d765924deca01c10b5ad9e51940c82eb432e2de20e1db6
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0065
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132b-132c
char_span:
  start_char: 12636
  end_char: 12649
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0d143a90df1a53890ee41c7835e73ee62a960a98064d60dc890b76b14f3527b3
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0066
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12652
  end_char: 12672
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 7f300ab10c2af7abb0aa8d5a78269843eddf35129d79ab129d741557172a7023
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0067
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12675
  end_char: 12683
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: da9d8f09ea8e8eba81ad550d538da8db5318855087a5ae76664c7cf9f6c97494
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0068
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12686
  end_char: 12765
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0a001c24e61ba1e23ac45ffc9a2779e4b40e73dd472102fb43c85a00abe6936f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0069
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12768
  end_char: 12774
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0cf8aff54ea31883d3c956d0b06a04df746f7d4b43b78b0d9e07f0e6d2d0e6e5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0070
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12777
  end_char: 12854
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 15a43b076b1ab0b68a76c9c15dee1d6785233b67d4931f911cb2c104e863028c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0071
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12857
  end_char: 12878
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 245dc643d972cdabfc805f09935ad57a0cb468cbb431a7524d0c9e18a1313cc5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0072
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c
char_span:
  start_char: 12881
  end_char: 13041
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6967b681fd5cd45615130aecc40bcb8a53f45563f8e60f88d96bc560e5f9900f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: τί δὲ δή; εἰπεῖν τὸν Παρμενίδην
    start_char: 12882
    end_char: 12913
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0073
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132c-132d
char_span:
  start_char: 13044
  end_char: 13338
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b72c33f37894f5b654c6c7654b933eb22225bc5c6a639fc2dba7e84446e827ce
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0074
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132d
char_span:
  start_char: 13341
  end_char: 13507
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a71811c33ea3b8b9088fd26fc30b5443708e1f67c02686125fc99c7a9f62dc3e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0075
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132d
char_span:
  start_char: 13510
  end_char: 13521
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 7b190fd6fcac91b4372f02ecc7c93c3c1e4bfddbef316ec1cdbe02fa9c18d40d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0076
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132d-132e
char_span:
  start_char: 13524
  end_char: 13620
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3a548d4a0f1063ce185b77cca473d9aeeebdc23cadc871858f9d3a29c9aac367
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0077
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132e
char_span:
  start_char: 13623
  end_char: 13632
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e45fd18b5a3e8d10b9554dfce56e2320b80978e52658e5cd2048cb7718a2f644
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0078
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132e
char_span:
  start_char: 13635
  end_char: 13705
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f746d2cfaad69ad3a2682649019c419809965805f2f6cbf7aa4d886e1e9dcc04
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0079
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132e
char_span:
  start_char: 13708
  end_char: 13728
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: abb0379320bd0402d01b9585a44c42d3647ade8807a2801a4a31d2c617b75e6b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0080
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 132e-133a
char_span:
  start_char: 13731
  end_char: 13993
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 03f1396ca8e476cf6dd40f8964952b9b412ffae146f7244100431f1a5a9b8665
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0081
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a
char_span:
  start_char: 13996
  end_char: 14016
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2d11c17637f2c0f8dd9bb5015a3679af840347000e30e89435d9a1b673a0a775
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0082
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a
char_span:
  start_char: 14019
  end_char: 14108
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a4a25a9c966e0ec554f319280873556afd59afbaebe6b176751ef5ed49b8436a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0083
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a
char_span:
  start_char: 14111
  end_char: 14120
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 943ef1cb02a7da0072ae38e5a0e74e23b95da84c8b6f0b7337774abae9391a69
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0084
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a
char_span:
  start_char: 14123
  end_char: 14214
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8ab444efc33af0076c586e4ce4846bc203ba446e18627781aff45804fb1e6944
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0085
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a
char_span:
  start_char: 14217
  end_char: 14228
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0bd79142a06e362770162690f7665209f766797031e40c41442970372d03b242
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0086
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133a-133b
char_span:
  start_char: 14231
  end_char: 14377
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d7c43926f8a9ad4843d43014eed08ee3486bc8e46ba58195b49457aee8fa3b77
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0087
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133b
char_span:
  start_char: 14380
  end_char: 14397
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 12e1204327379afa51804f3c793af85fa2d1da3b53d8973b93b31816cd758a7f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0088
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133b-133c
char_span:
  start_char: 14400
  end_char: 14789
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: fd453dddd786713d0126a8cbb10dd4f37da364c6323e949166951d046e53d4eb
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0089
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133c
char_span:
  start_char: 14792
  end_char: 14832
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: ee93720f5a453c322ee2c2abaf0f782a44a8cfd9b13896302d919dcbb43635c3
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πῇ δή, ὦ Παρμενίδη; φάναι τὸν Σωκράτη
    start_char: 14793
    end_char: 14830
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0090
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133c
char_span:
  start_char: 14835
  end_char: 14993
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 446116079e1db659cad465cee1273fe77ec0f78722416978f89c41c0ca974809
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0091
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133c
char_span:
  start_char: 14996
  end_char: 15052
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0b97e620eb4851fa7c93e40d8ff96a40b90d4d3f752ca7ffb29e276e7d871e43
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πῶς γὰρ ἂν αὐτὴ καθ’ αὑτὴν ἔτι εἴη; φάναι τὸν Σωκράτη
    start_char: 14997
    end_char: 15050
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0092
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133c
char_span:
  start_char: 15055
  end_char: 15078
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2b022929ec67cd638c115ea612a7f72aebe4d8bd303cc9a3dff3c87c32289fcd
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0093
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133c-133d
char_span:
  start_char: 15081
  end_char: 15443
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 58d59d431025b2446ba51123c0d45400abdf3ea15b341695580923a095c20bb1
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0094
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133d
char_span:
  start_char: 15446
  end_char: 15478
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 429ac5518253f5c9b254ded7330f8a6084f23017cd5cb0f5ec971da32796eb07
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πῶς λέγεις; φάναι τὸν Σωκράτη
    start_char: 15447
    end_char: 15476
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0095
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 133d-134a
char_span:
  start_char: 15481
  end_char: 16016
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 345d31646f96dc3bc86c1b3cc0bc4d5301c127df91dd5e367f362f6717534633
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: οἷον, φάναι τὸν Παρμενίδην
    start_char: 15482
    end_char: 15508
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0096
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a
char_span:
  start_char: 16019
  end_char: 16058
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 76955d87f8f19415e4832f058f239271324a3e556fbfe38d57743174c4d14ccb
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πάνυ γ’, εἰπεῖν τὸν Σωκράτη
    start_char: 16020
    end_char: 16047
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0097
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a
char_span:
  start_char: 16061
  end_char: 16166
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f64a211c5a278c2792b0c2ec3de28aa4eba6621a42c65d088c9e4d25f8ea0f2e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0098
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a
char_span:
  start_char: 16169
  end_char: 16179
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: cf74f3df94e7f4ec712377dd8f3d5f8c187297dbadcb55633d6e1cc0ae74de2e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0099
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a
char_span:
  start_char: 16182
  end_char: 16271
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 99ee6eb16b143872981a4855f8a04ef0f9270d50036d2068a57c6cb4c5d6c74a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0100
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a
char_span:
  start_char: 16274
  end_char: 16280
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0cf8aff54ea31883d3c956d0b06a04df746f7d4b43b78b0d9e07f0e6d2d0e6e5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0101
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134a-134b
char_span:
  start_char: 16283
  end_char: 16441
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e790d81ad3f0fc5dbeb772b5ce542243dceed73dbb502c8d5922683dd53e2b0d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0102
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16444
  end_char: 16453
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e45fd18b5a3e8d10b9554dfce56e2320b80978e52658e5cd2048cb7718a2f644
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0103
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16456
  end_char: 16539
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8c2cc0d908c6ec30df76acd25e86661e0a95e37525d613e2750997d808f0f938
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0104
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16542
  end_char: 16555
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 20935bdf840cb379ff8080df59ca3e7581a665afa32773dccb06ea3f29c3d14c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0105
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16558
  end_char: 16649
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3e6cc2b6a54ed55193277bae4fd7ade6b18dc05bb5ae9ca025bf13064acac84b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0106
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16652
  end_char: 16658
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0cf8aff54ea31883d3c956d0b06a04df746f7d4b43b78b0d9e07f0e6d2d0e6e5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0107
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16661
  end_char: 16685
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3abc71836d2aa4b1f8cd8a10e5ad2ad73f5af42c3dddec47d485e9f3e5a79fbc
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0108
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16688
  end_char: 16697
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3a8c6e8ecdec4406c6141284ae1afdbc4cd2932a4131949da5edd16dae93b09b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0109
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16700
  end_char: 16787
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 578d8c65ff81fd0064f7e984c58df8b0bf98d6468a7f48289551786afe5b4b73
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0110
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b
char_span:
  start_char: 16790
  end_char: 16803
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 501548f89b4df269dc1cbf0b4481f1ca1956357b7c23eb5939d33b39f72a6f60
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0111
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134b-134c
char_span:
  start_char: 16806
  end_char: 16922
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: eab9f84a37aa66c107e0f24124f7237d6627bdce7c195a9ba53012819759e17b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0112
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 16925
  end_char: 16938
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 458bcdf62a313f8468f8a8752f82026d804e6a6fac030d5251e5565bbeabd888
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0113
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 16941
  end_char: 16977
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 03fca6f1c8a057ae4d1f4e47fd337becadeb81d6a4f3c4af3cbe84bd1c10115b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0114
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 16980
  end_char: 16991
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 59b5c4e5f776dab0059f177f1e10040188d89e9bfd30c3b92e46279ecc514808
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0115
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 16994
  end_char: 17135
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 71678ddbd6beae0b40718151873bc9ea96d4fe9064a45f82e87986a9d234876e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0116
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 17138
  end_char: 17144
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0cf8aff54ea31883d3c956d0b06a04df746f7d4b43b78b0d9e07f0e6d2d0e6e5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0117
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c
char_span:
  start_char: 17147
  end_char: 17260
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 49b320185c19b7057c23e0ba1050c673e18cc0b3a6906383ef872b4437c98d25
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0118
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134c-134d
char_span:
  start_char: 17263
  end_char: 17279
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3ecb77d9a1fe3b4f5fbd1dad8398bd646443cc3eafa5c21f09bfd9dedeea9a82
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0119
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134d
char_span:
  start_char: 17282
  end_char: 17361
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: bc759785d4474dc2b22899439dd59a958a135ecdc5b5c305fa6ec21e8efeacdf
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0120
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134d
char_span:
  start_char: 17364
  end_char: 17376
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 5c06a04617fde64ddb30a881975264a2214d407f2bb6844077ba9f1069f522f2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0121
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134d
char_span:
  start_char: 17379
  end_char: 17557
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 241c1859c16bb9cc4ace36db3c40aed24fa665394355e588d94d1a1e4a36f144
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὅτι, ἔφη ὁ Παρμενίδης
    start_char: 17380
    end_char: 17401
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0122
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134d
char_span:
  start_char: 17560
  end_char: 17577
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 094cc644adc6a338aaff3cf811b249e3e748774f15a235bce0c5bcf9685887c2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0123
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134d-134e
char_span:
  start_char: 17580
  end_char: 18013
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2738ea60f439c0e1cc8e4ce4a221cf3609b653fe378e49d33056ba56301d4674
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0124
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134e
char_span:
  start_char: 18016
  end_char: 18111
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f84db6ce3377dd38991cade0aa809ed36393464a966be19eac821fad85d61e98
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0125
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 134e-135b
char_span:
  start_char: 18114
  end_char: 18749
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8ecb8e7aee170617113cfa8166b11a9e0cbebf509f92bfe77a20626865623957
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ταῦτα μέντοι, ὦ Σώκρατες, ἔφη ὁ Παρμενίδης
    start_char: 18115
    end_char: 18157
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0126
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135b
char_span:
  start_char: 18752
  end_char: 18827
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f8b329668337fa6313e095abcdd624dd8558ad49dfe8ce81f8f4a5e7e7adb615
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: συγχωρῶ σοι, ἔφη, ὦ Παρμενίδη, ὁ Σωκράτης
    start_char: 18753
    end_char: 18794
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0127
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135b-135c
char_span:
  start_char: 18830
  end_char: 19215
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b594657201697feaa2ee73e31839eb6067858c4c31dfd7118a95e4e13ac50093
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΠΑΡΜ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἀλλὰ μέντοι, εἶπεν ὁ Παρμενίδης
    start_char: 18831
    end_char: 18862
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0128
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135c
char_span:
  start_char: 19218
  end_char: 19240
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 29068722e1e53ba9b760fe49bffe75d2ec8a0229dbf84fa2d36641a2ac1532af
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0129
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135c
char_span:
  start_char: 19243
  end_char: 19306
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3b4acc244415b1e09f69ffd42b1e39fe49a7d72873eb1952bdba68bdc2875e60
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0130
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135c
char_span:
  start_char: 19309
  end_char: 19353
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 9e248ae4d897f87e47f339bb4f5a3cd57a08822793d720e8175e0f76c16c3e21
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0131
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135c-135d
char_span:
  start_char: 19356
  end_char: 19795
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 4447379477d149a2eccb85ee0dbb829ab84930a13e86f0e7f9e06dd1a0cac36e
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0132
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135d
char_span:
  start_char: 19798
  end_char: 19852
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 4a00c6a7994f365cfe9e22c385f90a2f593642d6cfa40fbe5c8fc7fcb217fb9f
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0133
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135d-135e
char_span:
  start_char: 19855
  end_char: 20095
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: bba52d2921cb90365d2b7fdcd612e0d7cf68769fe701f1a1bc8820b3c639e166
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0134
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135e
char_span:
  start_char: 20098
  end_char: 20215
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: aefa194f20b8ffd29d1eccf62819cdbb64b23c830fa20205006542d4db057e1c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0135
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 135e-136a
char_span:
  start_char: 20218
  end_char: 20441
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 436f6bdcd6fa4eec4bef5bf224fd5bcd3587dcc86a3b40f4a49d80d7346e3247
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0136
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136a
char_span:
  start_char: 20444
  end_char: 20464
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: df3beb3bae195c434b10225bfc2afe5800cd9bc9b852d3f331f3df1f21dda1ce
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0137
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136a-136c
char_span:
  start_char: 20467
  end_char: 21482
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 060721ae3226c46d725b5cf7ab63250375e4cac3bd4809ff21223689d09b582a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0138
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136c-136d
char_span:
  start_char: 21485
  end_char: 21632
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8c7a39f59e2a3857db0910febb70b1d822f6c0cf9cec34f917adc443348db74b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0139
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136d
char_span:
  start_char: 21635
  end_char: 21692
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 42d8a7a75e7ff01f0db3793b593d425009f0402772ed5a82b1c1a1e15ed7649a
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0140
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136d
char_span:
  start_char: 21695
  end_char: 21752
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b5104735cb873816e2e864829c616aec7c6643d8eba5530143cb8fc0e22bdfe3
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἀλλὰ σύ, εἰπεῖν τὸν Σωκράτη
    start_char: 21696
    end_char: 21723
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0141
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136d-136e
char_span:
  start_char: 21792
  end_char: 22220
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f3157c750f08d89158bd15ae5e7b2a6b358a6e823d742aec201ba7320426c3b2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΖΗΝ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: καὶ τὸν Ζήνωνα ἔφη γελάσαντα φάναι
    start_char: 21756
    end_char: 21790
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0142
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 136e-137b
char_span:
  start_char: 22419
  end_char: 23117
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 9983f7ac8859e26c369fcbb99fded90a6b142939c2ffe67516751e827ff29927
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The direct Parmenides stretch follows a nested narratorial handoff, but its terminal owner is not licensed here by a local named reporting formula.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0143
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 137b
char_span:
  start_char: 23120
  end_char: 23153
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 753dc4c893a74d9e90e025a04dcfaed09c5600cd84efd116b3e093e76ed15acf
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΖΗΝ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: πάνυ μὲν οὖν, φάναι τὸν Ζήνωνα
    start_char: 23121
    end_char: 23151
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0144
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 137b-137c
char_span:
  start_char: 23156
  end_char: 23329
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6b515712c22c08ba39e5fb10db733b3d15e16d62126799ee23a86452ef28118b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0145
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 137c
char_span:
  start_char: 23332
  end_char: 23454
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f08d54071a2cb7d29dc0c1ff1c09367797a48136ce65df5e914db823367b45e3
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
  - ΑΡΙΣΤ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἕτοιμός σοι, ὦ Παρμενίδη, φάναι, τοῦτο, τὸν Ἀριστοτέλη
    start_char: 23333
    end_char: 23387
review_status: accepted
```
```yaml
voice_id: voice_parmenides_0146
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 137c-137d
char_span:
  start_char: 23457
  end_char: 23929
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: a30c69900d6e1d8ee72234295bdd568cec1283dcba5848546a16317b99e02248
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0147
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 137d-138a
char_span:
  start_char: 23932
  end_char: 24579
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0e8aaa9077eb16e5e7c8ebde9ce28b72444b5d8e0f607c2b1979d724c6a8b3b5
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0148
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 138a-138b
char_span:
  start_char: 24582
  end_char: 25269
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: ccfeb474f51d2e7f58d4d16e934b778f074e95f31ba86da69018b63021aa815c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0149
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 138b-139b
char_span:
  start_char: 25272
  end_char: 27204
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2111d5440a976bbbda3189f99f261289b6b200785a2664af75b62ebbe99843fa
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0150
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 139b-139e
char_span:
  start_char: 27207
  end_char: 28512
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d033191ab9b671b1145a81d6e8551d5bd8fe1230a7d1e9ace05d594e1250fb22
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0151
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 139e-140b
char_span:
  start_char: 28515
  end_char: 29346
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2766e8b458d4d7ee653b8b61bb162e1c39dc724dc29f5e4e13fa9144abe23d86
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0152
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 140b-140e
char_span:
  start_char: 29349
  end_char: 30383
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 609455a1ee6cda090a70df818edc1cf91d86af8a617fe24c636788158e1f0a0b
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0153
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 140e-141d
char_span:
  start_char: 30386
  end_char: 32311
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 5b08a6431e4fe05bb9a5f63a6091088a14dc64c7c7d024a16a25d7922b3e8f75
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0154
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 141d-142b
char_span:
  start_char: 32314
  end_char: 33463
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e90d542f2e732e334456c112b6590ff14bd32c485d62733983f833de079a6cbb
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0155
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 142b-143a
char_span:
  start_char: 33466
  end_char: 35375
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 6c391a20f70c5e9b5e6e1d6ba1732b37f569293583ec6e0b2b0fe4af65c00cfa
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0156
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 143a-143c
char_span:
  start_char: 35378
  end_char: 36082
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f5c17c15d821bdbb344942872b26800f3eeff50d081be95bdb75bf5e8412fb65
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0157
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 143c-144b
char_span:
  start_char: 36085
  end_char: 37836
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 2db8a044d7c089d4b5ea4ea28953d7e47c9763edf87203607dbc8874149f1803
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0158
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 144b-144e
char_span:
  start_char: 37839
  end_char: 39389
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 12cb0320d5f03f3b8dbfe56a55a2b4607e0a4757216e6d8a8bb6e4d9a6828807
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0159
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 144e-145b
char_span:
  start_char: 39392
  end_char: 40203
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 581e38f2db67041b234a820dfa55bc9d4547d1e7de8f67aeacb720b3c2166050
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0160
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 145b-145e
char_span:
  start_char: 40206
  end_char: 41553
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 3eb0e4e96a819ad38be2680cae2b58078a02659a28f265d7171d05e3e8518f5d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0161
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 145e-146a
char_span:
  start_char: 41556
  end_char: 42061
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 5bad778ca89097b9da4d0dcb6e71d7673e980da1d37d64f9778c83ca832aa109
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0162
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 146a-147c
char_span:
  start_char: 42064
  end_char: 44726
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 9fc8db981f8b853f73cc6819ead03a6940e1b80041e4a22bd37c4510ef5d9ed2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0163
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 147c-148d
char_span:
  start_char: 44729
  end_char: 47291
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: b5d357543924ff29dad88525f24e6f5034524d886df146658c1bf5a5d8074131
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0164
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 148d-149d
char_span:
  start_char: 47294
  end_char: 49628
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: e685e376e9d8ebd34ef1d4ffd641127a91eef9367b9fd2d4e66721c13ec8663c
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0165
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 149d-151e
char_span:
  start_char: 49631
  end_char: 54258
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d7dc98b261178ecec284997b07fcb3b170d4582527369a6db78ec37e6920b646
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0166
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 151e-153b
char_span:
  start_char: 54261
  end_char: 57493
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: dbd4dea0cb62cfd24670088eaf30c08c29ea6b94561e22f8b0128e99b1dc25e9
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0167
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 153b-155e
char_span:
  start_char: 57496
  end_char: 62847
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 86d7ea5018c69c540ed6611e50b6de19502b4010b46e7a18b1c8d8b9b301cdd2
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0168
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 155e-157b
char_span:
  start_char: 62850
  end_char: 66119
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: f9fe64f148bb4f94353d993657556064a359e64c663d6001c4e239b759d3c970
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0169
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 157b-158b
char_span:
  start_char: 66122
  end_char: 68244
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: bab2d49a81624701e91ce17bfc9e04821a8f4513d912445ef6b65b3357ef7ed8
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0170
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 158b-158e
char_span:
  start_char: 68247
  end_char: 69354
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 437dc369716067dc258bed6b5cd2456d8f9e46803825f62bb1f1bbb4da98eaa0
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0171
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 158e-159b
char_span:
  start_char: 69357
  end_char: 70180
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 95742aff1f578d88d8b37f3246313103bbc159208b608e6b6cf0b32b404a1013
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0172
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 159b-159e
char_span:
  start_char: 70183
  end_char: 71448
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 12b15e73ae9a47a498e528362df596f59232135eb4e1998e761df478722d0c2d
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0173
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 159e-160a
char_span:
  start_char: 71451
  end_char: 71985
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 41c2405989bd89e1a7bbaacf0625397d622f92d84a0c332b8c573c0dc93bdeb6
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0174
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 160a-160b
char_span:
  start_char: 71988
  end_char: 72467
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 8e4ce438426fff3b75c1f4508ac56fe6a2961ecc70209fb2a6ea379a97988215
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0175
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 160b-161a
char_span:
  start_char: 72470
  end_char: 74360
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 754a6c8ee1f38ec61907fd948a670c7be7ab9060ace3f38ddcdc23d23c746956
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0176
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 161a-161c
char_span:
  start_char: 74363
  end_char: 75043
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 91b46ed2c5c4561ec78499ea148531085d2e679e6a7977cc727c37d37771eb39
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0177
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 161c-161e
char_span:
  start_char: 75046
  end_char: 75945
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: d4dee151f60b0339c56f978d22f83889e259257ae22b7e5956893de138b457eb
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0178
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 161e-162b
char_span:
  start_char: 75948
  end_char: 77114
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 1ab20b80e80783ea7721b2567690869244d6824b4f5bcf2a0620bbdaf4c67b11
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0179
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 162b-163b
char_span:
  start_char: 77117
  end_char: 79101
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 4dca635551bebe74b77274fba8261b80c0e416c5dccf75fa58865bf8d10cdb19
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0180
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 163b-164b
char_span:
  start_char: 79104
  end_char: 81090
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: ca581f9ff91d613ca6aae996353ed44fba14201a3f88c518330c7e2687c7a560
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0181
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 164b-165e
char_span:
  start_char: 81093
  end_char: 84265
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: af0331de64f7085a7fbb050168c62e3074ad30fe945c047c4683828adf1ea777
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_parmenides_0182
source_work: Parmenides
outer_turn_id: turn_parmenides_0001
stephanus_span: 165e-166c
char_span:
  start_char: 84268
  end_char: 85707
source_path: raw/plato/greek/parmenides.txt
source_sha256: 63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2
span_sha256: 0ca0b0d5b9d4978ec0bf6d0dc1e9367579356d040eb7ec309a6ae7b60f171500
voice_chain:
  - ΚΕΦ.
  - ΑΝΤΙΦ.
  - ΠΥΘ.
depth: 4
resolution: unresolved
unresolved_reason: The Greek transmits this bounded direct speech span but supplies no local owner-bearing reporting formula; neither a nearby turn nor turn alternation licenses its terminal owner.
review_status: accepted
```
