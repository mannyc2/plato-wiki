# phaedo: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/phaedo.txt`, sha256 `b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Turn index**: `derived/plato/turns/phaedo.toon`, sha256 `57886fb23f485b04465606c4c82071357299a00e5e2138af62b79c09c6d5f847`, 35 printed-siglum turn(s)
**Disposition**: `required` — 3 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 489.
Turns with no cue and no quotation marker: 20.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

3 of 35 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_phaedo_0027` | ΦΑΙΔ. |
| `turn_phaedo_0031` | ΦΑΙΔ. |
| `turn_phaedo_0035` | ΦΑΙΔ. |

The remaining 32 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_phaedo_0027`
- `turn_phaedo_0035`

## Ambiguous boundary decisions

- Ruling applied: turn_phaedo_0028 yes->no: case 'Phaedo 88c Echecrates quoting himself'. Ruled explicitly. The {q}-marked τίνι οὖν ἔτι πιστεύσομεν λόγῳ; … is Echecrates' quoted self-address under λέγειν πρὸς ἐμαυτὸν ἐπέρχεται; the repeated-chain exception covers only a narrator reporting themselves inside their own narration, so this stays inside the printed ΕΧ. turn.
- `turn_phaedo_0027` → **yes**: 66b-67b. Turns on the ruled 'οἱ σοφοί φασιν' case, whose second sentence applies: this IS marked direct speech by an unregistered collective (οἱ γνησίως φιλόσοφοι), not indirect report. It is `{q}`-bounded across two units, runs about two Stephanus pages, and is first-person plural throughout (ἡμᾶς, ἡμῶν, φαμὲν, ἐπιθυμοῦμεν) with its own deixis — Socrates does not speak in his own person inside it. Against: the framing τοιαῦτα ἄττα λέγειν is generic rather than a report of one occasion. I judge that framing non-disqualifying because the accepted cohort treats Xanthippe's identically-framed τοιαῦτ᾽ ἄττα εἶπεν (60a) as a real utterance. Owner would be `unresolved`. This does not affect the turn's disposition (0027 is `yes` many times over) and does not affect its presence on unregisteredOwnerTurns (the dream already puts it there); it affects only how many unresolved spans the corpus reported-turn completion campaign records inside 0027. Greek: παρίστασθαι δόξαν τοιάνδε τινὰ τοῖς γνησίως φιλοσόφοις, ὥστε καὶ πρὸς ἀλλήλους τοιαῦτα ἄττα λέγειν, ὅτι {q} κινδυνεύει τοι ὥσπερ ἀτραπός τις ἐκφέρειν ἡμᾶς … ἐπειδὰν τελευτήσωμεν, ὡς ὁ λόγος σημαίνει, ζῶσιν δὲ οὔ. {/q} {q} εἰ γὰρ μὴ οἷόν τε μετὰ τοῦ σώματος μηδὲν καθαρῶς γνῶναι … {/q}
- `turn_phaedo_0035` → **yes**: 106b-c, and THE ONLY REASON turn_phaedo_0035 appears in unregisteredOwnerTurns. For: bounded direct speech, `{q}`-marked on both sides of an interposed reporting verb with an explicit nominative subject (τις) — the identical orthographic shape as the doorkeeper's speech at 59e, which the accepted cohort records. Against: the subject is an indefinite potential objector in ἄν + optative, so nobody ever uttered it, which puts it close to the ruled 'personified ὁ λόγος' case that I called `no` at 87a-b in turn 0027. I split them on quotation boundary and floor: at 87a-b the λόγος's words run on inside Cebes' sentence unmarked, whereas here the speech is explicitly delimited and Socrates resumes outside it with τῷ ταῦτα λέγοντι ('to the one saying this'), treating the objector as a distinct discourse party. Called `yes` because the ruling's standing instruction is never to leave such words with the printed siglum by default; owner would be `unresolved`. A reconciler who reads it as pure argumentative hypothesis should drop turn_phaedo_0035 from unregisteredOwnerTurns — the turn stays `yes` either way, and outerTurnIds is unaffected. Greek: {q} ἀλλὰ τί κωλύει, {/q} φαίη ἄν τις, {q} ἄρτιον μὲν τὸ περιττὸν μὴ γίγνεσθαι ἐπιόντος τοῦ ἀρτίου, ὥσπερ ὡμολόγηται, {106c} ἀπολομένου δὲ αὐτοῦ ἀντ’ ἐκείνου ἄρτιον γεγονέναι; {/q}

