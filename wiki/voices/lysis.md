# Lysis — Voice Ledger

Reported-speech structure for the single unlabelled outer turn that
`wiki/reported-turn-scopes.json` marks required for Lysis. This ledger is
reviewed directly against `raw/plato/greek/lysis.txt`; accepting it neither
activates a claim-speaker cutover nor changes a claim, observation, relation, or
audio record.

The source prints no speaker siglum. Its first-person opening and the early
vocative to Socrates identify the frame owner as Socrates. Direct discourse
inside that narrated frame is recorded below it only where the Greek bounds an
utterance; explicit self- and named-reporting forms resolve an owner, while bare
or collective replies remain unresolved rather than being assigned by
alternation.

## Records

```yaml
voice_id: voice_lysis_0001
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203a-223b
char_span:
  start_char: 0
  end_char: 41070
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: unlabelled_turn_frame
    role: cue
    text: ἐπορευόμην
    start_char: 7
    end_char: 17
  - kind: unlabelled_turn_frame
    role: cue
    text: ὦ Σώκρατες
    start_char: 296
    end_char: 306
limits: The turn's printed speaker is the metadata literal (none). The first-person frame and Hippothales' vocative identify Socrates as the unlabelled narrator; the record owns narration only.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0002
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203a-203b
char_span:
  start_char: 313
  end_char: 345
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7bce0e3017cffc3ead33b61e4af1cc48dc18af824d5cd11b81bc78d558fa7a76
voice_chain:
  - ΣΩ.
  - ΙΠΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Ἱπποθάλης ἰδών, ὦ Σώκρατες, ἔφη
    start_char: 278
    end_char: 311
review_status: accepted
```

```yaml
voice_id: voice_lysis_0003
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203b
char_span:
  start_char: 349
  end_char: 398
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 46aced1f696cebe7dd7791c4ad3bbff75a3566f2ce0deead2b37309b01d43159
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 364
    end_char: 373
review_status: accepted
```

```yaml
voice_id: voice_lysis_0004
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203b
char_span:
  start_char: 403
  end_char: 462
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 22c2a73b69f480a8ec9f601c913d09d4a52bc7dd5f8f8f9c76449a3a66e4849c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0005
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203b
char_span:
  start_char: 467
  end_char: 515
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 984f5c0b4f8607a6d89e416341ecf2ee8ed5aa1eb3454c6a07f17bab9869bb22
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην ἐγώ
    start_char: 472
    end_char: 480
review_status: accepted
```

```yaml
voice_id: voice_lysis_0006
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 203b-204a
char_span:
  start_char: 520
  end_char: 698
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 97559710be643ccde16509f507ffda38f4cfad5b51da4d5848579b94460db240
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0007
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a
char_span:
  start_char: 703
  end_char: 744
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 613f3fc3d89ba629efdad4f5542e1fe38b68d3e18ff66ac0e554f4fd330e1e1f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0008
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a
char_span:
  start_char: 749
  end_char: 849
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 848e0ca586970c02e8269125059859f302e7b4fc51ee812dcfaef94c926b92ad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0009
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a
char_span:
  start_char: 854
  end_char: 909
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a303817fe083aa2afb4737747d0d6fc51dbf68848e6f03fc6c36123f6fb59a67
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 864
    end_char: 873
review_status: accepted
```

```yaml
voice_id: voice_lysis_0010
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a
char_span:
  start_char: 914
  end_char: 961
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 31f5b602431bed518c1e8ba2c4a6dfe4f5b73a6edc240328fed6954d787fe72b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0011
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a
char_span:
  start_char: 966
  end_char: 1025
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d1001ff30d233b762bf2b8b96a8dce727914a84fc932f718527e569ca6d5fabd
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 974
    end_char: 983
review_status: accepted
```

```yaml
voice_id: voice_lysis_0012
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204a-204b
char_span:
  start_char: 1030
  end_char: 1113
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 759508607d585ec850b3e6b058c5d96148217f8001c6cf3c8228a16d1485b99a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0013
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204b
char_span:
  start_char: 1118
  end_char: 1179
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e9fabbc6d5cbb234f92735c230544ea4f4ed7581e6cdb8e947aa2dc4a9f1f35d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0014
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204b
char_span:
  start_char: 1184
  end_char: 1224
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 45d847aa4fb3556111f0b5fc0884e34f3d3e2605340ee9dae1e1add962d85953
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0015
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204b
char_span:
  start_char: 1229
  end_char: 1272
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9c325c70de4c0f60c2f10f5b88b3249ff19d496b81023d9e1a00f84c52797eea
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0016
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204b-204c
char_span:
  start_char: 1277
  end_char: 1603
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b069900e748114dcf2c7ada675706e3bf00b724efee8dce9c7abb4c17f0ae56b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 1314
    end_char: 1319
review_status: accepted
```

```yaml
voice_id: voice_lysis_0017
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204c-204e
char_span:
  start_char: 1608
  end_char: 2300
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9af6d3c429ea63d96ca0bd95dfd1331b95dfe8a6b429e2767689d2480789d649
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0018
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204e
char_span:
  start_char: 2305
  end_char: 2400
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5606d13d6bf282d1455a3e37100a27eebdae23c71bb9968bab6a13875cc8f8a7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 2315
    end_char: 2324
review_status: accepted
```

```yaml
voice_id: voice_lysis_0019
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204e
char_span:
  start_char: 2405
  end_char: 2629
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8bdb41a95dc0255aeb9ce9b5a74f4394e8fb79dc42b06586d52141bd1bb6d474
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0020
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204e
char_span:
  start_char: 2634
  end_char: 2668
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ad9656738bdc6feb04b081b8aaebbec5a5e813e09a070230e26c061905d30119
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 2643
    end_char: 2652
review_status: accepted
```

```yaml
voice_id: voice_lysis_0021
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204e
char_span:
  start_char: 2673
  end_char: 2722
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0f1c869b58c7e3fc7c4f13f96c47e71b0c60b8868f5467db7521876abf7b1560
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0022
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 204e-205a
char_span:
  start_char: 2727
  end_char: 2954
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 00736f7af9746a86614eef5f48a7b74cbe7895f3ee4b0314416775ebb364808e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 2733
    end_char: 2742
review_status: accepted
```

```yaml
voice_id: voice_lysis_0023
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205a
char_span:
  start_char: 2959
  end_char: 3011
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: bf1e286c9abacfad92d30c6615452b72632983637b50d2c3d65c4720728960b9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0024
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205a
char_span:
  start_char: 3016
  end_char: 3072
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3a0a5ce4cc2c9213668e466a8933ffc7a25acb04c3316f1fbddc8a01381f4208
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 3025
    end_char: 3034
review_status: accepted
```

```yaml
voice_id: voice_lysis_0025
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205a
char_span:
  start_char: 3077
  end_char: 3139
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4df0b23b007170f00499a9556627a8c184c59d659b49ff69112aa8163ec379c8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0026
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205a
char_span:
  start_char: 3144
  end_char: 3202
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4493223d4517970148af2fbe817eb5bb44c9ae861a0c74230a2192d5c877a009
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Κτήσιππος
    start_char: 3158
    end_char: 3173
review_status: accepted
```

```yaml
voice_id: voice_lysis_0027
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205a-205b
char_span:
  start_char: 3207
  end_char: 3385
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d91f6614a6fe5a1eaa2a5df8b892eb570e3bf477fa7893a7885adbc67c6ada0c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 3215
    end_char: 3220
review_status: accepted
```

```yaml
voice_id: voice_lysis_0028
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205b
char_span:
  start_char: 3390
  end_char: 3503
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 89486f79078db815915cdd8b8eba33f4e83d87be61a09ae5eeea82d2fa0346f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0029
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205b-205d
char_span:
  start_char: 3508
  end_char: 4343
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a70e7215c9b61a346cb1aea949182ba12d928292e9b1d6acdba55555db4cd883
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Κτήσιππος
    start_char: 3523
    end_char: 3538
review_status: accepted
```

```yaml
voice_id: voice_lysis_0030
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205d
char_span:
  start_char: 4348
  end_char: 4453
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3b8ede339793baaeb7437cdd4861afc5ac0ebefd598e37f7db7e6bd56f97fbdc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 4364
    end_char: 4369
review_status: accepted
```

```yaml
voice_id: voice_lysis_0031
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205d
char_span:
  start_char: 4458
  end_char: 4516
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 11d902d35e183d864f45a4f683ed328cb78a5424cde774528bf0ccd1113e8d65
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0032
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205d
char_span:
  start_char: 4521
  end_char: 4544
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f37deddda2c595647884935040f9d918d320eca3e3292f82c7fcae3c165d3874
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 4534
    end_char: 4543
review_status: accepted
```

```yaml
voice_id: voice_lysis_0033
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205d-205e
char_span:
  start_char: 4549
  end_char: 4576
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5d0208ef8e1ad073fcc1e9158d137f04548d4a3acf2a6eb45e65ffda05b7eef8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0034
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 205e-206a
char_span:
  start_char: 4581
  end_char: 5158
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ef5f06252c9b58f2ed60de3c4f59b5d699965dce00400d25187b434d52ab1eb2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 4597
    end_char: 4602
review_status: accepted
```

