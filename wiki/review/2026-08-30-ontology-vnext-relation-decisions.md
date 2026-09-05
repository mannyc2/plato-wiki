# Ontology vNext Relation Decisions

- reviewer: `codex-root`
- reviewed_on: `2026-08-30`
- baseline_commit: `8a131909e83180bd7d5b47bc83f063e7b1d8d140`
- source_policy: Greek files under `raw/plato/greek/` and the exact claim records cited by each relation; no translation consulted
- decision: change sixteen schema-only or lexical-only relation candidates from `accepted` to `rejected`
- mutation_contract: `wiki_update_relation_review_statuses`; relation IDs, pair IDs, endpoints, source references, and decision prose are preserved

## Item-level decisions

- `rel_cross-dialogue_0011`: reject. Its own basis says the two claims occupy unrelated frameworks and that the row was filed only for schema compliance.
- `rel_cross-dialogue_0243`: reject. A shared hedging formula marks inference in two unrelated hypotheses; the record identifies no shared proposition.
- `rel_cross-dialogue_0383`: reject. The common genitive `ψυχῆς` is morphological co-occurrence across different classifications, not a semantic edge.
- `rel_cross-dialogue_0465`: reject. The shared word `σωφροσύνη` occurs in unrelated elenctic and encomiastic functions, and the record explicitly identifies no contradiction, revision, or restatement.
- `rel_cross-dialogue_0682`: reject. The proposed city-as-patient tension is an interpretive synthesis beyond the two bounded claims; the candidate-producing term alone does not establish a relation.
- `rel_cross-dialogue_0689`: reject. `κάλλος` names different predicates in physiological and representational claims with no common proposition.
- `rel_cross-dialogue_0716`: reject. `ῥώμην` is applied to disbelief in one claim and bodily vigor in the other; the row says it was retained only because the term was flagged.
- `rel_cross-dialogue_0887`: reject. The comparative `ἀμείνω` ranks different objects in unrelated domains and supplies no semantic connection.
- `rel_cross-dialogue_1020`: reject. `ἁρμονία` has different referents in the two claims, and neither bounded passage reconciles or contrasts them.
- `rel_cross-dialogue_1045`: reject. The shared word `ἰδέα` does not make the psychological and craft-metaphysical claims contradict, revise, or restate one another.
- `rel_cross-dialogue_1152`: reject. The proposed tension between poetic norms about gods and the mortal appetitive soul requires an unasserted cross-dialogue synthesis; the shared `λόγος` form is insufficient evidence.
- `rel_cross-dialogue_1219`: reject. `κακόν` names different relata in unrelated arguments, so no resolution or semantic edge is present.
- `rel_cross-dialogue_1252`: reject. The superlative ranking construction is a formal recurrence over different comparison classes, not a shared proposition.
- `rel_laws_0103`: reject. The two virtue claims describe different subjects and scopes; the record says the apparent conflict dissolves without a resolution.
- `rel_laws_0132`: reject. Recurring `εἴδη` classification in music and constitutional design is a method-form recurrence, not a relation between the claims.
- `rel_laws_0149`: reject. The genus-species form recurs over different genera and cardinalities without one claim depending on the other.

These rejected rows remain review provenance only. They are not accepted semantic edges, are excluded from readers and graph projections, and do not constitute absence or counterevidence.
