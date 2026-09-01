# Apology — Voice Ledger

Reported-speech structure for the single required outer turn
`turn_apology_0001` (17a–42a). The source prints no siglum, so the depth-1
frame is licensed by its first-person speaker and the recalled Callias exchange
that addresses that same `ἐγώ` as Socrates. Every bounded utterance transmitted
below that frame is retained below. Source-identified named and collective
owners are resolved through exact hashed Greek contexts; only genuinely
indefinite staged speakers remain unresolved.

All 30 records remain accepted as one atomic cohort under the original
acceptance and `wiki/review/2026-08-30-apology-voice-claim-cutover.md`. The
later receipt also activates the claim-speaker cutover.

## Records

```yaml
voice_id: voice_apology_0001
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 17a-42a
char_span:
  start_char: 6
  end_char: 54044
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 86d02b0c0f2cd1c32781b0fb8dac115852a7e4ac3d0397ae363a76e59735ec7d
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: unlabelled_turn_frame
    text: ἐγὼ δ’ οὖν
    start_char: 94
    end_char: 104
  - kind: unlabelled_turn_frame
    text: ἦν δ’ ἐγώ
    start_char: 6061
    end_char: 6070
  - kind: unlabelled_turn_frame
    text: ὦ Σώκρατες
    start_char: 6643
    end_char: 6653
limits: The unlabelled first-person frame is Socrates. It owns the defense outside the bounded reported utterances below; the Callias recollection identifies its `ἐγώ` through the addressed name.
review_status: accepted
```

```yaml
voice_id: voice_apology_0002
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 19b-19c
char_span:
  start_char: 4344
  end_char: 4490
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 5df426e52131463e3d5fa41f951c705393c4d11175a1292d0e758e8b753bab74
voice_chain:
  - ΣΩ.
  - ΠΑΛΔ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΑΛΔ.
  context_span:
    start_char: 4154
    end_char: 4900
    text_sha256: efd4a49660ef7b3972e90c20449574b805a59f13bd99ed326a7fc571fcaa34e7
  rationale: Within 19b-19c Socrates explicitly assigns the oath-style charge to οἱ διαβάλλοντες and reads their plural accusation. The bounded quote is the old accusers' collective speech, not Socrates' frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0003
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 20a-20b
char_span:
  start_char: 6042
  end_char: 6522
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: f9d7a4f81f538996097ba4314cf9298ca7f810db8fcd834d690300a8247a9c04
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6061
    end_char: 6070
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 6498
    end_char: 6506
review_status: accepted
```

```yaml
voice_id: voice_apology_0004
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 20b
char_span:
  start_char: 6523
  end_char: 6550
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 5af9ef59451b12ae7334107745c2455497cedbf8e7bb842e7ded7f75d1d39784
voice_chain:
  - ΣΩ.
  - ΚΑΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΑΛ.
  context_span:
    start_char: 5720
    end_char: 6722
    text_sha256: 424f896c6fcf4ee9980ab4f93f0c055dfd6b5a27d80a8afb4d0e345b7ba5fd97
  rationale: The 20a-20c context names Callias as Socrates' interlocutor; each bare reply is adjacent to Socrates' question and answers as Callias. The candidate set records the two locally possible turn owners.
review_status: accepted
```

```yaml
voice_id: voice_apology_0005
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 20b
char_span:
  start_char: 6550
  end_char: 6616
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 04712c995c4af5cc9dca242c36dbbbc8fbf13c5a51e8cf07ad7ac511dc02ffbd
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6564
    end_char: 6573
review_status: accepted
```

