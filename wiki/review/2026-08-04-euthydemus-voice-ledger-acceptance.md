# Euthydemus voice ledger — acceptance of the complete reported-turn cohort (the corpus reported-turn completion campaign wave 1)

**Date**: 2026-08-04
**Source**: `raw/plato/greek/euthydemus.txt`, sha256
`23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14`
**Scope**: the 33 outer turns `wiki/reported-turn-scopes.json` marks `required`
for this dialogue, frozen against
`wiki/review/2026-07-26-euthydemus-reported-turn-scope-census.md`. Both the Greek
source hash and the turn-index hash recorded in that census still match the
current files, and the ledger speaks about exactly those 33 turns — no unscoped
turn was added to the denominator.
**Action**: all 573 records in `wiki/voices/euthydemus.md` move
`unreviewed` → `accepted`, as 33 atomic outer-turn cohorts.

## What is being accepted

| | count |
|---|---:|
| records | 573 |
| outer turns | 33 |
| depth 1 | 33 |
| depth 2 | 540 |
| resolved by cited bytes | 301 |
| resolved by `reviewed_attribution` | 78 |
| `unresolved` | 194 |

Owners of the 379 resolved records: ΣΩ. 169, ΔΙΟΝ. 71, ΕΥΘ. 51, ΚΤΗΣ. 42,
ΚΛΕΙΝ. 36, ΚΡ. 6, ΛΟΓΟΓΡ. 4.

Evidence kinds across the 301 explicitly licensed records:
`person_marked_reporting_formula` 163, `named_reporting_formula` 119,
`anchored_dialogue_turn` 60, `printed_siglum` 44, `closing_formula` 26,
`anaphoric_reporting_formula` 8, `role_reporting_formula` 1.

**194 of 573 records are accepted as `unresolved`.** That is the review's
finding, not a gap in it. The eristic exchanges have four participants, and a
bare `ἔφη` or `ἦ δ’ ὅς` there marks an utterance without identifying its
speaker. Accepting an unresolved record accepts the claim that the Greek at
those offsets licenses no owner; it assigns the span to nobody, and in
particular not to the printed turn siglum.

## Review passes behind this decision

1. **Primary source review** of the entire required Greek scope, which produced
   the current record set: 4 splits, 14 merges, 11 deletions, and the removal of
   every canned candidate roster and canned unresolved reason that the previous
   candidate carried.
2. **Targeted independent cross-review**, which read the Greek for all seven
   declared bounded two-party exchanges (including the two wide
   Socrates–Cleinias bounds at 16190–24013 and 36760–41260, carrying 29 anchored
   records between them, which were not in its brief), every changed record,
   every unresolved record, all three flagged textual cruxes, a 77-record sample
   of unchanged material, and a 33-item sample of covered source gaps. It found
   evidence bytes verifying 100%, clean geometry, no attribution by alternation,
   no previous-speaker carry-forward, no content or doctrine reasoning, and no
   invented candidate sets.
3. **Adjudication at acceptance** (this receipt), which repaired the two defects
   the cross-review raised as blocking or recommended, restored the stable
   identities, and re-verified every changed record against the Greek.

## What changed at adjudication

### 1. Stable `voice_id` identities were restored, not re-baselined

The primary pass had renumbered `voice_id` as an array position. Measured
mechanically: of 571 ids present in both `HEAD` and that candidate, 390 denoted
a different record, 34 sat in a different outer turn, and two live HEAD ids
(`0595`, `0596`) had been recycled onto unrelated spans 28,000 and 40,000
characters away. That is a flat violation of the stable-ID rule in
`docs/voices-protocol.md` and of the corpus reported-turn completion campaign hard-cutover decision 2, and the
validator cannot see it — it checks uniqueness and format only.

The renumbering was **repaired, not blessed**. No reusable renumbering
framework was created; this is a one-off repair of a one-off breach. Records
were matched to their historical identities on dialogue, outer turn, overlapping
source span and semantic identity — never on list position and never on the
numeric id itself.

Result, mechanically re-verified after the repair:

| | |
|---|---:|
| records | 573 |
| ids shared with `HEAD` | 569 |
| of those, byte-identical `char_span` | 493 |
| of those, span **disjoint** from the historical span | **0** |
| of those, sitting in a **different** outer turn | **0** |
| fresh ids, all strictly above the historical maximum 0596 | 0597, 0598, 0599, 0600 |
| permanent gaps | 27 |

