# pi-agent-core Wiki Runner Design

## Purpose

The runner orchestrates source-bound Plato observation extraction and review.
Domain behavior comes from the repository protocol, skill, prompts, and Greek
sources; the runner does not invent or maintain a parallel ontology.

## Required resources

- `.pi/skills/plato-observation-extraction/SKILL.md`
- `.pi/prompts/ingest-plato-dialogue.md`
- `.pi/prompts/ingest-plato-segment.md`
- `.pi/prompts/review-plato-observations.md`
- `.pi/prompts/review-plato-segment.md`
- `docs/plato-wiki-extraction-protocol.md`
- `docs/ontology-vnext.md`

## Responsibilities

The runner loads the protocol and local resources, exposes bounded Greek source
reads, validates observation ledgers at the write boundary, and records run
history. It must not read translations during extraction, ask for hidden
meanings, encode classification in observation records, or update derived
synthesis views.

Whole-dialogue ingest stages then commits one complete ledger. Segmented ingest
appends validated source-bound records. Review changes authorized observation
fields while preserving stable IDs and order. Comparison axes, concepts, and
memberships use a separate reviewed workflow over strict `wiki/ontology` JSONL.

## Validation gate

Observation records require a stable ID, source work, Stephanus span, matching
`source_ref`, atomic observation, textual basis, limits, and valid review
status. Greek script outside `greek_terms`, out-of-span references, source hash
mismatches, interpretive phrases, duplicate IDs, and stale ontology aliases are
rejected. The runtime has one ontology reader and no legacy fallbacks.
