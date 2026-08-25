# Claim-fate pilot — Phase 1 report (claim threading, config v3)

Operator green-light: 2026-07-11, with hard gates; operator review of the
first run (config v2) found two gates unmet and two execution-safety gaps,
all repaired here. Phase 1 is read-derive only: no observation/claim/relation
record was created, modified, or re-statused, so no ingest-log entry or
review-status provenance applies. Everything regenerates deterministically:

```bash
bun scripts/claim-threads-2026-07/generate.ts --freeze-stopwords
bun scripts/claim-threads-2026-07/generate.ts --threads   # exit 1 on gold failure or stale freeze
bun scripts/claim-threads-2026-07/generate.ts --check     # exit 1 on drift, gold failure, or precision < 80%
```

Pilot dialogues: charmides, euthyphro, theaetetus.

## Operator review findings and their repairs (v2 -> v3)

1. **TF is not DF.** v2 ranked stopwords by total occurrence count. v3
   selects by document frequency: every token present in >= 25 of 27
   dialogues (231 tokens). The first v3 freeze attempt (DF-ranked top-190)
   was inspected before evaluation and found to slice the df=25 band
   mid-count, readmitting the v1 collapse drivers (μεντοι/εοικεν/παλιν); the
   rule was refined to the pure df>=25 threshold at the natural band
   boundary before any evaluation ran. The nearest inquiry vocabulary sits
   at df=24 (δοξαν, αγαθον, καλον) and below (επιστημη df=21, ψυχη df=20)
   and stays live. Inside the frozen list from the watchlist: αληθη (df=27)
   and the λογος/λογον/λογου family (df=26-27) — corpus-ubiquitous by the
   frozen rule; gold pairs retain >= 2 shared tokens without them.
2. **Term-only fallback edges escaped evaluation.** v2 let greek_terms
   create thread members (469 of 1,336 edges) outside the precision and
   collapse gates. v3: greek_terms NEVER create edges; every edge requires
   >= 2 shared span tokens, and greek_terms only set a
   `greek_terms_corroborated` marker (867 edges total, 525 corroborated).
   The precision sample and degree drivers now cover the full graph by
   construction.
3. **Adjudications were not persisted or enforced.** Verdicts now live in
   `precision-adjudication.json` (one verdict + reason per sampled edge);
   `--check` fails unless the adjudication exactly covers the current
   sample and the relevance rate is >= 80%.
4. **Queue scope was undifferentiated.** `phase2-queue.json` now emits
   `authorized_queue` (the operator-authorized 29, `authorized: true`) and
   `extension_candidates` (`authorized: false`) with an embedded
   `execution_rule`: Phase 2 consumers must load `authorized_queue` only and
   reject extension candidates until the operator extends scope.
5. **Silent failure paths.** Stale stopwords (config-version or input-sha
   drift, or an index missing from the freeze), gold failure, and precision
   failure all exit nonzero. Negative-tested: missing adjudication file ->
   exit 1; tampered freeze sha -> exit 1.

## Gate results (config v3; parameters frozen in `stopwords.json` before evaluation)

| Gate | Result |
| --- | --- |
| Span tokens are the only edge source; greek_terms corroborate | Implemented (`greek_terms_corroborated` per edge; no term-only members) |
| Document-frequency filter from the full committed token index, frozen | df >= 25 of 27 (231 tokens) + 261 name-like tokens (>= 90% capitalized surfaces, count >= 5); input shas embedded and re-verified on every load |
| All six gold pairs share threads | PASS 6/6 (`gold-eval.json`); thread sizes 15-51 (v2: 27-97) |
| Reruns byte-identical | PASS (`--check`: 10/10 artifacts) |
| Evidence exposes spans and tokens | Per member: span, status, shared tokens, corroboration, neg-cue |
| Precision over the full edge graph, persisted and enforced | **PASS 29/30 (96.7%)**, enforced by `--check` at >= 80% |
| Structural relation parsing, no line-based analysis | All 2,080 relations via `Bun.YAML`; 46 deterministic format repairs (trailing `---`, unquoted-colon prose), counted per file, zero skips |

## Collapse assessment (degree-report.json)

