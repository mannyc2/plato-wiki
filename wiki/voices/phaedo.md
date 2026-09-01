# Phaedo — Voice Ledger

Reported-speech structure for `turn_phaedo_0027` (59c–88c),
`turn_phaedo_0031` (89a–102a) and `turn_phaedo_0035` (102a–118a) —
every turn the census found to carry speech nested below its printed siglum.
Produced by `scripts/voices-2026-07/build-phaedo-voice-ledger.ts`.

All 593 records are `accepted` as one atomic review cohort, under the Phaedo discourse attribution review on
2026-07-26. This reviewed ledger can serve as input to a derived-layer
compilation, but no claim speaker changes: Phaedo is absent from
`derived/plato/voices/cutovers.toml`, and activation is a separate plan — see
`docs/voices-protocol.md`. The generator still emits only `unreviewed`
candidates and refuses to overwrite this accepted live cohort.

The adjudication behind the cohort is recorded in three review notes under
`wiki/review/`, dated 2026-07-26: the explicit-formula adjudication, and one
discourse adjudication per narration turn.

Phaedo narrates in direct speech, so most transmitted utterances carry only a
bare third-person `ἔφη` or `ἦ δ’ ὅς`. Two things follow, and they are not the
same thing. A bare reporting verb supplies no owner by itself — no record here
is resolved from one, and none uses the `anchored_dialogue_turn` kind that a
bounded two-party exchange licenses in the Symposium. But the absence of a name
inside a paragraph is not ambiguity either: the surrounding Greek routinely
fixes a speaker through the addressee, grammatical person, and the bounds of a
local exchange.

All three turns carry both layers, and every record says which one it rests on.
Explicit formulas resolve what they resolve and keep their byte-verifiable
`evidence_refs`. Every other unit carries a `reviewed_attribution` instead: a
structural adjudication over a bounded, hashed Greek context, with the locally
plausible owners named before resolution and the structural ground stated.

The distinction is not decoration. A reader can always separate what the text
says outright from what a review concluded, and can refuse the second without
touching the first.

An earlier pass over `turn_phaedo_0027` resolved a unit only when that unit's own
paragraph carried a naming formula, and reported 288 of its 350 records as
unresolved. That number measured the extractor. Reviewed in sequence, the same
Greek resolves every one of the 286 units that carry no formula, and across all
three turns two independent passes disagreed about no speaker anywhere. Three
records remain genuinely unresolved, and each says what it is ambiguous between
and why.

No owner in any turn comes from doctrine, philosophical content, style,
register, vocabulary, a translation, an editor's label, or blind alternation.

Blocks of pure narration carry no deeper record, so their characters stay with
the printed turn speaker. Two utterances inside `turn_phaedo_0031`, at 91e and
102a, are reported with a third-person DUAL verb: the Greek asserts that Simmias
and Cebes spoke them jointly. `voice_chain` terminates in one owner, so by the
ruling of 2026-07-26 they carry no depth-2 record. That is a known schema gap,
not a resolution and not an ambiguity.

## Records

