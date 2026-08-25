#!/usr/bin/env python3
"""Create and verify the fail-closed reference-ASR adjudication artifacts.

The ``run`` command executes the one permitted secondary recognizer.  The
``adjudicate`` command then joins that result to the primary audition QA and a
Jowett/caption source-agreement record.  Neither command accepts asserted
counts: every word error, hash, model pin, and semantic binding is recomputed.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any


MODEL_REPOSITORY = "deepdml/faster-whisper-large-v3-turbo-ct2"
MODEL_REVISION = "44cbbd1adefe7387c83df88963a6d9ac4c9adea5"
FASTER_WHISPER_VERSION = "1.2.1"
CTRANSLATE2_VERSION = "4.8.1"
COMPUTE_TYPE = "float16"
BEAM_SIZE = 5
LANGUAGE = "en"
WORD_RE = re.compile(r"[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)?")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
REPO_ROOT = Path(__file__).resolve().parents[2]
PROPER_NAME_ALIASES = {
    "credo": "crito",
    "creto": "crito",
    "krito": "crito",
    "socrate": "socrates",
}


class ReferenceAsrAdjudicationError(ValueError):
    """Raised when independent ASR evidence cannot be trusted."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def words(text: str, *, normalize_names: bool = False) -> list[str]:
    tokens = [token.lower().replace("’", "'") for token in WORD_RE.findall(text)]
    return [PROPER_NAME_ALIASES.get(token, token) for token in tokens] if normalize_names else tokens


def edit_distance(left: list[str], right: list[str]) -> int:
    previous = list(range(len(right) + 1))
    for left_index, left_word in enumerate(left, start=1):
        current = [left_index]
        for right_index, right_word in enumerate(right, start=1):
            current.append(
                min(
                    previous[right_index] + 1,
                    current[right_index - 1] + 1,
                    previous[right_index - 1] + (left_word != right_word),
                )
            )
        previous = current
    return previous[-1]


def load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ReferenceAsrAdjudicationError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise ReferenceAsrAdjudicationError(f"{label} must be an object")
    return value


def repo_file(path: Path, label: str) -> tuple[Path, str]:
    candidate = path if path.is_absolute() else REPO_ROOT / path
    try:
        resolved = candidate.resolve(strict=True)
        relative = resolved.relative_to(REPO_ROOT.resolve()).as_posix()
    except (FileNotFoundError, ValueError) as error:
        raise ReferenceAsrAdjudicationError(
            f"{label} must be a present file inside the repository: {candidate}"
        ) from error
    return resolved, relative


def _write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, delete=False
    ) as handle:
        handle.write(data)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def _self_hash(value: dict[str, Any], field: str, label: str) -> None:
    recorded = value.get(field)
    frozen = {key: item for key, item in value.items() if key != field}
    if not isinstance(recorded, str) or recorded != sha256_bytes(canonical_json(frozen)):
        raise ReferenceAsrAdjudicationError(f"{label} semantic hash is inconsistent")


def resolve_snapshot(cache_dir: Path) -> Path:
    repository = MODEL_REPOSITORY.replace("/", "--")
    candidates = (
        cache_dir / f"models--{repository}" / "snapshots" / MODEL_REVISION,
        cache_dir / "hub" / f"models--{repository}" / "snapshots" / MODEL_REVISION,
    )
    for candidate in candidates:
        if (candidate / "model.bin").is_file():
            return candidate.resolve()
    raise ReferenceAsrAdjudicationError(
        f"pinned independent snapshot {MODEL_REPOSITORY}@{MODEL_REVISION} is not materialized"
    )


