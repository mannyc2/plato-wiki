# Personality

Do not be sycophantic. When writing tests validating seemingly bad logic or
ideas, question the user. Assume hard cutovers with no legacy fallbacks unless
the user explicitly asks for compatibility.

## Goal-Driven Execution

Define success criteria and loop until verified.

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

## Plato Wiki Rules

- Extract records, not readings.
- Use Greek source files under `raw/plato/greek/` as the canonical extraction
  input.
- Do not read translation files during extraction unless the user explicitly
  asks for human comparison; the same exclusion covers `raw/plato/english/`,
  which is a rendering/commentary source only.
- Do not ask an agent to find hidden meanings or generate hypotheses during
  ingest.
- Observation records cite source refs and short Greek terms, not copied Greek
  passages.
- Prefer deterministic derived data and tool validation over model-written
  mechanical facts.
- During ingest, use `wiki_stage_observation` for drafts and retries, then
  `wiki_commit_observation` exactly once for the final accepted ledger.
- Any pass that changes `review_status` values -- harness-driven or manual --
  must add or modify one concise canonical decision receipt under
  `wiki/review/` in the same change set. Review decisions without a committed
  receipt are treated as unreviewed. `bun run validate` enforces this for
  uncommitted status changes. `wiki/ingest-log.md` may record harness run
  history, but it is not required review-decision provenance.
- Keep observation extraction unclassified. Comparison axes, concepts, and
  many-to-many memberships live only in `wiki/ontology` and follow
  `docs/ontology-vnext.md`; clusters and dossiers are deterministic projections,
  not peer ontologies. Use hard cutovers with no legacy aliases.

## Corpus Curation Operating Model

The durable evidence chain is deliberately small:

```text
Greek source slice -> accepted semantic decision -> canonical corpus diff
                   -> generic schema and integrity validation
```

- Codex agents perform semantic curation directly from the Greek source and
  canonical ledgers. A second agent may independently review the same bounded
  slice; the accepted result is written to the canonical ledger and one
  decision receipt.
- A decision receipt records the corpus scope, affected stable IDs, source
  references, accepted disposition and reason, independent-review outcome, and
  final validation. It does not preserve prompt bytes, response hashes,
  dispatch state, intermediate reviewer files, or a replayable model workflow.
- Deterministic code owns mechanical facts and generic integrity: parsing,
  offsets, hashes of canonical sources, schemas, referential integrity,
  ontology membership, stable-ID collisions, duplicate/conflict reporting,
  safe generic writes, and derived-data rebuilds.
- One-time packetizers, verdict/adjudication schemas, cohort manifests,
  projectors, guarded writers, intent receipts, and workflow replay harnesses
  are not repository artifacts. If temporary files help an active review, keep
  them ignored under `.wave2-scratch/` or outside the repository and discard
  them after the accepted decision is recorded.
- Add durable machinery only when a recurring corpus operation cannot be
  expressed by the existing generic ledger tools. Name it for that stable
  operation, not for a plan, wave, dialogue, cohort, or date.
- Report success first as corpus delta: records reviewed, corrected, split,
  deduplicated, accepted, rejected, or added. Scripts, schemas, receipts, and
  validators are costs, not progress measures.

`bun run validate` rejects newly added or modified coordination scratch, frozen
reviewer worksheets, plan-specific scripts, and coordination-only review
receipts. Existing historical artifacts are read-only legacy evidence, not
templates for new work.

## Work Dispatch

- `bun run harness job list` is the canonical answer to "what is still open".
  Each job is one failing completeness leaf; the id is `<family-slug>/<scope>`.
- A dispatched agent gets its brief from `bun run harness job show <job-id>` —
  expected, observed, inputs, instructions, and the commands that submit. Do not
  hand-write work packages for work the manifest already describes.
- Follow the lane's submit path. Where a generic apply gate exists, preview
  before applying; where a lane is manual, make the direct, reviewable
  canonical-ledger edit required by the corpus curation operating model.
- Apply gates record the merged artifact under `wiki/submissions/`. Generated
  artifacts live in gitignored `scratch/`; do not treat a scratch path as
  durable provenance.

## Transcript Audit

Raw transcript event files can be huge. Prefer compact CLI views before reading
`events.jsonl` directly. `trace` output is compact TOON-style text, not JSON.

Use:

```bash
bun run harness trace [run-name]
bun run harness usage [run-name]
bun run harness transcripts
```

Read raw `wiki/transcripts/runs/*/events.jsonl` only when the compact trace
does not answer the question.

## Commentary Audit Compute Budget

- Use the commentary campaign runner for repeated Luna audit and rewrite jobs.
  Do not spawn one collaboration subagent per unit, rewrite, or sample.
- If a collaboration subagent is genuinely required for a disputed semantic
  judgment, dispatch `gpt-5.6-luna` with `fork_turns: none` and a compact,
  file-backed brief. Use medium reasoning for the exhaustive audit; high
  reasoning is reserved for a bound rewrite or contested adjudication, never an
  unchanged retry-to-green audit. Reapply this rule after compaction.
- Keep provider concurrency at four or lower. Concurrency changes wall-clock
  parallelism only; it does not reduce the selected job set or expected token
  budget. Use `--max-new-jobs <n>` to cap new paid calls. Launch one bounded
  batch, wait for its aggregate result, and inspect failures only. Do not use
  one-second polling, per-unit status turns, or parallel reviewer agents while
  a provider batch is running.
- Run `commentary-campaign.ts preflight` before paid work and use its complete
  classification report. Mechanical listener-prose failures must be repaired
  before semantic review. Use `commentary-campaign.ts usage` for recorded token
  totals. A stale or malformed artifact may be previewed with `retry`; only
  `retry --execute` may archive it. Current passing or semantic-failure evidence
  is not retryable.
- Audit execution must inject the exact hash-bound quality excerpt and unit
  brief in the initial stdin packet; include unit source once and never spend a
  model/tool turn rediscovering or rereading those files. Stop assigning
  untouched jobs after the first generation or validation failure while
  already-started jobs drain.
- Complete one per-block pass and one whole-unit cross-block pass inside the
  same audit response, accumulating every finding. A semantic failure advances
  to rewrite and independent adjudication; do not re-audit unchanged prose to
  chase a pass.
- Before the first paid call, build every audit brief and manifest, validate all
  existing manifests under the current parser, and complete one end-to-end smoke
  through audit, rewrite, adjudication, changed-prose audit, and manifest
  handling. Freeze the prompt, schema, parser, model catalog, and protocol for
  the scaled wave.
- A prompt or parser correction discovered after scale-up is an impact-analysis
  gate, not permission to rerun the corpus. Reuse accepted canonical unit output
  when its ledger, protocol, deterministic audit brief, model, effort, output
  hash, and stricter parser all still match. Rerun only incompatible units.
- When refreshed audit evidence changes no commentary bytes, use
  `commentary audit-manifest-refresh-preview` and then
  `commentary audit-manifest-refresh-apply`; preserve the existing independent
  sample. Any commentary-byte change still requires a fresh sample.

## Validation

After harness, schema, or generated-wiki changes, run:

```bash
bun run test
bun run typecheck
bun run validate
```

`bun run validate` should validate observation ledgers and print the feature
family drift report.

## Backup

The private `origin` remote is the off-machine backup. After any session
that commits corpus, provenance, or harness changes, run `git push origin
main`. Do not make the remote public without first confirming the licensing
posture of `raw/plato/greek/` sources. Per-file provenance and the
licensing posture live in `raw/plato/SOURCES.md`; update it when adding
sources.

## Remote GPU Dev Access

When a dev server is running on `ssh gpu` and the user needs to open it from the
local Mac:

- Prefer direct Tailscale URLs for normal HTTP services:
  `http://cjpher.tail5aecb5.ts.net:<port>` or `http://gpu:<port>` if MagicDNS
  resolves.
- If the app or OAuth flow specifically requires `https://localhost:<port>`,
  run `dev-https <port>` locally. Use
  `dev-https <local_https_port> <remote_port>` when the local and remote ports
  differ.
- To stop the localhost HTTPS bridge, run `dev-unhttps <port>` or
  `dev-unhttps <local_https_port> <remote_port>`.
- For plain localhost-only forwarding, use `dev-forward <port>` and
  `dev-unforward <port>`.
- Do not recreate ad hoc Node/Caddy/mkcert proxy files for this workflow unless
  the helper scripts are broken; fix the helpers instead.
- `ssh gpu` is the standard alias for the GPU box and should remain a plain SSH
  connection over Tailscale, not a bundle of static `LocalForward` ports.
