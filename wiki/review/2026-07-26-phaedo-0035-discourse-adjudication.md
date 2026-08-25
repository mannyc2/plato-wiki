# Phaedo reviewed-discourse adjudication, turn_phaedo_0035 (the Phaedo discourse attribution review step 6, second layer)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Scope**: `turn_phaedo_0035` only, `[105695, 143492)`, Stephanus 102a–118a.
**Status**: reviewed adjudication of the DISCOURSE layer. The adjudication is
recorded in `scripts/voices-2026-07/phaedo-0035-discourse.ts` and the builder
emits it as a candidate. **No record was accepted or compiled.** Phaedo remains
absent from `derived/plato/voices/cutovers.toml`, and `wiki/voices/phaedo.md` is
unchanged on disk.

The explicit-evidence layer of this turn was adjudicated separately in
`2026-07-26-phaedo-explicit-formula-adjudication.md`. Together the two layers
partition the turn; this note completes it, and with it the last of the three
Phaedo turns the census found to carry nested discourse.

## What was decided

The turn holds 133 `{p}` units. Every one of them now has a disposition, and the
partition is asserted by the builder rather than by this table:

| Disposition | Units |
|---|---|
| Resolved by explicit formula | 19 |
| Resolved by reviewed discourse | 109 |
| Genuinely ambiguous | 2 |
| Narration, no utterance transmitted | 3 |
| **Total** | **133** |

Owners, by authority shape. These are depth-2 records; the turn also carries one
depth-1 `printed_siglum` record for ΦΑΙΔ.

| Owner | Explicit | Reviewed discourse |
|---|---|---|
| ΣΩ. | 6 | 62 |
| ΚΕΒ. | 4 | 44 |
| ΣΙΜ. | 5 | 0 |
| ΚΡ. | 3 | 1 |
| ΥΠΗΡ. | 1 | 2 |

Simmias speaks five times here and the text names him every time. He gains no
discourse resolution in this turn, which is worth saying plainly: the reviewed
layer is not a mechanism for spreading utterances around the cast.

### The two genuine ambiguities

**Unit 9, at 103a.** Candidates `["ΣΙΜ.", "ΚΡ.", "ΑΠΟΛ."]`. The narrator says
outright that he cannot identify the speaker: `καί τις εἶπε τῶν παρόντων ἀκούσας
— ὅστις δ’ ἦν, οὐ σαφῶς μέμνημαι`. The third-person `εἶπε` beside that
first-person `μέμνημαι` excludes the narrator; the ΣΩ. anchor at unit 10 answers
the objection and so excludes Socrates, and distinguishes Cebes from the objector
by asking him separately about `ὧν ὅδε εἶπεν`. What remains is an unnamed
bystander. This is the cleanest possible unresolved record in the corpus: the
source itself asserts the ambiguity.

**Unit 100, at 107b.** Candidates `["ΣΙΜ.", "ΚΕΒ."]`. A bare `ἀληθῆ, ἔφη,
λέγεις`. See the disposition below — this one is a downgrade, not a pass result.

## Method

Two agents, passes **A** and **B**, adjudicated the 114 units that carry no
explicit formula, over five sequential segments cut by the same rule used for
turn 27: at ANCHOR units where the text offers one, past a hard ceiling where it
does not, with a read-only lookback that always reaches back to the last
preceding anchor. Both passes received identical packets and were blind to each
other.

The brief differed from turn 27's in one respect, and deliberately: it warned
that this turn's cast is wider than the argument preceding it, and that a
speaker should not be assumed to be one of the three arguers merely because they
did most of the talking earlier. It named no one and gave away no conclusion.

### Agreement

| | pass A | pass B |
|---|---|---|
| units returned | 114 | 114 |
| missing or extra | 0 | 0 |
| **verdict disagreements** | **0** | |
| **speaker disagreements** | **0** | |
| candidate-set differences | 38 | |
| context-extent differences | 88 | |

