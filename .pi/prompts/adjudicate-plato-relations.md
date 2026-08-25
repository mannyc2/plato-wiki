# Adjudicate Plato Relations

Relation scope: `$1`

Target candidate keys:

```text
$2
```

Target candidate pairs and claim records:

```text
$3
```

Adjudicate only the target candidate keys. The candidate pair records and the full
claim records are injected above; do not read repository files, run shell
commands, grep, list files, or scan outside the target pairs. Use
`wiki_source_span` only when a resolving span must be cited. Persist decisions
only with `wiki_append_relations` for `wiki/relations/$1.md`.

Write exactly one relation record for each target candidate key. The canonical
writer assigns `relation_id` and the unique ledger `pair_id`; do not use the
positional diagnostic pair id as an identity.

Relation kinds:

- `contradiction`: the two claim contents cannot both stand as stated.
- `tension`: the claims pull against one another but are not formally
  contradictory as stated.
- `revision`: one claim restates the other with a substantive modification.
- `restatement`: the same content recurs.

Resolutions:

- `refuted_resolved`: at least one linked claim has final_status
  `refuted`, `withdrawn`, or `revised`; cite the resolving span.
- `standing`: both linked claims have final_status `left_standing`; state
  the checked scope in `limits`.
- `verbal_only`: an explicit distinction dissolves the apparent conflict;
  cite the distinguishing span.
- `superseded`: a revision replaces the earlier claim.

If the candidate is not a real relation, still write a relation decision with
`review_status: rejected`, a concise `basis` naming why the pair is not a
relation, and a `limits` sentence. Keep `relation_kind` and `resolution` at the
closest narrow values allowed by the schema; do not invent enum values.

For `refuted_resolved` and `verbal_only`, include:

```yaml
resolution_ref:
  stephanus_span: ""
  source_ref:
    source_path: raw/plato/greek/<dialogue>.txt
    stephanus_span: ""
    start_marker: ""
    end_marker: ""
    start_char: 0
    end_char: 0
    text_sha256: ""
```

Record shape:

```yaml
relation_id: rel_$1_0000
claim_a: claim_dialogue_0000
claim_b: claim_dialogue_0000
relation_kind: tension
resolution: standing
basis: ""
limits: ""
review_status: unreviewed
```

Do not infer speaker intent. Do not add interpretive synthesis.
