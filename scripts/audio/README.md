# Dots production renderer

`render_dots.py` is the repository-owned, resumable Dots SOAR synthesis layer.
Without `--render` it is a validator and planner that uses Bun to invoke the
repository's canonical TypeScript commentary-quality and full screenplay
validators. Planning also hashes the complete pinned model snapshot and
installed Dots source; it does not load either model onto CUDA. With `--render`
it synthesizes content-addressed utterance chunks on CUDA and then assembles
every chapter and the complete dialogue with semantic cadence.

It does not master publication audio or waive QA. Its output is the pinned,
lossless render input to the mastering and QA stages in
`docs/audio-edition-protocol.md`.

## Serial corpus production orchestrator

`produce_corpus_audio.py` is the hard-cutover driver for the complete canonical
27-dialogue edition. Its default is local and read-only: it runs every
`generate_screenplay.ts` preflight, validates the exact ordered dialogue
catalog, checks the selected cast reference bytes at the paths recorded in
`audio/cast.json`, and reports any existing content-addressed mechanical
receipts. It does not contact `gpu`, write screenplays, create remote plans, or
render audio.

```bash
uv run python scripts/audio/produce_corpus_audio.py \
  | jq '{ready_count, blocked_count, global_blockers,
      dialogues: [.dialogues[] | {dialogue, screenplay_status, blockers}]}'
```

The explicit production command is:

```bash
uv run python scripts/audio/produce_corpus_audio.py --execute \
  > scratch/audio-corpus-production/latest-run.json
```

Execution is refused before the first write unless all 27 dry screenplay
reports are `production-contract-valid`, every exact selected reference exists
with its recorded hash, and `audio/cast.json` is complete. Once those corpus
gates pass, the driver writes the canonical `audio/scripts/<dialogue>.json`
files, copies a repository snapshot to
`/mnt/models/dev/plato-audio`, and uses `rsync -aR` to copy each reference to
that same exact repository-relative path. It never flattens or renames a
reference and never uses `rsync --delete`.

Remote commands run only through `ssh gpu`, with
`/mnt/models/dev/plato-dots/.venv/bin/python`. The driver processes one
dialogue at a time. For each dialogue it:

1. asks `render_dots.py --write-plan` for JSON and uses only the returned
   `plan_sha256` and `plan_path`;
2. probes `master_audio.py` read-only to prove whether the exact complete
   renderer assembly already exists;
3. when needed, executes that parsed render plan with `--render` (the renderer
   resumes its verified content-addressed task cache);
4. asks `master_audio.py --write-plan` for a new JSON SHA/path pair and executes
   only that pair; and
5. writes an idempotent receipt at
   `scratch/audio-corpus-production/receipts/<dialogue>/<receipt-sha256>.json`.

The mastering artifact remains under
`/mnt/models/artifacts/plato-audio/mastering/artifacts/<mastering-plan-sha256>/`.
Receipts say `mechanical-master-complete-unaccepted`, bind the screenplay,
cast, exact reference paths/hashes, render plan, mastering plan, and artifact,
and always record `accepted: false`. This command never writes beneath
`audio/qa/` or `wiki/recordings/`; ASR/listening acceptance and recording
publication remain separate downstream work.

Re-running the same corpus command is the recovery path. Completed dialogues
are proven against their current render/master plans and content-addressed
receipts before their cached mechanical artifacts are reused; an interrupted
dialogue resumes the renderer's verified task cache. There is no partial-corpus
execution flag that bypasses the 27-dialogue prerequisite gate. A malformed
receipt, unexpected non-JSON output, stale SHA/path pair, changed canonical
dependency, partial artifact, or path outside the pinned remote roots stops the
run rather than selecting a nearby or "latest" file.

## Direct YouTube reference materialization

`materialize_youtube_reference.py` resolves only videos pinned in
`audio/reference-sources.json`. A dry plan validates the dialogue, character,
video part, interval, and exact prompt without network or output writes:

```bash
uv run python scripts/audio/materialize_youtube_reference.py \
  --dialogue crito --character-id socrates \
  --start 65.92 --end 72.28 \
  --prompt-text "Why, Crito, when a man has reached my age he ought not to be repining at the prospect of death."
```

Add `--materialize` to download that recorded YouTube URL directly, cache the
source outside ordinary Git, and atomically emit a mono 48 kHz PCM-24 WAV plus
a provenance sidecar. Multi-part works require `--video-id`. The sidecar pins
the source-media and clip hashes and tool versions; it is still only an
audition input, not a selected cast entry.

### Locate clips from automatic captions

`find_youtube_reference.py` removes the need to find timestamps by hand. It
resolves the pinned video, downloads only that video's `en-orig` automatic
captions as JSON3, caches them under
`scratch/audio-references/caption-cache/`, and fuzzy-aligns a contiguous phrase
despite punctuation, case, modest spelling errors, or an inserted/deleted word.
For example, this finds a Crito line in the pinned Phaedo recording:

```bash
uv run python scripts/audio/find_youtube_reference.py \
  --dialogue phaedo --character-id crito \
  --phrase "the attendant who is to give you the poison has been telling me that you are not to talk much"
```

The JSON result pins the caption hash, exact caption transcript, raw and safely
padded timestamps, alignment confidence, nearest distinct alternative, and a
shell-quoted `materialize_youtube_reference.py` command. It rejects matches
below the confidence threshold and near-tied matches rather than choosing one.
Requested padding is clamped at adjacent caption tokens so that the generated
prompt never knowingly omits a neighboring spoken word.
Use `--offline` to require an existing validated cache without any network
request, or `--command-only` to print just the exact materialization command.
Use `--materialize` to execute the same validated plan directly.

Automatic captions identify words and times, not character identity. Every
result therefore remains `candidate-not-selected` until a canonical Jowett-turn
alignment proves the complete interval belongs to one source-labelled
character and the deterministic cast promoter passes it. Automatic captions
may also misrecognize a word. If ASR or a pinned transcript proves a correction,
rerun the materializer at the same interval with the corrected exact prompt;
the prompt hash in the basename creates a distinct artifact instead of
overwriting the caption-derived one. The helper never reads a source
translation to find the line.

### Mine cue hypotheses and asserted candidates for the unresolved cast

`mine_cast_reference_candidates.py` applies the same caption parser only to
unselected CharacterCatalog v3 `voice-owner` appearances with source-turn
evidence in `audio/characters.json`. The commentary narrator is a voice owner
but has no source-TEI cue to mine. Crito's Dream Woman and personified Laws are
`reported-only`, require no cast entries, and are not fed into narrator-cue
mining as though the source TEI named independent performed turns. The default
is offline-only: videos without a validated cached caption remain explicit
coverage gaps rather than silently triggering downloads.

```bash
uv run python scripts/audio/mine_cast_reference_candidates.py \
  --output scratch/audio-reference-candidates/coverage.json >/dev/null
```

To populate all 29 pinned caption files first, use the explicit network mode:

```bash
uv run python scripts/audio/mine_cast_reference_candidates.py \
  --populate-caption-cache \
  --output scratch/audio-reference-candidates/coverage.json >/dev/null
```

This calls `yt-dlp --skip-download` for the pinned `en-orig` JSON3 captions
only. It does not download audiobook media, materialize WAVs, or render Dots.

The miner recognizes lexical narrator patterns such as `replied Crito`,
`Crito replied`, and `asked X`, but does not infer their direction. In prose a
cue may be preposed, postposed, or medial, and the words before the next named
cue may already contain another speaker. Every 3–20 second cue-only span is
therefore emitted only under `cueHypotheses`. A hypothesis is explicitly
non-materializable, has no prompt, Dots plan, materializer command, speaker
isolation confidence, or candidate-completion credit. It is useful for human
triage only. Ambiguous aliases, subject-pronoun vocatives such as `he said
Crito, I owe...`, overlapping cue ties, missing closing cues, and overlong
spans remain visible as rejections or suppressed lexical cues.

Only a human-supplied phrase with an explicit boundary assertion can create a
`candidate-not-selected` record and dry materialization plan. The assertion
records both the cue's grammatical placement and which side of that cue is the
single-speaker phrase. It is provenance for the operator's decision, not
automatic speaker proof.

Optional human-supplied phrases use this strict schema:

```json
{
  "schemaVersion": 1,
  "phrases": [
    {
      "characterId": "crito",
      "dialogue": "phaedo",
      "videoId": "2sZzVVwSOEU",
      "phrase": "the attendant who is to give you the poison ... two or three times",
      "cuePlacement": "medial",
      "speakerSpanDirection": "after-cue"
    }
  ]
}
```

`cuePlacement` is `preposed`, `postposed`, or `medial`.
`speakerSpanDirection` is `before-cue` or `after-cue`; valid pairs are
`preposed`/`after-cue`, `postposed`/`before-cue`, and either direction for a
medial cue. The aligned phrase must be directly adjacent to exactly one named
target cue on the asserted side. Phrases that contain a resolved named cue, an
unresolved pronoun attribution such as `he said`, or adjacent quoted utterances
are rejected as possible multi-speaker spans.

Pass the queue with `--phrase-queue path/to/queue.json`. A phrase must
fuzzy-align uniquely, satisfy its boundary assertion, and last 3–20 seconds;
otherwise its failure remains in the coverage report. `--only-character crito`
provides a fast smoke check without changing the all-character default. Every
candidate remains `candidate-not-selected`, uses the current prompt-hashed WAV
and sidecar paths with no legacy basename, and still requires exact prompt
correction, canonical Dots/ASR/CAM++ evidence, Jowett-turn speaker purity, and
the deterministic promoter.

## Deterministic Dots cast acceptance

`accept_dots_cast_voice.py` is dry-run by default. It accepts only the current
artifacts emitted by `audition_dots_reference.py`, `qa_dots_audition.py`, and
`rank_dots_audition.py`; legacy clone manifests and snake-case QA/ranking files
have no compatibility path. The default chooses the highest-ranked passing
seed. `--seed` is an explicit operator pin and never waives a gate.

