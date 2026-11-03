# Application cutover: one corpus service for readers and agents

## Status and execution boundary

- Status: proposed implementation plan; no application migration has been performed.
- Priority: P1. Effort: L. Risk: high at publication and curation boundaries.
- Planned at: Plato `8a5e4c2`, 2026-10-09, plus the existing uncommitted demo workspace.
  Revised 2026-10-26; HEAD unchanged at 8a5e4c2.
- Reference: rat-stack `3fb103b2c6fdeba9460d387827f9d4fd1525d9cc`; DEC-03 cites later MCP pages.
- Depends on: [data](data.md) for authoritative records, revisions and atomic curation;
  [platform and audio](platform-and-audio.md) for the fence, Worker, identity and media bindings;
  [design system](design-system.md) for step 3's UI foundation (DEC-10–DEC-12).
- This plan authorizes preparation, not public publication, resource creation, paid inference,
  or automatic acceptance of recordings. Follow the cutover index's execution gates.

Before implementation run `git status --short` and
`git diff --stat 8a5e4c2..HEAD -- packages apps scripts/ci.ts docs release`.
Compare the excerpts below with the working tree, including uncommitted changes.
Use an isolated `codex/` branch if other work is active; preserve the demo and its root
`package.json`, `bun.lock`, `.gitignore` and `output/` changes.

## Outcome and scope

Ship a remotely hosted reader whose HTML, Markdown, CLI and agent tools resolve the same
canonical IDs, source references, review dispositions and corpus revision. Native agent
support means discoverable, useful typed operations. No hosted model runtime is required.
SQL authority is a recommendation awaiting DEC-01; it is not enacted by this
plan. The existing Git ledgers remain authoritative until that cutover explicitly lands.
Phase A1 covers contracts, bounded reads and reader replacement (steps 1–3); A2 covers
authenticated writes and pre-activation acceptance (step 4). Platform P4 depends on that
pre-activation acceptance, not step 5. Step 5 is application work inside P4's single
activation procedure. Read [architecture](architecture.md) and the [execution index](README.md).

Implementation scope: new `packages/core/src/{contracts,corpus,curation}`,
selected `packages/capability/src` projections, `packages/cli/src`, `apps/web`, and their
tests; extraction or retirement of reader code under `packages/harness/src/site`;
`docs/wiki-browser-design.md` and this plan's status. Shared root dependency, CI, release,
infra and package-export edits must be coordinated with the platform/data owners.

Out of scope: semantic corpus edits, new ontology assignments, editorial acceptance,
rewriting the Three.js demo, restoring the removed Pi workflow, A2A, arbitrary code
execution, Decisions API calls (the [analysis lane](analysis.md) owns batch classification), a
chatbot, model/provider queues, and a new account platform.
Do not remove historical evidence or the release/export capability to simplify the UI.

## Current evidence and rat-stack rules

| Location | Verified fact and consequence |
| --- | --- |
| `packages/harness/src/site/data.ts:1320` | `readSiteData` reads disk; at 1333, `allObservations.filter((observation) => observation.reviewStatus !== "rejected")`. It is a reader projection, not a lossless migration source. |
| `packages/harness/src/site/search.ts:2,4` | Result cap is 50; snippets default to 240 code points. `SearchRecord` at 51 is a compact index entry, not full evidence for an agent. |
| `packages/harness/src/site/server.ts:35` | `request.method !== "GET" && request.method !== "HEAD"` rejects other methods. This is a static file server, not a shared API. |
| `packages/cli/src/cli.ts:940` | `wiki` dispatches schemas or a JSON call list into `executeWikiToolCalls`; curation is currently local and checkout-dependent. |
| `packages/harness/src/wiki/tools.ts:63,144` | Validated drafts stay in one process (comment at 63; `stagedObservations` Map at 144) until an explicit commit. A remote Worker cannot inherit this lifetime assumption. |
| `packages/harness/src/site/player.ts:5` | Resume identity includes schema version, recording ID and audio hash. Preserve this behavior when moving the player. |
| `packages/harness/src/site/recordings.ts:43,45` | `SiteRecording` keeps acceptance status (`accepted` or `draft`), hash, duration and chapter data. The 27 listening recordings are `draft` manifests in an external review catalog (`site --review-recording-manifests`, commit `f95ca72`); the one tracked manifest is `withdrawn`. Hosting bytes does not change their disposition. |
| `packages/harness/src/completeness.ts:59–64,342–452,1002–1056,1352–1367,1492–1497` | Completeness imports `buildStaticSite`, audits a generated site (`auditPrebuiltStaticSite` at 420) and derives four job families from it: CMP-SITE, CMP-READINGS (`readingPage`), CMP-AUDIO-TRUTH and CMP-AUDIO-WEBSITE. They feed `bun run harness job list`, so retiring the generator must re-home them with unchanged family slugs and leaf scopes (step 3). |
| `packages/harness/src/source.ts:240` | `source.content.slice(startChar, endChar)`, hashed with `sha256`, binds citations to end-exclusive JavaScript UTF-16 offsets, not bytes; rendering must preserve the data plan's DATA-01 convention. |
| `packages/demo/README.md` | Existing Vite/Three.js garden has keyboard/text alternatives, reduced motion, local reader accounts and Markdown export; accounts never enter the corpus. Preserve it as a separate prototype. |
| `docs/repository-maintenance.md:28` | Pi provider/session/retry machinery was deliberately removed; capabilities must not recreate it. |
| `release/public-files.toml:7,39` | `include` has `docs/`; `exclude` has `plans/` among other prefixes but no `docs/cutover/`. Platform P0 adds that exclusion in the commit that first tracks these plans. |

