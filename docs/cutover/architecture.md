# Target architecture for the hard cutover

Status: proposed. Planned at Plato `8a5e4c2`, 2026-10-09; revised 2026-10-26 with
HEAD unchanged. Decisions and execution order live in [the cutover index](README.md).
This is a target contract, not a description of code that has shipped.

## What the system does

Plato records source-bound textual facts and accepted semantic decisions. A
reader explores those records, follows exact citations, reads full dialogues,
and listens to recordings with a visible acceptance state. An agent can perform
the same bounded queries through typed tools. Authorized curators use explicit
stage, validation, and commit operations against the same corpus.

Greek source bytes remain extraction evidence. English is a rendering and
commentary source. For readers, the English rendering is the consumer reading
surface and the Greek appears per line on request, as the
[design system](design-system.md) specifies; curator, Markdown and agent views keep
record IDs and review statuses. A reader's interpretation, an assistant's answer, and the
prototype's local account are never automatically canonical observations.

The public renderer stays a projection. The normalization work changes storage
and execution, not what the corpus claims. The one exception is the ontology
layer, which the [analysis lane](analysis.md) replaces under DEC-16 with its own
review receipts.

## The standard: one authority per fact

| Fact | Current authority | Target authority / writer | Derived copies |
| --- | --- | --- | --- |
| Exact source version and source provenance | `raw/plato/` plus source manifest/notices | Immutable object bytes; SQL version/provenance references; source import operation | Decoded source cache, token/marker indexes, rendered excerpts |
| Semantic record and disposition | Validated `wiki/` ledgers | SQL typed rows; canonical commit capability | HTML, Markdown, search, exports |
| Ontology questions, concepts and memberships | Canonical `wiki/ontology/*.jsonl`; the analysis lane's hard cut (AN6) replaces the content | SQL tables with stable keys and references; reviewed ontology commit; accepted classification runs | Regenerated clusters and dossiers; idea pages and dialogue analytics |
| Review decision and revision | Canonical receipt plus Git change/history | Receipt and affected rows in one SQL transaction; authorized commit | Review page, revision export, backup |
| Handwritten activation/configuration | Reviewed registries within `derived/`, plus audio inputs | Explicitly inventoried canonical config records or immutable versioned input objects | Compiled turns, joins, screenplay/runtime inputs |
| Audio bytes and immutable production evidence | External artifact store | Immutable artifact objects; GPU producer uploads verified results | Playback/download cache |
| Recording acceptance and chapter metadata | Recording manifests and accepted QA evidence | SQL recording revision referencing verified objects; explicit acceptance operation | Player catalog, Markdown recording view |
| Runtime progress | Existing renderer cache and operation evidence | One operation-owned durable lifecycle record, with immutable input identity | Operator status view |
| Release | Git revision, export manifest, site marker | Versioned application/schema/corpus/artifact manifest; release operation | Deployment outputs and restore package |

SQL-authoritative curation is a proposed governance change. Until its activation
gate passes, the current ledgers and Git receipt rules remain in force. The
cutover must update `AGENTS.md`, `CONTRIBUTING.md`, `SPEC.md`, and validation in
the same program. An export is not a second writable corpus.

An R2 upload and a SQL transaction are not one transaction. Upload immutable
bytes, verify their hash and metadata, then commit the reference. An interrupted
upload may leave an unreferenced object. It must never leave a visible record
pointing to missing or unverified bytes. Cleanup requires a reference check and
documented retention; do not blindly delete old evidence.

## Construction and invariants

Keep pure parsing, source arithmetic, and derived calculations as functions.
Use Effect services where dependency control, typed failure, cancellation,
resources, or replaceable adapters are needed. A service wrapper around a pure
function adds no useful boundary.

| Primitive | Construction boundary | Invariant and failure behavior |
| --- | --- | --- |
| Source version and span | Decode imported source metadata, then verify exact object bytes | Existing offsets are JavaScript UTF-16 code units. Slice before hashing; preserve source encoding, normalization, and markers. Missing version or hash mismatch fails explicitly. |
| Record revision | Decode schema, resolve typed references, validate domain rules | Stable IDs survive migration. Rejected records remain historical facts. An unknown/malformed state is not accepted by default. |
| Decision commit | Authenticated capability plus one storage operation | Expected revision, changed records, reciprocal links, receipt, and idempotency outcome commit together or not at all. |
| Ontology membership | Validated observation/concept identities | Unique pair, accepted observation, valid axis/concept references. Display labels never create identity. |
| Artifact identity | Content hash plus media/source metadata | Immutable bytes are verified before a reference becomes visible. “Produced” and “accepted” are distinct facts. |
| Projection revision | Committed corpus revision plus explicit audience | A proven snapshot or before/after revision guard covers all constituent queries. Mixed-revision responses fail. Private and public caches cannot share visibility keys. |
| Audio operation | Input identities and declared lifecycle | Retry, cancellation, crash, QA failure, and editorial rejection stay distinct. A process crash does not certify a result. |

