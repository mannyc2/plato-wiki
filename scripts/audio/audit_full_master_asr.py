#!/usr/bin/env python3
"""Enumerate exact word edits in pinned full-master ASR evidence.

The full-master recognizer deliberately fails closed: every raw Levenshtein
edit is initially counted as an ordinary-word error.  This read-only helper
reconstructs one deterministic minimum edit path and maps each edit back to
the canonical screenplay entry that supplied the expected word.  It does not
classify, waive, or accept any error.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
from typing import Any

from qa_full_master_asr import (
    FullMasterAsrError,
    canonical_json,
    normalized_words,
    sha256_bytes,
    sha256_file,
    validate_evidence,
)


SCHEMA_VERSION = 1
STATUS = "full-master-asr-edit-audit"
ALIGNMENT_POLICY = (
    "minimum-word-levenshtein-substitution-deletion-insertion-tiebreak-v1"
)
CONTEXT_WORDS = 5


class AsrAuditError(ValueError):
    """Raised when ASR evidence cannot be audited exactly."""


def _read_json(path: Path, label: str) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AsrAuditError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise AsrAuditError(f"{label} must be a JSON object: {path}")
    return value


def _minimum_alignment(
    expected: list[str], recognized: list[str]
) -> tuple[int, list[dict[str, Any]]]:
    """Return an exact minimum edit path with a stable tie-break policy."""

    expected_count = len(expected)
    recognized_count = len(recognized)
    # Codes: 0 match, 1 substitution, 2 deletion, 3 insertion.
    trace = [bytearray(recognized_count + 1) for _ in range(expected_count + 1)]
    for index in range(1, expected_count + 1):
        trace[index][0] = 2
    for index in range(1, recognized_count + 1):
        trace[0][index] = 3

    previous = list(range(recognized_count + 1))
    for expected_index, expected_word in enumerate(expected, start=1):
        current = [expected_index] + [0] * recognized_count
        for recognized_index, recognized_word in enumerate(recognized, start=1):
            if expected_word == recognized_word:
                current[recognized_index] = previous[recognized_index - 1]
                trace[expected_index][recognized_index] = 0
                continue
            substitution = previous[recognized_index - 1] + 1
            deletion = previous[recognized_index] + 1
            insertion = current[recognized_index - 1] + 1
            # The explicit order makes equally minimal alignments reproducible.
            if substitution <= deletion and substitution <= insertion:
                current[recognized_index] = substitution
                trace[expected_index][recognized_index] = 1
            elif deletion <= insertion:
                current[recognized_index] = deletion
                trace[expected_index][recognized_index] = 2
            else:
                current[recognized_index] = insertion
                trace[expected_index][recognized_index] = 3
        previous = current

    expected_index = expected_count
    recognized_index = recognized_count
    reversed_steps: list[dict[str, Any]] = []
    while expected_index or recognized_index:
        direction = trace[expected_index][recognized_index]
        if direction == 0:
            expected_index -= 1
            recognized_index -= 1
            reversed_steps.append(
                {
                    "operation": "match",
                    "expected_index": expected_index,
                    "recognized_index": recognized_index,
                }
            )
        elif direction == 1:
            expected_index -= 1
            recognized_index -= 1
            reversed_steps.append(
                {
                    "operation": "substitution",
                    "expected_index": expected_index,
                    "recognized_index": recognized_index,
                }
            )
        elif direction == 2:
            expected_index -= 1
            reversed_steps.append(
                {
                    "operation": "deletion",
                    "expected_index": expected_index,
                    "recognized_index": recognized_index,
                }
            )
        elif direction == 3:
            recognized_index -= 1
            reversed_steps.append(
                {
                    "operation": "insertion",
                    "expected_index": expected_index,
                    "recognized_index": recognized_index,
                }
            )
        else:  # pragma: no cover - bytearray initialization makes this unreachable.
            raise AssertionError("alignment trace is invalid")
    reversed_steps.reverse()
    return previous[-1], reversed_steps


def _entry_word_map(
    screenplay: dict[str, Any], chapter_id: str, expected: list[str]
) -> list[str]:
    mapped_words: list[str] = []
    entry_ids: list[str] = []
    for entry in screenplay.get("entries", []):
        if not isinstance(entry, dict) or entry.get("chapter_id") != chapter_id:
            continue
        entry_id = entry.get("id")
        text = entry.get("text")
        if not isinstance(entry_id, str) or not isinstance(text, str):
            raise AsrAuditError(f"screenplay entry in {chapter_id} is malformed")
        words = normalized_words(text)
        mapped_words.extend(words)
        entry_ids.extend([entry_id] * len(words))
    if mapped_words != expected:
        raise AsrAuditError(
            f"screenplay entries do not reproduce expected ASR text for {chapter_id}"
        )
    return entry_ids


def _context(words: list[str], index: int, *, consumes_word: bool) -> list[str]:
    start = max(0, index - CONTEXT_WORDS)
    end = min(len(words), index + CONTEXT_WORDS + (1 if consumes_word else 0))
    return words[start:end]


def _entry_for_edit(entry_ids: list[str], expected_index: int) -> str:
    if not entry_ids:
        raise AsrAuditError("cannot map an edit into an empty chapter")
    if expected_index < len(entry_ids):
        return entry_ids[expected_index]
    return entry_ids[-1]


def build_audit(
    evidence: dict[str, Any],
    screenplay: dict[str, Any],
    *,
    evidence_file_sha256: str,
    screenplay_file_sha256: str,
) -> dict[str, Any]:
    try:
        validate_evidence(evidence)
    except FullMasterAsrError as error:
        raise AsrAuditError(str(error)) from error
    dialogue = evidence.get("dialogue")
    if (
        screenplay.get("schema_version") != 2
        or screenplay.get("dialogue") != dialogue
        or not isinstance(screenplay.get("entries"), list)
    ):
        raise AsrAuditError("screenplay does not match the ASR evidence")

    audited_chapters: list[dict[str, Any]] = []
    corpus_edits = 0
    for chapter in evidence.get("chapters", []):
        if not isinstance(chapter, dict):
            raise AsrAuditError("ASR chapter evidence is malformed")
        chapter_id = chapter.get("chapter_id")
        if not isinstance(chapter_id, str):
            raise AsrAuditError("ASR chapter ID is malformed")
        expected = normalized_words(chapter.get("expected_text", ""))
        recognized = normalized_words(chapter.get("transcript", ""))
        entry_ids = _entry_word_map(screenplay, chapter_id, expected)
        distance, steps = _minimum_alignment(expected, recognized)
        if (
            distance != chapter.get("word_errors")
            or len(expected) != chapter.get("expected_words")
            or len(recognized) != chapter.get("recognized_words")
        ):
            raise AsrAuditError(
                f"reconstructed edit metrics disagree with evidence for {chapter_id}"
            )
        edits: list[dict[str, Any]] = []
        for step in steps:
            operation = step["operation"]
            if operation == "match":
                continue
            expected_index = step["expected_index"]
            recognized_index = step["recognized_index"]
            consumes_expected = operation != "insertion"
            consumes_recognized = operation != "deletion"
            edits.append(
                {
                    "edit_index": len(edits),
                    "operation": operation,
                    "entry_id": _entry_for_edit(entry_ids, expected_index),
                    "expected_word_index": expected_index,
                    "recognized_word_index": recognized_index,
                    "expected": (
                        expected[expected_index] if consumes_expected else ""
                    ),
                    "recognized": (
                        recognized[recognized_index] if consumes_recognized else ""
                    ),
                    "expected_context": _context(
                        expected, expected_index, consumes_word=consumes_expected
                    ),
                    "recognized_context": _context(
                        recognized, recognized_index, consumes_word=consumes_recognized
                    ),
                }
            )
        if len(edits) != distance:
            raise AssertionError("each non-match step must cost exactly one edit")
        corpus_edits += distance
        audited_chapters.append(
            {
                "chapter_id": chapter_id,
                "expected_words": len(expected),
                "recognized_words": len(recognized),
                "word_errors": distance,
                "word_error_rate": distance / len(expected),
                "edits": edits,
            }
        )

    if corpus_edits != evidence.get("corpus", {}).get("word_errors"):
        raise AsrAuditError("audited corpus edit count disagrees with ASR evidence")
    core = {
        "schema_version": SCHEMA_VERSION,
        "status": STATUS,
        "dialogue": dialogue,
        "asr_evidence_sha256": evidence["evidence_sha256"],
        "asr_evidence_file_sha256": evidence_file_sha256,
        "screenplay_sha256": screenplay_file_sha256,
        "alignment_policy": ALIGNMENT_POLICY,
        "chapters": audited_chapters,
        "corpus": {
            "expected_words": evidence["corpus"]["expected_words"],
            "recognized_words": evidence["corpus"]["recognized_words"],
            "word_errors": corpus_edits,
            "word_error_rate": (
                corpus_edits / evidence["corpus"]["expected_words"]
            ),
        },
        "acceptance": {
            "accepted": False,
            "reason": "edit enumeration is evidence for review, not acceptance",
        },
    }
    return {**core, "audit_sha256": sha256_bytes(canonical_json(core))}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--asr-evidence", type=Path, required=True)
    parser.add_argument("--screenplay", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    evidence_path = args.asr_evidence.resolve(strict=True)
    screenplay_path = args.screenplay.resolve(strict=True)
    evidence = _read_json(evidence_path, "ASR evidence")
    screenplay = _read_json(screenplay_path, "screenplay")
    audit = build_audit(
        evidence,
        screenplay,
        evidence_file_sha256=sha256_file(evidence_path),
        screenplay_file_sha256=sha256_file(screenplay_path),
    )
    print(json.dumps(audit, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except AsrAuditError as error:
        print(f"error: {error}")
        raise SystemExit(2) from error
