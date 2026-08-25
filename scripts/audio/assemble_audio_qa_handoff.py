#!/usr/bin/env python3
"""Assemble exact, measured, still-unaccepted production audio QA evidence.

The default invocation performs the complete read-only preflight and chapter
measurement pass, then prints the content address it would write. ``--execute``
requires that reviewed SHA-256 and writes one content-addressed scratch JSON
handoff. This command never writes ``audio/qa`` or ``wiki/recordings`` and can
never claim that human listening occurred.
"""

from __future__ import annotations

import argparse
import copy
import json
import math
import os
import re
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import Any, Callable

from master_audio import (
    LOUDNESS_KEYS,
    MAX_BOUNDARY_CROSSING_SILENCE_MS,
    MAX_UNEXPECTED_SILENCE_MS,
    PCM_SCAN_FRAMES,
    PRODUCTION_SAMPLE_WIDTH_BYTES,
    PUBLICATION_DURATION_TOLERANCE_SECONDS,
    SILENCE_MIN_SECONDS,
    SILENCE_NOISE_DB,
    TARGET_INTEGRATED_LUFS,
    TARGET_LRA_LU,
    TARGET_TOLERANCE_LU,
    TRUE_PEAK_LIMIT_DBTP,
    MasteringContractError,
    inspect_rf64_pcm24,
    load_mastering_plan,
    parse_loudnorm_json,
    parse_silence_log,
    unexpected_silence_segments,
    validate_analysis_runtime,
)
from qa_full_master_asr import (
    EVIDENCE_FILENAME as ASR_EVIDENCE_FILENAME,
    FullMasterAsrError,
    canonical_json,
    load_current_asr_plan,
    normalized_words,
    sha256_bytes,
    validate_evidence as validate_asr_evidence,
    verify_bound_files,
    word_edit_distance,
)
from render_dots import (
    SAMPLE_RATE,
    RenderContractError,
    content_sha256,
    load_render_plan_artifact,
    sha256_file,
    validate_screenplay,
)


SCHEMA_VERSION = 2
STATUS = "production-audio-qa-handoff-unaccepted"
IMPLEMENTATION_NAME = "plato-audio-qa-handoff"
IMPLEMENTATION_VERSION = 2
HANDOFF_FILENAME = "qa-handoff.json"
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")

MAX_WORD_ERROR_RATE = 0.02
MAX_ORDINARY_WORD_ERRORS = 0

MEASUREMENT_POLICY = {
    "schema_version": 2,
    "source": "authoritative-mastering-v6-working-master-frame-slices",
    "sample_rate_hz": SAMPLE_RATE,
    "sample_format": "PCM_24",
    "channels": 1,
    "loudness": {
        "filter": "ffmpeg-loudnorm-analysis-per-exact-frame-slice",
        "integrated_lufs": TARGET_INTEGRATED_LUFS,
        "tolerance_lu": TARGET_TOLERANCE_LU,
        "true_peak_limit_dbtp": TRUE_PEAK_LIMIT_DBTP,
        "loudness_range_lu": TARGET_LRA_LU,
    },
    "clipping": "numpy-vectorized-exact-pcm24-frame-slice-v1",
    "silence": {
        "filter": "ffmpeg-silencedetect-per-exact-frame-slice",
        "noise_db": SILENCE_NOISE_DB,
        "minimum_seconds": SILENCE_MIN_SECONDS,
        "maximum_internal_ms": MAX_UNEXPECTED_SILENCE_MS,
        "maximum_boundary_crossing_ms": MAX_BOUNDARY_CROSSING_SILENCE_MS,
    },
    "asr": {
        "maximum_word_error_rate": MAX_WORD_ERROR_RATE,
        "maximum_ordinary_word_errors": MAX_ORDINARY_WORD_ERRORS,
        "exceptions": "fail-closed-unreviewed-errors-are-not-promotable",
    },
    "human_listening": (
        "not-performed-here; schema-v2 production acceptance requires either "
        "completed listening or an explicit operator-authorized waiver"
    ),
}

ASR_ACCEPTANCE = {
    "accepted": False,
    "reason": (
        "mechanical ASR evidence only; no human listening or production "
        "recording acceptance was performed"
    ),
}


class AudioQaHandoffError(ValueError):
    """Raised when an honest production QA handoff cannot be assembled."""


def _sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise AudioQaHandoffError(f"{label} must be a lowercase SHA-256")
    return value


def _read_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AudioQaHandoffError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise AudioQaHandoffError(f"{label} must be a JSON object: {path}")
    return value


def _finite(value: Any, label: str) -> float:
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
    ):
        raise AudioQaHandoffError(f"{label} must be a finite number")
    return float(value)


def implementation_identity() -> dict[str, Any]:
    source = Path(__file__).resolve(strict=True)
    return {
        "name": IMPLEMENTATION_NAME,
        "version": IMPLEMENTATION_VERSION,
        "code_path": str(source),
        "code_sha256": sha256_file(source),
    }


def _run(command: list[str]) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        env={
            **os.environ,
            "LC_ALL": "C",
            "LANG": "C",
            "SOURCE_DATE_EPOCH": "0",
        },
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise AudioQaHandoffError(
            f"chapter measurement command failed ({result.returncode}): {detail}"
        )
    return result


def _verify_planned_tools(
    mastering_plan: dict[str, Any],
    *,
    runner: Callable[[list[str]], subprocess.CompletedProcess[str]] = _run,
) -> None:
    for name in ("ffmpeg", "ffprobe"):
        evidence = mastering_plan["tools"][name]
        path = Path(evidence["path"])
        if (
            path.is_symlink()
            or not path.is_file()
            or path.resolve(strict=True) != path
            or sha256_file(path) != evidence["sha256"]
        ):
            raise AudioQaHandoffError(
                f"planned {name} executable is missing, symlinked, or changed"
            )
        result = runner([str(path), "-version"])
        first_line = result.stdout.splitlines()[0].strip() if result.stdout else ""
        if first_line != evidence["version"]:
            raise AudioQaHandoffError(f"planned {name} version line changed")


def _validate_asr_chapter(
    chapter: dict[str, Any], expected: dict[str, Any], index: int
) -> None:
    expected_fields = set(expected)
    result_fields = expected_fields | {
        "transcript",
        "transcript_sha256",
        "recognized_words",
        "word_errors",
        "ordinary_word_errors",
        "word_error_rate",
        "detected_language",
        "language_probability",
    }
    if not isinstance(chapter, dict) or set(chapter) != result_fields:
        raise AudioQaHandoffError(f"full-master ASR chapter {index} fields are invalid")
    if any(chapter[field] != value for field, value in expected.items()):
        raise AudioQaHandoffError(
            f"full-master ASR chapter {index} differs from current expected text"
        )
    transcript = chapter["transcript"]
    if not isinstance(transcript, str) or transcript != transcript.strip():
        raise AudioQaHandoffError(
            f"full-master ASR chapter {index} transcript is invalid"
        )
    expected_tokens = normalized_words(expected["expected_text"])
    recognized_tokens = normalized_words(transcript)
    errors = word_edit_distance(expected_tokens, recognized_tokens)
    expected_rate = errors / len(expected_tokens)
    if (
        chapter["transcript_sha256"] != sha256_bytes(transcript.encode("utf-8"))
        or chapter["recognized_words"] != len(recognized_tokens)
        or chapter["word_errors"] != errors
        or chapter["ordinary_word_errors"] != errors
        or _finite(chapter["word_error_rate"], "ASR word error rate") != expected_rate
        or not isinstance(chapter["detected_language"], str)
        or not chapter["detected_language"]
        or not 0
        <= _finite(chapter["language_probability"], "ASR language probability")
        <= 1
    ):
        raise AudioQaHandoffError(
            f"full-master ASR chapter {index} metrics are inconsistent"
        )


def validate_full_master_asr_report(
    report: dict[str, Any],
    current_plan: dict[str, Any],
    expected: list[dict[str, Any]],
) -> None:
    validate_asr_evidence(report)
    if set(report) != {
        "schema_version",
        "status",
        "evidence_sha256",
        "asr_plan_sha256",
        "implementation",
        "dialogue",
        "production",
        "asr_runtime",
        "transcription_policy",
        "chapters",
        "corpus",
        "acceptance",
        "human_listening",
    }:
        raise AudioQaHandoffError("full-master ASR evidence fields are invalid")
    if (
        report["asr_plan_sha256"] != current_plan["plan_sha256"]
        or report["implementation"] != current_plan["implementation"]
        or report["dialogue"] != current_plan["dialogue"]
        or report["production"] != current_plan["production"]
        or report["asr_runtime"] != current_plan["asr_runtime"]
        or report["transcription_policy"] != current_plan["transcription_policy"]
        or report["acceptance"] != ASR_ACCEPTANCE
        or report["human_listening"] != {"status": "not-performed"}
    ):
        raise AudioQaHandoffError(
            "full-master ASR evidence is stale or falsely accepted"
        )
    chapters = report["chapters"]
    if not isinstance(chapters, list) or len(chapters) != len(expected):
        raise AudioQaHandoffError("full-master ASR chapter coverage is incomplete")
    for index, (chapter, expected_chapter) in enumerate(
        zip(chapters, expected, strict=True)
    ):
        _validate_asr_chapter(chapter, expected_chapter, index)

    expected_text = " ".join(chapter["expected_text"] for chapter in chapters)
    transcript = " ".join(chapter["transcript"] for chapter in chapters).strip()
    expected_corpus = {
        "expected_text_sha256": sha256_bytes(expected_text.encode("utf-8")),
        "transcript_sha256": sha256_bytes(transcript.encode("utf-8")),
        "expected_words": sum(chapter["expected_words"] for chapter in chapters),
        "recognized_words": sum(chapter["recognized_words"] for chapter in chapters),
        "word_errors": sum(chapter["word_errors"] for chapter in chapters),
        "ordinary_word_errors": sum(
            chapter["ordinary_word_errors"] for chapter in chapters
        ),
        "word_error_rate": sum(chapter["word_errors"] for chapter in chapters)
        / sum(chapter["expected_words"] for chapter in chapters),
    }
    if report["corpus"] != expected_corpus:
        raise AudioQaHandoffError("full-master ASR corpus metrics are inconsistent")
    verify_bound_files(report["production"]["files"])


