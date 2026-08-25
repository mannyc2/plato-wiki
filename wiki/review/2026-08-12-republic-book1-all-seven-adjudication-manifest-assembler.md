# Republic Book 1 all-seven adjudication-manifest assembler provenance

This is a mechanical-provenance receipt for a bounded private-manifest writer.
It is not a semantic decision, completed-adjudication assertion, canonical
ledger change, review-status change, acceptance decision, compilation, join,
cutover, migration, or activation.

## Retained frozen boundaries

| input | SHA-256 / boundary / count |
| --- | --- |
| Republic ledger | `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be` |
| Republic Greek source | `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`; UTF-16 length `557124` |
| required outer turn / Book 1 repair window | `turn_republic_0001` `[0,557124)` / `[0,59068)` |
| targeted-repair freeze / manifest | `f6866e611481c545092986bd46707e420771c840d06d15b0d4c8e483f456167f` / `5601fc44213a0d411582388fa433ebd8caea3fd520ecc54a66b7a928130b87e7` |
| target inventory JSON / records / sequence | `cca2267d923bc7c1f9844709c7a5838a601026721cf534a22f90f1446adddd0d` / `4860d08d7e86a4f15ac90e8100e4686916b641dbc67956d011d7ee49e38ec3b1` / `10b24af84e23a94532ae5afd3aa452036d454385f4abaa42060a29a76c11cda4` |
| V4 / per-packet / all-seven interfaces | `4852287a96ddb9e4198689637c518818a60e54449881bb611ba49fa8b82ce49c` / `98d1873bbbcf1a083a921d7ac5fbd6f75a0ae6877938e270988a2bfb6fd4a068` / `1c2ee353133f66ee07cbdb8b6db4b61e2be4804052aa7c5f00aaffcf1be62a48` |

## Private assembler seal

The checkpointed assembler consists of these exact source bytes:

| file | SHA-256 |
| --- | --- |
| `all-seven-adjudication-manifest-assembler-lib.ts` | `e74f417b643d860b447ba12bca890fd4ec5985b24a76ef49f96943c83350ef46` |
| `assemble-all-seven-adjudication-manifest.ts` | `52db696a97aa9e6ac08cebbaee4afba6b264bb8a3d5d324a9a24939ca3bce305` |
| `all-seven-adjudication-manifest-assembler-self-check.ts` | `b92880233aaae30d23c1d6574ff12dfb6c4d9a84fd9d212c753755ef83c4eac3` |
| `ALL-SEVEN-ADJUDICATION-MANIFEST-ASSEMBLER-README.md` | `12ee102f97697a737121b53881c15c55b7170fac3690ee597ade392250cf7f78` |

The explicit `--write` CLI accepts exactly the seven frozen packet tuples in
order. Before it creates an output directory or file, it validates every
private adjudication and both V4 inputs for each tuple through the sealed
lower-level readers and validators, then projects only the manifest's closed
row fields: voice ID, pre-edit record-block hash, exact frozen source ranges,
and adjudicated non-topology disposition.

The only allowed output is a new ignored mode-0600 JSON leaf under
`adjudications/v1/manifests/`. It rejects path escape, symlinked or
non-directory root components, reuse/overwrite, and non-explicit writes; it
validates the serialized manifest before publication and publishes by a
non-replacing same-directory hard link after `fsync`. It has no semantic,
status, receipt, canonical-write, compilation, join, cutover, migration, or
activation authority.

## Mechanical verification

The following synthetic or framework-only checks passed before this checkpoint:

```text
bun .wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-assembler-self-check.ts
bun .wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-self-check.ts
jq empty .wave2-scratch/coord/republic-b1-repair/all-seven-adjudication-manifest-schema.json
! bun .wave2-scratch/coord/republic-b1-repair/assemble-all-seven-adjudication-manifest.ts
git diff --check
```

The assembler self-check covered the synthetic seven-packet/114-target
projection, forged-token rejection, private-root confinement, overwrite and
temporary-file cleanup, mode restriction, atomic publication, and symlink/path
escape rejection. It deliberately did not open a live Greek source, ledger,
verdict, adjudication, or manifest.

## Deliberate boundary

A future private manifest produced by this tool is only a point-in-time
integrity index. The tool does not re-read all 21 inputs immediately before
publication, so every later consumer must re-run the all-seven verifier with
the manifest and exact private inputs. This receipt changes no Republic
record: all 489 records remain outside acceptance, compilation, join, cutover,
claim-speaker migration, and activation gates.
