# Review — the two code changes made during the Symposium cutover

Reviewed 2026-07-25 at `739061b`, on operator instruction, as the condition for
disposing of `wiki/review/2026-07-25-symposium-voice-cutover-execution.md`. Both
changes were self-disclosed by the session that made them
(`docs/voices-protocol.md` §6), one of them with the observation that "the
agent changed the check that was failing" is the shape of a bad call. It is, so
both were re-derived from the code rather than from that account.

Verdict: **both changes stand.** Each had one real defect, fixed in the same
commit as this note. Neither defect affects the cutover's result, so the
execution report is dispositioned **accepted** and wave 2 is authorized.

## 1. `PUB-CI` in `packages/harness/src/public-release.ts`

**The premise is legitimate.** The edition-completeness contract wrote the gate as a literal grep of the
workflow for `bun run test` / `typecheck` / `validate`. The required CI baseline then ratified a
single `bun run ci` entry point. A workflow that correctly delegates to that
entry point therefore failed a gate that had become stale by ratified design
change — the gate was wrong, not the workflow. Following the entry point is the
right repair.

**Correction to the report's own claim.** The change is not "strictly stronger".
It widens the accepted set — delegating workflows now pass where they previously
could not — and adds one compensating requirement, that the driver abort on a
failed stage, which applies *only* on the delegated path. Stronger there,
unchanged on the direct path, more permissive overall. That is a defensible
trade, but it should be described as one.

**Defect found: the gate encoded file layout, not the contract.** The driver was
resolved by matching the first `\S+\.ts` token in the `ci` script, so an equally
correct entry point that chains the gates inline —
`"ci": "bun run test && bun run typecheck && bun run validate"` — resolved no
driver and failed the gate. A future simplification of the script would have
broken the release gate for no real reason.

Fixed: the contract is now checked wherever the manifest resolves it — against
the script itself when the script names the gates, otherwise against the driver
it runs. A chained script needs no abort check, because `&&` already stops at the
first failing gate. Two tests added, one positive and one negative (a chain that
covers only some gates).

**Accepted weakness, now documented in the code.** `/process\.exit\(1\)/` is a
text proxy of the same species as the regex it replaced: it cannot see a `throw`,
a `process.exitCode` assignment, or an unreachable `process.exit(1)`. Tightening
it means executing the driver, which a static gate does not do. Left as is, with
the limitation written into the comment rather than left implicit.

**Checked by hand, outside the gate's reach.** The gate does not verify that the
workflow *gates on* the step it delegates to; `continue-on-error: true` or
`if: false` would neuter CI while `PUB-CI` still passed.
`.github/workflows/ci.yml` is clean: no `continue-on-error`, and `if: always()`
appears only on the two `upload-artifact` steps, where it is correct.

## 2. `validSpeakers` in `packages/harness/src/wiki/claim-validator.ts`

**The diagnosis is right and the fix does not weaken the invariant.** The claim
validator derived its allowed-speaker set from `derived/plato/turns/sigla.toml`
alone. That registry records sigla *as printed*, and the Symposium prints no
in-scene sigla at all — which is why the reported-speech voice attribution rollout step 1 created a separate voice
registry. The validator never learned about it, so the reported-speech voice attribution rollout step 6's final
validation could not have passed as written. Accepting a speaker licensed by
either reviewed registry keeps the invariant intact: every claim speaker still
comes from a reviewed, committed registry.

**Defect found: it widened the set where nothing checks owners.** The wave-2
voice sigla were deliberately pre-registered as a *superset*, so registration
earns no attribution. Combined with the union, a hand-edited
`speaker: "ΠΡΟΔ."` in protagoras passed validation on a siglum **no voice record
licenses** — and protagoras has no authoritative voice index, so the separate
check that every accepted claim's speaker equals its resolved owner does not
apply there either. Five of protagoras's eight registered voices own no span at
all. Before the change, only printed sigla passed. Hand-attribution is precisely
what this lane exists to prevent.

Fixed structurally rather than by pruning entries later: the voice registry
licenses a claim speaker only for a dialogue that has an authoritative voice
index — exactly the point at which owner-equality is also enforced. One
regression test added; the two tests the original change added still pass
unchanged, because the Symposium has an index.

## What this review did not cover

The Symposium ledger's 168 records were ratified 2026-07-20 and were not
re-examined here. The migration's arithmetic (178 changed, 18 retained on ΑΠΟΛ.
as inactive rejected provenance) was read for internal consistency against the
ledger's 176 accepted / 19 rejected / 1 needs_split composition and reconciles;
it was not independently recomputed.
