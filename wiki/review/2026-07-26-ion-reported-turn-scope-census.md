# ion: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/ion.txt`, sha256 `0528d703134b2f59f3db31bad84bafb320e5022e1d7660cf64d72034cb29c93d`
**Turn index**: `derived/plato/turns/ion.toon`, sha256 `ee3abe4fdf0a3e4a2df28dc53553c928f3e337cd1dc1803ae84537c30fcdfadb`, 172 printed-siglum turn(s)
**Disposition**: `required` — 2 outer turn(s) carry nested reported turns
**Reviewers**: two passes. Pass A, an independent reviewer working from the Greek source and the outer-turn index alone, blind to any other pass, to this repository's existing ledgers, and to any earlier census. Pass B, the executing reviewer, who ran a separate mechanical cue scan over every outer turn span and read every turn that carries a reporting cue or quotation marker but was called `no`, which is the direction in which a wrong answer is silent. Disagreements were settled by reading the Greek, and every call that turned on a standard rather than on the text is recorded below.

## Standard applied

A nested reported turn is a bounded stretch of direct speech transmitted below
the printed speaker, licensed by Greek speech machinery. It is not every quoted
phrase, indirect report, remembered proposition, or argumentative recap. Quotation
alone is not enough; direct speech attributed to another owner is enough, even when
the quotation fills the whole printed turn. The case table is in
`docs/voices-protocol.md`, "What counts as a nested reported turn", ruled by the
operator on 2026-07-26 during this census.

This is a scope census, not speaker resolution. It creates, resolves, and changes
no record, and it confers no authority on any claim.

## Method

Mechanical cue scan over each outer turn's exact character span, then reading.

- Cues: `ἔφη`, `ἔφην`, `φησί(ν)`, `φάναι`, `ἔφασαν`, `εἶπε(ν)`, `εἰπεῖν`, `εἶπον`,
  `εἰπών`, `ἦ δ’ ὅς`, `ἦν δ’ ἐγώ`, `ἠρόμην`, `ἤρετο`, `ἀπεκρίνατο`, `ὑπολαβών`,
  `λέγει`/`ἔλεγε(ν)`, and the source's own `{q}` and `{quote}` markers. A cue count
  is a candidate count, never an answer.
- Two orthographic traps are load-bearing, both found by independent review of an
  earlier count that got them wrong: the source uses two elision marks (U+2019 and
  U+1FBD Greek koronis) and prints the same pronoun with two accents (`ἦ δ’ ὅς` and
  `ἦ δ’ ὃς`). A pattern matching one member of either pair silently drops real cues.
  Greek is also not matched with `\b`, which is ASCII-only in JavaScript regexes.
- `{q}` marks quoted strings generally, including mentioned words, and `{quote}`
  marks cited verse. Neither is evidence on its own; both were read.
- Every hit was read in context. A turn is `yes` only on Greek that transmits
  another owner's direct speech, and `no` only after every hit in it was read.

Candidate hits located and inspected: 119.
Turns with no cue and no quotation marker: 113.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

2 of 172 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_ion_0089` | ΙΩΝ. |
| `turn_ion_0120` | ΣΩ. |

The remaining 170 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_ion_0089`
- `turn_ion_0120`

## Ambiguous boundary decisions

- `turn_ion_0120` → **yes**: Turns on a case the ruling does not decide head-on: bounded direct speech attributed COUNTERFACTUALLY to a present interlocutor. It satisfies the standard on every stated element — bounded ({q}…{/q}), direct (vocative ὦ Σώκρατες, second-person εὑρίσκεις, imperative ἴθι μοι ἔξευρε), licensed by Greek speech machinery (σοῦ ἐρομένου, εἰ ἔροιό με), and owned by ΙΩΝ., below the printed ΣΩ. The nearest ruled case is the personification row, which is about ὁ λόγος and preserves the Laws-in-Crito standard for a staged speaker holding the floor with sustained discourse; Ion holds it here for four clauses. If the reconciler rules that a counterfactual utterance is never 'transmitted', this turn flips to no and the dialogue's disposition depends on turn_ion_0089 alone. The two Homeric {quote} blocks later in this same turn (Theoclymenus' prophecy 539a-b, the Iliad bird-omen 539b-d) are NOT the reason for the yes: both sit inside Socrates' continuing argument and fall under the Phaedo 94d row, Theoclymenus notwithstanding his naming formula (ἃ ὁ τῶν Μελαμποδιδῶν λέγει μάντις πρὸς τοὺς μνηστῆρας, Θεοκλύμενος). Greek: σκέψαι δή, σοῦ ἐρομένου, εἰ ἔροιό με· {q} ἐπειδὴ {538e} τοίνυν, ὦ Σώκρατες, τούτων τῶν τεχνῶν ἐν Ὁμήρῳ εὑρίσκεις ἃ προσήκει ἑκάστῃ διακρίνειν, ἴθι μοι ἔξευρε καὶ τὰ τοῦ μάντεώς τε καὶ μαντικῆς, ποῖά ἐστιν ἃ προσήκει αὐτῷ οἵῳ τʼ εἶναι διαγιγνώσκειν, εἴτε εὖ εἴτε κακῶς πεποίηται {/q} — σκέψαι ὡς ῥᾳδίως τε καὶ ἀληθῆ ἐγώ σοι ἀποκρινοῦμαι.

