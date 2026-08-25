#!/usr/bin/env python3
"""Promote an exact mastered recording after explicit production acceptance.

The command is dry by default. It validates the content-addressed mechanical
QA handoff, a separate schema-v2 acceptance review, every mastering artifact,
and the current screenplay/cast bytes. The acceptance review either records
completed human listening or an explicit operator-authorized listening waiver;
the waiver never changes or bypasses any mechanical, ASR, source, commentary,
or cast gate. It then derives:

* distinct RF64 PCM24 chapter artifacts sliced at the authoritative 48 kHz
  mastering timeline;
* ``audio/qa/<dialogue>.json`` schema v2; and
* ``wiki/recordings/<dialogue>.json`` schema v2.

Execution requires the exact dry-run plan SHA-256. Canonical repository files
are written only after all artifact and target preflights pass, and a failed
repository validation rolls back every file created by the command.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import struct
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any, Callable

from assemble_audio_qa_handoff import validate_handoff
from master_audio import (
    PRODUCTION_SAMPLE_WIDTH_BYTES,
    RF64_SIZE_SENTINEL,
    SAMPLE_RATE,
    inspect_rf64_pcm24,
)


SCHEMA_VERSION = 2
STATUS = "accepted-audio-production-promotion-plan"
IMPLEMENTATION_NAME = "plato-audio-qa-promoter"
IMPLEMENTATION_VERSION = 2
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
DIALOGUE_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SAFE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIMESTAMP_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$")
COPY_BYTES = 4 * 1024 * 1024


class PromotionError(ValueError):
    """Raised when production evidence cannot be promoted safely."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def pretty_json(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(COPY_BYTES), b""):
            digest.update(block)
    return digest.hexdigest()


def _sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise PromotionError(f"{label} must be a lowercase SHA-256")
    return value


