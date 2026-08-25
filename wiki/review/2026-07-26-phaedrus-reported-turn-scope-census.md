# phaedrus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/phaedrus.txt`, sha256 `89a2de0f0f71b79700d2bfa84ab29ffad10576c333949cc8ec08fc152667261c`
**Turn index**: `derived/plato/turns/phaedrus.toon`, sha256 `99106f1748e8506a919c4ea341527c9d2e608ebced3c1ee87089fb37093942ee`, 401 printed-siglum turn(s)
**Disposition**: `required` — 21 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 266.
Turns with no cue and no quotation marker: 250.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

21 of 401 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_phaedrus_0039` | ΦΑΙ. |
| `turn_phaedrus_0040` | ΦΑΙ. |
| `turn_phaedrus_0041` | ΦΑΙ. |
| `turn_phaedrus_0042` | ΦΑΙ. |
| `turn_phaedrus_0069` | ΣΩ. |
| `turn_phaedrus_0070` | ΣΩ. |
| `turn_phaedrus_0074` | ΣΩ. |
| `turn_phaedrus_0075` | ΣΩ. |
| `turn_phaedrus_0076` | ΣΩ. |
| `turn_phaedrus_0077` | ΣΩ. |
| `turn_phaedrus_0160` | ΣΩ. |
| `turn_phaedrus_0201` | ΦΑΙ. |
| `turn_phaedrus_0225` | ΦΑΙ. |
| `turn_phaedrus_0276` | ΣΩ. |
| `turn_phaedrus_0278` | ΣΩ. |
| `turn_phaedrus_0282` | ΣΩ. |
| `turn_phaedrus_0286` | ΣΩ. |
| `turn_phaedrus_0319` | ΣΩ. |
| `turn_phaedrus_0331` | ΣΩ. |
| `turn_phaedrus_0348` | ΣΩ. |
| `turn_phaedrus_0349` | ΣΩ. |

The remaining 380 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_phaedrus_0039`
- `turn_phaedrus_0040`
- `turn_phaedrus_0041`
- `turn_phaedrus_0042`
- `turn_phaedrus_0069`
- `turn_phaedrus_0070`
- `turn_phaedrus_0074`
- `turn_phaedrus_0075`
- `turn_phaedrus_0076`
- `turn_phaedrus_0077`
- `turn_phaedrus_0160`
- `turn_phaedrus_0201`
- `turn_phaedrus_0225`
- `turn_phaedrus_0276`
- `turn_phaedrus_0278`
- `turn_phaedrus_0282`
- `turn_phaedrus_0286`
- `turn_phaedrus_0319`
- `turn_phaedrus_0331`
- `turn_phaedrus_0348`
- `turn_phaedrus_0349`

## Ambiguous boundary decisions

