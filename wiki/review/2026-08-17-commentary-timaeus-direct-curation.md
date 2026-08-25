# Timaeus direct-Luna curation receipt

- date: 2026-08-17
- scope: `wiki/commentary/timaeus.md`
- source: `raw/plato/greek/timaeus.txt`
- curator: direct Luna session
- model attribution: `author: model`; no Opus or Claude campaign was used or claimed

## Decision

The first structural-only pass is rejected: it assigned the 42d–45c mortal-
body passage to elements and receptacle, 53a–56d to persuasion of necessity,
and 60d–64b to construction of the world's body. After direct semantic review
against the Greek source, those bodies were repaired. Accept the complete
Timaeus commentary ledger: 21 ascending, strictly
non-overlapping section blocks cover 17a through 92c, with no non-section
interruptions. The prose treats the cosmological narrative as an eikos logos,
keeps the receptacle and necessity distinct from settled doctrine, and follows
the dialogue's transitions through the proem, transmission story, demiurge and
world soul, elements, receptacle, embodiment, disease, and final synthesis.

## Anchor evidence

The following is the reviewed section boundary table. `start` and `end` are
the exact source offsets used in each block's `source_ref`; each end is the
next marker after the named terminal marker, so adjacent rows tile without
overlap.

| block | span | start | end |
|---:|---|---:|---:|
| 0001 | 17a-20d | 0 | 6940 |
| 0002 | 20e-23c | 6940 | 12835 |
| 0003 | 23d-26d | 12835 | 19155 |
| 0004 | 26e-29d | 19155 | 23965 |
| 0005 | 29e-32b | 23965 | 27702 |
| 0006 | 32c-35b | 27702 | 31791 |
| 0007 | 35c-38e | 31791 | 38035 |
| 0008 | 39a-42c | 38035 | 45480 |
| 0009 | 42d-45c | 45480 | 51776 |
| 0010 | 45d-48e | 51776 | 58342 |
| 0011 | 49a-52e | 58342 | 66547 |
| 0012 | 53a-56d | 66547 | 74380 |
| 0013 | 56e-60c | 74380 | 82372 |
| 0014 | 60d-64b | 82372 | 90152 |
| 0015 | 64c-68e | 90152 | 99429 |
| 0016 | 69a-72e | 99429 | 107627 |
| 0017 | 73a-76e | 107627 | 116011 |
| 0018 | 77a-80e | 116011 | 124298 |
| 0019 | 81a-84e | 124298 | 132625 |
| 0020 | 85a-88e | 132625 | 140832 |
| 0021 | 89a-92c | 140832 | 148409 |

High-risk source review explicitly checked the proem's request for an account
in motion (17a-20d), the Egyptian transmission and catastrophe framing
(20e-26d), the likely-account qualification and demiurge (26e-32b), the
the mortal-body assignment (42d-45c), the receptacle and necessity transition
(45d-56d), elemental geometry (53a-60c), sensory qualities (60d-64b), and the
disease/final-life synthesis (81a-92c) against the Greek text at each listed
boundary. Every row's SHA-256
and marker pair is independently recomputed by the validator.

## Validation

- `validateCommentaryLedger("wiki/commentary/timaeus.md", ..., buildCommentaryCitationIndex())`: **0 issues**.
- Focused site suite `bun test packages/harness/src/site.test.ts`: **79 pass, 0 fail**.
- `git diff --check -- wiki/commentary/timaeus.md wiki/review/2026-08-17-commentary-timaeus-direct-curation.md`: **clean**.

No code, configuration, audit, campaign artifact, generated aggregate report,
or other dialogue file was changed.
