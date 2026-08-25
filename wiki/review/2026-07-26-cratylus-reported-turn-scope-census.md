# cratylus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/cratylus.txt`, sha256 `8efd1736ad24fd8524fae3d0281f278bbfec921174ab8105d7c2bdf3333b5aca`
**Turn index**: `derived/plato/turns/cratylus.toon`, sha256 `8e51fac9d83c86996c4eb87f8c05e7f071c61524693b35167fd37b82dbcf571c`, 774 printed-siglum turn(s)
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

Candidate hits located and inspected: 590.
Turns with no cue and no quotation marker: 591.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

2 of 774 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_cratylus_0003` | ΕΡΜ. |
| `turn_cratylus_0528` | ΣΩ. |

The remaining 772 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_cratylus_0003`
- `turn_cratylus_0528`

## Ambiguous boundary decisions

- Ruling applied: turn_cratylus_0378 yes->no: personified ὁ νομοθέτης. Personification case — no by default; ὡσπερεὶ marks it as the current speaker's argumentative personification and the one-sentence address is not a bounded prosopopoeia comparable to the Laws in Crito.
- Ruling applied: turn_cratylus_0436 yes->no: Phaedo 88c self-quotation case. Socrates is a printed speaker, not a narrator; his quoted self-address (ἐπανερωτῶ … {q} τί οὖν ποτ’ ἔστιν, ὦ ἄριστε, δίκαιον … {/q}) stays inside his own turn. The other voices in this turn are indirect report throughout (ἔφη τις, φησιν), which the standard excludes.
- Ruling applied: turn_cratylus_0629 yes->no: Phaedo 94d ownership rationale. The greeting {q} χαῖρε, ὦ ξένε Ἀθηναῖε … {/q} is a counterfactual supposition used inside Socrates' argument about false naming, so Socrates owns the argumentative unit; and its εἴ τις speaker is not a voice that any record could name, even as unresolved.
- Ruling applied: turn_cratylus_0651 yes->no: same case as 0629. {q} τουτί ἐστι σὸν γράμμα, {/q} under a counterfactual προσελθόντα … εἰπεῖν, with no vocative and no owner.
- Ruling applied: turn_cratylus_0653 yes->no: same case as 0629, twice ({q} τουτί ἐστιν σὸν ὄνομα {/q}).
- `turn_cratylus_0528` → **yes**: Turns on the on-stage-recap case, and the case's own stated rationale does not hold here. Turn 0527 breaks off mid-sentence at an em-dash and does NOT contain these words, so there is no printed turn that already owns them and no duplication of the voice layer. What remains is the positive test met literally: a bounded {q} span of direct speech attributed to another owner by second-person λέγεις. Against: the words belong to an utterance act begun on stage in 0527, and a reviewer who reads the recap case by its holding rather than its rationale would call this no and empty it into ΣΩ. This is the one call in Cratylus I cannot settle from the Greek, because what is undecided is the scope of the ruling, not the text. Greek: ΕΡΜ. … εἰ δέ τίς σε ἔροιτο τοῦτο τὸ {q} ἰὸν {/q} καὶ τὸ {q} ῥέον {/q} καὶ τὸ {q} δοῦν, {/q} τίνα ἔχει ὀρθότητα ταῦτα τὰ ὀνόματα— /// ΣΩ. {q} τί ἂν αὐτῷ ἀποκριναίμεθα; {/q} λέγεις; ἦ γάρ;
- `turn_cratylus_0629` → **no**: Recorded because it is the strongest of the five flips and the ruling does not name the counterfactual-speaker case outright. It has what 0651/0653 lack — a sustained vocative address by someone other than the printed speaker, bounded by {q} and introduced by εἴποι — so a reviewer applying 'direct speech attributed to another owner is enough' literally would call it yes. Called no because the speaker is a supposition with no referent to record even as unresolved, and because the greeting exists only as a step in Socrates' argument, which is the Phaedo 94d ownership rationale. Greek: οἷον εἴ τις ἀπαντήσας σοι ἐπὶ ξενίας, λαβόμενος τῆς χειρὸς εἴποι· {q} χαῖρε, ὦ ξένε Ἀθηναῖε, ὑὲ Σμικρίωνος Ἑρμόγενες, {/q}

