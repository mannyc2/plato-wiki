# Protagoras voice ledger — acceptance of the complete reported-turn cohort (the corpus reported-turn completion campaign wave 1)

**Date**: 2026-08-04
**Source**: `raw/plato/greek/protagoras.txt`, sha256
`f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b`
**Scope**: the 52 outer turns `wiki/reported-turn-scopes.json` marks `required`
for this dialogue, frozen against
`wiki/review/2026-07-26-protagoras-reported-turn-scope-census.md`. Both the Greek
source hash and the turn-index hash recorded in that census still match the
current files, and the ledger speaks about exactly those 52 turns.
**Action**: all 473 records in `wiki/voices/protagoras.md` are `accepted`, as 52
atomic outer-turn cohorts. This receipt is also the provenance for registering
`ΕΠΙΜ.`, `ΕΡΜΗΣ.` and `ΖΕΥΣ.` in `derived/plato/voices/sigla.toml`.

**This receipt was amended on 2026-08-04, after the acceptance it originally
recorded.** 445 records moved `unreviewed` → `accepted` in the first change set;
22 further records (`0472`–`0493`) were added and accepted in a second, under the
staged-direct-speech ruling recorded in "The staged voices, ruled" below.

**It was amended again on 2026-08-09**, after an independent review of the staged
spans returned. Six records (`0494`–`0499`) were added, `0165` was corrected from
depth 2 to depth 3, `0166` was extended backward to parent it, six depth-2 parents
were resolved, and one prose offset was repaired. The cohort is now **473
records**. See "Independent review addendum, 2026-08-09" below for the full
finding-by-finding adjudication.

Every count, id range and hash in this receipt describes the current state unless
labelled otherwise. Where a figure was true only of the 445-record or 467-record
state it is marked as such rather than silently rewritten.

## What is being accepted

| | count | (was, 2026-08-04) |
|---|---:|---:|
| records | 473 | 467 |
| outer turns | 52 | 52 |
| depth 1 | 52 | 52 |
| depth 2 | 387 | 388 |
| depth 3 | 34 | 27 |
| resolved by cited bytes | 289 | 289 |
| resolved by `reviewed_attribution` | 48 | 42 |
| `unresolved` | 136 | 136 |

Owners of the 337 resolved records: ΣΩ. 196, ΠΡΩΤ. 98, ΙΠΠΟΚΡ. 21, ΠΡΟΔ. 5,
ΑΛΚ. 3, ΙΠ. 3, ΚΑΛ. 3, ΘΥΡ. 2, ΕΠΙΜ. 2, ΖΕΥΣ. 2, ΕΡΜΗΣ. 1, ΚΡΙ. 1. The six that
moved on 2026-08-09 are all ΣΩ.; no other owner's count changed.

The unresolved total is unchanged at 136 by arithmetic, not by coincidence: six
depth-2 records became resolved, six new depth-3 records are unresolved, and
`0165` stayed unresolved while moving from depth 2 to depth 3.

Evidence kinds across the 289 explicitly licensed records:
`person_marked_reporting_formula` 193, `named_reporting_formula` 86,
`anchored_dialogue_turn` 87, `printed_siglum` 52, `formula_bounded_continuation`
30, `role_reporting_formula` 20, `closing_formula` 12, and
`anaphoric_reporting_formula` 5 — **484 refs**, plus the one
`named_reporting_formula` added at `0476`, for **485** in all.

**Correcting this receipt's own first census.** As first written it reported 88
`named_reporting_formula`, 32 `formula_bounded_continuation` and 8
`closing_formula` over "485 evidence refs", and the verification section below
claimed all 485 were byte-checked. Recounted mechanically from the 445-record
ledger the figures were 85, 30 and 12, over **484** refs. The distribution it
printed was the pre-adjudication one — it did not carry through the record `0140`
re-licensing and the `0379` deletion this same receipt describes. The byte-check
itself is not in doubt; its denominator was.

**136 of 473 records are accepted as `unresolved`.** That is the review's
finding. Accepting an unresolved record accepts the claim that the Greek at
those offsets licenses no owner; it assigns the span to nobody, and in
particular not to the printed turn siglum.

## Review passes behind this decision

1. **Primary source review** of the entire required Greek scope, which produced
   the current record set and repaired the worst error in the prior candidate:
   the turn-0071 respan, where 629 characters of Socrates' own recap prose had
   been attributed to Protagoras across three records, plus four records that
   attributed narration to a speaker — in one case narration explicitly saying
   Protagoras did **not** speak (`οὐκέτι … οὔτ’ ἐπινεῦσαι ἠθέλησεν ἐσίγα τε`).
2. **Targeted independent cross-review**, which judged every site from the Greek
   before comparing, ran an independent implementation of the protocol's
   mechanical invariants, took a complete census (not a sample) of covered
   source gaps and of the deleted `limits` strings, and sampled 28 unchanged
   records. It found one substantive over-resolution in 443 records and no
   systematic defect, and explicitly did not require a second complete reread.
3. **Adjudication at acceptance** (this receipt), which restored the stable
   identities, resolved the three myth speakers from the Greek, cut the
   `protagoras-great-speech` packet, and re-verified every changed record.

## What changed at adjudication

### 1. Stable `voice_id` identities were restored, not re-baselined

The primary pass had renumbered `voice_id` as an array position. Measured
mechanically: of 437 ids present in both `HEAD` and that candidate, 115 denoted
a different span and 8 sat in a different outer turn, each having slid forward
exactly one turn. One was an outright collision rather than a cascade artifact —
the record at 94060–96073 carried id `0382`, which at `HEAD` belonged to a
different record entirely at 93761–94055.

The renumbering was **repaired, not blessed**. No reusable renumbering framework
was created. Records were matched to their historical identities on dialogue,
outer turn, overlapping source span and semantic identity — never on list
position and never on the numeric id.

