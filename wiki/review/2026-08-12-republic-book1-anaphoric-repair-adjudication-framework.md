# Republic Book 1 targeted anaphoric-repair adjudication framework provenance

This is a mechanical-provenance receipt for a private, packet-level
adjudication payload boundary. It is not a semantic adjudication, a canonical
ledger change, a review-status change, or an acceptance decision.

## Retained frozen inputs

| input | SHA-256 / boundary / count |
| --- | --- |
| Republic ledger | `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be` |
| Republic Greek source | `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`; UTF-16 length `557124` |
| required outer turn | `turn_republic_0001` `[0,557124)` |
| Book 1 repair window | `[0,59068)` |
| targeted-repair freeze / manifest | `f6866e611481c545092986bd46707e420771c840d06d15b0d4c8e483f456167f` / `5601fc44213a0d411582388fa433ebd8caea3fd520ecc54a66b7a928130b87e7` |
| target inventory JSON / records | `cca2267d923bc7c1f9844709c7a5838a601026721cf534a22f90f1446adddd0d` / `4860d08d7e86a4f15ac90e8100e4686916b641dbc67956d011d7ee49e38ec3b1` |
| target ID sequence / scope | `10b24af84e23a94532ae5afd3aa452036d454385f4abaa42060a29a76c11cda4` / 114 rows in 7 packets |
| V4 review-framework interface | `4852287a96ddb9e4198689637c518818a60e54449881bb611ba49fa8b82ce49c` |

## Adjudication contract seal

The adjudication-framework SHA-256 is
`98d1873bbbcf1a083a921d7ac5fbd6f75a0ae6877938e270988a2bfb6fd4a068`.
It binds the exact ordered bytes of:

1. `.wave2-scratch/coord/republic-b1-repair/adjudication-lib.ts`
2. `.wave2-scratch/coord/republic-b1-repair/adjudication-schema.json`
3. `.wave2-scratch/coord/republic-b1-repair/verify-repair-adjudication.ts`
4. `.wave2-scratch/coord/republic-b1-repair/make-pending-adjudication-scaffold.ts`

Fresh private adjudications must use schema version 1 and the ignored
`adjudications/v1/` namespace. The verifier requires an exact current V4
review-framework digest and byte-hardened, role-checked primary and independent
V4 inputs for the same frozen packet. It binds their raw SHA-256 values, the
full frozen packet header, and each target's source order, current ranges, and
pre-edit block hash.

An adjudicator may make a third V4-shaped source-bound decision rather than
only select an input. The mechanical contract excludes `split` and `remove`,
topology actions, status or acceptance fields, canonical/apply operations,
compilation, joins, cutovers, claim-speaker migration, and activation. It
writes nothing. Its private reader rejects path escape, symlinked components,
identity drift, malformed UTF-8, a BOM, and duplicate JSON object keys.

## Mechanical verification

The following checks passed against the sealed interface:

```text
bun .wave2-scratch/coord/republic-b1-repair/adjudication-self-check.ts
bun -e 'JSON.parse(await Bun.file(".wave2-scratch/coord/republic-b1-repair/adjudication-schema.json").text()); console.log("schema JSON OK")'
bun .wave2-scratch/coord/republic-b1-repair/self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/verify-repair-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
bun -e 'import { adjudicationFrameworkSha256 } from "./.wave2-scratch/coord/republic-b1-repair/adjudication-lib.ts"; console.log(adjudicationFrameworkSha256())'
```

The synthetic adjudication self-check covered interface membership/order and
byte sensitivity, V4 delegation, frozen header/input-hash binding, source-order
accountability, model/role binding, topology/status/application rejection, and
private-reader path and byte safeguards. The focused Republic ledger checker
reported `0 issue(s)`.

## Deliberate boundary

No private adjudication artifact, semantic conclusion, canonical ledger edit,
review-status transition, atomic outer-turn acceptance, compilation, join,
cutover, claim-speaker migration, or activation occurred in this change.
All 489 Republic records remain `unreviewed` (one depth-1, 483 depth-2, five
depth-3; 206 resolved and 283 unresolved). A completed fresh paired review,
a source-bound private adjudication, a separately validated whole-ledger
transaction, and the outer-turn atomic acceptance gate remain required.
