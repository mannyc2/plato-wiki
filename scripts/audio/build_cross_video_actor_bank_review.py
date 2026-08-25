#!/usr/bin/env python3
"""Build a deterministic scratch-only review UI for the pinned acoustic bank.

The output is deliberately not an attribution or cast registry.  Anonymous
families are navigation aids over verified listening evidence; a reviewer may
make only per-video-cluster, browser-local provisional choices.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import os
import shutil
import tempfile
from pathlib import Path, PurePosixPath
from typing import Any

import build_cluster_review as cluster_review
import build_cross_video_voice_bank as voice_bank


PINNED_VOICE_BANK_SHA256 = (
    "73815a50001eb4b21c52dd7d1bff7d1749c6bcad671a4e085ff5ebab372d43d2"
)
DEFAULT_VOICE_BANK = (
    Path("scratch/audio-cross-video-voice-bank")
    / PINNED_VOICE_BANK_SHA256
    / "voice-bank.json"
)
DEFAULT_QUEUE = Path("scratch/audio-speaker-cluster-v2/queue.json")
DEFAULT_CHARACTERS = Path("audio/characters.json")
DEFAULT_OUTPUT_ROOT = Path("scratch/audio-cross-video-actor-bank-review")
STATUS = "cross-video-actor-bank-human-review-packet-v1"
DECISION_STATUS = "cross-video-actor-bank-provisional-review-v1"
MAX_VOICE_BANK_BYTES = 16 * 1024 * 1024
MAX_NOTE_CHARACTERS = 2_000
CONFIDENCE_LEVELS = ("low", "medium", "high")
UNASSIGNED_CHOICE = "__unassigned__"
SHA256_RE = voice_bank.SHA256_RE
PERFORMANCE_ROLES = frozenset({"voice-owner", "reported-only", "review-required"})


class ActorBankReviewError(ValueError):
    """Raised when pinned evidence cannot support the review surface."""


def _sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def _canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def _atomic_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_bytes(payload)
    temporary.replace(path)


def _regular_repo_file(
    value: Path,
    root: Path,
    label: str,
    *,
    maximum_bytes: int | None = None,
) -> Path:
    candidate = value if value.is_absolute() else root / value
    try:
        resolved = candidate.resolve(strict=True)
        resolved.relative_to(root)
    except FileNotFoundError as error:
        raise ActorBankReviewError(f"missing {label}: {value}") from error
    except ValueError as error:
        raise ActorBankReviewError(
            f"{label} escapes the repository: {value}"
        ) from error
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise ActorBankReviewError(f"{label} traverses a symlink: {value}")
        if parent == root:
            break
    size = resolved.stat().st_size
    if not resolved.is_file() or size <= 0:
        raise ActorBankReviewError(f"{label} must be a non-empty regular file")
    if maximum_bytes is not None and size > maximum_bytes:
        raise ActorBankReviewError(
            f"{label} exceeds its {maximum_bytes}-byte verification ceiling"
        )
    return resolved


def _repo_relative_file(value: str, root: Path, label: str) -> Path:
    if not isinstance(value, str) or not value or "\\" in value:
        raise ActorBankReviewError(f"{label} must be a repository-relative POSIX path")
    pure = PurePosixPath(value)
    if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
        raise ActorBankReviewError(f"{label} must be a confined repository path")
    return _regular_repo_file(root.joinpath(*pure.parts), root, label)


def _scratch_output_root(value: Path, root: Path) -> Path:
    candidate = value if value.is_absolute() else root / value
    scratch = root / "scratch"
    scratch.mkdir(exist_ok=True)
    try:
        resolved = candidate.resolve(strict=False)
        relative = resolved.relative_to(scratch.resolve(strict=True))
    except ValueError as error:
        raise ActorBankReviewError(
            "actor-bank review output must remain below repository scratch/"
        ) from error
    if not relative.parts:
        raise ActorBankReviewError("actor-bank review output may not replace scratch/")
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise ActorBankReviewError(
                "actor-bank review output may not traverse symlinks"
            )
        if parent == root:
            break
    if candidate.exists() and not candidate.is_dir():
        raise ActorBankReviewError("actor-bank review output root must be a directory")
    protected = [
        *cluster_review._protected_artifact_roots(root),
        (root / "scratch/audio-cross-video-voice-bank").resolve(strict=False),
        (root / "scratch/audio-speaker-cluster-review-v2").resolve(strict=False),
    ]
    for path in protected:
        if (
            resolved == path
            or resolved.is_relative_to(path)
            or path.is_relative_to(resolved)
        ):
            raise ActorBankReviewError(
                f"actor-bank review output overlaps protected evidence: {path}"
            )
    return resolved


def _read_voice_bank(
    path: Path,
    root: Path,
    expected_sha256: str,
) -> tuple[dict[str, Any], Path]:
    if SHA256_RE.fullmatch(expected_sha256) is None:
        raise ActorBankReviewError("expected voice-bank SHA-256 is malformed")
    source = _regular_repo_file(
        path,
        root,
        "pinned voice bank",
        maximum_bytes=MAX_VOICE_BANK_BYTES,
    )
    try:
        artifact = json.loads(source.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ActorBankReviewError(
            f"cannot parse pinned voice bank: {error}"
        ) from error
    try:
        voice_bank.validate_voice_bank(artifact)
    except voice_bank.VoiceBankError as error:
        raise ActorBankReviewError(f"invalid pinned voice bank: {error}") from error
    if artifact["voiceBankSha256"] != expected_sha256:
        raise ActorBankReviewError(
            "pinned voice-bank semantic SHA-256 differs from the required proof"
        )
    if source.parent.name != expected_sha256 or source.name != "voice-bank.json":
        raise ActorBankReviewError(
            "pinned voice bank must live in its exact semantic-hash directory"
        )
    return artifact, source


def _fingerprint(path: Path, root: Path, kind: str) -> dict[str, Any]:
    verified = _regular_repo_file(path, root, kind)
    return {
        "kind": kind,
        "path": verified.relative_to(root).as_posix(),
        "bytes": verified.stat().st_size,
        "sha256": cluster_review.file_sha256(verified),
    }


def _reverify_fingerprints(records: list[dict[str, Any]], root: Path) -> None:
    for record in records:
        path = _repo_relative_file(record["path"], root, record["kind"])
        if (
            path.stat().st_size != record["bytes"]
            or cluster_review.file_sha256(path) != record["sha256"]
        ):
            raise ActorBankReviewError(
                f"verified {record['kind']} changed during actor-bank build: {path}"
            )


def _manifest_cluster_map(video: dict[str, Any]) -> dict[str, dict[str, Any]]:
    clusters = video["manifest"]["clusters"]
    return {record["clusterId"]: record for record in clusters}


def _verified_clip_fingerprint(
    video: dict[str, Any],
    clip: dict[str, Any],
    root: Path,
) -> dict[str, Any]:
    clip_path = _regular_repo_file(
        video["output"] / clip["path"], root, "representative clip"
    )
    actual = cluster_review.file_sha256(clip_path)
    if actual != clip.get("sha256"):
        raise ActorBankReviewError(f"representative clip SHA-256 changed: {clip_path}")
    return _fingerprint(clip_path, root, "representative clip")


def _bind_evidence(
    artifact: dict[str, Any],
    corpus: dict[str, Any],
    root: Path,
) -> tuple[
    dict[str, dict[str, Any]],
    dict[str, dict[str, Any]],
    list[dict[str, Any]],
]:
    videos = corpus["videos"]
    if any(video["state"] != "verified-for-review" for video in videos):
        pending = [
            video["item"]["selection"]["selectionKey"]
            for video in videos
            if video["state"] != "verified-for-review"
        ]
        raise ActorBankReviewError(
            "cross-video review requires every bank video to be verified; pending: "
            + ", ".join(pending)
        )
    video_by_key = {
        video["item"]["selection"]["selectionKey"]: video for video in videos
    }
    inventory_by_key = {
        record["selectionKey"]: record for record in artifact["evidenceInventory"]
    }
    if set(video_by_key) != set(inventory_by_key):
        raise ActorBankReviewError(
            "voice-bank evidence inventory differs from the verified review corpus"
        )

    fingerprints = [
        _fingerprint(corpus["queuePath"], root, "v2 queue"),
        _fingerprint(corpus["charactersPath"], root, "character catalog"),
    ]
    cluster_by_key: dict[str, dict[str, Any]] = {}
    for cluster in artifact["clusters"]:
        cluster_by_key[cluster["clusterKey"]] = cluster

    for selection_key in sorted(video_by_key):
        video = video_by_key[selection_key]
        item = video["item"]
        manifest = video["manifest"]
        record = inventory_by_key[selection_key]
        plan_path = _repo_relative_file(item["plan"]["path"], root, "cluster plan")
        embeddings_path = _regular_repo_file(
            video["output"] / manifest["embeddings"]["path"],
            root,
            "cluster embeddings",
        )
        expected = {
            "selectionKey": selection_key,
            "planSha256": video["plan"]["planSha256"],
            "planFileSha256": cluster_review.file_sha256(plan_path),
            "manifestSha256": video["manifestSha256"],
            "embeddingsSha256": cluster_review.file_sha256(embeddings_path),
            "clusterCount": len(manifest["clusters"]),
            "localBelowThresholdSegmentCount": sum(
                len(
                    cluster_by_key[f"{selection_key}:{cluster['clusterId']}"][
                        "localBelowThresholdSegmentIds"
                    ]
                )
                for cluster in manifest["clusters"]
            ),
            "unclusteredSegmentCount": manifest["unclusteredSegmentCount"],
            "unclusteredSegmentIds": [
                segment["segmentId"]
                for segment in manifest["segments"]
                if segment["clusterId"] is None
            ],
        }
        if record != expected:
            raise ActorBankReviewError(
                f"voice-bank evidence binding changed for {selection_key}"
            )
        fingerprints.extend(
            (
                _fingerprint(plan_path, root, "cluster plan"),
                _fingerprint(video["manifestPath"], root, "cluster manifest"),
                _fingerprint(embeddings_path, root, "cluster embeddings"),
                _fingerprint(video["captionPath"], root, "pinned captions"),
            )
        )
        local_clusters = _manifest_cluster_map(video)
        for cluster in artifact["clusters"]:
            if cluster["selectionKey"] != selection_key:
                continue
            manifest_cluster = local_clusters.get(cluster["clusterId"])
            if manifest_cluster is None:
                raise ActorBankReviewError(
                    f"missing verified local cluster for {cluster['clusterKey']}"
                )
            if cluster["sourceBindings"] != {
                "planSha256": expected["planSha256"],
                "planFileSha256": expected["planFileSha256"],
                "manifestSha256": expected["manifestSha256"],
                "embeddingsSha256": expected["embeddingsSha256"],
            }:
                raise ActorBankReviewError(
                    f"source binding changed for {cluster['clusterKey']}"
                )
            for clip in [
                *manifest_cluster["representatives"],
                *manifest_cluster["auditRepresentatives"],
            ]:
                fingerprints.append(_verified_clip_fingerprint(video, clip, root))

    deduplicated = {(record["kind"], record["path"]): record for record in fingerprints}
    return (
        video_by_key,
        cluster_by_key,
        [deduplicated[key] for key in sorted(deduplicated)],
    )


def load_verified_inputs(
    voice_bank_path: Path = DEFAULT_VOICE_BANK,
    queue_path: Path = DEFAULT_QUEUE,
    characters_path: Path = DEFAULT_CHARACTERS,
    *,
    repo_root: Path,
    expected_voice_bank_sha256: str = PINNED_VOICE_BANK_SHA256,
    rebuild: bool = True,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    artifact, voice_bank_file = _read_voice_bank(
        voice_bank_path, root, expected_voice_bank_sha256
    )
    if rebuild:
        try:
            rebuilt = voice_bank.build_voice_bank(
                queue_path,
                repo_root=root,
            )
        except voice_bank.VoiceBankError as error:
            raise ActorBankReviewError(
                f"cannot independently rebuild pinned voice bank: {error}"
            ) from error
        if rebuilt != artifact:
            raise ActorBankReviewError(
                "saved voice bank differs from an independent exact rebuild"
            )
    try:
        corpus = cluster_review.inspect_review_corpus(
            queue_path, characters_path, repo_root=root
        )
    except cluster_review.ClusterReviewError as error:
        raise ActorBankReviewError(
            f"cannot verify listening corpus: {error}"
        ) from error
    video_by_key, cluster_by_key, fingerprints = _bind_evidence(artifact, corpus, root)
    fingerprints.append(_fingerprint(voice_bank_file, root, "pinned voice bank"))
    return {
        "repoRoot": root,
        "voiceBank": artifact,
        "voiceBankPath": voice_bank_file,
        "corpus": corpus,
        "videos": video_by_key,
        "clusters": cluster_by_key,
        "fingerprints": sorted(
            fingerprints, key=lambda record: (record["kind"], record["path"])
        ),
    }


def _metric(value: Any) -> str:
    if value is None:
        return "not applicable"
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
    ):
        raise ActorBankReviewError("verified acoustic metric became non-numeric")
    return str(value) if isinstance(value, int) else f"{value:.6f}"


def _seconds(value: float) -> str:
    milliseconds = round(value * 1_000)
    seconds, milliseconds = divmod(milliseconds, 1_000)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"
    return f"{minutes}:{seconds:02d}.{milliseconds:03d}"


def _script_json(value: Any) -> str:
    return cluster_review._script_json(value)


def _asset_name(stem: str, suffix: str, payload: bytes) -> str:
    return f"assets/{stem}.{_sha256_bytes(payload)}.{suffix}"


CSS = (
    r"""
