#!/usr/bin/env python3
"""Emit one tiny real mastering-v6 artifact for the TypeScript interop test."""

from __future__ import annotations

import json
import math
import struct
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from master_audio import (  # noqa: E402
    build_mastering_plan,
    execute_mastering,
    measure_loudness,
    probe_media,
    resolve_tools,
    write_mastering_plan,
)
from render_dots import SAMPLE_RATE, content_sha256, sha256_file  # noqa: E402


def pcm24(value: int) -> bytes:
    if value < 0:
        value += 1 << 24
    return value.to_bytes(3, "little", signed=False)


def write_source(path: Path) -> int:
    frames = SAMPLE_RATE
    maximum = (1 << 23) - 1
    payload = bytearray()
    for index in range(frames):
        value = round(maximum * 0.08 * math.sin(2 * math.pi * 220 * index / SAMPLE_RATE))
        payload.extend(pcm24(value))
    data_size = len(payload)
    file_size = 104 + data_size + (data_size & 1)
    pcm_guid = bytes.fromhex("0100000000001000800000aa00389b71")
    header = b"".join(
        (
            b"RF64",
            struct.pack("<I", (1 << 32) - 1),
            b"WAVE",
            b"ds64",
            struct.pack("<IQQQI", 28, file_size - 8, data_size, frames, 0),
            b"fmt ",
            struct.pack(
                "<IHHIIHHHHI",
                40,
                0xFFFE,
                1,
                SAMPLE_RATE,
                SAMPLE_RATE * 3,
                3,
                24,
                22,
                24,
                4,
            ),
            pcm_guid,
            b"data",
            struct.pack("<I", (1 << 32) - 1),
        )
    )
    path.write_bytes(header + payload + (b"\x00" if data_size & 1 else b""))
    return frames


def assembly(source: Path, dialogue: str, chapter_id: str, frames: int) -> dict:
    audio_sha = sha256_file(source)
    entry_input = "1" * 64
    chapter_input = "2" * 64
    timing = [
        {
            "input_sha256": entry_input,
            "entry_ids": [f"{dialogue}-0001"],
            "boundary_before": {"kind": "start", "pause_ms": 0, "crossfade_ms": 0},
            "start_frame": 0,
            "end_frame": frames,
            "start_seconds": 0.0,
            "end_seconds": frames / SAMPLE_RATE,
        }
    ]
    timing_sha = content_sha256(timing)
    sidecar_sha = "3" * 64
    complete_timing = [
        {
            "chapter_id": chapter_id,
            "input_sha256": chapter_input,
            "audio_sha256": audio_sha,
            "frames": frames,
            "timing_sha256": timing_sha,
            "sidecar_sha256": sidecar_sha,
            "boundary_before": {"kind": "start", "pause_ms": 0, "crossfade_ms": 0},
            "start_frame": 0,
            "end_frame": frames,
            "start_seconds": 0.0,
            "end_seconds": frames / SAMPLE_RATE,
        }
    ]
    starts = [
        {
            "chapter_id": chapter_id,
            "input_sha256": chapter_input,
            "audio_sha256": audio_sha,
            "frames": frames,
            "timing_sha256": timing_sha,
            "sidecar_sha256": sidecar_sha,
            "start_frame": 0,
            "start_seconds": 0.0,
        }
    ]
    return {
        "schema_version": 4,
        "status": "verified-full-dialogue-render-assembly",
        "dialogue": dialogue,
        "render_plan_sha256": "4" * 64,
        "chapters": [
            {
                "chapter_id": chapter_id,
                "input_sha256": chapter_input,
                "audio_path": str(source),
                "audio_sha256": audio_sha,
                "frames": frames,
                "duration_seconds": frames / SAMPLE_RATE,
                "timing_sha256": timing_sha,
                "sidecar_sha256": sidecar_sha,
                "timing": timing,
            }
        ],
        "complete": {
            "input_sha256": "5" * 64,
            "audio_path": str(source),
            "audio_sha256": audio_sha,
            "frames": frames,
            "duration_seconds": frames / SAMPLE_RATE,
            "timing_sha256": content_sha256(complete_timing),
            "sidecar_sha256": "6" * 64,
            "chapter_starts_sha256": content_sha256(starts),
            "container_profile": "rf64-pcm24",
            "chapter_starts": starts,
            "timing": complete_timing,
        },
    }


def main() -> None:
    outdir = Path(sys.argv[1]).resolve()
    dialogue = sys.argv[2]
    chapter_id = sys.argv[3]
    outdir.mkdir(parents=True, exist_ok=True)
    source = outdir / "interop-source.wav"
    frames = write_source(source)
    renderer = assembly(source, dialogue, chapter_id, frames)
    tools = resolve_tools()
    plan = build_mastering_plan(
        assembly=renderer,
        render_plan_artifact_sha256="7" * 64,
        tools=tools,
        source_probe=probe_media(source, tools),
        first_pass=measure_loudness(source, tools),
    )
    plan_path = write_mastering_plan(plan, outdir)
    result, _created = execute_mastering(plan, renderer, outdir)
    if not result["mechanical_passed"]:
        raise RuntimeError("tiny mastering interop fixture failed mechanical QA")
    receipt = {
        "plan_sha256": plan["plan_sha256"],
        "plan_path": plan_path.relative_to(outdir).as_posix(),
        "result_dir": f"artifacts/{plan['plan_sha256']}",
    }
    (outdir / "interop-receipt.json").write_text(
        json.dumps(receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(receipt))


if __name__ == "__main__":
    main()
