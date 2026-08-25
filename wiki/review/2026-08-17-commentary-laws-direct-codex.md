# Laws commentary direct curation

- date: 2026-08-17
- scope: `wiki/commentary/laws.md`, all 68 section blocks (`comm_laws_0001` through `comm_laws_0068`)
- reviewer: Luna, direct Codex curation
- canonical source: `raw/plato/greek/laws.txt`, SHA-256 `43aa8380889539e393dbb536684bcbc71d797d0780a3c62c9bf2436068cdd2f7`
- review basis: exact Greek spans, the permitted English rendering, and accepted observations, claims, relations, and dossiers cited by each block

## Decision

All 68 active section blocks were read serially and assigned a terminal
disposition. All 68 are accepted; none were rejected, split, or added. Stable
IDs and source placements are unchanged.

Two source-bound corrections were made during review. `comm_laws_0040` no
longer says that motion occurs for an infant in the womb: it now distinguishes
continuous nursing and motion for newborns from the calm-middle-way counsel
for pregnancy. `comm_laws_0068` no longer calls the nocturnal council a device
that makes laws irreversible; it describes the council's stated role as
guarding the laws over time. The ledger header now records this direct review
and does not claim campaign or Opus provenance.

No new non-section interruption was warranted: the 68 existing section units
already provide continuous, source-anchored orientation, and adding blocks
merely to increase count would interrupt the reading without a material gain.

## Verification

- source refs, offsets, spans, hashes, citations, and terminal statuses checked by the focused commentary validator
- `git diff --check` passed
