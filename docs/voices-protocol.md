# Voices Protocol

The voices lane records **who textually owns a character range inside a narrated
turn**. It exists because the turn layer stops at the printed siglum: in a
narrated dialogue the whole banquet is one turn, and every claim inside it
inherited the outer narrator. That attribution was confidently wrong, not
missing.

This lane is structural. It records reported-speech geometry and nothing else.

The repository calls the lane `voices`; the thing it records is **nested
reported turns**. It has no relationship to TTS voice models, and none to the
independent English audio speaker-attribution pipeline under `scripts/audio/`.
Neither reads the other's data.

## Four states, not one

Extracting reported turns, accepting them, compiling them, and letting them
rewrite claim speakers are **four separate events** (the voice activation contract):

| State | Artifact | What it affects |
|---|---|---|
| extracted | `wiki/voices/<dialogue>.md`, `unreviewed` | nothing |
| accepted | the same ledger, `accepted` | nothing outside the lane |
| compiled | `derived/plato/voices/<dialogue>.toon` | nothing outside the lane |
| **activated** | an entry in `derived/plato/voices/cutovers.toml` | claim `speaker`, via the stored join |

Accepted and compiled reported-turn data is a **standalone corpus artifact**. It
is fully validated — freshness, forgery, atomic coverage, nesting, evidence
offsets — and it changes no claim, no observation, no relation, and no audio.

Only an entry in `cutovers.toml` authorizes consumption. Nothing infers
activation: not an accepted ledger, not a compiled index, not a registered
siglum. A dialogue's reported turns may be complete and correct for years
without any claim moving.

## Canonical artifact and tooling boundary

The canonical editable artifact is the **dialogue-local ledger** at
`wiki/voices/<dialogue>.md`. Review is a judgment about that ledger against the
canonical Greek source and the reviewed scope manifest. It is not a judgment
about the program that happened to draft it.

A candidate generator is optional and disposable. It may be dialogue-specific,
used once, or absent. After a draft exists, acceptance does not depend on
rebuilding it, preserving its heuristic inventory, proving that its rules
transfer to another dialogue, or passing generic semantic discovery gates.

Shared code is reserved for mechanical invariants whose meaning does transfer:
source and turn lookup, hashes and exact offsets, containment and nesting,
non-overlap and chain prefixes, evidence shape, review provenance, atomic
accepted projection, compilation freshness, and completeness accounting.
Determining whether Greek transmits direct speech, where a local handoff occurs,
or who owns a bare reply remains source review, not reusable validation.

This separation is why extracting Phaedo's reported turns is **not** blocked by
Phaedo's current claim ledger. Under the old coupling, compiling Phaedo's index
would by itself have stripped `turn_level` attribution from 102 accepted claims,
which made a downstream consumer constraint look like a reason not to record
what the Greek plainly says.

### `cutovers.toml`

A hand-written, reviewed registry — like `sigla.toml`, never generated:

```toml
schema_version = 1

[[dialogues]]
slug = "symposium"
status = "active"
decision_note = "wiki/review/2026-07-25-symposium-voice-cutover-execution.md"
```

- `slug` is unique and must be a canonical dialogue under `raw/plato/greek/`.
- `status` has exactly one allowed value, `active`. There is no `inactive`:
  absence is the non-active state, so a rollback deletes the entry and says so.
- `decision_note` is a repository-relative path under `wiki/review/` that must
  exist and be nonempty.

An **active** dialogue must have a current compiled index, a current stored
join, and claim speakers equal to the owners that join resolves. A **non-active**
dialogue may have a ledger and a compiled index, and must have **no stored
join** — a stored join is materialized claim attribution, so it may exist only
where a reviewed decision authorized it. `derive voice-joins` refuses a
non-active dialogue, and its no-dialogue form iterates active entries only.

Read-only previews (`buildVoiceJoinFromIndex`) stay available for any dialogue.
They write nothing and activate nothing.

## What counts as a nested reported turn

Ruled by the operator during the 2026-07-26 reported-turn corpus scope census.
Until then the standard lived in per-dialogue builder comments and in what the
accepted Symposium and Phaedo cohorts happened to do, which is not a standard
anyone can apply to a dialogue nobody has extracted yet.

> A nested reported turn is a **bounded stretch of direct speech transmitted
> below the printed speaker, licensed by Greek speech machinery.** It is **not**
> every quoted phrase, indirect report, remembered proposition, or argumentative
> recap.

Quotation alone is not enough. Direct speech attributed to another owner **is**
enough — even when the quotation fills the whole printed turn.

