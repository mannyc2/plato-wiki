# Republic Book 1 all-seven targeted-repair adjudication manifest framework provenance

This is a mechanical-provenance receipt for a private, non-applying all-seven
manifest contract. It is not a semantic decision, completed-adjudication
assertion, canonical ledger change, review-status change, acceptance decision,
compilation, join, cutover, migration, or activation.

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
| per-packet adjudication interface | `98d1873bbbcf1a083a921d7ac5fbd6f75a0ae6877938e270988a2bfb6fd4a068` |

## All-seven manifest contract seal

The all-seven manifest-framework SHA-256 is
`1c2ee353133f66ee07cbdb8b6db4b61e2be4804052aa7c5f00aaffcf1be62a48`.
It binds the exact ordered bytes of:

1. `.wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-lib.ts`
2. `.wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-schema.json`
3. `.wave2-scratch/coord/republic-b1-repair/verify-all-seven-adjudication-manifest.ts`

Private manifests are confined to the ignored `adjudications/v1/manifests/`
namespace. A future real manifest has exactly packets 001–007 and exactly the
114 frozen target IDs in source order. Each row is only a hash-bound projection
of an adjudication: voice ID, pre-edit record-block hash, frozen source ranges,
and one non-topology disposition (`retain_resolved`, `make_unresolved`, or
`correct_evidence`).

A real verification binds seven packet adjudications and fourteen role-checked
V4 input verdicts (21 private inputs), delegating every tuple to the hardened
lower-level V4 and per-packet-adjudication validators. The manifest boundary
has no topology, status, receipt, application, canonical-write, compilation,
join, migration, cutover, or activation surface, and its verifier writes
nothing.

## Mechanical verification

The following framework-only checks passed:

```text
bun .wave2-scratch/coord/republic-b1-repair/anaphoric-resolved-inventory.ts --verify
bun .wave2-scratch/coord/republic-b1-repair/verify-anaphoric-repair-packets.ts --verify
bun .wave2-scratch/coord/republic-b1-repair/self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/compare-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/adjudication-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-self-check.ts
bun -e 'JSON.parse(await Bun.file(".wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-schema.json").text()); console.log("schema JSON OK")'
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
git diff --cached --check
bun -e 'import { allSevenAdjudicationManifestFrameworkSha256 } from "./.wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-lib.ts"; console.log(allSevenAdjudicationManifestFrameworkSha256())'
```

The synthetic self-check covers the frozen packet and target sequence, coupled
header hashes, raw lower-level-input hashes, duplicate/missing/order failures,
closed manifest fields, and inherited private-reader safeguards. It does not
open a real private manifest or a real 21-input cohort.

## Deliberate boundary

A green real-manifest verification will prove only that the declared private
manifest and its 21 supplied private inputs agreed with the frozen projection
at the time of reading. It neither locks those private files nor grants a
later consumer canonical authority. Any later transaction must reverify the
manifest and all 21 inputs, then separately validate its own whole-ledger
preconditions.

This framework receipt changes no Republic record. All review and outer-turn
acceptance gates remain separate; no compilation, join, cutover, claim-speaker
migration, or activation follows from this receipt.