- Ruling applied: turn_phaedrus_0011 yes->no: `Φίληβος φησι` + content. `λέγει γὰρ ὡς χαριστέον μὴ ἐρῶντι μᾶλλον ἢ ἐρῶντι` is Phaedrus' indirect report of Lysias' thesis; no bounded direct speech.
- Ruling applied: turn_phaedrus_0017 yes->no: `Φίληβος φησι` + content. `οἷς ἔφη διαφέρειν τὰ τοῦ ἐρῶντος ἢ τὰ τοῦ μή` is indirect report of Lysias.
- Ruling applied: turn_phaedrus_0056 yes->no: `ἔφησθα` recapping an earlier ON-STAGE turn. `{q} ἐπεθύμει μὲν λέγειν, ἐθρύπτετο δέ· {/q}` recaps Socrates' own printed turn at 228c, which already owns those words. The other two quotations in the turn are Phaedrus' own would-be words and a Pindar tag used inside his argument (Phaedo 94d).
- Ruling applied: turn_phaedrus_0124 yes->no: Phaedo 94d. `{q} ἔδοξέ {/q} πού φησιν {q} τῇ βουλῇ {/q} …` is four phrase-level fragments of a decree formula exhibited inside Socrates' argument, with Socrates interrupting mid-quotation (`—τὸν αὑτὸν δὴ λέγων … ὁ συγγραφεύς—`). Quotation alone, not a bounded stretch of direct speech.
- Ruling applied: turn_phaedrus_0162 yes->no: personified `ὁ λόγος` no-by-default. The λόγοι's testimony is delivered under `διαμαρτυρομένων λόγων, ὅτι …` (indirect), and the one independent sentence carries `φησὶν ὁ Λάκων`, i.e. a maxim cited inside Socrates' argument (Phaedo 94d). The source's own quotation markup, which marks even one-word fragments elsewhere in this file, marks nothing here.
- Ruling applied: turn_phaedrus_0262 yes->no: `Φίληβος φησι` + content. Prodicus' saying is accusative-and-infinitive (`ηὑρηκέναι ἔφη … δεῖν δὲ οὔτε μακρῶν οὔτε βραχέων`), indirect throughout.
- Ruling applied: turn_phaedrus_0268 yes->no: `Φίληβος φησι` + content. Thrasymachus' claim is attributed by a bare parenthetical `ὡς ἔφη` fused into Socrates' own syntax.
- Ruling applied: turn_phaedrus_0279 yes->no: indirect report. `εἰπεῖν ἂν οἶμαι ὅτι μαίνεται ἅνθρωπος` is ὅτι + third person about the man, not direct speech, and the source marks no quotation. It is Phaedrus' indirect answer to the quoted speech in 0276/0278, not a further transmitted turn.
- Ruling applied: turn_phaedrus_0280 yes->no: indirect report. `τις λέγοι ὡς ἐπίσταται … οἴεται παραδιδόναι` is ὡς + third person, unmarked by the source's quotation markup.
- Ruling applied: turn_phaedrus_0284 yes->no: indirect report. `ὁ Σοφοκλῆς … ἂν φαίη … τὰ πρὸ τραγῳδίας ἀλλ’ οὐ τὰ τραγικά` transmits an accusative phrase, not an utterance.
- Ruling applied: turn_phaedrus_0327 yes->no: bare `φασί` + accusative-and-infinitive with no named subject. The whole turn is that construction; Tisias is named only in adjacent turns, which the ruling does not accept as licensing.
- Ruling applied: turn_phaedrus_0383 yes->no: indirect report plus personified `ὁ λόγος` no-by-default. `ἠκούσαμεν λόγων, οἳ ἐπέστελλον λέγειν Λυσίᾳ …` relays the λόγοι's injunction in indirect discourse with no bounded direct speech.
- Ruling applied: turn_phaedrus_0395 yes->no: indirect report. `παρὰ τῶνδε τῶν θεῶν … ἐξαγγέλλω` is a closing attribution over Socrates' own prophecy (`δοκεῖ μοι …`, `μαντεύομαι`); no divine utterance is transmitted.
- `turn_phaedrus_0331` → **yes**: Turns on 'direct speech attributed to another owner is enough' against 'quotation alone is not enough'. It is genuine first-person direct speech with its own owner (the weak-but-brave defendant), marked by the source, and parallel in kind to the accepted {q} ὦ μοχθηρέ, μελαγχολᾷς, {/q} in 0282. Against: it is a single clause embedded in an accusative-and-infinitive relay of Tisias' precept, so the surrounding unit is Socrates' argument, which is the Phaedo 94d shape. Greek: ἐκείνῳ δὲ καταχρήσασθαι {273c} τῷ {quote} πῶς δ’ ἂν ἐγὼ τοιόσδε τοιῷδε ἐπεχείρησα; {/quote}
- `turn_phaedrus_0234` → **no**: The closest thing in this dialogue to the Ion whole-turn row: four verses of first-person direct speech by a speaking monument, attributed to another owner at 264c (ὃ Μίδᾳ τῷ Φρυγί φασίν τινες ἐπιγεγράφθαι), filling most of a 310-character turn. Called no because Socrates quotes it precisely to argue about the reorderability of its lines — the verse is used inside his argument, which is the Phaedo 94d row. If the reconciler weights the Ion row more heavily this flips. Greek: ἔστι μὲν τοῦτο τόδε— {quote} χαλκῆ παρθένος εἰμί, Μίδα δ’ ἐπὶ σήματι κεῖμαι … {/quote}
- `turn_phaedrus_0093` → **no**: Second-person direct address by a named poet (Stesichorus to Helen), introduced by a composing verb. Called no because the three lines sit inside a 1008-character turn whose argument is that Socrates must recant as Stesichorus did — Phaedo 94d. The same verses are echoed non-quoted at 244a as Socrates' own opening, which supports his owning the argumentative unit. Greek: ἅτε μουσικὸς ὢν ἔγνω τὴν αἰτίαν, καὶ ποιεῖ εὐθύς— {quote} οὐκ ἔστ’ ἔτυμος λόγος οὗτος, οὐδ’ ἔβας ἐν νηυσὶν εὐσέλμοις … {/quote}
- `turn_phaedrus_0162` → **no**: It continues the prosopopoeia that 0160 stages, and the shift out of the ὅτι-clause into an independent indicative with a parenthetical φησίν is a recognised direct-discourse marker. Called no because the ruling's default for personified λόγοι is no, the content is governed by ὅτι, and the source's quotation markup — which marks single words elsewhere in this file — marks nothing here. Greek: ὥσπερ γὰρ ἀκούειν δοκῶ τινων προσιόντων καὶ διαμαρτυρομένων λόγων, ὅτι ψεύδεται … τοῦ δὲ λέγειν, φησὶν ὁ Λάκων, ἔτυμος τέχνη …
- `turn_phaedrus_0103` → **no**: The palinode (turns 0103-0116) is attributed to Stesichorus by an introducing formula that resembles the Lysias handover. Firmer as a no under this ruling than under the brief: no direct speech is transmitted below ΣΩ. anywhere in it, Socrates addresses ὦ παῖ καλέ in his own person, and it closes at 257a-b with his own prayer naming Φαῖδρός τε καὶ ἐγώ. The Stesichorus attribution is authorship of a genre, not a floor handover. A flip would move 14 turns at once. Greek: ὃν δὲ μέλλω λέγειν, Στησιχόρου τοῦ Εὐφήμου, Ἱμεραίου. λεκτέος δὲ ὧδε
- `turn_phaedrus_0070` → **yes**: Turn membership, not the call itself, is what is uncertain here. The non-lover's speech is licensed once at 237b (ἔλεγέν τε ὧδε—) and then runs across six ΣΩ. turns with Socrates' own asides interleaved at the seams of 0070, 0074 and 0077, and with 0072 (σιγῇ τοίνυν μου ἄκουε …) wholly outside it. 0070, 0074 and 0076 carry no reporting cue of their own and were caught only by reading every long cue-free turn. The corpus reported-turn completion campaign will have to cut the interior boundaries by hand; the turn-level answer is yes for 0069, 0070, 0074, 0075, 0076, 0077 and no for 0071, 0072, 0073. Greek: ΣΩ. δόξης μὲν οὖν ἐπὶ τὸ ἄριστον λόγῳ ἀγούσης … ἔρως ἐκλήθη. {p} ἀτάρ, ὦ φίλε Φαῖδρε, δοκῶ τι σοί …