```bash
uv run python scripts/audio/accept_dots_cast_voice.py \
  --character-id crito \
  --reference-sidecar scratch/audio-references/crito/MNDfJMrH1XY-000296590-000303000-f1e4b2e6ab0a.json \
  --speaker-purity scratch/audio-jowett-reference-alignment/crito.report.json \
  --clone-manifest scratch/audio-references/auditions/crito-neutral-corrected/audition-manifest.json \
  --asr scratch/audio-references/auditions/crito-neutral-corrected/asr-qa.json \
  --acoustic scratch/audio-references/auditions/crito-neutral-corrected/speaker-ranking.json
```

When the primary reference case has a nonzero ordinary-word error, first run
the pinned independent verifier, then construct the only accepted adjudication:

```bash
python scripts/audio/verify_reference_asr_adjudication.py run \
  --reference /path/to/reference.wav \
  --expected-text "Exact materializer prompt." \
  --cache-dir /path/to/huggingface-cache \
  --output scratch/audio-references/auditions/<batch>/reference-asr-independent.json

uv run python scripts/audio/verify_reference_asr_adjudication.py adjudicate \
  --reference-sidecar scratch/audio-references/<character>/<sidecar>.json \
  --source-agreement scratch/audio-jowett-reference-alignment/<dialogue>.report.json \
  --primary-asr scratch/audio-references/auditions/<batch>/asr-qa.json \
  --independent scratch/audio-references/auditions/<batch>/reference-asr-independent.json \
  --output scratch/audio-references/auditions/<batch>/reference-asr-adjudication.json
```

Pass the adjudication with `--reference-asr-adjudication`. Add `--write` only
after reviewing the dry decision; it writes a content-addressed decision and
then atomically replaces that character's cast entry. A different
`--source-character-id` also requires `--reassignment-reason`. Reassignment
may cross dialogue boundaries: the target must still be a globally resolved
canonical voice owner, while the explicitly named source character must be a
resolved voice owner appearing in the reference's source dialogue. Same-
character acceptance continues to require the target itself in that dialogue.

For a resumable multi-character wave,
`orchestrate_dots_cast_batch.py` emits content-addressed manifests for
materialization, one-load Dots rendering, one-load QA/ranking, and serial
promotion. When an independently checked reference interval is not the
planner's default duration-ranked candidate, pin it explicitly without
changing any acceptance gate:

```bash
uv run python scripts/audio/orchestrate_dots_cast_batch.py \
  --phase remote-render \
  --alignment-report scratch/audio-jowett-reference-alignment/laws.report.json \
  --alignment-report scratch/audio-targeted-reference-phrases/symposium.report.json \
  --only-character athenian-stranger \
  --candidate-id athenian-stranger=jowett-caption-a21879482641010b23ca35e0 \
  --write-manifest
```

`--candidate-id` accepts one unique `CHARACTER_ID=CANDIDATE_ID` pair per
character and can select only a still-eligible candidate from the supplied,
live-hash-validated reports. Multiple reports for the same dialogue are
allowed so a targeted sub-interval can coexist with its source proof; candidate
IDs must remain globally unique and supplemental phrase queues/source-proof
inventories are verified before the batch is planned.

Use `--reuse-auditions-from <prior-manifest>` when a proof/catalog rebase has
changed candidate IDs but not the rendered audio inputs. Candidate IDs remain
bound on each batch item as proof provenance; they are excluded from the
pre-materialization content-addressed audition identity. Reuse is available
only after the reference and all seed auditions are materialized. The prior
manifest must carry an exact recorded Dots policy, an audition artifact
identity, and the correct SHA-256 of that unmodified identity; missing, null,
or malformed proof is rejected.

The reuse preflight requires canonical-JSON byte equality for the target and
source character IDs, the complete reference plan (including video, interval,
prompt, and materialized paths), target text, seeds, and every pinned Dots
generation field. It then verifies the current PCM-24 reference against its
sidecar, binds both byte hashes, checks the existing audition manifest's full
Dots plan and plan hash, and rehashes every seed WAV. QA, ranking, and
adjudication paths must be canonical children of that audition directory. Any
difference fails closed, so a successful `remote-render` reuse is reported as
complete without emitting a GPU render command. The new item's
`artifactReuse` records both candidate IDs, the semantic reuse basis, the
reference and audition byte identities, both prior and normalized artifact
hashes, and the verified audition manifest. Older manifests that included
`candidateId` inside `auditionArtifactIdentity` remain admissible only when
their original hash is valid; normalization removes that field alone and
requires every remaining byte to match.

Once every resolved canonical `voice-owner` has a selected decision, close the
registry with the separate fail-closed finalizer. Its default is a read-only
coverage report; `--write` changes only `status: partial` to `status: complete`
and refuses missing, extra, duplicate, unresolved, or review-required roles.
It also revalidates every content-addressed cast decision before writing.

```bash
uv run python scripts/audio/finalize_dots_cast.py
uv run python scripts/audio/finalize_dots_cast.py --write
```

When a character-policy hard cutover makes old selections non-owning historical
evidence, prune only those now-extra cast entries before promoting replacements:

```bash
uv run python scripts/audio/finalize_dots_cast.py --prune-non-owners
uv run python scripts/audio/finalize_dots_cast.py \
  --prune-non-owners \
  --write \
  --reconciled-at YYYY-MM-DD
```

The dry report lists the exact planned removals. The writer retains the
unreferenced decision receipts, sets a still-incomplete cast back to `partial`,
and never removes a currently required voice owner. A write that actually
changes the cast through the prune lane requires `--reconciled-at`; idempotent
writes do not. Before its single atomic cast replacement, the writer stores a
content-addressed `planned` reconciliation artifact under
`audio/cast-reconciliations/`, binding the prior cast, canonical character
catalog, exact removals, and resulting cast hash. Before any pruning, the
validator checks the canonical catalog against the materialized TEI speaker
census and the accepted active-speaker policy, including Meletus' required
live voice in Apology. Reconciliation provenance also hashes the validator,
finalizer, character-policy implementation, and cast-acceptance implementation
rather than recording only their wrapper paths.

### Align canonical attributed turns to the pinned audiobooks

`align_canonical_turn_references.py` provides a separate, fail-closed path from
the pinned Perseus English TEI speaker turns to the cached YouTube word
timings. It is useful when the audiobook wording is close enough to the
canonical English to locate a short possible reference without inferring a
speaker from narrator cues.

The default command is offline and read-only. It prints a deterministic
corpus-wide review queue to stdout and reports every missing TEI or caption as
an explicit coverage gap:

```bash
uv run python scripts/audio/align_canonical_turn_references.py \
  | jq '{summary, missingInputs, queueSha256}'
```

Canonical attribution comes only from a single exact `<said who>` value that
maps to one character in `audio/characters.json`. The cached TEI must match the
hash in `audio/english-tei-speaker-census.json`, and converting those bytes
through the pinned importer must reproduce `raw/plato/english/<dialogue>.txt`
byte for byte. Outer `<said>` elements containing nested attributed turns are
excluded as mixed; only independently attributed leaf turns are eligible.

Populate the canonical source cache only with the explicit network flag. Each
download is bounded, checked against its pre-existing pinned hash, and replaced
atomically under the scratch artifact root:

```bash
uv run python scripts/audio/align_canonical_turn_references.py \
  --populate-tei-cache >/dev/null
```

Persisting the queue is also explicit:

```bash
uv run python scripts/audio/align_canonical_turn_references.py \
  --write \
  --output scratch/audio-turn-reference-candidates/queue.json >/dev/null
```

The queue binds the exact registry, importer, script, canonical TEI/rendering,
and caption hashes. It retains at most one bounded `expectedPrompt` excerpt per
candidate; it does not persist a full caption, canonical query text, or nearest
alternative text. Candidates must pass disjoint globally unique n-gram,
alignment confidence, exact-token, query-coverage, alternative-margin, prompt
length, and 3–20 second interval gates. Any interval that survives for two
different characters is rejected for both.

Every result remains `candidate-not-selected` with `humanAuditRequired: true`
and `singleSpeakerGuaranteed: false`. The tool does not diarize, materialize
audio, execute the materializer, or read/write `audio/cast.json`; a reviewer
must listen to the complete interval and confirm both speaker purity and the
exact prompt before using the recorded operator fields. Different English
translations often share too little wording to pass these deliberately strict
gates, so zero candidates is a valid and visible result rather than permission
to lower them automatically.

### Render and check a Dots audition

`audition_dots_reference.py` consumes the materializer's WAV and sidecar, so
the prompt transcript, character, pinned YouTube URL, hashes, Dots revision,
parameters, and seeds are carried into the audition manifest automatically.
It plans without loading GPU dependencies unless `--render` is present:

```bash
python scripts/audio/audition_dots_reference.py \
  --reference /absolute/reference.wav \
  --reference-sidecar /absolute/reference.json \
  --target-text "A representative line for listening and ASR review." \
  --seeds 42,44,46,48 \
  --output-dir /absolute/audition \
  --cache-dir /absolute/huggingface-cache
```

The renderer refuses a changed reference hash, duplicate seeds, a partial
output directory, or a mismatching resume manifest. Add `--render` on a CUDA
host after reviewing the dry plan.

Run `qa_dots_audition.py` against the completed manifest on the CUDA host. It
loads only the exact pinned local Whisper snapshot and records strict and
proper-name-normalized word errors for both the source reference and every
seed. A clean clone is still only an audition: the deterministic cast promoter
must also verify source identity, acoustic consistency, signal safety, and the
complete operator-authorized acceptance contract.

```bash
python scripts/audio/qa_dots_audition.py \
  --manifest /absolute/audition/audition-manifest.json \
  --cache-dir /absolute/huggingface-cache \
  --output /absolute/audition/asr-qa.json
```

After ASR QA, `rank_dots_audition.py` uses the Dots model's pinned CAM++
speaker encoder to compare the source reference with the beginning, middle,
and end of each audition. It sorts by mean cosine similarity and seed, and
writes the individual window scores for audit:

```bash
python scripts/audio/rank_dots_audition.py \
  --manifest /absolute/audition/audition-manifest.json \
  --cache-dir /mnt/models/hf \
  --output /absolute/audition/speaker-ranking.json
```

For a content-addressed `remote-render` cast-batch manifest, load Dots once and
render every pending audition serially with the same pinned runtime:

```bash
/mnt/models/dev/plato-dots/.venv/bin/python \
  scripts/audio/batch_render_dots_auditions.py \
  --batch-manifest scratch/audio-cast-batches/batches/<batch-sha>/remote-render-<manifest-sha>.manifest.json \
  --cache-dir /mnt/models/hf \
  --execute
```