```yaml
voice_id: voice_phaedo_0001
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 59c-88c
char_span:
  start_char: 4681
  end_char: 74605
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 255b7a65e7fba2f4a6cbd66c73f8dd4af86e6641b51aa57fd3c2ec940a39baac
voice_chain:
  - ΦΑΙΔ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙΔ.
    start_char: 4681
    end_char: 4686
limits: Records that the printed siglum opens this turn. It does not establish that Phaedo is the owner of any statement inside the conversation he reports.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0002
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 59e
char_span:
  start_char: 5523
  end_char: 5640
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 63e343b8890404a37876badd62525e481395d460a6b8b338c82867aceda3b68d
voice_chain:
  - ΦΑΙΔ.
  - ΘΥΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: ἐξελθὼν ὁ θυρωρός, ὅσπερ εἰώθει ὑπακούειν, εἶπεν
    start_char: 5416
    end_char: 5464
limits: The doorkeeper is the nominative subject of εἶπεν in the immediately preceding narration, and the bare ἔφη at [5544, 5547) printed between the two quoted stretches carries no competing subject. The source describes him by role and never names him; ΘΥΡ. is the registry's identifier for that role, not a name the text prints.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0003
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 60a
char_span:
  start_char: 6002
  end_char: 6097
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9f872d1e24dd18e6fa575e1f56df8ff4e8474dea6df207c3b597a9858616d7d1
voice_chain:
  - ΦΑΙΔ.
  - ΞΑΝΘ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἡ {pers} Ξανθίππη {/pers} , ἀνηυφήμησέ τε καὶ τοιαῦτ’ ἄττα εἶπεν
    start_char: 5903
    end_char: 5967
limits: The formula names Xanthippe as the nominative subject of εἶπεν and the quoted words follow its ὅτι. It establishes nothing about the narration around the quote.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0004
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 60a
char_span:
  start_char: 6168
  end_char: 6242
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 817b5efcc921bc6f52e73f8f389ccf908c73582f38394ff4d353eccdff98f1bf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} βλέψας εἰς τὸν {pers} Κρίτωνα {/pers} ,
    start_char: 6098
    end_char: 6167
limits: The immediately preceding formula names Socrates as the subject of the reporting verb. The span covers both quoted stretches and the bare ἔφη printed between them; it establishes nothing about the surrounding narration.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0005
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 60b-60c
char_span:
  start_char: 6461
  end_char: 7174
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 59ed152a3dbd66f8646720d00ff4989b7ee6387e9ec64f76c8927586fd3ab832
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ δὲ {pers} Σωκράτης {/pers} ἀνακαθιζόμενος εἰς τὴν κλίνην συνέκαμψέ τε τὸ σκέλος καὶ ἐξέτριψε τῇ χειρί, καὶ τρίβων ἅμα, ὡς ἄτοπον, ἔφη
    start_char: 6340
    end_char: 6475
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0006
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 60c-60d
char_span:
  start_char: 7216
  end_char: 7739
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 72b96927db5fcabd90c6f746415b30b48a4b160a98d2b7870354174d1477ab49
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ οὖν {pers} Κέβης {/pers} ὑπολαβών, νὴ τὸν {pers} Δία {/pers} , ὦ {pers} Σώκρατες {/pers} , ἔφη
    start_char: 7179
    end_char: 7275
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0007
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 60d-61c
char_span:
  start_char: 7744
  end_char: 9375
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 22772b9223a4c71068e0923f2e4d92d377bce073cf6be7900c90012711fb7a84
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 7175
    end_char: 9595
    text_sha256: 4113241ee39fee11ffc9a16c65714072f2ed96f104bca940bfc93de58bfe2f78
  rationale: The unit answers the anchored request of Cebes at unit 2 (εἰπὲ τί χρὴ λέγειν) and opens with the vocative ὦ Κέβης, which excludes Cebes; ἔφη is third person, excluding the narrator Phaedo. Inside the quoted speech the recurring dream addresses the speaker as ὦ Σώκρατες and he speaks in the first person as the maker of the poems (ἐποίησα ταῦτα), and the anchored Simmias at unit 4 replies οἷον παρακελεύῃ ... ὦ Σώκρατες, Εὐήνῳ, taking this very utterance as spoken by Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0008
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61c
char_span:
  start_char: 9411
  end_char: 9594
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1095b4cf40aa459639c2f71bf0f98ca5ed06746758fb78a369495bb161750834
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σιμμίας {/pers} , οἷον παρακελεύῃ, ἔφη
    start_char: 9380
    end_char: 9431
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0009
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61c
char_span:
  start_char: 9599
  end_char: 9651
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8177282a4926c0baf7ae39c38f1ee86ae1086035e6b8430dab76da1ec22cbcd5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 9376
    end_char: 10137
    text_sha256: e68261d54a9a46d93695bdff35d0535f98f26c3f259efc1a09c096e6d4751003
  rationale: ἦ δ’ ὅς is third person singular and excludes the narrator Phaedo, and the anchored answer at unit 6 (ἔφη ὁ Σιμμίας) excludes Simmias as the questioner. The question responds to Simmias' remark of unit 4, which is addressed ὦ Σώκρατες, and the same speaking thread continues into unit 7, whose θεμιτόν is quoted back by the anchored Cebes at unit 8 in a question put ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0010
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61c
char_span:
  start_char: 9656
  end_char: 9700
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8547da9cf48d907abdd28b9775db6b6d65508083cbf9a62bf113643bec78cc54
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 9670
    end_char: 9698
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0011
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61c-61d
char_span:
  start_char: 9705
  end_char: 9954
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ff087af352c9a0da968cabb67a85604ef1718323adb4520494e0ae0533872948
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 9595
    end_char: 10137
    text_sha256: 226c5c66a68ee70d34ec7916764e5fab8321867108dd1aa2da9973d9566a8852
  rationale: The unit completes the exchange opened at unit 5 by taking up Simmias' anchored ἔμοιγε δοκεῖ of unit 6, so it belongs to the questioner, not to Simmias. The anchored Cebes at unit 8 then asks αὐτόν, ὦ Σώκρατες, πῶς τοῦτο λέγεις ... τὸ μὴ θεμιτὸν εἶναι ἑαυτὸν βιάζεσθαι, a verbatim echo of this unit's βιάσεται αὑτόν ... οὐ γάρ φασι θεμιτὸν εἶναι, fixing its speaker as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0012
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61d
char_span:
  start_char: 10000
  end_char: 10136
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ede7c13595fcc7951b278f0e403b55b27293e1cca7c9b7d48063e3e42e9f5ac8
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: "ἤρετο οὖν αὐτὸν ὁ {pers} Κέβης {/pers} :"
    start_char: 9959
    end_char: 9999
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0013
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61d
char_span:
  start_char: 10141
  end_char: 10273
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ed112979f70d2ffe7c87deeb905ee10c0118a901918cc8a5bca7f61d1b112566
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 9701
    end_char: 10322
    text_sha256: 1bf639f01871d017221c746f1bb1444fdcd23b33a87c6f6741c4f9b07952b63e
  rationale: This is the reply to the anchored question of Cebes at unit 8, which is addressed ὦ Σώκρατες, and its own vocative ὦ Κέβης excludes Cebes while the third-person naming of Simmias in σύ τε καὶ Σιμμίας excludes Simmias. It also defends the claim of unit 7, whose speaker the anchored unit 8 identifies as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0014
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61d
char_span:
  start_char: 10278
  end_char: 10321
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8931f8f6f6b8d6a68a81a9005d43017fb1f85d1cdba8a7c05f553f1f8f5c1fd0
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 9955
    end_char: 11439
    text_sha256: 1a8491fc523defed03f552687413c8da882bdaa9d44f1e56bea47db48a694035
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and the answer belongs to one of the two men named in the question of unit 9, σύ τε καὶ Σιμμίας. Unit 12 restates this answer in the first person (σαφὲς δὲ περὶ αὐτῶν οὐδενὸς πώποτε οὐδὲν ἀκήκοα) while claiming the σύ of unit 9 (ὅπερ νυνδὴ σὺ ἤρου), and the second-person reply at unit 13 is answered by the anchored Cebes at unit 14, so the speaker of unit 10 is Cebes. the question expressly names Simmias as a co-addressee, and only the lexical echo through unit 12 keeps him out.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0015
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61d-61e
char_span:
  start_char: 10326
  end_char: 10631
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b56e976e198bf470302a56e14d83287d805c87b6108b175b6f4de371530384a7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 10137
    end_char: 11331
    text_sha256: 40f7b81b3fc871c1c4dae03292ba51968bfcc79e85b5730629d91e064a8f0bb2
  rationale: The unit answers the οὐδέν γε σαφές of unit 10 by offering what its speaker has himself heard, so it belongs to the questioner of unit 9, whom the anchored unit 8 addresses ὦ Σώκρατες. Unit 12 then takes up that offer with a question addressed ὦ Σώκρατες and refers back to ὅπερ νυνδὴ σὺ ἤρου, confirming that the same man asked at unit 9 and offered here.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0016
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 61e
char_span:
  start_char: 10636
  end_char: 10924
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 61ee244a84cde93ac0d8c95b68ae6a04dd9b5cb42cd98f3a9e71cb826d974d6d
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 10137
    end_char: 11943
    text_sha256: 4b24d87ecf318a3a5e9345b753c3c82c8b9175f2a18de9d9a421b7af133bbd70
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and ὅπερ νυνδὴ σὺ ἤρου claims the speaker as the σύ questioned at unit 9, where Simmias is named in the third person. The second-person reply at unit 13 (σοι φανεῖται, σοι φαίνεται) is met by the anchored Cebes at unit 14 and continued by the anchored Socrates at unit 15 with ὦ Κέβης ... ἢ σοὶ οὐ δοκεῖ οὕτως, so the addressee across the thread, and hence the speaker here, is Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0017
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62a
char_span:
  start_char: 10935
  end_char: 11330
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fbb97c3837affca208dde765293330a6caab3baaf94eb0e0ea7117b5430f6d3d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 10632
    end_char: 11943
    text_sha256: 5db852b744c4fd6b5acbdd6d47ab653daa55d1df85a51284c59a2d5fe220369a
  rationale: ἔφη excludes the narrator Phaedo, and the unit answers the question of unit 12 put ὦ Σώκρατες, addressing its asker in the second person (ἀκούσαις, σοι φανεῖται). The anchored Cebes at unit 14 replies to it and the anchored Socrates at unit 15 continues the same point (οὕτω γ’ εἶναι ἄλογον), which places this unit in the Socrates half of the exchange.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0018
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62a
char_span:
  start_char: 11380
  end_char: 11410
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 48f806a20f3765a650d3f6170de9418f517ded39459eb6b7753827f11efd8188
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Κέβης {/pers} ἠρέμα ἐπιγελάσας, Ἴττω {pers} Ζεύς {/pers} , ἔφη
    start_char: 11335
    end_char: 11410
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0019
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62b
char_span:
  start_char: 11443
  end_char: 11942
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 22911291a4b4ebd07261e3dd2398b0643e53569d119b67a2c93c1ca748018ddd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 11463
    end_char: 11492
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0020
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62b
char_span:
  start_char: 11947
  end_char: 11985
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c7a5539064b6b70d5580734434c2e55597b50986e916755979406dd8926c7066
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φησὶν ὁ {pers} Κέβης {/pers}
    start_char: 11955
    end_char: 11983
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0021
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62c
char_span:
  start_char: 11996
  end_char: 12178
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 00107818d7b526d751183f844c1899d9a6dbfa193ea5b819c97f50856ed782c9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 11439
    end_char: 13301
    text_sha256: 3c24fccab0e0f2707916a07f4e65477671cb675800ae57520fb3e814d240c1f2
  rationale: ἦ δ’ ὅς excludes the narrator Phaedo, and the unit continues the second-person questioning of the anchored Socrates at unit 15 (ἢ σοὶ οὐ δοκεῖ οὕτως) after the anchored assent of Cebes at unit 16, so its addressee, not its speaker, is Cebes. The anchored Cebes at unit 20 then answers the conclusion drawn from it with ὦ Σώκρατες and ὃ μέντοι νυνδὴ ἔλεγες, keeping the questioner Socrates throughout.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0022
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62c
char_span:
  start_char: 12183
  end_char: 12196
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 26895a1800a97f5d80fb47e17abfab1efc2a8e532273b21078fdafe4c13ca563
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 11439
    end_char: 13301
    text_sha256: 3c24fccab0e0f2707916a07f4e65477671cb675800ae57520fb3e814d240c1f2
  rationale: ἔφη excludes the narrator Phaedo, and the unit is the bare assent to the second-person question of unit 17 (καὶ σὺ ἂν τῶν σαυτοῦ κτημάτων), whose addressee is fixed as Cebes by the anchored vocative ὦ Κέβης at unit 15 and the anchored assents of Cebes at units 16 and 20 that bracket the exchange.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0023
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62c
char_span:
  start_char: 12201
  end_char: 12332
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 32959da10ced6491c50b1f3f7f9cb887846ab7929ea23290fc12a7a690f27085
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 11992
    end_char: 13301
    text_sha256: e9fa1a9c91a79eeb76119139078b6dc51c5327718b6d61d15b60f034f139bac1
  rationale: The unit draws the inference from the question of unit 17 and the assent of unit 18, so it belongs to the questioner rather than to the assenter. The anchored Cebes at unit 20 answers it with ἀλλ’ εἰκός ... τοῦτό γε φαίνεται, echoing this unit's οὐκ ἄλογον, and addresses that previous speaker as ὦ Σώκρατες while quoting his earlier ὃ νυνδὴ ἔλεγες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0024
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 62c-62e
char_span:
  start_char: 12337
  end_char: 13300
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3f49618c97c62ab2d94c67ef8492413c55c9be3c2413a8934097e64f66326e7a
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 12349
    end_char: 12375
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0025
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63a
char_span:
  start_char: 13421
  end_char: 13546
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: eb69d5d9d700a2dc7478a0d1260a335df906f6713fe780d668e68e97666e6d1e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἀκούσας οὖν ὁ {pers} Σωκράτης {/pers} ἡσθῆναί τέ μοι ἔδοξε τῇ τοῦ {63a} κέβητος πραγματείᾳ, καὶ ἐπιβλέψας εἰς ἡμᾶς, ἀεί τοι, ἔφη
    start_char: 13305
    end_char: 13433
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0026
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63a
char_span:
  start_char: 13582
  end_char: 13944
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fd05c6373aa9dc1ba02f04f01f7927467317661f94dc9359f825219da35f0bc3
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σιμμίας {/pers} , ἀλλὰ μήν, ἔφη
    start_char: 13551
    end_char: 13595
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0027
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63b
char_span:
  start_char: 13955
  end_char: 14054
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7d046f48041d2f1426dc75c6778048ea51cb3926c720dbf958e4b3b980ac960e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 12333
    end_char: 14816
    text_sha256: 32a320c4acc0db1f2e917aa58d54ddf0a4f9a5eab31d3674f85fc2e3c2e5970d
  rationale: The second-person plural λέγετε and ὑμᾶς address the two men who have just spoken, the anchored Cebes at unit 20 and the anchored Simmias at unit 22, excluding both; ἔφη excludes the narrator Phaedo. Simmias at unit 22 addresses his charge ὦ Σώκρατες and says Cebes aims his argument εἰς σέ, so the man who says he must now defend himself is Socrates, as unit 25 confirms by resuming the same ἀπολογήσασθαι.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0028
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63b
char_span:
  start_char: 14059
  end_char: 14103
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fe45eedaefd95e999f53885f507c7514485bba5cb0c48c527b84ef7ca4758732
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 14073
    end_char: 14101
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0029
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63b-63c
char_span:
  start_char: 14108
  end_char: 14815
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: defbfb336f4563ca572c22e1894d8d23575df9f1a13f3d128a97b9f3654eaab8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 13951
    end_char: 15082
    text_sha256: 63b720fa4a64def7b744f0f608b1f1bb0cb37562f8d4ff7dd5014693c46ea166
  rationale: The unit resumes its own πρὸς ταῦτα ἀπολογήσασθαι from unit 23 after the anchored assent of Simmias at unit 24, and its vocative ὦ Σιμμία τε καὶ Κέβης excludes both of them; ἦ δ’ ὅς and ἔφη exclude the narrator Phaedo. The anchored Simmias at unit 26 replies ὦ Σώκρατες, taking up this speaker's own εὔελπίς εἰμι as αὐτὸς ἔχων τὴν διάνοιαν ταύτην.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0030
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63c-63d
char_span:
  start_char: 14820
  end_char: 15081
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5713967f05b1eab9efab2ed4c94d486a2d3d25b821e13eae3980c81fd7f8683f
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 14828
    end_char: 14856
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0031
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63d
char_span:
  start_char: 15086
  end_char: 15201
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a947a2e9e2657a15b5bac9a6a3295105b7e8e28d8574828cace87d522e0603ae
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 14816
    end_char: 15552
    text_sha256: f08a6515ee0ec2def48f9b1a5fa0554aaf5f0d660cbf338f20b9ec38fc8bba96
  rationale: The unit grants the request of the anchored Simmias at unit 26 (ἢ κἂν ἡμῖν μεταδοίης) with πειράσομαι, so it is not Simmias; ἔφη excludes the narrator Phaedo, and Crito is named in the third person as Κρίτωνα τόνδε. The anchored Crito at unit 28 answers this very remark with τί δέ, ὦ Σώκρατες, which fixes the speaker as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0032
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63d-63e
char_span:
  start_char: 15206
  end_char: 15551
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 967196d5176adbdc3475494ca3b3f14704f26cae4547868b6f2a33fcc5366848
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κρίτων {/pers}
    start_char: 15241
    end_char: 15268
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0033
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63e
char_span:
  start_char: 15588
  end_char: 15686
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3cf9e45c783214e9934cd75e16809a6d41814c58f7040ab81729f1fb26549f7f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} , ἔα, ἔφη
    start_char: 15556
    end_char: 15595
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0034
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63e
char_span:
  start_char: 15691
  end_char: 15777
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8304c084b23997fac3ea957efcc47a481cea7d74830c69a862f70f9ac61400fa
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κρίτων {/pers}
    start_char: 15715
    end_char: 15742
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0035
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 63e-64a
char_span:
  start_char: 15782
  end_char: 16135
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 66edd8be27ccbf36ef6cf3661ffd265f7a2762c0584cc0d867c993df83036155
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΡ.
  context_span:
    start_char: 15552
    end_char: 16136
    text_sha256: 6bce25a5ce0900cf5ac7ed0c774530b7c17117adab9db95775100c11710903a0
  rationale: Unit 30 is the anchored Crito renewing his complaint about the man with the drug, and this unit dismisses him with ἔα αὐτόν, resuming verbatim the ἔα, ἔφη, χαίρειν αὐτόν of the anchored Socrates at 29; 3sg ἔφη excludes the narrator, and the vocative ὦ Σιμμία τε καὶ Κέβης excludes those two as speakers.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0036
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64a
char_span:
  start_char: 16140
  end_char: 16453
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a5e22686516132febc8a0eda13cff9f00c176220f0ac53e799ca1fecf4ecf46f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 15778
    end_char: 16861
    text_sha256: 0f7c43e103090a43250a04a8a01696d92a3648d0e0864d78fce10a471d639a77
  rationale: There is no reporting verb and an explanatory γάρ, continuing the λόγος that unit 31 announced with ἐγὼ πειράσομαι φράσαι. The anchored Simmias at 33 then replies with the vocative ὦ Σώκρατες and quotes this unit's wording back (λεληθέναι τοὺς ἄλλους answered by σφᾶς γε οὐ λελήθασιν), fixing the speaker of 31-32 as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0037
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64a-64b
char_span:
  start_char: 16496
  end_char: 16860
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75a834e43528d94f285ec442be69cc3af5df1ef5029e66526c8688aceb311073
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σιμμίας {/pers} γελάσας, νὴ τὸν {pers} Δία {/pers} , ἔφη
    start_char: 16458
    end_char: 16527
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0038
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64b-64c
char_span:
  start_char: 16865
  end_char: 17146
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 95ffa11290e327098434efbdce475c857eb73ebbce9647ef6e8ca2937b7ef14e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 16136
    end_char: 17200
    text_sha256: c7b4afb593ba58aa2ef8e3486c1a10b6b798e9c9d28eb2557bff85b3964904c7
  rationale: "The unit answers the anchored Simmias of 33 term for term: ἀληθῆ γ’ ἂν λέγοιεν picks up his τοὺς πολλοὺς ... συμφάναι ἄν, and πλήν γε τοῦ σφᾶς μὴ λεληθέναι picks up his σφᾶς γε οὐ λελήθασιν. The vocative ὦ Σιμμία excludes Simmias and 3sg ἔφη excludes the narrator, leaving the speaker of unit 32."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0039
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64c
char_span:
  start_char: 17151
  end_char: 17199
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fc9de0f199de3bd6149efcc46d8156bd84eb1ab72935d6416122db733b620382
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὑπολαβὼν ὁ {pers} Σιμμίας {/pers}
    start_char: 17160
    end_char: 17197
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0040
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64c
char_span:
  start_char: 17204
  end_char: 17479
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 64bbbfa7ee73695b7471f62e47d790c21986657349d8a77f924861511491f1ca
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 16861
    end_char: 17506
    text_sha256: 57af40720383d3512eaf9bbcf32ceb040d37441c6053b804ca8f22593f789d77
  rationale: This is the questioner's own follow-up to the question he put at 34, ἡγούμεθά τι τὸν θάνατον εἶναι, restated here as ἆρα μὴ ἄλλο τι ᾖ ὁ θάνατος ἢ τοῦτο. It is asked across the anchored assent of Simmias at 35, so the anchored answerer is excluded and the asker of 34 continues.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0041
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64c
char_span:
  start_char: 17484
  end_char: 17505
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e2680a0e421c1191f8b6da120b33f12e6707818e7a5f7e7e53e3de2b19adf6f5
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 17147
    end_char: 17828
    text_sha256: 1bc9a717cdf4bf81498ea918b09bd4fcbed00d7379eef44773136c3161b9618e
  rationale: οὔκ, ἀλλὰ τοῦτο answers the ἆρα μὴ ἄλλο τι question of 36, so the speaker is the addressee, not the questioner; 3sg ἔφη excludes the narrator. The answering role here is anchored to Simmias immediately before at 35 and immediately after at 39, bounding the exchange at both ends.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0042
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64c-64d
char_span:
  start_char: 17510
  end_char: 17756
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 39f1d8237f9f3ebd5aec08af7a04fe0c3dae4aab28ff6fd4911250aa52a7509d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 17506
    end_char: 17828
    text_sha256: 258a17c8448c94257f2ed3158165a3908b835c19479078279a89f15c8901b363
  rationale: The question is answered at 39 by the anchored Simmias with the vocative ὦ Σώκρατες, which fixes this questioner as Socrates. The 2sg σοί and the singular address ὠγαθέ show one interlocutor is being questioned.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0043
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64d
char_span:
  start_char: 17761
  end_char: 17827
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bedc9dbcf8c97a5477101cc0ac478b578ddec5b6eb05df6b511bdaadd563b45e
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 17797
    end_char: 17825
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0044
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64d
char_span:
  start_char: 17832
  end_char: 17857
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a18968c4954c3394c543711c1a06eef5482010172510b01e10c6bc063ec39cea
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 17506
    end_char: 17871
    text_sha256: 0b321846b9ce439dec509d1338d8bde513235b55c32e7c175fe6e59a0dd5f07a
  rationale: The elliptical τί δὲ τὰς τῶν ἀφροδισίων has no verb of its own and completes the syntax of 38 (φαίνεταί σοι ... ἐσπουδακέναι περὶ τὰς ἡδονάς ... οἷον σιτίων καὶ ποτῶν), so it is the same asker, fixed as Socrates by the ὦ Σώκρατες of the anchored reply at 39.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0045
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64d
char_span:
  start_char: 17862
  end_char: 17870
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1a02d4b8712962cc615e39c04988ae411a1e8af7afca8f67d2718a5616960989
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 17757
    end_char: 17871
    text_sha256: 812d72f310f683779cda1ed4e02ee4e581b02bef1b74867ded37f236844d694b
  rationale: οὐδαμῶς answers the elliptical question of 40 and so belongs to the addressee. That addressee is the Simmias anchored one unit earlier at 39 and named ὦ Σιμμία by the same questioner at 48.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0046
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64d-64e
char_span:
  start_char: 17875
  end_char: 18138
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f00de6718685944842f9d693a3097dfa3279ef8accb92b4e54b905c31e894dfd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 17757
    end_char: 18198
    text_sha256: d55fb696d8fb5153fac69b8dfc4034227a16a8ecd2f52cef5bbc322bc1937325
  rationale: Third member of the one τί δέ series begun at 38 and continued at 40, again with 2sg δοκεῖ σοι. The asker of that series is fixed as Socrates by the vocative ὦ Σώκρατες in the anchored reply at 39.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0047
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64e
char_span:
  start_char: 18143
  end_char: 18197
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 76bf83f45949f474360060e8d1e63d1a3dac708ebfe639e7cdc2eb24d1f9e619
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 17757
    end_char: 18198
    text_sha256: d55fb696d8fb5153fac69b8dfc4034227a16a8ecd2f52cef5bbc322bc1937325
  rationale: ἀτιμάζειν ἔμοιγε δοκεῖ selects one limb of the alternative τιμᾶν δοκεῖ σοι ἢ ἀτιμάζειν just posed at 42, an echo-answer that puts the speaker in the addressee's place; 3sg ἔφη excludes the narrator. The addressee is the Simmias anchored at 39 and named at 48.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0048
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64e
char_span:
  start_char: 18202
  end_char: 18347
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cbf0fe127aef2e369f6e136b4e5a122ec49654bcc4839cafff19a08a3b8a1fb2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 17757
    end_char: 18763
    text_sha256: 5acc0e7d5517e5640cde42a07fb661354d7c7018fd25694cf3b9868180e5a160
  rationale: οὐκοῦν ὅλως δοκεῖ σοι draws the consequence of the answer given at 43 and keeps the 2sg questioning voice; 3sg ἔφη excludes the narrator. That voice is fixed as Socrates by the ὦ Σώκρατες of the anchored reply at 39 and addresses Simmias by name at 48.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0049
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64e
char_span:
  start_char: 18352
  end_char: 18359
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 011c325c7f0b53304d0a6a99d81651b7789627a4f6e1963e97e87ec0c5b1a1d5
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 17757
    end_char: 18763
    text_sha256: 5acc0e7d5517e5640cde42a07fb661354d7c7018fd25694cf3b9868180e5a160
  rationale: ἔμοιγε answers the δοκεῖ σοι of 44 in that question's own words, so the speaker is the party addressed by σοι. Within this stretch that party is the Simmias anchored at 39 and named ὦ Σιμμία by the questioner at 48.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0050
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 64e-65a
char_span:
  start_char: 18364
  end_char: 18522
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e29d1e3c3de07afe5230fc0c61292031dbb28f15ff69b9dff6e06592cc372545
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 17757
    end_char: 18763
    text_sha256: 5acc0e7d5517e5640cde42a07fb661354d7c7018fd25694cf3b9868180e5a160
  rationale: ἆρ’ οὖν πρῶτον μέν puts a fresh question after the assent at 45, continuing the single questioning voice of the exchange bounded by the anchored Simmias replies at 39 and 69, the first of which addresses that voice as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0051
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65a
char_span:
  start_char: 18527
  end_char: 18536
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18360
    end_char: 18763
    text_sha256: 63e4fbdf0f288daf21c74dc0a9576026196aaad033beca0b7b4dfe72b9e26fbb
  rationale: φαίνεται answers the δῆλός ἐστιν question of 46 by echoing its claim of manifestness, so the speaker is the answering party, named ὦ Σιμμία by the questioner in the very next unit.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0052
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65a
char_span:
  start_char: 18541
  end_char: 18762
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 151becf0622169665e1eda8b4e05dcb5011d37dbdb06a250cfe8b114e99ecdaa
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 17757
    end_char: 18794
    text_sha256: e339b288cacfd73d1f597df49cca8f209ead284f56e44d37114924ed308dd88c
  rationale: The vocative ὦ Σιμμία proves the speaker is not Simmias and confirms that Simmias is the party being questioned throughout. The speaker is the questioner of the series, fixed as Socrates by the ὦ Σώκρατες of the anchored reply at 39.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0053
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65a
char_span:
  start_char: 18767
  end_char: 18793
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b7a68acf9df4961edfa9c7b7f3a0368651cb4e4157f919c89277e7bbfaf8949b
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 18794
    text_sha256: 4178b45c2f3905fb3384e6542c1daadd0b397a6336d1aec5b9129ac658e1b7f9
  rationale: πάνυ μὲν οὖν ἀληθῆ λέγεις assents in the second person to the immediately preceding unit, which was explicitly addressed ὦ Σιμμία, so the assenting speaker is Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0054
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65a-65b
char_span:
  start_char: 18798
  end_char: 19257
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e61b11727be34eefde5939c8c25f33e1577e2c23d4172e1594c12c2f79587e5d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 18537
    end_char: 19281
    text_sha256: 826fc7a736c6edf64234b2420dba9d776b06a98fce1423be47bd952c6a6f5cd3
  rationale: τί δὲ δή resumes the questioner's series and the unit closes ἢ σοὶ οὐ δοκοῦσιν, addressed to the party named ὦ Σιμμία two units earlier. The questioner is the speaker of 48, and so not Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0055
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65b
char_span:
  start_char: 19262
  end_char: 19280
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 19281
    text_sha256: 826fc7a736c6edf64234b2420dba9d776b06a98fce1423be47bd952c6a6f5cd3
  rationale: πάνυ μὲν οὖν, ἔφη answers the closing ἢ σοὶ οὐ δοκοῦσιν of 50, so the speaker is the addressee of that σοί, named ὦ Σιμμία at 48; 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0056
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65b
char_span:
  start_char: 19285
  end_char: 19420
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c0193b22cc981c20cc57b61b75cfb9db1445bbb9fbe42b8295a1605cdc92a671
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 18537
    end_char: 19445
    text_sha256: 51f9d68fef8588795f0aeff56eb55ef6bff466063caf2e5a27f95110b397f59b
  rationale: ἦ δ’ ὅς is third person and excludes the narrator. The unit puts the next question of the same series after the assent at 51 and stands between the two ὦ Σιμμία addresses at 48 and 60, so it belongs to the party who addresses Simmias rather than to Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0057
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c
char_span:
  start_char: 19431
  end_char: 19444
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 53f99cc9f20690d28692b7f8a9fdc1b64aed1f134d2fba4ed6d122d942ab5f66
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 19445
    text_sha256: 51f9d68fef8588795f0aeff56eb55ef6bff466063caf2e5a27f95110b397f59b
  rationale: ἀληθῆ λέγεις is a second-person assent to the statement closing 52, so the speaker is the one being questioned in this exchange, addressed by name as ὦ Σιμμία at 48 and again at 60.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0058
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c
char_span:
  start_char: 19449
  end_char: 19532
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 23018efe5a18a86d4de65ab9c0103f18193c6207fbb7272181b2b44e2132d0ea
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 18537
    end_char: 19542
    text_sha256: 9c98499a79063fcbbd81abc7fc08f85920adf6b198d1c62a62d2a1119dcc032f
  rationale: ἆρ’ οὖν οὐκ resumes the questioning after the assent at 53, continuing the single interrogating voice that addresses Simmias by name at 48 and 60 and is therefore not Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0059
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c
char_span:
  start_char: 19537
  end_char: 19541
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 19542
    text_sha256: 9c98499a79063fcbbd81abc7fc08f85920adf6b198d1c62a62d2a1119dcc032f
  rationale: ναί answers the ἆρ’ οὖν οὐκ question of 54; the answering party in this bounded exchange is the one addressed as ὦ Σιμμία by the questioner at 48 and 60.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0060
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c
char_span:
  start_char: 19546
  end_char: 19802
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4bf17d78abc25a6ce9c55dad04650dd99047262f71e0b6bfe5c3333332ece96a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 18537
    end_char: 19819
    text_sha256: dd9fe692514c7674ad20824f5e39154d761bcbdba3b297fe016cad5fd82e578e
  rationale: λογίζεται δέ γέ που continues the questioner's own account of the soul begun at 52 (ὅταν μὲν μετὰ τοῦ σώματος ... τότε ἐξαπατᾶται, answered here by ὅταν αὐτὴ καθ’ αὑτὴν γίγνηται), and is assented to at 57. That voice addresses Simmias by name at 48 and 60.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0061
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c
char_span:
  start_char: 19807
  end_char: 19818
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 19819
    text_sha256: dd9fe692514c7674ad20824f5e39154d761bcbdba3b297fe016cad5fd82e578e
  rationale: ἔστι ταῦτα concedes the statement of 56, taking the answering role in the exchange whose respondent is named ὦ Σιμμία at 48 and 60.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0062
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65c-65d
char_span:
  start_char: 19823
  end_char: 19951
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7bc8c78c2c057e4392ee5a5b53e133c14c0279b7aeef5434bc9b2c27c93dd887
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 18537
    end_char: 20053
    text_sha256: c81870f492cad86b5cd4aefc89d8cf600a38b694ff230020e70b168d4a35675c
  rationale: οὐκοῦν καὶ ἐνταῦθα draws a further consequence in question form after the concession at 57, and the same voice names its addressee ὦ Σιμμία two units later at 60, so the speaker is not Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0063
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 19956
  end_char: 19965
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 18537
    end_char: 20053
    text_sha256: c81870f492cad86b5cd4aefc89d8cf600a38b694ff230020e70b168d4a35675c
  rationale: φαίνεται answers the οὐκοῦν question of 58, and the very next unit addresses the answering party as ὦ Σιμμία, which fixes the respondent of this exchange.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0064
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 19970
  end_char: 20052
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3f276eb2127a0146111704d007be646e54e660a3d8eea726cce466d7c5b8f7aa
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 19819
    end_char: 20094
    text_sha256: 774ccda0f0011a2afd1891defc71b49f3e9f7f626716a804c4e422c1dc28f64a
  rationale: The vocative ὦ Σιμμία excludes Simmias and marks him as the addressee. The speaker is the questioner of the continuous series whose replies are anchored to Simmias at 39 and 69, the latter of which addresses him as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0065
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 20057
  end_char: 20093
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ebce4054469b0058788c8c1a2aea671cbad1466673768ed719c9561ff55272f8
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 19966
    end_char: 20094
    text_sha256: e8b23e4a19cd654033f2964062145b8c0b4ced48c4874dd0c48783505a65f14d
  rationale: φαμὲν μέντοι is a lexical echo-answer to the φαμέν τι εἶναι δίκαιον of 60, which was addressed ὦ Σιμμία, so the answering speaker is the man named in that vocative.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0066
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 20098
  end_char: 20128
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 013288cc3ca4bcde687c34df6faac9f7a158c3ac949b051d931cbc33d13d7916
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 19966
    end_char: 20144
    text_sha256: 7ca1fae47cc33125053e2cc86a6e232473a34019531be60da1bc2bbd8405a03f
  rationale: καὶ αὖ ... γέ τι has no verb of its own and simply appends further terms to the φαμέν τι εἶναι question of 60, which was addressed ὦ Σιμμία, so the speaker is that unit's speaker and not Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0067
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 20133
  end_char: 20143
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4a1296ee40f137e1b4341eb599b4ce66c47c9e6e6937f4c02bb1fdc44105e83a
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 19966
    end_char: 20144
    text_sha256: 7ca1fae47cc33125053e2cc86a6e232473a34019531be60da1bc2bbd8405a03f
  rationale: πῶς δ’ οὔ; grants the appended question of 62 within the exchange whose respondent is named ὦ Σιμμία at 60 and again at 68.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0068
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 20148
  end_char: 20200
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a39cdf986b7d86c9d5fe7dfa49ae8b46c783b57cbd4d5c5173adc038db270617
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 19966
    end_char: 20223
    text_sha256: 1a0e2b5e11b1e1708678b067e855f9c35aed8c1933072a5d9810fdddd26e7bca
  rationale: The 2sg εἶδες puts the question to the party addressed as ὦ Σιμμία at 60, so the speaker is the questioner of that unit; the same voice names Simmias again at 68 and is answered there by the anchored Simmias with ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0069
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d
char_span:
  start_char: 20205
  end_char: 20222
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f60d5b8c05daa0810a92e12189ee8445fbbc3080c54991de89e8aa5c5b08533a
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 19966
    end_char: 20223
    text_sha256: 1a0e2b5e11b1e1708678b067e855f9c35aed8c1933072a5d9810fdddd26e7bca
  rationale: οὐδαμῶς answers the 2sg question εἶδες of 64, so the speaker is its addressee, the man named ὦ Σιμμία at 60 and at 68 and anchored at 69; ἦ δ’ ὅς is third person and excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0070
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65d-65e
char_span:
  start_char: 20227
  end_char: 20609
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 422c589ea05c82528c26df123bfb0c07a4b034ab533d8d2f22939fc007d9591d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 19966
    end_char: 21347
    text_sha256: 181a5d361bb0c220a33c428501aedce634561231b0cd815235223e5ada1e7723
  rationale: ἀλλά with 2sg ἐφήψω offers the alternative to the ὀφθαλμοῖς εἶδες of 64 and so comes from that questioner; the same question runs on into 68, where the speaker says ὦ Σιμμία and is answered at 69 by the anchored Simmias with ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0071
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65e
char_span:
  start_char: 20614
  end_char: 20627
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 19966
    end_char: 21347
    text_sha256: 181a5d361bb0c220a33c428501aedce634561231b0cd815235223e5ada1e7723
  rationale: πάνυ μὲν οὖν grants the closing limb of the question at 66; the answering party is the man addressed ὦ Σιμμία at 60 and 68, and anchored as Simmias in the reply at 69.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0072
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 65e-66a
char_span:
  start_char: 20632
  end_char: 21250
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 86819ac258d68f58763d01e4823ef37dd04234f675973c8373df11b015681a74
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 20628
    end_char: 21347
    text_sha256: 6d9022675e7e8c2c9d8960b831ed7ee573bd7a70e5492342329f9250d29920d0
  rationale: The question closes with the vocative ὦ Σιμμία, which excludes Simmias as its speaker; the ANCHOR at 69 has Simmias answer it addressing ὦ Σώκρατες, so the addressee of the reply, and hence the speaker of 68, is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0073
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 66a
char_span:
  start_char: 21255
  end_char: 21340
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8e5cbb7ff7c36c32328bd6a913f3e331ccd237e188152233394388e460c826e6
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 21265
    end_char: 21293
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0074
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 66b-67b
char_span:
  start_char: 21351
  end_char: 23735
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8b806a3aedbba227bebcab5674a4e5dc5771eff78b9780b0f0286d324806989c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 21251
    end_char: 24160
    text_sha256: 22346842eaa64c74a38c1a2b5821653778556196b6076affbd1691114e13cacc
  rationale: ἔφη is third person and excludes the narrator Phaedo; the closing ὦ Σιμμία excludes Simmias; the reply at 71 addresses ὦ Σώκρατες, and the ANCHOR at 72 shows Socrates resuming the same chain with οὐκοῦν, ἔφη ὁ Σωκράτης.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0075
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67b
char_span:
  start_char: 23740
  end_char: 23785
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: eff99bc9b44f82ff0b07cc01b92a2befa13a226d71d2dd151a6a7b5a43ff54b0
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 21347
    end_char: 24209
    text_sha256: 7c52e5320ff8da0a9e24454ad102daee762ee30ec65e1be63f8e00a0ef39a01b
  rationale: The vocative ὦ Σώκρατες excludes Socrates; the unit answers the ἢ οὐ δοκεῖ σοι οὕτως; of 70, a question whose addressee is named ὦ Σιμμία, and the ANCHOR at 73 shows Simmias still holding the answering slot two units later.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0076
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67b-67c
char_span:
  start_char: 23790
  end_char: 24159
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8f15734491168781a9791da9ceb30042baef06ddded49daef8f01776a80172eb
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 23798
    end_char: 23827
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0077
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67c
char_span:
  start_char: 24164
  end_char: 24208
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fe45eedaefd95e999f53885f507c7514485bba5cb0c48c527b84ef7ca4758732
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 24178
    end_char: 24206
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0078
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67c-67d
char_span:
  start_char: 24213
  end_char: 24569
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96d94f77f739e2e974bc27a3e838bcda50afa8561e75a13338617cfe496fce50
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 23786
    end_char: 24671
    text_sha256: 9dd50fdfdfe7d09fcb3d00c64778b978f9b88fdc494f4c3fe61819d7d4e7e96e
  rationale: The ANCHORS at 72 (Socrates) and 73 (Simmias answering him) fix the two slots of this run, and 74 is a fresh question continuing it; the occupant of that questioning slot addresses his interlocutor as ὦ Σιμμία at 82 and 86, which excludes Simmias from it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0079
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d
char_span:
  start_char: 24574
  end_char: 24592
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 24160
    end_char: 26240
    text_sha256: e9680a5014fccdd381a12619204de908339151fcae0ad32b931c63299b49588c
  rationale: ἔφη is third person and excludes Phaedo; the unit is the assent to the question at 74, and the answering slot is Simmias's by the ANCHOR at 73 and by the vocative ὦ Σιμμία with which the questioner addresses him at 82.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0080
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d
char_span:
  start_char: 24597
  end_char: 24670
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fe9b43243da77fd1c412e2890e994ff5a200c8c9b8f6b9a0575b1c52909cf4c7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 24209
    end_char: 26240
    text_sha256: c0e6ac96f4a5063d46ab4120fdc9510de381cd2cbf91658a452c0ad88218d30b
  rationale: A question in the slot the ANCHOR at 72 assigns to Socrates, whose occupant addresses his interlocutor by the vocative ὦ Σιμμία at 82; the answering slot beside it is Simmias's by the ANCHOR at 73.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0081
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d
char_span:
  start_char: 24675
  end_char: 24697
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2004b32e8ace1128f43bd5599172629f3080c323ecd3880712c2d1eeb9c9e608
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 24593
    end_char: 26240
    text_sha256: 6eed358167daaa175b93b71118eb289d3c309e6abc623891787327b45b37063f
  rationale: ἦ δ’ ὅς is third person and excludes the narrator Phaedo; the unit assents to the question at 76 from the answering slot that the ANCHOR at 73 assigns to Simmias and that the questioner names ὦ Σιμμία at 82.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0082
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d
char_span:
  start_char: 24702
  end_char: 24881
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1e7567b5f5317ef6caa10de5bd079e6ae4627e18eaf4e3407a2f992aa7cfa1a2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 24593
    end_char: 26240
    text_sha256: 6eed358167daaa175b93b71118eb289d3c309e6abc623891787327b45b37063f
  rationale: A question closing with ἢ οὔ; in the questioning slot anchored to Socrates at 72 and marked by his vocative ὦ Σιμμία at 82, which excludes Simmias; the answering slot beside it is held by Simmias per the ANCHOR at 73.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0083
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d
char_span:
  start_char: 24886
  end_char: 24895
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 24698
    end_char: 26240
    text_sha256: 8e96678717372a8ffdbb804c6eb7886fd8b24e9299986176743b8ee701bc8e73
  rationale: Bare assent answering the ἢ οὔ; of 78, so it occupies the answering slot; that slot is Simmias's by the ANCHOR at 73 and by the vocative ὦ Σιμμία at 82, and no other interlocutor is addressed anywhere in the run.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0084
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67d-67e
char_span:
  start_char: 24900
  end_char: 25068
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4487dc281b2281a047ff066ef731a34fac0e96d89d8b6c85a4b291c6790cc58b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 24698
    end_char: 26240
    text_sha256: 8e96678717372a8ffdbb804c6eb7886fd8b24e9299986176743b8ee701bc8e73
  rationale: The 1sg ἔλεγον in ὅπερ ἐν ἀρχῇ ἔλεγον is the speaker resuming his own earlier words, and it coreferences the ὅπερ ἄρτι ἔλεγον of 82, whose speaker the vocative ὦ Σιμμία excludes from being Simmias; the ANCHOR at 72 puts Socrates in that same continuing slot.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0085
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67e
char_span:
  start_char: 25073
  end_char: 25092
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9b702405bd9162554bde39ebbb8608f54e31daacf129dcf2cfc853f2e3ecdb62
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 24896
    end_char: 26240
    text_sha256: 0176f30e575b48d740d7a8a3eb6f0aab49bce2a4017982d4086e612c20583179
  rationale: γελοῖον is a lexical echo-answer to the γελοῖον of the question at 80, placing the unit in the answering slot, which the ANCHOR at 73 and the vocative ὦ Σιμμία at 82 assign to Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0086
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 67e-68b
char_span:
  start_char: 25097
  end_char: 26239
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1c1c54f846748629bafc34b8242574f4dc4dc0ec059b88d595abdf554933e148
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 24896
    end_char: 26290
    text_sha256: 0b113a93ed438cf7ab90b87c22561823399e3b5c08a313c97e3d2eac0fdabe55
  rationale: ἔφη is third person and excludes Phaedo, while the vocative ὦ Σιμμία excludes Simmias; the unit resumes what its speaker calls ὅπερ ἄρτι ἔλεγον, continuous with the ANCHOR at 72, and 101 closes the whole stretch with εἰπόντος δὴ τοῦ Σωκράτους ταῦτα.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0087
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68b
char_span:
  start_char: 26244
  end_char: 26289
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a1d1b74075d62877e701a6d802a303a36457168f6e4f8195946e54340be31ea1
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 25093
    end_char: 26540
    text_sha256: 49078c2fda61c8e618885e1f80e6be8f0a0be7c4a65c75bfdfceacc38f04f2ef
  rationale: ἦ δ’ ὅς is third person and excludes the narrator; πολλὴ μέντοι is a lexical echo-answer to the οὐ πολλὴ ἂν ἀλογία εἴη that closes 82, a unit whose vocative names Simmias as its addressee, so the answer is his.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0088
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68b-68c
char_span:
  start_char: 26294
  end_char: 26539
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c00f2d9398686a1ed728b295ecc01f2e02b0adae8b95339d4292ba2c90926368
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 25093
    end_char: 26577
    text_sha256: 9cf3b9587d490e3e9b39f4cda8a011cbd1bd1183c58b0d4c33efdc6fc082a299
  rationale: ἔφη excludes Phaedo; the unit continues the questioning slot whose occupant addresses ὦ Σιμμία immediately before at 82 and immediately after at 86, and 101 attributes the whole run to Socrates with εἰπόντος δὴ τοῦ Σωκράτους ταῦτα.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0089
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68c
char_span:
  start_char: 26544
  end_char: 26576
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6376427eca9af23636f8e40f140d136b7c4bda9d1653aa58b10e108e8b710163
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 26290
    end_char: 26691
    text_sha256: 7544167612e1cdd2b9f9ac43a6a71f598de12f2de366ddce830dc3cbe9de1791
  rationale: ἔφη is third person and excludes Phaedo; the unit assents to the question at 84 from the answering slot held by the man addressed ὦ Σιμμία in the flanking units 82 and 86.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0090
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68c
char_span:
  start_char: 26581
  end_char: 26690
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2d0610d7acda0f369066f1da708352732aa18dd7dbeb4a029371b4ddb5064ddf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 26540
    end_char: 26714
    text_sha256: a6f54b39302ba29ba6159de9d5a61d87aff90336e6b631341b0bc8360e4cea39
  rationale: ἔφη excludes Phaedo and the vocative ὦ Σιμμία excludes Simmias; the unit is the question answered at 87, in the slot anchored to Socrates at 72 and named ὦ Σώκρατες by its interlocutor at 91.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0091
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68c
char_span:
  start_char: 26695
  end_char: 26713
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0ffa6460b1ce9b47a2c45b65f6656de84bc6fa5e73e2b94395627b8d9da4ec09
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 26577
    end_char: 26952
    text_sha256: 3cd358f26d9ee2bd7399cce7f209686a3fd5761157c3dcfe80f5dfe52b21f679
  rationale: ἔφη is third person and excludes Phaedo; the unit answers the question of 86, which names its addressee ὦ Σιμμία, so the answerer is Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0092
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68c
char_span:
  start_char: 26718
  end_char: 26945
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4daf2d5491963405c540bda3e1b1253c4aec5c29ecb05e2be820bad41ee5efc1
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 26577
    end_char: 26969
    text_sha256: 9cc6df9b9749400283ec408a70285c4c6e2a2683a8a29edb50645f8993602364
  rationale: A question in the slot occupied at 86 by the speaker who addresses ὦ Σιμμία and at 90 by the speaker whom 91 addresses as ὦ Σώκρατες; the ἔφη of the answer at 89 excludes the narrator from the slot beside it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0093
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 26956
  end_char: 26968
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 957a4d55b1da4147f13d447b0b3012b678cd7c823196ab62661f64de79d59e7c
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 26714
    end_char: 27076
    text_sha256: b06cf5d62062135ee662d7452f1aa1859868ea93f63d4ae0109405f91c6000e4
  rationale: ἔφη is third person and excludes Phaedo; the unit assents to the question at 88 from the answering slot whose occupant is named ὦ Σιμμία at 86 and speaks the ὦ Σώκρατες of 91.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0094
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 26973
  end_char: 27075
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bb3c20ce3dde47d54f0180e287266d05e896b179f89a7ad23a1a06f18b7633e7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 26714
    end_char: 27196
    text_sha256: 45a71a80f8da92698fa5c81eaddbd4e53619d0afb7eae05e5d1b37883bfd75ce
  rationale: ἦ δ’ ὅς is third person and excludes Phaedo, and the reply at 91 addresses the speaker of this unit as ὦ Σώκρατες, which fixes him as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0095
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27080
  end_char: 27115
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 37949df5baab410a76e610695a009062041f2db5b8e7ef90b03cf1af5391933b
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 26969
    end_char: 27196
    text_sha256: 8b2f0149be401542fd2f6cb6194bb51886b58a9affcafb705408652e33558bcb
  rationale: The vocative ὦ Σώκρατες excludes Socrates; the unit queries the claim made at 90 and is answered at 92 by the man so addressed, and its own speaker is the interlocutor named ὦ Σιμμία at 86.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0096
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27120
  end_char: 27195
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9db1545435dd5dd467174ad28c6868d6e697962850247766ba4788539f5b84a3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 26969
    end_char: 27215
    text_sha256: 751d8915205b4f1834d36403a26e86f228a74be01e8f30f5c593a73d9933cf38
  rationale: ἦ δ’ ὅς is third person and excludes Phaedo; the unit answers the πῶς δή, ὦ Σώκρατες; of 91, which names its addressee, so its speaker is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0097
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27200
  end_char: 27214
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fa8c9fd3c8d7ce360978b208b6b3b3024d69bf789c72b579d47192f1482624d4
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 27116
    end_char: 27306
    text_sha256: 6ef1c864c758f49301072f7d1a8659395c1fb0210a43e159681216f36564fa54
  rationale: ἔφη is third person and excludes Phaedo; the unit assents to the question at 92, whose speaker the vocative at 91 fixes as Socrates, leaving the answering slot to the man addressed ὦ Σιμμία at 86.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0098
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27219
  end_char: 27305
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 62812cc965b21ea331e9483bea1fb24e2bf2f4cb4aa42afccecc5fae1adea4ed
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 27116
    end_char: 27322
    text_sha256: 2a11582f9f951fb27f6042c95a630a16e572560f3b584da585324a9372ff0631
  rationale: A question continuing the slot fixed as Socrates by the vocative ὦ Σώκρατες at 91 and by the ANCHOR at 72; the answering slot beside it belongs to the interlocutor addressed ὦ Σιμμία at 86.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0099
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27310
  end_char: 27321
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 27215
    end_char: 27451
    text_sha256: d9e65631cfadc55b81f47fdc4dd064fdf8c44cd316b97632f802e142b6d630d8
  rationale: Bare assent answering the question at 94, hence in the answering slot; its occupant is the man addressed ὦ Σιμμία at 86 who speaks the ὦ Σώκρατες of 91, and no other interlocutor is addressed anywhere in this run.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0100
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68d
char_span:
  start_char: 27326
  end_char: 27444
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bc55635dc53d7c07720fad78f8db5e4965f65024ab49e74f1fff35a0ea60e14c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 27215
    end_char: 27469
    text_sha256: 9b59e453a2763844280fa068d89ae7d47fb40b4779e5672d3fc7407b289eead7
  rationale: The unit draws the inference of the questioning slot addressed as ὦ Σώκρατες at 91, and 101 closes the whole preceding stretch with εἰπόντος δὴ τοῦ Σωκράτους ταῦτα, attributing it to Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0101
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68e
char_span:
  start_char: 27455
  end_char: 27468
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 27322
    end_char: 28003
    text_sha256: 1894d429f89b3e32a24e122e4e1acb522f143c8214fe9f5736595f1045a1c008
  rationale: Bare assent answering 96, in the answering slot held throughout the run by the man addressed ὦ Σιμμία at 86 and again at 100 with ὦ μακάριε Σιμμία.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0102
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 68e-69a
char_span:
  start_char: 27473
  end_char: 28002
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 78d0826613c43479aa336a564c69b7fbd0cf35c3aac811ecda6a39c36ab03b3e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 27322
    end_char: 28018
    text_sha256: a41113beefc541bab7c689eb43af6b59a8023d6100e1cc6110263f4657e0bbfa
  rationale: A question in the slot addressed as ὦ Σώκρατες at 91, immediately preceding the continuation at 100 that addresses ὦ μακάριε Σιμμία; 101 attributes the whole stretch to Socrates with εἰπόντος δὴ τοῦ Σωκράτους ταῦτα.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0103
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 69a
char_span:
  start_char: 28007
  end_char: 28017
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 649829b7454dd77ff7e8ac8119aa90243ff3b499ec9f816b091fde44761995a7
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 27469
    end_char: 30826
    text_sha256: 9802ad4df8cfc2b1cc825e05407eeb3c149cceba8e5582c39163e7b701e365b5
  rationale: Bare assent answering 98; the questioner resumes at 100 addressing ὦ μακάριε Σιμμία, and 101 marks Cebes as only then breaking in with ὑπολαβὼν ὁ Κέβης, so the answering slot through 99 is Simmias's.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0104
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 69a-69e
char_span:
  start_char: 28022
  end_char: 30011
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e19cf6fb1b4a0feda18c67b7935f36356e83ef78bd52769273d5b568fbbb3d36
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 28018
    end_char: 30826
    text_sha256: 51ebcb6590ef4be954e173455ef62fb4dca5599e437006b953b4de62381bbed3
  rationale: The opening vocative ὦ μακάριε Σιμμία and the later ὦ Σιμμία τε καὶ Κέβης exclude both named addressees as speaker, and the embedded 3sg ἔφη excludes the narrator Phaedo. Unit 101 opens εἰπόντος δὴ τοῦ Σωκράτους ταῦτα, naming Socrates as the speaker of exactly this just-completed speech before Cebes takes it up.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0105
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 69e-70b
char_span:
  start_char: 30101
  end_char: 30825
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a8487a91ff4017172533465a3eb337bfaa7d305d509e64bbe139ee8a6b8da835
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: "ὑπολαβὼν ὁ {pers} Κέβης {/pers} ἔφη:"
    start_char: 30064
    end_char: 30100
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0106
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70b
char_span:
  start_char: 30830
  end_char: 30997
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0fcd385e19641212431417a2a6ab0deff0e011d87d748480be0617f204143d4f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, λέγεις, ὁ {pers} Σωκράτης {/pers}
    start_char: 30837
    end_char: 30875
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0107
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70b
char_span:
  start_char: 31002
  end_char: 31090
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cbaedfe69c5171ff51e299dcbef3dce03a764b5c2d90aa4627a42f098f0ea077
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 31012
    end_char: 31038
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0108
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70b-70c
char_span:
  start_char: 31095
  end_char: 31299
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a44d3caf140bc4bd8a611c200e76ebd9ff5768e6c689ff1e46c663eb594c584e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Σωκράτης {/pers}
    start_char: 31115
    end_char: 31148
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0109
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70c-70d
char_span:
  start_char: 31304
  end_char: 31897
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0a92e4c6fd342a8d0f25a62886ab4a7b51dd1f016c3a6cdb3f78a52d301aedea
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31091
    end_char: 31945
    text_sha256: bf68c5628bef3a61e1c7d12115bca58dfa98a51b493b81b2dbb0b90c8eb8fb90
  rationale: Unit 104 anchors Socrates closing with χρὴ διασκοπεῖσθαι, and 105 opens σκεψώμεθα δὲ αὐτὸ τῇδέ πῃ with no reporting verb and no change of addressee, executing that very proposal in the same 1pl. Unit 106 anchors Cebes as the respondent to it, so 105 belongs to the party Cebes answers.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0110
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70d
char_span:
  start_char: 31902
  end_char: 31944
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 339d2a615b1d9b5ae3bcbf56b044a5867f5cd24c78413a591f0e0b0784b0d7b9
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 31916
    end_char: 31942
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0111
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70d-70e
char_span:
  start_char: 31949
  end_char: 32517
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 380a0e6e2382059141a3bcf28c7bfceedc7729df5b685bda8a76af212f4ee1fe
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31091
    end_char: 32518
    text_sha256: 5887bee3b7e7f3dd60cb145076d8d4da0949361a78cb09bbfa10744ab6691ebc
  rationale: ἦ δ’ ὅς is 3sg and so excludes the narrator, and it falls immediately after the Cebes anchor at 106, so the speaker is the party Cebes was answering. The unit addresses its hearer in the 2sg (σκόπει, εἰ βούλει) while resuming the inquiry Socrates proposed at 104-105.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0112
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70e
char_span:
  start_char: 32522
  end_char: 32526
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31898
    end_char: 32527
    text_sha256: c9e62523531eae7d031252dcf6994fc44d1c9f96110d112d869de05acfbedc3f
  rationale: A bare assent answering the specific question that closes 107 (ἀνάγκη που ἐξ ἐλάττονος ὄντος πρότερον ἔπειτα μεῖζον γίγνεσθαι;). The speaker of 107 addresses one 2sg interlocutor, and that interlocutor is anchored as Cebes at 106, so the assent is his.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0113
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 70e-71a
char_span:
  start_char: 32531
  end_char: 32619
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 35b1d41138e11f709e99478226c74605d6f215cd6616cf733b1069d9ec22d52f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32620
    text_sha256: 097237604c432badd8f5275772eb2df4d7b59bd2a8e344d9ee7da491dc6be201
  rationale: οὐκοῦν κἂν ἔλαττον γίγνηται, ἐκ μείζονος ὄντος inverts term for term the μεῖζον/ἐλάττον example the speaker of 107 had just posed; this is a speaker resuming his own words across an interposed monosyllabic assent, not a new party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0114
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32624
  end_char: 32640
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bfc874fd480ea1471d0e91da8fb7b1efb45e2e087203671071800772bd9f2b4b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31898
    end_char: 32641
    text_sha256: fe53c345cd3ef3cb59079f40fc2c4979fc7c924e6267688686db952a85999efb
  rationale: ἔστιν οὕτω answers the specific question of 109, and the 3sg ἔφη excludes the narrator Phaedo. The answering role in this run is fixed to Cebes by the anchor at 106 and by the questioner's continuous 2sg address at 107.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0115
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32645
  end_char: 32715
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4b67b91e9dba892f4ab4fc0adae4dbe50146e39e35b64bcd2355460d7e28deca
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31091
    end_char: 32729
    text_sha256: ae27525570bb00dca73a927753b31aacd1f8b3053d607214c92115826d409bbd
  rationale: καὶ μὴν ἐξ ἰσχυροτέρου γε continues the very series of ἐκ + comparative questions built at 107 and 109 by one voice, and it is answered by 112. The questioning slot is anchored to Socrates at 104, the answering slot to Cebes at 106.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0116
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32720
  end_char: 32728
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32729
    text_sha256: 55d3a8829084fee77bce5fcef4b3c6c5c290e639b28f9a06b98a2b034905fdbc
  rationale: πάνυ γε assents to the specific question of 111. Within this run the questioner addresses a single 2sg interlocutor anchored as Cebes at 106, so the assent belongs to Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0117
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32733
  end_char: 32815
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 485ad121b2f1aa21b6dbcf7f8c0733f5d35142cbb2dc153287330fb0497fc400
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32816
    text_sha256: 5b541a70828619b59a4c9f1d7426e7bd7f0ab90a9d5c39a3cc5567b0ee9d4691
  rationale: τί δέ; ἄν τι χεῖρον γίγνηται, οὐκ ἐξ ἀμείνονος continues the same ἐκ + genitive comparative series with the same elliptical construction, the questioner resuming his own enumeration from 107, 109 and 111.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0118
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32820
  end_char: 32831
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32832
    text_sha256: adc45d1f6b88636f600908d89cd2d2725ea55a215de0a9b4440b7a6a903bba89
  rationale: πῶς γὰρ οὔ; is an assent answering the double question of 113, given by the 2sg interlocutor the questioner has been addressing since 107, anchored as Cebes at 106.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0119
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32836
  end_char: 32924
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f16817efa4c06cd7eb5581480855796b5dbd6a0223a0ac3e869bfd96fa1e52cf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32925
    text_sha256: dbf81f87538aaf72b44fc128b2044441ca28b5bd3abec1a3992e0e14a6738f3e
  rationale: ἱκανῶς οὖν ἔχομεν τοῦτο, ὅτι πάντα οὕτω γίγνεται, ἐξ ἐναντίων τὰ ἐναντία restates verbatim the thesis ἐκ τῶν ἐναντίων τὰ ἐναντία formulated at 107, closing the speaker's own enumeration; 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0120
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a
char_span:
  start_char: 32929
  end_char: 32937
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 31945
    end_char: 32938
    text_sha256: 761c38dc4e17d584c1381b90e047b8e9dd5bdea79d696251b815ebaf012cdf66
  rationale: πάνυ γε grants the summary question of 115; the granting party is the 2sg interlocutor of this run, anchored as Cebes at 106.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0121
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71a-71b
char_span:
  start_char: 32942
  end_char: 33249
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 93b3c5b0951ba1d12c59850259033d5a89ec67756d2ad670f0df1145194d7d07
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 32729
    end_char: 34186
    text_sha256: e917ce61637e68e6c551093d0890197644cf412916929a748a20d36ca93bffa5
  rationale: τί δ’ αὖ; resumes with αὖ the questioner’s own τί δέ; of 113 and puts a further question, answered at 118. The duals δυοῖν ὄντοιν here belong to the subject matter of the question and are not a dual reporting verb, so no joint reading arises; the questioning slot is anchored to Socrates at 127.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0122
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71b
char_span:
  start_char: 33254
  end_char: 33263
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cb9bb978d85cc44c1a937db78132a5c1fdef42eee384c00e446ff7b8110f0d04
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 32938
    end_char: 33264
    text_sha256: 69da73261e4000da6fa70c9b0683fb6468e5a8b865feca96206d6a53632906a4
  rationale: ναί, ἔφη answers the specific question of 117; the 3sg ἔφη excludes the narrator, and the answering role in this anchored run (106, 127) belongs to Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0123
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71b
char_span:
  start_char: 33268
  end_char: 33511
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 20d957b5f3fe43c82038ab799b7227949a96b9e8748c1ace8c7dcdcc6a6b56f9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 32938
    end_char: 33512
    text_sha256: db811f0fa025e301075e717cbe919638ec7698637c98520afb45acd29027d1fd
  rationale: οὐκοῦν καὶ διακρίνεσθαι καὶ συγκρίνεσθαι extends the paired-γενέσεις list opened at 117 (αὔξησις/φθίσις) and closes with the same γένεσιν … εἰς ἄλληλα formula; the speaker of 117 is continuing his own list.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0124
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71b
char_span:
  start_char: 33516
  end_char: 33538
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d8c6371cd3922fb160de3dc32faf316c5dfb0708b39da3467b8d2a38221ac7cf
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33264
    end_char: 33545
    text_sha256: 1a143cc8469ac1a5af7360327cdb78a759fca1cfdbe4f41d2428fcc9bd431ee0
  rationale: πάνυ μὲν οὖν assents to the question of 119, and ἦ δ᾽ ὅς is 3sg, excluding the narrator; the assenting party throughout this run is the interlocutor anchored as Cebes at 106 and addressed in the 2sg at 127.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0125
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33549
  end_char: 33621
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e09027174195da5f318a90ede80ebe6d397e972364ca9edefaa051c0000c6726
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33545
    end_char: 34186
    text_sha256: cc074396f024827edf1826f7cedda2a6c8c62d31591343001399e1d88cd239bf
  rationale: At the anchor 127 Socrates says τὴν μὲν τοίνυν ἑτέραν συζυγίαν ὧν νυνδὴ ἔλεγον ἐγώ σοι and then names the ἐγρηγορέναι/καθεύδειν pair, which is introduced into the conversation only here at 121; the 1sg ἔλεγον ἐγώ therefore claims 121 as Socrates' own utterance.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0126
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33626
  end_char: 33644
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33545
    end_char: 34308
    text_sha256: a183b430fa3d3e45199edd531b2aa4b8d2deb03b548c0ade71b11960c61d9574
  rationale: πάνυ μὲν οὖν, ἔφη grants that living has an opposite, and at 129 Socrates ascribes precisely that proposition to his 2sg addressee (οὐκ ἐναντίον μὲν φῂς τῷ ζῆν τὸ τεθνάναι εἶναι;). That addressee is the σὺ of the anchored 127 and is named Κέβης at 137, so the grant at 122 is Cebes'.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0127
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33649
  end_char: 33652
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d1c1f59d163b1e10bd64647b22f68ffce9cc2b079d5837f4704e9b77f1b9f866
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33545
    end_char: 34308
    text_sha256: a183b430fa3d3e45199edd531b2aa4b8d2deb03b548c0ade71b11960c61d9574
  rationale: τί; demands the term whose existence the previous speaker has just conceded. Since 129 attributes the answer τὸ τεθνάναι to the 2sg addressee by φῂς, the party who supplies it at 124 is the addressee and the party who demands it at 123 is the questioner, anchored as Socrates at 127.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0128
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33657
  end_char: 33674
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: be3f806d62edd8744aa5c16cd986c15c23328798ec7d0770072a5cb3adccaa6b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33545
    end_char: 34308
    text_sha256: a183b430fa3d3e45199edd531b2aa4b8d2deb03b548c0ade71b11960c61d9574
  rationale: τὸ τεθνάναι answers the demand at 123, and 129 attributes that very identification to the 2sg addressee (οὐκ ἐναντίον μὲν φῂς τῷ ζῆν τὸ τεθνάναι εἶναι;), who is the σὺ of the anchored 127 and is named Κέβης at 137; the 3sg ἔφη additionally excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0129
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33679
  end_char: 33790
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 262e635c21849ae5bab797ae6b9c5707c29a5004641c7b680e013991fcae203a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 32938
    end_char: 34186
    text_sha256: a18b91a2297b846f9c1f26639b5bd32a615159750be97d99116b8709a6547888
  rationale: οὐκοῦν draws the consequence from the opposition just secured and reuses the speaker's own formula from 117, δυοῖν ὄντοιν δύο γενέσεις, now as αἱ γενέσεις εἰσὶν αὐτοῖν μεταξὺ δύο δυοῖν ὄντοιν; it hands straight into the anchored Socratic τὴν μὲν τοίνυν ἑτέραν συζυγίαν at 127. The dual forms here are in the matter discussed, not in any verb of speaking, so nothing joint is asserted.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0130
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c
char_span:
  start_char: 33795
  end_char: 33806
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33675
    end_char: 34186
    text_sha256: baa185a347224be24b38a07fed2fa1c9ee35cb21ad44ac1c24b6682d8fc479dc
  rationale: πῶς γὰρ οὔ; assents to the question of 125, and 127 anchors Socrates resuming immediately afterwards with τοίνυν; the assenting party in this run bounded by the anchors at 106 and 127 is Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0131
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71c-71d
char_span:
  start_char: 33811
  end_char: 34185
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 29ff79a14d80b042b5ceda0194ec1ef1067875d05c97366c680ca671f4398eef
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ἐρῶ, ὁ {pers} Σωκράτης {/pers}
    start_char: 33867
    end_char: 33902
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0132
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34190
  end_char: 34203
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33807
    end_char: 34204
    text_sha256: 70cc104cdefcee4f2dc9eb9d9f92e96ccf6e29762afc857e5e376eda06e9196d
  rationale: πάνυ μὲν οὖν answers the direct question ἱκανῶς σοι, ἔφη, ἢ οὔ; put by the anchored Socrates at 127 to his 2sg addressee, who is named Κέβης at 137.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0133
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34208
  end_char: 34307
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1d1210448997c0e8b9d3c286819ec897bacc6b49906c34b951d748dc3c3dfe8d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33807
    end_char: 34308
    text_sha256: 399fef707e5d3f2927ca3562c35a93c3871898d6c6698bb8b75222b57327dc49
  rationale: λέγε δή μοι καὶ σύ … οὕτω περὶ ζωῆς καὶ θανάτου executes the assignment the anchored Socrates makes at 127, σὺ δέ μοι τὴν ἑτέραν, with the same μοι and the same 2sg addressee; the speaker is therefore the one who made the assignment, and the 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0134
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34312
  end_char: 34318
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 33807
    end_char: 34319
    text_sha256: a8c495f31021e53fabddb69198d8ae2759f2235c96718aabd92976cec14327f6
  rationale: ἔγωγε is a 1sg echo-answer to the 2sg φῂς of 129, so its speaker is the addressee of 129, i.e. the σὺ whom the anchored Socrates addresses at 127 and names Κέβης at 137.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0135
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34323
  end_char: 34347
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6503ed39b9b136e4734403f399d82f2807bca74f1d0c353db3152c1899084a60
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34204
    end_char: 34348
    text_sha256: 936efcd2a2cf15365091da0f6e61dcfd4054d28c77454c92c359743082aa9f68
  rationale: γίγνεσθαι δὲ ἐξ ἀλλήλων; is an elliptical continuation depending on the φῂς of 129; the infinitive has no construction of its own and must be governed by the questioner's own preceding verb, so 131 is the speaker of 129.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0136
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34352
  end_char: 34356
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34204
    end_char: 34357
    text_sha256: af476f32cbed67c37a6783b8e10892c9141e3d8b1f2bbbf5df47b5be7581d51a
  rationale: ναί answers the question of 131, which is addressed to the same 2sg interlocutor as 129; that interlocutor is Cebes by the anchored σὺ of 127 and the vocative at 137.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0137
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34361
  end_char: 34396
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 811a4b6c32e91c24b0bedcb64e27e85284709f69b2ba630044ac92b5fc7e0347
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34319
    end_char: 34397
    text_sha256: 0395c1517ee8109d6525337bf9d39b4b5b21449df6a97f7b0b680886476244b1
  rationale: ἐξ οὖν τοῦ ζῶντος τί τὸ γιγνόμενον; specifies the questioner's own γίγνεσθαι ἐξ ἀλλήλων from 131, applying it to the ζῆν/τεθνάναι pair he was assigned to elicit at 127.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0138
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34401
  end_char: 34418
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c8cfd6c5ebf26de8b1ad1c2abf52802a9ae899dd395123fe53cac193db8bb6fa
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34357
    end_char: 34419
    text_sha256: e555da0201ef52c11a769607230ac3ffc0ddaa1c2922b464a98a5262c7e31078
  rationale: τὸ τεθνηκός supplies the term asked for by τί τὸ γιγνόμενον at 133, a lexical answer to that specific question; the 3sg ἔφη excludes the narrator and the answering party is the interlocutor named Κέβης at 137.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0139
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34423
  end_char: 34456
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0456b4dc4050f8baa2cbd05a09e9ef0a1b63df564ccfc0409190017d2e529762
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34357
    end_char: 34457
    text_sha256: 9a7ca6d8e66be19be3a392cf5e6675cf5f7c088353ba607f79fa83bc273f6707
  rationale: τί δέ … ἐκ τοῦ τεθνεῶτος; is elliptical on the frame ἐξ … τί τὸ γιγνόμενον supplied at 133, so it is the same questioner resuming his own construction; ἦ δ’ ὅς is 3sg and excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0140
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34461
  end_char: 34498
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96d23e203b2bfdb42d4143b334323f7e46eca5423bb2add654644025c3dfd4e7
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34419
    end_char: 34499
    text_sha256: aa6b9813659e7a69f695e72b8751225d633e1661e7d1bfca15f40198a194ee01
  rationale: ἀναγκαῖον … ὁμολογεῖν ὅτι τὸ ζῶν answers the question of 135 with the term it asks for; the conceding party is the interlocutor whom 137 immediately addresses as ὦ Κέβης, and the 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0141
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71d
char_span:
  start_char: 34503
  end_char: 34586
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2b3a1f6fb816839e70da58fb68c0c6226dea6445c60c81f35ae40db5d0002d0b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34357
    end_char: 34593
    text_sha256: 49a61ed5dc65632bb2f0a5eacf9700a2d2d3ef678cd11d924276042c3ae3e1bc
  rationale: The vocative ὦ Κέβης proves the speaker is not Cebes, and the unit draws the ἄρα conclusion from the two answers just extracted at 134 and 136, so it belongs to the questioner, anchored as Socrates at 127.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0142
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34597
  end_char: 34611
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7cd1a1033e1eb0ce04ee654948d571c3712a3b88809e08dacdfad65454b58591
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34499
    end_char: 34612
    text_sha256: f3d428ddc69872d06d12de778540aaa3fa1a8c7c6d871848e8d8763cdd62ca48
  rationale: φαίνεται concedes the inference put at 137, a question expressly addressed to Cebes by name; the conceder is that addressee, and the 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0143
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34616
  end_char: 34671
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b225739bf04cef50afdda6ed4e8e8d53d66ebeec2bd3cd0a3eb279c9d7151a63
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34499
    end_char: 34672
    text_sha256: c05bdc260aaaec632ce92be61aabbf9b93ef770e5711b714306f2ee0296c3cbb
  rationale: εἰσὶν ἄρα … αἱ ψυχαὶ ἡμῶν ἐν Ἅιδου continues the same ἄρα chain of inference begun at 137, whose speaker is fixed as not-Cebes by the vocative there, and it is itself conceded at 140 (ἔοικεν); the 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0144
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34676
  end_char: 34683
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34499
    end_char: 34800
    text_sha256: b83de5b9fe2d0b9b2be000584a56eb26d2a0d42704d719d4ae9988a639358a08
  rationale: Unit 137 carries the vocative ὦ Κέβης, so the party conducting this question series (ANCHOR ΣΩ. at 127, who there says σὺ δέ μοι τὴν ἑτέραν) is addressing Cebes and the answering party in this stretch is Cebes. Unit 140 is the bare assent to the statement-question of 139 and the questioner resumes at 141, so it belongs to the addressee Cebes, confirmed downstream by ANCHOR ΚΕΒ. at 154.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0145
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34688
  end_char: 34799
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: db4eda62402c95c1e1611bc1aa73fc3042fbc06ed90ca51b76491862c06d9e5d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34499
    end_char: 34823
    text_sha256: 1ad11f37e41fe302a7dd6aa94d4e056d0cce1041b14e6bad9f95942e66a33742
  rationale: The οὐκοῦν ... ἢ οὔ; question repeats the ἱκανῶς σοι, ἔφη, ἢ οὔ; formula of ANCHOR ΣΩ. at 127 and is answered at 142. Since the addressee of this series is named ὦ Κέβης at 137, the interrogating voice is the other party, Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0146
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34804
  end_char: 34822
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34684
    end_char: 34984
    text_sha256: b24cb76ee435d728f916dc7364456c18ad32a5e38f27cd18d3d86a230ddef5fb
  rationale: Third-person ἔφη excludes the narrator Phaedo. The unit is the direct assent to the question of 141, and the answering party of this bounded exchange is fixed as Cebes by the vocative at 137 and by ANCHOR ΚΕΒ. at 154.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0147
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34827
  end_char: 34983
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3611aa2d8d77921b8fa0e1b4ea4f89e181f0aeb5b1ea2543b41ddb839f679cc2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34684
    end_char: 35005
    text_sha256: 709735c575e221eac47f9031f246ed6523c8a79737b64ac66d4a0a271ea2bd84
  rationale: πῶς οὖν ... ποιήσομεν; puts a further question to the same respondent who assented at 142, with the first-person plural of joint inquiry; the respondent is the man addressed ὦ Κέβης at 137, so the questioner is Socrates, anchored at 127 and again by the vocative ὦ Κέβης at 151.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0148
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 34988
  end_char: 35004
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 531fe4251a15bb964f64e489af13f1fd105e82526210d31797a5fdf4e2002043
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34823
    end_char: 35022
    text_sha256: 0a83e58b6c53ea69c6c142c46b4aca5e57022fe9e8a94f04a8710acd36fd6127
  rationale: ἔφη is third person and excludes Phaedo; πάντως που concedes the alternative pressed in 143, so it is spoken by the respondent Cebes, the addressee named at 137 and anchored at 154.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0149
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 35009
  end_char: 35021
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1925e53f8a5340c3973c911b7933a786fc50c2adfd49d4a25882650dfcd2e0a2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 34823
    end_char: 35172
    text_sha256: 12b31e6c4dc96c693033abb6ba51c31660e19a60a88a2207a5c8c806950424f0
  rationale: τίνα ταύτην; presses for a name for the ἐναντία γένεσις just conceded at 144, and the answer it draws out is taken up at 147 under the condition εἴπερ ἔστι τὸ ἀναβιώσκεσθαι, which treats the term as the other party's contribution rather than the speaker's own. The elicitor is therefore the questioner of this stretch, Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0150
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e
char_span:
  start_char: 35026
  end_char: 35043
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d32fa010b75493b7021941d508c20e1ce306ff0feafdab1d76a1b8261bb7b0dc
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35005
    end_char: 35172
    text_sha256: 86c8b218a6ec5d07da3ddcc6d88c4902ccad492feeccf51419d10e2af40188ff
  rationale: This is the bare answer to the question at 145, supplying the name demanded. Unit 147 then quotes the word back with the hedging conditional εἴπερ ἔστι τὸ ἀναβιώσκεσθαι, which a speaker would not apply to a term he had himself just asserted, so 146 and 147 have different owners and 146 belongs to the respondent Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0151
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 71e-72a
char_span:
  start_char: 35048
  end_char: 35171
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0853601438811598eb74cc512a959c23c92e3eab799814c81a994e1b12d96414
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35005
    end_char: 35185
    text_sha256: 5dd3ddfea26aaadde454cd0aee538c792f624fa4b2e92882a0f007e392330783
  rationale: ἦ δ’ ὅς is third person and excludes Phaedo. The unit takes the respondent's τὸ ἀναβιώσκεσθαι under εἴπερ ἔστι and turns it into a further question answered at 148, which is the role of the questioner Socrates, fixed by ANCHOR ΣΩ. at 127 and by his vocative ὦ Κέβης at 151.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0152
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72a
char_span:
  start_char: 35176
  end_char: 35184
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35044
    end_char: 35427
    text_sha256: 5b735bc4464abe4804d30203b42eb415da9e62401ca9c321e315b9ecccd96e6e
  rationale: Bare assent to the question of 147; the conceding party throughout this stretch is the man addressed ὦ Κέβης at 137 and 151 and anchored ΚΕΒ. at 154.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0153
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72a
char_span:
  start_char: 35189
  end_char: 35426
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f810b8e947b260429ec7888a36b1d1d34cd83fb0c3b80410ca42580c55631690
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35044
    end_char: 35934
    text_sha256: 2e5bac035259381fcbcd47d01f9b86b374845c7fa3ff4df4420fdfb947859742
  rationale: The reply at 150 is addressed ὦ Σώκρατες, so the summing-up it answers was spoken by Socrates; the same voice then addresses ὦ Κέβης at 151. ὁμολογεῖται ἄρα ἡμῖν also collects the concessions granted at 144, 146 and 148 by the other party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0154
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72a
char_span:
  start_char: 35431
  end_char: 35517
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4f3b7a50bf84ebb444ac57a5baafcd55259bd76060cb704588a0cc0f19206ff8
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35185
    end_char: 35934
    text_sha256: 708c4d14da943dc461dba13f690f48045a995508f1c15c9368c95c27c455b7fa
  rationale: The vocative ὦ Σώκρατες proves the speaker is not Socrates, and third-person ἔφη excludes Phaedo. Unit 151 answers this speaker by name, ὦ Κέβης, which fixes him as Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0155
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72a-72b
char_span:
  start_char: 35522
  end_char: 35933
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cda895af0d9df2aeccc705155f783f3919253e13ad779cf95e4e362e9e8999c5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35427
    end_char: 35955
    text_sha256: 1f63d08c290fc2a954e1ce5d19b0f0b8c0523539aa80db4916e1e61b6b8e7908
  rationale: The vocative ὦ Κέβης excludes Cebes, and the immediately preceding unit 150 addressed its own hearer as ὦ Σώκρατες, so this reply belongs to Socrates; ἔφη additionally excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0156
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72b
char_span:
  start_char: 35938
  end_char: 35954
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1b3e67e8df0ee4f1e0723c535a12bcf25f53789b6c3c8692e70975674ca9e604
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35518
    end_char: 36782
    text_sha256: 0d6c9a9721266c8f07c181e6a98b642b1babc38f0400e32609050d9c76a47c1f
  rationale: πῶς λέγεις; asks the speaker of 151 to explain himself, and that speaker addressed Cebes by name, so the asker is Cebes; the answer at 153 duly begins ἐννοῆσαι ὃ λέγω and carries the vocative ὦ φίλε Κέβης. ἔφη excludes Phaedo.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0157
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72b-72d
char_span:
  start_char: 35959
  end_char: 36781
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4d45056739c220631537f0857ece6f48f447bf427cd711c6070d97b0ce332a47
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 35934
    end_char: 36904
    text_sha256: ed29c43327011bdebd1a1b17c7fd4aa18e430e52b789e93edec5717cc3d06fef
  rationale: οὐδὲν χαλεπόν ... ἐννοῆσαι ὃ λέγω supplies the clarification demanded at 152 and contains the vocative ὦ φίλε Κέβης, which excludes Cebes; ANCHOR ΚΕΒ. at 154 then answers it with ὦ Σώκρατες, confirming Socrates as the speaker.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0158
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72d
char_span:
  start_char: 36786
  end_char: 36903
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 670817aae1241f608b4e9c11c5dd8e1a12685e12af3cf27e3647ec220b08a1f5
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 36806
    end_char: 36832
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0159
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72d-72e
char_span:
  start_char: 36908
  end_char: 37232
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bd66bf5a0664ad61e298f997eace43bd8db2a91a8395acffab0408b139156093
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 36782
    end_char: 37672
    text_sha256: 9ed36abd31817b77efe9d80f83bb628b0f7cb3c90ee4adfaeeab3fb98f0e8080
  rationale: The vocative ὦ Κέβης excludes Cebes, who is anchored as the speaker of the preceding unit 154 and of the following unit 156, where he again says ὦ Σώκρατες. ἔστιν γάρ answers 154's ἀληθῆ λέγειν, so this is Socrates between the two Cebes anchors.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0160
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 72e-73a
char_span:
  start_char: 37237
  end_char: 37671
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 40558cacd97e6a319c69e004059b2c9f4b5692e1eed686a06fafe302b608fd6b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers} ὑπολαβών
    start_char: 37246
    end_char: 37281
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0161
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73a
char_span:
  start_char: 37676
  end_char: 37825
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6115a2f0ad315631d15ca29360692c858d6d018c1ac7f2cfac6320eaba80e93a
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers} ὑπολαβών
    start_char: 37707
    end_char: 37744
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0162
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73a-73b
char_span:
  start_char: 37830
  end_char: 38178
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 91dc016ef9b1438ed89bc8e51b94acb987fd326f1f818fbde17d4b4dd4455bdc
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 37844
    end_char: 37870
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0163
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73b
char_span:
  start_char: 38183
  end_char: 38366
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dca1130eeec98839e89c37c027bc0ad741c4de4774106eeaee3ba275af709878
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, πείθῃ, ὦ {pers} Σιμμία {/pers} , ὁ {pers} Σωκράτης {/pers}
    start_char: 38202
    end_char: 38265
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0164
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73b
char_span:
  start_char: 38371
  end_char: 38653
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ca538a71dc059186967cc542801e05464443d2d323d0928f98877f7c5f005a1d
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Σιμμίας {/pers}
    start_char: 38406
    end_char: 38438
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0165
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73c
char_span:
  start_char: 38664
  end_char: 38776
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f642d9fd39569f49a9f3fd187b332426dc01f9a0ffaa7095008785fe583f7030
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 38179
    end_char: 38795
    text_sha256: bab005b79875eae73b5560f8e6d558c027fa76a5305dc04b6aa3223791cb0209
  rationale: ANCHOR ΣΙΜ. at 160 ends by asking to hear πῇ σὺ ἐπεχείρησας λέγειν, addressing the σύ of ANCHOR ΣΩ. at 159. τῇδ’ ἔγωγε answers that interrogative πῇ with its correlative and a first-person pronoun, so the speaker is the man Simmias just addressed, Socrates; ἦ δ’ ὅς is third person and excludes Phaedo.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0166
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73c
char_span:
  start_char: 38781
  end_char: 38794
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 26895a1800a97f5d80fb47e17abfab1efc2a8e532273b21078fdafe4c13ca563
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 38660
    end_char: 39132
    text_sha256: e92d62bfa53af107d9a3367aa9718284d27178d3852c046e871af7113e692d0d
  rationale: Third-person ἔφη excludes Phaedo. The unit grants the ὁμολογοῦμεν γὰρ δήπου premise put in 161 by Socrates, and the party being questioned in this exchange is Simmias, anchored at 160, 168 and 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0167
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73c-73d
char_span:
  start_char: 38799
  end_char: 39131
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 48e4460f0c21800aaf1875a8558cc315599ec49f96a78c13fc2ad57d0b635d5e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 38660
    end_char: 39148
    text_sha256: 6a3d7aec93da94621a7990ccec29b9eb686e7cec37b58e785d144807e5ac69bd
  rationale: καὶ τόδε ὁμολογοῦμεν resumes the speaker's own ὁμολογοῦμεν γὰρ δήπου of 161, whose owner is fixed as Socrates by the σύ of ANCHOR ΣΙΜ. 160 and by ANCHOR ΣΩ. 159; the further question is then put to the same respondent, who asks for clarification at 164.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0168
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73d
char_span:
  start_char: 39136
  end_char: 39147
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 906af4c8f88e878699f158e66f39dbd23a0617b5107701f6fc8aeb3d2b918d7b
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 38795
    end_char: 39206
    text_sha256: c3b12d0cacf89c08d53330a4944e328a5dc5fcfceff5d9ef44a80e78609ff112
  rationale: πῶς λέγεις; demands clarification of the definition offered in 163, and 165 supplies it with οἷον τὰ τοιάδε; the demand therefore comes from the questioned party, Simmias, anchored at 160 and 168 as Socrates' interlocutor here.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0169
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73d
char_span:
  start_char: 39152
  end_char: 39205
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7cc97a4c8f58a2882c555b56bbedbbe407f4f573bab029e4cc448ca4dc6dc5d2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 38795
    end_char: 39222
    text_sha256: 94139d9d83452d7f89fe829f08b42c04bff0ec76f8a8ec78bf579ba21f6c5cad
  rationale: οἷον τὰ τοιάδε answers the πῶς λέγεις; of 164, so it is spoken by the owner of the account being queried, i.e. the speaker of 163, Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0170
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73d
char_span:
  start_char: 39210
  end_char: 39221
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39148
    end_char: 39559
    text_sha256: 8e6eb9d2035a2fafaaea04968cec12097e728e9697a03ec300408405b6218275
  rationale: πῶς γὰρ οὔ; concedes the example given at 165 by Socrates; the conceding party in this bounded exchange is Simmias, anchored immediately after at 168.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0171
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73d
char_span:
  start_char: 39226
  end_char: 39558
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 758e9d82de21c7815eecaa8622bf4ca14fee380cfd0990e5406538f67b887494
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39148
    end_char: 39637
    text_sha256: 54d6aae279b4e0c7acd006d41af274964c5f4c38985dac0d91e711c1db662b6d
  rationale: Simmias is named in the third person as the object seen, Σιμμίαν τις ἰδών, which excludes Simmias as speaker. ANCHOR ΣΙΜ. at 168 replies μυρία μέντοι, echoing this unit's closing ἄλλα που μυρία, so the two are different voices and this one is Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0172
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73d
char_span:
  start_char: 39563
  end_char: 39630
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 47feea4d8d22c194e00c305f5f195ba2a78d929ee8fae22ff4e974fff0f28bbe
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 39600
    end_char: 39628
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0173
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73e
char_span:
  start_char: 39641
  end_char: 39787
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3f3883a52f7449f231c29b7330c52d13eb1608bd4f372336d1e4b981882576a5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39222
    end_char: 39811
    text_sha256: 1722d6a723b1c315003f1652a5abe5d7e126ced6bb16f5cd6ee1f74eac795114
  rationale: ἦ δ’ ὅς is third person and excludes Phaedo. τὸ τοιοῦτον gathers up the examples set out in 167, whose speaker is not Simmias, and puts them as a question that ANCHOR ΣΙΜ. answers at 170; the questioning voice is therefore Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0174
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73e
char_span:
  start_char: 39792
  end_char: 39810
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 454e45c9f21e97e13965ee30c89e5226f8c94ba04e95f24c5c116d7ec98ef3b2
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39637
    end_char: 39975
    text_sha256: 0eef6dcf386ec32c963b955e88c468d0a6947928b239d02ae6910c883e4b337a
  rationale: Third-person ἔφη excludes Phaedo; the unit assents to the question of 169, and the respondent throughout this stretch is Simmias, anchored at 168 and 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0175
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73e
char_span:
  start_char: 39815
  end_char: 39974
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8083e16cd755ac0cb7b584a325086aed1c2b1156e1a87cb441b7b9ffb5306bf0
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39637
    end_char: 39988
    text_sha256: b401119b6ffd2e95a4534474d719d72e0e7aafaacbd58c2a4e58b1ba642cec52
  rationale: Simmias appears in the third person as the thing seen, Σιμμίαν ἰδόντα γεγραμμένον, which excludes him as speaker; ἦ δ’ ὅς excludes Phaedo, leaving the questioner Socrates, anchored at 159 and 168's addressee.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0176
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73e
char_span:
  start_char: 39979
  end_char: 39987
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39811
    end_char: 40094
    text_sha256: 1534551a37968d4b6ad8908dc46ea9e256943936fc87bef02692d55ed0b369d8
  rationale: Bare assent to the question of 171, which was put by the speaker who names Simmias in the third person; the answering party is therefore Simmias, anchored at 168 and 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0177
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 73e
char_span:
  start_char: 39992
  end_char: 40087
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f64a9b9064dfad7f75193fb97635a47b99e83af36aaa83c85e7110e6f16b294a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39811
    end_char: 40116
    text_sha256: 66ebc588c31d83706783d0b8de591337c6153d084fb953c7e488b43083e66ede
  rationale: Both Σιμμίαν and αὐτοῦ Σιμμίου stand in the third person, excluding Simmias as speaker, and the unit extends the question of 171 with οὐκοῦν καί; the speaker is the questioner Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0178
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40098
  end_char: 40115
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7a565c2ed10ea1a24258a8b8c67aa133eb1d86559e835f6d8555ed321ba37005
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39988
    end_char: 40221
    text_sha256: 919fd90252dd6c5f2be9686c156d2164e3376f8a832c1c19edb6bc73472889c9
  rationale: ἔφη excludes Phaedo; ἔστι μέντοι grants the question of 173, which named Simmias in the third person, so the granting voice is Simmias, anchored at 168 and 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0179
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40120
  end_char: 40220
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4b69176ba18a678afb50908727e1ea6d41c490d3366a093864dcef82a4bfb36b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 39988
    end_char: 40236
    text_sha256: f53414d2462a6177a81507f1471a3faf24def47eafc6529d8988792408de094c
  rationale: κατὰ πάντα ταῦτα draws the general conclusion from the speaker's own series of examples at 167, 171 and 173, whose owner is not Simmias, and the conclusion is conceded at 176; the speaker is Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0180
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40225
  end_char: 40235
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fbc901b2333106a761c2a2e5595b662709a7e4af269d982d6d064e9faa5b6b04
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 40116
    end_char: 40407
    text_sha256: dd2368301c4028b1c56d4cc826ef5244c21f6272d9c50a6fae1d3fa219239163
  rationale: συμβαίνει is a bare lexical echo-answer to the συμβαίνει of the question at 175, hence spoken by the respondent, Simmias, anchored at 168 and 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0181
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40240
  end_char: 40406
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2773aa69f65b424d5bf4982099bbd8c911d76e66c44d6db403388c82e0f57485
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 40116
    end_char: 40424
    text_sha256: e8b694b1baeac398d9decf932ba26473ed08602b5b7a3cbdb6aa83e905180ca5
  rationale: ἀλλ’ ὅταν γε ἀπὸ τῶν ὁμοίων narrows the speaker's own ἀφ’ ὁμοίων / ἀπὸ ἀνομοίων distinction just drawn at 175 and puts a further question answered at 178, so it belongs to the questioner Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0182
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40411
  end_char: 40423
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 957a4d55b1da4147f13d447b0b3012b678cd7c823196ab62661f64de79d59e7c
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 40236
    end_char: 40636
    text_sha256: dfa30f205aace0ab0a1baaadecfe7fc45d6cb5160645c0b80ea3259202c1ad95
  rationale: ἔφη excludes Phaedo; ἀνάγκη concedes the ἀναγκαῖον put in the question at 177, and the conceding party is Simmias, anchored at 168 and immediately after at 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0183
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74a
char_span:
  start_char: 40428
  end_char: 40629
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 30799fee02a604ebbff3e384371529f621719c06af4dcf734dbba938e6a64833
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 40236
    end_char: 40722
    text_sha256: a5acdd7667ffe24a6bdcb52e48047a114c763158a6708a075b6fc29723142ea6
  rationale: ἦ δ’ ὅς excludes Phaedo, and the closing φῶμέν τι εἶναι ἢ μηδέν; is answered by ANCHOR ΣΙΜ. at 180 with the echo φῶμεν μέντοι, so the speaker is not Simmias; the questioner of this exchange is Socrates, anchored at 159.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0184
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74b
char_span:
  start_char: 40640
  end_char: 40721
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9b4446ea5014828081158c3b14f1b7dcd5189ad0f1ac6e64170d751f60a00886
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 40677
    end_char: 40705
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0185
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74b
char_span:
  start_char: 40726
  end_char: 40756
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 33204be0c719e3edfd14b26ea28b1c3f87f0ec66ac10ab49e494696ded37662a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 40424
    end_char: 41207
    text_sha256: f764b71f04ec4e634779ab263ec894c08e30a35918c47bce5d66c6fee5af2536
  rationale: Unit 180 anchors Simmias in the answering seat for the question of 179, so a fresh question at 181 belongs to the other side; 181 continues that questioner's own first-person-plural series (179 φαμέν/φῶμεν, 181 ἐπιστάμεθα, 183 ἐξ ὧν νυνδὴ ἐλέγομεν), and 183 asks whence the knowledge was got, which takes up the assent of 182 rather than repeating it, so 181 and 183 are one speaker. The reply at 186 addresses that questioning voice as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0186
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74b
char_span:
  start_char: 40761
  end_char: 40778
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: edfd50eb2ddab90a1e01c1baa974a50aeaa63b72cf40d0bf1b92df80511fe020
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 40636
    end_char: 41207
    text_sha256: 4869bd50b4d8d031514db167f86d55badb0f5cce2a548e1dbcb2dc8bb7251636
  rationale: Assent to the question at 181, tagged with third-person ἦ δ’ ὅς, which excludes the narrator Phaedo; 183 then asks where the knowledge just conceded came from, so its speaker is not the one who conceded it. The answering seat is anchored to Simmias at 180 and identified as not Socrates by the ὦ Σώκρατες of 186, with no named handoff in between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0187
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74b
char_span:
  start_char: 40783
  end_char: 41064
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: af42ea26431df3b3ed6f1f188d66f58b68ce0b275e23804f0d7779de794f7d74
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 40722
    end_char: 41207
    text_sha256: f68688e1e775019025992d6d3f870460374e3857418f54517a9c3bb1e121fd9b
  rationale: The unit addresses one hearer in the second person singular (ἢ οὐχ ἕτερόν σοι φαίνεται, σκόπει δὲ καὶ τῇδε), repeating the σκόπει δή of 179 whose answer at 180 is anchored to Simmias, so the speaker is not Simmias. The answer at 186 to this same voice addresses it as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0188
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74b
char_span:
  start_char: 41069
  end_char: 41082
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 40636
    end_char: 41207
    text_sha256: 4869bd50b4d8d031514db167f86d55badb0f5cce2a548e1dbcb2dc8bb7251636
  rationale: Bare assent to the alternative closing 183, which addressed its hearer in the second person singular. That hearer's seat is anchored to Simmias at 180 and calls the questioner ὦ Σώκρατες at 186, and nothing between marks a change of respondent.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0189
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41093
  end_char: 41159
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4cd66543ffc4371c1de5d2c9ec1a4a30ecc5991b5c1b862a879a4a0028fb74e1
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 40779
    end_char: 41329
    text_sha256: 379d6a54d04612034aff4d18f025c869d8475e8a3acb2d47404dbe743f6a5ac2
  rationale: Second person singular σοι ἐφάνη puts the question to the respondent, who answers at 186 with the vocative ὦ Σώκρατες, fixing this speaker as Socrates; the μοι φαίνεται of 188 corefers with this σοι.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0190
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41164
  end_char: 41206
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 78bc4f701c00760b25bbc1c8c739e81e27b694b8ce4d95cc8ac791ecc090efca
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 40636
    end_char: 41207
    text_sha256: 4869bd50b4d8d031514db167f86d55badb0f5cce2a548e1dbcb2dc8bb7251636
  rationale: The vocative ὦ Σώκρατες proves the speaker is not Socrates, and the unit answers the σοι-question of 185. The answering seat runs unbroken from the Simmias anchor at 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0191
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41211
  end_char: 41274
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1a4f5b79f0a5bcb47a04775c4d1fe7056e0e08713d9e49bea0b9c74346485926
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41089
    end_char: 41329
    text_sha256: 8ff2de3d25493a911c9f0a9bb62ec4eabaa431bd4a04cd4bab01e955a8465320
  rationale: Draws the ἄρα-inference from the answer just given at 186, which addressed its hearer as ὦ Σώκρατες, and is tagged ἦ δ’ ὅς, third person, excluding the narrator; the reply at 188 again addresses this speaker as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0192
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41279
  end_char: 41328
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5a3da93b58f23f06545f361ae996d3411b8e073b590742feaad57fb98b60ddec
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 40636
    end_char: 41329
    text_sha256: 678857c68465a38ac3cb33028a7752d2e795d3da28bed54a6a5cd5e38cd59e1d
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and μοι φαίνεται answers the σοι ἐφάνη of 185 as taken up at 187. The answering seat is anchored to Simmias at 180 with no named handoff in between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0193
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41333
  end_char: 41453
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: caefed8d950b49a917054884270b4c57dd293f5350b9f7a57a2802db21123f6a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41483
    text_sha256: 711bd833c71dcce920f3db07a22a0fe060b41739b8f03f341836383e0158ae49
  rationale: The second person singular perfects ἐννενόηκάς τε καὶ εἴληφας address the man who has just called this speaker ὦ Σώκρατες at 188, and ἔφη is third person, excluding the narrator; the unit resumes its own earlier question about whence the knowledge of the equal was got.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0194
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41458
  end_char: 41482
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9cf5deec2a389e9e08a4c731313e5eefe23e8ec99792e601d76e001dcbe467ab
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41483
    text_sha256: 711bd833c71dcce920f3db07a22a0fe060b41739b8f03f341836383e0158ae49
  rationale: λέγεις is second person, so the speaker is answering the man who spoke 189, and ἔφη excludes the narrator. That answering seat addressed its interlocutor as ὦ Σώκρατες at 188 and is anchored to Simmias at 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0195
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41487
  end_char: 41528
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 91e78bcbd725adc16a113eb97c2874f93dde713427a8c6ba996b8925edfc475b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41706
    text_sha256: b610fdb6cfaffea5dabd9dcd4333f6fc6ce7081b40295a3ed524c426e70e1dd5
  rationale: Continues the questioner's own alternative pair ὁμοίου / ἀνομοίου, which 193 resumes as εἴτε ὅμοιον εἴτε ἀνόμοιον, so 191 and 193 are one speaker and 192 the assent between them. That speaker is the one addressed as ὦ Σώκρατες at 188.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0196
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c
char_span:
  start_char: 41533
  end_char: 41541
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41706
    text_sha256: b610fdb6cfaffea5dabd9dcd4333f6fc6ce7081b40295a3ed524c426e70e1dd5
  rationale: Bare assent standing between the questioner's paired units 191 and 193, which resume each other's ὅμοιον / ἀνόμοιον wording. The assenting seat is the one that addressed Socrates by name at 188 and is anchored to Simmias at 180.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0197
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74c-74d
char_span:
  start_char: 41546
  end_char: 41705
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a41b8aa1841fb5470f2ffeee96572a299c071ff4ff1b9db16c3e7e9d6d034f19
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41724
    text_sha256: 34b1e081076bc8c7e73a5287e65b9e6bd1dd006acb4bde37f11c297f0e236836
  rationale: Tagged twice in the third person (ἦ δ’ ὅς, ἔφη), which excludes the narrator, and addressed to a single hearer in the second person (ἄλλο ἰδὼν ... ἐννοήσῃς); it resumes the ὁμοίου / ἀνομοίου of its own 191, and its addressee is the man who called this speaker ὦ Σώκρατες at 188.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0198
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74d
char_span:
  start_char: 41710
  end_char: 41723
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41724
    text_sha256: 34b1e081076bc8c7e73a5287e65b9e6bd1dd006acb4bde37f11c297f0e236836
  rationale: Bare assent to 193, whose second person singular ἐννοήσῃς addresses the respondent. That respondent addressed the questioner as ὦ Σώκρατες at 188 and is anchored to Simmias at 180, with no named handoff between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0199
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74d
char_span:
  start_char: 41728
  end_char: 41944
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 58bf595a04e4c8c24548c5a2c6dda542c04a26b626d7a8f6f5c67144e8fdd9a5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41974
    text_sha256: 12f1b383237b190b2737e13722a6b5ba328d31a8bcc44bb3a099b3bf74ca8009
  rationale: ἦ δ’ ὅς is third person and excludes the narrator, and the unit resumes the questioner's own earlier wooden-and-stone example (οἷς νυνδὴ ἐλέγομεν τοῖς ἴσοις, taking up 183 ἐξ ὧν νυνδὴ ἐλέγομεν). The man who answers this voice called it ὦ Σώκρατες at 188.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0200
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74d
char_span:
  start_char: 41949
  end_char: 41973
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1779caf7e990dc31b9c79240cd3b247a232a8e2ed11bfb015f8ac5b7929adb51
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 41275
    end_char: 41974
    text_sha256: 12f1b383237b190b2737e13722a6b5ba328d31a8bcc44bb3a099b3bf74ca8009
  rationale: ἐνδεῖ is a lexical echo-answer to the ἐνδεῖ τι ἐκείνου of 195, so this unit answers that question, and ἔφη excludes the narrator. The answering seat is anchored to Simmias at 180 and shown not to be Socrates by the vocative at 188.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0201
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74d-74e
char_span:
  start_char: 41978
  end_char: 42299
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7d898e3e7f1ca885ee24387a65ab64344e7f0fbc9c9b1c6302ae4b1eba20a107
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41724
    end_char: 42879
    text_sha256: dfe6cf26a46f15cc8b43bbe3f531ee0e0c53152d6b1dec17dbf5e70f5f5b1986
  rationale: First person plural ὁμολογοῦμεν collects what has been conceded and resumes the ἐνδεῖ of the same speaker's 195 (ἐνδεῖ δὲ καὶ οὐ δύναται τοιοῦτον εἶναι). The reply at 204 to this questioning voice addresses it as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0202
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74e
char_span:
  start_char: 42304
  end_char: 42311
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 40636
    end_char: 42312
    text_sha256: f099e8a5a3d67dad989c7f29e023a42f52b615e3d90d187f0a18b57f728a6c43
  rationale: Bare assent to the question of 197, which 199 immediately builds on with a further question, so 198 belongs to the other seat. That seat addressed the questioner as ὦ Σώκρατες at 188 and is anchored to Simmias at 180 with no named handoff between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0203
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74e
char_span:
  start_char: 42316
  end_char: 42394
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4d66afe34567b5d317502c3d81045ccae742afe170d41cb13fb48c3bde7bda23
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41724
    end_char: 42879
    text_sha256: dfe6cf26a46f15cc8b43bbe3f531ee0e0c53152d6b1dec17dbf5e70f5f5b1986
  rationale: A further question in the questioner's own first person plural, resuming his περί τε τὰ ἴσα καὶ αὐτὸ τὸ ἴσον from 195 verbatim. The answer at 204 to this same voice addresses it as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0204
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74e
char_span:
  start_char: 42399
  end_char: 42412
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 565437618a639ab1096db26305fcb27d6b07dc12d1fed81e9295a583f0756e1e
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 42312
    end_char: 44499
    text_sha256: 3089ee15a73d8f259c60566274ca7bdf17d6036f0288d3507a11b71eccc0d674
  rationale: Bare assent to 199. The assenting seat addresses the questioner as ὦ Σώκρατες at 204 and 208 and is itself addressed as ὦ Σιμμία by that questioner at 217, and no named handoff occurs anywhere in the chain.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0205
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 74e-75a
char_span:
  start_char: 42417
  end_char: 42594
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 98a4063d34a8de1dfcf11a5805c72c894b1fa56e245f3d2d111927535c9d3406
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 42312
    end_char: 43047
    text_sha256: 9ef48301b083dfdf5b0348ece2c3e9e840bc5e304b73828bfb1fc05a94743613
  rationale: ἀναγκαῖον ἄρα draws the consequence of the assent given at 200 to this speaker's own 199, and its ὀρέγεται ... ἐνδεεστέρως is resumed word for word at 205. The reply at 204 addresses this voice as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0206
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75a
char_span:
  start_char: 42599
  end_char: 42610
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 42413
    end_char: 44499
    text_sha256: ce4366f36a3f588122f252ef4802142d11d03ccd9c370ca6e6330bcc6c38d2ad
  rationale: Bare assent to 201; 203 then adds a further concession (καὶ τόδε ὁμολογοῦμεν) resuming the ὁμολογοῦμεν of 197, so 201 and 203 are one seat and 202 the other. That other seat says ὦ Σώκρατες at 204 and 208 and is addressed as ὦ Σιμμία at 217.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0207
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75a
char_span:
  start_char: 42615
  end_char: 42792
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3406a313b33be4c82acc65a2a0e781484feeb0c95075e4f684a09629a4f8096c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 41974
    end_char: 42879
    text_sha256: f5e4bcc5a31aacdd71262aa9ac6d62eb9cce37852ee8d6574c708021ca101731
  rationale: καὶ τόδε ὁμολογοῦμεν resumes this speaker's own ὁμολογοῦμεν of 197, and the ταὐτὸν δὲ πάντα ταῦτα λέγω that closes it is echoed straight back at 204 by ταὐτὸν γὰρ ἔστιν, ὦ Σώκρατες, whose vocative fixes this speaker as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0208
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75a
char_span:
  start_char: 42797
  end_char: 42878
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9229f420bf2657458a48b974242dcf3725fd85abe5cbe8d8445a3411e2efb2eb
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 42611
    end_char: 44499
    text_sha256: 2ca01c65dbd70be4d6544c9ca638aafe55f1ddc6c9d1a1cabd065985c36dd2af
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and ταὐτὸν γὰρ ἔστιν is a lexical echo-answer to the ταὐτὸν δὲ πάντα ταῦτα λέγω of 203. This same answering seat is addressed as ὦ Σιμμία by the questioner at 217.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0209
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75a-75b
char_span:
  start_char: 42883
  end_char: 43046
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 350faf680685ed062000f84b1a4bb5f8acf50dbf18729b33adc1c48f77a285a8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 42793
    end_char: 43058
    text_sha256: 085e1da2fb14d898216f86d2d7425b844702687d7043996bcf3cda1eb1f4c20d
  rationale: ἢ πῶς λέγομεν; puts a question to the interlocutor who has just addressed this speaker as ὦ Σώκρατες at 204, and 206 answers it with οὕτως.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0210
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75b
char_span:
  start_char: 43051
  end_char: 43057
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 30860861884e5a23e0ee536893a55b4a528ad8c486ed5c269deeeff0c0455e75
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 42879
    end_char: 44499
    text_sha256: 13a69ca41ad5edcadd6fe8009ff070cd8fb852dd373716b82bb6e1c6343a3477
  rationale: οὕτως answers the ἢ πῶς λέγομεν of 205. The answering seat addresses the questioner as ὦ Σώκρατες at 204 and 208 and is named ὦ Σιμμία by him at 217, with no handoff between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0211
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75b
char_span:
  start_char: 43062
  end_char: 43321
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c05758286af3b1fd44598160aba437b59e435139bdbccd96da423d1c4dd969e2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 43047
    end_char: 43382
    text_sha256: 6a0482242d2f5771bdff8dfe21d030ec03c1e67f19547578261f550fc5c0b98c
  rationale: Draws the ἄρα-consequence of the agreement given at 206 and is answered at 208 by ἀνάγκη ἐκ τῶν προειρημένων, ὦ Σώκρατες, whose vocative fixes this speaker as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0212
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75b
char_span:
  start_char: 43326
  end_char: 43381
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d9d9593514a092c7eb28dbede254e7ae0e5ac025d294f2d920b1668c16cdf64e
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 43058
    end_char: 44499
    text_sha256: 1ac66c784e3e411a7be24ada2304123335257637d64c526e2581344d6d0a7471
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and the unit answers 207 by appealing to what has already been said. The questioner addresses this same respondent as ὦ Σιμμία at 217.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0213
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75b
char_span:
  start_char: 43386
  end_char: 43465
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: efab93aecad77317911eae22f54cacd2d23743297fcf556b544bda22b85092c7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 43322
    end_char: 43485
    text_sha256: dc321de3728a935718510484572bca429cc00f2c274362edeb558d55d31e2a24
  rationale: A fresh οὐκοῦν-question put to the man who has just addressed this speaker as ὦ Σώκρατες at 208, and answered at 210.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0214
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75b
char_span:
  start_char: 43470
  end_char: 43478
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 43382
    end_char: 44499
    text_sha256: b64bb73f376666222a1a5698b9f2ab66be7daf9b6da4ea682b15c14fe13d21a6
  rationale: Bare assent to 209, from the seat that addressed Socrates by name at 208 and is addressed as ὦ Σιμμία by the questioner at 217, with no named handoff in between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0215
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75c
char_span:
  start_char: 43489
  end_char: 43552
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f921410572b728a28c09a426ea30555f1a41468402115f045565fdece5f5db6c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 43322
    end_char: 43562
    text_sha256: a3ee1c5974b6466a73b0f026bea300c8ea7e2147fac38fb6133ae649f433593a
  rationale: ἔδει δέ γε, φαμέν resumes this speaker's own τυχεῖν ἔδει που εἰληφότας ἐπιστήμην αὐτοῦ τοῦ ἴσου from 207, the unit whose answer at 208 addressed him as ὦ Σώκρατες; 212 is the reply.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0216
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75c
char_span:
  start_char: 43557
  end_char: 43561
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 43485
    end_char: 44499
    text_sha256: 192b70e43bbedd01c55454b6fb2631a207318c63606a7a0c6c402b4ac1bbb1f1
  rationale: Bare ναί answering the question of 211. The answering seat addressed the questioner as ὦ Σώκρατες at 208 and is addressed as ὦ Σιμμία by him at 217.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0217
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75c
char_span:
  start_char: 43566
  end_char: 43624
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4bf293db694c1e9a74b0299ab0d2db3b28bad4c3f7e536ae06d9189563de44f7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 43322
    end_char: 44176
    text_sha256: 11415ef14aeefc623cb4a2b1e03820aa06ce285dbddf365c8fb4132a389ea042
  rationale: The wording of this unit is resumed by 215 (λαβόντες αὐτὴν πρὸ τοῦ γενέσθαι), so 213 and 215 are one speaker, while 214's ἔοικεν is a lexical echo-answer to this unit's ὡς ἔοικεν and therefore belongs to the other seat. That speaker is the one addressed as ὦ Σώκρατες at 208.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0218
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75c
char_span:
  start_char: 43629
  end_char: 43636
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 846bee64ad356fc6d99fe20f5e4df9b9d92b5bab24924c0fbbacbe654b2353d7
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 43562
    end_char: 44499
    text_sha256: 964f54e5f903dda4875930372be8d2bcd390b1ded8c82d11d02a54d9b2875be2
  rationale: ἔοικεν echoes the ὡς ἔοικεν of 213 as an assent, so it is not the speaker of 213, whose wording 215 resumes. The assenting seat is addressed as ὦ Σιμμία at 217 and answers there with ὦ Σώκρατες at 218.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0219
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75c-75d
char_span:
  start_char: 43641
  end_char: 44175
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e26fd5b2b952726e16974ad27f75cdd0edab985cf38c8d4684d5887cb53250c3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 43625
    end_char: 44499
    text_sha256: 51dd62960550832b937425780fafde17edfecfdfa079efe0653b07b07b112747
  rationale: Resumes 213's λαβόντες ... πρὸ τοῦ γενέσθαι as its own protasis and runs on into 217, where the same speaker addresses his interlocutor as ὦ Σιμμία and is answered at 218 with ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0220
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75d
char_span:
  start_char: 44180
  end_char: 44191
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 43637
    end_char: 44499
    text_sha256: 9185cf0d8d84d2309fe536d19d68b8f9ccb2e14eb86f6e3b415c3bdf539a09e4
  rationale: Bare assent to 215. The next question, 217, addresses this respondent as ὦ Σιμμία, and his answer at 218 addresses the questioner as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0221
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75d
char_span:
  start_char: 44196
  end_char: 44441
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 08ffc1885395704f1e4d96c284f09602b0c1f8313e32ada8f92196ec8b0498af
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 44176
    end_char: 44499
    text_sha256: edc5655126f32dbea189b3225680728c73c763ffba9164f4542043da868d76f8
  rationale: The vocative ὦ Σιμμία proves the speaker is not Simmias, and the answer at 218 addresses him as ὦ Σώκρατες; the unit also continues the conditional opened at 215.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0222
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75e
char_span:
  start_char: 44452
  end_char: 44498
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1e7d49270e104003834838cdea1ad13431edf4c2bd9e640fa7e9e8ed0413a4bd
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 44192
    end_char: 44499
    text_sha256: 36d6710aeb941ca94dfb37f302c328cea9c573acb7b9608dbf460a6e574f789a
  rationale: Answers the question of 217, which named its addressee ὦ Σιμμία; ἔφη is third person and excludes the narrator, and the vocative ὦ Σώκρατες excludes Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0223
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75e
char_span:
  start_char: 44503
  end_char: 44795
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6bce3641fda40199bb2a301f72faa4b8678198306a50d95eeb15648db50d803b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 44192
    end_char: 44815
    text_sha256: 4cf399a7d427c4d9269cefae6aca9a60a045f26fa5c23bf4f4b1ea349352ffbf
  rationale: εἰ δέ γε is the answering limb of the καὶ εἰ μέν γε λαβόντες of 217, so this continues the speaker who there addressed his interlocutor as ὦ Σιμμία and was answered ὦ Σώκρατες at 218; 220 assents to it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0224
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 75e
char_span:
  start_char: 44800
  end_char: 44808
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 44192
    end_char: 44815
    text_sha256: 4cf399a7d427c4d9269cefae6aca9a60a045f26fa5c23bf4f4b1ea349352ffbf
  rationale: Unit 217 addresses ὦ Σιμμία and 218 answers ὦ Σώκρατες, fixing the questioner as Socrates and the respondent as Simmias; 219 continues 217's εἰ μέν γε ... εἰ δέ γε construction, so it is the same questioner, and 220 is the bare assent answering its closing question.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0225
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76a
char_span:
  start_char: 44819
  end_char: 45199
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ebf630732849316ec9b9afd600c894291fe551fef51f73f762b06f1d0f1a5e67
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 44499
    end_char: 45256
    text_sha256: f1e4fce0fb0e48be2d1bde61fbc1ca5d32937fa59f37a6e521cf0f53b1926627
  rationale: The opening γάρ grounds the claim just put in 219, and ὅπερ λέγω resumes the speaker's own earlier ὅπερ λέγω, so 221 continues the questioner's voice rather than the answerer's; the reply at 222 is addressed ὦ Σώκρατες, which excludes Socrates from 222 and leaves him as the speaker addressed.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0226
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76a
char_span:
  start_char: 45204
  end_char: 45255
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1e62763cb47cee4ad8d679e27560f16f7fd7c4f03f678946753672e2cdf44b69
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 44815
    end_char: 45467
    text_sha256: a0547be0af4feaafd11c0f25824bd10a07b17e5d47de4a56d66181fa0add0869
  rationale: The vocative ὦ Σώκρατες excludes Socrates and the third-person frame excludes the narrator Phaedo; the very next unit turns to the same interlocutor by name, πότερον οὖν αἱρῇ, ὦ Σιμμία, taking up the δυοῖν θάτερα choice of 221, and 224 answers it ὦ Σώκρατες, so the man assenting at 222 is Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0227
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76a-76b
char_span:
  start_char: 45260
  end_char: 45402
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b8c73fbdf7396e9b5384d28f3b0592355ef875da84f3f9a3583489a75d3b5c1e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 45256
    end_char: 45467
    text_sha256: 539b5c94fa761e2d287109e52c81746517864735ba4ff81f4b07b57d53d09b58
  rationale: The vocative ὦ Σιμμία excludes Simmias; the answer at 224 echoes the question's verb (αἱρῇ, ἑλέσθαι — οὐκ ἔχω ... ἑλέσθαι) and is addressed ὦ Σώκρατες, so the man who asked is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0228
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76b
char_span:
  start_char: 45407
  end_char: 45466
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e0362da794e960a70584c46d132841df32dd0cdeaee4754bc24644c037d950e0
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 45256
    end_char: 45467
    text_sha256: 539b5c94fa761e2d287109e52c81746517864735ba4ff81f4b07b57d53d09b58
  rationale: The vocative ὦ Σώκρατες excludes Socrates; the unit is the lexical echo-answer (ἑλέσθαι) to a question addressed by name to Simmias in 223, so the respondent is Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0229
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76b
char_span:
  start_char: 45471
  end_char: 45588
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: eac2e59dd99a243b8cf1848f65fe7e9550551e4bd4cb608fb54efe8b2e6a72cd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 45256
    end_char: 45640
    text_sha256: b8552cc5973509a7a1fae451fb2a157b4064166f4ff7132e864bb135ae2d0644
  rationale: τόδε ἔχεις ἑλέσθαι picks up the respondent's own οὐκ ἔχω ... ἑλέσθαι of 224 and puts the same second-person question back to him, so the speaker is the questioner of 223, whom 224's vocative identifies as Socrates; 226 answers ὦ Σώκρατες, confirming Socrates is not the answerer here.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0230
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76b
char_span:
  start_char: 45593
  end_char: 45639
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a62e849d522802803b4e16ab0931d9e3ce0a160fb2ecc539c736bd6eae975a07
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 45256
    end_char: 45878
    text_sha256: 1907296bd155e29ffcb18344efad8405866b3d5e2570c6792ea4a0ae0b8e5eb9
  rationale: The vocative ὦ Σώκρατες excludes Socrates and the third-person ἔφη excludes the narrator Phaedo; the unit answers a question put in the second person to the man named in 223 as Σιμμίας, and the same respondent is fixed by name at the anchor in 228.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0231
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76b
char_span:
  start_char: 45644
  end_char: 45719
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a4e409f9ec67c01306918f3b7a809ef205371a9a508f05ec946985d6fd524c77
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 45467
    end_char: 45961
    text_sha256: eeb5802725a7abc6529424abae32caa12cc8e8e9ba4c08db1a510952faeea1ed
  rationale: The anchor at 228 makes Simmias the answerer of this question, so the questioner is not Simmias; 229 resumes this unit's own words δοκοῦσί σοι with inferential ἄρα and addresses ὦ Σιμμία, so both belong to the same questioner, who is Socrates by the ὦ Σώκρατες of 226.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0232
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76b
char_span:
  start_char: 45724
  end_char: 45871
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f766e501ff75f4cb663ac13104f913c90a15d33726116cf8c0141e7c5b334dec
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 45742
    end_char: 45770
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0233
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 45882
  end_char: 45960
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a391d2265905a31c05b1db10f61395ffdc1eb3c964ca20342223aff0ab10e4c4
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 45640
    end_char: 45961
    text_sha256: 2ac948c38e478004663b7f09be6c736898e89c506e6b79d4e6585f1aeba91244
  rationale: The vocative ὦ Σιμμία excludes Simmias and ἔφη excludes the narrator; the unit repeats the speaker's own δοκοῦσί σοι ... πάντες from 227 with ἄρα, drawing the inference from the anchored reply of Simmias at 228, so it is the same questioner, Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0234
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 45965
  end_char: 45973
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1a02d4b8712962cc615e39c04988ae411a1e8af7afca8f67d2718a5616960989
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45720
    end_char: 45974
    text_sha256: 99452f4b841119e3f2b34ff384f562ec9d958bbb83bcde4da88cd83eae778002
  rationale: The anchor at 228 names Simmias as the man being questioned, 229 addresses him by name, and 230 is the bare negative answer to that question, so it belongs to the addressee.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0235
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 45978
  end_char: 46012
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 134a9a3d17da596b93e43f6539038cb9172a36646c724d0b410d9c995c4f853a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: This short exchange is closed at both ends by vocatives from the same two men — 229 ὦ Σιμμία from the questioner, 237 ὦ Σιμμία from the questioner and 238 ὦ Σώκρατες from the answerer — and inside it each unit is either an ἄρα-inference drawing on the preceding assent or a bare assent to it; 231 draws the ἄρα inference from 230 and is therefore the questioner's, Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0236
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46017
  end_char: 46024
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0395b75c00d3fa87ea546edb0d16981a71db720c0e530b33fd0771658dbdf3dc
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: ἀνάγκη is the bare assent answering the question of 231 inside an exchange bounded at 229 and 237–238 by vocatives that fix Socrates as questioner and Simmias as answerer; the assent is the answerer's.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0237
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46029
  end_char: 46117
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 230d916fd72875e3f2c68f4ae7750cc61f478f6f7331ae6791638a487473be34
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: An interrogative (πότε ...;) with its own supporting γάρ clause, put to the interlocutor within the exchange whose questioner is fixed as Socrates by the vocatives at 229 and 237 and by the ὦ Σώκρατες of 238.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0238
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46122
  end_char: 46130
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: οὐ δῆτα is the bare answer conceding the γάρ clause of 233 (οὐ γὰρ δὴ ἀφ' οὗ γε ἄνθρωποι γεγόναμεν), so it belongs to the answerer of this bounded exchange, Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0239
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46135
  end_char: 46148
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 449e949b12b5f1998585e5939ad666061776a3fbf6743da1f683ca2d442043d5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: πρότερον ἄρα continues the questioner's chain of ἄρα inferences (231, and 237 ἦσαν ἄρα) built on the answerer's concessions, and it is itself answered by ναί, so it is Socrates'.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0240
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46153
  end_char: 46157
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 45878
    end_char: 46416
    text_sha256: 24445eb1845e7c4690be9c577a140f9d8e4e0eeb06cfedc0c7c47f821337cd9e
  rationale: ναί is the bare assent to the inference of 235, and the assenting role in this exchange is fixed to Simmias by the questioner's vocatives at 229 and 237 and by the ὦ Σώκρατες of 238.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0241
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46162
  end_char: 46285
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5f8c7908b54f9c39ab89988defdfeee5bd555e6fa125b6e5b6cb2b74544ac99b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 46131
    end_char: 46416
    text_sha256: a172ef51698007e2d3f2d6a60143f53be3bcfea71db8a4e0e52435ba6ebf2323
  rationale: The vocative ὦ Σιμμία excludes Simmias; ἦσαν ἄρα completes the speaker's own chain of ἄρα inferences (231, 235) and is answered at 238 with ὦ Σώκρατες, which fixes the speaker as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0242
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76c
char_span:
  start_char: 46290
  end_char: 46409
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 60d258d520097c0492cdce0a037a26fa036eb81002e0d9ba2cb962a9d025b6ca
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 46158
    end_char: 47679
    text_sha256: a695215d759a8da58296bc68190cbd1ab8588ba896baea0a9d74f30a71d44afd
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and the unit is the objection of the man addressed by name in 237; the same interlocutor is still being addressed at 241 (ὦ Σιμμία) and answers there under the anchor at 242, so the objector is Simmias.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0243
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76d
char_span:
  start_char: 46420
  end_char: 46616
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bc5de6038285fb89bd5fcbf1eaa058c93c73d069c920e7c793919100d88d7772
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 46286
    end_char: 46691
    text_sha256: 75e6983a00e5b34cd0303a4f1113e8f9d58821e52042e4ea4043a66eb1366b0d
  rationale: The unit answers an objection addressed ὦ Σώκρατες in 238, so its speaker is Socrates; it addresses a single interlocutor (ὦ ἑταῖρε), resumes the shared ὡς ἄρτι ὡμολογήσαμεν, and its own question is answered ὦ Σώκρατες at 240.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0244
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76d
char_span:
  start_char: 46621
  end_char: 46690
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ff43b09cfc4d10458d529607eaafb9f9f5ec7fa1f17a4ab387f1211c1ae6523b
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 46286
    end_char: 47679
    text_sha256: 42f1f989f80c38f4bcfa2d6bb48e84a371757c33e986b1c6bfd590f63ae0a932
  rationale: The vocative ὦ Σώκρατες excludes Socrates, and the first-person ἔλαθον ἐμαυτὸν οὐδὲν εἰπών retracts the speaker's own objection of 238, which the vocative of 237 assigns to Simmias; the anchor at 242 shows the same man still answering.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0245
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76d-76e
char_span:
  start_char: 46695
  end_char: 47250
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f87afb5f4ef4461567350e9d30676252d8a35445318c7d624418cf7b074b38df
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 46617
    end_char: 47679
    text_sha256: b32b65bc5785d349dd1b0522eb030256a7095ac40097ac49ac108a634b105064
  rationale: The vocative ὦ Σιμμία excludes Simmias and ἔφη excludes the narrator; the anchored reply at 242 is Simmias answering ὦ Σώκρατες, so this question is Socrates'.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0246
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 76e-77a
char_span:
  start_char: 47255
  end_char: 47678
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7d95533ac05523261fc0d36165188364c6d823f7ffb612b74663d5be93a61e93
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 47293
    end_char: 47321
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0247
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77a
char_span:
  start_char: 47683
  end_char: 47790
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4150d84b45f97cd99b0295718f904847e3e3a8d67d7e2b71f4c82fe03cd5eebf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 47716
    end_char: 47745
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0248
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77a-77b
char_span:
  start_char: 47795
  end_char: 48483
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4ec46ceeb7cee4b9bfabe42638172fd4db0a88cb4515f977146036342c59a8a2
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 47803
    end_char: 47831
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0249
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77c
char_span:
  start_char: 48494
  end_char: 48763
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fcfa059d90caa691b9d8d26a2250ff8deb7f809c337aa2c74e954431d56cc3d1
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ {pers} Σιμμία {/pers} , ὁ {pers} Κέβης {/pers}
    start_char: 48505
    end_char: 48558
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0250
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77c-77e
char_span:
  start_char: 48768
  end_char: 49598
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ba33da406a24727c818b01faf9a21d6b03fb0f4e45c972bf15200be01e09b47b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ {pers} Σιμμία {/pers} τε καὶ {pers} Κέβης {/pers} , ὁ {pers} Σωκράτης {/pers}
    start_char: 48786
    end_char: 48870
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0251
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77e
char_span:
  start_char: 49642
  end_char: 49873
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 33ab47e45f55fcd0f80cb78d900a71e25a144bf6924758b7a8764bffb5a30992
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Κέβης {/pers} ἐπιγελάσας, ὡς δεδιότων, ἔφη
    start_char: 49603
    end_char: 49658
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0252
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 77e
char_span:
  start_char: 49878
  end_char: 49965
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a664441b793748fc3a7a33b30c8b44fbdff5cbfa5cb945f5c1d849867090e3cf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 49888
    end_char: 49917
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0253
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78a
char_span:
  start_char: 49976
  end_char: 50089
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 018838b3cb523f89d9e3fdc8098f720086293263c32376ef89a4eee374c443e0
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 49874
    end_char: 50486
    text_sha256: 352960b19ee79b6e3bd270485b6b545e3af39221537310749f3eec4cb0540663
  rationale: The vocative ὦ Σώκρατες and ἔφη exclude Socrates and the narrator; the unit takes up ἐπῳδόν from the anchored Socratic ἐπᾴδειν of 248, and the reply at 250 names its addressee ὦ Κέβης, so the questioner is Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0254
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78a
char_span:
  start_char: 50094
  end_char: 50485
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5b38a64e0ee2573ac673297076be9f6efcffcd5524a6c03eb29eb2333d8135e1
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 49874
    end_char: 50608
    text_sha256: edf35f62c67b02840a90faa4a4c73f057903b3996ccec6d81e4cc39bd4d51d9e
  rationale: The vocative ὦ Κέβης excludes Cebes and ἔφη excludes the narrator; the unit answers a question addressed ὦ Σώκρατες at 249 and keeps the second-person plural of the anchored Socratic ἕως ἂν ἐξεπᾴσητε in 248 (ἀναλίσκοιτε, εὕροιτε, ὑμῶν), with Cebes anchored as the man who then accepts the instruction at 251.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0255
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78a-78b
char_span:
  start_char: 50490
  end_char: 50607
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 52c6fe824ef2f83483acfebb5b39f12bf7737022860ef0815d92266afab8a312
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὑπάρξει, ὁ {pers} Κέβης {/pers}
    start_char: 50509
    end_char: 50545
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0256
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78b
char_span:
  start_char: 50612
  end_char: 50651
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 55d8c0dd9b1e2fca4abc0e58df18a58962d50005fc69f190fd302e95a9f29f14
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 49972
    end_char: 51040
    text_sha256: c4df9b07fddc29a8244b68f77ae64a449fae305e0864325e4757e7eacf446a27
  rationale: "Unit 251 is anchored to Cebes and closes with the second-person condition εἴ σοι ἡδομένῳ ἐστίν; 252 answers it by echoing ἡδομένῳ of itself, so its speaker is that addressee and not Cebes. The addressee is Socrates: 249 is addressed ὦ Σώκρατες and answered at 250 with ὦ Κέβης, fixing the pair, and 254 anchors Socrates as the one who then leads."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0257
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78b
char_span:
  start_char: 50656
  end_char: 50675
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96754acb95a441117f72a4059526c7bfccb10a9eb2cc95f25b949db5db55c9c8
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 50486
    end_char: 51326
    text_sha256: 6455e6f64bef8d31da897be5c8d80ebfdece934e0430dd4126fd27c801a14f1c
  rationale: The 3sg ἔφη excludes the narrator Phaedo, and the unit registers approval of 252, which is Socrates', so it is not Socrates; that 254 re-introduces him with the full formula ἦ δ’ ὃς ὁ Σωκράτης confirms another voice intervened. The exchange is closed at both ends by Cebes anchors (251, 257) with no naming formula bringing in a second respondent.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0258
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78b
char_span:
  start_char: 50680
  end_char: 51039
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bcc1665dd71812a7096ec634cf05eb0b636c26be830845adb851612c8ae94def
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Σωκράτης {/pers}
    start_char: 50699
    end_char: 50732
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0259
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78b
char_span:
  start_char: 51044
  end_char: 51063
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cb3334a5fb7db84bd7fe46e5eeffeb62f0350edd054818bd5efe6cd086fc0a3c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 50676
    end_char: 51326
    text_sha256: 97531be9c0e2ce9a65d1d5296fc84ba9e74739a3557e2d2ccecb4505f30d2ad6
  rationale: It assents to the question of 254, which is anchored to Socrates, so the speaker is his interlocutor, and the 3sg ἔφη excludes Phaedo. The next assent, 257, is anchored to Cebes with no intervening handover formula.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0260
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78c
char_span:
  start_char: 51074
  end_char: 51267
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e7a1688ab28748c82cd2f98b6acf30cca311f8d3a1db689e7b0715600c43f427
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 50676
    end_char: 51326
    text_sha256: 97531be9c0e2ce9a65d1d5296fc84ba9e74739a3557e2d2ccecb4505f30d2ad6
  rationale: This question is answered at 257 by the Cebes anchor, so its speaker is not Cebes; it continues the interrogative programme announced at 254, anchored to Socrates. The next answer in the series, 261, is addressed ὦ Σώκρατες, confirming the question side is his.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0261
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78c
char_span:
  start_char: 51272
  end_char: 51325
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2f2d27aa8734739553a094acc6f00a607e55bf7e49bcfa51153267217005c584
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, οὕτως ἔχειν, ὁ {pers} Κέβης {/pers}
    start_char: 51283
    end_char: 51323
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0262
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78c
char_span:
  start_char: 51330
  end_char: 51475
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c60f20989c1306fe603c328f8c8bbd062f251bad12413251f5bcae18527ba5c8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 51268
    end_char: 52027
    text_sha256: 474cb0f63a91f04ed5e2061053c6d736f79be7dfb1df5142a8e4fd00d0c4027b
  rationale: A further question standing between two Cebes answer-anchors (257, 261), so it is not the respondent's; 261, which closes this run of questions, is addressed ὦ Σώκρατες and thereby fixes the questioner as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0263
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78c
char_span:
  start_char: 51480
  end_char: 51499
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9421e5931218b9de98126db2eb76d923ab1f182f876b0a95424b1989294745f0
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 51268
    end_char: 52027
    text_sha256: 474cb0f63a91f04ed5e2061053c6d736f79be7dfb1df5142a8e4fd00d0c4027b
  rationale: It answers Socrates' question at 258 and is bracketed by the Cebes anchors at 257 and 261, resuming the very wording of 257 (δοκεῖ μοι ... οὕτως ἔχειν / ἔμοιγε δοκεῖ οὕτως). No formula introduces another answerer inside those bounds.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0264
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78c-78d
char_span:
  start_char: 51504
  end_char: 51929
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7349a7b42f3bfcd533bb82a8f8903573cd7999cf641f5ebb23ec8e047627356f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 51476
    end_char: 52027
    text_sha256: 9708c81e6a4a59fff6c7fcac51e2ff6eaf827697abe6515116880953c8423534
  rationale: Unit 261 answers this question directly and is addressed ὦ Σώκρατες, so the questioner is Socrates; 261 is also anchored to Cebes, excluding him as the speaker here.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0265
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78d
char_span:
  start_char: 51934
  end_char: 52026
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b36f0ac0fe1440664d95c545ebaa22452cac2718fcf8d89b477ba64e10ef7819
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ἀνάγκη, ὁ {pers} Κέβης {/pers}
    start_char: 51943
    end_char: 51978
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0266
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78d-78e
char_span:
  start_char: 52031
  end_char: 52303
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e4092f61f9a9236da09788adac328a287eb1326947327a28103e709854a8f271
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 51930
    end_char: 52383
    text_sha256: ebac3c6bee3496eb06008b1805fc1a9638b981a80ec2ea5c92da8e4317b080d2
  rationale: The question sits between the Cebes anchors at 261 and 263 and is answered by the latter, so it is not the respondent's; 261's vocative ὦ Σώκρατες identifies the man being answered, and therefore the man asking.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0267
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 78e
char_span:
  start_char: 52308
  end_char: 52376
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: be5c0aefaddcd62462c988f807cd59960431d0df611f3b418c5da459900bdce4
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 52318
    end_char: 52344
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0268
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52387
  end_char: 52592
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7d352cbe15c33276e80ae45429972f8efeccaf003c9011b10b56359f1c4a2e3c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 51930
    end_char: 52628
    text_sha256: 45cff638b8dc82e848e8df9a6afd278a86d18ea19386ae74e418dcb1806f7fca
  rationale: It continues the same series of questions whose answers are anchored to Cebes at 261 and 263, the first of them addressed ὦ Σώκρατες; so the questioner is Socrates and not the answering party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0269
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52597
  end_char: 52627
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 15767a6866dd62e138a2c62d18e794bd57d516ec76d84aa0567121031c155493
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 52628
    text_sha256: 9ec68fed3e84fc78d5a565f8f7f302d1563bb8c67752c1ea365fcf54e71b2563
  rationale: An assent to Socrates' question at 264, with 3sg ἔφη excluding Phaedo; the answering role is held by Cebes at the immediately preceding anchor 263, and nothing between 263 and here marks a change of respondent.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0270
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52632
  end_char: 52702
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e4d64017f029c23e5fe344b813471ce0f1b4f6a78494b9dbeb43ac514f00c45a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 52304
    end_char: 52719
    text_sha256: 0aa2808f1563e6179921ee495e47c513eaf523a4c39e1e9fca4299da75bc6804
  rationale: The second-person βούλει shows the speaker is addressing his interlocutor, and 267 answers by echoing his θῶμεν; the questioning role belongs to Socrates, as the answers anchored to Cebes at 261-263 and addressed ὦ Σώκρατες establish.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0271
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52707
  end_char: 52718
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b0975bcd4d0e2f1ffc5ab4a69b6ace917704cb691342f2447ad3ddd3fc5774d9
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 52719
    text_sha256: 0aa2808f1563e6179921ee495e47c513eaf523a4c39e1e9fca4299da75bc6804
  rationale: A lexical echo-answer (θῶμεν) to the proposal of 266, so not its speaker; the 3sg ἔφη excludes Phaedo and the answering role runs unbroken from the Cebes anchor at 263.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0272
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52723
  end_char: 52794
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3cb20448b904a314aa7c8d3aa9f9e2285055d8d171e31eb936e99fa3707f8ac1
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 52703
    end_char: 52828
    text_sha256: c408aacbfe8ec8bba855cf7bce5fe87de0f0ca154febe0f22070ca0cf772365a
  rationale: A continuation of the proposal of 266, answered again at 269 with the same θῶμεν; it belongs to the questioning side, which the ὦ Σώκρατες of the answers in this exchange fixes as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0273
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79a
char_span:
  start_char: 52799
  end_char: 52821
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75bf8275f9a6b8d3bf2936e5368e5083e6f9bc5731d883ef41a114b09b4ef917
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 52828
    text_sha256: 18e804d8f0c7f55776b57623ad7e9a3105f6adbc402242fd01d57840c300dc4c
  rationale: καὶ τοῦτο ... θῶμεν resumes the speaker's own concession at 267, so it is the same respondent; 3sg ἔφη excludes Phaedo, and that respondent is the Cebes of anchor 263, no handover formula having intervened.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0274
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 52832
  end_char: 52898
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 01e0777131b45f9dbd51046a2cfb598533d75daba697ff5844418e67039bec50
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 52795
    end_char: 52920
    text_sha256: 16035f425a3b860bf66418a72ae5016edbea5fc31edc6bac41c7103b63d40591
  rationale: A new question (φέρε δή) put to the man who has just conceded at 269, and answered at 271; the bare ἦ δ’ ὅς matches the formula anchored to Socrates at 254 in the same questioning role, and the answers of this exchange address him as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0275
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 52903
  end_char: 52919
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6472e691459c56121c71cc9717d340db1e498a0edcb440b10eefda34a427396f
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 52920
    text_sha256: bc3a66c2872eab8ff3101d7e5fc502cde69779d441caacedefa4ddb1d4380bc2
  rationale: οὐδὲν ἄλλο answers the ἄλλο τι of 270, so it is the respondent, not the questioner; 3sg ἔφη excludes Phaedo and the respondent role has been Cebes' since anchor 263 without any naming formula reassigning it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0276
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 52924
  end_char: 52996
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a1bcc6f7c1340a0f308249318d9846dcd9fc86e3b6f081ef2d5e36c079c6b03e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 52899
    end_char: 53043
    text_sha256: f6a4ed85c540ffff84c26c302625c84ffb260478d854e544c6030b1a6c1c31a8
  rationale: A question following the concession of 271 and answered at 273, so it belongs to the questioning side of this exchange, which the vocatives ὦ Σώκρατες in its answers identify as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0277
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53001
  end_char: 53042
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: beea998bb56b94691ffec6174722e9cd6ae21f5e56f0d4b93021b1a318f48452
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53043
    text_sha256: 1660d7fdfb9b05c8fede0c707076985506804324daa2aacf57d2d623f8492448
  rationale: It answers the question of 272 with the demanded term τῷ ὁρατῷ, so it is the respondent; 3sg ἔφη excludes Phaedo, and the respondent since anchor 263 is Cebes, no formula having introduced another.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0278
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53047
  end_char: 53076
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d0297c3a89d0263d7db7607e5c661d1f977433566770b49882a250cac8110aa7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53043
    end_char: 53135
    text_sha256: 50b72deff882ed611a295dc88fdaec12de3321ea0a1ba858906732b44d21e7a1
  rationale: The answer at 275 is addressed ὦ Σώκρατες, so the man who put this question is Socrates and the answerer is not.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0279
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53081
  end_char: 53134
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f3fc22d6dfc939524891053a3f6790a998ada01cc0636101e80604c507344433
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53135
    text_sha256: 95bb07a1181c6c88c6b55a671447d14bb20c4f583f33bd41be1f7ae343dc2a5f
  rationale: The vocative ὦ Σώκρατες proves the speaker is not Socrates and the 3sg ἔφη excludes the narrator Phaedo; the answering part in this unbroken exchange has been Cebes' since anchor 263.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0280
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53139
  end_char: 53225
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3bedce873cd80d5320fc16f45e2f5a1a0351eed2f98875b0e3b73a18679880ae
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53077
    end_char: 53247
    text_sha256: c18817afbdc0758543eec94aa9dc897ae5bc187edc10986fb0a9a7b8d1d1a121
  rationale: It replies to 275, which was addressed ὦ Σώκρατες, so its speaker is Socrates; the first-person plural ἐλέγομεν with οἴει addressed to the other man keeps him in the answering role, which he fills at 277.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0281
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53230
  end_char: 53246
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9240a5bf8ac47759b2f199598e12cafbb1fc312afe58af302b060889f877f1f4
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53247
    text_sha256: cd19595492498cbd116d0ced427f961cc0ede3e0ea0a6f38bc6118acc2c37300
  rationale: A bare echo-answer picking up τῇ τῶν ἀνθρώπων φύσει from the alternative posed in 276, so it is the respondent, not Socrates; that respondent is the Cebes anchored at 263, with no intervening handover.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0282
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53251
  end_char: 53301
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f7e04dd8f49aa092ce3d9e7e3f9b01fab7f7efdf1d39f5e01856b869e364006e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53226
    end_char: 53318
    text_sha256: 6e0fe1bc118e0b48842ebb87dd38bcb9bc391b5ba24e73fb63e821442e50018a
  rationale: It resumes the questioner's own λέγομεν from 276 and puts the next alternative, answered at 279; the questioning side of this exchange is Socrates, as the ὦ Σώκρατες of 275 and 283 show.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0283
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53306
  end_char: 53317
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 919e829a6dda37a5aa4cf72e03381920b81da9abf14c401df97d43c208b6bc5e
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53318
    text_sha256: d08da5b5ee5e76f5e4f3345e2c876be2b35faffe85a76787471070461b38945c
  rationale: οὐχ ὁρατόν selects one limb of the disjunction offered in 278, so it is the answering party rather than the questioner; that party has been Cebes since the anchor at 263.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0284
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53322
  end_char: 53332
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75a8950266ad02001d33f14e9acc6b906f1239248e4915e77927fb8500f34251
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53302
    end_char: 53342
    text_sha256: 3b8142f921a4486b1500c2a221224178ecebaf759aef9ea1deffd2e1a4cb4ca9
  rationale: The inferential ἄρα draws on the concession just made at 279 and demands the assent given at 281, so it belongs to the questioner, whom the vocatives in this exchange's answers identify as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0285
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53337
  end_char: 53341
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53342
    text_sha256: 5618d124cd2e1bc975176e53861a067aa4206012228f05fe935986f88cd4901c
  rationale: A bare assent to the question of 280, hence the respondent and not its speaker; the respondent in this unbroken run is the Cebes of anchor 263.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0286
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79b
char_span:
  start_char: 53346
  end_char: 53405
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e2970e217076a85e4759e727ea01c4baf18556a2bf39b5a3a50df1e727ad0df0
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53342
    end_char: 53457
    text_sha256: bcd05bd9cd7d83ecc369b23a79d682d04eb19e89e9c889dd954c259e39caa4e8
  rationale: The conclusion drawn with ἄρα is met at 283 by an assent addressed ὦ Σώκρατες, and an assent answers the immediately preceding utterance; so 282 was spoken by Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0287
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79c
char_span:
  start_char: 53416
  end_char: 53456
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e6063793e120206424cc1b14ed74679defa3e685b80d19ae7a91cc6f0d98f434
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53457
    text_sha256: 07fd1daba9734a14a2b63b500ebe30c8e24da802ae21a12d61170953f97a7bde
  rationale: The vocative ὦ Σώκρατες excludes Socrates as speaker, and this is the same answering voice that has responded continuously since the Cebes anchor at 263, no naming formula having replaced it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0288
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79c
char_span:
  start_char: 53461
  end_char: 53836
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5e4c9750fbdf85e1b25e835618720e4c8353b559f6265759aea2c3eb348a6be5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53412
    end_char: 53856
    text_sha256: 065b71a3cece1ee01f25dd96b0ce7b3fe97d44b1457f3e2aabacb244c4b48991
  rationale: It follows the assent of 283, which was addressed ὦ Σώκρατες, and reopens the questioning with ἐλέγομεν and a request for agreement answered at 285, so the speaker is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0289
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79c
char_span:
  start_char: 53841
  end_char: 53849
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 53856
    text_sha256: 06fc95e0b94e8a29dc5fc3b390f1868ab88c70083d65896d1020f208bb668e13
  rationale: A bare assent to Socrates' question at 284, hence the respondent; the respondent of this exchange is Cebes by the anchor at 263 and the absence of any handover formula since.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0290
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79d
char_span:
  start_char: 53860
  end_char: 54213
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5dfa67e4dfcd7f90d9a897d4f7190861d243199c96a39fe7bea35a99320d23d0
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 53856
    end_char: 54287
    text_sha256: 7f6f576446e51d631b72515eda50b911a6cb721e503b500228ad496988a39ca0
  rationale: The reply at 287 says καλῶς καὶ ἀληθῆ λέγεις to the addressee ὦ Σώκρατες, so the utterance it praises is Socrates'.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0291
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79d
char_span:
  start_char: 54218
  end_char: 54286
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 365efcecbfeb3dded4553045c70c1e4f8ca1dff5fc3f5d37514606a3a147dd3a
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 54287
    text_sha256: 274cd10c01e2d1dfa8f0b58f4a3cdce4ea9ba7460cf14ae8ba314f247864d162
  rationale: The vocative ὦ Σώκρατες rules out Socrates and the 3sg ἔφη rules out Phaedo; the assenting voice throughout this stretch is the Cebes fixed at anchor 263, with no formula introducing a substitute.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0292
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79d-79e
char_span:
  start_char: 54291
  end_char: 54414
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f03c5f84d697dfb49e0e79f512a80aaeec851858972707fb243be9d56620c7eb
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 54287
    end_char: 54607
    text_sha256: a99c5af1456f337c05ab22aa27a2cec283c2ae2fbe356a677bd951e8bc9339e3
  rationale: The second-person σοι δοκεῖ addresses the other man, and his answer at 289 is directed ὦ Σώκρατες, so the questioner here is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0293
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79e
char_span:
  start_char: 54419
  end_char: 54606
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0b79590e52f32ca05e272b4d8fc655db4acef067b15925519770ee48687a00bd
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 52304
    end_char: 54607
    text_sha256: bb73ccf6c8830a561ec9e44d8149847ad3f334d50609786090740773be489edd
  rationale: The vocative ὦ Σώκρατες excludes Socrates and the 3sg ἦ δ’ ὅς excludes the narrator Phaedo; this answers 288's σοι δοκεῖ and so belongs to the same interlocutor anchored as Cebes at 263.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0294
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79e
char_span:
  start_char: 54611
  end_char: 54625
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: da4f3713d454bf1c9bac4486976ab1bb35484f070093c1c61098c0c42a3c69d5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 54415
    end_char: 54640
    text_sha256: 108e92e8409a0a0a922eae9d507c4d184db9833a8e455f7b7775c6c6e54682bf
  rationale: τί δὲ τὸ σῶμα; carries on the paired question of 288 about which kind each of the two resembles, and is answered at 291 with τῷ ἑτέρῳ; since 289 was addressed ὦ Σώκρατες, the questioner is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0295
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79e
char_span:
  start_char: 54630
  end_char: 54639
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d4e3171f195d38da01a82b3adfaa7bf54b7c99b4ae53062df770a99578bfd8a6
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 54415
    end_char: 55550
    text_sha256: a730eb74c7960ce018904e14b5f15169c0b6bfd1f682662376fb6818a3d2ef75
  rationale: Unit 290 asks τί δὲ τὸ σῶμα; and 291 answers with the bare dative τῷ ἑτέρῳ, picking up the ποτέρῳ ... εἴδει of 288, so it belongs to the answering party; that party addresses his interlocutor as ὦ Σώκρατες at 289 and 295, which excludes Socrates, and the ἦ δ’ ὅς of 289 excludes the narrator. Nothing between 291 and 296 redirects the question, and at 296 the questioner names his addressee ὦ Κέβης, whose reply at 297 echoes his ἔχομεν.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0296
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 79e-80a
char_span:
  start_char: 54644
  end_char: 54974
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0824dc88ae6c2fd3800d620664123a3fe0317f554d5a01d8af84a968aa8e0bc6
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 54415
    end_char: 55534
    text_sha256: c755423cb139985cf3280b81e618250584b93bdb61b53f0a8f9b4769b70b0dca
  rationale: The imperative ὅρα δή and the 2sg σοι δοκεῖ continue the same interrogation whose conductor his respondent addresses as ὦ Σώκρατες at 289 and 295. At 296 that same conducting voice names his addressee ὦ Κέβης, so he is not the answering party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0297
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80a
char_span:
  start_char: 54979
  end_char: 54986
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 011c325c7f0b53304d0a6a99d81651b7789627a4f6e1963e97e87ec0c5b1a1d5
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 54640
    end_char: 55550
    text_sha256: 43e66a39b61ae9317e5ee853bd2358d4384c3b8fb47fca0b82ef374981be5781
  rationale: ἔμοιγε answers the ἢ οὐ δοκεῖ σοι of 292 in the first person, so its speaker is the addressee of 292. That addressee is named ὦ Κέβης when the same questioner sums up at 296 and answers him again at 297.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0298
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80a
char_span:
  start_char: 54991
  end_char: 55016
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bd73bee4eea292f5173098e1c303d3f5b5efb3218e34bfcd91025fbcf56e36d5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 54640
    end_char: 55534
    text_sha256: 60f2263b8ef35efe54adb9cc0a69ab9a4460d67cde9d512a2922edb823a340c8
  rationale: A one-line question continuing the ποτέρῳ series of 288 and 292 and answered immediately at 295, where the answerer addresses the asker as ὦ Σώκρατες. The same voice names his addressee ὦ Κέβης at 296, so he is not the respondent.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0299
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80a
char_span:
  start_char: 55021
  end_char: 55102
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6bb55e787415c96b4812e5fe1941ec8d86d8f646f2496b632cee7fda6f620a91
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 54987
    end_char: 55550
    text_sha256: 2e76a1e54699dd0d9155ec5aad211bc817d88598e87566f1d513f9aef63ba8fe
  rationale: The vocative ὦ Σώκρατες shows the speaker is not the man he is answering, and the unit answers the ποτέρῳ question of 294. The standing respondent is named ὦ Κέβης by the questioner in the very next unit and is anchored as Cebes at 305.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0300
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80a-80b
char_span:
  start_char: 55107
  end_char: 55533
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a2340ed334dbcc228cf21c498ceb3c32175b91af25766301b75eefe23909118d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 55017
    end_char: 55550
    text_sha256: 9f8dd6bea3254136495464471d5ed0dcb46d7ca82835cf1a12b7b39567f8757e
  rationale: ἔφη is third person and excludes the narrator, and the vocatives ὦ Κέβης and ὦ φίλε Κέβης exclude Cebes. The speaker is the interrogating voice whom 295 has just addressed as ὦ Σώκρατες, and 297 answers him by echoing his ἔχομεν.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0301
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80b
char_span:
  start_char: 55538
  end_char: 55549
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d3987ba5131a3ff3a6dfd8df15faa658c54afdeeb1224744f9f46b3b2837c9fd
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 55103
    end_char: 55550
    text_sha256: 511f908e9521c1e99dd1441d7c56446b817009dc6c0cc2363ccf8456218542df
  rationale: οὐκ ἔχομεν is a bare lexical echo-answer to the ἔχομέν τι παρὰ ταῦτα ἄλλο λέγειν of 296, a question expressly put ὦ φίλε Κέβης.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0302
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80b
char_span:
  start_char: 55554
  end_char: 55684
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 52b0f386f3b77118197dcef6c794f38212f1c223975a12f96307155d8b5eb940
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 55103
    end_char: 56296
    text_sha256: 87ff1b821aa67b2795194b8ac4968a91df90a9e428dadda7ba13d3be91b5a41c
  rationale: τί οὖν; ... ἆρ’ οὐχί resumes the interrogation immediately after the respondent's answer at 297 and is itself answered at 299. The same interrogating voice carries ἔφη and a 2sg at 300 and is the one addressed ὦ Σώκρατες at 295, while 296 shows he is not Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0303
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80c
char_span:
  start_char: 55695
  end_char: 55706
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 55550
    end_char: 56305
    text_sha256: 31ee4884c005105c4b9a2830f07f8ab43f109db57cb946504c9a395223da5467
  rationale: πῶς γὰρ οὔ; assents to the ἆρ’ οὐχί question of 298, so it belongs to the respondent of this run, who is named ὦ Κέβης at 296 and 304 and anchored as Cebes at 305.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0304
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80c-80d
char_span:
  start_char: 55711
  end_char: 56295
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c035c16f44cf92ef630a0554bb07dc5ed0aef048f2920616231c824ab0643229
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 55691
    end_char: 57074
    text_sha256: 5905407ae82c9d2c6da0fed007bc43209448f6a158992cd7f4f3592b12d3ec15
  rationale: ἐννοεῖς is 2sg and ἔφη is 3sg, so the speaker is the interrogator rather than the person addressed, and not the narrator. That interrogator is the man his respondent calls ὦ Σώκρατες at 295 and 311.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0305
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80d
char_span:
  start_char: 56300
  end_char: 56304
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 55707
    end_char: 57534
    text_sha256: 0e1c84c8f707d183c8b7e5bd52b493f84aa8fd145544965362fcfadbf0284625
  rationale: ναί answers the closing ἢ οὔ; of 300, a question put in the 2sg to the single standing respondent, who is named ὦ Κέβης at 304 and anchored as Cebes at 305.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0306
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 80d-81a
char_span:
  start_char: 56309
  end_char: 57073
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f72cc454bf154c058ed38889da9086b7a1e841bb3612bddf6a78a94f3f8e4661
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 55707
    end_char: 57534
    text_sha256: 0e1c84c8f707d183c8b7e5bd52b493f84aa8fd145544965362fcfadbf0284625
  rationale: The vocative ὦ φίλε Κέβης τε καὶ Σιμμία excludes both of them, and the unit continues the same interrogation as 300, whose ἔφη is third person and so excludes the narrator. That interrogating voice is the one addressed ὦ Σώκρατες at 295 and 311, and he names Cebes again at 304.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0307
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81a
char_span:
  start_char: 57078
  end_char: 57091
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 565437618a639ab1096db26305fcb27d6b07dc12d1fed81e9295a583f0756e1e
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 56296
    end_char: 57534
    text_sha256: f687c293aa070e271066d4efbe5e4db39e7c824276d4968b2e512d10242ad5a6
  rationale: παντάπασί γε assents to the closing ἢ οὐ τοῦτ’ ἂν εἴη of 302, and the respondent on both sides of it is Cebes, named ὦ Κέβης at 304 and anchored at 305. 302 is addressed to Cebes and Simmias jointly, so Simmias could own this one assent; nothing marks a change of respondent, so I keep Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0308
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81a
char_span:
  start_char: 57096
  end_char: 57465
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5baed6bb95b3d114681f80534d5819a976e7b141c250042892697ab7db32b622
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 57074
    end_char: 57534
    text_sha256: cc712b495cea98d34600619e6cab4d0d7a6ec566352710ee7cae3915969d54be
  rationale: The vocative ὦ Κέβης excludes Cebes, and the anchored reply at 305 is Cebes answering this very question. The questioner is the voice his respondent addresses as ὦ Σώκρατες at 295 and 311.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0309
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81a
char_span:
  start_char: 57470
  end_char: 57527
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b9c606f5f3603dd4bce370cc5e9f503f00727c6b1aadccf32bc4cb06dfc3aa1c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 57499
    end_char: 57525
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0310
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81b-81c
char_span:
  start_char: 57538
  end_char: 58056
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f88720bf4c07e3336058669d51bc8fe568134f538a46326bc4a098171816ba06
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 56305
    end_char: 58082
    text_sha256: f580ccdd1cd4d9646be5e302bd952a6490bb7139a9f31f147fb9dc55daa7a78c
  rationale: ἐὰν δέ γε ... ἀπαλλάττηται resumes the speaker's own ἐὰν μὲν καθαρὰ ἀπαλλάττηται in 302 as its δέ member, so 302 and 306 have one owner. The 2sg οἴει addresses the respondent anchored as Cebes at 305, who answers at 307.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0311
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81c
char_span:
  start_char: 58061
  end_char: 58081
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 356bab04601b3e22398f9cd94569e886b94bee2f1d89ca115421b4882debb758
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 57466
    end_char: 58263
    text_sha256: 60c4da9bdef3866f5c0498e6d39f76146560aaab89a0437c682e465a9ccb7a7e
  rationale: οὐδ’ ὁπωστιοῦν answers the οἴει ... ἀπαλλάξεσθαι; of 306, and ἔφη is third person, excluding the narrator. The respondent immediately before is anchored as Cebes at 305.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0312
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81c
char_span:
  start_char: 58086
  end_char: 58262
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 161ab61e3373a4788fe2e1d975bf83a4a1c9861fda8b3c3b1213c6444c181253
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 57534
    end_char: 58276
    text_sha256: 101c57da87a9a29336da435345b859bd3b21ed02bf52d38de5250d97f692df22
  rationale: ἀλλὰ ... γε οἶμαι picks up the οἶμαι of 306 and puts the next member of the same question to the same respondent, who assents at 309. The respondent's own answer at 307 is 3sg-reported, so 308 is the other party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0313
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81c
char_span:
  start_char: 58267
  end_char: 58275
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 58082
    end_char: 59177
    text_sha256: 7e646cb8aca414740575a87370f350b9c28850531f5100f068e41e483ff5439e
  rationale: πάνυ γε assents to the question of 308 and so belongs to the respondent of this run, who is addressed ὦ Κέβης at 312 and anchored as Cebes at 305 and 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0314
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81c-81d
char_span:
  start_char: 58280
  end_char: 58721
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ab6561f1d2a0534e9af57cfdad7ad3058da0e498278f4163aec900e77720a6fe
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 58082
    end_char: 59177
    text_sha256: 7e646cb8aca414740575a87370f350b9c28850531f5100f068e41e483ff5439e
  rationale: ἐμβριθὲς δέ γε continues the questioner's own δέ γε series from 306 and 308 and addresses his interlocutor as ὦ φίλε. The reply at 311 calls that interlocutor ὦ Σώκρατες, and he answers ὦ Κέβης at 312.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0315
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81d
char_span:
  start_char: 58726
  end_char: 58763
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ac9dc5e2fc4658782bbd25d2cef6ef4a54e9f483f81c8afafe9115c2bf8ef9db
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 58276
    end_char: 59177
    text_sha256: 7ed404e846c149f451f2dbcdbb693603a04c25bdffac96a8e77d4e6843a9f1d9
  rationale: εἰκός γε, ὦ Σώκρατες shows the speaker is not Socrates, and 312 answers him at once by name, εἰκὸς μέντοι, ὦ Κέβης, echoing his own word. The exchanged vocatives identify this speaker as Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0316
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81d-81e
char_span:
  start_char: 58768
  end_char: 59176
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: de9c57d41a17dfdfbcb354fb6bbc210c58ad74a621691181b5644ab967adb769
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 58722
    end_char: 59234
    text_sha256: 1fb1184bd0866b7d3f68730bf65b98fa9bb86d957db9ba6ffe41d3d853bd59bb
  rationale: εἰκὸς μέντοι echoes the εἰκός of 311, whose speaker had just addressed him as ὦ Σώκρατες, and this unit's ὦ Κέβης excludes Cebes. The two vocatives fix the two parties of the exchange against each other.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0317
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81e
char_span:
  start_char: 59181
  end_char: 59233
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 50ca231e0637453f4119f5c2c938c7ba875567d4ff6eb32c68989c0b317c8a0c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 58764
    end_char: 59411
    text_sha256: c8c4efd20dfa13196354ce78f5a0b4c3388088bb2067c66b42c71841c8044ef6
  rationale: τὰ ποῖα δὴ ταῦτα λέγεις, ὦ Σώκρατες; is 2sg with a vocative, so the speaker is not Socrates and is asking the speaker of 312 to expand; 312 addressed that person as ὦ Κέβης, and he is anchored as Cebes at 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0318
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 81e-82a
char_span:
  start_char: 59238
  end_char: 59410
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 04d5c27137d9a4cf0633d50879db99c74f054079d2888f020cc288247012177f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 58764
    end_char: 59442
    text_sha256: 49dba1ee09a36c99302906bb9b71c035e608aaa58ca676201e527f89d27f8de9
  rationale: οἷον τοὺς μὲν ... answers the τὰ ποῖα δὴ ταῦτα λέγεις; of 313, a question put ὦ Σώκρατες, and its closing ἢ οὐκ οἴει; turns the 2sg back on the asker of 313.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0319
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a
char_span:
  start_char: 59415
  end_char: 59441
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e0ac06d804a9871b26c0210d6e465faa036c1c924635e1ac5275b7348432988d
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 59234
    end_char: 59659
    text_sha256: c08b2fa464d5da081013bc4d776048cd4560488a1fcbc0444ede883cbc2163b8
  rationale: πάνυ μὲν οὖν εἰκὸς λέγεις answers the ἢ οὐκ οἴει; of 314 and its 2sg λέγεις addresses the speaker of 314, so this is the respondent, anchored as Cebes at 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0320
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a
char_span:
  start_char: 59446
  end_char: 59601
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b9814930be1c03744245e7cc3589a30c7ac97daf4c0e4cdf61c24941df7c6497
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 59234
    end_char: 59659
    text_sha256: c08b2fa464d5da081013bc4d776048cd4560488a1fcbc0444ede883cbc2163b8
  rationale: τοὺς δέ γε ... is the δέ member answering the τοὺς μέν of 314, so the same speaker continues, and its closing question is answered by the anchored Cebes at 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0321
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a
char_span:
  start_char: 59606
  end_char: 59658
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6b58dc6ff5a0c20b68d3bdeea79f4879128e0bf42f9a2bb25d704485db10c61f
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 59614
    end_char: 59640
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0322
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a
char_span:
  start_char: 59663
  end_char: 59752
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cba14de320a6781092d448ff616b16932d28069a32e03784358321d72644107b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 59442
    end_char: 59783
    text_sha256: a06339afe2fe62363b984015a99ac1a768bdd172bc25688fa8a69828e871b212
  rationale: ἦ δ’ ὅς is third person and excludes the narrator, and this is the next question after the anchored answer of Cebes at 317, so it belongs to the other party of the exchange, the one his respondent addressed as ὦ Σώκρατες at 313.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0323
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a
char_span:
  start_char: 59757
  end_char: 59782
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 15f5c913aab046102c5bfa9041ebcfa8d62aaecaeddf1c50af9e378eb19c88ef
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 59602
    end_char: 60031
    text_sha256: 6a25d27ab637fb933098515ac6fbe526dc4cfad42dd1bc0abf26a91c6e44987d
  rationale: δῆλον δή echoes the δῆλα δή of 318 as an assent to it, and ἔφη excludes the narrator; the assenting party of this run is anchored as Cebes at 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0324
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82a-82b
char_span:
  start_char: 59787
  end_char: 60030
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 43bedb179ba130ffa3e0d13d11c24039f63e7023575976e3a7e0fe1b19b4cd66
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 59659
    end_char: 60272
    text_sha256: a9a0a6390e5842167aa7b8fa2ed1ccc779ab82b90df056abbc27d5c70202438f
  rationale: οὐκοῦν ... ἔφη opens the next question after the assent at 319, and ἔφη is third person, excluding the narrator. Unit 321 queries this unit's εὐδαιμονέστατοι and 322 defends it with ὅτι, so 320 and 322 share an owner and 321 belongs to the respondent anchored as Cebes at 317.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0325
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82b
char_span:
  start_char: 60035
  end_char: 60063
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1052197d999c9d6443d9b1760363672dfa9de32f44e6c82d0f7ed8dc812fe0cf
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 59783
    end_char: 60272
    text_sha256: d579f70128d77ccbf5d42bb655ba3f1a7eddf02c3c1f68c6837488cb31527df9
  rationale: πῇ δὴ οὗτοι εὐδαιμονέστατοι; queries the claim just made at 320 and is answered at 322 with ὅτι by the maker of that claim, so it belongs to the other party, the respondent anchored as Cebes at 317 and 325.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0326
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82b
char_span:
  start_char: 60068
  end_char: 60271
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8d34abda8288a0eb099e33774729e7a1cadf5c10622f145ae608a75278c324cf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 59783
    end_char: 60283
    text_sha256: f7fdfb7248374d8dca2980afda506385f509d5fa0be1ccf5c2bbdc1e01ef9ea7
  rationale: ὅτι τούτους εἰκός ἐστιν answers the πῇ question of 321 and sustains the εὐδαιμονέστατοι of 320, so its speaker is the speaker of 320, not the man who queried him.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0327
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82b
char_span:
  start_char: 60276
  end_char: 60282
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1ffac0b73ffb2cb6db237519fc28011e60f08716527b69dc71407adbce3c342c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 60064
    end_char: 60870
    text_sha256: 2190ae2566b116dd12e42d73f515c6c06f6e605d4f8a566571a6a8a26473a2fb
  rationale: εἰκός is a bare echo-assent to the εἰκός ἐστιν of 322 and so belongs to the respondent; the continuation at 324 is answered by the anchored Cebes at 325, who addresses its speaker as ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0328
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82b-82c
char_span:
  start_char: 60287
  end_char: 60783
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3048478f5ebad52bafc2c14165e3589a1158ac968a60d6c3742dc8161fefd548
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 60064
    end_char: 60870
    text_sha256: 2190ae2566b116dd12e42d73f515c6c06f6e605d4f8a566571a6a8a26473a2fb
  rationale: εἰς δέ γε continues the speaker's own series from 322, and the vocative ὦ ἑταῖρε Σιμμία τε καὶ Κέβης excludes both of them. The anchored reply at 325 is Cebes answering this unit and addressing its speaker as ὦ Σώκρατες, and the 3sg ἔφη carried by the same interrogating voice at 320 excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0329
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82c
char_span:
  start_char: 60788
  end_char: 60863
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d66a035f34a2e481c17c5126e2832f4635fa432b44ddc71a916fdfa8a4635f49
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ {pers} Σώκρατες {/pers} , ὁ {pers} Κέβης {/pers}
    start_char: 60806
    end_char: 60861
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0330
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82d
char_span:
  start_char: 60874
  end_char: 61269
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 60b2316f3122a38f3c125b1f050f6db439fac8112973f058b30e7ce3f7a0aa92
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 60283
    end_char: 61270
    text_sha256: f2b05c43b1e45fc2d4512ac9596c399cc7aa702c11c36a764d82ed6deba84018
  rationale: Unit 324 addresses ὦ ἑταῖρε Σιμμία τε καὶ Κέβης, excluding both of them, and the ANCHOR at 325 has Cebes answer it with the vocative ὦ Σώκρατες, so 324's owner is Socrates. Unit 326 continues that same speech (οὐ μέντοι μὰ Δία, ἦ δ’ ὅς, then τοιγάρτοι resuming τούτων ἕνεκα) and addresses ὦ Κέβης, and the 3sg ἦ δ’ ὅς excludes the narrator Phaedo.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0331
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82d
char_span:
  start_char: 61274
  end_char: 61306
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7fc2ec623d571547ac4776d4d2a9c7cd12e16ccf07a4d4afd591d48fff0c50c2
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 60784
    end_char: 62892
    text_sha256: 36e574bbd9b108a33283179b14beac09a71278f53e8526f0532d586af67293c5
  rationale: The vocative ὦ Σώκρατες excludes Socrates, leaving the two interlocutors he has just addressed. The question sits inside an exchange closed at both ends by ANCHOR ΚΕΒ. (325, 329) in which the Socratic speech at 326 names its addressee ὦ Κέβης, and 329 is again Cebes putting a τί question to Socrates; Simmias is nowhere given a turn inside those bounds.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0332
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 82d-83c
char_span:
  start_char: 61311
  end_char: 62820
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 507ca1a6479c4fd7f20f99c9b07670074f8290a61dc921ef75ce37c03bb021ee
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 61270
    end_char: 62892
    text_sha256: 6e2a51b5f53d864649a2d64d96541b41a658e4bd45aac7f685582c2e52e11232
  rationale: "ἐγὼ ἐρῶ answers the πῶς of 327, whose vocative ὦ Σώκρατες names the addressee, so the respondent is Socrates. The ANCHOR at 329 confirms the handoff: Cebes takes up this speech's final τοῦτο πάσχει with τί τοῦτο, ὦ Σώκρατες, addressing the man who just spoke; the 3sg ἔφη / ἦ δ᾽ ὅς excludes Phaedo."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0333
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83c
char_span:
  start_char: 62825
  end_char: 62891
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: da65526123185f335f650bb5daf88e984c72dafbfe62d9a95e8ad03b4fd05deb
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 62863
    end_char: 62889
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0334
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83c
char_span:
  start_char: 62896
  end_char: 63124
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5dd57224633729adcba98bb3cff2c67724d391522a5bfa945e85632e74b0320f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 62821
    end_char: 63144
    text_sha256: dac40fd5c93caefc989bcb4d1367943a6371a8be9ca7c21b88d40e105828522b
  rationale: The unit is the ὅτι-answer to the ANCHOR question at 329, τί τοῦτο, ὦ Σώκρατες, which fixes its addressee as Socrates, and it closes with ἢ οὔ; putting the question back to Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0335
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83c
char_span:
  start_char: 63129
  end_char: 63137
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 62821
    end_char: 63838
    text_sha256: a0b77bd8ef4ac3cec6af5160c04bedff4bf1d26dd7e55677601da021ad362306
  rationale: πάνυ γε assents to the ἢ οὔ; of 330, so the speaker is the one questioned, not the questioner. The whole run is bracketed by ANCHOR ΚΕΒ. at 329 and 335, and the questioner names his addressee ὦ Κέβης at 326 and again at 336.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0336
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83d
char_span:
  start_char: 63148
  end_char: 63209
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b47efa1d1c7529d771b3239a3f61935f7cffd0fb5bf98c51373706012f1c57f2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 62892
    end_char: 63210
    text_sha256: 6dbad5615b9c267d7b88ead05becc286ee4a3e580b9984aeb6ea0c75e49385a2
  rationale: οὐκοῦν resumes the questioner's own ταῦτα-πάθει material from 330, whose owner is fixed as Socrates by the ANCHOR question at 329 addressed ὦ Σώκρατες; the assent at 331 came from the other party, so the questioner is unchanged.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0337
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83d
char_span:
  start_char: 63214
  end_char: 63221
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6340dbf6ef552ab3b7e4d045b8ff8ca6270d08b6263360d58bcac96bb5035cd2
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 62821
    end_char: 63838
    text_sha256: a0b77bd8ef4ac3cec6af5160c04bedff4bf1d26dd7e55677601da021ad362306
  rationale: πῶς δή; asks the questioner of 332 to explain, so it is not his; the respondent role in this stretch is held by Cebes, fixed by the ANCHOR at 329 and again at 335 and by the vocative ὦ Κέβης that the questioner uses at 326 and 336.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0338
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83d-83e
char_span:
  start_char: 63226
  end_char: 63755
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 60311280636d2ed99449e6335bfa347d584e4897ae4ea52b9e6fbf2fbe36fd49
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 63210
    end_char: 63838
    text_sha256: 890ccecf86e809a6ffc9392dd8b510bd8efce432e5ed996796ba3e657ac85a49
  rationale: The ὅτι-clause answers the πῶς δή; of 333, and the ANCHOR at 335 has Cebes reply ἀληθέστατα λέγεις, ὦ Σώκρατες, naming the man who has just spoken.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0339
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83e
char_span:
  start_char: 63760
  end_char: 63837
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ef19ccb2ccece854bd7e09ef73c3ba96085b97daba852669fd2d4dd65d42310e
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, λέγεις, ὁ {pers} Κέβης {/pers}
    start_char: 63772
    end_char: 63807
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0340
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 83e
char_span:
  start_char: 63842
  end_char: 63977
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ca4e0df4ce4f9198c2764dd0940f6d494a583b16ff894008f505e9cef1b13c2d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 63756
    end_char: 64003
    text_sha256: 6dfbd0560238f667f6ed9233d74c3c8a82737345a8e9f70a6f0bff0a09d122f7
  rationale: The vocative ὦ Κέβης excludes Cebes, who has just been fixed as speaker of 335 addressing ὦ Σώκρατες; τούτων τοίνυν ἕνεκα resumes the speaker's own τούτων ἕνεκα argument, and ἢ σὺ οἴει; hands the question back to the addressee.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0341
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 84a
char_span:
  start_char: 63988
  end_char: 64002
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6ee00fa775068798649ff1b8ef0fcbbf654ad0525ba23a0e8a5a320d97b0d237
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 63756
    end_char: 64003
    text_sha256: 6dfbd0560238f667f6ed9233d74c3c8a82737345a8e9f70a6f0bff0a09d122f7
  rationale: οὐ δῆτα ἔγωγε answers the ἢ σὺ οἴει; of 336, whose σύ is identified by that unit's vocative ὦ Κέβης, so the first-person respondent is Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0342
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 84a-84b
char_span:
  start_char: 64007
  end_char: 64858
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 65ab5dcd30b47ee9d5272d8efd688726167c874402afe11718251ca656488309
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 63838
    end_char: 65586
    text_sha256: a159ac1c97826143b60e394061096e35e839feeafc2d884f986ab4f89112f751
  rationale: οὐ γάρ picks up and confirms the respondent's οὐ δῆτα of 337 and resumes the questioner's own λογίσαιτ’ ἂν ψυχὴ φιλοσόφου line, while the vocative ὦ Σιμμία τε καὶ Κέβης excludes both interlocutors. The ANCHOR narration at 339 then closes the speech with ταῦτα εἰπόντος τοῦ Σωκράτους, naming its owner.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0343
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 84c-84d
char_span:
  start_char: 65186
  end_char: 65585
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 667959810136161235fc942f9580fa8600e2c3e35e89c02dc9db43aec8c2e190
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} ἰδὼν αὐτὼ ἤρετο, τί; ἔφη
    start_char: 65139
    end_char: 65193
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0344
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 84d
char_span:
  start_char: 65624
  end_char: 65844
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: be7137d5a266aac3cec72c68fde7e4e043f5f90a2154561acf04156369410752
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: "καὶ ὁ {pers} Σιμμίας {/pers} ἔφη:"
    start_char: 65590
    end_char: 65623
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0345
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 84d-85b
char_span:
  start_char: 65893
  end_char: 67264
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 73f58a93e289a92b8a944d5e04129ae686b4f8f98a31f6f4b00e6f6909cff5af
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 65586
    end_char: 68348
    text_sha256: 12bc8fce3202a7a9c5d6a8b585250398297262dcb86588ef60941ac63d418074
  rationale: The 3sg ἐγέλασεν / φησιν excludes the narrator Phaedo and the vocative ὦ Σιμμία excludes Simmias, who owns the preceding ANCHOR at 340. The 1sg οὐ συμφορὰν ἡγοῦμαι τὴν παροῦσαν τύχην takes over as the speaker's own the παροῦσαν συμφοράν that 340 ascribed to its addressee σοι (there named ὦ Σώκρατες), and the ANCHOR reply at 342 answers this speech with καλῶς λέγεις … ἐμοὶ γὰρ δοκεῖ, ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0346
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 85b-85d
char_span:
  start_char: 67269
  end_char: 68341
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 750243251dab83e9c7a6cf3d4743104fdbc891aa9e453b42c602e9fe728e6cbb
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, λέγεις, ὁ {pers} Σιμμίας {/pers}
    start_char: 67276
    end_char: 67313
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0347
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 85e
char_span:
  start_char: 68384
  end_char: 68457
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ff3f073e000f283c26783e129a96979efd4a9aea3fd16dc737f896e0e64a6ab3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} , ἴσως γάρ, ἔφη
    start_char: 68352
    end_char: 68397
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0348
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 85e-86d
char_span:
  start_char: 68462
  end_char: 70186
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f763b5329f54cb2ca9aa829b72c87ce1f21288e0dd8ed9aa215e69b869bf644c
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 68348
    end_char: 70801
    text_sha256: 676648671a71be58b2aef2360ab5ece1c6a85cce6805b1b959d9493f626d4b30
  rationale: "ταύτῃ ἔμοιγε answers the imperative λέγε ὅπῃ δὴ οὐχ ἱκανῶς of the ANCHOR at 343, so the speaker is the man Socrates there tells to speak, namely the owner of 342; ἦ δ’ ὅς is 3sg, excluding Phaedo, and ὦ Σώκρατες with ὥσπερ σύ excludes Socrates. The ANCHOR at 345 then names the just-finished speaker: δίκαια μέντοι λέγει ὁ Σιμμίας."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0349
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 86d-86e
char_span:
  start_char: 70271
  end_char: 70800
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 01e79b04b3dd13443fab4f3997ad935ba65e56cdd6667ee70fc32ed0c780d4e8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: διαβλέψας οὖν ὁ {pers} Σωκράτης {/pers} , ὥσπερ τὰ πολλὰ εἰώθει, καὶ μειδιάσας, δίκαια μέντοι, ἔφη
    start_char: 70191
    end_char: 70289
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0350
source_work: Phaedo
outer_turn_id: turn_phaedo_0027
stephanus_span: 86e-88b
char_span:
  start_char: 70805
  end_char: 74254
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: afa6f95235b6b9227b5667212be4a68200c1931d74ff05e1ab5b7528a7cada85
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Κέβης {/pers}
    start_char: 70814
    end_char: 70844
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0351
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89a-102a
char_span:
  start_char: 75971
  end_char: 105377
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5a6cc2e2571111532ce52caa83116024ec06ff462b79606100a69b3a449bc661
voice_chain:
  - ΦΑΙΔ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙΔ.
    start_char: 75971
    end_char: 75976
limits: Records that the printed siglum opens this turn. It does not establish that Phaedo is the owner of any statement inside the conversation he reports.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0352
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89a-89b
char_span:
  start_char: 75971
  end_char: 76317
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e72f0f2c7ded6b48e4a2b110afe354655171afb0d8561bed2b135db6fe17230c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 75971
    end_char: 76369
    text_sha256: 2e6bdb47f2867fa2a44a6e40774bdec14149b4f833a76eb2b6fb2ea6abd99ba6
  rationale: Frame matter is narration, but the unit closes with a quoted utterance (Αὔριον δή, ἔφη, ἴσως, ὦ Φαίδων...). Its vocative ὦ Φαίδων excludes the narrator as its speaker, and unit 1 (ANCHOR ΦΑΙΔ.) answers that very utterance with ἔοικεν ... ὦ Σώκρατες, so the addressee of Phaedo's reply — hence the speaker of the quoted words — is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0353
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89b
char_span:
  start_char: 76322
  end_char: 76368
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 438a6b578dff72f6403103073efbf4c34c5a10f189a64a04d793eb91c641b4f3
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ᾽ ἐγώ
    start_char: 76330
    end_char: 76339
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0354
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89b
char_span:
  start_char: 76373
  end_char: 76395
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 18da91f14a8b178be984c6ff6d53b4700c26800136db5046daf761add04818de
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 76420
    text_sha256: 972e8de031278d14dd92cfa549e8e957d12ce8d8946a8c600d464c1f4e914a9c
  rationale: 2nd sg πείθῃ answers unit 1 (ANCHOR ΦΑΙΔ.), whose vocative ὦ Σώκρατες names Phaedo's addressee; unit 3 (ANCHOR ΦΑΙΔ.) then answers back. Two-party exchange bounded by ΦΑΙΔ. anchors, other party named.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0355
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89b
char_span:
  start_char: 76400
  end_char: 76419
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 828dae8255245ebb29c3ddb230c5c62e60f408ae48725568d1432f65e04022a3
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 76409
    end_char: 76418
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0356
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89b-89c
char_span:
  start_char: 76424
  end_char: 76744
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f26fc90000c772b80129f4bd79f811424510dbc8e9f60d17c01ea6dad0e2bb9f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 76828
    text_sha256: 2c329d800eae9ba2b57f6153f80c1158698994b908a06b961357ff96a0c0e9ba
  rationale: Bounded by ΦΑΙΔ. anchors 3 and 5; σὺ ταύτας continues the hair addressed to Phaedo; the speaker names τὸν Σιμμίου τε καὶ Κέβητος λόγον in the 3rd person, excluding Simmias and Cebes; the remaining party of this exchange is named ὦ Σώκρατες at unit 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0357
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89c
char_span:
  start_char: 76749
  end_char: 76827
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 18d5f314a45ac708a9ff5affbddfcec98da2f48f37e1430b984c4ba1d5ea6e92
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 76755
    end_char: 76764
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0358
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89c
char_span:
  start_char: 76832
  end_char: 76906
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 06530f783f89be2392d0336a57c58496345d8cd897ddc55bdd114ae13de855c2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 77020
    text_sha256: 843b92afc228ae4930ce03368a9f1940a004f41e289d90dcf7033f731384acbc
  rationale: Bounded by ΦΑΙΔ. anchors 5 and 7; imperative παρακάλει + ἐμέ is answered by Phaedo's παρακαλῶ τοίνυν, ἔφην at 7, so speaker is Phaedo's single interlocutor, named ὦ Σώκρατες at anchor 1. 3rd-sg ἔφη also excludes the narrator, whose own words in this stretch are marked ἦν δ᾽ ἐγώ / ἔφην.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0359
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89c
char_span:
  start_char: 76911
  end_char: 77019
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 646057524a2e2782b7be7d743a5e6558c6606daf3767320e4c9e6a1420b8f34f
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην
    start_char: 76928
    end_char: 76932
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0360
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89c
char_span:
  start_char: 77024
  end_char: 77088
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f9bd3d594fc1ba05a582e64189cb038a982b8798779211273fdf2764457d8ab2
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 77120
    text_sha256: d2d7989316c80165100c1244fc6a2beac1771139bfa26f2aa71421ae778a1935
  rationale: Bounded by ΦΑΙΔ. anchors 7 and 9; 1st pl hortatives (εὐλαβηθῶμεν, πάθωμεν) with ἔφη reporting a party other than the narrator; the interlocutor of this bounded exchange is named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0361
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89c
char_span:
  start_char: 77093
  end_char: 77113
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 033ffd1fba3ecac269579c3850cef7088d7effd1622e541dffd7637df50b17f8
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 77103
    end_char: 77112
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0362
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89d-89e
char_span:
  start_char: 77124
  end_char: 77792
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2e5b440a08920d9e6e1b3c5ee82b7f402bd11a4660d89eccc1424eba3de0b405
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 77817
    text_sha256: a045a60710443c1aa59167d59ae4cc104b60854ff06db3a45442a657540567dd
  rationale: ἦ δ’ ὅς / ἔφη (3rd sg) excludes the narrator; closing 2nd sg question ἢ οὐκ ᾔσθησαι σύ πω addressed to Phaedo, who answers at ANCHOR 11; the interlocutor is named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0363
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89e
char_span:
  start_char: 77797
  end_char: 77816
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 76e99a0d6187b07236993db639fc164a8ee14e72d6eb3319e8b4d32aa3ef678e
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ᾽ ἐγώ
    start_char: 77806
    end_char: 77815
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0364
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 89e-90a
char_span:
  start_char: 77821
  end_char: 78092
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 52290110ade2d92b65f3bb264f47632e2851c3fd72ec779cfbee23d62111eda8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 78119
    text_sha256: 700661c71a019baaa15ae953bdc4e7b2174ee374d0c277473b2b7d1d4ef49ac1
  rationale: ἦ δ’ ὅς excludes the narrator; bounded by ΦΑΙΔ. anchors 11 and 13, whose πῶς λέγεις; ἔφην ἐγώ asks this speaker to explain; interlocutor named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0365
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90a
char_span:
  start_char: 78097
  end_char: 78118
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 50ef0a84f95d43979af7787c970b93456752a633683a3a6a7920c70198b4416d
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 78109
    end_char: 78117
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0366
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90a
char_span:
  start_char: 78123
  end_char: 78442
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 7c4836ecb1c06130261f2c5c4e8d5ccb81623a28c24c585e19b26385df43a1b7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 78473
    text_sha256: 3d01f8b97d541a62ed9f0b01a6f4e8e3f5f08342d8f9e74c192c04ac68ad8748
  rationale: ἦ δ’ ὅς excludes the narrator; direct answer to Phaedo's πῶς λέγεις (ANCHOR 13) and answered by ANCHOR 15; interlocutor named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0367
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90a
char_span:
  start_char: 78447
  end_char: 78466
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 387cc1b34655fbfc5e17880e033d5a21fd3dc9bceec31a52250a202bbef17fb2
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 78456
    end_char: 78465
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0368
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90b
char_span:
  start_char: 78477
  end_char: 78572
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5ba599f5bddb9f1e3b03c9f17943d083ac4dacc833b01ea2d0697f4617f6c4cf
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 78598
    text_sha256: a3484613077eb770193cd6fa79e3cdb4660a7293bdf0ac5979c63e3ed63354c7
  rationale: ἔφη excludes the narrator; 2nd sg οἴει addressed to Phaedo, who answers εἰκός γε at ANCHOR 17; bounded by ΦΑΙΔ. anchors 15/17; interlocutor named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0369
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90b
char_span:
  start_char: 78577
  end_char: 78597
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2eafbf18c80e52587626faa77c61190ef842c1c1cb666704cbe0623d75e8fd5c
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 78587
    end_char: 78596
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0370
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90b-90c
char_span:
  start_char: 78602
  end_char: 79242
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 37834e4b7fe06da714bdf123ebff5bbb2b25b365ff86149fee8822181e2db3b9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 79285
    text_sha256: 697f53791ad01c334fa87ede27481a5be08c5dc8afdb52084f4901049723ee04
  rationale: ἔφη excludes the narrator; εἰκὸς γάρ echoes Phaedo's εἰκός γε at ANCHOR 17, and σοῦ νυνδὴ προάγοντος ἐγὼ ἐφεσπόμην opposes speaker (ἐγώ) to Phaedo (σοῦ); bounded by ΦΑΙΔ. anchors 17/19; interlocutor named at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0371
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90c
char_span:
  start_char: 79247
  end_char: 79284
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 067ac0462d385e98f30b7b26f35285b86bbe53214ab16d12359d3907bc70ff1c
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἔφην ἐγώ
    start_char: 79261
    end_char: 79269
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0372
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90c-90d
char_span:
  start_char: 79289
  end_char: 79788
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 150468d9ef46860a3a7875ff5c0274ef7158a192dafa99d2f85be2f7d080c5ab
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 76318
    end_char: 79846
    text_sha256: b882b336143c1ec77863754fadb671841aa88d105aa84f36fba9239c013461f5
  rationale: Vocative ὦ Φαίδων excludes the narrator outright; bounded by ΦΑΙΔ. anchors 19 and 21; the single other party of this exchange is named ὦ Σώκρατες at anchor 1.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0373
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90d
char_span:
  start_char: 79793
  end_char: 79845
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ed5a438b699b495332744e0a796ad0524bdf0d30357021ff6d30206e91d50d89
voice_chain:
  - ΦΑΙΔ.
  - ΦΑΙΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 79821
    end_char: 79830
limits: The reporting formula is first person, so it identifies the narrator as this utterance's speaker. Phaedo is here a participant in the conversation he reports, not its frame.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0374
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 90d-91c
char_span:
  start_char: 79850
  end_char: 81419
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4090644f55fafb46f4d8cec04725a9ec5cd85bd5e103578c01de95e22017a76b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 79789
    end_char: 81420
    text_sha256: 4048f7362b8b9f552439ed8ff4744cc200a12f952866ab4d6457618246211583
  rationale: Vocative ὦ Σιμμία τε καὶ Κέβης excludes both of them; the speaker also refers to Σωκράτους in the 3rd person, but the same sentence pairs σοὶ μέν (Phaedo, singular, carried over from anchor 21) with ἐμοὶ δὲ αὐτοῦ ἕνεκα τοῦ θανάτου, i.e. the speaker is the one whose death is at issue. ἔφη (3rd sg) excludes the narrator, whose own speech throughout units 1-21 is reported ἦν δ᾽ ἐγώ / ἔφην. Only Socrates remains.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0375
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 91c-91d
char_span:
  start_char: 81424
  end_char: 82083
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4325669d87d77b30ccf0394e3c9a76a789de261ee09ed587cb010356e338e8dc
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 79789
    end_char: 82090
    text_sha256: 3222aea4b0e63c541548dfd39ed5176a81cc81f8fc54facbb1784297206bcb2d
  rationale: Σιμμίας μέν ... Κέβης δέ are named in the 3rd person and then addressed as ὦ Σιμμία τε καὶ Κέβης, excluding both; ἔφη excludes the narrator (contrast the 1st-person reporting at anchors 1-21); ὑπομνήσατε ἃ ἐλέγετε makes the speaker the one to whom the two objections were put.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0376
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 91e
char_span:
  start_char: 82134
  end_char: 82219
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 50d27ff58bb43d34b4aff45c0fa7c9d55c61a1e8824bd9ccc36936e85bc944b6
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 82130
    end_char: 82706
    text_sha256: dbbdb78054fe3bbd18715e30a9ed5fddac8cbf8f81ce6ff66b663c6652c256b0
  rationale: 2nd pl ἀποδέχεσθε addresses two people; the reply at 26 is 3rd-person dual (ἐφάτην) and the pair are then anchored individually as ΚΕΒ. (28) and ΣΙΜ. (29), so the addressees are Simmias and Cebes and neither can be the speaker. ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0377
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 91e-92a
char_span:
  start_char: 82258
  end_char: 82459
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1f7faa0b83c511351afcc54b8aee88683c88b3c2a099719ae7171c316c8fb085
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 82254
    end_char: 82706
    text_sha256: eafa3be842cd1166f27f9c4dfe6aa468b8cd406b1b1444ff6f9d32a76426e87f
  rationale: 2nd pl λέγετε addressed to two, who then answer separately at ANCHOR 28 (ΚΕΒ.) and ANCHOR 29 (ΣΙΜ.) — response adjacency excludes both as speaker. ἦ δ’ ὅς (3rd sg) excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0378
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92a
char_span:
  start_char: 82464
  end_char: 82573
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1d7943face9fadefa13edaa12c695964403295a25183d8d1de023fead784e01e
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 82473
    end_char: 82499
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0379
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92a
char_span:
  start_char: 82578
  end_char: 82705
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9ae4a13a5230e6c13c8ad73beb842eb75b5cea068060a13d202f94069259ae8f
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 82587
    end_char: 82615
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0380
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92a-92b
char_span:
  start_char: 82742
  end_char: 83076
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fb643e343620a72b76a644383d53fa97102ec8bad43b3ef5730c0df43fb298ef
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} , ἀλλὰ ἀνάγκη σοι, ἔφη
    start_char: 82710
    end_char: 82762
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0381
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92b
char_span:
  start_char: 83081
  end_char: 83122
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 558cf29ed6cb2921dfe20604fb006023860b1e3743505498c8d114a9f392aceb
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 82574
    end_char: 83607
    text_sha256: 205578b2c9ca3557a15a4fe597829976016653e7eff74d900b9c57967ac6ca92
  rationale: Vocative ὦ Σώκρατες excludes Socrates; ἔφη excludes the narrator. It answers the 2nd-sg ἢ ἀποδέξῃ; of ANCHOR 30 (ΣΩ.), whose ἄλλα δόξαι picks up δόξειεν in ANCHOR 29 (ΣΙΜ.) — so 30's singular addressee is Simmias, and the same interlocutor is anchored ΣΙΜ. two units later at 33.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0382
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92b-92c
char_span:
  start_char: 83127
  end_char: 83562
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ffceeb709d3ee5bfaf26fe43e9876a91b554739f9a53ed5039d3397b96fae303
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 82706
    end_char: 83607
    text_sha256: d8d1ffc6d9e2e6234cacd709d380a29f5be21d759e59730c0c522018d9d34972
  rationale: ἦ δ’ ὅς excludes the narrator; the 2nd-sg question is answered by ANCHOR 33 (ΣΙΜ.), excluding Simmias. Bounded exchange opened by ANCHOR 30 (ΣΩ.) with the same singular addressee (σοι/ἀποδέξῃ → σοι/φῇς/ἀπεικάζεις).
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0383
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92c
char_span:
  start_char: 83567
  end_char: 83606
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9349886ccacf336e29adcb6fbe30b40a72935502e290c4a6d2265a79cd329269
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 83576
    end_char: 83604
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0384
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92c
char_span:
  start_char: 83611
  end_char: 83692
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9585fce49c4a15fa2a1d6278604814517cfbb1ea309edd54509e2a2574ae55a7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83563
    end_char: 83740
    text_sha256: 1653dd48d7ad74b69ed29bc2648f43043d5fe19283ff06ce98470df743f18716
  rationale: ἦ δ’ ὅς excludes the narrator; the unit stands between ANCHOR 33 (ΣΙΜ.) and ANCHOR 35 (ΣΙΜ.), which answers it with the lexical echo πρέπει γάρ — so the speaker is Simmias' single interlocutor in this exchange, anchored ΣΩ. at 30.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0385
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92c
char_span:
  start_char: 83697
  end_char: 83739
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 77014dd62f7d25a863d5abbff4609308cbd7b2a42afca000f4455bba9e48d93f
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 83709
    end_char: 83737
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0386
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92c
char_span:
  start_char: 83744
  end_char: 83857
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: adf928fdf4b3cd035081d56959e6f701df37ad358ef39105a44f9d56be0aba63
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83693
    end_char: 84620
    text_sha256: c0f58eb8526387b5b91d9d0e47b365c3db47fe19957479799b90fb42c92f66a7
  rationale: ἔφη excludes the narrator; σοὶ οὐ συνῳδός addresses the speaker of ANCHOR 35 (ΣΙΜ.), and the reply at 37 answers this unit's πότερον αἱρῇ with the vocative ὦ Σώκρατες, naming this speaker.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0387
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92c-92e
char_span:
  start_char: 83862
  end_char: 84619
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f9b468a2afb957079da80facafdc6a883072e35dae395ab38370cb71947a44f9
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83693
    end_char: 84782
    text_sha256: b4e101e71c1b51773ffc5dd3fc96138b6d719614ee7ec1fe426d17d70e16dd5e
  rationale: Vocative ὦ Σώκρατες excludes Socrates; ἔφη excludes the narrator. It answers the πότερον αἱρῇ question of 36, which was addressed to the ΣΙΜ. of ANCHOR 35, and the next unit addresses this respondent as ὦ Σιμμία.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0388
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 92e-93a
char_span:
  start_char: 84624
  end_char: 84781
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cbfd5f015eb737fd01f0a534b1515066e168f341a11e8103b788feeb964b3f34
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 84782
    text_sha256: 0d83a18cdf3b5e22bc3e77c728b7f3d9381d6f3a5bedcfefd28b1e277706c849
  rationale: Vocative ὦ Σιμμία excludes Simmias; ἦ δ’ ὅς excludes the narrator; and the immediately preceding unit 37 answers this speaker as ὦ Σώκρατες. This unit and unit 66 fix the addressee of the whole 36-83 stretch as Simmias, with ANCHOR 53 (ΣΙΜ.) confirming mid-stretch and ANCHOR 84 (ΣΩ.) marking the explicit switch to Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0389
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 84786
  end_char: 84794
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1a02d4b8712962cc615e39c04988ae411a1e8af7afca8f67d2718a5616960989
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 84620
    end_char: 84795
    text_sha256: fb819157bc859ddd91f59f0edc1b075dc3a3c1d605624d600bf9f8324137089b
  rationale: Bare οὐδαμῶς answering the δοκεῖ σοι ...; of unit 38, which is vocatively addressed ὦ Σιμμία. Response adjacency to a vocatively-fixed addressee.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0390
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 84799
  end_char: 84891
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 66428742f119d3430a71056c69bedefa75887f920fcd948d7958a68d050cb9f8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Questioner's turn inside the two-party exchange bounded by ANCHOR 35/ANCHOR 53 (ΣΙΜ.) with the questioner named ὦ Σώκρατες at 37 and the respondent ὦ Σιμμία at 38. The respondent's agreement here is narrated (συνέφη), not quoted, so the quoted matter is the questioner's alone — note this breaks the alternation pattern, so the assignment does not rest on turn-taking.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0391
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 84896
  end_char: 84983
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 301b96c37069161bb656621d5b15d3e38917f47872fbb461489aa249fab7931e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Same bounded exchange (questioner named at 37, addressee named at 38, respondent anchored ΣΙΜ. at 53). Again the assent is narrated (συνεδόκει) rather than quoted, so this unit's speech is the questioner's; the οὐκ ἄρα inference continues the chain of 40.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0392
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 84988
  end_char: 85090
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bf2b05184333527e0b84b3339094a87bb2f2da57a8940e964d38577b036e809d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Inferential πολλοῦ ἄρα δεῖ continues the questioner's chain from 40-41 and is answered at 43 with the lexical echo πολλοῦ μέντοι; bounded exchange with questioner named ὦ Σώκρατες at 37 and respondent anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0393
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 85095
  end_char: 85114
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 39d18e286367108b3898be4df418c7562224175accacf18ad4cbed09bf8ae775
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: πολλοῦ μέντοι is a lexical echo-assent to πολλοῦ ἄρα δεῖ at 42; the respondent of this bounded exchange is addressed ὦ Σιμμία at 38 and anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0394
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 85119
  end_char: 85187
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 09070f956290809b28996ab132b7fafc209e101076c13a9d2f55c8dd1e1128bc
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Questioner's turn (τί δέ; οὐχ οὕτως ...;) whose respondent replies οὐ μανθάνω at 45, prompting the questioner's reformulation at 46; bounded exchange, questioner named at 37, respondent anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0395
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a
char_span:
  start_char: 85192
  end_char: 85208
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 13a7b30c278e031405d6358ca3bf38469aedf9324140c24c81e2e3521160f92d
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: 1st-sg οὐ μανθάνω is the respondent's report of failure to follow 44, met by the questioner's ἢ οὐχί ... reformulation at 46; the respondent of this bounded exchange is named ὦ Σιμμία at 38 and anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0396
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93a-93b
char_span:
  start_char: 85213
  end_char: 85396
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 440cc8c4dad5b0f1787e599e248e80ed2e9502156c56e52e9d1c568a1f583e9d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: ἦ δ’ ὅς excludes the narrator; the unit reformulates 44 for the respondent who said οὐ μανθάνω at 45; questioner named ὦ Σώκρατες at 37, respondent anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0397
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93b
char_span:
  start_char: 85401
  end_char: 85409
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Bare assent πάνυ γε to the questioner's reformulated question at 46; respondent of this bounded two-party exchange named ὦ Σιμμία at 38 and anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0398
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93b
char_span:
  start_char: 85414
  end_char: 85568
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fd3efeeb3ffd500b88027996bf32e3d50bdf3f4bcdf9c196000f098a9e15dac9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Questioner's turn transferring the ἁρμονία point to ψυχή; bounded exchange with questioner named ὦ Σώκρατες at 37, respondent addressed ὦ Σιμμία at 38 and anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0399
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93b
char_span:
  start_char: 85573
  end_char: 85593
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 356bab04601b3e22398f9cd94569e886b94bee2f1d89ca115421b4882debb758
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: οὐδ’ ὁπωστιοῦν, ἔφη answers the ἦ οὖν ἔστι ...; of 48; ἔφη excludes the narrator; respondent of the bounded exchange named at 38, anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0400
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93b-93c
char_span:
  start_char: 85598
  end_char: 85776
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5928607d8dc2f0c0423628742da2504353d3085307e9dc934f69eeec3ea939fe
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: Questioner's turn (φέρε δή, ἔφη ... καὶ ταῦτα ἀληθῶς λέγεται;), echoed back as ἀληθῶς μέντοι at 51; ἔφη excludes the narrator; questioner named at 37, respondent anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0401
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93c
char_span:
  start_char: 85781
  end_char: 85795
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 23ca23eef279aae641be87fe8778aaba98820fa617cb557e07860d99508826b7
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 83858
    end_char: 86224
    text_sha256: 6a97e88781fb0afd4bda423c90f68f255f950c1c002e3f0083841e69cbd3c639
  rationale: ἀληθῶς μέντοι is a lexical echo-assent to ἀληθῶς λέγεται at 50; respondent of the bounded exchange named ὦ Σιμμία at 38 and anchored ΣΙΜ. at 53.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0402
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93c
char_span:
  start_char: 85800
  end_char: 86103
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bb00c4eb9daa6cacefc2b19f5850ed3b5894c40c5b48cc246b9591c5ada73c9c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 85796
    end_char: 86224
    text_sha256: 5bb1002fcd9b2d14be69816a6c4cc8abb32587d498c488111a715ca4775a2e30
  rationale: "Direct response adjacency: this question is answered by ANCHOR 53 (ΣΙΜ.) with οὐκ ἔχω ἔγωγ᾽ ... εἰπεῖν, excluding Simmias; the questioner of this exchange is named ὦ Σώκρατες at 37."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0403
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93c
char_span:
  start_char: 86108
  end_char: 86217
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dd14c62a80d7eb981aafcd65454996942e564b1b7039b7128286faade573ce96
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 86123
    end_char: 86151
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0404
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86228
  end_char: 86439
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6edf28d6105b2af0a8c3ffdc32295a0433381f52df3fe529ae10fb108cc4ac4e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: ἔφη excludes the narrator; the unit follows ANCHOR 53 (ΣΙΜ.) recalling a prior joint ὁμολόγημα and closes ἦ γάρ; The exchange stays two-party and its addressee is still vocatively Simmias at 66 (ὦ Σιμμία), with no intervening change of addressee; the questioner is named ὦ Σώκρατες at 37 and 71.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0405
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86444
  end_char: 86452
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: πάνυ γε answers the ἦ γάρ; of 54; respondent of the exchange anchored ΣΙΜ. at 53 and still addressed ὦ Σιμμία at 66, with no naming formula intervening to change the interlocutor.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0406
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86457
  end_char: 86551
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 44abda57a388f06df564e800f3204799596522068ab66c05bf080bcd74acc870
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: Questioner's turn (τὴν δέ γε ... ἔστιν οὕτως;) answered by the echo ἔστιν at 57; bounded between ANCHOR 53 (ΣΙΜ.) and the vocative ὦ Σιμμία at 66, questioner named ὦ Σώκρατες at 37 and 71.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0407
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86556
  end_char: 86562
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c4bd1fa8c201b5419ada7abbd742dc376106ed17056f2b341968b715b9b0d120
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: ἔστιν is a bare verbal echo answering ἔστιν οὕτως; at 56; respondent anchored ΣΙΜ. at 53 and still addressed ὦ Σιμμία at 66, no interlocutor change marked between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0408
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86567
  end_char: 86659
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 340e0324e1e638c564788c420893b643df770cc9070de2f5937a767fd15fb1b0
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: Questioner's turn (ἢ τὸ ἴσον;) answered by the echo τὸ ἴσον at 59; two-party exchange bounded by ANCHOR 53 (ΣΙΜ.) and the vocative ὦ Σιμμία at 66; the questioner is named ὦ Σώκρατες by the respondent at 71.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0409
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d
char_span:
  start_char: 86664
  end_char: 86672
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 090b2fded6cbbbd36044a008a302265dd3fa06cbf2fdd231e62efa07e0831bb3
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: τὸ ἴσον selects the second limb of the disjunctive question at 58 — echo-answer; respondent anchored ΣΙΜ. at 53, still the addressee at 66 (ὦ Σιμμία).
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0410
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93d-93e
char_span:
  start_char: 86677
  end_char: 86797
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 54dedec722fce8ffef767da8bdc6666297eddadcdbb3918d239dd30383dfeb29
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: οὐκοῦν-inference applying the preceding agreements to ψυχή, answered by οὕτω at 61; bounded exchange, respondent anchored ΣΙΜ. at 53 and addressed ὦ Σιμμία at 66, questioner named ὦ Σώκρατες at 71.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0411
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93e
char_span:
  start_char: 86802
  end_char: 86807
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 86b797ecf5a4ccb006fc67b5d925ee2253ea101d9e75d27df7694397d1cc1af5
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: οὕτω is a bare assent to the οὐκοῦν-question of 60; respondent of the bounded exchange anchored ΣΙΜ. at 53 and addressed ὦ Σιμμία at 66.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0412
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93e
char_span:
  start_char: 86812
  end_char: 86883
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 99d739c5119456e8976bba0f1b7bbf5a8fe66bb00954d7e58d7ca1c2f1d29419
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: τοῦτο δέ γε πεπονθυῖα picks up the ἥρμοσται of the speaker's own question at 60 and is answered οὐ γὰρ οὖν at 63; bounded exchange, respondent anchored ΣΙΜ. at 53 and addressed ὦ Σιμμία at 66.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0413
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93e
char_span:
  start_char: 86888
  end_char: 86899
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ff4d9fc31ea6c1da9b0e734fc6aff20102b6fd15ee3f622c95720dacf383e6b4
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: οὐ γὰρ οὖν is a bare negative assent to 62; respondent anchored ΣΙΜ. at 53, still addressed ὦ Σιμμία at 66.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0414
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93e
char_span:
  start_char: 86904
  end_char: 87033
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d2ad8c4ed56f604c4a12b3e5d9ad17d501c0a9f0daa2da4c336cadebe9a1863f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: τοῦτο δ’ αὖ πεπονθυῖα continues the speaker's own τοῦτο δέ γε πεπονθυῖα of 62 (pronoun and participle coreference) and is answered by the echo οὐδὲν πλέον at 65; respondent anchored ΣΙΜ. at 53 and addressed ὦ Σιμμία at 66.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0415
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 93e
char_span:
  start_char: 87038
  end_char: 87050
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 30763a32c83fed2e3efb90751c43ca8518c093f6c591860850f399f0ecdcc949
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: οὐδὲν πλέον echoes τι πλέον ... μετέχοι of 64 — echo-answer; respondent anchored ΣΙΜ. at 53 and addressed ὦ Σιμμία in the very next unit.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0416
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87061
  end_char: 87260
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 54ab1de82f1c5e4ab19a6c14cbe4b6f0a1ec6d0373535831969c58993884300d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 86104
    end_char: 87261
    text_sha256: 046e833cdbd2772d50f08d1251cebe392af272f35089a3bae0a7602c8dc4700b
  rationale: Vocative ὦ Σιμμία excludes Simmias and re-fixes the addressee for the remainder of the stretch; μᾶλλον δέ γέ που corrects the speaker's own οὐδὲν πλέον formulation; the questioner of this exchange is named ὦ Σώκρατες by the respondent at 71 and 81.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0417
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87265
  end_char: 87275
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dcdd4408b881309d2bbfc99fe30aad9caddd58574e4dc568cee9f4bf9684b79d
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: οὐ μέντοι answers 66, which is vocatively addressed ὦ Σιμμία. For this and every respondent unit through 83 the addressee is fixed by that vocative at the head of the segment and confirmed at its foot by ANCHOR 85 (ΚΕΒ.), where Cebes places himself outside the harmony argument as an observer of Simmias' ἀπορία (Σιμμίου γὰρ λέγοντος ὅτε ἠπόρει, πάνυ ἐθαύμαζον) — so the interlocutor did not change unmarked.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0418
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87280
  end_char: 87327
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ab9ec457658c6487083ddd34fcc7628f84f22f5fb76a1c8ee0c20ff4189179a7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: οὐδέ γε δήπου ψυχή, οὖσα παντελῶς ψυχή, κακίας is elliptical on the parallel clause of 66 (ἁρμονία γὰρ δήπου παντελῶς αὐτὸ τοῦτο οὖσα ... ἀναρμοστίας οὔποτ’ ἂν μετάσχοι) — it borrows that unit's participle, its δήπου and its suppressed verb, so it continues that speaker, who is not Simmias (ὦ Σιμμία at 66) and not the narrator; addressee unchanged until ANCHOR 84.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0419
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87332
  end_char: 87363
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ed509d879bb330b25db274e78f4e7b7e4aef1256719b049a60fe6de2e2c7499c
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: πῶς γὰρ ἔκ γε τῶν προειρημένων; is a confirming rejoinder appealing to what the other party has already established (τῶν προειρημένων), not a fresh question, and it licenses the questioner's ἐκ τούτου ἄρα τοῦ λόγου inference at 70; respondent fixed as Simmias by 66 and confirmed by ANCHOR 85.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0420
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87368
  end_char: 87498
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2cad11d0e8f83eac72d4beedc2f2d167f9f08a461ac88bb213c895c1540e360b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: ἐκ τούτου ἄρα τοῦ λόγου draws the consequence of the speaker's own chain at 66/68 and is answered at 71 with the vocative ὦ Σώκρατες, which names this speaker directly.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0421
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a
char_span:
  start_char: 87503
  end_char: 87549
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bbe1dba006e7c62d4f2a2f78771e85ad514370d57684e5b7dec36be880bef1ce
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 87680
    text_sha256: 5c3e062aa28ef31a6179abf3c9e7fbdc33aca9470e1bc92733355b0f8f221526
  rationale: Vocative ὦ Σώκρατες excludes Socrates and ἔφη excludes the narrator; it answers 70 inside the stretch whose addressee is fixed as Simmias by ὦ Σιμμία at 66. This unit is also one of the three points (37, 71, 81) at which the questioner is re-named from inside the run.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0422
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94a-94b
char_span:
  start_char: 87554
  end_char: 87679
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3465d45d31554ab59ec7f017fb55adca0482d5b01dbd443cbb3a639210e8490e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: ἦ δ’ ὅς excludes the narrator; ἦ καὶ καλῶς δοκεῖ ... λέγεσθαι re-uses the δοκεῖ of the immediately preceding reply (71), which named this speaker ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0423
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94b
char_span:
  start_char: 87684
  end_char: 87704
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 356bab04601b3e22398f9cd94569e886b94bee2f1d89ca115421b4882debb758
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: οὐδ’ ὁπωστιοῦν, ἔφη answers the question of 72; ἔφη excludes the narrator; respondent fixed as Simmias by 66 and confirmed retrospectively by ANCHOR 85.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0424
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94b
char_span:
  start_char: 87709
  end_char: 87805
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: acec55c722ed651965d8ebbd1ec23788a1a06229348cb0a62043bd903553831d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: ἦ δ’ ὅς excludes the narrator; 2nd-sg λέγεις addressed to the respondent, who answers οὐκ ἔγωγε at 75; the addressee of this stretch is vocatively Simmias (66), so the speaker is his interlocutor, named ὦ Σώκρατες at 71 and 81.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0425
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94b
char_span:
  start_char: 87810
  end_char: 87820
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f26ab0b813f2bd75ba26cc6117073f37a1c98064d210884a4e21134d808c3b79
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: 1st-sg οὐκ ἔγωγε answers the 2nd-sg λέγεις of 74; addressee fixed as Simmias at 66, no change marked before ANCHOR 84, and ANCHOR 85 confirms Cebes was not the interlocutor of this argument.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0426
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94b-94c
char_span:
  start_char: 87825
  end_char: 88100
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f4e90487ca15c69367dc7730264f5c24a420b704264e5a87f3550dc4bf7b10d5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: "Questioner's turn: πότερον ... ἢ οὔ; with 1st-sg λέγω δὲ τὸ τοιόνδε glossing his own question; answered πάνυ μὲν οὖν at 77. Addressee fixed as Simmias at 66, questioner named ὦ Σώκρατες at 71 and 81."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0427
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94c
char_span:
  start_char: 88105
  end_char: 88118
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: πάνυ μὲν οὖν answers the ἢ οὔ; of 76; respondent fixed as Simmias by the vocative at 66 and confirmed by ANCHOR 85.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0428
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94c
char_span:
  start_char: 88123
  end_char: 88357
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 45bfec6612d0449ce04390ad134b4986efe2a8e5e49ae673ad36f7e038074b8f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: οὐκοῦν αὖ ὡμολογήσαμεν recalls the joint agreements this speaker extracted at 40-41 (ἕπεσθαι, not ἡγεμονεύειν) and is answered by the verbatim echo ὡμολογήσαμεν, ἔφη at 79; addressee fixed as Simmias at 66, speaker named ὦ Σώκρατες at 71 and 81.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0429
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94c
char_span:
  start_char: 88362
  end_char: 88392
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 191ae71bdbe5f52c864a39ca3bac09d4554719b1539e630026ee559f2bf84ddb
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: "ὡμολογήσαμεν, ἔφη: πῶς γὰρ οὔ; is a verbatim echo-assent to 78; ἔφη excludes the narrator; respondent is Simmias per 66, confirmed by ANCHOR 85."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0430
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94c-94e
char_span:
  start_char: 88397
  end_char: 89291
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9192c78d6834a4a36dcc8eb392e89bca42111bc3d88eb154b4953326d87c6ff5
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: τί οὖν; νῦν οὐ πᾶν τοὐναντίον ἡμῖν φαίνεται opposes the present appearance to the ὡμολογήσαμεν of this speaker's own 78; the closing 2nd-sg ἆρ’ οἴει is answered at 81, where the answerer names this speaker ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0431
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94e
char_span:
  start_char: 89296
  end_char: 89361
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 01af2bb3679787168c75878390ca29020517856a7460364397490860c9421a33
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89540
    text_sha256: 5a0d47c5121d387e4873820640b3ea228cfda859e54084b1b44fc42db89e795d
  rationale: Vocative ὦ Σώκρατες excludes Socrates; the reply answers ἆρ’ οἴει at the end of 80; addressee of the stretch fixed as Simmias at 66 with no interlocutor change marked before ANCHOR 84.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0432
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 94e-95a
char_span:
  start_char: 89366
  end_char: 89539
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6d77b52c2dcca36d3777fa66b3691f884797dff57bb4503313fd1452b56067f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 89806
    text_sha256: 8e9ee9081e54cc227d0e81486c57cc38f389eabee90567eb8ac96d59f57566a9
  rationale: οὐκ ἄρα ... draws the conclusion of the speaker's own Homer argument at 80, whose answerer named him ὦ Σώκρατες at 81; the vocative ὦ ἄριστε shows the addressee is still the single respondent fixed at 66. ANCHOR 84 (ΣΩ.) then closes the harmony argument in the same voice (τὰ μὲν Ἁρμονίας ... μετρίως γέγονεν).
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0433
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95a
char_span:
  start_char: 89544
  end_char: 89560
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4bc2f26db3fb10a379889fd471377d6efe9ea503584a893bdb5d1bf202eabc28
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 87057
    end_char: 90210
    text_sha256: 1cc7813d6d2af20f34e57b193e9be18b32e1f21a88c085b3e26af0d106f8d1bd
  rationale: ἔχει οὕτως, ἔφη echoes οὐδαμῇ καλῶς ἔχει of 82; ἔφη excludes the narrator. ANCHOR 84 marks the turn to Cebes as NEW (τὰ μὲν Ἁρμονίας ... τί δὲ δὴ τὰ Κάδμου ... ὦ Κέβης), and ANCHOR 85 has Cebes speaking of the harmony argument as something he watched Simmias lose — both show the respondent up to here was not Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0434
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95a
char_span:
  start_char: 89565
  end_char: 89805
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5ca5beede4baca57da90fe8c424b92259b04f1ab8818758a6bde76b5703673fc
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Σωκράτης {/pers}
    start_char: 89574
    end_char: 89607
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0435
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95a-95b
char_span:
  start_char: 89810
  end_char: 90209
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4bffb8cef1180dd9db404aa44ea475ead55c8c17130b6c0871323118f86f96e4
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 89825
    end_char: 89851
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0436
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95b-95e
char_span:
  start_char: 90214
  end_char: 91582
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 88f8d916c846d5d979db674b21cf25bbcf1bb5ea0f02d09e1b120ad21672781a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 90221
    end_char: 90250
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0437
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95e
char_span:
  start_char: 91616
  end_char: 91711
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4f007bf07069dcf49417c098100853fb55d6fddf998153d3147d60408587d12b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Κέβης {/pers} , ἀλλ’ οὐδὲν ἔγωγε ἐν τῷ παρόντι, ἔφη
    start_char: 91587
    end_char: 91651
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0438
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 95e-96a
char_span:
  start_char: 91799
  end_char: 92074
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5c85ae7924931c088c6a54b685c8efc56ba7536d6ac65267a9807b430cc33425
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ οὖν {pers} Σωκράτης {/pers} συχνὸν χρόνον ἐπισχὼν καὶ πρὸς ἑαυτόν τι σκεψάμενος, οὐ φαῦλον πρᾶγμα, ἔφη
    start_char: 91716
    end_char: 91820
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0439
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96a
char_span:
  start_char: 92079
  end_char: 92130
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8d4ffe558e822944b807a8676746b3ad036fa56e1535c7d1154e5c38267ca8e7
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 92089
    end_char: 92115
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0440
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96a-96d
char_span:
  start_char: 92135
  end_char: 93662
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 1074af53c70bf60cc2cd6e7fe20a7cb7f5dda974832776f87e9acea367c4d075
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 91712
    end_char: 93704
    text_sha256: 75f9dd206a1243547c8fc3a256b84b37bb5af9a58afa5e1b9aab2b7292c4ec72
  rationale: "Tightly bounded: ANCHOR 89 (ΚΕΒ.) immediately before, ANCHOR 91 (ΚΕΒ.) immediately after. Vocative ὦ Κέβης excludes Cebes; ἔφη excludes the narrator; ἄκουε τοίνυν ὡς ἐροῦντος delivers the δίειμι promised in ANCHOR 88 (ΣΩ.) and accepted by ANCHOR 89 (βούλομαί γε). No room for an unmarked change."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0441
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96d
char_span:
  start_char: 93667
  end_char: 93703
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 69b56ede55fabb5aefb910c28e1c0f2bcf0ac41f55302d1ac25016fa1dae2591
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 93675
    end_char: 93701
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0442
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96d-96e
char_span:
  start_char: 93708
  end_char: 94033
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bb786e862af7cad168067aca0ddac0c5670e011b21bfea95645983a4890d0685
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 93663
    end_char: 94103
    text_sha256: 0a1ad21372b576a0c651b5fe57f6de48392b9c57a06ee977b50ee1b60a389cc8
  rationale: Bounded by ANCHOR 91 (ΚΕΒ.) and ANCHOR 93 (ΚΕΒ.) with only this unit between them. ᾤμην γάρ continues the 1st-sg ᾤμην/ἐδόκει chain of 90, and ANCHOR 93 asks this speaker νῦν δὲ δή ... τί σοι δοκεῖ, so he is Cebes' interlocutor. Anchors genuinely bound.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0443
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96e
char_span:
  start_char: 94038
  end_char: 94102
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75b6697b703c527d55001e5d09ec885d839bbb6bd135d9716574d6c452060d17
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 94049
    end_char: 94075
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0444
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 96e-97b
char_span:
  start_char: 94107
  end_char: 95152
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 91fcd3cc320846a5ab03cedf511e07093d8eb5bed1cfa5bef4b0db4f29e0c325
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 94034
    end_char: 95153
    text_sha256: 79892a0acfef988ae813a98539dfeff3b858401227cc98867faf27a21211537c
  rationale: Direct response adjacency to ANCHOR 93 (ΚΕΒ.)'s τί σοι δοκεῖ περὶ αὐτῶν; — 1st-sg ἐμὲ εἶναι ... οὐκ ἀποδέχομαι ἐμαυτοῦ; ἔφη excludes the narrator; answering Cebes excludes Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0445
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 97b-98b
char_span:
  start_char: 95157
  end_char: 97128
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: eac6ed12779129ad6190dd402adbc840e0f8ed898fdf9d1c4485f32e369edd2a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 94034
    end_char: 100028
    text_sha256: 7fcb6dd7cf40a6392fcbfdeb2ad8cd0c79fd820c8a61731b8d882dcc8c2d018a
  rationale: "No responsive turn intervenes between 94, 95 and 96 — they are one continuous 1st-sg narrative, welded lexically: 95 ends λαβὼν τὰς βίβλους ... ἀνεγίγνωσκον and τὰς ἐλπίδας, and 96 opens ἀπὸ δὴ θαυμαστῆς ἐλπίδος ... ἐπειδὴ προϊὼν καὶ ἀναγιγνώσκων, resuming both. Since 96 grammatically self-identifies its speaker as Socrates, 95 is his; ὡς ἔφη also marks the whole as another party's speech relayed by the narrator."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0446
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 98b-99d
char_span:
  start_char: 97133
  end_char: 100027
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b8102355bd5cd77c941c01b566cbcdfa138bafffaa2e00a02f6f5fc133f8c343
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 97129
    end_char: 100068
    text_sha256: 013002c3dded18d89f36f52b3d9d43c388d12b55d4818b8e9a3b95a7df63c7cb
  rationale: "Explicit grammatical self-identification, the strongest ground in this range: the hypothetical objector says ὅτι Σωκράτης πάντα ὅσα πράττει νῷ πράττει, and the relative clause immediately shifts to 1st person — τὰς αἰτίας ἑκάστων ὧν πράττω — continued by ἐμοῦ καταψηφίσασθαι and ἐνθάδε κάθημαι. The 3rd-person Σωκράτης and the speaking ἐγώ are the same person. Closing vocative ὦ Κέβης excludes Cebes; ἔφη excludes the narrator."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0447
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 99d
char_span:
  start_char: 100032
  end_char: 100067
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c5087a77d17b8e9d74278fb597ae0e9ac9e467835bc2aaa85c83188d0634b579
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 97129
    end_char: 101176
    text_sha256: f271afca8f17dc03a793234320c5c36d7b3408c671e4bf7b72dfe08112d7abd6
  rationale: 1st-sg ὡς βούλομαι answers the βούλει ... ἐπίδειξιν ποιήσωμαι, ὦ Κέβης; that closes the immediately preceding unit, so the speaker is that vocatively named addressee — the naming is one unit away, not inferred across a run. ἔφη excludes the narrator; ANCHOR 99 (ΚΕΒ.) confirms the same respondent two units later.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0448
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 99d-100a
char_span:
  start_char: 100072
  end_char: 101093
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ba2da5793e93075f2cc35c472e3b936ac128bee07757d607088e0aa2cb280fd3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 100068
    end_char: 101176
    text_sha256: b8d9d5610d486fd9d0ad29cc4950c616fcdceea71e25a44e25a5074f3ecb8580
  rationale: ἦ δ’ ὅς excludes the narrator; the unit ends οἶμαι γάρ σε νῦν οὐ μανθάνειν and is answered by ANCHOR 99 (ΚΕΒ.) οὐ σφόδρα — response adjacency excludes Cebes as speaker and fixes him as the σέ.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0449
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100a
char_span:
  start_char: 101098
  end_char: 101168
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6f4783639603b40dd7d33d1f16a28a90b522dbac4b1df522407c35d1e2c3b284
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 101129
    end_char: 101155
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0450
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100b
char_span:
  start_char: 101180
  end_char: 101665
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fa2de1ffdeb50b1c2c54bfd653a23c6eebb40baef2ce5f04cc04d5222a473f56
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 101094
    end_char: 101757
    text_sha256: c06ebec579c36b79f6c7a3c2de458de50b5d4c073cea68dfb2713484c82ba544
  rationale: Bounded by ΚΕΒ. anchors on both sides with only this unit between. ἦ δ’ ὅς excludes the narrator; ἀλλ᾽ ... ὧδε λέγω answers ANCHOR 99's admission of not following, and ANCHOR 101 answers this unit's ἃ εἴ μοι δίδως with ὡς διδόντος σοι — verb coreference across both anchors.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0451
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100c
char_span:
  start_char: 101677
  end_char: 101756
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f7f36a6fd0890af666c0a2999f3e2bb5bf69d0cb37463343e26ef865b9205f89
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 101687
    end_char: 101713
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0452
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100c
char_span:
  start_char: 101761
  end_char: 101998
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5b85f9b1dae43d9a2edfe492fa280d145a5ed41f931818adeeea95ee1162b08b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 102017
    text_sha256: b58655769ac4aff7ffbb8ad69faf6a0c83556c9ccf5b6d9e9a187bae87da62e1
  rationale: ἔφη excludes the narrator; σκόπει δή ... ἐάν σοι συνδοκῇ ὥσπερ ἐμοί addresses the speaker of ANCHOR 101 (ΚΕΒ.), who had just told him to get on with it (οὐκ ἂν φθάνοις περαίνων); the closing συγχωρεῖς; is answered συγχωρῶ at 103.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0453
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100c
char_span:
  start_char: 102003
  end_char: 102016
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bb3e0df9c23723396808effe700d413bf6a3ac9962060472e1287f523e5e5150
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 103672
    text_sha256: 956b6abbcb214e43bd30d5a068ca9d398b5379ae891fa933c3bc6428973b1a5c
  rationale: 1st-sg συγχωρῶ is a verbatim echo-answer to συγχωρεῖς; at 102, whose 2nd-sg addressee is the speaker of ANCHOR 101 (ΚΕΒ.), one unit back. The sub-exchange 101-109 is closed at both ends by ΚΕΒ. anchors and holds one constant singular addressee throughout.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0454
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100c-100e
char_span:
  start_char: 102021
  end_char: 102824
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96b3813057167f6ad0f21527403baa21fcc236894b81421577c79ac471161039
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 103672
    text_sha256: 956b6abbcb214e43bd30d5a068ca9d398b5379ae891fa933c3bc6428973b1a5c
  rationale: ἦ δ’ ὅς excludes the narrator; continues the 1st-sg exposition of 102 (τοῦτο ... ἔχω παρ’ ἐμαυτῷ) and closes ἢ οὐ καὶ σοὶ δοκεῖ; to the respondent bounded by ANCHOR 101 and ANCHOR 109, both ΚΕΒ.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0455
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100e
char_span:
  start_char: 102829
  end_char: 102835
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d8545889630f32e0e05ca65dc8d3071a63c771e2e2ac6131a3b9106bc1d3d472
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 103672
    text_sha256: 956b6abbcb214e43bd30d5a068ca9d398b5379ae891fa933c3bc6428973b1a5c
  rationale: δοκεῖ is a bare verbal echo of ἢ οὐ καὶ σοὶ δοκεῖ; at 104. This is one of the three bare assents (103, 105, 107) inside the 101-109 span; I judge the span genuinely bounded — ΚΕΒ. anchors at both ends, four units apart at most, and the questioner's address stays 2nd person singular with no re-vocative and no plural anywhere in it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0456
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100e
char_span:
  start_char: 102840
  end_char: 102925
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 19b1beb039926b93c3ac233f3c145babc07f1522b9437d5073d96e39aa82827e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 103672
    text_sha256: 956b6abbcb214e43bd30d5a068ca9d398b5379ae891fa933c3bc6428973b1a5c
  rationale: καὶ μεγέθει ἄρα extends the speaker's own τῷ καλῷ τὰ καλά formula from 104 to magnitude; answered ναί at 107; sub-exchange closed at both ends by ΚΕΒ. anchors 101 and 109.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0457
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100e
char_span:
  start_char: 102930
  end_char: 102934
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 101673
    end_char: 103672
    text_sha256: 956b6abbcb214e43bd30d5a068ca9d398b5379ae891fa933c3bc6428973b1a5c
  rationale: Bare ναί answering 106, two units before ANCHOR 109 (ΚΕΒ.) and inside the 101-109 span with its single constant addressee.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0458
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 100e-101b
char_span:
  start_char: 102939
  end_char: 103619
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5d914d47f6930d100ea178eb9fd7def8c72eddbae34bb8de8ece7ee2d18a82a4
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 102935
    end_char: 103672
    text_sha256: 8a7ae059499b3d67fac670c999798f23f2345e7f5351e8a7c96af16965555fc1
  rationale: "Direct response adjacency: the closing ἢ οὐκ ἂν φοβοῖο ταῦτα; is answered by ANCHOR 109 (ΚΕΒ.) ἔγωγε, so Cebes is the 2nd-sg addressee (οὐδὲ σὺ ἄρ’ ἂν ἀποδέχοιο) and not the speaker."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0459
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 101b
char_span:
  start_char: 103660
  end_char: 103671
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f19690eb14f659c7878603daaf0d52bf381c888aaa1c2cbcbb3fd8c013e08d99
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Κέβης {/pers} γελάσας, ἔγωγε, ἔφη
    start_char: 103624
    end_char: 103670
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0460
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 101b
char_span:
  start_char: 103676
  end_char: 103906
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0352ec750a7ab466836bdf36f3a6c2c200aeeba6c164f52906b92d9db225eacd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 102935
    end_char: 103925
    text_sha256: 00d67241ae36cf3e5ca1fb2c374d1c9bcca39118b62c03bbb8f570000a5f3dfe
  rationale: ἦ δ’ ὅς excludes the narrator; φοβοῖο ἂν λέγειν ... ὁ αὐτὸς γάρ που φόβος explicitly resumes the φοβοῖο of 108 that ANCHOR 109 (ΚΕΒ.) answered — same speaker, same 2nd-sg addressee, so not Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0461
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 101b
char_span:
  start_char: 103911
  end_char: 103924
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 26895a1800a97f5d80fb47e17abfab1efc2a8e532273b21078fdafe4c13ca563
voice_chain:
  - ΦΑΙΔ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΚΕΒ.
  - ΣΙΜ.
unresolved_reason: πάνυ γ᾽, ἔφη is 3rd singular, excluding the narrator and the joint pair of 102a, so Cebes and Simmias both remain. Addressee-continuity from the preceding question favours Cebes, but the run carries a ΚΕΒ. anchor only on its left, none closing it on the right, and 102a shows Simmias answering in this stretch. A bare assent with an open right boundary does not discriminate between them.
limits: This record establishes that the span is one {p} discourse unit of the reported conversation and that its owner is one of the listed candidates. It selects none of them.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0462
source_work: Phaedo
outer_turn_id: turn_phaedo_0031
stephanus_span: 101b-102a
char_span:
  start_char: 103929
  end_char: 105286
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9094fd5c11e315d921909bc4f8c4ad501f2651a179580e7410974266a1eef923
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 103620
    end_char: 105377
    text_sha256: b323dc8caec611a985e827220dad7389ec47b2623e3d64bb54ba10cd57665cdd
  rationale: Two independent grounds. (i) It continues the 2nd-sg optative address of 110 to the same interlocutor anchored ΚΕΒ. at 109 — οὐκ εὐλαβοῖο ἂν λέγειν, βοῴης, ἐῴης ἄν, ἀποκρίναιο ἄν, σὺ δὲ δεδιὼς ἄν — and closes οἶμαι ἂν ὡς ἐγὼ λέγω ποιοῖς, explicitly opposing the speaking ἐγώ to the addressed σύ. (ii) The RULED unit 113 has Simmias AND Cebes together answering it (ἀληθέστατα ... λέγεις), which excludes both of them as its speaker; the narrator is excluded because his own speech in this turn is reported in the 1st person (ἦν δ᾽ ἐγώ / ἔφην, anchors 1-21). Only Socrates remains.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0463
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102a-118a
char_span:
  start_char: 105695
  end_char: 143492
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 12d31a69b0c97e9e8f90bbe7e389421ac19b1e6e01a7b991ff77a3c0c955d4b5
voice_chain:
  - ΦΑΙΔ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΦΑΙΔ.
    start_char: 105695
    end_char: 105700
limits: Records that the printed siglum opens this turn. It does not establish that Phaedo is the owner of any statement inside the conversation he reports.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0464
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102a-102b
char_span:
  start_char: 105695
  end_char: 106120
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d13d3d56c2ea567ad92ea69fb5c141fad65a6d34223e5d93ff45e7ae18576901
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 105695
    end_char: 109103
    text_sha256: acb7495027db80839f422ddfa34b3d358548359e56829118ff3f5202de85a4db
  rationale: The opening ὡς μὲν ἐγὼ οἶμαι is the narrator's own frame, but the utterance itself is introduced by 3sg ἠρώτα and ἦ δ’ ὅς, which exclude the 1sg narrator; the questioner is the party to whom the concessions were made (αὐτῷ ταῦτα συνεχωρήθη), not the party conceding. That same questioning voice runs unbroken through units 2, 4 and 6 into unit 7, where ἐγὼ … σμικρός εἰμι identifies him with the Socrates of his own illustration, and the ΣΩ. anchor at unit 10 shows Socrates owning τὰ νῦν λεγόμενα of this stretch.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0465
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102b
char_span:
  start_char: 106125
  end_char: 106131
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 105695
    end_char: 108014
    text_sha256: 718c296bec927caf70159b64bee20d4e0cee7646eed6507990b8fc7bc211ece1
  rationale: ἔγωγε answers the specific question of unit 0. The addressee is the one who is said to assert things about Simmias in the third person (ὅταν Σιμμίαν … φῇς μείζω εἶναι), which excludes Simmias himself, and third-person report throughout excludes the 1sg narrator; the respondent slot then runs without any signalled change into the ΚΕΒ. anchor at unit 8.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0466
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102b-102c
char_span:
  start_char: 106136
  end_char: 106596
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a7fc3708bbf8d6df44b4afafb127b1f1fc140908826058cc965fbc19193b2ab6
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 105695
    end_char: 109103
    text_sha256: acb7495027db80839f422ddfa34b3d358548359e56829118ff3f5202de85a4db
  rationale: ἦ δ’ ὅς is 3sg and excludes the narrator, and ὁμολογεῖς is addressed in the 2sg to the party that just answered at unit 1, so the speaker is the questioner of unit 0 continuing. That questioner is fixed as Socrates by unit 7, where his ἐγὼ … σμικρός εἰμι picks up precisely the σμικρότητα ἔχει ὁ Σωκράτης of this unit, and by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0467
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102c
char_span:
  start_char: 106601
  end_char: 106607
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 4556650e05f88b2a5e19b3887711f55dc01ec92d4ab41e1de666f85246a90675
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 105695
    end_char: 108014
    text_sha256: 718c296bec927caf70159b64bee20d4e0cee7646eed6507990b8fc7bc211ece1
  rationale: ἀληθῆ is the assent adjacent to the question of unit 2, from the same respondent as unit 1. Simmias is excluded because this respondent is the one addressed about Simmias in the third person at unit 0, and the respondent slot closes on the ΚΕΒ. anchor at unit 8 with nothing marking a change of answerer in between.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0468
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102c
char_span:
  start_char: 106612
  end_char: 106812
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ed09906d3f36ff5aa2db50970403035565c11b8e3af9c38418af717895219530
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 105695
    end_char: 109103
    text_sha256: acb7495027db80839f422ddfa34b3d358548359e56829118ff3f5202de85a4db
  rationale: οὐδέ γε αὖ continues the questioner's own series from unit 2 with no reporting verb intervening, and the unit names Phaedo in the third person as the larger term, which excludes the narrator from speaking it. The questioner of the series is Socrates on the coreference at unit 7 and the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0469
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102c
char_span:
  start_char: 106817
  end_char: 106828
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ae9ed2ef82de462d3beeea8a526058ec4b9605acb9f98449e00b56427cde4249
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 105695
    end_char: 108014
    text_sha256: 718c296bec927caf70159b64bee20d4e0cee7646eed6507990b8fc7bc211ece1
  rationale: ἔστι ταῦτα answers the question of unit 4 and comes from the respondent of units 1 and 3. Simmias is excluded by the third-person handling of him in the question put to this respondent at unit 0, and the run terminates in the ΚΕΒ. anchor at unit 8.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0470
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102c-102d
char_span:
  start_char: 106833
  end_char: 107134
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 83d30e3d3f630df36e39111d7b856e2bd6c6736819e8107b5d12012af5c3191d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 105695
    end_char: 109103
    text_sha256: acb7495027db80839f422ddfa34b3d358548359e56829118ff3f5202de85a4db
  rationale: "οὕτως ἄρα draws the conclusion of the questioner's own series begun at unit 0, and the closing συνέφη is the narrator reporting the other party's assent, not a second voice inside the utterance. The speaker is Socrates: he speaks of Simmias in the third person, and at unit 7 he immediately glosses this same speech with λέγω δὴ τοῦδ’ ἕνεκα and the self-identifying ἐγὼ … σμικρός εἰμι."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0471
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 102d-103a
char_span:
  start_char: 107139
  end_char: 107949
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 69dc9c9c3f27ca9606f751bf7733191cadd7d23ac59d695ffb21f35cd690ff6a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 106132
    end_char: 109103
    text_sha256: 549f7b08286902195f162807c48a8a5df0329228c1ddc23ad9f53cbbdc5f6153
  rationale: λέγω δὴ τοῦδ’ ἕνεκα resumes the speaker's own words of unit 6, and inside the speech ὥσπερ ἐγὼ δεξάμενος … οὗτος ὁ αὐτὸς σμικρός εἰμι corefers with ὅτι σμικρότητα ἔχει ὁ Σωκράτης of unit 2, fixing the ἐγώ as Socrates. The narrator is excluded because he is the larger term named in the third person at unit 4, and the ΣΩ. anchor at unit 10 has Socrates defend exactly this claim as his own.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0472
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103a
char_span:
  start_char: 107954
  end_char: 108013
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 73dbb9db1b229d8bdd6bc1c4ef694b2b056b1e789cdc56803ae337e1b5cad177
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 107966
    end_char: 107992
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0473
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103a
char_span:
  start_char: 108018
  end_char: 108369
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f5054ae1e6a5bdc11881c9197d17d4834d531630551c425ad6044a444f822b15
voice_chain:
  - ΦΑΙΔ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΙΜ.
  - ΚΡ.
  - ΑΠΟΛ.
unresolved_reason: The narrator positively declines to identify the speaker, τις … τῶν παρόντων with ὅστις δ’ ἦν, οὐ σαφῶς μέμνημαι, and the 3sg εἶπε excludes the narrator himself. The ΣΩ. anchor at unit 10 excludes Socrates, who answers the objection, and its ὧν ὅδε εἶπεν set against σέ excludes Cebes, who is asked separately; what survives is an unnamed bystander, so no single registered owner can be chosen.
limits: This record establishes that the span is one {p} discourse unit of the reported conversation and that its owner is one of the listed candidates. It selects none of them.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0474
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103b-103c
char_span:
  start_char: 108446
  end_char: 109102
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c18c978776213fabe03ff8d7043da04a60b3e68722526ee9b8936af319d488dd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} παραβαλὼν τὴν κεφαλὴν καὶ ἀκούσας, {103b} ἀνδρικῶς, ἔφη
    start_char: 108374
    end_char: 108459
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0475
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109107
  end_char: 109197
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 92668736fdb19167e3b6f155c482f6c9cf6e17099ac65611e696e0bb3ee62af0
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 109116
    end_char: 109142
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0476
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109202
  end_char: 109289
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a67f6d821f39fe299e9070170c1ba61533f67b224c5d55085bbc44872f07e4b8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 109311
    text_sha256: bbfcf7d628e6daf13c9920cd77638a14af32a7e5b4cda242c6ab2bb29c7d8731
  rationale: ἦ δ’ ὅς is 3sg and excludes the narrator, and the unit resumes the question put to Cebes at the ΣΩ. anchor of unit 10 after Cebes' reply at the ΚΕΒ. anchor of unit 11, so the speaker is Cebes' interlocutor. The 1pl συνωμολογήκαμεν gathers the agreement Socrates has just been extracting at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0477
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109294
  end_char: 109310
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8a9d976d93ba49a3f15aba0fd0ec040a6d4b221b8288c58fd64389c004bd47a9
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: παντάπασιν, ἔφη answers the specific question of unit 12; ἔφη is 3sg and excludes the narrator. The answering slot of this exchange is closed at both ends by ΚΕΒ. anchors, unit 11 and unit 29, with no reporting formula anywhere between them marking a new answerer.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0478
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109315
  end_char: 109399
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a1c93a51e83fa9d386f172e4910b79d9091aa07eb06f8d547083d1d097af0514
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: The imperative σκέψαι and 2sg συνομολογήσεις are addressed to the respondent, and 3sg ἔφη excludes the narrator, so this is the questioner speaking. He resumes his own συνωμολογήκαμεν of unit 12, and the questioner of this run is fixed as Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0479
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109404
  end_char: 109410
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 96df4e79d748812432bef64a4c71837a704fdbc0cc95a43a4af2118ce3f124b6
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: ἔγωγε is the echo-answer to θερμόν τι καλεῖς καὶ ψυχρόν; at unit 14, so it belongs to the respondent of this exchange. That respondent slot is bracketed by the ΚΕΒ. anchors at units 11 and 29 with no signalled substitution.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0480
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103c
char_span:
  start_char: 109415
  end_char: 109438
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a9c08fa5cefe1f70e50ffadc7c5b3b9f1be542997bbc7e2c8a417351fd257e2e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: ἆρ’ ὅπερ χιόνα καὶ πῦρ; is elliptical on the questioner's own θερμόν … καὶ ψυχρόν of unit 14 and cannot stand as an answer to it, so it continues the questioner. The questioner of the run is Socrates by the ΣΩ. anchor at unit 10, the answer at unit 17 being the respondent's.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0481
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109450
  end_char: 109482
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 37245a8fe8591925414fadeae2c5b5d5ef92e1c1d3a875be21616f29d7297b2c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: μὰ Δί᾽ οὐκ ἔγωγε denies the question of unit 16 and echoes the respondent's own ἔγωγε of unit 15, so the same answerer is speaking. That answerer is Cebes on the ΚΕΒ. anchors bounding the exchange at units 11 and 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0482
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109487
  end_char: 109549
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 601ee93a6423040f40d4e76ab1b87464002869245a2035bee74f01dd33b15d89
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: ἀλλά takes up the respondent's denial at unit 17 and reformulates the question, which is the questioner's move, not the answerer's. The questioner throughout this run is Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0483
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109554
  end_char: 109558
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: ναί is the bare assent adjacent to the question of unit 18 and so belongs to the respondent. The respondent slot is closed at both ends by the ΚΕΒ. anchors at units 11 and 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0484
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109563
  end_char: 109769
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 42caf63b33d1d397fcfcd57cfd3c25216f3ed78f06c7d264b60f1105ef15a813
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: δοκεῖ σοι addresses the respondent in the 2sg, so the speaker is his interlocutor, and ὥσπερ ἐν τοῖς πρόσθεν ἐλέγομεν claims the earlier formulation as the speaker's own, matching the τότε μὲν γὰρ ἐλέγετο of the ΣΩ. anchor at unit 10. The questioner here is therefore Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0485
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109774
  end_char: 109782
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: πάνυ γε answers the question of unit 20 and belongs to the party addressed there in the 2sg (σοι), which excludes the questioner. That answering party is Cebes on the ΚΕΒ. anchors at units 11 and 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0486
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103d
char_span:
  start_char: 109787
  end_char: 109940
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 46c44533ff8a4262f715da79f5386c319ef2d55f969f97ac0298b49881661b26
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: καὶ τὸ πῦρ γε αὖ extends the speaker's own snow-clause of unit 20 in the same governed infinitive construction, so it is the questioner still speaking. The addressee replies at unit 23 with 2sg λέγεις, confirming two parties, and the questioner is Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0487
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103e
char_span:
  start_char: 109952
  end_char: 109971
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cb3334a5fb7db84bd7fe46e5eeffeb62f0350edd054818bd5efe6cd086fc0a3c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: ἀληθῆ … λέγεις addresses the speaker of unit 22 in the 2sg, so this is the other party, and 3sg ἔφη excludes the narrator. The other party is Cebes on the ΚΕΒ. anchors bounding this exchange at units 11 and 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0488
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103e
char_span:
  start_char: 109976
  end_char: 110306
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 88566d7c40abce894c12812689b5a10de8290e9afcafa49b29bbe26be07c9d30
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: ἦ δ’ ὅς is 3sg and excludes the narrator, and ἔστιν ἄρα draws the inference from the speaker's own units 20 and 22 while ending in a fresh question, ἢ οὔ;. The one putting the questions in this run is Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0489
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103e
char_span:
  start_char: 110311
  end_char: 110319
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: πάνυ γε answers the ἢ οὔ; put at the end of unit 24, so it is the respondent's. The respondent slot runs unbroken between the ΚΕΒ. anchors at units 11 and 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0490
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 103e-104b
char_span:
  start_char: 110324
  end_char: 111047
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ab34c8d209cf62f6f7e7f4f78036a33236e7cc2f970c36a33422d62aaa4f6b9d
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: The parenthetical 1sg τοῦτο γὰρ ἐρωτῶ inside the speech marks the speaker as the one asking, and σκόπει, δοκεῖ σοι and συγχωρεῖς ἢ οὔ; are all addressed to the respondent. The questioner of this run is Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0491
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104b
char_span:
  start_char: 111052
  end_char: 111069
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 594d02788e6d7396245c9aff2b685bce76bb48cb2b8a40b0467d854364a8ffb4
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 109103
    end_char: 111550
    text_sha256: 72eef5ef4f5b90116fbc763e50e486e9914e712df3d3be6b7dc8ba9b2ec24c14
  rationale: πῶς γὰρ οὔκ; answers the συγχωρεῖς ἢ οὔ; of unit 26, and 3sg ἔφη excludes the narrator. The answerer is Cebes on the ΚΕΒ. anchors at units 11 and 29 that bracket this exchange.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0492
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104b-104c
char_span:
  start_char: 111074
  end_char: 111502
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: afc014b11f482fe7c4f18da53869f1bdb61e7dba3b1b216c99adab00e211ffad
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 108370
    end_char: 111550
    text_sha256: 0ead790c4609c0ce1fe54a899ffd38ed1f94018489272abe295dadd063a09f20
  rationale: The imperative ἄθρει with 1sg βούλομαι δηλῶσαι is the questioner addressing the respondent, and it closes with a question answered at unit 29 by the ΚΕΒ. anchor, which excludes Cebes as its speaker. The questioner is Socrates by the ΣΩ. anchor at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0493
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111507
  end_char: 111549
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 339d2a615b1d9b5ae3bcbf56b044a5867f5cd24c78413a591f0e0b0784b0d7b9
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 111521
    end_char: 111547
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0494
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111554
  end_char: 111602
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b479c22918a90d25ac06971975baf16c0daeb01675a266b72bcc973395b7258c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 108370
    end_char: 111619
    text_sha256: e50149c4a2aee77f62619aa4aae2856912a4c24d812a03033aa7caad3a949c36
  rationale: Unit 10 names its speaker outright (καὶ ὁ Σωκράτης ... εἶπεν, ἆρα μή που, ὦ Κέβης) and shows him putting questions to Cebes; Cebes answers by name at unit 11 and again at the anchor in unit 29, and no third speaker is introduced anywhere between. The ἦ δ’ ὅς here is third person, excluding the narrator, and οὐδὲ μήν continues the interrogator's own thread from unit 28 rather than replying to unit 29.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0495
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111607
  end_char: 111618
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ff4d9fc31ea6c1da9b0e734fc6aff20102b6fd15ee3f622c95720dacf383e6b4
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 111550
    end_char: 111737
    text_sha256: 8d8215b96b23e8b9557bbcd33f8182680b09b4a17414714c46da96fc209ea2c7
  rationale: οὐ γὰρ οὖν is an assent that takes up the negative of the immediately preceding assertion (οὐδὲ μήν ... ἐναντίον), so it belongs to the man being questioned and not to the questioner of unit 30. The addressee of this interrogation is fixed as Cebes by the naming formula at unit 10 and by the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0496
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111623
  end_char: 111736
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b0a39d623962909aef62b1ada746ff546020876b26443033559b7b51a423e2c8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 111603
    end_char: 111766
    text_sha256: 1a5e586456534ff6020270d446355d5feb828484e9d14b5bb3740a7652749095
  rationale: οὐκ ἄρα draws the inference out of the assent just given, which is the move of the man conducting the examination, not of the man who assented. That examiner is the speaker named at unit 10, and no new speaker enters between the Cebes anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0497
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111741
  end_char: 111765
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 9cf5deec2a389e9e08a4c731313e5eefe23e8ec99792e601d76e001dcbe467ab
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 111619
    end_char: 111838
    text_sha256: 18c4c2967f65918e82b82d3ad312796c2cf117e5a24b40f3fd2ae492bb7472d8
  rationale: ἀληθέστατα λέγεις is a second-person endorsement of what unit 32 just asserted, so its speaker cannot be the speaker of unit 32; the third-person ἔφη also excludes the narrator. The respondent in this stretch is Cebes on the anchors at units 29 and 67 and the vocative at unit 36.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0498
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111770
  end_char: 111837
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a040f60fcc4a0a4e183160f14b0d8c02c74061cbcf6391348db9d97b00bb7414
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 111737
    end_char: 111858
    text_sha256: af6ce104203953ae961967d651a8c7a2de7b54fca60a65558d26ad3f195fb9f5
  rationale: The second-person βούλει and the hortatory first-person plural ὁρισώμεθα are addressed to the man who has just endorsed the argument, so the speaker is the examiner, and the third-person ἦ δ’ ὅς excludes the narrator. That examiner is the speaker named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0499
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104c
char_span:
  start_char: 111842
  end_char: 111850
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 111766
    end_char: 112013
    text_sha256: 26cebadddc57710d780b7f5eba36df2b11ebef3b38a52fd773ead3392c963e18
  rationale: πάνυ γε answers the βούλει question of unit 34 and so belongs to the person addressed by it. Unit 36 then names that addressee in the vocative, ὦ Κέβης, as the examiner carries out the very definition he proposed.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0500
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 111862
  end_char: 112012
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: bf88f37d484b9f65c41062b5719942b525d730d9d2c1ff83466dfa4041df8b35
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 111838
    end_char: 112029
    text_sha256: 433fe6fbb50980dbc485d22f541519129b64ab0df0b7907caafdd34a63ca6d7a
  rationale: The vocative ὦ Κέβης proves the speaker is not Cebes, and the unit executes the ὁρισώμεθα proposed in unit 34 and consented to in unit 35, so it is the same examiner speaking. That examiner is named at unit 10, where the identical formula ὦ Κέβης introduces his questioning.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0501
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112017
  end_char: 112028
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 906af4c8f88e878699f158e66f39dbd23a0617b5107701f6fc8aeb3d2b918d7b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 111858
    end_char: 112161
    text_sha256: ce3a59fd5d85df7986764d51149a7831184bfdb179c2752c787cb9f9f26e67d5
  rationale: πῶς λέγεις asks the speaker of unit 36 to explain himself, so it comes from the man unit 36 addressed in the vocative, Cebes. Unit 38 confirms the direction by answering it with ὥσπερ ἄρτι ἐλέγομεν, a speaker pointing back to his own words.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0502
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112033
  end_char: 112160
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3d1a7bba34b20fcea7210524a9310f4ae8e91e31ab817e37959098fffa6feed4
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112013
    end_char: 112174
    text_sha256: b5e3ed86a7b8c9166bfab8cadb7198ddb8509b392792389683f88f96178e8c42
  rationale: ὥσπερ ἄρτι ἐλέγομεν answers the request for clarification by resuming what its own speaker had just been saying, and οἶσθα γὰρ δήπου addresses the questioner of unit 37. The speaker is therefore the examiner of unit 36, who is named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0503
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112165
  end_char: 112173
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cd39b9ee5b788b83ecfe8c4b0b43691a4a781f522e880d4dcdec8585c116a823
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112029
    end_char: 112278
    text_sha256: b5c4fde6e5f1e1133ef967a4b2a99dad157b4b73a5f96a8cbc042c32c047165f
  rationale: πάνυ γε assents to the ἀνάγκη claim of unit 38 and so belongs to the man addressed there by οἶσθα, who is Cebes on the vocative of unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0504
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112178
  end_char: 112277
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c7862620139c835397be1c26b75b0d62ea7add29c74bf541aa86bb8dba6a11dd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112161
    end_char: 112290
    text_sha256: 938116b966ed0f80ed7517260026f439e65f2be36dfcc0efdfefe93379f1b56b
  rationale: The unit builds the next step on the assent just granted and speaks in the first-person plural φαμέν of the position the examiner has been constructing since unit 34. It is the examiner named at unit 10; no new speaker enters between the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0505
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112282
  end_char: 112289
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6b63435306674214a6bb87d1bf07cc006eb169660f3775f773716111c34aa5e1
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112174
    end_char: 112321
    text_sha256: afbc2a7d0e1fc3f4a5bfef4d68d00adf6867f69da88faed619a32e4438315d55
  rationale: οὐ γάρ is an assent echoing the negative οὐδέποτ’ ἂν ἔλθοι of unit 40, so it is the respondent's, not the speaker's of unit 40. That respondent is Cebes on the vocative at unit 36 and the flanking anchors.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0506
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112294
  end_char: 112320
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 69259f11cafca7434baaab3cf4db0bda3143af74e551609067a31652f1f5d730
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112278
    end_char: 112330
    text_sha256: df572a7657cbe44361b1c92ea99e8925f8e2fc6c5ae139ab61ac7d4a0c38516a
  rationale: A fresh question put to the man who has just assented, in the chain of short interrogatives the examiner is driving; the examiner is the speaker named at unit 10 and the exchange is unbroken between the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0507
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112325
  end_char: 112329
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112290
    end_char: 112365
    text_sha256: 67384f42feb7adc281172d2ad45e2ac79d70564c6ada63ecef414cbfb1be0b83
  rationale: ναί answers the specific question of unit 42 and so belongs to the man being questioned, Cebes, who is fixed as the respondent by the vocative at unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0508
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112334
  end_char: 112364
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2f2693f697cd3022c20a2da6a3fd9401727bf3ad4899b88179d666df14c8b1c8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112321
    end_char: 112381
    text_sha256: ec109abd125126db4b4918411fc34a426fe549a5290205f60e98ca1d43b2661d
  rationale: δέ continues the examiner's own series of questions from unit 42 across the intervening ναί, so the speaker is the questioner, not the man who answered. That questioner is named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0509
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104d
char_span:
  start_char: 112369
  end_char: 112373
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112330
    end_char: 112434
    text_sha256: 9e5c79f0cd20d1fd7f31a1d9cb5fb67373373940d13b048272bb9a77c37c4839
  rationale: ναί answers the question of unit 44 and belongs to the respondent of this bounded exchange, who is Cebes on the vocative at unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0510
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112385
  end_char: 112433
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ea6fcb19af1b2f2f52e603e4cbae19f9e7a35dbcf665427726be38ae7c9e892a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112365
    end_char: 112447
    text_sha256: 4f0aa73929e0d17154091245d7d1943acc7ef65b9acfef16954aaad8b93a182e
  rationale: ἄρα draws the conclusion from the two admissions at units 43 and 45, which is the examiner's move and not the assenter's. The examiner is the speaker named at unit 10, and nothing between the anchors at units 29 and 67 introduces another.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0511
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112438
  end_char: 112446
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 10cb0e0b9c39de13d7e4d377d253c36b91a8c02f85a31c8ef9be48d4385bca30
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112381
    end_char: 112481
    text_sha256: 69a11817559ae1967ebdf3f4167764060df641df2ecae7bf9486616867e80439
  rationale: οὐ δῆτα assents to the negative of unit 46 (οὐδέποτε ἥξει), so it is the respondent's word. The respondent throughout this stretch is Cebes on the vocative at unit 36 and the flanking anchors.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0512
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112451
  end_char: 112480
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 420f32a34dad2abfbd2ccf8164edd2a2ed4cec24a1b3b3583492e1716aacf8fd
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112434
    end_char: 112493
    text_sha256: e0751ac1355f77a3cd071d249dedb3e6cc0b156cf027a77dbdd8af304781cda5
  rationale: δή restates the result of unit 46 as a further step, which is the examiner continuing his own chain rather than the man who just assented. The examiner is the speaker named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0513
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112485
  end_char: 112492
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: da80cd698564c982212825fe9c57a018b2b52a19a5598fffa48e50c388726d54
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112447
    end_char: 112519
    text_sha256: 0a8af6a94ce4079792626f7063c8aad5562bf9d5a84e428ca205c506ffb5b478
  rationale: ἄμοιρα is a bare lexical echo-answer repeating the predicate of unit 48, the classic assent of the man being questioned. That man is Cebes on the vocative at unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0514
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112497
  end_char: 112518
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0dfe716a7511c8befb0cd85e68de230a434bc5d310f26782cf976441dcaaa6e3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 112481
    end_char: 112528
    text_sha256: a7bcc48842f109cc1fb6d60d7875027aa78f2cbbae19d59ffbc3709bb854675c
  rationale: ἄρα infers from the echo-assent just given, the examiner's move; and unit 52 shows the same speaker resuming the ὁρίσασθαι he proposed at unit 34, which ties this whole run of questions to one man. He is named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0515
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e
char_span:
  start_char: 112523
  end_char: 112527
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dbd0c92a0b8f1a90c2d4a499a2ba4837cec4195365f6872d2b81c311782f3478
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112493
    end_char: 113375
    text_sha256: 1ce4f1d20259189721b945d5ab21fcdae921beda5dbd731a9b8b3c98104097d0
  rationale: ναί answers unit 50 and so belongs to the respondent, Cebes, who is fixed by the vocative at unit 36 and by the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0516
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 104e-105b
char_span:
  start_char: 112532
  end_char: 113374
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 60e8fcaf16449931a629af2d6d8adaf89143e88b378b6d49dee86699388b7a43
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 111766
    end_char: 113422
    text_sha256: cc9952042d0625cb377ca3170488b7eb1bc3c4e222160a4ea48b3c393c6fce95
  rationale: ὃ τοίνυν ἔλεγον ὁρίσασθαι is a speaker resuming his own earlier words, namely the ὁρισώμεθα he proposed at unit 34, so unit 52 has the same owner as unit 34. The second-person ὁρίζῃ, ἕπῃ and συνδοκεῖ σοι address the respondent, and the speaker is the man named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0517
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105b
char_span:
  start_char: 113379
  end_char: 113421
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f12b8ece36cdb3a1e878f72d07765e6fc30e799e47b4cec5b679d760bcea1671
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 112528
    end_char: 114038
    text_sha256: 8cb1babf66073f403911cc3dd71e009b15194e6de83157210bfa3fcc81ba34d1
  rationale: συνδοκεῖ and ἕπομαι answer, in the first person, the second-person συνδοκεῖ σοι and ἕπῃ with which unit 52 closes, so the speaker is that unit's addressee; the third-person ἔφη excludes the narrator. The addressee is Cebes on the vocative at unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0518
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105b-105c
char_span:
  start_char: 113426
  end_char: 114037
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e8f7c27c892d85740ba196317f11f41029235409488c1516fed8a923e715611a
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 113375
    end_char: 114065
    text_sha256: 6cbec0494c7871c102fb15f9126958979931c0c5405b4ab8dae0dd0efb1a3df7
  rationale: The imperatives λέγε and ἀποκρίνου are given to the man who has just said he follows, and λέγω δὴ παρ’ ἣν τὸ πρῶτον ἔλεγον ἀπόκρισιν is a speaker recalling an answer he himself earlier gave, so this is the examiner, not the respondent. He is the speaker named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0519
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105c
char_span:
  start_char: 114042
  end_char: 114064
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cf16e0016092ace94244d1b59004692b2974cdb7c4c5ba2aa62e7116f6ae7fb3
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 113422
    end_char: 114128
    text_sha256: 034284545631a5ec0405381f6feb9019e465c45d74e4261ef65e242910d40682
  rationale: ἀλλὰ πάνυ ἱκανῶς echoes the ἱκανῶς of the question ὅρα εἰ ἤδη ἱκανῶς οἶσθ’ ὅτι βούλομαι that closes unit 54, so the speaker is that question's addressee, and ἔφη excludes the narrator. The addressee is Cebes on the vocative at unit 36 and the flanking anchors.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0520
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105c
char_span:
  start_char: 114069
  end_char: 114127
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3ba47be5375b9d3ec21f65859b4f6fdbd6dd14d25b0ca71f90955d8fbb975ea9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114038
    end_char: 114156
    text_sha256: 41eed82a3f235811fb73910c66a095f9c46b79753d91ebdaaa8c73ed83a2d1ae
  rationale: The imperative ἀποκρίνου δή can only come from the man demanding the answer, and it carries out the ἀποκρίνου of unit 54; the third-person ἦ δ’ ὅς excludes the narrator. The examiner is the speaker named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0521
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105c
char_span:
  start_char: 114132
  end_char: 114148
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a990c7016147479dcdedd1b087da501b400d26fc48bc95ffeda9f9ad9e02b989
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 114065
    end_char: 114189
    text_sha256: 5d06c4b66d88bfd45cf500f79bfd8100afb69df61c6e820a835a8f5ce6ca0ca6
  rationale: ᾧ ἂν ψυχή supplies exactly the relative clause the question of unit 56 left open (ᾧ ἂν τί ἐγγένηται), so it is the answer of the man ordered to answer. That man is Cebes on the vocative at unit 36 and the anchors at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0522
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114160
  end_char: 114188
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: dc414ec66a2030260bd967333964233e354ea24fd5718fbd28eb9abc0758ce12
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114128
    end_char: 114216
    text_sha256: 4126cd86b951f3201fe04658c3b676222a56c727c9a213515245c093c233d3d8
  rationale: οὐκοῦν presses the answer just supplied for a further concession, which is the examiner's move and not the answerer's. He is the examiner named at unit 10, and the exchange runs unbroken to the anchor at unit 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0523
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114193
  end_char: 114215
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 14d3e18820fd111872bb596b7de686e2917678294435574d75e0dc513a23fb13
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 114065
    end_char: 114536
    text_sha256: 155f64ead02dc00295ac91f58c4e80b6f42c97e02fac5560ce190a9e7d14f1da
  rationale: "πῶς γὰρ οὐχί assents to the question of unit 58, and the parity of the run is pinned at both ends: unit 56 is the examiner's ἀποκρίνου δή and unit 67 is anchored to Cebes answering unit 66, and the units between admit no other distribution. The ἦ δ’ ὅς here sits on the answering side, which is unusual but is third person and so only excludes the narrator."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0524
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114220
  end_char: 114283
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fbbe460fa9d9fad20fd4dd5e2406191edbca1cf2a6755266e7c28f86b18549f3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114128
    end_char: 114306
    text_sha256: 897e4d79d96793b51c24460a651b71130cdd8cc68b491b7e69450c73a2f0200a
  rationale: ψυχὴ ἄρα draws the inference from the answer ᾧ ἂν ψυχή given at unit 57, so the speaker is the man who asked for that answer, not the man who gave it. He is the examiner named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0525
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114288
  end_char: 114305
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 995cf9e3aa147b75fd54f2db7c7d39abe12509787ef98fb4ed648848265bbf34
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 114216
    end_char: 114351
    text_sha256: 71451bbcd43d4b3ef31c8677df75b3e7bbe09a1a6fb3cf0aada35800be3ae8a5
  rationale: ἥκει μέντοι is a lexical echo-answer repeating the verb of unit 60's question, and ἔφη is third person, excluding the narrator. The answerer in this run is Cebes, anchored at unit 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0526
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114310
  end_char: 114350
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 32e7bc82fee694434b387c591ed78f8d9aee5c02baeaecff33990a4a6bf1af12
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114284
    end_char: 114367
    text_sha256: f15c2885f7b0743484d3d559ed17869e6d28deb89b6820a53800ff06e6bf1801
  rationale: A new disjunctive question πότερον ... ἢ οὐδέν put to the man who has just assented; the questioner is the examiner named at unit 10, and the run is closed by the Cebes anchor at unit 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0527
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114355
  end_char: 114366
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 13cca81d768d57d73f832f23395ce88eefa3a9c9ddb2c268a358c0ac221cce6c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 114306
    end_char: 114375
    text_sha256: cfcafc8b48104680d04d2faee987b16a70cebdadd8d353740f9c44fd2082d0d1
  rationale: ἔστιν takes the first limb of the disjunction offered in unit 62, an echo-answer that must come from the person questioned, and ἔφη excludes the narrator. That person is Cebes, anchored at unit 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0528
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114371
  end_char: 114374
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d1c1f59d163b1e10bd64647b22f68ffce9cc2b079d5837f4704e9b77f1b9f866
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114351
    end_char: 114388
    text_sha256: db9d1abade5826b1a79655be07c42c6cba8e65aa90fb557300221e6b14c3169f
  rationale: τί presses the answerer of unit 63 to name what he has just said exists, so it belongs to the examiner, and unit 65 supplies the noun in reply. The examiner is the man named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0529
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114379
  end_char: 114387
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 32385a8e5fedbacc958298a9271880af37e9eff6bb28778c0ea176ebe8e254d0
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 114367
    end_char: 114486
    text_sha256: dd7413f689e1e45dd00f3237d191f9911d2999dec43c09f8873b7ccee978cac8
  rationale: θάνατος is the bare answer to the bare question τί of unit 64, so it comes from the man being questioned, Cebes, whose role as respondent is anchored at units 29 and 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0530
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114392
  end_char: 114485
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8331be87273e86e2b423d6c7639c60d5c22edbd595b9df5aa017db603cad35f7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114375
    end_char: 114536
    text_sha256: 111e1682b5b5473ec88d39aaba6f50d17009120c3d8fc50f03a723f3b66af40a
  rationale: The anchor at unit 67 has Cebes answering this question with καὶ μάλα σφόδρα, which proves unit 66 is not Cebes; οὐκοῦν and the appeal ὡς ἐκ τῶν πρόσθεν ὡμολόγηται mark the examiner collecting his own earlier agreements. He is the speaker named at unit 10.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0531
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114490
  end_char: 114535
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d10f57a03c692bc8303d405e7ac90acbfb9b62f5735d4bf0707291be232b388c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Κέβης {/pers}
    start_char: 114507
    end_char: 114533
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0532
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114540
  end_char: 114605
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 235697dc56eb846f5a275d09128867db42231903926dc5db7ea3eca187677512
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: "The stretch from 67 is a two-party exchange: the answering party is anchored as Cebes at 67 and says ὦ Σώκρατες at 79, while the questioning party is marked 3sg ἦ δ’ ὅς and addresses ὦ Κέβης at 80. Unit 68 is a question of that questioner's series (1pl ὠνομάζομεν, answered at 69), so its owner is neither Cebes nor the narrator."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0533
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114610
  end_char: 114624
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 87e98b9141cc250b8b180e425b1614115333f826b01e842d0a8527fdc458b565
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: ἀνάρτιον is a one-word echo-answer supplying what 68 asked for (τί ... ὠνομάζομεν), built on that question's ἀρτίου. 3sg ἔφη excludes the narrator, and the answering slot in this exchange is anchored to Cebes at 67 and marked not-Socrates by ὦ Σώκρατες at 79.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0534
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105d
char_span:
  start_char: 114629
  end_char: 114685
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b85a63ec48f583b5dd7712fcd7eb5a656af9f6582d4a5d048154e696515a13a7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Elliptical continuation of 68's own question, sharing its verb and its δέ-series (τὸ δὲ δίκαιον μὴ δεχόμενον ... ὠνομάζομεν), so the speaker is resuming his own sentence rather than replying to it. That questioner addresses ὦ Κέβης at 80 and so is not Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0535
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114697
  end_char: 114724
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 392ccf933a309eeea789e2d0b219426a37c572d347b4e49b9b61e031975ef743
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Supplies both names 70 asked for, ἄμουσον and τὸ δὲ ἄδικον, matching the two clauses of that question. 3sg ἔφη excludes the narrator and the answering party is fixed to Cebes by the anchor at 67 and the vocative ὦ Σώκρατες at 79.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0536
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114729
  end_char: 114774
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 14b6bbf797df53d81276404d863bac942d9187a64658d2b6f4cd695d3f01b04e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Continues the same interrogative series in the same shape (ὃ δ’ ἂν θάνατον μὴ δέχηται, 1pl καλοῦμεν answering to 68's ὠνομάζομεν), so it belongs to the questioner who at 80 addresses ὦ Κέβης and is marked 3sg.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0537
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114779
  end_char: 114793
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 47990f6f64d0dbf27b84ee3924547ef3c69b444d092d244189dd54e49d18bbc1
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: ἀθάνατον is the echo-answer naming what 72 asked to be named, with 3sg ἔφη excluding the narrator. The answering party is Cebes by the anchor at 67 and by ὦ Σώκρατες at 79.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0538
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114798
  end_char: 114829
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 10d7da7ab243aea15d614282462c6c553c608ddc4b170c33b8859715e93c7679
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Takes up 73's ἀθάνατον and turns it back as an οὐκοῦν question about ψυχή, continuing the δέχεσθαι series of 68-72. The owner of that series addresses ὦ Κέβης at 80, which excludes Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0539
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114834
  end_char: 114837
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 50371a72d45c2441deeb2252bc373abe3df325eba343eaf75da306a9c0f0a813
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Bare οὔ answering the negative οὐκοῦν ... οὐ δέχεται of 74. The answering slot of this bounded exchange is anchored to Cebes at 67 and marked not-Socrates by ὦ Σώκρατες at 79.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0540
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114842
  end_char: 114860
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 11ac7b3fc3a7d2ff800e3a47827410ee22819a1c12993c8ca457b0a37c287b29
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: The ἄρα-inference is drawn from the question-and-answer pair 74-75 by the party who put 74, and its predicate is then given back bare as assent at 77. The questioner is excluded from being Cebes by ὦ Κέβης at 80.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0541
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114865
  end_char: 114874
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75db47979e590b2adbc2030c9c3dd3a23a0319c58c897b46be165afbf751da7c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Bare repetition of 76's predicate as assent, the same shape as the answers at 69, 71, 73 and 75. Unit 78, whose speaker is fixed as Socrates by the vocative ὦ Σώκρατες in its reply at 79, then asks ἢ πῶς δοκεῖ, which presupposes that the interlocutor has just spoken.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0542
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114879
  end_char: 114935
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f0e7b945d6afd1e2de13558eb7c0483de459b7efa265ef3cf120a96934df5a0c
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: Unit 79 answers this unit's ἢ πῶς δοκεῖ and addresses ὦ Σώκρατες, so the speaker of 78 is Socrates and not the replier; 3sg ἔφη additionally excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0543
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e
char_span:
  start_char: 114940
  end_char: 114987
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5f73fdb705e951d894d443b75e42cc4d9408c6c2db3289791ee5dc1722781d00
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114486
    end_char: 115118
    text_sha256: 8974ae2f7df1bbce66902a2117689a93dc8a997d22211d5d1b16d2300af82fed
  rationale: The vocative ὦ Σώκρατες excludes Socrates. The unit answers 78's ἢ πῶς δοκεῖ, and the answering party of this exchange is anchored as Cebes at 67 and addressed ὦ Κέβης at 80.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0544
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 105e-106a
char_span:
  start_char: 114992
  end_char: 115117
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: fcfb899461e88c6b04c8eb80875fc67e723cc2c018dcecb38d884a320035fb32
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: ἦ δ’ ὅς is 3sg, excluding the narrator, and the vocative ὦ Κέβης excludes Cebes. The only other party in this exchange is the one the answerer addresses as ὦ Σώκρατες at 79 and who is anchored ΣΩ. at 90.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0545
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106a
char_span:
  start_char: 115122
  end_char: 115133
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806c3ef9fae2499d4d42647036b43db646c95ac81e078cdace54331a35788487
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: πῶς γὰρ οὔ answers the ἄλλο τι ... ἂν ἦν question of 80, which is explicitly addressed ὦ Κέβης, so the answer is Cebes'.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0546
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106a
char_span:
  start_char: 115138
  end_char: 115334
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 016cb53c57e31e223eb75f5f24b4d3facb685cc74b68eaa29786319c0a491a69
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: An οὐκοῦν question put after 81's assent, answered at 83 in the 2sg (ἀληθῆ λέγεις). Its owner is the questioner who addresses ὦ Κέβης at 80 and is anchored ΣΩ. at 90.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0547
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106a
char_span:
  start_char: 115339
  end_char: 115358
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cb3334a5fb7db84bd7fe46e5eeffeb62f0350edd054818bd5efe6cd086fc0a3c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: ἀληθῆ ... λέγεις is a 2sg assent directed at the speaker of 82, with 3sg ἔφη excluding the narrator. The assenting party is the one addressed by name at 80.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0548
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106a
char_span:
  start_char: 115363
  end_char: 115510
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 81564f8b97d1f199deab70df7cebbe01d6adb5f14ad3ed4d96f3aef1c9c580dc
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 114988
    end_char: 115535
    text_sha256: 7759b6121d80cddb6bd538f4f576a281b02c43f431a7bc6f5ebec3be8c92e36c
  rationale: ὣς δ’ αὔτως explicitly continues the speaker's own parallel case from 82, so the same man speaks, the one addressed ὦ Σώκρατες at 79 who names Cebes at 80.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0549
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106a
char_span:
  start_char: 115515
  end_char: 115527
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 957a4d55b1da4147f13d447b0b3012b678cd7c823196ab62661f64de79d59e7c
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: ἀνάγκη, ἔφη is assent to 84's counterfactual, with 3sg ἔφη excluding the narrator. The assenting party is the one addressed ὦ Κέβης at 80 and anchored at 67.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0550
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106b-106c
char_span:
  start_char: 115539
  end_char: 116343
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cfb4ad7f79fdc061cb27843cfec3024b8dcd26f7c2b8232335a7ab3aca6ab6b3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: Picks up 85's ἀνάγκη (οὐκοῦν καὶ ὧδε ... ἀνάγκη ... εἰπεῖν), recalls the earlier joint agreements, and closes with ἢ οὔ, which is answered at 87. 3sg ἔφη excludes the narrator and ὦ Κέβης at 80 excludes Cebes from this questioning slot.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0551
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106c
char_span:
  start_char: 116348
  end_char: 116361
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b6bda6df5a73fe53ab6b452dcf75db11209f4c20535070c7d8dfd854d3964430
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: πάνυ μὲν οὖν answers the closing ἢ οὔ of 86. The answering party of this exchange is anchored as Cebes at 67 and addressed by name at 80.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0552
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106c-106d
char_span:
  start_char: 116366
  end_char: 116532
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 3533d5da787f9389973fc9ca8ddc9b86b606bfda053477480feddfafa0deacf9
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: Repeats the speaker's own frame from 86 verbatim in outline (οὐκοῦν καὶ ὧδε ... περὶ τοῦ ἀθανάτου becomes οὐκοῦν καὶ νῦν περὶ τοῦ ἀθανάτου), so it resumes 86 across 87's assent rather than replying to it.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0553
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106d
char_span:
  start_char: 116537
  end_char: 116658
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ad4be839fcd4778840f71fc33a83bb1708f8e121f95412888b129c6408071c1e
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 114936
    end_char: 116821
    text_sha256: 5e7f7c1122db301b1b382c0f8428948f2ab37710810c046cbfd7dbe3bb5e84dd
  rationale: "Answers the closing clause of 88, εἰ δὲ μή, ἄλλου ἂν δέοι λόγου, by lexical echo: ἀλλ’ οὐδὲν δεῖ ... τούτου γε ἕνεκα. 3sg ἔφη excludes the narrator, and the anchor at 90 shows Socrates taking the next unit."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0554
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106d
char_span:
  start_char: 116663
  end_char: 116820
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e897a85b2b113213c7f43b5745b9ad4631838cd5b3d455404ce32e43abd3da2e
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σωκράτης {/pers}
    start_char: 116683
    end_char: 116712
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0555
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106d
char_span:
  start_char: 116825
  end_char: 116925
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 08561e7315330565b4d9bd9df70a9b1d5bd719920799eb328ba7b400ecd0e97b
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: παρὰ πάντων μέντοι ... ἔφη caps the παρὰ πάντων ἂν ὁμολογηθείη of the anchored 90 and sets its own ὡς ἐγᾦμαι against that unit's οἶμαι, so the speaker is not the anchored Socrates and 3sg ἔφη excludes the narrator. The other party in this exchange is addressed ὦ Κέβης at 96 and speaks at 97.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0556
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106e
char_span:
  start_char: 116937
  end_char: 117044
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b55f703e4b4d1d2d86540f4af92740905fbe96ca7b1f72e6f1e4da99cf347260
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: A question built on the ἀθάνατον/ἀνώλεθρον pairing that the anchored Socrates asserts at 90, answered at 93. The same questioning voice addresses ὦ Κέβης at 96, which excludes Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0557
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106e
char_span:
  start_char: 117049
  end_char: 117062
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 783bd7d812678b53bcf692d0f6956a363b5d761c2347612bc9e757bd8c796c33
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: πολλὴ ἀνάγκη answers the ἄλλο τι ... ἂν εἴη question of 92. The answering party is the one addressed ὦ Κέβης at 96 and replying ὦ Σώκρατες at 97.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0558
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106e
char_span:
  start_char: 117067
  end_char: 117220
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e4639a17b763de909831a57cf0b1ee676b4773e7d0d8a369cc7d34afd108b758
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: Draws the ἄρα-consequence of 92-93 in that questioner's own terms (ἀδιάφθορον, ἀνώλεθρον), and the closing member of the same ἄρα-chain at 96 is addressed ὦ Κέβης, excluding Cebes.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0559
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106e
char_span:
  start_char: 117225
  end_char: 117234
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: df8928497e3f37b86196c0ef76fe1d2d4c3cb5c551dace1a5e075a89cbfaaa01
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: φαίνεται assents to the assertion of 94. The assenting party is the one addressed ὦ Κέβης at 96 and answering ὦ Σώκρατες at 97.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0560
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 106e-107a
char_span:
  start_char: 117239
  end_char: 117383
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 76146243679e386b18c2ee6da903752b8ed57d7c34012cdf15f210f88d3888d3
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: The vocative ὦ Κέβης excludes Cebes and 3sg ἔφη excludes the narrator; the anchor at 90 fixes the other party of this exchange as Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0561
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 107a
char_span:
  start_char: 117388
  end_char: 117707
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e6cdadb4a70b7f64780919c2d79fd9f777a2289d62df350d65bba5041b2bf7e6
voice_chain:
  - ΦΑΙΔ.
  - ΚΕΒ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
    - ΣΙΜ.
  context_span:
    start_char: 116659
    end_char: 117708
    text_sha256: e68b2d64d795a90ea0b4b8629f6f6c8dbe5d8a8c5deda5afd78796181d68b8e8
  rationale: ὦ Σώκρατες excludes Socrates, Σιμμίας ὅδε in the third person excludes Simmias, and 3sg ἔφη excludes the narrator. The unit answers 96, which addresses ὦ Κέβης.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0562
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 107a-107b
char_span:
  start_char: 117712
  end_char: 117964
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: d5bdf48a7bf96d42f6e7f9e7d05bea6814172b631e5ee3f3b10f5633034cc306
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἦ δ’ ὃς ὁ {pers} Σιμμίας {/pers}
    start_char: 117722
    end_char: 117754
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0563
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 107b
char_span:
  start_char: 117969
  end_char: 118320
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5485bc50f083843a17c65f03c7ffd0dc09c72de2a5e101896472bc4879ac1651
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ {pers} Σιμμία {/pers} , ὁ {pers} Σωκράτης {/pers}
    start_char: 117982
    end_char: 118038
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0564
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 107b
char_span:
  start_char: 118325
  end_char: 118344
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cb3334a5fb7db84bd7fe46e5eeffeb62f0350edd054818bd5efe6cd086fc0a3c
voice_chain:
  - ΦΑΙΔ.
depth: 2
resolution: unresolved
candidate_owners:
  - ΣΙΜ.
  - ΚΕΒ.
unresolved_reason: A bare assent; the 3rd-singular ἔφη excludes the narrator. The anchored question one unit earlier addresses ὦ Σιμμία in the singular, which favours Simmias, but its verbs then turn 2nd plural — ὑμῖν, διέλητε, ἀκολουθήσετε — so Cebes, who spoke two units before, is addressed by the same sentence. An assent to a question put to two men does not say which of them gave it.
limits: This record establishes that the span is one {p} discourse unit of the reported conversation and that its owner is one of the listed candidates. It selects none of them.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0565
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 107c-108c
char_span:
  start_char: 118356
  end_char: 120914
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 49dfaecb03f911a3c9e1edc9472f6cf8ed2f547aa3cbb2a25265b37f909c7e09
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 118321
    end_char: 121106
    text_sha256: 87d34f74386232b4d6e18677a9e04d1f350613239f2d886a289b5c45cd9324ac
  rationale: ὦ ἄνδρες addresses the company rather than one interlocutor, and the anchored Simmias at 102 answers this very speech with πῶς ταῦτα, ἔφη, λέγεις, ὦ Σώκρατες, which fixes its speaker as Socrates. 3sg ἔφη excludes the narrator.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0566
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 108d
char_span:
  start_char: 120957
  end_char: 121105
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 806cf9c9dacda377bc20973778031a8f8ace1bdde9e95a2c23387cf28336fc7b
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σιμμίας {/pers} , πῶς ταῦτα, ἔφη
    start_char: 120926
    end_char: 120971
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0567
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 108d-108e
char_span:
  start_char: 121110
  end_char: 121563
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 8f1ee04a2bf075a1f445b62b889b9cf75e29c230a25b13f5415d3738fd080040
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 120922
    end_char: 121622
    text_sha256: b708288f95d264a04e63f25d97e38cffa2535fc57fe6fa98a67fe0b9f2d4c1b0
  rationale: Answers 102, which is anchored to Simmias and addressed ὦ Σώκρατες, and it returns the vocative ὦ Σιμμία twice, so the speaker is Socrates and not Simmias. The anchored Simmias replies to it at 104.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0568
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 108e
char_span:
  start_char: 121568
  end_char: 121621
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 79c36a99bbf95f532b7a199e2e7122b1733d15ae86e6f62d8fcea0add2c11846
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 121574
    end_char: 121602
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0569
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 108e-109a
char_span:
  start_char: 121626
  end_char: 122082
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 48a0f05093bd854812a8f7151e9d8f43edc2b05f3841611246bdb78555de7b83
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 121106
    end_char: 122132
    text_sha256: b4f7a185f0c7817777828ca9f22b2d128b5a129d506334c97500777ed0db2f9a
  rationale: ἦ δ’ ὅς is 3sg, excluding the narrator, and the unit resumes the speaker's own πέπεισμαι from the close of 103 (τὴν ἰδέαν τῆς γῆς οἵαν πέπεισμαι εἶναι ... οὐδέν με κωλύει λέγειν) after Simmias' go-ahead at 104. It is bracketed by the Simmias anchors at 104 and 106, and 103's speaker is Socrates.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0570
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 109a
char_span:
  start_char: 122087
  end_char: 122131
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 2b91c5054a9fa846734692948537cb66c7cbb2925d7a9813c57ac578f91cef98
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 122101
    end_char: 122129
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0571
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 109a-110b
char_span:
  start_char: 122136
  end_char: 124508
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: a820feeb438b83518b0cbbbb3f207dbc3f0019a1b98627a4db7ef2cc3a7050ba
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΕΒ.
  context_span:
    start_char: 121622
    end_char: 124629
    text_sha256: 4c9e90655a6779cdda93c1969c7d45a83801e92a9766fb980817599ee64dc5f0
  rationale: ἔτι τοίνυν, ἔφη continues the speaker's own enumeration from 105 (πρῶτον μὲν τοίνυν ... τοῦτο πέπεισμαι) across Simmias' assent at 106, with 3sg ἔφη excluding the narrator. It closes with the vocative ὦ Σιμμία, and the anchored Simmias answers it with ὦ Σώκρατες at 108.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0572
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 110b
char_span:
  start_char: 124513
  end_char: 124628
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: f64ab9b3279d41c9c731d12647f0d59bf19772973ad7176b185978ddc5daf1c5
voice_chain:
  - ΦΑΙΔ.
  - ΣΙΜ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη ὁ {pers} Σιμμίας {/pers}
    start_char: 124523
    end_char: 124551
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0573
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 110b-111c
char_span:
  start_char: 124633
  end_char: 127209
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ce2fde96010ca11c05d79e109e57d7f6fb472566a6a2e020eef0ee35c4c44d35
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 124509
    end_char: 127210
    text_sha256: 0d2c48cd0a92a71f270e0848955fc5cb6ec193630a1ec63caa8eef92a7b82d90
  rationale: The anchored unit 108 is Simmias speaking with the vocative ὦ Σώκρατες, so the request is directed at Socrates and unit 109 answers it (ἡδέως ἂν ἀκούσαιμεν answered by λέγεται τοίνυν); the 3sg ἔφη excludes the narrator, and the addressee vocative ὦ ἑταῖρε keeps the reply pointed back at the questioner rather than at a third party.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0574
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 111c-112e
char_span:
  start_char: 127214
  end_char: 130276
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: cade05f7ae49a9cdbbc2db689b25e8dfbd1f457041d63b43d0333da6b6876d4f
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 124509
    end_char: 130277
    text_sha256: 9d8878341a4ece385d878328346987870b123148c2f05ab775bdbb91305ecab1
  rationale: No reporting verb, vocative, or address intervenes between 109 and 110, and 110 opens by continuing the same accusative-and-infinitive report (πεφυκέναι) that 109 was built in, resuming its own subject τὴν γῆν with καὶ ὅλην μὲν δή; the speaker fixed at 109 by the anchor at 108 therefore carries through.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0575
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 112e-113c
char_span:
  start_char: 130281
  end_char: 132120
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 369780ca3116ec00d95fe1d2a0d40f9bfbeb81537fd7331f9b3612bc9dc6bc36
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 124509
    end_char: 132128
    text_sha256: 1f47846e8ba66a15214a6b135fb0f5863cedd15d911623d47a6073cfb90231ad
  rationale: Unit 111 picks up the τόποι and ῥεύματα introduced at the end of 110 with τὰ μὲν οὖν δὴ ἄλλα, with no reporting verb, vocative, or answering formula marking a handoff anywhere between 109 and 111; the ownership fixed at 109 by the anchored request of 108 is unbroken.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0576
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 113d-114c
char_span:
  start_char: 132132
  end_char: 134519
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ed05f4a788265fc8b173d7f7fc76c51c304fbe2b9b3f6b34be107236da45cead
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
  context_span:
    start_char: 124509
    end_char: 134527
    text_sha256: abe589c8200f55c6ad7e0e6773ab9a74c5397894a2e18986069ee2d6193f1679
  rationale: The unit continues the uninterrupted stretch begun at 109 (τούτων δὲ οὕτως πεφυκότων resumes its own πεφυκέναι of 110) and closes with the vocative ὦ Σιμμία, which positively excludes Simmias as speaker and matches the addressee established by the anchored exchange at 108.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0577
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 114d-115a
char_span:
  start_char: 134531
  end_char: 135756
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 462959f409c1c26c727668c2ae3d15f7e1bcca146b6040694285e03d9393ec00
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΣΙΜ.
    - ΚΕΒ.
  context_span:
    start_char: 132128
    end_char: 135981
    text_sha256: 72cd5be77b846c8bf0b36dca00cdbc489d9a5d5ab4ba89e6d610b6a825a753fb
  rationale: The 3sg ἔφη excludes the narrator, and the vocatives ὦ Σιμμία τε καὶ Κέβης καὶ οἱ ἄλλοι exclude Simmias and Cebes as speaker; the first person ἐγὼ διελήλυθα and πάλαι μηκύνω τὸν μῦθον coreferentially claim the myth of 109-112 as the speaker's own, and the anchored unit 114 has Crito respond to this very utterance (ταῦτα δὴ εἰπόντος αὐτοῦ) with ὦ Σώκρατες.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0578
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 115b
char_span:
  start_char: 135818
  end_char: 135980
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: b4e94bc4c2dac90ebf8a08f0c7bf8103d80144e33a6051ef8a9f77f9701cd8cf
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὁ {pers} Κρίτων {/pers} , εἶεν, ἔφη
    start_char: 135792
    end_char: 135827
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0579
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 115b-115c
char_span:
  start_char: 135985
  end_char: 136396
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: c7d6e7a116f814c8ab2bd563d5396c59068c4cc10ae192103bac240eabda3387
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΡ.
  context_span:
    start_char: 135764
    end_char: 136397
    text_sha256: e099715b0fb326b2157f54b5c04bed71ce88d062a14d9a73b1645daed92fe5d5
  rationale: This answers the question put in the anchored unit 114 by Crito, who addressed ὦ Σώκρατες; the 3sg ἔφη excludes the narrator and the vocative ὦ Κρίτων excludes Crito, while ἐμοὶ καὶ τοῖς ἐμοῖς set against ὑμεῖς reverses the ἐμοὶ / ἡμεῖς of the question.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0580
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 115c
char_span:
  start_char: 136401
  end_char: 136478
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 5eaf549553507d161687fc1e46c035ff0d83e08836c2d37f2092a330deeaa5ce
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΡ.
  context_span:
    start_char: 135764
    end_char: 137786
    text_sha256: 26c36b9bb37589b1412129f724e058a665ab10e653ada584ac4842e6f6f00203
  rationale: "The 1pl προθυμησόμεθα takes up the ὑμεῖς that 115 addressed to Crito, and the reply at 117 names the asker outright: οὐ πείθω ... Κρίτωνα ... καὶ ἐρωτᾷ δὴ πῶς με θάπτῃ, echoing this unit's θάπτωμεν δέ σε τίνα τρόπον; the 3sg ἔφη excludes the narrator."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0581
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 115c-116a
char_span:
  start_char: 136483
  end_char: 137785
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6ccd17a89a30a83c2fa08759fb37a3b76eaf803aeb29969750113bb3a45ab6d0
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΡ.
  context_span:
    start_char: 136397
    end_char: 137786
    text_sha256: cafa3657f753d813c0ada79f28dd933b5987e51b9daa5f6e1834b0eba7febbc5
  rationale: "The quoted speech identifies its own speaker: ἐγώ εἰμι οὗτος Σωκράτης, ὁ νυνὶ διαλεγόμενος, and it speaks of Crito in the third person (οὐ πείθω ... Κρίτωνα, ἐγγυήσασθε οὖν με πρὸς Κρίτωνα) before turning to him in the vocative ὦ ἄριστε Κρίτων; it also answers the question of 116 with a lexical echo (θάπτωμεν / θάπτειν)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0582
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 116c-116d
char_span:
  start_char: 138642
  end_char: 139179
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 424da58ffedadfa09494fc3edbe549101cb6e3e475d1178dee6ea2b83b8df601
voice_chain:
  - ΦΑΙΔ.
  - ΥΠΗΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: ὁ τῶν ἕνδεκα ὑπηρέτης καὶ στὰς {116c} παρ’ αὐτόν, ὦ {pers} Σώκρατες {/pers} , ἔφη
    start_char: 138592
    end_char: 138673
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0583
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 116d
char_span:
  start_char: 139236
  end_char: 139575
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: ec268059b0eed8fd66e56fb365e693698eacad589e0cdecf0cba81690b3ca247
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} ἀναβλέψας πρὸς αὐτόν, καὶ σύ, ἔφη
    start_char: 139184
    end_char: 139247
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0584
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 116e
char_span:
  start_char: 139617
  end_char: 139924
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: e77fc1ef30e94658225a97e65978d750fc172a020348dec79cca79301a400d26
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Κρίτων {/pers} , ἀλλ᾽ οἶμαι, ἔφη
    start_char: 139587
    end_char: 139632
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0585
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 116e-117a
char_span:
  start_char: 139961
  end_char: 140312
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 0fa7586d4304bab9c8804de8cb6d3e0c02d9fbaf8fc5477f99394059abf8a2b8
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ ὁ {pers} Σωκράτης {/pers} , εἰκότως γε, ἔφη
    start_char: 139929
    end_char: 139976
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0586
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117a
char_span:
  start_char: 140554
  end_char: 140616
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 6b15cc1ae5bc1d805532fe457ea3cf536bacfbcd088b62fbfea4996288f9f092
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἰδὼν δὲ ὁ {pers} Σωκράτης {/pers} τὸν ἄνθρωπον, εἶεν, ἔφη
    start_char: 140506
    end_char: 140563
limits: The complete naming construction begins in Phaedo's narration and its parenthetical reporting verb closes after the speech starts. The narration before this span stays with the printed turn speaker.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0587
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117a-117b
char_span:
  start_char: 140621
  end_char: 140804
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 88e049133a7967c16362532f15fd2250490e6c5bf028b01a5ac4cf75e5f94671
voice_chain:
  - ΦΑΙΔ.
  - ΥΠΗΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΥΠΗΡ.
    - ΚΡ.
  context_span:
    start_char: 137786
    end_char: 140805
    text_sha256: f614fc89908d42377f8115782dcf428c3052669afa2af7fb96f718c467405059
  rationale: The unit answers the question the ΣΩ.-anchored unit 122 puts to the man just led in (ὦ βέλτιστε, σὺ γὰρ τούτων ἐπιστήμων), and its own closing clause has the speaker hold out the cup τῷ Σωκράτει, so the speaker is neither Socrates nor the narrator (3sg ἔφη). That man is picked out by the definite anaphoric chain ὁ ἄνθρωπος at 119 (τριψάτω ὁ ἄνθρωπος), τὸν ἄνθρωπον at 122 and οὗτος ὁ δοὺς τὸ φάρμακον at 128, running back to the ΥΠΗΡ. anchor of 118, and ΥΠΗΡ. is the only registered id for the role-described man.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0588
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117b
char_span:
  start_char: 140809
  end_char: 141066
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 53bc598a4be6cb386ae55b9e47198d70257b54253819ac1c9b118bc6d1507f79
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΥΠΗΡ.
  context_span:
    start_char: 140313
    end_char: 141164
    text_sha256: 414c597ed905d79fcfc14bfdf315392203f298dd91104f3a7e13aebc224d9af6
  rationale: καὶ ὃς λαβών resumes the person to whom the cup was just handed at 123, τῷ Σωκράτει, and the quoted question is directed πρὸς τὸν ἄνθρωπον, so the speaker is not the cup-bearer; the reporting ἔφη is 3sg, so it is not the narrator, whose own voice here is only the frame address ὦ Ἐχέκρατες. The next unit answers with the vocative ὦ Σώκρατες, confirming the questioner.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0589
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117b
char_span:
  start_char: 141071
  end_char: 141156
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 55ed08998cc5a685db96e4070ec984a3645ba4ca32521e8735dfcafe44e975a0
voice_chain:
  - ΦΑΙΔ.
  - ΥΠΗΡ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΥΠΗΡ.
    - ΚΡ.
  context_span:
    start_char: 137786
    end_char: 141164
    text_sha256: 5ee604da87d9d2b00ba5571b8ed34cf8bde72f296044f17c724b4b5cc44e2de3
  rationale: The vocative ὦ Σώκρατες excludes Socrates and the 3sg ἔφη excludes the narrator, and the reply answers the question that 124 puts πρὸς τὸν ἄνθρωπον. The 1pl τρίβομεν places the speaker among those who grind the drug, i.e. the man of 122-123 held together by the ὁ ἄνθρωπος chain back to the ΥΠΗΡ. anchor at 118.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0590
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117c-117d
char_span:
  start_char: 141168
  end_char: 142014
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 69020daa464ab1c1eae86e0595a2edfa9703c995d5c7d12de13b07147809944b
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΥΠΗΡ.
  context_span:
    start_char: 140617
    end_char: 142015
    text_sha256: 63efad4a8e19fbf45d6fecdb14ee7e396889ea9975ea2c971534fca896c497ef
  rationale: ἦ δ' ὅς resumes the same subject as ὃς λαβών at 124, the man handed the cup at 123 (τῷ Σωκράτει), and the following narration has that speaker drink it off while the narrator weeps in the first person, so speaker and narrator are distinct. It replies directly to the drug-bearer's answer at 125, which excludes him.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0591
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 117d-117e
char_span:
  start_char: 142019
  end_char: 142237
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: abb014abe837e9f5ed365eee2895e63f19e98c1b3c208113c7408e6c276e2a55
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΚΡ.
  context_span:
    start_char: 141164
    end_char: 142769
    text_sha256: 1f537b634b0d71205dfdeaa0b15083eb098ff79d56a07263302b37d14fd3df41
  rationale: ἐκεῖνος δέ picks out the one person 126 excepts from the general collapse, πλήν γε αὐτοῦ Σωκράτους, against Crito and Apollodorus who are named there as breaking down, and the 2pl ποιεῖτε with ὦ θαυμάσιοι addresses the weepers, so the speaker is not among them. Inside the speech ἐγὼ τὰς γυναῖκας ἀπέπεμψα claims the act narrated of Socrates at 118, and 128 opens καὶ ἡμεῖς ἀκούσαντες, marking the narrator as addressee not speaker.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0592
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 118a
char_span:
  start_char: 142773
  end_char: 143021
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 60c503572004026581fa5488d09895b6a3e8e546ae40da7793c49939c3704aa7
voice_chain:
  - ΦΑΙΔ.
  - ΣΩ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΦΑΙΔ.
  context_span:
    start_char: 142238
    end_char: 143319
    text_sha256: b1199e5d887a67f0667c74d82be51b511fa6aa2c2fe1a6db5fb20dd0db6648b4
  rationale: The quoted words are spoken by the man whose body is cooling and who uncovers himself, the same subject the previous unit lays out and covers, and the 3sg εἶπεν/ἐφθέγξατο excludes the narrator, who covered himself at 126 but speaks in the first person. The vocative ὦ Κρίτων excludes Crito, whose anchored reply follows at 130 and whose further question at 131 gets no answer because the speaker is dying.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_phaedo_0593
source_work: Phaedo
outer_turn_id: turn_phaedo_0035
stephanus_span: 118a
char_span:
  start_char: 143026
  end_char: 143103
source_path: raw/plato/greek/phaedo.txt
source_sha256: b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7
span_sha256: 75da757d9829ce19f9acd61bf7b66bbddb439da29506b9da1ce3536b8291ea06
voice_chain:
  - ΦΑΙΔ.
  - ΚΡ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ἔσται, ὁ {pers} Κρίτων {/pers}
    start_char: 143038
    end_char: 143073
limits: The named reporting formula identifies this utterance's speaker outright. It establishes nothing about what the utterance says, and nothing about the units around it.
review_status: accepted
```
