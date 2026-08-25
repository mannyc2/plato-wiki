# Protagoras commentary direct curation

- date: 2026-08-17
- curator: Luna / Codex direct semantic curation
- scope: `wiki/commentary/protagoras.md`, sections `comm_protagoras_0001`–`comm_protagoras_0018`
- source: `raw/plato/greek/protagoras.txt`; every block's `source_ref` was
  recomputed against the Greek source and its Stephanus index
- model attribution: `author: model`; no Opus or Claude campaign was used or
  claimed

## Semantic anchor checks

- The opening frame is anchored at `309a-310b` (offsets `0–2253`): the
  erotic-hunt exchange, Socrates's wisdom/beauty displacement, and the first
  report of Hippocrates's arrival all occur before the first teaching-price
  examination.
- The purchase warning is bounded at `313d-314e` (offsets `9168–11958`), and
  the accepted claim `claim_protagoras_0001` is inside it: knowledge enters the
  soul directly and cannot be inspected like food in a separate vessel.
- The Great Speech is not collapsed into one generic block: `318b-320c`
  introduces civic expertise, `320d-323a` gives the Prometheus/Zeus myth, and
  `323b-324e` turns to punishment and teachability. Accepted claims
  `claim_protagoras_0002`–`claim_protagoras_0004` remain within the sophistry
  history/method span `315a-318a`.
- The Simonides episode is bounded from `331e-338e` across two preparatory
  blocks, with `331e-334c` continuing the unity-of-virtue examination and
  `334d-338e` holding the short-answer / long-speech struggle. The poem itself
  begins at `339a` and continues through `347a`; `347b` explicitly rejects
  poetry as a substitute for direct conversation.
- The pleasure-and-measurement sequence begins in the `351b` transition and is
  carried by `351c-358a`; the final reversal is anchored at `358b-360e` for the
  courage-knowledge argument, then `361a-362a` for Socrates's
  explicit reversal of the teachability positions and departure. The spine is
  contiguous and strictly non-overlapping from offset `0` through `109160`.

## Correction and decision

The first-pass draft misassigned Simonides and pleasure themes to otherwise
correctly bounded spans. After source-map review, blocks `0011`, `0013`,
`0014`, and `0015` were rewritten: `0011` now remains with unity of virtue,
`0013-0014` track the poem, and `0015-0016` mark the return to direct
conversation and the later pleasure/measurement sequence.

Accept all eighteen section blocks. They cover the complete dialogue in
ascending source order and keep the dramatic prologue, Great Speech,
teachability, Simonides, short/long-answer struggle, hedonism/measurement,
courage/knowledge, and closing reversal as distinct teaching units. No
non-section interruption was warranted. No neutral ledger, code, config,
generated aggregate, audit, or campaign artifact was changed.

## Verification

- `validateCommentaryLedger("wiki/commentary/protagoras.md", ..., buildCommentaryCitationIndex())`: **0 issues**.
- `git diff --check` on the two Protagoras files: **clean**.

## Counts

- reviewed: 18
- accepted: 18
- rejected: 0
- needs_split: 0
- corrected prose: 0
- added blocks: 18
