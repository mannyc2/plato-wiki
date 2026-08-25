from __future__ import annotations

import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from build_english_speaker_census import census_dialogue, render_census  # noqa: E402


class EnglishSpeakerCensusTest(unittest.TestCase):
    def setUp(self) -> None:
        fixture = REPO_ROOT / "tests" / "fixtures" / "english-speaker-census" / "sample.xml"
        self.census = census_dialogue(
            "sample",
            "tlg0059",
            "tlg999",
            fixture.read_bytes(),
            "https://example.test/sample.xml",
        )

    def test_preserves_source_labels_and_raw_attribution_values(self) -> None:
        participants = self.census["participants"]
        self.assertEqual(
            [participant["labels"][0]["raw_label"] for participant in participants],
            ["Alpha", "Beta", "Collective Role", "Unattributed"],
        )
        self.assertEqual(participants[0]["attributes"], {"xml:id": "alpha"})

        by_raw_who = {
            attribution["raw_who"]: attribution
            for attribution in self.census["said_attributions"]
        }
        self.assertEqual(by_raw_who["#Alpha"]["occurrences"], 2)
        self.assertEqual(by_raw_who["#Alpha #Beta"]["tokens"], ["#Alpha", "#Beta"])
        self.assertEqual(by_raw_who["#Collective Role"]["raw_who"], "#Collective Role")
        self.assertIn(None, by_raw_who)

    def test_exposes_anomalies_without_resolving_them(self) -> None:
        codes = [anomaly["code"] for anomaly in self.census["anomalies"]]
        self.assertIn("said-missing-who", codes)
        self.assertIn("said-multiple-who-tokens", codes)
        self.assertIn("said-malformed-who-tokens", codes)
        self.assertIn("said-fragment-no-exact-participant-label", codes)
        self.assertIn("participant-label-not-exactly-attributed", codes)

        ghost = next(
            anomaly
            for anomaly in self.census["anomalies"]
            if anomaly["code"] == "said-fragment-no-exact-participant-label"
        )
        self.assertEqual(ghost["raw_fragment"], "Ghost")
        self.assertEqual(ghost["raw_who"], "#Ghost")

    def test_render_is_byte_stable(self) -> None:
        self.assertEqual(render_census(self.census), render_census(self.census))
        self.assertTrue(render_census(self.census).endswith("\n"))


if __name__ == "__main__":
    unittest.main()
