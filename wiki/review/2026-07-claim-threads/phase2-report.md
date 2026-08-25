# Claim-fate pilot — Phase 2 report (append-only stance-event repair)

Executed 2026-07-12 under two authorizations: the 2026-07-11 queue
construction (Phase 1 report, config v3) and the operator's explicit Phase 2
green-light of 2026-07-12 ("I give permission for step 2"), scoped to
`authorized_queue` (29 relations) only. Every `extension_candidates` entry
was rejected, enforced by `scripts/claim-threads-2026-07/phase2.ts`
(fail-closed; negative-tested below).

## What Phase 2 changed

Executor: `bun scripts/claim-threads-2026-07/phase2.ts --plan | --apply | --verify`;
machine-readable record: `phase2-execution.json` (byte-stable across reruns).

1. **4 appended `revised` stance events on 2 claims** (`wiki/claims/theaetetus.md`):
   - `claim_theaetetus_0005` (146c-146d, "knowledge is geometry … and the
     crafts"): revised at 163a (licensed by `rel_theaetetus_0013`, revising
     claim `claim_theaetetus_0076`) and at 187b (`rel_theaetetus_0016`,
     revising claim `claim_theaetetus_0177`).
   - `claim_theaetetus_0029` (151e, "knowledge is nothing other than
     perception"): revised at 182e (`rel_theaetetus_0018`, revising claim
     `claim_theaetetus_0153`) and at 210a-210b (`rel_theaetetus_0019`,
     revising claim `claim_theaetetus_0275`).
   - Each event copies the revising claim's committed `source_ref`
     byte-for-byte; every copied ref was re-hashed against
     `raw/plato/greek/theaetetus.txt` before writing.
   - `final_status` moved `left_standing -> revised` on both claims — the
     mechanical function of the last stance event that
     `claim-validator.ts` mandates, not an editorial judgment.
   - Each claim's `limits` gained exactly one appended, dated provenance
     sentence; all prior prose is preserved verbatim.

2. **18 validator-forced re-resolutions `standing -> superseded`**
   (`wiki/relations/theaetetus.md`, `wiki/relations/cross-dialogue.md`).
   `relation-validator.ts` requires both claims of a `standing` relation to
   be `left_standing`, so every accepted standing relation touching the two
   repaired claims had to move off `standing` in the same pass. All 18 are
   in `authorized_queue` — this is precisely why the queue was drawn where
   it was. `superseded` was chosen uniformly because it is the only
   resolution that records "overtaken by the threaded fate" without
   asserting that any cross-record conflict was textually resolved
   (`refuted_resolved` would over-claim and is forbidden for restatement
   kinds; `verbal_only` asserts a different semantics and needs a
   resolution_ref). Each edited relation's `limits` gained one appended,
   dated sentence noting that its prose describes the pre-threading state.
   - theaetetus (7): rel_theaetetus_0003, 0008, 0013, 0015, 0016, 0018, 0019
   - cross-dialogue (11): rel_cross-dialogue_0046, 0069, 0253, 0440, 0558,
     1094, 1104, 1126, 1241, 1264, 1266

3. **Nothing else.** 11 authorized relations required no change (their
   linked claims all remain `left_standing`): rel_theaetetus_0012, 0054;
   rel_cross-dialogue_0049, 0072, 0443, 0997, 1093, 1107, 1129, 1282, 1285.
   No observation, no review_status value, no basis prose, and no record
   outside the three files changed.

## Derivation rule (why exactly these four events)

An authorized relation licenses a stance event iff all of:
- `relation_kind: revision` — standing tensions/contradictions/restatements
  record co-present pulls, not fate events;
- intra-dialogue scope — the claim validator requires every stance event's
  `source_ref` to resolve into the claim's own dialogue file, so
  cross-dialogue relations cannot produce fate events by schema;
- the revised side (earlier top-level `start_char`) is the queue entry's
  flagged claim — revision flows from the later span onto the earlier
  claim, which matches the basis prose of all five intra revision relations
  in the queue (`rel_theaetetus_0003`'s revised side is
  `claim_theaetetus_0003`, which is not a flagged pilot definition, so it
  licenses no event);
- the revising span does not precede the flagged claim's last existing
  stance event (validator event-ordering).

The stance kind maps mechanically from the adjudicated relation kind
(`revision -> revised`); no fresh interpretive judgment enters the events.
The events record the dialogue's own definitional trajectory; the appended
limits sentences state explicitly that they do not record refutation.

## Fail-closed refusals (3 flagged claims untouched)

`phase2-execution.json` -> `fail_closed_claims` lists, per claim, every
standing relation outside the authorized queue that would break if its
`final_status` changed (the relation validator applies the standing rule to
records of any review_status, including rejected and needs_split):

- `claim_euthyphro_0043` — 18 blockers (12 accepted standing incl.
  `rel_euthyphro_0029` and `rel_cross-dialogue_0244`–`0252`, 5 needs_split,
  1 rejected). Consistent with the operator's Phase 1 direction: the five
  extension-candidate definitions require a separate fate adjudication
  before any scope extension.