def _scan_pcm_interval(
    handle: Any,
    *,
    data_offset: int,
    start_frame: int,
    end_frame: int,
    numpy: Any,
) -> dict[str, Any]:
    frames = end_frame - start_frame
    handle.seek(data_offset + start_frame * PRODUCTION_SAMPLE_WIDTH_BYTES)
    peak = 0
    clipped = 0
    scanned = 0
    while scanned < frames:
        requested = min(PCM_SCAN_FRAMES, frames - scanned)
        raw = handle.read(requested * PRODUCTION_SAMPLE_WIDTH_BYTES)
        if len(raw) != requested * PRODUCTION_SAMPLE_WIDTH_BYTES:
            raise AudioQaHandoffError(
                "working master ended before an authoritative chapter frame slice"
            )
        octets = numpy.frombuffer(raw, dtype=numpy.uint8).reshape((-1, 3))
        values = (
            octets[:, 0].astype(numpy.int32)
            | (octets[:, 1].astype(numpy.int32) << 8)
            | (octets[:, 2].astype(numpy.int32) << 16)
        )
        values = (values ^ 0x800000) - 0x800000
        peak = max(
            peak,
            int(numpy.max(numpy.abs(values.astype(numpy.int64)))),
        )
        clipped += int(
            numpy.count_nonzero((values == -(1 << 23)) | (values == (1 << 23) - 1))
        )
        scanned += requested
    return {
        "frames": frames,
        "duration_seconds": frames / SAMPLE_RATE,
        "sample_peak_dbfs": (
            None if peak == 0 else 20 * math.log10(peak / ((1 << 23) - 1))
        ),
        "clipped_samples": clipped,
    }


def _chapter_filter(start_frame: int, end_frame: int, terminal: str) -> str:
    return (
        f"atrim=start_sample={start_frame}:end_sample={end_frame},"
        f"asetpts=N/SR/TB,{terminal}"
    )


def _chapter_command(ffmpeg: str, master: Path, audio_filter: str) -> list[str]:
    return [
        ffmpeg,
        "-hide_banner",
        "-nostdin",
        "-v",
        "info",
        "-i",
        str(master),
        "-map_metadata",
        "-1",
        "-vn",
        "-af",
        audio_filter,
        "-f",
        "null",
        "-",
    ]


def measure_chapters(
    *,
    master: Path,
    expected_master_sha256: str,
    mastering_plan: dict[str, Any],
    runner: Callable[[list[str]], subprocess.CompletedProcess[str]] = _run,
) -> list[dict[str, Any]]:
    expected_digest = _sha256(expected_master_sha256, "working master SHA-256")
    if (
        master.is_symlink()
        or not master.is_file()
        or sha256_file(master) != expected_digest
    ):
        raise AudioQaHandoffError("working master bytes differ before chapter QA")
    _verify_planned_tools(mastering_plan, runner=runner)
    numpy = validate_analysis_runtime(mastering_plan["analysis_runtime"])
    rf64 = inspect_rf64_pcm24(master)
    timeline = mastering_plan["chapter_timeline"]
    if (
        not isinstance(timeline, list)
        or not timeline
        or timeline[-1].get("end_frame") != rf64["sample_count"]
    ):
        raise AudioQaHandoffError(
            "mastering timeline does not end at the authoritative working master"
        )

    ffmpeg = mastering_plan["tools"]["ffmpeg"]["path"]
    loudnorm = (
        f"loudnorm=I={TARGET_INTEGRATED_LUFS:g}:TP={TRUE_PEAK_LIMIT_DBTP:g}:"
        f"LRA={TARGET_LRA_LU:g}:print_format=json"
    )
    silencedetect = (
        f"silencedetect=noise={SILENCE_NOISE_DB:g}dB:d={SILENCE_MIN_SECONDS:g}"
    )
    measurements: list[dict[str, Any]] = []
    with master.open("rb") as handle:
        for timing in timeline:
            start = timing["start_frame"]
            end = timing["end_frame"]
            pcm = _scan_pcm_interval(
                handle,
                data_offset=rf64["data_offset_bytes"],
                start_frame=start,
                end_frame=end,
                numpy=numpy,
            )
            loudness_command = _chapter_command(
                ffmpeg,
                master,
                _chapter_filter(start, end, loudnorm),
            )
            loudness_result = runner(loudness_command)
            loudness = parse_loudnorm_json(loudness_result.stderr)
            silence_command = _chapter_command(
                ffmpeg,
                master,
                _chapter_filter(start, end, silencedetect),
            )
            silence_result = runner(silence_command)
            local_silences = parse_silence_log(
                silence_result.stderr, pcm["duration_seconds"]
            )
            silences = [
                {
                    **segment,
                    "master_start_seconds": start / SAMPLE_RATE
                    + segment["start_seconds"],
                    "master_end_seconds": start / SAMPLE_RATE + segment["end_seconds"],
                }
                for segment in local_silences
            ]
            max_silence_ms = max(
                (round(segment["duration_seconds"] * 1000) for segment in silences),
                default=0,
            )
            unexpected = [
                segment
                for segment in silences
                if round(segment["duration_seconds"] * 1000) > MAX_UNEXPECTED_SILENCE_MS
            ]
            gates = {
                "loudness_passed": (
                    abs(loudness["input_i"] - TARGET_INTEGRATED_LUFS)
                    <= TARGET_TOLERANCE_LU
                    and loudness["input_tp"] <= TRUE_PEAK_LIMIT_DBTP
                ),
                "clipping_passed": pcm["clipped_samples"] == 0,
                "silence_passed": not unexpected,
            }
            measurements.append(
                {
                    "chapter_id": timing["chapter_id"],
                    "working_master_sha256": expected_digest,
                    "start_frame": start,
                    "end_frame": end,
                    "start_seconds": start / SAMPLE_RATE,
                    "end_seconds": end / SAMPLE_RATE,
                    "commands": {
                        "loudness": loudness_command,
                        "silence": silence_command,
                    },
                    "pcm": pcm,
                    "loudness": loudness,
                    "silence_segments": silences,
                    "max_silence_ms": max_silence_ms,
                    "unexpected_silence_segments": unexpected,
                    "gates": gates,
                }
            )

    if sha256_file(master) != expected_digest:
        raise AudioQaHandoffError("working master changed during chapter QA")
    _verify_planned_tools(mastering_plan, runner=runner)
    return measurements


def _sorted_unique(values: list[str]) -> list[str]:
    return sorted(set(values))


def _render_voice_consistency(render_plan: dict[str, Any]) -> list[str]:
    identities: dict[str, set[str]] = {}
    for task in render_plan["tasks"]:
        entries = task["input"]["screenplay"]["entries"]
        character_id = entries[0]["character_id"]
        identities.setdefault(character_id, set()).add(
            content_sha256(task["input"]["voice"])
        )
    return sorted(
        character_id
        for character_id, digests in identities.items()
        if len(digests) != 1
    )


def _validate_upstream_alignment(
    *,
    screenplay: dict[str, Any],
    render_plan: dict[str, Any],
    mastering_plan: dict[str, Any],
    mastering_manifest: dict[str, Any],
    mechanical_qa: dict[str, Any],
    asr_report: dict[str, Any],
    chapter_measurements: list[dict[str, Any]],
) -> None:
    validate_screenplay(screenplay)
    chapter_ids = [chapter["id"] for chapter in screenplay["chapters"]]
    timeline = mastering_plan["chapter_timeline"]
    bound_ids = [chapter["chapter_id"] for chapter in timeline]
    if (
        render_plan["scope"] != "full-dialogue"
        or render_plan["chapters"] != chapter_ids
        or bound_ids != chapter_ids
        or [chapter["chapter_id"] for chapter in asr_report["chapters"]] != chapter_ids
        or [chapter["chapter_id"] for chapter in chapter_measurements] != chapter_ids
    ):
        raise AudioQaHandoffError(
            "screenplay, render graph, mastering timeline, ASR, and measurements disagree"
        )
    renderer = mastering_plan["renderer"]
    if renderer["render_plan_sha256"] != render_plan["plan_sha256"]:
        raise AudioQaHandoffError("mastering renderer differs from the render graph")
    if (
        mastering_manifest.get("renderer") != renderer
        or mechanical_qa.get("renderer") != renderer
        or mastering_manifest.get("chapter_timeline") != timeline
        or mechanical_qa.get("chapter_timeline") != timeline
        or mastering_manifest.get("chapter_timeline_sha256")
        != mastering_plan["chapter_timeline_sha256"]
        or mechanical_qa.get("chapter_timeline_sha256")
        != mastering_plan["chapter_timeline_sha256"]
        or mastering_manifest.get("mastering_plan_sha256")
        != mastering_plan["plan_sha256"]
        or mechanical_qa.get("mastering_plan_sha256") != mastering_plan["plan_sha256"]
        or mastering_manifest.get("mechanical_passed") is not True
        or mechanical_qa.get("gates", {}).get("mechanical_passed") is not True
        or mastering_manifest.get("accepted") is not False
        or mechanical_qa.get("acceptance", {}).get("accepted") is not False
    ):
        raise AudioQaHandoffError(
            "mastering result or mechanical QA differs from the reviewed plan"
        )
    for timing, measurement in zip(timeline, chapter_measurements, strict=True):
        if any(
            measurement[field] != timing[field]
            for field in (
                "chapter_id",
                "start_frame",
                "end_frame",
                "start_seconds",
                "end_seconds",
            )
        ):
            raise AudioQaHandoffError(
                "chapter measurements are detached from the mastering timeline"
            )


def _promotion_contract(
    dialogue: str,
    *,
    asr_errors: int,
    chapter_audio_failures: list[str],
    chapter_asr_failures: list[str],
) -> dict[str, Any]:
    blockers = [
        "schema-v2-production-acceptance-review-not-provided",
        "accepted-qa-v2-requires-distinct-authoritative-chapter-wav-paths-and-hashes",
        "artifact-store-relative-master-and-chapter-paths-not-assigned",
        "accepted-qa-generated-at-and-final-status-not-assigned",
    ]
    if asr_errors:
        blockers.append(
            "asr-errors-have-no-reviewed-exception-enumeration-or-adjudication"
        )
    if chapter_audio_failures:
        blockers.append("chapter-audio-measurement-gates-failed")
    if chapter_asr_failures:
        blockers.append("chapter-asr-gates-failed")
    return {
        "target_path": f"audio/qa/{dialogue}.json",
        "target_schema_version": 2,
        "accepted": False,
        "promotion_status": "blocked-explicit-input-required",
        "blockers": blockers,
        "failed_chapter_ids": {
            "audio_measurements": chapter_audio_failures,
            "asr": chapter_asr_failures,
        },
        "required_inputs": [
            {
                "field": "acceptance_review",
                "owner": "production-acceptance-authorizer",
                "required_shape": {
                    "schema_version": 2,
                    "handoff_evidence_sha256": "this-exact-handoff",
                    "working_master_sha256": "this-exact-working-master",
                    "acceptance_basis": (
                        "complete-master-human-listening-or-"
                        "operator-authorized-mechanical-and-asr-waiver"
                    ),
                    "authorized_by": "non-empty-authorizer-identity",
                    "authorized_at": "YYYY-MM-DD",
                    "rationale": "non-empty-explicit-rationale",
                    "listening_status": (
                        "performed-or-not-performed-as-required-by-basis"
                    ),
                    "accepted_chapter_ids": "every-screenplay-chapter-in-order",
                    "disposition": "accepted-or-accepted-with-listening-waiver",
                    "findings": "explicit-reviewed-findings-array",
                    "asr_exceptions": (
                        "complete-reviewed-enumeration-of-any-word-errors"
                    ),
                },
            },
            {
                "field": "chapters[*].listening_disposition/listening_passed",
                "owner": "promotion-command",
                "required_shape": (
                    "performed-and-passing only for the listening basis; "
                    "not-performed and false for the operator-waiver basis"
                ),
            },
            {
                "field": "audio.master_path and chapters[*].audio_path/audio_sha256",
                "owner": "artifact-promotion",
                "required_shape": (
                    "artifact-store-relative master plus distinct authoritative "
                    "post-master chapter WAV artifacts"
                ),
            },
            {
                "field": "generated_at and status",
                "owner": "promotion-command",
                "required_shape": "explicit UTC timestamp and conjunctive final status",
            },
            {
                "field": "asr.exceptions",
                "owner": "production-acceptance-authorizer-if-word-errors-exist",
                "required_shape": (
                    "every word error enumerated, classified, and reviewed; no "
                    "ordinary errors are permitted"
                ),
            },
        ],
    }