Read these rat-stack sources through MCP before coding; search again if resources move:

- [Add a capability](https://ratstack.sh/skills/add-a-capability): define contract,
  implement beside its owner, register once, project every retained interface.
- [One capability, every surface](https://ratstack.sh/lore/one-capability-every-surface):
  browser RPC imports contracts without server handlers; OpenAPI is generated output.
- [Hosted agent interfaces](https://ratstack.sh/systems/agent-front-door): discovery and
  static routing are separate from domain actions. Its reusable hosted cartridge is
  still planned; do not assume it is an installable finished dependency.
- Reference principles: `one-contract-many-projections`, `bound-every-read`,
  `scope-private-data`, `make-review-views-complete`, `prove-the-recipient-path`,
  `keep-boundary-words-honest`, and `design-serves-function` under
  `skills/rat-stack-mode/principles/` at the pinned reference revision.

Specific existing gaps are separate handwritten CLI/tool schemas, filesystem-coupled
reader loading, and no common hosted query contract. Existing functionality is not proof
that these satisfy the proposed fence. Report a violating file and rule when migrating it.

## Rendering decision (DEC-03) and feature preservation

DEC-03 chose the reader's UI runtime between TanStack Start (React) and Foldkit, the Effect-native
Elm-architecture framework of rat-stack's reader. Either deploys through the single Alchemy
stack (DEC-14). Sources were read on 2026-10-26; versions and peer ranges come from npm.

| Criterion | Foldkit 0.169.0 | TanStack Start 1.169.4 |
| --- | --- | --- |
| SSR, prerender and hydration on Workers | [Supported](https://foldkit.dev/core/server-rendering) from `foldkit/experimental/server`, which "may change in any Foldkit release and has not yet had broad production exposure". Commands do not run during a server render; request data travels in public Flags. | [Stable](https://tanstack.com/start/latest/docs/framework/react/overview): per-route [`ssr`](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr) (default `true`, `'data-only'`, `false`), [static prerendering](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering) and [server routes](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes). |
| Alchemy deployment | [`Cloudflare.Website.Foldkit`](https://github.com/alchemy-run/alchemy/blob/v2.0.0-beta.84/packages/cloudflare/src/Website/Foldkit.ts), used by rat-stack's reader (MCP `systems/web`). Its SSR/prerender support is first documented in Alchemy `2.0.0-beta.84` (2026-10-24) and needs Foldkit ≥0.167.0. | No dedicated Cloudflare resource; Alchemy's [example](https://github.com/alchemy-run/alchemy/tree/v2.0.0-beta.84/examples/cloudflare-website-tanstack-start) uses the generic `Cloudflare.Website.Vite` (beta.80 and beta.84). Cloudflare's [guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) deploys with Wrangler, outside the single stack. |
| Accessible primitives | [`@foldkit/ui`](https://foldkit.dev/ui/overview) lists 28 headless components, including dialog, popover, tabs, menu, combobox, slider and toast, with Scene/Story tests in the [repository](https://github.com/foldkit/foldkit); pre-1.0. | Mature 1.x headless libraries, such as React Aria Components 1.22.1 and Base UI 1.9.0. |
| Effect without a second API | Commands are Effects. Foldkit puts JSON endpoints on a separate backend; rat-stack forwards `/rpc` to a private Worker. Peers on exact `effect` 4.0.0. | `@effect/atom-react` 4.0.6 bridges React state. Server functions are a second RPC transport; loaders must call capability clients. |
| Persistent root player | One program; a stable root subtree should keep `<audio>` mounted (undocumented). | The [root route](https://tanstack.com/router/latest/docs/framework/react/routing/routing-concepts) is always matched and its component always rendered. |
| Readable without JavaScript | Foldkit's docs are silent; rat-stack's web standard requires it. | Server-rendered by default. |
| Behavior tests | Story and Scene tests run update, view and subscriptions without a browser (MCP `lore/ui-behaviour-is-a-scene`). | Component tests. Both still need Playwright for media, hydration and no-JS checks. |

Decided by the user on 2026-10-27: **Foldkit** 0.169.0, with `effect` and
`@effect/platform-browser` 4.0.0 pinned exactly, SSR for reading routes and client navigation,
and prerendering only for revision-independent pages such as about and license. It fits Effect,
has an Alchemy SSR resource, and is the runtime of the user's other workspaces; the design
workspace in `apps/web` is built on it first. The main risk stays as measured: Plato's critical
path, request-time SSR of mutable SQL data under a hard cutover with no fallback reader, is what
Foldkit labels experimental. A pure SPA needs JavaScript for the first read; a static edition
needs a build per revision. Markdown works with any of these and is not by itself a reason for
SSR.

Step 1 proves Foldkit against this list and records the measurements under DEC-03 in the
[cutover index](README.md). A failing criterion is reported there for the user's decision, not
answered by switching runtimes:

- The bundle builds through the Alchemy Website resource on exact P1 pins, resolves one `effect`
  and one UI-framework instance under Bun, and starts in workerd without credentials.
- With JavaScript disabled, a reading route shows one corpus revision's text, citations, fragments
  and links; one revision-independent page is prerendered; an unknown path returns 404.
- Hydration reports no mismatch; the next navigation reads through the capability RPC client; a
  P1 fence fixture rejects a framework server function used as transport; `/api`, `/mcp` and
  `/rpc` reach the same registries, in the bundle or its backend Worker.
- A root `<audio>` plays a ranged fixture MP3 through two client navigations without `emptied`
  or `abort`, then resumes after reload from its hash-bound key.
- Under DEC-11's native-first choice, one native primitive (the Explain sheet's `<dialog>`) and
  one headless-library primitive (the line-actions menu, `@foldkit/ui`'s Menu) server-render,
  hydrate and work by keyboard in Chromium and WebKit.
- SSR CPU time for the largest fixture page, startup bytes and route JavaScript are recorded
  against P2's budget.

Views consume the [design system](design-system.md) foundation and component contracts; this
plan owns behavior, data, routes and accessibility outcomes, not visual design. The consumer
reading surface is the English rendering with Greek per line on request. Consumer views hide
record IDs and hashes in visible text; Markdown, agent and curator views keep them, and HTML
keeps stable IDs as element IDs and fragments.

The design system's [data requirements](design-system.md#data-requirements) add new features:
read-along and per-line Play from here (the per-entry timing index), Original (English to Greek
line alignment) with its transliteration, per-line Explain notes, English search, and durations.
Each ships when its requirement verifies; transliteration needs no data of its own and ships with
Original. None belongs to pre-activation acceptance; the parity rows below do.

| Preserve | New owner and proof | Retired via [Deletions](#deletions) |
| --- | --- | --- |
| Dialogue, Greek source, reading/commentary, turns, voices, claims, relations and apparatus views | `apps/web/src/features/reader/`: English reading with Greek per line on request, notes through Explain and record pages; fixtures retain stable IDs, source context, speaker and review distinctions; operator dialogue copy in `site/curation.ts` keeps its one-line-per-dialogue check | HTML assembly |
| Axes, concepts, memberships, clusters and dossiers | `features/ontology/`: consumer Explore, Idea and Person pages built from the [analysis lane](analysis.md)'s ideas, titles and summaries and its precomputed analytics ([design system](design-system.md#data-requirements) requirements 6–7); cross-dialogue navigation and deterministic derived identities | HTML assembly; `readSiteData` under data D4 |
| Corpus/about/license/quality/weak-spots, anchors, patterns and search | `features/catalog/`, `features/search/`; exact-ID lookup plus bounded filters and honest empty states | Static search and ID shards |
| Audio catalogue, seeking, chapters, resume and reading links | `features/audio/`, `client/audio.ts`; one root-mounted player, hash-bound progress, visible `draft`/`accepted` status (`draft` shown as “Preview”) | Embedded client script; the static server under platform P4 |
| Canonical URL paths and ID fragments | Route fixtures derived from current generator/test expectations; retain useful existing URLs as the new canonical routes | HTML assembly as route owner; no parallel fallback |
| Reproducible exports and source/license attribution | Data/release exporter and shared deterministic render models | Only redundant serving machinery, never provenance |
| The Living Word prototype and private browser accounts | Existing `packages/demo`; a separate product decision governs later integration | Nothing in this cutover plan |

## Contracts, capability owners and bounded reads

Put serializable capability schemas and names in `packages/core/src/contracts/`; re-export
their client-safe surface from `contracts.ts`. Consume the data plan's `CorpusRead` and
`CorpusEdit` ports in `packages/core/src/corpus/`; do not define parallel reader/edit services
or duplicate their domain schemas. Core handlers use those ports. `packages/database` supplies SQL services;
`packages/artifacts` supplies source/media objects. Core must not import provider adapters.
Compose Layers at the CLI/Worker entry points, not inside page components or handlers.

Select the minimum rat-stack projection implementation into `packages/capability` with
pinned origin and license attribution. Reference `contract.ts`, `implement.ts`,
`to-command.ts`, `to-http-api.ts`, `to-toolkit.ts`, `to-rpc-group.ts`, and `to-rpc.ts`.
The upstream package is private; this is an explicit adaptation, not an assumed published
SDK. Preserve Plato's prohibition on explicit/implicit `any`; do not copy upstream type
erasure exceptions blindly. Stop if a safe, small projection cannot meet that constraint.

Use one `defineContract`/`implement` pair per operation. Expected failures include
`NotFound`, `InvalidCursor`, `RevisionChanged`, `Unauthenticated`, `Forbidden`,
`SourceUnavailable` and the data plan's typed validation/conflict failures, as applicable.
A database outage is an operational failure, never an empty successful result.

Characterize the current corpus before finalizing caps: record the largest complete encoded
record per kind, source chunk, reading unit and representative query length with their IDs
and revision; measure candidate requests through workerd for CPU, memory, encoded bytes and
query work. Record these measurements and chosen limits in this section during A1, then
confirm cost on P2's real provider. The numbers below are **starting hypotheses**, not measured
or approved schema defaults. Limits become enforceable only after the full evidence fits
through a tested paginated representation; reject oversize input explicitly, never truncate evidence.

| Initial read contract family | Candidate limits and required access path |
| --- | --- |
| `getRecord`, `listRecords` | Stable ID index; typed record-kind union; filtered keyset pages of 1–50 rows, deterministic tie-breaker ID |
| `searchCorpus` | Query length ≤512 code points, explicit scope/kinds, ≤50 hits; exact-ID branch and database-specific full-text index; inspect scanned work, not only LIMIT |
| `readSource` | Canonical source version/ref, exact hash verification and ≤16 KiB returned slice; wider reads page by validated source boundaries |
| `getReading` | Dialogue plus revision, ≤20 units/page and ≤512 KiB encoded body; each unit carries speaker, English text, its Greek span reference and note references, or a bounded line-notes read supplies the notes; citations and next cursor retained; no whole-dialogue payload requirement |
| `getOntology`, `getDerived` | Explicit axis/concept/dialogue and view kind; indexed membership/turn/anchor lookup, ≤50 rows; no arbitrary SQL or recursive unbounded graph query |
| `getRecording`, `listRecordings` | Accepted public catalogue or separately authorized candidate catalogue; metadata and asset references only, ≤50 items/page |
| `getQuality` | Revision-bound precomputed deterministic summary; no per-request whole-corpus scan |

These names are proposed contracts, not existing commands. Final schemas must cover every
preserved feature before legacy deletion. Responses include canonical IDs, corpus revision,
source refs/hashes, review status, licensed attribution and meaningful next links.
For paginated operations bind the cursor to revision, filters and last sort key; reject a
stale revision or cursor from another scope. Large single records need an explicit bounded
section read, not silent evidence truncation. Measure query plans on full-sized imported data.
Delegate multi-query consistency to `CorpusRead`'s proved snapshot or monotonic revision
protocol from `data.md`; merely tagging the final response with a revision is insufficient.
Source, joined records and relationships must belong to one logical revision or return
`RevisionChanged`. HTML and Markdown requested at that revision use the same coherent model.

Implement curation only through the operations specified in `data.md`, retaining stage,
validation and a single explicit commit with its decision receipt. The capability adapter
must carry authenticated identity, expected revision and idempotency key. It must not
invent a second write protocol, retain drafts in a Worker-global Map, or bypass SQL checks.

## Surfaces, Markdown and identity

- `packages/cli/src/surfaces.ts` (proposed) projects contracts into commands, including machine JSON
  output; use an explicit remote client mode for hosted curation. Thin command renderers
  may improve human output. Domain parsing and validation stay in the common handler.
  Preserve `bun run harness job list`, `job show <id>` and the lane submit paths, plus
  `wiki <mode>` schema discovery/call execution, unless step 5's replacement map (owned here,
  applied by P4) names each replacement and all job briefs are updated. A hard internal cutover
  does not justify dropping operator workflows. GPU/audio execution stays on the GPU host:
  `scripts/audio` today, the proposed `packages/audio` after platform P3.
- `apps/web/src/server/capabilities.ts` (proposed) owns public and authorized registries. Project HTTP
  at `/api`, MCP at `/mcp`, and browser RPC at `/rpc`. Generate OpenAPI and discovery from
  the exact retained registries. Do not hand-author four versions of a tool's schema.
- `apps/web/src/client/` (proposed) owns typed RPC queries and named UI commands; `features/` owns
  rendering. Browser imports use only core contracts and the capability RPC-group export.
  SSR invokes the same server implementations through its composition boundary; later
  navigation uses the projected client. Framework loaders and server functions must not
  become a second API.
- Serve `/llms.txt`, `/openapi.json` and a tested MCP connection description. Advertise
  only transports/protocol versions actually supported by the pinned implementation and
  tested client. Start with normal tools; code mode, A2A and autonomous execution stay deferred.
- `apps/web/src/server/representations.ts` (proposed) builds HTML/Markdown from one decoded record
  model and revision. Provide explicit `.md` routes; optionally negotiate `text/markdown`
  with correct `Vary: Accept`. Render deterministically, escape untrusted markup, and never
  ask a model to summarize evidence for the agent view. Markdown includes citations,
  provenance, review status, continuation links, and revision-derived ETags.

Public registries query the published, licensed, accepted view that DEC-05 names. Authenticated curators
can inspect full dispositions and candidates. Apply visibility in the domain query;
HTTP, MCP, RPC, search, exact-ID lookup, Markdown, caches and object URLs must all agree.
The current non-rejected filter must not accidentally publish unreviewed records.

Core owns one `CurrentIdentity` port at `packages/core/src/identity.ts` (proposed); the application
owns its adapter at `apps/web/src/server/identity.ts` (proposed) and the curator authorization policy.
Platform owns the required identity provider configuration/bindings, not a second adapter.
For DEC-06, prefer the existing deployment provider's authentication boundary if it works
with the intended MCP/CLI client. Missing/invalid identity yields `Unauthenticated`; a
verified reader cannot curate. Client approval metadata is not authorization. Cookie-based
writes also enforce origin/CSRF protection. Keep private bodies/tokens out of logs and
public cache keys; private responses are not shared-cacheable. Do not add registration,
billing, social login or broad roles to solve a single-curator boundary.

## Implementation sequence and verification

Existing commands: `bun install --frozen-lockfile`, `bun run test`, `bun run typecheck`,
`bun run validate`, `bun run ci`, `bun run build --out-dir <external-path>`.
New commands below are **proposed root package scripts to create**, not available today.

| Root script | Exact proposed command | Configuration contract |
| --- | --- | --- |
| `test:application` | `vitest run --config vitest.application.config.ts` | Root aggregate config whose `test.projects` lists the Vitest configs owned by `packages/core`, `packages/capability` and `apps/web` (its application project includes only `apps/web/test/application/**/*.test.ts`); it repeats no include glob. New Effect cases use `@effect/vitest` `it.effect`/`it.layer`. |
| `test:worker` | `vitest run --config apps/web/vitest.worker.config.ts` | Includes only `apps/web/test/worker/**/*.test.ts`; Cloudflare's Vitest integration runs workerd with local bindings and production entry/bundle startup checks. |
| `test:browser` | `playwright test --config apps/web/playwright.config.ts` | Includes only `apps/web/test/browser/**/*.test.ts`; explicit Chromium and WebKit projects, local production preview by default, explicit private integration URL for remote checks. |

Pin compatible Vitest, `@effect/vitest`, Cloudflare integration and Playwright versions in P1;
exclude these trees from Bun test discovery and each other so no suite is skipped or misrun.
Each workspace owns its Vitest config and `test` script (platform P1), and the root `test`
script, `bun run derive && bun run --sequential --workspaces test`, runs them all. The named
Vitest scripts above are focused entry points over those configs, not extra gates.
`test:browser` needs a production preview build, so `scripts/ci.ts` runs it after the
disposable build. Its Chromium and WebKit builds come from `playwright install chromium webkit`
for the pinned Playwright version, run as a setup step before the gate (in CI, a workflow step
after the frozen install); `bun run ci` downloads nothing and fails if they are missing.
The `vitest` and `playwright` bins run on P1's pinned Node: `bun run` honours their `node` shebang.
On npm (2026-10-26) `@cloudflare/vitest-pool-workers` 0.23.0 peers on Vitest ^4.1 while
`@effect/vitest` 4.0.6 needs Vitest 5; platform P1 step 1 must reconcile that pair before `test:worker` exists.
Use [Cloudflare's test integration](https://developers.cloudflare.com/workers/testing/vitest-integration/)
and the [Playwright runner](https://playwright.dev/docs/test-cli). Preserve useful existing
Bun regression cases while moving behavior. Do not add `Effect.run*` in tests to evade the fence.

1. **Prove one complete read and settle DEC-03.** Add `getRecord` contract, handler and selected
   projections; create `apps/web/src/worker.ts`, the Worker entry whose bindings platform P2
   declares, and `apps/web/src/server/runtime.ts`, the one Layer composition root it calls; then
   one reading route, Markdown representation and CLI projection. This step needs only P1 and data
   D1b's `CorpusRead`/`CorpusEdit` port definitions, not the selected provider. Complete the
   baseline characterization above before fixing contract caps. Use a deterministic test SQL
   fixture and a production Worker bundle; create the scripts and configs specified above.
   **Verify:** both Vitest scripts exit 0, cold concurrent requests succeed, one
   record has identical ID/revision/citations across HTML, Markdown, CLI and RPC, the browser
   bundle contains no database, Node filesystem, secrets, devtools or server handlers, and
   every DEC-03 proof criterion passes with its measurements recorded.
2. **Complete bounded corpus access.** Add remaining read contracts and SQL query adapters
   with the data owner on the DEC-02 provider. Write `packages/core/test/corpus-capabilities.test.ts`,
   `packages/capability/test/surface-parity.test.ts` and
   `apps/web/test/application/visibility.test.ts`.
   **Verify:** `bun run test:application` and the data plan's proposed `bun run test:database`
   pass for pagination, stale cursors, excluded records, source-hash
   failures, per-scope limits, encoded failures and indexed queries on the full corpus.
   A committed edit interleaved between joined-record/source reads yields one coherent
   pre/post-edit result or `RevisionChanged`, never a mixed evidence response.
3. **Move reader features and audio.** Implement the preservation table on the approved
   [design system](design-system.md) foundation and component contracts, with the English
   rendering as the reading surface and Greek per line on request, plus the shared Markdown
   model and root player. Create `apps/web/test/browser/reader.e2e.test.ts` and
   `audio.e2e.test.ts`. Port cases from `packages/harness/src/site.test.ts` and
   `site/{player,server,search,ontology-consumer}.test.ts`; use ordinary browser automation,
   no paid model benchmark. Re-home completeness's site-derived families (CMP-SITE,
   CMP-READINGS, CMP-AUDIO-TRUTH and CMP-AUDIO-WEBSITE) onto a deterministic audit of the
   `representations.ts` output and the recording catalog at one corpus revision. The audit
   reaches the shared render model through a package export rather than importing `apps/web`
   server modules, and keeps every family slug and leaf scope.
   **Verify:** `bun run test:browser` passes in Chromium and WebKit for keyboard
   navigation, responsive reading, fragments, no-JavaScript reading, polytonic Greek in the
   DEC-12 faces, chapter navigation, uninterrupted client navigation, reload resume,
   stale-hash rejection and seek-to-zero behavior. `bun run harness job list` reports the
   same job IDs before and after the completeness move.
4. **Expose useful agent access and authenticated curation.** Requires DEC-06. Complete
   discovery and a real MCP client's initialize/list/search/read sequence; compare
   HTTP/CLI/RPC outputs. Create `apps/web/test/worker/agent-surfaces.test.ts` and
   `curation-auth.test.ts`. Publish no unrestricted source/object URL while testing
   authorization. After authorized private integration deployment, capture real
   HTML/Markdown, MCP/CLI, auth and media recipient checks against its release identity.
   **Verify:** `bun run test:application`, `bun run test:worker` and `bun run ci` pass; the
   public registry cannot write or reveal candidates; concurrent stale writes follow the data
   plan; denied requests perform no durable write; browser checks pass against the candidate
   production bundle; release visibility/license checks and the private integration recipient
   checks pass. These steps 1–4 checks constitute pre-activation acceptance for P4; local
   workerd results alone do not.
5. **Activate and delete within platform P4.** P4 owns the freeze, final import, backup,
   production activation and recovery procedure; do not create another switch here.
   Supply the route/client destination changes and the route/command replacement map that
   P4 applies, and run the acceptance smoke inside that procedure. Then remove each
   [Deletions](#deletions) row whose proof has passed. Update `docs/wiki-browser-design.md`,
   release docs and this plan's status. No hidden fallback reader.
   **Verify:** the production smoke passes at the selected release identity; every Deletions
   row is removed with its recorded proof; no production import reaches the retired site
   modules; `bun run ci` passes.

For browser access to a local preview, keep localhost binding and run `dev-url <port>` on the
GPU host; it prints the Mac HTTPS URL that the Mac's dev-https agent mirrors (ports 1024–32767). Use
`dev-https <port>` on the Mac only when a flow requires `https://localhost:<port>`, as AGENTS.md
"Remote GPU Dev Access" describes. The platform owner owns remote preview URLs and credentials.

## Deletions

Step 5 removes each row inside P4 once its proof has passed; nothing stays as a fallback.

| Removed | Replacement | Delete when — proof required |
| --- | --- | --- |
| HTML assembly: `packages/harness/src/site/index.ts` (`buildStaticSite`, 3936), page chrome in `site/layout.ts`, and the `site` command (`packages/cli/src/cli.ts:1489`) | `apps/web/src/features/` views over `server/representations.ts` | Every preservation row has a passing recipient case; route/fragment fixtures ported from `site.test.ts` pass; `completeness.ts` (59–64, 420) no longer builds or audits generated site output, and its CMP-SITE, CMP-READINGS, CMP-AUDIO-TRUTH and CMP-AUDIO-WEBSITE leaves come from step 3's audit with unchanged `job list` IDs. |
| Embedded stylesheet: `siteCss()` (`layout.ts:207`), written to `assets/site.css` | [Design system](design-system.md) tokens and components | Step 3 views pass on the design-system contracts. |
| Embedded client script: `siteJs()` (`layout.ts:649`; player from 962), written to `assets/site.js` (`index.ts:3967`) | `apps/web/src/client/audio.ts` root player; `site/player.ts` helpers move with `player.test.ts` | `audio.e2e.test.ts` passes on real media: ranges, chapters, resume, stale hash, seek to zero and uninterrupted navigation. |
| Static search and ID shards: `buildExactIdIndex` and `buildSearchIndex` (`search.ts:408,454`), emitted `assets/{index,search}/` (`index.ts:3961–3977`) and their `siteJs()` lookups | `searchCorpus` and `getRecord` contracts | Ported `search.test.ts` and `emitted-search.test.ts` cases and bounded-search acceptance pass; no route requests shard assets. |
| Duplicate CLI/tool schemas: handwritten parsing and usage in `cli.ts` (`printHelp` 157, `parseCommand` 365) and the TypeBox schema listing served by `wiki <mode>` (`cli.ts:948`) | Contract projections in `packages/cli/src/surfaces.ts` and `apps/web/src/server/capabilities.ts` | `surface-parity.test.ts` covers each migrated command; the step 5 map keeps `job list`, `job show`, `wiki <mode>` and lane submit paths, and job briefs are updated. |

The static server, site release marker and Pages deployment are
[platform deletions](platform-and-audio.md#deletions); disk loaders, `readSiteData` and the
`packages/harness/src/wiki/tools.ts` write path are [data deletions](data.md#deletions). Operator copy in
`site/curation.ts` and validators in `site/{recordings,mastering-evidence,validate}.ts` are not
serving code: move them to named owners before `packages/harness/src/site` is removed.

## Open decisions

Status and rationale live in the [cutover index](README.md); this table records only this plan's position.

| ID | Decision | This plan's recommendation | Blocks |
| --- | --- | --- | --- |
| DEC-03 | Reader framework / UI runtime | Foldkit, decided by the user on 2026-10-27; step 1 proves it and reports a failing criterion for the user's decision | Step 1 completion; DEC-11 |
| DEC-05 | Public exposure: corpus subset, domain, source/media publication rights | Private integration access until decided; public registries serve only accepted, licensed records | Any public deployment |
| DEC-06 | Curator identity and MCP/CLI credential flow | The deployment provider's authentication boundary if the intended MCP/CLI client can use it; one curator role, no registration | Step 4 |
| DEC-10 | Visual design direction | Bookshelf, decided by the user on 2026-10-26, with Listen's player and read-along; step 3 consumes the [design system](design-system.md) once DS1 approves the full system | Step 3 views |
| DEC-11 | Interactive UI primitive foundation | Native-first, by the user's choice: native elements first, then `@foldkit/ui`'s Tabs and Menu only for behaviour they lack; confirmed by step 1's primitive criterion | Step 3 interactive views |
| DEC-12 | Typefaces for polytonic Greek and UI text | Gentium Book Plus for Greek with `lang="grc"`, by the user's choice; Literata reading text and Inter UI text; step 3 verifies polytonic rendering in these faces | Step 3 verification |

Consumed from other plans: DEC-01 gates activation, DEC-02 step 2's full-corpus queries, DEC-04
the SSR budget STOP, DEC-13 hosted media for step 4, and DEC-14 the stack that owns the Website.

## Acceptance and STOP conditions

Pre-activation acceptance for platform P4:

- [ ] Every feature in the preservation table has a passing recipient-facing case.
- [ ] HTML, Markdown and typed surfaces agree on IDs, revision, visibility and citations.
- [ ] Two Markdown renders of the same revision are byte-identical; encoding cannot run code.
- [ ] Public requests cannot access drafts, rejected records, private receipts or unlicensed objects.
- [ ] The 27 listening recordings keep their actual `draft` disposition, shown as “Preview”; no UI promotion.
- [ ] Player checks prove ranges, chapter/frame mapping, resume and navigation on real media.
- [ ] Search is bounded by input, output and examined access path; pagination cannot skip/duplicate rows.
- [ ] Recorded largest-record/chunk and workerd measurements justify final caps without dropping evidence.
- [ ] Interleaved edits cannot produce mixed-revision evidence, HTML or Markdown.
- [ ] Worker production bundle starts without deployment credentials and exposes no dev-only interface.
- [ ] `bun run ci`, `test:application`, `test:worker`, and `test:browser` pass after migration.
- [ ] Candidate bundle and authorized private integration recipient checks pass; demo remains intact.

After activation inside P4:

- [ ] Production smoke passes at the selected release identity; every [Deletions](#deletions) row is removed.

STOP and report when reference code or dirty changes invalidate these excerpts; SSR cannot
meet the platform's measured budget (DEC-04); projection adaptation requires prohibited `any`; a
client cannot authenticate with the selected provider (DEC-06); a query requires an unbounded scan;
source citations/hash coordinates drift; reader parity would require semantic invention;
or public source/media rights and accepted visibility are unresolved (DEC-05). Do not silently
change frameworks, drop evidence, loosen the fence, publish review candidates, or reintroduce
an in-memory draft/legacy data fallback. Resolve these decisions with the owning plan first.
