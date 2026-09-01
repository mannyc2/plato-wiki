# Meno reported-turn scope correction

**Reviewer**: Codex primary reconciliation, checked against the current Greek
source and the exhaustive ontology-audit finding for `voice_meno_0016` and
`voice_meno_0017`.

- date: 2026-08-30
- Greek source: `raw/plato/greek/meno.txt`, SHA-256
  `91e9583fb58eaaee47228c2ad2c917b40c6a9cdd864727cfc1ef6e561ef79f99`
- outer-turn index: `derived/plato/turns/meno.toon`, SHA-256
  `c9c5aafaa857b23b3fa214279a3d9a1ecb78170a8368f5469c97716236dc65ea`

## Decision

Remove `turn_meno_0478` from the required reported-turn set and retire
`voice_meno_0016` and `voice_meno_0017`. At 95d-e, Socrates introduces and
quotes Theognis' elegiac verse as evidence inside his ongoing argument. This is
the same excluded poetic-citation class as the Pindar fragment earlier in Meno;
the high proportion of quoted characters in one printed turn does not create a
new discourse owner.

The seven remaining required turns are unchanged. In particular,
`turn_meno_0566` remains required because `οἱ Λάκωνες ... φασίν` assigns a
bounded direct acclamation to a source-identified collective.

## Method

The decision used the Greek source, its exact character spans, the current
outer-turn index, and the exhaustive source-first finding.

No translation, doctrine, or style evidence was used.
