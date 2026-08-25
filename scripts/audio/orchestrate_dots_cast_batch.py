#!/usr/bin/env python3
"""Plan the remaining canonical Dots cast as a fail-closed resumable batch.

This command is deliberately dry-run only.  It reads canonical character,
cast, source, and Jowett alignment evidence, selects exactly one reference for
every unselected voice owner, and emits exact commands for one phase.  It never
downloads media, starts CUDA work, or writes ``audio/cast.json``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shlex
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from accept_dots_cast_voice import build_decision  # noqa: E402
from audition_dots_reference import (  # noqa: E402
    DOTS_SOURCE_COMMIT,
    MODEL_REPO,
    MODEL_REVISION,
)
from cast_acceptance import CAST_ACCEPTANCE_GATES, validate_cast_registry  # noqa: E402
from materialize_youtube_reference import (  # noqa: E402
    _verify_wav,
    build_reference_plan,
    load_catalog,
)


REPO_ROOT = SCRIPT_DIR.parents[1]
SCHEMA_VERSION = 1
PHASES = ("materialize", "remote-render", "qa-rank", "promote")
SEEDS = tuple(range(42, 50))
SEED_TEXT = ",".join(str(seed) for seed in SEEDS)
TARGET_TEXT = (
    "Clear thought begins with careful attention to what is actually present. "
    "A patient speaker can examine one point, pause long enough to understand "
    "it, and then continue without haste. When a question is difficult, we "
    "compare the evidence, distinguish what we know from what we assume, and "
    "explain each conclusion in ordinary language so another listener can "
    "follow the reasoning from beginning to end."
)
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?")
AUDITION_GENERATION_POLICY = {
    "modelRepo": MODEL_REPO,
    "modelRevision": MODEL_REVISION,
    "dotsSourceCommit": DOTS_SOURCE_COMMIT,
    "precision": "bfloat16",
    "language": "EN",
    "numSteps": 24,
    "guidanceScale": 1.2,
    "speakerScale": 1.5,
    "maxGenerateLength": 800,
}
ARTIFACT_REUSE_BASIS = "canonical-audition-inputs-byte-equivalent-v1"


class BatchOrchestrationError(ValueError):
    """Raised when the batch cannot be planned without guessing."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def pretty_json(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise BatchOrchestrationError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise BatchOrchestrationError(f"{label} {path} must be an object")
    return value


def _repo_file(repo_root: Path, value: str, label: str) -> Path:
    path = (repo_root / value).resolve()
    try:
        path.relative_to(repo_root.resolve())
    except ValueError as error:
        raise BatchOrchestrationError(
            f"{label} escapes the repository: {value}"
        ) from error
    if not path.is_file():
        raise BatchOrchestrationError(f"missing {label}: {value}")
    return path


