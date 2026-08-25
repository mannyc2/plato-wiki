# Charmides — Voice Ledger

Reported-speech structure for the single required unlabelled outer turn, `turn_charmides_0001` (153a–176d). The frame is Socrates' first-person narration; every extracted inner span below it is reviewed directly against `raw/plato/greek/charmides.txt`.

All records are accepted as one atomic cohort. Only a local Greek reporting formula resolves an inner owner. Bare `ἔφη`/`ἦ δ’ ὅς` turns remain unresolved, rather than being filled by alternation, doctrine, or a preceding speaker. Homer and Cydias are quoted within Socrates' own argument and are excluded; Zalmoxis is reported in indirect `ὅτι` discourse and is likewise not a nested direct turn.

## Records

```yaml
voice_id: voice_charmides_0001
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153a-176d"
char_span:
  start_char: 0
  end_char: 50785
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: unlabelled_turn_frame
    role: cue
    text: "ἥκομεν τῇ προτεραίᾳ"
    start_char: 11
    end_char: 30
  - kind: unlabelled_turn_frame
    role: cue
    text: "ὦ Σώκρατες"
    start_char: 504
    end_char: 514
review_status: accepted
```
```yaml
voice_id: voice_charmides_0002
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153b"
char_span:
  start_char: 407
  end_char: 550
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "68e5c46395ce69bc3758aeeac5a6f1b2f95c6ba927e2a279e91de7fc663aebf9"
voice_chain: ["ΣΩ.", "ΧΑΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "Χαιρεφῶν δέ, ἅτε καὶ μανικὸς ὤν, ἀναπηδήσας ἐκ μέσων ἔθει πρός με, καί μου λαβόμενος τῆς χειρός, ὦ Σώκρατες, ἦ δ’ ὅς"
    start_char: 407
    end_char: 523
review_status: accepted
```

```yaml
voice_id: voice_charmides_0003
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153b"
char_span:
  start_char: 646
  end_char: 706
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "af2b983607e772acd256a5c54d2dbfb6068f3613eaf32a328a6e3e6c8ca79e82"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 688
    end_char: 692
review_status: accepted
```

```yaml
voice_id: voice_charmides_0004
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153b-153c"
char_span:
  start_char: 710
  end_char: 824
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "abae7be9b22aabc128444e6c8c88c311be7d99c6291fa4954581c46dabaac649"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0005
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153c"
char_span:
  start_char: 828
  end_char: 871
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a3de7660c488f29042c0b17563ed25d8cc30f1f1469732c71c693af7606d7e7a"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 842
    end_char: 851
review_status: accepted
```

```yaml
voice_id: voice_charmides_0006
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153c"
char_span:
  start_char: 875
  end_char: 908
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fc3848c1dbe3a86f4d68c5aba8e765fbbcf6621548d487c7d9693aefad51fe96"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0007
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153c"
char_span:
  start_char: 912
  end_char: 925
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9d889a0fa941e37e2679044b3bda90dc785a96886ee3ca9dbbf4ea7b1cc0c612"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0008
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153c"
char_span:
  start_char: 929
  end_char: 1061
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4533a9ec7592a360036a62b12dbe9a7e3d9f9cf7338e4340d4f422c68fe4f3c8"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0009
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "153d-154a"
char_span:
  start_char: 1425
  end_char: 1796
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b8e059e3d999c10ebc52b25a76f07435345cc7fb746f87fc5267f07bf4f46270"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Κριτίας ἀποβλέψας {154a} πρὸς τὴν θύραν, ἰδών τινας νεανίσκους εἰσιόντας καὶ λοιδορουμένους ἀλλήλοις καὶ ἄλλον ὄχλον ὄπισθεν ἑπόμενον, περὶ μὲν τῶν καλῶν, ἔφη"
    start_char: 1429
    end_char: 1589
review_status: accepted
```

```yaml
voice_id: voice_charmides_0010
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154a"
char_span:
  start_char: 1800
  end_char: 1837
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d9d53d5ec365b7fa39216ffb9c6d867ef07c678ee103d3b43c9a8568d153ce10"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 1810
    end_char: 1819
review_status: accepted
```

```yaml
voice_id: voice_charmides_0011
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154a-154b"
char_span:
  start_char: 1841
  end_char: 1978
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fa576adabcf7c2f3fb4f2712c007686db0bd14f97a50903bbb0ae071c595600b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0012
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154b"
char_span:
  start_char: 1982
  end_char: 2103
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6c05a892aa37a47416ba2818331f38f5de8e0bdd671afd42bb559aaca89d671d"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 2002
    end_char: 2011
review_status: accepted
```

```yaml
voice_id: voice_charmides_0013
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154b"
char_span:
  start_char: 2107
  end_char: 2206
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5fde866ea86c61f97a48606698fd24e46fd5806cc4e14449b1c65c4d46db865b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0014
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154c-154d"
char_span:
  start_char: 2803
  end_char: 2899
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ec90475080ce578432b670de4238d512a686ca218b0d55a2a4c06c6275fcf9c0"
voice_chain: ["ΣΩ.", "ΧΑΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ {154d} Χαιρεφῶν καλέσας με, τί σοι φαίνεται ὁ νεανίσκος, ἔφη"
    start_char: 2807
    end_char: 2869
review_status: accepted
```

```yaml
voice_id: voice_charmides_0015
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154d"
char_span:
  start_char: 2903
  end_char: 2924
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "588c6db268c6a8a3dab8446e814d73671d34ea273e04e576abbd660b934b26e0"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 2913
    end_char: 2922
review_status: accepted
```

```yaml
voice_id: voice_charmides_0016
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154d"
char_span:
  start_char: 2928
  end_char: 3025
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c597aa2b8bd4bdcf9ed8655f34848b7e7876c3064c3e2c95a47e3267cd46fe64"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0017
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154d"
char_span:
  start_char: 3083
  end_char: 3185
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6f8ee31ef42a029d5815846014f8c5524cec358458d68084e33a6cbee02a69f7"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 3099
    end_char: 3103
review_status: accepted
```

```yaml
voice_id: voice_charmides_0018
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154d-154e"
char_span:
  start_char: 3189
  end_char: 3215
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "afc553f8f60aece9a849c3519407d3057dc5fb3e8ca252b8eea7bea6fdccecf9"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἔφη ὁ Κριτίας"
    start_char: 3193
    end_char: 3206
review_status: accepted
```

```yaml
voice_id: voice_charmides_0019
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154e"
char_span:
  start_char: 3219
  end_char: 3340
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7647624809b6a22329eef52a1d3c1524a977271c022026f27080a31e0e0bc22a"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 3233
    end_char: 3242
review_status: accepted
```

```yaml
voice_id: voice_charmides_0020
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154e"
char_span:
  start_char: 3344
  end_char: 3394
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "eb13a1ab9a5c408832483b3f48267b3b2570703cfc3a2b8a22e9fd747b0faa97"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0021
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154e"
char_span:
  start_char: 3398
  end_char: 3533
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "56bd79cb65798541c7fc7df9df40f679a8393c3cfb450a867e301dc60ec2a029"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 3406
    end_char: 3410
review_status: accepted
```

```yaml
voice_id: voice_charmides_0022
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "154e-155a"
char_span:
  start_char: 3537
  end_char: 3655
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b801c972c9aa8d9b3e152e520f698d95e27fb4eac58e7545098efd4be8186bab"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἔφη ὁ Κριτίας"
    start_char: 3550
    end_char: 3563
review_status: accepted
```

```yaml
voice_id: voice_charmides_0023
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155a"
char_span:
  start_char: 3659
  end_char: 3942
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f14b343ca0b71d8f7a9e662ac039b5207af94eb36f49ee96d8f1cfa5ac08e5b8"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 3670
    end_char: 3679
review_status: accepted
```

```yaml
voice_id: voice_charmides_0024
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155a-155b"
char_span:
  start_char: 3946
  end_char: 4309
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "16a9f34a68f9cbf83aa552b396f22bf1297300f602a555c8a22265c749c00756"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Κριτίας, Ἔναγχός τοι ἔφη"
    start_char: 4161
    end_char: 4187
review_status: accepted
```

```yaml
voice_id: voice_charmides_0025
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155b"
char_span:
  start_char: 4313
  end_char: 4345
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6966c06c9e56f3405fcd89c426be7ce1aeaba0b2ea2d51a89b222c473ad90e4f"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 4320
    end_char: 4329
review_status: accepted
```

```yaml
voice_id: voice_charmides_0026
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155b"
char_span:
  start_char: 4349
  end_char: 4365
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "23b14d3940599830637bf46126646109ed9a08918216f5fa8ad9d28afc8d102e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0027
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155e"
char_span:
  start_char: 5432
  end_char: 5456
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "59d1176b291b17c5ce4ad011a0c6e57658ec2d255107619cd58949439c4fa99d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0028
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "155e-156a"
char_span:
  start_char: 5460
  end_char: 5666
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "791825283a53f5a1c3b49132bda7306f0e16f26caf59e875089ecdf6b03d4341"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπον"
    start_char: 5468
    end_char: 5473
review_status: accepted
```

```yaml
voice_id: voice_charmides_0029
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a"
char_span:
  start_char: 5670
  end_char: 5724
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "82a90337de14bb03a1658715b4525b2d63aaea146f0f7a012eb66d67005e6b16"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0030
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a"
char_span:
  start_char: 5728
  end_char: 5772
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f663abc52380e9925f7d28211ec6a98618d8eb515adee4b6b3a0a13a37b2eab5"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 5737
    end_char: 5746
review_status: accepted
```

```yaml
voice_id: voice_charmides_0031
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a"
char_span:
  start_char: 5776
  end_char: 5820
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f1b412adf1e5f4f32c9a17010ca6623aa1b64922335228137435d3bc2bd87010"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0032
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a"
char_span:
  start_char: 5824
  end_char: 5870
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d10f42d2cf697d28aae85e1bd89f0b91d80e3ca7820ad37d62e481c688f4f2f6"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 5830
    end_char: 5839
review_status: accepted
```

