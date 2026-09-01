# Commentary Protocol

> Scope note: this document governs the authored commentary lane only. It is
> deliberately NOT harness-facing and is not listed in the validator's
> banned-phrase scan (`scanForBannedInstructionText()` covers prompt and skill
> files that agents load during extraction runs; no extraction agent ever
> reads this file or the commentary it governs). The scan's banned phrases are
> still avoided here as a hygiene habit.

This is the lane contract for `wiki/commentary/` — the repository's first
explicitly interpretive artifact tree. It is the counterpart to
`docs/plato-wiki-extraction-protocol.md`, which governs the neutral layers.
The neutral layers record what the text does; commentary teaches a reader how
to read the text with those layers at hand.

## Codex execution pin

The commentary campaign is pinned to `codex-cli 0.147.0` and the single-model
catalog at `packages/harness/src/commentary-luna-model-catalog.json`, which
contains a schema-compatible, campaign-specific `gpt-5.6-luna` entry pinned
for that CLI line. Each job
records the catalog path and SHA-256 in its manifest, input provenance, and
state; changing either the catalog or CLI version makes existing artifacts
stale. Campaign invocations pass the catalog by absolute `model_catalog_json`
config and use tool-less structured inference with user config, project docs,
environment/permission scaffolding, and collaboration/app/skill injection
disabled. The hash-bound task packet carries the quality evidence directly, so
the worker does not pay for an unrelated coding-agent context or discovery turn.

## What commentary is

Authored teaching material, per dialogue, in reading order. Each dialogue
with commentary has one ledger, `wiki/commentary/<dialogue>.md`, holding
typed blocks anchored to Stephanus spans of the Greek source. A static
reading view renders the source text as a spine (Greek beside the imported
English rendering) with the blocks interleaved at their anchors, each carrying
an "authored teaching material" badge, its `author` value, and its review
status.

## What commentary may do

- Explain what a stretch of text is and where it sits in the dialogue.
- Give dramatic or historical context.
- Say what an argument is doing at a span.
- Direct attention to details worth noticing.
- Pose questions to the reader without answering them.
- Cross-reference other spans, dialogues, and accepted records.
- Interpret — as the author's teaching commentary, presented as such.

## What commentary must do

- **Anchor every block.** Every block carries a `stephanus_span` and a
  `source_ref` that the validator recomputes byte-for-byte against
  `raw/plato/greek/` via the span machinery. A block that cannot be anchored
  cannot be written.
- **Cite accepted records for checkable assertions.** Any assertion a reader
  could check against the wiki's layers cites the supporting observation,
  claim, relation, or dossier ids in `cites`. The validator enforces that
  cited ids exist and are `accepted`. Cross-dialogue citation is allowed and
  encouraged.
- **Mark interpretation as the author's.** Interpretation may synthesize the
  printed source and cited accepted records, but attribution is not evidence.
  Phrases such as "one way to read this" cannot introduce unsupported
  historical, biographical, chronological, comparative, motive,
  dialogue-global, or forward-looking facts. If the printed source and accepted
  records do not support a checkable assertion, omit it.

## What commentary must not do

- Assert hidden meaning as a property of the text. The neutral-vocabulary
  rule of `docs/completion-target.md` governs every artifact outside this
  lane exactly as before; inside the lane, interpretation is voiced, not
  recorded.
- Leak into the neutral layers. Nothing under `wiki/observations/`,
  `wiki/claims/`, `wiki/relations/`, `wiki/ontology/`, `wiki/dossiers/`, or
  `wiki/clusters/` may be created, modified, or renamed on behalf of commentary
  work.
- Be read by the neutral pipelines. Citations run one way: commentary cites
  accepted records by id; no extraction, review, claims, or relations prompt,
  no skill under `.pi/`, and no derived-data generator ever opens
  `wiki/commentary/`. Only the validator, the briefs command, and the site
  generator read it.
- Duplicate the source text. The spine shows the text; the validator rejects
  any contiguous Greek run longer than 80 characters in a block.

## The listening-quality bar

Commentary is written to be heard between stretches of dialogue, not merely to
be correct on a page. A valid block can still be rejected when it is dull,
redundant, overpacked, or awkward aloud. Every non-section block must earn the
interruption it creates.

