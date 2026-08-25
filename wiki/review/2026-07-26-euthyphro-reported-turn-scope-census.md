# euthyphro: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/euthyphro.txt`, sha256 `9fac1bf69b5a6e95c8436b25e82244bc60de058f63290c6be205b753ee94b806`
**Turn index**: `derived/plato/turns/euthyphro.toon`, sha256 `d488716c61feffb7c2734f9878d7b0b8edd25c783c3589339441c31fb1c39b18`, 233 printed-siglum turn(s)
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

Candidate hits located and inspected: 254.
Turns with no cue and no quotation marker: 133.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

All 233 outer turns are explicit zero results. A reviewer exhausted the
Greek source and found no bounded stretch of direct speech transmitted below a
printed speaker. This is a reviewed finding, not an absence of files.

## Ambiguous boundary decisions

- Ruling applied: turn_euthyphro_0010 yes->no: `Φίληβος φησι` + content. ἐκεῖνος γάρ, ὥς φησιν, οἶδε ... is an indirect report carried by a ὥς φησιν parenthetical; the Greek transmits no bounded direct speech by Meletus.
- Ruling applied: turn_euthyphro_0011 yes->no: `Φίληβος φησι` + content. Same ὥς φησιν parenthetical shape, indirect report only.
- Ruling applied: turn_euthyphro_0013 yes->no: `Φίληβος φησι` + content. φησὶ γάρ με ποιητὴν εἶναι θεῶν ... ὥς φησιν is accusative-and-infinitive oratio obliqua in Socrates' own deixis (με = Socrates). Named subject, but no direct speech, so no nested turn.
- Ruling applied: turn_euthyphro_0034 yes->no: bare `φασί` + accusative-and-infinitive. ὥς φασιν ἐκεῖνοι with the infinitives οὐ δεῖν φροντίζειν and ἀνόσιον ... εἶναι is indirect report of the father and relatives; no direct speech and no licensed owner.
- Ruling applied: turn_euthyphro_0037 yes->no: Phaedo 88c Echecrates quoting himself. This was my only unreserved first-pass call. The stretch is genuinely bounded direct speech ({q} markers, ὅτι recitativum at λέγοντα ὅτι ἔγωγε, sustained second-person address, vocative ὦ Μέλητε, parenthetical φαίην ἄν), but its owner is Socrates, the printed speaker of the turn, and Euthyphro has no narration level, so the repeated-chain exception does not apply. A printed speaker's quoted self-address stays inside their own turn. Meletus is addressed throughout and never speaks.
- Ruling applied: turn_euthyphro_0103 yes->no: Phaedo 88c Echecrates quoting himself. The {q}-delimited πρὸς ἐμαυτὸν σκοπῶ reflection is the printed speaker quoting himself; same ruling, and here not even a deictic shift.
- `turn_euthyphro_0037` → **no**: Turns on Phaedo 88c Echecrates quoting himself, and it is the single hinge of this dialogue's disposition: it is the only bounded stretch of direct speech in all of Euthyphro, and admitting it would make the disposition 'required' with exactly one turn. Recorded here so the reconciliation step sees the call rather than an absence. Everything the top-line standard asks for is present except the owner: the source delimits the stretch with {q} markers, ὅτι recitativum opens it at λέγοντα ὅτι ἔγωγε, the deictic frame shifts to a sustained second-person courtroom address, and the parenthetical first-person φαίην ἄν licenses it. But the speaker is Socrates, the printed speaker of the turn; Meletus is addressed by vocative and by second-person imperatives (ἡγοῦ, μὴ δικάζου, λάχε δίκην) and never speaks a word. Euthyphro is a direct dramatic dialogue with no narration level, so the repeated-chain exception, which is only for a narrator reporting themselves inside their own narration, cannot apply. The Ion 537a-b / Sophist 237a row does not rescue it either, since that row requires the text to attribute the quoted words to ANOTHER speaker. Greek: λέγοντα ὅτι ἔγωγε καὶ ἐν τῷ ἔμπροσθεν χρόνῳ τὰ θεῖα περὶ πολλοῦ ἐποιούμην εἰδέναι ... μαθητὴς δὴ γέγονα σός — {q} καὶ εἰ μέν, ὦ Μέλητε, {/q} φαίην ἄν, {q} Εὐθύφρονα ὁμολογεῖς {/q} {5b} σοφὸν εἶναι τὰ τοιαῦτα ... αὐτὰ ταῦτα λέγειν ἐν τῷ δικαστηρίῳ ἃ προυκαλούμην αὐτόν;
- `turn_euthyphro_0103` → **no**: Turns on the same Phaedo 88c row, and is the weaker of the two source-delimited spans. Socrates quotes his own reasoning to himself (πρὸς ἐμαυτὸν σκοπῶ), Euthyphro is referred to in the third person inside the quotation, and there is no shift of person or addressee at all. Listed only because it is the other {q}-delimited stretch in the dialogue and a reconciliation pass will want the call recorded explicitly. Greek: τόδε δέ σου ἐνενόησα ἅμα λέγοντος καὶ πρὸς ἐμαυτὸν σκοπῶ· {q} εἰ ὅτι μάλιστά με Εὐθύφρων διδάξειεν ... τὸ γὰρ θεομισὲς ὂν καὶ θεοφιλὲς ἐφάνη. {/q}

