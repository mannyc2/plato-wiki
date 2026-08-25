# The public-content closure campaign relation decisions

**Status: applied and verified.** Twenty-two existing relations received a
terminal source-backed disposition. This receipt is the canonical decision
provenance; temporary review and adjudication files were retired.

## Accepted decisions

| Ledger | Accepted | Rejected |
| --- | --- | --- |
| `wiki/relations/cross-dialogue.md` | `rel_cross-dialogue_0377` | `rel_cross-dialogue_0149`, `0150`, `0254`, `0255`, `0256`, `0257`, `0258`, `0259`, `0260`, `0261`, `0371`, `0412`, `0714`, `0876`, `0918`, `1235` |
| `wiki/relations/laws.md` | — | `rel_laws_0153` |
| `wiki/relations/parmenides.md` | `rel_parmenides_0010` | `rel_parmenides_0011` |
| `wiki/relations/phaedo.md` | — | `rel_phaedo_0045` |
| `wiki/relations/protagoras.md` | `rel_protagoras_0001` | — |

Each canonical relation row contains the stable claim pair, kind, resolution,
basis, limits, and source-backed claim references reviewed for this decision.
Two independent semantic reviews covered all 22 rows; a final comparison
resolved disagreements. No translation was used.

The only corpus delta is 22 `needs_split` transitions: three to `accepted` and
nineteen to `rejected`. No record body, ID, pair ID, claim link, kind,
resolution, basis, limit, source reference, or order changed.

## Validation

- All five installed relation ledgers passed canonical relation validation.
- The current completeness report was regenerated from the canonical ledgers.
- `bun run test`, `bun run typecheck`, `bun run validate`, and
  `git diff --check` passed at application time.
- No claim split, relation candidate generation, commentary, voice, audio,
  release, deployment, or external-service action occurred.
