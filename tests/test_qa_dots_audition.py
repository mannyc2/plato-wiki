from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from qa_dots_audition import (  # noqa: E402
    AuditionQaError,
    edit_distance,
    load_cases,
    resolve_asr_snapshot,
    score_transcript,
    sha256_file,
    words,
)


class DotsAuditionQaTest(unittest.TestCase):
    def test_word_scoring_separates_known_name_variants(self) -> None:
        result = score_transcript("Crito spoke to Socrates.", "Krito spoke to Socrate.")
        self.assertEqual(result["strictWordErrorCount"], 2)
        self.assertEqual(result["nameNormalizedWordErrorCount"], 0)
        self.assertTrue(result["passesOrdinaryWordGate"])
        self.assertEqual(words("Don't stop."), ["don't", "stop"])
        self.assertEqual(edit_distance(["a", "b"], ["a", "c"]), 1)

    def test_case_loading_verifies_reference_and_output_hashes(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "reference.wav"
            clone = root / "clone.wav"
            reference.write_bytes(b"reference")
            clone.write_bytes(b"clone")
            manifest = root / "audition-manifest.json"
            manifest.write_text(
                json.dumps(
                    {
                        "schemaVersion": 1,
                        "status": "audition",
                        "planSha256": "a" * 64,
                        "plan": {
                            "reference_path": str(reference),
                            "reference_sha256": sha256_file(reference),
                            "prompt_text": "Reference text.",
                            "target_text": "Clone text.",
                        },
                        "outputs": [
                            {"seed": 44, "file": clone.name, "sha256": sha256_file(clone)}
                        ],
                    }
                ),
                encoding="utf-8",
            )
            _, cases = load_cases(manifest)
            self.assertEqual([case["name"] for case in cases], ["youtube-reference", "seed-44"])
            clone.write_bytes(b"corrupt")
            with self.assertRaisesRegex(AuditionQaError, "missing or corrupt"):
                load_cases(manifest)

    def test_resolves_only_the_exact_pinned_asr_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            snapshot = (
                root
                / "hub/models--openai--whisper-small.en/snapshots"
                / "e8727524f962ee844a7319d92be39ac1bd25655a"
            )
            snapshot.mkdir(parents=True)
            (snapshot / "config.json").write_text("{}")
            (snapshot / "preprocessor_config.json").write_text("{}")
            self.assertEqual(resolve_asr_snapshot(root), snapshot)
            (snapshot / "config.json").unlink()
            with self.assertRaisesRegex(AuditionQaError, "not materialized"):
                resolve_asr_snapshot(root)
