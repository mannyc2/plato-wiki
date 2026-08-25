# Apology commentary serial acceptance

- date: 2026-08-17
- scope: `wiki/commentary/apology.md`, all sixty commentary blocks
- canonical source: `raw/plato/greek/apology.txt`, SHA-256 `37c1ce832119acb9c2872c1c04433a3895a32679f2231f239a1b150c9a01c4d8`
- review basis: exact Greek spans, the permitted English rendering, and the accepted observation/claim/relation/dossier IDs cited by each block

## Decision

Accepted fifty-two blocks after a direct serial read. The accepted set is the
eighteen section blocks plus the supported context, argument, notice, crossref,
and question blocks whose claims track the cited Apology spans. Interpretive
language is retained only where it is voiced as commentary rather than stated
as an uncited fact about the text.

Rejected eight blocks, retained in the append-only ledger as provenance:

- `comm_apology_0019`: the claim that its disclaimer was a standard courtroom
  opening is uncited and exceeds the supplied record.
- `comm_apology_0029`: the claim about Athenian defendants' legal right to
  question accusers is uncited; the cited indictment record does not establish
  that procedural rule.
- `comm_apology_0035`: “every juror” admiring Achilles is an uncited
  generalization about the audience.
- `comm_apology_0043`: identifying Adeimantus as Plato's brother and claiming
  Plato wrote himself into the courtroom is external biography, not supported
  by the cited record.
- `comm_apology_0044`: the claim that Athenian defendants routinely staged
  families in court is an uncited historical/legal generalization.
- `comm_apology_0045`: its oath-law argument is source-discussable but has no
  supporting accepted citation, so the block fails the commentary citation
  contract.
- `comm_apology_0046`: detailed penalty-phase procedure is presented without
  an accepted supporting record.
- `comm_apology_0055`: the claim about officials being occupied and the
  condemned man's “unclaimed minutes” is uncited procedural framing.

Terminal disposition is therefore 52 accepted, 8 rejected, 0 unreviewed, and 0
needs_split. No section boundaries, bodies, citations, or IDs were changed.

## Verification

- The Apology commentary ledger validates directly with
  `validateCommentaryLedger`: zero issues.
- `git diff --check` passes for the Apology ledger and this receipt.
- The required Opus quality-audit manifest remains ungenerated because the
  current provider-quota block prevents its required external provenance.
