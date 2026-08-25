# Claim Stage-One Audit: Euthyphro, Crito, Meno

Date: 2026-07-03

Scope:
- `wiki/claims/euthyphro.md` (57 claims)
- `wiki/claims/crito.md` (52 claims)
- `wiki/claims/meno.md` (38 claims; stage-one Meno coverage through 78e)

Sample method:
- Reproducible pseudo-random ordering by SHA-256 of
  `2026-07-03-stage-one:<claim_id>`.
- First 15 claims in that ordering were checked against the cited Greek
  source spans with `resolveSourceSpan`.

Audit checks:
- Claim content restates a checkable assertion, question, report, definition,
  or method rule in the cited span.
- Stance event span verifies the event kind locally.
- `final_status` follows mechanically from the last stance event.
- Limits do not add an uncited interpretation.

Sample results:

| Claim | Span | Result | Notes |
|---|---:|---|---|
| `claim_crito_0045` | 52e-53a | pass | Cited span supports the claim that Socrates did not choose Sparta, Crete, or other cities and traveled abroad very little. |
| `claim_crito_0050` | 54c-54d | pass | Report framing is explicit: Socrates says he seems to hear the Laws' speech. |
| `claim_meno_0015` | 73e | pass | Meno explicitly says there are other virtues besides justice. |
| `claim_euthyphro_0028` | 10c-10e | pass | The explanatory-direction claim is stated in the god-loved/holy argument. |
| `claim_meno_0034` | 78b-78c | pass | The ability/wanting contrast follows from the local exchange. |
| `claim_crito_0033` | 50b | pass | The claim is framed as what could be said for the law that verdicts are authoritative. |
| `claim_crito_0036` | 51b-51c | pass | The personified Laws' command/persuade thesis is checkable in the span. |
| `claim_meno_0017` | 74b | pass | The roundness/shape example functions as a method rule for definition. |
| `claim_crito_0001` | 43b | pass | Socrates states that vexation at death would be out of tune for someone of his age. |
| `claim_euthyphro_0053` | 15c | pass | Socrates states the incompatibility between the prior agreement and the present position. |
| `claim_euthyphro_0040` | 13d | pass | Socrates reformulates divine tendance as service to the gods. |
| `claim_meno_0033` | 78b | pass | Wanting good things is treated as common to all in the local argument. |
| `claim_meno_0010` | 73c | pass | The same virtue for all people is stated as the conclusion of the admission chain. |
| `claim_meno_0022` | 76a | pass | Socrates gives "shape is the limit of a solid" as a definition. |
| `claim_crito_0040` | 51d-51e | pass | The tacit-agreement thesis is stated in the Laws' speech. |

Failures: 0 / 15.

Watch item:
- Some `Crito` records in the personified-Laws speech sit near the
  `thesis` / `report` boundary. This is not a span-checkability failure; the
  review pass can still reject or split individual records if it wants a
  stricter attribution policy.

Decision: proceed to the stage-one claim review pass.

STOP condition check: not triggered. The plan threshold is more than 2
span-checkability failures in 15 sampled claims; this audit found 0.

## Stage-One Review Pass Rationale

The stage-one review pass applies the same criterion used in the audit:
accept a claim when the cited span supports the English content, the
stance event is locally checkable, and the mechanically derived
`final_status` matches the final event. Reject or mark `needs_split` only
when the claim cannot be checked at the cited span, merges distinct claims
that should be separated, or adds interpretation not present in the cited
span.

Euthyphro review result: 57 accepted, 0 rejected, 0 needs_split,
0 unreviewed.

Crito review result: 51 accepted, 0 rejected, 1 needs_split,
0 unreviewed.

Meno review result: 37 accepted, 1 rejected, 0 needs_split,
0 unreviewed.

Non-accepted records:
- `claim_crito_0002`: marked `needs_split`.
- `claim_meno_0005`: marked `rejected`.
