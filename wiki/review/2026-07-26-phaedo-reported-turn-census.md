# Phaedo nested reported-turn census (the Phaedo discourse attribution review step 4)

**Date**: 2026-07-26
**Source**: `raw/plato/greek/phaedo.txt`, sha256
`b98ace9434b77dcf308b1bd617ef54e0da6ec26a7b7aaad06bc6cad3fa8fe4a7`
**Turn index**: `derived/plato/turns/phaedo.toon`, 35 printed-siglum turns
**Status**: reviewed scope census. No record was extracted, accepted, or
compiled by this pass.

## Why this exists

The Phaedo discourse attribution review forbids assuming that only the turns the previous builder happened to
touch matter. All 35 outer turns were scanned and each one carries an explicit
result here, including the 32 zero results. The reported-turn scope census may consume this census
when it establishes a canonical corpus-wide scope manifest; until that manifest
exists, this note is the reviewed record of Phaedo's scope.

## Method

Mechanical scan over each outer turn's exact character span:

- **`{p}` units** — the source's own discourse boundaries, which segment a
  narration turn into utterance units. This is a *candidate* count: `{p}` bounds
  a unit, it does not assert a speaker change, and a reviewed decision may split
  inside one or relate several within one local exchange.
- **reporting cues** — occurrences of `ἔφη`, `ἦ δ᾽ ὅς`, `ἦν δ᾽ ἐγώ`, `εἰπεῖν`,
  `φάναι`, `ἀπεκρίνατο`. Also a candidate count, not a resolution count.

  Two orthographic traps are load-bearing here, both found by independent
  review after a first count got them wrong. The source uses **two elision
  marks** — U+2019 (`δ’`, 67×) and U+1FBD Greek koronis (`δ᾽`, 4×) — and **two
  accentuations of the same pronoun** — `ἦ δ’ ὅς` with acute (57×) and
  `ἦ δ’ ὃς` with grave (6×). A pattern matching only one member of either pair
  silently drops real cues: the first count here missed 10 of them. Any regex
  over this text must accept all four combinations.

Neither number is an ambiguity count, and neither is an extraction ceiling.

## Result

Three of 35 outer turns carry speech nested below their printed siglum. All
three are narrated by Phaedo (`ΦΑΙΔ.`); the frame conversation with Echecrates
carries none.

