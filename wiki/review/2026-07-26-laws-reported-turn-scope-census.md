# laws: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/laws.txt`, sha256 `43aa8380889539e393dbb536684bcbc71d797d0780a3c62c9bf2436068cdd2f7`
**Turn index**: `derived/plato/turns/laws.toon`, sha256 `1e519d1b3060586854860f57e4938fbc5cb727b9f9b69a206331076bfa2cdd1e`, 1999 printed-siglum turn(s)
**Disposition**: `required` — 23 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 1828.
Turns with no cue and no quotation marker: 1086.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

23 of 1999 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_laws_0068` | ΑΘ. |
| `turn_laws_0069` | ΑΘ. |
| `turn_laws_0104` | ΑΘ. |
| `turn_laws_0155` | ΜΕ. |
| `turn_laws_0243` | ΚΛ. |
| `turn_laws_0831` | ΑΘ. |
| `turn_laws_0881` | ΑΘ. |
| `turn_laws_0883` | ΑΘ. |
| `turn_laws_0919` | ΑΘ. |
| `turn_laws_0964` | ΑΘ. |
| `turn_laws_0966` | ΑΘ. |
| `turn_laws_0969` | ΑΘ. |
| `turn_laws_1080` | ΑΘ. |
| `turn_laws_1283` | ΑΘ. |
| `turn_laws_1351` | ΑΘ. |
| `turn_laws_1447` | ΑΘ. |
| `turn_laws_1453` | ΑΘ. |
| `turn_laws_1498` | ΑΘ. |
| `turn_laws_1499` | ΑΘ. |
| `turn_laws_1548` | ΑΘ. |
| `turn_laws_1565` | ΑΘ. |
| `turn_laws_1622` | ΑΘ. |
| `turn_laws_1839` | ΑΘ. |

The remaining 1976 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_laws_0068`
- `turn_laws_0069`
- `turn_laws_0104`
- `turn_laws_0155`
- `turn_laws_0243`
- `turn_laws_0831`
- `turn_laws_0881`
- `turn_laws_0883`
- `turn_laws_0919`
- `turn_laws_0964`
- `turn_laws_0966`
- `turn_laws_0969`
- `turn_laws_1080`
- `turn_laws_1283`
- `turn_laws_1351`
- `turn_laws_1447`
- `turn_laws_1453`
- `turn_laws_1498`
- `turn_laws_1499`
- `turn_laws_1548`
- `turn_laws_1565`
- `turn_laws_1622`
- `turn_laws_1839`

## Ambiguous boundary decisions

