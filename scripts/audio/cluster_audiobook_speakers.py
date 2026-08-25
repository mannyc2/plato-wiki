#!/usr/bin/env python3
"""Cluster a pinned audiobook into anonymous Dots CAM++ speaker groups.

Dry planning is the default. The workflow deliberately ignores caption text
after deriving word timings and never assigns a cluster to a character.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import os
import random
import re
import shlex
import shutil
import statistics
import subprocess
import tempfile
import wave
from dataclasses import asdict, dataclass
from pathlib import Path, PurePosixPath
from typing import Any, Sequence


VIDEO_ID = "MNDfJMrH1XY"
SOURCE_URL = f"https://www.youtube.com/watch?v={VIDEO_ID}"
DEFAULT_SOURCE = Path(f"scratch/audio-references/source-cache/{VIDEO_ID}.media")
DEFAULT_CAPTIONS = Path(
    f"scratch/audio-references/caption-cache/{VIDEO_ID}.en-orig.json3"
)
DEFAULT_OUTPUT = Path(f"scratch/audio-speaker-clusters/{VIDEO_ID}")
REFERENCE_SOURCES = Path("audio/reference-sources.json")
PLAN_ARTIFACT_ROOT = Path(f"scratch/audio-speaker-cluster-plans/{VIDEO_ID}")
MODEL_REPOSITORY = "rednote-hilab/dots.tts-soar"
MODEL_REVISION = "e3520f75254d0020a0406db31c51a79d00d22d55"
DOTS_SOURCE_COMMIT = "5ed719e3d36f5a3f6d8037ca9a7009d4fd0520ba"
REMOTE_ROOT = Path("/mnt/models/dev/plato-audio")
REMOTE_PYTHON = Path("/mnt/models/dev/plato-dots/.venv/bin/python")
REMOTE_CACHE = Path("/mnt/models/hf")
SCRIPT_RELATIVE_PATH = Path("scripts/audio/cluster_audiobook_speakers.py")
SILENCE_NOISE_DB = -42.0
SILENCE_MIN_SECONDS = 0.32
CAPTION_GAP_SECONDS = 0.48
MIN_SEGMENT_SECONDS = 3.0
TARGET_SEGMENT_SECONDS = 6.0
MAX_SEGMENT_SECONDS = 8.5
MIN_TIMED_WORDS = 5
MAX_SEGMENTS = 240
CLUSTER_THRESHOLD = 0.72
MIN_CLUSTER_SIZE = 3
REPRESENTATIVES_PER_CLUSTER = 2
AUDIT_REPRESENTATIVES_PER_CLUSTER = 1
CLIP_SAMPLE_RATE = 48_000
EMBEDDING_DIMENSION = 512
EMBEDDING_SEED = 0
MAX_SOURCE_BYTES = 64 * 1024 * 1024
SOURCE_DURATION_TOLERANCE_SECONDS = 5.0
SCHEMA_VERSION = 1
_WORD = re.compile(r"[A-Za-z0-9]+")
_SILENCE_START = re.compile(r"silence_start:\s*([0-9.]+)")
_SILENCE_END = re.compile(
    r"silence_end:\s*([0-9.]+)\s*\|\s*silence_duration:\s*([0-9.]+)"
)
_SHA256 = re.compile(r"[0-9a-f]{64}")
_SEGMENT_ID = re.compile(r"segment-[0-9]{4}")
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
EMBEDDING_DETERMINISM = {
    "seed": EMBEDDING_SEED,
    "cublasWorkspaceConfig": ":4096:8",
    "torchDeterministicAlgorithms": True,
    "cudnnBenchmark": False,
    "cudnnDeterministic": True,
}


class SpeakerClusterError(ValueError):
    """Raised when the anonymous clustering proof cannot be reproduced safely."""


@dataclass(frozen=True)
class Silence:
    start_seconds: float
    end_seconds: float


@dataclass(frozen=True)
class Boundary:
    seconds: float
    kind: str


@dataclass(frozen=True)
class Segment:
    segment_id: str
    start_seconds: float
    end_seconds: float
    start_boundary: str
    end_boundary: str
    timed_word_count: int

    @property
    def duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def plan_sha256(plan: dict[str, Any]) -> str:
    payload = {
        key: value for key, value in plan.items() if key not in _PLAN_OPERATIONAL_FIELDS
    }
    return sha256_bytes(canonical_json(payload))


def plan_artifact_path(plan_hash: str) -> Path:
    if _SHA256.fullmatch(plan_hash) is None:
        raise SpeakerClusterError("plan SHA-256 is malformed")
    return PLAN_ARTIFACT_ROOT / f"{plan_hash}.json"


def atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def write_plan_artifact(plan: dict[str, Any]) -> Path:
    validate_plan(plan)
    path = Path(plan["planArtifact"])
    expected = plan_artifact_path(plan["planSha256"])
    if path != expected:
        raise SpeakerClusterError("plan artifact path is not content-addressed")
    encoded = json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if not path.is_file() or path.read_text(encoding="utf-8") != encoded:
            raise SpeakerClusterError(f"existing plan artifact differs: {path}")
        return path
    atomic_json(path, plan)
    return path


def parse_caption_word_times(path: Path) -> tuple[int, ...]:
    """Return sorted word-start milliseconds without retaining caption text."""

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpeakerClusterError(f"cannot read caption JSON3 {path}: {error}") from error
    events = payload.get("events") if isinstance(payload, dict) else None
    if not isinstance(events, list):
        raise SpeakerClusterError("caption JSON3 has no events array")
    starts: set[int] = set()
    previous_event_start = -1
    for event_index, event in enumerate(events):
        if not isinstance(event, dict):
            raise SpeakerClusterError(f"caption event {event_index} is not an object")
        segments = event.get("segs")
        if segments is None:
            continue
        event_start = event.get("tStartMs")
        if not isinstance(segments, list) or not isinstance(event_start, (int, float)):
            raise SpeakerClusterError(f"caption event {event_index} has malformed timing")
        if not math.isfinite(event_start) or event_start < 0 or event_start < previous_event_start:
            raise SpeakerClusterError(f"caption event {event_index} moves backwards")
        previous_event_start = round(event_start)
        for segment_index, segment in enumerate(segments):
            if not isinstance(segment, dict) or not isinstance(segment.get("utf8"), str):
                raise SpeakerClusterError(
                    f"caption event {event_index} segment {segment_index} is malformed"
                )
            # Text is inspected only to count lexical timing points. It is never
            # returned, persisted, embedded, or used for speaker identity.
            word_count = len(_WORD.findall(segment["utf8"]))
            if word_count == 0:
                continue
            offset = segment.get("tOffsetMs", 0)
            if not isinstance(offset, (int, float)) or not math.isfinite(offset) or offset < 0:
                raise SpeakerClusterError(
                    f"caption event {event_index} segment {segment_index} has invalid offset"
                )
            timestamp = round(event_start + offset)
            # A segment may contain more than one space-separated word at one
            # caption timing point. Preserve the point once, not the words.
            starts.add(timestamp)
    ordered = tuple(sorted(starts))
    if len(ordered) < MIN_TIMED_WORDS:
        raise SpeakerClusterError("caption JSON3 has too few timed lexical points")
    return ordered


def parse_silence_log(text: str, *, media_duration: float) -> tuple[Silence, ...]:
    if media_duration <= 0:
        raise SpeakerClusterError("media duration must be positive")
    result: list[Silence] = []
    pending: float | None = None
    for line in text.splitlines():
        start_match = _SILENCE_START.search(line)
        if start_match:
            pending = float(start_match.group(1))
            continue
        end_match = _SILENCE_END.search(line)
        if not end_match:
            continue
        end = float(end_match.group(1))
        duration = float(end_match.group(2))
        start = pending if pending is not None else end - duration
        pending = None
        start = max(0.0, start)
        end = min(media_duration, end)
        if end > start and end - start + 1e-6 >= SILENCE_MIN_SECONDS:
            result.append(Silence(round(start, 6), round(end, 6)))
    if pending is not None and media_duration - pending >= SILENCE_MIN_SECONDS:
        result.append(Silence(round(pending, 6), round(media_duration, 6)))
    return tuple(sorted(result, key=lambda item: (item.start_seconds, item.end_seconds)))


def candidate_boundaries(
    word_times_ms: Sequence[int], silences: Sequence[Silence], media_duration: float
) -> tuple[Boundary, ...]:
    if not word_times_ms or media_duration <= 0:
        raise SpeakerClusterError("word timings and media duration are required")
    by_millisecond: dict[int, Boundary] = {
        0: Boundary(0.0, "media-edge"),
        round(media_duration * 1000): Boundary(round(media_duration, 6), "media-edge"),
    }
    for silence in silences:
        midpoint = round((silence.start_seconds + silence.end_seconds) / 2, 6)
        by_millisecond[round(midpoint * 1000)] = Boundary(midpoint, "silence")
    for left, right in zip(word_times_ms, word_times_ms[1:], strict=False):
        gap = (right - left) / 1000
        if gap < CAPTION_GAP_SECONDS:
            continue
        midpoint = round((left + right) / 2000, 6)
        key = round(midpoint * 1000)
        # Silence is stronger evidence than a timing gap at the same boundary.
        if key not in by_millisecond:
            by_millisecond[key] = Boundary(midpoint, "caption-gap")
    return tuple(sorted(by_millisecond.values(), key=lambda item: (item.seconds, item.kind)))


def _word_count(word_times_ms: Sequence[int], start: float, end: float) -> int:
    start_ms = round(start * 1000)
    end_ms = round(end * 1000)
    return sum(start_ms <= value < end_ms for value in word_times_ms)


def build_segments(
    word_times_ms: Sequence[int],
    boundaries: Sequence[Boundary],
    *,
    max_segments: int = MAX_SEGMENTS,
) -> tuple[Segment, ...]:
    if not 1 <= max_segments <= MAX_SEGMENTS:
        raise SpeakerClusterError(f"max_segments must be between 1 and {MAX_SEGMENTS}")
    first_word = word_times_ms[0] / 1000
    last_word = word_times_ms[-1] / 1000
    usable = [
        boundary
        for boundary in boundaries
        if boundary.seconds <= last_word + MAX_SEGMENT_SECONDS
        and boundary.seconds >= max(0.0, first_word - MAX_SEGMENT_SECONDS)
    ]
    if len(usable) < 2:
        raise SpeakerClusterError("no usable caption-safe boundaries")

    candidates: list[Segment] = []
    cursor = 0
    while cursor < len(usable) - 1:
        start = usable[cursor]
        choices = [
            (index, boundary)
            for index, boundary in enumerate(usable[cursor + 1 :], start=cursor + 1)
            if MIN_SEGMENT_SECONDS
            <= boundary.seconds - start.seconds
            <= MAX_SEGMENT_SECONDS
        ]
        if not choices:
            cursor += 1
            continue
        end_index, end = min(
            choices,
            key=lambda item: (
                abs((item[1].seconds - start.seconds) - TARGET_SEGMENT_SECONDS),
                0 if item[1].kind == "silence" else 1,
                item[1].seconds,
            ),
        )
        count = _word_count(word_times_ms, start.seconds, end.seconds)
        if count >= MIN_TIMED_WORDS:
            candidates.append(
                Segment(
                    segment_id=f"segment-{len(candidates) + 1:04d}",
                    start_seconds=round(start.seconds, 6),
                    end_seconds=round(end.seconds, 6),
                    start_boundary=start.kind,
                    end_boundary=end.kind,
                    timed_word_count=count,
                )
            )
            cursor = end_index
        else:
            cursor += 1
    if not candidates:
        raise SpeakerClusterError("segmentation produced no speech candidates")
    if len(candidates) <= max_segments:
        return tuple(candidates)
    selected_indices = sorted(
        {
            min(
                len(candidates) - 1,
                math.floor((index + 0.5) * len(candidates) / max_segments),
            )
            for index in range(max_segments)
        }
    )
    return tuple(candidates[index] for index in selected_indices)


def ffprobe_media(source: Path) -> tuple[float, int]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration,size",
            "-of",
            "json",
            str(source),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SpeakerClusterError(f"ffprobe failed: {(result.stderr or result.stdout).strip()}")
    try:
        record = json.loads(result.stdout)["format"]
        duration = float(record["duration"])
        size = int(record["size"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as error:
        raise SpeakerClusterError("ffprobe returned malformed media metadata") from error
    if duration <= 0 or size <= 0:
        raise SpeakerClusterError("source media must be non-empty")
    return duration, size


def detect_silences(source: Path, media_duration: float) -> tuple[Silence, ...]:
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-nostdin",
            "-i",
            str(source),
            "-af",
            f"silencedetect=noise={SILENCE_NOISE_DB:g}dB:d={SILENCE_MIN_SECONDS:g}",
            "-f",
            "null",
            "-",
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SpeakerClusterError(f"ffmpeg silencedetect failed: {result.stderr.strip()}")
    return parse_silence_log(result.stderr, media_duration=media_duration)


def ffmpeg_version() -> str:
    result = subprocess.run(
        ["ffmpeg", "-version"], check=False, capture_output=True, text=True
    )
    if result.returncode != 0 or not result.stdout.splitlines():
        raise SpeakerClusterError("ffmpeg version is unavailable")
    return result.stdout.splitlines()[0].strip()


def _validate_pinned_paths(source: Path, captions: Path) -> None:
    if source != DEFAULT_SOURCE or captions != DEFAULT_CAPTIONS:
        raise SpeakerClusterError(
            "this proof requires the exact pinned source and caption cache paths"
        )
    if not source.is_file() or not captions.is_file():
        raise SpeakerClusterError("pinned source media and captions must exist")
    for label, path in (("source", source), ("captions", captions)):
        absolute = path if path.is_absolute() else Path.cwd() / path
        if absolute.is_symlink() or absolute.resolve() != absolute.absolute():
            raise SpeakerClusterError(f"pinned {label} path may not traverse a symlink")


def _validate_output_path(output_dir: Path) -> None:
    if output_dir != DEFAULT_OUTPUT:
        raise SpeakerClusterError("this proof requires the exact pinned scratch output path")
    absolute = output_dir if output_dir.is_absolute() else Path.cwd() / output_dir
    if absolute.resolve(strict=False) != absolute.absolute():
        raise SpeakerClusterError("output path may not escape through a symlinked parent")
    for path in (absolute, *absolute.parents):
        if path.exists() and path.is_symlink():
            raise SpeakerClusterError("output path may not contain symlinks")
        if path == Path(path.anchor):
            break


def pinned_registry_source() -> tuple[dict[str, Any], str]:
    if REFERENCE_SOURCES != Path("audio/reference-sources.json") and not REFERENCE_SOURCES.is_absolute():
        raise SpeakerClusterError("reference source registry path is invalid")
    if not REFERENCE_SOURCES.is_file() or REFERENCE_SOURCES.is_symlink():
        raise SpeakerClusterError("reference source registry is missing or symlinked")
    try:
        payload = json.loads(REFERENCE_SOURCES.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpeakerClusterError(f"cannot read reference source registry: {error}") from error
    dialogues = payload.get("dialogues") if isinstance(payload, dict) else None
    matches = [
        video
        for dialogue in dialogues or []
        if isinstance(dialogue, dict) and dialogue.get("dialogue") == "crito"
        for video in dialogue.get("videos", [])
        if isinstance(video, dict) and video.get("videoId") == VIDEO_ID
    ]
    if len(matches) != 1:
        raise SpeakerClusterError("reference source registry does not uniquely pin Crito")
    video = matches[0]
    if (
        set(video) != {"videoId", "title", "durationSeconds", "url"}
        or video["videoId"] != VIDEO_ID
        or video["url"] != SOURCE_URL
        or not isinstance(video["title"], str)
        or not video["title"]
        or isinstance(video["durationSeconds"], bool)
        or not isinstance(video["durationSeconds"], int)
        or video["durationSeconds"] <= 0
    ):
        raise SpeakerClusterError("Crito registry video metadata is malformed")
    return dict(video), sha256_file(REFERENCE_SOURCES)


def _plan_operations(plan: dict[str, Any]) -> dict[str, str]:
    plan_hash = plan["planSha256"]
    artifact = plan_artifact_path(plan_hash)
    relative_script = SCRIPT_RELATIVE_PATH.as_posix()
    source = str(plan["source"]["materializedEvidence"]["path"])
    registry = str(plan["source"]["registry"]["path"])
    captions = str(plan["captions"]["path"])
    output_dir = str(plan["outputDirectory"])
    arguments = [
        str(REMOTE_PYTHON),
        relative_script,
        "--execute-plan",
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
                relative_script,
                registry,
                source,
                captions,
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
                f"gpu:{REMOTE_ROOT}/{output_dir}/",
                f"{output_dir}/",
            ]
        ),
    }


def build_plan(
    *,
    source: Path,
    captions: Path,
    output_dir: Path,
    max_segments: int = MAX_SEGMENTS,
    expected_source_sha256: str | None = None,
    expected_caption_sha256: str | None = None,
    expected_script_sha256: str | None = None,
) -> dict[str, Any]:
    _validate_pinned_paths(source, captions)
    _validate_output_path(output_dir)
    if not 1 <= max_segments <= MAX_SEGMENTS:
        raise SpeakerClusterError(f"max_segments must be between 1 and {MAX_SEGMENTS}")
    registry_video, registry_hash = pinned_registry_source()
    source_hash = sha256_file(source)
    caption_hash = sha256_file(captions)
    script_hash = sha256_file(Path(__file__).resolve())
    for label, expected, actual in (
        ("source", expected_source_sha256, source_hash),
        ("caption", expected_caption_sha256, caption_hash),
        ("script", expected_script_sha256, script_hash),
    ):
        if expected is not None and expected != actual:
            raise SpeakerClusterError(
                f"{label} SHA-256 mismatch: expected {expected}, got {actual}"
            )
    duration, size = ffprobe_media(source)
    if size > MAX_SOURCE_BYTES:
        raise SpeakerClusterError("materialized source exceeds the pinned byte ceiling")
    if abs(duration - registry_video["durationSeconds"]) > SOURCE_DURATION_TOLERANCE_SECONDS:
        raise SpeakerClusterError("materialized source duration disagrees with the registry")
    word_times = parse_caption_word_times(captions)
    silences = detect_silences(source, duration)
    boundaries = candidate_boundaries(word_times, silences, duration)
    segments = build_segments(word_times, boundaries, max_segments=max_segments)
    parameters = {
        "silenceNoiseDb": SILENCE_NOISE_DB,
        "silenceMinimumSeconds": SILENCE_MIN_SECONDS,
        "captionGapSeconds": CAPTION_GAP_SECONDS,
        "minimumSegmentSeconds": MIN_SEGMENT_SECONDS,
        "targetSegmentSeconds": TARGET_SEGMENT_SECONDS,
        "maximumSegmentSeconds": MAX_SEGMENT_SECONDS,
        "minimumTimedWords": MIN_TIMED_WORDS,
        "maximumSegments": max_segments,
        "clusterCosineThreshold": CLUSTER_THRESHOLD,
        "minimumClusterSize": MIN_CLUSTER_SIZE,
        "representativesPerCluster": REPRESENTATIVES_PER_CLUSTER,
        "auditRepresentativesPerCluster": AUDIT_REPRESENTATIVES_PER_CLUSTER,
    }
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
        "status": "anonymous-speaker-cluster-plan",
        "identityPolicy": IDENTITY_POLICY,
        "segmentationPolicy": SEGMENTATION_POLICY,
        "source": {
            "registry": {
                "path": REFERENCE_SOURCES.as_posix(),
                "sha256": registry_hash,
                "dialogue": "crito",
                "video": registry_video,
            },
            "materializedEvidence": {
                "claim": "local-bytes-hash-only",
                "path": source.as_posix(),
                "sha256": source_hash,
                "bytes": size,
                "durationSeconds": round(duration, 6),
            },
        },
        "captions": {
            "path": captions.as_posix(),
            "sha256": caption_hash,
            "timedWordPoints": len(word_times),
            "textUsedForIdentity": False,
        },
        "segmentation": {
            "parameters": parameters,
            "silenceCount": len(silences),
            "candidateBoundaryCount": len(boundaries),
            "selectedBoundaryCounts": boundary_counts,
            "segments": [asdict(segment) for segment in segments],
        },
        "embedding": {
            "modelRepository": MODEL_REPOSITORY,
            "modelRevision": MODEL_REVISION,
            "dotsSourceCommit": DOTS_SOURCE_COMMIT,
            "encoder": "CAM++ speaker x-vector",
            "runtimePrecision": "bfloat16",
            "embeddingDtype": "float32",
            "normalized": True,
            "determinism": EMBEDDING_DETERMINISM,
        },
        "tools": {
            "scriptPath": SCRIPT_RELATIVE_PATH.as_posix(),
            "scriptSha256": script_hash,
            "segmentationFfmpeg": ffmpeg_version(),
        },
        "outputDirectory": output_dir.as_posix(),
    }
    plan_hash = plan_sha256(plan)
    plan["planSha256"] = plan_hash
    plan.update(_plan_operations(plan))
    if plan_sha256(plan) != plan_hash:
        raise SpeakerClusterError("plan hash changed while adding operational commands")
    return plan


def _expect_keys(value: Any, expected: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != expected:
        raise SpeakerClusterError(f"{label} has an invalid shape")
    return value


def _number(value: Any, label: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise SpeakerClusterError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result):
        raise SpeakerClusterError(f"{label} must be finite")
    return result


def _sha(value: Any, label: str) -> str:
    if not isinstance(value, str) or _SHA256.fullmatch(value) is None:
        raise SpeakerClusterError(f"{label} must be a lowercase SHA-256")
    return value


def validate_plan(plan: Any) -> tuple[Segment, ...]:
    top = _expect_keys(
        plan,
        {
            "schemaVersion",
            "status",
            "identityPolicy",
            "segmentationPolicy",
            "source",
            "captions",
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
    if top["schemaVersion"] != SCHEMA_VERSION or top["status"] != "anonymous-speaker-cluster-plan":
        raise SpeakerClusterError("plan schema or status is unsupported")
    if top["identityPolicy"] != IDENTITY_POLICY or top["segmentationPolicy"] != SEGMENTATION_POLICY:
        raise SpeakerClusterError("plan safety policy was changed")
    expected_hash = _sha(top["planSha256"], "planSha256")
    if plan_sha256(top) != expected_hash:
        raise SpeakerClusterError("plan SHA-256 does not match its exact segments and inputs")
    operations = _plan_operations(top)
    if any(top[key] != value for key, value in operations.items()):
        raise SpeakerClusterError("plan artifact path or GPU commands were changed")

    source = _expect_keys(
        top["source"],
        {"registry", "materializedEvidence"},
        "plan source",
    )
    registry = _expect_keys(
        source["registry"], {"path", "sha256", "dialogue", "video"}, "source registry"
    )
    video = _expect_keys(
        registry["video"],
        {"videoId", "title", "durationSeconds", "url"},
        "source registry video",
    )
    if (
        registry["path"] != REFERENCE_SOURCES.as_posix()
        or registry["dialogue"] != "crito"
        or video["videoId"] != VIDEO_ID
        or video["url"] != SOURCE_URL
        or not isinstance(video["title"], str)
        or not video["title"]
        or isinstance(video["durationSeconds"], bool)
        or not isinstance(video["durationSeconds"], int)
        or video["durationSeconds"] <= 0
    ):
        raise SpeakerClusterError("plan registry source metadata is invalid")
    _sha(registry["sha256"], "plan registry SHA-256")
    materialized = _expect_keys(
        source["materializedEvidence"],
        {"claim", "path", "sha256", "bytes", "durationSeconds"},
        "materialized source evidence",
    )
    if (
        materialized["claim"] != "local-bytes-hash-only"
        or materialized["path"] != DEFAULT_SOURCE.as_posix()
    ):
        raise SpeakerClusterError("materialized source evidence path or claim is invalid")
    _sha(materialized["sha256"], "materialized source SHA-256")
    if (
        isinstance(materialized["bytes"], bool)
        or not isinstance(materialized["bytes"], int)
        or not 0 < materialized["bytes"] <= MAX_SOURCE_BYTES
    ):
        raise SpeakerClusterError("plan source byte count is invalid")
    duration = _number(materialized["durationSeconds"], "plan source duration")
    if duration <= 0:
        raise SpeakerClusterError("plan source duration is invalid")
    if abs(duration - video["durationSeconds"]) > SOURCE_DURATION_TOLERANCE_SECONDS:
        raise SpeakerClusterError("plan source duration disagrees with the registry")

    captions = _expect_keys(
        top["captions"],
        {"path", "sha256", "timedWordPoints", "textUsedForIdentity"},
        "plan captions",
    )
    if captions["path"] != DEFAULT_CAPTIONS.as_posix():
        raise SpeakerClusterError("plan caption path is invalid")
    _sha(captions["sha256"], "plan caption SHA-256")
    if (
        isinstance(captions["timedWordPoints"], bool)
        or not isinstance(captions["timedWordPoints"], int)
        or captions["timedWordPoints"] < MIN_TIMED_WORDS
        or captions["textUsedForIdentity"] is not False
    ):
        raise SpeakerClusterError("plan caption provenance is invalid")

    if top["embedding"] != {
        "modelRepository": MODEL_REPOSITORY,
        "modelRevision": MODEL_REVISION,
        "dotsSourceCommit": DOTS_SOURCE_COMMIT,
        "encoder": "CAM++ speaker x-vector",
        "runtimePrecision": "bfloat16",
        "embeddingDtype": "float32",
        "normalized": True,
        "determinism": EMBEDDING_DETERMINISM,
    }:
        raise SpeakerClusterError("plan embedding provenance is invalid")
    tools = _expect_keys(
        top["tools"],
        {"scriptPath", "scriptSha256", "segmentationFfmpeg"},
        "plan tools",
    )
    if tools["scriptPath"] != SCRIPT_RELATIVE_PATH.as_posix():
        raise SpeakerClusterError("plan script path is invalid")
    _sha(tools["scriptSha256"], "plan script SHA-256")
    if not isinstance(tools["segmentationFfmpeg"], str) or not tools["segmentationFfmpeg"]:
        raise SpeakerClusterError("plan segmentation ffmpeg version is invalid")
    if top["outputDirectory"] != DEFAULT_OUTPUT.as_posix():
        raise SpeakerClusterError("plan output directory is invalid")

    segmentation = _expect_keys(
        top["segmentation"],
        {
            "parameters",
            "silenceCount",
            "candidateBoundaryCount",
            "selectedBoundaryCounts",
            "segments",
        },
        "plan segmentation",
    )
    parameters = segmentation["parameters"]
    if not isinstance(parameters, dict):
        raise SpeakerClusterError("plan segmentation parameters are invalid")
    maximum_segments = parameters.get("maximumSegments")
    if (
        isinstance(maximum_segments, bool)
        or not isinstance(maximum_segments, int)
        or not 1 <= maximum_segments <= MAX_SEGMENTS
    ):
        raise SpeakerClusterError("plan maximum segment count is invalid")
    if parameters != {
        "silenceNoiseDb": SILENCE_NOISE_DB,
        "silenceMinimumSeconds": SILENCE_MIN_SECONDS,
        "captionGapSeconds": CAPTION_GAP_SECONDS,
        "minimumSegmentSeconds": MIN_SEGMENT_SECONDS,
        "targetSegmentSeconds": TARGET_SEGMENT_SECONDS,
        "maximumSegmentSeconds": MAX_SEGMENT_SECONDS,
        "minimumTimedWords": MIN_TIMED_WORDS,
        "maximumSegments": maximum_segments,
        "clusterCosineThreshold": CLUSTER_THRESHOLD,
        "minimumClusterSize": MIN_CLUSTER_SIZE,
        "representativesPerCluster": REPRESENTATIVES_PER_CLUSTER,
        "auditRepresentativesPerCluster": AUDIT_REPRESENTATIVES_PER_CLUSTER,
    }:
        raise SpeakerClusterError("plan segmentation parameters were changed")
    if (
        isinstance(segmentation["silenceCount"], bool)
        or not isinstance(segmentation["silenceCount"], int)
        or segmentation["silenceCount"] < 0
        or isinstance(segmentation["candidateBoundaryCount"], bool)
        or not isinstance(segmentation["candidateBoundaryCount"], int)
        or segmentation["candidateBoundaryCount"] < 2
    ):
        raise SpeakerClusterError("plan boundary counts are invalid")
    records = segmentation["segments"]
    if not isinstance(records, list) or not 0 < len(records) <= maximum_segments:
        raise SpeakerClusterError("plan segment list is invalid")
    segments: list[Segment] = []
    allowed_boundaries = {"media-edge", "silence", "caption-gap"}
    previous_end = -1.0
    previous_number = -1
    for index, record in enumerate(records):
        value = _expect_keys(
            record,
            {
                "segment_id",
                "start_seconds",
                "end_seconds",
                "start_boundary",
                "end_boundary",
                "timed_word_count",
            },
            f"plan segment {index}",
        )
        segment_id = value["segment_id"]
        if not isinstance(segment_id, str) or _SEGMENT_ID.fullmatch(segment_id) is None:
            raise SpeakerClusterError(f"plan segment {index} has an invalid id")
        number = int(segment_id.rsplit("-", 1)[1])
        start = _number(value["start_seconds"], f"plan segment {index} start")
        end = _number(value["end_seconds"], f"plan segment {index} end")
        word_count = value["timed_word_count"]
        if (
            number <= previous_number
            or start < previous_end
            or start < 0
            or end > duration
            or not MIN_SEGMENT_SECONDS <= end - start <= MAX_SEGMENT_SECONDS
            or value["start_boundary"] not in allowed_boundaries
            or value["end_boundary"] not in allowed_boundaries
            or isinstance(word_count, bool)
            or not isinstance(word_count, int)
            or word_count < MIN_TIMED_WORDS
        ):
            raise SpeakerClusterError(f"plan segment {index} violates segmentation invariants")
        segments.append(
            Segment(segment_id, start, end, value["start_boundary"], value["end_boundary"], word_count)
        )
        previous_end = end
        previous_number = number
    counts = segmentation["selectedBoundaryCounts"]
    expected_counts = {
        side: {
            kind: sum(getattr(segment, f"{side}_boundary") == kind for segment in segments)
            for kind in allowed_boundaries
        }
        for side in ("start", "end")
    }
    if counts != expected_counts:
        raise SpeakerClusterError("plan selected boundary diagnostics do not match segments")
    return tuple(segments)


def load_plan_artifact(path: Path, *, expected_plan_sha256: str | None = None) -> dict[str, Any]:
    try:
        plan = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpeakerClusterError(f"cannot read execution plan {path}: {error}") from error
    validate_plan(plan)
    plan_hash = plan["planSha256"]
    if expected_plan_sha256 is not None and expected_plan_sha256 != plan_hash:
        raise SpeakerClusterError("execution plan does not match --expect-plan-sha256")
    expected_path = PurePosixPath(plan["planArtifact"])
    supplied = PurePosixPath(path.as_posix())
    if supplied.name != expected_path.name or tuple(supplied.parts[-len(expected_path.parts) :]) != expected_path.parts:
        raise SpeakerClusterError("execution plan was not loaded from its content-addressed path")
    return plan


def validate_execution_inputs(plan: dict[str, Any]) -> tuple[Segment, ...]:
    segments = validate_plan(plan)
    materialized = plan["source"]["materializedEvidence"]
    registry = plan["source"]["registry"]
    source = Path(materialized["path"])
    captions = Path(plan["captions"]["path"])
    _validate_pinned_paths(source, captions)
    _validate_output_path(Path(plan["outputDirectory"]))
    registry_video, registry_hash = pinned_registry_source()
    if registry["video"] != registry_video:
        raise SpeakerClusterError("plan registry metadata differs from the pinned registry")
    for label, path, expected in (
        ("registry", REFERENCE_SOURCES, registry["sha256"]),
        ("source", source, materialized["sha256"]),
        ("caption", captions, plan["captions"]["sha256"]),
        ("script", Path(__file__).resolve(), plan["tools"]["scriptSha256"]),
    ):
        actual = sha256_file(path)
        if actual != expected:
            raise SpeakerClusterError(
                f"{label} SHA-256 mismatch before model load: expected {expected}, got {actual}"
            )
    if registry_hash != registry["sha256"]:
        raise SpeakerClusterError("reference source registry hash changed before model load")
    return segments


def installed_dots_source_commit() -> str:
    try:
        direct_url = importlib.metadata.distribution("dots.tts").read_text("direct_url.json")
        payload = json.loads(direct_url or "")
        commit = payload["vcs_info"]["commit_id"]
    except (importlib.metadata.PackageNotFoundError, KeyError, TypeError, json.JSONDecodeError) as error:
        raise SpeakerClusterError("cannot verify the installed dots.tts source commit") from error
    if commit != DOTS_SOURCE_COMMIT:
        raise SpeakerClusterError(
            f"installed dots.tts commit mismatch: expected {DOTS_SOURCE_COMMIT}, got {commit}"
        )
    return commit


def execution_runtime_facts() -> dict[str, str]:
    import torch

    if not torch.cuda.is_available():
        raise SpeakerClusterError("CUDA is required for execution provenance")
    return {
        "torch": str(torch.__version__),
        "cuda": str(torch.version.cuda),
        "gpu": torch.cuda.get_device_name(torch.cuda.current_device()),
    }


def execution_tools(
    plan: dict[str, Any],
    ffmpeg: str,
    dots_commit: str,
    runtime: dict[str, str] | None = None,
) -> dict[str, Any]:
    if not ffmpeg:
        raise SpeakerClusterError("execution ffmpeg version is unavailable")
    if dots_commit != DOTS_SOURCE_COMMIT:
        raise SpeakerClusterError("execution dots.tts commit is not pinned")
    facts = execution_runtime_facts() if runtime is None else runtime
    if set(facts) != {"torch", "cuda", "gpu"} or any(
        not isinstance(value, str) or not value for value in facts.values()
    ):
        raise SpeakerClusterError("execution runtime provenance is invalid")
    segmentation_ffmpeg = plan["tools"]["segmentationFfmpeg"]
    return {
        "ffmpeg": ffmpeg,
        "segmentationFfmpeg": segmentation_ffmpeg,
        "ffmpegMatchesSegmentation": ffmpeg == segmentation_ffmpeg,
        "dotsSourceCommit": dots_commit,
        "torch": facts["torch"],
        "cuda": facts["cuda"],
        "gpu": facts["gpu"],
        "embeddingDeterminism": EMBEDDING_DETERMINISM,
    }


def _normalize(vector: Sequence[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    if not math.isfinite(norm) or norm <= 0:
        raise SpeakerClusterError("speaker embedding has zero or invalid norm")
    return [value / norm for value in vector]


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    return sum(a * b for a, b in zip(left, right, strict=True))


def cluster_embeddings(
    embeddings: Sequence[Sequence[float]],
    *,
    threshold: float = CLUSTER_THRESHOLD,
) -> tuple[tuple[int, ...], ...]:
    """Deterministic online-centroid clustering followed by centroid merges."""

    if not embeddings or not 0 < threshold < 1:
        raise SpeakerClusterError("embeddings and a cosine threshold in (0,1) are required")
    dimensions = {len(vector) for vector in embeddings}
    if len(dimensions) != 1 or next(iter(dimensions)) == 0:
        raise SpeakerClusterError("speaker embeddings must share one non-zero dimension")
    normalized = [_normalize(vector) for vector in embeddings]
    clusters: list[list[int]] = []
    centroids: list[list[float]] = []

    def centroid(members: Sequence[int]) -> list[float]:
        return _normalize(
            [
                sum(normalized[index][dimension] for index in members) / len(members)
                for dimension in range(len(normalized[0]))
            ]
        )

    for index, vector in enumerate(normalized):
        if not clusters:
            clusters.append([index])
            centroids.append(list(vector))
            continue
        scored = [(_cosine(vector, value), cluster_index) for cluster_index, value in enumerate(centroids)]
        similarity, cluster_index = max(scored, key=lambda item: (item[0], -item[1]))
        if similarity >= threshold:
            clusters[cluster_index].append(index)
            centroids[cluster_index] = centroid(clusters[cluster_index])
        else:
            clusters.append([index])
            centroids.append(list(vector))

    while len(clusters) > 1:
        pairs = [
            (_cosine(centroids[left], centroids[right]), left, right)
            for left in range(len(clusters))
            for right in range(left + 1, len(clusters))
        ]
        similarity, left, right = max(
            pairs,
            key=lambda item: (item[0], -clusters[item[1]][0], -clusters[item[2]][0]),
        )
        if similarity < threshold:
            break
        clusters[left].extend(clusters[right])
        clusters[left].sort()
        centroids[left] = centroid(clusters[left])
        del clusters[right]
        del centroids[right]
    return tuple(tuple(members) for members in sorted(clusters, key=lambda item: item[0]))


def representative_indices(
    cluster: Sequence[int], embeddings: Sequence[Sequence[float]], count: int
) -> tuple[int, ...]:
    if not cluster or count <= 0:
        return ()
    normalized = [_normalize(vector) for vector in embeddings]
    center = _normalize(
        [
            sum(normalized[index][dimension] for index in cluster) / len(cluster)
            for dimension in range(len(normalized[0]))
        ]
    )
    return tuple(
        index
        for _, index in sorted(
            [(-_cosine(normalized[index], center), index) for index in cluster]
        )[:count]
    )


def audit_representative_indices(
    cluster: Sequence[int], embeddings: Sequence[Sequence[float]], count: int
) -> tuple[int, ...]:
    if not cluster or count <= 0:
        return ()
    normalized = [_normalize(vector) for vector in embeddings]
    center = _normalize(
        [
            sum(normalized[index][dimension] for index in cluster) / len(cluster)
            for dimension in range(len(normalized[0]))
        ]
    )
    return tuple(
        index
        for _, index in sorted(
            [(_cosine(normalized[index], center), index) for index in cluster]
        )[:count]
    )


def similarity_diagnostics(
    groups: Sequence[Sequence[int]], embeddings: Sequence[Sequence[float]]
) -> tuple[tuple[dict[str, Any], ...], dict[int, dict[str, float | None]]]:
    normalized = [_normalize(vector) for vector in embeddings]
    centroids = [
        _normalize(
            [
                sum(normalized[index][dimension] for index in group) / len(group)
                for dimension in range(len(normalized[0]))
            ]
        )
        for group in groups
    ]
    member_diagnostics: dict[int, dict[str, float | None]] = {}
    cluster_diagnostics: list[dict[str, Any]] = []
    for group_index, group in enumerate(groups):
        own = [_cosine(normalized[index], centroids[group_index]) for index in group]
        competing_centroids = [
            _cosine(centroids[group_index], centroid)
            for index, centroid in enumerate(centroids)
            if index != group_index
        ]
        cross_member = [
            _cosine(normalized[left], normalized[right])
            for other_index, other in enumerate(groups)
            if other_index != group_index
            for left in group
            for right in other
        ]
        cluster_diagnostics.append(
            {
                "centroidCosine": {
                    "minimum": round(min(own), 6),
                    "median": round(statistics.median(own), 6),
                    "maximum": round(max(own), 6),
                },
                "belowThresholdSegmentCount": sum(value < CLUSTER_THRESHOLD for value in own),
                "nearestCompetingCentroidCosine": (
                    round(max(competing_centroids), 6) if competing_centroids else None
                ),
                "crossClusterMemberCosineMaximum": (
                    round(max(cross_member), 6) if cross_member else None
                ),
            }
        )
        for index, own_similarity in zip(group, own, strict=True):
            competing = [
                _cosine(normalized[index], centroid)
                for centroid_index, centroid in enumerate(centroids)
                if centroid_index != group_index
            ]
            nearest = max(competing) if competing else None
            member_diagnostics[index] = {
                "centroidCosine": round(own_similarity, 6),
                "nearestCompetingCentroidCosine": (
                    round(nearest, 6) if nearest is not None else None
                ),
                "centroidMargin": (
                    round(own_similarity - nearest, 6) if nearest is not None else None
                ),
            }
    return tuple(cluster_diagnostics), member_diagnostics


def _decode_segment(source: Path, segment: Segment, sample_rate: int) -> list[float]:
    import numpy as np

    result = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-nostdin",
            "-ss",
            f"{segment.start_seconds:.6f}",
            "-i",
            str(source),
            "-t",
            f"{segment.duration_seconds:.6f}",
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "-f",
            "f32le",
            "pipe:1",
        ],
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        raise SpeakerClusterError(
            f"ffmpeg could not decode {segment.segment_id}: {result.stderr.decode(errors='replace')}"
        )
    audio = np.frombuffer(result.stdout, dtype="<f4").copy()
    if audio.size == 0:
        raise SpeakerClusterError(f"decoded segment is empty: {segment.segment_id}")
    return audio.tolist()


def extract_embeddings(plan: dict[str, Any], cache_dir: Path) -> list[list[float]]:
    import numpy as np
    import torch
    import torch.nn.functional as functional
    from dots_tts.runtime import DotsTtsRuntime

    if not torch.cuda.is_available():
        raise SpeakerClusterError("CUDA is required for Dots CAM++ embeddings")
    if os.environ.get("CUBLAS_WORKSPACE_CONFIG") != EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]:
        raise SpeakerClusterError("CUBLAS_WORKSPACE_CONFIG was not pinned before CUDA use")
    random.seed(EMBEDDING_SEED)
    np.random.seed(EMBEDDING_SEED)
    torch.manual_seed(EMBEDDING_SEED)
    torch.cuda.manual_seed_all(EMBEDDING_SEED)
    torch.use_deterministic_algorithms(True)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True
    if plan["embedding"]["modelRevision"] != MODEL_REVISION:
        raise SpeakerClusterError("embedding plan does not pin the required Dots revision")
    runtime = DotsTtsRuntime.from_pretrained(
        MODEL_REPOSITORY,
        revision=MODEL_REVISION,
        cache_dir=str(cache_dir),
        precision="bfloat16",
    )
    encoder = runtime.model.xvector_extractor.eval()
    sample_rate = int(encoder.sample_rate)
    source = Path(plan["source"]["materializedEvidence"]["path"])
    segments = [Segment(**record) for record in plan["segmentation"]["segments"]]
    embeddings: list[list[float]] = []
    for segment in segments:
        audio = torch.tensor(_decode_segment(source, segment, sample_rate), dtype=torch.float32)
        with torch.inference_mode():
            value = encoder(audio[None, :].to(runtime.device))
            value = functional.normalize(value.float(), dim=-1).cpu().squeeze(0)
        embeddings.append([float(item) for item in value.tolist()])
        print(f"embedded {segment.segment_id} {segment.start_seconds:.3f}-{segment.end_seconds:.3f}", flush=True)
    return embeddings


def _validate_representative_wav(
    path: Path, *, expected_duration: float | None = None
) -> None:
    try:
        with wave.open(str(path), "rb") as handle:
            valid = (
                handle.getnchannels() == 1
                and handle.getframerate() == CLIP_SAMPLE_RATE
                and handle.getsampwidth() == 2
                and handle.getnframes() > 0
            )
            duration = handle.getnframes() / handle.getframerate()
    except (OSError, wave.Error) as error:
        raise SpeakerClusterError(f"invalid representative WAV {path}: {error}") from error
    if not valid:
        raise SpeakerClusterError(f"representative WAV has the wrong format: {path}")
    if expected_duration is not None and abs(duration - expected_duration) > 0.02:
        raise SpeakerClusterError(
            f"representative WAV duration does not match its segment: {path}"
        )


def _extract_representative_clip(source: Path, segment: Segment, output: Path) -> None:
    result = subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-nostdin",
            "-ss",
            f"{segment.start_seconds:.6f}",
            "-i",
            str(source),
            "-t",
            f"{segment.duration_seconds:.6f}",
            "-map_metadata",
            "-1",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-ac",
            "1",
            "-ar",
            str(CLIP_SAMPLE_RATE),
            "-c:a",
            "pcm_s16le",
            "-f",
            "wav",
            str(output),
        ],
        check=False,
        capture_output=True,
    )
    if result.returncode != 0:
        raise SpeakerClusterError(
            f"ffmpeg could not write representative {output}: {result.stderr.decode(errors='replace')}"
        )
    _validate_representative_wav(output, expected_duration=segment.duration_seconds)


def _confined_artifact(
    output_dir: Path, value: Any, *, expected: str, label: str
) -> Path:
    if not isinstance(value, str) or value != expected or "\\" in value:
        raise SpeakerClusterError(f"{label} path is not the exact expected relative path")
    relative = PurePosixPath(value)
    if relative.is_absolute() or any(part in {"", ".", ".."} for part in relative.parts):
        raise SpeakerClusterError(f"{label} path must be confined and relative")
    path = output_dir.joinpath(*relative.parts)
    try:
        path.resolve().relative_to(output_dir.resolve())
    except ValueError as error:
        raise SpeakerClusterError(f"{label} path escapes the output directory") from error
    return path


def _verify_resume(
    output_dir: Path, plan: dict[str, Any], execution: dict[str, Any]
) -> dict[str, Any] | None:
    if not output_dir.exists():
        return None
    if not output_dir.is_dir():
        raise SpeakerClusterError(f"cluster output is not a directory: {output_dir}")
    manifest_path = output_dir / "manifest.json"
    if not manifest_path.is_file():
        raise SpeakerClusterError(
            f"partial cluster output has no manifest and will not be overwritten: {output_dir}"
        )
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpeakerClusterError(f"cannot read cluster resume manifest: {error}") from error
    manifest = _expect_keys(
        manifest,
        {
            "schemaVersion",
            "status",
            "planSha256",
            "plan",
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
        "resume manifest",
    )
    if (
        manifest["schemaVersion"] != SCHEMA_VERSION
        or manifest["status"] != "anonymous-speaker-cluster-proof"
        or manifest["resumeVerified"] is not False
    ):
        raise SpeakerClusterError("resume manifest schema, status, or disk resume flag is invalid")
    if manifest["planSha256"] != plan["planSha256"] or manifest["plan"] != plan:
        raise SpeakerClusterError("existing cluster manifest does not match the exact plan")
    if (
        manifest["identityPolicy"] != IDENTITY_POLICY
        or manifest["identityPolicy"] != plan["identityPolicy"]
        or manifest["segmentationPolicy"] != SEGMENTATION_POLICY
        or manifest["segmentationPolicy"] != plan["segmentationPolicy"]
    ):
        raise SpeakerClusterError("resume manifest safety policy is invalid")
    if manifest["executionTools"] != execution:
        raise SpeakerClusterError("resume manifest execution tools do not match this host")
    packages = _expect_keys(
        manifest["packages"], {"dots.tts", "numpy", "torch"}, "resume packages"
    )
    if any(not isinstance(value, str) or not value for value in packages.values()):
        raise SpeakerClusterError("resume package versions are invalid")

    planned_segments = validate_plan(plan)
    embedding_record = _expect_keys(
        manifest["embeddings"],
        {"path", "sha256", "count", "dimension"},
        "resume embeddings",
    )
    if (
        embedding_record["count"] != len(planned_segments)
        or embedding_record["dimension"] != EMBEDDING_DIMENSION
    ):
        raise SpeakerClusterError("resume embedding counts or dimensions are invalid")
    _sha(embedding_record["sha256"], "resume embedding SHA-256")
    embeddings_path = _confined_artifact(
        output_dir,
        embedding_record["path"],
        expected="embeddings.json",
        label="embeddings",
    )
    if not embeddings_path.is_file() or sha256_file(embeddings_path) != embedding_record["sha256"]:
        raise SpeakerClusterError("existing cluster embeddings are missing or corrupt")
    try:
        embedding_payload = json.loads(embeddings_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise SpeakerClusterError(f"cannot read resume embeddings: {error}") from error
    embedding_payload = _expect_keys(
        embedding_payload,
        {"schemaVersion", "planSha256", "dimension", "embeddings"},
        "embedding payload",
    )
    if (
        embedding_payload["schemaVersion"] != SCHEMA_VERSION
        or embedding_payload["planSha256"] != plan["planSha256"]
        or embedding_payload["dimension"] != EMBEDDING_DIMENSION
        or not isinstance(embedding_payload["embeddings"], list)
        or len(embedding_payload["embeddings"]) != len(planned_segments)
    ):
        raise SpeakerClusterError("embedding payload metadata is invalid")
    vectors: list[list[float]] = []
    for index, (record, segment) in enumerate(
        zip(embedding_payload["embeddings"], planned_segments, strict=True)
    ):
        record = _expect_keys(record, {"segmentId", "vector"}, f"embedding {index}")
        vector = record["vector"]
        if (
            record["segmentId"] != segment.segment_id
            or not isinstance(vector, list)
            or len(vector) != EMBEDDING_DIMENSION
            or any(
                isinstance(value, bool)
                or not isinstance(value, (int, float))
                or not math.isfinite(float(value))
                for value in vector
            )
        ):
            raise SpeakerClusterError(f"embedding {index} shape or relationship is invalid")
        normalized_vector = [float(value) for value in vector]
        norm = math.sqrt(sum(value * value for value in normalized_vector))
        if abs(norm - 1.0) > 1e-4:
            raise SpeakerClusterError(f"embedding {index} is not unit-normalized")
        vectors.append(normalized_vector)

    clusters = manifest["clusters"]
    segment_records = manifest["segments"]
    if not isinstance(clusters, list) or not isinstance(segment_records, list):
        raise SpeakerClusterError("resume clusters and segments must be arrays")
    cluster_ids: list[str] = []
    for index, cluster in enumerate(clusters):
        cluster = _expect_keys(
            cluster,
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
        expected_id = f"anonymous-cluster-{index:02d}"
        if cluster["clusterId"] != expected_id or cluster["identity"] is not None:
            raise SpeakerClusterError(f"cluster {index} identity or id is invalid")
        cluster_ids.append(expected_id)
    if len(segment_records) != len(planned_segments):
        raise SpeakerClusterError("resume segment count does not match the plan")
    groups_by_id: dict[str, list[int]] = {cluster_id: [] for cluster_id in cluster_ids}
    unclustered = 0
    for index, (record, segment) in enumerate(zip(segment_records, planned_segments, strict=True)):
        record = _expect_keys(
            record,
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
            raise SpeakerClusterError(f"manifest segment {index} does not match the plan")
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
                raise SpeakerClusterError("unclustered segment has cluster diagnostics")
        elif cluster_id in groups_by_id:
            groups_by_id[cluster_id].append(index)
        else:
            raise SpeakerClusterError(f"manifest segment {index} has an unknown cluster")
    if manifest["unclusteredSegmentCount"] != unclustered:
        raise SpeakerClusterError("resume unclustered segment count is invalid")
    expected_groups = tuple(
        group for group in cluster_embeddings(vectors) if len(group) >= MIN_CLUSTER_SIZE
    )
    actual_groups = tuple(tuple(groups_by_id[cluster_id]) for cluster_id in cluster_ids)
    if actual_groups != expected_groups:
        raise SpeakerClusterError("resume cluster membership does not match the embeddings")
    cluster_diagnostics, member_diagnostics = similarity_diagnostics(actual_groups, vectors)
    referenced_files = {"manifest.json", "embeddings.json"}

    def verify_clips(
        records: Any,
        expected_indices: Sequence[int],
        *,
        cluster_id: str,
        selection: str,
    ) -> None:
        if not isinstance(records, list) or len(records) != len(expected_indices):
            raise SpeakerClusterError(f"{cluster_id} {selection} clip count is invalid")
        for rank, (record, segment_index) in enumerate(
            zip(records, expected_indices, strict=True), start=1
        ):
            record = _expect_keys(
                record,
                {
                    "rank",
                    "selection",
                    "segmentId",
                    "startSeconds",
                    "endSeconds",
                    "path",
                    "sha256",
                },
                f"{cluster_id} {selection} clip {rank}",
            )
            segment = planned_segments[segment_index]
            suffix = "rep" if selection == "nearest-centroid" else "audit"
            expected_path = f"representatives/{cluster_id}-{suffix}-{rank:02d}.wav"
            if (
                record["rank"] != rank
                or record["selection"] != selection
                or record["segmentId"] != segment.segment_id
                or record["startSeconds"] != segment.start_seconds
                or record["endSeconds"] != segment.end_seconds
            ):
                raise SpeakerClusterError(f"{cluster_id} {selection} clip relationship is invalid")
            _sha(record["sha256"], f"{cluster_id} {selection} clip SHA-256")
            path = _confined_artifact(
                output_dir,
                record["path"],
                expected=expected_path,
                label=f"{cluster_id} {selection} clip",
            )
            referenced_files.add(expected_path)
            if not path.is_file() or sha256_file(path) != record["sha256"]:
                raise SpeakerClusterError(f"representative clip is missing or corrupt: {path}")
            _validate_representative_wav(
                path, expected_duration=segment.duration_seconds
            )

    for index, (cluster, group) in enumerate(zip(clusters, actual_groups, strict=True)):
        cluster_id = cluster_ids[index]
        if (
            cluster["segmentCount"] != len(group)
            or len(group) < MIN_CLUSTER_SIZE
            or cluster["firstSegmentId"] != planned_segments[group[0]].segment_id
            or cluster["diagnostics"] != cluster_diagnostics[index]
        ):
            raise SpeakerClusterError(f"{cluster_id} counts or diagnostics are invalid")
        for member in group:
            expected = member_diagnostics[member]
            actual = segment_records[member]
            if any(actual[key] != value for key, value in expected.items()):
                raise SpeakerClusterError(f"{cluster_id} member diagnostics are invalid")
        verify_clips(
            cluster["representatives"],
            representative_indices(group, vectors, REPRESENTATIVES_PER_CLUSTER),
            cluster_id=cluster_id,
            selection="nearest-centroid",
        )
        verify_clips(
            cluster["auditRepresentatives"],
            audit_representative_indices(
                group, vectors, AUDIT_REPRESENTATIVES_PER_CLUSTER
            ),
            cluster_id=cluster_id,
            selection="farthest-centroid",
        )
    actual_files: set[str] = set()
    for path in output_dir.rglob("*"):
        if path.is_symlink():
            raise SpeakerClusterError(f"resume output contains a symlink: {path}")
        if path.is_file():
            actual_files.add(path.relative_to(output_dir).as_posix())
    if actual_files != referenced_files:
        raise SpeakerClusterError("resume output file inventory does not match the manifest")
    return manifest


def execute_plan(
    plan: dict[str, Any],
    *,
    cache_dir: Path,
    execution_ffmpeg: str | None = None,
    execution_dots_commit: str | None = None,
    execution_runtime: dict[str, str] | None = None,
) -> dict[str, Any]:
    segments = validate_execution_inputs(plan)
    configured_workspace = os.environ.setdefault(
        "CUBLAS_WORKSPACE_CONFIG",
        str(EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]),
    )
    if configured_workspace != EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]:
        raise SpeakerClusterError("CUBLAS_WORKSPACE_CONFIG conflicts with the pinned plan")
    execution = execution_tools(
        plan,
        execution_ffmpeg if execution_ffmpeg is not None else ffmpeg_version(),
        (
            execution_dots_commit
            if execution_dots_commit is not None
            else installed_dots_source_commit()
        ),
        execution_runtime,
    )
    output_dir = Path(plan["outputDirectory"])
    resumed = _verify_resume(output_dir, plan, execution)
    if resumed is not None:
        resumed["resumeVerified"] = True
        return resumed
    output_dir.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(prefix=f".{output_dir.name}.tmp-", dir=output_dir.parent)
    )
    try:
        embeddings = extract_embeddings(plan, cache_dir)
        if (
            len(embeddings) != len(segments)
            or any(len(vector) != EMBEDDING_DIMENSION for vector in embeddings)
        ):
            raise SpeakerClusterError("CAM++ returned unexpected embedding dimensions")
        embedding_payload = {
            "schemaVersion": SCHEMA_VERSION,
            "planSha256": plan["planSha256"],
            "dimension": EMBEDDING_DIMENSION,
            "embeddings": [
                {"segmentId": segment.segment_id, "vector": vector}
                for segment, vector in zip(segments, embeddings, strict=True)
            ],
        }
        embeddings_path = temporary / "embeddings.json"
        atomic_json(embeddings_path, embedding_payload)
        groups = cluster_embeddings(embeddings)
        cluster_records: list[dict[str, Any]] = []
        assignment: dict[int, str | None] = {index: None for index in range(len(segments))}
        representatives_dir = temporary / "representatives"
        representatives_dir.mkdir()
        kept_groups = [group for group in groups if len(group) >= MIN_CLUSTER_SIZE]
        cluster_diagnostics, member_diagnostics = similarity_diagnostics(
            kept_groups, embeddings
        )

        def materialize_clips(
            indices: Sequence[int], *, cluster_id: str, selection: str
        ) -> list[dict[str, Any]]:
            records: list[dict[str, Any]] = []
            suffix = "rep" if selection == "nearest-centroid" else "audit"
            for rank, segment_index in enumerate(indices, start=1):
                segment = segments[segment_index]
                relative = (
                    Path("representatives")
                    / f"{cluster_id}-{suffix}-{rank:02d}.wav"
                )
                path = temporary / relative
                _extract_representative_clip(
                    Path(plan["source"]["materializedEvidence"]["path"]),
                    segment,
                    path,
                )
                records.append(
                    {
                        "rank": rank,
                        "selection": selection,
                        "segmentId": segment.segment_id,
                        "startSeconds": segment.start_seconds,
                        "endSeconds": segment.end_seconds,
                        "path": relative.as_posix(),
                        "sha256": sha256_file(path),
                    }
                )
            return records

        for cluster_index, group in enumerate(kept_groups):
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
                        representative_indices(
                            group, embeddings, REPRESENTATIVES_PER_CLUSTER
                        ),
                        cluster_id=cluster_id,
                        selection="nearest-centroid",
                    ),
                    "auditRepresentatives": materialize_clips(
                        audit_representative_indices(
                            group, embeddings, AUDIT_REPRESENTATIVES_PER_CLUSTER
                        ),
                        cluster_id=cluster_id,
                        selection="farthest-centroid",
                    ),
                    "diagnostics": cluster_diagnostics[cluster_index],
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
                "nearestCompetingCentroidCosine": member_diagnostics.get(
                    index, {}
                ).get("nearestCompetingCentroidCosine"),
                "centroidMargin": member_diagnostics.get(index, {}).get(
                    "centroidMargin"
                ),
            }
            for index, segment in enumerate(segments)
        ]
        manifest = {
            "schemaVersion": SCHEMA_VERSION,
            "status": "anonymous-speaker-cluster-proof",
            "planSha256": plan["planSha256"],
            "plan": plan,
            "identityPolicy": plan["identityPolicy"],
            "segmentationPolicy": plan["segmentationPolicy"],
            "executionTools": execution,
            "packages": {
                name: importlib.metadata.version(name)
                for name in ("dots.tts", "numpy", "torch")
            },
            "embeddings": {
                "path": "embeddings.json",
                "sha256": sha256_file(embeddings_path),
                "count": len(embeddings),
                "dimension": EMBEDDING_DIMENSION,
            },
            "clusters": cluster_records,
            "unclusteredSegmentCount": sum(value is None for value in assignment.values()),
            "segments": segment_records,
            "resumeVerified": False,
        }
        atomic_json(temporary / "manifest.json", manifest)
        _verify_resume(temporary, plan, execution)
        temporary.replace(output_dir)
        return manifest
    except Exception:
        shutil.rmtree(temporary, ignore_errors=True)
        raise


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--captions", type=Path, default=DEFAULT_CAPTIONS)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--cache-dir", type=Path)
    parser.add_argument("--max-segments", type=int, default=MAX_SEGMENTS)
    parser.add_argument("--expect-source-sha256")
    parser.add_argument("--expect-caption-sha256")
    parser.add_argument("--expect-script-sha256")
    parser.add_argument("--execute-plan", type=Path)
    parser.add_argument("--expect-plan-sha256")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.execute_plan is not None:
        if (
            args.source != DEFAULT_SOURCE
            or args.captions != DEFAULT_CAPTIONS
            or args.output_dir != DEFAULT_OUTPUT
            or args.max_segments != MAX_SEGMENTS
            or args.expect_source_sha256 is not None
            or args.expect_caption_sha256 is not None
            or args.expect_script_sha256 is not None
        ):
            raise SpeakerClusterError(
                "generation arguments cannot be combined with --execute-plan"
            )
        if args.cache_dir is None:
            raise SpeakerClusterError("--cache-dir is required with --execute-plan")
        plan = load_plan_artifact(
            args.execute_plan,
            expected_plan_sha256=args.expect_plan_sha256,
        )
        result = execute_plan(plan, cache_dir=args.cache_dir)
    else:
        if args.expect_plan_sha256 is not None:
            raise SpeakerClusterError(
                "--expect-plan-sha256 is valid only with --execute-plan"
            )
        plan = build_plan(
            source=args.source,
            captions=args.captions,
            output_dir=args.output_dir,
            max_segments=args.max_segments,
            expected_source_sha256=args.expect_source_sha256,
            expected_caption_sha256=args.expect_caption_sha256,
            expected_script_sha256=args.expect_script_sha256,
        )
        write_plan_artifact(plan)
        result = plan
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
