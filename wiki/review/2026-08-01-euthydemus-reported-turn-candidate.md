# euthydemus: reported-turn candidate rebuild and one voice-siglum registration

**Date**: 2026-08-01
**Plan**: 079 wave 1 (Euthydemus)
**Source**: `raw/plato/greek/euthydemus.txt`, sha256 `23536f3045b3c14d919bfc41e21a18e2bb7903cd34408d17e1ab08801ab9df14`
**Turn index**: `derived/plato/turns/euthydemus.toon`, sha256 `114215016db5ab4c3c5d0a00e15cd6073bd51f28de0fdc2114ed8fc7e3a4c6ad`
**Scope receipt**: `wiki/review/2026-07-26-euthydemus-reported-turn-scope-census.md`, sha256 `fbf09d33b0f09fa3a9fcf8cac079440f453b150a762f6f94978f3352673c2b86`

This note covers two things landed together: the rebuilt **unreviewed** candidate
in `wiki/voices/euthydemus.md`, and the one registry addition it needs. **No
record changed `review_status`.** The whole cohort is `unreviewed`, exactly as it
was before, so this note carries no acceptance and confers no authority on any
claim, join, or compiled index.

## 1. Registration: `ΛΟΓΟΓΡ.` for euthydemus

Added to `derived/plato/voices/sigla.toml` under the corpus reported-turn completion campaign's operator ruling of
2026-08-01, which authorises voice-siglum registration inside that plan under the
discipline the prior blocks set (hand-written, never scripted; alphabetical;
licensing Greek quoted verbatim with its byte offset; dated note and ingest-log
entry in the same commit).

**Who.** The one forensic speech-writer who accosts Crito, inside Crito's own
printed narration at 304d (`turn_euthydemus_0081`).

**Licensing construction**, char 70819-70943:

```text
προσελθών τίς μοι περιπατοῦντι, ἀνὴρ οἰόμενος πάνυ εἶναι σοφός (70838),
τούτων τις τῶν περὶ τοὺς λόγους τοὺς εἰς τὰ δικαστήρια δεινῶν, ὦ Κρίτων, ἔφη (70870)
```

The role-denoting phrase is the **nominative subject** of `ἔφη`, which introduces
the direct question `οὐδὲν ἀκροᾷ τῶνδε τῶν σοφῶν;`. Checked against all three
parts of the `role_reporting_formula` test in `docs/voices-protocol.md` as
amended 2026-07-29, rather than assumed:

1. **Subject of the reporting construction.** Nominative subject of the finite
   `ἔφη`, not an accusative object of a governing verb — the trap the amendment
   names for Symposium 213b does not arise here.
2. **One specific individual by role.** `τούτων τις` is indefinite, which the
   amendment says does not disqualify a role phrase: Greek introduces a
   first-mentioned individual that way. The genuine plural `τῶν … δεινῶν` is the
   class he is drawn from, not a collective speaker.
3. **A registered siglum for this dialogue.** True from this commit, and only
   from this commit.

It is **not** a `named_reporting_formula`: the source prints no name here and
never does. The form was checked for collision before use — `ΛΟΓΟΓΡ.` appears
nowhere in `derived/plato/turns/sigla.toml` and nowhere else in
`derived/plato/voices/sigla.toml`.

Exactly **one** record carries this formula. The role phrase occurs once; his
four later utterances are never re-identified and resolve by
`reviewed_attribution` instead.

**Why registration was necessary rather than convenient.** The man speaks again
at 304d-305b (`καὶ μήν, ἔφη`; `τί δὲ ἄλλο, ἦ δ᾽ ὅς`; `ποῖον, ἔφη`;
`ἀλλὰ γάρ, ὦ Κρίτων, ἔφη` at 71787) without being re-identified. Those acts are
third person, and Crito narrates in the first person and marks his own replies so
(`ἦν δ᾽ ἐγώ`, `κἀγὼ εἶπον`, `ἔφην`), so Crito is excluded from them. Before
registration the spans had exactly one locally plausible owner and no id for him:
they could be neither resolved nor honestly left ambiguous, because
`candidate_owners` needs two registered owners and inventing a second would have
named an owner that is not locally plausible. That is the inexpressibility the
plan's ruling exists to remove.

**Scope of the id.** It denotes this one man. `τίς` and `τούτων τις` introduce a
first-mentioned individual, which the 2026-07-29 amendment says does not
disqualify a role phrase; the genuine plural `τῶν … δεινῶν` is the class he is
drawn from, not a collective speaker. `ΛΟΓΟΓΡ.` must not be reused for another
unnamed speaker.

**Form.** The source never prints `λογογράφος`. The dialogue's own word for the
trade is `λογοποιός` (289c-290a), which Socrates uses for a class and not for
this man, so the id is deliberately distinct from it and from every printed
siglum in the corpus. Registration licenses nothing by itself; every attribution
still cites its own evidence.

## 2. The rebuilt candidate

`scripts/voices-2026-07/build-euthydemus-voice-ledger.ts`, rewritten onto
`scripts/voices-2026-07/lib/`. It replaces a candidate that covered outer turns
0012-0029 only, had no coverage gate, and gave no unresolved record a candidate
owner.

| | before | after |
|---|---|---|
| required outer turns covered | 18 of 33 | 33 of 33 |
| records | 305 | 655 |
| resolved | — | 275 |
| unresolved | — | 380, every one with candidate owners |
| coverage gate | none | unit gate + act gate, both fail-closed |

Resolutions by route: 33 `printed_siglum` (depth 1), 62 `named_reporting_formula`,
1 `role_reporting_formula`, 129 `person_marked_reporting_formula` (the narrator's
own reported utterances), 43 `anchored_dialogue_turn`, 8 `reviewed_attribution`.

**The four declarations of the 2026-07-29 amendment** are in the builder's header
comment and in the plan's `Wave 1 — euthydemus` subsection. In brief: the
enumeration basis is the source's own `{p}` + em-dash partition (631 units across
the 33 turns); the invariant is that every unit must be covered by an
adjudicating record or a byte-exact exemption and every discovered reporting act
must be consumed; exemptions are seven `UnitExemption`s and three
`ReportingActExemption`s carrying sha256, excerpt and a named grammatical ground;
and the detection test was observed failing on an injected act.

**Genuine ambiguity is the majority result and that is the finding.** 380 of 622
depth-2 spans are unresolved. The eristic displays run four ways — Socrates,
Euthydemus, Dionysodorus, Ctesippus — and Plato writes most of their turns with a
bare `ἔφη`, `ἦ δ᾽ ὅς` or no formula at all. Nothing in this candidate fills such a
span from doctrine, content, style, translation, an editor's label, or from who
spoke last, and the preceding formula's own named subject is never cited as an
antecedent.

## What this does not establish

- No `review_status` changed; nothing here is accepted.
- No compiled index, no join, no cutover, no claim, observation, relation,
  commentary or audio artifact changed.
- Registration of `ΛΟΓΟΓΡ.` asserts nothing about the source and decides no
  attribution.
