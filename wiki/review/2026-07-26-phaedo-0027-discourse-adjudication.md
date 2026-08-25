# Phaedo reviewed-discourse adjudication, turn_phaedo_0027 (the Phaedo discourse attribution review step 6, second layer)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Scope**: `turn_phaedo_0027` only, `[4681, 74605)`, Stephanus 59c–88c.
**Status**: reviewed adjudication of the DISCOURSE layer. The adjudication is
recorded in `scripts/voices-2026-07/phaedo-0027-discourse.ts` and the builder
emits it as a candidate. **No record was accepted or compiled.** Phaedo remains
absent from `derived/plato/voices/cutovers.toml`, and `wiki/voices/phaedo.md` is
unchanged on disk.

The explicit-evidence layer of this turn was reviewed earlier and is not
re-adjudicated here. It lives in the builder's own `NAMED` and `NARRATION_INTRO`
tables and keeps every byte of its `evidence_refs`.

This is the turn the Phaedo discourse attribution review was written about.

## What was decided

The turn holds 348 `{p}` units. Every one of them now has a disposition, and the
partition is asserted by the builder rather than by this table:

| Disposition | Units |
|---|---|
| Resolved by explicit formula | 60 |
| Resolved by reviewed discourse | 286 |
| Genuinely ambiguous | 0 |
| Narration, no utterance transmitted | 2 |
| **Total** | **348** |

Owners, by authority shape. These are depth-2 records; the turn also carries one
depth-1 `printed_siglum` record for ΦΑΙΔ. The explicit column includes the three
quoted utterances inside the opening narration block, which is a single `{p}`
unit and so is counted once above.

| Owner | Explicit | Reviewed discourse |
|---|---|---|
| ΣΩ. | 17 | 157 |
| ΣΙΜ. | 19 | 67 |
| ΚΕΒ. | 23 | 62 |
| ΚΡ. | 2 | 0 |
| ΘΥΡ. | 1 | 0 |
| ΞΑΝΘ. | 1 | 0 |

### The count that changes, and what it was a count of

The previous pass reported **288 of 350 records unresolved**. That pass resolved
a unit only when the unit's own paragraph carried a naming formula. Reviewed in
sequence, with the same prohibitions and no new evidence, the same Greek yields
**zero** genuinely ambiguous units in this turn.

The old number was not a measurement of Plato's Greek. It was a measurement of a
rule that never looked outside a paragraph and treated everyone in the room as
locally plausible. Both facts about it were visible in the file the whole time;
neither was visible in the count.

A zero is a strong claim, so the grounds are worth stating plainly. It does not
mean the turn is mechanically decidable. Every one of the 286 rows is a reviewed
adjudication, marked as such in the record, over a context that is cited and
hashed; a reader who rejects the adjudication has the bytes to argue from. What
it means is that two adjudicators working blind from the Greek alone found a
single surviving owner for every bare unit, and agreed on all 286.

## Method

Two agents, passes **A** and **B**, adjudicated the 286 units that carry no
explicit formula. The turn was cut into ten sequential segments — at ANCHOR
units where possible, and past a hard ceiling where a long anchor-free stretch
gave no anchor to cut at. Each segment packet carried its units in source order
with the explicit-formula units marked ANCHOR and their owners fixed, the two
narration blocks marked RULED, and a read-only lookback that always reaches back
to the last preceding ANCHOR, so a mid-run cut still shows the fixed speaker its
run descends from. Both passes received identical packets and were blind to each
other.

Each was instructed to work from the Greek alone — no translation, commentary,
edition apparatus, doctrine, style, register, or vocabulary — and to return, per
unit, a verdict, the locally plausible owners before resolution, the `{p}` bounds
of the context it rested on, and a structural rationale. Each was also asked to
mark, with the literal token `WEAK`, any resolution it would not defend, rather
than silently downgrading it: a flagged resolution is more useful than a
disclaimed one, and the disposition is the integrator's.

Sequential packets matter here for the same reason they did in turn 31. The
plan's premise is that a locally bounded exchange discriminates where a paragraph
in isolation does not, and an adjudicator given one paragraph at a time cannot
test that premise.

### Agreement

| | pass A | pass B |
|---|---|---|
| units returned | 286 | 286 |
| missing or extra | 0 | 0 |
| **verdict disagreements** | **0** | |
| **speaker disagreements** | **0** | |
| candidate-set differences | 64 | |
| context-extent differences | 191 | |

Zero speaker-level disagreement across all 286 units, on top of zero across turn
31's 85 and zero across the 130 explicit-formula sites in the first layer.

Neither pass returned a single `unresolved`, `narration`, or `joint` verdict for
this turn. The two ruled narration blocks were withheld from adjudication; no
third-person dual verb occurs inside turn 27, so the joint-speaker shape that
turn 31 hits twice does not arise here.

Rationales and context bounds are taken from pass A throughout, so each record's
context and its rationale come from the same pass and can be read against each
other. Resulting context widths: 40 characters at the narrowest, 628 median,
3,357 at the widest.

### Candidate sets are local, not the room

Five people speak in this turn. Pass A's candidate sets are exactly two owners
in 284 of 286 rows and three in the remaining two; the full cast appears as a
candidate set nowhere. Across all 286 rows Crito is named as a locally plausible
owner once and Phaedo twice. That is the plan's rule about global presence doing
its work: the men in the room are not the men who could have said this.

### Disagreements and their disposition

**Candidate sets, 64 rows.** No speaker is at stake in any of them — both passes
resolve every one to the same man. The passes differed over how wide to draw the
pre-resolution set, most often whether the third man present in a stretch stays
nominally live. Taken from A throughout.

