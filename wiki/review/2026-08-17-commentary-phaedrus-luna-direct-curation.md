# Phaedrus commentary direct-curation receipt

- date: 2026-08-17
- scope: `wiki/commentary/phaedrus.md`
- curator: Luna, direct curation
- model attribution: `author: model`; no Opus or Claude campaign was used or claimed
- source: `raw/plato/greek/phaedrus.txt`

## Decision

The first draft was rejected during semantic spot-check: it placed the
Lysias material, Socrates’s first speech, the recantation, the charioteer, and
the supracelestial procession in the wrong section spans despite passing the
structural validator. The ledger was rebuilt against the source markers.

A second semantic correction was required after a late-span review. The
261d–264b block now stays with likeness/difference, deceptive comparison, and
the three speeches; 264c–267b carries the living-body image and collection or
division; 267c–270a covers rhetoric's named parts, medicine, practice, nature,
and Pericles; and 270b–273d introduces soul-types, speech-types, fitting
occasions, practice, and probability. The prior late-span wording was not
accepted as reviewed.

Accepted 18 ascending, contiguous, strictly non-overlapping section blocks
covering 227a–279c. High-risk mapping checks explicitly confirmed Lysias at
229e–234e, Socrates’s first speech at 237c–241d, recantation and self-motion
at 241e–245e, the chariot at 246a–247b, the supracelestial procession at
247c–248b, the fall and life-ranking at 248c–249d, and beauty/recollection at
249e–252c. Every block has an exact resolved `source_ref` and terminal
`review_status: accepted`; no non-section interruption was added.

## Validation

- `bun -e 'import {readFileSync} from "node:fs"; import {validateCommentaryLedger} from "./packages/harness/src/wiki/commentary-validator.ts"; const p="wiki/commentary/phaedrus.md"; const i=validateCommentaryLedger(p,readFileSync(p,"utf8")); console.log(JSON.stringify({count:i.length,issues:i},null,2)); process.exit(i.length?1:0)'` — 0 issues with the validator’s default citation index.
- `bun test packages/harness/src/wiki/commentary-validator.test.ts` — 29 pass, 0 fail.
- `git diff --check -- wiki/commentary/phaedrus.md` — passed.
- Initial structurally-valid draft was not accepted as reviewed; semantic
  correction was made before this receipt was finalized.

No code, configuration, generated aggregate, audit, campaign, or other
dialogue file was changed.
