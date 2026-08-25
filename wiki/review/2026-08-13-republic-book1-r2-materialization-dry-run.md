# Republic Book 1 R2 no-write materialization dry-run provenance

This is a mechanical-provenance checkpoint for a prospective Republic Book 1
R2 ledger materialization. It records a reproducible in-memory projection,
not a canonical ledger change, review decision, acceptance, or authority to
write.

## Reverified boundary

| input or interface | SHA-256 / count / boundary |
| --- | --- |
| Greek source | `raw/plato/greek/republic.txt`; `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244` |
| Canonical Republic ledger preimage | `wiki/voices/republic.md`; `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e`; `489` records, all `unreviewed` |
| R2 packet freeze / manifest | `2ca9aab1d9475e5c0a5001c5fc971fa6c61ac8f496183eb27b49112ad67e9f6c` / `47509bc729e7b7458cbb802b70b55192a1e23526376c9a72b556efaf30664e10` |
| R2 review / adjudication / cohort interfaces | `27cac1d815da84c706034d8b5adc93ba3deeb75998fbf111d03c89ef98ac1771` / `28a000a97b12a11748371dbfd0bb004e544fe448d5dcdd35d7fbdfb0f986b853` / `23eb14d409f7c7d600cf3e061ba371da7431a4fe6d9524953d8fdc5f9f729e0e` |
| Reverified in-memory cohort manifest | `713d1ef90dc6999cb3a1bf600430db282b53aebf516e4aef68d65e8564caa1d3`; exactly seven packet triples and `21` private raw inputs |
| No-write materialization interface | `8513884c0f126689e83662777a798bc2d8ac77b60badf5a5890d8e2f7c0727e1` |
| Deterministic dry-run report | `ce1a98abeb5c7b499772f5136e35c7772e1b10daffb59b2117a783a0251511ad` |

The seven current triples were revalidated in fixed packet order. The current
retry primary artifacts for R2 packets `001`, `003`, and `004` were used; the
other primary paths and all independent/final paths were the current fixed
ones. The ignored private files are not copied into this receipt.

## Prospective result only

The closed current cohort contains `481` keeps, `7` corrections, `2` gap
additions, and no split or remove action. The in-memory candidate has:

| projection field | value |
| --- | --- |
| record count | `489 -> 491` |
| prospective ledger SHA-256 | `a34bc05e8c216c101b4aafa1b73dc4867aae54cae55f1368bc568aa0969f5b7b` |
| deterministic new IDs | `voice_republic_0490`, `voice_republic_0491` |
| prospective canonical validation | passed |
| canonical write | `false` |

The projector preserves the depth-1 frame and every uncorrected fenced record
byte-for-byte, derives fresh IDs in deterministic source order, requires all
records to remain `unreviewed`, and rejects unsupported split/remove actions.
It has no write mode, output path, or canonical-application surface.

## Focused verification

The following passed against current bytes:

```text
bun .wave2-scratch/coord/republic-b1-r2-materialization/self-check.ts
./node_modules/.bin/tsc --noEmit --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --skipLibCheck --target ES2022 --module NodeNext --moduleResolution NodeNext --types node <the three materialization TypeScript files>
bun .wave2-scratch/coord/republic-b1-r2-materialization/dry-run-r2-book1-materialization.ts --dry-run <the exact seven reverified triples>
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
```

The synthetic self-check covers malformed materialization states, source-hash
drift, deterministic allocation order and ties, duplicate local IDs, ID
overflow, and renderer/template-state rejection. The production entry point
only reads its source, ledger, and hardened private cohort inputs, then emits a
compact stdout report.

## Deliberate stop boundary

No source-semantic result is accepted here. This checkpoint changes neither
`wiki/voices/republic.md` nor any `review_status`, source record, compilation,
join, cutover, claim-speaker mapping, completeness state, or activation. It
does not authorize a writer. Further Republic/voice work is paused after this
no-write audit; subsequent work is directed to base corpus claim/relation data.
