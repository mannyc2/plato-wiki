# greater-hippias: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/greater-hippias.txt`, sha256 `ccda6820c403e75c99d26a990c1c993a5f25d2ff5a2da6cef872ce204e9666b4`
**Turn index**: `derived/plato/turns/greater-hippias.toon`, sha256 `6809ef43af975ec38dec56b5468c179848f232f5255d68dcbceda001ead5fd5d`, 357 printed-siglum turn(s)
**Disposition**: `required` — 46 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 424.
Turns with no cue and no quotation marker: 190.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

46 of 357 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_greater-hippias_0077` | ΣΩ. |
| `turn_greater-hippias_0083` | ΣΩ. |
| `turn_greater-hippias_0085` | ΣΩ. |
| `turn_greater-hippias_0087` | ΣΩ. |
| `turn_greater-hippias_0089` | ΣΩ. |
| `turn_greater-hippias_0091` | ΣΩ. |
| `turn_greater-hippias_0093` | ΣΩ. |
| `turn_greater-hippias_0095` | ΣΩ. |
| `turn_greater-hippias_0105` | ΣΩ. |
| `turn_greater-hippias_0109` | ΣΩ. |
| `turn_greater-hippias_0111` | ΣΩ. |
| `turn_greater-hippias_0113` | ΣΩ. |
| `turn_greater-hippias_0117` | ΣΩ. |
| `turn_greater-hippias_0121` | ΣΩ. |
| `turn_greater-hippias_0123` | ΣΩ. |
| `turn_greater-hippias_0125` | ΣΩ. |
| `turn_greater-hippias_0129` | ΣΩ. |
| `turn_greater-hippias_0131` | ΣΩ. |
| `turn_greater-hippias_0133` | ΣΩ. |
| `turn_greater-hippias_0135` | ΣΩ. |
| `turn_greater-hippias_0137` | ΣΩ. |
| `turn_greater-hippias_0139` | ΣΩ. |
| `turn_greater-hippias_0145` | ΣΩ. |
| `turn_greater-hippias_0167` | ΣΩ. |
| `turn_greater-hippias_0169` | ΣΩ. |
| `turn_greater-hippias_0171` | ΣΩ. |
| `turn_greater-hippias_0173` | ΣΩ. |
| `turn_greater-hippias_0177` | ΣΩ. |
| `turn_greater-hippias_0179` | ΣΩ. |
| `turn_greater-hippias_0181` | ΣΩ. |
| `turn_greater-hippias_0183` | ΣΩ. |
| `turn_greater-hippias_0185` | ΣΩ. |
| `turn_greater-hippias_0187` | ΣΩ. |
| `turn_greater-hippias_0281` | ΣΩ. |
| `turn_greater-hippias_0283` | ΣΩ. |
| `turn_greater-hippias_0285` | ΣΩ. |
| `turn_greater-hippias_0287` | ΣΩ. |
| `turn_greater-hippias_0289` | ΣΩ. |
| `turn_greater-hippias_0291` | ΣΩ. |
| `turn_greater-hippias_0293` | ΣΩ. |
| `turn_greater-hippias_0295` | ΣΩ. |
| `turn_greater-hippias_0297` | ΣΩ. |
| `turn_greater-hippias_0351` | ΣΩ. |
| `turn_greater-hippias_0353` | ΣΩ. |
| `turn_greater-hippias_0355` | ΣΩ. |
| `turn_greater-hippias_0357` | ΣΩ. |

The remaining 311 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_greater-hippias_0077`
- `turn_greater-hippias_0083`
- `turn_greater-hippias_0085`
- `turn_greater-hippias_0087`
- `turn_greater-hippias_0089`
- `turn_greater-hippias_0091`
- `turn_greater-hippias_0093`
- `turn_greater-hippias_0095`
- `turn_greater-hippias_0105`
- `turn_greater-hippias_0109`
- `turn_greater-hippias_0111`
- `turn_greater-hippias_0113`
- `turn_greater-hippias_0117`
- `turn_greater-hippias_0121`
- `turn_greater-hippias_0123`
- `turn_greater-hippias_0125`
- `turn_greater-hippias_0129`
- `turn_greater-hippias_0131`
- `turn_greater-hippias_0133`
- `turn_greater-hippias_0135`
- `turn_greater-hippias_0137`
- `turn_greater-hippias_0139`
- `turn_greater-hippias_0145`
- `turn_greater-hippias_0167`
- `turn_greater-hippias_0169`
- `turn_greater-hippias_0171`
- `turn_greater-hippias_0173`
- `turn_greater-hippias_0177`
- `turn_greater-hippias_0179`
- `turn_greater-hippias_0181`
- `turn_greater-hippias_0183`
- `turn_greater-hippias_0185`
- `turn_greater-hippias_0187`
- `turn_greater-hippias_0281`
- `turn_greater-hippias_0283`
- `turn_greater-hippias_0285`
- `turn_greater-hippias_0287`
- `turn_greater-hippias_0289`
- `turn_greater-hippias_0291`
- `turn_greater-hippias_0293`
- `turn_greater-hippias_0295`
- `turn_greater-hippias_0297`
- `turn_greater-hippias_0351`
- `turn_greater-hippias_0353`
- `turn_greater-hippias_0355`
- `turn_greater-hippias_0357`