def build_handoff(
    *,
    repo_root: Path,
    screenplay: dict[str, Any],
    render_plan: dict[str, Any],
    render_plan_path: Path,
    renderer_outdir: Path,
    mastering_plan: dict[str, Any],
    mastering_plan_path: Path,
    mastering_artifact_dir: Path,
    mastering_manifest: dict[str, Any],
    mechanical_qa: dict[str, Any],
    asr_plan: dict[str, Any],
    asr_report: dict[str, Any],
    asr_path: Path,
    asr_file_sha256: str,
    chapter_measurements: list[dict[str, Any]],
) -> dict[str, Any]:
    _validate_upstream_alignment(
        screenplay=screenplay,
        render_plan=render_plan,
        mastering_plan=mastering_plan,
        mastering_manifest=mastering_manifest,
        mechanical_qa=mechanical_qa,
        asr_report=asr_report,
        chapter_measurements=chapter_measurements,
    )
    dialogue = screenplay["dialogue"]
    acceptance = render_plan["acceptance"]
    if (
        asr_plan["dialogue"] != dialogue
        or screenplay["cast_sha256"] != acceptance["cast_sha256"]
        or mastering_plan["renderer"]["render_plan_artifact_sha256"]
        != sha256_file(render_plan_path)
        or acceptance["screenplay_sha256"]
        != sha256_file(repo_root / acceptance["screenplay_path"])
        or asr_report["production"] != asr_plan["production"]
    ):
        raise AudioQaHandoffError("canonical production identities disagree")

    metric_by_id = {
        measurement["chapter_id"]: measurement for measurement in chapter_measurements
    }
    asr_by_id = {chapter["chapter_id"]: chapter for chapter in asr_report["chapters"]}
    renderer_by_id = {
        chapter["chapter_id"]: chapter
        for chapter in mastering_plan["renderer"]["chapters"]
    }
    chapters: list[dict[str, Any]] = []
    for chapter in screenplay["chapters"]:
        chapter_id = chapter["id"]
        entries = [
            entry
            for entry in screenplay["entries"]
            if entry["chapter_id"] == chapter_id
        ]
        source_words = sum(
            len(normalized_words(entry["text"]))
            for entry in entries
            if entry["kind"] == "source"
        )
        commentary_ids = _sorted_unique(
            [
                entry["anchor"]["commentary_id"]
                for entry in entries
                if entry["kind"] == "commentary"
            ]
        )
        cast_ids = _sorted_unique([entry["character_id"] for entry in entries])
        asr = asr_by_id[chapter_id]
        metrics = metric_by_id[chapter_id]
        spoken_words = sum(len(normalized_words(entry["text"])) for entry in entries)
        if asr["expected_words"] != spoken_words:
            raise AudioQaHandoffError(
                f"chapter {chapter_id} ASR word count differs from screenplay"
            )
        chapters.append(
            {
                "chapter_id": chapter_id,
                "source_coverage": {
                    "expected_words": source_words,
                    "covered_words": source_words,
                    "uncovered_words": 0,
                    "duplicated_words": 0,
                    "passed": True,
                },
                "commentary_coverage": {
                    "expected_ids": commentary_ids,
                    "covered_ids": commentary_ids,
                    "missing_ids": [],
                    "duplicate_ids": [],
                    "passed": True,
                },
                "cast": {
                    "character_ids": cast_ids,
                    "unresolved_character_ids": [],
                    "mismatched_character_ids": [],
                    "passed": True,
                },
                "asr": {
                    "expected_words": asr["expected_words"],
                    "recognized_words": asr["recognized_words"],
                    "word_errors": asr["word_errors"],
                    "ordinary_word_errors": asr["ordinary_word_errors"],
                    "word_error_rate": asr["word_error_rate"],
                    "transcript_sha256": asr["transcript_sha256"],
                    "passed": (
                        asr["word_error_rate"] <= MAX_WORD_ERROR_RATE
                        and asr["ordinary_word_errors"] <= MAX_ORDINARY_WORD_ERRORS
                    ),
                },
                "audio_slice": {
                    "working_master_path": asr_plan["production"]["mastering_result"][
                        "working_master_path"
                    ],
                    "working_master_sha256": metrics["working_master_sha256"],
                    "start_frame": metrics["start_frame"],
                    "end_frame": metrics["end_frame"],
                    "start_seconds": metrics["start_seconds"],
                    "end_seconds": metrics["end_seconds"],
                    "renderer_chapter": copy.deepcopy(renderer_by_id[chapter_id]),
                    "measurements": copy.deepcopy(metrics),
                },
                "listening": {"status": "not-performed", "passed": False},
                "accepted": False,
            }
        )

    script_character_ids = _sorted_unique(
        [entry["character_id"] for entry in screenplay["entries"]]
    )
    selected_ids = sorted(render_plan["cast_completion"]["character_ids"])
    unresolved_ids = sorted(set(script_character_ids) - set(selected_ids))
    recurring_changes = _render_voice_consistency(render_plan)
    cast_passed = (
        script_character_ids == selected_ids
        and not unresolved_ids
        and not recurring_changes
    )
    if not cast_passed:
        raise AudioQaHandoffError(
            "render graph cannot support a consistent complete-master cast result"
        )

    commentary_ids = _sorted_unique(
        [
            entry["anchor"]["commentary_id"]
            for entry in screenplay["entries"]
            if entry["kind"] == "commentary"
        ]
    )
    coverage = screenplay["coverage"]
    corpus_asr = asr_report["corpus"]
    asr_passed = (
        corpus_asr["word_error_rate"] <= MAX_WORD_ERROR_RATE
        and corpus_asr["ordinary_word_errors"] <= MAX_ORDINARY_WORD_ERRORS
    )
    working = mastering_manifest["outputs"]["working_master"]
    post_loudness = mechanical_qa["measurements"]["post_master_loudness"]
    complete_audio = {
        "working_master_path": asr_plan["production"]["mastering_result"][
            "working_master_path"
        ],
        "working_master_sha256": working["sha256"],
        "duration_seconds": working["probe"]["duration_seconds"],
        "sample_rate_hz": working["probe"]["sample_rate"],
        "channels": working["probe"]["channels"],
        "sample_format": "PCM_24",
        "target_lufs": TARGET_INTEGRATED_LUFS,
        "tolerance_lu": TARGET_TOLERANCE_LU,
        "integrated_lufs": post_loudness["input_i"],
        "true_peak_dbtp": post_loudness["input_tp"],
        "clipped_samples": mechanical_qa["measurements"]["pcm"]["clipped_samples"],
        "silence": {
            "max_allowed_ms": MAX_UNEXPECTED_SILENCE_MS,
            "max_observed_ms": max(
                (
                    round(segment["duration_seconds"] * 1000)
                    for segment in mechanical_qa["measurements"]["silence_segments"]
                ),
                default=0,
            ),
            "unexpected_segments": copy.deepcopy(
                mechanical_qa["measurements"]["unexpected_long_silences"]
            ),
        },
        "mechanical_gates": copy.deepcopy(mechanical_qa["gates"]),
    }
    chapter_audio_failures = [
        chapter["chapter_id"]
        for chapter in chapters
        if not all(chapter["audio_slice"]["measurements"]["gates"].values())
    ]
    chapter_asr_failures = [
        chapter["chapter_id"] for chapter in chapters if not chapter["asr"]["passed"]
    ]

    files = asr_plan["production"]["files"]
    production = {
        "screenplay": copy.deepcopy(asr_plan["production"]["screenplay"]),
        "cast": {
            "path": acceptance["cast_path"],
            "sha256": acceptance["cast_sha256"],
        },
        "render_graph": {
            **copy.deepcopy(asr_plan["production"]["render_plan"]),
            "scope": render_plan["scope"],
            "task_count": len(render_plan["tasks"]),
            "task_graph_sha256": content_sha256(render_plan["tasks"]),
        },
        "renderer_assembly": {
            **copy.deepcopy(asr_plan["production"]["renderer"]),
            "renderer_binding": copy.deepcopy(mastering_plan["renderer"]),
            "assembly_graph_sha256": content_sha256(
                {
                    "renderer": mastering_plan["renderer"],
                    "chapter_timeline": mastering_plan["chapter_timeline"],
                    "chapter_timeline_sha256": mastering_plan[
                        "chapter_timeline_sha256"
                    ],
                }
            ),
        },
        "mastering": {
            "plan": {
                **copy.deepcopy(asr_plan["production"]["mastering_plan"]),
                "path": str(mastering_plan_path),
            },
            "artifact_directory": str(mastering_artifact_dir),
            "result_manifest_path": str(mastering_artifact_dir / "mastering.json"),
            "result_manifest_sha256": asr_plan["production"]["mastering_result"][
                "manifest_sha256"
            ],
            "mechanical_qa_path": str(mastering_artifact_dir / "mechanical-qa.json"),
            "mechanical_qa_sha256": mastering_manifest["mechanical_qa_sha256"],
            "mechanical_evidence_sha256": mechanical_qa["evidence_sha256"],
            "working_master_sha256": working["sha256"],
            "publication_sha256": mastering_manifest["outputs"]["publication"][
                "sha256"
            ],
        },
        "full_master_asr": {
            "path": str(asr_path),
            "file_sha256": asr_file_sha256,
            "evidence_sha256": asr_report["evidence_sha256"],
            "plan_sha256": asr_report["asr_plan_sha256"],
            "model_repository": asr_report["asr_runtime"]["model"]["repository"],
            "model_revision": asr_report["asr_runtime"]["model"]["revision"],
        },
        "bound_file_inventory": {
            "file_count": len(files),
            "sha256": sha256_bytes(canonical_json(files)),
        },
        "paths": {
            "repo_root": str(repo_root),
            "render_plan": str(render_plan_path),
            "renderer_outdir": str(renderer_outdir),
        },
    }

    core = {
        "schema_version": SCHEMA_VERSION,
        "status": STATUS,
        "implementation": implementation_identity(),
        "measurement_policy": copy.deepcopy(MEASUREMENT_POLICY),
        "dialogue": dialogue,
        "production": production,
        "source_coverage": {
            "passed": True,
            "expected_words": coverage["source_words"],
            "covered_words": coverage["source_words_covered"],
            "uncovered_words": coverage["source_words_uncovered"],
            "duplicated_words": coverage["source_words_duplicated"],
            "repairs_verified": True,
        },
        "commentary_coverage": {
            "passed": True,
            "expected_ids": commentary_ids,
            "covered_ids": commentary_ids,
            "missing_ids": [],
            "duplicate_ids": [],
        },
        "asr": {
            "passed": asr_passed,
            "maximum_word_error_rate": MAX_WORD_ERROR_RATE,
            "maximum_ordinary_word_errors": MAX_ORDINARY_WORD_ERRORS,
            **copy.deepcopy(corpus_asr),
            "exceptions": (
                {"status": "complete-zero-errors", "items": []}
                if corpus_asr["word_errors"] == 0
                else {
                    "status": "not-enumerated-production-acceptance-review-required",
                    "items": [],
                }
            ),
        },
        "audio": complete_audio,
        "cast_consistency": {
            "passed": cast_passed,
            "script_character_ids": script_character_ids,
            "selected_character_ids": selected_ids,
            "unresolved_character_ids": unresolved_ids,
            "mismatched_character_ids": [],
            "recurring_voice_change_character_ids": recurring_changes,
        },
        "chapters": chapters,
        "human_listening": {"status": "not-performed", "passed": False},
        "promotion": _promotion_contract(
            dialogue,
            asr_errors=corpus_asr["word_errors"],
            chapter_audio_failures=chapter_audio_failures,
            chapter_asr_failures=chapter_asr_failures,
        ),
        "acceptance": {
            "accepted": False,
            "reason": (
                "mechanical, timeline, per-chapter audio, cast, and ASR evidence "
                "assembled; accepted Audio QA still requires an explicit "
                "schema-v2 production acceptance review and artifact promotion inputs"
            ),
        },
    }
    handoff = {**core, "evidence_sha256": sha256_bytes(canonical_json(core))}
    validate_handoff(handoff)
    return handoff


