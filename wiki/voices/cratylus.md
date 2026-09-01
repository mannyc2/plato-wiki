# Cratylus — Voice Ledger

Greek-only reported-speech structure for the two outer turns marked required in
`wiki/reported-turn-scopes.json`: `turn_cratylus_0003` and
`turn_cratylus_0528`. The depth-1 records preserve each turn's printed siglum;
the deeper records retain only the source-bounded recalled utterances below it.

All seven records are accepted as two atomic cohorts under
`wiki/review/2026-08-16-cratylus-reported-turn-acceptance.md`. This standalone
ledger neither activates a voice cutover nor creates a voice join.

## Records

```yaml
voice_id: voice_cratylus_0001
source_work: Cratylus
outer_turn_id: turn_cratylus_0003
stephanus_span: 383a-383b
char_span:
  start_char: 85
  end_char: 729
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 28ec9b575fe861211b99307fa3fef5f7bd944931a66632879f7cd45087a93244
voice_chain:
  - ΕΡΜ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΕΡΜ.
    start_char: 85
    end_char: 89
limits: The printed siglum opens Hermogenes' outer turn; it does not assign the recalled exchange below to him by default.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0002
source_work: Cratylus
outer_turn_id: turn_cratylus_0003
stephanus_span: 383b
char_span:
  start_char: 468
  end_char: 497
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 5599a7b4086634a73791761e7633de8fbb8603a900a7f39bee47cdf96bc09172
voice_chain:
  - ΕΡΜ.
  - ΕΡΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: ἔφην
    start_char: 493
    end_char: 497
limits: Hermogenes' first-person reporting formula lies inside the bounded recalled question and licenses the adjacent repeated terminal.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0003
source_work: Cratylus
outer_turn_id: turn_cratylus_0003
stephanus_span: 383b
char_span:
  start_char: 499
  end_char: 525
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 422e8d5553faf7549a1bc6588e9068e40f573e14d7100b214d187657bae7903b
voice_chain:
  - ΕΡΜ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    role: cue
    text: ἦ δ’ ὅς
    start_char: 518
    end_char: 525
    antecedent_text: αὐτὸν ἐγὼ εἰ αὐτῷ Κρατύλος
    antecedent_start_char: 383
    antecedent_end_char: 409
limits: The pronoun in the reporting formula is anchored to the same-sentence named Cratylus antecedent, not to a preceding formula's speaker.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0004
source_work: Cratylus
outer_turn_id: turn_cratylus_0003
stephanus_span: 383b
char_span:
  start_char: 527
  end_char: 630
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 22392085c093cb517f0b4fb17853c76b48d1df0709f1b1b55798dfebd9e5f32e
voice_chain:
  - ΕΡΜ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΕΡΜ.
  - ΚΡ.
unresolved_reason: The q-bounded question has no local owner-bearing formula. The adjacent ἔφην and ἦ δ’ ὅς cannot be carried forward or alternated into an attribution.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0005
source_work: Cratylus
outer_turn_id: turn_cratylus_0003
stephanus_span: 383b
char_span:
  start_char: 631
  end_char: 728
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 35c4aa4400e3927841ae276bba534edda62e2a0e950dbb982cc39ef94e5d273a
voice_chain:
  - ΕΡΜ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    role: cue
    text: ἦ δ’ ὅς
    start_char: 661
    end_char: 668
    antecedent_text: αὐτὸν ἐγὼ εἰ αὐτῷ Κρατύλος
    antecedent_start_char: 383
    antecedent_end_char: 409
limits: The parenthetical anaphoric formula sits between the two q-marked portions of one response and is anchored to named Cratylus, not to Hermogenes' preceding formula.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0006
source_work: Cratylus
outer_turn_id: turn_cratylus_0528
stephanus_span: 421c
char_span:
  start_char: 76286
  end_char: 76340
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: 4ed330f5fe982212d10105d425ae8a9e5e614ee56c3fb253bb650621f361c6a9
voice_chain:
  - ΣΩ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΣΩ.
    start_char: 76286
    end_char: 76289
limits: The printed siglum opens Socrates' outer turn; it does not determine the bounded recalled question below.
review_status: accepted
```

```yaml
voice_id: voice_cratylus_0007
source_work: Cratylus
outer_turn_id: turn_cratylus_0528
stephanus_span: 421c
char_span:
  start_char: 76290
  end_char: 76331
source_path: raw/plato/greek/cratylus.txt
source_sha256: 8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca
span_sha256: ae64c3486e68a914b40efbeceb088ec7c72f3ad0a9fb9edb8dba0e8678a8f664
voice_chain:
  - ΣΩ.
  - ΕΡΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: λέγεις
    start_char: 76325
    end_char: 76331
limits: The source's second-person λέγεις attributes this bounded recalled question to Hermogenes; the accepted scope census retains this turn as a required reported-speech case.
review_status: accepted
```
