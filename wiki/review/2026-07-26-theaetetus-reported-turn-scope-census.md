# theaetetus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/theaetetus.txt`, sha256 `96b88e1f11fdcd0b3b5318857d95dfb7aa66825e786b3f27460f8043688df0ee`
**Turn index**: `derived/plato/turns/theaetetus.toon`, sha256 `7521a9787c1c43eefc9102d9dc606a9980eee129ce0a17d15634810c3263f12b`, 1029 printed-siglum turn(s)
**Disposition**: `required` — 16 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 607.
Turns with no cue and no quotation marker: 747.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

16 of 1029 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_theaetetus_0189` | ΣΩ. |
| `turn_theaetetus_0234` | ΣΩ. |
| `turn_theaetetus_0292` | ΣΩ. |
| `turn_theaetetus_0302` | ΣΩ. |
| `turn_theaetetus_0351` | ΣΩ. |
| `turn_theaetetus_0353` | ΣΩ. |
| `turn_theaetetus_0355` | ΣΩ. |
| `turn_theaetetus_0356` | ΣΩ. |
| `turn_theaetetus_0357` | ΣΩ. |
| `turn_theaetetus_0514` | ΣΩ. |
| `turn_theaetetus_0606` | ΣΩ. |
| `turn_theaetetus_0729` | ΣΩ. |
| `turn_theaetetus_0731` | ΣΩ. |
| `turn_theaetetus_0733` | ΣΩ. |
| `turn_theaetetus_0812` | ΣΩ. |
| `turn_theaetetus_0853` | ΣΩ. |

The remaining 1013 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_theaetetus_0189`
- `turn_theaetetus_0234`
- `turn_theaetetus_0292`
- `turn_theaetetus_0302`
- `turn_theaetetus_0351`
- `turn_theaetetus_0353`
- `turn_theaetetus_0355`
- `turn_theaetetus_0356`
- `turn_theaetetus_0357`
- `turn_theaetetus_0514`
- `turn_theaetetus_0606`
- `turn_theaetetus_0729`
- `turn_theaetetus_0731`
- `turn_theaetetus_0733`
- `turn_theaetetus_0812`
- `turn_theaetetus_0853`

## Ambiguous boundary decisions

