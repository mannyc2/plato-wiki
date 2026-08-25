# lesser-hippias: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/lesser-hippias.txt`, sha256 `11d5520c34a07fc79819098712da4b01d2be4867fd056b3d3b82ed61760bc8cb`
**Turn index**: `derived/plato/turns/lesser-hippias.toon`, sha256 `03620a2de523e189b15a008601cfb7440ff594273610cf585128eb193b9d278b`, 231 printed-siglum turn(s)
**Disposition**: `none` — exhausted census, no nested reported turn
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

Candidate hits located and inspected: 106.
Turns with no cue and no quotation marker: 166.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

All 231 outer turns are explicit zero results. A reviewer exhausted the
Greek source and found no bounded stretch of direct speech transmitted below a
printed speaker. This is a reviewed finding, not an absence of files.

## Ambiguous boundary decisions

- Ruling applied: turn_lesser-hippias_0002 yes->no: indirect report, not direct speech. The Apemantus report is oratio obliqua throughout (ἤκουον ὅτι + two oblique optatives, then ἔφη + accusative-and-infinitive) and transmits no bounded direct speech. Decided by the 'Φίληβος φησι + content' row (No if it is indirect report) and by the standard's exclusion of 'indirect report, remembered proposition'.
- Ruling applied: turn_lesser-hippias_0093 yes->no: off-stage, but still indirect report. The Olympia epideixis is ~800 characters of accusative-and-infinitive under repeated ἔφησθα, wholly in Socrates' second-person deixis (εἶχες, σαυτοῦ), with no direct speech anywhere in it. The ἔφησθα row's off-stage carve-out ('an utterance made off-stage ... may still qualify') removes the recap objection but does not supply the direct speech the standard requires, so the turn fails on the primary test instead.
- `turn_lesser-hippias_0110` → **no**: The closest this dialogue comes to the Ion 537a-b whole-turn-quotation row, and the only remaining call I regard as genuinely open. The frame before the quotation is three words (ἐν οἷς λέγει—), with Achilles the attributed subject carried over from turn 0108, so the quotation opens the turn almost bare. It is ruled no because it is not a whole-turn quotation: the quoted verse is 255 of 677 characters (38%), and the 402-character remainder is Socrates' own argument built on it (σὺ δὴ οὖν, ὦ Ἱππία, πότερον οὕτως ἐπιλήσμονα οἴει εἶναι …). That is the Phaedo 94d shape — verse used inside the citing speaker's argument, who therefore owns the argumentative unit. Greek: ΣΩ. ἐν οἷς λέγει— {quote} οὐ γὰρ πρὶν πολέμοιο μεδήσομαι αἱματόεντος, {/quote} {quote} πρίν γ’ υἱὸν Πριάμοιο δαΐφρονος, Ἕκτορα δῖον … {/quote} σὺ δὴ οὖν, ὦ Ἱππία, πότερον οὕτως ἐπιλήσμονα οἴει εἶναι …
- `turn_lesser-hippias_0102` → **no**: The largest quotation block in the dialogue — five {quote} spans of Iliad 9 with three separate formulas naming Achilles and his addressee — and still Phaedo 94d, not Ion. Quoted verse is 522 of 1606 characters (33%), framed by a 376-character argumentative lead-in and a 514-character conclusion that reasons from the lines (ταῦτα εἰπὼν … οὐδαμοῦ φαίνεται οὔτε παρασκευασάμενος …). Recorded as borderline only because of its scale; the ruling's test is ownership of the argumentative unit, not length, and Socrates owns it. Same call at turn 0012 (Hippias, two {quote} spans, 40% of the turn, framed by λέγει αὐτῷ ὁ Ἀχιλλεὺς πρὸς τὸν Ὀδυσσέα— before and ἐν τούτοις δηλοῖ τοῖς ἔπεσιν … after). Greek: προειπὼν γὰρ ταῦτα τὰ ἔπη … {quote} … {/quote} ὀλίγον ὕστερον λέγει ὡς … ἀλλ’— {quote} … {/quote} ἔτι δὲ πρότερον τούτων πρὸς τὸν Ἀγαμέμνονα λοιδορούμενος εἶπεν— {quote} … {/quote} ταῦτα εἰπὼν … οὐδαμοῦ φαίνεται …

## Inspected cue hits that yield no reported turn

