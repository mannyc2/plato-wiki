# Symposium reported-turn re-review and first extraction (The Symposium re-review steps 2A–5)

Executed 2026-08-01 on branch `symposium-rereview/narrator-repeat-reviewed-licence`.
Greek source only (`raw/plato/greek/symposium.txt`); no translation, claim ledger,
commentary, or external editor's speaker label was consulted at any point in the
extraction or review.

## Baseline re-verified before any edit

The Symposium re-review's frozen Step 1 baseline was re-confirmed at the start of this session,
all five bound hashes matching:

```text
raw/plato/greek/symposium.txt              260b7c57…3447a7
derived/plato/turns/symposium.toon         6d86dd3d…7db95f8329
wiki/voices/symposium.md                   a5aea65a…cded924cd8514
derived/plato/voices/symposium.toon        c575de05…9a27b1f2cdba63
derived/plato/joins/voices/symposium.toon  3993cc29…9de3f6465db68
```

`bun run validate` exit 0; `migrate-claim-speakers.ts symposium --verify` PASS
(176 accepted claims match the current authority, 178 speakers migrated);
`git status` clean.

## Step 2A — the builder is rearchitected onto total disposition

`scripts/voices-2026-07/build-symposium-voice-ledger.ts` gained a source-derived
enumeration of **both** required outer turns, and a fail-closed coverage gate.
Measured discrimination, which reproduces the plan's own numbers exactly:

| | plan predicted | gate reports | independent audit |
|---|---|---|---|
| depth≥3 gaps | 51 | 51 | 51 |
| gap chars | 12715 | 12715 | 12715 |
| flagged | 2 | 2 | 2 |
| false positives | 0 | 49 clean | 0 |

The gate was **observed failing first** on the unfixed region set, naming
`[83070, 88627)` (16 uncited naming formulas of 18 present) and
`[104101, 107347)` (8 of 9), exit 1. Keying on *presence* instead of *uncited*
would flag 17 gaps; keying on uncited flags exactly the two. No length threshold
was added and none is needed.

The gate also reports `turn_symposium_0001` as carrying no records — the
unextracted cohort — rather than passing it silently.

Tests: 16 pass. The characterization test of invariant 5 (inject a reporting
formula into a previously empty gap → build fails) exists and passes. The
43-interval test is retitled `known-record regression: …` so no future reader
mistakes a restatement of the builder's own inventory for coverage evidence.
`discovery identifies acts and assigns no owners` pins the architectural
boundary; `discovery flags the horan trap at 84958 and never resolves it to
Socrates` pins the specific trap.

## Step 3 — three regions reviewed, each by two independent Greek-only passes

### `turn_symposium_0001` [0, 2786) — first extraction

No prior pass had dispositioned this cohort at all; The Symposium re-review's "reviewed twice"
was unmet for it. Two independent blind passes produced **byte-identical record
geometry**: 11 records, same spans, chains, depths, authority shapes and
evidence offsets, nothing blocked.

- 1 depth-1 `ΑΠΟΛ.` frame record, `printed_siglum` @[12,17).
- 4 depth-2 `ΑΠΟΛ.>ΑΠΟΛ.` narrator self-reports, each on an in-span
  `person_marked_reporting_formula`: `κἀγὼ εἶπον ὅτι` @[826,840) and @[1489,1503),
  `ἦν δ’ ἐγώ` @[1035,1044) and @[1758,1767). These are the adjacent-repeat
  licence on the explicit-evidence route.
- 6 depth-2 `ΑΠΟΛ.>ΓΛΑΥ.` records by `reviewed_attribution`, candidate set
  `["ΑΠΟΛ.", "ΓΛΑΥ."]` on all six, both reviewers independently.

Glaucon is **not** resolved by explicit evidence, and that is the finding, not a
shortfall: the only naming in the turn is the vocative `ὦ Γλαύκων` @[1046,1055),
and a vocative names the addressee. The adjudications rest on third-person
`ἔφη`/`καὶ ὅς` excluding the first-person narrator, plus second-person address to
that narrator — grammatical person, addressee, and response adjacency, all listed
valid inputs.

