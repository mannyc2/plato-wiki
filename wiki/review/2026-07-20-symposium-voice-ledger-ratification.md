# Symposium Voice-Ledger Ratification — 2026-07-20

## Authorization

On 2026-07-20 the operator delegated steps 1–2 of the Symposium voice review
to parallel Codex subagents, including authority to review and ratify the voice
records. This note records the completed voice-ledger portion of that delegated
review. It does not authorize derivation of a voice authority artifact, voice
joins, claim-speaker migration, or any later cutover step.

## Review method

The complete ledger was reviewed from `raw/plato/greek/symposium.txt` under the
formula-evidence rules in `docs/voices-protocol.md`. Reviewers checked the
character ranges, source and span hashes, nesting, voice-chain prefixes,
reported-speech formulas, grammatical cues, exchange bounds, and explicit
unresolved reasons. Attribution by content, expected doctrine, translation,
commentary, and assumed dialogue alternation was excluded.

Candidate construction and correction were separated from independent review.
After the correction passes, two disjoint final review waves covered the whole
ledger. Each wave rechecked its assigned records against the canonical Greek
source, and both returned zero findings on the final candidate. The reviewed
pre-ratification candidate contained 168 records and had SHA-256
`f8572400b39ed8343554562a1e517ac8f5b5621b61f42db9b05ea2961cda1efd`.

## Decision

Accept all 168 records as one atomic review cohort:

- 94 `resolved` records carry text-internal evidence that licenses the stated
  voice owner; and
- 74 `unresolved` records preserve the places where the Greek text does not
  license an innermost owner under this protocol.

Acceptance ratifies both sides of that distinction. It does not fill an
unresolved interval by judgment, and it does not treat uncertainty as a defect
to be silently inherited from the enclosing speaker. The 168
`review_status` values therefore change mechanically from `unreviewed` to
`accepted`; no record geometry, evidence, hash, chain, resolution, or limits
field changes.

## Boundary

The status decision changed no Greek source, turn, observation, claim,
relation, commentary, record geometry, or attribution evidence. A narrow
post-ratification safeguard updated the live-ledger header and made the
candidate generator refuse to overwrite a reviewed cohort; its regression test
now inspects generated candidate output separately from live review status. The
generator was not allowed to rewrite this ledger. No `.toon` authority artifact
was derived, no voice join was materialized, and no claim speaker was migrated.
Those actions remain outside this review boundary.
