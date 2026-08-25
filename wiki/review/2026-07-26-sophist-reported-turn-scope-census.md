# sophist: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/sophist.txt`, sha256 `4e856d5f7b7c4d870fd0fbce7c61060fd9c85e6c708ba39d6f18b329cb4ebbeb`
**Turn index**: `derived/plato/turns/sophist.toon`, sha256 `34a515b5accf12d084e3605380f0866b27e3a6ff17b84656a0951f135ad1fd6b`, 1178 printed-siglum turn(s)
**Disposition**: `required` — 2 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 365.
Turns with no cue and no quotation marker: 905.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

2 of 1178 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_sophist_0592` | ΞΕ. |
| `turn_sophist_0956` | ΞΕ. |

The remaining 1176 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_sophist_0592`
- `turn_sophist_0956`

## Ambiguous boundary decisions

- Ruling applied: turn_sophist_0956 no->yes: same ruling row. ὅτι ὁ μέν πού φησιν— + the same Parmenides verse fills the entire printed turn. 'Direct speech attributed to another owner is enough, even when the quotation fills the whole printed turn' is decisive, and this is the turn I flagged in the first pass as the one most likely to flip.
- `turn_sophist_0435` → **no**: Reconciliation correction by the executing reviewer. The re-derivation flipped this turn to yes because the operator ruling names “Sophist 237a Parmenides verse” as a whole-turn quotation, but that example was mis-cited in the question put to the operator: the turn whose body IS the hexameters is turn_sophist_0956 at 258d. Turn 0435 at 237a-b quotes 130 of its 510 characters, and the Stranger frames the verse before it (ἀπεμαρτύρατο … λέγων) and argues from it after (παρ’ ἐκείνου τε οὖν μαρτυρεῖται). That is the Phaedo 94d shape the same ruling excludes: verse used inside the citing speaker's argument, who therefore owns the argumentative unit. Called no on the ruling's criterion rather than on its mis-cited example. Greek: Παρμενίδης δὲ ὁ μέγας … ἀπεμαρτύρατο, πεζῇ τε ὧδε ἑκάστοτε λέγων καὶ μετὰ μέτρων— {quote} οὐ γὰρ μήποτε τοῦτο δαμῇ, φησίν, εἶναι μὴ ἐόντα … {/quote} παρ’ ἐκείνου τε οὖν μαρτυρεῖται
- `turn_sophist_0612` → **no**: The one call the two ruling rows pull against each other on, and the only Sophist Parmenides citation not ruled explicitly. Turns on the Phaedo 94d row: three hexameters (B8) are used INSIDE the Stranger's argument, as the predicate complement of his own conditional protasis (ὅλον ἐστίν … ἐναλίγκιον ὄγκῳ); his sentence runs straight through the quotation, resumes with his own inference (τοιοῦτόν γε ὂν τὸ ὂν … ἔχει), and closes with his own question (ἢ πῶς;). Decisive comparison: Phaedo 94d sets its verse off after a colon and was still ruled no, so a verse embedded in the speaker's own syntax is a fortiori no. This now agrees with the corrected call on 0435, which is also framed before (ἀπεμαρτύρατο … λέγων) and argued from after (παρ’ ἐκείνου τε οὖν μαρτυρεῖται); the only Sophist site where the quotation is not subordinate to the citing speaker's continuing argument is 0956, whose whole turn body is the verse. If a reviewer weights 'attributed to another speaker' alone, this flips to yes and Parmenides gains a second span. Greek: εἰ τοίνυν ὅλον ἐστίν, ὥσπερ καὶ Παρμενίδης λέγει, {quote} πάντοθεν εὐκύκλου σφαίρης ἐναλίγκιον ὄγκῳ, μεσσόθεν ἰσοπαλὲς πάντῃ· τὸ γὰρ οὔτε τι μεῖζον οὔτε τι βαιότερον πελέναι χρεόν ἐστι τῇ ἢ τῇ, {/quote} τοιοῦτόν γε ὂν τὸ ὂν μέσον τε καὶ ἔσχατα ἔχει, ταῦτα δὲ ἔχον πᾶσα ἀνάγκη μέρη ἔχειν· ἢ πῶς;
- `turn_sophist_1017` → **no**: Genuinely has all three surface marks — a speech verb (εἴπῃ), {q}-bounded direct speech, and a grammatical subject. Called no because the subject is indefinite τις, so there is no licensed owner (the ruling's 'no named subject' row), and because the quoted string is a specimen of λόγος exhibited for analysis, not an utterance event — the Stranger himself pronounces it. Same for 1033 ({q} Θεαίτητος κάθηται {/q}) and 1039, which carry no attribution formula at all. Greek: ὅταν εἴπῃ τις· {q} ἄνθρωπος μανθάνει, {/q} λόγον εἶναι φῂς τοῦτον ἐλάχιστόν τε καὶ πρῶτον;
- `turn_sophist_0586` → **no**: Recorded because it is the immediate structural neighbour of 0592, which is a yes, and a reconciler needs the discriminator. Identical machinery — {q}-bounded direct speech plus a φη- reporting formula — but φήσομεν is first-person plural: the printed speaker quoting his own projected utterance. The ruling's Phaedo 88c row is directly on point ('a printed speaker's quoted self-address stays inside their own turn'). Same for 0582, 0584, 0588, 0594, 0596, whose {q} content is first-person plural throughout (ἡμεῖς ἠπορήκαμεν, τιθῶμεν, ὑπολάβωμεν). Greek: ΞΕ. {q} ἀλλ’, ὦ φίλοι, {/q} φήσομεν, {q} κἂν οὕτω τὰ δύο λέγοιτ’ ἂν σαφέστατα ἕν. {/q}

