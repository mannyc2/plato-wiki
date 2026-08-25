# Republic Book 1 anaphoric repair decision

**Status: applied and verified.** This receipt records the accepted corpus
decision. Intermediate packets, reviewer outputs, schemas, hashes of prompts,
and writer scaffolds were disposable and are not canonical evidence.

## Scope and evidence

- Greek source: `raw/plato/greek/republic.txt`, SHA-256
  `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`.
- Canonical ledger: `wiki/voices/republic.md`, Book 1 `[0,59068)` within
  `turn_republic_0001`.
- Ledger before:
  `089fb997b26b6fce4993d6be52afbe86d67cccdf22b8b903124ed18ffde0c3be`.
- Ledger after:
  `f7fe9c12cb5dc660e28703bfe3512ceb057f27de4fc8ffd8c5f1d76a5f6c094e`.
- Every decision was checked against its record-local source span and the
  governing voice-attribution rules. No translation was used.

## Accepted decision

The review found that resolved Book 1 rows repeatedly treated an anaphoric
reporting form as sufficient authority without a source-backed terminal owner.
Of 114 reviewed depth-2 rows, 46 became honestly `unresolved`, 67 retained their
resolution with corrected evidence/attribution, and one remained byte-identical.

Target record suffixes, in source order:

```text
0003 0007 0009 0011 0021 0025 0027 0029 0031 0033 0038 0040 0044 0046 0050 0052 0055
0059 0119 0121 0123 0133 0137 0141 0145 0147 0174 0176 0178 0180 0182 0186 0190 0192
0194 0196 0199 0201 0203 0205 0207 0213 0215 0219 0227 0229 0233 0239 0241 0243
0245 0247 0249 0251 0255 0259 0263 0265 0267 0269 0277 0279 0285 0287 0289 0293
0298 0300 0303 0309 0313 0315 0317 0319 0321 0325 0327 0331 0333 0337 0339 0341
0343 0345 0347 0349 0353 0355 0357 0359 0371 0377 0385 0389 0398 0400 0404 0406
0408 0410 0414 0418 0420 0426 0428 0430 0434 0448 0460 0462 0470 0480 0484 0488
```

For each unresolved row, the unlicensed terminal owner was removed while the
licensed chain prefix, stable ID, source geometry, depth, and `review_status`
were preserved. Corrected rows take their authority from source-backed explicit
evidence or reviewed attribution. No row was added, removed, split, renumbered,
accepted, or rejected.

Two independent source-bound reviews covered the cohort and a final semantic
comparison resolved their disagreements. The accepted result is represented by
the canonical rows above; the intermediate reviewer files are intentionally not
retained.

## Corpus result and validation

- Records: 489 before and after; depths `1/483/5` unchanged.
- Resolution: 206 resolved / 283 unresolved became 160 / 329.
- Review status: all 489 remain `unreviewed`.
- Non-target rows remained unchanged.
- `bun scripts/voices-2026-07/check-ledger.ts republic` passed with 0 issues.
- The source hash and installed ledger hash matched the values above.
- No compiled Republic index, join, cutover, claim-speaker migration,
  activation, publication, or deployment occurred.
