# Review Plato Relations

Relation scope: `$1`

Target relation ids:

```text
$2
```

Target relation records:

```text
$3
```

Review only the target relation ids. The full target relation records are
injected above; do not read repository files, run shell commands, grep, list
files, or scan outside the target records. Use `wiki_source_span` only when a
cited resolving span needs checking. Do not rewrite the ledger. Persist
decisions only with `wiki_update_relation_review_statuses` for
`wiki/relations/$1.md`.

Set each target relation to exactly one status:

- `accepted`: the relation kind, resolution, basis, limits, linked claim ids,
  and any resolution_ref are supported by the injected records and cited span.
- `rejected`: the pair is not a real relation, the basis is unsupported, or
  the resolution cannot be verified.
- `needs_split`: the record combines more than one relation decision or needs
  a narrower pair decision.

Checks:

- `pair_id` is a writer-assigned ledger diagnostic and must remain unchanged.
- `basis` must describe the relation between the two claim contents without
  intent language.
- `standing` requires both claims to be left standing and `limits` must name
  the checked scope.
- `refuted_resolved` requires a refuted, withdrawn, or revised linked claim and
  a verifying `resolution_ref`.
- Leave non-target relation ids unchanged.

When all target relation ids have `accepted`, `rejected`, or `needs_split`,
stop.

Do not add interpretive synthesis.
