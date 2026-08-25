#!/usr/bin/env python3
"""Deterministically master one verified full-dialogue renderer assembly.

Planning performs the first loudness-analysis pass and writes no audio. Execution
requires the reviewed content-addressed plan, repeats that analysis under the
same pinned tools, writes a mono 48 kHz PCM24 working master and deterministic
MP3 publication derivative, then emits mechanical-only scratch QA evidence.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib.metadata
import importlib.util
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import uuid
from pathlib import Path
from typing import Any

from render_dots import (
    ASSEMBLY_SCHEMA_VERSION,
    MASTER_CONTAINER_PROFILE as RENDERER_RF64_CONTAINER_PROFILE,
    PRODUCTION_SAMPLE_WIDTH_BYTES,
    SAMPLE_RATE,
    RenderContractError,
    content_sha256,
    load_accepted_render_inputs,
    load_render_plan_artifact,
    resolve_full_dialogue_assembly,
    sha256_file,
)


PLAN_SCHEMA_VERSION = 5
RESULT_SCHEMA_VERSION = 5
QA_SCHEMA_VERSION = 5
MASTERING_IMPLEMENTATION_NAME = "plato-master-audio"
MASTERING_IMPLEMENTATION_VERSION = 6
PLAN_STATUS = "full-dialogue-mastering-plan"
RESULT_STATUS = "mastered-mechanical-evidence-only"
QA_STATUS_PASS = "mechanical-pass-unaccepted"
QA_STATUS_FAIL = "mechanical-fail-unaccepted"
MECHANICAL_ACCEPTANCE_REASON = (
    "mechanical evidence only; accepted production requires "
    "separate ASR and explicit production authorization"
)

TARGET_INTEGRATED_LUFS = -19.0
TARGET_TOLERANCE_LU = 1.0
TRUE_PEAK_LIMIT_DBTP = -1.0
NORMALIZATION_TRUE_PEAK_DBTP = -1.2
TARGET_LRA_LU = 11.0
PUBLICATION_CODEC = "libmp3lame"
PUBLICATION_CODEC_NAME = "mp3"
PUBLICATION_BITRATE = "96k"
PUBLICATION_BITRATE_BPS = 96_000
PUBLICATION_FILENAME = "publication.mp3"
WORKING_FILENAME = "master.wav"
WORKING_BITRATE_BPS = SAMPLE_RATE * PRODUCTION_SAMPLE_WIDTH_BYTES * 8
PCM_SCAN_FRAMES = 1024 * 1024
RF64_CONTAINER_PROFILE = "rf64-pcm24-v1"
MP3_CONTAINER_PROFILE = "mp3-cbr-96k-v1"
RF64_SIZE_SENTINEL = (1 << 32) - 1
PCM_SUBFORMAT_GUID = bytes.fromhex("0100000000001000800000aa00389b71")
NUMPY_DISTRIBUTION = "numpy"
NUMPY_VERSION = "2.2.6"
RF64_EVIDENCE_FIELDS = {
    "profile",
    "riff_size_bytes",
    "data_size_bytes",
    "sample_count",
    "data_offset_bytes",
    "fmt_chunk_size_bytes",
    "format_tag",
    "chunk_ids",
}

SILENCE_NOISE_DB = -50.0
SILENCE_MIN_SECONDS = 0.25
MAX_UNEXPECTED_SILENCE_MS = 1200
MAX_BOUNDARY_CROSSING_SILENCE_MS = 800
BOUNDARY_EDGE_GUARD_MS = 5
PUBLICATION_DURATION_TOLERANCE_SECONDS = 0.15

LOUDNESS_KEYS = {
    "input_i",
    "input_tp",
    "input_lra",
    "input_thresh",
    "target_offset",
}
CHAPTER_EVIDENCE_FIELDS = (
    "chapter_id",
    "input_sha256",
    "audio_sha256",
    "frames",
    "timing_sha256",
    "sidecar_sha256",
)
CHAPTER_START_FIELDS = (*CHAPTER_EVIDENCE_FIELDS, "start_frame", "start_seconds")
CHAPTER_TIMELINE_FIELDS = (
    *CHAPTER_EVIDENCE_FIELDS,
    "start_frame",
    "end_frame",
    "start_seconds",
    "end_seconds",
)
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
SILENCE_START_RE = re.compile(r"silence_start:\s*(-?[0-9]+(?:\.[0-9]+)?)")
SILENCE_END_RE = re.compile(
    r"silence_end:\s*(-?[0-9]+(?:\.[0-9]+)?)\s*\|\s*"
    r"silence_duration:\s*([0-9]+(?:\.[0-9]+)?)"
)

MASTERING_POLICY = {
    "schema_version": 3,
    "renderer_source": {
        "container_profile": RENDERER_RF64_CONTAINER_PROFILE,
    },
    "working_master": {
        "container_profile": RF64_CONTAINER_PROFILE,
        "rf64_header_canonicalization": "rewrite-ds64-from-verified-pcm-payload-v1",
        "sample_rate": SAMPLE_RATE,
        "channels": 1,
        "codec": "pcm_s24le",
        "sample_width_bytes": PRODUCTION_SAMPLE_WIDTH_BYTES,
        "integrated_lufs": TARGET_INTEGRATED_LUFS,
        "integrated_tolerance_lu": TARGET_TOLERANCE_LU,
        "normalization_true_peak_dbtp": NORMALIZATION_TRUE_PEAK_DBTP,
        "true_peak_limit_dbtp": TRUE_PEAK_LIMIT_DBTP,
        "loudness_range_lu": TARGET_LRA_LU,
        "normalization": "ffmpeg-loudnorm-two-pass-linear",
    },
    "publication": {
        "container": "mp3",
        "container_profile": MP3_CONTAINER_PROFILE,
        "codec": PUBLICATION_CODEC,
        "bitrate": PUBLICATION_BITRATE,
        "sample_rate": SAMPLE_RATE,
        "channels": 1,
        "metadata": "stripped",
        "xing_header": False,
    },
    "mechanical_qa": {
        "pcm_scanner": "numpy-vectorized-rf64-blocks-v1",
        "numpy_version": NUMPY_VERSION,
        "silence_noise_db": SILENCE_NOISE_DB,
        "silence_min_seconds": SILENCE_MIN_SECONDS,
        "max_unexpected_silence_ms": MAX_UNEXPECTED_SILENCE_MS,
        "max_boundary_crossing_silence_ms": MAX_BOUNDARY_CROSSING_SILENCE_MS,
        "boundary_edge_guard_ms": BOUNDARY_EDGE_GUARD_MS,
        "publication_duration_tolerance_seconds": (
            PUBLICATION_DURATION_TOLERANCE_SECONDS
        ),
        "asr_required_for_acceptance_but_not_performed_here": True,
        "production_authorization_required_but_not_performed_here": True,
    },
}


class MasteringContractError(ValueError):
    """Raised when a mastering input, plan, output, or QA artifact is unsafe."""


def _sha256(value: Any, location: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise MasteringContractError(f"{location}: expected a lowercase SHA-256")
    return value


def mastering_implementation() -> dict[str, Any]:
    """Return the exact authoritative implementation identity for this process."""
    return {
        "name": MASTERING_IMPLEMENTATION_NAME,
        "version": MASTERING_IMPLEMENTATION_VERSION,
        "code_sha256": sha256_file(Path(__file__).resolve(strict=True)),
    }


def validate_mastering_implementation(value: Any) -> None:
    if not isinstance(value, dict) or set(value) != {
        "name",
        "version",
        "code_sha256",
    }:
        raise MasteringContractError("mastering implementation identity is invalid")
    _sha256(value["code_sha256"], "mastering implementation code SHA-256")
    if value != mastering_implementation():
        raise MasteringContractError("mastering implementation identity is stale")


def _urlsafe_sha256(path: Path) -> tuple[str, str, int]:
    digest = bytes.fromhex(sha256_file(path))
    encoded = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return digest.hex(), encoded, path.stat().st_size


def resolve_analysis_runtime() -> dict[str, Any]:
    """Bind the exact NumPy code and binaries used by the PCM24 scanner."""

    spec = importlib.util.find_spec("numpy")
    if spec is None or not isinstance(spec.origin, str):
        raise MasteringContractError(
            f"mastering requires NumPy {NUMPY_VERSION}; module is unavailable"
        )
    raw_origin = Path(spec.origin)
    if not raw_origin.is_absolute() or raw_origin.is_symlink():
        raise MasteringContractError("mastering NumPy module origin is unsafe")
    try:
        origin = raw_origin.resolve(strict=True)
        distribution = importlib.metadata.distribution(NUMPY_DISTRIBUTION)
    except (FileNotFoundError, importlib.metadata.PackageNotFoundError) as error:
        raise MasteringContractError(
            f"mastering requires the NumPy {NUMPY_VERSION} distribution"
        ) from error
    if distribution.version != NUMPY_VERSION:
        raise MasteringContractError(
            f"mastering requires NumPy {NUMPY_VERSION}; found {distribution.version}"
        )
    raw_root = Path(distribution.locate_file(""))
    if raw_root.is_symlink() or not raw_root.is_dir():
        raise MasteringContractError("mastering NumPy distribution root is unsafe")
    root = raw_root.resolve(strict=True)
    try:
        origin_relative = origin.relative_to(root).as_posix()
    except ValueError as error:
        raise MasteringContractError(
            "mastering NumPy import is shadowed outside its distribution"
        ) from error
    if origin_relative != "numpy/__init__.py":
        raise MasteringContractError(
            f"mastering NumPy import origin is unexpected: {origin_relative}"
        )

    files = distribution.files
    record_raw = distribution.read_text("RECORD")
    if not files or not record_raw:
        raise MasteringContractError(
            "mastering NumPy distribution has no verifiable RECORD inventory"
        )
    entries: list[dict[str, Any]] = []
    binary_count = 0
    for entry in sorted(files, key=lambda item: item.as_posix()):
        logical = entry.as_posix()
        parts = entry.parts
        in_package = bool(parts) and parts[0] == "numpy"
        in_metadata = bool(parts) and (
            parts[0].startswith("numpy-") and parts[0].endswith(".dist-info")
        )
        if not (in_package or in_metadata):
            continue
        raw_path = Path(distribution.locate_file(entry))
        if raw_path.is_symlink():
            raise MasteringContractError(
                f"mastering NumPy inventory contains a symlink: {logical}"
            )
        try:
            path = raw_path.resolve(strict=True)
            path.relative_to(root)
        except (FileNotFoundError, ValueError) as error:
            raise MasteringContractError(
                f"mastering NumPy inventory path is unsafe: {logical}"
            ) from error
        if not path.is_file():
            raise MasteringContractError(
                f"mastering NumPy inventory entry is not a file: {logical}"
            )
        actual_sha256, actual_record_hash, actual_size = _urlsafe_sha256(path)
        if entry.size is not None and entry.size != actual_size:
            raise MasteringContractError(
                f"mastering NumPy RECORD size mismatch: {logical}"
            )
        if entry.hash is not None and (
            entry.hash.mode != "sha256" or entry.hash.value != actual_record_hash
        ):
            raise MasteringContractError(
                f"mastering NumPy RECORD hash mismatch: {logical}"
            )
        suffix = path.suffix.lower()
        is_binary = suffix in {".so", ".dylib", ".pyd", ".dll"}
        binary_count += int(is_binary)
        entries.append(
            {
                "path": logical,
                "sha256": actual_sha256,
                "size_bytes": actual_size,
                "binary": is_binary,
            }
        )
    if (
        not entries
        or binary_count == 0
        or origin_relative not in {entry["path"] for entry in entries}
    ):
        raise MasteringContractError(
            "mastering NumPy package/code/binary inventory is incomplete"
        )
    numpy = __import__("numpy")
    loaded_file = getattr(numpy, "__file__", None)
    if (
        getattr(numpy, "__version__", None) != NUMPY_VERSION
        or not isinstance(loaded_file, str)
        or Path(loaded_file).resolve(strict=True) != origin
    ):
        raise MasteringContractError(
            "loaded NumPy runtime differs from mastering provenance"
        )
    return {
        "name": NUMPY_DISTRIBUTION,
        "version": NUMPY_VERSION,
        "distribution_root": str(root),
        "module_origin": str(origin),
        "module_origin_sha256": sha256_file(origin),
        "record_sha256": hashlib.sha256(record_raw.encode("utf-8")).hexdigest(),
        "inventory_sha256": content_sha256(entries),
        "file_count": len(entries),
        "binary_file_count": binary_count,
        "total_bytes": sum(entry["size_bytes"] for entry in entries),
    }


def validate_analysis_runtime(value: Any) -> Any:
    fields = {
        "name",
        "version",
        "distribution_root",
        "module_origin",
        "module_origin_sha256",
        "record_sha256",
        "inventory_sha256",
        "file_count",
        "binary_file_count",
        "total_bytes",
    }
    if not isinstance(value, dict) or set(value) != fields:
        raise MasteringContractError("mastering analysis runtime fields are invalid")
    for field in (
        "module_origin_sha256",
        "record_sha256",
        "inventory_sha256",
    ):
        _sha256(value[field], f"mastering analysis runtime {field}")
    for field in ("file_count", "binary_file_count", "total_bytes"):
        if (
            isinstance(value[field], bool)
            or not isinstance(value[field], int)
            or value[field] <= 0
        ):
            raise MasteringContractError(
                f"mastering analysis runtime {field} is invalid"
            )
    current = resolve_analysis_runtime()
    if value != current:
        raise MasteringContractError("mastering analysis runtime is stale")
    return __import__("numpy")


def _finite(value: Any, location: str) -> float:
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
    ):
        raise MasteringContractError(f"{location}: expected a finite number")
    return float(value)


def _read_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise MasteringContractError(
            f"cannot read JSON object {path}: {error}"
        ) from error
    if not isinstance(value, dict):
        raise MasteringContractError(f"{path}: expected a JSON object")
    return value


def _run(command: list[str]) -> subprocess.CompletedProcess[str]:
    environment = {
        **os.environ,
        "LC_ALL": "C",
        "LANG": "C",
        "SOURCE_DATE_EPOCH": "0",
    }
    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        text=True,
        env=environment,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise MasteringContractError(
            f"command failed ({result.returncode}): {command[0]}: {detail}"
        )
    return result


def tool_identity(name: str) -> dict[str, str]:
    raw = shutil.which(name)
    if raw is None:
        raise MasteringContractError(f"required tool is unavailable: {name}")
    path = Path(raw).resolve(strict=True)
    if not path.is_file():
        raise MasteringContractError(f"tool is not a regular file: {path}")
    result = _run([str(path), "-version"])
    first_line = result.stdout.splitlines()[0].strip() if result.stdout else ""
    if not first_line.startswith(f"{name} version "):
        raise MasteringContractError(f"cannot identify {name} version")
    return {
        "name": name,
        "path": str(path),
        "sha256": sha256_file(path),
        "version": first_line,
    }


def resolve_tools() -> dict[str, dict[str, str]]:
    return {name: tool_identity(name) for name in ("ffmpeg", "ffprobe")}


def substitute_command(template: list[str], **values: Path) -> list[str]:
    replacements = {f"{{{name}}}": str(path) for name, path in values.items()}
    command: list[str] = []
    for item in template:
        command.append(replacements.get(item, item))
    unresolved = [
        item for item in command if item.startswith("{") and item.endswith("}")
    ]
    if unresolved:
        raise MasteringContractError(
            f"command template has unresolved paths: {', '.join(unresolved)}"
        )
    return command


def first_pass_template(ffmpeg: str) -> list[str]:
    loudnorm = (
        f"loudnorm=I={TARGET_INTEGRATED_LUFS:g}:TP={NORMALIZATION_TRUE_PEAK_DBTP:g}:"
        f"LRA={TARGET_LRA_LU:g}:print_format=json"
    )
    return [
        ffmpeg,
        "-hide_banner",
        "-nostdin",
        "-v",
        "info",
        "-i",
        "{source}",
        "-map_metadata",
        "-1",
        "-vn",
        "-af",
        loudnorm,
        "-f",
        "null",
        "-",
    ]


def _measurement_text(value: float) -> str:
    return f"{value:.6f}"


def command_templates(
    tools: dict[str, dict[str, str]], analysis: dict[str, float]
) -> dict[str, list[str]]:
    ffmpeg = tools["ffmpeg"]["path"]
    ffprobe = tools["ffprobe"]["path"]
    second_filter = (
        f"loudnorm=I={TARGET_INTEGRATED_LUFS:g}:TP={NORMALIZATION_TRUE_PEAK_DBTP:g}:"
        f"LRA={TARGET_LRA_LU:g}:"
        f"measured_I={_measurement_text(analysis['input_i'])}:"
        f"measured_TP={_measurement_text(analysis['input_tp'])}:"
        f"measured_LRA={_measurement_text(analysis['input_lra'])}:"
        f"measured_thresh={_measurement_text(analysis['input_thresh'])}:"
        f"offset={_measurement_text(analysis['target_offset'])}:"
        "linear=true:print_format=summary"
    )
    verify_filter = (
        f"loudnorm=I={TARGET_INTEGRATED_LUFS:g}:TP={TRUE_PEAK_LIMIT_DBTP:g}:"
        f"LRA={TARGET_LRA_LU:g}:print_format=json"
    )
    silence_filter = (
        f"silencedetect=noise={SILENCE_NOISE_DB:g}dB:d={SILENCE_MIN_SECONDS:g}"
    )
    probe = [
        ffprobe,
        "-v",
        "error",
        "-show_entries",
        "stream=index,codec_name,codec_type,sample_fmt,sample_rate,channels,"
        "bits_per_sample,bit_rate:format=format_name,duration,size",
        "-of",
        "json",
        "{media}",
    ]
    return {
        "source_probe": copy.deepcopy(probe),
        "first_pass": first_pass_template(ffmpeg),
        "working_master": [
            ffmpeg,
            "-hide_banner",
            "-nostdin",
            "-v",
            "error",
            "-i",
            "{source}",
            "-map_metadata",
            "-1",
            "-vn",
            "-af",
            second_filter,
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "1",
            "-c:a",
            "pcm_s24le",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "-rf64",
            "always",
            "{working_master}",
        ],
        "working_probe": copy.deepcopy(probe),
        "verify_loudness": [
            ffmpeg,
            "-hide_banner",
            "-nostdin",
            "-v",
            "info",
            "-i",
            "{working_master}",
            "-map_metadata",
            "-1",
            "-vn",
            "-af",
            verify_filter,
            "-f",
            "null",
            "-",
        ],
        "publication": [
            ffmpeg,
            "-hide_banner",
            "-nostdin",
            "-v",
            "error",
            "-i",
            "{working_master}",
            "-map_metadata",
            "-1",
            "-vn",
            "-ar",
            str(SAMPLE_RATE),
            "-ac",
            "1",
            "-c:a",
            PUBLICATION_CODEC,
            "-b:a",
            PUBLICATION_BITRATE,
            "-write_xing",
            "0",
            "-id3v2_version",
            "0",
            "-fflags",
            "+bitexact",
            "-flags:a",
            "+bitexact",
            "{publication}",
        ],
        "publication_probe": copy.deepcopy(probe),
        "silence_scan": [
            ffmpeg,
            "-hide_banner",
            "-nostdin",
            "-v",
            "info",
            "-i",
            "{working_master}",
            "-af",
            silence_filter,
            "-f",
            "null",
            "-",
        ],
    }


def parse_loudnorm_json(log: str) -> dict[str, float]:
    candidates: list[dict[str, Any]] = []
    for match in re.finditer(r"\{[^{}]*\}", log, flags=re.DOTALL):
        try:
            value = json.loads(match.group(0))
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict) and LOUDNESS_KEYS.issubset(value):
            candidates.append(value)
    if len(candidates) != 1:
        raise MasteringContractError(
            f"expected one loudnorm JSON measurement, found {len(candidates)}"
        )
    parsed: dict[str, float] = {}
    for key in sorted(LOUDNESS_KEYS):
        try:
            number = float(candidates[0][key])
        except (TypeError, ValueError) as error:
            raise MasteringContractError(f"loudnorm {key} is not numeric") from error
        if not math.isfinite(number):
            raise MasteringContractError(f"loudnorm {key} is not finite")
        parsed[key] = number
    return parsed


def measure_loudness(
    source: Path, tools: dict[str, dict[str, str]]
) -> dict[str, float]:
    command = substitute_command(
        first_pass_template(tools["ffmpeg"]["path"]), source=source
    )
    return parse_loudnorm_json(_run(command).stderr)


def _read_exact(handle: Any, size: int, location: str) -> bytes:
    payload = handle.read(size)
    if len(payload) != size:
        raise MasteringContractError(f"RF64 {location} is truncated")
    return payload


def inspect_rf64_pcm24(path: Path) -> dict[str, Any]:
    """Validate the exact long-form RF64 PCM24 container and return scan offsets."""

    if path.is_symlink() or not path.is_file():
        raise MasteringContractError(f"RF64 input must be a regular file: {path}")
    file_size = path.stat().st_size
    if file_size < 80:
        raise MasteringContractError("RF64 file is too short")
    with path.open("rb") as handle:
        if _read_exact(handle, 12, "header") != (
            b"RF64" + struct.pack("<I", RF64_SIZE_SENTINEL) + b"WAVE"
        ):
            raise MasteringContractError(
                "working/source WAV must use forced RF64, not classic RIFF"
            )
        chunk_id, chunk_size = struct.unpack(
            "<4sI", _read_exact(handle, 8, "ds64 header")
        )
        if chunk_id != b"ds64" or chunk_size != 28:
            raise MasteringContractError("RF64 must begin with the exact ds64 chunk")
        riff_size, data_size, sample_count, table_length = struct.unpack(
            "<QQQI", _read_exact(handle, chunk_size, "ds64 payload")
        )
        if table_length != 0 or riff_size != file_size - 8:
            raise MasteringContractError("RF64 ds64 size evidence is inconsistent")

        fmt_size: int | None = None
        format_tag: str | None = None
        data_offset: int | None = None
        chunk_ids = ["ds64"]
        while handle.tell() < file_size:
            raw_id, raw_size = struct.unpack(
                "<4sI", _read_exact(handle, 8, "chunk header")
            )
            try:
                name = raw_id.decode("ascii")
            except UnicodeDecodeError as error:
                raise MasteringContractError("RF64 chunk id is not ASCII") from error
            chunk_ids.append(name)
            if raw_id == b"fmt ":
                if fmt_size is not None or raw_size not in {16, 40}:
                    raise MasteringContractError("RF64 fmt chunk profile is invalid")
                payload = _read_exact(handle, raw_size, "fmt payload")
                (
                    raw_tag,
                    channels,
                    sample_rate,
                    byte_rate,
                    block_align,
                    bits_per_sample,
                ) = struct.unpack("<HHIIHH", payload[:16])
                if (
                    channels != 1
                    or sample_rate != SAMPLE_RATE
                    or byte_rate != WORKING_BITRATE_BPS // 8
                    or block_align != PRODUCTION_SAMPLE_WIDTH_BYTES
                    or bits_per_sample != 24
                ):
                    raise MasteringContractError(
                        "RF64 fmt chunk is not mono 48 kHz PCM24"
                    )
                if raw_tag == 1 and raw_size == 16:
                    format_tag = "pcm"
                elif raw_tag == 0xFFFE and raw_size == 40:
                    extension_size, valid_bits, channel_mask = struct.unpack(
                        "<HHI", payload[16:24]
                    )
                    if (
                        extension_size != 22
                        or valid_bits != 24
                        or channel_mask not in {0, 4}
                        or payload[24:40] != PCM_SUBFORMAT_GUID
                    ):
                        raise MasteringContractError(
                            "RF64 extensible PCM profile is invalid"
                        )
                    format_tag = "extensible-pcm"
                else:
                    raise MasteringContractError("RF64 PCM format tag is invalid")
                fmt_size = raw_size
                if raw_size & 1:
                    _read_exact(handle, 1, "fmt padding")
                continue
            if raw_id == b"data":
                if (
                    data_offset is not None
                    or fmt_size is None
                    or raw_size != RF64_SIZE_SENTINEL
                ):
                    raise MasteringContractError("RF64 data chunk profile is invalid")
                data_offset = handle.tell()
                data_end = data_offset + data_size
                padding = data_size & 1
                if data_end + padding != file_size:
                    raise MasteringContractError(
                        "RF64 data size does not cover the exact file"
                    )
                handle.seek(data_end)
                if padding and _read_exact(handle, 1, "data padding") != b"\x00":
                    raise MasteringContractError("RF64 data padding is not zero")
                break
            raise MasteringContractError(f"RF64 contains an unapproved chunk: {name!r}")

    if (
        fmt_size is None
        or format_tag is None
        or data_offset is None
        or chunk_ids != ["ds64", "fmt ", "data"]
        or data_size == 0
        or data_size % PRODUCTION_SAMPLE_WIDTH_BYTES
        or sample_count != data_size // PRODUCTION_SAMPLE_WIDTH_BYTES
        or path.stat().st_size != file_size
    ):
        raise MasteringContractError("RF64 PCM payload evidence is inconsistent")
    return {
        "profile": RF64_CONTAINER_PROFILE,
        "riff_size_bytes": riff_size,
        "data_size_bytes": data_size,
        "sample_count": sample_count,
        "data_offset_bytes": data_offset,
        "fmt_chunk_size_bytes": fmt_size,
        "format_tag": format_tag,
        "chunk_ids": chunk_ids,
    }


def canonicalize_ffmpeg_rf64_header(path: Path, *, expected_frames: int) -> None:
    """Rewrite ffmpeg's imprecise ds64 counters from the verified PCM geometry.

    ffmpeg 5.1 writes the RF64 padding byte into ``dataSize`` for odd-length
    mono PCM24 payloads and derives ``sampleCount`` from rounded stream timing.
    The pinned renderer timeline supplies the exact frame count. This function
    accepts only the exact three-chunk RF64 shape, verifies that its file
    geometry matches that frame count byte-for-byte, and canonicalizes the two
    ds64 counters before any downstream probe or publication encode.
    """

    if (
        isinstance(expected_frames, bool)
        or not isinstance(expected_frames, int)
        or expected_frames <= 0
    ):
        raise MasteringContractError("RF64 canonical frame count is invalid")
    if path.is_symlink() or not path.is_file():
        raise MasteringContractError(f"RF64 input must be a regular file: {path}")
    file_size = path.stat().st_size
    expected_data_size = expected_frames * PRODUCTION_SAMPLE_WIDTH_BYTES
    expected_padding = expected_data_size & 1

    with path.open("r+b") as handle:
        if _read_exact(handle, 12, "header") != (
            b"RF64" + struct.pack("<I", RF64_SIZE_SENTINEL) + b"WAVE"
        ):
            raise MasteringContractError(
                "working/source WAV must use forced RF64, not classic RIFF"
            )
        chunk_id, chunk_size = struct.unpack(
            "<4sI", _read_exact(handle, 8, "ds64 header")
        )
        if chunk_id != b"ds64" or chunk_size != 28:
            raise MasteringContractError("RF64 must begin with the exact ds64 chunk")
        riff_size, declared_data_size, declared_samples, table_length = struct.unpack(
            "<QQQI", _read_exact(handle, chunk_size, "ds64 payload")
        )
        if (
            table_length != 0
            or riff_size != file_size - 8
            or declared_data_size
            not in {expected_data_size, expected_data_size + expected_padding}
            or declared_samples <= 0
        ):
            raise MasteringContractError(
                "ffmpeg RF64 ds64 counters do not match verified PCM geometry"
            )

        fmt_id, fmt_size = struct.unpack(
            "<4sI", _read_exact(handle, 8, "fmt header")
        )
        if fmt_id != b"fmt " or fmt_size not in {16, 40}:
            raise MasteringContractError("RF64 fmt chunk profile is invalid")
        fmt_payload = _read_exact(handle, fmt_size, "fmt payload")
        raw_tag, channels, sample_rate, byte_rate, block_align, bits_per_sample = (
            struct.unpack("<HHIIHH", fmt_payload[:16])
        )
        if (
            channels != 1
            or sample_rate != SAMPLE_RATE
            or byte_rate != WORKING_BITRATE_BPS // 8
            or block_align != PRODUCTION_SAMPLE_WIDTH_BYTES
            or bits_per_sample != 24
        ):
            raise MasteringContractError("RF64 fmt chunk is not mono 48 kHz PCM24")
        if raw_tag == 1 and fmt_size == 16:
            pass
        elif raw_tag == 0xFFFE and fmt_size == 40:
            extension_size, valid_bits, channel_mask = struct.unpack(
                "<HHI", fmt_payload[16:24]
            )
            if (
                extension_size != 22
                or valid_bits != 24
                or channel_mask not in {0, 4}
                or fmt_payload[24:40] != PCM_SUBFORMAT_GUID
            ):
                raise MasteringContractError("RF64 extensible PCM profile is invalid")
        else:
            raise MasteringContractError("RF64 PCM format tag is invalid")

        data_id, raw_data_size = struct.unpack(
            "<4sI", _read_exact(handle, 8, "data header")
        )
        data_offset = handle.tell()
        if data_id != b"data" or raw_data_size != RF64_SIZE_SENTINEL:
            raise MasteringContractError("RF64 data chunk profile is invalid")
        if data_offset + expected_data_size + expected_padding != file_size:
            raise MasteringContractError(
                "ffmpeg RF64 payload length differs from the renderer timeline"
            )
        if expected_padding:
            handle.seek(data_offset + expected_data_size)
            if _read_exact(handle, 1, "data padding") != b"\x00":
                raise MasteringContractError("RF64 data padding is not zero")

        handle.seek(20)
        handle.write(
            struct.pack(
                "<QQQI",
                file_size - 8,
                expected_data_size,
                expected_frames,
                0,
            )
        )
        handle.flush()
        os.fsync(handle.fileno())

    inspect_rf64_pcm24(path)


def _validate_rf64_evidence(value: Any, *, frames: int, size_bytes: int) -> None:
    if not isinstance(value, dict) or set(value) != RF64_EVIDENCE_FIELDS:
        raise MasteringContractError("RF64 evidence fields are invalid")
    numeric_fields = (
        "riff_size_bytes",
        "data_size_bytes",
        "sample_count",
        "data_offset_bytes",
        "fmt_chunk_size_bytes",
    )
    if (
        isinstance(frames, bool)
        or not isinstance(frames, int)
        or frames <= 0
        or isinstance(size_bytes, bool)
        or not isinstance(size_bytes, int)
        or size_bytes <= 0
        or any(
            isinstance(value[field], bool) or not isinstance(value[field], int)
            for field in numeric_fields
        )
    ):
        raise MasteringContractError("RF64 numeric evidence is invalid")
    fmt_size = value["fmt_chunk_size_bytes"]
    data_size = frames * PRODUCTION_SAMPLE_WIDTH_BYTES
    if (
        value["profile"] != RF64_CONTAINER_PROFILE
        or value["riff_size_bytes"] != size_bytes - 8
        or value["data_size_bytes"] != data_size
        or value["sample_count"] != frames
        or fmt_size not in {16, 40}
        or value["data_offset_bytes"] != 64 + fmt_size
        or value["format_tag"] != ("pcm" if fmt_size == 16 else "extensible-pcm")
        or value["chunk_ids"] != ["ds64", "fmt ", "data"]
        or size_bytes != value["data_offset_bytes"] + data_size + (data_size & 1)
    ):
        raise MasteringContractError("RF64 evidence values are inconsistent")


def probe_media(
    source: Path,
    tools: dict[str, dict[str, str]],
    template: list[str] | None = None,
) -> dict[str, Any]:
    command = substitute_command(
        template
        or command_templates(
            tools,
            {key: 0.0 for key in LOUDNESS_KEYS},
        )["source_probe"],
        media=source,
    )
    result = _run(command)
    try:
        value = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise MasteringContractError("ffprobe returned malformed JSON") from error
    streams = value.get("streams") if isinstance(value, dict) else None
    media_format = value.get("format") if isinstance(value, dict) else None
    if (
        not isinstance(streams, list)
        or len(streams) != 1
        or not isinstance(streams[0], dict)
        or streams[0].get("codec_type") != "audio"
        or not isinstance(media_format, dict)
    ):
        raise MasteringContractError("media must contain exactly one audio stream")
    stream = streams[0]
    try:
        duration = float(media_format["duration"])
        size = int(media_format["size"])
        sample_rate = int(stream["sample_rate"])
        channels = int(stream["channels"])
        bits = int(stream.get("bits_per_sample", 0))
        bit_rate = int(stream["bit_rate"])
    except (KeyError, TypeError, ValueError) as error:
        raise MasteringContractError("ffprobe media metadata is incomplete") from error
    if not math.isfinite(duration) or duration <= 0 or size <= 0:
        raise MasteringContractError("ffprobe media duration or size is invalid")
    format_name = stream_safe_string(media_format.get("format_name"), "format")
    if format_name == "wav":
        container_profile = RF64_CONTAINER_PROFILE
        rf64 = inspect_rf64_pcm24(source)
    elif format_name == "mp3":
        container_profile = MP3_CONTAINER_PROFILE
        rf64 = None
    else:
        raise MasteringContractError(f"unsupported media container: {format_name}")
    return {
        "format_name": format_name,
        "container_profile": container_profile,
        "rf64": rf64,
        "duration_seconds": duration,
        "size_bytes": size,
        "codec_name": stream_safe_string(stream.get("codec_name"), "codec"),
        "sample_format": stream_safe_string(stream.get("sample_fmt"), "sample format"),
        "sample_rate": sample_rate,
        "channels": channels,
        "bits_per_sample": bits,
        "bit_rate": bit_rate,
    }


def stream_safe_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise MasteringContractError(f"ffprobe {label} is invalid")
    return value


def _copy_required_fields(
    value: Any,
    fields: tuple[str, ...],
    location: str,
    *,
    exact: bool = False,
) -> dict[str, Any]:
    if not isinstance(value, dict) or any(field not in value for field in fields):
        raise MasteringContractError(f"{location} fields are incomplete")
    if exact and set(value) != set(fields):
        raise MasteringContractError(f"{location} fields are invalid")
    return {field: copy.deepcopy(value[field]) for field in fields}


def _renderer_binding(
    assembly: dict[str, Any],
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    if (
        assembly.get("schema_version") != ASSEMBLY_SCHEMA_VERSION
        or assembly.get("status") != "verified-full-dialogue-render-assembly"
        or not isinstance(assembly.get("chapters"), list)
        or not assembly["chapters"]
        or not isinstance(assembly.get("complete"), dict)
    ):
        raise MasteringContractError("renderer assembly evidence is incomplete")
    chapters = []
    for chapter in assembly["chapters"]:
        chapters.append(
            _copy_required_fields(
                chapter,
                (*CHAPTER_EVIDENCE_FIELDS, "duration_seconds"),
                "renderer chapter",
            )
        )
    complete_source = assembly["complete"]
    complete = _copy_required_fields(
        complete_source,
        (
            "input_sha256",
            "audio_sha256",
            "frames",
            "duration_seconds",
            "container_profile",
            "timing_sha256",
            "sidecar_sha256",
            "chapter_starts_sha256",
        ),
        "renderer complete assembly",
    )
    starts = complete_source.get("chapter_starts")
    timing = complete_source.get("timing")
    if (
        not isinstance(starts, list)
        or not isinstance(timing, list)
        or len(starts) != len(chapters)
        or len(timing) != len(chapters)
        or content_sha256(starts) != complete["chapter_starts_sha256"]
    ):
        raise MasteringContractError("renderer chapter-start evidence is invalid")
    timeline: list[dict[str, Any]] = []
    for chapter, start, master_item in zip(chapters, starts, timing, strict=True):
        copied_start = _copy_required_fields(
            start,
            CHAPTER_START_FIELDS,
            "renderer chapter start",
            exact=True,
        )
        if not isinstance(master_item, dict) or any(
            master_item.get(field) != value for field, value in copied_start.items()
        ):
            raise MasteringContractError(
                "renderer chapter start differs from complete timing"
            )
        if any(
            copied_start[field] != chapter[field] for field in CHAPTER_EVIDENCE_FIELDS
        ):
            raise MasteringContractError(
                "renderer chapter start differs from child evidence"
            )
        timeline.append(
            {
                **copied_start,
                "end_frame": copy.deepcopy(master_item.get("end_frame")),
                "end_seconds": copy.deepcopy(master_item.get("end_seconds")),
            }
        )
    return (
        {
            "dialogue": assembly["dialogue"],
            "render_plan_sha256": assembly["render_plan_sha256"],
            "chapters": chapters,
            "complete": complete,
        },
        timeline,
    )


def _validate_renderer_binding(
    renderer: Any,
    dialogue: str,
    timeline: Any,
    timeline_sha256: Any,
) -> list[str]:
    if (
        not isinstance(renderer, dict)
        or set(renderer)
        != {
            "dialogue",
            "render_plan_sha256",
            "render_plan_artifact_sha256",
            "chapters",
            "complete",
        }
        or renderer.get("dialogue") != dialogue
    ):
        raise MasteringContractError("mastering renderer binding is invalid")
    for field in ("render_plan_sha256", "render_plan_artifact_sha256"):
        _sha256(renderer[field], f"mastering renderer {field}")

    chapters = renderer["chapters"]
    if not isinstance(chapters, list) or not chapters:
        raise MasteringContractError("mastering chapter binding is empty")
    chapter_ids: list[str] = []
    for chapter in chapters:
        if not isinstance(chapter, dict) or set(chapter) != {
            *CHAPTER_EVIDENCE_FIELDS,
            "duration_seconds",
        }:
            raise MasteringContractError("mastering chapter evidence is invalid")
        chapter_id = chapter["chapter_id"]
        if not isinstance(chapter_id, str) or not chapter_id:
            raise MasteringContractError("mastering chapter id is invalid")
        chapter_ids.append(chapter_id)
    if len(set(chapter_ids)) != len(chapter_ids):
        raise MasteringContractError("mastering chapter ids are duplicated")

    complete = renderer["complete"]
    if not isinstance(complete, dict) or set(complete) != {
        "input_sha256",
        "audio_sha256",
        "frames",
        "duration_seconds",
        "container_profile",
        "timing_sha256",
        "sidecar_sha256",
        "chapter_starts_sha256",
    }:
        raise MasteringContractError("mastering complete binding is invalid")
    for evidence in [*chapters, complete]:
        if (
            isinstance(evidence["frames"], bool)
            or not isinstance(evidence["frames"], int)
            or evidence["frames"] <= 0
            or _finite(evidence["duration_seconds"], "renderer duration")
            != evidence["frames"] / SAMPLE_RATE
        ):
            raise MasteringContractError("mastering renderer evidence is invalid")
        for field in ("input_sha256", "audio_sha256", "timing_sha256"):
            _sha256(evidence[field], f"mastering renderer {field}")
        _sha256(evidence["sidecar_sha256"], "mastering renderer sidecar_sha256")
    if complete["container_profile"] != RENDERER_RF64_CONTAINER_PROFILE:
        raise MasteringContractError(
            "mastering complete renderer assembly must use forced RF64"
        )
    _sha256(
        complete["chapter_starts_sha256"],
        "mastering renderer chapter_starts_sha256",
    )

    timeline_digest = _sha256(
        timeline_sha256,
        "mastering chapter timeline SHA-256",
    )
    if (
        not isinstance(timeline, list)
        or len(timeline) != len(chapters)
        or content_sha256(timeline) != timeline_digest
    ):
        raise MasteringContractError("mastering chapter timeline is invalid")
    renderer_starts = []
    prior_end = 0
    for index, (chapter, item) in enumerate(zip(chapters, timeline, strict=True)):
        if not isinstance(item, dict) or set(item) != set(CHAPTER_TIMELINE_FIELDS):
            raise MasteringContractError(
                "mastering chapter timeline fields are invalid"
            )
        if any(item[field] != chapter[field] for field in CHAPTER_EVIDENCE_FIELDS):
            raise MasteringContractError(
                "mastering chapter timeline differs from chapter evidence"
            )
        start = item["start_frame"]
        end = item["end_frame"]
        if (
            isinstance(start, bool)
            or not isinstance(start, int)
            or isinstance(end, bool)
            or not isinstance(end, int)
            or (index == 0 and start != 0)
            or start < prior_end
            or end != start + chapter["frames"]
            or end > complete["frames"]
            or _finite(item["start_seconds"], "chapter start seconds")
            != start / SAMPLE_RATE
            or _finite(item["end_seconds"], "chapter end seconds") != end / SAMPLE_RATE
        ):
            raise MasteringContractError(
                "mastering chapter timeline values are invalid"
            )
        renderer_starts.append(
            {field: copy.deepcopy(item[field]) for field in CHAPTER_START_FIELDS}
        )
        prior_end = end
    if (
        [item["chapter_id"] for item in timeline] != chapter_ids
        or prior_end != complete["frames"]
        or content_sha256(renderer_starts) != complete["chapter_starts_sha256"]
    ):
        raise MasteringContractError(
            "mastering chapter timeline differs from complete assembly"
        )
    return chapter_ids


def expected_boundaries(assembly: dict[str, Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    chapter_by_id = {chapter["chapter_id"]: chapter for chapter in assembly["chapters"]}
    for master_item in assembly["complete"]["timing"]:
        chapter_id = master_item["chapter_id"]
        boundary = master_item["boundary_before"]
        if boundary["kind"] != "start":
            pause_frames = round(SAMPLE_RATE * boundary["pause_ms"] / 1000)
            result.append(
                {
                    "scope": "chapter",
                    "chapter_id": chapter_id,
                    "entry_ids": [],
                    "kind": boundary["kind"],
                    "pause_ms": boundary["pause_ms"],
                    "crossfade_ms": boundary["crossfade_ms"],
                    "start_frame": master_item["start_frame"] - pause_frames,
                    "end_frame": master_item["start_frame"],
                }
            )
        base = master_item["start_frame"]
        for item in chapter_by_id[chapter_id]["timing"]:
            item_boundary = item["boundary_before"]
            if item_boundary["kind"] == "start":
                continue
            pause_frames = round(SAMPLE_RATE * item_boundary["pause_ms"] / 1000)
            result.append(
                {
                    "scope": "utterance",
                    "chapter_id": chapter_id,
                    "entry_ids": copy.deepcopy(item["entry_ids"]),
                    "kind": item_boundary["kind"],
                    "pause_ms": item_boundary["pause_ms"],
                    "crossfade_ms": item_boundary["crossfade_ms"],
                    "start_frame": base + item["start_frame"] - pause_frames,
                    "end_frame": base + item["start_frame"],
                }
            )
    return result


def build_mastering_plan(
    *,
    assembly: dict[str, Any],
    render_plan_artifact_sha256: str,
    tools: dict[str, dict[str, str]],
    source_probe: dict[str, Any],
    first_pass: dict[str, float],
) -> dict[str, Any]:
    binding, chapter_timeline = _renderer_binding(assembly)
    _sha256(render_plan_artifact_sha256, "render plan artifact SHA-256")
    if not isinstance(source_probe, dict):
        raise MasteringContractError("renderer source probe is invalid")
    _validate_rf64_evidence(
        source_probe.get("rf64"),
        frames=binding["complete"]["frames"],
        size_bytes=source_probe.get("size_bytes", 0),
    )
    if (
        source_probe.get("format_name") != "wav"
        or source_probe.get("container_profile") != RF64_CONTAINER_PROFILE
        or source_probe.get("codec_name") != "pcm_s24le"
        or source_probe.get("sample_format") != "s32"
        or source_probe.get("sample_rate") != SAMPLE_RATE
        or source_probe.get("channels") != 1
        or source_probe.get("bits_per_sample") != 24
        or source_probe.get("bit_rate") != WORKING_BITRATE_BPS
        or source_probe.get("size_bytes", 0) <= 0
        or abs(
            source_probe.get("duration_seconds", -1)
            - binding["complete"]["duration_seconds"]
        )
        > 1 / SAMPLE_RATE
    ):
        raise MasteringContractError(
            "full-dialogue renderer source must be exact mono 48 kHz PCM24"
        )
    if set(first_pass) != LOUDNESS_KEYS:
        raise MasteringContractError("first-pass loudness fields are invalid")
    measured = {
        key: _finite(first_pass[key], f"first pass {key}")
        for key in sorted(LOUDNESS_KEYS)
    }
    boundaries = expected_boundaries(assembly)
    analysis_runtime = resolve_analysis_runtime()
    plan = {
        "schema_version": PLAN_SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "implementation": mastering_implementation(),
        "analysis_runtime": analysis_runtime,
        "dialogue": binding["dialogue"],
        "renderer": {
            **binding,
            "render_plan_artifact_sha256": render_plan_artifact_sha256,
        },
        "chapter_timeline": chapter_timeline,
        "chapter_timeline_sha256": content_sha256(chapter_timeline),
        "tools": copy.deepcopy(tools),
        "policy": copy.deepcopy(MASTERING_POLICY),
        "source_probe": copy.deepcopy(source_probe),
        "first_pass": measured,
        "boundaries": boundaries,
        "boundaries_sha256": content_sha256(boundaries),
        "commands": command_templates(tools, measured),
    }
    plan["plan_sha256"] = content_sha256(plan)
    validate_mastering_plan(plan)
    return plan


def validate_mastering_plan(plan: dict[str, Any]) -> None:
    if set(plan) != {
        "schema_version",
        "status",
        "plan_sha256",
        "implementation",
        "analysis_runtime",
        "dialogue",
        "renderer",
        "chapter_timeline",
        "chapter_timeline_sha256",
        "tools",
        "policy",
        "source_probe",
        "first_pass",
        "boundaries",
        "boundaries_sha256",
        "commands",
    }:
        raise MasteringContractError("mastering plan fields are invalid")
    if (
        plan["schema_version"] != PLAN_SCHEMA_VERSION
        or plan["status"] != PLAN_STATUS
        or plan["policy"] != MASTERING_POLICY
        or not isinstance(plan["dialogue"], str)
        or not plan["dialogue"]
    ):
        raise MasteringContractError(
            "mastering plan schema, status, or policy is stale"
        )
    validate_mastering_implementation(plan["implementation"])
    validate_analysis_runtime(plan["analysis_runtime"])
    digest = _sha256(plan["plan_sha256"], "mastering plan SHA-256")
    without_digest = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if content_sha256(without_digest) != digest:
        raise MasteringContractError("mastering plan content address is inconsistent")
    renderer = plan["renderer"]
    chapter_ids = _validate_renderer_binding(
        renderer,
        plan["dialogue"],
        plan["chapter_timeline"],
        plan["chapter_timeline_sha256"],
    )
    complete = renderer["complete"]
    tools = plan["tools"]
    if not isinstance(tools, dict) or set(tools) != {"ffmpeg", "ffprobe"}:
        raise MasteringContractError("mastering tool evidence is invalid")
    for name, tool in tools.items():
        if (
            not isinstance(tool, dict)
            or set(tool) != {"name", "path", "sha256", "version"}
            or tool["name"] != name
            or not isinstance(tool["path"], str)
            or not Path(tool["path"]).is_absolute()
            or not isinstance(tool["version"], str)
            or not tool["version"].startswith(f"{name} version ")
        ):
            raise MasteringContractError("mastering tool identity is invalid")
        _sha256(tool["sha256"], f"mastering {name} SHA-256")
    first_pass = plan["first_pass"]
    if not isinstance(first_pass, dict) or set(first_pass) != LOUDNESS_KEYS:
        raise MasteringContractError("mastering first-pass evidence is invalid")
    measured = {
        key: _finite(first_pass[key], f"first pass {key}")
        for key in sorted(LOUDNESS_KEYS)
    }
    source_probe = plan["source_probe"]
    if not isinstance(source_probe, dict) or set(source_probe) != {
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
    }:
        raise MasteringContractError("mastering source probe is invalid")
    _validate_rf64_evidence(
        source_probe["rf64"],
        frames=complete["frames"],
        size_bytes=source_probe["size_bytes"],
    )
    if (
        source_probe["format_name"] != "wav"
        or source_probe["container_profile"] != RF64_CONTAINER_PROFILE
        or source_probe["codec_name"] != "pcm_s24le"
        or source_probe["sample_format"] != "s32"
        or source_probe["sample_rate"] != SAMPLE_RATE
        or source_probe["channels"] != 1
        or source_probe["bits_per_sample"] != 24
        or source_probe["bit_rate"] != WORKING_BITRATE_BPS
        or source_probe["size_bytes"] <= 0
        or abs(source_probe["duration_seconds"] - complete["duration_seconds"])
        > 1 / SAMPLE_RATE
    ):
        raise MasteringContractError("mastering source probe differs from renderer")
    boundaries = plan["boundaries"]
    if not isinstance(boundaries, list) or content_sha256(boundaries) != _sha256(
        plan["boundaries_sha256"], "boundary inventory SHA-256"
    ):
        raise MasteringContractError("mastering boundary evidence is invalid")
    prior_start = -1
    for boundary in boundaries:
        if not isinstance(boundary, dict) or set(boundary) != {
            "scope",
            "chapter_id",
            "entry_ids",
            "kind",
            "pause_ms",
            "crossfade_ms",
            "start_frame",
            "end_frame",
        }:
            raise MasteringContractError("mastering boundary fields are invalid")
        pause_ms = boundary["pause_ms"]
        crossfade_ms = boundary["crossfade_ms"]
        start = boundary["start_frame"]
        end = boundary["end_frame"]
        if (
            boundary["scope"] not in {"chapter", "utterance"}
            or boundary["chapter_id"] not in chapter_ids
            or not isinstance(boundary["entry_ids"], list)
            or not isinstance(boundary["kind"], str)
            or isinstance(pause_ms, bool)
            or not isinstance(pause_ms, int)
            or pause_ms < 0
            or isinstance(crossfade_ms, bool)
            or not isinstance(crossfade_ms, int)
            or crossfade_ms < 0
            or (pause_ms and crossfade_ms)
            or isinstance(start, bool)
            or not isinstance(start, int)
            or isinstance(end, bool)
            or not isinstance(end, int)
            or start < prior_start
            or start < 0
            or end < start
            or end > complete["frames"]
            or end - start != round(SAMPLE_RATE * pause_ms / 1000)
        ):
            raise MasteringContractError("mastering boundary values are invalid")
        prior_start = start
    if plan["commands"] != command_templates(tools, measured):
        raise MasteringContractError("mastering command templates are stale")


def write_mastering_plan(plan: dict[str, Any], outdir: Path) -> Path:
    validate_mastering_plan(plan)
    path = outdir / "plans" / f"{plan['plan_sha256']}.json"
    payload = json.dumps(plan, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if (
            path.is_symlink()
            or not path.is_file()
            or path.read_text(encoding="utf-8") != payload
        ):
            raise MasteringContractError(
                f"content-addressed mastering plan is corrupt: {path}"
            )
        return path
    _safe_output_parent(outdir, path.parent)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    descriptor: int | None = None
    created = False
    try:
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
        try:
            descriptor = os.open(temporary, flags, 0o600)
        except FileExistsError as error:
            raise MasteringContractError(
                f"exclusive mastering plan temporary path already exists: {temporary}"
            ) from error
        created = True
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            descriptor = None
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        if temporary.is_symlink() or not temporary.is_file():
            raise MasteringContractError(
                "mastering plan temporary path became unsafe before publication"
            )
        os.replace(temporary, path)
        created = False
    finally:
        if descriptor is not None:
            os.close(descriptor)
        if created:
            temporary.unlink(missing_ok=True)
    _fsync_directory(path.parent)
    return path


def load_mastering_plan(
    path: Path, *, expected_sha256: str, current_plan: dict[str, Any] | None = None
) -> dict[str, Any]:
    expected = _sha256(expected_sha256, "expected mastering plan SHA-256")
    if path.is_symlink() or not path.is_file():
        raise MasteringContractError(f"mastering plan must be a regular file: {path}")
    plan = _read_json(path)
    validate_mastering_plan(plan)
    if plan["plan_sha256"] != expected:
        raise MasteringContractError("mastering plan does not match expected SHA-256")
    if path.resolve() != (path.parent.parent / "plans" / f"{expected}.json").resolve():
        raise MasteringContractError(
            "mastering plan is not at its content-addressed path"
        )
    if current_plan is not None and plan != current_plan:
        raise MasteringContractError(
            "saved mastering plan differs from current exact inputs"
        )
    return plan


def parse_silence_log(log: str, duration_seconds: float) -> list[dict[str, float]]:
    active: float | None = None
    segments: list[dict[str, float]] = []
    for line in log.splitlines():
        start_match = SILENCE_START_RE.search(line)
        if start_match:
            if active is not None:
                raise MasteringContractError("silence scan contains nested starts")
            active = max(0.0, float(start_match.group(1)))
        end_match = SILENCE_END_RE.search(line)
        if end_match:
            if active is None:
                raise MasteringContractError("silence scan ends without a start")
            end = min(duration_seconds, float(end_match.group(1)))
            reported = float(end_match.group(2))
            if end < active or abs((end - active) - reported) > 0.02:
                raise MasteringContractError("silence scan duration is inconsistent")
            segments.append(
                {
                    "start_seconds": active,
                    "end_seconds": end,
                    "duration_seconds": end - active,
                }
            )
            active = None
    if active is not None:
        segments.append(
            {
                "start_seconds": active,
                "end_seconds": duration_seconds,
                "duration_seconds": duration_seconds - active,
            }
        )
    return segments


def silence_crosses_declared_boundary(
    segment: dict[str, float], boundaries: list[dict[str, Any]]
) -> bool:
    """Return whether a detected quiet interval intersects a planned pause."""

    for boundary in boundaries:
        if boundary["pause_ms"] <= 0:
            continue
        boundary_start = boundary["start_frame"] / SAMPLE_RATE
        boundary_end = boundary["end_frame"] / SAMPLE_RATE
        if (
            segment["start_seconds"] < boundary_end
            and segment["end_seconds"] > boundary_start
        ):
            return True
    return False


def unexpected_silence_segments(
    segments: list[dict[str, float]], boundaries: list[dict[str, Any]]
) -> list[dict[str, float]]:
    """Apply separate dropout and perceived-boundary acoustic-gap ceilings."""

    return [
        segment
        for segment in segments
        if round(segment["duration_seconds"] * 1000) > MAX_UNEXPECTED_SILENCE_MS
        or (
            round(segment["duration_seconds"] * 1000)
            > MAX_BOUNDARY_CROSSING_SILENCE_MS
            and silence_crosses_declared_boundary(segment, boundaries)
        )
    ]


def scan_pcm24(path: Path, analysis_runtime: dict[str, Any]) -> dict[str, Any]:
    numpy = validate_analysis_runtime(analysis_runtime)
    rf64 = inspect_rf64_pcm24(path)
    frames = rf64["sample_count"]
    with path.open("rb") as handle:
        handle.seek(rf64["data_offset_bytes"])
        peak = 0
        clipped = 0
        scanned = 0
        while scanned < frames:
            requested = min(PCM_SCAN_FRAMES, frames - scanned)
            raw = _read_exact(
                handle,
                requested * PRODUCTION_SAMPLE_WIDTH_BYTES,
                "PCM payload",
            )
            if len(raw) != requested * PRODUCTION_SAMPLE_WIDTH_BYTES:
                raise MasteringContractError(
                    "working master PCM payload ended before its declared frame count"
                )
            octets = numpy.frombuffer(raw, dtype=numpy.uint8).reshape((-1, 3))
            values = (
                octets[:, 0].astype(numpy.int32)
                | (octets[:, 1].astype(numpy.int32) << 8)
                | (octets[:, 2].astype(numpy.int32) << 16)
            )
            values = (values ^ 0x800000) - 0x800000
            block_peak = int(numpy.max(numpy.abs(values.astype(numpy.int64))))
            block_clipped = int(
                numpy.count_nonzero((values == -(1 << 23)) | (values == (1 << 23) - 1))
            )
            peak = max(peak, block_peak)
            clipped += block_clipped
            scanned += requested
    peak_dbfs = None if peak == 0 else 20 * math.log10(peak / ((1 << 23) - 1))
    return {
        "frames": frames,
        "duration_seconds": frames / SAMPLE_RATE,
        "sample_peak_dbfs": peak_dbfs,
        "clipped_samples": clipped,
    }


def _interval_peak_dbfs(path: Path, start_frame: int, end_frame: int) -> float | None:
    if start_frame < 0 or end_frame < start_frame:
        raise MasteringContractError("boundary frame interval is invalid")
    rf64 = inspect_rf64_pcm24(path)
    with path.open("rb") as handle:
        if end_frame > rf64["sample_count"]:
            raise MasteringContractError("boundary interval exceeds working master")
        handle.seek(
            rf64["data_offset_bytes"] + start_frame * PRODUCTION_SAMPLE_WIDTH_BYTES
        )
        raw = _read_exact(
            handle,
            (end_frame - start_frame) * PRODUCTION_SAMPLE_WIDTH_BYTES,
            "boundary PCM interval",
        )
    peak = 0
    for offset in range(0, len(raw), 3):
        value = int.from_bytes(raw[offset : offset + 3], "little", signed=False)
        if value & 0x800000:
            value -= 1 << 24
        peak = max(peak, abs(value))
    return None if peak == 0 else 20 * math.log10(peak / ((1 << 23) - 1))


def _fsync_file(path: Path) -> None:
    with path.open("rb") as handle:
        os.fsync(handle.fileno())


def _fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def _safe_output_parent(outdir: Path, parent: Path) -> None:
    if not outdir.is_absolute() or not parent.is_absolute():
        raise MasteringContractError("mastering output paths must be absolute")
    try:
        relative = parent.relative_to(outdir)
    except ValueError as error:
        raise MasteringContractError("mastering output escapes --outdir") from error
    candidates = [outdir]
    for part in relative.parts:
        candidates.append(candidates[-1] / part)
    for candidate in candidates:
        if candidate.is_symlink():
            raise MasteringContractError(
                f"mastering output traverses a symlink: {candidate}"
            )
        if candidate.exists() and not candidate.is_dir():
            raise MasteringContractError(
                f"mastering output directory is not a directory: {candidate}"
            )


def _atomic_publish(temp: Path, final: Path) -> None:
    for path in temp.iterdir():
        if path.is_file():
            _fsync_file(path)
    _fsync_directory(temp)
    try:
        os.replace(temp, final)
    except OSError:
        if final.exists():
            shutil.rmtree(temp, ignore_errors=True)
        else:
            raise
    _fsync_directory(final.parent)


def _qa_content_sha256(qa: dict[str, Any]) -> str:
    return content_sha256(
        {key: value for key, value in qa.items() if key != "evidence_sha256"}
    )


def _pretty_json(value: dict[str, Any]) -> str:
    return json.dumps(value, indent=2, sort_keys=True) + "\n"


def _verify_planned_tools(plan: dict[str, Any]) -> None:
    """Require the reviewed executable bytes and version lines before QA replay."""

    for name in ("ffmpeg", "ffprobe"):
        evidence = plan["tools"][name]
        path = Path(evidence["path"])
        if (
            path.is_symlink()
            or not path.is_file()
            or path.resolve(strict=True) != path
            or sha256_file(path) != evidence["sha256"]
        ):
            raise MasteringContractError(
                f"planned {name} executable is missing, symlinked, or changed"
            )
        result = _run([str(path), "-version"])
        first_line = result.stdout.splitlines()[0].strip() if result.stdout else ""
        if first_line != evidence["version"]:
            raise MasteringContractError(f"planned {name} version line changed")


def _mechanical_analysis(
    plan: dict[str, Any], working: Path, publication: Path
) -> tuple[dict[str, Any], dict[str, Any], dict[str, bool]]:
    """Rebuild every mechanical measurement and gate from current media bytes."""

    _verify_planned_tools(plan)
    working_probe = probe_media(
        working,
        plan["tools"],
        plan["commands"]["working_probe"],
    )
    pcm = scan_pcm24(working, plan["analysis_runtime"])
    _validate_rf64_evidence(
        working_probe["rf64"],
        frames=pcm["frames"],
        size_bytes=working_probe["size_bytes"],
    )
    if (
        working_probe["format_name"] != "wav"
        or working_probe["container_profile"] != RF64_CONTAINER_PROFILE
        or working_probe["codec_name"] != "pcm_s24le"
        or working_probe["sample_format"] != "s32"
        or working_probe["sample_rate"] != SAMPLE_RATE
        or working_probe["channels"] != 1
        or working_probe["bits_per_sample"] != 24
        or working_probe["bit_rate"] != WORKING_BITRATE_BPS
        or working_probe["size_bytes"] != working.stat().st_size
        or abs(working_probe["duration_seconds"] - pcm["duration_seconds"])
        > 1 / SAMPLE_RATE
        or pcm["frames"] != plan["renderer"]["complete"]["frames"]
    ):
        raise MasteringContractError(
            "normalized working master format or duration drifted"
        )

    loudness_result = _run(
        substitute_command(plan["commands"]["verify_loudness"], working_master=working)
    )
    post_loudness = parse_loudnorm_json(loudness_result.stderr)
    publication_probe = probe_media(
        publication,
        plan["tools"],
        plan["commands"]["publication_probe"],
    )
    if (
        publication_probe["format_name"] != "mp3"
        or publication_probe["container_profile"] != MP3_CONTAINER_PROFILE
        or publication_probe["rf64"] is not None
        or publication_probe["codec_name"] != PUBLICATION_CODEC_NAME
        or publication_probe["sample_rate"] != SAMPLE_RATE
        or publication_probe["channels"] != 1
        or publication_probe["bit_rate"] != PUBLICATION_BITRATE_BPS
        or publication_probe["size_bytes"] != publication.stat().st_size
    ):
        raise MasteringContractError("publication derivative format is invalid")

    silence_result = _run(
        substitute_command(plan["commands"]["silence_scan"], working_master=working)
    )
    silences = parse_silence_log(silence_result.stderr, pcm["duration_seconds"])
    long_silences = unexpected_silence_segments(silences, plan["boundaries"])
    boundary_checks = []
    for boundary in plan["boundaries"]:
        if boundary["pause_ms"] > 0:
            guard_frames = round(SAMPLE_RATE * BOUNDARY_EDGE_GUARD_MS / 1000)
            checked_start = boundary["start_frame"] + guard_frames
            checked_end = boundary["end_frame"] - guard_frames
            if checked_end <= checked_start:
                raise MasteringContractError(
                    "declared boundary is too short for the pinned edge guard"
                )
            peak = _interval_peak_dbfs(working, checked_start, checked_end)
            passed = peak is None or peak <= SILENCE_NOISE_DB
        else:
            checked_start = boundary["start_frame"]
            checked_end = boundary["end_frame"]
            peak = None
            passed = True
        boundary_checks.append(
            {
                **copy.deepcopy(boundary),
                "checked_start_frame": checked_start,
                "checked_end_frame": checked_end,
                "edge_guard_ms": BOUNDARY_EDGE_GUARD_MS,
                "peak_dbfs": peak,
                "passed": passed,
            }
        )

    loudness_passed = (
        abs(post_loudness["input_i"] - TARGET_INTEGRATED_LUFS) <= TARGET_TOLERANCE_LU
        and post_loudness["input_tp"] <= TRUE_PEAK_LIMIT_DBTP
    )
    clipping_passed = pcm["clipped_samples"] == 0
    duration_delta = abs(
        publication_probe["duration_seconds"] - pcm["duration_seconds"]
    )
    duration_passed = duration_delta <= PUBLICATION_DURATION_TOLERANCE_SECONDS
    silence_passed = not long_silences and all(
        check["passed"] for check in boundary_checks
    )
    gates = {
        "loudness_passed": loudness_passed,
        "clipping_passed": clipping_passed,
        "duration_passed": duration_passed,
        "silence_passed": silence_passed,
        "mechanical_passed": (
            loudness_passed and clipping_passed and duration_passed and silence_passed
        ),
    }
    outputs = {
        "working_master": {
            "filename": WORKING_FILENAME,
            "sha256": sha256_file(working),
            "probe": working_probe,
            "pcm": pcm,
        },
        "publication": {
            "filename": PUBLICATION_FILENAME,
            "sha256": sha256_file(publication),
            "probe": publication_probe,
            "duration_delta_seconds": duration_delta,
        },
    }
    measurements = {
        "first_pass": copy.deepcopy(plan["first_pass"]),
        "post_master_loudness": post_loudness,
        "pcm": pcm,
        "publication_duration_delta_seconds": duration_delta,
        "silence_segments": silences,
        "unexpected_long_silences": long_silences,
        "boundary_checks": boundary_checks,
        "boundary_inventory_sha256": plan["boundaries_sha256"],
    }
    return outputs, measurements, gates


def _mechanical_qa(
    plan: dict[str, Any],
    outputs: dict[str, Any],
    measurements: dict[str, Any],
    gates: dict[str, bool],
) -> dict[str, Any]:
    mechanical_passed = gates["mechanical_passed"]
    qa = {
        "schema_version": QA_SCHEMA_VERSION,
        "status": QA_STATUS_PASS if mechanical_passed else QA_STATUS_FAIL,
        "evidence_sha256": "",
        "implementation": copy.deepcopy(plan["implementation"]),
        "analysis_runtime": copy.deepcopy(plan["analysis_runtime"]),
        "dialogue": plan["dialogue"],
        "mastering_plan_sha256": plan["plan_sha256"],
        "renderer": copy.deepcopy(plan["renderer"]),
        "chapter_timeline": copy.deepcopy(plan["chapter_timeline"]),
        "chapter_timeline_sha256": plan["chapter_timeline_sha256"],
        "chapters": copy.deepcopy(plan["renderer"]["chapters"]),
        "measurements": measurements,
        "gates": gates,
        "acceptance": {
            "accepted": False,
            "reason": MECHANICAL_ACCEPTANCE_REASON,
        },
        "asr": {"status": "not-performed"},
        "listening": {"status": "not-performed"},
        "outputs": copy.deepcopy(outputs),
    }
    qa["evidence_sha256"] = _qa_content_sha256(qa)
    return qa


def _mastering_manifest(
    plan: dict[str, Any],
    outputs: dict[str, Any],
    *,
    mechanical_qa_sha256: str,
    mechanical_passed: bool,
) -> dict[str, Any]:
    return {
        "schema_version": RESULT_SCHEMA_VERSION,
        "status": RESULT_STATUS,
        "implementation": copy.deepcopy(plan["implementation"]),
        "analysis_runtime": copy.deepcopy(plan["analysis_runtime"]),
        "dialogue": plan["dialogue"],
        "mastering_plan_sha256": plan["plan_sha256"],
        "renderer": copy.deepcopy(plan["renderer"]),
        "chapter_timeline": copy.deepcopy(plan["chapter_timeline"]),
        "chapter_timeline_sha256": plan["chapter_timeline_sha256"],
        "tools": copy.deepcopy(plan["tools"]),
        "commands": copy.deepcopy(plan["commands"]),
        "outputs": outputs,
        "mechanical_qa_sha256": mechanical_qa_sha256,
        "mechanical_passed": mechanical_passed,
        "accepted": False,
    }


def validate_result_directory(
    final: Path, plan: dict[str, Any]
) -> dict[str, Any] | None:
    validate_mastering_plan(plan)
    if not final.exists():
        return None
    if final.is_symlink() or not final.is_dir():
        raise MasteringContractError(f"invalid mastering artifact directory: {final}")
    inventory = {
        path.name
        for path in final.iterdir()
        if path.is_file() and not path.is_symlink()
    }
    if inventory != {
        WORKING_FILENAME,
        PUBLICATION_FILENAME,
        "mastering.json",
        "mechanical-qa.json",
    }:
        raise MasteringContractError(f"partial or unsafe mastering artifact: {final}")
    if any(path.is_symlink() or not path.is_file() for path in final.iterdir()):
        raise MasteringContractError(f"partial or unsafe mastering artifact: {final}")
    manifest_path = final / "mastering.json"
    qa_path = final / "mechanical-qa.json"
    manifest = _read_json(manifest_path)
    qa = _read_json(qa_path)
    expected_acceptance = {
        "accepted": False,
        "reason": MECHANICAL_ACCEPTANCE_REASON,
    }
    if (
        manifest.get("accepted") is not False
        or qa.get("acceptance") != expected_acceptance
        or qa.get("asr") != {"status": "not-performed"}
        or qa.get("listening") != {"status": "not-performed"}
    ):
        raise MasteringContractError(
            "mechanical QA evidence is stale or falsely accepted"
        )

    outputs, measurements, gates = _mechanical_analysis(
        plan,
        final / WORKING_FILENAME,
        final / PUBLICATION_FILENAME,
    )
    expected_qa = _mechanical_qa(plan, outputs, measurements, gates)
    if qa != expected_qa or qa_path.read_text(encoding="utf-8") != _pretty_json(
        expected_qa
    ):
        raise MasteringContractError(
            "mechanical QA evidence differs from current media bytes"
        )
    expected_manifest = _mastering_manifest(
        plan,
        outputs,
        mechanical_qa_sha256=sha256_file(qa_path),
        mechanical_passed=gates["mechanical_passed"],
    )
    if manifest != expected_manifest or manifest_path.read_text(
        encoding="utf-8"
    ) != _pretty_json(expected_manifest):
        raise MasteringContractError(
            "mastering result sidecar differs from current media bytes"
        )
    return manifest


def execute_mastering(
    plan: dict[str, Any], assembly: dict[str, Any], outdir: Path
) -> tuple[dict[str, Any], bool]:
    validate_mastering_plan(plan)
    source = Path(assembly["complete"]["audio_path"])
    if sha256_file(source) != plan["renderer"]["complete"]["audio_sha256"]:
        raise MasteringContractError("full-dialogue source changed after planning")
    final = outdir / "artifacts" / plan["plan_sha256"]
    _safe_output_parent(outdir, final.parent)
    existing = validate_result_directory(final, plan)
    if existing is not None:
        return existing, False
    final.parent.mkdir(parents=True, exist_ok=True)
    temp = final.parent / f".{plan['plan_sha256']}.{uuid.uuid4().hex}.tmp"
    temp.mkdir()
    try:
        working = temp / WORKING_FILENAME
        publication = temp / PUBLICATION_FILENAME
        _run(
            substitute_command(
                plan["commands"]["working_master"],
                source=source,
                working_master=working,
            )
        )
        canonicalize_ffmpeg_rf64_header(
            working,
            expected_frames=plan["renderer"]["complete"]["frames"],
        )
        _run(
            substitute_command(
                plan["commands"]["publication"],
                working_master=working,
                publication=publication,
            )
        )
        outputs, measurements, gates = _mechanical_analysis(plan, working, publication)
        qa = _mechanical_qa(plan, outputs, measurements, gates)
        qa_path = temp / "mechanical-qa.json"
        qa_path.write_text(_pretty_json(qa), encoding="utf-8")
        manifest = _mastering_manifest(
            plan,
            outputs,
            mechanical_qa_sha256=sha256_file(qa_path),
            mechanical_passed=gates["mechanical_passed"],
        )
        (temp / "mastering.json").write_text(
            _pretty_json(manifest),
            encoding="utf-8",
        )
        _atomic_publish(temp, final)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    validated = validate_result_directory(final, plan)
    if validated is None:
        raise AssertionError("published mastering artifact disappeared")
    return validated, True


def current_mastering_inputs(
    *,
    render_plan_path: Path,
    expected_render_plan_sha256: str,
    renderer_outdir: Path,
    repo_root: Path,
) -> tuple[dict[str, Any], dict[str, Any]]:
    render_plan = load_render_plan_artifact(
        render_plan_path,
        expected_sha256=expected_render_plan_sha256,
    )
    acceptance = render_plan["acceptance"]
    _, _, current_acceptance = load_accepted_render_inputs(
        Path(acceptance["screenplay_path"]),
        Path(acceptance["cast_path"]),
        repo_root=repo_root,
    )
    if current_acceptance != acceptance:
        raise MasteringContractError(
            "render plan is stale against current canonical screenplay dependencies"
        )
    assembly = resolve_full_dialogue_assembly(render_plan, renderer_outdir)
    source = Path(assembly["complete"]["audio_path"])
    tools = resolve_tools()
    first_pass = measure_loudness(source, tools)
    commands = command_templates(tools, first_pass)
    probe = probe_media(source, tools, commands["source_probe"])
    plan = build_mastering_plan(
        assembly=assembly,
        render_plan_artifact_sha256=sha256_file(render_plan_path),
        tools=tools,
        source_probe=probe,
        first_pass=first_pass,
    )
    return plan, assembly


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render-plan", type=Path, required=True)
    parser.add_argument("--expected-render-plan-sha256", required=True)
    parser.add_argument("--renderer-outdir", type=Path, required=True)
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--write-plan", action="store_true")
    parser.add_argument("--execute-plan", type=Path)
    parser.add_argument("--expected-mastering-plan-sha256")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    try:
        raw_outdir = args.outdir.expanduser()
        if raw_outdir.is_symlink() or (raw_outdir.exists() and not raw_outdir.is_dir()):
            raise MasteringContractError("--outdir must be a regular directory path")
        outdir = raw_outdir.resolve()
        forbidden = {
            (args.repo_root.expanduser().resolve() / "audio/qa").resolve(),
            (args.repo_root.expanduser().resolve() / "wiki/recordings").resolve(),
        }
        if any(outdir == path or path in outdir.parents for path in forbidden):
            raise MasteringContractError(
                "mechanical-only mastering must not write accepted QA or recording paths"
            )
        current_plan, assembly = current_mastering_inputs(
            render_plan_path=args.render_plan.expanduser().resolve(),
            expected_render_plan_sha256=args.expected_render_plan_sha256,
            renderer_outdir=args.renderer_outdir.expanduser().resolve(),
            repo_root=args.repo_root.expanduser().resolve(),
        )
        if not args.execute:
            if args.execute_plan is not None or args.expected_mastering_plan_sha256:
                raise MasteringContractError(
                    "--execute-plan and --expected-mastering-plan-sha256 require --execute"
                )
            written = (
                write_mastering_plan(current_plan, outdir) if args.write_plan else None
            )
            summary = {
                "dialogue": current_plan["dialogue"],
                "mastering_plan_sha256": current_plan["plan_sha256"],
                "render_plan_sha256": current_plan["renderer"]["render_plan_sha256"],
                "complete_assembly_sha256": current_plan["renderer"]["complete"][
                    "input_sha256"
                ],
                "first_pass": current_plan["first_pass"],
                "writes_audio": False,
                "accepted": False,
            }
            if written is not None:
                summary["plan_path"] = str(written)
            print(json.dumps(summary, indent=2, sort_keys=True))
            return 0
        if args.write_plan:
            raise MasteringContractError(
                "--write-plan and --execute are separate operations"
            )
        if args.execute_plan is None or not args.expected_mastering_plan_sha256:
            raise MasteringContractError(
                "--execute requires --execute-plan and --expected-mastering-plan-sha256"
            )
        load_mastering_plan(
            args.execute_plan.expanduser().resolve(),
            expected_sha256=args.expected_mastering_plan_sha256,
            current_plan=current_plan,
        )
        manifest, created = execute_mastering(current_plan, assembly, outdir)
        print(
            json.dumps(
                {
                    "dialogue": current_plan["dialogue"],
                    "mastering_plan_sha256": current_plan["plan_sha256"],
                    "status": "rendered" if created else "cached",
                    "mechanical_passed": manifest["mechanical_passed"],
                    "accepted": False,
                    "artifact_path": str(
                        outdir / "artifacts" / current_plan["plan_sha256"]
                    ),
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 0 if manifest["mechanical_passed"] else 3
    except (
        MasteringContractError,
        RenderContractError,
        OSError,
    ) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
