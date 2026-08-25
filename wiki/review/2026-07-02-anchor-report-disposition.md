# 2026-07-02 Anchor Report Disposition

Disposition of the single advisory row in the missing-obvious-features
report (`bun run harness anchors`, the anchor lexicon rollout) as of commit 26059ea. This
note changes no review_status values, so per AGENTS.md no ingest-log entry
accompanies it.

## Row

| dialogue | marker | chars | anchors | groups | accepted observations |
|---|---|---:|---:|---|---:|
| sophist | 247a | 59892-60270 | 3 | assent_concession=3 | 0 |

## Analysis

The three `ναί` occurrences are at chars 59905, 60138, 60233:

- 59905 - `ΘΕΑΙ. ναί.` - real assent turn.
- 60138 - `ΘΕΑΙ. ναί, καὶ ταῦτα σύμφασιν.` - real assent turn.
- 60233 - inside `εἶναί` (`...πάντως εἶναί τι φήσουσιν`) - false
  positive: the anchor lexicon matches exact substrings without word
  boundaries (a deliberate anchor-lexicon constraint), and `ναί` is the tail of
  `εἶναί`.

Real assent tokens in the section: 2, below the report's
`min_anchor_count: 3` threshold. The row exists only because of the
in-word match. The adjacent argumentative stretch is charted: three
accepted records span 247b-247c (`obs_sophist_0161`,
`obs_sophist_0162`, `obs_sophist_0163`); sophist char coverage is 96.3%
with gap_count 0.

## Decision

Accepted residue. No gap-fill ingest run is warranted for 247a: the
anchor-dense reading of the section is an artifact, and its two real
assents sit inside an exchange whose substance is covered from 247b. The
row stays in the generated report (the report is advisory and regenerated
deterministically); this note is the standing disposition. Revisit only
when the Greek token index (BACKLOG Priority 3) enables word-boundary
anchor matching - at which point the row disappears on its own.

## 2026-07-03 Follow-up

The Greek token index and token-backed anchor occurrence index now exist.
After regenerating anchors with token-window matching,
`bun run harness anchors` prints `(none)`: the Sophist 247a row disappeared
because `ναί` inside `εἶναί` is no longer a word-boundary anchor match.