- Ruling applied: turn_theaetetus_0013 yes->no: `Φίληβος φησι` + content. εἶπέ τε ὅτι πᾶσα ἀνάγκη εἴη τοῦτον ἐλλόγιμον γενέσθαι is ὅτι-oratio-obliqua with optative — an indirect report of Socrates' offstage prediction, not bounded direct speech.
- Ruling applied: turn_theaetetus_0019 yes->no: two grounds both fail. οἷς ἔφη διαλεχθῆναι / ἔφη δὲ τῷ τε γεωμέτρῃ Θεοδώρῳ is indirect report (`Φίληβος φησι` case). The four {q} spans (καὶ ἐγὼ ἔφην, καὶ ἐγὼ εἶπον, συνέφη, οὐχ ὡμολόγει) are three-word specimens of Socrates' narrative diction listed under Euclides' own οἷον … ἢ … ἢ αὖ construction — quoted material used inside the current speaker's point, i.e. the Phaedo 94d case, and not a bounded stretch of speech.
- Ruling applied: turn_theaetetus_0344 yes->no: quotation alone is not enough. λέγω δὴ τὸ δεινότατον ἐρώτημα, ἔστι δὲ οἶμαι τοιόνδε τι· {q}…{/q} attributes the quoted question to nobody but Socrates himself; the ruling requires direct speech attributed to another owner.
- Ruling applied: turn_theaetetus_0420 yes->no: `Φίληβος φησι` + content. Θρᾷττά τις … ἀποσκῶψαι λέγεται ὡς … προθυμοῖτο … λανθάνοι is λέγεται + infinitive + ὡς-clause, indirect throughout.
- Ruling applied: turn_theaetetus_0822 yes->no: `Φίληβος φησι` + content. ὁ τὸν ποταμὸν καθηγούμενος … ἔφη ἄρα δείξειν αὐτό is ἔφη + infinitive, indirect.
- Ruling applied: turn_theaetetus_0833 yes->no: `Φίληβος φησι` + content. ἔφη δὲ τὴν μὲν μετὰ λόγου ἀληθῆ δόξαν ἐπιστήμην εἶναι … is ἔφη + accusative-and-infinitive across three clauses, indirect. It is also a remembered proposition, which the standard names explicitly.
- Ruling applied: turn_theaetetus_0836 yes->no: `Φίληβος φησι` + content, and bare unnamed subject. ἐδόκουν ἀκούειν τινῶν ὅτι … λόγον οὐκ ἔχοι is an ὅτι-report by an unnamed τινές, with no direct speech and no licensed owner.
- Ruling applied: turn_theaetetus_0837 yes->no: same. The whole 201e-202c dream theory continues that report in unbroken oratio obliqua (εἴη, δεῖν, εἶναι, ἔχειν, γεγονέναι). Length does not convert an indirect report into a nested turn; its five {q} spans are word mentions (αὐτό, ἐκεῖνο, ἕκαστον, μόνον, τοῦτο).
- `turn_theaetetus_0353` → **yes**: Turns on the whole-turn-quotation case against the 'quotation alone is not enough' caution. The parenthetical construction is formally identical to οὐδὲν ἐγώ, φήσει (0351) and {q} οὐκοῦν, {/q} φησί (0731), and it does put a direct question below the printed speaker with a second-person owner (the addressee at 165d is Theaetetus, who spoke at 0352). What makes it uncertain is that the attributing verb is a potential optative, so the Greek stages the utterance as merely possible, and Socrates answers his own question in the next clause (ἄλλο τι πειρώμεθα λέγειν;). Kept `yes` for consistency with the other parenthetical-attribution turns; a reviewer who requires an indicative attributing verb should drop it. Greek: τίν’ οὖν δὴ ὁ Πρωταγόρας, φαίης ἂν ἴσως, λόγον ἐπίκουρον τοῖς αὑτοῦ ἐρεῖ;
- `turn_theaetetus_0961` → **no**: Turns on Phaedo 94d against the Sophist 237a whole-verse case. It is a complete verse with a naming formula (Ἡσίοδος … λέγει τό), which reads like 237a; but it is introduced by οἷον as an illustration and Socrates immediately makes it his own premise (ἃ ἐγὼ μὲν οὐκ ἂν δυναίμην εἰπεῖν, οἶμαι δὲ οὐδὲ σύ), which is 94d. Called `no` on the 94d ground. Greek: οἷον καὶ Ἡσίοδος περὶ ἁμάξης λέγει τὸ {q} ἑκατὸν δέ τε δούραθ’ ἁμάξης. {/q}
- `turn_theaetetus_0465` → **no**: Same tension, and this one is Parmenidean verse, which the ruling names as `yes` at Sophist 237a. Called `no` here because the geometry differs: the verse sits inside Socrates' ὅτι-clause as one item (ἄλλοι … ἀπεφήναντο, {quote}…{/quote}, καὶ ἄλλα ὅσα … διισχυρίζονται), its own infinitive ὄνομ’ εἶναι is subordinated, and no speaker is named as its owner — Μέλισσοι and Παρμενίδαι are plural type-names attached to the other items. If a reviewer reads ἄλλοι … ἀπεφήναντο as a naming formula for the verse, this flips to `yes` with an unregistered owner. Greek: ὅτι ἄλλοι αὖ τἀναντία τούτοις ἀπεφήναντο, {180e} {quote} {sic} οἷον ἀκίνητον τελέθει τῷ παντὶ ὄνομ’ εἶναι {/sic} {/quote} καὶ ἄλλα ὅσα Μέλισσοί τε καὶ Παρμενίδαι … διισχυρίζονται
- `turn_theaetetus_0344` → **no**: λέγω δή makes Socrates the utterer and the Greek attributes the words to no one else, which the ruling settles as `no`. It remains borderline only because the same question is owned four turns later by the ἀνέκπληκτος ἀνήρ, who answers in propria persona at 165c; if a reviewer treats 165b-165c as one staged interrogation, 0344 joins 0351. Greek: λέγω δὴ τὸ δεινότατον ἐρώτημα, ἔστι δὲ οἶμαι τοιόνδε τι· {q} ἆρα οἷόν τε τὸν αὐτὸν εἰδότα τι τοῦτο ὃ οἶδεν μὴ εἰδέναι; {/q}
- `turn_theaetetus_0019` → **no**: Flipped this pass. The spans are direct-speech fragments with a deictic centre that is Socrates', not Euclides', and the text does name their speaker (ὁπότε λέγοι ὁ Σωκράτης). Against that: they are three-word specimens of a phrase type listed under Euclides' οἷον construction, illustrating his editorial method rather than transmitting an occasion of speech — the Phaedo 94d shape. Called `no`; this is the one flip I would most expect a second reviewer to contest. Greek: περὶ αὑτοῦ τε ὁπότε λέγοι ὁ Σωκράτης, οἷον {q} καὶ ἐγὼ ἔφην {/q} ἢ {q} καὶ ἐγὼ εἶπον, {/q} ἢ αὖ περὶ τοῦ ἀποκρινομένου ὅτι {q} συνέφη {/q} ἢ {q} οὐχ ὡμολόγει, {/q}

