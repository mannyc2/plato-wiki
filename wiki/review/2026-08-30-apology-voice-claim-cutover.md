# Apology voice and claim-speaker hard cut

**Reviewer**: Codex reconciliation of the exhaustive source-first and
record-first findings against `raw/plato/greek/apology.txt` only.

## Decision

Register and resolve the source-identified old accusers, Callias, Meletus,
Thetis, Achilles, and Athenian jurors. Every adjudicated record carries a
hashed local Greek context and at least two locally plausible candidates. The
depth-1 frame begins at the canonical `{17a}` marker at character 6, excluding
the `{sp1} ` presentation prefix. Activate Apology so the reviewed terminal
owners become the materialized speakers of accepted claims.

## Method

No translation, doctrine, or style evidence was used. The cutover is a hard
replacement with no fallback or compatibility identity.

## Verification

PASS. The accepted voice index contains 30 records. Five formerly blocking
claims now carry exact, contained, hash-checked owner anchors recorded
item-by-item in `2026-08-30-apology-claim-speaker-anchors.json` (SHA-256
`fa8eef45bb5a763ee8cb1ab7485c09344e9e0feece514d0a34b4740489b5156b`).
The reviewed migration applied 29 speaker changes with zero accepted blockers;
verification proves all 29 accepted claims match current authority. The
materialized join contains 95 record rows and 31 stance rows.

Final artifact hashes before this receipt was closed:

- voice index: `5cb21f4a34096a8b2570aab5c415be6a8e50dca3b82f79d7eb42c628662139e9`
- claim ledger: `f85cd2f895e309b5300c75c8c18c9290e53ba4c476d79bd8d56d27c01568697b`
- migration plan: `f304efc4e575c14553c5abbe8639039d2d7b5c15b70ea4833e8d3fb2b9574420`
- voice join: `dfb75eb15ebc0c26e33a34c03ae00fd64131334d40d116cf175e9ce3eeb49263`
