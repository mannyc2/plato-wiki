# Ontology v2 Target: Authored Axes, Full Multi-Membership

> Ratified by Chris Carroll on 2026-09-07. This target
> supersedes the "Review and change control" section of
> `docs/ontology-vnext.md` for axis and concept edits, and it adds completeness
> families that `knowledge-base` must pass. Observation ledgers, claims,
> relations, voices, and the source-binding audit contract are unchanged.

This document defines the single "done" state of the comparison ontology.
It exists because the vNext migration changed the ontology's identity scheme
without changing its content, and the completeness gate currently reports the
result as READY.

## 1. Measured state at `3251e53`

All counts are from `wiki/ontology/*.jsonl`, `wiki/observations/*.md`,
`wiki/dossiers/`, and the audit package under `wiki/ontology-audits/`.

| Measure                                                                                         |                                  Value |
| ----------------------------------------------------------------------------------------------- | -------------------------------------: |
| Axes / concepts / memberships                                                                   |                    483 / 3,557 / 7,644 |
| Accepted observations                                                                           |                                 12,292 |
| Accepted observations with zero memberships                                                     |                            4,648 (38%) |
| Memberships per classified observation                                                          | exactly 1.000 (no observation has two) |
| Axes with one concept / one membership / one dialogue                                           |                        294 / 278 / 432 |
| Memberships held by the 11 largest axes                                                         |                            6,234 (82%) |
| Concepts with one membership / zero memberships                                                 |                      2,667 (75%) / 144 |
| Concept keys of six or more tokens                                                              |                              823 (23%) |
| Distinct `comparison_question` templates across 483 axes                                        |                  6 (one per dimension) |
| Distinct `definition` templates across 3,557 concepts                                           |                                      2 |
| Audit axis decisions sharing one byte-identical rationale                                       |                             471 of 505 |
| Axes that produce any dossier / any cross-dialogue dossier                                      |                                67 / 29 |
| Membership rows whose `assignment_basis` was regex-scrubbed to "the retired pre-cut assignment" |                            6,813 (89%) |
| Commentary dossier citations that will need a v2 successor                                      |            272 (164 distinct, 29 axes) |

Diagnosis, in one paragraph. The ontology is the July 2026 label registry
with SHA-256 identities and a string template applied to every question and
definition. The `subject_matter` dimension is 309 topic tags promoted to
first-class axes, including the Laws-only stratum that the 2026-07 singleton
memo had already measured as 71% "topic registry, not function." The concept
layer is snake-cased observation paraphrases. The membership layer is the
retired `feature_id` field: one classification per observation, and none for
38% of the corpus. The reader-facing comparison surface is 29 axes. The other
454 are counted by `CMP-COMPARISON` and contribute nothing a reader can see.

Two bottom-up passes (2026-07 adjudication, 2026-08 six-family normalization)
moved the singleton count from 2,900 to 2,837. Bottom-up merging does not
converge on this shape and is not the plan.

## 2. Goal

Replace, do not consolidate. Author a small catalog of comparison questions
top-down, enumerate each question's answer classes before admitting it, then
classify every accepted observation against the whole catalog in one
multi-label pass. Ship it as one hard cutover with one receipt and one
refreshed audit package, and gate the result so that `knowledge-base` cannot
report READY while the ontology is a tag list.

Done means:

- every axis question is authored: not derivable from any other question by
  substituting the axis key;
- every concept is an answer class: at least two members, which is already
  the reader-facing dossier threshold;
- **0** accepted observations without a membership or an explicit
  `no_axis_applies` disposition;
- multi-membership is real: every dialogue's memberships-per-observation
  ratio exceeds 1.0, and the independent sample pass (O4) measures how much
  the first pass missed rather than the target asserting a ratio;
- **0** membership rows with a scrubbed or templated basis;
- every canonical axis observed in **>= 3** dialogues;
- every one of these enforced by a completeness family whose failing leaves
  appear in `bun run harness job list`.

There is no target axis count or concept count. The catalog size is an
output of the admission rules in section 3, discovered in phase 1, recorded
in the phase-1 receipt, and ratified by the operator. After ratification the
O1 gate freezes that count as a ceiling. The ceiling is a regression lock
against the tail regrowing, not a goal the catalog is cut to fit. If a Laws
provision fits no question, disposition it; do not mint an axis for it.

## 3. Admission rules

These are the rules the catalog is written under. They are stricter than
`docs/ontology-vnext.md`; where they conflict, these win once this target is
signed.

