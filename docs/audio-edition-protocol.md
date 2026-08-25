# Audio Edition Protocol

This document governs the guided recordings produced from the canonical English
reading spines and accepted commentary. It is a publication layer. It never
feeds observation, claim, relation, dossier, cluster, or label extraction.

## Coverage unit

The unit of completion is one canonical dialogue under `raw/plato/greek/`.
A dialogue is audio-complete only when all of the following are accepted:

1. English spine and English Stephanus index.
2. Accepted commentary ledger.
3. Operator-delegated Luna-sample-accepted, hash-bound commentary quality-audit manifest.
4. Complete character census and selected cast.
5. Source-complete screenplay with chapters.
6. Dots render, mastered chapter files, and complete master.
7. Mechanical and listening QA.
8. Recording manifest and working site link.

Prototype MP3s, unresolved roles, scratch commentary or audit results, an
accepted ledger without its canonical quality manifest, or an unlinked
recording do not count as completion.

## Separation and source priority

- The spoken source is `raw/plato/english/<dialogue>.txt` at the hash recorded
  in the screenplay. The Greek source and accepted wiki records ground
  commentary but are not translated during audio production.
- Production-ready commentary requires both accepted blocks and an accepted
  `wiki/commentary-audits/<dialogue>.json` manifest bound to the exact ledger,
  protocol, exhaustive `gpt-5.6-luna` medium-effort audit outputs, ordered
  independent Luna sample, and committed review note explicitly stating that no
  human listening or review is claimed. Outline and rewrite jobs use high effort;
  audit and draft jobs use medium effort. Section blocks become
  chapter boundaries; other blocks may be interleaved at their anchors.
- Enumerated transcription repairs are permitted only when the exact old text,
  replacement, reason, and occurrence count are committed. Unrecorded cleanup
  is forbidden.
- The audio lane may read the neutral layers. Neutral pipelines never read the
  audio lane or commentary.

## Character and cast identity

`audio/characters.json` is the canonical directory of textual identities and
voice ownership. Its current contract is a hard-cut `schemaVersion: 3`; earlier
versions are rejected rather than upgraded or accepted as fallbacks. Every
appearance has a non-empty `roleFlags` array drawn from the closed enum
`source-speaker`, `commentary-narrator`, `dream-figure`, `reported-speaker`,
`collective`, and `personification`. Those flags describe source and editorial
evidence; they do not decide whether the identity receives a separate voice.
`source-speaker` requires preserved TEI evidence. A non-TEI role instead
requires an explicit `editorialNote`; source-only appearances may not carry one.
Dream figures and personifications are also reported speakers, and the
edition-wide commentary narrator is not combined with a source role.

Every appearance also has exactly one `performanceRole`:

- `voice-owner` may own source or commentary screenplay spans and must use the
  character's one recurring cast voice;
- `reported-only` remains a canonical textual identity and review aid but may
  never own a screenplay span or cast selection; its quoted or reported words
  use the active `voice-owner` character's voice; and
- `review-required` is deliberately non-performable and blocks cast completion
  until an editor decides whether the appearance is a dramatic source turn or
  only reported speech.

This is not a rule that every nested narrative collapses to the outermost
narrator. An accepted attribution may preserve a deliberately dramatized source
turn, including a turn inside a framed dialogue, by assigning it to a
`voice-owner`. But merely naming, quoting, impersonating, or reporting another
figure never creates a voice switch inside the active character's turn.

The catalog explicitly includes a recurring `commentary-narrator` in all 27
dialogues, with `Announcer`, `Commentary Narrator`, and `Commentator` as aliases.
Crito additionally includes `dream-woman` as a dream/reported identity and
`laws-of-athens` as a collective personification/reported identity. Both are
`reported-only`: the dream and the speech of the Laws occur inside Socrates'
active turns and therefore use Socrates' voice. The
Symposium prototype's Announcer resolves to the recurring commentary narrator,
not a second character. These editorial identities close the known production
evidence gaps but do not prove who owns an English source span.