```yaml
voice_id: voice_charmides_0033
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a"
char_span:
  start_char: 5874
  end_char: 6012
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0c770b8bc3c10c2bb9c3d1320d4d80b7cc5d6fd66db96e2426319d2be854bf5d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0034
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156a-156c"
char_span:
  start_char: 6016
  end_char: 6815
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1b35ebcb438c01cb403c32708c82c660f04b797d63cdbc81955b57a83d81bfba"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 6029
    end_char: 6038
review_status: accepted
```

```yaml
voice_id: voice_charmides_0035
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156c"
char_span:
  start_char: 6819
  end_char: 6833
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c28213ff9d36e6033e534adae5fe59d732365d40290c2b231b673998c3eb9cb3"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0036
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156c"
char_span:
  start_char: 6837
  end_char: 6892
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "656d1afeb3f678ce8b27aa7ad91cefcef3d1dfcf9cc3c2b8ffca964b87ae1675"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0037
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156c-156d"
char_span:
  start_char: 6896
  end_char: 6924
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "09124bcb2dd04de269caa37c75ba9a5f81a0172bfb4930db81fd5ed6bb657051"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0038
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "156d-157c"
char_span:
  start_char: 7045
  end_char: 9010
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "67d8c02c4bb09fc43a466307b4eb24f5d6abc18d7121fe61c0919d480db734a2"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπον"
    start_char: 7049
    end_char: 7054
review_status: accepted
```

```yaml
voice_id: voice_charmides_0039
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157b"
char_span:
  start_char: 8314
  end_char: 8321
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cbcc093f26251423325cc03f0132150e6232e9d440ccaeaaa9e816a51baa9889"
voice_chain: ["ΣΩ.", "ΣΩ.", "ΘΡΑ."]
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners: ["ΣΩ.", "ΘΡΑ."]
  context_span:
    start_char: 7190
    end_char: 8621
    text_sha256: "2609231e799d14e7bad1e4cefded4cee37faa061911942d49e28da5ae3072958"
  rationale: "The named Thracian doctor is the source of the q-bounded instruction; the interposed ἔφη clauses remain Socrates' narration rather than a second speaker."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0040
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157b"
char_span:
  start_char: 8334
  end_char: 8477
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "49a94a0bbfa532dee5e65f33435d37c16f845148e1e92e001d3fd8995f276beb"
voice_chain: ["ΣΩ.", "ΣΩ.", "ΘΡΑ."]
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners: ["ΣΩ.", "ΘΡΑ."]
  context_span:
    start_char: 7190
    end_char: 8621
    text_sha256: "2609231e799d14e7bad1e4cefded4cee37faa061911942d49e28da5ae3072958"
  rationale: "The named Thracian doctor is the source of the q-bounded instruction; the interposed ἔφη clauses remain Socrates' narration rather than a second speaker."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0041
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157b"
char_span:
  start_char: 8490
  end_char: 8616
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7ac0a9817ac9611aa6a81aca29857f70940acca41dcd64ce8dbfcc719c2016a0"
voice_chain: ["ΣΩ.", "ΣΩ.", "ΘΡΑ."]
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners: ["ΣΩ.", "ΘΡΑ."]
  context_span:
    start_char: 7190
    end_char: 8621
    text_sha256: "2609231e799d14e7bad1e4cefded4cee37faa061911942d49e28da5ae3072958"
  rationale: "The named Thracian doctor is the source of the q-bounded instruction; the interposed ἔφη clauses remain Socrates' narration rather than a second speaker."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0042
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157c-157d"
char_span:
  start_char: 9014
  end_char: 9361
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "05c284362b345d534bcfb4c6faca9f3c11d4f8b241915f74d9c99559452a46d8"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Κριτίας ταῦτ’ εἰπόντος, Ἕρμαιον, ἔφη"
    start_char: 9030
    end_char: 9068
review_status: accepted
```

```yaml
voice_id: voice_charmides_0043
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157d"
char_span:
  start_char: 9365
  end_char: 9385
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "717f1f3179947907f54284fa63f61c89c7ecfb6a3f5e694cf9a7dd45c283ea07"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 9374
    end_char: 9383
review_status: accepted
```

```yaml
voice_id: voice_charmides_0044
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157d"
char_span:
  start_char: 9389
  end_char: 9519
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4713dc473494c1fd029f4690b61b7ce380c679ab2c4c3b8c3e43ed9c67cdee6b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0045
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "157d-158c"
char_span:
  start_char: 9523
  end_char: 11023
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1b9b4e3402e1020a7b5db6c76d7eb6ae3784918d0e8e93c4b32a93e750adcacf"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 9532
    end_char: 9541
review_status: accepted
```

```yaml
voice_id: voice_charmides_0046
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "158c-158d"
char_span:
  start_char: 11027
  end_char: 11546
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c7da8f5e9ac12a87ad8d77aaea11a9ea38725fee1421155b6702d223cfbe9f5f"
voice_chain: ["ΣΩ.", "ΧΑΡ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Χαρμίδης πρῶτον μὲν ἔτι καλλίων ἐφάνη—καὶ γὰρ τὸ αἰσχυντηλὸν αὐτοῦ τῇ ἡλικίᾳ ἔπρεψεν— ἔπειτα καὶ οὐκ ἀγεννῶς ἀπεκρίνατο· εἶπεν"
    start_char: 11044
    end_char: 11172
review_status: accepted
```

```yaml
voice_id: voice_charmides_0047
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "158d-158e"
char_span:
  start_char: 11550
  end_char: 11841
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2124d81edcce4b85c7d8aade47adf14a14d34eb9ec6f9085b712e60db62924d5"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπον"
    start_char: 11558
    end_char: 11563
review_status: accepted
```

```yaml
voice_id: voice_charmides_0048
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "158e"
char_span:
  start_char: 11845
  end_char: 11948
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c97bcdaa88d1f7f1c78e29aea2548d6c2c287bd1cbb2725d2dd038b8f99db4be"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0049
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "158e-159a"
char_span:
  start_char: 11952
  end_char: 12254
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0093f7d38a2cd07713bd0dac5c9be963b76283d6ac1f6a5ddd1c213380dab828"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 11965
    end_char: 11969
review_status: accepted
```

```yaml
voice_id: voice_charmides_0050
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159a"
char_span:
  start_char: 12258
  end_char: 12277
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9e0903cfd96d4b36194feb3d9dd3802f7c14c880d1927328d8cc71286f0f347a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0051
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159a"
char_span:
  start_char: 12281
  end_char: 12384
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f29b4507e55171802d8eb6d3acdf7bb96d05594989a9b0d96fc542213d03e629"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 12298
    end_char: 12302
review_status: accepted
```

```yaml
voice_id: voice_charmides_0052
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159a"
char_span:
  start_char: 12388
  end_char: 12399
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7e0642cfd7030a7dc1f99afff180ee897a6d7ea8a2a9db5421d96bb7f9cb8a1f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0053
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159a-159b"
char_span:
  start_char: 12403
  end_char: 12518
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d76b4fe80ca39f6b2aa972461b8146b636e2275c703066eab435df7617d301fa"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 12456
    end_char: 12465
review_status: accepted
```

```yaml
voice_id: voice_charmides_0054
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159b"
char_span:
  start_char: 12522
  end_char: 12808
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ceedf81aad2aa286f341947504bf43f500010de28686790cfd971c05f9fa91bd"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0055
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159b-159c"
char_span:
  start_char: 12812
  end_char: 12983
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "814db7eac7ed444ab1ea9316dd7dbea70216a592e5bd7ae06d15827e5835005d"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 12821
    end_char: 12830
review_status: accepted
```

```yaml
voice_id: voice_charmides_0056
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 12987
  end_char: 13001
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c28213ff9d36e6033e534adae5fe59d732365d40290c2b231b673998c3eb9cb3"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0057
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13005
  end_char: 13083
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d6473f851d03853f9d4f321d0c2399eef7440710ae0698b3734fb4f815a9505a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0058
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13087
  end_char: 13093
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e09d4aebdf9b9efaef1aaf588ee079c1793da658b14a2d43725402d2699b8b1d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0059
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13097
  end_char: 13136
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2f05ad1ed770f2bfd32338962ec21fb46bcc73b29e8976999b2533ce263b4b45"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0060
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13140
  end_char: 13148
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a469b0d87f68edb21b07143562e50f8c3bb3e101382c3c4cd13ef47db7b7ac0a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0061
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13152
  end_char: 13249
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7e883a354cd1bf10fbffd6f56e4a41ad9d1c46c32d61dc2c98ba6e15d12b1816"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0062
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13253
  end_char: 13258
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0063
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13262
  end_char: 13313
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "df3753db4b9e07f326c604d3a07e42d111c0782f462ecb87a8852d50b051c3b0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0064
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c"
char_span:
  start_char: 13317
  end_char: 13326
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0065
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159c-159d"
char_span:
  start_char: 13330
  end_char: 13506
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3f22c96d207da8273980fa6fb668d87ef220cc6d1355fd75326f2d2d9dcb6b96"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0066
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13510
  end_char: 13520
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2406fae0526c8a387a180d81ee0f890807140db4f0602034043d6288ce195309"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0067
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13524
  end_char: 13635
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "063f3a0509747c4973bd699479f4b642d3552ae51fa133c366159433cfce6127"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 13543
    end_char: 13547
review_status: accepted
```

```yaml
voice_id: voice_charmides_0068
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13639
  end_char: 13648
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0069
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13652
  end_char: 13683
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6f9f654a0ec1254c0ad68f67f591f4796e3d09f3326426411e96b4d917c13af5"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0070
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13687
  end_char: 13692
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0071
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d"
char_span:
  start_char: 13696
  end_char: 13797
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "251c091daf2d0c7d0e87816deb1a12d8ac3aaa0d5105f6dbe9e36565e9a553fb"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0072
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159d-159e"
char_span:
  start_char: 13801
  end_char: 13821
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "316c4cc3d608bdae5d49e08f147013b3df4676581f57bb14faf8834e34becbd7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0073
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 13825
  end_char: 13871
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "71997d1a21b1d3a65b3f2bcabbd70a72a9caa4a51244d14ab68cb49c555bdd2b"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 13832
    end_char: 13841
review_status: accepted
```