Tiling: `sha256(src.slice(0, 2786))` = `f512032d…6cf3b201d`, which is the
`text_sha256` the turn index records for `turn_symposium_0001`. The depth-1
record is the tiling; the 10 depth-2 records nest inside with zero same-depth
overlap.

### O1 `[83070, 88627)` and O2 `[104101, 107347)` — the unexamined regions

Both regions had **zero** depth≥3 records, so 8,803 characters of four-party
banquet dialogue compiled to `ΑΡΙΣΤΟΔ.` by inheritance from
`voice_symposium_0002` — a speaker who utters none of it.

Two independent passes converged on **owners and authority shape for all 30
records** (O1: 23, O2: 7), nothing blocked. All 119 evidence refs and exemptions
byte-verified. Records plus exemptions form an exact **gap-free, overlap-free
partition** of every byte of both regions — 50 intervals in O1, 23 in O2 —
independently confirmed.

Reviewer disagreements were boundary conventions only, adjudicated as follows:

- 26 of 30 spans differed by a single trailing `\n`. Adopted the exclusive form.
- Two spans differed materially, both where one reviewer swallowed the trailing
  narratorial formula into the speaker's span: `" φάναι τὸν Σωκράτη.\n"` and
  `" εἰπεῖν τὸν Ἀλκιβιάδην. "`. Adopted the **exclusive** boundary — this is the
  same defect The Phaedo discourse attribution review corrected in Phaedo turn 0031, where records began at the
  `{p}` unit's first character and put the narratorial frame inside the span of
  the person that frame names.
- Candidate sets: one reviewer gave local sets, the other widened toward everyone
  present. Adopted the **local** sets, per "Global presence is not a candidate
  set".

**`@84958` — ruled `ΑΛΚ.`, by adjudication, never `ΣΩ.`** In
`καὶ ἅμα μεταστρεφόμενον αὐτὸν ὁρᾶν τὸν Σωκράτη, ἰδόντα δὲ ἀναπηδῆσαι καὶ εἰπεῖν
ὦ Ἡράκλεις …`, `τὸν Σωκράτη` is the accusative **object** of `ὁρᾶν`; `αὐτόν` is
its subject, and `ἰδόντα` agrees with the subject of `ἀναπηδῆσαι`/`εἰπεῖν`. The
seer leaps up, not the seen. Both passes reached `ΑΛΚ.` independently, by
`reviewed_attribution` rather than by promoting the pronoun to evidence; the
introducing clause is carried as a byte-cited exemption and the record is the
utterance it introduces.

**A second trap of the same shape was found and exempted**, at `@106761`:
`τὸ μέντοι κεφάλαιον, ἔφη, προσαναγκάζειν τὸν Σωκράτη ὁμολογεῖν αὐτούς …`. Here
`ἔφη` governs `προσαναγκάζειν` with `τὸν Σωκράτη` as its accusative subject, but
the content is indirect summary, not transmitted speech. Exempted as
argumentative recap. A matcher keying on "reporting verb near a named accusative"
emits a spurious `ΣΩ.` record at both sites.

**Deviation from the plan's expectation, recorded.** The 2026-07-29 amendment
anticipated that lifting `segmentExchange` over O1 would yield "16 resolved + 10
unresolved". This review emits **0 unresolved** in O1. That figure was a
prediction about a mechanical lift, not a target, and two independent passes
converged on every owner — but the deviation is stated rather than buried. The
thinnest adjudication is `[88488, 88519)` `τἀληθῆ ἐρῶ. ἀλλ’ ὅρα εἰ παρίης.` →
`ΑΛΚ.`, which rests on the next turn answering it with `τά γε ἀληθῆ παρίημι`,
picking up both `τἀληθῆ` and `παρίης` lexically. That is response adjacency plus
lexical coreference, not alternation — but it and its partner `[88524, 88583)`
are the first two to demote if a later review judges any adjudication too thin.

### The 74 legacy unresolved records

Reviewed by two independent blind passes, which agreed on 62 and disagreed on
12. All disagreements were closed by the operator's 2026-07-30 ruling extending
narrator-repeat licence to `reviewed_attribution`.

