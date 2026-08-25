from __future__ import annotations

import copy
import json
import math
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

import compare_selected_voice_reference as comparison  # noqa: E402


PLAN_SHA256 = "0808668df25f1f3ab3bef66e4f2be3e671a3c70c2459499b5549c6b7d9ff0d36"
PROOF_SHA256 = "2d8c77bbfc2018d4dc71a7f0ab767ae5017b04659dbd5f22630cba78ce2723bd"
VECTOR_SHA256 = "ff69274aa99a5e8eb2f33f5d22376d33bf3c12045bc282db0563e7e6550e546b"
COMPARISON_SHA256 = (
    "0d5c24762eb84cd700fb40ccd4570a38314da06d531d92c6ec599ae2acee164b"
)
PLAN_PATH = REPO_ROOT / comparison.PLAN_ROOT / f"{PLAN_SHA256}.json"
EMBEDDING_PATH = (
    REPO_ROOT / comparison.EMBEDDING_ROOT / PLAN_SHA256 / "embedding.json"
)
COMPARISON_PATH = (
    REPO_ROOT
    / comparison.COMPARISON_ROOT
    / COMPARISON_SHA256
    / "comparison.json"
)


class SelectedReferenceComparisonTests(unittest.TestCase):
    def test_legacy_selected_reference_plan_is_invalid_after_the_safe_cutover(self) -> None:
        cast_before = (REPO_ROOT / comparison.DEFAULT_CAST).read_bytes()
        with self.assertRaisesRegex(
            comparison.SelectedReferenceComparisonError, "selected Socrates voice"
        ):
            comparison.build_plan(repo_root=REPO_ROOT)
        self.assertEqual((REPO_ROOT / comparison.DEFAULT_CAST).read_bytes(), cast_before)

    def test_ranking_is_deterministic_and_exposes_exact_margins(self) -> None:
        records = [
            {
                "clusterKey": "cluster-b",
                "centroid": comparison.voice_bank._centroid_record([0.8, 0.6]),
            },
            {
                "clusterKey": "cluster-a",
                "centroid": comparison.voice_bank._centroid_record([1.0, 0.0]),
            },
            {
                "clusterKey": "cluster-c",
                "centroid": comparison.voice_bank._centroid_record([0.0, 1.0]),
            },
        ]

        ranking = comparison.rank_centroids(
            [1.0, 0.0], records, key_field="clusterKey"
        )
        repeated = comparison.rank_centroids(
            [2.0, 0.0], list(reversed(records)), key_field="clusterKey"
        )

        self.assertEqual(ranking, repeated)
        self.assertEqual([row["clusterKey"] for row in ranking], [
            "cluster-a",
            "cluster-b",
            "cluster-c",
        ])
        self.assertTrue(math.isclose(ranking[0]["marginOverNext"], 0.2))
        self.assertTrue(math.isclose(ranking[1]["marginOverNext"], 0.8))
        self.assertIsNone(ranking[2]["marginOverNext"])

    def test_pre_cutover_gpu_proof_cannot_revalidate_against_the_current_cast(
        self,
    ) -> None:
        with self.assertRaisesRegex(
            comparison.SelectedReferenceComparisonError, "selected Socrates voice"
        ):
            comparison.load_plan(PLAN_PATH, repo_root=REPO_ROOT)

    def test_legacy_comparison_still_cannot_write_outside_scratch(self) -> None:
        artifact = json.loads(COMPARISON_PATH.read_text(encoding="utf-8"))
        with self.assertRaisesRegex(
            comparison.SelectedReferenceComparisonError, "below scratch"
        ):
            comparison.write_comparison(
                artifact,
                output_root=Path("audio/selected-reference-comparison"),
                repo_root=REPO_ROOT,
            )


if __name__ == "__main__":
    unittest.main()
