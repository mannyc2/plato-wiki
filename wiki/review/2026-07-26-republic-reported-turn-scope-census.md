# republic: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/republic.txt`, sha256 `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`
**Turn index**: `derived/plato/turns/republic.toon`, sha256 `147bf0f6da8ba86c7611801e314f9aa5649e1bb72be9b4a9c868750f6eb01af1`, 1 printed-siglum turn(s)
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

Candidate hits located and inspected: 169.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 1 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_republic_0001` | (none) |

The remaining 0 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_republic_0001`

## Ambiguous boundary decisions

- `turn_republic_0001` → **yes**: 614b-621b, Er's whole narrative. Turns on the a.c.i. row. The ruling's headline says `direct speech`, and Er's report is accusative-and-infinitive throughout — but that row rejects only BARE `φασί` + a.c.i. with NO named subject, and Er is the named nominative subject of `ἔλεγεν`/`ἔφη`. Reading it as `no` would also contradict the repository's flagship case: the Symposium's entire banquet is a.c.i. (`εἰπεῖν τὸν Ἐρυξίμαχον`, `φάναι τὸν Ἀγάθωνα`) and is accepted, compiled and activated. I therefore read named-subject a.c.i. as in scope. This is the one place the ruling's wording and the Symposium precedent needed reconciling; it does not affect the disposition. Greek: ὅς ποτε ἐν πολέμῳ τελευτήσας … ἀνεβίω, ἀναβιοὺς δ’ ἔλεγεν ἃ ἐκεῖ ἴδοι. ἔφη δέ, ἐπειδὴ οὗ ἐκβῆναι, τὴν ψυχὴν πορεύεσθαι {614c} μετὰ πολλῶν …
- `turn_republic_0001` → **no**: 453b-453c. Turns on the personified-`ὁ λόγος` row and its Crito-Laws carve-out. For `yes`: an opponent holds the floor across four bounded {q} turns, names Socrates and Glaucon, and is answered between them — structurally a staged exchange. For `no`, which I take: Socrates states outright that he and Glaucon will argue against themselves on the others' behalf, so the personified opponent is the current speakers' own device, not a voice the text hands the floor to. Reverses my first pass. Still genuinely uncertain. Greek: βούλει οὖν, ἦν δ’ ἐγώ, ἡμεῖς πρὸς ἡμᾶς αὐτοὺς ὑπὲρ τῶν ἄλλων ἀμφισβητήσωμεν … λέγωμεν δὴ ὑπὲρ αὐτῶν ὅτι {q} ὦ Σώκρατές τε καὶ Γλαύκων, οὐδὲν δεῖ ὑμῖν ἄλλους ἀμφισβητεῖν … {/q}
- `turn_republic_0001` → **no**: 383b, the longest first-person quotation in the dialogue and the only one that sits on the Phaedo-94d / Ion-537a boundary: the words are attributed by name to another speaker (Thetis, quoted at length in her own first person, `ἐμὰς τύχας`, `κἀγὼ`, `ἤλπιζον`). It falls to Phaedo 94d because it is a specimen inside Socrates' enumeration of what must not be said, and it fills no turn of its own. Still genuinely uncertain. Greek: οὐδὲ Αἰσχύλου, ὅταν φῇ ἡ Θέτις τὸν Ἀπόλλω ἐν τοῖς αὑτῆς {383b} γάμοις ᾄδοντα … {quote} … ξύμπαντά τ’ εἰπὼν θεοφιλεῖς ἐμὰς τύχας παιᾶν’ ἐπηυφήμησεν, εὐθυμῶν ἐμέ. κἀγὼ τὸ Φοίβου θεῖον ἀψευδὲς στόμα ἤλπιζον εἶναι … {/quote}

## Inspected cue hits that yield no reported turn

