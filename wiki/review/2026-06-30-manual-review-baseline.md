# 2026-06-30 Manual Review Baseline

This note records the review-status baseline committed in `0e80b68` ("Checkpoint Plato ingest and manual review"). It is retroactive provenance: the status decisions already existed in that commit, but the process that assigned them was not durably recorded at the time.

## What Happened

On 2026-06-29 and 2026-06-30, the remaining Plato corpus was ingested through bulk concurrent segmented runs using the pioneer scripts now archived at `scripts/ingest-2026-06-29/`. Those runs used the DeepSeek-V4-Pro `pioneer-pro` profile and are logged as `ingest-segmented` entries in `wiki/ingest-log.md`.

Some missed spans were gap-filled with locally authored candidate records now archived at `wiki/review/2026-06-30-ingest-gapfill-candidates/`. Those candidate files used local IDs and placeholder feature IDs; the committed ledgers normalized them into corpus observation IDs and feature IDs.

Before commit `0e80b68`, a manual review pass assigned `review_status` values to every record then present in the corpus.

## Resulting Baseline

At `0e80b68`, the corpus contained 7179 classified records:

- accepted: 6251
- needs_split: 507
- rejected: 421

| dialogue | accepted | needs_split | rejected | total |
|---|---:|---:|---:|---:|
| apology | 59 | 7 | 0 | 66 |
| charmides | 119 | 26 | 18 | 163 |
| cratylus | 259 | 32 | 25 | 316 |
| critias | 85 | 9 | 5 | 99 |
| crito | 19 | 0 | 0 | 19 |
| euthydemus | 191 | 32 | 23 | 246 |
| euthyphro | 50 | 0 | 2 | 52 |
| gorgias | 385 | 13 | 39 | 437 |
| greater-hippias | 141 | 9 | 7 | 157 |
| ion | 14 | 0 | 0 | 14 |
| laches | 118 | 15 | 17 | 150 |
| laws | 1116 | 60 | 74 | 1250 |
| lesser-hippias | 65 | 16 | 1 | 82 |
| lysis | 126 | 8 | 7 | 141 |
| menexenus | 76 | 13 | 8 | 97 |
| meno | 45 | 0 | 0 | 45 |
| parmenides | 185 | 27 | 31 | 243 |
| phaedo | 262 | 0 | 0 | 262 |
| phaedrus | 264 | 29 | 29 | 322 |
| philebus | 306 | 21 | 23 | 350 |
| protagoras | 232 | 36 | 32 | 300 |
| republic | 752 | 0 | 0 | 752 |
| sophist | 250 | 22 | 32 | 304 |
| statesman | 247 | 42 | 13 | 302 |
| symposium | 249 | 1 | 0 | 250 |
| theaetetus | 340 | 36 | 29 | 405 |
| timaeus | 296 | 53 | 6 | 355 |

## Provenance Gaps

The ingest side is logged through `wiki/ingest-log.md`, segment coverage, and local transcripts where those ignored artifacts still exist. The review-status assignment mechanism for the 2026-06-29 and 2026-06-30 dialogues was not logged in tracked files.

No harness `review-segmented` runs were logged for these new dialogues. The prior tracked review-segmented entries end with Republic on 2026-06-24. The only post-ingest review transcript located during planning was a dry run for Laws.

There is no per-record rationale for the stage-1 accept, reject, and needs_split decisions that produced `0e80b68`. Stage-2 repair rationale is recorded separately in `wiki/review/2026-06-30-repair-pass/`.

## Left Untracked

The following local scratch directories were not committed because they are nohup logs or duplicate run working directories:

- `scratch/pioneer-ingest-runs/`
- `scratch/pioneer-concurrent-runs/`
- `scratch/logs/`
