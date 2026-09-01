# Republic — Voice Ledger (partial: frame + Book 1)

Reported-speech structure for `turn_republic_0001` (327a–621d), the single
unlabelled outer turn covering the whole dialogue. This is the corpus reported-turn completion campaign's second wave
partial build: the depth-1 frame record plus the complete Book 1 primary
candidate cohort (UTF-16 `[0, 59068)`). Books 2–10 are not yet extracted;
coverage below depth 1 is intentionally incomplete and geometry passes because
gapless tiling is enforced only at each turn's minimum depth.

Every record in this file is `unreviewed`. Nothing here is compiled, activated,
or joined; Republic is absent from `derived/plato/voices/cutovers.toml`.

The Republic prints no siglum anywhere: Socrates narrates the whole work in the
first person (`κατέβην`), so the outer turn's registry speaker is the literal
`(none)` and the depth-1 record carries the `unlabelled_turn_frame` evidence
kind — the first use of that kind in the corpus. Everything the characters say
is staged direct speech transmitted below the narrator, so dialogue turns sit
at depth 2 and speech staged inside those turns at depth 3.

Span construction follows the Phaedo precedent (the Phaedo discourse attribution review): a staged utterance
is one continuous span that includes the bare inquit phrases printed inside it
(`ἦν δ’ ἐγώ`, `ἔφη`, `ἦ δ’ ὅς`); the introducing formula that names or
person-marks the owner is cited as evidence, not carved out of the span.
Settled census rulings from `wiki/review/2026-08-09-republic-census-
reconciliation.md` (332c, 337b–c, and the in/out lists) are applied without
reopening. Note the source prints the apostrophe as U+2019 (`ἦν δ’ ἐγώ`).

```yaml
voice_id: voice_republic_0001
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327a-621d
char_span:
  start_char: 0
  end_char: 557124
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: unlabelled_turn_frame
    role: cue
    text: κατέβην χθὲς εἰς Πειραιᾶ μετὰ Γλαύκωνος τοῦ Ἀρίστωνος
    start_char: 16
    end_char: 69
  - kind: unlabelled_turn_frame
    role: cue
    text: ὦ Σώκρατες, δοκεῖτέ μοι πρὸς ἄστυ ὡρμῆσθαι ὡς ἀπιόντες
    start_char: 868
    end_char: 922
limits: The turn prints no siglum; the registry speaker is the metadata literal (none). The first-person aorist opening establishes an unnamed internal narrator, and Polemarchus' staged vocative addresses that narrator as Socrates. The frame owns the narration only; every staged utterance below it carries its own record.
review_status: accepted
```

```yaml
voice_id: voice_republic_0002
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327b
char_span:
  start_char: 516
  end_char: 556
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7d0e78a4f7f1fa08b7db7c74d78ab9349393b75a70aed5bd6878bee3628b8e9f
voice_chain:
  - ΣΩ.
  - ΠΑΙΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: ὁ παῖς
    start_char: 486
    end_char: 492
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0003
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327b
char_span:
  start_char: 608
  end_char: 656
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d94bbd5b4600507fa4a54b2c95d9c51cc0d4528a59e94b7062b85279559c202b
voice_chain:
  - ΣΩ.
  - ΠΑΙΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΑΙΣ.
  context_span:
    start_char: 470
    end_char: 656
    text_sha256: a778869683b8dbf53b48a9e1bfe7613e8a028ccff73b39da9ea94fdaff8448ae
  rationale: The named child report, Socrates' question, and the immediate answer delimit one local exchange.
```

```yaml
voice_id: voice_republic_0004
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327b
char_span:
  start_char: 658
  end_char: 694
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d39ff7b14cd7dda5234f6a5b04eee47ceca42cdc97eb69f82f24fddfcf4a4dce
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ Γλαύκων
    start_char: 677
    end_char: 694
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0005
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 868
  end_char: 922
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a33e126120f5855ba04acb9d24631b4578497c1fffd07d8a9766654c39e099e9
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ οὖν Πολέμαρχος ἔφη
    start_char: 846
    end_char: 866
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0006
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 928
  end_char: 960
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2731467f59eecb5b124f99dd94dce5eabf37c459b346b2c41d9e6a20db423131
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 951
    end_char: 960
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0007
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 966
  end_char: 996
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e00ebaf8edf79f6bcb16bfc6ea7bdf65679be7f12102125191d0c6b57814a648
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare formula and target question do not independently identify an owner; the prior named formula is prohibited carry-forward.
```

```yaml
voice_id: voice_republic_0008
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1002
  end_char: 1012
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c936421fc35c9b76ba8fab180ff8d3e3f6b926cb47afa46463a9d7d03735e8cd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion, no inquit and no vocative; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0009
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1018
  end_char: 1072
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a9de11d585cc23d6a50858a5a1f799208b8884982170c55390a2be42a38ea333
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: No direct named, person-marked, closing, or independently bounded discourse cue identifies this bare-formula speaker.
```

```yaml
voice_id: voice_republic_0010
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1078
  end_char: 1153
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 58492962bd38a507dd61961ab76366651d6a3ca7f05cfbecef13727ba4bdbb3a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 1086
    end_char: 1095
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0011
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1159
  end_char: 1206
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e4db2312c998e06e5b4a0ef4b0edb96416e716566c3e31110c3b4c8c0dc0204c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target is a bare reported question with no independently owner-bearing cue; the earlier named formula is not a licensed antecedent.
```

```yaml
voice_id: voice_republic_0012
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1212
  end_char: 1234
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a89a6b3fddfd9594c7c90e2be5358f486e24b5ecb8cd8ba349588c276c77089f
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Γλαύκων
    start_char: 1221
    end_char: 1234
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0013
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 327c
char_span:
  start_char: 1240
  end_char: 1281
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 69eb6e2830bc8810f96a42bc0103b9ff7f7249fdaa9be73035f8bd6ee0f94694
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no inquit, no vocative; sense implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0014
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328a
char_span:
  start_char: 1312
  end_char: 1385
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c90fa813b87409ea6b8b5485591b36d9763af1b8d6a5566544d28ea06a365ead
voice_chain:
  - ΣΩ.
  - ΑΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Ἀδείμαντος, ἆρά γε, ἦ δ’ ὅς
    start_char: 1294
    end_char: 1327
limits: The named parenthetical reporting formula begins before and ends inside the reported span. It directly identifies Adeimantus without carrying an owner from a preceding formula.
review_status: accepted
```

```yaml
voice_id: voice_republic_0015
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328a
char_span:
  start_char: 1391
  end_char: 1505
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 01d0781680947dc7442cf4a27a42301dd70961544d5b887d7b90224b579577b2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 1402
    end_char: 1411
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0016
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328a-328b
char_span:
  start_char: 1511
  end_char: 1752
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bcd31602e7debeeac29ffff5322df50b038d25a4d625e6bee45a11c53b18ec40
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Πολέμαρχος
    start_char: 1518
    end_char: 1534
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0017
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328b
char_span:
  start_char: 1773
  end_char: 1800
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 337a04e2c5d86421d41ccd741184c6e2b05513976b9e22a28437ffc2c8b50384
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ Γλαύκων, ἔοικεν, ἔφη
    start_char: 1758
    end_char: 1784
limits: The named parenthetical reporting formula begins before and ends inside the reported span. It directly identifies Glaucon without carrying an owner from a preceding formula.
review_status: accepted
```

```yaml
voice_id: voice_republic_0018
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328b
char_span:
  start_char: 1806
  end_char: 1847
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ab232f4075686530551519f43b93d1b72b51b97bb2ed267e732f664e54206d88
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 1821
    end_char: 1830
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0019
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328c-328d
char_span:
  start_char: 2414
  end_char: 2916
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e4eac37e54117854cd9315b2966eb6e632ca87f26bff0c991a597a3a45cc40a4
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κέφαλος ἠσπάζετό τε καὶ εἶπεν
    start_char: 2381
    end_char: 2412
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0020
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 328d-328e
char_span:
  start_char: 2922
  end_char: 3378
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f308a74f5d580d662061ffe384d7db7bf2164529b0d231f9401f9d686fc062c1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 2931
    end_char: 2940
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0021
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 329a-329d
char_span:
  start_char: 3390
  end_char: 5089
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6c2ecc6271e9442bd04327ab8ecc547bffb0a301a1f47afd6dec1dc9ee916583
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 2918
    end_char: 5089
    text_sha256: 57ba7a65c76ce19a9b97d4028601617fad0aa63808a244721b4f09e24855370f
  rationale: Socrates names Cephalus in the question; the target begins a first-person answer to Socrates and stops at Socrates' next handoff.
```

```yaml
voice_id: voice_republic_0022
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 329b-329c
char_span:
  start_char: 4277
  end_char: 4383
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 75bb3b1443fd4a1ff08bfaaff7d1d9c7ef8b5f2addfbbffc238cecfc78f7bebd
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 3
resolution: unresolved
unresolved_reason: indefinite questioner (ἐρωτωμένῳ ὑπό τινος) staged inside Cephalus’ Sophocles anecdote
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0023
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 329c
char_span:
  start_char: 4386
  end_char: 4519
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f413f2215b0fa1655dbd85bead4e94ea5d30d1b6389a056af515a53eec685422
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
  - ΣΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὅς, {q} εὐφήμει, {/q} ἔφη
    start_char: 4386
    end_char: 4415
    antecedent_text: Σοφοκλεῖ
    antecedent_start_char: 4220
    antecedent_end_char: 4228
limits: The pronoun ὅς is licensed by the earlier named Sophocles antecedent in the anecdote, not by a preceding reporting formula. The record begins at its own reporting formula and retains only the bounded response.
review_status: accepted
```

```yaml
voice_id: voice_republic_0024
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 329d-329e
char_span:
  start_char: 5095
  end_char: 5397
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0bad143df9d28075fca968228081ce925b5856e50f5292bb06473698c1aaf673
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: καὶ ἐγὼ ἀγασθεὶς αὐτοῦ εἰπόντος ταῦτα, βουλόμενος ἔτι {329e} λέγειν αὐτὸν ἐκίνουν καὶ εἶπον
    start_char: 5095
    end_char: 5186
limits: The source-bound inner Socratic turn begins with its own first-person reporting formula and continues through the direct address to Cephalus. It does not use exchange alternation or reviewed attribution.
review_status: accepted
```

```yaml
voice_id: voice_republic_0025
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 329e-330a
char_span:
  start_char: 5403
  end_char: 5901
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 22786c2a47ee4f01290938deb9e536e5e25c1430047d1e170c0651ae0b3597b4
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 5091
    end_char: 5901
    text_sha256: 60df1582bc478b8d3d54736751c0d3ab86e423b8d50ea6dbc3b56f789b23230a
  rationale: Socrates directly addresses Cephalus; the target answers Socrates and ends at the next Socratic question.
```

```yaml
voice_id: voice_republic_0026
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330a
char_span:
  start_char: 5907
  end_char: 5981
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f848403ec3dbd22119d978517ba49bda0520523743870353fa031470b2ba6c2a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 5919
    end_char: 5928
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0027
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330b
char_span:
  start_char: 5994
  end_char: 6347
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6348591341e06706fb0de96990f6a4486423b06b7a3370b0cef2eb3d5ab508c4
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 5903
    end_char: 6347
    text_sha256: b6869bf719a751fa9365996fd311c409232392bf1b4b53bd3a8eb58315901baa
  rationale: Socrates' named question to Cephalus is immediately followed by a first-person answer to Socrates, ending before Socrates resumes.
```

```yaml
voice_id: voice_republic_0028
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330b-330c
char_span:
  start_char: 6353
  end_char: 6811
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6e091b5c67688355a39506e939c96de6c306a8382f80ef8c13baed95ffad2f1d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6374
    end_char: 6383
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0029
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330c
char_span:
  start_char: 6817
  end_char: 6835
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f6ac10efce588709d620e53bfe8e6374541a9c0373fd2b69d6c3b32c161b9b22
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 5903
    end_char: 6835
    text_sha256: 05123fd0690f60ce99f2fd776600b4de9dafca9ed6eb9803253b4981196a4d42
  rationale: The exchange begins with Socrates' named question to Cephalus and has no handoff before the target's acknowledgment of Socrates.
```

```yaml
voice_id: voice_republic_0030
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330d
char_span:
  start_char: 6848
  end_char: 6965
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bf5ea875646c92ba8b9799119446f9ad2ff10026ede649231fad464ea599553a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 6862
    end_char: 6871
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0031
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 330d-331b
char_span:
  start_char: 6971
  end_char: 8516
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a0adda8a71a21aeb056d91ce61516e43c3c9e5b73f3aaa3deb500e09764662bf
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 5903
    end_char: 8516
    text_sha256: 14831cca9d5cdfd03caa8efb79d867ebbbebc1935e8b1aa4702322b3b8bde176
  rationale: The named Socrates–Cephalus exchange stays bounded through the target's first-person answer to Socrates and ends before Socrates resumes.
```

```yaml
voice_id: voice_republic_0032
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331c
char_span:
  start_char: 8529
  end_char: 8993
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 40f6632186c6c029d8fca7274667aa239d0952667859497fff55fe957ab742c9
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 8539
    end_char: 8548
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0033
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9006
  end_char: 9024
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 04845bf36d9702e292a79a24ed8c45c520615e293bade8293902cdcc60a4795a
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΦ.
  context_span:
    start_char: 8525
    end_char: 9024
    text_sha256: 286d408a1a90dd97ffd3acadc8d99401d39a886f7963272537ff4c1385426d2e
  rationale: Socrates freshly addresses Cephalus; the target immediately acknowledges Socrates before the next named handoff.
```

```yaml
voice_id: voice_republic_0034
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9030
  end_char: 9112
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 74b0d430e2f7eb6296a21c3fe177d1e774af7474a0ed7827aa2fa637b758c3b7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no inquit, no vocative; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0035
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9118
  end_char: 9206
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 27835ddf0cd47c2b6335fa6c79b74765c01885207cee950efbee0fe29caecd7c
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὑπολαβὼν ὁ Πολέμαρχος
    start_char: 9149
    end_char: 9170
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0036
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9212
  end_char: 9307
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 75bbab03a650a864bf5996ce484aac88aeeafb3c07809c0f5589e42696cf366d
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κέφαλος
    start_char: 9224
    end_char: 9237
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0037
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9313
  end_char: 9366
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 70a6f3f8343aea7eaaa9ee756db5ee3d664b0b87cf5186dabe9e6756e4770a5f
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Πολέμαρχος
    start_char: 9331
    end_char: 9343
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0038
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331d
char_span:
  start_char: 9372
  end_char: 9396
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ebadf87a57860a5f8a605b92d6ff9f61442cde53c61a3b837a7e8fcaaa3e4d38
voice_chain:
  - ΣΩ.
  - ΚΕΦ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΦ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 9396
    text_sha256: 77a87c5f8c6bf30b07aadac2f484d5b11ae90d378230c8725a7812db9ae2b96b
  rationale: Cephalus transfers the discussion, Polemarchus identifies himself as heir, and the target is the immediate affirmative answer ending in departure.
```

```yaml
voice_id: voice_republic_0039
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331e
char_span:
  start_char: 9435
  end_char: 9540
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1364beac60da7495ca14da0a99e2a8d0a4d13a47879d6958a21e7e6313d2fb10
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον ἐγώ
    start_char: 9444
    end_char: 9453
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0040
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331e
char_span:
  start_char: 9546
  end_char: 9646
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 694b391cb4c3a1a7d5b8d91ea4e322bd3ec0b2a907f24b23d93e6bd743927de0
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9309
    end_char: 9646
    text_sha256: d4fe92d6b2210d9a7422a107724f899e3b028974480233e4b0f741abaa0bf0e9
  rationale: Polemarchus identifies himself as heir; Socrates directs the next question to that heir and the target answers it.
```