- Ruling applied: turn_laws_0057 yes->no: `Φίληβος φησι` + content. The hypothetical reply is ὅτι-indirect (κἂν πολὺ φαυλότερος εἴποι Τυρταίου τις τἀληθές, ὅτι δύο …) and inside the ὅτι-clause the first person is the Athenian's own (ὡς ἔφαμεν ἡμεῖς νυνδή, θήσομεν οἶμαι). No bounded direct speech is transmitted.
- Ruling applied: turn_laws_0156 yes->no: `Φίληβος φησι` + content. Epimenides' prophecy is ὅτι + retained indicative (εἶπεν ὅτι δέκα μὲν ἐτῶν οὐχ ἥξουσιν), the standard Greek indirect construction. Indirect report, no nested turn — even though the utterance is off-stage and would otherwise have qualified under the ἔφησθα row.
- Ruling applied: turn_laws_0349 yes->no: `Φίληβος φησι` + content. The father/lawgiver's reply is ὡς-indirect (ὁ δ’ εἰπέτω ὡς ὁ ζῶν τὸν ἥδιστον βίον ἐστὶν μακαριώτατος) and εἰ δὴ δύο φαῖεν transmits nothing; the three {q} spans are the Athenian's own questions.
- Ruling applied: turn_laws_0722 yes->no: no other owner. The apostrophe {q} ὦ Δαρεῖε … {/q} is bounded direct speech, but its frame is impersonal (εἰπεῖν ἐστιν δικαιότατον ἴσως), so the words are not attributed to an owner below the printed speaker — they are the Athenian's own.
- Ruling applied: turn_laws_0877 yes->no: bare φασί + accusative-and-infinitive with no named subject (βλέπειν δεῖν φασι τοὺς νόμους … λέγεσθαι κάλλισθ’ οὕτω).
- Ruling applied: turn_laws_1586 yes->no: `οἱ σοφοί φασιν`, indirect report (λέγουσί πού τινες ὡς πάντα ἐστὶ τὰ πράγματα …).
- Ruling applied: turn_laws_1590 yes->no: bare φασί parenthetical inside a third-person doctrinal report (ἔοικε, φασίν, … ἀπεργάζεσθαι φύσιν καὶ τύχην); no direct speech and no licensed owner.
- Ruling applied: turn_laws_1592 yes->no: bare φασί + accusative-and-infinitive (πῦρ καὶ ὕδωρ … φύσει πάντα εἶναι καὶ τύχῃ φασίν).
- Ruling applied: turn_laws_1594 yes->no: bare φασί + accusative-and-infinitive (θεοὺς … εἶναι πρῶτόν φασιν οὗτοι τέχνῃ); the only vocative in the turn, ὦ μακάριε, is the Athenian addressing Clinias.
- Ruling applied: turn_laws_1499 no->yes: whole-turn quotation. The entire printed turn is one {q} span in the second person to the Athenian (διοριεῖς οὖν αὐτοῖς … θήσομεν;), continuing the hypothetical interrogation by Clinias and Megillus opened at 860e. The first pass suppressed it because the quotation fills the turn and carries no reporting verb of its own; the ruling that whole-turn quotation is enough when the words are attributed to another owner reinstates it.
- Ruling applied: turn_laws_0919 no->yes: whole-turn quotation, prosopopoeia clause. Corrects a first-pass error found in reconciliation. I had filed 719c-e with the first-person-plural prelude class on the strength of its frame verb (λέγοιμεν) without checking the deixis inside the quotation. The frame is ὑπὲρ δὴ τῶν ποιητῶν εἰ τάδε λέγοιμεν πρὸς αὐτόν — ὑπέρ plus genitive with a speech verb names the party on whose behalf the words are spoken — and the ~1,150-character {q} span that follows is the poets' own: ὑπό τε αὐτῶν ἡμῶν ἀεὶ λεγόμενός ἐστιν has ἡμεῖς = the poets, and ἐγὼ δέ, εἰ μὲν γυνή μοι διαφέρουσα εἴη πλούτῳ καὶ θάπτειν αὑτὴν διακελεύοιτο ἐν τῷ ποιήματι, τὸν ὑπερβάλλοντα ἂν τάφον ἐπαινοίην is a first person who composes ἐν τῷ ποιήματι and so cannot be the Athenian. Second person throughout is the lawgiver (σκέψαι … τῶν ὑπὸ σοῦ λεχθέντων, προστάττεις, σοὶ δὲ οὐχ οὕτω ῥητέον). A named party holds the floor for a bounded stretch with its own deixis, addressed to a second party.
- `turn_laws_0964` → **yes**: Turns on the exception clause in the personified-ὁ-λόγος row. Default would be no, but here the λόγος is given a vocative, holds the floor for roughly 1,500 characters of 741a-741e, and issues its own imperatives to the citizens — a bounded direct prosopopoeia of the Crito shape. The counter-reading is that the frame is φῶμεν, so 'we' are still the speakers and the λόγος is only argumentative personification. Note that 0964 is weaker than turn_laws_0919, the other prosopopoeia admitted here: 0919 has a named party (ὑπὲρ τῶν ποιητῶν) and a first person inside the quotation that provably is not the Athenian's, whereas 0964's speaker is an abstraction and its quotation carries no first person at all. If the exception clause is read narrowly enough to exclude an abstraction, 0964 drops and 0919 stands. Greek: ταῦτ’ οὖν δὴ τὸν νῦν λεγόμενον λόγον ἡμῖν φῶμεν παραινεῖν λέγοντα· ὦ πάντων ἀνδρῶν ἄριστοι, τὴν ὁμοιότητα καὶ ἰσότητα … μὴ ἀνίετε … φυλάξατε τὸν εἰρημένον … μὴ ἀτιμάσητε
- `turn_laws_1622` → **yes**: Unsettled between the Phaedo 88c row and the οἱ σοφοί row. The immediately preceding turn (892e-893a) announces self-questioning — ἀνερωτᾶν πρῶτον ἐμαυτόν … ἀποκρίνασθαι πάλιν ἐμέ — which would make the whole staged exchange a printed speaker's quoted self-address and therefore no. But the exchange as written attributes the questions to ὁπόταν φῇ τις and has that questioner address the Athenian as ὦ ξένε, which is bounded direct speech by an indefinite other. I call yes on what the 893b text does rather than on what 893a announces. The Athenian's own answers (φήσω, φήσομεν) are his and stay in his turn either way. Greek: ὦ ξένε, ὁπόταν φῇ τις, ἆρα ἕστηκε μὲν πάντα, κινεῖται δὲ οὐδέν; … — τὰ μὲν κινεῖταί που, φήσω, τὰ δὲ μένει.
- `turn_laws_0881, turn_laws_0883` → **yes**: Turns on where the οἱ σοφοί row's 'unless it introduces direct speech' clause starts. Unlike the rest of 714b-715a — which I now rule out as bare φασί plus accusative-and-infinitive — these two turns are finite indicative main clauses with an interposed φασίν and a second-person address (οἴει) to Clinias, who answers them at 0882/0884/0886 and glosses at 0888. That is oratio recta with a parenthetical reporting verb, so I record them as required spans with an unresolved collective owner. The counter-reading is that the Athenian is ventriloquizing rather than transmitting, i.e. argumentative personification. Adjacent turns 0879, 0885, 0887 continue the same voice with no reporting verb and are recorded no. Greek: τίθεται δήπου, φασίν, τοὺς νόμους ἐν τῇ πόλει ἑκάστοτε τὸ κρατοῦν. ἦ γάρ; … ἆρ’ οὖν οἴει, φασίν, ποτὲ δῆμον νικήσαντα … θήσεσθαι ἑκόντα
- `turn_laws_0243` → **yes**: Direct speech of a single word (ἔστιν) with a parenthetical φήσει naming the lawgiver as speaker, inside a Clinias turn. It has the exact shape the standard licenses — bounded direct speech below the printed speaker, licensed by speech machinery — but it is at the extreme low end of 'bounded stretch', and a reviewer may hold that one word is not a stretch. Greek: ἔστιν, φήσει που, τὸν οἶνον φράζων.
- `turn_laws_0068, turn_laws_0069, turn_laws_1498, turn_laws_1499` → **yes**: Bounded direct speech attributed to Clinias (631b) and to Clinias and Megillus (860e), both addressing the Athenian as ὦ ξένε. The ἔφησθα row excludes recaps of earlier ON-STAGE turns, and these owners are on stage — but neither utterance was ever made: 631b is counterfactual (ἐχρῆν εἰπεῖν, 'you ought to have said') and 860e is hypothetical (εἴ … ἐρωτῷτε). There is no printed turn anywhere that already owns these words, so the recap exclusion does not reach them and I call them yes. If a reviewer extends the exclusion to any speech attributed to an on-stage printed speaker, all four drop and the count falls to 18. Greek: {q} ὦ ξένε, {/q} ἐχρῆν εἰπεῖν, {q} οἱ Κρητῶν νόμοι οὐκ εἰσὶν μάτην … {/q} (631b-632d); εἴ με, ὦ Κλεινία καὶ Μέγιλλε, ἐρωτῷτε· {q} … ὦ ξένε, τί συμβουλεύεις ἡμῖν … {/q} (860e-861a)
- `turn_laws_0966, turn_laws_1080, turn_laws_1351, turn_laws_1548` → **yes**: Short direct speech by an indefinite τις, licensed by φαίη/εἴποι ἄν and carrying second-person deixis to the interlocutors (ὑμῖν, λέγεις). They fall under the οἱ σοφοί row's direct-speech clause, so they are required with an unresolved owner. The uncertainty is one of scale, not of construction: two of them are three words long. They are distinguished from the excluded 'anyone would say' class (0235, 0965, 1046, 1127) by being set off as the objector's own turn in an exchange rather than absorbed into the Athenian's sentence. Greek: {q} τί δή; {/q} φαίη τις ἂν ἴσως (742d); πρὸς οὖν δὴ τί ταῦτα, εἴποι τις ἄν, ὑμῖν πάντ’ ἐρρήθη τὰ νῦν; (782d); καὶ πάνυ γε, φαίη τις ἂν ὀρθῶς λέγων (830a); πρόχειρον δὴ παντὶ … ὑπολαβεῖν ὀρθῶς, {q} τὸν τί τρώσαντα ἢ τίνα ἢ πῶς ἢ πότε λέγεις; {/q} (875d-e)

