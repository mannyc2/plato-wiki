# Theaetetus Rejected Batch 3 Triage

Scope: the next eight untriaged rejected Theaetetus records after batch 2:
`obs_theaetetus_0114`, `0121`, `0155`, `0156`, `0195`, `0200`, `0202`,
`0211`.

Method: checked each target record against nearby accepted records and the
resolved Greek source span from `raw/plato/greek/theaetetus.txt`. For
`obs_theaetetus_0155`, the antecedent required expanding the source check to
`164e-165a`. No translations, Pioneer, review queue, segmented review, external
LLMs, or provider-backed harness runs were used.

## Accepted Conversions

- `obs_theaetetus_0121`: accepted as
  `turn_geometry/procedural_agreement_to_inquire`. The 160e source supports
  Theaetetus' assent to the testing procedure and Socrates' post-birth
  amphidromia frame.
- `obs_theaetetus_0155`: accepted as
  `prosopography/named_historical_figure` with the corrected span
  `164e-165a`. The prior rejected record misassigned the guardianship to
  Socrates; the source names Callias son of Hipponikos as the better candidate
  for Protagoras' guardian.
- `obs_theaetetus_0156`: accepted as
  `craft_analogy/hunting_metaphor_for_inquiry`. The 165b source supports the
  inescapable-question / well-trap image, and no accepted same-span record
  captures that image.
- `obs_theaetetus_0195`: accepted as
  `irony_marker/philosopher_ridiculed_by_the_many`. The 174b-174c source
  supports the philosopher's courtroom/public ridicule, crowd laughter,
  perplexity, and awkward reputation.
- `obs_theaetetus_0200`: accepted as
  `philosophical_criterion/look_to_the_whole`. The 174d-174e source supports
  the scale-shift from large landholdings to the whole earth; the repair removes
  the wrong `knowledge_disavowal` frame.
- `obs_theaetetus_0202`: accepted as `elenchus/common_opinion_corrected`. The
  176b-176c source supports Socrates' rejection of the common motive for virtue
  and his replacement true account. The repair removes the wrong mock-deference
  frame.

## Left Rejected

- `obs_theaetetus_0114`: leave rejected. The source supports dense short
  assents, but accepted same-span `obs_theaetetus_0113` already captures the
  assent-chain identity inference without duplicating a turn-density record.
- `obs_theaetetus_0211`: leave rejected. The record has empty observation
  fields and same-span accepted records already capture Socrates' definitional
  method and the assent chain at 177e-178a.
