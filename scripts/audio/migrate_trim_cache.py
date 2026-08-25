#!/usr/bin/env python3
"""Migrate Dots renderer-v3 trim caches to the renderer-v4 cache address.

This is intentionally a single-policy migration.  It reuses synthesis only when
the old and new render plans differ by the renderer-v3 to renderer-v4 identity
change and the -60 dB to -50 dB edge-trim threshold.  Every source cache is
validated before any destination is written, and every published destination is
validated with the current renderer contract.
"""

from __future__ import annotations

import argparse
import copy
import json
import math
import shutil
import stat
import sys
import uuid
from pathlib import Path
from typing import Any

import render_dots


OLD_RENDERER_VERSION = 3
NEW_RENDERER_VERSION = 4
OLD_TRIM_THRESHOLD_DB = -60.0
NEW_TRIM_THRESHOLD_DB = -50.0
REQUIRED_OLD_PLAN_SHA256 = (
    "b42ed6f3e63ed1ebb8145be5240c220fa041e4c98365ae0ccc570fd2c618c38b"
)
REQUIRED_NEW_PLAN_SHA256 = (
    "5e0c82820139a285a858368a73dafb190805bcf56ab058dfed4d35ec552a4b8c"
)
MAX_PLAN_BYTES = 64 * 1024 * 1024
PLAN_FIELDS = {
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
TASK_FIELDS = {"order", "input_sha256", "input", "reference_path"}
CACHE_FIELDS = {"schema_version", "input_sha256", "input", "audio", "runtime"}
AUDIO_FIELDS = {
    "sha256",
    "channels",
    "sample_rate",
    "frames",
    "sample_width_bytes",
    "duration_seconds",
    "peak_gpu_mib",
}
RUNTIME_FIELDS = {"provenance", "generation_seconds"}


class TrimCacheMigrationError(RuntimeError):
    """Raised when the one permitted cache migration is not provable."""


def _finite_nonnegative(value: Any, location: str) -> float:
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(float(value))
        or float(value) < 0
    ):
        raise TrimCacheMigrationError(
            f"{location}: expected a finite non-negative number"
        )
    return float(value)


def _stable_identity(path: Path) -> tuple[int, int, int, int]:
    try:
        evidence = path.stat()
    except OSError as error:
        raise TrimCacheMigrationError(f"cannot stat regular file {path}: {error}") from error
    if path.is_symlink() or not stat.S_ISREG(evidence.st_mode):
        raise TrimCacheMigrationError(f"expected a regular non-symlink file: {path}")
    return (
        evidence.st_dev,
        evidence.st_ino,
        evidence.st_size,
        evidence.st_mtime_ns,
    )


def _load_content_addressed_plan(
    path: Path,
    outdir: Path,
    *,
    label: str,
    required_sha256: str,
) -> dict[str, Any]:
    path = path.expanduser()
    before = _stable_identity(path)
    if not 0 < before[2] <= MAX_PLAN_BYTES:
        raise TrimCacheMigrationError(f"{label} size is outside the safe bound")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise TrimCacheMigrationError(f"cannot read {label} {path}: {error}") from error
    if _stable_identity(path) != before:
        raise TrimCacheMigrationError(f"{label} changed while it was read: {path}")
    if not isinstance(value, dict) or set(value) != PLAN_FIELDS:
        raise TrimCacheMigrationError(f"{label} fields are invalid")
    digest = value.get("plan_sha256")
    try:
        render_dots._sha256(digest, f"{label} plan_sha256")
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(str(error)) from error
    without_digest = {
        key: item for key, item in value.items() if key != "plan_sha256"
    }
    if render_dots.content_sha256(without_digest) != digest:
        raise TrimCacheMigrationError(f"{label} content address is inconsistent")
    if digest != required_sha256:
        raise TrimCacheMigrationError(
            f"{label} SHA-256 is not the required pinned plan: "
            f"expected {required_sha256}, got {digest}"
        )
    expected_path = outdir / "plans" / f"{digest}.json"
    render_dots._validate_output_directory_chain(outdir, expected_path.parent)
    if path.resolve() != expected_path.resolve() or path.is_symlink():
        raise TrimCacheMigrationError(
            f"{label} is not at its content-addressed path: {expected_path}"
        )
    return value


