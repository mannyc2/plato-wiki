# menexenus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/menexenus.txt`, sha256 `e00d4e5ac901940feeef9a30c1a331ce849e931ebc8cc96765f0e1a36b9ae007`
**Turn index**: `derived/plato/turns/menexenus.toon`, sha256 `a6229abbae81dd653eb336c47774d4b910d728cfc49d384e09718095843d7937`, 46 printed-siglum turn(s)
**Disposition**: `required` — 14 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 36.
Turns with no cue and no quotation marker: 29.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

14 of 46 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_menexenus_0025` | ΣΩ. |
| `turn_menexenus_0026` | ΣΩ. |
| `turn_menexenus_0027` | ΣΩ. |
| `turn_menexenus_0028` | ΣΩ. |
| `turn_menexenus_0029` | ΣΩ. |
| `turn_menexenus_0030` | ΣΩ. |
| `turn_menexenus_0031` | ΣΩ. |
| `turn_menexenus_0032` | ΣΩ. |
| `turn_menexenus_0033` | ΣΩ. |
| `turn_menexenus_0034` | ΣΩ. |
| `turn_menexenus_0035` | ΣΩ. |
| `turn_menexenus_0036` | ΣΩ. |
| `turn_menexenus_0037` | ΣΩ. |
| `turn_menexenus_0038` | ΣΩ. |

The remaining 32 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_menexenus_0025`
- `turn_menexenus_0026`
- `turn_menexenus_0027`
- `turn_menexenus_0028`
- `turn_menexenus_0029`
- `turn_menexenus_0030`
- `turn_menexenus_0031`
- `turn_menexenus_0032`
- `turn_menexenus_0033`
- `turn_menexenus_0034`
- `turn_menexenus_0035`
- `turn_menexenus_0036`
- `turn_menexenus_0037`
- `turn_menexenus_0038`

## Ambiguous boundary decisions

- `turn_menexenus_0035, 0036, 0037` → **yes**: The one call in this dialogue that is genuinely mixed under the ruling, and it turns on which of two cases applies. The fallen fathers' exhortation (246d-248d, chars 24221-28602) is bounded direct speech — vocative ὦ παῖδες, first-person plural of the dead (ἡμῖν δὲ ἐξὸν ζῆν μὴ καλῶς, καλῶς αἱρούμεθα μᾶλλον τελευτᾶν), imperatives to the sons (πειρᾶσθε ἔχειν, ἴστε, ἀσκεῖν) — opened by ἔλεγον δὲ τάδε— (24194-24209) and closed by ταῦτα οὖν … ἐκεῖνοί {248e} τε ἐπέσκηπτον ἡμῖν ἀπαγγέλλειν (28656-28701). But the introduction concedes it is partly reconstruction: ἅ τε αὐτῶν ἤκουσα ἐκείνων καὶ οἷα νῦν ἡδέως ἂν εἴποιεν … τεκμαιρόμενος. So it is either a transmitted off-stage utterance (yes, and not a recap, since the dead have no printed turn anywhere) or a bounded direct prosopopoeia in which the personified dead hold the floor with sustained discourse across ~2.5 Stephanus pages — comparable to the Laws in Crito, which the ruling admits. Both readings give yes, so the call is settled even though the ground is not. Flagged because a record-level pass must decide the ground before writing evidence_refs, and because these three turns already carry a required span for a different owner (Aspasia), making this the only depth-3 geometry in the dialogue. Greek: φράσω δὲ ὑμῖν ἅ τε αὐτῶν ἤκουσα ἐκείνων καὶ οἷα νῦν ἡδέως ἂν εἴποιεν ὑμῖν λαβόντες δύναμιν, τεκμαιρόμενος ἐξ ὧν τότε ἔλεγον. ἀλλὰ νομίζειν χρὴ αὐτῶν ἀκούειν ἐκείνων ἃ ἂν ἀπαγγέλλω· ἔλεγον δὲ τάδε— {246d} {p} ὦ παῖδες, ὅτι μέν ἐστε πατέρων ἀγαθῶν …
- `turn_menexenus_0025` → **yes**: Mixed turn, not wholly embedded: Socrates' own frame runs to οὑτωσί. (char 4659) and the oration begins at the {p} at char 4664, running past the turn end. Not a borderline yes/no — the scope call is clear — but recorded because the licensing formula's subject is feminine and anaphoric (ἀρξαμένη, with Ἀσπασία / ἡ διδάσκαλος named only in turns 0013-0023), so a record-level pass must resolve the antecedent rather than assume it. Greek: ἀλλ’ ἄκουε. ἔλεγε γάρ, ὡς ἐγᾦμαι, ἀρξαμένη λέγειν ἀπ’ αὐτῶν τῶν τεθνεώτων οὑτωσί. {p} ἔργῳ μὲν ἡμῖν οἵδε ἔχουσιν τὰ προσήκοντα σφίσιν αὐτοῖς

## Inspected cue hits that yield no reported turn