The 27 gaps are 0054, 0067, 0079, 0089, 0094, 0119, 0165, 0182, 0187, 0189,
0191, 0204, 0222, 0232, 0234, 0239, 0243, 0250, 0253, 0254, 0361, 0367, 0412,
0455, 0558, 0585, 0586 — the 11 deletions plus the 16 records absorbed by
merges, and nothing else. `0595` and `0596` are back with their historical
owners, Crito's own narration at 71399–71467 and 71471–71906.

Where a merge had to choose which predecessor survives, the id kept is the one
whose attribution claim the merged record still carries — the predecessor whose
`evidence_refs` offsets the merged record reproduces byte for byte. That rule
differs from "keep the earliest" in exactly two of the fourteen merges (the
merged records now numbered 0205 and 0587) and it is the rule the ledger's own
prose already applied at the 64148–64255 split, where the evidence-bearing part
is called the continuant and the start-retaining part calls itself the new
record. Keeping the earliest id in those two cases would have let an id that
asserted **no owner at all** silently become a resolved attribution, which is
the identity laundering the stable-ID rule exists to prevent.

**This merge-id rule is a convention, and it should be ratified rather than
inferred.** Twelve of the fourteen merges keep the leading id either way; the two
that turn on the rule are the records now numbered `0205` and `0587`, and `0587`
contributes only 66 of its merged span's 656 characters. Nothing lands on
unrelated material, but an operator who prefers "keep the earliest" should say so
now rather than after the convention has propagated to Wave 2.

Two further cases were adjudicated rather than inferred. The id `0325`, whose
historical span 43034–43304 swallowed Socrates' narration to Crito, is retained
on the largest surviving piece of that material (43146–43225, the quoted
inquiry) with a fresh id for the answer at 43226–43238; both are strict subsets
of the historical span in the same turn, so this is a re-bounding plus a split,
not a deletion. The id `0368`, whose historical span 49261–49646 likewise
swallowed narration, is retained on the four-character direct speech `πάνυ` at
49635–49639 that survives the trim; its neighbour `0367`, which was pure
narration, is one of the eleven deletions.

### 2. The change accounting was corrected

The handoff described this pass as "4 added (0595–0598) and 13 deleted." That
was an artifact of the renumbering: `0595` and `0596` were live records at
`HEAD`, not new ids, and 27 records were removed, not 13. The true semantic
accounting is:

> **4 splits (+4), 14 merges absorbing 16 records (−16), 11 deletions (−11),
> net −23**, reconciling 596 → 573 exactly.

The cross-review confirmed independently that all 4 splits are genuinely two
owners, all 11 deletions are genuinely narration, indirect report or narrated
assent rather than reported turns, and all 14 merges are genuinely one
utterance.

### 3. Record `voice_euthydemus_0078` — the unresolved reason was factually wrong

Span 12280–12395 in `turn_euthydemus_0016`:
`τί οὖν; ἦ δ’ ὅς, ἆρα σὺ {add} οὐ {/add} μανθάνεις ἅττ’ ἂν ἀποστοματίζῃ τις, ὁ
δὲ μὴ ἐπιστάμενος γράμματα μανθάνει;`

The record said the ambiguity was "which of the two strangers asks". That is
false about the local Greek. **Dionysodorus has not entered.** He takes the
argument over at 12556 — `καὶ οὔπω σφόδρα τι ταῦτα εἴρητο τῷ Εὐθυδήμῳ, καὶ ὁ
Διονυσόδωρος ὥσπερ σφαῖραν ἐκδεξάμενος τὸν λόγον` — 161 characters after this
span ends. The narration names the two parties of this exchange at both ends:
`ὁ μὲν Κλεινίας τῷ Εὐθυδήμῳ ἀπεκρίνατο … ὁ δὲ ἤρετο αὐτόν` above, and the
Euthydemus handoff below. The record was also the only unresolved record in
turn 0016 carrying no `candidate_owners`, and the arithmetic of the reported
turn-0016 repair (13 unresolved plus the one resolved record) leaves exactly
this record out of it — it is an unrepaired residue, not a considered judgment.

It now carries `candidate_owners: ["ΕΥΘ.", "ΚΛΕΙΝ."]` and the same structural
preamble as its thirteen siblings, with a per-site tail that is true of this
span: its `ἦ δ’ ὅς` excludes only the narrator, and `μανθάνεις` is second person
and marks the addressee. **It remains `unresolved`**, which is the honest
outcome: the ambiguity is real, it was simply described wrongly.

### 4. Record `voice_euthydemus_0414` — re-licensed, same owner

