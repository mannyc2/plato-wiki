#!/usr/bin/env python3
"""Reuse exact Dots audio across the pinned renderer-v4 to v5 repair cutover.

Renderer v5 binds two exact Lesser Hippias fragment plans and one case-only
synthesis spelling. The canonical screenplay text and ordinary 320-character
ceiling do not change. This one-policy migration republishes an old cache only
when the canonical target, entry spans, voice, reference, inference settings,
trim policy, runtime, and every other synthesis input are byte-for-byte
identical after adding the v5 renderer evidence and an unchanged
``synthesis_text``. Units touched by either exact repair remain absent and must
be synthesized normally.
"""

from __future__ import annotations

import argparse
import copy
import json
import shutil
import sys
import uuid
from pathlib import Path
from typing import Any

import render_dots
from migrate_trim_cache import (
    TrimCacheMigrationError,
    _load_content_addressed_plan,
    _validate_old_cached_task,
    _validate_task_content_address,
)


OLD_RENDERER_VERSION = 4
NEW_RENDERER_VERSION = 5
OLD_CHUNK_CEILING = 320
NEW_CHUNK_CEILING = 320
REQUIRED_OLD_PLAN_SHA256 = (
    "e730b3c356be41a4983105362015d13928bdf962636fcdb7a86295681a1b8b01"
)
REQUIRED_OLD_CODE_SHA256 = (
    "437fbcd6ef57418015b2677659a39905d9b623a5ef0c685b2a97b4df21ec173d"
)
REQUIRED_NEW_CODE_SHA256 = (
    "02f372e145887c5976f0e3ece2214dee055985561d28d08d0d40537cb4ca5b50"
)
REQUIRED_OLD_HARNESS_SHA256 = (
    "40557dc91eb5600432dc9c2d3b2e4f9b4697ef79063356b9ef0860516d7ae65a"
)
REQUIRED_NEW_HARNESS_SHA256 = (
    "193d083884a7af305f65efe4d2fcae077b7b44a8d44890b10503f52fa11a0038"
)


class ChunkCeilingMigrationError(RuntimeError):
    """Raised when exact cache reuse across the ceiling cutover is unproven."""


def _normalized_old_input(task_input: dict[str, Any]) -> dict[str, Any]:
    normalized = copy.deepcopy(task_input)
    try:
        renderer = normalized["renderer"]
        renderer["version"] = NEW_RENDERER_VERSION
        renderer["code_sha256"] = REQUIRED_NEW_CODE_SHA256
        renderer["max_render_unit_characters"] = NEW_CHUNK_CEILING
        renderer["entry_chunk_overrides"] = copy.deepcopy(
            render_dots.ENTRY_CHUNK_OVERRIDES
        )
        renderer["synthesis_text_overrides"] = copy.deepcopy(
            render_dots.SYNTHESIS_TEXT_OVERRIDES
        )
        utterance = normalized["utterance"]
        utterance["synthesis_text"] = utterance["text"]
    except (KeyError, TypeError) as error:
        raise ChunkCeilingMigrationError(
            "old task lacks renderer ceiling migration evidence"
        ) from error
    return normalized


def _renderer_identity(task: dict[str, Any], *, old: bool, location: str) -> None:
    try:
        renderer = task["input"]["renderer"]
    except (KeyError, TypeError) as error:
        raise ChunkCeilingMigrationError(
            f"{location} lacks renderer identity"
        ) from error
    expected_version = OLD_RENDERER_VERSION if old else NEW_RENDERER_VERSION
    expected_ceiling = OLD_CHUNK_CEILING if old else NEW_CHUNK_CEILING
    expected_code = (
        REQUIRED_OLD_CODE_SHA256 if old else REQUIRED_NEW_CODE_SHA256
    )
    if (
        renderer.get("version") != expected_version
        or renderer.get("max_render_unit_characters") != expected_ceiling
        or renderer.get("code_sha256") != expected_code
    ):
        raise ChunkCeilingMigrationError(
            f"{location} is not the pinned renderer ceiling identity"
        )
    if old:
        if {
            "entry_chunk_overrides",
            "synthesis_text_overrides",
        } & renderer.keys():
            raise ChunkCeilingMigrationError(
                f"{location} unexpectedly contains v5 entry overrides"
            )
        if "synthesis_text" in task["input"].get("utterance", {}):
            raise ChunkCeilingMigrationError(
                f"{location} unexpectedly contains v5 synthesis text"
            )
    elif (
        renderer.get("entry_chunk_overrides")
        != render_dots.ENTRY_CHUNK_OVERRIDES
        or renderer.get("synthesis_text_overrides")
        != render_dots.SYNTHESIS_TEXT_OVERRIDES
    ):
        raise ChunkCeilingMigrationError(
            f"{location} does not bind the pinned entry overrides"
        )


