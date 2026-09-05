# Crito — Voice Ledger

Greek-only reported-speech structure for the ten required outer turns in
`wiki/reported-turn-scopes.json`. The singular woman at 44b is source-licensed
as a direct role owner; the indefinite objector remains unresolved. The Laws'
sustained prosopopoeia resolves to the registered collective `ΝΟΜ.` in
source-bounded segments rather than collapsing into Socrates' printed frames.

All twenty-six records are accepted as ten atomic cohorts under
the original acceptance and
`wiki/review/2026-08-30-crito-voice-claim-cutover.md`. The later receipt also
activates the claim-speaker cutover.

## Records

```yaml
voice_id: voice_crito_0001
source_work: Crito
outer_turn_id: turn_crito_0023
stephanus_span: 44a-44b
char_span:
  start_char: 2042
  end_char: 2224
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 8b5dcb98479340b09ad164f31475b7ccd4571c5948797c54d97efa737b5e1ef3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 2042
    end_char: 2045
limits: The printed frame contains Socrates' dream report; the woman's direct address below is a separate owner.
review_status: accepted
```

```yaml
voice_id: voice_crito_0002
source_work: Crito
outer_turn_id: turn_crito_0023
stephanus_span: 44b
char_span:
  start_char: 2146
  end_char: 2223
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 19d1a1b9b4c9504deae9aadeb64d03280c540900d9e392349fcd5ba7d11a841b
voice_chain:
  - ΣΩ.
  - ΓΥΝ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: τίς μοι γυνὴ προσελθοῦσα καλὴ καὶ εὐειδής, {44b} λευκὰ ἱμάτια ἔχουσα, καλέσαι με καὶ εἰπεῖν
    start_char: 2053
    end_char: 2144
limits: The Greek introduces one off-stage woman as the subject of καλέσαι … εἰπεῖν; the nested verse is part of her direct address.
review_status: accepted
```

```yaml
voice_id: voice_crito_0003
source_work: Crito
outer_turn_id: turn_crito_0062
stephanus_span: 48a
char_span:
  start_char: 10339
  end_char: 10732
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 909ca065697b0277ec94e7b9f24db5f180478c447f4a71e0557e564fd30e92a4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 10339
    end_char: 10342
review_status: accepted
```

```yaml
voice_id: voice_crito_0004
source_work: Crito
outer_turn_id: turn_crito_0062
stephanus_span: 48a
char_span:
  start_char: 10642
  end_char: 10731
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 19c624524f94bfa72b0e526679ba063b268d4ea350c7e22e23b5f5bff56e0f5a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: φαίη γ’ ἄν τις stages one indefinite objector across the two q pieces; no single registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_crito_0005
source_work: Crito
outer_turn_id: turn_crito_0090
stephanus_span: 50a-50c
char_span:
  start_char: 14757
  end_char: 15561
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: cf97b67e0c06c9018eebed445ffc29a6f247e03ee7572b95254717e7cc552bf5
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 14757
    end_char: 14760
limits: Socrates' projected first-person-plural reply later in this frame remains his own speech, not a child.
review_status: accepted
```

```yaml
voice_id: voice_crito_0006
source_work: Crito
outer_turn_id: turn_crito_0090
stephanus_span: 50a-50b
char_span:
  start_char: 14917
  end_char: 15253
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: d8360093c5921aa74c77a1702e81768f243f44c63e45b87a7484b93661effa8d
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 14757
    end_char: 15561
    text_sha256: cf97b67e0c06c9018eebed445ffc29a6f247e03ee7572b95254717e7cc552bf5
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0007
source_work: Crito
outer_turn_id: turn_crito_0092
stephanus_span: 50c-50e
char_span:
  start_char: 15591
  end_char: 16769
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 9eefdd25055677707cc9805e34d7d60e5e7e2e2d3b0e1d71b83c3b4434317b02
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 15591
    end_char: 15594
review_status: accepted
```