- **Do one job.** A block should orient the scene, expose one argumentative
  move, sharpen one dramatic detail, make one useful comparison, or pose one
  live question. It should not try to inventory the whole anchored passage.
- **Add value beyond recap.** The listener has just heard, or is about to hear,
  the source. Retell only what is needed to make a structure, tension, reversal,
  or consequence clearer. A plot summary with citations is not yet commentary.
- **Write for breath and cadence.** Prefer concrete sentences that can be
  spoken once and understood once. Break up stacked clauses, catalogues, and
  citation-shaped prose. Read every candidate aloud during review.
- **Avoid a house voice.** Repeated openings such as "notice," "watch," "keep
  in mind," and "ask yourself" are not a substitute for an actual point. Use
  them sparingly, never as a unit-by-unit template.
- **Preserve uncertainty.** A question should create a real problem for the
  listener, not cue a predetermined classroom answer. Interpretation should
  distinguish what the passage establishes from what the commentator is
  proposing.
- **Respect silence.** Not every marker or accepted record needs a commentary
  block. A unit with no worthwhile interruption should remain uninterrupted.

As a default drafting target, section bodies are 25–70 spoken words and
non-section blocks are 45–130 spoken words. These are quality heuristics, not
validator loopholes: a shorter block may still be empty, and a longer one needs
a recorded editorial reason. A unit normally needs no more than three
non-section interruptions. More than four requires the independent auditor to
justify why the dialogue is better heard with each one retained.

The independent audit records three explicit checks for every block: evidence,
placement, and listening quality. Audit output schema version 3 requires every
placement check to carry `hazard_codes`. The placement verdict is `fail` if and
only if that array is non-empty; a placement pass must carry an empty array.
The three checks are independent: a pass in one dimension never implies a pass
in another, and the auditor must continue after finding the first defect. For
the evidence check it inventories every checkable assertion internally and
compares the assertion's actor, object, scope, modality, quantifier, and time
against the exact source and accepted evidence. Titles and bodies are read
together when resolving a phrase's grammatical referent; a nearby cited author
cannot silently replace that referent. Temporal words such as "enters,"
"begins," "immediately," "then," and "already" are checkable claims about
when an event occurs, not stylistic connective tissue.
A coherent paragraph does not pass when one sentence silently broadens a
conditional doubt, changes the object of doubt, or turns a local claim into an
existence claim. After that evidence pass it judges spoken clarity, dramatic
flow, and cross-block effects. The placement check uses the exact English
playback edge resolved by the same deterministic function as screenplay
generation. Default section, `before`, and `after` placement can snap to a
source-turn boundary, while an explicit `audio_insertion` binds a reviewed
turn edge. Raw Greek and English marker boundaries are not placement
authority. The brief prints bounded English text heard immediately before and
after each resolved edge, the requested anchor edge, and the signed character
shift from that anchor to production playback. A syntactically complete edge
still fails placement when turn snapping carries the commentary into a later
or earlier exchange or topic where it no longer explains or prepares what is
heard. A block also fails when it
splits a sentence or clause, separates a question from its immediate answer,
or separates a prompt from its direct reply, even when the commentary prose is
otherwise accurate. Because the rewrite lane preserves anchors and placement,
an unsafe edge requires `remove`, not `rewrite`; structural re-anchoring is a
separate remediation.

After the per-block checks, the auditor performs one final cross-block pass for
repetition, contradiction, accumulated interruptions, and dramatic-flow
damage. Each block receives exactly one disposition: `pass`, `rewrite`,
`remove`, or `split`. A pass requires all three checks to pass and carries no
issue codes; every non-pass has at least one failed check and a matching issue
code. The unit passes exactly when every block passes. The output carries one
complete summary rationale per block, not separate rationales for the three
machine-readable checks. That summary must state the concrete basis for every
failure, and for a placement decision must identify what is heard immediately
before and after the exact playback edge. Keep it at or below 180 characters so
it ends naturally inside the schema's 240-character hard limit.

The closed placement-hazard code set is:

- `sentence_or_clause_split`: the production edge interrupts a sentence or clause;
- `question_answer_split`: the edge separates a question from its immediate answer;
- `prompt_reply_split`: the edge separates another prompt from its direct reply;
- `semantic_anchor_displacement`: snapping moves the block into a different exchange or topic from its anchor;
- `other_dramatic_flow_damage`: a concrete placement defect not described by the four more specific codes.