def _validate_task_content_address(
    task: Any, *, expected_order: int, location: str
) -> dict[str, Any]:
    if not isinstance(task, dict) or set(task) != TASK_FIELDS:
        raise TrimCacheMigrationError(f"{location} fields are invalid")
    if (
        isinstance(task.get("order"), bool)
        or task.get("order") != expected_order
    ):
        raise TrimCacheMigrationError(f"{location} order is not contiguous")
    digest = task.get("input_sha256")
    try:
        render_dots._sha256(digest, f"{location}.input_sha256")
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(str(error)) from error
    task_input = task.get("input")
    if (
        not isinstance(task_input, dict)
        or render_dots.content_sha256(task_input) != digest
    ):
        raise TrimCacheMigrationError(f"{location} content address is inconsistent")
    return task


def validate_plan_pair(
    old_plan: dict[str, Any], new_plan: dict[str, Any]
) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    """Prove that a plan pair permits only the pinned edge-trim migration."""

    try:
        render_dots.validate_render_plan(new_plan)
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(f"new plan is not current: {error}") from error
    if (
        render_dots.RENDERER_VERSION != NEW_RENDERER_VERSION
        or render_dots.TRIM_THRESHOLD_DB != NEW_TRIM_THRESHOLD_DB
    ):
        raise TrimCacheMigrationError(
            "migration code requires current renderer v4 with a -50 dB trim threshold"
        )
    if not isinstance(old_plan, dict) or set(old_plan) != PLAN_FIELDS:
        raise TrimCacheMigrationError("old plan fields are invalid")
    old_without_digest = {
        key: value for key, value in old_plan.items() if key != "plan_sha256"
    }
    if (
        not isinstance(old_plan.get("plan_sha256"), str)
        or render_dots.content_sha256(old_without_digest)
        != old_plan["plan_sha256"]
    ):
        raise TrimCacheMigrationError("old plan content address is inconsistent")

    old_plan_evidence = {
        key: value
        for key, value in old_plan.items()
        if key not in {"plan_sha256", "tasks"}
    }
    new_plan_evidence = {
        key: value
        for key, value in new_plan.items()
        if key not in {"plan_sha256", "tasks"}
    }
    if render_dots.canonical_json(old_plan_evidence) != render_dots.canonical_json(
        new_plan_evidence
    ):
        raise TrimCacheMigrationError(
            "plans differ outside their task content addresses"
        )

    old_tasks = old_plan.get("tasks")
    new_tasks = new_plan.get("tasks")
    if (
        not isinstance(old_tasks, list)
        or not isinstance(new_tasks, list)
        or len(old_tasks) != len(new_tasks)
        or not old_tasks
    ):
        raise TrimCacheMigrationError("plans have different task counts")

    current_code_sha256 = render_dots.sha256_file(Path(render_dots.__file__).resolve())
    pairs: list[tuple[dict[str, Any], dict[str, Any]]] = []
    old_code_sha256: str | None = None
    for order, (old_task_raw, new_task_raw) in enumerate(
        zip(old_tasks, new_tasks, strict=True)
    ):
        old_task = _validate_task_content_address(
            old_task_raw, expected_order=order, location=f"old task {order}"
        )
        new_task = _validate_task_content_address(
            new_task_raw, expected_order=order, location=f"new task {order}"
        )
        if old_task["reference_path"] != new_task["reference_path"]:
            raise TrimCacheMigrationError(
                f"task {order} reference_path changed during trim migration"
            )
        try:
            old_entries = old_task["input"]["screenplay"]["entries"]
            new_entries = new_task["input"]["screenplay"]["entries"]
            old_renderer = old_task["input"]["renderer"]
            new_renderer = new_task["input"]["renderer"]
            old_audio = old_task["input"]["audio"]
            new_audio = new_task["input"]["audio"]
        except (KeyError, TypeError) as error:
            raise TrimCacheMigrationError(
                f"task {order} lacks renderer trim migration evidence"
            ) from error
        if render_dots.canonical_json(old_entries) != render_dots.canonical_json(
            new_entries
        ):
            raise TrimCacheMigrationError(
                f"task {order} screenplay entries changed or reordered"
            )
        if (
            old_renderer.get("version") != OLD_RENDERER_VERSION
            or new_renderer.get("version") != NEW_RENDERER_VERSION
            or old_audio.get("trim_threshold_db") != OLD_TRIM_THRESHOLD_DB
            or new_audio.get("trim_threshold_db") != NEW_TRIM_THRESHOLD_DB
            or new_renderer.get("code_sha256") != current_code_sha256
            or old_renderer.get("code_sha256") == current_code_sha256
        ):
            raise TrimCacheMigrationError(
                f"task {order} is not the pinned v3 -60 dB to v4 -50 dB transition"
            )
        try:
            render_dots._sha256(
                old_renderer.get("code_sha256"),
                f"old task {order} renderer.code_sha256",
            )
        except render_dots.RenderContractError as error:
            raise TrimCacheMigrationError(str(error)) from error
        if old_code_sha256 is None:
            old_code_sha256 = old_renderer["code_sha256"]
        elif old_renderer["code_sha256"] != old_code_sha256:
            raise TrimCacheMigrationError(
                "old plan tasks disagree on renderer.code_sha256"
            )

        normalized_old_input = copy.deepcopy(old_task["input"])
        normalized_old_input["renderer"]["version"] = NEW_RENDERER_VERSION
        normalized_old_input["renderer"]["code_sha256"] = current_code_sha256
        normalized_old_input["audio"][
            "trim_threshold_db"
        ] = NEW_TRIM_THRESHOLD_DB
        if render_dots.canonical_json(normalized_old_input) != render_dots.canonical_json(
            new_task["input"]
        ):
            raise TrimCacheMigrationError(
                f"task {order} inputs differ outside the permitted trim policy fields"
            )
        pairs.append((old_task, new_task))
    return pairs


