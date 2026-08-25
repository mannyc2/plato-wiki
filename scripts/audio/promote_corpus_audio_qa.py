#!/usr/bin/env python3
"""Preflight and promote the complete accepted Plato audio corpus.

The input is an explicit, hash-bound index over every canonical dialogue.  A
dry run rebuilds every single-dialogue promotion plan and emits one corpus plan
SHA-256.  Execution requires that reviewed corpus SHA, promotes serially, runs
the repository validator once after all records exist, and removes every file
created by the batch if any dialogue or the final validator fails.

This command does not create production-acceptance reviews and cannot infer
acceptance. Each review must explicitly record either completed listening or
an operator-authorized listening waiver.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable, Sequence

import promote_audio_qa as promotion


SCHEMA_VERSION = 2
EXPECTED_DIALOGUE_COUNT = 27
INDEX_STATUS = "corpus-audio-qa-handoffs-complete-unaccepted"
PLAN_STATUS = "complete-corpus-audio-promotion-plan"
RESULT_STATUS = "complete-corpus-audio-promoted"
IMPLEMENTATION_NAME = "plato-corpus-audio-qa-promoter"
IMPLEMENTATION_VERSION = 2


class CorpusPromotionError(ValueError):
    """Raised when a complete-corpus promotion cannot proceed safely."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(4 * 1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def implementation_identity() -> dict[str, Any]:
    source = Path(__file__).resolve(strict=True)
    return {
        "name": IMPLEMENTATION_NAME,
        "version": IMPLEMENTATION_VERSION,
        "code_path": str(source),
        "code_sha256": sha256_file(source),
    }


