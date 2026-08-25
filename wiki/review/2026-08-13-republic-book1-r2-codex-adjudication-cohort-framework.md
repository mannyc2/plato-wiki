# Republic Book 1 R2 Codex adjudication cohort framework provenance

This is a mechanical-provenance checkpoint for a seven-packet private
integrity index. It records neither a source-semantic conclusion nor authority
to materialize, accept, compile, join, cut over, or activate Republic data.

## Frozen boundary

| input or interface | SHA-256 / count / boundary |
| --- | --- |
| Greek source | `raw/plato/greek/republic.txt`; `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244` |
| Republic ledger | `wiki/voices/republic.md`; `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e`; `489` records, all still `unreviewed` |
| R2 freeze / manifest | `2ca9aab1d9475e5c0a5001c5fc971fa6c61ac8f496183eb27b49112ad67e9f6c` / `47509bc729e7b7458cbb802b70b55192a1e23526376c9a72b556efaf30664e10` |
| R2 Book 1 packet boundary | seven contiguous packets covering `[0,59068)`; `488` candidates in `483` intact families and `484` omission-review gaps |
| R2 review framework interface | `27cac1d815da84c706034d8b5adc93ba3deeb75998fbf111d03c89ef98ac1771` |
| R2 adjudication framework interface | `28a000a97b12a11748371dbfd0bb004e544fe448d5dcdd35d7fbdfb0f986b853` |
| R2 all-seven cohort framework interface | `23eb14d409f7c7d600cf3e061ba371da7431a4fe6d9524953d8fdc5f9f729e0e` |

The cohort contract fixes packet membership and source order to
`republic-b1-r2-001` through `republic-b1-r2-007`. At this checkpoint seven
private final-adjudication files exist below their ignored root, but no private
cohort manifest exists and no private body is recorded by this receipt.

## Mechanical contract boundary

The framework replays current R2 preflight, then hardened-reads exactly one
`primary`, one `independent_rereview`, and one final adjudication for each
fixed packet. It revalidates each final against its two raw input bytes before
binding all twenty-one SHA-256 values and every current freeze/header/worklist
binding into a closed, source-ordered manifest.

The emitter is stdout-only. The verifier is read-only. Both make a
point-in-time binding rather than a cross-file lock. The manifest rejects
paths, copied bodies, Greek text, rationales, status, application, writer, and
canonical-authority surfaces; it has no ledger or review-status action.

## Focused mechanical verification

The following passed against the sealed current bytes using synthetic inputs
only for cohort-framework self-tests:

```text
jq empty .wave2-scratch/coord/republic-b1-r2-cohort/cohort-schema.json
bun .wave2-scratch/coord/republic-b1-r2-cohort/self-check.ts
bun build --target=node .wave2-scratch/coord/republic-b1-r2-cohort/cohort-lib.ts --outfile /tmp/republic-b1-r2-cohort-lib-check.mjs
bun build --target=node .wave2-scratch/coord/republic-b1-r2-cohort/emit-r2-codex-adjudication-cohort.ts --outfile /tmp/republic-b1-r2-cohort-emit-check.mjs
bun build --target=node .wave2-scratch/coord/republic-b1-r2-cohort/verify-r2-codex-adjudication-cohort.ts --outfile /tmp/republic-b1-r2-cohort-verify-check.mjs
bun .wave2-scratch/coord/republic-b1-r2-reviews/verify-r2-codex-review.ts --preflight-all
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
```

The synthetic cohort check covers exact seven-packet order, closed headers and
raw hashes, manifest and entry tampering, duplicate private paths, malformed
UTF-8, UTF-8 BOMs, duplicate decoded keys, outside-root paths, and root or
leaf symlinks. The focused Republic ledger checker reported `0 issue(s)`.

## Deliberate boundary

This receipt changes no source-semantic result, `review_status`, acceptance,
compilation, join, cutover, activation, or canonical Republic file. A later
private cohort manifest must replay all twenty-one artifacts. A separate
whole-ledger dry run and materially verified canonical transaction remain
required before atomic outer-turn acceptance.
