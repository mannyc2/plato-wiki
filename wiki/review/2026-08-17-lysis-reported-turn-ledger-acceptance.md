# Lysis reported-turn ledger acceptance

- date: 2026-08-17
- scope: `turn_lysis_0001` (203a–223b)
- source: `raw/plato/greek/lysis.txt`, SHA-256
  `c52fbd7394b742fa245bd9f8a6c69dc14c2aa2a0569ecef78bcbe51b469a2d35`

## Decision

Accepted the Lysis frame and its source-bounded reported-speech records.
The unlabelled frame belongs to Socrates: the first-person opening
`ἐπορευόμην` (7–17) and Hippothales' `ὦ Σώκρατες` (296–306) identify the
narrator without treating the turn metadata literal `(none)` as a voice.

Resolved a child only where the Greek itself supplies an owner-bearing form:
Socrates' first-person reporting forms, Hippothales' 278–311 introduction,
Ctesippus' `ἔφη ὁ Κτήσιππος`, Lysis' named reporting frames, and Menexenus'
`ἔφη ὁ Μενέξενος`. All other bounded direct-speech fragments remain
`unresolved`; a bare `ἔφη`, plural reply, vocative, or conversational sequence
does not license attribution by alternation.

The cited verse fragments at 212e, 214b, and 215d remain inside the current
speaker's discourse. They are not additional reported-turn owners under the
quoted-verse rule in `docs/voices-protocol.md`.

This accepts a standalone voice ledger only. Lysis is not added to a voice
cutover and no claim speaker, observation, relation, or audio attribution is
changed.

## Verification

- The Lysis voice ledger passes source-span, evidence, nesting, and accepted
  cohort validation while deriving `derived/plato/voices/lysis.toon`.
- The resulting index is standalone; no `voice-joins` artifact is written for
  the non-active dialogue.