def build_independent_report(
    *, reference: Path, expected_text: str, cache_dir: Path
) -> dict[str, Any]:
    try:
        import ctranslate2
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise ReferenceAsrAdjudicationError(
            "faster-whisper and CTranslate2 are required for the independent run"
        ) from error

    faster_version = importlib.metadata.version("faster-whisper")
    ctranslate_version = importlib.metadata.version("ctranslate2")
    if faster_version != FASTER_WHISPER_VERSION or ctranslate_version != CTRANSLATE2_VERSION:
        raise ReferenceAsrAdjudicationError(
            "independent ASR runtime drifted: expected "
            f"faster-whisper {FASTER_WHISPER_VERSION} and CTranslate2 {CTRANSLATE2_VERSION}"
        )
    if ctranslate2.get_cuda_device_count() < 1:
        raise ReferenceAsrAdjudicationError("independent ASR requires CUDA")
    if not reference.is_file():
        raise ReferenceAsrAdjudicationError(f"reference does not exist: {reference}")
    expected_tokens = words(expected_text)
    if not expected_tokens:
        raise ReferenceAsrAdjudicationError("expected text has no words")
    snapshot = resolve_snapshot(cache_dir)
    model = WhisperModel(str(snapshot), device="cuda", compute_type=COMPUTE_TYPE)
    segments, info = model.transcribe(
        str(reference),
        language=LANGUAGE,
        beam_size=BEAM_SIZE,
        condition_on_previous_text=False,
        vad_filter=False,
    )
    transcript = " ".join(segment.text.strip() for segment in segments).strip()
    errors = edit_distance(
        words(expected_text, normalize_names=True),
        words(transcript, normalize_names=True),
    )
    core = {
        "schemaVersion": 1,
        "artifactKind": "pinned-independent-reference-asr-verification",
        "status": "verified-zero-error" if errors == 0 else "failed-word-fidelity",
        "reference": {
            "path": str(reference),
            "sha256": sha256_file(reference),
        },
        "expected": {
            "text": expected_text,
            "textSha256": sha256_bytes(expected_text.encode("utf-8")),
            "wordCount": len(expected_tokens),
        },
        "transcript": transcript,
        "ordinaryWordErrors": errors,
        "ordinaryWordErrorRate": errors / len(expected_tokens),
        "model": {
            "repository": MODEL_REPOSITORY,
            "revision": MODEL_REVISION,
            "snapshot": str(snapshot),
        },
        "runtime": {
            "fasterWhisperVersion": faster_version,
            "ctranslate2Version": ctranslate_version,
            "device": "cuda",
            "computeType": COMPUTE_TYPE,
            "beamSize": BEAM_SIZE,
            "language": LANGUAGE,
            "detectedLanguage": info.language,
            "conditionOnPreviousText": False,
            "vadFilter": False,
        },
    }
    return {**core, "reportSha256": sha256_bytes(canonical_json(core))}


def validate_independent_report(
    report: dict[str, Any], *, reference_sha256: str, expected_text: str
) -> dict[str, Any]:
    if set(report) != {
        "schemaVersion",
        "artifactKind",
        "status",
        "reference",
        "expected",
        "transcript",
        "ordinaryWordErrors",
        "ordinaryWordErrorRate",
        "model",
        "runtime",
        "reportSha256",
    }:
        raise ReferenceAsrAdjudicationError("independent ASR report has unsupported fields")
    _self_hash(report, "reportSha256", "independent ASR report")
    expected_tokens = words(expected_text)
    errors = edit_distance(
        words(expected_text, normalize_names=True),
        words(str(report.get("transcript", "")), normalize_names=True),
    )
    model = report.get("model")
    runtime = report.get("runtime")
    expected = report.get("expected")
    reference = report.get("reference")
    snapshot_suffix = (
        f"models--{MODEL_REPOSITORY.replace('/', '--')}/snapshots/{MODEL_REVISION}"
    )
    if (
        report.get("schemaVersion") != 1
        or report.get("artifactKind") != "pinned-independent-reference-asr-verification"
        or report.get("status") != "verified-zero-error"
        or not isinstance(reference, dict)
        or set(reference) != {"path", "sha256"}
        or reference.get("sha256") != reference_sha256
        or not isinstance(expected, dict)
        or set(expected) != {"text", "textSha256", "wordCount"}
        or expected.get("text") != expected_text
        or expected.get("textSha256") != sha256_bytes(expected_text.encode("utf-8"))
        or expected.get("wordCount") != len(expected_tokens)
        or errors != 0
        or report.get("ordinaryWordErrors") != errors
        or report.get("ordinaryWordErrorRate") != 0
        or not isinstance(model, dict)
        or set(model) != {"repository", "revision", "snapshot"}
        or model.get("repository") != MODEL_REPOSITORY
        or model.get("revision") != MODEL_REVISION
        or not str(model.get("snapshot", "")).replace("\\", "/").endswith(snapshot_suffix)
        or runtime
        != {
            "fasterWhisperVersion": FASTER_WHISPER_VERSION,
            "ctranslate2Version": CTRANSLATE2_VERSION,
            "device": "cuda",
            "computeType": COMPUTE_TYPE,
            "beamSize": BEAM_SIZE,
            "language": LANGUAGE,
            "detectedLanguage": LANGUAGE,
            "conditionOnPreviousText": False,
            "vadFilter": False,
        }
    ):
        raise ReferenceAsrAdjudicationError(
            "independent ASR report is stale, unpinned, or not semantically zero-error"
        )
    return report


