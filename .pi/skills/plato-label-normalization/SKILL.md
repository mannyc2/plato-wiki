---
name: plato-label-normalization
description: Normalize Plato wiki feature labels, cross-dialogue labels, merge maps, and cluster labels after ingest by merging only repeatable textual functions while preserving source-bound observation records. Use for Codex, subagent, or Pi harness label-normalization runs.
---

# Plato Label Normalization

Use this skill when planning, validating, or applying feature-label merges in
this repository.

The canonical standard is `docs/label-normalization-standards.md`. Load that
document before making merge decisions. This skill is a short execution guide
for harness and agent runs; the standards document wins if anything conflicts.

If a runner needs a compact reusable contract, use the "Reusable Agent And
Harness Contract" section in `docs/label-normalization-standards.md`. Do not
substitute a different merge policy in a prompt or harness summary.

## Goal

Normalize labels so clusters compare the same textual function across
observations. Do not optimize for the smallest possible number of labels.

## Core Rules

- Labels name repeatable textual functions, not topics, characters, scenes, or
  doctrines by themselves.
- A cross-dialogue label is a reusable comparison handle; it does not need to
  already appear in multiple dialogues.
- Passage-specific detail belongs in `observation`, `textual_basis`, `limits`,
  `source_ref`, and `greek_terms`.
- Merge only when the merged cluster would help comparison.
- Keep singleton labels when they mark structurally distinct textual functions.
- Do not merge because of string similarity, same topic, same character, same
  dialogue section, or label-count pressure.
- Prefer merges within a feature family. A family change requires an explicit
  rationale.
- Treat `needs_split` records as split work first; do not hide split pressure
  with a broad merge.
- Complete the corpus snapshot represented by the current audit. Future new
  ledgers may legitimately require another normalization pass.

## Required Inputs

Use these files as the decision surface:

- `docs/label-normalization-standards.md`
- `wiki/label-audit.md`
- `wiki/label-consolidation/<date>.json`
- `wiki/observations/*.md`

Do not use translation files during normalization unless the user explicitly
asks for human comparison.

## Reusable Contract

Any Codex agent, subagent, or Pi harness using this skill must preserve the
project contract:

- load the standards document and this skill before proposing merge-map entries
- make one explicit `keep` or `merge` decision for every current label
- treat `todo` entries as unaccepted draft work
- write merge reasons around shared textual functions, not shared topics
- write keep reasons around distinct textual functions or unresolved split
  pressure
- persist decisions only in the merge map
- stop before apply when validation fails

## Workflow

1. Validate that every current label appears exactly once in the merge map.
2. Work family by family.
3. For each label, choose `keep` or `merge`; do not leave implicit decisions.
4. For every merge, state the shared textual function.
5. For every keep, state the structurally distinct function or unresolved split
   pressure.
6. Run `labels validate` before apply.
7. Apply as a hard cutover only after validation passes.

## Merge Rationale

Every merge must state the shared textual function. A valid reason should make
clear why a future observation would reuse the target label.

Bad reason:

```text
Both labels are about the soul.
```

Good reason:

```text
Both labels mark an analogy that is introduced and then rejected as
insufficient support; the local image remains in the observation text.
```

## Apply Boundary

The apply step may rewrite only:

- `feature_family`
- `feature_label`
- `feature_id`
- `wiki/features-so-far.md`
- derived artifacts

Do not edit observation prose, textual basis, limits, source refs, Greek terms,
review status, raw source files, or transcript artifacts.

Apply is a hard cutover. Do not preserve legacy aliases in observation ledgers.

Model-written dispositions are drafts until the harness validates them. Stop
instead of applying if the standards document is missing, the merge map is
incomplete, or validation reports non-todo failures.

## Completion Checks

After a merge batch, run:

```bash
bun run harness labels validate wiki/label-consolidation/<date>.json --family <feature_family>
bun run harness labels audit --write
bun run harness clusters --write
bun run validate
```

After the full normalization pass, run:

```bash
bun run test
bun run typecheck
bun run validate
git diff --check
```
