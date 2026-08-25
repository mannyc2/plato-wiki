# critias: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/critias.txt`, sha256 `f724e270f7d4fdffa96cfaf82ce029b30e7cbe60f8cee3f3c7f941af2cb58ee2`
**Turn index**: `derived/plato/turns/critias.toon`, sha256 `18c8c993f2427313bce48d689e1a4a03ec5605c678a7c17f7cb236f5441e5c78`, 20 printed-siglum turn(s)
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

Candidate hits located and inspected: 97.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

All 20 outer turns are explicit zero results. A reviewer exhausted the
Greek source and found no bounded stretch of direct speech transmitted below a
printed speaker. This is a reviewed finding, not an absence of files.

## Ambiguous boundary decisions

- Ruling applied: turn_critias_0009 yes->no: `Σόλων ἔφη τὸν τότε διηγεῖσθαι πόλεμον` is accusative-and-infinitive indirect report, not bounded direct speech. Decided by the `Φίληβος φησι + content` case (No if it is indirect report; Yes only if the Greek actually transmits bounded direct speech).
- Ruling applied: turn_critias_0018 yes->no: `ἐπευξάμενοι τῷ θεῷ ... θῦμα ἑλεῖν` transmits the content of a prayer through an infinitive, with no direct speech anywhere. Decided by the `Φίληβος φησι` case and reinforced by the bare `φασί` + accusative-and-infinitive case (no direct speech and no licensed owner).
- Ruling applied: turn_critias_0019 yes->no: the ten kings' oath `ἐπώμνυσαν δικάσειν τε ... πείσεσθαι` is four coordinated future infinitives in oratio obliqua. Substantial, but indirect throughout. Decided by the `Φίληβος φησι` case; the collective unregistered subject would additionally have fallen under the `οἱ σοφοί φασιν` case, which is `usually no` for indirect report.
- `turn_critias_0020` → **no**: The only call in Critias I still cannot fully settle, and the ruling has no case for it. This is the one place in the dialogue where direct speech is unmistakably about to begin: a nominative named subject (θεὸς δὲ ὁ θεῶν Ζεύς), an active aorist εἶπεν, and a dash — the exact opening of a bounded direct-speech stretch. But the source ends there (end_char 31192 = source length, the dialogue is unfinished), so zero characters of Zeus's address exist. I call `no` because the ruling requires a bounded stretch of direct speech *transmitted*, and nothing is transmitted; a record would need a nonempty char_span and span_sha256, and the tiling invariant would have nothing to tile. The ruling's whole-turn-quotation case points the other way only if `staged` were enough without `transmitted`. Under the pass-A brief this was also the decisive borderline, and the ruling has if anything strengthened the `no`: `quotation alone is not enough` and the standard's operative verb is `transmitted`. Greek: συνήγειρεν θεοὺς πάντας εἰς τὴν τιμιωτάτην αὐτῶν οἴκησιν, ἣ δὴ κατὰ μέσον παντὸς τοῦ κόσμου βεβηκυῖα καθορᾷ πάντα ὅσα γενέσεως μετείληφεν, καὶ συναγείρας εἶπεν—

## Inspected cue hits that yield no reported turn

