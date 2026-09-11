from __future__ import annotations

from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))
from edit_source_audio import output_directory


class SourceEditOutputTest(unittest.TestCase):
    def test_symlink_parent_cannot_create_a_directory_in_original_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            original, output = root / "original", root / "edits"
            original.mkdir()
            output.mkdir()
            (output / "artifacts").symlink_to(original, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, "symlinked"):
                output_directory(output, "artifacts", "planned-digest")
            self.assertEqual(list(original.iterdir()), [])