Use the specific code whenever it applies. A question followed immediately by
its answer requires `question_answer_split`. The Charmides control whose
playback edge snaps `+1352` characters from the doctor exchange into the later
Delphic exposition requires `semantic_anchor_displacement`. Neither can pass
placement merely because the snapped edge is a complete sentence boundary.
Every non-empty placement hazard array requires the block-level issue code
`interrupts_dramatic_flow` and, because prose-only rewriting preserves the
edge, disposition `remove`.

The audit uses this closed issue-code set for substantive failures:

- `source_recap`: source recap without added explanatory value;
- `source_misreading`: commentary that misconstrues what the exact source passage says or does;
- `generic_or_reusable`: generic prose that could fit another dialogue;
- `multiple_jobs`: more than one separable argumentative or dramatic job packed into the block, such that one must be split off or removed; steps, examples, or contrasts in one continuous argument are not multiple jobs;
- `certainty_exceeds_evidence`: an assertion whose certainty exceeds its cited evidence;
- `unsupported_or_miscited_claim`: a checkable assertion with no matching accepted evidence, or whose cited accepted record does not support it;
- `repetitive_throat_clearing`: repetitive diction or pedagogical throat-clearing;
- `redundant_within_unit`: two blocks in one unit perform substantially the same explanatory job, even when their diction differs;
- `hard_to_follow_aloud`: a sentence structure that is hard to follow in one hearing;
- `interrupts_dramatic_flow`: an interruption whose benefit does not outweigh the loss of dramatic flow;
- `excessive_unit_interruptions`: more than four unit interruptions without a specific case that each one improves the listening experience.

Acceptance is not inherited from Symposium. Its accepted ledger is the first
complete implementation and a required audit input, not an untouchable style
template. Plan 056 must audit Symposium and the rewritten Crito before their
prose becomes the production standard for the remaining dialogues.

The English text under `raw/plato/english/` is a rendering source for the
reading view and the authors' briefs only. It is never an extraction input
(AGENTS.md records the rule).

## Block kinds

| kind | semantics |
| --- | --- |
| `section` | names a teaching unit and its span; carries the unit `title` |
| `context` | dramatic or historical setup for the anchored span |
| `argument` | what the argument is doing at the span |
| `notice` | a close-reading pointer |
| `crossref` | points at other spans or records (requires a crossrefs entry or a non-empty cites list) |
| `question` | posed to the reader and not answered |

## The record contract

One fenced `yaml` block per commentary block, mirroring the claim-ledger file
shape:

```yaml
commentary_id: comm_symposium_0001
source_work: Symposium
block_kind: section
placement: before
title: "The frame: Apollodorus retells a retelling"
stephanus_span: 172a-178a
source_ref:
  source_path: raw/plato/greek/symposium.txt
  stephanus_span: 172a-178a
  start_marker: 172a
  end_marker: 178a
  start_char: 5
  end_char: 12345
  text_sha256: "…"
body: "One or more sentences of teaching prose."
cites:
  observations: []
  claims: []
  relations: []
  dossiers: []
crossrefs: []
author: model
review_status: unreviewed
```

Field rules (the validator enforces every one):

- `commentary_id`: `comm_<slug>_NNNN`, 4-digit, strictly sequential in FILE
  order starting 0001. Numbering is append-only: new blocks take the next id
  at the end of the file regardless of anchor position; ids are
  permalink-stable and never renumbered. Reading order is COMPUTED, not file
  order: sort by (`source_ref.start_char`, placement `before` < `after`, id).
- `source_work`: must match the ledger slug.
- `block_kind`: one of the six kinds above.
- `placement`: `before | after` relative to the anchored spine text;
  `section` blocks must be `before`.
- `title`: required non-empty for `section`; absent or empty otherwise.
- `stephanus_span` + `source_ref`: required on every block; recomputed and
  rejected on any field mismatch. Section spans must be strictly ascending
  and non-overlapping in (start_char, end_char); every non-section block must
  anchor inside some section's span.
