#!/usr/bin/env python3
"""Materialize a clean Dots reference clip directly from the pinned YouTube pool."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import subprocess
import wave
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any


SAMPLE_RATE = 48_000
MIN_CLIP_SECONDS = 3.0
MAX_CLIP_SECONDS = 20.0
SAFE_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


class ReferenceMaterializationError(ValueError):
    """Raised when a source selection or materialized clip is unsafe."""


@dataclass(frozen=True)
class ReferencePlan:
    dialogue: str
    character_id: str
    video_id: str
    source_url: str
    source_title: str
    source_duration_seconds: int
    start_seconds: float
    end_seconds: float
    prompt_text: str
    source_media_path: str
    wav_path: str
    sidecar_path: str

    @property
    def clip_duration_seconds(self) -> float:
        return self.end_seconds - self.start_seconds


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_catalog(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ReferenceMaterializationError(f"cannot read source catalog {path}: {error}") from error
    policy = value.get("selectionPolicy") if isinstance(value, dict) else None
    if (
        not isinstance(value, dict)
        or value.get("schemaVersion") != 2
        or value.get("status") != "source-pool"
        or not isinstance(policy, dict)
        or policy.get("automaticSelection") is not True
        or policy.get("acceptancePolicy")
        != "operator-authorized-deterministic-v1"
    ):
        raise ReferenceMaterializationError(f"unsupported source catalog {path}")
    return value


def build_reference_plan(
    catalog: dict[str, Any],
    *,
    dialogue: str,
    character_id: str,
    start_seconds: float,
    end_seconds: float,
    prompt_text: str,
    output_root: Path,
    video_id: str | None = None,
) -> ReferencePlan:
    if not SAFE_ID.fullmatch(dialogue) or not SAFE_ID.fullmatch(character_id):
        raise ReferenceMaterializationError("dialogue and character_id must be canonical lowercase identifiers")
    if not all(math.isfinite(value) for value in (start_seconds, end_seconds)) or start_seconds < 0:
        raise ReferenceMaterializationError("clip times must be finite and non-negative")
    duration = end_seconds - start_seconds
    if duration < MIN_CLIP_SECONDS or duration > MAX_CLIP_SECONDS:
        raise ReferenceMaterializationError(
            f"reference clips must be {MIN_CLIP_SECONDS:g}-{MAX_CLIP_SECONDS:g} seconds; got {duration:.3f}"
        )
    prompt = " ".join(prompt_text.split())
    if not prompt:
        raise ReferenceMaterializationError("prompt_text must be non-empty")

    rows = [row for row in catalog.get("dialogues", []) if row.get("dialogue") == dialogue]
    if len(rows) != 1:
        raise ReferenceMaterializationError(f"source catalog has no unique dialogue entry for {dialogue}")
    videos = rows[0].get("videos")
    if not isinstance(videos, list) or not videos:
        raise ReferenceMaterializationError(f"source catalog has no videos for {dialogue}")
    if video_id is None:
        if len(videos) != 1:
            raise ReferenceMaterializationError(f"{dialogue} has multiple source videos; pass --video-id")
        video = videos[0]
    else:
        if not VIDEO_ID.fullmatch(video_id):
            raise ReferenceMaterializationError("video_id is invalid")
        matches = [entry for entry in videos if entry.get("videoId") == video_id]
        if len(matches) != 1:
            raise ReferenceMaterializationError(f"video {video_id} is not pinned for {dialogue}")
        video = matches[0]

    source_duration = video.get("durationSeconds")
    source_id = video.get("videoId")
    source_url = video.get("url")
    source_title = video.get("title")
    if (
        not isinstance(source_id, str)
        or not VIDEO_ID.fullmatch(source_id)
        or source_url != f"https://www.youtube.com/watch?v={source_id}"
        or not isinstance(source_title, str)
        or not isinstance(source_duration, int)
    ):
        raise ReferenceMaterializationError(f"pinned video metadata is malformed for {dialogue}")
    if end_seconds > source_duration:
        raise ReferenceMaterializationError(
            f"clip end {end_seconds:.3f} exceeds pinned video duration {source_duration}"
        )

    interval = f"{round(start_seconds * 1000):09d}-{round(end_seconds * 1000):09d}"
    prompt_sha = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:12]
    basename = f"{source_id}-{interval}-{prompt_sha}"
    character_root = output_root / character_id
    return ReferencePlan(
        dialogue=dialogue,
        character_id=character_id,
        video_id=source_id,
        source_url=source_url,
        source_title=source_title,
        source_duration_seconds=source_duration,
        start_seconds=start_seconds,
        end_seconds=end_seconds,
        prompt_text=prompt,
        source_media_path=str(output_root / "source-cache" / f"{source_id}.media"),
        wav_path=str(character_root / f"{basename}.wav"),
        sidecar_path=str(character_root / f"{basename}.json"),
    )


def _tool_version(command: str) -> str:
    version_flag = "-version" if command == "ffmpeg" else "--version"
    result = subprocess.run([command, version_flag], check=True, capture_output=True, text=True)
    return result.stdout.splitlines()[0].strip()


def _verify_wav(path: Path, expected_duration: float) -> float:
    try:
        with wave.open(str(path), "rb") as handle:
            if handle.getnchannels() != 1 or handle.getframerate() != SAMPLE_RATE or handle.getsampwidth() != 3:
                raise ReferenceMaterializationError(f"{path}: expected mono 48 kHz PCM-24 WAV")
            duration = handle.getnframes() / handle.getframerate()
    except (OSError, wave.Error) as error:
        raise ReferenceMaterializationError(f"cannot inspect rendered WAV {path}: {error}") from error
    if abs(duration - expected_duration) > 0.075:
        raise ReferenceMaterializationError(
            f"{path}: duration {duration:.3f} differs from planned {expected_duration:.3f}"
        )
    return duration


def materialize_reference(plan: ReferencePlan) -> dict[str, Any]:
    source_path = Path(plan.source_media_path)
    wav_path = Path(plan.wav_path)
    sidecar_path = Path(plan.sidecar_path)
    source_path.parent.mkdir(parents=True, exist_ok=True)
    wav_path.parent.mkdir(parents=True, exist_ok=True)

    if wav_path.exists() != sidecar_path.exists():
        raise ReferenceMaterializationError(f"partial reference artifact exists for {wav_path}")
    plan_payload = asdict(plan)
    if wav_path.exists():
        existing = json.loads(sidecar_path.read_text(encoding="utf-8"))
        if existing.get("plan") != plan_payload or existing.get("wav", {}).get("sha256") != sha256_file(wav_path):
            raise ReferenceMaterializationError(f"existing reference artifact does not match the requested plan: {wav_path}")
        return existing

    if not source_path.exists():
        subprocess.run(
            [
                "yt-dlp",
                "--no-playlist",
                "--no-overwrites",
                "--no-part",
                "-f",
                "bestaudio",
                "-o",
                str(source_path),
                plan.source_url,
            ],
            check=True,
        )
    if not source_path.is_file() or source_path.stat().st_size == 0:
        raise ReferenceMaterializationError(f"YouTube source was not materialized: {source_path}")

    temporary_wav = wav_path.with_name(f".{wav_path.name}.{os.getpid()}.tmp.wav")
    temporary_sidecar = sidecar_path.with_name(f".{sidecar_path.name}.{os.getpid()}.tmp")
    try:
        subprocess.run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-y",
                "-i",
                str(source_path),
                "-ss",
                f"{plan.start_seconds:.3f}",
                "-t",
                f"{plan.clip_duration_seconds:.3f}",
                "-map_metadata",
                "-1",
                "-vn",
                "-ac",
                "1",
                "-ar",
                str(SAMPLE_RATE),
                "-c:a",
                "pcm_s24le",
                str(temporary_wav),
            ],
            check=True,
        )
        actual_duration = _verify_wav(temporary_wav, plan.clip_duration_seconds)
        sidecar = {
            "schemaVersion": 1,
            "plan": plan_payload,
            "planSha256": hashlib.sha256(canonical_json(plan_payload)).hexdigest(),
            "sourceMedia": {"path": str(source_path), "sha256": sha256_file(source_path)},
            "wav": {
                "path": str(wav_path),
                "sha256": sha256_file(temporary_wav),
                "sampleRate": SAMPLE_RATE,
                "channels": 1,
                "sampleWidthBytes": 3,
                "durationSeconds": actual_duration,
            },
            "tools": {"ytDlp": _tool_version("yt-dlp"), "ffmpeg": _tool_version("ffmpeg")},
        }
        temporary_sidecar.write_text(json.dumps(sidecar, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        temporary_wav.replace(wav_path)
        temporary_sidecar.replace(sidecar_path)
        return sidecar
    finally:
        temporary_wav.unlink(missing_ok=True)
        temporary_sidecar.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=Path("audio/reference-sources.json"))
    parser.add_argument("--dialogue", required=True)
    parser.add_argument("--character-id", required=True)
    parser.add_argument("--video-id")
    parser.add_argument("--start", type=float, required=True)
    parser.add_argument("--end", type=float, required=True)
    parser.add_argument("--prompt-text", required=True)
    parser.add_argument("--output-root", type=Path, default=Path("scratch/audio-references"))
    parser.add_argument("--materialize", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    plan = build_reference_plan(
        load_catalog(args.catalog),
        dialogue=args.dialogue,
        character_id=args.character_id,
        video_id=args.video_id,
        start_seconds=args.start,
        end_seconds=args.end,
        prompt_text=args.prompt_text,
        output_root=args.output_root,
    )
    result: Any = materialize_reference(plan) if args.materialize else asdict(plan)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
