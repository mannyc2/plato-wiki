#!/usr/bin/env python3
"""Deterministically evaluate and promote a Dots voice into ``audio/cast.json``.

The command joins immutable source, alignment, ASR, acoustic, generation, and
WAV evidence.  Dry-run is the default.  ``--write`` writes a content-addressed
decision followed by the updated cast only after the shared renderer contract
accepts the selected voice.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import os
import re
import struct
import subprocess
import tempfile
import wave
from datetime import date
from pathlib import Path
from typing import Any

from cast_acceptance import (
    CAST_ACCEPTANCE_GATES,
    DOTS_REPOSITORY,
    DOTS_REVISION,
    CastAcceptanceError,
    evaluate_gate_failures,
    validate_cast_decision_artifacts,
    validate_cast_registry,
    validate_selected_voice,
)
from verify_reference_asr_adjudication import (
    ReferenceAsrAdjudicationError,
    validate_adjudication,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
TRUE_PEAK_RE = re.compile(r"True peak:\s*\n\s*Peak:\s*([-+]?\d+(?:\.\d+)?) dBFS")
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?")
RANKING_POLICY = (
    "mean-cosine-desc/minimum-window-cosine-desc/"
    "ordinary-word-errors-asc/speech-rate-distance-from-3-asc/seed-asc"
)


class VoiceAcceptanceError(ValueError):
    """Raised when source evidence or every audition candidate fails closed."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def pretty_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise VoiceAcceptanceError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise VoiceAcceptanceError(f"{label} {path} must be an object")
    return value


def repo_path(path: Path, label: str) -> tuple[Path, str]:
    candidate = path if path.is_absolute() else REPO_ROOT / path
    try:
        resolved = candidate.resolve(strict=True)
        relative = resolved.relative_to(REPO_ROOT.resolve()).as_posix()
    except (FileNotFoundError, ValueError) as error:
        raise VoiceAcceptanceError(f"{label} must be a present repository file: {candidate}") from error
    return resolved, relative


def normalize_words(text: str) -> list[str]:
    return [word.lower().replace("’", "'") for word in WORD_RE.findall(text)]


def _registry_video(
    registry: dict[str, Any], dialogue: str, video_id: str
) -> dict[str, Any]:
    if (
        registry.get("schemaVersion") != 2
        or registry.get("status") != "source-pool"
        or registry.get("selectionPolicy", {}).get("automaticSelection") is not True
        or registry.get("selectionPolicy", {}).get("acceptancePolicy")
        != "operator-authorized-deterministic-v1"
    ):
        raise VoiceAcceptanceError("reference source registry does not authorize deterministic v1")
    rows = [row for row in registry.get("dialogues", []) if row.get("dialogue") == dialogue]
    videos = (
        [video for video in rows[0].get("videos", []) if video.get("videoId") == video_id]
        if len(rows) == 1
        else []
    )
    if len(videos) != 1:
        raise VoiceAcceptanceError(f"{dialogue}/{video_id} is not uniquely pinned in reference sources")
    return videos[0]


def _character(
    catalog: dict[str, Any], character_id: str, *, label: str
) -> dict[str, Any]:
    if catalog.get("schemaVersion") != 3 or not isinstance(catalog.get("characters"), list):
        raise VoiceAcceptanceError("unsupported character catalog")
    matches = [row for row in catalog["characters"] if row.get("characterId") == character_id]
    if len(matches) != 1:
        raise VoiceAcceptanceError(f"{label} {character_id!r} is absent or duplicated")
    return matches[0]


def _require_dialogue_appearance(
    character: dict[str, Any], dialogue: str, *, label: str
) -> None:
    appearances = [
        appearance
        for appearance in character.get("appearances", [])
        if appearance.get("dialogue") == dialogue
    ]
    if len(appearances) != 1:
        raise VoiceAcceptanceError(
            f"{label} {character.get('characterId')!r} has no unique {dialogue} appearance"
        )


def _resolved_voice_owner(
    catalog: dict[str, Any], character_id: str, *, label: str
) -> dict[str, Any]:
    character = _character(catalog, character_id, label=label)
    voice_appearances = [
        appearance
        for appearance in character.get("appearances", [])
        if appearance.get("performanceRole") == "voice-owner"
    ]
    if (
        character.get("identityStatus") != "resolved"
        or not voice_appearances
        or any(
            appearance.get("editorialStatus") != "resolved"
            for appearance in voice_appearances
        )
    ):
        raise VoiceAcceptanceError(
            f"{label} {character_id!r} is not a globally resolved canonical voice owner"
        )
    return character


