# Ion Claim Review

Plan: 042 claim ledger layer
Phase: Step 9 corpus rollout
Dialogue: ion

## Runs

- Extraction profile: `pioneer-pro`
- Review profile: `pioneer-pro`
- Extraction runs:
  - `2026-07-03T20-54-07-094Z_claims-segmented_ion`
  - `2026-07-03T20-55-03-693Z_claims-segmented_ion`
  - `2026-07-03T21-01-12-985Z_claims-segmented_ion`
- Review runs:
  - `2026-07-03T21-07-03-707Z_claims-review-segmented_ion`
  - `2026-07-03T21-09-07-287Z_claims-review-segmented_ion`

## Rationale

The review pass checked the 30 Ion claim records for local span support,
ordered stance events, mechanical final-status derivation, and noninterpretive
English content. Each record was accepted by the review harness.

This note supplies the required rationale artifact for the review-status
writeback recorded in `wiki/ingest-log.md`; it does not add a new extraction
standard beyond the claim ledger rollout and the claim review prompt.

## Result

- accepted: 30
- rejected: 0
- needs_split: 0
- unreviewed: 0
