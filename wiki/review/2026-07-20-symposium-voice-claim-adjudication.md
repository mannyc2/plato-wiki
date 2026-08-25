# Symposium Voice-Claim Adjudication — 2026-07-20

## Authorization and review method

On 2026-07-20 the operator delegated the Symposium voice-ledger record review
and blocked-claim adjudication to parallel Codex subagents. One agent produced
the candidate claim repairs from `raw/plato/greek/symposium.txt`; a second,
independent agent rechecked every proposed term, source character range,
accent, punctuation mark, canonical source reference, claim field, and expected
voice against the same Greek source and the unreviewed voice ledger. Neither
agent consulted a translation, commentary, or doctrinal interpretation.

This note records the portion that survived both reviews and was applied to the
claim and relation ledgers. It does not ratify the voice ledger and does not
authorize speaker migration.

## Exact term repairs

The following accepted claims received only exact `greek_terms` repairs:

- `claim_symposium_0024`
- `claim_symposium_0051`
- `claim_symposium_0052`
- `claim_symposium_0070`
- `claim_symposium_0090`
- `claim_symposium_0092`
- `claim_symposium_0094`
- `claim_symposium_0099`
- `claim_symposium_0100`
- `claim_symposium_0101`
- `claim_symposium_0102`
- `claim_symposium_0103`
- `claim_symposium_0109`
- `claim_symposium_0110`
- `claim_symposium_0115`
- `claim_symposium_0123`
- `claim_symposium_0124`
- `claim_symposium_0128`
- `claim_symposium_0164`

Every new scalar occurs verbatim inside its own canonical claim window. Terms
that cross an editorial marker were split into two exact scalars, and all
display ellipses from the review report were expanded to the full literal
source text before application.

## Composite-claim hard cutover

The old composite meanings of `claim_symposium_0112` and
`claim_symposium_0113` mixed Diotima's framing with Socrates's answers. They
were replaced in place with the Socrates-owned answer records, preserving the
stable IDs used by the accepted intra-Symposium relation. Two separate records
were appended:

- `claim_symposium_0190`: Diotima's beautiful-things premise and restatement
- `claim_symposium_0191`: Diotima's substitution of good for beautiful

The four records use canonical 204d or 204e source references and exact support
ranges that avoid the two hypothetical third-party spans identified during
voice review. Their materialized speakers remain `ΑΠΟΛ.` because this is a
pre-cutover claim repair. The expected eventual owners are `ΣΩ.` for 0112/0113
and `ΔΙΟ.` for 0190/0191, but no owner was written into the claim ledger.

## Relation consequences

- `rel_symposium_0006` remains accepted with the same claims, pair, kind, and
  resolution; only its basis and limits were rewritten to describe the two
  Socrates answers accurately.
- `rel_cross-dialogue_0024` changed from accepted to rejected. Its frozen
  candidate link depended on `τῶν ἀγαθῶν`, but that phrase belongs to an
  unresolved hypothetical question rather than the exact Socrates-owned
  support of repaired `claim_symposium_0113`.

The frozen relation-candidate JSON was intentionally left untouched. Rejection
of the relation preserves the historical candidate and records why it no longer
survives exact attribution.

## Boundary

No voice record or review status was changed. No claim speaker was migrated.
No voice or join authority artifact was derived. Greek source files,
observations, frozen relation candidates, code, and site state were untouched.
The remaining blocked claims were not silently accepted; they stay for a later
pass after the voice ledger itself is corrected and ratified.

## Final blocker adjudication

The boundary above describes the initial repair pass only. The operator then
delegated final disposition of the remaining blocked claims. This pass used the
final voice candidate immediately before its separate status-only ratification:
168 records at SHA-256
`f8572400b39ed8343554562a1e517ac8f5b5621b61f42db9b05ea2961cda1efd`.
The voice-lane reviewers subsequently ratified that candidate under their own
review note and ingest-log entry. This claim lane did not change any voice
record or voice review status.

### Retained accepted records

Nine accepted records were repaired in place with exact Greek support and,
where necessary, narrower content or source scope:

