# Republic Book 1 reported-turn acceptance

- date: 2026-08-17
- scope: every record in `wiki/voices/republic.md` beneath
  `turn_republic_0001`, whose source range is `[0,59067)`
- source: `raw/plato/greek/republic.txt`, SHA-256
  `ce086559a011ff7682319eec28680e9f4f6600631a698c8cfa3653dd01aa5244`
- reviewed ledger: 490 records, `voice_republic_0001` through
  `voice_republic_0490`
- direct-review basis:
  `wiki/review/2026-08-16-republic-book1-direct-review-slices.md`

## Decision

Accept the complete Book 1 reported-turn cohort as a standalone corpus
artifact. The direct Greek review covers the entire outer turn in bounded
slices, retaining every explicit formula and bounded discourse attribution
that the source licenses. It also removes every owner claim that depended on
turn alternation, carry-forward, an addressee-only vocative, or an unbounded
context.

The accepted projection preserves uncertainty rather than fabricating speakers:
all cue-less, generic, collective, and otherwise non-owner-bearing nested spans
remain unresolved. The parent and every child are accepted together, so the
single required outer-turn cohort tiles atomically without handing a deeper
span back to Socrates.

This acceptance does not activate Republic in `cutovers.toml`, create a stored
voice join, or rewrite any claim speaker.
