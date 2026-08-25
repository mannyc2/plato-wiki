#!/usr/bin/env python3
"""Deterministic, resumable Dots renderer for canonical Plato screenplays.

Planning uses the Python standard library plus Bun to invoke the repository's
canonical TypeScript commentary-quality validator. CUDA, Dots, NumPy, and
SoundFile are imported only after ``--render`` is requested.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import importlib
import importlib.machinery
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
import sysconfig
import time
import uuid
import wave
from pathlib import Path, PurePosixPath
from typing import Any, Iterable
from urllib.parse import urlparse

from cast_acceptance import (
    CastAcceptanceError,
    validate_cast_decision_artifacts,
    validate_cast_registry as validate_deterministic_cast_registry,
    validate_selected_voice,
)


RENDERER_NAME = "plato-dots"
RENDERER_VERSION = 5
RENDER_PLAN_SCHEMA_VERSION = 3
RENDER_TASK_SCHEMA_VERSION = 3
RENDER_CACHE_SCHEMA_VERSION = 3
ASSEMBLY_SCHEMA_VERSION = 4
RENDER_PLAN_STATUS = "accepted-screenplay-dots-render-plan"
DOTS_PACKAGE_COMMIT = "5ed719e3d36f5a3f6d8037ca9a7009d4fd0520ba"
MODEL_REPOSITORY = "rednote-hilab/dots.tts-soar"
MODEL_REVISION = "e3520f75254d0020a0406db31c51a79d00d22d55"
SAMPLE_RATE = 48_000
WAV_SUBTYPE = "PCM_24"
CHAPTER_CONTAINER_PROFILE = "riff-pcm24"
MASTER_CONTAINER_PROFILE = "rf64-pcm24"
MAX_CHUNK_CHARACTERS = 320
# Full-master ASR isolated two otherwise valid entries whose dense v4 calls
# compressed an opening or dropped a final phrase. Preserve the corpus-wide
# limit and bind exact, lossless repair fragments. The lowercase continuation
# at turn 125 receives capitalization only in the Dots synthesis string; its
# canonical span and full-master ASR expectation remain unchanged.
ENTRY_CHUNK_OVERRIDES = {
    "lesser-hippias-source-turn-000125": [
        "in order that I may profit by learning something.",
        (
            "And so now I noticed when you were speaking, that in the lines "
            "which you repeated just now to show that Achilles speaks to "
            "Odysseus as to a deceiver, it seems to me very strange, if what "
            "you say is true,"
        ),
    ],
    "lesser-hippias-source-turn-000143": [
        (
            "but in this case also Achilles was induced by the goodness of his "
            "heart to say to Ajax something different from what he had said to "
            "Odysseus; whereas Odysseus, when he speaks the truth always speaks "
            "with design,"
        ),
        "and when he speaks falsehood likewise.",
    ],
}
SYNTHESIS_TEXT_OVERRIDES = {
    "lesser-hippias-source-turn-000125": {
        "0": "In order that I may profit by learning something."
    }
}
MAX_GENERATE_LENGTH = 800
TRIM_THRESHOLD_DB = -50.0
TRIM_SAFETY_MS = 30
INTERCHUNK_PAUSE_MS = 80
PRODUCTION_SAMPLE_WIDTH_BYTES = 3
MASTER_STREAM_BLOCK_FRAMES = 65_536

BOUNDARY_POLICY = {
    "schema_version": 1,
    "same_speaker_continuation": {
        "pause_ms": 0,
        "crossfade_ms": 18,
    },
    "speaker_change": {
        "pause_ms": 110,
        "short_reply_subtract_ms": 20,
        "reflective_add_ms": 60,
        "period_add_ms": 15,
        "question_or_exclamation_add_ms": 30,
        "crossfade_ms": 0,
        "maximum_pause_ms": 200,
    },
    "commentary_boundary": {
        "pause_ms": 280,
        "crossfade_ms": 0,
    },
    "chapter_boundary": {
        "pause_ms": 550,
        "crossfade_ms": 0,
    },
}

PACKAGE_PINS = {
    "dots.tts": "0.2.1",
    "numpy": "2.2.6",
    "pydantic": "2.12.5",
    "PyYAML": "6.0.3",
    "safetensors": "0.8.0rc0",
    "soundfile": "0.13.1",
    "torch": "2.8.0",
    "torchaudio": "2.8.0",
    "transformers": "4.57.0",
}

CADENCE_INTENTS = {
    "none",
    "continuation",
    "short_reply",
    "exchange",
    "reflective",
    "commentary",
    "chapter",
}
ENTRY_KINDS = {"source", "commentary", "heading", "meta"}
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REVISION_RE = re.compile(r"^[0-9a-f]{40}$")
SAFE_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
CHARACTER_ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
GENERATED_ATTRIBUTION_VERSION_RE = re.compile(
    r"^screenplay-generator-v3\+attribution\.([0-9a-f]{64})$"
)
SOURCE_HASH_FIELDS = {"english", "stephanus"}
COVERAGE_FIELDS = {
    "source_words",
    "source_words_covered",
    "source_words_uncovered",
    "source_words_duplicated",
    "commentary_blocks_expected",
    "commentary_blocks_covered",
    "commentary_blocks_missing",
    "commentary_blocks_duplicated",
}
CAST_FIELDS = {"schemaVersion", "status", "updatedAt", "enginePolicy", "voices"}
CAST_POLICY_FIELDS = {
    "defaultEngine",
    "exceptionsRequireRecordedQaFailure",
    "implicitFallbackVoice",
    "voiceOwnership",
    "reportedSpeech",
}
VOICE_FIELDS = {
    "characterId",
    "displayName",
    "status",
    "engine",
    "model",
    "mode",
    "seed",
    "reference",
    "generation",
    "audition",
    "selection",
}
COMMENTARY_QUALITY_MANIFEST_FIELDS = {
    "schema_version",
    "dialogue",
    "ledger",
    "protocol",
    "authoring",
    "units",
    "acceptance",
}
COMMENTARY_QUALITY_VALIDATION_FIELDS = {
    "authority",
    "helper_sha256",
    "validator_sha256",
    "harness_typescript_sha256",
    "harness_javascript_shadow_sha256",
    "bun_sha256",
    "bun_version",
}
SCREENPLAY_VALIDATION_FIELDS = COMMENTARY_QUALITY_VALIDATION_FIELDS
RUNTIME_PROVENANCE_FIELDS = {
    "schema_version",
    "packages",
    "model",
    "dots_source",
    "python_imports",
}
MODEL_PROVENANCE_FIELDS = {
    "repository",
    "revision",
    "snapshot_path",
    "inventory_sha256",
    "file_count",
    "total_bytes",
    "files",
}
DOTS_SOURCE_PROVENANCE_FIELDS = {
    "package",
    "version",
    "commit",
    "package_root",
    "direct_url_sha256",
    "inventory_sha256",
    "runtime_wrapper_sha256",
    "file_count",
    "total_bytes",
    "files",
}
INVENTORY_ENTRY_FIELDS = {"path", "sha256", "size_bytes", "storage", "link_target"}
HARNESS_EXECUTABLE_JAVASCRIPT_SUFFIXES = {".cjs", ".js", ".mjs"}
PYTHON_IMPORT_DISTRIBUTIONS = (
    ("numpy", "numpy"),
    ("pydantic", "pydantic"),
    ("yaml", "PyYAML"),
    ("safetensors", "safetensors"),
    ("soundfile", "soundfile"),
    ("torch", "torch"),
    ("torchaudio", "torchaudio"),
    ("transformers", "transformers"),
    ("dots_tts", "dots.tts"),
    ("dots_tts.runtime", "dots.tts"),
)
PYTHON_DISTRIBUTION_MODULE_PREFIXES = {
    "dots.tts": ("dots_tts",),
    "numpy": ("numpy",),
    "pydantic": ("pydantic",),
    "PyYAML": ("yaml",),
    "safetensors": ("safetensors",),
    "soundfile": ("soundfile", "_soundfile", "_soundfile_data"),
    "torch": ("torch", "functorch", "torchgen"),
    "torchaudio": ("torchaudio",),
    "transformers": ("transformers",),
}
PYTHON_IMPORT_PROVENANCE_FIELDS = {
    "module",
    "distribution",
    "version",
    "distribution_root",
    "distribution_file",
    "distribution_file_count",
    "distribution_inventory_sha256",
    "distribution_record_sha256",
    "distribution_total_bytes",
    "origin",
    "origin_sha256",
    "size_bytes",
    "loader",
    "package_locations",
}


class RenderContractError(ValueError):
    """Raised when a screenplay, cast, or cache artifact is unsafe to use."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def content_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_json(value)).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_json_object(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise RenderContractError(f"cannot read JSON object {path}: {error}") from error
    if not isinstance(value, dict):
        raise RenderContractError(f"{path}: expected a JSON object")
    return value


def _require_exact_fields(
    value: dict[str, Any], required: set[str], optional: set[str], location: str
) -> None:
    missing = sorted(required - value.keys())
    unknown = sorted(value.keys() - required - optional)
    if missing:
        raise RenderContractError(f"{location}: missing fields: {', '.join(missing)}")
    if unknown:
        raise RenderContractError(f"{location}: unknown fields: {', '.join(unknown)}")


def _nonempty_string(value: Any, location: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise RenderContractError(f"{location}: expected a non-empty string")
    return value


def _sha256(value: Any, location: str) -> str:
    if not isinstance(value, str) or not SHA256_RE.fullmatch(value):
        raise RenderContractError(f"{location}: expected a lowercase SHA-256")
    return value


def _finite_number(value: Any, location: str, *, minimum: float | None = None) -> float:
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or (minimum is not None and value < minimum)
    ):
        bound = f" at least {minimum}" if minimum is not None else ""
        raise RenderContractError(f"{location}: expected a finite number{bound}")
    return float(value)


def _repo_relative_path_string(value: Any, location: str) -> str:
    raw = _nonempty_string(value, location)
    path = Path(raw)
    if (
        path.is_absolute()
        or "\\" in raw
        or any(part in {"", ".", ".."} for part in path.parts)
    ):
        raise RenderContractError(f"{location}: expected a confined repository path")
    return path.as_posix()


def validate_screenplay(screenplay: dict[str, Any]) -> None:
    """Validate the renderer-facing hard-cutover screenplay contract."""

    _require_exact_fields(
        screenplay,
        {
            "schema_version",
            "dialogue",
            "source_hashes",
            "commentary_sha256",
            "commentary_quality_audit_sha256",
            "cast_sha256",
            "generator_version",
            "chapters",
            "entries",
            "repairs",
            "coverage",
        },
        set(),
        "screenplay",
    )
    if screenplay["schema_version"] != 2:
        raise RenderContractError("screenplay.schema_version: expected 2")
    dialogue = _nonempty_string(screenplay["dialogue"], "screenplay.dialogue")
    if not SAFE_ID_RE.fullmatch(dialogue):
        raise RenderContractError(
            "screenplay.dialogue: expected a filesystem-safe slug"
        )
    _sha256(screenplay["commentary_sha256"], "screenplay.commentary_sha256")
    _sha256(
        screenplay["commentary_quality_audit_sha256"],
        "screenplay.commentary_quality_audit_sha256",
    )
    _sha256(screenplay["cast_sha256"], "screenplay.cast_sha256")
    generator_version = _nonempty_string(
        screenplay["generator_version"], "screenplay.generator_version"
    )
    if GENERATED_ATTRIBUTION_VERSION_RE.fullmatch(generator_version) is None:
        raise RenderContractError(
            "screenplay.generator_version: expected "
            "screenplay-generator-v3+attribution.<accepted-attribution-sha256>"
        )

    source_hashes = screenplay["source_hashes"]
    if not isinstance(source_hashes, dict) or set(source_hashes) != SOURCE_HASH_FIELDS:
        raise RenderContractError(
            "screenplay.source_hashes: expected exactly english and stephanus"
        )
    for name in sorted(SOURCE_HASH_FIELDS):
        _sha256(source_hashes[name], f"screenplay.source_hashes.{name}")

    chapters = screenplay["chapters"]
    if not isinstance(chapters, list) or not chapters:
        raise RenderContractError("screenplay.chapters: expected a non-empty array")
    chapter_ids: set[str] = set()
    for index, chapter in enumerate(chapters):
        location = f"screenplay.chapters[{index}]"
        if not isinstance(chapter, dict):
            raise RenderContractError(f"{location}: expected an object")
        _require_exact_fields(chapter, {"id", "commentary_id"}, {"title"}, location)
        chapter_id = _nonempty_string(chapter["id"], f"{location}.id")
        if not SAFE_ID_RE.fullmatch(chapter_id):
            raise RenderContractError(f"{location}.id: expected a filesystem-safe id")
        if chapter_id in chapter_ids:
            raise RenderContractError(f"{location}.id: duplicate id {chapter_id!r}")
        chapter_ids.add(chapter_id)
        _nonempty_string(chapter["commentary_id"], f"{location}.commentary_id")
        if "title" in chapter:
            _nonempty_string(chapter["title"], f"{location}.title")

    entries = screenplay["entries"]
    if not isinstance(entries, list) or not entries:
        raise RenderContractError("screenplay.entries: expected a non-empty array")
    entry_ids: set[str] = set()
    chapter_entry_counts = {chapter_id: 0 for chapter_id in chapter_ids}
    chapter_order = {
        chapter["id"]: index for index, chapter in enumerate(screenplay["chapters"])
    }
    prior_chapter_index = -1
    source_entry_count = 0
    commentary_ids: list[str] = []
    for index, entry in enumerate(entries):
        location = f"screenplay.entries[{index}]"
        if not isinstance(entry, dict):
            raise RenderContractError(f"{location}: expected an object")
        _require_exact_fields(
            entry,
            {
                "id",
                "chapter_id",
                "kind",
                "character_id",
                "text",
                "anchor",
                "cadence_intent",
            },
            set(),
            location,
        )
        entry_id = _nonempty_string(entry["id"], f"{location}.id")
        if not SAFE_ID_RE.fullmatch(entry_id):
            raise RenderContractError(f"{location}.id: expected a filesystem-safe id")
        if entry_id in entry_ids:
            raise RenderContractError(f"{location}.id: duplicate id {entry_id!r}")
        entry_ids.add(entry_id)
        chapter_id = _nonempty_string(entry["chapter_id"], f"{location}.chapter_id")
        if chapter_id not in chapter_ids:
            raise RenderContractError(
                f"{location}.chapter_id: unknown chapter {chapter_id!r}"
            )
        chapter_entry_counts[chapter_id] += 1
        if entry["kind"] not in ENTRY_KINDS:
            raise RenderContractError(
                f"{location}.kind: expected one of {', '.join(sorted(ENTRY_KINDS))}"
            )
        character_id = _nonempty_string(
            entry["character_id"], f"{location}.character_id"
        )
        if CHARACTER_ID_RE.fullmatch(character_id) is None:
            raise RenderContractError(
                f"{location}.character_id: expected a canonical character id"
            )
        text = _nonempty_string(entry["text"], f"{location}.text")
        if text != text.strip() or re.search(r"\s{2,}", text):
            raise RenderContractError(
                f"{location}.text: text must be trimmed with normalized whitespace"
            )
        anchor = entry["anchor"]
        if not isinstance(anchor, dict) or not anchor:
            raise RenderContractError(f"{location}.anchor: expected a non-empty object")
        intent = entry["cadence_intent"]
        if intent not in CADENCE_INTENTS:
            raise RenderContractError(
                f"{location}.cadence_intent: expected one of "
                f"{', '.join(sorted(CADENCE_INTENTS))}"
            )
        kind = entry["kind"]
        if kind == "source":
            source_entry_count += 1
            if set(anchor) != {"stephanus"}:
                raise RenderContractError(
                    f"{location}.anchor: source entries require exactly stephanus"
                )
            _nonempty_string(anchor["stephanus"], f"{location}.anchor.stephanus")
            if intent == "commentary":
                raise RenderContractError(
                    f"{location}.cadence_intent: source cannot use commentary"
                )
        elif kind in {"commentary", "heading"}:
            if set(anchor) != {"commentary_id"}:
                raise RenderContractError(
                    f"{location}.anchor: {kind} requires exactly commentary_id"
                )
            commentary_id = _nonempty_string(
                anchor["commentary_id"], f"{location}.anchor.commentary_id"
            )
            if kind == "commentary":
                commentary_ids.append(commentary_id)
                if intent not in {"commentary", "chapter"}:
                    raise RenderContractError(
                        f"{location}.cadence_intent: commentary requires commentary or chapter"
                    )
            elif intent != "chapter":
                raise RenderContractError(
                    f"{location}.cadence_intent: heading requires chapter"
                )
        else:
            if set(anchor) != {"scope"} or anchor.get("scope") not in {
                "dialogue",
                "chapter",
            }:
                raise RenderContractError(
                    f"{location}.anchor: meta requires exactly scope dialogue or chapter"
                )
            if intent not in {"none", "chapter"}:
                raise RenderContractError(
                    f"{location}.cadence_intent: meta requires none or chapter"
                )
        current_chapter_index = chapter_order[chapter_id]
        if current_chapter_index < prior_chapter_index:
            raise RenderContractError(
                f"{location}.chapter_id: entries may not return to an earlier chapter"
            )
        prior_chapter_index = current_chapter_index
    empty_chapters = sorted(
        chapter_id for chapter_id, count in chapter_entry_counts.items() if count == 0
    )
    if empty_chapters:
        raise RenderContractError(
            f"screenplay.chapters: chapters contain no entries: {', '.join(empty_chapters)}"
        )
    repairs = screenplay["repairs"]
    if not isinstance(repairs, list):
        raise RenderContractError("screenplay.repairs: expected an array")
    repair_ids: set[str] = set()
    repair_sources: set[str] = set()
    for index, repair in enumerate(repairs):
        location = f"screenplay.repairs[{index}]"
        if not isinstance(repair, dict):
            raise RenderContractError(f"{location}: expected an object")
        _require_exact_fields(
            repair,
            {"id", "old_text", "new_text", "reason", "occurrence_count"},
            set(),
            location,
        )
        repair_id = _nonempty_string(repair["id"], f"{location}.id")
        old_text = _nonempty_string(repair["old_text"], f"{location}.old_text")
        new_text = _nonempty_string(repair["new_text"], f"{location}.new_text")
        _nonempty_string(repair["reason"], f"{location}.reason")
        occurrence_count = repair["occurrence_count"]
        if (
            SAFE_ID_RE.fullmatch(repair_id) is None
            or repair_id in repair_ids
            or old_text in repair_sources
            or old_text == new_text
            or isinstance(occurrence_count, bool)
            or not isinstance(occurrence_count, int)
            or occurrence_count <= 0
        ):
            raise RenderContractError(f"{location}: invalid or duplicate repair")
        repair_ids.add(repair_id)
        repair_sources.add(old_text)

    coverage = screenplay["coverage"]
    if not isinstance(coverage, dict) or set(coverage) != COVERAGE_FIELDS:
        raise RenderContractError(
            "screenplay.coverage: expected the complete deterministic coverage object"
        )
    if any(
        isinstance(value, bool) or not isinstance(value, int) or value < 0
        for value in coverage.values()
    ):
        raise RenderContractError(
            "screenplay.coverage: every total must be a non-negative integer"
        )
    if (
        source_entry_count == 0
        or coverage["source_words"] != coverage["source_words_covered"]
        or coverage["source_words_uncovered"] != 0
        or coverage["source_words_duplicated"] != 0
        or coverage["commentary_blocks_expected"]
        != coverage["commentary_blocks_covered"]
        or coverage["commentary_blocks_missing"] != 0
        or coverage["commentary_blocks_duplicated"] != 0
        or coverage["commentary_blocks_covered"] != len(set(commentary_ids))
        or len(commentary_ids) != len(set(commentary_ids))
    ):
        raise RenderContractError(
            "screenplay.coverage: source and commentary coverage must be complete and unique"
        )


def validate_cast_registry(cast: dict[str, Any]) -> dict[str, dict[str, Any]]:
    try:
        return validate_deterministic_cast_registry(cast)
    except CastAcceptanceError as error:
        raise RenderContractError(str(error)) from error


def _legacy_validate_cast_registry(cast: dict[str, Any]) -> dict[str, dict[str, Any]]:
    if set(cast) != CAST_FIELDS or cast.get("schemaVersion") != 2:
        raise RenderContractError("cast.schemaVersion: expected 2")
    if cast.get("status") not in {"partial", "complete"}:
        raise RenderContractError("cast.status: expected partial or complete")
    updated_at = cast.get("updatedAt")
    if not isinstance(updated_at, str) or DATE_RE.fullmatch(updated_at) is None:
        raise RenderContractError("cast.updatedAt: expected YYYY-MM-DD")
    policy = cast.get("enginePolicy")
    if not isinstance(policy, dict) or set(policy) != CAST_POLICY_FIELDS:
        raise RenderContractError("cast.enginePolicy: invalid fields")
    if policy != {
        "defaultEngine": "dots.tts-soar",
        "exceptionsRequireRecordedQaFailure": True,
        "implicitFallbackVoice": False,
        "voiceOwnership": "one-voice-per-character",
        "reportedSpeech": "inherit-active-character",
    }:
        raise RenderContractError(
            "cast.enginePolicy: Dots and one-voice-per-character reported-speech inheritance must be explicit"
        )
    voices = cast.get("voices")
    if not isinstance(voices, list) or not voices:
        raise RenderContractError("cast.voices: expected a non-empty array")
    by_character: dict[str, dict[str, Any]] = {}
    for index, voice in enumerate(voices):
        location = f"cast.voices[{index}]"
        if not isinstance(voice, dict) or set(voice) != VOICE_FIELDS:
            raise RenderContractError(f"{location}: expected the exact voice contract")
        character_id = _nonempty_string(
            voice.get("characterId"), f"{location}.characterId"
        )
        if CHARACTER_ID_RE.fullmatch(character_id) is None:
            raise RenderContractError(f"{location}.characterId: invalid canonical id")
        if character_id in by_character:
            raise RenderContractError(
                f"{location}: duplicate characterId {character_id!r}"
            )
        by_character[character_id] = voice
    return by_character