The 2026-07-15 CharacterCatalog v3 baseline is complete: 118 identities and
192 appearances, comprising 125 `voice-owner` and 67 `reported-only`
appearances with no `review-required` appearances. Those appearances resolve
to 61 distinct recurring voice owners. The schema-v2 speaker-attribution
scaffold still leaves 1,331,408 of 4,020,414 UTF-16 code units unresolved,
represented as 63,303 provenance atoms out of 117,425 total; catalog identity
completion therefore does not imply accepted span attribution. Source-
attribution candidates are derived from the pinned English TEI, while an
accepted gapless speaker-attribution plan must resolve the active voice owner
for embedded quotations and mixed turns.

`audio/cast.json` is `schemaVersion: 3`. Its exact policy is
`voiceOwnership: one-voice-per-character` and
`reportedSpeech: inherit-active-character`, with
`acceptancePolicy: operator-authorized-deterministic-v1` and
`manualListeningRequired: false`. It maps only `voice-owner` identities used by
a screenplay to explicit selected voices. A selection records the exact source,
materializer, speaker-purity, primary and optional independent ASR, canonical
Dots audition, CAM++ ranking, WAV signal measurements, deterministic decision,
and content hashes. There is no default voice, legacy fallback, quote-specific
voice override, or unrecorded judgment.

Recurring identities retain one voice across dialogues. Performance parameters
may be versioned per dialogue, but a source-character reassignment requires an
explicit operator-authorized `voice-source-reassignment` reason. The source
character and canonical voice owner are otherwise required to match.

Dots is the production baseline. Socrates has an explicit seed-44 operator pin;
the admissible reference is the audited safe inner interval 65.92--72.28, never
the rejected 65.04--72.51 boundaries. An engine exception is allowed only for a
named role that fails recorded Dots intelligibility or production QA, and the
exception is recorded rather than hidden.

`audio/reference-sources.json` schema v2 pins the operator-authorized YouTube
channel's non-dramatized full-cast edition for every dialogue. It is a source
pool, not a cast decision. A voice enters `audio/cast.json` only through
`scripts/audio/accept_dots_cast_voice.py`, after all of these fail-closed checks:

Automatic labelled-turn mining uses the hard-cut
`earliest-source-order-exact-caption-v1` selection policy. A candidate window
must be an exact normalized caption-token sequence with a unique occurrence;
fuzzy dynamic-programming matches are retained
only for auditing an explicit pinned reference anchor. Turns, pinned videos,
and windows are visited in source order. The miner retains the first three
passing, mutually non-overlapping intervals per canonical voice owner and then
stops searching that character. It never exhaustively generates later
candidates merely to quality-rank and discard them. Duplicate query spans,
same-character overlaps, and cross-character overlaps fail closed. This bounded
selection changes coverage and speed only; it bypasses none of the downstream
source, ASR, acoustic, or signal gates.

- a canonical materializer sidecar and exact source-registry binding;
- a complete interval inside one Jowett-labelled source turn, with reported
  speech excluded, represented as 1.0 dominant, 0.0 competing, and 0.0
  uncovered coverage under `jowett-caption-turn-alignment-v1`;
- one canonical Dots `audition-manifest.json`, Whisper-small `asr-qa.json`, and
  CAM++ `speaker-ranking.json`, all bound to the same audition-plan SHA-256 and
  exact output inventory;
- zero ordinary-word errors for the clone and reference. If primary reference
  ASR fails, the only exception is exact Jowett/caption source agreement plus a
  semantically parsed zero-error artifact from
  `deepdml/faster-whisper-large-v3-turbo-ct2` at revision
  `44cbbd1adefe7387c83df88963a6d9ac4c9adea5`, faster-whisper 1.2.1,
  CTranslate2 4.8.1, CUDA float16, English, and beam 5;
- mean CAM++ cosine at least 0.85 and every window at least 0.80; no clipped
  samples, true peak no higher than 0 dBTP, and sample peak no higher than
  0.9999; and
- a 3--15 second reference, an 8--60 second audition, and 1.5--4.5 expected
  words per audition second.

