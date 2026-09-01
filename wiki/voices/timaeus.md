# Timaeus — Voice Ledger

Greek-only reported-speech structure for the six required outer turns in
`wiki/reported-turn-scopes.json`. The 21a–25e material preserves Critias's
elder-Critias report and the Egyptian-priest layer; the 41a–d address is kept
separate from the following indirect discourse.

All twenty-eight records are accepted as six atomic cohorts under
`wiki/review/2026-08-17-timaeus-reported-turn-acceptance.md`. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records

```yaml
voice_id: voice_timaeus_0001
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21a-21e
char_span:
  start_char: 7588
  end_char: 9406
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: c83db206df600baf09403b4a819c81b5b56f341fd12de17030f6206d66ca8d91
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 7588
    end_char: 7591
limits: The printed Critias frame contains the elder-Critias report and several q-bounded fragments whose owners are not all recoverable.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0002
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21c-21d
char_span:
  start_char: 8306
  end_char: 8656
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 565d529b2d294225edcd33e516430b927a0c4c886d8e215478f32e200830114d
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
limits: The preceding role formula opens the elder Critias's directly quoted speech.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0003
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8657
  end_char: 8684
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 5e5edf8bf1cb14a935d39ce6d75c6b9057b5c36860348a68006b082cf3d0c052
voice_chain:
  - ΚΡ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded question is followed only by bare ἦ δ’ ὅς; its speaker is not named or otherwise given a registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0004
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8694
  end_char: 8712
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: c99405d23f320360f95bac6fb1e68081b353e87a87a50a9396107dfb6d6127ea
voice_chain:
  - ΚΡ.
depth: 2
resolution: unresolved
unresolved_reason: ὦ Κριτία identifies an addressee inside the q piece, not the terminal owner of the preceding question.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0005
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8713
  end_char: 8738
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: a7a53837c163bdbcc705138db4b0c639c25330ddc832cddc48b4260a7fc62de7
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0006
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8744
  end_char: 8900
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 6758f4f92dc67e900e1402eb949f27d66688e8c9a581beb681f0742c9b184fcb
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0007
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8901
  end_char: 8924
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: b2f41f7962f141758880194c0ec7074a3713c0dc389a6bda7908a15d767ed602
voice_chain:
  - ΚΡ.
depth: 2
resolution: unresolved
unresolved_reason: The imperative q piece is followed only by bare ἦ δ’ ὅς, with no named or registered owner for this questioner.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0008
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21d
char_span:
  start_char: 8934
  end_char: 9006
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 0e817a0f08f907fd34ba1c59aabbab0890e6ac1ba474bd90e776e6c965b31ab1
voice_chain:
  - ΚΡ.
depth: 2
resolution: unresolved
unresolved_reason: The q-bounded request contains no owner-bearing formula; its reference to Σόλων is reported content, not a speaker identification.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0009
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21e
char_span:
  start_char: 9017
  end_char: 9050
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 12f4abdb176fd73fb26c4521b5567add7380035e0ca43c21b2010cf2f8b473b4
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0010
source_work: Timaeus
outer_turn_id: turn_timaeus_0037
stephanus_span: 21e
char_span:
  start_char: 9060
  end_char: 9405
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: ed9b452962c149abf79db56e74f45593f2d3a8943ab0960a20d472bd2c90ae0c
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0011
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 21e-22e
char_span:
  start_char: 9406
  end_char: 11396
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 9bbab8d203b49b7bb9a36505a8412bcd4b98200a48e0dc1a5cd1216cb190e7f1
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 9406
    end_char: 9409
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0012
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 21e-22e
char_span:
  start_char: 9410
  end_char: 11395
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 29ddf1126f5a81ce490619eac4121a9664335845b99e476ce3e11761685636b6
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
limits: This outer q is the elder Critias's reported Solon account; the priest and Solon pieces below remain separately nested.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0013
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 22b
char_span:
  start_char: 10068
  end_char: 10143
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 2b14f0f8501e0166c63fb7055c51df8222dfd5bd66727c9cedfab66ea0d51248
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: "καί τινα εἰπεῖν τῶν ἱερέων εὖ μάλα παλαιόν· "
    start_char: 10024
    end_char: 10068
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0014
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 22b
char_span:
  start_char: 10157
  end_char: 10186
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: b378eaf0b24cbec305043ce47ede121aae635a762a8136050d3c2a43fe4a3b9d
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΣΟΛ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΟΛ.
    - ΙΕΡ.
  context_span:
    start_char: 9410
    end_char: 10213
    text_sha256: 3767430071dcaa7f4e6dda4c08a50725dee32686fdd6f61f62dae8dbce5e3308
  rationale: Σόλων is the subject carried into ἀκούσας and φάναι; the priest's preceding address and immediately resumed εἰπεῖν-bound speech delimit this reply without alternation.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0015
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 22b
char_span:
  start_char: 10194
  end_char: 10213
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 24902153ef57369ef8eb54c2f06907afb4fe5b75464c9dec0f4608385d16f2d8
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "καί τινα εἰπεῖν τῶν ἱερέων εὖ μάλα παλαιόν· "
    start_char: 10024
    end_char: 10068
  - kind: formula_bounded_continuation
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0016
source_work: Timaeus
outer_turn_id: turn_timaeus_0038
stephanus_span: 22b-22e
char_span:
  start_char: 10222
  end_char: 11390
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 679be210d3c779a63ba9e5cda90556653f69d564bd1dc347cb2634b754070a94
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "καί τινα εἰπεῖν τῶν ἱερέων εὖ μάλα παλαιόν· "
    start_char: 10024
    end_char: 10068
  - kind: formula_bounded_continuation
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0017
source_work: Timaeus
outer_turn_id: turn_timaeus_0039
stephanus_span: 22e-23e
char_span:
  start_char: 11396
  end_char: 13556
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: bf1b5dc80f7fb275dbae4754090bd754b16d6151b373516496177fe062d2306c
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 11396
    end_char: 11399
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0018
source_work: Timaeus
outer_turn_id: turn_timaeus_0039
stephanus_span: 22e-23e
char_span:
  start_char: 11400
  end_char: 13555
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: f2f247937a4c0b1a69cfec234bf62fee4a78e51fa279ae29277f8963ca1d0c4d
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0019
source_work: Timaeus
outer_turn_id: turn_timaeus_0039
stephanus_span: 22e-23d
char_span:
  start_char: 11404
  end_char: 12883
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 6f3e37c15ca6b9971f807c89b26eb8518f5f53f0863ee7a77819e514c5c12980
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "καί τινα εἰπεῖν τῶν ἱερέων εὖ μάλα παλαιόν· "
    start_char: 10024
    end_char: 10068
  - kind: formula_bounded_continuation
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0020
source_work: Timaeus
outer_turn_id: turn_timaeus_0039
stephanus_span: 23d-23e
char_span:
  start_char: 13048
  end_char: 13550
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 3fa20e719a4fbfca8d6d9294b64a087da99439d6f68d28e76a06c80530422be6
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0021
source_work: Timaeus
outer_turn_id: turn_timaeus_0040
stephanus_span: 23e-24e
char_span:
  start_char: 13556
  end_char: 15426
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 4ab00efb64562142a6432c9a5159c94fdf8e25b26ed54876d5e4e8aeda304932
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 13556
    end_char: 13559
limits: The re-set printed siglum frames the mechanically split continuation of the priest's quoted speech.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0022
source_work: Timaeus
outer_turn_id: turn_timaeus_0040
stephanus_span: 23e-24e
char_span:
  start_char: 13560
  end_char: 15425
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 7b8ab2f0234f446ab5e503bc3ce847010b05e0da359d06a12c3caae39d70f65c
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0023
source_work: Timaeus
outer_turn_id: turn_timaeus_0040
stephanus_span: 23e-24e
char_span:
  start_char: 13564
  end_char: 15420
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 1da4b80dc71bb2bb3ce7f00ab27e592c0895d5f6c3d1f20b34c9e3fce906a9cc
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
  - kind: formula_bounded_continuation
    text: οὓς ἔλεγεν ὁ ἱερεύς
    start_char: 18900
    end_char: 18919
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0024
source_work: Timaeus
outer_turn_id: turn_timaeus_0041
stephanus_span: 24e-25e
char_span:
  start_char: 15426
  end_char: 17510
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 5e4bfe6df113c20aa39fcb000494ada6581dcd5758eac72a9f9ce6a8d7a41dce
voice_chain:
  - ΚΡ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΚΡ.
    start_char: 15426
    end_char: 15429
limits: The re-set printed siglum frames the final mechanically split continuation of the priest's quoted speech.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0025
source_work: Timaeus
outer_turn_id: turn_timaeus_0041
stephanus_span: 24e-25d
char_span:
  start_char: 15430
  end_char: 17189
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: f6cd420ff6d454d477047f6c7a4399a6883913fe121bf8a1095e9d83aaaa0144
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "ὁ δὴ γέρων— σφόδρα γὰρ οὖν μέμνημαι—μάλα τε ἥσθη καὶ διαμειδιάσας εἶπεν· "
    start_char: 8233
    end_char: 8306
  - kind: formula_bounded_continuation
    text: τὰ μὲν δὴ ῥηθέντα, ὦ Σώκρατες, ὑπὸ τοῦ παλαιοῦ {25e} Κριτίου
    start_char: 17194
    end_char: 17254
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0026
source_work: Timaeus
outer_turn_id: turn_timaeus_0041
stephanus_span: 24e-25d
char_span:
  start_char: 15434
  end_char: 17184
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: c83ca4f11f4daa0c5963c61f683584eac6c574528ccf3a6894ae327d667c41e4
voice_chain:
  - ΚΡ.
  - ΚΡΙΠ.
  - ΙΕΡ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: "τὸν οὖν ἱερέα φάναι· "
    start_char: 13027
    end_char: 13048
  - kind: formula_bounded_continuation
    text: οὓς ἔλεγεν ὁ ἱερεύς
    start_char: 18900
    end_char: 18919
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0027
source_work: Timaeus
outer_turn_id: turn_timaeus_0062
stephanus_span: 40e-42a
char_span:
  start_char: 42204
  end_char: 44575
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: 6f269c61ea7840a600b5d7128dd008382ff7598334d7e564ff60e94e1d09ae39
voice_chain:
  - ΤΙ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΤΙ.
    start_char: 42204
    end_char: 42207
limits: The printed Timaeus frame contains one directly quoted address; the following ὅτι-plus-optative discourse is not recorded.
review_status: accepted
```

```yaml
voice_id: voice_timaeus_0028
source_work: Timaeus
outer_turn_id: turn_timaeus_0062
stephanus_span: 41a-41d
char_span:
  start_char: 42683
  end_char: 43866
source_path: raw/plato/greek/timaeus.txt
source_sha256: ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f
span_sha256: ce78a1e17ed7c8d844935a88f0ade8d787c4cecfd37ae683a7264621c3922004
voice_chain:
  - ΤΙ.
  - ΔΗΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: "λέγει πρὸς αὐτοὺς ὁ τόδε τὸ πᾶν γεννήσας τάδε— {p} "
    start_char: 42632
    end_char: 42683
limits: The role formula introduces the 41a–d direct address; it does not extend to the following εἶπεν αὐταῖς, ὅτι indirect report.
review_status: accepted
```
