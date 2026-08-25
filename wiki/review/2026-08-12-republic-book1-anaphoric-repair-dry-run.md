# Republic Book 1 targeted anaphoric-repair dry-run provenance

This is a source-bound, no-write dry run of one already hash-bound private
adjudication cohort. It is not a semantic review, review-status transition,
outer-turn acceptance, compilation, join, cutover, claim-speaker migration,
activation, deployment, or canonical ledger application.

## Frozen preimage and cohort

| input | SHA-256 / boundary / count |
| --- | --- |
| Republic ledger preimage | `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be`; 342450 UTF-8 bytes |
| Republic Greek source | `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`; 1058587 UTF-8 bytes |
| required outer turn / Book 1 repair window | `turn_republic_0001` `[0,557124)` / `[0,59068)` |
| targeted-repair freeze / manifest | `f6866e611481c545092986bd46707e420771c840d06d15b0d4c8e483f456167f` / `5601fc44213a0d411582388fa433ebd8caea3fd520ecc54a66b7a928130b87e7` |
| target inventory JSON / records / sequence | `cca2267d923bc7c1f9844709c7a5838a601026721cf534a22f90f1446adddd0d` / `4860d08d7e86a4f15ac90e8100e4686916b641dbc67956d011d7ee49e38ec3b1` / `10b24af84e23a94532ae5afd3aa452036d454385f4abaa42060a29a76c11cda4` |
| V4 / packet-adjudication / all-seven interfaces | `4852287a96ddb9e4198689637c518818a60e54449881bb611ba49fa8b82ce49c` / `98d1873bbbcf1a083a921d7ac5fbd6f75a0ae6877938e270988a2bfb6fd4a068` / `1c2ee353133f66ee07cbdb8b6db4b61e2be4804052aa7c5f00aaffcf1be62a48` |
| private all-seven manifest | `fd1de6944f925ccd1a81d5b9631a4f17396da9d52eb7a57692b383e553b5390e`; 7 packets / 114 targets |

The no-write transaction interface SHA-256 is
`c42c03b047f896f7892697289dd89441f548b739fa05d069dfd710f5d618fb34`.
It binds the exact bytes of the dialogue-specific transaction library and its
explicit `--dry-run` CLI. Neither has a `--write` or output-path mode.

## Dry-run result

The dry-run report SHA-256 is
`5961b6fc40e32844ee6b895691940a0deefc45f2bb1f23a0b1fd3e1afe8db167`.
It was produced only after replaying the all-seven verifier and reopening each
of the seven private adjudications and fourteen V4 inputs. The report binds
their raw hashes, packet order, every frozen target preimage/range, and the
current ledger/source preimages.

| result | value |
| --- | --- |
| projected post-ledger SHA-256 | `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e` |
| projected post-ledger bytes | 353444 |
| target block aggregate, pre / projected | `05cba7bfbdcebda8aa1c4338c8be763f4380cede04d915782a310dc7544a41be` / `2041ec93ba11c9ae1f31322cc54037d211a5cb244e89c75669ccf3b8c1ce90d0` |
| non-target blocks | 375; aggregate unchanged at `bcafb72891832783b454cd155d57702b2fbc5f3b91b2c7f6462ecd03b42913ad` |
| dispositions | 1 retain, 46 `make_unresolved`, 67 `correct_evidence` (1 explicit, 66 reviewed-attribution) |
| record counts, pre / projected | 489 / 489; depth `1/483/5` unchanged; resolved/unresolved `206/283` -> `160/329` |
| review status, pre / projected | 489 unreviewed / 489 unreviewed; zero transitions |

For every `make_unresolved` row, the only representation normalization is
mechanical: with preimage resolved `voice_chain C` and depth `d = |C|`, the
projected state uses `C.slice(0, -1)`, remains at depth `d`, and therefore
represents the unnamed innermost hop as `d = |voice_chain| + 1`. The projected
row drops explicit/reviewed authority and carries only the already-adjudicated
unresolved candidates and reason. The dry run rejects that normalization for a
target with a non-target descendant, and likewise rejects a corrected terminal
chain that would disturb such a descendant.

The report also records field-delta counts: resolution 46, voice chain 46,
evidence references 113, reviewed attribution 66, candidate owners 9,
unresolved reason 46, and review status 0. It proves each non-target fenced
record block is byte-identical and no record is added, removed, split,
renumbered, reordered, or moved.

## Verification and deliberate boundary

The following focused checks passed:

```text
bun .wave2-scratch/coord/republic-b1-repair/republic-b1-anaphoric-repair-transaction-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/apply-republic-b1-anaphoric-repair.ts --dry-run --json [the seven frozen private tuples]
bun scripts/voices-2026-07/check-ledger.ts republic
git diff --check
```

The candidate existed only in memory and passed the canonical voice-ledger
validator. No write was attempted: `wiki/voices/republic.md` remains at its
preimage SHA, all 489 records remain `unreviewed`, and no Republic index, join,
cutover, claim-speaker migration, or activation artifact exists. A separately
audited compare-and-swap writer, a repeat of the complete private-input
verification immediately before its write, post-write validation, and a new
application provenance receipt remain required before this projection can
become a ledger change.
