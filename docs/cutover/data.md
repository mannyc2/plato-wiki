# Normalize the corpus and cut over to one SQL authority

Status: proposed implementation plan; no database migration or authority change has occurred.
Priority P1; effort L; risk HIGH. Planned at Plato `8a5e4c2`, 2026-10-09. Revised 2026-10-26; HEAD unchanged at `8a5e4c2`.
Rat-stack reference: `3fb103b2c6fdeba9460d387827f9d4fd1525d9cc`. External documentation links were last read 2026-10-26.
These operator planning documents stay private: add `docs/cutover/` to `exclude` in `release/public-files.toml` in the same commit that first tracks it ([platform P0](platform-and-audio.md#p0--before-these-plans-are-committed)).

Follow the gates in order; update [README.md](README.md) when each passes.
[Platform P1](platform-and-audio.md) supplies the Effect/fence implementation
foundation. D1a's read-only classification can start immediately; its code and
D1b's local implementation follow P1 and precede P2's real-provider proof. D2 follows provider selection (DEC-02).
These ports serve [application.md](application.md); platform owns infrastructure,
costs and audio. Its P3 step 2 defines recording/chapter/QA/job schemas consumed
here collaboratively; that later contract does not block the corpus-only D1a–D1b proof.

Before implementation, run `git diff --stat 8a5e4c2..HEAD -- packages/harness packages/cli raw/plato wiki derived/plato audio docs/ontology-audit-protocol.md AGENTS.md CONTRIBUTING.md SPEC.md`.
Also run `git status --short`; preserve unrelated work. Compare changed files against the evidence below; revise changed assumptions.
Existing commands here: `git`, `bun run validate`, `bun run ci`, and `bun run harness ontology-audit verify` (`packages/cli/src/cli.ts:921`).
Every `bun run harness corpus …` subcommand and the root `test:database` script are **proposed**; implement them before claiming a run.

## Reference and current state

Read rat-stack's [add-a-store](https://ratstack.sh/skills/add-a-store), [query-design](https://ratstack.sh/skills/query-design) and [database](https://ratstack.sh/systems/database) via MCP search/read before coding.
Query-design was added upstream on 2026-10-12, after the pinned reference; D3 follows the MCP copy read on 2026-10-26.
The governing principles are: name one system of record, no independent dual
writes, validate before persistence, use actual provider guarantees, bound reads
and inspect their query plans, and define idempotent retries. The reference's
`packages/database/src/run-log.ts` demonstrates a job-shaped Effect service;
its `RunLog.record` is neither an atomic corpus edit nor replay-idempotent.
Do not copy its operation guarantees or its optional dual-vendor product scope.

Current behavior is file-backed:

- `packages/harness/src/wiki/*-ledger.ts` parses the six semantic lanes;
  `wiki/ontology/{axes,concepts,memberships}.jsonl` supplies the ontology.
- `packages/harness/src/site/data.ts:1333` filters observations using
  `reviewStatus !== "rejected"`; line 1339 similarly filters claims.
  **Do not use `readSiteData` as an import source.** Import raw validated ledgers.
- `packages/harness/src/source.ts:237–250` computes `startChar`/`endChar`, then
  `source.content.slice(startChar, endChar)` and `sha256(text)`.
- `packages/harness/src/wiki/tools.ts:1315–1322` preserves the first staged
  ledger's base content. Lines 1354–1362 lock, compare that base, validate, and
  write once. The SQL operation must preserve the stale-draft protection.
- `packages/harness/src/review-provenance.ts:184–244` compares review statuses
  against Git or an audited baseline, including deletions; lines 247–277 require
  a changed `wiki/review/` receipt. Hosted SQL cannot silently bypass this rule.
- `packages/harness/src/validate.ts:612–708` also checks reported-turn scopes,
  commentary audit manifests, recording/audio artifacts, completeness and
  public-release reports, projections, and historical ontology audit acceptance.
  Migrating the obvious ledgers alone loses inputs.
- `packages/harness/src/derived/voice-cutovers.ts:18–20` explicitly calls its
  handwritten registry the only voice activation authority. `derived/` contains
  canonical inputs as well as generated files; never delete that tree wholesale.

Read-only inventory at `8a5e4c2` with a clean `wiki/` (not a semantic audit), recomputed 2026-10-26 with results identical to 2026-10-09.
Method: each lane's path lister plus `fencedYamlRecordBlocks` (no `wiki/apparatus/` exists; its reader uses a looser regex), and
`readOntologyVNextRepository` for the ontology, which reported no validation issues. All 24,255 records have unique IDs and are `accepted` or `rejected`:

| Lane | Total | Accepted | Rejected |
| --- | ---: | ---: | ---: |
| Observations | 12,938 | 12,292 | 646 |
| Claims | 4,603 | 3,980 | 623 |
| Relations | 2,274 | 788 | 1,486 |
| Commentary | 710 | 217 | 493 |
| Voices | 3,730 | 3,730 | 0 |
| Apparatus | 0 | 0 | 0 |

Ontology: 483 axes, 3,557 concepts, 7,644 memberships. Recompute at the import revision; these counts and terminal statuses do not establish completeness.

### DATA-01: Correct the source-offset contract before migration

- **Evidence:** `SPEC.md:81`, Source-Bound Observation Contract, calls `source_ref`
  an exact byte range. `source.ts:129–133,237–250` uses JavaScript match indices
  and string slicing: offsets are UTF-16 code units, end-exclusive.
- **Impact:** interpreting existing offsets as bytes or SQL character positions
  changes cited Greek text and invalidates hashes.
- **Effort:** S for the contract correction and regression tests.
- **Risk:** HIGH if implemented as an offset conversion; preserve existing values.
- **Confidence:** HIGH; implementation read directly.
- **Fix sketch:** specify `utf16-code-unit` in the new span contract, retain
  exact source bytes and existing hash algorithm, and correct SPEC's wording.
  Add combining-mark and supplementary-character fixtures; no Unicode or newline
  normalization may precede canonical hashing or slicing.

## Target authority, scope, and invariants

Recommended target: SQL becomes the sole writer for corpus records, ontology,
review decisions, and revision metadata. Immutable source/audio/evidence bytes
live in the artifact store; SQL holds their identities and references. Git keeps
code, reviewed definitions of the model, immutable historical evidence, and
optional generated exports. An export is never a second editable authority.
This is DEC-01, a proposed governance change: activate it only with D4's AGENTS,
CONTRIBUTING, and SPEC amendments, inside platform P4 step 5.

New files belong in `packages/core/src/corpus/` (schemas, source semantics,
validation, `CorpusRead`/`CorpusEdit` ports), `packages/database/src/corpus/`
(selected adapter and row decoders), `packages/database/migrations/`, and their
tests. `packages/artifacts` owns immutable object access. Shared capabilities
project these operations through `packages/capability`; `packages/cli` remains
the CLI. Move proven generic logic from the harness instead of maintaining two
implementations. Move import/export format code into `packages/database/src/corpus/`;
it is a storage boundary, not browser code. Deployment wiring stays in the
platform plan. Source text, review decisions, and record meanings are unchanged
by migration; semantic curation is separate work. D1a adds the proposed root
`test:database` script, `vitest run --config packages/database/vitest.config.ts`,
with an explicit `packages/database/test/**/*.test.ts` include. Set that config's
`root` to the repository: Vitest resolves `include` against `root`, by default
`process.cwd()` ([docs](https://vitest.dev/config/include)), and the root `test`
gate runs each workspace script from its own directory. New Effect tests
use `@effect/vitest` and this runner; existing Bun regression suites retain Bun.

Required invariants:

1. Preserve exact stable IDs, complete typed fields, ordering where meaningful,
   Greek bytes, source hashes, and all 3,248 currently rejected records.
2. Persist source references once as source-version-bound spans; references from
   observations, stance events, speakers, relations, voices, and citations resolve
   to those spans. Extraction reads Greek only; rendering translations retain an
   explicitly different source role.
3. Enforce one axis per concept and unique `(observation_id, concept_id)`
   memberships. Claim/observation reciprocity is one join relation presented in
   both directions, not two independently maintained arrays.
4. Keep observation extraction unclassified. Ontology assignment remains its
   own reviewed operation. Rejection never becomes absence or counterevidence.
5. One `CorpusEdit.commit` atomically persists the complete validated edit,
   affected-ID decision receipt, revision advance, and idempotency result.
   It includes all linked-record changes needed to maintain integrity.
6. An expected corpus revision guards validation against concurrent edits;
   stale edits fail without mutation. Same operation ID and same input digest
   returns the original result; same ID with different input is a conflict.
7. Decode inputs before storage and decode stored rows on reads. Distinguish
   invalid input, stale revision, integrity failure, and provider failure.
8. Draft staging validates without modifying canonical records. Carry staged
   content/base revision in the caller's draft; commit verifies both again.
   Do not depend on a Worker process-local map surviving between calls.

## Normalized table sketch

Refine names through a field-to-column inventory before migration; retain every field and avoid hiding the corpus in JSON blobs.

| Tables | Owned facts and constraints |
| --- | --- |
| `work`, `source_version`, `source_span` | Work identity; source role/path/provenance, immutable object digest; source version + UTF-16 interval + hash and markers, with unique exact span identity. |
| `observation`, `observation_term` | Stable ID, source span, neutral fact/basis/limits/gloss/status; ordered short Greek terms. |
| `claim`, `claim_stance_event`, `claim_observation` | Attribution and speaker evidence, ordered source-bound stance events, one reciprocal evidence join; final stance status derived from terminal event. |
| `relation` | Stable edge ID, pair ID, claim endpoints, kind, basis, limits, resolution and resolution span; retain rejected edges as provenance. |
| `axis`, `concept`, `membership`, `disposition`, `classification_run` | The ratified [ontology v2 target](../ontology-v2-target.md) as the [analysis lane](analysis.md#taxonomy) amends it: canonical keys and hash IDs; axis dimension, authored question, title and reader question; concept definition, title, summary and classifier threshold; axis foreign key; accepted-observation constraint and unique membership pair; each membership's evidence type under DEC-16's A2 (classifier run and probability, or adjudicated receipt and named feature); each `no_axis_applies` disposition and its basis; each accepted run's model, digests, thresholds and evaluation, imported from the run record in the cutover receipt. The vNext shape is never imported into the production database. |
| `commentary`, `apparatus`, typed citation/cross-reference joins | Authored prose, titles, placement/audio insertion, review status; real foreign keys to each target kind. Dossier references resolve through axis/concept identity. |
| `voice`, `voice_chain_member`, `voice_evidence`, `voice_candidate_owner` | Ordered attribution chain, resolution/reason, reviewed attribution and evidence roles, outer-turn identity, exact source binding. |
| `speaker_siglum`, `voice_activation`, `reported_turn_scope` | Handwritten turn/voice registries, explicit activation decision, scope disposition and its receipt/source/index bindings. |
| `decision_receipt`, `decision_item`, `corpus_revision`, `operation_result` | One concise decision with affected IDs, references, disposition/reason, independent-review outcome and validation; ordered revision metadata and idempotent command outcome. |
| `artifact`, `historical_evidence` | Digest, byte length, media type, object locator and historical path/commit bindings. Recording/chapter/job schemas are owned by the platform/audio plan. |

Use typed join tables rather than polymorphic target strings without referential
checks. Keep storage constraints for uniqueness, foreign keys and scalar checks;
domain validation handles accepted-target and source-evidence rules. Search
(including the English full-text index the [design system](design-system.md#data-requirements)
needs), turn indexes, English-to-Greek line alignment, the per-entry timing index
(`recording_timing`) defined by platform P3 step 2, clusters, dossiers, and coverage are
revision-labelled rebuildable projections. Do not turn disposable views into competing
canonical tables.
Any SQL full-text copy of source bytes is a derived search index, rebuilt from the immutable source version rather than independently edited.

## Ordered implementation

### D1a. Freeze and classify every import input

Create `packages/database/src/corpus/import.ts` and `inventory.ts`. Read strict
fenced-record/ontology parsers and existing validators directly. Inventory every
tracked input under `raw/plato`, `wiki`, `audio`, and `derived/plato` into source,
canonical record/registry, immutable evidence, generated projection, or unrelated
documentation. Include `raw/plato/SOURCES.md`, `raw/plato/MANIFEST.sha256`,
`wiki/reported-turn-scopes.json`, `derived/plato/{turns,voices}/sigla.toml`,
`derived/plato/voices/cutovers.toml`, `derived/plato/anchors/lexicon.toml`, and
`derived/plato/metrics/procedure/anchors.toml`. Resolve every validator input;
an unknown classification fails closed. Recording/audio evidence is handed to
the platform plan with original digests and acceptance states. The 27 listening
manifests are `draft` and live in the external review catalog, not in tracked files;
platform P3 step 1 registers them from that catalog. D1a inventories tracked files
only, including the one `withdrawn` manifest under `wiki/recordings/`, and hands
every recording digest and state it finds to platform.

Classify `wiki/ontology/*.jsonl`, `wiki/clusters/`, `wiki/dossiers/` and
`wiki/ontology-quality.md` as superseded by the [analysis lane](analysis.md)'s hard
cut (AN6). Until AN6 lands, an import rehearsal may load the vNext ontology only
into a disposable target; the final import loads AN6's ontology.
Bind the import to a clean, immutable corpus Git revision, exact file hashes,
all status counts and ID sets, field coverage, and references. Preserve original
ledger bytes in the immutable baseline archive; normalized serialization need
not reproduce incidental YAML formatting. Correct DATA-01 in SPEC and schemas.

**Verify:** existing `bun run validate` and `bun run harness ontology-audit verify`
exit 0 on the frozen baseline (`verify` requires exactly one `wiki/ontology-audits/` package; one exists).
Proposed `bun run harness corpus inventory --revision <sha> --out <file>`
reports zero unclassified inputs, unknown fields, invalid references, duplicate
IDs or hash mismatches; outputs current counts by lane/status.
`bun run test:database -- packages/database/test/corpus-inventory.test.ts` proves DATA-01: stored offsets
around a combining mark and a supplementary-plane character reproduce `text_sha256`, while UTF-8-byte and code-point readings fail.

### D1b. Prove the atomic operation and choose the database

First define the `CorpusRead` and `CorpusEdit` ports in `packages/core/src/corpus/`
(proposed): `CorpusEdit` with its `commit` operation, and `CorpusRead` with the
revision-labelled record read that application step 1 consumes, each with schema-decoded
inputs and results and typed failures; D3 adds the remaining bounded reads. The record read's
conformance test, `packages/database/test/corpus-read.test.ts` (proposed), has the
interleaved-commit read case from the start: a commit between its parent, join and evidence
reads yields one revision's complete result or `RevisionChanged`. Then implement
the smallest Cloudflare D1 candidate of `CorpusEdit.commit` (DEC-02's preferred
cost candidate) and its shared conformance test in `packages/database/test/corpus-edit.test.ts`.
The [batch API](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch)
calls batches SQL transactions that abort on a failed statement, yet the same
section says Cloudflare D1 "operates in auto-commit"; prove that a late failure leaves
earlier statements unapplied. Rollback alone does not prove the revision guard,
whole-ledger validation, receipt or replay contract. A guarded UPDATE affecting
zero rows is not a failure.

Candidate mechanisms to prove (hypotheses from current documentation, not guarantees):

1. **Validate, then re-guard.** No Cloudflare D1 binding method opens an interactive transaction;
   each query runs in an implicit one, and imported SQL must drop `BEGIN TRANSACTION`/`COMMIT`
   ([foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/), [import](https://developers.cloudflare.com/d1/best-practices/import-export-data/)).
   Validate against reads at revision R, then re-assert R in the batch. Every canonical
   write advances the revision, so this re-asserts every validation read and serializes curation; measure contention.
2. **Stale R fails the first statement.** Prefer inserting `corpus_revision(revision = R + 1,
   parent_revision = R)` with `revision` as primary key and a unique, foreign-keyed parent:
   a stale R collides, and a future R fails the foreign key Cloudflare D1 enforces by default. A
   guard-table trigger running `SELECT RAISE(ABORT, 'stale_revision')` is the alternative;
   Cloudflare D1 documents SQLite compatibility and `PRAGMA recursive_triggers` but not `CREATE TRIGGER`
   or `RAISE` explicitly ([SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/)).
   Prove the error identifies the guard, so the adapter returns `StaleRevision`.
3. **Stored digest for idempotency.** The batch inserts `operation_result` keyed by operation
   ID, with the input digest (canonical decoded edit, expected revision, actor), committed revision and
   receipt. Look the ID up before the revision check: the same digest returns the stored
   result; a different digest conflicts. Cloudflare D1 never retries writes automatically, and a write the
   Worker stopped awaiting may still commit ([debug D1](https://developers.cloudflare.com/d1/observability/debug-d1/)).
   After any batch error, timeout or lost response, re-read that row on the primary before
   classifying; no row after a transport error is an unknown outcome to retry with the same ID.
   Rolled-back attempts store nothing.

Exercise a representative maximum-size edit plus reciprocal links and receipt; the
largest current whole-ledger commit is `wiki/observations/laws.md` (2,412 records,
2,808,372 bytes). Measure statement/bind counts, bytes, duration and indexed reads
against [actual Cloudflare D1 limits](https://developers.cloudflare.com/d1/platform/limits/):
per-statement limits (100 bound parameters, 100 KB of SQL) apply inside a batch, a
batch counts once toward Workers Paid's 1,000 queries per invocation, and the
30-second limit covers the whole batch call.
Never split one accepted edit into independently visible commits to fit limits.
Test invalid input, mid-operation constraint failure, simultaneous stale writers, lost response followed by retry, reused ID/different body, restart after stage,
and rejection of an accepted target with existing dependent records. Remove the
guard once and observe the conformance test fail.

**Verify:** `bun run typecheck` passes with both ports exported from `packages/core`, and the
conformance test reaches the candidate only through `CorpusEdit`.
`bun run test:database -- packages/database/test/corpus-edit.test.ts packages/database/test/corpus-read.test.ts`
passes locally, including the record read's interleaved-commit case; the separately authorized
P2 real-provider probe described by the platform plan passes the same scenarios through Worker
bindings.
Both failed and stale edits leave zero row/receipt/revision changes; racing commits produce one winner;
retry produces one receipt and revision. These results decide DEC-02: if Cloudflare D1
cannot do this simply, repeat the proof on PostgreSQL after its cost gate.

### D2. Import without changing semantic decisions

Build selected-dialect migrations, schemas, row decoders, and strict import in
`packages/database`, including platform P3 step 2's audio tables. The migration
changes no semantic decision; the analysis lane makes the one ontology change,
under its own receipts, and AN6 precedes P4's final import. Import into a fresh isolated database from the frozen
inventory. Small validated chunks may populate an unpublished database; expose
none of it until the entire corpus verifies. Stable input identity makes restart
safe; mismatched resume inputs fail. Do not use `INSERT OR IGNORE` to hide drift.

Deduplicate identical object bytes by digest and byte verification, exact span
identities, and repeated storage representations of the same canonical join.
Duplicate IDs with different content fail. Similar prose, shared spans, or two distinct stable record IDs are not mechanical duplicates. Produce candidate
pairs for later review; any semantic merge must preserve history and references
with an accepted decision receipt. No paid model calls are needed for import.

**Verify:** `bun run harness corpus import --inventory <file> --target <isolated-target>`
followed by `bun run harness corpus verify --inventory <file> --target <isolated-target>`
exits 0; exact ID/status/field/edge/source/receipt sets match, dangling references
and orphan receipt changes equal zero. Repeating import changes zero canonical
facts. `bun run test:database -- packages/database/test/corpus-import.test.ts` includes invalid
input, deliberate field loss, interrupted import and conflicting duplicate IDs.
`bun run test:database -- packages/database/test/recording-accept.test.ts` proves that a stale,
replayed or unreviewed `accept` writes nothing; it exercises platform P3 step 2's operation
over this commit contract.

### D3. Prove readers, rebuilds, and portable recovery

Implement bounded `CorpusRead` operations needed by application.md, following
query-design. Every query documents filters, index, ordering, maximum rows and
bytes, stable cursor, statements per call (constant in result size) and a
rows-examined budget at 100× current table sizes; use provider query plans.
Initial page-size limits are measured in this step, not inferred from a SQL
`LIMIT`. Page by keyset over an indexed tuple ending in the stable ID, fetching
`limit + 1`; never use `OFFSET`. Never query per row: page parents, then read
each child kind with one bounded `IN` that repeats the parent's visibility
filter (Cloudflare D1 allows 100 bound parameters per statement). Default public reads require accepted records;
review reads are explicit authorized operations and retain rejected evidence.

Multi-query responses describe one revision. Every canonical commit advances the
global corpus revision, so a revision read inside each labelled batch labels its snapshot.
Independent reads share one labelled batch; dependent reads (children of a
returned page) use further labelled batches, and any differing label returns
`RevisionChanged`, never a mixed response. If PostgreSQL is selected, one repeatable-read
transaction serves as each labelled batch, as [architecture](architecture.md#one-operation-across-interfaces)
describes, and Hyperdrive query caching stays disabled for these mutable authority reads
(platform P2 step 4).

If Cloudflare D1 is selected, a batch is documented as one SQL transaction, so its
revision read labels its snapshot regardless of routing. Before/after reads in separate
statements bracket others only on the primary or within one session. Sessions
govern freshness: without the Sessions API every query goes to the primary; with
read replication a replica may be arbitrarily stale, and [`withSession`](https://developers.cloudflare.com/d1/worker-api/d1-database/#withsession)
gives sequential consistency, `first-primary` starts from the latest data, and a
bookmark resumes no older than its session ([read replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)).
Validate curation through `first-primary` and carry the bookmark with continuation
cursors. Keep replication disabled until the real-provider gate shows, with it
enabled, that read batches never mix revisions under interleaved commits, that
bookmarked sessions never go backwards, and that a `first-primary` session's first
read reports `served_by_primary` and sees the latest commit.

Implement generic `corpus export`, `restore`, and `rebuild`. For the initial
small corpus, freeze writes for the bounded export window so paginated exports
represent exactly one revision, and check every page's revision label; do not claim multiple Cloudflare D1 reads form a snapshot.
Exports bind schema version, revision, sorted normalized rows, evidence/object
inventory and hashes. Restore into an empty database and verify before serving.
Under DEC-13, an immutable object is uploaded and verified before its SQL reference commits;
failed publication may leave an unreferenced object, never a broken live pointer.
Object cleanup follows [Deletions](#deletions).

Preserve each `wiki/ontology-audits/` package and its baseline Git objects. Its
accepted manifest, receipts and regeneration hashes remain immutable, as required
by `docs/ontology-audit-protocol.md:275–289`. Restore a frozen historical checkout
and verify that historical package; separately validate the current SQL corpus.
Historical acceptance is not evidence that later edits have passed current gates.

**Verify:** `bun run test:database -- packages/database/test/corpus-read.test.ts packages/database/test/corpus-recovery.test.ts`
passes, including leaked-rejected-record and missing-object counterexamples.
Extend D1b's interleaved-commit case to every bounded read: a committed edit between parent, join and evidence reads returns one revision's complete result or fails with `RevisionChanged`.
A counting executor Layer at the adapter boundary keeps statements per page constant below, at and above page
boundaries, and the suite fails on a planted per-row child query. On full-size imported data,
if Cloudflare D1 is selected, [`EXPLAIN QUERY PLAN`](https://developers.cloudflare.com/d1/best-practices/use-indexes/) names each index
(`SEARCH … USING INDEX`, no full `SCAN` or temporary B-tree sort on growing tables) and
[`meta.rows_read`](https://developers.cloudflare.com/d1/worker-api/return-object/) stays within each budget;
if PostgreSQL is selected, `EXPLAIN (ANALYZE)` shows the same index use, with examined rows within each budget.
`bun run harness corpus export --target <isolated-target> --out <archive>`;
`bun run harness corpus restore --from <archive> --target <empty-target>`;
`bun run harness corpus verify --inventory <file> --target <empty-target>` all
exit 0 with equal canonical digests. `bun run harness corpus rebuild --target <empty-target>`
twice produces identical projection digests. Record restore time and backup age;
DEC-07 sets recovery objectives from those measurements before production activation.

### D4. Make the hard cutover and remove competing writers

D4 is the data checklist that platform P4's single activation coordinator executes in
its step 5; it is not a second deploy action. Prerequisites are D1–D3 and application steps
1–4's preactivation checks, not completion of publication itself. Freeze file
curation, take the final verified import and backup, and activate SQL readers and
writers together. Under DEC-01, update AGENTS, CONTRIBUTING and SPEC so new decisions
commit atomically in SQL; `wiki/review/` exports are generated views of those
decisions, while existing historical receipts remain immutable. DEC-01 takes effect
with these amendments; SQL writes stay closed until they land and P4 step 5 reopens
writes. Remove competing writers and readers as listed under [Deletions](#deletions).

**Verify:** `bun run ci` exits 0 with current SQL validation wired into its offline
test fixtures, not a live credential requirement. `git diff --check` is clean.
The application tests prove every retained reader uses the new port and legacy
file edits cannot change served state. Recovery restores a verified SQL snapshot
in maintenance mode before SQL writes resume; the retired file writer stays off.
Every Deletions row due by activation is complete.

## Deletions

Steps point here. Never delete `wiki/`, `derived/` or handwritten TOML inputs by directory name.
Provider comparisons and migration coordination notes are never committed, so no row deletes them:
they stay in ignored scratch or outside the repository, as [AGENTS.md](../../AGENTS.md) requires of
coordination artifacts.

| Removed | Replacement | Delete when — proof required |
| --- | --- | --- |
| `packages/harness/src/wiki/tools.ts` file mutations and staged process maps | Core stage/commit capability over `CorpusEdit.commit` | All callers moved; D1b local and P2 real-provider revision/idempotency proofs pass. |
| Runtime `*-ledger.ts` filesystem loaders and `readSiteData` disk graph | `CorpusRead` SQL ports | Application parity shows every reader uses the port; keep only import/export parsing for portable backups and historical verification. |
| Git-working-tree review gate as the live provenance check | Receipt validation inside the SQL commit transaction | D4; historical Git verification stays scoped to archived evidence and is never presented as a hosted guarantee. |
| Editable Git ledgers, ontology and registries as live authority | SQL rows; verified baseline archive and generated exports, with no automatic file-to-database sync | Final verified import and backup under the P4 freeze, with DEC-01's amendments. |
| Runtime consumers of generated clusters, dossiers, TOON, search and site paths | Rebuilds from the selected canonical revision | D3 byte-stable rebuilds plus application parity. |
| Harness copies of logic moved to `packages/core` or `packages/database` | The moved implementation | In the moving change, once callers and tests have moved. |
| Losing probe adapter, its migrations and any vendor selector | One selected adapter and its migrations; generic migration, export/restore and validation operations | DEC-02 decided and import verified; before activation. |
| Unreferenced artifact objects | None | Proven unreachable from retained revisions and backups, within DEC-07 retention. |

## Open decisions

[README.md](README.md) owns each decision's status and rationale; this table gives only this plan's recommendation.

| ID | Decision | This plan's recommendation | Blocks |
| --- | --- | --- | --- |
| DEC-01 | SQL becomes the mutable corpus authority | Adopt the target above; amend AGENTS, CONTRIBUTING and SPEC only in D4, inside platform P4 step 5, before SQL writes open. Git ledgers and receipts govern until then. | D4 and P4 activation |
| DEC-02 | Database vendor: Cloudflare D1 or PostgreSQL | Cloudflare D1 only if D1b's local proof and P2's real-provider probe pass every commit and read-consistency scenario within measured limits; otherwise PostgreSQL after its cost gate. One adapter survives. | D2 |
| DEC-07 | Recovery objectives and backup retention | Set from D3's measured restore time and backup age; provider point-in-time recovery complements, never replaces, the portable export. | P4 |
| DEC-13 | Immutable artifact store (R2, verify-before-reference) | Adopt: verify bytes before their SQL reference commits; clean up only proven-unreachable objects. | P2, hence D3's object restore |

## STOP conditions and completion evidence

Stop and report on source-byte/offset changes, missing fields or historical proofs, unknown import inputs, duplicate stable IDs, unreviewed semantic merges,
inability to commit an entire invariant-preserving edit atomically, a mixed-revision read, provider-limit
failures, or a recovery digest mismatch. Do not weaken provenance or validation
to complete migration. No production mutation follows from this planning task.

Completion requires the selected-provider proof, exact import parity, bounded query plans, byte-stable rebuilds, verified independent restore, SQL governance
amendments, consumer parity and removal of competing writers. Report corpus
delta first: migration should add/reject/accept/merge **zero semantic records**;
report only measured physical deduplication separately. The analysis lane's
ontology replacement is reported under its own receipts, not as migration delta. SQL authority remains
the proposed cutover target until DEC-01 activates; see [Open decisions](#open-decisions).
