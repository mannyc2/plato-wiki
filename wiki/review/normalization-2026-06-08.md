# Feature Normalization Review: Three-Ledger Baseline

Scope: `Euthyphro`, `Apology`, and `Crito`.

## Result

The three observation ledgers validate cleanly after normalization:

- observations: 83
- feature candidates: 82
- duplicate `family/proposed_name` pairs: 0
- seed families in use: 10
- passthrough families in use: 2

## Normalized

- `expertise_claim / knowledge_claim` became `claimed_expertise / exact_piety_expertise_claim`.
  - Reason: the observation records Euthyphro's explicit claim to exact competence about piety and impiety. The previous label was too generic.
- `relation_analogy / poet_quotation_corrected` became `formal_relation_model / fear_reverence_part_whole_model`.
  - Reason: the durable feature is the part-whole model between fear and reverence, not the incidental fact that Socrates quotes a poet.

## Current Passthrough Families

- `claimed_expertise`: one observation, `obs_euthyphro_0006`.
- `formal_relation_model`: one observation, `obs_euthyphro_0021`.

Do not promote either family to the seed enum yet. Let the next few dialogues show whether they recur as useful extraction surfaces.

## Watchpoints Before Longer Dialogues

- `dramatic_case_setup` is carrying many unlike things: legal posture, accusation content, institutional setting, reported oracle, military examples, political examples, and no-students claims. This is acceptable for the first three short works, but it may become too broad in `Republic`, `Symposium`, or `Phaedo`.
- `closure_type` is currently used for final-phase Apology trial events as well as true dialogue endings. If this becomes noisy, split trial disposition from closure.
- `myth_demarcation` includes dreams and personified speeches in addition to conventional myth material. That may be useful, but the family name may become too narrow for the actual observations.
- `craft_analogy` includes some analogy records that are not strictly crafts. If non-craft analogies recur, consider splitting `craft_analogy` from a broader `analogy_mapping` or keeping `craft_analogy` strict and using passthrough families for the rest.

## Recommendation

Proceed with one medium-length dialogue next, not a long one. `Meno` is a good stress test because it should exercise `definition_ladder`, `elenchus`, `myth_demarcation`, `claimed_expertise`, and possibly `formal_relation_model` without the scale of `Republic`.
