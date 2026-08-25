#!/usr/bin/env python3
"""Render a cast-batch audition wave with one shared loaded Dots runtime."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import tempfile
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any, Callable

from audition_dots_reference import (
    AuditionError,
    AuditionPlan,
    build_audition_plan,
    canonical_json,
    inspect_completed_audition,
    load_audition_runtime,
    render_audition_with_runtime,
    sha256_file,
)


REPO_ROOT = Path(__file__).resolve().parents[2]


class BatchRenderError(ValueError):
    """Raised when a cast batch cannot be rendered without guessing."""


@dataclass(frozen=True)
class RenderJob:
    character_id: str
    source_character_id: str
    plan: AuditionPlan


def _load_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise BatchRenderError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise BatchRenderError(f"{label} must be a JSON object")
    return value


def _repo_path(root: Path, value: Any, label: str) -> Path:
    if not isinstance(value, str) or not value or Path(value).is_absolute():
        raise BatchRenderError(f"{label} must be a repository-relative path")
    path = (root / value).resolve()
    try:
        path.relative_to(root)
    except ValueError as error:
        raise BatchRenderError(f"{label} escapes the repository") from error
    return path


def _verify_manifest_self_hash(batch: dict[str, Any]) -> None:
    expected = batch.get("manifestSha256")
    if not isinstance(expected, str) or len(expected) != 64:
        raise BatchRenderError("cast batch manifest has no valid self hash")
    payload = {
        key: value
        for key, value in batch.items()
        if key not in {"manifestSha256", "batchManifestPath"}
    }
    actual = hashlib.sha256(canonical_json(payload)).hexdigest()
    if actual != expected:
        raise BatchRenderError("cast batch manifest self hash differs")


def load_jobs(batch_manifest: Path, repo_root: Path) -> tuple[dict[str, Any], list[RenderJob]]:
    repo_root = repo_root.resolve()
    try:
        batch_manifest.resolve().relative_to(repo_root)
    except ValueError as error:
        raise BatchRenderError("cast batch manifest must stay inside the repository") from error
    batch = _load_json(batch_manifest, "cast batch manifest")
    if (
        batch.get("schemaVersion") != 1
        or batch.get("artifactKind") != "dots-cast-batch-dry-run"
        or batch.get("phase") != "remote-render"
    ):
        raise BatchRenderError("expected a schema-v1 remote-render cast batch manifest")
    _verify_manifest_self_hash(batch)
    identity = batch.get("identity")
    items = batch.get("items")
    if not isinstance(identity, dict) or not isinstance(items, list) or not items:
        raise BatchRenderError("cast batch identity/items are missing")
    if (
        identity.get("policy") != "remaining-canonical-dots-cast-v1"
        or identity.get("batchContentSha256") != batch.get("batchSha256")
    ):
        raise BatchRenderError("cast batch policy or content identity is invalid")
    target_text = identity.get("targetText")
    seeds = identity.get("seeds")
    if (
        not isinstance(target_text, str)
        or not target_text.strip()
        or not isinstance(seeds, list)
        or seeds != list(range(42, 50))
    ):
        raise BatchRenderError("cast batch target text or seeds are invalid")

    jobs: list[RenderJob] = []
    seen: set[str] = set()
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise BatchRenderError(f"cast batch item {index} is malformed")
        character_id = item.get("characterId")
        source_character_id = item.get("sourceCharacterId")
        paths = item.get("paths")
        if (
            not isinstance(character_id, str)
            or character_id in seen
            or not isinstance(source_character_id, str)
            or not isinstance(paths, dict)
        ):
            raise BatchRenderError(f"cast batch item {index} has invalid identities or paths")
        seen.add(character_id)
        reference_value = paths.get("referenceWav")
        sidecar_value = paths.get("referenceSidecar")
        output_value = paths.get("auditionDir")
        reference = _repo_path(repo_root, reference_value, "reference WAV")
        sidecar = _repo_path(repo_root, sidecar_value, "reference sidecar")
        output_dir = _repo_path(repo_root, output_value, "audition directory")
        plan = build_audition_plan(
            reference=reference,
            reference_sidecar=sidecar,
            target_text=target_text,
            seeds=seeds,
            output_dir=output_dir,
        )
        # The ordinary per-item CLI is run from the repository and records
        # repository-relative paths. Preserve that exact plan identity while
        # using absolute paths only for this preflight's filesystem checks.
        plan = replace(
            plan,
            reference_path=str(reference_value),
            output_dir=str(output_value),
        )
        if plan.character_id != source_character_id:
            raise BatchRenderError(
                f"cast batch item {character_id} source identity differs from its reference sidecar"
            )
        jobs.append(RenderJob(character_id, source_character_id, plan))
    scope = identity.get("scope")
    if (
        not isinstance(scope, dict)
        or scope.get("characterIds") != sorted(seen)
        or [job.character_id for job in jobs] != sorted(seen)
    ):
        raise BatchRenderError("cast batch scope and item inventory differ")
    return batch, jobs


def _result_row(job: RenderJob, manifest: dict[str, Any], repo_root: Path) -> dict[str, Any]:
    output_dir = repo_root / job.plan.output_dir
    manifest_path = output_dir / "audition-manifest.json"
    return {
        "characterId": job.character_id,
        "sourceCharacterId": job.source_character_id,
        "planSha256": manifest["planSha256"],
        "auditionManifestPath": manifest_path.resolve().relative_to(repo_root).as_posix(),
        "auditionManifestSha256": sha256_file(manifest_path),
        "outputCount": len(manifest["outputs"]),
    }


def run_batch(
    batch_manifest: Path,
    *,
    repo_root: Path = REPO_ROOT,
    cache_dir: Path,
    execute: bool = False,
    runtime_loader: Callable[[AuditionPlan, Path], Any] = load_audition_runtime,
    renderer: Callable[[AuditionPlan, Any], dict[str, Any]] = render_audition_with_runtime,
) -> dict[str, Any]:
    repo_root = repo_root.resolve()
    if Path.cwd().resolve() != repo_root:
        raise BatchRenderError("batch rendering must run from the repository root")
    batch_manifest = batch_manifest.resolve()
    batch, jobs = load_jobs(batch_manifest, repo_root)
    completed: dict[str, dict[str, Any]] = {}
    pending: list[RenderJob] = []
    for job in jobs:
        existing = inspect_completed_audition(job.plan)
        if existing is None:
            pending.append(job)
        else:
            completed[job.character_id] = existing

    if execute and pending:
        loaded = runtime_loader(pending[0].plan, cache_dir)
        for index, job in enumerate(pending, 1):
            print(
                f"START {index}/{len(pending)} {job.character_id}",
                flush=True,
            )
            completed[job.character_id] = renderer(job.plan, loaded)
            print(f"DONE {index}/{len(pending)} {job.character_id}", flush=True)

    rows = [
        _result_row(job, completed[job.character_id], repo_root)
        for job in jobs
        if job.character_id in completed
    ]
    result: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "dots-cast-batch-render-summary",
        "status": (
            "complete" if len(rows) == len(jobs) else "planned-no-gpu-execution"
        ),
        "batchManifestPath": batch_manifest.relative_to(repo_root).as_posix(),
        "batchManifestSha256": sha256_file(batch_manifest),
        "batchSha256": batch.get("batchSha256"),
        "executeRequested": execute,
        "runtimeLoadCount": 1 if execute and pending else 0,
        "itemCount": len(jobs),
        "completedCount": len(rows),
        "pendingCharacterIds": [
            job.character_id for job in jobs if job.character_id not in completed
        ],
        "outputs": rows,
    }
    result["summarySha256"] = hashlib.sha256(canonical_json(result)).hexdigest()
    return result


def _atomic_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", dir=path.parent, delete=False
    ) as handle:
        handle.write(data)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch-manifest", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    try:
        result = run_batch(
            args.batch_manifest,
            repo_root=args.repo_root,
            cache_dir=args.cache_dir,
            execute=args.execute,
        )
        if args.output is not None:
            if not args.execute or result["status"] != "complete":
                raise BatchRenderError("--output requires a complete --execute run")
            output = args.output if args.output.is_absolute() else args.repo_root / args.output
            _atomic_json(output.resolve(), result)
    except (AuditionError, BatchRenderError) as error:
        raise SystemExit(str(error)) from error
    print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
