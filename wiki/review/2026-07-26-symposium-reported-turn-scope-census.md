# symposium: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/symposium.txt`, sha256 `260b7c575fc40bf88e74f793ebaccb48e536702b26d8780c111190e01a3447a7`
**Turn index**: `derived/plato/turns/symposium.toon`, sha256 `6d86dd3d2f808cd29099ba89af1c7fab6acd44d3362db13078789d37b95f8329`, 5 printed-siglum turn(s)
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

Candidate hits located and inspected: 85.
Turns with no cue and no quotation marker: 3.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

2 of 5 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_symposium_0001` | ΑΠΟΛ. |
| `turn_symposium_0005` | ΑΠΟΛ. |

The remaining 3 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_symposium_0001`
- `turn_symposium_0005`

## Ambiguous boundary decisions

- `turn_symposium_0005` → **yes**: Turns on the personification case. It is counterfactual (εἰ … ἔροιτο, optative), which pulls toward 'the current speaker's argumentative staging'; but Hephaestus is a named speaker, not an abstraction, and the source gives him the floor twice in {q}-marked direct address with a second-person addressee — a bounded direct prosopopoeia of the Laws-in-Crito shape. Called yes. Does not affect turn 0005's disposition, which is yes on ordinary reporting formulas; it matters only for the span inventory and because Ἥφαιστος is unregistered. Greek: καὶ εἰ αὐτοῖς ἐν τῷ αὐτῷ κατακειμένοις ἐπιστὰς ὁ Ἥφαιστος, ἔχων τὰ ὄργανα, ἔροιτο· {q} τί ἔσθ’ ὃ βούλεσθε, ὦ ἄνθρωποι, ὑμῖν παρ’ ἀλλήλων γενέσθαι; {/q} καὶ εἰ ἀποροῦντας αὐτοὺς πάλιν ἔροιτο· {q} ἆρά γε τοῦδε ἐπιθυμεῖτε … {/q}
- `turn_symposium_0005` → **yes**: Not borderline on the standard — named nominative subject ὁ Ζεύς, λέγει ὅτι plus two parenthetical ἔφη, first-person direct speech inside {q} — but recorded here because it is a mythological speaker inside Aristophanes' own speech and because Ζεύς is unregistered, so the corpus reported-turn completion campaign must either register him or record the span unresolved rather than leave the words with Aristophanes. Greek: μόγις δὴ ὁ Ζεὺς ἐννοήσας λέγει ὅτι {q} δοκῶ μοι, {/q} ἔφη, {q} ἔχειν μηχανήν … {/q} νῦν μὲν γὰρ αὐτούς, ἔφη, διατεμῶ δίχα ἕκαστον

## Inspected cue hits that yield no reported turn

- `turn_symposium_0001`: Indirect report of an unnamed third party inside Glaucon's own transmitted speech; no bounded direct speech and no licensed owner. Ruling case: bare indirect report. Was listed borderline in pass A; the ruling settles it as a false positive. Turn 0001 stays yes on other spans. Greek: ἄλλος γάρ τίς μοι διηγεῖτο ἀκηκοὼς Φοίνικος τοῦ Φιλίππου, ἔφη δὲ καὶ σὲ εἰδέναι. ἀλλὰ γὰρ οὐδὲν εἶχε σαφὲς λέγειν.
- `turn_symposium_0005`: Socrates alters and cites a proverb/Homeric line inside his own argument; he owns the argumentative unit and the verse is not a new local turn owner. Ruling case: Phaedo 94d Homer quotation. Greek: ὡς ἄρα καὶ {quote} Ἀγάθων’ ἐπὶ δαῖτας ἴασιν αὐτόματοι ἀγαθοί {/quote} . Ὅμηρος μὲν γὰρ κινδυνεύει οὐ μόνον διαφθεῖραι ἀλλὰ καὶ ὑβρίσαι
- `turn_symposium_0005`: Eryximachus cites Heraclitus and immediately argues against the wording; the citation serves his argument and he keeps the floor. Ruling case: Phaedo 94d Homer quotation. Same treatment for the Hesiod/Parmenides/Acusilaus citations in Phaedrus's speech and the Homer/Sophocles citations in Agathon's (195d, 196c-d) and Alcibiades' (221c) speeches. Greek: τὸ ἓν γάρ φησι {q} διαφερόμενον αὐτὸ αὑτῷ συμφέρεσθαι, {/q} {q} ὥσπερ ἁρμονίαν τόξου τε καὶ λύρας. {/q} ἔστι δὲ πολλὴ ἀλογία …
- `turn_symposium_0005`: Indirect report (ὅτι + indicative) by an unnamed collective; no bounded direct speech, no licensed owner. Ruling cases: οἱ σοφοί φασιν / bare indirect report. Greek: θαυμάζοντες ἄλλος ἄλλῳ ἔλεγεν ὅτι Σωκράτης ἐξ ἑωθινοῦ φροντίζων τι ἕστηκε.
- `turn_symposium_0002`: A remark about what Apollodorus is called; no utterance transmitted. Not a cue hit; recorded because it is the only speech-adjacent material in a zero-cue turn. Greek: καὶ ὁπόθεν ποτὲ ταύτην τὴν ἐπωνυμίαν ἔλαβες τὸ μαλακὸς καλεῖσθαι, οὐκ οἶδα ἔγωγε
- `turn_symposium_0004`: A recap of a request the companions already made, plus a fresh demand; no direct speech is transmitted. Ruling case: ἔφησθα recap of an on-stage turn. Not a cue hit; recorded because it is the only speech-adjacent material in a zero-cue turn. Greek: ἀλλ’ ὅπερ ἐδεόμεθά σου, μὴ ἄλλως ποιήσῃς, ἀλλὰ διήγησαι τίνες ἦσαν οἱ λόγοι.

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high — both yes calls rest on {q}-marked direct speech with named or person-marked reporting formulas that I read verbatim, and the three no calls are on turns short enough to read entire and state that no cue or quotation marker occurs anywhere in them. The scan is provably exhaustive because the 5 turn spans tile the source with no gap. The one genuinely uncertain judgment (Hephaestus 192d, counterfactual prosopopoeia) is recorded as borderline and changes no turn disposition.