Without `--execute` the command only validates the manifest, references, and
resume state and never loads CUDA. A live wave loads Dots at most once, keeps
the ordinary per-character audition manifests byte-compatible with
`audition_dots_reference.py`, and verifies completed outputs before resuming.

Run the corresponding batch QA with separate, explicit model caches. The
primary Whisper-small and CAM++ stages continue to use the Dots cache, while
any independent Whisper large-v3 reference adjudication commands are emitted
against the already materialized large-v3 cache:

```bash
/mnt/models/dev/plato-dots/.venv/bin/python \
  scripts/audio/batch_qa_dots_auditions.py \
  --batch-manifest scratch/audio-cast-batches/batches/<batch-sha>/qa-rank-<input-sha>.manifest.json \
  --repo-root /mnt/models/dev/plato-audio \
  --cache-dir /mnt/models/hf \
  --independent-cache-dir /mnt/models/cache/huggingface \
  --output scratch/audio-cast-batches/batches/<batch-sha>/qa-summary-<input-sha>.json
```

Both cache arguments must name existing, distinct absolute directories. The
batch QA process loads only the primary models; its summary records exact
large-v3 and adjudication commands for references whose primary transcript has
ordinary-word errors.

The ranking detects voice drift. It is not a cast selection by itself; the
schema-v3 promoter combines it with the other pinned gates and selects the
highest-ranked passing seed without manual listening.

### Review a Dots audition in one blind listening page

`build_audition_review.py` turns one completed audition, its passing ASR report,
and its CAM++ ranking into a deterministic browser page. Before writing the
page, it recomputes the embedded plan hash, every reference and candidate WAV
hash, PCM format and duration, the exact ASR artifact inventory, and the exact
ranking seed/model inventory. Candidate order is deterministically blinded;
the page allows only one audio element to play at a time and keeps a provisional
choice and note in browser-local storage.

The copied decision is a review handoff only. The page cannot write
`audio/cast.json`, and the generated review manifest explicitly records
`humanAuditRequired: true` and `writesCastRegistry: false`.

```bash
uv run python scripts/audio/build_audition_review.py \
  --manifest scratch/audio-references/auditions/crito-direct-video-padded/audition-manifest.json \
  --qa scratch/audio-references/auditions/crito-direct-video-padded/asr-qa.json \
  --ranking scratch/audio-references/auditions/crito-direct-video-padded/speaker-similarity.json \
  --output scratch/audio-references/auditions/crito-direct-video-padded/listening/review.html
```

Serve the repository root locally so the page can load the verified WAVs
without copying or transcoding them:

```bash
uv run python -m http.server 8765 --bind 127.0.0.1
```

### Cluster an audiobook into anonymous speaker candidates

`cluster_audiobook_speakers.py` is a bounded listening aid for the pinned Crito
audiobook `MNDfJMrH1XY`. It uses only caption word timings and detected silences
to choose non-overlapping 3.0--8.5 second segments, then uses the pinned Dots
CAM++ encoder on the GPU to group similar voices. Caption text is neither
persisted nor used for identity. Clusters are named only
`anonymous-cluster-NN`; the tool never maps one to Socrates or Crito and never
reads or writes `audio/cast.json`.

Caption-timing gaps are only candidate cuts: they are not guaranteed silence,
word boundaries, or speaker changes. The plan therefore records
`singleSpeakerGuaranteed: false`. Clusters report
within-cluster cosine ranges, competing-cluster margins, and below-threshold
members; each cluster also gets a farthest-from-centroid audit clip to expose
one broad within-cluster outlier alongside the clean centroid examples. This is
not guaranteed to be the segment with the worst competing-cluster margin, so
the manifest diagnostics and human review remain authoritative.

The default invocation performs no embedding or clustering, but it atomically
writes one immutable plan under
`scratch/audio-speaker-cluster-plans/MNDfJMrH1XY/<plan-sha256>.json`. The plan
binds the exact source-registry entry, local materialized-byte evidence,
captions, script, segmentation FFmpeg, Dots revision and source commit,
determinism policy, all 240 intervals, and the transfer, execution, and fetch
commands:

```bash
uv run python scripts/audio/cluster_audiobook_speakers.py \
  > /tmp/crito-speaker-cluster-plan.json
jq '{planSha256, source, captions, identityPolicy, segmentation: \
  (.segmentation | del(.segments))}' /tmp/crito-speaker-cluster-plan.json
```

After reviewing it, run its commands verbatim. The transfer includes the
content-hashed plan artifact. GPU execution requires `--execute-plan` and the
expected plan hash; it validates the registry/source/caption/script hashes and
every exact interval before Dots loads. It does not rerun segmentation:

```bash
jq -r .gpuTransferCommand /tmp/crito-speaker-cluster-plan.json | sh
jq -r .gpuExecuteCommand /tmp/crito-speaker-cluster-plan.json | sh
jq -r .gpuFetchCommand /tmp/crito-speaker-cluster-plan.json | sh
```

The fetched directory contains `manifest.json`, content-hashed unit-normalized
embeddings, two centroid-nearest mono 48 kHz PCM clips, and one farthest-centroid
audit clip per retained anonymous cluster. The manifest separately records the
planning and execution FFmpeg versions, verified installed Dots commit,
Torch/CUDA/GPU facts, and deterministic CUDA settings. Strict resume rebuilds
the manifest relationships from the embedding payload and rejects changed
policies, counts, dimensions, assignments, durations, hashes, unsafe paths, or
host-version drift. A person must listen to both ordinary and audit clips before
making any separate cast decision.

### Plan the anonymous clustering queue for the whole pinned corpus

`cluster_audiobook_speakers_v2.py` generalizes the proved acoustic workflow
without changing the Crito v1 implementation. Every v2 plan imports that
frozen acoustic core and requires its exact SHA-256
`fbc00c2cf44557fdae5225a1dc2f0a8ae7be34eea63459abd2c0a3cb67df75d6`.
The separate v2 orchestration is necessary because the v1 plan, paths, and
resume validator are deliberately Crito-specific; weakening those checks in
place would invalidate the existing proof.

The default command is a local dry run. It reads the exact 29 videos pinned in
`audio/reference-sources.json`, sorts them by dialogue and part, hashes every
available caption and source file, and segments only already materialized
source media. It does not download media, run Dots, contact the GPU, identify a
speaker, or write the cast registry:

```bash
uv run python scripts/audio/cluster_audiobook_speakers_v2.py queue |
  jq '{queueSha256, summary, ready: [.items[] |
    select(.status == "ready") | .selection.selectionKey]}'
```

Each selection key is the stable pair `dialogue:videoId`; the video ID remains
mandatory even for a dialogue that currently has one part. A ready item's plan
binds the exact registry, source bytes and probed duration, caption bytes and
timing count, v2 planner, frozen v1 core, segmentation FFmpeg, Dots model and
source revisions, deterministic CUDA policy, and every selected interval.
Plans and outputs are confined per video beneath versioned roots:

```text
scratch/audio-speaker-cluster-v2/plans/<dialogue>/<part>-<video-id>/<plan-sha256>.json
scratch/audio-speaker-clusters-v2/<dialogue>/<part>-<video-id>/
```

Missing media remains `materialization-required`, with no source hash, plan, or
GPU command invented for it. Its printed `yt-dlp` command is bounded by a
duration-scaled operating-system file limit as well as yt-dlp's
`--max-filesize` admission hint; running that command is a separate operator
decision. The single-video command disables concurrent fragments, and the
planner still rejects any completed file outside the same ceiling. The queue
becomes executable only for videos whose source media is already cached. A
missing or oversized caption fails closed before it is parsed, and a source
outside its duration-scaled byte ceiling or five-second registry-duration
tolerance fails before planning.

Persist and then independently rebuild the queue and its content-addressed
ready plans with:

```bash
uv run python scripts/audio/cluster_audiobook_speakers_v2.py queue --write \
  >/tmp/plato-speaker-cluster-queue.json
uv run python scripts/audio/cluster_audiobook_speakers_v2.py verify-queue \
  scratch/audio-speaker-cluster-v2/queue.json |
  jq '{queueSha256, summary}'
```

Only after human review should an operator run the exact transfer, execute, and
fetch commands stored on a ready queue item. V2 preserves the same anonymous
labels, `singleSpeakerGuaranteed: false`, and `humanAuditRequired: true` as v1.
It produces listening evidence only: cross-video actor linkage and character or
cast mapping remain outside this workflow.

### Review fetched anonymous clusters without mapping the cast

`build_cluster_review.py` turns every currently fetched v2 result into a
deterministic scratch-only review site while leaving unfetched queue items
visible as pending:

```bash
uv run python scripts/audio/build_cluster_review.py
uv run python -m http.server 8765 --bind 127.0.0.1
```

Open
`http://127.0.0.1:8765/scratch/audio-speaker-cluster-review-v2/index.html`.
Before writing anything, the generator validates the saved queue and every
plan/caption relationship. For each fetched output it also revalidates the
source and caption inputs, recomputes the anonymous cluster assignments and
diagnostics from the pinned embeddings, verifies every representative WAV and
SHA-256, and requires the exact manifest file inventory. Missing expected
outputs remain pending; partial, stale, unbound, symlinked, or tampered outputs
fail the entire build closed.

Each cluster page exposes the acoustic diagnostics, nearest-centroid examples,
farthest-centroid audit clips, and nearby pinned-caption timing context. No
choice is preselected. A reviewer may provisionally choose a current canonical
roster entry, `unmapped`, or `mixed/impure`, add notes, and copy or download a
hash-bound decision JSON. Browser-local drafts and exports explicitly remain
provisional: the page never edits `audio/cast.json` and never asserts a speaker
identity automatically.

### Group anonymous acoustic recurrence across the fetched corpus

`build_cross_video_voice_bank.py` is a review-only aggregation stage over the
completed v2 proofs. It uses no network or GPU. Before admitting a cluster it
validates the exact saved queue, all 29 content-bound plans, execution
provenance, manifests, unit-normalized CAM++ embedding payloads, recomputed
local assignments and diagnostics, representative WAVs, and exact fetched-file
inventories. It then recomputes and stores every normalized 68-cluster centroid
from the source-order vectors.

