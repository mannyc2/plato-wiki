#!/usr/bin/env python3
"""Create mechanical, unaccepted ASR evidence for one exact production master.

The default invocation is read-only.  ``--execute`` is required to load the
pinned recognizer or write anything, and execution also requires the exact
dry-run plan SHA-256.  Results are content-addressed scratch evidence; this
module never writes an accepted audio QA report or recording manifest.
"""

from __future__ import annotations

import argparse
import copy
import gc
import hashlib
import importlib.metadata
import json
import os
import re
import shutil
import sys
import unicodedata
import uuid
from pathlib import Path
from typing import Any, Callable

import verify_reference_asr_adjudication as reference_asr
from master_audio import (
    MasteringContractError,
    current_mastering_inputs,
    load_mastering_plan,
    validate_result_directory,
)
from render_dots import (
    SAMPLE_RATE,
    RenderContractError,
    load_accepted_render_inputs,
    load_render_plan_artifact,
    sha256_file,
    validate_screenplay,
)


SCHEMA_VERSION = 1
IMPLEMENTATION_NAME = "plato-full-master-asr"
IMPLEMENTATION_VERSION = 1
PLAN_STATUS = "full-master-asr-plan"
EVIDENCE_STATUS = "full-master-asr-measured-unaccepted"
EVIDENCE_FILENAME = "asr-evidence.json"

MODEL_REPOSITORY = reference_asr.MODEL_REPOSITORY
MODEL_REVISION = reference_asr.MODEL_REVISION
FASTER_WHISPER_VERSION = reference_asr.FASTER_WHISPER_VERSION
CTRANSLATE2_VERSION = reference_asr.CTRANSLATE2_VERSION
COMPUTE_TYPE = reference_asr.COMPUTE_TYPE
BEAM_SIZE = reference_asr.BEAM_SIZE
LANGUAGE = reference_asr.LANGUAGE

ASR_DISTRIBUTION_PINS = {
    "faster-whisper": FASTER_WHISPER_VERSION,
    "ctranslate2": CTRANSLATE2_VERSION,
    "av": "18.0.0",
    "onnxruntime": "1.27.0",
    "protobuf": "7.35.1",
    "flatbuffers": "25.12.19",
    # These are already part of the exact mastering/Dots environment.  They
    # are repeated here because faster-whisper imports them at runtime.
    "numpy": "2.2.6",
    "huggingface-hub": "0.36.2",
    "tokenizers": "0.22.2",
    "tqdm": "4.68.4",
    "packaging": "26.2",
    "PyYAML": "6.0.3",
}

# This is the Python equivalent of the canonical TypeScript audio-word regex:
# /[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu.
WORD_RE = re.compile(r"[^\W_]+(?:[’'][^\W_]+)*", re.UNICODE)
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")

TRANSCRIPTION_POLICY = {
    "task": "transcribe",
    "language": LANGUAGE,
    "beam_size": BEAM_SIZE,
    "best_of": 5,
    "patience": 1.0,
    "length_penalty": 1.0,
    "repetition_penalty": 1.0,
    "no_repeat_ngram_size": 0,
    "temperature": 0.0,
    "compression_ratio_threshold": 2.4,
    "log_prob_threshold": -1.0,
    "no_speech_threshold": 0.6,
    "compute_type": COMPUTE_TYPE,
    "condition_on_previous_text": False,
    "suppress_blank": True,
    "suppress_tokens": [-1],
    "without_timestamps": False,
    "max_initial_timestamp": 1.0,
    "multilingual": False,
    "vad_filter": False,
    "word_timestamps": False,
    "chapter_clips": "authoritative-48000hz-mastering-timeline-v1",
    "normalization": "NFC-lower-unicode-letters-numbers-apostrophes-v1",
    "ordinary_word_policy": (
        "conservative-unreviewed-all-levenshtein-errors-are-ordinary-v1"
    ),
    "corpus_aggregation": "sum-of-ordered-chapter-edit-distances-v1",
}