```yaml
voice_id: voice_charmides_0074
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 13875
  end_char: 13884
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b5b3b4518ca469ecf2cf44a2b562b301bfa75aa697d59fd6b88a6b9d48c3e199"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0075
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 13888
  end_char: 13972
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1b871d645f090715ee9afe158be2037a4b7055b15f145bca76de2c5807c1e19c"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 13901
    end_char: 13905
review_status: accepted
```

```yaml
voice_id: voice_charmides_0076
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 13976
  end_char: 13981
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0077
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 13985
  end_char: 14081
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0201f5b07c730547b28edb6573b34ae6a2a437f0bbd774e77fc08be691b9c217"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0078
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 14085
  end_char: 14090
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0079
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e"
char_span:
  start_char: 14094
  end_char: 14181
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4323220e6b0d988d3ece1a1248b2f648c2a4126ca513d27338fc078609cb8953"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0080
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "159e-160a"
char_span:
  start_char: 14185
  end_char: 14217
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d58f8ecbf1b24ea304afd9709053fe59cd8f6e87747ff2dab23c9711dae2249a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0081
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160a"
char_span:
  start_char: 14221
  end_char: 14285
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b8baa52d6b50d8dd8d96cdda13c301ebf792e158033dbe7d82c3a3d303dd53e0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0082
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160a"
char_span:
  start_char: 14289
  end_char: 14296
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a54c47dba06e4b618163f71e9325f5cc18f358008dd21160d1d5ad1fbb42060e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0083
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160a"
char_span:
  start_char: 14300
  end_char: 14441
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7dc947b4436acef958ca5f4c6eccf25a1b896f8564cf825f77f3322a7e48779b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0084
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160a"
char_span:
  start_char: 14445
  end_char: 14450
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0085
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160a-160b"
char_span:
  start_char: 14454
  end_char: 14661
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "00dd3ed6f8a3c72a3545e453bf65057591eafc0b8867228f13828d4fe37564a9"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0086
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160b"
char_span:
  start_char: 14665
  end_char: 14683
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f158f6363efe9f8e891b19d2f3da991c7c1f4820475ff5cbda8aad7ec48ae916"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0087
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160b"
char_span:
  start_char: 14687
  end_char: 14861
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9c28da62a7931350645fbbbf6216601bdf03e4d7563b3520e320bd0380169df4"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 14701
    end_char: 14710
review_status: accepted
```

```yaml
voice_id: voice_charmides_0088
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160b"
char_span:
  start_char: 14865
  end_char: 14882
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3a179997095c0211fd354494fabd4a0d5915ce9305d8c5797677b390bfd89c3e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0089
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160b-160d"
char_span:
  start_char: 14886
  end_char: 15622
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e3ef1003131fd5c06e4bd9ef5232fed08df5f434f8012162f8f7aa1fc4d9c336"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0090
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160d"
char_span:
  start_char: 15626
  end_char: 15672
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cae3f20840a67e4d4bd95cff25add7cd2a694bfc9acf98d2be4bb6843fc29086"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0091
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160d-160e"
char_span:
  start_char: 15676
  end_char: 15934
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fcb84d2bdd07429f6697c3e04860c8c7b6ab0af5635d76f7258edd04d5ff201a"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 15690
    end_char: 15699
review_status: accepted
```

```yaml
voice_id: voice_charmides_0092
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 15938
  end_char: 16116
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fbc7af2d1cc00b8799dff4ec094e886fee1c4fc302716decfc97a95e961270b4"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0093
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16120
  end_char: 16183
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ebe9c73f5873223cef35f597e64d84b099364e14720b96ad7e502cb8da2c5633"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 16126
    end_char: 16135
review_status: accepted
```

```yaml
voice_id: voice_charmides_0094
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16187
  end_char: 16201
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c102065151bf15be8475ddfe080481cf8643342bd96d6ba8fdd32eb70681ab87"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0095
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16205
  end_char: 16243
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "78850f6116834d9ef25f1f99ee82c3d0715446b195626999fa47c8f078cd69b2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0096
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16247
  end_char: 16252
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0097
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16256
  end_char: 16304
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "de71d1435cf31e2b011ee2a5b6aff16b0da0f4a8efa060e04ecad65754db989d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0098
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e"
char_span:
  start_char: 16308
  end_char: 16317
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b60b79a6c23e66a7837b72e62c0b4e4196e8b21a94eaaa00d32983fda9f20da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0099
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "160e-161a"
char_span:
  start_char: 16321
  end_char: 16375
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cc1e89cf2f3bc9ffc47aa81787bd23d9d79d843c538f293928c629fe7dc682a3"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0100
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16379
  end_char: 16393
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7e2ca6bcd45c326a81ecabba1458062cdd3fc1dd27c3f94fb7f5a40b334f086a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0101
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16397
  end_char: 16523
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0db4ffacfd5efb34df5f9b00e7f729896b70898202a983ecb1dec12d0a3663a0"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 16405
    end_char: 16414
review_status: accepted
```

```yaml
voice_id: voice_charmides_0102
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16527
  end_char: 16539
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "44d11ccac75ce6d9a8f01ac2f2aeadcc49d76d622b63520b07c6c12ca26633de"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0103
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16543
  end_char: 16594
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f17574eef27056faaaff34d6457764989fe7f384413cfa5f906336defcd20a2a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0104
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16598
  end_char: 16608
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2406fae0526c8a387a180d81ee0f890807140db4f0602034043d6288ce195309"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0105
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16612
  end_char: 16683
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "93474e38aeb69bb43e3ede08c7caaa938a7f0f85174d993f2d150598ea0ab5f8"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0106
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a"
char_span:
  start_char: 16687
  end_char: 16735
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fc22aff1e67aa8a02c97ccab4571321ebf5803acce91a6f0b10c63d6524f0723"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0107
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161a-161b"
char_span:
  start_char: 16739
  end_char: 16869
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9f4ed2a9a047da565a0b7fd68bc3bbea597ad4321d6c22d6757d5560bb39a67d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0108
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161b"
char_span:
  start_char: 16873
  end_char: 17129
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bf49bac3637eaf2c7bb215139a3ca354e2c826dd141dc4959509bab151245821"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0109
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161b-161c"
char_span:
  start_char: 17133
  end_char: 17214
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2c8d69cd54ac71a7e3bf45e49506c81059b07856e6a89900000c373ebd71a03a"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 17151
    end_char: 17155
review_status: accepted
```

```yaml
voice_id: voice_charmides_0110
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c"
char_span:
  start_char: 17218
  end_char: 17267
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "79c3a8e77e72505d49bbe8d0f852ae08c41270bbeecdffff073bb4751803c7d6"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἔφη ὁ Κριτίας"
    start_char: 17226
    end_char: 17239
review_status: accepted
```

```yaml
voice_id: voice_charmides_0111
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c"
char_span:
  start_char: 17271
  end_char: 17335
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "aee402d3874c05bce89b1518ba9910b713ba489e8e2cc9b9cde2c6f526fe14f1"
voice_chain: ["ΣΩ.", "ΧΑΡ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἦ δ’ ὅς, ὁ Χαρμίδης"
    start_char: 17289
    end_char: 17308
review_status: accepted
```

```yaml
voice_id: voice_charmides_0112
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c"
char_span:
  start_char: 17339
  end_char: 17439
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3eee551f9a59b3d6dc02d50c758fb8ae512f881743dac8b72a66884ed5708712"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 17346
    end_char: 17355
review_status: accepted
```

```yaml
voice_id: voice_charmides_0113
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c"
char_span:
  start_char: 17443
  end_char: 17470
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "63a24191c66e03e14e9fa84e7f10380815d2dc26705b21db19d77e598f009ef6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0114
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c"
char_span:
  start_char: 17474
  end_char: 17575
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a742066be1a04f6a2f457b3dad2cfbdee67442aadf6adadae6fe9bd53d122fa6"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 17482
    end_char: 17491
review_status: accepted
```

```yaml
voice_id: voice_charmides_0115
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161c-161d"
char_span:
  start_char: 17579
  end_char: 17605
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f7d617456c165e840f936918ac67ef5fd8f48f9d648d65dab4f622b6b22d68ab"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0116
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161d"
char_span:
  start_char: 17609
  end_char: 17785
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "edc397373881a2b73e5385b2b068cd754b38fd7b4093ff6f44643723caccbe93"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 17623
    end_char: 17632
review_status: accepted
```

```yaml
voice_id: voice_charmides_0117
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161d"
char_span:
  start_char: 17789
  end_char: 17818
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "26912aff3f99f03a516076d207f4b6559a72eead846d3a41ada0894632d2f521"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0118
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161d"
char_span:
  start_char: 17822
  end_char: 18004
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "84ee92eb1bc821e4cd53f936917580f04a22d2b6e38d324b5c4279fb25b1b2a3"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0119
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161d"
char_span:
  start_char: 18008
  end_char: 18021
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6e4d282315aa2d29889b11589ba655cd989156a8e846298e37c2b53dbee442a6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0120
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161d-161e"
char_span:
  start_char: 18025
  end_char: 18090
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "72d71831fe38084a67b3db6d9a52fab683523aac280747a829007221de28cf7d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0121
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e"
char_span:
  start_char: 18094
  end_char: 18103
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0122
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e"
char_span:
  start_char: 18107
  end_char: 18206
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fa9cb9748543e54990be7d380f701f75f47ac13f938d948868abd72aa77dd01f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0123
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e"
char_span:
  start_char: 18210
  end_char: 18226
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "87b9177559e729205c0eebf0586a6c2f2e96e3d377768a0857190e4ae080710a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0124
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e"
char_span:
  start_char: 18230
  end_char: 18377
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "43ba39be6411223398b85e83eb5debd218667c3a0e43c7e680af6fc2ee9cc05f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0125
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e"
char_span:
  start_char: 18381
  end_char: 18390
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "27715f6ce84071f99c65400db2b2f026e0f9e27fdcac59c2202b911f0f0afc25"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0126
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "161e-162a"
char_span:
  start_char: 18394
  end_char: 18707
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e42ad9e9855edd814b042b582777b30f89973b7340fff6a0f4c9b90be2977a2b"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 18402
    end_char: 18411
review_status: accepted
```