def _load_json(path: Path, label: str) -> dict[str, Any]:
    if path.is_symlink() or not path.is_file():
        raise CorpusPromotionError(f"{label} must be a regular file: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusPromotionError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise CorpusPromotionError(f"{label} must be a JSON object: {path}")
    return value


def _absolute_directory(path: Path, label: str) -> Path:
    if not path.is_absolute() or path.is_symlink() or not path.is_dir():
        raise CorpusPromotionError(
            f"{label} must be an existing absolute non-symlink directory: {path}"
        )
    return path.resolve(strict=True)


def _safe_child(root: Path, relative: str, label: str) -> Path:
    if (
        not isinstance(relative, str)
        or not relative
        or "\\" in relative
        or Path(relative).is_absolute()
        or Path(relative).as_posix() != relative
        or "." in Path(relative).parts
        or ".." in Path(relative).parts
    ):
        raise CorpusPromotionError(f"{label} is not a canonical relative path")
    target = root.joinpath(*Path(relative).parts)
    cursor = target.parent
    while cursor != root:
        if cursor.exists() and cursor.is_symlink():
            raise CorpusPromotionError(f"{label} escapes through a symlink: {cursor}")
        cursor = cursor.parent
    return target


def _catalog_dialogues(repo_root: Path) -> tuple[tuple[str, ...], str]:
    path = repo_root / "audio/characters.json"
    catalog = _load_json(path, "character catalog")
    rows = catalog.get("dialogues")
    if (
        catalog.get("schemaVersion") != 3
        or catalog.get("status") != "complete"
        or not isinstance(rows, list)
    ):
        raise CorpusPromotionError("character catalog is not complete schema v3")
    dialogues = tuple(
        row.get("dialogue") if isinstance(row, dict) else None for row in rows
    )
    if (
        len(dialogues) != EXPECTED_DIALOGUE_COUNT
        or any(
            not isinstance(dialogue, str)
            or promotion.DIALOGUE_RE.fullmatch(dialogue) is None
            for dialogue in dialogues
        )
        or dialogues != tuple(sorted(dialogues))
        or len(set(dialogues)) != len(dialogues)
    ):
        raise CorpusPromotionError(
            f"character catalog must contain exactly {EXPECTED_DIALOGUE_COUNT} sorted unique dialogues"
        )
    return dialogues, sha256_file(path)


def _validate_index(
    value: dict[str, Any], expected_dialogues: Sequence[str]
) -> list[dict[str, Any]]:
    fields = {
        "schema_version",
        "status",
        "accepted",
        "human_listening",
        "remote",
        "dialogue_count",
        "canonical_corpus_complete",
        "mechanical_passed_count",
        "asr_passed_count",
        "acceptance_review_present_count",
        "dialogues",
        "index_sha256",
    }
    if set(value) != fields:
        raise CorpusPromotionError("promotion input index fields are invalid")
    rows = value["dialogues"]
    core = {key: entry for key, entry in value.items() if key != "index_sha256"}
    if (
        value["schema_version"] != SCHEMA_VERSION
        or value["status"] != INDEX_STATUS
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or value["dialogue_count"] != len(expected_dialogues)
        or value["canonical_corpus_complete"] is not True
        or value["mechanical_passed_count"] != len(expected_dialogues)
        or value["asr_passed_count"] != len(expected_dialogues)
        or value["acceptance_review_present_count"] != len(expected_dialogues)
        or not isinstance(value["index_sha256"], str)
        or hashlib.sha256(canonical_json(core)).hexdigest() != value["index_sha256"]
        or not isinstance(rows, list)
        or len(rows) != len(expected_dialogues)
    ):
        raise CorpusPromotionError("promotion input index identity or count is invalid")
    expected_fields = {
        "dialogue",
        "receipt",
        "asr",
        "handoff",
        "acceptance_review",
        "next_stage",
    }
    normalized: list[dict[str, Any]] = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict) or set(row) != expected_fields:
            raise CorpusPromotionError(
                f"promotion input row {index} fields are invalid"
            )
        receipt = row["receipt"]
        asr = row["asr"]
        handoff = row["handoff"]
        review = row["acceptance_review"]
        if (
            not isinstance(row["dialogue"], str)
            or not isinstance(receipt, dict)
            or set(receipt) != {"path", "file_sha256", "receipt_sha256"}
            or not isinstance(asr, dict)
            or set(asr)
            != {
                "plan_sha256",
                "evidence_sha256",
                "path",
                "file_sha256",
                "word_errors",
                "ordinary_word_errors",
                "word_error_rate",
                "passed",
            }
            or asr["passed"] is not True
            or not isinstance(asr["word_errors"], int)
            or isinstance(asr["word_errors"], bool)
            or asr["word_errors"] < 0
            or not isinstance(asr["ordinary_word_errors"], int)
            or isinstance(asr["ordinary_word_errors"], bool)
            or asr["ordinary_word_errors"] < 0
            or asr["ordinary_word_errors"] > asr["word_errors"]
            or not isinstance(asr["word_error_rate"], (int, float))
            or isinstance(asr["word_error_rate"], bool)
            or not 0 <= asr["word_error_rate"] <= 1
            or not isinstance(handoff, dict)
            or set(handoff)
            != {
                "evidence_sha256",
                "path",
                "file_sha256",
                "mechanical_passed",
                "promotion_blockers",
                "accepted",
                "human_listening",
            }
            or handoff["mechanical_passed"] is not True
            or handoff["accepted"] is not False
            or handoff["human_listening"] != "not-performed"
            or not isinstance(handoff["promotion_blockers"], list)
            or not all(
                isinstance(blocker, str) and blocker
                for blocker in handoff["promotion_blockers"]
            )
            or not isinstance(review, dict)
            or set(review) != {"path", "status", "file_sha256"}
            or review["status"] != "present-unvalidated"
            or row["next_stage"] != "validate-production-acceptance-review"
        ):
            raise CorpusPromotionError(
                f"promotion input row {index} is not ready for production-acceptance validation"
            )
        for field, item in (
            ("receipt file_sha256", receipt["file_sha256"]),
            ("receipt receipt_sha256", receipt["receipt_sha256"]),
            ("ASR plan_sha256", asr["plan_sha256"]),
            ("ASR evidence_sha256", asr["evidence_sha256"]),
            ("ASR file_sha256", asr["file_sha256"]),
            ("handoff file_sha256", handoff["file_sha256"]),
            ("handoff evidence_sha256", handoff["evidence_sha256"]),
            ("acceptance review file_sha256", review["file_sha256"]),
        ):
            if not isinstance(item, str) or promotion.SHA256_RE.fullmatch(item) is None:
                raise CorpusPromotionError(
                    f"promotion input row {index} {field} is not a lowercase SHA-256"
                )
        normalized.append(
            {
                "dialogue": row["dialogue"],
                "handoff_path": handoff["path"],
                "handoff_sha256": handoff["file_sha256"],
                "handoff_evidence_sha256": handoff["evidence_sha256"],
                "acceptance_review_path": review["path"],
                "acceptance_review_sha256": review["file_sha256"],
            }
        )
    actual = tuple(row["dialogue"] for row in rows)
    if actual != tuple(expected_dialogues):
        raise CorpusPromotionError(
            "promotion input index must exactly match the sorted canonical dialogue inventory"
        )
    return normalized


