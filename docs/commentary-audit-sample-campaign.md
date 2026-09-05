# Independent commentary audit sample campaign

This scratch-only helper prepares and runs the fresh independent Luna samples
required before an operator may accept commentary quality-audit manifests. It
does not change the quality contract in `docs/commentary-protocol.md`.

```bash
bun scripts/commentary/commentary-audit-sample-campaign.ts plan
bun scripts/commentary/commentary-audit-sample-campaign.ts run
bun scripts/commentary/commentary-audit-sample-campaign.ts run --execute \
  --concurrency 4 --max-new-jobs 27
```

`run` is dry by default. Execution is blocked until every selected dialogue can
produce a current all-pass pending manifest; an unscoped full run also requires
exactly 27 canonical Greek dialogues. It deterministically samples 15
active accepted commentary ids across the ledger in ledger order, or every id
when there are 15 or fewer. Each job receives the exact shared quality contract
once plus the complete source, playback, commentary, accepted-evidence, and
current audit-output packet for every sampled unit.

The runner pins an isolated read-only `gpt-5.6-luna` medium invocation, refuses
concurrency above four, and binds the pending-manifest, packet, schema,
model-catalog, output, and state hashes under:

- `scratch/commentary/audit-sample-packets/<dialogue>/<input>.md`
- `scratch/commentary/audit-sample-schemas/<dialogue>/<input>.json`
- `scratch/commentary/audit-sample-reviews/<dialogue>/<input>.json`
- `scratch/commentary/audit-sample-state/<dialogue>/<input>.json`
- `scratch/commentary/audit-sample-executions/<dialogue>/<input>.jsonl`

The sample runner never writes `wiki/commentary-audits/`, `wiki/review/`, or
`wiki/submissions/` and never changes an acceptance decision. A passing scratch
result prints exact `audit-manifest-accept-preview` and
`audit-manifest-accept-apply` argument arrays as an operator handoff, including
the required `--sample-output` path. The operator must inspect the result,
supply the actual review date, run preview deliberately, and choose separately
whether to apply. A failed sample returns no acceptance handoff and requires
remediation.

Acceptance has no metadata-only fallback. Preview rebuilds the current pending
manifest and requires the supplied scratch output, state, and raw Codex JSONL
execution to be the exact current passing job. Apply atomically writes the
accepted manifest, its review note, and one content-addressed evidence record under
`wiki/submissions/commentary-audit-sample/<dialogue>/<sha256>.json`. That record
embeds and hash-binds the exact pending manifest, complete commentary-ledger
bytes, sample packet, output schema, model catalog, prompt, normalized sample
output, sample state, raw Codex JSONL execution, and isolated invocation
contract. Validation reconstructs the complete expected job and replays the
raw execution, output, usage, and state; copied hashes are not trusted. Every
scratch and canonical path must be a regular non-symlink path with no symlinked
or realpath-aliased parent. The review note binds the evidence record and each
component hash. Canonical validation fails closed when any binding is absent,
stale, malformed, aliased, or inconsistent.

A changed-ledger supersede also copies the exact predecessor manifest, review
note, and commentary-ledger bytes to content-addressed history. The new receipt
reciprocally binds all three artifacts, and canonical validation recursively
replays the predecessor evidence. Missing or tampered history therefore
invalidates the current acceptance.
