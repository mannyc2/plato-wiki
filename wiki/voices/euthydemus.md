# Euthydemus — Voice Ledger

Reported-speech structure for all 33 outer turns required by
`wiki/reported-turn-scopes.json`. This file is the canonical corpus artifact for
the dialogue under the corpus reported-turn completion campaign; no generator owns it and byte-identical
regeneration is not an acceptance requirement.

Every record is `accepted`, as 33 atomic outer-turn cohorts, under
`wiki/review/2026-08-04-euthydemus-voice-ledger-acceptance.md`. Acceptance does
not activate anything: euthydemus is absent from
`derived/plato/voices/cutovers.toml`, so nothing here has authority over any
claim's speaker — see `docs/voices-protocol.md`.

Socrates narrates the reported conversation to Crito, so the printed siglum ΣΩ.
is the depth-1 voice of 31 of these turns and utterances reported inside them are
depth-2 children. `turn_euthydemus_0081` and `turn_euthydemus_0082` are printed
ΚΡ. turns with the same shape and a different narrator: Crito reports his own
encounter at 304d-305b.

Reviewers edit this ledger directly against
`raw/plato/greek/euthydemus.txt`; shared code
checks only mechanical facts such as source hashes, exact offsets, containment,
overlap, evidence shape, and registered owners.

Each attribution cites byte-verified text-internal evidence: printed sigla, named
reporting formulas whose nominative subject stands in the same clause as the
reporting verb, first-person reporting formulas for the narrator's own reported
utterances, and anchored dialogue turns inside the two explicitly bounded
two-party Socrates–Cleinias exchanges. The eristic exchanges have four
participants and are never anchored: a bare ἔφη or ἦ δ’ ὅς there marks an
utterance without identifying its speaker, and the span is `unresolved` with the
locally reported speakers listed. No span is filled in from content, doctrine,
style, or whoever spoke last.

## Records