def _materialized_reference(
    sidecar_path: Path,
    registry: dict[str, Any],
) -> tuple[dict[str, Any], Path, str]:
    sidecar = load_json(sidecar_path, "reference materializer sidecar")
    if sidecar.get("schemaVersion") != 1 or set(sidecar) != {
        "schemaVersion",
        "plan",
        "planSha256",
        "sourceMedia",
        "wav",
        "tools",
    }:
        raise VoiceAcceptanceError("reference materializer sidecar has unsupported fields")
    plan = sidecar["plan"]
    if sha256_bytes(canonical_json(plan)) != sidecar.get("planSha256"):
        raise VoiceAcceptanceError("reference materializer plan hash is inconsistent")
    video = _registry_video(registry, plan["dialogue"], plan["video_id"])
    if (
        plan["source_url"] != video["url"]
        or plan["source_title"] != video["title"]
        or plan["source_duration_seconds"] != video["durationSeconds"]
    ):
        raise VoiceAcceptanceError("reference sidecar no longer matches the source registry")
    wav_path, wav_relative = repo_path(Path(sidecar["wav"]["path"]), "reference WAV")
    if (
        sidecar["wav"].get("sha256") != sha256_file(wav_path)
        or sidecar["wav"].get("sampleRate") != 48_000
        or sidecar["wav"].get("channels") != 1
        or not math.isclose(
            sidecar["wav"].get("durationSeconds", math.inf),
            plan["end_seconds"] - plan["start_seconds"],
            rel_tol=0,
            abs_tol=1 / 48_000,
        )
    ):
        raise VoiceAcceptanceError("reference WAV does not match its sidecar")
    return sidecar, wav_path, wav_relative


def _jowett_purity(
    proof_path: Path,
    *,
    dialogue: str,
    source_character_id: str,
    video_id: str,
    start_seconds: float,
    end_seconds: float,
    prompt_text: str,
    registry_sha256: str,
) -> tuple[dict[str, Any], str]:
    proof = load_json(proof_path, "Jowett alignment proof")
    if (
        proof.get("schemaVersion") != 1
        or proof.get("artifactKind") != "jowett-caption-character-reference-alignment"
        or proof.get("status") != "reference-intervals-emitted-no-cast-writes"
    ):
        raise VoiceAcceptanceError("unsupported Jowett alignment proof")
    frozen = {key: value for key, value in proof.items() if key != "reportSha256"}
    if sha256_bytes(canonical_json(frozen)) != proof.get("reportSha256"):
        raise VoiceAcceptanceError("Jowett alignment report hash is inconsistent")
    input_specs = {
        "registry": ("registryPath", "registrySha256"),
        "characters": ("charactersPath", "charactersSha256"),
        "referenceSources": ("referenceSourcesPath", "referenceSourcesSha256"),
        "script": ("scriptPath", "scriptSha256"),
    }
    inputs = proof.get("inputs")
    if not isinstance(inputs, dict):
        raise VoiceAcceptanceError("Jowett alignment report has no bound inputs")
    live_inputs: dict[str, tuple[str, str]] = {}
    for name in input_specs:
        record = inputs.get(name)
        if (
            not isinstance(record, dict)
            or not isinstance(record.get("path"), str)
            or not isinstance(record.get("sha256"), str)
        ):
            raise VoiceAcceptanceError(f"Jowett alignment {name} input is malformed")
        input_path, input_relative = repo_path(
            Path(record["path"]), f"Jowett alignment {name} input"
        )
        live_sha256 = sha256_file(input_path)
        if record["sha256"] != live_sha256:
            raise VoiceAcceptanceError(
                f"Jowett alignment report is stale against its {name} input"
            )
        live_inputs[name] = (input_relative, live_sha256)
    if live_inputs["referenceSources"][1] != registry_sha256:
        raise VoiceAcceptanceError("Jowett proof is stale against reference sources")
    candidates = [
        candidate
        for candidate in proof.get("candidates", [])
        if candidate.get("status") == "automatically-eligible-reference-interval"
        and candidate.get("dialogue") == dialogue
        and candidate.get("characterId") == source_character_id
        and candidate.get("videoId") == video_id
        and abs(candidate.get("alignment", {}).get("startSeconds", -1) - start_seconds)
        <= 0.02
        and abs(candidate.get("alignment", {}).get("endSeconds", -1) - end_seconds)
        <= 0.02
        and normalize_words(candidate.get("alignment", {}).get("expectedPrompt", ""))
        == normalize_words(prompt_text)
    ]
    anchors = [
        anchor
        for anchor in proof.get("referenceAnchorAudits", [])
        if anchor.get("characterId") == source_character_id
        and anchor.get("videoId") == video_id
        and anchor.get("status")
        in {
            "verified-exact-requested-interval",
            "requested-boundaries-rejected-safe-inner-interval-emitted",
        }
        # Always bind to the audited safe interval.  In particular, the
        # rejected Socrates boundaries can never pass through this branch.
        and abs(anchor.get("safeInterval", {}).get("startSeconds", -1) - start_seconds)
        <= 0.02
        and abs(anchor.get("safeInterval", {}).get("endSeconds", -1) - end_seconds)
        <= 0.02
        and normalize_words(anchor.get("safeInterval", {}).get("expectedPrompt", ""))
        == normalize_words(prompt_text)
    ]
    # A reference interval must identify exactly one proof record across both
    # producer lanes.  Do not let a candidate silently shadow a matching
    # audited anchor, because that would make the recorded proof identity
    # depend on list preference rather than unique evidence.
    evidence = candidates + anchors
    if len(evidence) != 1:
        raise VoiceAcceptanceError(
            "reference interval is not uniquely proved inside one Jowett-labelled speaker turn"
        )
    row = evidence[0]
    provenance = row.get("provenance")
    if not isinstance(provenance, dict):
        raise VoiceAcceptanceError("Jowett proof record has no bound provenance")
    for name, (path_field, sha_field) in input_specs.items():
        expected_path, expected_sha256 = live_inputs[name]
        if (
            provenance.get(path_field) != expected_path
            or provenance.get(sha_field) != expected_sha256
        ):
            raise VoiceAcceptanceError(
                f"Jowett proof record provenance differs from its {name} input"
            )
    if "safety" in row:
        safety = row["safety"]
        if (
            safety.get("singleCharacterUnderEditionRule") is not True
            or safety.get("reportedSpeechExcluded") is not True
            or safety.get("operatorListeningRequired") is not False
        ):
            raise VoiceAcceptanceError("Jowett candidate does not satisfy its safety contract")
    elif (
        row.get("sourceTurn", {}).get("containsQuotedSpeech") is not False
        or row.get("castWritePerformed") is not False
    ):
        raise VoiceAcceptanceError("Jowett anchor does not satisfy its safe-turn contract")
    source_agreement_sha256 = row.get("sourceAgreementSha256")
    if not isinstance(source_agreement_sha256, str) or re.fullmatch(
        r"[0-9a-f]{64}", source_agreement_sha256
    ) is None:
        raise VoiceAcceptanceError("Jowett proof has no bound source-agreement digest")
    return {
        "method": "jowett-caption-turn-alignment-v1",
        "dominantSpeakerCoverage": 1,
        "competingSpeakerCoverage": 0,
        "uncoveredSpeakerCoverage": 0,
        "proofRecordId": row.get("candidateId") or row.get("anchorId"),
        "reportSha256": proof["reportSha256"],
        "sourceAgreementSha256": source_agreement_sha256,
    }, sha256_file(proof_path)