```yaml
voice_id: voice_republic_0041
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 331e-332a
char_span:
  start_char: 9652
  end_char: 10003
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a7287f3651bceca54fa40365387dde2912cd25182f8442970ab16d429287019d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 9665
    end_char: 9674
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0042
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a
char_span:
  start_char: 10009
  end_char: 10012
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0043
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a
char_span:
  start_char: 10018
  end_char: 10083
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6f090806fba37263a41300eaa6fee2365f532cca97c360e2493d2a709dd61276
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0044
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a
char_span:
  start_char: 10089
  end_char: 10103
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5af21a1fedcdd4c3487ae929b3dfecad0443b7ba42af2be20fcbf8af992c546c
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9648
    end_char: 10103
    text_sha256: 69699754fac3c79e93dc805fb4d4c48e8f1204abde8fd7631c44ea35292d29e4
  rationale: Socrates names Polemarchus as addressee and asks the question the target immediately answers; no handoff intervenes.
```

```yaml
voice_id: voice_republic_0045
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a
char_span:
  start_char: 10109
  end_char: 10203
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ae0a871fa2097f0d18ee52065bb508fe6a9dc99c30c7a101f1ecf2dac4a84ea9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0046
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a
char_span:
  start_char: 10209
  end_char: 10312
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5fd03a24f9d747ad46c1c756dcaf6c16f0d8b4a3f0e7254e4c59cc0f61397344
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9648
    end_char: 10312
    text_sha256: cd3f32fbb79972f77071a14fe26720c3e624ca969c12efb896e8b64902818a54
  rationale: The named Socrates–Polemarchus exchange remains bounded through the target's immediate answer to Socrates.
```

```yaml
voice_id: voice_republic_0047
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332a-332b
char_span:
  start_char: 10318
  end_char: 10547
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 298026deaeac034ec808770c62b95b9c3204bee8fa632f236606bfd15ffd3614
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 10327
    end_char: 10336
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0048
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332b
char_span:
  start_char: 10553
  end_char: 10565
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9ffb7040deb577808b5c17154441c5959ff32956b7c000b3139422cc7f7fb053
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0049
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332b
char_span:
  start_char: 10571
  end_char: 10624
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f7054a2a4d76ecb43faf06c53367463fe8c4102c9e568e730e8648a49ef58fd3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0050
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332b
char_span:
  start_char: 10630
  end_char: 10754
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f8ed8eda64f077586f34ed7f1c832a1ebc514570a51eac7a1c51165832c433b3
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9648
    end_char: 10754
    text_sha256: 6a09f82e955c110634bc87cd92e512991277c5b384eedbf190facdcd25261853
  rationale: The exchange opens with Socrates naming Polemarchus and remains bounded through this immediate answer to Socrates.
```

```yaml
voice_id: voice_republic_0051
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332b-332c
char_span:
  start_char: 10760
  end_char: 10958
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ae6f513fdc4d3ab8f2d9be70929afe2112bf7cb890795c3cb202b8a2b07bbaa3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 10774
    end_char: 10783
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0052
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332c
char_span:
  start_char: 10964
  end_char: 10981
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fc6abc6499d3e87fd94269e6743d5694dc7c252c164a27a825d25a1040a107be
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9648
    end_char: 10981
    text_sha256: b65baf3574c3ed284819c6fb42865a6a936afb7b8e4e4445b649e7032e865ae3
  rationale: Socrates explicitly names Polemarchus at the exchange opening; the target's second-person question is directed to the immediately preceding Socratic turn with no handoff between.
```

```yaml
voice_id: voice_republic_0053
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332c
char_span:
  start_char: 10987
  end_char: 11165
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1dcb8859ba93c735319ec908709bc836854e807b5f0e8a3b9ae487cee010e172
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 11000
    end_char: 11009
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0054
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332c
char_span:
  start_char: 11035
  end_char: 11130
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a9b54629b3bd09b8b07297efac88a41f1f4383212fe5c8158bbce555001b7d40
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: indefinite questioner (ὥσπερ ἂν εἴ τις ἔροιτο) putting a question to Simonides
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0055
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332c
char_span:
  start_char: 11171
  end_char: 11226
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7888c719abc826292c611744412fb5b2821d58356a5f0efd5a6f7d409082054f
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9648
    end_char: 11226
    text_sha256: 7fc9ec65092a702e82eee8d35e689d370fd8a8e7db50e39aeeff6b6d2c9f6312
  rationale: The named Polemarchus exchange remains bounded through the target's immediate answer to Socrates' hypothetical question.
```

```yaml
voice_id: voice_republic_0056
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332c
char_span:
  start_char: 11232
  end_char: 11306
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dcb5ee5ccaf1bbc681aa7e512aa221f9de30e1560546349045d7a1e671dff3c2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0057
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11319
  end_char: 11343
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d3e9201ae103460ab01724c1b4b35b8121eb099465a176e8f2f362c0bddcd46f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0058
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11349
  end_char: 11411
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f9fd9160949c2398bc1cb1611d4ed00db103b13488ab568c6b3d729e9ff35366
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0059
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11417
  end_char: 11549
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a33715185e1ff5cc34cb690916bef57e1d4136dbd655485e7ceacc65772bac7b
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 12045
    text_sha256: 69d05a107722b95d39e170812aa25d0375e8c1e739fb9d391302854d9ab7fa16
  rationale: Polemarchus explicitly takes over the argument, then Socrates restarts the direct exchange. This target's ἔφη and in-span ὦ Σώκρατες identify Socrates as addressee, so Polemarchus is the other locally bounded owner.
review_status: accepted
```

```yaml
voice_id: voice_republic_0060
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11555
  end_char: 11624
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3bdea77b1cb31f7671aca35cf7a4e48d8cc7efebb3128c7db8cf9cf91b6f6d9e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0061
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11630
  end_char: 11639
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a305a6cf40a4d21c2500d14ba349606f9c40f58b653bd3521e42444c8bd7175d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0062
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11645
  end_char: 11732
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 675fce247a520866a568922d7be99e3afaf1b8b068a9bb708df0973fcc3dde1e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0063
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332d
char_span:
  start_char: 11738
  end_char: 11744
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9b2dde022441d0c06c57cbce0bf6e3cfc4bf9557fe4798fe969d9926f70c8a44
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0064
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 11757
  end_char: 11803
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: da82bcaa567c5f816ad0a4847371557a6a5dbe776dbbd3b29a09a3d99e1dfccc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0065
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 11809
  end_char: 11819
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0233c13dd269fdc161c16d3ef9416badc17fc74f1e3ba9746cf41bb0c0a7fbeb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0066
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 11825
  end_char: 11922
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: abec29e4b6380069e5c539118604ef08e9abb92c40c7e7a3606c569337f48022
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0067
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 11928
  end_char: 11980
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0124f1284f1b895d8f89b40fad1740d2483dc8a1ae897e862260137f260987aa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0068
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 11986
  end_char: 12045
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: abc9ee5befbd597e41060c1137d47e6fbdcfeefcf60f1738236a07bccd42962c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 12539
    text_sha256: ee679125be1430bbc41e6a1a7aabcf505cccf174e2b2d64d5672ecffbdad860e
  rationale: The source-defined Socrates–Polemarchus exchange remains continuous. The target's in-span ὦ φίλε Πολέμαρχε identifies Polemarchus as addressee, resolving the speaking narrator as Socrates without alternation inference.
review_status: accepted
```

```yaml
voice_id: voice_republic_0069
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12051
  end_char: 12056
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 86c8e1d9b6e515a1705a6cad956a45b2eba211b0780f6cfd01dbe560a59f7876
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0070
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12062
  end_char: 12090
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a7d8069e0998f89444f290378a299841c493fc5d351e3f79263787fe1ec0df0b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0071
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12096
  end_char: 12099
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0072
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12105
  end_char: 12150
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e389a5dc171e6e7d1874719a31736fe797bb1a834a0d33a72f47a417fa8f5db3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0073
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12156
  end_char: 12179
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a68832f005b4219cc4cbd4a545b858acf9ab025683005c36646fb91d403ebcaf
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0074
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 332e
char_span:
  start_char: 12185
  end_char: 12222
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd03ceb6b17f8ecc9eafd4e9331df4e517df18fad8f4b38dd17a246d4949b96e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0075
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12235
  end_char: 12243
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d3fba245e1f6aa5f32cbb61db4f8b475590d685fc6aac8da007c5e25df659fa9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0076
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12249
  end_char: 12270
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0aab29b2da5e640d9ec541c465e4f85971063979f0af5f4b52db5f536130653b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0077
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12276
  end_char: 12279
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0078
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12285
  end_char: 12306
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 09ec9cc19c85076f3eb5ecaf1cd8023ca94365441197cb1ef8abf32107496216
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0079
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12312
  end_char: 12315
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0080
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12321
  end_char: 12344
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eedd89c0f2f61fc184aaa00b77af1acdb181fb09bf14a4e61faf1ef06b69b439
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0081
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12350
  end_char: 12353
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0082
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12359
  end_char: 12399
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 10d4182b9896fcdb9771c60a727d70152921d83938b40d57d152bd18cc15b5db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0083
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12405
  end_char: 12412
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0084
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12418
  end_char: 12504
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e92b8b8d20b5d8cbf7431ae5e46ca0452f5dcfb43a70deed187f5cfc4704756c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0085
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12510
  end_char: 12539
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6659ef79e944e2d50cb4e5e653b7b0fd3d04afde63b19a1092b6b04d30deef5f
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 13165
    text_sha256: 4875fa2d639a213ee4841628e7f70a1f3626c56a38b8b0200d92adda99a01c5a
  rationale: The source-defined Socrates–Polemarchus exchange remains continuous. The target's in-span ὦ Σώκρατες identifies Socrates as addressee, resolving Polemarchus as the other locally bounded owner without carry-forward.
review_status: accepted
```

```yaml
voice_id: voice_republic_0086
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12545
  end_char: 12586
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bc1025d28477c41737e0029369850c1677e38c76a02b4152e347f6777eac7f13
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0087
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333a
char_span:
  start_char: 12592
  end_char: 12608
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 019a706d705b06ec8b34dea79759e269035da1b63146c249f9d5982fc1260678
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0088
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12621
  end_char: 12701
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8167b0235622de0aaa73eeafabee0a06b913f52d4eba89da8eb3e9a6758e6246
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0089
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12707
  end_char: 12720
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e9bba2c2f0510dc998d81b227e4d650eae75dcc7c509bac8806e6ce6ddd2d745
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0090
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12726
  end_char: 12821
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f0136cac1881ab9ee2cc1763988404c64931351463eca385d76bb015dcff47e7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0091
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12827
  end_char: 12834
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 372184f7a738f472d88aafea1631459ca45b540e31242893bc6e2b2ab498810d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0092
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12840
  end_char: 12977
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 08e74e39f4e83b9400cab1fc354390aede1ab2c2f1bcd95cdf4e2d2fd49c66e5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0093
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b
char_span:
  start_char: 12983
  end_char: 13009
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7840f3525b2dfec72e98fe7bf034d27a50ec783d5528ac568b18718d72e66a75
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0094
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333b-333c
char_span:
  start_char: 13015
  end_char: 13165
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 32d9225a000c3bd6e1a9aa352bfd30dbc1fc681835a2845af338c6b74d4a90be
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 13383
    text_sha256: 300cce3551c6406bf6271e605d10f0f210576d4e8ba3298b85da536912268d99
  rationale: The source-defined Socrates–Polemarchus exchange remains continuous. The target's in-span ὦ Πολέμαρχε identifies Polemarchus as addressee, resolving the speaking narrator as Socrates without alternation inference.
review_status: accepted
```

```yaml
voice_id: voice_republic_0095
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13171
  end_char: 13179
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f1d2c97e0b64c76a3e2303c90f0bee5be86e6ca0df3bc6fed87252d424ae2745
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0096
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13185
  end_char: 13234
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 421e2fe176858eee0cc51f28f6454429d230e816eb2f625ad25999cc3173c5d5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0097
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13240
  end_char: 13246
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 72ad486ede917deb426d9dc8cf5de9f9ad7e4123d06fa6148f000f43bea09176
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0098
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13252
  end_char: 13332
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eb4171e5bab59e193a673c16b183715c0c10a623f92d9eba104b73722707e20d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0099
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13338
  end_char: 13383
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e5cf6e3d50bfa56212d86a706eeaba1635b28428b9ebf4699b9cc0ed92a468fe
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 9208
    end_char: 13383
    text_sha256: 300cce3551c6406bf6271e605d10f0f210576d4e8ba3298b85da536912268d99
  rationale: The source-defined Socrates–Polemarchus exchange remains continuous. The target's in-span ὦ Σώκρατες identifies Socrates as addressee, resolving Polemarchus as the other locally bounded owner without carry-forward.
review_status: accepted
```

```yaml
voice_id: voice_republic_0100
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13389
  end_char: 13443
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 86d3b64d95cf4295cdbd278082439acbf986c5441ed2dcfbfa3e5352910730bc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this question has no owner-bearing formula, so its question form cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0101
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c
char_span:
  start_char: 13449
  end_char: 13456
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this bare response has no owner-bearing formula, so its answer position cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0102
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333c-333d
char_span:
  start_char: 13462
  end_char: 13534
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 63e6e943a5134774e3659b6443837c672391804dc8ecb88feae3015aa16b2e26
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this question has no owner-bearing formula, so its question form cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0103
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13540
  end_char: 13550
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 23a1dc403dc983f8d5eba493c8e27f63ca7d00c512c66d66a3411a17cdc139e5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this bare response has no owner-bearing formula, so its answer position cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0104
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13556
  end_char: 13665
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 21e7d2a840a3177e2ab4c12f8bb6cb5a301329e8a320b9e15b3d630e1188de2e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this question has no owner-bearing formula, so its question form cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0105
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13671
  end_char: 13679
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f1d2c97e0b64c76a3e2303c90f0bee5be86e6ca0df3bc6fed87252d424ae2745
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this bare response has no owner-bearing formula, so its answer position cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0106
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13685
  end_char: 13833
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e0fb935f64a29f673e4ef1d9962c25474f1ddbb0487fac13d323832a65b12eeb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this question has no owner-bearing formula, so its question form cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0107
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13839
  end_char: 13845
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ceabf0cdca1908d5253e3a054da1efe8caf1b36edb1fdafff8e44cb1de528ca3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this bare response has no owner-bearing formula, so its answer position cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0108
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13851
  end_char: 13943
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e611963a5a7c545d7c4ef5cb3f6c82018029750fa93f7eb0f0b2cff2d55b1fe7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this question has no owner-bearing formula, so its question form cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0109
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333d
char_span:
  start_char: 13949
  end_char: 13959
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 23a1dc403dc983f8d5eba493c8e27f63ca7d00c512c66d66a3411a17cdc139e5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; this bare response has no owner-bearing formula, so its answer position cannot select one without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0110
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333e
char_span:
  start_char: 13972
  end_char: 14181
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 12794e08f0a803e93abaa7594f7ce9b997821091019a3c460704d3a991f5e496
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΩ.
  - ΠΟΛ.
unresolved_reason: The surrounding 333c exchange is bounded by reciprocal named address (ὦ Πολέμαρχε / ὦ Σώκρατες), making ΣΩ. and ΠΟΛ. the local candidates; the in-span ὦ φίλε remains unnamed, so it cannot select an owner without alternation.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0111
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333e
char_span:
  start_char: 14187
  end_char: 14194
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0112
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333e
char_span:
  start_char: 14200
  end_char: 14280
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eb68dafa50e143ad529e3c6f5c6e5c098c83758a4a1ed5e6fcab94b2a9cd4f10
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0113
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 333e
char_span:
  start_char: 14286
  end_char: 14298
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a204f524aaa844a75a03d318cafc4d9f8a4bbf9783fb34a3dda80ad53a198007
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0114
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14311
  end_char: 14426
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 45de95ed3bd0632b0e4a3f4d4bfd79a1605321b9e23a431026927c568f489c13
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0115
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14432
  end_char: 14439
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0116
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14445
  end_char: 14493
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4d389ee8d8ed9209574f12d0828139a0b747b4465a395fba8e84a2c5956546f0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0117
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14499
  end_char: 14505
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 72ad486ede917deb426d9dc8cf5de9f9ad7e4123d06fa6148f000f43bea09176
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0118
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14511
  end_char: 14574
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8fbca54fa634a0bfebfa9fb326ad148d2bca2d7f53ce16218664d0d9eda68ce9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0119
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a
char_span:
  start_char: 14580
  end_char: 14610
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b18272bbf9e2d3e6b63be31a6ea7405e6be940b64732bcdd1e79b9550dc4ec70
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare report has no independently owner-bearing formula or source-bounded handoff; the earlier vocative only marks an addressee.
```

