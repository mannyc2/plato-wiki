# Symposium Voice Cutover — Execution Report (the reported-speech voice attribution rollout steps 5–6)

## Authorization

On 2026-07-25 the operator directed execution of the reported-speech voice attribution rollout's remaining work.
Steps 1–3 and 7 had been executed earlier; step 4 (operator review of the
Symposium voice ledger) was satisfied by the 2026-07-20 ratification of all 168
voice records. This report records steps 5 and 6 — the pre-cutover validation
and the fail-closed claim-speaker migration — and is the execution report that
the reported-speech voice attribution rollout's extension section requires before wave 2 may be authorized.

## Cutover sequence, as run

The plan's corrected seven-part order was followed exactly:

1. Pre-cutover `bun run validate` — exit 0 with no authoritative voice index
   present.
2. `bun run harness derive voices symposium` — 168 accepted voices compiled to
   `derived/plato/voices/symposium.toon`, SHA-256
   `c575de0531e6eeb53d55f339867abc88dad9296a75b40d997e9a27b1f2cdba63`.
3. `migrate-claim-speakers.ts symposium --plan` — 178 speaker changes, 0 already
   correct, **0 accepted claims blocking**, 18 unresolved but not accepted, 0
   stance actors differing from owner. The blocking set was reviewed and empty.
4. `--apply` — 178 speaker changes written to `wiki/claims/symposium.md`
   (before `59a60b48…`, after `d89e5293…`).
5. `bun run harness derive voice-joins symposium` — 446 voice joins.
6. `--verify` — PASS; 176 accepted claims match the current authority.
7. Post-cutover `bun run validate` — exit 0 after the defect below was fixed.

## Result

Every accepted Symposium claim moved off the outer narrator. The distribution
follows the encomium sequence:

| owner | claims | | owner | claims |
| --- | ---: | --- | --- | ---: |
| ΔΙΟ. (Diotima) | 54 | | ΠΑΥ. (Pausanias) | 15 |
| ΑΛΚ. (Alcibiades) | 24 | | ΕΡΥ. (Eryximachus) | 13 |
| ΑΓΑ. (Agathon) | 20 | | ΑΡΙΣΤΟΔ. (Aristodemus) | 2 |
| ΑΡΙΣΤΟΦ. (Aristophanes) | 18 | | **migrated total** | **178** |
| ΦΑΙ. (Phaedrus) | 17 | | ΑΠΟΛ. retained (see below) | 18 |
| ΣΩ. (Socrates) | 15 | | **ledger total** | **196** |

The 18 records still carrying ΑΠΟΛ. are all `rejected` claims whose spans the
voice ledger records as `unresolved`. They are retained as provenance and are
inactive. No accepted claim is left straddling two meanings of `speaker`, which
is the invariant the plan's all-or-nothing requirement exists to protect. Two
further non-accepted records (one `needs_split`, one `rejected`) sit on resolved
spans and were migrated with the rest; this reconciles the 178/18 split against
the ledger's 176 accepted / 19 rejected / 1 needs_split composition.

## Defect found and fixed

The post-cutover validation initially failed with `invalid_speaker: 178`. The
cause was a real gap in step 2's wiring, not a data error: the claim validator
derived its allowed-speaker set from `derived/plato/turns/sigla.toml` alone.
That registry records sigla **as printed** in the Greek, and the Symposium
prints no in-scene sigla at all — which is precisely why the reported-speech voice attribution rollout step 1 created
the separate `derived/plato/voices/sigla.toml`. The validator never learned
about the second registry, so step 6's final validation could not have passed as
written.

Fix: `readVoiceSiglaRegistry` moved from `voices-validator.ts` to the leaf module
`voices-ledger.ts`, and `validSpeakers` in `claim-validator.ts` now accepts a
speaker licensed by **either** reviewed registry. This widens the lookup to a
registry the plan itself created; it does not weaken the invariant, which
remains "every claim speaker comes from a reviewed, committed registry."
Sigla-less dialogues keep `(unattributed)` as before. Two regression tests were
added: a voice-only siglum is accepted for a narrated dialogue, and a siglum in
neither registry is still rejected.

## Acceptance gates

- `claim_symposium_0073` → ΑΓΑ.; `claim_symposium_0106` → ΔΙΟ. with chain
  ΑΠΟΛ. → ΑΡΙΣΤΟΔ. → ΣΩ. → ΔΙΟ. — both hold.
- `obs_symposium_0201` is `cross_voice` with chain ΑΠΟΛ. → ΑΡΙΣΤΟΔ. → ΑΛΚ.;
  `obs_symposium_0036` is `cross_voice` with chain ΑΠΟΛ. → ΑΡΙΣΤΟΔ. Both remain
  `attributed: false`, as corrected in the plan.
- The frame exchange keeps its original structure: `derived/plato/turns/
  symposium.toon` is byte-unchanged, still 5 turns, with 172a–173e as turns
  0001–0004.
- Voice index and voice join are byte-stable across two consecutive derivations.
- `bun run test` 754 pass / 0 fail; `bun run typecheck` clean; `bun run validate`
  exit 0.
- Site regenerated: 3458 files, 0 duplicate ids, 0 broken paths, 0 broken
  fragments. The rendered Symposium claims page carries exactly the distribution
  above. `site/` is git-ignored, so no committed diff accompanies this.

## Authority boundary

Claim `speaker` values, the derived voice index, and the voice join changed. No
review status changed anywhere (validate's provenance enforcement passed with no
review-status delta). No Greek source, turn index, observation, relation,
commentary, voice record, or frozen candidate was modified. Wave 2 (phaedo,
euthydemus, protagoras) remains unauthorized until the operator accepts this
report alongside the already-accepted ledger and this migration.