- `claim_theaetetus_0177` — 4 blockers (3 rejected standing, 1 needs_split
  standing); additionally no authorized intra revision has 0177 as its
  revised side (`rel_theaetetus_0016` revises 0005 *into* 0177; the
  actual in-dialogue fate of the true-judgment definition — the jury
  argument at 200d-201c — has no accepted standing relation in the ledger,
  an extraction gap for a future relation pass, not for this phase).
- `claim_theaetetus_0234` — 1 blocker (rejected standing
  `rel_cross-dialogue_0167`); its only authorized relation is
  cross-dialogue (`rel_cross-dialogue_0997`), which cannot license an
  in-dialogue fate event.

## Verification

- `phase2.ts --plan` twice: `phase2-execution.json` byte-identical
  (sha `5a6634077464d997…`).
- Negative tests, all exit 1 with the queue restored byte-identical after
  each: tampered `input_files` sha -> "input drift"; `authorized: false`
  inside authorized_queue -> refused; extension candidate smuggled into
  authorized_queue -> duplicate-id refusal; `--apply` onto a dirty target
  ledger -> refused before writing.
- `--verify` (recomputed from disk): events present, final_status mapped,
  18 supersessions, no residual standing relation touches a repaired
  claim, all four event refs re-hashed against the raw Greek. PASS.
- Repo gates after apply: `bun run validate` exit 0; `bun run test`
  264/264; `bun run typecheck` clean.
- Phase 1 freeze: `generate.ts --check` now exits 1 on input-sha drift BY
  DESIGN — the Phase 1 artifacts describe the pre-Phase-2 ledger state
  they were adjudicated against (recorded in `phase2-execution.json`
  -> `phase1_freeze_note`).

## Independent-model review

Cross-vendor review executed 2026-07-12 via the OpenAI Codex CLI
(codex-cli 0.138.0, launched as `gpt-5.5`, reasoning effort high,
self-reported model id `gpt-5-codex`, sandbox `read-only`, approval
`never`, session 019f5685-db41-7470-adb8-a806b80dc030), driven by a
separate Claude session acting as review harness. A first attempt on the
config-default `gpt-5.6-sol` failed (model incompatible with CLI 0.138.0,
400 invalid_request), produced no verdict, and mutated nothing; the review
was relaunched on `gpt-5.5`.

Codex verified with its own reading of the diff and validators (not by
trusting `phase2-execution.json`):

- append-only claim edits confined to `claim_theaetetus_0005`/`_0029`
  (prior stance events byte-identical prefixes; prior limits preserved
  verbatim as prefix) — PASS
- appended kinds legal; `final_status` matches the validator map for the
  last event; event ordering non-decreasing; all four appended
  `source_ref` hashes recomputed against the raw Greek and matched — PASS
- event licensing by rel_theaetetus_0013/0016/0018/0019 with correct
  direction (flagged claim is the earlier side; event cites the later
  revising claim's span) — PASS
- exactly 18 `standing -> superseded` flips, each touching a repaired
  claim, all inside `authorized_queue`, none from `extension_candidates`;
  `superseded` carries no claim-status or resolution_ref requirement — PASS
- global scan: 20 relation records reference the repaired claims; 0
  remain `standing` — PASS
- `bun run validate` exit 0 — PASS
- fail-closed claims byte-identical to HEAD — PASS

Codex's overall verdict was REJECT on a single scope check: its brief
required the uncommitted tracked diff to span exactly three files, and the
worktree also carried `harness.config.json` and `plans/README.md`. Both
were modified before this session began, contain no Phase 2 content
(grep-verified by the reviewing session), and belong to other work lanes.
The reviewing session's disposition — ACCEPT-WITH-NOTES with required
remediation "stage only the three wiki files; keep the two stray files out
of the Phase 2 commit" — is adopted here; this commit stages Phase 2 paths
explicitly and leaves the two unrelated files uncommitted in their own
lane. The reviewing session additionally corroborated every mechanical
check independently (four SHA-256 recomputations, 18-flip extraction by
relation_id, prefix-preservation check, residual-standing scan, validate
exit 0). Worktree integrity across the review was hash-verified from two
sessions (`git status --porcelain` digest unchanged; this session's
SHA-256 of the ledger diff unchanged: `4dc45f53db03ab18…`).

## Boundary for any future phase

Phase 2 is complete and closed. Threading the fates of
`claim_theaetetus_0177`, `claim_theaetetus_0234`, `claim_euthyphro_0043`,
or any extension-candidate definition requires: operator scope extension,
fate adjudication of the five extension definitions
(`claim_charmides_0014`/`0015`, `claim_euthyphro_0024`/`0045`/`0050`), and
re-adjudication or re-review of the blocker relations enumerated in
`phase2-execution.json`. No corpus-wide rewrite follows from this pilot.
