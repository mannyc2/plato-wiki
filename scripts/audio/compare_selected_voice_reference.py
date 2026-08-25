#!/usr/bin/env python3
"""Embed one selected cast WAV and compare it with the anonymous voice bank.

Planning, comparison, and verification are local and GPU-free. ``execute`` is
the only CUDA path.  The result is acoustic review evidence only: it never
assigns a character to an anonymous cluster or family and never writes the cast
registry.
"""

from __future__ import annotations

import argparse
import contextlib
import copy
import hashlib
import importlib.metadata
import json
import math
import os
import random
import shutil
import sys
import tempfile
import wave
from collections.abc import Iterator, Sequence
from pathlib import Path
from typing import Any

import build_cross_video_voice_bank as voice_bank
import cluster_audiobook_speakers as core


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
CORE_PATH = Path(core.__file__).resolve()
VOICE_BANK_GENERATOR_PATH = Path(voice_bank.__file__).resolve()
DEFAULT_CAST = Path("audio/cast.json")
DEFAULT_REFERENCE = Path(
    "scratch/crito-audio/auditions/dots-youtube-socrates/"
    "youtube-socrates-reference.wav"
)
EXPECTED_REFERENCE_SHA256 = (
    "abe6140aff0b92816150330d6dce5beab6474e8da215f5cad81017f751aefd30"
)
EXPECTED_REFERENCE_DURATION_SECONDS = 6.29
EXPECTED_CHARACTER_ID = "socrates"
EXPECTED_VOICE_BANK_SHA256 = (
    "73815a50001eb4b21c52dd7d1bff7d1749c6bcad671a4e085ff5ebab372d43d2"
)
DEFAULT_VOICE_BANK = Path(
    "scratch/audio-cross-video-voice-bank"
) / EXPECTED_VOICE_BANK_SHA256 / "voice-bank.json"
PLAN_ROOT = Path("scratch/audio-selected-reference-comparison/plans")
EMBEDDING_ROOT = Path("scratch/audio-selected-reference-embeddings")
COMPARISON_ROOT = Path("scratch/audio-selected-reference-comparison/artifacts")
REMOTE_ROOT = Path("/mnt/models/dev/plato-audio")
REMOTE_PYTHON = Path("/mnt/models/dev/plato-dots/.venv/bin/python")
REMOTE_CACHE = Path("/mnt/models/hf")
SCHEMA_VERSION = 1
PLAN_STATUS = "selected-reference-camplusplus-plan-v1"
EMBEDDING_STATUS = "selected-reference-camplusplus-proof-v1"
COMPARISON_STATUS = "anonymous-external-acoustic-comparison-v1"
MAX_JSON_BYTES = 64 * 1024 * 1024
MAX_WAV_BYTES = 512 * 1024 * 1024
SHA256_KEYS = {
    "castFileSha256",
    "selectedVoiceRecordSha256",
    "sha256",
    "fileSha256",
    "generatorSha256",
    "coreSha256",
}
IDENTITY_POLICY = {
    "inputCastLabelIsProvenanceOnly": True,
    "characterIdentityInferenceAllowed": False,
    "clusterIdentityAssignmentAllowed": False,
    "familyIdentityAssignmentAllowed": False,
    "socratesAnchorClaimAllowed": False,
    "castRegistryWritesAllowed": False,
    "castSelectionAllowed": False,
    "castCompletionCredit": False,
    "humanListeningRequired": True,
}
LIMITATIONS = {
    "oneReferenceIntervalOnly": True,
    "referenceSpeakerPurityGuaranteed": False,
    "sourceClustersSingleSpeakerGuaranteed": False,
    "sameActorGuaranteed": False,
    "identityResolved": False,
    "calibratedMatchProbabilityAvailable": False,
    "humanListeningRequired": True,
}
EMBEDDING_SPEC = {
    "modelRepository": core.MODEL_REPOSITORY,
    "modelRevision": core.MODEL_REVISION,
    "dotsSourceCommit": core.DOTS_SOURCE_COMMIT,
    "encoder": "CAM++ speaker x-vector",
    "dimension": core.EMBEDDING_DIMENSION,
    "precision": "bfloat16",
    "decoder": "frozen-core ffmpeg mono f32le at encoder sample rate",
    "normalization": "torch.nn.functional.normalize(value.float(), dim=-1)",
    "determinism": copy.deepcopy(core.EMBEDDING_DETERMINISM),
}


class SelectedReferenceComparisonError(ValueError):
    """Raised when selected-reference acoustic evidence is stale or unsafe."""


def canonical_json(value: Any) -> bytes:
    return core.canonical_json(value)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@contextlib.contextmanager
def repo_cwd(root: Path) -> Iterator[None]:
    previous = Path.cwd()
    os.chdir(root)
    try:
        yield
    finally:
        os.chdir(previous)


def input_file(
    path: Path, root: Path, label: str, maximum_bytes: int = MAX_JSON_BYTES
) -> Path:
    candidate = path if path.is_absolute() else root / path
    try:
        resolved = candidate.resolve(strict=True)
        resolved.relative_to(root)
    except FileNotFoundError as error:
        raise SelectedReferenceComparisonError(f"missing {label}: {path}") from error
    except ValueError as error:
        raise SelectedReferenceComparisonError(
            f"{label} escapes the repository: {path}"
        ) from error
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise SelectedReferenceComparisonError(f"{label} traverses a symlink")
        if parent.resolve(strict=False) == root:
            break
    if not resolved.is_file():
        raise SelectedReferenceComparisonError(f"{label} is not a regular file")
    size = resolved.stat().st_size
    if not 0 < size <= maximum_bytes:
        raise SelectedReferenceComparisonError(
            f"{label} exceeds its 1..{maximum_bytes} byte bound"
        )
    return resolved