The grouping rule is deterministic complete-link agglomeration at cosine
`0.92`, with at most one cluster from any source video in a family. Every pair
across a proposed merge must pass the threshold; single-link chaining is not
allowed. The signed JSON preserves all cross-video pairwise scores, the exact
merge trace, per-family complete-link floors and separation margins, per-cluster
nearest rankings and margins, full centroid vectors and hashes, and explicit
uncertainty flags. Families remain `anonymous-family-NNN`: they neither prove
one actor nor one speaker, never carry a character identity, never write
`audio/cast.json`, and confer no cast-completion credit.

Build or independently rebuild one content-addressed scratch artifact with:

```bash
uv run python scripts/audio/build_cross_video_voice_bank.py --write
uv run python scripts/audio/build_cross_video_voice_bank.py \
  --verify scratch/audio-cross-video-voice-bank/<voice-bank-sha256>/voice-bank.json
```

The current pinned proof has 35 anonymous families: 13 recurrent candidates
link 46 clusters, and 22 clusters remain singletons. It separately preserves
40 clustered members whose exact centroid cosine is below the local `0.72`
threshold and 74 segments that the local v2 manifests left unclustered. Those
counts are different evidence classes; neither is silently relabelled as the
other.

### Review recurrent actor candidates without asserting identity

`build_cross_video_actor_bank_review.py` converts only the pinned semantic
voice-bank proof into a static listening surface. It independently rebuilds
the exact voice bank, revalidates all 29 local output proofs, and verifies the
saved bank, queue, character catalog, plans, manifests, embeddings, captions,
and all 204 representative WAV hashes before atomically installing anything.
Generated assets, the index content page, and all 35 family pages are named by
their full content hashes beneath the pinned voice-bank hash:

```bash
uv run python scripts/audio/build_cross_video_actor_bank_review.py
uv run python -m http.server 8765 --bind 127.0.0.1
```

Open
`http://127.0.0.1:8765/scratch/audio-cross-video-actor-bank-review/73815a50001eb4b21c52dd7d1bff7d1749c6bcad671a4e085ff5ebab372d43d2/index.html`.
Each anonymous family shows every member cluster, all internal cross-video
pairs, its exact complete-link merge steps, nearest-external and margin
evidence, per-cluster nearest rankings, and verified playable clips with pinned
caption context. Singletons remain visible with their inapplicable internal
diagnostics stated explicitly.

There is no family-level identity control. A reviewer can choose only from the
canonical `voice-owner` roster for each cluster's own dialogue, explicitly
preserve `unassigned / unknown`, or leave the cluster undecided.
`reported-only` and `review-required` appearances are evidence, never
provisional character choices. Confidence and notes are optional. Drafts remain
in browser local storage bound to the voice-bank, character-catalog, and
decision-registry hashes. Copy/download emits a normalized 68-cluster
provisional JSON whose safety flags state that it writes neither cast,
speaker-attribution, nor canonical-identity data. The generator never reads
such a draft back and never writes `audio/cast.json`.

The selected Socrates WAV is only compared to its pinned Crito time interval.
An anchor would require at least 95% coverage by one cluster, at most 2%
competing-cluster coverage, at most 3% uncovered time, and a duration mismatch
no greater than 0.05 seconds. The current interval fails all four checks, so
the artifact records it as `external-comparison-only`, emits no Socrates anchor,
and leaves the anonymous family model unchanged.

`compare_selected_voice_reference.py` implements the separate direct-embedding
comparison without altering that result. Its dry plan binds the selected cast
record, exact `abe614...` WAV bytes, the completed anonymous voice-bank SHA,
Dots model/source revision, frozen acoustic core, deterministic CUDA policy,
and every participating generator. `execute` runs only the same pinned CAM++
x-vector path on CUDA; normal resume rechecks the live GPU/runtime provenance,
while `--repeat-check` reloads the model and requires a byte-identical 512-value
vector. The fetched signed proof and comparison are independently verifiable:

```bash
uv run python scripts/audio/compare_selected_voice_reference.py plan --write
# Run the exact transfer and execute commands printed by the plan.
uv run python scripts/audio/compare_selected_voice_reference.py verify-embedding \
  --plan scratch/audio-selected-reference-comparison/plans/<plan-sha>.json \
  --embedding scratch/audio-selected-reference-embeddings/<plan-sha>/embedding.json
uv run python scripts/audio/compare_selected_voice_reference.py compare \
  --plan scratch/audio-selected-reference-comparison/plans/<plan-sha>.json \
  --embedding scratch/audio-selected-reference-embeddings/<plan-sha>/embedding.json \
  --write
```

The legacy comparison plan is `0808668d...`; its former Cast v2-bound extraction
preserved vector SHA `ff69274a...`. Across all 68 cluster and 35 family
centroids, the nearest cluster is Crito `anonymous-cluster-00` at cosine
`0.889381953`, with a `0.029887027` lead over the next cluster. Its singleton
`anonymous-family-010` ranks first at `0.889381953`, with a `0.050171126`
family lead. The family is not a cross-video recurrence, the score is below the
voice-bank `0.92` grouping threshold, neither side is proven single-speaker,
and cosine is not a calibrated identity probability. The comparison therefore
records zero character anchors, writes no cast data, and grants no selection or
completion credit. It cannot satisfy the current Cast v3 promoter.

## Canonical inputs

CharacterCatalog v3 separates textual identity from voice ownership on every
dialogue appearance. Only `performanceRole: "voice-owner"` may own a source or
commentary screenplay entry. `reported-only` identities remain evidence but
inherit the active character's voice, while `review-required` appearances block
production until an editor resolves the role. In Crito, the Dream Woman and the
Laws are `reported-only`; both passages therefore remain Socrates.

The schema-v3 cast is `audio/cast.json`, with exact policy
`voiceOwnership: "one-voice-per-character"` and
`reportedSpeech: "inherit-active-character"`. Every voice owner used anywhere
in the screenplay must have a selected Dots continuation-cloning voice,
including when planning only a dry chapter subset. The renderer
verifies all of the following before synthesis:

- the screenplay's `cast_sha256` equals the exact cast file;
- the engine, model repository, 40-character model revision, mode, seed, and
  inference parameters are complete and pinned;
- the reference is mono 48 kHz WAV and its bytes match
  `reference.localSha256`; and
- the exact prompt transcript is present.

A selected voice may name a repo-relative `reference.relativePath`. If the
reference is materialized outside the checkout, pass an absolute override such
as `--reference socrates=/path/to/socrates.wav`; the override never bypasses
the cast hash.

## Deterministic screenplay planning

### Scratch speaker-attribution scaffolds

Generate the conservative corpus audit without writing anything:

```bash
uv run python scripts/audio/scaffold_speaker_attributions.py |
  jq '{summary, focus: [.dialogues[] |
    select(.dialogue == "symposium" or .dialogue == "crito" or
      .dialogue == "greater-hippias")]}'
```

Materialize the full ignored review corpus only under
`scratch/audio-speaker-attributions/`:

```bash
uv run python scripts/audio/scaffold_speaker_attributions.py --write \
  > scratch/audio-speaker-attributions/latest-diagnostics.json
```

The command verifies the cached XML against the pinned TEI hash, re-renders it,
and requires exact UTF-8 byte equality with every
`raw/plato/english/<dialogue>.txt`. Each `*.scaffold.json` then partitions the
entire flattened source into ordered, gapless `start_char`/`end_char` ranges in
the accepted plan's JavaScript-compatible UTF-16 offset unit. It is always
`accepted: false`, `editorial_status: human-review-required`, and
`counts_as_production_attribution: false`; its writer is confined to
`scratch/` and cannot create `audio/speaker-attributions/`.

Schema v2 records stable structural evidence for each atom: its DOM element
path (or all contributing paths for collapsed whitespace), nearest and parent
`<said>` ordinals, quote node path/depth, and whether the text is direct or
descendant content. These fields make inherited-owner errors inspectable
without turning parent or nearest owners into attribution claims.

Automatic assignment is deliberately narrow: an exact, single `<said who>`
must map through that dialogue's `sourceAttributions` to exactly one resolved
catalog character, and the text must belong to the deepest leaf `<said>`.
Narration, missing/multiple/catalog-missing owners, the direct text of a mixed
outer `<said>`, and all `{q}`/`{quote}` content remain named unresolved spans.
The script reuses the canonical-turn workflow's pinned-source, cache, catalog,
and exact-owner loaders. Its annotated renderer is separate because the
canonical turn parser intentionally discards flattened-source offsets; it
asserts equality with the canonical importer on every run so the duplicate
render traversal cannot silently drift.

`corpus-diagnostics.json` also exposes character-performance evidence separately
from TEI attribution. The recurring commentary narrator is checked for every
dialogue. Existing prototype evidence additionally checks Crito's Dream Woman
and Laws and Symposium's Announcer. CharacterCatalog v3 resolves those names
while marking each dialogue appearance `voice-owner`, `reported-only`, or
`review-required`; the Symposium Announcer evidence folds into the recurring
narrator. The Dream Woman and Laws remain nonselectable evidence rather than
cast requirements. This classification does not assign quoted source text: the
baseline remains 1,331,408 unresolved UTF-16 units represented as 63,303
provenance atoms. The scaffold neither invents character IDs nor edits
`audio/characters.json`, `audio/cast.json`, or production scripts.

Inspect one complete scaffold:

```bash
uv run python scripts/audio/scaffold_speaker_attributions.py crito |
  jq '{dialogue, accepted, summary, catalog_gap_diagnostics}'
```

Build the mechanical active-speaker drafts for all 27 dialogues:

```bash
uv run python scripts/audio/build_structural_speaker_drafts.py --write \
  > scratch/audio-speaker-attribution-drafts/latest-matrix.json
```

This second scratch stage re-verifies every scaffold atom and source hash. A
top-level source speaker retains its canonical character. Every nested or
reported span—whether its inner `<said>` has an explicit owner or not—inherits
the uniquely proven active enclosing speaker. This is the corpus-wide form of
the edition rule that Socrates remains Socrates while recounting another
person's words. Exact catalog matches also repair the pinned TEI's two
space-bearing `who` values without treating spaces as multiple speakers. The
result is still an unaccepted, gapless scratch draft; source titles, Stephanus
markup, whitespace, and the Apology's unwrapped monologue remain explicit.

