# The public-content closure campaign relation-candidate closure partial application — PRE-APPLICATION receipt

- receipt_state: `pre_application`
- receipt_date: `2026-08-16`
- source_commit: `1fa581a9eae7890c51ec2910cb84d9f9fe85eff2`
- v1_final_adjudication_framework_sha256: `073214d87e40d7100964921c7a2eac90e7dfb488dc49cc70bf987eec012f32c7`
- v2_supplemental_final_adjudication_framework_sha256: `60b4a0598f7d189c38de337675bc78da96507f4d5e424f77e2fbb39e61518598`
- partial_materialization_framework_sha256: `a61e53c6ac79e2c8d71f9faa018b51d3ce40dc30c14ca2f6fd810d863112cf1c`
- partial_application_framework_sha256: `b06796b309782230188b6e291e41d6e5c3d762465e8697b68641fbac723fa80c`
- dry_run_mode: `partial_dry_run_only_no_write`
- source_commit_message: `Add guarded partial relation application`

## Locked partial-cohort scope

This receipt binds only the current no-write projection: exactly 12 terminal relation rows across five relation ledgers. It does not authorize any relation outside the following stable `candidate_key` cohort, any claim-status mutation, or a full-closure assertion.

| Packet | Ledger | Allocated relation ID | Candidate key | Lane | Resolution | Review status |
| --- | --- | --- | --- | --- | --- | --- |
| 001 | `cross-dialogue` | `rel_cross-dialogue_1298` | `cross-dialogue::claim_cratylus_0062::claim_gorgias_0074` | V1 | standing | rejected |
| 002 | `cross-dialogue` | `rel_cross-dialogue_1299` | `cross-dialogue::claim_gorgias_0074::claim_republic_0371` | V1 | standing | rejected |
| 003 | `cross-dialogue` | `rel_cross-dialogue_1300` | `cross-dialogue::claim_gorgias_0074::claim_republic_0774` | V1 | standing | rejected |
| 004 | `cross-dialogue` | `rel_cross-dialogue_1301` | `cross-dialogue::claim_gorgias_0074::claim_republic_0777` | V1 | standing | rejected |
| 005 | `cross-dialogue` | `rel_cross-dialogue_1302` | `cross-dialogue::claim_gorgias_0074::claim_statesman_0081` | V1 | standing | rejected |
| 006 | `cross-dialogue` | `rel_cross-dialogue_1303` | `cross-dialogue::claim_gorgias_0074::claim_theaetetus_0167` | V1 | standing | rejected |
| 007 | `cross-dialogue` | `rel_cross-dialogue_1304` | `cross-dialogue::claim_meno_0013::claim_symposium_0128` | V1 | standing | rejected |
| 008 | `cross-dialogue` | `rel_cross-dialogue_1305` | `cross-dialogue::claim_phaedrus_0054::claim_republic_0688` | V1 | standing | rejected |
| 010 | `gorgias` | `rel_gorgias_0053` | `gorgias::claim_gorgias_0074::claim_gorgias_0076` | V1 | standing | accepted |
| 011 | `laws` | `rel_laws_0212` | `laws::claim_laws_0710::claim_laws_1181` | V1 | standing | accepted |
| 012 | `republic` | `rel_republic_0089` | `republic::claim_republic_0150::claim_republic_0688` | V1 | standing | rejected |
| V2-015 | `symposium` | `rel_symposium_0009` | `symposium::claim_symposium_0124::claim_symposium_0128` | V2 supplemental | verbal_only | accepted |

Three V2 candidates remain deferred and are locked out of this application: V2-009 (`gorgias::claim_gorgias_0039::claim_gorgias_0074`), V2-013 (`symposium::claim_symposium_0105::claim_symposium_0124`), and V2-014 (`symposium::claim_symposium_0105::claim_symposium_0128`). Full closure is deliberately **NOT claimed**.

## Verified no-write preimages and planned postimages