def reusable_pairs(
    old_plan: dict[str, Any], new_plan: dict[str, Any]
) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    """Return old/new tasks whose synthesis inputs are provably unchanged."""

    try:
        render_dots.validate_render_plan(new_plan)
    except render_dots.RenderContractError as error:
        raise ChunkCeilingMigrationError(f"new plan is not current: {error}") from error
    if (
        render_dots.RENDERER_VERSION != NEW_RENDERER_VERSION
        or render_dots.MAX_CHUNK_CHARACTERS != NEW_CHUNK_CEILING
        or render_dots.sha256_file(Path(render_dots.__file__).resolve())
        != REQUIRED_NEW_CODE_SHA256
    ):
        raise ChunkCeilingMigrationError(
            "migration requires the exact current renderer-v5 implementation"
        )

    old_evidence = {
        key: copy.deepcopy(value)
        for key, value in old_plan.items()
        if key not in {"plan_sha256", "tasks"}
    }
    new_evidence = {
        key: copy.deepcopy(value)
        for key, value in new_plan.items()
        if key not in {"plan_sha256", "tasks"}
    }
    # The pinned plans straddle one already-reviewed harness TypeScript tree
    # update. It affects validation provenance, not any synthesis input. Permit
    # only that exact hash transition and normalize it before comparing the
    # remaining top-level evidence.
    for validation_key in (
        "commentary_quality_validation",
        "screenplay_validation",
    ):
        try:
            old_hash = old_evidence["acceptance"][validation_key][
                "harness_typescript_sha256"
            ]
            new_hash = new_evidence["acceptance"][validation_key][
                "harness_typescript_sha256"
            ]
        except (KeyError, TypeError) as error:
            raise ChunkCeilingMigrationError(
                "plans lack validation provenance"
            ) from error
        if old_hash == new_hash:
            continue
        if (
            old_hash != REQUIRED_OLD_HARNESS_SHA256
            or new_hash != REQUIRED_NEW_HARNESS_SHA256
        ):
            raise ChunkCeilingMigrationError(
                "plans contain an unpinned harness validation transition"
            )
        old_evidence["acceptance"][validation_key][
            "harness_typescript_sha256"
        ] = new_hash
    if render_dots.canonical_json(old_evidence) != render_dots.canonical_json(
        new_evidence
    ):
        raise ChunkCeilingMigrationError(
            "plans differ outside their task graph and content address"
        )

    old_tasks = old_plan.get("tasks")
    new_tasks = new_plan.get("tasks")
    if (
        not isinstance(old_tasks, list)
        or not old_tasks
        or not isinstance(new_tasks, list)
        or not new_tasks
    ):
        raise ChunkCeilingMigrationError("render plans must contain tasks")

    indexed: dict[bytes, list[dict[str, Any]]] = {}
    for order, raw_task in enumerate(old_tasks):
        task = _validate_task_content_address(
            raw_task, expected_order=order, location=f"old task {order}"
        )
        _renderer_identity(task, old=True, location=f"old task {order}")
        key = render_dots.canonical_json(_normalized_old_input(task["input"]))
        indexed.setdefault(key, []).append(task)

    pairs: list[tuple[dict[str, Any], dict[str, Any]]] = []
    reused_old: set[str] = set()
    for order, raw_task in enumerate(new_tasks):
        task = _validate_task_content_address(
            raw_task, expected_order=order, location=f"new task {order}"
        )
        _renderer_identity(task, old=False, location=f"new task {order}")
        matches = indexed.get(render_dots.canonical_json(task["input"]), [])
        matches = [
            old
            for old in matches
            if old["reference_path"] == task["reference_path"]
            and old["input_sha256"] not in reused_old
        ]
        if not matches:
            continue
        if len(matches) != 1:
            raise ChunkCeilingMigrationError(
                f"new task {order} has an ambiguous old cache match"
            )
        old = matches[0]
        reused_old.add(old["input_sha256"])
        pairs.append((old, task))
    if not pairs or len(pairs) >= len(new_tasks):
        raise ChunkCeilingMigrationError(
            "pinned ceiling cutover must reuse some tasks and rerender some tasks"
        )
    return pairs