def _relative(repo_root: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError as error:
        raise BatchOrchestrationError(f"path escapes the repository: {path}") from error


def _canonical_remote_directory(value: Any, label: str) -> str:
    if not isinstance(value, str):
        raise BatchOrchestrationError(
            f"{label} must be a canonical absolute remote directory"
        )
    path = Path(value)
    if (
        not value
        or not path.is_absolute()
        or value.startswith("//")
        or ".." in path.parts
        or path.as_posix() != value
        or path == Path("/")
    ):
        raise BatchOrchestrationError(
            f"{label} must be a canonical absolute remote directory"
        )
    return value


def _canonical_relative(repo_root: Path, value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise BatchOrchestrationError(f"{label} must be a non-empty path")
    path = Path(value)
    if path.is_absolute() or ".." in path.parts or path.as_posix() != value:
        raise BatchOrchestrationError(
            f"{label} must be a canonical repository-relative POSIX path"
        )
    return _relative(repo_root, repo_root / path)


def _load_reuse_manifest(
    path: Path, *, repo_root: Path
) -> tuple[dict[str, Any], str, str, dict[str, dict[str, Any]]]:
    absolute = path if path.is_absolute() else repo_root / path
    absolute = absolute.resolve()
    relative = _relative(repo_root, absolute)
    manifest = _load_json(absolute, "audition reuse manifest")
    if (
        manifest.get("schemaVersion") != SCHEMA_VERSION
        or manifest.get("artifactKind") != "dots-cast-batch-dry-run"
        or not isinstance(manifest.get("identity"), dict)
        or not isinstance(manifest.get("items"), list)
        or not manifest["items"]
    ):
        raise BatchOrchestrationError("unsupported or empty audition reuse manifest")
    expected_self_hash = manifest.get("manifestSha256")
    if expected_self_hash is not None:
        frozen = {
            key: value
            for key, value in manifest.items()
            if key not in {"manifestSha256", "batchManifestPath"}
        }
        if expected_self_hash != sha256_bytes(canonical_json(frozen)):
            raise BatchOrchestrationError(
                "audition reuse manifest hash is inconsistent"
            )
    items: dict[str, dict[str, Any]] = {}
    for item in manifest["items"]:
        if not isinstance(item, dict) or not isinstance(item.get("characterId"), str):
            raise BatchOrchestrationError("audition reuse manifest item is malformed")
        character_id = item["characterId"]
        if character_id in items:
            raise BatchOrchestrationError(
                "audition reuse manifest character IDs must be unique"
            )
        items[character_id] = item
    return manifest, relative, sha256_file(absolute), items


def _audition_artifact_identity(
    *,
    character_id: str,
    source_character_id: str,
    reference_plan: dict[str, Any],
) -> dict[str, Any]:
    """Return only inputs that can change the generated audition audio.

    Candidate IDs bind alignment-proof provenance.  Some candidate families
    intentionally hash their proof inputs, so a catalog/provenance rebase can
    change that ID without changing the selected media interval or any Dots
    inference input.  Keep the proof ID on the batch item, not in the audio
    artifact's content address.
    """

    return {
        "schemaVersion": 1,
        "characterId": character_id,
        "sourceCharacterId": source_character_id,
        "referencePlan": reference_plan,
        "targetText": TARGET_TEXT,
        "seeds": list(SEEDS),
        "generationPolicy": AUDITION_GENERATION_POLICY,
    }


def _normalized_recorded_artifact_identity(
    value: Any, *, character_id: str, expected_candidate_id: str
) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise BatchOrchestrationError(
            f"audition reuse artifact identity is malformed for {character_id}"
    )
    normalized = dict(value)
    has_recorded_candidate_id = "candidateId" in normalized
    recorded_candidate_id = normalized.pop("candidateId", None)
    if has_recorded_candidate_id and (
        not isinstance(recorded_candidate_id, str) or not recorded_candidate_id
    ):
        raise BatchOrchestrationError(
            f"audition reuse artifact candidate ID is malformed for {character_id}"
        )
    if (
        has_recorded_candidate_id
        and recorded_candidate_id != expected_candidate_id
    ):
        raise BatchOrchestrationError(
            f"audition reuse artifact candidate ID is inconsistent for {character_id}"
        )
    return normalized


def _validated_reuse_paths(
    *,
    repo_root: Path,
    reuse_manifest: dict[str, Any],
    reuse_manifest_path: str,
    reuse_manifest_sha256: str,
    reuse_items: dict[str, dict[str, Any]],
    character_id: str,
    source_character_id: str,
    candidate_id: str,
    reference_plan: dict[str, Any],
    artifact_identity: dict[str, Any],
) -> tuple[dict[str, str], dict[str, Any]]:
    old = reuse_items.get(character_id)
    identity = reuse_manifest["identity"]
    if old is None:
        raise BatchOrchestrationError(
            f"audition reuse manifest has no item for {character_id}"
        )
    prior_candidate_id = old.get("candidateId")
    if not isinstance(prior_candidate_id, str) or not prior_candidate_id:
        raise BatchOrchestrationError(
            f"audition reuse candidate ID is malformed for {character_id}"
        )
    expected = {
        "characterId": character_id,
        "sourceCharacterId": source_character_id,
        "referencePlan": reference_plan,
        "targetText": TARGET_TEXT,
        "seeds": list(SEEDS),
        "generationPolicy": AUDITION_GENERATION_POLICY,
    }
    recorded_policy = reuse_manifest.get("auditionGenerationPolicy")
    if not isinstance(recorded_policy, dict):
        raise BatchOrchestrationError(
            f"audition reuse requires a recorded generation policy for {character_id}"
        )
    if canonical_json(recorded_policy) != canonical_json(AUDITION_GENERATION_POLICY):
        raise BatchOrchestrationError(
            f"audition reuse generation policy differs for {character_id}"
        )
    actual = {
        "characterId": old.get("characterId"),
        "sourceCharacterId": old.get("sourceCharacterId"),
        "referencePlan": old.get("referencePlan"),
        "targetText": identity.get("targetText"),
        "seeds": identity.get("seeds"),
        "generationPolicy": recorded_policy,
    }
    if canonical_json(actual) != canonical_json(expected):
        raise BatchOrchestrationError(
            f"audition reuse inputs differ for {character_id}"
        )
    recorded_artifact_identity = old.get("auditionArtifactIdentity")
    if not isinstance(recorded_artifact_identity, dict):
        raise BatchOrchestrationError(
            f"audition reuse requires a recorded artifact identity for {character_id}"
        )
    prior_artifact_sha256 = old.get("auditionArtifactSha256")
    if (
        not isinstance(prior_artifact_sha256, str)
        or re.fullmatch(r"[0-9a-f]{64}", prior_artifact_sha256) is None
        or prior_artifact_sha256
        != sha256_bytes(canonical_json(recorded_artifact_identity))
    ):
        raise BatchOrchestrationError(
            f"audition reuse artifact hash is inconsistent for {character_id}"
        )
    normalized_recorded_identity = _normalized_recorded_artifact_identity(
        recorded_artifact_identity,
        character_id=character_id,
        expected_candidate_id=prior_candidate_id,
    )
    if canonical_json(normalized_recorded_identity) != canonical_json(
        artifact_identity
    ):
        raise BatchOrchestrationError(
            f"audition reuse artifact identity differs for {character_id}"
        )
    paths = old.get("paths")
    required = (
        "auditionDir",
        "referenceWav",
        "referenceSidecar",
        "asrQa",
        "speakerRanking",
        "referenceAsrAdjudication",
    )
    if not isinstance(paths, dict) or any(key not in paths for key in required):
        raise BatchOrchestrationError(
            f"audition reuse paths are incomplete for {character_id}"
        )
    reused_paths = {
        key: _canonical_relative(
            repo_root, paths[key], f"audition reuse {character_id} {key}"
        )
        for key in required
    }
    independent_path = paths.get("referenceAsrIndependent")
    if independent_path is None:
        independent_path = (
            f"{reused_paths['auditionDir']}/reference-asr-independent.json"
        )
    reused_paths["referenceAsrIndependent"] = _canonical_relative(
        repo_root,
        independent_path,
        f"audition reuse {character_id} referenceAsrIndependent",
    )
    expected_paths = {
        "referenceWav": reference_plan["wav_path"],
        "referenceSidecar": reference_plan["sidecar_path"],
        "asrQa": f"{reused_paths['auditionDir']}/asr-qa.json",
        "speakerRanking": f"{reused_paths['auditionDir']}/speaker-ranking.json",
        "referenceAsrAdjudication": (
            f"{reused_paths['auditionDir']}/reference-asr-adjudication.json"
        ),
        "referenceAsrIndependent": (
            f"{reused_paths['auditionDir']}/reference-asr-independent.json"
        ),
    }
    incoherent = [
        key for key, expected_path in expected_paths.items()
        if reused_paths[key] != expected_path
    ]
    if incoherent:
        raise BatchOrchestrationError(
            f"audition reuse paths are incoherent for {character_id}: "
            + ", ".join(incoherent)
        )
    reference_identity = _materialized_reference_identity(repo_root, reference_plan)
    if reference_identity is None:
        raise BatchOrchestrationError(
            f"audition reuse requires a materialized reference for {character_id}"
        )
    artifact_probe = {
        "characterId": character_id,
        "sourceCharacterId": source_character_id,
        "referencePlan": reference_plan,
        "paths": reused_paths,
    }
    existing_artifact = _verified_audition_artifact(
        repo_root, artifact_probe, reference_identity
    )
    if existing_artifact is None:
        raise BatchOrchestrationError(
            f"audition reuse requires a completed audition for {character_id}"
        )
    reuse_identity = {
        "schemaVersion": 1,
        "auditionArtifactIdentity": artifact_identity,
        "materializedReference": reference_identity,
        "auditionPlanSha256": existing_artifact["planSha256"],
        "auditionOutputsSha256": existing_artifact["outputsSha256"],
    }
    return reused_paths, {
        "kind": "validated-existing-audition-artifact",
        "manifestPath": reuse_manifest_path,
        "manifestSha256": reuse_manifest_sha256,
        "batchSha256": reuse_manifest.get("batchSha256"),
        "itemSha256": old.get("itemSha256"),
        "auditionDir": reused_paths["auditionDir"],
        "priorCandidateId": prior_candidate_id,
        "currentCandidateId": candidate_id,
        "reuseBasis": ARTIFACT_REUSE_BASIS,
        "reuseIdentitySha256": sha256_bytes(canonical_json(reuse_identity)),
        "reuseIdentity": reuse_identity,
        "priorAuditionArtifactSha256": prior_artifact_sha256,
        "normalizedAuditionArtifactSha256": sha256_bytes(
            canonical_json(artifact_identity)
        ),
        "auditionManifestPath": existing_artifact["manifestPath"],
        "auditionManifestSha256": existing_artifact["manifestSha256"],
        "auditionOutputCount": existing_artifact["outputCount"],
        "generationPolicyVerification": "exact-recorded-policy",
    }


def _voice_owners(characters: dict[str, Any]) -> tuple[set[str], dict[str, set[str]]]:
    if characters.get("schemaVersion") != 3 or not isinstance(
        characters.get("characters"), list
    ):
        raise BatchOrchestrationError("character catalog must be schema v3")
    owners: set[str] = set()
    appearances: dict[str, set[str]] = {}
    for row in characters["characters"]:
        character_id = row.get("characterId")
        if not isinstance(character_id, str) or character_id in appearances:
            raise BatchOrchestrationError("character IDs must be unique strings")
        owned_dialogues = {
            appearance.get("dialogue")
            for appearance in row.get("appearances", [])
            if appearance.get("performanceRole") == "voice-owner"
        }
        appearances[character_id] = {
            dialogue for dialogue in owned_dialogues if isinstance(dialogue, str)
        }
        if appearances[character_id]:
            if row.get("identityStatus") != "resolved" or any(
                appearance.get("editorialStatus") != "resolved"
                for appearance in row.get("appearances", [])
                if appearance.get("performanceRole") == "voice-owner"
            ):
                raise BatchOrchestrationError(
                    f"voice owner {character_id!r} is not canonically resolved"
                )
            owners.add(character_id)
    return owners, appearances


def _validate_report(
    path: Path,
    *,
    repo_root: Path,
    appearances: dict[str, set[str]],
) -> tuple[str, list[dict[str, Any]]]:
    report = _load_json(path, "alignment report")
    frozen = {key: value for key, value in report.items() if key != "reportSha256"}
    if (
        report.get("schemaVersion") != 1
        or report.get("artifactKind") != "jowett-caption-character-reference-alignment"
        or report.get("status") != "reference-intervals-emitted-no-cast-writes"
        or report.get("missingInputs") != []
        or report.get("reportSha256") != sha256_bytes(canonical_json(frozen))
    ):
        raise BatchOrchestrationError(f"invalid or incomplete alignment report: {path}")
    dialogues = report.get("selection", {}).get("dialogues")
    if not isinstance(dialogues, list) or len(dialogues) != 1:
        raise BatchOrchestrationError(
            f"alignment report must select one dialogue: {path}"
        )
    dialogue = dialogues[0]
    inputs = report.get("inputs")
    if not isinstance(dialogue, str) or not isinstance(inputs, dict):
        raise BatchOrchestrationError(f"alignment report has malformed inputs: {path}")
    required_inputs = ("registry", "characters", "referenceSources", "script")
    for name in required_inputs:
        if name not in inputs:
            raise BatchOrchestrationError(
                f"alignment report lacks {name} provenance: {path}"
            )
    for name, record in inputs.items():
        if name == "sourceProofs":
            if not isinstance(record, list) or not record:
                raise BatchOrchestrationError(
                    f"alignment report lacks sourceProofs provenance: {path}"
                )
            seen_source_paths: set[str] = set()
            for index, source_record in enumerate(record):
                if (
                    not isinstance(source_record, dict)
                    or not isinstance(source_record.get("path"), str)
                    or not isinstance(source_record.get("sha256"), str)
                    or not isinstance(source_record.get("reportSha256"), str)
                ):
                    raise BatchOrchestrationError(
                        f"alignment sourceProofs[{index}] provenance is malformed: {path}"
                    )
                source_path = source_record["path"]
                if source_path in seen_source_paths:
                    raise BatchOrchestrationError(
                        f"alignment sourceProofs paths must be unique: {path}"
                    )
                seen_source_paths.add(source_path)
                actual = _repo_file(
                    repo_root,
                    source_path,
                    f"alignment sourceProofs[{index}] input",
                )
                if source_record["sha256"] != sha256_file(actual):
                    raise BatchOrchestrationError(
                        f"alignment report is stale against {source_path}: {path}"
                    )
                source_proof = _load_json(actual, "alignment source proof")
                frozen_source = {
                    key: value
                    for key, value in source_proof.items()
                    if key != "reportSha256"
                }
                if (
                    source_proof.get("reportSha256")
                    != source_record["reportSha256"]
                    or source_proof.get("reportSha256")
                    != sha256_bytes(canonical_json(frozen_source))
                ):
                    raise BatchOrchestrationError(
                        f"alignment source proof hash is inconsistent: {source_path}"
                    )
            continue
        if not isinstance(record, dict) or not isinstance(record.get("path"), str):
            raise BatchOrchestrationError(
                f"alignment report lacks {name} provenance: {path}"
            )
        actual = _repo_file(repo_root, record["path"], f"alignment {name} input")
        if record.get("sha256") != sha256_file(actual):
            raise BatchOrchestrationError(
                f"alignment report is stale against {record['path']}: {path}"
            )
    candidates = report.get("candidates")
    if not isinstance(candidates, list):
        raise BatchOrchestrationError(f"alignment candidates must be an array: {path}")
    accepted: list[dict[str, Any]] = []
    for candidate in candidates:
        alignment = candidate.get("alignment", {})
        safety = candidate.get("safety", {})
        character_id = candidate.get("characterId")
        if (
            candidate.get("status") != "automatically-eligible-reference-interval"
            or candidate.get("dialogue") != dialogue
            or not isinstance(character_id, str)
            or dialogue not in appearances.get(character_id, set())
            or safety.get("singleCharacterUnderEditionRule") is not True
            or safety.get("reportedSpeechExcluded") is not True
            or safety.get("operatorListeningRequired") is not False
            or safety.get("castWritePerformed") is not False
            or re.fullmatch(
                r"[0-9a-f]{64}", str(candidate.get("sourceAgreementSha256", ""))
            )
            is None
        ):
            raise BatchOrchestrationError(f"unsafe or noncanonical candidate in {path}")
        provenance = candidate.get("provenance")
        if not isinstance(provenance, dict):
            raise BatchOrchestrationError(f"candidate lacks provenance in {path}")
        for name, prefix in (
            ("registry", "registry"),
            ("characters", "characters"),
            ("referenceSources", "referenceSources"),
            ("script", "script"),
        ):
            if (
                provenance.get(f"{prefix}Path") != inputs[name]["path"]
                or provenance.get(f"{prefix}Sha256") != inputs[name]["sha256"]
            ):
                raise BatchOrchestrationError(
                    f"candidate provenance disagrees with its report in {path}"
                )
        duration = alignment.get("durationSeconds")
        gate = CAST_ACCEPTANCE_GATES["referenceDuration"]
        if (
            not isinstance(duration, (int, float))
            or duration < gate["minimumSeconds"]
            or duration > gate["maximumSeconds"]
        ):
            continue
        accepted.append(candidate)
    return dialogue, accepted


def _candidate_quality(candidate: dict[str, Any]) -> tuple[float, float, float]:
    alignment = candidate["alignment"]
    return (
        -float(alignment["exactTokenRatio"]),
        -float(alignment["confidence"]),
        abs(float(alignment["durationSeconds"]) - 8.0),
    )


def _choose_candidate(owner: str, candidates: list[dict[str, Any]]) -> dict[str, Any]:
    if not candidates:
        raise BatchOrchestrationError(f"no eligible alignment candidate for {owner}")
    ordered = sorted(
        candidates,
        key=lambda row: (
            _candidate_quality(row),
            row["dialogue"],
            row["videoId"],
            row["alignment"]["startSeconds"],
            row["candidateId"],
        ),
    )
    if len(ordered) > 1 and _candidate_quality(ordered[0]) == _candidate_quality(
        ordered[1]
    ):
        raise BatchOrchestrationError(
            f"ambiguous equally ranked alignment candidates for {owner}"
        )
    return ordered[0]


def _command(argv: list[str], *, host_command: bool = False) -> dict[str, Any]:
    return {
        "argv": argv,
        "shell": shlex.join(argv),
        "executionHost": "gpu" if host_command else "local",
    }


def _materialized_reference_identity(
    repo_root: Path, plan_payload: dict[str, Any]
) -> dict[str, Any] | None:
    wav_relative = _canonical_relative(
        repo_root, plan_payload.get("wav_path"), "materialized reference WAV"
    )
    sidecar_relative = _canonical_relative(
        repo_root,
        plan_payload.get("sidecar_path"),
        "materialized reference sidecar",
    )
    wav = repo_root / wav_relative
    sidecar = repo_root / sidecar_relative
    if wav.exists() != sidecar.exists():
        raise BatchOrchestrationError(
            f"partial materialized reference: {wav_relative}"
        )
    if not wav.exists():
        return None
    document = _load_json(sidecar, "reference sidecar")
    wav_sha256 = sha256_file(wav)
    wav_record = document.get("wav")
    if (
        canonical_json(document.get("plan")) != canonical_json(plan_payload)
        or not isinstance(wav_record, dict)
        or wav_record.get("sha256") != wav_sha256
    ):
        raise BatchOrchestrationError(
            f"stale materialized reference: {wav_relative}"
        )
    start_seconds = plan_payload.get("start_seconds")
    end_seconds = plan_payload.get("end_seconds")
    if not isinstance(start_seconds, (int, float)) or not isinstance(
        end_seconds, (int, float)
    ):
        raise BatchOrchestrationError(
            f"materialized reference plan has invalid timing: {wav_relative}"
        )
    _verify_wav(wav, float(end_seconds) - float(start_seconds))
    return {
        "wavPath": wav_relative,
        "wavSha256": wav_sha256,
        "sidecarPath": sidecar_relative,
        "sidecarSha256": sha256_file(sidecar),
    }


def _reference_state(repo_root: Path, plan: Any) -> str:
    return (
        "complete"
        if _materialized_reference_identity(repo_root, asdict(plan)) is not None
        else "pending"
    )


def _verified_audition_artifact(
    repo_root: Path,
    item: dict[str, Any],
    reference_identity: dict[str, Any],
) -> dict[str, Any] | None:
    output_dir = repo_root / item["paths"]["auditionDir"]
    manifest = output_dir / "audition-manifest.json"
    if not manifest.exists():
        if output_dir.exists() and any(output_dir.iterdir()):
            raise BatchOrchestrationError(
                f"partial audition directory without manifest: {item['paths']['auditionDir']}"
            )
        return None
    loaded = _load_json(manifest, "existing audition manifest")
    if loaded.get("schemaVersion") != 1 or loaded.get("status") != "audition":
        raise BatchOrchestrationError(
            f"invalid existing audition artifact: {manifest}"
        )
    reference = item["referencePlan"]
    expected_plan = {
        "schema_version": 1,
        "dialogue": reference["dialogue"],
        "character_id": item["sourceCharacterId"],
        "video_id": reference["video_id"],
        "source_url": reference["source_url"],
        "reference_path": reference_identity["wavPath"],
        "reference_sha256": reference_identity["wavSha256"],
        "reference_sidecar_sha256": reference_identity["sidecarSha256"],
        "prompt_text": reference["prompt_text"],
        "target_text": TARGET_TEXT,
        "seeds": list(SEEDS),
        "model_repo": AUDITION_GENERATION_POLICY["modelRepo"],
        "model_revision": AUDITION_GENERATION_POLICY["modelRevision"],
        "dots_source_commit": AUDITION_GENERATION_POLICY["dotsSourceCommit"],
        "precision": AUDITION_GENERATION_POLICY["precision"],
        "language": AUDITION_GENERATION_POLICY["language"],
        "num_steps": AUDITION_GENERATION_POLICY["numSteps"],
        "guidance_scale": AUDITION_GENERATION_POLICY["guidanceScale"],
        "speaker_scale": AUDITION_GENERATION_POLICY["speakerScale"],
        "max_generate_length": AUDITION_GENERATION_POLICY["maxGenerateLength"],
        "output_dir": item["paths"]["auditionDir"],
    }
    plan = loaded.get("plan")
    if not isinstance(plan, dict) or canonical_json(plan) != canonical_json(
        expected_plan
    ):
        raise BatchOrchestrationError(f"stale audition manifest: {manifest}")
    plan_sha256 = sha256_bytes(canonical_json(plan))
    outputs = loaded.get("outputs")
    if (
        loaded.get("planSha256") != plan_sha256
        or not isinstance(outputs, list)
        or not all(isinstance(output, dict) for output in outputs)
        or [output.get("seed") for output in outputs] != list(SEEDS)
    ):
        raise BatchOrchestrationError(f"stale audition manifest: {manifest}")
    for output in outputs:
        filename = output.get("file")
        if (
            not isinstance(filename, str)
            or not filename
            or Path(filename).name != filename
            or not isinstance(output.get("sha256"), str)
        ):
            raise BatchOrchestrationError(
                f"malformed audition output in manifest: {manifest}"
            )
        output_path = output_dir / filename
        if (
            not output_path.is_file()
            or output["sha256"] != sha256_file(output_path)
        ):
            raise BatchOrchestrationError(
                f"existing audition output is missing or corrupt: {output_path}"
            )
    return {
        "manifestPath": _relative(repo_root, manifest),
        "manifestSha256": sha256_file(manifest),
        "planSha256": plan_sha256,
        "outputsSha256": sha256_bytes(canonical_json(outputs)),
        "outputCount": len(outputs),
    }


def _audition_state(repo_root: Path, item: dict[str, Any]) -> tuple[str, str | None]:
    reference_identity = _materialized_reference_identity(
        repo_root, item["referencePlan"]
    )
    if reference_identity is None:
        raise BatchOrchestrationError(
            f"audition state requires materialized reference for {item['characterId']}"
        )
    artifact = _verified_audition_artifact(repo_root, item, reference_identity)
    return (
        ("complete", artifact["planSha256"])
        if artifact is not None
        else ("pending", None)
    )


def _qa_state(repo_root: Path, item: dict[str, Any], plan_sha: str) -> str:
    expected = (
        ("asrQa", "audition-qa"),
        ("speakerRanking", "audition-ranking"),
    )
    missing = 0
    for key, status in expected:
        path = repo_root / item["paths"][key]
        if not path.exists():
            missing += 1
            continue
        report = _load_json(path, key)
        if (
            report.get("status") != status
            or report.get("auditionPlanSha256") != plan_sha
        ):
            raise BatchOrchestrationError(f"stale {key} artifact: {path}")
    return "complete" if missing == 0 else "pending"


def _remote(repo_relative: str, remote_repo: str) -> str:
    return f"{remote_repo.rstrip('/')}/{repo_relative}"


def _phase_commands(
    *,
    phase: str,
    repo_root: Path,
    item: dict[str, Any],
    remote_host: str,
    remote_repo: str,
    remote_python: str,
    remote_cache: str,
) -> tuple[str, list[dict[str, Any]]]:
    reference = item["referencePlan"]
    reference_plan = build_reference_plan(
        load_catalog(repo_root / "audio/reference-sources.json"),
        dialogue=reference["dialogue"],
        character_id=reference["character_id"],
        video_id=reference["video_id"],
        start_seconds=reference["start_seconds"],
        end_seconds=reference["end_seconds"],
        prompt_text=reference["prompt_text"],
        output_root=Path(item["paths"]["referenceRoot"]),
    )
    reference_state = _reference_state(repo_root, reference_plan)
    materialize = _command(
        [
            "uv",
            "run",
            "python",
            "scripts/audio/materialize_youtube_reference.py",
            "--catalog",
            "audio/reference-sources.json",
            "--dialogue",
            reference["dialogue"],
            "--character-id",
            reference["character_id"],
            "--video-id",
            reference["video_id"],
            "--start",
            str(reference["start_seconds"]),
            "--end",
            str(reference["end_seconds"]),
            "--prompt-text",
            reference["prompt_text"],
            "--output-root",
            item["paths"]["referenceRoot"],
            "--materialize",
        ]
    )
    if phase == "materialize":
        return reference_state, [] if reference_state == "complete" else [materialize]
    if reference_state != "complete":
        raise BatchOrchestrationError(
            f"{phase} requires materialized reference for {item['characterId']}"
        )

    audition_state, plan_sha = _audition_state(repo_root, item)
    if phase == "remote-render":
        # Rendering is emitted once at the manifest level so Dots is loaded
        # exactly once for the whole wave.
        return audition_state, []
    if audition_state != "complete" or plan_sha is None:
        raise BatchOrchestrationError(
            f"{phase} requires completed audition for {item['characterId']}"
        )

    qa_state = _qa_state(repo_root, item, plan_sha)
    remote_manifest = f"{item['paths']['auditionDir']}/audition-manifest.json"
    if phase == "qa-rank":
        # QA is emitted once at the manifest level so Whisper and CAM++ are
        # each loaded exactly once for the whole batch.
        return qa_state, []
    if qa_state != "complete":
        raise BatchOrchestrationError(
            f"promote requires QA and ranking for {item['characterId']}"
        )

    argv = [
        "uv",
        "run",
        "python",
        "scripts/audio/accept_dots_cast_voice.py",
        "--character-id",
        item["characterId"],
        "--reference-sidecar",
        item["paths"]["referenceSidecar"],
        "--speaker-purity",
        item["alignmentReportPath"],
        "--clone-manifest",
        remote_manifest,
        "--asr",
        item["paths"]["asrQa"],
        "--acoustic",
        item["paths"]["speakerRanking"],
    ]
    if item["sourceCharacterId"] != item["characterId"]:
        argv += [
            "--source-character-id",
            item["sourceCharacterId"],
            "--reassignment-reason",
            item["reassignmentReason"],
        ]
    adjudication = repo_root / item["paths"]["referenceAsrAdjudication"]
    if adjudication.exists():
        argv += [
            "--reference-asr-adjudication",
            item["paths"]["referenceAsrAdjudication"],
        ]
    dry_args = argparse.Namespace(
        character_id=item["characterId"],
        source_character_id=(
            item["sourceCharacterId"]
            if item["sourceCharacterId"] != item["characterId"]
            else None
        ),
        reassignment_reason=item.get("reassignmentReason"),
        reference_sidecar=Path(item["paths"]["referenceSidecar"]),
        speaker_purity=Path(item["alignmentReportPath"]),
        clone_manifest=Path(remote_manifest),
        asr=Path(item["paths"]["asrQa"]),
        acoustic=Path(item["paths"]["speakerRanking"]),
        reference_asr_adjudication=(
            Path(item["paths"]["referenceAsrAdjudication"])
            if adjudication.exists()
            else None
        ),
        seed=None,
        accepted_at=item["acceptedAt"],
        decision_output=None,
        cast=Path("audio/cast.json"),
        characters=Path("audio/characters.json"),
        sources=Path("audio/reference-sources.json"),
        ffmpeg="ffmpeg",
        write=False,
    )
    if repo_root.resolve() != REPO_ROOT.resolve():
        raise BatchOrchestrationError(
            "promote validation must run in the canonical repository"
        )
    build_decision(dry_args)
    argv += ["--accepted-at", item["acceptedAt"], "--write"]
    return "ready", [_command(argv)]


def build_batch_manifest(
    *,
    phase: str,
    repo_root: Path,
    report_paths: list[Path],
    batch_root: Path,
    reference_root: Path = Path("scratch/audio-references"),
    only_characters: set[str] | None = None,
    candidate_ids: dict[str, str] | None = None,
    narrator_source_character_id: str | None = None,
    narrator_reassignment_reason: str | None = None,
    remote_host: str = "gpu",
    remote_repo: str = "/mnt/models/dev/plato-audio",
    remote_python: str = "/mnt/models/dev/plato-dots/.venv/bin/python",
    remote_cache: str = "/mnt/models/hf",
    independent_cache_dir: str = "/mnt/models/cache/huggingface",
    reuse_auditions_from: Path | None = None,
) -> dict[str, Any]:
    if phase not in PHASES:
        raise BatchOrchestrationError(f"unsupported phase: {phase}")
    if len(WORD_RE.findall(TARGET_TEXT)) < 60 or SEEDS != tuple(range(42, 50)):
        raise BatchOrchestrationError("fixed audition policy was modified")
    remote_cache = _canonical_remote_directory(remote_cache, "primary model cache")
    independent_cache_dir = _canonical_remote_directory(
        independent_cache_dir, "independent large-v3 model cache"
    )
    if remote_cache == independent_cache_dir:
        raise BatchOrchestrationError(
            "primary and independent large-v3 model caches must be distinct"
        )
    repo_root = repo_root.resolve()
    batch_root_absolute = (
        batch_root if batch_root.is_absolute() else repo_root / batch_root
    )
    batch_root = Path(_relative(repo_root, batch_root_absolute))
    reference_root_absolute = (
        reference_root if reference_root.is_absolute() else repo_root / reference_root
    )
    reference_root = Path(_relative(repo_root, reference_root_absolute))
    reuse_manifest: dict[str, Any] | None = None
    reuse_manifest_path = ""
    reuse_manifest_sha256 = ""
    reuse_items: dict[str, dict[str, Any]] = {}
    if reuse_auditions_from is not None:
        (
            reuse_manifest,
            reuse_manifest_path,
            reuse_manifest_sha256,
            reuse_items,
        ) = _load_reuse_manifest(reuse_auditions_from, repo_root=repo_root)
    cast_path = repo_root / "audio/cast.json"
    characters_path = repo_root / "audio/characters.json"
    sources_path = repo_root / "audio/reference-sources.json"
    cast = _load_json(cast_path, "cast catalog")
    validate_cast_registry(cast)
    accepted_at = cast.get("updatedAt")
    if (
        not isinstance(accepted_at, str)
        or re.fullmatch(r"\d{4}-\d{2}-\d{2}", accepted_at) is None
    ):
        raise BatchOrchestrationError(
            "cast updatedAt must pin the batch acceptance date"
        )
    characters = _load_json(characters_path, "character catalog")
    owners, appearances = _voice_owners(characters)
    load_catalog(sources_path)
    selected = {voice.get("characterId") for voice in cast.get("voices", [])}
    if not selected <= owners:
        raise BatchOrchestrationError("cast selects a non-voice-owner character")
    all_remaining = owners - selected
    if only_characters is not None:
        unknown = only_characters - owners
        already_selected = only_characters & selected
        if unknown:
            raise BatchOrchestrationError(
                "requested batch characters are not canonical voice owners: "
                + ", ".join(sorted(unknown))
            )
        if already_selected:
            raise BatchOrchestrationError(
                "requested batch characters are already selected: "
                + ", ".join(sorted(already_selected))
            )
        if not only_characters:
            raise BatchOrchestrationError("requested batch character scope is empty")
        remaining = set(only_characters)
    else:
        remaining = all_remaining
    candidate_ids = dict(candidate_ids or {})
    unknown_candidate_owners = set(candidate_ids) - remaining
    if unknown_candidate_owners:
        raise BatchOrchestrationError(
            "candidate pins name characters outside this batch: "
            + ", ".join(sorted(unknown_candidate_owners))
        )
    for owner, candidate_id in candidate_ids.items():
        if not isinstance(candidate_id, str) or not candidate_id:
            raise BatchOrchestrationError(
                f"candidate pin for {owner} must be a non-empty candidate ID"
            )
    if narrator_source_character_id is not None:
        if "commentary-narrator" not in remaining:
            raise BatchOrchestrationError("narrator is already selected")
        if narrator_source_character_id == "commentary-narrator":
            raise BatchOrchestrationError(
                "same-character narrator needs no reassignment"
            )
        if (
            narrator_source_character_id not in owners
            or not narrator_reassignment_reason
        ):
            raise BatchOrchestrationError(
                "narrator reassignment requires a canonical source owner and explicit reason"
            )
    elif narrator_reassignment_reason is not None:
        raise BatchOrchestrationError(
            "narrator reason requires --narrator-source-character-id"
        )

    candidates_by_owner: dict[str, list[tuple[dict[str, Any], Path]]] = {}
    seen_candidate_ids: set[str] = set()
    report_inventory: list[dict[str, str]] = []
    for path in sorted((p.resolve() for p in report_paths), key=lambda p: p.as_posix()):
        relative = _relative(repo_root, path)
        _, candidates = _validate_report(
            path, repo_root=repo_root, appearances=appearances
        )
        report_inventory.append({"path": relative, "sha256": sha256_file(path)})
        for candidate in candidates:
            candidate_id = candidate.get("candidateId")
            if (
                not isinstance(candidate_id, str)
                or candidate_id in seen_candidate_ids
            ):
                raise BatchOrchestrationError(
                    "candidate IDs must be present and globally unique"
                )
            seen_candidate_ids.add(candidate_id)
            candidates_by_owner.setdefault(candidate["characterId"], []).append(
                (candidate, path)
            )

    selections: list[dict[str, Any]] = []
    missing: list[str] = []
    for owner in sorted(remaining):
        source_owner = (
            narrator_source_character_id
            if owner == "commentary-narrator" and narrator_source_character_id
            else owner
        )
        rows = candidates_by_owner.get(source_owner, [])
        if not rows:
            missing.append(owner)
            continue
        pinned_candidate_id = candidate_ids.get(owner)
        if pinned_candidate_id is None:
            chosen = _choose_candidate(source_owner, [row[0] for row in rows])
        else:
            pinned = [
                candidate
                for candidate, _ in rows
                if candidate.get("candidateId") == pinned_candidate_id
            ]
            if len(pinned) != 1:
                raise BatchOrchestrationError(
                    f"candidate pin for {owner} does not identify exactly one "
                    f"eligible {source_owner} candidate: {pinned_candidate_id}"
                )
            chosen = pinned[0]
        report_path = next(path for candidate, path in rows if candidate is chosen)
        selections.append(
            {
                "characterId": owner,
                "sourceCharacterId": source_owner,
                "reassignmentReason": (
                    narrator_reassignment_reason if source_owner != owner else None
                ),
                "candidate": chosen,
                "alignmentReportPath": _relative(repo_root, report_path),
                "alignmentReportSha256": sha256_file(report_path),
            }
        )
    if missing:
        raise BatchOrchestrationError(
            "missing eligible alignment candidates for: " + ", ".join(missing)
        )

    batch_identity = {
        "schemaVersion": SCHEMA_VERSION,
        "policy": "remaining-canonical-dots-cast-v1",
        "charactersSha256": sha256_file(characters_path),
        "referenceSourcesSha256": sha256_file(sources_path),
        "reports": report_inventory,
        "referenceRoot": reference_root.as_posix(),
        "scope": {
            "kind": "explicit-character-subset"
            if only_characters is not None
            else "all-remaining",
            "characterIds": sorted(remaining),
            "allRemainingCharacterCount": len(all_remaining),
        },
        "candidatePins": {
            owner: candidate_ids[owner] for owner in sorted(candidate_ids)
        },
        "targetText": TARGET_TEXT,
        "targetWordCount": len(WORD_RE.findall(TARGET_TEXT)),
        "seeds": list(SEEDS),
        "selections": selections,
    }
    # Reference clips and auditions do not become stale merely because an
    # unrelated voice is promoted. Keep their directory keyed to immutable
    # source/model inputs; retain the live cast hash in the phase manifest so
    # promotion decisions still bind the exact serial starting state.
    batch_sha = sha256_bytes(canonical_json(batch_identity))
    identity = {
        **batch_identity,
        "castSha256": sha256_file(cast_path),
        "batchContentSha256": batch_sha,
    }
    batch_dir = batch_root / "batches" / batch_sha
    items: list[dict[str, Any]] = []
    for selection in selections:
        candidate = selection["candidate"]
        # Every batch reuses the repository's pinned source-media cache. The
        # materializer separates prompt-hashed clips by source character, so
        # sharing this root is collision-safe and avoids redownloading an
        # audiobook for each cast member or each resumed batch.
        alignment = candidate["alignment"]
        plan = build_reference_plan(
            load_catalog(sources_path),
            dialogue=candidate["dialogue"],
            character_id=selection["sourceCharacterId"],
            video_id=candidate["videoId"],
            start_seconds=alignment["startSeconds"],
            end_seconds=alignment["endSeconds"],
            prompt_text=alignment["expectedPrompt"],
            output_root=reference_root,
        )
        plan_payload = asdict(plan)
        artifact_identity = _audition_artifact_identity(
            character_id=selection["characterId"],
            source_character_id=selection["sourceCharacterId"],
            reference_plan=plan_payload,
        )
        artifact_sha = sha256_bytes(canonical_json(artifact_identity))
        item_sha = sha256_bytes(
            canonical_json(
                {
                    "selection": selection,
                    "targetText": TARGET_TEXT,
                    "seeds": list(SEEDS),
                }
            )
        )
        item_dir = batch_dir / "items" / f"{selection['characterId']}-{item_sha[:16]}"
        audition_dir = batch_root / "audition-artifacts" / artifact_sha
        qa_paths = {
            "auditionDir": audition_dir.as_posix(),
            "asrQa": (audition_dir / "asr-qa.json").as_posix(),
            "speakerRanking": (audition_dir / "speaker-ranking.json").as_posix(),
            "referenceAsrAdjudication": (
                audition_dir / "reference-asr-adjudication.json"
            ).as_posix(),
            "referenceAsrIndependent": (
                audition_dir / "reference-asr-independent.json"
            ).as_posix(),
        }
        artifact_reuse = None
        if reuse_manifest is not None:
            qa_paths, artifact_reuse = _validated_reuse_paths(
                repo_root=repo_root,
                reuse_manifest=reuse_manifest,
                reuse_manifest_path=reuse_manifest_path,
                reuse_manifest_sha256=reuse_manifest_sha256,
                reuse_items=reuse_items,
                character_id=selection["characterId"],
                source_character_id=selection["sourceCharacterId"],
                candidate_id=candidate["candidateId"],
                reference_plan=plan_payload,
                artifact_identity=artifact_identity,
            )
        item = {
            **{
                key: selection[key]
                for key in (
                    "characterId",
                    "sourceCharacterId",
                    "reassignmentReason",
                    "alignmentReportPath",
                    "alignmentReportSha256",
                )
            },
            "candidateId": candidate["candidateId"],
            "itemSha256": item_sha,
            "auditionArtifactSha256": artifact_sha,
            "auditionArtifactIdentity": artifact_identity,
            "acceptedAt": accepted_at,
            "referencePlan": plan_payload,
            "paths": {
                "itemDir": item_dir.as_posix(),
                "referenceRoot": reference_root.as_posix(),
                "referenceWav": plan.wav_path,
                "referenceSidecar": plan.sidecar_path,
                **qa_paths,
            },
        }
        if artifact_reuse is not None:
            item["artifactReuse"] = artifact_reuse
        status, commands = _phase_commands(
            phase=phase,
            repo_root=repo_root,
            item=item,
            remote_host=remote_host,
            remote_repo=remote_repo,
            remote_python=remote_python,
            remote_cache=remote_cache,
        )
        item["phaseStatus"] = status
        item["commands"] = commands
        items.append(item)
    manifest: dict[str, Any] = {
        "schemaVersion": SCHEMA_VERSION,
        "artifactKind": "dots-cast-batch-dry-run",
        "status": "commands-emitted-no-execution-no-cast-writes",
        "phase": phase,
        "batchSha256": batch_sha,
        "identity": identity,
        "remote": {
            "host": remote_host,
            "repository": remote_repo,
            "python": remote_python,
            "cache": remote_cache,
            "independentCache": independent_cache_dir,
        },
        "auditionGenerationPolicy": AUDITION_GENERATION_POLICY,
        "items": items,
        "promotionOrder": [item["characterId"] for item in items]
        if phase == "promote"
        else [],
        "executionPolicy": {
            "dryRunOnly": True,
            "gpuLaunchPerformed": False,
            "castWritePerformed": False,
            "promotion": "serial-in-listed-order",
        },
    }
    if phase == "remote-render":
        render_input_sha = sha256_bytes(
            canonical_json(
                {
                    "batchSha256": batch_sha,
                    "items": [
                        {
                            "characterId": item["characterId"],
                            "auditionArtifactSha256": item["auditionArtifactSha256"],
                            "auditionDir": item["paths"]["auditionDir"],
                            "phaseStatus": item["phaseStatus"],
                        }
                        for item in items
                    ],
                }
            )
        )
        render_manifest_path = (
            batch_dir / f"remote-render-{render_input_sha}.manifest.json"
        ).as_posix()
        render_summary_path = (
            batch_dir / f"render-summary-{render_input_sha}.json"
        ).as_posix()
        pending = [item for item in items if item["phaseStatus"] != "complete"]
        phase_commands: list[dict[str, Any]] = []
        if pending:
            resumable_directories = [
                f"{item['paths']['auditionDir']}/"
                for item in items
                if (repo_root / item["paths"]["auditionDir"]).exists()
            ]
            phase_commands.append(
                _command(
                    [
                        "rsync",
                        "-aR",
                        render_manifest_path,
                        *[
                            path
                            for item in items
                            for path in (
                                item["paths"]["referenceWav"],
                                item["paths"]["referenceSidecar"],
                            )
                        ],
                        *resumable_directories,
                        f"{remote_host}:{remote_repo.rstrip('/')}/",
                    ]
                )
            )
            render_argv = [
                remote_python,
                "scripts/audio/batch_render_dots_auditions.py",
                "--batch-manifest",
                render_manifest_path,
                "--repo-root",
                remote_repo,
                "--cache-dir",
                remote_cache,
                "--output",
                render_summary_path,
                "--execute",
            ]
            phase_commands.append(
                _command(
                    [
                        "ssh",
                        remote_host,
                        f"cd {shlex.quote(remote_repo)} && {shlex.join(render_argv)}",
                    ],
                    host_command=True,
                )
            )
            phase_commands.extend(
                _command(
                    [
                        "rsync",
                        "-a",
                        f"{remote_host}:{_remote(item['paths']['auditionDir'], remote_repo)}/",
                        f"{item['paths']['auditionDir']}/",
                    ]
                )
                for item in items
            )
            phase_commands.append(
                _command(
                    [
                        "rsync",
                        "-a",
                        f"{remote_host}:{_remote(render_summary_path, remote_repo)}",
                        render_summary_path,
                    ]
                )
            )
        manifest["batchRender"] = {
            "inputSha256": render_input_sha,
            "summaryPath": render_summary_path,
            "modelLoadPolicy": "one-dots-runtime-load-per-batch",
        }
        manifest["phaseCommands"] = phase_commands
    if phase == "qa-rank":
        qa_input_sha = sha256_bytes(
            canonical_json(
                {
                    "batchSha256": batch_sha,
                    "primaryCache": remote_cache,
                    "independentCache": independent_cache_dir,
                    "items": [
                        {
                            "characterId": item["characterId"],
                            "auditionArtifactSha256": item["auditionArtifactSha256"],
                            "auditionDir": item["paths"]["auditionDir"],
                            "phaseStatus": item["phaseStatus"],
                        }
                        for item in items
                    ],
                }
            )
        )
        qa_manifest_path = (
            batch_dir / f"qa-rank-{qa_input_sha}.manifest.json"
        ).as_posix()
        qa_summary_path = (batch_dir / f"qa-summary-{qa_input_sha}.json").as_posix()
        pending = [item for item in items if item["phaseStatus"] != "complete"]
        phase_commands: list[dict[str, Any]] = []
        if pending:
            phase_commands.append(
                _command(
                    [
                        "rsync",
                        "-aR",
                        qa_manifest_path,
                        *[f"{item['paths']['auditionDir']}/" for item in items],
                        f"{remote_host}:{remote_repo.rstrip('/')}/",
                    ]
                )
            )
            qa_argv = [
                remote_python,
                "scripts/audio/batch_qa_dots_auditions.py",
                "--batch-manifest",
                qa_manifest_path,
                "--repo-root",
                remote_repo,
                "--cache-dir",
                remote_cache,
                "--independent-cache-dir",
                independent_cache_dir,
                "--output",
                qa_summary_path,
            ]
            phase_commands.append(
                _command(
                    [
                        "ssh",
                        remote_host,
                        f"cd {shlex.quote(remote_repo)} && {shlex.join(qa_argv)}",
                    ],
                    host_command=True,
                )
            )
            phase_commands.extend(
                _command(
                    [
                        "rsync",
                        "-a",
                        f"{remote_host}:{_remote(item['paths']['auditionDir'], remote_repo)}/",
                        f"{item['paths']['auditionDir']}/",
                    ]
                )
                for item in items
            )
            phase_commands.append(
                _command(
                    [
                        "rsync",
                        "-a",
                        f"{remote_host}:{_remote(qa_summary_path, remote_repo)}",
                        qa_summary_path,
                    ]
                )
            )
        manifest["batchQa"] = {
            "inputSha256": qa_input_sha,
            "summaryPath": qa_summary_path,
            "modelLoadPolicy": "one-whisper-load-then-one-campp-load-per-batch",
        }
        manifest["phaseCommands"] = phase_commands
    if phase == "promote":
        promotion_commands = [item["commands"][0] for item in items]
        manifest["serialPromotion"] = {
            "commands": promotion_commands,
            "shell": " && ".join(command["shell"] for command in promotion_commands),
        }
    if phase == "remote-render":
        manifest["batchManifestPath"] = render_manifest_path
    elif phase == "qa-rank":
        manifest["batchManifestPath"] = qa_manifest_path
    manifest_sha = sha256_bytes(
        canonical_json(
            {
                key: value
                for key, value in manifest.items()
                if key != "batchManifestPath"
            }
        )
    )
    manifest["manifestSha256"] = manifest_sha
    if phase not in {"remote-render", "qa-rank"}:
        manifest["batchManifestPath"] = (
            batch_dir / f"{phase}-{manifest_sha}.manifest.json"
        ).as_posix()
    return manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phase", choices=PHASES, required=True)
    parser.add_argument(
        "--alignment-root",
        type=Path,
        default=Path("scratch/audio-jowett-reference-alignment"),
    )
    parser.add_argument("--alignment-report", type=Path, action="append")
    parser.add_argument(
        "--only-character",
        dest="only_characters",
        action="append",
        help=(
            "limit this content-addressed batch to an explicit unselected canonical "
            "voice owner; repeat for multiple characters"
        ),
    )
    parser.add_argument(
        "--batch-root", type=Path, default=Path("scratch/audio-cast-batches")
    )
    parser.add_argument(
        "--candidate-id",
        dest="candidate_ids",
        action="append",
        metavar="CHARACTER_ID=CANDIDATE_ID",
        help=(
            "pin one eligible proof candidate for a character; repeat for "
            "multiple characters"
        ),
    )
    parser.add_argument(
        "--reference-root", type=Path, default=Path("scratch/audio-references")
    )
    parser.add_argument("--narrator-source-character-id")
    parser.add_argument("--narrator-reassignment-reason")
    parser.add_argument("--remote-host", default="gpu")
    parser.add_argument("--remote-repo", default="/mnt/models/dev/plato-audio")
    parser.add_argument(
        "--remote-python", default="/mnt/models/dev/plato-dots/.venv/bin/python"
    )
    parser.add_argument("--remote-cache", default="/mnt/models/hf")
    parser.add_argument(
        "--independent-cache-dir", default="/mnt/models/cache/huggingface"
    )
    parser.add_argument(
        "--reuse-auditions-from",
        type=Path,
        help=(
            "reuse compatible audition directories from a prior batch manifest; "
            "proof/report hashes may differ but immutable audio inputs must match"
        ),
    )
    parser.add_argument("--write-manifest", action="store_true")
    return parser.parse_args()


def _parse_candidate_ids(values: list[str] | None) -> dict[str, str]:
    result: dict[str, str] = {}
    for value in values or []:
        character_id, separator, candidate_id = value.partition("=")
        if (
            separator != "="
            or not character_id
            or not candidate_id
            or character_id in result
        ):
            raise BatchOrchestrationError(
                "--candidate-id must be a unique CHARACTER_ID=CANDIDATE_ID pair"
            )
        result[character_id] = candidate_id
    return result


def main() -> int:
    args = parse_args()
    reports = args.alignment_report or sorted(args.alignment_root.glob("*.report.json"))
    if not reports:
        raise SystemExit("no alignment reports found")
    try:
        manifest = build_batch_manifest(
            phase=args.phase,
            repo_root=REPO_ROOT,
            report_paths=reports,
            batch_root=args.batch_root,
            reference_root=args.reference_root,
            only_characters=(
                set(args.only_characters) if args.only_characters else None
            ),
            candidate_ids=_parse_candidate_ids(args.candidate_ids),
            narrator_source_character_id=args.narrator_source_character_id,
            narrator_reassignment_reason=args.narrator_reassignment_reason,
            remote_host=args.remote_host,
            remote_repo=args.remote_repo,
            remote_python=args.remote_python,
            remote_cache=args.remote_cache,
            independent_cache_dir=args.independent_cache_dir,
            reuse_auditions_from=args.reuse_auditions_from,
        )
        if args.write_manifest:
            path = REPO_ROOT / manifest["batchManifestPath"]
            path.parent.mkdir(parents=True, exist_ok=True)
            data = pretty_json(manifest)
            if path.exists() and path.read_bytes() != data:
                raise BatchOrchestrationError(
                    f"refusing to replace mismatched manifest: {path}"
                )
            path.write_bytes(data)
    except BatchOrchestrationError as error:
        raise SystemExit(str(error)) from error
    print(pretty_json(manifest).decode("utf-8"), end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