class FullMasterAsrError(ValueError):
    """Raised when production ASR evidence cannot be produced safely."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise FullMasterAsrError(f"{label} must be a lowercase SHA-256")
    return value


def _read_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise FullMasterAsrError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise FullMasterAsrError(f"{label} must be a JSON object: {path}")
    return value


def normalized_words(text: str) -> list[str]:
    normalized = unicodedata.normalize("NFC", text).lower().replace("’", "'")
    return [match.group(0).replace("’", "'") for match in WORD_RE.finditer(normalized)]


def word_edit_distance(left: list[str], right: list[str]) -> int:
    """Return exact Levenshtein distance using a word-level Myers bit vector."""

    if not left:
        return len(right)
    if not right:
        return len(left)
    # The bit-vector width is the shorter input.  Python integers make this
    # exact for arbitrarily long chapters without the quadratic DP matrix.
    if len(left) > len(right):
        left, right = right, left
    width = len(left)
    mask = (1 << width) - 1
    high_bit = 1 << (width - 1)
    positions: dict[str, int] = {}
    for index, token in enumerate(left):
        positions[token] = positions.get(token, 0) | (1 << index)
    positive = mask
    negative = 0
    distance = width
    for token in right:
        equal = positions.get(token, 0)
        vertical = equal | negative
        horizontal = (((equal & positive) + positive) ^ positive) | equal
        positive_shift = negative | ~(horizontal | positive)
        negative_shift = positive & horizontal
        if positive_shift & high_bit:
            distance += 1
        elif negative_shift & high_bit:
            distance -= 1
        positive_shift = ((positive_shift << 1) | 1) & mask
        negative_shift = (negative_shift << 1) & mask
        positive = (negative_shift | ~(vertical | positive_shift)) & mask
        negative = positive_shift & vertical
    return distance


def implementation_identity() -> dict[str, Any]:
    helper = Path(reference_asr.__file__).resolve(strict=True)
    source = Path(__file__).resolve(strict=True)
    return {
        "name": IMPLEMENTATION_NAME,
        "version": IMPLEMENTATION_VERSION,
        "code_path": str(source),
        "code_sha256": sha256_file(source),
        "shared_asr_helper_path": str(helper),
        "shared_asr_helper_sha256": sha256_file(helper),
    }


def _snapshot_files(snapshot: Path) -> list[dict[str, Any]]:
    if snapshot.is_symlink() or not snapshot.is_dir():
        raise FullMasterAsrError(
            f"ASR snapshot must be a regular directory: {snapshot}"
        )
    snapshot = snapshot.resolve(strict=True)
    files: list[dict[str, Any]] = []
    for candidate in sorted(snapshot.rglob("*"), key=lambda path: path.as_posix()):
        if candidate.is_dir() and not candidate.is_symlink():
            continue
        if candidate.is_symlink() and candidate.resolve(strict=True).is_dir():
            raise FullMasterAsrError(
                f"ASR snapshot contains a directory symlink: {candidate}"
            )
        resolved = candidate.resolve(strict=True)
        if not resolved.is_file():
            raise FullMasterAsrError(
                f"ASR snapshot contains a non-regular file: {candidate}"
            )
        storage = "snapshot-file"
        if candidate.is_symlink():
            try:
                repository_root = snapshot.parents[1]
                resolved.relative_to((repository_root / "blobs").resolve(strict=True))
            except (IndexError, FileNotFoundError, ValueError) as error:
                raise FullMasterAsrError(
                    f"ASR snapshot link escapes its model blobs: {candidate}"
                ) from error
            storage = "huggingface-blob-link"
        files.append(
            {
                "path": candidate.relative_to(snapshot).as_posix(),
                "sha256": sha256_file(resolved),
                "size_bytes": resolved.stat().st_size,
                "storage": storage,
            }
        )
    if not files or "model.bin" not in {item["path"] for item in files}:
        raise FullMasterAsrError("ASR snapshot inventory is incomplete")
    return files


def model_snapshot_provenance(snapshot: Path) -> dict[str, Any]:
    snapshot = snapshot.resolve(strict=True)
    files = _snapshot_files(snapshot)
    return {
        "repository": MODEL_REPOSITORY,
        "revision": MODEL_REVISION,
        "snapshot_path": str(snapshot),
        "inventory_sha256": sha256_bytes(canonical_json(files)),
        "file_count": len(files),
        "total_bytes": sum(item["size_bytes"] for item in files),
        "files": files,
    }


def runtime_provenance(cache_dir: Path) -> dict[str, Any]:
    try:
        distributions = {
            name: importlib.metadata.version(name)
            for name in sorted(ASR_DISTRIBUTION_PINS)
        }
    except importlib.metadata.PackageNotFoundError as error:
        raise FullMasterAsrError(
            f"full-master ASR runtime dependency is missing: {error.name}"
        ) from error
    if distributions != dict(sorted(ASR_DISTRIBUTION_PINS.items())):
        raise FullMasterAsrError(
            "full-master ASR runtime distributions differ from their exact pins"
        )
    snapshot = reference_asr.resolve_snapshot(cache_dir.expanduser().resolve())
    return {
        "model": model_snapshot_provenance(snapshot),
        "runtime": {
            "distributions": distributions,
            "python_version": sys.version,
            "python_executable": str(Path(sys.executable).resolve(strict=True)),
        },
    }


def verify_runtime_provenance(provenance: dict[str, Any]) -> None:
    if not isinstance(provenance, dict) or set(provenance) != {"model", "runtime"}:
        raise FullMasterAsrError("ASR runtime provenance fields are invalid")
    model = provenance["model"]
    runtime = provenance["runtime"]
    if (
        not isinstance(model, dict)
        or set(model)
        != {
            "repository",
            "revision",
            "snapshot_path",
            "inventory_sha256",
            "file_count",
            "total_bytes",
            "files",
        }
        or model.get("repository") != MODEL_REPOSITORY
        or model.get("revision") != MODEL_REVISION
        or not isinstance(runtime, dict)
        or runtime.get("distributions") != dict(sorted(ASR_DISTRIBUTION_PINS.items()))
        or runtime.get("python_version") != sys.version
        or runtime.get("python_executable")
        != str(Path(sys.executable).resolve(strict=True))
    ):
        raise FullMasterAsrError("ASR model or runtime provenance is stale")
    _sha256(model.get("inventory_sha256"), "ASR model inventory SHA-256")
    if (
        not isinstance(model.get("files"), list)
        or not model["files"]
        or model.get("file_count") != len(model["files"])
        or model.get("total_bytes")
        != sum(item.get("size_bytes", -1) for item in model["files"])
        or sha256_bytes(canonical_json(model["files"])) != model["inventory_sha256"]
    ):
        raise FullMasterAsrError("ASR model inventory is inconsistent")
    current = model_snapshot_provenance(Path(model["snapshot_path"]))
    if current != model:
        raise FullMasterAsrError("ASR model snapshot bytes or path changed")


def reconstruct_expected_chapters(
    screenplay: dict[str, Any], chapter_timeline: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    validate_screenplay(screenplay)
    if not isinstance(chapter_timeline, list) or not chapter_timeline:
        raise FullMasterAsrError("mastering chapter timeline must be non-empty")
    screenplay_ids = [chapter["id"] for chapter in screenplay["chapters"]]
    timeline_ids = [chapter.get("chapter_id") for chapter in chapter_timeline]
    if timeline_ids != screenplay_ids:
        raise FullMasterAsrError(
            "mastering chapter timeline differs from the canonical screenplay"
        )
    result: list[dict[str, Any]] = []
    for chapter, timing in zip(screenplay["chapters"], chapter_timeline, strict=True):
        entries = [
            entry
            for entry in screenplay["entries"]
            if entry["chapter_id"] == chapter["id"]
        ]
        if not entries:
            raise FullMasterAsrError(
                f"screenplay chapter has no spoken entries: {chapter['id']}"
            )
        start = timing.get("start_frame")
        end = timing.get("end_frame")
        if (
            isinstance(start, bool)
            or not isinstance(start, int)
            or isinstance(end, bool)
            or not isinstance(end, int)
            or start < 0
            or end <= start
            or timing.get("start_seconds") != start / SAMPLE_RATE
            or timing.get("end_seconds") != end / SAMPLE_RATE
        ):
            raise FullMasterAsrError(
                f"mastering chapter timeline is malformed: {chapter['id']}"
            )
        expected_text = " ".join(entry["text"] for entry in entries)
        tokens = normalized_words(expected_text)
        if not tokens:
            raise FullMasterAsrError(
                f"screenplay chapter has no expected ASR words: {chapter['id']}"
            )
        result.append(
            {
                "chapter_id": chapter["id"],
                "entry_ids": [entry["id"] for entry in entries],
                "start_frame": start,
                "end_frame": end,
                "start_seconds": start / SAMPLE_RATE,
                "end_seconds": end / SAMPLE_RATE,
                "expected_text": expected_text,
                "expected_text_sha256": sha256_bytes(expected_text.encode("utf-8")),
                "expected_tokens_sha256": sha256_bytes(canonical_json(tokens)),
                "expected_words": len(tokens),
            }
        )
    return result


def _bound_file(
    path: Path, label: str, expected_sha256: str | None = None
) -> dict[str, Any]:
    if not path.is_absolute() or path.is_symlink() or not path.is_file():
        raise FullMasterAsrError(f"{label} must be an absolute regular file: {path}")
    resolved = path.resolve(strict=True)
    digest = sha256_file(resolved)
    if expected_sha256 is not None and digest != expected_sha256:
        raise FullMasterAsrError(f"{label} SHA-256 is stale: {resolved}")
    return {
        "label": label,
        "path": str(resolved),
        "sha256": digest,
        "size_bytes": resolved.stat().st_size,
    }


def verify_bound_files(files: list[dict[str, Any]]) -> None:
    if not isinstance(files, list) or not files:
        raise FullMasterAsrError("production binding has no exact file inventory")
    labels: set[str] = set()
    for item in files:
        if not isinstance(item, dict) or set(item) != {
            "label",
            "path",
            "sha256",
            "size_bytes",
        }:
            raise FullMasterAsrError("production file binding fields are invalid")
        label = item["label"]
        if not isinstance(label, str) or not label or label in labels:
            raise FullMasterAsrError("production file labels must be unique")
        labels.add(label)
        path = Path(item["path"])
        current = _bound_file(path, label, _sha256(item["sha256"], label))
        if current != item:
            raise FullMasterAsrError(f"production file binding changed: {label}")


def _plan_chapters(expected: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {key: copy.deepcopy(chapter[key]) for key in chapter if key != "expected_text"}
        for chapter in expected
    ]


def build_asr_plan(
    *,
    dialogue: str,
    production: dict[str, Any],
    expected: list[dict[str, Any]],
    asr_runtime: dict[str, Any],
) -> dict[str, Any]:
    core = {
        "schema_version": SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "implementation": implementation_identity(),
        "dialogue": dialogue,
        "production": copy.deepcopy(production),
        "asr_runtime": copy.deepcopy(asr_runtime),
        "transcription_policy": copy.deepcopy(TRANSCRIPTION_POLICY),
        "chapters": _plan_chapters(expected),
    }
    plan = {**core, "plan_sha256": sha256_bytes(canonical_json(core))}
    validate_asr_plan(plan)
    return plan


def validate_asr_plan(plan: dict[str, Any]) -> None:
    required = {
        "schema_version",
        "status",
        "plan_sha256",
        "implementation",
        "dialogue",
        "production",
        "asr_runtime",
        "transcription_policy",
        "chapters",
    }
    if not isinstance(plan, dict) or set(plan) != required:
        raise FullMasterAsrError("full-master ASR plan fields are invalid")
    if (
        plan["schema_version"] != SCHEMA_VERSION
        or plan["status"] != PLAN_STATUS
        or plan["implementation"] != implementation_identity()
        or plan["transcription_policy"] != TRANSCRIPTION_POLICY
        or not isinstance(plan["dialogue"], str)
        or not plan["dialogue"]
    ):
        raise FullMasterAsrError("full-master ASR plan is stale")
    digest = _sha256(plan["plan_sha256"], "full-master ASR plan SHA-256")
    core = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if sha256_bytes(canonical_json(core)) != digest:
        raise FullMasterAsrError("full-master ASR plan content address is inconsistent")
    production = plan["production"]
    if not isinstance(production, dict) or set(production) != {
        "repo_root",
        "screenplay",
        "render_plan",
        "renderer",
        "mastering_plan",
        "mastering_result",
        "files",
    }:
        raise FullMasterAsrError("production ASR binding fields are invalid")
    if production["mastering_result"].get("working_master_path") is None:
        raise FullMasterAsrError("production ASR binding has no working master")
    verify_runtime_provenance(plan["asr_runtime"])
    chapters = plan["chapters"]
    if not isinstance(chapters, list) or not chapters:
        raise FullMasterAsrError("full-master ASR plan has no chapters")
    prior_end = 0
    chapter_ids: set[str] = set()
    for index, chapter in enumerate(chapters):
        if not isinstance(chapter, dict) or set(chapter) != {
            "chapter_id",
            "entry_ids",
            "start_frame",
            "end_frame",
            "start_seconds",
            "end_seconds",
            "expected_text_sha256",
            "expected_tokens_sha256",
            "expected_words",
        }:
            raise FullMasterAsrError("ASR chapter plan fields are invalid")
        chapter_id = chapter["chapter_id"]
        if (
            not isinstance(chapter_id, str)
            or not chapter_id
            or chapter_id in chapter_ids
            or not isinstance(chapter["entry_ids"], list)
            or not chapter["entry_ids"]
            or chapter["start_frame"] < prior_end
            or chapter["end_frame"] <= chapter["start_frame"]
            or chapter["start_seconds"] != chapter["start_frame"] / SAMPLE_RATE
            or chapter["end_seconds"] != chapter["end_frame"] / SAMPLE_RATE
            or isinstance(chapter["expected_words"], bool)
            or not isinstance(chapter["expected_words"], int)
            or chapter["expected_words"] <= 0
        ):
            raise FullMasterAsrError(f"ASR chapter plan is invalid at index {index}")
        _sha256(chapter["expected_text_sha256"], "expected text SHA-256")
        _sha256(chapter["expected_tokens_sha256"], "expected tokens SHA-256")
        chapter_ids.add(chapter_id)
        prior_end = chapter["end_frame"]


def _production_file_inventory(
    *,
    repo_root: Path,
    render_plan_path: Path,
    render_plan: dict[str, Any],
    renderer_outdir: Path,
    assembly: dict[str, Any],
    mastering_plan_path: Path,
    mastering_plan: dict[str, Any],
    artifact_dir: Path,
    manifest: dict[str, Any],
) -> list[dict[str, Any]]:
    acceptance = render_plan["acceptance"]
    files = [
        _bound_file(
            repo_root / acceptance["screenplay_path"],
            "canonical-screenplay",
            acceptance["screenplay_sha256"],
        ),
        _bound_file(
            repo_root / acceptance["cast_path"],
            "canonical-cast",
            acceptance["cast_sha256"],
        ),
        _bound_file(
            repo_root / acceptance["commentary_quality_audit_path"],
            "commentary-quality-audit",
            acceptance["commentary_quality_audit_sha256"],
        ),
        _bound_file(
            repo_root / acceptance["accepted_attribution_path"],
            "accepted-speaker-attribution",
            acceptance["accepted_attribution_sha256"],
        ),
        _bound_file(
            render_plan_path,
            "render-plan",
            mastering_plan["renderer"]["render_plan_artifact_sha256"],
        ),
        _bound_file(mastering_plan_path, "mastering-plan"),
    ]
    for index, task in enumerate(render_plan["tasks"]):
        digest = task["input_sha256"]
        directory = renderer_outdir / "cache" / digest[:2] / digest
        files.extend(
            (
                _bound_file(directory / "audio.wav", f"render-task-{index:05d}-audio"),
                _bound_file(
                    directory / "render.json", f"render-task-{index:05d}-sidecar"
                ),
            )
        )
    for index, chapter in enumerate(assembly["chapters"]):
        audio = Path(chapter["audio_path"])
        files.extend(
            (
                _bound_file(
                    audio,
                    f"renderer-chapter-{index:04d}-audio",
                    chapter["audio_sha256"],
                ),
                _bound_file(
                    audio.parent / "render.json",
                    f"renderer-chapter-{index:04d}-sidecar",
                    chapter["sidecar_sha256"],
                ),
            )
        )
    complete_audio = Path(assembly["complete"]["audio_path"])
    files.extend(
        (
            _bound_file(
                complete_audio,
                "renderer-complete-audio",
                assembly["complete"]["audio_sha256"],
            ),
            _bound_file(
                complete_audio.parent / "render.json",
                "renderer-complete-sidecar",
                assembly["complete"]["sidecar_sha256"],
            ),
            _bound_file(
                artifact_dir / "master.wav",
                "working-master",
                manifest["outputs"]["working_master"]["sha256"],
            ),
            _bound_file(
                artifact_dir / "publication.mp3",
                "publication-derivative",
                manifest["outputs"]["publication"]["sha256"],
            ),
            _bound_file(artifact_dir / "mastering.json", "mastering-result"),
            _bound_file(
                artifact_dir / "mechanical-qa.json",
                "mechanical-qa",
                manifest["mechanical_qa_sha256"],
            ),
        )
    )
    return files


def load_current_asr_plan(
    *,
    render_plan_path: Path,
    expected_render_plan_sha256: str,
    renderer_outdir: Path,
    mastering_plan_path: Path,
    expected_mastering_plan_sha256: str,
    mastering_outdir: Path,
    repo_root: Path,
    cache_dir: Path,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    repo_root = repo_root.expanduser().resolve(strict=True)
    renderer_outdir = renderer_outdir.expanduser().resolve(strict=True)
    mastering_outdir = mastering_outdir.expanduser().resolve(strict=True)
    render_plan_path = render_plan_path.expanduser().resolve(strict=True)
    mastering_plan_path = mastering_plan_path.expanduser().resolve(strict=True)

    current_mastering_plan, assembly = current_mastering_inputs(
        render_plan_path=render_plan_path,
        expected_render_plan_sha256=expected_render_plan_sha256,
        renderer_outdir=renderer_outdir,
        repo_root=repo_root,
    )
    render_plan = load_render_plan_artifact(
        render_plan_path, expected_sha256=expected_render_plan_sha256
    )
    acceptance = render_plan["acceptance"]
    screenplay, _, current_acceptance = load_accepted_render_inputs(
        Path(acceptance["screenplay_path"]),
        Path(acceptance["cast_path"]),
        repo_root=repo_root,
    )
    if current_acceptance != acceptance:
        raise FullMasterAsrError(
            "render plan is stale against the canonical production screenplay"
        )
    mastering_plan = load_mastering_plan(
        mastering_plan_path,
        expected_sha256=expected_mastering_plan_sha256,
        current_plan=current_mastering_plan,
    )
    artifact_dir = (
        mastering_outdir / "artifacts" / expected_mastering_plan_sha256
    ).resolve()
    manifest = validate_result_directory(artifact_dir, mastering_plan)
    if manifest is None:
        raise FullMasterAsrError(f"mastering result is missing: {artifact_dir}")
    if manifest.get("mechanical_passed") is not True:
        raise FullMasterAsrError(
            "full-master ASR requires a passing, still-unaccepted mechanical result"
        )
    expected = reconstruct_expected_chapters(
        screenplay, mastering_plan["chapter_timeline"]
    )
    files = _production_file_inventory(
        repo_root=repo_root,
        render_plan_path=render_plan_path,
        render_plan=render_plan,
        renderer_outdir=renderer_outdir,
        assembly=assembly,
        mastering_plan_path=mastering_plan_path,
        mastering_plan=mastering_plan,
        artifact_dir=artifact_dir,
        manifest=manifest,
    )
    production = {
        "repo_root": str(repo_root),
        "screenplay": {
            "path": acceptance["screenplay_path"],
            "sha256": acceptance["screenplay_sha256"],
            "schema_version": screenplay["schema_version"],
        },
        "render_plan": {
            "path": str(render_plan_path),
            "plan_sha256": render_plan["plan_sha256"],
            "artifact_sha256": sha256_file(render_plan_path),
        },
        "renderer": {
            "outdir": str(renderer_outdir),
            "complete_input_sha256": assembly["complete"]["input_sha256"],
            "complete_audio_sha256": assembly["complete"]["audio_sha256"],
            "chapter_starts_sha256": assembly["complete"]["chapter_starts_sha256"],
        },
        "mastering_plan": {
            "path": str(mastering_plan_path),
            "plan_sha256": mastering_plan["plan_sha256"],
            "artifact_sha256": sha256_file(mastering_plan_path),
            "chapter_timeline_sha256": mastering_plan["chapter_timeline_sha256"],
        },
        "mastering_result": {
            "directory": str(artifact_dir),
            "manifest_sha256": sha256_file(artifact_dir / "mastering.json"),
            "mechanical_qa_sha256": manifest["mechanical_qa_sha256"],
            "working_master_path": str((artifact_dir / "master.wav").resolve()),
            "working_master_sha256": manifest["outputs"]["working_master"]["sha256"],
            "accepted": False,
        },
        "files": files,
    }
    plan = build_asr_plan(
        dialogue=screenplay["dialogue"],
        production=production,
        expected=expected,
        asr_runtime=runtime_provenance(cache_dir),
    )
    return plan, expected


def load_pinned_transcriber(
    asr_runtime: dict[str, Any],
) -> Callable[..., dict[str, Any]]:
    verify_runtime_provenance(asr_runtime)
    try:
        import ctranslate2
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise FullMasterAsrError(
            "faster-whisper and CTranslate2 are required for full-master ASR"
        ) from error
    if ctranslate2.get_cuda_device_count() < 1:
        raise FullMasterAsrError("full-master ASR requires CUDA")
    model = WhisperModel(
        asr_runtime["model"]["snapshot_path"],
        device="cuda",
        compute_type=COMPUTE_TYPE,
    )

    def transcribe(
        audio_path: Path, *, start_seconds: float, end_seconds: float
    ) -> dict[str, Any]:
        segments, info = model.transcribe(
            str(audio_path),
            task=TRANSCRIPTION_POLICY["task"],
            language=LANGUAGE,
            beam_size=BEAM_SIZE,
            best_of=TRANSCRIPTION_POLICY["best_of"],
            patience=TRANSCRIPTION_POLICY["patience"],
            length_penalty=TRANSCRIPTION_POLICY["length_penalty"],
            repetition_penalty=TRANSCRIPTION_POLICY["repetition_penalty"],
            no_repeat_ngram_size=TRANSCRIPTION_POLICY["no_repeat_ngram_size"],
            temperature=TRANSCRIPTION_POLICY["temperature"],
            compression_ratio_threshold=TRANSCRIPTION_POLICY[
                "compression_ratio_threshold"
            ],
            log_prob_threshold=TRANSCRIPTION_POLICY["log_prob_threshold"],
            no_speech_threshold=TRANSCRIPTION_POLICY["no_speech_threshold"],
            condition_on_previous_text=False,
            suppress_blank=TRANSCRIPTION_POLICY["suppress_blank"],
            suppress_tokens=TRANSCRIPTION_POLICY["suppress_tokens"],
            without_timestamps=TRANSCRIPTION_POLICY["without_timestamps"],
            max_initial_timestamp=TRANSCRIPTION_POLICY["max_initial_timestamp"],
            multilingual=TRANSCRIPTION_POLICY["multilingual"],
            vad_filter=False,
            word_timestamps=False,
            clip_timestamps=[start_seconds, end_seconds],
        )
        transcript = " ".join(segment.text.strip() for segment in segments).strip()
        return {
            "text": transcript,
            "detected_language": info.language,
            "language_probability": info.language_probability,
        }

    # The closure intentionally owns exactly one loaded WhisperModel for every
    # chapter in this dialogue.
    return transcribe


def _expected_projection(chapters: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return _plan_chapters(chapters)


def run_asr_with_transcriber(
    plan: dict[str, Any],
    expected: list[dict[str, Any]],
    transcriber: Callable[..., dict[str, Any]],
) -> dict[str, Any]:
    validate_asr_plan(plan)
    if _expected_projection(expected) != plan["chapters"]:
        raise FullMasterAsrError(
            "runtime expected text differs from the reviewed ASR plan"
        )
    verify_bound_files(plan["production"]["files"])
    verify_runtime_provenance(plan["asr_runtime"])
    master = Path(plan["production"]["mastering_result"]["working_master_path"])
    results: list[dict[str, Any]] = []
    corpus_expected_words = 0
    corpus_recognized_words = 0
    corpus_errors = 0
    for index, chapter in enumerate(expected, start=1):
        print(
            f"ASR chapter {index}/{len(expected)} {chapter['chapter_id']}",
            flush=True,
        )
        recognized = transcriber(
            master,
            start_seconds=chapter["start_seconds"],
            end_seconds=chapter["end_seconds"],
        )
        if (
            not isinstance(recognized, dict)
            or not isinstance(recognized.get("text"), str)
            or not isinstance(recognized.get("detected_language"), str)
            or isinstance(recognized.get("language_probability"), bool)
            or not isinstance(recognized.get("language_probability"), (int, float))
        ):
            raise FullMasterAsrError("ASR transcriber returned malformed evidence")
        transcript = recognized["text"].strip()
        expected_tokens = normalized_words(chapter["expected_text"])
        recognized_tokens = normalized_words(transcript)
        errors = word_edit_distance(expected_tokens, recognized_tokens)
        result = {
            **copy.deepcopy(chapter),
            "transcript": transcript,
            "transcript_sha256": sha256_bytes(transcript.encode("utf-8")),
            "recognized_words": len(recognized_tokens),
            "word_errors": errors,
            # No human has classified exceptions.  Fail closed by treating
            # every raw edit as an ordinary-word error.
            "ordinary_word_errors": errors,
            "word_error_rate": errors / len(expected_tokens),
            "detected_language": recognized["detected_language"],
            "language_probability": float(recognized["language_probability"]),
        }
        results.append(result)
        corpus_expected_words += len(expected_tokens)
        corpus_recognized_words += len(recognized_tokens)
        corpus_errors += errors
    verify_bound_files(plan["production"]["files"])
    verify_runtime_provenance(plan["asr_runtime"])
    transcript = " ".join(chapter["transcript"] for chapter in results).strip()
    expected_text = " ".join(chapter["expected_text"] for chapter in results)
    core = {
        "schema_version": SCHEMA_VERSION,
        "status": EVIDENCE_STATUS,
        "asr_plan_sha256": plan["plan_sha256"],
        "implementation": copy.deepcopy(plan["implementation"]),
        "dialogue": plan["dialogue"],
        "production": copy.deepcopy(plan["production"]),
        "asr_runtime": copy.deepcopy(plan["asr_runtime"]),
        "transcription_policy": copy.deepcopy(plan["transcription_policy"]),
        "chapters": results,
        "corpus": {
            "expected_text_sha256": sha256_bytes(expected_text.encode("utf-8")),
            "transcript_sha256": sha256_bytes(transcript.encode("utf-8")),
            "expected_words": corpus_expected_words,
            "recognized_words": corpus_recognized_words,
            "word_errors": corpus_errors,
            "ordinary_word_errors": corpus_errors,
            "word_error_rate": corpus_errors / corpus_expected_words,
        },
        "acceptance": {
            "accepted": False,
            "reason": (
                "mechanical ASR evidence only; no human listening or production "
                "recording acceptance was performed"
            ),
        },
        "human_listening": {"status": "not-performed"},
    }
    return {**core, "evidence_sha256": sha256_bytes(canonical_json(core))}


def validate_evidence(report: dict[str, Any]) -> None:
    if (
        not isinstance(report, dict)
        or report.get("schema_version") != SCHEMA_VERSION
        or report.get("status") != EVIDENCE_STATUS
        or report.get("acceptance", {}).get("accepted") is not False
        or report.get("human_listening") != {"status": "not-performed"}
    ):
        raise FullMasterAsrError("full-master ASR evidence is malformed or accepted")
    digest = _sha256(report.get("evidence_sha256"), "ASR evidence SHA-256")
    core = {key: value for key, value in report.items() if key != "evidence_sha256"}
    if sha256_bytes(canonical_json(core)) != digest:
        raise FullMasterAsrError("ASR evidence content address is inconsistent")


def _safe_output_root(raw: Path, repo_root: Path) -> Path:
    if not raw.is_absolute():
        raise FullMasterAsrError("--outdir must be absolute")
    cursor = raw
    while not cursor.exists() and cursor != cursor.parent:
        cursor = cursor.parent
    while cursor != cursor.parent:
        if cursor.is_symlink():
            raise FullMasterAsrError(f"ASR output traverses a symlink: {cursor}")
        cursor = cursor.parent
    outdir = raw.resolve()
    if outdir.exists() and (outdir.is_symlink() or not outdir.is_dir()):
        raise FullMasterAsrError("--outdir must be a regular directory path")
    forbidden = (
        (repo_root / "audio/qa").resolve(),
        (repo_root / "wiki/recordings").resolve(),
    )
    if any(outdir == path or path in outdir.parents for path in forbidden):
        raise FullMasterAsrError(
            "mechanical ASR evidence cannot write audio/qa or wiki/recordings"
        )
    return outdir


def write_evidence(
    report: dict[str, Any], *, outdir: Path, repo_root: Path
) -> tuple[Path, bool]:
    validate_evidence(report)
    outdir = _safe_output_root(outdir, repo_root.resolve(strict=True))
    final = outdir / "artifacts" / report["evidence_sha256"]
    path = final / EVIDENCE_FILENAME
    payload = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
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
            raise FullMasterAsrError(
                f"content-addressed ASR evidence is corrupt: {final}"
            )
        validate_evidence(_read_json(path, "ASR evidence"))
        return path, False
    final.parent.mkdir(parents=True, exist_ok=True)
    temporary = final.parent / f".{report['evidence_sha256']}.{uuid.uuid4().hex}.tmp"
    temporary.mkdir()
    try:
        temporary_path = temporary / EVIDENCE_FILENAME
        with temporary_path.open("x", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, final)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)
    if not path.is_file() or path.read_text(encoding="utf-8") != payload:
        raise FullMasterAsrError("content-addressed ASR evidence publication failed")
    return path, True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render-plan", type=Path, required=True)
    parser.add_argument("--expected-render-plan-sha256", required=True)
    parser.add_argument("--renderer-outdir", type=Path, required=True)
    parser.add_argument("--mastering-plan", type=Path, required=True)
    parser.add_argument("--expected-mastering-plan-sha256", required=True)
    parser.add_argument("--mastering-outdir", type=Path, required=True)
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--expected-asr-plan-sha256")
    parser.add_argument("--execute", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        kwargs = {
            "render_plan_path": args.render_plan,
            "expected_render_plan_sha256": args.expected_render_plan_sha256,
            "renderer_outdir": args.renderer_outdir,
            "mastering_plan_path": args.mastering_plan,
            "expected_mastering_plan_sha256": args.expected_mastering_plan_sha256,
            "mastering_outdir": args.mastering_outdir,
            "repo_root": args.repo_root,
            "cache_dir": args.cache_dir,
        }
        plan, expected = load_current_asr_plan(**kwargs)
        if not args.execute:
            if args.expected_asr_plan_sha256 is not None:
                raise FullMasterAsrError(
                    "--expected-asr-plan-sha256 is valid only with --execute"
                )
            print(
                json.dumps(
                    {
                        "dialogue": plan["dialogue"],
                        "asr_plan_sha256": plan["plan_sha256"],
                        "chapter_count": len(plan["chapters"]),
                        "expected_words": sum(
                            chapter["expected_words"] for chapter in plan["chapters"]
                        ),
                        "working_master_sha256": plan["production"]["mastering_result"][
                            "working_master_sha256"
                        ],
                        "model_repository": MODEL_REPOSITORY,
                        "model_revision": MODEL_REVISION,
                        "writes": False,
                        "accepted": False,
                        "human_listening": "not-performed",
                    },
                    indent=2,
                    sort_keys=True,
                )
            )
            return 0
        if args.expected_asr_plan_sha256 is None:
            raise FullMasterAsrError(
                "--execute requires --expected-asr-plan-sha256 from the dry run"
            )
        if plan["plan_sha256"] != _sha256(
            args.expected_asr_plan_sha256, "expected ASR plan SHA-256"
        ):
            raise FullMasterAsrError("current full-master ASR plan differs from review")
        transcriber = load_pinned_transcriber(plan["asr_runtime"])
        report = run_asr_with_transcriber(plan, expected, transcriber)
        del transcriber
        gc.collect()
        # Re-run the complete canonical/render/master preflight after inference.
        # No evidence is published if any path, byte, runtime, or inventory moved.
        postflight_plan, postflight_expected = load_current_asr_plan(**kwargs)
        if (
            postflight_plan != plan
            or _expected_projection(postflight_expected) != plan["chapters"]
        ):
            raise FullMasterAsrError("production inputs changed during full-master ASR")
        evidence_path, created = write_evidence(
            report,
            outdir=args.outdir.expanduser(),
            repo_root=args.repo_root.expanduser().resolve(strict=True),
        )
        print(
            json.dumps(
                {
                    "dialogue": plan["dialogue"],
                    "status": "written" if created else "cached",
                    "evidence_sha256": report["evidence_sha256"],
                    "evidence_path": str(evidence_path),
                    "word_errors": report["corpus"]["word_errors"],
                    "expected_words": report["corpus"]["expected_words"],
                    "word_error_rate": report["corpus"]["word_error_rate"],
                    "ordinary_word_errors": report["corpus"]["ordinary_word_errors"],
                    "accepted": False,
                    "human_listening": "not-performed",
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 0
    except (
        FullMasterAsrError,
        MasteringContractError,
        RenderContractError,
        FileNotFoundError,
        OSError,
    ) as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    raise SystemExit(main())