## Inspected cue hits that yield no reported turn

- `turn_sophist_0004`: Quotation alone is not enough. The {quote} span is a two-word Homeric phrase (Od. 17.486) supplying the finite verb of Socrates' own sentence, with no attribution formula at the site — Homer is named two turns earlier, not here. No bounded direct speech and no owner. Unaffected by the ruling. Greek: πάνυ γὰρ ἇνδρες οὗτοι παντοῖοι φανταζόμενοι διὰ τὴν τῶν ἄλλων ἄγνοιαν {quote} ἐπιστρωφῶσι πόληας {/quote} , οἱ μὴ πλαστῶς ἀλλ’ ὄντως φιλόσοφοι
- `turn_sophist_0002`: Named subject + φησιν, but the content is accusative-and-infinitive indirect report of Homer's doctrine, not transmitted direct speech. Ruling row: `Φίληβος φησι` + content is no if it is indirect report. Greek: ἆρ’ οὖν, ὦ Θεόδωρε, οὐ ξένον ἀλλά τινα θεὸν ἄγων κατὰ τὸν Ὁμήρου λόγον λέληθας; ὅς φησιν ἄλλους τε θεοὺς … καθορᾶν.
- `turn_sophist_0011`: Theodorus reports what the Stranger said before the dialogue opened — genuinely off-stage, so the recap row's carve-out applies and it is not excluded on those grounds. It still fails on the other requirement: the report is infinitival indirect discourse (διακηκοέναι, ἀμνημονεῖν), so no direct speech is transmitted. Greek: ὁ δὲ ταὐτὰ ἅπερ πρὸς σὲ νῦν καὶ τότε ἐσκήπτετο πρὸς ἡμᾶς· ἐπεὶ διακηκοέναι γέ φησιν ἱκανῶς καὶ οὐκ ἀμνημονεῖν.
- `turn_sophist_0016`: Recap of an on-stage printed turn (Socrates at 217c, turn_sophist_0012), which already owns that speech. Ruling row on ἔφησθα. Recurs at 0015, 0491, 0545, 0559-0560, 0827, 0950, 0992, 1000. Greek: δρᾶ τοίνυν, ὦ ξένε, οὕτω καὶ καθάπερ εἶπε Σωκράτης πᾶσιν κεχαρισμένος ἔσῃ.
- `turn_sophist_0066`: λέγεις is second-person address to the present interlocutor, not a reporting formula. Commonest cue false positive in the dialogue (πῶς λέγεις / ἀληθῆ λέγεις / καλῶς λέγεις and kin): 0092, 0110, 0132, 0158, 0162, 0322, 0354, 0384, 0388, 0408, 0410, 0472, 0522, 0527, 0566, 0573, 0581, 0583, 0673, 0763, 0771, 0783, 0813, 0867, 1016, 1090, 1170 and others. Greek: πῶς λέγεις, καὶ πῇ διαιρούμενος ἑκάτερον;
- `turn_sophist_0081`: εἰπεῖν as a bare infinitive inside the turn speaker's own discourse (ὡς εἰπεῖν, ὡς ἔπος εἰπεῖν, πειρῶ εἰπεῖν). No utterance transmitted. Recurs at 0010, 0019, 0201, 0205, 0235, 0280, 0320, 0348, 0440, 0473, 0541, 0640, 0757, 0946, 0958, 1011, 1077. Greek: τὸ δέ γε λοιπόν ἐστιν ἓν ἔτι μόνον ὡς εἰπεῖν εἶδος.
- `turn_sophist_0569`: Doxography in wholly indirect construction — the Stranger recounts what the schools hold, transmitting none of their words. Ruling row: bare φασί + accusative-and-infinitive with no named subject is no. Same for 0551, 0567, 0570 (φασὶν αἱ Μοῦσαι), 0644, 0776, 0988. Greek: μῦθόν τινα ἕκαστος φαίνεταί μοι διηγεῖσθαι παισὶν ὡς οὖσιν ἡμῖν, ὁ μὲν ὡς τρία τὰ ὄντα … δύο δὲ ἕτερος εἰπών …
- `turn_sophist_0654`: 246e-248d, the interrogation of the giants and the friends of the forms — the dialogue's most conspicuous embedded-voice candidate, and still no. The Stranger explicitly delegates, and every subsequent answer (0665, 0667, 0671, 0677, 0685, 0697) is Theaetetus in his own printed voice reporting their position in indirect construction (ἀποκρίνονται … δοκεῖν σφίσι, φασί, δέχονται τοῦτο). Not one span is transmitted as direct speech. Greek: κέλευε δὴ τοὺς βελτίους γεγονότας ἀποκρίνασθαί σοι, καὶ τὸ λεχθὲν παρ’ αὐτῶν ἀφερμήνευε.
- `turn_sophist_0686`: Apostrophe: the Stranger addresses an absent party in his own voice. Addressing a party is not that party speaking, and their replies are relayed indirectly at 0690, 0694, 0697. Greek: τὸ δὲ δὴ κοινωνεῖν, ὦ πάντων ἄριστοι, τί τοῦθ’ ὑμᾶς ἐπ’ ἀμφοῖν λέγειν φῶμεν;
- `turn_sophist_0782`: {q} used for word-mention, not quoted discourse. Same at 0445, 0449, 1013, 1015, 1079, 1177 ({q} ταύτης τῆς γενεᾶς τε καὶ αἵματος {/q}, an unattributed Homeric tag inside the Stranger's sentence). Greek: τῷ τε {q} εἶναί {/q} που περὶ πάντα ἀναγκάζονται χρῆσθαι καὶ τῷ {q} χωρὶς {/q} …
- `turn_sophist_0387`: Readable as the Stranger briefly voicing the universal-maker's boast, but the same sentence closes in the third person (ἀποδίδοται, 'he sells them'), which excludes the boaster as its speaker. The source also carries no {q} here though it marks quoted discourse with {q} everywhere else. Downgraded from borderline: the ruling requires direct speech attributed to another owner, and neither element is present. Greek: ΞΕ. φημί, καὶ πρός γε θαλάττης καὶ γῆς καὶ οὐρανοῦ καὶ θεῶν καὶ τῶν ἄλλων συμπάντων· καὶ τοίνυν καὶ ταχὺ ποιήσας αὐτῶν ἕκαστα πάνυ σμικροῦ νομίσματος ἀποδίδοται.

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the three required turns and on the bulk of the negatives. Sophist is a direct two-party dialogue with no narrative frame; its source marks quoted discourse explicitly with {q}/{quote}, and all 32 such spans were read individually, so the quotation inventory is closed rather than sampled. Medium on 0612 alone, which is the single call the ruling's row 1 and its Phaedo 94d row pull against each other on; resolving it needs an operator reading of whether syntactic subordination of the verse to the citing speaker's clause is what the Phaedo row means by 'used inside the argument'. Also note that all three owners are unregistered, so nothing here can compile to a named siglum without a registry commit.