:root {
  color-scheme: light;
  --ink: #20201d;
  --muted: #67655f;
  --paper: #f6f1e7;
  --panel: #fffdf8;
  --line: #d9cebd;
  --accent: #7a321e;
  --accent-soft: #f1dfd6;
  --warning: #fff1c9;
  --warning-line: #b77b18;
  --ok: #2c6a54;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  color: var(--ink);
  background: var(--paper);
  line-height: 1.55;
}
a { color: var(--accent); text-underline-offset: .16em; }
code { overflow-wrap: anywhere; }
.shell { width: min(1180px, calc(100% - 2rem)); margin: 0 auto 5rem; }
.hero { padding: 3rem 0 1.25rem; border-bottom: 1px solid var(--line); }
.hero h1 { margin: .1rem 0 .35rem; font: 700 clamp(2rem, 6vw, 4.4rem)/1.02 Georgia, serif; }
.eyebrow { margin: 0; color: var(--accent); font-size: .75rem; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.lede { max-width: 75ch; color: var(--muted); font-size: 1.08rem; }
.warning {
  margin: 1.25rem 0;
  padding: 1rem 1.1rem;
  background: var(--warning);
  border: 1px solid var(--warning-line);
  border-left-width: .38rem;
  border-radius: .35rem;
}
.warning strong { display: block; margin-bottom: .2rem; }
.summary, .diagnostic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: .75rem;
  margin: 1rem 0 1.5rem;
}
.stat, .diagnostic-grid > div {
  padding: .85rem;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: .45rem;
}
.stat strong { display: block; font: 700 1.65rem/1 Georgia, serif; }
.stat span, dt { color: var(--muted); font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; }
dd { margin: .15rem 0 0; font-variant-numeric: tabular-nums; }
.toolbar {
  position: sticky;
  z-index: 3;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .65rem;
  margin: 1rem 0 1.5rem;
  padding: .8rem;
  background: rgba(255, 253, 248, .96);
  border: 1px solid var(--line);
  border-radius: .45rem;
  box-shadow: 0 .3rem 1.2rem rgba(55, 42, 25, .08);
}
.progress { margin-right: auto; font-weight: 700; }
button, .button {
  min-height: 2.45rem;
  padding: .45rem .75rem;
  color: white;
  background: var(--accent);
  border: 1px solid var(--accent);
  border-radius: .3rem;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}
