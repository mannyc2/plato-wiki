#!/usr/bin/env python3
"""QA and rank every Dots cast audition while loading each GPU model once."""

from __future__ import annotations

import argparse
import gc
import json
import os
import shlex
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from qa_dots_audition import (
    load_asr_transcriber,
    load_cases,
    run_qa_with_transcriber,
    sha256_file,
)
from rank_dots_audition import load_speaker_runtime, rank_audition_with_runtime


class BatchQaError(ValueError):
    """Raised when a cast batch cannot be scored without guessing or overwriting."""


@dataclass(frozen=True)
class QaJob:
    character_id: str
    manifest: Path
    asr_output: Path
    ranking_output: Path
    plan_sha256: str
    reference: Path
    reference_sidecar: Path
    source_agreement: Path
    independent_output: Path
    adjudication_output: Path
    expected_text: str


def _repo_path(repo_root: Path, value: Any, label: str) -> Path:
    if not isinstance(value, str) or not value:
        raise BatchQaError(f"{label} must be a non-empty repository-relative path")
    path = (repo_root / value).resolve()
    try:
        path.relative_to(repo_root)
    except ValueError as error:
        raise BatchQaError(f"{label} escapes the repository: {value}") from error
    return path


def _relative(repo_root: Path, path: Path) -> str:
    return path.resolve().relative_to(repo_root).as_posix()


def _validated_cache_dir(path: Path, label: str) -> Path:
    if not path.is_absolute() or ".." in path.parts:
        raise BatchQaError(f"{label} must be an absolute canonical path: {path}")
    if not path.is_dir():
        raise BatchQaError(f"{label} does not exist or is not a directory: {path}")
    return path


def _load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise BatchQaError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise BatchQaError(f"{label} must be a JSON object: {path}")
    return value


def _artifact_state(path: Path, *, status: str, plan_sha256: str) -> str:
    if not path.exists():
        return "pending"
    report = _load_json(path, status)
    if (
        report.get("schemaVersion") != 1
        or report.get("status") != status
        or report.get("auditionPlanSha256") != plan_sha256
    ):
        raise BatchQaError(f"stale or unsupported {status} artifact: {path}")
    return "complete"


def load_jobs(
    batch_manifest: Path, repo_root: Path
) -> tuple[dict[str, Any], list[QaJob]]:
    repo_root = repo_root.resolve()
    batch = _load_json(batch_manifest, "cast batch manifest")
    if (
        batch.get("schemaVersion") != 1
        or batch.get("artifactKind") != "dots-cast-batch-dry-run"
        or not isinstance(batch.get("items"), list)
        or not batch["items"]
    ):
        raise BatchQaError("unsupported or empty cast batch manifest")
    jobs: list[QaJob] = []
    seen: set[str] = set()
    for item in batch["items"]:
        if not isinstance(item, dict) or not isinstance(item.get("paths"), dict):
            raise BatchQaError("cast batch item is malformed")
        character_id = item.get("characterId")
        if (
            not isinstance(character_id, str)
            or not character_id
            or character_id in seen
        ):
            raise BatchQaError(
                "cast batch character IDs must be unique non-empty strings"
            )
        seen.add(character_id)
        audition_dir = _repo_path(
            repo_root, item["paths"].get("auditionDir"), "audition directory"
        )
        manifest = audition_dir / "audition-manifest.json"
        loaded, _ = load_cases(manifest)
        plan_sha256 = loaded.get("planSha256")
        if not isinstance(plan_sha256, str) or len(plan_sha256) != 64:
            raise BatchQaError(f"audition plan hash is malformed: {manifest}")
        asr_output = _repo_path(repo_root, item["paths"].get("asrQa"), "ASR report")
        ranking_output = _repo_path(
            repo_root, item["paths"].get("speakerRanking"), "speaker ranking"
        )
        _artifact_state(asr_output, status="audition-qa", plan_sha256=plan_sha256)
        _artifact_state(
            ranking_output, status="audition-ranking", plan_sha256=plan_sha256
        )
        reference = _repo_path(
            repo_root, item["paths"].get("referenceWav"), "reference WAV"
        )
        reference_sidecar = _repo_path(
            repo_root,
            item["paths"].get("referenceSidecar"),
            "reference sidecar",
        )
        source_agreement = _repo_path(
            repo_root, item.get("alignmentReportPath"), "source-agreement report"
        )
        independent_output = _repo_path(
            repo_root,
            item["paths"].get("referenceAsrIndependent"),
            "independent reference ASR output",
        )
        adjudication_output = _repo_path(
            repo_root,
            item["paths"].get("referenceAsrAdjudication"),
            "reference ASR adjudication output",
        )
        expected_text = loaded.get("plan", {}).get("prompt_text")
        if not isinstance(expected_text, str) or not expected_text.strip():
            raise BatchQaError(f"audition plan has no reference prompt: {manifest}")
        jobs.append(
            QaJob(
                character_id=character_id,
                manifest=manifest,
                asr_output=asr_output,
                ranking_output=ranking_output,
                plan_sha256=plan_sha256,
                reference=reference,
                reference_sidecar=reference_sidecar,
                source_agreement=source_agreement,
                independent_output=independent_output,
                adjudication_output=adjudication_output,
                expected_text=expected_text,
            )
        )
    return batch, jobs