## Inspected cue hits that yield no reported turn

- `turn_ion_0057`: ἠρόμην / ἔλεγον recap the printed speaker's own earlier on-stage question and statement. No direct speech, and no owner below ΣΩ. Ruling row: ἔφησθα recap of an on-stage turn. Greek: ἐπεὶ καὶ περὶ τούτου οὗ νῦν ἠρόμην σε, θέασαι ὡς φαῦλον … παντὸς ἀνδρὸς γνῶναι ὃ ἔλεγον
- `turn_ion_0066`: Bare φασίν + accusative-and-infinitive with an unnamed collective subject and no transmitted direct speech. Ruling rows: οἱ σοφοί φασιν (usually no) and bare φασί + acc-inf with no named subject (no). Greek: καὶ οἱ ἄλλοι πάντες μέ φασιν εὖ λέγειν
- `turn_ion_0068`: A two-word phrase of Tynnichus' paean cited inside Socrates' own argument about divine possession, with Socrates keeping the floor before and after. The standard excludes 'every quoted phrase', and the Phaedo 94d row governs: quoted words used inside the speaker's argument do not create a new local turn owner. Same turn: λέγουσι … οἱ ποιηταὶ ὅτι … τὰ μέλη ἡμῖν φέρουσιν is ὅτι-indirect (third person, ἡμῖν from Socrates' viewpoint), not ὅτι-recitativum. Greek: τὸν δὲ παίωνα ὃν πάντες ᾁδουσι … ἀτεχνῶς, ὅπερ αὐτὸς λέγει, {534e} {q} εὕρημά τι Μοισᾶν. {/q}
- `turn_ion_0088`: The naming/introducing formula for the quotation that follows in turn_ion_0089. The utterance itself lies outside this turn; the request transmits nothing. The formula is available as introducing evidence for the record in 0089 (it begins 103 characters before that turn's start, within the 600-character introducing bound). Greek: εἰπὲ δή μοι ἃ λέγει Νέστωρ Ἀντιλόχῳ τῷ ὑεῖ, παραινῶν εὐλαβηθῆναι περὶ τὴν καμπήν …
- `turn_ion_0116`: Homeric narration, not a character's speech, quoted inside Socrates' argument with Socrates holding the floor on both sides in the same turn. Phaedo 94d row. Greek: καὶ λέγει πως οὕτως — {quote} οἴνῳ πραμνείῳ, φησίν, ἐπὶ δʼ αἴγειον κνῆ τυρὸν κνήστι χαλκείῃ· παρὰ δὲ κρόμυον ποτῷ ὄψον· {/quote} ταῦτα εἴτε ὀρθῶς λέγει Ὅμηρος εἴτε μή …
- `turn_ion_0118`: Homeric narration quoted inside Socrates' argument, Socrates holding the floor. Phaedo 94d row. Greek: τί δέ, ὅταν λέγῃ Ὅμηρος — {538d} {quote} ἡ δὲ μολυβδαίνῃ ἰκέλη ἐς βυσσὸν ἵκανεν … {/quote} ταῦτα πότερον φῶμεν ἁλιευτικῆς εἶναι τέχνης …
- `turn_ion_0126`: ἔφησθα recapping Ion's own earlier printed turns (0112, 0114), in indirect form. Ruling row: on-stage recap. The same disposition covers turns 0075 (τὸ τεκμήριον εἶπες), 0108 (τῶν ἐπῶν ὧν εἶπες, recapping Ion's recitation in 0089), 0128 and 0150 (ὡμολόγεις), and 0170 (ὑποσχόμενος … καὶ φάσκων ἐπιδείξειν — an off-stage promise, but reported indirectly with no bounded direct speech, so it does not reach the off-stage carve-out). Greek: οὐ μέμνησαι ὅτι ἔφησθα τὴν ῥαψῳδικὴν τέχνην ἑτέραν εἶναι τῆς ἡνιοχικῆς;
- `turn_ion_0148`: Bounded direct speech in {q} markers, but ἐγὼ ἠρόμην and the vocative ὦ Ἴων make its owner the turn's own printed speaker (ΣΩ.). Not transmitted BELOW the printed speaker. The hypothetical reply is not transmitted either. This is the exact structural mirror of turn_ion_0120 and confirms the construction tracks the owner rather than the mood. Greek: ἀλλʼ εἴ σʼ ἐγὼ ἠρόμην· {q} ποτέρᾳ δὴ τέχνῃ, ὦ Ἴων, γιγνώσκεις τοὺς εὖ ἱππαζομένους ἵππους; ᾗ ἱππεὺς εἶ ἢ ᾗ κιθαριστής; {/q} τί ἄν μοι ἀπεκρίνω;

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. Every one of the 172 turns was read in full Greek, the two required turns are the only ones in the dialogue carrying bounded direct speech below the printed speaker, and the ruling names turn_ion_0089 by Stephanus reference. The one residual uncertainty is turn_ion_0120's counterfactual mood, recorded in borderline; it is a question about the standard, not about the Greek, and its answer changes the outer-turn list but not the disposition, since turn_ion_0089 is required either way.