def read_json(
    path: Path, root: Path, label: str
) -> tuple[dict[str, Any], Path, str]:
    resolved = input_file(path, root, label)
    raw = resolved.read_bytes()
    try:
        value = json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise SelectedReferenceComparisonError(f"cannot parse {label}: {error}") from error
    if not isinstance(value, dict):
        raise SelectedReferenceComparisonError(f"{label} must contain an object")
    return value, resolved, sha256_bytes(raw)


def relative_path(path: Path, root: Path, label: str) -> str:
    try:
        return path.resolve(strict=True).relative_to(root).as_posix()
    except (FileNotFoundError, ValueError) as error:
        raise SelectedReferenceComparisonError(
            f"{label} is not a repository file"
        ) from error


def wav_facts(path: Path) -> dict[str, Any]:
    try:
        with wave.open(str(path), "rb") as handle:
            frames = handle.getnframes()
            rate = handle.getframerate()
            channels = handle.getnchannels()
            width = handle.getsampwidth()
    except (OSError, wave.Error) as error:
        raise SelectedReferenceComparisonError(f"invalid reference WAV: {error}") from error
    if frames <= 0 or rate <= 0 or channels != 1 or width != 2:
        raise SelectedReferenceComparisonError(
            "selected reference must be non-empty mono PCM16 WAV"
        )
    return {
        "frames": frames,
        "sampleRate": rate,
        "channels": channels,
        "sampleWidthBytes": width,
        "durationSeconds": frames / rate,
    }


def unsigned_sha(value: dict[str, Any], field: str) -> str:
    return sha256_bytes(canonical_json({k: v for k, v in value.items() if k != field}))


def selected_voice(cast: dict[str, Any]) -> dict[str, Any]:
    voices = cast.get("voices")
    if not isinstance(voices, list):
        raise SelectedReferenceComparisonError("cast registry voices are missing")
    matches = [
        voice
        for voice in voices
        if isinstance(voice, dict)
        and voice.get("characterId") == EXPECTED_CHARACTER_ID
        and voice.get("status") == "selected"
    ]
    if len(matches) != 1:
        raise SelectedReferenceComparisonError(
            "exactly one selected Socrates voice is required"
        )
    voice = matches[0]
    model = voice.get("model")
    reference = voice.get("reference")
    if (
        not isinstance(model, dict)
        or model.get("repository") != core.MODEL_REPOSITORY
        or model.get("revision") != core.MODEL_REVISION
        or not isinstance(reference, dict)
        or reference.get("relativePath") != DEFAULT_REFERENCE.as_posix()
        or reference.get("localSha256") != EXPECTED_REFERENCE_SHA256
        or reference.get("localDurationSeconds")
        != EXPECTED_REFERENCE_DURATION_SECONDS
    ):
        raise SelectedReferenceComparisonError(
            "selected Socrates voice does not bind the exact required reference/model"
        )
    return voice


def build_plan(
    *,
    repo_root: Path = REPO_ROOT,
    cast_path: Path = DEFAULT_CAST,
    voice_bank_path: Path = DEFAULT_VOICE_BANK,
    generator_path: Path = SCRIPT_PATH,
    core_path: Path = CORE_PATH,
    voice_bank_generator_path: Path = VOICE_BANK_GENERATOR_PATH,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    cast, cast_file, cast_sha = read_json(cast_path, root, "cast registry")
    voice = selected_voice(cast)
    reference = input_file(DEFAULT_REFERENCE, root, "selected reference WAV", MAX_WAV_BYTES)
    if sha256_file(reference) != EXPECTED_REFERENCE_SHA256:
        raise SelectedReferenceComparisonError("selected reference WAV hash changed")
    facts = wav_facts(reference)
    if abs(facts["durationSeconds"] - EXPECTED_REFERENCE_DURATION_SECONDS) > 0.001:
        raise SelectedReferenceComparisonError("selected reference WAV duration changed")
    bank, bank_file, bank_file_sha = read_json(
        voice_bank_path, root, "anonymous voice bank"
    )
    voice_bank.validate_voice_bank(bank)
    if bank.get("voiceBankSha256") != EXPECTED_VOICE_BANK_SHA256:
        raise SelectedReferenceComparisonError("anonymous voice-bank SHA changed")
    generator = input_file(generator_path, root, "comparison generator", 4 * 1024 * 1024)
    frozen_core = input_file(core_path, root, "frozen acoustic core", 4 * 1024 * 1024)
    bank_generator = input_file(
        voice_bank_generator_path,
        root,
        "anonymous voice-bank generator",
        4 * 1024 * 1024,
    )
    plan: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "accepted": False,
        "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
        "selectedReference": {
            "castPath": relative_path(cast_file, root, "cast registry"),
            "castFileSha256": cast_sha,
            "selectedVoiceRecordSha256": sha256_bytes(canonical_json(voice)),
            "inputCharacterId": EXPECTED_CHARACTER_ID,
            "path": relative_path(reference, root, "selected reference WAV"),
            "sha256": EXPECTED_REFERENCE_SHA256,
            "bytes": reference.stat().st_size,
            "wav": facts,
        },
        "voiceBank": {
            "path": relative_path(bank_file, root, "anonymous voice bank"),
            "voiceBankSha256": EXPECTED_VOICE_BANK_SHA256,
            "fileSha256": bank_file_sha,
            "clusterCount": 68,
            "familyCount": 35,
        },
        "embedding": copy.deepcopy(EMBEDDING_SPEC),
        "tools": {
            "generatorPath": relative_path(generator, root, "comparison generator"),
            "generatorSha256": sha256_file(generator),
            "corePath": relative_path(frozen_core, root, "frozen acoustic core"),
            "coreSha256": sha256_file(frozen_core),
            "voiceBankGeneratorPath": relative_path(
                bank_generator, root, "anonymous voice-bank generator"
            ),
            "voiceBankGeneratorSha256": sha256_file(bank_generator),
        },
    }
    plan["planSha256"] = sha256_bytes(canonical_json(plan))
    validate_plan(plan, repo_root=root)
    return plan