The source-unit distinction is observed in `packages/harness/src/source.ts`:

```ts
const startChar = startMarker.index;
const endChar = nextMarker?.index ?? source.content.length;
const text = source.content.slice(startChar, endChar);
```

`SPEC.md` currently calls these byte ranges. Correct that wording during the
contract migration; do not change every citation to match the inaccurate prose.
Test supplementary Unicode characters and combining sequences explicitly.

The data migration reads canonical readers, not `readSiteData`. That function
filters rejected observations and claims before assembling its page graph.
Likewise, `derived/plato/voices/cutovers.toml` is handwritten activation authority,
as documented in `packages/harness/src/derived/voice-cutovers.ts`; the directory
name alone cannot classify data as disposable.

## Package ownership and dependency direction

This is the proposed tree. Do not create an empty package merely to match it.
Each package must own one useful boundary and include its behavior checks.

```text
packages/core/        domain schemas, invariants, contracts, job-shaped ports
packages/capability/  selected rat-stack contract/handler/interface machinery
packages/database/   chosen SQL implementation, migrations, resource Layer
packages/artifacts/  immutable source/media access, verification, resource Layer
packages/audio/      GPU-host lifecycle and process adapters
packages/classifier/ OpenAI Decisions adapter (Effect DecisionModel where the pinned release has it), budget, external answer store
packages/cli/        commands projected from capabilities; local composition
apps/web/            routes, views, browser client, server composition
apps/web/src/design/ presentation-only tokens, fonts, primitives, components
apps/infra/          Alchemy Stack, stages, plan/apply and release wiring
```

Domain contracts import capability definitions and Effect Schema. They cannot
import database adapters, filesystem clients, cloud SDKs, or app entrypoints.
Adapters implement the application's ports; applications select and supply them.
The capability package cannot import domain rules. Browser code imports only
contracts and client projections. It cannot reach handlers or storage through
barrel exports. `apps/web/src/design/` is presentation-only: it imports no
contracts, handlers or server code, and features adapt contract data to its
component props. Relative imports stay within a feature; package exports cross
package boundaries.

Existing `packages/harness` is dismantled by responsibility as callers move.
Retained deterministic validators must have a named destination. Removing the
package is complete only after all required behavior has moved and all imports
are gone. Avoid a permanent `core -> harness` compatibility bridge.

`packages/demo` remains independent user work. Adopting its visual experience
requires a separate product decision; the data and infrastructure cutover does
not authorize discarding its accounts or replacing its UI.

## One operation across interfaces

```text
HTML / Markdown / browser client / CLI / MCP / HTTP
                         |
                 shared typed contract
                         |
            one handler and domain validation
                         |
            application-owned service ports
                         |
           chosen SQL / artifacts / GPU adapters
```

Rat-stack's capability projections are reference implementation code, not a
promise that Effect RPC automatically generates an entire product. Reuse a
reviewed, pinned subset with license/provenance and adapted tests. The hosted
agent-front-door cartridge is still described as future work upstream; do not
depend on a nonexistent installable package.

The application plan specifies the initial query operations, pagination,
failures, and required surfaces. Administrative import/restore operations are
not automatically public just because a generic projection can expose them.
Schemas and annotations do not replace server authorization. Keep public reads,
review-candidate reads, and curator writes as explicit capability catalogs.

