# crito: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/crito.txt`, sha256 `fc1eaadbd89edd53c9ad97c51b0c568346338869f26aa2e322ff86d54b42e28a`
**Turn index**: `derived/plato/turns/crito.toon`, sha256 `1707ebca9073f0a0350ddc8a3da53418552ee499f17506241327cb17f132c282`, 102 printed-siglum turn(s)
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

Candidate hits located and inspected: 37.
Turns with no cue and no quotation marker: 89.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

10 of 102 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_crito_0023` | ΣΩ. |
| `turn_crito_0062` | ΣΩ. |
| `turn_crito_0090` | ΣΩ. |
| `turn_crito_0092` | ΣΩ. |
| `turn_crito_0093` | ΣΩ. |
| `turn_crito_0095` | ΣΩ. |
| `turn_crito_0096` | ΣΩ. |
| `turn_crito_0098` | ΣΩ. |
| `turn_crito_0099` | ΣΩ. |
| `turn_crito_0100` | ΣΩ. |

The remaining 92 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_crito_0023`
- `turn_crito_0062`
- `turn_crito_0090`
- `turn_crito_0092`
- `turn_crito_0093`
- `turn_crito_0095`
- `turn_crito_0096`
- `turn_crito_0098`
- `turn_crito_0099`
- `turn_crito_0100`

## Ambiguous boundary decisions

- `turn_crito_0023` → **yes**: Turns on Phaedo 94d versus Sophist 237a. It is NOT the 94d case: Socrates is not deploying a Homeric verse inside his own argument. εἰπεῖν takes the accusative subject γυνή, the {q} span opens with the woman's own vocative ὦ Σώκρατες OUTSIDE the {quote}, and the verse is what she says to him — so the text attributes the quoted words to another speaker, which the Sophist 237a row rules `yes`. The utterance is also off-stage with no printed turn anywhere, which the ἔφησθα row expressly does not exclude. Residual uncertainty: the dialogue's only {quote} marker sits inside this span, so a reader weighting the markup over the syntax could read it as citation. Greek: ἐδόκει τίς μοι γυνὴ προσελθοῦσα καλὴ καὶ εὐειδής, {44b} λευκὰ ἱμάτια ἔχουσα, καλέσαι με καὶ εἰπεῖν· {q} ὦ Σώκρατες, {quote} ἤματί κεν τριτάτῳ Φθίην ἐρίβωλον ἵκοιο. {/quote} {/q}
- `turn_crito_0062` → **yes**: Turns on the 'οἱ σοφοί φασιν' row, which is 'usually no' but rules `yes` with an unresolved owner when the formula introduces actual direct speech by an unregistered party. It does here: a parenthetical φαίη γ’ ἄν τις straddles a complete sentence in {q} markers with its own main verb and the objector's deixis (ἡμᾶς, from the objector's side, against Socrates' own ἡμῖν two clauses earlier). Potentiality is not disqualifying — the Laws' whole speech is equally potential (ἔροιντο, ἂν εἴπωσιν, φαῖεν ἄν). Residual uncertainty: it is one sentence by an indefinite τις, so it does not meet the 'sustained discourse' language the ruling attaches to prosopopoeia; I applied the collective-direct-speech row instead, since τις is a hypothetical human objector, not a personification. Greek: {q} ἀλλὰ μὲν δή, {/q} φαίη γ’ ἄν τις, {q} οἷοί τέ εἰσιν ἡμᾶς οἱ πολλοὶ ἀποκτεινύναι. {/q}
- `turn_crito_0093` → **yes**: Carries no introducing formula of its own — the turn index cuts the Laws' single speech at {p}/Stephanus boundaries, so this is a continuation from 0092. Held `yes` on three in-turn grounds: the opening {q}, second-person address to Socrates with ἡμεῖς = the Laws (ἡμᾶς τοὺς νόμους καὶ τὴν πατρίδα, 51a), and Socrates' own closing identification ἀληθῆ λέγειν τοὺς νόμους. The same continuation reasoning licenses 0099 and 0100; 0098 additionally carries ἂν φαῖεν. Greek: ΣΩ. {q} ἢ πρὸς μὲν ἄρα σοι τὸν πατέρα οὐκ ἐξ ἴσου ἦν τὸ δίκαιον … {/q} … τί φήσομεν πρὸς ταῦτα, ὦ Κρίτων; ἀληθῆ λέγειν τοὺς νόμους ἢ οὔ;

## Inspected cue hits that yield no reported turn

