# statesman: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/statesman.txt`, sha256 `f31b15a667c9c31b5b2d1e138310af71f442dabc65d284348733dae467ef85e9`
**Turn index**: `derived/plato/turns/statesman.toon`, sha256 `3b6362e0b18d3d24fd62ae447033955bdaf69e79cf670cde6001d5ccde47ff2c`, 899 printed-siglum turn(s)
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

Candidate hits located and inspected: 250.
Turns with no cue and no quotation marker: 697.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

All 899 outer turns are explicit zero results. A reviewer exhausted the
Greek source and found no bounded stretch of direct speech transmitted below a
printed speaker. This is a reviewed finding, not an absence of files.

## Ambiguous boundary decisions

- Ruling applied: turn_statesman_0266 yes->no: indirect report, not direct speech. ὡς ἄρα + retained indicative reporting the content of τὰ πάλαι λεχθέντα, with no named subject and no speech verb governing it. Decided by the bare-φασί row and by 'not every remembered proposition'.
- Ruling applied: turn_statesman_0482 yes->no: indirect report, not direct speech. πολλοὶ τῶν κομψῶν λέγουσιν, ὡς ἄρα … — the οἱ σοφοί φασιν row: a named collective introducing oratio obliqua is 'usually no'; the ὡς clause transmits no bounded direct speech.
- Ruling applied: turn_statesman_0559 yes->no: bare φασί + accusative-and-infinitive with no named subject. Ruled No outright.
- Ruling applied: turn_statesman_0651 yes->no: bare φασί + accusative-and-infinitive with no named subject. Ruled No outright, notwithstanding that οἱ πολλοί are named two turns earlier as the λόγος's owners — the reported maxim is still acc.+inf., never direct speech.
- `turn_statesman_0482` → **no**: The only call in the dialogue that turns on a grammatical judgement rather than on an explicit ruling row, so it is recorded even though it does not change the disposition. Case: οἱ σοφοί φασιν, whose second sentence reopens the question if the collective introduces direct speech. Here it does not: ὡς + indicative is oratio obliqua, and the retained third-person present ἐστί is what indirect discourse after a primary tense normally keeps, not evidence of quotation. Were a reconciler to read the ὡς ἄρα clause as transmitted direct speech, this one turn would become required with owner unresolved (πολλοὶ τῶν κομψῶν is not a registered siglum, and statesman has no entry in derived/plato/voices/sigla.toml at all). I do not think it should. Greek: πολλοὶ τῶν κομψῶν λέγουσιν, ὡς ἄρα μετρητικὴ περὶ πάντ’ ἐστὶ τὰ γιγνόμενα

## Inspected cue hits that yield no reported turn

