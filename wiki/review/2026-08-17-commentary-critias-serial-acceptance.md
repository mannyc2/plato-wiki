# Critias commentary serial acceptance

- date: 2026-08-17
- scope: `wiki/commentary/critias.md`, all thirty-four commentary blocks
- canonical source: `raw/plato/greek/critias.txt`, SHA-256 `f724e270f7d4fdffa96cfaf82ce029b30e7cbe60f8cee3f3c7f941af2cb58ee2`
- review basis: exact Greek spans, the permitted English rendering, and the accepted observation/claim IDs cited by each block

## Decision

Accepted thirty-three blocks after a direct serial read:
`comm_critias_0001`–`comm_critias_0019` and `comm_critias_0021`–
`comm_critias_0034`. Their spans and cited records support the frame handoff,
the audience/painter analogy, the Egyptian-Solon transmission chain, the
ancient-Athenian reconstruction, the Atlantis inventory, and the closing
decline of the kings. Interpretive language remains voiced as commentary and
does not turn the myth's reported claims into uncaveated historical fact.

Rejected `comm_critias_0020` (108d). Its Mnemosyne discussion correctly
identifies the memory/transmission frame, but the sentence that the speech's
authority rests “not on witnesses or argument” overstates the contrast: the
passage explicitly invokes Egyptian priests and Solon's report as witnesses,
and the block supplies no accepted citation for that categorical characterization.
The block remains in the append-only ledger as rejected provenance.

Terminal disposition is therefore 33 accepted, 1 rejected, 0 unreviewed, and 0
needs_split. No section boundaries, bodies, citations, or IDs were changed.

## Verification

- The Critias commentary ledger validates directly with
  `validateCommentaryLedger`: zero issues.
- `git diff --check` passes for the Critias ledger and this receipt.
- The required Opus quality-audit manifest remains ungenerated because the
  current provider-quota block prevents its required external provenance.