```yaml
voice_id: voice_apology_0006
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 20b
char_span:
  start_char: 6617
  end_char: 6679
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: ded5663e936f9921e1947130c306d8d03a4d367c175d381fc437ae60a1b28aad
voice_chain:
  - ΣΩ.
  - ΚΑΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΑΛ.
  context_span:
    start_char: 5720
    end_char: 6722
    text_sha256: 424f896c6fcf4ee9980ab4f93f0c055dfd6b5a27d80a8afb4d0e345b7ba5fd97
  rationale: The 20a-20c context names Callias as Socrates' interlocutor; each bare reply is adjacent to Socrates' question and answers as Callias. The candidate set records the two locally possible turn owners.
review_status: accepted
```

```yaml
voice_id: voice_apology_0007
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 20c-20d
char_span:
  start_char: 6927
  end_char: 7230
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 1f5aa5f538a60211e24436bc8cc94981cb4ffed128845625014c011d1b5e1463
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The staged speaker is indefinite τις; the bounded question is retained without inventing a terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_apology_0008
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 24d
char_span:
  start_char: 16135
  end_char: 16146
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 3ea7f5c5502e9ee68f16309b71280e36ad70fdd99b7dcf2fc62d155af3e67321
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0009
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 24d-24e
char_span:
  start_char: 16577
  end_char: 16597
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: e487bae4639c65807a0ffc52b78dec01673d4350f9ecfe058c120cc019ae99a6
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0010
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 24e
char_span:
  start_char: 16700
  end_char: 16736
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 4fb94424f23dc9559e773443a87a62c1c00609a2fd16cf52b463b3819c529955
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0011
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 24e
char_span:
  start_char: 16824
  end_char: 16837
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 753ebcea353d26740acdceae4bb4e68782675ff57a222fbde2d256a64ebc5cbd
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0012
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 24e
char_span:
  start_char: 16884
  end_char: 16897
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: da556bf31a3067939937427381f4d2922f469ea6329356ad0ec8091ec413bd74
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0013
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25a
char_span:
  start_char: 17017
  end_char: 17032
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 5a10bd0e6dde7a4ebb9625d88cd9c6df8399425655415cbd140cafb7883d0cf2
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0014
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25a
char_span:
  start_char: 17057
  end_char: 17079
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: a4c92f57c948f680e00be9f3d6b7990e016596b5a25c0aa8fbe4d4443d4aa9a1
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0015
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25a
char_span:
  start_char: 17209
  end_char: 17223
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 29a1056d0ed9f83189de89f64c490a145b2179d63c091c6a04fdcc12c089a54a
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0016
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25a
char_span:
  start_char: 17331
  end_char: 17359
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 4925414f09fca94adde81b8a9fb47dcea625001abe58f2f20315999cfb60ff61
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0017
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25c-25d
char_span:
  start_char: 18344
  end_char: 18363
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 9d9ee5ded8350b17718414d8cedb811f077f532753709a3fcb895ebecc6c5e18
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0018
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25d
char_span:
  start_char: 18531
  end_char: 18544
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 3b00b4262292242b04e7020eeb84b00e75d9ec06423fbce97f0f00af8062cc58
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0019
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 25d
char_span:
  start_char: 18654
  end_char: 18672
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 8cfb1a1c1d2e1b8e52bbd7b4952619784f8352f9645e6e2da9c4132db2b7cc69
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0020
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 26b
char_span:
  start_char: 19931
  end_char: 19967
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 9640613d9ee64318ede3cbd570bf9845981074f0af878ce47e02ab85a266318e
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0021
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 26c-26d
char_span:
  start_char: 20430
  end_char: 20485
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: c46f3d52ee97d5522648d3101741f4394f7349205d21dfff8a0a076310ae17ac
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0022
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 26d
char_span:
  start_char: 20602
  end_char: 20691
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: fba97c32d64cdfe9eec2b76911dc17d6ddda324b82d43a9f52b6cf524009e790
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0023
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 26e
char_span:
  start_char: 21154
  end_char: 21191
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: ad31592d98f522d67992dd9fdc7041a30b7e8dd54a260ede237ca820468f4fb7
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0024
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 27c
char_span:
  start_char: 22472
  end_char: 22487
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: fc8e97cb39d232dde5dd98263237bb69b3565e107a11e28441eedde95683505e
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0025
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 27d
char_span:
  start_char: 22940
  end_char: 22953
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: f932b151edc25c50b1ec70c3fb8859526b4ed96ca6b0f62d2386c903252b3417
voice_chain:
  - ΣΩ.
  - ΜΕΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΜΕΛ.
  context_span:
    start_char: 15587
    end_char: 23743
    text_sha256: 58369915a543851da076212a5a63ddfae751b70fc4b25a600996ff2e8563c73a
  rationale: The 24c-28a context is the continuous two-party cross-examination opened by Socrates' direct address to Meletus. This q-bounded adjacent answer is Meletus' turn; Socrates remains the reporting frame.
review_status: accepted
```

