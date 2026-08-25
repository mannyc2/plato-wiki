# Commentary Campaign Compute and Scale Checkpoint (2026-08-22)

Status: implementation and measured quality-gate checkpoint. Bulk scale-up has
not started.

## Historical topology

The repository has not historically used one permanent
`codex exec --json` campaign topology. Earlier corpus work used Pi/provider
harnesses, a Codex lead dispatching semantic subagents, direct model CLIs, and
external Codex Desktop/Terra packets at different times. The current campaign's
`codex exec --json` process is the isolated inner inference worker under a
Codex orchestrator. It is not a description of the whole historical workflow.

## Implemented compute controls

1. Exact Codex 0.147 JSONL usage telemetry is stored for every attempt. Legacy
   receipts without exact tokens remain explicitly unknown.
2. A read-only whole-selection preflight runs before authentication, provider
   work, or generated-input writes.
3. Deterministic listener-prose and provenance checks block paid work before
   model invocation.
4. Audit packets are exhaustive and hash-bound: exact source, commentary,
   accepted evidence, and production playback edges are supplied in one call.
5. Semantic failures do not enter a retry-to-green loop. Retry execution only
   archives stale/malformed attempts; a subsequent paid run is separate and
   explicit.
6. Concurrency controls wall-clock overlap only. Paid-call volume is bounded
   separately by `--max-new-jobs`; multi-job execution requires a finite cap.

Additional scale safety now provides strict repeatable `--unit-key` selection,
exact selected/scheduled/deferred reporting, archive-only retry, and a tool-less
model catalog that omits unrelated coding-agent, project, skill, plugin, app,
and collaboration context.

## Compute result

The first coding-agent-context attempt and first tool-less attempt were on
different Apology units, so they are not a matched semantic benchmark. They do
isolate the dominant context cost:

| Attempt | Unit | Brief bytes | Input tokens | Output tokens | Reasoning output tokens | Duration |
|---|---|---:|---:|---:|---:|---:|
| Coding-agent context | `01-17a-18e` | 45,733 | 105,350 | 576 | 314 | 14,857 ms |
| Tool-less inference | `02-19a-20c` | 53,289 | 22,613 | 770 | 516 | 17,610 ms |

The tool-less attempt used 82,737 fewer input tokens, a 78.5% reduction,
despite receiving the larger evidence brief. Latency rose by 2,753 ms, which
confirms that concurrency and latency are not compute budgets.

Across all 18 audit attempts used to build and falsify the quality gate:

- 461,928 input tokens;
- 19,863 output tokens, including 13,645 reasoning-output tokens;
- 481,791 input-plus-output tokens;
- 415,689 ms cumulative attempt duration;
- 17 generated attempts and one schema-invalid attempt;
- zero reported cache reads or writes;
- no provider cost was reported, so cost remains null rather than estimated.

These totals include deliberately rejected control iterations. They are
optimization evidence, not completed corpus coverage.

## Quality findings that prevented premature scale

Independent review found errors that a free-form pass missed:

- issue-code overreach (`multiple_jobs` applied to steps in one argument);
- an incorrect grammatical referent in Charmides;
- a raw marker edge mistaken for the production playback edge;
- a production edge 1,352 English characters after its anchor, inside a later
  Delphic-inscription topic;
- a result that described a question followed by its answer but nevertheless
  marked placement as passing.

The production screenplay generator and audit brief now share one canonical
playback-boundary resolver. Briefs record the requested anchor, resolved edge,
signed shift, exact bounded English on each side, hashes, and mechanical
sentence-edge facts.

The audit contract is now a hard schema-v3 cutover. Placement requires a unique
closed `hazard_codes` array:

- `sentence_or_clause_split`;
- `question_answer_split`;
- `prompt_reply_split`;
- `semantic_anchor_displacement`;
- `other_dramatic_flow_damage`.

Placement passes exactly when that array is empty. Legacy v2 output is rejected;
the validator does not auto-correct or silently reinterpret model-authored
judgments.

## Corpus profile

The current active audit surface is 450 units and 669 commentary blocks across
27 dialogues. Playback snapping is common, so character distance alone cannot
be an automatic removal rule:

- exact edge: 144 blocks (21.5%);
- earlier edge: 90 blocks (13.5%);
- later edge: 435 blocks (65.0%);
- median absolute shift: 308 characters;
- 196 blocks shift at least 1,000 characters;
- 99 blocks have a question immediately before the resolved edge.

Large shifts remain semantic review candidates because a long shift can stay
within one argument while a short shift can cross an exchange.

## Verified stopping state

- Full tests: 1,008 passed (1,004 harness and 4 CLI).
- Typecheck: passed.
- `git diff --check`: passed.
- `bun run validate`: intentionally red against legacy corpus artifacts:
  - 450 `audit_brief_mismatch`;
  - 450 `invalid_audit_output` (legacy schema v2);
  - 27 `commentary_id_coverage_mismatch`;
  - 27 `protocol_hash_mismatch`;
  - 4 `ledger_hash_mismatch`.

The last v2 Charmides control and the five stale matched-sample artifacts were
archived under `scratch/commentary/campaign-history/`. No v3 paid call has been
made. The exact restart begins with one control call:

```bash
bun scripts/commentary/commentary-campaign.ts run --execute \
  --dialogue charmides \
  --stage audit \
  --unit-key 06-163a-164b \
  --max-new-jobs 1 \
  --concurrency 1
```

Independent review of that v3 output is the scale gate. If it passes, rerun the
five archived matched-sample units, adjudicate the six-unit sample, and only
then start bounded whole-dialogue waves. The prepared substantial-portion target
is 92 of 450 units (20.4%): Crito, Ion, Critias, Menexenus, Lysis, Apology, and
Meno, split into 28-, 28-, and 36-unit waves with no more than four concurrent
calls and an exact paid-job cap per invocation.
