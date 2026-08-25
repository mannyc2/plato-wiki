# The public-content closure campaign relation-candidate delta — guarded application

## Status

**COMPLETED GUARDED CORPUS APPLICATION.** The fixed writer replayed the V2
decision chain under its cooperative lock, matched all three live preimages,
and installed only the postimages declared below. Its post-write result was
`applied`, with no retained lock.

This is a relation-corpus operation only. It does not change claims,
commentary, voices, audio, compilation, activation, publication, or release
state.

## Sealed decision cohort

- Relation-delta freeze SHA-256:
  `29260bf610d3721839dd70c7f65e92bfbeb6e60c877bedb06cb7798e6714948b`
- V2 adjudication checkpoint: `dff7e97`
- Application checkpoint: `2daac9a`
- V2 adjudication framework SHA-256:
  `998dfc1a7d2dcc2b74039aecdc72b92812825a560cf71e110ee1a83f585f1761`
- No-write materializer SHA-256:
  `38d7a1fda830744aca28a781a7cb3eb23edd2ff33f3a361de7f82306cca46efa`
- Guarded writer SHA-256:
  `93999b5e8c983c92504cb751d64daecda29be3a9cc7590bed8cfa7f488f2c2ff`
- Fresh default dry-run report SHA-256:
  `4d684f38537dc3409e628129a07e140ef82c7e6f5fec5849630623e37341cabc`

The dry run re-opened all 13 V2 private final decisions, which themselves
revalidate their fixed primary and independent inputs. It derived the five
accepted rows directly from their V2 `accepted_relation` payloads; it did not
use a static accepted-candidate set, disposition list, relation kind, basis,
or limits table.

| Packet | Stable candidate key | Final disposition | Relation result |
| --- | --- | --- | --- |
| 001 | `crito::claim_crito_0001::claim_crito_0002` | accept | tension / standing |
| 002 | `cross-dialogue::claim_cratylus_0062::claim_gorgias_0074` | reject | none |
| 003 | `cross-dialogue::claim_gorgias_0074::claim_republic_0078` | accept | restatement / standing |
| 004 | `cross-dialogue::claim_gorgias_0074::claim_republic_0371` | reject | none |
| 005 | `cross-dialogue::claim_gorgias_0074::claim_republic_0774` | reject | none |
| 006 | `cross-dialogue::claim_gorgias_0074::claim_republic_0777` | reject | none |
| 007 | `cross-dialogue::claim_gorgias_0074::claim_statesman_0081` | reject | none |
| 008 | `cross-dialogue::claim_gorgias_0074::claim_theaetetus_0167` | reject | none |
| 009 | `cross-dialogue::claim_laws_0090::claim_republic_0816` | accept | tension / standing |
| 010 | `cross-dialogue::claim_laws_0265::claim_republic_0815` | accept | restatement / standing |
| 011 | `gorgias::claim_gorgias_0039::claim_gorgias_0074` | reject | none |
| 012 | `gorgias::claim_gorgias_0074::claim_gorgias_0076` | reject | none |
| 013 | `laws::claim_laws_1075::claim_laws_1186` | accept | restatement / standing |

## Exact intended mutation

The writer has no path arguments. It may replace only the dynamically present
members of this fixed allowlist: `wiki/relations/crito.md`,
`wiki/relations/cross-dialogue.md`, and `wiki/relations/laws.md`.

| Ledger | Preimage SHA-256 | Expected postimage SHA-256 | Relation records |
| --- | --- | --- | --- |
| `crito` | `a6631b52eecab14d59b1b5c8ffe35145d8ab3212c71b57017fe09ce2486c8ad6` | `41c620dc601a8c361e290eb58237632ed46fcb77b665cbc5ac664c8c13dc9f8b` | 3 → 4 |
| `cross-dialogue` | `9d71b5caad765e8a10190407875a683359cf25b36681d75208fcda1eda0ec60f` | `b147b309c04ed345934c9008ce2b47ee1fd590a5a76ddfa237ec0258434a4d65` | 1294 → 1297 |
| `laws` | `e1f692a0872a3462c143c077231cb314452611539ef4c258b44f295d87f42449` | `51c7f16b17938170aa626db6c6fb5a2f18d33bd4f9c5e67e42258fb057b191b7` | 210 → 211 |

The resulting identifiers are deterministic against those preimages:
`rel_crito_0004` / `pair_crito_00004`; `rel_cross-dialogue_1295` through
`1297` / `pair_cross-dialogue_01295` through `01297`; and
`rel_laws_0211` / `pair_laws_00211`. All five rows have
`review_status: accepted` as the mechanical consequence of their V2 final
acceptance.

## Guard and recovery boundary

The application wrapper uses a fixed cooperative `O_EXCL` lock, repeats the
V2 projection under that lock, verifies regular-file identity and exact
preimages through `lstat` / `O_NOFOLLOW` / `fstat`, writes exclusive
same-directory temporary postimages with file fsync, renames, then
post-verifies installed bytes. This is a cooperative preimage guard, not
hostile-filesystem compare-and-swap or a cross-file atomic transaction. A
failure after any rename is reported as indeterminate and retains the lock for
manual recovery.

## Post-write verification

- Writer result: `applied`; installed paths:
  `wiki/relations/crito.md`, `wiki/relations/cross-dialogue.md`, and
  `wiki/relations/laws.md`.
- Every installed ledger exactly matches the expected postimage in the table:
  Crito `41c620dc…dc9f8b`; cross-dialogue `b147b309…a4d65`; Laws
  `51c7f16b…191b7`.
- The fixed cooperative lock was released (`lockRetained: false`); no
  application lock or temporary file remains.
- The writer's final replay revalidated all 13 V2 decisions, their fixed
  primary/independent input bindings, every accepted relation payload, and all
  three prospective canonical relation ledgers before replacement.
- The matching `wiki/ingest-log.md` entry and repository validation are added
  in this same change set.