The default winner is the highest-mean-cosine passing seed, then highest
minimum-window cosine, fewest ordinary-word errors, speech rate closest to 3.0,
and lowest seed. An explicit `--seed` records an operator pin but cannot bypass
any gate. Cast selection therefore requires no per-character listening pass;
the later full-dialogue production QA still requires its listening sample.

Automatic captions may locate possible regions, but a lexical cue such as
`replied Crito` does not prove which side of the cue is Crito's speech or that
the interval contains only one speaker. Cue-only matches are non-materializable
hypotheses with no confidence or cast-completion credit. A materialization plan
requires an explicit aligned phrase and an asserted cue placement/speaker-span
  direction, followed by transcript correction and the same deterministic
  source, ASR, acoustic, and signal gates.

Anonymous CAM++ clustering is a second listening aid, not diarization truth.
It may group bounded clips by acoustic similarity while explicitly recording
that single-speaker purity is not guaranteed. Its immutable plan, media and
caption hashes, model/source revisions, embeddings, diagnostics, representative
and farthest-member audit clips, and resume evidence are retained. Clusters
  never carry character names and never update `audio/cast.json`; they are not a
  substitute for the labelled-turn proof accepted by the cast promoter.

Cross-video recurrence is a separate anonymous, review-only derived stage. It
must revalidate every exact local proof and recompute normalized centroids from
the pinned embedding vectors. Families use deterministic complete-link
agglomeration with an explicit cosine threshold and at most one cluster from a
source video; single-link chaining is forbidden. The artifact retains full
centroids, all cross-video pairwise scores, merge order, nearest rankings,
separation margins, local below-threshold members, locally unclustered segments,
and uncertainty flags. A recurrent family is only an acoustic candidate: it
does not guarantee one actor or one speaker, cannot carry a character identity,
cannot update the cast registry, and cannot count toward cast completion.

The cross-video actor-bank review surface remains downstream of that anonymous
proof and scratch-only. It may organize all member clusters into family pages,
expose complete pairwise and merge diagnostics, and offer verified listening
clips with pinned caption context. It must never offer a family-level character
choice: an actor may perform different roles in different videos. Any
provisional choice is attached to one video-local cluster and constrained to
that dialogue's canonical roster. Undecided and explicitly unassigned are
distinct states. Browser-local drafts and normalized exports must remain bound
to exact voice-bank, catalog, and decision-registry hashes and declare that
they write no cast, speaker-attribution, or canonical-identity data.

A selected-cast interval may label a family only through an explicit exclusive
overlap proof. The current Socrates gate requires at least 95% interval coverage
by one anonymous cluster, no more than 2% competing-cluster coverage, no more
than 3% uncovered time, and at most 0.05 seconds difference between the selected
WAV duration and its pinned source interval. A failed gate remains an external
comparison and emits no character anchor. Direct embedding of a selected cast
WAV is a separate versioned comparison artifact; it cannot weaken or rewrite
the anonymous recurrence evidence.

That direct comparison must use the same pinned model revision, Dots source
commit, CAM++ x-vector extractor, frozen decoding core, and deterministic CUDA
settings as the corpus embeddings. Its plan binds the exact selected-reference
bytes and completed anonymous voice-bank SHA. The GPU proof stores the full
normalized vector and execution provenance; strict resume rechecks the live
runtime, and a repeat check must recompute the identical vector. The local
content-addressed artifact retains scores against every cluster and family
centroid, ranks and margins, and explicit limitations. Even when the nearest
cluster is the cluster covering most of the selected source interval, this is
corroborating acoustic evidence only: it does not repair a failed interval
purity gate, label the cluster or family, or count as a cast decision.