**Axis.** An axis is admitted only with (a) exactly one dimension, (b) one
authored comparison question, (c) an enumerated closed set of at least three
answer classes written *before* any membership is assigned, and (d) a
credible expectation of members in at least three dialogues. If the answer
classes cannot be enumerated, it is not an axis. Fewer than three classes is
a tag or a binary, which belongs as a concept under a richer question. There
is no upper bound on classes; an axis whose enumerated set exceeds twelve is
sent back for a split review, because that usually means two questions are
sharing one key. If it is expected to draw from one dialogue, it is a topic,
and topics are what `subject_matter` concepts under a broader axis are for.

**Concept.** A concept is an answer class, named in at most four tokens, that
at least two accepted observations instantiate. A concept that describes one
passage is an observation paraphrase and is not admitted. A concept that
survives the membership pass with fewer than two members is deleted at
cutover; its observation keeps a membership in the nearest admitted class or
receives a disposition.

**Membership.** An observation is classified against every axis, not one. A
membership's `assignment_basis` names the textual feature in the observation
(a Greek term in `greek_terms`, a quoted verb, a named speaker act, a stated
provision) that places it in the class. Boilerplate, legacy-pair references,
and "matches the registry" are invalid bases.

**Question authorship.** Two axes' questions may not be identical after the
axis key's tokens are replaced by a placeholder. The same test applies to
concept definitions within an axis. This is the deterministic check for
templating and it is a validation error, not a warning.

**Hard cut.** One change set replaces `axes.jsonl`, `concepts.jsonl`, and
`memberships.jsonl`; regenerates clusters, dossiers, and site; remaps or edits
every commentary dossier citation; deletes
`canonicalMembershipAssignmentBasis` in
`packages/harness/src/wiki/ontology-concept-audit.ts`; and records one
receipt. No dual reader, no legacy alias, no v1 axes retained "for now."

**Out of scope.** Observation prose, spans, hashes, and review statuses.
Claims, stances, relations, voices. The Greek source inventory. The
source-binding portions of the audit package. Nothing in this target licenses
a re-extraction or a status change on an observation.

## 4. Gates

Each gate becomes one completeness family. A failing leaf is a job.

Ontology shape:

- [ ] O1 `CMP-ONTOLOGY-AXES` (global): axis count <= the count ratified in
  the phase-1 receipt; every axis has >= 3 concepts; every axis has
  memberships from >= 3 dialogues; no two normalized questions are equal;
  every axis has an authorship receipt reference.
- [ ] O2 `CMP-ONTOLOGY-CONCEPTS` (global): every concept has >= 2
  memberships; concept key <= 4 tokens; no two normalized definitions
  under one axis are equal. Concept count is reported, not capped.
- [ ] O3 `CMP-ONTOLOGY-MEMBERSHIP` (per dialogue, 27 leaves): every accepted
  observation in the dialogue has >= 1 membership or one row in
  `wiki/ontology/dispositions.jsonl`; dialogue memberships per accepted
  observation > 1.0; no `assignment_basis` contains "the retired pre-cut
  assignment", "matches the registry", or the axis or concept key
  verbatim as its only content.
- [ ] O4 `CMP-ONTOLOGY-INDEPENDENCE` (global): a stratified independent
  second pass covered >= 5% of accepted observations (>= 600); every
  disagreement has a terminal adjudication in the cutover receipt; the
  sample's measured first-pass recall (memberships the second reader
  added that the first missed, as a share of adjudicated memberships) and
  agreement rate are published in `wiki/ontology-quality.md`, and recall
  is at or above the floor the operator sets after seeing the phase-4
  numbers. The floor is a decision recorded in the receipt, not a number
  this target invents.

Cutover:

- [ ] C1: `wiki/review/<date>-ontology-v2-cutover.md` exists and records:
  the v1->v2 axis map (every v1 axis key resolves to one v2 axis, one v2
  concept, or `dropped`), the v1->v2 concept map for every concept that
  had a dossier, the commentary citation remap, the independent-pass
  adjudications, and the final validation results.
- [ ] C2: every commentary dossier citation resolves under v2; commentary
  blocks whose citation was edited carry a fresh audit sample per the
  commentary protocol.
- [ ] C3: `canonicalMembershipAssignmentBasis` is deleted; the
  `LEGACY_MEMBERSHIP_ALIAS_RE` lint is retained; validation passes
  without scrubbing.
- [ ] C4: a new content-addressed audit package binds the v2 concept and
  membership partitions to the same source and record partitions;
  `bun run harness ontology-audit verify` passes.
- [ ] C5: `docs/ontology-vnext.md` "Review and change control" and SPEC.md
  "Full-Corpus Audit Contract" are amended so that axis, concept, and
  membership edits require a canonical receipt, and only source-binding
  changes require a package. This is the process change that lets the
  ontology be edited at all.
- [ ] C6: `bun run ci` passes; `git diff --check` clean; regeneration is
  byte-stable across two clean runs; `wiki/completeness.md` reports
  `knowledge-base` READY only because O1-O4 pass.