Span 54094–54121 in `turn_euthydemus_0072`, `{p} ἐπίστασαι μέντοι, ἔφη.`

The record was licensed as an `anchored_dialogue_turn` inside the Socrates–
Euthydemus bound opened at 50018. That bound's two-party premise is unavailable
where this span sits. At 53803 the speaker turns to both brothers at once —
`εἴπετον δέ μοι, ἦν δ’ ἐγώ—` (second-person **dual** imperative), then `ὑμῖν`
and `ὑμεῖς` (plural), after naming `ὁ ἀδελφός σου οὑτοσὶ Διονυσόδωρος`. That is
the same move the ledger itself treats as closing the parallel bound at 47399,
and here too Dionysodorus is the next named speaker, at 54306. An
`anchored_dialogue_turn` whose whole force is "only two people are speaking
here, so `ἔφη` picks out the other one" is the wrong instrument once a third
party has been drawn into the address.

(That is the state of the candidate this pass inherited. At `HEAD` the record is
`unresolved` with four candidate owners and a `limits` block, carrying no
`evidence_refs` at all; the anchored licence existed only in the uncommitted
revision this pass edited.)

The owner does not change; the claim the record makes about the text does. It
now carries a `reviewed_attribution` over the hashed context 53803–54121
(`text_sha256` `fc7c7b5a8445f6d7f573b74da5721bef3aa6c0790abb7e085218a34e05a1b01a`),
which opens exactly where the two-party premise fails and closes at the record's
own end, before the next named speaker. Inside it the address returns to one man
and names him: `τὰ δὲ τοιάδε πῶς φῶ ἐπίστασθαι, Εὐθύδημε … φέρε εἰπέ` — a
vocative plus a singular imperative — and this span answers that demand
directly. The context stays inside `turn_euthydemus_0072`, which runs
52005–54176.

### 4a. Record `voice_euthydemus_0416` — the same premise, retired

Re-licensing `0414` retired the 50018 bound from 53803 onward, and an
independent verification pass found that its neighbour `0416` (54140–54176,
`{p} ὅτι οὐκ ἄδικοί εἰσιν οἱ ἀγαθοί.`) still asserted that bound nineteen
characters later, and listed `candidate_owners: ["ΣΩ.", "ΕΥΘ."]`.

Both parts were wrong and both are corrected. The bound claim is struck. ΣΩ. is
dropped because this span answers the narrator's own `ἦν δ’ ἐγώ`-marked `τί;` at
54121, which excludes him; ΔΙΟΝ. is added because the very next named reply in
this exchange is `οὐδαμοῦ, ἔφη ὁ Διονυσόδωρος` at 54293–54324, which is direct
evidence in this passage that naming one brother does not fix which brother
answers. The record stays **unresolved**: the vocative that licensed `0414` sits
134 characters earlier and belongs to the question `0414` answered, not to this
one, and reading the two as one speaker would be the inference chain the
protocol declines.

### 4b. A correction to record `0078`'s prose

The same pass found that `0078`'s reason gave 12552 as the point Dionysodorus
enters. 12552 is the `{p}` paragraph marker; the narration of his entry begins at
12556 and his name is printed at 12607. He had also already spoken at 11588, in
the previous outer turn, so "enters" was the wrong word for what the offset
marks. The reason now reads "takes it over only at 12556". The substantive point
— that he is not a party to this bounded exchange — is unchanged and was
confirmed independently.

### 5. 299d–e is not a textual crux — label correction

Records `0493`–`0497` (spans 60222–60583, `turn_euthydemus_0075`) were carried
in the handoff as one of three "textual cruxes". They are not. The passage
carries no editorial markup — the only markup between 60000 and 60650 is `{p}`
and two Stephanus markers — nothing is bracketed, and no editor need emend
anything. The narration at 60048 is explicit: `καὶ ὁ μὲν Εὐθύδημος ἐσίγησεν· ὁ
δὲ Διονυσόδωρος πρὸς τὰ πρότερον ἀποκεκριμένα τῷ Κτησίππῳ ἤρετο` names the
questioner, names the respondent, and removes the third candidate. What unsettles
it is dramatic, not textual: Ctesippus' next named speech at 60583 addresses
`ὦ Εὐθύδημε`, the brother he had been sparring with, not the one who has just
interrupted.

**No ledger change follows.** The five records stay `unresolved`, and their
reasons — which already say the reading is "further unsettled because Ctesippus'
next named speech addresses ὦ Εὐθύδημε" — are accurate and stand. Only the
"crux" framing is withdrawn, here, so it is not carried forward.