```yaml
voice_id: voice_republic_0120
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334a-334b
char_span:
  start_char: 14616
  end_char: 15035
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 238405708f51d920fbb1b4de38a8fb5eaa1ea059ca5db666bff041ac8cf4c653
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0121
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334b
char_span:
  start_char: 15041
  end_char: 15189
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a85075c8122de656f67a057ac7b4117eed9dd5d8ce59d2b4e9bb3e9f9f264b4d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: No local named, person-marked, closing, or bounded reviewed route identifies the omitted subject without carry-forward.
```

```yaml
voice_id: voice_republic_0122
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15202
  end_char: 15319
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b2cd9512fc75519d4ae6bf72184749ccb770c1b27304c443db7677e099dcec1f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0123
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15325
  end_char: 15401
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5dd4ef982a09a172ca65212b266d41b965a959837adba5b0476e879819b70378
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The rendered material supplies only a bare third-person report and a distant addressee cue, not a source-bounded owner determination.
```

```yaml
voice_id: voice_republic_0124
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15407
  end_char: 15533
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 094b0a3cb3c1808da5b9aabdd4e4ece3987f2896a7f9d5699fb1a1c71c4b79e3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0125
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15539
  end_char: 15551
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5aa3da6929244a0ef3ac56af11917df65a0087ce2be832049bad9a382482c4f7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0126
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15557
  end_char: 15608
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ef52d9e587497ce7ce60c1219c7a9304e160ef4ee45aaf46ba3a262ebdbadf31
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0127
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c
char_span:
  start_char: 15614
  end_char: 15621
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0128
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334c-334d
char_span:
  start_char: 15627
  end_char: 15716
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e70416a333960c4bd492873b39aa41165ff8fadda9777b6c4a1da77bd38852f5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0129
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15722
  end_char: 15730
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f1d2c97e0b64c76a3e2303c90f0bee5be86e6ca0df3bc6fed87252d424ae2745
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0130
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15736
  end_char: 15788
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b15f2f7003508a2adcc16e2777d5c31d7ed235506cc8399f7509ddfaacf8fd57
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0131
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15794
  end_char: 15799
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 86c8e1d9b6e515a1705a6cad956a45b2eba211b0780f6cfd01dbe560a59f7876
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0132
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15805
  end_char: 15869
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bbf866726cf57b64285a5dc637d86d4504476d001f6695ad5c2a9595081c062a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0133
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15875
  end_char: 15933
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3d7732c560fb9c3d3604dfc2029677ea6983cc6402575cd63e3f0dec4ad80f5b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target's vocative establishes only its addressee, while the bare report provides no independent owner or bounded discourse determination.
```

```yaml
voice_id: voice_republic_0134
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 15939
  end_char: 16010
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 786feff0eca98c26288b585ee238939457d89b367b44fe74aa8fc7c2d621143d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 15957
    end_char: 15966
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0135
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d
char_span:
  start_char: 16016
  end_char: 16046
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 69e29cc4c0df5ace3f575d16c34df7fff36313604199fabe1375f1783c99b486
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0136
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334d-334e
char_span:
  start_char: 16052
  end_char: 16299
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f83b2886969dc4836c8ae0c21245ef65cf28919a4822d31cb7dfa03a5397266f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0137
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334e
char_span:
  start_char: 16305
  end_char: 16407
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0ecb54072680c271369672cd540bec3139f8b1946cdd5163f9e883dc989e2174
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The cited vocative does not make the later bare report owner-bearing, and the local source does not otherwise resolve its subject.
```

```yaml
voice_id: voice_republic_0138
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334e
char_span:
  start_char: 16413
  end_char: 16437
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 66d8af0c3176111c7d614e80d7eb380a212aac669f0a9cefc3639c80cc157e75
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0139
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334e
char_span:
  start_char: 16443
  end_char: 16483
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b862d46759ca349b019661884c0b76b457df8242658ab1b7534a7fd99bb924d5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0140
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334e
char_span:
  start_char: 16489
  end_char: 16522
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 43691fd0e99ff132b82c50a17b0b9b0d6c9f1c947f21d9b401796b8156044a71
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 16501
    end_char: 16510
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0141
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 334e-335a
char_span:
  start_char: 16528
  end_char: 16685
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 93628ac79899aef3e256a60dd8c204f4afc72217427b7d5533358d95cad51d9d
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 16412
    end_char: 16685
    text_sha256: 24851648e21fa13c6f6fef0d20ff9fd049537d5712e14e000be77b38a3c85148
  rationale: The named Polemarchus addressee, Socrates' intervening first-person question, and the immediately following pronoun-led answer form a bounded two-person handoff.
```

```yaml
voice_id: voice_republic_0142
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335a
char_span:
  start_char: 16691
  end_char: 16764
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: da9f9a0ec2977af8fded13b78fdc9d0eef66e4c32ba93fcb8838a16cc8c2efb6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0143
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335a
char_span:
  start_char: 16770
  end_char: 16773
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0144
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335a
char_span:
  start_char: 16779
  end_char: 17026
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 560b8603b2faf6937bd5dc09ce4f4cfce4612474f8c1b3c27f5c12225b1c67f5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0145
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17039
  end_char: 17091
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 69214d3565913d181d1e32e2b0617184980c10f805a0de678659caf41a2e288b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare report lacks an independently owner-bearing cue; its earlier vocative does not license a later subject by alternation.
```

```yaml
voice_id: voice_republic_0146
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17097
  end_char: 17164
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2d2a3ea57e9e0821822e3eee8480ca795514e246fd73414e1a0c6ee042f1fb48
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 17108
    end_char: 17117
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0147
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17170
  end_char: 17232
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f47639143858840afee219e53bf41982c6513e3b110eca4df63fee9db2834ca3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare response has no direct owner cue, and the preceding first-person report cannot be used to infer the other speaker by alternation.
```

```yaml
voice_id: voice_republic_0148
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17238
  end_char: 17287
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ef9a757af173de7af7e461059abba4515f6c5d1bd2c301dea68dd7bc622f6ae5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0149
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17293
  end_char: 17300
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3caaf1ef3182eb249523abffe5327bdc4ccce9e9c0e87370ee6a2e3a172ce02d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0150
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17306
  end_char: 17355
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 96f84d0513a71499a4be904f4d6c6a1726b8ca5a23c0699f80b0d5cb80bbce79
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0151
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17361
  end_char: 17378
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6e0097024e030b912450f117b410ea7bdcdfa4938f938eb8444d0294ca732e2e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0152
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17384
  end_char: 17483
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ca7861deb671362fe9428c0a15fcac4930591c4bcd91fd7a1f01d1053472fdfd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0153
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335b
char_span:
  start_char: 17489
  end_char: 17495
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ceabf0cdca1908d5253e3a054da1efe8caf1b36edb1fdafff8e44cb1de528ca3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0154
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17508
  end_char: 17604
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 49ddecffe7c47bff8466b15a5d9ba89214cff7d68cd4736cfb624337ca0127aa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: in-span vocative ὦ ἑταῖρε is unnamed; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0490
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17609
  end_char: 17622
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bounded assent has no local owner-bearing formula; its owner is not inferred from the adjacent question or turn alternation.
limits: This closes the source gap between the two neighboring direct-speech records without assigning a terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_republic_0155
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17627
  end_char: 17664
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8e3757c8564c4ab1b37e1d386fa006be7228f0f3eb0c82f30ced2075db06aef8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0156
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17670
  end_char: 17686
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 37c74fcda9b491ef92dbf8a5cf1a0e87f7941145832aa5a1289954f2aac64843
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0157
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17692
  end_char: 17768
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4ef963b55dd348b4a379c5f4cc7a2c80c28a63aa9d09d3dd875466ede74c21c8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: in-span vocative ὦ φίλε is unnamed; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0158
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17774
  end_char: 17780
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 72ad486ede917deb426d9dc8cf5de9f9ad7e4123d06fa6148f000f43bea09176
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0159
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17786
  end_char: 17841
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c1664991468167945cfadbaa39735390f171647fd99cf383b6acd95aebf737ad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0160
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17847
  end_char: 17855
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 28a28ace538b79b79942224ae9cf27a7578d9d44ca845def77c94bd9d830c7f1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0161
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17861
  end_char: 17895
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1b108b03291d83928986dac77c7b27e5a480d787a209cc8f6ca8e89c8035d77c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0162
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c
char_span:
  start_char: 17901
  end_char: 17910
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cebad71fd6e1dae418c3c74be90998e4ee3589e9455c9c39c409d4a4a8d7814
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0163
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335c-335d
char_span:
  start_char: 17916
  end_char: 18003
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7da947c1bb11a680fc458520be6ce105c1e9217d272e286cc29a9f65a69150f3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0164
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18009
  end_char: 18022
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9e21389b59ef01d7b03c8bea33da2c58f50a5130e1eea1bccb1715577cf82bae
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0165
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18028
  end_char: 18082
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3ab124f90db2d280d6bd8769dc985e25158a480a2d5adec65456a0ad062b3f3a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0166
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18088
  end_char: 18091
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cec44b2f9466d44eb501f49f8563d3161257faba0bf7a1acf8310d2c2b55579
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0167
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18097
  end_char: 18139
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b7a56fb54e92c5a238e27d236b91f823dc2efd33172032955849f200fc13d2fb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0168
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18145
  end_char: 18152
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0169
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18158
  end_char: 18203
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 934ae3b38fad7c78f2800c8a54b7aec458e2fcbf9a31a7389aa6ec156a5288ed
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0170
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18209
  end_char: 18217
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f1d2c97e0b64c76a3e2303c90f0bee5be86e6ca0df3bc6fed87252d424ae2745
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0171
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18223
  end_char: 18245
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fd7531353f03ae3a0614be3eacab591230d08c736aeb9010f65853d2a7ada94b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0172
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18251
  end_char: 18258
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΠΟΛ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0173
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18264
  end_char: 18372
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1b676cf30967c7491d38b54eea8fa0caf7da413cb1a4f4f045dd090816568bd0
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0174
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335d
char_span:
  start_char: 18378
  end_char: 18428
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c927e73e82e735327a96730e4659b54fbcc8d373adb054d6d9889901a39e8626
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΠΟΛ.
  context_span:
    start_char: 18263
    end_char: 18428
    text_sha256: b7e7eea406fff255d695ac103707ca9a30b6ac6f6222f4d13e69d1450fe7bd9a
  rationale: The preceding direct address to Polemarchus and the immediate reply's direct address to Socrates create a bounded reciprocal handoff with no other interlocutor switch.
```

```yaml
voice_id: voice_republic_0175
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335e
char_span:
  start_char: 18441
  end_char: 18709
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5ed8c9fec0255aa1122408914141df3615f4e7a28a329953c4c4a4fcea99c10c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0176
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335e
char_span:
  start_char: 18715
  end_char: 18731
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 97976f4d415cc45d368968fa34e440cc527b25477f850bd3f774932e1e7f66ba
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The cited earlier vocative does not independently bind the later pronominal report after the intervening speech, and no bounded owner determination is present.
```

```yaml
voice_id: voice_republic_0177
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335e
char_span:
  start_char: 18737
  end_char: 18887
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9046f87e910b727ce94ff92853e4b8df2de4129632e60fb7961a0484fcac25ba
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 18752
    end_char: 18761
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0178
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 335e
char_span:
  start_char: 18893
  end_char: 18940
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d42fe53701b09449b932ce182d582d24410d2567e57243043b93bb491702fe28
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: First-person content is not a reporting-formula cue, and the bare report has no independently owner-bearing source evidence.
```

```yaml
voice_id: voice_republic_0179
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336a
char_span:
  start_char: 18953
  end_char: 19076
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 954d0a13da55bcb9accd431c2921881b6b1eee56e19edbea986a65486db54b16
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 18965
    end_char: 18974
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0180
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336a
char_span:
  start_char: 19082
  end_char: 19092
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f0cc4ba8cadc9c292de01ea018255c8b3e762e83d4268b056dec7eae6aa46605
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The short bare report has no locally owner-bearing evidence; its cited vocative cannot determine ownership through turn sequence.
```

```yaml
voice_id: voice_republic_0181
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336a
char_span:
  start_char: 19098
  end_char: 19222
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 45ed5eb62e32561dc2f9f2879d7138ad8c83af3663953e26af32f39f1d6371da
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0182
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336a
char_span:
  start_char: 19228
  end_char: 19251
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 26a18e4510ee745e0761dd51f9fb5b4380f171fa2a54d91a01a2cecb72ad4c40
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare report and addressee-oriented second person do not independently resolve the omitted speaker, and the cited remote vocative does not do so either.
```

```yaml
voice_id: voice_republic_0183
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336a
char_span:
  start_char: 19257
  end_char: 19364
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a01314f639c2dd5431741fd20d8d53abecbbb8fe325430bf913ca2dfb7517754
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 19263
    end_char: 19272
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0184
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336b-336d
char_span:
  start_char: 19755
  end_char: 20330
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a33884678899042b66f9a11aee4b5bb1ac789447dded782dd876ebd8fb4eb582
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ὁ δ’ εἰς τὸ μέσον φθεγξάμενος
    start_char: 19724
    end_char: 19753
    antecedent_text: ὁ Θρασύμαχος
    antecedent_start_char: 19381
    antecedent_end_char: 19393
limits: The pronoun resumes the named Thrasymachus in the continuous narrative construction; it does not inherit a prior reporting-formula speaker.
review_status: accepted
```

```yaml
voice_id: voice_republic_0185
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 336e-337a
char_span:
  start_char: 20596
  end_char: 21172
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1446c45745706b8d3479d64548dabca2083377f87b04a994d5af2bc5d9e1f808
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: καὶ εἶπον ὑποτρέμων
    start_char: 20596
    end_char: 20615
limits: The source-bound inner Socratic turn begins with its own first-person reporting formula and continues through the reply to Thrasymachus.
review_status: accepted
```

```yaml
voice_id: voice_republic_0186
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337a
char_span:
  start_char: 21233
  end_char: 21448
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c35e334ae3e072448294caf97e2e0d0714080f91ad72aa69292e0c3867512c4a
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ ὃς ἀκούσας ἀνεκάγχασέ τε μάλα σαρδάνιον καὶ εἶπεν
    start_char: 21178
    end_char: 21231
    antecedent_text: ὁ Θρασύμαχος
    antecedent_start_char: 19381
    antecedent_end_char: 19393
limits: The pronoun continues the source's named-Thrasymachus narrative chain through Socrates' direct reply; this is not an ownership inference from turn order.
review_status: accepted
```

```yaml
voice_id: voice_republic_0187
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337a-337c
char_span:
  start_char: 21454
  end_char: 22044
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f2a49ff1584d6dd3adf02af1d591ea90a991c24cc7d0755c7f6b29a83560ea4e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 21468
    end_char: 21477
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0188
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337b
char_span:
  start_char: 21584
  end_char: 21757
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1f5d92d104789869c238c4a83a4ee2dd0bb22a778f2b5272d348e6647f39fa2b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: hypothetical questioner staged by Socrates about the twelve; owner excludes the stager
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0189
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337b-337c
char_span:
  start_char: 21843
  end_char: 22016
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3789d62cd19715f62a0a37ab2db4562fde607b670d94c3c12cb5d9106d89707b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 3
resolution: unresolved
unresolved_reason: staged answer refusals put by Socrates into an indefinite respondent’s mouth
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0190
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337c
char_span:
  start_char: 22050
  end_char: 22086
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c9f1cb66b12ddea88d0fad39aaca4abb09517f08b30b431e9c596ae9577d5fa6
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 21453
    end_char: 22086
    text_sha256: c6ac46796c6024d0cd0ce83809dd89adccf726b33c78ef3c39690ad17f25c029
  rationale: Socrates' marked first-person address to Thrasymachus ends in a direct second-person question; the immediately following report is its bounded answer.
```