`CorpusRead` owns consistent reads through [data D3](data.md#d3-prove-readers-rebuilds-and-portable-recovery)'s
labelled-batch protocol. Each bounded batch reads the corpus revision inside the same
batch or transaction, which labels its snapshot. Independent reads share one labelled
batch; dependent reads, such as the children of a returned page, use further labelled
batches. Differing labels return `RevisionChanged`, never a mixed response. Reading
the revision before and after separate statements brackets them only on the primary
or within one session; equal revision numbers from unrelated stale replicas are
insufficient. Cloudflare D1 read replication stays off until D3's session checks pass on the
real provider. On PostgreSQL, one repeatable-read transaction may serve as the
labelled snapshot. Test a commit between parent, relationship, and evidence reads.
Every canonical edit must advance the guarded revision in its atomic commit.

Markdown is deterministic serialization of the selected record view. It shares
citations and revision identity with HTML. Native agent access does not require
an LLM in every request. Optional research models must consume these same tools;
they receive no independent authority to mutate the corpus.

## Runtime and deployment boundaries

Workers handle bounded reads, mutations, rendering, and media access policy.
The GPU host runs synthesis, transcription, and mastering. Effect orchestrates
the retained Python/CUDA and FFmpeg engines; TypeScript does not replace their
numerical implementation. No GPU workload is scheduled inside a Worker.

Alchemy declares resources and binding relationships. A plan, a deployed
resource, and successful application behavior are three different facts.
Inspect the actual plan and prove the recipient path on the chosen runtime.
The chosen database must implement the atomic domain operation directly.
Do not emulate missing guarantees with an ever-growing application retry layer.

The approximately $5 budget is a planning target with unresolved scope. The
platform plan owns the dated pricing sources, measured audio inventory,
request/CPU/storage model, and stop conditions. Do not duplicate prices here.

## The fence and how to check it

| Standard | Existing evidence / proposed enforcement |
| --- | --- |
| No explicit or implicit `any` | Existing strict TypeScript and Oxlint. Preserve and extend to new packages. |
| Effect diagnostics fail the build | Proposed pinned tsgo integration, verified with a deliberate invalid fixture. Editor warnings alone do not count. |
| Provider and browser boundaries | Proposed actual Oxlint fixture tests for forbidden imports, feature transport, and duplicate surface constructors. |
| One canonical write | Proposed transaction/retry/stale-revision tests against the real provider, plus no-live-file-writer inventory. |
| One revision per response | Proposed interleaved-write read test, first on data D1b's record read and then on every D3 labelled batch on the selected provider; differing labels fail with `RevisionChanged`, and replication stays off until D3's session checks pass. |
| Input and stored data decoded | Proposed malformed input/stored-row tests and domain constraints; do not claim syntax lint proves all decoding. |
| Resource lifetime and failure meaning | Proposed interruption/model tests; no swallowed defects or unbounded detached work. |
| Corpus semantics and evidence | Preserve source, referential integrity, ontology, review, and completeness checks while moving their inputs. |
| Offline local verification | Existing `bun run ci` and `ci-workflow.test.ts`; separate explicit real-cloud tests and deployment workflows. |
| Remove a service implementation | Compile and run its callers with a test Layer; exercise retained production wiring separately. |

Use Plato's meaningful rationale comments. Upstream's no-comments rule and its
pnpm requirement conflict with this repository's explicit conventions and are
not adopted. Confirm new dependency pins as a compatible set; do not copy old
Effect examples from memory or assume upstream alpha/beta APIs are stable.

## What disappears and what stays

| Existing mechanism | Final treatment | Proof required before removal |
| --- | --- | --- |
| File/YAML/JSONL mutable ledger write path | Replace with SQL commit; retain one explicit import/export format boundary | Full import equality, atomic receipts, restore, all writers moved |
| TypeBox plus duplicate transport schemas | Replace migrated canonical contracts with Effect Schema | Equivalent acceptance/rejection and encoded boundary tests |
| Site-wide in-memory page graph and static search shards | Replace serving path with bounded query projections | Reader inventory, full reading coverage, search/citation parity |
| Static site server and Pages deployment | Delete after hosted release activation | Byte-range playback, URLs/fragments, publication manifest, actual hosted smoke |
| Audio orchestration duplicated between wrappers | Move lifecycle and process policy to Effect; delete replaced orchestration only | Exact resume, crash/cancel recovery, retained engine interoperability |
| Historical evidence, Greek files, review decisions | Preserve in immutable/versioned form, with restoration | Existing audit hashes and frozen Git baseline still resolve |
| Pure validators and corpus domain rules | Retain behavior; relocate ownership as needed | Existing integrity properties plus migrated input checks |

No blanket deletion of `wiki/`, `derived/`, Python, or tests is authorized by
this table. Inventory every authoritative input and every proof dependency.

## Baseline and measurement

Read-only source count on 2026-10-09: tracked `.ts`, `.tsx`, `.js`, `.py`, and
`.sh` files, excluding corpus/data/docs. Test directories, `*.test.*` and `test_*`
files are counted separately; the four `packages/harness/test-support/*-fixture.ts`
helpers (1,053 lines) count as harness production, and the untracked demo is excluded.

| Area | Production lines | Production files |
| --- | ---: | ---: |
| Harness | 70,937 | 113 |
| CLI | 1,592 | 2 |
| Audio tools | 46,624 | 47 |
| Other scripts | 2,504 | 14 |
| Total | 121,657 | 176 |

Tests under the same method total 56,833 lines. These counts are a baseline,
not a promised reduction. New adapter and projection code counts as production
code; moving logic into schemas does not count as deletion.

The intended semantic reduction is measurable: one mutable corpus authority,
one contract per operation, one handler across exposed interfaces, one selected
database adapter, and one audio orchestration lifecycle. Compare module counts,
production lines, remaining legacy imports, and workflow variants after the
cutover. Report source growth honestly if these guarantees require more code.

## Implementation steps

The lane plans execute this target. Each step names the lane steps that reach it and the
gate that shows it holds; the [execution order](README.md#execution-order-and-ownership)
sequences them.

1. **Record the target without changing governance.** Platform P1 step 7 writes
   `VISION.md` and adds package boundaries and rat-stack guidance to `AGENTS.md`;
   corpus authority, review provenance and backup rules stay unchanged.
   **Verify:** `bun run ci` passes, and the diff touches no corpus governance rule
   before DEC-01 activates.
2. **Enforce the boundaries.** Platform P1 introduces the pins, the import graph and
   the fence; each package appears only with its first real behaviour.
   **Verify:** the proposed `bun run test:fence` shows every prohibited fixture failing
   and every legal fixture passing, including a design-system import of a contract.
3. **Define the ports.** Data D1a–D1b place the domain schemas and the `CorpusRead` and
   `CorpusEdit` ports in `packages/core`; platform P3 step 2 adds the audio model.
   **Verify:** D1b's conformance suite passes locally and fails when the revision guard
   is removed.
4. **Prove one operation on every surface.** Application step 1 serves one record through
   one handler as HTML, Markdown, CLI and RPC.
   **Verify:** the four outputs agree on ID, revision and citations, and the browser
   bundle contains no handler, database, filesystem or secret.
5. **Prove the provider and the data.** Platform P2 and data D2–D3 select one adapter,
   import, and restore.
   **Verify:** the real-provider suite passes; import and restore digests match; reads
   never mix revisions.
6. **Move each harness responsibility once.** Every move names its destination and
   removes the harness copy in the same change ([data Deletions](data.md#deletions)).
   **Verify:** imports from `packages/harness` only decrease, and no `core -> harness`
   import exists.
7. **Activate once.** Platform P4 runs data D4, application step 5 and design DS5 under
   one freeze and release identity.
   **Verify:** one active writer, the release smoke and the recovery rehearsal pass.
8. **Remove `packages/harness`.** Delete it after every retained behaviour has moved.
   **Verify:** no import remains, `bun run ci` passes, and the module and line comparison
   under [Baseline and measurement](#baseline-and-measurement) is reported.

## Open decisions

The [decision register](README.md#decision-register) owns status; this table records only
this document's position.

| ID | Decision | This document's position | Blocks |
| --- | --- | --- | --- |
| DEC-01 | SQL becomes the mutable corpus authority | Adopt the one-authority table above at P4 activation; current ledgers govern until then. | D4 and P4 activation |
| DEC-02 | Database vendor | Choose the provider that implements the atomic commit and labelled-batch reads directly; keep one adapter. | D2 |
| DEC-03 | Reader framework and UI runtime | Any runtime keeps one handler per operation and no framework server function as a second API. | Application step 1 |
| DEC-10 | Visual design direction | Presentation stays in `apps/web/src/design/` and changes no contract. | Application step 3 views |
| DEC-13 | Immutable artifact store | Upload, verify, then reference; never a live pointer to unverified bytes. | P2 |
| DEC-14 | Infrastructure ownership | One Alchemy resource graph; a plan, a deployment and correct behaviour are separate facts. | P2 |

## Reference decisions

- [Rat-stack rules](https://ratstack.sh/AGENTS.md): project-specific authority,
  source-first workflow, package boundaries, and enforceable checks.
- [Uncomplect](https://ratstack.sh/skills/uncomplect): each new boundary must
  remove caller knowledge or duplicated responsibilities.
- [Add a store](https://ratstack.sh/skills/add-a-store): define the real storage
  operation, bounded reads, row decoding, and provider guarantees.
- [Add a capability](https://ratstack.sh/skills/add-a-capability): one contract,
  handler, and selected projections.
- [Keep or cut](https://ratstack.sh/skills/keep-or-cut): delete unused surfaces
  and their dependencies; do not inherit every template subsystem.

All upstream code references are scoped to the pinned rat-stack revision above.
Recheck changes through MCP and matching source before implementation.
