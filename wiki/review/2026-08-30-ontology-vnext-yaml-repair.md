# Ontology vNext Strict-YAML Repair Receipt

- reviewer: `codex-root`
- reviewed_on: `2026-08-30`
- baseline_commit: `8a131909e83180bd7d5b47bc83f063e7b1d8d140`
- source_policy: Greek files under `raw/plato/greek/` only; no translation consulted
- decision: repair eight malformed mappings and two misplaced Greek quotations without changing review status or textual meaning

## Item-level decisions

- `obs_lesser-hippias_0021`: remove the unkeyed token `temp`. The token is not a YAML field and has no counterpart or evidentiary role in the bound Greek source slice `366a-366b` (`text_sha256: af900937c9db08b55bfe993e81ae3d6248690a897c5f613848d7e15cedd3829b`). All keyed record values remain unchanged.
- `obs_lesser-hippias_0022`: remove the same unkeyed `temp` token for the same bound Greek slice and reason. All keyed record values remain unchanged.
- `obs_lesser-hippias_0023`: remove the same unkeyed `temp` token for the same bound Greek slice and reason. All keyed record values remain unchanged.
- `obs_phaedo_0201`: remove the second, empty `greek_terms` key. Retain the source-bound terms `ὑποθέσεως`, `συμφωνεῖ`, `διαφωνεῖ`, and `ὑπόθεσιν` from `101c-101d` (`text_sha256: 8ad8e60473da24b910efc5633f7412fc236e49eace54c0d8774372a97c501d46`). The duplicate empty key was a serialization defect and must not overwrite the evidenced list.
- `obs_republic_0565`: remove the second, empty `greek_terms` key. Retain `Ἀσκληπιός` from `599c` (`text_sha256: dcb32723571aed7e4d74a8124cd3a5be90e518c60534a63663b4286ed33d1514`). The duplicate empty key was a serialization defect and must not overwrite the evidenced term.
- `obs_greater-hippias_0123`: remove the long Greek quotation from `textual_basis` and retain its source-bound English description. The canonical Greek remains available through the exact `302c-302d` source reference (`text_sha256: 2195e8692d79f52ac9d5354ccce85d57a38203e87e4a8d9851061432b1ac1361`), while the existing short terms remain under `greek_terms`.
- `obs_greater-hippias_0125`: remove the long Greek quotation from `textual_basis` and retain its source-bound English description. The canonical Greek remains available through the same exact `302c-302d` source reference and the two relevant memory terms remain under `greek_terms`.
- `rel_symposium_0009`: move the exact `206b` resolution evidence into the canonical nested `resolution_ref.source_ref` shape and add the equal start/end marker fields. The path, offsets, and hash remain unchanged.
- `rel_symposium_0010`: move the exact `206a` resolution evidence into the same canonical nested shape. The rejected review decision and all semantic prose remain unchanged.
- `rel_symposium_0011`: move the exact `206c` resolution evidence into the same canonical nested shape. The rejected review decision and all semantic prose remain unchanged.

These are representation repairs only. No item changes `review_status`, source span, source hash, observation proposition, feature assignment, or identity in this receipt.