| Case | In scope? |
|---|---|
| A whole printed turn that is one quotation (Ion 537a-b, Nestor's speech to Antilochus; Sophist 258d, Parmenides' hexameters under `ὅτι ὁ μέν πού φησιν—`) | **Yes**, when the text attributes the quoted words to another speaker. If that owner is not registered in `derived/plato/voices/sigla.toml`, the record is still required and its owner may be `unresolved` — the words must not be left silently with the printed siglum |
| Verse quoted inside the speaker's own argument (Phaedo 94d, `Ὅμηρος … οὗ λέγει τὸν Ὀδυσσέα:`; Sophist 237a, the same Parmenides lines framed by `ἀπεμαρτύρατο … λέγων` and argued from afterwards) | **No.** The citing speaker keeps the floor and owns the argumentative unit; the quoted poet is not a new local turn owner. The two Sophist rows are the same verse and split on this test alone, so it is the test, not the poet, that decides |
| A named third party's position in indirect report (`Φίληβος φησι` + accusative-and-infinitive) | **No**, unless the Greek transmits bounded direct speech by that speaker |
| `οἱ σοφοί φασιν` and other collective attributions | **Usually no.** Indirect report licenses nothing. If the construction introduces *direct speech* by an unregistered collective, the span is required with an `unresolved` owner — never invent "the wise" as a speaker |
| Bare `φασί` + accusative-and-infinitive with no named subject | **No.** No direct speech and no licensed owner |
| Speech staged under a hypothetical, counterfactual, or future construction (`εἴ τις ἔροιτο· {q} … {/q}`, `φήσει· {q} … {/q}`) | **Yes**, on the same terms as any other reported speech. Mood is not the test — see "Staged direct speech" below |
| Personified `ὁ λόγος` that "says" or "teases" | **No by default** — it is the current speaker's argumentative personification. In scope only where the text stages a bounded direct prosopopoeia comparable to the Laws in Crito, which hold the floor with their own sustained discourse. See the measured test below |
| A printed speaker quoting themselves (Phaedo 88c, Echecrates' quoted self-address) | **No.** The repeated-chain exception belongs to a narrator reporting themselves *inside their own narration*; without a narration level there is no second owner |
| `ἔφησθα` "you said X", recapping an earlier on-stage turn | **No.** The printed turn already owns that speech, and the voice layer must not duplicate it. An utterance made off-stage or before the dialogue has no printed turn and is not a recap |

Scope is recorded per outer turn in `wiki/reported-turn-scopes.json` with a
receipt under `wiki/review/`, and `CMP-REPORTED-TURNS` measures it. A dialogue
with no reviewed census is incomplete; it is never a zero.

### Staged direct speech

Operator ruling, 2026-08-04, the corpus reported-turn completion campaign wave 1 closure. Three parts of this
document previously disagreed about the same Greek, and the disagreement had a
default: the words fell to the printed speaker.

> **Bounded direct speech attributed below the printed speaker remains in scope
> even when hypothetical or counterfactual.** A registered, specifically
> identified owner may be resolved. An indefinite or collective staged owner is
> not registered or invented, but its bounded speech receives an `unresolved`
> child record. Role evidence may resolve only one specific individual;
> inability to resolve a plural is not permission to assign its words silently
> to the printed speaker.

**Mood is not the test.** `εἴ τίς σε ἤρετο· {q} … {/q}` (Protagoras 311b),
`ἐὰν οὖν τις ἡμᾶς ἔρηται, {q} διὰ τί; {/q}` and the future `φήσει, {q} … {/q}`
of 355c–e, and the Crito Laws' own `ἔροιντο` / `εἴποιεν ἄν` / `φαῖεν ἄν` are the
same construction under different moods. If the optative disqualified staged
speech, the Laws — the document's own model of an in-scope prosopopoeia — would
be out of scope. What decides is whether the Greek transmits *bounded direct
speech* and attributes it to someone other than the record that would otherwise
own those bytes.

**Named versus indefinite decides the owner, not the record.** A named,
registered staged speaker is resolved on cited bytes exactly like any other:
Symposium's `ἐπιστὰς ὁ Ἥφαιστος … ἔροιτο` names its subject. An indefinite `τις`,
an `ὁ ἐρόμενος … ὑβριστὴς ὤν`, a collective `οἱ ἄνθρωποι` and a second-person
`ἤρεσθε` name nobody — so the record is written and left `unresolved`, with a
reason describing what the Greek withholds. Writing no record at all is the one
outcome the source does not license, because it returns the words to the printed
speaker, which is the defect this lane exists to remove.

**Where the rule stops.** An `unresolved` record already sits one level below
anything nameable, so nothing nests below it: staged speech inside an unresolved
parent needs no child, and gets none. Speech staged for the printed speaker
themselves adds no owner and is not a new record. And the marks decide the
bounds: where the edition closes and reopens its quotation around a parenthetical
inquit, the narration between belongs to the parent, not to the staged voice.

**Personification: the test is grammatical first.** A personified abstraction is
a staged owner only where the Greek gives it a **nominative subject governing a
finite speech verb**. Crito's Laws do: `ἐλθόντες οἱ νόμοι καὶ τὸ κοινὸν τῆς
πόλεως ἐπιστάντες ἔροιντο` (crito 14854–14915), with `οἱ νόμοι` nominative and
`ἔροιντο` finite, and they are renamed as the nominative subject of a finite
speech verb four further times (15595, 15764, 18215, 21129). Protagoras 361a–c
does not: the subject is `ἡ ἄρτι ἔξοδος τῶν λόγων` — not `ὁ λόγος`, which occurs
in no nominative anywhere in the frame — and `κατηγορεῖν`, `καταγελᾶν` and
`εἰπεῖν ἄν` are all infinitives under Socrates' own finite `δοκεῖ`. The one
finite assertion in that sentence is that something *seems so to him*.

Three further marks confirm it where the grammar is close: `ὥσπερ ἄνθρωπος` is
the text's own simile marker, against the Laws' bodily `ἐλθόντες … ἐπιστάντες`;
`εἰ φωνὴν λάβοι` presupposes there is no voice to transmit, while Socrates
`δοκῶ ἀκούειν` the Laws; and the Laws hold a floor across roughly 10,300
characters of source (crito 14921–25219), interrupted by three printed `ΚΡ.`
turns and by two direct-speech replies from Socrates in his own person
(`{q} οὐ μέμφομαι, {/q} φαίην ἄν`, `{q} καλῶς, {/q} φαίην ἄν`), while the
Protagoras `ἔξοδος` delivers 644 characters in six sentences, asks nothing, and
is answered by nobody.

Note what does *not* distinguish them: both are hypothetical. And this test is
scoped to personification. It is not a general licence — a staged *human*
interrogator who sustains a long answered exchange is in scope under the rule
above, on its own terms, not under this paragraph.

> Do not measure the Laws by summing their `{q}` spans. The `crito.txt` markup
> closes six of them at a Stephanus page marker while the speech continues —
> `{/q} {50b} τῷ ἔργῳ …` at 14982, and likewise at 16371, 16933, 18409, 21163
> and 23744, one of them splitting a noun phrase. The sum is 1,976 characters
> over 18 spans, three of which are Socrates rather than the Laws. The outer
> extent is the honest measure.

## The one rule

**Attribution comes from the text's own speech machinery, never from content.**

Every attribution carries one or more `evidence_refs`, each byte-verified against
the source. A single formula per span proved too narrow for the conversational
core of a narrated dialogue, where most utterances are licensed grammatically
rather than by a naming formula.

| kind | What licenses the attribution | Extra requirement |
|---|---|---|
| `printed_siglum` | A speaker siglum printed in the source | — |
| `named_reporting_formula` | A formula naming the speaker outright (`εἰπεῖν δὴ τὸν Ἐρυξίμαχον`, `φάναι τὸν Ἀγάθωνα`) | A parenthetical introduction may strictly straddle the speech start under the narrow rule below |
| `role_reporting_formula` | The same shape with a role description as the **grammatical subject of the reporting construction**, whether nominative (`ἐξελθὼν ὁ θυρωρός … εἶπεν`, `ὁ τῶν ἕνδεκα ὑπηρέτης`) or in an oblique/accusative-and-infinitive form (`ἄλλον δέ τινα τῶν παίδων ἥκειν ἀγγέλλοντα ὅτι`) | The role must be a registered siglum for that dialogue. The kind stays separate from `named_reporting_formula` so no record claims the source printed a proper name it did not. See the case rule below |
| `anaphoric_reporting_formula` | A formula whose subject is a pronoun (`εἰπεῖν δ' αὐτὸν ὅτι`) | Must cite the antecedent's bytes, and the antecedent must precede the formula. The preceding formula's own named subject is never a licensed antecedent — see below |
| `person_marked_reporting_formula` | A reporting or narratorial formula whose grammatical person identifies the speaker (`καὶ εἶπον`, `ἐγὼ … εἰπών`) | As an exchange anchor, must sit on the declared side of the bounded exchange; morphology remains an operator-review question |
| `closing_formula` | A naming formula printed *after* the span it closes | May sit up to 200 characters after the span |
| `formula_bounded_continuation` | The same active voice continues across an interruption | Must cite evidence **of the same kind** on BOTH sides of the span |
| `anchored_dialogue_turn` | A turn inside an explicitly bounded two-party exchange | Must cite an in-span cue AND `exchange_open` / `exchange_close` anchors |
| `unlabelled_turn_frame` | Greek identifying who speaks a turn the source prints **no siglum** for | Valid **only** on the depth-1 frame record of such a turn. See the section below |

There is deliberately **no `none` kind**. An unresolved record names no owner and
cites no evidence: `evidence_refs` is absent, not populated with a placeholder. A
kind called `none` made the absence of evidence look like a species of evidence,
and let a record carry an entry that no check could ever falsify.

### Case is not the test — `role_reporting_formula` (amended 2026-07-29)

Operator ruling, 2026-07-29, the Symposium re-review. The kind originally read "definite role
description as its **nominative** subject", which was narrower than the Greek it
has to license. Narrated dialogue routinely puts the reporting construction into
accusative-and-infinitive, where the subject of the report is accusative by
grammatical necessity and no nominative is available to cite:

```text
ἄλλον δέ τινα τῶν παίδων ἥκειν ἀγγέλλοντα ὅτι { … }   Symposium 175a
```

`ἄλλον … τινα τῶν παίδων` is the subject of the infinitive `ἥκειν`, with the
reporting participle `ἀγγέλλοντα` in agreement. Under the old wording no kind fit,
so the utterance was inexpressible for a reason about this document. The test is
therefore **the syntactic role, not the case**:

1. The role-denoting phrase must be the **grammatical subject of the reporting
   construction** — nominative subject of a finite reporting verb, or accusative
   subject of a reporting infinitive/participle. An accusative that is the
   *object* of the governing verb is not a subject and licenses nothing. The trap
   worth naming: in `μεταστρεφόμενον αὐτὸν ὁρᾶν τὸν Σωκράτη, ἰδόντα δὲ … εἰπεῖν`
   (Symposium 213b, char 84958) `τὸν Σωκράτη` is the object of `ὁρᾶν`; `ἰδόντα`
   and `εἰπεῖν` belong to `αὐτόν`. A matcher keying on "reporting verb near a
   named accusative" attributes that utterance to the wrong speaker.
2. The phrase must denote **one specific individual** by role. An indefinite
   introduction (`τινα`) does not disqualify it — Greek introduces a
   first-mentioned individual that way — but a genuine plural or collective
   (`φάναι δὴ πάντας`, a vocative `παῖδες`) has no single owner, so this kind
   cannot license it. That is a limit on **resolution**, not on scope: if the
   collective is nonetheless the staged owner of bounded direct speech, the span
   is still recorded, `unresolved`. Amended 2026-08-04 — the earlier wording,
   "is not a reported turn at all", read as a scope exclusion and let a
   collective's words fall back to the printed speaker, contradicting both the
   `οἱ σοφοί φασιν` row above and the staged-speech ruling.
3. The role must be a **registered siglum** for that dialogue, exactly as before.
   Registration is a separate operator decision and licenses nothing by itself.
4. It remains **never** a `named_reporting_formula`. The whole point of the
   separate kind is that the source printed no proper name, and an oblique subject
   does not change that.

This amendment widens which constructions the kind *can* cite. It changes no
existing record, and it does not decide any attribution.

### Turns the source prints no siglum for — `unlabelled_turn_frame`

Operator ruling, 2026-08-01, the corpus reported-turn completion campaign wave 2.

Five required outer turns — the whole of Apology, Charmides, Lysis, Parmenides
and Republic, one turn each — are printed with no speaker siglum at all, and the
turn layer records their speaker as the literal string `(none)`. Until this kind
existed, **no valid depth-1 record could be written for any of them**, and since
every deeper record needs a depth-1 parent, all five ledgers were blocked on
their first line:

- `printed_siglum` byte-checks its text against the Greek, and `(none)` occurs
  zero times in any source file;
- `unresolved` is not available, because `depth` would be the chain length plus
  one and the chain would have to be empty, which is `chain_empty`;
- a `reviewed_attribution` resolving to the frame owner has to invent a second
  candidate to satisfy the two-owner rule, which manufactures ambiguity the
  Greek does not have.

Three things were ruled at once, and the second is the reason the first is safe:

1. **`(none)` is metadata, not a person.** It never enters
   `derived/plato/voices/sigla.toml` and never appears in a `voice_chain`.
   Registering it would put a non-owner at the head of every chain in the work,
   in front of every claim the frame encloses.
2. **`voice_chain[0]` is the outer turn's real owner** — Socrates for Apology,
   Charmides, Lysis and Republic; Cephalus of Clazomenae for Parmenides. On a
   turn that *does* print a siglum the old rule is untouched: `chain[0]` must
   still byte-equal the printed speaker.
3. **The frame record licenses that owner with byte-cited Greek anchors**, under
   this kind. Republic's frame cites `κατέβην` at char 14 — a first-person aorist
   opening the narration — and its vocatives; each anchor is byte-verified
   exactly like every other evidence ref, so the evidence bar is not lowered.

What was deliberately **not** done: `person_marked_reporting_formula` was not
broadened to cover these anchors. Apology's `οὐκ οἶδα` reports no utterance, and
calling it a reporting formula in order to reach the frame would corrupt a kind
that hundreds of ordinary records depend on. A frame anchor says "this turn
prints no speaker and these bytes identify who speaks it" — a different claim
from "these bytes transmit an utterance".

The kind is confined in both directions. A depth-1 record over an unlabelled
turn **must** carry at least one such anchor (`frame_evidence_missing`), and the
kind may appear **nowhere else** (`frame_evidence_unexpected`): on a nested span
whose parent already names an owner it would mean nothing, and it would become a
way to license a deep attribution carrying no reporting formula at all.

## Two authority shapes, and genuine ambiguity

A resolved record carries **exactly one** of two authority shapes. They are
mutually exclusive: explicit text outranks adjudication, so a record that has a
formula cites the formula.

### 1. Explicit evidence — `evidence_refs`

The table above. Byte-verifiable against the source, and unchanged by the Phaedo discourse attribution review.

### 2. Reviewed discourse — `reviewed_attribution`

```yaml
resolution: resolved
reviewed_attribution:
  kind: discourse_resolution
  candidate_owners: ["ΣΩ.", "ΚΕΒ."]
  context_span:
    start_char: 0
    end_char: 0
    text_sha256: "<sha256 of the exact Greek context>"
  rationale: "Cebes asks Socrates; this span is Socrates' direct reply to the named addressee."
```

This exists because Phaedo narrates in **direct speech**. The Symposium's
accusative-and-infinitive gives almost every utterance a formula with an
explicit subject; Phaedo mostly prints a bare `ἔφη` or `ἦ δ᾽ ὅς` that names
nobody. An evidence-only lane therefore marked 288 of 350 Phaedo records
unresolved — a measurement of the extractor, not of the Greek.

Rules:

- `kind` has one value in schema v1: `discourse_resolution`.
- `candidate_owners` is the **locally plausible** set considered during a
  resolved discourse adjudication: unique, registered, and containing the owner
  the chain resolves to.
- `context_span` contains the record, stays inside the same outer turn, and
  hashes to the exact Greek the reviewer read. It is no wider than the handoff
  requires. It must stop at every known interlocutor switch relevant to the
  decision. There is no universal character maximum: source structure, not the
  length of another dialogue's exchange, determines an adequate context.
- `rationale` names structural grounds only.
- There is no confidence score. If review cannot select one owner, the record is
  `unresolved`.
- A `reviewed_attribution` also licenses a chain whose terminal repeats its
  predecessor — a narrator resolved as the speaker of their own bare reply. See
  the 2026-07-30 amendment under "A narrator who is also a participant"; the
  in-span-formula route is unchanged, and a first-person pronoun licenses
  neither route.

The validator checks shape, registry membership, offsets, hashes, nesting, and
review provenance. It cannot check whether the adjudication is *right*; that is
what the accepted review status is for, exactly as with observations and claims.

### How wide a context may be

The `text_sha256` proves which bytes the reviewer read; it does not prove that
those were the right bytes to read. Context must therefore be structurally
bounded:

- it contains the record and remains inside the same outer turn;
- it includes the local evidence needed to see the handoff; and
- it stops at any known formula-free interlocutor switch relevant to the
  decision.

No universal character count can establish those facts. A 500-character window
that crosses a silent switch is unsound, while a sustained exchange may require
more than 12,000 characters without becoming ambiguous. Use the smallest
source-defined context that carries the decision, and explain that boundary in
the rationale. If no defensible boundary distinguishes an owner, record the span
as `unresolved` and say why.

### Global presence is not a candidate set

The superseded premise held that because Socrates, Simmias, Cebes, Crito and the
narrator are all present throughout, no bare formula or vocative discriminates.
That conflates the cast with the local exchange. Four people in the room does
not make four people plausible in every question and answer.

**Valid inputs to a reviewed adjudication**: question/answer adjacency, the
active addressee (including vocatives), grammatical person, pronoun coreference,
a named handoff, and the bounds of a local exchange.

**Never valid, in either shape**: doctrine or philosophical content; style,
register, or vocabulary; an English translation or an external editor's label;
automatic alternation between two speakers; and relabelling previous-speaker
carry-forward as explicit `anaphoric_reporting_formula` evidence — the ruling in
"Rejected: speaker carry-forward inside a bounded exchange" below is untouched.
A reviewed adjudication is a structural reading of a bounded context, not a
licence to guess by turn-taking.

### Genuine ambiguity

```yaml
resolution: unresolved
candidate_owners: ["ΣΩ.", "ΚΕΒ."]
unresolved_reason: "Both remain locally plausible because ..."
```

`unresolved_reason` is required and must explain what the surrounding Greek
leaves undetermined. `candidate_owners` is optional. When the local alternatives
are genuinely knowable, list at least two unique registered owners and explain
why the source fails to discriminate among them. When the text does not justify
an exhaustive set, omit the field instead of inventing names. "There is no
naming formula in this span" describes a drafting method and is not, by itself,
a substantive reason.

### Evidence roles

Every `evidence_refs` entry has a `role`, defaulting to `cue`:

| role | What it is | Where it must sit |
|---|---|---|
| `cue` | Evidence for **this span's** owner | Inside the span (or within the lookback/lookahead bounds for introducing kinds); a named parenthetical introduction may strictly straddle the start |
| `exchange_open` | The formula that opens the bounded exchange the span sits in | Before the span; kind must be one that names a speaker up front |
| `exchange_close` | The formula that closes it | After the span; kind must be one that names a speaker after the fact |

Roles exist because a flanking check that only counts refs on either side cannot
tell an anchor from a cue. Three refs all tagged `anchored_dialogue_turn`, one
before and one after, used to satisfy it — so a record could be "anchored" while
citing no evidence at all about its own speaker. An `anchored_dialogue_turn`
record now needs all three things: a byte-verified grammatical cue **inside** its
span, an opening anchor, and a closing anchor.

### Parenthetical introductions that cross the speech start

Greek indirect-discourse syntax can put the named accusative subject before the
first word of direct speech and its parenthetical reporting verb after that
word. In that one shape, the complete `named_reporting_formula` necessarily
crosses the embedded speech's start: shortening the evidence drops part of the
construction, while widening the speech span assigns enclosing narration to the
embedded voice.

The validator therefore permits a `role: cue` named formula only when it
**strictly straddles the record start** (`ref.start < span.start < ref.end`),
ends within the record, and stays within the 600-character introducing-formula
bound on both sides of the start. This exception does not apply to anaphoric or
person-marked formulas, exchange anchors, formulas crossing the record end, or
any other partially overlapping evidence.

### Anchored dialogue turns

Inside a bounded two-party exchange the text identifies its speakers
grammatically, without naming them:

- **Person-marked reporting verbs.** `ἔφην` is first person, `ἔφη` third. In a
  conversation one party narrates, that distinction is decisive.
- **Vocatives.** A vocative names the *addressee*. In a two-party exchange the
  addressee is not the speaker, so `ὦ Σώκρατες` inside the Diotima conversation
  identifies Diotima as speaking.

This is grammar, not alternation-guessing, and it is checkable: the record must
cite the cue AND anchors on both sides of the span, so a reviewer can verify the
exchange really is bounded and really is two-party. An utterance with no cue, or
with cues for both parties, stays `unresolved`.

Never evidence, in any circumstance:

- what a passage says, argues, or asserts
- that a doctrine matches one known elsewhere as a character's
- that the style, register, or vocabulary "sounds like" someone
- that dialogue alternation implies whose turn it must be
- that the preceding formula named a speaker, so this one has the same one
- anything an editor, translator, or commentator says about the passage

If no text-internal evidence licenses an owner, the span is recorded as
`unresolved` with a reason. **An unresolved span is a result, not a failure.** Filling it by
judgment is the failure.

### Rejected: speaker carry-forward inside a bounded exchange

Ruled 2026-07-25 on the measurements in `wiki/review/2026-07-26-phaedo-discourse-adjudication.md`.
Recorded here because the shape recurs and because a builder can implement it by
accident.

The question put was whether **the named subject of the immediately preceding
reporting formula** may be cited as an `anaphoric_reporting_formula` antecedent,
inside an explicitly bounded stretch of two-party exchange.

**It may not.** A two-party bound narrows the possible referents; it does not
establish antecedent ownership. Since the validator cannot verify that ownership,
the construct would convert a protocol rule into an uncheckable editorial
judgment. A candidate that is the previous formula's own speaker tag is therefore
rejected, and a span whose only candidate is that tag stays `unresolved`.

Why this matters more than it reads: such a record passes every mechanical check.
The validator enforces exactly three things on an antecedent — all three fields
present, the cited bytes matching the source, and the antecedent preceding the
formula — and **nothing ties the cited antecedent to the owner in `voice_chain`.**
So carry-forward emits records that look licensed and are not. In Phaedo's turn
0027, 22 of the 28 anaphoric sites that pass a naive single-candidate test have
the preceding formula's subject as their sole surviving candidate; admitting them
would have been alternation reasoning wearing a byte offset.

Two rejected alternatives, recorded:

- **Reuse `anchored_dialogue_turn`.** Unlicensed here. It requires a bounded
  *two-party* exchange, and Phaedo has four speakers present throughout. An
  amendment would have needed a new bounding construct, not a reuse.
- **Bound the exchange at question boundaries.** The obvious proxy, and false:
  `ἦ δ’ ὅς` follows a question mark in 33% of its Phaedo occurrences, against 56%
  for anaphoric `ἔφη`. It does not mark answers.

The Symposium precedent is controlling and stays intact: its 23 bare Socrates
replies inside the Diotima conversation remain `unresolved`, because Plato writes
them bare. Phaedo is treated identically — its 248 frame-attributed claims stay
where they are. A future cutover there requires new **independently
owner-bearing** evidence, never a looser boundary rule.

## Record shape

```yaml
voice_id: voice_symposium_0011
source_work: Symposium
outer_turn_id: turn_symposium_0005
stephanus_span: 194e-197e
char_span:
  start_char: 46527
  end_char: 52998
source_path: raw/plato/greek/symposium.txt
source_sha256: "<sha256 of the whole Greek source>"
span_sha256: "<sha256 of source.slice(start_char, end_char)>"
voice_chain: ["ΑΠΟΛ.", "ΑΡΙΣΤΟΔ.", "ΑΓΑ."]
depth: 3
resolution: resolved
evidence_refs:
  - kind: named_reporting_formula
    text: "φάναι τὸν Ἀγάθωνα, καὶ οὐδέν με κωλύει λέγειν"
    start_char: 46473
    end_char: 46518
review_status: unreviewed
```

An `anaphoric_reporting_formula` ref adds `antecedent_text`,
`antecedent_start_char` and `antecedent_end_char`. `unresolved` records carry no
`evidence_refs` at all and add `unresolved_reason` instead. They may add
`candidate_owners` when the local alternatives are actually known. A record may
also add `limits` when an exceptional boundary needs explanation; it is optional
informational prose, not an acceptance field and not a place to repeat the
evidence shape.

### Stable, gapped IDs

`voice_id` is a persistent identity, not the record's array position. It must be
unique and keep the dialogue's `voice_<slug>_NNNN` form, but the four-digit
numeric suffix need not be consecutive. Removing or rejecting a record leaves
its ID unused. Adding a record allocates a fresh ID and never renumbers
surviving records.

Ledger order follows source geometry. Consumers must not infer adjacency,
nesting, or chronology from numeric IDs; those facts come from `char_span`,
`depth`, and `voice_chain`.

#### Which ID survives a merge

Ruled 2026-08-04, from the convention both Wave 1 ledgers already applied. When
two or more records are replaced by one, the surviving record keeps a
predecessor's ID rather than a fresh one, and **which** predecessor is not a
matter of taste:

1. **Keep the ID whose attribution claim and licensing evidence the merged
   record preserves** — the predecessor whose `evidence_refs` the merged record
   still reproduces at the same offsets, or whose adjudication it still carries.
2. **Never let an unresolved ID become a different resolved attribution merely
   because it came first.** Position in the file, and being the largest or
   earliest predecessor, decide nothing. An ID that asserted no owner must not
   silently start asserting one, and an ID whose terminal owner was Α must not
   re-emerge owning Β.
3. **If no predecessor uniquely carries the surviving evidence**, keep an ID
   whose boundary and terminal owner remain semantically continuous with the
   merged record — typically the one whose `start_char` the merge preserves
   exactly — and state that choice, and why, in the review receipt.
4. **Absorbed IDs are permanent gaps.** They are never reused, and no surviving
   record is renumbered to close the hole.

The validator cannot check any of this: it sees a unique, well-formed ID either
way. The rule is therefore a review obligation, and a merge that cannot satisfy
rule 1 owes the receipt an explanation under rule 3.

### `voice_chain` and `depth`

`voice_chain` is the narration path, outermost first. Its first element is
always the printed turn speaker.

`depth` is the **nesting level**. On a resolved record it equals the chain
length. On an unresolved record it is the chain length **plus one**: the span
sits one level below anything nameable, because the innermost hop is precisely
what no evidence licenses.

### A narrator who is also a participant

Socrates narrates Euthydemus and Protagoras *and* argues in them; Phaedo narrates
and speaks. The narration level and the speaking level coincide, and the text
marks the difference grammatically: `ἦν δ' ἐγώ` occurs 66 times in Euthydemus and
43 in Protagoras.

**Such an utterance is a record one level below the narration that reports it, and
its owner is the narrator.** Its chain therefore ends on an adjacent repeat:

```yaml
voice_chain: ["ΣΩ.", "ΣΩ."]
depth: 2
resolution: resolved
evidence_refs:
  - kind: person_marked_reporting_formula
    role: cue
    text: "ἦν δ' ἐγώ"
```

The alternative was to leave these utterances at the narration level with no
record of their own. It was rejected because the enclosing record already spans
the whole turn, so a verified narrator utterance and a stretch nobody examined
would compile to the same owner by inheritance — which is the defect this lane
exists to remove, readmitted for one voice. Registering a second siglum for the
narrator-as-character was rejected too: it splits one person into two owners in
`claim.speaker`, and the Greek prints `ἐγώ`, not a new name.

Two conditions bound the exception, both enforced:

1. **Adjacent only, once.** `[ΣΩ., ΣΩ.]` says the narrator speaks inside their
   own narration. `[ΣΩ., ΚΛΕΙΝ., ΣΩ.]` says a voice re-enters after another held
   the floor, which no formula licenses; `[ΣΩ., ΣΩ., ΣΩ.]` stacks the same claim
   on itself. Both are `chain_repeats_siglum`, as before.
2. **One of the two authority shapes, aimed at that hop.** A resolved record
   whose own owner is the repeat must carry either a
   `person_marked_reporting_formula` with `role: cue` printed inside its span, or
   a `reviewed_attribution`. With neither it is `chain_repeat_unlicensed`, and
   the utterance is `unresolved` — not the narrator's by default.

A repeat deeper in the prefix carries no cue requirement: it was licensed by the
ancestor record that terminates on it, which prefix consistency and nesting
already require to exist. An `unresolved` record carries neither shape, so its
chain is the licensed prefix and the same reasoning applies.

Nothing here licenses attribution by alternation. In a narrated dialogue the
absence of `ἔφη` is not evidence of `ἐγώ`.

#### Amendment, 2026-07-30: the reviewed route to a repeated terminal

Condition 2 originally admitted the in-span formula **only**. Combined with the
exclusivity of the two authority shapes, that made a reviewed resolution to a
repeated terminal structurally impossible: the adjudication path carries no
`evidence_refs`, so it could never supply the cue the licence demanded. A
narrator's own bare reply inside their own narration was unresolvable however
conclusively the local Greek identified its owner — while a resolution to any
*other* owner in the same exchange went through without difficulty. That
asymmetry is a defect in the contract, not a finding about the text.

The operator's ruling extends the licence to `reviewed_attribution`, which
already exists for exactly this work: structural resolution from grammatical
person, response adjacency, addressee, and the bounds of a hashed context. The
Symposium's Socrates replies inside the Diotima conversation
(`ΑΠΟΛ. → ΑΡΙΣΤΟΔ. → ΣΩ. → ΣΩ.`) each sit adjacent to an `ἔφη`/`ἦ δ’ ἥ`-marked
Diotima turn; `οἶσθα οὖν ἅ μοι δέδοκται;` at 217d is the question Socrates' own
`ἔφη`-marked next utterance answers. Where a review can read that, the record is
`resolved` by adjudication rather than parked as ambiguous.

Two things did **not** change:

- **The explicit-evidence path.** Without a `reviewed_attribution`, a repeated
  terminal still requires the in-span `person_marked_reporting_formula`. The
  ruling adds a route to the conclusion; it does not lower the evidence bar.
- **What counts as a reporting formula.** A first-person **pronoun** is not one.
  `μοι`, `ὡμολόγηκα` and the like are real person marking and belong in the
  adjudication's hashed `context_span` and its `rationale` — never in
  `evidence_refs` as a reporting formula. Grammatical person remains what
  separates the narrator speaking from the narrator reporting; it does not
  become byte-citable evidence by being present.

Condition 1 is untouched. A reviewed adjudication cannot license a chain that
re-enters a voice after another held the floor, or one that stacks the same
voice three deep — both remain `chain_repeats_siglum`. Neither can it license
attribution by alternation or previous-speaker carry-forward; the prohibitions
under "Never valid, in either shape" apply to this route exactly as to the
other.

### Sigla

Chain elements come from `derived/plato/voices/sigla.toml`, which follows the
conventions of `derived/plato/turns/sigla.toml` with one difference of kind: the
turn registry records sigla **as printed**, and drives turn segmentation. The
voice registry records identifiers for **attributed voices**, most of which the
source never prints as sigla at all. Registering a voice siglum asserts nothing
about the source; the licensing evidence is always the `evidence_refs` on the
record.

Extending the registry is a reviewed commit, never a script.

## Geometry, enforced by the validator

1. Every span nests inside its `outer_turn_id` span.
2. Spans at the same depth do not overlap.
3. A depth-N span nests strictly inside exactly one depth-(N−1) span. Partial
   overlap is `ambiguous_intersection`, not a tolerated approximation.
4. A deeper span's chain extends its enclosing span's chain (prefix
   consistency). A chain may not repeat a siglum, except for the single adjacent
   pair a narrator reporting themselves requires — see below.
5. `source_sha256` matches the Greek source and the turn layer's; `span_sha256`
   matches the bytes actually cited; `stephanus_span` describes the range.
6. Every `evidence_refs` entry matches the source bytes at its offsets exactly.
   Introducing kinds sit inside their span or within 600 characters before it;
   `closing_formula` may sit within 200 characters after it. An
   `anchored_dialogue_turn` needs an in-span `cue` plus `exchange_open` and
   `exchange_close` anchors of speaker-naming kinds; a
   `formula_bounded_continuation` needs refs **of that same kind** before and
   after.
7. **Any turn carrying at least one voice record is tiled by them.** A turn is
   either fully covered or untouched. This is the invariant that makes the lane
   safe: there is no hole for a record to fall into and quietly inherit the
   printed turn speaker.
8. Derived voice artifacts record the sha of their input and fail validation
   when stale.
9. **Rejected records are tombstones and are excluded from live geometry.**
   See below.

### Rejected records: one geometry, not two

A rejected record must be replaced by an accepted record over the same region.
If rejected records also counted as live spans, that mandatory replacement would
itself trip `overlap_same_depth` — and no ledger containing a rejection could
ever be both valid and compilable. The compiler and the validator would disagree
about the same file.

So the two sides split the work:

- The **validator** excludes rejected records from overlap, nesting, and
  coverage checks. Their own fields (bytes, hashes, chain) are still validated.
- The **compiler** pays for that exemption by requiring the tombstoned interval
  to be **completely** re-covered by accepted records at least as deep. Partial
  overlap is not replacement: a one-character accepted span used to satisfy the
  old check while the rest of a rejected child's range fell back to its parent.

Removing a record that had already been reviewed is itself a review action, and
`packages/harness/src/review-provenance.ts` requires the same canonical review
receipt as changing a status does.

## Acceptance is incremental by dialogue and atomic per turn

Accepting a parent span without its deeper children would hand the children's
characters back to the parent — for the Symposium, the Diotima region reverting
to Socrates. That is the exact error this lane exists to prevent. The unit of
acceptance is therefore one complete outer-turn cohort, not one record and not
the whole dialogue.

For an outer turn to enter the accepted projection:

1. it has at least one accepted record;
2. its accepted records tile the turn;
3. every non-accepted record's interval is **completely** re-covered by accepted
   records at least as deep as it; and
4. every accepted deep record has an accepted parent.

Otherwise that turn compiles to nothing, and any attempt to consume it as
accepted authority fails rather than falling back to the printed speaker.

Different outer turns may advance independently **in the static ledger**. A
dialogue may therefore hold some atomically accepted cohorts while later
cohorts remain unreviewed, without a generator overwriting the accepted work.
This does not authorize a partial compiled index: authoritative compilation
remains dialogue-wide and refuses until every turn the ledger speaks about has
a complete accepted tiling. `CMP-REPORTED-TURNS` likewise requires every outer
turn in the reviewed scope to reach terminal atomic acceptance before the
dialogue is complete.

## Authority is a stored artifact, and it is checked

Consumers do not rebuild authority from the ledger on the fly. `buildVoiceJoin`
and the migration read the **stored** `derived/plato/voices/<dialogue>.toon`
through `readVoiceIndex`, which refuses four ways it can lie:

| failure | what it means |
|---|---|
| orphaned | the index exists but its ledger does not |
| empty | zero records, which the join would read as "this dialogue has no embedded voices" |
| stale | the ledger, Greek source, or turn index has moved underneath it |
| forged | the bytes do not match what the ledger deterministically compiles to |

The forgery check recompiles from the ledger and compares byte for byte, so it
also re-runs the validator and the atomic-cohort projection. A hand-written
index over an unreviewed ledger cannot be used as authority.

A zero-record index is never written. Authority requires at least one accepted
record; an empty file is not "no opinion", it is the assertion that the dialogue
has no embedded voices, and every claim would return to its printed turn siglum.

The full ledger validator also runs **inside** authoritative compilation. A
ledger that `bun run validate` would reject must never become authoritative — the
derived layer cannot be valid and invalid at the same time.

The stored join is authority material too, not a disposable report. Once an
authoritative voice index exists, full validation requires the join to exist and
to name and hash that exact index plus the current claim and observation
ledgers. It must also byte-match a deterministic rebuild, so preserving the
headers while editing a row still fails. A join with no voice index is orphaned
and fails as well.

## Derived layer

```
wiki/voices/<dialogue>.md                     reviewed ledger
  -> derived/plato/voices/<dialogue>.toon     accepted records only
  -> derived/plato/joins/voices/<dialogue>.toon   observation + claim join
                                                  (ACTIVE dialogues only)
```

**Only `accepted` records compile, and authoritative compilation is
dialogue-wide.** If any turn the ledger speaks about lacks a complete atomic
accepted projection, compilation refuses and writes no voice index. It never
silently omits that turn or emits an accepted parent without its children,
because either shape would let downstream code fall back to the printed speaker.
A zero-record index is likewise never written: an empty artifact would falsely
assert that the dialogue has no embedded voices.

Compilation is independent of activation: a dialogue whose ledger cohorts are
all atomically accepted may compile without becoming a claim-speaker consumer.
The third line is the consumer step and requires an entry in `cutovers.toml`.

A turn counts as accepted voice authority according to the **compiled index**,
not merely because candidate rows exist in the ledger. The compiler therefore
waits for every ledger cohort even though reviewers may commit complete status
changes turn by turn. Activation remains all-or-nothing and is unavailable
until every required cohort is complete.

The compiled index preserves the authority distinction. A record resolved by
`reviewed_attribution` compiles with `resolution_basis: reviewed_discourse`; one
resolved by cited bytes keeps its `evidence_kinds`/`evidence_count` and gains
nothing. `resolution_basis` is a trailing optional column, emitted only for
indexes that contain at least one adjudicated record — so a dialogue resolved
entirely from explicit text serializes exactly as it did before. A reviewed
resolution must never compile to a bare `resolved` row with zero evidence:
a consumer could not then tell an adjudicated owner from a licensed one.

The join lives one directory below the observation-turn joins because
`packages/harness/src/site/data.ts` scans `derived/plato/joins/*.toon` and parses
every file there as an observation-turn join.

Regenerate with:

```bash
bun run harness derive voices <dialogue>
bun run harness derive voice-joins <dialogue>
```

### Join outcomes

The join emits two tables. `voice_joins` carries one row per observation and
claim; `stance_voices` carries one row per stance event. `outer_turn_speaker` is
always reported and always separate from the `owner`.

| `status` | `attributed` | Meaning |
|---|---|---|
| `resolved` | true | Every cited range lands on one resolved voice, which owns the record |
| `turn_level` | true | Exact cited ranges land only on ordinary printed turns with one siglum owner (possibly across several such turns) |
| `cross_voice` | false | Cited ranges land on more than one terminal voice. `owner_chain` reports the longest chain prefix they share |
| `unresolved_span` | false | The covering span exists but licenses no owner |
| `needs_anchor` | false | Exact support is absent, missing, or its possible locations yield different attribution outcomes. A request for better anchoring, NOT a judgment that the claim is cross-voice |
| `no_coverage` | false | A cited range falls outside every span in a voiced turn. Validation forbids this; it surfaces a broken ledger as data instead of a wrong speaker |

## Claim ownership versus stance actors

**A claim's owner comes from the textual support for the claim itself, never
from its stance events.** A claim asserted by Diotima and later challenged by
Socrates has one owner and two actors. Folding all citations into one speaker
decision made ordinary argumentative exchange look cross-voice, which is wrong:
being contradicted does not make a claim stop belonging to whoever made it.

Each stance event joins independently in `stance_voices`. The claim row's
`trajectory` column reports the voices that participate:

| rendering | meaning |
|---|---|
| `(single)` | one voice owns the claim and speaks every stance event, and nothing was left unresolved |
| `Α>Β` | several resolved voices participate |
| `Α>(unresolved)` | some participants are known, at least one is not |
| `(unresolved)` | no participant resolved to any voice |

`(single)` is an assertion, so it is reserved for a trajectory that is genuinely
complete AND genuinely one voice. It previously also rendered for rows where no
voice had been identified at all — reporting "one voice throughout" about a
record the join could not attribute.

**Joined is not resolved.** Every stance event gets a row; a row whose status is
`cross_voice` or `unresolved_span` names no actor. Reporting the row count as the
resolved count overstates the lane's reach.

## Exact claim-support ranges

A claim's canonical `source_ref` is a Stephanus context window. In a narrated
dialogue that window routinely spans several utterances by different voices —
`claim_symposium_0106` cites 202d–202e, which contains a Socrates question
between the two Diotima utterances the claim rests on. The window is therefore
the wrong unit for attribution.

Ownership is decided from exact support ranges instead:

1. If the whole context window sits inside one voice, that voice owns the claim.
   Anchoring exists to rescue windows that cross voices, not to add a hurdle
   where none exists.
2. If review supplies `speaker_source_ref`, resolve that exact range through the
   accepted voice/turn authority. It is an owner anchor, not a second copy of
   the claim's semantic evidence:

   ```yaml
   speaker_source_ref:
     source_path: raw/plato/greek/meno.txt
     start_char: 6159
     end_char: 6253
     text_sha256: 5fed8a0a170217ab13a4d48ca321717da03b723667fc71d9b0ccbe80e10b0b00
   ```

   The field is optional, but when present all four values are required. The
   path must equal the claim's canonical Greek source, the non-empty range must
   be wholly contained by the claim `source_ref`, and the hash must match those
   exact bytes. Runtime never uses the stored `speaker` to choose this range or
   to recover from an invalid one.
3. Otherwise, locate the claim's reviewed `greek_terms` **inside its own window**.
   Multiple noncontiguous ranges are normal and expected.

   The complete canonical claim block is parsed with Bun's YAML parser; terms
   are not tokenized with a comma splitter or recovered by field-order regexes.
   Commas inside a quoted scalar and apostrophes inside a valid unquoted scalar
   therefore remain part of that one term. A claim citing
   `["εὖ ἂν ἔχοι, ὦ Ἀγάθων, εἰ τοιοῦτον εἴη ἡ σοφία …"]` cites one term, not
   three fragments. Named parsing also prevents `speaker_source_ref` from being
   mistaken for a stance-event citation.
4. A term occurring exactly once yields an exact byte-verified range.
5. A term **absent** from its own window is unverifiable evidence and fails
   closed, whatever the located terms say. Its silence must not be read as
   assent: the missing term could sit in the other voice.
6. A term occurring **more than once** is not an anchor gap but a set of
   candidates. Attribution enumerates the possible selections, choosing one
   occurrence per ambiguous term alongside every unique term, and resolves each
   selection normally. `needs_anchor` is used only when those possible selections
   yield different attribution outcomes. If every selection deterministically
   yields the same `resolved`, `cross_voice`, or `unresolved_span` result, that
   result is preserved; ambiguity in location has not created ambiguity in
   attribution.

   The rejected wider rule was "resolve when the uniquely located terms agree",
   which ignores the ambiguous terms entirely.
7. The owner resolves when every support range maps to the same innermost voice.
   Ranges landing on different voices are genuinely `cross_voice`.

The join reports `support_unique_ranges`, `support_candidate_ranges`, and
`support_candidate_choices` separately. Candidate ranges count located
occurrences; candidate choices count the Cartesian attribution cases actually
evaluated, so the two values need not be equal.

A broad window crossing voices is **never** grounds for `needs_split` when the
exact support ranges identify one owner.

## Claim `speaker` semantics

In an **activated** dialogue, `speaker` means **the innermost textually licensed
owner of the claim** — not the outer printed turn siglum. In every other
dialogue it keeps its pre-cutover meaning, and the presence of reported-turn
data does not change that.

Within an activated dialogue this is a hard cutover. There is no compatibility
field, no alias, and no fallback. Narration structure survives in the join's
`outer_turn_speaker` and `voice_chain`, which is the only place it is
represented.

The registry also gates which sigla a claim may name. Voice sigla are a
pre-registered superset, so they license a claim `speaker` only in an activated
dialogue — the same point at which validation starts requiring every accepted
claim's speaker to equal its resolved owner. A standalone compiled index widens
nothing.

A claim is eligible for migration when its exact support ranges resolve to one
owner. A `cross_voice`, `unresolved_span`, or `needs_anchor` claim **cannot
remain accepted with a guessed speaker**: it goes through the normal review lane
for `needs_split`, rejection, or better anchoring. Editing a speaker by hand from
what the claim says is the one thing this lane exists to prevent.

### The migration is all-or-nothing

`--plan` reports, including the blocking set. `--apply` refuses unless every
accepted claim in scope resolves to one owner. Migrating the resolved ones while
leaving accepted-but-unresolved claims behind would leave two meanings of
`speaker` in one ledger — "innermost licensed owner" for some rows and "outer
printed turn siglum" for others — and no reading of that ledger is correct.

Once a dialogue is **activated**, `bun run validate` enforces that every
accepted claim resolves to one owner and that its materialized `speaker` equals
that owner. Differing stance actors never violate ownership. For a non-active
dialogue this check is silent, however much accepted reported-turn data it
holds.

Activation is therefore part of the cutover commit, not a follow-up: a new
registry entry lands together with the authoritative join and the migrated claim
speakers. Deleting an entry is a destructive semantic rollback — it returns
claim attribution to the printed turn siglum — and requires an explicit operator
decision, never an automatic cleanup.

`--verify` checks the exact voice-index hash recorded by `--apply`, the
deterministically regenerated stored join, and **every currently accepted
claim**. It does not inspect only the claims that changed: authority can drift
under a claim whose speaker happened to be already correct during the original
migration.

The cutover therefore has one deliberate transient interval: after deriving the
accepted voice index and before applying speakers and regenerating the join, the
repository is intentionally not in its final validation state. Run the sequence
without substituting an intermediate full validation: derive voices, plan,
apply, derive voice-joins, verify, then run full validation.

## Review

Voice records are reviewed like every other lane: `unreviewed` → `accepted` /
`rejected` / `needs_split`. Changing any `review_status` requires a canonical
rationale receipt under `wiki/review/`, enforced by
`packages/harness/src/review-provenance.ts`. The receipt, rather than duplicate
status prose in several files, is the review authority.

A reviewer checks that the cited formula is really there, really names that
speaker, and really bounds that span — not that the attribution is plausible.

Review has two passes with different jobs:

1. **Primary source review:** read the entire required Greek scope, including
   gaps between candidates. If an opening sample exposes a systematic defect,
   stop, repair that class, and restart the affected scope instead of completing
   a known-invalid reread.
2. **Targeted independent re-review:** check every changed, high-risk, and
   ambiguous record, plus a documented sample of unchanged records and covered
   gaps. Escalate to a second complete reread only when the targeted pass finds
   systematic defects or unreliable scope accounting.

During ledger edits, run focused parser, geometry, and dialogue checks. At
dialogue closure, run the full validator once, compile and verify the accepted
index, and refresh the tracked completeness report once. Run full CI once at
wave closure. Completeness output is a milestone artifact, not an every-edit
scratch report.

## Change control

Extending `evidence_kind`, `resolution`, or the record schema requires editing
this document and `packages/harness/src/wiki/voices-validator.ts` in the same
commit, following the pattern `docs/apparatus-protocol.md` set.
