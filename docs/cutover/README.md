# Plato hard-cutover plan

Status: proposed implementation program; no migration or deployment has run.
Prepared 2026-10-09 against Plato `8a5e4c2` and rat-stack
`3fb103b2c6fdeba9460d387827f9d4fd1525d9cc`. Revised 2026-10-26; HEAD unchanged at `8a5e4c2`.
Revised 2026-10-27 to add the [analysis lane](analysis.md), which executes the ratified
[ontology v2 target](../ontology-v2-target.md) with amendments (DEC-16).
Rat-stack code references stay pinned at `3fb103b`. Its MCP pins were rechecked on 2026-10-26
(platform P1 step 1). Later MCP pages, such as query-design (added upstream 2026-10-12), and the
Foldkit and Alchemy sources behind DEC-03 are cited with their read dates where used.

The outcome is one normalized corpus, shared typed operations, a hosted reader
with Markdown and agent access, and a resumable audio producer. Effect owns
effectful application work. Alchemy owns the cloud resources. Compiler checks,
lint, and behavior tests enforce the boundaries. Bun remains the package manager.

This document is the entry point. Read [the target architecture](architecture.md)
before executing [data](data.md), [analysis](analysis.md), [application](application.md),
[platform and audio](platform-and-audio.md), or [design system](design-system.md) work.
These plans do not supersede the current corpus rules until the authority change is
implemented and verified.

## Why these documents