## Inspected cue hits that yield no reported turn

- `turn_euthyphro_0147`: Phaedo 94d Homer quotation. Two Cypria verses inside {quote} markers with a naming formula (ὁ ποιητὴς ... ὁ ποιήσας), cited as the thesis Socrates argues against; he keeps the floor and immediately says ἐγὼ οὖν τούτῳ διαφέρομαι τῷ ποιητῇ. This is not the Ion 537a-b / Sophist 237a whole-turn case: the citation is two lines inside a 440-character argumentative turn, so the poet is not a new local turn owner. Greek: λέγω γὰρ δὴ τὸ ἐναντίον ἢ ὁ ποιητὴς ἐποίησεν ὁ ποιήσας — {quote} Ζῆνα δὲ τὸν {del} θ’ {/del} ἔρξαντα καὶ ὃς τάδε πάντ’ ἐφύτευσεν {/quote} {12b} {quote} οὐκ ἐθέλει νεικεῖν· ἵνα γὰρ δέος ἔνθα καὶ αἰδώς. {/quote} ἐγὼ οὖν τούτῳ διαφέρομαι τῷ ποιητῇ.
- `turn_euthyphro_0149`: Phaedo 94d Homer quotation. Re-quotation of the same half-line as the object of Socrates' own predication. This turn carries a quote marker but no reporting cue at all. Greek: οὐ δοκεῖ μοι εἶναι {q} ἵνα δέος ἔνθα καὶ αἰδώς {/q} πολλοὶ γάρ μοι δοκοῦσι ...
- `turn_euthyphro_0153`: Phaedo 94d Homer quotation. Third re-quotation of the same cited half-line inside Socrates' argument. Greek: οὐκ ἄρ’ ὀρθῶς ἔχει λέγειν· {q} ἵνα γὰρ δέος ἔνθα καὶ αἰδώς, {/q} ἀλλ’ ἵνα μὲν αἰδὼς ἔνθα καὶ δέος
- `turn_euthyphro_0012`: Statement about speech with no transmitted utterance; the accepted Phaedo census ruled the identical τί οὖν δή ἐστιν ἅττα εἶπεν ὁ ἀνὴρ πρὸ τοῦ θανάτου; a false positive. Greek: καί μοι λέγε, τί καὶ ποιοῦντά σέ φησι διαφθείρειν τοὺς νέους;
- `turn_euthyphro_0087`: Bare φασί + accusative-and-infinitive with no named subject, and `οἱ σοφοί φασιν`. Representative of the whole 8c-9a stretch (turns 0088, 0089, 0091, 0093, 0095, 0097): οἱ μέν φασιν ἀλλήλους ἀδικεῖν οἱ δὲ οὔ φασιν, οὐ δεῖν φασὶ σφᾶς διδόναι δίκην, οὐδεὶς ... τολμᾷ λέγειν, οἱ μὲν δικαίως φασὶν αὐτὴν πεπρᾶχθαι. All indirect report by indefinite parties; no direct speech, no licensed owner. Greek: ἀνθρώπων, ὦ Εὐθύφρων, ἤδη τινὸς ἤκουσας {8c} ἀμφισβητοῦντος ὡς τὸν ἀδίκως ἀποκτείναντα ... οὐ δεῖ δίκην διδόναι;
- `turn_euthyphro_0042`: `οἱ σοφοί φασιν`. Reported belief of indefinite οἱ ἄνθρωποι, indirect throughout. The same turn's ὃ καὶ ἄλλοις ἤδη εἶπον, ὅτι ταῦτα ὀρθῶς ἂν εἴη οὕτω γιγνόμενα is an off-stage utterance with no printed turn, so it is not a recap — but the ὅτι clause carries an oblique optative in the reporter's deixis, i.e. indirect report, so it fails the direct-speech requirement anyway. Greek: αὐτοὶ γὰρ οἱ ἄνθρωποι τυγχάνουσι νομίζοντες τὸν Δία ... καὶ τοῦτον ὁμολογοῦσι τὸν αὑτοῦ πατέρα δῆσαι ... καὶ οὕτως αὐτοὶ αὑτοῖς τὰ ἐναντία λέγουσι
- `turn_euthyphro_0043`: Bare φασί + accusative-and-infinitive with no named subject; future hypothetical utterance of an indefinite τις. Greek: διὸ δή, ὡς ἔοικε, φήσει τίς με ἐξαμαρτάνειν.
- `turn_euthyphro_0047`: `ἔφησθα` recapping an earlier on-stage turn. Socrates reports Euthyphro's own printed turn; the original printed turn already owns that speech. Representative of the elenctic recapitulation family that recurs throughout: 0051 ἔφησθα γάρ που μιᾷ ἰδέᾳ ... εἶναι, 0085 οὐ γὰρ τοῦτό γε ἠρώτων, 0139 ὅτι δὲ ὄν οὔπω εἶπες, 0155 τὸ τοιοῦτον τοίνυν καὶ ἐκεῖ λέγων ἠρώτων, 0181 τούτου δὴ ἕνεκα καὶ ἀνηρόμην τίνα ποτὲ λέγοις, 0203 εἶπες ἂν τὸ κεφάλαιον ὧν ἠρώτων, 0208 συνῆκας ὃ εἶπον, 0225/0229 μέμνησαι γάρ που ὅτι and ἄρτι οὐ καλῶς ὡμολογοῦμεν. Greek: ἀλλά μοι εἶπες ὅτι τοῦτο τυγχάνει ὅσιον ὂν ὃ σὺ νῦν ποιεῖς, φόνου ἐπεξιὼν τῷ πατρί.
- `turn_euthyphro_0141`: Personified ὁ λόγος. The Daedalus figure has Euthyphro's statements run away and refuse to stay put; turn 0225 continues it (οἱ λόγοι φαίνωνται μὴ μένοντες ἀλλὰ βαδίζοντες). The personified λόγοι move but never speak, and the source stages no bounded direct prosopopoeia comparable to the Laws in Crito. Socrates' argumentative personification, no by default. Greek: τοῦ ἡμετέρου προγόνου, ὦ Εὐθύφρων, ἔοικεν εἶναι {11c} Δαιδάλου τὰ ὑπὸ σοῦ λεγόμενα ... οὐ γὰρ ἐθέλουσι σοὶ μένειν
- `turn_euthyphro_0157`: Phaedo 88c Echecrates quoting himself, plus indirect report. A counterfactual self-report by the printed speaker with an ὅτι clause in oblique construction, not delimited as direct speech. Same class as turn 0159 (ἵνα καὶ Μελήτῳ λέγωμεν μηκέθ’ ἡμᾶς ἀδικεῖν) and turn 0233 (ἐνδειξάμενος ἐκείνῳ ὅτι σοφὸς ἤδη ... γέγονα), projected future utterances of Socrates with no quotation markers and no deictic shift. Greek: εἰ μὲν οὖν σύ με ἠρώτας τι τῶν νυνδή ... εἶπον ἂν ὅτι ὃς ἂν μὴ σκαληνὸς ᾖ ἀλλ’ ἰσοσκελής
- `turn_euthyphro_0014`: Statement about the speaker's own habitual prophesying and about the assembly's laughter. No utterance content is transmitted from any voice. Greek: καὶ ἐμοῦ γάρ τοι, {3c} ὅταν τι λέγω ἐν τῇ ἐκκλησίᾳ περὶ τῶν θείων, προλέγων αὐτοῖς τὰ μέλλοντα, καταγελῶσιν ὡς μαινομένου· καίτοι οὐδὲν ὅτι οὐκ ἀληθὲς εἴρηκα ὧν προεῖπον

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The scan is complete — turn spans tile the source exactly, the wide-net stem scan plus the complementizer scan plus a full reading of all 31,151 characters means no cue went unread, and 133 turns contain no speech cue and no quotation marker at all. Confidence rose from medium at pass A because the ruling replaces the judgement call that pass A could not settle (whether oratio obliqua of a named third party counts) with an explicit no, and because it also disposes of the two source-delimited self-quotations that were the only other candidates. The one call carrying real weight is turn 0037, and it is decided by a ruling row that matches it point for point: bounded direct speech whose owner is the printed speaker, in a dialogue with no narration level. If that row were read not to reach a printed speaker's quoted address to an absent third party, the disposition would become 'required' with the single turn turn_euthyphro_0037; no other outcome is reachable on this evidence.