```yaml
voice_id: voice_lysis_0035
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206a
char_span:
  start_char: 5163
  end_char: 5174
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f19690eb14f659c7878603daaf0d52bf381c888aaa1c2cbcbb3fd8c013e08d99
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0036
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206a
char_span:
  start_char: 5179
  end_char: 5238
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fe487b462d608f990cd88ea2baf56de22312d252e1763d0ad9bd653339c01a35
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0037
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206a
char_span:
  start_char: 5243
  end_char: 5252
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7941bd9a29fe423a0df6b6878133688e583cbab2c9bf45a1522c8e7834a83fea
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0038
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206a-206b
char_span:
  start_char: 5257
  end_char: 5361
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d4f308539c9744abf2169730da17ca3d74a2b26d79e4a7385a7b9886de23565f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0039
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206b
char_span:
  start_char: 5366
  end_char: 5383
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7d9be8b2c0d2c369e89776a18fb6064c48fdb25a084c02b182dfca4588208f81
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0040
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206b
char_span:
  start_char: 5388
  end_char: 5468
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 67fdb5e08d38c8bfcf57bebfc779f0a5c10f0eaac0e61dc3adbaf6655798e7f4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0041
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206b
char_span:
  start_char: 5473
  end_char: 5483
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a23fd1a5904ad3ea14ecbd9aef7482d6faf2b596ad38fcd5053dcacc8a7ceacb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0042
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206b
char_span:
  start_char: 5488
  end_char: 5698
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2d5cfb6d815d6c7c4b4a7c3496a2f00cf698d6d68e1c7b4c56791941efbfda25
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0043
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206b-206c
char_span:
  start_char: 5703
  end_char: 5909
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5b1713baab606b8ac8c36b47d1efeb4b32fbb25800d71a172772b952eb358b00
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0044
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206c
char_span:
  start_char: 5914
  end_char: 6102
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6afaf9ce47bd4e7017f965377136f81ac2428fa9820a11f691f5e64b0154e734
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 5925
    end_char: 5934
review_status: accepted
```

```yaml
voice_id: voice_lysis_0045
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206c
char_span:
  start_char: 6107
  end_char: 6227
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ed95e4eb4f8d2caf044c6d4fb22e46c792c69017e8ae87d73f05419f52c6de75
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0046
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206c-206d
char_span:
  start_char: 6228
  end_char: 6367
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e5c6d4050577e20769c1df49daddf33716b480fea9bb9eb677e98867dfc2cb98
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0047
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206d
char_span:
  start_char: 6368
  end_char: 6560
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3b7a084ca698a523d7c162ba6d0d3355db9b22290d38c22e74b4cdeade63c848
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0048
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 206d
char_span:
  start_char: 6565
  end_char: 6594
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f0d3c1fd6cca61bf3de52b84ab5fb2c6a09a20897f68e09634d8040266505486
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 6572
    end_char: 6581
review_status: accepted
```

```yaml
voice_id: voice_lysis_0049
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207b-207c
char_span:
  start_char: 7857
  end_char: 7956
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 724b707f7965cf46b197111b19e55a3530e14790603225a11674e170f4fd1fe1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 7920
    end_char: 7929
review_status: accepted
```

```yaml
voice_id: voice_lysis_0050
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 7961
  end_char: 7980
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 57bbd09b9cb1dd00632912c1020d1c693c44bee47af03a1941b53b0d32e4ad00
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0051
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 7985
  end_char: 8042
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1183318dd6ffeebe755d102146dc7802e289f6c87058891647dfc53e0ee61fb6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 8032
    end_char: 8041
review_status: accepted
```

```yaml
voice_id: voice_lysis_0052
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 8047
  end_char: 8060
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6e0bb09d11472e8a769b69be27e40c347f5486b9d13b87d78b773bcb123c7b9f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0053
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 8065
  end_char: 8102
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 074311d1a929d4041f73dd695372bb86fd7316b8e17dcdc29d941436105c0720
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0054
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 8132
  end_char: 8213
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 85e51e498ad55efb529ba1441f0af51672108f808660d850cafd203cfbd2d82e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην
    start_char: 8152
    end_char: 8156
review_status: accepted
```

```yaml
voice_id: voice_lysis_0055
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 8218
  end_char: 8234
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b67067a2e8e99294da9ffe82664e33210684f4048a1c5f904a9ba683204ad4bd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0056
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c
char_span:
  start_char: 8239
  end_char: 8340
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dccf324b5548f5defdb8e435be08cbcf15e4b86e0b1da9eecbd9f57d996c3f9d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0057
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207c-207d
char_span:
  start_char: 8345
  end_char: 8362
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7a69c2a252f0b0f9b3bc7fd11b159a3dd502917d40e7cb445e09e2bf4350e34f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0058
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207d
char_span:
  start_char: 8367
  end_char: 8671
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3cedc590e03c1461150e0dcb9f7f17ba5580052efb692ad1c778f5f29a8fae55
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 8616
    end_char: 8625
review_status: accepted
```

```yaml
voice_id: voice_lysis_0059
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207d
char_span:
  start_char: 8672
  end_char: 8689
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: edfd50eb2ddab90a1e01c1baa974a50aeaa63b72cf40d0bf1b92df80511fe020
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0060
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207d
char_span:
  start_char: 8690
  end_char: 8738
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a40ab05fbb9ab97f888b286c7f4bce5cb6bd61af270e7c3bfb19a19090e3d03d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0061
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 8740
  end_char: 8758
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 09bc736a62d7c4655a951062021934ed516dba24d573e48d04725ca997daba81
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0062
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 8759
  end_char: 8845
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: efa6e000d1ee4677191fc5d64cefbf25df7c1ecd08659180f49753717d7009d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0063
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 8846
  end_char: 8869
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7dfadec2c3eac2e1023866d9cda84cdabeb76f41c19da7b1ba3d02283564574f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0064
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 8870
  end_char: 9009
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9f9fd3b7fa1f54276fe9139a6ca5b1ec25fc5ecabf1f4c580d7dd8d1ea791c79
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0065
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 9010
  end_char: 9028
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f55eaea3f37a702fccfde8d40e4912479622dd58c0fdfb66475a099ff80237d6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0066
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 9029
  end_char: 9122
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 54ec918dbc11c5816ffae523bbdc4d85d204d722a658c8f3c5735d0a131b98ed
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0067
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e
char_span:
  start_char: 9123
  end_char: 9182
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5b8b7b504e409b1ee2f3cf91aa30b41f67d3b67f3b1f492d3e28358a9fac5eb8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0068
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 207e-208a
char_span:
  start_char: 9184
  end_char: 9418
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4f6a59e58b900e5a5903ff8a64bc21fbbf4c9871cc429b2f2becd2686de80b39
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 9196
    end_char: 9205
review_status: accepted
```

```yaml
voice_id: voice_lysis_0069
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208a
char_span:
  start_char: 9419
  end_char: 9450
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e79fc790bf6b175fb232ec56bbc679182e5f70af348ad423516ef1fbe4b494ca
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0070
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208a
char_span:
  start_char: 9451
  end_char: 9465
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9fb97d5738945bf6017a78afbee612ccedab512698862a5a263de895935958f1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0071
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208a
char_span:
  start_char: 9466
  end_char: 9513
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 06352c6a1faa2c96e92ba3ca280baf303c2c327ee79522849cb7696425e4c019
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0072
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208a-208b
char_span:
  start_char: 9514
  end_char: 9651
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 75263de1b8d94da7a3c7910dc8fb0087f417981673a721fa82a1a579482584d6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0073
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9652
  end_char: 9669
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b3cb190b1863311994e2a61370252406751bc7f649b9e5cf25a25a7496fd2f0c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0074
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9670
  end_char: 9775
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 637283970d40a8feac4eb0874e56752cbbc06f60559daade83393f77c2f2fa14
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0075
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9776
  end_char: 9797
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 780af03f632727d3db156a3d884fdbd56323910e61d0362fd247bd304a1a6b3f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0076
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9798
  end_char: 9846
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fbe0f77b0992b90ef06a785e63af73eb010fde81e236bfd0f51283a5505253e6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 9805
    end_char: 9814
review_status: accepted
```

```yaml
voice_id: voice_lysis_0077
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9847
  end_char: 9874
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2d8d7425f0113c59cb8b3cf5d23931968a3914d409ef884dffc19b95799ee49c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0078
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9875
  end_char: 9897
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1bb4ab644cd84bc337743a63ee85c9dc47b9445f146ef7d46af23bd8ed414c6a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0079
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b
char_span:
  start_char: 9898
  end_char: 9909
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3b9b26cb019cd5fedaa36818a5781358086bfca9fcee2fe250cb35366759153e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0080
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208b-208c
char_span:
  start_char: 9910
  end_char: 10150
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f73956ee14322febde8ca2e3daee3bf47b46db1ec31b2a599b1aa9fefcd6eb57
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0081
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10151
  end_char: 10178
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 56b3ad74e36ca6b08a3e39230d2cf993478143f4d64436434f95fa102c53954c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0082
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10179
  end_char: 10198
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 952aa951621a53c3bab6291a7b14520637a3483282a578564658433415a4f7f7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0083
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10199
  end_char: 10220
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a6b9a30b72a59bdd6fb22600cef26d48cf7e5fa2eaa5ba75df94a39ae1575e41
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0084
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10221
  end_char: 10235
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3f7a3189f7fa01421f6ed1e38ead4854aea7c6d9d49b3fab86a86c7acf8495d9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0085
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10236
  end_char: 10266
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 308af8d08d473c0f12012a592600cc91b3d679ec26347d934684cda8dafae393
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0086
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10267
  end_char: 10368
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e04bfa86951335bd680c93efa58e149e32a1d45a72ad2ba35683ec90a2b43862
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 10277
    end_char: 10286
review_status: accepted
```