## Inspected cue hits that yield no reported turn

- `turn_cratylus_0378`: Personification case. ὡσπερεὶ ('as it were') stages this as Socrates' own argumentative personification of the lawgiver, and one imperative sentence is not the sustained floor-holding discourse the Laws-in-Crito exception requires. Flipped from the first pass. Greek: τοῦτον τὸν θεὸν ὡσπερεὶ ἐπιτάττει {408b} ἡμῖν ὁ νομοθέτης· {q} ὦ ἄνθρωποι, ὃς τὸ εἴρειν ἐμήσατο, δικαίως ἂν καλοῖτο ὑπὸ ὑμῶν εἰρέμης {/q}
- `turn_cratylus_0436`: Two separate exclusions. The only direct speech is Socrates' quoted self-address, and the repeated-chain exception is for a narrator reporting themselves inside their own narration, which Cratylus has none of. Everything the informants contribute (ἔφη τις, φησιν, ἐρωτᾷ, λέγει) is indirect report with no bounded direct speech. Flipped from the first pass. Greek: ἐπειδὰν δ’ ἠρέμα αὐτοὺς ἐπανερωτῶ … {q} τί οὖν ποτ’ ἔστιν, ὦ ἄριστε, δίκαιον, εἰ τοῦτο οὕτως ἔχει; {/q} … καὶ {q} Δία {/q} καλεῖν ἔφη τις … ὁ μὲν γὰρ τίς φησιν τοῦτο εἶναι δίκαιον, τὸν ἥλιον
- `turn_cratylus_0629`: Counterfactual supposition inside Socrates' argument that false naming is impossible. On the Phaedo 94d rationale Socrates owns the argumentative unit, and the εἴ τις speaker is not a voice: unlike the οἱ σοφοί case there is no real collective to record as unresolved. Flipped from the first pass; recorded under borderline as the closest of the three. Greek: οἷον εἴ τις ἀπαντήσας σοι ἐπὶ ξενίας, λαβόμενος τῆς χειρὸς εἴποι· {q} χαῖρε, ὦ ξένε Ἀθηναῖε, ὑὲ Σμικρίωνος Ἑρμόγενες, {/q}
- `turn_cratylus_0651`: Same as 0629 and weaker: no vocative, no address, a single illustrative clause serving Socrates' picture/name analogy. Flipped from the first pass. Greek: ἆρ’ οὐκ ἔστι προσελθόντα ἀνδρί τῳ εἰπεῖν ὅτι {q} τουτί ἐστι σὸν γράμμα, {/q}
- `turn_cratylus_0653`: Same as 0651, twice. Flipped from the first pass. Greek: πάλιν αὐτῷ τούτῳ προσελθόντα εἰπεῖν ὅτι {q} τουτί ἐστιν σὸν ὄνομα {/q} … ἆρ’ οὐκ ἂν εἴη αὐτῷ {431a} εἰπεῖν ὅτι {q} τουτί ἐστι σὸν ὄνομα, {/q}
- `turn_cratylus_0600`: Phaedo 94d case, and the dialogue's closest instance of it: Homeric lines that are themselves a character's vocative address to a named addressee. Cratylus adopts them as his own utterance to Socrates (λέγειν πρὸς σέ), so the quoted verse is used inside his argument and he owns the argumentative unit. Not a whole-turn quotation of the Ion 537a-b kind: the quoted lines are two lines inside a longer turn of Cratylus' own discourse. Greek: ὅτι μοί πως ἐπέρχεται λέγειν πρὸς σὲ τὸ τοῦ Ἀχιλλέως, ὃ ἐκεῖνος ἐν Λιταῖς πρὸς τὸν Αἴαντα λέγει. φησὶ δὲ {quote} Αἶαν διογενὲς Τελαμώνιε, κοίρανε λαῶν, πάντα τί μοι κατὰ θυμὸν ἐείσω μυθήσασθαι. {/quote}
- `turn_cratylus_0179`: Phaedo 94d case: Homeric verse cited as evidence for an etymology while Socrates keeps the floor. Greek: {q} ὃν Ξάνθον, {/q} φησί, {q} καλέουσι θεοί, ἄνδρες δὲ Σκάμανδρον; {/q}
- `turn_cratylus_0181`: Phaedo 94d case. Greek: περὶ τῆς ὄρνιθος ἣν λέγει ὅτι— {quote} χαλκίδα κικλῄσκουσι θεοί, ἄνδρες δὲ κύμινδιν, {/quote}
- `turn_cratylus_0195`: Phaedo 94d case. Greek: φησὶν γάρ— {392e} {quote} οἶος γάρ σφιν ἔρυτο πόλιν καὶ τείχεα μακρά. {/quote}
- `turn_cratylus_0246`: Phaedo 94d case: two Hesiod verses adduced inside Socrates' etymology of δαίμων. Greek: λέγει τοίνυν περὶ αὐτοῦ— {quote} αὐτὰρ ἐπειδὴ τοῦτο γένος κατὰ μοῖρ’ ἐκάλυψεν, {/quote} … {quote} οἱ μὲν δαίμονες ἁγνοὶ ὑποχθόνιοι καλέονται … {/quote}
- `turn_cratylus_0307`: Quoted dicta of a named authority used inside Socrates' argument. Quotation alone is not enough; Heraclitus takes no local floor. Greek: λέγει που Ἡράκλειτος ὅτι {q} πάντα χωρεῖ καὶ οὐδὲν μένει, {/q} … λέγει ὡς {q} δὶς ἐς τὸν αὐτὸν ποταμὸν οὐκ ἂν ἐμβαίης. {/q}
- `turn_cratylus_0309`: Phaedo 94d case. The Homer fragment is additionally absorbed into Socrates' own syntax. Greek: ὥσπερ αὖ Ὅμηρος {q} Ὠκεανόν τε θεῶν γένεσίν {/q} φησιν {q} καὶ μητέρα Τηθύν· {/q} … λέγει δέ που καὶ Ὀρφεὺς ὅτι {quote} Ὠκεανὸς πρῶτος καλλίρροος ἦρξε γάμοιο, {/quote}

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the exclusions, medium on turn_cratylus_0528. The scan's mechanical coverage is verified — span contiguity against the whole source, both elision marks, both ὅς accents, and a marker sweep that is exhaustive rather than cue-driven — so an unmarked reported turn is unlikely to have escaped. turn_cratylus_0003 is beyond argument under any reading of the ruling: Hermogenes narrates a pre-dialogue exchange that has no printed turn anywhere, transmits Cratylus' replies as bounded direct speech with ἦ δ’ ὅς twice, and the exchange is explicitly off-stage, so the recap exclusion does not touch it. turn_cratylus_0528 is a coin the ruling does not flip for me, and dropping it would leave the disposition required on a single turn rather than emptying it. Both required turns are listed under unregisteredOwnerTurns because derived/plato/voices/sigla.toml has no cratylus block at all — it registers only symposium, phaedo, euthydemus and protagoras — so neither ΚΡ. (the owner of the ἦ δ’ ὅς spans in 0003) nor ΕΡΜ. (the owner in 0528) is currently a registered voice siglum here, however plainly the source prints both as turn sigla. Note for the corpus reported-turn completion campaign: derived/plato/turns/sigla.toml registers cratylus as ΕΡΜ./ΚΡ./ΣΩ., and the provenance comment in the voices registry glosses ΚΡ. as Crito 'per crito/cratylus/timaeus', which is wrong for this dialogue — ΚΡ. here is Cratylus.
