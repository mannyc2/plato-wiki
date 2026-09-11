#!/usr/bin/env python3
"""Emit one tiny real mastering artifact for the TypeScript interop test."""

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
    measure_chapter_normalization,
    measure_loudness,
    probe_media,
    resolve_tools,
    resolve_source_audio,
    write_mastering_plan,
)
from render_dots import SAMPLE_RATE, content_sha256, sha256_file  # noqa: E402


def pcm24(value: int) -> bytes:
    if value < 0:
        value += 1 << 24
    return value.to_bytes(3, "little", signed=False)


def write_source(path: Path, *, edited: bool = False) -> int:
    frames = SAMPLE_RATE
    maximum = (1 << 23) - 1
    payload = bytearray()
    for index in range(frames):
        value = round(maximum * 0.08 * math.sin(2 * math.pi * 220 * index / SAMPLE_RATE))
        if edited and SAMPLE_RATE * 0.4 <= index < SAMPLE_RATE * 0.6:
            value = 0
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
    repaired = "--repaired" in sys.argv[4:]
    edited = "--edited" in sys.argv[4:] or repaired
    frames = write_source(source, edited=edited)
    renderer = assembly(source, dialogue, chapter_id, frames)
    source_audio = resolve_source_audio(renderer, "7" * 64)
    if edited:
        from source_audio_edits import Cut, EditPolicy, execute_source_edit, manifest_sha256, preview_source_edit
        edit = preview_source_edit(
            source, original_sha256=sha256_file(source), original_frames=frames,
            chapter_timeline=source_audio["renderer_chapter_timeline"], boundaries=source_audio["renderer_boundaries"],
            render_plan_artifact_sha256="7" * 64,
            cuts=[Cut(22800, 25200, "Synthetic fixture's exact-zero quiet interior")],
            policy=EditPolicy(0, 960, "Deterministic zero-sample fixture validation"),
        )
        edited_source = outdir / "interop-derived-source.wav"
        if repaired:
            from pcm_edits import _header
            from source_audio_repairs import preview_source_repair, execute_source_repair
            replacement = outdir / "interop-replacement.wav"
            replacement.write_bytes(_header(960) + b"".join(pcm24(round(500000 * math.sin(2 * math.pi * 220 * index / SAMPLE_RATE))) for index in range(960)))
            evidence = outdir / "interop-repair-evidence.json"
            evidence.write_text('{"accepted":false,"purpose":"synthetic interchange fixture"}\n')
            edit = preview_source_repair(edit, [{"start_frame":6000,"end_frame":6480,"audio_path":str(replacement),
                "audio_sha256":sha256_file(replacement),"frames":960,"entry_id":"fixture-source-1","canonical_text":"A short source.",
                "reason":"Synthetic sample-exact replacement fixture", "evidence":[{"path":str(evidence),"sha256":sha256_file(evidence),"role":role}
                    for role in ("synthesis","transcription","source-task")]}])
            execute_source_repair(edit, expected_manifest_sha256=manifest_sha256(edit), output=edited_source)
        else:
            execute_source_edit(edit, expected_manifest_sha256=manifest_sha256(edit), output=edited_source)
        edit_path = outdir / "interop-source-edit.json"
        edit_path.write_text(json.dumps(edit, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        source_audio = resolve_source_audio(renderer, "7" * 64, source_edit_path=edit_path,
                                            expected_source_edit_sha256=sha256_file(edit_path), edited_source_path=edited_source)
        source = edited_source
    tools = resolve_tools()
    plan = build_mastering_plan(
        assembly=renderer,
        render_plan_artifact_sha256="7" * 64,
        tools=tools,
        source_probe=probe_media(source, tools),
        first_pass=measure_loudness(source, tools),
        chapter_normalization=measure_chapter_normalization(
            source,
            (edit["derived"]["chapter_timeline"] if edited else source_audio["renderer_chapter_timeline"]),
            tools,
        ),
        source_audio=source_audio,
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