- `turn_menexenus_0018`: Remembered proposition, not transmitted direct speech. Asks whether Socrates recalls what Aspasia said; the relative clause ἃ ἔλεγεν transmits no words. Ruling: 'not every quoted phrase, indirect report, remembered proposition, or argumentative recap.' Greek: ἦ καὶ μνημονεύσαις ἂν ἃ ἔλεγεν ἡ Ἀσπασία;
- `turn_menexenus_0017`: εἶπεν names Pericles as deliverer of a speech whose words the source does not transmit. Indirect report → no nested turn, per the Φίληβος φησι case. Greek: ὅτε μοι δοκεῖ συνετίθει τὸν ἐπιτάφιον λόγον ὃν Περικλῆς εἶπεν, περιλείμματ’ ἄττα ἐξ ἐκείνου συγκολλῶσα.
- `turn_menexenus_0017`: ὅτι + optative indirect statement, and διῄει reports that she went through material with the content in indirect construction (οἷα δέοι λέγειν). No bounded direct speech. Also ἅπερ σὺ λέγεις recaps Menexenus' own printed turn 0004 — the ἔφησθα on-stage-recap case, which must not duplicate the voice layer. Greek: ἤκουσε γὰρ ἅπερ σὺ λέγεις, ὅτι μέλλοιεν Ἀθηναῖοι αἱρεῖσθαι τὸν ἐροῦντα· ἔπειτα τὰ μὲν ἐκ τοῦ παραχρῆμά μοι διῄει, οἷα δέοι λέγειν
- `turn_menexenus_0029`: Darius' order in oratio obliqua (εἶπεν + infinitive + optative). No direct speech, so no nested turn here on its own. Squarely the Φίληβος φησι case. The turn is required for an unrelated reason (it lies wholly inside the Aspasia oration), so no Darius span may be opened at this site. Greek: Δᾶτιν δὲ ἄρχοντα, εἶπεν ἥκειν ἄγοντα Ἐρετριᾶς καὶ Ἀθηναίους, εἰ βούλοιτο τὴν {240b} ἑαυτοῦ κεφαλὴν ἔχειν
- `turn_menexenus_0029`: Purpose clause about a report that might be made; ὅτι + optative. No utterance transmitted. Greek: ἵν’ ἔχοιεν τῷ βασιλεῖ εἰπεῖν ὅτι οὐδεὶς σφᾶς ἀποπεφευγὼς εἴη
- `turn_menexenus_0029`: First-person φημὶ of the voice currently holding the floor (the orator), with accusative-and-infinitive. Own voice, own argument. Greek: ἐγὼ μὲν οὖν ἐκείνους τοὺς ἄνδρας φημὶ οὐ μόνον τῶν σωμάτων τῶν ἡμετέρων πατέρας εἶναι
- `turn_menexenus_0032`: Argumentative recap by the current speaker of their own earlier words. Explicitly excluded by the standard. Greek: ὃ δ’ εἶπον δεινὸν καὶ ἀνέλπιστον τοῦ πολέμου γενέσθαι, τόδε λέγω
- `turn_menexenus_0036`: A proverb used inside the speaker's own argument, with no owner named and no floor handed over. The Phaedo 94d Homer ruling controls: the quoted words are a step in the argument, not a new local turn owner. Greek: πάλαι γὰρ δὴ τὸ μηδὲν ἄγαν λεγόμενον καλῶς δοκεῖ λέγεσθαι· τῷ γὰρ ὄντι εὖ λέγεται.
- `turn_menexenus_0012`: Modal εἰπεῖν about a speech never given. No utterance exists to transmit. Greek: ἦ οἴει οἷός τ’ ἂν εἶναι αὐτὸς εἰπεῖν, εἰ δέοι καὶ ἕλοιτό σε ἡ βουλή;
- `turn_menexenus_0013`: Same modal εἰπεῖν; the turn's own speaker on his own capacity to speak. Greek: οὐδὲν θαυμαστὸν οἵῳ τ’ εἶναι εἰπεῖν
- `turn_menexenus_0016`: Asks what Socrates could say. No transmitted utterance. Greek: καὶ τί ἂν ἔχοις εἰπεῖν, εἰ δέοι σε λέγειν;
- `turn_menexenus_0022`: Imperatives addressed to the interlocutor. An instruction to speak transmits nothing. Greek: ἀλλ’ εἰπέ, καὶ πάνυ μοι χαριῇ, εἴτε Ἀσπασίας βούλει λέγειν εἴτε ὁτουοῦν· ἀλλὰ μόνον εἰπέ.

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. All 46 turn spans byte-verified, every turn read in full rather than sampled, and both boundaries of the one long embedded span are marked explicitly by the Greek — a naming formula with οὑτωσί at 236d and a genitive-of-authorship attribution at 249d — so the yes/no line does not rest on a judgment call. The ruling resolved the single question my first pass could not settle (cue-free turns wholly inside a quotation) in the direction I had provisionally taken, and excluded every remaining candidate site as indirect report, recap, or cited proverb. The residual uncertainty is record-level, not scope-level: the licensing ground for the fathers' exhortation and the unregistered status of both owners.