def _matching_source_agreement(
    proof: dict[str, Any], *, sidecar: dict[str, Any]
) -> dict[str, Any]:
    if (
        proof.get("schemaVersion") != 1
        or proof.get("artifactKind") != "jowett-caption-character-reference-alignment"
        or proof.get("status") != "reference-intervals-emitted-no-cast-writes"
    ):
        raise ReferenceAsrAdjudicationError("unsupported source-agreement report")
    _self_hash(proof, "reportSha256", "source-agreement report")
    plan = sidecar.get("plan")
    if not isinstance(plan, dict):
        raise ReferenceAsrAdjudicationError("reference sidecar is missing plan")

    def matches(row: dict[str, Any], interval: dict[str, Any]) -> bool:
        return (
            row.get("characterId") == plan.get("character_id")
            and row.get("videoId") == plan.get("video_id")
            and abs(float(interval.get("startSeconds", -1)) - float(plan.get("start_seconds", -2)))
            <= 0.02
            and abs(float(interval.get("endSeconds", -1)) - float(plan.get("end_seconds", -2)))
            <= 0.02
            and words(str(interval.get("expectedPrompt", "")))
            == words(str(plan.get("prompt_text", "")))
        )

    found: list[dict[str, Any]] = []
    for row in proof.get("candidates", []):
        if (
            isinstance(row, dict)
            and row.get("status") == "automatically-eligible-reference-interval"
            and row.get("dialogue") == plan.get("dialogue")
            and isinstance(row.get("alignment"), dict)
            and matches(row, row["alignment"])
        ):
            found.append(row)
    for row in proof.get("referenceAnchorAudits", []):
        if (
            isinstance(row, dict)
            and row.get("status")
            in {
                "verified-exact-requested-interval",
                "requested-boundaries-rejected-safe-inner-interval-emitted",
            }
            and isinstance(row.get("safeInterval"), dict)
            and matches(row, row["safeInterval"])
        ):
            found.append(row)
    if len(found) != 1 or SHA256_RE.fullmatch(str(found[0].get("sourceAgreementSha256", ""))) is None:
        raise ReferenceAsrAdjudicationError(
            "reference does not have one exact Jowett/caption source-agreement record"
        )
    return found[0]


def _primary_reference_case(
    report: dict[str, Any], *, reference_name: str, expected_text: str
) -> dict[str, Any]:
    if (
        report.get("schemaVersion") != 1
        or report.get("status") != "audition-qa"
        or report.get("asrRepo") != "openai/whisper-small.en"
        or report.get("asrRevision") != "e8727524f962ee844a7319d92be39ac1bd25655a"
        or not isinstance(report.get("cases"), dict)
    ):
        raise ReferenceAsrAdjudicationError("primary ASR is not canonical audition QA")
    matches = [
        case
        for case in report["cases"].values()
        if isinstance(case, dict)
        and case.get("kind") == "reference"
        and Path(str(case.get("path", ""))).name == reference_name
    ]
    if len(matches) != 1:
        raise ReferenceAsrAdjudicationError("primary ASR has no unique reference case")
    case = matches[0]
    expected_tokens = words(expected_text)
    transcript = str(case.get("transcript", ""))
    errors = edit_distance(
        words(expected_text, normalize_names=True),
        words(transcript, normalize_names=True),
    )
    strict_errors = edit_distance(expected_tokens, words(transcript))
    if (
        case.get("expected") != expected_text
        or case.get("expectedWordCount") != len(expected_tokens)
        or case.get("nameNormalizedWordErrorCount") != errors
        or case.get("nameNormalizedWordErrorRate") != errors / len(expected_tokens)
        or case.get("strictWordErrorCount") != strict_errors
        or case.get("strictWordErrorRate") != strict_errors / len(expected_tokens)
        or errors == 0
    ):
        raise ReferenceAsrAdjudicationError(
            "independent adjudication requires a semantically verified failing primary reference case"
        )
    return case