```yaml
voice_id: voice_euthydemus_0001
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 272e-273e
char_span:
  start_char: 3488
  end_char: 5613
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 309a0fd17b35ff97829c6fdb7c649fe9e26d280ec9d2775d2f67d49776289164
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 3488
    end_char: 3491
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0002
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 273e-274e
char_span:
  start_char: 5613
  end_char: 7816
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 873931bfed41f1273ce9bdfe33943a355ed9b389084ee2446e916e0aeb25918d
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 5613
    end_char: 5616
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0003
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 274e-275e
char_span:
  start_char: 7816
  end_char: 9855
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e3c2d1eb0169af6132b215ad75dd9292095f094e6e9bf9f50cac0300eab3e093
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 7816
    end_char: 7819
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0004
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 275e-276e
char_span:
  start_char: 9855
  end_char: 11879
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2f0586c367326e3b05b3f44d87f9ba5642575eabadf34c7275a4a3b2ba861538
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 9855
    end_char: 9858
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0005
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 276e-277e
char_span:
  start_char: 11879
  end_char: 13947
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 49f69dce4ac58cf6dbd6e7d151e9c04be83d816aaad23975d2b61fd93edd3d15
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 11879
    end_char: 11882
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0006
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0017
stephanus_span: 277e-278e
char_span:
  start_char: 13947
  end_char: 16168
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e098d7ca746dca0a20635fb3bf8c0462e1bb84d141b82d0bc1f72ac8f676e3e1
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 13947
    end_char: 13950
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0007
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 278e-279e
char_span:
  start_char: 16168
  end_char: 18322
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1459035dcf32f5c70763b333679ccdbbe5c9333551e4d504fa7193a2dccf675d
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 16168
    end_char: 16171
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0008
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 279e-280e
char_span:
  start_char: 18322
  end_char: 20353
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e2fa7ca531f37ed82c2919a7f260e9732a3d5005a73e6ab85bc43f87fc3d5bf1
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 18322
    end_char: 18325
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0009
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 280e-281e
char_span:
  start_char: 20353
  end_char: 22514
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ed0334eb5096136a9a3d04c990486d934b10b09b3f0ead0c07570182622fb0d2
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 20353
    end_char: 20356
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0010
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282a-282e
char_span:
  start_char: 22514
  end_char: 24589
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 11332c538c503d5c6fed7f1cda89f4fa101ae1aa372f6dc062190556e386ed3f
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 22521
    end_char: 22524
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0011
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283a-283e
char_span:
  start_char: 24589
  end_char: 26594
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: acfb3c844b8910ae23217b0832e89ddcca855e7029c3d31742847cfed1582d7f
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 24596
    end_char: 24599
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0012
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 283e-284e
char_span:
  start_char: 26594
  end_char: 28840
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: eac29f4b50dffdaea8704e76be1305ed44fe88802138decb1f849b9ccaa21cde
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 26594
    end_char: 26597
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0013
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 284e-285e
char_span:
  start_char: 28840
  end_char: 31022
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cd2efd5c7a1b3816628d4ac5e058b5ffe5b618aa80de68b14a507be87cdb7717
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 28840
    end_char: 28843
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0014
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 285e-286e
char_span:
  start_char: 31022
  end_char: 33252
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cde01e53fe104d14c8231db61cc10a2e869fad7d694972efeeb0b778bf836c80
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 31022
    end_char: 31025
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0015
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 286e-287e
char_span:
  start_char: 33252
  end_char: 35271
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f692e9cbc844e6f93a8e0a3520862e9e1df7869511a7bd26a488c741452ca2e3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 33252
    end_char: 33255
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0016
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 287e-288e
char_span:
  start_char: 35271
  end_char: 37229
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 73b7abdd412412f13ee822fd84c68f647792c688b84c7d87ab5f76894357e551
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 35271
    end_char: 35274
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0017
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 288e-289e
char_span:
  start_char: 37229
  end_char: 39456
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 563726d0101e11e3b8ffcad06825ccb3f9d3e7b0a7cc0ed9badef8c67f8df79b
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 37229
    end_char: 37232
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0018
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a-290d
char_span:
  start_char: 39456
  end_char: 41253
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e02c82b1330c5b7c8c4b6cfe9e959a6c047aab6070421be5599a026ba7033e3c
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 39463
    end_char: 39466
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0019
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0043
stephanus_span: 291d-291e
char_span:
  start_char: 43030
  end_char: 43304
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 310b8ed11127b7fc64a40bfcbdfeba66bfa7b0c0b8519ba40d41c5151dfee0da
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 43030
    end_char: 43033
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0020
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293a-293e
char_span:
  start_char: 45954
  end_char: 47771
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3523dd5df2a0034046834e44c436e56386d4a4c4fafb260f12f1387c30341ad4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 45954
    end_char: 45957
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0021
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a-294e
char_span:
  start_char: 47771
  end_char: 49958
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9d3cf34a54fc2d0db3f294edddb8787a2cc2bc03a14faa7c8be61d6f0afc6fed
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 47778
    end_char: 47781
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0022
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a-295e
char_span:
  start_char: 49958
  end_char: 52005
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: efd87ec818dc05b4b41121437b30e0c99c6294314d1180d751c2fa253f4120c4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 49965
    end_char: 49968
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0023
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a-296e
char_span:
  start_char: 52005
  end_char: 54176
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 803f0d56dd73ddeb9215a6298952322ab8763a9137cb2cc23d7e23ced635748b
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 52012
    end_char: 52015
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0024
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a-297e
char_span:
  start_char: 54176
  end_char: 56360
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a90ea0eb1858bb365937848abb688691f7fa5174cd80bbf72740ffe33bfc1e6e
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 54183
    end_char: 54186
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0025
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 297e-298e
char_span:
  start_char: 56360
  end_char: 58675
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 849ba4b7abcd022fcf36df5d251d86e3f9fea93c890ad41731e2cff5f8ab690f
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 56360
    end_char: 56363
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0026
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299a-299e
char_span:
  start_char: 58675
  end_char: 60936
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d07778b3394fa6cd0eec2f0500361564d4e2d5e6905bd89cc82a79d7a65d0482
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 58682
    end_char: 58685
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0027
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a-300e
char_span:
  start_char: 60936
  end_char: 62904
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: af6682403e2f21242afae5914c11d13f3055c37b8342e82370aeb40e4d37997a
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 60943
    end_char: 60946
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0028
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a-301e
char_span:
  start_char: 62904
  end_char: 65015
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3e339a47767c62d6d88ae3d3a8d526b82fef27b65af3b528c35d1da7bed778ed
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 62911
    end_char: 62914
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0029
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 301e-302e
char_span:
  start_char: 65015
  end_char: 67134
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: daad0ddea413dd3c4dfe9a46375936ee9e15ca521f4060069ce96c3af6ceb672
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 65015
    end_char: 65018
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0030
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 302e-303e
char_span:
  start_char: 67134
  end_char: 69401
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 179a24272d942948730622e3e77cebe93350735177b9048a43dda0bb0cbeb49d
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 67134
    end_char: 67137
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0031
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0080
stephanus_span: 304a-304c
char_span:
  start_char: 69401
  end_char: 70445
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 012f294ea42dacb1502b34a7e9824bb5a082b2f496c1177729015a5b4853b950
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 69408
    end_char: 69411
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0032
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304c-304e
char_span:
  start_char: 70445
  end_char: 71467
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b5a1cbd254699f5ef9e0c84bf8471232cd8102bfba89a74c5a71a4d542dcf0ba
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 70445
    end_char: 70448
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0033
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0082
stephanus_span: 304e-305b
char_span:
  start_char: 71467
  end_char: 72097
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 51ee0347e648461513e284e77a88dca180f9b3eb14cd8bfa2cb19cdf88e73c90
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 71467
    end_char: 71470
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0034
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 273c
char_span:
  start_char: 4468
  end_char: 4889
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c146331246d87e5ac0b0f6b92a341d128ed14fe251969d744616c795d0ce532d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον πρὸς τὸν Κλεινίαν
    start_char: 4468
    end_char: 4491
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0035
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 273d
char_span:
  start_char: 5006
  end_char: 5079
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 099f4196ec1a841fe3e7ddc541fbdbe0f1f23d53d5d7b0fb671d57379db90c0b
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Εὐθύδημος εἶπεν
    start_char: 4987
    end_char: 5004
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0036
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 273d
char_span:
  start_char: 5079
  end_char: 5236
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 54752fa81c6c71b061a2b41cde1a3eac89196ee007fa912b45e0dfe5155494e9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ θαυμάσας εἶπον
    start_char: 5083
    end_char: 5102
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0037
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 273d-273e
char_span:
  start_char: 5236
  end_char: 5335
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c475f753eefad85e12daae7f8b2ffdfbfeac7ac5a8a1127041c66466b37f0d92
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: ἔφη is third-person singular with no subject beside it, and the only name in the span is the vocative ὦ Σώκρατες, which marks the addressee and so excludes Socrates. The question answered here ends in the dual εἴπετόν μοι and Socrates resumes with the dual λέγετον, so the address runs to the pair; the answer replies in the plural οἰόμεθα. Which brother the singular ἔφη reports is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0038
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0012
stephanus_span: 273e
char_span:
  start_char: 5335
  end_char: 5613
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 64ba6225f92e0b3e513bae6f98008586651cc877c1c378d626936d7c2d755ec9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 5352
    end_char: 5361
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0039
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 273e-274a
char_span:
  start_char: 5617
  end_char: 5906
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2f3433d914e48a0eb56c31a349234aa733cabdd6985115e53cc62a00415154c4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 5617
    end_char: 5975
    text_sha256: 5bda8a834a469ab3d9a7a5475226ee22cdff46a0d598769bee9e04e12057b7c1
  rationale: The span speaks in the first person singular (ἔγωγε … προσαγορεύω, δεόμενος ἔχειν μοι) and addresses its hearers in the dual, naming them in the vocative ὦ Εὐθύδημέ τε καὶ Διονυσόδωρε; a vocative names the addressee, so both brothers are excluded as speaker. The reply that closes the context answers this very challenge (ἀλλ’ εὖ ἴσθι … τοῦτο οὕτως ἔχον) and addresses ὦ Σώκρατες, identifying the party it answers. Context stops at that reply, the next interlocutor switch inside the turn.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0040
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274a
char_span:
  start_char: 5906
  end_char: 5975
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9044cc2e515e80caf8f591b67321449c555197fc76dd2eaf232e09eef6f6c9d3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: "The reporting verb ἔφατον is DUAL: the source reports both brothers as saying this jointly and names no single owner. ὦ Σώκρατες is the addressee vocative and excludes Socrates. A jointly reported utterance has no single terminal owner. The verb also stands inside the edition's {del} … {/del} deletion brackets."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0041
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274a
char_span:
  start_char: 5975
  end_char: 6151
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d3adee1f566614bc541325e8218bf6153fb799b0fc7fb616ae6809cd48585a49
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 5975
    end_char: 6257
    text_sha256: 6acc0f6b11db826efdefc1c7439936faed0f29dac6a4eee3a186df1808095a27
  rationale: The span speaks in the first person singular (μακαρίζω … ἔγωγε, δέ μοι εἴπετον) and puts its question to a pair in the dual (ὑμᾶς, εἴπετον, ἔχετον, σφῷν). The answer that closes the context replies to that question in the first person plural with dual participles (ἐπ’ αὐτό γε τοῦτο πάρεσμεν … ὡς ἐπιδείξοντε καὶ διδάξοντε) and addresses ὦ Σώκρατες, so the questioner is the party the answer names. Context runs from this question to its answer and stops there.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0042
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274a-274b
char_span:
  start_char: 6151
  end_char: 6257
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c2368e475cde83ec8aa513bef81d232f78a0cb97c3956c203c2843ddbfe82a50
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: No reporting verb stands in the span. The answer is given in the first person plural with dual future participles (πάρεσμεν … ὡς ἐπιδείξοντε καὶ διδάξοντε), so the source reports it as the pair's joint reply, and ὦ Σώκρατες names the addressee, not the speaker. Nothing distinguishes which brother pronounced it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0043
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274b
char_span:
  start_char: 6257
  end_char: 6430
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4c55d7f0de883965f33966258fd9430889831ff8afd948ca68d4ecd0068a1b87
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγὼ
    start_char: 6421
    end_char: 6430
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0044
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274d-274e
char_span:
  start_char: 7180
  end_char: 7752
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6cbbf707bfa3f22133e51162c61d5a1041320f0f6721a6462a17dce1a16fd6c7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον οὖν ἐγώ
    start_char: 7184
    end_char: 7197
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0045
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0013
stephanus_span: 274e
char_span:
  start_char: 7752
  end_char: 7798
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4d61a85e191e9d97927ec81a4b2f3d5e083fb5d299b88e9623dcf9deb3bcfc5d
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ὁ Διονυσόδωρος
    start_char: 7800
    end_char: 7814
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0046
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 274e-275a
char_span:
  start_char: 7820
  end_char: 7947
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 810eca9f9bdfb1d2fd70306e37abb824391131260393257a70f0aa51ee10920f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 7835
    end_char: 7844
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0047
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275a
char_span:
  start_char: 7947
  end_char: 7978
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 97b94cbae0288b764906284def119cc1222e1e5d9f7c1935854faae64a02eb1d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: No reporting verb stands in the span. ὦ Σώκρατες names the addressee and excludes Socrates; the first-person plural οἰόμεθα answers for the pair addressed as ὑμεῖς in the preceding question, which leaves out Ctesippus and Cleinias. The question was put ὦ Διονυσόδωρε, but the brothers answer for each other in this turn (ὁ Εὐθύδημος … ἔφη at 8747), so which speaks is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0048
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275a-275b
char_span:
  start_char: 7978
  end_char: 8704
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cd7dc27114f16373538716587e206882ec55ed540f6e7ca36e203ff7ccb84c3c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 8023
    end_char: 8027
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0049
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275b-275c
char_span:
  start_char: 8790
  end_char: 8877
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 73c91921edb754fdba9621e82321beb1dacb50d201162f92cc6f24fbe7ed6f8b
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Εὐθύδημος ἅμα ἀνδρείως τε καὶ θαρραλέως, ἀλλ’ οὐδὲν διαφέρει, ὦ {275c} Σώκρατες, ἔφη
    start_char: 8747
    end_char: 8833
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0050
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275c
char_span:
  start_char: 8877
  end_char: 9030
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 31aa0285f84bacd7fcf4208eff0281e38562d2d2719784bd65ca62574640882a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 8894
    end_char: 8902
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0051
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275d
char_span:
  start_char: 9328
  end_char: 9404
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9ea1abe54169c5f2dfc9a1fa3a3a022491a41d3838e8f7ae22cea35d77783479
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἤρξατο δ’ οὖν ἐνθένδε ποθὲν ὁ Εὐθύδημος
    start_char: 9276
    end_char: 9315
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0052
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275d-275e
char_span:
  start_char: 9541
  end_char: 9666
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dfbdabc9c25f845233b3614d01e3d63e0542329eb2fd29631d41d2be5cfb2f8c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 9549
    end_char: 9558
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0053
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0014
stephanus_span: 275e
char_span:
  start_char: 9759
  end_char: 9855
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e3e4a027e75aff018ecef575fef760c8bf52fb7b4ade15a819c993bc1592dde6
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Διονυσόδωρος προσκύψας μοι μικρὸν πρὸς τὸ οὖς, πάνυ μειδιάσας τῷ προσώπῳ, καὶ μήν, ἔφη
    start_char: 9683
    end_char: 9771
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0055
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276a
char_span:
  start_char: 10071
  end_char: 10111
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 75624b983226df9bc8b3cb80d14bb10c53b2ac3a5dea55ad605172a7e9890350
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Εὐθύδημος, καλεῖς δέ τινας, ἔφη
    start_char: 10058
    end_char: 10091
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0056
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276a
char_span:
  start_char: 10121
  end_char: 10280
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 05294d452fae858ca78bcb069e1e5cbb87befe461abb5ef0f67147ecaaae9187
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a question put in the second person to one respondent, so it names its addressee, not its speaker. No reporting verb and no name stands in it. The series was opened by ὁ Εὐθύδημος (10058), but the preceding formula's subject is not a licensed antecedent for this one, so who asks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0057
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276a
char_span:
  start_char: 10288
  end_char: 10354
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 752a6f24279887337738462c7c9bd1b5db235637a04d03de3efce68d585f6485
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a question put in the second person to one respondent, so it names its addressee, not its speaker. No reporting verb and no name stands in it. The series was opened by ὁ Εὐθύδημος (10058), but the preceding formula's subject is not a licensed antecedent for this one, so who asks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0058
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276a-276b
char_span:
  start_char: 10363
  end_char: 10414
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9899f4fcd6051e44e81aa0307556ee03cc3366998ae2afd6ab6cb797da90bfcf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a question put in the second person to one respondent, so it names its addressee, not its speaker. No reporting verb and no name stands in it. The series was opened by ὁ Εὐθύδημος (10058), but the preceding formula's subject is not a licensed antecedent for this one, so who asks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0059
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276b
char_span:
  start_char: 10414
  end_char: 10432
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fbaef61a7813198172f9e7b709b92df8d8cad0f41c37a8e2ef557b3424bd8e51
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΛΕΙΝ.
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 10363
    end_char: 10629
    text_sha256: 3f438e510692c646daddc45bd4975a4ef0ff544b5f7e7af7c320fc8f49745774
  rationale: "ἦ δ’ ὅς is third person, which in this first-person narration excludes the narrator Socrates. The span answers a second-person question put to a single respondent, and the context names that respondent twice: the source calls him τὸ μειράκιον where he assents by nodding (ἐπένευσε τὸ μειράκιον), and the questioner addresses him ὦ Κλεινία, ὡς σὺ οἴει. Context runs from the question this answers to the vocative that names the answerer, and stops there."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0060
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276b
char_span:
  start_char: 10432
  end_char: 10461
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1913ffcbbee018897dc8442377643b44267ad57867591f39a7db8705c8d1fc61
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a question put in the second person to one respondent, so it names its addressee, not its speaker. No reporting verb and no name stands in it. The series was opened by ὁ Εὐθύδημος (10058), but the preceding formula's subject is not a licensed antecedent for this one, so who asks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0061
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276b
char_span:
  start_char: 10461
  end_char: 10470
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 078ce45236b10276d9b5e4cf874bd2dd3c1778a96179f44c7ae4352ccaf778f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "A bare assent with no in-span cue whatever: no reporting verb, no vocative, no name. The surrounding series names its respondent (ἐπένευσε τὸ μειράκιον, ὦ Κλεινία), but that identifies who answers the series, not who utters this particular assent, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0062
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276b
char_span:
  start_char: 10470
  end_char: 10535
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dbaeddd9a29da35f45fc6a2ca241cbba4523491a8016c92840e92362196de272
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span draws a conclusion addressed to ὑμεῖς in the second person, so it names its addressee, not its speaker. No reporting verb and no name stands in it, and the preceding formula's subject is not a licensed antecedent, so who speaks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0063
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276b
char_span:
  start_char: 10558
  end_char: 10629
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2f9d5b6253c96e8f4bd1cac6af0af4c3a7272eb431f34b1d74c267831e654092
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "The vocative ὦ Κλεινία names the addressee and ὡς σὺ οἴει keeps him in the second person, so Cleinias is excluded as speaker. Nothing else in the span identifies anyone: no reporting verb, no nominative name. The questioner of this series is never named inside the span."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0064
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276c
char_span:
  start_char: 10879
  end_char: 11015
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 21af8f93323535a593187a5492d24a07c7fb6e88023496464c129de160fce577
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἐκδεξάμενος ὁ Διονυσόδωρος
    start_char: 10851
    end_char: 10877
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0065
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276c
char_span:
  start_char: 11015
  end_char: 11024
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e99a2060e99ac9d6fbbcf62f948dfb174a8248f3771a3ea79c41fa89e9a97170
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κλεινίας
    start_char: 11026
    end_char: 11040
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0066
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276c-276d
char_span:
  start_char: 11041
  end_char: 11133
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d1c1048f9947f5e1a980c3b4518aae9c2f46a331096c27ad191ea3ab2381035d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "σὺ ἄρτι Εὐθυδήμῳ ἀπεκρίνω excludes two parties at once: the second person addresses the answerer Cleinias, and Εὐθυδήμῳ refers to Euthydemus in the third person, so neither of them speaks this span. No reporting verb or nominative name identifies who does."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0068
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276d
char_span:
  start_char: 11481
  end_char: 11552
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ac98e4564c4761be90b862247c59e089c4bc3a575351b33691d9eb6dbb90bfd4
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Εὐθύδημος ἐκπεπληγμένους, ἵν’ ἔτι μᾶλλον θαυμάζοιμεν αὐτόν, οὐκ ἀνίει τὸ μειράκιον, ἀλλ’ ἠρώτα, καὶ ὥσπερ οἱ ἀγαθοὶ ὀρχησταί, διπλᾶ ἔστρεφε τὰ ἐρωτήματα περὶ τοῦ αὐτοῦ, καὶ ἔφη
    start_char: 11301
    end_char: 11479
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0069
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276e
char_span:
  start_char: 11614
  end_char: 11676
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 69f5a6cd1026da282cb09363cb2c018998e6bb337709d1bf3991f2c80bc86d56
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Διονυσόδωρος πάλιν μικρὸν πρός με ψιθυρίσας, {276e} καὶ τοῦτ’, ἔφη
    start_char: 11560
    end_char: 11628
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0070
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276e
char_span:
  start_char: 11676
  end_char: 11751
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a572b349af55a25130f7834b3ce29fd73f1478b32296354d46529f65951fc4bd
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 11687
    end_char: 11695
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0071
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276e
char_span:
  start_char: 11751
  end_char: 11810
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cd15ab0e8c6f929691169f9c1a2ca97a25b5e6b3fdf158b1e1125ed4230007a9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: ἔφη is third person, which in this first-person narration excludes the narrator Socrates, and ὦ Σώκρατες names him as the addressee besides. ἡμεῖς ἐρωτῶμεν speaks for the pair who put the questions, so the speaker is one of the two brothers, but the singular ἔφη names neither.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0072
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0015
stephanus_span: 276e
char_span:
  start_char: 11810
  end_char: 11879
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: bc39b5e5ab37ad340bde5077ce8cca903d6af36f901ddbd4147fd1511ff5b14d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 11825
    end_char: 11834
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0073
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12042
  end_char: 12084
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d18f931c5a59e9a18940bc939df49bc70c278608404da36e60d891128bb0993e
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    role: cue
    text: ὁ δὲ ἤρετο {277a} αὐτὸν διὰ τῶν αὐτῶν ὧνπερ τὸ πρότερον
    start_char: 11985
    end_char: 12040
    antecedent_text: τῷ Εὐθυδήμῳ
    antecedent_start_char: 11914
    antecedent_end_char: 11925
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0074
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12084
  end_char: 12094
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1671fff622b666ca59613365efdc97248ad586473ab1834b768bcedae034e79c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: ναί, ἔφη is a one-word assent whose ἔφη excludes only the narrator."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0075
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12094
  end_char: 12109
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cdabba623758f363d0e544363ec2b813a6323d27175651518c28e97c49729c9f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: οὐκοῦν ἅπαντα; is a two-word question with no cue at all."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0076
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12119
  end_char: 12180
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d2b68aeb8b80325201464ffd259f4026940f1a042f23179d507a82aa0142abb0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: it carries no reporting verb, and ἀποστοματίζει is third person."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0077
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12190
  end_char: 12260
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4493346e7b39ad92b424ed18c2dfb6ba5c542e66a09385c1ed985a83a5a4699e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: its ἔφη excludes only the narrator, and σὺ ἐπίστασαι marks the addressee."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0078
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12280
  end_char: 12395
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b1033fed8664e4603403436afe347f94f19f6a59e8a15ce4fa48fc8525b84b34
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below, so Dionysodorus, who takes it over only at 12556, is not a candidate. Both parties are third persons to the narrator, so a reporting verb identifies neither: its ἦ δ’ ὅς excludes only the narrator, and μανθάνεις marks the addressee."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0080
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a
char_span:
  start_char: 12395
  end_char: 12424
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 071c494f4b923896d35279f0942ecd85a6f2795a83b50a515225151a459aa621
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: its ἦ δ’ ὅς excludes only the narrator, and μανθάνω is the speaker's own first person."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0081
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277a-277b
char_span:
  start_char: 12424
  end_char: 12510
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 52d078f98e2dd44e761a7a19963c5ca4f9e4b33cb698222cbd89949a8c554817
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: its ἦ δ’ ὅς excludes only the narrator, and ἐπίστασαι marks the addressee."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0082
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277b
char_span:
  start_char: 12522
  end_char: 12552
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 97f0a970e6a8655759c48fe5a9d8d5a270afebfbf68058e7da66eeadaacd0bae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο ... ὁ δὲ ἤρετο αὐτόν above, καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ below. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: its ἔφη excludes only the narrator, and ἀπεκρίνω marks the addressee."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0083
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277b
char_span:
  start_char: 12699
  end_char: 12813
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ae2566384a36ecbf9ee05649b26d5e26a155e4a620aa9bd8cbf8f374f4ab9b38
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ Διονυσόδωρος ὥσπερ σφαῖραν ἐκδεξάμενος τὸν λόγον πάλιν ἐστοχάζετο τοῦ μειρακίου, καὶ εἶπεν
    start_char: 12605
    end_char: 12697
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0084
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277b
char_span:
  start_char: 12834
  end_char: 12898
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e6e35e80643c48abe45820831273291febf0d2de20dc9b4dea0bdd7dd6e427ab
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: its ἦ δ’ ὅς excludes only the narrator."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0085
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277b-277c
char_span:
  start_char: 12906
  end_char: 12962
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5e00567789095bde804d7aa93c3060cfca368237cbb5bd483ea9b5983ecab7cd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: it carries no reporting verb and no person marking."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0086
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277c
char_span:
  start_char: 12977
  end_char: 13051
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8625a1dc44d1ee421f7add8c730023dbc316286833a4776036ceb79867b4a0d9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: it carries no reporting verb and no person marking."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0087
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277c
char_span:
  start_char: 13051
  end_char: 13061
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ccc90a982bef9cd0295994a5ae3631672782a8a6fad1adae555d3275196a7175
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: οἳ ἂν μή is a three-word answer with no cue at all."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0088
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277c
char_span:
  start_char: 13061
  end_char: 13134
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0a00f44a239651e61ca4bd25a697771544a4975f348aa7515b388136fad27606
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: it carries no reporting verb; ὡμολόγηκας marks the addressee."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0090
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277c
char_span:
  start_char: 13145
  end_char: 13208
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 878437719c51a0fb6408de7397d6f22309a4b3e8ba3b5a57f83d2ffa1b4aaa60
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΛΕΙΝ.
unresolved_reason: "A bounded two-party exchange named at both ends: ὁ Διονυσόδωρος ... καὶ εἶπεν opens it, its first words address ὦ Κλεινία, and the assents are narrated ὡμολόγει ὁ Κλεινίας. Both parties are third persons to the narrator, so a reporting verb identifies neither, and this span has no discriminating cue: it carries no reporting verb and no person marking."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0091
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277c-277d
char_span:
  start_char: 13216
  end_char: 13301
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 857fa754943bb68ea25737efe7845da254087b0695d40decc0687016f4edc638
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ὦ Κλεινία
    start_char: 13258
    end_char: 13267
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ Διονυσόδωρος ὥσπερ σφαῖραν ἐκδεξάμενος τὸν λόγον πάλιν ἐστοχάζετο τοῦ μειρακίου, καὶ εἶπεν
    start_char: 12605
    end_char: 12697
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: καὶ ἐγὼ γνοὺς βαπτιζόμενον τὸ μειράκιον, βουλόμενος ἀναπαῦσαι αὐτό, μὴ ἡμῖν ἀποδειλιάσειε, παραμυθούμενος εἶπον
    start_char: 13383
    end_char: 13494
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0092
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0016
stephanus_span: 277d-277e
char_span:
  start_char: 13383
  end_char: 13947
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: eb039ff17032359edcd64031ca042e54f0959af1ac718c039ca1ed483c311a34
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ γνοὺς βαπτιζόμενον τὸ μειράκιον, βουλόμενος ἀναπαῦσαι αὐτό, μὴ ἡμῖν ἀποδειλιάσειε, παραμυθούμενος εἶπον
    start_char: 13383
    end_char: 13494
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0093
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0017
stephanus_span: 277e-278e
char_span:
  start_char: 13951
  end_char: 15971
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 899b87d4686668401402e6f55215fe83971aa547daaf7a24b0246b869287ac5b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 13951
    end_char: 16168
    text_sha256: 85b6fe7b97e49c6251b5ae5a5accdc8c8d171a0dc1c04987c0ecea7d6135fb71
  rationale: "One continuous speech with no interlocutor switch anywhere in the turn. It speaks in the first person (φημι ἐγώ σοι, ἐγὼ ὑφηγήσομαι αὐτοῖν, ἐγὼ σφῷν ἐνδείξομαι, μοι) and names every other party present either as addressee or as a third-party referent: the two strangers as τὼ ξένω, τούτους and τούτω, then in the vocative ὦ Εὐθύδημέ τε καὶ Διονυσόδωρε; the boy as σέ and in the vocative ὦ παῖ Ἀξιόχου. A vocative names the addressee, so none of the three can be speaking. Context is the whole turn because the speech runs unbroken across it."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0095
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0017
stephanus_span: 278e
char_span:
  start_char: 15971
  end_char: 16168
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 27a87607b9040429d9649ca5a58edbabd8264c51001370707a66f1e9982d6d47
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 13951
    end_char: 16168
    text_sha256: 85b6fe7b97e49c6251b5ae5a5accdc8c8d171a0dc1c04987c0ecea7d6135fb71
  rationale: "One continuous speech with no interlocutor switch anywhere in the turn. It speaks in the first person (φημι ἐγώ σοι, ἐγὼ ὑφηγήσομαι αὐτοῖν, ἐγὼ σφῷν ἐνδείξομαι, μοι) and names every other party present either as addressee or as a third-party referent: the two strangers as τὼ ξένω, τούτους and τούτω, then in the vocative ὦ Εὐθύδημέ τε καὶ Διονυσόδωρε; the boy as σέ and in the vocative ὦ παῖ Ἀξιόχου. A vocative names the addressee, so none of the three can be speaking. Context is the whole turn because the speech runs unbroken across it."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0096
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 278e
char_span:
  start_char: 16172
  end_char: 16188
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5743651a776fe6d093e21edc54b569dc805c7f85d05692c97ce775b36d45c4ef
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0097
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279a
char_span:
  start_char: 16212
  end_char: 16405
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1fe75db82681330348ca74b08415ec04eece2c326519af2825024fbae7e37d3b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 16219
    end_char: 16228
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0098
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279a
char_span:
  start_char: 16413
  end_char: 16597
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f4651037ba08a153f036d2f34b97144382530ed7fa9a08925638215e212cb804
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0099
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279a
char_span:
  start_char: 16597
  end_char: 16611
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d71624fe9c51119400d4760b26a75c7f25403bc92637e5f327cf6d1fbb9cc175
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 16607
    end_char: 16610
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0100
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279a-279b
char_span:
  start_char: 16611
  end_char: 16706
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1ce31136eb606bd0e38f663e5fb32bff5e1b991d3a65bfd91140bd2d0c4a8720
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0101
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279b
char_span:
  start_char: 16717
  end_char: 16798
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9b93d1b1d7c36ce2055782895d358215254cc82b13b53ab3d48138a2576499d2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0102
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279b
char_span:
  start_char: 16808
  end_char: 17061
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 323217b0b8c2920556b2e4a2d49372ca1a7c54822d52285ecc7b21835002d7bc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 16817
    end_char: 16821
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0103
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279b
char_span:
  start_char: 17061
  end_char: 17067
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 477e759c90465a79393191bef8d6d55ac356e2622cf639bdd9659fb6605f913a
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κλεινίας
    start_char: 17069
    end_char: 17083
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0104
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17093
  end_char: 17173
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 95fbdc10ff634746eb6ec4b0056efeb0d92bc89e17bcb962dde47d1b2416c953
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 17099
    end_char: 17108
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0105
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17173
  end_char: 17190
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 761a99c4b5e7a69a840af40f3da6ae01345b227a6230af606f902eee77dccd48
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0106
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17190
  end_char: 17253
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 20fef4a5db910416269b1f71d54ad4b10ed04569e8dfce7afb39755c7809393b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0107
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17253
  end_char: 17283
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 73b3c82a6269ad6d1ee5ab699152448913b8470e6ff1466436123911fa1f7c9e
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ὁ Κλεινίας
    start_char: 17285
    end_char: 17295
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0108
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17296
  end_char: 17388
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 62e39712cb06c4ed491b5d07b78014e609e1c3dfb5462550bba806393725839b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ ἀναμνησθεὶς εἶπον
    start_char: 17297
    end_char: 17322
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0109
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17388
  end_char: 17407
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6197c8cb5e712b035fe1fa61d9c3f41bf36e1cfba0a23cddceb935bdeab35801
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 17399
    end_char: 17406
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0110
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17407
  end_char: 17494
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3648a84dcd7323bee96a95ab671aeccc8ca3db5d9fc0cb60f9dd9c3afc13e800
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΛΕΙΝ.
  context_span:
    start_char: 16211
    end_char: 18322
    text_sha256: 8a33fd8205c9afe92e915101ce9478572c0ac6f37582fe66697f7187b9a78eef
  rationale: Inside the Socrates-Cleinias protreptic (279a-282d), a bounded two-party exchange whose opening and closing anchors are printed at 16190 and 24013 and inside which no nominative naming a third party occurs. This span addresses Cleinias by name (ὦ Κλεινία); a vocative names the addressee, and in a two-party exchange the addressee is not the speaker, so the speaker is the other party, the narrator questioning inside his own narration. Nothing here rests on alternation or on who spoke last.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0111
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c
char_span:
  start_char: 17494
  end_char: 17513
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4eb74db99bf5d2c16e214559142000040e66a71d1cb54c785f28468e22b1972a
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 17509
    end_char: 17512
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0112
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279c-279d
char_span:
  start_char: 17513
  end_char: 17632
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7aea241fe57868e8510acc13ad100c925deabbd38df01a16b00ec2edf951fbeb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ αὖ πάλιν μετανοήσας εἶπον
    start_char: 17514
    end_char: 17547
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0113
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17632
  end_char: 17651
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5a80fca963ce1c825128f9dcd31404810f895db1bf266e35e5291cbec8dfe8bb
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 17640
    end_char: 17643
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0114
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17651
  end_char: 17727
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7636faacf3138e2f2f878725e4cae6b20e12ca5cce07887597d5091d57eb1603
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0115
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17727
  end_char: 17744
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c804a738809eb0299dd0386833b96c7bc4931fa6dcd15bef09d67fce729c409c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0116
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17744
  end_char: 17828
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 23f6f75351efdaadb0059784ee6a427842f804b797e7ae8fa5a1c533498815e8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0117
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17828
  end_char: 17852
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: de01e218198c28f51cb38847069e8919e17956705cbda30bb3cd2fe884be3570
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 17834
    end_char: 17837
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0118
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d
char_span:
  start_char: 17852
  end_char: 17918
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0ee818b648834a6604f9153b4c5ca62e2cbe838f826edf8968c75ce5da07098d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 17868
    end_char: 17877
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0120
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279d-279e
char_span:
  start_char: 17971
  end_char: 18099
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5dd6d6d12262cc40b91d4090238561f1bdcfcc0a4de1042a4148444d4c211bf6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 18023
    end_char: 18027
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0121
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279e
char_span:
  start_char: 18107
  end_char: 18187
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7f72ed7514566eae2dda0890e789db5a440961f516b3eec1891a9ae359fee0e1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 18116
    end_char: 18125
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0122
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279e
char_span:
  start_char: 18187
  end_char: 18196
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 078ce45236b10276d9b5e4cf874bd2dd3c1778a96179f44c7ae4352ccaf778f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0123
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279e
char_span:
  start_char: 18196
  end_char: 18312
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fc57386f746f227fd01e1f5f220a2a5a27a079f909d39c8e4bab78c2fb21370d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0124
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0018
stephanus_span: 279e
char_span:
  start_char: 18312
  end_char: 18322
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7c26577b9fcb99934fab9c14aa9ceb23348901ba2a0622a33334a8d7965c4f15
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0125
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 279e-280a
char_span:
  start_char: 18326
  end_char: 18452
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0465f03a0020279cdba6d3f0d47f437c6c7828f382234fc058c8ce2a25cc3bb3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0126
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280a
char_span:
  start_char: 18452
  end_char: 18464
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4e1d4a2f6041733e3805c7aef28ddffd23575326c65e8e13a9a23f6518b3b2ae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0127
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280a
char_span:
  start_char: 18464
  end_char: 18548
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0c0cfbb81ffd38b2008703b8104d82d882be969fb7b80085369016929bbeee0b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0128
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280a
char_span:
  start_char: 18548
  end_char: 18560
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4e1d4a2f6041733e3805c7aef28ddffd23575326c65e8e13a9a23f6518b3b2ae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0129
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280a
char_span:
  start_char: 18560
  end_char: 18649
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 172ed6bf29d73339ad337045b6d7ad4b1e5c0c4469c9e09ea7e342f111df5574
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 18570
    end_char: 18579
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0130
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280a-280b
char_span:
  start_char: 18660
  end_char: 18833
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3eba68d2623b59bc9555771aa46adb08314e430e98f68fc5ab33f4b2a48dbdb5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0131
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280b
char_span:
  start_char: 19066
  end_char: 19149
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9d6c604cc2afcf26c8b38244cacd131d38e5ae8719e4bdb4c7882af7d6b71f94
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 19084
    end_char: 19088
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0132
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280b
char_span:
  start_char: 19157
  end_char: 19238
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 240f26a16da16f7db614414d11df02eb707f9179d19e6c6fea50f8fe6ee47d32
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0133
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280b
char_span:
  start_char: 19238
  end_char: 19254
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1a6ca9f8a518b11802143f2d097ad4136d37be09c756b367b347b582ee55b377
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 19250
    end_char: 19253
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0134
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280b-280c
char_span:
  start_char: 19254
  end_char: 19420
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0505899a46480daba6ffd21b29ba246e0c4e6fd429b24d1cce390ef0124cb39e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0135
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280c
char_span:
  start_char: 19420
  end_char: 19434
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6b81381acebf9f7ccff6cf54fec0f85bea684c1541ecb9bc22447ffb40676024
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 19430
    end_char: 19433
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0136
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280c-280d
char_span:
  start_char: 19434
  end_char: 19796
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 33ee00b78cac5329e43be968efbca6e6987ab4b67ce6954e7d1b0237b7f0df74
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0137
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d
char_span:
  start_char: 19796
  end_char: 19810
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1cf065620a54bd851143b8502dbdfb4a767fbb0077e36a99cd9aa81a38d1aa6e
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 19806
    end_char: 19809
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0138
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d
char_span:
  start_char: 19810
  end_char: 19959
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6908afa30e6ed98f35932e5973adabe5813b4ea95eba5ab55c23b42d6331d2dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0139
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d
char_span:
  start_char: 19959
  end_char: 19980
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d21ede3b4c47973065dcfea6e1681dcb946380cc2b8f761dfa2ca5b9654dc35d
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ὦ Σώκρατες
    start_char: 19969
    end_char: 19979
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0140
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d
char_span:
  start_char: 19980
  end_char: 20136
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 187184234bce8fc29092a045db6f4857bcab7dc0cc68d20f5ef7abe6f0bcffbc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 19990
    end_char: 19994
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0141
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d
char_span:
  start_char: 20136
  end_char: 20150
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 25d11c3de8fa8b0382fbe972e52c2baf4df78b4634461e338cb508050de711ad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0142
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280d-280e
char_span:
  start_char: 20150
  end_char: 20272
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8e7461f741947c0885edf3cb20c61550b3eab17eb41669d85333ba9745ebef67
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΛΕΙΝ.
  context_span:
    start_char: 18322
    end_char: 20353
    text_sha256: e2fa7ca531f37ed82c2919a7f260e9732a3d5005a73e6ab85bc43f87fc3d5bf1
  rationale: Inside the Socrates-Cleinias protreptic (279a-282d), a bounded two-party exchange whose opening and closing anchors are printed at 16190 and 24013 and inside which no nominative naming a third party occurs. This span addresses Cleinias by name (ὦ Κλεινία); a vocative names the addressee, and in a two-party exchange the addressee is not the speaker, so the speaker is the other party, the narrator questioning inside his own narration. Nothing here rests on alternation or on who spoke last.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0143
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280e
char_span:
  start_char: 20272
  end_char: 20286
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5a1f90f3869783544d0f404e6def685eeb641d9a46d29b77e5e0a9fb0a298770
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0144
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280e
char_span:
  start_char: 20286
  end_char: 20341
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 88465a25b0d546858dc237b83b12fda04684af8eba536e7438603009e1d57e42
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 20296
    end_char: 20305
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0145
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0019
stephanus_span: 280e
char_span:
  start_char: 20341
  end_char: 20353
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8b858fe7c82aa1945761b0035fe15d7c7da0ddf5a7c89640eae3e4b3f1429efe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0146
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 280e-281a
char_span:
  start_char: 20357
  end_char: 20543
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0a5e2639cb697a9cfce897260f43efd665a94b7f086a021bc9491e70b5c2d098
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 20367
    end_char: 20376
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0147
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281a
char_span:
  start_char: 20554
  end_char: 20679
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f9687c7581d4a27a8019513a914b749b45c05fd88cc402ce5b0f4ec80c18de8e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0148
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281a
char_span:
  start_char: 20679
  end_char: 20693
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6b81381acebf9f7ccff6cf54fec0f85bea684c1541ecb9bc22447ffb40676024
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 20689
    end_char: 20692
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0149
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281a
char_span:
  start_char: 20693
  end_char: 20778
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8f950b7f4424177f8c89f6ff5aa4aec77d7a628e138249581e5b9840d7a8d0fa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0150
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281a-281b
char_span:
  start_char: 20786
  end_char: 20999
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7ce00b1784c03c860169cf10839d97813b88453c0480598a824640fa5a1b6d81
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 20796
    end_char: 20805
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0151
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281b
char_span:
  start_char: 20999
  end_char: 21018
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 381db6980423cc747f2d8622990163184a807b03ea810b535cafe6267202e9ec
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 21010
    end_char: 21017
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0152
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281b
char_span:
  start_char: 21018
  end_char: 21135
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5ebeb95bbb6020b9cb7116296d9b8431a0fd48694d1db0f8feef27756a4ddb01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0153
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281b-281c
char_span:
  start_char: 21145
  end_char: 21486
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a5dd7cd7b959e0283c2a48413fd17bef4af3b331197e4738b70986da566cb349
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 21167
    end_char: 21176
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0154
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21486
  end_char: 21500
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d71624fe9c51119400d4760b26a75c7f25403bc92637e5f327cf6d1fbb9cc175
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 21496
    end_char: 21499
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0155
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21500
  end_char: 21562
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 12746637b14609cb369724c80e5c773ae21062943a0a98a547c3daea49ca3da3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0156
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21562
  end_char: 21574
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 62f5854c1319f1afc576b9a621638eb8148d82f694b8aca91b7394a43eb8e9fd
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 21570
    end_char: 21573
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0157
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21574
  end_char: 21604
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c0f24c8ed76dc9d5a2e95f21d89c32b2c52d9d36ccbee04c6eb54d375d2f4d66
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0158
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21604
  end_char: 21613
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5be4d74317ab86b57900aaeaeb62e3af18a763a2ae163c3c243b78a0df773517
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0159
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21613
  end_char: 21642
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 80e31d417162f66b8440b8d4bbda3e8a4a460b5775e89f5d2399b941451b31d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0160
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21642
  end_char: 21650
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ea92834113bf8ea6882cc8990af3f99e400bfa7442dfdce2bb717220779dae84
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0161
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21650
  end_char: 21712
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b76232b1fb8e5e43ada75a0cb42b70212063a5af028b44d9ae8b4a3b74478276
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0162
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21712
  end_char: 21720
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0934c1f40e06905c853ba9ae5aaebd2ee3b152ed7160da1b1412d9c3eb8145df
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0163
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c
char_span:
  start_char: 21720
  end_char: 21755
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9eba6acbbfc460f8aced45a09630f0cf3baf9f48fee0dcb8ffd44271aa039fdb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0164
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281c-281d
char_span:
  start_char: 21766
  end_char: 21840
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2177e00e28f01ce2448caea903ead2a561948761dc90c01c926a92d5b95466e4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0166
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281d-281e
char_span:
  start_char: 21880
  end_char: 22296
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 57ab32e278d6d545037376754341d7b6fcf8e4a953feb7aaa616195ef8491efd
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 21897
    end_char: 21901
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0167
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281e
char_span:
  start_char: 22296
  end_char: 22343
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e71e43b4b4ad281b587a9bf4695bb5e0cd76a1f43ff40d2906824514df2b0bbe
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 22307
    end_char: 22310
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0168
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0020
stephanus_span: 281e
char_span:
  start_char: 22343
  end_char: 22503
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dad76f1d3c614b2ce293b9617bff8f929058d75a3f0e468a77a055201b4e731c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "The exchange is bounded and two-party — opened by ἔφη ὁ Κλεινίας (16190) and closed by κἀγὼ ταῦτα ἅσμενος ἀκούσας … ἔφην (24013) — so the alternatives really are just these two. What this span lacks is an in-span cue: no reporting verb marking grammatical person, no vocative, no name. anchored_dialogue_turn requires one, and turn-taking alone may not supply it, so both parties stay open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0169
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282a
char_span:
  start_char: 22525
  end_char: 22873
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 878d9c5f83637f2ef38925e4e5e12b878c1377df36ffff7dbd38c2acb7c9cd5e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 22541
    end_char: 22545
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0170
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282a
char_span:
  start_char: 22873
  end_char: 22883
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1671fff622b666ca59613365efdc97248ad586473ab1834b768bcedae034e79c
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 22879
    end_char: 22882
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0171
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282a-282b
char_span:
  start_char: 22883
  end_char: 23335
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3cb4cbb5199bb15f50fef47c0ec9c94ebc6dccc9e32ad3a9afc6f0d36106b14e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 23319
    end_char: 23327
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0172
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282b-282c
char_span:
  start_char: 23335
  end_char: 23386
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1f84c86529ac9c2f4eda7d94318f61a502cf5bc74ddc3ab371f89f4692051322
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 23378
    end_char: 23385
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0173
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282c
char_span:
  start_char: 23386
  end_char: 23559
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 47770120b81b59771da077fe558902e94d120acdccda63803c7460efc6920871
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 23410
    end_char: 23419
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0174
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282c
char_span:
  start_char: 23559
  end_char: 23611
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f1918c6d4987ef5b54cfe632c6bdb3b3abbff06633bc4d0c58baa9c77ffc068f
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 23573
    end_char: 23576
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0175
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282c-282d
char_span:
  start_char: 23611
  end_char: 23957
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1c7d4f766920db4aa7d379ced99180b1458465685229fee4f4bd6c48443d3264
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ ἐγὼ ἡσθεὶς εἶπον
    start_char: 23612
    end_char: 23632
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0176
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282d
char_span:
  start_char: 23957
  end_char: 24009
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9d45ca744e3584b90eff7dabf5d38aba5e2906b0ef97f744ed7169a24403e439
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 23972
    end_char: 23975
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη {279a} ὁ Κλεινίας
    start_char: 16190
    end_char: 16211
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: κἀγὼ ταῦτα ἅσμενος ἀκούσας, τὸ μὲν ἐμόν, ἔφην
    start_char: 24013
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0177
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0021
stephanus_span: 282d-282e
char_span:
  start_char: 24009
  end_char: 24589
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b347b760038e297aab7dea8a3531ea3e326c97506864a0087fbd57d8282d01a2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 24054
    end_char: 24058
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0178
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283b
char_span:
  start_char: 25129
  end_char: 25308
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ffa31159a461a7e64ca260065c3c4be46b83fde9fa2ad4f8de5b3c5199f71c3c
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ οὖν πρεσβύτερος αὐτῶν, ὁ Διονυσόδωρος, πρότερος ἤρχετο τοῦ λόγου
    start_char: 24823
    end_char: 24889
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0179
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25566
  end_char: 25628
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c830c148c31df887f2ef227716abed89a1d14063578a433a538cae9ebf611817
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Διονυσόδωρος, σκόπει μήν, ἔφη
    start_char: 25550
    end_char: 25581
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0180
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25628
  end_char: 25681
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b67830cfe6041622e65ed0c420313a43e47766d4b97bb136918300670d49a355
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 25639
    end_char: 25648
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0181
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25681
  end_char: 25731
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e1c4c9ddb484bfca1199fc1322f579433251b6677131ee2224452428381a5ebe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ἔφη is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. No nominative name and no vocative identifying a speaker stands in it, and the preceding formula's own subject is not a licensed antecedent, so which of the eristic questioners speaks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0183
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25731
  end_char: 25745
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ac1be5984916a8fd9f21a2143af4edc9f9211efc1b472787d2e279fad1d9eb41
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The question it answers was put to ὑμεῖς, the whole company, so the source does not even fix a single respondent, and turn-taking alone may not supply one."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0184
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25745
  end_char: 25797
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4903c2e02a1d2f1c05b3567edb59656517981b68765dc95e62d23bf8e9b43ca9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ἦ δ’ ὅς is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. No nominative name and no vocative identifying a speaker stands in it, and the preceding formula's own subject is not a licensed antecedent, so which of the eristic questioners speaks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0185
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c
char_span:
  start_char: 25797
  end_char: 25849
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a339ed36c2fbeb52d13670c45b02865dce2d6e2d844d383379ec75e22324b22d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 25827
    end_char: 25836
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0186
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283c-283d
char_span:
  start_char: 25849
  end_char: 25921
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2005e8b430d87cd8db6b906b9ccff69162489a3d907f81730e5341da24a4737c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ἔφη is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. No nominative name and no vocative identifying a speaker stands in it, and the preceding formula's own subject is not a licensed antecedent, so which of the eristic questioners speaks here is undetermined.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0188
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283d
char_span:
  start_char: 25934
  end_char: 26014
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: befd44bd89030c71b19f6907a11883085d71d86df8393ab188648ed6a34aed15
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The question it answers was put to ὑμεῖς, the whole company, so the source does not even fix a single respondent, and turn-taking alone may not supply one."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0190
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283d-283e
char_span:
  start_char: 26075
  end_char: 26305
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9325ae0dfed35af965b688ab8389c306d3199940bc73927b0f99addd22546e1b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ἔφη is third person and the resumptive ὁ δέ stands in contrast with the narrator's own καὶ ἐγὼ … ἐθορυβήθην, so both exclude Socrates as speaker. But ὁ δέ names nobody, its only available antecedent is the preceding formula's own subject — which the carry-forward ruling forbids — and no vocative or nominative name identifies the questioner.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0192
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0022
stephanus_span: 283e
char_span:
  start_char: 26377
  end_char: 26594
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3129709b89d53459b8900d0fd5a009e415ac3367dd9f559a16b071059c5964c2
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Κτήσιππος ἀκούσας ἠγανάκτησέν τε ὑπὲρ τῶν παιδικῶν καὶ εἶπεν
    start_char: 26309
    end_char: 26375
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0193
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 283e
char_span:
  start_char: 26598
  end_char: 26675
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b91237518e02c56ed7e42d35614cae0dc5cb566eeeed4d0bcd43d7b161ed3a98
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ Κτήσιππε, ὁ Εὐθύδημος
    start_char: 26609
    end_char: 26637
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0194
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 283e
char_span:
  start_char: 26675
  end_char: 26707
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5de7a8f96760218a02afa9e1b88f7e7ed7ab1dd61865fe88b5325182a7e5b8c7
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΤΗΣ.
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 26598
    end_char: 27231
    text_sha256: c8e2dd02ece086ff38332cd68706b61403594d85cb88a78d3db11e1322d12721
  rationale: ἔφη is third person, which in this first-person narration excludes the narrator Socrates. The question this answers is put by ὁ Εὐθύδημος to ὦ Κτήσιππε (26609-26637), naming the respondent, and the source names that same respondent twice more inside the context as the giver of these answers (ἔφη ὁ Κτήσιππος, 26874 and 27184). Context runs from the named question to the second of those namings and stops there.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0195
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 283e-284a
char_span:
  start_char: 26707
  end_char: 26776
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fd11f725c83e6a6d297720a3ac85b8eaaed3e3a4c6eed4c2ace89020285db7ac
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0196
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26776
  end_char: 26790
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 13948bf48bd2305430dac43b51c9ee7305d5c262a6517dcfc898952429ebe07e
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΤΗΣ.
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 26598
    end_char: 27231
    text_sha256: c8e2dd02ece086ff38332cd68706b61403594d85cb88a78d3db11e1322d12721
  rationale: ἔφη is third person, which in this first-person narration excludes the narrator Socrates. The question this answers is put by ὁ Εὐθύδημος to ὦ Κτήσιππε (26609-26637), naming the respondent, and the source names that same respondent twice more inside the context as the giver of these answers (ἔφη ὁ Κτήσιππος, 26874 and 27184). Context runs from the named question to the second of those namings and stops there.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0197
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26790
  end_char: 26861
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 460e069633061bbf7d6f1e39a4c2d332bc81ff063f4813f1645b87fe8a0d8712
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0198
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26861
  end_char: 26873
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 285bf77b207a3a2c1ae4fc57a1aedb3989e7e51f564e6f64408c5e4185667133
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 26874
    end_char: 26889
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0199
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26890
  end_char: 26951
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4acdef664494d2f6e189375cba14b248b89a86aebf3ad3781981e4bb1e158941
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0200
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26951
  end_char: 26960
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 078ce45236b10276d9b5e4cf874bd2dd3c1778a96179f44c7ae4352ccaf778f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0201
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 26960
  end_char: 27001
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 39e29a862a4072a78c9a767776e44b75da13d2761a62cc199cfe346e603d07e7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "ἔφη is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. Nothing else in it identifies anyone: no nominative name, no vocative naming a speaker. The eristic exchange here runs four ways, so it is not a two-party bound either, and which questioner speaks is undetermined."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0202
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a
char_span:
  start_char: 27001
  end_char: 27006
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2b837410d88081471a0c0bb64ea298e7f52fccbbca3fb920063b1b37f49f7c6e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0203
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284a-284b
char_span:
  start_char: 27006
  end_char: 27150
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9bb0a9d24a451dbabc52ffa4a55820f8528a09877eea50ccde042b72e36a64cc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: Two exclusions, but not a third. Διονυσόδωρος is named in the third person (ὥστε ὁ Διονυσόδωρος, εἴπερ λέγει τὰ ὄντα), so he is not speaking, and κατὰ σοῦ addresses the answerer Ctesippus, so he is not either. No reporting verb stands in the span, so nothing separates the narrator from the remaining questioner.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0205
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27150
  end_char: 27231
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6c1d685c4fae49c526574716a88d34c749d56de36f9341a9cf375a27d32b8db3
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 27184
    end_char: 27199
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0206
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27252
  end_char: 27292
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a5ec5ef3a335ba747bcd52d9b9e0c616a0db22e77d47685472e0a395be130bcc
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Εὐθύδημος, τὰ δὲ μὴ ὄντα, ἔφη
    start_char: 27239
    end_char: 27270
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0207
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27292
  end_char: 27303
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 222c16ad14a9d5afaa89ee7f80dba5c9beefd46039a7834f4352af24dee7d5b0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0208
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27303
  end_char: 27349
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ace74156c7413f5df1225e7e94ba9a7ff001766e1dc2154f7cae87763b82890b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0209
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27349
  end_char: 27358
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 52ef2675d837031a12e89db9f0c0b13337d2fb195480d30e965712e483415bf6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0210
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27358
  end_char: 27472
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6abc8853e0213a601066fdee3b98f346f0dc0e4faf829e36cd7a2d5aa9e67bf9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0211
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27472
  end_char: 27489
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4e179d94470a9b7ce1adcbd6ea7e271589b264c0b6d4022cab83953db884b31a
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 27491
    end_char: 27506
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0212
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27507
  end_char: 27568
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fe15ffea52b17ab8a3f992f34df874fdf74ce9942dc48307c85458e1ab1d184a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0213
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b
char_span:
  start_char: 27568
  end_char: 27596
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b2b7be58e184b9048477d8b7773e1791d04a19debcc06f0936f07ca0fb9a4551
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΤΗΣ.
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 27472
    end_char: 27596
    text_sha256: 8e688e56fae1431bb5ce5b41054731c935b46f05017b2128ffa26a4a838e5957
  rationale: ἦ δ’ ὅς is third person, which in this first-person narration excludes the narrator Socrates. The context opens on the immediately preceding answer of the same series, which the source closes by naming its speaker outright (—οὐκ ἔμοιγε δοκεῖ, ἔφη ὁ Κτήσιππος, 27491-27506); this span is the next answer in that same run of questions put to him. Context stops at this span.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0214
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284b-284c
char_span:
  start_char: 27596
  end_char: 27640
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d8bfadfe79745a13a1e0f3a2216194cd938dbfda0b8103e3585712614de52972
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0215
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284c
char_span:
  start_char: 27640
  end_char: 27645
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2b837410d88081471a0c0bb64ea298e7f52fccbbca3fb920063b1b37f49f7c6e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0216
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284c
char_span:
  start_char: 27645
  end_char: 27689
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a91dd7de8e61dc5dff9ae51c18c7411785ea5909c6eb2ed8066b02c5b84f2e45
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0217
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284c
char_span:
  start_char: 27701
  end_char: 27926
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 22c6869c4b5371517d48b35dbc43c7c9321dbf509256c0a59ddbb5ee935795ca
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 27701
    end_char: 28025
    text_sha256: a19e72c6bd4078c6b75c9cd95441bfabeed6170daaad88776173cb0032e2fd89
  rationale: Three exclusions fall out of the span itself. ἔφη is third person, which in this first-person narration excludes the narrator Socrates. Διονυσόδωρος is named in the third person (εἴπερ λέγει Διονυσόδωρος), so he is not the speaker. σὺ δὲ ὡμολόγηκας addresses the answerer, whom the next utterance names outright (νὴ Δία, ἔφη ὁ Κτήσιππος, ὦ Εὐθύδημε, 27938), and that same naming addresses Euthydemus as the party just spoken to. Only Euthydemus is left.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0218
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284c
char_span:
  start_char: 27926
  end_char: 28025
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 568b3b916c192764ff67b17aa294cd39bcf8ff3f000ca981d70363210f9f456c
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 27938
    end_char: 27953
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0219
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284c-284d
char_span:
  start_char: 28025
  end_char: 28127
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7da47b9ae33547b90cc1503712c56922263b663812ca13d81a18088b60847a50
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 28041
    end_char: 28059
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0220
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d
char_span:
  start_char: 28127
  end_char: 28190
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e7856e5dc88757cce16060334533e58627ff8d79565f6b687bf377c272982d65
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΤΗΣ.
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 28025
    end_char: 28190
    text_sha256: f8023a4534b75c25c6acfacdac22e34d2317b237d500b65529f79d0b89a98452
  rationale: ἔφη is third person, which in this first-person narration excludes the narrator Socrates. The question it answers is spoken by ὁ Διονυσόδωρος (named at 28041-28059) and addressed ὦ Κτήσιππε; a vocative names the addressee, so the party asked — and therefore the party answering here — is Ctesippus, while the named asker is excluded. Context runs from that named question to the end of this answer.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0221
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d
char_span:
  start_char: 28190
  end_char: 28251
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c8fd73008b9ed2ea0547640bf22f47bf4759fa09ea802325babd5d2597653df8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "ἦ δ’ ὅς is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. Nothing else in it identifies anyone: no nominative name, no vocative naming a speaker. The eristic exchange here runs four ways, so it is not a two-party bound either, and which questioner speaks is undetermined."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0223
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d
char_span:
  start_char: 28262
  end_char: 28330
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9d2ceef3c82dc94d4faa7334f6fb7fa24e023c00e6bb539564495a776b63bc3d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0224
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d
char_span:
  start_char: 28330
  end_char: 28339
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 95ba7a5ff36f77cb0a700c51fafc9a8f8470647bb49a5110774d3345050a5a43
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "Nothing in the span identifies a speaker: no reporting verb, no vocative, no nominative name. The eristic exchange here runs four ways rather than two, so no bounded two-party frame narrows it either, and turn-taking alone may not supply an owner."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0225
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d
char_span:
  start_char: 28339
  end_char: 28420
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 92d79e289671a520c5a34700cc1c5cb8df27d1af026f71ed8c0869e60fa9680e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: ἔφη is third person, which in this first-person narration excludes the narrator Socrates, and the vocative ὦ Κτήσιππε names the addressee, excluding him too. That leaves the two brothers, and the singular ἔφη names neither of them.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0226
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284d-284e
char_span:
  start_char: 28420
  end_char: 28613
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4a057581348c4ba798b7312e21af57dfc25dbac4609e88f4b3ac5af6b620734f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: "ἦ δ’ ὅς is third person, which in this first-person narration excludes the narrator Socrates as the speaker of this span. Nothing else in it identifies anyone: no nominative name, no vocative naming a speaker. The eristic exchange here runs four ways, so it is not a two-party bound either, and which questioner speaks is undetermined."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0227
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284e
char_span:
  start_char: 28613
  end_char: 28690
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 90e33cc6086997f32d9e74ef48f7432c70443e41407da54f634adaa35756c8aa
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Εὐθύδημος
    start_char: 28633
    end_char: 28648
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0228
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284e
char_span:
  start_char: 28690
  end_char: 28781
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8c0e3dd834f083af5a379d1d7f3a0022222e9c03ccdb18050ea834919f9f5826
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 28706
    end_char: 28721
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0229
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0023
stephanus_span: 284e
char_span:
  start_char: 28781
  end_char: 28840
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9a00093ce17651aa8155ec630a314559c880169933e2e57e3db7d93dc847fd4e
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 28790
    end_char: 28808
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0230
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 284e-285a
char_span:
  start_char: 28844
  end_char: 29066
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8d2107c1175446b1eb4e83838e9ecbddf6b34356fa8d8a820f7fc73eb280fb07
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 28844
    end_char: 30127
    text_sha256: f9e11b5e284887c23f491cb59dde3d56093dc4ecf4cc97e3213833806781755c
  rationale: "In-span ἦ δ’ ὅς is third person, so the narrator — who marks his own speech ἦν δ’ ἐγώ / ἔφην — is not the speaker, and the in-span vocative ὦ Διονυσόδωρε names the addressee, excluding him. The narration inside this turn identifies the two quarrelling parties: they seemed ἀγριωτέρως πρὸς ἀλλήλους ἔχειν, whereupon Socrates teased τὸν Κτήσιππον, addressed him ὦ Κτήσιππε and urged μὴ ὀνόματι διαφέρεσθαι — the word-quarrel (ἐξολωλέναι) this span presses. Euthydemus is no party to it. Context stops at the switch to Ctesippus’ reply."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0231
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285a-285c
char_span:
  start_char: 29130
  end_char: 30127
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ead427d2a87df395bc3c08cf71e96f9578c7f26206a3bcb0adc06589bc0a8b81
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: προσέπαιζόν τε τὸν Κτήσιππον καὶ εἶπον
    start_char: 29130
    end_char: 29168
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0233
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285c-285d
char_span:
  start_char: 30148
  end_char: 30612
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 83bdfcead054bc15beec6218024fa6a4763aa5202ebbd99546fb2dc3a865fe16
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος, ἐγὼ μέν, ἔφη
    start_char: 30135
    end_char: 30160
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0235
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285d-285e
char_span:
  start_char: 30634
  end_char: 30702
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 499f9e0f8c5e289f08e72be3b4850f055a5555243c549fbf2f47320453715d4b
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: καὶ Διονυσόδωρος, ὡς ὄντος, ἔφη
    start_char: 30616
    end_char: 30647
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0236
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285e
char_span:
  start_char: 30702
  end_char: 30788
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 71304bcf444729613243bbc046aa67713d46d3442baf8a43e046b6a4fc0f00ce
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 30612
    end_char: 30788
    text_sha256: 7cb3c39e9ccdd2222e5383d55a315e31d536130016d933ebd4bb6e624b80cb58
  rationale: In-span ἔφη is third person, excluding the narrator; the in-span vocative ὦ Διονυσόδωρε names the addressee, excluding him. The span answers the question opening the context, which the named formula καὶ Διονυσόδωρος, ὡς ὄντος, ἔφη attributes to Dionysodorus and which addresses ὦ Κτήσιππε; the answerer of a question put to a named addressee is that addressee, so Euthydemus is excluded too. Context runs from the opening of that question to the next interlocutor switch.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0237
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285e
char_span:
  start_char: 30788
  end_char: 30875
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6ccc0dfac116549adfbdb96193fcbf4ca4668bb435d1f44d80050e661009c696
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 30702
    end_char: 30875
    text_sha256: 443c5052da18bbbcd05ffb39ca79c68634d42fb7ffab244343d4a6b9ee98a6ec
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the question closing the preceding utterance, ἢ σύ, ὦ Διονυσόδωρε, οὐκ οἴει εἶναι ἀντιλέγειν; — a vocative naming Dionysodorus as its addressee, so the reply is his, and Euthydemus is excluded because the question was put to Dionysodorus by name. The span’s own second person σύ γ’ ἄν ἀποδείξαις addresses that questioner, excluding Ctesippus. Context runs from the question to the next switch.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0238
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285e
char_span:
  start_char: 30875
  end_char: 30971
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a82d267af2cb6fe46636ccf58f0ca09a5613b6c35f4bfccf32b84c91cb7c8c3d
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 30788
    end_char: 30971
    text_sha256: e4e8b39b002437a2674c29a78f8ebd6fbcb6796b52869e413a9452c9190d6b2e
  rationale: "The two printed segments are one utterance: ἔφη· is parenthetical and no {p} paragraph marker separates them, whereas every other turn in this exchange opens with one. In-span ἔφη is third person, excluding the narrator. Its first person σοι ἀποδείκνυμι answers the preceding σύ γ’ ἄν ἀποδείξαις, so the speaker is that second person’s addressee, Ctesippus. The third-person Κτησίππου Διονυσοδώρῳ substitutes names into the opponent’s own generic οὐδενὸς ἀντιλέγοντος ἑτέρου ἑτέρῳ and is not third-person reference away from the speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0240
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285e
char_span:
  start_char: 30971
  end_char: 31007
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 83a991cf1ecd23f965c7d96d857f5a050bfa99e6ffa24672972b1864b0158336
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: No reporting verb, no person marking and no vocative stands in this span, so nothing in it identifies a speaker. Its second person ὑπόσχοις and anaphoric τούτου address the party who has just said σοι ἀποδείκνυμι, which excludes Ctesippus; Socrates, Euthydemus and Dionysodorus each remain possible and no in-span cue separates them. Assigning it to Dionysodorus would rest on turn-taking alone.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0241
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0024
stephanus_span: 285e
char_span:
  start_char: 31007
  end_char: 31022
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 09acc1ce03527daec98a5e832d573014d77ffe8e6be15982ca60eba00785d183
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 30875
    end_char: 31022
    text_sha256: 5041c18a09a0742897f6b002acf7ae4cb12ba2286028042b24fd561c7a789c04
  rationale: In-span ἔφη is third person, excluding the narrator. The span assents to the immediately preceding question ἦ καὶ ὑπόσχοις ἂν τούτου λόγον;, whose second person ὑπόσχοις and anaphoric τούτου address the party who has just said σοι ἀποδείκνυμι — Ctesippus — so the assent is his. The question’s own speaker is undetermined, but its addressee is fixed by that anaphora, which is what decides this span. Context opens at the ἀποδείκνυμι utterance.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0242
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 285e
char_span:
  start_char: 31026
  end_char: 31076
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 76ee03550cbd1d47022d90b9e817b4217375be75d37b3fbd926c823ced32f551
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: In-span ἦ δ’ ὅς is third person, so the narrator — who marks his own speech ἦν δ’ ἐγώ / ἔφην — is excluded, but nothing in the span names its speaker. The questioner is identified only later in the turn, past two bare formula-free replies (πάνυ γε, ὡς ἔστιν) that a context may not cross. Euthydemus, Dionysodorus and Ctesippus each remain open here.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0244
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 285e
char_span:
  start_char: 31076
  end_char: 31085
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 078ce45236b10276d9b5e4cf874bd2dd3c1778a96179f44c7ae4352ccaf778f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: A bare assent with no reporting verb, no person marking and no vocative. It answers the preceding question, whose own speaker is undetermined, so not even the questioner can be excluded, and all four parties speaking in this scene remain open. Taking it for Ctesippus would rest on turn-taking alone.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0245
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 285e
char_span:
  start_char: 31085
  end_char: 31126
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dc5037a1a242c915b998fc82b4e23738034a891d6b3f1b4ef6ca06211c8568ce
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking and no vocative, and it stands between two bare formula-free replies, so adjacency fixes nothing either. All four parties speaking in this scene remain open. The page marker {286a} falls where this edition would print the speaker dash, which is why the answer ὡς ἔστιν was drafted inside this span.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0599
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286a
char_span:
  start_char: 31133
  end_char: 31142
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 90d9c004ee24c90c93548e069ee2fd5f9e1f58d11dc836d76383f977648ea1d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: A bare two-word answer with no reporting verb, no person marking and no vocative. The question it answers is itself unattributed, so no party can be excluded from it and all four speaking in this scene remain open. Split out of the preceding record, which had swallowed it across the page marker {286a}.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0246
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286a
char_span:
  start_char: 31142
  end_char: 31258
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 448ea38ae27963d9dc907c9d88f20f8d53eaf5c2d2fd35efb92454793434a052
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 31142
    end_char: 31930
    text_sha256: 2ca065793b1e94c16a5e39faf2f5e0bfdfff70f2c4b4513b5944424de859a0a8
  rationale: "In-span ἔφη is third person, excluding the narrator; the in-span vocative ὦ Κτήσιππε names the addressee, excluding him; and ἐπεδείξαμεν is first person plural — the pair of visiting brothers who had just made that demonstration. Between those two the context decides: it closes where Ctesippus falls silent and the narrator, marvelling at τὸν λόγον just pressed, asks its author πῶς, ἔφην, ὦ Διονυσόδωρε, λέγεις and expects its truth παρὰ σοῦ. Every speaking turn inside the context is formula-marked and the assents between are third-person narration, so no silent switch is crossed."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0247
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286a
char_span:
  start_char: 31258
  end_char: 31332
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e11c124301e9c77e23d52c26f60594ec5357e28a8a5e49c57e145b6ad7acb25e
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ Κτήσιππος
    start_char: 31276
    end_char: 31295
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0248
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286a
char_span:
  start_char: 31332
  end_char: 31452
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fef7b264b98d441b2c1f38415eeab1e042886a50b21b780ace757d1b67a06d6d
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 31142
    end_char: 31930
    text_sha256: 2ca065793b1e94c16a5e39faf2f5e0bfdfff70f2c4b4513b5944424de859a0a8
  rationale: In-span ἦ δ’ ὅς is third person, excluding the narrator, who marks his own speech ἦν δ’ ἐγώ. The span answers the question closing the preceding utterance, which the named formula ἦ δ’ ὃς ὁ Κτήσιππος attributes to Ctesippus and which frames the pair as ἐγώ τε καὶ σύ; this span continues that pair (ἀντιλέγοιμεν ἂν ... ἀμφότεροι), so its speaker is Ctesippus’ σύ. The context closes where Ctesippus falls silent and the narrator asks the author of τὸν λόγον πῶς, ἔφην, ὦ Διονυσόδωρε, λέγεις, which names that party; every speaking turn inside is formula-marked.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0249
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286a-286b
char_span:
  start_char: 31463
  end_char: 31622
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9d9dc7ea4bd666c37dcf329322292da41197326d60d833dd40836ec49a44d415
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 31142
    end_char: 31930
    text_sha256: 2ca065793b1e94c16a5e39faf2f5e0bfdfff70f2c4b4513b5944424de859a0a8
  rationale: In-span ἔφη is third person, excluding the narrator. The span continues the interrogation in the first person plural of the pair fixed by the named Ctesippus turn above (οὐδέτερος ἡμῶν, ἀντιλέγοιμεν ἄν) and addresses that Ctesippus, so he is excluded. The context closes where Ctesippus falls silent and the narrator asks the author of τὸν λόγον πῶς, ἔφην, ὦ Διονυσόδωρε, λέγεις, naming the party who has been pressing it; every speaking turn inside is formula-marked and the assents between are third-person narration.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0251
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286b
char_span:
  start_char: 31645
  end_char: 31854
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b359b744ed4f69b6c0f3089a70b8dbdaae2a0ca354e80790b151f7eb732586a2
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 31645
    end_char: 31930
    text_sha256: a0a2c8ecb2f5a0f97cd392bad16e4e86809f804fdcc8ca84e5c5544b268e7d79
  rationale: "The span carries no reporting verb, but the narration beginning at its very end identifies its speaker: καὶ ὁ μὲν Κτήσιππος ἐσίγησεν excludes Ctesippus, ἐγὼ δὲ θαυμάσας τὸν λόγον puts the narrator on the receiving side of this speech, and πῶς, ἔφην, ὦ Διονυσόδωρε, λέγεις addresses its author by name, as does οἶμαι ... τὴν ἀλήθειαν παρὰ σοῦ ... πεύσεσθαι — which excludes Euthydemus. That naming stands zero characters after the span, so no interlocutor switch is crossed."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0252
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286b-286c
char_span:
  start_char: 31915
  end_char: 32356
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b75bd09db93b224e343e52fef662d31ae9f107da518047129a271448aa1838ee
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 31920
    end_char: 31924
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0255
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32378
  end_char: 32444
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2d25e6d11203cec2fa16fc54a0cec2cfcf69645d39ac20d660ebd3501fe4e54f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking and no vocative. The reply it draws, οὐδὲ δοξάζειν, ἔφη, is third-person marked, which identifies nobody, and its speaker is unknown, so no party is excluded. The narrator's other questions in this stretch carry ἦν δ’ ἐγώ and this one does not, but that absence is not evidence of another speaker.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0256
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32444
  end_char: 32468
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1749c52a9602f6c47b6b2984f915087a1d8c636109e449540d94ceb4f41a6170
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator, and nothing else in the span identifies its speaker — no name, no vocative, no person marking beyond that reporting verb. The question it answers is itself unattributed, so Euthydemus, Dionysodorus and Ctesippus all remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0257
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32468
  end_char: 32522
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6ede7136a6f87b98843e8cc32fc8011125927b41361298d078e1445779c2802f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 32489
    end_char: 32498
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0258
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32535
  end_char: 32643
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 03a8d53397ccbc73df4ec1a033e9700ee16df0183c57ad4b89865d694f87614e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking and no vocative. The reply it draws, πάνυ γε, ἔφη, is third-person marked but names nobody, and the assent before it (οὐκ ἔφη) is the narrator's third-person summary, not an utterance that fixes a speaker. All four parties speaking in this scene remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0259
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32643
  end_char: 32661
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: abb6c400dabd82d9fa2ae7bfe002d67586caa0ddf909cd860e60d1c6a04026a2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator, and nothing else in the span identifies its speaker — no name, no vocative, no person marking beyond that reporting verb. The question it answers is itself unattributed, so Euthydemus, Dionysodorus and Ctesippus all remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0260
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d
char_span:
  start_char: 32661
  end_char: 32698
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e6b6ad164621fb56001d1db04f18bcba4e7d5651ef153448c1da21a334aea3bb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 32687
    end_char: 32696
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0261
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286d-286e
char_span:
  start_char: 32711
  end_char: 32841
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 58d82facd109e7873f3a9505271b136fae806eacd17423ef65aff7c6bc3577ed
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: "The in-span vocative ὦ Διονυσόδωρε names the addressee and λέγεις ... δοκεῖ σοι address him throughout, so Dionysodorus is excluded; but nothing marks the speaker's own person. Socrates, Euthydemus and Ctesippus each remain possible: the narrator's other questions here carry ἦν δ’ ἐγώ and this one does not, which is not evidence either way."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0262
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 32841
  end_char: 32868
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 409782cb661ada6f0a9844b7c2fa3a2b0555d83af93732ea95f71a2ecab82d0b
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 32711
    end_char: 32868
    text_sha256: 0e7de0d44b537236444fb8e10a7c737d34d606bb4f72064877b84ad9dfd9f7b0
  rationale: In-span ἔφη is third person, excluding the narrator, and σύ ... ἔλεγξον addresses whoever put the preceding question, excluding that party. That question is addressed by vocative to ὦ Διονυσόδωρε and asks him whether he argues λόγου ἕνεκα, so its answer is his; Euthydemus and Ctesippus are excluded because it was put to Dionysodorus by name. Context runs from the opening of that question to the end of this reply.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0263
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 32868
  end_char: 32940
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6dcda68f2b2a3ec3b89734e64326154364e685a96987273c8dab69dabe443070
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΤΗΣ.
unresolved_reason: The in-span τὸν σὸν λόγον addresses the previous speaker, excluding Dionysodorus, and the answer it draws is named — οὐκ ἔστιν, ἔφη ὁ Εὐθύδημος — which excludes Euthydemus, a question and its answer having different speakers. Nothing in the span marks its own speaker's person, so Socrates and Ctesippus both remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0264
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 32940
  end_char: 32953
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: df74ed08890ab919df9121dc91c36d4843b617501653f2567f2ae621c6b723a0
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Εὐθύδημος
    start_char: 32955
    end_char: 32970
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0265
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 32972
  end_char: 33035
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4c5d9d81b54f5708353d6a44b90e53d52add783c992778101677a87457eb8c8f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 32995
    end_char: 33003
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0266
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 33035
  end_char: 33089
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 33c6d24b448139e9b0a17242951a6f5960cebb78ba5cfda4ba9cca4e503dd160
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 32972
    end_char: 33121
    text_sha256: 394d648eef8343ceed9384694d700b1dff0fcca8924f3b39f9e3f966cbf7eabf
  rationale: The span’s second person σὺ δὲ κελεύεις addresses the speaker of the preceding question, whose in-span ἔφην ἐγώ fixes him as the narrator, so Socrates is excluded. The reply this span draws is that narrator’s ὅτι, ἦν δ’ ἐγώ, ὦ Εὐθύδημε ... — an answer to this very question, addressed by vocative to Euthydemus, which names this speaker and excludes Dionysodorus and Ctesippus. Context runs from the preceding question to that naming reply.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0267
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0025
stephanus_span: 286e
char_span:
  start_char: 33089
  end_char: 33252
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5d6917e17db8bd8af8977e285fd22e6cadcda46fe3fd59fdb6e431ec32d9be9d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 33098
    end_char: 33107
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0268
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287a
char_span:
  start_char: 33263
  end_char: 33460
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 410218a28276fd4f55f58c08563d6a67db4304f3cc3eece15ecb2821d27a5ca3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 33263
    end_char: 33753
    text_sha256: 0a8ad7d69e31d2884f65577b38d97401d73feb770c1ac31c025c19806e031d54
  rationale: The in-span οὐχ οὕτω λέγετε; is second person plural, addressed to the visiting pair, so neither brother speaks it, and ὅρα δέ addresses one of them in the singular. Of the two parties left, the ἦν δ’ ἐγώ-marked utterance following the pair's one-line assent takes up this span's own protasis (εἰ γὰρ μὴ ἁμαρτάνομεν μήτε πράττοντες μήτε λέγοντες) and repeats the same second-person-plural address (ὑμεῖς ... τίνος διδάσκαλοι ἥκετε;). This printed ΣΩ. page therefore opens with the narrator's own continuing speech. Context stops at the end of that marked utterance.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0269
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287a
char_span:
  start_char: 33460
  end_char: 33478
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c07a2c2ec06038a1e52010482deeb5f17f518594054485f7d18fd325d9003b17
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator, and the span answers a question put in the second person plural (οὐχ οὕτω λέγετε;) to the two visitors, so the answer is one of theirs and Ctesippus is excluded. Nothing in the span or its neighbours distinguishes Euthydemus from Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0270
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287a-287b
char_span:
  start_char: 33478
  end_char: 33753
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5a4e961c57e8a06e970cbee80108e112856afdd363af052618c4026da51a66b1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 33499
    end_char: 33508
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0271
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287b
char_span:
  start_char: 33753
  end_char: 33958
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1a936a2ebf9ed1472d71964fa66192c596163aaeaf330c8626231fcb33b6df9b
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ Σώκρατες, ὁ Διονυσόδωρος
    start_char: 33763
    end_char: 33794
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0272
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287b-287c
char_span:
  start_char: 33958
  end_char: 34302
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1faa56e2f02a876e788e40791c41bdf6ae632847b574822e8c7c7215cebbf08b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 33971
    end_char: 33979
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0273
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c
char_span:
  start_char: 34302
  end_char: 34389
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4b409ee5e49a87e9836c21ec7b3dec823430f863891be7cb297dd17676fdee19
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 33958
    end_char: 34441
    text_sha256: dd0ab5ccbe3ebf74f2b7d0fbfb3a364d8f97926cbd1d9f9322c8c908e9d7c7fa
  rationale: In-span ἔφη is third person, excluding the narrator, and ὃ σὺ λέγεις addresses the previous speaker, whose ἔφην ἐγώ marks him as the narrator. That utterance puts its question by vocative to ὦ Διονυσόδωρε (τί ποτε λέγεις, ὦ Διονυσόδωρε; ... ἐπεὶ εἰπέ), so this answer is his, and Euthydemus and Ctesippus are excluded because it was put to Dionysodorus by name. The reply it draws, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, addresses him again. Every turn in the context is formula-marked.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0274
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c
char_span:
  start_char: 34389
  end_char: 34441
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9998faf31f893f35ba90a35364422fd3c5cc6d0ea8da321d488b2d08051c74d3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 34415
    end_char: 34424
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0275
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c
char_span:
  start_char: 34441
  end_char: 34464
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ae9a03445450fea4d07f2cf2db54d5d584e02344ac22ba8fea2500ac6763eff7
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 34389
    end_char: 34464
    text_sha256: 2e63fe1f90db0d7b58b93ba239ab2bf9912673621248c830be17a04918b43204
  rationale: "In-span ἔφη is third person, excluding the narrator, and οὐκ ἀποκρίνῃ; is second person, addressed to the speaker of the preceding ἦν δ’ ἐγώ-marked question. That question is addressed by vocative to ὦ Διονυσόδωρε and asks whether the narrator must answer before he does, so the retort is his; Euthydemus and Ctesippus are excluded because the exchange is with the party named there. The ἔφη belongs to this span: it stands before the following paragraph marker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0276
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c
char_span:
  start_char: 34464
  end_char: 34483
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 70b71b7f005a037e0721c63e671a0aae819815e6e6e04dca14fd008b90075d0b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking and no vocative. The ἔφη-marked reply it draws is Dionysodorus', which excludes him from asking it, but the narrator, Euthydemus and Ctesippus each remain open; the narrator's other questions in this turn carry ἦν δ’ ἐγώ and this one does not, which is not evidence.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0277
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c
char_span:
  start_char: 34483
  end_char: 34508
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5bf1089617b29f63e56319f3832ca46a955ff1c88a5b32e11436b8863cd00941
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 34483
    end_char: 34722
    text_sha256: 95e42422ca14309c2d038adcadbf165f9dba42303b607c2c1b64c4bca5f9b826
  rationale: In-span ἔφη is third person, excluding the narrator. The ἦν δ’ ἐγώ-marked utterance that answers this one addresses its speaker as σὺ νῦν πάσσοφός τις ἡμῖν ἀφῖξαι περὶ λόγους — a visitor, which excludes Ctesippus — and as the party who καὶ νῦν οὐδ’ ἂν ὁτιοῦν ἀποκρίνῃ, the one refusing to answer, whom this turn twice names ὦ Διονυσόδωρε. Context runs from this span to the end of that reply and crosses no cue-free turn.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0278
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287c-287d
char_span:
  start_char: 34508
  end_char: 34722
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 173d39c48c7932a76c0dc7bc024c209cb865e751b2cdbc4dca1117e9bc457fe3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 34529
    end_char: 34538
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0279
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d
char_span:
  start_char: 34722
  end_char: 34834
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 21b924aa88f2058e4e6d9aaa209b27b92654dae83747c5fe478e385ccab15ea6
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 34508
    end_char: 34834
    text_sha256: a07809969e4f3b7737584567c4dbf5a3efb1f010e4668afbae84dff0474b86f2
  rationale: In-span ἔφη is third person, excluding the narrator, and λαλεῖς ... πείθου καὶ ἀποκρίνου is second person, addressed to the speaker of the preceding ἦν δ’ ἐγώ-marked question. This span's ἐπειδὴ καὶ ὁμολογεῖς με σοφὸν εἶναι answers that question's σὺ νῦν πάσσοφός τις ἡμῖν ἀφῖξαι περὶ λόγους, so its speaker is the visiting sophist addressed there — the party this turn twice names ὦ Διονυσόδωρε — which excludes Ctesippus and Euthydemus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0280
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d
char_span:
  start_char: 34834
  end_char: 34916
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4e9429365ceb5fa1daeceaa1d08d0a5c425d4177b8d18a19ab1ea200abef9fe9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 34855
    end_char: 34864
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0281
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d
char_span:
  start_char: 34916
  end_char: 34978
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cb1f81400522ae50199bf52ff573c9ef336734109c5a78bba2831e3e5790a83c
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 34722
    end_char: 34978
    text_sha256: 202cb73c3f89a1f892aae2aadc5846cac00b07fcfc11e99db59ff5278d53ce4d
  rationale: "The span is the question produced by an explicit handoff standing zero characters before it: the ἦν δ’ ἐγώ-marked reply ends σὺ γὰρ ἄρχεις. ἀλλ’ ἐρώτα, second person singular, so the narrator is excluded and the questioning passes to that addressee. The addressee is the speaker of the preceding demand πείθου καὶ ἀποκρίνου, ἐπειδὴ καὶ ὁμολογεῖς με σοφὸν εἶναι, whom this turn names ὦ Διονυσόδωρε; Ctesippus and Euthydemus are excluded with him."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0282
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d
char_span:
  start_char: 34978
  end_char: 34999
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 82cabee05826ed4267f0b9d1972037650e18a33eb1ffd69930f3857d737e6c01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: A bare answer with no reporting verb, no person marking and no vocative. It answers the question Dionysodorus has just been handed the floor to ask, which excludes him, but nothing distinguishes the narrator from Euthydemus or Ctesippus. The narrator's other replies in this turn carry ἦν δ’ ἐγώ and this one does not.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0283
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d
char_span:
  start_char: 34999
  end_char: 35039
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 75cb4866a3893d9d74f29d1ef1cd406550419da26ca85b13b96ebd3a2f603368
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: "In-span ἔφη is third person, excluding the narrator, but nothing else in the span identifies its speaker: no name, no vocative, no person marking. Treating it as the same questioner as the span before the intervening answer would be previous-speaker carry-forward, so Euthydemus, Dionysodorus and Ctesippus all remain open."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0284
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287d-287e
char_span:
  start_char: 35039
  end_char: 35068
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e5e73281256c6fac5fe62d080985bae9c5f01afa09f528097c9543b5f398677c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: A bare denial with no reporting verb and no vocative; ἔγωγε is a first-person pronoun, which licenses nothing. The retort it draws is Dionysodorus', which excludes him, but the narrator, Euthydemus and Ctesippus each remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0285
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287e
char_span:
  start_char: 35068
  end_char: 35111
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5a50a667e599db2d766828a55fb1d2f9fa4f18ec6af1a72b53cca94e26d8887e
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 33958
    end_char: 35111
    text_sha256: e033e21df25178befb903ca6f9d698094f5d6d2c19830e460b2876445040bc65
  rationale: "The span's ἄρτι ἤρου is second person and refers back to a named question inside this turn: ἐπεὶ εἰπέ, τί σοι ἄλλο νοεῖ τοῦτο τὸ ῥῆμα, put with ἔφην ἐγώ by the narrator and addressed by vocative to ὦ Διονυσόδωρε. The speaker is that vocative's referent — μοι here is the person of whom the question was asked — and the narrator is excluded twice, by ἤρου and by the ἦν δ’ ἐγώ answer this span draws. The context is wide because the ἄρτι reference is; the cue-free turns inside it carry no speaker forward."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0286
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0026
stephanus_span: 287e
char_span:
  start_char: 35111
  end_char: 35271
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 321c472cd2ebfb60905cc2f4d83e0571ff9402b02ce7cf9f5b02190816e92347
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 35127
    end_char: 35136
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0287
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 287e-288a
char_span:
  start_char: 35275
  end_char: 35738
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: df8f56d02ddc816a6e93fdd42a98f1866264e3c0fb9e13a364dc6fa0a79207a0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 35495
    end_char: 35503
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0288
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288a-288b
char_span:
  start_char: 35759
  end_char: 35897
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d3bd9fc8260a60e9367da0f521463c13e3e7a7c30d9f25a17c924b837c2c20c2
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος, Θαυμάσιά γε λέγετ’, ἔφη
    start_char: 35746
    end_char: 35782
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0289
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288b-288d
char_span:
  start_char: 35939
  end_char: 36756
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cfbce59e47e610ea4a680dfe66e60e8d958eac3d1d1f894ae4a06b26d9b30f83
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: πάλιν κατεπράυνον τὸν Κτήσιππον καὶ εἶπον
    start_char: 35939
    end_char: 35980
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0290
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288d
char_span:
  start_char: 36756
  end_char: 36899
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 48de6576795ed5bd0585cbbb23b8b3b6b962915b1dc022a84e5aeb83fae2a155
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 36778
    end_char: 36782
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0291
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288d
char_span:
  start_char: 36899
  end_char: 36913
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 07b07302b234c10752b2369986c726041dfaa69b90277b3c01f901c4aa9898be
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 36905
    end_char: 36912
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0292
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288d
char_span:
  start_char: 36913
  end_char: 36966
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 47141f1740fbf57321ea18519e26ec0300017f202f6695f92fbbf7fa896a4ecb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 36961
    end_char: 36965
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0293
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288d
char_span:
  start_char: 36966
  end_char: 36976
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1671fff622b666ca59613365efdc97248ad586473ab1834b768bcedae034e79c
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 36972
    end_char: 36975
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0294
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288d-288e
char_span:
  start_char: 36976
  end_char: 37093
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4930d9230aeb4223a02b3358f6f25bdc10ac6e9127796aa73b769280fd7e6bb4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its first person plural (κτησαίμεθα, ἡμᾶς ὀνήσει) covers both parties and so discriminates neither. Reading the speaker off the ἔφη-marked reply beside it would be alternation, which the protocol forbids."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0295
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288e
char_span:
  start_char: 37093
  end_char: 37107
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d71624fe9c51119400d4760b26a75c7f25403bc92637e5f327cf6d1fbb9cc175
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 37103
    end_char: 37106
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0296
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288e
char_span:
  start_char: 37107
  end_char: 37217
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 47087d963d3768140441e0fe9c296b9069c96c8f8a5b44d98e9bf361b5b116df
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its first person plural (ἡμᾶς ὀνήσειεν, ἐπισταίμεθα) covers both parties and so discriminates neither. Reading the speaker off the ἔφη-marked reply beside it would be alternation, which the protocol forbids."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0297
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0027
stephanus_span: 288e
char_span:
  start_char: 37217
  end_char: 37229
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cf3afa53df126c7169b87ee6a1dcd244d1e9670f83f9cbdbbce87b8137a62796
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 37224
    end_char: 37227
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0298
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 288e-289a
char_span:
  start_char: 37233
  end_char: 37567
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a79e106d9a7218934a5ef208b5999480fb11b8009ea41ecceddb7f92e483a86e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 37251
    end_char: 37260
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0299
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289a
char_span:
  start_char: 37567
  end_char: 37591
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8d3e8b821697860314fda6c665937febadeaa2d85cd3ba27b52b84bc6871430b
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 37577
    end_char: 37580
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0300
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289a
char_span:
  start_char: 37591
  end_char: 37771
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 81c75a2878c4a575d0a2cf747d14e4766173c2bb53cc23193ed7c5ceca58ff21
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its closing οὐχ οὕτως; invites assent but names nobody, and that assent is the narrator's third-person summary συνέφη, not an utterance."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0301
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289a-289b
char_span:
  start_char: 37779
  end_char: 37963
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 71e4ad6d68f637402ce68d19d7aef5bb8ba43b20388245e584cb52a086b43859
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its only person marking is the plural τοῖς πρόσθεν ὡμολογημένοις, covering both parties, and the assent after it is narrated (συνεδόκει ἡμῖν πάντα ταῦτα), not spoken."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0302
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289b
char_span:
  start_char: 37991
  end_char: 38130
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 54859384afdbff33147975fd3bd498484d01b1a045173d5c72f5acd7036f557e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 38043
    end_char: 38052
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0303
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289b
char_span:
  start_char: 38130
  end_char: 38145
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ead31cea81b7040fb442ab273275b7e3f1227304909b5e64ce9f61d6cf538fd8
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 38141
    end_char: 38144
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0304
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289b-289c
char_span:
  start_char: 38145
  end_char: 38404
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1d7e23c6f18c9c49b79635880406c44ac0e9b770849089c74342d9af3e33a323
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its person marking is the first person plural ἡμᾶς ... δεῖν εἶναι, which covers both parties; the closing οὐχ οὕτως; names nobody and the assent after it is the narrator's συνέφη."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0305
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289c
char_span:
  start_char: 38412
  end_char: 38483
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cfdf1778b3c5d71c2e720bf6c3a15b137af4f281a87be72446baa27add47f5d4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no singular person marking. Its only person marking is the first person plural δεόμεθα, which covers both parties, and the assent after it is the narrator's third-person συνεδόκει, not an utterance."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0306
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289c
char_span:
  start_char: 38494
  end_char: 38614
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0a25c94467b51bacea96261cc2026bdf9de947707163684f612fd8cace2a0a64
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 38511
    end_char: 38519
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0307
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289c-289d
char_span:
  start_char: 38614
  end_char: 38664
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9accab42d3ed9196136b556baa634ee0ca0895866e416ca85deae02258bdbc97
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ἐγώ, ὁ Κλεινίας
    start_char: 38626
    end_char: 38646
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0308
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289d
char_span:
  start_char: 38664
  end_char: 38699
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 273b41666584c58137a452364e2501cb25f0202f2c0e2c274fd5e21d301e5fbe
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 38683
    end_char: 38692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0309
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289d
char_span:
  start_char: 38699
  end_char: 38996
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b99fe4aaf0e154951027635364f446eb90db46d4ff14c8afc4f074f531b4a779
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 38708
    end_char: 38711
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0310
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0028
stephanus_span: 289d-289e
char_span:
  start_char: 38996
  end_char: 39456
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5ae313db012b09e8e7bbf99d9a3f836f6a8bdb3864acd6effca7ed5aa3893f84
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 39019
    end_char: 39027
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0311
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39467
  end_char: 39701
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 50b060f703ee6fb238388324445f3090739858cd455f4e2977103b7ea53f32f0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 39674
    end_char: 39682
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0312
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39701
  end_char: 39753
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c3d90f9395807ad87f961cdc8facf2c84c9a0fff64a494fff917ac6807da50d6
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 39734
    end_char: 39737
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0313
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39753
  end_char: 39813
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 22203dd781d2f58b49a865c197b4baf1d618d35ae83527b358fd691563f21de1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 39766
    end_char: 39774
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0314
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39813
  end_char: 39842
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8fab05fd5d5cb9acd3896b283126371cc2ff79c628cbf7090b45443766831a9b
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 39837
    end_char: 39840
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0315
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39842
  end_char: 39884
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1d3c4268a29bdd99bc96786e6d741de258e7105400b1e075ceb9b5794ff95ce7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 39852
    end_char: 39861
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0316
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290a
char_span:
  start_char: 39884
  end_char: 39893
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cb9604edb9b188b18f766b69d7b84c3a6512f577751b55272cb37e964abc94ad
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κλεινίας
    start_char: 39894
    end_char: 39908
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0317
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b
char_span:
  start_char: 39917
  end_char: 40016
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7fdf66eafd1ae34ae10d37db9c406a2d36af7430bb96ff9fca82b9435f5c28c9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 39945
    end_char: 39953
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0318
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b
char_span:
  start_char: 40016
  end_char: 40038
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 252b5becbb03d401f6aa0f89cd9294bc1bfc07899072da86df0279388df88e8e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no third-person marking. Its ἔμοιγε is a first-person pronoun, which licenses nothing; that it contrasts emphatically with the μοι δοκεῖ of the ἔφην ἐγώ-marked span before it argues only that the speaker changed, which is alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0319
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b
char_span:
  start_char: 40038
  end_char: 40058
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 11c879055108734da46a3466d664bd2069056f238258a7da65786dc093b1a798
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 40047
    end_char: 40056
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0320
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b
char_span:
  start_char: 40058
  end_char: 40105
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 021c6423f285bc06345c004623d2b95e4f363cdbad0c2bb431b8f545aeafb687
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΛΕΙΝ.
unresolved_reason: "Inside the bounded two-party exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb, no vocative, no third-person marking. It is a flat third-person definition (θηρευτική τις ... ἐστιν τέχνη ἀνθρώπων) with no person marking at all, and the ἔφην ἐγώ-marked question on either side of it names nobody but the narrator."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0321
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b
char_span:
  start_char: 40105
  end_char: 40130
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: acb1688aa62b844724ac72c68c37d44950894002dce642c3bbadc4f824cd7419
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 40120
    end_char: 40128
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0322
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290b-290c
char_span:
  start_char: 40130
  end_char: 40701
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9eaf60f67879fdd3d13180fcc3d2c09c8735bec9ba5903c1eeb8cedad12f2ad8
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 40143
    end_char: 40146
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0323
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290c
char_span:
  start_char: 40701
  end_char: 40773
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 54e69c07c388a1073be806ac89bd54f8a998362a30d1acac114b73374f014646
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 40711
    end_char: 40720
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0324
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0029
stephanus_span: 290c-290d
char_span:
  start_char: 40773
  end_char: 41253
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 63d3795b358edad50e1da57f00e838e552a46d8e81e068cd234506f9ef66756d
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 40812
    end_char: 40815
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: σὺ δέ, ὦ Κλεινία, ἔφην, ἀνάμνησόν με πόθεν τότ’ ἀπελίπομεν.
    start_char: 36760
    end_char: 36819
  - kind: printed_siglum
    role: exchange_close
    text: ΚΡ.
    start_char: 41260
    end_char: 41263
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0325
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0043
stephanus_span: 291d-291e
char_span:
  start_char: 43146
  end_char: 43225
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d67549e48425fb28b7af7d769a46354e8b2529f8acb8c21397127bf71cedecbb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The quoted inquiry is introduced by a first person plural — αὖθις γὰρ δὴ πάλιν ἐσκοποῦμεν ὧδέ πως· — and the answer it draws is attributed the same way, ἡμεῖς ἔφαμεν πρὸς ἀλλήλους. The Greek assigns these words to the whole group and individuates nobody, so no owner is licensed and no exhaustive candidate set is justified.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0600
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0043
stephanus_span: 291e
char_span:
  start_char: 43226
  end_char: 43238
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9a733dd7d83670efd3dfe48405d93e0e6ca949a615b7488f067b9a7bde2e6d2f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ἡμεῖς ἔφαμεν πρὸς ἀλλήλους attributes this reply to the whole group in the first person plural and individuates nobody. A collective reporting formula licenses no single owner, so the span is recorded with its owner unresolved and no candidate set invented.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0326
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46035
  end_char: 46144
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b534c87f12cb75087c880630ff4841677c3e7c050591f5cf1d7c3430e86135a6
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    role: cue
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0327
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46144
  end_char: 46193
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e47004682a1ea6efcc745e13b862b1ba4e74ddb08cb7f7cc70cec1540b5f6627
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46159
    end_char: 46168
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0328
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46193
  end_char: 46216
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fe0eb8f4105f251a81f367c7afd6b31dbc613e46889328ad9a1e4c0e3213ff45
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 46211
    end_char: 46214
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0329
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46216
  end_char: 46309
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ed759c5c929e9f2f9844c6f811f25754237e9dea56ffb8cbe94f89608cbb0f0d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 46248
    end_char: 46256
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0330
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46309
  end_char: 46361
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 167652ac66a998515aa04424dce2f06c355b9e7d8ae01e6fdf7b19372868eb66
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 46336
    end_char: 46339
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0331
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b
char_span:
  start_char: 46361
  end_char: 46403
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5462dffa62ab9561d1de75229757e4e87228b389cc9d8aa718946382c5210c02
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46371
    end_char: 46380
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0332
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293b-293c
char_span:
  start_char: 46403
  end_char: 46500
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4e9e022f76db8a1780c23c7e2c62d539d2f2628063055615a485b22089de2a96
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 46411
    end_char: 46414
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0333
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46500
  end_char: 46523
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9355b3791f2c864699cf8f139ed310d1bb37353b7b1658bacc784c8b5fd74515
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this reply has none: no reporting verb and no vocative. ἔγωγε is a first-person pronoun, which licenses nothing, and reading the speaker off the ἔφη-marked question beside it would be alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0334
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46523
  end_char: 46553
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 60e5cf4d3189d57352311c9d655fd9d79d73fa5ebdf139f98d49a01903de201a
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 46535
    end_char: 46538
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0335
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46553
  end_char: 46560
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5eb6c30f5b5c3557fd62352ead4b29b1a7f76606db3514b91862aa57686b11d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this reply has none: no reporting verb and no vocative. ἔγωγε is a first-person pronoun, which licenses nothing, and reading the speaker off the ἔφη-marked question beside it would be alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0336
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46560
  end_char: 46598
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6e739a01d47b68d606485b017fd9030803c96d55bc445e01da43d107685615ef
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this question has none: no reporting verb, no vocative. εἶ ... ἐπίστασαι is second person, but in a two-party exchange every utterance addresses the other party, so it discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0337
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46598
  end_char: 46624
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6cc635185c43703da11ba70fc11e2703b932c6c80c130740c1a4aa9974170a8d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this reply has none: no reporting verb, no vocative and no person marking of any kind — πάνυ γε, τούτου γε αὐτοῦ is a bare assent. Reading the speaker off the neighbouring turns would be alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0338
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46624
  end_char: 46701
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3298d52ff38d735715c0b81f9eedbd4e318eb7c85adca7d5a360cb9d6d5d93a0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this question has none: no reporting verb, no vocative. σε ... ἐπιστήμονά γε ὄντα is second person, but in a two-party exchange every utterance addresses the other party, so it discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0339
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46701
  end_char: 46750
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d13996ba6c6fbfabee8b8e733b47b39741b79155960271ed334397c9ca749d26
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 46710
    end_char: 46718
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0340
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46750
  end_char: 46795
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9b9d483ff90313544ff3ce3cbc27953a5e9d5285bfa3571fe051b3838f4673ad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside this bounded two-party exchange an anchored dialogue turn needs a cue printed in its own span, and this question has none: no reporting verb, no vocative. ἐπίστασαι ... εἶ is second person, but in a two-party exchange every utterance addresses the other party, so it discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0341
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c
char_span:
  start_char: 46795
  end_char: 46826
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f072ad86ec4e22a9b7617fb73003b023b788c3e0b9cb617b96ec877486b8e31e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46816
    end_char: 46825
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0342
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293c-293d
char_span:
  start_char: 46826
  end_char: 46982
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5ec0de0220d5a7efbec7ff8a1c8874230f69f7736aed09a9f8084fd483c88b95
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 46841
    end_char: 46844
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0343
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293d-293e
char_span:
  start_char: 46982
  end_char: 47347
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d578d1c3b93ae5bcb07debc2acc8ad750adce3dfa8c2c57b6b69d62f51c525f1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46992
    end_char: 47001
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0344
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293e
char_span:
  start_char: 47347
  end_char: 47399
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b36b4206d242b04450009bcfd4d01c69abad03828abd61130986c08a3b9db37e
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 47382
    end_char: 47385
  - kind: anaphoric_reporting_formula
    role: exchange_open
    text: ἤρξατό γε, ὦ ἑταῖρε, πάνυ μεγαλοφρόνως τοῦ λόγου ὧδε—
    start_char: 45974
    end_char: 46027
    antecedent_text: ὁ Εὐθύδημος
    antecedent_start_char: 45941
    antecedent_end_char: 45952
  - kind: closing_formula
    role: exchange_close
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0345
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293e
char_span:
  start_char: 47399
  end_char: 47646
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fc2f8ac19062e13586cf0dd09e1db1acda3172cd37634b004b3c0ef8781d5438
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47410
    end_char: 47419
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0346
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293e
char_span:
  start_char: 47646
  end_char: 47676
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: bbc0cf9cfc96ea9ef8e5d44a173ff3dba733e4365173909f977ed356bd5333d0
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ὁ Διονυσόδωρος
    start_char: 47678
    end_char: 47692
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0347
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293e
char_span:
  start_char: 47694
  end_char: 47748
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 944e5ac6bed9fc9070da59715127cb5f1ad050d490035927ca4c0cc282cdf230
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 47711
    end_char: 47719
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0348
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0069
stephanus_span: 293e
char_span:
  start_char: 47748
  end_char: 47771
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 60762f05716647ad352b775df7dd708aa65e9f60fb5f572c975b63516e6d6c0b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: In-span ἦ δ’ ὅς is third person, excluding the narrator, and the question it answers is put in the dual to the two visitors (πῶς λέγετον; ... οὐδὲν ἄρα ἐπίστασθον;), which excludes Ctesippus. The bounded Socrates-Euthydemus exchange has already closed — Dionysodorus answered the previous dual question — so nothing distinguishes the two brothers here.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0349
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a
char_span:
  start_char: 47782
  end_char: 47841
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 85f3e0e330cae81c4efc92e41a9b5f2588797f6e6111a00e6b192a8ec3d0652c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 47797
    end_char: 47805
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0350
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a
char_span:
  start_char: 47841
  end_char: 47914
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f791b7b2bc2b915ca06ff9e9b791f50d4d44705c3138450c7a60f6e98020c4a3
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 47782
    end_char: 48425
    text_sha256: 0025e63a99a8265b068bc7124a1c640fa4546995984f86b224cd5c68bb88cbca
  rationale: "In-span ἔφη is third person, excluding the narrator, and its second person (καὶ σύ γε πρός ... πάντα ἐπίστασαι) addresses him. Every turn in the context is formula-marked — the narrator's own carry ἔφην ἐγώ / ἦν δ’ ἐγώ — so no switch passes unnoticed, and the context closes with the narrator naming the party he is answering: ὦ πρὸς τῶν θεῶν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, while asking the pair in the dual αὐτὼ τῷ ὄντι πάντα ἐπίστασθον. That vocative excludes Euthydemus and Ctesippus."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0351
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a
char_span:
  start_char: 47914
  end_char: 48041
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 13b891d6b61473413d841e6917e21f725d272558a9ffe5e61c6d2175a3c9076f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 47925
    end_char: 47933
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0352
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a
char_span:
  start_char: 48041
  end_char: 48153
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cbfdbfe2e1c3acab7f4f456302e5a7d952516b9eb2eea7c47f2414ec190895f1
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 47782
    end_char: 48425
    text_sha256: 0025e63a99a8265b068bc7124a1c640fa4546995984f86b224cd5c68bb88cbca
  rationale: "In-span ἔφη is third person, excluding the narrator; the span itself speaks only of οἱ ἄλλοι in the third person. Every turn in the context is formula-marked — the narrator's own carry ἔφην ἐγώ / ἦν δ’ ἐγώ — so no switch passes unnoticed, and the context closes with the narrator naming the party he is answering: ὦ πρὸς τῶν θεῶν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, while asking the pair in the dual αὐτὼ τῷ ὄντι πάντα ἐπίστασθον. That vocative excludes Euthydemus and Ctesippus."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0353
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a
char_span:
  start_char: 48153
  end_char: 48177
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8fd8ab72ef3d4c174a05c9202e21eebd7442ac9c68fc0dd8c99c2cee90dcd262
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 48166
    end_char: 48175
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0354
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294a-294b
char_span:
  start_char: 48177
  end_char: 48237
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a4546b7565d42a64d9a2f5e54b4ef56e96eba7fe7734c0f6725c950ba684750e
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 47782
    end_char: 48425
    text_sha256: 0025e63a99a8265b068bc7124a1c640fa4546995984f86b224cd5c68bb88cbca
  rationale: "In-span ἦ δ’ ὅς is third person, excluding the narrator; the span itself speaks only of πάντες in the third person. Every turn in the context is formula-marked — the narrator's own carry ἔφην ἐγώ / ἦν δ’ ἐγώ — so no switch passes unnoticed, and the context closes with the narrator naming the party he is answering: ὦ πρὸς τῶν θεῶν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, while asking the pair in the dual αὐτὼ τῷ ὄντι πάντα ἐπίστασθον. That vocative excludes Euthydemus and Ctesippus."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0355
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48237
  end_char: 48425
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 68ae0ef67f3ca328fa4923ff270ef603432db584eafd30cd1895c6606b5bf6b6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 48258
    end_char: 48267
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0356
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48425
  end_char: 48443
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c07a2c2ec06038a1e52010482deeb5f17f518594054485f7d18fd325d9003b17
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 48237
    end_char: 48443
    text_sha256: d14048d10b9d6be1dfb01759053fe43a281aa69a9d68f7b1afeb4653871c9ab7
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the question opening the context, which is addressed by vocative to ὦ Διονυσόδωρε; the answerer of a question put to a named addressee is that addressee, so Euthydemus and Ctesippus are excluded.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0357
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48443
  end_char: 48480
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0b9d3fa8959045426dd411e3e00ec30b1712dffd114da9aad1df153fee238ab6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking of its own and no vocative. Its dual δυνατώ ἐστον addresses the two visitors, which excludes both brothers, and the ἔφη-marked reply it draws is Dionysodorus', which excludes him again; the narrator and Ctesippus both remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0358
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48480
  end_char: 48514
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: db096f07e67bea244789991e4490ab817274a2b2a5fe5d05ebcb071d1e97cfd6
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 48237
    end_char: 48773
    text_sha256: b97791e3d76ad93bfd9413eb9705730cd575b3b664987cd8629830390a66665c
  rationale: In-span ἔφη is third person, excluding the narrator. The context is closed at both ends by a naming of the answering party — ὦ Διονυσόδωρε in the narrator's question and Διονυσόδωρε in Ctesippus' address that follows — and the only cue-free turns between them are the narrator's, which continue his dual question to the two visitors (δυνατώ ἐστον) and so exclude both brothers as their speakers. The answering party therefore does not change unnoticed.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0359
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48514
  end_char: 48577
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 24b7cb712f120a8cf5ddf0ffe44dee7d9c720731d3b64ac70f3638712589f134
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb, no person marking and no vocative; it is an elliptical continuation of the question before it. The ἦ δ’ ὅς-marked reply it draws is Dionysodorus', which excludes him, but the narrator, Euthydemus and Ctesippus each remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0360
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b
char_span:
  start_char: 48577
  end_char: 48633
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7cc739153f697b0833a96263d0cd19230db359bb1fa903923feb700294ded10f
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 48237
    end_char: 48773
    text_sha256: b97791e3d76ad93bfd9413eb9705730cd575b3b664987cd8629830390a66665c
  rationale: In-span ἦ δ’ ὅς is third person, excluding the narrator. The context is closed at both ends by a naming of the answering party — ὦ Διονυσόδωρε in the narrator's question and Διονυσόδωρε in Ctesippus' address that follows — and the only cue-free turns between them are the narrator's, which continue his dual question to the two visitors (δυνατώ ἐστον) and so exclude both brothers as their speakers. The answering party therefore does not change unnoticed.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0362
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294b-294c
char_span:
  start_char: 48663
  end_char: 48773
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b9c00bc8fcad08bba4655880dcbd5ad65b759f59ec52e2bb6572141d5615e098
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος ὑπολαβών
    start_char: 48641
    end_char: 48661
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0363
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294c
char_span:
  start_char: 48773
  end_char: 48795
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2409360d6f8752991aa43e311c71c59c3049fb84f15f39dc4ead42e5f3ccbfe2
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 48663
    end_char: 48795
    text_sha256: acc00c04dcf4571901099b413313053a6ce99ffcf7960dfc652dda32b908c9e7
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers Ctesippus' demand, which is addressed by vocative to Διονυσόδωρε and asks for a proof in the dual (ἐπιδείξατον); its answer is that named addressee's, which excludes Euthydemus, and Ctesippus is excluded as the party it answers.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0364
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294c
char_span:
  start_char: 48795
  end_char: 48865
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d53670f8f180965487115db4380601e406144dc2509295ff0df03299981fe311
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 48795
    end_char: 49261
    text_sha256: 88f25087b45be9ef81e10a528fe3d38e6ff095812328635a12434890993e9354
  rationale: "The span names Εὐθύδημον in the third person, which excludes him, and its second person (οἶσθα ... ὁπόσους σύ) addresses the party Ctesippus has just named Διονυσόδωρε, which excludes Dionysodorus. The narration closing the context names the questioner outright: καθ’ ἓν ἕκαστον ἐρωτώμενοι ὑπὸ Κτησίππου, and again ὁ γὰρ Κτήσιππος ... οὐδὲν ὅτι οὐκ ἠρώτα. That excludes the narrator, who reports it."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0365
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294c
char_span:
  start_char: 48865
  end_char: 48921
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5276751893da97da8e6e638e4d523f8457e10365f953a52ce5c09590d9407466
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 48663
    end_char: 48921
    text_sha256: 47c73a0cade56038a7b3154815ea66d4fbdaec8bf66e1ed2e03924ebd9d8fc11
  rationale: In-span ἔφη is third person, excluding the narrator, its first person plural ἐπιστάμεθα is the visiting pair's, and its second person σοι addresses the questioner, which excludes Ctesippus — named as that questioner by the narration below. The question it answers is put to the party Ctesippus addressed as Διονυσόδωρε, so the answer is his and Euthydemus is excluded.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0366
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294c-294d
char_span:
  start_char: 48921
  end_char: 49133
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 00ea6956071fdab00bec7df3f59832a3a98bba5bf7a9bc36a5698d649cc64926
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 48921
    end_char: 49261
    text_sha256: 775a9ffe5ed8c78f0c63acf21e17d6b74ae105a71a817fb5d72eba28abd55dd4
  rationale: "In-span ἦ δ’ ὅς is third person, excluding the narrator, and the span addresses the two visitors in the dual (εἴπατον, ἐπιδείξατον, λέγετον), which excludes both brothers. The narration closing the context names the remaining party as the questioner of this whole stretch: καθ’ ἓν ἕκαστον ἐρωτώμενοι ὑπὸ Κτησίππου, and ὁ γὰρ Κτήσιππος ... οὐδὲν ὅτι οὐκ ἠρώτα τελευτῶν."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0368
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49635
  end_char: 49639
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9ef878e8205d077a7862f27ab22ccfbab9a9a0113650bd4d225731a438253eb2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: "With τὸν Εὐθύδημον bracketed as deleted, the anaphoric ὁ δέ of ὁ δέ, πάνυ, ἔφη has no secure antecedent: on the transmitted text it is the Euthydemus who was asked, on the edited text the nearest nominative is ὁ Διονυσόδωρος, the subject of the embedded question. ἔφη excludes the narrator and the question is about the visiting pair, so the two brothers remain."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0369
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49646
  end_char: 49764
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 07158072b8fb597a4431b7d6a19d2433815284d756e765bdb73e7b07561f2ddd
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 49660
    end_char: 49669
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0370
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49764
  end_char: 49788
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ab09fe1cb17b4b654c127fb152e5a439022ccca17cca4f0fd0164948dd7095be
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator. The question it answers is put in the second person to a party the narrator calls τηλικοῦτος ὤν, one of the elderly visitors, which excludes Ctesippus; nothing distinguishes Euthydemus from Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0371
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49788
  end_char: 49853
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 220026070d7a4e5acbc6b2f5d155d9451eb5ec7c6f496ba0373cb59fa524f6a4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 49804
    end_char: 49813
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0372
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49853
  end_char: 49871
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f35bc5fee362643d8049f6297a91bd926c01aed14952e54fa154502bf0c4f1f8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator, and the span answers a question put in the dual to the two visitors (πάντα νῦν μόνον ἐπίστασθον ἢ καὶ ἀεί;), which excludes Ctesippus. Nothing distinguishes Euthydemus from Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0373
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0070
stephanus_span: 294e
char_span:
  start_char: 49871
  end_char: 49933
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 14fb808c4f9bcfaba9f71e08d0fe338e8e62d9a629e9282713d19e1c0a1e690b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΚΤΗΣ.
unresolved_reason: The span carries no reporting verb and no vocative. Its dual ἤστην and second person plural ἠπίστασθε address the two visitors, which excludes both brothers; the narrator and Ctesippus remain open, and the assent it draws is narrated (ἐφάτην ἅμα ἀμφοτέρω), not spoken.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0374
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a
char_span:
  start_char: 50034
  end_char: 50061
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7485361d2c4996f59c766ef7d2545e9c5483734f62eb52fdd0b4023bc9392168
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0375
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a
char_span:
  start_char: 50061
  end_char: 50132
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 149a086dbf4f652229ed72762e4b6035b1c7e4867245fdbdd01a58d0dac0dfae
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 50018
    end_char: 50132
    text_sha256: 5c9cf504fe01a80ed8641f506c69ed023e952475a7c0307e1f8367a72fc90afc
  rationale: The transmitted first person here is ἐγώ; the reporting words ἦν δ’ that stand beside it are inside editorial {add} brackets, so no printed formula licenses the span and this adjudication is used instead. The span answers the question above it, which the named formula ὁ δ’ Εὐθύδημος ... ἔφη attributes to Euthydemus and which addresses ὦ Σώκρατες, so its speaker is that named addressee; the span's own ὑμᾶς then addresses the visitors in the plural, excluding both brothers.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0376
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a
char_span:
  start_char: 50132
  end_char: 50228
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b68cf659d73b70d02c9b58bd72387c9f4a7bc6c0cc11bc79ce3ecf14490c395a
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 50145
    end_char: 50148
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0377
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a
char_span:
  start_char: 50228
  end_char: 50418
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ccfd2496ec7ceb8f5eacb2f3e319f57eb933f98df11c836cea4e809cf3a25b36
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50242
    end_char: 50251
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0378
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295a-295b
char_span:
  start_char: 50418
  end_char: 50448
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c327afd4c0807a663fd904e5590375576f93c4692a6059441f9d2c80a649b624
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 50436
    end_char: 50439
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0379
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50448
  end_char: 50477
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f6acb192b6feed09564131fe04dcbd464714dfe09c2cf390079c121a001a3516
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. ὡς ἀποκρινουμένου ἐρώτα is a bare imperative with a genitive absolute participle and no person marking that could separate the two parties."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0380
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50477
  end_char: 50529
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 442b3715e0f1dda7cf408e5ca1f177f7bead22a803b57654ba1ba9a147bb4d63
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 50490
    end_char: 50493
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0381
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50529
  end_char: 50536
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5eb6c30f5b5c3557fd62352ead4b29b1a7f76606db3514b91862aa57686b11d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. ἔγωγε is a first-person pronoun, which licenses nothing; reading the speaker off the ἔφη-marked question beside it would be alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0382
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50536
  end_char: 50596
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: be58e9f4b0bf6bb586209a2a36a29ddc8c85c5286f64a98fe1c7bffb58241aaa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. Its second person (ἐπιστήμων εἶ, ἐπίστασαι) addresses the other party, which in a two-party exchange is true of every utterance and so discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0383
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50596
  end_char: 50661
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 68bede65e5cfdfced3636e47a40d9a147432992882151abe02a0ee4b27b51798
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. Its first and second persons (οἶμαι ... σε ... λέγεις) mark speaker and addressee only relative to each other, which in a two-party exchange discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0384
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b
char_span:
  start_char: 50661
  end_char: 50717
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2b0f30ef43cb97f30126380f8777d33a92afa25749643d8b587800f313589f90
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 50678
    end_char: 50681
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0385
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295b-295c
char_span:
  start_char: 50717
  end_char: 50873
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 41bf2df56abc8b903be946c88966fe3a83b98e4c44a8431d7e1399ca230ec7e5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50727
    end_char: 50736
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0386
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 50873
  end_char: 50917
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5fc297168f7de8520b7db2bf80bc2d7e0a5b57d122ad1157d8bfccc43719bc3d
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 50904
    end_char: 50907
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0387
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 50917
  end_char: 50939
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 164db137612757a46b762232436e3e848cf2f332f552836ef306ea4415e4aa21
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50928
    end_char: 50937
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0388
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 50939
  end_char: 50987
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 20730e9696e872db451974c785521b29b1d1db16c1963fcae71fec4272ae9a2d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. πρὸς τοῦτο τοίνυν ἀποκρίνου ὃ ὑπολαμβάνεις is a bare imperative addressed to the other party, which in a two-party exchange discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0389
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 50987
  end_char: 51138
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c5c8316761c505e510864daee7002a310af72e61942958e2518633db76b70434
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 50999
    end_char: 51003
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0390
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 51138
  end_char: 51188
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fb4521250ba52bba617abb0e065b8fef86a949d3046d9c821cf19aa5fe21c347
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἦ δ’ ὅς
    start_char: 51150
    end_char: 51157
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0391
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c
char_span:
  start_char: 51188
  end_char: 51260
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0ddad6977840db7bba95b8a1b47c8713fec07eb2c9d133fc682db1de336b334e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 51223
    end_char: 51232
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0392
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295c-295d
char_span:
  start_char: 51260
  end_char: 51367
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 48f9d428a27f1193cea738166328a06eab7a293bf9b29a66065d7e62e6e0118e
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 51278
    end_char: 51281
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0393
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295d-295e
char_span:
  start_char: 51729
  end_char: 51910
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 44a45cbae57f57eef1fcd8978d3aaf97d4896e315c685c560aeacc3c272a82d4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον οὖν
    start_char: 51729
    end_char: 51738
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0394
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295e
char_span:
  start_char: 51910
  end_char: 51979
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 72d243bc46f0b4ac3577728c7178aec82e39993773a89b6c98b5775056b8f5e7
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 51928
    end_char: 51931
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0395
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0071
stephanus_span: 295e
char_span:
  start_char: 51979
  end_char: 52005
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fc0dde9c9c7885838681e677d97a7d63064efea40a2fe3b2c2518a03fe2eedb4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 51987
    end_char: 51991
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0396
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a
char_span:
  start_char: 52016
  end_char: 52115
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b16ab158ead07a4e7d11eacc5ad1ee46216e659fdb15ea7e83824ff2ee89f152
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 52030
    end_char: 52033
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0397
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a
char_span:
  start_char: 52115
  end_char: 52258
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7abf16623ded34000cbc83379fdd04b66279ee6a6f5d3dcaf1be9b6730bdbc32
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 52129
    end_char: 52137
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0398
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a
char_span:
  start_char: 52258
  end_char: 52340
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 994672cc3994337e1d65d834da9c9e0372a9c7b545d90ca8f8c20e53b6b456d2
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἦ δ’ ὅς
    start_char: 52268
    end_char: 52275
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0399
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a
char_span:
  start_char: 52340
  end_char: 52380
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2d437ed985d477b7f596edae024953c99d0b569f895121745b01fe84224ae06e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 52362
    end_char: 52371
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0400
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a
char_span:
  start_char: 52380
  end_char: 52420
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c884580c7a924c10228a79e6eec788d7c068d7eae748660ecd2cec0f308b4d96
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 52392
    end_char: 52395
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0401
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296a-296b
char_span:
  start_char: 52420
  end_char: 52481
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dcd3393f3778640ddad9ab31720a2ef1eec6136daf4240512e4835425fb3690e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. Its first person plural ἡμᾶς covers both parties, and the quoted {q} ἀεί {/q} is the other party's own word repeated, not a person marking."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0402
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52481
  end_char: 52560
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5f76e7e886e6176b8af115f898103610ebe91d3f8d2579a80240ee764764f3c6
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 52501
    end_char: 52504
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0403
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52560
  end_char: 52614
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 74a4ab6095d3c2d7cac9c14ede75209aab32d0163068d3a95da7994ebc48621e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 52566
    end_char: 52575
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0597
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52614
  end_char: 52736
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6a034c0179d7b3622633da8af5927b1afe89ed03d192671cdf6dd1173b08599a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΕΥΘ.
unresolved_reason: "Inside the bounded Socrates-Euthydemus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. Its second persons address the other party, which in a two-party exchange is true of every utterance. Split out of the ἦν δ’ ἐγώ-marked reply above, whose span had swallowed it across the speaker dash."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0404
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52736
  end_char: 52778
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fcadfb56ca55e8c5adaeb273f6b47060574346acddd0ceeceedd9bf71ed8eea3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 52744
    end_char: 52752
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0405
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52778
  end_char: 52826
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 713149794cdc6012fc5238a786a1184b64431e53a9c2b99d229a409cff141702
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 52796
    end_char: 52799
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0406
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b
char_span:
  start_char: 52826
  end_char: 52881
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 840db4697bba398c96d2b99c031986a1049373b69900e8192eeb221ce93e78e8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 52843
    end_char: 52851
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0407
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296b-296c
char_span:
  start_char: 52881
  end_char: 53012
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2faf3484c99aefebaebd6f50175f69b095655025a743f06f6753f54e479e90bb
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 52899
    end_char: 52902
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0408
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296c
char_span:
  start_char: 53012
  end_char: 53045
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5507088b15b4691948ba40768918174073a66a71f534989d00b75e5da6f29cbc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 53034
    end_char: 53043
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0409
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296c
char_span:
  start_char: 53045
  end_char: 53128
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7c7fd4e1b0872ed78d1ef5ab0ecc736ef5e61260530096ab17fed0d058ea9c5a
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: καὶ ὃς εἶπε
    start_char: 53049
    end_char: 53060
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0410
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296c
char_span:
  start_char: 53128
  end_char: 53229
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 51078c34269dc5cceb34997544007660f1dd1379a6c0911e1b209fb483fbe9f1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 53139
    end_char: 53147
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0411
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296c-296d
char_span:
  start_char: 53229
  end_char: 53607
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4de1847ce3f5a26e76f11a8f5b6915a267aaff20e21de90998c89105083d045e
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 53554
    end_char: 53557
  - kind: named_reporting_formula
    role: exchange_open
    text: ὁ δ’ Εὐθύδημος, ἀπιστεῖς, ἔφη
    start_char: 50018
    end_char: 50047
  - kind: named_reporting_formula
    role: exchange_close
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0413
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296d-296e
char_span:
  start_char: 53607
  end_char: 54094
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c16d29fb147656ad3f4a852fc97c2d8824534b26a60cd3afa0470f9cb15b0283
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 53628
    end_char: 53637
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0414
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296e
char_span:
  start_char: 54094
  end_char: 54121
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 27daf9987207351f639801f28f6ff9ac8f6e25b1d6d7347a2ae8a83ad981a504
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
  context_span:
    start_char: 53803
    end_char: 54121
    text_sha256: fc7c7b5a8445f6d7f573b74da5721bef3aa6c0790abb7e085218a34e05a1b01a
  rationale: "Context opens at εἴπετον δέ μοι, the second-person dual imperative with which the speaker turns from one brother to both (ὑμῖν, ὑμεῖς), so the two-party bound opened at 50018 no longer holds here and its ἔφη discriminates nothing. Inside the context the address returns to one man and names him: τὰ δὲ τοιάδε πῶς φῶ ἐπίστασθαι, Εὐθύδημε ... φέρε εἰπέ, a vocative plus a singular imperative. This span answers that demand directly, so its speaker is the one addressed. Context stops at the record's own end, before the next named speaker ἔφη ὁ Διονυσόδωρος at 54306."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0415
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296e
char_span:
  start_char: 54121
  end_char: 54140
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0ed4815c733a647d9edb5f88677e7652610e86910b5bf6131f2096e9667e39f1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 54129
    end_char: 54138
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0416
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0072
stephanus_span: 296e
char_span:
  start_char: 54140
  end_char: 54176
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b706b836475ba276a95af00557d7bb6c679b8587c345a0292b5eb3c8e81a207a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: "An answer to the narrator's own ἦν δ’ ἐγώ-marked τί; at 54121, so the narrator is excluded; but the span has no cue of its own — no reporting verb, no vocative — and ὅτι οὐκ ἄδικοί εἰσιν οἱ ἀγαθοί is a bare third-person clause. The 50018 bound is unavailable here: from 53803 the address is dual and plural to both brothers, and the next named reply is ἔφη ὁ Διονυσόδωρος at 54306."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0417
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a
char_span:
  start_char: 54187
  end_char: 54293
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 09ff6b39a8c8b427b6501841e22780c126e5d1e04f587a3f834959cecb376d14
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 54200
    end_char: 54209
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0418
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a
char_span:
  start_char: 54293
  end_char: 54304
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e9c07ee5c737a896f2ef9e2a4ad31e9a33039c13aaecd6ffc20e9fcda2a61e9a
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 54306
    end_char: 54324
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0419
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a
char_span:
  start_char: 54326
  end_char: 54366
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a1284f48aee4619f5e62617a671ab4ed698225e5ff64dd3963129ce37754859a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 54349
    end_char: 54353
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0420
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a
char_span:
  start_char: 54366
  end_char: 54510
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9531b869cb4bc01e6c20ddf30dc9c1c6e46157e1510af12bc46db9921d69354f
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, τὸν λόγον, ὁ Εὐθύδημος
    start_char: 54383
    end_char: 54410
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0421
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297a-297b
char_span:
  start_char: 54541
  end_char: 54645
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 781b23cb3d9fcc680f927fee1e0c09381af1f12886df1c7c41f4104ebb3b3c0f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 54554
    end_char: 54563
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0422
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297b
char_span:
  start_char: 54645
  end_char: 54685
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8a35f584817a89f365789f813f1398187b1e0c203c10e8d54ea338e5fc939b0e
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ταχὺ ὑπολαβὼν ὁ Διονυσόδωρος
    start_char: 54687
    end_char: 54715
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0423
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297b
char_span:
  start_char: 54717
  end_char: 54859
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2db36ab048eb93f6651d5493877fcd61a6dbbb76150dbd15e5662e4844b24146
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ εἶπον
    start_char: 54721
    end_char: 54731
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0424
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297b
char_span:
  start_char: 54859
  end_char: 54935
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c89e34eda5b04459b1d5d6817d547775b11137d8399a9ad8d52faa11b68fc96d
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ Σώκρατες, ὁ Διονυσόδωρος
    start_char: 54872
    end_char: 54903
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0425
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297b-297d
char_span:
  start_char: 54935
  end_char: 55549
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f86e43ab1c2a2856b1d1ebe693ea1f9d837e968124c92c3df445d2924cab031d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον ἐγώ
    start_char: 54951
    end_char: 54960
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0426
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297d
char_span:
  start_char: 55549
  end_char: 55671
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c0e7387aad22a93a88ebe17b77bc5377e64772f51c2d4de354e47041066642ba
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0427
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297d
char_span:
  start_char: 55671
  end_char: 55858
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: dcc114663c61ca7bcd5af7b53ec4d71baab7e9b4f899803a83494851fb579692
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 55712
    end_char: 55721
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0428
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297d
char_span:
  start_char: 55858
  end_char: 55877
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d2fdb8609928398166ade5b63a88298eb4e63628eed39e286e409428a3f5daa8
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 55873
    end_char: 55876
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0429
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297d-297e
char_span:
  start_char: 55877
  end_char: 56096
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 707d7d6e87e4d1e129b00ea317f715d86d292467576194fa03485854ae92e7c2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἀποκρίνομαι δή, εἶπον
    start_char: 55878
    end_char: 55899
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0430
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297e
char_span:
  start_char: 56096
  end_char: 56124
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ab430db1c458ab41a7c0c24dea857bc5a6491bce1ae33650b7f77c618e8e0031
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἦ δ’ ὅς
    start_char: 56111
    end_char: 56118
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0431
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297e
char_span:
  start_char: 56124
  end_char: 56180
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b4a277e81e28d89adcfe1500901e1b34cc946262383c4f2db353b1e291ede52e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 56134
    end_char: 56142
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0432
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297e
char_span:
  start_char: 56180
  end_char: 56218
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f3766e9c0be5eb8a5395c3bafa7fb4d4fc4261fd8944c3dac314d114a154aeab
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: The span carries no reporting verb, no vocative and no person marking of its own beyond the second-person σοι, which addresses the other party in what is by then a two-party exchange and so discriminates nothing. Its neighbours are all marked — ἔφην ἐγώ before, ἔφην after — but reading the speaker off them would be alternation.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0433
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297e
char_span:
  start_char: 56218
  end_char: 56313
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b6c82f7553dd04d88be12c8ee95ae51cd46447d8985aaee62020e9c5ad24a8f0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 56250
    end_char: 56254
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0434
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0073
stephanus_span: 297e
char_span:
  start_char: 56313
  end_char: 56360
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8b14ae10d80adf80316f8fb0d8271503611d55bbf1c41081d9ba28ea567fc709
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 56327
    end_char: 56330
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0435
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 297e-298a
char_span:
  start_char: 56364
  end_char: 56414
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2c60f813b902042f0490a9a8051189d1887e6a7a6a29e77a9b875ef848ae4dbc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 56380
    end_char: 56384
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0436
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56414
  end_char: 56464
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 170b59a59d6af192c53b88f46bf5f577574215752c9c65a5a073a8df44322735
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἦ δ’ ὅς
    start_char: 56423
    end_char: 56430
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0437
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56464
  end_char: 56485
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cc58856b1ea7dbe4769f437ff4e5c0f165f4b12bb8bd3d62a0792ffcb8b1d9f5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 56476
    end_char: 56484
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0438
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56485
  end_char: 56545
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ae9a10a960cc3c373439e73cb129a82d174ba75bbca8423def425722b865a75a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "Inside the bounded Socrates-Dionysodorus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. Its second person σὺ εἶ addresses the other party, which inside a two-party exchange is true of every utterance and discriminates nothing."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0439
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56545
  end_char: 56615
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 156f4dc3b663c42861ad41562079fd27e43133565696440b07acf9a07818daae
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 56565
    end_char: 56569
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0440
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56615
  end_char: 56649
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8ca62608c24de4e975bd2e0defe1fe1436a61f6d2b5edeba152803d64232c4e8
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 56634
    end_char: 56637
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0441
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56649
  end_char: 56664
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2549b4cf32d24c4e9ae1d4a0eaa7c7e19db5c5713fd1d18e44759747facfcea9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "Inside the bounded Socrates-Dionysodorus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. ἕτερος μέντοι is a bare two-word assent with no person marking at all."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0442
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56664
  end_char: 56750
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7b165b0fe9a4028796d83289909d709168a27dbe5e0847703616001c3f6a86fe
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἦ δ’ ὅς
    start_char: 56685
    end_char: 56692
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0443
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56750
  end_char: 56762
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2281dd2be608c4527a66b1b8fd2d274e56291b5bc36e2d61db6ee1e9a7f00f56
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "Inside the bounded Socrates-Dionysodorus exchange an anchored dialogue turn still needs a cue printed in its own span, and this one has none: no reporting verb and no vocative. ἔστι ταῦτα is a bare three-word assent with no person marking at all."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0444
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a
char_span:
  start_char: 56762
  end_char: 56842
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9ba77ecd64aac7e2a475fdcdfefe76f06bd1b3b6adf0d4802fc9cfdc078e9e87
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ἔφη
    start_char: 56788
    end_char: 56791
  - kind: named_reporting_formula
    role: exchange_open
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 55567
    end_char: 55585
  - kind: named_reporting_formula
    role: exchange_close
    text: ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56934
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0445
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298a-298b
char_span:
  start_char: 56842
  end_char: 56885
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a01c247b12a406b792f55515d62a9ecdc7db9590da8d6bbaf304e6b6f4bb29c4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 56851
    end_char: 56860
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0446
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b
char_span:
  start_char: 56885
  end_char: 57044
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 772234162586520dd99778566f635a9ec2852dad7159ac745f91b6063dbf5bdd
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, πατήρ ἐστιν ὁ Χαιρέδημος, ὑπολαβὼν ὁ Εὐθύδημος
    start_char: 56903
    end_char: 56954
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0447
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b
char_span:
  start_char: 57077
  end_char: 57158
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b52131db5442300529d6ba1749d7ad3da3549d563c1c378cae5776a438640d8d
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: καὶ ὁ Κτήσιππος ἐκδεξάμενος, ὁ δὲ ὑμέτερος, ἔφη
    start_char: 57048
    end_char: 57095
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0448
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b
char_span:
  start_char: 57158
  end_char: 57178
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: aa97c2ce7f962cfef213f826dcb25c342b7d20db19d6adce11c17970d52a3c4c
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ὁ Εὐθύδημος
    start_char: 57180
    end_char: 57191
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0449
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b
char_span:
  start_char: 57192
  end_char: 57216
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7552903e7f215b0ac4f655e36ffe3db387152b4cec998569665619d0bcbb3d27
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. Its ἦ δ’ ὅς excludes only the narrator, who does not speak inside the bound.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0450
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b
char_span:
  start_char: 57216
  end_char: 57232
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f17a52fc6669b225fbf2a3d3efbf75a3d2ca16026e4ca51d81792b2c06a51d98
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. ὁ αὐτὸς μέντοι is a bare assent with no cue at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0451
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298b-298c
char_span:
  start_char: 57232
  end_char: 57334
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e6a43538a7bbfd44540f3986f4fa18d482ef8552e51ad0761f397444dd98bec8
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    role: cue
    text: ὦ Εὐθύδημε
    start_char: 57275
    end_char: 57285
  - kind: named_reporting_formula
    role: exchange_open
    text: καὶ ὁ Κτήσιππος ἐκδεξάμενος, ὁ δὲ ὑμέτερος, ἔφη
    start_char: 57048
    end_char: 57095
  - kind: named_reporting_formula
    role: exchange_close
    text: ἦ δ’ ὃς ὁ Διονυσόδωρος
    start_char: 58022
    end_char: 58044
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0452
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57334
  end_char: 57400
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e33f8bb8733ef763b52789572580582ad88c8cb1b4ff51b710be2ecdf880ae34
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 57232
    end_char: 57400
    text_sha256: 8836b9f2a0d0376299eca28c1764521e362a3e52ac62d5d70fac0ac1440ecea0
  rationale: In-span ἔφη is third person, excluding the narrator, who does not speak between the named formula that opens this exchange and the one that closes it. The span answers the question before it, which is addressed by vocative to ὦ Εὐθύδημε; the answerer of a question put to a named addressee is that addressee, and Ctesippus is excluded as the party who put it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0453
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57400
  end_char: 57411
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: cb38b858cec465fc5544a6301148c75a4f5ba34dac2d9844e481022ab350fa64
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 57413
    end_char: 57428
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0454
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57429
  end_char: 57503
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3cd30d025edca00194722fcf86a588803733709d733723fff4f574dee2ccb23e
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 57429
    end_char: 57639
    text_sha256: a2bf9272c6d4064caf1df3eb5049e6d98d26d6a88d25ee163d01690dd49019e0
  rationale: The two printed segments are one utterance, split at the parenthetical ἦ δ’ ὅς, which is third person and excludes the narrator. The reply it draws is the named ἔφη ὁ Κτήσιππος and is addressed by vocative to ὦ Εὐθύδημε, which names this speaker; Ctesippus is excluded as the party replying.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0456
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57503
  end_char: 57639
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9e7812c720cc85422fb915d007fa9b00b4702550e9fb3e40bf5a399119f0ec29
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 57512
    end_char: 57527
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0457
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57639
  end_char: 57656
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e065779e1baedc05e58b98274af0f37c2758d2c5f9e643a4571acb8e573e4ee1
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 57503
    end_char: 57656
    text_sha256: bee3cf19c98ae486768bf5f33f36c12c33fefe0c5bd0bf4876967f29bf045b93
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the utterance before it, which the named formula ἔφη ὁ Κτήσιππος attributes to Ctesippus and which is addressed by vocative to ὦ Εὐθύδημε, so this answer is that named addressee's.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0458
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298c
char_span:
  start_char: 57656
  end_char: 57735
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 861abefda298ff8c6819e360fdf05567efce707c3fa6a37f62b3321d2e93413a
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ Κτήσιππος
    start_char: 57675
    end_char: 57694
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0459
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57742
  end_char: 57754
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ede21a83a7e01f83c119db3776ee55c6ea40daa1288247b9e7351baa3bc19192
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 57656
    end_char: 57754
    text_sha256: 636b85ac52c9fdb00ab3111a45385c2298fba00bf76f02386d3ece01d59630c5
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the question before it, which the named formula ἦ δ’ ὃς ὁ Κτήσιππος attributes to Ctesippus; a question and its answer have different speakers, and inside this bounded two-party exchange the other party is Euthydemus, named at the exchange's opening and addressed by vocative twice within it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0460
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57754
  end_char: 57775
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a4d14df4cdaa46463dc068a1347ebff2e6838f5c80bd4bdd4d4c149755425ca6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. ἦ καὶ μήτηρ ἡ μήτηρ; carries no reporting verb and no person marking.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0461
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57775
  end_char: 57791
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d0af693625ddfc53b623ade6dccac5a7a79ced97f402bcdec1b8cb93d067b6e1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. καὶ ἡ μήτηρ γε is a bare assent with no cue at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0462
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57791
  end_char: 57853
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6b2b635a79b5637aa2bf45bad5ca924aa5f1f0b35eb17b645b060a50ca2beb2d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. Its ἔφη excludes only the narrator, and ἡ σὴ μήτηρ marks the addressee, not the speaker.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0463
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57853
  end_char: 57871
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: eee451fd71e772872e54799dcfc0162df178d45f1e8c383001ffb3fa3bd1ffae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. Its ἔφη excludes only the narrator, and καὶ ἡ σή γ’ turns the same possessive back on the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0464
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57871
  end_char: 57932
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6b3955633b8a71ab50cdec2e7dc476ef6c0c5c75c02bc68c7a3d94b873e45986
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. It carries no reporting verb, and its σύ marks the addressee, not the speaker.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0465
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57932
  end_char: 57949
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4f869dabba414fe7a7d2ba165656af1590cdd1e34ff3f79ec83a8779761b243c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. Its ἔφη excludes only the narrator, and καὶ γὰρ σύ turns the same second person back.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0466
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57949
  end_char: 57985
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2bc899f5d266517987db84b72ebfb2993d41329572679bdaaada445a423a3c0f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. It carries no reporting verb, and its σοι marks the addressee, not the speaker.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0467
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 57985
  end_char: 58004
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 58fa5ae2c7336cf6845f2f27c0f35e7dac7c5f68fc78c8344e00a59aaec77fd9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: Inside the bounded Ctesippus-Euthydemus exchange both parties are third persons to the narrator, so a reporting verb identifies neither; an anchored dialogue turn needs a cue that discriminates, and this span has none. Its ἔφη excludes only the narrator, and καὶ γὰρ σοί turns the same second person back.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0468
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 58004
  end_char: 58122
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 33e0cbedf19af041a61b8342a0cf1b92e862cfe1baa0a3e4d166f733aad4633f
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ Διονυσόδωρος
    start_char: 58022
    end_char: 58044
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0469
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d
char_span:
  start_char: 58122
  end_char: 58139
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b749cabae72d03ed2b0330b383e3e6e8ab2824e7f6d2b903df24c0ccd6f76f5f
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 58141
    end_char: 58156
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0470
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298d-298e
char_span:
  start_char: 58157
  end_char: 58188
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d821491c62ab6c4f52653821872c976ae3cf58bb18dceff509a7805ef32cd563
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. It has no reporting verb at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0471
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58188
  end_char: 58218
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d4ba2529ecfc8179eae02bc86192808bdb9861e74bd0a8b784dacdeb664877a4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. Its ἔφη excludes only the narrator.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0472
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58218
  end_char: 58251
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f002a422904e0c5818f40bb8b997d23d77587c875f7ed0c467544b2e84564b8d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. It has no reporting verb at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0473
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58251
  end_char: 58298
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fbfe59b18e3656faadd48af8934807a877c752e6564ccf21f0d3659dc66888f6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. Its ἔφη excludes only the narrator; ἔγωγε is a first-person pronoun and licenses nothing.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0474
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58298
  end_char: 58327
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 11a11613fe68c888080f1744423afd098d82dfcf229bd93ff37b68921aba03bc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. It has no reporting verb, and its σός marks the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0475
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58327
  end_char: 58341
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d71624fe9c51119400d4760b26a75c7f25403bc92637e5f327cf6d1fbb9cc175
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. Its ἔφη excludes only the narrator.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0476
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58341
  end_char: 58425
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 80ae38076b882f9e600582812eb0a89e28da8339df180dd15f9de3dfe4f48730
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: Inside the Dionysodorus-Ctesippus exchange that the named formula ἦ δ’ ὃς ὁ Διονυσόδωρος opens, both parties are third persons to the narrator, so a reporting verb identifies neither, and this span carries no cue that discriminates. It has no reporting verb, and its σός / σύ mark the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0477
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58507
  end_char: 58570
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: eb5619feb37d91f7061342aba0dc9e738e35a4e0b8cc84049f0bdcaac7b5388a
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὑπολαβὼν ὁ Διονυσόδωρος, ἵνα μὴ πρότερόν τι εἴποι ὁ Κτήσιππος, καὶ ἔτι γέ μοι μικρόν, ἔφη
    start_char: 58444
    end_char: 58533
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0478
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58596
  end_char: 58634
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ccf5a249d8ed6159c668079b081cd4e0a06e3114f5cee1f31f0d6ce7df3ab0aa
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος γελάσας, νὴ τοὺς θεούς, ἔφη
    start_char: 58575
    end_char: 58614
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0479
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0074
stephanus_span: 298e
char_span:
  start_char: 58634
  end_char: 58675
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f108c2e39865717543552abdcb12d68f6b3c93e3cf9d3f4148ed79539ce3f1b9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: "In-span ἔφη is third person, excluding the narrator, and the second person σαυτοῦ addresses the party the named formula ὁ Κτήσιππος γελάσας ... ἔφη has just identified, which excludes Ctesippus. The span presses the question the named Dionysodorus put above, but pressing it is not evidence of who presses: Euthydemus is not excluded."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0480
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299a
char_span:
  start_char: 58686
  end_char: 58948
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 83596324696e4ba00945d6121b8f54dda2153de52cb73422a7124290e7176253
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 58686
    end_char: 59019
    text_sha256: 8991dff9ba5ecf0c88a1177de8c611c44c1ec5bea53ca7475cdfa475cda748a4
  rationale: In-span ἔφη is third person, excluding the narrator; τὸν ὑμέτερον πατέρα and τῆς ὑμετέρας σοφίας address the visiting pair in the plural, excluding both brothers; and the vocative ὦ Εὐθύδημε names one of them as addressee a second time. Of the parties speaking in this scene only Ctesippus is left — and the editorial {del} ὁ Κτήσιππος {/del} beside that vocative is a copyist's gloss of exactly this identification, not evidence.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0481
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299a
char_span:
  start_char: 58948
  end_char: 59019
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 88a4b2c10fceeeee2955f652ea6767d3a1ff1eb820cf9a6809f98a38d277c6e6
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 58686
    end_char: 59060
    text_sha256: 1504616717702a64b4c7d6880d64df67ca3c7e822205af0a778b4b8206d36af0
  rationale: The in-span vocative ὦ Κτήσιππε names the addressee, excluding him, and the span answers the taunt above it, which is addressed by vocative to ὦ Εὐθύδημε; the answerer of a remark put to a named addressee is that addressee, so Dionysodorus is excluded too. Its οὔτ’ ἐκεῖνος οὔτε σύ keeps the same second person.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0482
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299a
char_span:
  start_char: 59019
  end_char: 59060
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 52eb7da351fbbea2d6f20b5628bb44739557d8dac277e71b759f17384cc2521d
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 58948
    end_char: 59060
    text_sha256: 56517d9d7d80e06fa2c55ea9994dced04b68dd32903831062513f215952ee395
  rationale: In-span ἦ δ’ ὅς is third person, excluding the narrator, and the vocative ὦ Εὐθύδημε names the addressee, excluding him. The span answers the reply above it, which is addressed by vocative to ὦ Κτήσιππε, so its speaker is that named addressee and Dionysodorus is excluded.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0483
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299a-299b
char_span:
  start_char: 59060
  end_char: 59280
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 45ec796366a7646ad5f7a67412dc11ca52482e3735925e2eccbe7a9bc51de51f
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 59019
    end_char: 59280
    text_sha256: 4d449d3b2b71332e8f35d1af4ca6ae59390d81efba6e3e2122411c76f849547e
  rationale: The in-span vocative ὦ Κτήσιππε names the addressee, excluding him. The span answers the question above it, which is addressed by vocative to ὦ Εὐθύδημε, so its speaker is that named addressee; Dionysodorus is excluded with Ctesippus, and the narrator does not speak inside this exchange.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0484
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299b
char_span:
  start_char: 59280
  end_char: 59329
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5561827ac742519ee555a604e819df36b52921bc34a841406807e17fe33f0f82
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 59060
    end_char: 59329
    text_sha256: f3eed0160a76f42a0d48cb610fc39ead73528dea640081534e482f537fdcfd1e
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the question above it, which is addressed by vocative to ὦ Κτήσιππε (εἰπὲ γάρ μοι, ὦ Κτήσιππε, εἰ ἀγαθὸν νομίζεις), so its speaker is that named addressee; both brothers are excluded as the party who put it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0485
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299b
char_span:
  start_char: 59329
  end_char: 59552
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 265b4e69df314d5f721795e7d8439b83edcad7e0b5765f5b5b907dd6e6d579e3
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 59280
    end_char: 59656
    text_sha256: e4ea15ecc7ebc7d36a83c26334a03af97e0cf4e5c8aa472f77c7de671abf159c
  rationale: In-span ἔφη is third person, excluding the narrator, and σὺ ἄριστα εἴσῃ ... ἀλλ’ ἀποκρίνου addresses the party who has just answered. The reply this span draws carries the named formula ὁ Κτήσιππος εἶπεν and is addressed by vocative to ὦ Εὐθύδημε, which names this speaker and excludes Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0486
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299b-299c
char_span:
  start_char: 59576
  end_char: 59656
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f0540ec52a85c7693452578b65c6dbfad5e19a7d6b4f9ccb7509a5bbd825f550
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος εἶπεν
    start_char: 59557
    end_char: 59574
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0487
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299c
char_span:
  start_char: 59656
  end_char: 59786
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2b469a6ba916ba89e1016ca1966e078823b3cd464e2e23a9287463b98f8438c7
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΚΤΗΣ.
  context_span:
    start_char: 59552
    end_char: 59866
    text_sha256: db139156d7ff7d43606bacbdac2c04ccbfc77e586d56d30294597476e887992a
  rationale: In-span ἔφη is third person, excluding the narrator. The span answers the utterance above it, which the named formula ὁ Κτήσιππος εἶπεν attributes to Ctesippus and which addresses ὦ Εὐθύδημε; the reply it in turn draws is again named ἔφη ὁ Κτήσιππος and again addresses ὦ Εὐθύδημε, so this speaker is named on both sides.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0488
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299c
char_span:
  start_char: 59786
  end_char: 59866
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8d3924075fc6ec7b94828d23f4a5547051091199b869c63509464cd99e31a8ab
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 59799
    end_char: 59814
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0489
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299c
char_span:
  start_char: 59866
  end_char: 59873
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5eb6c30f5b5c3557fd62352ead4b29b1a7f76606db3514b91862aa57686b11d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: A bare first-person assent with no reporting verb and no vocative; ἔγωγε is a pronoun and licenses nothing. It answers a question the named ἔφη ὁ Κτήσιππος addressed to ὦ Εὐθύδημε, which makes Euthydemus the natural reading, but nothing in the span itself marks a speaker and the narrator is not a party to this exchange.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0490
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299c
char_span:
  start_char: 59873
  end_char: 60014
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5a608f36146992721252b79aa2281cc109b47144ae3e2a0e46f9add0d720bb20
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 59866
    end_char: 60122
    text_sha256: a412ab4ad0b4ef733b73ff36ea6f70d8627a5e0f50325a200a4fcef990c0db59
  rationale: "In-span ἔφη is third person, excluding the narrator. The span addresses σέ as ὁπλομάχην ὄντα and names τόνδε τὸν ἑταῖρον beside him, so both visitors are excluded — one as addressee, one as third-person referent. The narration immediately after confirms the division: καὶ ὁ μὲν Εὐθύδημος ἐσίγησεν· ὁ δὲ Διονυσόδωρος ... ἤρετο."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0491
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60122
  end_char: 60180
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c112cd78b94313e446134ea36314b2677fb9da5b880fc698d43e056da8ffcd14
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: ὁ δὲ Διονυσόδωρος πρὸς {299d} τὰ πρότερον ἀποκεκριμένα τῷ Κτησίππῳ ἤρετο
    start_char: 60048
    end_char: 60120
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0492
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60180
  end_char: 60204
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a803d325f42a1f80944e6b7f3a80f69fd318b912e3818360ce3bb2ed8892971e
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 60206
    end_char: 60221
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0493
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60222
  end_char: 60283
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e3877bdd469fc95e030fdc83338dc1594c3c7724c1e7edab2241e74e37565c78
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch is questioned by the named Dionysodorus and answered by the named Ctesippus, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb, and its σοι marks the addressee. The reading is further unsettled because Ctesippus' next named speech addresses ὦ Εὐθύδημε, not Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0494
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60283
  end_char: 60299
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: f23c29985a6bb244de97f1ed0f09b3120689ed9b9cbb6d806f54889a102c9a7d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch is questioned by the named Dionysodorus and answered by the named Ctesippus, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἔφη excludes only the narrator. The reading is further unsettled because Ctesippus' next named speech addresses ὦ Εὐθύδημε, not Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0495
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60299
  end_char: 60345
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a2b461f96a1fa57c375341996027be894b28603a8ca7952fbb5362f2e002e6f3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch is questioned by the named Dionysodorus and answered by the named Ctesippus, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb, and its ὁμολογεῖς marks the addressee. The reading is further unsettled because Ctesippus' next named speech addresses ὦ Εὐθύδημε, not Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0496
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d
char_span:
  start_char: 60345
  end_char: 60373
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9ad9a2b27d283341bf3fdfd1416c63552372a16232a894651a6d1f2e1593ddf8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch is questioned by the named Dionysodorus and answered by the named Ctesippus, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἦ δ’ ὅς excludes only the narrator, and ὡμολόγηκα is the speaker's own first person. Ctesippus' next named speech addresses ὦ Εὐθύδημε, which unsettles the reading further.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0497
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299d-299e
char_span:
  start_char: 60373
  end_char: 60583
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 66dc77b24ce6fa8b3c532981d22d3ca4146f31168fca563f8038df601131edc7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch is questioned by the named Dionysodorus and answered by the named Ctesippus, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb and no vocative. The reading is further unsettled because Ctesippus' next named speech addresses ὦ Εὐθύδημε, not Dionysodorus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0498
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0075
stephanus_span: 299e
char_span:
  start_char: 60583
  end_char: 60936
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 039e53cd6158425fc7f564819c2feabf6ddcee873d9e90c703d4a104ff19215c
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 60609
    end_char: 60624
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0499
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 60947
  end_char: 61051
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 68d6ef02f14f5d27f0bb0723894e9933f55579f1757641b43bea785fda1cbc9b
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Εὐθύδημος
    start_char: 60970
    end_char: 60985
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0500
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61051
  end_char: 61068
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ac28439f0556bbbdcf59d26d68fabeaf12b87425f92977e511893f2eb3bcf888
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. τὰ δυνατὰ δήπου is a bare answer with no cue at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0501
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61068
  end_char: 61088
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b1abd8fb1b93cbc128e78f8fc21bdc03d51dfefcf057920da7eb828467307eb9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἔφη excludes only the narrator, and καὶ σύ marks the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0502
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61088
  end_char: 61094
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ef43f9208a8bd801362b92370baf6a11df5c2677ae78f7aba8074b3135d0b5c1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. κἀγώ is a first-person pronoun, which licenses nothing.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0503
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61094
  end_char: 61122
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 02d004876801bc717273540b8c4ed7c7eaf897393a29e0818092c5d0be94b920
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb; its ἡμέτερα is a first person plural that could cover either party's side.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0504
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61122
  end_char: 61127
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2b837410d88081471a0c0bb64ea298e7f52fccbbca3fb920063b1b37f49f7c6e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. ναί is a bare assent with no cue at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0505
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61127
  end_char: 61156
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6631999f81e966c614198eed18de754bfc5a01b597d9c5aff3b4ddb2cc8aefe2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb, no vocative and no person marking.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0506
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61156
  end_char: 61165
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 41b942b182094e586da23a1aef49732b4825dc2822ed500cb17f3627bad6c599
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 61167
    end_char: 61182
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0507
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a
char_span:
  start_char: 61183
  end_char: 61199
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5cec96f691440695733380fe72e354f5d6dddc2bd07e473ac57d3a258f4acb97
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. τί δέ; ἦ δ’ ὅς. is a two-word question whose ἦ δ’ ὅς excludes only the narrator.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0508
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300a-300b
char_span:
  start_char: 61199
  end_char: 61386
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7b7bf910b350ffa453c31ad2d5b4027a69bf6003d9ac92bbad401b3f07b5190f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: The in-span vocative Εὐθύδημε names the addressee, excluding him, and σὺ ... ἡδὺς εἶ keeps that second person; but the span carries no reporting verb, so the narrator is not excluded either, and Dionysodorus and Ctesippus both remain open.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0509
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b
char_span:
  start_char: 61386
  end_char: 61444
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b84b0db24ea953b0e3448701ab6a801d9ca0901d4df32edd8126f1c5f29ebc74
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 61409
    end_char: 61427
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0510
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b
char_span:
  start_char: 61444
  end_char: 61459
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a0735b399bcb3cb642859573a46bc21772bc132ac2640bcea62cb059e873b06b
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἦ δ’ ὃς ὁ Κτήσιππος
    start_char: 61461
    end_char: 61480
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0511
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b
char_span:
  start_char: 61481
  end_char: 61505
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6156f8962f58fe6ff70284bc0f916fe659b24c25aeca54640d0964e314b4f9dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Διονυσόδωρος and the named ἦ δ’ ὃς ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb, no vocative and no person marking.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0512
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b
char_span:
  start_char: 61505
  end_char: 61521
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c29bd595d559afdcfbb3cbba997ffe4bc933caa92b2794b76fdb866ecd758ec5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Διονυσόδωρος and the named ἦ δ’ ὃς ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἔφη excludes only the narrator.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0513
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b
char_span:
  start_char: 61521
  end_char: 61584
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4ec76a26d273ed1f68bef4f420ec76d30c40b9e1e863ecfb0e7852d39d22a5a6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΔΙΟΝ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Διονυσόδωρος and the named ἦ δ’ ὃς ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb; its λέγῃς marks the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0514
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300b-300c
char_span:
  start_char: 61584
  end_char: 61828
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 252fb11c8fd3a1d8b854b531cda6f0d40d6926f94c50a869d53ca08d119eb8c6
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 61584
    end_char: 61887
    text_sha256: e0c280aee073d4a8a56dd02392b556d5bdaa91edb659927667f7c115042402a5
  rationale: "In-span ἔφη is third person, excluding the narrator, and the span closes by demanding a proof from the two visitors in the DUAL — ἀλλ’ ἔτι μοι τὸ ἕτερον ἐπιδείξατον — which excludes both brothers as its speaker. Ctesippus is the only party left, and the narration that follows names him as the one straining in this quarrel: καί μοι ἐδόκει ὑπεραγωνιᾶν ὁ Κτήσιππος διὰ τὰ παιδικά."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0515
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 61887
  end_char: 61935
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0807910b3cb72480a381be1756bb0eca3807e9a7989a6c5a899432b4619c2b76
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Εὐθύδημος
    start_char: 61903
    end_char: 61918
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0516
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 61935
  end_char: 61951
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b160df3e803bacd9a19bd90c26b48d0da05d604dc8920a88fcce522690cfba36
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἦ δ’ ὅς excludes only the narrator, and ἔγωγε is a pronoun.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0517
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 61951
  end_char: 62031
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e3cdf2d7e8ae3b8babfb3950c5c273fba4b776e8c34542d16170b044f5227a86
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. It has no reporting verb; its σιγᾷς marks the addressee.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0518
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 62031
  end_char: 62070
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1ad4da2ed71201817988b5ba07caf6cc892a5679ac10fc11cf3fa5b7c2f28e70
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κτήσιππος
    start_char: 62039
    end_char: 62054
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0519
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 62070
  end_char: 62079
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0e765c189073f97ead1477cd71ac84f692b74ad69aa398ca7e9025bc51ced8e6
voice_chain:
  - ΣΩ.
  - ΕΥΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Εὐθύδημος
    start_char: 62081
    end_char: 62096
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0520
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 62097
  end_char: 62135
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ba7ac23b7db4a185d5d3ea9712867727c1b5c74fcc88b0ba34a2129edd78dc87
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ὦ βέλτιστε is a vocative that names nobody, and it carries no reporting verb.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0521
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c
char_span:
  start_char: 62135
  end_char: 62156
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c0c17d2cc81708ac6da617cbdf681752a54b0757e5535db6a03414c48929b810
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. τά γε δήπου λέγοντα is a bare answer with no cue at all.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0522
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300c-300d
char_span:
  start_char: 62156
  end_char: 62223
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fedf39a69204d4c0ace63f8ea9a57cc2b192af5d2e26a89eb5a8f7758543c59f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΚΤΗΣ.
unresolved_reason: This stretch runs between the named ἔφη ὁ Εὐθύδημος and the named ἔφη ὁ Κτήσιππος, both third persons to the narrator, so a reporting verb identifies neither and this span carries no discriminating cue. Its ἦ δ’ ὅς excludes only the narrator; ἐρωτῶ is the speaker's own first person.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0523
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300d
char_span:
  start_char: 62223
  end_char: 62328
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 19ae21ffa956efea80905c47643fb92011ad64fce844d34708be712f20c610a4
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὑφαρπάσας ὁ Διονυσόδωρος
    start_char: 62250
    end_char: 62278
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0524
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300d
char_span:
  start_char: 62386
  end_char: 62469
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8bc05acb27d2dd1875a557cf8faf14ebcb13ebeb06bd8aad4db460b45ae1542d
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: καὶ ὁ Κτήσιππος, ὥσπερ εἰώθει, μέγα πάνυ ἀνακαγχάσας, ὦ Εὐθύδημε, ἔφη
    start_char: 62332
    end_char: 62401
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0525
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300e
char_span:
  start_char: 62701
  end_char: 62780
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e50b15d3f78a8d7d56639dde0dd2b43e0a0fc724b5bb43d0b2b2375784689d59
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ εἶπον
    start_char: 62705
    end_char: 62715
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0526
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300e
char_span:
  start_char: 62780
  end_char: 62837
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 22110aa990be3f735f5045f77057c44e30a821c6c0996722f36471034ced3db6
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 62838
    end_char: 62856
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0527
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0076
stephanus_span: 300e
char_span:
  start_char: 62858
  end_char: 62904
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c13eb139f4783adb5aeebd35ab88a4981b104e022e44d7d5986974fbb47cb7d3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 62869
    end_char: 62873
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0528
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a
char_span:
  start_char: 62915
  end_char: 62967
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4f7f9e86d62a4c80b36f7084e10f072cc08a4ec02e1d9bfad4f0443c7e27e9a0
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 62915
    end_char: 63256
    text_sha256: b37164fc802232d03d05e46c6b8ab06becf16e4a24ed35c909d0e74d74f9108b
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0529
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a
char_span:
  start_char: 62967
  end_char: 63128
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 9ec5e354b4771915487f418134d8bbc74c5993c455eef8544342b18febc7e76e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 63063
    end_char: 63067
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0530
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a
char_span:
  start_char: 63128
  end_char: 63223
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8bf649b0fbc3918df899177dec760fd4cd4939665998f6c156a97377192fe9f8
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63128
    end_char: 63256
    text_sha256: efeefa9a3dfb52dc37186be5b974478a9dd8dac6bb010a0deb791213eecc0aa6
  rationale: "The span names its own speaker in the first person: ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ — the ἐγώ whose presence is at issue is Dionysodorus. In-span ἔφη is third person, excluding the narrator, and σοι ... εἶ addresses him. Euthydemus and Ctesippus are excluded because no other party speaks in this turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0531
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a
char_span:
  start_char: 63223
  end_char: 63256
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fbbe49b892f8348b30f9c56bc28aedeea051f0bb7328eebc1dc2ea97a9b57443
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 63245
    end_char: 63254
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0532
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301a-301b
char_span:
  start_char: 63256
  end_char: 63342
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 450860cfa261a1941ea8e7dbf78db3aab4703f2a4634a553a7e88aebd8655cd4
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63128
    end_char: 63449
    text_sha256: ab3fb6dffcd45589b5b9da512e1772e2ce5c3c6ab560fc1e75a4c59d7677b076
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0533
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63342
  end_char: 63449
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8e526dfaf7aaee82ff545bfe0e3bbea74ac0f2287b901e764f578d23adb05e91
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 63357
    end_char: 63365
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0534
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63449
  end_char: 63526
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 861810ce0636bb441bd06bdfe6d261d4a89d49518fe27aeab5c4897f1c87edc1
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63342
    end_char: 63614
    text_sha256: 08fac9b6d9a92ff43695a24483f15d9ef4ee9d98ff443aab303a8c55bb979ea2
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0535
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63526
  end_char: 63614
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 987771bb02f6ece2ba8430e266a6b6858c59bb1c0e6a795c7944347513f05e45
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 63541
    end_char: 63550
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0536
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63614
  end_char: 63637
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d5f8268cc83228e6d1b190b20222e584f496746f7f2b9576785e8884b01d0677
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63526
    end_char: 63637
    text_sha256: f58c289a5ed02fc7622af8f614b94c006ebc2b76b37f63bab7261aac07d6f555
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0537
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63637
  end_char: 63651
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7c5bdd5880a341a66767c19f7b4c4fe3bb00bb26d077e7d5f32bc1e325ceb023
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. οὐκοῦν δοκεῖ; is a two-word question."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0538
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b
char_span:
  start_char: 63651
  end_char: 63665
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d71624fe9c51119400d4760b26a75c7f25403bc92637e5f327cf6d1fbb9cc175
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63526
    end_char: 63665
    text_sha256: 364d8ae2497be38d940340be004b10bdc90ea73802bc95edc18209d9a51ac6fb
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context reaches the nearest naming; the short cue-free answers it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0539
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301b-301c
char_span:
  start_char: 63665
  end_char: 64005
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c17827d9004c84a01ab786c0e359e75f368584227f8b8b271b724a949346744d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63614
    end_char: 64101
    text_sha256: 89c3ea373b224c64a1da4f9588622f1e24b23376edd8853427764e2d9e8202dc
  rationale: The in-span vocative ἀλλ’, ὦ Διονυσόδωρε names the addressee, excluding him, and καὶ ὑμεῖς τὸ διαλέγεσθαι ... ἀπεργάζεσθαι addresses the visiting pair in the plural, excluding Euthydemus with him. Ctesippus speaks nowhere in this turn; the only other party is the narrator, whose seven other utterances here carry ἦν δ’ ἐγώ / ἔφην, and this span's own ἔγωγε ... ᾤμην is the same first person continuing his side.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0540
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301c
char_span:
  start_char: 64005
  end_char: 64101
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ea2b5a333a645047d9e709411c71fd5077749891d38b9a6425e47c8df928d810
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63665
    end_char: 64101
    text_sha256: 81de09e39a596d2ec8d3ff058b853b6ad650e84e49418c371e8c6c26a4dab77e
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0541
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301c
char_span:
  start_char: 64101
  end_char: 64120
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a093dfe15bc883419d90cc1ad952337b8573dc77add46c0430cf341258dc3e05
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. ἔγωγε· ὅτι χαλκέα is a bare answer, and ἔγωγε is a pronoun."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0542
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301c
char_span:
  start_char: 64120
  end_char: 64139
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 35c1ff224f41bf0ead6cec7e0cac839f12b94aa93eddcac14fce4afab5b05b09
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. τί δέ, κεραμεύειν; is a two-word question."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0543
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301c
char_span:
  start_char: 64139
  end_char: 64148
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4d55f06893b357ab3a8b43669ed096e580ac27b5b9ace41c1d77fc6fbf9e50e6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. κεραμέα is a one-word answer."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0598
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301c-301d
char_span:
  start_char: 64148
  end_char: 64235
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fed7fe22beeb741d2871776cba8baa98e48878d6c42b04f09a0f73185867b861
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. τί δέ, σφάττειν τε καὶ ἐκδέρειν ... is a bare question. Split out of the record below, whose span had swallowed it together with the ἦν δ’ ἐγώ-marked answer."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0544
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d
char_span:
  start_char: 64235
  end_char: 64255
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 2afdef045905f01652d100e39df90b1a3340b5587339a17150acc053803198a2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 64245
    end_char: 64254
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0545
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d
char_span:
  start_char: 64255
  end_char: 64312
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 719493e106439eefa9a3f16ff2217e020b52341dd4dd6d7b3ed7c13ff613e663
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63665
    end_char: 64312
    text_sha256: 3745ac4f30dcb8fbd7ba825c61f263e2458020796685ee417d03c77228a0eb72
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context reaches the nearest naming; the short cue-free answers it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0546
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d
char_span:
  start_char: 64312
  end_char: 64321
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5f66978f07d77c39208eeb6f829a9b3f06833cefe5754237c96d850068a48857
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. μάλιστα is a one-word assent."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0547
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d
char_span:
  start_char: 64321
  end_char: 64407
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 54776a1d7a330e4bd551daabaed1e62056ef18a4352427d0c8fff9c99b7255cc
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63665
    end_char: 64448
    text_sha256: cc6c723973438cfc57e0188909ff4042bea9bfef358a93d950aa76bbb3073b89
  rationale: The span's ὡς φῄς and ὡμολόγησας ταῦτα ἢ οὔ; are second person, addressed to the party whose reply immediately below is marked ὡμολόγησα, ἔφην — the narrator — so he is excluded as its speaker. The turn is one exchange with a single third-person interlocutor whom the text names three times inside it (ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and ὦ Διονυσόδωρε twice), and no other party speaks in the turn, which excludes Euthydemus and Ctesippus.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0548
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d
char_span:
  start_char: 64407
  end_char: 64448
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 906bbcad189e4cdbcf340856b1f128149000043cded7e17f48c71ade1dd3762e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 64419
    end_char: 64423
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0549
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301d-301e
char_span:
  start_char: 64448
  end_char: 64660
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 00a38460b34d23428150a437d55acdc1cce25b314f788e3e51015a64557ffd70
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 63665
    end_char: 64660
    text_sha256: 0770c9d00c7bddd3137683a672a02418a838c416be40be3749ed88acafdc4079
  rationale: "In-span ἦ δ’ ὅς is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context reaches the nearest naming; the short cue-free answers it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0550
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301e
char_span:
  start_char: 64660
  end_char: 64778
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8d91aaeb6adb82eb8994d7a91b245e33a8e48a16e599ea1dd8fe159e440d1e65
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 64676
    end_char: 64685
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0551
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301e
char_span:
  start_char: 64778
  end_char: 64838
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 275529e2e655d13a6d236e780c2589360bfa54e51dd4000e2782d39a9b057e08
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 64660
    end_char: 64880
    text_sha256: 84c3a0a48395e0b42e57e6eae615d6120ed4a5915f5a914acedf8a41489c313c
  rationale: "In-span ἔφη is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context reaches the nearest naming; the short cue-free answers it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0552
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301e
char_span:
  start_char: 64838
  end_char: 64880
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b72e613cee6d3a835187ee5eedcce0e9d632576ca43411e9e5fcf114d661d889
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 64859
    end_char: 64867
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0553
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301e
char_span:
  start_char: 64880
  end_char: 64927
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e242ef13d93e5a4ebeec6c3ad91ca305512472541c8a7f8fe6fd53b53dea67c8
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 64838
    end_char: 64927
    text_sha256: 5fa90e9fc2c371c4e6b9d2fda56bcd0f8a0a6b245099d5a6cff7aaf029ecc9d6
  rationale: "In-span ἦ δ’ ὅς is third person, excluding the narrator, whose seven utterances in this turn all carry ἦν δ’ ἐγώ / ἔφην / ἔφην ἐγώ. The turn is one exchange with a single third-person interlocutor, whom the text names three times inside it: he names himself, ὅτι νῦν ἐγώ σοι πάρειμι, Διονυσόδωρος εἶ, and the narrator addresses him ὦ Διονυσόδωρε twice. No other party speaks anywhere in the turn, which excludes Euthydemus and Ctesippus. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0554
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0077
stephanus_span: 301e
char_span:
  start_char: 64927
  end_char: 65015
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: a608b6df1c0b4ff7655ad20e223ff0334c4b65d644f4c2a4b47fffd977a14079
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, no person marking that separates them. Its σύ / σοῦ mark the addressee, and the third-person Εὐθύδημον τόνδε excludes Euthydemus from being that addressee, which says nothing about the speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0555
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 301e-302a
char_span:
  start_char: 65019
  end_char: 65264
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 43a2292d40dd2b54a1afa9ed8775a165ab64e301ad8e7ff7427a357487e506f5
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 65019
    end_char: 65887
    text_sha256: 38511125e678c6fa9106c10e3e955f4e49b7c9cee6aebcbd5c8993ffdc0cad8c
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context reaches the nearest naming; the cue-free turns it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0556
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302a
char_span:
  start_char: 65264
  end_char: 65429
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7d28d1d329a6f31a3e64b269d14753b8c58c33de366d34c4b35fdea942e110b9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 65385
    end_char: 65389
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0557
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302a
char_span:
  start_char: 65429
  end_char: 65479
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7a3cbf2db79779e8645ca99e7bb3b565e64ba6d3109299820d5264f38baab1e6
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 65429
    end_char: 65887
    text_sha256: 306841b2ee159b1b28733466c61e36ca8b38a8d8fad1619c886ddfadf26c6265
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context reaches the nearest naming; the cue-free turns it contains are left unresolved, not used to carry a speaker."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0559
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b
char_span:
  start_char: 65486
  end_char: 65496
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 4f914fe9fe80981769681b1bd42d0374a87c2a6268f0723f88e65d0135430627
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 65491
    end_char: 65495
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0560
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b
char_span:
  start_char: 65496
  end_char: 65603
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: b9bbc9cb55cd6035074f68e136c85311937224ba0be32680dff5ae8b122526b9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, and no person marking that separates them. Its ὁμολογεῖς marks the addressee and ἃ νυνδὴ ἐγὼ ἔλεγον is the speaker's own first person."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0561
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b
char_span:
  start_char: 65603
  end_char: 65612
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 95ba7a5ff36f77cb0a700c51fafc9a8f8470647bb49a5110774d3345050a5a43
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, and no person marking that separates them. ὁμολογῶ is a one-word answer in the speaker's own first person."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0562
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b
char_span:
  start_char: 65668
  end_char: 65718
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 132b30829137305859380861df6a2b0672c4534bf21399abe4fa520f53a8ac23
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 65612
    end_char: 65887
    text_sha256: 38661fb7df6f51f9176fae2caf8684e55c67ab631d7612c88492a98f1aad311a
  rationale: "In-span ἔφη is third person, excluding the narrator, and the in-span vocative ὦ Σώκρατες names the addressee, excluding him a second time. The reply this span draws is the narrator's own οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, which names this speaker; Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The span was shortened to the speech: the anaphoric καὶ ὅς, εἰρωνικῶς πάνυ ἐπισχὼν ... is narration and now lies outside it."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0563
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b
char_span:
  start_char: 65851
  end_char: 65887
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0b01e9924d594a29fa765c0fc8ea08e822fd2536756e57b56cc2dbd96a82a183
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 65862
    end_char: 65871
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0564
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302b-302c
char_span:
  start_char: 65887
  end_char: 66020
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 45e3675f3802c414e8170b4795b911c11995bfe115aafbace80fbbb94f31aa98
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, and no person marking that separates them. Its σύ γε ... εἶ marks the addressee only."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0565
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302c
char_span:
  start_char: 66020
  end_char: 66199
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 860d843d91225a976174895f125ae339eee5b25345953203e4d5ec9c094faf2a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 66025
    end_char: 66034
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0566
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302c
char_span:
  start_char: 66199
  end_char: 66258
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 7ea0e117cf5f213dee2676659a2e9709367701bf76105f007a842c8536f224ff
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 66020
    end_char: 66258
    text_sha256: d6334788282fff1d901c9bde91b034bc3df3a8f1521db7dd33d22d51e14d8768
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0567
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302c-302d
char_span:
  start_char: 66258
  end_char: 66508
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c91de71b164d453f78409e7dbae3b4fb309fcbfeffcf300de564d3a679da8ee7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 66270
    end_char: 66279
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0568
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66508
  end_char: 66600
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0ba8d25f12ac0761d3e66149cad756c2bc96a0711f6ec41868087ef24c70b662
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Διονυσόδωρος
    start_char: 66524
    end_char: 66542
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0569
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66600
  end_char: 66617
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: fee75b3df1f9807c9bbd86bd30a6ee4c1c2b671a98b0af69dea55d5e153b206e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 66607
    end_char: 66616
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0570
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66617
  end_char: 66657
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c9e9711c4a2d66176fe844c49265bea6392000c1a37810df97115b333016f2e5
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 66508
    end_char: 66657
    text_sha256: a07dca0c75af6600260b9d4f4d8dbf340e49703c8b5d872f3eb51f69358f1315
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0571
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66657
  end_char: 66692
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c2107af4490542a047d9eb1b8d9ed508080edee8b12561d74389dae7e9d4a6ff
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 66668
    end_char: 66677
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0572
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66692
  end_char: 66749
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 78ae9d538d82871bf8088005842a5b38025cc991e67c60e8f0143a3bc8e50f58
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 66508
    end_char: 66749
    text_sha256: a8d2074041c49a7031fedab653d8059514e4bb791634d415875537d70ea861a5
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0573
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d
char_span:
  start_char: 66749
  end_char: 66779
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 3cfa34680060e26a5b3446f1ce97d7cb61d74a81214234a5e8b3b72884da05e0
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 66761
    end_char: 66765
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0574
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302d-302e
char_span:
  start_char: 66779
  end_char: 66904
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: edf7168bb7c033a92aecd709b685fb8d56ecb804a4b49c69794564a78ec02c33
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΕΥΘ.
    - ΔΙΟΝ.
    - ΚΤΗΣ.
  context_span:
    start_char: 66508
    end_char: 66904
    text_sha256: 550b5476ef799b3e70819d192db49f940293daad8fd5dfe8d69542dad8ef86a9
  rationale: "In-span ἔφη is third person, excluding the narrator, whose replies throughout this turn carry ἦν δ’ ἐγώ / ἔφην. The interlocutor is named inside the turn: the narrator answers him οὐκ ἔστιν, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε and again ἔα, ἦν δ’ ἐγώ, ὦ Διονυσόδωρε, and the source itself prints ἀλλ’ ἀρκεῖ γ’, ἔφη ὁ Διονυσόδωρος. Euthydemus and Ctesippus are excluded because no other party speaks in the turn. The context stops at the nearest of those namings and crosses no cue-free turn."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0575
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302e
char_span:
  start_char: 66904
  end_char: 66924
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6dc140fe3c4947b7e36b4cfe11693f8dcc96f7c93f459f835cfb6b648ee2527f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 66914
    end_char: 66923
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0576
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302e
char_span:
  start_char: 66924
  end_char: 66946
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5022ea890a2014a6fadaa2d1e72964a99d905d046df176c0c5236b4fe9d10893
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΔΙΟΝ.
unresolved_reason: "This turn is one two-party exchange between the narrator and a single third-person interlocutor, and this span carries no cue: no reporting verb, no vocative, and no person marking that separates them. οὐκοῦν καὶ ζῷά εἰσιν; is a four-word question."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0577
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302e
char_span:
  start_char: 66946
  end_char: 66957
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 210de32375052756b0b0032da0c4b5b385fd055d6fa2cca83d958ae60dceea44
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 66952
    end_char: 66956
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0578
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302e
char_span:
  start_char: 66957
  end_char: 67076
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 8095dfdd43e0503b3b63ed1de66201c4042ca3aa08679ffa52ed03af83a5d5d4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: In-span ἔφη is third person, excluding the narrator, but the reply it draws is the narrator's ὡμολόγηκα, ἔφην· οὐκ ἔστιν γάρ μοι ἀνάδυσις, ὦ ΕΥΘΥΔΗΜΕ — a vocative naming the OTHER brother, against the ὦ Διονυσόδωρε and ἔφη ὁ Διονυσόδωρος earlier in the same turn. The source contradicts itself about which brother holds the floor here, so the span is left unresolved between them.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0579
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0078
stephanus_span: 302e
char_span:
  start_char: 67076
  end_char: 67134
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 5d2b03929353c4ff02a562070196e074f1a0ea566f644c25ab5a1a529c966616
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 67088
    end_char: 67092
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0580
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 302e-303a
char_span:
  start_char: 67138
  end_char: 67330
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: c9078af5b9883cf96d3cf9f710f28bc1ed1b64c0a12f3e85a91a73fbef1c0844
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΥΘ.
  - ΔΙΟΝ.
unresolved_reason: "In-span ἦ δ’ ὅς is third person, excluding the narrator, and σὸν ὁμολογεῖς ... ἔξεστί σοι addresses him, so one of the visiting pair puts the question and Ctesippus is excluded — he enters below with his own named formula. Which brother is undecidable: the same interrogation is called Dionysodorus' at 302d and Euthydemus' at 302e by the source itself."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0581
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 303a
char_span:
  start_char: 67438
  end_char: 67474
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 444d09111f6581bcbb4ed5d757018a8a1859b6c49de165a5bab9cb7c6fb83383
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ δὲ Κτήσιππός μοι ἰὼν ὡς βοηθήσων, Πυππὰξ ὦ Ἡράκλεις, ἔφη
    start_char: 67402
    end_char: 67460
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0582
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 303a
char_span:
  start_char: 67495
  end_char: 67555
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 784281c9c2af07d9dbf4fea6c9b7a0c467546860d77eb8fdf053e835069bb90e
voice_chain:
  - ΣΩ.
  - ΔΙΟΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Διονυσόδωρος, πότερον οὖν, ἔφη
    start_char: 67479
    end_char: 67511
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0583
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 303a-303b
char_span:
  start_char: 67573
  end_char: 67638
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: d023e24f045cf81496effa3a11241dc3916cbb4b5d963dedbc720fb34e5ac773
voice_chain:
  - ΣΩ.
  - ΚΤΗΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κτήσιππος, ὦ Πόσειδον, ἔφη
    start_char: 67560
    end_char: 67588
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0584
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0079
stephanus_span: 303c-303e
char_span:
  start_char: 68141
  end_char: 69401
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e96b54180b51d140f2f7ae5e7d21c1216c91e9234bc0d1d31648a973fd194594
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἐπὶ τὸ ἐπαινεῖν τε καὶ ἐγκωμιάζειν αὐτὼ ἐτραπόμην, καὶ εἶπον
    start_char: 68141
    end_char: 68201
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0587
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0080
stephanus_span: 304a-304b
char_span:
  start_char: 69412
  end_char: 70068
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 67d76f445a683e6b6881a0e89c4b5163f2e629f2579d36003dd182895ecbf88f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἦν δ’ ἐγώ
    start_char: 70014
    end_char: 70023
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0588
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304d
char_span:
  start_char: 70933
  end_char: 70976
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 1a485feecab36bf0a1f0e8e9fd4e36d1b9f66519565c6e429ed2fcb2db206733
voice_chain:
  - ΚΡ.
  - ΛΟΓΟΓΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: τούτων τις τῶν περὶ τοὺς λόγους τοὺς εἰς τὰ δικαστήρια δεινῶν, ὦ Κρίτων, ἔφη
    start_char: 70870
    end_char: 70946
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0589
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304d
char_span:
  start_char: 70976
  end_char: 71054
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 09e87786863eaf2c1a1a65586eb97964ccf1efe9fb5d372eb3c049af425f0fc0
voice_chain:
  - ΚΡ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 70992
    end_char: 71001
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0590
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304d
char_span:
  start_char: 71054
  end_char: 71089
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 0dc9c1a3a5d5a083b969c2758ba349cbbe0ed96332fb2cbcfc87b293e2407729
voice_chain:
  - ΚΡ.
  - ΛΟΓΟΓΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΡ.
    - ΛΟΓΟΓΡ.
  context_span:
    start_char: 70775
    end_char: 71467
    text_sha256: 8739fceb635c4f5dc02c3d724eb4341cddea6f2a482db32c12f40c2e2265c263
  rationale: Inside the bounded two-party encounter Crito reports at 304d-305b, whose only parties the source names are Crito himself and the man introduced at 304d as τούτων τις τῶν περὶ τοὺς λόγους τοὺς εἰς τὰ δικαστήρια δεινῶν, the nominative subject of that sentence's ἔφη. The reporting act here (ἔφη) is third person, and Crito narrates in the first person and marks his own replies so (ἦν δ᾽ ἐγώ, κἀγὼ εἶπον, ἔφην), so the speaker is the other party. Grammatical person, not alternation, decides it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0591
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304d-304e
char_span:
  start_char: 71089
  end_char: 71114
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 07a9fe1ddf3e45f25a6298e20f4f15c07ed06ada1d53d4340547e245c6b3d6f2
voice_chain:
  - ΚΡ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 71104
    end_char: 71113
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0592
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304e
char_span:
  start_char: 71114
  end_char: 71200
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 6edce9ff25919cd20ccb87b97fe05fec88ab1f23365d6169d0f0532a76fdecfe
voice_chain:
  - ΚΡ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΚΡ.
  - ΛΟΓΟΓΡ.
unresolved_reason: "The span carries no reporting verb, no vocative and no first-person marking: ἵνα ἤκουσας is a bare second person addressed to the other party, which inside this two-party exchange is true of every utterance. Crito's own turns here are marked ἦν δ’ ἐγώ / κἀγὼ εἶπον and this one is not, but that absence is not evidence, and taking it from the turn beside it would be alternation."
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0593
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304e
char_span:
  start_char: 71200
  end_char: 71234
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 18fef25875b609333c852faad70f2deb50e3105ac7ca0f4d627ff2f8483046c8
voice_chain:
  - ΚΡ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ εἶπον
    start_char: 71201
    end_char: 71211
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0594
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304e
char_span:
  start_char: 71234
  end_char: 71357
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: ce544dee09113a996d5372d934a5d542638dff7f7472605171be6b464caab63a
voice_chain:
  - ΚΡ.
  - ΛΟΓΟΓΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΡ.
    - ΛΟΓΟΓΡ.
  context_span:
    start_char: 70775
    end_char: 71467
    text_sha256: 8739fceb635c4f5dc02c3d724eb4341cddea6f2a482db32c12f40c2e2265c263
  rationale: Inside the bounded two-party encounter Crito reports at 304d-305b, whose only parties the source names are Crito himself and the man introduced at 304d as τούτων τις τῶν περὶ τοὺς λόγους τοὺς εἰς τὰ δικαστήρια δεινῶν, the nominative subject of that sentence's ἔφη. The reporting act here (ἦ δ’ ὅς) is third person, and Crito narrates in the first person and marks his own replies so (ἦν δ᾽ ἐγώ, κἀγὼ εἶπον, ἔφην), so the speaker is the other party. Grammatical person, not alternation, decides it.
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0595
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0081
stephanus_span: 304e
char_span:
  start_char: 71399
  end_char: 71467
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: e8b3cab4939975480ae906fbf488cc3509c4f458efe979b51fe2624c8ad40265
voice_chain:
  - ΚΡ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 71422
    end_char: 71426
review_status: accepted
```