`audio/speaker-attributions/<dialogue>.json` is the span-level editorial
bridge between the flattened English spine and a screenplay. Aggregate TEI
speaker counts, inherited physical-line speakers, and scratch dramatizations
do not establish who speaks an embedded quotation. An accepted attribution
plan is schema v2 and pins the exact voice policy
`reported-speech-inherits-active-character-v1`, English SHA-256, reviewer/date,
commentary voice owner, and an ordered, gapless partition of raw English
character ranges into active `voice-owner` character IDs. A reported identity
may remain visible in the text and evidence, but it cannot own a segment; its
words stay inside the active character's segment. The generator refuses
missing, draft, stale, overlapping, gapped, cross-chapter, roster-incomplete,
`reported-only`, or `review-required` assignments. It never writes this plan or
updates `audio/cast.json` itself.

The deterministic precursor is an explicitly non-production scaffold under
`scratch/audio-speaker-attributions/`. It proves that the pinned TEI reproduces
the exact `raw/plato/english` UTF-8 bytes and emits a gapless UTF-16-offset
partition, but assigns only exact uniquely catalogued deepest-leaf `<said who>`
content. Quotation markup, narration, mixed outer turns, missing/multiple
owners, and catalog gaps stay unresolved for a person. A scaffold is never an
accepted plan and cannot be copied or renamed into production as approval.
Every atom records a stable DOM element path (or all contributing paths for
collapsed whitespace), nearest and parent `<said>` ordinals, quote path/depth,
and whether its text is direct or descendant content. This provenance records
structure only; in particular, an ownerless nested `<said>` does not inherit
its parent owner, and text within `{q}`/`{quote}` does not inherit the nearest
owner.
Its corpus diagnostics separately inventory character-performance evidence,
including the shared commentary narrator and prototype-evidenced dream,
personification, or announcing identities. CharacterCatalog v3 retains all of
those identities while separating voice owners from reported-only and
review-required appearances. That leaves the scaffold's
1,331,408 unresolved UTF-16 units unchanged. The scaffold never adds a role or
converts a catalog match into source-span attribution automatically.

The separate ignored triage queue under
`scratch/audio-speaker-attribution-triage/` preserves every unresolved atom,
range, and hash, then groups lossless bounded fragments into five deterministic
review lanes. It is also `accepted: false`, contains no proposed speaker or
character assignment, and cannot be promoted into
`audio/speaker-attributions/`. Neutral formatting remains an explicit atom;
`q` and `quote` delimiters are not even classified as neutral unless balanced
and bound to one stable quote-node identity, and they are never discarded.

The local review UI under `scratch/audio-speaker-attribution-review/` validates
that full evidence chain before rendering signed page data. It displays every
child atom with source context and DOM provenance, but asks a person to decide
homogeneous semantic units rather than mechanical atoms. Lexical children can
share one unit only when their lane, unresolved reason, direct/descendant
relation, and stable quote/said/DOM container agree; assigned gaps, labels,
structural or quote boundaries, and container changes force a split. Balanced
same-node markup delimiters, standalone structural markers, and triage-proven
neutral punctuation/whitespace are deterministically nonspoken. They remain
visible and are still expanded into exact signed atom rows.

Every generated CSS and JavaScript reference is query-versioned with the exact
asset SHA-256 recorded in the corpus index. The writer fails closed if the bytes
change between model construction and page materialization, preventing a newly
generated page from loading a stale cached review bundle at the same local URL.

The default view contains human units and incrementally renders 100 matching
units at a time. Reviewers can switch to all units or deterministic-only audit
units and load subsequent pages, so the largest dialogues remain usable without
hiding any preserved child provenance.

Roster selectors contain only `voice-owner` appearances, stay blank until a
person acts, and keep provisional choices only in browser-local storage keyed
by exact evidence hashes. `reported-only` and `review-required` identities stay
visible as nonselectable evidence. `outer-performer` and `literary-quotation`
decisions require an explicit active voice-owner choice; no nearest or parent
owner is inferred automatically. Once chosen, that active character owns the
whole span, including quoted or reported words. Bulk confirmation is available
only for an explicitly selected outer performer in a homogeneous multi-child
physical-label unit. Export is disabled until all human units are decided, then
expands those choices while preserving every atom, range, and hash. The locked
catalog baseline is 13,702 human decisions plus 47,307 deterministic nonspoken
atoms over all 63,303 unresolved atoms; Crito requires 43 human decisions over
316 exact atoms. The result is a signed, schema-bound, still-provisional review
JSON. Neither the page generator, export validator, nor review JSON can write
or count as an accepted production attribution.

