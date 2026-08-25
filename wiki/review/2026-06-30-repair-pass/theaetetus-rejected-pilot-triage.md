# Theaetetus Rejected Pilot Triage

Scope: first eight rejected Theaetetus records after the needs-split repair pass:
`obs_theaetetus_0007`, `0008`, `0012`, `0016`, `0019`, `0022`, `0026`, `0035`.

Method: checked each record against `wiki/observations/theaetetus.md` neighbors and
resolved the relevant span against `raw/plato/greek/theaetetus.txt`. No
translations, Pioneer, review queue, segmented review, external LLMs, or
provider-backed harness runs were used.

## Accepted Conversions

- `obs_theaetetus_0019`: accepted as `prosopography/property_status_reported_by_speaker`.
  The 144d-144e span directly supports the guardians/property report and
  Theodorus' attached praise of Theaetetus' liberality with money. The repaired
  record avoids the earlier orphan-status inference.
- `obs_theaetetus_0022`: accepted as
  `definition_ladder/definition_by_enumeration_rejected`. The 146d-146e span
  directly supports Theaetetus' craft-enumeration answer and Socrates'
  objection that the answer gives many examples instead of the one target.

## Left Rejected

- `obs_theaetetus_0007`: leave rejected. Its broad cast-list function is
  already covered more durably by the accepted frame and reading records around
  143a-143c, while the 143d transition belongs to the embedded dialogue.
- `obs_theaetetus_0008`: leave rejected. The 143e-144a passage is Theodorus'
  direct speech in the embedded conversation, not a reported encounter frame;
  accepted neighboring records already capture the physical and character
  description of Theaetetus.
- `obs_theaetetus_0012`: leave rejected. The source supports a prophetic
  wording about Socrates' prediction, but the record's `irony_marker` /
  `socratic_self_deprecation` framing is wrong and the durable prediction
  content is already captured by `obs_theaetetus_0013`.
- `obs_theaetetus_0016`: leave rejected. The source supports a name-recall
  delay, but `obs_theaetetus_0015` already captures the patronymic and naming
  setup; the rejected record adds no distinct durable observation.
- `obs_theaetetus_0026`: leave rejected. The clay analogy is already captured
  by accepted records `obs_theaetetus_0027` and `obs_theaetetus_0028`; accepting
  this record would duplicate the same local methodological point.
- `obs_theaetetus_0035`: leave rejected. The record combines mathematical
  classification, praise, and the knowledge-question contrast; accepted nearby
  records separately capture the relevant geometry, false-witness register, and
  Socratic reassurance.
