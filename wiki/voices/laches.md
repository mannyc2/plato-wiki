# Laches — Voice Ledger

Reported-speech structure for the one outer turn that
`wiki/reported-turn-scopes.json` marks `required` for Laches. This canonical
ledger is reviewed directly against `raw/plato/greek/laches.txt`; accepting it
does not activate a claim-speaker cutover.

`turn_laches_0099` is Socrates' printed turn at 192a-b. Within it, the
conditional `εἰ τοίνυν τίς με ἔροιτο` stages a bounded `{q}` question for an
indefinite questioner. The question is retained as an unresolved child: the
Greek identifies no individual or registered role for `τίς`. Socrates' ensuing
conditional answer remains part of the printed frame, because staged speech for
the printed speaker himself adds no new owner.

## Records

```yaml
voice_id: voice_laches_0001
source_work: Laches
outer_turn_id: turn_laches_0099
stephanus_span: 192a-192b
char_span:
  start_char: 28501
  end_char: 28752
source_path: raw/plato/greek/laches.txt
source_sha256: "a035988ad66603bb28bb451b1b1d53131e572518198a5dbc6f78cb121d97803f"
span_sha256: "4176c28e888e85d16bbb97c317112f42370cc5c6f4af25b54a70b837caedaad4"
voice_chain: ["ΣΩ."]
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: "ΣΩ."
    start_char: 28501
    end_char: 28504
review_status: accepted
```

```yaml
voice_id: voice_laches_0002
source_work: Laches
outer_turn_id: turn_laches_0099
stephanus_span: 192a
char_span:
  start_char: 28530
  end_char: 28603
source_path: raw/plato/greek/laches.txt
source_sha256: "a035988ad66603bb28bb451b1b1d53131e572518198a5dbc6f78cb121d97803f"
span_sha256: "2e0c65fea87eeff3ae7cdaa90610e309bf03cbba93b96284e596869757893c21"
voice_chain: ["ΣΩ."]
depth: 2
resolution: unresolved
unresolved_reason: "The introducing construction εἰ τοίνυν τίς με ἔροιτο at 28506-28529 stages the {q}-bounded question for an indefinite τις. Its vocative ὦ Σώκρατες identifies the addressee, while εἴποιμ’ ἂν αὐτῷ makes Socrates the answerer; neither construction names the questioner or supplies a registered role."
review_status: accepted
```
