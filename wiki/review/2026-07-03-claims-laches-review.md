# Laches Claim Review

Plan: 042 claim ledger layer
Phase: Step 9 corpus rollout
Dialogue: laches

## Runs

- Extraction profile: `pioneer-pro`
- Review profile: `pioneer-pro`
- Extraction runs:
  - `2026-07-03T22-10-49-067Z_claims-segmented_laches`
  - `2026-07-03T22-11-33-085Z_claims-segmented_laches`
  - `2026-07-03T22-12-06-955Z_claims-segmented_laches`
  - `2026-07-03T22-19-33-671Z_claims-segmented_laches`
  - `2026-07-03T22-20-28-515Z_claims-segmented_laches`
- Review runs:
  - `2026-07-03T22-21-49-366Z_claims-review-segmented_laches`
  - `2026-07-03T22-22-42-025Z_claims-review-segmented_laches`
  - `2026-07-03T22-23-38-291Z_claims-review-segmented_laches`
  - `2026-07-03T22-26-29-333Z_claims-review-segmented_laches`

## Rationale

The review pass checks Laches claim records for local span support, ordered
stance events, mechanical final-status derivation, and noninterpretive English
content. This note supplies the required rationale artifact for the
review-status writeback recorded in `wiki/ingest-log.md`.

## Result

- accepted: 35
- rejected: 2
- needs_split: 0
- unreviewed: 0
