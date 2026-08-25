# Apparatus lane protocol

## What the lane is

The apparatus lane holds reviewed, span-anchored **reading notes**: candidate
patterns that became visible from accumulated accepted records. It is a
*downstream interpretive lane*, like commentary — it cites the neutral record
layers, and nothing neutral ever reads it. One ledger per dialogue lives at
`wiki/apparatus/<dialogue>.md`, each record a fenced `yaml` block.

The lane exists to redeem the second sentence of the extraction protocol's
founding stance: "If larger interpretive patterns exist, they should become
visible from accumulated records rather than from prompting an LLM to find
them." An apparatus record points a careful reader at a span and names what the
accumulated records invite them to weigh there. It never asserts hidden meaning
as a property of the text.

## What it may do

- Anchor a typed note to a Stephanus span and cite the accepted records that
  make the note checkable.
- Invite attention — "weigh," "compare," "notice the placement."

## What it must do

- **Cite its evidence.** `cites` must be non-empty (at least one id across the
  four lists), and every cited id must exist with `review_status: accepted`.
  This is stricter than the commentary lane, where empty cites are legal.
- Anchor byte-for-byte: the `source_ref` is recomputed from the span exactly as
  the commentary lane recomputes it; a mismatch fails validation.
- Keep the note to English prose, ≤ 600 characters, with contiguous Greek runs
  ≤ 80 characters (the same `COMMENTARY_GREEK_RUN_MAX` rule as commentary).
- Use a `kind` from the closed set below.

## What it must not do

- Assert hidden meaning as a property of the text. Notes are invitations, never
  "Plato secretly means."
- Leak into the neutral layers, or be read by any neutral pipeline. Only the
  validator and the site generator open `wiki/apparatus/`.

## Record contract

One fenced `yaml` block per record:

```yaml
apparatus_id: apx_<slug>_NNNN        # 4-digit, append-only sequential from 0001
source_work: Meno
kind: surface_tension | structural_marker | address_shift
stephanus_span: 80a-80b
source_ref:
  source_path: raw/plato/greek/meno.txt
  stephanus_span: 80a-80b
  start_marker: 80a
  end_marker: 80b
  start_char: 0
  end_char: 0
  text_sha256: "…"                   # recomputed byte-for-byte, like commentary
note: "One paragraph. What a careful reader is invited to weigh at this span."
cites:                               # AT LEAST ONE id across the four lists — mandatory
  observations: []
  claims: []
  relations: []
  dossiers: []
author: model | operator
review_status: unreviewed | accepted | rejected | needs_split
```

### Kinds (closed set)

- `surface_tension` — the surface account is under strain at this span
  (typically citing relation records).
- `structural_marker` — a positional or structural fact carries weight here
  (centers, rings, counted lists; typically citing turn- or metric-backed
  observations).
- `address_shift` — who is addressed, or who can hear, changes what is said
  (typically citing speaker- or claim-backed records).

Extending the set requires a protocol edit and a validator change in the same
commit.

## Review & provenance

Enforcement matches the commentary lane: an uncommitted `review_status` change
requires one added or modified canonical review receipt under `wiki/review/` in
the same change set. Harness ingest-log entries remain run history; they are not
required review-decision provenance.
**The site renders `accepted` records only** — stricter than commentary's
accepted-plus-unreviewed; this lane does not ship drafts.

## Presentation

The lane renders exclusively as marginal signs in the reading view. It has no
nav item, no hub page, and no search-index presence, and the emitted site never
names the interpretive tradition — the words "esoteric" and "Straussian" do not
appear in generated HTML. The kind→sign mapping (†, ※, ») is a public visual
contract once data ships; changing a glyph re-teaches returning readers and is a
breaking change. A reader finds the layer only by reading.