def validate_plan(plan: dict[str, Any], *, repo_root: Path = REPO_ROOT) -> None:
    expected_keys = {
        "schemaVersion",
        "status",
        "accepted",
        "identityPolicy",
        "selectedReference",
        "voiceBank",
        "embedding",
        "tools",
        "planSha256",
    }
    if not isinstance(plan, dict) or set(plan) != expected_keys:
        raise SelectedReferenceComparisonError("embedding plan shape is invalid")
    if (
        plan["schemaVersion"] != SCHEMA_VERSION
        or plan["status"] != PLAN_STATUS
        or plan["accepted"] is not False
        or plan["identityPolicy"] != IDENTITY_POLICY
        or plan["embedding"] != EMBEDDING_SPEC
        or unsigned_sha(plan, "planSha256") != plan["planSha256"]
    ):
        raise SelectedReferenceComparisonError("embedding plan policy or signature changed")
    root = repo_root.resolve(strict=True)
    reference = plan["selectedReference"]
    bank_record = plan["voiceBank"]
    tools = plan["tools"]
    if (
        not isinstance(reference, dict)
        or set(reference)
        != {
            "castPath",
            "castFileSha256",
            "selectedVoiceRecordSha256",
            "inputCharacterId",
            "path",
            "sha256",
            "bytes",
            "wav",
        }
        or not isinstance(bank_record, dict)
        or set(bank_record)
        != {
            "path",
            "voiceBankSha256",
            "fileSha256",
            "clusterCount",
            "familyCount",
        }
        or not isinstance(tools, dict)
        or set(tools)
        != {
            "generatorPath",
            "generatorSha256",
            "corePath",
            "coreSha256",
            "voiceBankGeneratorPath",
            "voiceBankGeneratorSha256",
        }
        or reference.get("inputCharacterId") != EXPECTED_CHARACTER_ID
        or reference.get("path") != DEFAULT_REFERENCE.as_posix()
        or reference.get("sha256") != EXPECTED_REFERENCE_SHA256
        or bank_record.get("voiceBankSha256") != EXPECTED_VOICE_BANK_SHA256
        or bank_record.get("clusterCount") != 68
        or bank_record.get("familyCount") != 35
    ):
        raise SelectedReferenceComparisonError("embedding plan inputs changed")
    cast, cast_file, cast_sha = read_json(
        Path(reference["castPath"]), root, "cast registry"
    )
    voice = selected_voice(cast)
    reference_file = input_file(
        Path(reference["path"]), root, "selected reference WAV", MAX_WAV_BYTES
    )
    bank, bank_file, bank_file_sha = read_json(
        Path(bank_record["path"]), root, "anonymous voice bank"
    )
    voice_bank.validate_voice_bank(bank)
    checks = {
        "castFileSha256": cast_sha,
        "selectedVoiceRecordSha256": sha256_bytes(canonical_json(voice)),
        "sha256": sha256_file(reference_file),
        "fileSha256": bank_file_sha,
        "generatorSha256": sha256_file(
            input_file(Path(tools["generatorPath"]), root, "comparison generator")
        ),
        "coreSha256": sha256_file(
            input_file(Path(tools["corePath"]), root, "frozen acoustic core")
        ),
        "voiceBankGeneratorSha256": sha256_file(
            input_file(
                Path(tools["voiceBankGeneratorPath"]),
                root,
                "anonymous voice-bank generator",
            )
        ),
    }
    expected = {
        "castFileSha256": reference.get("castFileSha256"),
        "selectedVoiceRecordSha256": reference.get("selectedVoiceRecordSha256"),
        "sha256": reference.get("sha256"),
        "fileSha256": bank_record.get("fileSha256"),
        "generatorSha256": tools.get("generatorSha256"),
        "coreSha256": tools.get("coreSha256"),
        "voiceBankGeneratorSha256": tools.get("voiceBankGeneratorSha256"),
    }
    if checks != expected:
        raise SelectedReferenceComparisonError("embedding plan file hashes changed")
    if (
        reference.get("bytes") != reference_file.stat().st_size
        or reference.get("wav") != wav_facts(reference_file)
        or bank.get("voiceBankSha256") != EXPECTED_VOICE_BANK_SHA256
        or relative_path(cast_file, root, "cast registry") != reference["castPath"]
        or relative_path(bank_file, root, "anonymous voice bank")
        != bank_record["path"]
    ):
        raise SelectedReferenceComparisonError("embedding plan file evidence changed")


