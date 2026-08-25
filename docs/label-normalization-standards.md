# Label Normalization Standards

## Purpose

Use these standards for every global label-normalization pass in this Plato
wiki. The goal is not to minimize label count. The goal is to produce reusable
feature labels whose clusters help a reader compare the same textual function
across passages and dialogues.

These rules apply to humans, Codex agents, subagents, and model harness runs.
Harness-facing skills should preserve these rules rather than inventing a
separate merge standard.

## Authority

This file is the canonical policy artifact for label normalization. The
project-local Pi skill at `.pi/skills/plato-label-normalization/SKILL.md` is a
loadable execution guide, not a competing standard. If a prompt, skill,
subagent instruction, or harness summary conflicts with this document, this
document wins.

Harnesses may attach or quote this file directly. They should not replace it
with a looser paraphrase, a string-similarity heuristic, or an unreviewed model
judgment.

## Operating Principles

- Records before readings: observation ledgers preserve local, cited records;
  normalization only changes the reusable labels attached to those records.
- Function before topic: a label names what the passage is doing textually, not
  merely what it mentions.
- Local detail stays local: names, images, scenes, and one-time turns belong in
  `observation`, `textual_basis`, `limits`, `source_ref`, and `greek_terms`
  unless they are themselves the repeatable function.
- Reviewability before speed: every current label receives an explicit
  `keep` or `merge` disposition in a merge map.
- Hard cutover after acceptance: once a merge map is applied, old labels do not
  remain as aliases in observation ledgers.
- Corpus-snapshot completeness: a pass should fully normalize the corpus
  snapshot it was built from. New dialogues or new reviewed records can create
  legitimate future normalization work.

## Reusable Agent And Harness Contract

Use this section as the minimum reusable contract for Codex agents, subagents,
and Pi harness runs. A runner may attach this whole file, or it may load the
project-local skill and this file together. It must not replace these rules
with a local paraphrase that changes the merge standard.

Required inputs:

- this standards document
- `.pi/skills/plato-label-normalization/SKILL.md`
- `wiki/label-audit.md`
- the active `wiki/label-consolidation/<date>.json` merge map
- the relevant `wiki/observations/*.md` ledgers

Required behavior:

- decide by feature family, not by global string similarity
- assign exactly one `keep` or `merge` disposition to every current label
- use `todo` only as an unaccepted draft state
- write merge reasons that name the shared textual function
- write keep reasons that name the distinct textual function or split pressure
- preserve local passage detail in observation fields instead of encoding it in
  labels
- stop before apply if the map is incomplete, the standard is missing, or
  validation reports failures

The reusable output is the merge map, not a model summary. A harness may ask a
model for proposed dispositions, but persisted normalization decisions must be
explicit map entries validated by `bun run harness labels validate`.

## End State

The normalized corpus should have:

- observation records that remain local, checkable, and source-bound
- feature labels that name repeatable textual functions
- cluster files whose members are genuinely comparable
- passage-specific content preserved in `observation`, `textual_basis`,
  `limits`, `source_ref`, and `greek_terms`
- no legacy aliases in observation ledgers after an accepted merge

Good normalization makes clusters useful. Bad normalization only reduces the
number of labels.

## Label Meaning

A feature label should answer:

```text
What textual function is this observation recording?
```

It should not answer only:

```text
What topic, person, scene, or doctrine appears here?
```

Use lower snake case labels. Prefer compact names that can recur:

```text
definition_revised_after_objection
analogy_rejected_as_insufficient
myth_set_off_from_argument
knowledge_disavowal
```

Avoid labels that encode only passage location, one-time scenery, or a local
summary:

```text
cephalus_old_age_wealth_argument
phaedo_final_poison_scene
republic_book_ten_soul_claim
```

Names may contain a person, image, or named case only when that identity is the
repeatable feature itself, as in prosopography or a formally recurring image.

## Cross-Dialogue Labels

In this project, a cross-dialogue label is a reusable comparison handle. It can
be used across different dialogues, across different passages in one dialogue,
or initially on a singleton whose textual function is clearly repeatable.

Cross-dialogue does not mean the label must already occur in multiple
dialogues. It also does not mean the label should become a broad topic bucket.
The test is whether a future observation could reuse the label because it
performs the same textual function.

## Merge Rule

Merge labels only when all of these are true:

- the labels are in the same feature family, unless the map explicitly marks
  and justifies a family change
