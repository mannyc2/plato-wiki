from __future__ import annotations

import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from rank_dots_audition import AuditionRankingError, window_starts  # noqa: E402


class DotsAuditionRankingTest(unittest.TestCase):
    def test_uses_start_middle_and_end_windows_without_duplicates(self) -> None:
        self.assertEqual(window_starts(20 * 48_000, 48_000), [0, 288_000, 576_000])
        self.assertEqual(window_starts(4 * 48_000, 48_000), [0])

    def test_rejects_invalid_window_inputs(self) -> None:
        for values in ((0, 48_000), (1, 0), (-1, 48_000)):
            with self.subTest(values=values), self.assertRaises(AuditionRankingError):
                window_starts(*values)
