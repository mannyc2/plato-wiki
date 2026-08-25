from __future__ import annotations

import copy
import json
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from build_narrative_cue_references import (  # noqa: E402
    DEFAULT_CANDIDATE_REPORT_ROOT,
    DEFAULT_OUTPUT,
    EXPECTED_CHARACTER_IDS,
    NarrativeCueError,
    build_candidate_reports,
    build_ledger,
    canonical_json,
    load_candidate_reports,
    sha256_bytes,
    validate_candidate_reports,
    validate_ledger,
)
from find_youtube_reference import parse_json3_caption  # noqa: E402
from orchestrate_dots_cast_batch import build_batch_manifest  # noqa: E402


class NarrativeCueReferenceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.persisted = json.loads(DEFAULT_OUTPUT.read_text(encoding="utf-8"))
        cls.rebuilt = build_ledger()
        cls.persisted_reports = load_candidate_reports(DEFAULT_CANDIDATE_REPORT_ROOT)
        cls.rebuilt_reports = build_candidate_reports(
            cls.rebuilt, ledger_path=DEFAULT_OUTPUT
        )

    def test_persisted_ledger_is_deterministic_and_live_valid(self) -> None:
        self.assertEqual(self.persisted, self.rebuilt)
        validate_ledger(self.persisted)
        self.assertEqual(
            [row["characterId"] for row in self.persisted["records"]],
            list(EXPECTED_CHARACTER_IDS),
        )
        self.assertEqual(self.persisted["summary"]["resolvedCount"], 18)
        self.assertEqual(self.persisted["summary"]["unresolvedCount"], 3)

    def test_all_resolved_intervals_pass_exact_duration_and_no_write_gates(
        self,
    ) -> None:
        resolved = [
            row
            for row in self.persisted["records"]
            if row["status"] == "attributable-reference-candidate"
        ]
        self.assertTrue(
            all(
                3.0 <= row["caption"]["durationSeconds"] <= 15.0
                and row["caption"]["confidence"] == 1.0
                and row["caption"]["exactTokenRatio"] == 1.0
                and not row["safety"]["manualListeningPerformed"]
                and not row["safety"]["materialized"]
                and not row["safety"]["castWritePerformed"]
                for row in resolved
            )
        )

    def test_unresolved_roles_fail_closed_with_unapplied_fallbacks(self) -> None:
        unresolved = {
            row["characterId"]: row
            for row in self.persisted["records"]
            if row["status"] == "unresolved-no-duration-eligible-source-proof"
        }
        self.assertEqual(
            set(unresolved),
            {
                "lysis-and-menexenus",
                "menos-boy",
                "sons-of-lysimachus-and-melesias",
            },
        )
        self.assertTrue(
            all(
                row["failReason"]
                and row["proposedSourceReassignment"]["status"]
                == "proposal-not-applied"
                for row in unresolved.values()
            )
        )

    def test_validator_rejects_tampering(self) -> None:
        tampered = copy.deepcopy(self.persisted)
        tampered["records"][0]["caption"]["durationSeconds"] = 2.9
        with self.assertRaisesRegex(NarrativeCueError, "ledgerSha256"):
            validate_ledger(tampered, verify_live_inputs=False)

    def test_live_validator_rejects_semantic_tampering_even_when_resigned(self) -> None:
        tampered = copy.deepcopy(self.persisted)
        tampered["records"][0]["confidence"]["stateRule"] = "forged attribution"
        unsigned = {
            key: value for key, value in tampered.items() if key != "ledgerSha256"
        }
        tampered["ledgerSha256"] = sha256_bytes(canonical_json(unsigned))
        with self.assertRaisesRegex(NarrativeCueError, "fresh deterministic rebuild"):
            validate_ledger(tampered)

    def test_normalized_reports_are_deterministic_complete_and_fail_closed(
        self,
    ) -> None:
        self.assertEqual(self.persisted_reports, self.rebuilt_reports)
        validate_candidate_reports(
            self.persisted_reports,
            ledger=self.persisted,
            ledger_path=DEFAULT_OUTPUT,
        )
        self.assertEqual(len(self.persisted_reports), 8)
        candidates = [
            candidate
            for report in self.persisted_reports.values()
            for candidate in report["candidates"]
        ]
        self.assertEqual(len(candidates), 18)
        self.assertTrue(
            all(
                candidate["status"]
                == "automatically-eligible-reference-interval"
                and candidate["sourceAgreementSha256"]
                and not candidate["safety"]["operatorListeningRequired"]
                and not candidate["safety"]["castWritePerformed"]
                for candidate in candidates
            )
        )
        expected_unresolved = self.persisted["summary"]["unresolvedCharacterIds"]
        self.assertTrue(
            all(
                report["derivation"]["unresolvedCharacterIds"]
                == expected_unresolved
                and [row["characterId"] for row in report["unresolved"]]
                == expected_unresolved
                for report in self.persisted_reports.values()
            )
        )

    def test_cleinias_starts_exactly_after_the_replied_caption_token(self) -> None:
        row = next(
            row
            for row in self.persisted["records"]
            if row["characterId"] == "cleinias"
        )
        caption = row["caption"]
        document = parse_json3_caption(REPO_ROOT / caption["captionPath"])
        start = caption["captionTokenSpan"]["start"]
        preceding = document.tokens[start - 1]
        first = document.tokens[start]
        self.assertEqual(preceding.normalized, "replied")
        self.assertEqual(first.normalized, "that")
        self.assertEqual(preceding.end_ms, first.start_ms)
        self.assertEqual(preceding.end_ms / 1000, caption["startSeconds"])
        self.assertEqual(caption["boundaryAudit"]["boundaryGapSeconds"], 0.0)

    def test_cast_batch_consumes_all_safe_candidates_and_no_unresolved_role(
        self,
    ) -> None:
        resolved_ids = set(self.persisted["summary"]["resolvedCharacterIds"])
        cast = json.loads(
            (REPO_ROOT / "audio/cast.json").read_text(encoding="utf-8")
        )
        selected_ids = {
            voice["characterId"]
            for voice in cast["voices"]
            if voice.get("status") == "selected"
        }
        remaining_ids = resolved_ids - selected_ids
        if not remaining_ids:
            self.assertTrue(resolved_ids <= selected_ids)
            return
        manifest = build_batch_manifest(
            phase="materialize",
            repo_root=REPO_ROOT,
            report_paths=sorted(DEFAULT_CANDIDATE_REPORT_ROOT.glob("*.report.json")),
            batch_root=Path("scratch/audio-cast-batches"),
            only_characters=remaining_ids,
        )
        self.assertEqual(
            [item["characterId"] for item in manifest["items"]],
            sorted(remaining_ids),
        )
        self.assertEqual(
            selected_ids.intersection(resolved_ids)
            | {item["characterId"] for item in manifest["items"]},
            resolved_ids,
        )
        self.assertTrue(
            set(self.persisted["summary"]["unresolvedCharacterIds"]).isdisjoint(
                item["characterId"] for item in manifest["items"]
            )
        )


if __name__ == "__main__":
    unittest.main()