Under the recorded operator authorization for deterministic acceptance with no
manual listening, materialize the canonical schema-v2 plans with:

```bash
uv run python scripts/audio/accept_structural_speaker_attributions.py \
  --accepted-at 2026-07-15 --write \
  > /tmp/speaker-attribution-acceptance.json
```

The production writer is confined to `audio/speaker-attributions/` and
`audio/speaker-attribution-acceptance.json`. It binds the current character
catalog, draft matrix, every draft and source hash, and both generator hashes.
It assigns source titles to the recurring commentary narrator and the
Apology's unwrapped defence to Socrates, except for eighteen source-hash-bound
live replies by Meletus. The two passages where Socrates paraphrases Meletus's
supposed puzzle and indictment remain Socrates. Source-only structural glue is
attached to the following proven owner (or the preceding owner only at the
end). The writer coalesces consecutive atoms by owner while splitting at
Stephanus boundaries, so no accepted segment is empty after canonical text
normalization and no source byte is lost. The acceptance manifest records the
exact output hash and resolution counts for all 27 plans; it never claims that
a person listened to the corpus.

Build the deterministic ignored triage corpus after materializing scaffolds:

```bash
uv run python scripts/audio/build_speaker_attribution_triage.py --write \
  > scratch/audio-speaker-attribution-triage/latest-corpus.json
```

The triage artifact preserves every unresolved scaffold atom, range, and hash,
and losslessly splits only its presentation text to keep packets at no more
than 24 fragments and 4,000 UTF-16 units. Packets are sorted into
`physical-label-confirmation`, `true-multi-owner`, `missing-owner`,
`embedded-dialogue`, and `unattributed-longform`. The artifact remains
`accepted: false`, contains no proposed speaker or character field, and its
writer is confined to `scratch/`. Neutral glue is named but retained. A `q` or
`quote` delimiter is never neutral without balanced markers tied to one stable
quote path, and delimiters are never discarded.

Generate the local provisional review application after the triage corpus:

```bash
uv run python scripts/audio/build_speaker_attribution_review.py --write \
  > scratch/audio-speaker-attribution-review/latest-index.json
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open
`http://127.0.0.1:8765/scratch/audio-speaker-attribution-review/index.html`.
The generator revalidates the corpus, dialogue triage, packet, fragment,
scaffold, canonical English, current generator, and CharacterCatalog hashes
before writing any page. Each page rechecks its own signed page data with Web
Crypto before enabling review controls. Generated stylesheet and script URLs
carry their exact SHA-256 as a query version, and the writer refuses to publish
pages if either asset has drifted from the hashes signed into the corpus index;
regeneration therefore cannot silently reuse a stale browser-cached UI bundle.

Every child atom still shows its bounded source context, lane, exact range/hash,
and DOM/TEI provenance, but the human controls operate on homogeneous semantic
review units instead of mechanical atoms. Contiguous lexical children coalesce
only when lane, unresolved reason, direct/descendant relation, and stable
quote/said/DOM container all agree. Assigned gaps, labels, structural and quote
boundaries, and container changes split units. Balanced same-node markup
delimiters, standalone structural markers, and triage-proven neutral glue
(including punctuation and whitespace) are deterministically classified as
nonspoken; their exact atoms remain visible and remain separate signed export
rows.

Pages open on the human-unit filter and render at most 100 matching units at a
time, so large dialogues do not eagerly construct tens of thousands of audit
cards. The all-unit and deterministic-nonspoken filters plus the load-more
control still make every preserved unit and child atom inspectable.

No roster choice is preselected, and only CharacterCatalog v3 `voice-owner`
appearances are selectable. `reported-only` and `review-required` identities
remain visible as nonselectable evidence. One human unit decision expands to
all of its lexical child atoms as `roster-character`, `keep-unresolved`,
`outer-performer`, `literary-quotation`, or `nonspoken-glue`; each performed
decision requires an explicit active voice-owner choice. The only bulk control
is an explicitly chosen `outer-performer` for a homogeneous multi-child
`physical-label-confirmation` unit. Structural/neutral children always expand
as deterministic nonspoken rows. Parent/nearest owners are visible evidence
but are never automatic defaults. Once a voice owner is selected for a span,
quoted or reported words stay in that character's voice.

Draft decisions persist in `localStorage` under the exact dialogue, triage,
catalog, and page-data hashes. Export remains disabled until every human review
unit has one complete decision. Expansion then preserves and binds every source
atom, range, and text hash exactly. Against the locked 118-identity catalog,
63,303 unresolved atoms become 13,702 human decisions plus 47,307 deterministic
nonspoken atoms; Crito becomes 43 human decisions over 316 preserved atoms,
with 256 atoms handled by the deterministic policy. The downloaded JSON is
schema- and SHA-256-bound, always provisional, and can be validated against
current inputs without writing production data:

```bash
uv run python scripts/audio/build_speaker_attribution_review.py \
  --validate-review /path/to/crito.speaker-attribution-review.json
```

The review UI and validator cannot create
`audio/speaker-attributions/<dialogue>.json`; their writers are confined to
ignored `scratch/` artifacts.

Inspect a dialogue without writing anything:

```bash
bun scripts/audio/generate_screenplay.ts symposium
```

The report always carries `dry_run: true` and
`counts_as_production_screenplay: false`. It reads the canonical English and
English Stephanus files, accepted commentary, character/cast catalogs, and an
accepted `audio/speaker-attributions/<dialogue>.json`. It does not consume the
prototype scripts under `scratch/`, inherit an unlabeled physical line's prior
speaker, infer the speaker inside `{q}` spans, or edit `audio/cast.json`.

Reproduce a compact missing-input audit for both prototypes:

```bash
for dialogue in symposium crito; do
  bun scripts/audio/generate_screenplay.ts "$dialogue" |
    jq '{dialogue, screenplay_status, commentary, characters,
      source_diagnostics: {
        physical_line_count: .source_diagnostics.physical_line_count,
        explicit_label_line_count: .source_diagnostics.explicit_label_line_count,
        embedded_quote_line_count: .source_diagnostics.embedded_quote_line_count,
        unresolved_line_count: (.source_diagnostics.unresolved_lines | length)
      }, blockers}'
done
```

This is diagnostic evidence, not attribution. In particular, an explicit
physical-line label does not settle the speaker of a tagged quotation within
that line.

The required attribution shape is:

```json
{
  "schema_version": 2,
  "dialogue": "symposium",
  "english_sha256": "<sha256 of raw/plato/english/symposium.txt>",
  "voice_policy": "reported-speech-inherits-active-character-v1",
  "status": "accepted",
  "reviewer": "<editor>",
  "reviewed_at": "2026-07-13",
  "commentary_character_id": "commentator",
  "segments": [
    {
      "id": "turn-0001",
      "start_char": 0,
      "end_char": 1570,
      "character_id": "apollodorus"
    }
  ]
}
```

Segments must partition every raw source character exactly once, in order.
They must be split at commentary-section boundaries and at any active
voice-owner change; a quotation or reenactment alone is not a voice change.
After deterministic label/metadata removal, their ordered text must be
byte-equivalent to the entire canonical spoken spine. Every source and
commentary `character_id` must be a `voice-owner` appearance. `reported-only`
and `review-required` identities cannot own segments. Every voice-owner role
must be represented, and production additionally requires each to have a
selected voice.

An evidence-complete but incompletely cast screenplay may be materialized only
as an unmistakable scratch draft:

```bash
bun scripts/audio/generate_screenplay.ts symposium --write-draft
```

The production path is a hard gate:

```bash
bun scripts/audio/generate_screenplay.ts symposium --write-production
```

It writes `audio/scripts/symposium.json` only when accepted commentary, an
operator-delegated Luna-sample-accepted commentary-quality audit, accepted span attribution,
exact source coverage, resolved characters, selected cast, stable IDs,
commentary coverage, chapter mapping, and the strict repository validator all
pass. The generated version separately binds the exact quality-audit and
attribution hashes; changing either artifact makes later validation fail.

The hard-cutover screenplay schema is:

```json
{
  "schema_version": 2,
  "dialogue": "crito",
  "source_hashes": { "english": "<sha256>", "stephanus": "<sha256>" },
  "commentary_sha256": "<sha256>",
  "commentary_quality_audit_sha256": "<sha256 of wiki/commentary-audits/crito.json>",
  "cast_sha256": "<sha256 of audio/cast.json>",
  "generator_version": "screenplay-generator-v3+attribution.<accepted-attribution-sha256>",
  "chapters": [
    { "id": "before-dawn", "commentary_id": "comm_crito_0001", "title": "Before dawn" }
  ],
  "entries": [
    {
      "id": "crito-0001",
      "chapter_id": "before-dawn",
      "kind": "source",
      "character_id": "socrates",
      "text": "Why have you come so early, Crito?",
      "anchor": { "stephanus": "43a" },
      "cadence_intent": "exchange"
    }
  ],
  "repairs": [],
  "coverage": {
    "source_words": 7,
    "source_words_covered": 7,
    "source_words_uncovered": 0,
    "source_words_duplicated": 0,
    "commentary_blocks_expected": 0,
    "commentary_blocks_covered": 0,
    "commentary_blocks_missing": 0,
    "commentary_blocks_duplicated": 0
  }
}
```

Entry kinds are `source`, `commentary`, `heading`, and `meta`. Cadence intents
are `none`, `continuation`, `short_reply`, `exchange`, `reflective`,
`commentary`, and `chapter`. The renderer owns this exact boundary policy:

| Boundary | Pause | Crossfade |
| --- | ---: | ---: |
| Same-speaker continuation | 0 ms | 18 ms |
| Speaker change | 90–200 ms, punctuation/intent aware | 0 ms |
| Commentary | 280 ms | 0 ms |
| Chapter | 550 ms | 0 ms |

No ordinary turn can acquire a one-second gap. Generated padding is
edge-trimmed at -50 dB with 30 ms retained before these boundaries are
assembled. Only whole, consecutive entries for the same character, chapter,
and kind may share a synthesis call, and only when the later entry is marked
`continuation` and the combined text remains within 320 characters. A long
entry is split losslessly and remains separately traceable through exact text
spans.

