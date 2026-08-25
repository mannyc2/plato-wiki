#!/usr/bin/env python3
"""Derive exact targeted clips from already-proved Jowett source turns.

The phrase queue cannot assert speaker identity. Every queued phrase must be a
unique contiguous subspan of one existing automatically eligible source-turn
proof, and its exact caption span must remain inside that proof's caption
interval. The output keeps the existing Jowett candidate contract so it can be
consumed by the cast promoter without writing ``audio/cast.json``.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

from align_jowett_voice_references import (
    AMBIGUITY_MARGIN,
    MAX_PROMPT_CHARACTERS,
    MAX_PROMPT_WORDS,
    MAX_REFERENCE_SECONDS,
    MIN_ALIGNMENT_CONFIDENCE,
    MIN_QUERY_WORDS,
    MIN_REFERENCE_SECONDS,
    REPO_ROOT,
    SAFE_ID,
    VideoSource,
    _piece_expanded_prompt,
    canonical_json,
    load_reference_videos,
    sha256_bytes,
    sha256_file,
    write_report,
)
from find_youtube_reference import (
    ReferenceSearchError,
    align_caption_phrase,
    normalize_words,
    parse_json3_caption,
)


SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_ARTIFACT_ROOT = REPO_ROOT / "scratch"
DEFAULT_OUTPUT = (
    REPO_ROOT
    / "scratch"
    / "audio-targeted-reference-phrases"
    / "report.json"
)
SHA256 = re.compile(r"[0-9a-f]{64}")
REQUIRED_SOURCE_INPUTS = ("registry", "characters", "referenceSources", "script")
QUEUE_FIELDS = {
    "characterId",
    "dialogue",
    "videoId",
    "phrase",
    "sourceProofPath",
    "sourceProofRecordId",
}
TARGET_POLICY = "unique-subspan-of-existing-source-turn-proof-v1"


class TargetedPhraseError(ValueError):
    """Raised when a targeted phrase cannot inherit a fail-closed source proof."""


@dataclass(frozen=True)
class PhraseRequest:
    character_id: str
    dialogue: str
    video_id: str
    phrase: str
    source_proof_path: Path
    source_proof_record_id: str


@dataclass(frozen=True)
class SourceProof:
    path: Path
    relative_path: str
    file_sha256: str
    report_sha256: str
    report: dict[str, Any]
    record: dict[str, Any]
    live_inputs: dict[str, tuple[Path, str, str]]
    phrase_offset: int


def _read_json(path: Path, *, label: str) -> tuple[dict[str, Any], str]:
    if path.is_symlink() or not path.is_file():
        raise TargetedPhraseError(f"{label} is missing or not a regular file: {path}")
    try:
        raw = path.read_bytes()
        payload = json.loads(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise TargetedPhraseError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(payload, dict):
        raise TargetedPhraseError(f"{label} {path} must be an object")
    return payload, sha256_bytes(raw)


def _repo_file(path: Path, *, label: str) -> tuple[Path, str]:
    candidate = path if path.is_absolute() else REPO_ROOT / path
    if candidate.is_symlink() or not candidate.is_file():
        raise TargetedPhraseError(f"{label} is missing or not a regular file: {candidate}")
    try:
        resolved = candidate.resolve(strict=True)
        relative = resolved.relative_to(REPO_ROOT.resolve()).as_posix()
    except (FileNotFoundError, ValueError) as error:
        raise TargetedPhraseError(
            f"{label} must be a present repository file: {candidate}"
        ) from error
    return resolved, relative


def _contiguous_positions(
    haystack: Sequence[str], needle: Sequence[str]
) -> tuple[int, ...]:
    if not needle or len(needle) > len(haystack):
        return ()
    return tuple(
        start
        for start in range(len(haystack) - len(needle) + 1)
        if tuple(haystack[start : start + len(needle)]) == tuple(needle)
    )


def load_phrase_queue(path: Path) -> tuple[tuple[PhraseRequest, ...], str]:
    payload, digest = _read_json(path, label="targeted phrase queue")
    if (
        payload.get("schemaVersion") != 1
        or set(payload) != {"schemaVersion", "phrases"}
        or not isinstance(payload.get("phrases"), list)
        or not payload["phrases"]
    ):
        raise TargetedPhraseError(f"unsupported targeted phrase queue {path}")
    requests: list[PhraseRequest] = []
    seen: set[tuple[str, str, str, tuple[str, ...], str, str]] = set()
    for index, row in enumerate(payload["phrases"]):
        if not isinstance(row, dict) or set(row) != QUEUE_FIELDS:
            raise TargetedPhraseError(f"phrase queue entry {index} is malformed")
        character_id = row.get("characterId")
        dialogue = row.get("dialogue")
        video_id = row.get("videoId")
        phrase = row.get("phrase")
        proof_path = row.get("sourceProofPath")
        proof_record_id = row.get("sourceProofRecordId")
        phrase_tokens = normalize_words(phrase) if isinstance(phrase, str) else ()
        if (
            not isinstance(character_id, str)
            or SAFE_ID.fullmatch(character_id) is None
            or not isinstance(dialogue, str)
            or SAFE_ID.fullmatch(dialogue) is None
            or not isinstance(video_id, str)
            or not video_id
            or not isinstance(phrase, str)
            or not MIN_QUERY_WORDS <= len(phrase_tokens) <= MAX_PROMPT_WORDS
            or len(" ".join(phrase.split())) > MAX_PROMPT_CHARACTERS
            or not isinstance(proof_path, str)
            or not proof_path
            or not isinstance(proof_record_id, str)
            or not proof_record_id
        ):
            raise TargetedPhraseError(f"phrase queue entry {index} is incomplete")
        normalized_phrase = " ".join(phrase.split())
        key = (
            character_id,
            dialogue,
            video_id,
            phrase_tokens,
            proof_path,
            proof_record_id,
        )
        if key in seen:
            raise TargetedPhraseError(f"phrase queue entry {index} is duplicated")
        seen.add(key)
        requests.append(
            PhraseRequest(
                character_id=character_id,
                dialogue=dialogue,
                video_id=video_id,
                phrase=normalized_phrase,
                source_proof_path=Path(proof_path),
                source_proof_record_id=proof_record_id,
            )
        )
    return (
        tuple(
            sorted(
                requests,
                key=lambda request: (
                    request.dialogue,
                    request.character_id,
                    request.video_id,
                    normalize_words(request.phrase),
                    request.source_proof_record_id,
                ),
            )
        ),
        digest,
    )


def _validated_live_inputs(
    report: dict[str, Any], *, source_proof_path: Path
) -> dict[str, tuple[Path, str, str]]:
    inputs = report.get("inputs")
    if not isinstance(inputs, dict):
        raise TargetedPhraseError(f"source proof has no bound inputs: {source_proof_path}")
    result: dict[str, tuple[Path, str, str]] = {}
    for name in REQUIRED_SOURCE_INPUTS:
        record = inputs.get(name)
        if (
            not isinstance(record, dict)
            or not isinstance(record.get("path"), str)
            or not isinstance(record.get("sha256"), str)
            or SHA256.fullmatch(record["sha256"]) is None
        ):
            raise TargetedPhraseError(
                f"source proof has malformed {name} input: {source_proof_path}"
            )
        live_path, live_relative = _repo_file(
            Path(record["path"]), label=f"source proof {name} input"
        )
        live_sha256 = sha256_file(live_path)
        if live_sha256 != record["sha256"]:
            raise TargetedPhraseError(
                f"source proof is stale against its {name} input: {source_proof_path}"
            )
        result[name] = (live_path, live_relative, live_sha256)
    return result


def _source_record(
    request: PhraseRequest,
    *,
    cache: dict[str, tuple[dict[str, Any], str, Path, str]],
) -> SourceProof:
    source_path, source_relative = _repo_file(
        request.source_proof_path, label="source-turn proof"
    )
    if source_relative not in cache:
        report, file_sha256 = _read_json(source_path, label="source-turn proof")
        if (
            report.get("schemaVersion") != 1
            or report.get("artifactKind")
            != "jowett-caption-character-reference-alignment"
            or report.get("status")
            != "reference-intervals-emitted-no-cast-writes"
        ):
            raise TargetedPhraseError(f"unsupported source-turn proof {source_path}")
        unsigned = {key: value for key, value in report.items() if key != "reportSha256"}
        report_sha256 = report.get("reportSha256")
        if (
            not isinstance(report_sha256, str)
            or SHA256.fullmatch(report_sha256) is None
            or sha256_bytes(canonical_json(unsigned)) != report_sha256
        ):
            raise TargetedPhraseError(
                f"source-turn proof hash is inconsistent: {source_path}"
            )
        cache[source_relative] = (
            report,
            file_sha256,
            source_path,
            report_sha256,
        )
    report, file_sha256, source_path, report_sha256 = cache[source_relative]
    live_inputs = _validated_live_inputs(report, source_proof_path=source_path)
    matches = [
        candidate
        for candidate in report.get("candidates", [])
        if isinstance(candidate, dict)
        and candidate.get("candidateId") == request.source_proof_record_id
    ]
    if len(matches) != 1:
        raise TargetedPhraseError(
            f"source proof record is absent or duplicated: "
            f"{request.source_proof_record_id}"
        )
    record = matches[0]
    alignment = record.get("alignment")
    source_turn = record.get("sourceTurn")
    safety = record.get("safety")
    provenance = record.get("provenance")
    if (
        record.get("status") != "automatically-eligible-reference-interval"
        or record.get("dialogue") != request.dialogue
        or record.get("characterId") != request.character_id
        or record.get("videoId") != request.video_id
        or not isinstance(alignment, dict)
        or not isinstance(source_turn, dict)
        or source_turn.get("containsQuotedSpeech") is not False
        or not isinstance(safety, dict)
        or safety.get("singleCharacterUnderEditionRule") is not True
        or safety.get("reportedSpeechExcluded") is not True
        or safety.get("operatorListeningRequired") is not False
        or safety.get("castWritePerformed") is not False
        or not isinstance(provenance, dict)
    ):
        raise TargetedPhraseError(
            f"source proof record is not one safe source-character turn: "
            f"{request.source_proof_record_id}"
        )
    for name, (path_field, sha_field) in {
        "registry": ("registryPath", "registrySha256"),
        "characters": ("charactersPath", "charactersSha256"),
        "referenceSources": ("referenceSourcesPath", "referenceSourcesSha256"),
        "script": ("scriptPath", "scriptSha256"),
    }.items():
        _, relative, digest = live_inputs[name]
        if provenance.get(path_field) != relative or provenance.get(sha_field) != digest:
            raise TargetedPhraseError(
                f"source proof record provenance differs from its {name} input"
            )
    source_agreement_sha256 = record.get("sourceAgreementSha256")
    if (
        not isinstance(source_agreement_sha256, str)
        or SHA256.fullmatch(source_agreement_sha256) is None
    ):
        raise TargetedPhraseError("source proof record has no source-agreement digest")
    base_prompt = alignment.get("expectedPrompt")
    if not isinstance(base_prompt, str):
        raise TargetedPhraseError("source proof record has no expected prompt")
    phrase_tokens = normalize_words(request.phrase)
    positions = _contiguous_positions(normalize_words(base_prompt), phrase_tokens)
    if len(positions) != 1:
        raise TargetedPhraseError(
            f"targeted phrase must occur exactly once in its source proof turn: "
            f"{request.source_proof_record_id}"
        )
    return SourceProof(
        path=source_path,
        relative_path=source_relative,
        file_sha256=file_sha256,
        report_sha256=report_sha256,
        report=report,
        record=record,
        live_inputs=live_inputs,
        phrase_offset=positions[0],
    )


def _common_output_inputs(
    proofs: Sequence[SourceProof],
    *,
    queue_path: Path,
    queue_sha256: str,
) -> dict[str, Any]:
    if not proofs:
        raise TargetedPhraseError("targeted phrase selection is empty")
    common: dict[str, tuple[Path, str, str]] = {}
    for name in ("registry", "characters", "referenceSources"):
        identities = {
            (proof.live_inputs[name][1], proof.live_inputs[name][2])
            for proof in proofs
        }
        if len(identities) != 1:
            raise TargetedPhraseError(
                f"targeted source proofs do not share one {name} input"
            )
        relative, digest = next(iter(identities))
        path = next(
            proof.live_inputs[name][0]
            for proof in proofs
            if proof.live_inputs[name][1:] == (relative, digest)
        )
        common[name] = (path, relative, digest)
    queue_live_path, queue_relative = _repo_file(
        queue_path, label="targeted phrase queue"
    )
    if sha256_file(queue_live_path) != queue_sha256:
        raise TargetedPhraseError("targeted phrase queue changed while it was read")
    return {
        "registry": {"path": common["registry"][1], "sha256": common["registry"][2]},
        "characters": {
            "path": common["characters"][1],
            "sha256": common["characters"][2],
        },
        "referenceSources": {
            "path": common["referenceSources"][1],
            "sha256": common["referenceSources"][2],
        },
        "phraseQueue": {"path": queue_relative, "sha256": queue_sha256},
        "sourceProofs": [
            {
                "path": proof.relative_path,
                "sha256": proof.file_sha256,
                "reportSha256": proof.report_sha256,
            }
            for proof in sorted(
                {proof.relative_path: proof for proof in proofs}.values(),
                key=lambda proof: proof.relative_path,
            )
        ],
        "script": {
            "path": SCRIPT_PATH.relative_to(REPO_ROOT).as_posix(),
            "sha256": sha256_file(SCRIPT_PATH),
        },
    }


def _video(
    videos_by_dialogue: dict[str, tuple[VideoSource, ...]],
    *,
    dialogue: str,
    video_id: str,
) -> VideoSource:
    matches = [
        video
        for video in videos_by_dialogue.get(dialogue, ())
        if video.video_id == video_id
    ]
    if len(matches) != 1:
        raise TargetedPhraseError(
            f"targeted phrase names no unique pinned video: {dialogue}/{video_id}"
        )
    return matches[0]


def _target_candidate(
    request: PhraseRequest,
    proof: SourceProof,
    *,
    inputs: dict[str, Any],
    videos_by_dialogue: dict[str, tuple[VideoSource, ...]],
) -> dict[str, Any]:
    base = proof.record
    base_alignment = base["alignment"]
    base_span = base_alignment.get("captionTokenSpan")
    if (
        not isinstance(base_span, dict)
        or not isinstance(base_span.get("start"), int)
        or not isinstance(base_span.get("endExclusive"), int)
        or not base_span["start"] < base_span["endExclusive"]
    ):
        raise TargetedPhraseError("source proof has a malformed caption interval")
    provenance = base["provenance"]
    caption_path_value = provenance.get("captionPath")
    caption_sha256 = provenance.get("captionSha256")
    if (
        not isinstance(caption_path_value, str)
        or not isinstance(caption_sha256, str)
        or SHA256.fullmatch(caption_sha256) is None
    ):
        raise TargetedPhraseError("source proof has malformed caption provenance")
    caption_path, caption_relative = _repo_file(
        Path(caption_path_value), label="source proof caption"
    )
    if sha256_file(caption_path) != caption_sha256:
        raise TargetedPhraseError("source proof is stale against its caption input")
    try:
        document = parse_json3_caption(caption_path)
        result = align_caption_phrase(
            document,
            request.phrase,
            min_confidence=MIN_ALIGNMENT_CONFIDENCE,
            ambiguity_margin=AMBIGUITY_MARGIN,
            exact_only=True,
        )
    except ReferenceSearchError as error:
        raise TargetedPhraseError(
            f"targeted phrase has no unique exact caption span: {error}"
        ) from error
    match = result.match
    if match.confidence != 1.0 or match.exact_token_ratio != 1.0:
        raise TargetedPhraseError("targeted phrase caption match is not exact")
    expanded_start, expanded_end, caption_prompt = _piece_expanded_prompt(
        document, match.start_token, match.end_token_exclusive
    )
    phrase_tokens = normalize_words(request.phrase)
    if normalize_words(caption_prompt) != phrase_tokens:
        raise TargetedPhraseError(
            "complete caption pieces do not equal the targeted phrase"
        )
    if not (
        base_span["start"] <= expanded_start < expanded_end <= base_span["endExclusive"]
    ):
        raise TargetedPhraseError(
            "targeted caption span escapes its source proof caption interval"
        )
    video = _video(
        videos_by_dialogue,
        dialogue=request.dialogue,
        video_id=request.video_id,
    )
    first = document.tokens[expanded_start]
    last = document.tokens[expanded_end - 1]
    start_seconds = round(first.start_ms / 1000 + 1e-10, 3)
    end_seconds = round(last.end_ms / 1000 + 1e-10, 3)
    duration_seconds = round(end_seconds - start_seconds + 1e-10, 3)
    if (
        start_seconds < 0
        or end_seconds > video.duration_seconds
        or not MIN_REFERENCE_SECONDS <= duration_seconds <= MAX_REFERENCE_SECONDS
    ):
        raise TargetedPhraseError("targeted phrase duration is outside the clip gate")
    if (
        start_seconds < float(base_alignment.get("startSeconds", -1)) - 0.02
        or end_seconds > float(base_alignment.get("endSeconds", -1)) + 0.02
    ):
        raise TargetedPhraseError(
            "targeted caption timing escapes its source proof interval"
        )
    phrase_sha256 = sha256_bytes(" ".join(phrase_tokens).encode("utf-8"))
    prompt_sha256 = sha256_bytes(caption_prompt.encode("utf-8"))
    identity = {
        "policy": TARGET_POLICY,
        "dialogue": request.dialogue,
        "characterId": request.character_id,
        "videoId": request.video_id,
        "sourceProofFileSha256": proof.file_sha256,
        "sourceProofReportSha256": proof.report_sha256,
        "sourceProofRecordId": request.source_proof_record_id,
        "sourceAgreementSha256": base["sourceAgreementSha256"],
        "phraseQueueSha256": inputs["phraseQueue"]["sha256"],
        "phraseSha256": phrase_sha256,
        "captionSha256": caption_sha256,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "promptSha256": prompt_sha256,
    }
    candidate_id = "jowett-targeted-" + sha256_bytes(canonical_json(identity))[:24]
    output_input_hashes = {
        "registrySha256": inputs["registry"]["sha256"],
        "charactersSha256": inputs["characters"]["sha256"],
        "referenceSourcesSha256": inputs["referenceSources"]["sha256"],
        "phraseQueueSha256": inputs["phraseQueue"]["sha256"],
        "sourceProofFileSha256": proof.file_sha256,
        "sourceProofReportSha256": proof.report_sha256,
        "sourceProofSourceAgreementSha256": base["sourceAgreementSha256"],
        "scriptSha256": inputs["script"]["sha256"],
    }
    source_agreement_identity = {
        **identity,
        "candidateId": candidate_id,
        "inputHashes": output_input_hashes,
    }
    source_turn = copy.deepcopy(base["sourceTurn"])
    base_window_start = source_turn.get("windowStartWord")
    if isinstance(base_window_start, int):
        source_turn["windowStartWord"] = base_window_start + proof.phrase_offset
    source_turn.update(
        {
            "windowWordCount": len(phrase_tokens),
            "windowSha256": phrase_sha256,
            "baseProofRecordId": request.source_proof_record_id,
            "targetedPhraseOffsetWords": proof.phrase_offset,
            "targetedPhraseWordCount": len(phrase_tokens),
            "targetedPhraseSha256": phrase_sha256,
        }
    )
    return {
        "candidateId": candidate_id,
        "status": "automatically-eligible-reference-interval",
        "dialogue": request.dialogue,
        "characterId": request.character_id,
        "videoId": request.video_id,
        "sourceTurn": source_turn,
        "alignment": {
            "expectedPrompt": caption_prompt,
            "expectedPromptSha256": prompt_sha256,
            "expectedPromptWordCount": len(phrase_tokens),
            "startSeconds": start_seconds,
            "endSeconds": end_seconds,
            "durationSeconds": duration_seconds,
            "captionTokenSpan": {
                "start": expanded_start,
                "endExclusive": expanded_end,
            },
            "confidence": 1.0,
            "exactTokenRatio": 1.0,
            "nearestDistinctAlternativeConfidence": (
                None
                if result.nearest_distinct_alternative is None
                else round(result.nearest_distinct_alternative.confidence, 6)
            ),
        },
        "sourceAgreementSha256": sha256_bytes(
            canonical_json(source_agreement_identity)
        ),
        "provenance": {
            "registryPath": inputs["registry"]["path"],
            "registrySha256": inputs["registry"]["sha256"],
            "charactersPath": inputs["characters"]["path"],
            "charactersSha256": inputs["characters"]["sha256"],
            "referenceSourcesPath": inputs["referenceSources"]["path"],
            "referenceSourcesSha256": inputs["referenceSources"]["sha256"],
            "transcriptPath": provenance.get("transcriptPath"),
            "transcriptProvider": provenance.get("transcriptProvider"),
            "transcriptFormat": provenance.get("transcriptFormat"),
            "transcriptUrl": provenance.get("transcriptUrl"),
            "transcriptTranslator": provenance.get("transcriptTranslator"),
            "translationException": provenance.get("translationException"),
            "transcriptSha256": provenance.get("transcriptSha256"),
            "captionPath": caption_relative,
            "captionSha256": caption_sha256,
            "scriptPath": inputs["script"]["path"],
            "scriptSha256": inputs["script"]["sha256"],
            "phraseQueuePath": inputs["phraseQueue"]["path"],
            "phraseQueueSha256": inputs["phraseQueue"]["sha256"],
            "sourceProofPath": proof.relative_path,
            "sourceProofFileSha256": proof.file_sha256,
            "sourceProofReportSha256": proof.report_sha256,
            "sourceProofRecordId": request.source_proof_record_id,
            "sourceProofSourceAgreementSha256": base["sourceAgreementSha256"],
            "sourceProofScriptPath": proof.live_inputs["script"][1],
            "sourceProofScriptSha256": proof.live_inputs["script"][2],
            "inputBindingSha256": sha256_bytes(
                canonical_json(output_input_hashes)
            ),
        },
        "safety": {
            "singleCharacterUnderEditionRule": True,
            "singleCharacterBasis": TARGET_POLICY,
            "reportedSpeechExcluded": True,
            "captionPaddingSeconds": 0,
            "operatorListeningRequired": False,
            "acousticSpeakerPurityVerified": False,
            "castWritePerformed": False,
        },
    }


def build_targeted_report(
    *,
    phrase_queue_path: Path,
    dialogues: Sequence[str] | None = None,
) -> dict[str, Any]:
    requests, queue_sha256 = load_phrase_queue(phrase_queue_path)
    selected = tuple(sorted(set(dialogues))) if dialogues else tuple(
        sorted({request.dialogue for request in requests})
    )
    unknown = set(selected) - {request.dialogue for request in requests}
    if unknown:
        raise TargetedPhraseError(
            f"targeted dialogue selection has no queued phrases: {sorted(unknown)}"
        )
    filtered = tuple(
        request for request in requests if request.dialogue in set(selected)
    )
    proof_cache: dict[str, tuple[dict[str, Any], str, Path, str]] = {}
    proofs = [
        _source_record(request, cache=proof_cache) for request in filtered
    ]
    inputs = _common_output_inputs(
        proofs, queue_path=phrase_queue_path, queue_sha256=queue_sha256
    )
    videos_by_dialogue, live_reference_sha256 = load_reference_videos(
        Path(inputs["referenceSources"]["path"])
    )
    if live_reference_sha256 != inputs["referenceSources"]["sha256"]:
        raise TargetedPhraseError(
            "reference source registry changed while targeted phrases were built"
        )
    candidates = [
        _target_candidate(
            request,
            proof,
            inputs=inputs,
            videos_by_dialogue=videos_by_dialogue,
        )
        for request, proof in zip(filtered, proofs, strict=True)
    ]
    identities = {
        (
            candidate["dialogue"],
            candidate["characterId"],
            candidate["videoId"],
            candidate["alignment"]["startSeconds"],
            candidate["alignment"]["endSeconds"],
        )
        for candidate in candidates
    }
    if len(identities) != len(candidates):
        raise TargetedPhraseError("targeted phrase queue produced duplicate intervals")
    report: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "jowett-caption-character-reference-alignment",
        "status": "reference-intervals-emitted-no-cast-writes",
        "policy": {
            "candidateContract": "jowett-caption-cast-candidate-v1",
            "derivation": TARGET_POLICY,
            "sourceTurnRequirement": (
                "one-live-self-hashed-automatically-eligible-source-turn-proof"
            ),
            "captionMatch": "unique-exact-normalized-token-sequence",
            "intervalContainment": "inside-source-proof-caption-interval",
            "manualListeningRequired": False,
            "automaticCastWrites": False,
        },
        "inputs": inputs,
        "selection": {"dialogues": list(selected)},
        "summary": {
            "queuedPhraseCount": len(requests),
            "selectedPhraseCount": len(filtered),
            "selectedDialogueCount": len(selected),
            "candidateCount": len(candidates),
            "candidateCharacterCount": len(
                {candidate["characterId"] for candidate in candidates}
            ),
        },
        "missingInputs": [],
        "referenceAnchorAudits": [],
        "candidates": candidates,
    }
    report["reportSha256"] = sha256_bytes(canonical_json(report))
    return report


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--phrase-queue", type=Path, required=True)
    parser.add_argument(
        "--dialogue",
        action="append",
        dest="dialogues",
        help="limit output to a queued dialogue; may be repeated",
    )
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--write",
        action="store_true",
        help="persist the deterministic report under --artifact-root",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    report = build_targeted_report(
        phrase_queue_path=args.phrase_queue,
        dialogues=args.dialogues,
    )
    if args.write:
        write_report(args.output, report, artifact_root=args.artifact_root)
    else:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