## Screenplay contract

One schema-v2 `audio/scripts/<dialogue>.json` contains:

- schema version, dialogue, source hashes, commentary hash, the exact canonical
  commentary-quality-audit SHA-256, cast hash, and generator version;
- ordered chapters tied to accepted commentary section IDs;
- ordered entries with stable IDs, kind (`source`, `commentary`, `heading`, or
  `meta`), active voice-owner character ID, exact spoken text,
  source/commentary anchor, chapter, and cadence intent;
- enumerated transcription repairs; and
- deterministic coverage totals.

Every source word is covered exactly once after enumerated repairs. This is an
exact text contract, not a screenplay-reported word-count claim. Validation
applies all repairs simultaneously to the hashed English file, rejects
overlapping or miscounted repairs, removes only the importer's enumerated brace
metadata, and removes TEI speaker labels only at a physical-line or brace-token
boundary. A label is eligible when it matches a character name/alias by
deterministic prefix components (for example `Soc.` to `Socrates` and
`Y. Soc.` to `Younger Socrates`). The only frequency rule is for a repeated
all-uppercase siglum of two to eight letters, which covers pinned-source sigla
such as `ΑΘ.` without treating repeated replies such as “By all means.” as
labels. The result and the ordered
concatenation of all `source` entry text are NFC-normalized, whitespace-collapsed,
and stripped of whitespace immediately before `, . ; : ? !`; they must then be
byte-identical. Lexical titles and other prose are not silently discarded.
Unknown brace metadata fails validation.

The deterministic generator is read-only by default. Its planning report is
explicitly non-production and may expose a prospective strict screenplay only
after commentary, canonical writing-quality acceptance, and attribution inputs
are complete. `--write-draft` writes solely under ignored
`scratch/audio-screenplays/`; `--write-production` is refused until the full
repository screenplay contract, including every selected voice, passes. Every
screenplay embeds the SHA-256 of the exact validated
`wiki/commentary-audits/<dialogue>.json`, whose decision must be `accepted`.
Missing, pending, malformed, or stale audit evidence prevents even a scratch
screenplay from being generated. Generated screenplay versions separately bind
the exact accepted speaker-attribution SHA-256, so changing either evidence
artifact invalidates the script. Schema v1 has no compatibility path.

Every commentary entry resolves to an accepted commentary ID. Every speaking
entry resolves to a selected cast entry for a `voice-owner`. Reported-only
identities cannot appear as screenplay `character_id` values, and any
`review-required` appearance keeps the dialogue from reaching complete cast
scope. The generator fails on omissions, duplication, reordering, invented
source text, or unattributed spoken text.

Cadence is semantic, not a single global gap. Ordinary exchanges use short,
punctuation-aware transitions; same-speaker continuations are shorter still.
Commentary and chapter boundaries may breathe longer. Fixed one-second pauses
between ordinary turns are forbidden.

## Rendering and reproducibility

The production rendering contract reads only the canonical schema-v2 screenplay
and schema-v3 cast. Before planning it must rehash the English spine, Stephanus index,
commentary, exact canonical accepted commentary-quality audit, accepted speaker
attribution, and cast, and require a selected Dots recipe for every character in
the complete screenplay. Scratch scripts, legacy schema-v1 scripts, missing or
stale writing-quality evidence, incomplete casts, fallback voices, and stale
generator-attribution bindings fail closed before cache, resume, or output
writes. Direct use of a renderer that does not implement this complete preflight
does not produce a production-valid recording.

