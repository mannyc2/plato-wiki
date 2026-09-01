# Ontology vNext

## Purpose

The Plato Wiki ontology is a neutral, source-bound textual-fact model for
question-driven comparison across dialogues. Greek source spans are evidence;
observations state what the cited text does or says; independent ontology rows
classify accepted observations without changing their source meaning.

## Canonical model

The only classification authority is the strict JSONL model under
`wiki/ontology/`:

- `axes.jsonl` defines independent comparison axes and one precise comparison
  question per axis.
- `concepts.jsonl` defines the answer categories available under an axis and
  repeats the exact comparison question they answer.
- `memberships.jsonl` records many-to-many assignments from accepted
  observations to concepts, with an explicit textual basis.

Source-bound observations do not own classification identity. An observation
may answer several independent questions through several memberships. A
concept belongs to exactly one axis. Rejected observations have no memberships.
Stable IDs are SHA-256 identities derived from canonical semantic
components; display text is never an identity key.

The allowed axis dimensions are `textual_function`, `subject_matter`,
`presentation_form`, `dramatic_context`, `discourse_structure`, and
`lexical_form`. An axis must encode exactly one of those jobs. Topic,
presentation, dramatic setting, local summary, and textual function may not be
collapsed into one identity tuple.

## Invariants

Every row is closed-schema canonical JSON. Unknown fields, duplicate IDs,
duplicate semantic identities, dangling references, empty questions, empty
definitions, empty assignment bases, rejected-observation assignments, and
legacy identity fields are fatal validation errors. Every ID is recomputed
from its semantic identity during validation.

Claims that derive from observations name at least one accepted observation.
An overlapping byte interval alone is not a support edge: when no reviewed
support link exists, the hard cut creates one accepted neutral observation
from the claim's exact source interval and binds only that evidence record.
Accepted semantic relations express a substantive relation; a rejected review
decision is review provenance, not a semantic edge. Textual absence and
counterevidence require an accepted source-bound observation that explicitly
states the negative or conflicting proposition, followed by an ordinary typed
membership or semantic relation. Rejection, a zero membership count, and a
dialogue's omission from a projection are never absence or counterevidence.
Accepted commentary has source or semantic citations.

The shared-normalized-term relation candidate generator is discovery tooling,
not ontology authority. Its output can propose claim pairs for later review,
but it does not define the canonical relation set, prove that a relation is
absent, or license a mechanical accepted/rejected decision. Relation
completeness is established by strict canonical ledgers, terminal item-level
adjudications, accepted semantic-edge invariants, reader-leak checks, and the
verified snapshot-bound audit package.

## Hard cut only

The old feature registry and observation-local feature fields are not readers,
aliases, or fallbacks. Migration removes them in the same change that writes
the vNext rows and updates every consumer. Clusters, dossiers, site data, and
other reader products are deterministic projections of axes, concepts,
memberships, and accepted semantic records; they are not peer ontologies.

## Question-driven projections

A comparison view starts with an `axis_id`, optionally narrows to one or more
`concept_id` values, joins memberships to accepted observations, and follows
typed claim, relation, citation, voice, and source-span links. View paths and
headings may use stable human-readable keys, but links and joins use canonical
IDs. Regeneration from a clean tree must be byte-identical.

## Review and change control

Every concept states its precise cross-dialogue comparison question and has a
terminal concept-first decision. Every membership has a terminal item-level
decision and rationale. Status-changing or identity-changing decisions bind a
canonical review receipt in the same change set. The snapshot-bound audit
package under `wiki/ontology-audits/` proves full source coverage, record
coverage, reconciliation, set equality, and final acceptance.
