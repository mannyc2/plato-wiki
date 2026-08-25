# apology: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/apology.txt`, sha256 `37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8`
**Turn index**: `derived/plato/turns/apology.toon`, sha256 `b093ce5bf1903e2ba655f7a366f88b7bff76ee522b7569de5b93d71bc27d51dd`, 1 printed-siglum turn(s)
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

Candidate hits located and inspected: 88.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 1 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_apology_0001` | (none) |

The remaining 0 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_apology_0001`

## Ambiguous boundary decisions

- `turn_apology_0001` → **yes**: 28c-28d. Turns on Ion 537a versus Phaedo 94d, and the ruling's two rows pull opposite ways here. For yes (Ion 537a): the text attributes bounded direct speech to named others and does it twice, staging a two-party exchange — Thetis with a finite naming formula (εἶπεν ἡ μήτηρ … θεὸς οὖσα), a sustained vocative address (ὦ παῖ), and a parenthetical φησί, then Achilles' reply with its own φησί. That is speech machinery on both sides of a handoff, which the Phaedo Homer quotation does not have. For no (Phaedo 94d): the whole exemplum sits inside Socrates' argument that one must not calculate the risk of death, so he owns the argumentative unit — and it sits doubly inside, being nested in his own 999-character hypothetical reply to a hypothetical objector. I call yes because the exchange structure, not the argumentative use, is what the standard makes decisive ('bounded stretch of direct speech transmitted below the printed speaker, licensed by Greek speech machinery'). A reviewer who weights 'used inside the argument' above that would call it no. The turn's disposition does not depend on it. Greek: ἐπειδὴ εἶπεν ἡ μήτηρ αὐτῷ προθυμουμένῳ Ἕκτορα ἀποκτεῖναι, θεὸς οὖσα, οὑτωσί πως, ὡς ἐγὼ οἶμαι· {q} ὦ παῖ, εἰ τιμωρήσεις Πατρόκλῳ τῷ ἑταίρῳ τὸν φόνον καὶ Ἕκτορα ἀποκτενεῖς, αὐτὸς ἀποθανῇ — αὐτίκα γάρ τοι, {/q} φησί, {q} μεθ’ Ἕκτορα πότμος ἑτοῖμος {/q} … {q} αὐτίκα, {/q} φησί, {q} τεθναίην, δίκην ἐπιθεὶς τῷ ἀδικοῦντι … {/q}
- `turn_apology_0001` → **no**: 27a. Turns on the personified-ὁ λόγος row. FLIPPED yes->no. The Greek is unmistakably in Meletus's voice (first person ἐμαυτῷ, ἐξαπατήσω, with Socrates in the third person), which is why my first pass called it yes. But ἔοικεν … ὥσπερ … συντιθέντι makes it a simile: this is the current speaker's argumentative construction of what his accuser is in effect doing, not an utterance the source transmits. No exchange is staged and no reply is made to it. Same reading applies to 27a's companion ὥσπερ ἂν εἰ εἴποι· {q} ἀδικεῖ Σωκράτης θεοὺς οὐ νομίζων, ἀλλὰ θεοὺς νομίζων. {/q}, an explicitly counterfactual one-sentence gloss on the indictment's self-contradiction. Greek: ἔοικεν γὰρ ὥσπερ αἴνιγμα συντιθέντι διαπειρωμένῳ {q} ἆρα γνώσεται Σωκράτης ὁ σοφὸς δὴ ἐμοῦ χαριεντιζομένου καὶ ἐναντί’ ἐμαυτῷ λέγοντος, ἢ ἐξαπατήσω αὐτὸν καὶ τοὺς ἄλλους τοὺς ἀκούοντας; {/q}
- `turn_apology_0001` → **no**: 23b. Same row and same reasoning as 27a, and also flipped yes->no. ὥσπερ ἂν εἰ εἴποι is counterfactual; the god is not given the floor but glossed. One sentence, no addressee who answers, no exchange. The line I am drawing across all five hypothetical-voice sites in this dialogue is structural: where the source raises an interlocutor AND answers it as an interlocutor, the voice holds the floor (20c, 28b, 29c-d, 37e — required); where a quoted sentence is offered as a gloss on what someone means (23b, 27a), it does not. Greek: καὶ φαίνεται τοῦτον λέγειν τὸν Σωκράτη … ὥσπερ ἂν {add} εἰ {/add} εἴποι ὅτι {q} οὗτος ὑμῶν, ὦ ἄνθρωποι, σοφώτατός ἐστιν, ὅστις ὥσπερ Σωκράτης ἔγνωκεν ὅτι οὐδενὸς ἄξιός ἐστι τῇ ἀληθείᾳ πρὸς σοφίαν. {/q}
- `turn_apology_0001` → **yes**: 37e. Turns on the Laws-in-Crito threshold in the personification row. Weaker than its three siblings: 81 characters, a single question, and the reply that follows is in the speaker's own voice rather than staged as direct speech. It keeps yes because the construction is identical to 28b (ἴσως ἂν οὖν εἴποι τις + vocative + first-person-plural address), which does stage a direct reply, and because the speaker answers the objection as an objection (τουτὶ δή ἐστι πάντων χαλεπώτατον πεῖσαί τινας ὑμῶν). A reviewer applying the sustained-discourse threshold strictly could call it no. Greek: ἴσως οὖν ἄν τις εἴποι· {q} σιγῶν δὲ καὶ ἡσυχίαν ἄγων, ὦ Σώκρατες, οὐχ οἷός τ’ ἔσῃ ἡμῖν ἐξελθὼν ζῆν; {/q}