The renderer does not reimplement the writing-quality rules in Python. It uses
Bun to invoke the canonical TypeScript manifest parser against the exact
`wiki/commentary-audits/<dialogue>.json` bytes and requires its
operator-delegated Luna-sample-accepted `accepted` receipt. The render plan binds
the manifest hash, validator bridge,
canonical validator, complete harness TypeScript tree, Bun executable, and Bun
version. Moving only the Python renderer to a GPU host is therefore not a valid
production setup; the exact repository validator and all of its current source
dependencies must move with it.

A separate canonical bridge invokes `validateAudioScriptArtifact` and requires
zero issues. This is the authoritative reconstruction gate for ordered source
speech, deterministic repairs, English coverage, commentary headings/bodies
and IDs, anchors, characters, and cast resolution. Python shape and arithmetic
checks are defense in depth only; they cannot authorize altered prose whose
counts happen to remain self-consistent. The full-validator helper and
`audio-production.ts` hashes are separately recorded in the plan.

The pinned Dots API synthesizes one target text from one reference WAV and
prompt transcript per call; it does not accept a screenplay-to-cast mapping.
Speaker labels inside one large prompt therefore cannot authorize implicit
voice switching. Each content-addressed render task contains exactly one
speaker and one selected voice. The only multi-entry unit allowed is a bounded
whole-entry same-speaker continuation; tasks never mix speakers or chapters.

The boundary policy is part of every plan and assembly content address:

- same-speaker continuation: 0 ms pause and an 18 ms linear crossfade;
- speaker change: 90–200 ms, adjusted deterministically by cadence intent and
  punctuation, with no crossfade;
- commentary boundary: 280 ms, with no crossfade; and
- chapter boundary: 550 ms, with no crossfade.

The renderer operates on content-addressed bounded-unit inputs. Each input hash
covers exact screenplay entries and text spans, source/commentary/cast hashes,
voice selection and listening evidence, model repository/revision, reference
audio hash and prompt, seed, inference parameters, renderer code and Dots
source hashes, package versions, trim settings, and output format. A cached
render is reused only when its sidecar, exact two-file inventory, PCM24 format,
runtime pins, and audio checksum match the complete current input. Runtime
evidence includes a deterministic byte-hashed inventory of every pinned model
snapshot file and every non-generated installed `dots_tts` source file, plus
the exact runtime wrapper and installation-origin metadata hashes. Hugging Face
file links are allowed only when confined to regular files in the repository's
blob store; model-directory links, escaping links, and installed-source links
are forbidden. Planning and execution independently rebuild this evidence, so
modified weights or installed Dots code cannot reuse a reviewed plan or cache.
The canonical TypeScript preflights also reject executable JavaScript shadows
under the harness source tree before Bun can resolve them and bind that policy
into the plan. Every pinned Python dependency is tied to its actual standard
loader, absolute import origin, package locations, installed `RECORD`, and a
full byte inventory. Recorded hashes and sizes are verified, unrecorded package
files and repo or `PYTHONPATH` shadows fail closed, and execution repeats the
inventory and loaded-module ownership checks after import.

The complete render plan is also content-addressed. Production execution is
full-dialogue only and requires both a saved plan and its separately supplied
reviewed SHA-256. The executor rebuilds the plan from current canonical inputs
and requires byte-for-byte structural equality before loading Dots. Chapters
and the complete raw renderer unit have their own content-addressed assembly
inputs, exact timing maps, and PCM24 checksums. They are mastering inputs, not
accepted recordings.

Chapter assemblies are classic RIFF PCM24. The complete raw dialogue is always
forced RF64 PCM24, including below the classic-RIFF limit; validation parses
and cross-checks the `ds64`, RIFF, data, and sample counts. Complete assembly
copies chapter frames and inserts declared pauses in fixed-size streaming
blocks, keeping memory bounded for works the size of the *Republic* or *Laws*.

Assembly addresses bind validated output evidence, not merely child input
addresses. A chapter binds every task WAV checksum, frame count, and exact
render-sidecar checksum. The complete unit binds every chapter WAV checksum,
frame count, timing checksum, and exact render-sidecar checksum. Children are
fully validated before an existing parent address can resume, so coherently
replacing a child invalidates its parent. The complete-unit sidecar additionally
publishes an ordered, separately content-hashed `chapter_starts` inventory:
each chapter carries its bound input/audio/timing/sidecar identity plus exact
48 kHz start frame and start seconds from the complete master timeline. Website
recording manifests derive chapter seeks from this evidence, never by summing
independently rounded QA durations.

