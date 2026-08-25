# Claim Corpus Rollout Cost Review

Plan: 042 claim ledger layer
Phase: Step 9 corpus rollout
Status: Cost STOP resolved by deterministic segmentation redesign

## Stop Condition

The claim ledger rollout says to stop and report if dry-run segment counts for Laws exceed
about 80 batches. A fresh dry run on 2026-07-03 with the current default claim
queue target (`--target-bytes 2000`) produced 377 Laws extraction batches.

No Step 9 corpus rollout ran under the 2000-byte default.

## Current Evidence

Command shape used for the default count:

```bash
bun run harness claims-queue <dialogue> --dry-run --limit 1000
```

The three stage-one ledgers already completed under Step 7 and Step 8 are
excluded here: Euthyphro, Crito, and Meno.

| Dialogue | Default extraction batches |
|---|---:|
| apology | 31 |
| charmides | 29 |
| cratylus | 67 |
| critias | 18 |
| euthydemus | 44 |
| gorgias | 93 |
| greater-hippias | 30 |
| ion | 14 |
| laches | 28 |
| laws | 377 |
| lesser-hippias | 15 |
| lysis | 24 |
| menexenus | 18 |
| parmenides | 49 |
| phaedo | 81 |
| phaedrus | 59 |
| philebus | 63 |
| protagoras | 62 |
| republic | 315 |
| sophist | 57 |
| statesman | 66 |
| symposium | 61 |
| theaetetus | 83 |
| timaeus | 86 |

Default remaining extraction batches: 1770.

Dialogues above the review threshold: Gorgias, Laws, Phaedo, Republic,
Theaetetus, Timaeus.

Review runs are additional model-backed batches after extraction. They are not
included in the extraction-batch total above.

## Larger-Segment Diagnostic

Larger `--target-bytes` values lower raw batch count, but they are not currently
a drop-in fix. The current claim prompt precomputes source-ref choices for each
segment, and larger Laws/Republic segments exceed that precompute cap in most
segments.

| Target bytes | Gorgias | Laws | Republic | Phaedo | Theaetetus | Timaeus |
|---:|---:|---:|---:|---:|---:|---:|
| 3000 | 59 | 233 | 201 | 52 | 51 | 53 |
| 4000 | 44 | 174 | 147 | 39 | 38 | 40 |
| 6000 | 29 | 114 | 97 | 25 | 25 | 26 |
| 8000 | n/a | 84 | 72 | n/a | n/a | n/a |
| 10000 | n/a | 67 | 57 | n/a | n/a | n/a |

Source-ref precompute check:

| Target bytes | Dialogue | Segments | Source-ref OK | Source-ref cap fail |
|---:|---|---:|---:|---:|
| 8000 | laws | 84 | 3 | 81 |
| 8000 | republic | 72 | 4 | 68 |
| 10000 | laws | 67 | 0 | 67 |
| 10000 | republic | 57 | 0 | 57 |

## Decision Options

1. Approve the default rollout.
   This preserves the current stage-one-tested behavior but accepts at least
   1770 remaining extraction batches plus review batches.

2. Authorize a two-tier rollout.
   Run the 18 remaining dialogues at or below 80 default extraction batches
   first, then return for a separate decision on Gorgias, Laws, Phaedo,
   Republic, Theaetetus, and Timaeus. This does not complete v1.0 by itself.

3. Authorize a claim-segmentation redesign.
   Replace the current source-ref precompute-heavy prompt package with a
   lower-volume citation strategy, re-run a small audited stage, and then
   reconsider larger `--target-bytes` values. This is engineering work before
   more model budget.

4. Amend the v1.0 completion target.
   Defer full claim/relation coverage from v1.0. This conflicts with the
   current ratified E2/E3 gates and should be treated as a target amendment,
   not as completion.

## Resolution

The accepted path is a deterministic claim-segmentation redesign before any
corpus rollout:

- `claims-queue` now defaults to 10000-byte claim batches.
- `claims-segmented` uses the same claim-specific default when run directly.
- The claim prompt package injects segment text plus an ordered allowed-marker
  list, not every possible source-ref object.
- `wiki_append_claims` canonicalizes `source_ref:` stubs from each cited
  `stephanus_span` and rejects appended source refs outside the current claim
  segment before writing.

Verification on 2026-07-03:

```bash
bun run harness claims-queue <dialogue> --dry-run --limit 1000
```

| Dialogue | Redesigned default extraction batches |
|---|---:|
| apology | 6 |
| charmides | 6 |
| cratylus | 12 |
| critias | 4 |
| euthydemus | 8 |
| gorgias | 17 |
| greater-hippias | 6 |
| ion | 3 |
| laches | 5 |
| laws | 67 |
| lesser-hippias | 3 |
| lysis | 5 |
| menexenus | 4 |
| parmenides | 9 |
| phaedo | 15 |
| phaedrus | 11 |
| philebus | 12 |
| protagoras | 12 |
| republic | 57 |
| sophist | 11 |
| statesman | 12 |
| symposium | 11 |
| theaetetus | 15 |
| timaeus | 16 |

Redesigned remaining extraction batches: 327.

Dialogues above the review threshold: none.

Largest checked prompt package among the prior threshold-triggering dialogues:
about 20.3 KB.

## Operator Decision

```text
Decision: deterministic cost redesign accepted for the claim ledger rollout Step 9
Date: 2026-07-03
Operator: operator
Notes: Live corpus rollout remains claim-ledger-rollout phase work; this memo records only
the cost-gate resolution and dry-run evidence.
```
