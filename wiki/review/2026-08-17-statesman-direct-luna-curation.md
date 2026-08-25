# Statesman direct-Luna commentary curation

Date: 2026-08-17

## Scope and decision

The initial structural pass required semantic repair. Source review corrected
sections `0004`–`0008`: `261e-264b` now covers disciplined species/part and
early herd cuts; `264c-268c` completes the biped/human-herder cut and its rival
claimants without importing the later myth; `268d-274e` is the cosmic reversal myth;
`275a-277a` introduces the paradigm and letters; and `277b-283b` develops
weaving as the political paradigm.

Luna reviewed `wiki/commentary/statesman.md` directly against the canonical
Greek source `raw/plato/greek/statesman.txt`, the permitted English rendering
used only for reading-view orientation, and accepted Statesman observations,
claims, relations, and dossiers. No Opus or Claude campaign, writing audit,
campaign scratch, or inherited acceptance was used. The 23 blocks were
accepted in this change set.

| kind | count | disposition |
| --- | ---: | --- |
| section | 13 | accepted |
| non-section | 10 | accepted |
| total | 23 | accepted |
| rejected | 0 | none |
| needs_split | 0 | none |
| corrected prose | 5 (`0004`–`0008`) | semantic repair |

The 13 section spans are strictly ascending and non-overlapping and cover the
complete source span 257a–311c. The ten non-section blocks are bounded,
source-specific interruptions placed inside those units. Every block has a
sequential stable id, a recomputed source reference with offsets and SHA-256,
valid placement, and `author: model`.

## Review checks

Luna checked each body for source fidelity, single-job focus, voiced
interpretation, and listening value; checked citations against accepted
canonical claim records; and checked every source reference against the Greek
byte offsets. The focused commentary validator returned zero issues, briefs
generation completed for all 13 units, and `git diff --check` passed.

The repository-wide `bun run validate` remains blocked by the pre-existing
stale `audio/coverage.md` report. Per scope instruction, this receipt does not
touch `wiki/ingest-log.md`, audits, shared generated reports, campaign files,
or code/config. That stale audio report is the only validation blocker known
after the focused Statesman checks.

Source SHA-256: `f31b15a667c9c31b5b2d1e138310af71f442dabc65d284348733dae467ef85e9`
Ledger SHA-256 at review: `380c72687a8c36cf7ef4ab9f343c119aea6685c0528d6c202466dc1bd59857a9`

Operator decision: accept the complete Statesman commentary ledger as direct
Luna curation.
