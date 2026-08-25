#!/usr/bin/env python3
"""Safely prune renderer intermediates after a recording is accepted.

The command is dry by default.  Destructive execution requires a separately
written, content-addressed plan and its expected SHA-256.  Before moving any
directory, execution rebuilds the plan from the accepted recording manifest,
mastering evidence, renderer plan, and current intermediate bytes and requires
exact equality with the reviewed plan.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import stat
import sys
import uuid
from pathlib import Path, PurePosixPath
from typing import Any

from master_audio import (
    MECHANICAL_ACCEPTANCE_REASON,
    PLAN_SCHEMA_VERSION as MASTERING_PLAN_SCHEMA_VERSION,
    PLAN_STATUS as MASTERING_PLAN_STATUS,
    QA_SCHEMA_VERSION as MASTERING_QA_SCHEMA_VERSION,
    QA_STATUS_PASS as MASTERING_QA_STATUS_PASS,
    RESULT_SCHEMA_VERSION as MASTERING_RESULT_SCHEMA_VERSION,
    RESULT_STATUS as MASTERING_RESULT_STATUS,
    _renderer_binding,
)
from render_dots import (
    RenderContractError,
    cache_paths,
    content_sha256,
    load_render_plan_artifact,
    resolve_full_dialogue_assembly,
    sha256_file,
)


PLAN_SCHEMA_VERSION = 1
PLAN_STATUS = "renderer-intermediate-prune-plan"
RECEIPT_SCHEMA_VERSION = 1
RECEIPT_STATUS = "renderer-intermediates-pruned"
JOURNAL_SCHEMA_VERSION = 1
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
DIALOGUE_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PRODUCTION_FIELDS = {
    "screenplay_sha256",
    "qa_sha256",
    "mastering_plan_path",
    "mastering_plan_artifact_sha256",
    "mastering_plan_sha256",
    "mastering_result_path",
    "mastering_result_sha256",
    "mechanical_qa_path",
    "mechanical_qa_sha256",
    "working_master_path",
    "working_master_sha256",
    "publication_path",
    "publication_sha256",
}
PRODUCTION_PATH_FIELDS = {
    "mastering_plan_path",
    "mastering_result_path",
    "mechanical_qa_path",
    "working_master_path",
    "publication_path",
}
PRODUCTION_HASH_FIELDS = PRODUCTION_FIELDS - PRODUCTION_PATH_FIELDS


class PruneContractError(RuntimeError):
    """Raised when accepted evidence or a prune operation is unsafe."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def _content_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_json(value)).hexdigest()