- the labels name the same repeatable textual function
- passage-specific detail survives in the observation fields
- the merged cluster would help comparison rather than hide a distinction
- the rationale explains the shared textual function

Do not merge merely because labels share:

- a topic
- a character
- a dialogue section
- a doctrine
- similar wording
- the same broad seed family
- a desire to reduce singleton count

## Keep Rule

Keep a singleton when it records a structurally distinct textual function or
when merging would make a cluster less informative.

Valid keep reasons include:

- the label marks a distinct speech act, frame device, method step, or
  argument role
- the family is too sparse to decide without losing useful granularity
- the observation is reviewed as `needs_split` and should be resolved before
  label merging
- a possible target label is only topically related

A keep reason must say why the function is distinct. "Only one observation"
is not a reason.

## Cluster Quality

After a merge, a cluster should pass this test:

```text
Could a reader compare every member of this cluster using the same question?
```

Examples of good comparison questions:

- How does the dialogue introduce a definition and then test it?
- How does a craft analogy license or fail to license an argument?
- How does the speaker mark a myth as separate from strict argument?
- How does a frame device control access to the reported conversation?

If a cluster would need multiple unrelated questions, do not merge those
labels. If a cluster becomes very large, prefer sharper sublabels over a broad
bucket.

## Decision Procedure

For each feature family:

1. Read the labels with their observation ids and spans.
2. Group labels by repeatable textual function, not by surface wording.
3. Choose or create target labels that a future ingest could reuse.
4. Verify that any detail removed from a source label remains in the observation
   fields.
5. Ask one comparison question for the proposed target cluster.
6. Merge only if every source label fits that question.
7. Keep labels that are structurally distinct, unresolved, or attached to
   `needs_split` records.
8. Validate the family before moving on.

## Family Boundaries

Families are stronger than labels. Prefer merging within a family. Crossing
families requires an explicit family-change rationale and should usually mean
one of these:

- the original family was a passthrough family that should fold into a seed
  family
- two families duplicate the same record type
- a label was assigned to the wrong family during ingest

Do not use family changes to hide uncertainty. If the family boundary is
unclear, keep the label and write the uncertainty into the merge-map reason.

## Harness And Subagent Contract

Any Codex subagent, Pi harness, or other model runner doing label normalization
must:

- load this standards document and the project-local label-normalization skill
  before proposing or applying merges
- use `wiki/label-audit.md`, `wiki/observations/*.md`, and the merge-map file
  as the decision surface
- avoid translation files unless the user explicitly asks for human comparison
- treat model proposals as drafts until `labels validate` passes
- leave observation prose, source refs, Greek terms, limits, review status, raw
  sources, and transcripts untouched during label normalization
- stop rather than apply if the standards document is missing, the map is
  incomplete, or validation reports non-todo failures

Harnesses may use model help to draft dispositions, but the persisted artifact
must be a deterministic merge map with one explicit disposition per current
label. No hidden, implicit, or prompt-only merge decisions are acceptable.

## Apply Boundary

The merge apply step may rewrite only:

- `feature_family`
- `feature_label`
- `feature_id`
- `wiki/features-so-far.md`
- derived artifacts such as `wiki/label-audit.md`, `wiki/clusters/*.md`, and
  `site/`

It must not edit:

- `observation`
- `textual_basis`
- `limits`
- `source_ref`
- `greek_terms`
- `review_status`
- raw source files
- transcript artifacts

Apply is a hard cutover. Do not keep alias labels in observation ledgers after
the merge map is accepted.

## Review Checklist

For each proposed merge:

- Does the target label name a textual function?
- Would every source label answer the same comparison question?
- Does the rationale say more than topic similarity?
- Does the observation text preserve the detail removed from the label?
- Would a future ingest know when to reuse the target label?

For each keep:

- Is the function structurally distinct?
- Is the reason stronger than "this is a singleton"?
- Would merging make the target cluster less useful?
- If the record is `needs_split`, is the split being deferred explicitly?

## Final Gates

After applying any batch:

```bash
bun run harness labels validate wiki/label-consolidation/<date>.json --family <feature_family>
bun run harness labels audit --write
bun run harness clusters --write
bun run validate
```

After the full pass:

```bash
bun run harness labels validate wiki/label-consolidation/<date>.json
bun run harness labels audit --write
bun run harness clusters --write
bun run harness clusters --write
bun run harness site
bun run test
bun run typecheck
bun run validate
git diff --check
```

The second cluster write should be byte-stable.
