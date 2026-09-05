# Symposium — Voice Ledger

Reported-speech structure for `turn_symposium_0001` (172a–173d) and
`turn_symposium_0005` (173e–223d), produced by
`scripts/voices-2026-07/build-symposium-voice-ledger.ts` under the reported-speech voice attribution rollout.

All 194 records are `accepted` as one atomic review cohort. The active derived
index and claim-speaker cutover have been regenerated and verified from this
ledger; see `docs/voices-protocol.md`. The generator still emits only
`unreviewed` candidates and refuses to overwrite this accepted live cohort.

Each record says which of two authority shapes it rests on. An explicit
attribution cites byte-verified text-internal evidence in `evidence_refs`:
named and role reporting formulas, person-marked and anaphoric formulas with
their antecedents, closing formulas, and anchored dialogue turns inside
explicitly bounded two-party exchanges. Where the Greek names nobody but still
fixes a speaker through the addressee, grammatical person, or the bounds of a
local exchange, the record carries a `reviewed_attribution` instead: a
structural adjudication over a bounded, hashed context, with the locally
plausible owners named before resolution. Spans that neither shape licenses are
recorded as `resolution: unresolved` with a reason and a candidate set; they
are never filled in from content, doctrine, or style.

## Records

```yaml
voice_id: voice_symposium_0001
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 173e-223d
char_span:
  start_char: 3373
  end_char: 107347
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: be92e17fcc633a2ff7f3b6cb27c642623bc769abb0968dd4a2ceb0c147ad4e89
voice_chain:
  - ΑΠΟΛ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΑΠΟΛ.
    start_char: 3373
    end_char: 3378
limits: Records that the printed siglum opens this turn. It does not establish that Apollodorus is the owner of any statement inside the narration he reports.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0002
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174a-223d
char_span:
  start_char: 3498
  end_char: 107347
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1d2f295d43182cd801c530a709ca17cb9a417bf0f1c56c860ba3c8586f605505
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ὡς ἐκεῖνος διηγεῖτο
    start_char: 3446
    end_char: 3465
    antecedent_text: Ἀριστόδημος ἦν τις
    antecedent_start_char: 1793
    antecedent_end_char: 1811
  - kind: named_reporting_formula
    text: ἔφη ὁ Ἀριστόδημος δεῖν μὲν Ἀριστοφάνη λέγειν
    start_char: 27034
    end_char: 27078
limits: The opening formula's subject is the pronoun ἐκεῖνος; its antecedent is cited at 173b and the report is reconfirmed by the named formula at 185c and again at 198a and 223b. This record does not establish that the report is accurate or complete; the narrator disclaims completeness at 178a.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0003
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174b-174c
char_span:
  start_char: 3989
  end_char: 4478
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1cf4192aa945e2d1dd7b3a089876a399f98241aa5e6615dc8a9d5a2af1f69b65
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΡΙΣΤΟΔ.
    - ΣΩ.
  context_span:
    start_char: 3680
    end_char: 4831
    text_sha256: 8da432829a951f5dbea83e7a3a8ce883695098de98203fb1ee56fda6141a4cf4
  rationale: "A: ἕπου τοίνυν, ἔφη — 2nd sg imperative to the man he invited. The reply [4478,4740) names its addressee (ὦ Σώκρατες at 4556) and is 1st person; exchange closed as two-party by τοιαῦτ’ ἄττα σφᾶς ἔφη διαλεχθέντας ἰέναι at 4848  ||  B: imperative ἕπου τοίνυν answering the previous speaker's οὕτως ὅπως ἂν σὺ κελεύῃς [3965,3983) — 2nd-sg κελεύῃς addressed to the commander, whose command this is; and the reply [4478,4740) carries ὦ Σώκρατες, naming its addressee"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0004
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174d
char_span:
  start_char: 4740
  end_char: 4831
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bc630ec2c75f15dcc2fe422cfebdaf23065c580c5e59a86fca416e1835dbe3df
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΡΙΣΤΟΔ.
    - ΣΩ.
  context_span:
    start_char: 4478
    end_char: 4900
    text_sha256: 86407e0dcc5e9a220ad536b945137a83d24bc8d2f8270d3c0829d80aaadb0a9a
  rationale: "A: 1st plural βουλευσόμεθα ὅτι ἐροῦμεν, answering the span whose addressee is ὦ Σώκρατες (4556) and whose speaker says he came ὑπὸ σοῦ κεκλημένος; same σφᾶς bound at 4848  ||  B: 1st-pl βουλευσόμεθα ὅτι ἐροῦμεν answering the 2nd-sg demand ὅρα οὖν ἄγων με τί ἀπολογήσῃ in [4478,4740), whose vocative ὦ Σώκρατες names its addressee"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0005
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174e
char_span:
  start_char: 5650
  end_char: 5697
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 39a6ab2a655fcac16199e2d73890d879903a885cec58b226fea7998b09aac4bb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΑΡΙΣΤΟΔ.
  context_span:
    start_char: 5298
    end_char: 5890
    text_sha256: d809d7aa45ef7e1ecc0cd448d52b843c05e7434fd586d2bf058479f3134e6917
  rationale: "A: sits between two NAMED Agathon spans that both address Aristodemus vocatively — ὦ, φάναι, Ἀριστόδημε (Ἀριστόδημε at 5308) and φάναι τὸν Ἀγάθωνα at 5793 with Ἀριστόδημε at 5850 — and the two intervening spans are Aristodemus's 1st person. formula_bounded_continuation shape, named on both sides  ||  B: 2nd-sg ποιῶν σύ addressed to the speaker of the 1st-person [5496,5650); the stretch is bounded by two named-Agathon spans 0041/0048, the latter's vocative being Ἀριστόδημε"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0006
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175a
char_span:
  start_char: 5990
  end_char: 6097
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d642f68290b46e61241a85d3b6ee865831ba9e349c858368bda656d8e4c173b2
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΠΑΙΣ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: role_reporting_formula
    text: ἄλλον δέ τινα τῶν παίδων ἥκειν ἀγγέλλοντα ὅτι
    start_char: 5944
    end_char: 5989
limits: The introducing formula identifies this speaker by role, not by name; the source prints no name here. It establishes nothing about what the utterance says, and it licenses no other servant's utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0007
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175a
char_span:
  start_char: 6102
  end_char: 6162
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e3db3ddce30d4a450ae375241ce987656d1785b3dd1e84b477dd2c74583c1a48
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
depth: 3
resolution: unresolved
candidate_owners:
  - ΑΓΑ.
  - ΑΡΙΣΤΟΔ.
unresolved_reason: "The addressee is the servant who reported (2nd-sg λέγεις picks up ἀγγέλλοντα @5975), so the speaker is a diner. Agathon is named directing servants on both sides (@5793, @6379), but the reply [6162,6339) is introduced καὶ ὃς ἔφη εἰπεῖν — a third-person anaphor naming nobody and not the narrator — so a second unnamed party is in it. What would settle it: a naming formula for the ὅς at 6162."
limits: No text-internal evidence licenses a terminal owner for this span. The record establishes only that the span is a reported utterance at this depth; the candidate set is the locally plausible range, not an attribution.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0008
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176b
char_span:
  start_char: 8784
  end_char: 8820
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b908390a2797bce80135345b3df9ea70cb593a112a6b6d1b3914655046d16994
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΑΡΙΣΤΟΦ.
    - ΕΡΥ.
    - ΠΑΥ.
  context_span:
    start_char: 8623
    end_char: 8900
    text_sha256: c36931bc2bcdc1c3c15422ac22ee2e353a14d1b064ebe7849472b0fa88897a26
  rationale: "A: 1st person answer to a question that singles its addressee out by name: … πῶς ἔχει πρὸς τὸ ἐρρῶσθαι πίνειν, Ἀγάθων (Ἀγάθων at 8767), spoken by the named ἔφη Ἐρυξίμαχον τὸν Ἀκουμενοῦ at 8647  ||  B: answers a question that names its addressee: … πρὸς τὸ ἐρρῶσθαι πίνειν, Ἀγάθων [8750,8779) in 0049 (named ΕΡΥ.); the reply echoes that question's verb in the 1st person, οὐδ’ αὐτὸς ἔρρωμαι"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0009
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176c-176d
char_span:
  start_char: 8831
  end_char: 9482
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 348242442f61c171aa0edff7262daf9d030e6012750b696a78740e6cf1a7b673
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΑΡΙΣΤΟΦ.
    - ΕΡΥ.
    - ΠΑΥ.
    - ΦΑΙ.
  context_span:
    start_char: 8600
    end_char: 9653
    text_sha256: 5e078814221a9990a57143c9a43a6e3df40418268759a4696cf16bbd607c88da
  rationale: "Flanked by two NAMED Eryximachus spans (8647, 9786ff); the intervening reply is named too and answers this speaker in the second person on this subject (Φαῖδρον τὸν Μυρρινούσιον 9506, ἅττ’ ἂν περὶ ἰατρικῆς λέγῃς), coreferent with this span's ἐκ τῆς ἰατρικῆς. The speaker lists his companions as third parties: ἐμοί τε καὶ Ἀριστοδήμῳ καὶ Φαίδρῳ καὶ τοῖσδε [8872,8905) excludes ΑΡΙΣΤΟΔ. and ΦΑΙ.; Σωκράτη δ’ ἐξαιρῶ λόγου excludes ΣΩ.; ὑμεῖς οἱ δυνατώτατοι πίνειν νῦν ἀπειρήκατε addresses the three who just confessed. Of the registered sigla only ΕΡΥ. survives, named immediately before at [8651,8675)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0010
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 189b-189c
char_span:
  start_char: 34793
  end_char: 34939
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 69e99d6038689c7138cf139b00b415cbc755c9edfd04b4197a16424aa4c734f1
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΡΙΣΤΟΦ.
    - ΕΡΥ.
  context_span:
    start_char: 34557
    end_char: 34990
    text_sha256: cb44bb7fca3fec6118b029b78cb7ffbf8eadfffb852496455f89d13f9e11e582
  rationale: "A: vocative ὦ Ἀριστόφανες at 34810 names the addressee ⇒ speaker ≠ Aristophanes; the flanking spans are Aristophanes's, one named (εἰπεῖν τὸν Ἀριστοφάνη 34970), and both address ὦ Ἐρυξίμαχε (34568, 34957). Reciprocal vocatives fix a two-party exchange  ||  B: vocative ὦ Ἀριστόφανες [34810,34823) names Aristophanes as addressee ⇒ not him; the reply 0064 opens καὶ μήν, ὦ Ἐρυξίμαχε, εἰπεῖν τὸν Ἀριστοφάνη [34957,34990) — named speaker AND a vocative naming this speaker as its addressee"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0011
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194c
char_span:
  start_char: 45953
  end_char: 45974
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1b7d94178e356272bb2c2d12e9268738362c3daf3045d7c05039361cf7e8ba2a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 45589
    end_char: 46200
    text_sha256: 61c30a444d4a85101cca07e992df46793c2b533aa169a6fb66a9893fc134af95
  rationale: "A: 2nd sg reply to 0076, which is named φάναι + vocative ὦ Ἀγάθων at 45621 and ends ἢ πῶς λέγεις;  ||  B: ἀληθῆ λέγεις — 2nd-sg to the speaker of 0070 (named ΣΩ.), which ends ἢ πῶς λέγεις;"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0012
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194c
char_span:
  start_char: 45978
  end_char: 46038
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: ad3bbfcb84e36c2e23d9ae2746de39b01633dc42bfdf13f59f246bf4d425ce27
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 45589
    end_char: 46200
    text_sha256: 61c30a444d4a85101cca07e992df46793c2b533aa169a6fb66a9893fc134af95
  rationale: "A: 2nd sg optatives repeating 0070's own construction to the same ὦ Ἀγάθων; and the interruption that stops the questioning names the questioner: ὦ φίλε Ἀγάθων, ἐὰν ἀποκρίνῃ Σωκράτει (46088/46107)  ||  B: repeats 0070's own 2nd-sg optatives with τοὺς πολλούς substituted — the same questioner continuing his own question; and the interruption 0071 (named ΦΑΙ.) names both roles outright: ὦ φίλε Ἀγάθων, ἐὰν ἀποκρίνῃ Σωκράτει [46088,46124)"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0013
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199b
char_span:
  start_char: 55754
  end_char: 55870
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9c96f0f772f8128ea1c78fd5063e22c5acd70526ffe6e9546a07e2470072deec
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΕΡΥ.
    - ΣΩ.
    - ΦΑΙ.
  context_span:
    start_char: 55380
    end_char: 56050
    text_sha256: f3bc846f35911334e66cd517a08ea2e8c7067ed3b037f2e32393c3dad7168f41
  rationale: "A: vocative ὦ Φαῖδρε at 55773 ⇒ speaker ≠ Phaedrus; preceded by the named-Socrates 0075 addressing the same ὦ Φαῖδρε with the same request, and closed 70 chars later by μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι at 55940 (a naming formula within the 200-char closing bound)  ||  B: vocative ὦ Φαῖδρε ⇒ not ΦΑΙ.; 1st-sg πάρες μοι … ἐρέσθαι … οὕτως ἤδη λέγω; leave granted by 0076 (named ΦΑΙ.) with ἀλλ’ ἐρώτα [55914,55924); and the named handoff μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)"
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0014
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199d
char_span:
  start_char: 56671
  end_char: 56703
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 4444d32868b1728b110e478aa8055a49c0d40cfa51285931e20cd15b01157614
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: interrogative continuing 0077's ἢ οὔ; series; role fixed by 56761 εἰπεῖν τὸν Σωκράτη 58 chars later carrying the same imperative shape. B: οὐκοῦν-question; follows the named reply φάναι τὸν Ἀγάθωνα @56652."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0015
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199e
char_span:
  start_char: 56928
  end_char: 56958
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 713b1034ba5b5c3149a44120fbcc0e24cba5e09865c26cef18704a4b3a4e079a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: same οὐκοῦν-question shape; sits inside the ἀπόκριναι (56770) sequence Socrates is named as opening. B: οὐκοῦν-question continuing 0079 (named ΣΩ., εἰπεῖν τὸν Σωκράτη @56750)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0016
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199e
char_span:
  start_char: 56969
  end_char: 57047
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d72cac3e915c00b00b39929a15d5f3a993a282b79d0c148ee8cb6291a4b1afb6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: 2nd sg imperative πειρῶ demanding an answer — the named questioner's role (cf. ἀπόκριναι 56770, φύλαξον 57120, both under εἰπεῖν τὸν Σωκράτη). B: 2nd-sg imperative πειρῶ commanding the answerer to answer + interrogative; φάναι @56979."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0017
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199e-200a
char_span:
  start_char: 57047
  end_char: 57078
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7b36d40ba4b3a73dab51fe7bdaa9d798d058796351a9fb1b71a6c999ad152be6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent answering 0016's imperative; identical shape to the named πάνυ γε, φάναι τὸν Ἀγάθωνα 56639–56671. B: echoes 0016's own verb ἐστίν as the selected disjunct."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0018
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200a
char_span:
  start_char: 57232
  end_char: 57252
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0b3ad2edc7d89487b6e448862780f10c45ef157286116d2c9885acae25b9fe6b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: same words as the named 56639–56671, minus the name. B: reply to 0087, named ΣΩ. (εἰπεῖν τὸν Σωκράτη @57100), which ends … ἢ οὔ;."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0019
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200a
char_span:
  start_char: 57252
  end_char: 57336
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9e5d78bf1418b8fbc90126e211880abb109bf4c6771c9d4c12160064f7ac5ea7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: πότερον … ἢ question, continuing 0080's πότερον … ἢ οὔ;. B: πότερον … ἢ question; 0081 (named ΣΩ.) then contrasts the other party's word."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0020
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200a
char_span:
  start_char: 57336
  end_char: 57373
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 6605dd16c76c355164c421b1f810913ca0913745038e9a1c855a88fa628b41aa
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (τὸν Σωκράτη ἔφη … ἄρξασθαι [55926,55978)); exactly two parties are marked in [55986,60542). This span answers 0019's ἢ οὐκ ἔχων; by selecting its disjunct verbatim, and the named-ΣΩ. 0081 (εἰπεῖν τὸν Σωκράτη 57399) quotes it back with the articular back-reference ἀντὶ τοῦ εἰκότος [57408,57424), marking ὡς τὸ εἰκός as the OTHER speaker's word."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0021
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b
char_span:
  start_char: 57591
  end_char: 57616
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5dc50c023a4f26109bd5bdd63ac2ae093781ea6017330210e25793dac938c6e3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (τὸν Σωκράτη ἔφη … ἄρξασθαι [55926,55978)); exactly two parties are marked in [55986,60542). Its first-singular dative κἀμοί … δοκεῖ answers ἐμοὶ μὲν γὰρ θαυμαστῶς δοκεῖ … σοὶ δὲ πῶς; [57522,57591), specifically σοὶ δὲ πῶς; [57579,57589), in a span carrying the vocative ὦ Ἀγάθων at 57554 — pronoun coreference with a citable named antecedent."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0022
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b
char_span:
  start_char: 57616
  end_char: 57702
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 61aac66dd0b7c24f7241e4f17b1033724ba70fde8117f42436f003b59a05242c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: 2nd sg λέγεις praising the immediately preceding speaker ⇒ speaker ≠ that speaker; that speaker is 0026, fixed independently by κἀμοί↔σοί. B: 2nd-sg λέγεις addressed to 0021's speaker (⇒ ≠ that speaker) + new interrogative."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0023
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b
char_span:
  start_char: 57702
  end_char: 57736
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bab9abf8712644339e7c334fb9839e638bf01f638cc15069e90f63ee552e46ff
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: answer to 0027, whose καλῶς λέγεις addresses 0021's speaker. B: reply to 0022's question."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0024
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b
char_span:
  start_char: 57736
  end_char: 57781
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 17bc200945b71caedd062166bc1d6499ec8c641b1b325c4fe2deeee87a0bae4b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: questioner's gloss; the reply 0025 is ἀληθῆ λέγεις (2nd sg) ⇒ its speaker ≠ this one. B: γάρ που supplying the ground for the questioner's own point; 0082 (named ΣΩ.) resumes the same γάρ-argument. WEAKEST LINK, graded med."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0025
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b
char_span:
  start_char: 57781
  end_char: 57799
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c5f586f28d1730d39a7ceb32900430c7f88f4beb64fbe5eca99a72d91ed7c07f
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: 2nd sg λέγεις ⇒ speaker ≠ speaker of 0024. B: 2nd-sg λέγεις endorsing 0024's speaker (⇒ ≠ that speaker)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0026
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200e
char_span:
  start_char: 58926
  end_char: 58946
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0b3ad2edc7d89487b6e448862780f10c45ef157286116d2c9885acae25b9fe6b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent to 0083 (εἰπεῖν δὴ τὸν Σωκράτη 58773). B: reply to 0093, named ΣΩ. (εἰπεῖν δὴ τὸν Σωκράτη), which ends … καὶ παρόντα;."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0027
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200e
char_span:
  start_char: 58946
  end_char: 59143
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: dd6b4cbc47a4d356bddf09e92aeab703c6425b66b855776960e8b5e741329d71
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (τὸν Σωκράτη ἔφη … ἄρξασθαι [55926,55978)); exactly two parties are marked in [55986,60542). The ἄρα-inference stands between two named-Socrates spans, 58773 εἰπεῖν δὴ τὸν Σωκράτη and 59186 φάναι τὸν Σωκράτη — a formula_bounded_continuation shape across the assent 0026 — with named-ΣΩ. 0083 and 0084 continuing one first-plural thread (ἀνομολογησώμεθα τὰ εἰρημένα)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0028
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200e
char_span:
  start_char: 59143
  end_char: 59164
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 82437e035a3e6565a8b099cc307796ea31e48c48242eff0cce19fe759a342a89
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent to 0032, flanked by named-Socrates 58773/59186. B: reply to 0027."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0029
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201a
char_span:
  start_char: 59308
  end_char: 59324
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d3f7cb7b51ddaec626def5927c6cfb83fa0ca2bee0857e065c5ae36b2819eed9
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent to 0084 (φάναι τὸν Σωκράτη 59186). B: reply to 0094, named ΣΩ. (φάναι τὸν Σωκράτη), which ends … αὐτῷ;."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0030
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201a
char_span:
  start_char: 59324
  end_char: 59565
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e58712db1603d76cc7cee010a2ea319d719e3c9256378d7eb52df3eab8ee71bc
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (τὸν Σωκράτη ἔφη … ἄρξασθαι [55926,55978)); exactly two parties are marked in [55986,60542). Person marking: first-person ἐγώ σε ἀναμνήσω, οἶμαι against second-person ἀναμνήσθητι, ἔφησθα [59362,59369), ἔλεγες — a first-person speaker interrogating the party who gave the preceding λόγος, the named-ΑΓΑ. 0072; the answer is named, φάναι τὸν Ἀγάθωνα @59580/59590."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0031
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59749
  end_char: 59813
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: df9ebf0d6244182f177b7deebe8cdd24fc527acd4135043a3485a38d7046247e
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: interrogative; follows 0086 φάναι τὸν Σωκράτη (59647) with the same ἄλλο τι … ; shape. B: οὐκοῦν-question continuing 0086 (named ΣΩ., φάναι τὸν Σωκράτη @59610)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0032
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59813
  end_char: 59830
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1c0ca9756cb7e23591f0d151b45a931f98acc2be855481f9b707ca9fd4989c07
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent to 0031. B: reply to 0031."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0033
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59830
  end_char: 59878
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 772123c95ec5f3900b01bf9f5930b612b31ceaf40a49639f6bfc533c1d0d527c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: inferential ἄρα gloss; answered by the assent ἀνάγκη, φάναι. B: ἄρα-inference drawn from the concession just given."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0034
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59878
  end_char: 59897
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5d66dbc2a2a6c3fd56d73037b0f2cad9b911766f8a0badeb46162e7283457ce6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: assent to 0033. B: reply to 0033."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0035
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59897
  end_char: 59982
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 2a6ae492a89629a82fa00a6fbe495aa3e113c7fee56866f237ce9a16a08955aa
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: explicit λέγεις σύ addressed to the other party. B: emphatic λέγεις σύ — the questioner putting the question to the answerer."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0036
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59982
  end_char: 59995
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 3b00b4262292242b04e7020eeb84b00e75d9ec06423fbce97f0f00af8062cc58
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: answer to 0035's λέγεις σύ ⇒ the σύ replies. B: reply to 0035's ἆρα … ;."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0037
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b
char_span:
  start_char: 59995
  end_char: 60057
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: dcf29a41abae6187d2d68ba32375b362255b2aa63e64a861292da8387eda6cf6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (τὸν Σωκράτη ἔφη … ἄρξασθαι [55926,55978)); exactly two parties are marked in [55986,60542). Its second-singular ὁμολογεῖς is answered by 0097, a named-Agathon reply (καὶ τὸν Ἀγάθωνα εἰπεῖν 60069) whose vocative ὦ Σώκρατες [60095,60120) names its addressee."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0038
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c
char_span:
  start_char: 60247
  end_char: 60259
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7d009b1b1ad71d66e8f92c8e2205a4992c6231d86e6e6cfbf6cb69267a9f5213
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: ἔμοιγε (1st sg dative) answering δοκεῖ σοι εἶναι; in a span carrying ὦ Ἀγάθων at 60180. B: 1st-sg dative answering δοκεῖ σοι εἶναι [60230,60245) in 0098, whose vocative is ὦ Ἀγάθων."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0039
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c
char_span:
  start_char: 60259
  end_char: 60345
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: a50e7a990c6dce2e7e57742d4e4aaddb3f8a705d37c5e0564aac16bcbbedf8cb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 55600
    end_char: 60600
    text_sha256: 0eb7fce4370186304c5eafe1fea55dafece064f46260205751c0f50ad2abb842
  rationale: "Socrates–Agathon elenchus 199c–201c, a NAMED two-party exchange: leave to question Agathon is asked (πάρες μοι Ἀγάθωνα [55783,55800)), granted by the named Phaedrus (ἀλλ’ ἐρώτα [55914,55924)), and the narration names who begins (μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι [55926,55978)). Exactly two parties are grammatically marked in [55986,60542). A: the reply names the addressee: ἐγώ, φάναι, ὦ Σώκρατες, σοὶ οὐκ ἂν δυναίμην ἀντιλέγειν 60345/60361 ⇒ this span's speaker is that ὦ Σώκρατες. B: inference; answered by 0099, named ΑΓΑ., vocative ὦ Σώκρατες naming its addressee."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0040
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174a-174b
char_span:
  start_char: 3680
  end_char: 3934
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 08680417ee30f4ebeee82cec476ed72fb8a0cdc7ca3330237360d9a2a2fa9e52
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: καὶ τὸν εἰπεῖν ὅτι
    start_char: 3661
    end_char: 3679
    antecedent_text: Σωκράτη
    antecedent_start_char: 3518
    antecedent_end_char: 3525
limits: The accusative pronoun in the introducing formula refers to the preceding named Socrates antecedent.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0041
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 174e
char_span:
  start_char: 5298
  end_char: 5496
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 994b7056d777a101be5f69dc106e3a6529cab1c6e5a484ef15bb034165a95705
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ὡς ἰδεῖν τὸν Ἀγάθωνα, ὦ, φάναι
    start_char: 5276
    end_char: 5306
limits: The parenthetical introducing construction names Agathon as its accusative subject and straddles the start of his direct speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0042
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175a
char_span:
  start_char: 5773
  end_char: 5890
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e34e0e931b74830fd3d9fb01176874afc700ff221072a7536a7b64e9423c52c0
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀγάθωνα
    start_char: 5793
    end_char: 5810
limits: The named formula licenses Agathon's order; it does not assign the surrounding servant narration to him.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0043
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175b-175c
char_span:
  start_char: 6339
  end_char: 6655
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bcfd5336706ce2261ed833fde13307b4debb5dadb1eee9b9ad5894bf84e45ef3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη φάναι τὸν Ἀγάθωνα
    start_char: 6375
    end_char: 6396
limits: The named formula licenses Agathon's speech inside Aristodemus's report.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0044
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175c-175d
char_span:
  start_char: 6951
  end_char: 7140
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0bd68b5f045e5609bd0fac48f8a8bd2902ed06816dba7a3f9fd57cf3cfa5057e
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Ἀγάθωνα — τυγχάνειν γὰρ ἔσχατον κατακείμενον μόνον — δεῦρ’, ἔφη φάναι
    start_char: 6890
    end_char: 6967
limits: The parenthetical introducing construction names Agathon as its accusative subject and straddles the start of his direct speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0045
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175d-175e
char_span:
  start_char: 7186
  end_char: 7775
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: eb05fcc5d2fb41eba647953eb72d04375b8323d140f2f005767187d0e6e0fd49
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Σωκράτη καθίζεσθαι καὶ εἰπεῖν ὅτι
    start_char: 7144
    end_char: 7185
limits: The preceding named formula introduces Socrates's speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0046
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 175e
char_span:
  start_char: 7779
  end_char: 7963
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7620eb1f76e87a396508ed9264ffb326a16c8e10008006ef7f318492609a20b6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη, ὦ Σώκρατες, ὁ Ἀγάθων
    start_char: 7792
    end_char: 7817
limits: The in-span formula names Agathon outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0047
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176a-176b
char_span:
  start_char: 8205
  end_char: 8456
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 676d0c9609eefc1c5ce6dfc7091be3960c3d02f57c299d580e5d50fcd77efcd1
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΠΑΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Παυσανίαν ἔφη λόγου τοιούτου τινὸς κατάρχειν
    start_char: 8151
    end_char: 8203
limits: The immediately preceding formula names Pausanias and introduces this span.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0048
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176b
char_span:
  start_char: 8487
  end_char: 8623
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d6c074749c0f28869a868a786d9a31596f5ab404efefba9832bd6d8307a8bfd2
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Ἀριστοφάνη εἰπεῖν
    start_char: 8460
    end_char: 8485
limits: The preceding formula names Aristophanes outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0049
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176b
char_span:
  start_char: 8676
  end_char: 8780
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9605c6ee9341cebe271a9389c8d518616a87c7c1bf52d635a416987b78f6d926
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἀκούσαντα οὖν αὐτῶν ἔφη Ἐρυξίμαχον τὸν Ἀκουμενοῦ
    start_char: 8627
    end_char: 8675
limits: The preceding formula names Eryximachus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0050
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176d
char_span:
  start_char: 9486
  end_char: 9653
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: dfd3abf691a599db6367b6498e598bf0fed4daf39912fdf9cde0220aa93671c1
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΦΑΙ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη φάναι ὑπολαβόντα Φαῖδρον τὸν Μυρρινούσιον
    start_char: 9496
    end_char: 9541
limits: The in-span formula names Phaedrus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0051
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 176e
char_span:
  start_char: 9786
  end_char: 10135
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 779f5b0bbe364cfc5b2dbc66ab3368ec6f97be440f08e113694d51efea019731
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἐρυξίμαχον
    start_char: 9801
    end_char: 9821
limits: The in-span formula names Eryximachus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0052
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 177a-177d
char_span:
  start_char: 10238
  end_char: 11574
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 280b8e582dfad48fc5638c22cbee402ef94cf20b7b2a529f71f3e422a1fbe9b0
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν οὖν τὸν Ἐρυξίμαχον ὅτι
    start_char: 10208
    end_char: 10237
limits: The immediately preceding formula names Eryximachus and introduces this speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0053
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 177d-177e
char_span:
  start_char: 11578
  end_char: 12047
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: f692f3a61ef27c2a20de48a4635049d1dc2780b2f55da8d4cc3c9721b5ded7f3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη
    start_char: 11603
    end_char: 11620
limits: The in-span formula names Socrates outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0054
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 178a-180c
char_span:
  start_char: 12397
  end_char: 16940
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d36282bcbf6eb00a55faf31413c306d1ad3db1abbf6e6e0f15c3af7850260486
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΦΑΙ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη Φαῖδρον ἀρξάμενον ἐνθένδε ποθὲν λέγειν
    start_char: 12353
    end_char: 12395
  - kind: closing_formula
    text: Φαῖδρον μὲν τοιοῦτόν τινα λόγον ἔφη εἰπεῖν
    start_char: 16940
    end_char: 16982
limits: Opened and closed by named reporting formulas. The report is avowedly selective (178a), so this span is what the narrator relates of the speech, not a transcript of it.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0055
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 180c-185c
char_span:
  start_char: 17105
  end_char: 26961
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: ed489726f4c9a8d346dd81aa1753c93c34da3de2a5f9f688d19891bbf69ab9af
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΠΑΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: εἰπεῖν δ’ αὐτὸν ὅτι
    start_char: 17085
    end_char: 17104
    antecedent_text: τὸν Παυσανίου λόγον διηγεῖτο
    antecedent_start_char: 17055
    antecedent_end_char: 17083
  - kind: closing_formula
    text: Παυσανίου δὲ παυσαμένου
    start_char: 26961
    end_char: 26984
limits: The opening formula's accusative subject is the anaphoric αὐτόν, whose antecedent Παυσανίου is cited in the same sentence. The closing genitive absolute names him again.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0056
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 185d
char_span:
  start_char: 27268
  end_char: 27364
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b4fb8baf0ad01db6324286e9915268f95472583cf281ff0b004fa1c39d5d328a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ἀλλ’ εἰπεῖν αὐτόν
    start_char: 27191
    end_char: 27208
    antecedent_text: δεῖν μὲν Ἀριστοφάνη λέγειν
    antecedent_start_char: 27052
    antecedent_end_char: 27078
limits: The formula's accusative subject is the anaphoric αὐτόν; its antecedent is cited in the same sentence. The vocative inside the quote addresses Eryximachus and is not evidence of the speaker.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0057
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 185d-185e
char_span:
  start_char: 27391
  end_char: 27768
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b04ef3b838f22647007d606288fc60980bca788bd04d49fec4ca3ee5c6ec027b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Ἐρυξίμαχον εἰπεῖν
    start_char: 27365
    end_char: 27390
limits: The source's {/q} tag closes before ἀνακογχυλίασον, but the named formula licenses Eryximachus's continuous utterance through the reviewed boundary at 185e.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0058
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 185e
char_span:
  start_char: 27768
  end_char: 27798
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0cc575f598b4234bfc8aca7d1967a72401e99c31e83ea68f8d79d81e91b68dc7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: φάναι τὸν Ἀριστοφάνη
    start_char: 27799
    end_char: 27819
limits: Licensed by the named formula printed immediately after the quotation.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0059
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 185e
char_span:
  start_char: 27821
  end_char: 27850
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c97c47c838ff5f32ee9b5e1e5fbd937ea58d583629f833fb551d8b263696a88a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀριστοφάνη
    start_char: 27799
    end_char: 27819
limits: Licensed by the same named formula, printed immediately before this second quoted clause.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0060
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 185e-189a
char_span:
  start_char: 27886
  end_char: 34022
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 44976ee1f4f3d35754d24ec4b31a4111e971b528a46bf156091912f3a9343dcc
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν δὴ τὸν Ἐρυξίμαχον
    start_char: 27860
    end_char: 27884
  - kind: named_reporting_formula
    role: exchange_close
    text: ἐκδεξάμενον οὖν ἔφη εἰπεῖν τὸν Ἀριστοφάνη
    start_char: 34022
    end_char: 34063
limits: Opened by a named accusative-and-infinitive formula. The closing boundary is the next named speech formula; no separate closing formula marks the end of this speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0061
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 189a
char_span:
  start_char: 34068
  end_char: 34309
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 89c70756298c7cb3a126dd1d4892dde19d72b94e9ce5151a28de7854eddd6392
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἐκδεξάμενον οὖν ἔφη εἰπεῖν τὸν Ἀριστοφάνη ὅτι
    start_char: 34022
    end_char: 34067
limits: The preceding formula names Aristophanes outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0062
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 189a-189b
char_span:
  start_char: 34333
  end_char: 34517
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 40faa9047081bdd7b90329cbe42171e96fcd57c5fa7d8e9abaa89e4aca49d3c4
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Ἐρυξίμαχον, ὠγαθέ, φάναι
    start_char: 34313
    end_char: 34345
limits: The parenthetical introducing construction names Eryximachus as its accusative subject and straddles the start of his direct speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0063
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 189b
char_span:
  start_char: 34557
  end_char: 34789
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1d57e9af9c4e947d77a4b66499c1f1d78fbd788bc1feb43096d3cbd28f10f827
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Ἀριστοφάνη γελάσαντα εἰπεῖν
    start_char: 34521
    end_char: 34556
limits: The preceding formula names Aristophanes outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0064
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 189c-193e
char_span:
  start_char: 34948
  end_char: 44505
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0b284e01303f99451c42f2b3a957d61d318486ce31dea453e311bd8c3b369bf6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀριστοφάνη
    start_char: 34970
    end_char: 34991
  - kind: named_reporting_formula
    role: exchange_close
    text: ἀλλὰ πείσομαί σοι, ἔφη φάναι τὸν Ἐρυξίμαχον
    start_char: 44505
    end_char: 44548
limits: The span includes the speaker's own closing address to Eryximachus at 193d, which carries no separate closing formula; the boundary is the next named speech formula. It encloses the direct speech Aristophanes gives Zeus at 190c and Hephaestus at 192d, recorded as deeper spans; statements inside those deeper spans are not owned by this voice.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0195
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 190c
char_span:
  start_char: 37386
  end_char: 37404
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 762613bc3d514eb7198a00ac85e443f5232f7f05d95abd222c81fa5f3d420828
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
  - ΖΕΥΣ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: μόγις δὴ ὁ Ζεὺς ἐννοήσας λέγει ὅτι
    start_char: 37351
    end_char: 37385
limits: "The span is the first half of a quotation the edition splits around the inquit ἔφη, at 37405-37409, which is narration and stays outside. The formula licenses who speaks, not that the speech was ever uttered: it stands inside Aristophanes' myth."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0196
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 190c
char_span:
  start_char: 37410
  end_char: 37497
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: faec28ffaeaf26a5be7e1996dc98c28d25d978083064bf990cf5dc4d2d38b5d0
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
  - ΖΕΥΣ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: μόγις δὴ ὁ Ζεὺς ἐννοήσας λέγει ὅτι
    start_char: 37351
    end_char: 37385
limits: "The same λέγει ὅτι governs this second half of the split quotation; the intervening ἔφη, at 37405-37409 is narration and stays outside. The span stops at the closing marker: the narration that resumes at 37498 with {190d} γενόμενοι and the νῦν μὲν γὰρ αὐτούς, ἔφη, διατεμῶ that follows carry no {q} and are not covered here."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0197
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 192d
char_span:
  start_char: 41879
  end_char: 41947
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0bd73c429cdbfbb9f95e37376bec7b05e62ee8d812897e921ac4f9283a85b4b5
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
  - ΗΦΑΙ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἐπιστὰς ὁ Ἥφαιστος, ἔχων τὰ ὄργανα, ἔροιτο
    start_char: 41835
    end_char: 41877
limits: "The formula is a counterfactual optative (εἰ … ἔροιτο): the utterance is one Aristophanes hypothesises, not one his myth narrates as said. That bears on what the words evidence, not on who owns them — the nominative ὁ Ἥφαιστος governs the speech verb outright."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0198
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 192d
char_span:
  start_char: 41987
  end_char: 42162
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5e430247039b004a6840b775e5b07d3afcd52c88a1c8a5aaacdf861786ab84a8
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΡΙΣΤΟΦ.
  - ΗΦΑΙ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἐπιστὰς ὁ Ἥφαιστος, ἔχων τὰ ὄργανα, ἔροιτο
    start_char: 41835
    end_char: 41877
limits: The repeated inquit καὶ εἰ ἀποροῦντας αὐτοὺς πάλιν ἔροιτο· at 41948-41986 reopens the same figure's question and stays outside the span; its elided subject is the ὁ Ἥφαιστος the formula at 41835-41877 names. The span stops at the closing marker, so the {192e} συμφυσῆσαι continuation that the edition leaves unmarked is not covered here.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0065
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 193e
char_span:
  start_char: 44505
  end_char: 44748
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: de216da896896063c286a1836786929d35fcdc7410156ea591eceb2338f12a2b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: ἔφη φάναι τὸν Ἐρυξίμαχον
    start_char: 44524
    end_char: 44548
limits: The in-span formula names Eryximachus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0066
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194a
char_span:
  start_char: 44782
  end_char: 44956
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 13c65f4f2512b05592c7619d33edb7ffbbefd84df4f40229c0940b05d1cfcee1
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Σωκράτη εἰπεῖν
    start_char: 44759
    end_char: 44781
limits: The preceding formula names Socrates outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0067
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194a
char_span:
  start_char: 44960
  end_char: 45099
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e7adcc437982b600ed461b1576fa294df59915a9c47741ac09b6b5c64b9a3247
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀγάθωνα
    start_char: 44994
    end_char: 45012
limits: The in-span formula names Agathon outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0068
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194a-194b
char_span:
  start_char: 45103
  end_char: 45423
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 293d2a93039f3e14888323220f60d962fa5f93c6c467cad2243d5187ea5b31be
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Σωκράτη
    start_char: 45136
    end_char: 45154
limits: The in-span formula names Socrates outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0069
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194b
char_span:
  start_char: 45427
  end_char: 45578
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 66e9e39d3fc773700bd5038ce2bf092972f398ea5a13373fa2d226e4f37c91f9
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν Ἀγάθωνα φάναι
    start_char: 45446
    end_char: 45463
limits: The in-span formula names Agathon outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0070
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194c
char_span:
  start_char: 45589
  end_char: 45949
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9482077661b0ec32f55dfc010611de5e274ae7daea535f762d999c44b5e0ba11
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: φάναι, ὦ Ἀγάθων
    start_char: 45614
    end_char: 45629
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν οὖν Σωκράτη εἰπεῖν
    start_char: 44759
    end_char: 44781
  - kind: named_reporting_formula
    role: exchange_close
    text: καὶ τὸν Φαῖδρον ἔφη ὑπολαβόντα εἰπεῖν
    start_char: 46050
    end_char: 46087
limits: The vocative identifies Agathon as addressee inside the bounded Socrates-Agathon exchange, hence Socrates as speaker.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0071
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194d
char_span:
  start_char: 46088
  end_char: 46433
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 548c04c23db88a52fe34456832c5c7b01dedd6f477eaac1fe46e98163fce3387
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΦΑΙ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Φαῖδρον ἔφη ὑπολαβόντα εἰπεῖν
    start_char: 46050
    end_char: 46087
limits: The preceding formula names Phaedrus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0072
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194e-198a
char_span:
  start_char: 46444
  end_char: 52991
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 8892607dafd385c74a6bd3af5544df4e246d3c948e7e9a50e8e9f54d0cb2a583
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀγάθωνα, καὶ οὐδέν με κωλύει λέγειν
    start_char: 46473
    end_char: 46518
  - kind: closing_formula
    text: εἰπόντος δὲ τοῦ Ἀγάθωνος
    start_char: 52991
    end_char: 53015
limits: Opened by a named formula and closed by a named genitive absolute. Continuous first-person discourse throughout; no interlocutor formula occurs inside the span.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0073
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 198a
char_span:
  start_char: 53179
  end_char: 53330
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 3718b251ed774f6ec51c8ef733b49cccda876bb2205ebc8c6ba31c9b00cf6625
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Σωκράτη εἰπεῖν βλέψαντα εἰς τὸν Ἐρυξίμαχον
    start_char: 53127
    end_char: 53177
limits: The preceding formula names Socrates outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0074
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 198a
char_span:
  start_char: 53334
  end_char: 53453
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 8d2862c8314dffbffd6747ef62c600d8e635fdab6afd7c3fc67a38a4b5a66b4a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἐρυξίμαχον
    start_char: 53349
    end_char: 53369
limits: The in-span formula names Eryximachus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0075
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 198b-199b
char_span:
  start_char: 53464
  end_char: 55656
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 354945f17c405506fa9e011e506d169bcf576ad83b73967b40b8dd3823a9b2f3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Σωκράτη
    start_char: 53484
    end_char: 53502
limits: The in-span formula names Socrates outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0076
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199c
char_span:
  start_char: 55881
  end_char: 55926
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 2c28f2ea6098ac2b30b2ab516c2b298461fe14e08068e8a474e19b6812dce132
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΦΑΙ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Φαῖδρον
    start_char: 55895
    end_char: 55912
limits: The in-span formula names Phaedrus outright.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0077
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199c-199d
char_span:
  start_char: 55986
  end_char: 56639
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 555cdc55c6cc1f68bed4b9b0b6a56bd4ee49d26861611d8ee217a946c8ffe9eb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ φίλε Ἀγάθων
    start_char: 55999
    end_char: 56012
  - kind: named_reporting_formula
    role: exchange_open
    text: μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι
    start_char: 55926
    end_char: 55978
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: καὶ ἐγώ, πῶς λέγεις, ἔφην, ὦ Διοτίμα
    start_char: 61373
    end_char: 61409
limits: Anchored dialogue turn inside the Socrates-Agathon elenchus (199c-201c), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0078
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199d
char_span:
  start_char: 56639
  end_char: 56671
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1ca49129993832f32ae92bc0c8b929387235b53a74f3c766263656268a74a2ed
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀγάθωνα
    start_char: 56652
    end_char: 56669
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0079
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 199e
char_span:
  start_char: 56734
  end_char: 56915
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0688be81f32a676ecff4e7c30ce6e0d7dfefd2163801a502e175828056a6dc9c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Σωκράτη
    start_char: 56750
    end_char: 56768
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0080
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200a
char_span:
  start_char: 57078
  end_char: 57232
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 4a226584b48c63f6ca5ce1c65bd641fafa29d0054e20142a169a335773e9a043
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Σωκράτη
    start_char: 57100
    end_char: 57118
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0081
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200a-200b
char_span:
  start_char: 57373
  end_char: 57591
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: fd0ebe75b3778cc1bff3429435c72873f9558b703a7a0af05c59b8851d71deaf
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Σωκράτη
    start_char: 57388
    end_char: 57406
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0082
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200b-200d
char_span:
  start_char: 57799
  end_char: 58729
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: af5b72fcd3ac82f58013dd2c65a443e2fbf65ffa781dbf621cf7cf00e30dec9b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη
    start_char: 57849
    end_char: 57866
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0083
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200d-200e
char_span:
  start_char: 58755
  end_char: 58926
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bebb1b509aaf9ffb8254e0050678af502ef83241626837d6f93e42eb0645d9a7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν δὴ τὸν Σωκράτη
    start_char: 58759
    end_char: 58780
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0084
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 200e-201a
char_span:
  start_char: 59164
  end_char: 59308
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b799a3a1aa5e224c994d947852355d311ee97830d7c7a3976b6a3e4667c03b7e
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη
    start_char: 59176
    end_char: 59193
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0085
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201a
char_span:
  start_char: 59565
  end_char: 59599
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e0d70fe140f833e5f6bce349ea9c5821ac0de16b97c6fda2d1f00a3028275055
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀγάθωνα
    start_char: 59580
    end_char: 59597
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0086
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201a
char_span:
  start_char: 59599
  end_char: 59732
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1ca17be16c7ec61e4de4e754d8f3192c5124c19d2eab8622ac12e313525eddfb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη
    start_char: 59637
    end_char: 59654
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0087
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201b-201c
char_span:
  start_char: 60057
  end_char: 60143
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e488a8513444959ec632a0618e4aa0f3c582bd719925b10edf22dcb12351bcdf
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν Ἀγάθωνα εἰπεῖν
    start_char: 60065
    end_char: 60083
limits: The in-span named formula identifies this turn's speaker outright; no exchange-level inference is used.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0088
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c
char_span:
  start_char: 60143
  end_char: 60247
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: a4eff302805c04caccceaef103199dd908d1c83c15d5bce1274b2ce2b17fdba7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: φάναι, ὦ Ἀγάθων
    start_char: 60171
    end_char: 60186
  - kind: named_reporting_formula
    role: exchange_open
    text: μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι
    start_char: 55926
    end_char: 55978
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: καὶ ἐγώ, πῶς λέγεις, ἔφην, ὦ Διοτίμα
    start_char: 61373
    end_char: 61409
limits: Anchored dialogue turn inside the Socrates-Agathon elenchus (199c-201c), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0089
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c
char_span:
  start_char: 60345
  end_char: 60436
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b66e22509c73be14fcdfd6e10ca203f5893f016c729f0560a8a7dee1a0eff36d
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: φάναι, ὦ Σώκρατες
    start_char: 60354
    end_char: 60371
  - kind: named_reporting_formula
    role: exchange_open
    text: μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι
    start_char: 55926
    end_char: 55978
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: καὶ ἐγώ, πῶς λέγεις, ἔφην, ὦ Διοτίμα
    start_char: 61373
    end_char: 61409
limits: Anchored dialogue turn inside the Socrates-Agathon elenchus (199c-201c), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0090
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c
char_span:
  start_char: 60436
  end_char: 60542
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b954f95c72f853ee4e2922c6d3c383add14a1eee84f031b3bbec238b6d0fd463
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: φάναι, ὦ φιλούμενε Ἀγάθων
    start_char: 60463
    end_char: 60488
  - kind: named_reporting_formula
    role: exchange_open
    text: μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι
    start_char: 55926
    end_char: 55978
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: καὶ ἐγώ, πῶς λέγεις, ἔφην, ὦ Διοτίμα
    start_char: 61373
    end_char: 61409
limits: Anchored dialogue turn inside the Socrates-Agathon elenchus (199c-201c), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0091
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201c-212c
char_span:
  start_char: 60542
  end_char: 83070
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bb66ebc0ca2e1e688632a2539cabe5511fa74e537eb72777c8c3b4c4c1f08fc2
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: formula_bounded_continuation
    text: μετὰ ταῦτα δὴ τὸν Σωκράτη ἔφη ἐνθένδε ποθὲν ἄρξασθαι
    start_char: 55926
    end_char: 55978
  - kind: formula_bounded_continuation
    text: εἰπόντος δὲ ταῦτα τοῦ Σωκράτους
    start_char: 83070
    end_char: 83101
limits: Socrates's continuous reported discourse from 201d, opened by the named formula at 199c and closed by the named genitive absolute at 212c. It encloses the conversation he quotes with Diotima, recorded as deeper spans; statements inside those deeper spans are not owned by this voice.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0092
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202a
char_span:
  start_char: 61542
  end_char: 61558
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 6a3ddfe1fb23b24f7fa9867313a605629eedb6b5278f98ba28d1a06540b8dc39
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 61446
    end_char: 61558
    text_sha256: 14c22ba83996ee257c0bd37253838e377824e6858968c797d70e81adabafd56a
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it answers the ἔφη-marked question καὶ ἥ, οὐκ εὐφημήσεις; ἔφη· ἢ οἴει … ; [61446,61542), whose 2nd-sg οἴει names the answerer. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0093
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202a
char_span:
  start_char: 61558
  end_char: 61643
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 876c3555ef51cccdcb9556ce38b70b158ce00885940c90d6ce2cbc9ff7b65c8e
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 61446
    end_char: 61922
    text_sha256: 486419e7d767f928d62e59cce909c1e49d6ed915680390f3c7a65d1d76d4fd20
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). Both marks of the other party sit in this context: καὶ ἥ … ἔφη at 61446 and οὐκ οἶσθ’, ἔφη at 61710. A: posits the μεταξύ; τί τοῦτο; [61643,61657) asks what it is; [61657,61922) answers it and is ἔφη-marked ⇒ non-narrator ⇒ if this span were the narrator's, that answer would have to be too. Contradiction. B: 2nd-sg ᾔσθησαι to the examinee; [61643,61657) asks what that τι μεταξύ is and [61657,61922) supplies it — so the two are one voice."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0094
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202a
char_span:
  start_char: 61643
  end_char: 61657
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: cbc67b2498a9f4ae31698afb75fffb0d6941164abc5fc263c0e133910474ec41
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 61558
    end_char: 61922
    text_sha256: d32112ffa438a4fbbe41ac7b3b1e628c368e9f5dfba4b102e67e9e5d83b8cf6c
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it queries the τι μεταξύ the other party has just posited at [61558,61643) and is answered by the ἔφη-marked οὐκ οἶσθ’, ἔφη [61657,61922). Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0095
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202b
char_span:
  start_char: 62327
  end_char: 62350
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7e2c3888699a98d4bd9eefaa93e2177ed9c0eb3e2b8f402ecc713cb1d57523ab
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62199
    end_char: 62350
    text_sha256: 0759fe81981baedd51c4f534990486d491f2fcdd976a12d2ddf0f2e08aa0f80a
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it reaffirms παρὰ πάντων from the ἦν δ’ ἐγώ-marked [62199,62268) against the ἔφη-marked challenge [62268,62327) — same voice as an explicit 1st-person span. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0096
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202c
char_span:
  start_char: 62760
  end_char: 62828
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 6d47561a37918181325d94b071f3d732c2af7c5e9a528e34633a778ff94dcbb8
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62581
    end_char: 62848
    text_sha256: 252ed8d44758e19e196d6c702eb84e77068e3dc55199f738c5928dd090f86689
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). This context holds one of each: καὶ ἥ, ῥᾳδίως, ἔφη at 62581 and the narrator's μὰ Δί’ οὐκ ἔγωγ’, ἔφην. [62732,62760). A: preceded by that ἔφην-marked reply; πάνυ γε. [62828,62848) assents to this span, and no one assents to their own question. B: 2nd-sg λέγεις resuming the 2nd-sg φῂς of [62581,62732) across the intervening ἔφην-marked narrator reply [62732,62760)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0097
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202c-202d
char_span:
  start_char: 62828
  end_char: 62848
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 2156419f3fbdbc07d2db68609265c7c8ad8960d39536c3f6c45204cbbf29dc9a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62732
    end_char: 62848
    text_sha256: 31fdee5383acd8602abed37b1cb996b170cbe461cd1759b722b0d4a60938ab50
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it assents to [62760,62828), which itself follows the narrator's own ἔφην-marked μὰ Δί’ οὐκ ἔγωγ’, ἔφην. [62732,62760) — no one assents to their own question. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0098
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 62848
  end_char: 62954
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 871adcf337748544d2829a6e7b66760eadb70c8c21de6e3317c362e95bcdb554
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 61959
    end_char: 62973
    text_sha256: 9fc41676e2c38cfc8610aaaa86d6593ae2c5184674c00cc000fb2429673e986f
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). In this context: καὶ ἣ γελάσασα … ἔφη, ὦ Σώκρατες [62350,62478), naming its addressee at 62386, against the narrator's ἦν δ’ ἐγώ [62199,62268). A: 2nd sg ὡμολόγηκας, answered by 1st sg ὡμολόγηκα γάρ [62954,62973); the agreer is the party the ἔφη-marked speaker addresses (αὐτὸς ὁμολογεῖς 62068). B: 2nd-sg perfect ὡμολόγηκας answered by 1st-sg ὡμολόγηκα; the ἔφη-marked [61959,62199) already writes ἐπειδὴ αὐτὸς ὁμολογεῖς of its addressee."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0099
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 62954
  end_char: 62973
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9908ebdf1eabc4dba120a78e03f7779b1ca75a77b5c78217e6380856b6ca633a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62848
    end_char: 62973
    text_sha256: 8d548d2aad5ee911bcd225f1db31cd7630b383352783a1c3c151ffb77d03d4fb
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: its 1st-sg perfect ὡμολόγηκα answers the 2nd-sg ὡμολόγηκας of [62848,62954). Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0100
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 62973
  end_char: 63032
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bda73af53d9770d3c98c921514f9574eb786a34543f5fdc028b7a6f08b6adc2b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62848
    end_char: 63113
    text_sha256: 40b0b1783d8fff9a77f1f3abd14854ccbb2d67adb4cd30d4ccf74a8fe98f558b
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). The mark in this context is ὁρᾷς οὖν, ἔφη at 63059. A: its answer [63032,63059) is what [63059,63113) cites back — ὁρᾷς οὖν, ἔφη, ὅτι καὶ σὺ ἔρωτα οὐ θεὸν νομίζεις;. B: it draws the inference from the premise of [62848,62954), the same voice, and the ἔφη-marked [63059,63113) closes it with 2nd-sg καὶ σὺ … νομίζεις."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0101
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 63032
  end_char: 63059
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d6ba546808ee1fa15087a0cdd1f2809fb7a599aa9d00e78171e792a19f318e24
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 62973
    end_char: 63113
    text_sha256: 35bca5a71cefe93e576ad690e49bd508292091013c78476934000384d6dc1848
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it concedes to [62973,63032), and the ἔφη-marked ὁρᾷς οὖν, ἔφη, ὅτι καὶ σὺ … νομίζεις; [63059,63113) then ascribes the concession to its 2nd-sg addressee. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0102
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 63154
  end_char: 63169
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e2ee72393db3337ae3acdec92f18bfe7c3e26f43e5e03d8c7904d2c1debf0d77
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 63113
    end_char: 63241
    text_sha256: 8e37d8ff98dc31a9fe3cca585951f9f68cc9d08b34cb42dad3e250a8181f5b4e
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). This context holds both marks: the narrator's τί οὖν ἄν, ἔφην, εἴη ὁ Ἔρως; θνητός; [63113,63154) and the other party's ὥσπερ τὰ πρότερα, ἔφη, … [63186,63241). A: it answers that ἔφην-marked question. B: reply to the ἔφην-marked [63113,63154), standing with the ἔφη-marked [63186,63241) in one alternation across the narrator's [63169,63186)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0103
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 63169
  end_char: 63186
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d8aa2dacb4ffda285107481a695b704d367479d222ecbcfb2150c6d80764a3b7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 63113
    end_char: 63241
    text_sha256: 8e37d8ff98dc31a9fe3cca585951f9f68cc9d08b34cb42dad3e250a8181f5b4e
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it follows the narrator's own ἔφην-marked question [63113,63154) in the same 1st-person role and is answered by the ἔφη-marked ὥσπερ τὰ πρότερα, ἔφη, … [63186,63241). Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0104
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202e-203a
char_span:
  start_char: 63393
  end_char: 64108
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e38825550a0214175830ca3a466711736ab70a55ff128d6eb0daed125b5bf538
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 63264
    end_char: 64164
    text_sha256: 3ea599a818a790202a1a1e95d358ea53baa3a8028aaf64ce7ebb68871eef25af
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: it answers the narrator's τίνα, ἦν δ’ ἐγώ, δύναμιν ἔχον; [63358,63393), and is preceded by [63264,63358) carrying ὦ Σώκρατες at 63282. B: it is flanked on both sides by 1st-person-marked spans — that ἦν δ’ ἐγώ question, and the next one, πατρὸς δέ, ἦν δ’ ἐγώ, τίνος ἐστὶ καὶ μητρός; [64108,64164), which closes it."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0105
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 204e
char_span:
  start_char: 67677
  end_char: 67722
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0b76713f0bee84ecd625f85bff708c7c642cc0c439e72da27c43e7410910a04c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 67331
    end_char: 67801
    text_sha256: f4fa517c9c1a13ea6bea95ea42609a27f5876a662bf21352c3a980b470802504
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: its answer says so outright — τοῦτ’ εὐπορώτερον, ἦν δ’ ἐγώ, ἔχω ἀποκρίνασθαι [67722,67801); the narrator is answering, so this is the other party's question, and it is a verbatim doublet of the ἔφη-marked question [67331,67424). B: flanked by the ἦν δ’ ἐγώ spans [67646,67677) and [67722,67801); it executes on that ἔφη-marked question the substitution ἀντὶ τοῦ καλοῦ τῷ ἀγαθῷ announced at [67511,67646)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0106
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205a
char_span:
  start_char: 67995
  end_char: 68145
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 31dd693de7afed894bc2074f00af32667e46f498f392950106509cebcaecef72
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 67966
    end_char: 68188
    text_sha256: 8da23bdec5aaa7eb2e3b71d93cab0bed7bdfe6e08b04541de3fd81630b378949
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: flanked by ἀληθῆ λέγεις, εἶπον ἐγώ. [67966,67995) and οὕτως, ἦν δ’ ἐγώ· κοινὸν εἶναι πάντων. [68145,68188) — both narrator-marked, the latter answering it. B: its 2nd-sg οἴει/λέγεις is put to the narrator, who is the one marked on both sides of it."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0107
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205b-205c
char_span:
  start_char: 68539
  end_char: 68768
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 51d3894bacbfe601442f6ea5b1dfcec8e5d004fde12e4c8d1f16045cd3769fed
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 68514
    end_char: 69070
    text_sha256: a9c4724c6e78369e495da83bf8c902d91ea8732b977cbaf92eebd1b0a23e2c7a
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: it answers ὥσπερ τί; ἦν δ’ ἐγώ. [68514,68539), and is continued on the same point by [68786,69070), which carries ἦ δ’ ἥ at 68801. B: it answers [68514,68539) by echoing ὥσπερ, and the ἦ δ’ ἥ-marked [68786,69070) resumes it with the same οἶσθ’ ὅτι frame across the reply [68768,68786)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0108
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205c
char_span:
  start_char: 68768
  end_char: 68786
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c5f586f28d1730d39a7ceb32900430c7f88f4beb64fbe5eca99a72d91ed7c07f
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 68539
    end_char: 69070
    text_sha256: eea4a75abeebf56db0dd8b50a57bbd02254f8fa77b740af00dd9c23a1e1d0656
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: its 2nd-sg λέγεις is addressed to the speaker of [68539,68768), and that speaker resumes immediately after it as ἦ δ’ ἥ (feminine) at 68801. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0109
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205d
char_span:
  start_char: 69101
  end_char: 69511
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: a188ff4d080943f232a82bb4162aafc4a32b3017ecffeaec3e2173a0c3733044
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 68786
    end_char: 69552
    text_sha256: 6bb4b627d06e40501559b353a961ecf4e74095335ca247aa620a0dd5e4bca5bd
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: it is followed by κινδυνεύεις ἀληθῆ, ἔφην ἐγώ, λέγειν. [69511,69552) — a 2nd-sg κινδυνεύεις the narrator addresses to this span's speaker. B: flanked by ἀληθῆ λέγεις, ἔφην. [69070,69101) and ἔφην ἐγώ [69511,69552); it applies to ἔρως the ποίησις distinction the ἦ δ’ ἥ-marked [68786,69070) has just drawn."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0110
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70259
  end_char: 70275
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 8ce2ecaa4bd554d9fc38c1a51d9aed7581cd9870dd4b622f387b9eb5114203f6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 70189
    end_char: 70275
    text_sha256: 46ade1418c4d2e38509f35d00a99b8147ff782f27babc4e99050e1ec1084a258
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it echoes as its answer the verbal adjective of the ἔφη-marked question τί δέ; οὐ προσθετέον, ἔφη, … ; [70189,70259). Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0111
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70333
  end_char: 70359
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 756d413e4bd78780f56a7ff22ab7ce8ec27629689a0b856e4625070a900c79ab
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 70275
    end_char: 70359
    text_sha256: d3f7176d371df21b6d88f9752f0d185e813f4439cbfebc00e4ac7efd0c525780
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it answers the ἔφη-marked question ἆρ’ οὖν, ἔφη, καὶ οὐ μόνον εἶναι, ἀλλὰ καὶ ἀεὶ εἶναι; [70275,70333). Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0112
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206e
char_span:
  start_char: 71916
  end_char: 71933
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d8aa2dacb4ffda285107481a695b704d367479d222ecbcfb2150c6d80764a3b7
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΣΩ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 71855
    end_char: 71933
    text_sha256: af9f412d0d09a11b27f92e28679114c77ff711936b89262331cf2a0e64069d88
  rationale: "Socrates' own bare reply inside his own narration of the Diotima conversation. Local discourse eliminates Diotima: it responds to the ἔφη-marked ἔστιν γάρ, ὦ Σώκρατες, ἔφη, οὐ τοῦ καλοῦ ὁ ἔρως, ὡς σὺ οἴει. [71855,71916), whose vocative at 71866 and 2nd-sg σὺ οἴει name the addressee. Person marking of the μοι/ὡμολόγηκα kind belongs to this hashed context and rationale and MUST NOT be written into evidence_refs (2026-07-30 ruling). Authority is reviewed_attribution alone; the record carries no evidence_refs."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0113
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206e
char_span:
  start_char: 71933
  end_char: 71977
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d0f3951af54a28939fe62e6d0029a80d18bfb3f093a17af09cb670a31f7f0aa3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 71855
    end_char: 71998
    text_sha256: a733e1ea931097879845704f1df69e3cf35b16989058b7a3c504220845fe9e11
  rationale: "Socrates–Diotima report 201e–212b: the narrator's own turns carry ἦν δ’ ἐγώ / ἔφην, the other party's ἔφη / ἦ δ’ ἥ (feminine). A: it answers ἀλλὰ τί μήν; [71916,71933), whose speaker is the one addressed ὦ Σώκρατες at 71866 inside the ἔφη-marked [71855,71916). B: it supplies the genitive complement of ὁ ἔρως that the same ἔφη-marked span had just denied (οὐ τοῦ καλοῦ ὁ ἔρως) — she completes her own sentence; the next span is the narrator's εἶεν, ἦν δ’ ἐγώ. [71977,71998)."
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0114
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e-222c
char_span:
  start_char: 88627
  end_char: 104101
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7e028b4acd93de447d90adec6e81d18c7bd026326538813498d6bb1e0cc59a6e
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: οὐκ ἂν φθάνοιμι, εἰπεῖν τὸν Ἀλκιβιάδην
    start_char: 88587
    end_char: 88625
  - kind: closing_formula
    text: εἰπόντος δὴ ταῦτα τοῦ Ἀλκιβιάδου
    start_char: 104101
    end_char: 104133
limits: Opened by a named formula and closed by a named genitive absolute. Proper names inside the span (Φαίδρους 218a, Σωκράτη 218b) are the speaker's own references, not speech formulas.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0115
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 218c
char_span:
  start_char: 95982
  end_char: 96012
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: be31cbd088c6bd79aa261f577b5c33e1192949b8dd00338ecb7a9e3d8f1e3087
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
  - ΑΛΚ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 95850
    end_char: 96100
    text_sha256: 0de4c3ed9fdf3202e84ced664182561b0b5401e85612a489a9a8897a99adfa4b
  rationale: Alcibiades' own question inside his own narration. The span sits between two records both resolved to ΣΩ. (0150 ἦ δ’ ὅς, 0151 ἔφη) and IS the question 0151 (τί μάλιστα, ἔφη.) answers, so Socrates cannot be its speaker. The dative μοι is context, not evidence.
limits: The owner is a reviewed structural adjudication over the cited context, not a quotable naming formula, and it places the utterance with the narrator of the report it sits inside. It establishes nothing about what the utterance says, and it is not evidence that this speaker continues past the context.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0116
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 177a-177c
char_span:
  start_char: 10402
  end_char: 11131
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: f924198056eb5eee3a7a87e8a39aa34a307bfbf9905c3da6cb2a224058ab87da
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
  - ΦΑΙ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: Φαῖδρος γὰρ ἑκάστοτε πρός με ἀγανακτῶν λέγει
    start_char: 10357
    end_char: 10401
limits: Eryximachus explicitly quotes a recurring complaint by Phaedrus; the named formula introduces the nested speech.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0117
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 201e-202a
char_span:
  start_char: 61446
  end_char: 61542
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d04ba2004c7b743470ec3c44b432cf8fc0f248cfc86b4786203757968d7845d3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: καὶ ἥ,
    start_char: 61450
    end_char: 61456
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0118
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202a
char_span:
  start_char: 61657
  end_char: 61922
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: fd791bc8798c80e880dd2c00a141e29e24af6cc91dd96adb66a3c657f0c8dd48
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 61721
    end_char: 61725
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0119
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202b
char_span:
  start_char: 61959
  end_char: 62199
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 70a7d447c4ea785a101f034b6b090976d4be0b5c9556ead5baf14c1518247cb2
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 62185
    end_char: 62189
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0120
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202b
char_span:
  start_char: 62268
  end_char: 62327
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 881e9a0e444e144482542694b70b6bc19a11ddfde95d011c517ff623ffa6fa3a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 62288
    end_char: 62292
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0121
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202b-202c
char_span:
  start_char: 62350
  end_char: 62478
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 053f74b37ca3b9a4ed0ed281284cfe16fa5f6512098dd9901e03ae9927eba310
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 62381
    end_char: 62385
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0122
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202c
char_span:
  start_char: 62506
  end_char: 62540
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 2c9b6ad7cd8a155c3035263d358b887a14ed81f901622d63cf41396bb58a51c6
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 62519
    end_char: 62523
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0123
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202c
char_span:
  start_char: 62581
  end_char: 62732
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5206f7783f4854cc96cd9aad6d822fdb90e48525f398753cf8c5723dc5b70c93
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: καὶ ἥ,
    start_char: 62585
    end_char: 62591
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0124
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 63059
  end_char: 63113
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 37112c29eab995e30d7fca6be7cc3713cbabe9bba82c145a71c56467ade7fe26
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 63073
    end_char: 63077
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0125
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d
char_span:
  start_char: 63186
  end_char: 63241
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5afc15979d94028d79e445b7170cd87b8606f24fbbd43e276945a77445c4e302
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 63208
    end_char: 63212
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0126
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 202d-202e
char_span:
  start_char: 63264
  end_char: 63358
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: dbab36ee941a575a58b0260fcf54adc85111d23f4cd16634f989450ce82d0a83
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 63282
    end_char: 63292
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0127
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 203b-204a
char_span:
  start_char: 64164
  end_char: 66068
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: edc1768b998fbb212c071ab85cf4ec074082729db2f2bfb3961168a84f8d7987
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 64184
    end_char: 64188
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0128
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 204b-204c
char_span:
  start_char: 66163
  end_char: 66910
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 4b89b99fc774ab0f7edd2ef0d045e37f5fea7142b754ba8dffe6e7e0d5f12b68
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 66177
    end_char: 66181
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0129
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 204d
char_span:
  start_char: 67023
  end_char: 67294
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c9a9dc3cf34273d119d1e9e6926119e60a4a5d3f14dd6e42886a7b42fc567854
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 67048
    end_char: 67052
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0130
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 204d
char_span:
  start_char: 67331
  end_char: 67424
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 3ceea8c5998699d24a16bd32f90b7f91756e77e3116773d364bc6809da2331cc
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 67351
    end_char: 67355
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0131
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 204e
char_span:
  start_char: 67511
  end_char: 67646
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: bcd0057d6f223a434f34127168a7ea4bfbb586ad87563698bca0c40f4d3c5c0d
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 67521
    end_char: 67525
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0132
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205a
char_span:
  start_char: 67801
  end_char: 67966
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9fcd449ac0a745957ba0581d3ff191e3df70b9cb504adad701d8458e525ef36f
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 67817
    end_char: 67821
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0133
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205a-205b
char_span:
  start_char: 68188
  end_char: 68325
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7eec4b4e37e5278f85f6e0fadaca788fcc7892fc59bac1d830f6492b6f4714bc
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 68203
    end_char: 68207
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0134
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205b
char_span:
  start_char: 68360
  end_char: 68514
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e7ca9de47e85d40770d34b799ace6ed3a447a9e96646a10a9d5d2d8f531c5c4c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη·
    start_char: 68381
    end_char: 68385
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0135
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205c
char_span:
  start_char: 68786
  end_char: 69070
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 62b7d14994fd0032f367f395c62ff87cfffc779c164c6760ab833bad0b6edb97
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ἥ
    start_char: 68801
    end_char: 68807
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0136
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 205d-206a
char_span:
  start_char: 69552
  end_char: 70062
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 3f76eb69e14d4217ae847431aa0c35ef89d6441eb9961b98572c2484c8f91f3f
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 69580
    end_char: 69584
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0137
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70096
  end_char: 70174
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c5b29ff0ef479dec82f3504bdbcff85557dcd56ab93b461792c14234111d7bd2
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ἥ
    start_char: 70109
    end_char: 70115
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0138
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70189
  end_char: 70259
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7d9780fba4d2673a772b6ca182376d1b71fcc8425d4689617d954b43c00c2e85
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 70215
    end_char: 70219
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0139
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70275
  end_char: 70333
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 421b3999351cae060da76698dd0529c005244101c8c34a9bdfea4becfac1c966
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 70288
    end_char: 70292
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0140
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206a
char_span:
  start_char: 70359
  end_char: 70426
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 29d8439dea13578aa140b35fd305b82b2fbc4a1db0c5ceced4efe49ea9a2f7f9
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 70384
    end_char: 70388
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0141
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206b
char_span:
  start_char: 70467
  end_char: 70646
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: eea02ad17b59d0adfb8c2174493f6361b27c71a6a13b43d5eafd872337938560
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ἥ
    start_char: 70502
    end_char: 70508
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0142
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206b
char_span:
  start_char: 70749
  end_char: 70843
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7d0201267a10e8af35e61e09c7671effd46a65d8f0a95dbb9e4dbd47bdd3138d
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 70767
    end_char: 70771
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0143
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206c-206e
char_span:
  start_char: 70915
  end_char: 71916
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 076fe08d117beb05bd391487670d618d0d2d323ba53c0c7c4fd383e67a334379
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ἥ
    start_char: 70929
    end_char: 70935
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0144
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 206e-207a
char_span:
  start_char: 71998
  end_char: 72284
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: ab62c23391b18f9680246149222c0cbfa584b63915262cd794e1347a355ede2b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη.
    start_char: 72016
    end_char: 72020
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0145
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 207a-207c
char_span:
  start_char: 72375
  end_char: 72993
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 1916bdc21d1f3acaeaba69c0842ef18d842d5d7765720f72a6d5ef32c116820f
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 72384
    end_char: 72394
  - kind: person_marked_reporting_formula
    text: ἔφη
    start_char: 72877
    end_char: 72880
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: The child starts after Socrates's narratorial ἤρετο. The vocative identifies Socrates as addressee and the later third-person ἔφη confirms Diotima's continuing turn.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0146
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 207c
char_span:
  start_char: 73044
  end_char: 73111
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: fbae67fa3190ee7880915852d0d6efba2cb1444bdf8d572fa46eb15cdabd3d65
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΔΙΟ.
    - ΣΩ.
  context_span:
    start_char: 72993
    end_char: 73277
    text_sha256: 77325d7d2bb46432cb6e1e73572edb15e6268cbc69bf10a5384ed0aba6ee3c09
  rationale: Inside the bounded Socrates-Diotima exchange, Socrates marks his preceding narration in the first person (καὶ ἐγὼ αὖ ἔλεγον); the feminine handoff ἣ δ’ εἶπεν directly introduces this question; and Socrates's following reply addresses ὦ Διοτίμα. These structural cues select Diotima without using automatic alternation.
limits: The owner is a reviewed structural adjudication over the cited context. The speech span begins after Socrates's narratorial handoff and establishes nothing about the content of the question.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0147
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 207c-208b
char_span:
  start_char: 73277
  end_char: 74862
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9b65cca89188acd646e252efd670c1cc8cbd48a1296b6e50cb8d3b3f273771d3
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη,
    start_char: 73292
    end_char: 73296
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0148
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 208c-209e
char_span:
  start_char: 74986
  end_char: 78048
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 643c19ce367704b94884ed5b706480a33a457dc4655022c952f0fc97f25c9745
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: καὶ ἥ,
    start_char: 74990
    end_char: 74996
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0149
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 209e-212b
char_span:
  start_char: 78048
  end_char: 82478
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d8a3ffb73dea2e0a70c96f7d12be82646034e50c33b437109d74d957275b1bff
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
  - ΔΙΟ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ὦ Σώκρατες
    start_char: 78083
    end_char: 78093
  - kind: named_reporting_formula
    role: exchange_open
    text: τὸν δὲ λόγον τὸν περὶ τοῦ Ἔρωτος, ὅν ποτ’ ἤκουσα γυναικὸς Μαντινικῆς Διοτίμας
    start_char: 60583
    end_char: 60660
  - kind: closing_formula
    role: exchange_close
    text: ταῦτα δή, ὦ Φαῖδρέ τε καὶ οἱ ἄλλοι, ἔφη μὲν Διοτίμα
    start_char: 82482
    end_char: 82533
limits: Anchored dialogue turn inside the Socrates-Diotima conversation (201e-212b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0150
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 218c
char_span:
  start_char: 95960
  end_char: 95982
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: b2ab23a6ca1941ab217afca8a99cf3991954104e8e33837d2b04bebdf68e2ae0
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἦ δ’ ὅς
    start_char: 95973
    end_char: 95980
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ εἶπον κινήσας αὐτόν, Σώκρατες, καθεύδεις;
    start_char: 95914
    end_char: 95959
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἐγὼ μὲν δὴ ταῦτα ἀκούσας τε καὶ εἰπών
    start_char: 97587
    end_char: 97624
limits: Anchored dialogue turn inside the Alcibiades-Socrates reported exchange (218c-219b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0151
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 218c
char_span:
  start_char: 96012
  end_char: 96033
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 99b057ae39b7592f9409f551e4371f4d03738496661abc24b2765ccab88fffbc
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 96028
    end_char: 96031
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ εἶπον κινήσας αὐτόν, Σώκρατες, καθεύδεις;
    start_char: 95914
    end_char: 95959
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἐγὼ μὲν δὴ ταῦτα ἀκούσας τε καὶ εἰπών
    start_char: 97587
    end_char: 97624
limits: Anchored dialogue turn inside the Alcibiades-Socrates reported exchange (218c-219b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0152
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 218d-219a
char_span:
  start_char: 96542
  end_char: 97280
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 26b08f2ce5c0a7bbaa2d4bb9a42e97db6d51bf59e6d4ff474faa07ee6198a22d
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: καὶ οὗτος ἀκούσας μάλα εἰρωνικῶς καὶ σφόδρα ἑαυτοῦ τε καὶ εἰωθότως ἔλεξεν
    start_char: 96546
    end_char: 96619
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ εἶπον κινήσας αὐτόν, Σώκρατες, καθεύδεις;
    start_char: 95914
    end_char: 95959
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἐγὼ μὲν δὴ ταῦτα ἀκούσας τε καὶ εἰπών
    start_char: 97587
    end_char: 97624
limits: Anchored dialogue turn inside the Alcibiades-Socrates reported exchange (218c-219b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0153
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 219a-219b
char_span:
  start_char: 97434
  end_char: 97583
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 11f7c4be1db60526f30bb3e1d83e84396b890b9b102660ac732c68ae3b74c3cd
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
  - ΣΩ.
depth: 4
resolution: resolved
evidence_refs:
  - kind: anchored_dialogue_turn
    text: ἔφη
    start_char: 97444
    end_char: 97447
  - kind: person_marked_reporting_formula
    role: exchange_open
    text: καὶ εἶπον κινήσας αὐτόν, Σώκρατες, καθεύδεις;
    start_char: 95914
    end_char: 95959
  - kind: person_marked_reporting_formula
    role: exchange_close
    text: ἐγὼ μὲν δὴ ταῦτα ἀκούσας τε καὶ εἰπών
    start_char: 97587
    end_char: 97624
limits: Anchored dialogue turn inside the Alcibiades-Socrates reported exchange (218c-219b), an explicitly bounded two-party exchange whose opening and closing anchors are cited. The cue is a person-marked reporting verb or a vocative naming the other party; in a two-party exchange the addressee is not the speaker. This record does not establish anything about the content of the utterance.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0154
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172a-173d
char_span:
  start_char: 0
  end_char: 2786
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: f512032d63196f9c47d50c0df9a0b11530495b6050309c950f456566cf3b201d
voice_chain:
  - ΑΠΟΛ.
depth: 1
resolution: resolved
evidence_refs:
  - kind: printed_siglum
    text: ΑΠΟΛ.
    start_char: 12
    end_char: 17
limits: Records that the printed siglum opens this turn. It does not establish that Apollodorus owns any utterance inside the roadside conversation he reports. The narration between the reported utterances, and the whole {p} frame tail in which he addresses his companions, are his as narrator and stay with this record.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0155
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172a
char_span:
  start_char: 210
  end_char: 278
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 03bd27bc1ae836c4f1535f07f20714792d83e697d058c570b0bb5dbfe68cc12d
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "Introduced by ἐκάλεσε … τῇ κλήσει [175,208), subject τῶν οὖν γνωρίμων τις [126,146) — the other party, not the narrator; in-span third-person ἔφη [231,234). It names the narrator [240,257) and questions him in the second person, so he is its addressee. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0156
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172a-172b
char_span:
  start_char: 312
  end_char: 825
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: fe74c95dafc8740670c4d459b7d1bd2433850ea9be0e00e825270e4a2491f2f0
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "One utterance across {172b} at 424, markup unreopened to 768. Third-person καὶ ὅς [304,310); in-span ἔφη [333,336), ἦ δ’ ὅς [759,766); vocative Ἀπολλόδωρε, [316,327) names the narrator as addressee, 2nd person throughout. [608,629) licenses nothing; no nested record. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0157
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172b-172c
char_span:
  start_char: 826
  end_char: 998
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 5020bbecf3dd3cbe082f79acf1f08d53abeb78eaa64d264c8522c973be869fe0
voice_chain:
  - ΑΠΟΛ.
  - ΑΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ εἶπον ὅτι
    start_char: 826
    end_char: 840
limits: "The reporting formula printed inside this span is first person, so it identifies the narrator as this utterance's speaker: Apollodorus is here a participant in the roadside conversation he reports, not only its frame. It establishes nothing about what the utterance says, and it does not extend to the narration between utterances, which stays with the depth-1 record. The span opens at the first-person formula rather than at the {q} milestone at 841, because the narrator-repeat licence requires the cue in-span; the utterance runs past the {/q} at 883."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0158
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172c
char_span:
  start_char: 999
  end_char: 1018
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 4114dca894ebdfd9b1636c56795cb3f5700d406e2a37d6e09a47440d20c84d1a
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "Third-person ἔφη [1019,1022) printed immediately after it excludes the first-person narrator. It answers the narrator's second-person conditional εἰ νεωστὶ ἡγῇ [916,929) with first-person ἐγώ γε δή, so speaker and addressee change places here. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0159
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 172c-173a
char_span:
  start_char: 1024
  end_char: 1402
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 6d5860ea253e0894397495ab707998af0c75390ad89c92d5b500f6af61b79bea
voice_chain:
  - ΑΠΟΛ.
  - ΑΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 1035
    end_char: 1044
limits: "The reporting formula printed inside this span is first person, so it identifies the narrator as this utterance's speaker: Apollodorus is here a participant in the roadside conversation he reports, not only its frame. It establishes nothing about what the utterance says, and it does not extend to the narration between utterances, which stays with the depth-1 record. The vocative ὦ Γλαύκων at [1046,1055) names the ADDRESSEE, not this speaker, and is not evidence here."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0160
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 173a
char_span:
  start_char: 1411
  end_char: 1488
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d7234d036fc2047cabc514906f4b0fefd2f0c9937da00b33d283552d2149bd8a
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "Introduced by third-person καὶ ὅς [1403,1409), in-span third-person ἔφη [1431,1434). It answers, in second-person imperatives (μὴ σκῶπτ’, ἀλλ’ εἰπέ μοι), the preceding utterance, whose ἦν δ’ ἐγώ marks the narrator and whose vocative names this speaker. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0161
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 173a
char_span:
  start_char: 1489
  end_char: 1634
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 36cbdbe16885c945a13d888550bf9a860a4c53d5ddf7544de49caced9e17fb5c
voice_chain:
  - ΑΠΟΛ.
  - ΑΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: κἀγὼ εἶπον ὅτι
    start_char: 1489
    end_char: 1503
limits: "The reporting formula printed inside this span is first person, so it identifies the narrator as this utterance's speaker: Apollodorus is here a participant in the roadside conversation he reports, not only its frame. It establishes nothing about what the utterance says, and it does not extend to the narration between utterances, which stays with the depth-1 record. Same boundary rule as [826,998): the span opens at the first-person formula introducing this utterance from outside the {q} milestone at 1504."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0162
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 173a
char_span:
  start_char: 1635
  end_char: 1726
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: e333c69ac18f02ecf026d8ae7a442318e80285e6d51ae2ec2ee5281d2c74b1f7
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "In-span third-person ἔφη [1650,1653) excludes the narrator; the utterance questions him in the second person (ἀλλὰ τίς σοι διηγεῖτο; [1681,1703)). Σωκράτης is named inside that question as a possible source of the report, not a speaker. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0163
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 173b
char_span:
  start_char: 1734
  end_char: 2059
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 623320ea340b37c2e69776f62082db43592c0831a9b8aec0bd63fe1c33fc9508
voice_chain:
  - ΑΠΟΛ.
  - ΑΠΟΛ.
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    text: ἦν δ’ ἐγώ
    start_char: 1758
    end_char: 1767
limits: "The reporting formula printed inside this span is first person, so it identifies the narrator as this utterance's speaker: Apollodorus is here a participant in the roadside conversation he reports, not only its frame. It establishes nothing about what the utterance says, and it does not extend to the narration between utterances, which stays with the depth-1 record. One utterance split into two {q} groups by the parenthetical formula at [1758,1767); the record spans both so the cue is in-span."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0164
source_work: Symposium
outer_turn_id: turn_symposium_0001
stephanus_span: 173b
char_span:
  start_char: 2060
  end_char: 2181
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: eeefcfc75a53e96aaa3c7060cc8b38ac7c6ba72870620f8b6558568b0c9e90a0
voice_chain:
  - ΑΠΟΛ.
  - ΓΛΑΥ.
depth: 2
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΠΟΛ.
    - ΓΛΑΥ.
  context_span:
    start_char: 126
    end_char: 2181
    text_sha256: 2400d7d1925f53a75c3c288aa93cf8912a3efa851781de7e2e775be6804221f8
  rationale: "In-span third-person ἔφη [2077,2080); addresses the narrator in the second-person future (οὐ διηγήσω μοι; [2086,2101)), which he acts on in the frame narration at οὕτω δὴ ἰόντες [2186,2200). Last utterance of the exchange. Bounded two-party 172a-173b: narrator first person [279,291), [826,840), [1035,1044), [1489,1503), [1758,1767); one other party [126,182), never joined by a third; closes 2181, frame resumes 2182; named by vocative ὦ Γλαύκων [1046,1055) in the narrator's own utterance, so he is its addressee. No naming formula; no carry-forward."
limits: "Owner is a reviewed structural adjudication over the cited bounded exchange, not a quotable naming formula. The Greek prints no formula naming this speaker: the reporting verbs here are bare third person (ἔφη, ἦ δ’ ὅς, καὶ ὅς), which exclude the first-person narrator but name nobody, and this exchange has no speaker-naming opening or closing anchor, so anchored_dialogue_turn is unavailable. It establishes nothing about what the utterance says."
review_status: accepted
```

