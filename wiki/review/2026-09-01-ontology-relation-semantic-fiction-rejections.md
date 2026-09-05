# Relation semantic-edge rejection review

reviewer: ontology-vnext-relation-gate-independent-review
reviewed_on: 2026-09-01
review_transition: accepted -> rejected
record_outcome: rejected; provenance retained
graph_outcome: accepted semantic edge retired; baseline edge provenance retained
replacement_policy: no replacement targets
evidence_path: wiki/ontology-audits/sha256-872907512484742c6823dd37d4187e52e0224a59748f98964e98b8ca101130e4/review-inputs/final-adjustment-evidence/sha256-ebd50b6095ceeceea1f8830e7d1444019cda1e50d608543c6160e6e2b0db6734-relation-semantic-fiction-review-evidence.json
evidence_sha256: ebd50b6095ceeceea1f8830e7d1444019cda1e50d608543c6160e6e2b0db6734
validation_relation_ledgers: pass
validation_semantic_defects: 0 accepted_relation_denial
validation_replay: pass

This review adjudicates the typed meaning of the canonical relation records themselves. No translation was consulted. Each accepted record asserted a semantic relation while its own basis or limits denied that typed edge. The records remain in the ledgers as rejected review provenance. Their formerly accepted semantic edges are retired from the final graph, while the immutable baseline edge pointers retain auditable historical provenance. Rejected relation records are excluded from accepted semantic readers and views.

reviewed_relation_ids:
- rel_cross-dialogue_0638
- rel_republic_0024
- rel_timaeus_0050

decisions:
- rel_cross-dialogue_0638 | endpoints: claim_laws_0246 -> claim_republic_0777 | rule: shared_term_no_shared_thesis | outcome: rejected | reason: The record’s accepted standing tension is unsupported because its own basis says the shared term does not establish a shared thesis and the claims neither contradict nor restate; reject the semantic edge while preserving the reviewed record as provenance.
- rel_republic_0024 | endpoints: claim_republic_0088 -> claim_republic_0247 | rule: declared_kind_denial | outcome: rejected | reason: The record’s accepted verbal-only tension is schema-compliance fiction because its own limits say the shared term creates no substantive tension; reject the semantic edge while preserving the reviewed record as provenance.
- rel_timaeus_0050 | endpoints: claim_timaeus_0216 -> claim_timaeus_0226 | rule: lexical_only_standing_tension | outcome: rejected | reason: The record’s accepted standing tension is only lexical overlap: its basis separates the bodily processes and its limits say the claims do not conflict; reject the semantic edge while preserving the reviewed record as provenance.

evidence_artifacts:
- artifact: `wiki/ontology-audits/sha256-872907512484742c6823dd37d4187e52e0224a59748f98964e98b8ca101130e4/review-inputs/final-adjustment-evidence/sha256-ebd50b6095ceeceea1f8830e7d1444019cda1e50d608543c6160e6e2b0db6734-relation-semantic-fiction-review-evidence.json`; sha256: `ebd50b6095ceeceea1f8830e7d1444019cda1e50d608543c6160e6e2b0db6734`

Validation replays each current rejected YAML block back to the exact prior accepted bytes, re-runs the typed denial detector across `basis`, `resolution`, and `limits`, verifies the exact endpoints and ordinal, and checks the prior and final full-match hashes. Focused relation-ledger validation and the semantic-defect scan report no remaining accepted relation denial.
