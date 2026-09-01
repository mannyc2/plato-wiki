# Plato Textual-Fact Compiler Specification

## Purpose

Compile the complete Greek Plato corpus into neutral, source-bound textual
facts that can be compared through explicit questions. Extraction records what
the cited text says or does. It does not infer hidden meanings, authorial
endorsement, textual absence, counterevidence, or a philosophical synthesis.

The canonical source is `raw/plato/greek/`. Translation files are never input
to extraction or source adjudication.

## Canonical Representations

The model has one ownership hierarchy:

1. Greek source bytes and deterministic source spans.
2. Source-bound observations and assertions.
3. Independent comparison axes and feature concepts.
4. Many-to-many observation-to-concept memberships.
5. Claims, stance trajectories, semantic relations, commentary citations, and
   voice attribution linked to their canonical evidence.
6. Clusters, dossiers, joins, indexes, and site pages generated as disposable
   projections of the preceding layers.

No registry, cluster, dossier, label pair, or generated page is a peer
ontology. The retired `feature_id`, `feature_family`, and `feature_label`
fields are not aliases and must not occur in live records or projections.

## Repository Shape

```text
raw/plato/greek/             canonical Greek source files
wiki/observations/           source-bound observation ledgers
wiki/claims/                 attributed assertion and stance ledgers
wiki/relations/              reviewed semantic-edge ledgers
wiki/commentary/             authored commentary with canonical citations
wiki/voices/                 source-bound voice attribution ledgers
wiki/ontology/               axes, concepts, and memberships in JSONL
wiki/clusters/               generated axis projections in JSONL
wiki/dossiers/               generated concept projections in JSON
wiki/ontology-audits/        content-addressed full-corpus audit packages
wiki/review/                 canonical review and migration receipts
derived/plato/               deterministic source indexes and joins
packages/harness/            domain logic, writers, readers, and validation
packages/cli/                thin command parsing and terminal output
```

Historical v1 design documents and receipts may retain legacy terms when they
are explicitly marked historical. They are provenance, not runtime contracts.

## Source-Bound Observation Contract

Observation ledgers are Markdown containing strict YAML 1.2 fenced records.
Each accepted observation states one checkable textual fact.

```yaml
observation_id: obs_euthyphro_0001
source_work: Euthyphro
stephanus_span: 5d-6a
source_ref:
  source_path: raw/plato/greek/euthyphro.txt
  stephanus_span: 5d-6a
  start_marker: 5d
  end_marker: 6a
  start_char: 0
  end_char: 1
  text_sha256: 0000000000000000000000000000000000000000000000000000000000000000
greek_terms: []
english_gloss: ""
observation: The speaker asks for one form by which the named things are such.
textual_basis: The exact cited interval explicitly contains the request.
limits: This records the local request, not endorsement or a general doctrine.
supports_claim_ids: []
review_status: accepted
```

Rules:

- `observation_id` is stable and unique.
- `source_ref` is an exact byte range and content hash in one Greek source.
- `observation` is one grammatical, neutral fact supported by that range.
- `greek_terms` may contain only terms present in the exact cited bytes.
- `limits` states what the record does not establish.
- `supports_claim_ids`, when non-empty, is reciprocal with the linked accepted
  claims' `observation_ids`.
- Accepted records are reader-visible; rejected records remain provenance and
  never imply absence or counterevidence.
- Live ledgers have only terminal `accepted` or `rejected` statuses.

## Ontology vNext Contract

`wiki/ontology/axes.jsonl`, `concepts.jsonl`, and `memberships.jsonl` are strict,
canonical JSONL. Each line is one closed-schema object.

An axis has a stable dimension-bound identity and exactly one precise
cross-dialogue comparison question. Dimensions separate:

- `subject_matter`
- `textual_function`
- `presentation_form`
- `dramatic_context`
- `discourse_structure`
- `lexical_form`

A concept belongs to exactly one axis and defines a source-observable answer
class for that axis's question. A membership links one accepted observation to
one concept and records a meaningful assignment basis. Membership identity is
derived from `(observation_id, concept_id)`. Duplicate identities, missing
targets, rejected-observation memberships, and legacy identity fields are
invalid states.

Axes and concepts are not inferred from display labels. Their IDs derive from
their canonical keys and dimension-bound parent identities. Cutovers are
one-way: no dual reader, legacy alias, or fallback representation is allowed.

## Dependent Semantic Lanes

### Claims and stances

