# Review Plato Claims Segment

Dialogue: `$1`

Target claim ids:

```text
$2
```

Target claim records:

```text
$3
```

Review only the target claims. The full target claim records are injected
above; do not read repository files, run shell commands, grep, list files, or
scan outside the target records. Use `wiki_source_span` only when a cited span
needs checking. Do not rewrite the ledger. Persist decisions only with
`wiki_update_claim_review_statuses` for `wiki/claims/$1.md`.

Set each target claim to exactly one status:

- `accepted`: the cited spans verify the claim, speaker, stance events, and
  mechanically derived `final_status`.
- `rejected`: the record is not supported by its cited spans or contains
  interpretive content that cannot be made local.
- `needs_split`: the record joins multiple claims, merges distinct speakers,
  or needs more than one claim record.

Checks:

- `content` must restate the cited span in English and must not contain Greek.
- Greek script belongs only in `greek_terms`.
- Each stance event must be checkable at its own cited span.
- `final_status` must follow from the last stance event kind.
- `limits` must state what the record does not establish; for
  `left_standing`, it must name the checked scope.
- Leave non-target claim ids unchanged.

When all target claim ids have `accepted`, `rejected`, or `needs_split`, stop.

Do not add interpretive synthesis.
