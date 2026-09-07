# Corpus operations

## Ownership

Codex or Claude owns semantic judgment. The repository owns deterministic source
references, schemas, integrity checks, bounded generic writes, and projections.
There is no repository-managed provider session, model selector, or ingest/review
queue. The two Bun workspaces are `packages/harness` (domain operations) and
`packages/cli` (command-line interface).

## Dispatch and independent review

```bash
bun run harness job manifest --write
bun run harness job list
bun run harness job show <job-id>
```

The job manifest derives failing completeness leaves. Its stable IDs are
`<family-slug>/<scope>`. `job show` supplies expected and observed state, input
paths and hashes, standing instructions, dependencies, and the submission path.
Use those briefs rather than maintaining another work manifest. Refresh after
landing work; `job list` and `job show` reuse `.cache/jobs/manifest.json`.

An orchestrating agent may delegate independent bounded slices. Give a worker
one job ID or exact Greek source range, the output ledger, and the acceptance
criteria. A second agent can independently review that same source without
being asked to defend the first agent's conclusion. One integrating agent owns
the final ledger and one concise receipt containing affected IDs, source refs,
accepted decisions, reasons, independent-review outcome, and validation.

Use read-only workers when several agents need the same ledger. Direct writers
must have disjoint paths. Keep intermediate notes and candidate calls ignored
under `scratch/`; do not commit prompts, dispatch state, or reviewer worksheets.
Report accepted corpus changes and unresolved disagreements.

[OpenAI's subagent guidance](https://learn.chatgpt.com/docs/agent-configuration/subagents)
supports bounded independent tasks, concise returned findings, and caution with
concurrent writes. The repository's evidence contract stays the same across
agent clients; no client-specific orchestration adapter is required.

## Deterministic tools

```bash
bun run harness wiki ingest
bun run harness wiki ingest scratch/calls.json
```

Without a calls file, the command prints the tools and JSON schemas available
in the selected mode. With a file or `-` for stdin, it executes an array of
`{name, arguments}` calls. For example:

```json
[
  {
    "name": "wiki_source_span",
    "arguments": {"dialogue": "euthyphro", "stephanus_span": "5d-6e"}
  }
]
```

Copy the returned `source_ref` unchanged into the observation. Store only short
Greek terms, not passages. Once a complete ledger is ready, put
`wiki_stage_observation` and `wiki_commit_observation` in the same invocation:
staging is in memory and validates without writing. The commit is the final
accepted whole-ledger write. A malformed tool argument rejects the calls before
execution; separate successful writes are not a multi-file transaction.

Other modes expose segmented observation, claim, relation, and review writers.
Inspect their schemas and follow the job's submission instructions. Review
status changes require a same-change canonical receipt under `wiki/review/`.
`bun run validate` checks that provenance. Ontology uses direct reviewed edits
to `wiki/ontology/*.jsonl`; see [ontology vNext](ontology-vnext.md).

TypeScript callers can use `createWikiTools`, `executeWikiToolCalls`, and the
deterministic planners exported by `@plato-observation-wiki/harness`.

## Locks and generated files

Generic apply gates lock the repository-relative paths they write. Locks live
under `scratch/wiki-write-locks/`, acquired in sorted order for multi-path
operations. Keep all cooperating writers on the same checkout and lock domain.
Apply gates retain merged artifacts under `wiki/submissions/`; scratch is never
durable evidence.

Token indexes regenerate with `bun run derive`. They remain ignored and can be
shipped as optional release assets. Temporary ontology verification output lives
under `scratch/ontology/`, so verification needs no writable sibling directory.

## Commentary, audio, and historical transcripts

Repeated commentary audit/rewrite work still uses the bounded campaign runner.
Its quality gates, evidence reuse, compute budget, and independent sample are
specified in `AGENTS.md` and [the commentary protocol](commentary-protocol.md).
Do not replace a paid campaign with one agent per unit or repeatedly audit
unchanged failed prose.

Audio uses the local GPU and [audio production workflow](../scripts/audio/README.md).
Neither operation belongs in `bun run ci`.

Existing ignored transcripts remain inspectable without provider configuration:

```bash
bun run harness transcripts
bun run harness trace [run-name]
bun run harness usage [run-name]
```

Prefer these compact summaries before opening raw event files. Historical
transcripts and `wiki/ingest-log.md` explain past runs; they do not replace the
accepted semantic decision receipt.
