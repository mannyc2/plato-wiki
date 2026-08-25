# Republic Book 1 targeted anaphoric repair v2 framework provenance

This is a mechanical-provenance receipt, not a semantic review decision. It
records the replacement of the private targeted-repair verdict contract before
any canonical record change, review-status change, or acceptance action.

## Frozen inputs retained

| input | SHA-256 / count |
| --- | --- |
| Republic ledger | `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be` |
| Republic Greek source | `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244` |
| targeted-repair packet freeze | `f6866e611481c545092986bd46707e420771c840d06d15b0d4c8e483f456167f` |
| targeted-repair packet manifest | `5601fc44213a0d411582388fa433ebd8caea3fd520ecc54a66b7a928130b87e7` |
| targeted rows / packets | 114 / 7 |

## Why v1 private outputs are stale

V1 could bind non-retain proposed support only to a packet's primary source
slice. The frozen fourth packet also renders an explicit linked support context
outside that primary slice. That made the v1 contract unable to represent a
source-bound use of all text it had rendered. Therefore every v1 private
targeted-repair output is historical/stale and must not be used as a current
review input, comparison input, adjudication input, or canonical-change basis.
This is a mechanical representability correction; it retains no semantic
conclusion from those outputs.

## V2 contract

The v2 review-framework SHA-256 is
`d4ce8e2b161ea96f9b0a74cb56d0a3c490e8527bd5d9d3a6486f08b7150edb26`.
It is deterministic over the exact bytes of this fixed, ordered interface:

1. `.wave2-scratch/coord/republic-b1-repair/review-lib.ts`
2. `.wave2-scratch/coord/republic-b1-repair/verdict-schema.json`
3. `.wave2-scratch/coord/republic-b1-repair/pending-scaffold-lib.ts`
4. `.wave2-scratch/coord/republic-b1-repair/verify-repair-review.ts`
5. `.wave2-scratch/coord/republic-b1-repair/compare-lib.ts`

Every fresh private verdict must carry that contract hash and live only below
the ignored `verdicts/v2/` namespace. V2 binds non-retain proposed support
only to exact hash-verified rendered contexts: the packet primary slice or an
explicit rendered linked context. It rejects arbitrary source coordinates and
ranges bridging those contexts. The contract remains mechanical: it validates
the shape and byte bounds of an already-written private verdict; it does not
decide its semantic truth.

## Mechanical verification

The following focused mechanical checks were run against the v2 framework and
the retained freeze:

```text
bun .wave2-scratch/coord/republic-b1-repair/self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/compare-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/verify-repair-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
```

All 489 Republic records remain `unreviewed`. There has been no acceptance,
compile, join, cutover, claim migration, or activation. Fresh v2 private
review and any later semantic adjudication remain required before an atomic
outer-turn acceptance can be considered.