```yaml
voice_id: voice_republic_0191
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337c
char_span:
  start_char: 22092
  end_char: 22275
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7da356dedc30820e659df258f470ffdce5a52a22a0b424791e1154e173c99746
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 22109
    end_char: 22118
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0192
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337c
char_span:
  start_char: 22281
  end_char: 22355
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8ac80b88119a149bdaca368d28e4fa5809c5216ba13baadf3232afe4815a44b1
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 21453
    end_char: 22355
    text_sha256: 73380751cb9d928001f6380fffc2e32cbc2fe661a8bf22c90ee57d7a315ebec8
  rationale: The target remains within the locally named Socrates–Thrasymachus exchange and its second-person response addresses the immediately marked Socratic turn; no third interlocutor is introduced.
```

```yaml
voice_id: voice_republic_0193
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337c
char_span:
  start_char: 22361
  end_char: 22420
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 74f8e273649f6bfbc6eff20eb0f1af2cd84ff16b2b06086e03c80ccd6392c94f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 22380
    end_char: 22389
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0194
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337d
char_span:
  start_char: 22433
  end_char: 22543
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2aa88788a0ea3f07857142bea762f7b5d39685c5018bac9147a9914dbc88c20d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target's bare third-person formula has no local owner-bearing antecedent; the earlier vocative cannot supply a terminal owner across the intervening turn.
```

```yaml
voice_id: voice_republic_0195
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337d
char_span:
  start_char: 22549
  end_char: 22677
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b4b7c5a672fb7e145aaa018bcf4d065af6318b6f2272a7f2b8be841c93f9fd18
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 22558
    end_char: 22567
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0196
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337d
char_span:
  start_char: 22683
  end_char: 22743
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bfc67ab2fc0431c33cb6c0b5f6fd41edca9504edf160ffbc24030a131fbfbd57
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: No local source antecedent identifies the subject of this bare third-person formula; the earlier vocative cannot supply repeated terminal ownership.
```

```yaml
voice_id: voice_republic_0197
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337d
char_span:
  start_char: 22749
  end_char: 22782
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5e3093b331162bb055a69fd9ab73407007680d626b4b57f8ec9065c11ca8e0c6
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον
    start_char: 22777
    end_char: 22782
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0198
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337d
char_span:
  start_char: 22788
  end_char: 22891
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6417b83db1eaecbd7748ef6c2e18e7de2d131d4fdebc2f266bee88e75ddead76
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Γλαύκων
    start_char: 22800
    end_char: 22813
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0199
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337e
char_span:
  start_char: 22904
  end_char: 23037
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fb4591940eda1eb51d5dc4823890a99e8d458f8eacbb0de131efc9697965a9f8
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΓΛΑΥ.
    - ΘΡΑΣ.
  context_span:
    start_char: 22784
    end_char: 23037
    text_sha256: 0c1c574876a0097a363f7eabf97e0ee3a8fc7cbc1047b9747b9ddd0ef613a127
  rationale: Glaucon's named direct turn explicitly addresses Θρασύμαχε and commands him to speak. The target immediately supplies that bounded response, selecting ΘΡΑΣ. without alternating speakers or reusing a predecessor tag.
```

```yaml
voice_id: voice_republic_0200
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 337e-338a
char_span:
  start_char: 23043
  end_char: 23434
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d047671d4abaa8f2ba39f7c60488b003ade3dc203b65672811a0695084284d12
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 23055
    end_char: 23063
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0201
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338b
char_span:
  start_char: 23728
  end_char: 23863
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4932e8efde5f03af218f8490e532c58dfd3c0f1ef7db508cbb7461356eb632d3
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ἔφη
    start_char: 23737
    end_char: 23740
    antecedent_text: καὶ ὁ Θρασύμαχος
    antecedent_start_char: 23520
    antecedent_end_char: 23536
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0202
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338b
char_span:
  start_char: 23869
  end_char: 24169
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 13a41b20d2df9dfabed65f2f68cef8dfe74cae00abcfa3dedb496c421483cfdc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 23878
    end_char: 23887
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0203
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338c
char_span:
  start_char: 24182
  end_char: 24313
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 57f4da91cbd181418300faac45f5fb7fe6c12d086f9dc667d8ce4f3569bc131e
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 23865
    end_char: 24313
    text_sha256: ccac6bea7dc86b9ada9d8515c1eb941efdda91ca212d12e448e255c93feab37e
  rationale: A first-person Socratic turn directly addresses Θρασύμαχε and says he will answer. The target immediately takes that bounded response turn, selecting ΘΡΑΣ. without carry-forward or alternation.
```

```yaml
voice_id: voice_republic_0204
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338c-338d
char_span:
  start_char: 24319
  end_char: 24664
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b6130cd098aa50c1146f0fbaade472ccd70b274bce31cbc43baddcf6ff847537
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 24339
    end_char: 24343
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0205
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 24670
  end_char: 24762
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4494441c1ad7214a727eb86816b48cc9c854449c32c72f753d305a81ca3444a3
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 24315
    end_char: 24762
    text_sha256: 0c9593d54cbbb533716ed3e29910ecf965ff1e41fed3443b6627ba57db945fdd
  rationale: A first-person Socratic turn directly addresses Θρασύμαχε; the target's reciprocal vocative is ὦ Σώκρατες. The bounded address-and-response handoff selects ΘΡΑΣ. without an alternation rule.
```

```yaml
voice_id: voice_republic_0206
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 24768
  end_char: 24828
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4842ea69232ea907ba2c0c97866d539420ee4f33222cbdf6ed80edd855c8e5a1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 24787
    end_char: 24796
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0207
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 24834
  end_char: 24935
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d3896036368ec2272986c847a22004aa3f708bb0b6876205bfcf823abb7b7338
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The bare third-person formula has no fresh local owner-bearing antecedent; the older vocative would only carry predecessor identity over intervening turns.
```

```yaml
voice_id: voice_republic_0208
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 24941
  end_char: 24951
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c936421fc35c9b76ba8fab180ff8d3e3f6b926cb47afa46463a9d7d03735e8cd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0209
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 24957
  end_char: 25002
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0aaee364508463a692b763bd09b3a8cf1d81ef7c585fb0c2fedcf1f74d6c6171
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0210
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338d
char_span:
  start_char: 25008
  end_char: 25015
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7e227e28404416e57da1d021530ba365e3c6f06144be478ff00fdd09722a2646
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0211
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 338e-339a
char_span:
  start_char: 25028
  end_char: 25551
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3c06e246ec15f431d1fcd5e5de32d4c198d1dc3901b9c9ea27d52791d81f70b3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: in-span vocative ὦ βέλτιστε is unnamed; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0212
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339a
char_span:
  start_char: 25557
  end_char: 25798
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 181f1bafa961de1b80a4f14dc05dcb5fefa24e371e56f677baf4788803c064b3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 25562
    end_char: 25571
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0213
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339b
char_span:
  start_char: 25810
  end_char: 25839
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dd6fd87a72822c32444f1c411b3b5139e862025d322993631fe80d6c094fef45
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 25553
    end_char: 25839
    text_sha256: 0b0de1b6ba4d985e7ca402898e893d42ac7db150a58380c8aa06d1d025981b47
  rationale: The first-person Socratic turn directly addresses Θρασύμαχε and marks him with second person before the immediately following bare formula. This local handoff selects ΘΡΑΣ. without importing a preceding speaker tag.
```

```yaml
voice_id: voice_republic_0214
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339b
char_span:
  start_char: 25845
  end_char: 26064
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 70470826d32a4e383b323ceb88d38c8a62e6c2f415e786aa2cef1a88d1325f5f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0215
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339b
char_span:
  start_char: 26070
  end_char: 26081
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 32016f770a7a0fb9f9a3b1c81deba2ab70e2265a59234aa64cd24a73333a9571
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: No fresh local antecedent names the subject of the bare third-person formula; resolving it would carry forward a prior owner's identity.
```

```yaml
voice_id: voice_republic_0216
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339b
char_span:
  start_char: 26087
  end_char: 26180
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 181287afb1245be7086376ba8037281a6abe1ec9224eec524beea54be24d5669
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 26100
    end_char: 26109
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0217
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339b
char_span:
  start_char: 26186
  end_char: 26191
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dd1eea9e04649aa4a270eac3e970482e7cc4d0a74e6310317a106e7778469c8a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0218
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26204
  end_char: 26292
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: af2f3b063dd2f9becb27df840d3aebe08e46fc5793fafa78ec30d8811ff29473
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0219
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26298
  end_char: 26335
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1bd4bd9d9d6915a4ca8e7e84074d26ab4344c738d08cee17493a47b37c169404
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The formula supplies no local terminal owner, and the earlier vocative cannot be used as carry-forward evidence across intervening turns.
```

```yaml
voice_id: voice_republic_0220
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26341
  end_char: 26425
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e8d04b7a11bcfebc41e5dc6e7ac2ef4c7ffc17a91043e8e91bca693483743680
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0221
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26431
  end_char: 26442
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 28ca353f365fc906ffa0d66f478e429f72a9fc9bf13e5858ca60355a42a375b9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0222
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26448
  end_char: 26541
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d1dc3412077721b5d0a34ce0bf09d38a81bae4986750b6afd82230a1625090b4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0223
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26547
  end_char: 26552
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 32def55cee8546c65e9071662518b078be13b6de3b34e3ec2484ef49fcc5d15d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0224
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26558
  end_char: 26624
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c85b4214e185805ca8cba9894bbc552052b797de4e58a3de321ff7b113a757bc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0225
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339c
char_span:
  start_char: 26630
  end_char: 26640
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c936421fc35c9b76ba8fab180ff8d3e3f6b926cb47afa46463a9d7d03735e8cd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: bare responsion; alternation implies ΘΡΑΣ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0226
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339d
char_span:
  start_char: 26653
  end_char: 26768
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a2338f7d2324b330f79eedac50cc75d74b976674a6c9c5c05229c3031940c46
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0227
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339d
char_span:
  start_char: 26774
  end_char: 26791
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5de4d4856791774fa3e8865f887cd3c48acdda21f9c61376c513fe8e89504616
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: No local owner-bearing antecedent identifies the subject of the bare formula; the old vocative would only impose predecessor carry-forward.
```

```yaml
voice_id: voice_republic_0228
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339d
char_span:
  start_char: 26797
  end_char: 27049
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f923b5ea942896d8b281f0543caf9f3dd59fabac54d4e665777967d2f9e5f046
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: no cue; alternation implies ΣΩ.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0229
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339d
char_span:
  start_char: 27055
  end_char: 27071
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 60d78f086917fb89cb74f4e60e795974d895e2509e0a181e3e63a158836f5804
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target lacks a local source antecedent for its bare third-person formula; the first-person utterance content and old vocative do not identify its reporter.
```

```yaml
voice_id: voice_republic_0230
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 339e
char_span:
  start_char: 27084
  end_char: 27496
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 85a3564d162fbb8667ae93ccd40b77ae932425ab2110c81d483d59b03c33f577
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 27097
    end_char: 27106
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0231
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340a
char_span:
  start_char: 27509
  end_char: 27564
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7f7d77f71d72926ebe472810371f95779b9baa6ad72756918e1957cdbd259499
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Πολέμαρχος
    start_char: 27538
    end_char: 27550
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0232
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340a
char_span:
  start_char: 27570
  end_char: 27623
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fa3061e0b5038fb3bc35082f01a91c2a3d7aa38b1302ac3b3a35afc71c7a6ec9
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ Κλειτοφῶν ὑπολαβών
    start_char: 27603
    end_char: 27623
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0233
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340a
char_span:
  start_char: 27629
  end_char: 27774
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f4a0f060e55228bd807f1c616b62c5e4daba97b8635d64b6b812085e6eea59d7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The only cited antecedent is the preceding reporting formula's speaker tag, which cannot license ownership of this distinct bare third-person formula.
```

```yaml
voice_id: voice_republic_0234
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340a
char_span:
  start_char: 27780
  end_char: 27869
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1f45a37137faaf17a7c6bb2147c40683ac21e644abfa873537b6255ab5a1d3e2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0235
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340a-340b
char_span:
  start_char: 27875
  end_char: 28178
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a0738b53661258d272a9859333f03f9d245c60adc0decf7c2515c91059aa674e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0236
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340b
char_span:
  start_char: 28184
  end_char: 28337
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: db5d63344593f676e908bd587b5f1f5b526a862aa8ec1e293681974031e96fbb
voice_chain:
  - ΣΩ.
  - ΚΛΕΙΤ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Κλειτοφῶν
    start_char: 28190
    end_char: 28205
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0237
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340b
char_span:
  start_char: 28343
  end_char: 28388
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a97d15943c987a3490acee35de93cb89e57b72969a67f2fb5f9258e565797319
voice_chain:
  - ΣΩ.
  - ΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ Πολέμαρχος
    start_char: 28359
    end_char: 28379
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0238
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340c
char_span:
  start_char: 28401
  end_char: 28665
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4ee2768ac11a4615978035c89f23af85991270983c23817e6c535c8d17cc4930
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 28408
    end_char: 28417
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0239
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340c
char_span:
  start_char: 28671
  end_char: 28748
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ec2171ba5f294373f0cd6eb27f0c63e0d51ea9ef2a859fe54f0b293b8759c5b5
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 28397
    end_char: 28748
    text_sha256: af11db1418ad21dfc9e6bb2167b9a600de9bc43528fbab9c952ded1ced92ade6
  rationale: A first-person Socratic turn directly addresses Θρασύμαχε in second person and asks the immediately preceding question. The target is the bounded direct response, selecting ΘΡΑΣ. without appeal to alternating speakers.
```

```yaml
voice_id: voice_republic_0240
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340c
char_span:
  start_char: 28754
  end_char: 28864
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d0729c57eb231e92c02e7efe4a3e13333103751b1bbf497161f310d0df8c6ab1
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον
    start_char: 28761
    end_char: 28766
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0241
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 340d-341a
char_span:
  start_char: 28877
  end_char: 29916
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 19611caafc2a31b5a0104999a92ff3e1dee827c9e8d1b83af47ac679810c437f
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 28397
    end_char: 29916
    text_sha256: bb95b8ac31379bc585b2b5556b9ec0c2a31efb578035095f2c2ebe42bedb3584
  rationale: The context begins with Socrates directly questioning Θρασύμαχε, then has a person-marked Socratic reply. The target directly addresses Σώκρατες within that closed two-party exchange, selecting ΘΡΑΣ. without alternation or a predecessor tag.
```

```yaml
voice_id: voice_republic_0242
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341a
char_span:
  start_char: 29922
  end_char: 29973
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 78aae692af8fdfb98531665c54098e41d3af26629a104367fc03d09641e015f7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 29928
    end_char: 29937
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0243
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341a
char_span:
  start_char: 29978
  end_char: 29996
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 29918
    end_char: 29996
    text_sha256: 18441b8d5a2b81513331e6e1f15378de46c73d3e312fb1505a25de57eaeaec6f
  rationale: The preceding first-person turn directly addresses Θρασύμαχε and asks a second-person question. The target immediately answers that bounded prompt, selecting ΘΡΑΣ. without speaker alternation.
```