def _asr_cases(
    path: Path, *, audition_plan_sha256: str | None = None
) -> tuple[dict[str, Any], dict[str, Any], str]:
    evidence = load_json(path, "ASR evidence")
    cases = evidence.get("cases")
    if (
        evidence.get("schemaVersion") != 1
        or evidence.get("status") != "audition-qa"
        or evidence.get("asrRepo") != "openai/whisper-small.en"
        or evidence.get("asrRevision") != "e8727524f962ee844a7319d92be39ac1bd25655a"
        or not isinstance(cases, dict)
        or (
            audition_plan_sha256 is not None
            and evidence.get("auditionPlanSha256") != audition_plan_sha256
        )
    ):
        raise VoiceAcceptanceError("ASR evidence is not canonical audition QA")
    return evidence, cases, sha256_file(path)


def _reference_asr(
    cases: dict[str, Any],
    *,
    reference_file: str,
    prompt_text: str,
    evidence_path: str,
    evidence_sha256: str,
    fallback_path: Path | None,
    reference_sha256: str,
    source_agreement_sha256: str,
    source_agreement_record_id: str,
) -> dict[str, Any]:
    matches = [
        case
        for case in cases.values()
        if case.get("kind") == "reference"
        and isinstance(case.get("path"), str)
        and Path(case["path"]).name == reference_file
    ]
    if len(matches) != 1:
        raise VoiceAcceptanceError("ASR evidence has no unique matching reference case")
    case = matches[0]
    if normalize_words(case.get("expected", "")) != normalize_words(prompt_text):
        raise VoiceAcceptanceError("reference ASR expected text differs from materializer prompt")
    expected = case.get("expectedWordCount")
    errors = case.get("nameNormalizedWordErrorCount")
    rate = case.get("nameNormalizedWordErrorRate")
    if (
        not isinstance(expected, int)
        or expected <= 0
        or not isinstance(errors, int)
        or errors < 0
        or not isinstance(rate, (int, float))
        or rate != errors / expected
    ):
        raise VoiceAcceptanceError("reference ASR metrics are inconsistent")
    common = {
        "primaryExpectedWords": expected,
        "primaryOrdinaryWordErrors": errors,
        "primaryOrdinaryWordErrorRate": rate,
        "primaryEvidencePath": evidence_path,
        "primaryEvidenceSha256": evidence_sha256,
    }
    if errors == 0:
        return {"decision": "primary-zero-error", **common}
    if fallback_path is None:
        raise VoiceAcceptanceError(
            f"reference ASR failed with {errors}/{expected} ordinary-word errors and has no adjudication"
        )
    fallback = load_json(fallback_path, "reference ASR adjudication")
    try:
        validate_adjudication(
            fallback,
            adjudication_path=fallback_path,
            reference_sha256=reference_sha256,
            expected_text=prompt_text,
            primary_errors=errors,
            source_agreement_sha256=source_agreement_sha256,
        )
    except ReferenceAsrAdjudicationError as error:
        raise VoiceAcceptanceError(str(error)) from error
    _, independent_relative = repo_path(
        Path(fallback["independentEvidencePath"]), "independent ASR evidence"
    )
    _, source_relative = repo_path(
        Path(fallback["sourceAgreementEvidencePath"]), "source-agreement evidence"
    )
    if fallback["independentExpectedWords"] != expected:
        raise VoiceAcceptanceError("reference ASR adjudication expected-word count differs")
    if fallback["sourceAgreementRecordId"] != source_agreement_record_id:
        raise VoiceAcceptanceError(
            "reference ASR adjudication proof record differs from speaker purity"
        )
    _, fallback_relative = repo_path(fallback_path, "reference ASR adjudication")
    return {
        "decision": "independent-large-v3-zero-error",
        **common,
        "sourceAgreementEvidencePath": source_relative,
        "sourceAgreementEvidenceSha256": fallback["sourceAgreementEvidenceSha256"],
        "sourceAgreementSha256": fallback["sourceAgreementSha256"],
        "adjudicationEvidencePath": fallback_relative,
        "adjudicationEvidenceSha256": sha256_file(fallback_path),
        "independentExpectedWords": expected,
        "independentOrdinaryWordErrors": 0,
        "independentOrdinaryWordErrorRate": 0,
        "independentEvidencePath": independent_relative,
        "independentEvidenceSha256": fallback["independentEvidenceSha256"],
        "independentModel": fallback["independentModel"],
    }


