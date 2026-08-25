# Republic Book 1 R2 Codex adjudication framework provenance

This is a mechanical-provenance checkpoint for the private, one-packet R2
adjudication contract. It seals no source-semantic result and authorizes no
canonical action.

## Frozen boundary

| input or interface | SHA-256 / count / boundary |
| --- | --- |
| Greek source | `raw/plato/greek/republic.txt`; `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244` |
| Republic ledger | `wiki/voices/republic.md`; `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e`; `489` records, all still `unreviewed` |
| R2 freeze / manifest | `2ca9aab1d9475e5c0a5001c5fc971fa6c61ac8f496183eb27b49112ad67e9f6c` / `47509bc729e7b7458cbb802b70b55192a1e23526376c9a72b556efaf30664e10` |
| R2 Book 1 packet boundary | seven contiguous packets covering `[0,59068)`; `488` candidates in `483` intact families and `484` omission-review gaps |
| R2 review framework interface | `27cac1d815da84c706034d8b5adc93ba3deeb75998fbf111d03c89ef98ac1771` |
| R2 adjudication framework interface | `28a000a97b12a11748371dbfd0bb004e544fe448d5dcdd35d7fbdfb0f986b853` |

The review interface digest remains the binding for the two previously shaped
private R2 inputs. The separate adjudication interface digest seals the exact
ordered path-and-byte contract in
`.wave2-scratch/coord/republic-b1-r2-adjudication/`; its README and
self-check remain explanatory, non-acceptance material outside that digest.

## Mechanical contract boundary

The contract reads exactly one hardened `primary` and one hardened
`independent_rereview` R2 private input for the same frozen packet, binds their
raw JSON hashes, and requires one source-ordered final row for every candidate
and omission gap. It reuses the R2 packet, source, ledger, worklist, exact
pre-edit record/range, and proposal-topology checks. It rejects status,
application, writer, and canonical-authority keys recursively.

Private final artifacts may exist only below the ignored
`.wave2-scratch/coord/republic-b1-r2-adjudication/adjudications/v1/final/`
root. A path-only file count at this checkpoint was `0`; no private final body
was opened or recorded by this receipt.

## Focused mechanical verification

The following passed against the current bytes:

```text
jq empty .wave2-scratch/coord/republic-b1-r2-adjudication/adjudication-schema.json
bun .wave2-scratch/coord/republic-b1-r2-adjudication/self-check.ts
bun .wave2-scratch/coord/republic-b1-r2-reviews/verify-r2-codex-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
```

The adjudication self-check uses only synthetic temporary inputs. It proves
the fixed interface digest, raw-input binding, full row/order accountability,
a valid gap addition, rejection of a topology-invalid gap addition, and final
row pre-edit record-preimage and source-range tamper rejection through the
final verifier. The R2 preflight independently reconstructed seven packets
with `488` candidates and `484` gaps, and the focused ledger checker reported
`0 issue(s)`.

## Deliberate boundary

This receipt makes no semantic result, `review_status` change, acceptance,
compilation, join, cutover, activation, or canonical change. It does not
materialize, apply, or otherwise alter the Republic ledger. Full
source-bound adjudication, whole-outer-turn materialization and validation,
a later canonical review receipt, and atomic acceptance remain separate
required phases.
