# Extract Plato Claims Segment

Dialogue: `$1`

Current segment: `$2`

Speaker-turn table:

```text
$3
```

Current segment source/ref package:

```text
$4
```

Extract only claims that participate in the argument in this segment:
definitions offered for the term under examination, general theses asserted,
examined, or conceded, explicit method rules, and reported doctrines of
others. Bias toward fewer records. Do not extract background narration,
passing examples, or claims whose stance event cannot be checked at a cited
span.

For `report`, record only an argumentative doctrine or position attributed to
someone else. Do not record ordinary dramatic or legal setup: who has a case,
who indicted whom, who asks a question, a person's deme or appearance, venue
facts, greetings, or procedural scene-setting. Also discard ironic praise or
speculative reconstruction unless the cited span states a checkable doctrine
being examined. Empty append is acceptable for setup-heavy segments.

The claim layer feeds later relation/tension analysis. Keep only records that
could plausibly stand in a definition, contradiction, revision, refutation, or
standing-thesis relation to another claim. Skip one-off self-characterizations,
audience reactions, attitudes toward ridicule, courtroom-outcome conditionals,
personal predictions, and rhetorical comparisons unless they state a general
method rule or a doctrine under examination. Target a sparse ledger for each
segment; more than 10 records means you are probably over-extracting.

Write new records only with `wiki_append_claims` to `wiki/claims/$1.md`.
Treat any draft `claim_id` as temporary; the harness assigns the stored id.
If this segment has no extractable claim, call `wiki_append_claims` with empty
content.

Use the injected current segment source text above as the extraction text.
Use only spans covered by the injected allowed marker list for claim and
stance-event citations: a cited `stephanus_span` must be either one listed
marker or a contiguous `start-end` range from the ordered list. Include a
`source_ref:` key for every cited span, but do not fill offsets or hashes; the
append tool canonicalizes `source_ref` fields from the surrounding
`stephanus_span` and rejects citations outside this segment before writing.
This command does not expose `wiki_source_span`. Do not scan outside `$2`.

For every claim:

- Use an allowed `stephanus_span` and a `source_ref:` key for the claim
  citation.
- Use an allowed `stephanus_span` and a `source_ref:` key for every
  `stance_events[]` citation.
- If validation reports a source_ref hash mismatch, keep the same record only
  if the `stephanus_span` is right; the append tool will rewrite the hash from
  that span.
- Use a speaker from the speaker-turn table, or `"(unattributed)"` when the
  table says the dialogue has no speaker sigla.
- Keep Greek script only in `greek_terms`.
- Make `content` one English sentence that restates the claim at the cited
  span.
- Make `limits` state what the record does not establish. For
  `left_standing`, include the checked scope.
- Set `final_status` mechanically from the last stance event.

Allowed values:

```yaml
claim_kind: definition | thesis | method_rule | report
stance_events.kind: asserted | posed_for_examination | reported | challenged | refuted_conceded | revised | withdrawn | reaffirmed
final_status: left_standing | posed_only | unresolved_challenge | refuted | revised | withdrawn
review_status: unreviewed
```

Record shape:

```yaml
claim_id: claim_$1_0000
source_work: ""
stephanus_span: ""
source_ref:
speaker: ""
claim_kind: thesis
content: ""
greek_terms: []
stance_events:
  - kind: asserted
    stephanus_span: ""
    source_ref:
final_status: left_standing
observation_ids: []
limits: ""
review_status: unreviewed
```

Do not add interpretive synthesis.