def release_cuda() -> None:
    """Release a completed model stage before loading the next GPU model."""

    gc.collect()
    try:
        import torch
    except ImportError:
        return
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def _write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def _command(argv: list[str]) -> dict[str, Any]:
    return {"argv": argv, "shell": shlex.join(argv)}


def _reference_asr_adjudication_queue(
    jobs: list[QaJob], *, repo_root: Path, cache_dir: Path
) -> list[dict[str, Any]]:
    queue: list[dict[str, Any]] = []
    for job in jobs:
        report = _load_json(job.asr_output, "audition QA")
        cases = report.get("cases")
        if not isinstance(cases, dict):
            raise BatchQaError(
                f"audition QA has no reference case inventory: {job.asr_output}"
            )
        reference_cases = [
            case
            for case in cases.values()
            if isinstance(case, dict) and case.get("kind") == "reference"
        ]
        if len(reference_cases) != 1:
            raise BatchQaError(
                f"audition QA has no unique reference case: {job.asr_output}"
            )
        case = reference_cases[0]
        errors = case.get("nameNormalizedWordErrorCount")
        if (
            not isinstance(errors, int)
            or errors < 0
            or case.get("expected") != job.expected_text
        ):
            raise BatchQaError(
                f"audition QA reference metrics differ from its plan: {job.asr_output}"
            )
        if errors == 0:
            continue
        run_command = _command(
            [
                sys.executable,
                "scripts/audio/verify_reference_asr_adjudication.py",
                "run",
                "--reference",
                _relative(repo_root, job.reference),
                "--expected-text",
                job.expected_text,
                "--cache-dir",
                str(cache_dir),
                "--output",
                _relative(repo_root, job.independent_output),
            ]
        )
        adjudicate_command = _command(
            [
                sys.executable,
                "scripts/audio/verify_reference_asr_adjudication.py",
                "adjudicate",
                "--reference-sidecar",
                _relative(repo_root, job.reference_sidecar),
                "--source-agreement",
                _relative(repo_root, job.source_agreement),
                "--primary-asr",
                _relative(repo_root, job.asr_output),
                "--independent",
                _relative(repo_root, job.independent_output),
                "--output",
                _relative(repo_root, job.adjudication_output),
            ]
        )
        queue.append(
            {
                "characterId": job.character_id,
                "primaryOrdinaryWordErrors": errors,
                "status": "independent-large-v3-and-adjudication-required",
                "commands": [run_command, adjudicate_command],
                "shell": f"{run_command['shell']} && {adjudicate_command['shell']}",
            }
        )
    return queue