- `turn_critias_0009`: FLIPPED FROM PASS A. A named nominative subject plus active ἔφη plus accusative-and-infinitive content running to 110c (`ὡπλισμένην τὴν θεὸν ἀνάθημα εἶναι τοῖς τότε`). Real speech machinery with a real named owner, but the content is reported, never quoted: no finite verb of Solon's own, no first or second person, no vocative, no direct-speech boundary. Under the ruling, indirect report is not a nested turn however well licensed the formula is. Greek: τούτων ἐκείνους τὰ πολλὰ ἐπονομάζοντας τοὺς ἱερέας Σόλων ἔφη τὸν τότε διηγεῖσθαι πόλεμον
- `turn_critias_0019`: FLIPPED FROM PASS A. The ten kings' oath at 120a-120b, ~250 characters, and the strongest candidate in the dialogue after 0009. Still entirely indirect: ἐπώμνυσαν governs four future infinitives, and the sworn words are never given as words. The resumptive `ταῦτα ἐπευξάμενος ἕκαστος αὐτῶν` a few lines later likewise summarizes rather than quotes. Greek: κατὰ τοῦ πυρὸς σπένδοντες ἐπώμνυσαν δικάσειν τε κατὰ τοὺς ἐν τῇ στήλῃ νόμους καὶ κολάσειν εἴ τίς τι πρότερον παραβεβηκὼς εἴη, τό τε αὖ μετὰ τοῦτο μηδὲν τῶν γραμμάτων ἑκόντες παραβήσεσθαι, μηδὲ ἄρξειν μηδὲ ἄρχοντι {120b} πείσεσθαι πλὴν κατὰ τοὺς τοῦ πατρὸς ἐπιτάττοντι νόμους
- `turn_critias_0018`: FLIPPED FROM PASS A. A prayer reported through a single infinitive that reads nearly as purpose. No direct speech. Greek: μόνοι γιγνόμενοι δέκα ὄντες, ἐπευξάμενοι τῷ θεῷ τὸ κεχαρισμένον {119e} αὐτῷ θῦμα ἑλεῖν
- `turn_critias_0018`: The oath is described as invoking curses; its wording is summarized, not transmitted. An inscription referred to, never read aloud — the ruling's whole-turn-quotation case therefore does not engage. Greek: ἐν δὲ τῇ στήλῃ πρὸς τοῖς νόμοις ὅρκος ἦν μεγάλας ἀρὰς ἐπευχόμενος τοῖς ἀπειθοῦσιν
- `turn_critias_0018`: Poseidon's injunctions on the orichalc stele are named as a source of law but never quoted. The closest thing in Critias to a read-aloud written text (the Lysias-in-Phaedrus shape), and it fails: no words of the stele are transmitted. Greek: ἡ δὲ ἐν ἀλλήλοις ἀρχὴ καὶ κοινωνία κατὰ ἐπιστολὰς ἦν τὰς τοῦ Ποσειδῶνος, ὡς ὁ νόμος αὐτοῖς παρέδωκεν καὶ γράμματα ὑπὸ τῶν πρώτων ἐν στήλῃ γεγραμμένα
- `turn_critias_0001`: First-person plural about the speakers' own preceding discourse (yesterday's Timaeus). The turn's own speaker in his own voice. Greek: τῶν ῥηθέντων ὅσα μὲν ἐρρήθη μετρίως
- `turn_critias_0002`: Critias recaps Timaeus's earlier on-stage request for indulgence. Squarely the ruling's `ἔφησθα` recap case: the original printed turn owns that speech, and the recap must not duplicate the voice layer. Greek: ᾧ δὲ καὶ σὺ κατ’ {106c} ἀρχὰς ἐχρήσω, συγγνώμην αἰτούμενος ὡς περὶ μεγάλων μέλλων λέγειν
- `turn_critias_0005`: Socrates predicts future speech by Hermocrates. Prediction, not transmission. Greek: παραιτήσεται καθάπερ ὑμεῖς
- `turn_critias_0006`: An invocation named but not quoted. Greek: τὸν Παίωνά τε καὶ τὰς μούσας ἐπικαλούμενον
- `turn_critias_0007`: Second-person εἶπες pointing back at the gods Hermocrates named in the immediately preceding turn 0006. The ruling's `ἔφησθα` recap case: an on-stage utterance that already has its own printed turn. Greek: καὶ πρὸς οἷς θεοῖς εἶπες τούς τε ἄλλους κλητέον
- `turn_critias_0007`: ἔφαμεν is first-person plural for the present company's own prior conversation. Own voice, and an on-stage recap besides. Greek: ἣν δὴ Λιβύης καὶ Ἀσίας μείζω νῆσον οὖσαν ἔφαμεν εἶναί ποτε
- `turn_critias_0007`: Agent-less passive evidential. Representative of the class covering turns 0007, 0009, 0010, 0012, 0017 and 0018 — see the class entry below. Greek: τῶν μὲν οὖν ἥδε ἡ πόλις ἄρξασα καὶ πάντα τὸν πόλεμον διαπολεμήσασα ἐλέγετο

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The disposition follows from a property of the text that is cheap to check and hard to be wrong about — Critias contains no direct speech at all — and the dialogue is short enough (20 turns, 31,192 characters) that I read every character rather than sampling. The three flipped turns were flagged in pass A as resting on exactly the scope question this ruling settles, and the ruling settles all three the same way. Residual uncertainty is confined to turn_critias_0020, where the dialogue breaks off mid-formula; that call is `no` under both the brief and the ruling, and it is the only thing that could move Critias off `none`.
