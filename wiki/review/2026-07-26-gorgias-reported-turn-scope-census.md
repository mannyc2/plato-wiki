# gorgias: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/gorgias.txt`, sha256 `5c56dd528433e113ac4ed3139227e6a18c81b39fe717b72c79ec402cebf6460a`
**Turn index**: `derived/plato/turns/gorgias.toon`, sha256 `fcc226d7b29d0d505a1d9b05c037c18cae9fdc24e33d3f3c1ce159097226e4fa`, 1107 printed-siglum turn(s)
**Disposition**: `required` — 10 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 158.
Turns with no cue and no quotation marker: 1028.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

10 of 1107 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_gorgias_0087` | ΣΩ. |
| `turn_gorgias_0089` | ΣΩ. |
| `turn_gorgias_0097` | ΣΩ. |
| `turn_gorgias_0135` | ΣΩ. |
| `turn_gorgias_0151` | ΣΩ. |
| `turn_gorgias_0364` | ΣΩ. |
| `turn_gorgias_0998` | ΣΩ. |
| `turn_gorgias_1095` | ΣΩ. |
| `turn_gorgias_1103` | ΣΩ. |
| `turn_gorgias_1104` | ΣΩ. |

The remaining 1097 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_gorgias_0087`
- `turn_gorgias_0089`
- `turn_gorgias_0097`
- `turn_gorgias_0135`
- `turn_gorgias_0151`
- `turn_gorgias_0364`
- `turn_gorgias_0998`
- `turn_gorgias_1095`
- `turn_gorgias_1103`
- `turn_gorgias_1104`

## Ambiguous boundary decisions

- Ruling applied: turn_gorgias_0010 yes->no: indirect report. ἐκέλευε … καὶ πρὸς ἅπαντα ἔφη ἀποκρινεῖσθαι (447c) is ἔφη + infinitive with no bounded direct speech. The utterance is off-stage, so it is not excluded as a recap, but the `Φίληβος φησι` case rules indirect report out on its own.
- Ruling applied: turn_gorgias_0286 yes->no: recap of an earlier ON-STAGE turn. οὐκ ἄρτι οὕτω πως ἔλεγες· {q} ἦ οὐχὶ ἀποκτεινύασιν οἱ ῥήτορες … {/q} (466c-d) re-quotes Polus' words from 466b-c, which are already turn_gorgias_0281 (ΠΩΛ.). The ἔφησθα case: the printed turn owns that speech and the voice layer must not duplicate it. Direct speech alone does not save it.
- Ruling applied: turn_gorgias_0395 yes->no: indirect report. πρὸς τὴν μητέρα αὐτοῦ Κλεοπάτραν χῆνα ἔφη διώκοντα ἐμπεσεῖν καὶ ἀποθανεῖν (471c) is ἔφη + accusative and infinitive. Archelaus' lie is off-stage and so not a recap, but no direct speech is transmitted.
- Ruling applied: turn_gorgias_0630 yes->no: indirect report and on-stage recap together. ἔφη γάρ που Γοργίαν … αἰσχυνθῆναι αὐτὸν καὶ φάναι διδάξειν (482c-d) is accusative-and-infinitive throughout, and it recaps Polus' accusation at 461b-c and Gorgias' concession at 460a, both of which have printed turns.
- Ruling applied: turn_gorgias_0634 yes->no: the Phaedo 94d case. The {q} span at 486a is adapted Euripidean verse deployed inside Callicles' own address to Socrates — its vocative is ὦ Σώκρατες, not Amphion, and the frame verb is ἐμοὶ … ἐπέρχεται πρὸς σὲ λέγειν. οἷάπερ ἐκεῖνος πρὸς τὸν ἀδελφόν is a comparison, not an attribution of these words to Zethus. Callicles owns the argumentative unit, exactly as Socrates owns the Homer quotation at Phaedo 94d.
- Ruling applied: turn_gorgias_0698 yes->no: indirect report. ἤκουσα τῶν σοφῶν ὡς … and τὸ δὲ κόσκινον ἄρα λέγει, ὡς ἔφη ὁ πρὸς ἐμὲ λέγων, τὴν ψυχὴν εἶναι (493a-c) are the οἱ σοφοί φασιν case: ὡς-clauses and accusative-and-infinitive, no bounded direct speech by the Sicilian mythologist or by τῶν σοφῶν.
- Ruling applied: turn_gorgias_0737 yes->no: indirect recap of an on-stage turn. ὅτι Καλλικλῆς ἔφη Ἀχαρνεὺς ἡδὺ μὲν καὶ ἀγαθὸν ταὐτὸν εἶναι (495d) restates Callicles' concession made moments earlier in his own printed turns, in accusative and infinitive.
- Ruling applied: turn_gorgias_0979 yes->no: indirect recap of on-stage turns. ὃ αὖ Γοργίαν ἔφη πῶλος δι’ αἰσχύνην ὁμολογῆσαι (508c) reports Polus' 482d-style report of Gorgias, both on stage, in accusative and infinitive.
- Ruling applied: turn_gorgias_1067 yes->no: indirect report. ἔλεγές μοι πάνυ σπουδάζων, Θεαρίων ὁ ἀρτοκόπος καὶ Μίθαικος … ὅτι οὗτοι θαυμάσιοι γεγόνασιν σωμάτων θεραπευταί (518b) carries no {q}, no vocative and no deixis shift — οὗτοι and the third-person perfect are the reporter's. A bare list of names plus a ὅτι-clause is a quoted phrase, not a bounded stretch of direct speech.
- `turn_gorgias_0998` → **yes**: 510d. The only required turn whose licensing verb is not a speech verb: ἐννοήσειεν is cognition. It satisfies every other part of the standard — {q}-bounded, first-person deixis belonging to the young man (ἐγώ, με), attributed to an owner other than the printed speaker. Turns on whether quoted interior deliberation counts as 'licensed by Greek speech machinery'. If the operator reads that phrase strictly, this turn drops and the count becomes 9. Greek: εἰ ἄρα τις ἐννοήσειεν ἐν ταύτῃ τῇ πόλει τῶν νέων, {q} τίνα ἂν τρόπον ἐγὼ μέγα δυναίμην καὶ μηδείς με ἀδικοῖ; {/q}
- `turn_gorgias_1067` → **no**: 518b. Flipped to no, but not comfortably. The bare nominative list cannot be indirect discourse — no verb governs it — so something verbatim is being quoted, and ἔλεγές μοι is genuine speech machinery for a counterfactual utterance that was never made on stage (so the recap rule does not reach it). Called no because the span has no {q}, no vocative and no deixis shift, and the ὅτι-clause that carries the content is plainly indirect. Turns on whether a quoted list of names is a 'bounded stretch of direct speech'. Greek: ἔλεγές μοι πάνυ σπουδάζων, Θεαρίων ὁ ἀρτοκόπος καὶ Μίθαικος ὁ τὴν ὀψοποιίαν συγγεγραφὼς τὴν Σικελικὴν καὶ Σάραμβος ὁ κάπηλος, ὅτι οὗτοι θαυμάσιοι γεγόνασιν σωμάτων θεραπευταί
- `turn_gorgias_0087` → **yes**: 450e. A single {q}-bounded utterance by an indefinite objector (τις), licensed by ὑπολαμβάνω and addressed to Gorgias by vocative. Kept because the ruling's οἱ σοφοί φασιν case requires a span even when the owner is an unregistered or collective speaker, and direct speech is present. Same shape and same call for turn_gorgias_0135 (454d). Turns on whether a hypothetical speaker is 'another owner' at all — if the operator holds that a counterfactual τις cannot own anything, 0087, 0089, 0097, 0135, 0151, 0364, 0998 and 1095 all drop and only the Zeus myth (1103, 1104) survives. Greek: καὶ ὑπολάβοι ἄν τις, εἰ βούλοιτο δυσχεραίνειν ἐν τοῖς λόγοις, {q} τὴν ἀριθμητικὴν ἄρα ῥητορικήν, ὦ Γοργία, λέγεις; {/q}