The rat-stack MCP was used to search and read its rules and skills before
planning. Its [agent rules](https://ratstack.sh/AGENTS.md) put commands, package
boundaries, and authority in repository instructions. Its
[vision](https://ratstack.sh/VISION.md) explains product intent. Its
[system-page convention](https://ratstack.sh/skills/write-a-wiki-page) asks what
a system does, what standard it maintains, and how to check it. Its
[planning router](https://ratstack.sh/skills/rat-stack-mode) requires one named
authority per fact and inspection of the actual delegated artifacts.

These are responsibilities to adopt. Rat-stack's `.brain/` publishing tree,
template branding, pnpm workspace, and workshop workflows are not requirements
for Plato. The local `improve` skill's default `plans/` destination is also
overridden by the user's explicit request for durable plans in `docs/`.

| Document responsibility | Plato location and action |
| --- | --- |
| Product purpose and exclusions | This plan's scope plus existing [SPEC](../../SPEC.md). During foundation work, write a short root `VISION.md` for product intent; link the specification rather than duplicating its record contracts. |
| Enforceable working rules | Existing [AGENTS](../../AGENTS.md) and [CONTRIBUTING](../../CONTRIBUTING.md). Add rat-stack source-first guidance and package boundaries during foundation work. Amend corpus authority rules only at activation. |
| Target architecture and decisions | [architecture.md](architecture.md) owns the proposed truth model and package boundaries. The [decision register](#decision-register) below owns every decision's status. |
| Executable work | The five lane plans (data, analysis, application, platform and audio, design system) own exact source locations, ordered steps, deletion maps, verification, and stop conditions. The design system also owns the record of the user's visual approvals; analysis owns the record of the user's idea-catalogue approval. |
| Shipped system behavior | Update existing browser, audio, operations, and release docs when the corresponding behavior ships. Use “what it does / standard / how to check”; do not document a proposed capability as deployed. |
| Execution evidence | Record actual test, import, restore, and release results with the relevant artifact. Corpus review receipts stay in their canonical system. These plans are not review receipts. |

Platform P0 is a precondition for committing these plans, not only for publishing
an export. The commit that first tracks `docs/cutover/` must add that exact prefix to
`exclude` in `release/public-files.toml` and pass P0's export-manifest check; no
earlier commit may track a cutover document. The manifest currently includes all of
`docs/`, whereas the [publication policy](../publication-license.md) excludes plans.
This documentation pass does not alter release machinery. Promote settled public
architecture into the maintained system docs; do not accidentally publish private
planning as part of a public corpus release.

## Scope and success

Preserve exact Greek sources, stable record identities, all review dispositions,
accepted evidence, source attribution, complete reading coverage, and the
separation of draft audio from accepted recordings. Ontology relationships are
preserved until the analysis lane's reviewed hard cut (AN6) replaces them. Keep the
existing generic curation and completeness operations available through their
new implementations. The 27 recordings remain review candidates unless their
independent editorial acceptance is recorded.

The hard cutover removes live file-ledger writers, duplicate schema contracts,
the old site generator/serving path, and the replaced deployment workflow only
after their replacements prove the required behavior. A staged candidate is
allowed during development. Production must have one active writer and one
serving implementation after activation. There is no permanent dual-write,
legacy reader fallback, or second ontology.

Out of scope: mass semantic deduplication of records, new commentary or audio
generation, a hosted autonomous model loop, runtime model calls from the reader
(DEC-20 may reopen these for curated pages and generated answers), a chatbot or assistant chat UI, code-mode sandbox, A2A, and a new visual product
for the untracked Three.js demo. New classification and Decisions API use are in
scope only through the [analysis lane](analysis.md): budgeted batch
classification that an operator runs against a user-ratified catalog. The interactive-dialogue idea that
the [design system](design-system.md#open-decisions) parks, in which a reader joins
a dialogue as an interlocutor, is likewise out of scope. Existing prototype work is
preserved.

Success is evidence, not package creation:

- Every imported canonical ID, disposition, source hash, and relationship is
  accounted for; rejected records and historical receipts survive.
- One authenticated edit commits its record changes, revision, and decision
  receipt atomically. A stale edit fails without partial writes. A retry cannot
  apply a decision twice.
- HTML, Markdown, CLI, and agent reads describe the same selected corpus
  revision and visibility policy.
- Every required reader route, citation, and audio operation passes acceptance
  on the actual chosen runtime, including seeking and resume.
- A complete backup restores into a fresh database and artifact environment.
- The offline `bun run ci` gate remains offline. Deployed checks independently
  prove real provider behavior. Forecast and observed cost are recorded.
- Replaced paths are deleted and the fence detects their reintroduction.

## Decision register

Settled inputs, not open decisions: the user directed Effect, tsgo, Oxlint, Alchemy and a
hard cutover, so the fence comes before application migration and sources matching the
selected pins are inspected; existing project rules keep Bun, Greek-only extraction,
unclassified observations, and independent semantic review.

This register owns each decision's status. Lane plans record only their own positions in
their Open decisions tables. Record each outcome here with its date and evidence.

| ID | Decision | Status | Owner plan | Recommendation / evidence | Blocks |
| --- | --- | --- | --- | --- | --- |
| DEC-01 | SQL becomes the mutable corpus authority | Proposed; activates only in P4 step 5 | Data | Use SQL revisions and transactional receipts. This changes the current Git-ledger governance: data D4 amends AGENTS, CONTRIBUTING and SPEC inside P4 step 5, and SQL writes stay closed until those amendments land; ledgers and Git receipts govern until then. | D4 and P4 activation |
| DEC-02 | Database vendor: Cloudflare D1 or PostgreSQL | Conditional | Data (proof); platform (provisioning) | Cloudflare D1 only if data D1b's local proof and P2's disposable real-provider probe pass every commit and read-consistency scenario within measured limits; otherwise PostgreSQL through Hyperdrive after its cost gate. One production adapter survives. | D2; application steps 2–4 |
| DEC-03 | Reader framework and UI runtime | Decided 2026-10-27 by the user: Foldkit; application step 1 still proves it | Application | Foldkit 0.169.0 with `effect` and `@effect/platform-browser` 4.0.0, pinned exactly. The design workspace in `apps/web` is built on it first. Step 1 proves SSR, hydration and the primitive criterion on Workers through `Cloudflare.Website.Foldkit`; a failing criterion comes back here for the user, not as a silent switch to TanStack Start. | Application step 1; DEC-11; DS2 |
| DEC-04 | Hosting budget scope (about $5/month) | Open | Platform | Planning assumption: hosting, database and artifacts only; model calls and GPU work are budgeted separately. Account-wide usage and overages count; alerts reduce exposure but are not a spending cap. Confirm before provisioning. | P2 provisioning; the application's SSR budget STOP |
| DEC-05 | Public exposure: corpus subset, domain, source and media publication rights | Open | Platform; application | Keep private review access initially. Public registries serve only accepted, licensed records, and no recordings while the publication policy excludes them. Hosting approval does not establish audio editorial acceptance or source publication rights. | Any public deployment |
| DEC-06 | Curator identity and MCP/CLI credential flow | Open | Application | Prefer the deployment provider's authentication boundary if the intended MCP/CLI client can use it; one curator role, no registration. | Application step 4 |
| DEC-07 | Recovery objectives and backup retention | Open until data D3 measures restore time and backup age | Data; platform | Set from D3's measurements; portable exports, with the selected provider's point-in-time recovery (Cloudflare D1 Time Travel, or the PostgreSQL host's backups) only as a complement. | P4 |
| DEC-08 | Bounded GPU smoke workload | Open; needs separate authorization | Platform | One bounded existing screenplay. | P3 steps 3–6 completion |
| DEC-09 | Whether GPU orchestration (P3 steps 3–6) is on the activation path | Recommended: no | Platform | P4 needs P3 steps 1–2 and the SQL-only `accept`; old audio writers freeze, then are deleted at activation; steps 3–6 precede the next GPU production run. Alternative: all of P3 before P4. | P4 scheduling |
| DEC-10 | Visual design direction | Decided 2026-10-26 by the user: Bookshelf, with Listen's player and read-along; full-system approval pending (DS1) | Design system | Chosen from three directions in the private "Plato Design Directions" artifact. Version 10 of the full-system artifact, with phone and desktop screens, was published for review on 2026-10-27, after the user's recorded walkthroughs of versions 6 and 9. Conversation is parked as the reference for a possible interactive dialogue, which is out of scope. | DS1–DS4; application step 3 views |
| DEC-11 | Interactive UI primitive foundation | User chose native-first; confirm in application step 1 | Design system; application | Native elements first; `@foldkit/ui` 0.169.0 only for behaviour native elements lack: its Tabs for in-page tabs and its Menu for roving focus in the line-actions menu. The choice must pass step 1's primitive criterion. | DS3; application step 3 interactive views |
| DEC-12 | Typefaces | User chose Gentium Book Plus for Greek; Literata and Inter follow DEC-10 | Design system | Greek always with `lang="grc"`; Literata for reading and Inter for UI; self-hosted WOFF2 under the OFL with licences recorded; application step 3 verifies polytonic rendering. | DS2; application step 3 verification |
| DEC-13 | Immutable artifact store (R2, verify-before-reference) | Recommended: adopt | Platform; data | Private R2 for exact sources, media, large historical evidence and exports under content-addressed keys. SQL records their identities and visibility and references bytes only after verification; cleanup removes only proven-unreachable objects. | P2, hence D3's object restore |
| DEC-14 | Infrastructure ownership | Recommended | Platform | One Alchemy stack with named `dev`, `integration` and `prod` stages; adopt existing resources only by exact identity; verify adoption and replacements from an actual plan; no competing Wrangler-managed state. | P2 |
| DEC-15 | Key from reading lines to screenplay entries, for the per-entry timing index | Open | Platform; design system | Have the screenplay generator emit each entry's English UTF-16 interval in the bound source version, `-part-NNN` splits included, and map reading lines to entries by overlap. Today entries carry only `id`, `text` and `anchor.stephanus`; attribution turns carry `start_char`/`end_char`, but the split parts drop them. | Read-along and per-line Play from here (new features, not activation) |
| DEC-16 | Execute the ratified ontology v2 target, with amendments, from the observation layer | Decided 2026-10-27 by the user: A1–A3 adopted, A2 as typed evidence, with the AGENTS.md amendment | Analysis | The [target](../ontology-v2-target.md), ratified 2026-09-07, stopped after phase 0. Base: sources, deterministic indexes, voices and all 12,938 observations with their status history. A1 classifies with the Decisions API instead of 27 agent jobs. A2 gives classifier memberships typed evidence (recommended) or a named term. A3 adds titles and summaries, approved with the catalog count. Approval also covers the AGENTS.md amendment that permits the classifier, landing before AN3. The current 3,557 concepts are the v2.0.0 feature labels renamed, with templated definitions, and 4,648 accepted observations have no membership. The audit freeze keeps every receipt and table in scratch until AN6 commits them with the new package. Claims, relations and commentary prose stay unchanged apart from C2's citation remap. | Analysis AN2 onward; P4's final import |
| DEC-17 | Paid analysis work: budget, key and approval | Approved 2026-10-27 by the user: the Decisions budget with its $60 cap, and the agent sessions. DEC-19's voice review is forecast at about 9–10 million agent tokens, measured at 160–195 thousand per curation or review session over about 50 sessions. Still due: the forecast for the other agent sessions, recorded before AN1, and an `OPENAI_API_KEY` before AN4 | Analysis | Decisions API at $0.10 per million input tokens: about $13 per full pass and about $35 for the lane, with a proposed $60 cap. Agent sessions need their own forecast: AN1's table drafting and checks, AN2's catalog authoring and overlap review, calibration labelling, the O4 pass of 615 observations and its adjudication, refusal reviews, DEC-19's review, and C2's fresh commentary audit samples. Approve the agent-session forecast before AN1, and the Decisions budget before AN4's pilot, which measures actual usage first. No `OPENAI_API_KEY` is configured on this host. | Analysis AN1 onward |
| DEC-18 | Second analysis phase: claims, relations and rejected observations | Open; decide after AN5 | Analysis | If AN5's measured quality supports it, re-derive "Two views" relations by typed classification of candidate claim pairs, and re-review the 86 fail-closed and the irony rejections with a typed support check. | Nothing in activation |
| DEC-19 | Speaker attribution in seven dialogues | Decided 2026-10-27 by the user: yes to both. The voices are resolved from the Greek with an agent review and receipt, under A4; Who speaks shows unowned quotations as quoted by their speaker | Analysis | Who speaks is credible now for 20 dialogues and Role for 22. The Republic has no inner voice records after 354c, and Parmenides, Lysis, Charmides, Phaedrus, Euthydemus and Greater Hippias are 13–86% unattributed. Role, which needs only the speaker in the scene, already covers Phaedrus and Greater Hippias. Recommended: resolve the voices from the Greek with an agent review and receipt, and approve amendment A4 so that the changes land in AN6's change set under the new audit package. Also decide whether Who speaks may show the Phaedrus and Greater Hippias quotations as quoted by their speaker. Until then, Who speaks stays hidden in the seven and Role in five. | Who speaks in seven dialogues; Role in five |
| DEC-20 | Curated pages and generated answers | Directed by the user 2026-10-27 in the review of artifact version 9. Timing decided by the user the same day: pages are written ahead of time and reviewed first. The user passed all 160 pages of the Crito, Apology, Euthyphro and Phaedo (2026-10-27 and 2026-11-01). Drafting is paused from 2026-11-03 until analysis AN1 generates the speaker shares and chapters the design kit now types in, and the speaker check reads voice records instead of the English labels | Design system; analysis; application | The review asks for curated Person, Idea and Explain content, possibly written on demand by an agent. That reverses the design plan's exclusion of model-written notes and model calls at reading time. Proposed, after the user's kace postal-reference research: one typed block catalog serves curated pages and generated answers. They are written as GFM with container directives and drawn by the same views. A block names a passage or an analytic and never retypes Plato's text or a number. One checker holds every quote to the reading text, resolves every reference, checks that a "Two views" line is spoken by its speaker, and fails a block whose analytic is hidden. The speaker check reads the turn index refined by resolved voice records, because the turn index alone gives a narration's words to its narrator: the whole Republic is one unlabelled turn, and the Phaedo's prison conversation sits inside Phaedo's turns. The check reaches the Greek through data requirement 2's English-to-Greek alignment and passes a line only when the Greek it aligns to has one owner. Requirement 2 pairs turns within a Stephanus section, so Two views fails closed wherever the aligned turn or section holds more than one voice: inside narrations, and in turns with nested speech such as the Crito's objector at 48a. Extending the alignment to voice records is open for data. A line whose speaker is unresolved or has no voice record also fails, which limits Two views in DEC-19's seven dialogues. The design workspace's checker stands in with the English rendering's speaker labels and refuses only `{q}`-marked speech; production never uses the labels. Every page is also served as Markdown. Curated content stays outside the corpus and is never presented as Plato's text. Pages are drafted ahead of time in an agent session, with no paid API call, and a second agent checks each claim against the sentence it cites. Drafts sit in `apps/web/src/design/pages/<dialogue>/` and must pass the checker in `bun run test`; within a dialogue, line notes do not overlap. A page's receipt is a `reviewed` front-matter entry beside it, holding the date and the page's content hash, written only after the user reads the page in a review artifact. The hash binds the review to the text read: the checker fails a page whose hash no longer matches, so an edit drops the entry until the user rereads the page. The application shows only pages whose entry verifies. Receipts stay beside the pages because curated content is outside the corpus and the audit freeze holds `wiki/review/`. Writing live per reader, and any paid drafting call, waits for its own budget approval. | DS1's Person, Idea and Explain screens; application step 3's notes contract |

An executor can complete local foundation, contract design, and import rehearsal
while the deployment choices remain open. They must not silently turn a
proposal into a production default.

## Execution order and ownership

Each task receives one writer for its files and an independent reader for the
result. Shared contracts and schema changes are integrated before dependent
writers branch. Do not let several agents edit the same schema or plan index.

| Order | Work | Depends on | Evidence before advancement | Status |
| --- | --- | --- | --- | --- |
| 0 | Platform P0: exclude `docs/cutover/` from the public export | Nothing; a precondition for the first commit that tracks these plans | A clean export manifest lists no `docs/cutover/` path | Planned |
| 1 | Platform P1: pins, package boundaries, test runners, fence | This architecture | Deliberate boundary violations fail; offline gates pass | Planned |
| 2 | Data D1a–D1b: inventory, `CorpusRead`/`CorpusEdit` port definitions and local atomic-write proof; platform P3 steps 1–2: audio schema handoff | P1 for implementation; D1a's read-only classification can start now | Complete authority inventory, source proof, recording/QA/job contract, import baseline, failure cases | Planned |
| 3 | Design system DS0–DS1: direction and full-system visual approval | Nothing in code | DS0 decided 2026-10-26; the user's approval of the full system recorded with artifact URL and version | DS0 done; DS1 in review (artifact version 10, 2026-10-27) |
| 4 | Application step 1 with design DS2: one complete read, the DEC-03 proof, tokens and fonts | P1 and D1b's port definitions only; step 1 uses a deterministic SQL fixture. DS2 also needs DS1 | Step 1's proof criteria with measurements; DS2's token and Greek-glyph tests | Planned |
| 5 | Platform P2: disposable provider proof and cost selection | D1b's local proof; DEC-04, DEC-13 and DEC-14 for provisioning | Real Cloudflare D1 or PostgreSQL passes concurrency/rollback/retry tests and data D1b's interleaved-commit read case; selected resources and cost documented | Planned |
| 6 | Data D2–D3: import, transactional writes, exports and restore, including P3 step 2's SQL-only `accept` on the selected adapter | Selected provider (DEC-02) | Full equality report, no missing rejected records, `accept` conformance locally and in P2's provider suite, readback of all 28 recording registrations, restore proof | Planned |
| 7 | Application steps 2–4 with design DS3–DS4: bounded access, reader and audio on the approved system, agent access and curation | Selected provider; canonical query contract; DS2 | Surface parity, URL/fragment coverage, private/public policy, approved visual baselines, private preview checks | Planned |
| 8 | Platform P4: single activation coordinator, including data D4, application step 5 and design DS5 | Orders 0–7 and analysis AN6 | Freeze, final import, release checks, backup, one write path, end-to-end readback | Planned |
| 9 | Delete replaced paths and reconcile live docs | Verified activation | No live legacy imports/writers/deployer; all maintained docs describe shipped behavior | Planned |
| Parallel | Platform P3 steps 3–6: Effect audio orchestration, off the activation path under DEC-09 | Order 6's selected storage adapters; immutable artifact contract; canonical job inputs | Exact resume, interrupted-process recovery, QA and acceptance separation; required before the next GPU production run | Planned |
| Parallel | Analysis AN0–AN6: execute the ratified ontology v2 target with amendments, and build reader analytics | AN0: nothing. AN1–AN3: DEC-17's agent-session approval. AN2: AN0. AN3: AN2, DEC-16's AGENTS.md amendment, and P1 for the classifier adapter. AN4: AN3 and DEC-17's Decisions budget. AN5: AN4. AN6: AN1, AN5 and any DEC-19 voice changes; before P4's final import | Ratified catalog count and approved copy; calibration agreement and per-concept precision; O1–O4; accepted run receipt; C1–C6 | Planned |

Orders 2–4 can overlap once P1 lands, and orders 6 and 7 can overlap after their
contracts are integrated. They cannot activate independently against competing
canonical stores. P3 steps 1–2 define the audio schemas that data D2 imports; their
`accept` operation is implemented on the selected adapter in order 6, where its real-provider
case joins P2's provider suite and all 28 registrations are read back, so P2's order 5 probe
does not depend on it. P3 steps 3–6 run beside orders 7–9 and gate only the next GPU
production run. The analysis lane runs beside everything; only its hard cut (AN6)
gates activation, so that the vNext ontology is never activated in SQL. P4 depends on private
preview acceptance, not on its own eventual production switch. Data D4, application
step 5 and design DS5 execute within P4. The design system's new features, such as
read-along, per-line Play from here and English search, never block activation.
Deletion is part of each replacement's completion and the final release; it is not an
indefinite cleanup backlog. The detailed lane headings remain the source for execution steps.

The corpus job manifest remains the answer to “what corpus work is open.”
This table tracks the software cutover only; it does not create a second corpus
dispatch system or manufacture completeness jobs for architecture work.

## Working-tree and command contract

At planning time, `.gitignore`, `package.json`, and `bun.lock` were already
modified; `packages/demo/` and `output/` were untracked, and the same paths were
dirty during the 2026-10-26 revision. None is owned by this planning pass. Inspect their current state before implementation and preserve
unrelated work. A commit-only drift check misses these changes.

Existing commands, verified in the repository manifests and CI driver:

```sh
git status --short
git diff --stat 8a5e4c2..HEAD -- packages scripts docs release .github
bun run harness job list
bun run ci
```

`job list` reports corpus jobs; do not rewrite its manifest for this cutover.
`bun run ci` is the required implementation gate: lint, tests, typecheck,
validation, and a disposable build. Each lane labels new scripts as **proposed**;
those commands must be implemented before anyone claims to have run them.
Use `codex/` branches for implementation. Commit/push policy remains governed
by repository instructions and the scope authorized for that implementation.

## Release stop and recovery rules

Do not activate while source identity, imported counts, atomic receipts, public
visibility, backup restoration, or cost evidence is missing. A model's
confidence, a passing fake adapter, and a Worker bundle are not deployment proof.

Freeze all old writers before final import. Keep them frozen after switching.
Recovery must address the database schema, corpus revision, object manifest,
and executable release together. Reverting only the Worker cannot restore a
database contract. After any new canonical writes, preserve those writes and
their receipts before considering restoration; do not overwrite them with a
pre-cutover snapshot. The platform plan specifies the recovery drill.

No authority change, paid generation, provisioning, publication, commit, or push
is performed by writing these plans.

## Planning verification

The planning pass checks local links, existing-path references, Markdown fences,
whitespace, cross-plan dependencies, and the distinction between current and
proposed commands. An independent reader reviews the combined plans. Execution
test results are intentionally absent until the implementation runs.

Checked on 2026-10-09: all five documents passed local-link, fence-balance, and
whitespace checks. The integrating agent independently reproduced the data plan's
lane/status and ontology counts from the canonical parsers. Cold review found
and resolved an activation dependency cycle, ambiguous audio-schema ownership,
and a missing multi-query consistency contract; the bounded recheck passed.
New Effect suite commands use Vitest, with Bun retained for existing suites.
No application code changed, so full implementation CI was not rerun. No corpus
record or acceptance status changed, and no deployment or paid work ran.

Checked on 2026-10-27, closing the 2026-10-26 revision that added the design system,
the decision register and the cross-plan reconciliations. All six documents passed a
scratch checker for relative links and heading anchors, plus fence-balance and
trailing-whitespace checks. Every backticked path naming an existing file resolves;
the rest are labelled new or proposed, are described as absent (`wiki/apparatus/`,
`audio/qa/`), or name upstream rat-stack files. The design system's ontology counts
(483 axes by dimension, 64 concept keys repeated across axes, 144 concepts without
memberships) and its completeness, renderer-timing and screenplay references were
recomputed from the repository. `bun run validate` exited 0 and changed no tracked
file. No application code, corpus record, release file or acceptance status changed,
and no deployment, paid work, commit or push ran.

Independently reviewed on 2026-10-27. A cold review of all six documents found 19 problems, among
them a provider choice that ignored interleaved-commit reads, D1-only wording in provider-neutral
steps, DEC-01's timing, an order cycle around `accept`, undefined ports, stale counts, unlabelled
proposed paths, and gaps in the design system's timing, transliteration, contrast and ID-guard
rules. All 19 were fixed. The same reviewer's recheck found three only partly fixed and two
contradictions introduced by the design-system update to artifact version 6; after those fixes
its final recheck passed. Its three optional wording points (the generator's missing offsets,
line actions on desktop, tablet widths) were applied afterwards, and the open line-to-entry key
became DEC-15. The scratch checker then reported 0 link, anchor, fence or whitespace problems;
the only new absent path, `packages/database/test/corpus-read.test.ts`, is labelled proposed.
`bun run validate` exited 0 and changed no tracked file. Cloudflare D1 stays conditional on
proving atomic writes against the real service (data D1b, platform P2). No application code,
corpus record, release file or acceptance status changed, and no deployment, paid work, commit or
push ran.

Analysis lane, checked and independently reviewed on 2026-10-27. The integrating agent recomputed
the plan's counts from the ledgers at `8a5e4c2`, the v2.0.0 commit `8a13190` and the accepted audit
package. A cold review of the rewritten plan and its sibling-document touchpoints found 21 problems
and four mismatches in the design system:

- The high-severity problem was the audit freeze. The accepted package's live digest covers
  `wiki/review/` and ten other `wiki/` directories, not `derived/plato/`, so every interim receipt
  must stay in scratch until AN6.
- Medium problems included voice changes that needed declaring as amendment A4, membership evidence
  for adjudicated memberships, governance that landed after the code it permits, a false
  co-occurrence claim and a circular calibration set.

All 21 were fixed. The design session relayed its own data findings, which led to measuring Who
speaks in Greek letters, a 10% unattributed cut, a frames table, an extended assent lexicon and a
scene-level Role rule. It reproduced the Role figures independently. The reviewer's recheck confirmed
every figure, including readiness for 20 dialogues (Who speaks) and 22 (Role). It found one new medium
problem, agent sessions running before their approval, and ten low ones; DEC-17's two approvals and
the text fixes resolved them.

The design-system mismatches were relayed to that plan's owner. The scratch checker reported 0 link,
anchor, fence or whitespace problems, and every backticked path that does not exist is labelled new
or proposed. `bun run validate` exited 0 and changed no tracked file. No corpus record, ontology
file, review status or recording changed, and no paid call, commit or push ran.
