# euthydemus: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/euthydemus.txt`, sha256 `23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14`
**Turn index**: `derived/plato/turns/euthydemus.toon`, sha256 `114215016db5ab4c3c5d0a00e15cd6073bd51f28de0fdc2114ed8fc7e3a4c6ad`, 95 printed-siglum turn(s)
**Disposition**: `required` — 33 outer turn(s) carry nested reported turns
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

Candidate hits located and inspected: 705.
Turns with no cue and no quotation marker: 35.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

33 of 95 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_euthydemus_0012` | ΣΩ. |
| `turn_euthydemus_0013` | ΣΩ. |
| `turn_euthydemus_0014` | ΣΩ. |
| `turn_euthydemus_0015` | ΣΩ. |
| `turn_euthydemus_0016` | ΣΩ. |
| `turn_euthydemus_0017` | ΣΩ. |
| `turn_euthydemus_0018` | ΣΩ. |
| `turn_euthydemus_0019` | ΣΩ. |
| `turn_euthydemus_0020` | ΣΩ. |
| `turn_euthydemus_0021` | ΣΩ. |
| `turn_euthydemus_0022` | ΣΩ. |
| `turn_euthydemus_0023` | ΣΩ. |
| `turn_euthydemus_0024` | ΣΩ. |
| `turn_euthydemus_0025` | ΣΩ. |
| `turn_euthydemus_0026` | ΣΩ. |
| `turn_euthydemus_0027` | ΣΩ. |
| `turn_euthydemus_0028` | ΣΩ. |
| `turn_euthydemus_0029` | ΣΩ. |
| `turn_euthydemus_0043` | ΣΩ. |
| `turn_euthydemus_0069` | ΣΩ. |
| `turn_euthydemus_0070` | ΣΩ. |
| `turn_euthydemus_0071` | ΣΩ. |
| `turn_euthydemus_0072` | ΣΩ. |
| `turn_euthydemus_0073` | ΣΩ. |
| `turn_euthydemus_0074` | ΣΩ. |
| `turn_euthydemus_0075` | ΣΩ. |
| `turn_euthydemus_0076` | ΣΩ. |
| `turn_euthydemus_0077` | ΣΩ. |
| `turn_euthydemus_0078` | ΣΩ. |
| `turn_euthydemus_0079` | ΣΩ. |
| `turn_euthydemus_0080` | ΣΩ. |
| `turn_euthydemus_0081` | ΚΡ. |
| `turn_euthydemus_0082` | ΚΡ. |

The remaining 62 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_euthydemus_0043`
- `turn_euthydemus_0081`
- `turn_euthydemus_0082`

## Ambiguous boundary decisions

- Ruling applied: turn_euthydemus_0007 yes->no: καὶ γάρ φατον ἐν ὀλίγῳ χρόνῳ ποιῆσαι ἂν καὶ ἄλλον ὁντινοῦν τὰ αὐτὰ ταῦτα δεινόν — accusative-and-infinitive indirect report of the brothers' claim, no bounded direct speech. Ruling row: 'Φίληβος φησι + content → No if it is indirect report.'
- Ruling applied: turn_euthydemus_0055 yes->no: ἀγαθὸν δέ γέ που ὡμολογήσαμεν ἀλλήλοις ἐγώ τε καὶ Κλεινίας οὐδὲν εἶναι ἄλλο ἢ ἐπιστήμην τινά — a remembered proposition reported indirectly, not transmitted direct speech. Ruling: 'not every quoted phrase, indirect report, remembered proposition, or argumentative recap.'
- Ruling applied: turn_euthydemus_0067 yes->no: πᾶσαν ἤδη φωνὴν ἠφίειν, δεόμενος τοῖν ξένοιν … σῶσαι ἡμᾶς … ἐπιδεῖξαι τίς ποτ’ ἐστὶν ἡ ἐπιστήμη — the narrator's indirect summary of his own plea; a speech act described, with no bounded direct speech. Ruling: same clause.
- `turn_euthydemus_0043` → **yes**: Bounded direct speech (πάντως δήπου) closed by a person-marked reporting formula, so it qualifies under the ruling; and it is not a recap of an on-stage turn, because the kingly-art search of 291b-292e appears in no printed narration turn — Socrates announces it as new (ἐγὼ φράσω, 291c). What remains uncertain is the owner: ἡμεῖς is Socrates-and-Cleinias jointly, which is no single registered siglum, so the span looks required-but-unresolved. The preceding re-enacted question φέρε … ἢ οὐδέν; has the same shape and the same problem. The rest of the 290e-293a interlude is argumentative recap in Socrates' own voice (ἐδόκει ἡμῖν, οὐ καὶ σὺ ἂν ταῦτα φαίης, ὦ Κρίτων) and is called no throughout. Greek: φέρε, πάντων ἄρχουσα ἡ βασιλικὴ τέχνη τὶ ἡμῖν ἀπεργάζεται ἔργον ἢ οὐδέν; πάντως δήπου, ἡμεῖς ἔφαμεν πρὸς ἀλλήλους.

