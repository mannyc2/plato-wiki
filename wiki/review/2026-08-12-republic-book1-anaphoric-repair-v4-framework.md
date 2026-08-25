# Republic Book 1 targeted anaphoric repair V4 framework provenance

This is a mechanical-provenance receipt, not a semantic review, adjudication,
canonical ledger change, review-status change, or acceptance decision. It
seals the private V4 verdict contract before fresh review begins.

## Frozen inputs retained

| input | SHA-256 / boundary / count |
| --- | --- |
| Republic ledger | `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be` |
| Greek source | `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`; UTF-16 length `557124` |
| required outer turn | `turn_republic_0001` `[0,557124)` |
| Book 1 review window | `[0,59068)` |
| original Book 1 packet freeze / manifest | `204e45358dad8179d16bd51054db1b75951531694f99cc076a0396542c3e597c` / `5dbbaf41fcc916527300b5a23f7fb81478fbfc6c3b913d618a3a1646c00677eb` |
| targeted-repair freeze / manifest | `f6866e611481c545092986bd46707e420771c840d06d15b0d4c8e483f456167f` / `5601fc44213a0d411582388fa433ebd8caea3fd520ecc54a66b7a928130b87e7` |
| target inventory JSON / TSV | `cca2267d923bc7c1f9844709c7a5838a601026721cf534a22f90f1446adddd0d` / `c02c4b7b46bc87bf404a0450527e062ba577121d5e113aa92076aa1890e8640d` |
| target ID sequence / records | `10b24af84e23a94532ae5afd3aa452036d454385f4abaa42060a29a76c11cda4` / `4860d08d7e86a4f15ac90e8100e4686916b641dbc67956d011d7ee49e38ec3b1` |
| targeted scope | `114` resolved `anaphoric_reporting_formula` rows in `7` packets |
| primary partition | `[0,11319)`, `[11319,22361)`, `[22361,30001)`, `[30001,41165)`, `[41165,47387)`, `[47387,52343)`, `[52343,59068)`; range SHA-256 `c52b76ef72e0525484cf0a20242541bd19ded3fee2ebf6b35169ef610d3e2a4d` |

The primary assignments are `17/17/16/16/16/16/16`; packets 002–006 each
retain separately labelled context-only linked envelopes. The target set is not
a whole-Book-1 review, extraction, omission, or acceptance scope.

## V4 contract seal

The V4 review-framework SHA-256 is
`4852287a96ddb9e4198689637c518818a60e54449881bb611ba49fa8b82ce49c`.
It binds the exact ordered bytes of:

1. `.wave2-scratch/coord/republic-b1-repair/review-lib.ts`
2. `.wave2-scratch/coord/republic-b1-repair/verdict-schema.json`
3. `.wave2-scratch/coord/republic-b1-repair/pending-scaffold-lib.ts`
4. `.wave2-scratch/coord/republic-b1-repair/verify-repair-review.ts`
5. `.wave2-scratch/coord/republic-b1-repair/compare-lib.ts`

Fresh private verdicts must use schema version 4 and the ignored
`verdicts/v4/` namespace. Earlier private-output namespaces are
historical/stale and are not current review, comparison, adjudication, or
canonical-change inputs.

V4 closes the proposal surface. A non-retain in-place proposal has only the
bounded support contexts and the closed `ledger_patch.state` union:
`make_unresolved` can propose only `unresolved`, while `correct_evidence` can
propose only `resolved_explicit` or `resolved_reviewed_attribution`. Split and
remove remain non-executable topology findings with no ledger patch. Both
in-place and topology `source_ranges` must exactly equal the ordered declared
support intervals. The framework rejects free coordinates, support bridges,
mutable identity/source/span/chain/status fields, reviewer-supplied evidence
text, duplicate JSON object keys, malformed private files, and stale framework
hashes. These are payload-integrity guarantees only, not semantic conclusions.

## Mechanical verification

The following focused checks passed against the final V4 framework bytes:

```text
bun .wave2-scratch/coord/republic-b1-repair/anaphoric-resolved-inventory.ts --verify
bun .wave2-scratch/coord/republic-b1-repair/verify-anaphoric-repair-packets.ts --verify
bun .wave2-scratch/coord/republic-b1-repair/self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/compare-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/verify-repair-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
bun -e 'import { reviewFrameworkSha256 } from "./.wave2-scratch/coord/republic-b1-repair/review-lib.ts"; console.log(reviewFrameworkSha256())'
```

The inventory and repair-packet verifiers reconstructed the frozen 114-row,
seven-packet scope. The review self-check covered the V4 proposal contract,
shared-parser duplicate-key rejection, private-path guards, narrow rendered
support, and source-range binding. The comparator self-check covered its V4
framework binding and strict input checks. The focused Republic ledger checker
reported `0 issue(s)`, and the final framework-digest command printed the V4
hash above.

## Deliberate boundary

All 489 Republic records remain `unreviewed` (one depth-1, 483 depth-2, and
five depth-3; 206 resolved and 283 unresolved). There are zero private V4
verdicts. No semantic adjudication, canonical ledger edit, review-status
change, atomic outer-turn acceptance, compilation, join, cutover,
claim-speaker migration, or activation occurred here.

Fresh source review, independent rereview, adjudication, a whole-ledger
transaction, and atomic acceptance remain separately required.