## Inspected cue hits that yield no reported turn

- `turn_phaedo_0028`: Ruled directly by the operator (Phaedo 88c case). A printed speaker's quoted self-address stays inside their own turn. This was my first pass's only borderline-yes and is now the sole flip; it removes the turn from the list entirely, since nothing else in turn_phaedo_0028 transmits direct speech (ὃν ὁ Σωκράτης ἔλεγε λόγον is a reference to an argument, not an utterance). Greek: καὶ γὰρ αὐτόν με νῦν ἀκούσαντά σου τοιοῦτόν τι λέγειν {88d} πρὸς ἐμαυτὸν ἐπέρχεται: {q} τίνι οὖν ἔτι πιστεύσομεν λόγῳ; ὡς γὰρ σφόδρα πιθανὸς ὤν, ὃν ὁ {pers} Σωκράτης {/pers} ἔλεγε λόγον, νῦν εἰς ἀπιστίαν καταπέπτωκεν. {/q}
- `turn_phaedo_0031`: The Phaedo 94d case, ruled: the verse is used inside Socrates' argument, so Socrates owns the argumentative unit and the verse is not a new local turn owner. turn_phaedo_0031 is `yes` on independent grounds. Greek: οἷόν που καὶ {pers} Ὅμηρος {/pers} ἐν {place} Ὀδυσσείᾳ {/place} πεποίηκεν, οὗ λέγει τὸν {pers} Ὀδυσσέα {/pers} : {quote} στῆθος δὲ πλήξας κραδίην ἠνίπαπε μύθῳ: {/quote} {94e} {quote} τέτλαθι δή, κραδίη: καὶ κύντερον ἄλλο ποτ᾽ ἔτλης. {/quote}
- `turn_phaedo_0035`: Same class at 112a — one Homeric line cited as authority for the name Tartarus while Socrates keeps the floor. Recorded to show the 94d rule applied consistently. Greek: τοῦτο ὅπερ {pers} Ὅμηρος {/pers} εἶπε, λέγων αὐτό {quote} τῆλε μάλ᾽, ᾗχι βάθιστον ὑπὸ χθονός ἐστι βέρεθρον: {/quote}
- `turn_phaedo_0027`: 69c-d. A proverbial verse cited as authority inside Socrates' argument, with οἱ περὶ τὰς τελετάς as the citing source rather than a floor-holding speaker. The 94d case governs; the collective clause does not apply because this is cited verse, not transmitted direct speech by the collective. `{q}` here marks quotation, not utterance. Greek: εἰσὶν γὰρ δή, {del} ὥς {/del} φασιν οἱ περὶ τὰς τελετάς, {q} ναρθηκοφόροι {69d} μὲν πολλοί, βάκχοι δέ τε παῦροι: {/q}
- `turn_phaedo_0027`: 72c. A three-word doxographical tag, explicitly framed as τὸ τοῦ Ἀναξαγόρου ('Anaxagoras's phrase'). A quoted phrase, not a bounded stretch of direct speech; the ruling's standard excludes 'every quoted phrase'. Greek: ταχὺ ἂν τὸ τοῦ {pers} Ἀναξαγόρου {/pers} γεγονὸς εἴη, {q} ὁμοῦ πάντα χρήματα. {/q}
- `turn_phaedo_0027`: 75d. `{q}` used as a term-marker around a technical formula, not around speech. IMPORTANT for the other pass: this and the next entry prove `{q}` in this source is NOT a reliable speech signal on its own. Greek: περὶ ἁπάντων οἷς ἐπισφραγιζόμεθα τὸ {q} αὐτὸ ὃ ἔστι {/q}
- `turn_phaedo_0031`: 92d. The same term-marking use of `{q}`. No utterance, no owner. Greek: ὥσπερ αὐτῆς ἐστιν ἡ οὐσία ἔχουσα τὴν ἐπωνυμίαν τὴν τοῦ {q} ὃ ἔστιν {/q}
- `turn_phaedo_0027`: 87a-b, inside Cebes' objection. Exactly the ruled 'personified ὁ λόγος says/teases' case: no by default. The λόγος gets one potential-mood sentence-pair, not a bounded prosopopoeia comparable to the Laws in Crito, and Cebes keeps the floor on either side of it. Greek: τί οὖν, ἂν φαίη ὁ λόγος, ἔτι ἀπιστεῖς, ἐπειδὴ ὁρᾷς ἀποθανόντος τοῦ ἀνθρώπου τό γε ἀσθενέστερον ἔτι ὄν;
- `turn_phaedo_0035`: 115a. A parenthetical stylistic attribution of two words ('as a tragic poet would put it') embedded in Socrates' own sentence — the sentence's grammatical subject and first person are Socrates' throughout. Quoted diction, not transmitted speech. Greek: ἐμὲ δὲ νῦν ἤδη καλεῖ, φαίη ἂν ἀνὴρ τραγικός, ἡ εἱμαρμένη
- `turn_phaedo_0031`: 97b-c. Anaxagoras's doctrine reaches Socrates through a book read aloud, but the transmission is ὡς ἄρα + indicative — indirect report throughout, never bounded direct speech. Ruled no by the 'Φίληβος φησι + content' case. This is why turn_phaedo_0031 carries NO unregistered owner: it is the only candidate in that turn and it fails. Greek: ἀλλ’ ἀκούσας μέν ποτε ἐκ βιβλίου τινός, ὡς ἔφη, {pers} Ἀναξαγόρου {/pers} {97c} ἀναγιγνώσκοντος, καὶ λέγοντος ὡς ἄρα νοῦς ἐστιν ὁ διακοσμῶν τε καὶ πάντων αἴτιος
- `turn_phaedo_0031`: 97e-98a. What Socrates expected Anaxagoras to say, in accusative-and-infinitive and potential optative. Anticipated, never-uttered content; no direct speech and no licensed owner. Greek: καί μοι φράσειν πρῶτον μὲν πότερον ἡ γῆ πλατεῖά ἐστιν ἢ {97e} στρογγύλη … καὶ εἰ ἐν μέσῳ φαίη εἶναι αὐτήν, ἐπεκδιηγήσεσθαι ὡς ἄμεινον ἦν αὐτὴν ἐν μέσῳ εἶναι
- `turn_phaedo_0031`: 98c-99b. The long bones-and-sinews parody. Framed as ὥσπερ ἂν εἴ τις … λέγοι with ὅτι-clauses in indirect construction, unmarked by `{q}`, and the first person inside it is Socrates' own. An illustrative hypothetical, not a bounded direct-speech span with an owner. Greek: ὥσπερ ἂν εἴ τις λέγων ὅτι {pers} Σωκράτης {/pers} πάντα ὅσα πράττει νῷ πράττει … λέγοι πρῶτον μὲν ὅτι διὰ ταῦτα νῦν ἐνθάδε κάθημαι

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on disposition and on outerTurnIds [0027, 0031, 0035]. The three narrated turns are unambiguous under any reading of the ruling, the 0028 flip was ruled by name, and the 31 turns called `no` were each read in full in Greek rather than inferred from a cue count. High also on turn_phaedo_0027 belonging to unregisteredOwnerTurns, since the 60e-61a dream is a clean case independent of both borderlines. Medium only on turn_phaedo_0035 belonging to unregisteredOwnerTurns, which rests entirely on reading the 106b-c φαίη ἄν τις objector as bounded direct speech rather than argumentative hypothesis; that call changes no turn's yes/no. Nothing else remains unsettled.