def _pcm_signal(path: Path) -> dict[str, Any]:
    try:
        with wave.open(str(path), "rb") as handle:
            channels = handle.getnchannels()
            sample_rate = handle.getframerate()
            sample_width = handle.getsampwidth()
            frames = handle.getnframes()
            raw = handle.readframes(frames)
    except (OSError, wave.Error) as error:
        raise VoiceAcceptanceError(f"invalid audition WAV {path}: {error}") from error
    if channels != 1 or sample_rate != 48_000 or sample_width not in {2, 3} or frames <= 0:
        raise VoiceAcceptanceError(f"audition WAV must be non-empty mono 48 kHz PCM16/24: {path}")
    if sample_width == 2:
        values = struct.unpack(f"<{frames}h", raw)
        maximum = 2**15
        positive_clip = maximum - 1
        negative_clip = -maximum
    else:
        values_list: list[int] = []
        for index in range(0, len(raw), 3):
            value = int.from_bytes(raw[index : index + 3], "little", signed=False)
            values_list.append(value - (1 << 24) if value & (1 << 23) else value)
        values = values_list
        maximum = 2**23
        positive_clip = maximum - 1
        negative_clip = -maximum
    peak = max(abs(value) for value in values)
    clipped = sum(value in {positive_clip, negative_clip} for value in values)
    return {
        "durationSeconds": frames / sample_rate,
        "clippedSamples": clipped,
        "peakAmplitude": peak / maximum,
    }


