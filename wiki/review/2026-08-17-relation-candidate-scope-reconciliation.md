# Relation candidate-scope reconciliation

- date: 2026-08-17
- scope: `cross-dialogue` relations and `claim_symposium_0133`
- source: `raw/plato/greek/symposium.txt`, 206e (`71791..72108`, SHA-256 `1bc78b5d90317a048bd9cf9f808e8b7cf4796bf8c747c95ea858d1651246b9c6`)

## Decision

`claim_symposium_0133` retains the short source term `ἔρως` alongside its
bounded 206e phrase. This restores the existing four cross-dialogue candidate
keys whose lexical bridge is Eros without changing the claim's content,
attribution, stance, final status, or review status.

Removed the three rejected relation rows whose claimed candidate keys no longer
exist in the current deterministic scope:

- `rel_cross-dialogue_0024` — its former Symposium-side bridge was excluded
  from `claim_symposium_0113` by the accepted voice correction.
- `rel_cross-dialogue_1039` and `rel_cross-dialogue_1041` — their
  Symposium-side claim `claim_symposium_0116` is rejected.

No accepted relation was removed. The remaining `claim_symposium_0133` rows
are again current candidates because their exact source term is now represented
as a short ledger term.

## Verification

- `bun run harness relations candidates` reports `cross-dialogue: 1302`.
- Focused cross-dialogue ledger validation and the knowledge-base completeness
  report confirm exact current candidate-key coverage after this change.
