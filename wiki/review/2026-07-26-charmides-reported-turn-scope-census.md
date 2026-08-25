# charmides: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/charmides.txt`, sha256 `cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218`
**Turn index**: `derived/plato/turns/charmides.toon`, sha256 `2342c951ccdff8e6f7a089eeeb274341cf417d71d06ac0a736eb372a8ff82c9b`, 1 printed-siglum turn(s)
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

Candidate hits located and inspected: 226.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 1 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_charmides_0001` | (none) |

The remaining 0 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_charmides_0001`

## Ambiguous boundary decisions

- None. No call in this dialogue turned on a boundary the standard leaves open.

## Inspected cue hits that yield no reported turn

- `turn_charmides_0001`: 161a. The source's only {quote} span. Homeric line used inside Socrates' own question, so Socrates owns the argumentative unit. Ruling case: Phaedo 94d Homer quotation — No. Greek: Ὁμήρῳ οὐ πιστεύεις καλῶς λέγειν, λέγοντι ὅτι {quote} αἰδὼς δ’ οὐκ ἀγαθὴ κεχρημένῳ ἀνδρὶ παρεῖναι; {/quote}
- `turn_charmides_0001`: 155d-155e. Cydias's verse in oblique infinitive inside the narrator's own reflection: quotation without direct speech, used as illustration. Ruling case: Phaedo 94d — No. Greek: ἐνόμισα σοφώτατον εἶναι τὸν Κυδίαν τὰ ἐρωτικά, ὃς εἶπεν ἐπὶ καλοῦ λέγων παιδός … εὐλαβεῖσθαι μὴ κατέναντα λέοντος νεβρὸν ἐλθόντα μοῖραν αἱρεῖσθαι κρεῶν
- `turn_charmides_0001`: 163b. ἔφη + accusative-and-infinitive: indirect report of Hesiod cited as authority by Critias, who keeps the floor. Ruling cases: Phaedo 94d and 'Φίληβος φησι + content' — No. Greek: ἔμαθον γὰρ παρ’ Ἡσιόδου, ὃς ἔφη ἔργον {del} δ’ {/del} οὐδὲν εἶναι ὄνειδος
- `turn_charmides_0001`: 164e-165a. Called yes in the first pass on the brief's tie-break; the ruling settles it as No. Critias personifies the Delphic god and the inscription, quoting one imperative word. It is his own argumentative personification, not a bounded prosopopoeia comparable to the Laws in Crito: the god never holds the floor with sustained discourse and Critias never yields it. Ruling case: personified ὁ λόγος — No by default. Greek: καὶ λέγει πρὸς τὸν ἀεὶ εἰσιόντα οὐκ ἄλλο τι ἢ Σωφρόνει, φησίν. αἰνιγματωδέστερον δὲ δή, ὡς μάντις, λέγει· τὸ γὰρ Γνῶθι σαυτόν καὶ τὸ Σωφρόνει ἔστιν μὲν ταὐτόν, ὡς τὰ γράμματά φησιν καὶ ἐγώ
- `turn_charmides_0001`: 165d, 165e. Called yes in the first pass; the ruling settles it as No. Both are counterfactual questions (ἔροιο, ἐρωτηθέντα) that Socrates stages inside his own argument. No utterance is transmitted and there is no owner to license; the {q} markers record quotation alone, which the ruling declares insufficient. Ruling case: personified/staged speaker — No by default. Greek: εἰ τοίνυν με, ἔφην, ἔροιο σύ· {q} ἰατρικὴ ὑγιεινοῦ ἐπιστήμη οὖσα τί ἡμῖν χρησίμη ἐστὶν καὶ τί ἀπεργάζεται, {/q} … ἔχειν εἰπεῖν ἐρωτηθέντα, {q} ὦ Κριτία, σωφροσύνη, ἐπιστήμη οὖσα ἑαυτοῦ, τί καλὸν ἡμῖν ἔργον ἀπεργάζεται καὶ ἄξιον τοῦ ὀνόματος; {/q}
- `turn_charmides_0001`: 156d-157a. Zalmoxis is reported inside the Thracian physician's speech by ὅτι plus optative and by accusative-and-infinitive throughout. Indirect report, so it opens no further level below the Thracian. Ruling case: 'Φίληβος φησι + content' — No. The Thracian's own direct speech at 157b is separately in scope. Greek: ἀλλὰ Ζάλμοξις, ἔφη, λέγει ὁ ἡμέτερος βασιλεύς, θεὸς ὤν, ὅτι … ἀδύνατον εἴη τὸ μέρος εὖ ἔχειν
- `turn_charmides_0001`: 162b, 165c, 165d, 164d, 163c. εἰπεῖν/φάναι as modal or complement infinitives governed by the current speaker's own verb. No direct speech and no licensed owner. Greek: ἔχεις εἰπεῖν; / ἐθέλω εἰπεῖν εἴτε ὁμολογῶ εἴτε μή / ἔχειν εἰπεῖν ἐρωτηθέντα / οὐκ ἂν αἰσχυνθείην μὴ οὐχὶ ὀρθῶς φάναι εἰρηκέναι / φάναι δέ γε χρὴ … ἡγεῖσθαι αὐτόν
- `turn_charmides_0001`: 158b, 162e, 161c. Statements about what someone says or said, with nothing transmitted. The three references are to Critias's and Charmides's own on-stage utterances, so they are also recaps under the ἔφησθα ruling and must not duplicate the voice layer. Greek: εἰ μέν σοι ἤδη πάρεστιν, ὡς λέγει Κριτίας ὅδε, σωφροσύνη / εἰ οὖν συγχωρεῖς τοῦτ’ εἶναι σωφροσύνην ὅπερ οὑτοσὶ λέγει / πάντως γὰρ οὐ τοῦτο σκεπτέον, ὅστις αὐτὸ εἶπεν
- `turn_charmides_0001`: 169d, 171b. First-person-plural recap of an agreement reached earlier on stage. Ruling case: ἔφησθα recapping an earlier on-stage turn — No. Greek: τοῦτο γὰρ δήπου ἔφαμεν εἶναι τὸ γιγνώσκειν αὑτόν / οὐδὲν γὰρ ἐπαΐει, ὡς ἔφαμεν, ὁ ἰατρός

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high — the ruling narrows what counts to bounded direct speech below the printed speaker, and this dialogue is nothing but that: 169 formulaic reporting cues over a whole-file narration with an empty printed sigla list, opening on a vocative second-person question owned by a named speaker. The disposition does not depend on any quotation, personification, or indirect-report case in the ruling; every such case here was decided No and the turn is still required.