- `turn_crito_0016`: Off-stage report by ἥκοντές τινες ἀπὸ Σουνίου, so the ruling's off-stage carve-out on the ἔφησθα row is live — but nothing is transmitted. ἐξ ὧν ἀπαγγέλλουσιν is a bare relative with no content clause of its own, and the following ὅτι ἥξει τήμερον hangs on Crito's own δῆλον οὖν ἐκ τούτων. No direct speech, no {q}. Greek: δοκεῖν μέν μοι ἥξει τήμερον ἐξ ὧν ἀπαγγέλλουσιν ἥκοντές τινες ἀπὸ Σουνίου
- `turn_crito_0020`: Bare φασί with a collective subject and no transmitted content at all. Ruling rows 'οἱ σοφοί φασιν' and 'bare φασί': indirect report, no nested turn. Greek: φασί γέ τοι δὴ οἱ τούτων κύριοι.
- `turn_crito_0030`: Second-person imperative addressed by Crito to Socrates in his own turn. Not a reporting formula. Greek: τάδε δέ, ὦ Σώκρατες, εἰπέ μοι.
- `turn_crito_0033`: Named explicitly because the ruling's ἔφησθα row exempts off-stage utterances, and this one IS off-stage (the trial, no printed turn in crito). It still fails the standard: the ὅτι-clause is in oblique optative with no deictic shift and no quotation marker, so it is indirect report, not bounded direct speech. Greek: μήτε, ὃ ἔλεγες ἐν τῷ δικαστηρίῳ, δυσχερές σοι γενέσθω ὅτι οὐκ ἂν ἔχοις ἐξελθὼν ὅτι χρῷο σαυτῷ
- `turn_crito_0035`: Ruling row 'οἱ σοφοί φασιν' / remembered proposition. Passive reporting verb plus agent plus a ὅτι-clause in oblique optative: indirect report of a maxim, no floor handoff. Was borderline in the first pass; the ruling settles it as `no`. Greek: ἐλέγετο δέ πως … ὑπὸ τῶν οἰομένων τὶ λέγειν … ὅτι τῶν δοξῶν … δέοι τὰς μὲν περὶ πολλοῦ ποιεῖσθαι, τὰς δὲ μή.
- `turn_crito_0062`: Statement ABOUT speech with nothing transmitted — the accepted Phaedo τί … εἶπεν ὁ ἀνήρ shape. The turn is `yes` on a separate, genuine hit. Greek: πάνυ ἡμῖν οὕτω φροντιστέον τί ἐροῦσιν οἱ πολλοὶ ἡμᾶς
- `turn_crito_0063`: Crito asserts that such a person would say it. No utterance transmitted; the floor never leaves Crito. Greek: δῆλα δὴ καὶ ταῦτα· φαίη γὰρ ἄν, ὦ Σώκρατες. ἀληθῆ λέγεις.
- `turn_crito_0068`: Argumentative recap of the pair's own on-stage exchange. Ruling row ἔφησθα: the original printed turns already own that speech. Greek: ὅπερ νυνδὴ ἐλέγομεν
- `turn_crito_0072`: Recap of prior agreement plus a bare φασί with a collective subject. Both ruled `no`. Greek: ὡς πολλάκις ἡμῖν καὶ ἐν τῷ ἔμπροσθεν χρόνῳ ὡμολογήθη … ὥσπερ τότε ἐλέγετο ἡμῖν · εἴτε φασὶν οἱ πολλοὶ εἴτε μή
- `turn_crito_0080`: Ruling row 'οἱ σοφοί φασιν': a parenthetical indirect ascription of a doctrine to a collective. The surrounding words are Socrates' own question. Was borderline in the first pass; the ruling settles it as `no`. Same treatment for turn_crito_0076 (ὡς οἱ πολλοὶ οἴονται — belief, not speech). Greek: ἀντικακουργεῖν κακῶς πάσχοντα, ὡς οἱ πολλοί φασιν, δίκαιον ἢ οὐ δίκαιον;
- `turn_crito_0090`: States that much COULD be said and gives no utterance. Distinct from the φαίη γ’ ἄν τις case at 0062, which does transmit direct speech. Greek: πολλὰ γὰρ ἄν τις ἔχοι, ἄλλως τε καὶ ῥήτωρ, εἰπεῖν ὑπὲρ τούτου τοῦ νόμου ἀπολλυμένου
- `turn_crito_0090`: Direct speech in {q} markers, but its speaker is the first-person-plural ἡμεῖς of the printed speaker (Socrates, with Crito). Ruling row 'Phaedo 88c, quoted self-address': stays inside the printed speaker's own turn. Greek: ἢ ἐροῦμεν πρὸς αὐτοὺς ὅτι {q} ἠδίκει γὰρ ἡμᾶς ἡ πόλις καὶ οὐκ ὀρθῶς τὴν δίκην ἔκρινεν; {/q}

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high, because the whole source was read rather than sampled, the ruling names this dialogue's Laws as its own benchmark for a qualifying bounded prosopopoeia, and every `yes` is independently corroborated by explicit machinery — ἐλθόντες οἱ νόμοι … ἔροιντο (50a), τί οὖν ἂν εἴπωσιν οἱ νόμοι (50c), φαῖεν ἂν ἴσως οἱ νόμοι (51c), φαῖεν γὰρ ἄν (52a), ἂν φαῖεν (52d), the Laws' self-identification ἡμεῖς οἱ νόμοι (53a), Socrates naming them at ἀληθῆ λέγειν τοὺς νόμους (51c), καλέσαι με καὶ εἰπεῖν with accusative γυνή (44b), and φαίη γ’ ἄν τις (48a). The one call a reconciler could reasonably move is turn_crito_0062, the single-sentence objector, which is the shortest span admitted.
