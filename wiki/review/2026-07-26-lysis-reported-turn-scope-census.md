# lysis: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/lysis.txt`, sha256 `c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35`
**Turn index**: `derived/plato/turns/lysis.toon`, sha256 `acb69848a3e34f6465b67dadcd76009bd5a27b6195f4feb4ba47833c6cf67534`, 1 printed-siglum turn(s)
**Disposition**: `required` — 1 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 37.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 1 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_lysis_0001` | (none) |

The remaining 0 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_lysis_0001`

## Ambiguous boundary decisions

- `turn_lysis_0001` → **yes**: Not uncertain as a census call — recorded because the case is unusual and matters downstream. Lysis prints no sigla at all: one outer turn, speaker (none), spanning the whole source. The direct speech is therefore transmitted below a printed speaker that does not exist, so the ruling's condition ('transmitted below the printed speaker, licensed by Greek speech machinery') is met by the reporting formulas alone. This is the reported-speech voice attribution rollout defect class 2, not class 1, so there is no printed siglum to root a voice_chain on. Greek: turn index row: turn_lysis_0001 | (none) | 203a | 223b | 0 | 41070

## Inspected cue hits that yield no reported turn

- `turn_lysis_0001`: 215c-216a. RULED NO by this ruling (Φίληβος φησι row: indirect report is not a nested turn; yes only if the Greek transmits bounded direct speech). My first pass called this a borderline yes. The whole stretch is accusative-and-infinitive and oblique optative throughout (ἀναγκαῖον εἶναι, δέοι, εἴη, ἀπολαῦσαι) with no line of direct speech and no nominative direct address anywhere in it; the speaker is an unnamed του. It is Socrates recounting a remembered argument, not another voice holding the floor. Does not flip the turn, which is required many times over on direct speech elsewhere. Greek: ἤδη ποτέ του ἤκουσα λέγοντος … ὅτι τὸ μὲν ὅμοιον τῷ ὁμοίῳ … πολεμιώτατοι εἶεν· καὶ δὴ καὶ τὸν Ἡσίοδον ἐπήγετο μάρτυρα, λέγων ὡς ἄρα … καὶ τἆλλα δὴ πάντα οὕτως ἔφη ἀναγκαῖον εἶναι … ἐπεξῄει τῷ λόγῳ μεγαλοπρεπέστερον, λέγων ὡς ἄρα παντὸς δέοι τὸ ὅμοιον τῷ ὁμοίῳ φίλον εἶναι
- `turn_lysis_0001`: 212e. Phaedo 94d row. Verse cited with a naming formula inside Socrates' own argument (he cites it in order to call the poet a liar); the poet does not become a local turn owner. Greek: ἀλλὰ ψεύδεθ’ ὁ ποιητής, ὃς ἔφη— {quote} ὄλβιος, ᾧ παῖδές τε φίλοι καὶ μώνυχες ἵπποι καὶ κύνες ἀγρευταὶ καὶ ξένος ἀλλοδαπός; {/quote}
- `turn_lysis_0001`: 214a. Phaedo 94d row, compounded by the οἱ σοφοί φασιν row: the subject is the collective οἱ ποιηταί, introduced by indirect report (φασιν ποιεῖν φίλους αὐτούς) with one illustrative hexameter. No individual voice takes the floor; Socrates' own sentence runs straight through the verse into καὶ ποιεῖ γνώριμον. Greek: λέγουσι δέ πως ταῦτα, ὡς ἐγᾦμαι, ὡδί— {quote} αἰεί τοι τὸν ὁμοῖον ἄγει θεὸς ὡς τὸν ὁμοῖον {/quote} καὶ ποιεῖ γνώριμον
- `turn_lysis_0001`: 215c-d. Phaedo 94d row. Two Hesiod lines adduced as testimony (μάρτυρα) inside the anonymous man's argument, which is itself ruled no above. Hesiod never holds the floor. Greek: τὸν Ἡσίοδον ἐπήγετο μάρτυρα, λέγων ὡς ἄρα— {quote} καὶ κεραμεὺς κεραμεῖ κοτέει καὶ ἀοιδὸς ἀοιδῷ {/quote} {215d} {quote} καὶ πτωχὸς πτωχῷ, {/quote}
- `turn_lysis_0001`: 214e, 216e. Personified-λόγος row: no by default. These are the argument 'indicating' and 'permitting', not a staged speaker; there is no bounded direct prosopopoeia anywhere in lysis comparable to the Laws in Crito. Checked all 3 occurrences of λόγος as a grammatical subject of a speech-like verb; none of them speaks. Greek: ὁ γὰρ λόγος ἡμῖν σημαίνει ὅτι οἳ ἂν ὦσιν ἀγαθοί … ὥσπερ οὐδ’ ὁ ἔμπροσθεν λόγος ἐᾷ
- `turn_lysis_0001`: 216e, 217c, 219a, 220e. ἔφησθα row: all four ἔφαμεν are recaps of agreements reached on-stage earlier in this same turn. The original passages already own that speech; the recap must not duplicate the voice layer. Same for τὰ ὡμολογημένα ἡμῖν at 218c. Greek: οὐδὲ μὴν τὸ ὅμοιον τῷ ὁμοίῳ ἔφαμεν ἄρτι· ἦ γάρ; … ἀδύνατον γὰρ ἔφαμεν κακὸν ἀγαθῷ φίλον εἶναι … ὁ κάμνων, νυνδὴ ἔφαμεν, τοῦ ἰατροῦ φίλος … ἕνεκα ἑτέρου φίλου φίλα ἔφαμεν εἶναι ἐκεῖνα
- `turn_lysis_0001`: 205c-d. Ctesippus describes the content of Hippothales' poems and songs in indirect discourse (ὑποδέξαιτο, oblique optative) and never quotes a word of them. Not every quoted-or-summarized composition is a nested turn; nothing direct is transmitted. Verified: no {quote} marker and no direct speech in the whole Hippothales-poem passage. Greek: ἃ δὲ ἡ πόλις ὅλη ᾁδει … ταῦτα ποιεῖ τε καὶ λέγει … τὸν γὰρ τοῦ Ἡρακλέους ξενισμὸν πρῴην ἡμῖν ἐν ποιήματί τινι διῄει, ὡς … ὑποδέξαιτο τὸν Ἡρακλέα … ἅπερ αἱ γραῖαι ᾁδουσι
- `turn_lysis_0001`: 216c. A proverb invoked inside Socrates' own sentence, in infinitive construction, attributed to no speaker. Not direct speech and no candidate owner. Greek: κινδυνεύει κατὰ τὴν ἀρχαίαν παροιμίαν τὸ καλὸν φίλον εἶναι
- `turn_lysis_0001`: Statements about speech with nothing transmitted, the class the accepted Phaedo census ruled false-positive on τί οὖν δή ἐστιν ἅττα εἶπεν ὁ ἀνήρ. Each sits inside an utterance whose real cue is the adjacent ἔφη / ἦν δ’ ἐγώ. Greek: ὀκνεῖς εἰπεῖν Σωκράτει τοὔνομα (204c); οὐ ῥᾴδιον, ἦν δ’ ἐγώ, εἰπεῖν (206c); κἂν παῖς εἴποι (205c); τούτων δέ τι, ἔφη, σταθμᾷ … ὧν ὅδε λέγει; (205a)
- `turn_lysis_0001`: 210e. The words have the shape of direct address (vocative ὦ Ἱππόθαλες, second-person σύ), but Socrates states outright that he did not say them — ὀλίγου ἐξήμαρτον, 'I nearly blundered', and ἐπῆλθε μοι εἰπεῖν, 'it occurred to me to say'. An unuttered thought is not a bounded stretch of transmitted speech. The closest call in the dialogue after the 215c stretch, and it changes nothing. Greek: καὶ ὀλίγου ἐξήμαρτον· ἐπῆλθε γάρ μοι εἰπεῖν ὅτι οὕτω χρή, ὦ Ἱππόθαλες, τοῖς παιδικοῖς διαλέγεσθαι, ταπεινοῦντα καὶ συστέλλοντα, ἀλλὰ μὴ ὥσπερ σὺ χαυνοῦντα καὶ διαθρύπτοντα

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high, because the one outer turn covers the whole source and is decided by dozens of byte-verified bounded direct-speech formulas naming four distinct in-scene voices, none of which any row of the case table touches. The ruling narrowed the sub-cases inside the turn — the 215c-216a report drops out — but could not have emptied the list. The only residual risk is at record level, not census level: the anonymous man's stretch and the poem summaries will need re-checking when spans are drawn.
