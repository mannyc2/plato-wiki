# Wiki Browser Design

## Purpose And Authority Boundary

The browser is a read-only static projection of validated source-bound records
and ontology vNext. It may organize and render canonical data, but it never
creates semantic classifications, resolves review questions, or becomes a peer
ontology. Domain parsing and validation live in `packages/harness`; the CLI only
dispatches `bun run harness site --out-dir <path>`.

## Canonical Inputs

- `wiki/observations/*.md`: source-bound textual facts and exact Greek anchors.
- `wiki/ontology/{axes,concepts,memberships}.jsonl`: comparison questions,
  answer concepts, and many-to-many assignments.
- `wiki/claims/`, `wiki/relations/`, `wiki/commentary/`, and `wiki/voices/`:
  dependent reviewed semantic lanes.
- `wiki/clusters/*.jsonl` and `wiki/dossiers/**/*.json`: validated disposable
  projections of canonical ontology rows.
- `derived/plato/`: deterministic source, turn, voice, anchor, and metric views.

The site uses the strict canonical readers and validates cluster and dossier
identity before rendering. It has no compatibility reader or fallback
classification path.

## Reader Visibility

Rejected semantic records never receive public pages, search entries, or exact
ID entries. Closure requires terminal live statuses, so a closed site build
contains only accepted reader-visible semantic records. Missing membership,
rejection, and an empty projection cell do not mean absence or counterevidence.

Greek excerpts are display-only slices resolved from `source_ref` and checked
against `text_sha256`; ledgers continue to store references rather than copied
passages. Every record page retains stable canonical-ID anchors.

## Page And Index Inventory

- corpus index, about, license, quality, and weak-spots pages;
- dialogue records, reading pages, source structure, turns, claims, and
  relations;
- axis pages keyed by `axis_key` and concept pages nested under their axis;
- generated cluster and dossier pages;
- anchor, pattern, reading, and optional accepted-audio views; and
- sharded exact-ID and full-text search indexes over reader-visible records.

The quality page reports axes, concepts, memberships, cross-dialogue concepts,
singletons, and accepted-observation membership coverage from the validated
ontology model.

## Deterministic Build

`packages/harness/src/site/` owns data loading, rendering, search/index
construction, and generated-site validation. A build validates selected inputs,
replaces the output directory, writes static HTML/CSS/JavaScript and bounded
index shards, then checks duplicate IDs, links, fragments, file-size limits,
external URLs, and any selected recording hashes.

Generated site files are not a canonical data source. Rebuild them from the
tracked semantic lanes and require two clean consecutive builds to be
byte-identical for ontology closure.

## Verification

Run:

```bash
bun run harness clusters --write
bun run harness dossiers --write
bun run harness site --out-dir <path>
bun run test
bun run typecheck
bun run validate
```

Publication and deployment remain separate authorization gates after a local
site build validates.