## Ambiguous boundary decisions

- Ruling applied: turn_greater-hippias_0076 yes->no: `Φίληβος φησι` + content row (indirect report, not direct speech) AND personified `ὁ λόγος` row. `λέγει ὁ λόγος ὅτι Νεοπτόλεμος Νέστορα ἔροιτο ποῖά ἐστι καλὰ ἐπιτηδεύματα` is an indirect question under a personified speaking λόγος, and `λέγων ἐστὶν ὁ Νέστωρ … ὑποτιθέμενος αὐτῷ πάμπολλα νόμιμα καὶ πάγκαλα` only describes Nestor's discourse. No bounded direct speech anywhere in the turn, and no {q}.
- Ruling applied: turn_greater-hippias_0119 yes->no: three spans, each closed by a different row. The {q} Heraclitean verse falls to the Phaedo 94d row (quoted inside Socrates' own argument). `ὥς φησιν Ἱππίας ὁ σοφός` is indirect report AND an `ἔφησθα` recap of Hippias's on-stage turn 0118. `τάδε· ὦ ἄνθρωπε, ἀγνοεῖς ὅτι …` is bounded direct speech but `χρὴ ἀντιλέγειν` attributes it to nobody, so it is the printed speaker's own projected reply.
- `turn_greater-hippias_0095` → **yes**: Class question standing for 44 of the 46 required turns, and the one thing the ruling's case table does not have a row for. The interrogator's speech is overwhelmingly FUTURE-projected (`φήσει` 28x, `ἐρεῖ` 7x, plus `φαίη`, `εἴποι ἄν`, `ἐρήσεταί με`, `ἔροιτο`) rather than reported as having occurred. Called `yes` because the ruling's standard requires bounded direct speech licensed by Greek speech machinery and says nothing about tense: `φήσει` is a third-person reporting verb with an identified subject, and every span it introduces is bounded by {q} and is direct (second-person address, vocatives `ὦ Σώκρατες` / `ὦ βέλτιστε σύ` / `ὦ σοφὲ σύ`, imperatives `ἀποκρίνου`). The owner is also not a hypothesis: turn 0077 reports him in the past with `ἔφη` and a real occasion (`ἔναγχός … τις εἰς ἀπορίαν με κατέβαλεν`), and turn 0357 reports him habitually with `φησίν` as a named-by-description relative living in the same house. If the reconciler rules that only past-transmitted speech qualifies, the list collapses to 0077 and 0357. Greek: {q} εἰπὲ δή, ὦ ξένε, {/q} φήσει, {q} τί ἐστι τοῦτο τὸ καλόν; {/q}
- `turn_greater-hippias_0085` → **yes**: Ten required turns (0085, 0087, 0089, 0091, 0093, 0135, 0179, 0181, 0183, 0295) are a {q} span with no third-person attribution cue anywhere inside the turn. They fall under the whole-turn-quotation row (Ion 537a-b) and are `yes` because the text attributes them explicitly, just not turn-locally: turn 0083 hands the floor over (`φέρε ὅτι μάλιστα ἐκεῖνος γενόμενος πειρῶμαί σε ἐρωτᾶν … ἀπόκριναι δή, ὦ Ἱππία, ὡς ἐκείνου ἐρωτῶντος`), turn 0297 renews it (`ἀποκρίνου ἐμοὶ ὡς ἐκείνῳ`), and each run is flanked by `φήσει`/`ἐρεῖ` turns. What remains uncertain is only whether out-of-turn attribution satisfies 'the text attributes the quoted words to another speaker'. A turn-local cue test would drop all ten. Greek: ΣΩ. {q} οὐκοῦν ἔστι τι τοῦτο, ἡ δικαιοσύνη; {/q}
- `turn_greater-hippias_0119` → **no**: Retained as borderline because it flipped and is the closest call in the dialogue. `τάδε· ὦ ἄνθρωπε, ἀγνοεῖς …` is genuinely bounded direct speech addressed to the man, which the standard's first clause admits; it is ruled `no` only because `χρὴ ἀντιλέγειν` is impersonal, so the Greek attributes the utterance to no owner below the printed speaker, and because Socrates introduces it as his own act of replying. Reading `μανθάνω … ὡς ἄρα χρή` as Socrates voicing Hippias's answer would make it `yes` with owner ΙΠ., which is the one registered siglum that could own it. Greek: μανθάνω, ὦ Ἱππία, ὡς ἄρα χρὴ ἀντιλέγειν πρὸς τὸν ταῦτα ἐρωτῶντα τάδε· ὦ ἄνθρωπε, ἀγνοεῖς ὅτι … ὥς φησιν Ἱππίας ὁ σοφός.

## Inspected cue hits that yield no reported turn

- `turn_greater-hippias_0076`: Personified `ὁ λόγος` 'says' + indirect question; Nestor's discourse is described, never transmitted. Two ruling rows, no direct speech. Flipped from the first pass. Greek: ἐπειδὴ ἡ Τροία ἥλω, λέγει ὁ λόγος ὅτι Νεοπτόλεμος {286b} Νέστορα ἔροιτο ποῖά ἐστι καλὰ ἐπιτηδεύματα … μετὰ ταῦτα δὴ λέγων ἐστὶν ὁ Νέστωρ καὶ ὑποτιθέμενος αὐτῷ πάμπολλα νόμιμα καὶ πάγκαλα.
- `turn_greater-hippias_0119`: Phaedo 94d row for the verse; indirect report + on-stage recap for `ὥς φησιν Ἱππίας`; unattributed own-voice direct speech for `τάδε· ὦ ἄνθρωπε …`. Flipped from the first pass. Greek: μανθάνω, ὦ Ἱππία, ὡς ἄρα χρὴ ἀντιλέγειν πρὸς τὸν ταῦτα ἐρωτῶντα τάδε· ὦ ἄνθρωπε, ἀγνοεῖς ὅτι τὸ τοῦ Ἡρακλείτου εὖ ἔχει, ὡς ἄρα {q} πιθήκων ὁ κάλλιστος αἰσχρὸς ἀνθρώπων γένει συμβάλλειν, {/q} … ὥς φησιν Ἱππίας ὁ σοφός.
- `turn_greater-hippias_0121`: Heraclitean verse used inside the argument — Phaedo 94d row. The turn is `yes` on its other span, `φήσει· {q} τί δέ, ὦ Σώκρατες; … {/q}`. Greek: ἢ οὐ καὶ Ἡράκλειτος αὐτὸ τοῦτο λέγει, ὃν σὺ ἐπάγῃ, ὅτι {q} ἀνθρώπων ὁ σοφώτατος πρὸς θεὸν πίθηκος φανεῖται … {/q}
- `turn_greater-hippias_0357`: Proverb quoted inside Socrates' own closing sentence — Phaedo 94d row. The turn is `yes` on `{q} καίτοι πῶς σὺ εἴσῃ, {/q} φησίν, {q} … {/q}`. Greek: τὴν γὰρ παροιμίαν ὅτι ποτὲ λέγει, τὸ {q} χαλεπὰ τὰ καλά, {/q} δοκῶ μοι εἰδέναι.
- `turn_greater-hippias_0311`: Bare `φασί` with a collective subject and no direct speech — the `οἱ σοφοί φασιν` and bare-`φασί` rows both give no. Greek: οὐχ οἷα βούλεταί τις, φασὶν ἄνθρωποι ἑκάστοτε παροιμιαζόμενοι, ἀλλ’ οἷα δύναται
- `turn_greater-hippias_0007`: `φασίν` + role subject + accusative-and-infinitive. Indirect report, no direct speech — `οἱ σοφοί φασιν` row. Greek: ὥσπερ καὶ τὸν Δαίδαλόν φασιν οἱ ἀνδριαντοποιοί, νῦν εἰ γενόμενος τοιαῦτ’ ἐργάζοιτο … καταγέλαστον ἂν εἶναι.
- `turn_greater-hippias_0011`: Bare `φασί` + accusative-and-infinitive with no named subject — explicit `no` row. Greek: τοὐναντίον γὰρ Ἀναξαγόρᾳ φασὶ συμβῆναι ἢ ὑμῖν … λέγουσι δὲ καὶ περὶ ἄλλων τῶν παλαιῶν ἕτερα τοιαῦτα.
- `turn_greater-hippias_0271`: Bounded direct speech (`ὅτι` recitativum + vocative), but first-person-plural: the utterance is the printed speaker's own projected reply, not transmitted below him. The source marks the man's utterances with {q} and pointedly does not mark this one. Greek: ὥστ’ εἰ ἀποκριναίμεθα τῷ θρασεῖ ἐκείνῳ ἀνθρώπῳ ὅτι ὦ γενναῖε, τὸ καλόν ἐστι τὸ δι’ ἀκοῆς τε καὶ δι’ ὄψεως ἡδύ
- `turn_greater-hippias_0167`: `Ἱππίας ἔφη` + accusative-and-infinitive recapping Hippias's on-stage turn 0154 — the `ἔφησθα` recap row. The turn is `yes` on the man's two `φήσει` + {q} spans. Greek: ἀλλὰ μέντοι τόδε τὸ {292e} καλὸν εἶναι Ἱππίας ἔφη· καίτοι ἐγὼ αὐτὸν ἠρώτων οὕτως ὥσπερ σὺ ἐμέ
- `turn_greater-hippias_0173`: Correction to the first pass, which read this as depth-3 geometry. The inner `ὁ ξένος ὁ Ἠλεῖος ἔφη` + accusative-and-infinitive is indirect report AND a recap of Hippias's on-stage turn 0154, so it opens no further nested turn. The turn is `yes` at depth 2 only, on the man's own direct speech. The same correction applies at 0187 (`ἡνίκ’ ἔφαμεν …` inside the man's speech). Greek: {q} ἦ καὶ τῷ Ἀχιλλεῖ, {/q} φήσει, {q} ὁ ξένος ὁ Ἠλεῖος ἔφη καλὸν εἶναι ὑστέρῳ τῶν προγόνων ταφῆναι … {/q}
- `turn_greater-hippias_0283`: A {q} span owned by the printed speaker himself. Recorded because it shows {q} is not a per-span proxy for 'another owner' in this source, only a per-turn one. The turn is `yes` on the man's `φήσει` and `ἂν ἴσως φαίη` spans. Greek: ἐροῦμεν δὴ οἶμαι ὅπερ ὑπεθέμεθα, ὅτι {q} τοῦθ’ ἡμεῖς γέ φαμεν τὸ μέρος τοῦ ἡδέος … ἤ τι καὶ ἄλλο ἐροῦμεν, ὦ Ἱππία; {/q}
- `turn_greater-hippias_0096`: A question about the man's question; no direct speech. Same at 0101 (`ἐρωτᾷ γάρ σε οὐ τί ἐστι καλόν, ἀλλ’ ὅτι ἐστὶ τὸ καλόν`), 0107, 0115. Greek: ἄλλο τι οὖν, ὦ Σώκρατες, ὁ τοῦτο ἐρωτῶν δεῖται πυθέσθαι τί ἐστι καλόν;

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the 46-turn list as a set, medium on its size. High because the source itself draws the boundary: 46 of 46 required turns carry {q}, the interrogator is named as the subject of a reporting verb in 36 of them, and the two flips are each closed by two independent ruling rows. Medium on size because of the first borderline entry: the ruling's case table has no row for future-projected direct speech, and 44 of the 46 turns rest on `φήσει`/`ἐρεῖ` rather than on a past transmission. If projected speech does not count, the correct answer is 2 (0077, 0357); if out-of-turn attribution does not count, subtract the 10 bare-{q} turns to get 36. Both alternatives are named turn-by-turn above so the reconciler can apply either without re-reading the Greek. Residual risk of a missed reported utterance is low: the final sweep was stem-based over every Greek token in the file, and a separate sweep for direct-speech introducers outside {q} returned nothing new.