def validate_handoff(handoff: dict[str, Any]) -> None:
    top_fields = {
        "schema_version",
        "status",
        "evidence_sha256",
        "implementation",
        "measurement_policy",
        "dialogue",
        "production",
        "source_coverage",
        "commentary_coverage",
        "asr",
        "audio",
        "cast_consistency",
        "chapters",
        "human_listening",
        "promotion",
        "acceptance",
    }
    if not isinstance(handoff, dict) or set(handoff) != top_fields:
        raise AudioQaHandoffError("QA handoff fields are invalid")
    if (
        handoff["schema_version"] != SCHEMA_VERSION
        or handoff["status"] != STATUS
        or handoff["implementation"] != implementation_identity()
        or handoff["measurement_policy"] != MEASUREMENT_POLICY
    ):
        raise AudioQaHandoffError("QA handoff identity or policy is stale")
    digest = _sha256(handoff["evidence_sha256"], "QA handoff evidence SHA-256")
    core = {key: value for key, value in handoff.items() if key != "evidence_sha256"}
    if sha256_bytes(canonical_json(core)) != digest:
        raise AudioQaHandoffError("QA handoff content address is inconsistent")

    production = _exact_record(
        handoff["production"],
        {
            "screenplay",
            "cast",
            "render_graph",
            "renderer_assembly",
            "mastering",
            "full_master_asr",
            "bound_file_inventory",
            "paths",
        },
        "QA production binding",
    )
    paths = _exact_record(
        production["paths"],
        {"repo_root", "render_plan", "renderer_outdir"},
        "QA production paths",
    )
    repo_root = _absolute_directory(paths["repo_root"], "QA repository root")
    asr_binding = _exact_record(
        production["full_master_asr"],
        {
            "path",
            "file_sha256",
            "evidence_sha256",
            "plan_sha256",
            "model_repository",
            "model_revision",
        },
        "QA full-master ASR binding",
    )
    asr_path = _absolute_regular_file(
        asr_binding["path"],
        _sha256(asr_binding["file_sha256"], "full-master ASR file SHA-256"),
        "full-master ASR evidence",
    )
    asr_report = _read_json(asr_path, "full-master ASR evidence")
    asr_production = _exact_record(
        asr_report.get("production"),
        {
            "repo_root",
            "screenplay",
            "render_plan",
            "renderer",
            "mastering_plan",
            "mastering_result",
            "files",
        },
        "full-master ASR production binding",
    )
    model = _exact_record(
        _exact_record(
            asr_report.get("asr_runtime"),
            {"model", "runtime"},
            "full-master ASR runtime",
        )["model"],
        {
            "repository",
            "revision",
            "snapshot_path",
            "inventory_sha256",
            "file_count",
            "total_bytes",
            "files",
        },
        "full-master ASR model",
    )
    if (
        asr_binding
        != {
            "path": str(asr_path),
            "file_sha256": sha256_file(asr_path),
            "evidence_sha256": _sha256(
                asr_report.get("evidence_sha256"), "ASR evidence SHA-256"
            ),
            "plan_sha256": _sha256(
                asr_report.get("asr_plan_sha256"), "ASR plan SHA-256"
            ),
            "model_repository": _nonempty_string(
                model["repository"], "ASR model repository"
            ),
            "model_revision": _nonempty_string(model["revision"], "ASR model revision"),
        }
        or asr_report.get("human_listening") != {"status": "not-performed"}
        or asr_report.get("acceptance") != ASR_ACCEPTANCE
    ):
        raise AudioQaHandoffError(
            "QA full-master ASR binding is stale or falsely accepted"
        )

    screenplay_binding = _exact_record(
        asr_production["screenplay"],
        {"path", "sha256", "schema_version"},
        "ASR screenplay binding",
    )
    if asr_production["repo_root"] != str(repo_root):
        raise AudioQaHandoffError("ASR repository root differs from QA production")
    screenplay_relative = _repo_relative_path(
        screenplay_binding["path"], "canonical screenplay path"
    )
    screenplay_path = _regular_file_beneath(
        repo_root,
        screenplay_relative,
        _sha256(screenplay_binding["sha256"], "canonical screenplay SHA-256"),
        "canonical screenplay",
    )
    screenplay = _read_json(screenplay_path, "canonical screenplay")
    validate_screenplay(screenplay)
    dialogue = _nonempty_string(handoff["dialogue"], "QA dialogue")
    if (
        screenplay_binding["schema_version"] != 2
        or screenplay["dialogue"] != dialogue
        or screenplay_relative != f"audio/scripts/{dialogue}.json"
    ):
        raise AudioQaHandoffError("QA screenplay binding is noncanonical")

    render_binding = _exact_record(
        asr_production["render_plan"],
        {"path", "plan_sha256", "artifact_sha256"},
        "ASR render-plan binding",
    )
    render_path = _absolute_regular_file(
        render_binding["path"],
        _sha256(render_binding["artifact_sha256"], "render-plan artifact SHA-256"),
        "render plan",
    )
    render_plan = _read_json(render_path, "render plan")
    render_tasks = render_plan.get("tasks")
    if (
        render_plan.get("dialogue") != dialogue
        or render_plan.get("scope") != "full-dialogue"
        or render_plan.get("plan_sha256")
        != _sha256(render_binding["plan_sha256"], "render plan SHA-256")
        or not isinstance(render_tasks, list)
        or not render_tasks
    ):
        raise AudioQaHandoffError("QA render-plan binding is stale or incomplete")

    render_acceptance = _exact_record(
        render_plan.get("acceptance"),
        {
            "screenplay_path",
            "screenplay_sha256",
            "cast_path",
            "cast_sha256",
            "commentary_quality_audit_path",
            "commentary_quality_audit_sha256",
            "commentary_quality_validation",
            "screenplay_validation",
            "accepted_attribution_path",
            "accepted_attribution_sha256",
        },
        "render-plan acceptance",
    )
    cast_relative = _repo_relative_path(
        render_acceptance["cast_path"], "canonical cast path"
    )
    cast_path = _regular_file_beneath(
        repo_root,
        cast_relative,
        _sha256(render_acceptance["cast_sha256"], "canonical cast SHA-256"),
        "canonical cast",
    )
    if (
        cast_relative != "audio/cast.json"
        or render_acceptance["screenplay_path"] != screenplay_relative
        or render_acceptance["screenplay_sha256"] != screenplay_binding["sha256"]
        or screenplay["cast_sha256"] != render_acceptance["cast_sha256"]
    ):
        raise AudioQaHandoffError(
            "render-plan canonical screenplay or cast binding is inconsistent"
        )

    mastering_plan_binding = _exact_record(
        asr_production["mastering_plan"],
        {"path", "plan_sha256", "artifact_sha256", "chapter_timeline_sha256"},
        "ASR mastering-plan binding",
    )
    mastering_plan_path = _absolute_regular_file(
        mastering_plan_binding["path"],
        _sha256(
            mastering_plan_binding["artifact_sha256"],
            "mastering-plan artifact SHA-256",
        ),
        "mastering plan",
    )
    mastering_plan = _read_json(mastering_plan_path, "mastering plan")
    mastering_renderer = _exact_record(
        mastering_plan.get("renderer"),
        {
            "dialogue",
            "render_plan_sha256",
            "render_plan_artifact_sha256",
            "chapters",
            "complete",
        },
        "mastering renderer binding",
    )
    mastering_timeline = mastering_plan.get("chapter_timeline")
    if (
        mastering_plan.get("plan_sha256")
        != _sha256(mastering_plan_binding["plan_sha256"], "mastering plan SHA-256")
        or not isinstance(mastering_timeline, list)
        or not mastering_timeline
        or mastering_plan.get("chapter_timeline_sha256")
        != _sha256(
            mastering_plan_binding["chapter_timeline_sha256"],
            "mastering chapter timeline SHA-256",
        )
        or content_sha256(mastering_timeline)
        != mastering_plan_binding["chapter_timeline_sha256"]
        or mastering_renderer["dialogue"] != dialogue
        or mastering_renderer["render_plan_sha256"] != render_binding["plan_sha256"]
        or mastering_renderer["render_plan_artifact_sha256"]
        != render_binding["artifact_sha256"]
    ):
        raise AudioQaHandoffError("QA mastering-plan binding is inconsistent")

    mastering_result_binding = _exact_record(
        asr_production["mastering_result"],
        {
            "directory",
            "manifest_sha256",
            "mechanical_qa_sha256",
            "working_master_path",
            "working_master_sha256",
            "accepted",
        },
        "ASR mastering-result binding",
    )
    artifact_directory = _absolute_directory(
        mastering_result_binding["directory"], "mastering artifact directory"
    )
    result_path = _absolute_regular_file(
        artifact_directory / "mastering.json",
        _sha256(
            mastering_result_binding["manifest_sha256"],
            "mastering-result manifest SHA-256",
        ),
        "mastering result",
    )
    mechanical_path = _absolute_regular_file(
        artifact_directory / "mechanical-qa.json",
        _sha256(
            mastering_result_binding["mechanical_qa_sha256"],
            "mechanical QA file SHA-256",
        ),
        "mechanical QA",
    )
    working_path = _absolute_regular_file(
        mastering_result_binding["working_master_path"],
        _sha256(
            mastering_result_binding["working_master_sha256"],
            "working master SHA-256",
        ),
        "working master",
    )
    publication_path = _absolute_regular_file(
        artifact_directory / "publication.mp3",
        None,
        "publication derivative",
    )
    mastering_manifest = _read_json(result_path, "mastering result")
    mechanical_qa = _read_json(mechanical_path, "mechanical QA")
    if (
        mastering_result_binding["accepted"] is not False
        or mastering_manifest.get("accepted") is not False
        or mechanical_qa.get("acceptance", {}).get("accepted") is not False
        or mastering_manifest.get("mastering_plan_sha256")
        != mastering_plan_binding["plan_sha256"]
        or mechanical_qa.get("mastering_plan_sha256")
        != mastering_plan_binding["plan_sha256"]
        or mastering_manifest.get("renderer") != mastering_renderer
        or mechanical_qa.get("renderer") != mastering_renderer
        or mastering_manifest.get("chapter_timeline") != mastering_timeline
        or mechanical_qa.get("chapter_timeline") != mastering_timeline
        or mastering_manifest.get("chapter_timeline_sha256")
        != mastering_plan_binding["chapter_timeline_sha256"]
        or mechanical_qa.get("chapter_timeline_sha256")
        != mastering_plan_binding["chapter_timeline_sha256"]
    ):
        raise AudioQaHandoffError(
            "mastering result or mechanical QA contradicts its reviewed plan"
        )

    files = asr_production["files"]
    try:
        verify_bound_files(files)
    except FullMasterAsrError as error:
        raise AudioQaHandoffError(str(error)) from error
    expected_production = {
        "screenplay": copy.deepcopy(screenplay_binding),
        "cast": {
            "path": cast_relative,
            "sha256": sha256_file(cast_path),
        },
        "render_graph": {
            **copy.deepcopy(render_binding),
            "scope": render_plan["scope"],
            "task_count": len(render_tasks),
            "task_graph_sha256": content_sha256(render_tasks),
        },
        "renderer_assembly": {
            **copy.deepcopy(
                _exact_record(
                    asr_production["renderer"],
                    {
                        "outdir",
                        "complete_input_sha256",
                        "complete_audio_sha256",
                        "chapter_starts_sha256",
                    },
                    "ASR renderer binding",
                )
            ),
            "renderer_binding": copy.deepcopy(mastering_renderer),
            "assembly_graph_sha256": content_sha256(
                {
                    "renderer": mastering_renderer,
                    "chapter_timeline": mastering_timeline,
                    "chapter_timeline_sha256": mastering_plan_binding[
                        "chapter_timeline_sha256"
                    ],
                }
            ),
        },
        "mastering": {
            "plan": copy.deepcopy(mastering_plan_binding),
            "artifact_directory": str(artifact_directory),
            "result_manifest_path": str(result_path),
            "result_manifest_sha256": sha256_file(result_path),
            "mechanical_qa_path": str(mechanical_path),
            "mechanical_qa_sha256": sha256_file(mechanical_path),
            "mechanical_evidence_sha256": _sha256(
                mechanical_qa.get("evidence_sha256"),
                "mechanical QA evidence SHA-256",
            ),
            "working_master_sha256": sha256_file(working_path),
            "publication_sha256": sha256_file(publication_path),
        },
        "full_master_asr": copy.deepcopy(asr_binding),
        "bound_file_inventory": {
            "file_count": len(files),
            "sha256": sha256_bytes(canonical_json(files)),
        },
        "paths": {
            "repo_root": str(repo_root),
            "render_plan": str(render_path),
            "renderer_outdir": _absolute_directory_string(
                asr_production["renderer"]["outdir"], "renderer output directory"
            ),
        },
    }
    if production != expected_production:
        raise AudioQaHandoffError(
            "QA production binding differs from current exact input artifacts"
        )

    chapters = handoff["chapters"]
    screenplay_chapters = screenplay["chapters"]
    asr_chapters = asr_report.get("chapters")
    renderer_chapters = mastering_renderer["chapters"]
    if (
        not isinstance(chapters, list)
        or not chapters
        or not isinstance(asr_chapters, list)
        or len(chapters) != len(screenplay_chapters)
        or len(chapters) != len(asr_chapters)
        or len(chapters) != len(renderer_chapters)
        or len(chapters) != len(mastering_timeline)
    ):
        raise AudioQaHandoffError("QA chapter coverage is incomplete")

    expected_chapters: list[dict[str, Any]] = []
    for index, (
        screenplay_chapter,
        asr_chapter,
        renderer_chapter,
        timeline,
        chapter,
    ) in enumerate(
        zip(
            screenplay_chapters,
            asr_chapters,
            renderer_chapters,
            mastering_timeline,
            chapters,
            strict=True,
        )
    ):
        chapter_id = screenplay_chapter["id"]
        entries = [
            entry
            for entry in screenplay["entries"]
            if entry["chapter_id"] == chapter_id
        ]
        if (
            asr_chapter.get("chapter_id") != chapter_id
            or renderer_chapter.get("chapter_id") != chapter_id
            or timeline.get("chapter_id") != chapter_id
        ):
            raise AudioQaHandoffError(f"QA chapter {index} input order is inconsistent")
        measurement = _validate_chapter_measurement(
            _exact_record(
                _exact_record(
                    chapter,
                    {
                        "chapter_id",
                        "source_coverage",
                        "commentary_coverage",
                        "cast",
                        "asr",
                        "audio_slice",
                        "listening",
                        "accepted",
                    },
                    f"QA chapter {index}",
                )["audio_slice"],
                {
                    "working_master_path",
                    "working_master_sha256",
                    "start_frame",
                    "end_frame",
                    "start_seconds",
                    "end_seconds",
                    "renderer_chapter",
                    "measurements",
                },
                f"QA chapter {index} audio slice",
            ),
            chapter_id=chapter_id,
            timeline=timeline,
            renderer_chapter=renderer_chapter,
            mastering_plan=mastering_plan,
            working_path=working_path,
        )
        source_words = sum(
            len(normalized_words(entry["text"]))
            for entry in entries
            if entry["kind"] == "source"
        )
        commentary_ids = _sorted_unique(
            [
                entry["anchor"]["commentary_id"]
                for entry in entries
                if entry["kind"] == "commentary"
            ]
        )
        cast_ids = _sorted_unique([entry["character_id"] for entry in entries])
        spoken_words = sum(len(normalized_words(entry["text"])) for entry in entries)
        expected_chapter_asr = _chapter_asr_projection(
            asr_chapter, spoken_words, f"QA chapter {index} ASR"
        )
        expected_chapters.append(
            {
                "chapter_id": chapter_id,
                "source_coverage": {
                    "expected_words": source_words,
                    "covered_words": source_words,
                    "uncovered_words": 0,
                    "duplicated_words": 0,
                    "passed": True,
                },
                "commentary_coverage": {
                    "expected_ids": commentary_ids,
                    "covered_ids": commentary_ids,
                    "missing_ids": [],
                    "duplicate_ids": [],
                    "passed": True,
                },
                "cast": {
                    "character_ids": cast_ids,
                    "unresolved_character_ids": [],
                    "mismatched_character_ids": [],
                    "passed": True,
                },
                "asr": expected_chapter_asr,
                "audio_slice": {
                    "working_master_path": str(working_path),
                    "working_master_sha256": sha256_file(working_path),
                    "start_frame": timeline["start_frame"],
                    "end_frame": timeline["end_frame"],
                    "start_seconds": timeline["start_seconds"],
                    "end_seconds": timeline["end_seconds"],
                    "renderer_chapter": copy.deepcopy(renderer_chapter),
                    "measurements": measurement,
                },
                "listening": {"status": "not-performed", "passed": False},
                "accepted": False,
            }
        )
    if chapters != expected_chapters:
        raise AudioQaHandoffError(
            "QA chapter evidence contradicts screenplay, ASR, mastering, or listening"
        )

    coverage = screenplay["coverage"]
    commentary_ids = _sorted_unique(
        [
            entry["anchor"]["commentary_id"]
            for entry in screenplay["entries"]
            if entry["kind"] == "commentary"
        ]
    )
    corpus_asr = _exact_record(
        asr_report.get("corpus"),
        {
            "expected_text_sha256",
            "transcript_sha256",
            "expected_words",
            "recognized_words",
            "word_errors",
            "ordinary_word_errors",
            "word_error_rate",
        },
        "full-master ASR corpus",
    )
    expected_corpus = {
        "expected_text_sha256": sha256_bytes(
            " ".join(chapter["expected_text"] for chapter in asr_chapters).encode(
                "utf-8"
            )
        ),
        "transcript_sha256": sha256_bytes(
            " ".join(chapter["transcript"] for chapter in asr_chapters)
            .strip()
            .encode("utf-8")
        ),
        "expected_words": sum(chapter["expected_words"] for chapter in asr_chapters),
        "recognized_words": sum(
            chapter["recognized_words"] for chapter in asr_chapters
        ),
        "word_errors": sum(chapter["word_errors"] for chapter in asr_chapters),
        "ordinary_word_errors": sum(
            chapter["ordinary_word_errors"] for chapter in asr_chapters
        ),
    }
    expected_corpus["word_error_rate"] = (
        expected_corpus["word_errors"] / expected_corpus["expected_words"]
    )
    if corpus_asr != expected_corpus:
        raise AudioQaHandoffError(
            "full-master ASR corpus contradicts its ordered chapter evidence"
        )
    expected_asr = _corpus_asr_projection(corpus_asr)
    render_completion = _exact_record(
        render_plan.get("cast_completion"),
        {"complete_for_screenplay", "character_ids"},
        "render-plan cast completion",
    )
    script_character_ids = _sorted_unique(
        [entry["character_id"] for entry in screenplay["entries"]]
    )
    selected_ids = sorted(render_completion["character_ids"])
    recurring_changes = _render_voice_consistency(render_plan)
    expected_cast = {
        "passed": (
            render_completion["complete_for_screenplay"] is True
            and selected_ids == script_character_ids
            and not recurring_changes
        ),
        "script_character_ids": script_character_ids,
        "selected_character_ids": selected_ids,
        "unresolved_character_ids": sorted(
            set(script_character_ids) - set(selected_ids)
        ),
        "mismatched_character_ids": [],
        "recurring_voice_change_character_ids": recurring_changes,
    }
    if expected_cast["passed"] is not True:
        raise AudioQaHandoffError("QA handoff has no complete stable cast")

    working_output = _exact_record(
        _exact_record(
            mastering_manifest.get("outputs"),
            {"working_master", "publication"},
            "mastering outputs",
        )["working_master"],
        {"filename", "sha256", "probe", "pcm"},
        "mastering working output",
    )
    working_probe = _exact_record(
        working_output["probe"],
        {
            "format_name",
            "container_profile",
            "rf64",
            "duration_seconds",
            "size_bytes",
            "codec_name",
            "sample_format",
            "sample_rate",
            "channels",
            "bits_per_sample",
            "bit_rate",
        },
        "working-master probe",
    )
    measurements = _exact_record(
        mechanical_qa.get("measurements"),
        {
            "first_pass",
            "post_master_loudness",
            "pcm",
            "publication_duration_delta_seconds",
            "silence_segments",
            "unexpected_long_silences",
            "boundary_checks",
            "boundary_inventory_sha256",
        },
        "mechanical QA measurements",
    )
    post_loudness = _loudness_record(
        measurements["post_master_loudness"], "complete-master loudness"
    )
    pcm = _exact_record(
        measurements["pcm"],
        {"frames", "duration_seconds", "sample_peak_dbfs", "clipped_samples"},
        "complete-master PCM measurements",
    )
    silence_segments = _silence_segments(
        measurements["silence_segments"],
        include_master_offsets=False,
        duration_seconds=_finite(
            pcm["duration_seconds"], "complete-master PCM duration"
        ),
        label="complete-master silence",
    )
    unexpected = unexpected_silence_segments(
        silence_segments, mastering_plan["boundaries"]
    )
    mechanical_gates = _mechanical_gates(
        mechanical_qa.get("gates"), "complete-master mechanical gates"
    )
    boundary_checks = measurements["boundary_checks"]
    if not isinstance(boundary_checks, list) or any(
        not isinstance(check, dict) or not isinstance(check.get("passed"), bool)
        for check in boundary_checks
    ):
        raise AudioQaHandoffError("mechanical boundary checks are invalid")
    duration_delta = _finite(
        measurements["publication_duration_delta_seconds"],
        "publication duration delta",
    )
    expected_mechanical_gates = {
        "loudness_passed": (
            abs(post_loudness["input_i"] - TARGET_INTEGRATED_LUFS)
            <= TARGET_TOLERANCE_LU
            and post_loudness["input_tp"] <= TRUE_PEAK_LIMIT_DBTP
        ),
        "clipping_passed": pcm["clipped_samples"] == 0,
        "duration_passed": (
            abs(duration_delta) <= PUBLICATION_DURATION_TOLERANCE_SECONDS
        ),
        "silence_passed": (
            not unexpected and all(check["passed"] for check in boundary_checks)
        ),
    }
    expected_mechanical_gates["mechanical_passed"] = all(
        expected_mechanical_gates.values()
    )
    if (
        mechanical_gates != expected_mechanical_gates
        or mastering_manifest.get("mechanical_passed")
        != expected_mechanical_gates["mechanical_passed"]
        or working_output["sha256"] != sha256_file(working_path)
        or working_output["pcm"] != pcm
    ):
        raise AudioQaHandoffError(
            "complete-master mechanical gates contradict their measurements"
        )
    expected_audio = {
        "working_master_path": str(working_path),
        "working_master_sha256": sha256_file(working_path),
        "duration_seconds": working_probe["duration_seconds"],
        "sample_rate_hz": working_probe["sample_rate"],
        "channels": working_probe["channels"],
        "sample_format": "PCM_24",
        "target_lufs": TARGET_INTEGRATED_LUFS,
        "tolerance_lu": TARGET_TOLERANCE_LU,
        "integrated_lufs": post_loudness["input_i"],
        "true_peak_dbtp": post_loudness["input_tp"],
        "clipped_samples": pcm["clipped_samples"],
        "silence": {
            "max_allowed_ms": MAX_UNEXPECTED_SILENCE_MS,
            "max_observed_ms": max(
                (
                    round(segment["duration_seconds"] * 1000)
                    for segment in silence_segments
                ),
                default=0,
            ),
            "unexpected_segments": unexpected,
        },
        "mechanical_gates": mechanical_gates,
    }
    chapter_audio_failures = [
        chapter["chapter_id"]
        for chapter in expected_chapters
        if not all(chapter["audio_slice"]["measurements"]["gates"].values())
    ]
    chapter_asr_failures = [
        chapter["chapter_id"]
        for chapter in expected_chapters
        if not chapter["asr"]["passed"]
    ]
    expected_source = {
        "passed": True,
        "expected_words": coverage["source_words"],
        "covered_words": coverage["source_words_covered"],
        "uncovered_words": coverage["source_words_uncovered"],
        "duplicated_words": coverage["source_words_duplicated"],
        "repairs_verified": True,
    }
    expected_commentary = {
        "passed": True,
        "expected_ids": commentary_ids,
        "covered_ids": commentary_ids,
        "missing_ids": [],
        "duplicate_ids": [],
    }
    expected_promotion = _promotion_contract(
        dialogue,
        asr_errors=corpus_asr["word_errors"],
        chapter_audio_failures=chapter_audio_failures,
        chapter_asr_failures=chapter_asr_failures,
    )
    expected_acceptance = {
        "accepted": False,
        "reason": (
            "mechanical, timeline, per-chapter audio, cast, and ASR evidence "
            "assembled; accepted Audio QA still requires an explicit "
            "schema-v2 production acceptance review and artifact promotion inputs"
        ),
    }
    if (
        handoff["source_coverage"] != expected_source
        or handoff["commentary_coverage"] != expected_commentary
        or handoff["asr"] != expected_asr
        or handoff["audio"] != expected_audio
        or handoff["cast_consistency"] != expected_cast
        or handoff["human_listening"] != {"status": "not-performed", "passed": False}
        or handoff["promotion"] != expected_promotion
        or handoff["acceptance"] != expected_acceptance
    ):
        raise AudioQaHandoffError(
            "QA summary, gates, blockers, listening, or acceptance is inconsistent"
        )