## Inspected cue hits that yield no reported turn

- `turn_phaedrus_0008`: Pindar fragment syntactically integrated into Socrates' own clause as the object of ποιήσασθαι. Quotation alone; no direct speech, no other owner. Same for 0084 (Ibycus, governed by ἐδυσωπούμην), 0148 (`οὔτοι ἀπόβλητον ἔπος` as subject of εἶναι δεῖ) and 0254 (`κατόπισθε μετ’ ἴχνιον ὥστε θεοῖο` adverbial to διώκω). Greek: οὐκ ἂν οἴει με κατὰ Πίνδαρον {quote} καὶ ἀσχολίας ὑπέρτερον πρᾶγμα {/quote} ποιήσασθαι
- `turn_phaedrus_0111`: Phaedo 94d. Two hexameters in the third person, cited inside Socrates' argument about what gods call Eros; no character speaks, and the owner is an anonymous collective. Greek: λέγουσι δὲ οἶμαί τινες Ὁμηριδῶν … ὑμνοῦσι δὲ ὧδε— {quote} τὸν δ’ ἤτοι θνητοὶ μὲν ἔρωτα καλοῦσι ποτηνόν … {/quote}
- `turn_phaedrus_0142`: Impersonal λέγεται introducing a legend; the cicadas' reporting to the Muses is described but never transmitted. Same class as 0325 (`λέγεται … τὸ τοῦ λύκου εἰπεῖν`) and 0351 (`οἱ δέ γ’ … ἔφησαν` with an unnamed plural subject). Greek: λέγεται δ’ ὥς ποτ’ ἦσαν οὗτοι ἄνθρωποι … ἀπαγγέλλειν τίς τίνα αὐτῶν τιμᾷ
- `turn_phaedrus_0147`: Bare accusative-and-infinitive with no named subject. No direct speech and no licensed owner. Greek: οὑτωσὶ περὶ τούτου ἀκήκοα … οὐκ εἶναι ἀνάγκην τῷ μέλλοντι ῥήτορι …
- `turn_phaedrus_0164`: Socrates addresses the personified λόγοι; the addressee is not an owner and nothing of theirs is transmitted. Same for 0165 (ΦΑΙ. ἐρωτᾶτε.) and 0166 onward, where the conceit is dropped and Socrates resumes his own second-person questioning. Greek: πάριτε δή, θρέμματα γενναῖα, καλλίπαιδά τε Φαῖδρον πείθετε … ἀποκρινέσθω δὴ ὁ Φαῖδρος.
- `turn_phaedrus_0336`: Personified ὁ λόγος, no-by-default: a parenthetical tag inside Socrates' own sentence, not a staged prosopopoeia. Greek: ἔσται μήν, ὡς ὁ λόγος φησίν, ἐάν τις ἐθέλῃ
- `turn_phaedrus_0038`: Phaedrus' own two words of handover. Lysias' speech begins at the start of turn_phaedrus_0039; the boundary is recorded so the required range is unambiguous. Greek: ΦΑΙ. ἄκουε δή.
- `turn_phaedrus_0014`: Representative of the largest false-positive class: λέγειν / λέγεις / εἰπεῖν as statements about speech (requests, refusals, ‘you speak well’, ‘what do you mean’). Roughly 180 of the 266 inspected hits are of this kind. Greek: ἐκέλευέν οἱ λέγειν … δεομένου δὲ λέγειν τοῦ τῶν λόγων ἐραστοῦ, ἐθρύπτετο ὡς δὴ οὐκ ἐπιθυμῶν λέγειν

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high for the required set. The ruling made the dialogue much easier to decide, because the source's own {q}/{quote} markup is fine-grained enough to mark single words, so its silence is informative: with two exceptions (both licensed by explicit handover formulas and both verified by reading the Greek at the seam) every bounded direct speech in Phaedrus is marked. Remaining risk is concentrated in three quoted-verse calls at the Ion/Phaedo-94d boundary (0234, 0093, and by the same reasoning 0111), all called no and all recorded in borderline, and in the interior boundaries of the non-lover's speech, which affect record geometry rather than the turn-level disposition.
