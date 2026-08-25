# Phaedo reviewed-discourse adjudication, turn_phaedo_0031 (the Phaedo discourse attribution review step 6, second layer)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Scope**: `turn_phaedo_0031` only, `[75971, 105377)`, Stephanus 89a–102a.
**Status**: reviewed adjudication of the DISCOURSE layer. The adjudication is
recorded in `scripts/voices-2026-07/phaedo-0031-discourse.ts` and the builder
emits it as a candidate. **No record was accepted or compiled.** Phaedo remains
absent from `derived/plato/voices/cutovers.toml`, and `wiki/voices/phaedo.md` is
unchanged on disk.

The explicit-evidence layer of this turn is adjudicated separately in
`2026-07-26-phaedo-explicit-formula-adjudication.md`. Together the two layers
partition the turn; this note completes it.

## What was decided

The turn holds 114 `{p}` units. Every one of them now has a disposition, and
the partition is asserted by the builder rather than by this table:

| Disposition | Units |
|---|---|
| Resolved by explicit formula | 28 |
| Resolved by reviewed discourse | 82 |
| Genuinely ambiguous | 1 |
| Narration, no utterance transmitted | 1 |
| Joint speakers, schema cannot hold it | 2 |
| **Total** | **114** |

Owners, by authority shape. These are depth-2 records; the turn also carries one
depth-1 `printed_siglum` record for ΦΑΙΔ.

| Owner | Explicit | Reviewed discourse |
|---|---|---|
| ΣΩ. | 4 | 55 |
| ΣΙΜ. | 4 | 23 |
| ΚΕΒ. | 9 | 4 |
| ΦΑΙΔ. | 11 | 0 |

Phaedo's eleven are the narrator-participant turns at 89b–d, carried by
first-person formulas (`ἦν δ᾽ ἐγώ`, `ἔφην`) and recorded as
`person_marked_reporting_formula`. No unit was assigned to Phaedo by discourse
adjudication; where he speaks, the text marks it.

### The one genuine ambiguity

Unit 111, candidates `["ΚΕΒ.", "ΣΙΜ."]`. A bare `πάνυ γ᾽, ἔφη`. The third-person
singular excludes the narrator and excludes the joint configuration at 102a, so
two men remain. Addressee-continuity from the preceding question favours Cebes,
but the run carries a ΚΕΒ. anchor only on its left, nothing closes it on the
right, and 102a shows Simmias answering within this stretch. That is one
candidate distribution, over one record: `ΚΕΒ./ΣΙΜ. × 1`.

The reason is about the Greek, not about the extractor. "No naming formula in
this paragraph" would not have been accepted.

## Method

Two agents, passes **E** and **F**, adjudicated the 85 units that carry no
explicit formula. Each received the whole turn as a sequential packet of its own
`{p}` units, with the 28 explicit-formula units marked ANCHOR and their owners
fixed, and the 102a joint unit marked RULED. Each was blind to the other. Each
was instructed to work from the Greek alone — no translation, commentary,
edition apparatus, doctrine, style, register, or vocabulary — and to return, per
unit, a verdict, the locally plausible owners before resolution, the `{p}` bounds
of the context it rested on, and a structural rationale.

Sequential packets matter here. The plan's premise is that a locally bounded
exchange discriminates where a paragraph in isolation does not, and an
adjudicator given one paragraph at a time cannot test that premise.

### Agreement

| | units 0–56 | units 57–112 | total |
|---|---|---|---|
| adjudicated | 40 | 45 | 85 |
| **speaker disagreements** | **0** | **0** | **0** |
| candidate-set differences | 4 | 0 | 4 |
| context-extent differences | 0 | 45 | 45 |

Zero speaker-level disagreement across all 85 units, on top of zero across the
130 explicit-formula sites in the first layer.

Pass E's verdicts for units 57–112 were transmitted twice (the first send did not
land). The two transmissions are identical on every unit, which is a weak but
free consistency check and is recorded because it was available.

### Disagreements and their disposition

**Candidate sets, units 22, 23, 25, 27.** Pass E listed `["ΣΩ.", "ΦΑΙΔ."]`; pass
F listed `["ΣΩ.", "ΣΙΜ.", "ΚΕΒ."]`. No speaker is at stake — both resolve to
Socrates. Taken from E. The Phaedo discourse attribution review defines `candidate_owners` as the locally
plausible set and explicitly not the list of everyone present; these units sit
in the stretch bounded by Phaedo's own first-person anchors, where the live pair
is Socrates and the narrator. F's list is the room.

**Context extent, units 57–112.** The two passes chose different `{p}` bounds
for every unit in this range — a difference of how much surrounding text to cite,
not of what it shows. Taken from E throughout, so that each record's context and
its rationale come from the same pass and can be read against each other.
Resulting context widths: 102 characters at the narrowest, 1,999 median, 5,994
at the widest. The wide ones are the sustained Socrates–Simmias run at 36–83,
where the handoff is only visible across the whole exchange.

