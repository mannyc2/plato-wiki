#!/usr/bin/env python3
"""Advance corpus mastering receipts to unaccepted QA handoffs.

This is the corpus wrapper for ``qa_full_master_asr.py`` and
``assemble_audio_qa_handoff.py``.  The default invocation is a local, read-only
receipt audit.  ``--execute`` advances each selected dialogue serially on the
GPU: every child command is first run dry, and only the exact SHA returned by
that dry run may be executed.  Completed ASR and handoff artifacts are
content-addressed, so interrupted campaigns resume without mutable aliases.

The final local artifact is a content-addressed handoff index under ``scratch``.
It records the expected production-acceptance review path but never creates a
review, accepted QA, or recording manifest. That review may record completed
human listening or an explicit operator-authorized listening waiver.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path
from typing import Any, Sequence

from produce_corpus_audio import (
    CANONICAL_DIALOGUES,
    GPU_HOST,
    REMOTE_ARTIFACT_ROOT,
    REMOTE_MASTERING_ROOT,
    REMOTE_PYTHON,
    REMOTE_REPO_ROOT,
    CommandExecutionError,
    CommandRunner,
    load_receipts,
    remote_argv,
    sha256_file,
)


SCHEMA_VERSION = 2
STATUS = "corpus-audio-qa-handoffs-complete-unaccepted"
ASR_ROOT = REMOTE_ARTIFACT_ROOT / "full-master-asr"
HANDOFF_ROOT = REMOTE_ARTIFACT_ROOT / "qa-handoffs"
REMOTE_ASR_CACHE = Path("/mnt/models/cache/huggingface")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


class CorpusQaPreparationError(RuntimeError):
    """Raised when the corpus cannot advance without guessing."""


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def content_sha256(value: Any) -> str:
    return hashlib.sha256(canonical_json(value)).hexdigest()


def _sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or SHA256_RE.fullmatch(value) is None:
        raise CorpusQaPreparationError(f"{label} must be a lowercase SHA-256")
    return value


def _exact_object(value: Any, fields: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != fields:
        raise CorpusQaPreparationError(f"{label} fields are invalid")
    return value


def _canonical_remote_artifact(
    value: Any,
    *,
    root: Path,
    digest: str,
    filename: str,
    label: str,
) -> str:
    expected = root / "artifacts" / digest / filename
    if value != str(expected):
        raise CorpusQaPreparationError(
            f"{label} is not its canonical content-addressed path"
        )
    return str(expected)


def _safe_repo_file(repo_root: Path, relative: Any, label: str) -> Path:
    if (
        not isinstance(relative, str)
        or not relative
        or "\\" in relative
        or Path(relative).is_absolute()
        or Path(relative).as_posix() != relative
        or "." in Path(relative).parts
        or ".." in Path(relative).parts
    ):
        raise CorpusQaPreparationError(f"{label} is not a canonical relative path")
    path = repo_root.joinpath(*Path(relative).parts)
    cursor = path.parent
    while cursor != repo_root:
        if cursor.is_symlink():
            raise CorpusQaPreparationError(
                f"{label} escapes through a symlink: {cursor}"
            )
        cursor = cursor.parent
    if path.is_symlink() or not path.is_file():
        raise CorpusQaPreparationError(f"{label} must be a regular file: {path}")
    return path


def select_current_receipt(
    repo_root: Path,
    receipt_root: Path,
    dialogue: str,
) -> tuple[dict[str, Any], Path]:
    """Select the sole receipt bound to the current screenplay/cast/references."""

    matches: list[tuple[dict[str, Any], Path]] = []
    for receipt in load_receipts(receipt_root, dialogue):
        inputs = receipt["inputs"]
        if (
            inputs.get("screenplay_path") != f"audio/scripts/{dialogue}.json"
            or inputs.get("cast_path") != "audio/cast.json"
        ):
            continue
        try:
            screenplay = _safe_repo_file(
                repo_root, inputs["screenplay_path"], "receipt screenplay"
            )
            cast = _safe_repo_file(repo_root, inputs["cast_path"], "receipt cast")
            if (
                sha256_file(screenplay) != inputs["screenplay_sha256"]
                or sha256_file(cast) != inputs["cast_sha256"]
            ):
                continue
            references = inputs.get("reference_paths")
            if not isinstance(references, list):
                continue
            current = True
            for index, reference in enumerate(references):
                if not isinstance(reference, dict):
                    current = False
                    break
                path = _safe_repo_file(
                    repo_root,
                    reference.get("relative_path"),
                    f"receipt reference {index}",
                )
                if sha256_file(path) != reference.get("sha256"):
                    current = False
                    break
            if not current:
                continue
        except (KeyError, CorpusQaPreparationError):
            continue
        path = receipt_root / dialogue / f"{receipt['receipt_sha256']}.json"
        matches.append((receipt, path))
    if not matches:
        raise CorpusQaPreparationError(
            f"{dialogue}: no production receipt matches current screenplay/cast bytes"
        )
    if len(matches) != 1:
        digests = ", ".join(item[0]["receipt_sha256"] for item in matches)
        raise CorpusQaPreparationError(
            f"{dialogue}: multiple current production receipts require explicit "
            f"reconciliation: {digests}"
        )
    return matches[0]


def validate_asr_preview(value: dict[str, Any], dialogue: str) -> dict[str, Any]:
    fields = {
        "dialogue",
        "asr_plan_sha256",
        "chapter_count",
        "expected_words",
        "working_master_sha256",
        "model_repository",
        "model_revision",
        "writes",
        "accepted",
        "human_listening",
    }
    _exact_object(value, fields, f"{dialogue} ASR preview")
    if (
        value["dialogue"] != dialogue
        or value["writes"] is not False
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or not isinstance(value["chapter_count"], int)
        or value["chapter_count"] <= 0
        or not isinstance(value["expected_words"], int)
        or value["expected_words"] <= 0
    ):
        raise CorpusQaPreparationError(f"{dialogue}: ASR preview contract failed")
    _sha256(value["asr_plan_sha256"], f"{dialogue} ASR plan")
    _sha256(value["working_master_sha256"], f"{dialogue} working master")
    return value


def validate_asr_result(value: dict[str, Any], dialogue: str) -> dict[str, Any]:
    fields = {
        "dialogue",
        "status",
        "evidence_sha256",
        "evidence_path",
        "word_errors",
        "expected_words",
        "word_error_rate",
        "ordinary_word_errors",
        "accepted",
        "human_listening",
    }
    _exact_object(value, fields, f"{dialogue} ASR result")
    digest = _sha256(value["evidence_sha256"], f"{dialogue} ASR evidence")
    if (
        value["dialogue"] != dialogue
        or value["status"] not in {"written", "cached"}
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or not isinstance(value["word_errors"], int)
        or not isinstance(value["ordinary_word_errors"], int)
    ):
        raise CorpusQaPreparationError(f"{dialogue}: ASR result contract failed")
    _canonical_remote_artifact(
        value["evidence_path"],
        root=ASR_ROOT,
        digest=digest,
        filename="asr-evidence.json",
        label=f"{dialogue} ASR evidence",
    )
    return value


def validate_handoff_preview(
    value: dict[str, Any], dialogue: str
) -> dict[str, Any]:
    fields = {
        "dialogue",
        "handoff_sha256",
        "chapter_count",
        "mechanical_passed",
        "asr_passed",
        "promotion_blockers",
        "writes",
        "accepted",
        "human_listening",
    }
    _exact_object(value, fields, f"{dialogue} handoff preview")
    if (
        value["dialogue"] != dialogue
        or value["writes"] is not False
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or not isinstance(value["mechanical_passed"], bool)
        or not isinstance(value["asr_passed"], bool)
        or not isinstance(value["promotion_blockers"], list)
    ):
        raise CorpusQaPreparationError(f"{dialogue}: handoff preview contract failed")
    _sha256(value["handoff_sha256"], f"{dialogue} handoff")
    return value


def validate_handoff_result(
    value: dict[str, Any], dialogue: str
) -> dict[str, Any]:
    fields = {
        "dialogue",
        "status",
        "handoff_sha256",
        "handoff_path",
        "promotion_blockers",
        "accepted",
        "human_listening",
    }
    _exact_object(value, fields, f"{dialogue} handoff result")
    digest = _sha256(value["handoff_sha256"], f"{dialogue} handoff")
    if (
        value["dialogue"] != dialogue
        or value["status"] not in {"written", "cached"}
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or not isinstance(value["promotion_blockers"], list)
    ):
        raise CorpusQaPreparationError(f"{dialogue}: handoff result contract failed")
    _canonical_remote_artifact(
        value["handoff_path"],
        root=HANDOFF_ROOT,
        digest=digest,
        filename="qa-handoff.json",
        label=f"{dialogue} QA handoff",
    )
    return value


def _write_index(index: dict[str, Any], output_root: Path) -> Path:
    digest = index["index_sha256"]
    directory = output_root / "handoff-indexes"
    path = directory / f"{digest}.json"
    payload = json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if path.exists():
        if path.is_symlink() or not path.is_file() or path.read_text() != payload:
            raise CorpusQaPreparationError(f"corrupt handoff index: {path}")
        return path
    directory.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{digest}.", suffix=".tmp", dir=directory
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)
    return path


def _load_index(path: Path) -> dict[str, Any]:
    if path.is_symlink() or not path.is_file():
        raise CorpusQaPreparationError(
            f"handoff index must be a regular file: {path}"
        )
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CorpusQaPreparationError(f"cannot read handoff index {path}: {error}") from error
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
    if not isinstance(value, dict) or set(value) != fields:
        raise CorpusQaPreparationError("handoff index fields are invalid")
    core = {key: item for key, item in value.items() if key != "index_sha256"}
    rows = value["dialogues"]
    if (
        value["schema_version"] != SCHEMA_VERSION
        or value["status"] != STATUS
        or value["accepted"] is not False
        or value["human_listening"] != "not-performed"
        or not isinstance(rows, list)
        or value["dialogue_count"] != len(rows)
        or content_sha256(core) != value["index_sha256"]
    ):
        raise CorpusQaPreparationError("handoff index identity is invalid")
    if path.name != f"{value['index_sha256']}.json":
        raise CorpusQaPreparationError(
            "handoff index is not at its content-addressed path"
        )
    return value


class CorpusQaPreparer:
    def __init__(
        self,
        *,
        repo_root: Path,
        receipt_root: Path,
        output_root: Path,
        runner: CommandRunner | None = None,
    ) -> None:
        self.repo_root = repo_root.resolve()
        self.receipt_root = receipt_root.resolve()
        self.output_root = output_root.resolve()
        forbidden = (
            (self.repo_root / "audio/qa").resolve(),
            (self.repo_root / "wiki/recordings").resolve(),
        )
        if any(
            self.output_root == path or path in self.output_root.parents
            for path in forbidden
        ):
            raise CorpusQaPreparationError(
                "unaccepted corpus QA output cannot be accepted QA or recordings"
            )
        self.runner = runner or CommandRunner()

    def refresh_acceptance_reviews(self, index_path: Path) -> dict[str, Any]:
        """Bind later production-acceptance files without replaying mechanical QA."""

        existing = _load_index(index_path.resolve(strict=True))
        rows: list[dict[str, Any]] = []
        seen: set[str] = set()
        source_dialogues: list[str] = []
        source_mechanical_passed = 0
        source_asr_passed = 0
        source_review_present = 0
        row_fields = {
            "dialogue",
            "receipt",
            "asr",
            "handoff",
            "acceptance_review",
            "next_stage",
        }
        for index, raw in enumerate(existing["dialogues"]):
            if not isinstance(raw, dict) or set(raw) != row_fields:
                raise CorpusQaPreparationError(
                    f"handoff index dialogue row {index} fields are invalid"
                )
            dialogue = raw["dialogue"]
            if dialogue not in CANONICAL_DIALOGUES or dialogue in seen:
                raise CorpusQaPreparationError(
                    "handoff index dialogue inventory is invalid"
                )
            seen.add(dialogue)
            source_dialogues.append(dialogue)
            asr = raw["asr"]
            handoff = raw["handoff"]
            if (
                not isinstance(asr, dict)
                or not isinstance(asr.get("passed"), bool)
                or not isinstance(handoff, dict)
                or not isinstance(handoff.get("mechanical_passed"), bool)
                or handoff.get("accepted") is not False
                or handoff.get("human_listening") != "not-performed"
            ):
                raise CorpusQaPreparationError(
                    f"{dialogue}: handoff index falsely claims acceptance"
                )
            prior_review = raw["acceptance_review"]
            expected_review_path = f"scratch/audio-acceptance-reviews/{dialogue}.json"
            if (
                not isinstance(prior_review, dict)
                or prior_review.get("path") != expected_review_path
                or prior_review.get("status") not in {"missing", "present-unvalidated"}
                or raw["next_stage"]
                != (
                    "validate-production-acceptance-review"
                    if prior_review.get("status") == "present-unvalidated"
                    else "provide-production-acceptance-review"
                )
            ):
                raise CorpusQaPreparationError(
                    f"{dialogue}: handoff index acceptance-review state is invalid"
                )
            source_mechanical_passed += handoff["mechanical_passed"] is True
            source_asr_passed += asr["passed"] is True
            source_review_present += (
                prior_review["status"] == "present-unvalidated"
            )
            review_relative = expected_review_path
            review_path = self.repo_root / review_relative
            if review_path.is_symlink():
                raise CorpusQaPreparationError(
                    f"{dialogue}: acceptance review path must not be a symlink"
                )
            review = {
                "path": review_relative,
                "status": "present-unvalidated" if review_path.is_file() else "missing",
                **(
                    {"file_sha256": sha256_file(review_path)}
                    if review_path.is_file()
                    else {}
                ),
            }
            rows.append(
                {
                    **raw,
                    "acceptance_review": review,
                    "next_stage": (
                        "validate-production-acceptance-review"
                        if review["status"] == "present-unvalidated"
                        else "provide-production-acceptance-review"
                    ),
                }
            )
        if (
            existing["remote"]
            != {
                "host": GPU_HOST,
                "repo_root": str(REMOTE_REPO_ROOT),
                "artifact_root": str(REMOTE_ARTIFACT_ROOT),
            }
            or existing["canonical_corpus_complete"]
            != (tuple(source_dialogues) == CANONICAL_DIALOGUES)
            or existing["mechanical_passed_count"] != source_mechanical_passed
            or existing["asr_passed_count"] != source_asr_passed
            or existing["acceptance_review_present_count"] != source_review_present
        ):
            raise CorpusQaPreparationError(
                "handoff index corpus summary is inconsistent with its rows"
            )
        core = {
            **{key: item for key, item in existing.items() if key != "index_sha256"},
            "acceptance_review_present_count": sum(
                row["acceptance_review"]["status"] == "present-unvalidated"
                for row in rows
            ),
            "dialogues": rows,
        }
        refreshed = {**core, "index_sha256": content_sha256(core)}
        path = _write_index(refreshed, self.output_root)
        return {
            "schema_version": SCHEMA_VERSION,
            "status": STATUS,
            "dialogue_count": len(rows),
            "acceptance_review_present_count": refreshed[
                "acceptance_review_present_count"
            ],
            "index_sha256": refreshed["index_sha256"],
            "index_path": path.relative_to(self.repo_root).as_posix(),
            "accepted": False,
        }

    def _remote_json(self, argv: Sequence[str], label: str) -> dict[str, Any]:
        return self.runner.json(remote_argv(argv), cwd=self.repo_root, label=label)

    def _remote_file_sha256(self, path: str, label: str) -> str:
        result = self.runner.run(
            remote_argv(["/usr/bin/sha256sum", path]),
            cwd=self.repo_root,
            label=label,
        )
        parts = result.stdout.strip().split()
        if len(parts) != 2 or parts[1] != path:
            raise CorpusQaPreparationError(f"{label}: malformed sha256sum output")
        return _sha256(parts[0], label)

    @staticmethod
    def _common_args(receipt: dict[str, Any]) -> list[str]:
        return [
            "--render-plan",
            receipt["render"]["plan_path"],
            "--expected-render-plan-sha256",
            receipt["render"]["plan_sha256"],
            "--renderer-outdir",
            str(REMOTE_ARTIFACT_ROOT),
            "--mastering-plan",
            receipt["mastering"]["plan_path"],
            "--expected-mastering-plan-sha256",
            receipt["mastering"]["plan_sha256"],
            "--mastering-outdir",
            str(REMOTE_MASTERING_ROOT),
            "--repo-root",
            str(REMOTE_REPO_ROOT),
            "--cache-dir",
            str(REMOTE_ASR_CACHE),
        ]

    def advance_dialogue(
        self,
        dialogue: str,
        receipt: dict[str, Any],
        receipt_path: Path,
    ) -> dict[str, Any]:
        common = self._common_args(receipt)
        asr_base = [
            str(REMOTE_PYTHON),
            str(REMOTE_REPO_ROOT / "scripts/audio/qa_full_master_asr.py"),
            *common,
            "--outdir",
            str(ASR_ROOT),
        ]
        preview = validate_asr_preview(
            self._remote_json(asr_base, f"{dialogue} full-master ASR preview"),
            dialogue,
        )
        asr = validate_asr_result(
            self._remote_json(
                [
                    *asr_base,
                    "--expected-asr-plan-sha256",
                    preview["asr_plan_sha256"],
                    "--execute",
                ],
                f"{dialogue} full-master ASR execution",
            ),
            dialogue,
        )
        asr_file_sha = self._remote_file_sha256(
            asr["evidence_path"], f"{dialogue} ASR evidence SHA-256"
        )

        handoff_base = [
            str(REMOTE_PYTHON),
            str(REMOTE_REPO_ROOT / "scripts/audio/assemble_audio_qa_handoff.py"),
            *common,
            "--full-master-asr",
            asr["evidence_path"],
            "--expected-full-master-asr-file-sha256",
            asr_file_sha,
            "--outdir",
            str(HANDOFF_ROOT),
        ]
        handoff_preview = validate_handoff_preview(
            self._remote_json(handoff_base, f"{dialogue} QA handoff preview"),
            dialogue,
        )
        handoff = validate_handoff_result(
            self._remote_json(
                [
                    *handoff_base,
                    "--expected-handoff-sha256",
                    handoff_preview["handoff_sha256"],
                    "--execute",
                ],
                f"{dialogue} QA handoff execution",
            ),
            dialogue,
        )
        if handoff["handoff_sha256"] != handoff_preview["handoff_sha256"]:
            raise CorpusQaPreparationError(
                f"{dialogue}: executed handoff differs from reviewed preview"
            )
        if handoff["promotion_blockers"] != handoff_preview["promotion_blockers"]:
            raise CorpusQaPreparationError(
                f"{dialogue}: promotion blockers changed between preview and execution"
            )
        handoff_file_sha = self._remote_file_sha256(
            handoff["handoff_path"], f"{dialogue} QA handoff file SHA-256"
        )
        review_relative = f"scratch/audio-acceptance-reviews/{dialogue}.json"
        review_path = self.repo_root / review_relative
        if review_path.is_symlink():
            raise CorpusQaPreparationError(
                f"{dialogue}: acceptance review path must not be a symlink"
            )
        review = {
            "path": review_relative,
            "status": "present-unvalidated" if review_path.is_file() else "missing",
            **(
                {"file_sha256": sha256_file(review_path)}
                if review_path.is_file() and not review_path.is_symlink()
                else {}
            ),
        }
        return {
            "dialogue": dialogue,
            "receipt": {
                "path": receipt_path.relative_to(self.repo_root).as_posix(),
                "file_sha256": sha256_file(receipt_path),
                "receipt_sha256": receipt["receipt_sha256"],
            },
            "asr": {
                "plan_sha256": preview["asr_plan_sha256"],
                "evidence_sha256": asr["evidence_sha256"],
                "path": asr["evidence_path"],
                "file_sha256": asr_file_sha,
                "word_errors": asr["word_errors"],
                "ordinary_word_errors": asr["ordinary_word_errors"],
                "word_error_rate": asr["word_error_rate"],
                "passed": handoff_preview["asr_passed"],
            },
            "handoff": {
                "evidence_sha256": handoff["handoff_sha256"],
                "path": handoff["handoff_path"],
                "file_sha256": handoff_file_sha,
                "mechanical_passed": handoff_preview["mechanical_passed"],
                "promotion_blockers": handoff["promotion_blockers"],
                "accepted": False,
                "human_listening": "not-performed",
            },
            "acceptance_review": review,
            "next_stage": (
                "validate-production-acceptance-review"
                if review["status"] == "present-unvalidated"
                else "provide-production-acceptance-review"
            ),
        }

    def run(self, dialogues: Sequence[str], *, execute: bool) -> dict[str, Any]:
        if not dialogues or len(set(dialogues)) != len(dialogues):
            raise CorpusQaPreparationError(
                "dialogue selection must be non-empty and unique"
            )
        unknown = sorted(set(dialogues) - set(CANONICAL_DIALOGUES))
        if unknown:
            raise CorpusQaPreparationError(
                f"unknown canonical dialogue(s): {', '.join(unknown)}"
            )
        selected: list[tuple[str, dict[str, Any], Path]] = []
        blocked: list[dict[str, str]] = []
        for dialogue in dialogues:
            try:
                receipt, path = select_current_receipt(
                    self.repo_root, self.receipt_root, dialogue
                )
                selected.append((dialogue, receipt, path))
            except CorpusQaPreparationError as error:
                blocked.append(
                    {
                        "dialogue": dialogue,
                        "blocker": str(error),
                        "next_stage": "production-render-and-master",
                    }
                )
        if not execute:
            ready_rows = [
                {
                    "dialogue": dialogue,
                    "receipt_path": path.relative_to(self.repo_root).as_posix(),
                    "receipt_sha256": receipt["receipt_sha256"],
                    "next_stage": "full-master-asr",
                }
                for dialogue, receipt, path in selected
            ]
            return {
                "schema_version": SCHEMA_VERSION,
                "status": (
                    "corpus-audio-qa-preparation-ready"
                    if not blocked
                    else "corpus-audio-qa-preparation-blocked"
                ),
                "dry_run": True,
                "writes": False,
                "accepted": False,
                "human_listening": "not-performed",
                "dialogue_count": len(dialogues),
                "ready_count": len(selected),
                "blocked_count": len(blocked),
                "dialogues": [
                    next(
                        row
                        for row in [*ready_rows, *blocked]
                        if row["dialogue"] == dialogue
                    )
                    for dialogue in dialogues
                ],
            }

        if blocked:
            raise CorpusQaPreparationError(
                "execution refused before remote writes: "
                + "; ".join(row["blocker"] for row in blocked)
            )

        rows = [
            self.advance_dialogue(dialogue, receipt, path)
            for dialogue, receipt, path in selected
        ]
        core = {
            "schema_version": SCHEMA_VERSION,
            "status": STATUS,
            "accepted": False,
            "human_listening": "not-performed",
            "remote": {
                "host": GPU_HOST,
                "repo_root": str(REMOTE_REPO_ROOT),
                "artifact_root": str(REMOTE_ARTIFACT_ROOT),
            },
            "dialogue_count": len(rows),
            "canonical_corpus_complete": tuple(dialogues) == CANONICAL_DIALOGUES,
            "mechanical_passed_count": sum(
                row["handoff"]["mechanical_passed"] is True for row in rows
            ),
            "asr_passed_count": sum(row["asr"]["passed"] is True for row in rows),
            "acceptance_review_present_count": sum(
                row["acceptance_review"]["status"] == "present-unvalidated"
                for row in rows
            ),
            "dialogues": rows,
        }
        index = {**core, "index_sha256": content_sha256(core)}
        path = _write_index(index, self.output_root)
        return {
            "schema_version": SCHEMA_VERSION,
            "status": STATUS,
            "dialogue_count": len(rows),
            "index_sha256": index["index_sha256"],
            "index_path": path.relative_to(self.repo_root).as_posix(),
            "accepted": False,
            "human_listening": "not-performed",
        }


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--execute", action="store_true")
    mode.add_argument("--refresh-index", type=Path)
    parser.add_argument("--dialogue", action="append", choices=CANONICAL_DIALOGUES)
    parser.add_argument(
        "--repo-root", type=Path, default=Path(__file__).resolve().parents[2]
    )
    parser.add_argument(
        "--receipt-root",
        type=Path,
        default=Path("scratch/audio-corpus-production/receipts"),
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("scratch/audio-corpus-postrender"),
    )
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        repo_root = args.repo_root.expanduser().resolve()
        receipt_root = args.receipt_root.expanduser()
        output_root = args.output_root.expanduser()
        if not receipt_root.is_absolute():
            receipt_root = repo_root / receipt_root
        if not output_root.is_absolute():
            output_root = repo_root / output_root
        preparer = CorpusQaPreparer(
            repo_root=repo_root,
            receipt_root=receipt_root,
            output_root=output_root,
        )
        if args.refresh_index is not None:
            if args.dialogue:
                raise CorpusQaPreparationError(
                    "--dialogue cannot be combined with --refresh-index"
                )
            refresh_path = args.refresh_index.expanduser()
            if not refresh_path.is_absolute():
                refresh_path = repo_root / refresh_path
            result = preparer.refresh_acceptance_reviews(refresh_path)
        else:
            result = preparer.run(
                tuple(args.dialogue or CANONICAL_DIALOGUES), execute=args.execute
            )
        print(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except (
        CorpusQaPreparationError,
        CommandExecutionError,
        OSError,
    ) as error:
        print(f"corpus QA preparation failed: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