def _validate_old_cached_task(
    task: dict[str, Any], outdir: Path
) -> dict[str, Any]:
    digest = task["input_sha256"]
    directory, wav_path, sidecar_path = render_dots.cache_paths(outdir, digest)
    render_dots._validate_output_directory_chain(outdir, directory.parent)
    if directory.is_symlink() or not directory.is_dir():
        raise TrimCacheMigrationError(f"missing or unsafe old render cache: {directory}")
    inventory: set[str] = set()
    for path in directory.iterdir():
        if path.is_symlink() or not path.is_file():
            raise TrimCacheMigrationError(f"unsafe old render cache entry: {path}")
        inventory.add(path.name)
    if inventory != {"audio.wav", "render.json"}:
        raise TrimCacheMigrationError(f"partial old render cache: {directory}")

    sidecar_identity = _stable_identity(sidecar_path)
    try:
        sidecar = render_dots.load_json_object(sidecar_path)
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(str(error)) from error
    if _stable_identity(sidecar_path) != sidecar_identity:
        raise TrimCacheMigrationError(
            f"old render sidecar changed while it was read: {sidecar_path}"
        )
    if (
        set(sidecar) != CACHE_FIELDS
        or sidecar.get("schema_version") != render_dots.RENDER_CACHE_SCHEMA_VERSION
        or sidecar.get("input_sha256") != digest
        or sidecar.get("input") != task["input"]
        or render_dots.content_sha256(sidecar.get("input")) != digest
    ):
        raise TrimCacheMigrationError(f"old render sidecar contract is invalid: {sidecar_path}")

    audio = sidecar.get("audio")
    if not isinstance(audio, dict) or set(audio) != AUDIO_FIELDS:
        raise TrimCacheMigrationError(f"old render audio metadata is invalid: {sidecar_path}")
    wav_identity = _stable_identity(wav_path)
    actual_sha256 = render_dots.sha256_file(wav_path)
    if _stable_identity(wav_path) != wav_identity:
        raise TrimCacheMigrationError(f"old render WAV changed while hashed: {wav_path}")
    if audio.get("sha256") != actual_sha256:
        raise TrimCacheMigrationError(f"old render WAV checksum mismatch: {wav_path}")
    try:
        metadata = render_dots._wav_metadata(wav_path)
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(str(error)) from error
    if (
        any(audio.get(field) != value for field, value in metadata.items())
        or metadata
        != {
            "channels": 1,
            "sample_rate": render_dots.SAMPLE_RATE,
            "frames": metadata["frames"],
            "sample_width_bytes": render_dots.PRODUCTION_SAMPLE_WIDTH_BYTES,
        }
        or metadata["frames"] <= 0
        or audio.get("duration_seconds")
        != metadata["frames"] / render_dots.SAMPLE_RATE
    ):
        raise TrimCacheMigrationError(f"old render WAV metadata mismatch: {wav_path}")
    _finite_nonnegative(audio.get("peak_gpu_mib"), f"{sidecar_path}: peak_gpu_mib")

    runtime = sidecar.get("runtime")
    if not isinstance(runtime, dict) or set(runtime) != RUNTIME_FIELDS:
        raise TrimCacheMigrationError(f"old render runtime evidence is invalid: {sidecar_path}")
    try:
        render_dots.validate_runtime_provenance(runtime.get("provenance"))
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(
            f"old render runtime provenance is invalid: {error}"
        ) from error
    if runtime["provenance"] != task["input"]["runtime_provenance"]:
        raise TrimCacheMigrationError(f"old render runtime provenance is stale: {sidecar_path}")
    _finite_nonnegative(
        runtime.get("generation_seconds"), f"{sidecar_path}: generation_seconds"
    )
    return sidecar


