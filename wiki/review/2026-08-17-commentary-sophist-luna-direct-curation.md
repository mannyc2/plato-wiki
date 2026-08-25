# Sophist commentary direct curation receipt

- date: 2026-08-17
- curator: Luna / Codex direct semantic curation
- scope: `wiki/commentary/sophist.md`, `comm_sophist_0001`–`comm_sophist_0013`
- source: `raw/plato/greek/sophist.txt`; source refs, Stephanus spans, byte
  offsets, and hashes were resolved and checked against the canonical Greek
  source. The permitted English rendering was used only to check reading-view
  wording.
- evidence: accepted Sophist observations and claims in the canonical ledgers;
  sections without record citations are direct source orientation.

## Decision

The first structural pass was not semantically sufficient: it placed the
difference/non-being explanation too late. Source review corrected `0008` and
`0009`: `251b-259e` now carries communion and difference, while `260a-264b`
now teaches false speech and opinion after that groundwork. `0010` remains the
later return to the sophist as ironic imitator.

The ten section blocks cover the complete dialogue from 216a through 268d in
ascending, non-overlapping spans. Thirteen blocks were reviewed individually:
the ten sections and three source-bound interruptions. The interruptions are
limited to the method preview, the purification turn, and the closing
imitation problem. All accepted blocks are authored model commentary and make
no Opus or external-campaign claim.

## Delta

- sections: 10
- non-section blocks: 3
- reviewed: 13
- accepted: 13
- rejected: 0
- needs_split: 0
- corrected prose: 2 (`0008`, `0009`)
- added blocks: 13

## Verification

Commentary ledger validation passed for Sophist. The full `bun run validate`
command remains blocked by the pre-existing stale `audio/coverage.md` report;
that unrelated generated report was not regenerated or modified. Focused
commentary tests and `git diff --check` were run after the write.
