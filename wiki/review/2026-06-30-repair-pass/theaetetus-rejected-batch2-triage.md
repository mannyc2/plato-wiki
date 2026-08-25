# Theaetetus Rejected Batch 2 Triage

Scope: the next eight rejected Theaetetus records after the pilot:
`obs_theaetetus_0039`, `0045`, `0049`, `0058`, `0069`, `0075`, `0081`,
`0109`.

Method: checked each record against nearby accepted Theaetetus records and the
resolved Greek source span from `raw/plato/greek/theaetetus.txt`. No
translations, Pioneer, review queue, segmented review, external LLMs, or
provider-backed harness runs were used.

## Accepted Conversions

- `obs_theaetetus_0045`: accepted as
  `craft_analogy/geometric_construction_analogy`. The 147e-148a source
  directly supports the use of geometric likenesses for square and oblong
  numbers. This preserves a distinct analogy record beside the separate
  accepted dichotomous-division record for the same mathematical passage.
- `obs_theaetetus_0075`: accepted as
  `craft_analogy/midwifery_barrenness_generativity`. The 151e-152a source
  directly supports Socrates' request to test Theaetetus' first definition as
  either fertile or a wind-egg. The repair removes the wrong
  `irony_marker/knowledge_disavowal` framing.

## Left Rejected

- `obs_theaetetus_0039`: leave rejected. The source supports the midwives'
  matchmaking expertise, but accepted `obs_theaetetus_0038` already captures
  that function within the broader enumeration of midwifery craft domains.
- `obs_theaetetus_0049`: leave rejected. The source supports the drama term, but
  the rejected record reverses the comparison by saying the midwives' art is
  greater than Socrates' own activity. Accepted midwifery records around
  149e-150c capture the durable craft-analogy structure without that error.
- `obs_theaetetus_0058`: leave rejected. The source supports the operational
  instruction to answer Socrates and not resent removal of a false offspring,
  but the record's `midwife_craft_claimed` function duplicates accepted
  midwifery craft records and overlaps with accepted `obs_theaetetus_0059` on
  falsehood rejection.
- `obs_theaetetus_0069`: leave rejected. The source contains the Homeric
  crowning citation and a source-apparatus deletion marker, but the record leans
  on that editorial marker as if it were a durable dramatic fact. Accepted
  `obs_theaetetus_0067` already records the Homeric citation's argumentative
  use.
- `obs_theaetetus_0081`: leave rejected. The repaired needs-split pass already
  supplied accepted same-span records for the generative perception model and
  the private intermediate percept at `obs_theaetetus_0082` and
  `obs_theaetetus_0083`; the rejected record uses the wrong family and adds no
  distinct accepted observation.
- `obs_theaetetus_0109`: leave rejected. The source supports brief Theaetetus
  responses, but accepted same-span records already capture the forced
  alternative and Socrates' introduction of the counter-argument. The rejected
  turn-density record does not add a durable function beyond those accepted
  neighbors.