```yaml
voice_id: voice_lysis_0087
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c
char_span:
  start_char: 10369
  end_char: 10401
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: abdd073b2f1f8794a39a6e1b6c9325648709803fc5ada6f4f44590f2755fac80
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0088
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208c-208d
char_span:
  start_char: 10402
  end_char: 10454
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dd666d4067c32f492790ffc835d4ba19aa4bf3162b7e955772b1c10083c53500
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0089
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208d
char_span:
  start_char: 10455
  end_char: 10468
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7b2e4dd6797d01380d96eaabbb47ee851125eb3d9d4fa862560e7b5094f4500b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0090
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208d
char_span:
  start_char: 10469
  end_char: 10790
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 884ead265d886f5fd9da2c14130893258190aec8e6e3d5528b68f4706cb2a0b1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0091
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208d-208e
char_span:
  start_char: 10791
  end_char: 10896
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b31c7aafacbe70543d638e0bd653e9b8e5f5598c98a3293bddb3616ff0031f73
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0092
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208e
char_span:
  start_char: 10897
  end_char: 10961
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3f81be55dbae5d38d324a50dc3c61055eef66810669cc9167c764d642206be3b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 10907
    end_char: 10916
review_status: accepted
```

```yaml
voice_id: voice_lysis_0093
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208e
char_span:
  start_char: 10962
  end_char: 10984
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d304fcd434d3612a38dae901b57fbf49a613de16944ad67c6117023e308abdfe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0094
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 208e-209a
char_span:
  start_char: 10989
  end_char: 11437
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d31f52af26e07c009bf8d1ee7a98d7b1309dd3a79c3ef7293c1b436fb9392218
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0095
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209a
char_span:
  start_char: 11438
  end_char: 11478
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 008f3a9866f9ca9609fde815d4ff84b5b9f3b030c93659caee4bac6d709710af
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0096
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209a-209b
char_span:
  start_char: 11479
  end_char: 11762
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 060da677db760c0f46983c11d9ba05b274d852ff24a621f8148709b8d9000f04
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0097
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209b
char_span:
  start_char: 11763
  end_char: 11776
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: da1de92e8aa206f86c2babd3053602087f35eef1a401e311d29b0d97b6cc5058
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0098
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209b
char_span:
  start_char: 11777
  end_char: 12084
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2ed263011907ef62cb3223b32cacdf1cae1a4eeaf3f633bbbbc527a8ad68a5b2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0099
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209b
char_span:
  start_char: 12085
  end_char: 12093
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0100
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209b-209c
char_span:
  start_char: 12094
  end_char: 12205
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b17061ac303ab0a8d5187bb24e3b78e02a8e409f1d814a634c58441c0c833b79
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0101
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209c
char_span:
  start_char: 12206
  end_char: 12256
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 10d84b355bb2e58bf37ccb6e0c13271141be44dfb0bd2ed870e690882ca55d8a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0102
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209c
char_span:
  start_char: 12257
  end_char: 12438
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 81aeb9d9cc5a576600650596591502cba7e26f200fdaa05e03ffdf4070dfb956
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 12263
    end_char: 12272
review_status: accepted
```

```yaml
voice_id: voice_lysis_0103
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209c
char_span:
  start_char: 12439
  end_char: 12456
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5e1878e54ade6b2c65feaa2591b6b11dc0eb7f47e1ebe052cfd62ece0e705fa5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0104
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209c-209d
char_span:
  start_char: 12457
  end_char: 12686
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 443282d3d81d422c314a45fb810f37cb93569457842d80132d7b6902d2c6c02f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 12463
    end_char: 12472
review_status: accepted
```

```yaml
voice_id: voice_lysis_0105
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209d
char_span:
  start_char: 12687
  end_char: 12709
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 242f2ee6810a81c6c9f4e56bcddfc2dc6d9793dc28e1689d39b43cebb9a97800
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0106
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209d
char_span:
  start_char: 12710
  end_char: 12797
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: af19d416d0beb1bfa96aa2cfc33a8f4ba579070890317dddc32434fad918453f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0107
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209d
char_span:
  start_char: 12798
  end_char: 12804
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0108
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209d-209e
char_span:
  start_char: 12805
  end_char: 13131
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fb6a42227be315c627a57d35591617f640b7817deac697cf11f25aeffac9c505
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 12816
    end_char: 12825
review_status: accepted
```

```yaml
voice_id: voice_lysis_0109
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209e
char_span:
  start_char: 13132
  end_char: 13152
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2672c35b260041c7fb006fb03dcecd6c456fd5fd9812aef1025c026c80ae8c10
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0110
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209e
char_span:
  start_char: 13153
  end_char: 13266
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6ac26ccdbcc590c6a97f16f43db0998a78784d407708b51300afbba09f88cf8a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0111
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209e
char_span:
  start_char: 13267
  end_char: 13278
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0112
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 209e-210a
char_span:
  start_char: 13280
  end_char: 13413
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ba71035bebdf269b670c052c6535b0fdff04451f92960839056a3e092443e47c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0113
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a
char_span:
  start_char: 13414
  end_char: 13424
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e287ff449d7b3f5244dde5c886810592296cd6b15c6809145f19d69d38694090
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0114
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a
char_span:
  start_char: 13425
  end_char: 13582
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 00e72ba187bb71b64cb8272e8dffeaa699c010d7e1869fc927826e672e2be4b1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0115
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a
char_span:
  start_char: 13583
  end_char: 13596
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 53f99cc9f20690d28692b7f8a9fdc1b64aed1f134d2fba4ed6d122d942ab5f66
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0116
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a
char_span:
  start_char: 13597
  end_char: 13716
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 10b99e6209076efbcfcf99f21be7a96b96837595a637d9e18cea38e52a908a3d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0117
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a
char_span:
  start_char: 13717
  end_char: 13741
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 208c54469ce03d66ff9ed5904550f38a137b99165ecb301f70ca671705b8832c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0118
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210a-210b
char_span:
  start_char: 13746
  end_char: 14071
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5bc51c2dbb612f02a676d46eb480a96eaff9d13f726efee6c743ca70dff312a8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 13762
    end_char: 13771
review_status: accepted
```

```yaml
voice_id: voice_lysis_0119
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210b
char_span:
  start_char: 14072
  end_char: 14095
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a52e6aba6c7a234e146ccdb51b351682057f2bcca5876c5caf6273523ae0900c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0120
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210b-210c
char_span:
  start_char: 14096
  end_char: 14446
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1d6321188851210db23e1cda19c991124ec4184de97b1e10e77d89249eb6524a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0121
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210c
char_span:
  start_char: 14447
  end_char: 14455
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4acefe3f99b0e9f9424d8e1387550ae85bd3645deacc8c9312a4f153194760ee
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0122
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210c
char_span:
  start_char: 14456
  end_char: 14539
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 86b87df236b589013fcf912ccbd57878dcca4835e66d24766ee79953b2a2076f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0123
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210c
char_span:
  start_char: 14540
  end_char: 14553
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b6f93052aac3e686b00515f7d5c006d96aba2574ce507bf65e4483760901dd66
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0124
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210c
char_span:
  start_char: 14554
  end_char: 14633
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8d0a4186677ec5da95098b0f17b7ad32c40631ee254fb0c2d77495c9bda493f0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0125
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210c-210d
char_span:
  start_char: 14634
  end_char: 14657
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: afc8148dba3a008b3c88e54a9e3de835a5cd791ccd98131d3565ea7947ca97a7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0126
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14658
  end_char: 14736
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 03f6cb150af4c23e447444fbdf3b2d8473dbabe736f7252f20bacb09a82a0a4d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0127
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14737
  end_char: 14764
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7e0a186bd118d1e8c3e7edac7baf01ce7cb0693c78923ef1e0051d45e589e64a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0128
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14765
  end_char: 14922
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3e3ceec060d367b9114f639e142993f3c5a24ad6428abe3530d5eb3a2e6a5af6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0129
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14923
  end_char: 14939
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d822440d149fa57b1ae3506289ea8613afcfdc6428a0769b0e4b04199d915264
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0130
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14940
  end_char: 14982
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b7fe7c0fea75c2ffce99be960738bbce098678dff6354c19a8d5aa474c5322d0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0131
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14983
  end_char: 14989
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0132
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d
char_span:
  start_char: 14990
  end_char: 15030
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c77bfe9deb4996d0b7cfaa761a0d804fe1c8dc5aa490b3c2eced7fbf87d35e08
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0133
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 210d-210e
char_span:
  start_char: 15031
  end_char: 15076
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3dfb6c4e6a9a0fae01d6eb1762cd1e80188b6488ca74bf6fa93c5db5f6c46eae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0134
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211a
char_span:
  start_char: 15652
  end_char: 15705
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4dafd86a3ea16c642ddb8b711b401a903e08898e300991433e75703e1ff0bc26
voice_chain:
  - ΣΩ.
  - ΛΥΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ οὖν Λύσις μάλα παιδικῶς καὶ φιλικῶς, λάθρᾳ τοῦ Μενεξένου, σμικρὸν πρός με λέγων ἔφη
    start_char: 15565
    end_char: 15650
review_status: accepted
```

