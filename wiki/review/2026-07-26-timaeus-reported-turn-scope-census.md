# timaeus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/timaeus.txt`, sha256 `ba7a86cdfb7df9582d07ce98814a270baa0412c4bd8eeeaa361d74db43d2a53f`
**Turn index**: `derived/plato/turns/timaeus.toon`, sha256 `0c3ebdfe987f3224455427bd3bcd9ce9faeafb2740968e421a0bf4a01fc05165`, 113 printed-siglum turn(s)
**Disposition**: `required` — 6 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 51.
Turns with no cue and no quotation marker: 87.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

6 of 113 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_timaeus_0037` | ΚΡ. |
| `turn_timaeus_0038` | ΚΡ. |
| `turn_timaeus_0039` | ΚΡ. |
| `turn_timaeus_0040` | ΚΡ. |
| `turn_timaeus_0041` | ΚΡ. |
| `turn_timaeus_0062` | ΤΙ. |

The remaining 107 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_timaeus_0037`
- `turn_timaeus_0038`
- `turn_timaeus_0039`
- `turn_timaeus_0040`
- `turn_timaeus_0041`
- `turn_timaeus_0062`

## Ambiguous boundary decisions

- Ruling applied: turn_timaeus_0035 yes->no: `Φίληβος φησι` + content case. εἶπεν … ὅτι μεγάλα καὶ θαυμαστὰ τῆσδ’ εἴη παλαιὰ ἔργα τῆς πόλεως is ὅτι + optative indirect report of Solon, doubly indirect (ὡς ἀπεμνημόνευεν … ὁ γέρων). No {q} markers, no bounded direct speech.
- Ruling applied: turn_timaeus_0063 yes->no: `Φίληβος φησι` + content case. The 42a-42d stretch is oratio obliqua governed by νόμους τε τοὺς εἱμαρμένους εἶπεν αὐταῖς, ὅτι at the end of turn 0062 — an unbroken chain of optatives (ἐμφυτευθεῖεν, εἴη, βιώσοιντο, ἕξοι, μεταβαλοῖ, λήξοι, ἀφίκοιτο) with no first/second person and no quotation markers. A remembered/reported proposition, not transmitted direct speech.
- `turn_timaeus_0040` → **yes**: Whole-turn quotation with no attributing formula inside the turn: the Egyptian priest's direct speech runs continuously from τὸν οὖν ἱερέα φάναι· at the end of 0039 through the end of 0041, and the printed ΚΡ. siglum is re-set at 23e and 24e purely because this source restarts a line-start siglum after a page/section break — the {q} {q} pair closes and immediately reopens at every such split. Decided yes by the whole-turn-quotation case (attributed to another speaker by the doubled quotation markup plus the surrounding formula and the ὦ Σόλων vocatives in 0039 and 0041). The residual uncertainty is only whether a per-turn census should count a mechanically split segment as its own required turn. Greek: ΚΡ. {q} {q} τὸ δ’ ἀκριβὲς περὶ {24a} πάντων ἐφεξῆς εἰς αὖθις κατὰ σχολὴν αὐτὰ τὰ γράμματα λαβόντες διέξιμεν … ἔξωθεν ὁρμηθεῖσαν ἐκ τοῦ Ἀτλαντικοῦ πελάγους. {/q} {/q}
- `turn_timaeus_0063` → **no**: The closest call under the ruling. εἶπεν αὐταῖς is genuine speech machinery and the decrees are a bounded stretch with a clear owner (the demiurge, the same voice that speaks directly in 0062), so a reviewer could read 42a-42d as one reported turn. Called no because the Greek is entirely oratio obliqua — optatives throughout, no first or second person, no quotation markers — which is exactly the indirect-report exclusion. Note the practical consequence: the demiurge's ordinances are then attributed to Timaeus, while the immediately preceding address at 41a-41d is not. Greek: νόμους τε τοὺς εἱμαρμένους εἶπεν αὐταῖς, ὅτι γένεσις πρώτη μὲν ἔσοιτο τεταγμένη μία πᾶσιν … [0063] ὁπότε δὴ σώμασιν ἐμφυτευθεῖεν … ἀφίκοιτο εἶδος ἕξεως

## Inspected cue hits that yield no reported turn