### Two rows that differ from what the passes returned

**Unit 26 at 91e — reclassified `unresolved` → `joint`.** Both passes returned
the verdict `unresolved`, and both rationales then said the opposite of an
ambiguity: `τοὺς μέν, ἐφάτην, τοὺς δ’ οὔ` at `[82220, 82254)` has `ἐφάτην` at
`[82234, 82240)`, a third-person **dual**, and the pair is addressed by second
plural at units 25 and 27 (`ἀποδέχεσθε`, `λέγετε`) and reported as `ἄμφω` with
dual `συνωμολογείτην` at unit 24. The Greek asserts two speakers for one
utterance.

This is the same schema gap the operator ruled on for 102a on 2026-07-26: emit no
depth-2 record, leave the characters with the printed turn siglum, do not record
it as ambiguity. That ruling named 102a, and applying it here was an extension by
the integrator rather than the operator's decision, so it was recorded as one
rather than folded in silently.

**Confirmed 2026-07-26 (operator): the ruling extends to 91e.** Both dual
utterances in this turn therefore carry no depth-2 record, and neither is counted
as a genuine ambiguity. Phaedo's published ambiguity count is 3, not 4.

**Unit 111 — downgraded resolved(ΚΕΒ.) → unresolved.** Both passes resolved it to
Cebes. Pass E volunteered, unprompted, that this was the weakest call in its
range and that it "would not defend hard", giving the reasons now recorded as the
unresolved reason. The Phaedo discourse attribution review's rule is that more than one genuinely plausible
candidate means `unresolved`, and a pass declining to defend its own resolution
is that condition being reported. Downgraded by the integrator on pass E's own
self-flag. The rationale text was restated as a reason for ambiguity, since the
record is no longer a resolution; nothing was added to it.

## Provenance of this data, stated plainly

The reconciled artifact written when the passes ran carried speakers for all 85
units but rationales and context bounds for only the first 40; the second half
had been merged from a speaker-only comparison, and its rationales were
placeholders. `reviewed_attribution` requires a real context span and a real
rationale, so that artifact could not have produced records for 45 of the 85
units.

Both passes' complete arrays were recovered verbatim from the session transcript
that carried them. The E-versus-F reconciliation was then recomputed from the
recovered arrays rather than inherited: the agreement table above is a fresh
comparison, not a restatement. The rationales in
`scripts/voices-2026-07/phaedo-0031-discourse.ts` are the adjudicating pass's own
words, unedited except for unit 111.

## Confirmations required by the Phaedo discourse attribution review step 6

- **No doctrine, philosophical content, style, register, vocabulary, English
  translation, or editor's label** was used to select any owner. Enforced as a
  test over the emitted rationales, and paired with a positive test that every
  rationale names at least one structural ground (anchor, vocative, addressee,
  grammatical person, dual, question/answer adjacency, exchange bounds, echo, or
  resumption). One rationale mentions alternation in order to say the passage
  breaks it; the word is deliberately not banned, because banning it would push
  that reasoning out of the record instead of out of the method.
- **Every context span is byte-verified**: it hashes to `text_sha256`, contains
  its own record, and stays inside `turn_phaedo_0031`.
- **Every candidate set** is 2 or 3 registered Phaedo sigla, without repeats, and
  contains the record's terminal owner.
- **Exactly one authority shape per resolved record.** No record carries both
  `evidence_refs` and `reviewed_attribution`; no unresolved record carries an
  attribution.
- **The turn is exhaustively partitioned.** Asserted by the builder, and tested:
  one record per `{p}` unit, no unit claimed twice, no depth-2 record covering
  either joint utterance.
- **`turn_phaedo_0027` is unchanged** by this pass: no record of it gained a
  reviewed attribution or a candidate set.

## What this does not establish

- It says nothing about `turn_phaedo_0027` or `turn_phaedo_0035`, whose
  discourse layers are not adjudicated. The Phaedo scope is not complete, and
  the builder's scope report says so on every run.
- It accepts nothing. Every record is `unreviewed`, and acceptance is a separate
  operator action.
- Four explicit-formula records in this turn (`[82710, …)`, `[91587, …)`,
  `[91716, …)`, `[103624, …)`) opened with Phaedo's narratorial frame, because
  the naming construction begins the `{p}` unit and no reviewed offset for the
  start of the direct speech existed. **Resolved 2026-07-26**, later the same
  day, in the shape turn 27 already used: the speech begins at 82742 (`ἀλλὰ
  ἀνάγκη σοι`), 91616 (`ἀλλ’ οὐδὲν ἔγωγε`), 91799 (`οὐ φαῦλον πρᾶγμα`) and
  103660 (`ἔγωγε`), and the records now start there, so each narratorial frame
  stays with the printed turn siglum. Every frame is a clause naming its own
  subject and closing at a comma; the builder now fails closed if a naming
  construction opens a unit without such an offset, in either turn.
- It confers no authority on any claim, observation, relation, or audio artifact.