Every accepted claim cites one or more accepted observations through
`observation_ids`, and every cited observation reciprocally names the claim in
`supports_claim_ids`. Interval overlap alone is not evidence. Stance events are
source-ordered, hash-bound events; `final_status` is derived from the terminal
event.

### Relations and resolutions

An accepted relation is a substantive reviewed semantic edge between accepted
claims. Its basis and resolution must affirm the declared relation kind.
Compatibility, topic overlap, lexical overlap, a rejected review decision, or
a statement that no substantive relation exists cannot be an accepted edge.

### Commentary and citations

Accepted commentary cites existing accepted observations, claims, relations,
or generated dossiers. Dossier citations use
`<axis_key>/<concept_key>` and resolve to
`wiki/dossiers/<axis_key>/<concept_key>.json`. A span overlap cannot be used to
invent a citation. Unresolved citations fail closed.

### Voices

Voice attribution is source-bound and validated against deterministic turns,
registered sigla, reported-speech scopes, and explicit review receipts. Voice
projections may not widen claim speakers merely because a global registry
contains a name.

## Absence and Counterevidence

Absence and counterevidence are positive evidence types, not consequences of
review rejection, a missing record, or a zero count in a projection. They must
be represented by an explicit source-bound accepted record and typed relation
when the Greek text supplies such evidence. Generated presence tables report
only observed accepted membership unless an explicit evidence record says
more.

## Deterministic Projections

The following are generated views and must equal their canonical inputs:

- source/turn and voice joins under `derived/plato/`
- axis cluster JSONL under `wiki/clusters/`
- concept dossier JSON under `wiki/dossiers/`
- search indexes and static site pages

Generators replace their output trees, reject stale or legacy shapes, exclude
rejected records, and produce byte-identical output on two clean consecutive
runs.

## Full-Corpus Audit Contract

Each content-addressed directory under `wiki/ontology-audits/` binds one frozen
Git commit and corpus digest. It contains:

- an exact canonical-input manifest and Greek-source inventory
- deterministic source units covering every source byte
- record, concept/membership, and graph partitions
- primary and independent Greek-only source-review inputs
- reconciled item-level findings
- terminal adjudications and review receipts
- content-addressed semantic and concept decisions
- regeneration and closure evidence
- an acceptance record

Every baseline and final record, edge, concept, and membership occurs exactly
once in its required partition. Additions and removals require explicit
terminal dispositions and live replacement targets where the action demands
one. Acceptance requires exact baseline and final set equality, completed
source passes and reconciliation, zero pending adjudications, zero stale
aliases, zero rejected-reader leaks, and identical regeneration digests.

See `docs/ontology-audit-protocol.md` for the operational package contract.

## Extraction and Review Workflow

1. Bound one Greek source slice and all overlapping canonical records.
2. Read only the Greek source during extraction or source adjudication.
3. Record one neutral textual fact per observation; use explicit zero-result
   dispositions when nothing is missing or defective.
4. Validate exact spans, hashes, atomicity, provenance, status, and references.
5. Require an independent pass when the audit protocol calls for one.
6. Reconcile disagreements explicitly; never silently choose one pass.
7. Apply accepted decisions in one reviewable change set with its receipt.
8. Regenerate dependent projections and run the complete validation suite.

Temporary prompts and scratch analyses are disposable. Status-changing
decisions and audit evidence live in tracked canonical paths.

## Runtime and Validation

The CLI remains thin; domain behavior belongs in the harness and validators.
Principal commands are:

```bash
bun run harness derive joins [dialogue]
bun run harness derive voices [dialogue]
bun run harness derive voice-joins [dialogue]
bun run harness clusters --write
bun run harness dossiers --write
bun run harness site --out-dir <path>
bun run harness ontology-audit semantic-plan --atomic-split-overlay <path> --source-omission-overlay <path>
bun run harness ontology-audit hard-cut --atomic-split-overlay <path> --source-omission-overlay <path>
bun run harness ontology-audit close
bun run harness ontology-audit verify
bun run validate
```

All changes must pass:

```bash
bun run test
bun run typecheck
bun run validate
git diff --check
bun run harness ontology-audit verify
```

## Success Criteria

The compiler is closed only when every Greek source unit has two completed
source-first dispositions, every canonical item has a terminal record-first
disposition, every feature concept and membership has a concept-first
decision, every dependent lane resolves its references, every public
projection excludes rejected records, deterministic regeneration is
byte-stable, the audit package independently verifies the live final set, and
the exact implementation is committed. Merge, deployment, and publication are
separate authorities.
