# Applied submissions

Tracked provenance for every artifact an apply gate merged into a canonical
ledger.

Generated artifacts — commentary drafts, outlines, rewrites, audit outputs —
are written under `scratch/`, which `.gitignore` excludes. Merging one into a
ledger therefore used to destroy the only copy of what was submitted and what
it replaced. Symposium's 33 rewrites survive with no audit outputs beside them;
euthyphro's and critias' audit outputs are gone entirely. Six labeled defects
exist corpus-wide.

An apply gate now records here, inside the same write lock that mutates the
ledger, so the evidence for a merge outlives the scratch directory that
produced it.

## Layout

```text
wiki/submissions/<lane>/<scope>/<NNNN>-<kind>[-<unit-key>].json
```

Ordinals are monotonic per scope and allocated under the write lock. Each
record carries:

- `source_path` and `source_sha256` — where the agent wrote it, and its bytes
- `target_path`, `target_sha256_before`, `target_sha256_after` — the ledger it
  merged into, on both sides of the merge
- `applied_ids` — the record ids the merge created or changed
- `submission` — the artifact verbatim
- `superseded` — the bodies a rewrite replaced, when it replaced rather than
  appended

## Reading them

```bash
bun -e 'import {readSubmissions} from "./packages/harness/src/submissions.js"; console.log(readSubmissions("commentary", "crito"))'
```

These records are provenance, not corpus state. They are never an input to
extraction, review, or rendering, and nothing reads them to decide what a
record means. Their purpose is that a pre/post pair survives in one tracked
artifact — which is what a defect-class analysis over past rewrites needs and
what the corpus currently cannot supply.
