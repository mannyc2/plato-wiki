# Protagoras — Voice Ledger

Reported-speech structure for the 52 outer turns required by
`wiki/reported-turn-scopes.json`. This file is the canonical corpus artifact for
the dialogue under the corpus reported-turn completion campaign; no generator owns it and byte-identical
regeneration is not an acceptance requirement. Reviewers edit it directly against
`raw/plato/greek/protagoras.txt`; shared code checks only mechanical source and
ledger integrity.

Every record is `accepted`, as 52 atomic outer-turn cohorts, under
`wiki/review/2026-08-04-protagoras-voice-ledger-acceptance.md`. Acceptance does
not activate anything: protagoras is absent from
`derived/plato/voices/cutovers.toml`, so nothing here has authority over any
claim's speaker — see `docs/voices-protocol.md`.

One property of this edition governs many records and is stated once here. It
reprints the siglum `ΣΩ.` at its own chunk boundaries, including in the middle
of an utterance that no one has interrupted — 58 times in this source, and among
them inside Protagoras' great speech, where `ΣΩ.` stands between
`ἐμηχανᾶτο δύναμιν εἰς σωτηρίαν.` and `ἃ μὲν γὰρ αὐτῶν σμικρότητι ἤμπισχεν`,
one continuous sentence of the myth. A printed `ΣΩ.` is therefore not by itself
a speaker change. No record's span contains one — a printed siglum opens a new
outer turn, and every record nests inside one turn — but a record that BEGINS
immediately after one does not thereby begin a new voice. Records 0318, 0385 and
0407 rest on this; each starts within nine characters of a reprinted `ΣΩ.`
(81549, 96073, 102688).

## Records