**Context extent, 191 rows.** A difference of how much surrounding Greek to
cite, not of what it shows. Taken from A throughout.

**Units 111 and 117 — taken from pass B in full.** Pass A resolved both to
Socrates on the ground that the speaker was continuing his own chain of questions
(`ἐξ ἰσχυροτέρου … ἐκ βραδυτέρου` at 111; `τί δ’ αὖ` resuming at 117) without
naming the anchor that fixes who that speaker is. Pass B reached the same owner
and named it: the questioning slot is anchored ΣΩ. at 104 and 127, the answering
slot ΚΕΒ. at 106. B's row was taken whole — verdict, candidates, context and
rationale together — so the record stays internally coherent.

### The five self-flagged calls, and why all five stand

| unit | flagged by | disposition |
|---|---|---|
| 10 | A | kept, ΚΕΒ. |
| 291 | B | kept, ΚΕΒ. |
| 293 | B | kept, ΚΕΒ. |
| 295 | B | kept, ΚΕΒ. |
| 303 | A and B | kept, ΚΕΒ. |

All five are Cebes-or-Simmias, both passes resolved every one to Cebes, and the
flags concern the same question: whether the respondent's seat in a long run can
be read off the run's boundaries.

Unit 10 sits in an exchange closed at both ends by ΚΕΒ. anchors (8 and 14) whose
opening question carries the singular vocative `ὦ Κέβης`. The flag — that the
question also names Simmias, in `οὐκ ἀκηκόατε σύ τε καὶ Σιμμίας` — is real, and
the vocative and the anchors answer it.

Units 291, 293, 295 and 303 all sit in the stretch between the ΚΕΒ. anchors at
263 and 305. I checked its vocatives myself rather than taking either pass's word
for it: inside that stretch the respondent is addressed `ὦ Κέβης` at 296 twice
and at 304, jointly as `ὦ φίλε Κέβης τε καὶ Σιμμία` at 302, and never as Simmias
alone; Simmias is nowhere shown answering in it.

The contrast with turn 31's unit 111, the one record this lane has downgraded, is
the point. There the run carried a ΚΕΒ. anchor on its left only, nothing closed
it on the right, and Simmias was shown answering inside the same stretch. Here
the run is anchored on both sides to the same man, re-vocatived to him three
times inside, and the alternative candidate never speaks in it. The 31 case was
downgraded on a pass declining to defend its own call; these five passes state
their ground and it holds.

The `WEAK` token was stripped from the two rationales that reach the ledger; the
caveat sentence it introduced stays, because a reader is owed the reason a call
is contestable.

## Confirmations required by the Phaedo discourse attribution review step 6

- **No doctrine, philosophical content, style, register, vocabulary, English
  translation, or editor's label** was used to select any owner. Enforced as a
  test over the emitted rationales, paired with a positive test that every
  rationale names at least one structural ground. Two exemptions are documented
  in the test itself: `alternation`, because seven rationales use *alternative*
  in the sense of a disjunctive question's limb and one turn-taking claim would
  be better argued in the record than banned from it; and `register` as a verb
  (`the unit registers approval of 252`), which reports what the Greek does
  rather than how it sounds. The noun is still banned.
- **Every context span is byte-verified**: it hashes to `text_sha256`, contains
  its own record, and stays inside `turn_phaedo_0027`.
- **Every candidate set** is 2 or 3 registered Phaedo sigla, without repeats, and
  contains the record's terminal owner.
- **Exactly one authority shape per resolved record.** No record carries both
  `evidence_refs` and `reviewed_attribution`.
- **The turn is exhaustively partitioned.** Asserted by the builder, and tested:
  one record per `{p}` unit, no unit claimed twice.
- **The narrator owns no utterance inside the conversation he reports.** Tested.
  Phaedo speaks as a participant in turn 31, where first-person formulas mark it;
  in turn 27 he does not, and no discourse resolution invented it for him.
- **`turn_phaedo_0031` is unchanged** by this pass.

## Two speakers the registry had been hiding

The doorkeeper at 59e and Xanthippe at 60a were `unresolved` in this turn for a
reason about this repository rather than about the Greek: each is the nominative
subject of the reporting verb that transmits their utterance, and the registry
had no id for either until 2026-07-26. Both are now resolved.

Xanthippe's cue is an ordinary `named_reporting_formula`. The doorkeeper's
subject is `ὁ θυρωρός` — a definite role description, not a name — so his record
cites a new evidence kind, `role_reporting_formula`, added to the protocol in the
same change. The kind is deliberately separate from `named_reporting_formula` so
that no record claims the source printed a proper name it did not. Turn 35's
attendant of the Eleven (`ὁ τῶν ἕνδεκα ὑπηρέτης`, ΥΠΗΡ.) will use the same kind.

One further unit, at 65845, hands over to direct speech through the bare pronoun
`ὅς`. No named antecedent stands in the sentence, so it supplies no explicit
evidence and its previous `unresolved` record was correct on the evidence
available to that pass. It is now resolved by the discourse layer like any other
bare unit; the reviewed offset for the start of the direct speech is kept, so the
narratorial clause still stays with the printed turn speaker.

## What this does not establish

- It says nothing about `turn_phaedo_0035`, whose discourse layer is not
  adjudicated. The Phaedo scope is not complete, and the builder's scope report
  says so on every run.
- It accepts nothing. Every record is `unreviewed`, and acceptance is a separate
  operator action.
- It confers no authority on any claim, observation, relation, or audio artifact.
- A resolution recorded as `reviewed_attribution` is an adjudication, not a
  quotation. The whole point of keeping the two shapes distinct is that this
  turn's 286 new owners can be rejected wholesale without touching the 60 that
  rest on bytes.
