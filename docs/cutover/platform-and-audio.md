# Platform, audio, and release cutover

Status: proposed; implementation and deployment have not started.
Planned at Plato `8a5e4c2`, 2026-10-09. Revised 2026-10-26; HEAD unchanged at 8a5e4c2. Rat-stack reference: `3fb103b2c6fdeba9460d387827f9d4fd1525d9cc`.
Priority: P1. Effort: L. Risk: high because the final steps change durable authority.

## Outcome and boundaries

Establish Effect, compiler diagnostics, and architectural lint before adding the replacement runtime.
Use Alchemy to own infrastructure. Keep CUDA synthesis and FFmpeg processing on the GPU host.
Activate one complete database-backed release, with one writer and a tested recovery procedure.

Read [architecture.md](architecture.md), [data.md](data.md), and [application.md](application.md) before execution.
This plan owns the P0 export guard, foundation, deployment, artifact storage, audio domain schemas, and audio orchestration.
The data plan owns corpus schemas, SQL storage implementation, migration, duplicate disposition, and atomic review writes.
The application plan owns shared surface contracts, browser behavior, Markdown, and remote agent authorization.
This plan does not authorize paid rendering, public source distribution, cloud changes, or dependency installation during planning.
`DEC-` identifiers refer to the decision register in [README.md](README.md), which owns their status and rationale.

Before implementation, use an isolated `codex/` worktree. Preserve the existing dirty checkout.
At planning time `.gitignore`, `package.json`, and `bun.lock` were modified; `packages/demo/` and `output/` were untracked; the same paths were dirty on 2026-10-26.
Run `git diff --stat 8a5e4c2..HEAD -- package.json bun.lock tsconfig.base.json .oxlintrc.json scripts/ci.ts .github/workflows packages/cli packages/harness scripts/audio scripts/release release docs/audio-edition-protocol.md`.
Compare changed inputs with this plan. Stop on conflicting ownership or changed acceptance requirements.

## Current evidence

| Existing path | Behavior that the replacement must account for |
| --- | --- |
| `package.json`, `tsconfig.base.json`, `.oxlintrc.json` | Bun 1.4.0 pinned in `packageManager` and CI; TypeScript `^5.9.3`; strict types; Oxlint 1.81.0; no Effect dependency or Node version pin. |
| `scripts/ci.ts` | Runs lint, tests, typecheck, corpus validation, and a disposable static build through `bun run ci`. |
| `.github/workflows/ci.yml`, `packages/harness/src/ci-workflow.test.ts` | The `verify` job has no provider credentials or billable work and installs no Node; the same workflow's `deploy` job publishes to GitHub Pages. |
| `packages/harness/src/site/server.ts`, `site/recordings.ts` | Local HTTP file serving, byte ranges, recording hashes, and chapter navigation metadata. |
| `scripts/audio/README.md`, `docs/audio-edition-protocol.md` | Preview and execute stages bind input hashes; mechanical QA and production acceptance are distinct. |
| `scripts/audio/render_dots.py`, `master_audio.py`, `qa_full_master_asr.py` | CUDA synthesis, content-addressed chunk resume, mastering, and ASR engines; their `tests/` unit tests run only via the README's "Local pure tests" command, not `bun run test` or CI. |
| `packages/harness/src/audio-production.ts`, `scripts/audio/promote_audio_qa.py` | Recording and QA acceptance constraints; moving storage must preserve their meaning. The promoter writes `audio/qa/` and `wiki/recordings/`; recording status is `draft`, `accepted`, or `withdrawn` (`recording-manifest.ts:15`). |
| `release/public-files.toml` | Prefix allowlist that includes `docs/`; P0 excludes `docs/cutover/`. |

On 2026-10-09, the existing listening build held 27 `complete.mp3` files totaling 2,804,604,768 bytes; a read-only re-measurement on 2026-10-26 was unchanged.
The measured directory is the review build's external `--out-dir`, built with `PLATO_RECORDING_ARTIFACT_ROOT` (or `--recording-artifact-root`) and `--review-recording-manifests` as in [Serving the listening site](../wiki-browser-design.md#serving-the-listening-site).
This is a serving-copy measurement; lossless masters, cache chunks, references, and backups require a separate inventory.
The recordings remain review candidates. Playback checks do not grant editorial acceptance.

## Reference rules applied here

Read these through rat-stack MCP search/read before changing their corresponding code:

