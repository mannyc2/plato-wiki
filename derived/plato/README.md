# Derived Plato data

The files in this directory are deterministic adaptations of the pinned
PerseusDL/canonical-greekLit Plato editions recorded in
[`raw/plato/SOURCES.md`](../../raw/plato/SOURCES.md).

The adapted textual material is available under
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).
The source commit is `e37eed2e8a5fed710c3ab0d312249c3fb04d77e0`; changes include
TEI-to-text normalization, Stephanus indexing, and derived record/index
generation.

## Particle form census

[`metrics/particles/report.md`](metrics/particles/report.md) compares six Greek
forms across all 27 dialogues. Each dialogue's TOON file contains counts by
outer printed speaker, turn, and Stephanus marker, plus the matching canonical
token IDs, source offsets, original forms, and source/index hashes.

Rebuild with `bun run harness derive metrics` after generating current turns
and tokens. `bun run validate` checks the complete file inventory and compares
every file with its deterministic reconstruction. A single-dialogue metrics
rebuild updates that dialogue; run the full command to refresh the corpus
report before validation.

Use these counts for literal form comparisons and to locate Greek evidence.
Matching uses the token index's case/diacritic/final-sigma normalization, not
lemmatization or grammatical disambiguation. Frequencies exclude printed
speaker-label tokens. Narrated or unattributed `(none)` turns remain in the
denominator; speaker summaries do not infer nested voices or historical
authorship. The report makes no chronology claims.
