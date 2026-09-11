from __future__ import annotations

import json
import math
import struct
import sys
import subprocess
import tempfile
import unittest
from copy import deepcopy
from pathlib import Path
from unittest.mock import Mock, patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from master_audio import (  # noqa: E402
    MAX_BOUNDARY_CROSSING_SILENCE_MS,
    MAX_UNEXPECTED_SILENCE_MS,
    RENDERER_RF64_CONTAINER_PROFILE,
    RF64_CONTAINER_PROFILE,
    MasteringContractError,
    ChapterNormalization,
    build_mastering_plan,
    chapter_normalization_commands,
    measure_chapter_normalization,
    normalize_chapters,
    write_source_chapter,
    _run as run_ffmpeg,
    _renderer_binding,
    canonicalize_ffmpeg_rf64_header,
    execute_mastering,
    expected_boundaries,
    inspect_rf64_pcm24,
    measure_loudness,
    parse_loudnorm_json,
    parse_silence_log,
    probe_media,
    resolve_tools,
    resolve_source_audio,
    validate_source_audio_binding,
    resolve_analysis_runtime,
    scan_pcm24,
    unexpected_silence_segments,
    validate_analysis_runtime,
    validate_mastering_plan,
    validate_result_directory,
    write_mastering_plan,
)
from render_dots import (  # noqa: E402
    ASSEMBLY_SCHEMA_VERSION,
    SAMPLE_RATE,
    content_sha256,
    sha256_file,
)


def pcm24_bytes(value: int) -> bytes:
    if value < 0:
        value += 1 << 24
    return value.to_bytes(3, "little", signed=False)


def write_pcm24(
    path: Path,
    *,
    seconds: float = 4.0,
    amplitude: float = 0.08,
    silence: tuple[float, float] | None = None,
    clipped: bool = False,
) -> None:
    frames = round(seconds * SAMPLE_RATE)
    maximum = (1 << 23) - 1
    payload = bytearray()
    for index in range(frames):
        moment = index / SAMPLE_RATE
        if clipped and index == 0:
            value = maximum
        elif silence is not None and silence[0] <= moment < silence[1]:
            value = 0
        else:
            value = round(maximum * amplitude * math.sin(2 * math.pi * 220 * moment))
        payload.extend(pcm24_bytes(value))
    path.parent.mkdir(parents=True, exist_ok=True)
    data_size = len(payload)
    padding = data_size & 1
    file_size = 80 + data_size + padding
    header = b"".join(
        (
            b"RF64",
            struct.pack("<I", (1 << 32) - 1),
            b"WAVE",
            b"ds64",
            struct.pack("<IQQQI", 28, file_size - 8, data_size, frames, 0),
            b"fmt ",
            struct.pack(
                "<IHHIIHH",
                16,
                1,
                1,
                SAMPLE_RATE,
                SAMPLE_RATE * 3,
                3,
                24,
            ),
            b"data",
            struct.pack("<I", (1 << 32) - 1),
        )
    )
    path.write_bytes(header + payload + (b"\x00" if padding else b""))


def fake_tools() -> dict[str, dict[str, str]]:
    return {
        "ffmpeg": {
            "name": "ffmpeg",
            "path": "/fixture/ffmpeg",
            "sha256": "1" * 64,
            "version": "ffmpeg version fixture",
        },
        "ffprobe": {
            "name": "ffprobe",
            "path": "/fixture/ffprobe",
            "sha256": "2" * 64,
            "version": "ffprobe version fixture",
        },
    }


def fake_first_pass() -> dict[str, float]:
    return {
        "input_i": -27.2,
        "input_tp": -12.1,
        "input_lra": 1.2,
        "input_thresh": -37.0,
        "target_offset": 0.1,
    }


