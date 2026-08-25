# Lysis Claim Review

Plan: 042 claim ledger layer
Phase: Step 9 corpus rollout
Dialogue: lysis

## Runs

- Extraction profile: `pioneer-pro`
- Review profile: `pioneer-pro`
- Extraction runs:
  - `2026-07-03T22-29-20-459Z_claims-segmented_lysis`
  - `2026-07-03T22-29-44-080Z_claims-segmented_lysis`
  - `2026-07-03T22-30-49-977Z_claims-segmented_lysis`
  - `2026-07-03T22-37-46-785Z_claims-segmented_lysis`
  - `2026-07-03T22-38-56-297Z_claims-segmented_lysis`
- Review runs:
  - `2026-07-03T22-39-58-403Z_claims-review-segmented_lysis`
  - `2026-07-03T22-44-01-575Z_claims-review-segmented_lysis`
  - `2026-07-03T22-46-24-526Z_claims-review-segmented_lysis`
  - `2026-07-03T22-48-02-284Z_claims-review-segmented_lysis`

## Rationale

The review pass checks Lysis claim records for local span support, ordered
stance events, mechanical final-status derivation, and noninterpretive English
content. This note supplies the required rationale artifact for the
review-status writeback recorded in `wiki/ingest-log.md`.

## Result

- accepted: 29
- rejected: 2
- needs_split: 0
- unreviewed: 0