- 58 resolved by `reviewed_attribution`, including the 11 ruled `ΣΩ.` replies at
  `["ΑΠΟΛ.","ΑΡΙΣΤΟΔ.","ΣΩ.","ΣΩ."]` depth 4 with candidates `["ΔΙΟ.","ΣΩ."]`,
  and `voice_symposium_0126` → `ΑΛΚ.` at
  `["ΑΠΟΛ.","ΑΡΙΣΤΟΔ.","ΑΛΚ.","ΑΛΚ."]` with candidates `["ΑΛΚ.","ΣΩ."]`.
  Per the ruling, `μοι` and `ὡμολόγηκα` sit in the hashed `context_span` and the
  `rationale`, never in `evidence_refs`.
- 1 resolved on cited bytes: `voice_symposium_0006` → `ΠΑΙΣ.` on
  `role_reporting_formula` @[5944, 5989).
- 1 retained genuinely unresolved with candidates.
- 14 left untouched pending an operator ruling — see below.

Resolved terminal owners across the 74: ΣΩ. 28, ΑΓΑ. 16, ΔΙΟ. 11, ΕΡΥ. 2,
ΑΛΚ. 1, ΠΑΙΣ. 1.

## Defects found in the previously accepted cohort and final rulings

All 168 accepted records were byte-verified against the source in this session:
**168/168 `span_sha256` correct, 191/191 evidence refs (including antecedents)
byte-exact, zero mismatches.** The Symposium re-review rule 9's byte half is therefore satisfied
for all 94 explicit records, not the 41 a frozen pass had spot-checked.

Two interpretive defects were found and are named here as the rule requires:

1. **Former `voice_symposium_0161` [73032, 73111) — FIXED by the operator's
   2026-08-01 ruling.** The span opened with the narratorial `ἣ δ’ εἶπεν, `
   (byte-verified at [73032, 73044)), putting Socrates' frame inside Diotima's
   span. The The Phaedo discourse attribution review Phaedo turn-0031 precedent would move the start to 73044.
   **It cannot be applied mechanically.** This record's authority shape is
   `anchored_dialogue_turn`, and its required in-span cue *is* that same
   `ἣ δ’ εἶπεν` at [73032, 73042). Moving the start puts the cue outside the
   span, and the validator then reports both `evidence_cue_not_in_span` and
   `evidence_cue_missing`. The remaining span is
   `Διανοῇ οὖν δεινός ποτε γενήσεσθαι τὰ ἐρωτικά, ἐὰν ταῦτα μὴ ἐννοῇς;` — no
   reporting verb and no vocative, so no other in-span cue is available on the
   Greek. `Διανοῇ`/`ἐννοῖς` are second person, the addressee's person, not a
   reporting formula.

   Fixing it therefore required converting the record to `reviewed_attribution`
   — the Phaedo precedent works there precisely because Phaedo uses
   `anchored_dialogue_turn` zero times and carries the third-person formula as a
   *rationale ground* rather than as in-span evidence. The operator authorized
   that attribution decision. The surviving record is renumbered
   `voice_symposium_0146`, its speech span is `[73044, 73111)`, its span hash is
   `fbae67fa3190ee7880915852d0d6efba2cb1444bdf8d572fa46eb15cdabd3d65`,
   and its reviewed context is `[72993, 73277)` with hash
   `77325d7d2bb46432cb6e1e73572edb15e6268cbc69bf10a5384ed0aba6ee3c09`.

   **The systemic worry was checked and is unfounded.** Before the fix, exactly
   one of 42 `anchored_dialogue_turn` records had its cue at the span start. That
   anomaly was converted; the 41 retained anchored records are clean.

2. **Former `voice_symposium_0092` [58729, 58755) — DISSOLVED by the operator's
   2026-08-01 ruling.** The span was `Συμφάναι ἔφη τὸν Ἀγάθωνα.` and its evidence cited
   `"φάναι ἔφη τὸν Ἀγάθωνα"` at [58732, 58753) — the compound verb `Συμφάναι`
   with its `Συμ-` sliced off. The cited "formula" is a mutilated word, and the
   construction reports *that* Agathon assented, transmitting no words. Under the
   2026-07-26 scope ruling it is not a reported turn. The record was physically
   deleted; `[58729, 58755)` now inherits `ΑΡΙΣΤΟΔ.` from the depth-2 parent.
   No accepted claim speaker moved as a result.