```yaml
voice_id: voice_lysis_0135
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211a
char_span:
  start_char: 15709
  end_char: 15787
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 14b3e1f465209e44a1b3209a422a122508da5f465c84bc554749a55f50bf8065
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 15717
    end_char: 15722
review_status: accepted
```

```yaml
voice_id: voice_lysis_0136
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211a
char_span:
  start_char: 15792
  end_char: 15810
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0137
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211a-211b
char_span:
  start_char: 15815
  end_char: 15973
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cf03fee2a2a355df590d91a19b24b9c0fa8e8f218327bf973e5eba6d6eb2ade9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 15829
    end_char: 15838
review_status: accepted
```

```yaml
voice_id: voice_lysis_0138
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211b
char_span:
  start_char: 15978
  end_char: 16108
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 648b86f49400635910202aa090c212d418485fb43550ff7e9a8b78ec884db0e5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0139
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211b
char_span:
  start_char: 16113
  end_char: 16276
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7fb18d5c13abcc54fa8e669fb20f1a49321c95f73640d55fcc826f59bc9cf8f2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16136
    end_char: 16145
review_status: accepted
```

```yaml
voice_id: voice_lysis_0140
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211b-211c
char_span:
  start_char: 16281
  end_char: 16363
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0c84d72b542af6d9da81178702efadc2d5387b90253e3b5bd598ede916c027c1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0141
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16368
  end_char: 16405
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a3ed54a5180b037b3fde60bda6d1ec82a788da1545375914111d7f6905d10710
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16373
    end_char: 16382
review_status: accepted
```

```yaml
voice_id: voice_lysis_0142
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16410
  end_char: 16449
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5665b0eafac4a3faebb296a945ee2b8d59175a43e61fe4d50fadd811bebdd712
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0143
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16454
  end_char: 16545
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c12bc5a0a3d48466716f1523bc2f62c36dbc81374a6daf8e750ac6cc4c02dcc9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16461
    end_char: 16470
review_status: accepted
```

```yaml
voice_id: voice_lysis_0144
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16546
  end_char: 16555
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b28c15f8fd428245b3c96a53814e243d6e4bcd154cdd7bcb227b3875f7e75beb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0145
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16558
  end_char: 16568
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e194231bf52340bf2ca407baf10d33a05b56bb624d569ba57a1d13b182b0b091
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0146
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16573
  end_char: 16634
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a00e73e32b1f8e662b087ca5739136c4305ac14aa1fbb217d34be609de6cf472
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0147
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c
char_span:
  start_char: 16639
  end_char: 16661
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d3eaf058572fac93a41166ba07357fbab3107b9d70e85bce6ad6081331dcdacb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16651
    end_char: 16660
review_status: accepted
```

```yaml
voice_id: voice_lysis_0148
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211c-211d
char_span:
  start_char: 16666
  end_char: 16796
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: af17ed67761d1df77640121ea3a53910ef3b75bfca5320f95f12bfa848bbae95
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Κτήσιππος
    start_char: 16718
    end_char: 16733
review_status: accepted
```

```yaml
voice_id: voice_lysis_0149
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211d
char_span:
  start_char: 16801
  end_char: 16930
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d5c48bcbc33d8a7f79c45751b95e398a0298f728f0c8f7c0ffe20fb44437dde0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16811
    end_char: 16820
review_status: accepted
```

```yaml
voice_id: voice_lysis_0150
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211d
char_span:
  start_char: 16935
  end_char: 16963
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cc6defea0f1537cdc630cbc217b6885590283b0a61b1485ec27609efb49747ce
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0151
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211d-211e
char_span:
  start_char: 16968
  end_char: 17406
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 39062220abe284889929d6936b7a934bbd2356a12b6778e412bdc227d73d9b54
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 16983
    end_char: 16992
review_status: accepted
```

```yaml
voice_id: voice_lysis_0152
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211e
char_span:
  start_char: 17407
  end_char: 17538
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a6890b7a1c06c4d049e621e8441dd37f2d0e5a0797e8dc34817ad838ab923515
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0153
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 211e-212a
char_span:
  start_char: 17539
  end_char: 17931
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 272f433e5f3b2920a4d8f7fc73b5fc359cdef8631f73411bd85ce07a5fbed0a3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0154
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212a-212b
char_span:
  start_char: 17936
  end_char: 18082
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d21136808263b1dd0b322578125a0ab0552bb7c92b8b5910b7b5b62641e7cc2c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0155
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b
char_span:
  start_char: 18083
  end_char: 18118
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2cf30d9e59ee722c738ba992e0480fb47c94c456057c83c7c027ba67cd7ff9bf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0156
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b
char_span:
  start_char: 18119
  end_char: 18216
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7209e347a8c7a4bfc3e7149a46ab7adc7c84440d39b0f607d87be87459719723
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 18131
    end_char: 18140
review_status: accepted
```

```yaml
voice_id: voice_lysis_0157
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b
char_span:
  start_char: 18217
  end_char: 18236
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c5493bbd7c505123b833dc64601e0923ae749298cf6947798713931f83f1a195
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0158
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b
char_span:
  start_char: 18237
  end_char: 18302
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 78c2d5a5c2899e3f0a5751a5643f15c977ea4fb9528d3ff28bfdd8f69888433a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0159
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b
char_span:
  start_char: 18303
  end_char: 18309
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c4bd1fa8c201b5419ada7abbd742dc376106ed17056f2b341968b715b9b0d120
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0160
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212b-212c
char_span:
  start_char: 18310
  end_char: 18539
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e060945a4c1ea5e72dfbae47190e9bb536cab5ff3615132caaca717df7e6c90c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0161
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212c
char_span:
  start_char: 18540
  end_char: 18563
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: afea88b39babf3dbcecd3bd341ccd8882a0912659a4c97128cd022466ac50df0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0162
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212c
char_span:
  start_char: 18564
  end_char: 18624
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0348ef61b3702187d41434699222f0986633d257151fd13a333e678dc92d7c0e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 18586
    end_char: 18595
review_status: accepted
```

```yaml
voice_id: voice_lysis_0163
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212c
char_span:
  start_char: 18625
  end_char: 18629
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0164
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212c
char_span:
  start_char: 18630
  end_char: 18849
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 74a8b4f83b5ad74db6a6c40966d30af5231ad824e75c7ecbd0877cf75a00e2e0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0165
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212c-212d
char_span:
  start_char: 18850
  end_char: 18880
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4f5f74959ab7ebcef5f42bc89b983044bfee6a5d9e7fd3bad2e6e19d7210dadc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0166
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212d
char_span:
  start_char: 18881
  end_char: 19026
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ae5bdce83a78727da402101e1d7c57d835ce8882175772725b335a63e1f658d0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0167
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212d
char_span:
  start_char: 19027
  end_char: 19043
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 349ef71d535507c8be81150ccb1737c97f004cd20fe2d7b55bfe0b9897df0fa7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0168
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212d
char_span:
  start_char: 19044
  end_char: 19100
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3cc3f65bff66f29f53cd80db0ba2acdad3f26c24fa5467e7d0cd93e68ae066e1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0169
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212d
char_span:
  start_char: 19101
  end_char: 19112
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d39ec0fab4b4f797ec6a80b276c5e0c5c533e5499f827668d0fed943a409d757
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0170
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212d-212e
char_span:
  start_char: 19113
  end_char: 19371
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b03a39bf79db79ecfcdca56106cf956fb5c6317e8ee22c07941ac7fe827875c4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0171
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212e
char_span:
  start_char: 19474
  end_char: 19500
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5be329f6445b4e774dd06bedc6b636750e949f8e1d2d789195c698b2be12b148
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0172
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212e
char_span:
  start_char: 19501
  end_char: 19529
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f3d0e22c6f2ff54fe0abef1e8511adff56e8e9f60852ce09c6c80bbccdab6fdb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0173
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212e
char_span:
  start_char: 19530
  end_char: 19534
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0174
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 212e-213a
char_span:
  start_char: 19536
  end_char: 19842
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 80ac821a2dadca02da5c61af66c7357aa7e24dc2c952b09c6c48102d2be4603c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0175
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a
char_span:
  start_char: 19843
  end_char: 19874
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3f711929ba8bce5424162713507d5078a4010f8d1d9ab75aec7e69a555f35060
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0176
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a
char_span:
  start_char: 19875
  end_char: 19936
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd2d7222d1310cdca8a7c0b23b4525b767342737e7f68b7b84e8a9f719bbe1a3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0177
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a
char_span:
  start_char: 19937
  end_char: 19944
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0178
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a
char_span:
  start_char: 19945
  end_char: 19991
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 07af810476bce687af65e2b8aff5d7b9e82a0db0931b3c4f77a6c58de1edcc23
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0179
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a
char_span:
  start_char: 19992
  end_char: 20001
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0180
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213a-213b
char_span:
  start_char: 20002
  end_char: 20288
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e42c58b469c2b0535f82d768848dc9e57223ef72de3e3010054d903c04b12c92
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0181
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b
char_span:
  start_char: 20289
  end_char: 20327
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 676f13e78d0e4edf17ed3fc77411fabd6f43a08397281cd616e80e42ea5035fc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0182
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b
char_span:
  start_char: 20328
  end_char: 20392
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2bc82cc170165ec3af1582dd1c2281041fa20d6172809c914eede913110f58fc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0183
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b
char_span:
  start_char: 20393
  end_char: 20402
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0184
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b
char_span:
  start_char: 20403
  end_char: 20445
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6f9ce43e59e22ace00368e0096b2cf70787d4833129e96efca8caec6f08a73b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0185
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b
char_span:
  start_char: 20446
  end_char: 20453
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0186
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213b-213c
char_span:
  start_char: 20454
  end_char: 20745
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 05e91d78ca50a34bd2c7947b304676975c2684d9e935d3a4cd7a744aecc71538
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0187
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213c
char_span:
  start_char: 20746
  end_char: 20762
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 349ef71d535507c8be81150ccb1737c97f004cd20fe2d7b55bfe0b9897df0fa7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0188
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213c
char_span:
  start_char: 20763
  end_char: 20965
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8e10012731440f6cfe15fedc585f534c98a9f9bd591d8ad97a46c8f340bb8338
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 20784
    end_char: 20793
review_status: accepted
```