- [Gardener](https://ratstack.sh/skills/gardener): check exact pins, read matching source, and prove a lint rule before fixing its findings.
- [Fence](https://ratstack.sh/systems/fence): compiler and lint failures enforce architecture; new rules run against real lint fixtures.
- [Learn Alchemy](https://ratstack.sh/skills/learn-alchemy): one resource graph, explicit stage, reviewed plan, and provider-backed verification.
- [Lifecycle machines](https://ratstack.sh/skills/add-a-lifecycle-machine): named lifecycle states use XState; Effect actors own work and cleanup.
- Rat-stack mode principles: keep the stack floor, use real provider guarantees, measure real limits, keep execution receipts, and prove-move-delete.

Plato retains Bun and comments explaining reasons or trade-offs. Rat-stack's pnpm commands and blanket comment ban are not adopted.
The installed Codex `effect-ts-joelhooks` skill still shows older `ServiceMap` examples (2026-10-26). The pinned current source and rat-stack's `Context.Service` pattern take precedence.
Do not copy rat-stack's whole scaffold, model harnesses, vendor selector, or permission policy into Plato.
Borrowed implementation and lint code must preserve its license and record its source revision in the root `PROVENANCE.md` (proposed) that P1 creates.

## P0 — Before these plans are committed

Depends on: nothing. It gates the first commit that tracks `docs/cutover/`; this planning pass does not edit release files.
Scope: `release/public-files.toml`.

`scripts/release/export-public-tree.ts` exports only `git ls-files` paths selected by prefix from `release/public-files.toml` (lines 39–43), whose `include` has `docs/`.
It requires a clean tracked tree (lines 32–37) and rejects any selected file containing a private absolute home-directory path (lines 46 and 66).
This document held the only such path until this revision; a read-only simulation of the selection and text guards on 2026-10-27 selected all six cutover documents, none with the prefix excluded, and no other guard failed.

1. Add the exact prefix `docs/cutover/` to `exclude` in `release/public-files.toml` in the same commit that first tracks `docs/cutover/`.
   The exporter matches prefixes, not globs. No earlier commit may track a cutover document.

**Verify:** in a clean worktree of that commit, after `bun install --frozen-lockfile`, create an empty directory `$tmp` outside the repository and run
`bun run public:export -- --out-dir "$tmp/tree" --manifest "$tmp/public-manifest.json"`.
It must exit 0, and `grep -c '"docs/cutover/' "$tmp/public-manifest.json"` must print `0`.

## P1 — Install the foundation and enforce the boundaries

Depends on: architecture agreement; no database selection is needed.
Scope: root manifests and lockfile, `.node-version`, `tsconfig.base.json`, workspace tsconfigs, `oxlint.config.ts`, `scripts/oxlint-plugin-boundaries.ts`,
`scripts/oxlint-plugin-patterns.ts`, `packages/core/test/fence.test.ts`, workspace test configuration, `scripts/ci.ts`, `.github/workflows/ci.yml`,
`AGENTS.md`, `README.md`, and new root `VISION.md` and `PROVENANCE.md`.
Introduce each package only with its first real contract, implementation, or executable test; do not create empty future-package manifests.
Keep the existing `packages/cli` location. Expand Bun workspace discovery to include `apps/*`.

1. Record the exact version set in manifests and source references before installing.
   Rat-stack reference pins, planning revision (2026-10-09) → current MCP `pins.md` (2026-10-26): Effect 4.0.0 → 4.0.6; TypeScript 7.0.2, unchanged;
   `@effect/tsgo` 0.45.0 → 0.55.0; Oxlint and `@oxlint/plugins` 1.83.0 → 1.88.0; `oxlint-tsgolint` 7.0.2002 → 7.0.2004; Alchemy 2.0.0-beta.80 → 2.0.0-beta.84.
   Upstream has since split Cloudflare resources into `@alchemy.run/cloudflare` and runs `@yielded/effect-tsrs` for routine `typecheck`; read the Fence page at the chosen pin before copying either.
   These are reference pins, not permission to install incompatible adapters. Verify peer ranges and execution through Bun scripts against each chosen package.
   `bun run` runs a bin's `#!/usr/bin/env node` shebang on whatever `node` is on `PATH` unless `--bun` is passed ([Bun docs](https://bun.com/docs/runtime), 2026-10-26); without `node`, local Bun 1.4.2 ran it itself.
   Vitest 5.0.5, Playwright 1.64.1, Wrangler 4.153.0, Alchemy, `effect-tsgo`, and today's `tsc` and `oxlint` bins use that shebang (npm registry and jsDelivr, 2026-10-26).
   Pin one exact Node release in `.node-version` and `engines.node`, read by a SHA-pinned `actions/setup-node` step that `ci-workflow.test.ts` asserts like the Bun pin.
   Vitest 5.0.5 needs Node `^22.12.0 || ^24.0.0 || >=26.0.0`; rat-stack's `.nvmrc` is 24.18.0 at both revisions; the planning host's fnm has 24.14.1 and 24.15.0.
   Move Effect runtime and platform adapters together. Introduce XState and `@xstate/effect` only with P3's real lifecycle.
   Generate the reviewed lockfile with Bun after selecting compatible pins; then verify a separate frozen-lockfile install.
   Never reuse an Effect release-candidate example because its tag appears newer than stable.
   Pin compatible `@effect/vitest` and Vitest for new Effect behavior tests, with `@cloudflare/vitest-pool-workers` and Playwright for the application suites.
   Resolve the Vitest peer conflict between `@cloudflare/vitest-pool-workers` and `@effect/vitest` that [application.md](application.md#implementation-sequence-and-verification) records before `test:worker` exists.
   Each owning workspace supplies its Vitest configuration and test script.
   Keep Bun for the existing harness regressions and their plain subprocess fixtures; new core/infra/audio tests use Vitest.
   Use standard Vitest tests for new real-process/compiler fixtures and `@effect/vitest` for Effect behavior cases.
   The root workspace gate must execute each package's declared test script, rather than run every test through one runner.
2. Start with rat-stack's compiler integration: `prepare` runs the pinned `effect-tsgo patch`.
   Apply error severity for floating Effects, missing contexts/errors, leaked requirements, unsafe Effect assertions, and nested runtime execution.
   Use type-aware Oxlint for the architectural plugins. Give each supported violation an explicit diagnostic or rule identifier.
   The [official Oxlint integration](https://github.com/Effect-TS/tsgo/blob/main/docs/README.md) separately uses `patch --oxlint` and the `effecttsgo` preset.
   Verify that integration against the installed pin before enabling it; rat-stack's current manifest does not itself claim that patch.
   Do not claim an editor setting enforces CI, or disable compiler diagnostics to hide duplicated reporting.
3. Enforce this import graph using resolved package exports, relative paths, re-exports, and literal dynamic imports:

   | Importing code | Allowed project dependency direction |
   | --- | --- |
   | `packages/capability` | Effect infrastructure only; no Plato domain or application imports. |
   | `packages/core` | Capability contracts and Effect; owns domain schemas, job-shaped ports, and domain handlers. |
   | `packages/database`, `packages/artifacts`, `packages/audio` | Core ports/contracts and capability helpers; no app imports or implicit cross-adapter wiring. |
   | `apps/web/src/features`, `apps/web/src/client` | Browser-safe contract/RPC exports and `apps/web/src/design`; no server handlers, database, storage, or GPU modules. |
   | `apps/web/src/design` | Browser-safe UI libraries only; no contracts, features, server handlers, database, storage, or GPU modules ([design system](design-system.md)). |
   | App/CLI composition roots | Core and required adapters; provide each service once at the boundary. |
   | `apps/infra` | Resource declarations and deployment wiring; runtime modules must not import this composition root. |

4. Keep provider APIs, filesystem access, child processes, mutable configuration, and secrets outside core.
   Services capture dependencies when their Layer is built; methods return typed Effects with no hidden runtime requirements.
   Construct pools and processes inside scoped acquisition. Close them on success, error, and interruption.
   Ban `Effect.run*` inside services. Permit execution only at named HTTP, CLI, or process entry points.
   Ban handwritten HTTP/MCP/RPC contracts outside capability projections, feature-level transport, and request-shared mutable state.
   Reject `any`, `as unknown as`, non-null assertions used to evade validation, and silent error swallowing.
   Decode unknown inputs and provider responses. A narrow unavoidable framework assertion needs a checked invariant and a focused test.
5. Add positive and negative fixture programs in `packages/core/test/fixtures/fence/`.
   Spawn the actual patched compiler and Oxlint from `fence.test.ts`; fixtures must not enter the product build.
   Keep this test Vitest-compatible because the application contract suite also includes core tests; do not import `bun:test` here.
   Prove rejection of an aliased adapter import, relative cross-layer import, browser re-export of a handler, design-system import of a contract,
   floating Effect, leaked service requirement, service-side `runPromise`, unsupported cast, and module-level mutable request cache.
   Prove valid composition roots and a schema-decoded adapter pass. Temporarily break each rule and observe its fixture fail.
6. Keep the full existing CI gate. Register all new workspace tests, typechecks, lint scopes, and build outputs.
   New replacement packages start with zero fence violations. Any temporary scope around retiring harness modules names its deletion gate.
   Do not blanket-disable rules for `packages/**`, inflate an exception baseline, or patch dependency typings to bypass incompatibility.
   If hooks are introduced, run the same checks and test their command policy; CI remains independently enforcing.
7. Write a short `VISION.md` covering the reader, agent access, source fidelity, and explicit product exclusions; link `SPEC.md` for record contracts.
   Add rat-stack MCP search/read guidance and the architecture link to `AGENTS.md`, alongside the enforced package boundaries.
   Update `README.md` with installed tooling and verified commands only; retain proposed architecture labels until their behavior ships.
   Create `PROVENANCE.md` with a licence, origin and source-revision entry per borrowed file, starting with any rat-stack lint or compiler-integration code adapted here; later steps add theirs, such as DS2's fonts.
   Corpus authority, review provenance, and backup governance remain unchanged during foundation. P4 step 5 owns their activation update.

**Verify:** `bun install --frozen-lockfile`, `bun run typecheck`, `bun run lint`, and `bun run ci` exit zero in a clean checkout, with `node --version` equal to the pin locally and in CI.
**Proposed** root `test:fence`: `vitest run --config packages/core/vitest.config.ts packages/core/test/fence.test.ts`.
`bun run test:fence` must demonstrate failing prohibited fixtures and passing legal fixtures.
Keep source mirrors outside product commits and record their exact tags. Stop if the pinned toolchain cannot run through Bun scripts on the pinned Node.

## P2 — Prove one storage provider and declare the deployable system

Depends on: P1 and the data plan's D1a inventory and D1b local atomic-write proof; provisioning also needs DEC-04, DEC-13, and DEC-14.
Scope: `apps/infra/alchemy.run.ts`, `apps/infra/package.json`, `apps/infra/test/stack.test.ts`, binding declarations for
`apps/web/src/worker.ts` (the Worker entry that application step 1 creates), `packages/database/src`, `packages/artifacts/src`,
their tests, and `.github/workflows/integration.yml`.
P2 finalizes the database choice (DEC-02) with real-provider evidence before the production import.
The early P3 schema handoff can run before P2; it has no dependency on a selected provider.

### Budget and provider gate

Prices and limits below were rechecked on 2026-10-26 and were unchanged from 2026-10-09. Recheck them before provisioning (DEC-04) and include account usage from other projects.

| Resource | Included allowance / constraint | Planning implication |
| --- | --- | --- |
| [Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/) | $5 monthly minimum; 10 million requests and 30 million CPU milliseconds. | The minimum is not a spending cap; SSR, APIs, and proxied audio can consume metered execution. Static-asset requests are free. |
| [D1 Paid](https://developers.cloudflare.com/d1/platform/pricing/) | 5 GB storage, 25 billion rows read, 50 million rows written per month. | Indexed bounded queries are favorable; scans and index maintenance affect usage. |
| [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) | 10 GB per database and 2 MB per row. Per-statement limits (100 KB of SQL, 100 bound parameters) also apply inside a batch; a batch counts once toward Workers Paid's 1,000 queries per invocation; the 30-second limit covers the whole batch call. | Import in bounded batches, but never split one accepted edit into independently visible commits ([data D1b](data.md#d1b-prove-the-atomic-operation-and-choose-the-database)); test large records and serialized write contention. |
| [R2 Standard](https://developers.cloudflare.com/r2/pricing/) | 10 GB-month, 1 million Class A and 10 million Class B operations free; free egress. | Current listening MP3s fit storage allowance alone. Other assets and account usage still count. |
| [Hyperdrive](https://developers.cloudflare.com/workers/platform/pricing/#hyperdrive) with hosted PostgreSQL | Hyperdrive queries are included on Workers Paid; the origin database is billed separately. | Price the chosen host's compute, storage, backup retention, and transfer before selecting it. |

R2 is object storage, not a running SQL database. A SQLite object there is an export or backup.
Prefer Cloudflare D1 if the data plan's atomic mutation and labelled-batch reads can be expressed and proved using its real batch semantics; this probe repeats [data D1b](data.md)'s batch and stale-revision cases and data D1b's interleaved-commit read case through real bindings.
Do not assume an Effect SQL transaction abstraction adds guarantees that the binding lacks.
If Cloudflare D1 fails the required mutation, read consistency or measured contention envelope, select PostgreSQL and document its incremental monthly cost.
Retain only the selected database adapter and migrations; [Deletions](#deletions) removes the loser.

1. Declare a single Alchemy stack with named `dev`, `integration`, and `prod` stages (DEC-14).
   Reject missing or unknown deployment stages; never rely on `live_$USER` defaults.
   Own Worker, static assets, selected database or Hyperdrive, private R2 storage, bindings, and any domain mapping in that graph.
   If PostgreSQL wins, name the origin provider and its provisioning owner. Hyperdrive does not provision the origin database.
   Use Alchemy for new resource ownership; stop if the selected provider lacks a supported ownership path.
   Adopt existing resources only by exact identity. No parallel Terraform, dashboard-created dependencies, or independent Wrangler deployment manifest.
2. Keep credentials in Alchemy profiles and protected deployment configuration. Persist deployment state durably and test recovery of that state.
   Keep provider tokens out of repository files, browser bundles, and runtime bindings that do not need them.
   Declare bindings beside their consumers; test missing or incorrectly typed bindings as startup failures.
   Request-specific identity and DB sessions must not leak across Worker requests.
   Platform supplies the [application-owned](application.md) identity adapter's validated configuration, bindings, and secret references; it does not implement a second identity path.
3. Implement `ArtifactStore` in `packages/artifacts/src/r2.ts` behind the core port (DEC-13).
   Use immutable content keys and verified length/hash metadata. Publish a catalog reference only after object verification succeeds.
   No cross-system transaction is assumed: failed DB registration leaves an unreferenced object for bounded cleanup.
   Test a retry after upload completion but before registration, corrupt content, missing object, and interrupted multipart upload.
   Serve only authorized catalog entries; choose public access from licensing and acceptance rules (DEC-05), never bucket convenience.
4. Add `apps/infra/test/provider-contract.test.ts` for the disposable integration stage.
   Exercise concurrent stale edits, mid-batch rollback, idempotent retries, missing bindings, the exact review-write contract, and [data D1b](data.md#d1b-prove-the-atomic-operation-and-choose-the-database)'s interleaved-commit read case: a commit between parent, join and evidence reads yields one revision's complete result or `RevisionChanged`, so DEC-02 is never decided on writes alone.
   P3 step 2's SQL-only `accept` case joins this suite in [execution order](README.md#execution-order-and-ownership) 6, once `accept` exists on the selected adapter; the order 5 probe does not depend on it.
   Test R2 GET/HEAD, conditional requests, open-ended and suffix ranges, unsatisfiable ranges, and playback seeking through the real Worker.
   For PostgreSQL, prove read-after-write through Hyperdrive; disable query caching for mutable authority reads as in the reference adapter.
   For Cloudflare D1, keep read replication disabled until [data D3](data.md#d3-prove-readers-rebuilds-and-portable-recovery)'s session checks pass on this real provider.
   Local SQL or workerd results are development evidence. They do not replace this remote binding check.
5. Measure a bounded import, indexed passage search, largest planned evidence response, and concurrent reading plus curation.
   Record database/index bytes, rows read/written, Worker CPU/request counts, R2 operations, and latency distributions.
   Estimate base and growth workloads using measured units. Include backup retention, logs, playback ranges, and shared-account consumption.
   Keep model API calls and GPU work in separate budgets. Add configurable quotas, rate limits, and account usage alerts.
   Alerts and per-request CPU limits reduce exposure; they cannot guarantee a $5 final invoice.

**Proposed** `apps/infra/package.json` scripts: `plan`, `deploy`, `test` as `vitest run --config vitest.config.ts`, and separate `test:provider`.
**Proposed** root scripts `infra:plan`, `infra:deploy`, and `test:provider`; all require an explicit stage.

**Verify:** `bun run typecheck`, the **proposed** `bun run --cwd apps/infra test`, and `bun run ci` pass for local declarations.
After authorized provisioning, `bun run test:provider -- --stage integration` must pass against real resources, including rejection of a request over a configured rate limit.
Recovering the persisted deployment state into a fresh checkout yields a plan with no changes (step 2).
Step 5's measurements and cost estimate are recorded with the configured quotas, rate limits and alert thresholds.
The final plan must contain only intended identities and bindings. Retain a sanitized result with revision and actual provider outcomes.

## P3 — Port audio orchestration while preserving the engines

Depends on: steps 1–2 (activation subset) need P1 and data D1a; their schemas precede D2's import and may precede P2, while `accept` storage needs the selected adapter.
Steps 3–6 (GPU orchestration) need selected storage adapters implementing that shared model; under DEC-09's recommendation they are off the activation path but precede the next GPU production run.
Scope: `packages/core/src/audio/model.ts`, `packages/core/test/audio-model.test.ts`, audio contracts/ports in core,
`packages/audio/src/{production,machine,engine,checkpoint}.ts`, `packages/audio/test`, `packages/audio/vitest.config.ts`,
CLI composition, `scripts/audio/README.md`, and `docs/audio-edition-protocol.md`.
Modify Python only to expose a missing bounded engine operation. Preserve its substantive synthesis, DSP, and QA behavior.

1. Inventory callers of `render_dots.py`, `master_audio.py`, `qa_full_master_asr.py`, `assemble_audio_qa_handoff.py`, and `promote_audio_qa.py`.
   Separate reusable engines from shell orchestration, stage selection, retries, and receipt writing.
   Map each moved responsibility and its replacement caller before deleting anything.
   The first migration registers existing verified masters and manifests; it does not re-render 27 recordings.
   On 2026-10-26 the external review catalog held 27 manifests, all `draft`, and tracked `wiki/recordings/` held one `withdrawn` manifest; register all 28 with those dispositions.
   Read that catalog through the review build's configuration (`--review-recording-manifests`, `PLATO_RECORDING_ARTIFACT_ROOT`); data D1a inventories tracked files only.
2. This plan's audio owner defines recording, chapter, QA, and operation schemas in `packages/core/src/audio/model.ts`.
   Data owns their selected-dialect tables, foreign keys, migrations, and row decoders under `packages/database`.
   Integrate this schema handoff before D2; audio orchestration does not need to be running for import.

   | Logical storage shape | Required identity, references, and invariant |
   | --- | --- |
   | `recording` | Stable recording ID/revision, work/source-version FKs, complete-master artifact FK, input digest, and explicit `draft`/`accepted`/`withdrawn` disposition. |
   | `recording_chapter` | Recording-revision FK, stable chapter ID, unique ordinal, exact start frame (manifests store only `start_frame`; derive end frames and sample rate from verified mastering evidence); chapter artifact required for acceptance; optional commentary FK. |
   | `audio_qa` | Recording-revision FK, exact evaluated artifact digest, evidence-artifact FK, mechanical/ASR/listening findings, and explicit unknown/not-performed outcomes. |
   | `recording_acceptance` | Recording-revision and QA FKs, canonical decision-receipt FK, authorizer and disposition; acceptance binds that exact media and evidence. |
   | `audio_operation` | Stable operation ID, input digest, target recording revision, durable state/checkpoint, version, lease owner/expiry and fencing token. Terminal results reference the shared `operation_result`. |
   | `recording_timing` (derived), the per-entry timing index | Recording-revision FK and per-entry start/end frames in the complete master, keyed by screenplay entry ID, with each entry's English UTF-16 start and end in the bound source version so reading lines map to entries by overlap. The screenplay generator emits these offsets for no entry yet: whole-turn entries can take theirs from the attribution file by turn ID, but `-part-NNN` entries need the generator to emit them (DEC-15). Derive from the renderer assembly sidecar's `timing` items (per-segment frames with `entry_ids`, `scripts/audio/render_dots.py:4194–4330`) through the mastering chapter timeline and edit map (`packages/harness/src/site/mastering-evidence.ts`); a segment grouping several entries yields one interval for the group. Rebuilt, never edited; it must tile each chapter exactly. Consumed by read-along and per-line Play from here in the [design system](design-system.md#data-requirements); not an activation blocker. |

   One recording revision has one ordered chapter inventory; reject overlap, gaps outside declared pauses, and unknown referenced artifacts.
   Mechanical success never promotes a draft/candidate. Accepted publication requires its bound decision and the protocol's required QA evidence.
   Import existing dispositions faithfully; incomplete candidate QA remains explicit. Input changes create a new revision instead of retaining old acceptance.
   State/checkpoint writes use revision checks and fencing; replay of an operation ID with a different input digest fails.
   Define schema-decoded inputs/results for `plan`, `render`, `master`, `audit`, `publish-candidate`, and `accept` operations.
   Include source revision, screenplay/cast/model/tool hashes, ordered chapters, artifact keys, and operation identity.
   Validate full input identity before work. Preserve UTF-16 source offsets and source hashes through the data contract.
   Effect supplies scoped subprocesses, typed failures, logging, timeouts, cancellation, and storage adapters on the GPU host.
   Workers authorize and report jobs; they do not run CUDA, Python inference, or FFmpeg.
   Implement `accept` as the SQL-only recording acceptance operation: its row, decision receipt, and corpus revision commit atomically through the data plan's commit contract.
   It needs no GPU host and writes no repository files; after activation it is the only acceptance path.
   It references only verified artifacts. `promote_audio_qa.py` derives chapter artifacts at promotion today; expose that derivation as a bounded engine operation here, or take DEC-09's strict-ordering alternative.

**Verify (steps 1–2, schema handoff at order 2):** `bun run test` passes `packages/core`'s **proposed** Vitest suite, including schema cases for dangling chapters, stale acceptance, unknown QA, and conflicting operation identities.
**Verify (steps 1–2, `accept` and registration at order 6):** on the selected adapter, a registration rehearsal into an isolated database reads back all 28 recordings (27 `draft` from the external catalog, one tracked `withdrawn`) with digests and dispositions; data D2's **proposed** `bun run test:database -- packages/database/test/recording-accept.test.ts` and the provider suite's `accept` case prove stale, replayed, or unreviewed `accept` calls write nothing.
Separately, and without gating P4, a `recording_timing` rebuild over each registered recording's evidence either tiles every chapter exactly or reports that recording as having no index.

3. Introduce XState only for the durable audio production lifecycle: planned, rendering, mastering, auditing, candidate, accepted, failed, or cancelled.
   State changes describe observed outcomes. A requested render or process start is not a completed render receipt.
   Keep human/editorial acceptance separate from mechanical QA; an artifact may stay a candidate after successful playback.
   Use declared Effect actors with the pinned `setupEffect` / `createEffectActor` pattern. Keep effects out of inline state callbacks.
   Simple reads and transforms remain direct Effects. Do not build a general model-session, corpus-review, or retry-queue framework.
4. Persist the accepted checkpoint and operation identity after each durable transition.
   A machine snapshot alone cannot prove an external process stopped or an upload completed.
   On restart reconcile process ownership, verified engine outputs, and storage receipts before resuming work.
   Use a claim/lease with a fencing token for each active production job; expired owners cannot publish a newer result.
   Handle the crash window after engine success but before checkpoint persistence by checking exact output identities.
   Interrupt the process group, wait for termination, preserve verified chunks, and reject partial outputs as complete.
5. Preserve exact resume: matching hashes reuse chunks without loading the GPU runtime; changed inputs invalidate the relevant cached work.
   Preserve authoritative frame counts, chapter starts, silence/crossfade rules, QA findings, and existing human-acceptance evidence.
   Never infer acceptance from object existence, successful upload, or elapsed time.
   Store one canonical operation result and the required decision receipt; avoid parallel receipt indexes or campaign-specific artifacts.
6. Add meaningful tests in `packages/audio/test/{production,machine,engine}.test.ts`.
   Cover interrupted render, stale lease, duplicate execution, lost success response, changed model/input hash, corrupt cache chunk,
   upload-before-checkpoint crash, mastering failure, chapter-frame drift, and attempted acceptance without the required review.
   Use Effect's virtual clock for leases and retries. Generate independent lifecycle histories, including events after terminal states.
   Run a real tiny FFmpeg interop fixture offline. Run a separately authorized GPU smoke with one bounded existing screenplay (DEC-08).
   Compare preserved hashes/frame counts where deterministic; assess stochastic synthesis through existing QA rather than invented byte equality.

**Proposed** root `test:audio`: `vitest run --config packages/audio/vitest.config.ts`; it performs no downloads, model calls, or GPU inference.
**Verify (steps 3–6):** `bun run test:audio`, the existing TypeScript audio regressions through `bun run test`, the existing Python engine tests through the `scripts/audio/README.md` "Local pure tests" command, and `bun run ci` pass.
Record the GPU smoke's actual outcome separately.
Retained Python engines remain one supported implementation; do not preserve the old full orchestration path as a fallback.

## P4 — Rehearse recovery, then activate the complete release

Depends on: data D1–D3 import/restore proof, application steps 1–4 and private-preview acceptance, P2 provider proof, and P3 steps 1–2 including the SQL-only `accept`.
Under DEC-09's recommendation P4 does not wait for P3 steps 3–6; the alternative requires all of P3 first. DEC-01 and DEC-07 must be settled before activation.
P4 is the sole activation coordinator. Data D4, application step 5 and design DS5 are subordinate checklists executed inside P4, not prerequisites for starting it.
Scope: `.github/workflows/deploy.yml`, `.github/workflows/integration.yml`, `scripts/release`, `scripts/ci.ts`,
`packages/harness/src/ci-workflow.test.ts`, release manifests, `release/public-files.toml`, and operational documentation.

1. Keep the `verify` job in `.github/workflows/ci.yml` credential-free and nonbillable. Preserve completeness and provenance verification.
   Put authenticated provider tests and deployment in separate protected workflows. Pin every action to a full commit SHA.
   Change existing CI-contract tests with the deployment switch; do not delete their offline invariant to make new jobs pass.
   Re-run P0's export check on the release candidate. Check raw-source licensing through `raw/plato/SOURCES.md` (DEC-05).
   The exporter silently omits unlisted paths; add new public paths such as `apps/`, `VISION.md`, `PROVENANCE.md`, `oxlint.config.ts`, and `.node-version` deliberately.
2. Produce one immutable release identity binding source revision, Worker/static bundle, DB migration version, corpus revision,
   verified artifact inventory, public export manifest, and applicable acceptance decisions.
   Validate the actual built bundle and export, not only build configuration. Do not expose drafts through a deployment flag.
   Prepare the exact Alchemy production plan and cost estimate; review any resource replacement or deletion before applying it.
3. Set backup retention and recovery objectives (DEC-07) from D3's measured restore time and backup age before activation. Take a verified database export/snapshot and matching artifact inventory.
   Preserve raw immutable source bytes, canonical review decisions, schema migrations, Alchemy state, and immutable release artifacts.
   Keep a recoverable copy outside the active database and test restore into an isolated stage.
   If Cloudflare D1 is selected, its Time Travel (currently 30 days on D1 Paid) complements explicit exports and does not back up R2 objects or application state; if PostgreSQL is selected, the origin host's backup retention, priced in P2, is that complement.
   Git origin remains the code/provenance backup; it cannot back up post-cutover database writes by itself.
4. Rehearse a full switch and recovery against the integration stage.
   Test missing media, bad migration, wrong corpus revision, failed health check, and deployment success followed by failed smoke.
   Verify the previous complete release reads its restored schema/corpus/artifact set before treating it as recoverable.
   A Worker-only rollback is invalid when its schema or corpus assumptions differ.
   At the first cutover, the previous release may be only the static site. Recovery may restore that site read-only with every writer frozen.
   Resume writes only after the SQL release and its authority are proved again; never reactivate old file-ledger writers.
5. Freeze all corpus/audio writers. Drain or cancel active jobs, record the final revision, import the final delta, and reconcile counts/hashes.
   Old audio production writers stay frozen until step 7 deletes them; there is no fallback, and no GPU production run starts before P3 steps 3–6 pass.
   Execute data D4, application step 5 and design DS5 under this single freeze and release identity; no lane switches authority independently.
   DEC-01 takes effect in this step, when D4's AGENTS, CONTRIBUTING and SPEC amendments land.
   Switch the domain and all CLI/MCP/browser write destinations to the new release together.
   Verify representative HTML/Markdown/evidence queries and all 27 media entries; test actual seek/resume and review-status visibility.
   Reopen writes, through SQL only, after D4's amendments land and release identity and acceptance checks pass; that completes this step. Remove old writers' access and deployment authority.
   Retained recovery artifacts stay inactive. There is no automatic runtime fallback or dual-write period.
6. If failure occurs before reopening writes, restore the previous complete release or the first-cutover read-only static site under the same freeze.
   After new writes exist, freeze again and export the current database plus decisions before any restore.
   Prefer a forward fix; otherwise reconcile and preserve every post-cutover mutation against the restored release.
   Stop for an explicit recovery decision if reconciliation cannot retain those writes. Never silently discard them to make rollback succeed.
7. After the replacement is verified, delete everything [Deletions](#deletions) gates on activation.
   Retain corpus invariants and valid engine regression tests by moving them to their new owners.
   Update `README.md`, `AGENTS.md`, and the operational guide to drop the deleted paths and name one active writer, deployment path, and validation contract.
   The SQL authority and decision-receipt governance (DEC-01) already took effect in step 5; foundation documentation must not have changed those rules early.

**Proposed** commands: `release:verify`, `release:restore-check`, and an updated version of the existing `scripts/release/smoke-site.ts`.
`release:verify` is local and deterministic; provider smoke/restore commands require an explicit target stage and release identity.

**Verify:** `bun run ci`, the separate provider suite, the restore rehearsal, P0's export check, and a deployed smoke bound to the exact release pass.
Store actual sanitized deployment/restore outcomes with the release; a reviewed plan is not evidence that deployment happened.

## Deletions

Each deletion completes its replacement; none is a cleanup backlog. Nothing here removes Python engines, historical evidence, or corpus invariants.

| Removed | Replacement | Delete when — proof required |
| --- | --- | --- |
| `.oxlintrc.json` | `oxlint.config.ts` (P1) | P1: the new config keeps `correctness` errors and `typescript/no-explicit-any`; an `any` fixture fails `bun run lint`. |
| Losing probe adapter, its migrations, and any vendor selector | The selected adapter (DEC-02) | Before release: `test:provider` passes at `integration`; no import of the loser or selector remains. |
| Orchestration entry points in P3 step 1's caller map (stage selection, retries, receipt writing) | `packages/audio` lifecycle over the retained engines | All mapped callers switched and P3 steps 3–6 verified, before the next GPU production run. No fallback. |
| Old audio production writers: repository writes of `audio/qa/` and `wiki/recordings/`, today in `promote_audio_qa.py` | SQL-only `accept` (P3 step 2) | P4 step 7, after the step 5 freeze and readback of all 28 registrations. Engine functions they call stay. |
| Static-site runtime: `packages/harness/src/site/server.ts`, `scripts/site/serve.ts`, and the static release marker (`site-release.ts`, `scripts/ci.ts` release mode) | Worker release bound to one release identity | P4 step 7, after the deployed smoke passes at that identity, including seeking. Application step 5 retires the generator. |
| Pages deployment: the `deploy` job, `upload-pages-artifact` step, and `pages`/`id-token` grants in `ci.yml` (no separate Pages workflow exists), plus the `github-pages` environment | Protected `deploy.yml` | With the static runtime. No repository secret serves Pages today; remove any added only for the old path. |
| Routes, commands, and CLI aliases absent from the application's replacement map | Commands in that map | P4 step 7, after the activation smoke; keep `job list`, `job show`, and `wiki <mode>` unless the map replaces them. |
| Tests that only bless deleted code, such as `site/server.test.ts` and the Pages assertions in `ci-workflow.test.ts` | Invariants and engine regressions moved to new owners | With the code they test; never delete an offline invariant to make a new job pass. |

## Acceptance and STOP conditions

- P0 is complete only when the commit that first tracks `docs/cutover/` excludes it and a clean export manifest lists no `docs/cutover/` path.
- P1 is complete only when invalid fixture programs fail for the intended rules and clean installs pass the full gate on the pinned Node.
- P2 is complete only after one selected real provider proves the atomic write contract, single-revision reads under interleaved commits, media delivery, measured limits, and resource ownership.
- P3 steps 1–2 are complete only when all 28 recordings register with their actual dispositions and `accept` cannot bypass existing editorial requirements.
- P3 steps 3–6 are complete only after interruption/resume preserves verified work; they gate the next GPU production run.
- P4 is complete only with reconciled corpus/media, one active writer, successful recovery rehearsal, deleted old audio writers, and retired legacy deployment authority.
- Stop if enforcement requires widening a rule exception, replacing Bun, inventing provider transaction guarantees, or adding a permanent vendor toggle.
- Stop if the real workload exceeds the agreed budget, the chosen provider lacks a tested restore path, or integration evidence contradicts local tests.
- Stop if source distribution rights, recording acceptance, public visibility, or writer identity remain unresolved at publication time (DEC-05, DEC-06).
- Stop if a release can restore only its Worker, silently lose accepted writes, or reactivate legacy writers beside new writers.
- Stop any GPU production run requested before P3 steps 3–6 pass; never revive a deleted audio writer for it.

## Open decisions

Status and rationale live in the [README.md](README.md) decision register; this table records only this plan's recommendation.

| ID | Decision | This plan's recommendation | Blocks |
| --- | --- | --- | --- |
| DEC-01 | SQL becomes the mutable corpus authority | Enact only in P4 step 5 through data D4, after proof, with SQL writes closed until D4's amendments land; foundation work keeps current governance. | D4/P4 activation |
| DEC-02 | Database vendor: Cloudflare D1 vs PostgreSQL | Cloudflare D1 if data D1b and the P2 probe pass, including the interleaved-commit read case; otherwise PostgreSQL through Hyperdrive, with its origin cost. One adapter. | D2 |
| DEC-04 | Hosting budget scope (~$5/month) | Hosting, database, and artifacts only; model calls and GPU budgeted separately; alerts, not a cap. | P2 provisioning |
| DEC-05 | Public exposure: corpus subset, domain, source/media publication rights | Private integration stage until decided; no recordings while [publication policy](../publication-license.md) excludes them. | Any public deployment |
| DEC-07 | Recovery objectives and backup retention | Set from D3's measured restore time and backup age; explicit exports, with the selected provider's point-in-time recovery (Cloudflare D1 Time Travel or the PostgreSQL host's backups) as a complement. | P4 |
| DEC-08 | Bounded GPU smoke workload | One bounded existing screenplay, separately authorized. | P3 completion (steps 3–6) |
| DEC-09 | Whether GPU orchestration (P3 steps 3–6) is on the activation path | No: P4 needs P3 steps 1–2 and SQL-only `accept`; old audio writers are frozen, then deleted, at activation; steps 3–6 precede the next GPU production run. Alternative: all of P3 before P4. | P4 scheduling |
| DEC-13 | Immutable artifact store (R2, verify-before-reference) | Private R2, content-addressed keys, reference only after verification (P2 step 3). | P2 |
| DEC-14 | Infrastructure ownership | One Alchemy stack, `dev`/`integration`/`prod` stages, exact-identity adoption (P2 step 1). | P2 |
| DEC-15 | Key from reading lines to screenplay entries | Emit each entry's English UTF-16 interval from the screenplay generator, split parts included, and carry it in `recording_timing` (P3 step 2). | Read-along and per-line Play from here; not activation |