```yaml
voice_id: voice_charmides_0127
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a"
char_span:
  start_char: 18711
  end_char: 18738
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9c50ba004e0ab2dc99f95887e39fe0eb22b4a3c86950daa0de4cf8079d7f8e63"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0128
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a"
char_span:
  start_char: 18742
  end_char: 18800
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "338010c7c3e6be7d97912a2f6a87ea7e74b252b5027ea7f6650e490b25812c6c"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 18755
    end_char: 18759
review_status: accepted
```

```yaml
voice_id: voice_charmides_0129
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a"
char_span:
  start_char: 18804
  end_char: 18821
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bc27df9d5b6df6102a433b24f624c6acd581928db9c4e9d6e2bae80312a25556"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0130
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a"
char_span:
  start_char: 18825
  end_char: 18907
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "956251f52958ad17c3b5ff3c645e6907802db325332d3ce045193b0b13c77abf"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 18834
    end_char: 18843
review_status: accepted
```

```yaml
voice_id: voice_charmides_0131
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a"
char_span:
  start_char: 18911
  end_char: 18924
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1564bb5dd45848f92a7f755204d8e59d6f55c8d8fe724bd40bed3ee16ada6b1e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0132
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162a-162b"
char_span:
  start_char: 18928
  end_char: 19111
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "86646a055b6b213ae6dc201f11cb90bf1a5bde9b0b52bb5da9fa7c43f98d726b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0133
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162b"
char_span:
  start_char: 19115
  end_char: 19169
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e645ea0d2afdac15e9d2ead7021db6420ab3f364360928fe5b836d1a343ec4ed"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0134
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162b"
char_span:
  start_char: 19173
  end_char: 19292
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "db0b2df3b66f4bd0fecfe1ab1cb9c010fe2628b8c54b2c1594e7d197e77b2f48"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0135
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162b"
char_span:
  start_char: 19296
  end_char: 19307
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7e0642cfd7030a7dc1f99afff180ee897a6d7ea8a2a9db5421d96bb7f9cb8a1f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0136
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162b"
char_span:
  start_char: 19311
  end_char: 19366
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3c63c670b27ccf3e15b98eddea9ae6c438870603007a79a8e4b8909d02226d3f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0137
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162b-162c"
char_span:
  start_char: 19370
  end_char: 19536
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b818a5267b10d37c09a913f281c62c57b35d1b4c8ef7dd3117d852f5293bd2a8"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0138
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162c-162d"
char_span:
  start_char: 19540
  end_char: 20261
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b75376c03f835c62c2ff6586488757a002a41b6c8a022b113d75634514886978"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Κριτίας δῆλος μὲν ἦν καὶ πάλαι ἀγωνιῶν καὶ φιλοτίμως πρός τε τὸν Χαρμίδην καὶ πρὸς τοὺς παρόντας ἔχων, μόγις δ’ ἑαυτὸν ἐν τῷ πρόσθεν κατέχων τότε οὐχ οἷός τε ἐγένετο· δοκεῖ γάρ μοι παντὸς μᾶλλον ἀληθὲς εἶναι, ὃ ἐγὼ ὑπέλαβον, τοῦ Κριτίου ἀκηκοέναι τὸν Χαρμίδην ταύτην τὴν ἀπόκρισιν περὶ τῆς σωφροσύνης. ὁ μὲν οὖν Χαρμίδης βουλόμενος μὴ αὐτὸς ὑπέχειν λόγον ἀλλ’ ἐκεῖνον τῆς ἀποκρίσεως, {162d} ὑπεκίνει αὐτὸν ἐκεῖνον, καὶ ἐνεδείκνυτο ὡς ἐξεληλεγμένος εἴη· ὁ δ’ οὐκ ἠνέσχετο, ἀλλά μοι ἔδοξεν ὀργισθῆναι αὐτῷ ὥσπερ ποιητὴς ὑποκριτῇ κακῶς διατιθέντι τὰ ἑαυτοῦ ποιήματα. ὥστ’ ἐμβλέψας αὐτῷ εἶπεν"
    start_char: 19544
    end_char: 20134
review_status: accepted
```

```yaml
voice_id: voice_charmides_0139
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162d-162e"
char_span:
  start_char: 20265
  end_char: 20570
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3fcbbdd0861561d4dc4180047fa7a91095dcac5ad2288cdd2987e3ea2ff8bc52"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 20283
    end_char: 20287
review_status: accepted
```

```yaml
voice_id: voice_charmides_0140
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162e"
char_span:
  start_char: 20574
  end_char: 20615
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "847cd4dc279f145777650895f028f7bb4cd2ab7592dbf4e30849050d1bf95b24"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0141
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162e"
char_span:
  start_char: 20619
  end_char: 20742
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8b20c672bb642a7a8e37db3144346ebbd4e62d0fd5a005fbc18fb3112eb17871"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 20639
    end_char: 20648
review_status: accepted
```

```yaml
voice_id: voice_charmides_0142
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "162e-163a"
char_span:
  start_char: 20746
  end_char: 20760
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "643094c90bcdea0b0dba42c2d5c539208966c9841371af3f6ec33316ed72c8f9"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0143
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a"
char_span:
  start_char: 20764
  end_char: 20825
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e68f71742614809e12e3bbdc47222ef08ef46bfaf380518a5a0864bc5bad0998"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0144
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a"
char_span:
  start_char: 20829
  end_char: 20847
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ce74de6596ff6508ab43c53b8cc1902e4c73322fbfae0a48c610042172c7a8ab"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0145
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a"
char_span:
  start_char: 20851
  end_char: 20897
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b65f61214a4428601eeb63ad436416d977d6c8532565544ce5be73f674576feb"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0146
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a"
char_span:
  start_char: 20901
  end_char: 20921
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fd826ee18c43cb86137ca32e3581650f285fcce8b02715c4c0fd731210f5c20d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0147
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a"
char_span:
  start_char: 20925
  end_char: 21101
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "23eac41ee246b5d7e9beacb4cb74f03584b1c3852553ac1d8e1848a1eecd33e2"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 20939
    end_char: 20948
review_status: accepted
```

```yaml
voice_id: voice_charmides_0148
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163a-163b"
char_span:
  start_char: 21105
  end_char: 21223
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1801375a0f05f4dd88485d4730195e91b9c05d64a8a56b5cbe6857dbcca1cddb"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0149
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163b"
char_span:
  start_char: 21227
  end_char: 21292
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5046cbae412cd71850282f2bfa8764cb35f1525cf834274d3a57e822e36514f1"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 21237
    end_char: 21246
review_status: accepted
```

```yaml
voice_id: voice_charmides_0150
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163b-163c"
char_span:
  start_char: 21296
  end_char: 21758
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bfe74f315e932b788f0860fbda06c2169476329320519234fcdc02bc792e0568"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0151
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163c-163d"
char_span:
  start_char: 21762
  end_char: 22121
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fca55129f76665451e381357634db7500ead1c13e1184cf0bc6ef94220118c58"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0152
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163d-163e"
char_span:
  start_char: 22125
  end_char: 22612
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b34ed864264bb59e8f46ba9490dc8463d6c877295f9406c9bfbf5b8a64b779ca"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 22135
    end_char: 22144
review_status: accepted
```

```yaml
voice_id: voice_charmides_0153
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163e"
char_span:
  start_char: 22616
  end_char: 22628
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0158d0b86fa5a54543e62e1ddc508a46d9ecdc6f9e01d8cb1b6b502912778e8d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0154
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163e"
char_span:
  start_char: 22632
  end_char: 22683
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ab9c1d6143f46c62261428db9d449069d800f4f7a8dc9990728435bf147bcaa2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0155
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163e"
char_span:
  start_char: 22687
  end_char: 22732
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1e78d7f534d590e77c41283da42ffd1dea0e7c69d20a019cf01104155d760c49"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0156
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163e"
char_span:
  start_char: 22736
  end_char: 22808
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "738cc992d51e44fc8fffda08573ff9d4f8c971207a2d81a51a1d998c6ac0e000"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 22740
    end_char: 22749
review_status: accepted
```

```yaml
voice_id: voice_charmides_0157
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "163e-164a"
char_span:
  start_char: 22812
  end_char: 22996
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4f26ba7294359fae76a11080d03eb4e54d3345b3699529b29b687ba867e846f1"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0158
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164a"
char_span:
  start_char: 23000
  end_char: 23136
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "31894c57c7e76c17572ac1cffcecae012735170cecd50f78b6a0ab9664101c5f"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 23058
    end_char: 23067
review_status: accepted
```

```yaml
voice_id: voice_charmides_0159
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164a"
char_span:
  start_char: 23140
  end_char: 23163
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "699fd37297c43a243005297e6e5e1b32158896e86d4d4a6c5721b49b610c930d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0160
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164a"
char_span:
  start_char: 23167
  end_char: 23289
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "945d5b96ffa12dfb62d9a1373ead67169e6188e9c43a7901bd44b0718a551d51"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 23188
    end_char: 23192
review_status: accepted
```