def assembly_for(path: Path, *, with_boundary: bool = False) -> dict:
    if with_boundary:
        source_frames = SAMPLE_RATE
    elif path.is_file():
        source_frames = inspect_rf64_pcm24(path)["sample_count"]
    else:
        source_frames = SAMPLE_RATE
    first_input = "3" * 64
    chapter_timing = [
        {
            "input_sha256": first_input,
            "entry_ids": ["crito-0001"],
            "boundary_before": {
                "kind": "start",
                "pause_ms": 0,
                "crossfade_ms": 0,
            },
            "start_frame": 0,
            "end_frame": source_frames,
            "start_seconds": 0.0,
            "end_seconds": source_frames / SAMPLE_RATE,
        }
    ]
    if with_boundary:
        pause_frames = round(SAMPLE_RATE * 0.11)
        second_start = source_frames + pause_frames
        chapter_timing.append(
            {
                "input_sha256": "4" * 64,
                "entry_ids": ["crito-0002"],
                "boundary_before": {
                    "kind": "speaker-change",
                    "pause_ms": 110,
                    "crossfade_ms": 0,
                },
                "start_frame": second_start,
                "end_frame": second_start + source_frames,
                "start_seconds": second_start / SAMPLE_RATE,
                "end_seconds": (second_start + source_frames) / SAMPLE_RATE,
            }
        )
        source_frames = second_start + source_frames
    chapter_input = "5" * 64
    chapter_timing_sha256 = content_sha256(chapter_timing)
    chapter_sidecar_sha256 = "a" * 64
    audio_sha = sha256_file(path) if path.is_file() else "6" * 64
    master_timing = [
        {
            "chapter_id": "before-dawn",
            "input_sha256": chapter_input,
            "audio_sha256": audio_sha,
            "frames": source_frames,
            "timing_sha256": chapter_timing_sha256,
            "sidecar_sha256": chapter_sidecar_sha256,
            "boundary_before": {
                "kind": "start",
                "pause_ms": 0,
                "crossfade_ms": 0,
            },
            "start_frame": 0,
            "end_frame": source_frames,
            "start_seconds": 0.0,
            "end_seconds": source_frames / SAMPLE_RATE,
        }
    ]
    chapter_starts = [
        {
            "chapter_id": "before-dawn",
            "input_sha256": chapter_input,
            "audio_sha256": audio_sha,
            "frames": source_frames,
            "timing_sha256": chapter_timing_sha256,
            "sidecar_sha256": chapter_sidecar_sha256,
            "start_frame": 0,
            "start_seconds": 0.0,
        }
    ]
    return {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "status": "verified-full-dialogue-render-assembly",
        "dialogue": "crito",
        "render_plan_sha256": "7" * 64,
        "chapters": [
            {
                "chapter_id": "before-dawn",
                "input_sha256": chapter_input,
                "audio_path": str(path.resolve()),
                "audio_sha256": audio_sha,
                "frames": source_frames,
                "duration_seconds": source_frames / SAMPLE_RATE,
                "timing_sha256": chapter_timing_sha256,
                "sidecar_sha256": chapter_sidecar_sha256,
                "timing": chapter_timing,
            }
        ],
        "complete": {
            "input_sha256": "8" * 64,
            "audio_path": str(path.resolve()),
            "audio_sha256": audio_sha,
            "frames": source_frames,
            "duration_seconds": source_frames / SAMPLE_RATE,
            "container_profile": RENDERER_RF64_CONTAINER_PROFILE,
            "timing_sha256": content_sha256(master_timing),
            "sidecar_sha256": "b" * 64,
            "chapter_starts_sha256": content_sha256(chapter_starts),
            "chapter_starts": chapter_starts,
            "timing": master_timing,
        },
    }


def fake_chapter_normalization(assembly: dict[str, object]) -> list[ChapterNormalization]:
    return [{
        "chapter_id": row["chapter_id"],
        "start_frame": row["start_frame"],
        "end_frame": row["end_frame"],
        "first_pass": fake_first_pass(),
        "commands": chapter_normalization_commands(fake_tools(), row, fake_first_pass()),
    } for row in _renderer_binding(assembly)[1]]


def source_probe(seconds: float) -> dict:
    frames = round(seconds * SAMPLE_RATE)
    data_size = frames * 3
    size_bytes = 80 + data_size + (data_size & 1)
    return {
        "format_name": "wav",
        "container_profile": RF64_CONTAINER_PROFILE,
        "rf64": {
            "profile": RF64_CONTAINER_PROFILE,
            "riff_size_bytes": size_bytes - 8,
            "data_size_bytes": data_size,
            "sample_count": frames,
            "data_offset_bytes": 80,
            "fmt_chunk_size_bytes": 16,
            "format_tag": "pcm",
            "chunk_ids": ["ds64", "fmt ", "data"],
        },
        "duration_seconds": seconds,
        "size_bytes": size_bytes,
        "codec_name": "pcm_s24le",
        "sample_format": "s32",
        "sample_rate": SAMPLE_RATE,
        "channels": 1,
        "bits_per_sample": 24,
        "bit_rate": SAMPLE_RATE * 24,
    }