def _selected_dots_recipe(voice: dict[str, Any], character_id: str) -> dict[str, Any]:
    try:
        voice = validate_selected_voice(voice, location=f"cast voice {character_id!r}")
    except CastAcceptanceError as error:
        raise RenderContractError(str(error)) from error
    reference = voice["reference"]
    audition = voice["audition"]
    selection = voice["selection"]
    return {
        "character_id": character_id,
        "display_name": voice["displayName"],
        "status": voice["status"],
        "engine": voice["engine"],
        "mode": voice["mode"],
        "model": voice["model"],
        "seed": voice["seed"],
        "reference": {
            "source_url": reference["sourceUrl"],
            "source_registry_path": reference["sourceRegistryPath"],
            "source_registry_sha256": reference["sourceRegistrySha256"],
            "source_dialogue": reference["sourceDialogue"],
            "source_video_id": reference["sourceVideoId"],
            "source_character_id": reference["sourceCharacterId"],
            "video_start_seconds": reference["videoStartSeconds"],
            "video_end_seconds": reference["videoEndSeconds"],
            "local_duration_seconds": reference["localDurationSeconds"],
            "sha256": reference["localSha256"],
            "prompt_text": reference["promptText"],
            "reference_asr": reference["referenceAsr"],
            "speaker_purity_evidence_path": reference["speakerPurityEvidencePath"],
            "speaker_purity_evidence_sha256": reference["speakerPurityEvidenceSha256"],
            "speaker_purity_proof_record_id": reference[
                "speakerPurityProofRecordId"
            ],
            "speaker_purity_source_agreement_sha256": reference[
                "speakerPuritySourceAgreementSha256"
            ],
            "speaker_purity_method": reference["speakerPurityMethod"],
            "dominant_speaker_coverage": reference["dominantSpeakerCoverage"],
            "competing_speaker_coverage": reference["competingSpeakerCoverage"],
            "uncovered_speaker_coverage": reference["uncoveredSpeakerCoverage"],
        },
        "generation": {
            "num_steps": voice["generation"]["numSteps"],
            "guidance_scale": voice["generation"]["guidanceScale"],
            "speaker_scale": voice["generation"]["speakerScale"],
            "language": voice["generation"]["language"],
            "precision": voice["generation"]["precision"],
        },
        "audition": {
            "relative_path": audition["relativePath"],
            "sha256": audition["sha256"],
            "duration_seconds": audition["durationSeconds"],
            "expected_words": audition["expectedWords"],
            "ordinary_word_errors": audition["ordinaryWordErrors"],
            "ordinary_word_error_rate": audition["ordinaryWordErrorRate"],
            "asr_evidence_path": audition["asrEvidencePath"],
            "asr_evidence_sha256": audition["asrEvidenceSha256"],
            "mean_speaker_cosine_similarity": audition["meanSpeakerCosineSimilarity"],
            "minimum_window_speaker_cosine_similarity": audition[
                "minimumWindowSpeakerCosineSimilarity"
            ],
            "acoustic_evidence_path": audition["acousticEvidencePath"],
            "acoustic_evidence_sha256": audition["acousticEvidenceSha256"],
            "clipped_samples": audition["clippedSamples"],
            "true_peak_dbtp": audition["truePeakDbtp"],
            "peak_amplitude": audition["peakAmplitude"],
        },
        "selection": {
            "basis": selection["basis"],
            "policy": selection["policy"],
            "accepted_at": selection["acceptedAt"],
            "label": selection["label"],
            "all_gates_passed": selection["allGatesPassed"],
            "candidate_selection": selection["candidateSelection"],
            "evaluated_candidate_count": selection["evaluatedCandidateCount"],
            "passing_candidate_count": selection["passingCandidateCount"],
            "selected_rank": selection["selectedRank"],
            "decision_path": selection["decisionPath"],
            "decision_sha256": selection["decisionSha256"],
            "source_assignment": selection["sourceAssignment"],
        },
    }


def _legacy_selected_dots_recipe(voice: dict[str, Any], character_id: str) -> dict[str, Any]:
    location = f"cast voice {character_id!r}"
    if voice.get("status") != "selected":
        raise RenderContractError(f"{location}: voice is not selected")
    if voice.get("engine") != "dots.tts-soar":
        raise RenderContractError(f"{location}: renderer requires engine dots.tts-soar")
    if voice.get("mode") != "continuation-voice-cloning":
        raise RenderContractError(
            f"{location}: renderer requires continuation-voice-cloning"
        )
    model = voice.get("model")
    if not isinstance(model, dict) or set(model) != {"repository", "revision"}:
        raise RenderContractError(f"{location}.model: expected an object")
    if model.get("repository") != MODEL_REPOSITORY:
        raise RenderContractError(
            f"{location}.model.repository: expected pinned {MODEL_REPOSITORY}"
        )
    revision = model.get("revision")
    if (
        revision != MODEL_REVISION
        or not isinstance(revision, str)
        or not REVISION_RE.fullmatch(revision)
    ):
        raise RenderContractError(
            f"{location}.model.revision: expected pinned {MODEL_REVISION}"
        )
    seed = voice.get("seed")
    if not isinstance(seed, int) or isinstance(seed, bool) or seed < 0:
        raise RenderContractError(f"{location}.seed: expected a non-negative integer")
    reference = voice.get("reference")
    reference_fields = {
        "sourceUrl",
        "videoStartSeconds",
        "videoEndSeconds",
        "localDurationSeconds",
        "localSha256",
        "promptText",
    }
    if not isinstance(reference, dict) or frozenset(reference) not in {
        frozenset(reference_fields),
        frozenset({*reference_fields, "relativePath"}),
    }:
        raise RenderContractError(f"{location}.reference: expected an object")
    source_url = _nonempty_string(
        reference.get("sourceUrl"), f"{location}.reference.sourceUrl"
    )
    parsed_url = urlparse(source_url)
    if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
        raise RenderContractError(f"{location}.reference.sourceUrl: invalid URL")
    video_start = _finite_number(
        reference.get("videoStartSeconds"),
        f"{location}.reference.videoStartSeconds",
        minimum=0,
    )
    video_end = _finite_number(
        reference.get("videoEndSeconds"),
        f"{location}.reference.videoEndSeconds",
        minimum=0,
    )
    local_duration = _finite_number(
        reference.get("localDurationSeconds"),
        f"{location}.reference.localDurationSeconds",
        minimum=0.001,
    )
    if video_end <= video_start:
        raise RenderContractError(
            f"{location}.reference: videoEndSeconds must follow videoStartSeconds"
        )
    if "relativePath" in reference:
        _repo_relative_path_string(
            reference["relativePath"], f"{location}.reference.relativePath"
        )
    reference_sha = _sha256(
        reference.get("localSha256"), f"{location}.reference.localSha256"
    )
    prompt_text = _nonempty_string(
        reference.get("promptText"), f"{location}.reference.promptText"
    )
    generation = voice.get("generation")
    if not isinstance(generation, dict):
        raise RenderContractError(f"{location}.generation: expected an object")
    required_generation = {
        "numSteps",
        "guidanceScale",
        "speakerScale",
        "language",
        "precision",
    }
    if set(generation) != required_generation:
        raise RenderContractError(
            f"{location}.generation: expected exactly {', '.join(sorted(required_generation))}"
        )
    if not isinstance(generation["numSteps"], int) or generation["numSteps"] <= 0:
        raise RenderContractError(
            f"{location}.generation.numSteps: expected a positive integer"
        )
    for field in ("guidanceScale", "speakerScale"):
        value = generation[field]
        if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0:
            raise RenderContractError(
                f"{location}.generation.{field}: expected a positive number"
            )
    if generation["language"] != "EN":
        raise RenderContractError(f"{location}.generation.language: expected EN")
    if generation["precision"] != "bfloat16":
        raise RenderContractError(f"{location}.generation.precision: expected bfloat16")
    audition = voice.get("audition")
    audition_fields = {
        "relativePath",
        "sha256",
        "listeningMp3Path",
        "listeningMp3Sha256",
        "expectedWords",
        "ordinaryWordErrors",
        "meanSpeakerCosineSimilarity",
    }
    if not isinstance(audition, dict) or set(audition) != audition_fields:
        raise RenderContractError(f"{location}.audition: invalid fields")
    audition_path = _repo_relative_path_string(
        audition["relativePath"], f"{location}.audition.relativePath"
    )
    audition_sha = _sha256(audition["sha256"], f"{location}.audition.sha256")
    listening_path = _repo_relative_path_string(
        audition["listeningMp3Path"], f"{location}.audition.listeningMp3Path"
    )
    listening_sha = _sha256(
        audition["listeningMp3Sha256"],
        f"{location}.audition.listeningMp3Sha256",
    )
    expected_words = audition["expectedWords"]
    ordinary_errors = audition["ordinaryWordErrors"]
    similarity = _finite_number(
        audition["meanSpeakerCosineSimilarity"],
        f"{location}.audition.meanSpeakerCosineSimilarity",
        minimum=-1,
    )
    if (
        isinstance(expected_words, bool)
        or not isinstance(expected_words, int)
        or expected_words <= 0
        or isinstance(ordinary_errors, bool)
        or not isinstance(ordinary_errors, int)
        or ordinary_errors != 0
        or similarity > 1
    ):
        raise RenderContractError(
            f"{location}.audition: selected Dots voice requires words, zero ordinary-word errors, and bounded similarity"
        )
    selection = voice.get("selection")
    if not isinstance(selection, dict) or set(selection) != {
        "basis",
        "selectedAt",
        "label",
    }:
        raise RenderContractError(f"{location}.selection: invalid fields")
    selected_at = selection.get("selectedAt")
    if (
        selection.get("basis") != "human-listening"
        or not isinstance(selected_at, str)
        or DATE_RE.fullmatch(selected_at) is None
    ):
        raise RenderContractError(
            f"{location}.selection: expected a dated human-listening selection"
        )
    selection_label = _nonempty_string(
        selection.get("label"), f"{location}.selection.label"
    )
    return {
        "character_id": character_id,
        "engine": voice["engine"],
        "mode": voice["mode"],
        "model": {"repository": MODEL_REPOSITORY, "revision": MODEL_REVISION},
        "seed": seed,
        "reference": {
            "source_url": source_url,
            "video_start_seconds": video_start,
            "video_end_seconds": video_end,
            "local_duration_seconds": local_duration,
            "sha256": reference_sha,
            "prompt_text": prompt_text,
        },
        "generation": {
            "num_steps": generation["numSteps"],
            "guidance_scale": generation["guidanceScale"],
            "speaker_scale": generation["speakerScale"],
            "language": generation["language"],
            "precision": generation["precision"],
        },
        "audition": {
            "relative_path": audition_path,
            "sha256": audition_sha,
            "listening_mp3_path": listening_path,
            "listening_mp3_sha256": listening_sha,
            "expected_words": expected_words,
            "ordinary_word_errors": ordinary_errors,
            "mean_speaker_cosine_similarity": similarity,
        },
        "selection": {
            "basis": "human-listening",
            "selected_at": selected_at,
            "label": selection_label,
        },
    }


def parse_reference_overrides(values: Iterable[str]) -> dict[str, Path]:
    result: dict[str, Path] = {}
    for value in values:
        character_id, separator, raw_path = value.partition("=")
        if not separator or not character_id or not raw_path:
            raise RenderContractError(
                f"invalid --reference {value!r}; expected character_id=/absolute/reference.wav"
            )
        if character_id in result:
            raise RenderContractError(f"duplicate --reference for {character_id!r}")
        path = Path(raw_path).expanduser()
        if not path.is_absolute():
            raise RenderContractError(
                f"--reference for {character_id!r} must be absolute"
            )
        if path.is_symlink():
            raise RenderContractError(
                f"--reference for {character_id!r} must not be a symlink"
            )
        result[character_id] = path.absolute()
    return result


def resolve_reference_path(
    voice: dict[str, Any],
    character_id: str,
    repo_root: Path,
    overrides: dict[str, Path],
) -> Path:
    if character_id in overrides:
        path = overrides[character_id]
    else:
        reference = voice.get("reference")
        raw_path = (
            reference.get("relativePath") if isinstance(reference, dict) else None
        )
        if not isinstance(raw_path, str) or not raw_path:
            raise RenderContractError(
                f"cast voice {character_id!r} has no reference.relativePath; materialize "
                "the exact reference and pass --reference "
                f"{character_id}=/absolute/reference.wav"
            )
        candidate = Path(raw_path)
        if candidate.is_absolute() or ".." in candidate.parts:
            raise RenderContractError(
                f"cast voice {character_id!r} reference.relativePath must be repo-relative"
            )
        unresolved = repo_root / candidate
        for parent in (unresolved, *unresolved.parents):
            if parent.is_symlink():
                raise RenderContractError(
                    f"cast voice {character_id!r} reference traverses a symlink"
                )
            if parent == repo_root:
                break
        path = unresolved.resolve()
        try:
            path.relative_to(repo_root.resolve())
        except ValueError as error:
            raise RenderContractError(
                f"cast voice {character_id!r} reference escapes the repository"
            ) from error
    if path.is_symlink() or not path.is_file():
        raise RenderContractError(
            f"reference for {character_id!r} does not exist: {path}"
        )
    expected_sha = voice["reference"]["localSha256"]
    actual_sha = sha256_file(path)
    if actual_sha != expected_sha:
        raise RenderContractError(
            f"reference hash mismatch for {character_id!r}: expected {expected_sha}, got {actual_sha}"
        )
    try:
        with wave.open(str(path), "rb") as handle:
            channels = handle.getnchannels()
            sample_rate = handle.getframerate()
            frames = handle.getnframes()
    except (OSError, wave.Error) as error:
        raise RenderContractError(
            f"invalid WAV reference for {character_id!r}: {error}"
        ) from error
    if channels != 1 or sample_rate != SAMPLE_RATE or frames <= 0:
        raise RenderContractError(
            f"reference for {character_id!r} must be non-empty mono {SAMPLE_RATE} Hz WAV; "
            f"found channels={channels}, sample_rate={sample_rate}, frames={frames}"
        )
    expected_duration = voice["reference"]["localDurationSeconds"]
    actual_duration = frames / sample_rate
    if abs(actual_duration - expected_duration) > 0.02:
        raise RenderContractError(
            f"reference duration mismatch for {character_id!r}: expected "
            f"{expected_duration}, got {actual_duration:.6f}"
        )
    return path


def _canonical_regular_file(path: Path, root: Path, expected: str, label: str) -> Path:
    candidate = path.expanduser()
    candidate = candidate if candidate.is_absolute() else root / candidate
    expected_path = root / expected
    try:
        resolved = candidate.resolve(strict=True)
        expected_resolved = expected_path.resolve(strict=True)
    except FileNotFoundError as error:
        raise RenderContractError(f"missing {label}: {candidate}") from error
    if resolved != expected_resolved:
        raise RenderContractError(f"{label} must be canonical {expected}")
    for parent in (candidate, *candidate.parents):
        if parent.is_symlink():
            raise RenderContractError(f"{label} traverses a symlink")
        if parent == root:
            break
    if not resolved.is_file():
        raise RenderContractError(f"{label} must be a regular file")
    return resolved


def _verify_dependency(
    root: Path, relative_path: str, expected_sha256: str, label: str
) -> Path:
    path = root / relative_path
    for parent in (path, *path.parents):
        if parent.is_symlink():
            raise RenderContractError(f"{label} traverses a symlink")
        if parent == root:
            break
    if not path.is_file():
        raise RenderContractError(
            f"missing accepted screenplay dependency: {relative_path}"
        )
    actual = sha256_file(path)
    if actual != expected_sha256:
        raise RenderContractError(
            f"{label} hash mismatch: expected {expected_sha256}, got {actual}"
        )
    return path


def _harness_authority_provenance(root: Path) -> dict[str, str]:
    source_root = root / "packages/harness/src"
    if source_root.is_symlink() or not source_root.is_dir():
        raise RenderContractError(
            "authoritative commentary quality validator source is unavailable"
        )
    entries: list[dict[str, str]] = []
    for path in sorted(
        source_root.rglob("*"),
        key=lambda item: item.relative_to(source_root).as_posix(),
    ):
        if path.is_symlink():
            raise RenderContractError(
                f"authoritative validator source contains an unsafe path: {path}"
            )
        if path.is_dir():
            continue
        if not path.is_file():
            raise RenderContractError(
                f"authoritative validator source contains an unsafe path: {path}"
            )
        if path.suffix.lower() in HARNESS_EXECUTABLE_JAVASCRIPT_SUFFIXES:
            relative = path.relative_to(root).as_posix()
            raise RenderContractError(
                "authoritative validator source contains an executable JavaScript "
                f"shadow: {relative}"
            )
        if path.suffix != ".ts":
            continue
        entries.append(
            {
                "path": path.relative_to(root).as_posix(),
                "sha256": sha256_file(path),
            }
        )
    if not entries:
        raise RenderContractError(
            "authoritative commentary quality validator source is empty"
        )
    shadow_policy = {
        "policy": "reject-all-executable-javascript",
        "suffixes": sorted(HARNESS_EXECUTABLE_JAVASCRIPT_SUFFIXES),
        "paths": [],
    }
    return {
        "harness_typescript_sha256": content_sha256(entries),
        "harness_javascript_shadow_sha256": content_sha256(shadow_policy),
    }