Result, mechanically re-verified after the repair (the 445-record state; the 22
records added later are `0472`–`0493` and are covered under "The staged voices,
ruled"):

| | |
|---|---:|
| records | 445 |
| ids shared with `HEAD` | 437 |
| of those, byte-identical `char_span` | 387 |
| of those, span **disjoint** from the historical span | **0** |
| of those, sitting in a **different** outer turn | **0** |
| fresh ids, all strictly above the historical maximum 0463 | 0464–0471 |
| permanent gaps | 26 |

The 26 gaps are 0142, 0177, 0202, 0219, 0241, 0251, 0254, 0265, 0279, 0281,
0311, 0314, 0352, 0379, 0384, 0390, 0396, 0398, 0399, 0404, 0408, 0409, 0410,
0411, 0412, 0455 — the 10 deletions plus the 16 records absorbed by 11 merges,
and nothing else.

Six fresh ids were allocated at 0464–0469 rather than left at the 0500–0505
the candidate used, and two more (0470, 0471) were allocated for the myth-speech
split described below. Both are protocol-legal, since numeric suffixes need not be
consecutive; 0500–0505 was rejected because it leaves a 36-wide hole at
0464–0499 that no deletion explains and that a reader cannot distinguish from
36 lost records. (That hole was subsequently filled from below in the ordinary
way: `0472`–`0493` on 2026-08-04 and `0494`–`0499` on 2026-08-09.)

Where a merge had to choose which predecessor survives, the id kept is the one
whose attribution claim the merged record still carries — the predecessor whose
`evidence_refs` offsets the merged record reproduces byte for byte. That rule is
unique wherever it applies (ten of the eleven merges) and it is what prevents an
id that asserted no owner from silently becoming a resolved attribution. The
eleventh merge, the turn-0071 respan, carries no such anchor; it keeps `0407`
because the merged record preserves `HEAD` 0407's `start_char` 102697 exactly
and its own rationale states it absorbs the fragment that formerly began at
94355. Giving that record the id of its largest predecessor `0410` was rejected
outright: `0410`'s terminal owner is ΠΡΩΤ. and the merged record's is ΣΩ., so it
would have recycled an id onto a different speaker.

**That convention is now the protocol's, not this receipt's.** It is written up
as "Which ID survives a merge" under "Stable, gapped IDs" in
`docs/voices-protocol.md`, in the four numbered clauses the eleven merges here
actually followed. Nothing in the Protagoras or Euthydemus ledgers was changed to
illustrate it; the rule was extracted from what both already did.

One deletion deserves a note. `HEAD` `0379` had a span equal to a reporting
formula itself — 93376–93393 is `ἔφη ὁ Πρωταγόρας.`, the narrator's attribution
tag, recorded as though Protagoras spoke it. It is deleted, and the same bytes
now serve as a `closing_formula` on record `0378`, the utterance the formula
actually closes, which `HEAD` had left unresolved.

### 2. The `protagoras-great-speech` bounded speech packet was cut

The ledger declared one `bounded_speech_packet`, asserting that ΠΡΩΤ. holds the
floor across 23602–39351, and thirteen records (`0128`–`0140`) took their
authority from it.

**That assertion is false, and the validator's own `packet_intruding_voice`
check says so.** Three voices other than ΠΡΩΤ. are reported speaking inside
those bytes, each by a named formula with a nominative subject:

| offset | Greek | speaker |
|---|---|---|
| 24005 | `Προμηθέα δὲ παραιτεῖται Ἐπιμηθεὺς αὐτὸς νεῖμαι,` … `ἔφη` at 24080 | Epimetheus |
| 27346 | `ἐρωτᾷ οὖν Ἑρμῆς Δία` | Hermes |
| 27662 | `ἔφη ὁ Ζεύς` | Zeus |

These are the myth speakers registered in the same change set. They are genuine
nested reported speech, not regex false positives, so no adjustment to the
matcher would make the packet true.

**The packet was removed rather than repaired.** The only contract that would
have preserved it is "no voice speaks inside except the owner or a voice nested
below the owner", and it cannot be implemented truthfully: the check would have
to consult the very records the packet is supposed to license, which is
circular, and any record could then defeat the check by claiming nesting. That
is a dialogue-specific exception wearing a general rule, and it would disable
the check that had already caught a forged widening of this same packet from
15,749 to 82,930 characters. Building a larger framework to save thirteen
references was rejected on the same ground.

Nothing was lost. Each of the thirteen records already carried its own
byte-verified `formula_bounded_continuation` pair — the speech opening at
23602–23661 (`δοκεῖ τοίνυν μοι, ἔφη, χαριέστερον εἶναι μῦθον ὑμῖν λέγειν.`) and
the naming close at 39351–39420 (`Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα
ἐπιδειξάμενος ἀπεπαύσατο τοῦ λόγου`) — which is the kind the protocol provides
for exactly this structure: one voice continuing across an interruption, here
the edition's reprinted `ΣΩ.` at its own chunk boundaries. Removing the packet
therefore leaves each record standing on Greek it cites itself, and both
ledgers validate with zero issues afterwards.

Record `0140` (38933–39346) was re-licensed at the same time. Its span ends five
characters before the naming close, inside the 200-character `closing_formula`
bound, so it now cites that formula directly: it is the only one of the thirteen
that a naming formula licenses on its own, and explicit text outranks a bracket.
No other of the thirteen has comparable record-local naming evidence.

**The continuation licence was challenged, and is being accepted deliberately.**
A third reviewer argued that the shape is untruthful on the thirteen, on three
grounds: the left bracket contains a bare `ἔφη` and names nobody; the two
brackets are different formulas rather than one formula repeated; and the
brackets sit up to 15,331 characters apart across eight printed turns, where the
ledger's three other uses of the kind are local. It proposed converting the
thirteen to `anchored_dialogue_turn` anchored on `ἐπεὶ δὲ πάντες
συνεκαθεζόμεθα, ὁ Πρωταγόρας` at 18100–18143 and the same naming close, with two
merges to give cue-less records an in-span cue, leaving record `0129` — the
2,076-character Prometheus narrative, which contains no reporting verb, no
vocative and no pronoun — `unresolved`.

That was considered and not taken. The first ground does not distinguish this
use from the ledger's own precedent: record `0113`'s left bracket is
`ὀρθῶς, ἔφη, προμηθῇ, ὦ Σώκρατες`, which is likewise a bare `ἔφη` plus a
vocative and names nobody. The third ground is what the kind exists to permit —
it is deliberately exempt from the 600-character lookback, and the interruption
being crossed here is real and is stated in the ledger header: this edition
reprints `ΣΩ.` at eight chunk boundaries inside one continuous speech. And
`anchored_dialogue_turn` asserts that the span sits inside a bounded **two-party
exchange**, which is a worse description of a 15,700-character monologue than
"the same voice continues across an interruption" is. Every one of the thirteen
cites the naming close, so the owner-naming evidence is on each record either
way.

Recorded plainly, because it is the honest cost of the shape chosen: nothing
anywhere inside 23602–39351 names Protagoras, and four of the thirteen
(`0128`, `0129`, `0132`, `0133`, 4,391 characters between them) contain no
in-span grammatical cue at all. They rest entirely on the bracket.

Recorded as a finding when this receipt was first written: the packet mechanism
is an undocumented schema extension. Neither `bounded_speech_packet` nor the
`floor_taking_boundary` evidence kind appears anywhere in
`docs/voices-protocol.md`, contrary to that document's own change-control rule.

**That decision has since been taken: the mechanism is deleted.** Operator
ruling, 2026-08-04, as a hard cutover with no compatibility parsing. Removed from
`packages/harness/src/wiki/voices-ledger.ts` (the `bounded_speech_packet` record
field, the `VoiceBoundedSpeechPacket` and `VoicePacketEvidence` types,
`isPacketBlock`, `parseBoundedSpeechPackets`),
`packages/harness/src/wiki/voices-validator.ts` (thirteen `packet_*` issue codes,
the allowed-field entry, `validateBoundedSpeechPackets`,
`validatePacketReferences`, `PACKET_CLOSE_KINDS`, `PACKET_REPORTING_VERB`,
`otherVoiceReportedInside` and the `namesBearer`/`stripAccents` helpers that
existed only for them), `packages/harness/src/derived/voices.ts` (the
`bounded_speech_packet` optional column, the `packets[N]:` table, the
`VoiceIndexPacket` type and its parse, and the packet variant of
`resolution_basis`), and `packages/harness/src/completeness.ts`.
`voices-packets.test.ts` held nothing but packet tests and is deleted; the packet
blocks in `voices-validator.test.ts` and `completeness.test.ts` went with them.

Two things this cost, stated plainly. The forgery test that caught the widening
of this very packet from 15,749 to 82,930 characters is gone with the mechanism
it tested — there is no longer a widenable bracket for it to guard. And
`namesBearer`, the accent-aware "does this formula name its owner" check whose
first version `πρῶτον`/`ΠΡΩΤ.` walked straight through, had no non-packet caller
and is gone too; if a future kind needs that test it must be rebuilt with its
adversarial cases, which are recorded above and in this file's history.

Verified inert: all four compiled voice indexes — euthydemus, phaedo,
protagoras, symposium — recompile byte-identically after the removal, because
both packet artifacts were conditional and the corpus declares no packets. The
word "packet" now survives in this lane only in historical review prose and in
the unrelated reviewer-disagreement packets of the Symposium re-review.

### 3. The three myth speakers were resolved, and the registry says why

`ΕΠΙΜ.`, `ΕΡΜΗΣ.` and `ΖΕΥΣ.` are registered for protagoras in
`derived/plato/voices/sigla.toml`, and five records — the only depth-3 records
in the dialogue — are resolved to `["ΣΩ.", "ΠΡΩΤ.", "<siglum>"]`:

| record | span | owner | cited formula | offsets | relation |
|---|---|---|---|---|---|
| `0465` | 24053–24079 | ΕΠΙΜ. | `Προμηθέα δὲ παραιτεῖται Ἐπιμηθεὺς αὐτὸς νεῖμαι,` | 24005–24052 | cue, before |
| `0470` | 24085–24104 | ΕΠΙΜ. | the same clause | 24005–24052 | cue, before |
| `0466` | 27413–27640 | ΕΡΜΗΣ. | `ἐρωτᾷ οὖν Ἑρμῆς Δία` | 27346–27365 | cue, before |
| `0467` | 27641–27661 | ΖΕΥΣ. | `ἔφη ὁ Ζεύς` | 27662–27672 | `closing_formula`, after |
| `0471` | 27674–27874 | ΖΕΥΣ. | `ἔφη ὁ Ζεύς` | 27662–27672 | cue, before |

Each name is nominative and is the grammatical subject of the construction that
reports its own bounded, `{q}`-marked utterance. `0465` and `0470` nest strictly
inside the depth-2 ΠΡΩΤ. record `0128` (23666–24312); `0466`, `0467` and `0471`
nest strictly inside `0130` (26402–28136). None of the five overlaps another.

For `0465` and `0470` the formula that reports the words is the bare
parenthetical `ἔφη` at 24080, which expresses no subject; the cited clause
supplies it, `Ἐπιμηθεύς` being nominative, singular and third person, agreeing
with both `παραιτεῖται` and `ἔφη`, and the only nominative available —
`Προμηθέα` is accusative, the person asked.

**Why Epimetheus and Zeus each get two records.** Both utterances are
interrupted by a parenthetical inquit, and the edition itself closes and
reopens the quotation around it: ` ἔφη, ` at 24079–24085 and ` ἔφη ὁ Ζεύς, ` at
27661–27674 stand outside every `{q}`. Those bytes are Protagoras narrating,
not the god speaking, and the depth-2 parent picks them up, which is the
correct owner.

This is a **deliberate local departure** from the ledger's general habit, and it
is stated here so it reads as a ruling rather than an accident. Elsewhere in
this ledger a record routinely spans several `{q}` segments together with the
narration between them — record `0054` covers two, `0292` covers ten — and 183
resolved records contain an `ἔφη` inside their span. In all of those the
narration and the record share one owner, so nothing is misattributed. Here they
do not, and in the Zeus case the swallowed bytes were the record's **own cited
cue**: a single record over 27641–27874 would have cited as evidence for its
owner bytes it simultaneously claimed that owner spoke. Where the source marks
the boundary and the owners differ, the marks decide.

Prometheus owns no bounded direct speech anywhere: all seven occurrences of
`Προμηθ-` were checked — 23931 and 25951 dative, 24005 and 26324 accusative,
25388 and 25641 nominative but subjects of narrated action (`ἔρχεται`,
`κλέπτει`), and 108293 inside Socrates' own closing speech about the myth.

**The staged voices remain unregistered**, and the line that separates them is
NAMED versus INDEFINITE, not certain versus hypothetical. That is why the
symposium's `ΗΦΑΙ.` is registered on a counterfactual optative
(`εἰ … ἔροιτο`): Hephaestus is named. The collective `οἱ ἄνθρωποι`, the
`ὑβριστής`, the `τις` and the `ὁ ἐρόμενος` of the staged interrogation at
353c–357e single out no individual, and registering a collective would invent a
speaker, which the `οἱ σοφοί φασιν` row of `docs/voices-protocol.md` forbids.

**They no longer remain unrecorded.** As first written this paragraph said
"unregistered and unrecorded" and treated the two as one decision. They are not:
registration governs whether a staged owner may be RESOLVED, and says nothing
about whether the span is recorded at all. See "The staged voices, ruled" below,
which supersedes the deferral this receipt originally recorded.

**Correcting the registry's own provenance.** The `sigla.toml` entry as first
drafted claimed an operator ruling of 2026-08-03, a third byte-for-byte
verification "at adjudication", and a review note at
`wiki/review/2026-08-03-protagoras-myth-speaker-sigla.md`. **None of those
happened**: no such ruling was issued, no third verification took place, and no
such file was ever written. It also asserted that "all five occurrences" of
Prometheus had been checked, when there are seven. Those claims have been
replaced with what actually happened — two independent reviews recommending the
registration, and one source adjudication at acceptance — and the entry now
points at this receipt.

### 4. Items carried over from the cross-review, verified in place

Each of these was already applied in the candidate; this pass re-verified it
against the Greek rather than taking it on trust.

- **Record `0392`** (`ἀλλ’ ἀνάγκη.` at 99042–99054) is `unresolved`, as it must
  be. It sits in an answer slot — the preceding span ends in `;`, bare em dashes
  bound it on both sides, and `ἀλλά` with bare `ἀνάγκη` is the answering idiom,
  which points away from the questioner. The parallel answer at 98236 is
  resolvable only because `ὡμολόγει` follows it; here nothing follows, and the
  absence of evidence is not evidence for the narrator. This was the one
  substantive over-resolution the cross-review found in 443 records.
- **Record `0060`** (2337–2791) retains its `310c` `limits` string, which records
  why the span starts at 2337 and not earlier and why the record is anaphoric
  rather than anchored — the one boundary fact the ledger-wide `limits` sweep
  would otherwise have destroyed. It is byte-identical to its historical value.
  The other information that sweep would have lost, that this edition reprints
  `ΣΩ.` at every page chunk of one continuous narration, is stated once in the
  ledger header instead of 52 times in the records.
- **The seven `exchange_close` anchors** at the 93376 formula cite 93376–93392,
  `ἔφη ὁ Πρωταγόρας`. The earlier citation ran to 93398, taking in `.—ἄλλο` —
  the sentence terminator and the first word of the next utterance — so as cited
  it did not delimit a formula. All seven now match the offsets record `0378`
  cites for the same bytes.
- **The bare-space argument** — "nowhere else in turns 0053–0074 is a depth-2
  boundary a bare space, which alone marks the splits as artificial" — is false
  as stated: the ledger itself has three such boundaries, at 77789, 84023 and
  103570. It survives nowhere in the ledger and is not repeated here. The
  turn-0071 respan it was offered in support of is independently correct on the
  grammatical evidence.
- **Corrected counts**, so the wrong ones are not carried forward: the non-empty
  source gaps number **68**, not 73; the `ἔφη` in question sits at **77094**, not
  77104; the gap near the 93376 anchor is **93375–93394**, not 93375–93399; and
  the "16 records" figure belongs to the 108510 anchor, not to 93376, which has
  eight refs.

## Verification of this acceptance, and three further corrections

An independent read-only pass re-derived this receipt's claims from the files
rather than from it, re-verifying **all 445 records** — span hashes, all 484
evidence refs byte-checked at their own offsets, all 42 adjudication context
hashes, depth/chain arithmetic, chain-repeat rules, authority-shape exclusivity,
same-depth non-overlap, nesting and chain-prefix consistency, and the anaphoric
antecedents — with zero failures, plus depth-1 tiling of all 52 required turns
with no hole, no overlap, and `voice_chain[0]` byte-equal to the printed speaker
in every one. Every census figure above reproduces from its own parse. It
confirmed the id result independently (445 records, 437 shared with `HEAD`, 0
disjoint, 0 cross-turn, the same 26 gaps, fresh ids 0464–0471), and reported that
`voice_chain` is **not** usable as a matching key, since 34 records legitimately
changed chain when their resolution changed.

It found three defects, all now fixed.

### 6. The header's claim about the reprinted `ΣΩ.` was false as written

The header said records "whose spans cross one do not thereby cross a handoff."
**No record's span contains a reprinted `ΣΩ.` — 0 of 473, and structurally none
can**, because a printed siglum opens a new outer turn and every record nests
inside one turn. What is true, and what the three cited records actually rest on,
is that each **begins immediately after** one: `0318` starts 5 characters after
the `ΣΩ.` at 81549, `0385` 5 after 96073, `0407` 9 after 102688. The header now
says that. The "58 times" count and the mid-sentence break at 24312 both verify
exactly.

### 7. Four anchors cited a plural as a speaker-naming formula

Records `0117`, `0123`, `0126` and `0127` cited
`πολλοὶ οὖν αὐτῷ ὑπέλαβον τῶν παρακαθημένων ὁποτέρως βούλοιτο οὕτως διεξιέναι`
(23524–23600) as a `named_reporting_formula` exchange anchor — three as
`exchange_close`, one as `exchange_open`. The bytes are exact, but the clause
names nobody: `πολλοὶ … τῶν παρακαθημένων` is a genuine plural, which
`docs/voices-protocol.md` says "has no single owner", and the role table requires
an anchor of a kind that names a speaker. The label did work the Greek does not
support.

All four now cite the naming pair that three of them already half-used: the
`exchange_open` `ἐπεὶ δὲ πάντες συνεκαθεζόμεθα, ὁ Πρωταγόρας` at 18100–18143 and
the `exchange_close` `Πρωταγόρας μὲν τοσαῦτα καὶ τοιαῦτα ἐπιδειξάμενος
ἀπεπαύσατο τοῦ λόγου` at 39351–39420. Both are byte-verified and both name
Protagoras outright. The bound they assert, 18100–39420, was independently
checked to be genuinely two-party: across it the only reporting verbs are
first-person (the narrator) or third-person beside a named `Πρωταγόρας`, no
`ἔφην` / `ἦν δ’ ἐγώ` / `εἶπον` / `ἦ δ’ ὅς` occurs anywhere in 23602–39351, and
`Σωκράτ-` appears there only as the vocative `ὦ Σώκρατες`, i.e. as addressee.

Recorded rather than pursued: for `0117` and `0123` a **tighter** naming close
exists nearer their spans, at the `Πρωταγόρας … εἶπεν` near 18546 and the
`Πρωταγόρας` beside `ἔφη` at 19898. The exchange-anchor rule constrains side and
kind but deliberately not proximity, so the wider close is valid; a later pass
that wants the narrowest defensible bound has the offsets here.

### 8. Two false offsets in the `ΘΥΡ.` registry entry

Pre-existing since 2026-08-01 and untouched by this pass, but wrong in a file
this change set edits, so corrected: `εἶπεν` sits at **11517**, not 11521 (11521
is its end offset, the only end offset among that entry's starts); and the
door-opening clause `μόγις οὖν ποτε ἡμῖν ἅνθρωπος ἀνέῳξεν τὴν θύραν` begins at
**11739**, not 11759, which lands mid-phrase on `ἅνθρωπος`. Everything else in
that entry verifies, including `θυρωρ-` and `εὐνοῦχ-` occurring exactly once each.

### The staged voices, ruled

Operator ruling, 2026-08-04, superseding the deferral this receipt originally
recorded. The rule now in `docs/voices-protocol.md` under "Staged direct speech":

> Bounded direct speech attributed below the printed speaker remains in scope
> even when hypothetical or counterfactual. A registered, specifically
> identified owner may be resolved. An indefinite or collective staged owner is
> not registered or invented, but its bounded speech receives an `unresolved`
> child record. Role evidence may resolve only one specific individual;
> inability to resolve a plural is not permission to assign its words silently
> to the printed speaker.

**Why the prior ground does not survive contact with the Greek.** The two
earlier adjudications rested on mood: every introducing construction at
353c–357e is optative with `ἄν`, future, or under an `ἐάν`/`ἄν` protasis, so
"nothing is narrated as having been said." Checked against the source, that test
does not hold up in either direction:

- It is not what this receipt's own registry note says. `ΗΦΑΙ.` is registered on
  `εἰ … ἔροιτο`, a counterfactual optative. If mood removed staged speech from
  scope, that entry could not exist.
- The Crito Laws — the protocol's own model of an in-scope prosopopoeia — are
  introduced by `ἐλθόντες οἱ νόμοι … ἐπιστάντες ἔροιτο` (crito 14863) and
  sustained by `εἴποιεν ἄν` and `φαῖεν ἄν`. The model case is hypothetical
  throughout.
- Inside 353c–357e the mood is not even uniform: `φήσει`, `ἐρήσεται` and `ἐρεῖ`
  at 95118–95970 are plain futures, and `ἤρεσθε` at 99590 is an aorist
  indicative — "you asked us", second person plural, addressed to the many. The
  premise that nothing there is narrated as said is false on its own terms.

**What the mood argument was doing.** Not identifying an owner — deciding
whether to write a record. And its default was the printed speaker: thirteen
`{q}` stretches sat inside `["ΣΩ.", "ΣΩ."]` records and compiled to Socrates,
including `ἦ γελοῖον λέγετε πρᾶγμα …` at 95414, which addresses its hearers as
`λέγετε` and is answered by `φήσομεν` — words Socrates is answering, not saying.

**The rule was applied to every affected construction, not to thirteen.** A
complete census of the 65 `{q}` spans in `raw/plato/greek/protagoras.txt`, each
mapped to the deepest record containing it, found **22** whose staged owner
differs from the owner of the record that would otherwise hold them — nine more
than the thirteen at 353c–357e. Applying the rule to thirteen and not to nine
identical constructions would have reproduced the inconsistency being fixed.
Records `0472`–`0493` were added, all `accepted`, all fresh ids strictly above
the previous maximum `0471`, no parent split and no surviving record renumbered:

| record | span | parent | Stephanus | staged owner | introducing Greek (offsets) |
|---|---|---|---|---|---|
| `0472` | 4361–4448 | `0067` | 311b–311c | indefinite `τις` | `εἴ τίς σε ἤρετο·` 4344–4360 |
| `0473` | 5166–5268 | `0074` | 311d | indefinite `τις` | `εἰ οὖν τις ἡμᾶς … ἔροιτο·` 5106–5165 |
| `0474` | 6962–7014 | `0090` | 312d | indefinite `τις` | `εἴ τις ἔροιτο ἡμᾶς,` 6942–6961 |
| `0475` | 7123–7165 | `0090` | 312d | indefinite `τις` | `εἰ δέ τις ἐκεῖνο ἔροιτο,` 7098–7122 |
| **`0476`** | 19318–19373 | `0120` | 318c | **ΙΠΠΟΚΡ., resolved** | `Ἱπποκράτης ὅδε … εἰ αὐτὸν ἐπανέροιτο·` 19030–19317 |
| `0477` | 44306–44434 | `0169` | 331a | the staged `ἐρωτῶν` | `εἰ οὖν εἴποι·` 44292–44305 |
| `0478` | 44581–44754 | `0171` | 331a–331b | the staged `ἐρωτῶν` | `ἐὰν ἡμᾶς ἐπανέρηται·` 44560–44580 |
| `0479` | 88028–88128 | `0359` | 352a | indefinite `τις … σκοπῶν` | `ἰδὼν τὸ πρόσωπον … εἴποι·` 87983–88027 |
| `0480` | 90062–90208 | `0363` | 353a | collective `οἱ ἄνθρωποι` | `ἔροιντ’ ἂν ἡμᾶς·` 90045–90061 |
| `0481` | 90703–90776 | `0367` | 353c | collective `οἱ ἄνθρωποι` | `εἰ ἔροιντο ἡμᾶς·` 90686–90702 |
| `0482` | 93814–93883 | `0382` | 354e | collective `οἱ ἄνθρωποι` | `εἴ με ἀνέροισθε, ὦ ἄνθρωποι,` 93785–93813 |
| `0483` | 95063–95079 | `0383` | 355c | indefinite `τις` | `ἐὰν οὖν τις ἡμᾶς ἔρηται,` 95038–95062 |
| `0484` | 95100–95117 | `0383` | 355c | the same, as `ἐκεῖνος` | `ἐκεῖνος ἐρήσεται ἡμᾶς·` 95118–95140 |
| `0485` | 95288–95307 | `0383` | 355c | the same | `φήσει.` 95308–95314 |
| `0486` | 95411–95546 | `0383` | 355c–355d | `ὁ ἐρόμενος … ὑβριστὴς ὤν` | `ἂν οὖν τύχῃ ὁ ἐρόμενος … ἐρεῖ·` 95343–95410 |
| `0487` | 95554–95621 | `0383` | 355d | the same | `φήσει,` 95547–95553 |
| `0488` | 95730–95750 | `0383` | 355d | the same | `φήσει ἴσως,` 95751–95762 |
| `0489` | 95763–95911 | `0383` | 355d–355e | the same | `φήσει ἴσως,` 95751–95762 |
| `0490` | 95944–95963 | `0383` | 355e | the same | `φήσει,` 95964–95970 |
| `0491` | 95971–96053 | `0383` | 355e | the same | `φήσει,` 95964–95970 |
| `0492` | 96536–96643 | `0385` | 356a | indefinite `τις` | `εἰ γάρ τις λέγοι ὅτι` 96515–96535 |
| `0493` | 99599–99749 | `0394` | 357c–357d | collective, `ὑμεῖς` | `μετὰ τοῦτο ἤρεσθε ἡμᾶς·` 99575–99598 |

Every span is the edition's own `{q} … {/q}` including both markers, as the myth
records `0465`–`0471` already are. Each nests strictly inside the depth-2 parent
named, none overlaps another, and each `unresolved_reason` states what the local
Greek withholds — no `candidate_owners` are supplied, because the staged owners
are not members of the cast and naming registered ones would be invention.

**`0476` is the one resolved member, and it is resolved because the Greek names
its speaker.** `Ἱπποκράτης ὅδε` at 19030 is the nominative subject governing
`ἐπιθυμήσειεν`, `ἀφικόμενος`, `ἀκούσειεν` and finally `ἐπανέροιτο` at 19305, the
optative that introduces the span; `αὐτόν` is Zeuxippus, who answers at 19373
(`εἴποι ἂν αὐτῷ ὁ Ζεύξιππος`). The cited formula runs the whole 287-character
period because shortening it drops the subject; the record's `limits` says so.
This is the second sentence of the rule doing its work: had it been recorded
`unresolved`, the reason would have had to claim the Greek withholds an owner,
which is false.

**Nine of the twenty-two sit outside 353c–357e** — `0472`–`0480`, at 311b–311d,
312d, 318c, 331a–331b, 352a and 353a. They are the same construction
(`εἴ τις ἔροιτο· {q} … {/q}`), they sat inside resolved Socrates records, and
nothing but the passage they occur in distinguished them from the thirteen at
`0481`–`0493`. Nine of them were not in the brief that opened this pass; leaving
them would have meant fixing the contradiction in one stretch of the dialogue and
preserving it in four others.

**Where the rule deliberately stops, checked exhaustively.** The census accounts
for all 65 `{q}` spans in the dialogue, and every one has a structural
disposition:

| disposition | spans |
|---|---:|
| new records `0472`–`0493` | 22 |
| existing myth records `0465`–`0471` | 5 |
| staged speech in an `unresolved` record — no child is expressible | 9 |
| the record owner's own reported speech | 13 |
| quoted *words*, not utterances | 15 |
| the 361a–c λόγος | 1 |
| | **65** |

- **The 13 own-speech spans** carry the record's own `ἔφην ἐγώ` / `ἦν δ’ ἐγώ` /
  `καὶ ἐγὼ εἶπον` cue printed inside them: staged owner and record owner are the
  same person, so there is no second voice to record.
- **The 15 word-quotations** are `τὸ {q} εἰ βούλει {/q} τοῦτο` at 331c and the
  `χαλεπόν` / `δεινοῦ` series through Prodicus' lesson at 341a–d, where an
  article governs the quotation. "Quotation alone is not enough."
- **Staged speech inside an `unresolved` record gets no child.** An unresolved
  record already sits one level below anything nameable, so `depth` has nowhere
  to go — the schema cannot express it. This covers the `τις` interrogations at
  311c–312a and 330c–331a in `0069`, `0071`, `0073`, `0078`, `0158`, `0162`,
  `0164`, `0165` and `0168`. None of them defaults to Socrates, which is the harm
  the rule exists to prevent; the words are already assigned to nobody.

**No named individual is missing a record anywhere in the dialogue.** That was
checked over all 65 `{q}` spans, not sampled.

### The 361a–c λόγος: out of scope, and why

Ruled, not deferred. The passage at 107217–107870 (`{q}` content 107220–107866)
stays inside record `0461` and carries no record of its own.

The introducing construction is `καί μοι δοκεῖ ἡμῶν ἡ ἄρτι ἔξοδος τῶν λόγων
ὥσπερ ἄνθρωπος κατηγορεῖν τε καὶ καταγελᾶν, καὶ εἰ φωνὴν λάβοι, εἰπεῖν ἂν ὅτι`
at 107096–107217. The `{q}` markers stand at 107217–107220 and 107866–107870;
the Greek proper is 107221–107865, **644 characters**, six sentences, no
question mark anywhere in it.

**The decisive fact is grammatical, and it is not mood.** The personified entity
has no nominative subject and no finite speech verb:

1. The subject is `ἡ ἄρτι ἔξοδος τῶν λόγων` (107115–107138) — feminine
   nominative singular, the *outcome* of the argument. `τῶν λόγων` is a
   dependent genitive plural, and `λόγος` occurs in **no** nominative anywhere in
   the frame. On the Greek this is not even an instance of the construction the
   protocol's personification row names.
2. `κατηγορεῖν`, `καταγελᾶν` and `εἰπεῖν ἄν` are all **infinitives** governed by
   Socrates' own finite `δοκεῖ` at 107104, whose dative is `μοι`. The single
   finite assertion in the sentence is that this seems so to him.

The Crito Laws are the opposite on both counts: `ἐλθόντες οἱ νόμοι καὶ τὸ κοινὸν
τῆς πόλεως ἐπιστάντες ἔροιντο` (14854–14915) puts `οἱ νόμοι` in the nominative as
subject of the finite `ἔροιντο`, and renames them as the nominative subject of a
finite speech verb four more times: `τί οὖν ἂν εἴπωσιν οἱ νόμοι` (15595),
`ἴσως ἂν εἴποιεν ὅτι` (15764), `φαῖεν ἂν ἴσως οἱ νόμοι` (18215), `ἂν φαῖεν`
(21129).

Three confirmations, any one sufficient:

- `ὥσπερ ἄνθρωπος` (107139) is the text's own simile marker — the outcome behaves
  *as if* it were a person — against the Laws' bodily `ἐλθόντες … ἐπιστάντες`.
  `καταγελᾶν` is literally the "teases" of the protocol's default-exclusion row.
- `εἰ φωνὴν λάβοι` (107183) presupposes there is no voice to transmit, while
  Socrates says of the Laws `ἐγὼ δοκῶ ἀκούειν … ἡ ἠχὴ τούτων τῶν λόγων βομβεῖ`.
- The Laws hold a floor across **10,298 characters** (14921–25219, `{50a}`
  through `{54d}`), interrupted by three printed `ΚΡ.` turns (15560, 18156,
  21078), by Socrates breaking frame to consult Crito (`τί ἐροῦμεν, ὦ Κρίτων`,
  15254), and by two direct-speech replies from Socrates in his own person —
  `{q} οὐ μέμφομαι, {/q} φαίην ἄν` (16163) and `{q} καλῶς, {/q} φαίην ἄν`
  (16419). The Protagoras `ἔξοδος` speaks once, asks nothing, and nobody replies;
  Socrates resumes at 107870.

**Correcting a figure this receipt first carried.** It reported the Laws as "17
`{q}` stretches, 1,950 quoted characters across 6,607 characters of source from
14920 to 21527". All three numbers were wrong: the scan stopped before the last
`{q}` at 23718 and before the discourse's actual end at 25219. There are **18**
spans summing **1,976** characters, and **three of the eighteen are Socrates**,
not the Laws. Worse, the sum is the wrong instrument: `crito.txt` closes six
spans at a Stephanus page marker while the speech runs on — `{/q} {50b} τῷ ἔργῳ`
at 14982, and likewise 16371, 16933, 18409, 21163, 23744, one of them splitting a
noun phrase. Summing `{q}` scores the Laws at 1,976 against Protagoras' 644 —
3×, not 16× — and makes the protocol's own paradigm look barely stronger than the
case it exists to exclude. The outer extent is the honest measure, and the
protocol now says so.

What this ruling is *not*: the mood argument returning under another name. The
Crito Laws are hypothetical throughout (`ἔροιντο`, `ἂν εἴπωσιν`, `εἴποιεν ἄν`,
`φαῖεν ἄν`, under the protasis `εἰ μέλλουσιν ἡμῖν … ἀποδιδράσκειν`) and are in
scope. This passage is out of scope for having no nominative speaker and no
finite speech verb, not for being conditional.

**Scope of the test, stated because it is easy to over-read.** It governs
personification only. A staged *human* interrogator who sustains a long answered
exchange — as `οἱ πολλοί` do across 90703–96049, with finite `φήσει` / `φήσομεν`
/ `ἐρήσεται` and real turn-taking — is in scope under the staged-speech rule on
its own terms, and is recorded above as `0481`–`0491`. It is not licensed, or
excluded, by this paragraph.

Only one λόγος-word in the dialogue is construed with a speech act directed at a
person, and it is this one; the other candidates (`οὗτοι γὰρ οἱ λόγοι … οὐ γὰρ
συνᾴδουσιν` at 48819, `τὸν γὰρ λόγον ἔγωγε μάλιστα ἐξετάζω` at 49731, `χαλάσαι
τὰς ἡνίας τοῖς λόγοις` at 58476, `τῷ σαυτοῦ λόγῳ βοηθεῖν` at 66684, and the
anti-personification `ὥσπερ βιβλία οὐδὲν ἔχουσιν οὔτε ἀποκρίνασθαι` at 40188)
address nobody. The ruling sweeps nothing else in.

### Two statements in the new registry entry are process claims, not source
claims**, and nothing in the repository can confirm or refute them: that a primary
review and an independent cross-review each recommended the three sigla, and that
no separate operator ruling was issued. They are true of this session and are
stated as process rather than dressed up as textual evidence — which is the
defect this change set was fixing — but a reader should know they rest on this
receipt alone. Relatedly, the form notes citing `ΕΡΜ.` for Hermogenes in cratylus
and `ΠΡΩ.` in philebus are accurate, but both live in
`derived/plato/turns/sigla.toml`, not in the voices registry the comment sits in.

## What this acceptance does not do

Protagoras is absent from `derived/plato/voices/cutovers.toml`. No claim,
observation, relation, commentary record or audio artifact changes; no voice
join is written; no claim `speaker` moves. Compiling
`derived/plato/voices/protagoras.toon` from this ledger is a lane-internal
artifact and authorizes no consumer. Activation remains a separate, explicit
operator decision.

Registering a voice siglum likewise asserts nothing about the source and earns
no attribution by itself; the licensing evidence for every attribution stays on
the record.

Accepting a `reviewed_attribution` record accepts an **adjudication**, not a
quotation. 48 of these 473 records are of that kind, each citing a bounded Greek
context by offsets and the SHA-256 of its exact bytes, so a later reader can
reject all 48 without touching the 289 that rest on cited formulas.

## Final state

| | | (was, 2026-08-04) |
|---|---|---|
| `wiki/voices/protagoras.md` | `e3951c853ebf026e0b1d538607742d5f259e29dc5d210cdc3d66c10f6a639667` | `9b60eb8c…c9a8a417` |
| `derived/plato/voices/protagoras.toon` | `af1ad20a70cf99500d9049c1be982ca19c9ffd4e7641353423c1ff96b9ae24c9` | `8ec9ff0a…54171695a` |
| `raw/plato/greek/protagoras.txt` | `f2890c5fd07c6fa1f6219a938be81ca3eda1a55d5bd3d41ac7a1169a8e43d99b` | unchanged |
| records / accepted | 473 / 473 | 467 / 467 |
| compiled records | 473 | 467 |
| ledger validator | 0 issues | 0 issues |

`wiki/completeness.md` was refreshed once at this closure; `CMP-REPORTED-TURNS`
stands at 9/28 and protagoras passes it. Euthydemus is untouched by this pass and
`derived/plato/voices/euthydemus.toon` is byte-identical to its pre-pass state
(`678a7a009b6e87d4f7a05ab81b7d1806a4e4171e391eb2b62e59b3af1ef88714`), as are the
symposium and phaedo indexes.

## Who did this pass, stated as process

The staged-speech ruling, the `{q}` census, the 22 new records and the packet
removal were adjudicated and applied by **one pass**, reading
`raw/plato/greek/protagoras.txt` and `raw/plato/greek/crito.txt` directly. Three
independent read-only reviewers were commissioned, for the staged spans, the λόγος
passage and the packet enumeration. **Two — staged spans and packets — terminated
on an account spend limit before returning any finding**, and nothing here rests
on them.

**The λόγος reviewer returned, and its work is load-bearing.** It reached the same
ruling independently, and corrected this receipt on four checkable points, each
re-verified against the sources before being adopted: the Crito Laws' extent
(6,607 → 10,298 characters; the first scan stopped before the last `{q}` at 23718
and before the discourse's end at 25219), the span count (17 → 18, three of them
Socrates), the `crito.txt` markup defect that makes summed-`{q}` the wrong
instrument, and the grammatical discriminator now used in place of the
length comparison — nominative subject plus finite speech verb, which is a
stronger and more portable test than "sustained". It also supplied the
overreach check: 70 `λογ-` occurrences in this dialogue, only one construed with
a speech act directed at a person.

**As of 2026-08-04 no second independent review of the 22 new records, or of the
packet removal, had occurred**, and every offset, hash and count was warranted
only by being mechanically reproducible from the files. **That is no longer the
state.** Both reviews were re-commissioned and both returned on 2026-08-08; their
adjudication is the section that follows.

## Independent review addendum, 2026-08-09

Two read-only reviewers were re-commissioned after the 2026-08-04 pair terminated
on a spend limit. Both returned. Their reports are review evidence, not repository
artifacts; every finding below was re-verified against
`raw/plato/greek/protagoras.txt` by slicing the cited offsets before anything was
changed. Findings the source did not support were not implemented.

### Reviewer B — the packet deletion: clean, no defects

The packet audit found the deletion of `bounded_speech_packet` **complete and
safe**, with zero defects:

- No parser, type, field, enum member, parse branch, issue code, compiled-index
  column or table, test, fixture, or current-tense protocol document retains
  packet authority. `parseVoiceLedger` is now `voiceYamlBlocks().map(parseVoiceRecord)`
  with no second block species, and `bounded_speech_packet` is a hard
  `unknown_field` rather than a no-op. No compatibility parse survives.
- All thirteen `packet_*` validator codes and the functions behind them are gone,
  with no `if (packet) skip` escape hatch at either former call site.
- All four compiled indexes recompile byte-identically, carry no `packets[` table,
  and hold 668 `resolution_basis` cells of which every one is `reviewed_discourse`
  and none is `bounded_speech_packet`.
- **No record was orphaned.** All 13 records that the `protagoras-great-speech`
  packet had licensed survive under the same ids with their own byte-cited
  record-local evidence — the packet was redundant authority, never sole
  authority. Across all four ledgers, zero records are `resolved` with neither
  `evidence_refs` nor `reviewed_attribution`, and `validateVoicesLedger` returns
  0 issues for all four.
- `floor_taking_boundary`, the only evidence kind the packet mechanism introduced,
  appears zero times in every ledger and zero times in `packages/`.

Every surviving occurrence of the word "packet" is either historical provenance
in a receipt or plan, or the unrelated symposium-rereview sense of a sealed
reviewer-disagreement packet. **No packet machinery was rebuilt and no replacement
abstraction was created.**

### Reviewer A — the staged spans: 22 records correct, 8 findings, 7 implemented

The staged-speech reviewer confirmed all 22 assigned records on the questions of
span defensibility, depth/chain consistency and id allocation: each `char_span` is
**exactly** one `{q}…{/q}` region including both markers, with no printed siglum
inside, no Stephanus marker straddled and no inquit swallowed; all 22 satisfy the
depth rule and every chain is a correct prefix-extension of its parent. Its
substantive findings were about **coverage** — staged spans that had no record —
and one wrong record.

| # | finding | adjudication |
|---|---|---|
| 1 | missing sibling of `0472` at `[4672, 4756)` | **confirmed, implemented** as `0494` |
| 2 | missing sibling of `0473` at `[5619, 5684)` | **confirmed, implemented** as `0495` |
| 3 | missing staged question at `[43017, 43153)` | **confirmed, implemented** as `0496` |
| 4 | missing staged question at `[43419, 43464)` | **confirmed, implemented** as `0497` |
| 5 | missing staged question at `[43502, 43549)` | **confirmed, implemented** as `0498` |
| 6 | `0165` is a wrong record: its span IS the staged question, but it was depth 2 with `candidate_owners: ["ΠΡΩΤ.","ΣΩ."]` that the Greek excludes | **confirmed, implemented**: `0165` corrected to depth 3, chain `["ΣΩ.","ΣΩ."]`, unresolved, no candidates; parented by extending `0166` backward |
| 7 | missing staged question at `[43935, 44134)` | **confirmed, implemented** as `0499` |
| 8 | `0479` cites `εἴποι` at 88023–88027, which slices to `"ποι·"` | **confirmed, implemented**: corrected to 88021–88026, and the companion pointer from 88128 to 88129 |
| 9 | proposed a record for `λόγος` at `[107217, 107870)` | **rejected** — see below |

**The six new staged records.** Each was verified by slicing the source: every one
is marker-inclusive, opens at `{q` and closes at `q}`, and excludes its own inquit
and every byte of narrator prose. All six carry `depth: 3`, chain `["ΣΩ.","ΣΩ."]`,
`resolution: unresolved` and **no** `candidate_owners`, because the Greek supplies
the asker no name, no registered role and no antecedent.

| id | span | Stephanus | licensing construction | `span_sha256` |
|---|---|---|---|---|
| `0494` | `[4672, 4756)` | 311c | `εἴ τίς σε ἤρετο·` `[4655, 4671)` | `eca66fab0a7b62b9d53840126bf5805b315e282fc81f786280c82d9a196d4759` |
| `0495` | `[5619, 5684)` | 312a | `εἰ οὖν καὶ τοῦτό τίς σε προσέροιτο` `[5576, 5610)` | `3db35962def5ed70a019023a6d67ae3d27e1d0bd19e05907c83ddfe29cb7dace` |
| `0496` | `[43017, 43153)` | 330c | `εἴ τις ἔροιτο ἐμέ τε καὶ σέ·` `[42988, 43016)` | `c4858ce3265143b361cbc415e1e70023705519e7b41e38e19e5d1111e0e32a46` |
| `0497` | `[43419, 43464)` | 330d | `εἰ οὖν μετὰ τοῦτο ἡμᾶς ἔροιτο·` `[43388, 43418)` | `b5ac74149dfe48a642edf083d4a77e8c8a791d1817505c957fd02075c6c6a423` |
| `0498` | `[43502, 43549)` | 330d | resumed from 43388 with no fresh formula | `8cb730192f08c89f3f7bb0c0b3b8482752ecb1c9fbf59aac5f5debd857a9e2c7` |
| `0499` | `[43935, 44134)` | 330e | `εἰ οὖν μετὰ τοῦτο εἴποι ἐρωτῶν ἡμᾶς` `[43898, 43933)` | `87f7c5204e21f26e202038977b63eb2ef6cfc6cc6166b27acd346ae2a360e9d6` |

`0165` keeps `span_sha256 4892c7bbc7f8dfb6d14b290d5f4b28fb0d97ebdc118d495715c945842504fbd9`
over `[43586, 43683)`.

The Greek that excludes both men present, verified in each case: inside the quoted
matter the verbs are second person plural or dual addressed to the pair —
`εἴπετον`, `φατε`, `ἐλέγετε`, `ὑμῶν κατήκουσα`, `ἐδόξατέ μοι` — while the answers
outside are first person plural, `φαῖμεν ἄν` at 43465 and 43550. A second-person
address to both men cannot be spoken by either of them.

**`0165`, and the parent geometry it forced.** `0165`'s span `[43586, 43683)` is
exactly the `{q}` region `πότερον δὲ τοῦτο αὐτὸ τὸ πρᾶγμά φατε …`, whose verb
`φατε` is second person plural and whose answer outside is the narrator's own
`ἀγανακτήσαιμ’ ἂν ἔγωγ’, ἔφην` at 43684. Its depth-2 candidate set therefore
excluded the staged owner while affirmatively offering the words to the two men —
the precise failure the whole family exists to prevent. The id and the span are
preserved because the source unit survives; only its depth, chain and resolution
changed. (Relative to `HEAD` the span also moved, from `[43586, 43678)` to
`[43586, 43683)`, but that correction belongs to the 2026-08-04 change set, which
made every staged span marker-inclusive; `0166` moved with it.)

A depth-3 record needs a depth-2 parent, and no narration attaches to this unit
on either side. The first attempt supplied a parent co-extensive with `0165` — and
the verification pass below refuted it: a resolved depth-2 record asserts an owner
for **the whole span**, so a parent over exactly `0165`'s bytes asserts the very
thing `0165` denies. The two records contradicted each other, and no other
identical-span pair exists anywhere in the ledger. **`0166` was extended backward
from `[43684, 43874)` to `[43586, 43874)` instead**, which gives `0165` a parent
with real narration of its own — the `ἔφην` at 43708 that already licensed `0166`
now licenses the voicing of the staged question too — and leaves the narrator's
`καὶ τοῦτο συνέφη` at 43567–43583 outside, at depth 1, where it was.

This is the same shape every other parent in the family has: `0169`
`[44139, 44457)` likewise opens with the narrator's own words and encloses the
staged `0477`.

**Six depth-2 parents re-examined and resolved.** Reviewer A asked that `0158`,
`0162` and `0164` be re-examined once their staged children were cut out. Applying
the same test to every parent of a new depth-3 record, six were affected: `0071`,
`0078`, `0158`, `0162`, `0164` and `0168`. (`0166`, the seventh parent, was
already resolved on its own `ἔφην`.) Leaving them unresolved was not an
option once the children existed — a depth-3 chain `["ΣΩ.","ΣΩ."]` asserts that
the depth-2 hop is ΣΩ., which contradicts a parent still offering that hop to
ΠΡΩΤ. or ΙΠΠΟΚΡ. — and the validator forbids a single-member candidate set. Each
was therefore resolved by `reviewed_attribution: discourse_resolution` over a
hashed context, on the same footing as `0169`:

| id | remaining Greek after the child is cut out | why the other candidate is excluded |
|---|---|---|
| `0071` | second person singular throughout (`ἐπενόεις`, `σαυτοῦ`, `σε`, `τί ἂν ἀπεκρίνω;`) | the addressee ΙΠΠΟΚΡ. answers at 4773; the same construction at `0067` is fixed on the narrator by `ἔφην ἐγώ` |
| `0078` | second person singular `σε`; `καὶ ὃς εἶπεν ἐρυθριάσας` hands the floor to the other man | ΙΠΠΟΚΡ. gives the answer at 5768–5832 |
| `0158` | `ἐγὼ μὲν ἂν αὐτῷ ἀποκριναίμην … σὺ δὲ τίν’ ἂν ψῆφον θεῖο;` | the σύ so asked answers in the ἔφη-marked ΠΡΩΤ. reply at 43246 |
| `0162` | `φαῖμεν ἄν, ὡς ἐγᾦμαι` — first singular inside a first plural | ΠΡΩΤ. assents separately at 43487 (`ναί, ἦ δ’ ὅς`) |
| `0164` | `φαῖμεν ἄν· ἢ οὔ;` — a check put to someone else | the narrator reports ΠΡΩΤ. assenting in the third person, `καὶ τοῦτο συνέφη` |
| `0168` | `εἰ οὖν μετὰ τοῦτο εἴποι ἐρωτῶν ἡμᾶς` — a first plural that puts the speaker inside the questioned pair | ΠΡΩΤ.'s ἔφη-marked reply closes immediately before, at 43875–43893 |

`0160` carries the same generic two-party reason and its remaining Greek is also
first-person Socrates (`φαίην ἂν ἔγωγε … οὐκοῦν καὶ σύ;`, answered by ΠΡΩΤ.'s
`ναί, ἔφη`), but it has no staged child, nothing in the ledger now contradicts it,
and it was left untouched rather than swept in. The same holds for `0069`, `0072`,
`0073`, `0464`, `0076` and `0077` in the 311c stretch. All are recorded here as
**observed and deliberately not changed**: this pass resolved exactly those
parents whose own children would otherwise have contradicted them, and did not
open a general re-resolution of the dialogue.

### The λόγος proposal at 361a is rejected

Reviewer A proposed a record for `[107217, 107870)` at Protagoras 361a, on the
ground that it is the last `{q}` region in the source that is staged third-party
direct speech with no depth-3 record.

**Rejected.** This was already adjudicated in `docs/voices-protocol.md`, in plan
079, and in this receipt's own section "The 361a–c λόγος: out of scope, and why".
The personification rule requires
the proposed owner to be a **nominative subject governing a finite speech verb**.
`λόγος` is not nominative there, and the apparent speech acts are infinitives
governed by Socrates' finite `δοκεῖ`. `{q}` markup alone does not override the
rule — the edition marks quotation, not ownership, and the ledger has never
treated a `{q}` region as self-licensing. The reviewer's own census is what makes
the finding tractable rather than open-ended: this is the single remaining
`{q}` region in the dialogue that the rule declines, and it is declined on the
grammar, not on doubt.

This is recorded as a **considered-and-rejected review finding**, not as an
unexamined gap.

### Findings verified and deliberately left standing

Reviewer A listed several citation imprecisions as "debatable, no edit demanded".
Each was checked against the source and left as written, because in each case the
cited range **contains** the quoted phrase rather than mis-slicing it — which is
the ledger's clause-citation convention and is the opposite of the `0479` defect,
where `[88023, 88027)` sliced to `"ποι·"` and did not contain `εἴποι` at all:

- `0486`, `0488`, `0489`, `0490` and `0491` cite `ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν` at
  95343–95410, and `0483` at the bare offset 95343. That range is the whole clause
  `ἂν οὖν τύχῃ ὁ ἐρόμενος ἡμᾶς ὑβριστὴς ὤν, γελάσεται {355d} καὶ ἐρεῖ·`; the
  phrase alone is `[95355, 95382)`.
- `0477`/`0478` cite `τῷ ἐρωτῶντι` without noting that the source prints it split
  as `τῷ {330d} ἐρωτῶντι` at `[43343, 43361)`. Verified; the split is real and the
  citation is not false.
- `0472` says "the reply at 4470 is his". 4470 is a space inside `εἶπον ἄν`, but
  it does lie inside the reply unit `0068` `[4465, 4493)`.

Reviewer A's own report contains one error of this kind, noted so the report is
not read as authority: it describes `0168` as carrying chain `["ΣΩ.","ΣΩ."]`,
where the ledger at the time gave it `["ΣΩ."]` with candidates `["ΠΡΩΤ.","ΣΩ."]`.
The substance of the finding is unaffected.

Reviewer A also observed that the edition stages further speech with a capital
letter and no `{q}` — `εὐφήμει, ὦ ἄνθρωπε` at 43684 and the 353c–355e replies
among them — and correctly declined to call the omission a defect: every one of
those is owned by ΣΩ., so recording them would produce chain `ΣΩ./ΣΩ./ΣΩ.` and
change no attribution. The scope decision stands; it is stated here rather than
in the ledger header.

### The two stretches touched are now completely covered

A fresh `{q}` census over the two ranges this pass changed — 311b–312a and
330c–331b — confirms the family is closed there. In 330c–331b all seven `{q}`
regions now carry a depth-3 record (`0496`, `0497`, `0498`, `0165`, `0499`,
`0477`, `0478`). In 311b–312a four of six do (`0472`, `0494`, `0473`, `0495`). The other two are
adjudicated under "The verification pass" below.

The two that do not are `{q} ὡς τίς γενησόμενος; {/q}` at `[4495, 4523)` and
`{q} ὡς τίς δὲ γενησόμενος αὐτός; {/q}` at `[4802, 4839)`, and they are correctly
depth-2 records (`0069`, `0073`) rather than staged speech. Both fall **after**
the counterfactual frame has closed at `τί ἂν ἀπεκρίνω;` and the man being
questioned has answered, so they belong to the real conversation rather than to
the `εἴ τίς σε ἤρετο` interrogation. The first is decisive on the printed
evidence: the reply to `0069` is the **ἔφη-marked** ΙΠΠΟΚΡ. `ὡς ἰατρός, ἔφη` at
`[4525, 4540)`. The second repeats that structure without inquits — `0072`,
`0073` and `0464` are the unresolved run `εἶπον ἂν ὡς ἀγαλματοποιοῖς` /
`ὡς τίς δὲ γενησόμενος αὐτός;` / `δῆλον ὅτι ἀγαλματοποιός` — and it is left
unresolved rather than promoted, which is the conservative reading. The edition
marks both with `{q}` because they are short quoted questions, and `{q}` marks
quotation, not staging. Reviewer A's own 65-region census classified both the same
way and did not list them among its missing records.

### The verification pass, and what it changed

A third read-only pass verified the six new records, the corrected `0165`, the
repaired parent geometry, the changed candidate sets, `0479`, and staged-speech
coverage in the two touched stretches. It confirmed the mechanical work — every
span marker-inclusive with matching hashes, every prose offset slicing to what it
claims, all six exclusion arguments decisive, no same-depth overlap, byte-identical
recompile — and returned three things worth recording.

**It refuted the first parent repair, and the repair was changed.** See `0165`
above: the co-extensive parent was withdrawn and `0166` extended instead. This is
the one substantive correction the verification produced, and it is the reason the
cohort is 473 records rather than 474. The withdrawn record's id was not left as a
gap: the last new record was renumbered into it, so the fresh block is a
contiguous `0494`–`0499`. Nothing outside this uncommitted change set ever
referred to either id.

**It proposed promoting `0069` `[4495, 4523)` and `0073` `[4802, 4839)` to staged
depth-3 records. Not implemented.** Both are `{q}` regions in the 311c stretch,
and the argument for them is that they resume the staged `τις` without a fresh
formula, exactly as `0498` does. The Greek decides against it, on mood. The staged
frame closes at `τί ἂν ἀπεκρίνω;` and the answers **inside** it are potential —
`εἶπον ἄν, ἔφη, ὅτι ὡς ἰατρῷ` at 4465 and `εἶπον ἂν ὡς ἀγαλματοποιοῖς` at 4773,
both with `ἄν`. The answers to these two questions carry no `ἄν` at all:
`ὡς ἰατρός, ἔφη` at 4525 and `δῆλον ὅτι ἀγαλματοποιός` at 4841. A reply that has
dropped the potential construction is a reply in the real conversation, so the
question it answers was asked there too. Reviewer A's complete 65-region census
classified both the same way and did not list them among its missing records. Two
independent readings against one; recorded as **considered and rejected**.

The verifier's own accompanying observation is worth keeping, because it cuts the
same way: promoting `0069` and `0073` under the parent rule would have required
inventing two more degenerate co-extensive parents — reproducing the very defect
the same pass had just refuted.

`0069` would separately support a ΣΩ. resolution on its flanking evidence, since
both neighbours are `ἔφη`-marked ΙΠΠΟΚΡ. replies. It is left unresolved with the
other observed-not-changed records above, for the same reason: nothing in the
ledger contradicts it.

**Two citation ranges were tightened.** `ὦ ἄνθρωπε` was cited at 43744–43762 in
`0165`, `0497` and `0499`, a range that slices to `εὐφήμει, ὦ ἄνθρωπε`; it is now
43753–43762, the vocative alone. And `0158`'s rationale inherited the boilerplate
appeal to "the anchors at 39635 and 46478", where 39635 ends a formula addressed
to **Hippocrates** rather than opening a ΣΩ./ΠΡΩΤ. exchange; the clause was
dropped, since `0158` rests on the `σύ` that ΠΡΩΤ. answers, not on that anchor.

### Verification of this addendum

`bun scripts/voices-2026-07/check-ledger.ts protagoras` returns **0 issues** after
every change. The compiled index was regenerated and carries 473 records. No
surviving id was renumbered; `0494`–`0499` are fresh and strictly above the
previous maximum `0493`. There is no identical-span pair anywhere in the ledger. Protagoras remains absent from
`derived/plato/voices/cutovers.toml`, so none of this reaches a claim, a join or
the site.