- `body`: required non-empty English teaching prose, plain text. Short
  inline Greek is allowed; contiguous Greek runs over 80 chars are rejected.
- `cites`: listed ids must exist in the corresponding ledgers with
  `review_status: accepted`; `dossiers` entries are
  `<axis_key>/<concept_key>` paths that must resolve to an existing ontology
  vNext JSON dossier projection. Legacy family/label paths are not aliases.
- `crossrefs`: each entry names a canonical dialogue, a span, and a
  `source_ref` recomputed against THAT dialogue. `crossref` blocks must carry
  at least one crossrefs entry or one non-empty cites list.
- `author`: `operator | model` — who drafted the body, set once at drafting.
  Operator edits during review do not flip it; acceptance is recorded by
  `review_status` and provenance, not by this field.
- `review_status`: `unreviewed | accepted | rejected | needs_split`.

## Review and provenance

Commentary ledgers join the same review-provenance enforcement as
observations, claims, and relations: a `review_status` change that is not yet
committed requires, in the same commit, an appended `wiki/ingest-log.md`
entry and an added or modified note under `wiki/review/` recording the audit
sample, the acceptance rationale, and the operator's decision. The reading
view renders `accepted` and `unreviewed` blocks; `rejected` and `needs_split`
blocks stay in the ledger but are not rendered.

## Workflow

### Stage one: Symposium (completed)

Authoring happens in an operator-supervised session editing the ledger
directly, validated by `bun run validate` — not through harness LLM runs; no
run command, prompt file, or agent-visible tool belongs to this lane.

1. **Unit skeleton** — draft the `section` blocks; the operator approves the
   unit boundaries.
2. **Briefs** — `bun run harness commentary briefs <dialogue>` writes one
   working brief per unit under `scratch/commentary/briefs/<dialogue>/`
   (regenerable; never committed) containing the Greek and English spine and
   the accepted records overlapping the unit.
3. **Writing pass** — unit by unit, write the non-section blocks from the
   brief; every checkable assertion cites record ids.
4. **Review** — the operator hand-audits a sample, edits/rejects/accepts,
   flips `review_status`, and commits the provenance pair (ingest-log entry +
   review note) in the same commit.

### Stage two: corpus rollout (plan 056)

The operator authorized all 27 canonical dialogues on 2026-07-12. The corpus
workflow keeps authoring outside Pi harness runs but makes the executor session
reproducible and safe for parallel drafting:

```bash
codex exec --model gpt-5.6-luna --sandbox read-only --ephemeral \
  --json --output-schema <schema-path> "<unit prompt>"
```

No alternate executable, alias, or fallback provider is part of this campaign.
The explicit command above fixes the Luna model and read-only execution mode.

1. **Unit skeleton** — add only validated `section` blocks. Sections are
   strictly ascending and non-overlapping; the operator approves the dialogue
   or wave boundaries before prose drafting.
2. **Briefs** — run `bun run harness commentary briefs <dialogue>` and record
   the generated brief paths.
3. **Isolated Luna drafts** — one Codex GPT-5.6 Luna medium-effort subagent reads
   exactly one unit brief plus this protocol. It returns structured candidate
   blocks under a unique unit key in
   `scratch/commentary/drafts/<dialogue>/`; it must not edit the canonical
   ledger or assign ids/source refs/review statuses.
4. **Serial lead merge** — the lead checks every anchor and citation, rejects
   weak/redundant prose, assigns append-only ids and exact source refs, sets
   `author: model` and `review_status: unreviewed`, and merges one unit at a
   time. Run `bun run validate` after every unit.
5. **Independent audit** — once a ledger has non-section prose, or once a
   section-only ledger is accepted, the campaign creates one content-addressed
   audit brief and one fresh Luna medium-effort job for every section. Across
   those unit jobs every commentary id in the ledger is assessed exactly once.
   The audit brief contains the exact Greek and English section and, for every
   block, the production-resolved English playback edge with up to 400
   characters heard on each side. It includes every accepted record actually
   cited by the audited blocks. Uncited local records are deliberately withheld:
   the record contract already makes a checkable assertion without a cited
   accepted record a failure, while injecting every overlapping record spends
   context without curing the missing citation. After such a failure, the
   rewrite lane may retrieve a bounded source-overlap supplement so replacement
   prose can cite an exact accepted record rather than inventing one.
   A unit passes only when every contained block passes. Any rewrite, remove,
   or split disposition fails the unit and keeps the dialogue's quality audit
   open; it does not silently rewrite prose or erase the ledger's existing
   review status.