## Inspected cue hits that yield no reported turn

- `turn_gorgias_0286`: 466c-d. The one {q}-marked span in the dialogue that is verbatim direct speech by another cast member and still gets no record: it re-quotes turn_gorgias_0281 (ΠΩΛ., 466b-c). The ἔφησθα ruling — the original printed turn already owns that speech. Greek: οὐκ ἄρτι οὕτω πως ἔλεγες· {q} ἦ οὐχὶ ἀποκτεινύασιν οἱ ῥήτορες οὓς ἂν βούλωνται, ὥσπερ οἱ τύραννοι, καὶ χρήματα ἀφαιροῦνται καὶ ἐξελαύνουσιν ἐκ τῶν πόλεων ὃν ἂν δοκῇ αὐτοῖς; {/q}
- `turn_gorgias_0634`: 486a. The Phaedo 94d case. Adapted Euripidean verse used inside Callicles' own address; the vocative is ὦ Σώκρατες. The four {quote} spans later in the same turn (486b-c) are the same class. Greek: καὶ γὰρ ἐμοὶ τοιαῦτ’ ἄττα ἐπέρχεται πρὸς σὲ λέγειν, οἷάπερ ἐκεῖνος πρὸς τὸν ἀδελφόν, ὅτι {q} ἀμελεῖς, ὦ Σώκρατες, ὧν δεῖ σε ἐπιμελεῖσθαι … {/q}
- `turn_gorgias_0970`: 505e. An Epicharmus fragment inside a relative clause governed by Socrates' own main verb. Quoted phrase, not a local turn owner — Phaedo 94d case. Greek: ἵνα μοι τὸ τοῦ Ἐπιχάρμου γένηται, ἃ {q} πρὸ τοῦ δύο ἄνδρες ἔλεγον, {/q} εἷς ὢν ἱκανὸς γένωμαι.
- `turn_gorgias_0095`: 451e. Drinking-song fragments welded into Socrates' own syntax (… ἄριστόν ἐστιν). Phaedo 94d case. Greek: ἐν ᾧ καταριθμοῦνται ᾁδοντες ὅτι {quote} ὑγιαίνειν μὲν ἄριστόν {/quote} ἐστιν … ὥς φησιν ὁ ποιητὴς τοῦ σκολιοῦ, {quote} τὸ πλουτεῖν ἀδόλως {/quote}
- `turn_gorgias_0632`: 484b. Pindar cited as authority, with Callicles glossing the lines (λέγει οὕτω πως—τὸ γὰρ ᾆσμα οὐκ ἐπίσταμαι). Phaedo 94d case. Greek: δοκεῖ δέ μοι καὶ Πίνδαρος … ἐν ᾧ λέγει ὅτι— {quote} νόμος ὁ πάντων βασιλεὺς … {/quote} οὗτος δὲ δή, φησίν,— {quote} ἄγει δικαιῶν τὸ βιαιότατον … {/quote}
- `turn_gorgias_0633`: 484e-485e. Euripidean fragments spliced word-by-word into Callicles' own sentences. Phaedo 94d case. Greek: συμβαίνει γὰρ τὸ τοῦ Εὐριπίδου· {quote} λαμπρός {/quote} τέ ἐστιν {quote} ἕκαστος {/quote} ἐν τούτῳ … ἐν αἷς ἔφη ὁ ποιητὴς τοὺς ἄνδρας ἀριπρεπεῖς γίγνεσθαι
- `turn_gorgias_1106`: 526d. Structurally identical to Phaedo 94d: Homeric line inside {quote}, naming formula, Socrates keeps the argumentative unit. Greek: ὥς φησιν Ὀδυσσεὺς ὁ Ὁμήρου ἰδεῖν αὐτὸν— {quote} χρύσεον σκῆπτρον ἔχοντα, θεμιστεύοντα νέκυσσιν. {/quote}
- `turn_gorgias_1105`: 525d-e. A statement about what Homer wrote. No transmitted utterance at all. Greek: μαρτυρεῖ δὲ τούτοις καὶ Ὅμηρος· βασιλέας γὰρ καὶ δυνάστας ἐκεῖνος πεποίηκεν τοὺς ἐν Ἅιδου … τιμωρουμένους
- `turn_gorgias_0044`: 449a. ἔφη + named subject, but the cited material is a Homeric tag inside Gorgias' own clause. Same at 516c (turn_gorgias_1052, οἵ γε δίκαιοι ἥμεροι, ὡς ἔφη Ὅμηρος). Greek: εἰ δὴ ὅ γε εὔχομαι εἶναι, ὡς ἔφη Ὅμηρος, βούλει με καλεῖν
- `turn_gorgias_0410`: 473a. First-person ἔφην: the printed speaker quoting his own earlier turn. Gorgias has no narration level, so the narrator-reporting-themselves exception cannot apply — the Phaedo 88c ruling controls. Greek: καὶ τοὺς ἀδικοῦντας ἀθλίους ἔφην εἶναι ἐγώ, καὶ ἐξηλέγχθην ὑπὸ σοῦ.
- `turn_gorgias_0015`: 447d. A one-word ὅτι-answer. Quoted phrase, not a bounded stretch of direct speech. Same at 453c (turn_gorgias_0105, εἴ μοι εἶπες ὅτι ὁ τὰ ζῷα γράφων). Greek: ἀπεκρίνατο ἂν δήπου σοι ὅτι σκυτοτόμος
- `turn_gorgias_0639`: 487c-d. A real overheard off-stage deliberation, but transmitted entirely as indirect report in Socrates' deixis with a second-person verb. Indirect report → no. Representative of the second-person recaps at 0205, 0340, 0629, 0654, 0891, 1090. Greek: καί ποτε ὑμῶν ἐγὼ ἐπήκουσα βουλευομένων … εὐλαβεῖσθαι παρεκελεύεσθε ἀλλήλοις ὅπως μὴ …

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high for the removals and for the Zeus myth; medium for the hypothetical-speaker class. The nine flips are each decided by a named case in the ruling and I do not expect any to be reversed — the indirect-report and ἔφησθα cases are stated unambiguously, and 0634 is a close structural match to the Phaedo 94d exemplar the ruling explicitly preserves. Turns 1103 and 1104 are the securest records in the dialogue: εἶπεν οὖν ὁ Ζεύς· {q} ἀλλ’ ἐγώ, {/q} ἔφη … ἦ δ’ ὅς is a named reporting formula plus first-person direct speech, and the speech runs across the turn boundary into 1104. The residual risk is a single class question the ruling does not address head-on: whether a counterfactual speaker staged by the printed speaker (εἴποι ἂν ὁ ἰατρὸς ὅτι {q} ὦ Σώκρατες … {/q}) is 'another owner'. Eight of the ten required turns stand or fall together on that question, and I flagged it rather than deciding it silently. I read the οἱ σοφοί φασιν case — which requires a span for direct speech by an unregistered collective — as settling it in favour of yes. The scan covered all 1107 turns and every character of the source, so I expect no unexamined candidate.
