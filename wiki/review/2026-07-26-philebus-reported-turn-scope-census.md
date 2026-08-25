# philebus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/philebus.txt`, sha256 `8973a4d14e3967d651f18b18ae6fb5ca00f938b464bf8e3a47a1d66b2ade3807`
**Turn index**: `derived/plato/turns/philebus.toon`, sha256 `848bc6c8fbbd31a57d1b35434537a16ab08d19caa50c79ca9d6d3159e8419fba`, 1142 printed-siglum turn(s)
**Disposition**: `required` — 5 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 248.
Turns with no cue and no quotation marker: 966.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

5 of 1142 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_philebus_0540` | ΣΩ. |
| `turn_philebus_1070` | ΣΩ. |
| `turn_philebus_1072` | ΣΩ. |
| `turn_philebus_1074` | ΣΩ. |
| `turn_philebus_1075` | ΣΩ. |

The remaining 1137 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_philebus_0540`
- `turn_philebus_1070`
- `turn_philebus_1072`
- `turn_philebus_1074`
- `turn_philebus_1075`

## Ambiguous boundary decisions

- Ruling applied: turn_philebus_0003 yes->no: `Φίληβος φησι` + content — indirect report (accusative-and-infinitive), no bounded direct speech by Philebus
- Ruling applied: turn_philebus_0024 yes->no: `Φίληβος φησι` + content — same case, deictic subject ὅδε, still indirect report
- Ruling applied: turn_philebus_0064 yes->no: quoted phrase, not a bounded stretch — the borrowed vocative ὦ παῖδες is one address Socrates himself uses while attributing it to Philebus
- Ruling applied: turn_philebus_0105 yes->no: `ἔφησθα` recap case — Φιλήβου εἰπόντος / σὺ ἀντεῖπες / ἠπειλήσαμεν all recap on-stage printed turns, and all are indirect report
- Ruling applied: turn_philebus_0444 yes->no: personified ὁ λόγος, no by default; also indirect (οὔ φησιν … γίγνεσθαι)
- Ruling applied: turn_philebus_0542 yes->no: indirect report (εἴποι … ὡς ἔστιν ἄνθρωπος), not direct speech
- Ruling applied: turn_philebus_0544 yes->no: indirect report (ὡς ἔστι τινῶν ποιμένων ἔργον … προσείποι), not direct speech
- Ruling applied: turn_philebus_0812 yes->no: personified ὁ λόγος, no by default; also indirect (φησὶν ὁ λόγος + acc.-inf.)
- Ruling applied: turn_philebus_0830 yes->no: personified ὁ λόγος, no by default — the one λόγος site that IS direct speech (εὐθύ τι λέγω, φησὶν ὁ λόγος), but a single clause inside Socrates' own sentence does not stage a bounded prosopopoeia comparable to the Laws in Crito
- Ruling applied: turn_philebus_0876 yes->no: personified ὁ λόγος, no by default; also indirect (λέγει δ’ ὅτι …)
- Ruling applied: turn_philebus_1006 yes->no: indirect report plus recap case — Φίληβός φησι / Σωκράτης δ’ οὔ φησι recapitulates on-stage printed turns
- Ruling applied: turn_philebus_1068 yes->no: Phaedo 88c case — the {q} address ὦ φίλαι is the printed speaker's own quoted speech (the interrogators' question), which stays inside his turn
- Ruling applied: turn_philebus_1071 yes->no: Phaedo 88c case — {q} καὶ καλῶς γε εἰρήκατε τὰ νῦν {/q} φήσομεν is the printed speaker's own quoted speech in a ΠΡΩ. turn
- `turn_philebus_1121` → **no**: The one call I cannot settle under this ruling; it sits exactly between two rows of the table. FOR yes (Sophist 237a Parmenides' verse): bounded direct speech — an imperative, καταπαύσατε — inside the source's own {q} markers, attributed to a named other speaker by a naming formula (φησὶν Ὀρφεύς). AGAINST (Phaedo 94d Homer): it does not fill the turn, and Socrates immediately turns it to his own argument in the next clause (ἀτὰρ κινδυνεύει καὶ ὁ ἡμέτερος λόγος …), so he owns the argumentative unit. I called no because the Phaedo 94d row describes this shape — naming formula plus quoted verse plus the argument continuing — and that row is the one that says the current accepted treatment stands. If the reconciler reads Sophist 237a as controlling for any named-and-quoted verse, this flips to yes and Orpheus is an unregistered owner. Greek: {q} ἕκτῃ δ’ ἐν γενεᾷ, {/q} φησὶν Ὀρφεύς, {q} καταπαύσατε κόσμον ἀοιδῆς· {/q} ἀτὰρ κινδυνεύει καὶ ὁ ἡμέτερος λόγος ἐν ἕκτῃ καταπεπαυμένος εἶναι κρίσει.
- `turn_philebus_0540` → **yes**: Kept, but recorded because it is the only required turn whose direct speech carries no quotation markup. It is bounded (one complete question), it is direct (no ὡς-clause, no infinitive), its owner is an indefinite third party and not the printed speaker, and it is licensed on both sides — announced at 0538 (αὐτὸς αὑτὸν οὗτος ἀνέροιτ’ ἂν ὧδε) and closed by ταῦτ’ εἰπεῖν ἄν τις πρὸς ἑαυτόν. The continuations at 0542 and 0544 are indirect and were dropped, so this hypothetical soliloquy contributes exactly one turn. Greek: τί ποτ’ ἄρ’ ἔστι τὸ παρὰ τὴν πέτραν τοῦθ’ ἑστάναι φανταζόμενον ὑπό τινι δένδρῳ; ταῦτ’ εἰπεῖν ἄν τις πρὸς ἑαυτὸν δοκεῖ σοι

## Inspected cue hits that yield no reported turn

- `turn_philebus_1068`: Source-marked direct speech, but the speaker is the interrogating pair set up at 1066 (οὐχ ἡμᾶς … διερωτᾶν χρή, τὰς ἡδονὰς δὲ αὐτὰς … διαπυνθανομένους) — i.e. the printed speaker's own quoted speech. Phaedo 88c case: it stays inside his turn. Same for 1071 (φήσομεν) and for the question halves of 1072 (φαῖμεν ἄν) and 1074 (φήσομεν), which is why those two turns are required for their ANSWER spans only. Greek: {q} ὦ φίλαι, εἴτε ἡδονὰς ὑμᾶς χρὴ προσαγορεύειν εἴτε ἄλλῳ ὁτῳοῦν ὀνόματι, μῶν οὐκ ἂν δέξαισθε οἰκεῖν μετὰ φρονήσεως πάσης ἢ χωρὶς τοῦ φρονεῖν; {/q}
- `turn_philebus_0003`: The ruled `Φίληβος φησι` case. Accusative-and-infinitive throughout; the Greek transmits Philebus' thesis, not any bounded stretch of his direct speech. Same at 0024, 1006. Greek: Φίληβος μὲν τοίνυν ἀγαθὸν εἶναί φησι τὸ χαίρειν πᾶσι ζῴοις καὶ τὴν ἡδονὴν καὶ τέρψιν
- `turn_philebus_0105`: Recap of on-stage printed turns, all in indirect report. The original turns already own that speech; duplicating it in the voice layer is what the ruling forbids. Greek: Φιλήβου γὰρ εἰπόντος ἡδονὴν καὶ τέρψιν καὶ χαρὰν … σὺ πρὸς αὐτὰ ἀντεῖπες ὡς οὐ ταῦτα ἀλλ’ ἐκεῖνά ἐστιν
- `turn_philebus_0830`: Personified ὁ λόγος — no by default. This is the only direct-speech instance in the group (first-person λέγω under a parenthetical naming formula), but it is one clause embedded in Socrates' own first-person sentence (πειρῶμαι νῦν λέγειν … ταῦτα γὰρ … λέγω), so the λόγος never holds the floor. Group also covers 0444, 0812, 0876, 1137. Greek: ἀλλ’ εὐθύ τι λέγω, φησὶν ὁ λόγος, καὶ περιφερὲς
- `turn_philebus_0752`: Phaedo 94d case exactly: verse used inside Socrates' argument as a reminder of anger's mixture, with no attribution to any speaker at all. Socrates owns the argumentative unit. Greek: τὸ {quote} ὅς τ’ ἐφέηκε πολύφρονά περ χαλεπῆναι ὅς τε πολὺ γλυκίων μέλιτος καταλειβομένοιο, {/quote}
- `turn_philebus_0717`: Quoted maxim, two words, used inside the speaker's argument; and its nominal owner is a personified λόγος, which is no by default. Same for 0771 (τὸ {q} γνῶθι σαυτὸν {/q} λέγεις) and 0770/0772 (τὸ λεγόμενον ὑπὸ τῶν ἐν Δελφοῖς γραμμάτων). Greek: ὁ παροιμιαζόμενος ἐπίσχει λόγος … ὁ τὸ {q} μηδὲν ἄγαν {/q} παρακελευόμενος
- `turn_philebus_0968`: Quotation markup over words the addressee is said to have wanted to say and did not say. No utterance exists to be owned. Greek: {q} τὰ ὅπλα {/q} μοι δοκεῖς βουληθεὶς εἰπεῖν αἰσχυνθεὶς ἀπολιπεῖν.
- `turn_philebus_0085`: The ruled `οἱ σοφοί φασιν` / bare-φασί case: indirect report by an unnamed collective, no direct speech. Covers 0278, 0288, 0656, 0687, 0696, 0714, 0826, 0864, 0900, 0904, 1139 as well. Greek: ἃ δὴ δι’ ἀριθμῶν μετρηθέντα δεῖν αὖ φασι ῥυθμοὺς καὶ μέτρα ἐπονομάζειν
- `turn_philebus_0092`: Hearsay tag introducing the Theuth story; the story is then narrated in Socrates' own voice and Theuth's only speech act is naming, with the name as its object. No direct speech anywhere in the span. Greek: ὡς λόγος ἐν Αἰγύπτῳ Θεῦθ τινα τοῦτον γενέσθαι λέγων … γραμματικὴν τέχνην ἐπεφθέγξατο προσειπών
- `turn_philebus_0538`: Announces the direct speech that turn 0540 then delivers; transmits nothing itself. Likewise 0546 (τά τε πρὸς αὑτὸν ῥηθέντα … πάλιν φθέγξαιτο) refers back without transmitting new discourse. Greek: οὐκοῦν τὸ μετὰ τοῦτο αὐτὸς αὑτὸν οὗτος ἀνέροιτ’ ἂν ὧδε;
- `turn_philebus_0026`: Recap case in its simplest form — the speaker's own earlier printed turn. Same at 0040, 0069, 0108, 0113, 0123, 0162, 0193, 0196, 0238, 0280, 0325, 0339, 0342, 0372, 0373, 0378, 0414, 0464, 0568, 0656, 0670, 0713, 0748, 0804, 0810, 0816, 0823, 0825, 0826, 0900, 0972, 1052, 1095, 1127, 1129, 1130. Also 0086/0088/0273/0276, where a third party's speech act is named with nothing transmitted, and 0052/0083/0922 (ὡς ἔπος εἰπεῖν idiom). Greek: καὶ ὅπερ εἶπον, ἀπ’ ἐκείνης ἡμᾶς ἀρχομένους ἐνθυμεῖσθαι δεῖ

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high on the disposition and on the four 63b-64a turns; medium on the one case listed as borderline. The 63b-64a answers are source-marked direct speech with explicit reporting formulas and first- and second-person deixis that cannot belong to the printed speaker (the pleasures say ἡμῖν of themselves; νοῦς addresses Socrates as ὦ Σώκρατες), so they survive the strictest reading of the ruling, and 1075 is squarely the whole-turn-quotation row. 0540 is direct and bounded but unmarked, which is the only reason to look twice. The residual uncertainty is entirely 1121 (Orpheus), which the ruling's own table pulls both ways, and which is the sole call that could change this dialogue's list. I have no remaining doubt about the groups that fell: each was ruled by name.