Zero disagreement of either kind. Both passes independently returned the same
111 resolutions, the same single `unresolved` (unit 9), and the same two
`narration` units (128 and 131) — including agreeing that the death scene's
`οὐδὲν ἔτι ἀπεκρίνατο` transmits no utterance to own.

Rationales and context bounds are taken from pass A throughout, except unit 84.
Resulting context widths: 37 characters at the narrowest, 1,049 median, 10,018 at
the widest — the wide ones are Socrates' long uninterrupted expositions of the
earth and the afterlife, where the handoff is only visible across the whole run.

### Candidate sets are local, not the room

Pass A's candidate sets are exactly two owners in 107 of 114 rows. Across the
whole turn Apollodorus is named as a locally plausible owner once — in the
unresolved bystander row, where he belongs — and never elsewhere, though he is
present and is narrated weeping at 117d.

### Disagreements and their disposition

**Candidate sets, 38 rows; context extent, 88 rows.** No speaker is at stake in
any of them. Taken from A throughout.

**Unit 84 — taken from pass B in full.** Pass A resolved it to Socrates on the
ground that the speaker was extending his own supposition from unit 82, without
naming the anchor that fixes who that speaker is. Pass B reached the same owner
and named it: the man addressed `ὦ Σώκρατες` at 79, who names Cebes at 80. B's
row was taken whole, so verdict, candidates, context and rationale stay from one
pass.

### Two rows that differ from what the passes returned

**Unit 100 at 107b — downgraded resolved(ΣΙΜ.) → unresolved.** Both passes
resolved it to Simmias, and both then volunteered that Cebes genuinely survives.
The ground for Simmias is real: ANCHOR 99 (ΣΩ.) addresses `ὦ Σιμμία` in the
singular one unit earlier, and Simmias is the next named speaker at ANCHOR 102.
The ground against is also real and is in the same sentence: 99's verbs turn
second **plural** — `ὑμῖν`, `διέλητε`, `ἀκολουθήσετε`, `ζητήσετε` — so the
question is put to two men, and Cebes spoke at 97. A bare assent to a question
addressed to two does not say which of them assented.

The Phaedo discourse attribution review's rule is that more than one genuinely plausible candidate means
`unresolved`. Two independent passes each reporting that condition is the
condition being met twice. Downgraded by the integrator; the unresolved reason
restates both passes' grounds, since the record is no longer a resolution.