```yaml
voice_id: voice_republic_0244
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341a
char_span:
  start_char: 30001
  end_char: 30075
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1f0a5537dd677624590f1e6253117a15291412287949310337ef1d9a3f8cd390
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0245
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341a-341b
char_span:
  start_char: 30080
  end_char: 30211
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1b7115341ce08c24c9ebf8c51b28a37efb8343694cad2b870b72757156707e78
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The bare ἔφη at 30097-30100 identifies an unnamed third party only. The preceding question is itself unresolved, and the earlier Θρασύμαχος address cannot be carried forward to supply a terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_republic_0246
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341b
char_span:
  start_char: 30216
  end_char: 30483
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a8f2e964ad2174b019e95712d59044e46b9f3714917d5803d4404e9327c8d733
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 30242
    end_char: 30251
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0247
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341b
char_span:
  start_char: 30488
  end_char: 30628
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c853e2755bbb916f86b495d7702ffabc7e2a83bb5fd32f69661a636bac7f4388
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The first-person formula before this span identifies Socrates, but the bare ἔφη at 30508-30511 identifies only an unnamed respondent. No in-context named handoff licenses ΘΡΑΣ. as the terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_republic_0248
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 30640
  end_char: 30733
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1812e19f64f444df94d7fd4e9ee8554320148d6f05f320f2f5d3fe6e917b6ff3
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: εἶπον
    start_char: 30656
    end_char: 30661
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0249
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 30738
  end_char: 30785
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b3f1d5b950a07bdfffbb5a1de0e2ed6ecc17363700334a40cd7f4edea88996aa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The third-person ἔφη has no source-bound antecedent here. Θρασύμαχον is the object of συκοφαντεῖν, not a subject or active vocative; the retort's second person cannot select an owner without alternation.
```

```yaml
voice_id: voice_republic_0250
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 30790
  end_char: 30965
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9e3ab23cdb5a467bc732ad11a262ea674dc2a6ee3bf5d1f08f407b7c129cd179
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 30796
    end_char: 30805
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0251
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 30970
  end_char: 31001
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fa818b994ae763406d390ba807fffa79ede42a99d50fbcf3ccecc53e037da5e2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The first-person question identifies ΣΩ. but does not name or otherwise identify its respondent. The bare ἔφη answer cannot be assigned to ΘΡΑΣ. by the preceding exchange sequence.
```

```yaml
voice_id: voice_republic_0252
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 31006
  end_char: 31071
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5ad32df7f2352a6e3b7fa82b416d9497a33d6a8c22d88a4339eb4613c781b04f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0253
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341c
char_span:
  start_char: 31076
  end_char: 31089
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 85bc2704ae8b72018ecd1f39ff7548c941e4eb8f4b612c188b7301a41365a6e7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0254
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31101
  end_char: 31268
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 849794ebf913d8e7ae7ebebf383fce8517066dee0e2e1ff7db3094e25ce8c65f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0255
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31273
  end_char: 31284
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f3a0af9cb3e05722add04bd354ff5db5ca9d94f9f7de7929fb894162562b87cc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: This envelope has unmarked intervening utterances and a bare third-person ἔφη, but no named or person-marked source ground that selects ΘΡΑΣ. as owner. Assigning it would be carry-forward or alternation.
```

```yaml
voice_id: voice_republic_0256
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31289
  end_char: 31328
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1b516a62233a12d8a9607e98d1e9d179fb0e7ea5b0620409956e59a9e887eadd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0257
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31333
  end_char: 31341
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0258
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31346
  end_char: 31443
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ea554a32f8854931ef34d756dbb97d3b5118ecc274f928282657565149e356bb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 31362
    end_char: 31371
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0259
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31448
  end_char: 31463
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3ae778800ab2e6da6836ba99839e1065a9dcd8fdc2e22e93a61ef136f3b47407
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The question is first-person ΣΩ., but its addressee is unnamed in this narrow source context. Bare ἔφη marks no owner, so ΘΡΑΣ. would rest on turn-taking rather than a source-bound handoff.
```

```yaml
voice_id: voice_republic_0260
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341d
char_span:
  start_char: 31468
  end_char: 31548
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8487ae9341b4b6463ccc51ede429a4ee9d6b5f4c106f410e2a228d6c3e318d4e
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0261
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341e
char_span:
  start_char: 31560
  end_char: 31577
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6b91eb1cb8c1b2bb98158749c8287553da25397ef0b9740632d138d8382d30e3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0262
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341e
char_span:
  start_char: 31582
  end_char: 31949
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7df86bb3d673a63b613a0d481a2faed477ff9f3c830c2ae99a86a29c19f94f6d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 31589
    end_char: 31597
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0263
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 341e
char_span:
  start_char: 31954
  end_char: 31965
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d75b9069fb5913467fcaccc47b65980110fefab6b21f4062fb35dd4ccbfa4b4d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: ΣΩ. is first-person and addresses an unnamed σοι, but the source envelope does not identify that addressee as ΘΡΑΣ. The following bare ἔφη therefore cannot resolve ownership without carry-forward.
```

```yaml
voice_id: voice_republic_0264
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342a-342b
char_span:
  start_char: 31977
  end_char: 32775
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 75fdb88fd62b51fed8de0c4e5f9f66af8223c290af970a60bee0508c426d0613
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0265
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342b
char_span:
  start_char: 32780
  end_char: 32801
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 224e5a543f804ad1923f4cf429bec2857eea946cc7d8d8ddcbf780f4a50561cb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The long unmarked question and ἔφη response contain no source-bound naming or person-marked handoff to ΘΡΑΣ. The singular σκόπει does not itself identify its addressee, so the owner remains unresolved.
```

```yaml
voice_id: voice_republic_0266
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c
char_span:
  start_char: 32813
  end_char: 32880
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eeec8cc08fd72d9cc3c585b3c629d7a068045bdb7a7724c63a75b099d430444a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 32822
    end_char: 32831
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0267
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c
char_span:
  start_char: 32885
  end_char: 32894
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cb9bb978d85cc44c1a937db78132a5c1fdef42eee384c00e446ff7b8110f0d04
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The first-person ΣΩ. assertion supplies no named addressee or owner-bearing handoff for the bare ναί, ἔφη. Selecting ΘΡΑΣ. would amount to alternation.
```

```yaml
voice_id: voice_republic_0268
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c
char_span:
  start_char: 32899
  end_char: 33012
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f29808b3730f21d76b32d4c24205b8795b4606415de4b67aa57902aa6131edad
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0269
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c
char_span:
  start_char: 33017
  end_char: 33038
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 568fba0897fcc193c034f443cff8066aa056c336078ac7cce3bd2a29fac56ef4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The source has an unmarked proposition followed by φαίνεται, ἔφη, with no licensed antecedent or local owner-bearing cue. The existing ΘΡΑΣ. attribution cannot survive by sequence alone.
```

```yaml
voice_id: voice_republic_0270
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c
char_span:
  start_char: 33043
  end_char: 33128
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a84ce87a3b9e473efbdfffa27142b8ab6a974e01377818d6a46b5190b0fced1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The proposal supplies only a vocative identifying an addressee, not a reporting construction that licenses the terminal speaker.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0271
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342c-342d
char_span:
  start_char: 33173
  end_char: 33306
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1371bd100949b2a458309359b6c43a956fe121bf6500f7c9a527b41233d87255
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0272
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342d
char_span:
  start_char: 33403
  end_char: 33620
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 921e903f2480f727571e930f4b833f00a5de22cd10b5c4e508712c1cffb56fca
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 33416
    end_char: 33425
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0273
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342d
char_span:
  start_char: 33637
  end_char: 33705
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6c3cdbde076760fa4bee95e371b8acb3f9c5109de163e8079dd240dc7556b725
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0274
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342e
char_span:
  start_char: 33717
  end_char: 33728
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0f7cc0f88ca602580c73b4ce88b5111960e528c9a182b342bb4884e1286696b2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0275
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342e
char_span:
  start_char: 33733
  end_char: 33864
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1d0220f31aa09d77a4d89fd4ebadc20bf3419a231055f91469707860a4ac3488
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0276
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 342e
char_span:
  start_char: 33889
  end_char: 34166
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a2708553d3077e529586ae2b03c5d39224c5a0314c33c15ddc129258aecf1862
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 33897
    end_char: 33906
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0277
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 343a
char_span:
  start_char: 34323
  end_char: 34366
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d234ae006b4e5fa8782b968e389fdce7cf4e06bc243191fa1c94e92bf142deda
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    role: cue
    text: " ὁ Θρασύμαχος ἀντὶ τοῦ ἀποκρίνεσθαι, εἰπέ μοι, ἔφη"
    start_char: 34286
    end_char: 34336
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0278
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 343a
char_span:
  start_char: 34371
  end_char: 34435
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fb63dc654b1e36e8ed319c87b0554969c0c485c57e8a5b5e1276c0c3a4bfaabf
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 34378
    end_char: 34387
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0279
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 343a
char_span:
  start_char: 34440
  end_char: 34551
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 17702da416f67784292020e4e9a27eafed6fa54faf03f9d8f56d731916a0ceda
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 34287
    end_char: 34585
    text_sha256: 5bc9ec3f69c2f9a6967a8c2c8f6590e3884ca142602f1fcd1443e9797e86cf13
  rationale: The named ΘΡΑΣ. handoff precedes ΣΩ.'s first-person reply; the target's σε is directed to ΣΩ., and the next first-person reply closes that local two-party exchange. This is reviewed discourse, not an anaphoric antecedent.
```

```yaml
voice_id: voice_republic_0280
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 343a
char_span:
  start_char: 34556
  end_char: 34585
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7a280d8a7ec364777a05510e1ad6e5825e4ed58cbf41085a5694d12203d9b9e7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 34575
    end_char: 34584
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0281
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 343b-344c
char_span:
  start_char: 34597
  end_char: 37606
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7cf3c36c4e24cebeaac703667f152a78c44ccd6ac650cd8624d0be3ee67aae2d
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: ταῦτα εἰπὼν ὁ Θρασύμαχος
    start_char: 37618
    end_char: 37642
limits: Unreviewed primary candidate. The named formula immediately after the span licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0282
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 344d-344e
char_span:
  start_char: 37837
  end_char: 38130
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cc53b865e733269ccaa4e4f260b8b5f189ceda2724e5b9c8c3ae2df5ccfda497
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: καὶ δὴ ἔγωγε καὶ αὐτὸς πάνυ ἐδεόμην τε καὶ εἶπον
    start_char: 37837
    end_char: 37885
limits: Unreviewed primary candidate. The in-span first-person formula licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0283
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 344e
char_span:
  start_char: 38135
  end_char: 38186
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d02a0cf7a8e3ab149447fc97d92383d2d7a75b082727409240de9aab6467e7f3
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Θρασύμαχος
    start_char: 38150
    end_char: 38166
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0284
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 344e-345b
char_span:
  start_char: 38191
  end_char: 38915
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cf2f256eaf991f114b32b17f11a0422a03ce5a4f803a8100d5e9216d1b761d65
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 38199
    end_char: 38208
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0285
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 345b
char_span:
  start_char: 38920
  end_char: 39037
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a1b68aa27c4c7a98e4d706739af3f457ef55d92103cb3a87f874c62a07b915e
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 38880
    end_char: 39100
    text_sha256: 5df4b68fcb75892f43a50c420aa4169130ad9b7090af6e021a0d2a87c09feaff
  rationale: A named ΘΡΑΣ. report opens the local exchange, followed by ΣΩ.'s first-person sustained address; the target's σὲ and the immediately following first-person ΣΩ. response bound the ΘΡΑΣ. turn structurally.
```

```yaml
voice_id: voice_republic_0286
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 345b-345e
char_span:
  start_char: 39042
  end_char: 40081
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6d777e93a8fda9fb120432533425c2372d475eb88b8185cf31650e89380846ba
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 39050
    end_char: 39059
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0287
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 345e
char_span:
  start_char: 40086
  end_char: 40116
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eaaf271ae76894567da36e76cda9f0af40f04d14deee29b846c8a367c3c06337
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 39950
    end_char: 40160
    text_sha256: 6962c84274b9bb55b669b60d3c6089a827ab89f22251b7c8333ca97d87c08695
  rationale: ΣΩ.'s first-person speech expressly addresses ΘΡΑΣ.; the target answers its second-person question, and the next first-person ΘΡΑΣ.-addressed turn closes the same bounded exchange. The owner is reviewed, not carried from a prior formula.
```

```yaml
voice_id: voice_republic_0288
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 345e-346a
char_span:
  start_char: 40121
  end_char: 40487
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4cfdbe3987daf05c2adeebe4f955831c4b47ee6ee6a0aa0913790702bee02b40
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 40128
    end_char: 40137
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0289
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346a
char_span:
  start_char: 40492
  end_char: 40515
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5bd32b6871b5bfa11efd149aa44381363ddbba80233fdd0cf71c66c5f8405232
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 40120
    end_char: 40515
    text_sha256: 10c034d76473af80971cf742532dc4d742fc40d7a8a1e858c39c0a79608e7857
  rationale: ΣΩ.'s first-person vocative ΘΡΑΣ. question directly frames the target's answer. The bounded recipient/response relation supports a reviewed attribution, while the old anaphoric evidence does not.
```

```yaml
voice_id: voice_republic_0290
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346a
char_span:
  start_char: 40520
  end_char: 40676
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 88215a26d798f72a6c8cec51da40c4263d1385b90b90b82bd22633cc096efe7b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0291
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346a
char_span:
  start_char: 40681
  end_char: 40689
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0292
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346b
char_span:
  start_char: 40701
  end_char: 40994
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4ed54989fb06f1c3d89910bf1cf6ca315269b40d75e753573378ee492d8284b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0293
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346b
char_span:
  start_char: 40999
  end_char: 41012
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b6f93052aac3e686b00515f7d5c006d96aba2574ce507bf65e4483760901dd66
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
candidate_owners:
  - ΣΩ.
  - ΘΡΑΣ.
unresolved_reason: The target follows unmarked intervening question-and-answer material. Its bare οὐ δῆτα, ἔφη supplies no named or person-marked owner; resolving ΘΡΑΣ. would rely on alternation across those unmarked turns.
```

```yaml
voice_id: voice_republic_0294
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346b
char_span:
  start_char: 41017
  end_char: 41075
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f44f6d0af4cd0b49417f37f0ce37a3bc0bd8d481ca6eb018f46eb58be6043caa
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0295
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346b
char_span:
  start_char: 41080
  end_char: 41088
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0296
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346b
char_span:
  start_char: 41093
  end_char: 41153
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 85ff05dcf9ff3462ee63dff64bb9e00de3d26233b2069b0114fe5a99550d8079
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0297
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346c
char_span:
  start_char: 41178
  end_char: 41244
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5ea3dbe5ba59ddf2e521d12ca6c6b9c8964e85df5a0c77604663501bd250aa63
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0298
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346c
char_span:
  start_char: 41249
  end_char: 41259
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a4829cd61c37a58138bdfa7b89ad91d5ce02d48e8a44edfed792d35976bfd7de
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: Bare third-person ἔφη supplies no owner, and the earlier vocative is an addressee rather than an independently licensed antecedent for terminal ΘΡΑΣ.
```

```yaml
voice_id: voice_republic_0299
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346c
char_span:
  start_char: 41264
  end_char: 41387
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: db798d30d0b0883fcb1f39b39ef4ee59eef2bf8d943eccbdf97b50d43aef0794
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0300
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346c
char_span:
  start_char: 41392
  end_char: 41404
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f66ece7f2894d93576bc337c9c925493b82a1504feeb4b1f8a6bb9c6b270e6db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: Bare third-person ἔφη supplies no owner, and the earlier vocative is an addressee rather than an independently licensed antecedent for terminal ΘΡΑΣ.
```