def _pretty_json(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def _sha256(value: Any, location: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise PruneContractError(f"{location}: expected a lowercase SHA-256")
    return value


def _regular_root(path: Path, label: str) -> Path:
    raw = path.expanduser()
    if raw.is_symlink() or not raw.is_dir():
        raise PruneContractError(f"{label} must be a regular directory: {raw}")
    return raw.resolve(strict=True)


def _load_json_object(path: Path, label: str) -> dict[str, Any]:
    if path.is_symlink() or not path.is_file():
        raise PruneContractError(f"{label} must be a regular file: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise PruneContractError(f"cannot parse {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise PruneContractError(f"{label} must contain a JSON object: {path}")
    return value


def _safe_relative(value: Any, location: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value:
        raise PruneContractError(f"{location}: expected a canonical relative path")
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or any(part in {"", ".", ".."} for part in path.parts)
        or str(path) != value
    ):
        raise PruneContractError(f"{location}: expected a canonical relative path")
    return value


def _safe_child(root: Path, relative: str, location: str) -> Path:
    relative = _safe_relative(relative, location)
    candidate = root.joinpath(*PurePosixPath(relative).parts)
    current = root
    for part in PurePosixPath(relative).parts:
        current = current / part
        if current.is_symlink():
            raise PruneContractError(f"{location} traverses a symlink: {current}")
    try:
        candidate.relative_to(root)
    except ValueError as error:
        raise PruneContractError(f"{location} escapes its root") from error
    return candidate


def _stable_file_record(
    path: Path,
    *,
    root: Path,
    root_name: str,
    relative: str,
    expected_sha256: str | None = None,
) -> dict[str, Any]:
    candidate = _safe_child(root, relative, f"{root_name} file")
    if candidate != path:
        raise PruneContractError(f"{root_name} file path binding is inconsistent")
    if candidate.is_symlink() or not candidate.is_file():
        raise PruneContractError(f"preserved file is missing or unsafe: {candidate}")
    before = candidate.stat()
    if not stat.S_ISREG(before.st_mode):
        raise PruneContractError(f"preserved path is not a regular file: {candidate}")
    digest = sha256_file(candidate)
    after = candidate.stat()
    identity_before = (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    )
    identity_after = (
        after.st_dev,
        after.st_ino,
        after.st_size,
        after.st_mtime_ns,
    )
    if identity_before != identity_after:
        raise PruneContractError(f"preserved file changed while hashing: {candidate}")
    if expected_sha256 is not None and digest != _sha256(
        expected_sha256, f"expected hash for {relative}"
    ):
        raise PruneContractError(f"preserved file checksum mismatch: {candidate}")
    return {
        "root": root_name,
        "path": relative,
        "sha256": digest,
        "size_bytes": after.st_size,
    }


def _inventory_directory(
    directory: Path,
    *,
    renderer_outdir: Path,
    kind: str,
) -> dict[str, Any]:
    if directory.is_symlink() or not directory.is_dir():
        raise PruneContractError(f"prune target is missing or unsafe: {directory}")
    try:
        relative = directory.relative_to(renderer_outdir).as_posix()
    except ValueError as error:
        raise PruneContractError(
            f"prune target escapes renderer outdir: {directory}"
        ) from error

    files: list[dict[str, Any]] = []

    def visit(current: Path) -> None:
        for child in sorted(current.iterdir(), key=lambda value: value.name):
            if child.is_symlink():
                raise PruneContractError(f"prune target contains a symlink: {child}")
            mode = child.stat().st_mode
            if stat.S_ISDIR(mode):
                visit(child)
            elif stat.S_ISREG(mode):
                before = child.stat()
                digest = sha256_file(child)
                after = child.stat()
                if (
                    before.st_dev,
                    before.st_ino,
                    before.st_size,
                    before.st_mtime_ns,
                ) != (
                    after.st_dev,
                    after.st_ino,
                    after.st_size,
                    after.st_mtime_ns,
                ):
                    raise PruneContractError(
                        f"prune target changed while hashing: {child}"
                    )
                files.append(
                    {
                        "path": child.relative_to(directory).as_posix(),
                        "sha256": digest,
                        "size_bytes": after.st_size,
                    }
                )
            else:
                raise PruneContractError(
                    f"prune target contains a non-regular entry: {child}"
                )

    visit(directory)
    if not files:
        raise PruneContractError(f"prune target is unexpectedly empty: {directory}")
    return {
        "kind": kind,
        "path": relative,
        "inventory_sha256": _content_sha256(files),
        "size_bytes": sum(item["size_bytes"] for item in files),
        "files": files,
    }


def _validate_file_record(
    record: dict[str, Any],
    roots: dict[str, Path],
) -> None:
    if set(record) != {"root", "path", "sha256", "size_bytes"}:
        raise PruneContractError("preserved file record fields are invalid")
    root_name = record["root"]
    if root_name not in roots:
        raise PruneContractError("preserved file record has an unknown root")
    current = _stable_file_record(
        _safe_child(roots[root_name], record["path"], "preserved file"),
        root=roots[root_name],
        root_name=root_name,
        relative=record["path"],
        expected_sha256=record["sha256"],
    )
    if current != record:
        raise PruneContractError(
            f"preserved file size or checksum changed: {record['path']}"
        )


def _production_path(
    production: dict[str, Any],
    field: str,
    expected: str,
) -> str:
    value = _safe_relative(production.get(field), f"production.{field}")
    if value != expected:
        raise PruneContractError(
            f"production.{field} must be {expected!r}, got {value!r}"
        )
    return value


def _require_mapping(value: Any, location: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise PruneContractError(f"{location} must be an object")
    return value


def _require_list(value: Any, location: str) -> list[Any]:
    if not isinstance(value, list):
        raise PruneContractError(f"{location} must be an array")
    return value


def _validate_mastering_evidence(
    *,
    dialogue: str,
    production: dict[str, Any],
    artifact_root: Path,
    renderer_outdir: Path,
) -> tuple[
    dict[str, Any],
    dict[str, Any],
    dict[str, Any],
    dict[str, Any],
    dict[str, Any],
    list[dict[str, Any]],
]:
    mastering_plan_sha = _sha256(
        production["mastering_plan_sha256"],
        "production.mastering_plan_sha256",
    )
    canonical_paths = {
        "mastering_plan_path": f"plans/{mastering_plan_sha}.json",
        "mastering_result_path": (
            f"artifacts/{mastering_plan_sha}/mastering.json"
        ),
        "mechanical_qa_path": (
            f"artifacts/{mastering_plan_sha}/mechanical-qa.json"
        ),
        "working_master_path": f"artifacts/{mastering_plan_sha}/master.wav",
        "publication_path": (
            f"artifacts/{mastering_plan_sha}/publication.mp3"
        ),
    }
    paths = {
        field: _production_path(production, field, expected)
        for field, expected in canonical_paths.items()
    }
    artifact_hash_fields = {
        "mastering_plan_path": "mastering_plan_artifact_sha256",
        "mastering_result_path": "mastering_result_sha256",
        "mechanical_qa_path": "mechanical_qa_sha256",
        "working_master_path": "working_master_sha256",
        "publication_path": "publication_sha256",
    }
    preserved: list[dict[str, Any]] = []
    for path_field, hash_field in artifact_hash_fields.items():
        relative = paths[path_field]
        preserved.append(
            _stable_file_record(
                _safe_child(artifact_root, relative, path_field),
                root=artifact_root,
                root_name="recording-artifact",
                relative=relative,
                expected_sha256=production[hash_field],
            )
        )

    plan = _load_json_object(
        _safe_child(artifact_root, paths["mastering_plan_path"], "mastering plan"),
        "mastering plan",
    )
    result = _load_json_object(
        _safe_child(
            artifact_root, paths["mastering_result_path"], "mastering result"
        ),
        "mastering result",
    )
    mechanical_qa = _load_json_object(
        _safe_child(artifact_root, paths["mechanical_qa_path"], "mechanical QA"),
        "mechanical QA",
    )
    if (
        plan.get("schema_version") != MASTERING_PLAN_SCHEMA_VERSION
        or plan.get("status") != MASTERING_PLAN_STATUS
        or plan.get("dialogue") != dialogue
        or plan.get("plan_sha256") != mastering_plan_sha
    ):
        raise PruneContractError("mastering plan identity is invalid")
    without_digest = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if content_sha256(without_digest) != mastering_plan_sha:
        raise PruneContractError("mastering plan content address is inconsistent")

    renderer = _require_mapping(plan.get("renderer"), "mastering renderer")
    timeline = _require_list(
        plan.get("chapter_timeline"), "mastering chapter timeline"
    )
    timeline_sha = plan.get("chapter_timeline_sha256")
    render_plan_sha = _sha256(
        renderer.get("render_plan_sha256"), "renderer.render_plan_sha256"
    )
    renderer_plan_relative = f"plans/{render_plan_sha}.json"
    renderer_plan_path = _safe_child(
        renderer_outdir, renderer_plan_relative, "renderer plan"
    )
    renderer_plan_record = _stable_file_record(
        renderer_plan_path,
        root=renderer_outdir,
        root_name="renderer",
        relative=renderer_plan_relative,
        expected_sha256=renderer.get("render_plan_artifact_sha256"),
    )
    try:
        render_plan = load_render_plan_artifact(
            renderer_plan_path,
            expected_sha256=render_plan_sha,
        )
        assembly = resolve_full_dialogue_assembly(render_plan, renderer_outdir)
        expected_renderer, expected_timeline = _renderer_binding(assembly)
    except (RenderContractError, ValueError, OSError) as error:
        raise PruneContractError(
            f"renderer plan or assembly validation failed: {error}"
        ) from error
    expected_renderer["render_plan_artifact_sha256"] = renderer_plan_record[
        "sha256"
    ]
    if (
        renderer != expected_renderer
        or timeline != expected_timeline
        or timeline_sha != content_sha256(expected_timeline)
    ):
        raise PruneContractError(
            "mastering plan does not bind the current renderer assembly"
        )

    common = {
        "dialogue": dialogue,
        "mastering_plan_sha256": mastering_plan_sha,
        "renderer": renderer,
        "chapter_timeline": timeline,
        "chapter_timeline_sha256": timeline_sha,
    }
    if (
        result.get("schema_version") != MASTERING_RESULT_SCHEMA_VERSION
        or result.get("status") != MASTERING_RESULT_STATUS
        or any(result.get(field) != value for field, value in common.items())
        or result.get("mechanical_qa_sha256")
        != production["mechanical_qa_sha256"]
        or result.get("mechanical_passed") is not True
        or result.get("accepted") is not False
    ):
        raise PruneContractError("mastering result evidence is invalid")
    expected_acceptance = {
        "accepted": False,
        "reason": MECHANICAL_ACCEPTANCE_REASON,
    }
    gates = _require_mapping(mechanical_qa.get("gates"), "mechanical QA gates")
    if (
        mechanical_qa.get("schema_version") != MASTERING_QA_SCHEMA_VERSION
        or mechanical_qa.get("status") != MASTERING_QA_STATUS_PASS
        or any(mechanical_qa.get(field) != value for field, value in common.items())
        or mechanical_qa.get("acceptance") != expected_acceptance
        or mechanical_qa.get("asr") != {"status": "not-performed"}
        or mechanical_qa.get("listening") != {"status": "not-performed"}
        or not gates
        or any(value is not True for value in gates.values())
        or gates.get("mechanical_passed") is not True
    ):
        raise PruneContractError("mechanical QA evidence is invalid")
    if result.get("outputs") != mechanical_qa.get("outputs"):
        raise PruneContractError("mastering result and mechanical QA outputs differ")
    outputs = _require_mapping(result.get("outputs"), "mastering outputs")
    working = _require_mapping(outputs.get("working_master"), "working master output")
    publication = _require_mapping(outputs.get("publication"), "publication output")
    if (
        working.get("sha256") != production["working_master_sha256"]
        or publication.get("sha256") != production["publication_sha256"]
    ):
        raise PruneContractError("mastering output hashes differ from production")
    return (
        plan,
        result,
        mechanical_qa,
        render_plan,
        assembly,
        [renderer_plan_record, *preserved],
    )


def build_prune_plan(
    *,
    recording_manifest: Path,
    repo_root: Path,
    renderer_outdir: Path,
    recording_artifact_root: Path,
) -> dict[str, Any]:
    repo_root = _regular_root(repo_root, "repo root")
    renderer_outdir = _regular_root(renderer_outdir, "renderer outdir")
    artifact_root = _regular_root(
        recording_artifact_root, "recording artifact root"
    )
    manifest_path = recording_manifest.expanduser()
    if manifest_path.is_symlink() or not manifest_path.is_file():
        raise PruneContractError(
            f"recording manifest must be a regular file: {manifest_path}"
        )
    manifest_path = manifest_path.resolve(strict=True)
    try:
        manifest_relative = manifest_path.relative_to(repo_root).as_posix()
    except ValueError as error:
        raise PruneContractError("recording manifest escapes repo root") from error
    dialogue = manifest_path.stem
    if (
        DIALOGUE_RE.fullmatch(dialogue) is None
        or manifest_relative != f"wiki/recordings/{dialogue}.json"
    ):
        raise PruneContractError(
            "recording manifest must be canonical wiki/recordings/<dialogue>.json"
        )
    manifest = _load_json_object(manifest_path, "recording manifest")
    if (
        manifest.get("schema_version") != 2
        or manifest.get("status") != "accepted"
        or manifest.get("dialogue") != dialogue
        or not isinstance(manifest.get("recording_id"), str)
        or not manifest["recording_id"]
    ):
        raise PruneContractError("recording manifest is not an accepted schema-v2 record")
    production = _require_mapping(
        manifest.get("production"), "recording production binding"
    )
    if set(production) != PRODUCTION_FIELDS:
        raise PruneContractError("recording production binding fields are invalid")
    for field in PRODUCTION_HASH_FIELDS:
        _sha256(production[field], f"production.{field}")

    screenplay_relative = f"audio/scripts/{dialogue}.json"
    qa_relative = f"audio/qa/{dialogue}.json"
    cast_relative = "audio/cast.json"
    screenplay_path = _safe_child(repo_root, screenplay_relative, "screenplay")
    qa_path = _safe_child(repo_root, qa_relative, "accepted QA")
    cast_path = _safe_child(repo_root, cast_relative, "cast registry")
    screenplay = _load_json_object(screenplay_path, "screenplay")
    accepted_qa = _load_json_object(qa_path, "accepted QA")
    cast = _load_json_object(cast_path, "cast registry")
    del cast
    screenplay_record = _stable_file_record(
        screenplay_path,
        root=repo_root,
        root_name="repo",
        relative=screenplay_relative,
        expected_sha256=production["screenplay_sha256"],
    )
    qa_record = _stable_file_record(
        qa_path,
        root=repo_root,
        root_name="repo",
        relative=qa_relative,
        expected_sha256=production["qa_sha256"],
    )
    cast_record = _stable_file_record(
        cast_path,
        root=repo_root,
        root_name="repo",
        relative=cast_relative,
    )
    manifest_record = _stable_file_record(
        manifest_path,
        root=repo_root,
        root_name="repo",
        relative=manifest_relative,
    )
    if (
        screenplay.get("schema_version") != 2
        or screenplay.get("dialogue") != dialogue
        or screenplay.get("cast_sha256") != cast_record["sha256"]
        or not isinstance(screenplay.get("chapters"), list)
        or not screenplay["chapters"]
    ):
        raise PruneContractError("screenplay identity or cast binding is invalid")
    qa_audio = _require_mapping(accepted_qa.get("audio"), "accepted QA audio")
    if (
        accepted_qa.get("schema_version") != 1
        or accepted_qa.get("status") != "accepted"
        or accepted_qa.get("dialogue") != dialogue
        or accepted_qa.get("script_sha256") != screenplay_record["sha256"]
        or accepted_qa.get("cast_sha256") != cast_record["sha256"]
        or qa_audio.get("master_path") != production["working_master_path"]
        or qa_audio.get("master_sha256") != production["working_master_sha256"]
    ):
        raise PruneContractError("accepted QA identity or source-master binding is invalid")
    audio = _require_mapping(manifest.get("audio"), "recording audio")
    if (
        audio.get("path") != production["publication_path"]
        or audio.get("sha256") != production["publication_sha256"]
        or audio.get("mime_type") != "audio/mpeg"
    ):
        raise PruneContractError("recording audio differs from production publication")

    (
        mastering_plan,
        mastering_result,
        mechanical_qa,
        render_plan,
        assembly,
        artifact_records,
    ) = _validate_mastering_evidence(
        dialogue=dialogue,
        production=production,
        artifact_root=artifact_root,
        renderer_outdir=renderer_outdir,
    )
    del mastering_result, mechanical_qa

    screenplay_chapters = screenplay["chapters"]
    qa_chapters = _require_list(accepted_qa.get("chapters"), "accepted QA chapters")
    manifest_chapters = _require_list(
        manifest.get("chapters"), "recording manifest chapters"
    )
    timeline = mastering_plan["chapter_timeline"]
    if not (
        len(screenplay_chapters)
        == len(qa_chapters)
        == len(manifest_chapters)
        == len(timeline)
    ):
        raise PruneContractError("accepted chapter inventories have different lengths")
    for screenplay_chapter, qa_chapter, manifest_chapter, timeline_item in zip(
        screenplay_chapters,
        qa_chapters,
        manifest_chapters,
        timeline,
        strict=True,
    ):
        if (
            not isinstance(screenplay_chapter, dict)
            or not isinstance(qa_chapter, dict)
            or not isinstance(manifest_chapter, dict)
            or screenplay_chapter.get("id") != qa_chapter.get("chapter_id")
            or screenplay_chapter.get("id") != manifest_chapter.get("chapter_id")
            or screenplay_chapter.get("id") != timeline_item.get("chapter_id")
            or screenplay_chapter.get("commentary_id")
            != manifest_chapter.get("commentary_id")
            or manifest_chapter.get("start_frame")
            != timeline_item.get("start_frame")
        ):
            raise PruneContractError("accepted chapter binding is inconsistent")

    targets: list[dict[str, Any]] = []
    seen: set[Path] = set()
    for task in render_plan["tasks"]:
        directory, _, _ = cache_paths(renderer_outdir, task["input_sha256"])
        if directory in seen:
            raise PruneContractError("renderer plan contains a duplicate cache target")
        seen.add(directory)
        targets.append(
            _inventory_directory(
                directory,
                renderer_outdir=renderer_outdir,
                kind="task-cache",
            )
        )
    for chapter in assembly["chapters"]:
        directory = Path(chapter["audio_path"]).parent
        if directory in seen:
            raise PruneContractError("renderer assembly target is duplicated")
        seen.add(directory)
        targets.append(
            _inventory_directory(
                directory,
                renderer_outdir=renderer_outdir,
                kind="chapter-assembly",
            )
        )
    complete_directory = Path(assembly["complete"]["audio_path"]).parent
    if complete_directory in seen:
        raise PruneContractError("renderer complete target is duplicated")
    targets.append(
        _inventory_directory(
            complete_directory,
            renderer_outdir=renderer_outdir,
            kind="complete-assembly",
        )
    )
    target_paths = [PurePosixPath(item["path"]) for item in targets]
    for index, path in enumerate(target_paths):
        for other in target_paths[index + 1 :]:
            if path in other.parents or other in path.parents:
                raise PruneContractError("prune targets overlap")

    preserved = [
        manifest_record,
        screenplay_record,
        qa_record,
        cast_record,
        *artifact_records,
    ]
    preserved_keys = {(item["root"], item["path"]) for item in preserved}
    if len(preserved_keys) != len(preserved):
        raise PruneContractError("preserved file inventory contains duplicates")
    plan = {
        "schema_version": PLAN_SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "plan_sha256": "",
        "dialogue": dialogue,
        "bindings": {
            "repo_root": str(repo_root),
            "renderer_outdir": str(renderer_outdir),
            "recording_artifact_root": str(artifact_root),
            "recording_manifest": manifest_record,
        },
        "accepted_recording": {
            "recording_id": manifest["recording_id"],
            "production": production,
            "render_plan_sha256": render_plan["plan_sha256"],
            "mastering_plan_sha256": mastering_plan["plan_sha256"],
        },
        "preserved": preserved,
        "targets": targets,
        "prunable_bytes": sum(item["size_bytes"] for item in targets),
    }
    plan["plan_sha256"] = _content_sha256(
        {key: value for key, value in plan.items() if key != "plan_sha256"}
    )
    validate_prune_plan(plan)
    return plan


def validate_prune_plan(plan: dict[str, Any]) -> None:
    if set(plan) != {
        "schema_version",
        "status",
        "plan_sha256",
        "dialogue",
        "bindings",
        "accepted_recording",
        "preserved",
        "targets",
        "prunable_bytes",
    }:
        raise PruneContractError("prune plan fields are invalid")
    if (
        plan["schema_version"] != PLAN_SCHEMA_VERSION
        or plan["status"] != PLAN_STATUS
        or not isinstance(plan["dialogue"], str)
        or DIALOGUE_RE.fullmatch(plan["dialogue"]) is None
    ):
        raise PruneContractError("prune plan identity is invalid")
    digest = _sha256(plan["plan_sha256"], "prune plan SHA-256")
    without_digest = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if _content_sha256(without_digest) != digest:
        raise PruneContractError("prune plan content address is inconsistent")
    bindings = _require_mapping(plan["bindings"], "prune plan bindings")
    if set(bindings) != {
        "repo_root",
        "renderer_outdir",
        "recording_artifact_root",
        "recording_manifest",
    } or any(
        not isinstance(bindings[field], str) or not Path(bindings[field]).is_absolute()
        for field in ("repo_root", "renderer_outdir", "recording_artifact_root")
    ):
        raise PruneContractError("prune plan root bindings are invalid")
    preserved = _require_list(plan["preserved"], "prune plan preserved files")
    targets = _require_list(plan["targets"], "prune plan targets")
    if not preserved or not targets:
        raise PruneContractError("prune plan inventories must be non-empty")
    for target in targets:
        if not isinstance(target, dict) or set(target) != {
            "kind",
            "path",
            "inventory_sha256",
            "size_bytes",
            "files",
        }:
            raise PruneContractError("prune target fields are invalid")
        _safe_relative(target["path"], "prune target path")
        _sha256(target["inventory_sha256"], "prune target inventory SHA-256")
        files = _require_list(target["files"], "prune target files")
        if (
            not files
            or _content_sha256(files) != target["inventory_sha256"]
            or sum(item.get("size_bytes", -1) for item in files)
            != target["size_bytes"]
        ):
            raise PruneContractError("prune target inventory is inconsistent")
    if (
        isinstance(plan["prunable_bytes"], bool)
        or not isinstance(plan["prunable_bytes"], int)
        or plan["prunable_bytes"] <= 0
        or sum(item["size_bytes"] for item in targets) != plan["prunable_bytes"]
    ):
        raise PruneContractError("prune plan byte total is invalid")


def _ensure_directory(root: Path, directory: Path) -> None:
    try:
        relative = directory.relative_to(root)
    except ValueError as error:
        raise PruneContractError(f"directory escapes its allowed root: {directory}") from error
    current = root
    for part in relative.parts:
        current = current / part
        if current.is_symlink():
            raise PruneContractError(f"directory chain contains a symlink: {current}")
        if current.exists():
            if not current.is_dir():
                raise PruneContractError(
                    f"directory chain contains a non-directory: {current}"
                )
        else:
            current.mkdir()


def _atomic_write(path: Path, payload: bytes, *, root: Path) -> None:
    _ensure_directory(root, path.parent)
    temporary = path.parent / f".{path.name}.{uuid.uuid4().hex}.tmp"
    if temporary.exists() or temporary.is_symlink():
        raise PruneContractError(
            f"exclusive temporary path already exists: {temporary}"
        )
    try:
        with temporary.open("xb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary.exists() and not temporary.is_symlink():
            temporary.unlink()


def _receipt_root(renderer_outdir: Path, requested: Path | None) -> Path:
    raw = requested.expanduser() if requested is not None else renderer_outdir / "pruning"
    if raw.is_symlink() or (raw.exists() and not raw.is_dir()):
        raise PruneContractError("receipt root must be a regular directory path")
    resolved = raw.resolve(strict=False)
    try:
        resolved.relative_to(renderer_outdir)
    except ValueError as error:
        raise PruneContractError(
            "receipt root must be inside renderer outdir"
        ) from error
    return resolved


def prune_plan_path(receipt_root: Path, plan_sha256: str) -> Path:
    return receipt_root / "plans" / f"{_sha256(plan_sha256, 'plan SHA-256')}.json"


def prune_receipt_path(
    receipt_root: Path, dialogue: str, plan_sha256: str
) -> Path:
    return (
        receipt_root
        / "receipts"
        / dialogue
        / f"{_sha256(plan_sha256, 'plan SHA-256')}.json"
    )


def write_prune_plan(
    plan: dict[str, Any],
    *,
    renderer_outdir: Path,
    receipt_root: Path,
) -> Path:
    validate_prune_plan(plan)
    renderer_outdir = _regular_root(renderer_outdir, "renderer outdir")
    receipt_root = _receipt_root(renderer_outdir, receipt_root)
    _ensure_directory(renderer_outdir, receipt_root)
    path = prune_plan_path(receipt_root, plan["plan_sha256"])
    payload = _pretty_json(plan)
    if path.exists() or path.is_symlink():
        if path.is_symlink() or not path.is_file() or path.read_bytes() != payload:
            raise PruneContractError(f"content-addressed prune plan is corrupt: {path}")
        return path
    _atomic_write(path, payload, root=receipt_root)
    return path


def load_prune_plan(
    path: Path,
    *,
    expected_sha256: str,
    receipt_root: Path,
) -> dict[str, Any]:
    expected = _sha256(expected_sha256, "expected prune plan SHA-256")
    if receipt_root.is_symlink() or not receipt_root.is_dir():
        raise PruneContractError("receipt root must be a regular directory")
    receipt_root = receipt_root.resolve(strict=True)
    if path.is_symlink() or not path.is_file():
        raise PruneContractError(f"prune plan must be a regular file: {path}")
    path = path.resolve(strict=True)
    expected_path = prune_plan_path(receipt_root, expected)
    if path != expected_path:
        raise PruneContractError(
            "prune plan is not at its canonical content-addressed path"
        )
    plan = _load_json_object(path, "prune plan")
    validate_prune_plan(plan)
    if plan["plan_sha256"] != expected:
        raise PruneContractError("prune plan does not match expected SHA-256")
    return plan


def _journal_payload(plan: dict[str, Any], phase: str) -> dict[str, Any]:
    return {
        "schema_version": JOURNAL_SCHEMA_VERSION,
        "status": phase,
        "plan_sha256": plan["plan_sha256"],
        "dialogue": plan["dialogue"],
        "targets": [item["path"] for item in plan["targets"]],
    }


def _write_journal(
    path: Path,
    plan: dict[str, Any],
    phase: str,
    *,
    receipt_root: Path,
) -> None:
    _atomic_write(path, _pretty_json(_journal_payload(plan, phase)), root=receipt_root)


def _validate_existing_receipt(
    receipt: dict[str, Any],
    plan: dict[str, Any],
    roots: dict[str, Path],
) -> None:
    digest = receipt.get("receipt_sha256")
    if (
        receipt.get("schema_version") != RECEIPT_SCHEMA_VERSION
        or receipt.get("status") != RECEIPT_STATUS
        or receipt.get("prune_plan_sha256") != plan["plan_sha256"]
        or receipt.get("dialogue") != plan["dialogue"]
        or receipt.get("accepted_recording_preserved") is not True
        or receipt.get("pruned_targets") != plan["targets"]
        or receipt.get("pruned_bytes") != plan["prunable_bytes"]
        or receipt.get("preserved") != plan["preserved"]
        or not isinstance(digest, str)
    ):
        raise PruneContractError("pruning receipt is invalid")
    without_digest = {
        key: value for key, value in receipt.items() if key != "receipt_sha256"
    }
    if _content_sha256(without_digest) != _sha256(
        digest, "pruning receipt SHA-256"
    ):
        raise PruneContractError("pruning receipt content address is inconsistent")
    for record in plan["preserved"]:
        _validate_file_record(record, roots)
    renderer_root = roots["renderer"]
    for target in plan["targets"]:
        path = _safe_child(renderer_root, target["path"], "pruned target")
        if path.exists() or path.is_symlink():
            raise PruneContractError(
                f"receipt exists but renderer target remains: {path}"
            )


def execute_prune_plan(
    saved_plan: dict[str, Any],
    *,
    recording_manifest: Path,
    repo_root: Path,
    renderer_outdir: Path,
    recording_artifact_root: Path,
    receipt_root: Path,
) -> tuple[dict[str, Any], bool]:
    validate_prune_plan(saved_plan)
    repo_root = _regular_root(repo_root, "repo root")
    renderer_outdir = _regular_root(renderer_outdir, "renderer outdir")
    artifact_root = _regular_root(
        recording_artifact_root, "recording artifact root"
    )
    receipt_root = _receipt_root(renderer_outdir, receipt_root)
    _ensure_directory(renderer_outdir, receipt_root)
    bindings = saved_plan["bindings"]
    if (
        bindings.get("repo_root") != str(repo_root)
        or bindings.get("renderer_outdir") != str(renderer_outdir)
        or bindings.get("recording_artifact_root") != str(artifact_root)
    ):
        raise PruneContractError("execution roots differ from reviewed prune plan")
    roots = {
        "repo": repo_root,
        "renderer": renderer_outdir,
        "recording-artifact": artifact_root,
    }
    receipt_path = prune_receipt_path(
        receipt_root, saved_plan["dialogue"], saved_plan["plan_sha256"]
    )
    journal_path = receipt_root / "in-progress" / f"{saved_plan['plan_sha256']}.json"
    quarantine_root = receipt_root / "quarantine" / saved_plan["plan_sha256"]

    if receipt_path.exists() or receipt_path.is_symlink():
        receipt = _load_json_object(receipt_path, "pruning receipt")
        _validate_existing_receipt(receipt, saved_plan, roots)
        if quarantine_root.exists():
            if quarantine_root.is_symlink() or not quarantine_root.is_dir():
                raise PruneContractError("pruning quarantine is unsafe")
            shutil.rmtree(quarantine_root)
        if journal_path.exists():
            if journal_path.is_symlink() or not journal_path.is_file():
                raise PruneContractError("pruning journal is unsafe")
            journal_path.unlink()
        return receipt, False

    if journal_path.exists() or journal_path.is_symlink():
        journal = _load_json_object(journal_path, "pruning journal")
        prepared = _journal_payload(saved_plan, "prepared")
        quarantined = _journal_payload(saved_plan, "all-quarantined")
        if journal not in (prepared, quarantined):
            raise PruneContractError("pruning journal differs from reviewed plan")
        phase = journal["status"]
    else:
        current_plan = build_prune_plan(
            recording_manifest=recording_manifest,
            repo_root=repo_root,
            renderer_outdir=renderer_outdir,
            recording_artifact_root=artifact_root,
        )
        if current_plan != saved_plan:
            raise PruneContractError(
                "current accepted evidence or renderer inventory differs from reviewed plan"
            )
        for record in saved_plan["preserved"]:
            _validate_file_record(record, roots)
        _write_journal(
            journal_path, saved_plan, "prepared", receipt_root=receipt_root
        )
        phase = "prepared"

    for record in saved_plan["preserved"]:
        _validate_file_record(record, roots)
    _ensure_directory(receipt_root, quarantine_root)
    if phase == "prepared":
        for index, target in enumerate(saved_plan["targets"]):
            source = _safe_child(renderer_outdir, target["path"], "prune target")
            quarantine = quarantine_root / f"{index:06d}"
            if source.exists() and quarantine.exists():
                raise PruneContractError(
                    f"target exists both live and quarantined: {target['path']}"
                )
            if source.exists():
                current = _inventory_directory(
                    source,
                    renderer_outdir=renderer_outdir,
                    kind=target["kind"],
                )
                if current != target:
                    raise PruneContractError(
                        f"target changed before quarantine: {target['path']}"
                    )
                os.replace(source, quarantine)
            elif quarantine.exists():
                current = _inventory_directory(
                    quarantine,
                    renderer_outdir=receipt_root,
                    kind=target["kind"],
                )
                comparable = {
                    **current,
                    "path": target["path"],
                }
                if comparable != target:
                    raise PruneContractError(
                        f"quarantined target differs from plan: {target['path']}"
                    )
            else:
                raise PruneContractError(
                    f"target disappeared before quarantine: {target['path']}"
                )
        _write_journal(
            journal_path,
            saved_plan,
            "all-quarantined",
            receipt_root=receipt_root,
        )

    for index, target in enumerate(saved_plan["targets"]):
        source = _safe_child(renderer_outdir, target["path"], "pruned target")
        quarantine = quarantine_root / f"{index:06d}"
        if source.exists() or source.is_symlink():
            raise PruneContractError(
                f"renderer target returned after quarantine: {target['path']}"
            )
        if quarantine.exists():
            if quarantine.is_symlink() or not quarantine.is_dir():
                raise PruneContractError("quarantined target is unsafe")
            shutil.rmtree(quarantine)
    for record in saved_plan["preserved"]:
        _validate_file_record(record, roots)

    receipt = {
        "schema_version": RECEIPT_SCHEMA_VERSION,
        "status": RECEIPT_STATUS,
        "receipt_sha256": "",
        "prune_plan_sha256": saved_plan["plan_sha256"],
        "dialogue": saved_plan["dialogue"],
        "pruned_targets": saved_plan["targets"],
        "pruned_bytes": saved_plan["prunable_bytes"],
        "preserved": saved_plan["preserved"],
        "accepted_recording_preserved": True,
    }
    receipt["receipt_sha256"] = _content_sha256(
        {key: value for key, value in receipt.items() if key != "receipt_sha256"}
    )
    _atomic_write(receipt_path, _pretty_json(receipt), root=receipt_root)
    if journal_path.exists():
        journal_path.unlink()
    if quarantine_root.exists():
        quarantine_root.rmdir()
    return receipt, True


def _summary(plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": PLAN_SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "plan_sha256": plan["plan_sha256"],
        "dialogue": plan["dialogue"],
        "target_count": len(plan["targets"]),
        "prunable_bytes": plan["prunable_bytes"],
        "preserved_file_count": len(plan["preserved"]),
        "targets": [
            {
                "kind": target["kind"],
                "path": target["path"],
                "size_bytes": target["size_bytes"],
                "inventory_sha256": target["inventory_sha256"],
            }
            for target in plan["targets"]
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--recording-manifest", type=Path, required=True)
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[2],
    )
    parser.add_argument("--renderer-outdir", type=Path, required=True)
    parser.add_argument("--recording-artifact-root", type=Path, required=True)
    parser.add_argument("--receipt-root", type=Path)
    parser.add_argument("--write-plan", action="store_true")
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--execute-plan", type=Path)
    parser.add_argument("--expected-plan-sha256")
    args = parser.parse_args()
    try:
        repo_root = _regular_root(args.repo_root, "repo root")
        renderer_outdir = _regular_root(
            args.renderer_outdir, "renderer outdir"
        )
        artifact_root = _regular_root(
            args.recording_artifact_root, "recording artifact root"
        )
        receipt_root = _receipt_root(renderer_outdir, args.receipt_root)
        if not args.execute:
            if args.execute_plan is not None or args.expected_plan_sha256 is not None:
                raise PruneContractError(
                    "--execute-plan and --expected-plan-sha256 require --execute"
                )
            plan = build_prune_plan(
                recording_manifest=args.recording_manifest,
                repo_root=repo_root,
                renderer_outdir=renderer_outdir,
                recording_artifact_root=artifact_root,
            )
            result = _summary(plan)
            if args.write_plan:
                result["plan_path"] = str(
                    write_prune_plan(
                        plan,
                        renderer_outdir=renderer_outdir,
                        receipt_root=receipt_root,
                    )
                )
            print(json.dumps(result, indent=2, sort_keys=True))
            return 0

        if args.write_plan:
            raise PruneContractError(
                "--write-plan and --execute are separate operations"
            )
        if args.execute_plan is None or args.expected_plan_sha256 is None:
            raise PruneContractError(
                "--execute requires --execute-plan and --expected-plan-sha256"
            )
        if not receipt_root.exists():
            raise PruneContractError("receipt root does not contain a reviewed plan")
        saved_plan = load_prune_plan(
            args.execute_plan.expanduser(),
            expected_sha256=args.expected_plan_sha256,
            receipt_root=receipt_root,
        )
        receipt, created = execute_prune_plan(
            saved_plan,
            recording_manifest=args.recording_manifest,
            repo_root=repo_root,
            renderer_outdir=renderer_outdir,
            recording_artifact_root=artifact_root,
            receipt_root=receipt_root,
        )
        print(
            json.dumps(
                {
                    "schema_version": RECEIPT_SCHEMA_VERSION,
                    "status": receipt["status"],
                    "dialogue": receipt["dialogue"],
                    "plan_sha256": receipt["prune_plan_sha256"],
                    "receipt_sha256": receipt["receipt_sha256"],
                    "receipt_path": str(
                        prune_receipt_path(
                            receipt_root,
                            receipt["dialogue"],
                            receipt["prune_plan_sha256"],
                        )
                    ),
                    "pruned_bytes": receipt["pruned_bytes"],
                    "created": created,
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 0
    except (PruneContractError, RenderContractError, OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