Tooling (durable, generic, named for the stable operation):

- [ ] T1: `bun run harness wiki ontology` exposes
  `wiki_stage_axes`, `wiki_stage_concepts`, `wiki_stage_memberships`, and
  `wiki_commit_ontology` with the same stage-then-commit-once contract as
  the observation tools. `tools.test.ts` "without a peer ontology writer"
  is rewritten to assert that the ontology writer targets only
  `wiki/ontology/` and refuses observation fields.
- [ ] T2: `bun run harness ontology quality --write` regenerates
  `wiki/ontology-quality.md` deterministically from validated inputs
  (the BACKLOG Priority 0 report, promoted). It feeds O1-O4; it is not a
  second authority.
- [ ] T3: `bun run harness ontology brief <dialogue>` emits the bounded
  membership-pass input for one dialogue: the full axis catalog with
  concept sets, and that dialogue's accepted observations with
  `observation`, `greek_terms`, `stephanus_span`, and `limits`. Greek
  source text is not included; the observation is the classification
  input.

## 5. Phases

Order is fixed. Gates go in first so the remaining work is visible as jobs
and cannot be declared done by the old gate.
```text
0. Add O1-O4 families as failing leaves; add T2 quality report
   -> verify: bun run harness job list shows ontology-* jobs;
              wiki/completeness.md reports knowledge-base INCOMPLETE
1. Author the axis catalog with dimension, question, and enumerated answer
   classes; one receipt naming each axis, its rationale, every rejected
   candidate with one line of reason, and the resulting count for the
   operator to ratify
   -> verify: normalized-question uniqueness passes; every axis lists >= 3
              classes; any axis over 12 classes has a split review; catalog
              reviewed by one independent agent for overlap and for topics
              masquerading as axes; count ratified
2. Add T1 ontology writer and T3 brief generator
   -> verify: stage/commit round-trip test; brief for `laws` renders all
              2,391 accepted observations and the full catalog
3. Membership pass, one job per dialogue (27), multi-label against the whole
   catalog; agents may propose a new concept only inside an admitted axis
   and only with two candidate members named
   -> verify: per-dialogue O3 leaf passes; proposed concepts reviewed by
              the integrating agent before commit
4. Independent pass on a stratified 5% sample; adjudicate disagreements
   -> verify: O4 passes; agreement rate published
5. Prune: delete concepts with < 2 members; reassign or disposition their
   observations; delete axes that fell below 3 dialogues, moving their
   concepts under a broader axis or dropping them
   -> verify: O1, O2 pass
6. Cutover: replace the three JSONL files; delete the scrub; remap
   commentary citations; regenerate clusters, dossiers, site; write C1
   receipt; regenerate audit package; amend docs per C5
   -> verify: C1-C6 pass; bun run ci green; job list shows no ontology-*
              jobs
```

Phase 1 is the only phase where the catalog changes freely. After phase 3
begins, a new axis requires a receipt and a reclassification of every
dialogue already passed. That cost is deliberate: it forces the thinking into
phase 1.

Expected corpus delta at completion, stated as direction rather than
target: most of the 483 axes and most of the 3,557 concepts removed; 4,648
observations classified for the first time; memberships added until every
dialogue's ratio exceeds 1.0 and the sample recall floor is met; 6,813 bases
rewritten. The actual counts are what the phase-1 and phase-4 receipts
record. Scripts, schemas, and receipts are costs, not progress.

## 6. What the catalog should look like

Not a design, a shape. Phase 1 authors it.

The 11 spine axes (`elenchus`, `turn_geometry`, `definition_ladder`,
`craft_analogy`, `dramatic_case_setup`, `prosopography`, `myth_demarcation`,
`forms_trajectory`, `frame_depth`, `closure_type`, `rhetorical_stance_marker`)
keep their keys where the question survives; each is rewritten from 150-400
paraphrase concepts to a closed answer set. `elenchus` currently holds both
`respondent_aporia` and `aporea_reported`; v2 holds one.

The 309 `subject_matter` tags collapse into roughly 15-25 authored axes
whose questions are comparable across dialogues. Illustrative, not binding:

- How is a penalty graded? (classes by intent, status relation, and
  sanction kind; draws Laws, Gorgias, Republic, Protagoras)
- How does collective approval or disapproval bear on individual judgment?
  (conformity under pressure, audience gratification, presumed collective
  expertise, resistance to public opinion; draws Apology, Crito, Gorgias,
  Republic, Laws)
- What relation between soul and city is asserted? (isomorphism, causal,
  analogical only, denied)
- What is the stated source of a name's correctness? (convention, nature,
  legislator, imitation; Cratylus-heavy but present elsewhere)

The \~20 Laws IX homicide axes become memberships: one provision answers the
penalty-grading question, the procedure question, and the pollution question
at once. That is what many-to-many is for.

