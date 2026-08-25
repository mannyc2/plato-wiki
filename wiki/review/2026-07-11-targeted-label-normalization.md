# Targeted Label Normalization Review — 2026-07-11

## Result

The targeted label normalization completed the signed decision-C normalization for exactly four
families using the Codex main agent and Codex subagents only. No provider-backed
harness, external model, English source, or translation file was used.

The accepted hard cutover keeps 1,267 in-scope labels and merges 234 source
labels into five existing targets. It rewrites 467 observation records across
26 ledgers: 465 accepted records and 2 rejected records. No label was created,
no family changed, and all 18 signed sample anchors reached their licensed
targets.

## Baseline and final metrics

| metric | baseline `34f3bcd` | final | delta |
|---|---:|---:|---:|
| observation ledgers | 27 | 27 | 0 |
| observations | 7,470 | 7,470 | 0 |
| labels | 3,892 | 3,658 | -234 |
| singleton labels | 3,097 | 2,900 | -197 |
| cross-dialogue labels | 489 | 464 | -25 |

The final quality report records 1,940 uncovered singletons and 60.7% accepted
reuse mass.

## Family dispositions and apply impact

| family | keeps | merges | changed records | changed ledgers | target allocation |
|---|---:|---:|---:|---:|---|
| `craft_analogy` | 419 | 27 | 39 | 14 | `expert_craft_analogy`: 27 |
| `definition_ladder` | 297 | 41 | 58 | 18 | `definition_proposed`: 32; `definition_tested_by_case`: 9 |
| `elenchus` | 346 | 19 | 19 | 9 | `assent_chain`: 19 |
| `turn_geometry` | 205 | 147 | 351 | 25 | `explicit_procedure_control`: 147 |
| **total** | **1,267** | **234** | **467** | **26 unique** | five licensed targets |

Post-cutover target footprints, including pre-existing records, are:

| target | all records | accepted records |
|---|---:|---:|
| `craft_analogy/expert_craft_analogy` | 74 | 73 |
| `definition_ladder/definition_proposed` | 109 | 107 |
| `definition_ladder/definition_tested_by_case` | 21 | 21 |
| `elenchus/assent_chain` | 123 | 122 |
| `turn_geometry/explicit_procedure_control` | 382 | 381 |

## Codex review record

Four primary Codex subagents reviewed every label and cited record in their
assigned family and produced isolated draft maps:

- craft: Halley (`019f527f-048d-7643-b9cb-c6175e7a8a66`)
- definition: Arendt (`019f527e-ebd3-7580-92ba-40208332bdb0`)
- elenchus: Avicenna (`019f527e-d330-74d3-bb70-7c9fc986094f`)
- turn geometry: Schrodinger (`019f527f-190a-72e2-8f69-e8e22ccd55ac`)

The main agent validated each isolated draft, reviewed every proposed merge and
all five target entries, inspected deterministic keep samples, and owned every
canonical-map and apply write.

An independent Codex elenchus audit by Helmholtz
(`019f5292-234a-7b52-943c-c888ec8f11f1`) rejected five proposed source-label
merges. Those labels cover 20 records and were conservatively changed to
`keep` because at least one record lacked a fresh linked respondent-premise
chain:

- `assent_chain_rapid_series`
- `assent_chain_to_contradiction`
- `contradiction_exposed_in_assent_chain`
- `definition_established_by_assent_chain`
- `short_answer_assent_pattern`

The other independent audit sessions did not return usable findings after
repeated handoff requests and were retired; no decision was accepted from an
incomplete audit. The main-agent review and the four complete primary reviews
remain the acceptance surface.

The elenchus auditor also identified 21 pre-existing accepted records on the
licensed `assent_chain` target whose function is broader than a fresh linked
premise chain. The targeted label normalization licensed the existing target and prohibited target
splitting or broader re-adjudication, so those inherited records were not
silently relabeled. The 19 newly merged elenchus source labels all passed the
revised review.

## Hard-cutover integrity

- All 3,892 baseline labels have canonical map rows. Exactly 1,501 rows in the
  four licensed families are accepted `keep` or `merge` dispositions; all
  2,391 out-of-scope rows remain `todo`.
- Every merged source label is absent from the final audit and every target is
  present.
- Observation comparison against `34f3bcd` permits only `feature_family`,
  `feature_id`, and `feature_label`; the actual cutover changed only ID and
  label. Observation prose, textual basis, limits, source refs, Greek terms,
  and review status are byte-identical.
- Claims, relations, raw sources, and turn joins are byte-identical to the
  baseline.
- Three Symposium `cites.dossiers` entries hard-cut over from merged
  `turn_geometry` labels to `explicit_procedure_control`. All commentary prose,
  source data, citations of other kinds, authorship, and review statuses are
  byte-identical.
- No ingest-log entry was required because no `review_status` changed.

## Regeneration and gates

Audit, quality report, clusters, dossiers, and site were regenerated twice
after the final commentary-reference cutover. Both passes produced aggregate
SHA-1 `68f95705415988bdcefcccf24863bffeb767ea07` over all generated files.

- label audit: 3,658 labels; 2,900 singletons; 464 cross-dialogue labels
- clusters: 504 family artifact files
- dossiers: 739 dossiers plus the index, 740 artifacts total
- site: 1,933 files; no file exceeds 2 MB
- tests: 265 pass, 0 fail, 702 expectations
- typecheck: pass
- validate: pass, including dossier citations and site links
- The targeted label normalization post-apply checker: pass
- `git diff --check`: pass

## Commits

- baseline: `34f3bcd`
- execution plan: `bcf782f`
- frozen map skeleton: `bc93325`
- reviewed dispositions: `c1dbd89`
- commentary-reference hard cutover: `c8cb8be`
- semantic corpus cutover: `285f39c`
