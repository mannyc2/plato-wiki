# Gorgias — Voice Ledger

Greek-only reported-speech structure for the ten required outer turns in
wiki/reported-turn-scopes.json. Singular staged roles, Polus's projected
reply, and Zeus's named speech are resolved only where local Greek formulas
support them; indefinite, plural, generic, and cross-turn continuations remain
unresolved.

All thirty-nine records are accepted as ten atomic cohorts under
wiki/review/2026-08-17-gorgias-reported-turn-acceptance.md. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records

```yaml
voice_id: voice_gorgias_0001
source_work: Gorgias
outer_turn_id: turn_gorgias_0087
stephanus_span: 450e
char_span:
  start_char: 7345
  end_char: 7692
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: ea2731d9ea3918e73b124842ab95290c7763032caf40486ffc0ba17ef3f38df4
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 7345
    end_char: 7348
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0002
source_work: Gorgias
outer_turn_id: turn_gorgias_0087
stephanus_span: 450e
char_span:
  start_char: 7557
  end_char: 7614
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: b37eceab7fc60ffe9972453a569d8bf45c9fbf6a9657c9e8301bb5796f9264da
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: ὑπολάβοι ἄν τις stages one indefinite speaker; the Greek supplies no registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0003
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451a-451c
char_span:
  start_char: 7758
  end_char: 9059
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 4b674f918967bfa399c3f0bf02f6e2d1515bd40c3c499ba2f049c92cde6759b0
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 7758
    end_char: 7761
limits: The constructed questioner and each q-bounded question below remain separate from Socrates' printed frame.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0004
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451a-451b
char_span:
  start_char: 8074
  end_char: 8131
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 39b60f17ea7d85b1a51b8d25e732ff9ef5eaf937ccd1d4c70425ebe49438183f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0005
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451b
char_span:
  start_char: 8226
  end_char: 8247
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 4c30334403c5f9aa4c0247c5c32a3d07e8ccd20d19008092edbf32073f20f14c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0006
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451b
char_span:
  start_char: 8366
  end_char: 8412
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 614f4bd59ac84f8a3bb52132f5a6df8e69147cd92f22694441347c5bd0f1405c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0007
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451b
char_span:
  start_char: 8490
  end_char: 8509
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 2ee2207c316c0bc9e40f4589a7a97fc64cdf70319ab0f1e493d967bafb53679f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0008
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451c
char_span:
  start_char: 8880
  end_char: 8920
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 2c631d46752a3d2e4160f8d26be57e88b4b108376d9805c86ffecf2203197a41
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0009
source_work: Gorgias
outer_turn_id: turn_gorgias_0089
stephanus_span: 451c
char_span:
  start_char: 8930
  end_char: 8965
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 5440086fdd4b20fb8cbe98fbbbd262d58292d7e456c5f9e7c20fb4ae0ce920fa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question belongs to the staged indefinite questioner; no registered terminal owner is named.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0010
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452a-452d
char_span:
  start_char: 9833
  end_char: 11534
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 39a43b43c6693fdc2c762244880e72ad7bc396ffedbd100f76eeb17cbc3252b3
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 9840
    end_char: 9843
limits: The three constructed singular role-speakers below are separately source-bounded; the surrounding narration remains Socrates' frame.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0011
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452a
char_span:
  start_char: 10005
  end_char: 10124
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 47b8e72cb172be61da60239aa0eb990d73bf177acd4ff14f85c693b65dbc88ad
voice_chain:
  - ΣΩ.
  - ΙΑΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: εἴποι πρῶτον μὲν ὁ ἰατρὸς ὅτι
    start_char: 9975
    end_char: 10004
limits: The singular doctor is grammatically introduced as the source of this first q-bounded staged reply.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0012
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452a
char_span:
  start_char: 10269
  end_char: 10289
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 78b2c6fa760a43c4ad6dc37df8896423592ef2235d052e3a2b81f5a52d303686
voice_chain:
  - ΣΩ.
  - ΙΑΤ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΙΑΤ.
  context_span:
    start_char: 9975
    end_char: 10384
    text_sha256: 7ff1eeba678ee4d1faa5794953b76bf41419534b39b91249f1fec214e7ae3526
  rationale: The source formula identifies the one staged doctor; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0013
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452a-452b
char_span:
  start_char: 10304
  end_char: 10384
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: aa15962a1ba70bc95d5e062b50e050e27bb7435f033dc3f8f7c102bd7bda1b37
voice_chain:
  - ΣΩ.
  - ΙΑΤ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΙΑΤ.
  context_span:
    start_char: 9975
    end_char: 10384
    text_sha256: 7ff1eeba678ee4d1faa5794953b76bf41419534b39b91249f1fec214e7ae3526
  rationale: The source formula identifies the one staged doctor; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0014
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452b
char_span:
  start_char: 10430
  end_char: 10553
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: d658a534ddc5f1986f50577693bff07366d60d1086da028baacd9c259ee4d5c4
voice_chain:
  - ΣΩ.
  - ΠΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: εἰ δ’ αὖ μετὰ τοῦτον ὁ παιδοτρίβης εἴποι ὅτι
    start_char: 10385
    end_char: 10429
limits: The singular trainer is grammatically introduced as the source of this first q-bounded staged reply.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0015
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452b
char_span:
  start_char: 10634
  end_char: 10655
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: ece167762d3b0459f1abab00cd644269a36eb83a7b5dd71be65450be49b6c478
voice_chain:
  - ΣΩ.
  - ΠΑΙΔ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΑΙΔ.
  context_span:
    start_char: 10385
    end_char: 10751
    text_sha256: f62100605925d0a15450dacb65011739ea70fcfc145229a185354c7051c1214c
  rationale: The source formula identifies the one staged trainer; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0016
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452b
char_span:
  start_char: 10665
  end_char: 10751
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 827ef7c255e27b418f32f7e1cf1379925a2d4bb8b755f53060f2e76527823dd2
voice_chain:
  - ΣΩ.
  - ΠΑΙΔ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΑΙΔ.
  context_span:
    start_char: 10385
    end_char: 10751
    text_sha256: f62100605925d0a15450dacb65011739ea70fcfc145229a185354c7051c1214c
  rationale: The source formula identifies the one staged trainer; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0017
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452c
char_span:
  start_char: 10842
  end_char: 10950
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 59635e6739c947a691350858d8b0b17fa8603692a6c926b19d5c75bcc675b66e
voice_chain:
  - ΣΩ.
  - ΧΡΗΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    role: cue
    text: μετὰ δὲ τὸν παιδοτρίβην εἴποι ἂν ὁ χρηματιστής
    start_char: 10752
    end_char: 10798
limits: The singular money-maker is grammatically introduced as the source of this first q-bounded staged reply.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0018
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452c
char_span:
  start_char: 11028
  end_char: 11049
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 1a9eaeeb993ced1581eb6de4c9b5e424b507867b94263359e38895c74edd8bbb
voice_chain:
  - ΣΩ.
  - ΧΡΗΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΧΡΗΜ.
  context_span:
    start_char: 10752
    end_char: 11364
    text_sha256: 04533d7068319e9484910d259431e3c2b3661974812bff31dcc863ec73c07660
  rationale: The source formula identifies the one staged money-maker; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0019
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452c
char_span:
  start_char: 11119
  end_char: 11140
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 234f0a735c9a9260b58d193fe4d8b623e8d5bda5687b518976636280c0b60388
voice_chain:
  - ΣΩ.
  - ΧΡΗΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΧΡΗΜ.
  context_span:
    start_char: 10752
    end_char: 11364
    text_sha256: 04533d7068319e9484910d259431e3c2b3661974812bff31dcc863ec73c07660
  rationale: The source formula identifies the one staged money-maker; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0020
source_work: Gorgias
outer_turn_id: turn_gorgias_0097
stephanus_span: 452c-452d
char_span:
  start_char: 11298
  end_char: 11364
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: f462c8d8b0d75b4eeced70344519fa0efe0ad505a462aefcaa593a8346549982
voice_chain:
  - ΣΩ.
  - ΧΡΗΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΧΡΗΜ.
  context_span:
    start_char: 10752
    end_char: 11364
    text_sha256: 04533d7068319e9484910d259431e3c2b3661974812bff31dcc863ec73c07660
  rationale: The source formula identifies the one staged money-maker; the q fragments are separated only by its inquit and exclude the narrator's inquit.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0021
source_work: Gorgias
outer_turn_id: turn_gorgias_0135
stephanus_span: 454d
char_span:
  start_char: 15716
  end_char: 15860
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 4be10477a4eab7fe0b205370a45c761a4325ff323c27fec48c21aaea9f8a0bed
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 15716
    end_char: 15719
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0022
source_work: Gorgias
outer_turn_id: turn_gorgias_0135
stephanus_span: 454d
char_span:
  start_char: 15776
  end_char: 15835
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 1951e1749810cfc07ad2137799b297c489f16b9ae3ec46c42e0fa676e077505e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: τίς stages an indefinite questioner; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0023
source_work: Gorgias
outer_turn_id: turn_gorgias_0151
stephanus_span: 455a-455d
char_span:
  start_char: 16789
  end_char: 18007
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: c32ee9fc7d2ebe6c8d343d33f7bd0eb28e993823a334b7b6fa97c1e494d162a8
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 16789
    end_char: 16792
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0024
source_work: Gorgias
outer_turn_id: turn_gorgias_0151
stephanus_span: 455d
char_span:
  start_char: 17799
  end_char: 17975
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 89ff2d645394630b81ee69414d5662b5986694cb430da5e291d787c1e061daa9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded speech is assigned to plural prospective students, not a single registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0025
source_work: Gorgias
outer_turn_id: turn_gorgias_0364
stephanus_span: 469c-469e
char_span:
  start_char: 44840
  end_char: 45687
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 1f49dfc39405bb2af8b400809911c0889d1ebffc8a151e0fa596d7427f878847
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 44840
    end_char: 44843
limits: Socrates' first-person hypothetical self-address remains in this frame; only the separately marked projected reply below is a child.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0026
source_work: Gorgias
outer_turn_id: turn_gorgias_0364
stephanus_span: 469e
char_span:
  start_char: 45404
  end_char: 45606
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 2f0f85b625035870c71205c76663e6bfd695d9598293183d0fbd50078fdd5c3a
voice_chain:
  - ΣΩ.
  - ΠΩΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἴσως ἂν εἴποις ἰδὼν ὅτι
    start_char: 45380
    end_char: 45403
limits: The second-person formula stages Polus's projected reply; it is distinct from Socrates' preceding self-address.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0027
source_work: Gorgias
outer_turn_id: turn_gorgias_0998
stephanus_span: 510d
char_span:
  start_char: 128851
  end_char: 129143
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 002a472ecca1667524097d4803a7069bfb61ef11471454ed0d5d3e15ddb88366
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 128851
    end_char: 128854
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0028
source_work: Gorgias
outer_turn_id: turn_gorgias_0998
stephanus_span: 510d
char_span:
  start_char: 128905
  end_char: 128968
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 16501ed736c7d4a5ca7e6c2fe2295ec56989ec008e33383e70789fa0cfbc5c77
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The inner deliberation is attributed only to τις; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0029
source_work: Gorgias
outer_turn_id: turn_gorgias_1095
stephanus_span: 521e-522a
char_span:
  start_char: 151812
  end_char: 152408
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: bb5a862fcad2921ede4b719d7510d9bc3e2cc53f2981575c193850c61340ffbb
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 151812
    end_char: 151815
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0030
source_work: Gorgias
outer_turn_id: turn_gorgias_1095
stephanus_span: 521e-522a
char_span:
  start_char: 151918
  end_char: 152202
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: a330737344c951677281e3de96123ccacbe4a27d9f5e79b23570af96fb2922ad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The accusatory q-bounded speech belongs to an indefinite objector, not a registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0031
source_work: Gorgias
outer_turn_id: turn_gorgias_1095
stephanus_span: 522a
char_span:
  start_char: 152293
  end_char: 152346
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: bc4ed457306d0b5f621adfc6ab5822f51846032693820a2e9191f57b23845f3e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The projected generic doctor is not locally registered as a terminal owner; ἰατρὸν occurs as an object, not an owner-bearing formula.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0032
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523a-523e
char_span:
  start_char: 154091
  end_char: 156079
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 87eec42eaf65c50d14972035ed47adc23f4ed89ee8e6a3f438f7210d7a5304f2
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 154098
    end_char: 154101
limits: The Zeus speech is retained as separately bounded children; q-boundary inquits remain in Socrates' frame.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0033
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523c
char_span:
  start_char: 154998
  end_char: 155016
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 2b622b970d9dcc22b1da2af86f7e0133b905be0f17030ac780c812ee17a2518b
voice_chain:
  - ΣΩ.
  - ΖΕΥΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: εἶπεν οὖν ὁ Ζεύς
    start_char: 154980
    end_char: 154996
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0034
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523c
char_span:
  start_char: 155022
  end_char: 155110
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 6f41539a62b9ce14fd288821f62df0629a764b0e57b19b5bb413ac8adad06903
voice_chain:
  - ΣΩ.
  - ΖΕΥΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΖΕΥΣ.
  context_span:
    start_char: 154980
    end_char: 156079
    text_sha256: 5e4486a486eedba7e6399a4eb3e86b28adfb65489be282fdf813d64f617d573a
  rationale: The source formula identifies Zeus; the q fragments are separated only by his inquit and exclude Socrates' narration.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0035
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523c
char_span:
  start_char: 155116
  end_char: 155183
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 47038093cf3bb6a46970269d83f35fd2002643858448d87ace50412efbe87d31
voice_chain:
  - ΣΩ.
  - ΖΕΥΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΖΕΥΣ.
  context_span:
    start_char: 154980
    end_char: 156079
    text_sha256: 5e4486a486eedba7e6399a4eb3e86b28adfb65489be282fdf813d64f617d573a
  rationale: The source formula identifies Zeus; the q fragments are separated only by his inquit and exclude Socrates' narration.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0036
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523c-523d
char_span:
  start_char: 155193
  end_char: 155647
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: f3b115b842d6616f4bdeac8b9906d5c0262ff2d81452dd71d8eff86872a274cd
voice_chain:
  - ΣΩ.
  - ΖΕΥΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΖΕΥΣ.
  context_span:
    start_char: 154980
    end_char: 156079
    text_sha256: 5e4486a486eedba7e6399a4eb3e86b28adfb65489be282fdf813d64f617d573a
  rationale: The source formula identifies Zeus; the q fragments are separated only by his inquit and exclude Socrates' narration.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0037
source_work: Gorgias
outer_turn_id: turn_gorgias_1103
stephanus_span: 523d-523e
char_span:
  start_char: 155653
  end_char: 156078
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 5eed3e4a32a6a1c2c4aeb035fe40553023d191e3072226b6b420ba1e31699f4f
voice_chain:
  - ΣΩ.
  - ΖΕΥΣ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΖΕΥΣ.
  context_span:
    start_char: 154980
    end_char: 156079
    text_sha256: 5e4486a486eedba7e6399a4eb3e86b28adfb65489be282fdf813d64f617d573a
  rationale: The source formula identifies Zeus; the q fragments are separated only by his inquit and exclude Socrates' narration.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0038
source_work: Gorgias
outer_turn_id: turn_gorgias_1104
stephanus_span: 523e-525a
char_span:
  start_char: 156079
  end_char: 158220
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 48934ebc3828aeec398feb464990470d6710a3a7457f95697479658ba50c6c81
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 156079
    end_char: 156082
limits: The continuing q-bounded mythic speech below has no owner-bearing formula inside this new outer turn.
review_status: accepted
```

```yaml
voice_id: voice_gorgias_0039
source_work: Gorgias
outer_turn_id: turn_gorgias_1104
stephanus_span: 523e-524a
char_span:
  start_char: 156083
  end_char: 156590
source_path: raw/plato/greek/gorgias.txt
source_sha256: 5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a
span_sha256: 2e3abcc749627a5d100487519d03443a1a899e89cb42c5c964726666abc18c26
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The direct q-bounded speech continues over the printed boundary, but no owner-bearing formula occurs in this outer turn; prior-turn handoff is not used.
review_status: accepted
```