## Final disposition of the other referred items

1. **The 14 no-direct-speech records were deleted with provenance** (`0010`, `0014`, `0017`, `0018`, `0020`,
   `0036`, `0084`, `0090`, `0091`, `0124`, `0127`, `0142`, `0145`, `0151`).
   Spans such as `Ὁμολογεῖν.`, `φάναι εἶναι.`, `ὡμολόγει.` are
   accusative-and-infinitive or finite narration reporting *that* someone
   assented. They transmit no words and are not reported turns. The correct
   disposition is **deletion with provenance**, not a rejection tombstone: the
   compiler requires a tombstoned interval to be re-covered by accepted records
   *at least as deep*, and the correct outcome here is falling back to the
   depth-2 parent, which is shallower. Removing reviewed records is itself a
   review action. The operator authorized that hard cutover on 2026-08-01. All
   fourteen records were physically removed, with no rejection tombstones, and
   their bytes now inherit the correct shallower parent.

   **Consequence:** `unresolved_without_candidates` falls from 14 to 0 without
   asserting candidates for spans that contain no direct speech.

2. **Q/A adjacency is confirmed as a licensed adjudication ground.** 26 of the 74 resolutions rest on
   question/answer adjacency inside a *named* two-party bound. The protocol lists
   question/answer adjacency among the valid inputs to a reviewed adjudication and
   separately prohibits automatic alternation. The operator confirmed these as
   contextual adjudications inside named two-party bounds; all 26 remain resolved.

3. **`ΖΕΥΣ.` and `ΗΦΑΙ.` remain registered but used zero times.** Both were
   registered by operator ruling on 2026-07-29 because the Greek names them as
   owners — Zeus as nominative subject of `λέγει` at 190c, Hephaestus of the
   counterfactual `ἔροιτο` at 192d. Their words are depth-4 quotations inside
   Aristophanes' speech, currently compiling to `ΑΡΙΣΤΟΦ.` This is a real omission
   but a different class from O1/O2 — nested quotation, not unexamined region —
   and it lies outside the O1/O2 scope the 2026-07-29 amendment set. The operator
   chose items 1–4 only, so these depth-4 quotations are explicitly deferred to
   The corpus reported-turn completion campaign's future extraction work and are not silently counted as The Symposium re-review work.

Physical deletion made the old numeric IDs non-consecutive. Because the ledger
validator requires a consecutive accepted sequence, every surviving record was
renumbered `voice_symposium_0001` through `voice_symposium_0194` in source-ledger
order. This is a hard cutover: the derived index, joins, migration receipt, and
tests were regenerated against the new IDs; the old IDs above remain only as
provenance identifiers.

## Gates

<GATES>
Executed in the documented fail-closed order, without committing the transient interval:

```text
bun run harness derive voices symposium        209 accepted voices
bun scripts/.../migrate-claim-speakers.ts --plan   6 changes, 0 accepted claims blocking
bun scripts/.../migrate-claim-speakers.ts --apply  6 applied
bun run harness derive voice-joins symposium   446 voice joins
bun scripts/.../migrate-claim-speakers.ts --verify PASS (176 accepted claims match authority)
bun run --cwd packages/harness test            861 pass, 0 fail
bun run typecheck                              exit 0
```

Final bound hashes:

```text
wiki/voices/symposium.md                   928c0497a9a0a2938b5014fb39b1c5b506cb2c3b0e83a9474ddb7094d1b14ebd
derived/plato/voices/symposium.toon        e6d157448e4dc68fe4635cd4bffb345c8720da300533fd55541fc06b762c8837
derived/plato/joins/voices/symposium.toon  48ca33a7eded64f17f9c0bab100799b780284dc1906ea8e41ff5f7a70adb8f7a
wiki/claims/symposium.md                   bd32dd02bf0d14bef81328905c3bf5be9200b5fe25b498deaddc812d8069b185
```

## Claim effects — all six enumerated

