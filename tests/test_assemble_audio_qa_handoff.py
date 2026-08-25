from __future__ import annotations

import copy
import json
import math
import shutil
import struct
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import assemble_audio_qa_handoff as qa_handoff  # noqa: E402
from assemble_audio_qa_handoff import (  # noqa: E402
    AudioQaHandoffError,
    build_handoff,
    measure_chapters,
    validate_full_master_asr_report,
    validate_handoff,
    write_handoff,
)
from qa_full_master_asr import canonical_json, sha256_bytes  # noqa: E402
from render_dots import SAMPLE_RATE, content_sha256, sha256_file  # noqa: E402


def pcm24(value: int) -> bytes:
    if value < 0:
        value += 1 << 24
    return value.to_bytes(3, "little", signed=False)


def write_rf64(path: Path) -> None:
    maximum = (1 << 23) - 1
    payload = bytearray()
    for frame in range(SAMPLE_RATE * 2):
        if frame == 0:
            value = maximum
        else:
            amplitude = 0.08 if frame < SAMPLE_RATE else 0.04
            value = round(
                maximum * amplitude * math.sin(2 * math.pi * 220 * frame / SAMPLE_RATE)
            )
        payload.extend(pcm24(value))
    data_size = len(payload)
    padding = data_size & 1
    file_size = 80 + data_size + padding
    path.write_bytes(
        b"".join(
            (
                b"RF64",
                struct.pack("<I", (1 << 32) - 1),
                b"WAVE",
                b"ds64",
                struct.pack("<IQQQI", 28, file_size - 8, data_size, SAMPLE_RATE * 2, 0),
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
                payload,
                b"\x00" if padding else b"",
            )
        )
    )


def screenplay(cast_sha256: str) -> dict:
    return {
        "schema_version": 2,
        "dialogue": "crito",
        "source_hashes": {"english": "1" * 64, "stephanus": "2" * 64},
        "commentary_sha256": "3" * 64,
        "commentary_quality_audit_sha256": "4" * 64,
        "cast_sha256": cast_sha256,
        "generator_version": f"screenplay-generator-v3+attribution.{'5' * 64}",
        "chapters": [
            {"id": "first", "commentary_id": "comm-first"},
            {"id": "second", "commentary_id": "comm-second"},
        ],
        "entries": [
            {
                "id": "first-source",
                "chapter_id": "first",
                "kind": "source",
                "character_id": "socrates",
                "text": "Alpha beta.",
                "anchor": {"stephanus": "43a"},
                "cadence_intent": "none",
            },
            {
                "id": "first-commentary",
                "chapter_id": "first",
                "kind": "commentary",
                "character_id": "narrator",
                "text": "A short note.",
                "anchor": {"commentary_id": "comm-first"},
                "cadence_intent": "commentary",
            },
            {
                "id": "second-source",
                "chapter_id": "second",
                "kind": "source",
                "character_id": "crito",
                "text": "Gamma delta.",
                "anchor": {"stephanus": "43b"},
                "cadence_intent": "chapter",
            },
        ],
        "repairs": [],
        "coverage": {
            "source_words": 4,
            "source_words_covered": 4,
            "source_words_uncovered": 0,
            "source_words_duplicated": 0,
            "commentary_blocks_expected": 1,
            "commentary_blocks_covered": 1,
            "commentary_blocks_missing": 0,
            "commentary_blocks_duplicated": 0,
        },
    }


def renderer_chapter(chapter_id: str, marker: str) -> dict:
    return {
        "chapter_id": chapter_id,
        "input_sha256": marker * 64,
        "audio_sha256": chr(ord(marker) + 1) * 64,
        "frames": SAMPLE_RATE,
        "duration_seconds": 1.0,
        "timing_sha256": chr(ord(marker) + 2) * 64,
        "sidecar_sha256": chr(ord(marker) + 3) * 64,
    }


def timeline_item(chapter: dict, index: int) -> dict:
    start = index * SAMPLE_RATE
    return {
        **{key: value for key, value in chapter.items() if key != "duration_seconds"},
        "start_frame": start,
        "end_frame": start + SAMPLE_RATE,
        "start_seconds": float(index),
        "end_seconds": float(index + 1),
    }


class AudioQaHandoffTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.repo = self.root / "repo"
        self.repo.mkdir()
        self.cast_path = self.repo / "audio/cast.json"
        self.cast_path.parent.mkdir(parents=True)
        self.cast_path.write_text('{"fixture":"cast"}\n', encoding="utf-8")
        self.cast_sha = sha256_file(self.cast_path)
        self.screenplay = screenplay(self.cast_sha)
        self.script_path = self.repo / "audio/scripts/crito.json"
        self.script_path.parent.mkdir(parents=True)
        self.script_path.write_text(json.dumps(self.screenplay), encoding="utf-8")
        self.script_sha = sha256_file(self.script_path)
        self.render_plan_path = self.root / "render-plan.json"
        self.render_plan_sha = "b" * 64
        self.render_plan = {
            "dialogue": "crito",
            "scope": "full-dialogue",
            "plan_sha256": self.render_plan_sha,
            "chapters": ["first", "second"],
            "acceptance": {
                "screenplay_path": "audio/scripts/crito.json",
                "screenplay_sha256": self.script_sha,
                "cast_path": "audio/cast.json",
                "cast_sha256": self.cast_sha,
                "commentary_quality_audit_path": "wiki/commentary-audits/crito.json",
                "commentary_quality_audit_sha256": "1" * 64,
                "commentary_quality_validation": {"fixture": True},
                "screenplay_validation": {"fixture": True},
                "accepted_attribution_path": "audio/speaker-attributions/crito.json",
                "accepted_attribution_sha256": "2" * 64,
            },
            "cast_completion": {
                "complete_for_screenplay": True,
                "character_ids": ["socrates", "narrator", "crito"],
            },
            "tasks": [
                {
                    "input": {
                        "screenplay": {"entries": [entry]},
                        "voice": {"character_id": entry["character_id"], "seed": 44},
                    }
                }
                for entry in self.screenplay["entries"]
            ],
        }
        self.render_plan_path.write_text(json.dumps(self.render_plan), encoding="utf-8")
        first = renderer_chapter("first", "c")
        second = renderer_chapter("second", "d")
        self.timeline = [timeline_item(first, 0), timeline_item(second, 1)]
        renderer = {
            "dialogue": "crito",
            "render_plan_sha256": self.render_plan_sha,
            "render_plan_artifact_sha256": sha256_file(self.render_plan_path),
            "chapters": [first, second],
            "complete": {
                "input_sha256": "e" * 64,
                "audio_sha256": "f" * 64,
                "frames": SAMPLE_RATE * 2,
                "duration_seconds": 2.0,
                "container_profile": "rf64-pcm24",
                "timing_sha256": "1" * 64,
                "sidecar_sha256": "2" * 64,
                "chapter_starts_sha256": "3" * 64,
            },
        }
        self.mastering_plan_path = self.root / "mastering-plan.json"
        self.mastering_plan = {
            "plan_sha256": "4" * 64,
            "renderer": renderer,
            "chapter_timeline": self.timeline,
            "chapter_timeline_sha256": content_sha256(self.timeline),
            "boundaries": [],
            "tools": {
                "ffmpeg": {
                    "name": "ffmpeg",
                    "path": "/fixture/ffmpeg",
                    "sha256": "5" * 64,
                    "version": "ffmpeg version fixture",
                },
                "ffprobe": {
                    "name": "ffprobe",
                    "path": "/fixture/ffprobe",
                    "sha256": "6" * 64,
                    "version": "ffprobe version fixture",
                },
            },
        }
        self.mastering_plan_path.write_text(
            json.dumps(self.mastering_plan), encoding="utf-8"
        )
        self.renderer_outdir = self.root / "renderer"
        self.renderer_outdir.mkdir()
        self.artifact_dir = self.root / "mastering-artifact"
        self.artifact_dir.mkdir()
        self.master = self.artifact_dir / "master.wav"
        self.master.write_bytes(b"master")
        self.publication = self.artifact_dir / "publication.mp3"
        self.publication.write_bytes(b"publication")
        master_sha = sha256_file(self.master)
        pcm = {
            "frames": SAMPLE_RATE * 2,
            "duration_seconds": 2.0,
            "sample_peak_dbfs": -2.0,
            "clipped_samples": 0,
        }
        probe = {
            "format_name": "wav",
            "container_profile": "rf64-pcm24-v1",
            "rf64": {"fixture": True},
            "duration_seconds": 2.0,
            "size_bytes": self.master.stat().st_size,
            "codec_name": "pcm_s24le",
            "sample_format": "s32",
            "sample_rate": SAMPLE_RATE,
            "channels": 1,
            "bits_per_sample": 24,
            "bit_rate": SAMPLE_RATE * 24,
        }
        self.mastering_manifest = {
            "mastering_plan_sha256": self.mastering_plan["plan_sha256"],
            "renderer": renderer,
            "chapter_timeline": self.timeline,
            "chapter_timeline_sha256": content_sha256(self.timeline),
            "mechanical_qa_sha256": "5" * 64,
            "mechanical_passed": True,
            "accepted": False,
            "outputs": {
                "working_master": {
                    "filename": "master.wav",
                    "sha256": master_sha,
                    "probe": probe,
                    "pcm": pcm,
                },
                "publication": {"sha256": sha256_file(self.publication)},
            },
        }
        self.mechanical_qa = {
            "evidence_sha256": "7" * 64,
            "mastering_plan_sha256": self.mastering_plan["plan_sha256"],
            "renderer": renderer,
            "chapter_timeline": self.timeline,
            "chapter_timeline_sha256": content_sha256(self.timeline),
            "gates": {
                "loudness_passed": True,
                "clipping_passed": True,
                "duration_passed": True,
                "silence_passed": True,
                "mechanical_passed": True,
            },
            "acceptance": {"accepted": False},
            "measurements": {
                "first_pass": {
                    "input_i": -27.0,
                    "input_tp": -8.0,
                    "input_lra": 1.0,
                    "input_thresh": -37.0,
                    "target_offset": 0.0,
                },
                "post_master_loudness": {
                    "input_i": -19.0,
                    "input_tp": -1.2,
                    "input_lra": 1.0,
                    "input_thresh": -29.0,
                    "target_offset": 0.0,
                },
                "pcm": pcm,
                "publication_duration_delta_seconds": 0.0,
                "silence_segments": [],
                "unexpected_long_silences": [],
                "boundary_checks": [],
                "boundary_inventory_sha256": "7" * 64,
            },
        }
        self.production = {
            "repo_root": str(self.repo),
            "screenplay": {
                "path": "audio/scripts/crito.json",
                "sha256": self.script_sha,
                "schema_version": 2,
            },
            "render_plan": {
                "path": str(self.render_plan_path),
                "plan_sha256": self.render_plan_sha,
                "artifact_sha256": sha256_file(self.render_plan_path),
            },
            "renderer": {
                "outdir": str(self.renderer_outdir),
                "complete_input_sha256": "e" * 64,
                "complete_audio_sha256": "f" * 64,
                "chapter_starts_sha256": "3" * 64,
            },
            "mastering_plan": {
                "path": str(self.mastering_plan_path),
                "plan_sha256": self.mastering_plan["plan_sha256"],
                "artifact_sha256": sha256_file(self.mastering_plan_path),
                "chapter_timeline_sha256": content_sha256(self.timeline),
            },
            "mastering_result": {
                "directory": str(self.artifact_dir),
                "manifest_sha256": "8" * 64,
                "mechanical_qa_sha256": "5" * 64,
                "working_master_path": str(self.master),
                "working_master_sha256": master_sha,
                "accepted": False,
            },
            "files": [],
        }
        self.asr_plan = {
            "dialogue": "crito",
            "plan_sha256": "9" * 64,
            "production": self.production,
        }
        self.asr_report = {
            "production": self.production,
            "evidence_sha256": "0" * 64,
            "asr_plan_sha256": "9" * 64,
            "asr_runtime": {
                "model": {
                    "repository": "fixture/model",
                    "revision": "a" * 40,
                    "snapshot_path": str(self.root / "model"),
                    "inventory_sha256": "a" * 64,
                    "file_count": 1,
                    "total_bytes": 1,
                    "files": [{"fixture": True}],
                },
                "runtime": {"fixture": True},
            },
            "chapters": [
                self.asr_chapter(
                    "first",
                    ["first-source", "first-commentary"],
                    "Alpha beta. A short note.",
                    0,
                ),
                self.asr_chapter(
                    "second",
                    ["second-source"],
                    "Gamma delta.",
                    1,
                ),
            ],
            "corpus": {
                "expected_text_sha256": sha256_bytes(
                    b"Alpha beta. A short note. Gamma delta."
                ),
                "transcript_sha256": sha256_bytes(
                    b"alpha beta. a short note. gamma delta."
                ),
                "expected_words": 7,
                "recognized_words": 7,
                "word_errors": 0,
                "ordinary_word_errors": 0,
                "word_error_rate": 0.0,
            },
            "acceptance": qa_handoff.ASR_ACCEPTANCE,
            "human_listening": {"status": "not-performed"},
        }
        self.asr_path = self.root / "asr-artifacts" / ("0" * 64) / "asr-evidence.json"
        self.asr_path.parent.mkdir(parents=True)
        self.measurements = [
            self.measurement("first", 0, -19.0, -1.2),
            self.measurement("second", 1, -18.5, -1.4),
        ]

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def asr_chapter(
        self,
        chapter_id: str,
        entry_ids: list[str],
        expected_text: str,
        index: int,
    ) -> dict:
        transcript = expected_text.lower()
        expected_tokens = qa_handoff.normalized_words(expected_text)
        start = index * SAMPLE_RATE
        end = start + SAMPLE_RATE
        return {
            "chapter_id": chapter_id,
            "entry_ids": entry_ids,
            "start_frame": start,
            "end_frame": end,
            "start_seconds": float(index),
            "end_seconds": float(index + 1),
            "expected_text": expected_text,
            "expected_text_sha256": sha256_bytes(expected_text.encode()),
            "expected_tokens_sha256": sha256_bytes(canonical_json(expected_tokens)),
            "expected_words": len(expected_tokens),
            "transcript": transcript,
            "transcript_sha256": sha256_bytes(transcript.encode()),
            "recognized_words": len(expected_tokens),
            "word_errors": 0,
            "ordinary_word_errors": 0,
            "word_error_rate": 0.0,
            "detected_language": "en",
            "language_probability": 1.0,
        }

    def measurement(
        self, chapter_id: str, index: int, integrated: float, peak: float
    ) -> dict:
        start = index * SAMPLE_RATE
        end = start + SAMPLE_RATE
        return {
            "chapter_id": chapter_id,
            "working_master_sha256": sha256_file(self.master),
            "start_frame": start,
            "end_frame": end,
            "start_seconds": float(index),
            "end_seconds": float(index + 1),
            "commands": {
                "loudness": qa_handoff._chapter_command(
                    "/fixture/ffmpeg",
                    self.master,
                    qa_handoff._chapter_filter(
                        start,
                        end,
                        ("loudnorm=I=-19:TP=-1:LRA=11:print_format=json"),
                    ),
                ),
                "silence": qa_handoff._chapter_command(
                    "/fixture/ffmpeg",
                    self.master,
                    qa_handoff._chapter_filter(
                        start,
                        end,
                        "silencedetect=noise=-50dB:d=0.25",
                    ),
                ),
            },
            "pcm": {
                "frames": SAMPLE_RATE,
                "duration_seconds": 1.0,
                "sample_peak_dbfs": -2.0,
                "clipped_samples": 0,
            },
            "loudness": {
                "input_i": integrated,
                "input_tp": peak,
                "input_lra": 1.0,
                "input_thresh": -29.0,
                "target_offset": 0.0,
            },
            "silence_segments": [],
            "max_silence_ms": 0,
            "unexpected_silence_segments": [],
            "gates": {
                "loudness_passed": True,
                "clipping_passed": True,
                "silence_passed": True,
            },
        }

    def materialize_inputs(self) -> str:
        self.render_plan_path.write_text(json.dumps(self.render_plan), encoding="utf-8")
        render_artifact_sha = sha256_file(self.render_plan_path)
        self.mastering_plan["renderer"]["render_plan_artifact_sha256"] = (
            render_artifact_sha
        )
        self.mastering_plan_path.write_text(
            json.dumps(self.mastering_plan), encoding="utf-8"
        )
        mastering_artifact_sha = sha256_file(self.mastering_plan_path)

        mechanical_path = self.artifact_dir / "mechanical-qa.json"
        mechanical_path.write_text(json.dumps(self.mechanical_qa), encoding="utf-8")
        mechanical_sha = sha256_file(mechanical_path)
        self.mastering_manifest["mechanical_qa_sha256"] = mechanical_sha
        self.mastering_manifest["outputs"]["publication"]["sha256"] = sha256_file(
            self.publication
        )
        result_path = self.artifact_dir / "mastering.json"
        result_path.write_text(json.dumps(self.mastering_manifest), encoding="utf-8")
        result_sha = sha256_file(result_path)

        self.production["render_plan"]["artifact_sha256"] = render_artifact_sha
        self.production["mastering_plan"]["artifact_sha256"] = mastering_artifact_sha
        self.production["mastering_result"]["manifest_sha256"] = result_sha
        self.production["mastering_result"]["mechanical_qa_sha256"] = mechanical_sha
        bound_paths = [
            ("canonical-screenplay", self.script_path),
            ("canonical-cast", self.cast_path),
            ("render-plan", self.render_plan_path),
            ("mastering-plan", self.mastering_plan_path),
            ("working-master", self.master),
            ("publication-derivative", self.publication),
            ("mastering-result", result_path),
            ("mechanical-qa", mechanical_path),
        ]
        self.production["files"] = [
            {
                "label": label,
                "path": str(path),
                "sha256": sha256_file(path),
                "size_bytes": path.stat().st_size,
            }
            for label, path in bound_paths
        ]
        self.asr_report["production"] = self.production
        self.asr_path.write_text(json.dumps(self.asr_report), encoding="utf-8")
        return sha256_file(self.asr_path)

    def build(self) -> dict:
        asr_file_sha = self.materialize_inputs()
        return build_handoff(
            repo_root=self.repo,
            screenplay=self.screenplay,
            render_plan=self.render_plan,
            render_plan_path=self.render_plan_path,
            renderer_outdir=self.renderer_outdir,
            mastering_plan=self.mastering_plan,
            mastering_plan_path=self.mastering_plan_path,
            mastering_artifact_dir=self.artifact_dir,
            mastering_manifest=self.mastering_manifest,
            mechanical_qa=self.mechanical_qa,
            asr_plan=self.asr_plan,
            asr_report=self.asr_report,
            asr_path=self.asr_path,
            asr_file_sha256=asr_file_sha,
            chapter_measurements=self.measurements,
        )

    @staticmethod
    def rehash_handoff(handoff: dict) -> dict:
        core = {
            key: value for key, value in handoff.items() if key != "evidence_sha256"
        }
        handoff["evidence_sha256"] = sha256_bytes(canonical_json(core))
        return handoff

    def test_measures_each_authoritative_frame_slice_independently(self) -> None:
        master = self.root / "measured.wav"
        write_rf64(master)
        timeline = [
            {
                "chapter_id": "first",
                "start_frame": 0,
                "end_frame": SAMPLE_RATE,
            },
            {
                "chapter_id": "second",
                "start_frame": SAMPLE_RATE,
                "end_frame": SAMPLE_RATE * 2,
            },
        ]
        plan = {
            "chapter_timeline": timeline,
            "analysis_runtime": {},
            "tools": {"ffmpeg": {"path": "/fixture/ffmpeg"}},
        }
        responses = iter(
            [
                SimpleNamespace(
                    stdout="",
                    stderr='{"input_i":"-19.0","input_tp":"-1.2","input_lra":"1.0","input_thresh":"-30","target_offset":"0"}',
                ),
                SimpleNamespace(stdout="", stderr=""),
                SimpleNamespace(
                    stdout="",
                    stderr='{"input_i":"-18.5","input_tp":"-1.4","input_lra":"1.0","input_thresh":"-30","target_offset":"0"}',
                ),
                SimpleNamespace(
                    stdout="",
                    stderr="silence_start: 0.1\nsilence_end: 0.5 | silence_duration: 0.4",
                ),
            ]
        )
        pcm_results = iter(
            [
                {
                    "frames": SAMPLE_RATE,
                    "duration_seconds": 1.0,
                    "sample_peak_dbfs": 0.0,
                    "clipped_samples": 1,
                },
                {
                    "frames": SAMPLE_RATE,
                    "duration_seconds": 1.0,
                    "sample_peak_dbfs": -3.0,
                    "clipped_samples": 0,
                },
            ]
        )
        with (
            mock.patch.object(qa_handoff, "_verify_planned_tools"),
            mock.patch.object(qa_handoff, "validate_analysis_runtime"),
            mock.patch.object(
                qa_handoff,
                "_scan_pcm_interval",
                side_effect=lambda *_args, **_kwargs: next(pcm_results),
            ) as scan,
        ):
            measured = measure_chapters(
                master=master,
                expected_master_sha256=sha256_file(master),
                mastering_plan=plan,
                runner=lambda _command: next(responses),
            )
        self.assertEqual(
            [chapter["loudness"]["input_i"] for chapter in measured],
            [-19.0, -18.5],
        )
        self.assertEqual(
            [chapter["pcm"]["clipped_samples"] for chapter in measured], [1, 0]
        )
        self.assertEqual([chapter["max_silence_ms"] for chapter in measured], [0, 400])
        self.assertEqual(
            [
                (call.kwargs["start_frame"], call.kwargs["end_frame"])
                for call in scan.call_args_list
            ],
            [(0, SAMPLE_RATE), (SAMPLE_RATE, SAMPLE_RATE * 2)],
        )

    def test_interval_pcm_scanner_reads_only_the_requested_frames(self) -> None:
        try:
            import numpy
        except ImportError:
            self.skipTest("focused scanner test requires the pinned NumPy runtime")
        master = self.root / "interval-scan.wav"
        write_rf64(master)
        rf64 = qa_handoff.inspect_rf64_pcm24(master)
        with master.open("rb") as handle:
            first = qa_handoff._scan_pcm_interval(
                handle,
                data_offset=rf64["data_offset_bytes"],
                start_frame=0,
                end_frame=SAMPLE_RATE,
                numpy=numpy,
            )
            second = qa_handoff._scan_pcm_interval(
                handle,
                data_offset=rf64["data_offset_bytes"],
                start_frame=SAMPLE_RATE,
                end_frame=SAMPLE_RATE * 2,
                numpy=numpy,
            )
        self.assertEqual(first["clipped_samples"], 1)
        self.assertEqual(second["clipped_samples"], 0)
        self.assertEqual(first["frames"], SAMPLE_RATE)
        self.assertEqual(second["frames"], SAMPLE_RATE)

    def test_real_ffmpeg_loudness_is_measured_per_chapter_not_copied(self) -> None:
        try:
            import numpy
        except ImportError:
            self.skipTest(
                "FFmpeg chapter integration requires the pinned NumPy runtime"
            )
        ffmpeg = shutil.which("ffmpeg")
        if ffmpeg is None:
            self.skipTest("FFmpeg is unavailable")
        master = self.root / "ffmpeg-chapters.wav"
        write_rf64(master)
        plan = {
            "chapter_timeline": [
                {
                    "chapter_id": "first",
                    "start_frame": 0,
                    "end_frame": SAMPLE_RATE,
                },
                {
                    "chapter_id": "second",
                    "start_frame": SAMPLE_RATE,
                    "end_frame": SAMPLE_RATE * 2,
                },
            ],
            "analysis_runtime": {},
            "tools": {"ffmpeg": {"path": str(Path(ffmpeg).resolve())}},
        }
        with (
            mock.patch.object(qa_handoff, "_verify_planned_tools"),
            mock.patch.object(
                qa_handoff, "validate_analysis_runtime", return_value=numpy
            ),
        ):
            measured = measure_chapters(
                master=master,
                expected_master_sha256=sha256_file(master),
                mastering_plan=plan,
            )
        first_lufs, second_lufs = [
            chapter["loudness"]["input_i"] for chapter in measured
        ]
        self.assertGreater(first_lufs, second_lufs + 4)
        self.assertEqual(
            [chapter["pcm"]["clipped_samples"] for chapter in measured], [1, 0]
        )

    def test_validates_every_asr_metric_against_current_plan(self) -> None:
        master = self.root / "asr-master.wav"
        master.write_bytes(b"master")
        files = [
            {
                "label": "working-master",
                "path": str(master),
                "sha256": sha256_file(master),
                "size_bytes": master.stat().st_size,
            }
        ]
        expected = [
            {
                "chapter_id": "first",
                "entry_ids": ["first-source"],
                "start_frame": 0,
                "end_frame": SAMPLE_RATE,
                "start_seconds": 0.0,
                "end_seconds": 1.0,
                "expected_text": "Alpha beta.",
                "expected_text_sha256": sha256_bytes(b"Alpha beta."),
                "expected_tokens_sha256": sha256_bytes(
                    canonical_json(["alpha", "beta"])
                ),
                "expected_words": 2,
            }
        ]
        current_plan = {
            "plan_sha256": "1" * 64,
            "implementation": {"name": "fixture"},
            "dialogue": "crito",
            "production": {"files": files},
            "asr_runtime": {"model": "fixture"},
            "transcription_policy": {"policy": "fixture"},
        }
        chapter = {
            **expected[0],
            "transcript": "alpha beta",
            "transcript_sha256": sha256_bytes(b"alpha beta"),
            "recognized_words": 2,
            "word_errors": 0,
            "ordinary_word_errors": 0,
            "word_error_rate": 0.0,
            "detected_language": "en",
            "language_probability": 1.0,
        }
        core = {
            "schema_version": 1,
            "status": "full-master-asr-measured-unaccepted",
            "asr_plan_sha256": "1" * 64,
            "implementation": current_plan["implementation"],
            "dialogue": "crito",
            "production": current_plan["production"],
            "asr_runtime": current_plan["asr_runtime"],
            "transcription_policy": current_plan["transcription_policy"],
            "chapters": [chapter],
            "corpus": {
                "expected_text_sha256": sha256_bytes(b"Alpha beta."),
                "transcript_sha256": sha256_bytes(b"alpha beta"),
                "expected_words": 2,
                "recognized_words": 2,
                "word_errors": 0,
                "ordinary_word_errors": 0,
                "word_error_rate": 0.0,
            },
            "acceptance": qa_handoff.ASR_ACCEPTANCE,
            "human_listening": {"status": "not-performed"},
        }
        report = {**core, "evidence_sha256": sha256_bytes(canonical_json(core))}
        validate_full_master_asr_report(report, current_plan, expected)
        tampered = copy.deepcopy(report)
        tampered["chapters"][0]["word_errors"] = 1
        tampered_core = {
            key: value for key, value in tampered.items() if key != "evidence_sha256"
        }
        tampered["evidence_sha256"] = sha256_bytes(canonical_json(tampered_core))
        with self.assertRaisesRegex(AudioQaHandoffError, "metrics"):
            validate_full_master_asr_report(tampered, current_plan, expected)

    def test_builds_unaccepted_handoff_with_real_per_chapter_metrics(self) -> None:
        handoff = self.build()
        validate_handoff(handoff)
        self.assertEqual(handoff["schema_version"], 2)
        self.assertEqual(handoff["measurement_policy"]["schema_version"], 2)
        self.assertFalse(handoff["acceptance"]["accepted"])
        self.assertEqual(
            handoff["human_listening"], {"status": "not-performed", "passed": False}
        )
        self.assertEqual(
            [
                chapter["audio_slice"]["measurements"]["loudness"]["input_i"]
                for chapter in handoff["chapters"]
            ],
            [-19.0, -18.5],
        )
        self.assertIn(
            "accepted-qa-v2-requires-distinct-authoritative-chapter-wav-paths-and-hashes",
            handoff["promotion"]["blockers"],
        )
        self.assertEqual(handoff["promotion"]["target_schema_version"], 2)
        self.assertEqual(
            handoff["promotion"]["required_inputs"][0]["field"],
            "acceptance_review",
        )
        self.assertEqual(
            handoff["promotion"]["required_inputs"][0]["required_shape"][
                "acceptance_basis"
            ],
            (
                "complete-master-human-listening-or-"
                "operator-authorized-mechanical-and-asr-waiver"
            ),
        )

    def test_rejects_legacy_handoff_schema_v1_even_when_rehashed(self) -> None:
        handoff = self.build()
        handoff["schema_version"] = 1
        self.rehash_handoff(handoff)
        with self.assertRaisesRegex(AudioQaHandoffError, "identity or policy"):
            validate_handoff(handoff)

    def test_rejects_measurements_detached_from_mastering_timeline(self) -> None:
        self.measurements[1]["start_frame"] += 1
        with self.assertRaisesRegex(AudioQaHandoffError, "detached"):
            self.build()

    def test_rehashed_nested_tampering_fails_closed(self) -> None:
        original = self.build()

        def source_coverage(value: dict) -> None:
            value["source_coverage"]["expected_words"] += 1

        def listening(value: dict) -> None:
            value["chapters"][0]["listening"] = {
                "status": "performed",
                "passed": True,
            }

        def blockers(value: dict) -> None:
            value["promotion"]["blockers"].pop()

        def working_hash(value: dict) -> None:
            value["production"]["mastering"]["working_master_sha256"] = "f" * 64

        def chapter_gate(value: dict) -> None:
            value["chapters"][0]["audio_slice"]["measurements"]["gates"][
                "clipping_passed"
            ] = False

        def mechanical_gate(value: dict) -> None:
            value["audio"]["mechanical_gates"]["mechanical_passed"] = False

        def inventory_hash(value: dict) -> None:
            value["production"]["bound_file_inventory"]["sha256"] = "e" * 64

        def asr_exception(value: dict) -> None:
            value["asr"]["exceptions"]["status"] = "complete-zero-errors-but-edited"

        mutations = {
            "source coverage": source_coverage,
            "listening": listening,
            "promotion blockers": blockers,
            "working hash": working_hash,
            "chapter gate": chapter_gate,
            "mechanical gate": mechanical_gate,
            "bound inventory hash": inventory_hash,
            "ASR exception state": asr_exception,
        }
        for label, mutate in mutations.items():
            with self.subTest(label=label):
                tampered = copy.deepcopy(original)
                mutate(tampered)
                self.rehash_handoff(tampered)
                with self.assertRaises(AudioQaHandoffError):
                    validate_handoff(tampered)

    def test_asr_errors_remain_unaccepted_and_require_reviewed_enumeration(self) -> None:
        first = self.asr_report["chapters"][0]
        first["word_errors"] = 1
        first["ordinary_word_errors"] = 1
        first["word_error_rate"] = 0.2
        corpus = self.asr_report["corpus"]
        corpus["word_errors"] = 1
        corpus["ordinary_word_errors"] = 1
        corpus["word_error_rate"] = 1 / 7
        handoff = self.build()
        self.assertFalse(handoff["asr"]["passed"])
        self.assertEqual(
            handoff["asr"]["exceptions"],
            {
                "status": "not-enumerated-production-acceptance-review-required",
                "items": [],
            },
        )
        self.assertIn(
            "asr-errors-have-no-reviewed-exception-enumeration-or-adjudication",
            handoff["promotion"]["blockers"],
        )

    def test_failed_chapter_audio_gate_is_an_explicit_promotion_blocker(self) -> None:
        self.measurements[1]["loudness"]["input_i"] = -22.0
        self.measurements[1]["gates"]["loudness_passed"] = False
        handoff = self.build()
        self.assertIn(
            "chapter-audio-measurement-gates-failed",
            handoff["promotion"]["blockers"],
        )
        self.assertEqual(
            handoff["promotion"]["failed_chapter_ids"]["audio_measurements"],
            ["second"],
        )

    def test_writes_only_content_addressed_unaccepted_scratch_handoff(self) -> None:
        handoff = self.build()
        outdir = self.root / "scratch-qa"
        path, created = write_handoff(handoff, outdir=outdir, repo_root=self.repo)
        self.assertTrue(created)
        self.assertEqual(
            path,
            outdir / "artifacts" / handoff["evidence_sha256"] / "qa-handoff.json",
        )
        same, created_again = write_handoff(handoff, outdir=outdir, repo_root=self.repo)
        self.assertEqual(same, path)
        self.assertFalse(created_again)
        with self.assertRaisesRegex(AudioQaHandoffError, "cannot write"):
            write_handoff(
                handoff,
                outdir=self.repo / "audio/qa/corpus",
                repo_root=self.repo,
            )
        path.write_text("{}\n", encoding="utf-8")
        with self.assertRaisesRegex(AudioQaHandoffError, "corrupt"):
            write_handoff(handoff, outdir=outdir, repo_root=self.repo)
        symlinked = self.root / "symlinked-output"
        symlinked.mkdir()
        outside = self.root / "outside"
        outside.mkdir()
        (symlinked / "artifacts").symlink_to(outside, target_is_directory=True)
        with self.assertRaisesRegex(AudioQaHandoffError, "artifact root"):
            write_handoff(handoff, outdir=symlinked, repo_root=self.repo)

    def test_output_cannot_overlap_bound_input_artifact_directories(self) -> None:
        handoff = self.build()
        forbidden = (
            self.artifact_dir,
            self.artifact_dir / "qa-handoff",
            self.asr_path.parent,
            self.asr_path.parent / "qa-handoff",
        )
        for outdir in forbidden:
            with self.subTest(outdir=outdir):
                with self.assertRaisesRegex(
                    AudioQaHandoffError, "bound input artifact directory"
                ):
                    write_handoff(handoff, outdir=outdir, repo_root=self.repo)
                if outdir not in {self.artifact_dir, self.asr_path.parent}:
                    self.assertFalse(outdir.exists())

    def test_default_main_is_read_only_and_execute_requires_reviewed_hash(self) -> None:
        handoff = self.build()
        inputs = {
            "repo_root": self.repo,
            "asr_plan": {
                "production": {
                    "mastering_result": {
                        "working_master_path": str(self.master),
                        "working_master_sha256": sha256_file(self.master),
                    }
                }
            },
            "mastering_plan": self.mastering_plan,
        }
        base_args = {
            "render_plan": Path("render-plan.json"),
            "expected_render_plan_sha256": "1" * 64,
            "renderer_outdir": Path("renderer"),
            "mastering_plan": Path("mastering-plan.json"),
            "expected_mastering_plan_sha256": "2" * 64,
            "mastering_outdir": Path("mastering"),
            "cache_dir": Path("cache"),
            "full_master_asr": Path("asr.json"),
            "expected_full_master_asr_file_sha256": "3" * 64,
            "repo_root": self.repo,
            "outdir": self.root / "unused",
        }
        with (
            mock.patch.object(
                qa_handoff,
                "parse_args",
                return_value=SimpleNamespace(
                    **base_args,
                    expected_handoff_sha256=None,
                    execute=False,
                ),
            ),
            mock.patch.object(qa_handoff, "load_current_inputs", return_value=inputs),
            mock.patch.object(qa_handoff, "measure_chapters", return_value=[]),
            mock.patch.object(qa_handoff, "verify_current_input_bytes"),
            mock.patch.object(qa_handoff, "build_handoff", return_value=handoff),
            mock.patch.object(qa_handoff, "write_handoff") as write,
        ):
            self.assertEqual(qa_handoff.main(), 0)
        write.assert_not_called()

        with (
            mock.patch.object(
                qa_handoff,
                "parse_args",
                return_value=SimpleNamespace(
                    **base_args,
                    expected_handoff_sha256=None,
                    execute=True,
                ),
            ),
            mock.patch.object(qa_handoff, "load_current_inputs", return_value=inputs),
            mock.patch.object(qa_handoff, "measure_chapters", return_value=[]),
            mock.patch.object(qa_handoff, "verify_current_input_bytes"),
            mock.patch.object(qa_handoff, "build_handoff", return_value=handoff),
            mock.patch.object(qa_handoff, "write_handoff") as write,
        ):
            with self.assertRaisesRegex(SystemExit, "requires"):
                qa_handoff.main()
        write.assert_not_called()


if __name__ == "__main__":
    unittest.main()
