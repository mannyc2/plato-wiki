---
name: plato-observation-extraction
description: Extract checkable Plato text observations into wiki ledgers without producing interpretive readings.
---

# Plato Observation Extraction

Compile neutral textual records, not interpretations. Read canonical Greek only
from `raw/plato/greek/`; do not read translations during extraction or source
adjudication.

Every observation must contain a stable ID, source work, Stephanus span,
`source_ref` copied unchanged from `wiki_source_span`, one atomic observation,
textual basis, limits, review status, and optional short Greek terms and English
gloss. Store references rather than source snippets. Greek script belongs only
in `greek_terms`; prose fields are English.

Do not encode classification in observation records. Comparison axes, concepts,
and many-to-many memberships live in the separately reviewed `wiki/ontology`
lane. Extraction and observation review must not edit that lane.

Do not write hidden-intention claims, esotericism claims, external interpretive
frameworks, unstated psychological motives, or synthesis across uncited spans.

During whole-dialogue ingest, stage drafts with `wiki_stage_observation` and
commit the accepted complete ledger once with `wiki_commit_observation`. During
segmented ingest, use `wiki_append_observations`. During review, update only the
authorized ledger fields. The harness writes the ingest log; do not write it
yourself.
