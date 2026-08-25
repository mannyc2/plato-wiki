# Commentary review: Crito Opus pilot pruning

Date: 2026-07-17

## Scope

This pass finishes the Crito editorial surgery already in progress without
starting another dialogue. It preserves all twenty append-only commentary IDs,
retains eleven active blocks, and terminally rejects nine legacy draft blocks:

- `comm_crito_0007`
- `comm_crito_0008`
- `comm_crito_0010`
- `comm_crito_0011`
- `comm_crito_0012`
- `comm_crito_0014`
- `comm_crito_0015`
- `comm_crito_0016`
- `comm_crito_0018`

The rejected records remain in the canonical ledger and its full-file hash as
historical provenance. They are excluded from active commentary, pending
counts, screenplay generation, and audio production.

## Editorial provenance

The eleven-block base candidate was authored with `claude-opus-4-8` at high
effort and captured without canonical writes:

- candidate:
  `scratch/commentary/editorial-candidates/crito-opus-prune-v2.json`
- candidate SHA-256:
  `6c66c8375be23b278ef05e455d365085e915fdcf8f88bf8d9a7faabb2b475bd1`
- base high-effort audit:
  `scratch/commentary/editorial-candidates/crito-opus-prune-v2-audit.json`

That audit required repairs to `comm_crito_0002` and `comm_crito_0004`.
Independent record checking also found bounded citation or wording defects in
`comm_crito_0009`, `comm_crito_0005`, `comm_crito_0019`, and
`comm_crito_0006`. Opus 4.8 repaired exactly those six at medium effort:

- repair:
  `scratch/commentary/editorial-candidates/crito-opus-prune-v3-repair.json`
- repair SHA-256:
  `a87d52fc83fe40a804f2cc21d30569bd66287052f6194989be0f4578acb12118`
- final high-effort audit:
  `scratch/commentary/editorial-candidates/crito-opus-prune-v3-repair-audit.json`
- final verdict: all six repaired blocks passed; the five unchanged retained
  blocks had passed the base audit.

All eleven retained blocks now carry explicit, hash-bound Crito turn insertion
metadata. Reported speech remains owned by the active speaking character; the
commentary changes do not create a separate voice for a reported character.

## Decision

Set the nine redundant legacy draft blocks listed above to `rejected`. Keep the
eleven retained Opus blocks `unreviewed` for the operator's live production-site
review; the Opus audits establish editorial evidence but do not impersonate the
operator's final publication acceptance. No Crito audio render is authorized by
this note.