def _publish_readdressed_cache(
    old_task: dict[str, Any],
    new_task: dict[str, Any],
    old_sidecar: dict[str, Any],
    outdir: Path,
) -> None:
    _, old_wav, _ = render_dots.cache_paths(outdir, old_task["input_sha256"])
    final, _, _ = render_dots.cache_paths(outdir, new_task["input_sha256"])
    render_dots._validate_output_directory_chain(outdir, final.parent)
    final.parent.mkdir(parents=True, exist_ok=True)
    temporary = final.parent / f".{new_task['input_sha256']}.{uuid.uuid4().hex}.tmp"
    if temporary.exists() or temporary.is_symlink():
        raise ChunkCeilingMigrationError(
            f"migration temporary path already exists: {temporary}"
        )
    temporary.mkdir()
    try:
        copied_wav = temporary / "audio.wav"
        shutil.copyfile(old_wav, copied_wav)
        if render_dots.sha256_file(copied_wav) != old_sidecar["audio"]["sha256"]:
            raise ChunkCeilingMigrationError("copied render WAV hash changed")
        sidecar = {
            "schema_version": render_dots.RENDER_CACHE_SCHEMA_VERSION,
            "input_sha256": new_task["input_sha256"],
            "input": copy.deepcopy(new_task["input"]),
            "audio": copy.deepcopy(old_sidecar["audio"]),
            "runtime": copy.deepcopy(old_sidecar["runtime"]),
        }
        (temporary / "render.json").write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        render_dots._atomic_publish_directory(temporary, final)
    finally:
        shutil.rmtree(temporary, ignore_errors=True)
    try:
        valid = render_dots.validate_cached_task(new_task, outdir)
    except render_dots.RenderContractError as error:
        raise ChunkCeilingMigrationError(
            f"readdressed cache failed current validation: {error}"
        ) from error
    if not valid:
        raise ChunkCeilingMigrationError("readdressed cache disappeared")


def migrate_chunk_ceiling_caches(
    *, old_plan_path: Path, new_plan_path: Path, outdir: Path
) -> dict[str, Any]:
    raw_outdir = outdir.expanduser()
    if raw_outdir.is_symlink() or not raw_outdir.is_dir():
        raise ChunkCeilingMigrationError(
            f"--outdir must be an existing regular directory: {raw_outdir}"
        )
    outdir = raw_outdir.resolve(strict=True)
    try:
        old_plan = _load_content_addressed_plan(
            old_plan_path,
            outdir,
            label="old plan",
            required_sha256=REQUIRED_OLD_PLAN_SHA256,
        )
        new_plan_sha256 = render_dots._sha256(
            new_plan_path.expanduser().stem,
            "new plan filename SHA-256",
        )
        new_plan = _load_content_addressed_plan(
            new_plan_path,
            outdir,
            label="new plan",
            required_sha256=new_plan_sha256,
        )
    except TrimCacheMigrationError as error:
        raise ChunkCeilingMigrationError(str(error)) from error
    pairs = reusable_pairs(old_plan, new_plan)

    preflight: list[
        tuple[dict[str, Any], dict[str, Any], dict[str, Any], bool]
    ] = []
    for old_task, new_task in pairs:
        try:
            old_sidecar = _validate_old_cached_task(old_task, outdir)
            already_valid = render_dots.validate_cached_task(new_task, outdir)
        except (TrimCacheMigrationError, render_dots.RenderContractError) as error:
            raise ChunkCeilingMigrationError(str(error)) from error
        preflight.append((old_task, new_task, old_sidecar, already_valid))

    migrated = 0
    skipped = 0
    for old_task, new_task, old_sidecar, already_valid in preflight:
        if already_valid:
            skipped += 1
            continue
        _publish_readdressed_cache(old_task, new_task, old_sidecar, outdir)
        migrated += 1

    for _, new_task in pairs:
        try:
            valid = render_dots.validate_cached_task(new_task, outdir)
        except render_dots.RenderContractError as error:
            raise ChunkCeilingMigrationError(str(error)) from error
        if not valid:
            raise ChunkCeilingMigrationError("post-migration cache is missing")
    return {
        "schema_version": 1,
        "status": "dots-targeted-repair-cache-migration-complete",
        "dialogue": new_plan["dialogue"],
        "old_plan_sha256": old_plan["plan_sha256"],
        "new_plan_sha256": new_plan["plan_sha256"],
        "old_task_count": len(old_plan["tasks"]),
        "new_task_count": len(new_plan["tasks"]),
        "reusable_task_count": len(pairs),
        "rerender_task_count": len(new_plan["tasks"]) - len(pairs),
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
        result = migrate_chunk_ceiling_caches(
            old_plan_path=args.old_plan,
            new_plan_path=args.new_plan,
            outdir=args.outdir,
        )
        print(json.dumps(result, indent=2, sort_keys=True))
        return 0
    except (
        ChunkCeilingMigrationError,
        render_dots.RenderContractError,
        OSError,
        ValueError,
    ) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