```yaml
voice_id: voice_protagoras_0001
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310a-310e
char_span:
  start_char: 1584
  end_char: 3431
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 158c30398c5ea5ad9bb8ab875503b8674218979b0070bcc6d1db5648204e4dd0
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 1584
    end_char: 1587
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0002
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 310e-311e
char_span:
  start_char: 3431
  end_char: 5572
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fdc3b29906d8926692eb16cd13aab2439971659a2bb44b5df30b921b10871467
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 3431
    end_char: 3434
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0003
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 311e-312e
char_span:
  start_char: 5572
  end_char: 7770
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1790a13b669db19acdc09d813160b2a8d0da4fff2b8ccda19c31d52e366931d3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 5572
    end_char: 5575
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0004
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 312e-314a
char_span:
  start_char: 7770
  end_char: 9946
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6de1a8be8d3a6da41b3b09aa93768a0c58e5de1168cd5300b40cfa2ea1be93b7
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 7770
    end_char: 7773
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0005
source_work: Protagoras
outer_turn_id: turn_protagoras_0026
stephanus_span: 314a-314e
char_span:
  start_char: 9946
  end_char: 11787
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c773b29212a14b86d45ba1ac741c6cbee1050d5652f70714ab19b22dd7afd39c
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 9946
    end_char: 9949
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0006
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 315e-316e
char_span:
  start_char: 13926
  end_char: 16314
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f482e215663aae44b3ae23778ee6bca5fd31dc6b50778bd04abfca2833d80cba
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 13926
    end_char: 13929
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0007
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 316e-317e
char_span:
  start_char: 16314
  end_char: 18274
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a065c9da8576b395fdb616bb709e09b012f008716aafc5871c9c48e703ccb6f4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 16314
    end_char: 16317
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0008
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 317e-319a
char_span:
  start_char: 18274
  end_char: 20538
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3021d20262f644a18ac6cf367907614adf114f3bb30de3b194ad316f7cf1a1e0
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 18274
    end_char: 18277
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0009
source_work: Protagoras
outer_turn_id: turn_protagoras_0031
stephanus_span: 319a-319e
char_span:
  start_char: 20538
  end_char: 22366
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 17d37c7995c763666c57bfdb4565a0f246aff2d23263a150f92e59ca93ce9ca3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 20538
    end_char: 20541
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0010
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 319e-320e
char_span:
  start_char: 22366
  end_char: 24313
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8d4ca715f9ddd582f09cf31145de589429e943ad519e3307ad422ae1cbeafbe5
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 22366
    end_char: 22369
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0011
source_work: Protagoras
outer_turn_id: turn_protagoras_0033
stephanus_span: 320e-322a
char_span:
  start_char: 24313
  end_char: 26394
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 512143242c7db990c48de47bd92684fb435ee676a6c3001ace1af38631f943dc
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 24313
    end_char: 24316
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0012
source_work: Protagoras
outer_turn_id: turn_protagoras_0034
stephanus_span: 322a-322e
char_span:
  start_char: 26394
  end_char: 28138
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 323b3395b55733f7173ccbd14f65a5fa144bfcd248982d9ca7d3c4e17123c6e4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 26394
    end_char: 26397
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0013
source_work: Protagoras
outer_turn_id: turn_protagoras_0035
stephanus_span: 322e-323e
char_span:
  start_char: 28138
  end_char: 30058
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 05d2368e371e241d5c9942831210b1c458b3899ace622ffea728bcd352883524
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 28138
    end_char: 28141
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0014
source_work: Protagoras
outer_turn_id: turn_protagoras_0036
stephanus_span: 323e-324e
char_span:
  start_char: 30058
  end_char: 31872
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f5b6f56aef1d21a6783abd7311f23e76ef8113777b289eb34c5c96552c82c107
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 30058
    end_char: 30061
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0015
source_work: Protagoras
outer_turn_id: turn_protagoras_0037
stephanus_span: 324e-325e
char_span:
  start_char: 31872
  end_char: 33787
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e358e49787987ed272e78cb4fd39c000172d692132859cb76e2eeb9867de63c5
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 31872
    end_char: 31875
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0016
source_work: Protagoras
outer_turn_id: turn_protagoras_0038
stephanus_span: 325e-326e
char_span:
  start_char: 33787
  end_char: 35931
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 39c27849cd42c98446e29c735b2bb9dff7bad495c9657d04057d4fa5763c1867
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 33787
    end_char: 33790
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0017
source_work: Protagoras
outer_turn_id: turn_protagoras_0039
stephanus_span: 326e-327e
char_span:
  start_char: 35931
  end_char: 37939
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ded9337e54b34f2419fad54bb9baf50debef8ea55a509328c2e87c3eb9ab4afa
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 35931
    end_char: 35934
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0018
source_work: Protagoras
outer_turn_id: turn_protagoras_0040
stephanus_span: 327e-328e
char_span:
  start_char: 37939
  end_char: 39996
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1711c237692f9ea0b9153e13c25f8edf8935a45475a230f9d828a597d9ad6ab5
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 37939
    end_char: 37942
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0019
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 328e-329e
char_span:
  start_char: 39996
  end_char: 42016
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8e66290940a7ad7e10fd709f49cfaf8bc7439d942028a3508b94730f56cbebb5
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 39996
    end_char: 39999
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0020
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 329e-330e
char_span:
  start_char: 42016
  end_char: 44135
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: acf9a6adcbf3dd1a1aa91f922da8553f5d0cbf36084ef6d0481e645bfd89f7d9
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 42016
    end_char: 42019
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0021
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 330e-331e
char_span:
  start_char: 44135
  end_char: 46392
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 05c1edd5c88ad7b516148b92d195ab31a086d7de97e0d06b26651e5f2b9e6bfb
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 44135
    end_char: 44138
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0022
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 331e-332e
char_span:
  start_char: 46392
  end_char: 48490
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bfa3898c7720f1f6649eb792720e5229bd31602c0745dd2350de50d68a08ab54
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 46392
    end_char: 46395
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0023
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 332e-333e
char_span:
  start_char: 48490
  end_char: 50587
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 23d30c18001333b4feac12400c41229cd237c5ce5d0d5e276dc5990480a665c3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 48490
    end_char: 48493
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0024
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 333e-334e
char_span:
  start_char: 50587
  end_char: 52487
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f8d22195f95a9ba51b94e984e174e1b06cf55d1d15ad1f2465d3c30d4343aac3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 50587
    end_char: 50590
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0025
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 334e-335e
char_span:
  start_char: 52487
  end_char: 54487
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 30d6605730acd10650e96c07fbe52e3ef755546ac7b372306c47bb6c1e7a0c36
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 52487
    end_char: 52490
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0026
source_work: Protagoras
outer_turn_id: turn_protagoras_0048
stephanus_span: 335e-336e
char_span:
  start_char: 54487
  end_char: 56432
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5e2cdf50d9c1d3dd1f8e670fd05b3b1460c862ae0ec7b85a97930eb402d211ac
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 54487
    end_char: 54490
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0027
source_work: Protagoras
outer_turn_id: turn_protagoras_0049
stephanus_span: 337a-337e
char_span:
  start_char: 56432
  end_char: 58217
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4aa1712b863c82248f4b01034ff2c6a01ae15e1492b496c6f1ef02899cca625a
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 56439
    end_char: 56442
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0028
source_work: Protagoras
outer_turn_id: turn_protagoras_0050
stephanus_span: 337e-338e
char_span:
  start_char: 58217
  end_char: 60279
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 48b4593948f1e472f9c3479c4725df82e96ef437bef70bc403d296513605dba2
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 58217
    end_char: 58220
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0029
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 338e-340a
char_span:
  start_char: 60279
  end_char: 62670
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fc57b117193cdb3fd71e07f2edfe7e5a21801078278d052e2d3a7a59a41afb45
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 60279
    end_char: 60282
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0030
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340a-340e
char_span:
  start_char: 62670
  end_char: 64642
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 93717b6cf92e51d891f5bbbbeb084710a070c5fd6d72385c101bba4047a72654
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 62670
    end_char: 62673
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0031
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 340e-341e
char_span:
  start_char: 64642
  end_char: 67087
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c3598e957239330d8c78125d72418a32c45a573cdf210cfb496112b523983310
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 64642
    end_char: 64645
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0032
source_work: Protagoras
outer_turn_id: turn_protagoras_0054
stephanus_span: 341e-342e
char_span:
  start_char: 67087
  end_char: 69085
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 498406dcf997e992af21ea6b363ac753797359f4f6f4580daa563e1faeabb255
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 67087
    end_char: 67090
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0033
source_work: Protagoras
outer_turn_id: turn_protagoras_0055
stephanus_span: 342e-343e
char_span:
  start_char: 69085
  end_char: 71121
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fbc154cd6242f7c7f5e37f72b4bc47e15768e1278ce974919beb8573652a6571
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 69085
    end_char: 69088
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0034
source_work: Protagoras
outer_turn_id: turn_protagoras_0056
stephanus_span: 343e-344e
char_span:
  start_char: 71121
  end_char: 73474
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3d7b8100f8ed10ef2fb15c4937d312603fe2f2812a4860ceb38637708b531b77
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 71121
    end_char: 71124
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0035
source_work: Protagoras
outer_turn_id: turn_protagoras_0057
stephanus_span: 344e-345e
char_span:
  start_char: 73474
  end_char: 75623
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 86deb7d5e1bdd4cc44c11c2070a2d592de46cb0f4b2cfef1ef223c3f1dee4eff
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 73474
    end_char: 73477
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0036
source_work: Protagoras
outer_turn_id: turn_protagoras_0058
stephanus_span: 345e-346e
char_span:
  start_char: 75623
  end_char: 77606
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1dc0c740accd7dbb49667998e3c2e931dca6d6482242a1581a150d1aceb675f2
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 75623
    end_char: 75626
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0037
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 346e-347e
char_span:
  start_char: 77606
  end_char: 79591
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 40dc32e424237c23edf59c6241430b143943fd12bd7dcbf3cd52cc72d141da05
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 77606
    end_char: 77609
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0038
source_work: Protagoras
outer_turn_id: turn_protagoras_0060
stephanus_span: 347e-348e
char_span:
  start_char: 79591
  end_char: 81550
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 695d4e2d00653f6d082a53130aeaa0d06f8220ad6ac285124a2824e7f7416e71
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 79591
    end_char: 79594
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0039
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 348e-349e
char_span:
  start_char: 81550
  end_char: 83720
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1bbe418acc1d6cb83e48fa4d330f2ced94a5fba8ddb0fd092b09262cf3918191
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 81550
    end_char: 81553
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0040
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 349e-350e
char_span:
  start_char: 83720
  end_char: 85680
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f289f75ab7a808424a5051e090292fa4ed67041ee1cce272206784fc06c6b7ee
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 83720
    end_char: 83723
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0041
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 350e-351e
char_span:
  start_char: 85680
  end_char: 87817
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7e66c09762f769e8231f394a8849bffd215c6ce02fddcb5ea23a72aa284a3cae
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 85680
    end_char: 85683
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0042
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352a-352e
char_span:
  start_char: 87817
  end_char: 89762
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f2bbad2fe7645e10eba175c16f9a3925e42765eef29c95ecd9b0e4fd9c319876
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 87824
    end_char: 87827
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0043
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 352e-353e
char_span:
  start_char: 89762
  end_char: 91839
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6e21232f88e1265f817ab23960d11e146521ae54d286148e609857c793d19a97
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 89762
    end_char: 89765
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0044
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 353e-354e
char_span:
  start_char: 91839
  end_char: 94056
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f4ffc978b576e5ee6e3670eef660cb64901d686203d5eb709fdac2a00d6e38d1
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 91839
    end_char: 91842
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0045
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 354e-355e
char_span:
  start_char: 94056
  end_char: 96074
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6ec2fed0286fae2ca2d4e4d71e3f56929ce51c184192cf2ff1eaabc7e17c9e0a
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 94056
    end_char: 94059
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0046
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 355e-356e
char_span:
  start_char: 96074
  end_char: 98264
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6240c767893c328ab03775c99bfa06c67a0fb1f71976d46903e5ce1224fb1a48
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 96074
    end_char: 96077
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0047
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 356e-357e
char_span:
  start_char: 98264
  end_char: 100565
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d32d3172c9327d70eb585688ce5ff4d864d2b018743f1b0f72bd0e792ee1bb66
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 98264
    end_char: 98267
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0048
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358a-359a
char_span:
  start_char: 100565
  end_char: 102689
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1c0b0db1b5c3c4123a8e78974958789c6ecbfdaaa9727f398a28d39761c8a838
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 100572
    end_char: 100575
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0049
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359a-359e
char_span:
  start_char: 102689
  end_char: 104820
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3bec73198e7a46c1f1d1b324e9933e4794554e32ad2b148bc6315abc3f8dc5b9
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 102689
    end_char: 102692
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0050
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 359e-360e
char_span:
  start_char: 104820
  end_char: 106899
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2807dabec5fdec3c876f6de7a527611e2845d521fbe964449a0dd4a917033cd3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 104820
    end_char: 104823
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0051
source_work: Protagoras
outer_turn_id: turn_protagoras_0073
stephanus_span: 360e-361e
char_span:
  start_char: 106899
  end_char: 108971
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c5b09ae80c1a2df3dd95eb44cde208b0b00d9c58db33cc6858e9370db9a5e1ee
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 106899
    end_char: 106902
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0052
source_work: Protagoras
outer_turn_id: turn_protagoras_0074
stephanus_span: 362a
char_span:
  start_char: 108971
  end_char: 109160
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e30c272be94a687bca8ef1d34b75ac045c073fd7480af29503ff3d55f29c4830
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 108978
    end_char: 108981
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0053
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 1866
  end_char: 1905
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3981e8417faac4df0c53427afb044d50c59a3333e3fe92d2a03803a4df053031
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 1878
    end_char: 1881
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0054
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 1906
  end_char: 2005
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2e19a757e40872233bd33fe9e1fc2e5a7d91c50a4106f2ba93c416b72792af85
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 1958
    end_char: 1962
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0055
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 2006
  end_char: 2040
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4ff66e3e1a7eb9773acf3cb3c6683c95e5414845131eac108571e94782abd00c
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 2016
    end_char: 2023
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0056
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 2041
  end_char: 2126
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1cef2941fc1c7c2f67c3ceb17d876bdd351d35372f8a57ab5b776220c852f762
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 2064
    end_char: 2073
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0057
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 2127
  end_char: 2165
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f87ac0b6b12eca0d17ef52a629f08b2ee4a96ec7824c3d71927bca1a522f557e
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 2139
    end_char: 2142
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0058
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 2166
  end_char: 2220
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7479f0c48bb3d0880842ad9f77b67e693e2201de52a5ec6d2cdbcad3069ed9b1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 2182
    end_char: 2190
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0059
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310b
char_span:
  start_char: 2221
  end_char: 2252
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 60cf97ddc8b7179be77d396a0da9815ed89059654f8c265e526bb3afe8984193
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 2236
    end_char: 2239
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0060
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310c-310d
char_span:
  start_char: 2337
  end_char: 2791
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8e8bd46a6a3d03b74d2754996a5c7116371b3b25f2977279ab8a2fc475476d09
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ἐκαθέζετο παρὰ τοὺς πόδας μου, καὶ εἶπεν
    start_char: 2295
    end_char: 2335
    antecedent_text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός
    antecedent_start_char: 1687
    antecedent_end_char: 1735
limits: "310c. Declared, not anchored: the only cue here INTRODUCES the utterance, and introducing narration belongs to the depth-1 record. The segment opened on ἐκαθέζετο παρὰ τοὺς πόδας μου — Socrates narrating, the feet being his — so a span starting there puts the narrator's words in Hippocrates' mouth. Trim it off and nothing printed inside the utterance names its speaker, which is what anchoring requires. The formula's subject is unexpressed and third person, so not the first-person narrator; its antecedent is the nominative Ἱπποκράτης opening the scene."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0061
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310d
char_span:
  start_char: 2792
  end_char: 2923
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8e82ebdd49f437a56255d5ecf7614d286aa1bb220a881b0c73d5817fef111312
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 2868
    end_char: 2877
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0062
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310d
char_span:
  start_char: 2940
  end_char: 3013
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 65c6e5415d229d0a2af80f9f88c296afd89eeff53aa4d14256d9c512adf04537
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὃς γελάσας
    start_char: 2924
    end_char: 2938
    antecedent_text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός
    antecedent_start_char: 1687
    antecedent_end_char: 1735
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0063
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310d
char_span:
  start_char: 3014
  end_char: 3123
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b6f06b5cb7717bef4ce55668d9fe9b81aac4a1030434c0001d725539f4693016
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 3040
    end_char: 3048
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0064
source_work: Protagoras
outer_turn_id: turn_protagoras_0022
stephanus_span: 310d-310e
char_span:
  start_char: 3124
  end_char: 3430
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 33bd21ccfe24e37ede7303e21fb7d51d2e4a4bc4333ae32556668ec66bbde390
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 3132
    end_char: 3139
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0065
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 310e-311a
char_span:
  start_char: 3435
  end_char: 3647
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 38aa35cc3a196a80723a1b6b3a38481fa05a2105f2f8be3039e60703f1aac3a7
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 3445
    end_char: 3455
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0066
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311a
char_span:
  start_char: 3648
  end_char: 3913
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 12396f1fbdeefbf5e2805f73e3bd4a97716e31ef8bbcddd1ebc0159fd4758904
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 3648
    end_char: 3661
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0067
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311a-311c
char_span:
  start_char: 3964
  end_char: 4464
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 85980259aee4f57a955b7ffe3ad2227603dd41d6a89e6a93c466b6fa31a4bab1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 4058
    end_char: 4066
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0472
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311b-311c
char_span:
  start_char: 4361
  end_char: 4448
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c907023f6f2e2e2ff55a3e8726524d0535c72341e000c76419c5f2dc33ab60c3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The introducing construction εἴ τίς σε ἤρετο at 4344-4360 stages this question for an indefinite τις. The quoted words address Hippocrates in the vocative (ὦ Ἱππόκρατες), which names the addressee, and the reply at 4470 is his; so the asker is neither man speaking. The Greek gives him no name, no role description and no antecedent.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0068
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4465
  end_char: 4493
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 067e47413ac33ddfe6c4ed19672970fa577ef1febdd4d5d22f6a3ad0922c6b3c
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 4475
    end_char: 4478
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0069
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4495
  end_char: 4523
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dc90894ea3ebf087608996205fc7fd8ef31433a71268bc50b25200fdfb77630f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0070
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4525
  end_char: 4540
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0f9322ff79d50b0d131e184edaaea4cd0433b1fd461fb4372526714a90078288
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 4536
    end_char: 4539
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0071
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4541
  end_char: 4772
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8d0fd0c425af0bc44142ac0a8ddcea0a08e81b503db8da2223b5b4a397ebca68
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠΠΟΚΡ.
    - ΣΩ.
  context_span:
    start_char: 4525
    end_char: 4800
    text_sha256: 5f86e8974805295892b678f752e5a391100815c41be569f852f40814f39bc65a
  rationale: The span addresses its hearer throughout in the second person singular — ἐπενόεις, σαυτοῦ, σε, and the closing τί ἂν ἀπεκρίνω; — and the ἔφη-marked ΙΠΠΟΚΡ. reply ὡς ἰατρός at 4525-4540 stands immediately before it while the answer εἶπον ἂν ὡς ἀγαλματοποιοῖς at 4773-4800 stands immediately after. The addressee of a question is not its asker, so ΙΠΠΟΚΡ. is excluded and inside this two-party exchange the narrator remains. The construction repeats 0067, which ἔφην ἐγώ at 4058 fixes on the narrator.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0494
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4672
  end_char: 4756
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: eca66fab0a7b62b9d53840126bf5805b315e282fc81f786280c82d9a196d4759
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The introducing construction εἴ τίς σε ἤρετο at 4655-4671 stages this question for an indefinite τις, the same formula the period already used at 4344-4360. The quoted words address Hippocrates in the second person (ἐν νῷ ἔχεις) and are answered by εἶπον ἂν ὡς ἀγαλματοποιοῖς at 4773-4800, so the asker is neither man speaking. The Greek gives him no name, no role description and no antecedent.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0072
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4773
  end_char: 4800
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 17cdd45aa62f0b2ad7b9b9403badbed8362347402e0af6b4373baa87b03b03a8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0073
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4802
  end_char: 4839
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 12ded5d36877151fa7365b599a2dc6fe78e13d5741e198ffee63286d69bbd0aa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0464
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c
char_span:
  start_char: 4841
  end_char: 4865
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 043efe53a34633f18ad0ec22d832141dea6bf6cec24537a1bc4ac0cc52ad23ba
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: The answer half of a record that formerly held two utterances at once, the question and this reply, separated by the em dash this stretch uses for a change of speaker. A discourse unit the source delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146; it prints no reporting verb, where the parallel answer at 4465 carries one.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0074
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311c-311e
char_span:
  start_char: 4866
  end_char: 5450
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5844dfaec16cecda263d1d8511ae22ec1a45b38c94e2fc48d7b35abf7c6b65a7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 4872
    end_char: 4881
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0473
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311d
char_span:
  start_char: 5166
  end_char: 5268
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ebcf8d6810e3a985a4025c03ee13b5319406a6407ed1083457a50b35dd7af225
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The asker is the indefinite τις of εἰ οὖν τις ἡμᾶς περὶ ταῦτα οὕτω σφόδρα σπουδάζοντας ἔροιτο at 5106-5165. The quoted words address Socrates and Hippocrates together in the vocative and ask them as second person plural (ἔχετε), and the answer is first person plural ἀποκριναίμεθα, so the asker is neither. He is never named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0075
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311e
char_span:
  start_char: 5451
  end_char: 5515
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0c25e880d5fcb0bdb1f864da11dc143ef0197f626907225b27afae7a163e490e
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 5511
    end_char: 5514
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0076
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311e
char_span:
  start_char: 5516
  end_char: 5561
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 697ee360c6746d79614211111d4e30f5769c0362508da5ca8c6111062e92fcd9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0077
source_work: Protagoras
outer_turn_id: turn_protagoras_0023
stephanus_span: 311e
char_span:
  start_char: 5562
  end_char: 5570
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 472ad6e1f5fc7f6891d8d87b3688cdfb3c219b7bbffe9e7d74607d8ed1526add
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0078
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 311e-312a
char_span:
  start_char: 5576
  end_char: 5684
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c7791154acd96e00bf4984b36d1bd22d56aa5dcfc52f57712d322cd0d4cb4a91
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠΠΟΚΡ.
    - ΣΩ.
  context_span:
    start_char: 5576
    end_char: 5832
    text_sha256: 91fc3f692544ca4562105e3335257cc4ecdb7ca7cde7e013b31714bad67ba4fa
  rationale: The span puts its question to a second person singular σε and the narration that follows it, καὶ ὃς εἶπεν ἐρυθριάσας at 5686-5709, hands the floor to the other man for the answer σοφιστὴς γενησόμενος at 5768-5832, which 0079 fixes on ΙΠΠΟΚΡ. The addressee who then answers is not the asker, so ΙΠΠΟΚΡ. is excluded and inside this two-party exchange the narrator remains.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0495
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312a
char_span:
  start_char: 5619
  end_char: 5684
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3db35962def5ed70a019023a6d67ae3d27e1d0bd19e05907c83ddfe29cb7dace
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The asker is the indefinite τις of εἰ οὖν καὶ τοῦτό τίς σε προσέροιτο at 5576-5610. The quoted words put their question to a second person singular ἔρχῃ addressed to Hippocrates, and the answer at 5768-5832 is his, so the asker is neither man speaking. He is never named and no antecedent supplies him one.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0079
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312a
char_span:
  start_char: 5768
  end_char: 5832
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 40e0548a1af90124e2392e555c10bfed068b47b5795b451a5e143c6503cfca09
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὃς εἶπεν ἐρυθριάσας
    start_char: 5686
    end_char: 5709
    antecedent_text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός
    antecedent_start_char: 1687
    antecedent_end_char: 1735
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0080
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312a
char_span:
  start_char: 5833
  end_char: 5920
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 70e6907352cb2d92afb41c9c37d8cf8b305ff3d2c36be4b83f3ba89bd2495bff
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 5840
    end_char: 5849
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0081
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312a
char_span:
  start_char: 5921
  end_char: 5978
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 89eb0b990c14cf6ccb7c590921ff6591169e13441add69afbc1507aa80892d5a
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 5933
    end_char: 5943
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0082
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312a-312b
char_span:
  start_char: 5979
  end_char: 6281
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b5d89cd4eb81e431987a15d8b27457b319ae4c3b7e7efd6d7cbfe54a1a6fb60a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠΠΟΚΡ.
    - ΣΩ.
  context_span:
    start_char: 5921
    end_char: 6358
    text_sha256: 760d3b1971301e40fb4244dd5e9c35697b1c4a6d7cd670ff815b00f8665f50c3
  rationale: "The span carries the addressee vocative ὦ Ἱππόκρατες at 5989, outside any {q}. It sits inside the two-party exchange the anchors at 1864 and 11146 enclose, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. A vocative names the addressee, so the addressee here is ΙΠΠΟΚΡ. and the speaker is the other party, the narrator. The context stops at 5921 and 6358, the flanking utterances the source itself marks as ΙΠΠΟΚΡ.'s: 5921 by its own ὦ Σώκρατες and 6282 by ἔφη."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0083
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312b
char_span:
  start_char: 6282
  end_char: 6358
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 42b8d37bc1a6624bf2e8633356d207186834502a7545549825b5ce83dbca3bf0
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 6306
    end_char: 6309
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0084
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312b
char_span:
  start_char: 6363
  end_char: 6422
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4b7f335ff1aa60f2734d50f46a7ed0b7377dff09391aad4ab490f4578c9348c6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6412
    end_char: 6421
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0085
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312b
char_span:
  start_char: 6423
  end_char: 6432
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9cdc6f44c79ffde364a9c9e339aca96727f43a3daf1f2bf5d99826772c483b03
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0086
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312b-312c
char_span:
  start_char: 6433
  end_char: 6669
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: be7aaa4347b6463ee32f57676203e156cf81b3fee3dbeef5b82d91051c9aa982
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0087
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312c
char_span:
  start_char: 6670
  end_char: 6693
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: eee8c4495f8059d032f3a7f13ce6e58e12efdb579d37ba07b001d6d813468742
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 6680
    end_char: 6683
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0088
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312c
char_span:
  start_char: 6694
  end_char: 6729
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 741b8aef9d069dfe221bec215beded6189e4d32b5209a9ad2ab34e0b92cc183f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0089
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312c
char_span:
  start_char: 6730
  end_char: 6807
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c99cbdcdddb6c77b97b1285be0affd0a0a9d6a9c1a194de4c9f99389a9961fc4
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 6739
    end_char: 6746
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0090
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312c-312d
char_span:
  start_char: 6808
  end_char: 7217
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8db2bd295d2dd486a7b90ae7d2c42af9bb7f831c906c6cf245de9d854c5cc37b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6816
    end_char: 6825
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0474
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312d
char_span:
  start_char: 6962
  end_char: 7014
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4e25a8742d591568465a4c4b625d4d5a7ef2597beccf0b5ba82269e78bc2b7ba
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἴ τις ἔροιτο ἡμᾶς at 6942-6961 stages the question for an indefinite τις distinct from the ἡμᾶς it addresses. The reply is εἴποιμεν ἄν που αὐτῷ, first person plural with the questioner as dative αὐτῷ, so the source separates asker from answerers while naming neither the asker nor any role he fills.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0475
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312d
char_span:
  start_char: 7123
  end_char: 7165
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 982451c13a4fbf22a8da3cbd1e1539d215035754e8baf4da9530c706c8aba465
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἰ δέ τις ἐκεῖνο ἔροιτο at 7098-7122 stages a second indefinite questioner in the same argument, answered by τί ἂν ἀποκρινοίμεθα αὐτῷ. Neither τις nor the resumptive αὐτῷ resolves to a named individual or to a role description anywhere in the period.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0091
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312d
char_span:
  start_char: 7218
  end_char: 7296
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a7ba3aadda82190cf9a47508f137c971b4a8b91cc36d577f8897de334fb8308b
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 7246
    end_char: 7256
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0092
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312d-312e
char_span:
  start_char: 7297
  end_char: 7541
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0f3d84fef4460f9d779cf61ee60e3c1ebf3efa12690718eb65d4cadb8b2a2193
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 7306
    end_char: 7315
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0093
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312e
char_span:
  start_char: 7542
  end_char: 7546
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0094
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312e
char_span:
  start_char: 7547
  end_char: 7601
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5336dae56843c0f93883e0debd39e1a2cc848b1416cd4a023f863c8528654018
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0095
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312e
char_span:
  start_char: 7602
  end_char: 7638
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a80ac99af6769ed40952df6b2fdbb3ea3c740cbb562376db04e0ff7bcae992b0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0096
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312e
char_span:
  start_char: 7639
  end_char: 7733
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b34b5a66f000ccdab5b44d3485c5b2a3ae9f2b431574a662020146c07fe622da
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΙΠΠΟΚΡ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 1864 and 11146, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0097
source_work: Protagoras
outer_turn_id: turn_protagoras_0024
stephanus_span: 312e
char_span:
  start_char: 7734
  end_char: 7769
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d5db1feef30af24100dc6a7ed538af6fcf4aa3b674d5ec67dbd4159a285b801e
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 7742
    end_char: 7745
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0098
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 313a-313c
char_span:
  start_char: 7785
  end_char: 8798
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: db8529fd2653906bb0b4f4e64dac32a051dca95f1fd014461234e6cb01ee51ec
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 7785
    end_char: 7798
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0099
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 313c
char_span:
  start_char: 8815
  end_char: 8856
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ecd7c2e0937f7d32afc3868a6947131fd3080b50fcca304684ee30049d9ba4b1
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὃς ἀκούσας
    start_char: 8799
    end_char: 8813
    antecedent_text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός
    antecedent_start_char: 1687
    antecedent_end_char: 1735
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0100
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 313c
char_span:
  start_char: 8857
  end_char: 8994
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2fd460fe1e69969e3c0005ef7effe1fb4665c344111f8c6f3d94ea72545c4d41
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠΠΟΚΡ.
    - ΣΩ.
  context_span:
    start_char: 8815
    end_char: 9030
    text_sha256: 717b30ee47c2f6cdd0567e2ed489a520ed7550aa094283744eb6ce61397edbc1
  rationale: "The span carries the addressee vocative ὦ Ἱππόκρατες at 8866, outside any {q}. It sits inside the two-party exchange the anchors at 1864 and 11146 enclose, in which the text marks direct speech for the narrator and for ΙΠΠΟΚΡ. and for no one else. A vocative names the addressee, so the addressee here is ΙΠΠΟΚΡ. and the speaker is the other party, the narrator. The context stops at 8815 and 9030, the flanking ΙΠΠΟΚΡ. utterances: 8815 carries ἔφη under καὶ ὃς ἀκούσας, 8995 its own ὦ Σώκρατες."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0101
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 313c
char_span:
  start_char: 8995
  end_char: 9030
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bea7fe61e3823519a3c36541e643bd621e1a8336e730cf862b3a9753b5106a89
voice_chain:
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 9008
    end_char: 9018
  - kind: named_reporting_formula
    role: exchange_open
    text: Ἱπποκράτης, ὁ Ἀπολλοδώρου ὑὸς Φάσωνος δὲ ἀδελφός, τὴν {310b} θύραν τῇ βακτηρίᾳ πάνυ σφόδρα ἔκρουε, καὶ ἐπειδὴ αὐτῷ ἀνέῳξέ τις, εὐθὺς εἴσω ᾔει ἐπειγόμενος, καὶ τῇ φωνῇ μέγα λέγων
    start_char: 1687
    end_char: 1864
  - kind: role_reporting_formula
    role: exchange_close
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0102
source_work: Protagoras
outer_turn_id: turn_protagoras_0025
stephanus_span: 313c-314a
char_span:
  start_char: 9031
  end_char: 9945
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9bea0171f4e58e0a5087d11db6b9eba48ab921f600daaac5fcf4007f8241161f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 9048
    end_char: 9057
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0103
source_work: Protagoras
outer_turn_id: turn_protagoras_0026
stephanus_span: 314a-314c
char_span:
  start_char: 9950
  end_char: 10861
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1902775a704b094c588fbec89b520427bffd9daf79d5c1e5bae6d36576b65bac
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠΠΟΚΡ.
    - ΣΩ.
  context_span:
    start_char: 9946
    end_char: 10894
    text_sha256: 7142ec010e6a38d033a90cfdf89c1b58840502c6ea96fabbbed7c7be2c01cf87
  rationale: The utterance opened at 9031 by "μαθήμασιν δήπου, ἦν δ’ ἐγώ" runs unbroken to 10862, where "{p} δόξαν ἡμῖν ταῦτα ἐπορευόμεθα" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0104
source_work: Protagoras
outer_turn_id: turn_protagoras_0026
stephanus_span: 314d
char_span:
  start_char: 11331
  end_char: 11370
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c0da1389101204396afe9d6be2e1e69f1db752b256cebd5e023c18c7225a368a
voice_chain:
  - ΣΩ.
  - ΘΥΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: ὁ θυρωρός, εὐνοῦχός τις, κατήκουεν ἡμῶν
    start_char: 11146
    end_char: 11185
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0105
source_work: Protagoras
outer_turn_id: turn_protagoras_0026
stephanus_span: 314d
char_span:
  start_char: 11524
  end_char: 11572
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 964d4a4448498c86c5a793d5ac42c2b5980c285e06200d76a381a25b36fd9d25
voice_chain:
  - ΣΩ.
  - ΘΥΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὃς ἐγκεκλῃμένης τῆς θύρας ἀποκρινόμενος εἶπεν
    start_char: 11473
    end_char: 11522
    antecedent_text: ὁ θυρωρός, εὐνοῦχός τις
    antecedent_start_char: 11146
    antecedent_end_char: 11169
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0106
source_work: Protagoras
outer_turn_id: turn_protagoras_0026
stephanus_span: 314d-314e
char_span:
  start_char: 11573
  end_char: 11738
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c45f8174ac55d2018e1e87d6a5a3b0590f11efe404f3d76f629c3c764f9d36c7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 11594
    end_char: 11602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0107
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316b
char_span:
  start_char: 14548
  end_char: 14624
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f8a6d498c9616c494e132e3876010ae031e838736d82b2459c4e7dc5cab6cbd8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 14548
    end_char: 14561
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0108
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316b
char_span:
  start_char: 14629
  end_char: 14692
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9243737d7f9575a0104d10dfeb1c5c4157a1a830458bcceaeb3abffff9ed2c1f
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 14638
    end_char: 14641
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ ἐγὼ εἶπον· ὦ Πρωταγόρα, πρὸς σέ τοι ἤλθομεν ἐγώ τε καὶ Ἱπποκράτης οὗτος.
    start_char: 14548
    end_char: 14624
  - kind: named_reporting_formula
    role: exchange_close
    text: πάνυ μὲν οὖν, ἔφη ὁ Πρωταγόρας.
    start_char: 17665
    end_char: 17696
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0109
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316b
char_span:
  start_char: 14697
  end_char: 14776
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3d5818cf6195246c552cdb579e8e03f4f98bfe9076372684f8f531b4955bdd15
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 14707
    end_char: 14716
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0110
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316b
char_span:
  start_char: 14781
  end_char: 14818
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c814559c56ea0b14c7d6e53db372cd3457a57f7a7fc3411aa013498d29b4de1b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 14798
    end_char: 14801
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ ἐγὼ εἶπον· ὦ Πρωταγόρα, πρὸς σέ τοι ἤλθομεν ἐγώ τε καὶ Ἱπποκράτης οὗτος.
    start_char: 14548
    end_char: 14624
  - kind: named_reporting_formula
    role: exchange_close
    text: πάνυ μὲν οὖν, ἔφη ὁ Πρωταγόρας.
    start_char: 17665
    end_char: 17696
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0111
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316b-316c
char_span:
  start_char: 14823
  end_char: 15205
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 67df1771e033a483a8b4f5df694e8bf14a9091e1abdbfd99fba3a81f09cae778
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 14548
    end_char: 15205
    text_sha256: d55b5a2f3ba02e391b6964bc87453bb8a1519cf93e64c3fb81125afb2f68990a
  rationale: "The span calls Hippocrates Ἱπποκράτης ὅδε at 14823, third person with a deictic pointing at him, which excludes him as its speaker. It answers the question at 14781, οὗ ἕνεκα ἥκετε;, and puts back to its addressee the choice ΠΡΩΤ. himself raised at 14629: σὺ σκόπει, πότερον περὶ αὐτῶν μόνος οἴει δεῖν διαλέγεσθαι πρὸς μόνους, ἢ μετ’ ἄλλων. The addressee of that σύ is ΠΡΩΤ., who cannot also be speaking it. Inside the two-party exchange the anchors at 14624 and 17665 enclose, the remaining owner is the narrator."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0112
source_work: Protagoras
outer_turn_id: turn_protagoras_0028
stephanus_span: 316c-316e
char_span:
  start_char: 15210
  end_char: 16313
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c7073e4028f695d20db68c50e0804931615f588caa87e40e8f77e196ee5fad49
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 15217
    end_char: 15220
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ ἐγὼ εἶπον· ὦ Πρωταγόρα, πρὸς σέ τοι ἤλθομεν ἐγώ τε καὶ Ἱπποκράτης οὗτος.
    start_char: 14548
    end_char: 14624
  - kind: named_reporting_formula
    role: exchange_close
    text: πάνυ μὲν οὖν, ἔφη ὁ Πρωταγόρας.
    start_char: 17665
    end_char: 17696
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0113
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 316e-317c
char_span:
  start_char: 16318
  end_char: 17420
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4ec68d225b8b3f4a496a25d59e5dd719c2c56f113212f347f656bc3734ad67b4
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: ὀρθῶς, ἔφη, προμηθῇ, ὦ Σώκρατες
    start_char: 15210
    end_char: 15241
  - kind: formula_bounded_continuation
    text: "{p} καὶ ἐγώ—ὑπώπτευσα γὰρ βούλεσθαι αὐτὸν"
    start_char: 17421
    end_char: 17462
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0114
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 317c-317d
char_span:
  start_char: 17425
  end_char: 17660
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ecb988b08e9f9975501582f0341d359bf8b4f96dd840a7f3d78effba722f87cb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 17570
    end_char: 17578
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0115
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 317d
char_span:
  start_char: 17665
  end_char: 17677
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9ffb7040deb577808b5c17154441c5959ff32956b7c000b3139422cc7f7fb053
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Πρωταγόρας
    start_char: 17679
    end_char: 17695
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0116
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 317d
char_span:
  start_char: 17701
  end_char: 17783
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 73d70824d025546372d67b26c54d0cda48c6afc9db3d290fb54ce2dd2f08ed61
voice_chain:
  - ΣΩ.
  - ΚΑΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Καλλίας ἔφη
    start_char: 17715
    end_char: 17728
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0117
source_work: Protagoras
outer_turn_id: turn_protagoras_0029
stephanus_span: 317e
char_span:
  start_char: 18145
  end_char: 18273
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bee50c0fe1a7eff7330cb5cea8cb3c655d2732bab1ebea6197c5258db6c40e73
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 18156
    end_char: 18159
  - kind: named_reporting_formula
    role: exchange_open
    text: ἐπεὶ δὲ πάντες συνεκαθεζόμεθα, ὁ Πρωταγόρας
    start_char: 18100
    end_char: 18143
  - kind: closing_formula
    role: exchange_close
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0118
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 318a
char_span:
  start_char: 18289
  end_char: 18526
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 863f6d80557c947f32ce08d245d5131393143fb3fcde9bd79bb0d38a401b352f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 18289
    end_char: 18302
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0119
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 318a-318b
char_span:
  start_char: 18564
  end_char: 18757
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 60173b6df4f229d4eb6a57a98f1e4e128e2f03a34f9c8eb30c0d41625d3b8b2d
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὑπολαβὼν οὖν ὁ Πρωταγόρας εἶπεν
    start_char: 18531
    end_char: 18562
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0120
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 318b-318d
char_span:
  start_char: 18762
  end_char: 19836
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2417737f52d8780680d9ff98a8a1179e529a47cb1642b79aa51c5e47c9b02137
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ ἀκούσας εἶπον
    start_char: 18762
    end_char: 18783
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0476
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 318c
char_span:
  start_char: 19318
  end_char: 19373
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: aa05c73af65b99f9eb33a85d97aaac0efd1e66171f0e1abef4cf4c1d17da66d2
voice_chain:
  - ΣΩ.
  - ΣΩ.
  - ΙΠΠΟΚΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: Ἱπποκράτης ὅδε ἐπιθυμήσειεν τῆς συνουσίας τούτου τοῦ νεανίσκου τοῦ νῦν νεωστὶ ἐπιδημοῦντος, Ζευξίππου τοῦ Ἡρακλεώτου, καὶ ἀφικόμενος παρ’ αὐτόν, ὥσπερ παρὰ σὲ {318c} νῦν, ἀκούσειεν αὐτοῦ ταὐτὰ ταῦτα ἅπερ σοῦ, ὅτι ἑκάστης ἡμέρας συνὼν αὐτῷ βελτίων ἔσται καὶ ἐπιδώσει, εἰ αὐτὸν ἐπανέροιτο·
    start_char: 19030
    end_char: 19317
limits: "The cited formula is the whole conditional period because that is the extent of the reporting construction: Ἱπποκράτης ὅδε at 19030 is the nominative subject governing ἐπιθυμήσειεν, ἀφικόμενος, ἀκούσειεν and finally ἐπανέροιτο at 19305, the optative that introduces this span. Shortening it drops the subject. αὐτόν is Zeuxippus, who answers at 19373 (εἴποι ἂν αὐτῷ ὁ Ζεύξιππος). The mood is counterfactual; the naming is not."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0121
source_work: Protagoras
outer_turn_id: turn_protagoras_0030
stephanus_span: 318d-319a
char_span:
  start_char: 19878
  end_char: 20537
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fb1436e839c70e142319175550ef40c47d0e042f185b7beec6ba2c965838d2bb
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Πρωταγόρας ἐμοῦ ταῦτα ἀκούσας, σύ τε καλῶς ἐρωτᾷς, ἔφη
    start_char: 19841
    end_char: 19901
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0122
source_work: Protagoras
outer_turn_id: turn_protagoras_0031
stephanus_span: 319a
char_span:
  start_char: 20546
  end_char: 20671
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b7a5485c0a314c83e0c148bc1f1d95b2963948a6f5a51a20cbcd423af26fd67d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 20551
    end_char: 20559
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0123
source_work: Protagoras
outer_turn_id: turn_protagoras_0031
stephanus_span: 319a
char_span:
  start_char: 20676
  end_char: 20747
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 014cca54f320bbaaab4ca99181186f823cc25ba1764af0aa25bf2f246900f3ec
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 20702
    end_char: 20705
  - kind: named_reporting_formula
    role: exchange_open
    text: ἐπεὶ δὲ πάντες συνεκαθεζόμεθα, ὁ Πρωταγόρας
    start_char: 18100
    end_char: 18143
  - kind: closing_formula
    role: exchange_close
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0124
source_work: Protagoras
outer_turn_id: turn_protagoras_0031
stephanus_span: 319a-319e
char_span:
  start_char: 20752
  end_char: 22365
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d268f6db81dffda7947edba796222f1477927b06b9f85ba95b265a8c52724ebf
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 20761
    end_char: 20770
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0125
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 319e-320c
char_span:
  start_char: 22370
  end_char: 23396
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 27598d32526d309c61650b9372c40347480887593c39bc23a3471630c6eac911
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 22366
    end_char: 23434
    text_sha256: f853d0a202f37ea064175b83abd361e8b149bf23b8689b5052dabae4163aa4d5
  rationale: The utterance opened at 20752 by "ἦ καλόν, ἦν δ’ ἐγώ, τέχνημα ἄρα κέκτησαι" runs unbroken to 23401, where "ἀλλ’, ὦ Σώκρατες, ἔφη, οὐ φθονήσω" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0126
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 320c
char_span:
  start_char: 23401
  end_char: 23519
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5b9308b36834328cd41091d013eaf6826ebc3f3d448fab3b56be5b21c315ab37
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 23419
    end_char: 23422
  - kind: named_reporting_formula
    role: exchange_open
    text: ἐπεὶ δὲ πάντες συνεκαθεζόμεθα, ὁ Πρωταγόρας
    start_char: 18100
    end_char: 18143
  - kind: closing_formula
    role: exchange_close
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0127
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 320c
char_span:
  start_char: 23602
  end_char: 23661
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 45bed8f0dc2ba89619d6b5843e47b5c26355d7a59a1e4e31eb88e46ad477891b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 23620
    end_char: 23623
  - kind: named_reporting_formula
    role: exchange_open
    text: ἐπεὶ δὲ πάντες συνεκαθεζόμεθα, ὁ Πρωταγόρας
    start_char: 18100
    end_char: 18143
  - kind: closing_formula
    role: exchange_close
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0128
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 320c-320e
char_span:
  start_char: 23666
  end_char: 24312
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3ff815c34931f756150febbbfd2969cea002a189f5cb9f3a9f71fafb9e2f6727
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0465
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 320d
char_span:
  start_char: 24053
  end_char: 24079
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: de162833a3c21fe22ce98f83981346773c8619daf0a2143835020ea950514b07
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
  - ΕΠΙΜ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: Προμηθέα δὲ παραιτεῖται Ἐπιμηθεὺς αὐτὸς νεῖμαι,
    start_char: 24005
    end_char: 24052
limits: "The formula that reports the words is the bare parenthetical ἔφη at 24080, which expresses no subject. The cited clause immediately before the span supplies it: Ἐπιμηθεύς is nominative, singular and third person, agreeing with both παραιτεῖται and ἔφη, and it is the only nominative available. Προμηθέα is accusative, the person asked. The span stops at the {/q} the edition prints, so the reporting formula stays with ΠΡΩΤ."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0470
source_work: Protagoras
outer_turn_id: turn_protagoras_0032
stephanus_span: 320d
char_span:
  start_char: 24085
  end_char: 24104
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9775af6e242c7c139fb396ea59a9872be0790a4343217ccaee51c1f54c493914
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
  - ΕΠΙΜ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: Προμηθέα δὲ παραιτεῖται Ἐπιμηθεὺς αὐτὸς νεῖμαι,
    start_char: 24005
    end_char: 24052
limits: "The second half of the same utterance, reopened by the edition after the parenthetical ἔφη at 24080. It cites the same naming clause as the first half: the bare ἔφη names nobody, and Ἐπιμηθεύς is the only nominative that governs it. The imperative ἐπίσκεψαι is addressed to Prometheus."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0129
source_work: Protagoras
outer_turn_id: turn_protagoras_0033
stephanus_span: 320e-322a
char_span:
  start_char: 24317
  end_char: 26393
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 857c7629feb56ae556e5d642340ab78363690b7507ff6c1e9bbd626e845fc56e
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0130
source_work: Protagoras
outer_turn_id: turn_protagoras_0034
stephanus_span: 322a-322e
char_span:
  start_char: 26402
  end_char: 28136
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 678efe2011c446d2f0c36960efbc5bbde72c293dacc710af9d5a05219762cd06
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0467
source_work: Protagoras
outer_turn_id: turn_protagoras_0034
stephanus_span: 322d
char_span:
  start_char: 27641
  end_char: 27661
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1e0e17f3a31e790dc1b06a4e6e48833b12ee0e4d7567e7939269e9e659ac55a6
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
  - ΖΕΥΣ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Ζεύς
    start_char: 27662
    end_char: 27672
limits: "ἐπὶ πάντας answers Hermes' ἢ ἐπὶ πάντας νείμω; at 27413, and the naming formula printed one character after the {/q} closes it. The span stops at that {/q}: the formula is ΠΡΩΤ. narrating, and a record that swallowed it would cite as its own cue bytes it also claimed Zeus spoke."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0471
source_work: Protagoras
outer_turn_id: turn_protagoras_0034
stephanus_span: 322d
char_span:
  start_char: 27674
  end_char: 27874
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cefe86e517399b599493555ebc47034a5cfa08a9dec31186bf90afdca581dbc1
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
  - ΖΕΥΣ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἔφη ὁ Ζεύς
    start_char: 27662
    end_char: 27672
limits: The second half of the same reply, reopened by the edition two characters after the naming formula. It carries the imperative θὲς and παρ’ ἐμοῦ, first person, consistent with the god the formula names.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0466
source_work: Protagoras
outer_turn_id: turn_protagoras_0034
stephanus_span: 322c-322d
char_span:
  start_char: 27413
  end_char: 27640
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d625a76364b405f67790917a70dcbf375bcc84d8b95f29a2e8cdb14ebb3a9b8b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
  - ΕΡΜΗΣ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ἐρωτᾷ οὖν Ἑρμῆς Δία
    start_char: 27346
    end_char: 27365
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0131
source_work: Protagoras
outer_turn_id: turn_protagoras_0035
stephanus_span: 322e-323a
char_span:
  start_char: 28142
  end_char: 28378
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d297597ae5f29258f36cfa539fc6dae3da16e440a579adc51c70d1e30a5977b4
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0132
source_work: Protagoras
outer_turn_id: turn_protagoras_0035
stephanus_span: 323a-323c
char_span:
  start_char: 28383
  end_char: 29165
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a35c8f325afb5705b5643904a5802416370463b724ffc998bba4d07f7eea1360
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0133
source_work: Protagoras
outer_turn_id: turn_protagoras_0035
stephanus_span: 323c-323e
char_span:
  start_char: 29170
  end_char: 30057
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6e96e9853c6645e8ffd5ddb376c26dd898d5679db94fb1c67a938d356fcc1055
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0134
source_work: Protagoras
outer_turn_id: turn_protagoras_0036
stephanus_span: 323e-324d
char_span:
  start_char: 30062
  end_char: 31384
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 52f15763e49b56090d2f3a44054fd9a16bb7b2b34186c784d5771269dbf7fc23
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0135
source_work: Protagoras
outer_turn_id: turn_protagoras_0036
stephanus_span: 324d-324e
char_span:
  start_char: 31389
  end_char: 31871
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b49ff3c72e8d53fd438910e32be399c7a2df4ab089ab0000082c6809bd261a86
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0136
source_work: Protagoras
outer_turn_id: turn_protagoras_0037
stephanus_span: 324e-325e
char_span:
  start_char: 31876
  end_char: 33786
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e402eec843ea0aae461515ecc718b66af91d8cf981056cdb53a250b21a0ca0b8
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0137
source_work: Protagoras
outer_turn_id: turn_protagoras_0038
stephanus_span: 325e-326e
char_span:
  start_char: 33791
  end_char: 35930
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 04382bb1f11458d92c97ea610376a67256ac4773e37815e94f238d1a1e8782c4
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0138
source_work: Protagoras
outer_turn_id: turn_protagoras_0039
stephanus_span: 326e-327e
char_span:
  start_char: 35939
  end_char: 37938
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d57d181c29697d1b96e86d5f9234126e284944e54f411703ec4cd6419a721ec1
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0139
source_work: Protagoras
outer_turn_id: turn_protagoras_0040
stephanus_span: 327e-328c
char_span:
  start_char: 37943
  end_char: 38928
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 26b4183c881a009efbabd1a45de870cf801141bb57d74ac1d22ed4c32950f17a
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.
    start_char: 23602
    end_char: 23661
  - kind: formula_bounded_continuation
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0140
source_work: Protagoras
outer_turn_id: turn_protagoras_0040
stephanus_span: 328c-328d
char_span:
  start_char: 38933
  end_char: 39346
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cbb3efee18f674434d34a44aa9d57ccb06dee2136b83d812c99d17ce2c4bed9c
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου
    start_char: 39351
    end_char: 39420
limits: "The last unit of the speech, and the only one of its thirteen that a naming formula licenses directly: the close stands five characters after this span, well inside the 200-character bound, and names Πρωταγόρας as the one who has finished τοῦ λόγου. The other twelve cite the same bytes as the right-hand bracket of a formula_bounded_continuation because no naming formula stands within reach of them."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0141
source_work: Protagoras
outer_turn_id: turn_protagoras_0040
stephanus_span: 328d-328e
char_span:
  start_char: 39566
  end_char: 39995
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a8f26ccd0a2aa101349f1a17bae81fa9d4de0f0eb1f7744fb12644763efba679
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον
    start_char: 39566
    end_char: 39608
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0143
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 328e-329d
char_span:
  start_char: 40000
  end_char: 41368
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5dfaa78567a2f54dfd6ab52a37f049fe9368e8d81f1f331365eb3e120772f71c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 39996
    end_char: 41410
    text_sha256: 0c32e00fda8b3636e517a3019abfc10b84303c624716e47481d8b6beeca39c31
  rationale: The utterance opened at 39566 by "μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη" runs unbroken to 41369, where "{p} ἀλλὰ ῥᾴδιον τοῦτό γ’, ἔφη, ὦ Σώκρατε" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0144
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 329d
char_span:
  start_char: 41373
  end_char: 41473
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cbf81a769cf18e57aae20e776bb999a7ea20cdb2db52144d9fd188e71833ac45
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 41395
    end_char: 41398
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0145
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 329d
char_span:
  start_char: 41474
  end_char: 41681
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cec8998a91144021edd256ed3162a13c5d0ffe977b0f3060cb8666ddfc2aa841
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 41483
    end_char: 41487
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0146
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 329d-329e
char_span:
  start_char: 41682
  end_char: 41778
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 62eca0dfd03d2ca350dbeb37d9948714d46cea6c8489090637c61eb045465e23
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ {329e} Σώκρατες
    start_char: 41704
    end_char: 41721
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον
    start_char: 39566
    end_char: 39608
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0147
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 329e
char_span:
  start_char: 41779
  end_char: 41932
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3639e4ea24e6974e1c2d4b5a8b7daf99c243730181d9614d7eb75cec8c0fb387
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 41792
    end_char: 41801
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0148
source_work: Protagoras
outer_turn_id: turn_protagoras_0041
stephanus_span: 329e
char_span:
  start_char: 41933
  end_char: 42014
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c95bcb70fe5fe14a0006a232108f8361ed5bf0f35d5b0f721d6ad035d628f8f4
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 41942
    end_char: 41945
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0149
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 329e-330a
char_span:
  start_char: 42020
  end_char: 42100
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2769f44da900bfd178f315f5392b477b1de8513aef26a9c0bf5484826bed4fff
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 42069
    end_char: 42077
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0150
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330a
char_span:
  start_char: 42101
  end_char: 42163
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 934c5550c65bacf9d06dc518c776322f495440e376d5d57c80d894f6aaa8a642
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 42123
    end_char: 42126
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0151
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330a
char_span:
  start_char: 42164
  end_char: 42216
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 56d3c676461d678218415d62e482eb5205fd843c7eaa35b0fa2dbeec103b5c49
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 42188
    end_char: 42197
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0152
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330a
char_span:
  start_char: 42217
  end_char: 42221
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 39635 and 46478, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0153
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330a-330b
char_span:
  start_char: 42222
  end_char: 42598
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0c482cfb5b41cdf6e8eadf739f15954105937fe0e9112b112d77aae4dac189c5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 39635 and 46478, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0154
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330b
char_span:
  start_char: 42599
  end_char: 42633
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 670b89791ded7fde301a72eea1df0ee6900d7f7a263ea1011bd713dd18984d22
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 42611
    end_char: 42614
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0155
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330b
char_span:
  start_char: 42634
  end_char: 42787
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3ad00c67655f26944024b5e4c5e0d655b33291209c3e746d49e6ce75c73ec86b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 42634
    end_char: 42647
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0156
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330b-330c
char_span:
  start_char: 42797
  end_char: 42967
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 18fca3f786d0e4c56bfe63197e2baaab9f860ab8040d8e4ec5a6608f5fee80f9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 42806
    end_char: 42814
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0157
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330c
char_span:
  start_char: 42968
  end_char: 42979
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d1966aa9e4a921bb858af1c283eacbd32bc6faee2a9969bd7a396934ce6a071b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 42975
    end_char: 42978
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0158
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330c
char_span:
  start_char: 42980
  end_char: 43245
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: aa46f01015b2d776b73abe3d9672ba4ff06b41e3e7fc086493a0be5190016d2d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 42980
    end_char: 43261
    text_sha256: 61abda00bae702710701a795d562b42b340e1bc1c69515480b23ad2c543d26fa
  rationale: "Once the staged question at 43017-43153 is cut out as 0496, what remains sets a first person against a second: ἐγὼ μὲν ἂν αὐτῷ ἀποκριναίμην ὅτι δίκαιον· σὺ δὲ τίν’ ἂν ψῆφον θεῖο; The σύ so asked answers at once in the ἔφη-marked ΠΡΩΤ. reply τὴν αὐτήν at 43246-43261, so ΠΡΩΤ. is the addressee and not the speaker. Inside this two-party exchange the narrator remains."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0496
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330c
char_span:
  start_char: 43017
  end_char: 43153
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c4858ce3265143b361cbc415e1e70023705519e7b41e38e19e5d1111e0e32a46
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The asker is the indefinite τις of εἴ τις ἔροιτο ἐμέ τε καὶ σέ at 42988-43016. The quoted words hail both men in the vocative, ὦ Πρωταγόρα τε καὶ Σώκρατες, and ask them as a pair — dual εἴπετον, plural ὠνομάσατε — while the answer outside is ἐγὼ μὲν ἂν αὐτῷ ἀποκριναίμην at 43154-43182, which sets the asker apart as a dative αὐτῷ. So the owner is neither man, and the Greek never names him.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0159
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330c
char_span:
  start_char: 43246
  end_char: 43261
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 60872d17649a550a2c4853c18f34f494ec0ef92250c68b2e8b82b3e7b1c0b84a
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 43257
    end_char: 43260
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0160
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330c-330d
char_span:
  start_char: 43262
  end_char: 43377
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 399a6d1c3bad4a46dafcd4257ecb603308a52bad332dc12502b55ecd57d799f4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 39635 and 46478, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0161
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43378
  end_char: 43387
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cb9bb978d85cc44c1a937db78132a5c1fdef42eee384c00e446ff7b8110f0d04
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 43383
    end_char: 43386
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0162
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43388
  end_char: 43486
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d8526503bc49cb20151c2af7088e3c8363081cab843a4cb1228b63102b7ebe29
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 43388
    end_char: 43500
    text_sha256: 1d2d2ea6084bba7ffd151e1fcb24ce4b9e84c984b83bdcd12e691529b01fcb68
  rationale: Once the staged question at 43419-43464 is cut out as 0497, what remains is the frame εἰ οὖν μετὰ τοῦτο ἡμᾶς ἔροιτο and the answer φαῖμεν ἄν, ὡς ἐγᾦμαι at 43465-43486, whose ἐγᾦμαι is a first person singular inside a first person plural φαῖμεν. The other member of that plural assents separately in the ΠΡΩΤ. reply ναί, ἦ δ’ ὅς at 43487-43500, so ΠΡΩΤ. is not the speaker and inside this two-party exchange the narrator remains.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0497
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43419
  end_char: 43464
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b5ac74149dfe48a642edf083d4a77e8c8a791d1817505c957fd02075c6c6a423
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The asker is the staged questioner of εἰ οὖν μετὰ τοῦτο ἡμᾶς ἔροιτο at 43388-43418, whom the passage designates only as τῷ ἐρωτῶντι at 43343-43361 and addresses as ὦ ἄνθρωπε at 43753-43762. The quoted verb φατε is second person plural, put to both men at once, and the answer outside is first person plural φαῖμεν ἄν at 43465-43474, so the owner is neither of them and no one else is named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0163
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43487
  end_char: 43500
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 43a26bd3a09aedcfcf098292134c6361dd75c764f0e6ea636c9541b13a86264b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 43492
    end_char: 43499
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0164
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43502
  end_char: 43566
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7828f58d3bfea20962c3e744f6524ee2ed6c7144b84aa6bafec31218c6e76e8a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 43502
    end_char: 43586
    text_sha256: cddb67639c3e3d158a375ac959472d5c82ee3e2b765e0c438e630fdf384bab21
  rationale: Once the staged question at 43502-43549 is cut out as 0498, what remains is φαῖμεν ἄν· ἢ οὔ; — a first person plural answer closed by a check put to someone else. The narrator answers that check in the third person, καὶ τοῦτο συνέφη at 43567-43583, reporting ΠΡΩΤ. as the one who assented. A speaker is not reported assenting to his own words, so ΠΡΩΤ. is excluded and inside this two-party exchange the narrator remains.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0498
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43502
  end_char: 43549
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8cb730192f08c89f3f7bb0c0b3b8482752ecb1c9fbf59aac5f5debd857a9e2c7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The source resumes the staged questioner of 43388-43418 without a fresh formula, across the ΠΡΩΤ. assent at 43487-43500. The quoted verb φατε is second person plural, put to both men at once, and the answer outside is first person plural φαῖμεν ἄν at 43550-43559, so the owner is neither of them. He is designated only as τῷ ἐρωτῶντι at 43343-43361, which is no name and no registered role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0165
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d
char_span:
  start_char: 43586
  end_char: 43683
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4892c7bbc7f8dfb6d14b290d5f4b28fb0d97ebdc118d495715c945842504fbd9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: This span is exactly the staged question the source marks, resumed from 43388-43418 without a fresh formula. Its verb φατε is second person plural, put to both men at once, and parent 0166 answers it in the narrator’s own person — ἀγανακτήσαιμ’ ἂν ἔγωγ’, ἔφην at 43684-43712 — so neither man owns it. He is designated only as τῷ ἐρωτῶντι at 43343-43361, no name and no registered role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0166
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330d-330e
char_span:
  start_char: 43586
  end_char: 43874
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a51ce27a32be04c2117ff6ba5804126c93f84574c53672c761c6bd1f9e51f4ba
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 43708
    end_char: 43712
limits: The span opens with the staged question at 43586-43683, which 0165 records as a deeper span with no licensed owner; ἔφην at 43708 licenses this record's own voicing of it and the reaction that follows, not the words inside 0165. The preceding narrator report καὶ τοῦτο συνέφη at 43567-43583 stays outside.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0167
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330e
char_span:
  start_char: 43875
  end_char: 43893
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 43889
    end_char: 43892
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0168
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330e
char_span:
  start_char: 43898
  end_char: 44134
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a5502cc65d0ea9e8e686da6b62c3ccd6b48031b57bf8910042f65f91040533e2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 43875
    end_char: 44134
    text_sha256: 472956d3e8751a21816776e60adb85e74f792095db32356f75c5b8ee75e4e892
  rationale: Once the staged question at 43935-44134 is cut out as 0499, what remains is the frame εἰ οὖν μετὰ τοῦτο εἴποι ἐρωτῶν ἡμᾶς — a first person plural ἡμᾶς that puts the speaker inside the pair being questioned, so he is not the questioner. The ἔφη-marked ΠΡΩΤ. reply πάνυ μὲν οὖν at 43875-43893 closes immediately before it, handing the floor back, and the same construction continues at 44139 in 0169, which is fixed on the narrator. ΠΡΩΤ. is excluded on both counts.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0499
source_work: Protagoras
outer_turn_id: turn_protagoras_0042
stephanus_span: 330e
char_span:
  start_char: 43935
  end_char: 44134
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 87f7c5204e21f26e202038977b63eb2ef6cfc6cc6166b27acd346ae2a360e9d6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἰ οὖν μετὰ τοῦτο εἴποι ἐρωτῶν ἡμᾶς at 43898-43933 stages this question for the same questioner the run has carried since 43388, whom 0477 continues at 44292. Its verbs are second person plural throughout — ἐλέγετε, κατήκουσα of ὑμῶν, ἐδόξατέ μοι — addressed to both men, so neither owns it. The passage designates him only as τῷ ἐρωτῶντι at 43343-43361 and addresses him as ὦ ἄνθρωπε at 43753-43762.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0169
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 330e-331a
char_span:
  start_char: 44139
  end_char: 44457
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 93eb06836a6e782b0ff178250c710be10a24340fdacec343312dbed44d66c8b8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 44139
    end_char: 44493
    text_sha256: 3b4a5572c0f1d4143f0ee16702baee21af1497cb2310b7d954c1f1bac774ccdf
  rationale: The span says Πρωταγόρας γὰρ ὅδε ταῦτα ἀπεκρίνατο, ἐγὼ δὲ ἠρώτων — naming ΠΡΩΤ. in the third person with a deictic pointing at him, and setting him against a first-person ἐγώ as the one who was asking. That excludes ΠΡΩΤ. as its speaker, and inside the two-party exchange the anchors at 39566 and 46478 enclose, the remaining owner is the narrator. The ὦ Πρωταγόρα at 44327 sits inside the {q} and belongs to the hypothetical questioner's words, not to this utterance. Context stops at 44493, the end of the ἔφη-marked ΠΡΩΤ. reply this span provokes.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0477
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331a
char_span:
  start_char: 44306
  end_char: 44434
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d3200ebdc48ba729b56d7e0fd0fa9d6266313292a432411388fa506044aefc34
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἰ οὖν εἴποι at 44292-44305 continues the staged questioner of 330d, whom the passage designates only as τῷ ἐρωτῶντι and addresses as ὦ ἄνθρωπε. The quoted words address Protagoras in the vocative and speak of Socrates in the third person (ἀληθῆ ὅδε λέγει), so neither man present owns them, and no one else is named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0170
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331a
char_span:
  start_char: 44458
  end_char: 44493
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 727fd768302b9394dea09b2a04c0340732b81b5269790d4fe190499c41891ddc
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 44466
    end_char: 44469
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0171
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331a-331b
char_span:
  start_char: 44498
  end_char: 45140
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dda76e2f23cce7189ef33fc765e6a838a74c0d23c6617a401aa1043d982b0122
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 44498
    end_char: 45414
    text_sha256: f38e3af0374301789253277a04fb1e88f89c87de12131ca0d4701c1e54f6d14f
  rationale: The span opens τί οὖν, ὦ Πρωταγόρα, ἀποκρινούμεθα αὐτῷ — an addressee vocative naming ΠΡΩΤ. at 44506, outside any {q}. A vocative names the addressee, so ΠΡΩΤ. is not speaking it, and inside the two-party exchange the anchors at 39566 and 46478 enclose, the remaining owner is the narrator. Context stops at 45414, the end of the ἔφη-marked ΠΡΩΤ. reply.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0478
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331a-331b
char_span:
  start_char: 44581
  end_char: 44754
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bdcec3fcca0d95642fcd80c218d5b7e0f32e70fec85f612da492d7aadb746059
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: ἐὰν ἡμᾶς ἐπανέρηται at 44560-44580 keeps the same staged questioner, designated in this passage only as τῷ ἐρωτῶντι and ὦ ἄνθρωπε. The enclosing sentence sets him against a first person plural ἀποκρινούμεθα αὐτῷ covering both men present, so he is neither, and the Greek supplies him no name and no role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0172
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331b-331c
char_span:
  start_char: 45141
  end_char: 45414
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7ee80692c52fb03150dc4631a2945ce3689c8c6f57da058ee11ad8353845e878
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 45160
    end_char: 45163
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0173
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331c-331d
char_span:
  start_char: 45415
  end_char: 45668
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 13a83d37b5382acb50a67d608305d9d32e6eeb5ce40c38d367232aeaabd50e5b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 45423
    end_char: 45432
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0174
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331d-331e
char_span:
  start_char: 45669
  end_char: 46259
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b27beb2d6329798bff31dfbd6457b176a09472681731638e312fe5e195957e8e
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 45682
    end_char: 45689
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0175
source_work: Protagoras
outer_turn_id: turn_protagoras_0043
stephanus_span: 331e
char_span:
  start_char: 46260
  end_char: 46390
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: aa90fce9b8cf7f1e3bdd614e4ba16a5717e10e8ed07384279bb875f98c156ad5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ θαυμάσας εἶπον πρὸς αὐτόν
    start_char: 46260
    end_char: 46293
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0176
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 331e-332a
char_span:
  start_char: 46396
  end_char: 46467
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fcbc06f15f1b7bbba49ea9ce9472ffac525cbc6dc3ffef5f94d0474cae05ab9c
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 46412
    end_char: 46415
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: μόγις πως ἐμαυτὸν ὡσπερεὶ συναγείρας εἶπον, βλέψας πρὸς τὸν Ἱπποκράτη
    start_char: 39566
    end_char: 39635
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0178
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a
char_span:
  start_char: 46468
  end_char: 46609
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d53f1cf29b821caff97841e78079f15ca112d76a914da02c2d40eb4d737be421
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην ἐγώ
    start_char: 46478
    end_char: 46486
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0179
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a
char_span:
  start_char: 46615
  end_char: 46665
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 69c520bbaa3787b7732f972f112a20fd2fb44efe9796cdbf904117e255bcae0d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0180
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a
char_span:
  start_char: 46666
  end_char: 46684
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 34cd7bfa5ce3046993afdf91377c4174e94943a9fdf6bcbe07f805154c91c09d
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 46680
    end_char: 46683
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0181
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a
char_span:
  start_char: 46685
  end_char: 46840
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9353d90ace3535eaf02d3251b34c1001e25ff8a1988465dec346a84afe8a4b48
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0182
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a
char_span:
  start_char: 46841
  end_char: 46856
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 71625bd0337cd8cd5835bada5e792186f065d99b3e4411f56b523acb31cb2c67
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 46852
    end_char: 46855
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0183
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332a-332b
char_span:
  start_char: 46857
  end_char: 46893
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b621f336ffcbfc26bc1275d14f811ac7a3c07faea3b1be62cf469795d79ba8f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0184
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 46894
  end_char: 46901
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0185
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 46902
  end_char: 46986
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ef9d218acc310b2b4535183f094110e322446f5b0232f38a7fcd372ea1b97a4e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0186
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 46987
  end_char: 47005
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 65b051009878ab5ae6ca2c0743a459188a7435b9afc993bb794b6ae9a8970e44
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 47001
    end_char: 47004
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0187
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 47006
  end_char: 47059
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8f92bcbfa15f2cd1df26ae3042975ce46fd61743d2fccdc18391d53444186e1e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0188
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 47065
  end_char: 47143
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8f537d6e5ebdcad1faf1d6a3a9fb629463e6b886aa79d5c4834fb3c5213fa1d2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0189
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b
char_span:
  start_char: 47154
  end_char: 47231
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 26a8e177e6de9a7ac7d8f21b1c41e00abbf5e2fe4b1247dde52955568ad07d6e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0190
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332b-332c
char_span:
  start_char: 47240
  end_char: 47313
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 78e42a3038b2d303697ce6b616626272e52eeb0332b4960bb0c3cc0ac46bc397
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0191
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47319
  end_char: 47413
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 30cc7ecb0a23c67d995ce26f47eb0c12aa539d3113827d86fa3dcc4bfde418f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0192
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47422
  end_char: 47457
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6ef2b4739aa473e58892f6befe6302aba20cdd1ad201b2c2c1107ce3f9fec18c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47431
    end_char: 47440
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0193
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47469
  end_char: 47509
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e4d22af091ed2808376432c00fbe93afc3a86764c0db01c3d29ca8ceb3d6feab
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0194
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47510
  end_char: 47520
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a77863200311af3bc9da5d1854fb8e3b83328c8c38cedf491cdc389e2ff2143f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0195
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47521
  end_char: 47544
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d5086695a023c24123ce5efc0cd8f30179ca05d305530dc2c548077c0b6f5815
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0196
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47545
  end_char: 47551
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c4bd1fa8c201b5419ada7abbd742dc376106ed17056f2b341968b715b9b0d120
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0197
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47552
  end_char: 47590
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a8f54ab945c2fe2aee2f95dde59437c75078a8f88a8fd64f4f2a39e7f36ef31b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0198
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47591
  end_char: 47601
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a77863200311af3bc9da5d1854fb8e3b83328c8c38cedf491cdc389e2ff2143f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0199
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47602
  end_char: 47630
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fe014ffe9088c87a2e273d86e1f97c079938b3ba96e676260795616cbde74751
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0200
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47636
  end_char: 47681
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a740a72cddb3f9b096fd0f688dde379c1100a35296491862e20e9a02f4a3df3b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0201
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332c
char_span:
  start_char: 47691
  end_char: 47771
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 61a2ad3c850951e9e66f4bdb994dc7eba5f78e2c770eee05df12ab21c25ed918
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47699
    end_char: 47708
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0203
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332d
char_span:
  start_char: 47796
  end_char: 47904
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 422106b726cca1682fef96509cd42aa684be3a19121e02001e81869203a549d7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47804
    end_char: 47813
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0204
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332d
char_span:
  start_char: 47905
  end_char: 47918
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 27a9feacbf1375a97f161c4c2e8f5f70e8583c3bccc91868447c8af80752f598
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0205
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332d
char_span:
  start_char: 47919
  end_char: 47970
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 10b60980dc9c254ca7e97c9da92940f219f325da249aeaf47e90e37a59b845d1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0206
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332d
char_span:
  start_char: 47976
  end_char: 48058
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 44f05de71c6cef56dd2e1abca0d5911312e05249fd97c2b7cc70461fa81688ed
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0207
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332d
char_span:
  start_char: 48064
  end_char: 48146
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c08e9ee9b8958f081e8d41d417ef2c7caf1033aeaec0c73b6a47142ce8c3672e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0208
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48166
  end_char: 48225
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 58a5397ee194649101c1018606378595baaf434032e681928a0f4025de349c8f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0209
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48226
  end_char: 48230
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0210
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48231
  end_char: 48287
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 35baf1fdd42ee2cd00a9ecd5d035cdd0b4df79a2e8c78c75dccae7990f61b42d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0211
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48288
  end_char: 48292
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0212
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48293
  end_char: 48302
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4aded39e7ff8c3bdb1938d4e4516c6714a462488b464bbf87e4419980cc28182
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0213
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48303
  end_char: 48311
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0214
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48312
  end_char: 48338
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6f8e32b9bccf534b3781286b2c78164af9557d6d296fdabf75e4538a0cc58b5e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0215
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48339
  end_char: 48343
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0216
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48344
  end_char: 48383
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c1d77a558011d959c22d6bc858e20abf605e03cc513ed1fc25913e29f4f0fdc0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0217
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48384
  end_char: 48393
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0218
source_work: Protagoras
outer_turn_id: turn_protagoras_0044
stephanus_span: 332e
char_span:
  start_char: 48394
  end_char: 48475
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6c1e70228544b837cfd218606c054c760aa70e9df63567f64e00e534717004bf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0220
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 332e-333a
char_span:
  start_char: 48494
  end_char: 48532
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 567d9057436c4dcc673ddb12168a377f710c6c17848524702c07ed3a75936b6f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0221
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333a
char_span:
  start_char: 48533
  end_char: 48538
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ed62d9e65e01b2b51a7a578d1e48d26bffcd48f38f3e979054fe093883989dcd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0222
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333a-333b
char_span:
  start_char: 48539
  end_char: 49081
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8e6e8cb7349a95c69b0a63bb4c9266b18486183df22260c1b01501363d172dde
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 48539
    end_char: 49124
    text_sha256: ccc50775dd7c37aff205fa96f7d32e62de1dd5abba7c329f9a76c22d54978213
  rationale: The span opens πότερον οὖν, ὦ Πρωταγόρα — an addressee vocative naming ΠΡΩΤ. at 48552, outside any {q}. A vocative names the addressee, so ΠΡΩΤ. is not speaking it, and inside the two-party exchange the anchors at 46478 and 52508 enclose, the remaining owner is the narrator. Context runs to 49124, the end of the ἔφην ἐγώ record that closes the same question, and stops there because the narration at 49124 records ΠΡΩΤ.'s assent rather than an utterance.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0223
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333b
char_span:
  start_char: 49082
  end_char: 49124
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 36eaf68f40539050da81a97569d81e8fc8c540498439d93a70d4a6618e29383a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 49102
    end_char: 49110
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0224
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333b
char_span:
  start_char: 49154
  end_char: 49272
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6a007d30f35c7cb4e76958276e0d4e8396572195cefaa04afe425560951b110b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0225
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333b-333c
char_span:
  start_char: 49277
  end_char: 49418
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1ec46a306540bd79f5a02ac486ce6b13438b6f8ec5121cf769af12aaf624fbd3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 49285
    end_char: 49294
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0226
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333c
char_span:
  start_char: 49419
  end_char: 49509
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 99f1e1301ed2b3449b8e282201e07a141c158898a68c2c6be25bba12f1fc1808
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 49441
    end_char: 49444
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0227
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333c
char_span:
  start_char: 49510
  end_char: 49573
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 159dc578f4fdb5ee9a48d5fda0953ca32471065e40c82a0f09fda4f51779bb3d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 49557
    end_char: 49561
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0228
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333c
char_span:
  start_char: 49574
  end_char: 49645
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f55c1189bc8f82713fc3fabac1f6426db527cd4bf7dc916b89d63ab61838ac54
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 49585
    end_char: 49588
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0229
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333c-333d
char_span:
  start_char: 49646
  end_char: 49852
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0ebcbfd1adc0b2e15d357416f46c54f28abff2b1386b6ff99fbc77d86481a960
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 49574
    end_char: 49981
    text_sha256: f8f3fae1be3b928f39ee860cf585fa391a77013828eebb342bda2201a36ec13f
  rationale: The span says καὶ ἐμὲ τὸν ἐρωτῶντα at 49794 — a first-person pronoun in apposition to the role of questioner, so its speaker is the one asking. The narration immediately after it, at 49853, names ὁ Πρωταγόρας as the one who ἔπειτα μέντοι συνεχώρησεν ἀποκρίνεσθαι, the answerer. ΠΡΩΤ. is therefore excluded, and inside the two-party exchange the anchors at 46478 and 52508 enclose the remaining owner is the narrator. Context stops at the ἔφη-marked ΠΡΩΤ. turn before it.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0230
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 49981
  end_char: 50062
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2275c1949c0e35c38c39cbf54ce4623038bd7c281c370341523abca3a920c9a2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 49989
    end_char: 49997
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0231
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50063
  end_char: 50073
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a4829cd61c37a58138bdfa7b89ad91d5ce02d48e8a44edfed792d35976bfd7de
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 50069
    end_char: 50072
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0232
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50074
  end_char: 50108
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 82361cd23d8ae02041d2e8410da3031141b28be5fadf82dcbfa06f054506104d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0233
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50114
  end_char: 50161
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: baed19e55baa2bbd1ffdfd2ebcdb45323ab0cbd541155fae48f2065186b29341
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0234
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50162
  end_char: 50172
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a4829cd61c37a58138bdfa7b89ad91d5ce02d48e8a44edfed792d35976bfd7de
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 50168
    end_char: 50171
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0235
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50173
  end_char: 50232
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6029e2a0afb52b707df9f8e85e31134104c1ccfbb2a9b62dc91c2c94c222156e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50182
    end_char: 50191
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0236
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50233
  end_char: 50239
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6bf4b34779a5d9571b479b527d072b6f45a1a6715b39dacafc3b6e62312fe865
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0237
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50240
  end_char: 50268
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 604a3971fb2302b42072ad3ae520a3d0b72d174b994ff8f4cd45e8715dcb88f0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0238
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50269
  end_char: 50274
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3c870250fe571f423864796436ad6ce1732745dda9fc90e33eaf083f3ec24228
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0239
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333d
char_span:
  start_char: 50275
  end_char: 50344
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2e60d0045e89f9391e382f0258499ca9c85592392e1450ed1f77a73276edda4f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50284
    end_char: 50293
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0240
source_work: Protagoras
outer_turn_id: turn_protagoras_0045
stephanus_span: 333e
char_span:
  start_char: 50353
  end_char: 50424
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 21c6566c53de3f4db58b633e0ff016e7538a8c1a08c48f74e5f8732d547fe83f
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 50369
    end_char: 50372
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0242
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 333e-334a
char_span:
  start_char: 50591
  end_char: 50732
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5630030823d3aa2891b99804d719408d41e1b7cea4aa9f3612260037a380aa82
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50600
    end_char: 50609
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0243
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334a-334c
char_span:
  start_char: 50733
  end_char: 51802
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 25d10aff90af918a83049855f1f6ebb5b560c67ee71397dea28aaf40133432d6
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 50742
    end_char: 50745
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0244
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334c-334d
char_span:
  start_char: 51807
  end_char: 52241
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5f1ce91e50b96312cd62ffca1cc461f9d1ff039439731a044cc9205152a68f30
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 51870
    end_char: 51883
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0468
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334d
char_span:
  start_char: 52246
  end_char: 52286
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6c7e049120c49cb32f6a9976f7a794589e7cdb6ea6817bdb92c497c4acb5dcff
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: An utterance the candidate left uncovered between 0244 and 0245. It is bounded direct speech — a question with first-person με and second-person κελεύεις — but carries no reporting verb, and it sits inside the two-party exchange the anchors at 46478 and 52508 enclose, whose only marked speakers are the narrator and ΠΡΩΤ. Nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0245
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334d
char_span:
  start_char: 52287
  end_char: 52327
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c722095cdc5fb2a7d6ca042995896ca54de07827de464cc002a47d3a2c55de7c
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 52304
    end_char: 52307
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0246
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334d
char_span:
  start_char: 52332
  end_char: 52351
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cff6be284fa111efbefbc142a1b75c052325b8ece0d03ed1137140fc6ae64d9e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 52341
    end_char: 52350
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0247
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334d-334e
char_span:
  start_char: 52356
  end_char: 52381
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6b03d1419cab04f371c60646c89f64e67799a1cd6ce31b4e1e2013359ab247dd
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 52370
    end_char: 52373
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἔφην ἐγώ, ἐπειδὴ
    start_char: 46478
    end_char: 46494
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0248
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334e
char_span:
  start_char: 52386
  end_char: 52401
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f318dbfeb3c0d92473ffacb807c2dd7108eb637b0034a74b0a0468427fe18486
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 52391
    end_char: 52400
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0249
source_work: Protagoras
outer_turn_id: turn_protagoras_0046
stephanus_span: 334e
char_span:
  start_char: 52406
  end_char: 52486
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 122bc005f5e8774c6e597819fc538b79d0d13e14da882ae2551b06dade29068d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 46494 and 52508, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0250
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 334e-335a
char_span:
  start_char: 52495
  end_char: 52791
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6d8b019875d286136ef9f40feb74a64c28c3f8358a2214bdf5bdfb1b43c7ba9c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 52508
    end_char: 52517
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0252
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 335a
char_span:
  start_char: 52796
  end_char: 53036
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 47cdb3d9e78754e3d1f399c9a22920b574873747dbea197ba558143866eea1bd
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 52808
    end_char: 52811
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, ὅτι
    start_char: 52508
    end_char: 52522
  - kind: named_reporting_formula
    role: exchange_close
    text: ἐπιλαμβάνεται ὁ Καλλίας τῆς χειρὸς τῇ δεξιᾷ, {335d} τῇ δ’ ἀριστερᾷ ἀντελάβετο τοῦ τρίβωνος τουτουΐ, καὶ εἶπεν
    start_char: 53965
    end_char: 54074
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0253
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 335a-335c
char_span:
  start_char: 53041
  end_char: 53900
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 97fc8eb6b3e7a0784ac31153b0ed907245d9a77c9409bf643ac044df0bb0f86b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 53257
    end_char: 53261
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0255
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 335d
char_span:
  start_char: 54017
  end_char: 54292
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: af5e7510d8d530be9805c773b1cfbfbe379c8d347dbd24f64c4cc3c7f7991720
voice_chain:
  - ΣΩ.
  - ΚΑΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἐπιλαμβάνεται ὁ Καλλίας τῆς χειρὸς τῇ δεξιᾷ, {335d} τῇ δ’ ἀριστερᾷ ἀντελάβετο τοῦ τρίβωνος τουτουΐ, καὶ εἶπεν
    start_char: 53965
    end_char: 54074
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0256
source_work: Protagoras
outer_turn_id: turn_protagoras_0047
stephanus_span: 335d-335e
char_span:
  start_char: 54297
  end_char: 54486
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fc6e9a80f1f7abf2d942dc8c415733f5a8b4761c6b0d6b6265223348bab3ec26
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 54297
    end_char: 54310
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0257
source_work: Protagoras
outer_turn_id: turn_protagoras_0048
stephanus_span: 335e-336b
char_span:
  start_char: 54491
  end_char: 55182
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: aea3e97bcc08abda0d7d8ed028a85e2c02b98248d87fdc8530417d21e2691d15
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΙΠ.
    - ΚΑΛ.
    - ΚΡΙ.
    - ΠΡΟΔ.
    - ΣΩ.
  context_span:
    start_char: 54487
    end_char: 55214
    text_sha256: c4ba5c41c779c0aa284793e5585b1375d4b1bb18f2cb4d4451a0b614af020d2e
  rationale: The utterance opened at 54293 by "{p} καὶ ἐγὼ εἶπον—ἤδη δὲ ἀνειστήκη ὡς ἐξιών" runs unbroken to 55183, where "{p} ἀλλ’—ὁρᾷς; —ἔφη, ὦ Σώκρατες" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0258
source_work: Protagoras
outer_turn_id: turn_protagoras_0048
stephanus_span: 336b
char_span:
  start_char: 55187
  end_char: 55323
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d11fcf2d89c92ce5bc36c709b6e60562987c71b75e98b80f11d83dad76228539
voice_chain:
  - ΣΩ.
  - ΚΑΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΙΠ.
    - ΚΑΛ.
    - ΚΡΙ.
    - ΠΡΟΔ.
  context_span:
    start_char: 55187
    end_char: 55420
    text_sha256: 9f0d6e8e6e7dd60a9f115a32270a01e85e263ccc4fa742700707a687ca21aa4c
  rationale: The ἔφη at 55199 is third person, and the vocative ὦ Σώκρατες at 55206 names the addressee, so the narrator is excluded twice over. The next utterance is introduced by the naming formula ὑπολαβὼν οὖν ὁ Ἀλκιβιάδης at 55326, which excludes ΑΛΚ. as this span's speaker and marks what follows as the immediate rejoinder to it; that rejoinder opens οὐ καλῶς λέγεις, ἔφη, ὦ Καλλία — a present second-person rebuke whose vocative names the person being answered. ΙΠ., ΚΡΙ. and ΠΡΟΔ. are each first staged as speakers only later, at 56178, 56484 and 57627.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0259
source_work: Protagoras
outer_turn_id: turn_protagoras_0048
stephanus_span: 336b-336d
char_span:
  start_char: 55355
  end_char: 56118
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 59bcdf1d160c308d02b442f30d315163723924c09f0e85b379e643045dd52dc2
voice_chain:
  - ΣΩ.
  - ΑΛΚ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὑπολαβὼν οὖν ὁ Ἀλκιβιάδης, οὐ καλῶς λέγεις, ἔφη
    start_char: 55328
    end_char: 55375
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0260
source_work: Protagoras
outer_turn_id: turn_protagoras_0048
stephanus_span: 336d-336e
char_span:
  start_char: 56178
  end_char: 56431
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a57414e4f36af9870d29781a3ce06b9fad0159581bc71f5ac9a38e4022e3cbb0
voice_chain:
  - ΣΩ.
  - ΚΡΙ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: Κριτίας ἦν ὁ εἰπών
    start_char: 56158
    end_char: 56176
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0261
source_work: Protagoras
outer_turn_id: turn_protagoras_0049
stephanus_span: 337a-337c
char_span:
  start_char: 56484
  end_char: 57510
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 36d475e47f15819ced52cea1b61c954732e37a3ad895c3b064122fe2d0062a58
voice_chain:
  - ΣΩ.
  - ΠΡΟΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Πρόδικος, καλῶς μοι, ἔφη, δοκεῖς λέγειν
    start_char: 56472
    end_char: 56513
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0262
source_work: Protagoras
outer_turn_id: turn_protagoras_0049
stephanus_span: 337c-337e
char_span:
  start_char: 57627
  end_char: 58216
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b7c69e165dde5631ccb0c43b8309621be1f79173cc1c1ec5743b6befa5073db0
voice_chain:
  - ΣΩ.
  - ΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: Ἱππίας ὁ σοφὸς εἶπεν, ὦ ἄνδρες, ἔφη
    start_char: 57605
    end_char: 57640
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0263
source_work: Protagoras
outer_turn_id: turn_protagoras_0050
stephanus_span: 337e-338b
char_span:
  start_char: 58221
  end_char: 58843
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 25d5b530c9807da821909300c0e2c5057fbfdb5c266544f247c0cbc30acf01f1
voice_chain:
  - ΣΩ.
  - ΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: Ἱππίας ὁ σοφὸς εἶπεν, ὦ ἄνδρες, ἔφη
    start_char: 57605
    end_char: 57640
  - kind: formula_bounded_continuation
    text: "{p} ταῦτα ἤρεσε τοῖς παροῦσι"
    start_char: 58844
    end_char: 58872
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0264
source_work: Protagoras
outer_turn_id: turn_protagoras_0050
stephanus_span: 338b-338e
char_span:
  start_char: 58963
  end_char: 60125
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1ffe6e6e7b809432d3c47d6fd13af10226f8b4d34f7cc91d9affcda522f49231
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον οὖν ἐγὼ
    start_char: 58963
    end_char: 58976
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0266
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 338e-339b
char_span:
  start_char: 60318
  end_char: 60970
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 261b9f2c14d40411523b754a763ae7195c2815f2b1a3c813d7b0d1476e02e5cb
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 60327
    end_char: 60330
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας πάνυ μὲν οὐκ ἤθελεν, ὅμως δὲ ἠναγκάσθη ὁμολογῆσαι ἐρωτήσειν
    start_char: 60126
    end_char: 60202
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: τρέπομαι πρὸς τὸν πρόδικον, καὶ καλέσας αὐτόν, ὦ Πρόδικε, ἔφην ἐγώ
    start_char: 62536
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0267
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b
char_span:
  start_char: 60975
  end_char: 61066
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bb885fe5082e9691f67e790465b4b5e50947c8e6977ac8b03dbd831b7bc6f021
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 60975
    end_char: 60988
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0268
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b
char_span:
  start_char: 61071
  end_char: 61143
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 02f52b7f011871a83f4b9f7176dfa6edb89b1391501c6a9078d5ee52e4a5cb5d
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 61075
    end_char: 61078
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας πάνυ μὲν οὐκ ἤθελεν, ὅμως δὲ ἠναγκάσθη ὁμολογῆσαι ἐρωτήσειν
    start_char: 60126
    end_char: 60202
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: τρέπομαι πρὸς τὸν πρόδικον, καὶ καλέσας αὐτόν, ὦ Πρόδικε, ἔφην ἐγώ
    start_char: 62536
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0269
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b
char_span:
  start_char: 61144
  end_char: 61192
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fb0a29b66ce094082086e8dd80b21e035c09428fa72898d7d0312563ef049c4e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 61150
    end_char: 61158
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0270
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b
char_span:
  start_char: 61193
  end_char: 61262
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 45cbcf77f1e4843669718325b5304ceb82b524fae48fb10ad5e69559b0e4fef3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 60202 and 62536, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0271
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b
char_span:
  start_char: 61263
  end_char: 61283
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 79f7691715d082a32c297157d36b6e4ef6e84f8ec3482ae203ce3578165d440f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 61273
    end_char: 61282
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0272
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339b-339c
char_span:
  start_char: 61284
  end_char: 61312
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: aaf5bdf03325b6555db3c82bab6320987fae36ea27153baf1a39159e181bb4bd
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 61292
    end_char: 61295
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας πάνυ μὲν οὐκ ἤθελεν, ὅμως δὲ ἠναγκάσθη ὁμολογῆσαι ἐρωτήσειν
    start_char: 60126
    end_char: 60202
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: τρέπομαι πρὸς τὸν πρόδικον, καὶ καλέσας αὐτόν, ὦ Πρόδικε, ἔφην ἐγώ
    start_char: 62536
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0273
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c
char_span:
  start_char: 61313
  end_char: 61342
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 036dcf3afc7e459ab0b28b97b021be277159c1ab584ec4d6937a2d960ca0c3eb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 60202 and 62536, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0274
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c
char_span:
  start_char: 61343
  end_char: 61578
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 663296f03df50755eeeb2d52570ac62aff972d2f92df860673814b87698a3a29
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 61354
    end_char: 61357
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας πάνυ μὲν οὐκ ἤθελεν, ὅμως δὲ ἠναγκάσθη ὁμολογῆσαι ἐρωτήσειν
    start_char: 60126
    end_char: 60202
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: τρέπομαι πρὸς τὸν πρόδικον, καὶ καλέσας αὐτόν, ὦ Πρόδικε, ἔφην ἐγώ
    start_char: 62536
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0275
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c
char_span:
  start_char: 61579
  end_char: 61595
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a8ce606f37283f0ab6570109418be30234ece283eb06a1fb8a756e70b021313b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 61585
    end_char: 61594
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0276
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c
char_span:
  start_char: 61596
  end_char: 61644
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3a813b9f461dc49a525f64a612cb126b34f172db200e475d2ce084d1c860a4aa
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 61611
    end_char: 61614
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας πάνυ μὲν οὐκ ἤθελεν, ὅμως δὲ ἠναγκάσθη ὁμολογῆσαι ἐρωτήσειν
    start_char: 60126
    end_char: 60202
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: τρέπομαι πρὸς τὸν πρόδικον, καὶ καλέσας αὐτόν, ὦ Πρόδικε, ἔφην ἐγώ
    start_char: 62536
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0277
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c
char_span:
  start_char: 61645
  end_char: 61732
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c3d6c99108288a7936a7b2d58ec910778fef6653bfcdc9673e89377c84301a2b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 61706
    end_char: 61714
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0278
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339c-339d
char_span:
  start_char: 61733
  end_char: 62227
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 470d6a7a7c131909b4f5e296566e39ca6b856115c25d483862d7a9b9739aeaab
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 60202 and 62536, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0280
source_work: Protagoras
outer_turn_id: turn_protagoras_0051
stephanus_span: 339e-340a
char_span:
  start_char: 62536
  end_char: 62669
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dd83bed1d08aeb8e99fbbb62267955eec71c24658eee60376776ba6bf5fa3ef9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην ἐγώ
    start_char: 62594
    end_char: 62602
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0282
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340a-340b
char_span:
  start_char: 62674
  end_char: 63312
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 23f039189ca86d94036ad3197a160e83859ec1bb2508a7f5e66dd199c371ec0e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΟΔ.
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 62670
    end_char: 63340
    text_sha256: 9aed612c942755b27f87eb2916ae32fcda645483b0e76dd8f79d5128fc4b3a88
  rationale: The utterance opened at 62583 by "ὦ Πρόδικε, ἔφην ἐγώ" runs unbroken to 63313, where "ἄλλο νὴ Δί’, ἔφη ὁ Πρόδικος" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0283
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340b
char_span:
  start_char: 63313
  end_char: 63324
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 82c64fa23b465889cacf5b736df827e80d307de00d357b4405fdb592e076a6cf
voice_chain:
  - ΣΩ.
  - ΠΡΟΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Πρόδικος
    start_char: 63326
    end_char: 63340
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0284
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340b-340c
char_span:
  start_char: 63342
  end_char: 63480
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5c9222be2c0bde20f2bfe9dcf619ac6d5606f87f7631f3e0aaa516ac19b6d34f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 63350
    end_char: 63358
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0285
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340c
char_span:
  start_char: 63481
  end_char: 63493
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 49da58991f235b66a466ae28de7dff4e73e2c916416ebb13bf0685bdbc21f64a
voice_chain:
  - ΣΩ.
  - ΠΡΟΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Πρόδικος
    start_char: 63495
    end_char: 63509
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0286
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340c-340d
char_span:
  start_char: 63511
  end_char: 64168
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 484f1bec37d220788419e46ee0b26dd34a8701ec61cbaec711c13df17e5aafcb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 63531
    end_char: 63540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0287
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340d
char_span:
  start_char: 64236
  end_char: 64308
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 02c26ae73ad6c08ef350de8f98124df50924423ab2555b22bc699b342d889d23
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ δὲ Πρωταγόρας, τὸ ἐπανόρθωμά σοι, ἔφη
    start_char: 64219
    end_char: 64258
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0288
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340d-340e
char_span:
  start_char: 64313
  end_char: 64443
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9ca68026fc8977b5834c8820f1008ba9563bf17b95f89d072ce61494374569b5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 64313
    end_char: 64326
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0289
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340e
char_span:
  start_char: 64448
  end_char: 64469
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 184f2ea7b5d5df9a355883c6679b7270901b4464b135275f32c66fadaa71f065
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΟΔ.
  - ΠΡΩΤ.
unresolved_reason: The reporting act «ἔφη» at 64465 transmits an utterance here. Each owner listed is staged as a speaker by a naming or person-marked formula the source prints inside this stretch, and no formula or grammatical person in this span discriminates among them.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0290
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340e
char_span:
  start_char: 64474
  end_char: 64492
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 01e1d842771de17f8aa6e901bfce915c6b974763632fcf61657ccb8d05787643
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 64482
    end_char: 64491
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0291
source_work: Protagoras
outer_turn_id: turn_protagoras_0052
stephanus_span: 340e
char_span:
  start_char: 64497
  end_char: 64641
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 36578bb3ad4685207295c1e3fde4dfc81c4965344910cc02f7b3b1d1507888d4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΟΔ.
  - ΠΡΩΤ.
unresolved_reason: The reporting act «ἔφη» at 64507 transmits an utterance here. Each owner listed is staged as a speaker by a naming or person-marked formula the source prints inside this stretch, and no formula or grammatical person in this span discriminates among them.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0292
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 340e-341c
char_span:
  start_char: 64650
  end_char: 65818
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b33caa421bee1ed583e12ebf05eed71604c7ac0676dc675c46fcb5485d155778
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 64650
    end_char: 64663
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0293
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341c
char_span:
  start_char: 65823
  end_char: 65834
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f6ddbc49b83b4596ddef16d7780d5b3a809c8ca20a0fd33c926dfe0e32240a4a
voice_chain:
  - ΣΩ.
  - ΠΡΟΔ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΟΔ.
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 65692
    end_char: 65834
    text_sha256: ad638c135d3d550fcc9cfe64d478fec50065051eea829d6fba965275d28a58d7
  rationale: "WRONG OWNER CORRECTED: the record read [ΣΩ., ΣΩ.] over an ἔφη. The ἔφη at 65830 is third person, so the narrator is not speaking. The span answers the question the narrator has just put, ἐρώμεθα οὖν πρόδικον ... τί ἔλεγεν, ὦ Πρόδικε, τὸ χαλεπὸν Σιμωνίδης;, which names ΠΡΟΔ. twice — once as the man to be asked and once in the vocative at 65770 — and answers it with the single word κακόν that the question asks for. Context stops at the question's own opening."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0294
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341c
char_span:
  start_char: 65839
  end_char: 66035
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: feda007f92b811bde87a1d6486fa705fce61c061510ccad10ed5d210fc6bf742
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 65867
    end_char: 65876
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0295
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341c
char_span:
  start_char: 66040
  end_char: 66219
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 52e547f9eb1f84b0ffce90b3fc47538c1a76f6ade409d9bebf0fa0c47454c2d5
voice_chain:
  - ΣΩ.
  - ΠΡΟΔ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΟΔ.
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 66040
    end_char: 66290
    text_sha256: 75dff06f20fd4db69ce1e0c83559419a4b87274936fff7a8a89448d4b0993b03
  rationale: "WRONG OWNER CORRECTED: the record read [ΣΩ., ΣΩ.] over an ἔφη addressed to Socrates. The ἔφη at 66054 is third person and the vocative ὦ Σώκρατες at 66067 names the addressee, so the narrator is excluded twice. The narrator's next utterance, ἀκούεις δή, ἔφην ἐγώ, ὦ Πρωταγόρα, Προδίκου τοῦδε at 66259, tells ΠΡΩΤ. that what he has just heard is ΠΡΟΔ.'s, and asks him to answer ταῦτα. Context stops there."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0296
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341c-341d
char_span:
  start_char: 66224
  end_char: 66309
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 94aa59b257e3f4ca96e5426218d2d96d31d64c3b3e1fce7934e45e77c246fbe8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 66236
    end_char: 66244
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0297
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341d
char_span:
  start_char: 66332
  end_char: 66529
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a232e06d363d5e039da68d2138c219e8c692d35e91fd34ad31784ab02bf44a71
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Πρωταγόρας, πολλοῦ γε δεῖ, ἔφη
    start_char: 66314
    end_char: 66350
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0298
source_work: Protagoras
outer_turn_id: turn_protagoras_0053
stephanus_span: 341d-341e
char_span:
  start_char: 66534
  end_char: 67086
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1e81baebeead4379a1548d9f25f79179981a9103c4765d5b8bf8d379670c632c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 66554
    end_char: 66558
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0299
source_work: Protagoras
outer_turn_id: turn_protagoras_0054
stephanus_span: 341e-342a
char_span:
  start_char: 67091
  end_char: 67271
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 90dc58f9fa162f55fd8c696233ba60d09496f397aeb024fdc50686505700103c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΟΔ.
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 67087
    end_char: 67342
    text_sha256: 9f0ef1f75d4bf794e229c5d601d9bd25b2e96985ad5ee48be8fab53cb83531fe
  rationale: "The narration that closes this span attributes it to the narrator outright: ὁ μὲν οὖν Πρωταγόρας ἀκούσας μου ταῦτα λέγοντος at 67276 says that Protagoras heard ME saying THESE THINGS — ταῦτα is this span and μου is the narrator. The record before it, ending 67086, is the narrator's own ἔφην-marked speech, and the siglum reprinted at 67087 is the edition's page division, not a handoff. Context runs from that division to the naming formula and no further."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0300
source_work: Protagoras
outer_turn_id: turn_protagoras_0054
stephanus_span: 342a
char_span:
  start_char: 67325
  end_char: 67355
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e44f581b1053db731f32ecdd1f13d66c78e4314b7a758770e892c6159513bd60
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ μὲν οὖν Πρωταγόρας ἀκούσας μου ταῦτα λέγοντος, εἰ σὺ βούλει, ἔφη
    start_char: 67276
    end_char: 67342
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0301
source_work: Protagoras
outer_turn_id: turn_protagoras_0054
stephanus_span: 342a-342e
char_span:
  start_char: 67421
  end_char: 69084
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bfd5a0ed0d642041d8b01b1f396be246f66ffe81560d9371460f034348235b05
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 67433
    end_char: 67442
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0302
source_work: Protagoras
outer_turn_id: turn_protagoras_0055
stephanus_span: 342e-343c
char_span:
  start_char: 69089
  end_char: 70414
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6d70cbe4dd801d7f5b4390511e7a1e2e679bbff9ffb87872de0cbaac05a7c807
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 69085
    end_char: 71121
    text_sha256: fbc154cd6242f7c7f5e37f72b4bc47e15768e1278ce974919beb8573652a6571
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0303
source_work: Protagoras
outer_turn_id: turn_protagoras_0055
stephanus_span: 343c-343e
char_span:
  start_char: 70419
  end_char: 71119
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c33817288051e7cfa736fcc71cb807cb46410cfdf1ddf7346188879cdee5c9c5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 69085
    end_char: 71121
    text_sha256: fbc154cd6242f7c7f5e37f72b4bc47e15768e1278ce974919beb8573652a6571
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0304
source_work: Protagoras
outer_turn_id: turn_protagoras_0056
stephanus_span: 343e-344b
char_span:
  start_char: 71125
  end_char: 72030
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6100ec5e20d28a26fdb53a391ef1aca30d9ac3aa0bff6d2da5b52e2eeb5e77d2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 71121
    end_char: 73474
    text_sha256: 3d7b8100f8ed10ef2fb15c4937d312603fe2f2812a4860ceb38637708b531b77
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0305
source_work: Protagoras
outer_turn_id: turn_protagoras_0056
stephanus_span: 344b-344e
char_span:
  start_char: 72035
  end_char: 73473
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0aacad5eed570f9ac544b8f9c1a2a42886a650b6dc7f9ec8473b9b0db98eb589
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 71121
    end_char: 73474
    text_sha256: 3d7b8100f8ed10ef2fb15c4937d312603fe2f2812a4860ceb38637708b531b77
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0306
source_work: Protagoras
outer_turn_id: turn_protagoras_0057
stephanus_span: 345a-345e
char_span:
  start_char: 73485
  end_char: 75622
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 54e28d81b37b04bc126b0ebb84860abaed3be24adf68c64abf0f3395e051c869
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 73474
    end_char: 75623
    text_sha256: 86deb7d5e1bdd4cc44c11c2070a2d592de46cb0f4b2cfef1ef223c3f1dee4eff
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0307
source_work: Protagoras
outer_turn_id: turn_protagoras_0058
stephanus_span: 345e-346e
char_span:
  start_char: 75627
  end_char: 77605
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 354d8059495fba7da1cf85debc4d86424ce71aab9a544f183c8a2736390b2b5a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 75623
    end_char: 77606
    text_sha256: 1dc0c740accd7dbb49667998e3c2e931dca6d6482242a1581a150d1aceb675f2
  rationale: The utterance opened at 67421 by "ἐγὼ τοίνυν, ἦν δ’ ἐγώ, ἅ γέ μοι δοκεῖ περὶ τοῦ ᾄσματος τούτου, πειράσομαι ὑμῖν διεξελθεῖν." runs unbroken to 77897, where "καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0308
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 346e-347a
char_span:
  start_char: 77610
  end_char: 77789
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9d28433a5fe47cb54661057f0abdbac8370de339b10bdea29ddeb53334838cc5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 77606
    end_char: 77933
    text_sha256: 75f058f25c3c71b81b15dfc189d7c48e63bde00cb4fc5ede81f1df1af6150f8a
  rationale: "The exegesis opened at 67421 by ἐγὼ τοίνυν, ἦν δ’ ἐγώ runs unbroken to 77897, where καὶ ὁ Ἱππίας ... ἔφη marks a new speaker; the siglum reprinted at 77606 is the edition's page division, not a handoff. The second person and ὦ Πιττακέ inside the span are the poet being expounded, not an interlocutor: the sentence closing the exegesis at 77790, ταῦτά μοι δοκεῖ, ὦ Πρόδικε καὶ Πρωταγόρα, ἦν δ’ ἐγώ, Σιμωνίδης διανοούμενος πεποιηκέναι τοῦτο τὸ ᾆσμα, marks all of it as the narrator's reading, and its vocatives name the men present."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0309
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 347a
char_span:
  start_char: 77790
  end_char: 77892
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6b0a5a0657c446ed3965f77d92c58ab6be4941dbcf1200e1e265f2966d3af786
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 77832
    end_char: 77841
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0310
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 347a-347b
char_span:
  start_char: 77911
  end_char: 78076
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c1c821fa602dc3b6c24591976b5529a41c63e698242b1794115b8aeb33e251bc
voice_chain:
  - ΣΩ.
  - ΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: καὶ ὁ Ἱππίας, εὖ μέν μοι δοκεῖς, ἔφη
    start_char: 77897
    end_char: 77933
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0312
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 347b
char_span:
  start_char: 78099
  end_char: 78325
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6294fa5257993cac77a9489df755d993b120fd37c582e73e269bf7cc0ddfe278
voice_chain:
  - ΣΩ.
  - ΑΛΚ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Ἀλκιβιάδης, ναί, ἔφη
    start_char: 78081
    end_char: 78107
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0313
source_work: Protagoras
outer_turn_id: turn_protagoras_0059
stephanus_span: 347b-347e
char_span:
  start_char: 78330
  end_char: 79590
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 19ffa1fda0521af25a1571634abdc97db42dee4f2c1c06b4f0c15dc85ce0ae02
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: καὶ ἐγὼ εἶπον
    start_char: 78330
    end_char: 78343
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0315
source_work: Protagoras
outer_turn_id: turn_protagoras_0060
stephanus_span: 347e-348a
char_span:
  start_char: 79595
  end_char: 80108
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9df1402d094637074f625872898f07a3aa603733f775459b70e14a89a6992118
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 79591
    end_char: 80143
    text_sha256: c9c0d6cce71c9e9b8381ef8b461126b2832e72529602ce52b03813e2b95c1028
  rationale: The utterance opened at 78326 by "{p} καὶ ἐγὼ εἶπον· Ἐπιτρέπω μὲν ἔγωγε Πρωταγόρᾳ" runs unbroken to 80109, where "{348b} {p} λέγοντος οὖν ἐμοῦ ταῦτα" marks what begins. This span lies inside it; the reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0316
source_work: Protagoras
outer_turn_id: turn_protagoras_0060
stephanus_span: 348b-348c
char_span:
  start_char: 80254
  end_char: 80538
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0a41668623525b6b6426c8d66436d18cf932ef6243e72f35636ca32f9eb5ea7d
voice_chain:
  - ΣΩ.
  - ΑΛΚ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἶπεν οὖν ὁ Ἀλκιβιάδης πρὸς τὸν Καλλίαν βλέψας
    start_char: 80206
    end_char: 80252
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0317
source_work: Protagoras
outer_turn_id: turn_protagoras_0060
stephanus_span: 348c-348e
char_span:
  start_char: 80772
  end_char: 81549
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b304a585138cc4db2c4e60694a28c113a59fe49650c5515179400e91d82eb804
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον δὴ ἐγώ
    start_char: 80772
    end_char: 80784
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0318
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 348e-349d
char_span:
  start_char: 81554
  end_char: 82934
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2eb29930b5e0eac6f9203de86c9d21e2d330f1598d5a31b076e4adb707bc39cf
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 81550
    end_char: 82939
    text_sha256: e337a32a1c7bbc125de26d97e68582ae2db4e2701778624aa4c0a00dd56a712f
  rationale: The utterance opened at 80772 by "εἶπον δὴ ἐγώ· ὦ Πρωταγόρα" runs unbroken to 82935. The μέν clause ends the previous page-chunk at 81549, αὐτοὶ μὲν ἐπιεικεῖς εἰσιν, ἄλλους δὲ οὐ δύνανται ποιεῖν·, and this span opens its answering σὺ δέ. The reprinted page-chunk siglum at the boundary is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else. Resolved here for the same reason the identical boundaries at 9950, 22370, 40000, 54491, 62674 and 67091 are.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0319
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349d-349e
char_span:
  start_char: 82939
  end_char: 83303
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fa715af7370376fe8e554c58403c6ff4b1ea8cbffa9538a578c773a5ca8e971b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 82953
    end_char: 82956
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0320
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83308
  end_char: 83414
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ad5be7f6ecfd8a720f44637cd96d5fd3ddbc912ade733f2bd375a10ce168dd69
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 83316
    end_char: 83324
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0321
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83415
  end_char: 83465
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 38064ffaf522dc0b606f9c26d7dcc692291544f9c3f9e614714d9f4038734436
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 83428
    end_char: 83431
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0322
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83466
  end_char: 83561
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 632ee1b98b682c38dd8048d6baa1120b5aee0994a71ff1cb57877feaeebb9da5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0323
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83562
  end_char: 83604
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9cf04b615628cc1d6fa4d3472d66ff0d6b1b6e8bf9cb01ae12706cd2c51c920d
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 83581
    end_char: 83584
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0324
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83605
  end_char: 83683
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 76e37e2f93ecdbe2f3f7009c06fb0e994d8701e3091bb7cd2d19087a1dc7993e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 83618
    end_char: 83627
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0325
source_work: Protagoras
outer_turn_id: turn_protagoras_0061
stephanus_span: 349e
char_span:
  start_char: 83684
  end_char: 83718
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6a5e6edac3a30effa255e0135013d806e5ac2e861bd017cebb7f49bd476195a8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0326
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 349e-350a
char_span:
  start_char: 83724
  end_char: 83782
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 45f6bfe45bc0a86fcc8f290f4bd02e1066f97a6520e37fed8925580ba53fff7f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0327
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83783
  end_char: 83808
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1b7cff42532b7a2f22e75722d9bf6d5f08442a76856378f593495f93a788de73
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0328
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83809
  end_char: 83848
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 564941349f7775ea4f359a2318ad46a07ed7e788cb359bbfaf9568f51b6e4678
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0329
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83849
  end_char: 83864
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 95f47c734b2d68ef20c7ebce0e7dac401bf135e50a31d55f46236e7bd41c82b2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0330
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83865
  end_char: 83946
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 03e4490bef3bb6787ba4d4aedaa7ce9207b231ddd2c2a2e46bf2262ad741eba8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0331
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83947
  end_char: 83958
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d8b038c82d230e6d86fcc98f28f8cbb28aa06438311756f5f9b63a063ca51c74
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0332
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 83959
  end_char: 84007
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f8865633378ece62edc970a892fef97f2b96f0d49aeedafe08018c80fc4ddb42
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0333
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a
char_span:
  start_char: 84008
  end_char: 84023
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 54e04a0074173f99aa31c0a4a177e2ca44095f2bf196f340ccbb7aa13a35fb2c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0334
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350a-350b
char_span:
  start_char: 84024
  end_char: 84177
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ea7a79e6df3cf8e808c3eb4055ab56c37f72053ba3db79d82c2ed876cfac334c
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 84063
    end_char: 84066
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0335
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84178
  end_char: 84274
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 49ae1f805f40a1f4b996120d3ce3bf3125b759ba03338b5fc06a821bd99bedea
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 84200
    end_char: 84204
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0336
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84275
  end_char: 84314
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 97af6fef5099da57bb17c5c76d4b82e24f6d34aebb50eddf677f6c8cb610e3f2
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 84282
    end_char: 84289
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0337
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84315
  end_char: 84360
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 2ff291b58d7559174e35df60773c23c3bc2eefe2d17077ce1642cf59515665e3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0338
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84361
  end_char: 84428
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4ed599d1c746aa6f23b251886c09407583c3d8587bb4baf826180383639f1d65
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 84377
    end_char: 84380
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0339
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84429
  end_char: 84498
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d18ed137d310a80b0164ed30548b126691061eccac1eb81deabd8dfda25dc7c3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 84438
    end_char: 84446
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0340
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350b
char_span:
  start_char: 84499
  end_char: 84515
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: eabca0efc30fb2b7ff24c8a4ead921dd3c811f7a6590023d65291929d4ca5f79
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 84511
    end_char: 84514
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0341
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350c
char_span:
  start_char: 84524
  end_char: 84755
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6a0ae11eb60be3b89a05ed7962d32bc4197b9e0221053fc66e0658a1dfe630f8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 84538
    end_char: 84547
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0342
source_work: Protagoras
outer_turn_id: turn_protagoras_0062
stephanus_span: 350c-350e
char_span:
  start_char: 84760
  end_char: 85679
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 056eb1c80d6c0d5f5aaf916393de64db5afebde4379c123b2ee3fed703302caa
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 84770
    end_char: 84773
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0343
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 350e-351b
char_span:
  start_char: 85684
  end_char: 86274
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 92f5e7f36efdb6292c7661b54684397623efa44c9d52171f967e5c0770e19d6e
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: οὐ καλῶς, ἔφη, μνημονεύεις, ὦ Σώκρατες
    start_char: 84760
    end_char: 84798
  - kind: formula_bounded_continuation
    text: "{p} λέγεις δέ τινας, ἔφην, ὦ"
    start_char: 86275
    end_char: 86303
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0344
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351b
char_span:
  start_char: 86279
  end_char: 86350
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8baac339c78ef03ec4424ab8e15c32e2700548ec91ffc745aaea10b268228af0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 86296
    end_char: 86300
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0345
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351b
char_span:
  start_char: 86356
  end_char: 86429
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: facbd2755ba3c1bf9c8db8c4bd3b02f142d85bd9b5eb23f8625243842904427b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0346
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351b
char_span:
  start_char: 86439
  end_char: 86520
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b9cc94dee602c5bac5596f8dd65a7e1a39e948e090c305823c6f216fbeed6084
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0347
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351b
char_span:
  start_char: 86521
  end_char: 86533
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ad6a8e3935c06cc27511f2c5ad8f0c581049bbf5b21a5af00ab12956e41c9397
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 86529
    end_char: 86532
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0348
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351b-351c
char_span:
  start_char: 86534
  end_char: 86588
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 78cd5cf1b024423ef162c8ab6b325895b2c3dfad6741d2ea3c1e9c81f4917f0e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 80588 and 87309, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0349
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351c
char_span:
  start_char: 86589
  end_char: 86629
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 46a1e8bba7edf69870213f2283f4623cd0892b2758d6771641775d4316127f0e
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 86611
    end_char: 86614
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0350
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351c
char_span:
  start_char: 86630
  end_char: 86876
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 80bca2221b992741139b3b00300568e34fbcae3d2e209a7e1ec1a3b60b30fbd8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 86630
    end_char: 87292
    text_sha256: 3b177fbc063b0cca152323a99d29ae41314a5eb70ac9141ddbb18350f37607cc
  rationale: The span opens τί δή, ὦ Πρωταγόρα; — an addressee vocative naming ΠΡΩΤ. at 86637, outside any {q}. A vocative names the addressee, so ΠΡΩΤ. is not speaking it, and inside the two-party exchange the anchors at 80588 and 87309 enclose, whose only marked speakers are the narrator and ΠΡΩΤ., the remaining owner is the narrator. Context stops at 87292, the end of the ἔφη-marked ΠΡΩΤ. reply that answers this question and opens ὦ Σώκρατες in its turn.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0351
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351c-351d
char_span:
  start_char: 86877
  end_char: 87292
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f848851cd09219427c0cdfd96c3146ba28be0b5ed6e825b3288c9ce826fd2ed4
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 86899
    end_char: 86902
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Πρωταγόρας αἰσχυνθείς, ὥς γέ μοι ἔδοξεν
    start_char: 80543
    end_char: 80588
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0353
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351d-351e
char_span:
  start_char: 87293
  end_char: 87368
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 35c2ba24bf665b8f9d01a68bf218108a477236eb6ff2fd8b84eba47df49117b8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 87309
    end_char: 87318
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0354
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351e
char_span:
  start_char: 87369
  end_char: 87382
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: da1de92e8aa206f86c2babd3053602087f35eef1a401e311d29b0d97b6cc5058
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 87378
    end_char: 87381
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0355
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351e
char_span:
  start_char: 87383
  end_char: 87482
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b93c2ae9678bb1ebccb2e603d51f40dc4118912b68165567903b632fc7aa8af7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0356
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351e
char_span:
  start_char: 87483
  end_char: 87676
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 76ad84bbfa94918761590c1dcb5424202310ab15fd2d4324d6b7dfa7de561c04
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 87500
    end_char: 87503
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0357
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351e
char_span:
  start_char: 87681
  end_char: 87753
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 70de54bedfc8b700747476df3aa6170548a63e013983745ac789db5f2c529370
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 87694
    end_char: 87703
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0358
source_work: Protagoras
outer_turn_id: turn_protagoras_0063
stephanus_span: 351e
char_span:
  start_char: 87758
  end_char: 87816
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b5803722bba857e596d633b5e8bb58607c20d89e082e1771d1c46cd49d714c8a
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 87767
    end_char: 87770
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0359
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352a-352c
char_span:
  start_char: 87832
  end_char: 89110
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d5f568513cfd8159a9e556ef6c180528306631613efe95548c13bda04af8f616
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 87841
    end_char: 87850
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0479
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352a
char_span:
  start_char: 88028
  end_char: 88128
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ff935b981549b5b646be1bbdf4b05917787aac02de88eadeed3c4c89102e6cd2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The speaker is the indefinite τις ἄνθρωπον σκοπῶν of 87887-87915, reported by the optative εἴποι at 88021-88026. Socrates then distinguishes himself from that figure — καὶ ἐγὼ τοιοῦτόν τι ποθῶ at 88129 — so the words are not his. The examiner is described by what he is doing, which is neither a name nor a registered role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0360
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352c-352d
char_span:
  start_char: 89115
  end_char: 89296
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5bd899330d2c67e7c609a5cfa8aed7427f9b8043bb423767c26d56b775779efa
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 89126
    end_char: 89129
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0361
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352d-352e
char_span:
  start_char: 89301
  end_char: 89682
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7ac4ba655a6dc1ad876aa8480eee893126a179483bdbe1f48eb2bb6d02f3a5c8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 89311
    end_char: 89319
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0362
source_work: Protagoras
outer_turn_id: turn_protagoras_0064
stephanus_span: 352e
char_span:
  start_char: 89687
  end_char: 89761
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 03ff06f8cf847da55a079d023872fe59f11000caefdb87dfc3ac756a07101261
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 89704
    end_char: 89707
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0363
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 352e-353a
char_span:
  start_char: 89770
  end_char: 90208
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9f61a0b7da40d2548f4d8665f95606bc01009262bb3da17007f3904c0f3bf684
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 89770
    end_char: 90322
    text_sha256: c0eab39916baf5d0100c923fe03dec2ad9fed7dd0798739db45f38536e0bedd3
  rationale: "The span is a proposal in the first person addressed to a second: ἴθι δὴ μετ’ ἐμοῦ ἐπιχείρησον πείθειν τοὺς ἀνθρώπους. The utterance that answers it, 90213, is resolved to ΠΡΩΤ. on its own vocative ὦ Σώκρατες at 90218, and it answers by objecting to the very thing proposed — τί δέ, ὦ Σώκρατες, δεῖ ἡμᾶς σκοπεῖσθαι τὴν τῶν πολλῶν δόξαν — which makes ΠΡΩΤ. this span's addressee, not its speaker. Inside the two-party exchange the anchors at 87325 and 93376 enclose, the remaining owner is the narrator. The ὦ ἄνθρωποι and ὦ Πρωταγόρα here are inside the hypothetical question the span stages."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0480
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353a
char_span:
  start_char: 90062
  end_char: 90208
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0ae50402ae3705f4584911a6aaceb699a5cb1df5c3a75030db428c6c75447950
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The subject of ἔροιντ’ ἂν ἡμᾶς at 90045-90061 is τοὺς ἀνθρώπους of 89807-89821, the many Socrates proposes to persuade. The quoted words address Protagoras and Socrates in the vocative and ask them in the second person dual εἴπατον, so the owner is that collective. A collective picks out no individual and none is named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0364
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353a-353b
char_span:
  start_char: 90213
  end_char: 90322
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c25fba87ce62151e7b6d1b33d5a2e002ff8ad554426c0e657f82b47b26c3d8bf
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 90220
    end_char: 90230
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0365
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353b
char_span:
  start_char: 90327
  end_char: 90597
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4c54b536b33dbcf8e9b518cb39a489f2da12467671067e336354032ce69e39b9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 90334
    end_char: 90343
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0366
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353b-353c
char_span:
  start_char: 90602
  end_char: 90657
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b7cab3035ad6025d7459c6cbadad6d73c962f52ccc50f16a9fad1a1dd8cd4b7b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 90608
    end_char: 90611
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, οὐ τὰ
    start_char: 87309
    end_char: 87325
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0367
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353c
char_span:
  start_char: 90662
  end_char: 91060
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 615dd6c7ed4686f12634fe05635d7eac97f1eb064a45f1cbdcde7b8c6caddb52
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 90676
    end_char: 90684
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0481
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353c
char_span:
  start_char: 90703
  end_char: 90776
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3a00b21d6c0be77825a62c5fe39e8bf808f4e4f3d01ab122c04c1ba09c651ca3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἰ ἔροιντο ἡμᾶς at 90686-90702 is third person plural with the same οἱ ἄνθρωποι as its unexpressed subject; the quoted question calls that collective ἡμεῖς and its hearers φατε, second person plural. Socrates answers it πρὸς αὐτούς. The owner is the collective, which picks out no individual, and none is named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0368
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353c-353e
char_span:
  start_char: 91071
  end_char: 91652
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5106125835719cc72253001053a7cc3e14ea71c5409360b015abfbe4d62b37a2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 91071
    end_char: 91721
    text_sha256: 3e40421c24ccf69eb3a084d44d429c649f9274681fbab116952d5b1a25a9deb8
  rationale: "The span carries an addressee vocative outside any staged question: ἆρ’ οἰόμεθ’ ἂν αὐτούς, ὦ Πρωταγόρα, ἄλλο τι ἀποκρίνασθαι at 91490 is the speaker's own frame, not part of the hypothetical put to the many, and it names ΠΡΩΤ. as the one addressed. Inside the two-party exchange the anchors at 87309 and 93376 enclose, whose only marked speakers are the narrator and ΠΡΩΤ., the remaining owner is the narrator. Context stops at 91721, the named reply ἐγὼ μὲν οἶμαι, ἔφη ὁ Πρωταγόρας that answers this very question."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0369
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353e
char_span:
  start_char: 91653
  end_char: 91721
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 20d8a0c625da7a01926afe08d9dcc0c90dc30c8cb4af2faced8cea85cb9ec529
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Πρωταγόρας
    start_char: 91668
    end_char: 91684
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0370
source_work: Protagoras
outer_turn_id: turn_protagoras_0065
stephanus_span: 353e
char_span:
  start_char: 91722
  end_char: 91816
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 681161e5bbad08b54f3517f6a7d191e2447aaf86a807f7ce40b6dc14a8ef871c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0371
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 353e-354a
char_span:
  start_char: 91843
  end_char: 92022
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bb6b0568116a4f88ba26e8f7ac8f785704e7de988f243f37bfea0357c845fa36
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 91843
    end_char: 92046
    text_sha256: cb06ff21704144c0c1adc405e5400fab867b53b8162b9ec28b13bd332c57c4d5
  rationale: The span says ὥς φαμεν ἐγώ τε καὶ Πρωταγόρας at 91887 — a first-person ἐγώ set beside ΠΡΩΤ. named in the third person and coordinated with him, which excludes ΠΡΩΤ. as its speaker. Inside the two-party exchange the anchors at 87325 and 93376 enclose, whose only marked speakers are the narrator and ΠΡΩΤ., the remaining owner is the narrator. The ὦ ἄνθρωποι at 91860 is addressed to the hypothetical many the span stages, not to an interlocutor, and identifies nobody. Context stops at 92046, the narration recording the assent of both.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0372
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354a
char_span:
  start_char: 92046
  end_char: 92355
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0ddebc68153c097193e6274980897a4c6013197383ca4fe8614450bffa0faadd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0373
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354a-354b
char_span:
  start_char: 92367
  end_char: 92635
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ef1b240027df1e9b5173f882b1db1b822f969ad623ae4b4d7149af4dc8af7e17
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0374
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354b-354c
char_span:
  start_char: 92647
  end_char: 92886
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 906ea787723305d809b4271256b670622d414069df1085c4846e7a0cf71c5bb4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0375
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354c
char_span:
  start_char: 92887
  end_char: 92902
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 20402eb54344dd3c4238a1ed798dba7efc4d5a2ea3cd86153d3942489c7cdebe
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Πρωταγόρας
    start_char: 92904
    end_char: 92920
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0376
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354c
char_span:
  start_char: 92922
  end_char: 92996
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e53b3225c473e36db3eedd0241c3eb42f147843d00722a3c697f3092eb8f591e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0377
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354c-354d
char_span:
  start_char: 93008
  end_char: 93355
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 18dc83e16ef35adebf2702850fc903e74e84c5e9141edd9f6aaa37482636ad5b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 87325 and 93376, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0378
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354d
char_span:
  start_char: 93356
  end_char: 93375
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e3b5f8bbac0e95c8f3de6b7a0dcfda9251afc42f133ee67bd84ca3c353c272b6
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Πρωταγόρας
    start_char: 93376
    end_char: 93392
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0380
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354d-354e
char_span:
  start_char: 93394
  end_char: 93722
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c7ea35d82355e21cc3f50980f05a94a2de6db4f080536ce6d2463eed37bd6e62
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 93398 and 100838, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0381
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354e
char_span:
  start_char: 93723
  end_char: 93741
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f6ac10efce588709d620e53bfe8e6374541a9c0373fd2b69d6c3b32c161b9b22
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ὁ Πρωταγόρας
    start_char: 93743
    end_char: 93755
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0382
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354e
char_span:
  start_char: 93761
  end_char: 94055
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 72c1ab540f055bbe5afe4f7a2515c9e137ebac8e0afcea2c904639c5b61042eb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 93775
    end_char: 93783
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0482
source_work: Protagoras
outer_turn_id: turn_protagoras_0066
stephanus_span: 354e
char_span:
  start_char: 93814
  end_char: 93883
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: b4573a3f73f773b1896a72fef234e634cfe827324b911eccc26f0f0f869b03e0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἴ με ἀνέροισθε, ὦ ἄνθρωποι at 93785-93813 is second person plural addressed to οἱ ἄνθρωποι, so they speak the quoted question, which addresses Socrates alone in the second person singular λέγεις. The owner is that collective; the Greek names no individual within it.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0383
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 354e-355e
char_span:
  start_char: 94060
  end_char: 96073
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c2ed5d19b84f7e66d2d720a6ced925c40e9fa5daa8f54541fde3c169ea8ad29f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 94056
    end_char: 96074
    text_sha256: 6ec2fed0286fae2ca2d4e4d71e3f56929ce51c184192cf2ff1eaabc7e17c9e0a
  rationale: The utterance opened at 93761 by "πάλιν τοίνυν, ἔφην ἐγώ" runs unbroken to 96074. The reprinted page-chunk siglum at 94056 is the edition's, not a change of speaker, and no formula between the two hands the floor to anyone else; the second-person plurals in the span (ἔχετε, ὑμῖν, λέγετε, ἐν ὑμῖν) address the hypothetical many the narrator stages, not an interlocutor. This record also absorbs the fragment that formerly began at 94355, which was the same speech continuing after a full stop.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0483
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355c
char_span:
  start_char: 95063
  end_char: 95079
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 63877fe3de8635eca9f66da927319928d5617f95727d3797cab7e91523cb73b4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: ἐὰν οὖν τις ἡμᾶς ἔρηται at 95038-95062 stages this question for an indefinite τις, answered by first person plural φήσομεν. The same figure is resumed as ἐκεῖνος at 95118 and at 95343 as ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν — a description of his manner, not a name and not a role any siglum is registered for.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0484
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355c
char_span:
  start_char: 95100
  end_char: 95117
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ee55fd9141a5f34ea5150f3637e1d178970f5139735fe4e05d46e218fc1f4997
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: ἐκεῖνος ἐρήσεται ἡμᾶς at 95118-95140 follows this question and identifies its asker only by the anaphoric ἐκεῖνος, whose antecedent is the indefinite τις of 95046. The answer is first person plural (ἀποκρινώμεθα, λέγωμεν), so the asker is nobody present, and nothing names him.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0485
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355c
char_span:
  start_char: 95288
  end_char: 95307
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0491fc6f7a3257e64300403415d58ed56a0472207c5d485baa33df783abb9e56
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The reporting verb is the bare future φήσει at 95308-95314, its subject the same indefinite questioner carried from τις at 95046 through ἐκεῖνος at 95118. The Greek marks him as third person singular and distinct from the first person plural φήσομεν that answers, but supplies no name and no role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0486
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355d
char_span:
  start_char: 95411
  end_char: 95546
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 25f9a9e18d62c14b22ea9ba578058528cf17f9e183c83e89f52216a5cc40f167
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The subject is ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν at 95343-95410 — a description of the questioner's manner, not a name and not a role a siglum is registered for. He addresses his hearers as second person plural (λέγετε, ἐν ὑμῖν) and is answered by first person plural φήσομεν, so he is neither man present.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0487
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355d
char_span:
  start_char: 95554
  end_char: 95621
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7ce35c2b92e602b7552f6ea646f8c14df0b33ac6303b4e9e70eb45cdee054344
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The parenthetical φήσει at 95547-95553 carries the same unnamed questioner across the inquit that interrupts his sentence; the edition closes and reopens its quotation around that inquit, which is narration and belongs to the parent. He is designated at 95343-95410 by his manner alone, never by name or role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0488
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355d
char_span:
  start_char: 95730
  end_char: 95750
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f71fbae5abf5284f01e87d919fa1c69b58fe7142b42b9ebde02ac6454be06931
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: φήσει ἴσως at 95751-95762 immediately follows this fragment and attributes it to the same unnamed questioner, still designated only as ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν at 95343-95410. Nothing between 95343 and 96049 names him or supplies a role a siglum covers.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0489
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355d-355e
char_span:
  start_char: 95763
  end_char: 95911
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1f359d475e87b23931a8f28eac1fc9e00b905f81330e022db186d40a372dc45c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: The reporting verb is φήσει ἴσως at 95751-95762, immediately before this span, whose subject is the unnamed questioner of 95343-95410. The quoted words are second person plural throughout and are answered by first person plural οὐχ ἕξομεν εἰπεῖν, so the owner is outside the pair speaking, and he is never named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0490
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355e
char_span:
  start_char: 95944
  end_char: 95963
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7b66aa5c443819f934a6c531790a806c4bd57cf4e170e6282d7b5f0aef735d41
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: φήσει at 95964-95970 stands between this fragment and its continuation and attributes both to the same unnamed questioner, described at 95343-95410 only as ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν. The Greek gives him no name and no registered role.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0491
source_work: Protagoras
outer_turn_id: turn_protagoras_0067
stephanus_span: 355e
char_span:
  start_char: 95971
  end_char: 96053
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 93ac76cf5ea2ecb83c3cc9f0c773f792fc64db4c12c293c635fd229695427608
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: φήσει at 95964-95970 attributes these words to the unnamed questioner introduced as τις at 95046 and described at 95343-95410 by his manner alone. The quoted clause addresses its hearers as λέγετε, second person plural, so it is spoken by neither man present, and nothing names its speaker.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0385
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 355e-356c
char_span:
  start_char: 96078
  end_char: 97292
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 91b9b6995405cc314a676433ef02a84b455aa5a4a36f601e6a8fb3f31955ed00
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 96074
    end_char: 97319
    text_sha256: 2dfd8bcc03601c0b79b231c2b2978e4a08ea0913884016df6b1443a3ab7e6606
  rationale: "The utterance running to 96074 closes with ταῦτα μὲν οὖν οὕτω and this span resumes it at the reprinted page-chunk siglum, which is the edition's and not a change of speaker. Inside this stretch the narrator conducts the staged questioning and ΠΡΩΤ. only assents: every gap in the turn is narration — συνεδόκει καὶ ἐκείνῳ at 97292, φήσουσιν at 97453, φαῖεν ἄν at 97578 — and no formula anywhere in it hands the floor to another speaker. The ὦ ἄνθρωποι in the span addresses the hypothetical many."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0492
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 356a
char_span:
  start_char: 96536
  end_char: 96643
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cea0906411d77b7bfb5912207a9ec587a0f7a46172df7fbbe66d24eb96ceada7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: εἰ γάρ τις λέγοι ὅτι at 96515-96535 stages this objection for an indefinite τις. The quoted words address Socrates in the vocative ὦ Σώκρατες, which names the addressee and so excludes him as speaker, and the reply φαίην ἂν ἔγωγε is first person singular. The objector is named nowhere.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0386
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 356c
char_span:
  start_char: 97319
  end_char: 97453
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f304cb639be1a038bac0b047a8f0f2139cc8d0d189149c28451971cd84d8e421
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 96078
    end_char: 98236
    text_sha256: 2ddee32d0d021997b9b346496e52f2c1eba7875dc4590409900f50aa54c801be
  rationale: "Inside this stretch the narrator conducts the staged questioning and ΠΡΩΤ. only assents: every gap in the turn is narration — συνεδόκει καὶ ἐκείνῳ at 97292, φήσουσιν at 97453, φαῖεν ἄν at 97578 — and no formula anywhere in it hands the floor to another speaker. This span is one of the questions in that unbroken sequence, and the first of them carries the first-person φήσω at 97366. The owner is therefore the narrator throughout."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0387
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 356c
char_span:
  start_char: 97464
  end_char: 97578
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: fff03c5385a8e16cabd53f8550ae6bef82d300e15f8402bc5e8f9a316347037e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 96078
    end_char: 98236
    text_sha256: 2ddee32d0d021997b9b346496e52f2c1eba7875dc4590409900f50aa54c801be
  rationale: "Inside this stretch the narrator conducts the staged questioning and ΠΡΩΤ. only assents: every gap in the turn is narration — συνεδόκει καὶ ἐκείνῳ at 97292, φήσουσιν at 97453, φαῖεν ἄν at 97578 — and no formula anywhere in it hands the floor to another speaker. This span is one of the questions in that unbroken sequence, and the first of them carries the first-person φήσω at 97366. The owner is therefore the narrator throughout."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0388
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 356c-356e
char_span:
  start_char: 97589
  end_char: 98236
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9c3a0f4fc99b3c5fa5c3b4c753fa28e017fa36c22f3db58bb3bcf859750b9c37
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 96078
    end_char: 98236
    text_sha256: 2ddee32d0d021997b9b346496e52f2c1eba7875dc4590409900f50aa54c801be
  rationale: "Inside this stretch the narrator conducts the staged questioning and ΠΡΩΤ. only assents: every gap in the turn is narration — συνεδόκει καὶ ἐκείνῳ at 97292, φήσουσιν at 97453, φαῖεν ἄν at 97578 — and no formula anywhere in it hands the floor to another speaker. This span is one of the questions in that unbroken sequence, and the first of them carries the first-person φήσω at 97366. The owner is therefore the narrator throughout."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0469
source_work: Protagoras
outer_turn_id: turn_protagoras_0068
stephanus_span: 356e
char_span:
  start_char: 98237
  end_char: 98251
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3f0c980d8b1d619c4ca5002048348983272ce8bedfa8381f1a0ac98f85a833ff
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 97589
    end_char: 98264
    text_sha256: 9a193e7a8d19b648e3b7df629e75428d94d537eda7702a500c59521911c2318c
  rationale: "An answer the candidate left uncovered: τὴν μετρητικήν, in the accusative echoing the question at 98180, reported by ὡμολόγει at 98253. That verb is third person, so the narrator is not speaking it. The only other speaker the source marks anywhere in this stretch is ΠΡΩΤ., named outright at 91653, 92902 and 93741 as the party who answers and assents."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0389
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 356e-357a
char_span:
  start_char: 98268
  end_char: 98703
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 08b42b8390bb933ae84917f1f57118986e1356eb46c66bf5d3300a8cefe07533
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 98268
    end_char: 100564
    text_sha256: 1ceec60a9e5bc521311d1f586788104744d9cbd0ce7c88f4d1ea693ebaf80bad
  rationale: "The whole of this turn is one held floor: its only interruptions are narration — the assent at 98704 and συμφήσουσιν at 99106 — and no formula in it hands the floor to anyone. ΠΡΩΤ. is named here only as assenting, never as speaking, and the hypothetical many the span addresses are not a transmitted speaker at all: every one of their utterances in this stretch stands in a potential optative or a conditional. The narrator is the only live owner. "
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0391
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 357a-357b
char_span:
  start_char: 98743
  end_char: 99041
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 89b14ac0866c4d82c41f52a43673a4d18004156e5e2d38a3f6f0097dba973024
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 98268
    end_char: 100564
    text_sha256: 1ceec60a9e5bc521311d1f586788104744d9cbd0ce7c88f4d1ea693ebaf80bad
  rationale: "The whole of this turn is one held floor: its only interruptions are narration — the assent at 98704 and συμφήσουσιν at 99106 — and no formula in it hands the floor to anyone. ΠΡΩΤ. is named here only as assenting, never as speaking, and the hypothetical many the span addresses are not a transmitted speaker at all: every one of their utterances in this stretch stands in a potential optative or a conditional. The narrator is the only live owner. "
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0392
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 357b
char_span:
  start_char: 99042
  end_char: 99054
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5ef3cf6f9a5099dde19589568e43a9ebfdefca193611d92f658b2378ca076748
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "An answer slot: 0390 ends in a question mark, bare em-dashes bound this unit, and ἀλλά with bare ἀνάγκη is the answering idiom, pointing away from the questioner. Nothing follows to assign it, unlike the parallel answer at 98236 that ὡμολόγει gives ΠΡΩΤ. The alternatives are the narrator continuing and the staged many answering, and the many are unregistered, so neither can be named."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0393
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 357b
char_span:
  start_char: 99055
  end_char: 99106
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c254196f5d30ebbedaee2d4088130f5e91195df9e76b9e50e8f4d757cc1eeaf3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 98268
    end_char: 100564
    text_sha256: 1ceec60a9e5bc521311d1f586788104744d9cbd0ce7c88f4d1ea693ebaf80bad
  rationale: "The whole of this turn is one held floor: its only interruptions are narration — the assent at 98704 and συμφήσουσιν at 99106 — and no formula in it hands the floor to anyone. ΠΡΩΤ. is named here only as assenting, never as speaking, and the hypothetical many the span addresses are not a transmitted speaker at all: every one of their utterances in this stretch stands in a potential optative or a conditional. The narrator is the only live owner. "
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0394
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 357b-357e
char_span:
  start_char: 99120
  end_char: 100564
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 315da5494bc6f07efa0ce99e668070c15b090fc1f7c60381436aa5e71818cdcb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 98268
    end_char: 100564
    text_sha256: 1ceec60a9e5bc521311d1f586788104744d9cbd0ce7c88f4d1ea693ebaf80bad
  rationale: "The whole of this turn is one held floor: its only interruptions are narration — the assent at 98704 and συμφήσουσιν at 99106 — and no formula in it hands the floor to anyone. ΠΡΩΤ. is named here only as assenting, never as speaking, and the hypothetical many the span addresses are not a transmitted speaker at all: every one of their utterances in this stretch stands in a potential optative or a conditional. The narrator is the only live owner. "
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0493
source_work: Protagoras
outer_turn_id: turn_protagoras_0069
stephanus_span: 357c-357d
char_span:
  start_char: 99599
  end_char: 99749
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a31f0087cae3021a7608996321572786b535beb54b02001ca203336aee5665d1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: μετὰ τοῦτο ἤρεσθε ἡμᾶς at 99575-99598 is second person plural aorist inside Socrates' address to οἱ ἄνθρωποι, so that collective speaks the quoted question, which addresses Protagoras and Socrates in the vocative and asks them as ὑμεῖς. A collective picks out no individual, and none is named.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0395
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358a
char_span:
  start_char: 100580
  end_char: 100773
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9f7e0e80e927cb3ba0badd8e84498ec9807258dfa6851fd2bd4e6002dad2a10c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΙΠ.
    - ΠΡΟΔ.
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 100580
    end_char: 100822
    text_sha256: e32e136005f1c8a74ac32e1de823a23eb8ae342a5fe4424d4e3866b42cab504f
  rationale: "The span says ὑμᾶς δὲ δὴ μετὰ Πρωταγόρου ἐρωτῶ, ὦ Ἱππία τε καὶ Πρόδικε: a first-person ἐρωτῶ, ΠΡΩΤ. named in the third person and joined to the speaker rather than addressed, and ΙΠ. and ΠΡΟΔ. named in the vocative as the addressees. All three registered alternatives are excluded by the span's own grammar, and it resumes the argument the narrator has been conducting since 98268. Context stops at 100822, the narration recording that everyone assented."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0397
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358a-358b
char_span:
  start_char: 100822
  end_char: 101112
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f9bee2bf348d58f9f92b3e4dc177f4eb0360fcfaa872288bbe29c495ca7f2325
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 100838
    end_char: 100847
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0400
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358b
char_span:
  start_char: 101164
  end_char: 101349
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c3963c9e32f9fb54bdb035b19e5824d9f3e5f925681c2205207843a9e495661d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 101184
    end_char: 101192
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0401
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358b-358c
char_span:
  start_char: 101361
  end_char: 101607
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: db6cc9bc52fed3a17b350c3d4871d7ac510dbe1024e0de5ef079d148222a3ac6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 101369
    end_char: 101377
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0402
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358c
char_span:
  start_char: 101625
  end_char: 101736
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5931bc3a7494fe98938fc6abe062c3a623532650f398c0177f3efd6fc663f7d2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 101361
    end_char: 101763
    text_sha256: bb009509f61c1448ba0f08aa38136b2b26f2586246c52d36cb68015fdf9802e6
  rationale: This span sits between two ἔφην ἐγώ utterances of the narrator, at 101361 and 101763, and the only things separating it from them are the narration συνεδόκει πᾶσιν at 101607 and καὶ τοῦτο πᾶσι συνεδόκει at 101736. Those record assent, not an utterance, so no formula hands the floor to anyone between the two; the second-person λέγετε in the span addresses the company the narrator is questioning. The owner is the narrator.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0403
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358c-358d
char_span:
  start_char: 101763
  end_char: 102055
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 94aba398ca10e91d363173cbe66d557fee45a70175846873284e3c7e7bc8b5e6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 101776
    end_char: 101784
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0405
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358d
char_span:
  start_char: 102092
  end_char: 102258
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7a1a003979c7ecb2d52e12b8dc46d47ae71ffa5b78d916b52f4d04ccf0f74aa1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην ἐγώ
    start_char: 102100
    end_char: 102108
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0406
source_work: Protagoras
outer_turn_id: turn_protagoras_0070
stephanus_span: 358e
char_span:
  start_char: 102358
  end_char: 102657
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8847d67b12790913c98abe7ba297f6663c46cdc2fa27ba20d7b45b2b021ac149
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 102370
    end_char: 102378
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0407
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359a-359c
char_span:
  start_char: 102697
  end_char: 103570
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 13cc453c5ce77416bcf434969796d55cc2be65298ad3523988e0cbfba6500891
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 102725
    end_char: 102734
  - kind: person_marked_reporting_formula
    role: cue
    text: ἠρόμην
    start_char: 103483
    end_char: 103489
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0413
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103571
  end_char: 103625
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: e795d3e6be6299631866741ec2df5624eb265f9cac3e78df29c5d58607ddff89
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 103581
    end_char: 103590
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0414
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103636
  end_char: 103727
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7d2eef20aaa466ba7957b1145f00745cc962799aff5b6f347b2c852d2e2526cf
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 103644
    end_char: 103652
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0415
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103737
  end_char: 103754
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c1031585183522b781cb616193abbd8a15ea0ab5a0d3f2c6f05bb6980fa3d778
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0416
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103755
  end_char: 103768
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 43a26bd3a09aedcfcf098292134c6361dd75c764f0e6ea636c9541b13a86264b
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 103760
    end_char: 103767
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0417
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103769
  end_char: 103845
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: a87fec0a3c1c1b70da10e563d3cf4d236dc84b008bfca515c1e39dda605fed21
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0418
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c
char_span:
  start_char: 103846
  end_char: 103893
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 48b8f3a2a22812d95718b04dd70b48afaef4b1df87a0e934b169b331402ddc92
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ὦ Σώκρατες
    start_char: 103858
    end_char: 103868
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0419
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359c-359d
char_span:
  start_char: 103894
  end_char: 104047
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7f14e4c9a02fc384864b547eaba2c944ca19e69a2628e33b54eb53ed6516f121
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 103901
    end_char: 103909
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0420
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359d
char_span:
  start_char: 104048
  end_char: 104125
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 8d9ac39c305bc9eedb820b8352a04ec18c8683cc067114f9392e065885179b03
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 104063
    end_char: 104066
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0421
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359d
char_span:
  start_char: 104126
  end_char: 104286
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 0d64d3ca3588966b72c62c44e749276367f7fb45025da4b886ec371cc37d395e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 104137
    end_char: 104145
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0422
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359d-359e
char_span:
  start_char: 104297
  end_char: 104439
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f0c3d9fbedc7e6587b76ef3d37341494d7cc3a802637e03634434ee0529d1daa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0423
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359e
char_span:
  start_char: 104440
  end_char: 104606
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3ffea0928311378dcaf00aaf3d5c9fd95c848e5271aa5dd7646160cf968cd665
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 104453
    end_char: 104456
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0424
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359e
char_span:
  start_char: 104607
  end_char: 104651
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 963adda07fd78d7719192750ffc7e8d7e7a57fdbde0064a81459778d8b300e5f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 104616
    end_char: 104624
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0425
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359e
char_span:
  start_char: 104652
  end_char: 104663
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: de1311bfd03b9f3b7411904e5f4debc5e8c2be88927d5d115c6a668b7cd7212a
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 104659
    end_char: 104662
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0426
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359e
char_span:
  start_char: 104664
  end_char: 104776
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 5a470ef54d9da7b81edf1cca14f0afbc7a3c00c8a6bc87cc8b43ab619cd06645
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0427
source_work: Protagoras
outer_turn_id: turn_protagoras_0071
stephanus_span: 359e
char_span:
  start_char: 104777
  end_char: 104818
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 3dfcf3abd49d5037fe7be9873eaeafd01f8175c9499a854432e196f30acd4608
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints a verb of saying only inside what is being argued, never one reporting this utterance, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0428
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 359e-360a
char_span:
  start_char: 104824
  end_char: 104924
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 4c6e1de74e41af56a6ecdf5ea49c6e2c1f22a72820b182087197284be4378014
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 104834
    end_char: 104842
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0429
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 104925
  end_char: 104947
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9fcaf6fe7f75484ce0e4c77e66d8ee597a5db1359aedb5a41d9ab092680088fe
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 104939
    end_char: 104946
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0430
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 104948
  end_char: 104999
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 38ea3ece0722b92a75b679563dbdab9d4a24d945e04fca11da0082735319cff3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 104956
    end_char: 104965
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0431
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 105000
  end_char: 105021
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9c9dbf1d8fedeec5379a2ba7128ebe7faa8a9a8045239b3908fa927a89abdc38
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105017
    end_char: 105020
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0432
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 105022
  end_char: 105113
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 90edc2ce32255d8acc46dfdae6392da8a05a2d7b0a04eda93e0396ef67583d16
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0433
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 105114
  end_char: 105187
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ba616b55a97c7f4bb18ce05a3b640a818aa4a6020591d98d8c00a00197a2df0e
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105145
    end_char: 105148
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0434
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 105188
  end_char: 105258
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 041359fe28ded2da673bc8fbc207ec631ca69438f24696c119915815de7c65d3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0435
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a
char_span:
  start_char: 105259
  end_char: 105282
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 64e4dcf9abc590a9c0b08a86269c813af585aa2a77f55dbab5b96da81e1a4499
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105267
    end_char: 105270
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0436
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360a-360b
char_span:
  start_char: 105283
  end_char: 105388
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 1c51f3d7d0934d2d5c9d3fa979f03de983fb6878fa0c96ef748b5915b190f237
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0437
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105389
  end_char: 105400
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f3a0af9cb3e05722add04bd354ff5db5ca9d94f9f7de7929fb894162562b87cc
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105396
    end_char: 105399
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0438
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105401
  end_char: 105430
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7b1ff1552fbdc0d6ec60d225a376e820210abfa2c9579988593d7a490053fd65
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0439
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105441
  end_char: 105463
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 85cdc6361cda915f52b4cf67eceb7e4472f0e59c36b80e8844b7bd3a779284c2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0440
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105464
  end_char: 105468
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0441
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105469
  end_char: 105590
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 560217b5ac1a40154a9cac4fb05caff0f3d39db01b4b57d63ef33825bbaf211b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0442
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b
char_span:
  start_char: 105601
  end_char: 105671
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dccbccb083fd5c6b9406a700bca65043d900b964923fbedffd6237ead8ba0a90
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0443
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360b-360c
char_span:
  start_char: 105672
  end_char: 105695
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d89c70880cafd0f9048edafc1f170b68ccb883364ea03bc968dc50733781734a
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105691
    end_char: 105694
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0444
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105696
  end_char: 105766
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: cc813316b30a7e0dac9f5ad51b1e7ecdbff3ea3375124ac3aa04d247f7dfe173
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0445
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105767
  end_char: 105786
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 70f13fc5ba0e2871dac287cc36095d560cae28ee01c812d3105ece6d0aca1d01
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105782
    end_char: 105785
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0446
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105787
  end_char: 105842
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 7f643764b9adb99a0135aec0b9a9164f51df2b5a79bc16f91851b78000d3b8f5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0447
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105843
  end_char: 105856
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: da1de92e8aa206f86c2babd3053602087f35eef1a401e311d29b0d97b6cc5058
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 105852
    end_char: 105855
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0448
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105857
  end_char: 105897
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 74c68a239525adf14907b8c6993ff94aab73dd86d9d4ecc81ae83b45b54f3a57
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0449
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105908
  end_char: 105959
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 72f2235c4be52624223783e8493b863db5004c839d2dda823d5c2e8952050fc0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0450
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c
char_span:
  start_char: 105968
  end_char: 106023
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: f4631a975c0b317056e6b6a433744d7b59466490352e795bab7ff376f30baab1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0451
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360c-360d
char_span:
  start_char: 106034
  end_char: 106086
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 74e3cd4037fc1fc61734b4de9a3c09c8f84bf5fe17caaba18412036be3992753
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 106044
    end_char: 106053
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0452
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d
char_span:
  start_char: 106092
  end_char: 106163
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: bcd4350e218b545f1eed11833e2a7ef610a2c8af905c8ae42fbd0a5d7da7c87d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0453
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d
char_span:
  start_char: 106191
  end_char: 106217
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 90b4e2fdf08a65688322923d2009b7db1dd180b362d52324534bad60ac24e554
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0454
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d
char_span:
  start_char: 106248
  end_char: 106330
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 800c43ce29035f3bf9cae92dea9d1d8fc664ca5058d3525f95f039ab1f069433
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΠΡΩΤ.
  - ΣΩ.
unresolved_reason: A discourse unit the source itself delimits, inside the bounded two-party exchange enclosed by the anchors at 100855 and 108510, in which the text marks direct speech for the narrator and for ΠΡΩΤ. and for no one else. It prints no reporting verb, so nothing in it discriminates between those two.
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0456
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d
char_span:
  start_char: 106380
  end_char: 106447
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: c9e4e145614161fa65a490a13cecb8cef06cc608a9fd495bd547c269615f3c55
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ εἶπον
    start_char: 106380
    end_char: 106393
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0457
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d
char_span:
  start_char: 106448
  end_char: 106468
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: dec1202b4598691ae29833b1e44fd85c6f7e401d0deadbb4baff5b44920c0c30
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 106455
    end_char: 106458
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0458
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360d-360e
char_span:
  start_char: 106469
  end_char: 106606
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 9be4bfe5dc1ecac9d53cef8cb8265c12edba03db1fbaa91228b706fa345f30f5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 106476
    end_char: 106484
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0459
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360e
char_span:
  start_char: 106607
  end_char: 106757
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6f6f678b8091670cd1a014cd3c667023fbafc67a3e92f1ae0e2ab9ad55841c8c
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 106623
    end_char: 106626
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: ἦν δ’ ἐγώ, τὸ μὲν
    start_char: 100838
    end_char: 100855
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0460
source_work: Protagoras
outer_turn_id: turn_protagoras_0072
stephanus_span: 360e
char_span:
  start_char: 106762
  end_char: 106898
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 455763a5901fbfc2caf8fcbfb7a66cd2324f8165149c776db5a379da4828bed9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 106769
    end_char: 106778
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0461
source_work: Protagoras
outer_turn_id: turn_protagoras_0073
stephanus_span: 360e-361d
char_span:
  start_char: 106903
  end_char: 108505
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: 6586d45f6ca8234cc30b8383697095433d9d51a6539fdb701d6823d714d61584
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΠΡΩΤ.
    - ΣΩ.
  context_span:
    start_char: 106903
    end_char: 108554
    text_sha256: 0f9141c8ac6a5ff1a558fd3e5a34eb3b767f94ff8dad0d34b4bbb6ed5054f6f2
  rationale: "The span carries an addressee vocative outside the {q}: the personified argument's speech closes at 107866 and the speaker resumes in his own frame with ἐγὼ οὖν, ὦ Πρωταγόρα, πάντα ταῦτα καθορῶν at 107870, naming ΠΡΩΤ. as the one addressed and himself in the first person. The second person recurs throughout (ὡς φῂς σύ, εἰ σὺ ἐθέλοις, μετὰ σοῦ). Inside the two-party exchange the anchors at 100838 and 108510 enclose, the remaining owner is the narrator. Context stops at the reply, καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη, ὦ Σώκρατες, which answers it and names Socrates in turn."
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0462
source_work: Protagoras
outer_turn_id: turn_protagoras_0073
stephanus_span: 361d-361e
char_span:
  start_char: 108528
  end_char: 108970
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: ab1e227d4f82d0db5ab2a7b1b9bde238123c49c7524615afa0797ebe5b2587fd
voice_chain:
  - ΣΩ.
  - ΠΡΩΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Πρωταγόρας, ἐγὼ μέν, ἔφη
    start_char: 108510
    end_char: 108540
review_status: accepted
```

```yaml
voice_id: voice_protagoras_0463
source_work: Protagoras
outer_turn_id: turn_protagoras_0074
stephanus_span: 362a
char_span:
  start_char: 108986
  end_char: 109117
source_path: raw/plato/greek/protagoras.txt
source_sha256: f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b
span_sha256: d354856de4ad6c2d27adc12318e63f0af09c4d3033f8c9a8f403fc97739e0946
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 108992
    end_char: 109001
review_status: accepted
```