def write_plan(
    plan: dict[str, Any], *, repo_root: Path = REPO_ROOT
) -> tuple[Path, str]:
    validate_plan(plan, repo_root=repo_root)
    root = repo_root.resolve(strict=True)
    directory = root / PLAN_ROOT
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{plan['planSha256']}.json"
    payload = (
        json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    if path.exists():
        if path.is_symlink() or path.read_bytes() != payload:
            raise SelectedReferenceComparisonError("existing plan artifact differs")
        return path, "verified-existing"
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_bytes(payload)
    temporary.replace(path)
    return path, "written"


def load_plan(
    path: Path,
    *,
    expected_sha256: str | None = None,
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    plan, resolved, _ = read_json(path, repo_root.resolve(strict=True), "embedding plan")
    validate_plan(plan, repo_root=repo_root)
    if expected_sha256 is not None and plan["planSha256"] != expected_sha256:
        raise SelectedReferenceComparisonError("embedding plan SHA is not the expected SHA")
    expected_path = repo_root.resolve(strict=True) / PLAN_ROOT / f"{plan['planSha256']}.json"
    if resolved != expected_path.resolve(strict=True):
        raise SelectedReferenceComparisonError("embedding plan is not at its bound path")
    return plan


def normalize(vector: Sequence[float], label: str) -> list[float]:
    values: list[float] = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise SelectedReferenceComparisonError(f"{label} is non-numeric")
        number = float(value)
        if not math.isfinite(number):
            raise SelectedReferenceComparisonError(f"{label} is non-finite")
        values.append(number)
    if not values:
        raise SelectedReferenceComparisonError(f"{label} is empty")
    norm = math.sqrt(sum(value * value for value in values))
    if not math.isfinite(norm) or norm <= 0:
        raise SelectedReferenceComparisonError(f"{label} norm is invalid")
    return [value / norm for value in values]


def embedding_record(vector: Sequence[float]) -> dict[str, Any]:
    normalized = normalize(vector, "selected reference embedding")
    return {
        "dimension": len(normalized),
        "normalized": True,
        "l2Norm": math.sqrt(sum(value * value for value in normalized)),
        "vectorSha256": sha256_bytes(canonical_json(normalized)),
        "vector": normalized,
    }


def execution_facts(plan: dict[str, Any]) -> dict[str, Any]:
    configured = os.environ.setdefault(
        "CUBLAS_WORKSPACE_CONFIG",
        str(core.EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]),
    )
    if configured != core.EMBEDDING_DETERMINISM["cublasWorkspaceConfig"]:
        raise SelectedReferenceComparisonError(
            "CUBLAS_WORKSPACE_CONFIG conflicts with the embedding plan"
        )
    try:
        dots_commit = core.installed_dots_source_commit()
        runtime = core.execution_runtime_facts()
        ffmpeg = core.ffmpeg_version()
        dots_version = importlib.metadata.version("dots.tts")
    except (core.SpeakerClusterError, importlib.metadata.PackageNotFoundError) as error:
        raise SelectedReferenceComparisonError(str(error)) from error
    return {
        "ffmpeg": ffmpeg,
        "dotsSourceCommit": dots_commit,
        "dotsPackageVersion": dots_version,
        **runtime,
        "embeddingDeterminism": copy.deepcopy(core.EMBEDDING_DETERMINISM),
        "generatorSha256": plan["tools"]["generatorSha256"],
        "coreSha256": plan["tools"]["coreSha256"],
        "voiceBankGeneratorSha256": plan["tools"][
            "voiceBankGeneratorSha256"
        ],
    }


def extract_reference_vector(
    plan: dict[str, Any], cache_dir: Path
) -> tuple[list[float], int]:
    import numpy as np
    import torch
    import torch.nn.functional as functional
    from dots_tts.runtime import DotsTtsRuntime

    if not torch.cuda.is_available():
        raise SelectedReferenceComparisonError("CUDA is required for CAM++ embedding")
    random.seed(core.EMBEDDING_SEED)
    np.random.seed(core.EMBEDDING_SEED)
    torch.manual_seed(core.EMBEDDING_SEED)
    torch.cuda.manual_seed_all(core.EMBEDDING_SEED)
    torch.use_deterministic_algorithms(True)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True
    runtime = DotsTtsRuntime.from_pretrained(
        core.MODEL_REPOSITORY,
        revision=core.MODEL_REVISION,
        cache_dir=str(cache_dir),
        precision="bfloat16",
    )
    encoder = runtime.model.xvector_extractor.eval()
    sample_rate = int(encoder.sample_rate)
    duration = plan["selectedReference"]["wav"]["durationSeconds"]
    segment = core.Segment(
        segment_id="selected-reference",
        start_seconds=0.0,
        end_seconds=duration,
        start_boundary="media-edge",
        end_boundary="media-edge",
        timed_word_count=0,
    )
    try:
        decoded = core._decode_segment(
            Path(plan["selectedReference"]["path"]), segment, sample_rate
        )
    except core.SpeakerClusterError as error:
        raise SelectedReferenceComparisonError(str(error)) from error
    audio = torch.tensor(decoded, dtype=torch.float32)
    with torch.inference_mode():
        value = encoder(audio[None, :].to(runtime.device))
        value = functional.normalize(value.float(), dim=-1).cpu().squeeze(0)
    vector = [float(item) for item in value.tolist()]
    if len(vector) != core.EMBEDDING_DIMENSION:
        raise SelectedReferenceComparisonError("CAM++ returned the wrong dimension")
    return vector, sample_rate


def embedding_output_path(plan: dict[str, Any], root: Path) -> Path:
    return root / EMBEDDING_ROOT / plan["planSha256"] / "embedding.json"


def validate_embedding_proof(
    proof: dict[str, Any], plan: dict[str, Any]
) -> None:
    expected_keys = {
        "schemaVersion",
        "status",
        "accepted",
        "identityPolicy",
        "planSha256",
        "selectedReference",
        "voiceBank",
        "embeddingSpec",
        "execution",
        "embedding",
        "resumeVerified",
        "embeddingProofSha256",
    }
    if not isinstance(proof, dict) or set(proof) != expected_keys:
        raise SelectedReferenceComparisonError("embedding proof shape is invalid")
    if (
        proof["schemaVersion"] != SCHEMA_VERSION
        or proof["status"] != EMBEDDING_STATUS
        or proof["accepted"] is not False
        or proof["identityPolicy"] != IDENTITY_POLICY
        or proof["planSha256"] != plan["planSha256"]
        or proof["selectedReference"] != plan["selectedReference"]
        or proof["voiceBank"] != plan["voiceBank"]
        or proof["embeddingSpec"] != EMBEDDING_SPEC
        or proof["resumeVerified"] is not False
        or unsigned_sha(proof, "embeddingProofSha256")
        != proof["embeddingProofSha256"]
    ):
        raise SelectedReferenceComparisonError("embedding proof policy or signature changed")
    execution = proof["execution"]
    if (
        not isinstance(execution, dict)
        or set(execution)
        != {
            "ffmpeg",
            "dotsSourceCommit",
            "dotsPackageVersion",
            "torch",
            "cuda",
            "gpu",
            "embeddingDeterminism",
            "generatorSha256",
            "coreSha256",
            "voiceBankGeneratorSha256",
            "encoderSampleRate",
        }
        or execution["dotsSourceCommit"] != core.DOTS_SOURCE_COMMIT
        or execution["embeddingDeterminism"] != core.EMBEDDING_DETERMINISM
        or execution["generatorSha256"] != plan["tools"]["generatorSha256"]
        or execution["coreSha256"] != plan["tools"]["coreSha256"]
        or execution["voiceBankGeneratorSha256"]
        != plan["tools"]["voiceBankGeneratorSha256"]
        or not isinstance(execution["encoderSampleRate"], int)
        or execution["encoderSampleRate"] <= 0
    ):
        raise SelectedReferenceComparisonError("embedding execution provenance changed")
    record = proof["embedding"]
    if not isinstance(record, dict) or set(record) != {
        "dimension",
        "normalized",
        "l2Norm",
        "vectorSha256",
        "vector",
    }:
        raise SelectedReferenceComparisonError("embedding vector record is malformed")
    vector = normalize(record["vector"], "selected reference embedding")
    norm = math.sqrt(sum(float(value) ** 2 for value in record["vector"]))
    if (
        record["dimension"] != core.EMBEDDING_DIMENSION
        or len(vector) != core.EMBEDDING_DIMENSION
        or record["normalized"] is not True
        or not math.isclose(norm, 1.0, rel_tol=0.0, abs_tol=1e-6)
        or not math.isclose(record["l2Norm"], norm, rel_tol=0.0, abs_tol=1e-12)
        or record["vectorSha256"]
        != sha256_bytes(canonical_json(record["vector"]))
    ):
        raise SelectedReferenceComparisonError("embedding vector evidence changed")


def load_embedding_proof(
    path: Path,
    plan: dict[str, Any],
    *,
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    proof, resolved, _ = read_json(path, root, "selected reference embedding proof")
    validate_embedding_proof(proof, plan)
    expected = embedding_output_path(plan, root).resolve(strict=True)
    if resolved != expected:
        raise SelectedReferenceComparisonError("embedding proof is not at its bound path")
    inventory = [
        child.relative_to(expected.parent).as_posix()
        for child in expected.parent.rglob("*")
        if child.is_file()
    ]
    if inventory != ["embedding.json"]:
        raise SelectedReferenceComparisonError("embedding output inventory changed")
    return proof


def execute_plan(
    plan_path: Path,
    expected_plan_sha256: str,
    cache_dir: Path,
    *,
    repeat_check: bool = False,
    repo_root: Path = REPO_ROOT,
) -> tuple[dict[str, Any], str]:
    root = repo_root.resolve(strict=True)
    with repo_cwd(root):
        plan = load_plan(
            plan_path,
            expected_sha256=expected_plan_sha256,
            repo_root=root,
        )
        output = embedding_output_path(plan, root)
        existing: dict[str, Any] | None = None
        if output.exists():
            existing = load_embedding_proof(output, plan, repo_root=root)
            if not repeat_check:
                current = execution_facts(plan)
                persisted = {
                    key: value
                    for key, value in existing["execution"].items()
                    if key != "encoderSampleRate"
                }
                if current != persisted:
                    raise SelectedReferenceComparisonError(
                        "live GPU execution provenance differs from persisted proof"
                    )
                return existing, "verified-existing"
        before = {
            plan["selectedReference"]["castPath"]: sha256_file(
                Path(plan["selectedReference"]["castPath"])
            ),
            plan["selectedReference"]["path"]: sha256_file(
                Path(plan["selectedReference"]["path"])
            ),
            plan["voiceBank"]["path"]: sha256_file(Path(plan["voiceBank"]["path"])),
            plan["tools"]["generatorPath"]: sha256_file(
                Path(plan["tools"]["generatorPath"])
            ),
            plan["tools"]["corePath"]: sha256_file(Path(plan["tools"]["corePath"])),
            plan["tools"]["voiceBankGeneratorPath"]: sha256_file(
                Path(plan["tools"]["voiceBankGeneratorPath"])
            ),
            str(plan_path): sha256_file(Path(plan_path)),
        }
        execution = execution_facts(plan)
        vector, encoder_sample_rate = extract_reference_vector(plan, cache_dir)
        execution["encoderSampleRate"] = encoder_sample_rate
        after = {path: sha256_file(Path(path)) for path in before}
        if after != before:
            raise SelectedReferenceComparisonError("an embedding input changed during GPU execution")
        proof: dict[str, Any] = {
            "schemaVersion": SCHEMA_VERSION,
            "status": EMBEDDING_STATUS,
            "accepted": False,
            "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
            "planSha256": plan["planSha256"],
            "selectedReference": copy.deepcopy(plan["selectedReference"]),
            "voiceBank": copy.deepcopy(plan["voiceBank"]),
            "embeddingSpec": copy.deepcopy(EMBEDDING_SPEC),
            "execution": execution,
            "embedding": embedding_record(vector),
            "resumeVerified": False,
        }
        proof["embeddingProofSha256"] = sha256_bytes(canonical_json(proof))
        validate_embedding_proof(proof, plan)
        if existing is not None:
            if proof != existing:
                raise SelectedReferenceComparisonError(
                    "repeat CAM++ extraction differs from the persisted proof"
                )
            return existing, "recomputed-identical"
        output.parent.mkdir(parents=True, exist_ok=False)
        temporary = output.with_name(f".{output.name}.{os.getpid()}.tmp")
        temporary.write_text(
            json.dumps(proof, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        temporary.replace(output)
        load_embedding_proof(output, plan, repo_root=root)
        return proof, "written"


def cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise SelectedReferenceComparisonError("cosine dimensions differ")
    return sum(a * b for a, b in zip(left, right, strict=True))


def rank_centroids(
    reference: Sequence[float],
    records: Sequence[dict[str, Any]],
    *,
    key_field: str,
) -> list[dict[str, Any]]:
    vector = normalize(reference, "reference ranking vector")
    scored = [
        {
            key_field: record[key_field],
            "cosine": cosine(vector, record["centroid"]["vector"]),
        }
        for record in records
    ]
    scored.sort(key=lambda row: (-row["cosine"], row[key_field]))
    top = scored[0]["cosine"] if scored else None
    for index, row in enumerate(scored):
        row["rank"] = index + 1
        row["deltaFromTop"] = top - row["cosine"] if top is not None else None
        row["marginOverNext"] = (
            row["cosine"] - scored[index + 1]["cosine"]
            if index + 1 < len(scored)
            else None
        )
    return scored


def build_comparison(
    plan_path: Path,
    embedding_path: Path,
    *,
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    with repo_cwd(root):
        plan = load_plan(plan_path, repo_root=root)
        proof = load_embedding_proof(embedding_path, plan, repo_root=root)
        bank, _, bank_file_sha = read_json(
            Path(plan["voiceBank"]["path"]), root, "anonymous voice bank"
        )
        voice_bank.validate_voice_bank(bank)
        if (
            bank_file_sha != plan["voiceBank"]["fileSha256"]
            or bank["voiceBankSha256"] != EXPECTED_VOICE_BANK_SHA256
        ):
            raise SelectedReferenceComparisonError("anonymous voice bank changed")
        reference_vector = proof["embedding"]["vector"]
        cluster_ranking = rank_centroids(
            reference_vector, bank["clusters"], key_field="clusterKey"
        )
        family_ranking = rank_centroids(
            reference_vector, bank["families"], key_field="familyId"
        )
        family_by_cluster = {
            cluster["clusterKey"]: cluster["familyId"] for cluster in bank["clusters"]
        }
        top_cluster = cluster_ranking[0]
        top_family = family_ranking[0]
        top_cluster_family_id = family_by_cluster[top_cluster["clusterKey"]]
        top_cluster_family_rank = next(
            row for row in family_ranking if row["familyId"] == top_cluster_family_id
        )
        artifact: dict[str, Any] = {
            "schemaVersion": SCHEMA_VERSION,
            "status": COMPARISON_STATUS,
            "accepted": False,
            "provisionalOnly": True,
            "countsAsCastCredit": False,
            "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
            "inputs": {
                "planSha256": plan["planSha256"],
                "embeddingProofSha256": proof["embeddingProofSha256"],
                "referenceWavSha256": plan["selectedReference"]["sha256"],
                "referenceVectorSha256": proof["embedding"]["vectorSha256"],
                "voiceBankSha256": bank["voiceBankSha256"],
                "voiceBankFileSha256": bank_file_sha,
                "modelRepository": core.MODEL_REPOSITORY,
                "modelRevision": core.MODEL_REVISION,
                "dotsSourceCommit": core.DOTS_SOURCE_COMMIT,
            },
            "limitations": copy.deepcopy(LIMITATIONS),
            "summary": {
                "clusterCount": len(cluster_ranking),
                "familyCount": len(family_ranking),
                "topClusterKey": top_cluster["clusterKey"],
                "topClusterCosine": top_cluster["cosine"],
                "topClusterMargin": top_cluster["marginOverNext"],
                "topFamilyId": top_family["familyId"],
                "topFamilyCosine": top_family["cosine"],
                "topFamilyMargin": top_family["marginOverNext"],
                "topClusterFamilyId": top_cluster_family_id,
                "topClusterFamilyRank": top_cluster_family_rank["rank"],
                "topClusterFamilyCosine": top_cluster_family_rank["cosine"],
                "topClusterAndTopFamilyAgree": top_cluster_family_id
                == top_family["familyId"],
                "characterAnchorCount": 0,
            },
            "referenceEmbedding": copy.deepcopy(proof["embedding"]),
            "clusterRanking": cluster_ranking,
            "familyRanking": family_ranking,
        }
        artifact["comparisonSha256"] = sha256_bytes(canonical_json(artifact))
        validate_comparison(artifact, plan=plan, proof=proof, bank=bank)
        return artifact


def validate_comparison(
    artifact: dict[str, Any],
    *,
    plan: dict[str, Any],
    proof: dict[str, Any],
    bank: dict[str, Any],
) -> None:
    expected_keys = {
        "schemaVersion",
        "status",
        "accepted",
        "provisionalOnly",
        "countsAsCastCredit",
        "identityPolicy",
        "inputs",
        "limitations",
        "summary",
        "referenceEmbedding",
        "clusterRanking",
        "familyRanking",
        "comparisonSha256",
    }
    if not isinstance(artifact, dict) or set(artifact) != expected_keys:
        raise SelectedReferenceComparisonError("comparison artifact shape is invalid")
    if (
        artifact["schemaVersion"] != SCHEMA_VERSION
        or artifact["status"] != COMPARISON_STATUS
        or artifact["accepted"] is not False
        or artifact["provisionalOnly"] is not True
        or artifact["countsAsCastCredit"] is not False
        or artifact["identityPolicy"] != IDENTITY_POLICY
        or artifact["limitations"] != LIMITATIONS
        or unsigned_sha(artifact, "comparisonSha256")
        != artifact["comparisonSha256"]
        or artifact["referenceEmbedding"] != proof["embedding"]
    ):
        raise SelectedReferenceComparisonError("comparison policy or signature changed")
    expected_clusters = rank_centroids(
        proof["embedding"]["vector"], bank["clusters"], key_field="clusterKey"
    )
    expected_families = rank_centroids(
        proof["embedding"]["vector"], bank["families"], key_field="familyId"
    )
    if (
        artifact["clusterRanking"] != expected_clusters
        or artifact["familyRanking"] != expected_families
    ):
        raise SelectedReferenceComparisonError("comparison scores changed")
    expected_inputs = {
        "planSha256": plan["planSha256"],
        "embeddingProofSha256": proof["embeddingProofSha256"],
        "referenceWavSha256": plan["selectedReference"]["sha256"],
        "referenceVectorSha256": proof["embedding"]["vectorSha256"],
        "voiceBankSha256": bank["voiceBankSha256"],
        "voiceBankFileSha256": plan["voiceBank"]["fileSha256"],
        "modelRepository": core.MODEL_REPOSITORY,
        "modelRevision": core.MODEL_REVISION,
        "dotsSourceCommit": core.DOTS_SOURCE_COMMIT,
    }
    if artifact["inputs"] != expected_inputs:
        raise SelectedReferenceComparisonError("comparison input bindings changed")
    top_cluster = expected_clusters[0]
    top_family = expected_families[0]
    cluster_record = next(
        row for row in bank["clusters"] if row["clusterKey"] == top_cluster["clusterKey"]
    )
    cluster_family = next(
        row for row in expected_families if row["familyId"] == cluster_record["familyId"]
    )
    expected_summary = {
        "clusterCount": len(expected_clusters),
        "familyCount": len(expected_families),
        "topClusterKey": top_cluster["clusterKey"],
        "topClusterCosine": top_cluster["cosine"],
        "topClusterMargin": top_cluster["marginOverNext"],
        "topFamilyId": top_family["familyId"],
        "topFamilyCosine": top_family["cosine"],
        "topFamilyMargin": top_family["marginOverNext"],
        "topClusterFamilyId": cluster_record["familyId"],
        "topClusterFamilyRank": cluster_family["rank"],
        "topClusterFamilyCosine": cluster_family["cosine"],
        "topClusterAndTopFamilyAgree": cluster_record["familyId"]
        == top_family["familyId"],
        "characterAnchorCount": 0,
    }
    if artifact["summary"] != expected_summary:
        raise SelectedReferenceComparisonError("comparison summary changed")


def render_report(artifact: dict[str, Any]) -> str:
    summary = artifact["summary"]
    lines = [
        "# Selected-reference anonymous acoustic comparison",
        "",
        "> External acoustic evidence only. No cluster or family identity is "
        "assigned, no Socrates anchor is claimed, and no cast-completion credit "
        "is granted.",
        "",
        f"Comparison SHA-256: `{artifact['comparisonSha256']}`",
        f"Reference vector SHA-256: `{artifact['inputs']['referenceVectorSha256']}`",
        "",
        "## Nearest diagnostics",
        "",
        f"- Top anonymous cluster: `{summary['topClusterKey']}` at "
        f"{summary['topClusterCosine']:.9f}",
        f"- Top-cluster margin over next cluster: {summary['topClusterMargin']:.9f}",
        f"- Top anonymous family: `{summary['topFamilyId']}` at "
        f"{summary['topFamilyCosine']:.9f}",
        f"- Top-family margin over next family: {summary['topFamilyMargin']:.9f}",
        f"- Top cluster belongs to `{summary['topClusterFamilyId']}`, whose "
        f"reference ranking is {summary['topClusterFamilyRank']}",
        f"- Top cluster/family agreement: "
        f"{str(summary['topClusterAndTopFamilyAgree']).lower()}",
        "",
        "## Cluster ranking",
        "",
        "| Rank | Anonymous cluster | Cosine | Margin over next |",
        "|---:|---|---:|---:|",
    ]
    for row in artifact["clusterRanking"]:
        margin = row["marginOverNext"]
        lines.append(
            f"| {row['rank']} | `{row['clusterKey']}` | {row['cosine']:.9f} | "
            f"{margin:.9f} |" if margin is not None else
            f"| {row['rank']} | `{row['clusterKey']}` | {row['cosine']:.9f} | n/a |"
        )
    lines.extend(
        [
            "",
            "## Family ranking",
            "",
            "| Rank | Anonymous family | Cosine | Margin over next |",
            "|---:|---|---:|---:|",
        ]
    )
    for row in artifact["familyRanking"]:
        margin = row["marginOverNext"]
        lines.append(
            f"| {row['rank']} | `{row['familyId']}` | {row['cosine']:.9f} | "
            f"{margin:.9f} |" if margin is not None else
            f"| {row['rank']} | `{row['familyId']}` | {row['cosine']:.9f} | n/a |"
        )
    lines.extend(
        [
            "",
            "## Limitations",
            "",
            "One short selected reference interval is compared with centroids of "
            "bounded audiobook segments. Neither side is proven single-speaker, "
            "the scores are not calibrated identity probabilities, and a high "
            "cosine cannot establish a character or actor identity. Human listening "
            "and separate exclusive source evidence remain required.",
        ]
    )
    return "\n".join(lines) + "\n"


def scratch_output_root(path: Path, repo_root: Path) -> Path:
    root = repo_root.resolve(strict=True)
    scratch = (root / "scratch").resolve(strict=True)
    candidate = path if path.is_absolute() else root / path
    resolved = candidate.resolve(strict=False)
    try:
        relative = resolved.relative_to(scratch)
    except ValueError as error:
        raise SelectedReferenceComparisonError(
            "comparison output must remain below scratch/"
        ) from error
    if not relative.parts:
        raise SelectedReferenceComparisonError("comparison output cannot replace scratch/")
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise SelectedReferenceComparisonError(
                "comparison output traverses a symlink"
            )
        if parent.resolve(strict=False) == root:
            break
    return resolved


def write_comparison(
    artifact: dict[str, Any],
    *,
    output_root: Path = COMPARISON_ROOT,
    repo_root: Path = REPO_ROOT,
) -> tuple[Path, str]:
    base = scratch_output_root(output_root, repo_root)
    destination = base / artifact["comparisonSha256"]
    expected = {
        "comparison.json": (
            json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
        ).encode("utf-8"),
        "report.md": render_report(artifact).encode("utf-8"),
    }
    if destination.exists():
        if destination.is_symlink() or not destination.is_dir():
            raise SelectedReferenceComparisonError("comparison destination is unsafe")
        inventory = {
            child.relative_to(destination).as_posix()
            for child in destination.rglob("*")
            if child.is_file()
        }
        if inventory != set(expected) or any(
            (destination / name).read_bytes() != payload
            for name, payload in expected.items()
        ):
            raise SelectedReferenceComparisonError("existing comparison artifact differs")
        return destination, "verified-existing"
    base.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=".comparison.", dir=base))
    try:
        for name, payload in expected.items():
            (temporary / name).write_bytes(payload)
        temporary.replace(destination)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)
    return destination, "written"


def verify_written_comparison(
    comparison_path: Path,
    plan_path: Path,
    embedding_path: Path,
    *,
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    artifact, resolved, _ = read_json(
        comparison_path, root, "selected-reference comparison artifact"
    )
    rebuilt = build_comparison(plan_path, embedding_path, repo_root=root)
    if artifact != rebuilt:
        raise SelectedReferenceComparisonError(
            "written comparison differs from exact current inputs"
        )
    if resolved.parent.name != artifact["comparisonSha256"]:
        raise SelectedReferenceComparisonError(
            "comparison is not in its content-addressed directory"
        )
    report = resolved.parent / "report.md"
    if report.read_bytes() != render_report(artifact).encode("utf-8"):
        raise SelectedReferenceComparisonError("comparison report changed")
    return artifact


def remote_commands(plan_path: Path, plan: dict[str, Any]) -> dict[str, str]:
    relative_plan = plan_path.relative_to(REPO_ROOT).as_posix()
    plan_sha = plan["planSha256"]
    paths = [
        plan["tools"]["generatorPath"],
        plan["tools"]["corePath"],
        plan["tools"]["voiceBankGeneratorPath"],
        plan["selectedReference"]["castPath"],
        plan["selectedReference"]["path"],
        plan["voiceBank"]["path"],
        relative_plan,
    ]
    transfer = "rsync -a --checksum --relative " + " ".join(paths) + (
        f" gpu:{REMOTE_ROOT.as_posix()}/"
    )
    execute = (
        f"ssh gpu 'cd {REMOTE_ROOT.as_posix()} && "
        f"CUBLAS_WORKSPACE_CONFIG=:4096:8 {REMOTE_PYTHON.as_posix()} "
        f"{plan['tools']['generatorPath']} execute --plan {relative_plan} "
        f"--expected-plan-sha256 {plan_sha} --cache-dir {REMOTE_CACHE.as_posix()}'"
    )
    repeat = execute[:-1] + " --repeat-check'"
    fetch = (
        "rsync -a --checksum "
        f"gpu:{REMOTE_ROOT.as_posix()}/{EMBEDDING_ROOT.as_posix()}/{plan_sha}/ "
        f"{EMBEDDING_ROOT.as_posix()}/{plan_sha}/"
    )
    return {"transfer": transfer, "execute": execute, "repeatCheck": repeat, "fetch": fetch}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    plan = subparsers.add_parser("plan")
    plan.add_argument("--write", action="store_true")
    execute = subparsers.add_parser("execute")
    execute.add_argument("--plan", type=Path, required=True)
    execute.add_argument("--expected-plan-sha256", required=True)
    execute.add_argument("--cache-dir", type=Path, required=True)
    execute.add_argument("--repeat-check", action="store_true")
    verify_embedding = subparsers.add_parser("verify-embedding")
    verify_embedding.add_argument("--plan", type=Path, required=True)
    verify_embedding.add_argument("--embedding", type=Path, required=True)
    compare = subparsers.add_parser("compare")
    compare.add_argument("--plan", type=Path, required=True)
    compare.add_argument("--embedding", type=Path, required=True)
    compare.add_argument("--write", action="store_true")
    verify = subparsers.add_parser("verify-comparison")
    verify.add_argument("--plan", type=Path, required=True)
    verify.add_argument("--embedding", type=Path, required=True)
    verify.add_argument("--comparison", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "plan":
            plan = build_plan()
            result: dict[str, Any] = {"plan": plan}
            if args.write:
                path, disposition = write_plan(plan)
                result = {
                    "disposition": disposition,
                    "planPath": path.relative_to(REPO_ROOT).as_posix(),
                    "planSha256": plan["planSha256"],
                    "embeddingPath": embedding_output_path(plan, REPO_ROOT)
                    .relative_to(REPO_ROOT)
                    .as_posix(),
                    "commands": remote_commands(path, plan),
                }
            print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        elif args.command == "execute":
            proof, disposition = execute_plan(
                args.plan,
                args.expected_plan_sha256,
                args.cache_dir,
                repeat_check=args.repeat_check,
            )
            print(
                json.dumps(
                    {
                        "disposition": disposition,
                        "embeddingProofSha256": proof["embeddingProofSha256"],
                        "referenceVectorSha256": proof["embedding"]["vectorSha256"],
                        "execution": proof["execution"],
                    },
                    indent=2,
                    sort_keys=True,
                )
            )
        elif args.command == "verify-embedding":
            plan = load_plan(args.plan)
            proof = load_embedding_proof(args.embedding, plan)
            print(
                json.dumps(
                    {
                        "valid": True,
                        "embeddingProofSha256": proof["embeddingProofSha256"],
                        "referenceVectorSha256": proof["embedding"]["vectorSha256"],
                    },
                    sort_keys=True,
                )
            )
        elif args.command == "compare":
            artifact = build_comparison(args.plan, args.embedding)
            if args.write:
                destination, disposition = write_comparison(artifact)
                print(
                    json.dumps(
                        {
                            "disposition": disposition,
                            "artifactDirectory": destination.relative_to(REPO_ROOT).as_posix(),
                            "comparisonSha256": artifact["comparisonSha256"],
                            "summary": artifact["summary"],
                        },
                        indent=2,
                        sort_keys=True,
                    )
                )
            else:
                print(json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True))
        elif args.command == "verify-comparison":
            artifact = verify_written_comparison(
                args.comparison, args.plan, args.embedding
            )
            print(
                json.dumps(
                    {
                        "valid": True,
                        "comparisonSha256": artifact["comparisonSha256"],
                        "summary": artifact["summary"],
                    },
                    indent=2,
                    sort_keys=True,
                )
            )
        return 0
    except (SelectedReferenceComparisonError, voice_bank.VoiceBankError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