```yaml
voice_id: voice_charmides_0161
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164a"
char_span:
  start_char: 23293
  end_char: 23326
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6f82d983682a1a722781493275fd2ac1487ca2396415b50bdec17a1614b9219a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0162
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164a-164b"
char_span:
  start_char: 23330
  end_char: 23441
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6297b50468a4b16fe99798863a7edb04d4609547f6893bcb729619c7f6e3d522"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0163
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23445
  end_char: 23453
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "61582367d5f7cb276bbe0415ad388a6b079e96e452f40a2fde994de3f3a1db89"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0164
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23457
  end_char: 23502
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "919dd1dc95d6945dc6eedefee32e7878e26478e3f1ea0f709e480c3df29a6126"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0165
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23506
  end_char: 23511
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0166
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23515
  end_char: 23548
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f231507de8af77cf0282c2ad1beb0eb55b71c88cb9f5e839c553c9a7a88cb07e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0167
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23552
  end_char: 23570
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "910da8b7c07211ff5520d0d5ed731fcb15b53b24936b06abc27995c5d771b44b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0168
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23574
  end_char: 23737
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d3c25868c4e34d7a6dfa1bc5866f80eb2f2257e4da93e22b06cc0dbb45255310"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0169
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b"
char_span:
  start_char: 23741
  end_char: 23750
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "eec91adb56c4365cd29caddc79963904888bf79a5011de44ac27ce4e59a36831"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0170
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164b-164c"
char_span:
  start_char: 23754
  end_char: 23930
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5c2c9ea8f62ecf73f72c91a200a3f41c242babc6f0d0bc47f18ec3fc8f727996"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 23766
    end_char: 23775
review_status: accepted
```

```yaml
voice_id: voice_charmides_0171
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164c"
char_span:
  start_char: 23934
  end_char: 23941
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "17551f8328f2ed5aec81ad1e311f17ce4f647d592d132df823254d6b3e30b22e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0172
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164c"
char_span:
  start_char: 23945
  end_char: 24053
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ecd2cc35c12c935a01fc6f3a568afebd0a49547a7b711bc6c94478b3210f5227"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0173
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "164c-165b"
char_span:
  start_char: 24057
  end_char: 25729
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a7ef536626fd72dfa03cfdee99cdcbcfc839ea77b991a6a7853ab32925dba179"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0174
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165b-165c"
char_span:
  start_char: 25733
  end_char: 26042
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "581e961dfd0eb5ff2281a19f0ef1d547c619c2c539a3a10197834f9524bb92f5"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 25739
    end_char: 25748
review_status: accepted
```

```yaml
voice_id: voice_charmides_0175
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26046
  end_char: 26066
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "19e3416d5786e5a9d9b27d72e9f22bd84b8d30b7da74e485f4eb9fe958284ee2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0176
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26070
  end_char: 26190
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2dea339875e4da81ccca3fe72d2cc94fa1edfba00232b906babf56f793261d5e"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 26079
    end_char: 26088
review_status: accepted
```

```yaml
voice_id: voice_charmides_0177
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26194
  end_char: 26217
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7652231736edc03f59f94575d3e29dd75647d1c29cff2f121476337ba1c9d347"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0178
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26221
  end_char: 26276
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "316537e3f57e7be261a4d831ab58e893774b12c5338f4580eb928a5cb20cba32"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 26241
    end_char: 26245
review_status: accepted
```

```yaml
voice_id: voice_charmides_0179
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26280
  end_char: 26289
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0180
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c-165d"
char_span:
  start_char: 26293
  end_char: 26511
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fe9b90443f603641e66765a4d42fcb7e52d1b4547b9671c00480f1c8b9d2e2dc"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 26307
    end_char: 26311
review_status: accepted
```

```yaml
voice_id: voice_charmides_0181
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165c"
char_span:
  start_char: 26326
  end_char: 26400
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "40c3d5fbcfa1234af6a9200ab5841b2899fc34779cb55ff51e412b0b6f797a17"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 3
resolution: unresolved
unresolved_reason: "The conditional ἔροιο σύ transmits a q-bounded question but names no owner; the addressee and exchange position do not license an attribution."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0182
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165d"
char_span:
  start_char: 26515
  end_char: 26527
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f9881a84c275ffca907fbcc8b2c8b01b20f2c110b140269237673250579a69b7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0183
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165d-165e"
char_span:
  start_char: 26531
  end_char: 26921
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "85a72f949d8df28adb59f8c9c3607e47be121f25b6459d122e26225b7d4be6ef"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0184
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165d-165e"
char_span:
  start_char: 26794
  end_char: 26901
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d7a42f31f6eac821141ce41f9ccdb2d6ae62052645bb8d75cffdfb07b226f41f"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 3
resolution: unresolved
unresolved_reason: "The q-bounded question addresses Critias, but its speaker is only implied by ἐρωτηθέντα; the Greek names no owner for this staged turn."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0185
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "165e-166a"
char_span:
  start_char: 26925
  end_char: 27350
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "662f2c0ce10ad7172d8b49ac3d9c0eaf5b4756e358849eb2b2ec2936e56ab822"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0186
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166a"
char_span:
  start_char: 27354
  end_char: 27610
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ce5d7a5edfcd53fc7cf5424b6392ef095402ad82c7a82038f13c8b22a45496a5"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπον"
    start_char: 27362
    end_char: 27367
review_status: accepted
```

```yaml
voice_id: voice_charmides_0187
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166a"
char_span:
  start_char: 27614
  end_char: 27628
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c28213ff9d36e6033e534adae5fe59d732365d40290c2b231b673998c3eb9cb3"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0188
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166a"
char_span:
  start_char: 27632
  end_char: 27698
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0ad5ea10bec9e848f6d034a202950dca27467482ec15ee436f29bef420205200"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0189
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166a-166b"
char_span:
  start_char: 27702
  end_char: 27720
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6257c1ca0b9869475dfd55b64e2f7e94a98824211a78ab8969a3132121b417cc"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0190
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166b"
char_span:
  start_char: 27724
  end_char: 27869
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6e4fb5c8433b84f8972d86312825abe20ced56760ea406aff5f518c100b18da0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0191
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166b"
char_span:
  start_char: 27873
  end_char: 27880
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "17551f8328f2ed5aec81ad1e311f17ce4f647d592d132df823254d6b3e30b22e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0192
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166b"
char_span:
  start_char: 27884
  end_char: 27974
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5136696325a484d910311d6477d4e31c28d4758248889b18ad23053e310bba94"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0193
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166b-166c"
char_span:
  start_char: 27978
  end_char: 28435
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2d931a4989d9ed9be08665ae64565c586e0325ea69d98dd97223213e70536265"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0194
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166c-166d"
char_span:
  start_char: 28439
  end_char: 28870
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fb513981cd1b8a128c07cc95c44a641b8ef716940b190fa7ca49e4c68648689e"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 28445
    end_char: 28454
review_status: accepted
```

```yaml
voice_id: voice_charmides_0195
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166d"
char_span:
  start_char: 28874
  end_char: 28912
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fc0b3192b88af1da37ee836089a2ad7d7fef16451384eabacb83ea4a3817d52f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0196
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166d-166e"
char_span:
  start_char: 28916
  end_char: 29140
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0146f3f0d5b64d3e0c6455eae833554b3376aa3b51d5207c1d8f3ed1fb76a00a"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 28931
    end_char: 28940
review_status: accepted
```

```yaml
voice_id: voice_charmides_0197
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166e"
char_span:
  start_char: 29144
  end_char: 29198
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ffcbd1713e721b7b46a2e8fdcbc382f1fa5a818b4abd1a0e9df0295c2278bc5d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0198
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166e"
char_span:
  start_char: 29202
  end_char: 29258
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b1f7ed9fabf924ca1fb45cd762fc6819b5b5dcc1f9127dc3d60b1ec5331ad136"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 29215
    end_char: 29224
review_status: accepted
```

```yaml
voice_id: voice_charmides_0199
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166e"
char_span:
  start_char: 29262
  end_char: 29367
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e0ca6c2ca73f5dd200f3243b2bf25bf4f979c8ce326edeccb9893c64ddd7460f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0200
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166e"
char_span:
  start_char: 29371
  end_char: 29448
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fdaefa822d1f1f912eb24a5d807fd7ba4bde9d534fa838bd84e515187d8d9cca"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 29379
    end_char: 29388
review_status: accepted
```

```yaml
voice_id: voice_charmides_0201
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "166e-167a"
char_span:
  start_char: 29452
  end_char: 29473
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a8a3b052df61459cdffe9ccf90108c86a8ef401b7293040e002a7ff96852474f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0202
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167a"
char_span:
  start_char: 29477
  end_char: 29876
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "502b1435226fb964d8dd358593597f88f28eca94c9980109afeee86c25837148"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0203
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167a"
char_span:
  start_char: 29880
  end_char: 29892
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "44d11ccac75ce6d9a8f01ac2f2aeadcc49d76d622b63520b07c6c12ca26633de"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0204
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167a-167b"
char_span:
  start_char: 29896
  end_char: 30164
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c8486c2a02495ea699339d431fd1d88052c699da85f6f2585c24401e2c230c8b"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 29910
    end_char: 29919
review_status: accepted
```

```yaml
voice_id: voice_charmides_0205
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167b"
char_span:
  start_char: 30168
  end_char: 30192
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4011511e58501b9ecd37beff15ef63fb5a2cdaca8a68fbf461b949655523e5e8"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0206
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167b"
char_span:
  start_char: 30196
  end_char: 30316
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f69176a31179de3bf46d6106903af0b9679a5a5f53107638d09fb129c278bcd6"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 30204
    end_char: 30208
review_status: accepted
```

```yaml
voice_id: voice_charmides_0207
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167b"
char_span:
  start_char: 30320
  end_char: 30334
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c102065151bf15be8475ddfe080481cf8643342bd96d6ba8fdd32eb70681ab87"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0208
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167b-167c"
char_span:
  start_char: 30338
  end_char: 30548
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "340f1190bd57570de334fb9c2dc1f16b9f19aaa3b7e1b54dda87cff96e0dccf8"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 30351
    end_char: 30360
review_status: accepted
```