def _migrate_one(
    old_task: dict[str, Any],
    new_task: dict[str, Any],
    old_sidecar: dict[str, Any],
    outdir: Path,
) -> None:
    import soundfile as sf

    _, old_wav_path, _ = render_dots.cache_paths(
        outdir, old_task["input_sha256"]
    )
    final, _, _ = render_dots.cache_paths(outdir, new_task["input_sha256"])
    render_dots._validate_output_directory_chain(outdir, final.parent)
    final.parent.mkdir(parents=True, exist_ok=True)
    temp = final.parent / f".{new_task['input_sha256']}.{uuid.uuid4().hex}.tmp"
    if temp.exists() or temp.is_symlink():
        raise TrimCacheMigrationError(f"migration temporary path already exists: {temp}")
    temp.mkdir()
    try:
        samples, sample_rate = sf.read(
            old_wav_path, dtype="float32", always_2d=False
        )
        if (
            getattr(samples, "ndim", None) != 1
            or sample_rate != render_dots.SAMPLE_RATE
            or len(samples) != old_sidecar["audio"]["frames"]
            or render_dots.sha256_file(old_wav_path)
            != old_sidecar["audio"]["sha256"]
        ):
            raise TrimCacheMigrationError(
                f"old render WAV changed or decoded inconsistently: {old_wav_path}"
            )
        try:
            trimmed = render_dots._trim_generated_audio(samples, sample_rate)
        except RuntimeError as error:
            raise TrimCacheMigrationError(
                f"current trim policy rejected old render {old_wav_path}: {error}"
            ) from error
        wav_path = temp / "audio.wav"
        sf.write(
            wav_path,
            trimmed,
            sample_rate,
            format="WAV",
            subtype=render_dots.WAV_SUBTYPE,
        )
        metadata = render_dots._wav_metadata(wav_path)
        sidecar = {
            "schema_version": render_dots.RENDER_CACHE_SCHEMA_VERSION,
            "input_sha256": new_task["input_sha256"],
            "input": copy.deepcopy(new_task["input"]),
            "audio": {
                **metadata,
                "sha256": render_dots.sha256_file(wav_path),
                "duration_seconds": metadata["frames"] / metadata["sample_rate"],
                "peak_gpu_mib": old_sidecar["audio"]["peak_gpu_mib"],
            },
            "runtime": copy.deepcopy(old_sidecar["runtime"]),
        }
        (temp / "render.json").write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        render_dots._atomic_publish_directory(temp, final)
    finally:
        shutil.rmtree(temp, ignore_errors=True)
    try:
        valid = render_dots.validate_cached_task(new_task, outdir)
    except render_dots.RenderContractError as error:
        raise TrimCacheMigrationError(
            f"migrated render failed current cache validation: {error}"
        ) from error
    if not valid:
        raise TrimCacheMigrationError("migrated render disappeared after publication")