```yaml
voice_id: voice_lysis_0189
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213c-213d
char_span:
  start_char: 20966
  end_char: 21026
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 385545f6181dd5bb61edd39fcddc9fa5571a41291012e5a3377171056323bd6d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0190
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213d
char_span:
  start_char: 21028
  end_char: 21090
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b5301b44add696b921fae71e9005a8cfb2d08c55bf45494ac4ccea1c2e596d2a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 21036
    end_char: 21045
review_status: accepted
```

```yaml
voice_id: voice_lysis_0191
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213d
char_span:
  start_char: 21091
  end_char: 21135
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 83c07f5186e6181f31ee6cec61fd122e33f02393732e0a7bffe53b939395589b
voice_chain:
  - ΣΩ.
  - ΛΥΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη, ὁ Λύσις,
    start_char: 21121
    end_char: 21134
review_status: accepted
```

```yaml
voice_id: voice_lysis_0192
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213e
char_span:
  start_char: 21442
  end_char: 21573
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 52d14b0afad7d3d56b14b63b7fe6cb4fa3becc6fec8076c3eb208a30b8746d8d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: καὶ εἶπον
    start_char: 21442
    end_char: 21451
review_status: accepted
```

```yaml
voice_id: voice_lysis_0193
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213e
char_span:
  start_char: 21575
  end_char: 21626
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8dfff7f7312bdf3a80e00bef6c1e86d907c298b1b1ec4d21dc51c824872c7f81
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0194
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 213e-214a
char_span:
  start_char: 21627
  end_char: 21964
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4e340a5a7f96a5d7d503c1b18cd4388598e19c980854101c3ff2a9b98449a3b7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0195
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b
char_span:
  start_char: 22093
  end_char: 22104
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 83ac33a31547396f5e4aa69d7e392e31296ee1a3ad5acfed597a1dc851620f5c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0196
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b
char_span:
  start_char: 22105
  end_char: 22305
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0860b528d73d42a438bde36b1a63466cd5d780aeac82cedc5022dea5795c8316
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0197
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b
char_span:
  start_char: 22306
  end_char: 22325
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cb3334a5fb7db84bd7fe46e5eeffeb62f0350edd054818bd5efe6cd086fc0a3c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0198
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b
char_span:
  start_char: 22326
  end_char: 22358
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 41b9b4c656b14fc815f507f79b0833023a95b6e0def129ebc751b5bba5a62490
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 22335
    end_char: 22344
review_status: accepted
```

```yaml
voice_id: voice_lysis_0199
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b
char_span:
  start_char: 22359
  end_char: 22369
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4c693f2c225d7f6ff995b654f944bde409c3dd2704fe9413cf5c8be54f86bf24
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0200
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214b-214c
char_span:
  start_char: 22370
  end_char: 22637
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1bc92e79b36959fb33bc1c5fa3f6910409bb0e26af8a7e7bdcc7fa860823576b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 22376
    end_char: 22385
review_status: accepted
```

```yaml
voice_id: voice_lysis_0201
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214c
char_span:
  start_char: 22638
  end_char: 22651
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 43a26bd3a09aedcfcf098292134c6361dd75c764f0e6ea636c9541b13a86264b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0202
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214c
char_span:
  start_char: 22652
  end_char: 22744
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3ac1ec50b99bf3ba66dca18fb1e95e8d0d7cfe134decd6a910362f8f13777b0b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0203
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214c
char_span:
  start_char: 22745
  end_char: 22758
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 53f99cc9f20690d28692b7f8a9fdc1b64aed1f134d2fba4ed6d122d942ab5f66
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0204
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214c-214d
char_span:
  start_char: 22759
  end_char: 23074
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 85beb481f24822791c86e2c1659df64c6aa4687ba3db883a0943d62f41d6d6f8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0205
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214d
char_span:
  start_char: 23075
  end_char: 23087
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ad6a8e3935c06cc27511f2c5ad8f0c581049bbf5b21a5af00ab12956e41c9397
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0206
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214d
char_span:
  start_char: 23088
  end_char: 23299
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a056a112521de8ed79be9482bcda5d6db4b939157a207caa31d0b08b1217f8c5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0207
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214d
char_span:
  start_char: 23300
  end_char: 23311
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 677cff0d181a5891e519e2179ed6afeb804f02e8058df1b958869631d3c116a1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0208
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214d-214e
char_span:
  start_char: 23312
  end_char: 23404
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9d1ba8d4ec0b62046953c632432fee6ec0c68d2d28611ecb85b85cb78cf33cbb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0209
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214e
char_span:
  start_char: 23405
  end_char: 23425
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 725f46442f7a160c2af1baa7b001f60621e87bfe144bbc850771a711c7c5aae0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0210
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 214e-215a
char_span:
  start_char: 23430
  end_char: 23871
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8f862323c3b26c6e23bdd1131ca9d9d8f8f21ba6241cc88646009fdc66286069
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 23440
    end_char: 23449
review_status: accepted
```

```yaml
voice_id: voice_lysis_0211
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 23872
  end_char: 23882
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a77863200311af3bc9da5d1854fb8e3b83328c8c38cedf491cdc389e2ff2143f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0212
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 23883
  end_char: 23910
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 89eb3c7e631d89c88159d30e6c6859d6b8b0a08494339837ecb86640c4008d3d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0213
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 23911
  end_char: 23919
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1a02d4b8712962cc615e39c04988ae411a1e8af7afca8f67d2718a5616960989
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0214
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 23920
  end_char: 24033
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: af692e1f7f77d1433131ce9f2391f650031474bb4b250d8f8767f34422a6509c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0215
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 24034
  end_char: 24039
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 03a5418a79453e34afef7d51feec7cd5095afc9f2b5c5ff98f3aac1ae01edd53
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0216
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 24040
  end_char: 24112
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 706b4bc7c121aa0ff520ef89b35969663397ebe617ee2ef3165021a7833ecbb6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0217
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 24113
  end_char: 24117
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0218
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 24118
  end_char: 24169
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e611b0df7d56ecc1a358f8763f1b2babdfc934f9bcf38fde58f00caca2fdaf12
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0219
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a
char_span:
  start_char: 24170
  end_char: 24181
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0220
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215a-215b
char_span:
  start_char: 24182
  end_char: 24228
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 17c5581acbc2b125bef4bac7f1afd8749234961a2c39cfc60177542be82ee27c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0221
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24229
  end_char: 24240
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ff4d9fc31ea6c1da9b0e734fc6aff20102b6fd15ee3f622c95720dacf383e6b4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0222
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24241
  end_char: 24271
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 526dbd3086e4069f28604005371fd2ef9be89993293e646bf368c71d2488a9b3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0223
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24272
  end_char: 24280
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0224
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24281
  end_char: 24307
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 35322624113461a1abf32939e4caf135befbd8c2b845352958dc84e4427772cb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0225
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24308
  end_char: 24320
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c061755a1459bd7e79982ceab37a843e00485585ad8f70509fffe746bed6505c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0226
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24321
  end_char: 24415
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7945684269892b85a1d539fbff0c590d30b59712fe4496ec8e2f15f63d9d85b7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0227
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24416
  end_char: 24450
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2859b5a502a91d17f10b8e4958d5a6b46f42452db626c841ebf183882da00102
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0228
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24451
  end_char: 24547
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0d3bb53db84dfeb2962fe558f8148a923940302bf550626686366679e87f5b1b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0229
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b
char_span:
  start_char: 24548
  end_char: 24561
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 61323f2dbbd93fa29b6c8fb03ec20d106afe46699ffd96e519a5f673c487de9f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0230
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215b-215c
char_span:
  start_char: 24562
  end_char: 24627
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1affc4e6ef668742b9ac36d3f9585212aaeb08fc1a93f24786f0cff172457386
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0231
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215c
char_span:
  start_char: 24628
  end_char: 24634
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0232
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215c
char_span:
  start_char: 24639
  end_char: 24703
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a3c1e070281b0120b63c124fc24958946f8c7cc2ecbf04321fca6286578e01df
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0233
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215c
char_span:
  start_char: 24704
  end_char: 24716
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 91d8efb5b45344229e555c264f3c846abd4225ee66f48e09af47bd9c46b3d398
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0234
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 215c
char_span:
  start_char: 24717
  end_char: 24897
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fef907ccb18ec90d327e90cee747de7e2c6bc4cd489822e94fd6b54b2f84cbc2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0235
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216a
char_span:
  start_char: 25990
  end_char: 26035
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4d23589dc9ef03d997416e7b683a26ded8032e30482b47d5920d960da618e3c6
voice_chain:
  - ΣΩ.
  - ΜΕΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Μενέξενος
    start_char: 25997
    end_char: 26012
review_status: accepted
```

