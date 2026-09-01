# Ontology Audit Protocol

## Purpose

The ontology audit package freezes one exact corpus snapshot and gives every
source unit, semantic record, concept assignment, and graph edge one durable
audit target. It is provenance for the full corpus audit, not a workflow log
and not evidence that semantic review has occurred.

Greek files under `raw/plato/greek/` are the only source text used by this
lane. Translation files and English-derived indexes are excluded.

## Package identity

Each package lives at:

```text
wiki/ontology-audits/sha256-<corpus-digest>/
```

The digest is SHA-256 over the sorted sequence of canonical input path, a NUL
byte, and that path's byte hash. `manifest.json` also binds the exact baseline
Git commit and tree, every canonical path hash, every Greek source hash, the
protocol and schema implementation hashes, inventory counts, projection
hashes, and every partition's byte and key-set hashes.

Packages are content addressed. Generation refuses to replace an existing
package file with different bytes.

## Strict files

Every JSON object rejects unknown fields. JSONL files contain exactly one JSON
object per nonempty line and are parsed with `JSON.parse`; fenced Markdown and
pseudo-YAML are not audit formats.

```text
manifest.json
source-units.jsonl
record-units.jsonl
concept-membership-units.jsonl
graph-units.jsonl
findings.jsonl
adjudications.jsonl
acceptance.json
```

Owned keys are partitioned as follows:

- `source:<dialogue>:<start-char>-<end-char>` belongs to source units.
- `record:<lane>:<stable-id>` belongs to record units.
- `axis:*`, `concept:*`, and `membership:*` belong to the concept-membership
  partition.
- `edge:*` belongs to graph units.

References are foreign keys, not second ownership occurrences.
`adjudications.jsonl` is a decision table keyed by `target_key`; it does not
take ownership of the target.

`findings.jsonl` is the normalized defect register for both source passes. A
finding binds one reviewer and pass to one or more exact source-unit keys and
one or more owned audit targets. Finding IDs are provenance keys, not owned
semantic keys. Every finding referenced by a completed source pass must occur
exactly once in this register, and unreferenced findings are invalid. The
reverse binding is also mandatory: every finding must be cited by its declared
pass on at least one of the source units it names, every pass-to-finding
reference must bind that exact unit, and every finding must be cited by the
adjudication of every target it names. An adjudication may cite only existing
findings that name that exact target.

Status-changing migration inputs are immutable JSONL artifacts under
`review-inputs/`. Atomic-split rows cover the exact eligible accepted-record
set and give every replacement one neutral fact plus an explicit, contained
Stephanus span. Source-omission rows cover every omission finding exactly once,
bind the correct frozen source-unit keys, and state one or more atomic
observations with explicit spans. A misattached omission finding may be
reclassified into this lane; it may not widen or falsify the source interval of
an otherwise valid record. Both overlays and the terminal decision table are
content-addressed and named in the canonical remediation receipt.

## Baseline partition

The generator inventories observations (including rejected records), claims,
relations, commentary, voices, apparatus, recording manifests, reported-turn
scopes, feature concepts, observation-to-concept assignments, and explicit
graph links. Generated clusters, dossiers, label reports, derived indexes, and
metrics are hash-bound projections rather than peer semantic records.

Every current observation assignment occurs once as a membership row. The
feature registry's observation lists are recorded by a membership key-set
digest so their mechanically duplicated presentation can be checked without
owning the same edge twice.

`baseline-evidence.json` proves which frozen presentations are deterministic
projections instead of merely asserting that classification. It binds the
baseline commit, tree, corpus digest, lockfile, terminal results and hashed
logs for `bun run test`, `bun run typecheck`, `bun run validate`, and
`git diff --check`. Historical validation failures remain explicit terminal
results; they are never rewritten as passes.