- `claim_symposium_0001`
- `claim_symposium_0006`
- `claim_symposium_0007`
- `claim_symposium_0008`
- `claim_symposium_0009`
- `claim_symposium_0114`
- `claim_symposium_0120`
- `claim_symposium_0121`
- `claim_symposium_0181`

The stronger repair to `claim_symposium_0120` retains only Diotima's contrast
between an anonymously reported account and her own account. The anonymous
proposition itself is not attributed to her.

### Rejections and stable-ID splits

Eleven existing accepted records changed to `rejected` because their exact
support remains unresolved or cannot be licensed to one owner:

- `claim_symposium_0004`
- `claim_symposium_0005`
- `claim_symposium_0091`
- `claim_symposium_0093`
- `claim_symposium_0095`
- `claim_symposium_0096`
- `claim_symposium_0097`
- `claim_symposium_0107`
- `claim_symposium_0116`
- `claim_symposium_0118`
- `claim_symposium_0119`

Four composite records retain their accepted stable IDs for the licensed
portion, while the unresolved portion is appended under a rejected ID:

- `claim_symposium_0098` retained; rejected `claim_symposium_0192` appended
- `claim_symposium_0104` retained; rejected `claim_symposium_0193` appended
- `claim_symposium_0105` retained; rejected `claim_symposium_0194` appended
- `claim_symposium_0133` retained; rejected `claim_symposium_0195` appended

The repaired `claim_symposium_0120` likewise retains its accepted stable ID,
while rejected `claim_symposium_0196` records the anonymous proposition that
those seeking their own half are lovers. All five appended records preserve the
pre-cutover materialized speaker `ΑΠΟΛ.` and explicitly record why ownership is
unresolved.

The earlier terminal dispositions remain unchanged:
`claim_symposium_0069`, `claim_symposium_0089`, and
`claim_symposium_0138` remain rejected, and `claim_symposium_0016` remains
`needs_split`.

### Relation and commentary consequences

The following accepted relations changed to `rejected` because their stated
basis depended on a clause now isolated in rejected
`claim_symposium_0195`:

- `rel_symposium_0003`
- `rel_symposium_0004`
- `rel_cross-dialogue_0098`
- `rel_cross-dialogue_0509`
- `rel_cross-dialogue_0567`

`rel_cross-dialogue_1039` and `rel_cross-dialogue_1041` also changed to
`rejected` because their Symposium-side support was the now-rejected
`claim_symposium_0116`. `rel_cross-dialogue_1051` remains accepted, but its
basis is narrowed to repaired `claim_symposium_0133`'s negative clause and its
limits exclude the unresolved generation-and-birth clause.

The relation validator received one narrow hard-cutover rule needed to retain
these failed historical candidates: a rejected relation may reference an
existing non-accepted claim. Accepted, unreviewed, and `needs_split` relations
still require accepted claims, and a missing claim ID still fails validation.
Focused regressions cover all three cases.

`comm_symposium_0015`, `comm_symposium_0050`, and
`comm_symposium_0056` changed from accepted to `unreviewed` because their
arguments cite claims or relations changed by this adjudication. No commentary
text was rewritten or silently reaccepted.

The commentary protocol permits citations only to accepted records. The eight
newly invalid citation IDs were therefore removed from those three blocks and
from the already-unreviewed `comm_symposium_0054` and
`comm_symposium_0055`: rejected claims `0004`, `0095`, `0096`, `0097`,
`0107`, and `0116`, plus rejected relations `rel_symposium_0003` and
`rel_symposium_0004`. The five commentary bodies were left unchanged for later
review.

### Verification boundary

Both adjudication waves were independently checked against
`raw/plato/greek/symposium.txt` without translations or commentary. The final
claim ledger contains 196 records: 176 accepted, 19 rejected, one
`needs_split`, and zero unreviewed. Its voice-join census is 178 resolved, 11
`needs_anchor`, seven `unresolved_span`, and zero `cross_voice`; all 18
non-resolved records are non-accepted, so there are zero accepted migration
blockers.

This pass did not migrate speakers, derive a voice index or join artifact,
modify Greek sources or observations, change the voice ledger, touch frozen
relation candidates or site state, or commit changes. Claim speakers remain
`ΑΠΟΛ.` pending the separately gated cutover.