```yaml
voice_id: voice_charmides_0209
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167c"
char_span:
  start_char: 30552
  end_char: 30561
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0210
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167c"
char_span:
  start_char: 30565
  end_char: 30696
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1a2f5b044936be4a9342c78adabdfe1b6079fabc545c933eefb67404aabd0390"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0211
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167c"
char_span:
  start_char: 30700
  end_char: 30716
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f1bc9699d970b8ba051b2841ead1054a009bcd92819b3c0ba50aecdd76989e2b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0212
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167c-167d"
char_span:
  start_char: 30720
  end_char: 30989
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e5da3e0dc0e9679d0dd573fd8a5715944c7966c2f78666eca713b62530ffcd98"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0213
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167d"
char_span:
  start_char: 30993
  end_char: 31012
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "10970d009f542f05f10a8c1d69172b4e88039d37a5807241053469058b74775d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0214
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167d"
char_span:
  start_char: 31016
  end_char: 31112
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "98c177111b344e2c6bdbe32b8bbf5c15cf610feed2980e1b056bd9b1daf18063"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0215
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167d"
char_span:
  start_char: 31116
  end_char: 31128
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "888bc60b1d4c3a16b3bf12c15698828d2ed7e1bf67e2f2a91f66dedaa909bec1"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0216
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167d"
char_span:
  start_char: 31132
  end_char: 31297
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3ec80c593e31b5ccc2ed3497dd931bbd92d34fea1b242cdd751016ed1b926f93"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0217
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167d-167e"
char_span:
  start_char: 31301
  end_char: 31320
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7002c06c034db856187c6e599a0bb11b25ed833c7ca4a742ca6aebc6c9154bc0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0218
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31324
  end_char: 31434
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4f12ce41f11dce4ff88711efe8ce119f128b9f96f494f7544d88ec0a4300f2d6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0219
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31438
  end_char: 31447
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b60b79a6c23e66a7837b72e62c0b4e4196e8b21a94eaaa00d32983fda9f20da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0220
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31451
  end_char: 31553
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bfbbe8d5876645d854113fe7fe0b555368c656360c7665fec8cc223b69a6a1d8"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0221
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31557
  end_char: 31569
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e9af8527c3ca93be30648c5fc2b229466eaeacfc4f1c605c0b6bc3332a8d59e2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0222
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31573
  end_char: 31682
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "aeaf63f89a1ce5da957831599ec297eb0f5a1146fc1f148116d16b9284d70a84"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0223
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e"
char_span:
  start_char: 31686
  end_char: 31703
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9667c9b874e90a9ed4ec92890c801edf6d49e1e419b05f35d7010ed038f21838"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0224
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "167e-168a"
char_span:
  start_char: 31707
  end_char: 31825
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1fc9b65f530bbeff3ccf1490029f239022a94b35eec19e5e3ca093e42461e9f2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0225
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a"
char_span:
  start_char: 31829
  end_char: 31850
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9753dd0fdc1b9d1e9a511773418561880d0b6b6f1cfb2b97a2ad5367860d4d9b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0226
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a"
char_span:
  start_char: 31854
  end_char: 31930
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9e71d3ae7e4c3687509ee794846a2f456bb16052c2dda49a71c68411c296f887"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0227
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a"
char_span:
  start_char: 31934
  end_char: 31943
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0228
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a"
char_span:
  start_char: 31947
  end_char: 32087
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cb2434c79a74e35cedb68c560f068a1206e774c35696e2826f1b028a5e3b76b0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0229
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a"
char_span:
  start_char: 32091
  end_char: 32102
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9017a9e22517a45dce51602e2079b76c1deb48faa3cc59e867d6a8a00f08621d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0230
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168a-168b"
char_span:
  start_char: 32106
  end_char: 32216
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c002b51a0cd7ee99bcec494a89d04a57d8d62778559503d840c707988c927370"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0231
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32220
  end_char: 32234
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "abce39b5c8c4a8e21723489c715c35d2f2c87a079c90439ade8bded5596a371f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0232
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32238
  end_char: 32344
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6ed3b43c60bca1d9d8028e95d1eef2c17607657636c6659df2360c83a1dfb7c0"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0233
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32348
  end_char: 32357
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0234
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32361
  end_char: 32439
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "570703a43bc865183fac5f388ad4f34960f10247ca81893ae2484b28cf3ee4aa"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0235
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32443
  end_char: 32453
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6918c34666dce55e718562d946f2f277038628bec55c743b3d44e0137bba7fcc"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0236
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32457
  end_char: 32501
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5fa15a13f33677b708a9c8e3ab273e47896db86e6d8712ca66163857fa13167b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0237
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b"
char_span:
  start_char: 32505
  end_char: 32513
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "92c17f2c7d3b6f7c0027dcff3495e78890ba432f4c39e654f2a427dab3de56da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0238
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168b-168c"
char_span:
  start_char: 32517
  end_char: 32730
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b13044032a30c7de8eaf116cad7f463da7bb1f2b31f823890685928db0c843eb"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0239
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168c"
char_span:
  start_char: 32734
  end_char: 32765
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "97049cd582fc9df1d57b4643292cd0bb987acde2f5360f005fc2efc864c7e97e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0240
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168c"
char_span:
  start_char: 32769
  end_char: 32943
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "118655c3cceffd5a94419dfb1157d0d6ab9b562c2d57d3fd67465e838a11a9d1"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0241
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168c"
char_span:
  start_char: 32947
  end_char: 32954
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a54c47dba06e4b618163f71e9325f5cc18f358008dd21160d1d5ad1fbb42060e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0242
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168c-168d"
char_span:
  start_char: 32958
  end_char: 33273
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fab70524543e4493a9e2f9c6765b062723a18878602d72f1e06588fb8a3f8163"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0243
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168d"
char_span:
  start_char: 33277
  end_char: 33282
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0244
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168d"
char_span:
  start_char: 33286
  end_char: 33380
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "242e7f0edcdde9b2bd92ddd231db5bcedab23241ec0c9f394d563ba4a0db11c7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0245
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168d"
char_span:
  start_char: 33384
  end_char: 33398
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "733a8c8161076f968867c0e1c9cf5c957b929f563eb3de6198094c0c09d53a9f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0246
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168d-168e"
char_span:
  start_char: 33402
  end_char: 33543
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "945bc41d4fd4ddb08dc3bd2911c3856d5c6f9cf03f6e560ca4a36c3e87294dbc"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0247
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168e"
char_span:
  start_char: 33547
  end_char: 33559
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e9af8527c3ca93be30648c5fc2b229466eaeacfc4f1c605c0b6bc3332a8d59e2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0248
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168e"
char_span:
  start_char: 33563
  end_char: 33792
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7e1f9073d870289a55e620c7778404a1048d701672883756cc3d887ec32aa318"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0249
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168e"
char_span:
  start_char: 33796
  end_char: 33805
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "27715f6ce84071f99c65400db2b2f026e0f9e27fdcac59c2202b911f0f0afc25"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0250
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "168e-169c"
char_span:
  start_char: 33809
  end_char: 34961
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "412187dd1f84245f6af4efbefeb4d2ebb901e8d402ed9c4eb2c015841cc77e22"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0251
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "169d"
char_span:
  start_char: 35355
  end_char: 35705
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a656e269c36ffa4ccfbbb1e78a98dba98882d764c0cd36fe4ef95dffa9cc0bfc"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "εἶπον"
    start_char: 35385
    end_char: 35390
review_status: accepted
```

```yaml
voice_id: voice_charmides_0252
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "169d-169e"
char_span:
  start_char: 35709
  end_char: 36025
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4b86052e78dc410d399cb5c8df4e67052419fc21c4c41f600acb3175f6ddd60c"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0253
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "169e-170a"
char_span:
  start_char: 36029
  end_char: 36193
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c0fe8f85d0629119745c07550e6852411d26f9c1ee614987063e12b8b72d843b"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 36039
    end_char: 36048
review_status: accepted
```

```yaml
voice_id: voice_charmides_0254
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a"
char_span:
  start_char: 36197
  end_char: 36241
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "392db9debaf085bd399d328a4d9bd85d40383b200d62def945ddf40668134080"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0255
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a"
char_span:
  start_char: 36245
  end_char: 36374
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8f08c78fc442f51e2282f5b0f2e7bad91dc54b97628bdedeca73faeade6572a8"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 36251
    end_char: 36255
review_status: accepted
```

```yaml
voice_id: voice_charmides_0256
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a"
char_span:
  start_char: 36378
  end_char: 36395
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "512a71b699eb2cfde5414d7412c701a197924c7ae4534d27525f4513cd66bb60"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0257
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a"
char_span:
  start_char: 36399
  end_char: 36533
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cd78c0e0339b9699b7537fbc7f92e4ed990f78095b33fe8f342c15f8b3639908"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 36404
    end_char: 36413
review_status: accepted
```

