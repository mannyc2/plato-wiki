# meno: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/meno.txt`, sha256 `91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99`
**Turn index**: `derived/plato/turns/meno.toon`, sha256 `c9c5aafaa857b23b3fa214279a3d9a1ecb78170a8368f5469c97716236dc65ea`, 570 printed-siglum turn(s)
**Disposition**: `required` — 8 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 180.
Turns with no cue and no quotation marker: 467.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

8 of 570 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_meno_0003` | ΣΩ. |
| `turn_meno_0056` | ΣΩ. |
| `turn_meno_0062` | ΣΩ. |
| `turn_meno_0066` | ΣΩ. |
| `turn_meno_0072` | ΣΩ. |
| `turn_meno_0361` | ΣΩ. |
| `turn_meno_0478` | ΣΩ. |
| `turn_meno_0566` | ΣΩ. |

The remaining 562 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_meno_0003`
- `turn_meno_0056`
- `turn_meno_0062`
- `turn_meno_0066`
- `turn_meno_0072`
- `turn_meno_0361`
- `turn_meno_0478`
- `turn_meno_0566`

## Ambiguous boundary decisions

- Ruling applied: turn_meno_0014 yes->no: Phaedo 88c self-quotation. The {q} span is licensed by ἠρόμην, first person singular — a printed speaker's quoted self-address stays inside their own turn.
- Ruling applied: turn_meno_0016 yes->no: Phaedo 88c self-quotation. εἰ οὖν εἶπον μετὰ ταῦτα· — first person singular, Socrates quoting himself.
- Ruling applied: turn_meno_0084 yes->no: Phaedo 88c self-quotation. εἴποιμ’ ἂν αὐτῷ ὅτι — first person singular optative; a different addressee does not make it another owner.
- Ruling applied: turn_meno_0196 yes->no: bare φασί + accusative-and-infinitive. The priests'/priestesses' doctrine (φασὶ τὴν ψυχὴν … εἶναι ἀθάνατον … δεῖν δὴ … διαβιῶναι) is indirect report, not transmitted direct speech, so it licenses no owner. The enclosed Pindar fragment {quote} is verse used inside Socrates' own argument, which the Phaedo 94d row rules out separately.
- Ruling applied: turn_meno_0478 no->yes: whole-turn quotation (Ion 537a-b / Sophist 237a row). The printed turn is the attribution clause ΣΩ. ἐν τοῖς ἐλεγείοις, οὗ λέγει — plus four elegiac lines, 185 of 235 characters (79%). The words are attributed to another speaker (Θέογνιν τὸν ποιητὴν, named in turn_meno_0476, resumed anaphorically by οὗ λέγει), and Theognis addresses his own addressee in the second person (πῖνε, ἔσθιε, ἵζε, ἅνδανε, διδάξεαι, συμμίσγῃς). My first pass filed this under the Phaedo 94d Homer precedent; the ruling's whole-turn-quotation row governs instead, because within this turn the verse is not used inside an argument — the argument runs in the surrounding turns 0476 and 0480.
- `turn_meno_0003` → **yes**: The whole COUNTERFACTUAL-SPEAKER class, which the ruling does not address directly and which covers 6 of the 8 required turns (0003, 0056, 0062, 0066, 0072, 0361). Every one is bounded direct speech licensed by Greek speech machinery (ἐρεῖ, ἀνέροιτο, εἶπεν, ὑπέλαβεν ὁ ἐρωτῶν, ἔλεγεν, εἴποι ἄν τις) with first- and second-person deixis and vocative address distinct from Socrates' own, so 'direct speech attributed to another owner' is satisfied on its face — but no one ever actually says it. Called yes because the nearest governing row, personified ὁ λόγος, excludes an argument that a speaker personifies, whereas these owners are hypothetical PERSONS (τις, ὁ ἐρωτῶν, an Athenian, a geometer) who hold the floor with their own sustained discourse, which is the Laws-in-Crito exception that row preserves. If the operator instead reads counterfactual speech as the current speaker's argumentative staging, all six drop and the required list is 0478 and 0566 only. Greek: εἰ γοῦν τινα ἐθέλεις οὕτως ἐρέσθαι τῶν ἐνθάδε, οὐδεὶς ὅστις οὐ γελάσεται καὶ ἐρεῖ· {q} ὦ ξένε, κινδυνεύω σοι δοκεῖν μακάριός τις εἶναι ... τυγχάνω εἰδώς. {/q}
- `turn_meno_0072` → **yes**: Counterfactual class as above, with one extra wrinkle: the first of this turn's three quoted spans is direct speech attributed to MENO (εἶπες, second person), who is a printed turn speaker in this dialogue. It is not an ἔφησθα recap — Meno never says it, so no printed turn owns it — but a reviewer should confirm that a voice record can name ΜΕΝ. as owner inside a ΣΩ. turn for words Meno never uttered. The turn's other two spans belong to the hypothetical questioner and stand independently. Greek: εἰ οὖν τῷ ἐρωτῶντι οὕτως ἢ περὶ σχήματος ἢ χρώματος εἶπες ὅτι {q} ἀλλ’ οὐδὲ μανθάνω ἔγωγε ὅτι βούλει, ὦ ἄνθρωπε, οὐδὲ οἶδα ὅτι λέγεις, {/q}
- `turn_meno_0478` → **yes**: The whole-turn-quotation row and the Phaedo 94d row both reach for this turn, and the line between them is the only thing deciding it. Called yes on the measurement: the quotation is 79% of the turn and the remaining 21% is nothing but the attribution clause, so no argument is being made INSIDE this turn for the verse to sit inside. The immediately following turn 0480 is the same poet, the same argument, and is called no, because there Socrates' own syntax runs through and around the fragments. A reviewer who thinks the Theognis passage is one argumentative unit spanning 0476-0480 would call both no. Greek: ΣΩ. ἐν τοῖς ἐλεγείοις, οὗ λέγει — {quote} καὶ παρὰ τοῖσιν πῖνε καὶ ἔσθιε ... ἀπολεῖς καὶ τὸν ἐόντα νόον. {/quote}
- `turn_meno_0566` → **yes**: Direct speech (a nominative exclamation, θεῖος ἀνὴρ οὗτος) split by the classic parenthetical reporting verb φασίν, attributed to an unregistered collective — exactly the οἱ σοφοί φασιν row's stated exception, so it is a required span with an unresolved owner rather than an indirect report. The uncertainty is scale: 21 characters, 12% of the turn, and habitual (ὅταν + subjunctive) rather than a single occasion. If 'bounded stretch' carries a minimum, this is the turn it would exclude. Greek: καὶ οἱ Λάκωνες ὅταν τινὰ ἐγκωμιάζωσιν ἀγαθὸν ἄνδρα, {q} θεῖος ἀνήρ, {/q} φασίν, {q} οὗτος. {/q}