Every change moves a claim off the outer frame narrator `ΑΠΟΛ.` onto the
innermost textually licensed owner. `wiki/claims/symposium.md` shows exactly
6 insertions and 6 deletions; no other line moved.

| claim | from | to | licensing voice record | chain |
|---|---|---|---|---|
| `claim_symposium_0004` | ΑΠΟΛ. | ΕΡΥ. | `voice_symposium_0009` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΕΡΥ. |
| `claim_symposium_0118` | ΑΠΟΛ. | ΔΙΟ. | `voice_symposium_0119` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ.>ΔΙΟ. |
| `claim_symposium_0192` | ΑΠΟΛ. | ΣΩ.  | `voice_symposium_0045` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ. |
| `claim_symposium_0193` | ΑΠΟΛ. | ΔΙΟ. | `voice_symposium_0106` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ.>ΔΙΟ. |
| `claim_symposium_0194` | ΑΠΟΛ. | ΔΙΟ. | `voice_symposium_0108` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ.>ΔΙΟ. |
| `claim_symposium_0195` | ΑΠΟΛ. | ΔΙΟ. | `voice_symposium_0123` | ΑΠΟΛ.>ΑΡΙΣΤΟΔ.>ΣΩ.>ΔΙΟ. |

Accepted speaker histogram, before → after: ΑΠΟΛ. 18 → 12; ΔΙΟ. 54 → 58;
ΣΩ. 15 → 16; ΕΡΥ. 13 → 14. ΑΛΚ. 24, ΑΓΑ. 20, ΑΡΙΣΤΟΦ. 18, ΦΑΙ. 17, ΠΑΥ. 15 and
ΑΡΙΣΤΟΔ. 2 are unchanged. No claim `review_status` changed; no claim was split.

The operator-ruling pass caused one additional mechanical speaker migration:
`claim_symposium_0196`, a rejected split record, moved `ΑΠΟΛ.` → `ΔΙΟ.` on
renumbered `voice_symposium_0136`. Its exact support is no longer blocked by a
pseudo-turn. Its `limits` now states the still-operative rejection ground:
the proposition belongs to an anonymous logos reported during Diotima's turn,
not to Diotima as her own assertion. No accepted claim changed in this pass.

## Completeness effect

```text
before: cohorts=1/2; missing turn_symposium_0001; accepted=168; unresolved=74;
        unresolved_without_candidates=74
after first extraction: cohorts=2/2; accepted=209; unresolved=15;
        unresolved_without_candidates=14
after operator rulings: cohorts=2/2; accepted=194; unresolved=1;
        unresolved_without_candidates=0
```

`cohorts=2/2` closed the first defect. Physical removal of the fourteen
non-speech pseudo-turns closes the second without manufacturing candidate
owners. The single retained unresolved record has a local candidate set and a
substantive reason, so Symposium's `CMP-REPORTED-TURNS` leaf can pass honestly.

## Prose compressed to fit schema caps

`VOICE_LIMITS_MAX` is 600 (applied to `limits` and to
`reviewed_attribution.rationale`) and `VOICE_UNRESOLVED_REASON_MAX` is 400. Some
reviewer rationales exceeded these. They were compressed, preserving every cited
byte offset and every operative grammatical ground and dropping only restatement.
No cap was raised and no check weakened — the same course The Phaedo discourse attribution review took when one
of its unresolved reasons ran 518 against the 400 limit.

## Invariant 7 — the gate now gates the cohort that lands

The gate initially ran only over the builder's own generated candidate, so after
the ledger was staged it still reported "168 record(s)" and "turn_symposium_0001
… 0 record(s)". That is the same blind spot the rearchitecture existed to remove,
one level up. A `--gate-ledger` mode was added that runs the identical discovery
and coverage logic against `wiki/voices/symposium.md`.

Run against the initial accepted 209-record cohort it took the uncited count from 24 to
2, and both survivors were reviewed decisions that had never been transferred
into the builder's byte-exact exemption table:

- `@84958` `τὸν Σωκράτη, ἰδόντα δὲ ἀναπηδῆσαι καὶ εἰπεῖν` — the gate reported it
  as sitting inside a `reviewed_attribution` context span, "adjudicated in a
  rationale, but not cited as evidence and not exempted, so this gate cannot see
  the disposition." An accurate self-report of the gate's own limits.