```yaml
voice_id: voice_euthydemus_0596
source_work: Euthydemus
outer_turn_id: turn_euthydemus_0082
stephanus_span: 304e-305a
char_span:
  start_char: 71471
  end_char: 71906
source_path: raw/plato/greek/euthydemus.txt
source_sha256: 23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14
span_sha256: 66c6e4c441b78cd0a429ca9bbec1978be6119f637ba44c0d9b65bb12dcfcd4b3
voice_chain:
  - ΚΡ.
  - ΛΟΓΟΓΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΡ.
    - ΛΟΓΟΓΡ.
  context_span:
    start_char: 71467
    end_char: 71906
    text_sha256: 5911a45a23be155579cc4b1c0c9070fac2a3a52ba3488546a28aa6c12ced2c92
  rationale: Inside the bounded two-party encounter Crito reports at 304d-305b, whose only parties the source names are Crito himself and the man introduced at 304d as τούτων τις τῶν περὶ τοὺς λόγους τοὺς εἰς τὰ δικαστήρια δεινῶν, the nominative subject of that sentence's ἔφη. The reporting act here (ἔφη) is third person, and Crito narrates in the first person and marks his own replies so (ἦν δ᾽ ἐγώ, κἀγὼ εἶπον, ἔφην), so the speaker is the other party. Grammatical person, not alternation, decides it.
review_status: accepted
```