6. **Review and provenance** — the operator-delegated Luna reviewer audits the
   required sample, records the rationale and decision, and commits the
   ingest-log entry and review note in the same commit. The receipt names the
   exact Luna model; it must not claim human listening or review.

Parallelism ends at draft production. Concurrent agents never append to or
renumber one canonical commentary ledger.

### Reproducible Luna campaign runner

The corpus campaign is planned and dispatched by
`scripts/commentary/commentary-campaign.ts`. Its default is always a dry run. A
manifest embeds every prompt, input-file hash, output-schema hash, exact Luna
argument vector, isolated output path, and serial handoff command:

```bash
bun scripts/commentary/commentary-campaign.ts manifest
bun scripts/commentary/commentary-campaign.ts run
bun scripts/commentary/commentary-campaign.ts manifest --stage audit
```

Both commands are read-only. Every planned Luna invocation includes the
locked arguments explicitly:

```bash
codex exec --model gpt-5.6-luna --sandbox read-only --ephemeral \
  --json --output-schema <stage-schema-path> "<stage prompt>"
```

Live dispatch requires `--execute`. Before creating an output directory or
invoking a paid model job, the runner first builds the complete read-only
preflight report. Missing work is eligible for dispatch; stale, malformed, or
mechanically invalid listener prose blocks the entire selected batch before
version, authentication, or provider calls. The live path then executes
`codex login status` and requires a logged-in status. Authenticate with the
Codex CLI when necessary:

```bash
codex login status
bun scripts/commentary/commentary-campaign.ts preflight --stage audit
bun scripts/commentary/commentary-campaign.ts run --execute --stage outline --concurrency 2 --max-new-jobs 2
bun scripts/commentary/commentary-campaign.ts run --execute --stage audit --dialogue symposium --concurrency 2 --max-new-jobs 2
bun scripts/commentary/commentary-campaign.ts usage --stage audit
```

Concurrency is limited to 1–40 and applies only to isolated outline, draft,
audit, or rewrite JSON jobs. It changes wall-clock parallelism only: it does
not reduce the selected job set or expected token budget. Use
`--max-new-jobs <n>` to cap the number of new paid calls in a run, and use the
read-only `usage` command to aggregate exact recorded token usage. Outline
Any live selection containing more than one missing job must state this finite
cap explicitly. For a bounded audit batch, repeat `--unit-key`; this exact-unit
mode requires one explicit dialogue and `--stage audit`:

```bash
bun scripts/commentary/commentary-campaign.ts preflight --dialogue <dialogue> --stage audit \
  --unit-key <unit-key-1> --unit-key <unit-key-2>
bun scripts/commentary/commentary-campaign.ts run --execute --dialogue <dialogue> --stage audit \
  --unit-key <unit-key-1> --unit-key <unit-key-2> \
  --max-new-jobs 2 --concurrency 2
```

Unit keys are dialogue-local; the CLI refuses repeatable selection without that
explicit dialogue/stage boundary. `--max-new-jobs` is a paid-call-count ceiling,
not a currency or token-price claim. Outline
outputs are content-addressed under
`scratch/commentary/outlines/<dialogue>/`; unit outputs use one unique file per
brief under `scratch/commentary/drafts/<dialogue>/`; quality-audit outputs use
`scratch/commentary/audits/<dialogue>/<unit-key>.json`; rewrite candidates use
`scratch/commentary/rewrites/<dialogue>/<unit-key>.json`. A completed job
resumes only when its schema version, complete input hash, output-schema hash,
model, effort, permission mode, output path, and output hash all match. Normal
runs refuse partial or stale state rather than overwriting evidence.

The read-only `preflight` command classifies every selected job as current,
missing, stale, malformed, mechanically failed, or semantically failed without
calling the provider. To retry a stale, malformed, or partial artifact, preview
the archive operation and then make it explicit:

```bash
bun scripts/commentary/commentary-campaign.ts retry <dialogue> outline
bun scripts/commentary/commentary-campaign.ts retry <dialogue> outline --execute
bun scripts/commentary/commentary-campaign.ts retry <dialogue> <draft|audit|rewrite> <unit-key>
bun scripts/commentary/commentary-campaign.ts retry <dialogue> <draft|audit|rewrite> <unit-key> --execute
bun scripts/commentary/commentary-campaign.ts retry <dialogue> audit <unit-key-1> <unit-key-2> --execute
```

Only `retry --execute` holds the repository write lock and moves whichever
members of the pair exist into the content-addressed
`scratch/commentary/campaign-history/<dialogue>/` history, and prints the
bounded rerun command. Retry execution is archive-only: it never performs a
paid model call, so dispatch remains a separate explicit `run --execute` step.
It never deletes or overwrites the earlier result. A
passing audit or a structurally current semantic failure cannot be retried.
Semantic failures advance to the bound rewrite and independent adjudication
path; unchanged prose is never re-audited merely to seek a passing verdict.

Audit briefs are deterministic projections of the current canonical ledger.
Each binds one section, every non-section block whose exact source span is
contained by it, the exact Greek and English source text for those spans, the
full accepted records and dossiers actually cited by the blocks, and the exact
hash of this protocol. Exact unit source is included once; per-block anchors
refer back to that source instead of duplicating overlapping Greek and English
passages. The live packet includes the quality-bearing protocol excerpt rather
than unrelated workflow and CLI documentation, while retaining the full
protocol hash in provenance. Manifest construction embeds the brief hash, exhaustive
commentary-id list, and hashes of every canonical input without writing
anything. Live execution materializes the exact brief under
`scratch/commentary/audit-briefs/<dialogue>/` and any bounded rewrite-evidence
supplement under `scratch/commentary/rewrite-evidence/<dialogue>/` only after
the authentication preflight passes. For human inspection, the same
deterministic audit-brief bytes can be materialized explicitly:

```bash
bun run harness commentary audit-briefs symposium
```

The audit is one exhaustive structured semantic review. Assess every bound
block independently across evidence, placement, and listening quality and
continue after the first defect. Then compare the blocks across the whole unit
for repetition, contradiction, accumulated interruptions, and damage to
dramatic flow. Report every finding from both the per-block and cross-block
passes in the same output; do not rerun unchanged
prose to get a greener result.
The schema-v3 audit JSON is findings only. It records a `pass | fail` unit verdict and,
for every bound `commentary_id`, one `pass | rewrite | remove | split`
disposition, explicit evidence/placement/listening verdicts with concise
rationales, closed issue codes, and a concise summary. A block passes only when
all three checks pass. Every failed check must have a matching issue code and
every issue code must correspond to a failed check. Its schema permits no
replacement prose or review-status field, and there is deliberately no audit
apply command.

For an accepted ledger whose exact current audit assigns `rewrite`, the campaign exposes a
separate Luna high-effort rewrite job. It reads the bound audit brief and audit output,
then returns exactly one replacement candidate for every rewrite commentary id.
`remove` and `split` are structural outcomes and never enter the prose-only
rewrite lane:

```bash
bun scripts/commentary/commentary-campaign.ts run --execute --dialogue <dialogue> --stage rewrite --concurrency 2 --max-new-jobs 4
bun scripts/commentary/commentary-campaign.ts rewrite-preview <dialogue> <rewrite-json>
bun scripts/commentary/commentary-campaign.ts rewrite-apply <dialogue> <rewrite-json>
```

The structured candidate may revise only `title`, `body`, `cites`, and
`crossrefs`; import preserves each block's id, kind, placement, source span,
and source anchor. A rewrite makes the smallest sufficient correction: it
preserves source-grounded material and accepted citations not implicated by
the audit instead of replacing one faulty phrase with a wholesale reframe.
When a rationale isolates a quoted phrase, the rewrite changes that phrase and
otherwise preserves the current title, body, citations, and cross-references.
It must not clear citations to evade an evidence failure or infer conversational
actions merely from speaker sigla. Preview is read-only. Apply is serial under the repository
write lock and resets changed blocks to `unreviewed`; it never accepts the new
prose. After a rewrite apply, the operator must reaccept changed blocks through
the tracked submission record. Direct edits to `review_status` or direct ledger
edits to accept rewritten prose are invalid. The required post-rewrite path is:

```bash
bun run harness commentary rewrite-review-preview <dialogue> <submission-path> \
  --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> \
  --reviewed-ids <id,id,...>
bun run harness commentary rewrite-review-apply <dialogue> <submission-path> \
  --reviewer <id> --reviewed-on <YYYY-MM-DD> --rationale <text> \
  --reviewed-ids <id,id,...>
```

Acceptance binds the canonical submission record, its before/after hashes, the
post-rewrite ledger hash, and every reviewed id. It changes only those exact
blocks from `unreviewed` to `accepted` and writes a receipt under `wiki/review/`;
run `bun run validate` afterward. Even when an audit recommends removal or
splitting, this bounded stage supplies one replacement instead of deleting,
renumbering, splitting, or merging canonical blocks; the operator can reject
that candidate and handle the structural decision separately.

Completed scratch findings are not a production-writing gate. Only an accepted
canonical manifest at `wiki/commentary-audits/<dialogue>.json` can close the
quality audit. The manifest binds the exact commentary-ledger and protocol
hashes, every deterministic audit-brief hash, and the complete normalized
Luna output for every section with its output hash. Validation requires
all units and every commentary id exactly once, in canonical order, with only
`pass` dispositions.

The deterministic handoff is preview-only:

```bash
bun run harness commentary audit-manifest-preview <dialogue>
```

It requires complete non-stale campaign output/state pairs and writes a
`pending` candidate only to
`scratch/commentary/audit-manifests/<dialogue>.json`. It never accepts the
candidate, writes `wiki/commentary-audits/`, or changes the commentary ledger.
The operator delegates an independent Luna reviewer to sample at least 15
distinct blocks in ledger order, or every block when the ledger has fewer than
15. Record the dialogue, accepted decision, delegated Luna reviewer,
`YYYY-MM-DD` date, rationale, independent Luna sample basis, explicit
`human_listening_or_review: none claimed` statement, and each sampled
commentary id in a committed `wiki/review/*.md` note; bind that note's exact
path and hash; then deliberately place the reviewed manifest at the canonical
path. Pending manifests keep the reviewer/date/rationale and note null and the
sample empty.
`bun run validate` rejects weak or unordered samples, stale note/ledger/protocol
hashes, failed units, and partial or duplicated id coverage.

Campaign workers never edit `wiki/commentary/`. Outline, unit-draft, and rewrite
results cross that boundary only through explicit serial commands:

```bash
bun scripts/commentary/commentary-campaign.ts outline-preview <dialogue> <outline-json>
bun scripts/commentary/commentary-campaign.ts outline-apply <dialogue> <outline-json>
bun run harness commentary briefs <dialogue>

bun run harness commentary draft-preview <dialogue> <draft-json>
bun run harness commentary draft-apply <dialogue> <draft-json>
bun run validate

bun scripts/commentary/commentary-campaign.ts rewrite-preview <dialogue> <rewrite-json>
bun scripts/commentary/commentary-campaign.ts rewrite-apply <dialogue> <rewrite-json>
# record review provenance, then:
bun run validate
```

`outline-apply` runs repository validation itself. Unit drafts retain the
existing preview/apply importer contract; the lead applies exactly one and
runs `bun run validate` before considering the next. Rewrite import uses the
same serial boundary but requires provenance before validation. No campaign
worker can perform any merge.

The deterministic coverage report is JSON and can be refreshed without a
writing invocation:

```bash
bun scripts/commentary/commentary-campaign.ts status --write
```

It is written to `scratch/commentary/campaign-status.json` and distinguishes
accepted ledgers, approved skeletons with generated briefs, pending outlines,
completed isolated jobs, stale artifacts, and authentication blocks across the
27-dialogue corpus. Ledger acceptance, scratch audit status, and canonical
operator-delegated Luna sample acceptance are separate:
an accepted ledger remains accepted while its quality audit reports
`pending`, `completed`, or `failed`. Symposium therefore remains accepted but
quality-audit pending until all ten section audits return passing unit verdicts.
Even then it is not production-ready writing until the required independent Luna
sample and review note explicitly stating that no human listening or review is
claimed are committed in an accepted canonical quality-audit manifest.
