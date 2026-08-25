"""Shared deterministic cast-acceptance contract.

This module is intentionally standard-library-only.  Both the cast promoter and
the production Dots renderer import it so a voice cannot be accepted under one
set of gates and rendered under another.
"""

from __future__ import annotations

import math
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import parse_qs, urlparse


CAST_SCHEMA_VERSION = 3
ACCEPTANCE_POLICY = "operator-authorized-deterministic-v1"
SELECTION_POLICY = "cast-auto-accept-v1"
PRIMARY_REFERENCE_ASR_DECISION = "primary-zero-error"
INDEPENDENT_REFERENCE_ASR_DECISION = "independent-large-v3-zero-error"
INDEPENDENT_ASR_REPOSITORY = "deepdml/faster-whisper-large-v3-turbo-ct2"
INDEPENDENT_ASR_REVISION = "44cbbd1adefe7387c83df88963a6d9ac4c9adea5"
DOTS_REPOSITORY = "rednote-hilab/dots.tts-soar"
DOTS_REVISION = "e3520f75254d0020a0406db31c51a79d00d22d55"

CAST_ACCEPTANCE_GATES: dict[str, Any] = {
    "referenceDuration": {
        "minimumSeconds": 3,
        "maximumSeconds": 15,
        "maximumIntervalDeltaSeconds": 0.05,
    },
    "speakerPurity": {
        "minimumDominantCoverage": 0.95,
        "maximumCompetingCoverage": 0.02,
        "maximumUncoveredCoverage": 0.03,
    },
    "asrFidelity": {
        "minimumReferenceExpectedWords": 8,
        "maximumReferenceOrdinaryWordErrors": 0,
        "maximumReferenceOrdinaryWordErrorRate": 0,
        "referenceFailureAdjudication": (
            "exact-source-agreement-plus-pinned-independent-large-v3-zero-v1"
        ),
        "minimumExpectedWords": 40,
        "maximumOrdinaryWordErrors": 0,
        "maximumOrdinaryWordErrorRate": 0,
    },
    "acousticConsistency": {
        "minimumMeanCosineSimilarity": 0.85,
        "minimumWindowCosineSimilarity": 0.8,
    },
    "signalSafety": {
        "maximumClippedSamples": 0,
        "maximumTruePeakDbtp": 0,
        "maximumPeakAmplitude": 0.9999,
    },
    "auditionDuration": {
        "minimumSeconds": 8,
        "maximumSeconds": 60,
        "minimumWordsPerSecond": 1.5,
        "maximumWordsPerSecond": 4.5,
    },
}

CAST_ENGINE_POLICY: dict[str, Any] = {
    "defaultEngine": "dots.tts-soar",
    "exceptionsRequireRecordedQaFailure": True,
    "implicitFallbackVoice": False,
    "voiceOwnership": "one-voice-per-character",
    "reportedSpeech": "inherit-active-character",
    "acceptancePolicy": ACCEPTANCE_POLICY,
    "manualListeningRequired": False,
    "acceptanceGates": CAST_ACCEPTANCE_GATES,
}

SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REVISION_RE = re.compile(r"^[0-9a-f]{40}$")
CHARACTER_ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class CastAcceptanceError(ValueError):
    """Raised when cast evidence cannot satisfy the deterministic contract."""