```yaml
voice_id: voice_charmides_0258
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a"
char_span:
  start_char: 36537
  end_char: 36557
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c2a00921b81831fb269a6ce4c6b497442a44004336a34949a0349350de7aba8f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0259
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170a-170b"
char_span:
  start_char: 36561
  end_char: 36670
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1512a4399c7d9e4037216d6396b47d79979b9d44d31f7a0c5e962d46d203a713"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0260
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b"
char_span:
  start_char: 36674
  end_char: 36683
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0261
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b"
char_span:
  start_char: 36687
  end_char: 36759
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "cc0085780a75d400d637a9ec7b3a9b546fc466f8513db13433d468b2a40f5e32"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0262
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b"
char_span:
  start_char: 36763
  end_char: 36775
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f2b9551460b040b97294038a3fe977d457949bcd645664d5a5102092effa2c66"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0263
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b"
char_span:
  start_char: 36779
  end_char: 37015
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fce069a85ef86d7fe643c452fa903c0bd007c8c1c3381345cf61cd98eef96603"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0264
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b"
char_span:
  start_char: 37019
  end_char: 37024
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0265
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170b-170c"
char_span:
  start_char: 37028
  end_char: 37260
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9d8d199178ae640213a1027f62f2ca736772201399299e94d89263473418dcc1"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0266
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170c"
char_span:
  start_char: 37264
  end_char: 37274
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2406fae0526c8a387a180d81ee0f890807140db4f0602034043d6288ce195309"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0267
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170c"
char_span:
  start_char: 37278
  end_char: 37390
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "81fcbd9f83a4c738a973b11951d5843dbfbebd5f808759301a44dc84038f0d65"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0268
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170c"
char_span:
  start_char: 37394
  end_char: 37403
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0269
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170c"
char_span:
  start_char: 37407
  end_char: 37469
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "70e82da373eaa01c987f0ba9604f2766e23e927ced3412c71d48a4af9a98c10b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0270
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170c-170d"
char_span:
  start_char: 37473
  end_char: 37488
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c32858ea83dec93420483a0bbd765ad037986e25ea50b94417d8cecf6c9b087e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0271
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170d"
char_span:
  start_char: 37492
  end_char: 37626
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "dbcededb85bb0012c3329fe20a1a312ddd05ab5452cf597b6f1e44e0d089630f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0272
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170d"
char_span:
  start_char: 37630
  end_char: 37642
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5926c56d44cf0f0af9d6934925008cfcb491d8a7c3bdfae9e15b32677602b002"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0273
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170d"
char_span:
  start_char: 37646
  end_char: 37888
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1568cf32a5f7ac885cdeb6cd238ea8db8340e6101bdde62c6192af2284fbcf7f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0274
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170d-170e"
char_span:
  start_char: 37892
  end_char: 37912
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fb126792059c1762321b2b004cf12c0db858f15e2de4141a1450d3c2d8a3bc8f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0275
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170e"
char_span:
  start_char: 37916
  end_char: 38308
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "47cbae92dd7633a4103e94abbba6630d66fd821a716e01b68c99dbe8516530ee"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0276
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170e"
char_span:
  start_char: 38312
  end_char: 38324
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c48f8c8279ce9414abdcede0953c07988928e803050f7ca4afcf8a9e3755a146"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0277
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170e"
char_span:
  start_char: 38328
  end_char: 38404
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d86fea45797a58fd7d41d9deb0ea778d30368807d23f7fb34ca1a06011bc5a27"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0278
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170e"
char_span:
  start_char: 38408
  end_char: 38413
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "21a0fa7459b9dba63fa3899d1ff2a53926de9a33ba107a65a2fb0b0b1c53ed46"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0279
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "170e-171a"
char_span:
  start_char: 38417
  end_char: 38509
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5b7b38a03820b54033a8609fd1af62579b877855acf771843f35c05535128619"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0280
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a"
char_span:
  start_char: 38513
  end_char: 38520
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a54c47dba06e4b618163f71e9325f5cc18f358008dd21160d1d5ad1fbb42060e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0281
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a"
char_span:
  start_char: 38524
  end_char: 38735
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f32fda220558c803c26fcdd06ed7092a8d8f78b3309c788f6915c755c6cbf12f"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0282
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a"
char_span:
  start_char: 38739
  end_char: 38754
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d0a8b9bcb937005fb7139d8263ab84deecbd4caeb89c722211cadf95064c6b25"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0283
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a"
char_span:
  start_char: 38758
  end_char: 38859
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "1ccc3b2e8a478b2b72c3b87e0d210288b49118fff5c43bac2161465a643c54b6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0284
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a"
char_span:
  start_char: 38863
  end_char: 38868
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "854cb598ff77c19a90937bfa51dcb2ab796b31f78fb470d1e7c9b36e6b9b30ac"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0285
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171a-171b"
char_span:
  start_char: 38872
  end_char: 39014
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5f715581e254b851c3a8a243b78ba8f7d776a47ccef04cffe5cec3bd658a60e2"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0286
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39018
  end_char: 39027
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b60b79a6c23e66a7837b72e62c0b4e4196e8b21a94eaaa00d32983fda9f20da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0287
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39031
  end_char: 39130
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3b2b65b51c09bf6aeb70b2f7cac5896ac49d615e6a06084dd66ae5ffd2c997bf"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0288
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39134
  end_char: 39142
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "41f4ca2c4d4ded837b327e905766012f440f4bde681106c798179f1698699354"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0289
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39146
  end_char: 39281
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "acdf6183eab59c338192600450eaa8f33701b3b2179b5b93d0b07e0e8faffffd"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0290
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39285
  end_char: 39293
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "92c17f2c7d3b6f7c0027dcff3495e78890ba432f4c39e654f2a427dab3de56da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0291
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b"
char_span:
  start_char: 39297
  end_char: 39363
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "056a25f423f0fcb750310ccf00d86cc2849b803f69f55f4f06c5e11177ad59dd"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0292
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171b-171c"
char_span:
  start_char: 39367
  end_char: 39383
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d9e3836bc718fb1b675255d6bb93ca6d3ea5928052ffc0b600de9ff44e9b2696"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0293
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171c"
char_span:
  start_char: 39387
  end_char: 39488
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ad9c58ad614ef0e4dc96e3df0f536f5dcf3e3bd1192c88d83afcf5160e5a1fd4"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0294
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171c"
char_span:
  start_char: 39492
  end_char: 39504
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "25b5733e41fec9342220670f4faef2b44ba956c7851d2247f6a6010a4f0cae0d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0295
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171c"
char_span:
  start_char: 39508
  end_char: 39805
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e146965f6afc772de49799927a21ac884aa3919889f32a56f393fb786e7b4d77"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0296
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171c-171d"
char_span:
  start_char: 39809
  end_char: 39831
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0ba40b8e9652d914df832497d5eabda2cdb14973f51ea7dcbf3c049893587089"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0297
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "171d-172a"
char_span:
  start_char: 39835
  end_char: 40963
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "657a014da3c141d65ceaf51d76d2db8e5c535a5010394debbc89ba11708be115"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 39844
    end_char: 39853
review_status: accepted
```

```yaml
voice_id: voice_charmides_0298
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172a"
char_span:
  start_char: 40967
  end_char: 40993
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4811734eb61de13142ca10743d1207f7b1fef8a84b8352326f07b9459cd22bae"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0299
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172a"
char_span:
  start_char: 40997
  end_char: 41073
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "acec884613ff1f5b206f850986252e5aa827f1db358c2decf3fe15d855b43c18"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 41005
    end_char: 41014
review_status: accepted
```

```yaml
voice_id: voice_charmides_0300
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172a-172b"
char_span:
  start_char: 41077
  end_char: 41094
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fa711a0accba52ec411fb3c4579adb8828aa2b9f5c2a1c5479b04e22c558e7d4"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0301
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172b-172c"
char_span:
  start_char: 41098
  end_char: 41657
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "96729bcb2dce620b489b546503cbe7ded7b170edf3920bb12aa944945dce23c3"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 41107
    end_char: 41116
review_status: accepted
```

```yaml
voice_id: voice_charmides_0302
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172c"
char_span:
  start_char: 41661
  end_char: 41690
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2cfb6eea2bc6d7ca63db369e7fb6769c35e3d418b462f7931aca063fca3ddcdd"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0303
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172c-172d"
char_span:
  start_char: 41694
  end_char: 42305
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4c5162f001243e596ba30b92c41499647786303f2305bea74f41282d4f3ff2c9"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 41700
    end_char: 41709
review_status: accepted
```

```yaml
voice_id: voice_charmides_0304
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172d"
char_span:
  start_char: 42309
  end_char: 42326
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e6ff58c523212d18552de071e135e8c0e6363929c507b15034faba87293c92fc"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0305
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172d-172e"
char_span:
  start_char: 42330
  end_char: 42515
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "31242bcb5cc5d138eb79e2cd7234291aff7487bfc91e27d36051b3b7f5a64051"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 42335
    end_char: 42344
review_status: accepted
```

```yaml
voice_id: voice_charmides_0306
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172e"
char_span:
  start_char: 42519
  end_char: 42553
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "2c16e7aaf51a6d8fc9b18c8433328477f0dcb5185e46440837cbc9f830211328"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0307
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172e"
char_span:
  start_char: 42557
  end_char: 42585
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ad009276d4ba1182312158ef27a7f1b88770242c878cb9b2a449216bba51517f"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 42574
    end_char: 42583
review_status: accepted
```

```yaml
voice_id: voice_charmides_0308
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172e"
char_span:
  start_char: 42589
  end_char: 42630
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "a6da1f7607a66b89ac356876069ae0e2a7267d4c299a265e5e8e922267e87f5d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0309
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "172e-173a"
char_span:
  start_char: 42634
  end_char: 42903
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "86486352d1bcb946181dcafb75e694763bd3ab0701b96aaf8e9d995d9412696b"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 42647
    end_char: 42651
review_status: accepted
```

```yaml
voice_id: voice_charmides_0310
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173a"
char_span:
  start_char: 42907
  end_char: 42964
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6f9f3451e88e87abd078fbaf822aab8fd7378bd71b5f6f2239e1ce13599ebf09"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0311
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173a"
char_span:
  start_char: 42968
  end_char: 43103
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "30aea5ca3f180c5d861f6a009795bc99076b0ae2248685ec5595bbd64fe4a692"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 42979
    end_char: 42988
review_status: accepted
```

```yaml
voice_id: voice_charmides_0312
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173a"
char_span:
  start_char: 43107
  end_char: 43131
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ec63b96d644f1c7d51ec99f1f0b24c985ec870cd771e98d13e6a79457b2d09ee"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0313
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173a-173d"
char_span:
  start_char: 43135
  end_char: 44338
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "01cb27cc39b22dabda96c19fd702a518055cd3d8e416cc5b1fa2e653551179bf"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 43145
    end_char: 43149
review_status: accepted
```

```yaml
voice_id: voice_charmides_0314
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173d"
char_span:
  start_char: 44342
  end_char: 44443
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0ce852f23498177f8baa9fd92701c813d4eba7cff5b281bafb5bb4e5c1737a09"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0315
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173d-173e"
char_span:
  start_char: 44447
  end_char: 44543
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "6497aba74a38d8dfa4392fe8f857766f2940425a08dfdad8cdee089828a84fa2"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 44466
    end_char: 44475
review_status: accepted
```

```yaml
voice_id: voice_charmides_0316
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e"
char_span:
  start_char: 44547
  end_char: 44565
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "07f8f91877d08564848ae0d63375a5fcc615cffb0ee023f434c444a1d25476af"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0317
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e"
char_span:
  start_char: 44569
  end_char: 44591
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bc2339666a62381b948d1d13fb30da569faae3da8f7a74edb9a96f18522a778a"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0318
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e"
char_span:
  start_char: 44595
  end_char: 44604
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0319
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e"
char_span:
  start_char: 44608
  end_char: 44653
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "42f5cd730e3f228ee7a95396af0a760423d47299c16e58d38609f8f7e51430de"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0320
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e"
char_span:
  start_char: 44657
  end_char: 44666
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b60b79a6c23e66a7837b72e62c0b4e4196e8b21a94eaaa00d32983fda9f20da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0321
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "173e-174a"
char_span:
  start_char: 44670
  end_char: 45024
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "71f7562eae683d17d162df011128b26988f79781572c309ca29191615a36a886"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 44679
    end_char: 44688
review_status: accepted
```