The two genuine cruxes are confirmed and stay `unresolved`:

- **294e**, record `0368` at 49635–49639. The owner of `ὁ δέ, πάνυ, ἔφη` flips on
  whether `{del} τὸν Εὐθύδημον {/del}` is kept: with the bracketed words the
  respondent is Euthydemus, without them `ὁ δέ` picks up the nearest nominative
  `ὁ Διονυσόδωρος`. The source itself records the reading as unsettled.
- **302d–e**, records `0578` and `0580`. The turn names its interlocutor as
  Dionysodorus three times and then has Socrates answer its last question with
  `ὦ Εὐθύδημε`. Recorded for a later reader: the evidence is not symmetric —
  three namings plus the dialogue's regularity that every mid-exchange entrance
  is explicitly named point to ΔΙΟΝ. against one vocative. A future reviewer
  could defensibly resolve it; this review does not.

## Under-resolution recorded, deliberately not changed

The cross-review identified roughly five sites, some 20 records, that are
recoverable from the Greek under the protocol's own list of valid adjudication
inputs — most substantially turn 0016 Parts A and C, where the narration names
the roles (`ὁ δὲ ἤρετο αὐτόν`, `ταῦτα εἴρητο τῷ Εὐθυδήμῳ`, `ὡμολόγει ὁ
Κλεινίας`) and the second-person verbs then point at a named referent. Honest
unresolved is a permitted outcome, unresolved records still tile and still
compile, and nothing here is blocked by them. They are recorded so that a future
pass has a starting list rather than a rediscovery problem, and so that this
acceptance is not read as a claim that 194 spans are unresolvable in principle.

## Verification of this acceptance

A fourth, independent read-only pass re-derived the mechanical claims of this
receipt from the two files rather than from it, matching records to their
historical identities on turn, span overlap and chain without using any numeric
id. It reproduced every number here: 573 records, ids 0001–0600 with exactly the
27 gaps listed, 569 shared with `HEAD`, 493 byte-identical spans, 76 shifted,
**0 disjoint, 0 in a different outer turn**, and the 14 merges / 16 absorbed / 11
deletions decomposition. It confirmed that `0595` and `0596` hold their
historical Crito spans and that the 31133 and 43226 material sits on the new
`0599`/`0600`.

Its coverage was **complete, not a sample**: all 573 records re-checked for
`span_sha256`, all 421 `evidence_refs` byte-verified at their own offsets,
antecedents, depth/chain arithmetic, `chain[0]` equal to the printed speaker,
nesting, prefix consistency, authority-shape exclusivity and context hashes — 0
discrepancies — plus depth-1 tiling of all 33 required turns with no hole and no
overlap. It also read the regions the shrunk spans vacated and found each to be
Socratic narration or address to Crito, correctly returned to the ΣΩ. level.

It raised four findings. Two were real defects in text this receipt had already
accepted and are fixed above (§4a, §4b). One is the merge-id convention, flagged
for ratification (§1). The fourth corrected this receipt itself: the `0414`
description above reflects the candidate this pass inherited, not `HEAD`, and now
says so.

One caveat it recorded, and this receipt keeps rather than resolves: `0414` is
the weakest adjudication in the cohort. 185 characters later the same bare-reply
pattern is answered by Dionysodorus (`οὐδαμοῦ, ἔφη ὁ Διονυσόδωρος`, 54293–54324),
which is evidence inside this very passage that naming one brother does not fix
which brother replies. ΕΥΘ. remains the better-supported reading; a later
reviewer could defend `unresolved`, and the hashed context is there to argue
from.

## What this acceptance does not do

Euthydemus is absent from `derived/plato/voices/cutovers.toml`. No claim,
observation, relation, commentary record or audio artifact changes; no voice
join is written; no claim `speaker` moves. Compiling
`derived/plato/voices/euthydemus.toon` from this ledger is a lane-internal
artifact and authorizes no consumer. Activation remains a separate, explicit
operator decision under `docs/voices-protocol.md`.

Accepting a `reviewed_attribution` record accepts an **adjudication**, not a
quotation. 78 of these 573 records are of that kind. Each cites a bounded Greek
context by offsets and the SHA-256 of its exact bytes, names the locally
plausible owners it chose between, and states the structural ground, so a later
reader who rejects the adjudication can find the bytes it rested on and can
reject all 78 without touching the 301 that rest on cited formulas.