def migrate_trim_caches(
    *, old_plan_path: Path, new_plan_path: Path, outdir: Path
) -> dict[str, Any]:
    raw_outdir = outdir.expanduser()
    if raw_outdir.is_symlink() or not raw_outdir.is_dir():
        raise TrimCacheMigrationError(
            f"--outdir must be an existing regular directory: {raw_outdir}"
        )
    outdir = raw_outdir.resolve(strict=True)
    old_plan = _load_content_addressed_plan(
        old_plan_path,
        outdir,
        label="old plan",
        required_sha256=REQUIRED_OLD_PLAN_SHA256,
    )
    new_plan = _load_content_addressed_plan(
        new_plan_path,
        outdir,
        label="new plan",
        required_sha256=REQUIRED_NEW_PLAN_SHA256,
    )
    pairs = validate_plan_pair(old_plan, new_plan)

    # Complete preflight first: a bad source or destination must fail before this
    # command publishes any new cache directory.
    preflight: list[
        tuple[dict[str, Any], dict[str, Any], dict[str, Any], bool]
    ] = []
    for old_task, new_task in pairs:
        old_sidecar = _validate_old_cached_task(old_task, outdir)
        try:
            already_valid = render_dots.validate_cached_task(new_task, outdir)
        except render_dots.RenderContractError as error:
            raise TrimCacheMigrationError(
                f"new cache is present but invalid: {error}"
            ) from error
        preflight.append((old_task, new_task, old_sidecar, already_valid))

    migrated = 0
    skipped = 0
    for old_task, new_task, old_sidecar, already_valid in preflight:
        if already_valid:
            skipped += 1
            continue
        _migrate_one(old_task, new_task, old_sidecar, outdir)
        migrated += 1

    for _, new_task in pairs:
        try:
            valid = render_dots.validate_cached_task(new_task, outdir)
        except render_dots.RenderContractError as error:
            raise TrimCacheMigrationError(
                f"post-migration cache validation failed: {error}"
            ) from error
        if not valid:
            raise TrimCacheMigrationError("post-migration cache is missing")
    return {
        "schema_version": 1,
        "status": "dots-trim-cache-migration-complete",
        "dialogue": new_plan["dialogue"],
        "old_plan_sha256": old_plan["plan_sha256"],
        "new_plan_sha256": new_plan["plan_sha256"],
        "task_count": len(pairs),
        "migrated": migrated,
        "skipped": skipped,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--old-plan", type=Path, required=True)
    parser.add_argument("--new-plan", type=Path, required=True)
    parser.add_argument("--outdir", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = migrate_trim_caches(
            old_plan_path=args.old_plan,
            new_plan_path=args.new_plan,
            outdir=args.outdir,
        )
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except (
        TrimCacheMigrationError,
        render_dots.RenderContractError,
        OSError,
        ValueError,
    ) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