- `@106782` `ἔφη, προσαναγκάζειν τὸν Σωκράτη` — the second `ὁρᾶν`-shaped trap,
  exempted as argumentative recap by the region review.

Both were transferred with their grammatical grounds. Final state:

```text
gating wiki/voices/symposium.md: 209 accepted record(s)
  turn_symposium_0001 [0, 2786): 11 records; depth>=2 gaps 11 / 877 chars; 0 flagged
  turn_symposium_0005 [3373, 107347): 198 records; 71 naming formulas —
    41 inside a depth>=3 record, 26 cited as evidence, 4 exempt;
    depth>=3 gaps 81 / 7260 chars; 0 flagged, 81 clean
    (keying on presence instead of uncited would flag 26)
every discovered reporting act in both required outer turns is consumed.  exit 0
```

After the operator rulings, the same gate passes over the 194-record hard
cutover: 11 records in `turn_symposium_0001`, 183 in
`turn_symposium_0005`; 71 naming formulas in the latter are consumed by 39
adjudications, 26 citations, and 6 byte-exact exemptions. Its 84 depth≥3 gaps
total 7,509 characters and contain zero unconsumed acts.

## A gap in CI scope, found and not fixed here

`packages/harness` tests `src/*.test.ts src/**/*.test.ts` and `packages/cli`
tests `src/*.test.ts`. **`scripts/` is in neither.** So
`build-symposium-voice-ledger.test.ts` — including the invariant-5 injection
characterization test that is the whole point of the 2026-07-29 amendment — does
not run in `bun run ci`. The test exists and passes (23 pass, 0 fail, stable
across three runs), but nothing in CI would notice if it stopped passing. Fixing
the CI glob is outside this plan's scope and is flagged for the operator.

## Final gates

```text
bun test scripts/…/build-symposium-voice-ledger.test.ts   23 pass, 0 fail
bun scripts/…/build-symposium-voice-ledger.ts --gate-ledger   exit 0
bun run ci                                                 all four stages pass
bun run validate                                           exit 0
git diff --check                                           clean
```

## Post-ruling completion — items 1–4

The operator selected the first four referred actions on 2026-08-01. Final
authoritative state after applying them:

```text
wiki/voices/symposium.md                   194 accepted (193 resolved, 1 unresolved)
  turn_symposium_0001                       11
  turn_symposium_0005                      183
  evidence entries                        213 (218 cited ranges including 5 antecedents)
  reviewed-attribution contexts             71
derived/plato/voices/symposium.toon        voices[194]
derived/plato/joins/voices/symposium.toon  voice_joins[446]
wiki/claims/symposium.md                   176 accepted claims verified

wiki/voices/symposium.md                   31ece3aec589adf505f6acbc0a2abea4147608c62eabb29526b09a1777c37ff5
derived/plato/voices/symposium.toon        1bef7ca370682fcdcce93014b2cf0115fa7720999a128b6c03685b559b51c7f1
derived/plato/joins/voices/symposium.toon  5799f7737bc3ee83a0c9721a2e2a4e4260c36d946bb0b722aa57dcdae3b4f3f9
wiki/claims/symposium.md                   14a2fbe2936e731d09633628805ba002c67f29ab72355a5af4a61f1aa1489fc9
```

The final verification results below are recorded after the complete gate run.
`ΖΕΥΣ.`/`ΗΦΑΙ.` extraction is the sole deferred item and belongs to the corpus reported-turn completion campaign.

```text
bun test scripts/…/build-symposium-voice-ledger.test.ts   23 pass, 0 fail
bun scripts/…/build-symposium-voice-ledger.ts --gate-ledger   exit 0
migrate-claim-speakers.ts symposium --verify             PASS, 176 accepted
completeness / symposium                                  pass, 7/28 family leaves
bun run test                                              861 + 4 pass, 0 fail
bun run typecheck                                         exit 0
bun run validate                                          exit 0
bun run ci                                                all four stages pass
git diff --check                                          clean
```