- `turn_republic_0001`: 379d, representative of all 87 {quote} spans (Homer, Hesiod, Pindar, Aeschylus, Archilochus, Musaeus) in Books 1-3 and 8-10. Verse used inside the citing speaker's argument. Ruling row: Phaedo 94d — the verse is not a new local turn owner. No {quote} span in republic is whole-turn, so the Ion 537a row never engages. Greek: καὶ λέγοντος — {quote} ὡς δοιοί τε πίθοι κατακείαται ἐν Διὸς οὔδει κηρῶν ἔμπλειοι, ὁ μὲν ἐσθλῶν, αὐτὰρ ὃ δειλῶν· {/quote}
- `turn_republic_0001`: 392e. `φησι` + accusative-and-infinitive summary of the Iliad's opening, with no direct speech transmitted. Ruling row: `Φίληβος φησι` + content — indirect report, no. Greek: ἐν οἷς ὁ ποιητής φησι τὸν μὲν Χρύσην δεῖσθαι τοῦ Ἀγαμέμνονος ἀπολῦσαι τὴν θυγατέρα, τὸν δὲ χαλεπαίνειν
- `turn_republic_0001`: 337b-c, and the same shape at 332c (`εἰ οὖν τις αὐτὸν ἤρετο· {q} ὦ Σιμωνίδη … {/q}`), 422e, 525e-526a, 556d-e. Direct-form speech inside a counterfactual protasis: no utterance is transmitted, the citing speaker keeps the floor, and no owner exists to license. 332c reverses my first pass, which called it `yes`. Greek: εἴ τινα ἔροιο ὁπόσα ἐστὶν τὰ δώδεκα, καὶ ἐρόμενος προείποις {337b} αὐτῷ — {q} ὅπως μοι, ὦ ἄνθρωπε, μὴ ἐρεῖς ὅτι ἔστιν τὰ δώδεκα δὶς ἓξ … {/q}
- `turn_republic_0001`: 414d-415c, the noble lie. Sustained second-person address, but delivered by the current speaker as what `we shall say`. Ruling row: Phaedo 88c — a speaker's own quoted or projected self-address stays inside their own turn. Reverses my first pass, which called it `yes` under the brief's tie-break. Greek: ἐστὲ μὲν γὰρ δὴ πάντες οἱ ἐν τῇ πόλει ἀδελφοί, ὡς φήσομεν πρὸς αὐτοὺς μυθολογοῦντες …
- `turn_republic_0001`: 366e-367a, and 420d-421a (`μετρίως ἂν ἐδοκοῦμεν πρὸς αὐτὸν ἀπολογεῖσθαι λέγοντες· {q} ὦ θαυμάσιε … {/q}`) and 479a (`{q} τούτων γὰρ δή, ὦ ἄριστε, φήσομεν … {/q}`). The speaker quoting the address he is himself making. Same Phaedo 88c row. Greek: καὶ τῷδε καὶ ἐμοὶ πρὸς σέ, ὦ Σώκρατες, εἰπεῖν, ὅτι {q} ὦ θαυμάσιε, πάντων {366e} ὑμῶν, ὅσοι ἐπαινέται φατὲ δικαιοσύνης εἶναι … {/q}
- `turn_republic_0001`: 365d, 365e. An indefinite `τις` objection voiced and answered inside Adeimantus's own continuous speech. Ruling row: personified `ὁ λόγος` — the current speaker's argumentative personification, no by default; nothing here is a sustained prosopopoeia. Greek: {q} ἀλλὰ γάρ, φησί τις, οὐ ῥᾴδιον ἀεὶ λανθάνειν κακὸν ὄντα. {/q} οὐδὲ γὰρ ἄλλο οὐδὲν εὐπετές, {365d} φήσομεν, τῶν μεγάλων
- `turn_republic_0001`: 339a-b. Socrates quoting back Thrasymachus's own phrase from earlier in the conversation. Ruling row: `ἔφησθα` recap — the original turn already owns that speech. Applied by transfer, since republic prints no sigla: the recap would duplicate the voice-layer span that will own Thrasymachus's utterance, not a printed turn. Same for the lexical citations at 331a, 365c, 386c-387b, 411b, 568a-b and 533b, which quote words rather than speech. Greek: πρόσεστιν δὲ δὴ αὐτόθι τὸ {q} τοῦ κρείττονος. {/q}
- `turn_republic_0001`: 328e. A statement about what poets say. Ruling row: `οἱ σοφοί φασιν` — indirect report, no nested turn. Greek: ἐπειδὴ ἐνταῦθα ἤδη εἶ τῆς ἡλικίας ὃ δὴ {quote} ἐπὶ γήραος οὐδῷ φασιν εἶναι οἱ ποιηταί {/quote}
- `turn_republic_0001`: 393d-394a. Socrates re-narrates Chryses' prayer in his own indirect prose to demonstrate ἁπλῆ διήγησις. The speech act is explicitly his own. Unchanged from my first pass. Greek: εἶχε δ’ ἂν ὧδε πως — φράσω δὲ ἄνευ μέτρου· οὐ γάρ εἰμι ποιητικός· ἐλθὼν {393e} ὁ ἱερεὺς ηὔχετο ἐκείνοις μὲν τοὺς θεοὺς δοῦναι …

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The turn-level call is not close and none of the seven case rulings reaches it: republic is a first-person narration whose entire dramatic conversation is bounded direct speech transmitted by named formulas below a turn that prints no speaker at all. The two calls I flag as still uncertain (453b-c and 383b) and the one reconciliation I had to make (named-subject a.c.i., against the ruling's `direct speech` headline, following the activated Symposium precedent) are all sub-span questions for the record lane; none of them can move the disposition.
