# Charmides reported-turn acceptance

- date: 2026-08-17
- scope: `turn_charmides_0001` (153a–176d)
- source: `raw/plato/greek/charmides.txt`, SHA-256 `cb446b66773c1ae410489ff61b95c0e16242dc0abc787dc466b9a74551cfe218`

## Decision

Accepted one atomic reported-turn cohort: Socrates' unlabelled first-person
frame plus the bounded inner utterances transmitted within it. The frame is
licensed by the opening first-person narration `ἥκομεν τῇ προτεραίᾳ` and the
opening Chairephon address `ὦ Σώκρατες`.

Resolved only spans carrying a local Greek reporting formula: Socrates'
first-person `ἦν δ’ ἐγώ` / `ἔφην` / `εἶπον`, and the locally named Critias,
Charmides, Chairephon, and Thracian doctor. Bare `ἔφη` and `ἦ δ’ ὅς` replies
remain unresolved; neighbouring turns, philosophical content, and turn-taking
were not used to fill them. The three q-bounded instructions from the Thracian
doctor remain separate children because the edition closes and reopens the
quotation around Socrates' intervening `ἔφη` clauses. The two conditional
q-bounded questions at 165d–e remain unresolved because the Greek does not name
their staged speaker.

Homer and Cydias are quotations inside Socrates' own argument, not reported
turns. Zalmoxis occurs in indirect `ὅτι` discourse, not bounded direct speech.

## Verification

- `bun run harness derive voices charmides` compiled 363 accepted voices.
- The focused Charmides ledger validator and compiled-index freshness check
  passed after generation.