| Ledger path | Records before → after | Exact preimage SHA-256 | Planned postimage SHA-256 | Added rows |
| --- | --- | --- | --- | --- |
| `wiki/relations/cross-dialogue.md` | 1297 → 1305 | `b147b309c04ed345934c9008ce2b47ee1fd590a5a76ddfa237ec0258434a4d65` | `a76fd38032bc18091ebb14d533311528192578edceb435d21ea7c13cb25d7364` | 8 |
| `wiki/relations/gorgias.md` | 52 → 53 | `b5e1aa90a0f7338a0752ba60099c7f2d4194043be3c17684a6c4ee701285de87` | `2a4db5fab70c97053acc742af37e3b0ba042a83ae60215757290567dad13031a` | 1 |
| `wiki/relations/laws.md` | 211 → 212 | `51c7f16b17938170aa626db6c6fb5a2f18d33bd4f9c5e67e42258fb057b191b7` | `0ca4ab29b0d7e655f8b06b10f2210b0dbccc4cc4f2d914d4a347d851f9f151f9` | 1 |
| `wiki/relations/republic.md` | 88 → 89 | `2dd0704991cf68ed41892d002ab2892d6e1e5abb1e32f5cb77e9b860c046bb21` | `31f66b318875edc724bd1bf83358673316846189d4e96dbcbec9984d59f919fc` | 1 |
| `wiki/relations/symposium.md` | 8 → 9 | `a3962ab41aa560d45506cd2df9343d6055bb5bc09be8ed76dc60aee4490f444a` | `a2fd9b10db7983d659202de83d5b546a2ba113cf7ca45edd8929afd06d89968c` | 1 |

The five current preimages were rehashed immediately before this receipt. No status or ledger has been changed by this receipt or the no-write projection.

## Application boundaries and durability limits

- Application is an explicit `--apply` action performed only after it acquires an ignored repository-local cooperative lock; this is cooperative, not CAS, and does not coordinate uncooperative writers.
- Each target is rederived from the bound projection, rechecked as a non-symlinked regular file, and must match the exact preimage and file identity before its rename.
- Each replacement uses a same-directory temporary file and file `fsync` before rename. This is file-fsync-only: it does not claim a directory `fsync`, durable power-loss atomicity, or a filesystem-wide transaction.
- The five-file application is non-cross-file-atomic. A failure after any rename is indeterminate, retains the lock for recovery, and must not be described as a completed cohort application without the emitted writer report.
- This partial application reports remaining defers and has no authority to assert full closure.

## Postwrite fields — pending emitted writer report

- writer_report: `stdout-only captured application result; no durable writer-report artifact was created`
- writer_result_mode: `applied`
- writer_lock_retained: `false; lock released`
- writer_materialized_rows: `12`; installed relation IDs: `rel_cross-dialogue_1298`, `rel_cross-dialogue_1299`, `rel_cross-dialogue_1300`, `rel_cross-dialogue_1301`, `rel_cross-dialogue_1302`, `rel_cross-dialogue_1303`, `rel_cross-dialogue_1304`, `rel_cross-dialogue_1305`, `rel_gorgias_0053`, `rel_laws_0212`, `rel_republic_0089`, `rel_symposium_0009`
- writer_outstanding_defers: `3`; retained and unmaterialized: V2-009, V2-013, V2-014
- writer_fixed_ledger_paths: `wiki/relations/cross-dialogue.md`, `wiki/relations/gorgias.md`, `wiki/relations/laws.md`, `wiki/relations/republic.md`, `wiki/relations/symposium.md`
- postwrite_relation_hashes: `cross-dialogue a76fd38032bc18091ebb14d533311528192578edceb435d21ea7c13cb25d7364`; `gorgias 2a4db5fab70c97053acc742af37e3b0ba042a83ae60215757290567dad13031a`; `laws 0ca4ab29b0d7e655f8b06b10f2210b0dbccc4cc4f2d914d4a347d851f9f151f9`; `republic 31f66b318875edc724bd1bf83358673316846189d4e96dbcbec9984d59f919fc`; `symposium a2fd9b10db7983d659202de83d5b546a2ba113cf7ca45edd8929afd06d89968c`
- postwrite_focused_ledger_checks: `all five installed relation ledgers validated with 0 issues`
- full_closure_claim: `not_made`
