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

## Post-acceptance final adjustments

Any record or edge change after an accepted audit uses one hard-cut
final-adjustment package. It may not fall back to the earlier semantic or
concept receipt. The directory
`review-inputs/final-adjustments/` contains exactly five regular files and no
directories, symlinks, aliases, or extras:

- one `sha256-<hash>-decisions.jsonl` table;
- one `sha256-<hash>-prior-state.json` binding;
- three `sha256-<hash>-prior-*.jsonl.gz` files preserving the exact accepted
  record, graph, and adjudication partition bytes.

Every gzip file is replayed. Its compressed bytes must match its filename and
declared hash, its uncompressed bytes must match the accepted partition hash,
and every embedded prior final pointer and superseded adjudication must occur
exactly once in the appropriate replayed partition (or be provably absent for
a new target). The prior-state artifact also embeds the exact accepted
`acceptance.json` bytes and binds the three accepted partition hashes. Its
acceptance path must name this exact audit package, and all acceptance and
partition paths are normalized repo-relative paths with no empty, dot, parent,
or alias segments. Opaque orphan hashes are not sufficient provenance.

Each decision binds the exact prior final-pointer hash, expected new
final-pointer hash, and superseded-adjudication hash. Its required
`provenance_chain` is the ordered history of post-acceptance review stages.
Every stage binds its own action, prior and expected pointer hashes, source
receipt, and sorted durable evidence artifacts. The first stage must begin at
the decision's preserved prior pointer, every adjacent pair must join on the
same exact pointer hash, and the last stage must end at the decision's expected
current pointer. Reordering, omitting, or silently overriding a stage therefore
breaks the chain. Scratch paths are never durable evidence.

The canonical stage kinds are `commentary_reconsideration`,
`commentary_structural_review`, `commentary_sample_failure`,
`relation_semantic_fiction`, and the strict receipt-bound
`ontology_item_review`. There are no flat-receipt or evidence aliases. A
commentary reconsideration may revise a rejected record to the exact accepted
intermediate pointer and add its exact reviewed raw citation edges. If a later
structural or independent-sample review rejects that same record, its rejection
is a later stage whose prior pointer is that accepted intermediate pointer. The
underlying receipts must independently prove the corresponding commentary
ledger hash sequence; a matching pointer hash alone is insufficient.

A single canonical final-adjustment receipt reciprocally hash-binds the
decision table, prior-state artifact, all three preserved partitions, every
stage receipt and canonical submission, and the complete reviewed evidence.
The closure receipt in turn binds this entire set.

Structural review evidence preserves every contributing complete audit object.
The embedded object retains the review schema's property order so
`JSON.stringify(audit, null, 2) + "\n"` must replay its declared reviewed-output
SHA-256. Sequential reviewed batches may reuse a scratch unit/path only when
the durable evidence preserves each distinct output hash, submission, and
receipt version; operation IDs remain unique and target coverage is exact.

Rejected-commentary reconsideration evidence uses one content-addressed
manifest with exactly three dialogue-specific bundles in canonical order:
`review_output`, `review_packet`, and `review_schema`. Each bundle embeds the
exact bytes and SHA-256 of every isolated one-block invocation. Entries align
by commentary ID, outcome, and attempt number; zero or more contiguous
`superseded_failed_attempt` entries precede exactly one `terminal_pass` for
every receipt target. Failed attempts remain durable evidence and may never be
dropped or treated as passes. The verifier replays every embedded result,
packet, and schema, requires the three entry sequences to be identical,
checks each terminal result against its exact schema, and reconstructs the
accepted citation-edge set from the terminal packet's rejected-form copy of
the now-accepted commentary block. It also requires the exact canonical Greek
source hash and span, byte-identical accepted citation records, and an
aggregate all-pass result matching the receipt IDs, reviewer, rationale, and
terminal findings. Scratch source paths are descriptive only; the durable
embedded bytes are the authority. Dialogue-wide or unbundled compatibility
artifacts are not accepted.

Independent-sample rejection stages bind one canonical content-addressed
sample evidence bundle and its normalized rejection submission. Verification
historically replays the exact pending manifest, commentary ledger, sample
packet, output schema, model catalog, prompt, provider output, state, and
execution receipt; reconstructs the exact failed commentary IDs and rationales;
and requires the source receipt and submission to encode the same accepted to
rejected ledger transition. Multiple sequential batches for one dialogue form
one unbranched hash chain ending at the current commentary ledger. Earlier
batches remain verifiable after later batches and may not be collapsed into the
latest receipt.

The action names the structural transition from the previously accepted final
set. `add` is null to live, `retire` is live to null, `revise` is a changed
live nonrejected target, and `reject` is a changed live target whose new record
status is rejected. Structural transition takes precedence over status: a new
rejected record is `add`, with its final pointer independently carrying
`review_status: rejected`. All actual record/edge core-pointer deltas require
exactly one decision, unchanged targets require none, and partial application
is invalid. Binding accepts only the exact preserved pre-state or the exact
already-applied state; a second bind must reproduce identical adjudication
IDs, finding IDs, actions, rationales, receipts, and empty replacement lists.

Graph-unit rows are the baseline/final union of semantic links. Their immutable
baseline pointers preserve historical provenance, while their final pointers
name only links present in the live canonical graph. A rejected relation record
therefore remains review provenance in the record partition, but its formerly
accepted semantic edge has a null final pointer and an explicit `retire`
decision. Non-null edge pointers always carry `review_status: null`; owner
review status belongs to the record rather than edge identity.

After the first successful bind, both `manifest.json` and `acceptance.json`
set `final_adjustments.required: true` and bind the exact decision artifact,
prior-state artifact, and reciprocal receipt hashes. Removing or replacing
that package must then fail closed instead of resurrecting superseded semantic
decisions.

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