Thread shares fell again at equal recall: charmides max 0.59 (v2 0.82),
euthyphro max 0.79 (v2 0.88), theaetetus max 0.34 with median 18%. Every top
thread's drivers are inquiry vocabulary (σωφροσυνη family + πραττειν/ησυχη;
οσιον/ανοσιον/θεοφιλες/φονου; δοξαν/δοξαζειν/ψευδη/επιστημην). The high
euthyphro share is the definiendum at work — οσιον carries 32 of the top
thread's 45 edges — which is the honest profile of a single-inquiry
dialogue, not token-driven collapse. Residual live generics below the df
threshold (τοινυν df=24, φαμεν, δοκω, φιλε) appear only as secondary
drivers; the one sampled edge they alone created was adjudicated IRRELEVANT
(edge 25) and is within the enforced tolerance.

## Precision adjudication

Sample: 30 non-gold edges (PRNG seed 20260711; per dialogue, 5 from the
largest star + 5 from the rest). Verdicts persisted in
`precision-adjudication.json` with per-edge reasons; **29/30 RELEVANT**.
The failure: `claim_theaetetus_0185 -> claim_theaetetus_0043` (the
wonder-origin-of-philosophy aside, linked only by discourse verbs
δοκω/φαμεν). Recorded weak passes (definiendum/definiens token present but
member content inquiry-adjacent or incidental): edges 22, 24
(ἕτερον as allodoxia definiens), 28 (incidental ἐπιστήμη).

## Phase 2 queue (not started; authorization unchanged)

- `authorized_queue`: the operator-authorized **29** relations (20
  cross-dialogue including `rel_cross-dialogue_0997`, 9 intra-theaetetus);
  all 29 are reproduced by the v3 formal flag rule
  (`authorized_not_reproduced_by_formal_rule: []`).
- `extension_candidates`: **31** further accepted `standing` relations
  (v2: 33; the corroboration-only change removed two), touching exactly
  **5 flagged definitions beyond the authorized set**:
  `claim_charmides_0014`, `claim_charmides_0015`, `claim_euthyphro_0024`,
  `claim_euthyphro_0045`, `claim_euthyphro_0050`. Per the operator's
  direction, these require a separate fate adjudication of those flagged
  claims before any scope extension; until then Phase 2 consumers must
  reject every `authorized: false` entry.

## Files

- `stopwords.json` — frozen v3 filter (rule, input shas, 231 df + 261 name tokens, boundary window)
- `threads-{charmides,euthyphro,theaetetus}.json` — full thread evidence (867 edges)
- `gold-eval.json` — recall gate, 6/6
- `degree-report.json` — collapse evidence
- `precision-sample.json` — the 30 sampled edges
- `precision-adjudication.json` — persisted verdicts, enforced by `--check`
- `joins-{dialogue}.json` — claim -> overlapping accepted observations
- `phase2-queue.json` — authorized_queue (29) / extension_candidates (31), fail-closed rule embedded
- `scripts/claim-threads-2026-07/generate.ts` — the generator

## Version history

- v1: TF top-150, >= 1 shared token, no name filter. Gold 6/6; FAILED
  collapse (euthyphro threads at 100%, name/discourse drivers). Shas:
  stopwords `454c11cf…`, gold-eval `0b4a4c9e…`, degree `9d9ab507…`.
- v2: TF top-190 + name filter + >= 2 tokens. Gold 6/6, stability, 28/30
  precision — but operator review found the TF/DF substitution, the
  unevaluated term-only edges, unpersisted adjudications, and the
  undifferentiated queue. Shas: stopwords `2e070d48…`, gold-eval
  `65937e28…`, degree `d23832a9…`.
- v3 (this report): all four findings repaired; gates green with
  enforcement; artifacts uncommitted pending operator review.

## Phase 2 checkpoint

Phase 2 remains unauthorized. When authorized, it is append-only
stance-event repair against `authorized_queue`'s flagged claims only,
operator-gated, with independent-model review; every `review_status` change
requires the mandated `wiki/ingest-log.md` entry and `wiki/review/` note in
the same commit. No corpus-wide rewrite follows from this pilot.