```yaml
voice_id: voice_lysis_0236
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216a
char_span:
  start_char: 26036
  end_char: 26089
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ef03c76302a1d00b702bbabe22061da05fa16267068adf055c78d5289c60a538
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0237
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216a
char_span:
  start_char: 26090
  end_char: 26098
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0238
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216a-216b
char_span:
  start_char: 26099
  end_char: 26340
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d02d72b0251e36029d85b14458c4a59359ed30475a0f78f645b4f17bd8b5bcca
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 26105
    end_char: 26114
review_status: accepted
```

```yaml
voice_id: voice_lysis_0239
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26341
  end_char: 26348
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0240
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26349
  end_char: 26412
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e7e587fdf6d4cb070d03fedd2111a5cc1f51f3dd6bcb1d7e6ea4a311d628677d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0241
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26413
  end_char: 26427
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b566c0b97608577208ef7ac5c220dbbffe8698f8745f5a4d5c812421643e8f74
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0242
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26428
  end_char: 26499
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbfd6499d3be640af030996474abd28afe1f80aebd1b41c4034ca6c37349406b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0243
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26500
  end_char: 26529
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c10bfd8283aedf7457cf4b5db3ecc08bf5d8bc6eff380338d8c3096aeb19df95
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0244
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26530
  end_char: 26649
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8a0d98156c3a66b7fd5d70d6d08775172173cc75754f2c89b6fe8aac18421fb2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 26543
    end_char: 26552
review_status: accepted
```

```yaml
voice_id: voice_lysis_0245
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26650
  end_char: 26657
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0246
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b
char_span:
  start_char: 26658
  end_char: 26720
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 52694d7afede683b120c522c01d11103b90ce121906ac1306a8abc621348ee6a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0247
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216b-216c
char_span:
  start_char: 26721
  end_char: 26739
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4447c50ce1b12c04cfc9d8f7e1eecfd500b4a078984e41dde578d93eb2037d67
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0248
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216c
char_span:
  start_char: 26744
  end_char: 26904
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 881674fbeb168f1f5c51a102a2c9d4990c9c3aeced1e054644022cf86ab622e8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0249
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216c
char_span:
  start_char: 26905
  end_char: 26926
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8089812e62c2bcb95f81edfbcab69f41e628d1c43bf79e51fd8fe132e2418498
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0250
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216c-216d
char_span:
  start_char: 26927
  end_char: 27246
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 615465eefd13cd7d9378bd96898a7f2de353425b2dc2cf9f6eca07550a809912
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 26940
    end_char: 26949
review_status: accepted
```

```yaml
voice_id: voice_lysis_0251
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216d
char_span:
  start_char: 27247
  end_char: 27253
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0252
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216d
char_span:
  start_char: 27254
  end_char: 27491
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ce53bcc0cca4c4368d936dc2737f8fa01dbe05eb3f311ea05ff09f4729f2cc15
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0253
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216d
char_span:
  start_char: 27492
  end_char: 27506
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 49c9a26252509eba13f30d39339d549fc90fbe06c5f4b6c585946f89b5c1c074
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0254
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216d-216e
char_span:
  start_char: 27507
  end_char: 27790
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7c002cef2437678069a9d54db45c7eb3238c328511740f151ae2273f3d060151
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0255
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e
char_span:
  start_char: 27791
  end_char: 27797
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0256
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e
char_span:
  start_char: 27798
  end_char: 27845
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3e45cd142b704aec8545e47d399f5bb17bae2bd01cf8c3c69ebc4df601bf3da6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0257
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e
char_span:
  start_char: 27846
  end_char: 27850
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0258
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e
char_span:
  start_char: 27851
  end_char: 27917
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 005946913a8eb91a55a34117a3f16fcd44900daaf5c7e98700e657b512b0cb9c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0259
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e
char_span:
  start_char: 27918
  end_char: 27930
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c061755a1459bd7e79982ceab37a843e00485585ad8f70509fffe746bed6505c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0260
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 216e-217a
char_span:
  start_char: 27932
  end_char: 28015
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 65f2f207159bf9cee0ed6d9be2ae775cf3e674bd0b0467e845bb90e6ec9b5f6b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0261
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217a
char_span:
  start_char: 28016
  end_char: 28034
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e39a0e477ee34c6c180c0d770d0259fe80f70c8c24cd7cd79692da81f38cb8a6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0262
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217a
char_span:
  start_char: 28039
  end_char: 28265
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f47788b47c2e328d416a0cde5239231146c62f5986bd7e72801c2f93cb262296
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 28058
    end_char: 28067
review_status: accepted
```

```yaml
voice_id: voice_lysis_0263
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217a
char_span:
  start_char: 28266
  end_char: 28273
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9de510dad0c06d567c61272fd4b2bd725af3e019ad4d7fc4ee1e1b0466de1c73
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0264
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217a
char_span:
  start_char: 28274
  end_char: 28308
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fbc5608f6bbc79d2bfc997860a59973811b11bebb7361c49cb52ebe6fd75fcca
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0265
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217a-217b
char_span:
  start_char: 28309
  end_char: 28327
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 961d500d5d059a086eb09bb0818368808975f17a1c0384bb952be077e49018e9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0266
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28328
  end_char: 28379
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ebf71a11e59a09fc114ca7eae68184cce5567720efaad585d5208e97e7761379
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0267
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28380
  end_char: 28384
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0268
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28385
  end_char: 28442
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a1e1842895e777d2c1d13634612ccede5f13da99bcb9c35d8d81ca6e990b2ef6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0269
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28443
  end_char: 28449
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 30860861884e5a23e0ee536893a55b4a528ad8c486ed5c269deeeff0c0455e75
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0270
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28450
  end_char: 28514
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 584e26e3c26084f004f704ce2ec652b5aa02c4bbec8c79f4a548618095f6551c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0271
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28515
  end_char: 28525
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a23fd1a5904ad3ea14ecbd9aef7482d6faf2b596ad38fcd5053dcacc8a7ceacb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0272
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28526
  end_char: 28602
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ab0e1f25dd75a11850d22a5a39939d19b2edffbfa87bcb67e05249619e14562d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0273
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b
char_span:
  start_char: 28603
  end_char: 28610
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0274
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217b-217c
char_span:
  start_char: 28611
  end_char: 28814
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d60422acccc29ef3587f45b7ec8d49c95fa1f54ff73cd9a24d5bd4bc865f4775
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0275
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217c
char_span:
  start_char: 28815
  end_char: 28828
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 26d0deeb5754643b8d9c894d38d5879fad2ed7d3d03e99b9be8b943e728f3674
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0276
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217c
char_span:
  start_char: 28829
  end_char: 29031
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e65977d9cefa06b25aa693ff7e9af228584a75031a95206174d2ac18c77b5c93
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0277
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217c
char_span:
  start_char: 29032
  end_char: 29040
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0278
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217c-217d
char_span:
  start_char: 29041
  end_char: 29116
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b57ffe83aa65f40dd1702404409fa9fd5f7a0a923af8a342d8a4e7db0818a1dd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0279
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29118
  end_char: 29138
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7dc0a2042aa7d787c26863e022d6df332dd0c306708d4db618ad38dbc0ae9cde
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0280
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29139
  end_char: 29254
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 97320325a12a1f11e16c8780980034d8e5c0d40cfed4259adbf2889db78a52f3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 29149
    end_char: 29158
review_status: accepted
```

```yaml
voice_id: voice_lysis_0281
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29255
  end_char: 29277
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b567797ea2549d1ee04b86e557bbf51a829500acc0014f86e7b7e0c7eba2333c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0282
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29278
  end_char: 29315
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 132f5c84b5f6b5b781b26daac8c5e94e848ff69d0a5effad10094460ae0c9569
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0283
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29316
  end_char: 29320
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0284
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29321
  end_char: 29426
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3ba3aef14100f384bb77c83595e6371c1ff8f5ed3e07c892e68257df766b6a48
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0285
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d
char_span:
  start_char: 29427
  end_char: 29433
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0286
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217d-217e
char_span:
  start_char: 29434
  end_char: 29562
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 03af7d6046684183a8b819f3e56303e1f2f390ee780e0a389950af7727f61cf1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0287
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e
char_span:
  start_char: 29563
  end_char: 29574
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0288
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e
char_span:
  start_char: 29575
  end_char: 29711
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4a7aa64c4f9d636a31eb707f1ee6ccdb017058544bb9642ecb4f3f9ef621867a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0289
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e
char_span:
  start_char: 29712
  end_char: 29729
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fb9bf8a018da8323d2c55e549e3e83f8bcd0c1708554d5bebbf346c88c424c7d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0290
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e
char_span:
  start_char: 29730
  end_char: 29841
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 12e731f101d8064536e0c7e7359bc8987ac4a193eb2374e7454f6e86d35d0453
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0291
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e
char_span:
  start_char: 29842
  end_char: 29850
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0292
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 217e-218a
char_span:
  start_char: 29851
  end_char: 30111
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6957722691a122fd2c7c8cf2d30280ad4c3461320a6f5dcdf1356d10dc300cc8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0293
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218a
char_span:
  start_char: 30112
  end_char: 30123
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ff4d9fc31ea6c1da9b0e734fc6aff20102b6fd15ee3f622c95720dacf383e6b4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0294
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218a-218b
char_span:
  start_char: 30124
  end_char: 30715
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0780900e9d67c3bb1d0846fed5cdea0962f25fdbe0205ff2ed6f3d0213afaa7d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0295
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218b
char_span:
  start_char: 30716
  end_char: 30732
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 42c8f071281bd2ff21a6a4f83bfce5a8a448c5d5ac26581f6efb5e30a1646b1d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0296
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218b-218c
char_span:
  start_char: 30733
  end_char: 30970
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d6d18a6d4e981fd96454e2eea20c86e373dee5f6064cc47a584eec185602132b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 30742
    end_char: 30751
review_status: accepted
```