## Inspected cue hits that yield no reported turn

- `turn_apology_0001`: 21a. FLIPPED yes->no by the ruling's `Φίληβος φησι` row. A named nominative subject plus accusative-and-infinitive is still an indirect report; the source transmits no bounded direct speech by the Pythia, and Chaerephon's question is indirect too. My first pass called this yes on the Symposium's acc-inf licensing shape; the ruling makes indirect report insufficient regardless of whether the subject is named. Greek: ἤρετο γὰρ δὴ εἴ τις ἐμοῦ εἴη σοφώτερος. ἀνεῖλεν οὖν ἡ Πυθία μηδένα σοφώτερον εἶναι.
- `turn_apology_0001`: 29c. FLIPPED yes->no. Same `Φίληβος φησι` row: ὅς (antecedent Ἀνύτῳ) + ἔφη + accusative-and-infinitive, continued by λέγων … ὡς. Anytus's courtroom speech is reported, never transmitted as direct speech. Greek: Ἀνύτῳ ἀπιστήσαντες, ὃς ἔφη ἢ τὴν ἀρχὴν οὐ δεῖν ἐμὲ δεῦρο εἰσελθεῖν ἤ, ἐπειδὴ εἰσῆλθον, οὐχ οἷόν τ’ εἶναι τὸ μὴ ἀποκτεῖναί με, λέγων πρὸς ὑμᾶς ὡς εἰ διαφευξοίμην …
- `turn_apology_0001`: 24b-24c. FLIPPED yes->no. Meletus's indictment here is recited in indirect form (φησίν + accusative-and-infinitive) and carries no {q} markers, unlike the OLD accusers' indictment at 19b which the source does mark as direct. Indirect report only. Greek: λάβωμεν αὖ τὴν τούτων ἀντωμοσίαν. ἔχει δέ πως ὧδε· Σωκράτη φησὶν ἀδικεῖν τούς τε νέους διαφθείροντα καὶ θεοὺς οὓς ἡ πόλις {24c} νομίζει οὐ νομίζοντα, ἕτερα δὲ δαιμόνια καινά.
- `turn_apology_0001`: 21b. FLIPPED yes->no by the ruling's Phaedo 88c row plus the standard's exclusion of 'remembered proposition'. This is the printed speaker's own past inner deliberation quoted inside his own turn: no second owner, no addressee, no exchange. The repeated-chain exception is for a narrator reporting themselves inside their own narration, which this is not. Greek: ταῦτα γὰρ ἐγὼ ἀκούσας ἐνεθυμούμην οὑτωσί· {q} τί ποτε λέγει ὁ θεός, καὶ τί ποτε αἰνίττεται; … οὐ γὰρ δήπου ψεύδεταί γε· οὐ γὰρ θέμις αὐτῷ. {/q}
- `turn_apology_0001`: 21c. FLIPPED yes->no. A projected purpose-clause address to the oracle that was never made — the speaker's own hypothetical words, Phaedo 88c row. Greek: ὡς {21c} ἐνταῦθα εἴπερ που ἐλέγξων τὸ μαντεῖον καὶ ἀποφανῶν τῷ χρησμῷ ὅτι {q} οὑτοσὶ ἐμοῦ σοφώτερός ἐστι, σὺ δ’ ἐμὲ ἔφησθα. {/q}
- `turn_apology_0001`: 29d-30c. FLIPPED yes->no, and this is the largest flip by character count (three nested spans totalling ~2,200 characters, including the depth-2 habitual address at 29d-29e and {q} οὐκ ἐκ χρημάτων ἀρετὴ γίγνεται … {/q} at 30b). All of it is the printed speaker quoting his own conditional future reply and his own habitual manner of speaking. Phaedo 88c row: a printed speaker's quoted self-address stays inside their own turn. Greek: εἴποιμ’ ἂν ὑμῖν ὅτι {q} ἐγὼ ὑμᾶς, ὦ ἄνδρες Ἀθηναῖοι, ἀσπάζομαι μὲν καὶ φιλῶ … λέγων οἷάπερ εἴωθα, ὅτι {q} ὦ ἄριστε ἀνδρῶν, Ἀθηναῖος ὤν … οὐκ ἐπιμελῇ οὐδὲ φροντίζεις; {/q} {/q}
- `turn_apology_0001`: 34d. FLIPPED yes->no. The speaker's own hypothetical address to an imagined juror. Phaedo 88c row. Its embedded Homer tag {q} ἀπὸ δρυὸς οὐδ’ ἀπὸ πέτρης {/q} was already no on the Phaedo 94d row and remains so. Greek: ἐπιεικῆ ἄν μοι δοκῶ πρὸς τοῦτον λέγειν λέγων ὅτι {q} ἐμοί, ὦ ἄριστε, εἰσὶν μέν πού τινες καὶ οἰκεῖοι· … δεήσομαι ὑμῶν ἀποψηφίσασθαι. {/q}
- `turn_apology_0001`: 34d. Unchanged no. The ruling's Phaedo 94d row exactly: verse cited by name (τὸ τοῦ Ὁμήρου) inside the speaker's argument and syntactically absorbed into his own clause (οὐδ’ ἐγὼ … πέφυκα). No new local turn owner. Greek: καὶ γὰρ τοῦτο αὐτὸ τὸ τοῦ Ὁμήρου, οὐδ’ ἐγὼ {q} ἀπὸ δρυὸς οὐδ’ ἀπὸ πέτρης {/q} πέφυκα ἀλλ’ ἐξ ἀνθρώπων
- `turn_apology_0001`: 23d. Unchanged no. Three sub-clausal stock tags quoted as slogans of an unnamed collective (λέγουσιν, subject 'they'). 'Quotation alone is not enough' — no bounded stretch of direct speech and no owner holds the floor. Closest to the οἱ σοφοί φασιν row, on its 'usually no' side because the quoted matter is not direct speech but noun phrases and infinitives governed by the reporting verb. Greek: τὰ κατὰ πάντων τῶν φιλοσοφούντων πρόχειρα ταῦτα λέγουσιν, ὅτι {q} τὰ μετέωρα καὶ τὰ ὑπὸ γῆς {/q} καὶ {q} θεοὺς μὴ νομίζειν {/q} καὶ {q} τὸν ἥττω λόγον κρείττω ποιεῖν. {/q}
- `turn_apology_0001`: 31d. Unchanged no. The daimonion is named as a φωνή but the source never transmits a word of it — only that it turns him away. A voice named is not a voice given the floor. Greek: ἐμοὶ δὲ τοῦτ’ ἔστιν ἐκ παιδὸς ἀρξάμενον, φωνή τις γιγνομένη, ἣ ὅταν γένηται, ἀεὶ ἀποτρέπει με τοῦτο ὃ ἂν μέλλω πράττειν, προτρέπει δὲ οὔποτε.
- `turn_apology_0001`: 32c. Unchanged no. The Thirty's order is reported as an act (προσέταξαν + infinitive of the deed). No utterance transmitted. Greek: οἱ τριάκοντα αὖ μεταπεμψάμενοί με πέμπτον αὐτὸν εἰς τὴν θόλον προσέταξαν ἀγαγεῖν ἐκ Σαλαμῖνος Λέοντα τὸν Σαλαμίνιον ἵνα ἀποθάνοι
- `turn_apology_0001`: 17a, 18d, 38e, 41c, 40d-e. Unchanged no, grouped: an idiom (ὡς ἔπος εἰπεῖν), a statement about naming, a description of speech the speaker refused to make, εἴποι meaning 'one might mention' governing a list of names, and a hypothetical act of stating a count. All are statements about speech with no transmitted utterance. Greek: καίτοι ἀληθές γε ὡς ἔπος εἰπεῖν οὐδὲν εἰρήκασιν. | οὐδὲ τὰ {18d} ὀνόματα οἷόν τε αὐτῶν εἰδέναι καὶ εἰπεῖν | θρηνοῦντός τέ μου … καὶ {38e} λέγοντος πολλὰ καὶ ἀνάξια ἐμοῦ | ἢ ἄλλους μυρίους ἄν τις εἴποι | δέοι σκεψάμενον εἰπεῖν πόσας ἄμεινον … βεβίωκεν

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the disposition, medium on the sub-span adjudications. The turn call rests on two independent grounds, either of which suffices alone, and both are byte-present rather than inferred: third-person reporting formulas wrapped around another party's quoted words with a vocative addressing the examiner (20b-20c), and a sustained direct-speech cross-examination whose answers address the jury and refer to the examiner in the third person (26d). Neither uses translation, doctrine, style, or an editor's labels, and neither depends on any borderline call — strike all four borderline entries and the turn is still required. The medium rating covers the four remaining borderlines, chiefly 28c Thetis-Achilles, where the ruling's Ion 537a and Phaedo 94d rows genuinely conflict and I had to choose exchange structure over argumentative use, and the 23b/27a versus 20c/28b/29c/37e line among hypothetical voices, which I drew on whether the source answers the raised voice as an interlocutor. That line is structural and stated, but it is mine, not the ruling's.