**Unit 132 at 118a — reclassified resolved(ΦΑΙΔ.) → narration.** Both passes
resolved the dialogue's closing sentence — `ἥδε ἡ τελευτή, ὦ Ἐχέκρατες, τοῦ
ἑταίρου ἡμῖν ἐγένετο` — to Phaedo, and pass B volunteered the alternative
reading itself: if the narrator's frame address transmits no nested utterance,
the unit is narration.

It does not, and it is. The vocative addresses Echecrates, who is outside the
prison and outside the reported conversation; the first-person plurals are the
narrator's own. This is the same shape as Phaedo's closing report at the end of
turn 27, which is already a ruled narration block. Recording it as a depth-2
ΦΑΙΔ. utterance would also have produced a `ΦΑΙΔ. → ΦΑΙΔ.` chain repeat, which
the validator licenses only with an in-span first-person reporting formula, and
there is none. It carries no depth-2 record; its characters stay with the printed
turn siglum.

Both passes were right about the owner and the schema question was the
integrator's to answer.

## The attendant of the Eleven

`ΥΠΗΡ.` is a role, not a name, and the source never gives him one. He owns three
records here:

- one explicit, at 116c, where `ὁ τῶν ἕνδεκα ὑπηρέτης` is the nominative subject
  of `ἔφη`. It cites the `role_reporting_formula` kind, which exists so that no
  record claims the text printed a proper name it did not;
- two reviewed, at 117a-b, where both passes independently traced the definite
  anaphoric chain `ὁ ἄνθρωπος` — 119 `τριψάτω ὁ ἄνθρωπος`, 122 `τὸν ἄνθρωπον`,
  128 `οὗτος ὁ δοὺς τὸ φάρμακον` — back to that one cue, with the speaker's own
  gesture `ὤρεξε τὴν κύλικα τῷ Σωκράτει` excluding Socrates and `ὦ Σώκρατες`
  excluding him again in the second.

The earlier explicit review recorded a trap here that both of its passes refused
and both of these passes also avoided: at 116d `ὡς ἀστεῖος, ἔφη, ὁ ἄνθρωπος` has
`ὁ ἄνθρωπος` as the subject of the exclamation and of the finite verbs that
follow, not of `ἔφη`. Socrates is speaking *about* the attendant. Attributing it
to the attendant would invert the speaker.

## A discrepancy in the explicit layer, ruled

The explicit adjudication adopted the convention that *a formula span runs from
the first word of the narrative frame that carries the nominative through the
reporting verb*, and applied it in turn 31 by widening spans to include a leading
`καὶ`. Five of turn 35's reviewed spans — at 108378, 120930, 139188, 139591,
139933 — began at `ὁ` and left a preceding `καὶ ` outside, which the same
convention includes.

**Ruled 2026-07-26 (operator): widen the five to match the convention.** Their
starts are now 108374, 120926, 139184, 139587 and 139929, each verified by exact
slice. No speaker changes and no record span changes, because every one of those
five records begins at its reviewed speech-start offset rather than at its
formula. What changes is that the evidence-span convention is now uniform across
all three turns.

## Speech starts, and speech ends

Eight of the nineteen explicit rows are naming constructions that *frame* the
speech rather than interrupting it (`καὶ ὁ Σωκράτης ἀναβλέψας πρὸς αὐτόν, καὶ
σύ, ἔφη`). Each carries a reviewed offset for where the direct speech begins, so
the narratorial clause stays with the printed turn siglum. The builder enforces
the distinction textually rather than by assertion: a formula with no speech-start
offset must be preceded, inside its unit, by text ending in a comma — the point at
which the speech it is parenthetical to breaks off. The eleven interrupting rows
all satisfy that; none of the eight framing rows does.

Speech **ends** are a different matter and are not addressed here. Where a unit
resumes narration after the reported speech, the record still runs to the end of
the `{p}` unit unless a reviewed end offset exists, and turn 35 adds none. Turn 27
has one such offset out of fifteen. This is a known limit of all three turns, not
a new one.

## Confirmations required by the Phaedo discourse attribution review step 6

- **No doctrine, philosophical content, style, register, vocabulary, English
  translation, or editor's label** was used to select any owner. Enforced as a
  test over the emitted rationales and unresolved reasons, paired with a positive
  test that each names at least one structural ground. The same `register`
  exemption as turn 27 applies and for a different innocent reason: here the word
  appears as "registered owner", meaning present in
  `derived/plato/voices/sigla.toml`.
- **Every context span is byte-verified**: it hashes to `text_sha256`, contains
  its own record, and stays inside `turn_phaedo_0035`.
- **Every candidate set** is 2 or 3 registered Phaedo sigla, without repeats, and
  contains the record's terminal owner.
- **Exactly one authority shape per resolved record.**
- **The turn is exhaustively partitioned.** Asserted by the builder against both
  the discourse rows and a separately held narration list, and tested: one record
  per `{p}` unit, no unit claimed twice.
- **The role-based registry extension was reviewed.** Both passes reached ΥΠΗΡ.
  independently, by grammar and coreference, without being told the role existed.

## What this does not establish

- It accepts nothing. Every record is `unreviewed`, and acceptance is a separate
  operator action.
- It confers no authority on any claim, observation, relation, or audio artifact.
- The Phaedo scope is now complete in the sense that all three turns with nested
  discourse are built and adjudicated. It is not complete in the sense of being
  accepted, compiled into an active join, or carried into any downstream
  consumer.