```yaml
voice_id: voice_charmides_0322
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174a"
char_span:
  start_char: 45028
  end_char: 45062
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "02ca424bade4b5863ac649c10d433149e4c4c5bbdbc90fe30e98262c835e1657"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0323
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174a"
char_span:
  start_char: 45066
  end_char: 45296
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "80d3716773b5a4ac4a4e7d9d10dc3aab33492cfb30a4a382fa87e93a2000fa27"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 45072
    end_char: 45081
review_status: accepted
```

```yaml
voice_id: voice_charmides_0324
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174a"
char_span:
  start_char: 45300
  end_char: 45309
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b60b79a6c23e66a7837b72e62c0b4e4196e8b21a94eaaa00d32983fda9f20da"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0325
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174a"
char_span:
  start_char: 45313
  end_char: 45393
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d1a14336527954b55311f4e7203c78c1f5a3d7f9500812a3063fe5826dcc9e00"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0326
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174a-174b"
char_span:
  start_char: 45397
  end_char: 45425
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ec6abad51ba2b301e61dde087389c5493fc4e8f6c035f24862ae2c77d1e40e65"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0327
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45429
  end_char: 45543
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ddf3cbd4011743126634489412238f30222fc49888dd0a240a03c05136c38bf6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0328
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45547
  end_char: 45576
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bebb9183e1401d61e2814c9e11d84d53f0cc23fbaacabf624a7bac59b88ffa84"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0329
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45580
  end_char: 45602
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e9eea426c678b4eeed1271d8bacb90f82b12b468b3ece7c61baa164a0eec3c58"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0330
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45606
  end_char: 45615
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b9beb5b621163d74eeff86c601a1f0fb1049a0ac170fd033501a37f602e14f02"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0331
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45619
  end_char: 45639
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "31138b1e2fe32fac81c869273853c6aeeae17bbe0a8aad0e8b602254a743a36c"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0332
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45643
  end_char: 45656
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d159463d93ea4aefef22bf7d64c3684622ee8d309737909b53a8ff21f565d204"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0333
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45660
  end_char: 45704
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "0b420e26f34b4a42282bd359f7728c82bfba2e9fd6b98ccbdf2e1be825c07c59"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 45687
    end_char: 45696
review_status: accepted
```

```yaml
voice_id: voice_charmides_0334
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b"
char_span:
  start_char: 45708
  end_char: 45741
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "75b6390a4473bbd1cfc17f4cfae7cb14b2bb560549f0096b8d27861e79d0f77b"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0335
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174b-174c"
char_span:
  start_char: 45745
  end_char: 46233
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5bcabb56cf84ac157111458a739733428f478776d691d2fde496e034725bfbf2"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 45754
    end_char: 45758
review_status: accepted
```

```yaml
voice_id: voice_charmides_0336
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174c"
char_span:
  start_char: 46237
  end_char: 46255
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3a52dc18d5b121ec01e083f8b0460aaf816160cc955ce42f723b36c02ea33bf7"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0337
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174c-174d"
char_span:
  start_char: 46259
  end_char: 46372
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c3613ff193ed856243a4c819fe858775f89e54d6f0c9426d48548fa94773d901"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0338
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174d"
char_span:
  start_char: 46376
  end_char: 46390
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ecb6734270683ad556b4e2e75eaed77c473ec901f207b0ecb7450bdbc10390cc"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0339
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174d"
char_span:
  start_char: 46394
  end_char: 46646
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7058aa249fdb7cd610b5e458532a27f3987a7cdc02c4ba501412feb668166a29"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0340
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174d-174e"
char_span:
  start_char: 46650
  end_char: 46866
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "9aa0bdabcc79974c0cf3d5ab0a892c24f8546c420714836c560432494dd0a5e6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0341
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174e"
char_span:
  start_char: 46870
  end_char: 47119
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "fb75690548dae0627a15d90a480342c9febb51e0166ffd94968c3278f6b6b1ff"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 46893
    end_char: 46902
review_status: accepted
```

```yaml
voice_id: voice_charmides_0342
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174e"
char_span:
  start_char: 47123
  end_char: 47136
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "d5753d44934fc82d92b70d01591facdb3d43143f6ddd22145ccacbf0a036f896"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0343
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174e"
char_span:
  start_char: 47140
  end_char: 47174
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "653997413ae08da9de3b741cde3fc0f7b9bda8debe7157c7f3329724eab2e2a9"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0344
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "174e-175a"
char_span:
  start_char: 47178
  end_char: 47194
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f51ee9debc58e6a4923645d1d651e558730870219e2f87219fd2ea7707921438"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0345
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47198
  end_char: 47232
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "59beb8b4e36e4456e4a11e0f2054a22b09240e6519817bde1a2a89c5b8cd2bfd"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0346
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47236
  end_char: 47243
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "4d9e44594df00101bda7723ba4f6b9b5b52e97797646cac77452a36547f3103d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0347
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47247
  end_char: 47331
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "b4f50239ed1cec8bd1a7ecbdd19420b465408fea710269058176c58d46f4133c"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0348
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47335
  end_char: 47344
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "8609ed1a806e3800df14d595c2a5e82da41f1ad882ecebe0452480ed81d49f3d"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0349
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47348
  end_char: 47418
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "bdb8bda4ed2fe6991299156e08747eff94171a7eaf9bcd64c53d57f6ded92c18"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0350
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a"
char_span:
  start_char: 47422
  end_char: 47454
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "5e77b749b3f15b2b177b00810acff57fec331deb20e8f18886cf77eef6df7eda"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0351
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "175a-176a"
char_span:
  start_char: 47458
  end_char: 49535
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "62dcd5b4f8355cc008bc883cbbf310c829b3f05fdc987a6e8646f6758aad206e"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 48794
    end_char: 48803
review_status: accepted
```

```yaml
voice_id: voice_charmides_0352
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176a-176b"
char_span:
  start_char: 49539
  end_char: 49900
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f13d9cbd5e2fc72bb322132b49e2ef02816096b382cd0c56cd45682d02136403"
voice_chain: ["ΣΩ.", "ΧΑΡ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ὁ Χαρμίδης, ἀλλὰ μὰ Δί’, ἦ δ’ ὅς"
    start_char: 49543
    end_char: 49575
review_status: accepted
```

```yaml
voice_id: voice_charmides_0353
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176b"
char_span:
  start_char: 49904
  end_char: 50088
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "175651592534afdf8bd036c3eb66022989e61ba0cc9a27de0209cc0f968544f6"
voice_chain: ["ΣΩ.", "ΚΡΙ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἔφη ὁ Κριτίας"
    start_char: 49916
    end_char: 49929
review_status: accepted
```

```yaml
voice_id: voice_charmides_0354
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176b-176c"
char_span:
  start_char: 50092
  end_char: 50226
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "e8138f8160289e9f4b75c4389b08fffdcfcf61982fd2aba7d31a7067491b1fc4"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0355
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c"
char_span:
  start_char: 50230
  end_char: 50259
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "593659a89c99256f6688783c7750c421f3e28f388ac2946d41f80c95c7e101f6"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0356
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c"
char_span:
  start_char: 50263
  end_char: 50317
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c479b3829a5de7051a85f24405b7574220a3509158042dde15daf4829010178e"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0357
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c"
char_span:
  start_char: 50321
  end_char: 50362
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7f9c71b2a0a41ff3d724f68b610d9666edb171a9f5773bae765db61f9d72bcc9"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 50328
    end_char: 50337
review_status: accepted
```

```yaml
voice_id: voice_charmides_0358
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c"
char_span:
  start_char: 50366
  end_char: 50408
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "f6db51dfe6b842d9953c5ccff9bb6f2f84baa0781d04eac13513dd6b4d85d60e"
voice_chain: ["ΣΩ.", "ΧΑΡ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: "ἔφη ὁ Χαρμίδης"
    start_char: 50373
    end_char: 50387
review_status: accepted
```

```yaml
voice_id: voice_charmides_0359
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c"
char_span:
  start_char: 50412
  end_char: 50465
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "ab7c8d36492dedcc7580ee5f54972d7e3a521cd8c692ffee5f6eab67854072b8"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 50423
    end_char: 50432
review_status: accepted
```

```yaml
voice_id: voice_charmides_0360
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176c-176d"
char_span:
  start_char: 50469
  end_char: 50564
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "7829d12dd8aa5dece265da037292e34ed691a236f5bfbf6bf72b6ba23af53a25"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0361
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176d"
char_span:
  start_char: 50568
  end_char: 50703
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "3ca143c8a39c6875574d8a296e38c5ef8b428c5fbf8ffee85406a8d4fc43bb06"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἔφην"
    start_char: 50582
    end_char: 50586
review_status: accepted
```

```yaml
voice_id: voice_charmides_0362
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176d"
char_span:
  start_char: 50707
  end_char: 50745
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "63cb53de3d131ffacd6933b07fc4e7f4075e4ba607f6001430d4c2432015da16"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The Greek transmits a bounded inner utterance, but this span supplies no local formula that licenses its speaker; nearby turns and turn alternation are not attribution evidence."
review_status: accepted
```

```yaml
voice_id: voice_charmides_0363
source_work: Charmides
outer_turn_id: turn_charmides_0001
stephanus_span: "176d"
char_span:
  start_char: 50749
  end_char: 50785
source_path: raw/plato/greek/charmides.txt
source_sha256: "cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218"
span_sha256: "c79fefe0081e4f7122b57475f0d5e71c89b837a4af134087694aa4b2e673a792"
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ’ ἐγώ"
    start_char: 50760
    end_char: 50769
review_status: accepted
```