class MasterAudioPureTest(unittest.TestCase):
    def test_canonicalizes_ffmpeg_rf64_padding_and_sample_count(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "odd-frame.wav"
            write_pcm24(path, seconds=1 / SAMPLE_RATE)
            payload = bytearray(path.read_bytes())
            struct.pack_into("<Q", payload, 28, 4)
            struct.pack_into("<Q", payload, 36, SAMPLE_RATE // 2)
            path.write_bytes(payload)

            with self.assertRaisesRegex(
                MasteringContractError, "PCM payload evidence is inconsistent"
            ):
                inspect_rf64_pcm24(path)
            canonicalize_ffmpeg_rf64_header(path, expected_frames=1)
            evidence = inspect_rf64_pcm24(path)
            self.assertEqual(evidence["data_size_bytes"], 3)
            self.assertEqual(evidence["sample_count"], 1)
            self.assertEqual(path.read_bytes()[-1], 0)

    def test_canonicalizes_missing_large_rf64_padding_without_adding_audio(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "large-odd-frame.wav"
            write_pcm24(path, seconds=1 / SAMPLE_RATE)
            header = bytearray(path.read_bytes()[:80])
            frames = ((1 << 32) - 1) // 3 + 2
            data_size = frames * 3
            self.assertEqual(data_size % 2, 1)
            file_size = 80 + data_size
            struct.pack_into("<QQQ", header, 20, file_size - 8, data_size, frames)
            with path.open("wb") as handle:
                handle.write(header)
                handle.truncate(file_size)
            canonicalize_ffmpeg_rf64_header(path, expected_frames=frames)
            evidence = inspect_rf64_pcm24(path)
            self.assertEqual(path.stat().st_size, file_size + 1)
            self.assertEqual(evidence["data_size_bytes"], data_size)
            self.assertEqual(evidence["sample_count"], frames)

    def test_padding_repair_rejects_missing_pcm_and_small_file_truncation(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            for frames, missing_bytes in [(1, 1), (((1 << 32) - 1) // 3 + 2, 2)]:
                with self.subTest(frames=frames, missing_bytes=missing_bytes):
                    path = Path(temp_dir) / "truncated.wav"
                    write_pcm24(path, seconds=1 / SAMPLE_RATE)
                    header = bytearray(path.read_bytes()[:80])
                    data_size = frames * 3
                    file_size = 80 + data_size + (data_size & 1) - missing_bytes
                    struct.pack_into("<QQQ", header, 20, file_size - 8, data_size, frames)
                    with path.open("wb") as handle:
                        handle.write(header)
                        handle.truncate(file_size)
                    with self.assertRaisesRegex(MasteringContractError, "payload length differs"):
                        canonicalize_ffmpeg_rf64_header(path, expected_frames=frames)
                    self.assertEqual(path.stat().st_size, file_size)

    def test_loudnorm_parser_requires_one_finite_measurement(self) -> None:
        log = """
        [Parsed_loudnorm] {
          "input_i" : "-27.20",
          "input_tp" : "-12.10",
          "input_lra" : "1.20",
          "input_thresh" : "-37.00",
          "target_offset" : "0.10"
        }
        """
        self.assertEqual(parse_loudnorm_json(log), fake_first_pass())
        with self.assertRaisesRegex(MasteringContractError, "found 0"):
            parse_loudnorm_json("no measurement")
        with self.assertRaisesRegex(MasteringContractError, "not finite"):
            parse_loudnorm_json(log.replace('"-27.20"', '"-inf"'))

    def test_silence_parser_closes_trailing_silence_and_rejects_bad_pairs(self) -> None:
        log = "\n".join(
            (
                "silence_start: 1.0",
                "silence_end: 2.0 | silence_duration: 1.0",
                "silence_start: 3.5",
            )
        )
        self.assertEqual(
            parse_silence_log(log, 4.0),
            [
                {
                    "start_seconds": 1.0,
                    "end_seconds": 2.0,
                    "duration_seconds": 1.0,
                },
                {
                    "start_seconds": 3.5,
                    "end_seconds": 4.0,
                    "duration_seconds": 0.5,
                },
            ],
        )
        with self.assertRaisesRegex(MasteringContractError, "without a start"):
            parse_silence_log("silence_end: 1.0 | silence_duration: 1.0", 2.0)

    def test_silence_parser_handles_ffmpeg_long_recording_precision(self) -> None:
        # Captured from FFmpeg silencedetect with a 10,000-second PTS offset.
        segments = parse_silence_log(
            "silence_start: 10000.1\n"
            "silence_end: 10001 | silence_duration: 0.864021", 10002.0
        )
        self.assertAlmostEqual(segments[0]["duration_seconds"], 0.864021)
        with self.assertRaisesRegex(MasteringContractError, "inconsistent"):
            parse_silence_log(
                "silence_start: 10000.1\n"
                "silence_end: 10001 | silence_duration: 0.6", 10002.0
            )

    def test_silence_duration_rounding_does_not_hide_a_failed_gate(self) -> None:
        segments = parse_silence_log(
            "silence_start: 10000.1\n"
            "silence_end: 10001.9 | silence_duration: 1.849", 10003.0
        )
        self.assertEqual(unexpected_silence_segments(segments, []), segments)

    def test_silence_rounding_cannot_hide_boundary_crossing_or_eof_duration(self) -> None:
        segments = parse_silence_log(
            "silence_start: 10000\n"
            "silence_end: 10000.8 | silence_duration: 0.85", 10000.81
        )
        boundary = {"pause_ms": 40, "start_frame": 479997600, "end_frame": 479999520}
        self.assertEqual(unexpected_silence_segments(segments, [boundary]), segments)
        eof = parse_silence_log(
            "silence_start: 10000\n"
            "silence_end: 10001.8 | silence_duration: 1.81", 10001.77
        )
        self.assertEqual(eof[0]["end_seconds"], 10001.77)
        self.assertEqual(eof[0]["duration_seconds"], 1.81)
        self.assertEqual(unexpected_silence_segments(eof, []), eof)
        with self.assertRaisesRegex(MasteringContractError, "beyond media duration"):
            parse_silence_log("silence_start: 20", 10)

    def test_silence_policy_separates_internal_prosody_from_boundary_gaps(self) -> None:
        self.assertLess(
            MAX_BOUNDARY_CROSSING_SILENCE_MS, MAX_UNEXPECTED_SILENCE_MS
        )
        boundary = {
            "kind": "speaker-change",
            "pause_ms": 140,
            "crossfade_ms": 0,
            "start_frame": SAMPLE_RATE,
            "end_frame": SAMPLE_RATE + round(SAMPLE_RATE * 0.14),
        }
        internal = {
            "start_seconds": 2.0,
            "end_seconds": 3.8,
            "duration_seconds": 1.8,
        }
        crossing = {
            "start_seconds": 0.9,
            "end_seconds": 1.8,
            "duration_seconds": 0.9,
        }
        dropout = {
            "start_seconds": 3.5,
            "end_seconds": 5.301,
            "duration_seconds": 1.801,
        }
        self.assertEqual(
            unexpected_silence_segments(
                [internal, crossing, dropout], [boundary]
            ),
            [crossing, dropout],
        )

    def test_pcm24_scan_reports_exact_clipping(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "clipped.wav"
            write_pcm24(path, seconds=0.01, clipped=True)
            runtime = resolve_analysis_runtime()
            with patch("master_audio.PCM_SCAN_FRAMES", 7):
                scan = scan_pcm24(path, runtime)
            rf64 = inspect_rf64_pcm24(path)
            self.assertEqual(path.read_bytes()[:4], b"RF64")
            self.assertEqual(rf64["profile"], RF64_CONTAINER_PROFILE)
            self.assertEqual(rf64["chunk_ids"], ["ds64", "fmt ", "data"])
            self.assertEqual(rf64["sample_count"], 480)
            self.assertEqual(scan["frames"], 480)
            self.assertEqual(scan["clipped_samples"], 1)
            self.assertEqual(scan["sample_peak_dbfs"], 0.0)

            classic = Path(raw_root) / "classic-riff.wav"
            payload = bytearray(path.read_bytes())
            payload[:4] = b"RIFF"
            classic.write_bytes(payload)
            with self.assertRaisesRegex(MasteringContractError, "forced RF64"):
                scan_pcm24(classic, runtime)

            stale = deepcopy(runtime)
            stale["inventory_sha256"] = "f" * 64
            with self.assertRaisesRegex(MasteringContractError, "runtime is stale"):
                validate_analysis_runtime(stale)

    def test_mastering_plan_is_deterministic_hash_bound_and_boundary_explicit(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "source.wav"
            assembly = assembly_for(path, with_boundary=True)
            boundaries = expected_boundaries(assembly)
            self.assertEqual(len(boundaries), 1)
            self.assertEqual(boundaries[0]["pause_ms"], 110)
            self.assertEqual(
                boundaries[0]["end_frame"] - boundaries[0]["start_frame"],
                5_280,
            )
            arguments = {
                "assembly": assembly,
                "render_plan_artifact_sha256": "9" * 64,
                "tools": fake_tools(),
                "source_probe": source_probe(assembly["complete"]["duration_seconds"]),
                "first_pass": fake_first_pass(),
                "chapter_normalization": fake_chapter_normalization(assembly),
            }
            first = build_mastering_plan(**arguments)
            second = build_mastering_plan(**arguments)
            self.assertEqual(first, second)
            self.assertEqual(first["plan_sha256"], second["plan_sha256"])
            self.assertEqual(first["commands"], second["commands"])
            self.assertEqual(first["implementation"]["name"], "plato-master-audio")
            self.assertEqual(first["implementation"]["version"], 8)
            self.assertEqual(
                first["implementation"]["code_sha256"],
                sha256_file(REPO_ROOT / "scripts" / "audio" / "master_audio.py"),
            )
            self.assertEqual(first["analysis_runtime"]["name"], "numpy")
            self.assertEqual(first["analysis_runtime"]["version"], "2.2.6")
            self.assertGreater(first["analysis_runtime"]["binary_file_count"], 0)
            self.assertEqual(
                first["chapter_timeline_sha256"],
                content_sha256(first["chapter_timeline"]),
            )
            timeline = first["chapter_timeline"]
            self.assertEqual(len(timeline), 1)
            self.assertEqual(timeline[0]["start_frame"], 0)
            self.assertEqual(
                timeline[0]["end_frame"], first["renderer"]["complete"]["frames"]
            )
            self.assertEqual(
                first["source_audio"]["renderer_chapter_timeline"][0]["timing_sha256"],
                first["renderer"]["chapters"][0]["timing_sha256"],
            )

            forged_timeline = deepcopy(first)
            forged_item = forged_timeline["source_audio"]["renderer_chapter_timeline"][0]
            forged_item["start_frame"] = 1
            forged_item["end_frame"] += 1
            forged_item["start_seconds"] = 1 / SAMPLE_RATE
            forged_item["end_seconds"] = forged_item["end_frame"] / SAMPLE_RATE
            start_fields = (
                "chapter_id",
                "input_sha256",
                "audio_sha256",
                "frames",
                "timing_sha256",
                "sidecar_sha256",
                "start_frame",
                "start_seconds",
            )
            forged_timeline["renderer"]["complete"]["chapter_starts_sha256"] = (
                content_sha256([{field: forged_item[field] for field in start_fields}])
            )
            forged_timeline["chapter_timeline_sha256"] = content_sha256(
                forged_timeline["chapter_timeline"]
            )
            forged_timeline["plan_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in forged_timeline.items()
                    if key != "plan_sha256"
                }
            )
            with self.assertRaisesRegex(
                MasteringContractError, "chapter timeline values"
            ):
                validate_mastering_plan(forged_timeline)

            stale_implementation = deepcopy(first)
            stale_implementation["implementation"]["code_sha256"] = "f" * 64
            stale_implementation["plan_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in stale_implementation.items()
                    if key != "plan_sha256"
                }
            )
            with self.assertRaisesRegex(
                MasteringContractError, "implementation identity is stale"
            ):
                validate_mastering_plan(stale_implementation)

            stale_runtime = deepcopy(first)
            stale_runtime["analysis_runtime"]["inventory_sha256"] = "f" * 64
            stale_runtime["plan_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in stale_runtime.items()
                    if key != "plan_sha256"
                }
            )
            with self.assertRaisesRegex(
                MasteringContractError, "analysis runtime is stale"
            ):
                validate_mastering_plan(stale_runtime)

            tampered = deepcopy(first)
            tampered["first_pass"]["input_i"] = -10.0
            tampered["plan_sha256"] = content_sha256(
                {key: value for key, value in tampered.items() if key != "plan_sha256"}
            )
            with self.assertRaisesRegex(MasteringContractError, "command templates"):
                validate_mastering_plan(tampered)

    def test_mastering_plan_write_rejects_a_precreated_symlink_temp(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            assembly = assembly_for(root / "source.wav")
            plan = build_mastering_plan(
                assembly=assembly,
                render_plan_artifact_sha256="9" * 64,
                tools=fake_tools(),
                source_probe=source_probe(assembly["complete"]["duration_seconds"]),
                first_pass=fake_first_pass(),
                chapter_normalization=fake_chapter_normalization(assembly),
            )
            outdir = (root / "output").resolve()
            plan_directory = outdir / "plans"
            plan_directory.mkdir(parents=True)
            uuid_hex = "a" * 32
            final = plan_directory / f"{plan['plan_sha256']}.json"
            temporary = plan_directory / f".{final.name}.{uuid_hex}.tmp"
            target = root / "must-not-change.txt"
            target.write_text("untouched", encoding="utf-8")
            temporary.symlink_to(target)

            with (
                patch(
                    "master_audio.uuid.uuid4",
                    return_value=Mock(hex=uuid_hex),
                ),
                self.assertRaisesRegex(
                    MasteringContractError, "temporary path already exists"
                ),
            ):
                write_mastering_plan(plan, outdir)

            self.assertEqual(target.read_text(encoding="utf-8"), "untouched")
            self.assertTrue(temporary.is_symlink())
            self.assertFalse(final.exists())


class MasterAudioFfmpegTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.tools = resolve_tools()

    def build_actual_plan(self, source: Path) -> tuple[dict, dict]:
        assembly = assembly_for(source)
        first_pass = measure_loudness(source, self.tools)
        probe = probe_media(source, self.tools)
        plan = build_mastering_plan(
            assembly=assembly,
            render_plan_artifact_sha256="9" * 64,
            tools=self.tools,
            source_probe=probe,
            first_pass=first_pass,
            chapter_normalization=measure_chapter_normalization(
                source, _renderer_binding(assembly)[1], self.tools
            ),
        )
        return plan, assembly

    def test_silence_edit_master_preserves_original_evidence_and_uses_derived_frames(self) -> None:
        from source_audio_edits import Cut, EditPolicy, execute_source_edit, manifest_sha256, preview_source_edit

        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            source, edited = root / "source.wav", root / "edited.wav"
            write_pcm24(source, seconds=6, silence=(2, 4))
            original_hash = sha256_file(source)
            assembly = assembly_for(source)
            renderer, timeline = _renderer_binding(assembly)
            renderer["render_plan_artifact_sha256"] = "9" * 64
            edit = preview_source_edit(
                source, original_sha256=original_hash, original_frames=6 * SAMPLE_RATE,
                chapter_timeline=timeline, boundaries=expected_boundaries(assembly),
                render_plan_artifact_sha256="9" * 64,
                cuts=[Cut(round(2.3 * SAMPLE_RATE), round(3.7 * SAMPLE_RATE), "remove excess quiet")],
                policy=EditPolicy(0, 4800, "exact-zero PCM with 100 ms retained guards"),
            )
            execute_source_edit(edit, expected_manifest_sha256=manifest_sha256(edit), output=edited)
            edit_path = root / "edit.json"
            edit_path.write_text(json.dumps(edit))
            binding = resolve_source_audio(
                assembly, "9" * 64, source_edit_path=edit_path,
                expected_source_edit_sha256=sha256_file(edit_path), edited_source_path=edited,
            )
            production_timeline, _ = validate_source_audio_binding(binding, renderer)
            plan = build_mastering_plan(
                assembly=assembly, render_plan_artifact_sha256="9" * 64, tools=self.tools,
                source_probe=probe_media(edited, self.tools), first_pass=measure_loudness(edited, self.tools),
                chapter_normalization=measure_chapter_normalization(edited, production_timeline, self.tools),
                source_audio=binding,
            )
            result, _ = execute_mastering(plan, assembly, root / "mastered")
            self.assertTrue(result["mechanical_passed"])
            self.assertFalse(result["accepted"])
            self.assertEqual(result["renderer"]["complete"]["audio_sha256"], original_hash)
            self.assertEqual(result["renderer"]["complete"]["frames"], 6 * SAMPLE_RATE)
            self.assertEqual(result["outputs"]["working_master"]["pcm"]["frames"], round(4.6 * SAMPLE_RATE))
            self.assertEqual(result["chapter_timeline"][0]["end_frame"], round(4.6 * SAMPLE_RATE))
            self.assertEqual(sha256_file(source), original_hash)
            forged = deepcopy(plan)
            forged["chapter_timeline"][0]["end_frame"] += 1
            forged["plan_sha256"] = content_sha256({key: value for key, value in forged.items() if key != "plan_sha256"})
            with self.assertRaisesRegex(MasteringContractError, "production timeline"):
                validate_mastering_plan(forged)

    def test_two_pass_normalization_publication_resume_and_tamper_rejection(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            source = root / "source.wav"
            write_pcm24(source)
            plan, assembly = self.build_actual_plan(source)
            outdir = (root / "output").resolve()
            manifest, created = execute_mastering(plan, assembly, outdir)
            self.assertTrue(created)
            self.assertTrue(manifest["mechanical_passed"])
            self.assertFalse(manifest["accepted"])
            final = outdir / "artifacts" / plan["plan_sha256"]
            qa = json.loads((final / "mechanical-qa.json").read_text())
            self.assertEqual(manifest["implementation"], plan["implementation"])
            self.assertEqual(qa["implementation"], plan["implementation"])
            self.assertEqual(manifest["schema_version"], 6)
            self.assertEqual(qa["schema_version"], 6)
            self.assertEqual(manifest["analysis_runtime"], plan["analysis_runtime"])
            self.assertEqual(qa["analysis_runtime"], plan["analysis_runtime"])
            self.assertEqual(
                manifest["outputs"]["working_master"]["probe"]["container_profile"],
                RF64_CONTAINER_PROFILE,
            )
            self.assertEqual((final / "master.wav").read_bytes()[:4], b"RF64")
            self.assertEqual(manifest["chapter_timeline"], plan["chapter_timeline"])
            self.assertEqual(qa["chapter_timeline"], plan["chapter_timeline"])
            self.assertEqual(
                manifest["chapter_timeline_sha256"],
                plan["chapter_timeline_sha256"],
            )
            self.assertEqual(qa["asr"]["status"], "not-performed")
            self.assertEqual(qa["listening"]["status"], "not-performed")
            self.assertLessEqual(
                abs(qa["measurements"]["post_master_loudness"]["input_i"] + 19),
                1,
            )
            self.assertLessEqual(
                qa["measurements"]["post_master_loudness"]["input_tp"], -1
            )
            self.assertTrue((final / "publication.mp3").is_file())

            resumed, created = execute_mastering(plan, assembly, outdir)
            self.assertFalse(created)
            self.assertEqual(resumed, manifest)

            second_outdir = (root / "second-output").resolve()
            repeated, created = execute_mastering(plan, assembly, second_outdir)
            self.assertTrue(created)
            self.assertEqual(
                repeated["outputs"]["working_master"]["sha256"],
                manifest["outputs"]["working_master"]["sha256"],
            )
            self.assertEqual(
                repeated["outputs"]["publication"]["sha256"],
                manifest["outputs"]["publication"]["sha256"],
            )

            repeated_final = second_outdir / "artifacts" / plan["plan_sha256"]
            repeated_working = repeated_final / "master.wav"
            repeated_working.write_bytes(b"coherently rehashed but not a WAV")
            repeated_qa_path = repeated_final / "mechanical-qa.json"
            repeated_manifest_path = repeated_final / "mastering.json"
            repeated_qa = json.loads(repeated_qa_path.read_text())
            repeated_manifest = json.loads(repeated_manifest_path.read_text())
            forged_sha = sha256_file(repeated_working)
            repeated_qa["outputs"]["working_master"]["sha256"] = forged_sha
            repeated_manifest["outputs"]["working_master"]["sha256"] = forged_sha
            repeated_qa["evidence_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in repeated_qa.items()
                    if key != "evidence_sha256"
                }
            )
            repeated_qa_path.write_text(
                json.dumps(repeated_qa, indent=2, sort_keys=True) + "\n"
            )
            repeated_manifest["mechanical_qa_sha256"] = sha256_file(repeated_qa_path)
            repeated_manifest_path.write_text(
                json.dumps(repeated_manifest, indent=2, sort_keys=True) + "\n"
            )
            with self.assertRaises(MasteringContractError):
                validate_result_directory(repeated_final, plan)

            with (final / "master.wav").open("ab") as handle:
                handle.write(b"tamper")
            with self.assertRaisesRegex(
                MasteringContractError,
                "RF64 ds64 size evidence|differs from current media bytes",
            ):
                validate_result_directory(final, plan)

    def test_unexpected_long_silence_is_recorded_as_mechanical_failure(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            source = root / "source-with-silence.wav"
            write_pcm24(source, seconds=5.0, silence=(2.0, 4.0))
            plan, assembly = self.build_actual_plan(source)
            outdir = (root / "output").resolve()
            manifest, created = execute_mastering(plan, assembly, outdir)
            self.assertTrue(created)
            self.assertFalse(manifest["mechanical_passed"])
            qa = json.loads(
                (
                    outdir / "artifacts" / plan["plan_sha256"] / "mechanical-qa.json"
                ).read_text()
            )
            self.assertFalse(qa["gates"]["silence_passed"])
            self.assertTrue(qa["measurements"]["unexpected_long_silences"])
            self.assertFalse(qa["acceptance"]["accepted"])

            final = outdir / "artifacts" / plan["plan_sha256"]
            qa_path = final / "mechanical-qa.json"
            manifest_path = final / "mastering.json"
            forged_qa = json.loads(qa_path.read_text())
            forged_manifest = json.loads(manifest_path.read_text())
            forged_qa["status"] = "mechanical-pass-unaccepted"
            for gate in forged_qa["gates"]:
                forged_qa["gates"][gate] = True
            forged_qa["measurements"]["unexpected_long_silences"] = []
            forged_qa["evidence_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in forged_qa.items()
                    if key != "evidence_sha256"
                }
            )
            qa_path.write_text(json.dumps(forged_qa, indent=2, sort_keys=True) + "\n")
            forged_manifest["mechanical_passed"] = True
            forged_manifest["mechanical_qa_sha256"] = sha256_file(qa_path)
            manifest_path.write_text(
                json.dumps(forged_manifest, indent=2, sort_keys=True) + "\n"
            )
            with self.assertRaisesRegex(
                MasteringContractError, "differs from current media bytes"
            ):
                validate_result_directory(final, plan)

    def test_distinct_chapter_levels_normalize_once_and_preserve_exact_gap(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source.wav"
            quiet = root / "quiet.wav"
            loud = root / "loud.wav"
            # Odd chapter lengths exercise PCM24 container padding separately from audio.
            frames = 4 * SAMPLE_RATE + 1
            gap = round(0.55 * SAMPLE_RATE)
            total = frames * 2 + gap
            write_pcm24(quiet, seconds=frames / SAMPLE_RATE, amplitude=0.008)
            write_pcm24(loud, seconds=frames / SAMPLE_RATE, amplitude=0.2)
            write_pcm24(source, seconds=total / SAMPLE_RATE, amplitude=0.0)
            with source.open("r+b") as handle:
                handle.seek(80)
                handle.write(quiet.read_bytes()[80:80 + frames * 3])
                handle.seek(80 + (frames + gap) * 3)
                handle.write(loud.read_bytes()[80:80 + frames * 3])
            assembly = assembly_for(source)
            chapter = assembly["chapters"][0]
            chapter["frames"] = frames
            chapter["duration_seconds"] = frames / SAMPLE_RATE
            chapter["timing"][0]["end_frame"] = frames
            chapter["timing"][0]["end_seconds"] = frames / SAMPLE_RATE
            chapter["timing_sha256"] = content_sha256(chapter["timing"])
            second = deepcopy(chapter)
            second["chapter_id"] = "after-dawn"
            second["input_sha256"] = "c" * 64
            assembly["chapters"].append(second)
            timing = []
            starts = []
            for index, child in enumerate(assembly["chapters"]):
                start = index * (frames + gap)
                row = {key: child[key] for key in (
                    "chapter_id", "input_sha256", "audio_sha256", "frames",
                    "timing_sha256", "sidecar_sha256"
                )}
                row.update(start_frame=start, start_seconds=start / SAMPLE_RATE)
                starts.append(deepcopy(row))
                row.update(end_frame=start + frames,
                           end_seconds=(start + frames) / SAMPLE_RATE,
                           boundary_before={"kind": "chapter" if index else "start",
                                            "pause_ms": 550 if index else 0,
                                            "crossfade_ms": 0})
                timing.append(row)
            assembly["complete"].update(timing=timing, timing_sha256=content_sha256(timing),
                                        chapter_starts=starts,
                                        chapter_starts_sha256=content_sha256(starts))
            timeline = _renderer_binding(assembly)[1]
            measured_inputs = []
            def bounded_analysis(command: list[str]) -> subprocess.CompletedProcess[str]:
                input_path = Path(command[command.index("-i") + 1])
                self.assertNotEqual(input_path, source)
                self.assertEqual(inspect_rf64_pcm24(input_path)["sample_count"], frames)
                measured_inputs.append(input_path)
                return run_ffmpeg(command)
            with patch("master_audio._run", side_effect=bounded_analysis):
                normalizations = measure_chapter_normalization(source, timeline, self.tools)
            self.assertEqual(len(measured_inputs), 2)
            self.assertTrue(all(not path.exists() for path in measured_inputs))
            self.assertGreater(abs(normalizations[0]["first_pass"]["input_i"] -
                                   normalizations[1]["first_pass"]["input_i"]), 20)
            plan = build_mastering_plan(
                assembly=assembly, render_plan_artifact_sha256="9" * 64,
                tools=self.tools, source_probe=probe_media(source, self.tools),
                first_pass=measure_loudness(source, self.tools),
                chapter_normalization=normalizations,
            )
            outdir = root / "mastered"
            result, _ = execute_mastering(plan, assembly, outdir)
            self.assertTrue(result["mechanical_passed"])
            self.assertEqual(result["source_audio"]["renderer_chapter_timeline"], timeline)
            self.assertEqual(result["chapter_timeline"], plan["chapter_timeline"])
            master = outdir / "artifacts" / plan["plan_sha256"] / "master.wav"
            self.assertEqual(inspect_rf64_pcm24(master)["sample_count"], total)
            for measured in measure_chapter_normalization(master, timeline, self.tools):
                self.assertLessEqual(abs(measured["first_pass"]["input_i"] + 19), 1)
                self.assertLessEqual(measured["first_pass"]["input_tp"], -1)
            with master.open("rb") as handle:
                handle.seek(inspect_rf64_pcm24(master)["data_offset_bytes"] + frames * 3)
                self.assertEqual(handle.read(gap * 3), bytes(gap * 3))
            self.assertFalse(list(master.parent.glob("chapter-*.wav")))
            self.assertEqual(sha256_file(source), assembly["complete"]["audio_sha256"])
            for field, changed in (("start_frame", 1), ("chapter_id", "wrong")):
                bad = deepcopy(plan)
                bad["chapter_normalization"][0][field] = changed
                bad["plan_sha256"] = content_sha256({k: v for k, v in bad.items() if k != "plan_sha256"})
                with self.assertRaisesRegex(MasteringContractError, "normalization timeline"):
                    validate_mastering_plan(bad)
            bad = deepcopy(plan)
            bad["chapter_normalization"][0]["commands"]["working_master"].append("tamper")
            bad["plan_sha256"] = content_sha256({k: v for k, v in bad.items() if k != "plan_sha256"})
            with self.assertRaisesRegex(MasteringContractError, "normalization commands"):
                validate_mastering_plan(bad)

    def test_source_mutation_during_normalization_prevents_publication(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source.wav"
            write_pcm24(source)
            plan, assembly = self.build_actual_plan(source)
            def mutate_after_normalization(
                current_source: Path, working: Path,
                chapters: list[ChapterNormalization], frames: int,
            ) -> None:
                normalize_chapters(current_source, working, chapters, frames)
                with current_source.open("r+b") as handle:
                    handle.seek(100)
                    original = handle.read(1)
                    handle.seek(100)
                    handle.write(bytes([original[0] ^ 1]))
            outdir = root / "output"
            with (
                patch("master_audio.normalize_chapters", side_effect=mutate_after_normalization),
                patch("master_audio._atomic_publish") as publish,
                self.assertRaisesRegex(MasteringContractError, "source changed during mastering"),
            ):
                execute_mastering(plan, assembly, outdir)
            publish.assert_not_called()
            self.assertFalse(list((outdir / "artifacts").iterdir()))

    def test_source_chapter_slice_copies_exact_pcm_with_odd_padding(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source, destination = root / "source.wav", root / "slice.wav"
            write_pcm24(source, seconds=10 / SAMPLE_RATE)
            original = source.read_bytes()
            write_source_chapter(source, destination, {
                "chapter_id": "slice", "start_frame": 2, "end_frame": 9,
            })
            evidence = inspect_rf64_pcm24(destination)
            self.assertEqual(evidence["sample_count"], 7)
            self.assertEqual(destination.read_bytes()[80:-1], original[86:107])
            self.assertEqual(destination.read_bytes()[-1:], b"\x00")
            self.assertEqual(source.read_bytes(), original)
            with self.assertRaisesRegex(MasteringContractError, "frame range"):
                write_source_chapter(source, root / "invalid.wav", {
                    "chapter_id": "slice", "start_frame": 2, "end_frame": 11,
                })
            self.assertFalse((root / "invalid.wav").exists())

    def test_chapter_normalization_rejects_lost_audio_frames(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / "source.wav"
            write_pcm24(source)
            assembly = assembly_for(source)
            rows = measure_chapter_normalization(source, _renderer_binding(assembly)[1], self.tools)
            def short_output(command: list[str]) -> None:
                write_pcm24(Path(command[-1]), seconds=(4 * SAMPLE_RATE - 1) / SAMPLE_RATE)
            with patch("master_audio._run", side_effect=short_output):
                with self.assertRaises(MasteringContractError):
                    normalize_chapters(source, root / "output.wav", rows, 4 * SAMPLE_RATE)
            self.assertFalse(list(root.glob("chapter-*.wav")))

    def test_declared_boundary_silence_survives_normalization(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            source = root / "source-with-boundary.wav"
            write_pcm24(source, seconds=2.11, silence=(1.0, 1.11))
            assembly = assembly_for(source, with_boundary=True)
            first_pass = measure_loudness(source, self.tools)
            probe = probe_media(source, self.tools)
            plan = build_mastering_plan(
                assembly=assembly,
                render_plan_artifact_sha256="9" * 64,
                tools=self.tools,
                source_probe=probe,
                first_pass=first_pass,
            chapter_normalization=measure_chapter_normalization(
                source, _renderer_binding(assembly)[1], self.tools
            ),
            )
            outdir = (root / "output").resolve()
            manifest, created = execute_mastering(plan, assembly, outdir)
            self.assertTrue(created)
            self.assertTrue(manifest["mechanical_passed"])
            qa = json.loads(
                (
                    outdir / "artifacts" / plan["plan_sha256"] / "mechanical-qa.json"
                ).read_text()
            )
            checks = qa["measurements"]["boundary_checks"]
            self.assertEqual(len(checks), 1)
            self.assertTrue(checks[0]["passed"])
            self.assertTrue(
                checks[0]["peak_dbfs"] is None or checks[0]["peak_dbfs"] <= -50
            )


if __name__ == "__main__":
    unittest.main()
