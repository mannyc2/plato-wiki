# Republic Book 1 R2 Codex review framework provenance

This is a mechanical-provenance checkpoint for fresh Republic Book 1 review.
It creates no semantic verdict, canonical ledger change, `review_status` change,
adjudication, acceptance, compilation, join, cutover, claim-speaker migration,
or activation.

## Frozen review boundary

| input | SHA-256 / boundary / count |
| --- | --- |
| Greek source | `raw/plato/greek/republic.txt`; `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`; UTF-16 length `557124` |
| Republic ledger | `wiki/voices/republic.md`; `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e`; `489` records |
| required outer turn | `turn_republic_0001` `[0,557124)`; the depth-1 frame remains context-only and `unreviewed` |
| Book 1 source window | `[0,59068)`, ending at the newline immediately before `{b2}` |
| R2 freeze / manifest | `2ca9aab1d9475e5c0a5001c5fc971fa6c61ac8f496183eb27b49112ad67e9f6c` / `47509bc729e7b7458cbb802b70b55192a1e23526376c9a72b556efaf30664e10` |
| R2 packet coverage | seven contiguous `{p}`-aligned packets; `488` non-frame candidates in `483` intact families and `484` exact source gaps |

The packet order and per-packet accountability counts are
`001:30/29`, `002:109/108`, `003:64/62`, `004:60/60`, `005:27/27`,
`006:71/71`, and `007:127/127` (candidates/gaps). The prior R1 packet set
remains historical only; R2 is the only current Book 1 dispatch input.

## Sealed private-verdict contract

The R2 Codex review framework digest is
`27cac1d815da84c706034d8b5adc93ba3deeb75998fbf111d03c89ef98ac1771`.
It frames the exact ordered bytes of:

1. `.wave2-scratch/coord/republic-b1-r2-reviews/review-lib.ts`
2. `.wave2-scratch/coord/republic-b1-r2-reviews/verdict-schema.json`
3. `.wave2-scratch/coord/republic-b1-r2-reviews/reviewer-instructions.md`
4. `.wave2-scratch/coord/republic-b1-r2-reviews/pending-scaffold-lib.ts`
5. `.wave2-scratch/coord/republic-b1-r2-reviews/make-pending-scaffold.ts`
6. `.wave2-scratch/coord/republic-b1-r2-reviews/verify-r2-codex-review.ts`
7. `.wave2-scratch/coord/republic-b1-r2-reviews/compare-lib.ts`
8. `.wave2-scratch/coord/republic-b1-r2-reviews/compare-r2-codex-reviews.ts`

Fresh private inputs require schema version `1`, packet set
`republic-b1-r2`, reviewer model `codex`, and exactly one of `primary` or
`independent_rereview`. They may live only below the ignored
`verdicts/v1/` root. At this checkpoint that root contains zero private
verdict files.

Every verdict binds the current ledger/source, R2 freeze/manifest/TSVs, exact
packet bytes, ordered candidate worklist, ordered gap worklist, each candidate
ledger-block and canonical preimage hash, and each gap range/text hash. The
reader rejects paths outside the private root, symlinked components,
non-regular or identity-swapped inputs, absent `O_NOFOLLOW`, malformed UTF-8,
UTF-8 BOMs, and duplicate decoded JSON object keys.

The closed payload supports only one accountable candidate disposition
(`keep`, `correct`, `split`, or `remove`) and one gap disposition
(`no_omission` or `add`) in frozen order. Changed/add support, citations,
evidence, antecedents, parent references, registered sigla, and exact source
hashes are structurally bound to rendered Greek source contexts; no canonical
identifier, status, acceptance, or writer authority is present.

Before a private verdict is structurally accepted, the verifier projects its
entire packet with all retained records, changes, splits, removals, and gap
additions. It rejects a record that crosses a frozen family/gap boundary,
escapes its assigned packet, uses a non-containing, non-adjacent-depth, or
unresolved parent, fails the parent-chain prefix, strands a child beneath a
removed parent, duplicates proposed local identifiers, or overlaps another
record at the same prospective depth. This is an early representability gate;
it is not a Greek semantic decision or a substitute for later full-ledger
validation and atomic acceptance.

The companion comparator is read-only and stdout-only. It first validates both
private inputs, then compares frozen-order dispositions, pre-edit ranges, and
raw strict-UTF-8 proposed payload bytes. It does not adjudicate, persist a
report, or accept a verdict.

## Mechanical verification

The following passed against the sealed final framework bytes:

```text
jq empty .wave2-scratch/coord/republic-b1-r2-reviews/verdict-schema.json
bun .wave2-scratch/coord/republic-b1-r2-reviews/self-check.ts
bun .wave2-scratch/coord/republic-b1-r2-reviews/verify-r2-codex-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
```

The self-check reconstructs all seven R2 packets and exercises stale worklist
and preimage rejection, range/payload closure, a non-containing parent, a bad
chain prefix, an unresolved or removed parent with a retained child, duplicate
new identifiers, overlapping and escaping split output, strict UTF-8/BOM and
duplicate-key rejection, private-path hardening, and raw-proposal comparison.
The R2 preflight reported the `488` candidates and `484` gaps above; the focused
ledger checker reported `0 issue(s)`.

## Deliberate boundary

All `489` Republic records remain `unreviewed`; there is no partial Book 1
acceptance. Fresh source review, independent rereview, semantic adjudication,
a whole-turn materialization/validation transaction, a canonical receipt, and
atomic outer-turn acceptance remain separate required phases. No Republic voice
index, join, cutover, claim-speaker migration, or activation exists.