def build_corpus_promotion_plan(
    *,
    repo_root: Path,
    handoff_root: Path,
    artifact_root: Path,
    input_index_path: Path,
    generated_at: str,
    plan_builder: Callable[..., dict[str, Any]] = promotion.build_promotion_plan,
    plan_validator: Callable[
        [dict[str, Any]], None
    ] = promotion.validate_promotion_plan,
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    repo_root = _absolute_directory(repo_root, "repository root")
    handoff_root = _absolute_directory(handoff_root, "QA handoff root")
    artifact_root = _absolute_directory(artifact_root, "recording artifact root")
    input_index_path = input_index_path.resolve(strict=True)
    expected_dialogues, catalog_sha256 = _catalog_dialogues(repo_root)
    index = _load_json(input_index_path, "promotion input index")
    rows = _validate_index(index, expected_dialogues)

    dialogue_plans: list[dict[str, Any]] = []
    summaries: list[dict[str, Any]] = []
    target_paths: set[str] = set()
    for row in rows:
        dialogue = row["dialogue"]
        indexed_handoff_path = Path(row["handoff_path"])
        if not indexed_handoff_path.is_absolute():
            raise CorpusPromotionError(f"{dialogue} QA handoff path must be absolute")
        indexed_handoff_path = indexed_handoff_path.resolve(strict=False)
        try:
            handoff_relative = indexed_handoff_path.relative_to(handoff_root).as_posix()
        except ValueError as error:
            raise CorpusPromotionError(
                f"{dialogue} QA handoff path escapes the explicit handoff root"
            ) from error
        handoff_path = _safe_child(
            handoff_root, handoff_relative, f"{dialogue} QA handoff"
        )
        review_relative = row["acceptance_review_path"]
        expected_review = f"scratch/audio-acceptance-reviews/{dialogue}.json"
        if review_relative != expected_review:
            raise CorpusPromotionError(
                f"{dialogue} acceptance review must use {expected_review}"
            )
        review_path = _safe_child(
            repo_root, review_relative, f"{dialogue} acceptance review"
        )
        for path, expected_sha256, label in (
            (handoff_path, row["handoff_sha256"], "QA handoff"),
            (review_path, row["acceptance_review_sha256"], "acceptance review"),
        ):
            if path.is_symlink() or not path.is_file():
                raise CorpusPromotionError(
                    f"{dialogue} {label} must be a regular file: {path}"
                )
            actual_sha256 = sha256_file(path)
            if actual_sha256 != expected_sha256:
                raise CorpusPromotionError(
                    f"{dialogue} {label} hash mismatch: expected {expected_sha256}, got {actual_sha256}"
                )
        handoff = _load_json(handoff_path, f"{dialogue} QA handoff")
        evidence_sha256 = handoff.get("evidence_sha256")
        if (
            handoff.get("dialogue") != dialogue
            or not isinstance(evidence_sha256, str)
            or evidence_sha256 != row["handoff_evidence_sha256"]
            or handoff_relative != f"artifacts/{evidence_sha256}/qa-handoff.json"
        ):
            raise CorpusPromotionError(
                f"{dialogue} QA handoff path is not bound to its evidence SHA-256"
            )
        review = _load_json(review_path, f"{dialogue} acceptance review")
        plan = plan_builder(
            repo_root=repo_root,
            artifact_root=artifact_root,
            handoff=handoff,
            review=review,
            generated_at=generated_at,
        )
        plan_validator(plan)
        if plan.get("dialogue") != dialogue:
            raise CorpusPromotionError(f"{dialogue} promotion plan changed dialogue")
        qa_target = plan.get("qa_target")
        recording_target = plan.get("recording_target")
        if (
            not isinstance(qa_target, dict)
            or qa_target.get("path") != f"audio/qa/{dialogue}.json"
            or not isinstance(recording_target, dict)
            or recording_target.get("path") != f"wiki/recordings/{dialogue}.json"
        ):
            raise CorpusPromotionError(
                f"{dialogue} promotion targets are non-canonical"
            )
        for target in (qa_target["path"], recording_target["path"]):
            if target in target_paths:
                raise CorpusPromotionError(
                    f"duplicate canonical promotion target: {target}"
                )
            target_paths.add(target)
        dialogue_plans.append(plan)
        summaries.append(
            {
                "dialogue": dialogue,
                "handoff_path": row["handoff_path"],
                "handoff_sha256": row["handoff_sha256"],
                "acceptance_review_path": review_relative,
                "acceptance_review_sha256": row["acceptance_review_sha256"],
                "promotion_plan_sha256": plan["plan_sha256"],
                "chapter_count": len(plan["chapter_artifacts"]),
                "qa_target": dict(qa_target),
                "recording_target": dict(recording_target),
            }
        )

    core = {
        "schema_version": SCHEMA_VERSION,
        "status": PLAN_STATUS,
        "implementation": implementation_identity(),
        "generated_at": generated_at,
        "repo_root": str(repo_root),
        "qa_handoff_root": str(handoff_root),
        "recording_artifact_root": str(artifact_root),
        "character_catalog": {
            "path": "audio/characters.json",
            "sha256": catalog_sha256,
            "dialogue_count": len(expected_dialogues),
        },
        "input_index": {
            "path": str(input_index_path),
            "sha256": sha256_file(input_index_path),
        },
        "dialogue_count": len(summaries),
        "dialogues": summaries,
    }
    return {
        **core,
        "plan_sha256": hashlib.sha256(canonical_json(core)).hexdigest(),
    }, dialogue_plans


def validate_corpus_promotion_plan(
    plan: dict[str, Any], dialogue_plans: Sequence[dict[str, Any]]
) -> None:
    fields = {
        "schema_version",
        "status",
        "implementation",
        "generated_at",
        "repo_root",
        "qa_handoff_root",
        "recording_artifact_root",
        "character_catalog",
        "input_index",
        "dialogue_count",
        "dialogues",
        "plan_sha256",
    }
    if set(plan) != fields:
        raise CorpusPromotionError("corpus promotion plan fields are invalid")
    core = {key: value for key, value in plan.items() if key != "plan_sha256"}
    if (
        plan["schema_version"] != SCHEMA_VERSION
        or plan["status"] != PLAN_STATUS
        or plan["implementation"] != implementation_identity()
        or not isinstance(plan["plan_sha256"], str)
        or hashlib.sha256(canonical_json(core)).hexdigest() != plan["plan_sha256"]
        or plan["dialogue_count"] != len(dialogue_plans)
        or not isinstance(plan["dialogues"], list)
        or len(plan["dialogues"]) != len(dialogue_plans)
    ):
        raise CorpusPromotionError("corpus promotion plan is stale or inconsistent")
    for summary, dialogue_plan in zip(plan["dialogues"], dialogue_plans, strict=True):
        if summary.get("dialogue") != dialogue_plan.get("dialogue") or summary.get(
            "promotion_plan_sha256"
        ) != dialogue_plan.get("plan_sha256"):
            raise CorpusPromotionError(
                "corpus promotion summary differs from a dialogue plan"
            )


def _default_validator(repo_root: Path, artifact_root: Path) -> tuple[int, str]:
    result = subprocess.run(
        ["bun", "run", "validate"],
        cwd=repo_root,
        env={
            **os.environ,
            "PLATO_RECORDING_ARTIFACT_ROOT": str(artifact_root),
        },
        text=True,
        capture_output=True,
        check=False,
    )
    return result.returncode, (result.stderr or result.stdout).strip()


def _planned_outputs(
    dialogue_plans: Sequence[dict[str, Any]], repo_root: Path, artifact_root: Path
) -> dict[Path, tuple[str, bytes | None]]:
    outputs: dict[Path, tuple[str, bytes | None]] = {}
    for plan in dialogue_plans:
        dialogue = plan["dialogue"]
        for target, value, label in (
            (plan["qa_target"], plan["qa"], "QA"),
            (plan["recording_target"], plan["recording"], "recording"),
        ):
            path = _safe_child(repo_root, target["path"], f"{dialogue} {label}")
            expected = promotion.pretty_json(value)
            if promotion.sha256_bytes(expected) != target["sha256"]:
                raise CorpusPromotionError(f"{dialogue} {label} target hash is stale")
            if path in outputs:
                raise CorpusPromotionError(f"duplicate planned output: {path}")
            outputs[path] = (target["sha256"], expected)
        for chapter in plan["chapter_artifacts"]:
            path = Path(chapter["target_path"]).resolve(strict=False)
            try:
                relative = path.relative_to(artifact_root).as_posix()
            except ValueError as error:
                raise CorpusPromotionError(
                    f"{dialogue} chapter target escapes artifact root"
                ) from error
            if relative != chapter["relative_path"] or path in outputs:
                raise CorpusPromotionError(
                    f"{dialogue} chapter target binding is invalid or duplicated"
                )
            outputs[path] = (chapter["sha256"], None)
    return outputs


def execute_corpus_promotion_plan(
    plan: dict[str, Any],
    dialogue_plans: Sequence[dict[str, Any]],
    *,
    repo_root: Path,
    artifact_root: Path,
    reviewed_plan_sha256: str,
    executor: Callable[..., dict[str, Any]] = promotion.execute_promotion_plan,
    validator: Callable[[], tuple[int, str]] | None = None,
) -> dict[str, Any]:
    validate_corpus_promotion_plan(plan, dialogue_plans)
    repo_root = _absolute_directory(repo_root, "repository root")
    artifact_root = _absolute_directory(artifact_root, "recording artifact root")
    if (
        reviewed_plan_sha256 != plan["plan_sha256"]
        or plan["repo_root"] != str(repo_root)
        or plan["recording_artifact_root"] != str(artifact_root)
    ):
        raise CorpusPromotionError("reviewed corpus promotion plan SHA or roots differ")
    outputs = _planned_outputs(dialogue_plans, repo_root, artifact_root)
    preexisting: set[Path] = set()
    for path, (expected_sha256, expected_bytes) in outputs.items():
        if path.exists() or path.is_symlink():
            if path.is_symlink() or not path.is_file():
                raise CorpusPromotionError(
                    f"planned output is not a regular file: {path}"
                )
            if expected_bytes is not None:
                valid = path.read_bytes() == expected_bytes
            else:
                valid = sha256_file(path) == expected_sha256
            if not valid:
                raise CorpusPromotionError(f"existing planned output differs: {path}")
            preexisting.add(path)

    results: list[dict[str, Any]] = []
    try:
        for dialogue_plan in dialogue_plans:
            results.append(
                executor(
                    dialogue_plan,
                    repo_root=repo_root,
                    artifact_root=artifact_root,
                    reviewed_plan_sha256=dialogue_plan["plan_sha256"],
                    validator=lambda: (0, "batch validation deferred"),
                )
            )
        validation = (
            validator()
            if validator is not None
            else _default_validator(repo_root, artifact_root)
        )
        if validation[0] != 0:
            raise CorpusPromotionError(
                f"repository validator failed after corpus promotion: {validation[1]}"
            )
    except BaseException:
        for path in sorted(
            (path for path in outputs if path not in preexisting),
            key=lambda item: len(item.parts),
            reverse=True,
        ):
            path.unlink(missing_ok=True)
        for directory in sorted(
            {path.parent for path in outputs if path not in preexisting},
            key=lambda item: len(item.parts),
            reverse=True,
        ):
            try:
                directory.rmdir()
            except OSError:
                pass
        raise
    return {
        "schema_version": SCHEMA_VERSION,
        "status": RESULT_STATUS,
        "plan_sha256": plan["plan_sha256"],
        "dialogue_count": len(results),
        "chapter_count": sum(result["chapter_count"] for result in results),
        "accepted": True,
        "dialogues": [result["dialogue"] for result in results],
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-index", type=Path, required=True)
    parser.add_argument("--qa-handoff-root", type=Path, required=True)
    parser.add_argument("--recording-artifact-root", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    parser.add_argument("--generated-at", required=True)
    parser.add_argument("--execute", action="store_true")
    parser.add_argument("--reviewed-plan-sha256")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        plan, dialogue_plans = build_corpus_promotion_plan(
            repo_root=args.repo_root.resolve(),
            handoff_root=args.qa_handoff_root.resolve(),
            artifact_root=args.recording_artifact_root.resolve(),
            input_index_path=args.input_index.resolve(),
            generated_at=args.generated_at,
        )
        if args.execute:
            if not args.reviewed_plan_sha256:
                raise CorpusPromotionError(
                    "--execute requires --reviewed-plan-sha256 from the dry run"
                )
            result = execute_corpus_promotion_plan(
                plan,
                dialogue_plans,
                repo_root=args.repo_root.resolve(),
                artifact_root=args.recording_artifact_root.resolve(),
                reviewed_plan_sha256=args.reviewed_plan_sha256,
            )
        else:
            command = [
                sys.executable,
                str(Path(__file__).resolve()),
                "--input-index",
                str(args.input_index),
                "--qa-handoff-root",
                str(args.qa_handoff_root),
                "--recording-artifact-root",
                str(args.recording_artifact_root),
                "--repo-root",
                str(args.repo_root),
                "--generated-at",
                args.generated_at,
                "--execute",
                "--reviewed-plan-sha256",
                plan["plan_sha256"],
            ]
            result = {
                "schema_version": SCHEMA_VERSION,
                "status": "complete-corpus-audio-promotion-preview",
                "plan_sha256": plan["plan_sha256"],
                "dialogue_count": plan["dialogue_count"],
                "chapter_count": sum(row["chapter_count"] for row in plan["dialogues"]),
                "accepted": False,
                "writes": False,
                "execute_command": shlex.join(command),
            }
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
        return 0
    except (CorpusPromotionError, promotion.PromotionError, OSError) as error:
        print(f"corpus audio QA promotion failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