```yaml
voice_id: voice_lysis_0297
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218c
char_span:
  start_char: 30971
  end_char: 31026
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3506d81ad5b6cca900d6ed88a1c069b11fe06d7d3adb8cf2f85d09246a99642a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0298
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218c-218d
char_span:
  start_char: 31031
  end_char: 31307
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 35036d6b05473a69828d3f0362db4b5749a97c5aaf6a68c16d062c78dfeb7537
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 31230
    end_char: 31235
review_status: accepted
```

```yaml
voice_id: voice_lysis_0299
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31312
  end_char: 31340
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c3c07f9008f71a4e7d4fac10f3a3d67b764e271068b716b98b76251a9046b51e
voice_chain:
  - ΣΩ.
  - ΜΕΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Μενέξενος
    start_char: 31324
    end_char: 31339
review_status: accepted
```

```yaml
voice_id: voice_lysis_0300
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31345
  end_char: 31468
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 40211767d5b04884203b458119bc9b0c60c2613c8b18ced9a4a18f241a111d48
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 31355
    end_char: 31364
review_status: accepted
```

```yaml
voice_id: voice_lysis_0301
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31473
  end_char: 31485
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 91d8efb5b45344229e555c264f3c846abd4225ee66f48e09af47bd9c46b3d398
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0302
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31490
  end_char: 31561
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d1fe0b721cbacfc4d3b18b87218e8aed281f38f42c839ace789e36cdbbceb754
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 31495
    end_char: 31504
review_status: accepted
```

```yaml
voice_id: voice_lysis_0303
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31562
  end_char: 31574
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 957a4d55b1da4147f13d447b0b3012b678cd7c823196ab62661f64de79d59e7c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0304
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31575
  end_char: 31639
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6f9fd5c444b4ebb1eb4de6e2e4daa5f37931118b6aa9974b347d93d04be408ab
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0305
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31640
  end_char: 31661
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4d552f376f340143122e6144240866ad745b5b90b85768479ac068daf1fd0990
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0306
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218d
char_span:
  start_char: 31662
  end_char: 31762
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: c2ffbb6466f1e72dfe16b230b16365b3d91c8d0f0c6bf409129c99f956be53ed
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0307
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31764
  end_char: 31792
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 74314b88059d9f38986aa1141936df21778878749840821b119835da96c0aad8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0308
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31793
  end_char: 31938
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 67cb02dba366f1b31602b94d54d4204b9236614480796eaadd4cfe987a68436e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 31805
    end_char: 31814
review_status: accepted
```

```yaml
voice_id: voice_lysis_0309
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31939
  end_char: 31943
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0310
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31944
  end_char: 31992
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 210ef568829e6cc5df3373f5d1294d9cdfc44e76985bdbbe1864fc102a01747f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0311
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31993
  end_char: 31997
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0312
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 31998
  end_char: 32018
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 311c07309f93b6e6f7631e3f5a846ae1bc0260047eddcc9d3923094754cb9334
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0313
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 32019
  end_char: 32029
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4a1296ee40f137e1b4341eb599b4ce66c47c9e6e6937f4c02bb1fdc44105e83a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0314
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e
char_span:
  start_char: 32030
  end_char: 32081
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0bfc3f87fb013e5f3a675fc7883973cf219f50564c41bae2de57e9aace817f65
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 32044
    end_char: 32053
review_status: accepted
```

```yaml
voice_id: voice_lysis_0315
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 218e-219a
char_span:
  start_char: 32083
  end_char: 32102
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 79c1ef0b3d822a87b403baa6964fba4919f60c3e95ca4582d9df2aac5100f7a4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0316
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32103
  end_char: 32346
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f25910745d971aaa2d8a63cc444fc14c0a3d00fa3c65f0f44793e8e05d6187e8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0317
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32347
  end_char: 32351
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0318
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32352
  end_char: 32381
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8c506056351e333ca2fe4ade1f71c9b128847c4f8b6bf9585b92ac428c958778
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0319
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32382
  end_char: 32388
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d754e8392c787e7029b3c7283a5777e78801a6bea97caf6f96b1f41501dc28db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0320
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32389
  end_char: 32407
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: eb4dabe9d69f18fa2d6c00da22e312a7a4246ae9ec51ae78ebeb255ca0c4c65c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0321
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a
char_span:
  start_char: 32408
  end_char: 32416
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0322
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219a-219b
char_span:
  start_char: 32417
  end_char: 32531
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7901aa6087ad3ead1243d7a192ad0079526b40577520afea95c3e54a1beeec4a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0323
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219b
char_span:
  start_char: 32532
  end_char: 32541
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0324
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219b
char_span:
  start_char: 32542
  end_char: 32614
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: abbb30e31579b3274e04e2e17e57b60e95706365d02b821abfd3e0c8e8416e61
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0325
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219b
char_span:
  start_char: 32615
  end_char: 32622
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0326
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219b-219c
char_span:
  start_char: 32627
  end_char: 32951
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cf200a71eb6c83f58f5d7399a69fc7fb5b9714fd9179344dff5b0c27df339472
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 32633
    end_char: 32642
review_status: accepted
```

```yaml
voice_id: voice_lysis_0327
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 32952
  end_char: 32956
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0328
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 32957
  end_char: 32983
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 027902f647af59df948e16db8c7c338f877a4cfc8d670cdeb62a9a1c56403d99
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0329
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 32984
  end_char: 32992
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0330
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 32993
  end_char: 33017
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 7b048f2c452a147286e5dfc2bd7764c9f69a4c798b6ff859c98516dfdabbb278
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0331
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 33018
  end_char: 33022
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0332
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 33023
  end_char: 33080
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 30107da67d63b54504065df2e5bd3d3acc6b79ad5da95dca414ed4aa4cae728d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0333
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 33081
  end_char: 33089
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0334
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 33090
  end_char: 33135
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: fca009e53cfb2a6ccb9412594c1155cf2e2f2e0b8bb8847c47b0db5494cc048f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0335
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c
char_span:
  start_char: 33136
  end_char: 33140
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0336
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219c-219d
char_span:
  start_char: 33141
  end_char: 33344
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9ae2365291eeeefbc381b965718df82db0578db480a5be038377e571f1f815b7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0337
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219d
char_span:
  start_char: 33345
  end_char: 33352
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0338
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219d-219e
char_span:
  start_char: 33353
  end_char: 33850
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: bb2789127c13fd89d0fa3b061d90261abb40b51e122e0cdf789186b4da49ea60
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0339
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219e
char_span:
  start_char: 33851
  end_char: 33863
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0e7a950184b3d6c21d7b7a5308bd058223a225476f8b582774fd50ad2133fccb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0340
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219e
char_span:
  start_char: 33864
  end_char: 33906
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: af58b67ba62c95cc7a92c2464f6a46912f3cb117a9222a42de7c142447fd0363
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0341
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219e
char_span:
  start_char: 33907
  end_char: 33915
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0342
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 219e-220a
char_span:
  start_char: 33916
  end_char: 34471
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 30442f4deff4b054efb6ecba510196a839007019482c28efeab6e84988c53911
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0343
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220a
char_span:
  start_char: 34472
  end_char: 34480
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0344
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220a-220b
char_span:
  start_char: 34481
  end_char: 34713
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 3d4386b5e890990ca097cd4c38cd55c495f351b7a51cfb02dcbbf10c0888e22d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0345
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b
char_span:
  start_char: 34714
  end_char: 34743
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 969d6c08dae0436ec296edc7462427675ee798bec5d6b8ba5ec779ca09b31aaf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0346
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b
char_span:
  start_char: 34744
  end_char: 34804
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a2003ad5a21a1de56ae85607adff591365814f6b7e3a195c994f69d471213b17
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0347
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b
char_span:
  start_char: 34805
  end_char: 34811
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0348
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b
char_span:
  start_char: 34816
  end_char: 34915
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 250d56445792d285c763dd3e1b8348cdc7a3c92b46fae1112607096b3932333b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0349
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b
char_span:
  start_char: 34916
  end_char: 34929
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 47c5d98b3f58c9a0d5c5473296b042c3f918a2fc2b26979afaafa94a6348b423
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0350
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220b-220d
char_span:
  start_char: 34930
  end_char: 35716
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 1a8baeca3e95c52f381db1fcaced3429b857da6a2e27245a13496899bf7a7906
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0351
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220d
char_span:
  start_char: 35717
  end_char: 35746
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cbe74495410a47ba3d7bef9d5cb5198b71da5663bfbfbc94444769c4eb436661
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0352
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220d-220e
char_span:
  start_char: 35747
  end_char: 35808
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6f0eb0dc8d588df331c3ab35cceb963f4560ef494236cf396d3466adcee997c8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0353
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220e
char_span:
  start_char: 35810
  end_char: 35853
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9d879da2a697d64f1ffa661c5102859d82868e2d154618abee8a64228d486e43
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0354
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220e
char_span:
  start_char: 35854
  end_char: 36092
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 460d9dd680834e4fbcc1cf70a2b1a03079961b68e6b25634d3b1f1408ff23dd7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0355
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220e
char_span:
  start_char: 36093
  end_char: 36130
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: da46a6fbc927bdcf06abcc05a240cb014a30d1df4d88cf988bfd4f597a7137cf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0356
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 220e-221a
char_span:
  start_char: 36132
  end_char: 36573
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b57bb6c1b2424e9c86d6470f44fcd95371870e47c5f9abe9c5747b492083d4b5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 36141
    end_char: 36150
review_status: accepted
```