- `turn_lesser-hippias_0002`: Indirect report of an absent third party. Sustained oratio obliqua, no direct speech, no bounded stretch below the printed speaker. Ruled by the indirect-report rows. Greek: καὶ γὰρ τοῦ σοῦ πατρὸς Ἀπημάντου ἤκουον ὅτι ἡ Ἰλιὰς κάλλιον εἴη ποίημα τῷ Ὁμήρῳ ἢ ἡ Ὀδύσσεια … ἑκάτερον γὰρ τούτων τὸ μὲν εἰς Ὀδυσσέα ἔφη πεποιῆσθαι, τὸ δ’ εἰς Ἀχιλλέα.
- `turn_lesser-hippias_0093`: Off-stage utterance, so not a recap of a printed turn — but accusative-and-infinitive throughout, in the reporter's deixis. Indirect report, not transmitted direct speech. Greek: ἔφησθα δὲ ἀφικέσθαι ποτὲ εἰς Ὀλυμπίαν ἃ εἶχες περὶ τὸ σῶμα ἅπαντα σαυτοῦ ἔργα ἔχων … ἔπειτα ὑποδήματα ἃ εἶχες ἔφησθα αὐτὸς σκυτοτομῆσαι
- `turn_lesser-hippias_0011`: ἔφησθα recap of an on-stage turn: the words are already owned by printed turn 0008 (ΙΠ.). Ruled explicitly by the ἔφησθα row. Same at turns 0097 (οἶσθα ὅτι τὸν μὲν Ἀχιλλέα ἔφησθα ἀληθῆ εἶναι), 0102's opening (ἐννενόηκα σοῦ λέγοντος, ὅτι …), 0118 (τὰ προειρημένα, ἀλλ’ ὅτι οὐδενὸς ἂν φύγοι ἀνδρὸς ἐρώτησιν), and 0063 (ὡς σὺ ἄρτι ὡμολόγεις … ὑπὸ σοῦ ἐλέγετο ὅτι …). Greek: ἡνίκα μὲν ἄριστον τὸν Ἀχιλλέα ἔφησθα πεποιῆσθαι … ἐπειδὴ δὲ τὸν Ὀδυσσέα εἶπες ὅτι πεποιηκὼς εἴη ὁ ποιητὴς πολυτροπώτατον
- `turn_lesser-hippias_0108`: Paraphrase of Homer in indirect discourse with no quotation at all — Socrates summarizing what Achilles said. Indirect report. Same at turn 0110's closing clause (πρὸς μὲν τὸν Ὀδυσσέα φάναι ἀποπλευσεῖσθαι) and turn 0106 (οὐδὲν γοῦν φαίνεται εἰπὼν πρὸς αὐτόν — speech asserted, none transmitted). Greek: οὐκ οἶσθα ὅτι λέγων ὕστερον ἢ ὡς πρὸς τὸν Ὀδυσσέα ἔφη ἅμα τῇ ἠοῖ ἀποπλευσεῖσθαι, πρὸς τὸν Αἴαντα οὐκ αὖ φησιν ἀποπλευσεῖσθαι, ἀλλὰ ἄλλα λέγει;
- `turn_lesser-hippias_0007`: A question about what the addressee said, transmitting nothing — the accepted Phaedo ruling on τί οὖν δή ἐστιν ἅττα εἶπεν ὁ ἀνήρ. Same at turn 0002's ὧν νυνδὴ ἔλεγεν περὶ Ὁμήρου and turn 0118's οὐ ταῦτα ἦν ἃ ἔλεγες; Greek: τί ἔλεγες περὶ τούτοιν τοῖν ἀνδροῖν; πῶς διέκρινες αὐτούς;
- `turn_lesser-hippias_0013`: Present-tense second-person λέγεις/φῂς, 'you mean/you hold'. Accounts for the majority of λέγ- hits: turns 0019, 0021, 0033, 0039, 0058, 0067, 0069, 0079, 0096, 0100, 0101, 0105, 0107, 0111, 0116, 0159, 0180. Greek: τὸν πολύτροπον ψευδῆ λέγεις, ὥς γε φαίνεται.
- `turn_lesser-hippias_0008`: First-person φημί: the printed speaker asserting in his own voice. Same at turns 0034, 0036, 0045, 0095, 0231. Greek: φημὶ γὰρ Ὅμηρον πεποιηκέναι ἄριστον μὲν ἄνδρα Ἀχιλλέα τῶν εἰς Τροίαν ἀφικομένων
- `turn_lesser-hippias_0003`: ἀποκρ- cues are soliciting or predicting an answer, never transmitting one. Same at turns 0004, 0009, 0010, 0117, 0121, 0122. Greek: ἦ γάρ, ὦ Ἱππία, ἐάν τι ἐρωτᾷ σε Σωκράτης, ἀποκρινῇ;
- `turn_lesser-hippias_0057`: A hypothetical questioner in a protasis. The interrogative πόσα is the ordinary Attic indirect-question form (cf. the strictly indirect ὁπόσος at turn 0049 in the identical construction), so no direct speech is quoted, and nothing here approaches a bounded prosopopoeia comparable to the Laws in Crito. Same at turns 0049, 0055. Greek: εἴ τίς σε ἔροιτο τὰ τρὶς ἑπτακόσια πόσα ἐστί
- `turn_lesser-hippias_0115`: The only occurrence of οἱ νόμοι in the dialogue; the laws are the subject of a predication, not personified and never given the floor. Checked against the personification row. Greek: καὶ οἱ νόμοι δήπου πολὺ χαλεπώτεροί εἰσι τοῖς ἑκοῦσι κακὰ ἐργαζομένοις
- `turn_lesser-hippias_0135`: ποιεῖν as 'do/make', not the poetic 'represent as saying'. Same at turns 0136, 0137, 0217, 0221. Greek: ἆρ’ οὖν οὐ ποιεῖν τί ἐστι τὸ θεῖν;

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. Lesser Hippias is direct dramatic dialogue with no narrative frame: zero occurrences of ἦ δ or ἦν δ, no narrator, no reading-aloud event, and every stretch of direct speech in the file is editorially marked and confined to three turns of argumentative Homeric citation. The ruling's two decisive rows — Phaedo 94d for quotation inside an argument, and the ἔφησθα row for recapitulation — dispose of every candidate the dialogue has. The residual uncertainty is confined to turn 0110 and does not affect the disposition unless that one turn flips, in which case the disposition becomes required with a single ΣΩ.-turn record whose owner (Achilles) is unregistered.