```yaml
voice_id: voice_republic_0301
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346c
char_span:
  start_char: 41409
  end_char: 41526
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bb6a52ac1a0ef0b58fcfe8c013a8fd082aef54960a73e3fe9765ab2a96639de9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0302
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346d
char_span:
  start_char: 41556
  end_char: 41963
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8c0ca9dbaa713d9ae44273b8c25c0d75042a1457c53129c5c022b394d852c885
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0303
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346d
char_span:
  start_char: 41968
  end_char: 41985
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e2b65fff2cb60ca7515151f214a2830c9dbc57ccfa320164e266bb3602e9efce
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: Bare third-person ἔφη supplies no owner, and the earlier vocative is an addressee rather than an independently licensed antecedent for terminal ΘΡΑΣ.
```

```yaml
voice_id: voice_republic_0304
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346e
char_span:
  start_char: 41997
  end_char: 42045
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cde507f35437ef2c124863fe17a825e1d0fd603fac0764a0cbc421c3c3db5b8c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0305
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346e
char_span:
  start_char: 42050
  end_char: 42062
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c26171d5a9b4457395db9f4fb4329ba9406ec6cb0b5caf7a1c20a11fd216a6a3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0306
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 346e-347a
char_span:
  start_char: 42067
  end_char: 42717
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 040a987b3cdc6b7570b7e9378c76d7b5c3bcc469d75f952a3beaf0b793c38a07
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 42067
    end_char: 42717
    text_sha256: 040a987b3cdc6b7570b7e9378c76d7b5c3bcc469d75f952a3beaf0b793c38a07
  rationale: The in-span first-person ἔγωγε … ἔλεγον and direct ΘΡΑΣ. address identify the narrator as the terminal speaker. The context is this uninterrupted utterance and does not infer ownership from the preceding bare reply.
```

```yaml
voice_id: voice_republic_0307
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 347a
char_span:
  start_char: 42722
  end_char: 42872
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: beb24e93b7789ae87330fef859045616e3a1538b65924fba500f4a0c5b283afa
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ Γλαύκων
    start_char: 42752
    end_char: 42765
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0308
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 347a-347b
char_span:
  start_char: 42877
  end_char: 43070
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7b02a861e357714e78f4e00ad121071a3a21092ea77e70843af56d21d4969950
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 42907
    end_char: 42911
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0309
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 347b
char_span:
  start_char: 43075
  end_char: 43086
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f19690eb14f659c7878603daaf0d52bf381c888aaa1c2cbcbb3fd8c013e08d99
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΓΛΑΥ.
  context_span:
    start_char: 42718
    end_char: 43087
    text_sha256: fed6d9a57a66192b6eeb5066f6e8a808d48fb367102908a26a5c3d50f7137d86
  rationale: The named ΓΛΑΥ. opening and Socrates’ person-marked singular question are immediately answered by target first-person ἔγωγε within one local pair.
```

```yaml
voice_id: voice_republic_0310
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 347b-347e
char_span:
  start_char: 43091
  end_char: 44511
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0ed4a9765cea93e965b23190da1006382e71ddad072928a50d8383441c67c048
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 43109
    end_char: 43118
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0311
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 347e
char_span:
  start_char: 44516
  end_char: 44564
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7d912873ae08a15c17088dfecf599091ebb30924bc04e097a1017974a4ed43c0
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΓΛΑΥ.
  context_span:
    start_char: 44424
    end_char: 44564
    text_sha256: 9158c41de30e036d4ab5dd0bf0d6f638ea25afdeb13b78bf7a062304eb3b254c
  rationale: The target immediately answers Socrates’ person-marked question explicitly addressed to ΓΛΑΥ. with first-person ἔγωγε. The context starts at that question and ends before Socrates’ next separately marked question, so it does not carry a speaker across an unmarked switch.
```

```yaml
voice_id: voice_republic_0312
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348a
char_span:
  start_char: 44576
  end_char: 44644
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6a1856f3f82025274cbcaeeb881becb5eb56fa94e09500360c816279991e14a5
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 44585
    end_char: 44594
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0313
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348a
char_span:
  start_char: 44649
  end_char: 44679
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 35b897a93a9f3a148ab2e39f820c3437119f7348814c6c299be49242e9d9759c
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΓΛΑΥ.
  context_span:
    start_char: 44450
    end_char: 44680
    text_sha256: 906efe3360e3bf0ea4dafda1fca10fbedd1d19fcfc1a11a4e6df29597cf0dbec
  rationale: The explicit ΓΛΑΥ. address, person-marked Socratic question, and immediate first-person ἤκουσα reply identify the terminal owner.
```

```yaml
voice_id: voice_republic_0314
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348a
char_span:
  start_char: 44684
  end_char: 44755
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 93d86fad9f3063e0a94b6b149706287b0cd71b92bf38d511c56a915e6e96d3d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0315
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348a
char_span:
  start_char: 44760
  end_char: 44789
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e049ddb58bcee46bc390bf2c5a2e8b22ff48dc9bd8d4967000108bdb92d50d81
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΓΛΑΥ.
  context_span:
    start_char: 44450
    end_char: 44790
    text_sha256: 34c6ed4e2cc87a6aa4a5f3c207b2479043e2a2a755cc1a7bbbb65786b48f1489
  rationale: The named ΓΛΑΥ. exchange contains Socrates’ singular βούλει prompt and the immediate first-person βούλομαι response.
```

```yaml
voice_id: voice_republic_0316
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348a-348b
char_span:
  start_char: 44794
  end_char: 45165
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b2b44a2712cbad22448258a3be84857cab9bc6efca51ec7ddb1d698caa698f88
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 44809
    end_char: 44818
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0317
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348b
char_span:
  start_char: 45170
  end_char: 45188
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: Bare third-person ἔφη has no owner-bearing cue here; the preceding Socratic formula cannot be converted into a ΓΛΑΥ. terminal attribution.
```

```yaml
voice_id: voice_republic_0318
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348b
char_span:
  start_char: 45193
  end_char: 45230
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ce776ffcaf1c1f5fd86e7cb874128eaee7288d305b0cfb4f39c34243f30f332d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 45211
    end_char: 45220
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0319
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348b
char_span:
  start_char: 45235
  end_char: 45246
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e53ffdeffd81fb13152f164b0f7043e82a2709469ba4fc66e10bec9e2da4d896
voice_chain:
  - ΣΩ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΓΛΑΥ.
  context_span:
    start_char: 44450
    end_char: 45247
    text_sha256: ef3737fa2cfddbd34f3ec2fdf5b89d5dc07c2fa7ff295a8a479ffeaeb792aa8a
  rationale: Socrates’ person-marked singular question to the active ΓΛΑΥ. addressee is immediately answered by οὕτως.
```

```yaml
voice_id: voice_republic_0320
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348b
char_span:
  start_char: 45251
  end_char: 45377
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1c4789e0746965007d11cfa2a4a268c9bca48ed6bc4e24d5aa717095544f69c7
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 45259
    end_char: 45268
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0321
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45389
  end_char: 45435
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3af907d2a876275dc7f3a6ebe5234b8f6812f30f4d5e2e8316c91cd21f7d46a9
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45247
    end_char: 45436
    text_sha256: 2a2e45def57549da5e85f6e7fe481b3ac80580c17e2dcd5e0ba5bc0aa9540e49
  rationale: Socrates’ person-marked named ἀπόκριναι prompt is immediately followed by target first-person φημί and εἴρηκα.
```

```yaml
voice_id: voice_republic_0322
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45440
  end_char: 45529
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 54b3be1278101f1c8b83effa09664d5825a7e06f7bc7d8cc9eb7d4f545d8906c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0323
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45534
  end_char: 45545
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0324
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45550
  end_char: 45607
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fa5be10693b249274c16fde8f68ef50de4b7f309f0ce6bc725d0e3c099ba9f33
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0325
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45612
  end_char: 45698
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2865684459321b88ea9a639e51ae4ebb26000d82133017526f82afbe9c75cf7d
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45247
    end_char: 45699
    text_sha256: 76fe3f84049c291aa03397e0f90d1a65a5f0840ad35c251028abbef5ee4f877a
  rationale: The named ΘΡΑΣ. pair contains Socrates’ immediate οὐκοῦν question and the target’s direct first-person λέγω response.
```

```yaml
voice_id: voice_republic_0326
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45703
  end_char: 45715
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 63dc201db2d9461b3da6f1a8fb2bbc11adf057ee230fa8522bb9a437f3496f3f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0327
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45720
  end_char: 45740
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 298d8fd872fb2d36bc315203bf7cb970b08bd8ca5a9fccc705cf4d409fb5d657
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45247
    end_char: 45741
    text_sha256: 13502b250a610ede14c6039a3aac7180699390dd2ae0af5f7246f7b7db39b9e6
  rationale: Within the named ΘΡΑΣ. pair, Socrates’ direct question is immediately answered by τοὐναντίον.
```

```yaml
voice_id: voice_republic_0328
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45745
  end_char: 45770
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e7c927219591eecabd9daa75b44cb4f98e6eadc4069eff0e0a11e1ecb6b13882
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0329
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348c
char_span:
  start_char: 45775
  end_char: 45808
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0ca92c595cc6ce7b0ffa0c92bb63fd7712d1250b371d56892d484ad01a2f6074
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0330
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348d
char_span:
  start_char: 45820
  end_char: 45854
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c418a1d1551b3597d4840869968554d85fa6aa05f98fb58bf393fc9891eda5a8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0331
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348d
char_span:
  start_char: 45859
  end_char: 45884
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a56e05af4dab1d9ae799a6294104a9e9de9253cae2e1de7fa1f615a4b50e6cd
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45247
    end_char: 45885
    text_sha256: 93be7e3cb1c7df4697231353715e5d1bcdeabe48d6b4d348692c5bba75b010d3
  rationale: The local named ΘΡΑΣ. exchange has Socrates’ direct καλεῖς question followed immediately by οὔκ, ἀλλ’ εὐβουλίαν.
```

```yaml
voice_id: voice_republic_0332
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348d
char_span:
  start_char: 45889
  end_char: 45958
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 33dc184a6f6eb0763b188f36ecac25e0c62d96013eee2fc28207ebeceb985f94
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45247
    end_char: 46230
    text_sha256: 0cce1406b7b97ea76cac65e9ca528a02e13792a14ebd3e915123b5204d161a22
  rationale: The local ΘΡΑΣ. exchange opens with Socrates’ first-person formula. This target directly addresses ΘΡΑΣ. and receives the immediate οἵ γε τελέως answer; the context ends before Socrates’ next first-person formula, without carrying an owner through a later switch.
```

```yaml
voice_id: voice_republic_0333
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348d
char_span:
  start_char: 45963
  end_char: 46222
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 62b6efa7d882df679f12f14b27ed5e15839723932b78c3bfee645037f9af3c84
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45885
    end_char: 46230
    text_sha256: a2caec2ffb77c678f00c04b55244bb22c618c1ed2aecf23115a2b05f4aec1417
  rationale: Socrates’ immediate named ΘΡΑΣ. question is answered by the target’s opening οἵ γε τελέως response within the same bounded stretch.
```

```yaml
voice_id: voice_republic_0334
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348e
char_span:
  start_char: 46234
  end_char: 46385
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f0b81938688eaf1c9162ce8adcc0cf73571fc71e4fe6c4b7740a7fffd4098e20
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 46245
    end_char: 46249
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0335
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348e
char_span:
  start_char: 46390
  end_char: 46412
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6a247783bc67a00226285af0bfae51ca9a53fa8bc6089494f2f45f40dc80a789
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0336
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 348e-349a
char_span:
  start_char: 46417
  end_char: 46843
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 77d0f948db260e5a585c825cb38974458b56d2a1c58ba896ba04ebce6a66e94f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46424
    end_char: 46433
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0337
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349a
char_span:
  start_char: 46848
  end_char: 46873
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 00c26aff1daf263fedc2fd44a544bd653695ddd6b77598b00abe4d342a2f3607
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 45888
    end_char: 46874
    text_sha256: 370713ef6b5ce8adf1ab0edc1457d7a22aa674575c972b7f8dc8aa6c885a6cda
  rationale: The named ΘΡΑΣ. exchange and target second-person μαντεύῃ as an immediate response to Socrates’ ἦν δ’ ἐγώ utterance identify the terminal owner.
```

```yaml
voice_id: voice_republic_0338
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349a
char_span:
  start_char: 46878
  end_char: 47092
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0411b18878a0b628345877e40d26ae7fa104acb1361f7d2840b35503907d27d8
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 46894
    end_char: 46903
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0339
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349a
char_span:
  start_char: 47097
  end_char: 47180
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 02c8eeb57b5675b6fb0b1d2aebc5e9466c93165b084c81f093569fc6343152a5
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 46874
    end_char: 47188
    text_sha256: 88ed1fb7adffd82061b19ef67a05da54d6f63e10deec2525b8e4294f9f21495d
  rationale: Socrates’ person-marked named ΘΡΑΣ. utterance is immediately answered by the target’s reciprocal τί δέ σοι response.
```

```yaml
voice_id: voice_republic_0340
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47192
  end_char: 47319
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cf89fbbc2c3356c4390e19e0c7097b274a5ad0f79f128a3d52330932bf5229d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47199
    end_char: 47208
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0341
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47324
  end_char: 47382
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0fb94b62aac9bc81b5ef92e5f93809e25543ed8316e7e19617b3a454f2b1ee1b
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 46874
    end_char: 47383
    text_sha256: 0ad09a467f4df479d72631834f8e91436dcc7267b3e476478cf225861048cf81
  rationale: The named ΘΡΑΣ. pair contains Socrates’ person-marked τί σοι question and its immediate οὐδαμῶς response.
```

```yaml
voice_id: voice_republic_0342
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47387
  end_char: 47414
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: da76b198973830ee8260c953af461f30a7196318e27a4495414210ac00e4252f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0343
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47419
  end_char: 47441
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 620475d282d7fff2630bba0243b29170c8e39bb9f39aeea637747dadfbc3a396
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0344
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47446
  end_char: 47531
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ce43bf0627d982b079e1f76fe6940e27d38a3124f302ca23f34e1e925f94b009
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0345
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b
char_span:
  start_char: 47536
  end_char: 47587
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 792f1d49adeee3f75e30f018d0e699011f8ec89392c6b95453e140fd0b47ef05
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0346
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349b-349c
char_span:
  start_char: 47592
  end_char: 47716
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d5c3242de5761427d6fdcdc180ffbcf6ff7fe8e17b99293413dbbdf9902e0b3d
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 47607
    end_char: 47616
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0347
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c
char_span:
  start_char: 47721
  end_char: 47743
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f4bf0803798adbfb363c9f02373cef13aec20eb09ac043510262bb5441ca67c9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0348
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c
char_span:
  start_char: 47748
  end_char: 47825
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 507b7f223c38d3b900191b46934ee76a8aff1c34ba9275c87633aaa4e2a7d7a7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0349
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c
char_span:
  start_char: 47830
  end_char: 47879
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bc05386962e98a7c29f8f3b45f81b6d394563118bbc071d4e36aec0a41f23853
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0350
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c
char_span:
  start_char: 47884
  end_char: 47998
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c4511aa8077c7dd4f64667ecf58d6e2496ededcf17a04e604707deb6eab51adc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0351
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c
char_span:
  start_char: 48003
  end_char: 48014
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0352
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349c-349d
char_span:
  start_char: 48019
  end_char: 48148
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b60c1bcff0926b6610bbb4c40fac2761b86a3a211cc4eaf2bec6e9f3949bf3cc
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 48035
    end_char: 48039
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0353
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48153
  end_char: 48174
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 68ee6e1f03822347dbe940e1e9c2d04efa443de8e292acc7d7121a2e23afb4e6
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 48015
    end_char: 48175
    text_sha256: 2a21394eedea502832472e4d02e17a85577f84d4a1768ac14eb55fcfb8e4a678
  rationale: The local ἔφην / εἴρηκας first-/second-person handoff identifies Socrates as addressee and ΘΡΑΣ. as respondent.
```