## Inspected cue hits that yield no reported turn

- `turn_theaetetus_0163`: Phaedo 94d case, exactly. The verse is the object of Socrates' own participle εἰπών inside his sentence, which resumes πάντα εἴρηκεν; Socrates owns the argumentative unit. Greek: τραγῳδίας δὲ Ὅμηρος, {add} ὃς {/add} εἰπών— {quote} Ὠκεανόν τε θεῶν γένεσιν καὶ μητέρα Τηθύν {/quote} πάντα εἴρηκεν ἔκγονα ῥοῆς τε καὶ κινήσεως
- `turn_theaetetus_0145 and turn_theaetetus_0443`: The Protagorean dictum, quoted twice. In both places the quotation is split and grammatically fused into Socrates' own clause (ἄνθρωπον εἶναι completes his accusative-and-infinitive at 152a; at 178b the quoted words are the premise of his own vocative address). Phaedo 94d case. Greek: φησὶ γάρ που {q} πάντων χρημάτων μέτρον {/q} ἄνθρωπον εἶναι, {q} τῶν μὲν ὄντων ὡς ἔστι … {/q} · {q} πάντων μέτρον ἄνθρωπός ἐστιν, {/q} ὡς φατέ, ὦ Πρωταγόρα, λευκῶν βαρέων κούφων
- `turn_theaetetus_0418, 0510, 0714, 0507, 0388`: Poetic tags and a proverb serving as the current speaker's own predicates or adverbials. Not a bounded stretch of speech, and no other owner takes the floor. Greek: κατὰ Πίνδαρον {q} τᾶς τε γᾶς ὑπένερθε {/q} … {q} οὐρανοῦ θ’ ὕπερ {/q} ἀστρονομοῦσα / τὸ τοῦ Ὁμήρου, {q} αἰδοῖός τέ μοι {/q} εἶναι ἅμα {q} δεινός τε {/q} / τὸ τῆς ψυχῆς {q} κέαρ {/q} / {q} Ἱππέας εἰς πεδίον {/q} προκαλῇ / μάλα μυρίοι δῆτα, φησὶν Ὅμηρος, οἵ γέ μοι …
- `turn_theaetetus_0286`: A quotation of what Protagoras did NOT write, inside Socrates' negated ὅτι-clause. No utterance is transmitted at all. Greek: ὅτι οὐκ εἶπεν ἀρχόμενος τῆς Ἀληθείας ὅτι {q} πάντων χρημάτων μέτρον ἐστὶν ὗς {/q} ἢ {q} κυνοκέφαλος {/q}
- `turn_theaetetus_0155, 0324, 0425, 0441, 0480, 0500, 0536, 0749, 0837, 0931, 0975, 0979`: This source's {q} markup also brackets mention of words and expressions. 39 of the 73 quoted spans are single words, stock formulae named as topics under a governing article, or a name being spelt out. Quotation alone is not enough. Greek: τὸ δέ γε {q} φαίνεται {/q} αἰσθάνεσθαί ἐστιν · μυριάκις γὰρ εἰρήκαμεν τὸ {q} γιγνώσκομεν {/q} καὶ {q} οὐ γιγνώσκομεν {/q} · ἐκβῆναι ἐκ τοῦ {q} τί ἐγὼ σὲ ἀδικῶ ἢ σὺ ἐμέ {/q} · {q} Θεαίτητον {/q} γράφων τις θῆτα καὶ εἶ
- `turn_theaetetus_0030, 0042, 0104, 0751`: Counterfactual accusative-and-infinitive attributions. Indirect report, and hypothetical at that. Greek: εἰ νῷν ἐχόντοιν ἑκατέρου λύραν ἔφη αὐτὰς ἡρμόσθαι ὁμοίως / εἰ … ἡμᾶς τοῦ σώματός τι ὁμοίους φησὶν εἶναι / εἴ σε πρὸς δρόμον ἐπαινῶν … ἔφη … ἐντετυχηκέναι / τούτων τ’ ἂν ἔφη ἀπέχεσθαι
- `turn_theaetetus_0359, 0540, 0583, 0287, 0417, 0503, 0669, 0696, 0704, 0706`: `ἔφησθα` case. All recap on-stage speech that already has its own printed turn, including Socrates' recaps of his own earlier turns. The voice layer must not duplicate them. Greek: ἐνενόησάς που λέγοντος ἄρτι τοῦ Πρωταγόρου … ὅτι … / οὐχ, ὡς ἔλεγε Θεόδωρος, αἰσχρός / σὺ καὶ Θεόδωρος ἐλέγετε σχολῆς πέρι / ὥσπερ σὺ νυνδὴ εἶπες / πάνυ γὰρ εὖ τοῦτο εἴρηκας / τοῦτο μὴν ἔλεγον, ὅτι …
- `turn_theaetetus_0209, 0211, 0212, 0466, 0468, 0474, 0482, 0753, 0755, 0994`: Two ruled cases at once. The secret-doctrine exposition (155d-157c) and the flux/rest survey are the current speaker's argumentative exposition with ὥς φασιν / ὁ τῶν σοφῶν λόγος tags — personified λόγος and bare φασί with no named subject, neither of which licenses an owner. Where a direct question IS put to the flux party (0474, 0482) it is asked in the first person plural by Socrates and Theodorus themselves. Greek: ὧν μέλλω σοι τὰ μυστήρια λέγειν … βούλεται γὰρ δὴ λέγειν ὡς … / τὸ δ’ οὐ δεῖ, ὡς ὁ τῶν σοφῶν λόγος / ἐρωτῶμεν· πότερον πᾶν φατε ἀμφοτέρως κινεῖσθαι … / ἐπιστήμης που ἕξιν φασὶν αὐτὸ εἶναι / λόγον, ὥς φασί τινες, λήψῃ
- `turn_theaetetus_0014, 0011, 0016, 0224, 0347, 0847, 0849`: Statements about speech, and indirect questions. Nothing is transmitted. 0347 is the indirect form of the very question the unflinching man later puts in direct speech at 165c (turn 0351, which IS required) — the difference between the two is the whole of the standard. Greek: καὶ ἀληθῆ γε … εἶπεν. ἀτὰρ τίνες ἦσαν οἱ λόγοι; / ἤκουόν τινων μάλα ἐγκωμιαζόντων αὐτόν / ὃ πολλάκις σε οἶμαι ἀκηκοέναι ἐρωτώντων, τί ἄν τις ἔχοι … / ὅταν ἐρωτᾷ ἀνέκπληκτος ἀνήρ … εἰ ὁρᾷς τὸ ἱμάτιον / οἷς χρώμενος εἶπε πάντα ταῦτα

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high — the ruling made this dialogue easier to call, not harder. The 16 required turns share one construction and are marked in the source itself; the eight flips are all clean applications of the `Φίληβος φησι` case to Greek that is unambiguously ὅτι- or infinitive-indirect, with no direct speech anywhere in the flipped spans. The residual uncertainty is narrow and enumerated in borderline: one admitted turn resting on a potential optative (0353), and three excluded ones resting on the Phaedo 94d / Sophist 237a boundary (0961, 0465, 0019). A reviewer disagreeing with all four would move the count to between 15 and 19; no reading of the ruling I can construct empties the list or doubles it.