def _nonempty(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise PromotionError(f"{label} must be a non-empty string")
    return value


def _exact_object(
    value: Any,
    fields: set[str],
    label: str,
) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise PromotionError(f"{label} fields are invalid")
    return value


def _load_json(path: Path, label: str) -> dict[str, Any]:
    if path.is_symlink() or not path.is_file():
        raise PromotionError(f"{label} must be a regular file: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise PromotionError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise PromotionError(f"{label} must be a JSON object: {path}")
    return value


def _absolute_directory(path: Path, label: str) -> Path:
    if not path.is_absolute() or path.is_symlink() or not path.is_dir():
        raise PromotionError(
            f"{label} must be an existing absolute non-symlink directory: {path}"
        )
    return path.resolve(strict=True)


def _safe_child(root: Path, relative: str, label: str) -> Path:
    if (
        not relative
        or "\\" in relative
        or Path(relative).is_absolute()
        or Path(relative).as_posix() != relative
        or ".." in Path(relative).parts
        or "." in Path(relative).parts
    ):
        raise PromotionError(f"{label} is not a canonical relative path")
    target = root.joinpath(*Path(relative).parts)
    cursor = target.parent
    while cursor != root:
        if cursor.exists() and cursor.is_symlink():
            raise PromotionError(f"{label} escapes through a symlink: {cursor}")
        cursor = cursor.parent
    return target


def _relative_to_root(path: Path, root: Path, label: str) -> str:
    if not path.is_absolute():
        raise PromotionError(f"{label} must be absolute")
    try:
        relative = path.relative_to(root).as_posix()
    except ValueError as error:
        raise PromotionError(f"{label} escapes artifact root") from error
    if not relative or relative.startswith("../"):
        raise PromotionError(f"{label} is not beneath artifact root")
    return relative


def _verify_file(path: Path, expected_sha256: str, label: str) -> None:
    if path.is_symlink() or not path.is_file():
        raise PromotionError(f"{label} must be a regular file: {path}")
    actual = sha256_file(path)
    if actual != expected_sha256:
        raise PromotionError(
            f"{label} hash mismatch: expected {expected_sha256}, got {actual}"
        )


RECORDING_MANIFEST_FIELDS = {
    "schema_version",
    "recording_id",
    "dialogue",
    "status",
    "production",
    "audio",
    "chapters",
    "cast",
    "provenance",
}


def _display_rows(
    value: Any,
    *,
    label: str,
    required_fields: set[str],
    allowed_fields: set[str],
) -> list[dict[str, str]] | None:
    if value is None:
        return None
    if not isinstance(value, list):
        raise PromotionError(f"existing recording {label} must be an array")
    rows: list[dict[str, str]] = []
    for index, row in enumerate(value):
        if (
            not isinstance(row, dict)
            or not required_fields.issubset(row)
            or not set(row).issubset(allowed_fields)
            or any(
                not isinstance(row[field], str) or not row[field].strip()
                for field in row
            )
        ):
            raise PromotionError(
                f"existing recording {label}[{index}] fields are invalid"
            )
        rows.append(copy.deepcopy(row))
    return rows


def _existing_recording(
    path: Path,
    *,
    dialogue: str,
) -> dict[str, Any] | None:
    if not path.exists() and not path.is_symlink():
        return None
    if path.is_symlink() or not path.is_file():
        raise PromotionError(f"canonical recording target is not a regular file: {path}")
    content = path.read_bytes()
    try:
        manifest = json.loads(content)
    except json.JSONDecodeError as error:
        raise PromotionError(
            f"existing canonical recording target is malformed JSON: {path}"
        ) from error
    required = {
        "schema_version",
        "recording_id",
        "dialogue",
        "status",
        "audio",
        "chapters",
    }
    if (
        not isinstance(manifest, dict)
        or not required.issubset(manifest)
        or not set(manifest).issubset(RECORDING_MANIFEST_FIELDS)
        or manifest.get("schema_version") != 2
        or manifest.get("dialogue") != dialogue
        or manifest.get("status") not in {"draft", "accepted"}
        or SAFE_ID_RE.fullmatch(
            _nonempty(manifest.get("recording_id"), "existing recording id")
        )
        is None
        or not isinstance(manifest.get("audio"), dict)
        or not isinstance(manifest.get("chapters"), list)
        or not manifest["chapters"]
    ):
        raise PromotionError(
            "existing canonical recording target is not a compatible schema-v2 draft or accepted manifest"
        )
    cast = _display_rows(
        manifest.get("cast"),
        label="cast",
        required_fields={"character_id", "name", "voice"},
        allowed_fields={"character_id", "name", "voice"},
    )
    provenance_rows = _display_rows(
        manifest.get("provenance"),
        label="provenance",
        required_fields={"label", "value"},
        allowed_fields={"label", "value", "url"},
    )
    # Draft QA/review-state rows become stale at promotion. Voice references are
    # stable display provenance and remain attached to the accepted recording.
    provenance = (
        [
            row
            for row in provenance_rows
            if "voice reference" in row["label"].casefold()
        ]
        if provenance_rows is not None
        else None
    )
    if provenance == []:
        provenance = None
    return {
        "content": content,
        "sha256": sha256_bytes(content),
        "status": manifest["status"],
        "recording_id": manifest["recording_id"],
        "cast": cast,
        "provenance": provenance,
    }


def implementation_identity() -> dict[str, Any]:
    source = Path(__file__).resolve(strict=True)
    return {
        "name": IMPLEMENTATION_NAME,
        "version": IMPLEMENTATION_VERSION,
        "code_path": str(source),
        "code_sha256": sha256_file(source),
    }


def _chapter_header(
    source: Path,
    *,
    frames: int,
) -> bytes:
    if frames <= 0:
        raise PromotionError("chapter frame count must be positive")
    evidence = inspect_rf64_pcm24(source)
    fmt_size = evidence["fmt_chunk_size_bytes"]
    with source.open("rb") as handle:
        handle.seek(56)
        fmt_payload = handle.read(fmt_size)
    if len(fmt_payload) != fmt_size:
        raise PromotionError("working master fmt payload is truncated")
    data_size = frames * PRODUCTION_SAMPLE_WIDTH_BYTES
    padding = data_size & 1
    file_size = 64 + fmt_size + data_size + padding
    return b"".join(
        (
            b"RF64",
            struct.pack("<I", RF64_SIZE_SENTINEL),
            b"WAVE",
            b"ds64",
            struct.pack("<IQQQI", 28, file_size - 8, data_size, frames, 0),
            b"fmt ",
            struct.pack("<I", fmt_size),
            fmt_payload,
            b"data",
            struct.pack("<I", RF64_SIZE_SENTINEL),
        )
    )


def _update_slice_digest(
    digest: Any,
    source: Path,
    *,
    start_frame: int,
    end_frame: int,
) -> None:
    evidence = inspect_rf64_pcm24(source)
    if (
        isinstance(start_frame, bool)
        or not isinstance(start_frame, int)
        or isinstance(end_frame, bool)
        or not isinstance(end_frame, int)
        or start_frame < 0
        or end_frame <= start_frame
        or end_frame > evidence["sample_count"]
    ):
        raise PromotionError("chapter frame interval is invalid")
    remaining = (end_frame - start_frame) * PRODUCTION_SAMPLE_WIDTH_BYTES
    with source.open("rb") as handle:
        handle.seek(
            evidence["data_offset_bytes"] + start_frame * PRODUCTION_SAMPLE_WIDTH_BYTES
        )
        while remaining:
            block = handle.read(min(COPY_BYTES, remaining))
            if not block:
                raise PromotionError("working master ended inside a chapter slice")
            digest.update(block)
            remaining -= len(block)


def plan_chapter_artifact(
    source: Path,
    target: Path,
    *,
    start_frame: int,
    end_frame: int,
) -> dict[str, Any]:
    frames = end_frame - start_frame
    header = _chapter_header(source, frames=frames)
    digest = hashlib.sha256()
    digest.update(header)
    _update_slice_digest(
        digest,
        source,
        start_frame=start_frame,
        end_frame=end_frame,
    )
    data_size = frames * PRODUCTION_SAMPLE_WIDTH_BYTES
    if data_size & 1:
        digest.update(b"\x00")
    return {
        "source_path": str(source),
        "target_path": str(target),
        "start_frame": start_frame,
        "end_frame": end_frame,
        "frames": frames,
        "duration_seconds": frames / SAMPLE_RATE,
        "size_bytes": len(header) + data_size + (data_size & 1),
        "sha256": digest.hexdigest(),
    }


def materialize_chapter_artifact(
    source: Path,
    target: Path,
    *,
    start_frame: int,
    end_frame: int,
    expected_sha256: str,
) -> bool:
    expected_sha256 = _sha256(expected_sha256, "chapter artifact SHA-256")
    planned = plan_chapter_artifact(
        source,
        target,
        start_frame=start_frame,
        end_frame=end_frame,
    )
    if planned["sha256"] != expected_sha256:
        raise PromotionError("chapter artifact plan hash changed before execution")
    if target.exists() or target.is_symlink():
        if target.is_symlink() or not target.is_file():
            raise PromotionError(f"chapter target is not a regular file: {target}")
        if sha256_file(target) != expected_sha256:
            raise PromotionError(f"existing chapter artifact differs: {target}")
        evidence = inspect_rf64_pcm24(target)
        if evidence["sample_count"] != end_frame - start_frame:
            raise PromotionError(f"existing chapter frame count differs: {target}")
        return False

    target.parent.mkdir(parents=True, exist_ok=True)
    if target.parent.is_symlink():
        raise PromotionError(f"chapter artifact parent is symlinked: {target.parent}")
    temporary = target.parent / f".{target.name}.tmp-{uuid.uuid4().hex}"
    evidence = inspect_rf64_pcm24(source)
    header = _chapter_header(source, frames=end_frame - start_frame)
    remaining = (end_frame - start_frame) * PRODUCTION_SAMPLE_WIDTH_BYTES
    try:
        with source.open("rb") as reader, temporary.open("xb") as writer:
            writer.write(header)
            reader.seek(
                evidence["data_offset_bytes"]
                + start_frame * PRODUCTION_SAMPLE_WIDTH_BYTES
            )
            while remaining:
                block = reader.read(min(COPY_BYTES, remaining))
                if not block:
                    raise PromotionError("working master ended inside a chapter slice")
                writer.write(block)
                remaining -= len(block)
            if (end_frame - start_frame) * PRODUCTION_SAMPLE_WIDTH_BYTES & 1:
                writer.write(b"\x00")
            writer.flush()
            os.fsync(writer.fileno())
        if sha256_file(temporary) != expected_sha256:
            raise PromotionError("materialized chapter hash differs from its plan")
        chapter_evidence = inspect_rf64_pcm24(temporary)
        if chapter_evidence["sample_count"] != end_frame - start_frame:
            raise PromotionError(
                "materialized chapter frame count differs from its plan"
            )
        os.replace(temporary, target)
        descriptor = os.open(target.parent, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
    except BaseException:
        temporary.unlink(missing_ok=True)
        raise
    return True


ACTUAL_LISTENING_BASIS = "complete-master-human-listening"
OPERATOR_WAIVER_BASIS = "operator-authorized-mechanical-and-asr-waiver"


def validate_acceptance_review(
    review: dict[str, Any],
    handoff: dict[str, Any],
) -> None:
    fields = {
        "schema_version",
        "dialogue",
        "handoff_evidence_sha256",
        "working_master_sha256",
        "acceptance_basis",
        "authorized_by",
        "authorized_at",
        "rationale",
        "listening_status",
        "accepted_chapter_ids",
        "disposition",
        "findings",
        "asr_exceptions",
    }
    _exact_object(review, fields, "acceptance review")
    dialogue = _nonempty(handoff.get("dialogue"), "handoff dialogue")
    chapter_ids = [
        _nonempty(chapter.get("chapter_id"), "handoff chapter id")
        for chapter in handoff.get("chapters", [])
        if isinstance(chapter, dict)
    ]
    basis = review.get("acceptance_basis")
    listening_status = review.get("listening_status")
    disposition = review.get("disposition")
    if (
        review["schema_version"] != 2
        or review["dialogue"] != dialogue
        or review["handoff_evidence_sha256"] != handoff.get("evidence_sha256")
        or review["working_master_sha256"]
        != handoff.get("audio", {}).get("working_master_sha256")
        or review["accepted_chapter_ids"] != chapter_ids
        or not isinstance(review["accepted_chapter_ids"], list)
        or len(set(review["accepted_chapter_ids"]))
        != len(review["accepted_chapter_ids"])
        or not DATE_RE.fullmatch(
            _nonempty(review["authorized_at"], "acceptance authorization date")
        )
    ):
        raise PromotionError(
            "acceptance review must bind the exact handoff, master, and chapter inventory"
        )
    _nonempty(review["authorized_by"], "acceptance authorizer")
    _nonempty(review["rationale"], "acceptance rationale")
    if basis == ACTUAL_LISTENING_BASIS:
        if listening_status != "performed" or disposition != "accepted":
            raise PromotionError(
                "complete-master listening acceptance must record performed listening and accepted disposition"
            )
    elif basis == OPERATOR_WAIVER_BASIS:
        if (
            listening_status != "not-performed"
            or disposition != "accepted-with-listening-waiver"
        ):
            raise PromotionError(
                "operator waiver must record listening not-performed and accepted-with-listening-waiver"
            )
    else:
        raise PromotionError("acceptance review basis is unsupported")
    if not isinstance(review["findings"], list):
        raise PromotionError("acceptance review findings must be an array")
    allowed_finding_fields = {
        "code",
        "severity",
        "description",
        "chapter_id",
        "entry_id",
        "rerender_input_sha256",
    }
    for index, finding in enumerate(review["findings"]):
        if (
            not isinstance(finding, dict)
            or not set(finding).issubset(allowed_finding_fields)
            or not {"code", "severity", "description"}.issubset(finding)
            or SAFE_ID_RE.fullmatch(
                _nonempty(finding.get("code"), f"finding {index} code")
            )
            is None
            or finding.get("severity") not in {"note", "failure"}
        ):
            raise PromotionError(f"acceptance review finding {index} is invalid")
        _nonempty(finding["description"], f"finding {index} description")
        if finding.get("chapter_id") is not None and finding["chapter_id"] not in set(
            chapter_ids
        ):
            raise PromotionError(
                f"acceptance review finding {index} names an unknown chapter"
            )
        if finding.get("rerender_input_sha256") is not None:
            _sha256(
                finding["rerender_input_sha256"],
                f"finding {index} rerender input",
            )
        if finding["severity"] == "failure":
            raise PromotionError("accepted production review contains a failure finding")

    if not isinstance(review["asr_exceptions"], list):
        raise PromotionError("ASR exceptions must be an array")
    exception_fields = {
        "expected",
        "recognized",
        "occurrences",
        "classification",
        "reviewed",
    }
    word_errors = handoff.get("asr", {}).get("word_errors")
    ordinary_errors = handoff.get("asr", {}).get("ordinary_word_errors")
    exception_count = 0
    ordinary_count = 0
    for index, exception in enumerate(review["asr_exceptions"]):
        if (
            not isinstance(exception, dict)
            or set(exception) != exception_fields
            or not isinstance(exception.get("occurrences"), int)
            or isinstance(exception.get("occurrences"), bool)
            or exception["occurrences"] <= 0
            or exception.get("classification")
            not in {"proper-name", "punctuation", "ordinary"}
            or exception.get("reviewed") is not True
        ):
            raise PromotionError(f"ASR exception {index} is invalid")
        _nonempty(exception["expected"], f"ASR exception {index} expected")
        _nonempty(exception["recognized"], f"ASR exception {index} recognized")
        exception_count += exception["occurrences"]
        if exception["classification"] == "ordinary":
            ordinary_count += exception["occurrences"]
    if exception_count != word_errors or ordinary_count != ordinary_errors:
        raise PromotionError(
            "ASR exceptions must enumerate every word and ordinary-word error"
        )


def _artifact_binding(
    handoff: dict[str, Any],
    artifact_root: Path,
) -> dict[str, Any]:
    production = handoff["production"]
    mastering = production["mastering"]
    plan = mastering["plan"]
    plan_sha = _sha256(plan["plan_sha256"], "mastering plan SHA-256")
    expected_paths = {
        "plan": artifact_root / "plans" / f"{plan_sha}.json",
        "result": artifact_root / "artifacts" / plan_sha / "mastering.json",
        "mechanical": artifact_root / "artifacts" / plan_sha / "mechanical-qa.json",
        "master": artifact_root / "artifacts" / plan_sha / "master.wav",
        "publication": artifact_root / "artifacts" / plan_sha / "publication.mp3",
    }
    declared = {
        "plan": Path(plan["path"]),
        "result": Path(mastering["result_manifest_path"]),
        "mechanical": Path(mastering["mechanical_qa_path"]),
        "master": Path(handoff["audio"]["working_master_path"]),
        "publication": Path(mastering["artifact_directory"]) / "publication.mp3",
    }
    for key, expected in expected_paths.items():
        if declared[key] != expected:
            raise PromotionError(
                f"handoff {key} path is not the canonical artifact-root path"
            )
    expected_hashes = {
        "plan": _sha256(plan["artifact_sha256"], "mastering plan artifact SHA-256"),
        "result": _sha256(
            mastering["result_manifest_sha256"],
            "mastering result SHA-256",
        ),
        "mechanical": _sha256(
            mastering["mechanical_qa_sha256"],
            "mechanical QA SHA-256",
        ),
        "master": _sha256(
            mastering["working_master_sha256"],
            "working master SHA-256",
        ),
        "publication": _sha256(
            mastering["publication_sha256"],
            "publication SHA-256",
        ),
    }
    for key, path in expected_paths.items():
        _verify_file(path, expected_hashes[key], f"mastering {key}")
    if handoff["audio"]["working_master_sha256"] != expected_hashes["master"]:
        raise PromotionError("handoff master hashes disagree")
    return {
        "plan_sha256": plan_sha,
        "paths": expected_paths,
        "hashes": expected_hashes,
    }


def _accepted_qa(
    *,
    handoff: dict[str, Any],
    review: dict[str, Any],
    generated_at: str,
    chapter_artifacts: list[dict[str, Any]],
    artifact_binding: dict[str, Any],
) -> dict[str, Any]:
    asr = handoff["asr"]
    production = handoff["production"]
    listening_performed = review["acceptance_basis"] == ACTUAL_LISTENING_BASIS
    listening_disposition = "accepted" if listening_performed else "not-performed"
    chapters: list[dict[str, Any]] = []
    for chapter, artifact in zip(handoff["chapters"], chapter_artifacts, strict=True):
        coverage = chapter["source_coverage"]
        commentary = chapter["commentary_coverage"]
        cast = chapter["cast"]
        chapter_asr = chapter["asr"]
        measurements = chapter["audio_slice"]["measurements"]
        gates = measurements["gates"]
        if (
            coverage["passed"] is not True
            or commentary["passed"] is not True
            or cast["passed"] is not True
            or chapter_asr["passed"] is not True
            or any(value is not True for value in gates.values())
            or measurements["unexpected_silence_segments"]
        ):
            raise PromotionError(
                f"chapter {chapter['chapter_id']} has a failed production gate"
            )
        chapters.append(
            {
                "chapter_id": chapter["chapter_id"],
                "audio_path": artifact["relative_path"],
                "audio_sha256": artifact["sha256"],
                "duration_seconds": measurements["pcm"]["duration_seconds"],
                "source_words_expected": coverage["expected_words"],
                "source_words_covered": coverage["covered_words"],
                "source_words_uncovered": coverage["uncovered_words"],
                "source_words_duplicated": coverage["duplicated_words"],
                "commentary_ids_expected": commentary["expected_ids"],
                "commentary_ids_covered": commentary["covered_ids"],
                "asr_expected_words": chapter_asr["expected_words"],
                "asr_word_errors": chapter_asr["word_errors"],
                "asr_ordinary_word_errors": chapter_asr["ordinary_word_errors"],
                "asr_word_error_rate": chapter_asr["word_error_rate"],
                "max_silence_ms": measurements["max_silence_ms"],
                "integrated_lufs": measurements["loudness"]["input_i"],
                "true_peak_dbtp": measurements["loudness"]["input_tp"],
                "clipped_samples": measurements["pcm"]["clipped_samples"],
                "cast_character_ids": cast["character_ids"],
                "unresolved_character_ids": cast["unresolved_character_ids"],
                "mismatched_character_ids": cast["mismatched_character_ids"],
                "listening_disposition": listening_disposition,
                "source_coverage_passed": True,
                "commentary_coverage_passed": True,
                "asr_passed": True,
                "silence_passed": True,
                "clipping_passed": True,
                "loudness_passed": True,
                "cast_consistency_passed": True,
                "listening_passed": listening_performed,
            }
        )
    if (
        handoff["source_coverage"]["passed"] is not True
        or handoff["commentary_coverage"]["passed"] is not True
        or asr["passed"] is not True
        or handoff["cast_consistency"]["passed"] is not True
        or any(
            value is not True for value in handoff["audio"]["mechanical_gates"].values()
        )
        or handoff["audio"]["silence"]["unexpected_segments"]
    ):
        raise PromotionError("complete-master production gates have not all passed")
    audio = handoff["audio"]
    return {
        "schema_version": 2,
        "dialogue": handoff["dialogue"],
        "status": "accepted",
        "generated_at": generated_at,
        "script_sha256": production["screenplay"]["sha256"],
        "cast_sha256": production["cast"]["sha256"],
        "source_coverage": copy.deepcopy(handoff["source_coverage"]),
        "commentary_coverage": copy.deepcopy(handoff["commentary_coverage"]),
        "asr": {
            "passed": True,
            "model_repository": production["full_master_asr"]["model_repository"],
            "model_revision": production["full_master_asr"]["model_revision"],
            "max_word_error_rate": asr["maximum_word_error_rate"],
            "max_ordinary_word_errors": asr["maximum_ordinary_word_errors"],
            "expected_words": asr["expected_words"],
            "recognized_words": asr["recognized_words"],
            "word_errors": asr["word_errors"],
            "ordinary_word_errors": asr["ordinary_word_errors"],
            "word_error_rate": asr["word_error_rate"],
            "transcript_sha256": asr["transcript_sha256"],
            "exceptions": copy.deepcopy(review["asr_exceptions"]),
        },
        "audio": {
            "master_path": _relative_to_root(
                artifact_binding["paths"]["master"],
                artifact_binding["artifact_root"],
                "working master",
            ),
            "master_sha256": audio["working_master_sha256"],
            "mime_type": "audio/wav",
            "duration_seconds": audio["duration_seconds"],
            "sample_rate_hz": audio["sample_rate_hz"],
            "channels": audio["channels"],
            "sample_format": audio["sample_format"],
            "target_lufs": audio["target_lufs"],
            "tolerance_lu": audio["tolerance_lu"],
            "integrated_lufs": audio["integrated_lufs"],
            "true_peak_dbtp": audio["true_peak_dbtp"],
            "clipped_samples": audio["clipped_samples"],
            "silence": copy.deepcopy(audio["silence"]),
        },
        "cast_consistency": copy.deepcopy(handoff["cast_consistency"]),
        "listening_review": {
            "status": "performed" if listening_performed else "not-performed",
            "passed": listening_performed,
            "reviewer": review["authorized_by"] if listening_performed else None,
            "reviewed_at": review["authorized_at"] if listening_performed else None,
            "scope": "complete-master" if listening_performed else "none",
            "chapter_ids": (
                copy.deepcopy(review["accepted_chapter_ids"])
                if listening_performed
                else []
            ),
            "disposition": "accepted" if listening_performed else "not-performed",
            "findings": copy.deepcopy(review["findings"]) if listening_performed else [],
        },
        "production_acceptance": {
            "passed": True,
            "basis": review["acceptance_basis"],
            "authorized_by": review["authorized_by"],
            "authorized_at": review["authorized_at"],
            "rationale": review["rationale"],
            "handoff_evidence_sha256": review["handoff_evidence_sha256"],
            "working_master_sha256": review["working_master_sha256"],
            "chapter_ids": copy.deepcopy(review["accepted_chapter_ids"]),
            "disposition": review["disposition"],
            "findings": copy.deepcopy(review["findings"]),
        },
        "chapters": chapters,
    }


def _recording_manifest(
    *,
    handoff: dict[str, Any],
    screenplay: dict[str, Any],
    qa_sha256: str,
    artifact_binding: dict[str, Any],
    recording_id: str,
    cast: list[dict[str, str]] | None = None,
    provenance: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    chapter_by_id = {chapter["chapter_id"]: chapter for chapter in handoff["chapters"]}
    chapters = []
    for screenplay_chapter in screenplay["chapters"]:
        chapter = chapter_by_id.get(screenplay_chapter["id"])
        if chapter is None:
            raise PromotionError("screenplay and handoff chapter inventories differ")
        chapters.append(
            {
                "chapter_id": screenplay_chapter["id"],
                "commentary_id": screenplay_chapter["commentary_id"],
                "start_frame": chapter["audio_slice"]["start_frame"],
                **(
                    {"title": screenplay_chapter["title"]}
                    if screenplay_chapter.get("title")
                    else {}
                ),
            }
        )
    if len(chapters) != len(handoff["chapters"]):
        raise PromotionError("screenplay and handoff chapter counts differ")
    paths = artifact_binding["paths"]
    hashes = artifact_binding["hashes"]
    plan_sha = artifact_binding["plan_sha256"]
    production = {
        "screenplay_sha256": handoff["production"]["screenplay"]["sha256"],
        "qa_sha256": qa_sha256,
        "mastering_plan_path": _relative_to_root(
            paths["plan"], artifact_binding["artifact_root"], "mastering plan"
        ),
        "mastering_plan_artifact_sha256": hashes["plan"],
        "mastering_plan_sha256": plan_sha,
        "mastering_result_path": _relative_to_root(
            paths["result"],
            artifact_binding["artifact_root"],
            "mastering result",
        ),
        "mastering_result_sha256": hashes["result"],
        "mechanical_qa_path": _relative_to_root(
            paths["mechanical"],
            artifact_binding["artifact_root"],
            "mechanical QA",
        ),
        "mechanical_qa_sha256": hashes["mechanical"],
        "working_master_path": _relative_to_root(
            paths["master"],
            artifact_binding["artifact_root"],
            "working master",
        ),
        "working_master_sha256": hashes["master"],
        "publication_path": _relative_to_root(
            paths["publication"],
            artifact_binding["artifact_root"],
            "publication",
        ),
        "publication_sha256": hashes["publication"],
    }
    return {
        "schema_version": 2,
        "recording_id": recording_id,
        "dialogue": handoff["dialogue"],
        "status": "accepted",
        "production": production,
        "audio": {
            "path": production["publication_path"],
            "mime_type": "audio/mpeg",
            "duration_seconds": handoff["audio"]["duration_seconds"],
            "sha256": hashes["publication"],
        },
        "chapters": chapters,
        **({"cast": copy.deepcopy(cast)} if cast is not None else {}),
        **(
            {"provenance": copy.deepcopy(provenance)}
            if provenance is not None
            else {}
        ),
    }


def build_promotion_plan(
    *,
    repo_root: Path,
    artifact_root: Path,
    handoff: dict[str, Any],
    review: dict[str, Any],
    generated_at: str,
    recording_id: str | None = None,
    handoff_validator: Callable[[dict[str, Any]], None] = validate_handoff,
) -> dict[str, Any]:
    repo_root = _absolute_directory(repo_root, "repository root")
    artifact_root = _absolute_directory(artifact_root, "recording artifact root")
    handoff_validator(handoff)
    validate_acceptance_review(review, handoff)
    dialogue = _nonempty(handoff["dialogue"], "dialogue")
    if DIALOGUE_RE.fullmatch(dialogue) is None:
        raise PromotionError("dialogue slug is invalid")
    if TIMESTAMP_RE.fullmatch(generated_at) is None:
        raise PromotionError("generated_at must be an explicit UTC timestamp")
    screenplay_relative = f"audio/scripts/{dialogue}.json"
    cast_relative = "audio/cast.json"
    screenplay_path = _safe_child(repo_root, screenplay_relative, "screenplay")
    cast_path = _safe_child(repo_root, cast_relative, "cast")
    screenplay = _load_json(screenplay_path, "screenplay")
    if (
        screenplay.get("schema_version") != 2
        or screenplay.get("dialogue") != dialogue
        or screenplay.get("cast_sha256") != sha256_file(cast_path)
        or sha256_file(screenplay_path) != handoff["production"]["screenplay"]["sha256"]
        or sha256_file(cast_path) != handoff["production"]["cast"]["sha256"]
    ):
        raise PromotionError("current screenplay/cast bytes differ from the handoff")

    binding = _artifact_binding(handoff, artifact_root)
    binding["artifact_root"] = artifact_root
    master_evidence = inspect_rf64_pcm24(binding["paths"]["master"])
    chapter_artifacts: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    previous_start = -1
    for chapter in handoff["chapters"]:
        chapter_id = _nonempty(chapter["chapter_id"], "chapter id")
        if SAFE_ID_RE.fullmatch(chapter_id) is None or chapter_id in seen_ids:
            raise PromotionError("chapter IDs must be unique safe identifiers")
        seen_ids.add(chapter_id)
        audio_slice = chapter["audio_slice"]
        start = audio_slice["start_frame"]
        end = audio_slice["end_frame"]
        if (
            not isinstance(start, int)
            or isinstance(start, bool)
            or not isinstance(end, int)
            or isinstance(end, bool)
            or start <= previous_start
            or start < 0
            or end <= start
            or end > master_evidence["sample_count"]
        ):
            raise PromotionError("chapter timeline is invalid")
        previous_start = start
        relative = f"artifacts/{binding['plan_sha256']}/chapters/{chapter_id}.wav"
        target = _safe_child(artifact_root, relative, "chapter artifact")
        artifact = plan_chapter_artifact(
            binding["paths"]["master"],
            target,
            start_frame=start,
            end_frame=end,
        )
        artifact["chapter_id"] = chapter_id
        artifact["relative_path"] = relative
        chapter_artifacts.append(artifact)

    qa = _accepted_qa(
        handoff=handoff,
        review=review,
        generated_at=generated_at,
        chapter_artifacts=chapter_artifacts,
        artifact_binding=binding,
    )
    qa_bytes = pretty_json(qa)
    qa_relative = f"audio/qa/{dialogue}.json"
    recording_relative = f"wiki/recordings/{dialogue}.json"
    recording_path = _safe_child(
        repo_root,
        recording_relative,
        "recording target",
    )
    existing_recording = _existing_recording(recording_path, dialogue=dialogue)
    stable_recording_id = (
        recording_id
        if recording_id is not None
        else f"plato-{dialogue}-{binding['plan_sha256'][:16]}"
    )
    if SAFE_ID_RE.fullmatch(stable_recording_id) is None:
        raise PromotionError("recording_id is not a stable lowercase identifier")
    recording = _recording_manifest(
        handoff=handoff,
        screenplay=screenplay,
        qa_sha256=sha256_bytes(qa_bytes),
        artifact_binding=binding,
        recording_id=stable_recording_id,
        cast=(
            existing_recording["cast"]
            if existing_recording is not None
            else None
        ),
        provenance=(
            existing_recording["provenance"]
            if existing_recording is not None
            else None
        ),
    )
    recording_bytes = pretty_json(recording)
    expected_existing_recording = None
    if existing_recording is not None:
        expected_existing_recording = {
            "status": existing_recording["status"],
            "recording_id": existing_recording["recording_id"],
            "sha256": existing_recording["sha256"],
        }
        if (
            existing_recording["status"] == "accepted"
            and existing_recording["content"] != recording_bytes
        ):
            raise PromotionError(
                "existing accepted canonical recording target differs from this promotion"
            )
    core = {
        "schema_version": SCHEMA_VERSION,
        "status": STATUS,
        "implementation": implementation_identity(),
        "dialogue": dialogue,
        "generated_at": generated_at,
        "inputs": {
            "handoff_evidence_sha256": handoff["evidence_sha256"],
            "handoff_content_sha256": sha256_bytes(canonical_json(handoff)),
            "acceptance_review_sha256": sha256_bytes(canonical_json(review)),
            "screenplay_path": screenplay_relative,
            "screenplay_sha256": sha256_file(screenplay_path),
            "cast_path": cast_relative,
            "cast_sha256": sha256_file(cast_path),
            "artifact_root": str(artifact_root),
            "working_master_path": str(binding["paths"]["master"]),
            "working_master_sha256": binding["hashes"]["master"],
        },
        "chapter_artifacts": chapter_artifacts,
        "qa_target": {
            "path": qa_relative,
            "sha256": sha256_bytes(qa_bytes),
        },
        "recording_target": {
            "path": recording_relative,
            "sha256": sha256_bytes(recording_bytes),
            "expected_existing": expected_existing_recording,
        },
        "qa": qa,
        "recording": recording,
    }
    return {**core, "plan_sha256": sha256_bytes(canonical_json(core))}


def validate_promotion_plan(plan: dict[str, Any]) -> None:
    fields = {
        "schema_version",
        "status",
        "implementation",
        "dialogue",
        "generated_at",
        "inputs",
        "chapter_artifacts",
        "qa_target",
        "recording_target",
        "qa",
        "recording",
        "plan_sha256",
    }
    _exact_object(plan, fields, "promotion plan")
    digest = _sha256(plan["plan_sha256"], "promotion plan SHA-256")
    core = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if sha256_bytes(canonical_json(core)) != digest:
        raise PromotionError("promotion plan content address is inconsistent")
    recording_target = _exact_object(
        plan.get("recording_target"),
        {"path", "sha256", "expected_existing"},
        "promotion recording target",
    )
    expected_existing = recording_target["expected_existing"]
    if expected_existing is not None:
        expected_existing = _exact_object(
            expected_existing,
            {"status", "recording_id", "sha256"},
            "promotion existing recording binding",
        )
        if (
            expected_existing["status"] not in {"draft", "accepted"}
            or SAFE_ID_RE.fullmatch(
                _nonempty(
                    expected_existing["recording_id"],
                    "promotion existing recording id",
                )
            )
            is None
        ):
            raise PromotionError("promotion existing recording binding is invalid")
        _sha256(
            expected_existing["sha256"],
            "promotion existing recording SHA-256",
        )
        if (
            expected_existing["status"] == "accepted"
            and expected_existing["sha256"] != recording_target["sha256"]
        ):
            raise PromotionError(
                "promotion accepted recording binding differs from the output"
            )
    if (
        plan["schema_version"] != SCHEMA_VERSION
        or plan["status"] != STATUS
        or plan["implementation"] != implementation_identity()
        or plan["qa_target"]["sha256"] != sha256_bytes(pretty_json(plan["qa"]))
        or recording_target["sha256"]
        != sha256_bytes(pretty_json(plan["recording"]))
    ):
        raise PromotionError("promotion plan identity or output hashes are stale")


def _atomic_replace(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.parent.is_symlink():
        raise PromotionError(f"canonical target parent is symlinked: {path.parent}")
    temporary = path.parent / f".{path.name}.tmp-{uuid.uuid4().hex}"
    try:
        with temporary.open("xb") as handle:
            handle.write(content)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
        descriptor = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
    except BaseException:
        temporary.unlink(missing_ok=True)
        raise


def _write_atomic_exact(path: Path, content: bytes) -> bool:
    if path.exists() or path.is_symlink():
        if path.is_symlink() or not path.is_file():
            raise PromotionError(f"canonical target is not a regular file: {path}")
        if path.read_bytes() != content:
            raise PromotionError(f"existing canonical target differs: {path}")
        return False
    _atomic_replace(path, content)
    return True


def _replace_atomic_exact(
    path: Path,
    content: bytes,
    *,
    expected_existing_sha256: str,
) -> bytes:
    expected = _sha256(
        expected_existing_sha256,
        "expected existing canonical recording SHA-256",
    )
    if path.is_symlink() or not path.is_file():
        raise PromotionError(f"canonical recording target changed after planning: {path}")
    previous = path.read_bytes()
    if sha256_bytes(previous) != expected:
        raise PromotionError(
            f"canonical recording target changed after planning: {path}"
        )
    _atomic_replace(path, content)
    return previous


def _target_action(
    path: Path,
    content: bytes,
    *,
    expected_existing: dict[str, Any] | None = None,
) -> str:
    if path.exists() or path.is_symlink():
        if path.is_symlink() or not path.is_file():
            raise PromotionError(f"canonical target is not a regular file: {path}")
        existing = path.read_bytes()
        if existing == content:
            return "unchanged"
        if (
            expected_existing is not None
            and expected_existing["status"] == "draft"
            and sha256_bytes(existing) == expected_existing["sha256"]
        ):
            return "replace-draft"
        raise PromotionError(f"existing canonical target differs: {path}")
    if expected_existing is not None:
        raise PromotionError(f"canonical recording target changed after planning: {path}")
    return "create"


def _default_validator(repo_root: Path, artifact_root: Path) -> tuple[int, str]:
    result = subprocess.run(
        ["bun", "run", "validate"],
        cwd=repo_root,
        env={
            **os.environ,
            "PLATO_RECORDING_ARTIFACT_ROOT": str(artifact_root),
        },
        text=True,
        capture_output=True,
        check=False,
    )
    return result.returncode, (result.stderr or result.stdout).strip()


def execute_promotion_plan(
    plan: dict[str, Any],
    *,
    repo_root: Path,
    artifact_root: Path,
    reviewed_plan_sha256: str,
    validator: Callable[[], tuple[int, str]] | None = None,
) -> dict[str, Any]:
    validate_promotion_plan(plan)
    repo_root = _absolute_directory(repo_root, "repository root")
    artifact_root = _absolute_directory(artifact_root, "recording artifact root")
    reviewed = _sha256(reviewed_plan_sha256, "reviewed promotion plan SHA-256")
    if reviewed != plan["plan_sha256"]:
        raise PromotionError("reviewed promotion plan SHA-256 does not match")
    if (
        plan["inputs"]["artifact_root"] != str(artifact_root)
        or plan["inputs"]["screenplay_sha256"]
        != sha256_file(
            _safe_child(
                repo_root,
                plan["inputs"]["screenplay_path"],
                "screenplay",
            )
        )
        or plan["inputs"]["cast_sha256"]
        != sha256_file(_safe_child(repo_root, plan["inputs"]["cast_path"], "cast"))
        or plan["inputs"]["working_master_sha256"]
        != sha256_file(Path(plan["inputs"]["working_master_path"]))
    ):
        raise PromotionError("promotion inputs changed after planning")

    qa_path = _safe_child(repo_root, plan["qa_target"]["path"], "QA target")
    recording_path = _safe_child(
        repo_root,
        plan["recording_target"]["path"],
        "recording target",
    )
    qa_bytes = pretty_json(plan["qa"])
    recording_bytes = pretty_json(plan["recording"])
    qa_action = _target_action(qa_path, qa_bytes)
    expected_existing_recording = plan["recording_target"]["expected_existing"]
    recording_action = _target_action(
        recording_path,
        recording_bytes,
        expected_existing=expected_existing_recording,
    )

    created_chapters: list[Path] = []
    created_repo_files: list[Path] = []
    replaced_repo_files: list[tuple[Path, bytes]] = []
    try:
        for artifact in plan["chapter_artifacts"]:
            target = Path(artifact["target_path"])
            if (
                _relative_to_root(target, artifact_root, "chapter artifact")
                != artifact["relative_path"]
            ):
                raise PromotionError("chapter artifact path binding changed")
            created = materialize_chapter_artifact(
                Path(artifact["source_path"]),
                target,
                start_frame=artifact["start_frame"],
                end_frame=artifact["end_frame"],
                expected_sha256=artifact["sha256"],
            )
            if created:
                created_chapters.append(target)
        if qa_action == "create" and _write_atomic_exact(qa_path, qa_bytes):
            created_repo_files.append(qa_path)
        if recording_action == "create":
            if _write_atomic_exact(recording_path, recording_bytes):
                created_repo_files.append(recording_path)
        elif recording_action == "replace-draft":
            previous = _replace_atomic_exact(
                recording_path,
                recording_bytes,
                expected_existing_sha256=expected_existing_recording["sha256"],
            )
            replaced_repo_files.append((recording_path, previous))
        result = (
            validator()
            if validator is not None
            else _default_validator(repo_root, artifact_root)
        )
        if result[0] != 0:
            raise PromotionError(
                f"repository validator failed after promotion: {result[1]}"
            )
    except BaseException as error:
        rollback_errors: list[str] = []
        for path in reversed(created_repo_files):
            path.unlink(missing_ok=True)
        for path, previous in reversed(replaced_repo_files):
            try:
                _replace_atomic_exact(
                    path,
                    previous,
                    expected_existing_sha256=plan["recording_target"]["sha256"],
                )
            except BaseException as rollback_error:
                rollback_errors.append(f"{path}: {rollback_error}")
        for path in reversed(created_chapters):
            path.unlink(missing_ok=True)
        for directory in sorted(
            {path.parent for path in created_chapters},
            key=lambda item: len(item.parts),
            reverse=True,
        ):
            try:
                directory.rmdir()
            except OSError:
                pass
        if rollback_errors:
            raise PromotionError(
                "promotion failed and canonical draft rollback also failed: "
                + "; ".join(rollback_errors)
            ) from error
        raise
    return {
        "schema_version": 1,
        "status": "accepted-audio-production-promoted",
        "dialogue": plan["dialogue"],
        "plan_sha256": plan["plan_sha256"],
        "qa_path": plan["qa_target"]["path"],
        "recording_path": plan["recording_target"]["path"],
        "chapter_count": len(plan["chapter_artifacts"]),
        "created_chapter_count": len(created_chapters),
        "created_repo_file_count": len(created_repo_files),
        "replaced_repo_file_count": len(replaced_repo_files),
        "accepted": True,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--handoff", type=Path, required=True)
    parser.add_argument("--acceptance-review", type=Path, required=True)
    parser.add_argument("--recording-artifact-root", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    parser.add_argument("--generated-at", required=True)
    parser.add_argument("--recording-id")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--reviewed-plan-sha256")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        handoff = _load_json(args.handoff, "QA handoff")
        review = _load_json(args.acceptance_review, "acceptance review")
        plan = build_promotion_plan(
            repo_root=args.repo_root.resolve(),
            artifact_root=args.recording_artifact_root.resolve(),
            handoff=handoff,
            review=review,
            generated_at=args.generated_at,
            recording_id=args.recording_id,
        )
        if args.execute:
            if not args.reviewed_plan_sha256:
                raise PromotionError(
                    "--execute requires --reviewed-plan-sha256 from the dry run"
                )
            result = execute_promotion_plan(
                plan,
                repo_root=args.repo_root.resolve(),
                artifact_root=args.recording_artifact_root.resolve(),
                reviewed_plan_sha256=args.reviewed_plan_sha256,
            )
        else:
            result = {
                "schema_version": 1,
                "status": "accepted-audio-production-promotion-preview",
                "dialogue": plan["dialogue"],
                "plan_sha256": plan["plan_sha256"],
                "chapter_count": len(plan["chapter_artifacts"]),
                "qa_target": plan["qa_target"],
                "recording_target": plan["recording_target"],
                "accepted": False,
                "writes": False,
                "execute_command": (
                    f"{sys.executable} {Path(__file__)}"
                    f" --handoff {args.handoff}"
                    f" --acceptance-review {args.acceptance_review}"
                    f" --recording-artifact-root {args.recording_artifact_root}"
                    f" --repo-root {args.repo_root}"
                    f" --generated-at {args.generated_at}"
                    f" --execute --reviewed-plan-sha256 {plan['plan_sha256']}"
                ),
            }
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
        return 0
    except PromotionError as error:
        print(f"audio QA promotion failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
