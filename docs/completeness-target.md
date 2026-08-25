# Edition Completeness Target Contract

Status: ratified 2026-07-19.

Operator decision: the request to implement The edition-completeness contract ratifies the named,
conjunctive targets below. It does not authorize content review decisions,
audio acceptance, apparatus production, publication, or a scalar project
score.

This document controls the meaning of the targets. The generated
`wiki/completeness.md` and `wiki/public-release-readiness.md` reports control
current status and supersede hand-written current-count claims.

## Canonical denominator

The edition denominator is this exact alphabetical tuple of 27 dialogues:

```text
apology, charmides, cratylus, critias, crito, euthydemus, euthyphro,
gorgias, greater-hippias, ion, laches, laws, lesser-hippias, lysis,
menexenus, meno, parmenides, phaedo, phaedrus, philebus, protagoras,
republic, sophist, statesman, symposium, theaetetus, timaeus
```

Discovery from disk is evidence, not the denominator. Adding or removing a
source cannot silently alter the target; a 28th dialogue requires an amendment
to this contract.

## Semantics

Completeness is a named target for which every required family passes. It is
never an average or aggregate percentage. Each check records a stable ID,
scope, state, expected and observed values, evidence, and remediation.

The states are `pass`, `fail`, `not_applicable`, and `contract_pending`.
`not_applicable` is valid only for a leaf with explicit exhausted-scope
evidence; absence is not evidence. A required family aggregate is always
`pass` or `fail`. `contract_pending` means that an artifact capability exists
without a ratified production denominator. Such a family cannot be required by
an implemented target and earns no completion credit.

A required family passes only when its applicable axes pass:

1. scope closure, including typed receipts for valid zero-result scopes;
2. validity and freshness against current inputs;
3. review closure with zero `unreviewed` and zero `needs_split` records;
4. provenance or deterministic reproducibility; and
5. exposure integrity where the target includes a public surface.

Rejected records may remain as provenance but are inactive. Quality warnings
do not change pass/fail. Thus a hash-current turn index with an explicit
whole-dialogue `(none)` speaker can pass while still reporting its attribution
limitation.

## Targets

### `corpus`

Requires the exact Greek source set and source manifest/provenance; exhausted
and terminally reviewed observation, claim, and bounded relation scopes;
byte-current Stephanus, turn, token, anchor, turn-length, assent, procedure,
and observation-turn-join artifacts; an exhausted and accepted nested
reported-turn scope (`CMP-REPORTED-TURNS`); valid clusters and dossiers; and a
static site that passes its existing size, accessibility, identifier, link,
fragment, search, and recording checks.

Observation and claim scope uses the canonical 30,000-byte segmented planners.
Explicit `no_observations` and `no_claims` receipts close scope. A relation
scope with zero deterministic candidates is an evidenced `not_applicable`
leaf, not a missing ledger. Coverage ratios remain quality measurements and do
not require an observation for every character.

### `knowledge-base`

Inherits `corpus` and additionally requires the exact 27 English sources and
current English Stephanus indexes, 27 complete accepted guided-reading
ledgers and reading pages, and 27 current operator-delegated Luna-sample-accepted quality-audit
manifests. Zero recordings is allowed. Any audio exposed by the site must have
the accepted manifest, bytes, production evidence, player, hashes, and chapter
inventory required by the existing validators; exposed drafts fail.

### `audio-edition`

Inherits `knowledge-base` and requires 27/27 completion of each audio stage:
accepted speaker attribution, production screenplay, render, mastering,
mechanical/ASR QA, explicit listening/production acceptance, accepted
recording manifest and publication MP3, and validated site player/chapters/
seeking/hashes/links. The verdict is conjunctive; an intermediate ready state
does not earn completion credit.

## Nested reported turns (`CMP-REPORTED-TURNS`)

Amended 2026-07-26 by the reported-turn scope census, whose ratification accepts this family as an
additional prerequisite of the edition-completeness release gate.

`CMP-DERIVED` measures the outer turn artifact. It cannot see whether the
speeches nested inside those turns were ever extracted, so the corpus could
report complete while a narrated dialogue's interior speakers had never been
looked for. This family answers one narrow question per canonical dialogue:

> Have we exhaustively looked for nested reported turns, reviewed every
> discovered span, and compiled the accepted structural data?

Scope is the reviewed manifest `wiki/reported-turn-scopes.json`: one entry per
canonical dialogue, `required` with its exact outer-turn cohort or `none`, each
binding the Greek source and outer-turn index hashes it was reviewed against and
citing a receipt under `wiki/review/`. Absence of a ledger is not evidence of
zero; a dialogue with no reviewed census fails. When either bound input changes,
the census is stale and the family fails until a reviewer recertifies.

A `required` dialogue passes only with a valid ledger whose represented outer
turns equal the manifest cohort exactly, zero `unreviewed` and zero
`needs_split` records, an atomic accepted projection, and a current nonempty
`derived/plato/voices/<dialogue>.toon`. A `none` dialogue is `not_applicable` on
its receipt's evidence.

Accepted records that state a genuine ambiguity with a substantive
`unresolved_reason` pass and are reported as their own count. Candidate owners
may be recorded as supporting evidence, but are optional and do not affect
completeness. Per-record `limits` prose is likewise optional and informational.

What a nested reported turn is, and the boundary cases, are ruled in
`docs/voices-protocol.md`. Claim joins, claim-speaker consistency, audio
attribution, and membership in `derived/plato/voices/cutovers.toml` are
deliberately irrelevant to this family: reported-turn data is complete or not on
its own terms, whether or not any consumer reads it.

## Apparatus

The quiet, evidence-citing apparatus described by
`docs/apparatus-protocol.md` is the repository capability closest to the
operator's tentative “steganography” idea. Its schema, validator, and renderer
exist, but no production candidate universe or explicit-zero protocol has been
ratified. Its content state is therefore `contract_pending`, and it is required
by none of the three implemented targets.

A future signed production plan must define candidate generation, zero-result
receipts, review closure, and a separate target before apparatus content can
affect completion. This contract does not authorize claims of hidden meaning.

## Public-release overlay

Public release selects `knowledge-base` unless this contract is amended. It
first requires the selected edition target, then independently requires:

- exact replay/editorial and source-acquisition provenance (`PUB-PROVENANCE`);
- an allowlisted, path-safe export manifest and matching materialized tree when
  supplied (`PUB-TREE`);
- matching code/content licenses, notices, source rows, and site surface
  (`PUB-LICENSE`);
- the static least-privilege public CI contract (`PUB-CI`); and
- the exposed-audio truth gate at the export boundary (`PUB-AUDIO-TRUTH`).

The local report does not claim knowledge of hosted CI or deployment state.
It excludes private commit identifiers and ephemeral absolute export paths.
