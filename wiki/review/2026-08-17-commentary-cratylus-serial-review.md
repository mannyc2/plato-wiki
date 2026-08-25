# Cratylus commentary serial review

dialogue: cratylus
decision: accepted
reviewer: codex-direct-source-review
reviewed_on: 2026-08-17

## Scope and evidence

Reviewed all 57 append-only blocks in `wiki/commentary/cratylus.md` against
the canonical Greek spans 383a–440e in `raw/plato/greek/cratylus.txt`, the
overlapping accepted observation/claim/relation records, and local dossier
citations. The 15 section units and 42 interruptions were checked for exact
source support, voiced interpretation, and listening value.

The required Opus quality-audit lane was not retried after the current
provider monthly-spend-limit receipt at
`scratch/commentary/opus-4-8-provider-block.json`; no model provenance was
fabricated. This is a direct semantic review.

## Acceptance

All 57 blocks (`comm_cratylus_0001`–`comm_cratylus_0057`) are accepted.
Two source-bound prose corrections narrowed potentially overbroad claims:
`comm_cratylus_0008` now says the letter changes occur when a proposed
meaning needs help, and `comm_cratylus_0018` describes the slave-renaming
example as authority imposed by the household rather than asserting an
unsupported psychological claim. No block was removed or split.

## Validation

The ledger retains stable IDs and canonical source anchors; focused ledger
validation and `git diff --check` are required after this receipt is paired
with the status changes.