```yaml
voice_id: voice_lysis_0357
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221a
char_span:
  start_char: 36574
  end_char: 36582
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0358
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221a-221b
char_span:
  start_char: 36583
  end_char: 36731
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9d76ba76f9e746845bb82072cff68eaa6a956d7d880d5b63388db6f6f53f4842
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0359
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36732
  end_char: 36742
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: bc21d808165261a9d296fd99463ab5cbd9eba92f493492414d34b43de48cc362
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0360
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36743
  end_char: 36840
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a772848dd08ffc037f366c1a6d29b42f666c371671b4ca6769926d4cf34a9ae2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0361
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36841
  end_char: 36847
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a73ddeb23171c290e3930174badfaf6e2cbe0a1ff477c8c2107ee9aa420dd7ef
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0362
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36848
  end_char: 36921
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: e16330e74fc04cc839d758c0a4874b4d29c829670a34f79d02c89cafef8a4b4b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0363
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36922
  end_char: 36931
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0364
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 36932
  end_char: 37010
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: bf810c0214f6ade87121cc2236a9eab26059b8022e5d192b99a95823d28a64aa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0365
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b
char_span:
  start_char: 37011
  end_char: 37028
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9c9489a941377f638ee6f3cc8c7481829db44b3bf637f99c3b911eebd5c0240f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0366
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221b-221c
char_span:
  start_char: 37029
  end_char: 37093
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 84d387987abe9d4ab7005d369a29809762d556b2eb889f398a75cdd0327024de
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0367
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221c
char_span:
  start_char: 37094
  end_char: 37098
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0368
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221c
char_span:
  start_char: 37099
  end_char: 37275
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d3e73122c411f89018408576fe74d64de713095c48828df883d7dab1bfb823cd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0369
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221c
char_span:
  start_char: 37276
  end_char: 37289
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f1f87200548066727318873fe019a3155902e879ffe9f4d70b972afe7f9c0866
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0370
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221c
char_span:
  start_char: 37290
  end_char: 37420
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 9a9cae6efdaeec96829f48149d17adb6d0dd03f1f190644cc4dcfa3d51f6f560
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0371
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221c
char_span:
  start_char: 37421
  end_char: 37427
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0372
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221d
char_span:
  start_char: 37429
  end_char: 37509
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2b2a68862532b13507b0d8d82d06b4dda6d3c3340fc18456c170dc16e85dfa4e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0373
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221d
char_span:
  start_char: 37510
  end_char: 37517
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0374
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221d
char_span:
  start_char: 37518
  end_char: 37740
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 0385a878146bd0d7e4975bef5919b4a08eb22511768c4f6a225d31dbddafc52d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0375
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221d
char_span:
  start_char: 37741
  end_char: 37757
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 349ef71d535507c8be81150ccb1737c97f004cd20fe2d7b55bfe0b9897df0fa7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0376
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221d-221e
char_span:
  start_char: 37758
  end_char: 37845
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: ae840bbfa7ad1f085d17467e27ce110de0b1a89442810e4b334d15857571dc48
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 37771
    end_char: 37780
review_status: accepted
```

```yaml
voice_id: voice_lysis_0377
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37846
  end_char: 37850
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0378
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37851
  end_char: 37897
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f9f4918b6172c0e2a10dc50b7e1b0267e5b4f8942df943cb32a322613b88346a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0379
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37898
  end_char: 37908
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: a23fd1a5904ad3ea14ecbd9aef7482d6faf2b596ad38fcd5053dcacc8a7ceacb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0380
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37909
  end_char: 37947
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6e30356d232533e4e1777273f3fd26434b45a8556ec34782de29c6ef1100e3d5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0381
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37948
  end_char: 37958
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 4a1296ee40f137e1b4341eb599b4ce66c47c9e6e6937f4c02bb1fdc44105e83a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0382
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 37959
  end_char: 38074
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 5a20d57e2377e58a313496bfa5c9af90b25353656d856d9c0279d176815b3079
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0383
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 38075
  end_char: 38085
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 6cb7bb3fba315be78d87645a10cf8cb549c17c555161dc674f0831c7b0334edb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0384
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 38086
  end_char: 38155
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: bdcf7c521b3727fe967906096321686a06e33aab8a3325f59e4e20a89960cd0e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0385
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e
char_span:
  start_char: 38156
  end_char: 38171
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: d41250839936e153041e4fb2e64e5286c647a270f4a7b50e41c5ea52fca44779
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0386
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 221e-222a
char_span:
  start_char: 38173
  end_char: 38391
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: af6f34365949cb28716193a66df47274e76806a02c51be00ddee6dd57daf60d0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 38212
    end_char: 38221
review_status: accepted
```

```yaml
voice_id: voice_lysis_0387
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222a
char_span:
  start_char: 38392
  end_char: 38438
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 8b51f31bea0abccf5f545fe0a03452e1c3a1c5320483bf4728d896782a9fffb3
voice_chain:
  - ΣΩ.
  - ΜΕΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Μενέξενος
    start_char: 38401
    end_char: 38416
review_status: accepted
```

```yaml
voice_id: voice_lysis_0388
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222a
char_span:
  start_char: 38439
  end_char: 38511
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 14183da8ebec8cfcf652dbed6c527b0477ca3a995f595ee784f7b96ab2b5e766
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 38445
    end_char: 38454
review_status: accepted
```

```yaml
voice_id: voice_lysis_0389
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222a
char_span:
  start_char: 38512
  end_char: 38524
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f66ece7f2894d93576bc337c9c925493b82a1504feeb4b1f8a6bb9c6b270e6db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0390
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222a
char_span:
  start_char: 38525
  end_char: 38601
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 911e28756c45e65f8f2027b7c488fdacad4c1a88b613543aafd7fda1f8d2c2f0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0391
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222b-222c
char_span:
  start_char: 38724
  end_char: 39205
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 43a14b3ec9b8318dd86c27b8fade60026d32a2d4b1b68598220f2e5c82fe0105
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: εἶπον
    start_char: 38732
    end_char: 38737
review_status: accepted
```

```yaml
voice_id: voice_lysis_0392
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222c
char_span:
  start_char: 39206
  end_char: 39214
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0393
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222c
char_span:
  start_char: 39215
  end_char: 39399
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: efad8fbdc17e240d7f5bc847f7c2a959f33f6acad08d68a553e9f81bae7be1b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0394
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222c-222d
char_span:
  start_char: 39400
  end_char: 39463
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 30813e28c067325a7214f93c61570cd9aa1361acfb5dc16c0df7fcd32db7c462
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0395
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d
char_span:
  start_char: 39464
  end_char: 39655
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 856a47db36f1db08b437c97ee87ab2e0548c190b580465930a850230e43533af
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 39475
    end_char: 39484
review_status: accepted
```

```yaml
voice_id: voice_lysis_0396
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d
char_span:
  start_char: 39656
  end_char: 39668
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: f66ece7f2894d93576bc337c9c925493b82a1504feeb4b1f8a6bb9c6b270e6db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare third-person or plural response bounds this utterance but does not identify a single owner; alternation is not attribution.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0397
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d
char_span:
  start_char: 39669
  end_char: 39764
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2cdb5fccc4d358f5bd1d39324c4b8510cad16ed8a5e1ca1c2ddbb2603d188b0c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0398
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d
char_span:
  start_char: 39765
  end_char: 39773
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0399
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d
char_span:
  start_char: 39774
  end_char: 39840
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b3a691586e3dcd46711f23fe089bec6cb6dfba5b7c173e1ce580a0731ec274d9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0400
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222d-222e
char_span:
  start_char: 39841
  end_char: 39858
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 60d31dd03a5da6e027bc3b801ec30194a1ef96f02e29c5567eedd311430bc823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0401
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222e
char_span:
  start_char: 39863
  end_char: 40136
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: b27853636b1239d4e9352d432afdf75b006898f61044984ffb56ec0819f1f89f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0402
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222e
char_span:
  start_char: 40137
  end_char: 40178
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 19f4ddbd48828a264ccfba10bef35ca128da55c03a4f2867f14a9df46a2cab33
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0403
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 222e-223a
char_span:
  start_char: 40179
  end_char: 40247
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 34816892e9503a0e52bcced38d3bf8f3279a36c0b6dd1e8438c4bb7ffcbef1b8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: This bounded utterance has no owner-bearing reporting formula. The surrounding Greek cannot license attribution by content or turn alternation.
review_status: accepted
```

```yaml
voice_id: voice_lysis_0404
source_work: Lysis
outer_turn_id: turn_lysis_0001
stephanus_span: 223b
char_span:
  start_char: 40828
  end_char: 41069
source_path: raw/plato/greek/lysis.txt
source_sha256: c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35
span_sha256: 2019ff9d7aa31a181c62452c8c0192de2b3dd7513f331e1913d67ddb7e099d01
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: νῦν μέν, ἦν δ’ ἐγώ
    start_char: 40828
    end_char: 40846
review_status: accepted
```