The pinned Dots `generate` call accepts one target text, one prompt WAV and
prompt transcript, and one generation recipe. It has no screenplay-speaker
mapping argument. Feeding a labelled multi-speaker script to one call would
condition the entire result on one reference voice; Dots cannot silently infer
the cast or switch selected voices. Every render task therefore binds exactly
one character to exactly one selected cast recipe. A future engine with native
multi-speaker dialogue would require a separate explicit renderer contract and
recorded QA exception, not an implicit Dots mode.

## Content addressing and resume

Production planning reads only canonical schema-v2
`audio/scripts/<dialogue>.json` and schema-v3 `audio/cast.json`. It verifies the current
English, Stephanus, commentary, canonical commentary-quality audit, cast, and
accepted speaker-attribution hashes. The generator version must use the v2
attribution binding. The exact `wiki/commentary-audits/<dialogue>.json` is then
parsed by the canonical TypeScript validator through Bun and must contain a
current human `accepted` decision with a hash-bound review note. The validator
helper, canonical validator, complete harness TypeScript tree, Bun executable,
and Bun version are all bound into the render plan. Executable `.js`, `.mjs`,
or `.cjs` files anywhere under `packages/harness/src/` are rejected before Bun
runs, and the reject-all shadow policy has its own plan-bound hash. A second canonical
TypeScript preflight runs `validateAudioScriptArtifact`, reconstructing the
complete ordered spoken English and exact commentary headings/bodies/IDs from
current repository inputs; self-consistent word counts do not substitute for
that reconstruction. Only after both preflights succeed may the renderer
inspect a cache, resume, or write a plan or audio.
It also requires selected Dots voices for every character in the full
screenplay even when a dry chapter subset is requested. Schema v1, scratch
screenplays, pending/malformed/stale quality audits, and fallback voices are
rejected with no compatibility path.

Long entries are split losslessly at sentence or clause boundaries, with a
320-character ceiling. Renderer v5 additionally binds exact fragment lists for
two Lesser Hippias entries: the full-master ASR audit found a corrupted opening
in source turn 125 and a dropped tail in source turn 143. Turn 125's first
canonical fragment remains lowercase in `utterance.text` and its span; only the
Dots-facing `utterance.synthesis_text` capitalizes its initial letter. The
validator permits that registered case-only transform and rejects any changed
word or punctuation. Turn 143 is split before its final clause. Thus screenplay
text remains canonical while only four targeted fragment calls are new. The
ordinary 320-character policy is unchanged, and the existing
zero-pause same-speaker crossfade preserves continuity.

Two heading observations from the same audit are deliberately not encoded as
renderer overrides: Dots omitted the leading articles in `A silence that has
to be broken` and `The good man as willing wrongdoer, and Socrates alone
adrift` even in the untrimmed generation. Punctuation and an alternate narrator
seed did not produce a deterministic minimal repair, so renderer v5
does not introduce a broad text transform or speculative retry for them.

`migrate_chunk_ceiling_cache.py` performs the single permitted v4-to-v5 cache
readdress. It requires the pinned v4 Lesser Hippias plan, the exact pinned v5
renderer source, and a current content-addressed v5 plan. It copies only tasks
whose complete synthesis inputs match after adding the v5 evidence and an
unchanged `synthesis_text`; all tasks touching either repaired entry remain
pending for normal synthesis.

```bash
uv run python scripts/audio/migrate_chunk_ceiling_cache.py \
  --old-plan <outdir>/plans/e730b3c356be41a4983105362015d13928bdf962636fcdb7a86295681a1b8b01.json \
  --new-plan <outdir>/plans/<reviewed-v5-plan-sha256>.json \
  --outdir <outdir>
```

Each task hash covers the exact canonical and synthesis texts, entry spans and anchors,
source/commentary/cast hashes, voice selection, reference hash and prompt,
seed, model revision, Dots source commit, package pins, inference settings,
trim settings, output format, and renderer code hash. It also carries the full
byte-hashed inventory of the pinned model snapshot and installed `dots_tts`
source tree, the exact `runtime.py` hash, and the exact `direct_url.json` hash.
Standard Hugging Face snapshot file links are accepted only when they resolve
to regular files inside that model repository's `blobs/` directory; directory
links, escaping links, package-source links, missing files, and special files
fail closed. The complete inventories are rebuilt before plan review and again
immediately before execution, so a changed weight or installed source file
invalidates the reviewed plan before cache resume.

The same receipt binds the actual import specs, loaders, absolute origins, and
package locations for every pinned Python renderer dependency. Every installed
distribution file is byte-hashed; every available wheel `RECORD` SHA-256 and
size is verified; generated bytecode and `RECORD` itself are also included in a
deterministic full-distribution inventory hash. Unrecorded files inside owned
package trees, repo or `PYTHONPATH` shadows, nonstandard loaders, and files
outside the trusted environment fail closed. After import, the renderer rebuilds
the inventories and verifies every loaded module in those namespaces against
its reviewed distribution ownership.

The complete plan is itself written to
`<outdir>/plans/<plan-sha256>.json`. Production execution requires that exact
content-addressed file plus its separately supplied reviewed SHA-256. The
executor rebuilds a current plan from canonical inputs and refuses stale,
tampered, relocated, subset, or partial plans.

One atomic directory is published for each chunk:

```text
<outdir>/cache/<first-two-hash-characters>/<input-sha256>/
  audio.wav
  render.json
```

A completed chapter is content-addressed under
`<outdir>/units/chapters/<chapter-id>/<assembly-sha256>/`; the raw complete
dialogue unit is under `<outdir>/units/complete/<assembly-sha256>/`. These are
mono 48 kHz PCM24 renderer outputs, not mastered or accepted publication
recordings. Chapter units use classic RIFF PCM24; the complete dialogue is
always forced RF64 PCM24, even when short. Its `ds64`, RIFF, data, and sample
counts are parsed and cross-checked, and complete assembly streams pauses and
chapter audio in fixed-size blocks rather than concatenating the dialogue in
memory. Publishing renames a fully fsynced temporary directory. Resume is
permitted only when the directory has exactly `audio.wav` and `render.json`,
the sidecar reconstructs the content address and timing, and the WAV checksum
and format match. A partial, extra-file, stale, or corrupt directory fails
loudly instead of being overwritten.

Execution validates every task cache before importing Dots or touching CUDA.
When every task is already complete, the command skips model/runtime loading
and proceeds directly to the same verified chapter and complete-dialogue
assembly path. This makes cache-only recovery and assembly possible without
reserving GPU memory; a partial or corrupt cache still fails before assembly.

Parent resume never trusts only a child's input address. Before checking an
existing chapter, the renderer validates every task cache and binds each exact
task WAV hash, frame count, and render-sidecar hash into the chapter assembly
address. Before checking an existing complete unit, it validates every chapter
and binds its WAV hash, frame count, timing hash, and render-sidecar hash into
the complete assembly address. A coherently rewritten child therefore creates
a new missing parent address instead of reusing stale assembled audio. The
complete-unit sidecar also exposes an ordered `chapter_starts` inventory with
exact 48 kHz `start_frame`/`start_seconds` values and every bound chapter
evidence identity. Both that inventory and the complete timing map carry
independently validated content hashes for mastering and publication-manifest
generation.

Select one or more units with `--chapters before-dawn,which-opinions-matter`, or
use `--chapters all`.

## Remote GPU prerequisites

The GPU host currently has an RTX 4090 and the pinned model snapshot at
`/mnt/models/hf/hub/models--rednote-hilab--dots.tts-soar/snapshots/e3520f75254d0020a0406db31c51a79d00d22d55`.
The persistent Dots environment is provisioned at
`/mnt/models/dev/plato-dots/.venv` from the exact Dots 0.2.1 Git commit below.
Use that environment for rendering, ASR QA, and CAM++ ranking. If it ever must
be rebuilt, recreate it with the same pinned inputs:

```bash
ssh gpu '
  set -eu
  python3 -m venv /mnt/models/dev/plato-dots/.venv
  /mnt/models/dev/plato-dots/.venv/bin/python -m pip install --upgrade pip
  /mnt/models/dev/plato-dots/.venv/bin/python -m pip install \
    "git+https://github.com/rednote-hilab/dots.tts.git@5ed719e3d36f5a3f6d8037ca9a7009d4fd0520ba" \
    -c "https://raw.githubusercontent.com/rednote-hilab/dots.tts/5ed719e3d36f5a3f6d8037ca9a7009d4fd0520ba/constraints/recommended.txt"
'
```

The quality preflight imports the repository validator and rebuilds its
dependencies. A partial renderer-only transfer is unsupported. Materialize a
clean full repository snapshot on the GPU (excluding caches and ordinary
scratch output), install the lockfile-pinned Bun dependencies there, and then
copy any selected scratch voice references at their exact cast paths. For Crito
and the currently selected Socrates reference, run locally:

```bash
ssh gpu 'mkdir -p /mnt/models/dev/plato-audio'
rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='scratch/' \
  ./ gpu:/mnt/models/dev/plato-audio/
rsync -aR \
  scratch/crito-audio/auditions/dots-youtube-socrates/youtube-socrates-reference.wav \
  gpu:/mnt/models/dev/plato-audio/
ssh gpu 'cd /mnt/models/dev/plato-audio && bun install --frozen-lockfile'
```

The snapshot must include the exact screenplay, quality manifest, review note,
commentary/protocol/source dependencies, accepted attribution, cast, validator
bridge, and `packages/harness/src` tree used to build the reviewed plan. If any
of those bytes differ, the GPU plan hash is intentionally different.

Validate, hash the runtime/model inventories, write, and preview the
full-dialogue plan without loading the model onto CUDA:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/render_dots.py \
  --script /mnt/models/dev/plato-audio/audio/scripts/crito.json \
  --cast /mnt/models/dev/plato-audio/audio/cast.json \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio \
  --chapters all \
  --write-plan'
```

Record the printed `plan_sha256` and `plan_path`. After reviewing that exact
artifact, execute it explicitly (replace both placeholders with the printed
values):

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/render_dots.py \
  --script /mnt/models/dev/plato-audio/audio/scripts/crito.json \
  --cast /mnt/models/dev/plato-audio/audio/cast.json \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio \
  --chapters all \
  --execute-plan /mnt/models/artifacts/plato-audio/plans/<plan-sha256>.json \
  --expected-plan-sha256 <plan-sha256> \
  --render'
```