```yaml
voice_id: voice_republic_0354
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48179
  end_char: 48253
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9e97d3ed32ecac236adbab0df008e01d7bb1dc884fd747cb99a6c5af68aed31f
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 48192
    end_char: 48196
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0355
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48258
  end_char: 48277
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a7d0b48143a34a3502adec7e11ea684d52ced0e7f40b55930dae81f4133ec989
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0356
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48282
  end_char: 48369
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 37ec701dd65462fa5f21d063729be0e7e50a93888a9d6790c73993cc9dc2ee34
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 48290
    end_char: 48299
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0357
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48374
  end_char: 48458
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 87d2463e5f79f0440dcdfba8f963ae1cfcf6d032ce43d0d1ce8da617692ff6b5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0358
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48463
  end_char: 48518
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bebc223d2dedf1e72e27de937d0d2f38efee3a1ab463d8c9d5060a057e2cb474
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0359
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d
char_span:
  start_char: 48523
  end_char: 48543
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 61017dbf93da600945d7c573758b93a7426183822c78daea45032e8f8acbea74
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0360
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349d-349e
char_span:
  start_char: 48548
  end_char: 48617
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5272921faa9f3b40e1b0a764193f539c5485a4f9748b23c1b183182178a6d302
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 48282
    end_char: 48628
    text_sha256: 421a689ce3352fc30bdc9e30e071b1a1741b7f4af81a828f269826252cb584c9
  rationale: Socrates’ preceding first-person formula opens the local dyad. This target directly addresses ΘΡΑΣ. and its question is immediately answered by ἔγωγε; the context does not infer an owner from either intervening bare reply.
```

```yaml
voice_id: voice_republic_0361
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48622
  end_char: 48628
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0362
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48633
  end_char: 48669
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bc3e32c6fcc6eab39469f16a4200c8571285968b6a7ab704708f0c0792978c27
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0363
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48674
  end_char: 48729
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 427756bbfade7a435c766f7ed99eeac691325fa4bc0bf80be7d6fa22d5183e65
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0364
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48734
  end_char: 48787
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 76feacda5d2b426107d6af5c7753d36635b340b6c893bd3a4e3ab3daf7532ea3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0365
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48792
  end_char: 48796
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0366
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48801
  end_char: 48827
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b90eebfaf760feac562973f944beca0675bdcca8283911a8d8e513b4eed4826b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0367
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48832
  end_char: 48838
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 30860861884e5a23e0ee536893a55b4a528ad8c486ed5c269deeeff0c0455e75
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0368
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 48843
  end_char: 49002
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9ee59d7f53e96278cd3de289e0fef159a58eaf3a93a08ec283223ab1bcd1ab92
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0369
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 49007
  end_char: 49018
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e94c121ca9c6b3edaf19917122a076177ba4367f97887655af2899a6d531469d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0370
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 49023
  end_char: 49038
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: aafdd39ee801b2d9ae7878d0305bc2c5309f405604defa5c3e7e9850a6b1b58c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0371
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 349e
char_span:
  start_char: 49043
  end_char: 49055
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 957a4d55b1da4147f13d447b0b3012b678cd7c823196ab62661f64de79d59e7c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0372
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49067
  end_char: 49159
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f078bf53d35803fd7f39552900d6db97a289f8bc83560bf216d94f9550ae7d98
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0373
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49164
  end_char: 49172
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0374
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49177
  end_char: 49192
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2e767d57ae9b04d8763ebea9ec3c324d8d126de381f206e984fd4e51941f999c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0375
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49197
  end_char: 49201
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0376
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49206
  end_char: 49412
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a5f8308c46725ce32bfc9ecff5edd63a3c5b245f1f48d9fc0aa1f72b92b3d812
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0377
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a
char_span:
  start_char: 49417
  end_char: 49461
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 795eb11d554aea7c440d26f3bd8dd921e82dd37732adbcf5e7af7ff4b7937b06
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0378
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350a-350b
char_span:
  start_char: 49466
  end_char: 49565
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 03fb9338ebce07ed1078a04400db93083a03599804ea82ddcbdb013772591a3b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0379
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49570
  end_char: 49575
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 03a5418a79453e34afef7d51feec7cd5095afc9f2b5c5ff98f3aac1ae01edd53
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0380
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49580
  end_char: 49601
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 68d93d26a7206466c39286dd6f1f8c24b4d2a59356fc3f375b2a93a6915ddb09
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0381
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49606
  end_char: 49611
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ed62d9e65e01b2b51a7a578d1e48d26bffcd48f38f3e979054fe093883989dcd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0382
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49616
  end_char: 49634
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4800ff85238b331e76a3026389397cc89b37c8c9f81fde54ded49c8244972afc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0383
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49639
  end_char: 49644
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ed62d9e65e01b2b51a7a578d1e48d26bffcd48f38f3e979054fe093883989dcd
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0384
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49649
  end_char: 49748
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b7c129fe5cb654ff7973588336005da305afbdfce713024cd2c64b2e378ebefe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0385
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49753
  end_char: 49765
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f66ece7f2894d93576bc337c9c925493b82a1504feeb4b1f8a6bb9c6b270e6db
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
unresolved_reason: The target has only a bare third-person reporting formula; the cited ὦ Θρασύμαχε is a vocative addressee rather than an owner-bearing antecedent, and this narrow support supplies no other discriminating cue.
```

```yaml
voice_id: voice_republic_0386
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49770
  end_char: 49826
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8277a48ff947f2361295bee6ac50dfb55e4c58facb4e4eea5dd3d1e029772641
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0387
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49831
  end_char: 49840
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0388
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49845
  end_char: 49949
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a02786782f482bd6f5897d897626ca7a2a5a40ac9ff494807b95473680899c2b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 49866
    end_char: 49875
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0389
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350b
char_span:
  start_char: 49954
  end_char: 49965
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f19690eb14f659c7878603daaf0d52bf381c888aaa1c2cbcbb3fd8c013e08d99
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 49841
    end_char: 49973
    text_sha256: dd45574f6a24fe263aa91b673bb8ab11677b73ac8ac0296c06c9a65bbeb3474e
  rationale: The adjacent source context joins Socrates’ first-person ἦν δ’ ἐγώ and direct ὦ Θρασύμαχε with this third-person reply.
```

```yaml
voice_id: voice_republic_0390
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 49977
  end_char: 50041
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 797c92d6c995fd5d1283019757b3fc2707c4d364a496e2f556a206de5a5625fe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0391
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50046
  end_char: 50050
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0392
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50055
  end_char: 50142
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ae36c994c2cc4694ed00b87629e8efc9817f23a47db6aa5e39891ec507de7486
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50067
    end_char: 50076
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0393
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50147
  end_char: 50158
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2690cb0af3709142b4f4d47cd699ba6b813aad2ac3d640c08e46bb65bc8a5664
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0394
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50163
  end_char: 50239
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 35b86de801d8f129f9fafb0adb581ccd346183a06651f330851161176b3b2571
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0395
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50244
  end_char: 50260
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 60a38b1ccaf9dbef427e194fdde6c448d89a806eb8e3bcc51fcfe4297fcc1c7d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0396
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350c
char_span:
  start_char: 50265
  end_char: 50356
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ef01c0b90cea2a50811a9174773c0437f3d501bcd97462de9c730511435d29a3
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0397
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350d
char_span:
  start_char: 50688
  end_char: 50804
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4cc9d33300065b41e896cd58b49f70a54749a5300e043ef85d765cfc1b120184
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 50694
    end_char: 50703
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0398
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350d-350e
char_span:
  start_char: 50809
  end_char: 51120
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a6bed047157bf6551cee9a8bf6ae2b6a82c958a54e7098b40874a87f74f7ae98
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 50688
    end_char: 51121
    text_sha256: bba8f415bcc789281291c473a8ed8892fb19f38bfe71f7eb341e804e6c80a517
  rationale: Socrates’ first-person εἶεν, ἦν δ’ ἐγώ and direct ὦ Θρασύμαχε precede the target’s response, which ends before Socrates resumes.
```

```yaml
voice_id: voice_republic_0399
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350e
char_span:
  start_char: 51125
  end_char: 51170
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a603d9bc1628f86fef2058a5b579cbf94ecd4d11b366b929c4d60fd7e486977
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 51134
    end_char: 51143
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0400
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350e
char_span:
  start_char: 51175
  end_char: 51248
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 35747bcd396b0189f819b7b951e06984f648dbcd736ec082ec87aec4a9178d61
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 51121
    end_char: 51249
    text_sha256: 2ac9aa31452ca6b7e7b08be4fd9eea5aaa5f28c01b4c84e3a57cf3129b4bc259
  rationale: The target’s σοί and οὐκ ἐᾷς refer to the immediately preceding first-person Socrates utterance; the following turn resumes Socrates’ speech.
```

```yaml
voice_id: voice_republic_0401
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350e
char_span:
  start_char: 51253
  end_char: 51327
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2b11bae03ba7652616133b40b45437b961fe34ec5acc1029e9bae31f1680203e
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 51267
    end_char: 51276
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0402
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350e
char_span:
  start_char: 51332
  end_char: 51341
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 76c2258b7a04be4eab06d0a7922406c743bed83462dac73801639c01179f6020
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0403
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 350e-351b
char_span:
  start_char: 51346
  end_char: 51939
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8615bc4f8d97318762455f75a27ac40711e74f01458b0be486396b49a50f2c93
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 51554
    end_char: 51558
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0404
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351b
char_span:
  start_char: 51944
  end_char: 52026
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9aaa050590fa004376e640be3e005e33ec7d07497898e829b87228e4c12052d9
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 51554
    end_char: 52027
    text_sha256: cd88d74bbf2c8416bb3dbd85cc67f3f9f7874f488bafab02610506071cac0792
  rationale: Within the bounded question/reply, ἔφην identifies Socrates and ὦ Θρασύμαχε identifies the addressed respondent before the target’s reply.
```

```yaml
voice_id: voice_republic_0405
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351b
char_span:
  start_char: 52031
  end_char: 52215
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: eabd778d78c442545481c7290c6286777931e03206d1c0ff4f3aa039e3493729
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 52040
    end_char: 52044
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0406
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351c
char_span:
  start_char: 52227
  end_char: 52338
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a3d7983667bfb6104ba073031e051274a89e247e8886cee675e6568b9c6d4ed
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52027
    end_char: 52339
    text_sha256: 25954dab92cad09816a30b8068b4d48897d30d36b7aecb569c99e58d949f1722
  rationale: The target’s σὺ / ἐγώ contrast is anchored to the preceding first-person Socrates question and stops before Socrates resumes.
```

```yaml
voice_id: voice_republic_0407
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351c
char_span:
  start_char: 52343
  end_char: 52448
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 288a93e2d8c55180c0d406ec6b0729ccb733d57f9fae3227a9871702eb3a822a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 52356
    end_char: 52365
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0408
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351c
char_span:
  start_char: 52453
  end_char: 52477
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 533ada9debe23d4e3692ddcd79b15dcafcbb86f9ae5d440f05a068d73bddb22e
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52343
    end_char: 52478
    text_sha256: 55e782f60c0be0b8c559f588757fdfa423e74f8188514a38e15dab2b2833d3aa
  rationale: ἦν δ’ ἐγώ names the first speaker; ὦ Θρασύμαχε names the active addressee; the immediately following σοὶ γάρ, ἔφη is that reply.
```

```yaml
voice_id: voice_republic_0409
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351c
char_span:
  start_char: 52482
  end_char: 52682
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 64846f2c6141213b21c547d3dca4486c364c3f156731a025818e263da7f714e9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0410
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d
char_span:
  start_char: 52694
  end_char: 52711
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 09e5c93fcdc6168bc25364a57d3c304a581833fc67c55d79964bd0c5c20da248
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52343
    end_char: 52712
    text_sha256: 5feefcfc3487e01076a8a0c817f53b2ee2b5f9e93f8e4d08b42461b8714d8b3b
  rationale: The source names Socrates and Θρασύμαχε, then retains that active addressee in σὺ … καὶ λέγε; οὐ δῆτα, ἦ δ’ ὅς is the immediate answer to that question.
```

```yaml
voice_id: voice_republic_0411
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d
char_span:
  start_char: 52716
  end_char: 52748
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 51e7e1ac93353ef226d58db13d8d0d6e6aed200d392761baffdcb59b907fb9fe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0412
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d
char_span:
  start_char: 52753
  end_char: 52761
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0413
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d
char_span:
  start_char: 52766
  end_char: 52891
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8100643d7acd3e2764d783e552542688c6955a650281da79a0a1be51e0f2ccd4
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52343
    end_char: 52934
    text_sha256: f58ed9316177be9c65e3cb48f6bad7f1bff8272687587ebaac5760bcb249f924
  rationale: The local exchange opens with Socrates’ first-person ΘΡΑΣ.-addressed formula. This target directly addresses ΘΡΑΣ. and receives the immediate ἔστω answer; the context ends before the next generic addressee, without treating intervening bare replies as owner cues.
```

```yaml
voice_id: voice_republic_0414
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d
char_span:
  start_char: 52896
  end_char: 52933
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: b5841efe5e59c0a8774dc4da91449073704f6f6450651e3f191cea3ffba01f82
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52762
    end_char: 52934
    text_sha256: 1f21a4905f4894c2176bb0dde58068a188493cad49d09ba803629afbcb77b4ed
  rationale: ὦ Θρασύμαχε marks the addressee of the immediately preceding ἦ γάρ; ἔστω, ἦ δ’ ὅς is its direct reply.
```

```yaml
voice_id: voice_republic_0415
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351d-351e
char_span:
  start_char: 52938
  end_char: 53185
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: abcb4118c7abff91f6474a0c621caf56be2e36b85c1b246bee6713ee87e560a7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0416
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e
char_span:
  start_char: 53190
  end_char: 53198
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0417
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e
char_span:
  start_char: 53203
  end_char: 53310
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 41256d5fa8d6653b35fcb2044b4d2fa1a52f948a9e1dba9ab2800271901e4e2d
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0418
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e
char_span:
  start_char: 53315
  end_char: 53328
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cf0fcd977ddca7943d81e384ceb428800b56e2e21290db3f06d300d570465305
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52762
    end_char: 53329
    text_sha256: 0f92855694e931becda6ca77266157202b53ae38aa50247496dc1b630c839e6d
  rationale: The named Θρασύμαχε exchange remains continuous through the target; ἔσονται, ἔφη is the immediate answer to the preceding question and no source handoff adds another owner.
```

```yaml
voice_id: voice_republic_0419
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e
char_span:
  start_char: 53333
  end_char: 53433
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 490f166609e2c72064c5f7309bf276f06d5a332b49448f664ff053991ec4e0d2
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0420
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e
char_span:
  start_char: 53438
  end_char: 53461
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 33742ea15e23496c0142ad93a924bd9ff2ea675e49c3296b196d93d6d8f86f46
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52762
    end_char: 53462
    text_sha256: 7ce308222086b352f6c0d92c91621f778a4242bfc95d4e342b45b996ae37c541
  rationale: The named Θρασύμαχε dialogue remains continuous; μηδὲν ἧττον ἐχέτω, ἔφη directly answers the preceding question and no handoff introduces another speaker.
```

```yaml
voice_id: voice_republic_0421
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 351e-352a
char_span:
  start_char: 53466
  end_char: 53767
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ac33f144cef1552e46d3485dc3364217c8fcb439ba6e2844d3fee4229cf37c83
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0422
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352a
char_span:
  start_char: 53772
  end_char: 53780
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0423
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352a
char_span:
  start_char: 53785
  end_char: 53993
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: d5a4656137d9ea0bae9dd22842b75446f81a3b5a02e564692f1dfa010e455fb1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0424
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352a
char_span:
  start_char: 53998
  end_char: 54002
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0425
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352a
char_span:
  start_char: 54007
  end_char: 54048
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 744f1e32b551cf39d2646f80f863632d7d63169cce8d5aa0a368517dcbfab1c7
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0426
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352a
char_span:
  start_char: 54053
  end_char: 54063
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a4829cd61c37a58138bdfa7b89ad91d5ce02d48e8a44edfed792d35976bfd7de
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 52762
    end_char: 54071
    text_sha256: c1344323ead1cd8b611b2b8c8081709321c288270d7b0ce0c8ec8c5f53f09aa8
  rationale: From ὦ Θρασύμαχε through the target, the source maintains one direct dyad; ἔστω, ἔφη is the immediate answer to the preceding question and has no intervening handoff.
```

