# Plato Observation Wiki Specification

## Purpose

Build a persistent Plato observation wiki that compiles checkable textual
records from Greek Plato texts. The system should make larger literary and
philosophical patterns easier to audit later, but the extraction pass itself
must not produce interpretations, hidden-doctrine claims, or school-specific
readings.

The central unit is an observation record: a bounded claim about what the Greek
text does at a cited Stephanus span.

## Goals

- Ingest Plato dialogues one at a time from canonical Greek text files.
- Produce structured observation ledgers that can be checked against source
  offsets, Stephanus markers, and source hashes.
- Maintain an accumulating feature registry without letting each run invent an
  unstable schema.
- Support multiple model providers through named profiles.
- Keep transcript, usage, and tool events as ignored local diagnostics; they
  are not canonical review-decision provenance.
- Let deterministic code own mechanical derivation and integrity checks while
  agents own source-backed semantic decisions.
- Enable later comparison across dialogues without smuggling synthesis into the
  observation layer.

## Non-Goals

- Do not ask an agent to find hidden meanings.
- Do not ask an agent to generate hypotheses during ingest.
- Do not use secondary literature or external interpretive frameworks during
  Plato extraction.
- Do not treat English translations as authoritative extraction input.
- Do not create synthesis essays during ingest.
- Do not make the CLI the owner of domain logic.
- Do not reproduce semantic judgment through packet freezes, role-specific
  verdict schemas, response capture, adjudication frameworks, cohort
  manifests, or one-time materializers and writers.

## Repository Shape

```text
packages/
  harness/                  # agent runtime, generic tools, validation, transcripts
  cli/                      # command parsing and terminal output
raw/
  plato/
    greek/                  # canonical Greek text input
    translations/           # not used during extraction
derived/
  plato/                    # deterministic derived data, when implemented
wiki/
  observations/             # dialogue observation ledgers
  features-so-far.md        # feature registry
  label-audit.md            # generated label distribution audit
  label-consolidation/      # reviewed label merge maps
  clusters/                 # generated accepted-observation cluster artifacts
  ingest-log.md             # append-only run log
  review/                   # canonical review-decision receipts
  transcripts/              # ignored local audit artifacts
docs/
  plato-wiki-extraction-protocol.md
  label-normalization-standards.md
  harness-operations.md
  pi-agent-core-wiki-runner.md
.pi/
  skills/
  prompts/
```

## Runtime Components

`packages/harness` owns:

- provider/profile selection
- pi-agent-core harness construction
- project skill and prompt loading
- system prompt assembly
- tool definitions
- write-time validation
- transcript and usage recording
- deterministic synchronization of `wiki/features-so-far.md`

`packages/cli` owns:

- command parsing
- profile/model flags
- terminal output
- dispatch into harness functions

The CLI must stay thin. Domain behavior belongs in the harness, protocol,
skills, prompts, and validators.

## Corpus Curation Workflow

Semantic work uses one canonical path:

1. Bound a Greek source slice and the existing canonical records in scope.
2. Have an agent make source-backed decisions directly; use one independent
   semantic review when the task requires it.
3. Apply the accepted decisions to canonical ledgers through existing generic
   write tools or a direct, reviewable edit.
4. Record one concise receipt under `wiki/review/` containing affected IDs,
   source evidence, accepted dispositions, review outcome, and validation.
5. Run generic schema, reference, collision, conflict, derived-data, and corpus
   validation. Judge completion by the canonical corpus diff.

Temporary prompts, packet slices, reviewer responses, comparison notes, and
application scaffolds are disposable working state. They may live in an
ignored local directory while a review is active, but they are never a second
canonical representation and are not committed. Generic machinery is earned
only by a recurring operation shared across corpus slices.

## Provider Support

Provider profiles live in `harness.config.json`.

Required behavior:

- `defaultProfile` chooses the default provider.
- `--profile <name>` selects a configured profile.
- `--provider <provider> --model <model>` may override profile selection.
- API key lookup supports the profile's `apiKeyEnv` and pi-ai provider lookup.
- DeepSeek profiles are treated as first-class profiles.

The harness must record provider and model metadata in each transcript run.

## Commands

Required command surface:

```bash
bun run harness ingest <dialogue-slug> [--profile <name>]
bun run harness review <dialogue-slug> [--profile <name>]
bun run harness validate
bun run harness profiles
bun run harness providers
bun run harness models <provider>
bun run harness transcripts
bun run harness usage [run-id]
bun run harness labels audit [--write]
bun run harness labels plan <path>
bun run harness labels validate <path>
bun run harness labels apply <path> [--family <feature_family>]
bun run harness clusters [--write]
bun run harness coverage [--write] [dialogue-slug]
bun run harness site [--out-dir <path>]
```

