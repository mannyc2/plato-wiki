# Critias Claim Review

Plan: 042 claim ledger layer
Phase: Step 9 corpus rollout
Dialogue: critias

## Runs

- Extraction profile: `pioneer-pro`
- Review profile: `pioneer-pro`
- Extraction runs:
  - `2026-07-03T21-30-06-666Z_claims-segmented_critias`
  - `2026-07-03T21-31-01-412Z_claims-segmented_critias`
  - `2026-07-03T21-31-19-490Z_claims-segmented_critias`
  - `2026-07-03T21-31-33-718Z_claims-segmented_critias`
- Review runs:
  - `2026-07-03T21-51-05-873Z_claims-review-segmented_critias`
  - `2026-07-03T21-51-55-171Z_claims-review-segmented_critias`
  - `2026-07-03T21-53-16-663Z_claims-review-segmented_critias`

## Rationale

The review pass checks Critias claim records for local span support, ordered
stance events, mechanical final-status derivation, and noninterpretive English
content. This note supplies the required rationale artifact for the
review-status writeback recorded in `wiki/ingest-log.md`.

## Result

- accepted: 22
- rejected: 0
- needs_split: 0
- unreviewed: 0
