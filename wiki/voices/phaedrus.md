# Phaedrus — Voice Ledger

Greek-only reported-speech structure for the twenty-one required outer turns in
wiki/reported-turn-scopes.json. Every nested owner remains unresolved unless
the local Greek and an already-registered terminal owner license resolution;
this cohort adds only the printed frame sigla.

All forty-four records are accepted as twenty-one atomic cohorts under
wiki/review/2026-08-17-phaedrus-reported-turn-acceptance.md. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records
```yaml
voice_id: voice_phaedrus_0001
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0039
stephanus_span: 230e-231e
char_span:
  start_char: 7099
  end_char: 8989
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: d250757ee008699403cfbd7531692334b550485f1c2006b5abcffd76700c25cf
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 7099
    end_char: 7103
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0002
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0039
stephanus_span: 230e-231e
char_span:
  start_char: 7107
  end_char: 8989
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 64cde804512cc4b6302fe15fc4f5c9671d4294041801820e97fbd1145f9dd957
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: The continued written speech begins at the preceding handoff; this outer turn supplies no registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0003
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0040
stephanus_span: 231e-232e
char_span:
  start_char: 8989
  end_char: 10858
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 6803573c0d442e9f603b6a7fdc111f7ad9372b83ee5d727c0458de8b23cc2c23
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 8989
    end_char: 8993
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0004
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0040
stephanus_span: 231e-232e
char_span:
  start_char: 8997
  end_char: 10858
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 42d861d3134cee42e5cf05b5c1b114eb0543d9b073408f7bc5a6bbdbcfa20a69
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: The continued written speech has no registered terminal owner in this outer turn.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0005
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0041
stephanus_span: 232e-233e
char_span:
  start_char: 10858
  end_char: 12961
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 30b10a8ed2f374788d5a326ffc157da39746f90dd2c9e1dfdde9e4744a254607
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 10858
    end_char: 10862
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0006
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0041
stephanus_span: 232e-233e
char_span:
  start_char: 10866
  end_char: 12961
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: b838ae347dba3e727a8846539adb87eb93e56cdf51353443773b0f684b6cdf8a
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: The continued written speech has no registered terminal owner in this outer turn.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0007
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0042
stephanus_span: 233e-234c
char_span:
  start_char: 12961
  end_char: 14353
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: d466b90696a6cbd14219340759db95ad0f2159fb364d729f3dc0fbfe0e5287da
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 12961
    end_char: 12965
limits: The embedded written speech ends before Phaedrus's own question at 234c.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0008
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0042
stephanus_span: 233e-234b
char_span:
  start_char: 12965
  end_char: 13803
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 5c1ffc9968d6607f29d6308b92491c191cd90f2980d387364aaf045d0129ea94
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: The continued written speech ends before Phaedrus's own response; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0009
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0069
stephanus_span: 237a-237e
char_span:
  start_char: 19570
  end_char: 21197
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 3970081567ba7a4eeb18bbbb0ad5e4fb5e1a0eddf1713c19f0b85edd994631ba
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 19570
    end_char: 19573
limits: Socrates' Muses invocation and the introducing narration remain in the printed frame; the constructed non-lover speech begins later.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0010
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0069
stephanus_span: 237b-237e
char_span:
  start_char: 20128
  end_char: 21197
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ec16bb14d7d85be977eff6e63ec74a6712b71bea8636bad25a1c9c035cf18a09
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The direct speech is staged for one indefinite non-lover; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0011
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0070
stephanus_span: 237e-238c
char_span:
  start_char: 21197
  end_char: 22363
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 57bf2c02c6ef389ed6c631cd92128c637970ca97ae7095cd933b07adac0e4224
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 21197
    end_char: 21200
limits: Only the continued constructed speech before Socrates' 238c aside is a child.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0012
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0070
stephanus_span: 237e-238c
char_span:
  start_char: 21200
  end_char: 22287
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: c1695fc6db4950380974075882c4805601c466f74dcf00de0438f11e99dca260
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded non-lover speech continues until Socrates' own aside; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0013
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0074
stephanus_span: 238d-238e
char_span:
  start_char: 22652
  end_char: 23194
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 33decf176298512406a12d1978cb250add8deac09eb547f981192c7a26b10645
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 22652
    end_char: 22655
limits: Socrates' initial aside remains in the frame; the constructed speech resumes after the paragraph boundary.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0014
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0074
stephanus_span: 238d-238e
char_span:
  start_char: 22811
  end_char: 23194
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 36619c863193a74b0c01356fd2b45f48c61d923b42a6dfb1df0dfa921cf55a8e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded non-lover speech resumes after Socrates' aside; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0015
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0075
stephanus_span: 239a-239e
char_span:
  start_char: 23194
  end_char: 24941
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 3f4404bb1f6f0f65a6c993cf10c2e553873102a47b34adf212c7fdc9de16ab26
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 23201
    end_char: 23204
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0016
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0075
stephanus_span: 239a-239e
char_span:
  start_char: 23204
  end_char: 24941
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: bcb574624f5f1952016ddf068a242626af3a69bf52640306397fe507dd772cf3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded non-lover speech continues across the printed seam; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0017
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0076
stephanus_span: 239e-240e
char_span:
  start_char: 24941
  end_char: 27162
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: f0b0c91d12c6627b45344c6fa95b71d34ed0e0ebb120f924589ecc71c4b99eb9
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 24941
    end_char: 24944
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0018
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0076
stephanus_span: 239e-240e
char_span:
  start_char: 24944
  end_char: 27162
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: b12a5c342bc2b0a272afa50dba3e5e2627e3cce5089c9cf60db5498cd4452271
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded non-lover speech continues across the printed seam; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0019
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0077
stephanus_span: 240e-241d
char_span:
  start_char: 27162
  end_char: 28790
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: dc7b3d521bc79a40f6121f9580393253fe33854ba8c8621574213ef8474f3c53
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 27162
    end_char: 27165
limits: The constructed speech ends before Socrates explicitly closes the report.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0020
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0077
stephanus_span: 240e-241d
char_span:
  start_char: 27169
  end_char: 28686
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ecc88a8af170418e7e14ecb6a9c269c105e75a3509a5be13db6c0a53c678b851
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded non-lover speech ends before Socrates closes the report; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0021
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0160
stephanus_span: 260d
char_span:
  start_char: 67183
  end_char: 67543
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 1fa06e719a6366382c721a4dffffaee372b752822ff726b702607e28dfe560ad
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 67183
    end_char: 67186
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0022
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0160
stephanus_span: 260d
char_span:
  start_char: 67290
  end_char: 67538
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: feba5da9d4607a1e031297a86c633b6a6da77ec4dba14238de9f92c3aab548f9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded reply belongs to a personified art of speech, not a registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0023
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0201
stephanus_span: 262e
char_span:
  start_char: 71485
  end_char: 71707
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ae2371a83a1cb2db8e674df1c500828a6933794c2003c57a458f570b735ec460
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 71492
    end_char: 71496
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0024
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0201
stephanus_span: 262e
char_span:
  start_char: 71500
  end_char: 71700
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 126faaca114e998b6caee29a685961a61892f734fc84855c673e9d789fddd173
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: Phaedrus transmits a bounded written speech, but the Greek supplies no registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0025
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0225
stephanus_span: 263e-264a
char_span:
  start_char: 73645
  end_char: 73920
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: c27a3264a74c13c39e15c259374351c75be05ba82c016e5075d084eb0b7c129b
voice_chain:
  - ΦΑΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙ.
    start_char: 73645
    end_char: 73649
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0026
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0225
stephanus_span: 263e-264a
char_span:
  start_char: 73653
  end_char: 73913
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 6e7049d7142453ef7f2644d10f72acecdc8fe84b2e0f5e060d4aa90fd9bd11a1
voice_chain:
  - ΦΑΙ.
depth: 2
resolution: unresolved
unresolved_reason: Phaedrus transmits a bounded written speech, but the Greek supplies no registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0027
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0276
stephanus_span: 268a-268b
char_span:
  start_char: 81477
  end_char: 81889
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: fea95e46fcc6e68774f215756747b637e8cd32977df3c55cc928966f9deadc45
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 81477
    end_char: 81480
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0028
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0276
stephanus_span: 268a-268b
char_span:
  start_char: 81574
  end_char: 81854
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 5c36a2a0e0c32569261fbb60de0b5de2eb6587601bcf0e7a16e73ae1dfff5d2e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded claim is staged for τις; no registered terminal owner is supplied.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0029
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0278
stephanus_span: 268b-268c
char_span:
  start_char: 82002
  end_char: 82136
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 91144c618fb294c9b9ea81b9af42c00d994af204a5064f7a6bae61b81ab902c9
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 82002
    end_char: 82005
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0030
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0278
stephanus_span: 268b-268c
char_span:
  start_char: 82026
  end_char: 82131
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 3e2b8a14ca33d2ebec776a7b5d272cde78050a34bc83fa7117f4a774a47335e8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded reply remains attached to the constructed speaker without a registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0031
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0282
stephanus_span: 268d-268e
char_span:
  start_char: 82738
  end_char: 83243
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 735cb9c064dc0ae5d97148ae020615d03eba33f3fd0d5abb8fb484853b187625
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 82738
    end_char: 82741
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0032
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0282
stephanus_span: 268e
char_span:
  start_char: 82955
  end_char: 82979
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 6621d1167e06675ac256ee4b29a2fd4b9c68caa73dc072a7c014b2e759407b71
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The brief q-bounded rebuke is staged for an unregistered musician.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0033
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0282
stephanus_span: 268e
char_span:
  start_char: 83022
  end_char: 83238
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 1d800f18d9b0494b1f4b197dda6b776db356e6d49cbdcf5b3dbd7b084b36d766
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded fuller reply is staged for an unregistered musician.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0034
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0286
stephanus_span: 269a-269c
char_span:
  start_char: 83441
  end_char: 84367
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ebda8b406edaf99624cc4ac9cbbb66ed4c788f29d2d76732365028f9786c1557
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 83441
    end_char: 83444
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0035
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0286
stephanus_span: 269b-269c
char_span:
  start_char: 83864
  end_char: 84360
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 4843ea451c4b453dd518702d09e6dc43d56c89214bdf4a3c149bcf1572038fa6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The counterfactual q speech is tied to Adrastus and Pericles without a singular registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0036
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0319
stephanus_span: 271e-272b
char_span:
  start_char: 88943
  end_char: 89724
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: b0dd33b4a79646c25e708e09510f6704441a7925492cc51cdcab8bbc945a0959
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 88943
    end_char: 88946
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0037
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0319
stephanus_span: 272b
char_span:
  start_char: 89595
  end_char: 89719
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: b70631708cabf7344707f3aab0c14c97c26cbfb32d60ee4a054877a80fd677c9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded utterance is assigned only to an unregistered συγγραφεύς.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0038
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0331
stephanus_span: 273b-273c
char_span:
  start_char: 91490
  end_char: 92079
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 6a2b950f7339b9303b80f285dc7bbd5e6896dea24399f6e8805fc4f89089cb6d
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 91490
    end_char: 91493
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0039
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0331
stephanus_span: 273c
char_span:
  start_char: 91846
  end_char: 91888
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ad52ff146a72d3cff572b258ae38f46806f7b4ed0fe2273290c8e5e4d15d1766
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The direct first-person clause belongs to the constructed defendant, not a registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0040
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0348
stephanus_span: 274c-274e
char_span:
  start_char: 94106
  end_char: 95077
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: ffca6a7a9fc0e5f3439ee31f8c015a535945c18037f905dd4ff07541789136ca
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 94106
    end_char: 94109
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0041
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0348
stephanus_span: 274e
char_span:
  start_char: 94925
  end_char: 94958
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 3ba5639766a62bc0730622a0021a608b8391231559728278068cf4633b7955f3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded address is Theuth's direct speech, but Theuth is not registered in this dialogue.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0042
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0348
stephanus_span: 274e
char_span:
  start_char: 94978
  end_char: 95072
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 50b5c72829bc51f8aab997646c01da4854cca9341586d8592db8cd41befb0491
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded continuation is Theuth's direct speech, but Theuth is not registered in this dialogue.
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0043
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0349
stephanus_span: 274e-275b
char_span:
  start_char: 95077
  end_char: 95748
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: d531dfe4cca16e69e21b714ec0eaafd98f02405c0314a9427655ab3396fe1aaa
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 95077
    end_char: 95080
review_status: accepted
```

```yaml
voice_id: voice_phaedrus_0044
source_work: Phaedrus
outer_turn_id: turn_phaedrus_0349
stephanus_span: 274e-275b
char_span:
  start_char: 95096
  end_char: 95743
source_path: raw/plato/greek/phaedrus.txt
source_sha256: 89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c
span_sha256: 2cd5c65325b2f800a5e962c4ecfa0acee9cf716528c1af5294ed868fd545e42a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded reply follows ὁ δ’ εἶπεν without a registered terminal owner.
review_status: accepted
```