`ingest` creates or rewrites a dialogue observation ledger and synchronizes the
feature registry through the observation write tool.

`review` checks an existing observation ledger and may update review statuses,
registry statuses, notes, merges, splits, or names.

`validate` verifies local prerequisites and wiki shape.

`labels audit` reports feature-label drift from observation ledgers.

`labels plan` writes a full merge-map skeleton from the current audit.
`labels validate` requires every label to have an explicit `keep` or `merge`
disposition under `docs/label-normalization-standards.md`. `labels apply`
performs a hard cutover of feature family, label, id, registry, and derived
artifacts only; it must not edit observation prose, source refs, Greek terms,
limits, or review status.

`clusters --write` regenerates deterministic accepted-observation cluster
artifacts. `coverage --write` regenerates the deterministic accepted-record
coverage gap report. `site` regenerates the read-only static browser.

## Canonical Text Input

Greek files under `raw/plato/greek/` are the citation source for observation
records. An observation must cite Greek through a deterministic `source_ref`
rather than by copying passages into the ledger.

Translations may exist for human reference but are not extraction input.

## Derived Data

Derived data should be generated from Greek text and stored under
`derived/plato/`. Derived data is allowed when it reduces model responsibility
for mechanical tasks.

Examples:

- speaker turns with Stephanus envelopes
- token and anchor indexes
- deterministic turn-length metrics
- assent-token counts
- particle counts
- dialogue metadata
- frame and closure skeletons

Derived data must remain auditable. Each record should point back to the Greek
file and character range, or to another deterministic derived record that does.

## Observation Record Contract

Observation ledgers are Markdown files with fenced YAML records.

Required shape:

```yaml
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6e
source_ref:
  source_path: raw/plato/greek/euthyphro.txt
  stephanus_span: 5d-6e
  start_marker: 5d
  end_marker: 6e
  start_char: 0
  end_char: 0
  text_sha256: ""
greek_terms: []
english_gloss: ""
feature_id: feature_candidate_001
feature_family: definition_ladder
feature_label: candidate_label_here
observation: ""
textual_basis: ""
limits: ""
review_status: unreviewed
```

Field rules:

- `observation_id`: stable local ID.
- `source_work`: dialogue or bounded dialogue segment.
- `stephanus_span`: bounded citation span.
- `source_ref`: copied unchanged from `wiki_source_span`.
- `greek_terms`: short Greek terms only.
- `english_gloss`: optional English review gloss.
- `feature_id`: harness-assigned.
- `feature_family`: seed family or normalized passthrough family.
- `feature_label`: narrow observable subtype.
- `observation`: one local textual claim.
- `textual_basis`: why the span supports the observation.
- `limits`: what the observation does not establish.
- `review_status`: `unreviewed`, `accepted`, `rejected`, or `needs_split`.

The model provides `feature_family` and `feature_label`. The harness normalizes
both and assigns `feature_id`.

## Feature Families

Seed families:

- `dramatic_case_setup`
- `turn_geometry`
- `prosopography`
- `elenchus`
- `definition_ladder`
- `myth_demarcation`
- `frame_depth`
- `craft_analogy`
- `forms_trajectory`
- `irony_marker`
- `closure_type`

If no seed family fits, the agent may provide a narrow lowercase snake_case
passthrough family. Passthrough families are not errors. They are schema holes
to audit after more dialogues have been ingested.

Feature labels are scoped inside feature families. The same label may be valid
under two different families if it names a narrower subtype in different
observation types.

## Feature Registry Contract

`wiki/features-so-far.md` records feature candidates. The harness updates it
during ingest from accepted observation writes.

Registry entries should include:

```markdown
### feature_candidate_001
- **family:** definition_ladder
- **proposed_name:** definition_revised_after_objection
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** Review notes pending.
```

Allowed statuses:

- `candidate`
- `accepted`
- `rejected`
- `needs_split`

During ingest:

- add new candidates
- add observation IDs to existing candidates
- do not rename existing candidates
- do not remove candidates
- do not change statuses or review notes

During review:

- accept, reject, split, merge, or rename candidates
- mark observations as accepted, rejected, or needing split
- document unresolved issues in notes

## Harness Tools

Required tools:

- `wiki_source_span`: resolve a dialogue and Stephanus span to source metadata
  and a temporary excerpt.