button.secondary { color: var(--accent); background: transparent; }
button:focus-visible, a:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 3px solid #1e6faf;
  outline-offset: 2px;
}
.status { min-height: 1.5em; color: var(--ok); }
.family-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(285px, 1fr)); gap: 1rem; }
.family-card, .cluster-card, .evidence-section, .export-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: .55rem;
}
.family-card { padding: 1rem; }
.family-card h2 { margin: .1rem 0; font: 700 1.35rem Georgia, serif; }
.family-card p { margin: .25rem 0; }
.family-card .tag { display: inline-block; padding: .12rem .4rem; background: var(--accent-soft); border-radius: 2rem; font-size: .8rem; }
.cluster-card { margin: 1.5rem 0; overflow: clip; }
.cluster-header { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .75rem; padding: 1rem; background: #eee5d7; }
.cluster-header h2 { margin: .1rem 0; font: 700 1.55rem Georgia, serif; }
.cluster-body { padding: 1rem; }
.evidence-section { margin: 1rem 0; padding: 1rem; overflow: auto; }
.evidence-section h2, .evidence-section h3 { margin-top: 0; font-family: Georgia, serif; }
table { width: 100%; border-collapse: collapse; font-size: .88rem; }
th, td { padding: .48rem .55rem; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; }
th { color: var(--muted); font-size: .73rem; letter-spacing: .06em; text-transform: uppercase; }
.clips { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: .75rem; }
.clip { padding: .75rem; border: 1px solid var(--line); border-radius: .4rem; }
.clip h4 { margin: 0 0 .4rem; }
.clip audio { width: 100%; }
.clip p { margin: .4rem 0; }
.caption { color: var(--muted); }
.caption span { color: var(--ink); font-weight: 700; }
.review-form { display: grid; grid-template-columns: minmax(220px, 2fr) minmax(130px, 1fr); gap: .75rem; margin-top: 1rem; padding: 1rem; background: #f1ebe1; border-radius: .4rem; }
.review-form .note-field { grid-column: 1 / -1; }
label { display: block; margin-bottom: .25rem; font-weight: 700; }
select, textarea { width: 100%; padding: .55rem; border: 1px solid #9e9486; border-radius: .25rem; background: white; color: var(--ink); font: inherit; }
textarea { min-height: 6rem; resize: vertical; }
select:disabled { opacity: .55; }
.small { color: var(--muted); font-size: .86rem; }
.pair-empty { padding: .75rem; color: var(--muted); background: #f2eee7; }
.export-panel { margin-top: 1rem; padding: 1rem; }
.export-preview { max-height: 28rem; overflow: auto; padding: .75rem; background: #252522; color: #f7f2e7; font-size: .78rem; white-space: pre-wrap; }
.provenance { color: var(--muted); font-size: .82rem; }
.back { display: inline-block; margin-top: 1rem; }
@media (max-width: 640px) {
  .shell { width: min(100% - 1rem, 1180px); }
  .hero { padding-top: 1.5rem; }
  .review-form { grid-template-columns: 1fr; }
  .review-form .note-field { grid-column: 1; }
  .toolbar { position: static; }
}
""".strip()
    + "\n"
)


JAVASCRIPT = (
    r"""
(() => {
  "use strict";
  const node = document.getElementById("review-config");
  if (!node) return;
  const config = JSON.parse(node.textContent);
  const byKey = new Map(config.decisionRegistry.map((row) => [row.clusterKey, row]));
  let state = {};
  const statusNodes = document.querySelectorAll("[data-review-status]");

  const say = (message, isError = false) => {
    statusNodes.forEach((target) => {
      target.textContent = message;
      target.style.color = isError ? "#9d241b" : "";
    });
  };
  const cleanNote = (value) => value.normalize("NFC").trim().replace(/\s+/gu, " ");
  const allowedChoice = (record, choice) =>
    choice === "" || choice === config.unassignedChoice || record.allowedCharacterIds.includes(choice);
  const cleanEntry = (record, candidate) => {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const choice = typeof source.choice === "string" && allowedChoice(record, source.choice)
      ? source.choice : "";
    const confidence = record.allowedCharacterIds.includes(choice) && config.confidenceLevels.includes(source.confidence)
      ? source.confidence : "";
    const note = typeof source.note === "string" ? source.note.slice(0, config.maxNoteCharacters) : "";
    return { choice, confidence, note };
  };
  try {
    const saved = JSON.parse(localStorage.getItem(config.storageKey) || "{}");
    for (const record of config.decisionRegistry) state[record.clusterKey] = cleanEntry(record, saved[record.clusterKey]);
  } catch (_error) {
    for (const record of config.decisionRegistry) state[record.clusterKey] = cleanEntry(record, {});
    say("Browser-local draft could not be read; starting with a clean in-memory draft.", true);
  }

  const save = () => {
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(state));
      return true;
    } catch (_error) {
      say("Browser-local draft could not be saved. Export before leaving this page.", true);
      return false;
    }
  };
  const decisionFor = (record) => {
    const entry = cleanEntry(record, state[record.clusterKey]);
    const note = cleanNote(entry.note);
    if (entry.choice === "") {
      return { ...record.exportFields, disposition: "undecided", provisionalCharacterId: null, confidence: null, note: note || null };
    }
    if (entry.choice === config.unassignedChoice) {
      return { ...record.exportFields, disposition: "unassigned", provisionalCharacterId: null, confidence: null, note: note || null };
    }
    return { ...record.exportFields, disposition: "provisional-character", provisionalCharacterId: entry.choice, confidence: entry.confidence || null, note: note || null };
  };
  const buildExport = () => {
    const decisions = config.decisionRegistry.map(decisionFor).sort((a, b) => a.clusterKey.localeCompare(b.clusterKey));
    const reviewedClusterCount = decisions.filter((row) => row.disposition !== "undecided").length;
    return {
      schemaVersion: 1,
      status: config.decisionStatus,
      reviewStatus: reviewedClusterCount === decisions.length ? "complete" : "draft",
      provisionalOnly: true,
      humanReviewRequired: true,
      writesCastRegistry: false,
      writesSpeakerAttributions: false,
      writesCanonicalIdentity: false,
      familyIdentityInference: false,
      voiceBankSha256: config.voiceBankSha256,
      charactersSha256: config.charactersSha256,
      decisionRegistrySha256: config.decisionRegistrySha256,
      reviewedClusterCount,
      clusterCount: decisions.length,
      decisions,
    };
  };
  const renderProgress = () => {
    const packet = buildExport();
    document.querySelectorAll("[data-review-progress]").forEach((target) => {
      target.textContent = `${packet.reviewedClusterCount} of ${packet.clusterCount} clusters explicitly reviewed`;
    });
  };
  const bindControl = (element, field) => {
    const key = element.dataset.clusterKey;
    const record = byKey.get(key);
    if (!record) return;
    element.value = state[key][field];
    const update = () => {
      const entry = state[key];
      entry[field] = element.value.slice(0, field === "note" ? config.maxNoteCharacters : 200);
      state[key] = cleanEntry(record, entry);
      const confidence = document.querySelector(`[data-confidence][data-cluster-key="${CSS.escape(key)}"]`);
      if (confidence) {
        confidence.disabled = !record.allowedCharacterIds.includes(state[key].choice);
        if (confidence.disabled) confidence.value = "";
      }
      save();
      renderProgress();
      say("Browser-local provisional draft saved.");
    };
    element.addEventListener(field === "note" ? "input" : "change", update);
  };
  document.querySelectorAll("[data-choice]").forEach((element) => bindControl(element, "choice"));
  document.querySelectorAll("[data-confidence]").forEach((element) => {
    bindControl(element, "confidence");
    const record = byKey.get(element.dataset.clusterKey);
    element.disabled = !record.allowedCharacterIds.includes(state[element.dataset.clusterKey].choice);
  });
  document.querySelectorAll("[data-note]").forEach((element) => bindControl(element, "note"));

  const preview = (packet) => {
    const text = JSON.stringify(packet, null, 2) + "\n";
    document.querySelectorAll("[data-export-preview]").forEach((target) => target.textContent = text);
    return text;
  };
  document.querySelectorAll("[data-preview-export]").forEach((button) => button.addEventListener("click", () => {
    preview(buildExport());
    say("Normalized provisional export preview refreshed.");
  }));
  document.querySelectorAll("[data-copy-export]").forEach((button) => button.addEventListener("click", async () => {
    const text = preview(buildExport());
    try {
      await navigator.clipboard.writeText(text);
      say("Normalized provisional export copied.");
    } catch (_error) {
      say("Clipboard access failed; copy the visible export preview.", true);
    }
  }));
  document.querySelectorAll("[data-download-export]").forEach((button) => button.addEventListener("click", () => {
    const text = preview(buildExport());
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    link.download = `actor-bank-provisional-${config.voiceBankSha256.slice(0, 12)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
    say("Normalized provisional export downloaded.");
  }));
  document.querySelectorAll("audio").forEach((audio) => audio.addEventListener("play", () => {
    document.querySelectorAll("audio").forEach((other) => { if (other !== audio) other.pause(); });
  }));
  renderProgress();
})();
""".strip()
    + "\n"
)


def _decision_registry(
    artifact: dict[str, Any],
    videos: dict[str, dict[str, Any]],
) -> tuple[list[dict[str, Any]], str]:
    rows: list[dict[str, Any]] = []
    for cluster in artifact["clusters"]:
        video = videos[cluster["selectionKey"]]
        allowed = [
            record["characterId"] for record in _voice_owner_roster(video["roster"])
        ]
        rows.append(
            {
                "clusterKey": cluster["clusterKey"],
                "allowedCharacterIds": allowed,
                "exportFields": {
                    "clusterKey": cluster["clusterKey"],
                    "familyId": cluster["familyId"],
                    "dialogue": cluster["dialogue"],
                    "videoId": cluster["videoId"],
                },
            }
        )
    rows.sort(key=lambda record: record["clusterKey"])
    return rows, _sha256_bytes(_canonical_json(rows))


def _voice_owner_roster(
    roster: Any,
) -> list[dict[str, Any]]:
    if not isinstance(roster, list):
        raise ActorBankReviewError("canonical dialogue roster is malformed")
    selectable: list[dict[str, Any]] = []
    seen: set[str] = set()
    for record in roster:
        character_id = record.get("characterId") if isinstance(record, dict) else None
        performance_role = (
            record.get("performanceRole") if isinstance(record, dict) else None
        )
        if (
            not isinstance(character_id, str)
            or not character_id
            or character_id in seen
            or performance_role not in PERFORMANCE_ROLES
        ):
            raise ActorBankReviewError(
                "canonical dialogue roster has invalid performance-role evidence"
            )
        seen.add(character_id)
        if performance_role == "voice-owner":
            selectable.append(record)
    return selectable


def _config(
    artifact: dict[str, Any],
    characters_sha256: str,
    registry: list[dict[str, Any]],
    registry_sha256: str,
) -> dict[str, Any]:
    return {
        "decisionStatus": DECISION_STATUS,
        "voiceBankSha256": artifact["voiceBankSha256"],
        "charactersSha256": characters_sha256,
        "decisionRegistrySha256": registry_sha256,
        "storageKey": (
            "plato-cross-video-actor-bank-v1:"
            f"{artifact['voiceBankSha256']}:{characters_sha256}:{registry_sha256}"
        ),
        "unassignedChoice": UNASSIGNED_CHOICE,
        "confidenceLevels": list(CONFIDENCE_LEVELS),
        "maxNoteCharacters": MAX_NOTE_CHARACTERS,
        "decisionRegistry": registry,
    }


def _export_panel() -> str:
    return """
    <section class="export-panel" aria-labelledby="export-title">
      <h2 id="export-title">Normalized provisional export</h2>
      <p class="small">This export is a browser-local review draft. It cannot update cast, speaker-attribution, or canonical-identity data.</p>
      <p><button type="button" data-preview-export>Preview JSON</button>
        <button type="button" class="secondary" data-copy-export>Copy JSON</button>
        <button type="button" class="secondary" data-download-export>Download JSON</button></p>
      <pre class="export-preview" data-export-preview aria-live="polite">Select “Preview JSON” to inspect all normalized cluster decisions.</pre>
    </section>"""


def _toolbar() -> str:
    return """
    <div class="toolbar">
      <span class="progress" data-review-progress>Loading provisional review state…</span>
      <button type="button" data-preview-export>Preview export</button>
      <button type="button" class="secondary" data-copy-export>Copy export</button>
      <span class="status" data-review-status aria-live="polite"></span>
    </div>"""


def _clip_html(
    clip: dict[str, Any],
    *,
    video: dict[str, Any],
    page_path: Path,
) -> str:
    clip_path = video["output"] / clip["path"]
    source = cluster_review._relative_url(clip_path, page_path.parent)
    excerpt = cluster_review._caption_excerpt(
        video["captions"], clip["startSeconds"], clip["endSeconds"]
    )
    label = (
        "Nearest-centroid representative"
        if clip["selection"] == "nearest-centroid"
        else "Farthest-centroid audit clip"
    )
    return f"""
        <article class="clip" data-clip-sha256="{clip["sha256"]}">
          <h4>{html.escape(label)} {clip["rank"]}</h4>
          <audio controls preload="metadata" src="{html.escape(source, quote=True)}"></audio>
          <p><strong>{html.escape(clip["segmentId"])}</strong> · {_seconds(clip["startSeconds"])}–{_seconds(clip["endSeconds"])}</p>
          <p class="caption"><span>Pinned caption context:</span> {html.escape(excerpt)}</p>
          <details><summary>Verified clip SHA-256</summary><code>{clip["sha256"]}</code></details>
        </article>"""


def _roster_options(roster: list[dict[str, Any]]) -> str:
    options = [
        '<option value="">Undecided — no provisional choice</option>',
        f'<option value="{UNASSIGNED_CHOICE}">Unassigned / unknown — preserve uncertainty</option>',
    ]
    for character in roster:
        flags = ", ".join(character["roleFlags"])
        options.append(
            '<option value="{}">{} ({}) — {}</option>'.format(
                html.escape(character["characterId"], quote=True),
                html.escape(character["displayName"]),
                html.escape(character["characterId"]),
                html.escape(flags),
            )
        )
    return "".join(options)


def _confidence_options() -> str:
    return "".join(
        [
            '<option value="">Not recorded</option>',
            *(
                f'<option value="{value}">{value.title()}</option>'
                for value in CONFIDENCE_LEVELS
            ),
        ]
    )


def _cluster_html(
    cluster: dict[str, Any],
    *,
    video: dict[str, Any],
    page_path: Path,
) -> tuple[str, int]:
    manifest_cluster = _manifest_cluster_map(video)[cluster["clusterId"]]
    selection = video["item"]["selection"]
    title = selection["video"]["title"]
    local = cluster["localClusterDiagnostics"]
    centroid = local["centroidCosine"]
    nearest_external = cluster["nearestExternalCluster"]
    ranking_rows = "".join(
        "<tr><td>{rank}</td><td><code>{key}</code></td><td>{cosine}</td>"
        "<td>{delta}</td><td>{threshold}</td><td>{family}</td></tr>".format(
            rank=row["rank"],
            key=html.escape(row["clusterKey"]),
            cosine=_metric(row["cosine"]),
            delta=_metric(row["deltaFromTop"]),
            threshold="yes" if row["meetsFamilyThreshold"] else "no",
            family="same family" if row["sameFamily"] else html.escape(row["familyId"]),
        )
        for row in cluster["nearestCrossVideo"]
    )
    clips = [
        *manifest_cluster["representatives"],
        *manifest_cluster["auditRepresentatives"],
    ]
    clip_rows = "".join(
        _clip_html(clip, video=video, page_path=page_path) for clip in clips
    )
    options = _roster_options(_voice_owner_roster(video["roster"]))
    confidence = _confidence_options()
    cluster_key = html.escape(cluster["clusterKey"], quote=True)
    control_id = _sha256_bytes(cluster["clusterKey"].encode("utf-8"))[:12]
    source_part = (
        f"part {selection['partIndex']} of {selection['partCount']}"
        if selection["partCount"] > 1
        else "single-video reading"
    )
    card = f"""
    <article class="cluster-card" id="cluster-{control_id}" data-cluster-card="{cluster_key}">
      <header class="cluster-header">
        <div><p class="eyebrow">{html.escape(cluster["dialogue"].replace("-", " ").title())} · {html.escape(source_part)}</p>
          <h2>{html.escape(cluster["clusterId"])}</h2>
          <p><code>{html.escape(cluster["clusterKey"])}</code></p></div>
        <div><strong>{cluster["segmentCount"]} clustered segments</strong><br><span class="small">{html.escape(title)}</span></div>
      </header>
      <div class="cluster-body">
        <dl class="diagnostic-grid">
          <div><dt>Family-centroid cosine</dt><dd>{_metric(cluster["familyCentroidCosine"])}</dd></div>
          <div><dt>Family margin</dt><dd>{_metric(cluster["familyMargin"])}</dd></div>
          <div><dt>Nearest external cosine</dt><dd>{_metric(nearest_external["cosine"])}</dd></div>
          <div><dt>Nearest external cluster</dt><dd><code>{html.escape(nearest_external["clusterKey"])}</code></dd></div>
          <div><dt>Local centroid min / median / max</dt><dd>{_metric(centroid["minimum"])} / {_metric(centroid["median"])} / {_metric(centroid["maximum"])}</dd></div>
          <div><dt>Local below-threshold members</dt><dd>{len(cluster["localBelowThresholdSegmentIds"])}</dd></div>
          <div><dt>Nearest competing local centroid</dt><dd>{_metric(local["nearestCompetingCentroidCosine"])}</dd></div>
          <div><dt>Max cross-cluster member cosine</dt><dd>{_metric(local["crossClusterMemberCosineMaximum"])}</dd></div>
        </dl>
        <section class="evidence-section">
          <h3>Ten nearest cross-video clusters</h3>
          <table><thead><tr><th>Rank</th><th>Cluster</th><th>Cosine</th><th>Δ from top</th><th>≥ 0.92</th><th>Family relation</th></tr></thead>
            <tbody>{ranking_rows}</tbody></table>
        </section>
        <section class="evidence-section">
          <h3>Verified listening clips and caption context</h3>
          <div class="clips">{clip_rows}</div>
        </section>
        <section class="review-form" aria-label="Provisional review for {html.escape(cluster["clusterKey"])}">
          <div><label for="choice-{control_id}">Per-cluster provisional character</label>
            <select id="choice-{control_id}" data-choice data-cluster-key="{cluster_key}">{options}</select>
            <p class="small">Only the canonical {html.escape(cluster["dialogue"])} roster is available. No family-wide choice is permitted.</p></div>
          <div><label for="confidence-{control_id}">Confidence</label>
            <select id="confidence-{control_id}" data-confidence data-cluster-key="{cluster_key}">{confidence}</select></div>
          <div class="note-field"><label for="note-{control_id}">Optional listening note</label>
            <textarea id="note-{control_id}" maxlength="{MAX_NOTE_CHARACTERS}" data-note data-cluster-key="{cluster_key}" placeholder="Record audible evidence, ambiguity, or why this should remain unassigned."></textarea></div>
        </section>
      </div>
    </article>"""
    return card, len(clips)


def _family_evidence(
    family: dict[str, Any], artifact: dict[str, Any]
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    members = set(family["clusterKeys"])
    pairs = [
        record
        for record in artifact["crossVideoPairwiseRanking"]
        if record["leftClusterKey"] in members and record["rightClusterKey"] in members
    ]
    pairs.sort(key=lambda record: (record["leftClusterKey"], record["rightClusterKey"]))
    expected_pair_count = family["memberCount"] * (family["memberCount"] - 1) // 2
    if len(pairs) != expected_pair_count:
        raise ActorBankReviewError(
            f"internal pairwise inventory is incomplete for {family['familyId']}"
        )
    merges = [
        record
        for record in artifact["mergeTrace"]
        if set(record["mergedClusterKeys"]).issubset(members)
    ]
    merges.sort(key=lambda record: record["step"])
    expected_merge_count = max(0, family["memberCount"] - 1)
    if len(merges) != expected_merge_count:
        raise ActorBankReviewError(
            f"complete-link merge trace is incomplete for {family['familyId']}"
        )
    return pairs, merges


def render_family_html(
    family: dict[str, Any],
    artifact: dict[str, Any],
    *,
    videos: dict[str, dict[str, Any]],
    clusters: dict[str, dict[str, Any]],
    page_path: Path,
    css_path: str,
    js_path: str,
    config: dict[str, Any],
) -> tuple[bytes, dict[str, int]]:
    pairs, merges = _family_evidence(family, artifact)
    pair_rows = "".join(
        "<tr><td><code>{}</code></td><td><code>{}</code></td><td>{}</td><td>{}</td></tr>".format(
            html.escape(record["leftClusterKey"]),
            html.escape(record["rightClusterKey"]),
            _metric(record["cosine"]),
            "yes" if record["meetsFamilyThreshold"] else "no",
        )
        for record in pairs
    )
    if not pair_rows:
        pair_rows = '<tr><td colspan="4" class="pair-empty">Not applicable: a singleton has no internal cluster pair.</td></tr>'
    merge_rows = "".join(
        "<tr><td>{}</td><td>{}</td><td>{}</td><td><code>{}</code></td></tr>".format(
            record["step"],
            _metric(record["crossMinimumCosine"]),
            _metric(record["crossMeanCosine"]),
            html.escape(" + ".join(record["mergedClusterKeys"])),
        )
        for record in merges
    )
    if not merge_rows:
        merge_rows = '<tr><td colspan="4" class="pair-empty">Not applicable: no complete-link merge created this singleton.</td></tr>'
    nearest_pair = family["nearestExternalClusterPair"]
    nearest_family = family["nearestExternalFamilyCentroid"]
    cards: list[str] = []
    clip_count = 0
    for cluster_key in family["clusterKeys"]:
        cluster = clusters[cluster_key]
        card, card_clips = _cluster_html(
            cluster,
            video=videos[cluster["selectionKey"]],
            page_path=page_path,
        )
        cards.append(card)
        clip_count += card_clips
    internal = family["internalPairwiseCosine"]
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(family["familyId"])} · acoustic actor-bank review</title>
<link rel="stylesheet" href="../{html.escape(css_path, quote=True)}"><script src="../{html.escape(js_path, quote=True)}" defer></script></head>
<body><main class="shell">
  <a class="back" href="../index.html">← All anonymous families</a>
  <header class="hero"><p class="eyebrow">Cross-video acoustic candidate · human listening required</p>
    <h1>{html.escape(family["familyId"])}</h1>
    <p class="lede">{family["memberCount"]} verified video-local clusters across {family["dialogueCount"]} dialogues. The family is a deterministic acoustic recurrence candidate, not a character, actor, or identity assertion.</p></header>
  <aside class="warning"><strong>Do not assign one identity to this family.</strong>
    Actors may play different roles across videos, and a cluster may still be mixed. Choices below are independently stored per cluster; leaving one undecided or explicitly unassigned is valid.</aside>
  {_toolbar()}
  <section class="summary" aria-label="Family evidence summary">
    <div class="stat"><strong>{family["memberCount"]}</strong><span>member clusters</span></div>
    <div class="stat"><strong>{family["videoCount"]}</strong><span>source videos</span></div>
    <div class="stat"><strong>{family["dialogueCount"]}</strong><span>dialogues</span></div>
    <div class="stat"><strong>{_metric(internal["minimum"])}</strong><span>complete-link floor</span></div>
    <div class="stat"><strong>{_metric(family["completeLinkSeparationMargin"])}</strong><span>separation margin</span></div>
  </section>
  <section class="evidence-section"><h2>Nearest external evidence</h2>
    <dl class="diagnostic-grid">
      <div><dt>Member cluster</dt><dd><code>{html.escape(nearest_pair["memberClusterKey"])}</code></dd></div>
      <div><dt>External cluster</dt><dd><code>{html.escape(nearest_pair["externalClusterKey"])}</code></dd></div>
      <div><dt>External cluster cosine</dt><dd>{_metric(nearest_pair["cosine"])}</dd></div>
      <div><dt>Nearest external family</dt><dd>{html.escape(nearest_family["familyId"])} · {_metric(nearest_family["cosine"])}</dd></div>
      <div><dt>Internal min / median / max</dt><dd>{_metric(internal["minimum"])} / {_metric(internal["median"])} / {_metric(internal["maximum"])}</dd></div>
    </dl>
  </section>
  <section class="evidence-section"><h2>Full internal cross-video pairwise evidence</h2>
    <table><thead><tr><th>Left cluster</th><th>Right cluster</th><th>Cosine</th><th>Meets 0.92</th></tr></thead><tbody>{pair_rows}</tbody></table></section>
  <section class="evidence-section"><h2>Complete-link merge evidence</h2>
    <table><thead><tr><th>Global step</th><th>Cross minimum</th><th>Cross mean</th><th>Merged clusters</th></tr></thead><tbody>{merge_rows}</tbody></table></section>
  <section aria-label="Per-cluster listening and provisional choices">{"".join(cards)}</section>
  {_export_panel()}
  <p class="provenance">Voice-bank semantic SHA-256: <code>{artifact["voiceBankSha256"]}</code></p>
</main><script id="review-config" type="application/json">{_script_json(config)}</script></body></html>"""
    return page.encode("utf-8"), {
        "internalPairCount": len(pairs),
        "mergeStepCount": len(merges),
        "clipCount": clip_count,
    }


def render_index_html(
    artifact: dict[str, Any],
    *,
    family_rows: list[dict[str, Any]],
    css_path: str,
    js_path: str,
    config: dict[str, Any],
    characters_sha256: str,
) -> bytes:
    family_by_id = {family["familyId"]: family for family in artifact["families"]}
    cards: list[str] = []
    for row in family_rows:
        family = family_by_id[row["familyId"]]
        internal = family["internalPairwiseCosine"]
        tag = (
            "recurrent candidate"
            if family["memberCount"] > 1
            else "singleton / unlinked"
        )
        cards.append(
            f"""
      <article class="family-card" data-family-id="{html.escape(family["familyId"], quote=True)}">
        <span class="tag">{tag}</span><h2><a href="{html.escape(row["page"]["path"], quote=True)}">{html.escape(family["familyId"])}</a></h2>
        <p><strong>{family["memberCount"]}</strong> clusters · {family["dialogueCount"]} dialogues · {row["clipCount"]} clips</p>
        <p class="small">Internal floor: {_metric(internal["minimum"])} · separation margin: {_metric(family["completeLinkSeparationMargin"])}</p>
        <p class="small">Nearest external family: {html.escape(family["nearestExternalFamilyCentroid"]["familyId"])} at {_metric(family["nearestExternalFamilyCentroid"]["cosine"])}</p>
      </article>"""
        )
    summary = artifact["summary"]
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cross-video acoustic actor-bank review</title>
<link rel="stylesheet" href="{html.escape(css_path, quote=True)}"><script src="{html.escape(js_path, quote=True)}" defer></script></head>
<body><main class="shell">
  <header class="hero"><p class="eyebrow">Pinned evidence · scratch-only human review</p>
    <h1>Cross-video acoustic actor bank</h1>
    <p class="lede">Listen across the complete verified audiobook corpus, then record per-video-cluster provisional character candidates. This surface groups acoustic recurrence without turning it into identity.</p></header>
  <aside class="warning"><strong>Anonymous family does not mean one actor or one character.</strong>
    Actors may play different roles across videos; clusters may be impure; no choice here updates <code>audio/cast.json</code>, speaker attribution, or canonical identity. Undecided and explicitly unassigned remain distinct.</aside>
  {_toolbar()}
  <section class="summary" aria-label="Pinned actor-bank counts">
    <div class="stat"><strong>{summary["videoCount"]}</strong><span>verified videos</span></div>
    <div class="stat"><strong>{summary["clusterCount"]}</strong><span>anonymous clusters</span></div>
    <div class="stat"><strong>{summary["familyCount"]}</strong><span>anonymous families</span></div>
    <div class="stat"><strong>{summary["recurrentFamilyCount"]}</strong><span>recurrent candidates</span></div>
    <div class="stat"><strong>{summary["singletonFamilyCount"]}</strong><span>singletons</span></div>
  </section>
  <section aria-labelledby="families-title"><h2 id="families-title">All anonymous families</h2>
    <div class="family-list">{"".join(cards)}</div></section>
  {_export_panel()}
  <section class="evidence-section"><h2>Immutable input proof</h2>
    <p>Voice-bank semantic SHA-256: <code>{artifact["voiceBankSha256"]}</code></p>
    <p>Canonical character-catalog SHA-256: <code>{characters_sha256}</code></p>
    <p><a href="review-manifest.json">Machine-readable generated-site manifest</a></p>
  </section>
</main><script id="review-config" type="application/json">{_script_json(config)}</script></body></html>"""
    return page.encode("utf-8")


def _artifact_record(path: str, payload: bytes) -> dict[str, Any]:
    return {"path": path, "bytes": len(payload), "sha256": _sha256_bytes(payload)}


def _install(temporary: Path, destination: Path) -> None:
    try:
        cluster_review._install_directory(temporary, destination)
    except (OSError, cluster_review.ClusterReviewError) as error:
        raise ActorBankReviewError(
            f"cannot install actor-bank review site: {error}"
        ) from error


def build_review_site(
    voice_bank_path: Path = DEFAULT_VOICE_BANK,
    queue_path: Path = DEFAULT_QUEUE,
    characters_path: Path = DEFAULT_CHARACTERS,
    output_root: Path = DEFAULT_OUTPUT_ROOT,
    *,
    repo_root: Path,
    expected_voice_bank_sha256: str = PINNED_VOICE_BANK_SHA256,
    generator_path: Path | None = None,
    rebuild: bool = True,
) -> tuple[dict[str, Any], Path]:
    root = repo_root.resolve(strict=True)
    output_base = _scratch_output_root(output_root, root)
    destination = output_base / expected_voice_bank_sha256
    if destination.exists() and destination.is_symlink():
        raise ActorBankReviewError("content-addressed review destination is a symlink")
    generator = _regular_repo_file(
        generator_path or Path(__file__), root, "actor-bank review generator"
    )
    generator_initial = _fingerprint(generator, root, "actor-bank review generator")
    verified = load_verified_inputs(
        voice_bank_path,
        queue_path,
        characters_path,
        repo_root=root,
        expected_voice_bank_sha256=expected_voice_bank_sha256,
        rebuild=rebuild,
    )
    artifact = verified["voiceBank"]
    corpus = verified["corpus"]
    characters_sha256 = cluster_review.file_sha256(corpus["charactersPath"])
    registry, registry_sha256 = _decision_registry(artifact, verified["videos"])
    config = _config(artifact, characters_sha256, registry, registry_sha256)

    css = CSS.encode("utf-8")
    javascript = JAVASCRIPT.encode("utf-8")
    css_path = _asset_name("review", "css", css)
    js_path = _asset_name("review", "js", javascript)
    payloads: dict[str, bytes] = {css_path: css, js_path: javascript}
    asset_rows = [
        _artifact_record(css_path, css),
        _artifact_record(js_path, javascript),
    ]

    family_rows: list[dict[str, Any]] = []
    for family in artifact["families"]:
        placeholder = destination / "families" / f"{family['familyId']}.html"
        payload, counts = render_family_html(
            family,
            artifact,
            videos=verified["videos"],
            clusters=verified["clusters"],
            page_path=placeholder,
            css_path=css_path,
            js_path=js_path,
            config=config,
        )
        page_sha256 = _sha256_bytes(payload)
        relative = f"families/{family['familyId']}.{page_sha256}.html"
        payloads[relative] = payload
        family_rows.append(
            {
                "familyId": family["familyId"],
                "memberCount": family["memberCount"],
                "dialogueCount": family["dialogueCount"],
                **counts,
                "page": _artifact_record(relative, payload),
            }
        )

    index = render_index_html(
        artifact,
        family_rows=family_rows,
        css_path=css_path,
        js_path=js_path,
        config=config,
        characters_sha256=characters_sha256,
    )
    index_path = f"index.{_sha256_bytes(index)}.html"
    payloads[index_path] = index
    index_record = _artifact_record(index_path, index)
    launcher = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url={index_path}">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Open actor-bank review</title>
<link rel="canonical" href="{index_path}"></head><body><p><a href="{index_path}">Open the content-addressed actor-bank review</a>.</p></body></html>""".encode(
        "utf-8"
    )
    payloads["index.html"] = launcher
    launcher_record = _artifact_record("index.html", launcher)
    fingerprints = [*verified["fingerprints"], generator_initial]
    deduplicated_fingerprints = {
        (record["kind"], record["path"]): record for record in fingerprints
    }
    fingerprints = [
        deduplicated_fingerprints[key] for key in sorted(deduplicated_fingerprints)
    ]
    summary = {
        **artifact["summary"],
        "representativeClipCount": sum(row["clipCount"] for row in family_rows),
        "reviewPageCount": len(family_rows),
        "decisionCount": len(registry),
    }
    if (
        summary["reviewPageCount"] != summary["familyCount"]
        or summary["decisionCount"] != summary["clusterCount"]
    ):
        raise ActorBankReviewError(
            "generated review counts differ from voice-bank proof"
        )
    manifest: dict[str, Any] = {
        "schemaVersion": 1,
        "status": STATUS,
        "humanReviewRequired": True,
        "provisionalOnly": True,
        "writesCastRegistry": False,
        "writesSpeakerAttributions": False,
        "writesCanonicalIdentity": False,
        "familyIdentityInference": False,
        "inputs": {
            "voiceBank": {
                "path": verified["voiceBankPath"].relative_to(root).as_posix(),
                "semanticSha256": artifact["voiceBankSha256"],
                "fileSha256": cluster_review.file_sha256(verified["voiceBankPath"]),
            },
            "queue": {
                "path": corpus["queuePath"].relative_to(root).as_posix(),
                "payloadSha256": corpus["queue"]["queueSha256"],
                "fileSha256": cluster_review.file_sha256(corpus["queuePath"]),
            },
            "characters": {
                "path": corpus["charactersPath"].relative_to(root).as_posix(),
                "sha256": characters_sha256,
            },
            "generator": {
                "path": generator.relative_to(root).as_posix(),
                "sha256": generator_initial["sha256"],
            },
            "verifiedFileInventory": fingerprints,
        },
        "decisionExport": {
            "status": DECISION_STATUS,
            "decisionRegistrySha256": registry_sha256,
            "storageKey": config["storageKey"],
            "clusterCount": len(registry),
            "allowedConfidence": list(CONFIDENCE_LEVELS),
            "explicitUnassignedChoice": UNASSIGNED_CHOICE,
        },
        "summary": summary,
        "assets": asset_rows,
        "index": index_record,
        "launcher": launcher_record,
        "families": family_rows,
    }
    expected_inventory = sorted([*payloads, "review-manifest.json"])
    manifest["inventory"] = expected_inventory
    manifest["siteSha256"] = _sha256_bytes(_canonical_json(manifest))
    manifest_payload = _json_bytes(manifest)

    _reverify_fingerprints(fingerprints, root)
    if (
        _fingerprint(generator, root, "actor-bank review generator")
        != generator_initial
    ):
        raise ActorBankReviewError("actor-bank review generator changed while running")

    output_base.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(
            prefix=f".{expected_voice_bank_sha256}.build-", dir=output_base
        )
    )
    try:
        for relative, payload in sorted(payloads.items()):
            _atomic_bytes(temporary / relative, payload)
        _atomic_bytes(temporary / "review-manifest.json", manifest_payload)
        actual_inventory = sorted(
            path.relative_to(temporary).as_posix()
            for path in temporary.rglob("*")
            if path.is_file()
        )
        if actual_inventory != expected_inventory:
            raise ActorBankReviewError("generated actor-bank inventory is not exact")
        for relative, payload in payloads.items():
            path = temporary / relative
            if path.stat().st_size != len(payload) or cluster_review.file_sha256(
                path
            ) != _sha256_bytes(payload):
                raise ActorBankReviewError(
                    f"generated content hash verification failed: {relative}"
                )
        _reverify_fingerprints(fingerprints, root)
        _install(temporary, destination)
    except Exception:
        if temporary.exists():
            shutil.rmtree(temporary)
        raise
    return manifest, destination


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Build a content-addressed scratch-only human review site from the "
            "pinned anonymous cross-video acoustic bank."
        )
    )
    parser.add_argument("--voice-bank", type=Path, default=DEFAULT_VOICE_BANK)
    parser.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    return parser


def main() -> int:
    parser = _parser()
    arguments = parser.parse_args()
    try:
        manifest, output = build_review_site(
            arguments.voice_bank,
            arguments.queue,
            arguments.characters,
            arguments.output_root,
            repo_root=arguments.repo_root,
            expected_voice_bank_sha256=PINNED_VOICE_BANK_SHA256,
        )
    except ActorBankReviewError as error:
        parser.error(str(error))
    print(
        json.dumps(
            {
                "output": output.relative_to(arguments.repo_root.resolve()).as_posix(),
                "siteSha256": manifest["siteSha256"],
                "summary": manifest["summary"],
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