def run_batch(
    batch_manifest: Path,
    *,
    repo_root: Path,
    cache_dir: Path,
    independent_cache_dir: Path,
    output: Path,
) -> dict[str, Any]:
    repo_root = repo_root.resolve()
    cache_dir = _validated_cache_dir(cache_dir, "primary model cache")
    independent_cache_dir = _validated_cache_dir(
        independent_cache_dir, "independent large-v3 model cache"
    )
    if cache_dir.resolve() == independent_cache_dir.resolve():
        raise BatchQaError(
            "primary and independent large-v3 model caches must be distinct"
        )
    batch_manifest = batch_manifest.resolve()
    output = output if output.is_absolute() else repo_root / output
    output = output.resolve()
    try:
        output.relative_to(repo_root)
    except ValueError as error:
        raise BatchQaError(
            f"summary output escapes the repository: {output}"
        ) from error
    batch, jobs = load_jobs(batch_manifest, repo_root)
    pending_asr = [
        job
        for job in jobs
        if _artifact_state(
            job.asr_output, status="audition-qa", plan_sha256=job.plan_sha256
        )
        == "pending"
    ]
    pending_ranking = [
        job
        for job in jobs
        if _artifact_state(
            job.ranking_output,
            status="audition-ranking",
            plan_sha256=job.plan_sha256,
        )
        == "pending"
    ]

    if pending_asr:
        snapshot, transcriber = load_asr_transcriber(cache_dir)
        try:
            for index, job in enumerate(pending_asr, start=1):
                print(f"ASR {index}/{len(pending_asr)} {job.character_id}", flush=True)
                run_qa_with_transcriber(
                    job.manifest,
                    snapshot=snapshot,
                    transcriber=transcriber,
                    output=job.asr_output,
                )
        finally:
            del transcriber
            release_cuda()

    if pending_ranking:
        runtime = load_speaker_runtime(cache_dir)
        try:
            for index, job in enumerate(pending_ranking, start=1):
                print(
                    f"RANK {index}/{len(pending_ranking)} {job.character_id}",
                    flush=True,
                )
                rank_audition_with_runtime(
                    job.manifest, runtime=runtime, output=job.ranking_output
                )
        finally:
            del runtime
            release_cuda()

    reports: list[dict[str, Any]] = []
    for job in jobs:
        for kind, path, status in (
            ("asr", job.asr_output, "audition-qa"),
            ("speaker-ranking", job.ranking_output, "audition-ranking"),
        ):
            if (
                _artifact_state(path, status=status, plan_sha256=job.plan_sha256)
                != "complete"
            ):
                raise BatchQaError(f"batch left an incomplete {kind} artifact: {path}")
            reports.append(
                {
                    "characterId": job.character_id,
                    "kind": kind,
                    "path": _relative(repo_root, path),
                    "sha256": sha256_file(path),
                }
            )
    adjudication_queue = _reference_asr_adjudication_queue(
        jobs, repo_root=repo_root, cache_dir=independent_cache_dir
    )
    summary = {
        "schemaVersion": 1,
        "artifactKind": "dots-cast-batch-qa-summary",
        "status": "complete",
        "batchManifestPath": _relative(repo_root, batch_manifest),
        "batchManifestSha256": sha256_file(batch_manifest),
        "batchSha256": batch.get("batchSha256"),
        "characterCount": len(jobs),
        "characterIds": [job.character_id for job in jobs],
        "modelsLoaded": {
            "asr": 1 if pending_asr else 0,
            "speakerEncoder": 1 if pending_ranking else 0,
        },
        "modelCaches": {
            "primaryWhisperSmallAndCampp": str(cache_dir),
            "independentWhisperLargeV3": str(independent_cache_dir),
        },
        "referenceAsrAdjudicationQueueCount": len(adjudication_queue),
        "referenceAsrAdjudicationQueue": adjudication_queue,
        "reports": reports,
    }
    _write_json(output, summary)
    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch-manifest", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--independent-cache-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        run_batch(
            args.batch_manifest,
            repo_root=args.repo_root,
            cache_dir=args.cache_dir,
            independent_cache_dir=args.independent_cache_dir,
            output=args.output,
        )
    except BatchQaError as error:
        raise SystemExit(str(error)) from error
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
