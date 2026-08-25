#!/usr/bin/env python3
"""Plan anonymous Dots speaker clustering across the pinned audiobook corpus.

The frozen Crito implementation remains the acoustic core. This module never
changes its bytes: every v2 plan pins and transfers the exact v1 core hash.
Corpus planning is the default and never downloads media or launches GPU work.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import importlib.util
import json
import math
import os
import re
import shlex
import shutil
import sys
import tempfile
from dataclasses import asdict, dataclass
from pathlib import Path, PurePosixPath
from typing import Any, Sequence


FROZEN_CORE_SHA256 = "fbc00c2cf44557fdae5225a1dc2f0a8ae7be34eea63459abd2c0a3cb67df75d6"
_BOOTSTRAP_CORE_PATH = (
    Path(__file__).resolve().with_name("cluster_audiobook_speakers.py")
)


def _independent_sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _load_frozen_core() -> Any:
    actual = _independent_sha256_file(_BOOTSTRAP_CORE_PATH)
    if actual != FROZEN_CORE_SHA256:
        raise RuntimeError(
            f"refusing to import changed v1 core: expected {FROZEN_CORE_SHA256}, got {actual}"
        )
    module_name = "_plato_frozen_cluster_audiobook_speakers_v1"
    spec = importlib.util.spec_from_file_location(module_name, _BOOTSTRAP_CORE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load the frozen v1 clustering core")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    except Exception:
        sys.modules.pop(module_name, None)
        raise
    return module


core = _load_frozen_core()


SCHEMA_VERSION = 1
QUEUE_STATUS = "corpus-speaker-cluster-queue-v2"
PLAN_STATUS = "anonymous-speaker-cluster-plan-v2"
PROOF_STATUS = "anonymous-speaker-cluster-proof-v2"
REGISTRY = Path("audio/reference-sources.json")
SOURCE_ROOT = Path("scratch/audio-references/source-cache")
CAPTION_ROOT = Path("scratch/audio-references/caption-cache")
ARTIFACT_ROOT = Path("scratch/audio-speaker-cluster-v2")
PLAN_ROOT = ARTIFACT_ROOT / "plans"
QUEUE_PATH = ARTIFACT_ROOT / "queue.json"
OUTPUT_ROOT = Path("scratch/audio-speaker-clusters-v2")
SCRIPT_PATH = Path("scripts/audio/cluster_audiobook_speakers_v2.py")
CORE_PATH = Path("scripts/audio/cluster_audiobook_speakers.py")
REMOTE_ROOT = core.REMOTE_ROOT
REMOTE_PYTHON = core.REMOTE_PYTHON
REMOTE_CACHE = core.REMOTE_CACHE
MAX_REGISTRY_BYTES = 1024 * 1024
MAX_CAPTION_BYTES = 16 * 1024 * 1024
MIN_SOURCE_BYTE_CEILING = 64 * 1024 * 1024
MAX_SOURCE_BYTE_CEILING = 1024 * 1024 * 1024
SOURCE_BYTES_PER_SECOND = 32 * 1024
SOURCE_FIXED_OVERHEAD_BYTES = 16 * 1024 * 1024
SOURCE_DURATION_TOLERANCE_SECONDS = 5.0
CAPTION_TIMELINE_ALLOWANCE_SECONDS = 15.0
MAX_SEGMENTS = core.MAX_SEGMENTS
EXPECTED_DIALOGUE_COUNT = 27
EXPECTED_VIDEO_COUNT = 29
EXPECTED_TOTAL_DURATION_SECONDS = 247_213
_SAFE_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
_VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
_SHA256 = re.compile(r"^[0-9a-f]{64}$")
_SEGMENT_ID = re.compile(r"^segment-[0-9]{4}$")
_PLAN_OPERATIONAL_FIELDS = frozenset(
    {
        "planSha256",
        "planArtifact",
        "gpuTransferCommand",
        "gpuExecuteCommand",
        "gpuFetchCommand",
    }
)
IDENTITY_POLICY = {
    "clusterLabels": "anonymous-only",
    "captionTextPersisted": False,
    "characterMappingAllowed": False,
    "castRegistryWritesAllowed": False,
    "humanListeningRequired": True,
}
SEGMENTATION_POLICY = {
    "boundaryEvidence": "silence-or-caption-timing-gap",
    "singleSpeakerGuaranteed": False,
    "humanAuditRequired": True,
}
EMBEDDING = {
    "modelRepository": core.MODEL_REPOSITORY,
    "modelRevision": core.MODEL_REVISION,
    "dotsSourceCommit": core.DOTS_SOURCE_COMMIT,
    "encoder": "CAM++ speaker x-vector",
    "runtimePrecision": "bfloat16",
    "embeddingDtype": "float32",
    "normalized": True,
    "determinism": core.EMBEDDING_DETERMINISM,
}


class CorpusClusterError(ValueError):
    """Raised when a corpus clustering plan is unsafe or irreproducible."""


@dataclass(frozen=True)
class VideoSelection:
    dialogue: str
    part_index: int
    part_count: int
    video_id: str
    title: str
    duration_seconds: int
    url: str

    @property
    def key(self) -> str:
        return f"{self.dialogue}:{self.video_id}"


def canonical_json(value: Any) -> bytes:
    return core.canonical_json(value)


def sha256_file(path: Path) -> str:
    return core.sha256_file(path)


def sha256_bytes(value: bytes) -> str:
    return core.sha256_bytes(value)


def atomic_json(path: Path, value: Any) -> None:
    core.atomic_json(path, value)


def _expect_keys(value: Any, expected: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != expected:
        raise CorpusClusterError(f"{label} has an invalid shape")
    return value


def _sha(value: Any, label: str) -> str:
    if not isinstance(value, str) or _SHA256.fullmatch(value) is None:
        raise CorpusClusterError(f"{label} must be a lowercase SHA-256")
    return value


def _number(value: Any, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise CorpusClusterError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise CorpusClusterError(f"{label} must be finite")
    return result


def _absolute(path: Path) -> Path:
    return path if path.is_absolute() else Path.cwd() / path


def _require_confined_file(path: Path, *, expected: Path, label: str) -> int:
    if path != expected:
        raise CorpusClusterError(f"{label} must use the exact derived path {expected}")
    absolute = _absolute(path)
    if not absolute.is_file():
        raise CorpusClusterError(f"{label} is missing: {path}")
    if absolute.is_symlink() or absolute.resolve() != absolute.absolute():
        raise CorpusClusterError(f"{label} may not traverse a symlink")
    return absolute.stat().st_size


def _require_confined_output(path: Path, *, expected: Path, label: str) -> None:
    if path != expected:
        raise CorpusClusterError(f"{label} must use the exact derived path {expected}")
    absolute = _absolute(path)
    if absolute.resolve(strict=False) != absolute.absolute():
        raise CorpusClusterError(f"{label} may not escape through a symlinked parent")
    for candidate in (absolute, *absolute.parents):
        if candidate.exists() and candidate.is_symlink():
            raise CorpusClusterError(f"{label} may not contain symlinks")
        if candidate == Path(candidate.anchor):
            break


def _bounded_hash(path: Path, *, maximum_bytes: int, label: str) -> tuple[str, int]:
    size = _absolute(path).stat().st_size
    if not 0 < size <= maximum_bytes:
        raise CorpusClusterError(
            f"{label} size {size} is outside the 1-{maximum_bytes} byte bound"
        )
    return sha256_file(path), size


def verify_frozen_core() -> str:
    actual = _independent_sha256_file(CORE_PATH)
    if actual != FROZEN_CORE_SHA256:
        raise CorpusClusterError(
            f"frozen v1 core changed: expected {FROZEN_CORE_SHA256}, got {actual}"
        )
    return actual


def source_byte_ceiling(duration_seconds: int) -> int:
    if isinstance(duration_seconds, bool) or not isinstance(duration_seconds, int):
        raise CorpusClusterError("source duration must be an integer")
    if duration_seconds <= 0:
        raise CorpusClusterError("source duration must be positive")
    scaled = SOURCE_FIXED_OVERHEAD_BYTES + duration_seconds * SOURCE_BYTES_PER_SECOND
    return min(MAX_SOURCE_BYTE_CEILING, max(MIN_SOURCE_BYTE_CEILING, scaled))


def source_path(selection: VideoSelection) -> Path:
    return SOURCE_ROOT / f"{selection.video_id}.media"


def caption_path(selection: VideoSelection) -> Path:
    return CAPTION_ROOT / f"{selection.video_id}.en-orig.json3"


def output_path(selection: VideoSelection) -> Path:
    return (
        OUTPUT_ROOT
        / selection.dialogue
        / f"{selection.part_index:02d}-{selection.video_id}"
    )


def plan_directory(selection: VideoSelection) -> Path:
    return (
        PLAN_ROOT
        / selection.dialogue
        / f"{selection.part_index:02d}-{selection.video_id}"
    )


def _registry_payload() -> tuple[dict[str, Any], str, int]:
    size = _require_confined_file(REGISTRY, expected=REGISTRY, label="source registry")
    if size > MAX_REGISTRY_BYTES:
        raise CorpusClusterError("source registry exceeds its byte bound")
    digest = sha256_file(REGISTRY)
    try:
        payload = json.loads(REGISTRY.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusClusterError(f"cannot read source registry: {error}") from error
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 2
        or payload.get("status") != "source-pool"
        or not isinstance(payload.get("selectionPolicy"), dict)
        or payload["selectionPolicy"].get("automaticSelection") is not True
        or payload["selectionPolicy"].get("acceptancePolicy")
        != "operator-authorized-deterministic-v1"
        or not isinstance(payload.get("dialogues"), list)
    ):
        raise CorpusClusterError("source registry schema is unsupported")
    return payload, digest, size


def registry_selections(payload: dict[str, Any]) -> tuple[VideoSelection, ...]:
    selections: list[VideoSelection] = []
    seen_dialogues: set[str] = set()
    seen_videos: set[str] = set()
    for dialogue_index, record in enumerate(payload["dialogues"]):
        record = _expect_keys(
            record, {"dialogue", "videos"}, f"dialogue {dialogue_index}"
        )
        dialogue = record["dialogue"]
        videos = record["videos"]
        if (
            not isinstance(dialogue, str)
            or _SAFE_ID.fullmatch(dialogue) is None
            or dialogue in seen_dialogues
            or not isinstance(videos, list)
            or not videos
        ):
            raise CorpusClusterError(
                f"dialogue {dialogue_index} is invalid or duplicated"
            )
        seen_dialogues.add(dialogue)
        for part_index, raw_video in enumerate(videos, start=1):
            video = _expect_keys(
                raw_video,
                {"videoId", "title", "durationSeconds", "url"},
                f"video {dialogue}/{part_index}",
            )
            video_id = video["videoId"]
            title = video["title"]
            duration = video["durationSeconds"]
            url = video["url"]
            if (
                not isinstance(video_id, str)
                or _VIDEO_ID.fullmatch(video_id) is None
                or video_id in seen_videos
                or not isinstance(title, str)
                or not title.strip()
                or isinstance(duration, bool)
                or not isinstance(duration, int)
                or duration <= 0
                or url != f"https://www.youtube.com/watch?v={video_id}"
            ):
                raise CorpusClusterError(f"video {dialogue}/{part_index} is malformed")
            seen_videos.add(video_id)
            selections.append(
                VideoSelection(
                    dialogue=dialogue,
                    part_index=part_index,
                    part_count=len(videos),
                    video_id=video_id,
                    title=" ".join(title.split()),
                    duration_seconds=duration,
                    url=url,
                )
            )
    return tuple(
        sorted(
            selections, key=lambda item: (item.dialogue, item.part_index, item.video_id)
        )
    )


def select_video(
    selections: Sequence[VideoSelection], *, dialogue: str, video_id: str | None
) -> VideoSelection:
    matches = [selection for selection in selections if selection.dialogue == dialogue]
    if not matches:
        raise CorpusClusterError(f"dialogue is not pinned: {dialogue}")
    if video_id is None:
        if len(matches) != 1:
            raise CorpusClusterError(f"{dialogue} has multiple videos; pass --video-id")
        return matches[0]
    exact = [selection for selection in matches if selection.video_id == video_id]
    if len(exact) != 1:
        raise CorpusClusterError(f"video {video_id} is not pinned for {dialogue}")
    return exact[0]


def selection_payload(selection: VideoSelection) -> dict[str, Any]:
    return {
        "selectionKey": selection.key,
        "dialogue": selection.dialogue,
        "partIndex": selection.part_index,
        "partCount": selection.part_count,
        "video": {
            "videoId": selection.video_id,
            "title": selection.title,
            "durationSeconds": selection.duration_seconds,
            "url": selection.url,
        },
    }


def _caption_evidence(selection: VideoSelection) -> dict[str, Any]:
    path = caption_path(selection)
    _require_confined_file(path, expected=path, label=f"captions for {selection.key}")
    digest, size = _bounded_hash(
        path, maximum_bytes=MAX_CAPTION_BYTES, label=f"captions for {selection.key}"
    )
    return {
        "path": path.as_posix(),
        "sha256": digest,
        "bytes": size,
        "textUsedForIdentity": False,
    }


def _source_evidence(selection: VideoSelection) -> dict[str, Any] | None:
    path = source_path(selection)
    if path.is_symlink():
        raise CorpusClusterError(f"source cache path is a symlink: {path}")
    if not path.exists():
        return None
    _require_confined_file(path, expected=path, label=f"source for {selection.key}")
    maximum = source_byte_ceiling(selection.duration_seconds)
    digest, stat_size = _bounded_hash(
        path, maximum_bytes=maximum, label=f"source for {selection.key}"
    )
    duration, probe_size = core.ffprobe_media(path)
    if probe_size != stat_size:
        raise CorpusClusterError(f"ffprobe size differs from stat for {selection.key}")
    if abs(duration - selection.duration_seconds) > SOURCE_DURATION_TOLERANCE_SECONDS:
        raise CorpusClusterError(
            f"source duration differs from registry for {selection.key}"
        )
    return {
        "claim": "local-bytes-hash-only",
        "path": path.as_posix(),
        "sha256": digest,
        "bytes": stat_size,
        "durationSeconds": round(duration, 6),
        "maximumBytes": maximum,
    }


def plan_sha256(plan: dict[str, Any]) -> str:
    payload = {
        key: value for key, value in plan.items() if key not in _PLAN_OPERATIONAL_FIELDS
    }
    return sha256_bytes(canonical_json(payload))


def plan_artifact_path(selection: VideoSelection, plan_hash: str) -> Path:
    _sha(plan_hash, "plan SHA-256")
    return plan_directory(selection) / f"{plan_hash}.json"


def _plan_operations(plan: dict[str, Any]) -> dict[str, str]:
    selection = parse_selection(plan["selection"])
    plan_hash = plan["planSha256"]
    artifact = plan_artifact_path(selection, plan_hash)
    output = output_path(selection)
    arguments = [
        str(REMOTE_PYTHON),
        SCRIPT_PATH.as_posix(),
        "execute-plan",
        artifact.as_posix(),
        "--cache-dir",
        str(REMOTE_CACHE),
        "--expect-plan-sha256",
        plan_hash,
    ]
    return {
        "planArtifact": artifact.as_posix(),
        "gpuTransferCommand": shlex.join(
            [
                "rsync",
                "-aR",
                SCRIPT_PATH.as_posix(),
                CORE_PATH.as_posix(),
                REGISTRY.as_posix(),
                plan["source"]["materializedEvidence"]["path"],
                plan["captions"]["path"],
                artifact.as_posix(),
                f"gpu:{REMOTE_ROOT}/",
            ]
        ),
        "gpuExecuteCommand": shlex.join(
            ["ssh", "gpu", f"cd {REMOTE_ROOT} && {shlex.join(arguments)}"]
        ),
        "gpuFetchCommand": shlex.join(
            [
                "rsync",
                "-a",
                f"gpu:{REMOTE_ROOT}/{output.as_posix()}/",
                f"{output.as_posix()}/",
            ]
        ),
    }


def _segmentation_parameters(max_segments: int) -> dict[str, Any]:
    return {
        "silenceNoiseDb": core.SILENCE_NOISE_DB,
        "silenceMinimumSeconds": core.SILENCE_MIN_SECONDS,
        "captionGapSeconds": core.CAPTION_GAP_SECONDS,
        "minimumSegmentSeconds": core.MIN_SEGMENT_SECONDS,
        "targetSegmentSeconds": core.TARGET_SEGMENT_SECONDS,
        "maximumSegmentSeconds": core.MAX_SEGMENT_SECONDS,
        "minimumTimedWords": core.MIN_TIMED_WORDS,
        "maximumSegments": max_segments,
        "clusterCosineThreshold": core.CLUSTER_THRESHOLD,
        "minimumClusterSize": core.MIN_CLUSTER_SIZE,
        "representativesPerCluster": core.REPRESENTATIVES_PER_CLUSTER,
        "auditRepresentativesPerCluster": core.AUDIT_REPRESENTATIVES_PER_CLUSTER,
    }


def build_plan(
    selection: VideoSelection, *, max_segments: int = MAX_SEGMENTS
) -> dict[str, Any]:
    if not 1 <= max_segments <= MAX_SEGMENTS:
        raise CorpusClusterError(f"max_segments must be between 1 and {MAX_SEGMENTS}")
    core_hash = verify_frozen_core()
    registry, registry_hash, registry_bytes = _registry_payload()
    canonical = select_video(
        registry_selections(registry),
        dialogue=selection.dialogue,
        video_id=selection.video_id,
    )
    if canonical != selection:
        raise CorpusClusterError(
            "selection differs from the exact source registry entry"
        )
    captions = _caption_evidence(selection)
    source = _source_evidence(selection)
    if source is None:
        raise CorpusClusterError(
            f"source materialization is required for {selection.key}"
        )
    duration = float(source["durationSeconds"])
    word_times = core.parse_caption_word_times(Path(captions["path"]))
    if word_times[-1] > (duration + CAPTION_TIMELINE_ALLOWANCE_SECONDS) * 1000:
        raise CorpusClusterError(
            f"caption timing exceeds the source timeline for {selection.key}"
        )
    silences = core.detect_silences(Path(source["path"]), duration)
    boundaries = core.candidate_boundaries(word_times, silences, duration)
    segments = core.build_segments(word_times, boundaries, max_segments=max_segments)
    boundary_counts = {
        side: {
            kind: sum(
                getattr(segment, f"{side}_boundary") == kind for segment in segments
            )
            for kind in ("media-edge", "silence", "caption-gap")
        }
        for side in ("start", "end")
    }
    plan: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "selection": selection_payload(selection),
        "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
        "segmentationPolicy": copy.deepcopy(SEGMENTATION_POLICY),
        "registry": {
            "path": REGISTRY.as_posix(),
            "sha256": registry_hash,
            "bytes": registry_bytes,
        },
        "source": {"materializedEvidence": source},
        "captions": {
            **captions,
            "timedWordPoints": len(word_times),
        },
        "limits": {
            "maximumSourceBytes": source_byte_ceiling(selection.duration_seconds),
            "maximumCaptionBytes": MAX_CAPTION_BYTES,
            "sourceDurationToleranceSeconds": SOURCE_DURATION_TOLERANCE_SECONDS,
            "captionTimelineAllowanceSeconds": CAPTION_TIMELINE_ALLOWANCE_SECONDS,
            "maximumSegments": max_segments,
        },
        "segmentation": {
            "parameters": _segmentation_parameters(max_segments),
            "silenceCount": len(silences),
            "candidateBoundaryCount": len(boundaries),
            "selectedBoundaryCounts": boundary_counts,
            "segments": [asdict(segment) for segment in segments],
        },
        "embedding": copy.deepcopy(EMBEDDING),
        "tools": {
            "plannerScriptPath": SCRIPT_PATH.as_posix(),
            "plannerScriptSha256": sha256_file(SCRIPT_PATH),
            "coreScriptPath": CORE_PATH.as_posix(),
            "coreScriptSha256": core_hash,
            "segmentationFfmpeg": core.ffmpeg_version(),
        },
        "outputDirectory": output_path(selection).as_posix(),
    }
    plan["planSha256"] = plan_sha256(plan)
    plan.update(_plan_operations(plan))
    validate_plan(plan)
    return plan


def parse_selection(value: Any) -> VideoSelection:
    record = _expect_keys(
        value,
        {"selectionKey", "dialogue", "partIndex", "partCount", "video"},
        "selection",
    )
    video = _expect_keys(
        record["video"], {"videoId", "title", "durationSeconds", "url"}, "video"
    )
    selection = VideoSelection(
        dialogue=record["dialogue"],
        part_index=record["partIndex"],
        part_count=record["partCount"],
        video_id=video["videoId"],
        title=video["title"],
        duration_seconds=video["durationSeconds"],
        url=video["url"],
    )
    if (
        not isinstance(selection.dialogue, str)
        or _SAFE_ID.fullmatch(selection.dialogue) is None
        or isinstance(selection.part_index, bool)
        or not isinstance(selection.part_index, int)
        or isinstance(selection.part_count, bool)
        or not isinstance(selection.part_count, int)
        or not 1 <= selection.part_index <= selection.part_count
        or not isinstance(selection.video_id, str)
        or _VIDEO_ID.fullmatch(selection.video_id) is None
        or not isinstance(selection.title, str)
        or not selection.title
        or isinstance(selection.duration_seconds, bool)
        or not isinstance(selection.duration_seconds, int)
        or selection.duration_seconds <= 0
        or selection.url != f"https://www.youtube.com/watch?v={selection.video_id}"
        or record["selectionKey"] != selection.key
    ):
        raise CorpusClusterError("selection metadata is invalid")
    return selection


def validate_plan(plan: Any) -> tuple[core.Segment, ...]:
    top = _expect_keys(
        plan,
        {
            "schemaVersion",
            "status",
            "selection",
            "identityPolicy",
            "segmentationPolicy",
            "registry",
            "source",
            "captions",
            "limits",
            "segmentation",
            "embedding",
            "tools",
            "outputDirectory",
            "planSha256",
            "planArtifact",
            "gpuTransferCommand",
            "gpuExecuteCommand",
            "gpuFetchCommand",
        },
        "plan",
    )
    if top["schemaVersion"] != SCHEMA_VERSION or top["status"] != PLAN_STATUS:
        raise CorpusClusterError("plan schema or status is unsupported")
    selection = parse_selection(top["selection"])
    if (
        top["identityPolicy"] != IDENTITY_POLICY
        or top["segmentationPolicy"] != SEGMENTATION_POLICY
    ):
        raise CorpusClusterError("plan safety policy changed")
    expected_hash = _sha(top["planSha256"], "plan SHA-256")
    if plan_sha256(top) != expected_hash:
        raise CorpusClusterError("plan SHA-256 does not match its exact payload")
    operations = _plan_operations(top)
    if any(top[key] != value for key, value in operations.items()):
        raise CorpusClusterError("plan artifact path or commands changed")

    registry = _expect_keys(top["registry"], {"path", "sha256", "bytes"}, "registry")
    if registry["path"] != REGISTRY.as_posix():
        raise CorpusClusterError("plan registry path is invalid")
    _sha(registry["sha256"], "registry SHA-256")
    if (
        isinstance(registry["bytes"], bool)
        or not isinstance(registry["bytes"], int)
        or not 0 < registry["bytes"] <= MAX_REGISTRY_BYTES
    ):
        raise CorpusClusterError("plan registry byte count is invalid")
    registry_payload, current_registry_hash, current_registry_bytes = (
        _registry_payload()
    )
    if (
        registry["sha256"] != current_registry_hash
        or registry["bytes"] != current_registry_bytes
    ):
        raise CorpusClusterError("plan source registry changed")
    canonical = select_video(
        registry_selections(registry_payload),
        dialogue=selection.dialogue,
        video_id=selection.video_id,
    )
    if canonical != selection:
        raise CorpusClusterError("plan selection differs from the source registry")
    source = _expect_keys(top["source"], {"materializedEvidence"}, "source")
    materialized = _expect_keys(
        source["materializedEvidence"],
        {"claim", "path", "sha256", "bytes", "durationSeconds", "maximumBytes"},
        "materialized source",
    )
    expected_source_path = source_path(selection).as_posix()
    maximum_source = source_byte_ceiling(selection.duration_seconds)
    if (
        materialized["claim"] != "local-bytes-hash-only"
        or materialized["path"] != expected_source_path
        or materialized["maximumBytes"] != maximum_source
    ):
        raise CorpusClusterError("plan materialized source path or bound is invalid")
    _sha(materialized["sha256"], "source SHA-256")
    if (
        isinstance(materialized["bytes"], bool)
        or not isinstance(materialized["bytes"], int)
        or not 0 < materialized["bytes"] <= maximum_source
    ):
        raise CorpusClusterError("plan source byte count is invalid")
    duration = _number(materialized["durationSeconds"], "source duration")
    if abs(duration - selection.duration_seconds) > SOURCE_DURATION_TOLERANCE_SECONDS:
        raise CorpusClusterError("plan source duration differs from registry")
    captions = _expect_keys(
        top["captions"],
        {"path", "sha256", "bytes", "textUsedForIdentity", "timedWordPoints"},
        "captions",
    )
    if captions["path"] != caption_path(selection).as_posix():
        raise CorpusClusterError("plan caption path is invalid")
    _sha(captions["sha256"], "caption SHA-256")
    if (
        isinstance(captions["bytes"], bool)
        or not isinstance(captions["bytes"], int)
        or not 0 < captions["bytes"] <= MAX_CAPTION_BYTES
        or captions["textUsedForIdentity"] is not False
        or isinstance(captions["timedWordPoints"], bool)
        or not isinstance(captions["timedWordPoints"], int)
        or captions["timedWordPoints"] < core.MIN_TIMED_WORDS
    ):
        raise CorpusClusterError("plan caption evidence is invalid")
    limits = _expect_keys(
        top["limits"],
        {
            "maximumSourceBytes",
            "maximumCaptionBytes",
            "sourceDurationToleranceSeconds",
            "captionTimelineAllowanceSeconds",
            "maximumSegments",
        },
        "limits",
    )
    maximum_segments = limits["maximumSegments"]
    if (
        limits
        != {
            "maximumSourceBytes": maximum_source,
            "maximumCaptionBytes": MAX_CAPTION_BYTES,
            "sourceDurationToleranceSeconds": SOURCE_DURATION_TOLERANCE_SECONDS,
            "captionTimelineAllowanceSeconds": CAPTION_TIMELINE_ALLOWANCE_SECONDS,
            "maximumSegments": maximum_segments,
        }
        or isinstance(maximum_segments, bool)
        or not isinstance(maximum_segments, int)
        or not 1 <= maximum_segments <= MAX_SEGMENTS
    ):
        raise CorpusClusterError("plan limits are invalid")
    if top["embedding"] != EMBEDDING:
        raise CorpusClusterError("plan embedding provenance changed")
    tools = _expect_keys(
        top["tools"],
        {
            "plannerScriptPath",
            "plannerScriptSha256",
            "coreScriptPath",
            "coreScriptSha256",
            "segmentationFfmpeg",
        },
        "tools",
    )
    if (
        tools["plannerScriptPath"] != SCRIPT_PATH.as_posix()
        or tools["coreScriptPath"] != CORE_PATH.as_posix()
        or tools["coreScriptSha256"] != FROZEN_CORE_SHA256
        or not isinstance(tools["segmentationFfmpeg"], str)
        or not tools["segmentationFfmpeg"]
    ):
        raise CorpusClusterError("plan tool provenance is invalid")
    _sha(tools["plannerScriptSha256"], "planner script SHA-256")
    if tools["plannerScriptSha256"] != sha256_file(SCRIPT_PATH):
        raise CorpusClusterError("plan planner script changed")
    if top["outputDirectory"] != output_path(selection).as_posix():
        raise CorpusClusterError("plan output path is invalid")

    segmentation = _expect_keys(
        top["segmentation"],
        {
            "parameters",
            "silenceCount",
            "candidateBoundaryCount",
            "selectedBoundaryCounts",
            "segments",
        },
        "segmentation",
    )
    if segmentation["parameters"] != _segmentation_parameters(maximum_segments):
        raise CorpusClusterError("plan segmentation parameters changed")
    if (
        isinstance(segmentation["silenceCount"], bool)
        or not isinstance(segmentation["silenceCount"], int)
        or segmentation["silenceCount"] < 0
        or isinstance(segmentation["candidateBoundaryCount"], bool)
        or not isinstance(segmentation["candidateBoundaryCount"], int)
        or segmentation["candidateBoundaryCount"] < 2
        or not isinstance(segmentation["segments"], list)
        or not 0 < len(segmentation["segments"]) <= maximum_segments
    ):
        raise CorpusClusterError("plan segmentation counts are invalid")
    segments: list[core.Segment] = []
    previous_end = -1.0
    previous_number = -1
    allowed_boundaries = {"media-edge", "silence", "caption-gap"}
    for index, raw in enumerate(segmentation["segments"]):
        record = _expect_keys(
            raw,
            {
                "segment_id",
                "start_seconds",
                "end_seconds",
                "start_boundary",
                "end_boundary",
                "timed_word_count",
            },
            f"segment {index}",
        )
        segment_id = record["segment_id"]
        if not isinstance(segment_id, str) or _SEGMENT_ID.fullmatch(segment_id) is None:
            raise CorpusClusterError(f"segment {index} id is invalid")
        number = int(segment_id.rsplit("-", 1)[1])
        start = _number(record["start_seconds"], f"segment {index} start")
        end = _number(record["end_seconds"], f"segment {index} end")
        words = record["timed_word_count"]
        if (
            number <= previous_number
            or start < previous_end
            or start < 0
            or end > duration
            or not core.MIN_SEGMENT_SECONDS <= end - start <= core.MAX_SEGMENT_SECONDS
            or record["start_boundary"] not in allowed_boundaries
            or record["end_boundary"] not in allowed_boundaries
            or isinstance(words, bool)
            or not isinstance(words, int)
            or words < core.MIN_TIMED_WORDS
        ):
            raise CorpusClusterError(f"segment {index} violates segmentation bounds")
        segments.append(
            core.Segment(
                segment_id,
                start,
                end,
                record["start_boundary"],
                record["end_boundary"],
                words,
            )
        )
        previous_end = end
        previous_number = number
    expected_counts = {
        side: {
            kind: sum(
                getattr(segment, f"{side}_boundary") == kind for segment in segments
            )
            for kind in allowed_boundaries
        }
        for side in ("start", "end")
    }
    if segmentation["selectedBoundaryCounts"] != expected_counts:
        raise CorpusClusterError("plan boundary diagnostics do not match segments")
    return tuple(segments)


def write_plan_artifact(plan: dict[str, Any]) -> Path:
    validate_plan(plan)
    selection = parse_selection(plan["selection"])
    expected = plan_artifact_path(selection, plan["planSha256"])
    path = Path(plan["planArtifact"])
    _require_confined_output(path, expected=expected, label="plan artifact")
    encoded = json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if (
            not path.is_file()
            or path.is_symlink()
            or path.read_text(encoding="utf-8") != encoded
        ):
            raise CorpusClusterError(f"existing plan artifact differs: {path}")
        return path
    atomic_json(path, plan)
    return path


def load_plan_artifact(
    path: Path, *, expected_sha256: str | None = None
) -> dict[str, Any]:
    try:
        plan = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusClusterError(
            f"cannot read plan artifact {path}: {error}"
        ) from error
    validate_plan(plan)
    if expected_sha256 is not None and plan["planSha256"] != expected_sha256:
        raise CorpusClusterError("plan does not match --expect-plan-sha256")
    expected = PurePosixPath(plan["planArtifact"])
    supplied = PurePosixPath(path.as_posix())
    if tuple(supplied.parts[-len(expected.parts) :]) != expected.parts:
        raise CorpusClusterError("plan was not loaded from its content-addressed path")
    return plan


def materialization_command(selection: VideoSelection) -> str:
    maximum_bytes = source_byte_ceiling(selection.duration_seconds)
    maximum_blocks = maximum_bytes // 512
    download = shlex.join(
        [
            "yt-dlp",
            "--no-playlist",
            "--no-overwrites",
            "--no-part",
            "--concurrent-fragments",
            "1",
            "--max-filesize",
            str(maximum_bytes),
            "-f",
            "bestaudio",
            "-o",
            source_path(selection).as_posix(),
            selection.url,
        ]
    )
    return shlex.join(["sh", "-c", f"ulimit -f {maximum_blocks} && exec {download}"])


def queue_sha256(queue: dict[str, Any]) -> str:
    payload = {key: value for key, value in queue.items() if key != "queueSha256"}
    return sha256_bytes(canonical_json(payload))


def build_queue(*, max_segments: int = MAX_SEGMENTS) -> dict[str, Any]:
    if not 1 <= max_segments <= MAX_SEGMENTS:
        raise CorpusClusterError(f"max_segments must be between 1 and {MAX_SEGMENTS}")
    core_hash = verify_frozen_core()
    registry, registry_hash, registry_bytes = _registry_payload()
    selections = registry_selections(registry)
    if (
        len({selection.dialogue for selection in selections}) != EXPECTED_DIALOGUE_COUNT
        or len(selections) != EXPECTED_VIDEO_COUNT
        or sum(selection.duration_seconds for selection in selections)
        != EXPECTED_TOTAL_DURATION_SECONDS
    ):
        raise CorpusClusterError(
            "source registry differs from the frozen v2 corpus inventory"
        )
    items: list[dict[str, Any]] = []
    ready = 0
    missing = 0
    for queue_index, selection in enumerate(selections, start=1):
        captions = _caption_evidence(selection)
        source = _source_evidence(selection)
        if source is None:
            missing += 1
            item = {
                "queueIndex": queue_index,
                "selection": selection_payload(selection),
                "status": "materialization-required",
                "source": {
                    "path": source_path(selection).as_posix(),
                    "status": "missing",
                    "maximumBytes": source_byte_ceiling(selection.duration_seconds),
                },
                "captions": captions,
                "plan": None,
                "commands": {
                    "materializeSource": materialization_command(selection),
                    "gpuTransfer": None,
                    "gpuExecute": None,
                    "gpuFetch": None,
                },
            }
        else:
            ready += 1
            plan = build_plan(selection, max_segments=max_segments)
            if plan["source"]["materializedEvidence"] != source or any(
                plan["captions"][key] != captions[key]
                for key in ("path", "sha256", "bytes", "textUsedForIdentity")
            ):
                raise CorpusClusterError(
                    f"source or captions changed while planning {selection.key}"
                )
            item = {
                "queueIndex": queue_index,
                "selection": selection_payload(selection),
                "status": "ready",
                "source": source,
                "captions": captions,
                "plan": {
                    "path": plan["planArtifact"],
                    "sha256": plan["planSha256"],
                    "segmentCount": len(plan["segmentation"]["segments"]),
                    "outputDirectory": plan["outputDirectory"],
                },
                "commands": {
                    "materializeSource": None,
                    "gpuTransfer": plan["gpuTransferCommand"],
                    "gpuExecute": plan["gpuExecuteCommand"],
                    "gpuFetch": plan["gpuFetchCommand"],
                },
            }
        items.append(item)
    queue: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "status": QUEUE_STATUS,
        "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
        "segmentationPolicy": copy.deepcopy(SEGMENTATION_POLICY),
        "embedding": copy.deepcopy(EMBEDDING),
        "registry": {
            "path": REGISTRY.as_posix(),
            "sha256": registry_hash,
            "bytes": registry_bytes,
        },
        "tools": {
            "plannerScriptPath": SCRIPT_PATH.as_posix(),
            "plannerScriptSha256": sha256_file(SCRIPT_PATH),
            "coreScriptPath": CORE_PATH.as_posix(),
            "coreScriptSha256": core_hash,
        },
        "limits": {
            "maximumSegmentsPerVideo": max_segments,
            "maximumCaptionBytes": MAX_CAPTION_BYTES,
            "absoluteMaximumSourceBytes": MAX_SOURCE_BYTE_CEILING,
            "sourceDurationToleranceSeconds": SOURCE_DURATION_TOLERANCE_SECONDS,
            "captionTimelineAllowanceSeconds": CAPTION_TIMELINE_ALLOWANCE_SECONDS,
        },
        "summary": {
            "dialogueCount": len({selection.dialogue for selection in selections}),
            "videoCount": len(selections),
            "readyPlanCount": ready,
            "materializationRequiredCount": missing,
            "totalPinnedDurationSeconds": sum(
                selection.duration_seconds for selection in selections
            ),
            "gpuJobsLaunched": 0,
        },
        "items": items,
        "queuePath": QUEUE_PATH.as_posix(),
    }
    queue["queueSha256"] = queue_sha256(queue)
    validate_queue(queue)
    return queue


def validate_queue(queue: Any) -> None:
    top = _expect_keys(
        queue,
        {
            "schemaVersion",
            "status",
            "identityPolicy",
            "segmentationPolicy",
            "embedding",
            "registry",
            "tools",
            "limits",
            "summary",
            "items",
            "queuePath",
            "queueSha256",
        },
        "queue",
    )
    if top["schemaVersion"] != SCHEMA_VERSION or top["status"] != QUEUE_STATUS:
        raise CorpusClusterError("queue schema or status is unsupported")
    if (
        top["identityPolicy"] != IDENTITY_POLICY
        or top["segmentationPolicy"] != SEGMENTATION_POLICY
    ):
        raise CorpusClusterError("queue safety policy changed")
    if top["embedding"] != EMBEDDING:
        raise CorpusClusterError("queue embedding provenance changed")
    if queue_sha256(top) != _sha(top["queueSha256"], "queue SHA-256"):
        raise CorpusClusterError("queue SHA-256 does not match its exact payload")
    if top["queuePath"] != QUEUE_PATH.as_posix():
        raise CorpusClusterError("queue output path is invalid")
    registry = _expect_keys(
        top["registry"], {"path", "sha256", "bytes"}, "queue registry"
    )
    if registry["path"] != REGISTRY.as_posix():
        raise CorpusClusterError("queue registry path is invalid")
    _sha(registry["sha256"], "queue registry SHA-256")
    if (
        isinstance(registry["bytes"], bool)
        or not isinstance(registry["bytes"], int)
        or not 0 < registry["bytes"] <= MAX_REGISTRY_BYTES
    ):
        raise CorpusClusterError("queue registry byte count is invalid")
    registry_payload, current_registry_hash, current_registry_bytes = (
        _registry_payload()
    )
    if (
        registry["sha256"] != current_registry_hash
        or registry["bytes"] != current_registry_bytes
    ):
        raise CorpusClusterError("queue source registry changed")
    expected_selections = list(registry_selections(registry_payload))
    if (
        len({selection.dialogue for selection in expected_selections})
        != EXPECTED_DIALOGUE_COUNT
        or len(expected_selections) != EXPECTED_VIDEO_COUNT
        or sum(selection.duration_seconds for selection in expected_selections)
        != EXPECTED_TOTAL_DURATION_SECONDS
    ):
        raise CorpusClusterError(
            "source registry differs from the frozen v2 corpus inventory"
        )
    tools = _expect_keys(
        top["tools"],
        {
            "plannerScriptPath",
            "plannerScriptSha256",
            "coreScriptPath",
            "coreScriptSha256",
        },
        "queue tools",
    )
    if (
        tools["plannerScriptPath"] != SCRIPT_PATH.as_posix()
        or tools["coreScriptPath"] != CORE_PATH.as_posix()
        or tools["coreScriptSha256"] != FROZEN_CORE_SHA256
    ):
        raise CorpusClusterError("queue tool provenance is invalid")
    _sha(tools["plannerScriptSha256"], "queue planner SHA-256")
    if tools["plannerScriptSha256"] != sha256_file(SCRIPT_PATH):
        raise CorpusClusterError("queue planner script changed")
    limits = top["limits"]
    if not isinstance(limits, dict):
        raise CorpusClusterError("queue limits are invalid")
    maximum_segments = limits.get("maximumSegmentsPerVideo")
    if (
        limits
        != {
            "maximumSegmentsPerVideo": maximum_segments,
            "maximumCaptionBytes": MAX_CAPTION_BYTES,
            "absoluteMaximumSourceBytes": MAX_SOURCE_BYTE_CEILING,
            "sourceDurationToleranceSeconds": SOURCE_DURATION_TOLERANCE_SECONDS,
            "captionTimelineAllowanceSeconds": CAPTION_TIMELINE_ALLOWANCE_SECONDS,
        }
        or isinstance(maximum_segments, bool)
        or not isinstance(maximum_segments, int)
        or not 1 <= maximum_segments <= MAX_SEGMENTS
    ):
        raise CorpusClusterError("queue limits changed")
    items = top["items"]
    if not isinstance(items, list) or not items:
        raise CorpusClusterError("queue items are missing")
    selections: list[VideoSelection] = []
    ready = 0
    missing = 0
    for index, raw in enumerate(items, start=1):
        item = _expect_keys(
            raw,
            {
                "queueIndex",
                "selection",
                "status",
                "source",
                "captions",
                "plan",
                "commands",
            },
            f"queue item {index}",
        )
        if item["queueIndex"] != index:
            raise CorpusClusterError("queue indices are not contiguous")
        selection = parse_selection(item["selection"])
        selections.append(selection)
        captions = _expect_keys(
            item["captions"],
            {"path", "sha256", "bytes", "textUsedForIdentity"},
            f"queue captions {index}",
        )
        if (
            captions["path"] != caption_path(selection).as_posix()
            or captions["textUsedForIdentity"] is not False
        ):
            raise CorpusClusterError(
                f"queue caption path or policy is invalid at {index}"
            )
        _sha(captions["sha256"], f"queue caption SHA-256 {index}")
        if (
            isinstance(captions["bytes"], bool)
            or not isinstance(captions["bytes"], int)
            or not 0 < captions["bytes"] <= MAX_CAPTION_BYTES
        ):
            raise CorpusClusterError(f"queue caption byte count is invalid at {index}")
        commands = _expect_keys(
            item["commands"],
            {"materializeSource", "gpuTransfer", "gpuExecute", "gpuFetch"},
            f"queue commands {index}",
        )
        if item["status"] == "materialization-required":
            missing += 1
            source = _expect_keys(
                item["source"],
                {"path", "status", "maximumBytes"},
                f"queue source {index}",
            )
            if (
                source
                != {
                    "path": source_path(selection).as_posix(),
                    "status": "missing",
                    "maximumBytes": source_byte_ceiling(selection.duration_seconds),
                }
                or item["plan"] is not None
                or commands
                != {
                    "materializeSource": materialization_command(selection),
                    "gpuTransfer": None,
                    "gpuExecute": None,
                    "gpuFetch": None,
                }
            ):
                raise CorpusClusterError(f"missing-source item {index} is invalid")
        elif item["status"] == "ready":
            ready += 1
            source = _expect_keys(
                item["source"],
                {"claim", "path", "sha256", "bytes", "durationSeconds", "maximumBytes"},
                f"queue source {index}",
            )
            if source["path"] != source_path(selection).as_posix():
                raise CorpusClusterError(f"ready source path is invalid at {index}")
            _sha(source["sha256"], f"queue source SHA-256 {index}")
            maximum_source = source_byte_ceiling(selection.duration_seconds)
            source_duration = _number(
                source["durationSeconds"], f"queue source duration {index}"
            )
            if (
                source["claim"] != "local-bytes-hash-only"
                or source["maximumBytes"] != maximum_source
                or isinstance(source["bytes"], bool)
                or not isinstance(source["bytes"], int)
                or not 0 < source["bytes"] <= maximum_source
                or abs(source_duration - selection.duration_seconds)
                > SOURCE_DURATION_TOLERANCE_SECONDS
            ):
                raise CorpusClusterError(f"ready source evidence is invalid at {index}")
            plan = _expect_keys(
                item["plan"],
                {"path", "sha256", "segmentCount", "outputDirectory"},
                f"queue plan {index}",
            )
            plan_hash = _sha(plan["sha256"], f"queue plan SHA-256 {index}")
            if (
                plan["path"] != plan_artifact_path(selection, plan_hash).as_posix()
                or plan["outputDirectory"] != output_path(selection).as_posix()
                or isinstance(plan["segmentCount"], bool)
                or not isinstance(plan["segmentCount"], int)
                or not 0 < plan["segmentCount"] <= maximum_segments
                or commands["materializeSource"] is not None
            ):
                raise CorpusClusterError(f"ready plan item {index} is invalid")
            operation_plan = {
                "selection": item["selection"],
                "planSha256": plan_hash,
                "source": {"materializedEvidence": source},
                "captions": captions,
            }
            operations = _plan_operations(operation_plan)
            if commands != {
                "materializeSource": None,
                "gpuTransfer": operations["gpuTransferCommand"],
                "gpuExecute": operations["gpuExecuteCommand"],
                "gpuFetch": operations["gpuFetchCommand"],
            }:
                raise CorpusClusterError(f"ready commands are invalid at {index}")
        else:
            raise CorpusClusterError(f"queue item {index} has an unsupported status")
    if selections != expected_selections:
        raise CorpusClusterError(
            "queue selections differ from the exact source registry"
        )
    summary = _expect_keys(
        top["summary"],
        {
            "dialogueCount",
            "videoCount",
            "readyPlanCount",
            "materializationRequiredCount",
            "totalPinnedDurationSeconds",
            "gpuJobsLaunched",
        },
        "queue summary",
    )
    expected_summary = {
        "dialogueCount": len({selection.dialogue for selection in selections}),
        "videoCount": len(selections),
        "readyPlanCount": ready,
        "materializationRequiredCount": missing,
        "totalPinnedDurationSeconds": sum(
            selection.duration_seconds for selection in selections
        ),
        "gpuJobsLaunched": 0,
    }
    if summary != expected_summary:
        raise CorpusClusterError("queue summary does not match its items")


def write_queue(queue: dict[str, Any]) -> Path:
    validate_queue(queue)
    for item in queue["items"]:
        if item["status"] != "ready":
            continue
        selection = parse_selection(item["selection"])
        plan = build_plan(
            selection, max_segments=queue["limits"]["maximumSegmentsPerVideo"]
        )
        if (
            plan["planSha256"] != item["plan"]["sha256"]
            or plan["planArtifact"] != item["plan"]["path"]
        ):
            raise CorpusClusterError(
                f"queue plan changed before write: {selection.key}"
            )
        write_plan_artifact(plan)
    path = Path(queue["queuePath"])
    _require_confined_output(path, expected=QUEUE_PATH, label="queue artifact")
    encoded = json.dumps(queue, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if (
            not path.is_file()
            or path.is_symlink()
            or path.read_text(encoding="utf-8") != encoded
        ):
            raise CorpusClusterError(f"existing queue artifact differs: {path}")
        return path
    atomic_json(path, queue)
    return path


def verify_queue_artifact(path: Path) -> dict[str, Any]:
    if path != QUEUE_PATH:
        raise CorpusClusterError(f"queue verification requires exact path {QUEUE_PATH}")
    try:
        queue = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusClusterError(
            f"cannot read queue artifact {path}: {error}"
        ) from error
    validate_queue(queue)
    rebuilt = build_queue(max_segments=queue["limits"]["maximumSegmentsPerVideo"])
    if rebuilt != queue:
        raise CorpusClusterError(
            "saved queue differs from a fresh deterministic rebuild"
        )
    for item in queue["items"]:
        if item["status"] == "ready":
            plan = load_plan_artifact(
                Path(item["plan"]["path"]), expected_sha256=item["plan"]["sha256"]
            )
            validate_execution_inputs(plan)
        elif source_path(parse_selection(item["selection"])).exists():
            raise CorpusClusterError(
                "queue is stale: a missing source is now materialized"
            )
    return queue


def validate_execution_inputs(plan: dict[str, Any]) -> tuple[core.Segment, ...]:
    segments = validate_plan(plan)
    selection = parse_selection(plan["selection"])
    verify_frozen_core()
    if sha256_file(SCRIPT_PATH) != plan["tools"]["plannerScriptSha256"]:
        raise CorpusClusterError("planner script changed before execution")
    registry, registry_hash, registry_bytes = _registry_payload()
    canonical = select_video(
        registry_selections(registry),
        dialogue=selection.dialogue,
        video_id=selection.video_id,
    )
    if canonical != selection:
        raise CorpusClusterError("registry selection changed before execution")
    if (
        registry_hash != plan["registry"]["sha256"]
        or registry_bytes != plan["registry"]["bytes"]
    ):
        raise CorpusClusterError("source registry changed before execution")
    captions = _caption_evidence(selection)
    if any(
        captions[key] != plan["captions"][key]
        for key in ("path", "sha256", "bytes", "textUsedForIdentity")
    ):
        raise CorpusClusterError("captions changed before execution")
    source = _source_evidence(selection)
    if source is None or source != plan["source"]["materializedEvidence"]:
        raise CorpusClusterError("source media changed before execution")
    word_times = core.parse_caption_word_times(Path(captions["path"]))
    if (
        len(word_times) != plan["captions"]["timedWordPoints"]
        or word_times[-1]
        > (float(source["durationSeconds"]) + CAPTION_TIMELINE_ALLOWANCE_SECONDS) * 1000
    ):
        raise CorpusClusterError("caption timing evidence changed before execution")
    caption_boundaries = {
        boundary.seconds
        for boundary in core.candidate_boundaries(
            word_times, (), float(source["durationSeconds"])
        )
        if boundary.kind == "caption-gap"
    }
    for segment in segments:
        start_ms = round(segment.start_seconds * 1000)
        end_ms = round(segment.end_seconds * 1000)
        timed_word_count = sum(start_ms <= value < end_ms for value in word_times)
        if timed_word_count != segment.timed_word_count:
            raise CorpusClusterError(
                f"caption word count differs for {segment.segment_id}"
            )
        for side, seconds, boundary_kind in (
            ("start", segment.start_seconds, segment.start_boundary),
            ("end", segment.end_seconds, segment.end_boundary),
        ):
            if boundary_kind == "caption-gap" and seconds not in caption_boundaries:
                raise CorpusClusterError(
                    f"caption-gap evidence differs for {segment.segment_id} {side}"
                )
            expected_media_edge = (
                0.0 if side == "start" else float(source["durationSeconds"])
            )
            if boundary_kind == "media-edge" and seconds != expected_media_edge:
                raise CorpusClusterError(
                    f"media-edge evidence differs for {segment.segment_id} {side}"
                )
    _require_confined_output(
        Path(plan["outputDirectory"]),
        expected=output_path(selection),
        label="cluster output",
    )
    return segments


def _execution_tools(plan: dict[str, Any]) -> dict[str, Any]:
    configured = os.environ.setdefault(
        "CUBLAS_WORKSPACE_CONFIG",
        str(core.EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]),
    )
    if configured != core.EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]:
        raise CorpusClusterError("CUBLAS_WORKSPACE_CONFIG conflicts with the plan")
    execution_ffmpeg = core.ffmpeg_version()
    return {
        "ffmpeg": execution_ffmpeg,
        "segmentationFfmpeg": plan["tools"]["segmentationFfmpeg"],
        "ffmpegMatchesSegmentation": execution_ffmpeg
        == plan["tools"]["segmentationFfmpeg"],
        "dotsSourceCommit": core.installed_dots_source_commit(),
        **core.execution_runtime_facts(),
        "embeddingDeterminism": core.EMBEDDING_DETERMINISM,
        "plannerScriptSha256": plan["tools"]["plannerScriptSha256"],
        "coreScriptSha256": plan["tools"]["coreScriptSha256"],
    }


def _confined_component(output: Path, value: Any, *, expected: str, label: str) -> Path:
    if not isinstance(value, str) or value != expected or "\\" in value:
        raise CorpusClusterError(f"{label} path is not the exact relative path")
    relative = PurePosixPath(value)
    if relative.is_absolute() or any(
        part in {"", ".", ".."} for part in relative.parts
    ):
        raise CorpusClusterError(f"{label} path is not confined")
    path = output.joinpath(*relative.parts)
    try:
        path.resolve().relative_to(output.resolve())
    except ValueError as error:
        raise CorpusClusterError(f"{label} path escapes the output") from error
    return path


def _load_embedding_payload(
    output: Path, manifest: dict[str, Any], plan: dict[str, Any]
) -> tuple[list[list[float]], Path]:
    record = _expect_keys(
        manifest["embeddings"], {"path", "sha256", "count", "dimension"}, "embeddings"
    )
    segments = validate_plan(plan)
    if (
        record["count"] != len(segments)
        or record["dimension"] != core.EMBEDDING_DIMENSION
    ):
        raise CorpusClusterError("embedding count or dimension is invalid")
    path = _confined_component(
        output, record["path"], expected="embeddings.json", label="embeddings"
    )
    if not path.is_file() or sha256_file(path) != _sha(
        record["sha256"], "embedding SHA-256"
    ):
        raise CorpusClusterError("embeddings are missing or corrupt")
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusClusterError(f"cannot read embeddings: {error}") from error
    payload = _expect_keys(
        payload,
        {"schemaVersion", "planSha256", "dimension", "embeddings"},
        "embedding payload",
    )
    if (
        payload["schemaVersion"] != SCHEMA_VERSION
        or payload["planSha256"] != plan["planSha256"]
        or payload["dimension"] != core.EMBEDDING_DIMENSION
        or not isinstance(payload["embeddings"], list)
        or len(payload["embeddings"]) != len(segments)
    ):
        raise CorpusClusterError("embedding payload metadata is invalid")
    vectors: list[list[float]] = []
    for index, (raw, segment) in enumerate(
        zip(payload["embeddings"], segments, strict=True)
    ):
        value = _expect_keys(raw, {"segmentId", "vector"}, f"embedding {index}")
        vector = value["vector"]
        if (
            value["segmentId"] != segment.segment_id
            or not isinstance(vector, list)
            or len(vector) != core.EMBEDDING_DIMENSION
            or any(
                isinstance(number, bool)
                or not isinstance(number, (int, float))
                or not math.isfinite(float(number))
                for number in vector
            )
        ):
            raise CorpusClusterError(f"embedding {index} is malformed")
        normalized = [float(number) for number in vector]
        norm = math.sqrt(sum(number * number for number in normalized))
        if abs(norm - 1.0) > 1e-4:
            raise CorpusClusterError(f"embedding {index} is not unit-normalized")
        vectors.append(normalized)
    return vectors, path


def _verify_resume(
    output: Path, plan: dict[str, Any], execution: dict[str, Any]
) -> dict[str, Any] | None:
    if not output.exists():
        return None
    if not output.is_dir() or output.is_symlink():
        raise CorpusClusterError("cluster output is not a confined directory")
    manifest_path = output / "manifest.json"
    if not manifest_path.is_file():
        raise CorpusClusterError("partial cluster output has no manifest")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusClusterError(f"cannot read cluster manifest: {error}") from error
    manifest = _expect_keys(
        manifest,
        {
            "schemaVersion",
            "status",
            "planSha256",
            "plan",
            "selection",
            "identityPolicy",
            "segmentationPolicy",
            "executionTools",
            "packages",
            "embeddings",
            "clusters",
            "unclusteredSegmentCount",
            "segments",
            "resumeVerified",
        },
        "manifest",
    )
    if (
        manifest["schemaVersion"] != SCHEMA_VERSION
        or manifest["status"] != PROOF_STATUS
        or manifest["planSha256"] != plan["planSha256"]
        or manifest["plan"] != plan
        or manifest["selection"] != plan["selection"]
        or manifest["identityPolicy"] != IDENTITY_POLICY
        or manifest["segmentationPolicy"] != SEGMENTATION_POLICY
        or manifest["executionTools"] != execution
        or manifest["resumeVerified"] is not False
    ):
        raise CorpusClusterError("cluster manifest provenance or policy is invalid")
    packages = _expect_keys(
        manifest["packages"], {"dots.tts", "numpy", "torch"}, "packages"
    )
    if any(not isinstance(value, str) or not value for value in packages.values()):
        raise CorpusClusterError("cluster package versions are invalid")
    vectors, embeddings_path = _load_embedding_payload(output, manifest, plan)
    planned = validate_plan(plan)
    clusters = manifest["clusters"]
    segment_records = manifest["segments"]
    if not isinstance(clusters, list) or not isinstance(segment_records, list):
        raise CorpusClusterError("manifest clusters and segments must be arrays")
    cluster_ids: list[str] = []
    for index, raw in enumerate(clusters):
        cluster = _expect_keys(
            raw,
            {
                "clusterId",
                "identity",
                "segmentCount",
                "firstSegmentId",
                "representatives",
                "auditRepresentatives",
                "diagnostics",
            },
            f"cluster {index}",
        )
        cluster_id = f"anonymous-cluster-{index:02d}"
        if cluster["clusterId"] != cluster_id or cluster["identity"] is not None:
            raise CorpusClusterError(f"cluster {index} id or identity is invalid")
        cluster_ids.append(cluster_id)
    if len(segment_records) != len(planned):
        raise CorpusClusterError("manifest segment count differs from the plan")
    groups_by_id = {cluster_id: [] for cluster_id in cluster_ids}
    unclustered = 0
    for index, (raw, segment) in enumerate(zip(segment_records, planned, strict=True)):
        record = _expect_keys(
            raw,
            {
                "segmentId",
                "startSeconds",
                "endSeconds",
                "clusterId",
                "centroidCosine",
                "nearestCompetingCentroidCosine",
                "centroidMargin",
            },
            f"manifest segment {index}",
        )
        if (
            record["segmentId"] != segment.segment_id
            or record["startSeconds"] != segment.start_seconds
            or record["endSeconds"] != segment.end_seconds
        ):
            raise CorpusClusterError(f"manifest segment {index} differs from plan")
        cluster_id = record["clusterId"]
        if cluster_id is None:
            unclustered += 1
            if any(
                record[key] is not None
                for key in (
                    "centroidCosine",
                    "nearestCompetingCentroidCosine",
                    "centroidMargin",
                )
            ):
                raise CorpusClusterError("unclustered segment has diagnostics")
        elif cluster_id in groups_by_id:
            groups_by_id[cluster_id].append(index)
        else:
            raise CorpusClusterError(f"segment {index} has an unknown cluster")
    if manifest["unclusteredSegmentCount"] != unclustered:
        raise CorpusClusterError("unclustered segment count is invalid")
    expected_groups = tuple(
        group
        for group in core.cluster_embeddings(vectors)
        if len(group) >= core.MIN_CLUSTER_SIZE
    )
    actual_groups = tuple(tuple(groups_by_id[cluster_id]) for cluster_id in cluster_ids)
    if actual_groups != expected_groups:
        raise CorpusClusterError("cluster membership differs from embeddings")
    cluster_diagnostics, member_diagnostics = core.similarity_diagnostics(
        actual_groups, vectors
    )
    referenced = {"manifest.json", embeddings_path.relative_to(output).as_posix()}

    def verify_clips(
        records: Any,
        expected_indices: Sequence[int],
        *,
        cluster_id: str,
        selection_name: str,
    ) -> None:
        if not isinstance(records, list) or len(records) != len(expected_indices):
            raise CorpusClusterError(
                f"{cluster_id} {selection_name} clip count is invalid"
            )
        suffix = "rep" if selection_name == "nearest-centroid" else "audit"
        for rank, (raw, segment_index) in enumerate(
            zip(records, expected_indices, strict=True), start=1
        ):
            record = _expect_keys(
                raw,
                {
                    "rank",
                    "selection",
                    "segmentId",
                    "startSeconds",
                    "endSeconds",
                    "path",
                    "sha256",
                },
                f"{cluster_id} {selection_name} clip {rank}",
            )
            segment = planned[segment_index]
            relative = f"representatives/{cluster_id}-{suffix}-{rank:02d}.wav"
            if (
                record["rank"] != rank
                or record["selection"] != selection_name
                or record["segmentId"] != segment.segment_id
                or record["startSeconds"] != segment.start_seconds
                or record["endSeconds"] != segment.end_seconds
            ):
                raise CorpusClusterError("representative clip relationship is invalid")
            path = _confined_component(
                output, record["path"], expected=relative, label="representative"
            )
            referenced.add(relative)
            if not path.is_file() or sha256_file(path) != _sha(
                record["sha256"], "representative SHA-256"
            ):
                raise CorpusClusterError("representative clip is missing or corrupt")
            core._validate_representative_wav(
                path, expected_duration=segment.duration_seconds
            )

    for index, (cluster, group) in enumerate(zip(clusters, actual_groups, strict=True)):
        cluster_id = cluster_ids[index]
        if (
            cluster["segmentCount"] != len(group)
            or cluster["firstSegmentId"] != planned[group[0]].segment_id
            or cluster["diagnostics"] != cluster_diagnostics[index]
        ):
            raise CorpusClusterError(f"{cluster_id} diagnostics or counts are invalid")
        for member in group:
            if any(
                segment_records[member][key] != value
                for key, value in member_diagnostics[member].items()
            ):
                raise CorpusClusterError(f"{cluster_id} member diagnostics are invalid")
        verify_clips(
            cluster["representatives"],
            core.representative_indices(
                group, vectors, core.REPRESENTATIVES_PER_CLUSTER
            ),
            cluster_id=cluster_id,
            selection_name="nearest-centroid",
        )
        verify_clips(
            cluster["auditRepresentatives"],
            core.audit_representative_indices(
                group, vectors, core.AUDIT_REPRESENTATIVES_PER_CLUSTER
            ),
            cluster_id=cluster_id,
            selection_name="farthest-centroid",
        )
    actual_files: set[str] = set()
    for path in output.rglob("*"):
        if path.is_symlink():
            raise CorpusClusterError("cluster output contains a symlink")
        if path.is_file():
            actual_files.add(path.relative_to(output).as_posix())
    if actual_files != referenced:
        raise CorpusClusterError("cluster output inventory differs from manifest")
    return manifest


def execute_plan(plan: dict[str, Any], *, cache_dir: Path) -> dict[str, Any]:
    segments = validate_execution_inputs(plan)
    execution = _execution_tools(plan)
    output = Path(plan["outputDirectory"])
    resumed = _verify_resume(output, plan, execution)
    if resumed is not None:
        resumed["resumeVerified"] = True
        return resumed
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=f".{output.name}.tmp-", dir=output.parent))
    try:
        embeddings = core.extract_embeddings(plan, cache_dir)
        if len(embeddings) != len(segments) or any(
            len(vector) != core.EMBEDDING_DIMENSION for vector in embeddings
        ):
            raise CorpusClusterError("CAM++ returned unexpected embedding dimensions")
        embedding_payload = {
            "schemaVersion": SCHEMA_VERSION,
            "planSha256": plan["planSha256"],
            "dimension": core.EMBEDDING_DIMENSION,
            "embeddings": [
                {"segmentId": segment.segment_id, "vector": vector}
                for segment, vector in zip(segments, embeddings, strict=True)
            ],
        }
        embeddings_path = temporary / "embeddings.json"
        atomic_json(embeddings_path, embedding_payload)
        groups = core.cluster_embeddings(embeddings)
        kept = [group for group in groups if len(group) >= core.MIN_CLUSTER_SIZE]
        diagnostics, member_diagnostics = core.similarity_diagnostics(kept, embeddings)
        assignment: dict[int, str | None] = {
            index: None for index in range(len(segments))
        }
        representatives = temporary / "representatives"
        representatives.mkdir()

        def materialize_clips(
            indices: Sequence[int], *, cluster_id: str, selection_name: str
        ) -> list[dict[str, Any]]:
            records: list[dict[str, Any]] = []
            suffix = "rep" if selection_name == "nearest-centroid" else "audit"
            for rank, segment_index in enumerate(indices, start=1):
                segment = segments[segment_index]
                relative = (
                    Path("representatives") / f"{cluster_id}-{suffix}-{rank:02d}.wav"
                )
                path = temporary / relative
                core._extract_representative_clip(
                    Path(plan["source"]["materializedEvidence"]["path"]),
                    segment,
                    path,
                )
                records.append(
                    {
                        "rank": rank,
                        "selection": selection_name,
                        "segmentId": segment.segment_id,
                        "startSeconds": segment.start_seconds,
                        "endSeconds": segment.end_seconds,
                        "path": relative.as_posix(),
                        "sha256": sha256_file(path),
                    }
                )
            return records

        cluster_records: list[dict[str, Any]] = []
        for cluster_index, group in enumerate(kept):
            cluster_id = f"anonymous-cluster-{cluster_index:02d}"
            for index in group:
                assignment[index] = cluster_id
            cluster_records.append(
                {
                    "clusterId": cluster_id,
                    "identity": None,
                    "segmentCount": len(group),
                    "firstSegmentId": segments[group[0]].segment_id,
                    "representatives": materialize_clips(
                        core.representative_indices(
                            group, embeddings, core.REPRESENTATIVES_PER_CLUSTER
                        ),
                        cluster_id=cluster_id,
                        selection_name="nearest-centroid",
                    ),
                    "auditRepresentatives": materialize_clips(
                        core.audit_representative_indices(
                            group, embeddings, core.AUDIT_REPRESENTATIVES_PER_CLUSTER
                        ),
                        cluster_id=cluster_id,
                        selection_name="farthest-centroid",
                    ),
                    "diagnostics": diagnostics[cluster_index],
                }
            )
        segment_records = [
            {
                "segmentId": segment.segment_id,
                "startSeconds": segment.start_seconds,
                "endSeconds": segment.end_seconds,
                "clusterId": assignment[index],
                "centroidCosine": member_diagnostics.get(index, {}).get(
                    "centroidCosine"
                ),
                "nearestCompetingCentroidCosine": member_diagnostics.get(index, {}).get(
                    "nearestCompetingCentroidCosine"
                ),
                "centroidMargin": member_diagnostics.get(index, {}).get(
                    "centroidMargin"
                ),
            }
            for index, segment in enumerate(segments)
        ]
        manifest = {
            "schemaVersion": SCHEMA_VERSION,
            "status": PROOF_STATUS,
            "planSha256": plan["planSha256"],
            "plan": plan,
            "selection": plan["selection"],
            "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
            "segmentationPolicy": copy.deepcopy(SEGMENTATION_POLICY),
            "executionTools": execution,
            "packages": {
                name: importlib.metadata.version(name)
                for name in ("dots.tts", "numpy", "torch")
            },
            "embeddings": {
                "path": "embeddings.json",
                "sha256": sha256_file(embeddings_path),
                "count": len(embeddings),
                "dimension": core.EMBEDDING_DIMENSION,
            },
            "clusters": cluster_records,
            "unclusteredSegmentCount": sum(
                cluster_id is None for cluster_id in assignment.values()
            ),
            "segments": segment_records,
            "resumeVerified": False,
        }
        atomic_json(temporary / "manifest.json", manifest)
        _verify_resume(temporary, plan, execution)
        temporary.replace(output)
        return manifest
    except Exception:
        shutil.rmtree(temporary, ignore_errors=True)
        raise


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    queue = subparsers.add_parser(
        "queue", help="build the deterministic 29-video queue"
    )
    queue.add_argument("--max-segments", type=int, default=MAX_SEGMENTS)
    queue.add_argument("--write", action="store_true")
    plan = subparsers.add_parser("plan", help="build one executable video plan")
    plan.add_argument("--dialogue", required=True)
    plan.add_argument("--video-id", required=True)
    plan.add_argument("--max-segments", type=int, default=MAX_SEGMENTS)
    plan.add_argument("--write", action="store_true")
    verify = subparsers.add_parser(
        "verify-queue", help="rebuild and verify the saved queue"
    )
    verify.add_argument("path", type=Path, nargs="?", default=QUEUE_PATH)
    execute = subparsers.add_parser(
        "execute-plan", help="execute one immutable plan on the GPU host"
    )
    execute.add_argument("path", type=Path)
    execute.add_argument("--cache-dir", type=Path, required=True)
    execute.add_argument("--expect-plan-sha256")
    return parser


def main() -> int:
    args = _build_parser().parse_args()
    if args.command == "queue":
        result = build_queue(max_segments=args.max_segments)
        if args.write:
            write_queue(result)
    elif args.command == "plan":
        registry, _, _ = _registry_payload()
        selection = select_video(
            registry_selections(registry),
            dialogue=args.dialogue,
            video_id=args.video_id,
        )
        result = build_plan(selection, max_segments=args.max_segments)
        if args.write:
            write_plan_artifact(result)
    elif args.command == "verify-queue":
        result = verify_queue_artifact(args.path)
    else:
        plan = load_plan_artifact(args.path, expected_sha256=args.expect_plan_sha256)
        result = execute_plan(plan, cache_dir=args.cache_dir)
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
