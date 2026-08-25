# parmenides: nested reported-turn scope census

**Date**: 2026-07-26
**Plan**: 078 step 3 (corpus scope census)
**Source**: `raw/plato/greek/parmenides.txt`, sha256 `63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2`
**Turn index**: `derived/plato/turns/parmenides.toon`, sha256 `c1bfc9f484b4754590e47e16e0dfa83b6b6c5c3077349701d52c4ac67f5b93c4`, 1 printed-siglum turn(s)
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

Candidate hits located and inspected: 125.
Turns with no cue and no quotation marker: 0.

No translation, doctrine, or style evidence was used. No English text, modern
editor's or translator's speaker label, doctrinal expectation, or stylistic
impression entered any decision recorded here.

## Result

1 of 1 outer turns carry nested reported turns:

| outer turn | printed siglum |
| --- | --- |
| `turn_parmenides_0001` | (none) |

The remaining 0 outer turn(s) are explicit zero results.

### Owners not registered for this dialogue

These required turns transmit direct speech whose owner has no siglum in
`derived/plato/voices/sigla.toml`. Extraction must record them with an
`unresolved` owner or register the speaker first; it must never leave the words
with the printed siglum.

- `turn_parmenides_0001`

## Ambiguous boundary decisions

- `turn_parmenides_0001` → **yes**: 126a-126b. Cephalus, the outer narrator, reporting his own utterances inside his own narration — the ἦν δ’ ἐγώ shape, which the ruling's Phaedo 88c case expressly preserves for a narrator (and denies only to a printed speaker's self-quotation). Genuinely uncertain only because parmenides prints no siglum at all: derived/plato/turns/sigla.toml gives it sigla = [], so the turn's printed speaker is (none) and the 'transmitted below the printed speaker' test has no printed speaker to sit below. It is a record-level question about how Cephalus's own utterances get a chain, and it does not drive the turn's disposition, which is yes on the Adeimantus speech alone. Greek: {p} ἀλλὰ μὲν δή, εἶπον ἐγώ, πάρειμί γε ἐπ’ αὐτὸ τοῦτο, δεησόμενος ὑμῶν. … {p} καὶ ἐγὼ εἶπον· τῷ ἀδελφῷ ὑμῶν τῷ ὁμομητρίῳ τί ἦν ὄνομα;

## Inspected cue hits that yield no reported turn

- `turn_parmenides_0001`: 128b. Socrates summarizing Parmenides' and Zeno's written positions in indirect discourse while he holds the floor. Ruling case 'Φίληβος φησι + content': no, because the Greek transmits no bounded direct speech by either man here. Greek: ὅδε δὲ αὖ οὐ πολλά φησιν εἶναι … τὸ οὖν τὸν μὲν ἓν φάναι, τὸν δὲ μὴ πολλά, καὶ οὕτως ἑκάτερον λέγειν
- `turn_parmenides_0001`: 128e. Zeno referring back to his own words earlier in this same conversation. Ruling case Phaedo 88c: a speaker's quoted self-reference stays inside their own turn. Same for Parmenides at 135d-135e (πρὸς τοῦτον ἠγάσθην εἰπόντος, ὅτι οὐκ εἴας …), which recaps Socrates' on-stage speech at 129b-130a: ruling case ἔφησθα, no — the original span already owns it. Greek: ἐπεί, ὅπερ γ’ εἶπον, οὐ κακῶς ἀπῄκασας
- `turn_parmenides_0001`: ὁ λόγος occurs 6 times and never speaks: it is 'the argument compels' and 'the account is about something else'. Ruling case personified ὁ λόγος: no by default, and nothing here stages a bounded prosopopoeia comparable to the Laws in Crito. Greek: οὔκουν δή, ὥς γε ὁ λόγος αἱρεῖ. / εἰ μέντοι … ἀλλὰ περὶ ἄλλου του ὁ λόγος
- `turn_parmenides_0001`: 133b. An indefinite hypothetical objector in a potential-optative protasis; Parmenides never yields the floor and no direct speech is transmitted. Closest ruling case is bare φασί + accusative-and-infinitive with no named subject: no. Greek: εἴ τις φαίη μηδὲ προσήκειν αὐτὰ γιγνώσκεσθαι ὄντα τοιαῦτα οἷά φαμεν δεῖν εἶναι τὰ εἴδη
- `turn_parmenides_0001`: 136e-137a. The single external-poet reference in the dialogue, and it quotes no words at all — Parmenides compares himself to Ibycus's horse inside his own argument. Not the Ion 537a / Sophist 237a whole-turn-quotation case; it does not even reach the Phaedo 94d Homer case, which at least had cited verse. Greek: καίτοι δοκῶ μοι τὸ τοῦ Ἰβυκείου ἵππου πεπονθέναι
- `turn_parmenides_0001`: 143c. Complementary infinitive inside the deduction's own argument. No utterance transmitted, no owner shift. Same class throughout the deductions: 142c (ὅμοιον ἂν ἦν λέγειν ἕν τε εἶναι), 147d, 152e/153a/154b (οὐκ ἔχω λέγειν, ἔχεις λέγειν), 160c (πᾶν τοὐναντίον ἐστὶν εἰπεῖν), 161d (ἔχεις οὖν τι ἄλλο εἰπεῖν), 161e-162a (ἀληθῆ λέγειν … ἀνάγκη ἡμῖν φάναι καὶ ὄντα λέγειν). Greek: ἔστιν οὐσίαν εἰπεῖν; ἔστιν. καὶ αὖθις εἰπεῖν ἕν;
- `turn_parmenides_0001`: 160c-160e. λέγει asks what the hypothesis signifies; the subject is the formula, not a person. Statement about signification, not transmitted speech — the class the accepted Phaedo census already ruled out at τί … εἶπεν ὁ ἀνήρ. Greek: οὐκοῦν καὶ νῦν δηλοῖ ὅτι ἕτερον λέγει τῶν ἄλλων τὸ μὴ ὄν, ὅταν εἴπῃ ἓν εἰ μὴ ἔστι, καὶ ἴσμεν ὃ λέγει;

## What this census does not establish

- It does not fix a record count. Reviewed splits inside a discourse unit and
  depth-1 narration spans both change it.
- It does not claim any span is resolvable, or that any is ambiguous.
- It confers no authority on any claim, creates no join, and activates nothing in
  `derived/plato/voices/cutovers.toml`.
- It becomes stale, and `CMP-REPORTED-TURNS` fails, if either hash above changes.

## Reviewer confidence

high. The disposition rests on many independent named-formula direct-speech spans, and every one of the ruling's seven cases either does not occur in parmenides or falls on the 'no' side without touching those spans. The one borderline entry concerns how Cephalus's own utterances are chained, not whether the turn is required.
