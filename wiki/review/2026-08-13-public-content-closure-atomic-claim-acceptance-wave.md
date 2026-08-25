# The public-content closure campaign atomic claim decisions

**Status: applied and verified.** Four existing claims changed only from
`needs_split` to `accepted` after direct source review. This receipt is the
canonical decision provenance; temporary review and adjudication files were
retired.

## Accepted decisions

| Claim | Ledger | Decision |
| --- | --- | --- |
| `claim_laws_0014` | `wiki/claims/laws.md` | `needs_split` -> `accepted` |
| `claim_republic_0688` | `wiki/claims/republic.md` | `needs_split` -> `accepted` |
| `claim_symposium_0016` | `wiki/claims/symposium.md` | `needs_split` -> `accepted` |
| `claim_theaetetus_0055` | `wiki/claims/theaetetus.md` | `needs_split` -> `accepted` |

Each canonical row already contains its Greek source references, content,
stance event, terms, and limits. Two independent source-bound reviews checked
each row; a final semantic comparison resolved three reviewer disagreements in
favor of acceptance. No translation was used.

No claim ID, source reference, content, stance event, term, limit, order, or
relation row changed. The only corpus delta is four terminal review-status
transitions. The required Symposium voice join was regenerated only to bind the
new claim-ledger hash and status; no voice attribution changed.

## Validation

- All four claim ledgers passed canonical claim validation.
- The regenerated Symposium join passed voice/claim consistency validation.
- `bun run test`, `bun run typecheck`, `bun run validate`, and
  `git diff --check` passed at application time.
- No commentary, audio, reported-turn, release, deployment, or external-service
  action occurred.