```yaml
voice_id: voice_symposium_0165
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 212c-212d
char_span:
  start_char: 83336
  end_char: 83467
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 9246d59b2ac440eef351912303dfb9eda171274bb3f63446f054569dd9476a37
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Ἀγάθωνα, παῖδες, φάναι
    start_char: 83319
    end_char: 83349
limits: Establishes that Agathon speaks these words to the household slaves. It does not establish who answered the door or what was said off-stage.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0166
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 212e-213a
char_span:
  start_char: 83864
  end_char: 84336
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7e0d70e90539cbf4595aef3e7b4d92c58388ec8da6fb74fbe038fabf6dddb644
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: anaphoric_reporting_formula
    text: ἐστεφανωμένον αὐτὸν κιττοῦ τέ τινι στεφάνῳ δασεῖ καὶ ἴων, καὶ ταινίας ἔχοντα ἐπὶ τῆς κεφαλῆς πάνυ πολλάς, καὶ εἰπεῖν
    start_char: 83746
    end_char: 83862
    antecedent_text: Ἀλκιβιάδου τὴν φωνὴν ἀκούειν
    antecedent_start_char: 83492
    antecedent_end_char: 83520
limits: Establishes the owner of the entrance speech only. The bare parenthetical φάναι at 83994 inside it names nobody and is not cited as independent evidence.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0167
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213b
char_span:
  start_char: 84796
  end_char: 84851
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 958a778024226f7a2582d6c421ea40636180a781ed29987810ca0392ae897c19
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν οὖν τὸν Ἀγάθωνα
    start_char: 84773
    end_char: 84795
limits: Establishes Agathon as the speaker of the order. The vocative plural παῖδες addresses the household staff collectively and licenses no owner of its own.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0168
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213b
char_span:
  start_char: 84856
  end_char: 84922
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 329ebd2bd350ff5c8c541d6c3b66bc7c53715989ee5cdb965d317eb91c6c01f9
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀλκιβιάδην
    start_char: 84865
    end_char: 84886
limits: Covers only πάνυ γε … τρίτος συμπότης;. The exclamation that follows the intervening narration is a separate record.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0169
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213b-213c
char_span:
  start_char: 85003
  end_char: 85331
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: c7294b526bb593818666a708b37ba0ed7567a9453c372950b42af0a7d299ea23
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 83467
    end_char: 85331
    text_sha256: 9b143adc9630d0d54fe4fb31d81769f3cfb076b49384ec2ec24b694a8f7c5be9
  rationale: Grammar of the introducing clause, not adjacency; 84958 is the identified trap. In καὶ ἅμα μεταστρεφόμενον αὐτὸν ὁρᾶν τὸν Σωκράτη, ἰδόντα δὲ ἀναπηδῆσαι καὶ εἰπεῖν (@84923-85003), αὐτόν is the accusative subject of ὁρᾶν and τὸν Σωκράτη at 84958 its OBJECT; ἰδόντα agrees with that same αὐτόν, subject of the coordinated ἀναπηδῆσαι and εἰπεῖν, since it is the seer who leaps up. τὸν Σωκράτη cannot own this utterance. The speech addresses Socrates in the second person throughout and names him in the third (Σωκράτης οὗτος;). αὐτόν is fixed by coreference here, not carry-forward.
limits: A reviewed structural resolution, not cited bytes. It establishes that the utterance belongs to the subject of ὁρᾶν and that this subject is not Socrates; it does not assert that any formula names Alcibiades at this offset.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0170
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213c-213d
char_span:
  start_char: 85353
  end_char: 85821
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: a98861740a1b7e5cfe45e875761a1ede0bc4a9e95d1b6f6f7b1ccd5800c33ca8
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: καὶ τὸν Σωκράτη, Ἀγάθων, φάναι
    start_char: 85336
    end_char: 85366
limits: Establishes Socrates as the speaker. Ἀγάθων is the vocative addressee inside the speech, not a second owner.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0171
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213d-213e
char_span:
  start_char: 85826
  end_char: 86180
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 457de14f5ca449a0b50feafe6e43632a1da4d94160c70df0173f2c6556d249ca
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀλκιβιάδην
    start_char: 85841
    end_char: 85861
limits: One continuous utterance with a change of addressee (Socrates, then Agathon) marked only by a second bare parenthetical φάναι at 85955; no narration interrupts it, so it is not split.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0172
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 213e
char_span:
  start_char: 86287
  end_char: 86573
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 582d341322ca959f389684ce6b9126b85b145908f7746049d44ac21bba6c7fc8
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΑΓΑ.
    - ΣΩ.
  context_span:
    start_char: 84796
    end_char: 86843
    text_sha256: feabbac65872a9cff1c0b5b9d8d25fc9bacd3c7aa21f51032147b009f8549d73
  rationale: The introducing clause ἐπειδὴ δὲ κατεκλίνη, εἰπεῖν· names nobody. Its subject is fixed by two structural facts here, not by carry-forward. (i) κατεκλίνη resumes καὶ κατακλίνεσθαι in the preceding narration, whose accusative subject αὐτόν is distinguished from τὸν Σωκράτη, the object of ἀναδεῖν, so it excludes ΣΩ. (ii) Agathon's own speech Ὑπολύετε, παῖδες, Ἀλκιβιάδην, ἵνα ἐκ τρίτων κατακέηται names him as the one to recline, and κατακέηται/κατεκλίνη are the same verb. Agathon is excluded in-span by the vocative ἀλλὰ φερέτω, Ἀγάθων, Socrates by the following τῷ Σωκράτει κελεύειν ἐγχεῖν.
limits: Establishes the owner of the drinking proclamation. It does not establish anything about the παῖ addressed at 86540 or about the ψυκτήρ narration that follows.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0173
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214a
char_span:
  start_char: 86722
  end_char: 86843
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 769059556db566a7a5e09f432a1a46f2f8c4f5f5fbe30987fc1dca6b0049560d
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 84796
    end_char: 87052
    text_sha256: 741d7f543fde858b9e047d8a5686c01baa9dfc3d44af545c14252a88befed761
  rationale: "καὶ ἅμα εἰπεῖν· is coordinated with ἐκπιεῖν and κελεύειν in τοῦτον ἐμπλησάμενον πρῶτον μὲν αὐτὸν ἐκπιεῖν, ἔπειτα τῷ Σωκράτει κελεύειν ἐγχεῖν καὶ ἅμα εἰπεῖν·, so its subject is the accusative αὐτόν, the same subject as the preceding record's. Socrates is excluded twice: he is the dative recipient τῷ Σωκράτει of that subject's order, and the speech names him in the third person (πρὸς μὲν Σωκράτη … ὁπόσον γὰρ ἂν κελεύῃ τις) while addressing the company as ὦ ἄνδρες. Identity rests on the same coreference chain and κατακέηται/κατεκλίνη anchor in this hashed context."
limits: Establishes the owner of the toast only. It does not establish that Socrates drank or spoke.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0174
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214a-214b
char_span:
  start_char: 86915
  end_char: 87052
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d791ea896dc424a15c78e814a841cb4feeac6ff7404130fe3239dd67cd004160
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν δ’ Ἐρυξίμαχον πῶς οὖν, φάναι
    start_char: 86897
    end_char: 86929
limits: Establishes Eryximachus as the speaker. ὦ Ἀλκιβιάδη inside the speech names the addressee, not a second owner.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0175
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214b
char_span:
  start_char: 87083
  end_char: 87147
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 4545a81353e51fd294660e3ebe858012dc3801fbf67e64cb3f7996778a822acb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Ἀλκιβιάδην εἰπεῖν
    start_char: 87057
    end_char: 87082
limits: Establishes the greeting's owner only.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0176
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214b
char_span:
  start_char: 87152
  end_char: 87202
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: d73f461457b52e1be4615cd944d95ad824b0e92ae480714d0a2cf7673ee2f868
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἐρυξίμαχον·
    start_char: 87164
    end_char: 87185
limits: Establishes the owner of both clauses; the formula is medial, with direct speech on both sides.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0177
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214b
char_span:
  start_char: 87207
  end_char: 87329
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 036a09a22dee1b3229d6b6858724e88d03ccb6b351325dfe8d43ee6e83d95b91
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 86915
    end_char: 87688
    text_sha256: fbe90c88709a6cba8ebf05d5b616b23c52b3877a86304c97a0d9e0536b2cbf7c
  rationale: No formula stands in this span; resolution is structural, from the second-person deixis of two named neighbours. (i) The span addresses in the second person whoever gives orders (ὅτι ἂν σὺ κελεύῃς, δεῖ γάρ σοι πείθεσθαι, ἐπίταττε οὖν ὅτι βούλει); the preceding φάναι τὸν Ἐρυξίμαχον· ἀλλὰ τί ποιῶμεν; and the following εἰπεῖν τὸν Ἐρυξίμαχον make Eryximachus the addressee, not speaker. (ii) That turn identifies its addressee as one who came later (πρὶν σὲ εἰσελθεῖν), has not spoken (σὺ δ’ οὐκ εἴρηκας), and is to order Socrates (ἐπιτάξαι Σωκράτει), excluding ΣΩ., and names him ὦ Ἀλκιβιάδη @86923.
limits: The {quote}-marked Homeric line inside the span is a citation within the speaker's own words and is not a nested owner.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0178
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214b-214c
char_span:
  start_char: 87334
  end_char: 87688
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: befe86c5cc5b7658ab9629685db3ae5b60638d63da2ba0fa050f72ad7fdddf80
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἐρυξίμαχον.
    start_char: 87346
    end_char: 87368
limits: Establishes the owner of the instruction. The εἰπεῖν at 87457 and 87594 are infinitives inside the speech's own content, not reporting formulas.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0179
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214c-214d
char_span:
  start_char: 87693
  end_char: 88039
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 464d14e3d44f9f0756473665f74df46eee7755c0dc780bf842670e36228c4b42
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι, ὦ Ἐρυξίμαχε, τὸν Ἀλκιβιάδην
    start_char: 87699
    end_char: 87733
limits: Establishes the owner. The postponed accusative subject sits after the vocative addressee; ὦ Ἐρυξίμαχε names the addressee only.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0180
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214d
char_span:
  start_char: 88044
  end_char: 88059
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 0bb618dacd6334722286c17972f95fbaad3ccf8e15f7205bc6dfb454fd3840d8
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: φάναι τὸν Σωκράτη
    start_char: 88060
    end_char: 88077
limits: Establishes the owner of the two-word rebuke only.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0181
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214d
char_span:
  start_char: 88083
  end_char: 88195
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: a9fbc7a226d3173037e72b5398548854a007e05e3fe3277f54e62575382169ac
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀλκιβιάδην,
    start_char: 88099
    end_char: 88121
limits: Establishes the owner; μηδὲν λέγε is an imperative to the addressee, not a reporting formula.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0182
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214d
char_span:
  start_char: 88200
  end_char: 88268
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: af7fda464bd4e870e85313d02a127a6acad875e213a942b647ec9614a99f074c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΕΡΥ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἐρυξίμαχον,
    start_char: 88217
    end_char: 88238
limits: Establishes the owner only. Σωκράτη ἐπαίνεσον names the object of the imperative, not a speaker.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0183
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e
char_span:
  start_char: 88280
  end_char: 88390
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 789b8c6a68c6a75e25663769f485bb5b9fa9e87de6c56a8dc1542491509f4457
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀλκιβιάδην·
    start_char: 88292
    end_char: 88314
limits: Establishes the owner. ὦ Ἐρυξίμαχε names the addressee.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0184
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e
char_span:
  start_char: 88395
  end_char: 88483
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 2e91077deebcc1df0657eb2add412a5000ea346d7a7a6463812834db824200e9
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη,
    start_char: 88402
    end_char: 88420
limits: Establishes the owner. οὗτος is a vocative-force address to the interlocutor, not a subject.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0185
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e
char_span:
  start_char: 88488
  end_char: 88519
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: cad91d39e63185a21547d51695e0228c300df454afd2e0a137956b82cd5d9474
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΑΛΚ.
    - ΣΩ.
  context_span:
    start_char: 88280
    end_char: 88627
    text_sha256: ae3c47c70d8a008df41dbbff4c6004d45493d8b7de0047d5d4bf4c3faf0c5f40
  rationale: A bare {p} unit, no reporting verb; structural resolution from grammatical person against two named neighbours, not alternation. (i) The preceding turn is named ΣΩ. (οὗτος, φάναι τὸν Σωκράτη), putting second-person questions to one addressee (τί ἐν νῷ ἔχεις; …); this span answers the last in the first-person future (τἀληθῆ ἐρῶ), so its speaker is that addressee, not ΣΩ. (ii) Its ἀλλ’ ὅρα εἰ παρίης is answered by the next unit's first-person παρίημι and καὶ κελεύω λέγειν, the unit after is named ΑΛΚ. (εἰπεῖν τὸν Ἀλκιβιάδην), taking it up. No third party is named between the bounding formulas.
limits: The weakest attribution in this cohort. It establishes the owner only from the person-marking of the two named turns that bound it; if a third party could be inserted into the exchange the resolution would not hold, and no formula names this speaker.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0186
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e
char_span:
  start_char: 88524
  end_char: 88582
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: f50903f883663923cef62fc398e542492e6999c33612724c7ecf709ebbd36195
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners:
    - ΣΩ.
    - ΑΛΚ.
  context_span:
    start_char: 88395
    end_char: 88627
    text_sha256: 7662b5003f35b114a76515f215083d96164ec8e99f84782abdeda1d840435172
  rationale: The parenthetical φάναι at 88537 has no subject. From grammatical person and response adjacency here. This span answers the preceding unit's second-person ἀλλ’ ὅρα εἰ παρίης with the matching first-person παρίημι and repeats its τἀληθῆ verbatim as τά γε ἀληθῆ, so its speaker is that unit's addressee. Its own addressee is identified by the next unit, οὐκ ἂν φθάνοιμι, εἰπεῖν τὸν Ἀλκιβιάδην, which takes up καὶ κελεύω λέγειν in the first person; so this speaker is not Alcibiades. The other named turn bounding the exchange, οὗτος, φάναι τὸν Σωκράτη, is what this pair is answering.
limits: Establishes the owner of the permission only, from person marking across the bounding named formulas; no formula in this span names anyone.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0187
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 214e
char_span:
  start_char: 88587
  end_char: 88603
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 122f4a26f55e5a85bd324b9be61bfadc9547afa4cedb9fe3330a4c4f2d583801
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: closing_formula
    text: εἰπεῖν τὸν Ἀλκιβιάδην
    start_char: 88604
    end_char: 88625
limits: Establishes the owner of the last utterance before record voice_symposium_0125 begins at 88627.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0188
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 222c-222d
char_span:
  start_char: 104235
  end_char: 104781
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: f80812d238a99176d0bb08dc6315f9f6892449cedd07529dc56c8a00fb30267a
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Σωκράτη, Νήφειν μοι δοκεῖς, φάναι
    start_char: 104218
    end_char: 104259
limits: Establishes Socrates as the speaker. ὦ Ἀλκιβιάδη and ὦ φίλε Ἀγάθων inside the speech name addressees, not owners.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0189
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 222d-222e
char_span:
  start_char: 104810
  end_char: 105011
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 186ecab2603d31c88863221b9a106f505e7e310cad1e9e680ef27d2697b1f967
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: τὸν οὖν Ἀγάθωνα εἰπεῖν
    start_char: 104786
    end_char: 104808
limits: Establishes Agathon as the speaker; ὦ Σώκρατες names the addressee.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0190
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 222e
char_span:
  start_char: 105016
  end_char: 105074
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 23dc0505e350aa73856e23373b4d7c0b9e68f32b61745b306a8e7dae2cd9de1c
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη,
    start_char: 105025
    end_char: 105043
limits: Establishes the owner only.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0191
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 222e
char_span:
  start_char: 105079
  end_char: 105243
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 87ba60f323c0e9f2e04229d6cc88148cd69e48db363a3635061de2d37b18e11b
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: εἰπεῖν τὸν Ἀλκιβιάδην,
    start_char: 105086
    end_char: 105108
limits: Establishes the owner. ὦ Ζεῦ is an exclamatory vocative to a god and licenses no owner; ΖΕΥΣ. is not in play here.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0192
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 222e-223a
char_span:
  start_char: 105248
  end_char: 105564
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: cd8283d6210833a026feb086dceed7afe6c4839304d02c4a4a732c4b643c8588
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΣΩ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Σωκράτη.
    start_char: 105263
    end_char: 105281
limits: Establishes the owner only.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0193
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 223a
char_span:
  start_char: 105569
  end_char: 105704
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 7f0650dc942dba6c688325feb803e6bc98b748cfe0f99196df7ab7e156d16cbb
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΓΑ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀγάθωνα,
    start_char: 105578
    end_char: 105596
limits: Establishes the owner. Ἀλκιβιάδη is the vocative addressee.
review_status: accepted
```

```yaml
voice_id: voice_symposium_0194
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 223a
char_span:
  start_char: 105709
  end_char: 105892
source_path: raw/plato/greek/symposium.txt
source_sha256: 260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7
span_sha256: 90c18d8cdbaf0c5577ff0c63fff80dddc130f63637e8b7c27d136aa70bf2da58
voice_chain:
  - ΑΠΟΛ.
  - ΑΡΙΣΤΟΔ.
  - ΑΛΚ.
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: φάναι τὸν Ἀλκιβιάδην,
    start_char: 105723
    end_char: 105744
limits: Establishes the owner of the last utterance in the dialogue's reported conversation.
review_status: accepted
```