| turn | siglum | stephanus | chars | nested discourse | `{p}` units | reporting cues |
|---|---|---|---|---|---|---|
| `turn_phaedo_0001` | ΕΧ. | 57a | 152 | **no** | 0 | 0 |
| `turn_phaedo_0002` | ΦΑΙΔ. | 57a | 42 | **no** | 0 | 0 |
| `turn_phaedo_0003` | ΕΧ. | 57a-57b | 405 | **no** | 0 | 0 |
| `turn_phaedo_0004` | ΦΑΙΔ. | 58a | 67 | **no** | 0 | 0 |
| `turn_phaedo_0005` | ΕΧ. | 58a | 158 | **no** | 0 | 0 |
| `turn_phaedo_0006` | ΦΑΙΔ. | 58a | 186 | **no** | 0 | 0 |
| `turn_phaedo_0007` | ΕΧ. | 58a | 26 | **no** | 0 | 0 |
| `turn_phaedo_0008` | ΦΑΙΔ. | 58a-58c | 960 | **no** | 0 | 0 |
| `turn_phaedo_0009` | ΕΧ. | 58c | 212 | **no** | 0 | 0 |
| `turn_phaedo_0010` | ΦΑΙΔ. | 58d | 56 | **no** | 0 | 0 |
| `turn_phaedo_0011` | ΕΧ. | 58d | 98 | **no** | 0 | 0 |
| `turn_phaedo_0012` | ΦΑΙΔ. | 58d | 165 | **no** | 0 | 0 |
| `turn_phaedo_0013` | ΕΧ. | 58d | 142 | **no** | 0 | 0 |
| `turn_phaedo_0014` | ΦΑΙΔ. | 58e-59a | 404 | **no** | 0 | 0 |
| `turn_phaedo_0015` | ΦΑΙΔ. | 59a-59b | 553 | **no** | 0 | 0 |
| `turn_phaedo_0016` | ΕΧ. | 59b | 16 | **no** | 0 | 0 |
| `turn_phaedo_0017` | ΦΑΙΔ. | 59b | 90 | **no** | 0 | 0 |
| `turn_phaedo_0018` | ΕΧ. | 59b | 62 | **no** | 0 | 0 |
| `turn_phaedo_0019` | ΦΑΙΔ. | 59b | 399 | **no** | 0 | 0 |
| `turn_phaedo_0020` | ΕΧ. | 59b | 28 | **no** | 0 | 0 |
| `turn_phaedo_0021` | ΦΑΙΔ. | 59c | 209 | **no** | 0 | 0 |
| `turn_phaedo_0022` | ΕΧ. | 59c | 81 | **no** | 0 | 0 |
| `turn_phaedo_0023` | ΦΑΙΔ. | 59c | 62 | **no** | 0 | 0 |
| `turn_phaedo_0024` | ΕΧ. | 59c | 24 | **no** | 0 | 0 |
| `turn_phaedo_0025` | ΦΑΙΔ. | 59c | 44 | **no** | 0 | 0 |
| `turn_phaedo_0026` | ΕΧ. | 59c | 40 | **no** | 0 | 0 |
| `turn_phaedo_0027` | ΦΑΙΔ. | 59c-88c | 69924 | yes | 347 | 176 |
| `turn_phaedo_0028` | ΕΧ. | 88c-88e | 849 | **no** | 0 | 0 |
| `turn_phaedo_0029` | ΦΑΙΔ. | 88e-89a | 505 | **no** | 0 | 0 |
| `turn_phaedo_0030` | ΕΧ. | 89a | 12 | **no** | 0 | 0 |
| `turn_phaedo_0031` | ΦΑΙΔ. | 89a-102a | 29406 | yes | 113 | 79 |
| `turn_phaedo_0032` | ΕΧ. | 102a | 150 | **no** | 0 | 1 |
| `turn_phaedo_0033` | ΦΑΙΔ. | 102a | 80 | **no** | 0 | 0 |
| `turn_phaedo_0034` | ΕΧ. | 102a | 88 | **no** | 0 | 0 |
| `turn_phaedo_0035` | ΦΑΙΔ. | 102a-118a | 37797 | yes | 132 | 81 |

**Totals**: 3 turns with nested discourse, 32 explicit zero results. 592 `{p}`
candidate units and 336 reporting cues across 137,127 characters.

## The two cue hits in zero-result turns

Both were inspected and are false positives — matrix statements *about* speech,
not reported speech nested inside narration. Neither yields a record.

- `turn_phaedo_0003` (ΕΧ., 57a-57b): `τί οὖν δή ἐστιν ἅττα εἶπεν ὁ ἀνὴρ πρὸ τοῦ
  θανάτου;` — Echecrates asks what Socrates said. The verb reports no utterance
  in this turn.
- `turn_phaedo_0032` (ΕΧ., 102a): `ὡς ἐναργῶς ... εἰπεῖν ἐκεῖνος ταῦτα` —
  Echecrates comments on how vividly Socrates spoke. Indirect statement about
  the manner of speech, with no nested utterance to attribute.

## Comparison with the existing candidate

`wiki/voices/phaedo.md` currently holds 350 unreviewed records, all inside
`turn_phaedo_0027`. Against this census that is:

- 1 of 3 turns with nested discourse;
- 347 of 592 candidate units, so roughly 41% of the dialogue's nested discourse
  has never been extracted at all.

The 288 unresolved records in that partial pass are therefore not a measurement
of Phaedo's ambiguity. They are a measurement of an extractor that resolved a
unit only when its own paragraph carried a naming formula, applied to 59% of
the scope.

## What this census does not establish

- It does not fix the final record count. Reviewed splits inside a `{p}` unit
  and depth-1 narration spans both change it.
- It does not claim any unit is resolvable, or that any is ambiguous.
- It confers no authority on any claim, and Phaedo remains absent from
  `derived/plato/voices/cutovers.toml`.