The evidence generator checks out the exact baseline commit in two independent
isolated temporary clones, removes only the declared projection artifacts, and
runs the repository's exact projection generators in each. Both runs must
recreate the complete declared path set with byte-for-byte equality to the
frozen snapshot and to each other. The legacy feature registry's complete
observation lists must also equal the audited legacy membership rows by
concept. The six frozen files that are generator inputs or static
documentation are bound under `baseline.support_inputs`; they are not claimed
as generated projections.

Relations remain record audit targets regardless of review status. Only a
currently accepted relation produces a baseline semantic relation edge;
rejected review decisions do not become semantic edges. Later adjudication may
reject an accepted schema-compliance fiction without losing the baseline
record.

## Source review

Source units are exact Greek Stephanus-marker byte intervals. When a source
contains bytes before its first marker, one explicit `(preamble)` unit owns
that interval; the baseline therefore counts 7,766 marker units plus six
preamble units. Per source file, all character intervals must begin at zero,
be contiguous without overlap, and end at the source byte-string length. Each
unit stores its own text hash and the key-set digest of overlapping records.

Each unit requires two source-first passes over the identical
`reviewed_input_sha256`. Reviewers must be distinct. A completed pass records
either `zero_result` with no finding IDs or `findings` with one or more finding
IDs. Matching normalized finding sets may reconcile as `agreed`; disagreement
requires `adjudicated`, a rationale, and explicit adjudication IDs. A pending
pass or reconciliation is never interpreted as a zero-result.

## Item adjudication

Every record, axis, concept, membership, and edge has exactly one adjudication
row. The generated package uses `state: "pending"`, null terminal fields, and
no replacement targets. This is honest scaffolding, not a completed review.

Completed actions are constrained by target kind:

- records and edges: `valid_as_is`, `revise`, `split`, `merge_duplicate`,
  `retype`, `reject`, or `retire`;
- axes and concepts: `ratify`, `redefine`, `split`, `merge`, `retype`, or
  `retire`;
- memberships: `keep`, `move`, `add`, `drop`, or `split`.

Terminal decisions require a meaningful rationale and an existing receipt
whose content-addressed artifact bindings all resolve and match their recorded
hashes. On acceptance, the hashed closure receipt also binds the exact bytes of
every distinct adjudication receipt. Actions that change identity require
explicit replacement targets, and every replacement must be live in the final
canonical set. Source-unit additions likewise name the new live source-bound
records that close the omission.

## Acceptance

`acceptance.json` is initially `pending`. Pending acceptance must not claim a
receipt, final digest, completed source passes, completed reconciliation, or
completed adjudication.

An `accepted` package is valid only when all source passes and reconciliations
are complete, every target has a terminal adjudication, baseline and final sets
are exact, no stale aliases or rejected-reader leaks remain, a receipt and
final corpus digest are bound, and two clean regenerations have the same tree
hash. Acceptance changes `manifest.audit_state` to `accepted`, changes every
nonempty lane to `complete`, and retains `zero_result` only for empty lanes; an
accepted package containing any contradictory pending manifest, lane, or item
state is invalid. The hashed closure receipt binds `regeneration.json`,
`closure-evidence.json`, and every terminal decision receipt. The verifier
recomputes the regeneration digest from its artifact list, compares every
canonical generated artifact descriptor with the current derived, cluster, and
dossier bytes (temporary site artifacts remain hash-bound by the receipt), and
requires every machine-evidence issue set to be empty. The verifier fails
closed on any false acceptance claim.

## Commands

```bash
bun run harness ontology-audit generate
bun run harness ontology-audit baseline-evidence
bun run harness ontology-audit semantic-plan --atomic-split-overlay <path> --source-omission-overlay <path>
bun run harness ontology-audit hard-cut --atomic-split-overlay <path> --source-omission-overlay <path>
bun run harness ontology-audit close
bun run harness ontology-audit verify
bun run validate
```

Generation is deterministic and idempotent for unchanged corpus bytes.
Validation verifies the package automatically.