Writes are atomic. Partial audio/sidecar pairs fail resume. Any change to text,
cast, model, parameters, renderer, or source hash invalidates the affected
render instead of silently reusing it.

Production masters are mono and mastered to -19 LUFS integrated (±1 LU), with
true peak at or below -1 dBTP. Lossless working masters and compressed
publication files are distinguished in manifests. The repository mastering
tool performs pinned FFmpeg loudnorm measurement and linear normalization as
two separate passes. Its reviewed plan binds the full-dialogue render plan,
every chapter and complete-assembly audio/timing hash, the exact FFmpeg and
FFprobe executable hashes and version lines, the authoritative
`master_audio.py` implementation name/version and exact source-file SHA-256,
the exact NumPy 2.2.6 analysis runtime, first-pass measurements, semantic
boundary inventory, policy, and logical command arrays. The runtime receipt
binds its absolute distribution root and module origin, module and installed
`RECORD` hashes, a hash of the complete installed-file inventory, and exact
file, binary, and byte counts. Execution revalidates every recorded package
file and binary before scanning PCM, repeats the measurement, and requires both
the current implementation/runtime identity and current plan to equal the
reviewed content address before it can write. Any `master_audio.py` byte or
NumPy installation change invalidates prior plans, QA records, and results
instead of resuming them under changed code.

Mastering schema v5 and implementation v4 carry that renderer evidence and
forced-RF64 profile forward as an ordered, content-hashed `chapter_timeline`
in the reviewed plan, mechanical QA, and `mastering.json`. Every row binds the
chapter id, input/audio/timing/sidecar
hashes, frame count, and exact start/end frame and second values. Validation
requires the timeline to match the renderer's `chapter_starts` hash and child
order, begin at frame zero, preserve all inter-chapter gaps and child lengths,
and end at the full-master frame count. Publication manifests consume these
production frames rather than reconstructing starts from editable QA durations.

The working derivative is forced-RF64 mono 48 kHz PCM24, including for short
dialogues, so corpus-scale works never cross a classic-RIFF size cliff. The
publication derivative is a deterministic metadata-free 96 kbit/s mono MP3.
Both and their sidecars are
published as one fsynced content-addressed directory. Resume does not trust the
mutable sidecars or their self-recorded hashes: under the exact plan-bound
FFmpeg and FFprobe bytes it reprobes both media files, streams the PCM24 sample
scan, repeats loudness and silence analysis, rechecks every declared boundary,
recomputes every gate, and requires the complete normalized QA/result objects
to match. Container, codec, sample rate, channel count, bit depth/format,
96 kbit/s publication rate, duration, clipping, loudness, silence, file size,
and checksum are all current-byte evidence. A partial, coherently rehashed,
tampered, stale, subset-derived, non-media, or extra-file result fails instead
of being overwritten or reused.

This makes resume verification linear in the recording duration rather than a
constant-time sidecar lookup: it deliberately rereads the full working master
and reruns the FFmpeg analysis passes. The exact PCM clipping/peak scan is one
bounded-memory streaming pass, so a long dialogue does not require loading its
master into memory. This cost is part of the fail-closed acceptance boundary,
not an optional fast path.

Mastering emits mechanical-only scratch QA: loudness, true peak, exact PCM
clipping count, duration/format, detected long silences, declared-boundary
silence checks, and chapter/assembly hashes. It explicitly records that ASR and
human listening were not performed and can never write an accepted
`audio/qa/<dialogue>.json` or `wiki/recordings/<dialogue>.json`. Passing this
mechanical stage is only the input to the acceptance QA below.

## QA and acceptance

`audio/qa/<dialogue>.json` records per-chapter and complete-master results:

- exact source/commentary coverage;
- audio format, duration, checksum, loudness, peak, clipping, and silence scan;
- ASR transcript and word-error results with all exceptions enumerated;
- speaker/cast resolution and recurring-character consistency;
- pronunciation/artifact/cadence findings;
- truthful complete-master listening status and findings; and
- production-acceptance basis, authorizer, date, rationale, disposition, and
  rerender links.

Auditions require zero ordinary-word ASR errors. The production ASR threshold
is ratified from the first two Dots masters; until then any ordinary-word error
is inspected and a recurring error fails the chapter. No clipping is allowed.
Silence that exceeds its declared chapter/commentary intent fails. A recurrent
bad voice, cadence, pronunciation, or speaker boundary fails the dialogue even
when mechanical metrics pass.

Promotion is an explicit two-step, content-addressed operation. A separate
schema-v2 production-acceptance review binds the exact unaccepted handoff,
working master, and complete ordered chapter inventory. It records an
authorizer, date, rationale, findings, every reviewed ASR exception, and either
completed whole-master listening or an explicit operator-authorized mechanical
and ASR waiver. The waiver cannot bypass any source, commentary, ASR, audio, or
cast failure, and accepted QA continues to record listening as `not-performed`.
The dry run derives the exact chapter WAV, accepted QA, and recording-manifest
hashes without writing. Execution requires that reviewed plan SHA, slices
distinct RF64 PCM24 chapter artifacts at the authoritative mastering frames,
writes the canonical QA and recording records atomically, and rolls all new
files back if full repository validation fails. No implicit acceptance exists.

## Recording manifest and storage

One `wiki/recordings/<dialogue>.json` is the website/publication record. It has
an immutable `recording_id`, dialogue and acceptance status, publication audio
path, MIME type, duration and SHA-256, ordered chapter IDs and authoritative
48 kHz `start_frame` values tied to accepted section commentary IDs, and
cast/provenance display fields. Website seek seconds are always derived as
`start_frame / 48000`; they are not a second independently editable manifest
value.

Recording schema v2 has no v1 fallback. An accepted manifest carries a strict
`production` binding to the exact screenplay and accepted QA bytes and to the
mastering-v6 plan, `mastering.json`, `mechanical-qa.json`, RF64 PCM24 working
master, and MP3 publication derivative. Every artifact has a canonical
artifact-root-relative path and byte SHA-256. The internal mastering plan and
timeline digests remain Python-owned semantic content addresses: TypeScript
does not attempt to reproduce Python JSON number serialization, but requires
the opaque SHA values and exact structures to agree across the byte-hashed
plan, result, and mechanical-QA records.

Validation requires the complete evidence set to exist as regular non-symlink
files. It checks the working master bytes as forced RF64 mono 48 kHz PCM24,
including `ds64`, exact data bytes, and frame count; checks the publication
bytes as mono 48 kHz 96 kbps MPEG Layer III; binds accepted QA to the exact
working master; and binds publication metadata to the exact mastered MP3.
Chapter order and `start_frame` must equal the mastering-v6 complete timeline,
whose end must equal the complete renderer frame count. QA chapter duration
sums are never used as seek positions. Draft and withdrawn manifests may omit
the production binding and are never published.

Large audio binaries do not enter ordinary Git history. Scripts, manifests,
hashes, transcripts, and QA are committed; masters live in the selected
versioned artifact store. A local or deployment site build materializes and
hash-verifies the referenced files beneath an explicit artifact root before
publishing them. `audio.path` is relative to that root, never opportunistically
resolved against the repository checkout.

Replacing audio creates a new recording ID or content hash. Website resume keys
include both, so stale listening progress is never applied to a replacement.

## Website behavior

The static reading page owns the full player because it already owns section
anchors and commentary. Dialogue landing pages expose a Listen link/status.
Use native `<audio controls preload="metadata">`, keyboard-operable chapter
controls, visible loading/errors, and no autoplay.

Resume is local to the browser: restore after metadata loads, save throttled
progress and on pause/pagehide, and clear on completion. No listening history is
sent to a server.
