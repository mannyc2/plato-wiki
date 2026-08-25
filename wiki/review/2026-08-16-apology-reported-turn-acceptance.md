# Apology reported-turn acceptance

- date: 2026-08-16
- scope: `turn_apology_0001` (17a–42a), the sole required Apology outer turn
- source: `raw/plato/greek/apology.txt`, SHA-256 `37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8`
- turn index: `derived/plato/turns/apology.toon`, SHA-256 `b093ce5bf1903e2ba655f7a366f88b7bff76ee522b7569de5b93d71bc27d51dd`
- scope census: `wiki/review/2026-07-26-apology-reported-turn-scope-census.md`

## Decision

Accepted the one complete Apology cohort in `wiki/voices/apology.md`: 30
records, comprising a depth-1 Socrates frame, two person-marked remembered
Socrates utterances, and 27 retained unresolved utterances. The cohort is
atomic because the accepted frame tiles the complete outer turn and contains
every deeper record.

The frame identifies its otherwise unlabelled speaker from the Greek itself:
the first-person opening `ἐγὼ δ’ οὖν` at `[94,104)`, then the remembered
exchange's `ἦν δ’ ἐγώ` at `[6061,6070)` and its address `ὦ Σώκρατες` at
`[6643,6653)`. The two inner Socratic turns use their own person-marked
formulas. No translation, claim data, or external speaker label was used.

The unresolved rows retain direct speech without assigning it to Socrates by
fallback: the old accusers' oath wording; the unregistered Callias replies;
the 18 bounded answers in the Meletus cross-examination; indefinite and plural
staged speakers; and the Thetis–Achilles exchange. Their source boundaries and
reasons remain visible in the ledger rather than manufacturing terminal
identifiers.

## Verification

- `bun run harness derive voices apology` compiled 30 accepted records to
  `derived/plato/voices/apology.toon`.
- `bun run harness derive voice-joins apology` correctly refused to create a
  join because Apology has no entry in `derived/plato/voices/cutovers.toml`.
  Acceptance and compilation are complete; activation is intentionally not part
  of this decision.