def _true_peak(path: Path, ffmpeg: str) -> float:
    completed = subprocess.run(
        [
            ffmpeg,
            "-hide_banner",
            "-nostats",
            "-i",
            str(path),
            "-filter_complex",
            "ebur128=peak=true",
            "-f",
            "null",
            "-",
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    if completed.returncode != 0:
        raise VoiceAcceptanceError(f"ffmpeg true-peak scan failed for {path}: {completed.stderr[-500:]}")
    matches = TRUE_PEAK_RE.findall(completed.stderr)
    if not matches:
        raise VoiceAcceptanceError(f"ffmpeg emitted no true-peak summary for {path}")
    return float(matches[-1])


def _candidate_rows(
    clone_path: Path,
    asr_path: Path,
    acoustic_path: Path,
    *,
    reference_sha256: str,
    reference_sidecar_sha256: str,
    reference_character_id: str,
    reference_dialogue: str,
    reference_source_url: str,
    reference_video_id: str,
    reference_prompt: str,
    ffmpeg: str,
) -> tuple[list[dict[str, Any]], dict[str, Any], str, str]:
    clone = load_json(clone_path, "Dots clone manifest")
    if set(clone) != {
        "schemaVersion",
        "status",
        "plan",
        "planSha256",
        "packages",
        "outputs",
    } or clone.get("schemaVersion") != 1 or clone.get("status") != "audition":
        raise VoiceAcceptanceError("Dots audition manifest is not canonical")
    plan = clone.get("plan")
    plan_fields = {
        "schema_version",
        "dialogue",
        "character_id",
        "video_id",
        "source_url",
        "reference_path",
        "reference_sha256",
        "reference_sidecar_sha256",
        "prompt_text",
        "target_text",
        "seeds",
        "model_repo",
        "model_revision",
        "dots_source_commit",
        "precision",
        "language",
        "num_steps",
        "guidance_scale",
        "speaker_scale",
        "max_generate_length",
        "output_dir",
    }
    if not isinstance(plan, dict) or set(plan) != plan_fields:
        raise VoiceAcceptanceError("Dots audition plan has unsupported fields")
    plan_sha = clone.get("planSha256")
    if not isinstance(plan_sha, str) or sha256_bytes(canonical_json(plan)) != plan_sha:
        raise VoiceAcceptanceError("Dots audition plan hash is inconsistent")
    asr, cases, asr_sha = _asr_cases(asr_path, audition_plan_sha256=plan_sha)
    acoustic = load_json(acoustic_path, "CAM++ acoustic ranking")
    acoustic_sha = sha256_file(acoustic_path)
    if (
        set(acoustic)
        != {
            "schemaVersion",
            "status",
            "auditionPlanSha256",
            "modelRepository",
            "modelRevision",
            "encoder",
            "referencePath",
            "windowSeconds",
            "ranking",
        }
        or acoustic.get("schemaVersion") != 1
        or acoustic.get("status") != "audition-ranking"
        or acoustic.get("auditionPlanSha256") != plan_sha
        or plan.get("schema_version") != 1
        or plan.get("model_repo") != DOTS_REPOSITORY
        or plan.get("model_revision") != DOTS_REVISION
        or acoustic.get("modelRepository") != DOTS_REPOSITORY
        or acoustic.get("modelRevision") != DOTS_REVISION
        or acoustic.get("encoder") != "CAM++ speaker x-vector"
        or plan.get("reference_sha256") != reference_sha256
        or plan.get("reference_sidecar_sha256") != reference_sidecar_sha256
        or plan.get("character_id") != reference_character_id
        or plan.get("dialogue") != reference_dialogue
        or plan.get("source_url") != reference_source_url
        or plan.get("video_id") != reference_video_id
        or normalize_words(str(plan.get("prompt_text", ""))) != normalize_words(reference_prompt)
        or Path(str(plan.get("reference_path", ""))).name
        != Path(str(acoustic.get("referencePath", ""))).name
    ):
        raise VoiceAcceptanceError("Dots audition/acoustic evidence is stale against the reference")
    outputs = clone.get("outputs")
    rankings = acoustic.get("ranking")
    if not isinstance(outputs, list) or not outputs or not isinstance(rankings, list):
        raise VoiceAcceptanceError("Dots audition or acoustic evidence has no candidates")
    if not isinstance(plan.get("seeds"), list) or [row.get("seed") for row in outputs] != plan["seeds"]:
        raise VoiceAcceptanceError("Dots audition output inventory differs from its seed plan")
    expected_case_names = {"youtube-reference", *{f"seed-{seed}" for seed in plan["seeds"]}}
    if set(cases) != expected_case_names:
        raise VoiceAcceptanceError("ASR candidate inventory differs from the Dots audition")
    reference_case = cases["youtube-reference"]
    if (
        reference_case.get("kind") != "reference"
        or Path(str(reference_case.get("path", ""))).name
        != Path(str(plan.get("reference_path", ""))).name
        or normalize_words(str(reference_case.get("expected", "")))
        != normalize_words(reference_prompt)
    ):
        raise VoiceAcceptanceError("ASR reference case differs from the Dots audition plan")
    ranking_by_seed = {row.get("seed"): row for row in rankings if isinstance(row, dict)}
    if set(ranking_by_seed) != set(plan["seeds"]) or len(rankings) != len(outputs):
        raise VoiceAcceptanceError("CAM++ ranking inventory differs from the Dots audition")
    rows: list[dict[str, Any]] = []
    for output in outputs:
        seed = output.get("seed")
        filename = output.get("file")
        if (
            not isinstance(output, dict)
            or set(output)
            != {
                "seed",
                "file",
                "sampleRate",
                "durationSeconds",
                "generationSeconds",
                "peakGpuMiB",
                "sha256",
            }
            or not isinstance(seed, int)
            or not isinstance(filename, str)
            or output.get("sampleRate") != 48_000
        ):
            raise VoiceAcceptanceError("Dots audition output is malformed")
        wav_path = clone_path.parent / filename
        if not wav_path.is_file() or sha256_file(wav_path) != output.get("sha256"):
            raise VoiceAcceptanceError(f"Dots output {filename} is missing or hash-mismatched")
        case = cases.get(f"seed-{seed}")
        ranking = ranking_by_seed.get(seed)
        if (
            not isinstance(case, dict)
            or case.get("kind") != "clone"
            or Path(str(case.get("path", ""))).name != filename
            or normalize_words(str(case.get("expected", "")))
            != normalize_words(str(plan.get("target_text", "")))
            or not isinstance(ranking, dict)
            or ranking.get("file") != filename
        ):
            raise VoiceAcceptanceError(f"seed {seed} lacks matching ASR/acoustic evidence")
        signal = _pcm_signal(wav_path)
        if abs(signal["durationSeconds"] - output.get("durationSeconds", -1)) > 1 / 48_000:
            raise VoiceAcceptanceError(f"seed {seed} duration differs from audition manifest")
        expected = case.get("expectedWordCount")
        errors = case.get("nameNormalizedWordErrorCount")
        error_rate = case.get("nameNormalizedWordErrorRate")
        window_scores = ranking.get("windowCosineSimilarities")
        if (
            not isinstance(expected, int)
            or expected <= 0
            or not isinstance(errors, int)
            or errors < 0
            or error_rate != errors / expected
            or not isinstance(window_scores, list)
            or not window_scores
            or any(not isinstance(score, (int, float)) or not math.isfinite(score) for score in window_scores)
            or min(window_scores) != ranking.get("minimumCosineSimilarity")
            or max(window_scores) != ranking.get("maximumCosineSimilarity")
            or not math.isclose(
                sum(window_scores) / len(window_scores),
                ranking.get("meanCosineSimilarity", math.inf),
                rel_tol=0,
                abs_tol=1e-12,
            )
        ):
            raise VoiceAcceptanceError(f"seed {seed} QA metrics are inconsistent")
        audition = {
            "relativePath": wav_path.resolve().relative_to(REPO_ROOT).as_posix(),
            "sha256": output["sha256"],
            "durationSeconds": signal["durationSeconds"],
            "expectedWords": expected,
            "ordinaryWordErrors": errors,
            "ordinaryWordErrorRate": error_rate,
            "asrEvidencePath": asr_path.resolve().relative_to(REPO_ROOT).as_posix(),
            "asrEvidenceSha256": asr_sha,
            "meanSpeakerCosineSimilarity": ranking["meanCosineSimilarity"],
            "minimumWindowSpeakerCosineSimilarity": ranking["minimumCosineSimilarity"],
            "acousticEvidencePath": acoustic_path.resolve().relative_to(REPO_ROOT).as_posix(),
            "acousticEvidenceSha256": acoustic_sha,
            "clippedSamples": signal["clippedSamples"],
            "truePeakDbtp": _true_peak(wav_path, ffmpeg),
            "peakAmplitude": signal["peakAmplitude"],
        }
        rows.append(
            {
                "seed": seed,
                "file": filename,
                "audition": audition,
                "generation": {
                    "numSteps": plan.get("num_steps"),
                    "guidanceScale": plan.get("guidance_scale"),
                    "speakerScale": plan.get("speaker_scale"),
                    "language": plan.get("language"),
                    "precision": plan.get("precision"),
                },
            }
        )
    return rows, asr, asr_sha, acoustic_sha


def _atomic_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = pretty_json(value).decode("utf-8")
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, delete=False
    ) as handle:
        handle.write(data)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def build_decision(args: argparse.Namespace) -> tuple[dict[str, Any], dict[str, Any]]:
    cast_path, cast_relative = repo_path(args.cast, "cast catalog")
    characters_path, _ = repo_path(args.characters, "character catalog")
    registry_path, registry_relative = repo_path(args.sources, "reference source registry")
    sidecar_path, sidecar_relative = repo_path(args.reference_sidecar, "reference sidecar")
    purity_path, purity_relative = repo_path(args.speaker_purity, "speaker-purity proof")
    clone_path, clone_relative = repo_path(args.clone_manifest, "Dots clone manifest")
    asr_path, asr_relative = repo_path(args.asr, "ASR evidence")
    acoustic_path, acoustic_relative = repo_path(args.acoustic, "acoustic evidence")

    cast = load_json(cast_path, "cast catalog")
    validate_cast_registry(cast)
    characters = load_json(characters_path, "character catalog")
    registry = load_json(registry_path, "reference source registry")
    sidecar, reference_wav, reference_relative = _materialized_reference(
        sidecar_path, registry
    )
    plan = sidecar["plan"]
    dialogue = plan["dialogue"]
    source_character_id = args.source_character_id or plan["character_id"]
    target = _resolved_voice_owner(
        characters, args.character_id, label="target character"
    )
    source_character = _character(
        characters, source_character_id, label="source character"
    )
    if source_character_id == args.character_id:
        _require_dialogue_appearance(target, dialogue, label="target character")
    else:
        _require_dialogue_appearance(
            source_character, dialogue, label="source character"
        )
    registry_sha = sha256_file(registry_path)
    purity, purity_sha = _jowett_purity(
        purity_path,
        dialogue=dialogue,
        source_character_id=source_character_id,
        video_id=plan["video_id"],
        start_seconds=plan["start_seconds"],
        end_seconds=plan["end_seconds"],
        prompt_text=plan["prompt_text"],
        registry_sha256=registry_sha,
    )
    candidates, _, asr_sha, _ = _candidate_rows(
        clone_path,
        asr_path,
        acoustic_path,
        reference_sha256=sidecar["wav"]["sha256"],
        reference_sidecar_sha256=sha256_file(sidecar_path),
        reference_character_id=plan["character_id"],
        reference_dialogue=dialogue,
        reference_source_url=plan["source_url"],
        reference_video_id=plan["video_id"],
        reference_prompt=plan["prompt_text"],
        ffmpeg=args.ffmpeg,
    )
    _, asr_cases, _ = _asr_cases(asr_path)
    fallback_path = None
    if args.reference_asr_adjudication is not None:
        fallback_path, _ = repo_path(
            args.reference_asr_adjudication, "reference ASR adjudication"
        )
    reference_asr = _reference_asr(
        asr_cases,
        reference_file=reference_wav.name,
        prompt_text=plan["prompt_text"],
        evidence_path=asr_relative,
        evidence_sha256=asr_sha,
        fallback_path=fallback_path,
        reference_sha256=sidecar["wav"]["sha256"],
        source_agreement_sha256=purity["sourceAgreementSha256"],
        source_agreement_record_id=purity["proofRecordId"],
    )
    reference = {
        "sourceUrl": plan["source_url"],
        "sourceRegistryPath": registry_relative,
        "sourceRegistrySha256": registry_sha,
        "sourceDialogue": dialogue,
        "sourceVideoId": plan["video_id"],
        "sourceCharacterId": source_character_id,
        "videoStartSeconds": plan["start_seconds"],
        "videoEndSeconds": plan["end_seconds"],
        "localDurationSeconds": sidecar["wav"]["durationSeconds"],
        "localSha256": sidecar["wav"]["sha256"],
        "relativePath": reference_relative,
        "promptText": plan["prompt_text"],
        "referenceAsr": reference_asr,
        "speakerPurityEvidencePath": purity_relative,
        "speakerPurityEvidenceSha256": purity_sha,
        "speakerPurityProofRecordId": purity["proofRecordId"],
        "speakerPuritySourceAgreementSha256": purity[
            "sourceAgreementSha256"
        ],
        "speakerPurityMethod": purity["method"],
        "dominantSpeakerCoverage": purity["dominantSpeakerCoverage"],
        "competingSpeakerCoverage": purity["competingSpeakerCoverage"],
        "uncoveredSpeakerCoverage": purity["uncoveredSpeakerCoverage"],
    }

    evaluated: list[dict[str, Any]] = []
    for candidate in candidates:
        failures = evaluate_gate_failures(reference, candidate["audition"])
        rate = candidate["audition"]["expectedWords"] / candidate["audition"]["durationSeconds"]
        candidate["failures"] = failures
        candidate["rankingKey"] = [
            -candidate["audition"]["meanSpeakerCosineSimilarity"],
            -candidate["audition"]["minimumWindowSpeakerCosineSimilarity"],
            candidate["audition"]["ordinaryWordErrors"],
            abs(rate - 3),
            candidate["seed"],
        ]
        evaluated.append(candidate)
    passing = sorted(
        (candidate for candidate in evaluated if not candidate["failures"]),
        key=lambda candidate: tuple(candidate["rankingKey"]),
    )
    for rank, candidate in enumerate(passing, 1):
        candidate["passingRank"] = rank
    if not passing:
        raise VoiceAcceptanceError("every Dots audition candidate failed deterministic gates")
    if args.seed is None:
        selected = passing[0]
        candidate_selection = "highest-ranked-passing"
    else:
        matches = [candidate for candidate in passing if candidate["seed"] == args.seed]
        if len(matches) != 1:
            raise VoiceAcceptanceError(f"operator-pinned seed {args.seed} is absent or failed")
        selected = matches[0]
        candidate_selection = "operator-pinned"

    source_assignment_kind = (
        "same-character"
        if source_character_id == args.character_id
        else "voice-source-reassignment"
    )
    if source_assignment_kind == "voice-source-reassignment" and not args.reassignment_reason:
        raise VoiceAcceptanceError(
            "--reassignment-reason is required when sourceCharacterId differs from characterId"
        )
    source_reason = args.reassignment_reason or "The source character matches the canonical voice owner."
    decision_path = args.decision_output or Path(
        f"audio/cast-decisions/{args.character_id}.json"
    )
    decision_absolute = decision_path if decision_path.is_absolute() else REPO_ROOT / decision_path
    try:
        decision_relative = decision_absolute.resolve().relative_to(REPO_ROOT.resolve()).as_posix()
    except ValueError as error:
        raise VoiceAcceptanceError("decision output must stay inside the repository") from error

    decision_core = {
        "schemaVersion": 1,
        "status": "accepted-deterministic-cast-decision",
        "policy": "cast-auto-accept-v1",
        "acceptedAt": args.accepted_at,
        "characterId": args.character_id,
        "sourceCharacterId": source_character_id,
        "candidateSelection": candidate_selection,
        "rankingPolicy": RANKING_POLICY,
        "inputs": {
            "cast": {"path": cast_relative, "sha256": sha256_file(cast_path)},
            "characters": {"path": args.characters.as_posix(), "sha256": sha256_file(characters_path)},
            "referenceSources": {"path": registry_relative, "sha256": registry_sha},
            "referenceSidecar": {"path": sidecar_relative, "sha256": sha256_file(sidecar_path)},
            "speakerPurity": {"path": purity_relative, "sha256": purity_sha},
            "cloneManifest": {"path": clone_relative, "sha256": sha256_file(clone_path)},
            "asr": {"path": asr_relative, "sha256": asr_sha},
            "acoustic": {"path": acoustic_relative, "sha256": sha256_file(acoustic_path)},
            **(
                {
                    "referenceAsrAdjudication": {
                        "path": fallback_path.resolve().relative_to(REPO_ROOT).as_posix(),
                        "sha256": sha256_file(fallback_path),
                    }
                }
                if fallback_path is not None
                else {}
            ),
        },
        "reference": reference,
        "gates": CAST_ACCEPTANCE_GATES,
        "candidates": evaluated,
        "selectedSeed": selected["seed"],
        "selectedPassingRank": selected["passingRank"],
    }
    decision_content_sha = sha256_bytes(canonical_json(decision_core))
    decision = {**decision_core, "decisionContentSha256": decision_content_sha}
    decision_file_sha = sha256_bytes(pretty_json(decision))
    voice = {
        "characterId": args.character_id,
        "displayName": target["displayName"],
        "status": "selected",
        "engine": "dots.tts-soar",
        "model": {"repository": DOTS_REPOSITORY, "revision": DOTS_REVISION},
        "mode": "continuation-voice-cloning",
        "seed": selected["seed"],
        "reference": copy.deepcopy(reference),
        "generation": copy.deepcopy(selected["generation"]),
        "audition": copy.deepcopy(selected["audition"]),
        "selection": {
            "basis": "operator-authorized-deterministic-gates",
            "policy": "cast-auto-accept-v1",
            "acceptedAt": args.accepted_at,
            "label": f"dots-{dialogue}-{args.character_id}-seed{selected['seed']}",
            "allGatesPassed": True,
            "candidateSelection": candidate_selection,
            "evaluatedCandidateCount": len(evaluated),
            "passingCandidateCount": len(passing),
            "selectedRank": selected["passingRank"],
            "decisionPath": decision_relative,
            "decisionSha256": decision_file_sha,
            "sourceAssignment": {
                "kind": source_assignment_kind,
                "authorizedBy": "operator",
                "reason": source_reason,
            },
        },
    }
    try:
        validate_selected_voice(voice)
    except CastAcceptanceError as error:
        raise VoiceAcceptanceError(str(error)) from error
    return decision, voice


def promote(args: argparse.Namespace, decision: dict[str, Any], voice: dict[str, Any]) -> None:
    cast_path = args.cast if args.cast.is_absolute() else REPO_ROOT / args.cast
    cast = load_json(cast_path, "cast catalog")
    voices = [
        existing
        for existing in cast.get("voices", [])
        if existing.get("characterId") != voice["characterId"]
    ]
    voices.append(voice)
    voices.sort(key=lambda item: item["characterId"])
    cast["voices"] = voices
    cast["updatedAt"] = args.accepted_at
    decision_path = REPO_ROOT / voice["selection"]["decisionPath"]
    _atomic_json(decision_path, decision)
    if sha256_bytes(
        canonical_json(
            {key: value for key, value in decision.items() if key != "decisionContentSha256"}
        )
    ) != decision["decisionContentSha256"]:
        raise VoiceAcceptanceError("decision content hash changed before cast write")
    if sha256_file(decision_path) != voice["selection"]["decisionSha256"]:
        raise VoiceAcceptanceError("decision file hash changed before cast write")
    try:
        validate_cast_registry(cast)
        validate_cast_decision_artifacts(cast, REPO_ROOT)
    except CastAcceptanceError as error:
        raise VoiceAcceptanceError(str(error)) from error
    _atomic_json(cast_path, cast)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character-id", required=True)
    parser.add_argument("--source-character-id")
    parser.add_argument("--reassignment-reason")
    parser.add_argument("--reference-sidecar", type=Path, required=True)
    parser.add_argument("--speaker-purity", type=Path, required=True)
    parser.add_argument("--clone-manifest", type=Path, required=True)
    parser.add_argument("--asr", type=Path, required=True)
    parser.add_argument("--acoustic", type=Path, required=True)
    parser.add_argument("--reference-asr-adjudication", type=Path)
    parser.add_argument("--seed", type=int, help="explicit operator pin; default chooses top passing seed")
    parser.add_argument("--accepted-at", default=date.today().isoformat())
    parser.add_argument("--decision-output", type=Path)
    parser.add_argument("--cast", type=Path, default=Path("audio/cast.json"))
    parser.add_argument("--characters", type=Path, default=Path("audio/characters.json"))
    parser.add_argument("--sources", type=Path, default=Path("audio/reference-sources.json"))
    parser.add_argument("--ffmpeg", default="ffmpeg")
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        decision, voice = build_decision(args)
        if args.write:
            promote(args, decision, voice)
    except (VoiceAcceptanceError, CastAcceptanceError) as error:
        raise SystemExit(str(error)) from error
    print(
        json.dumps(
            {
                "writePerformed": args.write,
                "selectedVoice": voice,
                "decision": decision,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