## 7. Decisions for the operator at signing

1. Axis dialogue floor: 3 (proposed) or 2. Three is chosen because two admits
   every Laws-plus-Republic pairing as an axis.
2. Whether `dispositions.jsonl` (`observation_id`, `disposition:
   no_axis_applies`, `basis`) is acceptable as the one new canonical file.
   The alternative, leaving uncovered observations silently uncovered, is
   the current state and is rejected.
3. C5 process change: receipt-only for ontology edits. Without it, the next
   ontology fix costs a full audit package again, which is why this one was
   a rename.
4. Whether spine axis keys are held stable to limit commentary citation
   churn (proposed: yes, for the 11 named above).
```text
Decision: Accept all four proposed rules: three dialogues per axis;
          explicit no_axis_applies dispositions; receipt-only ontology
          edits, with packages required for source-binding changes;
          retain the eleven spine keys where their questions survive.
          Catalog count and independent-pass recall floor remain subject
          to operator ratification after phases 1 and 4, respectively.
Date: 2026-09-07
Operator: Chris Carroll
```

---

## Appendix A. Paste-ready agent brief

Use as the opening message for the integrating agent. Phase-specific jobs
come from `bun run harness job show <job-id>` once phase 0 lands; this brief
is the standing context those jobs assume.
```text
You are the integrating agent for Ontology v2 in the plato-wiki repository.
Read docs/ontology-v2-target.md, AGENTS.md, SPEC.md, and
docs/ontology-vnext.md before doing anything else.

Situation. The current wiki/ontology/*.jsonl is a renamed tag registry:
483 axes of which 6 question templates cover all 483; 3,557 concepts of which
75% have one member; 7,644 memberships that are strictly one-per-observation;
4,648 accepted observations with no classification; 89% of assignment bases
regex-scrubbed to the string "the retired pre-cut assignment". The
completeness gate reports knowledge-base READY. Two prior bottom-up merge
passes changed almost nothing. You are not consolidating this. You are
replacing it under the admission rules in section 3 of the target, and
gating it under section 4 so it cannot regress.

Goal. A catalog of authored axes whose size is whatever the admission
rules yield and the operator ratifies; answer-class concepts with at least
two members each; every accepted observation classified against every axis,
with the independent sample measuring what the first pass missed; zero
templated questions or definitions; zero scrubbed bases; one hard cutover,
one receipt, one refreshed audit package; and completeness families O1-O4
passing for the right reasons.

Order of work. Phase 0 first, always: add the failing completeness families
so bun run harness job list shows the work and knowledge-base flips to
INCOMPLETE. Do not author a single axis until that is merged. Then phases
1-6 in order; do not begin phase 3 until the catalog is frozen with a
receipt.

How to author an axis (phase 1). Write the comparison question first. Then
list its answer classes, at least three. Then name three dialogues you expect to supply
members and one observation ID from each that would qualify. If you cannot
do all three, it is not an axis; write it down as a rejected candidate with
one line of reason and move on. Never derive a question from an axis key.
Never admit a concept whose name is a sentence.

How to classify (phase 3). For each accepted observation in your dialogue,
read the observation text, greek_terms, and limits. For every axis in the
catalog, decide whether the observation instantiates one of that axis's
classes. Most observations instantiate one discourse-structure or
textual-function class and one subject-matter class; some instantiate
three or four; a few none. Record every membership with a basis that names
the textual feature (a term, a speech act, a stated provision) that places
it there. You may propose a new concept only inside an admitted axis and
only by naming two observations that would join it; the integrating agent
decides. You may not propose an axis.

What you must not do. Do not read raw/plato/english/. Do not change any
observation field or review_status. Do not add a field, alias, or fallback
that lets v1 identities survive cutover. Do not write plan-specific scripts
into the repository; use the generic ontology writer and the brief
generator, and keep scratch outside the tree. Do not report validator or
schema work as progress; report corpus delta.

Plan format. Before each phase, state:
  1. [Step] -> verify: [command or check]
  2. ...
and loop until every verify passes. bun run ci must be green before any
canonical write is committed.

Success is measured by the gate, not by your judgment that the ontology is
better. If an axis fails admission, drop it or fold it; do not loosen the
rule to keep it. If the sample pass finds memberships you missed, the
classification is incomplete, not the corpus. Do not treat any count in
this brief as a number to hit; the counts are recorded after the fact.
```

## Appendix B. Verification commands
```bash
bun run harness ontology quality --write     # O1-O4 inputs
bun run harness job list                     # remaining ontology-* leaves
bun run validate                             # normalized-text uniqueness, bases, references
bun run harness clusters --write && bun run harness dossiers --write
bun run harness ontology-audit verify        # C4
bun run ci                                   # C6
```
