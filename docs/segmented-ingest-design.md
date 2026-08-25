# Segmented Ingest Design

## Segmentation Unit

Use span-range batches from `derived/plato/stephanus/*.toon` as the first segmentation grid. Speaker turns are useful later, but the span index already exists, is deterministic, and covers every raw Greek file without adding a new parser. A segment is an ordered run of Stephanus markers with a target of about 30 KB of source text, with hard boundaries at marker starts. The harness can tune the target by model context, but the default should keep each segment's source text, compact feature index, and segment-local ledger delta well under the model context limit.

## Delta Write Contract

The segment writer should append only new fenced YAML records through `wiki_append_observations`. The tool accepts `wiki/observations/<dialogue>.md` plus new records, skips duplicate existing `observation_id` values, assigns persisted `observation_id` values to new records from the current ledger, rejects duplicate source-span/feature-label anchors inside the same dialogue, validates the resulting full ledger, normalizes `feature_family` and `feature_label`, assigns `feature_id`, writes the ledger, and syncs `wiki/features-so-far.md` through the existing validated registry-sync path. Re-running a segment is idempotent from the on-disk ledger, and same-span observations are allowed when they record different textual phenomena.

## Resume Semantics

Resume state should be derived from disk, not a private run file. Completed work is the set of observation ids and cited spans already present in `wiki/observations/<dialogue>.md`. The next segment is the first segment whose span range has no accepted appended records, or whose segment marker range is explicitly marked incomplete in the run transcript. Transcript state can explain what happened, but the on-disk ledger and registry remain authoritative.

## Orchestration

Use one model conversation per segment. The harness loops over segments, injects the compact registry and labels-by-family context for each conversation, asks for records only for that segment, and commits the delta before moving on. This keeps context bounded and lets registry additions from segment N be visible in segment N+1. A single long conversation paging through segments would reintroduce growing context and fragile recovery.

## Token Budget

Meno is 116 KB and produced a 61 KB ledger with 43 observations; Republic is about 1,059 KB, roughly 9x Meno by source bytes. Whole-dialogue ingest would push millions of repeated input tokens as the ledger is restaged. With 30 KB segments, Republic becomes roughly 36 bounded calls. Each call sends one source segment, compact registry context, and only new records as output. The target budget should be less than 50K input tokens and less than 10K output tokens per segment, adjusted after measuring Ion and Phaedo dry runs.

Segmented ingest enforces a source-span tool budget per segment: the model should append after no more than four calls, and the tool rejects calls after six. The extra room is for one correction pass after validation feedback, not for exhaustive marker browsing.

## Risks And Invariants

The main risk is partial write corruption. The append tool must preserve the current staged-then-commit invariant at the segment level: validate before write, assign ids deterministically, and sync the registry only after the ledger is valid. Registry mutation safety remains the registry-sync invariant. Cross-segment label reuse depends on the label-reuse labels-by-family context. Recovery depends on deterministic segment boundaries from the stephanus-span-index span index and idempotent duplicate handling.

## PoC Findings

The proof tool `wiki_append_observations` appends new records in tests without duplicating existing `observation_id` values or source-span/feature-label anchors, and rejected draft IDs do not advance the persisted ID sequence. `bun run harness derive segments ion` prints a bounded dry-run segment plan from the span index without a model call or wiki writes. The existing single-pass ingest path remains present, but it uses the stricter `wiki_stage_observation` then `wiki_commit_observation` workflow rather than segmented appends.
