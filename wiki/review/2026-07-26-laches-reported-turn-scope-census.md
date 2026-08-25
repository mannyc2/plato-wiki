# laches: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/laches.txt`, sha256 `a035988ad66603bb28bb451b1b1d53131e572518198a5dbc6f78cb121d97803f`
**Turn index**: `derived/plato/turns/laches.toon`, sha256 `a365d1f042afa8cc5fa25a2318ac35f4f126872222d27864fdc3b2d167806669`, 265 printed-siglum turn(s)
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

Candidate hits located and inspected: 244.
Turns with no cue and no quotation marker: 151.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 265 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_laches_0099` | ΣΩ. |

The remaining 264 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_laches_0099`

## Ambiguous boundary decisions

- Ruling applied: turn_laches_0002 yes->no: `Φίληβος φησι` + content / bare `φασί` + acc.-and-inf. — every report in the turn is indirect discourse (εἰσηγήσατο … ὅτι … εἴη; οὗτοι … φασιν πείσεσθαι; λέγοντες ὅτι …). No bounded direct speech, so no nested turn. The utterances are off-stage, so the recap row does not apply, but the direct-speech requirement decides it on its own.
- Ruling applied: turn_laches_0005 yes->no: `ἔφησθα` recap of an ON-STAGE turn, and indirect. ὡς ὅ γε ἔλεγεν ὁ Λυσίμαχος ἄρτι … ὅτι … recaps turns 0001-0003, which already own that speech under ΛΥ.; duplicating it in the voice layer is exactly what the ruling forbids.
- Ruling applied: turn_laches_0054 yes->no: indirect report throughout. ἐπηγγέλλοντό με οἷοί τ’ εἶναι ποιῆσαι is acc.-and-inf.; καθάπερ ἄρτι Λάχης … διεκελεύετο is an on-stage recap; ἐρωτᾶν λέγοντα ὅτι ὁ μὲν Σωκράτης οὔ φησιν ἐπαΐειν … γεγονέναι is a scripted future utterance in ὅτι-clause plus acc.-and-inf. None of it is transmitted direct speech.
- Ruling applied: turn_laches_0056 yes->no: `ἔφησθα` recap of an ON-STAGE turn, and indirect. εὖ γὰρ καὶ τοῦτο λέγει ὅδε, ὅτι … restates what Socrates said at 185a, which his own printed turn already owns. ἐξ ἀρχῆς ἐντεῦθεν ἠρχόμην λέγων, ὅτι … is additionally the printed speaker recapping himself.
- Ruling applied: turn_laches_0156 yes->no: `Φίληβος φησι` + content — πολλάκις ἀκήκοά σου λέγοντος ὅτι … is a remembered proposition in indirect discourse, not bounded direct speech. Socrates' habitual statements have no printed turn in this dialogue, so the on-stage-recap row does not decide it; the direct-speech requirement does.
- `turn_laches_0099` → **yes**: Turns on the boundary between the whole-turn-quotation row and the Phaedo 94d row. For yes: this is bounded direct speech — the source's own {q}/{/q} markers bound it, τίς με ἔροιτο is the licensing speech machinery, the utterance has its own illocutionary force and addresses the printed speaker by name (ὦ Σώκρατες), and Socrates then answers it, so the passage has a local turn structure rather than a citation lodged in his sentence. The ruling states direct speech attributed to another owner is enough. Against: the questioner is counterfactual (potential optative ἔροιτο), so no utterance was ever made, and the exchange is a methodological illustration inside Socrates' argument — the same shape of reasoning that gives Homer no record at Phaedo 94d. I call it yes because the Phaedo rationale is that the verse is not a new local turn owner, and here a distinct speaker does hold the floor for a complete utterance in the source's own quote markers. This is the only call in laches I cannot settle beyond reasonable disagreement, and the whole disposition rests on it: rule it no and laches becomes `none`. Greek: εἰ τοίνυν τίς με ἔροιτο· {q} ὦ Σώκρατες, τί λέγεις τοῦτο ὃ ἐν πᾶσιν ὀνομάζεις ταχυτῆτα εἶναι; {/q} εἴποιμ’ ἂν {192b} αὐτῷ ὅτι …

## Inspected cue hits that yield no reported turn