def _run_authoritative_typescript_validation(
    *,
    repo_root: Path,
    dialogue: str,
    helper_relative: str,
    authority_relative: str,
    expected_receipt: dict[str, Any],
    label: str,
) -> dict[str, str]:
    helper = repo_root / helper_relative
    validator = repo_root / authority_relative
    for path, source_label in (
        (helper, f"{label} validation helper"),
        (validator, f"canonical {label} validator"),
    ):
        if path.is_symlink() or not path.is_file():
            raise RenderContractError(f"missing {source_label}: {path}")
    raw_bun = shutil.which("bun")
    if raw_bun is None:
        raise RenderContractError(
            "bun is required for canonical commentary quality manifest validation"
        )
    bun = Path(raw_bun).resolve(strict=True)
    if not bun.is_file():
        raise RenderContractError("resolved bun executable is not a regular file")
    evidence = {
        "authority": authority_relative,
        "helper_sha256": sha256_file(helper),
        "validator_sha256": sha256_file(validator),
        **_harness_authority_provenance(repo_root),
        "bun_sha256": sha256_file(bun),
    }
    version_result = subprocess.run(
        [str(bun), "--version"],
        cwd=repo_root,
        check=False,
        capture_output=True,
        text=True,
        timeout=30,
    )
    bun_version = version_result.stdout.strip()
    if version_result.returncode != 0 or not bun_version:
        raise RenderContractError("cannot identify bun for commentary validation")
    result = subprocess.run(
        [str(bun), str(helper), str(repo_root), dialogue],
        cwd=repo_root,
        check=False,
        capture_output=True,
        text=True,
        timeout=120,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise RenderContractError(f"canonical {label} validation failed: " + detail)
    try:
        receipt = json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RenderContractError(
            f"canonical {label} validator returned malformed evidence"
        ) from error
    if receipt != expected_receipt:
        raise RenderContractError(
            f"canonical {label} validator returned unexpected evidence"
        )
    current_evidence = {
        "authority": authority_relative,
        "helper_sha256": sha256_file(helper),
        "validator_sha256": sha256_file(validator),
        **_harness_authority_provenance(repo_root),
        "bun_sha256": sha256_file(bun),
    }
    if current_evidence != evidence:
        raise RenderContractError(
            f"canonical {label} authority changed during validation"
        )
    return {**evidence, "bun_version": bun_version}


def validate_commentary_quality_manifest(
    manifest_path: Path,
    *,
    dialogue: str,
    repo_root: Path,
) -> dict[str, str]:
    """Run the canonical TypeScript manifest validator and require acceptance."""

    manifest = load_json_object(manifest_path)
    if set(manifest) != COMMENTARY_QUALITY_MANIFEST_FIELDS:
        raise RenderContractError(
            "commentary quality-audit manifest has malformed top-level fields"
        )
    acceptance = manifest.get("acceptance")
    if (
        manifest.get("schema_version") != 1
        or manifest.get("dialogue") != dialogue
        or not isinstance(acceptance, dict)
        or acceptance.get("decision") != "accepted"
    ):
        raise RenderContractError(
            "commentary quality-audit manifest requires an operator-delegated Luna sample accepted decision"
        )
    return _run_authoritative_typescript_validation(
        repo_root=repo_root,
        dialogue=dialogue,
        helper_relative="scripts/audio/validate_commentary_quality_audit.ts",
        authority_relative="packages/harness/src/wiki/commentary-quality-audit.ts",
        expected_receipt={
            "schema_version": 1,
            "dialogue": dialogue,
            "decision": "accepted",
        },
        label="commentary quality manifest",
    )


def validate_audio_screenplay_artifact(
    *, dialogue: str, repo_root: Path
) -> dict[str, str]:
    """Require the repository validator to reconstruct the exact screenplay."""

    return _run_authoritative_typescript_validation(
        repo_root=repo_root,
        dialogue=dialogue,
        helper_relative="scripts/audio/validate_audio_screenplay.ts",
        authority_relative="packages/harness/src/audio-production.ts",
        expected_receipt={
            "schema_version": 2,
            "dialogue": dialogue,
            "valid": True,
        },
        label="audio screenplay artifact",
    )


def load_accepted_render_inputs(
    screenplay_path: Path,
    cast_path: Path,
    *,
    repo_root: Path,
) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    """Load only a canonical production screenplay and its current dependencies."""

    root = repo_root.resolve(strict=True)
    initial_path = (
        screenplay_path if screenplay_path.is_absolute() else root / screenplay_path
    )
    initial = load_json_object(initial_path)
    dialogue = _nonempty_string(initial.get("dialogue"), "screenplay.dialogue")
    if CHARACTER_ID_RE.fullmatch(dialogue) is None:
        raise RenderContractError("screenplay.dialogue: invalid canonical dialogue id")
    canonical_screenplay = _canonical_regular_file(
        screenplay_path,
        root,
        f"audio/scripts/{dialogue}.json",
        "production screenplay",
    )
    canonical_cast = _canonical_regular_file(
        cast_path, root, "audio/cast.json", "canonical cast"
    )
    screenplay = load_json_object(canonical_screenplay)
    cast = load_json_object(canonical_cast)
    screenplay_sha256 = sha256_file(canonical_screenplay)
    validate_screenplay(screenplay)
    validate_cast_registry(cast)
    try:
        validate_cast_decision_artifacts(cast, root)
    except CastAcceptanceError as error:
        raise RenderContractError(str(error)) from error
    cast_sha256 = sha256_file(canonical_cast)
    if screenplay["cast_sha256"] != cast_sha256:
        raise RenderContractError(
            "screenplay.cast_sha256 does not match the canonical cast file"
        )

    dependencies = {
        "english": (
            f"raw/plato/english/{dialogue}.txt",
            screenplay["source_hashes"]["english"],
        ),
        "stephanus": (
            f"derived/plato/stephanus-english/{dialogue}.toon",
            screenplay["source_hashes"]["stephanus"],
        ),
        "commentary": (
            f"wiki/commentary/{dialogue}.md",
            screenplay["commentary_sha256"],
        ),
        "commentary quality audit": (
            f"wiki/commentary-audits/{dialogue}.json",
            screenplay["commentary_quality_audit_sha256"],
        ),
    }
    for label, (relative_path, digest) in dependencies.items():
        _verify_dependency(root, relative_path, digest, label)

    commentary_quality_relative = f"wiki/commentary-audits/{dialogue}.json"
    commentary_quality_validation = validate_commentary_quality_manifest(
        root / commentary_quality_relative,
        dialogue=dialogue,
        repo_root=root,
    )

    attribution_match = GENERATED_ATTRIBUTION_VERSION_RE.fullmatch(
        screenplay["generator_version"]
    )
    if attribution_match is None:
        raise RenderContractError(
            "production screenplay generator_version must bind an accepted attribution SHA-256"
        )
    attribution_sha256 = attribution_match.group(1)
    attribution_relative = f"audio/speaker-attributions/{dialogue}.json"
    attribution_path = _verify_dependency(
        root, attribution_relative, attribution_sha256, "accepted attribution"
    )
    attribution = load_json_object(attribution_path)
    if (
        attribution.get("schema_version") != 2
        or attribution.get("voice_policy")
        != "reported-speech-inherits-active-character-v1"
        or attribution.get("status") != "accepted"
        or attribution.get("dialogue") != dialogue
    ):
        raise RenderContractError(
            "screenplay attribution dependency is not accepted for this dialogue"
        )
    screenplay_validation = validate_audio_screenplay_artifact(
        dialogue=dialogue,
        repo_root=root,
    )
    if sha256_file(canonical_screenplay) != screenplay_sha256:
        raise RenderContractError("canonical screenplay changed during preflight")
    if sha256_file(canonical_cast) != cast_sha256:
        raise RenderContractError("canonical cast changed during preflight")
    for label, (relative_path, digest) in dependencies.items():
        _verify_dependency(root, relative_path, digest, label)
    _verify_dependency(
        root,
        attribution_relative,
        attribution_sha256,
        "accepted attribution",
    )
    evidence = {
        "screenplay_path": f"audio/scripts/{dialogue}.json",
        "screenplay_sha256": screenplay_sha256,
        "cast_path": "audio/cast.json",
        "cast_sha256": cast_sha256,
        "commentary_quality_audit_path": commentary_quality_relative,
        "commentary_quality_audit_sha256": screenplay[
            "commentary_quality_audit_sha256"
        ],
        "commentary_quality_validation": commentary_quality_validation,
        "screenplay_validation": screenplay_validation,
        "accepted_attribution_path": attribution_relative,
        "accepted_attribution_sha256": attribution_sha256,
    }
    return screenplay, cast, evidence


def split_text(text: str, limit: int = MAX_CHUNK_CHARACTERS) -> list[str]:
    """Greedily split on semantic punctuation, then on word boundaries."""

    if limit < 40:
        raise ValueError("chunk limit must be at least 40 characters")
    if len(text) <= limit:
        return [text]
    words = text.split(" ")
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = start
        length = 0
        while end < len(words):
            candidate_length = length + (1 if end > start else 0) + len(words[end])
            if candidate_length > limit:
                break
            length = candidate_length
            end += 1
        if end == start:
            raise RenderContractError(
                f"screenplay contains an unsplittable token longer than {limit} characters"
            )
        if end < len(words):
            minimum = start + max(1, (end - start) // 2)
            semantic = [
                index + 1
                for index in range(minimum, end)
                if re.search(r"[.!?;:,—][\"'’”)]*$", words[index])
            ]
            if semantic:
                end = semantic[-1]
        chunks.append(" ".join(words[start:end]))
        start = end
    if " ".join(chunks) != text:
        raise AssertionError("chunker failed its lossless round-trip invariant")
    return chunks


def _validate_targeted_synthesis_overrides() -> None:
    """Validate the renderer-owned, synthesis-only repair policy."""

    if not isinstance(ENTRY_CHUNK_OVERRIDES, dict):
        raise RenderContractError("entry chunk overrides must be an object")
    for entry_id, chunks in ENTRY_CHUNK_OVERRIDES.items():
        if (
            not isinstance(entry_id, str)
            or SAFE_ID_RE.fullmatch(entry_id) is None
            or not isinstance(chunks, list)
            or not chunks
        ):
            raise RenderContractError("entry chunk override fields are invalid")
        for index, chunk in enumerate(chunks):
            text = _nonempty_string(
                chunk, f"entry chunk override {entry_id} part {index}"
            )
            if (
                text != text.strip()
                or re.search(r"\s{2,}", text)
                or len(text) > MAX_CHUNK_CHARACTERS
            ):
                raise RenderContractError(
                    f"entry chunk override {entry_id} part {index} is not "
                    "normalized and bounded"
                )

    if not isinstance(SYNTHESIS_TEXT_OVERRIDES, dict):
        raise RenderContractError("synthesis text overrides must be an object")
    unknown_entries = sorted(
        set(SYNTHESIS_TEXT_OVERRIDES) - set(ENTRY_CHUNK_OVERRIDES)
    )
    if unknown_entries:
        raise RenderContractError(
            "synthesis text overrides lack exact chunk evidence: "
            + ", ".join(unknown_entries)
        )
    for entry_id, parts in SYNTHESIS_TEXT_OVERRIDES.items():
        if not isinstance(parts, dict) or not parts:
            raise RenderContractError(
                f"synthesis text override {entry_id} parts are invalid"
            )
        chunks = ENTRY_CHUNK_OVERRIDES[entry_id]
        for raw_index, synthesis_value in parts.items():
            if (
                not isinstance(raw_index, str)
                or not raw_index.isdigit()
                or str(int(raw_index)) != raw_index
            ):
                raise RenderContractError(
                    f"synthesis text override {entry_id} part index is invalid"
                )
            index = int(raw_index)
            if index >= len(chunks):
                raise RenderContractError(
                    f"synthesis text override {entry_id} part {index} is unknown"
                )
            canonical = chunks[index]
            synthesis = _nonempty_string(
                synthesis_value,
                f"synthesis text override {entry_id} part {index}",
            )
            if synthesis == canonical:
                raise RenderContractError(
                    f"synthesis text override {entry_id} part {index} is redundant"
                )
            if len(synthesis) != len(canonical) or any(
                source != target and source.casefold() != target.casefold()
                for source, target in zip(canonical, synthesis, strict=True)
            ):
                raise RenderContractError(
                    f"synthesis text override {entry_id} part {index} changes "
                    "canonical content rather than case"
                )


def _entry_chunks(entry_id: str, text: str) -> list[str]:
    chunks = ENTRY_CHUNK_OVERRIDES.get(entry_id)
    if chunks is None:
        return split_text(text)
    if " ".join(chunks) != text:
        raise RenderContractError(
            f"entry chunk override does not reproduce {entry_id}"
        )
    return chunks


def _fragment_synthesis_text(entry_id: str, part_index: int, text: str) -> str:
    return SYNTHESIS_TEXT_OVERRIDES.get(entry_id, {}).get(str(part_index), text)


def cadence_ms(
    intent: str,
    previous_text: str | None,
    *,
    same_speaker: bool,
) -> int:
    """Compatibility helper exposing the effective pause portion of the policy."""

    if intent not in CADENCE_INTENTS:
        raise RenderContractError(f"unknown cadence intent {intent!r}")
    if previous_text is None or intent == "none":
        return 0
    if intent == "chapter":
        return BOUNDARY_POLICY["chapter_boundary"]["pause_ms"]
    if intent == "commentary":
        return BOUNDARY_POLICY["commentary_boundary"]["pause_ms"]
    if same_speaker:
        return BOUNDARY_POLICY["same_speaker_continuation"]["pause_ms"]
    policy = BOUNDARY_POLICY["speaker_change"]
    base = policy["pause_ms"]
    if intent == "short_reply":
        base -= policy["short_reply_subtract_ms"]
    elif intent == "reflective":
        base += policy["reflective_add_ms"]
    stripped = previous_text.rstrip("\"'’”)")
    if stripped.endswith(("?", "!")):
        base += policy["question_or_exclamation_add_ms"]
    elif stripped.endswith("."):
        base += policy["period_add_ms"]
    return min(base, policy["maximum_pause_ms"])


def boundary_decision(
    previous_entry: dict[str, Any] | None,
    current_entry: dict[str, Any],
) -> dict[str, Any]:
    """Return one explicit, bounded pause-or-crossfade decision for a join."""

    if previous_entry is None:
        return {
            "kind": "start",
            "pause_ms": 0,
            "crossfade_ms": 0,
        }
    if (
        previous_entry["chapter_id"] != current_entry["chapter_id"]
        or current_entry["cadence_intent"] == "chapter"
        or current_entry["kind"] == "heading"
    ):
        policy = BOUNDARY_POLICY["chapter_boundary"]
        return {
            "kind": "chapter-boundary",
            "pause_ms": policy["pause_ms"],
            "crossfade_ms": policy["crossfade_ms"],
        }
    if (
        previous_entry["kind"] == "commentary"
        or current_entry["kind"] == "commentary"
        or current_entry["cadence_intent"] == "commentary"
    ):
        policy = BOUNDARY_POLICY["commentary_boundary"]
        return {
            "kind": "commentary-boundary",
            "pause_ms": policy["pause_ms"],
            "crossfade_ms": policy["crossfade_ms"],
        }
    if previous_entry["character_id"] == current_entry["character_id"]:
        policy = BOUNDARY_POLICY["same_speaker_continuation"]
        return {
            "kind": "same-speaker-continuation",
            "pause_ms": policy["pause_ms"],
            "crossfade_ms": policy["crossfade_ms"],
        }
    policy = BOUNDARY_POLICY["speaker_change"]
    return {
        "kind": "speaker-change",
        "pause_ms": cadence_ms(
            current_entry["cadence_intent"],
            previous_entry["text"],
            same_speaker=False,
        ),
        "crossfade_ms": policy["crossfade_ms"],
    }


def _render_units(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    _validate_targeted_synthesis_overrides()
    fragments: list[dict[str, Any]] = []
    for entry in entries:
        chunks = _entry_chunks(entry["id"], entry["text"])
        for part_index, text in enumerate(chunks):
            fragments.append(
                {
                    "entry": entry,
                    "part_index": part_index,
                    "part_count": len(chunks),
                    "text": text,
                    "synthesis_text": _fragment_synthesis_text(
                        entry["id"], part_index, text
                    ),
                }
            )

    units: list[list[dict[str, Any]]] = []
    for fragment in fragments:
        if units:
            prior = units[-1]
            prior_entry = prior[-1]["entry"]
            entry = fragment["entry"]
            combined_length = sum(len(item["text"]) for item in prior) + len(prior)
            combined_length += len(fragment["text"])
            safe_continuation = (
                all(item["part_count"] == 1 for item in prior)
                and fragment["part_count"] == 1
                and prior_entry["id"] != entry["id"]
                and prior_entry["chapter_id"] == entry["chapter_id"]
                and prior_entry["character_id"] == entry["character_id"]
                and prior_entry["kind"] == entry["kind"]
                and entry["cadence_intent"] == "continuation"
                and combined_length <= MAX_CHUNK_CHARACTERS
            )
            if safe_continuation:
                prior.append(fragment)
                continue
        units.append([fragment])

    rendered: list[dict[str, Any]] = []
    for fragments_in_unit in units:
        text = " ".join(fragment["text"] for fragment in fragments_in_unit)
        synthesis_text = " ".join(
            fragment["synthesis_text"] for fragment in fragments_in_unit
        )
        cursor = 0
        spans: list[dict[str, Any]] = []
        entries_in_unit: list[dict[str, Any]] = []
        for fragment in fragments_in_unit:
            start = cursor
            end = start + len(fragment["text"])
            spans.append(
                {
                    "entry_id": fragment["entry"]["id"],
                    "part_index": fragment["part_index"],
                    "part_count": fragment["part_count"],
                    "text": fragment["text"],
                    "start_character": start,
                    "end_character": end,
                }
            )
            if (
                not entries_in_unit
                or entries_in_unit[-1]["id"] != fragment["entry"]["id"]
            ):
                entries_in_unit.append(fragment["entry"])
            cursor = end + 1
        if text != " ".join(span["text"] for span in spans):
            raise AssertionError("render unit text lost its fragment round trip")
        rendered.append(
            {
                "chapter_id": entries_in_unit[0]["chapter_id"],
                "character_id": entries_in_unit[0]["character_id"],
                "kind": (
                    "same-speaker-continuation"
                    if len(entries_in_unit) > 1
                    else "entry-fragment"
                    if spans[0]["part_count"] > 1
                    else "single-entry"
                ),
                "entries": entries_in_unit,
                "text": text,
                "synthesis_text": synthesis_text,
                "spans": spans,
            }
        )
    return rendered


def select_chapters(screenplay: dict[str, Any], selection: str) -> list[str]:
    available = [chapter["id"] for chapter in screenplay["chapters"]]
    if selection == "all":
        return available
    selected = [item.strip() for item in selection.split(",") if item.strip()]
    if not selected:
        raise RenderContractError("--chapters must be 'all' or a comma-separated list")
    if len(selected) != len(set(selected)):
        raise RenderContractError("--chapters contains a duplicate chapter")
    unknown = sorted(set(selected) - set(available))
    if unknown:
        raise RenderContractError(f"unknown chapters: {', '.join(unknown)}")
    selected_set = set(selected)
    return [chapter_id for chapter_id in available if chapter_id in selected_set]


def _validate_authority_evidence(
    value: Any, *, authority: str, location: str
) -> dict[str, Any]:
    if (
        not isinstance(value, dict)
        or set(value) != COMMENTARY_QUALITY_VALIDATION_FIELDS
        or value.get("authority") != authority
        or not isinstance(value.get("bun_version"), str)
        or not value["bun_version"]
    ):
        raise RenderContractError(f"{location}: invalid authoritative evidence")
    for field in (
        "helper_sha256",
        "validator_sha256",
        "harness_typescript_sha256",
        "harness_javascript_shadow_sha256",
        "bun_sha256",
    ):
        _sha256(value.get(field), f"{location}.{field}")
    return value


def build_render_plan(
    screenplay: dict[str, Any],
    cast: dict[str, Any],
    *,
    acceptance: dict[str, Any],
    renderer_code_sha256: str,
    runtime_provenance: dict[str, Any],
    repo_root: Path,
    reference_overrides: dict[str, Path],
    chapter_selection: str = "all",
) -> dict[str, Any]:
    validate_screenplay(screenplay)
    voices = validate_cast_registry(cast)
    if set(acceptance) != {
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
    }:
        raise RenderContractError("accepted screenplay evidence has invalid fields")
    expected_script_path = f"audio/scripts/{screenplay['dialogue']}.json"
    expected_attribution_path = (
        f"audio/speaker-attributions/{screenplay['dialogue']}.json"
    )
    expected_quality_path = f"wiki/commentary-audits/{screenplay['dialogue']}.json"
    quality_validation = _validate_authority_evidence(
        acceptance["commentary_quality_validation"],
        authority="packages/harness/src/wiki/commentary-quality-audit.ts",
        location="acceptance.commentary_quality_validation",
    )
    screenplay_validation = _validate_authority_evidence(
        acceptance["screenplay_validation"],
        authority="packages/harness/src/audio-production.ts",
        location="acceptance.screenplay_validation",
    )
    validate_runtime_provenance(runtime_provenance)
    attribution_match = GENERATED_ATTRIBUTION_VERSION_RE.fullmatch(
        screenplay["generator_version"]
    )
    if (
        acceptance["screenplay_path"] != expected_script_path
        or acceptance["cast_path"] != "audio/cast.json"
        or acceptance["commentary_quality_audit_path"] != expected_quality_path
        or acceptance["accepted_attribution_path"] != expected_attribution_path
        or _sha256(acceptance["screenplay_sha256"], "acceptance.screenplay_sha256")
        != acceptance["screenplay_sha256"]
        or _sha256(acceptance["cast_sha256"], "acceptance.cast_sha256")
        != acceptance["cast_sha256"]
        or _sha256(
            acceptance["commentary_quality_audit_sha256"],
            "acceptance.commentary_quality_audit_sha256",
        )
        != acceptance["commentary_quality_audit_sha256"]
        or _sha256(
            acceptance["accepted_attribution_sha256"],
            "acceptance.accepted_attribution_sha256",
        )
        != acceptance["accepted_attribution_sha256"]
        or attribution_match is None
        or attribution_match.group(1) != acceptance["accepted_attribution_sha256"]
    ):
        raise RenderContractError(
            "render plan requires canonical accepted screenplay and attribution evidence"
        )
    if (
        quality_validation["harness_typescript_sha256"]
        != screenplay_validation["harness_typescript_sha256"]
        or quality_validation["harness_javascript_shadow_sha256"]
        != screenplay_validation["harness_javascript_shadow_sha256"]
        or quality_validation["bun_sha256"] != screenplay_validation["bun_sha256"]
        or quality_validation["bun_version"] != screenplay_validation["bun_version"]
    ):
        raise RenderContractError(
            "authoritative screenplay and quality validations used different runtimes"
        )
    cast_file_sha256 = acceptance["cast_sha256"]
    if screenplay["cast_sha256"] != cast_file_sha256:
        raise RenderContractError(
            "screenplay.cast_sha256 does not match the canonical cast file; regenerate the screenplay"
        )
    if (
        screenplay["commentary_quality_audit_sha256"]
        != acceptance["commentary_quality_audit_sha256"]
    ):
        raise RenderContractError(
            "screenplay commentary quality audit does not match accepted validation evidence"
        )
    _sha256(renderer_code_sha256, "renderer_code_sha256")
    chapter_ids = select_chapters(screenplay, chapter_selection)
    selected = set(chapter_ids)
    entries = [
        entry for entry in screenplay["entries"] if entry["chapter_id"] in selected
    ]
    used_characters = list(
        dict.fromkeys(entry["character_id"] for entry in screenplay["entries"])
    )
    unknown_overrides = sorted(set(reference_overrides) - set(used_characters))
    if unknown_overrides:
        raise RenderContractError(
            "reference overrides name characters outside the screenplay: "
            + ", ".join(unknown_overrides)
        )
    recipes: dict[str, dict[str, Any]] = {}
    references: dict[str, Path] = {}
    for character_id in used_characters:
        voice = voices.get(character_id)
        if voice is None:
            raise RenderContractError(
                f"screenplay uses character without cast entry: {character_id}"
            )
        recipes[character_id] = _selected_dots_recipe(voice, character_id)
        references[character_id] = resolve_reference_path(
            voice, character_id, repo_root, reference_overrides
        )

    tasks: list[dict[str, Any]] = []
    for order, unit in enumerate(_render_units(entries)):
        character_id = unit["character_id"]
        task_input = {
            "schema_version": RENDER_TASK_SCHEMA_VERSION,
            "renderer": {
                "name": RENDERER_NAME,
                "version": RENDERER_VERSION,
                "code_sha256": renderer_code_sha256,
                "dots_package_commit": DOTS_PACKAGE_COMMIT,
                "packages": PACKAGE_PINS,
                "max_generate_length": MAX_GENERATE_LENGTH,
                "max_render_unit_characters": MAX_CHUNK_CHARACTERS,
                "entry_chunk_overrides": copy.deepcopy(ENTRY_CHUNK_OVERRIDES),
                "synthesis_text_overrides": copy.deepcopy(
                    SYNTHESIS_TEXT_OVERRIDES
                ),
            },
            "runtime_provenance": copy.deepcopy(runtime_provenance),
            "screenplay": {
                "dialogue": screenplay["dialogue"],
                "screenplay_sha256": acceptance["screenplay_sha256"],
                "source_hashes": screenplay["source_hashes"],
                "commentary_sha256": screenplay["commentary_sha256"],
                "commentary_quality_audit_sha256": screenplay[
                    "commentary_quality_audit_sha256"
                ],
                "cast_sha256": cast_file_sha256,
                "generator_version": screenplay["generator_version"],
                "entries": unit["entries"],
            },
            "utterance": {
                "unit_kind": unit["kind"],
                "text": unit["text"],
                "synthesis_text": unit["synthesis_text"],
                "spans": unit["spans"],
            },
            "voice": recipes[character_id],
            "audio": {
                "sample_rate": SAMPLE_RATE,
                "channels": 1,
                "wav_subtype": WAV_SUBTYPE,
                "trim_threshold_db": TRIM_THRESHOLD_DB,
                "trim_safety_ms": TRIM_SAFETY_MS,
            },
        }
        tasks.append(
            {
                "order": order,
                "input_sha256": content_sha256(task_input),
                "input": task_input,
                "reference_path": str(references[character_id]),
            }
        )
    plan = {
        "schema_version": RENDER_PLAN_SCHEMA_VERSION,
        "status": RENDER_PLAN_STATUS,
        "dialogue": screenplay["dialogue"],
        "scope": "full-dialogue" if chapter_selection == "all" else "chapter-subset",
        "acceptance": copy.deepcopy(acceptance),
        "runtime_provenance": copy.deepcopy(runtime_provenance),
        "cast_completion": {
            "complete_for_screenplay": True,
            "character_ids": used_characters,
        },
        "chapters": chapter_ids,
        "boundary_policy": copy.deepcopy(BOUNDARY_POLICY),
        "tasks": tasks,
    }
    plan["plan_sha256"] = content_sha256(plan)
    validate_render_plan(plan)
    return plan


def _task_entries(task: dict[str, Any]) -> list[dict[str, Any]]:
    try:
        entries = task["input"]["screenplay"]["entries"]
    except (KeyError, TypeError) as error:
        raise RenderContractError("render task has no screenplay entries") from error
    if not isinstance(entries, list) or not entries:
        raise RenderContractError("render task screenplay entries must be non-empty")
    return entries


def _validate_task_voice(voice: Any) -> tuple[str, str]:
    if not isinstance(voice, dict):
        raise RenderContractError("render task voice must be an object")
    try:
        reference = voice["reference"]
        audition = voice["audition"]
        generation = voice["generation"]
        selection = voice["selection"]
        cast_voice = {
            "characterId": voice["character_id"],
            "displayName": voice["display_name"],
            "status": voice["status"],
            "engine": voice["engine"],
            "model": voice["model"],
            "mode": voice["mode"],
            "seed": voice["seed"],
            "reference": {
                "sourceUrl": reference["source_url"],
                "sourceRegistryPath": reference["source_registry_path"],
                "sourceRegistrySha256": reference["source_registry_sha256"],
                "sourceDialogue": reference["source_dialogue"],
                "sourceVideoId": reference["source_video_id"],
                "sourceCharacterId": reference["source_character_id"],
                "videoStartSeconds": reference["video_start_seconds"],
                "videoEndSeconds": reference["video_end_seconds"],
                "localDurationSeconds": reference["local_duration_seconds"],
                "localSha256": reference["sha256"],
                "promptText": reference["prompt_text"],
                "referenceAsr": reference["reference_asr"],
                "speakerPurityEvidencePath": reference[
                    "speaker_purity_evidence_path"
                ],
                "speakerPurityEvidenceSha256": reference[
                    "speaker_purity_evidence_sha256"
                ],
                "speakerPurityProofRecordId": reference[
                    "speaker_purity_proof_record_id"
                ],
                "speakerPuritySourceAgreementSha256": reference[
                    "speaker_purity_source_agreement_sha256"
                ],
                "speakerPurityMethod": reference["speaker_purity_method"],
                "dominantSpeakerCoverage": reference[
                    "dominant_speaker_coverage"
                ],
                "competingSpeakerCoverage": reference[
                    "competing_speaker_coverage"
                ],
                "uncoveredSpeakerCoverage": reference[
                    "uncovered_speaker_coverage"
                ],
            },
            "generation": {
                "numSteps": generation["num_steps"],
                "guidanceScale": generation["guidance_scale"],
                "speakerScale": generation["speaker_scale"],
                "language": generation["language"],
                "precision": generation["precision"],
            },
            "audition": {
                "relativePath": audition["relative_path"],
                "sha256": audition["sha256"],
                "durationSeconds": audition["duration_seconds"],
                "expectedWords": audition["expected_words"],
                "ordinaryWordErrors": audition["ordinary_word_errors"],
                "ordinaryWordErrorRate": audition["ordinary_word_error_rate"],
                "asrEvidencePath": audition["asr_evidence_path"],
                "asrEvidenceSha256": audition["asr_evidence_sha256"],
                "meanSpeakerCosineSimilarity": audition[
                    "mean_speaker_cosine_similarity"
                ],
                "minimumWindowSpeakerCosineSimilarity": audition[
                    "minimum_window_speaker_cosine_similarity"
                ],
                "acousticEvidencePath": audition["acoustic_evidence_path"],
                "acousticEvidenceSha256": audition[
                    "acoustic_evidence_sha256"
                ],
                "clippedSamples": audition["clipped_samples"],
                "truePeakDbtp": audition["true_peak_dbtp"],
                "peakAmplitude": audition["peak_amplitude"],
            },
            "selection": {
                "basis": selection["basis"],
                "policy": selection["policy"],
                "acceptedAt": selection["accepted_at"],
                "label": selection["label"],
                "allGatesPassed": selection["all_gates_passed"],
                "candidateSelection": selection["candidate_selection"],
                "evaluatedCandidateCount": selection[
                    "evaluated_candidate_count"
                ],
                "passingCandidateCount": selection["passing_candidate_count"],
                "selectedRank": selection["selected_rank"],
                "decisionPath": selection["decision_path"],
                "decisionSha256": selection["decision_sha256"],
                "sourceAssignment": selection["source_assignment"],
            },
        }
    except (KeyError, TypeError) as error:
        raise RenderContractError("render task voice fields are invalid") from error
    try:
        validate_selected_voice(cast_voice, location="render task voice")
    except CastAcceptanceError as error:
        raise RenderContractError(str(error)) from error
    return cast_voice["characterId"], cast_voice["reference"]["localSha256"]


def _legacy_validate_task_voice(voice: Any) -> tuple[str, str]:
    if not isinstance(voice, dict) or set(voice) != {
        "character_id",
        "engine",
        "mode",
        "model",
        "seed",
        "reference",
        "generation",
        "audition",
        "selection",
    }:
        raise RenderContractError("render task voice fields are invalid")
    character_id = voice["character_id"]
    seed = voice["seed"]
    if (
        not isinstance(character_id, str)
        or CHARACTER_ID_RE.fullmatch(character_id) is None
        or voice["engine"] != "dots.tts-soar"
        or voice["mode"] != "continuation-voice-cloning"
        or isinstance(seed, bool)
        or not isinstance(seed, int)
        or seed < 0
        or voice["model"]
        != {"repository": MODEL_REPOSITORY, "revision": MODEL_REVISION}
    ):
        raise RenderContractError("render task voice identity or model is invalid")

    reference = voice["reference"]
    if not isinstance(reference, dict) or set(reference) != {
        "source_url",
        "video_start_seconds",
        "video_end_seconds",
        "local_duration_seconds",
        "sha256",
        "prompt_text",
    }:
        raise RenderContractError("render task voice reference fields are invalid")
    source_url = _nonempty_string(reference["source_url"], "render task source URL")
    parsed_url = urlparse(source_url)
    start = _finite_number(
        reference["video_start_seconds"],
        "render task reference video start",
        minimum=0,
    )
    end = _finite_number(
        reference["video_end_seconds"],
        "render task reference video end",
        minimum=0,
    )
    _finite_number(
        reference["local_duration_seconds"],
        "render task reference duration",
        minimum=0.001,
    )
    reference_sha = _sha256(reference["sha256"], "render task reference SHA-256")
    _nonempty_string(reference["prompt_text"], "render task reference prompt")
    if (
        parsed_url.scheme not in {"http", "https"}
        or not parsed_url.netloc
        or end <= start
    ):
        raise RenderContractError("render task voice reference provenance is invalid")

    generation = voice["generation"]
    if not isinstance(generation, dict) or set(generation) != {
        "num_steps",
        "guidance_scale",
        "speaker_scale",
        "language",
        "precision",
    }:
        raise RenderContractError("render task voice generation fields are invalid")
    if (
        isinstance(generation["num_steps"], bool)
        or not isinstance(generation["num_steps"], int)
        or generation["num_steps"] <= 0
        or generation["language"] != "EN"
        or generation["precision"] != "bfloat16"
    ):
        raise RenderContractError("render task voice generation recipe is invalid")
    for field in ("guidance_scale", "speaker_scale"):
        _finite_number(
            generation[field],
            f"render task generation {field}",
            minimum=0.000001,
        )

    audition = voice["audition"]
    if not isinstance(audition, dict) or set(audition) != {
        "relative_path",
        "sha256",
        "listening_mp3_path",
        "listening_mp3_sha256",
        "expected_words",
        "ordinary_word_errors",
        "mean_speaker_cosine_similarity",
    }:
        raise RenderContractError("render task voice audition fields are invalid")
    _repo_relative_path_string(audition["relative_path"], "render task audition path")
    _sha256(audition["sha256"], "render task audition SHA-256")
    _repo_relative_path_string(
        audition["listening_mp3_path"], "render task listening path"
    )
    _sha256(audition["listening_mp3_sha256"], "render task listening SHA-256")
    similarity = _finite_number(
        audition["mean_speaker_cosine_similarity"],
        "render task audition similarity",
        minimum=-1,
    )
    if (
        isinstance(audition["expected_words"], bool)
        or not isinstance(audition["expected_words"], int)
        or audition["expected_words"] <= 0
        or isinstance(audition["ordinary_word_errors"], bool)
        or not isinstance(audition["ordinary_word_errors"], int)
        or audition["ordinary_word_errors"] != 0
        or similarity > 1
    ):
        raise RenderContractError("render task audition evidence is invalid")

    selection = voice["selection"]
    if not isinstance(selection, dict) or set(selection) != {
        "basis",
        "selected_at",
        "label",
    }:
        raise RenderContractError("render task voice selection fields are invalid")
    selected_at = selection["selected_at"]
    if (
        selection["basis"] != "human-listening"
        or not isinstance(selected_at, str)
        or DATE_RE.fullmatch(selected_at) is None
    ):
        raise RenderContractError("render task voice selection is invalid")
    _nonempty_string(selection["label"], "render task voice selection label")
    return character_id, reference_sha


def _validate_render_task(task: dict[str, Any], expected_order: int) -> None:
    if set(task) != {"order", "input_sha256", "input", "reference_path"}:
        raise RenderContractError("render task fields are invalid")
    if (
        isinstance(task["order"], bool)
        or not isinstance(task["order"], int)
        or task["order"] < 0
        or task["order"] != expected_order
    ):
        raise RenderContractError("render task order is not contiguous")
    digest = _sha256(task["input_sha256"], "render task input_sha256")
    if not isinstance(task["input"], dict) or content_sha256(task["input"]) != digest:
        raise RenderContractError("render task content address is inconsistent")
    task_input = task["input"]
    if task_input.get("schema_version") != RENDER_TASK_SCHEMA_VERSION:
        raise RenderContractError("render task schema version is stale")
    if set(task_input) != {
        "schema_version",
        "renderer",
        "runtime_provenance",
        "screenplay",
        "utterance",
        "voice",
        "audio",
    }:
        raise RenderContractError("render task input fields are invalid")
    renderer = task_input["renderer"]
    if not isinstance(renderer, dict) or set(renderer) != {
        "name",
        "version",
        "code_sha256",
        "dots_package_commit",
        "packages",
        "max_generate_length",
        "max_render_unit_characters",
        "entry_chunk_overrides",
        "synthesis_text_overrides",
    }:
        raise RenderContractError("render task renderer evidence is invalid")
    if (
        renderer["name"] != RENDERER_NAME
        or renderer["version"] != RENDERER_VERSION
        or renderer["dots_package_commit"] != DOTS_PACKAGE_COMMIT
        or renderer["packages"] != PACKAGE_PINS
        or renderer["max_generate_length"] != MAX_GENERATE_LENGTH
        or renderer["max_render_unit_characters"] != MAX_CHUNK_CHARACTERS
        or renderer["entry_chunk_overrides"] != ENTRY_CHUNK_OVERRIDES
        or renderer["synthesis_text_overrides"] != SYNTHESIS_TEXT_OVERRIDES
    ):
        raise RenderContractError("render task renderer evidence is stale")
    _validate_targeted_synthesis_overrides()
    _sha256(renderer["code_sha256"], "render task renderer code_sha256")
    validate_runtime_provenance(task_input["runtime_provenance"])
    screenplay_input = task_input["screenplay"]
    if not isinstance(screenplay_input, dict) or set(screenplay_input) != {
        "dialogue",
        "screenplay_sha256",
        "source_hashes",
        "commentary_sha256",
        "commentary_quality_audit_sha256",
        "cast_sha256",
        "generator_version",
        "entries",
    }:
        raise RenderContractError("render task screenplay evidence is invalid")
    if (
        not isinstance(screenplay_input["dialogue"], str)
        or CHARACTER_ID_RE.fullmatch(screenplay_input["dialogue"]) is None
    ):
        raise RenderContractError("render task dialogue id is invalid")
    _sha256(screenplay_input["screenplay_sha256"], "render task screenplay SHA-256")
    _sha256(screenplay_input["commentary_sha256"], "render task commentary SHA-256")
    _sha256(
        screenplay_input["commentary_quality_audit_sha256"],
        "render task commentary quality audit SHA-256",
    )
    _sha256(screenplay_input["cast_sha256"], "render task cast SHA-256")
    if (
        not isinstance(screenplay_input["source_hashes"], dict)
        or set(screenplay_input["source_hashes"]) != SOURCE_HASH_FIELDS
    ):
        raise RenderContractError("render task source hashes are invalid")
    for name in sorted(SOURCE_HASH_FIELDS):
        _sha256(
            screenplay_input["source_hashes"][name],
            f"render task source hash {name}",
        )
    if (
        not isinstance(screenplay_input["generator_version"], str)
        or GENERATED_ATTRIBUTION_VERSION_RE.fullmatch(
            screenplay_input["generator_version"]
        )
        is None
    ):
        raise RenderContractError("render task generator attribution is invalid")
    audio = task_input["audio"]
    if audio != {
        "sample_rate": SAMPLE_RATE,
        "channels": 1,
        "wav_subtype": WAV_SUBTYPE,
        "trim_threshold_db": TRIM_THRESHOLD_DB,
        "trim_safety_ms": TRIM_SAFETY_MS,
    }:
        raise RenderContractError("render task audio contract is stale")
    utterance = task_input.get("utterance")
    if not isinstance(utterance, dict) or set(utterance) != {
        "unit_kind",
        "text",
        "synthesis_text",
        "spans",
    }:
        raise RenderContractError("render task utterance fields are invalid")
    text = _nonempty_string(utterance["text"], "render task utterance text")
    synthesis_text = _nonempty_string(
        utterance["synthesis_text"], "render task utterance synthesis_text"
    )
    if len(text) > MAX_CHUNK_CHARACTERS:
        raise RenderContractError("render task exceeds the bounded unit size")
    if len(synthesis_text) > MAX_CHUNK_CHARACTERS:
        raise RenderContractError("render task synthesis exceeds the bounded unit size")
    spans = utterance["spans"]
    if not isinstance(spans, list) or not spans:
        raise RenderContractError("render task utterance spans are invalid")
    entries = _task_entries(task)
    entry_fields = {
        "id",
        "chapter_id",
        "kind",
        "character_id",
        "text",
        "anchor",
        "cadence_intent",
    }
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict) or set(entry) != entry_fields:
            raise RenderContractError(
                f"render task screenplay entry {index} fields are invalid"
            )
        if (
            not isinstance(entry["id"], str)
            or SAFE_ID_RE.fullmatch(entry["id"]) is None
            or not isinstance(entry["chapter_id"], str)
            or SAFE_ID_RE.fullmatch(entry["chapter_id"]) is None
            or not isinstance(entry["character_id"], str)
            or CHARACTER_ID_RE.fullmatch(entry["character_id"]) is None
            or not isinstance(entry["kind"], str)
            or entry["kind"] not in ENTRY_KINDS
            or not isinstance(entry["cadence_intent"], str)
            or entry["cadence_intent"] not in CADENCE_INTENTS
            or not isinstance(entry["anchor"], dict)
        ):
            raise RenderContractError(
                f"render task screenplay entry {index} is invalid"
            )
        entry_text = _nonempty_string(
            entry["text"], f"render task screenplay entry {index} text"
        )
        if entry_text != entry_text.strip() or re.search(r"\s{2,}", entry_text):
            raise RenderContractError(
                f"render task screenplay entry {index} text is not normalized"
            )
    entry_by_id = {entry.get("id"): entry for entry in entries}
    if len(entry_by_id) != len(entries) or None in entry_by_id:
        raise RenderContractError("render task screenplay entry ids are invalid")
    expected_start = 0
    span_entry_ids: list[str] = []
    for index, span in enumerate(spans):
        if not isinstance(span, dict) or set(span) != {
            "entry_id",
            "part_index",
            "part_count",
            "text",
            "start_character",
            "end_character",
        }:
            raise RenderContractError("render task utterance span fields are invalid")
        span_text = _nonempty_string(span["text"], f"render span {index} text")
        entry_id = span["entry_id"]
        part_index = span["part_index"]
        part_count = span["part_count"]
        start = span["start_character"]
        end = span["end_character"]
        if (
            not isinstance(entry_id, str)
            or entry_id not in entry_by_id
            or isinstance(part_index, bool)
            or not isinstance(part_index, int)
            or isinstance(part_count, bool)
            or not isinstance(part_count, int)
            or part_count <= 0
            or not 0 <= part_index < part_count
            or isinstance(start, bool)
            or not isinstance(start, int)
            or isinstance(end, bool)
            or not isinstance(end, int)
            or start != expected_start
            or end != start + len(span_text)
            or text[start:end] != span_text
        ):
            raise RenderContractError("render task utterance span offsets are invalid")
        expected_chunks = _entry_chunks(entry_id, entry_by_id[entry_id]["text"])
        if (
            part_count != len(expected_chunks)
            or span_text != expected_chunks[part_index]
        ):
            raise RenderContractError(
                "render task span differs from its screenplay entry"
            )
        if not span_entry_ids or span_entry_ids[-1] != entry_id:
            span_entry_ids.append(entry_id)
        expected_start = end + 1
    if expected_start - 1 != len(text) or span_entry_ids != list(entry_by_id):
        raise RenderContractError("render task spans do not reproduce entry order")
    expected_synthesis_text = " ".join(
        _fragment_synthesis_text(
            span["entry_id"], span["part_index"], span["text"]
        )
        for span in spans
    )
    if synthesis_text != expected_synthesis_text:
        raise RenderContractError(
            "render task synthesis text differs from its exact registered override"
        )
    character_ids = {entry.get("character_id") for entry in entries}
    chapter_ids = {entry.get("chapter_id") for entry in entries}
    if len(character_ids) != 1 or len(chapter_ids) != 1:
        raise RenderContractError("render unit mixes speakers or chapters")
    unit_kind = utterance["unit_kind"]
    if unit_kind not in {
        "single-entry",
        "entry-fragment",
        "same-speaker-continuation",
    }:
        raise RenderContractError("render task unit kind is invalid")
    if (
        (
            unit_kind == "single-entry"
            and not (
                len(entries) == 1 and len(spans) == 1 and spans[0]["part_count"] == 1
            )
        )
        or (
            unit_kind == "entry-fragment"
            and not (
                len(entries) == 1 and len(spans) == 1 and spans[0]["part_count"] > 1
            )
        )
        or (
            unit_kind == "same-speaker-continuation"
            and not (
                len(entries) > 1
                and len(spans) == len(entries)
                and all(span["part_count"] == 1 for span in spans)
                and all(
                    entry["cadence_intent"] == "continuation" for entry in entries[1:]
                )
            )
        )
    ):
        raise RenderContractError("render task unit kind contradicts its spans")
    voice_character_id, reference_sha = _validate_task_voice(task_input.get("voice"))
    if voice_character_id not in character_ids:
        raise RenderContractError(
            "render unit voice differs from its screenplay entries"
        )
    reference_path = task["reference_path"]
    if not isinstance(reference_path, str) or not Path(reference_path).is_absolute():
        raise RenderContractError("render task reference_path must be absolute")
    reference = Path(reference_path)
    if reference.is_symlink() or not reference.is_file():
        raise RenderContractError("render task reference is missing or symlinked")
    if sha256_file(reference) != reference_sha:
        raise RenderContractError("render task reference hash mismatch")


def validate_render_plan(plan: dict[str, Any]) -> None:
    required = {
        "schema_version",
        "status",
        "plan_sha256",
        "dialogue",
        "scope",
        "acceptance",
        "runtime_provenance",
        "cast_completion",
        "chapters",
        "boundary_policy",
        "tasks",
    }
    if set(plan) != required:
        raise RenderContractError("render plan fields are invalid")
    if (
        plan["schema_version"] != RENDER_PLAN_SCHEMA_VERSION
        or plan["status"] != RENDER_PLAN_STATUS
        or plan["scope"] not in {"full-dialogue", "chapter-subset"}
        or plan["boundary_policy"] != BOUNDARY_POLICY
        or not isinstance(plan["dialogue"], str)
        or CHARACTER_ID_RE.fullmatch(plan["dialogue"]) is None
    ):
        raise RenderContractError(
            "render plan schema, status, scope, or policy is stale"
        )
    digest = _sha256(plan["plan_sha256"], "render plan plan_sha256")
    without_digest = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if content_sha256(without_digest) != digest:
        raise RenderContractError("render plan content address is inconsistent")
    if (
        not isinstance(plan["chapters"], list)
        or not plan["chapters"]
        or any(
            not isinstance(chapter_id, str) or SAFE_ID_RE.fullmatch(chapter_id) is None
            for chapter_id in plan["chapters"]
        )
        or len(set(plan["chapters"])) != len(plan["chapters"])
    ):
        raise RenderContractError("render plan chapters are invalid")
    acceptance = plan["acceptance"]
    if not isinstance(acceptance, dict) or set(acceptance) != {
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
    }:
        raise RenderContractError("render plan acceptance evidence is invalid")
    if (
        acceptance["screenplay_path"] != f"audio/scripts/{plan['dialogue']}.json"
        or acceptance["cast_path"] != "audio/cast.json"
        or acceptance["commentary_quality_audit_path"]
        != f"wiki/commentary-audits/{plan['dialogue']}.json"
        or acceptance["accepted_attribution_path"]
        != f"audio/speaker-attributions/{plan['dialogue']}.json"
    ):
        raise RenderContractError("render plan acceptance paths are not canonical")
    for field in (
        "screenplay_sha256",
        "cast_sha256",
        "commentary_quality_audit_sha256",
        "accepted_attribution_sha256",
    ):
        _sha256(acceptance[field], f"render plan acceptance {field}")
    quality_validation = _validate_authority_evidence(
        acceptance["commentary_quality_validation"],
        authority="packages/harness/src/wiki/commentary-quality-audit.ts",
        location="render plan commentary quality validation",
    )
    screenplay_validation = _validate_authority_evidence(
        acceptance["screenplay_validation"],
        authority="packages/harness/src/audio-production.ts",
        location="render plan screenplay validation",
    )
    if (
        quality_validation["harness_typescript_sha256"]
        != screenplay_validation["harness_typescript_sha256"]
        or quality_validation["harness_javascript_shadow_sha256"]
        != screenplay_validation["harness_javascript_shadow_sha256"]
        or quality_validation["bun_sha256"] != screenplay_validation["bun_sha256"]
        or quality_validation["bun_version"] != screenplay_validation["bun_version"]
    ):
        raise RenderContractError(
            "render plan authoritative validations used different runtimes"
        )
    validate_runtime_provenance(plan["runtime_provenance"])
    completion = plan["cast_completion"]
    if (
        not isinstance(completion, dict)
        or set(completion) != {"complete_for_screenplay", "character_ids"}
        or completion["complete_for_screenplay"] is not True
        or not isinstance(completion["character_ids"], list)
        or not completion["character_ids"]
        or any(
            not isinstance(character_id, str)
            for character_id in completion["character_ids"]
        )
        or len(set(completion["character_ids"])) != len(completion["character_ids"])
    ):
        raise RenderContractError("render plan cast completion evidence is invalid")
    tasks = plan["tasks"]
    if not isinstance(tasks, list) or not tasks:
        raise RenderContractError("render plan tasks must be non-empty")
    task_chapters: list[str] = []
    task_characters: list[str] = []
    shared_evidence: dict[str, Any] | None = None
    for order, task in enumerate(tasks):
        if not isinstance(task, dict):
            raise RenderContractError("render plan task must be an object")
        _validate_render_task(task, order)
        entries = _task_entries(task)
        chapter_id = entries[0]["chapter_id"]
        character_id = entries[0]["character_id"]
        if chapter_id not in plan["chapters"]:
            raise RenderContractError("render plan task names an unselected chapter")
        if not task_chapters or task_chapters[-1] != chapter_id:
            task_chapters.append(chapter_id)
        if character_id not in task_characters:
            task_characters.append(character_id)
        screenplay_input = task["input"]["screenplay"]
        evidence = {
            "dialogue": screenplay_input["dialogue"],
            "screenplay_sha256": screenplay_input["screenplay_sha256"],
            "source_hashes": screenplay_input["source_hashes"],
            "commentary_sha256": screenplay_input["commentary_sha256"],
            "commentary_quality_audit_sha256": screenplay_input[
                "commentary_quality_audit_sha256"
            ],
            "cast_sha256": screenplay_input["cast_sha256"],
            "generator_version": screenplay_input["generator_version"],
            "renderer": task["input"]["renderer"],
            "runtime_provenance": task["input"]["runtime_provenance"],
        }
        if shared_evidence is None:
            shared_evidence = evidence
        elif evidence != shared_evidence:
            raise RenderContractError("render plan tasks disagree on pinned evidence")
    if task_chapters != plan["chapters"]:
        raise RenderContractError(
            "render plan task chapters are incomplete or reordered"
        )
    if shared_evidence is None or (
        shared_evidence["dialogue"] != plan["dialogue"]
        or shared_evidence["screenplay_sha256"] != acceptance["screenplay_sha256"]
        or shared_evidence["cast_sha256"] != acceptance["cast_sha256"]
        or shared_evidence["commentary_quality_audit_sha256"]
        != acceptance["commentary_quality_audit_sha256"]
        or shared_evidence["runtime_provenance"] != plan["runtime_provenance"]
        or GENERATED_ATTRIBUTION_VERSION_RE.fullmatch(
            shared_evidence["generator_version"]
        ).group(1)
        != acceptance["accepted_attribution_sha256"]
    ):
        raise RenderContractError("render plan tasks differ from accepted inputs")
    completed_characters = completion["character_ids"]
    if any(
        not isinstance(character_id, str)
        or CHARACTER_ID_RE.fullmatch(character_id) is None
        for character_id in completed_characters
    ) or not set(task_characters).issubset(completed_characters):
        raise RenderContractError("render plan cast completion does not cover tasks")
    if plan["scope"] == "full-dialogue" and task_characters != completed_characters:
        raise RenderContractError(
            "full render plan cast completion order is inconsistent"
        )


def render_plan_path(outdir: Path, digest: str) -> Path:
    _sha256(digest, "render plan digest")
    return outdir / "plans" / f"{digest}.json"


def _validate_output_directory_chain(outdir: Path, directory: Path) -> None:
    if not outdir.is_absolute() or not directory.is_absolute():
        raise RenderContractError("render output paths must be absolute")
    try:
        relative = directory.relative_to(outdir)
    except ValueError as error:
        raise RenderContractError("render output path escapes --outdir") from error
    candidates = [outdir]
    for part in relative.parts:
        candidates.append(candidates[-1] / part)
    for candidate in candidates:
        if candidate.is_symlink():
            raise RenderContractError(f"render output traverses a symlink: {candidate}")
        if candidate.exists() and not candidate.is_dir():
            raise RenderContractError(
                f"render output directory is not a directory: {candidate}"
            )


def write_render_plan(plan: dict[str, Any], outdir: Path) -> Path:
    validate_render_plan(plan)
    path = render_plan_path(outdir, plan["plan_sha256"])
    _validate_output_directory_chain(outdir, path.parent)
    payload = (
        json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    if path.exists():
        if path.is_symlink() or not path.is_file() or path.read_bytes() != payload:
            raise RenderContractError(
                f"content-addressed render plan is corrupt: {path}"
            )
        return path
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    descriptor: int | None = None
    created = False
    try:
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
        try:
            descriptor = os.open(temporary, flags, 0o600)
        except FileExistsError as error:
            raise RenderContractError(
                f"exclusive render plan temporary path already exists: {temporary}"
            ) from error
        created = True
        with os.fdopen(descriptor, "wb") as handle:
            descriptor = None
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        if temporary.is_symlink() or not temporary.is_file():
            raise RenderContractError(
                "render plan temporary path became unsafe before publication"
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


def load_render_plan_artifact(
    path: Path,
    *,
    expected_sha256: str,
    current_plan: dict[str, Any] | None = None,
) -> dict[str, Any]:
    expected = _sha256(expected_sha256, "expected render plan SHA-256")
    if path.is_symlink() or not path.is_file():
        raise RenderContractError(f"render plan must be a regular file: {path}")
    if not 0 < path.stat().st_size <= 64 * 1024 * 1024:
        raise RenderContractError("render plan file size is outside the safe bound")
    plan = load_json_object(path)
    validate_render_plan(plan)
    if plan["plan_sha256"] != expected:
        raise RenderContractError("render plan does not match the expected SHA-256")
    expected_path = render_plan_path(path.parent.parent, expected)
    if path.resolve() != expected_path.resolve():
        raise RenderContractError("render plan is not at its content-addressed path")
    if current_plan is not None and plan != current_plan:
        raise RenderContractError(
            "saved render plan differs from current accepted inputs"
        )
    return plan


def cache_paths(outdir: Path, digest: str) -> tuple[Path, Path, Path]:
    _sha256(digest, "render task digest")
    directory = outdir / "cache" / digest[:2] / digest
    return directory, directory / "audio.wav", directory / "render.json"


def _wav_metadata(path: Path) -> dict[str, int]:
    try:
        with wave.open(str(path), "rb") as handle:
            return {
                "channels": handle.getnchannels(),
                "sample_rate": handle.getframerate(),
                "frames": handle.getnframes(),
                "sample_width_bytes": handle.getsampwidth(),
            }
    except (OSError, wave.Error) as error:
        raise RenderContractError(f"invalid WAV {path}: {error}") from error


def _assembly_wav_metadata(path: Path, expected_profile: str) -> dict[str, int | str]:
    expected_magic = {
        CHAPTER_CONTAINER_PROFILE: b"RIFF",
        MASTER_CONTAINER_PROFILE: b"RF64",
    }.get(expected_profile)
    if expected_magic is None:
        raise RenderContractError("assembly container profile is invalid")
    if path.is_symlink() or not path.is_file():
        raise RenderContractError(f"assembly audio path is unsafe: {path}")
    file_size = path.stat().st_size
    if file_size < 44:
        raise RenderContractError(f"assembly audio container is truncated: {path}")
    try:
        with path.open("rb") as handle:
            header = handle.read(12)
            if (
                len(header) != 12
                or header[:4] != expected_magic
                or header[8:] != b"WAVE"
            ):
                raise RenderContractError(
                    f"assembly audio container profile mismatch: {path}"
                )
            riff_size_32 = struct.unpack_from("<I", header, 4)[0]
            if expected_magic == b"RIFF":
                if riff_size_32 == 0xFFFFFFFF or riff_size_32 + 8 != file_size:
                    raise RenderContractError(
                        f"assembly RIFF size evidence mismatch: {path}"
                    )
            elif riff_size_32 != 0xFFFFFFFF:
                raise RenderContractError(
                    f"assembly RF64 size sentinel is invalid: {path}"
                )

            chunk_ids: list[bytes] = []
            ds64: tuple[int, int, int] | None = None
            format_fields: tuple[int, int, int, int, int, int] | None = None
            data_size: int | None = None
            data_end: int | None = None
            while handle.tell() + 8 <= file_size:
                chunk_header = handle.read(8)
                chunk_id = chunk_header[:4]
                chunk_size_32 = struct.unpack_from("<I", chunk_header, 4)[0]
                chunk_ids.append(chunk_id)
                chunk_start = handle.tell()
                if chunk_id == b"ds64":
                    if (
                        expected_magic != b"RF64"
                        or ds64 is not None
                        or chunk_size_32 != 28
                        or chunk_start + chunk_size_32 > file_size
                    ):
                        raise RenderContractError(
                            f"assembly RF64 ds64 chunk is invalid: {path}"
                        )
                    payload = handle.read(chunk_size_32)
                    riff_size_64, data_size_64, sample_count_64, table_length = (
                        struct.unpack("<QQQI", payload)
                    )
                    if table_length != 0:
                        raise RenderContractError(
                            f"assembly RF64 ds64 table is unsupported: {path}"
                        )
                    ds64 = (riff_size_64, data_size_64, sample_count_64)
                elif chunk_id == b"fmt ":
                    if (
                        format_fields is not None
                        or chunk_size_32 not in {16, 40}
                        or chunk_start + chunk_size_32 > file_size
                    ):
                        raise RenderContractError(
                            f"assembly PCM format chunk is invalid: {path}"
                        )
                    payload = handle.read(chunk_size_32)
                    format_fields = struct.unpack_from("<HHIIHH", payload)
                    audio_format, _, _, _, _, bits = format_fields
                    if audio_format == 0xFFFE:
                        pcm_guid = bytes.fromhex("0100000000001000800000aa00389b71")
                        if (
                            chunk_size_32 != 40
                            or struct.unpack_from("<H", payload, 16)[0] != 22
                            or struct.unpack_from("<H", payload, 18)[0] != bits
                            or payload[24:40] != pcm_guid
                        ):
                            raise RenderContractError(
                                f"assembly extensible PCM evidence is invalid: {path}"
                            )
                    elif audio_format != 1 or chunk_size_32 != 16:
                        raise RenderContractError(
                            f"assembly audio is not integer PCM: {path}"
                        )
                elif chunk_id == b"data":
                    if data_size is not None:
                        raise RenderContractError(
                            f"assembly audio has duplicate data chunks: {path}"
                        )
                    if expected_magic == b"RF64":
                        if chunk_size_32 != 0xFFFFFFFF or ds64 is None:
                            raise RenderContractError(
                                f"assembly RF64 data evidence is invalid: {path}"
                            )
                        data_size = ds64[1]
                    else:
                        data_size = chunk_size_32
                    data_end = chunk_start + data_size
                    if data_end + (data_size & 1) != file_size:
                        raise RenderContractError(
                            f"assembly audio data size is invalid: {path}"
                        )
                    break
                else:
                    raise RenderContractError(
                        f"assembly audio has an unexpected chunk {chunk_id!r}: {path}"
                    )
                next_chunk = chunk_start + chunk_size_32 + (chunk_size_32 & 1)
                if next_chunk > file_size:
                    raise RenderContractError(
                        f"assembly audio chunk is truncated: {path}"
                    )
                handle.seek(next_chunk)
    except OSError as error:
        raise RenderContractError(
            f"cannot inspect assembly audio {path}: {error}"
        ) from error

    expected_chunks = (
        [b"fmt ", b"data"] if expected_magic == b"RIFF" else [b"ds64", b"fmt ", b"data"]
    )
    if chunk_ids != expected_chunks or format_fields is None or data_size is None:
        raise RenderContractError(f"assembly audio chunk inventory is invalid: {path}")
    audio_format, channels, sample_rate, byte_rate, block_align, bits = format_fields
    del audio_format
    if (
        channels != 1
        or sample_rate != SAMPLE_RATE
        or bits != 24
        or block_align != 3
        or byte_rate != SAMPLE_RATE * block_align
        or data_size % block_align != 0
    ):
        raise RenderContractError(f"assembly PCM24 format evidence mismatch: {path}")
    frames = data_size // block_align
    if frames <= 0:
        raise RenderContractError(f"assembly audio has no frames: {path}")
    if expected_magic == b"RF64":
        if ds64 is None or ds64 != (file_size - 8, data_size, frames):
            raise RenderContractError(f"assembly RF64 ds64 evidence mismatch: {path}")
    return {
        "channels": channels,
        "sample_rate": sample_rate,
        "frames": frames,
        "sample_width_bytes": bits // 8,
        "container_profile": expected_profile,
    }


def validate_cached_task(task: dict[str, Any], outdir: Path) -> bool:
    if not isinstance(task, dict):
        raise RenderContractError("render task must be an object")
    _validate_render_task(task, task.get("order"))
    digest = task["input_sha256"]
    directory, wav_path, sidecar_path = cache_paths(outdir, digest)
    _validate_output_directory_chain(outdir, directory.parent)
    if not directory.exists():
        return False
    if directory.is_symlink() or not directory.is_dir():
        raise RenderContractError(f"invalid content-addressed render: {directory}")
    inventory: set[str] = set()
    for path in directory.iterdir():
        if path.is_symlink() or not path.is_file():
            raise RenderContractError(
                f"content-addressed render contains an unsafe entry: {path}"
            )
        inventory.add(path.name)
    if inventory != {"audio.wav", "render.json"}:
        raise RenderContractError(f"partial content-addressed render: {directory}")
    sidecar = load_json_object(sidecar_path)
    if (
        set(sidecar)
        != {
            "schema_version",
            "input_sha256",
            "input",
            "audio",
            "runtime",
        }
        or sidecar.get("schema_version") != RENDER_CACHE_SCHEMA_VERSION
    ):
        raise RenderContractError(f"{sidecar_path}: invalid schema_version")
    if sidecar.get("input_sha256") != digest or sidecar.get("input") != task["input"]:
        raise RenderContractError(
            f"{sidecar_path}: render input does not match content address"
        )
    if content_sha256(sidecar["input"]) != digest:
        raise RenderContractError(
            f"{sidecar_path}: content address is internally inconsistent"
        )
    audio = sidecar.get("audio")
    if not isinstance(audio, dict) or set(audio) != {
        "sha256",
        "channels",
        "sample_rate",
        "frames",
        "sample_width_bytes",
        "duration_seconds",
        "peak_gpu_mib",
    }:
        raise RenderContractError(f"{sidecar_path}: missing audio metadata")
    actual_sha = sha256_file(wav_path)
    if audio.get("sha256") != actual_sha:
        raise RenderContractError(f"{sidecar_path}: WAV checksum mismatch")
    metadata = _wav_metadata(wav_path)
    for field, value in metadata.items():
        if audio.get(field) != value:
            raise RenderContractError(f"{sidecar_path}: WAV {field} mismatch")
    if (
        metadata["channels"] != 1
        or metadata["sample_rate"] != SAMPLE_RATE
        or metadata["sample_width_bytes"] != PRODUCTION_SAMPLE_WIDTH_BYTES
        or metadata["frames"] <= 0
    ):
        raise RenderContractError(f"{wav_path}: unexpected production WAV format")
    if audio.get("duration_seconds") != metadata["frames"] / SAMPLE_RATE:
        raise RenderContractError(f"{sidecar_path}: WAV duration mismatch")
    _finite_number(
        audio.get("peak_gpu_mib"), f"{sidecar_path}: peak_gpu_mib", minimum=0
    )
    runtime = sidecar.get("runtime")
    if not isinstance(runtime, dict) or set(runtime) != {
        "provenance",
        "generation_seconds",
    }:
        raise RenderContractError(f"{sidecar_path}: invalid runtime evidence")
    validate_runtime_provenance(runtime["provenance"])
    if runtime["provenance"] != task["input"]["runtime_provenance"]:
        raise RenderContractError(f"{sidecar_path}: runtime provenance is stale")
    _finite_number(
        runtime["generation_seconds"],
        f"{sidecar_path}: generation_seconds",
        minimum=0,
    )
    return True


def _fsync_file(path: Path) -> None:
    with path.open("rb") as handle:
        os.fsync(handle.fileno())


def _fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def _atomic_publish_directory(temp: Path, final: Path) -> None:
    _fsync_file(temp / "audio.wav")
    _fsync_file(temp / "render.json")
    _fsync_directory(temp)
    try:
        os.replace(temp, final)
    except OSError:
        if final.exists():
            shutil.rmtree(temp, ignore_errors=True)
        else:
            raise
    _fsync_directory(final.parent)


def check_runtime_environment() -> dict[str, str]:
    versions: dict[str, str] = {}
    mismatches: list[str] = []
    for package, expected in PACKAGE_PINS.items():
        try:
            actual = importlib.metadata.version(package)
        except importlib.metadata.PackageNotFoundError:
            mismatches.append(f"{package}: missing (expected {expected})")
            continue
        versions[package] = actual
        if actual != expected:
            mismatches.append(f"{package}: installed {actual}, expected {expected}")
    if mismatches:
        raise RuntimeError("Dots environment mismatch: " + "; ".join(mismatches))
    return versions


def _trusted_python_distribution_roots() -> set[Path]:
    roots: set[Path] = set()
    for key in ("purelib", "platlib"):
        raw = sysconfig.get_paths().get(key)
        if not raw:
            continue
        path = Path(raw)
        if path.is_symlink() or not path.is_dir():
            raise RuntimeError(f"Python {key} distribution root is unsafe: {path}")
        roots.add(path.resolve(strict=True))
    if not roots:
        raise RuntimeError("Python has no trusted distribution roots")
    return roots


def _trusted_python_scripts_root() -> Path:
    raw = sysconfig.get_path("scripts")
    if not raw:
        raise RuntimeError("Python has no trusted scripts root")
    path = Path(raw)
    if path.is_symlink() or not path.is_dir():
        raise RuntimeError(f"Python scripts root is unsafe: {path}")
    return path.resolve(strict=True)


def _python_loader_identity(loader: Any, module: str) -> str:
    allowed_loaders = (
        importlib.machinery.SourceFileLoader,
        importlib.machinery.SourcelessFileLoader,
        importlib.machinery.ExtensionFileLoader,
    )
    if not isinstance(loader, allowed_loaders):
        raise RuntimeError(f"Python import {module} uses an unsafe loader")
    loader_type = type(loader)
    return f"{loader_type.__module__}.{loader_type.__qualname__}"


def _resolved_python_spec_identity(spec: Any, module: str) -> dict[str, Any]:
    if spec is None or spec.name != module:
        raise RuntimeError(f"Python import {module} is unavailable")
    raw_origin = spec.origin
    if not isinstance(raw_origin, str) or not Path(raw_origin).is_absolute():
        raise RuntimeError(f"Python import {module} has no absolute file origin")
    origin_path = Path(raw_origin)
    try:
        origin = origin_path.resolve(strict=True)
    except FileNotFoundError as error:
        raise RuntimeError(f"Python import {module} origin is missing") from error
    if origin_path.is_symlink() or not origin.is_file():
        raise RuntimeError(f"Python import {module} origin is unsafe: {origin_path}")
    package_locations: list[str] = []
    for raw_location in spec.submodule_search_locations or ():
        location_path = Path(raw_location)
        try:
            location = location_path.resolve(strict=True)
        except FileNotFoundError as error:
            raise RuntimeError(
                f"Python import {module} package location is missing"
            ) from error
        if location_path.is_symlink() or not location.is_dir():
            raise RuntimeError(
                f"Python import {module} package location is unsafe: {location_path}"
            )
        package_locations.append(str(location))
    if len(package_locations) != len(set(package_locations)):
        raise RuntimeError(f"Python import {module} has duplicate package locations")
    if package_locations and str(origin.parent) not in package_locations:
        raise RuntimeError(
            f"Python import {module} origin is outside its package location"
        )
    return {
        "origin": str(origin),
        "loader": _python_loader_identity(spec.loader, module),
        "package_locations": package_locations,
    }


def _distribution_owned_origin(
    distribution: importlib.metadata.Distribution,
    origin: Path,
    module: str,
) -> str:
    files = distribution.files
    if not files:
        raise RuntimeError(
            f"Python import {module} distribution has no installed-file inventory"
        )
    matches: list[str] = []
    for entry in files:
        logical = entry.as_posix()
        if not logical or logical.startswith("/") or ".." in Path(logical).parts:
            continue
        located = Path(distribution.locate_file(entry))
        try:
            resolved = located.resolve(strict=True)
        except FileNotFoundError:
            continue
        if resolved == origin:
            matches.append(logical)
    if len(matches) != 1:
        raise RuntimeError(
            f"Python import {module} origin is not uniquely owned by its distribution"
        )
    return matches[0]


def _verified_python_distribution_inventory(
    distribution: importlib.metadata.Distribution,
    distribution_root: Path,
    module: str,
) -> dict[str, Any]:
    files = distribution.files
    if not files:
        raise RuntimeError(
            f"Python import {module} distribution has no installed-file inventory"
        )
    entries: list[dict[str, Any]] = []
    logical_paths: set[str] = set()
    resolved_paths: set[Path] = set()
    owned_top_level_directories: set[Path] = set()
    scripts_root: Path | None = None
    for package_path in sorted(files, key=lambda entry: entry.as_posix()):
        logical = package_path.as_posix()
        parsed = PurePosixPath(logical)
        if (
            not logical
            or "\\" in logical
            or parsed.is_absolute()
            or logical in logical_paths
        ):
            raise RuntimeError(
                f"Python import {module} distribution inventory path is unsafe: "
                f"{logical}"
            )
        logical_paths.add(logical)
        located = Path(distribution.locate_file(package_path))
        try:
            resolved = located.resolve(strict=True)
        except FileNotFoundError as error:
            raise RuntimeError(
                f"Python import {module} distribution file is missing: {logical}"
            ) from error
        if located.is_symlink() or not resolved.is_file():
            raise RuntimeError(
                f"Python import {module} distribution file is unsafe: {logical}"
            )
        try:
            resolved.relative_to(distribution_root)
        except ValueError:
            if scripts_root is None:
                scripts_root = _trusted_python_scripts_root()
            try:
                resolved.relative_to(scripts_root)
            except ValueError as error:
                raise RuntimeError(
                    f"Python import {module} distribution file escapes its trusted "
                    f"installation roots: {logical}"
                ) from error
        if resolved in resolved_paths:
            raise RuntimeError(
                f"Python import {module} distribution inventory aliases a file"
            )
        resolved_paths.add(resolved)

        size_bytes = resolved.stat().st_size
        digest = sha256_file(resolved)
        recorded_hash = package_path.hash
        recorded_size = package_path.size
        if (recorded_hash is None) != (recorded_size is None):
            raise RuntimeError(
                f"Python import {module} distribution RECORD integrity is partial: "
                f"{logical}"
            )
        if recorded_hash is not None:
            if (
                recorded_hash.mode != "sha256"
                or isinstance(recorded_size, bool)
                or not isinstance(recorded_size, int)
                or recorded_size < 0
            ):
                raise RuntimeError(
                    f"Python import {module} distribution RECORD integrity is unsafe: "
                    f"{logical}"
                )
            encoded_digest = (
                base64.urlsafe_b64encode(bytes.fromhex(digest))
                .rstrip(b"=")
                .decode("ascii")
            )
            if recorded_hash.value != encoded_digest or recorded_size != size_bytes:
                raise RuntimeError(
                    f"Python import {module} distribution RECORD hash or size differs: "
                    f"{logical}"
                )
            storage = "record-sha256"
        elif parsed.name == "RECORD" and parsed.parent.name.endswith(".dist-info"):
            storage = "record-self"
        elif parsed.suffix == ".pyc" and "__pycache__" in parsed.parts:
            storage = "generated-pyc"
        else:
            raise RuntimeError(
                f"Python import {module} distribution RECORD omits integrity: {logical}"
            )
        entries.append(
            {
                "path": logical,
                "sha256": digest,
                "size_bytes": size_bytes,
                "storage": storage,
                "link_target": None,
            }
        )

        if ".." not in parsed.parts:
            top_level = distribution_root / parsed.parts[0]
            if top_level.name != "__pycache__" and top_level.is_dir():
                if top_level.is_symlink():
                    raise RuntimeError(
                        f"Python import {module} distribution directory is a symlink: "
                        f"{top_level}"
                    )
                owned_top_level_directories.add(top_level)

    for top_level in sorted(owned_top_level_directories, key=str):
        for path in sorted(top_level.rglob("*"), key=str):
            if path.is_symlink():
                raise RuntimeError(
                    f"Python import {module} distribution tree contains a symlink: "
                    f"{path}"
                )
            if path.is_dir():
                continue
            if not path.is_file():
                raise RuntimeError(
                    f"Python import {module} distribution tree contains an unsafe "
                    f"entry: {path}"
                )
            if path.resolve(strict=True) not in resolved_paths:
                raise RuntimeError(
                    f"Python import {module} distribution tree contains an unrecorded "
                    f"file: {path}"
                )

    summary = _inventory_summary(entries)
    return {
        "distribution_inventory_sha256": summary["inventory_sha256"],
        "distribution_file_count": summary["file_count"],
        "distribution_total_bytes": summary["total_bytes"],
        "owned_paths": frozenset(str(path) for path in resolved_paths),
    }


def _python_import_provenance_for_module(
    module: str,
    distribution_name: str,
    versions: dict[str, str],
    *,
    parent_locations: list[str] | None = None,
    inventory_cache: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    search_path: Any = sys.path if parent_locations is None else parent_locations
    path_spec = importlib.machinery.PathFinder.find_spec(module, search_path)
    identity = _resolved_python_spec_identity(path_spec, module)
    if parent_locations is None:
        visible_spec = importlib.util.find_spec(module)
        visible_identity = _resolved_python_spec_identity(visible_spec, module)
        if visible_identity != identity:
            raise RuntimeError(
                f"Python import {module} is shadowed by a non-path import hook"
            )

    try:
        distribution = importlib.metadata.distribution(distribution_name)
    except importlib.metadata.PackageNotFoundError as error:
        raise RuntimeError(
            f"Python import {module} has no {distribution_name} distribution"
        ) from error
    expected_version = versions[distribution_name]
    if distribution.version != expected_version:
        raise RuntimeError(f"Python import {module} distribution version is stale")
    distribution_root_path = Path(distribution.locate_file(""))
    try:
        distribution_root = distribution_root_path.resolve(strict=True)
    except FileNotFoundError as error:
        raise RuntimeError(
            f"Python import {module} distribution root is missing"
        ) from error
    if (
        distribution_root_path.is_symlink()
        or not distribution_root.is_dir()
        or distribution_root not in _trusted_python_distribution_roots()
    ):
        raise RuntimeError(
            f"Python import {module} distribution root is not trusted: "
            f"{distribution_root_path}"
        )
    origin = Path(identity["origin"])
    try:
        origin.relative_to(distribution_root)
        for location in identity["package_locations"]:
            Path(location).relative_to(distribution_root)
    except ValueError as error:
        raise RuntimeError(
            f"Python import {module} resolves outside its distribution root"
        ) from error
    distribution_file = _distribution_owned_origin(distribution, origin, module)
    record_raw = distribution.read_text("RECORD")
    if not record_raw:
        raise RuntimeError(f"Python import {module} distribution RECORD is unavailable")
    record_sha256 = hashlib.sha256(record_raw.encode("utf-8")).hexdigest()
    if inventory_cache is None:
        inventory_cache = {}
    inventory = inventory_cache.get(distribution_name)
    if inventory is None:
        inventory = _verified_python_distribution_inventory(
            distribution, distribution_root, module
        )
        inventory_cache[distribution_name] = {
            **inventory,
            "distribution_root": str(distribution_root),
            "distribution_record_sha256": record_sha256,
        }
    elif (
        inventory["distribution_root"] != str(distribution_root)
        or inventory["distribution_record_sha256"] != record_sha256
    ):
        raise RuntimeError(
            f"Python import {module} distribution inventory changed during resolution"
        )
    return {
        "module": module,
        "distribution": distribution_name,
        "version": expected_version,
        "distribution_root": str(distribution_root),
        "distribution_file": distribution_file,
        "distribution_file_count": inventory["distribution_file_count"],
        "distribution_inventory_sha256": inventory["distribution_inventory_sha256"],
        "distribution_record_sha256": record_sha256,
        "distribution_total_bytes": inventory["distribution_total_bytes"],
        "origin": identity["origin"],
        "origin_sha256": sha256_file(origin),
        "size_bytes": origin.stat().st_size,
        "loader": identity["loader"],
        "package_locations": identity["package_locations"],
    }


def _resolve_python_import_provenance_with_ownership(
    versions: dict[str, str],
) -> tuple[list[dict[str, Any]], dict[str, frozenset[str]]]:
    results: list[dict[str, Any]] = []
    inventory_cache: dict[str, dict[str, Any]] = {}
    dots_locations: list[str] | None = None
    for module, distribution_name in PYTHON_IMPORT_DISTRIBUTIONS:
        parent_locations = dots_locations if module == "dots_tts.runtime" else None
        result = _python_import_provenance_for_module(
            module,
            distribution_name,
            versions,
            parent_locations=parent_locations,
            inventory_cache=inventory_cache,
        )
        results.append(result)
        if module == "dots_tts":
            dots_locations = result["package_locations"]
            if len(dots_locations) != 1:
                raise RuntimeError(
                    "Python import dots_tts must have one distribution package root"
                )
    ownership = {
        distribution: inventory["owned_paths"]
        for distribution, inventory in inventory_cache.items()
    }
    return results, ownership


def resolve_python_import_provenance(
    versions: dict[str, str],
) -> list[dict[str, Any]]:
    results, _ = _resolve_python_import_provenance_with_ownership(versions)
    return results


def validate_loaded_python_imports(
    expected_imports: list[dict[str, Any]],
    loaded_modules: dict[str, Any],
) -> None:
    versions = {entry["distribution"]: entry["version"] for entry in expected_imports}
    current_imports, owned_paths = _resolve_python_import_provenance_with_ownership(
        versions
    )
    if current_imports != expected_imports:
        raise RuntimeError(
            "loaded Python runtime distributions differ from reviewed provenance"
        )
    expected_by_module = {entry["module"]: entry for entry in expected_imports}
    if set(loaded_modules) != set(expected_by_module):
        raise RuntimeError("loaded Python runtime module inventory is incomplete")
    for module, loaded in loaded_modules.items():
        expected = expected_by_module[module]
        identity = _resolved_python_spec_identity(
            getattr(loaded, "__spec__", None), module
        )
        raw_file = getattr(loaded, "__file__", None)
        if not isinstance(raw_file, str):
            raise RuntimeError(f"loaded Python module {module} has no file")
        try:
            loaded_file = str(Path(raw_file).resolve(strict=True))
        except FileNotFoundError as error:
            raise RuntimeError(
                f"loaded Python module {module} file is missing"
            ) from error
        loaded_locations = [
            str(Path(location).resolve(strict=True))
            for location in getattr(loaded, "__path__", ())
        ]
        origin = Path(identity["origin"])
        if (
            identity["origin"] != expected["origin"]
            or identity["loader"] != expected["loader"]
            or identity["package_locations"] != expected["package_locations"]
            or loaded_file != expected["origin"]
            or loaded_locations != expected["package_locations"]
            or sha256_file(origin) != expected["origin_sha256"]
            or origin.stat().st_size != expected["size_bytes"]
        ):
            raise RuntimeError(
                f"loaded Python module {module} differs from reviewed provenance"
            )

    for module, loaded in tuple(sys.modules.items()):
        distribution_name = next(
            (
                distribution
                for distribution, prefixes in PYTHON_DISTRIBUTION_MODULE_PREFIXES.items()
                if any(
                    module == prefix or module.startswith(f"{prefix}.")
                    for prefix in prefixes
                )
            ),
            None,
        )
        if distribution_name is None:
            continue

        def has_owned_file_backed_parent() -> bool:
            parent = module.rpartition(".")[0]
            while parent:
                parent_module = sys.modules.get(parent)
                parent_file = getattr(parent_module, "__file__", None)
                if isinstance(parent_file, str) and Path(parent_file).is_absolute():
                    try:
                        parent_origin = str(Path(parent_file).resolve(strict=True))
                    except FileNotFoundError as error:
                        raise RuntimeError(
                            f"loaded Python module {module} has a missing parent file"
                        ) from error
                    if parent_origin in owned_paths[distribution_name]:
                        return True
                parent = parent.rpartition(".")[0]
            return False

        raw_file = getattr(loaded, "__file__", None)
        if raw_file is None or (
            isinstance(raw_file, str) and not Path(raw_file).is_absolute()
        ):
            if not has_owned_file_backed_parent():
                raise RuntimeError(
                    f"loaded Python module {module} has no owned file-backed ancestor"
                )
            continue
        if not isinstance(raw_file, str):
            raise RuntimeError(f"loaded Python module {module} has an unsafe file")
        path = Path(raw_file)
        try:
            origin = str(path.resolve(strict=True))
        except FileNotFoundError as error:
            raise RuntimeError(
                f"loaded Python module {module} file is missing"
            ) from error
        if path.is_symlink() or origin not in owned_paths[distribution_name]:
            raise RuntimeError(
                f"loaded Python module {module} is not owned by its reviewed distribution"
            )


def _inventory_entry(
    *,
    logical_path: str,
    content_path: Path,
    storage: str,
    link_target: str | None,
) -> dict[str, Any]:
    if content_path.is_symlink() or not content_path.is_file():
        raise RuntimeError(f"provenance inventory target is unsafe: {content_path}")
    size = content_path.stat().st_size
    return {
        "path": logical_path,
        "sha256": sha256_file(content_path),
        "size_bytes": size,
        "storage": storage,
        "link_target": link_target,
    }


def _inventory_summary(entries: list[dict[str, Any]]) -> dict[str, Any]:
    if not entries:
        raise RuntimeError("provenance inventory is empty")
    return {
        "inventory_sha256": content_sha256(entries),
        "file_count": len(entries),
        "total_bytes": sum(entry["size_bytes"] for entry in entries),
        "files": entries,
    }


def resolve_model_snapshot(cache_dir: Path) -> Path:
    repository = cache_dir / "models--rednote-hilab--dots.tts-soar"
    snapshots = repository / "snapshots"
    directory = snapshots / MODEL_REVISION
    for component in (cache_dir, repository, snapshots, directory):
        if component.is_symlink():
            raise RuntimeError(
                f"pinned Dots snapshot path contains a directory symlink: {component}"
            )
    if not directory.is_dir():
        raise RuntimeError(
            f"pinned Dots snapshot must be a real directory, not a symlink: {directory}"
        )
    required = ["config.json", "model.safetensors", "vocoder.safetensors"]
    missing = [name for name in required if not (directory / name).is_file()]
    if missing:
        raise RuntimeError(
            f"pinned Dots snapshot is incomplete at {directory}; missing {', '.join(missing)}"
        )
    if directory.name != MODEL_REVISION:
        raise AssertionError("resolved model path lost the pinned revision")
    return directory.resolve(strict=True)


def model_snapshot_provenance(cache_dir: Path) -> dict[str, Any]:
    snapshot = resolve_model_snapshot(cache_dir)
    repository = snapshot.parent.parent
    blobs = repository / "blobs"
    if blobs.is_symlink() or not blobs.is_dir():
        raise RuntimeError(f"Hugging Face blob directory is unsafe: {blobs}")
    blobs = blobs.resolve(strict=True)
    entries: list[dict[str, Any]] = []
    for path in sorted(
        snapshot.rglob("*"), key=lambda item: item.relative_to(snapshot).as_posix()
    ):
        logical = path.relative_to(snapshot).as_posix()
        if path.is_symlink():
            try:
                resolved = path.resolve(strict=True)
                resolved.relative_to(blobs)
            except (FileNotFoundError, ValueError) as error:
                raise RuntimeError(
                    f"model snapshot link escapes the pinned Hugging Face blob store: {path}"
                ) from error
            entries.append(
                _inventory_entry(
                    logical_path=logical,
                    content_path=resolved,
                    storage="hf-blob-symlink",
                    link_target=os.readlink(path),
                )
            )
        elif path.is_dir():
            continue
        elif path.is_file():
            entries.append(
                _inventory_entry(
                    logical_path=logical,
                    content_path=path,
                    storage="regular",
                    link_target=None,
                )
            )
        else:
            raise RuntimeError(f"model snapshot contains an unsafe entry: {path}")
    names = {entry["path"] for entry in entries}
    required = {"config.json", "model.safetensors", "vocoder.safetensors"}
    if not required.issubset(names):
        raise RuntimeError("pinned Dots snapshot inventory omits required model files")
    return {
        "repository": MODEL_REPOSITORY,
        "revision": MODEL_REVISION,
        "snapshot_path": str(snapshot),
        **_inventory_summary(entries),
    }


def hash_dots_source_tree(package_root: Path) -> dict[str, Any]:
    if package_root.is_symlink() or not package_root.is_dir():
        raise RuntimeError(f"installed dots_tts package root is unsafe: {package_root}")
    root = package_root.resolve(strict=True)
    entries: list[dict[str, Any]] = []
    for path in sorted(
        root.rglob("*"), key=lambda item: item.relative_to(root).as_posix()
    ):
        relative = path.relative_to(root)
        if "__pycache__" in relative.parts or path.suffix == ".pyc":
            continue
        if path.is_symlink():
            raise RuntimeError(f"installed dots_tts source contains a symlink: {path}")
        if path.is_dir():
            continue
        if not path.is_file():
            raise RuntimeError(
                f"installed dots_tts source contains an unsafe entry: {path}"
            )
        entries.append(
            _inventory_entry(
                logical_path=relative.as_posix(),
                content_path=path,
                storage="regular",
                link_target=None,
            )
        )
    entries_by_path = {entry["path"]: entry for entry in entries}
    if not {"__init__.py", "runtime.py"}.issubset(entries_by_path):
        raise RuntimeError(
            "installed dots_tts source is missing __init__.py or runtime.py"
        )
    runtime_entry = entries_by_path["runtime.py"]
    return {
        "package_root": str(root),
        "runtime_wrapper_sha256": runtime_entry["sha256"],
        **_inventory_summary(entries),
    }


def dots_source_provenance(versions: dict[str, str]) -> dict[str, Any]:
    distribution = importlib.metadata.distribution("dots.tts")
    direct_url_raw = distribution.read_text("direct_url.json")
    try:
        direct_url = json.loads(direct_url_raw) if direct_url_raw else {}
    except json.JSONDecodeError as error:
        raise RuntimeError("dots.tts direct_url.json is malformed") from error
    vcs_info = direct_url.get("vcs_info") if isinstance(direct_url, dict) else None
    commit = vcs_info.get("commit_id") if isinstance(vcs_info, dict) else None
    if commit != DOTS_PACKAGE_COMMIT:
        raise RuntimeError(
            "dots.tts source commit is not verifiable; reinstall the pinned Git commit "
            f"{DOTS_PACKAGE_COMMIT}"
        )
    package_root = Path(distribution.locate_file("dots_tts"))
    tree = hash_dots_source_tree(package_root)
    return {
        "package": "dots.tts",
        "version": versions["dots.tts"],
        "commit": DOTS_PACKAGE_COMMIT,
        "direct_url_sha256": hashlib.sha256(
            (direct_url_raw or "").encode("utf-8")
        ).hexdigest(),
        **tree,
    }


def resolve_runtime_provenance(cache_dir: Path) -> dict[str, Any]:
    versions = check_runtime_environment()
    dots_source = dots_source_provenance(versions)
    provenance = {
        "schema_version": 3,
        "packages": versions,
        "model": model_snapshot_provenance(cache_dir),
        "dots_source": dots_source,
        "python_imports": resolve_python_import_provenance(versions),
    }
    validate_runtime_provenance(provenance)
    return provenance


def _validate_inventory(
    value: Any,
    *,
    location: str,
    allowed_storage: set[str],
    required_paths: set[str],
) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not value:
        raise RenderContractError(f"{location}: expected a non-empty file inventory")
    paths: list[str] = []
    for index, entry in enumerate(value):
        entry_location = f"{location}[{index}]"
        if not isinstance(entry, dict) or set(entry) != INVENTORY_ENTRY_FIELDS:
            raise RenderContractError(f"{entry_location}: invalid inventory fields")
        logical = _repo_relative_path_string(entry["path"], f"{entry_location}.path")
        _sha256(entry["sha256"], f"{entry_location}.sha256")
        size = entry["size_bytes"]
        if isinstance(size, bool) or not isinstance(size, int) or size < 0:
            raise RenderContractError(
                f"{entry_location}.size_bytes: expected a non-negative integer"
            )
        storage = entry["storage"]
        link_target = entry["link_target"]
        if storage not in allowed_storage:
            raise RenderContractError(f"{entry_location}.storage: invalid value")
        if storage == "regular":
            if link_target is not None:
                raise RenderContractError(
                    f"{entry_location}.link_target: regular files require null"
                )
        elif not isinstance(link_target, str) or not link_target:
            raise RenderContractError(
                f"{entry_location}.link_target: symlink provenance is missing"
            )
        paths.append(logical)
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise RenderContractError(f"{location}: paths must be sorted and unique")
    if not required_paths.issubset(paths):
        raise RenderContractError(f"{location}: required files are missing")
    return value


def validate_runtime_provenance(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != RUNTIME_PROVENANCE_FIELDS:
        raise RenderContractError("runtime provenance fields are invalid")
    if value["schema_version"] != 3 or value["packages"] != PACKAGE_PINS:
        raise RenderContractError("runtime provenance schema or package pins are stale")

    model = value["model"]
    if not isinstance(model, dict) or set(model) != MODEL_PROVENANCE_FIELDS:
        raise RenderContractError("runtime model provenance fields are invalid")
    snapshot_path = model["snapshot_path"]
    if (
        model["repository"] != MODEL_REPOSITORY
        or model["revision"] != MODEL_REVISION
        or not isinstance(snapshot_path, str)
        or not Path(snapshot_path).is_absolute()
        or Path(snapshot_path).name != MODEL_REVISION
    ):
        raise RenderContractError("runtime model identity or path is invalid")
    model_files = _validate_inventory(
        model["files"],
        location="runtime provenance model files",
        allowed_storage={"regular", "hf-blob-symlink"},
        required_paths={"config.json", "model.safetensors", "vocoder.safetensors"},
    )
    _sha256(model["inventory_sha256"], "runtime model inventory_sha256")
    if any(
        isinstance(model[field], bool)
        or not isinstance(model[field], int)
        or model[field] < 0
        for field in ("file_count", "total_bytes")
    ):
        raise RenderContractError("runtime model inventory totals are invalid")
    if (
        content_sha256(model_files) != model["inventory_sha256"]
        or model["file_count"] != len(model_files)
        or model["total_bytes"] != sum(entry["size_bytes"] for entry in model_files)
    ):
        raise RenderContractError("runtime model inventory summary is inconsistent")

    dots = value["dots_source"]
    if not isinstance(dots, dict) or set(dots) != DOTS_SOURCE_PROVENANCE_FIELDS:
        raise RenderContractError("runtime Dots source provenance fields are invalid")
    package_root = dots["package_root"]
    if (
        dots["package"] != "dots.tts"
        or dots["version"] != PACKAGE_PINS["dots.tts"]
        or dots["commit"] != DOTS_PACKAGE_COMMIT
        or not isinstance(package_root, str)
        or not Path(package_root).is_absolute()
    ):
        raise RenderContractError("runtime Dots source identity or path is invalid")
    dots_files = _validate_inventory(
        dots["files"],
        location="runtime provenance Dots source files",
        allowed_storage={"regular"},
        required_paths={"__init__.py", "runtime.py"},
    )
    for field in (
        "direct_url_sha256",
        "inventory_sha256",
        "runtime_wrapper_sha256",
    ):
        _sha256(dots[field], f"runtime Dots source {field}")
    if any(
        isinstance(dots[field], bool)
        or not isinstance(dots[field], int)
        or dots[field] < 0
        for field in ("file_count", "total_bytes")
    ):
        raise RenderContractError("runtime Dots source inventory totals are invalid")
    runtime_entry = next(entry for entry in dots_files if entry["path"] == "runtime.py")
    if (
        content_sha256(dots_files) != dots["inventory_sha256"]
        or dots["runtime_wrapper_sha256"] != runtime_entry["sha256"]
        or dots["file_count"] != len(dots_files)
        or dots["total_bytes"] != sum(entry["size_bytes"] for entry in dots_files)
    ):
        raise RenderContractError("runtime Dots source inventory is inconsistent")

    python_imports = value["python_imports"]
    expected_bindings = dict(PYTHON_IMPORT_DISTRIBUTIONS)
    if not isinstance(python_imports, list) or len(python_imports) != len(
        PYTHON_IMPORT_DISTRIBUTIONS
    ):
        raise RenderContractError("runtime Python import provenance is incomplete")
    seen_modules: list[str] = []
    imports_by_module: dict[str, dict[str, Any]] = {}
    distribution_evidence: dict[str, tuple[Any, ...]] = {}
    for index, entry in enumerate(python_imports):
        location = f"runtime provenance Python imports[{index}]"
        if not isinstance(entry, dict) or set(entry) != PYTHON_IMPORT_PROVENANCE_FIELDS:
            raise RenderContractError(f"{location}: invalid fields")
        module = entry["module"]
        distribution = entry["distribution"]
        if (
            not isinstance(module, str)
            or expected_bindings.get(module) != distribution
            or entry["version"] != PACKAGE_PINS[distribution]
        ):
            raise RenderContractError(f"{location}: invalid module binding")
        distribution_root = entry["distribution_root"]
        origin = entry["origin"]
        if (
            not isinstance(distribution_root, str)
            or not Path(distribution_root).is_absolute()
            or not isinstance(origin, str)
            or not Path(origin).is_absolute()
        ):
            raise RenderContractError(f"{location}: import paths must be absolute")
        try:
            Path(origin).relative_to(Path(distribution_root))
        except ValueError as error:
            raise RenderContractError(
                f"{location}: origin is outside its distribution root"
            ) from error
        _repo_relative_path_string(
            entry["distribution_file"], f"{location}.distribution_file"
        )
        _sha256(
            entry["distribution_record_sha256"],
            f"{location}.distribution_record_sha256",
        )
        _sha256(
            entry["distribution_inventory_sha256"],
            f"{location}.distribution_inventory_sha256",
        )
        _sha256(entry["origin_sha256"], f"{location}.origin_sha256")
        if (
            isinstance(entry["size_bytes"], bool)
            or not isinstance(entry["size_bytes"], int)
            or entry["size_bytes"] < 0
            or isinstance(entry["distribution_file_count"], bool)
            or not isinstance(entry["distribution_file_count"], int)
            or entry["distribution_file_count"] <= 0
            or isinstance(entry["distribution_total_bytes"], bool)
            or not isinstance(entry["distribution_total_bytes"], int)
            or entry["distribution_total_bytes"] < 0
            or not isinstance(entry["loader"], str)
            or not entry["loader"]
        ):
            raise RenderContractError(f"{location}: invalid origin evidence")
        package_locations = entry["package_locations"]
        if not isinstance(package_locations, list) or any(
            not isinstance(path, str) or not Path(path).is_absolute()
            for path in package_locations
        ):
            raise RenderContractError(f"{location}: invalid package locations")
        if len(package_locations) != len(set(package_locations)):
            raise RenderContractError(f"{location}: duplicate package locations")
        try:
            for path in package_locations:
                Path(path).relative_to(Path(distribution_root))
        except ValueError as error:
            raise RenderContractError(
                f"{location}: package location is outside its distribution root"
            ) from error
        if package_locations and str(Path(origin).parent) not in package_locations:
            raise RenderContractError(
                f"{location}: origin is outside its package locations"
            )
        current_distribution_evidence = (
            distribution_root,
            entry["distribution_record_sha256"],
            entry["distribution_inventory_sha256"],
            entry["distribution_file_count"],
            entry["distribution_total_bytes"],
        )
        prior_distribution_evidence = distribution_evidence.setdefault(
            distribution, current_distribution_evidence
        )
        if prior_distribution_evidence != current_distribution_evidence:
            raise RenderContractError(
                f"{location}: repeated distribution evidence is inconsistent"
            )
        seen_modules.append(module)
        imports_by_module[module] = entry
    expected_modules = [module for module, _ in PYTHON_IMPORT_DISTRIBUTIONS]
    if seen_modules != expected_modules or len(set(seen_modules)) != len(seen_modules):
        raise RenderContractError(
            "runtime Python imports must use the exact ordered module inventory"
        )
    dots_entries = {entry["path"]: entry for entry in dots_files}
    dots_package = imports_by_module["dots_tts"]
    dots_runtime = imports_by_module["dots_tts.runtime"]
    expected_package_root = Path(package_root)
    if (
        dots_package["origin"] != str(expected_package_root / "__init__.py")
        or dots_package["distribution_file"] != "dots_tts/__init__.py"
        or dots_package["origin_sha256"] != dots_entries["__init__.py"]["sha256"]
        or dots_package["size_bytes"] != dots_entries["__init__.py"]["size_bytes"]
        or dots_package["package_locations"] != [str(expected_package_root)]
        or dots_runtime["origin"] != str(expected_package_root / "runtime.py")
        or dots_runtime["distribution_file"] != "dots_tts/runtime.py"
        or dots_runtime["origin_sha256"] != dots_entries["runtime.py"]["sha256"]
        or dots_runtime["size_bytes"] != dots_entries["runtime.py"]["size_bytes"]
        or dots_runtime["package_locations"]
        or dots_package["distribution_root"] != dots_runtime["distribution_root"]
        or dots_package["distribution_record_sha256"]
        != dots_runtime["distribution_record_sha256"]
        or dots_package["distribution_inventory_sha256"]
        != dots_runtime["distribution_inventory_sha256"]
        or dots_package["distribution_file_count"]
        != dots_runtime["distribution_file_count"]
        or dots_package["distribution_total_bytes"]
        != dots_runtime["distribution_total_bytes"]
    ):
        raise RenderContractError(
            "runtime Dots imports do not match the hashed distribution source tree"
        )
    return value


def _trim_generated_audio(audio: Any, sample_rate: int) -> Any:
    import numpy as np

    samples = np.asarray(audio, dtype=np.float32).reshape(-1)
    if samples.size == 0 or not np.isfinite(samples).all():
        raise RuntimeError("Dots generated empty or non-finite audio")
    peak = float(np.max(np.abs(samples)))
    if peak <= 0:
        raise RuntimeError("Dots generated silent audio")
    threshold = peak * (10.0 ** (TRIM_THRESHOLD_DB / 20.0))
    non_silent = np.flatnonzero(np.abs(samples) >= threshold)
    if non_silent.size == 0:
        raise RuntimeError("Dots generated no audio above the trim threshold")
    safety = round(sample_rate * TRIM_SAFETY_MS / 1000)
    start = max(0, int(non_silent[0]) - safety)
    end = min(samples.size, int(non_silent[-1]) + safety + 1)
    return samples[start:end]


def render_task(
    task: dict[str, Any],
    outdir: Path,
    runtime: Any,
    runtime_provenance: dict[str, Any],
) -> bool:
    """Render one cache task; return True when newly rendered, False on resume."""

    validate_runtime_provenance(runtime_provenance)
    if task["input"]["runtime_provenance"] != runtime_provenance:
        raise RenderContractError(
            "render task runtime differs from current environment"
        )
    if validate_cached_task(task, outdir):
        return False
    import soundfile as sf
    import torch
    from dots_tts.utils.util import seed_everything

    digest = task["input_sha256"]
    final, _, _ = cache_paths(outdir, digest)
    _validate_output_directory_chain(outdir, final.parent)
    final.parent.mkdir(parents=True, exist_ok=True)
    temp = final.parent / f".{digest}.{uuid.uuid4().hex}.tmp"
    temp.mkdir()
    try:
        recipe = task["input"]["voice"]
        generation = recipe["generation"]
        seed_everything(recipe["seed"])
        torch.cuda.reset_peak_memory_stats()
        started = time.perf_counter()
        result = runtime.generate(
            text=task["input"]["utterance"]["synthesis_text"],
            prompt_audio_path=task["reference_path"],
            prompt_text=recipe["reference"]["prompt_text"],
            language=generation["language"],
            num_steps=generation["num_steps"],
            guidance_scale=generation["guidance_scale"],
            speaker_scale=generation["speaker_scale"],
        )
        elapsed = time.perf_counter() - started
        sample_rate = int(result["sample_rate"])
        if sample_rate != SAMPLE_RATE:
            raise RuntimeError(
                f"Dots returned {sample_rate} Hz, expected pinned {SAMPLE_RATE} Hz"
            )
        samples = _trim_generated_audio(
            result["audio"].float().cpu().squeeze().numpy(), sample_rate
        )
        wav_path = temp / "audio.wav"
        sf.write(wav_path, samples, sample_rate, format="WAV", subtype=WAV_SUBTYPE)
        audio_sha = sha256_file(wav_path)
        metadata = _wav_metadata(wav_path)
        sidecar = {
            "schema_version": RENDER_CACHE_SCHEMA_VERSION,
            "input_sha256": digest,
            "input": task["input"],
            "audio": {
                **metadata,
                "sha256": audio_sha,
                "duration_seconds": metadata["frames"] / metadata["sample_rate"],
                "peak_gpu_mib": torch.cuda.max_memory_allocated() / 1024**2,
            },
            "runtime": {
                "provenance": copy.deepcopy(runtime_provenance),
                "generation_seconds": elapsed,
            },
        }
        (temp / "render.json").write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        _atomic_publish_directory(temp, final)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    if not validate_cached_task(task, outdir):
        raise AssertionError("newly published render did not validate")
    return True


def boundary_frames(decision: dict[str, Any]) -> tuple[int, int]:
    if set(decision) != {"kind", "pause_ms", "crossfade_ms"}:
        raise RenderContractError("boundary decision fields are invalid")
    pause_ms = decision["pause_ms"]
    crossfade_ms = decision["crossfade_ms"]
    if (
        isinstance(pause_ms, bool)
        or not isinstance(pause_ms, int)
        or pause_ms < 0
        or isinstance(crossfade_ms, bool)
        or not isinstance(crossfade_ms, int)
        or crossfade_ms < 0
        or (pause_ms and crossfade_ms)
    ):
        raise RenderContractError("boundary must use a non-negative pause or crossfade")
    return (
        round(SAMPLE_RATE * pause_ms / 1000),
        round(SAMPLE_RATE * crossfade_ms / 1000),
    )


def crossfade_weights(frames: int) -> tuple[float, ...]:
    if isinstance(frames, bool) or not isinstance(frames, int) or frames <= 0:
        raise RenderContractError("crossfade frame count must be a positive integer")
    return tuple((index + 1) / (frames + 1) for index in range(frames))


def _validated_task_outputs(
    tasks: list[dict[str, Any]], outdir: Path
) -> list[dict[str, Any]]:
    outputs: list[dict[str, Any]] = []
    for task in tasks:
        if not validate_cached_task(task, outdir):
            raise RenderContractError("chapter assembly requires a complete task cache")
        _, wav_path, sidecar_path = cache_paths(outdir, task["input_sha256"])
        sidecar_sha256 = sha256_file(sidecar_path)
        sidecar = load_json_object(sidecar_path)
        if (
            sha256_file(sidecar_path) != sidecar_sha256
            or sha256_file(wav_path) != sidecar["audio"]["sha256"]
            or _wav_metadata(wav_path)["frames"] != sidecar["audio"]["frames"]
        ):
            raise RenderContractError("task output changed while collecting evidence")
        outputs.append(
            {
                "input_sha256": task["input_sha256"],
                "audio_sha256": sidecar["audio"]["sha256"],
                "frames": sidecar["audio"]["frames"],
                "sidecar_sha256": sidecar_sha256,
            }
        )
    return outputs


def build_chapter_assembly_input(
    chapter_id: str,
    tasks: list[dict[str, Any]],
    task_outputs: list[dict[str, Any]],
) -> dict[str, Any]:
    if (
        SAFE_ID_RE.fullmatch(chapter_id) is None
        or not tasks
        or len(task_outputs) != len(tasks)
    ):
        raise RenderContractError("chapter assembly requires a safe id and tasks")
    segments: list[dict[str, Any]] = []
    previous_entry: dict[str, Any] | None = None
    for task, output in zip(tasks, task_outputs, strict=True):
        entries = _task_entries(task)
        if any(entry["chapter_id"] != chapter_id for entry in entries):
            raise RenderContractError(
                "chapter assembly task belongs to another chapter"
            )
        decision = boundary_decision(previous_entry, entries[0])
        boundary_frames(decision)
        if not isinstance(output, dict) or set(output) != {
            "input_sha256",
            "audio_sha256",
            "frames",
            "sidecar_sha256",
        }:
            raise RenderContractError("chapter task output evidence is invalid")
        if output["input_sha256"] != task["input_sha256"]:
            raise RenderContractError("chapter task output belongs to another input")
        _sha256(output["audio_sha256"], "chapter task audio_sha256")
        _sha256(output["sidecar_sha256"], "chapter task sidecar_sha256")
        if (
            isinstance(output["frames"], bool)
            or not isinstance(output["frames"], int)
            or output["frames"] <= 0
        ):
            raise RenderContractError("chapter task frame count is invalid")
        segments.append(
            {
                "input_sha256": task["input_sha256"],
                "audio_sha256": output["audio_sha256"],
                "frames": output["frames"],
                "sidecar_sha256": output["sidecar_sha256"],
                "entry_ids": [entry["id"] for entry in entries],
                "boundary_before": decision,
            }
        )
        previous_entry = entries[-1]
    return {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "renderer": {
            "name": RENDERER_NAME,
            "version": RENDERER_VERSION,
            "sample_rate": SAMPLE_RATE,
            "wav_subtype": WAV_SUBTYPE,
        },
        "boundary_policy": copy.deepcopy(BOUNDARY_POLICY),
        "container_profile": CHAPTER_CONTAINER_PROFILE,
        "chapter_id": chapter_id,
        "segments": segments,
    }


def _validate_assembly_directory(
    final: Path, digest: str, assembly_input: dict[str, Any]
) -> dict[str, Any] | None:
    if not final.exists():
        return None
    if final.is_symlink() or not final.is_dir():
        raise RenderContractError(f"invalid content-addressed assembly: {final}")
    inventory: set[str] = set()
    for path in final.iterdir():
        if path.is_symlink() or not path.is_file():
            raise RenderContractError(f"assembly contains an unsafe entry: {path}")
        inventory.add(path.name)
    if inventory != {"audio.wav", "render.json"}:
        raise RenderContractError(f"partial content-addressed assembly: {final}")
    wav_path = final / "audio.wav"
    sidecar_path = final / "render.json"
    sidecar = load_json_object(sidecar_path)
    is_master = "dialogue" in assembly_input
    sidecar_fields = {
        "schema_version",
        "input_sha256",
        "input",
        "audio",
        "timing",
        "timing_sha256",
    }
    if is_master:
        sidecar_fields.update({"chapter_starts", "chapter_starts_sha256"})
    if (
        set(sidecar) != sidecar_fields
        or sidecar.get("schema_version") != ASSEMBLY_SCHEMA_VERSION
    ):
        raise RenderContractError(f"stale assembly schema: {sidecar_path}")
    if (
        sidecar["input_sha256"] != digest
        or sidecar["input"] != assembly_input
        or content_sha256(sidecar["input"]) != digest
    ):
        raise RenderContractError(f"stale or corrupt assembly sidecar: {sidecar_path}")
    audio = sidecar["audio"]
    if not isinstance(audio, dict) or set(audio) != {
        "channels",
        "sample_rate",
        "frames",
        "sample_width_bytes",
        "container_profile",
        "sha256",
        "duration_seconds",
    }:
        raise RenderContractError(f"assembly audio metadata is invalid: {sidecar_path}")
    container_profile = assembly_input.get("container_profile")
    metadata = _assembly_wav_metadata(wav_path, container_profile)
    if (
        metadata["channels"] != 1
        or metadata["sample_rate"] != SAMPLE_RATE
        or metadata["sample_width_bytes"] != PRODUCTION_SAMPLE_WIDTH_BYTES
        or metadata["frames"] <= 0
        or any(audio.get(field) != value for field, value in metadata.items())
        or audio.get("sha256") != sha256_file(wav_path)
        or audio.get("duration_seconds") != metadata["frames"] / SAMPLE_RATE
    ):
        raise RenderContractError(f"assembly WAV evidence mismatch: {wav_path}")
    timing = sidecar["timing"]
    segments = assembly_input.get("segments")
    if (
        not isinstance(segments, list)
        or not segments
        or not isinstance(timing, list)
        or len(timing) != len(segments)
    ):
        raise RenderContractError(f"assembly timing inventory mismatch: {sidecar_path}")
    prior_end = 0
    for index, (segment, item) in enumerate(zip(segments, timing, strict=True)):
        timing_fields = {
            *segment,
            "start_frame",
            "end_frame",
            "start_seconds",
            "end_seconds",
        }
        if not isinstance(item, dict) or set(item) != timing_fields:
            raise RenderContractError(
                f"assembly timing fields mismatch: {sidecar_path}"
            )
        if any(item.get(field) != value for field, value in segment.items()):
            raise RenderContractError(
                f"assembly timing segment mismatch: {sidecar_path}"
            )
        start = item["start_frame"]
        end = item["end_frame"]
        pause_frames, crossfade_frames = boundary_frames(segment["boundary_before"])
        expected_start = prior_end + pause_frames - crossfade_frames
        if (
            isinstance(start, bool)
            or not isinstance(start, int)
            or isinstance(end, bool)
            or not isinstance(end, int)
            or start != expected_start
            or end <= max(start, prior_end - crossfade_frames)
            or end - start != segment.get("frames")
            or item["start_seconds"] != start / SAMPLE_RATE
            or item["end_seconds"] != end / SAMPLE_RATE
            or (index == 0 and start != 0)
        ):
            raise RenderContractError(
                f"assembly timing values mismatch: {sidecar_path}"
            )
        prior_end = end
    if prior_end != metadata["frames"]:
        raise RenderContractError(f"assembly timing duration mismatch: {sidecar_path}")
    if sidecar["timing_sha256"] != content_sha256(timing):
        raise RenderContractError(f"assembly timing checksum mismatch: {sidecar_path}")
    if is_master:
        expected_chapter_starts = [
            {
                "chapter_id": segment["chapter_id"],
                "input_sha256": segment["input_sha256"],
                "audio_sha256": segment["audio_sha256"],
                "frames": segment["frames"],
                "timing_sha256": segment["timing_sha256"],
                "sidecar_sha256": segment["sidecar_sha256"],
                "start_frame": item["start_frame"],
                "start_seconds": item["start_seconds"],
            }
            for segment, item in zip(segments, timing, strict=True)
        ]
        if sidecar["chapter_starts"] != expected_chapter_starts or sidecar[
            "chapter_starts_sha256"
        ] != content_sha256(expected_chapter_starts):
            raise RenderContractError(
                f"assembly chapter-start evidence mismatch: {sidecar_path}"
            )
    return sidecar


def _atomic_assemble_chapter(
    chapter_id: str,
    tasks: list[dict[str, Any]],
    outdir: Path,
) -> tuple[str, bool]:
    import numpy as np
    import soundfile as sf

    task_outputs = _validated_task_outputs(tasks, outdir)
    assembly_input = build_chapter_assembly_input(chapter_id, tasks, task_outputs)
    digest = content_sha256(assembly_input)
    final = outdir / "units" / "chapters" / chapter_id / digest
    _validate_output_directory_chain(outdir, final.parent)
    if _validate_assembly_directory(final, digest, assembly_input) is not None:
        return digest, False

    buffers: list[Any] = []
    timing: list[dict[str, Any]] = []
    frame_cursor = 0
    for task, segment in zip(tasks, assembly_input["segments"], strict=True):
        _, source_wav, source_sidecar = cache_paths(outdir, task["input_sha256"])
        source_metadata = _wav_metadata(source_wav)
        if (
            sha256_file(source_sidecar) != segment["sidecar_sha256"]
            or sha256_file(source_wav) != segment["audio_sha256"]
            or source_metadata["frames"] != segment["frames"]
        ):
            raise RenderContractError("task output changed during chapter assembly")
        samples, sample_rate = sf.read(source_wav, dtype="float32", always_2d=False)
        if (
            sample_rate != SAMPLE_RATE
            or samples.ndim != 1
            or len(samples) != segment["frames"]
            or sha256_file(source_wav) != segment["audio_sha256"]
            or sha256_file(source_sidecar) != segment["sidecar_sha256"]
        ):
            raise RuntimeError(f"unexpected cache WAV format: {source_wav}")
        pause_frames, crossfade_frames = boundary_frames(segment["boundary_before"])
        if pause_frames:
            buffers.append(np.zeros(pause_frames, dtype=np.float32))
            frame_cursor += pause_frames
        start_frame = frame_cursor
        if crossfade_frames:
            if (
                not buffers
                or len(buffers[-1]) < crossfade_frames
                or len(samples) < crossfade_frames
            ):
                raise RenderContractError(
                    "rendered task is too short for the pinned same-speaker crossfade"
                )
            weights = np.asarray(crossfade_weights(crossfade_frames), dtype=np.float32)
            buffers[-1][-crossfade_frames:] = (
                buffers[-1][-crossfade_frames:] * (1.0 - weights)
                + samples[:crossfade_frames] * weights
            )
            start_frame -= crossfade_frames
            samples = samples[crossfade_frames:]
        buffers.append(samples)
        frame_cursor += len(samples)
        timing.append(
            {
                **segment,
                "start_frame": start_frame,
                "end_frame": frame_cursor,
                "start_seconds": start_frame / SAMPLE_RATE,
                "end_seconds": frame_cursor / SAMPLE_RATE,
            }
        )
    audio = np.concatenate(buffers) if buffers else np.empty(0, dtype=np.float32)
    if audio.size == 0 or len(audio) != frame_cursor:
        raise RuntimeError(f"chapter {chapter_id} has invalid assembled audio")
    final.parent.mkdir(parents=True, exist_ok=True)
    temp = final.parent / f".{digest}.{uuid.uuid4().hex}.tmp"
    temp.mkdir()
    try:
        temp_wav = temp / "audio.wav"
        sf.write(temp_wav, audio, SAMPLE_RATE, format="WAV", subtype=WAV_SUBTYPE)
        metadata = _assembly_wav_metadata(temp_wav, CHAPTER_CONTAINER_PROFILE)
        sidecar = {
            "schema_version": ASSEMBLY_SCHEMA_VERSION,
            "input_sha256": digest,
            "input": assembly_input,
            "audio": {
                **metadata,
                "sha256": sha256_file(temp_wav),
                "duration_seconds": metadata["frames"] / metadata["sample_rate"],
            },
            "timing": timing,
            "timing_sha256": content_sha256(timing),
        }
        (temp / "render.json").write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        _atomic_publish_directory(temp, final)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    _validate_assembly_directory(final, digest, assembly_input)
    return digest, True


def _validated_chapter_outputs(
    chapters: list[dict[str, str]], outdir: Path
) -> list[dict[str, Any]]:
    outputs: list[dict[str, Any]] = []
    for chapter in chapters:
        if set(chapter) != {"chapter_id", "input_sha256"}:
            raise RenderContractError("master chapter reference fields are invalid")
        chapter_id = chapter["chapter_id"]
        digest = chapter["input_sha256"]
        if not isinstance(chapter_id, str) or SAFE_ID_RE.fullmatch(chapter_id) is None:
            raise RenderContractError("master chapter id is invalid")
        _sha256(digest, "master chapter input_sha256")
        source = outdir / "units" / "chapters" / chapter_id / digest
        if source.is_symlink() or not source.is_dir():
            raise RenderContractError(
                f"master requires completed chapter assembly: {source}"
            )
        sidecar_path = source / "render.json"
        source_sidecar = load_json_object(sidecar_path)
        source_input = source_sidecar.get("input")
        validated_sidecar = (
            _validate_assembly_directory(source, digest, source_input)
            if isinstance(source_input, dict)
            else None
        )
        if (
            not isinstance(source_input, dict)
            or content_sha256(source_input) != digest
            or source_input.get("chapter_id") != chapter_id
            or validated_sidecar is None
        ):
            raise RenderContractError(f"master chapter evidence is corrupt: {source}")
        sidecar_sha256 = sha256_file(sidecar_path)
        if (
            load_json_object(sidecar_path) != validated_sidecar
            or sha256_file(sidecar_path) != sidecar_sha256
            or sha256_file(source / "audio.wav") != validated_sidecar["audio"]["sha256"]
        ):
            raise RenderContractError(
                "chapter output changed while collecting evidence"
            )
        outputs.append(
            {
                "chapter_id": chapter_id,
                "input_sha256": digest,
                "audio_sha256": validated_sidecar["audio"]["sha256"],
                "frames": validated_sidecar["audio"]["frames"],
                "timing_sha256": validated_sidecar["timing_sha256"],
                "sidecar_sha256": sidecar_sha256,
            }
        )
    return outputs


def build_master_assembly_input(
    dialogue: str, chapters: list[dict[str, Any]]
) -> dict[str, Any]:
    if CHARACTER_ID_RE.fullmatch(dialogue) is None or not chapters:
        raise RenderContractError("master assembly requires a dialogue and chapters")
    segments: list[dict[str, Any]] = []
    for index, chapter in enumerate(chapters):
        if set(chapter) != {
            "chapter_id",
            "input_sha256",
            "audio_sha256",
            "frames",
            "timing_sha256",
            "sidecar_sha256",
        }:
            raise RenderContractError("master chapter fields are invalid")
        chapter_id = chapter["chapter_id"]
        if not isinstance(chapter_id, str) or SAFE_ID_RE.fullmatch(chapter_id) is None:
            raise RenderContractError("master chapter id is invalid")
        _sha256(chapter["input_sha256"], "master chapter input_sha256")
        _sha256(chapter["audio_sha256"], "master chapter audio_sha256")
        _sha256(chapter["timing_sha256"], "master chapter timing_sha256")
        _sha256(chapter["sidecar_sha256"], "master chapter sidecar_sha256")
        if (
            isinstance(chapter["frames"], bool)
            or not isinstance(chapter["frames"], int)
            or chapter["frames"] <= 0
        ):
            raise RenderContractError("master chapter frame count is invalid")
        policy = BOUNDARY_POLICY["chapter_boundary"]
        boundary = (
            {"kind": "start", "pause_ms": 0, "crossfade_ms": 0}
            if index == 0
            else {
                "kind": "chapter-boundary",
                "pause_ms": policy["pause_ms"],
                "crossfade_ms": policy["crossfade_ms"],
            }
        )
        boundary_frames(boundary)
        segments.append({**chapter, "boundary_before": boundary})
    if len({segment["chapter_id"] for segment in segments}) != len(segments):
        raise RenderContractError("master chapter ids must be unique")
    return {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "renderer": {
            "name": RENDERER_NAME,
            "version": RENDERER_VERSION,
            "sample_rate": SAMPLE_RATE,
            "wav_subtype": WAV_SUBTYPE,
        },
        "boundary_policy": copy.deepcopy(BOUNDARY_POLICY),
        "container_profile": MASTER_CONTAINER_PROFILE,
        "dialogue": dialogue,
        "segments": segments,
    }


def _atomic_assemble_master(
    dialogue: str,
    chapters: list[dict[str, str]],
    outdir: Path,
) -> tuple[str, bool]:
    import numpy as np
    import soundfile as sf

    chapter_outputs = _validated_chapter_outputs(chapters, outdir)
    assembly_input = build_master_assembly_input(dialogue, chapter_outputs)
    digest = content_sha256(assembly_input)
    final = outdir / "units" / "complete" / digest
    _validate_output_directory_chain(outdir, final.parent)
    if _validate_assembly_directory(final, digest, assembly_input) is not None:
        return digest, False
    timing: list[dict[str, Any]] = []
    frame_cursor = 0
    final.parent.mkdir(parents=True, exist_ok=True)
    temp = final.parent / f".{digest}.{uuid.uuid4().hex}.tmp"
    temp.mkdir()
    try:
        temp_wav = temp / "audio.wav"
        with sf.SoundFile(
            temp_wav,
            mode="w",
            samplerate=SAMPLE_RATE,
            channels=1,
            format="RF64",
            subtype=WAV_SUBTYPE,
        ) as output_audio:
            for segment in assembly_input["segments"]:
                source = (
                    outdir
                    / "units"
                    / "chapters"
                    / segment["chapter_id"]
                    / segment["input_sha256"]
                )
                if source.is_symlink() or not source.is_dir():
                    raise RenderContractError(
                        f"master requires completed chapter assembly: {source}"
                    )
                sidecar_path = source / "render.json"
                source_sidecar = load_json_object(sidecar_path)
                source_input = source_sidecar.get("input")
                validated_sidecar = (
                    _validate_assembly_directory(
                        source,
                        segment["input_sha256"],
                        source_input,
                    )
                    if isinstance(source_input, dict)
                    else None
                )
                if (
                    not isinstance(source_input, dict)
                    or content_sha256(source_input) != segment["input_sha256"]
                    or source_input.get("chapter_id") != segment["chapter_id"]
                    or validated_sidecar is None
                ):
                    raise RenderContractError(
                        f"master chapter evidence is corrupt: {source}"
                    )
                if (
                    validated_sidecar["audio"]["sha256"] != segment["audio_sha256"]
                    or validated_sidecar["audio"]["frames"] != segment["frames"]
                    or content_sha256(validated_sidecar["timing"])
                    != segment["timing_sha256"]
                    or sha256_file(sidecar_path) != segment["sidecar_sha256"]
                ):
                    raise RenderContractError("chapter changed during master assembly")
                source_wav = source / "audio.wav"
                pause_frames, crossfade_frames = boundary_frames(
                    segment["boundary_before"]
                )
                if crossfade_frames:
                    raise AssertionError("chapter boundary policy must never crossfade")
                remaining_pause = pause_frames
                while remaining_pause:
                    block_frames = min(MASTER_STREAM_BLOCK_FRAMES, remaining_pause)
                    output_audio.write(np.zeros(block_frames, dtype=np.float32))
                    remaining_pause -= block_frames
                    frame_cursor += block_frames
                start_frame = frame_cursor
                copied_frames = 0
                with sf.SoundFile(source_wav, mode="r") as source_audio:
                    if (
                        source_audio.samplerate != SAMPLE_RATE
                        or source_audio.channels != 1
                        or source_audio.frames != segment["frames"]
                    ):
                        raise RenderContractError(
                            f"master chapter stream is invalid: {source_wav}"
                        )
                    while copied_frames < segment["frames"]:
                        block_frames = min(
                            MASTER_STREAM_BLOCK_FRAMES,
                            segment["frames"] - copied_frames,
                        )
                        samples = source_audio.read(
                            frames=block_frames,
                            dtype="float32",
                            always_2d=False,
                        )
                        if samples.ndim != 1 or len(samples) != block_frames:
                            raise RenderContractError(
                                f"master chapter stream truncated: {source_wav}"
                            )
                        output_audio.write(samples)
                        copied_frames += block_frames
                        frame_cursor += block_frames
                if (
                    sha256_file(source_wav) != segment["audio_sha256"]
                    or sha256_file(sidecar_path) != segment["sidecar_sha256"]
                ):
                    raise RenderContractError(
                        "chapter changed during streamed master assembly"
                    )
                timing.append(
                    {
                        **segment,
                        "start_frame": start_frame,
                        "end_frame": frame_cursor,
                        "start_seconds": start_frame / SAMPLE_RATE,
                        "end_seconds": frame_cursor / SAMPLE_RATE,
                    }
                )
        metadata = _assembly_wav_metadata(temp_wav, MASTER_CONTAINER_PROFILE)
        if metadata["frames"] != frame_cursor:
            raise RenderContractError(
                "streamed master frame count differs from its timing inventory"
            )
        sidecar = {
            "schema_version": ASSEMBLY_SCHEMA_VERSION,
            "input_sha256": digest,
            "input": assembly_input,
            "audio": {
                **metadata,
                "sha256": sha256_file(temp_wav),
                "duration_seconds": metadata["frames"] / metadata["sample_rate"],
            },
            "timing": timing,
            "timing_sha256": content_sha256(timing),
        }
        sidecar["chapter_starts"] = [
            {
                "chapter_id": segment["chapter_id"],
                "input_sha256": segment["input_sha256"],
                "audio_sha256": segment["audio_sha256"],
                "frames": segment["frames"],
                "timing_sha256": segment["timing_sha256"],
                "sidecar_sha256": segment["sidecar_sha256"],
                "start_frame": item["start_frame"],
                "start_seconds": item["start_seconds"],
            }
            for segment, item in zip(assembly_input["segments"], timing, strict=True)
        ]
        sidecar["chapter_starts_sha256"] = content_sha256(sidecar["chapter_starts"])
        (temp / "render.json").write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        _atomic_publish_directory(temp, final)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    _validate_assembly_directory(final, digest, assembly_input)
    return digest, True


def resolve_full_dialogue_assembly(
    plan: dict[str, Any], outdir: Path
) -> dict[str, Any]:
    """Resolve and verify the exact raw assembly required by mastering."""

    validate_render_plan(plan)
    if plan["scope"] != "full-dialogue":
        raise RenderContractError(
            "mastering requires a full-dialogue render plan, not a chapter subset"
        )
    if not outdir.is_absolute():
        raise RenderContractError("renderer outdir must be absolute")
    chapters: list[dict[str, Any]] = []
    for chapter_id in plan["chapters"]:
        tasks = [
            task
            for task in plan["tasks"]
            if _task_entries(task)[0]["chapter_id"] == chapter_id
        ]
        task_outputs = _validated_task_outputs(tasks, outdir)
        assembly_input = build_chapter_assembly_input(chapter_id, tasks, task_outputs)
        digest = content_sha256(assembly_input)
        directory = outdir / "units" / "chapters" / chapter_id / digest
        sidecar = _validate_assembly_directory(directory, digest, assembly_input)
        if sidecar is None:
            raise RenderContractError(
                f"missing completed chapter assembly for {chapter_id!r}: {directory}"
            )
        sidecar_path = directory / "render.json"
        sidecar_sha256 = sha256_file(sidecar_path)
        if (
            load_json_object(sidecar_path) != sidecar
            or sha256_file(sidecar_path) != sidecar_sha256
            or sha256_file(directory / "audio.wav") != sidecar["audio"]["sha256"]
        ):
            raise RenderContractError(
                "chapter output changed while resolving full dialogue"
            )
        chapters.append(
            {
                "chapter_id": chapter_id,
                "input_sha256": digest,
                "audio_path": str((directory / "audio.wav").resolve()),
                "audio_sha256": sidecar["audio"]["sha256"],
                "frames": sidecar["audio"]["frames"],
                "duration_seconds": sidecar["audio"]["duration_seconds"],
                "container_profile": sidecar["audio"]["container_profile"],
                "timing_sha256": sidecar["timing_sha256"],
                "sidecar_sha256": sidecar_sha256,
                "timing": copy.deepcopy(sidecar["timing"]),
            }
        )

    master_input = build_master_assembly_input(
        plan["dialogue"],
        [
            {
                "chapter_id": chapter["chapter_id"],
                "input_sha256": chapter["input_sha256"],
                "audio_sha256": chapter["audio_sha256"],
                "frames": chapter["frames"],
                "timing_sha256": chapter["timing_sha256"],
                "sidecar_sha256": chapter["sidecar_sha256"],
            }
            for chapter in chapters
        ],
    )
    master_digest = content_sha256(master_input)
    master_directory = outdir / "units" / "complete" / master_digest
    master_sidecar = _validate_assembly_directory(
        master_directory, master_digest, master_input
    )
    if master_sidecar is None:
        raise RenderContractError(
            f"missing completed full-dialogue assembly: {master_directory}"
        )
    master_sidecar_path = master_directory / "render.json"
    master_sidecar_sha256 = sha256_file(master_sidecar_path)
    if (
        load_json_object(master_sidecar_path) != master_sidecar
        or sha256_file(master_sidecar_path) != master_sidecar_sha256
        or sha256_file(master_directory / "audio.wav")
        != master_sidecar["audio"]["sha256"]
    ):
        raise RenderContractError("master output changed while resolving full dialogue")
    return {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "status": "verified-full-dialogue-render-assembly",
        "dialogue": plan["dialogue"],
        "render_plan_sha256": plan["plan_sha256"],
        "chapters": chapters,
        "complete": {
            "input_sha256": master_digest,
            "audio_path": str((master_directory / "audio.wav").resolve()),
            "audio_sha256": master_sidecar["audio"]["sha256"],
            "frames": master_sidecar["audio"]["frames"],
            "duration_seconds": master_sidecar["audio"]["duration_seconds"],
            "container_profile": master_sidecar["audio"]["container_profile"],
            "timing_sha256": master_sidecar["timing_sha256"],
            "sidecar_sha256": master_sidecar_sha256,
            "chapter_starts_sha256": master_sidecar["chapter_starts_sha256"],
            "chapter_starts": copy.deepcopy(master_sidecar["chapter_starts"]),
            "timing": copy.deepcopy(master_sidecar["timing"]),
        },
    }


def _plan_summary(plan: dict[str, Any], outdir: Path) -> dict[str, Any]:
    validate_render_plan(plan)
    pending = 0
    cached = 0
    tasks = []
    for task in plan["tasks"]:
        is_cached = validate_cached_task(task, outdir)
        cached += int(is_cached)
        pending += int(not is_cached)
        tasks.append(
            {
                "order": task["order"],
                "input_sha256": task["input_sha256"],
                "entry_ids": [entry["id"] for entry in _task_entries(task)],
                "chapter_id": _task_entries(task)[0]["chapter_id"],
                "unit_kind": task["input"]["utterance"]["unit_kind"],
                "status": "cached" if is_cached else "pending",
            }
        )
    return {
        "schema_version": RENDER_PLAN_SCHEMA_VERSION,
        "status": "dots-render-plan-summary",
        "plan_sha256": plan["plan_sha256"],
        "dialogue": plan["dialogue"],
        "scope": plan["scope"],
        "chapters": plan["chapters"],
        "boundary_policy": plan["boundary_policy"],
        "task_count": len(tasks),
        "cached": cached,
        "pending": pending,
        "tasks": tasks,
    }


def _load_dots_runtime(
    plan: dict[str, Any], runtime_provenance: dict[str, Any]
) -> Any:
    model_path = Path(runtime_provenance["model"]["snapshot_path"])
    loaded_python_modules = {
        module: importlib.import_module(module)
        for module, _ in PYTHON_IMPORT_DISTRIBUTIONS
    }
    validate_loaded_python_imports(
        runtime_provenance["python_imports"], loaded_python_modules
    )
    torch = loaded_python_modules["torch"]
    DotsTtsRuntime = loaded_python_modules["dots_tts.runtime"].DotsTtsRuntime

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is required for production rendering")
    precisions = {
        task["input"]["voice"]["generation"]["precision"] for task in plan["tasks"]
    }
    if len(precisions) != 1:
        raise RuntimeError("selected voices disagree on Dots precision")
    return DotsTtsRuntime.from_pretrained(
        str(model_path),
        precision=precisions.pop(),
        max_generate_length=MAX_GENERATE_LENGTH,
    )


def execute_render_plan(
    plan: dict[str, Any],
    outdir: Path,
    runtime_provenance: dict[str, Any],
) -> dict[str, Any]:
    """Render pending tasks and assemble a complete plan.

    Cache validation intentionally precedes runtime loading so a fully cached
    plan can be assembled without importing Dots or initializing CUDA.
    """

    validate_render_plan(plan)
    cache_states = [
        validate_cached_task(task, outdir) for task in plan["tasks"]
    ]
    pending_tasks = [
        task
        for task, is_cached in zip(plan["tasks"], cache_states, strict=True)
        if not is_cached
    ]
    runtime = (
        _load_dots_runtime(plan, runtime_provenance) if pending_tasks else None
    )

    rendered = 0
    resumed = 0
    for task, is_cached in zip(plan["tasks"], cache_states, strict=True):
        if is_cached:
            resumed += 1
            continue
        if render_task(task, outdir, runtime, runtime_provenance):
            rendered += 1
        else:
            resumed += 1

    units: list[dict[str, Any]] = []
    for chapter_id in plan["chapters"]:
        chapter_tasks = [
            task
            for task in plan["tasks"]
            if _task_entries(task)[0]["chapter_id"] == chapter_id
        ]
        digest, created = _atomic_assemble_chapter(
            chapter_id, chapter_tasks, outdir
        )
        units.append(
            {
                "chapter_id": chapter_id,
                "input_sha256": digest,
                "status": "rendered" if created else "cached",
            }
        )
    master_digest, master_created = _atomic_assemble_master(
        plan["dialogue"],
        [
            {
                "chapter_id": unit["chapter_id"],
                "input_sha256": unit["input_sha256"],
            }
            for unit in units
        ],
        outdir,
    )
    return {
        "dialogue": plan["dialogue"],
        "plan_sha256": plan["plan_sha256"],
        "rendered_tasks": rendered,
        "resumed_tasks": resumed,
        "units": units,
        "complete_unit": {
            "input_sha256": master_digest,
            "status": "rendered" if master_created else "cached",
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--script", type=Path, required=True)
    parser.add_argument("--cast", type=Path, default=Path("audio/cast.json"))
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--chapters", default="all")
    parser.add_argument(
        "--reference",
        action="append",
        default=[],
        metavar="CHARACTER_ID=/ABSOLUTE/REFERENCE.WAV",
    )
    parser.add_argument("--hf-cache-dir", type=Path, default=Path("/mnt/models/hf/hub"))
    parser.add_argument(
        "--write-plan",
        action="store_true",
        help="persist the current content-addressed plan without rendering",
    )
    parser.add_argument(
        "--execute-plan",
        type=Path,
        help="saved content-addressed plan artifact required by --render",
    )
    parser.add_argument(
        "--expected-plan-sha256",
        help="reviewed plan SHA-256 required by --render",
    )
    parser.add_argument(
        "--render",
        action="store_true",
        help="run CUDA synthesis; without this flag the command only validates and plans",
    )
    args = parser.parse_args()
    try:
        repo_root = args.repo_root.expanduser().resolve()
        script_path = args.script.expanduser()
        cast_path = args.cast.expanduser()
        raw_outdir = args.outdir.expanduser()
        if raw_outdir.is_symlink() or (raw_outdir.exists() and not raw_outdir.is_dir()):
            raise RenderContractError("--outdir must be a regular directory path")
        outdir = raw_outdir.resolve()
        screenplay, cast, acceptance = load_accepted_render_inputs(
            script_path,
            cast_path,
            repo_root=repo_root,
        )
        overrides = parse_reference_overrides(args.reference)
        renderer_code_sha = sha256_file(Path(__file__).resolve())
        hf_cache_dir = args.hf_cache_dir.expanduser().resolve()
        runtime_provenance = resolve_runtime_provenance(hf_cache_dir)
        plan = build_render_plan(
            screenplay,
            cast,
            acceptance=acceptance,
            renderer_code_sha256=renderer_code_sha,
            runtime_provenance=runtime_provenance,
            repo_root=repo_root,
            reference_overrides=overrides,
            chapter_selection=args.chapters,
        )
        if not args.render:
            if args.execute_plan is not None or args.expected_plan_sha256 is not None:
                raise RenderContractError(
                    "--execute-plan and --expected-plan-sha256 require --render"
                )
            written = write_render_plan(plan, outdir) if args.write_plan else None
            summary = _plan_summary(plan, outdir)
            if written is not None:
                summary["plan_path"] = str(written)
            print(json.dumps(summary, indent=2, sort_keys=True))
            return 0

        if args.write_plan:
            raise RenderContractError(
                "--write-plan and --render are separate operations"
            )
        if args.execute_plan is None or args.expected_plan_sha256 is None:
            raise RenderContractError(
                "--render requires --execute-plan and --expected-plan-sha256"
            )
        if plan["scope"] != "full-dialogue":
            raise RenderContractError(
                "production execution requires the full-dialogue accepted screenplay plan"
            )
        execute_path = args.execute_plan.expanduser().resolve()
        load_render_plan_artifact(
            execute_path,
            expected_sha256=args.expected_plan_sha256,
            current_plan=plan,
        )

        execution_runtime_provenance = resolve_runtime_provenance(hf_cache_dir)
        if execution_runtime_provenance != runtime_provenance:
            raise RenderContractError(
                "runtime model or Dots source changed after plan reconstruction"
            )
        print(
            json.dumps(
                execute_render_plan(plan, outdir, runtime_provenance),
                indent=2,
                sort_keys=True,
            )
        )
        return 0
    except (RenderContractError, RuntimeError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