```yaml
voice_id: voice_crito_0008
source_work: Crito
outer_turn_id: turn_crito_0092
stephanus_span: 50c
char_span:
  start_char: 15623
  end_char: 15728
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: cf921f290f2d6d2739f8ae67785a88b4126299ef6f16d8d382d19ac1d82f16ec
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 15591
    end_char: 16769
    text_sha256: 9eefdd25055677707cc9805e34d7d60e5e7e2e2d3b0e1d71b83c3b4434317b02
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0009
source_work: Crito
outer_turn_id: turn_crito_0092
stephanus_span: 50c-50d
char_span:
  start_char: 15784
  end_char: 16159
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 7c41e4608a9baeedae2a038b533dc2e90b6c4b4716b038a82585da4f74598a72
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 15591
    end_char: 16769
    text_sha256: 9eefdd25055677707cc9805e34d7d60e5e7e2e2d3b0e1d71b83c3b4434317b02
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0010
source_work: Crito
outer_turn_id: turn_crito_0092
stephanus_span: 50d-50e
char_span:
  start_char: 16192
  end_char: 16415
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: fef5361b1bd27072cdea0d8214c72fd71019067c2ef4c5b2d885aedbb8aa09f4
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 15591
    end_char: 16769
    text_sha256: 9eefdd25055677707cc9805e34d7d60e5e7e2e2d3b0e1d71b83c3b4434317b02
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0011
source_work: Crito
outer_turn_id: turn_crito_0092
stephanus_span: 50e
char_span:
  start_char: 16442
  end_char: 16768
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: de4426ddef95b3980a41defb4023e638618fa5c5841fe8302e92cd561841f8ee
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 15591
    end_char: 16769
    text_sha256: 9eefdd25055677707cc9805e34d7d60e5e7e2e2d3b0e1d71b83c3b4434317b02
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0012
source_work: Crito
outer_turn_id: turn_crito_0093
stephanus_span: 50e-51c
char_span:
  start_char: 16769
  end_char: 18157
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 5c246f6aa5c3109b344fb8e9fc50f6ab9e073075671eb26cadf38e3ca3fb8460
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 16769
    end_char: 16772
review_status: accepted
```

```yaml
voice_id: voice_crito_0013
source_work: Crito
outer_turn_id: turn_crito_0093
stephanus_span: 50e-51c
char_span:
  start_char: 16773
  end_char: 18092
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 3f4438183d77fe786392b4cf10b2ec795e85c68b159b2bc613d072042e8aa300
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 16769
    end_char: 18157
    text_sha256: 5c246f6aa5c3109b344fb8e9fc50f6ab9e073075671eb26cadf38e3ca3fb8460
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0014
source_work: Crito
outer_turn_id: turn_crito_0095
stephanus_span: 51c-52a
char_span:
  start_char: 18175
  end_char: 19430
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 43ad2b5dac4af037626bb383c0000d775022d9fff4014845760ad13a3e93ca29
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 18175
    end_char: 18178
review_status: accepted
```

```yaml
voice_id: voice_crito_0015
source_work: Crito
outer_turn_id: turn_crito_0095
stephanus_span: 51c
char_span:
  start_char: 18179
  end_char: 18214
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: ff1c513be18d5507906ac983473e44ecd4f3d0666894e3828d457d6cfa5f42ec
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 18175
    end_char: 19430
    text_sha256: 43ad2b5dac4af037626bb383c0000d775022d9fff4014845760ad13a3e93ca29
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0016
source_work: Crito
outer_turn_id: turn_crito_0095
stephanus_span: 51c-52a
char_span:
  start_char: 18239
  end_char: 19429
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 827d6f4740d3b1ec2bbe2a58b0f9255e1404eb7c17946868d63d626dfeaae1bc
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 18175
    end_char: 19430
    text_sha256: 43ad2b5dac4af037626bb383c0000d775022d9fff4014845760ad13a3e93ca29
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0017
source_work: Crito
outer_turn_id: turn_crito_0096
stephanus_span: 52a-52d
char_span:
  start_char: 19430
  end_char: 21079
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: e2eeef2a70094b7042cc474f876c86908c67eef9dcef6827c138bfb026c0a206
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 19430
    end_char: 19433
review_status: accepted
```