- `turn_timaeus_0035`: Indirect report (ὅτι + optative), not bounded direct speech. Ruled out by the `Φίληβος φησι` case. Flipped from the first pass. Greek: πρὸς δὲ Κριτίαν τὸν ἡμέτερον πάππον εἶπεν, ὡς ἀπεμνημόνευεν αὖ πρὸς ἡμᾶς ὁ γέρων, ὅτι μεγάλα καὶ θαυμαστὰ τῆσδ’ εἴη παλαιὰ ἔργα τῆς πόλεως ὑπὸ χρόνου καὶ φθορᾶς ἀνθρώπων ἠφανισμένα
- `turn_timaeus_0063`: Continuation of εἶπεν αὐταῖς, ὅτι from the end of turn 0062, wholly in oratio obliqua. Indirect report → no nested turn. Flipped from the first pass. Greek: ὁπότε δὴ σώμασιν ἐμφυτευθεῖεν ἐξ ἀνάγκης … πρῶτον μὲν αἴσθησιν ἀναγκαῖον εἴη μίαν πᾶσιν … εἰς τὸ τῆς πρώτης καὶ ἀρίστης ἀφίκοιτο εἶδος ἕξεως
- `turn_timaeus_0005`: εἰπεῖν is the complement of ἐπέταξα. A statement about speech; nothing transmitted. Greek: ἆρ’ οὖν μέμνησθε ὅσα ὑμῖν καὶ περὶ ὧν ἐπέταξα εἰπεῖν;
- `turn_timaeus_0023`: Argumentative recap of the previous day's agreement in indirect discourse; ἔφαμεν is first person plural and includes the printed speaker. Also the `ἔφησθα` recap case in its plural form. Greek: ἆρ’ οὐ μεμνήμεθα ὡς τοὺς ἄρχοντας ἔφαμεν καὶ τὰς ἀρχούσας δεῖν … μηχανᾶσθαι
- `turn_timaeus_0025`: Same shape as 0023. Greek: καὶ μὴν ὅτι γε τὰ μὲν τῶν ἀγαθῶν θρεπτέον ἔφαμεν εἶναι
- `turn_timaeus_0031`: Reference to Timaeus' immediately preceding ON-STAGE turn (turn_timaeus_0028/0030 region) and to Critias having introduced a story. The recap case: the printed turn already owns that speech. Greek: καθάπερ εἶπεν Τίμαιος ὅδε, ὦ Σώκρατες … ὅδε οὖν ἡμῖν λόγον εἰσηγήσατο ἐκ παλαιᾶς ἀκοῆς
- `turn_timaeus_0034`: Two citation tags. No direct speech in the turn; Critias states the fact in his own words and keeps the floor. The quoted-source-inside-my-own-argument shape of the Phaedo 94d ruling. Greek: ὡς ὁ τῶν ἑπτὰ σοφώτατος {20e} Σόλων ποτ’ ἔφη … καθάπερ λέγει πολλαχοῦ καὶ αὐτὸς ἐν τῇ ποιήσει·
- `turn_timaeus_0036`: A question asking what deed Critias related. Statement about speech, no transmitted utterance. Greek: ἀλλὰ δὴ ποῖον ἔργον τοῦτο Κριτίας οὐ λεγόμενον μέν, ὡς δὲ πραχθὲν ὄντως … διηγεῖτο κατὰ τὴν Σόλωνος ἀκοήν;
- `turn_timaeus_0042`: Closing frame of the Atlantis report. καθάπερ ὅδ’ εἶπεν recaps Hermocrates' on-stage turn 0031; the other two refer to speech acts without transmitting words. The priest's own speech closed with {/q} {/q} at the end of 0041. Greek: οὕτω δή, καθάπερ ὅδ’ εἶπεν … καὶ δὴ καὶ τοῖσδε εὐθὺς ἔλεγον ἕωθεν αὐτὰ ταῦτα … οὓς ἔλεγεν ὁ ἱερεύς
- `turn_timaeus_0046`: Ordinary infinitive in the printed speaker's own discourse. Greek: ἀνάγκη θεούς τε καὶ θεὰς ἐπικαλουμένους εὔχεσθαι … ἑπομένως {27d} δὲ ἡμῖν εἰπεῖν
- `turn_timaeus_0048`: Ordinary infinitive; ὁ λέγων ἐγώ is the printed speaker naming himself. Greek: εἰ δὲ ὃ μηδ’ εἰπεῖν τινι θέμις … μεμνημένους ὡς ὁ λέγων ἐγὼ {29d} ὑμεῖς τε οἱ κριταὶ
- `turn_timaeus_0058`: The world-soul 'declares'. Personified speech-attribution with no transmitted words and no floor handed over — the personified `ὁ λόγος` case, no by default. Greek: λέγει κινουμένη διὰ πάσης ἑαυτῆς ὅτῳ τ’ ἄν τι ταὐτὸν ᾖ

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high — the direct/indirect line the ruling draws is unusually clean in this dialogue because the source marks direct speech explicitly with {q}/{/q}, and those markers occur in exactly the six required turns and nowhere else in 148,409 characters. The two flipped turns are unambiguous oratio obliqua (ὅτι + optative in both). The one call I would expect a second reviewer to contest is turn 0063, recorded as borderline.