## Inspected cue hits that yield no reported turn

- `turn_euthydemus_0007`: Indirect report (dual φατόν + accusative-and-infinitive). Flipped from the first pass by the ruling. Greek: καὶ γάρ φατον ἐν ὀλίγῳ χρόνῳ ποιῆσαι ἂν καὶ ἄλλον ὁντινοῦν τὰ αὐτὰ ταῦτα δεινόν
- `turn_euthydemus_0009`: Fixed idiom; no utterance. Greek: ὡς ἔπος εἰπεῖν
- `turn_euthydemus_0010`: A request that Socrates narrate; speech asked for, none transmitted. Greek: πρῶτον δέ μοι διήγησαι τὴν σοφίαν τοῖν ἀνδροῖν τίς ἐστιν
- `turn_euthydemus_0011`: About the speaker's own capacity and intention to speak. The narration opens at the end of this turn (κατὰ θεὸν γάρ τινα ἔτυχον καθήμενος) but reaches no reported utterance inside it. Greek: ὡς οὐκ ἂν ἔχοιμί γε εἰπεῖν ὅτι οὐ προσεῖχον … καί σοι πειράσομαι ἐξ ἀρχῆς ἅπαντα διηγήσασθαι
- `turn_euthydemus_0030`: Asking whether someone said such things — the accepted Phaedo class (τί οὖν δή ἐστιν ἅττα εἶπεν ὁ ἀνήρ). Recurs at 0032 (εἰ ταῦτ’ εἶπεν), 0033 (ὁ ταῦτ’ εἰπών) and 0035 (ὁ εἰπὼν ταῦτα … αὐτὰ ἐφθέγξατο): all four identify or query a speaker of the deictic ταῦτα without transmitting a word of it. Greek: τί λέγεις σύ, ὦ Σώκρατες; ἐκεῖνο τὸ μειράκιον τοιαῦτ’ ἐφθέγξατο;
- `turn_euthydemus_0041`: An Aeschylean iambic used inside Socrates' own argumentative unit. Ruling: the Phaedo 94d Homer treatment stands — the verse is not a new local turn owner. Greek: ἀτεχνῶς κατὰ τὸ Αἰσχύλου ἰαμβεῖον μόνη ἐν τῇ πρύμνῃ καθῆσθαι τῆς πόλεως, πάντα κυβερνῶσα καὶ πάντων ἄρχουσα πάντα χρήσιμα ποιεῖν
- `turn_euthydemus_0045`: Potential optative addressed to Crito: what he would say. Same at 0047 and 0057 (ἃ φαίη ἄν τις). Greek: τί οὖν ἂν φαίης αὐτῆς ἔργον εἶναι; … οὐ τὴν ὑγίειαν ἂν φαίης;
- `turn_euthydemus_0051`: εἴπερ is the conjunction; a stem-level false hit, not a verb of speaking. Same at 0057. Greek: εἴπερ ἐστὶν αὕτη ἣν ἡμεῖς ζητοῦμεν
- `turn_euthydemus_0055`: Indirect report of a remembered agreement. Flipped from the first pass by the ruling. Greek: ἀγαθὸν δέ γέ που ὡμολογήσαμεν ἀλλήλοις ἐγώ τε καὶ Κλεινίας οὐδὲν εἶναι ἄλλο ἢ ἐπιστήμην τινά
- `turn_euthydemus_0056`: Crito recapping Socrates' immediately preceding on-stage turn by anaphoric οὕτως. Ruling row: ἔφησθα 'you said X' recapping an earlier on-stage turn is No — the printed turn already owns that speech. Greek: ναί, οὕτως ἔλεγες.
- `turn_euthydemus_0058`: A statement about an agreement and about Socrates' reporting of it; content carried only by anaphoric οὕτως. Greek: τότε γοῦν οὕτως ὑμῖν ὡμολογήθη, ὡς σὺ τοὺς λόγους ἀπήγγειλας
- `turn_euthydemus_0065`: A proverb used inside the speaker's own argument, plus a back-reference to his own words. Same class at 0095 (τὸ λεγόμενον δὴ τοῦτο). Greek: ἀτεχνῶς τὸ λεγόμενον ὁ Διὸς Κόρινθος γίγνεται … καὶ ὅπερ ἔλεγον

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. All 33 required turns rest on bounded direct speech with an explicit formula, and 32 of them on a named or first-person formula inside the turn itself. All 62 turns called no were read end to end in Greek. The three first-pass turns the ruling flips (0007, 0055, 0067) were flagged as borderline in that pass for exactly the reason the ruling names, and the ruling's φασί/indirect-report rows decide them cleanly. The only residue is the owner of turn 0043's πάντως δήπου, which is a first-person-plural pair rather than a single siglum — a resolution question for The corpus reported-turn completion campaign, not a scope question, so the disposition does not depend on it.