def build_adjudication(
    *,
    sidecar_path: Path,
    source_agreement_path: Path,
    primary_asr_path: Path,
    independent_path: Path,
) -> dict[str, Any]:
    sidecar_path, _ = repo_file(sidecar_path, "reference sidecar")
    source_agreement_path, source_agreement_relative = repo_file(
        source_agreement_path, "source agreement"
    )
    primary_asr_path, _ = repo_file(primary_asr_path, "primary ASR")
    independent_path, independent_relative = repo_file(independent_path, "independent ASR")
    sidecar = load_json(sidecar_path, "reference sidecar")
    plan = sidecar.get("plan")
    wav = sidecar.get("wav")
    if not isinstance(plan, dict) or not isinstance(wav, dict):
        raise ReferenceAsrAdjudicationError("reference sidecar is missing plan or WAV")
    expected_text = str(plan.get("prompt_text", ""))
    reference_sha256 = str(wav.get("sha256", ""))
    reference_name = Path(str(wav.get("path", ""))).name
    primary = load_json(primary_asr_path, "primary ASR")
    primary_case = _primary_reference_case(
        primary, reference_name=reference_name, expected_text=expected_text
    )
    independent = load_json(independent_path, "independent ASR")
    validate_independent_report(
        independent, reference_sha256=reference_sha256, expected_text=expected_text
    )
    source_agreement = load_json(source_agreement_path, "source agreement")
    row = _matching_source_agreement(source_agreement, sidecar=sidecar)
    core = {
        "schemaVersion": 1,
        "artifactKind": "reference-asr-adjudication",
        "status": "verified",
        "referenceSha256": reference_sha256,
        "expectedText": expected_text,
        "expectedTextSha256": sha256_bytes(expected_text.encode("utf-8")),
        "primaryOrdinaryWordErrors": primary_case["nameNormalizedWordErrorCount"],
        "sourceAgreementEvidencePath": source_agreement_relative,
        "sourceAgreementEvidenceSha256": sha256_file(source_agreement_path),
        "sourceAgreementSha256": row["sourceAgreementSha256"],
        "sourceAgreementRecordId": row.get("candidateId") or row.get("anchorId"),
        "independentEvidencePath": independent_relative,
        "independentEvidenceSha256": sha256_file(independent_path),
        "independentReportSha256": independent["reportSha256"],
        "independentModel": {
            "repository": MODEL_REPOSITORY,
            "revision": MODEL_REVISION,
        },
        "independentExpectedWords": len(words(expected_text)),
        "independentOrdinaryWordErrors": 0,
        "independentOrdinaryWordErrorRate": 0,
    }
    return {**core, "adjudicationSha256": sha256_bytes(canonical_json(core))}


