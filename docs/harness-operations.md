# Harness Operations

## Package Boundary

- `packages/harness`: provider selection, pi-agent-core setup, JSONL sessions,
  transcript events, validation, and agent execution.
- `packages/cli`: command parsing and terminal output.

## Provider Profiles

Provider profiles live in `harness.config.json`.

Use a named profile:

```bash
bun run harness ingest euthyphro --profile anthropic
bun run harness ingest euthyphro --profile deepseek-flash
```

Override directly:

```bash
bun run harness ingest euthyphro --provider openai --model gpt-5.5
```

Useful inspection commands:

```bash
bun run harness profiles
bun run harness providers
bun run harness models anthropic
bun run harness models deepseek
```

API key lookup order:

1. `PI_API_KEY`
2. the profile's `apiKeyEnv`
3. pi-ai's provider-specific environment lookup

Bun loads `.env`, the active `NODE_ENV` file, and `.env.local`
automatically. Put local secrets in `.env` or `.env.local`; keep
`.env.example` as the checked-in template. Do not add `dotenv`.

## Job Dispatch

`bun run completeness` says what is missing, leaf by leaf, with a remediation on
each. `bun run harness job` turns those failing leaves into dispatchable work.

```bash
bun run harness job manifest --write
bun run harness job list --lane commentary
bun run harness job show readings/crito
```

A job id is `<family-slug>/<scope>` — `claims/crito`, `readings/apology`,
`reported-turns/republic` — derived from the completeness leaf, so it is stable
across runs and typeable by hand.

`job manifest` recomputes the whole corpus and takes about a minute. `job list`
and `job show` read the cache it writes to `.cache/jobs/manifest.json`, so a
fleet of subagents each asking for its own brief costs nothing. Pass `--refresh`
to recompute, and re-run `job manifest --write` after landing work.

`job show` prints the brief: expected, observed, remediation, the input files
with hashes, the lane's standing instructions, and the exact commands that land
the result. That is what a dispatched agent needs and all it needs — the
orchestrator computes the manifest once and hands each agent a job id.

Every job carries:

- `automation`: `harness` (a command runs it), `campaign` (the commentary
  campaign runner), or `manual` (no runner exists; the instructions say so).
- `blocked_by`: jobs in the same scope that must close first. A quality audit
  requires an accepted ledger, and a screenplay requires both, so those are
  reported rather than discovered by failure.
- `input_sha256`: content address over the leaf's evidence files, so a runner
  can tell whether a dispatched job's inputs moved under it.

The manifest is always built whole; `--lane`, `--family`, and `--scope` filter
the view, never the cache.

## Write Locks

`withRepoWriteLock` takes an exclusive lock on **the repo-relative paths a body
writes**, not on a label:

```ts
withRepoWriteLock({ paths: ["wiki/commentary/crito.md"], label: "commentary-draft:crito" }, () => { ... })
```

Locks live in `scratch/wiki-write-locks/`, one directory per target, acquired in
sorted order and released in reverse so multi-path callers cannot deadlock. The
label is diagnostic only; it is recorded in the lock's `owner.json`.

This is what makes per-dialogue parallelism safe. Two leads working different
dialogues never block each other, while two callers touching the same file are
mutually exclusive **even when their labels differ** — which the previous
single-lock-per-repository design got backwards in both directions:
`ingest_log:<dialogue>`, `claim_log:<dialogue>` and `relation_log:<scope>` were
three labels over one shared `wiki/ingest-log.md`, and `commentary-draft:`,
`commentary-outline:` and `commentary-rewrite:` were three labels over one
shared ledger.

## Applied Submissions

Apply gates record the merged artifact under `wiki/submissions/<lane>/<scope>/`,
inside the same lock that mutates the ledger. Generated artifacts live in
gitignored `scratch/`, so merging one used to destroy the only copy of what was
submitted and what it replaced. See `wiki/submissions/README.md`.

## Ontology vNext

Observation extraction is deliberately unclassified. After source and record
review, comparison axes, concepts, and many-to-many memberships are curated in
the strict `wiki/ontology/*.jsonl` model described by `docs/ontology-vnext.md`.
Clusters, dossiers, and site pages are regenerated projections of that model.
There is no compatibility reader or parallel registry.

Configured DeepSeek profiles use `DEEPSEEK_API_KEY`:

- `deepseek-flash`: `deepseek/deepseek-v4-flash`
- `deepseek-pro`: `deepseek/deepseek-v4-pro`

Configured Pioneer profiles use `PIONEER_API_KEY` against the
OpenAI-compatible Pioneer base URL `https://api.pioneer.ai/v1`:

- `pioneer-flash`: internal profile model `deepseek-v4-flash`, remote model
  `deepseek-ai/DeepSeek-V4-Flash`
- `pioneer-pro`: internal profile model `deepseek-v4-pro`, remote model
  `deepseek-ai/DeepSeek-V4-Pro`

Pioneer currently reports `thinking.supported=false` and `max_tokens=4096` for
these DeepSeek models, so the Pioneer profiles disable reasoning parameters and
cap their model metadata at 4096 output tokens.

## Transcript Audit

Each ingest or review run writes a run directory under:

```text
wiki/transcripts/runs/
```

Each run directory contains:

- `summary.md`: command, provider, model, session path, event path
- `events.jsonl`: harness and agent events
- `response.md`: assistant text response
- `usage.json`: per-provider-response token, cache, and cost records
- `usage.md`: human-readable usage summary

The pi-agent-core session JSONL is written under:

```text
wiki/transcripts/sessions/
```

Use:

```bash
bun run harness transcripts
bun run harness trace
bun run harness trace 2026-06-06T18-41-57-900Z_review_euthyphro
bun run harness usage
bun run harness usage 2026-06-06T18-41-57-900Z_review_euthyphro
```

Transcript files are ignored by git. They are local audit artifacts for checking
what the harness sent, what the model returned, and what events occurred.
Prefer `bun run harness trace [run-name]` before reading raw `events.jsonl`; it
prints compact TOON-style text with event counts, tool writes, validation
rejections, usage totals, and the final response.

## Source References

Observation records should cite raw Greek through `source_ref` metadata produced
by `wiki_source_span`. The model supplies a dialogue slug and Stephanus span;
the tool supplies `source_path`, `start_char`, `end_char`, and `text_sha256`.
Do not ask the model to copy Greek passages into observation records.
