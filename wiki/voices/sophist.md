# Sophist — Voice Ledger

Reported-speech structure for the two outer turns marked `required` in
`wiki/reported-turn-scopes.json`. This ledger is reviewed directly against
`raw/plato/greek/sophist.txt`; it records the collective 244b reply and the
258d bounded verse without a claim-speaker cutover.

All four records are accepted as one atomic cohort under
`wiki/review/2026-08-16-sophist-reported-turn-acceptance.md`.

## Records

```yaml
voice_id: voice_sophist_0001
source_work: Sophist
outer_turn_id: turn_sophist_0592
stephanus_span: 244b
char_span:
  start_char: 54513
  end_char: 54616
source_path: raw/plato/greek/sophist.txt
source_sha256: 4e856d5f7b7c4d870fd0fbce7c61060fd9c85e6c708ba39d6f18b329cb4ebbeb
span_sha256: db54789d09984bb7c930757dd416256336fefbc07553f90a92b8ffc7da5cd83e
voice_chain:
  - ΞΕ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΞΕ.
    start_char: 54513
    end_char: 54516
limits: The printed Stranger frame contains a staged question and its separately recorded collective reply.
review_status: accepted
```

```yaml
voice_id: voice_sophist_0002
source_work: Sophist
outer_turn_id: turn_sophist_0592
stephanus_span: 244b
char_span:
  start_char: 54579
  end_char: 54598
source_path: raw/plato/greek/sophist.txt
source_sha256: 4e856d5f7b7c4d870fd0fbce7c61060fd9c85e6c708ba39d6f18b329cb4ebbeb
span_sha256: c2d19c94a388afe095fbd58ac7c7df0ade90311173e0445f315b1d79f8499f6d
voice_chain:
  - ΞΕ.
depth: 2
resolution: unresolved
unresolved_reason: φήσουσιν attributes `{q} φαμὲν γάρ, {/q}` to the plural τῶν ἓν τὸ πᾶν λεγόντων, not to an individually registered terminal owner.
review_status: accepted
```

```yaml
voice_id: voice_sophist_0003
source_work: Sophist
outer_turn_id: turn_sophist_0956
stephanus_span: 258d
char_span:
  start_char: 83785
  end_char: 83920
source_path: raw/plato/greek/sophist.txt
source_sha256: 4e856d5f7b7c4d870fd0fbce7c61060fd9c85e6c708ba39d6f18b329cb4ebbeb
span_sha256: 42a4dc8a09ec5a620a53ba6b6f381ce2a95d700ea5ae4087d279ec8a13d9f697
voice_chain:
  - ΞΕ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΞΕ.
    start_char: 83792
    end_char: 83795
limits: The printed Stranger frame does not assign the bounded verse below to itself.
review_status: accepted
```

```yaml
voice_id: voice_sophist_0004
source_work: Sophist
outer_turn_id: turn_sophist_0956
stephanus_span: 258d
char_span:
  start_char: 83817
  end_char: 83919
source_path: raw/plato/greek/sophist.txt
source_sha256: 4e856d5f7b7c4d870fd0fbce7c61060fd9c85e6c708ba39d6f18b329cb4ebbeb
span_sha256: 053e9fefa68e9eb50205d0141261273b7b655f3400f2ba68aba0dfcd8495058d
voice_chain:
  - ΞΕ.
depth: 2
resolution: unresolved
unresolved_reason: Παρμενίδῃ and ὁ μέν πού φησιν identify the bounded verse's source owner, but no Sophist terminal owner is registered.
review_status: accepted
```