```yaml
voice_id: voice_republic_0427
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352b
char_span:
  start_char: 54075
  end_char: 54144
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 10379998a7acfb2a098ceb69ca2f1d3244234aa02836fccc30333158f2dfd42a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 54071
    end_char: 54236
    text_sha256: 98df4b29934e1fd1039cb6a72054ee8c0e15dea30e6d9e47afeee43d7154af96
  rationale: The target directly addresses ΘΡΑΣ.; the immediately following response uses first-person ἔγωγέ and σοι toward Socrates. Those adjacent marks bound this Socrates–Thrasymachus exchange without a carried owner.
```

```yaml
voice_id: voice_republic_0428
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352b
char_span:
  start_char: 54149
  end_char: 54235
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 696b274d1ea1f20f979674cdb693e9a796615d82e0be10a20d27908f9f6f10c1
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 54071
    end_char: 54236
    text_sha256: 98df4b29934e1fd1039cb6a72054ee8c0e15dea30e6d9e47afeee43d7154af96
  rationale: ὦ Θρασύμαχε marks the active addressee of the immediately preceding speech; εὐωχοῦ … ἔφη is the contiguous response and retains σοι toward Socrates.
```

```yaml
voice_id: voice_republic_0429
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352b-352d
char_span:
  start_char: 54240
  end_char: 55269
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8ac7e9150e71c9f530d18fd3f1668c6ddeb24e38eda2199b04fc19b3b2a4a71b
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 54248
    end_char: 54257
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0430
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352d
char_span:
  start_char: 55274
  end_char: 55289
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 64ceb03b22507683cc45e91c62dfa481920a8b9fde90562c6c764e9fd1d55ac9
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 54071
    end_char: 55290
    text_sha256: 83f6cc0cbfe1dcb8028ebccf6a8432c51f2fa3a33ecc61d9d66a32d9a16e03da
  rationale: The context opens with Socrates addressing Θρασύμαχε, retains the same dyad through ἦν δ’ ἐγώ and ἀποπλήρωσον ἀποκρινόμενος, and closes with σκόπει δή, ἔφη; no handoff introduces another owner.
```

```yaml
voice_id: voice_republic_0431
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352d
char_span:
  start_char: 55294
  end_char: 55357
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 7fb6a0ef8afad6997740221e7ef24fa5a0e264cb4fc879481976eb41493dec9c
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 55301
    end_char: 55310
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0432
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55369
  end_char: 55376
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 011c325c7f0b53304d0a6a99d81651b7789627a4f6e1963e97e87ec0c5b1a1d5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0433
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55381
  end_char: 55476
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: ddc45c2d0e14eef1f4b4ec56b8cc4c58f0aad57865b16037d810d144b924800a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0434
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55481
  end_char: 55497
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 13a7b30c278e031405d6358ca3bf38469aedf9324140c24c81e2e3521160f92d
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 54071
    end_char: 55498
    text_sha256: 49637fb87082ea80cb13cf779ef328ddfce5abc4794e30e5d47c5c4954d24971
  rationale: The prior source identifies the one dyad as Socrates and Θρασύμαχος; σκοπῶ, ἦν δ’ ἐγώ asks the immediate singular question and οὐ μανθάνω, ἔφη is its response without any handoff.
```

```yaml
voice_id: voice_republic_0435
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55502
  end_char: 55547
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 54b0c770ef7000f74d469fa819f091e13647c8cf089e648a942338365ebaec18
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0436
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55552
  end_char: 55560
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0437
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55565
  end_char: 55593
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 6bed70688e8044a5d40255681df55f2558813bf1a72b33d90508560eb77b7988
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0438
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55598
  end_char: 55606
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1a02d4b8712962cc615e39c04988ae411a1e8af7afca8f67d2718a5616960989
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0439
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55611
  end_char: 55672
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 49ea034ec19914efdf735e084813285a662dd4d91ee4279f1d0d7e606a77127b
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0440
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 352e
char_span:
  start_char: 55677
  end_char: 55685
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0441
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55697
  end_char: 55768
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fc1a95bed567d269932e0b38fcbc1a523b4b581291e2a92449f89b62fec01c95
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0442
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55773
  end_char: 55784
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0443
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55789
  end_char: 55859
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 91530aa2ce884a6bd455655b64a2f9dc6b5ecd0d0bfea32e38ee9cfde5f2cabb
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0444
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55864
  end_char: 55870
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0445
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55875
  end_char: 55913
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1d9e4110466db2b36d04288eaf8fd1b961599b5b462c8e35fe059233eb3f35ec
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0446
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55918
  end_char: 55934
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 825bbace5dc29a70e5e461b2314b6e0864f6f49576ef30579145c36238fe01a9
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0447
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a
char_span:
  start_char: 55939
  end_char: 56077
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c9f3c4306311574b8d040bf47988d88ff3dfebc080329f16d5b45ea2360a636a
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0448
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353a-353b
char_span:
  start_char: 56082
  end_char: 56161
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 33d075b95ab1b1b8bc4a822dd256621a833f6222d341c53525b640f9e6d0965a
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 55935
    end_char: 57573
    text_sha256: b8015cce3bd7d10d4d9eabafa4aa44f8b7874c03943f80e989d9b5d0eee067c0
  rationale: ἀλλά, ἔφη answers the singular-question sequence; εἶεν, ἦν δ’ ἐγώ immediately resumes Socrates, and the same uninterrupted dyad reaches the direct ὦ Θρασύμαχε anchor.
```

```yaml
voice_id: voice_republic_0449
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56166
  end_char: 56314
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 782989747e230192c45deb6c7d837c083589e788ce97680a276b79611d286552
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 56172
    end_char: 56181
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0450
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56319
  end_char: 56325
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c4bd1fa8c201b5419ada7abbd742dc376106ed17056f2b341968b715b9b0d120
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0451
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56330
  end_char: 56363
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 3a1c6568ea55774e51d302ee144d3e150fbc2c749a166634c31c444972eb4c92
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0452
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56368
  end_char: 56378
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4841fd1fe1eb4c3d0dd8f819fbb47b1d0790dc774418fce7d7cff276b50d73fe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0453
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56383
  end_char: 56407
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a6aaffaa54a725831e83d64e5f3f457f1097a682c92ace2856b6da5e1ddcc97c
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0454
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56412
  end_char: 56416
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0455
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56421
  end_char: 56438
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f24d0322b666114040e7010030bf3c3aacef62d3083cd53f7c6f2b1b8b88a916
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0456
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56443
  end_char: 56453
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4841fd1fe1eb4c3d0dd8f819fbb47b1d0790dc774418fce7d7cff276b50d73fe
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0457
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56458
  end_char: 56496
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: f95ff14142ec1c3c337507a96a883805da13f67b9130f4bc7a2bb3ae22efe682
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0458
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b
char_span:
  start_char: 56501
  end_char: 56506
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 86b797ecf5a4ccb006fc67b5d925ee2253ea101d9e75d27df7694397d1cc1af5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0459
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353b-353c
char_span:
  start_char: 56511
  end_char: 56643
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fc6634f18c6678c64db7d4c32ec89f27401ecc3637958139d434e28fbf193542
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0460
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353c
char_span:
  start_char: 56648
  end_char: 56706
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 68d2c1bc21e981381ee2019a5812bf33234bbbc00a709c6bb30615f8cc30028d
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 56507
    end_char: 57573
    text_sha256: 4f0c39233399d5e41de8202fba5d7012ffcce73a6c12931a70de01a648af0427
  rationale: λέγεις targets Socrates and ἥτις, ἦν δ’ ἐγώ immediately supplies his response; the uninterrupted context then reaches ὦ Θρασύμαχε without another handoff.
```

```yaml
voice_id: voice_republic_0461
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353c
char_span:
  start_char: 56711
  end_char: 56852
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 13bf281a04f711345e97b21f8e9b09f9fa1dd0e5c7e7d7b0dd81dbd349bd0a27
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 56717
    end_char: 56726
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```

```yaml
voice_id: voice_republic_0462
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353c
char_span:
  start_char: 56857
  end_char: 56886
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cf35da54ffe1ce0c40b1a742a5deee0b6130bf90db6f1aed29756c813644bc75
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 56707
    end_char: 57573
    text_sha256: c05363362afc503c472ec107128b19a663b64e2060606dd57bc04a107e6bae20
  rationale: ἀληθές … τοῦτό γε λέγεις directly responds to ἥτις, ἦν δ’ ἐγώ; the same uninterrupted dyad reaches ὦ Θρασύμαχε without another handoff.
```

```yaml
voice_id: voice_republic_0463
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353c
char_span:
  start_char: 56891
  end_char: 56966
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: da15650a61a4fb275ab630ad7eb5f7dc1f12175ebec24d4e47da3656dc03be80
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0464
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353c
char_span:
  start_char: 56971
  end_char: 56979
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0465
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 56991
  end_char: 57039
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 62b50ce4044e5c5309a81fea3296ccc9f1b2ad60558ac4a627e0f971c9103fb5
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0466
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57044
  end_char: 57057
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 47c5d98b3f58c9a0d5c5473296b042c3f918a2fc2b26979afaafa94a6348b423
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0467
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57062
  end_char: 57312
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 1c5be324cb3815fe2a0a6d25e299d535ed27eb0854a9a7ca560ac1e358ae0a17
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0468
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57317
  end_char: 57329
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 9ce6c9a4fa521f9df3cb071e0a1a68a8373d6d6ed540a3ed1200b72501f75b72
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0469
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57334
  end_char: 57380
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: bc11b51c37322f59c280e95912cc84399a88a6be8cea0f77834d588d46dc5f7f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0470
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57385
  end_char: 57401
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5a96d8694be74458e53ee0c6c7c98731ab45bad6188c8c1fccfc13c98d2794b7
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 56707
    end_char: 57573
    text_sha256: c05363362afc503c472ec107128b19a663b64e2060606dd57bc04a107e6bae20
  rationale: μάλιστά γ’, ἔφη immediately answers τί δ’ αὖ τὸ ζῆν; within the self-marked Socrates turn and following direct ὦ Θρασύμαχε anchor, with no intervening handoff.
```

```yaml
voice_id: voice_republic_0471
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57406
  end_char: 57447
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: fdf4726ad9370b44614fb1f3825753d0566ff9141c2ac2d9a35e3c84dee14731
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0472
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353d
char_span:
  start_char: 57452
  end_char: 57458
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 2643d9656afc6c09e4b9609d3260f97458aec58920658edd76b5beb92cfe9dbc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0473
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57470
  end_char: 57572
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 8e76639e2d5d7fe63358f65940457c7537ff39c613f1b9433e0e15bfa6f4926a
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 56711
    end_char: 57586
    text_sha256: 491215410aae50d1a31ea294f804ce5daa1b710d74e1ef815664a72b10bc2db3
  rationale: Socrates’ in-context first-person formula opens the continuous dyad. This target directly addresses ΘΡΑΣ. and the immediate ἀδύνατον response follows; no intervening handoff supplies a different owner.
```

```yaml
voice_id: voice_republic_0474
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57577
  end_char: 57586
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 22d71cca773b5fa3310a6126c3f4bf340859be28ba586f1ba0dc93f28a0dc8ff
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0475
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57591
  end_char: 57679
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0b7e1186466b8f6b0e690c957b9edad233b824c05d0372d2bc5b5aec39b7c91f
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0476
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57684
  end_char: 57691
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0477
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57696
  end_char: 57770
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 47d5579d5656e033df70ca5a8e6795f02759e3e41f2ca076950f3ee830eb3de1
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0478
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57775
  end_char: 57793
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e2fa926f65bf955b825b1721ff52d9ed514157348d4eeb6ecde1cf1982a08ef4
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0479
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57798
  end_char: 57870
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 87c49cc0b9f74a65b6a5ce1d8b67e2d76f26ffa8bbf79baddf93964906adfd56
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0480
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 353e
char_span:
  start_char: 57875
  end_char: 57909
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 4d3cd680736e66aaec7f7a5c3d88789d5b46fa0224b08e449b3d2f593395a92b
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 57466
    end_char: 58280
    text_sha256: 7cea7f1cc560a11113240c097b6644bbb1756d590dbda38f69f8aa3448fde045
  rationale: The direct ὦ Θρασύμαχε opening identifies the dyad; φαίνεται … κατὰ τὸν σὸν λόγον responds within it, and the context closes at the reciprocal ὦ Σώκρατες response without another handoff.
```

```yaml
voice_id: voice_republic_0481
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 57921
  end_char: 57985
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 08b3702fd3235cf89863867418275be44d0857d4184bafd4e171ae2007481e98
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0482
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 57990
  end_char: 58001
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0483
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58006
  end_char: 58053
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 5cf41905f7bdb0b2ec4ac2a6d00cbdafad4b7c6642987cd42e75169d12ba6dda
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0484
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58058
  end_char: 58068
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: a4829cd61c37a58138bdfa7b89ad91d5ce02d48e8a44edfed792d35976bfd7de
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 57466
    end_char: 58280
    text_sha256: 7cea7f1cc560a11113240c097b6644bbb1756d590dbda38f69f8aa3448fde045
  rationale: The direct ὦ Θρασύμαχε opening fixes the dyad; ἔστω, ἔφη immediately answers the preceding conclusion and the context remains continuous to reciprocal ὦ Σώκρατες.
```

```yaml
voice_id: voice_republic_0485
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58073
  end_char: 58125
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: c1f5f01a75ec5a845955ebbdab15fcff7f7149e9c663af3140655de7462795d8
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0486
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58130
  end_char: 58141
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΣΩ.
depth: 2
resolution: unresolved
unresolved_reason: The span is a direct-speech segment, but the candidate report supplies no text-internal construction that licenses a terminal owner.
limits: Unreviewed primary candidate. No terminal owner is asserted.
review_status: accepted
```

```yaml
voice_id: voice_republic_0487
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58146
  end_char: 58215
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: e9c78d225b12dae36ecaed034b57579536c313f3adffc2e598ee4c771befd6eb
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The source-bounded review licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 58142
    end_char: 58280
    text_sha256: cf8ec220bb9a28a865ac0f78ca0c0c0dcec425f19cb013c619775943410506a1
  rationale: The target directly addresses ΘΡΑΣ.; the immediate reply directly addresses ΣΩ. This reciprocal pair bounds the Socrates–Thrasymachus handoff without an inherited speaker claim.
```

```yaml
voice_id: voice_republic_0488
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a
char_span:
  start_char: 58220
  end_char: 58280
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 544cfc9f22a1b06c22a7713c392389b38e30453b555b7c46ff162b741fad75cb
voice_chain:
  - ΣΩ.
  - ΘΡΑΣ.
depth: 2
resolution: resolved
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΘΡΑΣ.
  context_span:
    start_char: 58142
    end_char: 58280
    text_sha256: cf8ec220bb9a28a865ac0f78ca0c0c0dcec425f19cb013c619775943410506a1
  rationale: The preceding direct ὦ Θρασύμαχε address and target's direct ὦ Σώκρατες make a reciprocal immediate handoff, not a reused formula antecedent.
```

```yaml
voice_id: voice_republic_0489
source_work: Republic
outer_turn_id: turn_republic_0001
stephanus_span: 354a-354c
char_span:
  start_char: 58285
  end_char: 59067
source_path: raw/plato/greek/republic.txt
source_sha256: ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244
span_sha256: 88e0cb2fb9a1e74419dac4481731f73488fe68e27fe34874f46b4546aee786f2
voice_chain:
  - ΣΩ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 58297
    end_char: 58306
limits: Unreviewed primary candidate. The cited construction mechanically licenses the terminal owner only for this span.
review_status: accepted
```