- `turn_laches_0087`: Phaedo 94d row, applied directly. The verse is used INSIDE Socrates' argument that flight can be brave; the quoted words are absorbed into his own syntax (ἔφη αὐτοὺς ἐπίστασθαι continues the line in indirect discourse). Homer is not a new local turn owner, so Socrates owns the argumentative unit. Unchanged from the first pass. Greek: καὶ Ὅμηρός που ἐπαινῶν τοὺς τοῦ Αἰνείου ἵππους {quote} κραιπνὰ μάλ’ ἔνθα καὶ ἔνθα {/quote} {191b} ἔφη αὐτοὺς ἐπίστασθαι διώκειν ἠδὲ φέβεσθαι· ... καὶ εἶπεν αὐτὸν εἶναι {quote} μήστωρα φόβοιο. {/quote}
- `turn_laches_0263`: Phaedo 94d row, a fortiori: the {quote} spans are a single adjective and a half-line spliced into Socrates' own indirect-discourse clause (ἔφη οὐκ ἀγαθὴν εἶναι …). Quotation alone is not enough, and Homer holds no floor. Unchanged from the first pass. Greek: τὸν Ὅμηρον δοκεῖ μοι χρῆναι προβάλλεσθαι, ὃς ἔφη οὐκ {quote} ἀγαθὴν {/quote} εἶναι {quote} αἰδῶ κεχρημένῳ ἀνδρὶ παρεῖναι {/quote} .
- `turn_laches_0002`: Flipped by the ruling. All indirect: ὅτι + optative of reported speech, and φασιν + infinitive with a bare demonstrative subject. No bounded direct speech anywhere in the turn. Greek: λέγοντες ὅτι εἰ μὲν ἀμελήσουσιν ἑαυτῶν … ἀκλεεῖς γενήσονται … οὗτοι μὲν οὖν φασιν πείσεσθαι … εἰσηγήσατο οὖν τις ἡμῖν καὶ τοῦτο τὸ μάθημα, ὅτι καλὸν εἴη τῷ νέῳ μαθεῖν ἐν ὅπλοις μάχεσθαι
- `turn_laches_0005`: Flipped by the ruling. Argumentative recap of an on-stage printed turn, in indirect discourse. Greek: ὡς ὅ γε ἔλεγεν ὁ Λυσίμαχος ἄρτι … πάνυ μοι δοκεῖ εὖ εἰρῆσθαι … ὅτι αὐτοῖς σχεδόν τι ταῦτα συμβαίνει ἃ οὗτος λέγει
- `turn_laches_0054`: Flipped by the ruling. Indirect report and a scripted future utterance; no transmitted direct speech. Greek: οἵπερ μόνοι ἐπηγγέλλοντό με οἷοί τ’ εἶναι ποιῆσαι καλόν τε κἀγαθόν … ἀλλ’ ἐρωτᾶν λέγοντα ὅτι ὁ μὲν Σωκράτης οὔ {186e} φησιν ἐπαΐειν περὶ τοῦ πράγματος
- `turn_laches_0056`: Flipped by the ruling. Indirect recap of an on-stage printed turn. Greek: εὖ γὰρ καὶ τοῦτο λέγει ὅδε, ὅτι περὶ τοῦ μεγίστου νῦν βουλευόμεθα τῶν ἡμετέρων
- `turn_laches_0156`: Flipped by the ruling. A remembered proposition in indirect discourse — the ruling names exactly this as excluded. Greek: πολλάκις ἀκήκοά σου λέγοντος ὅτι ταῦτα ἀγαθὸς ἕκαστος ἡμῶν ἅπερ σοφός, ἃ δὲ ἀμαθής, ταῦτα δὲ κακός.
- `turn_laches_0089`: Bare `φασί` + accusative-and-infinitive with no named subject: the ruling's explicit no. Same for λέγονται of the Scythians in 0087. Greek: Λακεδαιμονίους {191c} γάρ φασιν ἐν Πλαταιαῖς ... οὐκ ἐθέλειν μένοντας πρὸς αὐτοὺς μάχεσθαι, ἀλλὰ φεύγειν
- `turn_laches_0018`: `οἱ σοφοί φασιν` row: indirect report by an unnamed collective, and here without even a content clause of its own. No direct speech, so no required span. Same for 0020 (εἴτε μὴ ὂν φασὶ … αὐτὸ εἶναι μάθημα). Greek: εἰ μέν ἐστιν μάθημα, ὅπερ φασὶν οἱ διδάσκοντες, καὶ οἷον Νικίας λέγει
- `turn_laches_0185`: `ἔφησθα` recap row: second-person report of the addressee's own on-stage position, which his printed turn already owns. Representative of a large recurring class in the elenchus (0200, 0202 οὐχ οὕτως ἔλεγες;, 0207, 0220 ἀπεκρίνω, 0226, 0228, 0237, 0245, 0251-0252 ἔφαμεν). Greek: σὺ πᾶσι φῂς ἄμεινον εἶναι ζῆν καὶ οὐ πολλοῖς κρεῖττον τεθνάναι;
- `turn_laches_0206`: Personification row. A beast that would 'say it knows' is Socrates' argumentative personification under ἀνάγκη/συγχωρεῖν; no floor is handed over and no direct speech is staged, so it falls well short of the Laws-in-Crito threshold. Greek: ταῦτα λέοντα ἢ πάρδαλιν ἤ τινα κάπρον φάναι εἰδέναι … φάναι πεφυκέναι τὸν τιθέμενον ἀνδρείαν
- `turn_laches_0147`: Personification row, checked explicitly because it is the nearest thing in laches to a prosopopoeia: the argument 'orders' perseverance and courage herself might 'laugh at us'. Neither is given the floor, neither speaks a word of direct discourse, and both stay inside Socrates' own sentence. No by default. Greek: τῷ λόγῳ ὃς καρτερεῖν κελεύει … ἵνα καὶ μὴ ἡμῶν αὐτὴ ἡ ἀνδρεία καταγελάσῃ, ὅτι οὐκ ἀνδρείως αὐτὴν ζητοῦμεν

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

medium — the exclusions are now firm (each maps onto a named row of the ruling, and the two Homer citations plus the on-stage recaps are settled), and the marker-and-vocative sweep makes it near-certain that no unmarked direct speech was missed. The medium rating is entirely about turn_laches_0099: it is the dialogue's only bounded direct speech below the printed speaker, and the disposition flips to `none` if the operator reads the counterfactual questioner as argumentative illustration under the Phaedo 94d rationale rather than as a hypothetical speaker holding the floor.
