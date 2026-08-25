from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from materialize_youtube_reference import (  # noqa: E402
    ReferenceMaterializationError,
    _tool_version,
    build_reference_plan,
)


def catalog() -> dict[str, object]:
    return {
        "schemaVersion": 2,
        "status": "source-pool",
        "selectionPolicy": {
            "automaticSelection": True,
            "acceptancePolicy": "operator-authorized-deterministic-v1",
        },
        "dialogues": [
            {
                "dialogue": "crito",
                "videos": [
                    {
                        "videoId": "MNDfJMrH1XY",
                        "title": "Crito",
                        "durationSeconds": 2014,
                        "url": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                    }
                ],
            },
            {
                "dialogue": "laws",
                "videos": [
                    {
                        "videoId": "uddowL-Bw_M",
                        "title": "Laws I",
                        "durationSeconds": 23301,
                        "url": "https://www.youtube.com/watch?v=uddowL-Bw_M",
                    },
                    {
                        "videoId": "QH-DQq-ToUQ",
                        "title": "Laws II",
                        "durationSeconds": 27668,
                        "url": "https://www.youtube.com/watch?v=QH-DQq-ToUQ",
                    },
                ],
            },
        ],
    }


class YoutubeReferencePlanTest(unittest.TestCase):
    def test_tool_version_uses_ffmpegs_single_dash_flag(self) -> None:
        with patch("materialize_youtube_reference.subprocess.run") as run:
            run.return_value.stdout = "ffmpeg version 7.1\n"
            self.assertEqual(_tool_version("ffmpeg"), "ffmpeg version 7.1")
            run.assert_called_once_with(
                ["ffmpeg", "-version"], check=True, capture_output=True, text=True
            )

    def test_builds_a_direct_pinned_youtube_plan_and_normalizes_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            plan = build_reference_plan(
                catalog(),
                dialogue="crito",
                character_id="socrates",
                start_seconds=65.04,
                end_seconds=72.51,
                prompt_text="Why, Crito,\n  when a man has reached my age?",
                output_root=Path(raw_root),
            )
        self.assertEqual(plan.source_url, "https://www.youtube.com/watch?v=MNDfJMrH1XY")
        self.assertEqual(plan.video_id, "MNDfJMrH1XY")
        self.assertAlmostEqual(plan.clip_duration_seconds, 7.47)
        self.assertEqual(plan.prompt_text, "Why, Crito, when a man has reached my age?")
        self.assertRegex(
            plan.wav_path,
            r"MNDfJMrH1XY-000065040-000072510-[0-9a-f]{12}\.wav$",
        )

    def test_prompt_corrections_are_content_addressed_separately(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            base = dict(
                catalog=catalog(),
                dialogue="crito",
                character_id="socrates",
                start_seconds=65.04,
                end_seconds=72.51,
                output_root=Path(raw_root),
            )
            first = build_reference_plan(**base, prompt_text="A draft.")
            corrected = build_reference_plan(**base, prompt_text="A draught.")
        self.assertNotEqual(first.wav_path, corrected.wav_path)

    def test_requires_explicit_part_for_multi_video_dialogues(self) -> None:
        with self.assertRaisesRegex(ReferenceMaterializationError, "multiple source videos"):
            build_reference_plan(
                catalog(),
                dialogue="laws",
                character_id="athenian-stranger",
                start_seconds=10,
                end_seconds=16,
                prompt_text="A clean reference line.",
                output_root=Path("scratch"),
            )

        plan = build_reference_plan(
            catalog(),
            dialogue="laws",
            character_id="athenian-stranger",
            video_id="QH-DQq-ToUQ",
            start_seconds=10,
            end_seconds=16,
            prompt_text="A clean reference line.",
            output_root=Path("scratch"),
        )
        self.assertEqual(plan.video_id, "QH-DQq-ToUQ")

    def test_rejects_unpinned_videos_unsafe_intervals_and_empty_prompts(self) -> None:
        base = {
            "catalog": catalog(),
            "dialogue": "crito",
            "character_id": "socrates",
            "start_seconds": 65.04,
            "end_seconds": 72.51,
            "prompt_text": "A clean reference line.",
            "output_root": Path("scratch"),
        }
        with self.assertRaisesRegex(ReferenceMaterializationError, "not pinned"):
            build_reference_plan(**base, video_id="aaaaaaaaaaa")
        with self.assertRaisesRegex(ReferenceMaterializationError, "3-20 seconds"):
            build_reference_plan(**{**base, "end_seconds": 66})
        with self.assertRaisesRegex(ReferenceMaterializationError, "prompt_text"):
            build_reference_plan(**{**base, "prompt_text": "   "})


if __name__ == "__main__":
    unittest.main()