## Inspected cue hits that yield no reported turn

- `turn_meno_0014`: Phaedo 88c row: a printed speaker's quoted self-address. ἠρόμην is first person; the owner is ΣΩ., who already owns the turn. Greek: τί ἂν ἀπεκρίνω μοι, εἴ σε ἠρόμην· {q} ἆρα τούτῳ φῂς πολλὰς καὶ παντοδαπὰς εἶναι ... {/q}
- `turn_meno_0016`: Phaedo 88c row: εἶπον, first person. Same owner as the printed turn. Greek: εἰ οὖν εἶπον μετὰ ταῦτα· {q} τοῦτο τοίνυν μοι αὐτὸ εἰπέ, ὦ Μένων· ... {/q}
- `turn_meno_0084`: Phaedo 88c row: εἴποιμι, first person. The hypothetical addressee (an eristic questioner) is the addressee, not the speaker. Greek: εἴποιμ’ ἂν {75d} αὐτῷ ὅτι {q} ἐμοὶ μὲν εἴρηται· εἰ δὲ μὴ ὀρθῶς λέγω, σὸν ἔργον λαμβάνειν λόγον καὶ ἐλέγχειν. {/q}
- `turn_meno_0106`: Phaedo 94d row. A four-word Pindaric tag used as Socrates' own imperative to Meno, inside a turn that continues into his definition of colour. Not a whole-turn quotation and not a new local turn owner. Greek: ἐκ τούτων δὴ {q} σύνες ὅ τοι λέγω, {/q} ἔφη Πίνδαρος. ἔστιν γὰρ χρόα ἀπορροὴ σχημάτων ὄψει σύμμετρος καὶ αἰσθητός.
- `turn_meno_0115`: Phaedo 94d row, plus 'quotation alone is not enough'. A bare infinitive phrase, not bounded direct speech, and Meno annexes it as his own thesis in the same sentence. Greek: καθάπερ ὁ ποιητὴς λέγει, {q} χαίρειν τε καλοῖσι καὶ δύνασθαι· {/q} καὶ ἐγὼ τοῦτο λέγω ἀρετήν
- `turn_meno_0196`: Bare φασί + accusative-and-infinitive row, and the οἱ σοφοί φασιν row. Extended and explicitly framed as the priests' λόγος, but wholly indirect: no finite direct utterance anywhere in it. The Pindar fragment inside it falls under Phaedo 94d. Greek: ἃ δὲ λέγουσιν, ταυτί ἐστιν· ... φασὶ γὰρ τὴν ψυχὴν τοῦ ἀνθρώπου εἶναι ἀθάνατον, καὶ τοτὲ μὲν τελευτᾶν ... δεῖν δὴ διὰ ταῦτα ὡς ὁσιώτατα διαβιῶναι τὸν βίον
- `turn_meno_0009`: No transmitted utterance at all — a request that Meno report what Gorgias said. Gorgias speaks off-stage, so the ἔφησθα recap exclusion does not apply, but there is nothing to record. Greek: ἀλλ’ ἴσως ἐκεῖνός τε οἶδε, καὶ σὺ ἃ ἐκεῖνος ἔλεγε· ἀνάμνησον οὖν {71d} με πῶς ἔλεγεν.
- `turn_meno_0042`: Same: the content of Gorgias' utterance is demanded, not transmitted. Greek: πειρῶ εἰπεῖν καὶ ἀναμνησθῆναι τί αὐτό φησι Γοργίας εἶναι
- `turn_meno_0090`: Same. Greek: οὐκ ἐθέλεις {76b} ἀναμνησθεὶς εἰπεῖν ὅτι ποτε λέγει Γοργίας ἀρετὴν εἶναι.
- `turn_meno_0114`: φασί with a named collective subject, but the utterance itself is elided (ὅπερ). Nothing direct is transmitted. Greek: ὅπερ φασὶ τοὺς συντρίβοντάς τι ἑκάστοτε οἱ σκώπτοντες
- `turn_meno_0158`: Φίληβος φησι row (indirect report) and ἔφησθα row (recap of an on-stage turn — turn_meno_0157 already owns the speech). The same shape recurs as ὡς σὺ φῄς / φῂς … εἶναι throughout (0174, 0326, 0442) and is excluded identically. Greek: χρυσίον δὲ δὴ καὶ ἀργύριον πορίζεσθαι ἀρετή ἐστιν, ὥς φησι Μένων ὁ τοῦ μεγάλου βασιλέως πατρικὸς ξένος.
- `turn_meno_0427`: Φίληβος φησι row: λέγει … ὅτι + third-person indicative is indirect report, not bounded direct speech. Recorded as genuinely uncertain in the first pass; the ruling settles it. Greek: οὗτος γάρ, ὦ Ἄνυτε, πάλαι λέγει πρός με ὅτι ἐπιθυμεῖ ταύτης τῆς σοφίας καὶ ἀρετῆς ...

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

medium-high. The exclusions are firm: every dropped turn maps onto a specific case row (88c self-quotation, 94d verse-inside-argument, indirect report), and the two turns I am most confident about as required — 0478, a whole-turn quotation explicitly attributed to a named poet, and 0566, direct speech split by parenthetical φασίν — stand on rows the ruling states outright. The residual risk is concentrated in one place: 6 of the 8 required turns are counterfactual questioners whose status the ruling does not decide, and a ruling against that class would reduce the list to 2 without touching anything else. Note also that meno has no entry in derived/plato/voices/sigla.toml, so every required turn here needs registration or an unresolved owner before the corpus reported-turn completion campaign can record anything.