## Inspected cue hits that yield no reported turn

- `turn_laws_0054`: Phaedo 94d case. Tyrtaeus's verse is used inside the Athenian's argument; he owns the argumentative unit and the verse is not a new local turn owner. Same for turn_laws_0059, 0061, 0339, 0551, 0572, 0801, 0909, 1048, 1219, 1796, 1873 — eleven further verse citations with naming formulas. turn_laws_0801 (Homer's Odysseus named and quoted) is the exact structural twin of Phaedo 94d. Greek: προστησώμεθα γοῦν Τύρταιον … ἐσπούδακεν εἰπὼν ὅτι— {quote} οὔτ’ ἂν μνησαίμην οὔτ’ ἐν λόγῳ ἄνδρα τιθείμην {/quote}
- `turn_laws_0242`: Bounded direct speech, but the framing verb is first person plural (λέγωμεν) and the words are the interlocutors' own; only the addressee changes. Head of the largest excluded class in Laws — the legislative preludes and constructed addresses at turn_laws_0059, 0242, 0350, 0685, 0827, 0901, 0903, 0904, 0905, 0913, 0915, 0917, 0995, 1037, 1041, 1236, 1311, 1344, 1503, 1580, 1728, 1755, 1789, 1796, 1843, 1933 (26 turns, several of them whole-turn {q} spans). The ruling that whole-turn quotation is enough applies only when the words are attributed to ANOTHER owner, which these are not; and the Crito comparison in the ὁ λόγος row is about a personified speaker holding the floor, not about the current speaker addressing a new audience. The frame verb alone does not settle this — see the discriminator in method, and turn_laws_0919, which has the same first-person-plural frame but fails the test and is therefore required. Every turn in this list passes it: the first person inside the quotation is the frame's own speakers (ἡμεῖς/ἡμῖν/ἡμῶν at 0685, 0903, 0904, 0905, 0913, 1503; δῶμεν at 0827; the self-identifying ἐγώ τε καὶ ὅδε καὶ Κλεινίας ὁ Κνώσιος οὑτοσί at 0057; με under an explicit ἔγωγ’ ἂν φαίην at 0349), or there is no first person inside at all and nothing displaces the frame (0059, 0722, 0901, 0915, 1933). Greek: πάλιν δὴ πρὸς τὸν νομοθέτην λέγωμεν τάδε· εἶεν, ὦ νομοθέτα, τοῦ μὲν δὴ φόβου σχεδὸν οὔτε θεὸς ἔδωκεν ἀνθρώποις τοιοῦτον φάρμακον
- `turn_laws_0179`: Personified ὁ λόγος, no by default: the argument never holds the floor and never addresses anyone. Recurs at turn_laws_0263, 0460, 0645, 0875, 0950, 1149, 1609, 1802. turn_laws_0964 is the one place in Laws where the exception clause bites. Greek: μιᾷ γάρ φησιν ὁ λόγος δεῖν τῶν ἕλξεων συνεπόμενον ἀεὶ … ἀνθέλκειν
- `turn_laws_0066`: ἔφησθα recapping Clinias's earlier on-stage turn. The original printed turn already owns that speech. The same ruling excludes turn_laws_0081 (ἥττω τινὰ ὅδε καὶ πόλιν ἔλεγεν), 0517 (ὡς ὑμεῖς φατε), 0591 (ἣν ὑμεῖς ὀρθῶς ἔφατε), 0800 (τοῦτ’ ἐλεγέτην αὐτὸ … σφώ), 1039 (ὥς φησιν Κλεινίας) and the many ὅπερ εἶπες / ὡς σὺ λέγεις recaps. Greek: ὅτι δὲ πάντα εἰς μόριον ἀρετῆς, καὶ ταῦτα τὸ σμικρότατον, ἐπαναφέροντα ἔφησθ’ αὐτὸν νομοθετεῖν
- `turn_laws_0274`: Quotation alone is not enough: the {q} markers quote the interlocutors' own phrase back at themselves (φαμέν). A printed speaker's quoted self-address stays inside their own turn. Greek: {q} καλῶς ᾄδει, {/q} φαμέν, {q} καὶ καλῶς ὀρχεῖται {/q}
- `turn_laws_0823`: A statement about speech with no transmitted utterance at all. Greek: οἵ τε ἄλλοι γε δὴ πάντες οἱ νυνδὴ ῥηθέντες, κελευόμενοι τὴν αὑτῶν εὐχὴν εἰπεῖν, εἴποιεν ἄν
- `turn_laws_0935`: Quoted statute text, the largest single body of set-off material in Laws. It is the Athenian's own draft legislation, marked with {p} and never with {q}, and no other owner is named. Same for the personified νόμος at turn_laws_1221 (ὁ ἐμὸς νόμος ἂν εἴποι) and turn_laws_1349 (ὁ νόμος ἐρεῖ). Greek: λέγωμεν δὴ πρῶτον τὸν ἁπλοῦν … {p} γαμεῖν δέ, ἐπειδὰν ἐτῶν ᾖ τις τριάκοντα, μέχρι ἐτῶν πέντε καὶ τριάκοντα
- `turn_laws_1822`: A proverbial maxim quoted as authority inside the Athenian's argument — the Phaedo 94d case applied to a prose apophthegm rather than to verse. Greek: οὐδαμῇ ἀγεννοῦς ἀνδρὸς νομοθέτημα, ὃς εἶπεν· ἃ μὴ κατέθου, μὴ ἀνέλῃ
- `turn_laws_0965`: Indirect report of what the many would say. Same disposal for the brief citations of common opinion at turn_laws_0235, 0291, 0304, 0852, 0980, 1046, 1127, 1245, 1281, 1575, 1781, 1800, 1873, 1996. Greek: ἔστιν δὴ τοῦ νοῦν ἔχοντος πολιτικοῦ βούλησις, φαμέν, οὐχ ἥνπερ ἂν οἱ πολλοὶ φαῖεν, δεῖν βούλεσθαι τὸν ἀγαθὸν νομοθέτην ὡς μεγίστην τε εἶναι τὴν πόλιν
- `turn_laws_0288`: A denial that anyone would say X. No utterance transmitted; the content is expressly disclaimed. Greek: οὐ γάρ που ἐρεῖ γέ τις ὥς ποτε τὰ τῆς κακίας ἢ ἀρετῆς καλλίονα χορεύματα

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the disposition and on 19 of the 23 turns, medium on the total. The ruling removed the two policy questions that made the first pass medium: indirect report is now decided, and whole-turn quotation is now decided. What is left is narrower and each item is isolated. Four turns (0068, 0069, 1498, 1499) turn on whether the ἔφησθα recap exclusion reaches counterfactual and hypothetical speech attributed to on-stage printed speakers; I read it as not reaching them because no printed turn anywhere owns those words, and if that is wrong the count is 19. turn_laws_0964 turns on the ὁ λόγος exception clause and is worth one ID. turn_laws_1622 turns on a conflict inside the source itself between the 893a framing and the 893b text. turn_laws_0243 is one word of direct speech. Coverage confidence remains high for the reasons given in method, and the removals are all positive determinations from the Greek construction rather than from absence of evidence. One caveat against my own numbers: turn_laws_0919 shows that a wrong exclusion in this dialogue looks exactly like a right one from the frame verb, and I found it only because reconciliation asked. I have now run the deixis discriminator over all fifteen {q} spans of 40 characters or more that sit outside the list, which is the complete set of quotation-marked candidates, but unmarked prosopopoeia of the 0919 shape would not be caught by that sweep — the protection there is the reporting-verb scan, which is complete.