def validate_adjudication(
    adjudication: dict[str, Any],
    *,
    adjudication_path: Path,
    reference_sha256: str,
    expected_text: str,
    primary_errors: int,
    source_agreement_sha256: str,
) -> dict[str, Any]:
    if set(adjudication) != {
        "schemaVersion",
        "artifactKind",
        "status",
        "referenceSha256",
        "expectedText",
        "expectedTextSha256",
        "primaryOrdinaryWordErrors",
        "sourceAgreementEvidencePath",
        "sourceAgreementEvidenceSha256",
        "sourceAgreementSha256",
        "sourceAgreementRecordId",
        "independentEvidencePath",
        "independentEvidenceSha256",
        "independentReportSha256",
        "independentModel",
        "independentExpectedWords",
        "independentOrdinaryWordErrors",
        "independentOrdinaryWordErrorRate",
        "adjudicationSha256",
    }:
        raise ReferenceAsrAdjudicationError("reference ASR adjudication has unsupported fields")
    _self_hash(adjudication, "adjudicationSha256", "reference ASR adjudication")
    source_path, source_relative = repo_file(
        Path(str(adjudication["sourceAgreementEvidencePath"])), "source agreement"
    )
    independent_path, independent_relative = repo_file(
        Path(str(adjudication["independentEvidencePath"])), "independent ASR"
    )
    independent = load_json(independent_path, "independent ASR")
    source_proof = load_json(source_path, "source agreement")
    if (
        source_proof.get("schemaVersion") != 1
        or source_proof.get("artifactKind")
        != "jowett-caption-character-reference-alignment"
        or source_proof.get("status")
        != "reference-intervals-emitted-no-cast-writes"
    ):
        raise ReferenceAsrAdjudicationError(
            "reference ASR adjudication is stale or inconsistent"
        )
    _self_hash(source_proof, "reportSha256", "source-agreement report")
    agreement_records = [
        row
        for collection in (
            source_proof.get("candidates", []),
            source_proof.get("referenceAnchorAudits", []),
        )
        for row in collection
        if isinstance(row, dict)
        and row.get("sourceAgreementSha256") == source_agreement_sha256
    ]
    agreement_record_id = (
        agreement_records[0].get("candidateId") or agreement_records[0].get("anchorId")
        if len(agreement_records) == 1
        else None
    )
    validate_independent_report(
        independent, reference_sha256=reference_sha256, expected_text=expected_text
    )
    if (
        adjudication.get("schemaVersion") != 1
        or adjudication.get("artifactKind") != "reference-asr-adjudication"
        or adjudication.get("status") != "verified"
        or adjudication.get("referenceSha256") != reference_sha256
        or adjudication.get("expectedText") != expected_text
        or adjudication.get("expectedTextSha256") != sha256_bytes(expected_text.encode("utf-8"))
        or adjudication.get("primaryOrdinaryWordErrors") != primary_errors
        or adjudication.get("sourceAgreementSha256") != source_agreement_sha256
        or adjudication.get("sourceAgreementRecordId") != agreement_record_id
        or agreement_record_id is None
        or adjudication.get("sourceAgreementEvidencePath") != source_relative
        or not source_path.is_file()
        or sha256_file(source_path) != adjudication.get("sourceAgreementEvidenceSha256")
        or not independent_path.is_file()
        or adjudication.get("independentEvidencePath") != independent_relative
        or sha256_file(independent_path) != adjudication.get("independentEvidenceSha256")
        or adjudication.get("independentReportSha256") != independent.get("reportSha256")
        or adjudication.get("independentModel")
        != {"repository": MODEL_REPOSITORY, "revision": MODEL_REVISION}
        or adjudication.get("independentExpectedWords") != len(words(expected_text))
        or adjudication.get("independentOrdinaryWordErrors") != 0
        or adjudication.get("independentOrdinaryWordErrorRate") != 0
    ):
        raise ReferenceAsrAdjudicationError("reference ASR adjudication is stale or inconsistent")
    return adjudication


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    run = subparsers.add_parser("run", help="run the pinned independent recognizer")
    run.add_argument("--reference", type=Path, required=True)
    run.add_argument("--expected-text", required=True)
    run.add_argument("--cache-dir", type=Path, required=True)
    run.add_argument("--output", type=Path, required=True)
    adjudicate = subparsers.add_parser(
        "adjudicate", help="join primary, independent, and source-agreement evidence"
    )
    adjudicate.add_argument("--reference-sidecar", type=Path, required=True)
    adjudicate.add_argument("--source-agreement", type=Path, required=True)
    adjudicate.add_argument("--primary-asr", type=Path, required=True)
    adjudicate.add_argument("--independent", type=Path, required=True)
    adjudicate.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "run":
            artifact = build_independent_report(
                reference=args.reference,
                expected_text=args.expected_text,
                cache_dir=args.cache_dir,
            )
            _write_json(args.output, artifact)
            print(
                f"{artifact['status']}: {artifact['ordinaryWordErrors']}/"
                f"{artifact['expected']['wordCount']} ordinary-word errors"
            )
            return 0 if artifact["ordinaryWordErrors"] == 0 else 1
        artifact = build_adjudication(
            sidecar_path=args.reference_sidecar,
            source_agreement_path=args.source_agreement,
            primary_asr_path=args.primary_asr,
            independent_path=args.independent,
        )
        _write_json(args.output, artifact)
        print(f"verified adjudication: {args.output}")
        return 0
    except ReferenceAsrAdjudicationError as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    raise SystemExit(main())
