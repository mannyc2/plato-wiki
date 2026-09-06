# Repository maintenance

## Measured cleanup

Baseline: commit `973ee1a`. Counts are physical lines in `.ts`, `.tsx`, `.js`,
`.py`, and `.sh` files. Tests and test-support fixtures are counted separately;
JSON/data, generated indexes, documentation, dependencies, and Git history are
excluded from source counts. The baseline uses committed files and the result
uses the cleanup candidate's source tree.

| Subsystem | Production lines before | After |
| --- | ---: | ---: |
| Corpus library (`packages/harness`) | 73,434 | 68,802 |
| GPU audio tools (`scripts/audio`) | 46,557 | 45,044 |
| CLI (`packages/cli`) | 2,209 | 1,572 |
| Other scripts | 5,170 | 2,485 |
| **Total production** | **127,370** | **117,903** |
| Tests and test-support fixtures | 57,268 | 55,471 |

The cut removes 9,467 production lines (7.4%) and 1,797 test lines. Most remaining
code is still corpus validation/production and local audio processing. The
largest individual modules are the Dots renderer, commentary campaign, ontology
audit verifier, and static-site generator. Splitting those into packages would
move code without removing responsibilities.

## What became simpler

The old Pi runtime duplicated the agent client's provider configuration,
conversation lifecycle, execution queues, retry policy, and transcript writes.
Those mechanisms are removed, including the ingest, review, claim, and relation
runner commands. The generic wiki tools now have a direct CLI and library API.
They preserve deterministic citation lookup, validation, locks, stable IDs, and
coverage accounting. Whole-ledger commits check the staged base and source
again, reject a competing write, and consume the draft once.

Semantic work follows one path:

```text
bounded Greek source -> agent judgment -> independently reviewed decision
                     -> canonical ledger + receipt -> generic validation
```

Completed migration/reconciliation scripts with hardcoded historical cohorts
were removed. Their accepted records and historical evidence remain intact.
The obsolete audio corpus wrappers depended on a producer excluded from the
public repository; these wrappers and their orphan tests were removed. The
single-dialogue renderer, mastering, ASR, handoff, and promotion tools remain.

The commentary campaign remains because it owns a recurring bounded paid
operation with quality, evidence-reuse, and budget rules. Deterministic parsers,
offsets, source hashes, schemas, integrity checks, generic writes, and derived
rebuilds also remain. Agent curation does not replace mechanical checks.

## Storage and distribution

Before cleanup, tracked data dominated the working tree:

| Path | Bytes before cleanup | Treatment |
| --- | ---: | --- |
| `wiki/ontology-audits` | 196,472,347 | Accepted historical evidence; retained |
| `derived/plato` | 81,871,566 | Token cache removed from tracking; configuration and other projections retained |
| `wiki/observations` | 14,883,235 | Canonical semantic ledgers; retained |
| `wiki/submissions` | 12,640,884 | Accepted submission provenance; retained |
| `raw/plato` | 10,209,232 | Source corpus and attribution; retained |

The 27 token indexes account for 70,935,802 bytes (67.65 MiB). Rebuilding every
index from canonical Greek and tracked turns reproduces its previous SHA-256.
They now live in ignored build output and an optional release-candidate archive.
The original packed Git history is 71.56 MiB; removing current files does not
remove their historical blobs. CI uses filtered history because ontology
verification still needs the frozen baseline commit.

The next substantial storage cut is the immutable ontology audit package. It
must be moved as a complete checksummed archive with verified restoration and
available release storage before removing tracked evidence. Deleting individual
worksheets now would break accepted provenance and current validation. No
history rewrite or evidence deletion is included in this cut.

See [release packaging](release-packaging.md) for downloadable source/site/cache
artifacts, Bun workspace choices, and the assessment of effect-build and
ts-release.

## Audio readiness

The generator previously required commentary evidence spans to partition every
English marker and treated append-only ledger order as playback order. Both
assumptions contradicted the accepted audio insertion boundaries. Generator and
validator now share boundary resolution and use resolved playback order while
preserving exact source coverage.

Sixteen dialogues pass production preflight. Eleven still lack an accepted
opening chapter at source character zero; those require a reviewed opening
boundary decision. No accepted commentary, cast decision, or recording status
was changed to make preflight pass. Runtime screenplays and render outputs stay
outside the canonical checkout until their acceptance workflow is complete.

GPU synthesis and mastering run as a serial resumable queue with fail-fast
stage handling. Finished chunks are reused by exact plan identity. Synthesis
success does not imply listening, ASR, or publication acceptance.

## Verification contract

`bun run ci` runs tests, typecheck, lint, corpus validation, and the real static
site builder. The cleanup also checks direct wiki CLI invocation, rejected
unsupported arguments before writes, stale staged commits, symlink confinement,
chapter gaps/order/duplicates, exact token rebuilds, and Linux release-archive
checksums. Offline audio interop uses the pinned Numpy environment described in
[contributing](../CONTRIBUTING.md).

Knowledge-base completeness had zero open jobs at the baseline. The cleanup
preserves that corpus result; its progress is source and operational reduction,
not newly accepted semantic records.