```yaml
voice_id: voice_apology_0026
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 28b
char_span:
  start_char: 24295
  end_char: 24399
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 7215b2d63243481de4727b42e6e95fc022d7bd18f19bc6fbbda9d3dfd176d09d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The staged speaker is indefinite τις; the bounded objection is retained without inventing a terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_apology_0027
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 28c
char_span:
  start_char: 24964
  end_char: 25119
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 9daf0061476ec824925fda1c688ce4e8f1f026874f452c57ace6fd001bb60258
voice_chain:
  - ΣΩ.
  - ΘΕΤ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΕΤ.
  context_span:
    start_char: 24193
    end_char: 25727
    text_sha256: 0f944bb42eea58822758dab66ca499fca2c3507460a7aadb85036dd153ccf16c
  rationale: The 28b-28e context identifies Thetis as Achilles' mother and introduces the warning with εἶπεν ἡ μήτηρ. The quoted warning is Thetis' turn inside Socrates' report.
review_status: accepted
```

```yaml
voice_id: voice_apology_0028
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 28d
char_span:
  start_char: 25258
  end_char: 25395
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: e8bc26eaa128966b8f697d04758e1db164f3a8ddc1405ceecc6d89f22c5e109c
voice_chain:
  - ΣΩ.
  - ΑΧΙΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΘΕΤ.
    - ΑΧΙΛ.
  context_span:
    start_char: 24193
    end_char: 25727
    text_sha256: 0f944bb42eea58822758dab66ca499fca2c3507460a7aadb85036dd153ccf16c
  rationale: In the bounded Thetis-Achilles exchange, ὁ δέ and the contrastive reply resume Achilles, the son just named as Thetis' addressee. The answer belongs to Achilles, not Thetis.
review_status: accepted
```

```yaml
voice_id: voice_apology_0029
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 29c-29d
char_span:
  start_char: 27391
  end_char: 27581
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: 5b1c17e3e624bf15da0a50e190646fa2fb8a6c6c368c2bfd8d301908a0b69f7c
voice_chain:
  - ΣΩ.
  - ΑΘΔΙΚ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΑΘΔΙΚ.
  context_span:
    start_char: 27075
    end_char: 28057
    text_sha256: 9a2b83e1ceed1cf0ef7d204364a238cd84158ed5a5c4f05df88584c31f631ef5
  rationale: At 29c-29e Socrates gives the plural Athenian jury a conditional direct reply addressed to him as ὦ Σώκρατες. The projected utterance belongs to that collective jury; Socrates remains its reporter.
review_status: accepted
```

```yaml
voice_id: voice_apology_0030
source_work: Apology
outer_turn_id: turn_apology_0001
stephanus_span: 37e
char_span:
  start_char: 44946
  end_char: 45027
source_path: raw/plato/greek/apology.txt
source_sha256: 37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8
span_sha256: eac2b7c221ac409afc2377ab78b03992760dd7a350fa6de51308186d2d4ebc0f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The staged speaker is indefinite τις; the bounded question is retained without inventing a terminal owner.
review_status: accepted
```