Re-running that reviewed command resumes only verified tasks, chapters, and the
complete unit. The renderer resolves the already cached model by the pinned
snapshot path and does not request an unpinned revision.

## Deterministic mastering and mechanical-only QA

`master_audio.py` accepts only the exact full-dialogue renderer plan and the
chapter/complete assembly graph reconstructed from it. It rejects chapter
subsets, stale canonical dependencies, missing or altered chapter sidecars,
changed PCM bytes, extra/partial artifact directories, and any mismatch between
the saved plan and current inputs. It does not parse a second screenplay shape
or select audio opportunistically from an output directory.

Planning is read-only except when `--write-plan` is requested. It verifies the
mono 48 kHz PCM24 source, records every chapter input/audio/timing hash, records
the complete assembly hashes, authoritative hash-bound chapter starts, and
semantic boundary inventory, resolves and hashes the actual `ffmpeg` and
`ffprobe` binaries, records their version lines, binds the authoritative
`master_audio.py` implementation name/version and exact source-file SHA-256,
and binds NumPy 2.2.6 by module origin, RECORD hash, and a verified digest of
every installed package/code/binary file used by the blockwise PCM scanner.
It then runs loudnorm's measurement pass. Exact logical command arrays,
runtime evidence, and measured values are part of the content address. Any
implementation or analysis-runtime byte change invalidates prior plans and
resumable results.

Mastering schema v5 copies the renderer evidence into `chapter_timeline` and
`chapter_timeline_sha256` in the plan, mechanical QA, and `mastering.json`.
Each ordered row carries the chapter id, renderer input/audio/timing/sidecar
hashes, frame count, and exact start/end frames and seconds. Validation requires
exact agreement with the renderer's complete assembly, including the first
frame, inter-chapter gaps, child lengths, order, and final full-master frame.
Downstream publication metadata must consume these starts instead of summing
QA-reported durations.

```bash
python scripts/audio/master_audio.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio/mastering \
  --write-plan
```

Review and record the printed mastering plan SHA-256, then execute exactly that
plan:

```bash
python scripts/audio/master_audio.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio/mastering \
  --execute-plan /mnt/models/artifacts/plato-audio/mastering/plans/<mastering-plan-sha256>.json \
  --expected-mastering-plan-sha256 <mastering-plan-sha256> \
  --execute
```

Execution repeats the measurement pass and requires the rebuilt plan to equal
the reviewed plan before writing. The renderer complete assembly and second
loudnorm pass both use forced RF64, so Laws and Republic cannot overflow the
classic 4 GiB RIFF limit. Complete assembly and PCM analysis stream in bounded
blocks rather than materializing the full waveform in memory. The working
master is mono 48 kHz PCM24 targeting -19 LUFS integrated (±1 LU) and no more
than -1 dBTP. A metadata-free, fixed 96 kbit/s mono MP3 is the compressed
publication derivative. Both encodes are bit-reproducible under the recorded
tool binaries. Results live atomically under:

```text
<outdir>/artifacts/<mastering-plan-sha256>/
  master.wav
  publication.mp3
  mastering.json
  mechanical-qa.json
```

`mechanical-qa.json` is scratch evidence only. It records working/publication
hashes, formats and durations; loudness and true peak; exact PCM clipping count;
all detected silences of at least 250 ms; internal silence over 1200 ms or a
silence crossing a declared pause over 800 ms;
the silence floor within each declared pause (with a pinned 5 ms filter-edge
guard); chapter hashes; and gate results. It always records `accepted: false`,
ASR `not-performed`, and listening `not-performed`. The tool refuses to write
under repository `audio/qa/` or `wiki/recordings/`. A mechanical pass is a
handoff to ASR and explicit production acceptance, never acceptance by itself.

## Full-master mechanical ASR evidence

`qa_full_master_asr.py` closes the mechanical ASR evidence lane without
accepting a recording or asserting that anyone listened to it. It accepts only
the current canonical schema-v2 screenplay, exact full-dialogue render graph,
current content-addressed mastering plan, and the still-unaccepted passing
mastering result. It reconstructs every chapter's ordered spoken text from the
screenplay and clips the normalized working master only at the authoritative
48 kHz mastering timeline. Renderer task/chapter/master bytes, sidecars,
screenplay dependencies, mastering artifacts, model files, and implementation
files are hash-bound and are checked before and after inference.

The recognizer is the already pinned
`deepdml/faster-whisper-large-v3-turbo-ct2` revision
`44cbbd1adefe7387c83df88963a6d9ac4c9adea5`, with faster-whisper 1.2.1,
CTranslate2 4.8.1, CUDA float16, English, and beam 5. One model instance is
loaded and reused for every chapter. Word normalization matches the screenplay
contract's Unicode letter/number/apostrophe tokens. Because this lane performs
no human exception classification, it conservatively counts every Levenshtein
edit as an ordinary-word error. Corpus WER is the sum of ordered chapter edit
distances divided by the sum of chapter expected words.

The ASR process must use the same `/mnt/models/dev/plato-dots/.venv` that
created the mastering plan because that plan binds the exact NumPy 2.2.6
distribution root and inventory. Provision the additional recognizer packages
there once without allowing pip to alter any existing mastering/Dots package:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python -m pip install --no-deps \
  faster-whisper==1.2.1 \
  ctranslate2==4.8.1 \
  av==18.0.0 \
  onnxruntime==1.27.0 \
  protobuf==7.35.1 \
  flatbuffers==25.12.19'
```

The preflight also requires the already installed exact versions of NumPy,
huggingface-hub, tokenizers, tqdm, packaging, and PyYAML; it fails rather than
resolving or upgrading a dependency at run time.

The exact pinned model snapshot is already materialized beneath
`/mnt/models/cache/huggingface/models--deepdml--faster-whisper-large-v3-turbo-ct2/snapshots/44cbbd1adefe7387c83df88963a6d9ac4c9adea5`;
do not download another copy.

The default command is read-only and does not load the model. It prints the
exact ASR plan SHA-256:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/qa_full_master_asr.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --mastering-plan /mnt/models/artifacts/plato-audio/mastering/plans/<mastering-plan-sha256>.json \
  --expected-mastering-plan-sha256 <mastering-plan-sha256> \
  --mastering-outdir /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --cache-dir /mnt/models/cache/huggingface \
  --outdir /mnt/models/artifacts/plato-audio/full-master-asr'
```

Execute only that reviewed input identity:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/qa_full_master_asr.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --mastering-plan /mnt/models/artifacts/plato-audio/mastering/plans/<mastering-plan-sha256>.json \
  --expected-mastering-plan-sha256 <mastering-plan-sha256> \
  --mastering-outdir /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --cache-dir /mnt/models/cache/huggingface \
  --outdir /mnt/models/artifacts/plato-audio/full-master-asr \
  --expected-asr-plan-sha256 <asr-plan-sha256> \
  --execute'
```

The only output is
`<outdir>/artifacts/<evidence-sha256>/asr-evidence.json`. The evidence includes
the expected text and transcript, exact per-chapter and corpus word counts,
ordinary-word errors, and WER, while permanently recording `accepted: false`
and human listening `not-performed`. The script rejects output beneath
`audio/qa/` or `wiki/recordings/`.

## Unaccepted production QA handoff

`assemble_audio_qa_handoff.py` joins the exact screenplay, full-dialogue render
graph and completed assembly, mastering-v6 plan/result/mechanical QA, and the
content-addressed full-master ASR report. It revalidates every upstream byte and
timeline identity before measuring each chapter directly from its authoritative
working-master frame interval. It does not copy the complete master's global
metrics into chapter rows: each interval gets its own FFmpeg loudnorm integrated
LUFS and true-peak pass, FFmpeg silence scan, and vectorized PCM24 sample/clipping
scan. Inter-chapter gaps remain covered by the already replayed complete-master
mechanical QA instead of being silently assigned to a neighboring chapter.

The default command performs this full read-only verification and measurement
pass. The full-master ASR argument must be the exact
`artifacts/<evidence-sha256>/asr-evidence.json` emitted by the prior command;
`<full-master-asr-file-sha256>` is the SHA-256 of that JSON file's bytes (not its
internal evidence content address).

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/assemble_audio_qa_handoff.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --mastering-plan /mnt/models/artifacts/plato-audio/mastering/plans/<mastering-plan-sha256>.json \
  --expected-mastering-plan-sha256 <mastering-plan-sha256> \
  --mastering-outdir /mnt/models/artifacts/plato-audio/mastering \
  --cache-dir /mnt/models/cache/huggingface \
  --full-master-asr /mnt/models/artifacts/plato-audio/full-master-asr/artifacts/<asr-evidence-sha256>/asr-evidence.json \
  --expected-full-master-asr-file-sha256 <full-master-asr-file-sha256> \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio/qa-handoffs'
```

Review the printed handoff SHA-256, then permit only that exact recomputed
handoff to be written:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/assemble_audio_qa_handoff.py \
  --render-plan /mnt/models/artifacts/plato-audio/plans/<render-plan-sha256>.json \
  --expected-render-plan-sha256 <render-plan-sha256> \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --mastering-plan /mnt/models/artifacts/plato-audio/mastering/plans/<mastering-plan-sha256>.json \
  --expected-mastering-plan-sha256 <mastering-plan-sha256> \
  --mastering-outdir /mnt/models/artifacts/plato-audio/mastering \
  --cache-dir /mnt/models/cache/huggingface \
  --full-master-asr /mnt/models/artifacts/plato-audio/full-master-asr/artifacts/<asr-evidence-sha256>/asr-evidence.json \
  --expected-full-master-asr-file-sha256 <full-master-asr-file-sha256> \
  --repo-root /mnt/models/dev/plato-audio \
  --outdir /mnt/models/artifacts/plato-audio/qa-handoffs \
  --expected-handoff-sha256 <qa-handoff-sha256> \
  --execute'