def _exact_dict(value: Any, fields: set[str], location: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise CastAcceptanceError(f"{location}: expected exact fields {sorted(fields)}")
    return value


def _nonempty(value: Any, location: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise CastAcceptanceError(f"{location}: expected a non-empty string")
    return value


def _sha256(value: Any, location: str) -> str:
    text = _nonempty(value, location)
    if SHA256_RE.fullmatch(text) is None:
        raise CastAcceptanceError(f"{location}: expected lowercase SHA-256")
    return text


def _finite(value: Any, location: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise CastAcceptanceError(f"{location}: expected a finite number")
    result = float(value)
    if not math.isfinite(result):
        raise CastAcceptanceError(f"{location}: expected a finite number")
    return result


def _fraction(value: Any, location: str) -> float:
    result = _finite(value, location)
    if result < 0 or result > 1:
        raise CastAcceptanceError(f"{location}: expected a fraction in [0, 1]")
    return result


def _nonnegative_integer(value: Any, location: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise CastAcceptanceError(f"{location}: expected a non-negative integer")
    return value


def repo_relative_path(value: Any, location: str) -> str:
    text = _nonempty(value, location)
    path = PurePosixPath(text)
    if path.is_absolute() or ".." in path.parts or "\\" in text or text != path.as_posix():
        raise CastAcceptanceError(f"{location}: expected a canonical repository-relative POSIX path")
    return text


def validate_engine_policy(policy: Any) -> None:
    if policy != CAST_ENGINE_POLICY:
        raise CastAcceptanceError(
            "cast.enginePolicy: expected the exact operator-authorized deterministic policy"
        )


def _validate_reference_asr(value: Any, location: str) -> dict[str, Any]:
    common = {
        "decision",
        "primaryExpectedWords",
        "primaryOrdinaryWordErrors",
        "primaryOrdinaryWordErrorRate",
        "primaryEvidencePath",
        "primaryEvidenceSha256",
    }
    if not isinstance(value, dict):
        raise CastAcceptanceError(f"{location}: expected an object")
    decision = value.get("decision")
    if decision == PRIMARY_REFERENCE_ASR_DECISION:
        _exact_dict(value, common, location)
    elif decision == INDEPENDENT_REFERENCE_ASR_DECISION:
        _exact_dict(
            value,
            {
                *common,
                "sourceAgreementEvidencePath",
                "sourceAgreementEvidenceSha256",
                "sourceAgreementSha256",
                "adjudicationEvidencePath",
                "adjudicationEvidenceSha256",
                "independentExpectedWords",
                "independentOrdinaryWordErrors",
                "independentOrdinaryWordErrorRate",
                "independentEvidencePath",
                "independentEvidenceSha256",
                "independentModel",
            },
            location,
        )
    else:
        raise CastAcceptanceError(f"{location}.decision: unsupported adjudication")

    expected = _nonnegative_integer(value["primaryExpectedWords"], f"{location}.primaryExpectedWords")
    errors = _nonnegative_integer(
        value["primaryOrdinaryWordErrors"], f"{location}.primaryOrdinaryWordErrors"
    )
    rate = _fraction(value["primaryOrdinaryWordErrorRate"], f"{location}.primaryOrdinaryWordErrorRate")
    if expected == 0 or errors > expected or rate != errors / expected:
        raise CastAcceptanceError(f"{location}: primary ASR counts are inconsistent")
    repo_relative_path(value["primaryEvidencePath"], f"{location}.primaryEvidencePath")
    _sha256(value["primaryEvidenceSha256"], f"{location}.primaryEvidenceSha256")

    if decision == PRIMARY_REFERENCE_ASR_DECISION:
        if errors != 0 or rate != 0:
            raise CastAcceptanceError(f"{location}: primary-zero-error requires an exact primary transcript")
        return value

    if errors == 0:
        raise CastAcceptanceError(
            f"{location}: independent adjudication is allowed only after the primary ASR fails"
        )
    repo_relative_path(
        value["sourceAgreementEvidencePath"], f"{location}.sourceAgreementEvidencePath"
    )
    _sha256(value["sourceAgreementEvidenceSha256"], f"{location}.sourceAgreementEvidenceSha256")
    _sha256(value["sourceAgreementSha256"], f"{location}.sourceAgreementSha256")
    repo_relative_path(
        value["adjudicationEvidencePath"], f"{location}.adjudicationEvidencePath"
    )
    _sha256(value["adjudicationEvidenceSha256"], f"{location}.adjudicationEvidenceSha256")
    independent_expected = _nonnegative_integer(
        value["independentExpectedWords"], f"{location}.independentExpectedWords"
    )
    independent_errors = _nonnegative_integer(
        value["independentOrdinaryWordErrors"], f"{location}.independentOrdinaryWordErrors"
    )
    independent_rate = _fraction(
        value["independentOrdinaryWordErrorRate"], f"{location}.independentOrdinaryWordErrorRate"
    )
    if independent_expected != expected or independent_errors != 0 or independent_rate != 0:
        raise CastAcceptanceError(f"{location}: independent ASR must be a same-length zero-error verification")
    repo_relative_path(value["independentEvidencePath"], f"{location}.independentEvidencePath")
    _sha256(value["independentEvidenceSha256"], f"{location}.independentEvidenceSha256")
    model = _exact_dict(
        value["independentModel"], {"repository", "revision"}, f"{location}.independentModel"
    )
    if model != {
        "repository": INDEPENDENT_ASR_REPOSITORY,
        "revision": INDEPENDENT_ASR_REVISION,
    }:
        raise CastAcceptanceError(f"{location}.independentModel: model pin drifted")
    return value


def _youtube_video_id(source_url: str, location: str) -> str:
    parsed = urlparse(source_url)
    query = parse_qs(parsed.query)
    values = query.get("v", [])
    if (
        parsed.scheme != "https"
        or parsed.hostname != "www.youtube.com"
        or parsed.path != "/watch"
        or len(values) != 1
        or VIDEO_ID_RE.fullmatch(values[0]) is None
    ):
        raise CastAcceptanceError(f"{location}: expected a canonical YouTube watch URL")
    return values[0]


def evaluate_gate_failures(reference: dict[str, Any], audition: dict[str, Any]) -> list[str]:
    gates = CAST_ACCEPTANCE_GATES
    failures: list[str] = []
    interval_duration = reference["videoEndSeconds"] - reference["videoStartSeconds"]
    reference_duration = gates["referenceDuration"]
    if not (
        reference_duration["minimumSeconds"]
        <= reference["localDurationSeconds"]
        <= reference_duration["maximumSeconds"]
        and abs(interval_duration - reference["localDurationSeconds"])
        <= reference_duration["maximumIntervalDeltaSeconds"]
    ):
        failures.append("reference-duration")

    purity = gates["speakerPurity"]
    coverage_total = (
        reference["dominantSpeakerCoverage"]
        + reference["competingSpeakerCoverage"]
        + reference["uncoveredSpeakerCoverage"]
    )
    if not (
        reference["dominantSpeakerCoverage"] >= purity["minimumDominantCoverage"]
        and reference["competingSpeakerCoverage"] <= purity["maximumCompetingCoverage"]
        and reference["uncoveredSpeakerCoverage"] <= purity["maximumUncoveredCoverage"]
        and abs(coverage_total - 1) <= 0.001
    ):
        failures.append("speaker-purity")

    asr = gates["asrFidelity"]
    reference_asr = reference["referenceAsr"]
    reference_asr_pass = reference_asr["decision"] == INDEPENDENT_REFERENCE_ASR_DECISION or (
        reference_asr["primaryOrdinaryWordErrors"] <= asr["maximumReferenceOrdinaryWordErrors"]
        and reference_asr["primaryOrdinaryWordErrorRate"]
        <= asr["maximumReferenceOrdinaryWordErrorRate"]
    )
    if not (
        reference_asr["primaryExpectedWords"] >= asr["minimumReferenceExpectedWords"]
        and reference_asr_pass
        and audition["expectedWords"] >= asr["minimumExpectedWords"]
        and audition["ordinaryWordErrors"] <= asr["maximumOrdinaryWordErrors"]
        and audition["ordinaryWordErrorRate"] <= asr["maximumOrdinaryWordErrorRate"]
    ):
        failures.append("asr-fidelity")

    acoustic = gates["acousticConsistency"]
    if not (
        audition["meanSpeakerCosineSimilarity"] >= acoustic["minimumMeanCosineSimilarity"]
        and audition["minimumWindowSpeakerCosineSimilarity"]
        >= acoustic["minimumWindowCosineSimilarity"]
        and audition["minimumWindowSpeakerCosineSimilarity"]
        <= audition["meanSpeakerCosineSimilarity"]
    ):
        failures.append("acoustic-consistency")

    signal = gates["signalSafety"]
    if not (
        audition["clippedSamples"] <= signal["maximumClippedSamples"]
        and audition["truePeakDbtp"] <= signal["maximumTruePeakDbtp"]
        and 0 < audition["peakAmplitude"] <= signal["maximumPeakAmplitude"]
    ):
        failures.append("signal-safety")

    duration = gates["auditionDuration"]
    words_per_second = audition["expectedWords"] / audition["durationSeconds"]
    if not (
        duration["minimumSeconds"] <= audition["durationSeconds"] <= duration["maximumSeconds"]
        and duration["minimumWordsPerSecond"]
        <= words_per_second
        <= duration["maximumWordsPerSecond"]
    ):
        failures.append("audition-duration")
    return failures


def validate_selected_voice(voice: Any, *, location: str = "voice") -> dict[str, Any]:
    fields = {
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
    voice = _exact_dict(voice, fields, location)
    character_id = _nonempty(voice["characterId"], f"{location}.characterId")
    if CHARACTER_ID_RE.fullmatch(character_id) is None:
        raise CastAcceptanceError(f"{location}.characterId: invalid canonical id")
    _nonempty(voice["displayName"], f"{location}.displayName")
    if voice["status"] != "selected" or voice["engine"] != "dots.tts-soar":
        raise CastAcceptanceError(f"{location}: voice must be selected Dots TTS")
    if voice["mode"] != "continuation-voice-cloning":
        raise CastAcceptanceError(f"{location}.mode: expected continuation-voice-cloning")
    model = _exact_dict(voice["model"], {"repository", "revision"}, f"{location}.model")
    if model != {"repository": DOTS_REPOSITORY, "revision": DOTS_REVISION} or REVISION_RE.fullmatch(
        _nonempty(model["revision"], f"{location}.model.revision")
    ) is None:
        raise CastAcceptanceError(f"{location}.model: invalid Dots model pin")
    seed = _nonnegative_integer(voice["seed"], f"{location}.seed")

    reference_fields = {
        "sourceUrl",
        "sourceRegistryPath",
        "sourceRegistrySha256",
        "sourceDialogue",
        "sourceVideoId",
        "sourceCharacterId",
        "videoStartSeconds",
        "videoEndSeconds",
        "localDurationSeconds",
        "localSha256",
        "promptText",
        "referenceAsr",
        "speakerPurityEvidencePath",
        "speakerPurityEvidenceSha256",
        "speakerPurityProofRecordId",
        "speakerPuritySourceAgreementSha256",
        "speakerPurityMethod",
        "dominantSpeakerCoverage",
        "competingSpeakerCoverage",
        "uncoveredSpeakerCoverage",
    }
    reference = voice["reference"]
    if not isinstance(reference, dict) or (
        set(reference) != reference_fields
        and set(reference) != {*reference_fields, "relativePath"}
    ):
        raise CastAcceptanceError(f"{location}.reference: invalid fields")
    source_url = _nonempty(reference["sourceUrl"], f"{location}.reference.sourceUrl")
    source_video_id = _youtube_video_id(source_url, f"{location}.reference.sourceUrl")
    if source_video_id != reference["sourceVideoId"] or VIDEO_ID_RE.fullmatch(source_video_id) is None:
        raise CastAcceptanceError(f"{location}.reference: source video id mismatch")
    if reference["sourceRegistryPath"] != "audio/reference-sources.json":
        raise CastAcceptanceError(f"{location}.reference.sourceRegistryPath: invalid canonical path")
    _sha256(reference["sourceRegistrySha256"], f"{location}.reference.sourceRegistrySha256")
    for field in ("sourceDialogue", "sourceCharacterId"):
        value = _nonempty(reference[field], f"{location}.reference.{field}")
        if CHARACTER_ID_RE.fullmatch(value) is None:
            raise CastAcceptanceError(f"{location}.reference.{field}: invalid canonical id")
    video_start = _finite(reference["videoStartSeconds"], f"{location}.reference.videoStartSeconds")
    video_end = _finite(reference["videoEndSeconds"], f"{location}.reference.videoEndSeconds")
    local_duration = _finite(reference["localDurationSeconds"], f"{location}.reference.localDurationSeconds")
    if video_start < 0 or video_end <= video_start or local_duration <= 0:
        raise CastAcceptanceError(f"{location}.reference: invalid interval or duration")
    _sha256(reference["localSha256"], f"{location}.reference.localSha256")
    _nonempty(reference["promptText"], f"{location}.reference.promptText")
    if "relativePath" in reference:
        repo_relative_path(reference["relativePath"], f"{location}.reference.relativePath")
    _validate_reference_asr(reference["referenceAsr"], f"{location}.reference.referenceAsr")
    repo_relative_path(
        reference["speakerPurityEvidencePath"], f"{location}.reference.speakerPurityEvidencePath"
    )
    _sha256(
        reference["speakerPurityEvidenceSha256"],
        f"{location}.reference.speakerPurityEvidenceSha256",
    )
    proof_record_id = _nonempty(
        reference["speakerPurityProofRecordId"],
        f"{location}.reference.speakerPurityProofRecordId",
    )
    if CHARACTER_ID_RE.fullmatch(proof_record_id) is None:
        raise CastAcceptanceError(
            f"{location}.reference.speakerPurityProofRecordId: invalid proof record id"
        )
    source_agreement_sha256 = _sha256(
        reference["speakerPuritySourceAgreementSha256"],
        f"{location}.reference.speakerPuritySourceAgreementSha256",
    )
    if (
        reference["referenceAsr"]["decision"]
        == INDEPENDENT_REFERENCE_ASR_DECISION
        and reference["referenceAsr"]["sourceAgreementSha256"]
        != source_agreement_sha256
    ):
        raise CastAcceptanceError(
            f"{location}.reference: ASR and speaker-purity source agreement differ"
        )
    if reference["speakerPurityMethod"] not in {
        "jowett-caption-turn-alignment-v1",
        "campp-exclusive-overlap-v1",
    }:
        raise CastAcceptanceError(f"{location}.reference.speakerPurityMethod: unsupported proof method")
    for field in (
        "dominantSpeakerCoverage",
        "competingSpeakerCoverage",
        "uncoveredSpeakerCoverage",
    ):
        reference[field] = _fraction(reference[field], f"{location}.reference.{field}")

    generation = _exact_dict(
        voice["generation"],
        {"numSteps", "guidanceScale", "speakerScale", "language", "precision"},
        f"{location}.generation",
    )
    if _nonnegative_integer(generation["numSteps"], f"{location}.generation.numSteps") == 0:
        raise CastAcceptanceError(f"{location}.generation.numSteps: expected positive")
    if _finite(generation["guidanceScale"], f"{location}.generation.guidanceScale") <= 0:
        raise CastAcceptanceError(f"{location}.generation.guidanceScale: expected positive")
    if _finite(generation["speakerScale"], f"{location}.generation.speakerScale") <= 0:
        raise CastAcceptanceError(f"{location}.generation.speakerScale: expected positive")
    if generation["language"] != "EN" or generation["precision"] != "bfloat16":
        raise CastAcceptanceError(f"{location}.generation: expected EN bfloat16")

    audition = _exact_dict(
        voice["audition"],
        {
            "relativePath",
            "sha256",
            "durationSeconds",
            "expectedWords",
            "ordinaryWordErrors",
            "ordinaryWordErrorRate",
            "asrEvidencePath",
            "asrEvidenceSha256",
            "meanSpeakerCosineSimilarity",
            "minimumWindowSpeakerCosineSimilarity",
            "acousticEvidencePath",
            "acousticEvidenceSha256",
            "clippedSamples",
            "truePeakDbtp",
            "peakAmplitude",
        },
        f"{location}.audition",
    )
    repo_relative_path(audition["relativePath"], f"{location}.audition.relativePath")
    _sha256(audition["sha256"], f"{location}.audition.sha256")
    audition["durationSeconds"] = _finite(
        audition["durationSeconds"], f"{location}.audition.durationSeconds"
    )
    audition["expectedWords"] = _nonnegative_integer(
        audition["expectedWords"], f"{location}.audition.expectedWords"
    )
    audition["ordinaryWordErrors"] = _nonnegative_integer(
        audition["ordinaryWordErrors"], f"{location}.audition.ordinaryWordErrors"
    )
    audition["ordinaryWordErrorRate"] = _fraction(
        audition["ordinaryWordErrorRate"], f"{location}.audition.ordinaryWordErrorRate"
    )
    if (
        audition["expectedWords"] == 0
        or audition["ordinaryWordErrors"] > audition["expectedWords"]
        or audition["ordinaryWordErrorRate"]
        != audition["ordinaryWordErrors"] / audition["expectedWords"]
    ):
        raise CastAcceptanceError(f"{location}.audition: ASR counts are inconsistent")
    for field in ("asrEvidencePath", "acousticEvidencePath"):
        repo_relative_path(audition[field], f"{location}.audition.{field}")
    for field in ("asrEvidenceSha256", "acousticEvidenceSha256"):
        _sha256(audition[field], f"{location}.audition.{field}")
    audition["meanSpeakerCosineSimilarity"] = _finite(
        audition["meanSpeakerCosineSimilarity"],
        f"{location}.audition.meanSpeakerCosineSimilarity",
    )
    audition["minimumWindowSpeakerCosineSimilarity"] = _finite(
        audition["minimumWindowSpeakerCosineSimilarity"],
        f"{location}.audition.minimumWindowSpeakerCosineSimilarity",
    )
    if not (
        -1 <= audition["meanSpeakerCosineSimilarity"] <= 1
        and -1 <= audition["minimumWindowSpeakerCosineSimilarity"] <= 1
    ):
        raise CastAcceptanceError(f"{location}.audition: acoustic cosine is out of range")
    audition["clippedSamples"] = _nonnegative_integer(
        audition["clippedSamples"], f"{location}.audition.clippedSamples"
    )
    audition["truePeakDbtp"] = _finite(
        audition["truePeakDbtp"], f"{location}.audition.truePeakDbtp"
    )
    audition["peakAmplitude"] = _fraction(
        audition["peakAmplitude"], f"{location}.audition.peakAmplitude"
    )

    selection = _exact_dict(
        voice["selection"],
        {
            "basis",
            "policy",
            "acceptedAt",
            "label",
            "allGatesPassed",
            "candidateSelection",
            "evaluatedCandidateCount",
            "passingCandidateCount",
            "selectedRank",
            "decisionPath",
            "decisionSha256",
            "sourceAssignment",
        },
        f"{location}.selection",
    )
    if (
        selection["basis"] != "operator-authorized-deterministic-gates"
        or selection["policy"] != SELECTION_POLICY
        or selection["allGatesPassed"] is not True
        or DATE_RE.fullmatch(_nonempty(selection["acceptedAt"], f"{location}.selection.acceptedAt"))
        is None
    ):
        raise CastAcceptanceError(f"{location}.selection: invalid deterministic acceptance")
    _nonempty(selection["label"], f"{location}.selection.label")
    if selection["candidateSelection"] not in {
        "highest-ranked-passing",
        "operator-pinned",
    }:
        raise CastAcceptanceError(f"{location}.selection.candidateSelection: invalid")
    evaluated_count = _nonnegative_integer(
        selection["evaluatedCandidateCount"],
        f"{location}.selection.evaluatedCandidateCount",
    )
    passing_count = _nonnegative_integer(
        selection["passingCandidateCount"],
        f"{location}.selection.passingCandidateCount",
    )
    selected_rank = _nonnegative_integer(
        selection["selectedRank"], f"{location}.selection.selectedRank"
    )
    if (
        evaluated_count == 0
        or passing_count == 0
        or passing_count > evaluated_count
        or selected_rank == 0
        or selected_rank > passing_count
        or (
            selection["candidateSelection"] == "highest-ranked-passing"
            and selected_rank != 1
        )
    ):
        raise CastAcceptanceError(f"{location}.selection: candidate ranking is inconsistent")
    repo_relative_path(selection["decisionPath"], f"{location}.selection.decisionPath")
    _sha256(selection["decisionSha256"], f"{location}.selection.decisionSha256")
    assignment = _exact_dict(
        selection["sourceAssignment"],
        {"kind", "authorizedBy", "reason"},
        f"{location}.selection.sourceAssignment",
    )
    if assignment["authorizedBy"] != "operator":
        raise CastAcceptanceError(f"{location}.selection.sourceAssignment: operator authorization required")
    _nonempty(assignment["reason"], f"{location}.selection.sourceAssignment.reason")
    same_character = reference["sourceCharacterId"] == character_id
    if (assignment["kind"] == "same-character") != same_character:
        raise CastAcceptanceError(f"{location}.selection.sourceAssignment: source identity mismatch")
    if assignment["kind"] not in {"same-character", "voice-source-reassignment"}:
        raise CastAcceptanceError(f"{location}.selection.sourceAssignment.kind: invalid")

    failures = evaluate_gate_failures(reference, audition)
    if failures:
        raise CastAcceptanceError(
            f"{location}: deterministic cast acceptance failed: {', '.join(failures)}"
        )
    return voice


def validate_cast_registry(cast: Any) -> dict[str, dict[str, Any]]:
    cast = _exact_dict(cast, {"schemaVersion", "status", "updatedAt", "enginePolicy", "voices"}, "cast")
    if cast["schemaVersion"] != CAST_SCHEMA_VERSION:
        raise CastAcceptanceError(f"cast.schemaVersion: expected {CAST_SCHEMA_VERSION}")
    if cast["status"] not in {"partial", "complete"}:
        raise CastAcceptanceError("cast.status: expected partial or complete")
    if DATE_RE.fullmatch(_nonempty(cast["updatedAt"], "cast.updatedAt")) is None:
        raise CastAcceptanceError("cast.updatedAt: expected YYYY-MM-DD")
    validate_engine_policy(cast["enginePolicy"])
    if not isinstance(cast["voices"], list):
        raise CastAcceptanceError("cast.voices: expected an array")
    result: dict[str, dict[str, Any]] = {}
    for index, raw_voice in enumerate(cast["voices"]):
        voice = validate_selected_voice(raw_voice, location=f"cast.voices[{index}]")
        character_id = voice["characterId"]
        if character_id in result:
            raise CastAcceptanceError(f"cast.voices[{index}]: duplicate {character_id}")
        result[character_id] = voice
    return result


def validate_cast_decision_artifacts(cast: Any, repo_root: Path) -> None:
    """Verify committed decision bytes and their semantic binding to the cast."""

    voices = validate_cast_registry(cast)
    root = repo_root.resolve()
    required = {
        "schemaVersion",
        "status",
        "policy",
        "acceptedAt",
        "characterId",
        "sourceCharacterId",
        "candidateSelection",
        "rankingPolicy",
        "inputs",
        "reference",
        "gates",
        "candidates",
        "selectedSeed",
        "selectedPassingRank",
        "decisionContentSha256",
    }
    for character_id, voice in voices.items():
        relative = repo_relative_path(
            voice["selection"]["decisionPath"],
            f"cast voice {character_id}.selection.decisionPath",
        )
        path = (root / relative).resolve()
        try:
            path.relative_to(root)
        except ValueError as error:
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision path escapes repository"
            ) from error
        if not path.is_file():
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision artifact is missing"
            )
        payload = path.read_bytes()
        if hashlib.sha256(payload).hexdigest() != voice["selection"]["decisionSha256"]:
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision artifact hash differs"
            )
        try:
            decision = json.loads(payload)
        except json.JSONDecodeError as error:
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision artifact is invalid JSON"
            ) from error
        if not isinstance(decision, dict) or set(decision) != required:
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision artifact has unsupported fields"
            )
        frozen = {
            key: value
            for key, value in decision.items()
            if key != "decisionContentSha256"
        }
        content_sha = hashlib.sha256(
            json.dumps(
                frozen,
                ensure_ascii=False,
                sort_keys=True,
                separators=(",", ":"),
            ).encode("utf-8")
        ).hexdigest()
        if (
            decision.get("schemaVersion") != 1
            or decision.get("status") != "accepted-deterministic-cast-decision"
            or decision.get("policy") != SELECTION_POLICY
            or decision.get("decisionContentSha256") != content_sha
            or decision.get("characterId") != character_id
            or decision.get("sourceCharacterId")
            != voice["reference"]["sourceCharacterId"]
            or decision.get("acceptedAt") != voice["selection"]["acceptedAt"]
            or decision.get("candidateSelection")
            != voice["selection"]["candidateSelection"]
            or decision.get("reference") != voice["reference"]
            or decision.get("selectedSeed") != voice["seed"]
            or decision.get("selectedPassingRank")
            != voice["selection"]["selectedRank"]
            or decision.get("gates") != CAST_ACCEPTANCE_GATES
        ):
            raise CastAcceptanceError(
                f"cast voice {character_id}: decision artifact is stale or inconsistent"
            )
