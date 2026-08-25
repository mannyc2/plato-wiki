from __future__ import annotations

import copy
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/audio"))

import audit_full_master_asr as audit  # noqa: E402
import qa_full_master_asr as full_asr  # noqa: E402


def evidence() -> dict:
    chapter = {
        "chapter_id": "chapter-one",
        "entry_ids": ["heading", "line"],
        "start_frame": 0,
        "end_frame": 48_000,
        "start_seconds": 0.0,
        "end_seconds": 1.0,
        "expected_text": "Alpha beta gamma",
        "expected_text_sha256": "1" * 64,
        "expected_tokens_sha256": "2" * 64,
        "expected_words": 3,
        "transcript": "alpha delta gamma extra",
        "transcript_sha256": "3" * 64,
        "recognized_words": 4,
        "word_errors": 2,
        "ordinary_word_errors": 2,
        "word_error_rate": 2 / 3,
        "detected_language": "en",
        "language_probability": 1.0,
    }
    core = {
        "schema_version": full_asr.SCHEMA_VERSION,
        "status": full_asr.EVIDENCE_STATUS,
        "asr_plan_sha256": "4" * 64,
        "implementation": {},
        "dialogue": "crito",
        "production": {},
        "asr_runtime": {},
        "transcription_policy": {},
        "chapters": [chapter],
        "corpus": {
            "expected_text_sha256": "5" * 64,
            "transcript_sha256": "6" * 64,
            "expected_words": 3,
            "recognized_words": 4,
            "word_errors": 2,
            "ordinary_word_errors": 2,
            "word_error_rate": 2 / 3,
        },
        "acceptance": {
            "accepted": False,
            "reason": (
                "mechanical ASR evidence only; no human listening or production "
                "recording acceptance was performed"
            ),
        },
        "human_listening": {"status": "not-performed"},
    }
    return {
        **core,
        "evidence_sha256": full_asr.sha256_bytes(full_asr.canonical_json(core)),
    }


def screenplay() -> dict:
    return {
        "schema_version": 2,
        "dialogue": "crito",
        "entries": [
            {
                "id": "heading",
                "chapter_id": "chapter-one",
                "text": "Alpha beta",
            },
            {"id": "line", "chapter_id": "chapter-one", "text": "gamma"},
        ],
    }


class AuditFullMasterAsrTests(unittest.TestCase):
    def test_enumerates_an_exact_minimum_path_and_maps_entries(self) -> None:
        result = audit.build_audit(
            evidence(),
            screenplay(),
            evidence_file_sha256="7" * 64,
            screenplay_file_sha256="8" * 64,
        )
        self.assertEqual(result["corpus"]["word_errors"], 2)
        self.assertEqual(
            [item["operation"] for item in result["chapters"][0]["edits"]],
            ["substitution", "insertion"],
        )
        self.assertEqual(
            [item["entry_id"] for item in result["chapters"][0]["edits"]],
            ["heading", "line"],
        )
        self.assertFalse(result["acceptance"]["accepted"])

    def test_rejects_metrics_that_do_not_match_the_reconstructed_path(self) -> None:
        report = evidence()
        core = {key: value for key, value in report.items() if key != "evidence_sha256"}
        core["chapters"][0]["word_errors"] = 1
        report = {
            **core,
            "evidence_sha256": full_asr.sha256_bytes(full_asr.canonical_json(core)),
        }
        with self.assertRaisesRegex(audit.AsrAuditError, "reconstructed"):
            audit.build_audit(
                report,
                screenplay(),
                evidence_file_sha256="7" * 64,
                screenplay_file_sha256="8" * 64,
            )

    def test_rejects_screenplay_text_drift(self) -> None:
        changed = copy.deepcopy(screenplay())
        changed["entries"][1]["text"] = "different"
        with self.assertRaisesRegex(audit.AsrAuditError, "do not reproduce"):
            audit.build_audit(
                evidence(),
                changed,
                evidence_file_sha256="7" * 64,
                screenplay_file_sha256="8" * 64,
            )


if __name__ == "__main__":
    unittest.main()