- `turn_statesman_0482`: Case: οἱ σοφοί φασιν. A described collective (πολλοὶ τῶν κομψῶν) is the explicit subject of λέγουσιν, but what follows is ὡς + finite indicative — oratio obliqua. The ὡς is itself the mark of indirectness; direct speech would carry none. No bounded direct speech, so no nested turn, and nothing to record as unresolved. Greek: ὃ γὰρ ἐνίοτε, ὦ Σώκρατες, οἰόμενοι δή τι σοφὸν φράζειν πολλοὶ τῶν κομψῶν λέγουσιν, ὡς ἄρα μετρητικὴ περὶ πάντ’ ἐστὶ τὰ γιγνόμενα, τοῦτ’ αὐτὸ τὸ νῦν λεχθὲν ὂν τυγχάνει.
- `turn_statesman_0651`: Case: bare φασί + accusative-and-infinitive with no named subject. The strongest indirect report in the dialogue — a full maxim whose owners the text names two turns earlier as οἱ πολλοί (λόγον τὸν παρὰ τῶν πολλῶν λεγόμενον, 296a) — and it still fails, because naming the owner of a report does not convert acc.+inf. into transmitted direct speech. Greek: καὶ μὴν εὐπρεπής. φασὶ γὰρ δὴ δεῖν, εἴ τις γιγνώσκει παρὰ τοὺς τῶν ἔμπροσθεν βελτίους νόμους, νομοθετεῖν τὴν ἑαυτοῦ πόλιν ἕκαστον πείσαντα, ἄλλως δὲ μή.
- `turn_statesman_0266`: A remembered proposition from τὰ πάλαι λεχθέντα, reported with ὡς ἄρα and governed by no speech verb at all. Neither direct speech nor a licensed owner. Greek: οὐδαμῶς, ἀλλὰ τὸ περὶ τῆς μεταβολῆς δύσεώς τε καὶ ἀνατολῆς ἡλίου καὶ τῶν ἄλλων ἄστρων, ὡς ἄρα ὅθεν μὲν ἀνατέλλει νῦν εἰς τοῦτον τότε τὸν τόπον ἐδύετο … μετέβαλεν αὐτὸ ἐπὶ τὸ νῦν σχῆμα.
- `turn_statesman_0559`: Bare φασίν + accusative-and-infinitive, subject only deictically located (τῇδε, παρ’ ὑμῖν). Ruled No outright. Greek: τῷ γὰρ λαχόντι βασιλεῖ φασιν τῇδε τὰ σεμνότατα καὶ μάλιστα πάτρια τῶν ἀρχαίων θυσιῶν ἀποδεδόσθαι.
- `turn_statesman_0619`: Case: personified ὁ λόγος / prosopopoeia. Statesman's only candidate for a Laws-in-Crito staging, and it fails the test the ruling sets: the law is likened to a stubborn ignorant man but never holds the floor. It issues no address and speaks no line; the Stranger describes it throughout in the third person. Greek: τὸν δέ γε νόμον ὁρῶμεν … ὥσπερ τινὰ ἄνθρωπον αὐθάδη καὶ ἀμαθῆ καὶ μηδένα μηδὲν ἐῶντα ποιεῖν παρὰ τὴν ἑαυτοῦ τάξιν, μηδ’ ἐπερωτᾶν μηδένα (294b-294c)
- `turn_statesman_0684`: The 298a-299d imagined-assembly scenario, its statute and the statute's rationale, is one continuous accusative-and-infinitive hanging on the Stranger's own βουλευσαίμεθα … βουλήν τινα / δεήσει θέσθαι νόμον. Hypothetical indirect construction, no floor handed over; the turn ends with the Stranger addressing his interlocutor directly (ὡς λέγομεν, ὦ Σώκρατες, 299d). Greek: καὶ τοίνυν ἔτι δεήσει θέσθαι νόμον ἐπὶ πᾶσι τούτοις … οὐδὲν γὰρ δεῖν τῶν νόμων εἶναι σοφώτερον· οὐδένα γὰρ ἀγνοεῖν τό τε ἰατρικὸν καὶ τὸ ὑγιεινόν … (299b-299d)
- `turn_statesman_0264`: Mentions a tale without transmitting it; the content is only the relative pronoun ὅ. Fails under both the first-pass standard and this ruling. Greek: ἀκήκοας γάρ που καὶ ἀπομνημονεύεις ὅ φασι γενέσθαι τότε.
- `turn_statesman_0557`: Parenthetical citation of an authority inside the Stranger's own indicative sentence. Case: personified 'says' — the current speaker's argumentative personification, no bounded prosopopoeia. Greek: καὶ μὴν καὶ τὸ τῶν ἱερέων αὖ γένος, ὡς τὸ νόμιμόν φησι, παρὰ μὲν ἡμῶν δωρεὰς θεοῖς … ἐπιστῆμόν ἐστι …
- `turn_statesman_0152`: The dialogue's only proverb. It is referred to, not quoted: the content is given as the Stranger's own infinitive paraphrase across a turn boundary, with no quoted wording. Not the Ion 537a / Sophist 237a shape. Greek: πεποίηκε γὰρ ἡμᾶς καὶ νῦν παθεῖν τὸ κατὰ τὴν παροιμίαν πάθος. … οὐχ ἡσύχους εὖ διαιροῦντας ἠνυκέναι βραδύτερον. (264b)
- `(bulk class)`: Impersonal passive hearsay markers: no direct speech, no named subject, no licensed owner. Refused in the first pass and refused again here. Greek: λέγεται γὰρ οὖν δὴ καὶ τοῦτο / λέγεται γὰρ οὖν δὴ ταῦτα οὕτω γίγνεσθαι / τά γε τῆς ἀρετῆς μόρια λέγεταί που φίλια / παίγνιόν πού τι λέγεται / οἷα δὴ καὶ τὰ νῦν περὶ αὐτῶν λέγονται
- `(bulk class)`: Case: ἔφησθα 'you said X', recapping an earlier on-stage turn. The great majority of the 250 cue hits are the two live interlocutors reporting what one of them said earlier in this same dialogue. Those utterances already have their own printed turns; a recap must not duplicate the voice layer. Also covers first-person-plural resolutions about what 'we shall say' and the naming formulas (προσαγορεύειν, ὀνομάζειν, καλεῖν, κληθέν), which report what something is named, not what anybody said. Greek: πῶς λέγεις; / καλῶς εἶπες / ὅθεν ἐρωτηθεὶς σὺ … εἶπες μάλα προθύμως δύ’ εἶναι ζῴων γένη (263c) / ἔφαμεν / φήσομεν / φαμέν / φάθι / ταῦτα ἐρρήθη / εἴρηκας / τὰ νυνδὴ ῥηθέντα

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The scan is provably complete over every turn, the ruling names the exact shape of all four withdrawn positives, and the broadening direction was re-tested against the source rather than reasoned about: there is no direct speech in this dialogue to transmit. The residual risk is confined to the single borderline entry, and flipping it would make the list one turn long with an unresolved owner, not change the character of the result.