```

The only output is
`<outdir>/artifacts/<qa-handoff-sha256>/qa-handoff.json`. It is an unaccepted
scratch handoff with human listening explicitly `not-performed`; the command
refuses `audio/qa/` and `wiki/recordings/` destinations. It deliberately does
not manufacture an accepted QA-v2 object. Promotion requires a separate
schema-v2 production-acceptance review, distinct chapter WAV paths and hashes,
and the remaining canonical artifact bindings. The review records either
completed whole-master listening or an explicit operator-authorized mechanical
and ASR waiver; a waiver never bypasses a failed source, commentary, ASR,
audio, or cast gate. The handoff lists those exact inputs, plus reviewed ASR
exception enumeration when word errors exist, as explicit blockers.

Resume validation rereads the bound screenplay, cast, render plan, mastering
plan/result/mechanical QA, working master, publication derivative, full-master
ASR report, and ASR file inventory. It rederives every summary, chapter row,
timeline relation, measurement gate, cast result, listening state, and
promotion blocker before trusting a coherently rehashed handoff. The output
root must also be disjoint from the mastering artifact directory and the
content-addressed full-master ASR evidence directory; equality or any
descendant path is rejected before directories are created.

### Corpus post-render preparation

`prepare_corpus_audio_qa.py` applies the ASR and handoff sequence above to the
current mastering receipt for every canonical dialogue. Its default mode is a
local, read-only audit and does not contact the GPU:

```bash
uv run python scripts/audio/prepare_corpus_audio_qa.py
```

Execution is serial and resumable. For each dialogue it runs the ASR preview,
executes only the returned ASR plan SHA, hashes that exact evidence file, runs
the QA-handoff preview, and executes only the returned handoff SHA:

```bash
uv run python scripts/audio/prepare_corpus_audio_qa.py --execute
```

The wrapper uses the dedicated pinned ASR cache at
`/mnt/models/cache/huggingface`; the renderer's separate `/mnt/models/hf/hub`
cache is never substituted.

The wrapper fails rather than guessing if no receipt, multiple receipts, or a
receipt with stale screenplay, cast, or reference bytes matches a dialogue.
After all selected dialogues finish, it writes one content-addressed index at
`scratch/audio-corpus-postrender/handoff-indexes/<index-sha256>.json`. Each row
binds the receipt, ASR evidence, QA handoff, promotion blockers, and the
expected `scratch/audio-acceptance-reviews/<dialogue>.json` path. The index and
all upstream artifacts remain explicitly unaccepted; this command never
creates an acceptance review, `audio/qa`, or `wiki/recordings` record. A repeated
`--dialogue <slug>` option may be used for a bounded recovery run without
changing the all-dialogue default.

Production-acceptance reviews are normally written after the mechanical index.
Bind those later files into a new immutable index without replaying ASR or
handoff measurements:

```bash
uv run python scripts/audio/prepare_corpus_audio_qa.py \
  --refresh-index scratch/audio-corpus-postrender/handoff-indexes/<index-sha256>.json
```

Refresh only hashes and reports the supplied review files as
`present-unvalidated`; validation and acceptance remain the promoter's job.

## Production acceptance and promotion

`promote_audio_qa.py` is the only command that converts an unaccepted QA
handoff into canonical accepted production records. It requires a separate
schema-v2 acceptance review that binds the exact handoff evidence SHA, working
master SHA, complete ordered chapter inventory, named authorizer, date,
rationale, findings, and a complete reviewed enumeration of any ASR word
errors. The review must choose either complete-master human listening or the
explicit operator-authorized mechanical-and-ASR waiver. An accepted review
cannot contain a failure finding or omit a chapter, and the waiver cannot make
any failed production gate pass.

An operator-waiver review uses this exact shape under
`scratch/audio-acceptance-reviews/<dialogue>.json`:

```json
{
  "schema_version": 2,
  "dialogue": "crito",
  "handoff_evidence_sha256": "<qa-handoff-evidence-sha256>",
  "working_master_sha256": "<working-master-sha256>",
  "acceptance_basis": "operator-authorized-mechanical-and-asr-waiver",
  "authorized_by": "<operator-identity>",
  "authorized_at": "<YYYY-MM-DD>",
  "rationale": "Operator explicitly accepts the mechanically and ASR passing production without complete-master human listening.",
  "listening_status": "not-performed",
  "accepted_chapter_ids": ["<every-screenplay-chapter-in-order>"],
  "disposition": "accepted-with-listening-waiver",
  "findings": [],
  "asr_exceptions": []
}
```

When ASR reports any word errors, `asr_exceptions` must enumerate all of them;
zero ordinary-word errors remains mandatory.

The promoter revalidates the handoff and current screenplay/cast, rereads every
mastering-v6 artifact beneath the explicit artifact root, and derives distinct
RF64 PCM24 chapter WAVs from the authoritative working-master frame slices. It
then builds accepted `audio/qa/<dialogue>.json` and
`wiki/recordings/<dialogue>.json` bytes. The default invocation writes nothing
and returns a content-addressed promotion plan:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/promote_audio_qa.py \
  --handoff /mnt/models/artifacts/plato-audio/qa-handoffs/artifacts/<qa-handoff-sha256>/qa-handoff.json \
  --acceptance-review /mnt/models/dev/plato-audio/scratch/audio-acceptance-reviews/crito.json \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --generated-at 2026-07-16T16:00:00Z'
```

Execute only the exact reviewed plan:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/promote_audio_qa.py \
  --handoff /mnt/models/artifacts/plato-audio/qa-handoffs/artifacts/<qa-handoff-sha256>/qa-handoff.json \
  --acceptance-review /mnt/models/dev/plato-audio/scratch/audio-acceptance-reviews/crito.json \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --generated-at 2026-07-16T16:00:00Z \
  --execute \
  --reviewed-plan-sha256 <promotion-plan-sha256>'
```

Execution fails before writes if a canonical target already contains different
bytes. It writes chapter artifacts and the two repository records atomically,
runs the full repository validator with the explicit recording artifact root,
and rolls back every newly created file if validation fails. Repeating the same
reviewed plan is idempotent.

For the complete corpus, use the refreshed post-render index rather than
running 27 unrelated promotion commands. `promote_corpus_audio_qa.py` requires
the exact canonical 27-dialogue inventory, 27 mechanically passing handoffs,
27 passing ASR rows, and 27 present hash-bound acceptance reviews. It revalidates
every review and artifact through the single-dialogue promoter before returning
one corpus plan SHA. The default remains read-only:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/promote_corpus_audio_qa.py \
  --input-index /mnt/models/dev/plato-audio/scratch/audio-corpus-postrender/handoff-indexes/<refreshed-index-sha256>.json \
  --qa-handoff-root /mnt/models/artifacts/plato-audio/qa-handoffs \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --generated-at 2026-07-16T20:00:00Z'
```

Execute only the reviewed corpus hash:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/promote_corpus_audio_qa.py \
  --input-index /mnt/models/dev/plato-audio/scratch/audio-corpus-postrender/handoff-indexes/<refreshed-index-sha256>.json \
  --qa-handoff-root /mnt/models/artifacts/plato-audio/qa-handoffs \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --repo-root /mnt/models/dev/plato-audio \
  --generated-at 2026-07-16T20:00:00Z \
  --execute --reviewed-plan-sha256 <corpus-promotion-plan-sha256>'
```

All dialogue targets are preflighted before the first write. Execution creates
only the chapter files and canonical QA/recording targets enumerated by the 27
validated single-dialogue plans, defers repository validation until the entire
set is present, and removes every batch-created output if any promotion or the
final validator fails. After success, materialize all accepted MP3s and site
links with an explicit artifact root:

```bash
bun run harness site \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering
```

Site generation validates the complete accepted recording evidence set before
deleting a previous build, then independently verifies every MP3 while copying
it. A missing, stale, or corrupt later dialogue therefore cannot erase a known
good published tree.

## Post-acceptance renderer pruning

Once `audio/qa/<dialogue>.json` and
`wiki/recordings/<dialogue>.json` are genuinely accepted, raw renderer
intermediates may be removed with
`prune_renderer_intermediates.py`. The command is dry by default. It
revalidates the accepted manifest, exact screenplay/QA/cast bytes, mastering
plan/result/mechanical QA, RF64 working master, MP3 publication derivative,
renderer plan, every task cache, and both assembly levels before producing a
plan.

Preview the exact targets without writing:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/prune_renderer_intermediates.py \
  --recording-manifest /mnt/models/dev/plato-audio/wiki/recordings/crito.json \
  --repo-root /mnt/models/dev/plato-audio \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering'
```

Write the content-addressed plan as a separate review step:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/prune_renderer_intermediates.py \
  --recording-manifest /mnt/models/dev/plato-audio/wiki/recordings/crito.json \
  --repo-root /mnt/models/dev/plato-audio \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --write-plan'
```

Then execute only the reviewed path/SHA pair:

```bash
ssh gpu '/mnt/models/dev/plato-dots/.venv/bin/python \
  /mnt/models/dev/plato-audio/scripts/audio/prune_renderer_intermediates.py \
  --recording-manifest /mnt/models/dev/plato-audio/wiki/recordings/crito.json \
  --repo-root /mnt/models/dev/plato-audio \
  --renderer-outdir /mnt/models/artifacts/plato-audio \
  --recording-artifact-root /mnt/models/artifacts/plato-audio/mastering \
  --execute-plan /mnt/models/artifacts/plato-audio/pruning/plans/<prune-plan-sha256>.json \
  --expected-plan-sha256 <prune-plan-sha256> \
  --execute'
```

Execution rebuilds the complete plan and requires exact equality before moving
anything. It prunes only the plan-bound task-cache directories, chapter
assembly directories, and complete raw assembly directory. It explicitly
preserves the renderer plan, mastering plan and sidecars, mechanical QA,
accepted screenplay/QA/cast/recording manifest, RF64 working master, and MP3.
A recovery journal makes interrupted quarantine/deletion resumable, and the
final receipt is written under
`<renderer-outdir>/pruning/receipts/<dialogue>/<prune-plan-sha256>.json`.
Run this after each accepted dialogue or small accepted wave rather than
retaining every raw PCM layer for the whole corpus.

## Local pure tests

```bash
uv run --with numpy==2.2.6 python -m unittest \
  tests.test_render_dots tests.test_master_audio \
  tests.test_qa_full_master_asr \
  tests.test_assemble_audio_qa_handoff \
  tests.test_promote_audio_qa \
  tests.test_promote_corpus_audio_qa \
  tests.test_prune_renderer_intermediates -v
```