def _exact_record(value: Any, fields: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise AudioQaHandoffError(f"{label} fields are invalid")
    return value


def _nonempty_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise AudioQaHandoffError(f"{label} must be a non-empty string")
    return value


def _repo_relative_path(value: Any, label: str) -> str:
    raw = _nonempty_string(value, label)
    path = Path(raw)
    if (
        path.is_absolute()
        or "\\" in raw
        or any(part in {"", ".", ".."} for part in path.parts)
    ):
        raise AudioQaHandoffError(f"{label} must be a confined repository path")
    return path.as_posix()


def _absolute_directory(value: Any, label: str) -> Path:
    path = Path(_nonempty_string(str(value), label))
    if (
        not path.is_absolute()
        or path.is_symlink()
        or not path.is_dir()
        or path.resolve(strict=True) != path
    ):
        raise AudioQaHandoffError(f"{label} must be an absolute regular directory")
    return path


def _absolute_directory_string(value: Any, label: str) -> str:
    return str(_absolute_directory(value, label))


def _absolute_regular_file(value: Any, expected_sha256: str | None, label: str) -> Path:
    path = Path(_nonempty_string(str(value), label))
    if (
        not path.is_absolute()
        or path.is_symlink()
        or not path.is_file()
        or path.resolve(strict=True) != path
    ):
        raise AudioQaHandoffError(f"{label} must be an absolute regular file")
    if expected_sha256 is not None and sha256_file(path) != expected_sha256:
        raise AudioQaHandoffError(f"{label} SHA-256 is stale")
    return path


def _regular_file_beneath(
    root: Path, relative: str, expected_sha256: str, label: str
) -> Path:
    path = root / relative
    if path.resolve(strict=True) != path or path.is_symlink() or not path.is_file():
        raise AudioQaHandoffError(f"{label} is missing, symlinked, or escapes its root")
    if sha256_file(path) != expected_sha256:
        raise AudioQaHandoffError(f"{label} SHA-256 is stale")
    return path


def _integer(value: Any, label: str, *, minimum: int = 0) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise AudioQaHandoffError(f"{label} must be an integer at least {minimum}")
    return value


def _string_list(value: Any, label: str, *, unique: bool = True) -> list[str]:
    if (
        not isinstance(value, list)
        or any(not isinstance(item, str) or not item for item in value)
        or (unique and len(set(value)) != len(value))
    ):
        raise AudioQaHandoffError(f"{label} must be a valid string array")
    return value


def _loudness_record(value: Any, label: str) -> dict[str, float]:
    record = _exact_record(value, LOUDNESS_KEYS, label)
    return {
        key: _finite(record[key], f"{label} {key}") for key in sorted(LOUDNESS_KEYS)
    }


def _silence_segments(
    value: Any,
    *,
    include_master_offsets: bool,
    duration_seconds: float,
    label: str,
) -> list[dict[str, float]]:
    fields = {"start_seconds", "end_seconds", "duration_seconds"}
    if include_master_offsets:
        fields |= {"master_start_seconds", "master_end_seconds"}
    if not isinstance(value, list):
        raise AudioQaHandoffError(f"{label} must be an array")
    result: list[dict[str, float]] = []
    prior_end = 0.0
    for index, raw in enumerate(value):
        segment = _exact_record(raw, fields, f"{label} segment {index}")
        start = _finite(segment["start_seconds"], f"{label} start")
        end = _finite(segment["end_seconds"], f"{label} end")
        duration = _finite(segment["duration_seconds"], f"{label} duration")
        if (
            start < prior_end
            or end <= start
            or end > duration_seconds + 1 / SAMPLE_RATE
            or abs((end - start) - duration) > 1e-9
        ):
            raise AudioQaHandoffError(f"{label} segment {index} values are invalid")
        copied = {
            "start_seconds": start,
            "end_seconds": end,
            "duration_seconds": duration,
        }
        if include_master_offsets:
            master_start = _finite(
                segment["master_start_seconds"], f"{label} master start"
            )
            master_end = _finite(segment["master_end_seconds"], f"{label} master end")
            if abs((master_end - master_start) - duration) > 1e-9:
                raise AudioQaHandoffError(
                    f"{label} segment {index} master offsets are invalid"
                )
            copied.update(
                {
                    "master_start_seconds": master_start,
                    "master_end_seconds": master_end,
                }
            )
        result.append(copied)
        prior_end = end
    return result


def _mechanical_gates(value: Any, label: str) -> dict[str, bool]:
    gates = _exact_record(
        value,
        {
            "loudness_passed",
            "clipping_passed",
            "duration_passed",
            "silence_passed",
            "mechanical_passed",
        },
        label,
    )
    if any(not isinstance(gates[field], bool) for field in gates):
        raise AudioQaHandoffError(f"{label} values must be boolean")
    expected = (
        gates["loudness_passed"]
        and gates["clipping_passed"]
        and gates["duration_passed"]
        and gates["silence_passed"]
    )
    if gates["mechanical_passed"] != expected:
        raise AudioQaHandoffError(f"{label} aggregate contradicts component gates")
    return copy.deepcopy(gates)


def _chapter_asr_projection(
    asr_chapter: Any, expected_words: int, label: str
) -> dict[str, Any]:
    chapter = _exact_record(
        asr_chapter,
        {
            "chapter_id",
            "entry_ids",
            "start_frame",
            "end_frame",
            "start_seconds",
            "end_seconds",
            "expected_text",
            "expected_text_sha256",
            "expected_tokens_sha256",
            "expected_words",
            "transcript",
            "transcript_sha256",
            "recognized_words",
            "word_errors",
            "ordinary_word_errors",
            "word_error_rate",
            "detected_language",
            "language_probability",
        },
        label,
    )
    recognized_words = _integer(
        chapter["recognized_words"], f"{label} recognized words"
    )
    errors = _integer(chapter["word_errors"], f"{label} word errors")
    ordinary = _integer(
        chapter["ordinary_word_errors"], f"{label} ordinary word errors"
    )
    rate = _finite(chapter["word_error_rate"], f"{label} word error rate")
    if (
        chapter["expected_words"] != expected_words
        or rate != errors / expected_words
        or ordinary > errors
    ):
        raise AudioQaHandoffError(f"{label} metrics are inconsistent")
    return {
        "expected_words": expected_words,
        "recognized_words": recognized_words,
        "word_errors": errors,
        "ordinary_word_errors": ordinary,
        "word_error_rate": rate,
        "transcript_sha256": _sha256(
            chapter["transcript_sha256"], f"{label} transcript SHA-256"
        ),
        "passed": (
            rate <= MAX_WORD_ERROR_RATE and ordinary <= MAX_ORDINARY_WORD_ERRORS
        ),
    }


def _corpus_asr_projection(corpus: dict[str, Any]) -> dict[str, Any]:
    expected_words = _integer(
        corpus["expected_words"], "corpus ASR expected words", minimum=1
    )
    recognized_words = _integer(
        corpus["recognized_words"], "corpus ASR recognized words"
    )
    errors = _integer(corpus["word_errors"], "corpus ASR word errors")
    ordinary = _integer(
        corpus["ordinary_word_errors"], "corpus ASR ordinary word errors"
    )
    rate = _finite(corpus["word_error_rate"], "corpus ASR word error rate")
    if rate != errors / expected_words or ordinary > errors:
        raise AudioQaHandoffError("corpus ASR metrics are inconsistent")
    return {
        "passed": (
            rate <= MAX_WORD_ERROR_RATE and ordinary <= MAX_ORDINARY_WORD_ERRORS
        ),
        "maximum_word_error_rate": MAX_WORD_ERROR_RATE,
        "maximum_ordinary_word_errors": MAX_ORDINARY_WORD_ERRORS,
        "expected_text_sha256": _sha256(
            corpus["expected_text_sha256"], "corpus expected-text SHA-256"
        ),
        "transcript_sha256": _sha256(
            corpus["transcript_sha256"], "corpus transcript SHA-256"
        ),
        "expected_words": expected_words,
        "recognized_words": recognized_words,
        "word_errors": errors,
        "ordinary_word_errors": ordinary,
        "word_error_rate": rate,
        "exceptions": (
            {"status": "complete-zero-errors", "items": []}
            if errors == 0
            else {
                "status": "not-enumerated-production-acceptance-review-required",
                "items": [],
            }
        ),
    }


def _validate_chapter_measurement(
    audio_slice: dict[str, Any],
    *,
    chapter_id: str,
    timeline: dict[str, Any],
    renderer_chapter: dict[str, Any],
    mastering_plan: dict[str, Any],
    working_path: Path,
) -> dict[str, Any]:
    measurement = _exact_record(
        audio_slice["measurements"],
        {
            "chapter_id",
            "working_master_sha256",
            "start_frame",
            "end_frame",
            "start_seconds",
            "end_seconds",
            "commands",
            "pcm",
            "loudness",
            "silence_segments",
            "max_silence_ms",
            "unexpected_silence_segments",
            "gates",
        },
        f"QA chapter {chapter_id} measurements",
    )
    start = _integer(timeline["start_frame"], f"{chapter_id} start frame")
    end = _integer(timeline["end_frame"], f"{chapter_id} end frame", minimum=1)
    start_seconds = _finite(timeline["start_seconds"], f"{chapter_id} start seconds")
    end_seconds = _finite(timeline["end_seconds"], f"{chapter_id} end seconds")
    if (
        end <= start
        or start_seconds != start / SAMPLE_RATE
        or end_seconds != end / SAMPLE_RATE
        or audio_slice["working_master_path"] != str(working_path)
        or audio_slice["working_master_sha256"] != sha256_file(working_path)
        or audio_slice["start_frame"] != start
        or audio_slice["end_frame"] != end
        or audio_slice["start_seconds"] != start_seconds
        or audio_slice["end_seconds"] != end_seconds
        or audio_slice["renderer_chapter"] != renderer_chapter
        or measurement["chapter_id"] != chapter_id
        or measurement["working_master_sha256"] != sha256_file(working_path)
        or measurement["start_frame"] != start
        or measurement["end_frame"] != end
        or measurement["start_seconds"] != start_seconds
        or measurement["end_seconds"] != end_seconds
    ):
        raise AudioQaHandoffError(
            f"QA chapter {chapter_id} audio slice contradicts mastering"
        )

    commands = _exact_record(
        measurement["commands"],
        {"loudness", "silence"},
        f"QA chapter {chapter_id} commands",
    )
    tools = _exact_record(
        mastering_plan.get("tools"),
        {"ffmpeg", "ffprobe"},
        "mastering tools",
    )
    ffmpeg = _nonempty_string(
        _exact_record(
            tools["ffmpeg"],
            {"name", "path", "sha256", "version"},
            "mastering FFmpeg identity",
        )["path"],
        "mastering FFmpeg path",
    )
    loudnorm = (
        f"loudnorm=I={TARGET_INTEGRATED_LUFS:g}:TP={TRUE_PEAK_LIMIT_DBTP:g}:"
        f"LRA={TARGET_LRA_LU:g}:print_format=json"
    )
    silencedetect = (
        f"silencedetect=noise={SILENCE_NOISE_DB:g}dB:d={SILENCE_MIN_SECONDS:g}"
    )
    expected_commands = {
        "loudness": _chapter_command(
            ffmpeg, working_path, _chapter_filter(start, end, loudnorm)
        ),
        "silence": _chapter_command(
            ffmpeg, working_path, _chapter_filter(start, end, silencedetect)
        ),
    }
    if commands != expected_commands:
        raise AudioQaHandoffError(
            f"QA chapter {chapter_id} measurement commands are stale"
        )
    pcm = _exact_record(
        measurement["pcm"],
        {"frames", "duration_seconds", "sample_peak_dbfs", "clipped_samples"},
        f"QA chapter {chapter_id} PCM",
    )
    frames = end - start
    sample_peak = pcm["sample_peak_dbfs"]
    if sample_peak is not None:
        sample_peak = _finite(sample_peak, f"QA chapter {chapter_id} sample peak")
    if (
        pcm["frames"] != frames
        or _finite(pcm["duration_seconds"], f"QA chapter {chapter_id} duration")
        != frames / SAMPLE_RATE
        or _integer(pcm["clipped_samples"], f"QA chapter {chapter_id} clipped samples")
        > frames
        or (sample_peak is not None and sample_peak > 1e-9)
    ):
        raise AudioQaHandoffError(f"QA chapter {chapter_id} PCM values are invalid")
    loudness = _loudness_record(
        measurement["loudness"], f"QA chapter {chapter_id} loudness"
    )
    silences = _silence_segments(
        measurement["silence_segments"],
        include_master_offsets=True,
        duration_seconds=frames / SAMPLE_RATE,
        label=f"QA chapter {chapter_id} silence",
    )
    for segment in silences:
        if (
            segment["master_start_seconds"] != start_seconds + segment["start_seconds"]
            or segment["master_end_seconds"] != start_seconds + segment["end_seconds"]
        ):
            raise AudioQaHandoffError(
                f"QA chapter {chapter_id} silence offsets contradict its frame slice"
            )
    max_silence_ms = max(
        (round(segment["duration_seconds"] * 1000) for segment in silences),
        default=0,
    )
    unexpected = [
        segment
        for segment in silences
        if round(segment["duration_seconds"] * 1000) > MAX_UNEXPECTED_SILENCE_MS
    ]
    gates = _exact_record(
        measurement["gates"],
        {"loudness_passed", "clipping_passed", "silence_passed"},
        f"QA chapter {chapter_id} gates",
    )
    expected_gates = {
        "loudness_passed": (
            abs(loudness["input_i"] - TARGET_INTEGRATED_LUFS) <= TARGET_TOLERANCE_LU
            and loudness["input_tp"] <= TRUE_PEAK_LIMIT_DBTP
        ),
        "clipping_passed": pcm["clipped_samples"] == 0,
        "silence_passed": not unexpected,
    }
    normalized = {
        **copy.deepcopy(measurement),
        "pcm": {
            "frames": frames,
            "duration_seconds": frames / SAMPLE_RATE,
            "sample_peak_dbfs": sample_peak,
            "clipped_samples": pcm["clipped_samples"],
        },
        "loudness": loudness,
        "silence_segments": silences,
        "max_silence_ms": max_silence_ms,
        "unexpected_silence_segments": unexpected,
        "gates": expected_gates,
    }
    if (
        gates != expected_gates
        or measurement["max_silence_ms"] != max_silence_ms
        or measurement["unexpected_silence_segments"] != unexpected
        or measurement != normalized
    ):
        raise AudioQaHandoffError(
            f"QA chapter {chapter_id} metrics or gates are inconsistent"
        )
    return normalized


def _safe_output_root(
    raw: Path,
    repo_root: Path,
    *,
    bound_input_directories: tuple[Path, ...],
) -> Path:
    if not raw.is_absolute():
        raise AudioQaHandoffError("--outdir must be absolute")
    cursor = raw
    while not cursor.exists() and cursor != cursor.parent:
        cursor = cursor.parent
    while cursor != cursor.parent:
        if cursor.is_symlink():
            raise AudioQaHandoffError(f"QA output traverses a symlink: {cursor}")
        cursor = cursor.parent
    outdir = raw.resolve()
    if outdir.exists() and (outdir.is_symlink() or not outdir.is_dir()):
        raise AudioQaHandoffError("--outdir must be a regular directory path")
    repository_forbidden = (
        (repo_root / "audio/qa").resolve(),
        (repo_root / "wiki/recordings").resolve(),
    )
    if any(outdir == path or path in outdir.parents for path in repository_forbidden):
        raise AudioQaHandoffError(
            "unaccepted QA handoff cannot write audio/qa or wiki/recordings"
        )
    for raw_directory in bound_input_directories:
        directory = _absolute_directory(raw_directory, "bound input artifact directory")
        if outdir == directory or directory in outdir.parents:
            raise AudioQaHandoffError(
                f"QA output cannot be inside a bound input artifact directory: {directory}"
            )
    return outdir


def write_handoff(
    handoff: dict[str, Any], *, outdir: Path, repo_root: Path
) -> tuple[Path, bool]:
    validate_handoff(handoff)
    mastering_directory = Path(handoff["production"]["mastering"]["artifact_directory"])
    asr_evidence_directory = Path(
        handoff["production"]["full_master_asr"]["path"]
    ).parent
    outdir = _safe_output_root(
        outdir,
        repo_root.resolve(strict=True),
        bound_input_directories=(
            mastering_directory,
            asr_evidence_directory,
        ),
    )
    artifacts = outdir / "artifacts"
    if artifacts.is_symlink() or (artifacts.exists() and not artifacts.is_dir()):
        raise AudioQaHandoffError("QA artifact root is symlinked or not a directory")
    final = artifacts / handoff["evidence_sha256"]
    if final.is_symlink():
        raise AudioQaHandoffError(f"content-addressed QA handoff is corrupt: {final}")
    path = final / HANDOFF_FILENAME
    payload = json.dumps(handoff, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if final.exists():
        inventory = (
            list(final.iterdir()) if final.is_dir() and not final.is_symlink() else []
        )
        if (
            len(inventory) != 1
            or inventory[0] != path
            or path.is_symlink()
            or not path.is_file()
            or path.read_text(encoding="utf-8") != payload
        ):
            raise AudioQaHandoffError(
                f"content-addressed QA handoff is corrupt: {final}"
            )
        validate_handoff(_read_json(path, "QA handoff"))
        return path, False
    final.parent.mkdir(parents=True, exist_ok=True)
    temporary = final.parent / f".{handoff['evidence_sha256']}.{uuid.uuid4().hex}.tmp"
    temporary.mkdir()
    try:
        temporary_path = temporary / HANDOFF_FILENAME
        with temporary_path.open("x", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, final)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)
    if not path.is_file() or path.read_text(encoding="utf-8") != payload:
        raise AudioQaHandoffError("content-addressed QA handoff publication failed")
    return path, True


def load_current_inputs(
    *,
    render_plan_path: Path,
    expected_render_plan_sha256: str,
    renderer_outdir: Path,
    mastering_plan_path: Path,
    expected_mastering_plan_sha256: str,
    mastering_outdir: Path,
    repo_root: Path,
    cache_dir: Path,
    asr_path: Path,
    expected_asr_file_sha256: str,
) -> dict[str, Any]:
    repo_root = repo_root.expanduser().resolve(strict=True)
    render_plan_path = render_plan_path.expanduser().resolve(strict=True)
    renderer_outdir = renderer_outdir.expanduser().resolve(strict=True)
    mastering_plan_path = mastering_plan_path.expanduser().resolve(strict=True)
    mastering_outdir = mastering_outdir.expanduser().resolve(strict=True)
    raw_asr_path = asr_path.expanduser()
    if raw_asr_path.is_symlink() or not raw_asr_path.is_file():
        raise AudioQaHandoffError(
            f"full-master ASR evidence must be a regular file: {raw_asr_path}"
        )
    asr_path = raw_asr_path.resolve(strict=True)
    expected_asr_file_sha256 = _sha256(
        expected_asr_file_sha256, "expected full-master ASR file SHA-256"
    )
    if sha256_file(asr_path) != expected_asr_file_sha256:
        raise AudioQaHandoffError("full-master ASR evidence file SHA-256 is stale")

    asr_plan, expected = load_current_asr_plan(
        render_plan_path=render_plan_path,
        expected_render_plan_sha256=expected_render_plan_sha256,
        renderer_outdir=renderer_outdir,
        mastering_plan_path=mastering_plan_path,
        expected_mastering_plan_sha256=expected_mastering_plan_sha256,
        mastering_outdir=mastering_outdir,
        repo_root=repo_root,
        cache_dir=cache_dir,
    )
    asr_report = _read_json(asr_path, "full-master ASR evidence")
    validate_full_master_asr_report(asr_report, asr_plan, expected)
    if (
        asr_path.name != ASR_EVIDENCE_FILENAME
        or asr_path.parent.name != asr_report["evidence_sha256"]
        or asr_path.parent.parent.name != "artifacts"
    ):
        raise AudioQaHandoffError(
            "full-master ASR evidence is not at its content-addressed scratch path"
        )

    render_plan = load_render_plan_artifact(
        render_plan_path, expected_sha256=expected_render_plan_sha256
    )
    mastering_plan = load_mastering_plan(
        mastering_plan_path,
        expected_sha256=expected_mastering_plan_sha256,
    )
    production = asr_plan["production"]
    screenplay_path = repo_root / production["screenplay"]["path"]
    screenplay = _read_json(screenplay_path, "canonical screenplay")
    validate_screenplay(screenplay)
    artifact_dir = Path(production["mastering_result"]["directory"])
    mastering_manifest = _read_json(artifact_dir / "mastering.json", "mastering result")
    mechanical_qa = _read_json(artifact_dir / "mechanical-qa.json", "mechanical QA")
    inputs = {
        "repo_root": repo_root,
        "screenplay": screenplay,
        "render_plan": render_plan,
        "render_plan_path": render_plan_path,
        "renderer_outdir": renderer_outdir,
        "mastering_plan": mastering_plan,
        "mastering_plan_path": mastering_plan_path,
        "mastering_artifact_dir": artifact_dir,
        "mastering_manifest": mastering_manifest,
        "mechanical_qa": mechanical_qa,
        "asr_plan": asr_plan,
        "asr_report": asr_report,
        "asr_path": asr_path,
        "asr_file_sha256": expected_asr_file_sha256,
    }
    verify_current_input_bytes(inputs)
    return inputs


def verify_current_input_bytes(inputs: dict[str, Any]) -> None:
    verify_bound_files(inputs["asr_plan"]["production"]["files"])
    if sha256_file(inputs["asr_path"]) != inputs["asr_file_sha256"]:
        raise AudioQaHandoffError("full-master ASR evidence changed during QA assembly")
    _verify_planned_tools(inputs["mastering_plan"])


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render-plan", type=Path, required=True)
    parser.add_argument("--expected-render-plan-sha256", required=True)
    parser.add_argument("--renderer-outdir", type=Path, required=True)
    parser.add_argument("--mastering-plan", type=Path, required=True)
    parser.add_argument("--expected-mastering-plan-sha256", required=True)
    parser.add_argument("--mastering-outdir", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--full-master-asr", type=Path, required=True)
    parser.add_argument("--expected-full-master-asr-file-sha256", required=True)
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--expected-handoff-sha256")
    parser.add_argument("--execute", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        inputs = load_current_inputs(
            render_plan_path=args.render_plan,
            expected_render_plan_sha256=args.expected_render_plan_sha256,
            renderer_outdir=args.renderer_outdir,
            mastering_plan_path=args.mastering_plan,
            expected_mastering_plan_sha256=args.expected_mastering_plan_sha256,
            mastering_outdir=args.mastering_outdir,
            repo_root=args.repo_root,
            cache_dir=args.cache_dir,
            asr_path=args.full_master_asr,
            expected_asr_file_sha256=args.expected_full_master_asr_file_sha256,
        )
        master = Path(
            inputs["asr_plan"]["production"]["mastering_result"]["working_master_path"]
        )
        chapter_measurements = measure_chapters(
            master=master,
            expected_master_sha256=inputs["asr_plan"]["production"]["mastering_result"][
                "working_master_sha256"
            ],
            mastering_plan=inputs["mastering_plan"],
        )
        verify_current_input_bytes(inputs)
        handoff = build_handoff(
            **inputs,
            chapter_measurements=chapter_measurements,
        )
        if not args.execute:
            if args.expected_handoff_sha256 is not None:
                raise AudioQaHandoffError(
                    "--expected-handoff-sha256 is valid only with --execute"
                )
            print(
                json.dumps(
                    {
                        "dialogue": handoff["dialogue"],
                        "handoff_sha256": handoff["evidence_sha256"],
                        "chapter_count": len(handoff["chapters"]),
                        "mechanical_passed": handoff["audio"]["mechanical_gates"][
                            "mechanical_passed"
                        ],
                        "asr_passed": handoff["asr"]["passed"],
                        "promotion_blockers": handoff["promotion"]["blockers"],
                        "writes": False,
                        "accepted": False,
                        "human_listening": "not-performed",
                    },
                    indent=2,
                    sort_keys=True,
                )
            )
            return 0
        if args.expected_handoff_sha256 is None:
            raise AudioQaHandoffError(
                "--execute requires --expected-handoff-sha256 from the dry run"
            )
        if handoff["evidence_sha256"] != _sha256(
            args.expected_handoff_sha256, "expected QA handoff SHA-256"
        ):
            raise AudioQaHandoffError("current QA handoff differs from review")
        verify_current_input_bytes(inputs)
        path, created = write_handoff(
            handoff,
            outdir=args.outdir.expanduser(),
            repo_root=inputs["repo_root"],
        )
        print(
            json.dumps(
                {
                    "dialogue": handoff["dialogue"],
                    "status": "written" if created else "cached",
                    "handoff_sha256": handoff["evidence_sha256"],
                    "handoff_path": str(path),
                    "promotion_blockers": handoff["promotion"]["blockers"],
                    "accepted": False,
                    "human_listening": "not-performed",
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 0
    except (
        AudioQaHandoffError,
        FullMasterAsrError,
        MasteringContractError,
        RenderContractError,
        FileNotFoundError,
        OSError,
    ) as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    raise SystemExit(main())