- `wiki_read_file`: read allowed Greek and wiki files.
- `wiki_stage_observation`: ingest-only validation of draft observation
  ledgers without writing wiki files.
- `wiki_commit_observation`: ingest-only commit of the latest staged ledger and
  registry synchronization.
- `wiki_write_observation`: review-only validation and writing of observation
  ledgers.
- `wiki_write_feature_registry`: review-only full registry rewrite.

`wiki_stage_observation` must:

- normalize `feature_family` and `feature_label`
- assign or reuse `feature_id`
- validate every observation record
- keep accepted content in run-local staged state
- return concise validation feedback on failure

`wiki_commit_observation` must:

- write the latest staged observation ledger
- synchronize `wiki/features-so-far.md` during ingest
- fail if no accepted staged ledger exists for the requested path

## Validation Requirements

Observation validation must reject:

- missing fenced YAML records
- missing required fields
- missing or malformed `source_ref`
- source hash mismatch
- Greek outside `greek_terms`
- unbounded Stephanus references such as `5d ff.`
- evidence references outside the observation span
- unnormalized `feature_family`

Registry validation must reject:

- invalid feature IDs
- duplicate feature IDs
- duplicate proposed names within one family
- invalid statuses
- missing observations
- references to missing observations
- observation feature IDs missing from the registry
- ingest mutations to existing feature status, notes, names, or observation
  links

## Transcript And Usage Observability

Every run writes an audit directory under `wiki/transcripts/runs/`.

Required artifacts:

- `summary.md`
- `events.jsonl`
- `response.md`
- `usage.json`
- `usage.md`

The transcript must show:

- provider and model
- profile
- system context loading
- feature registry injection
- tool calls and tool results
- validation rejections
- write successes
- token usage
- cache usage when exposed by the provider
- estimated cost when pricing data is available

The event stream should avoid storing huge partial tool arguments repeatedly.

## Ingest Workflow

1. Select provider profile.
2. Load project protocol, skill, prompt, and current feature registry.
3. Instruct the model to read only Greek source text.
4. The model uses `wiki_source_span` for each cited span.
5. The model validates drafts with `wiki_stage_observation`.
6. The model commits the final accepted staged ledger with
   `wiki_commit_observation`.
7. The harness synchronizes `wiki/features-so-far.md` during commit.
8. The harness appends operational run history to `wiki/ingest-log.md`.
9. The harness writes transcript and usage artifacts.
10. Local validation gates run after code or schema changes.

## Review Workflow

1. Load an existing observation ledger and feature registry.
2. Check source refs, local support, duplicate observations, and overclaims.
3. Update observation review statuses when needed.
4. Add or modify one canonical review receipt under `wiki/review/` in the same
   change set as any review-status changes.
5. Rewrite the feature registry with `wiki_write_feature_registry`.
6. The harness appends review-run history to `wiki/ingest-log.md`; this is not
   required review-decision provenance.
7. Preserve transcript and usage artifacts.

## Deterministic Derived Data Workflow

Derived data should be built before asking the model to infer mechanical facts.

Preferred order:

1. Build a Stephanus span index.
2. Build speaker-turn records.
3. Build Greek token and anchor indexes.
4. Build deterministic metrics.
5. Extend tools so the agent can cite derived refs.
6. Update observation schema only when derived refs are stable.

Derived records should be cited with a `derived_ref` field when they become
part of observation evidence.

## Quality Gates

Code and schema changes should pass:

```bash
bun run test
bun run typecheck
bun run validate
```

Observation artifacts should additionally pass direct ledger validation when
the observation schema changes.

## Success Criteria

The project is working when:

- a new dialogue can be ingested from Greek text without hand-editing tool
  output
- every observation points back to a verifiable Greek span
- the feature registry grows without one feature per observation becoming the
  default shape
- unknown families remain visible as normalized passthrough values
- transcripts make failed and successful tool use auditable
- token and cache usage are inspectable after each run
- review passes can improve records without creating interpretive synthesis
- deterministic derived data reduces model burden for mechanical observations

## Open Design Questions

- Which passthrough families recur enough to promote into the seed list?
- Should `claimed_expertise` become a seed family?
- Should relation models become `formal_relation_model`, `relation_marker`, or
  a deterministic relation index?
- Should observation writes remain whole-file writes or move to per-record
  append/merge tools?
- When should `derived_ref` become required for turn geometry or token-count
  observations?
- How much dialogue metadata should be maintained manually versus derived from
  text?
