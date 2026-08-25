# Parmenides reported-turn acceptance

- date: 2026-08-16
- scope: `turn_parmenides_0001` (126a–166c)
- source: `raw/plato/greek/parmenides.txt`, SHA-256 `63e6839a3de2e45238e2d427cb0a2310e4d54f0ddc1484068cc729e61240f1f2`

## Decision

Accepted one atomic reported-turn cohort. The unlabelled frame is Cephalus;
inside it the Greek explicitly transmits Antiphon's report of Pythodorus's
account. The child records preserve that narration path before locating the
direct dialogue below it.

Resolved only spans with a local Greek owner-bearing form: Cephalus's own
first-person reports, the named Adeimantus, Antiphon, Pythodorus, Socrates,
Zeno, Parmenides, and Aristotle constructions. Bare `φάναι`, `ἔφη`, and
`εἶπεν` exchanges remain unresolved. This includes the paragraph-bounded later
Parmenides–Aristotle deduction: neither its alternating replies nor its
argumentative content was used to assign a terminal owner. Indirect recaps,
the Ibycus reference, and complementary infinitives do not create additional
reported-turn owners.

This accepts a standalone voice corpus artifact only. Parmenides is not added
to a voice cutover; no claim speaker, observation, relation, or audio record is
changed.

## Verification

- The focused Parmenides voice-ledger validator passed source spans, evidence,
  nesting, and atomic cohort checks before compilation.
- `bun run harness derive voices parmenides` regenerated the standalone index.