```yaml
voice_id: voice_crito_0018
source_work: Crito
outer_turn_id: turn_crito_0096
stephanus_span: 52a
char_span:
  start_char: 19434
  end_char: 19580
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 4038ab4047e309136e89516f7bef63751474b4365575d1899cc768bff69734c0
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 19430
    end_char: 21079
    text_sha256: e2eeef2a70094b7042cc474f876c86908c67eef9dcef6827c138bfb026c0a206
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0019
source_work: Crito
outer_turn_id: turn_crito_0096
stephanus_span: 52b-52d
char_span:
  start_char: 19766
  end_char: 21025
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: bf5bcb4e7196d51e3cc1a09770f6b57425717e76ab115c541ba074f6047e47c7
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 19430
    end_char: 21079
    text_sha256: e2eeef2a70094b7042cc474f876c86908c67eef9dcef6827c138bfb026c0a206
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0020
source_work: Crito
outer_turn_id: turn_crito_0098
stephanus_span: 52d-52e
char_span:
  start_char: 21103
  end_char: 21423
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 8a03d4c3fbfccfb2994387be7037e6efb9a4959d39a0c125784d5c56ede3c997
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 21103
    end_char: 21106
review_status: accepted
```

```yaml
voice_id: voice_crito_0021
source_work: Crito
outer_turn_id: turn_crito_0098
stephanus_span: 52d
char_span:
  start_char: 21107
  end_char: 21128
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: e86965f4de1a9060b965739da455673d91ec0838010b6a5605973f76bd16a933
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 21103
    end_char: 21423
    text_sha256: 8a03d4c3fbfccfb2994387be7037e6efb9a4959d39a0c125784d5c56ede3c997
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0022
source_work: Crito
outer_turn_id: turn_crito_0098
stephanus_span: 52d-52e
char_span:
  start_char: 21139
  end_char: 21422
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 5c67b3a64e2dcb1f10a6a63bbb8a1e65fda7aa88723ff7db47fec80e6e9978e8
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 21103
    end_char: 21423
    text_sha256: 8a03d4c3fbfccfb2994387be7037e6efb9a4959d39a0c125784d5c56ede3c997
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0023
source_work: Crito
outer_turn_id: turn_crito_0099
stephanus_span: 52e-53e
char_span:
  start_char: 21423
  end_char: 23711
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 5846b490cb67440bab5b3a07d7770c9692180afbc63f3b7ef607db21ef5caca3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 21423
    end_char: 21426
review_status: accepted
```

```yaml
voice_id: voice_crito_0024
source_work: Crito
outer_turn_id: turn_crito_0099
stephanus_span: 52e-53e
char_span:
  start_char: 21427
  end_char: 23710
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 6f529e3443486e9c9af112a099fe940beafcdb535710234e053c08d644d9c161
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 21423
    end_char: 23711
    text_sha256: 5846b490cb67440bab5b3a07d7770c9692180afbc63f3b7ef607db21ef5caca3
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```

```yaml
voice_id: voice_crito_0025
source_work: Crito
outer_turn_id: turn_crito_0100
stephanus_span: 53e-54d
char_span:
  start_char: 23711
  end_char: 25543
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 72f112d588c77a7cd1e6fdbd732bf747bf5b591d2b121802c98bd7ddd68ed36c
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 23711
    end_char: 23714
review_status: accepted
```

```yaml
voice_id: voice_crito_0026
source_work: Crito
outer_turn_id: turn_crito_0100
stephanus_span: 53e-54d
char_span:
  start_char: 23715
  end_char: 25219
source_path: raw/plato/greek/crito.txt
source_sha256: fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a
span_sha256: 1969f0f9cf7a66f13f732ebeff241b11e42f1cc7c39ba7e0d690d751f7b8e36d
voice_chain:
  - ΣΩ.
  - ΝΟΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΝΟΜ.
  context_span:
    start_char: 23711
    end_char: 25543
    text_sha256: 72f112d588c77a7cd1e6fdbd732bf747bf5b591d2b121802c98bd7ddd68ed36c
  rationale: Within this exact outer turn, the q-bounded first-person-plural prosopopoeia continues the Laws' address to Socrates. The printed ΣΩ. marks the reporter's reset, not a transfer of the nested speech away from the collective Laws.
review_status: accepted
```
