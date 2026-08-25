from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from audition_dots_reference import AuditionError, build_audition_plan, parse_seeds  # noqa: E402


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_reference(root: Path) -> tuple[Path, Path]:
    reference = root / "reference.wav"
    with wave.open(str(reference), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(3)
        handle.setframerate(48_000)
        handle.writeframes(b"\x00\x00\x00" * 48_000)
    sidecar = root / "reference.json"
    sidecar.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "plan": {
                    "dialogue": "phaedo",
                    "character_id": "crito",
                    "video_id": "2sZzVVwSOEU",
                    "source_url": "https://www.youtube.com/watch?v=2sZzVVwSOEU",
                    "prompt_text": "The exact reference transcript.",
                },
                "wav": {"sha256": sha256_file(reference)},
            }
        ),
        encoding="utf-8",
    )
    return reference, sidecar


class DotsReferenceAuditionTest(unittest.TestCase):
    def test_builds_hash_pinned_plan_without_importing_gpu_dependencies(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference, sidecar = write_reference(root)
            plan = build_audition_plan(
                reference=reference,
                reference_sidecar=sidecar,
                target_text="  A target\nline. ",
                seeds="44,45",
                output_dir=root / "out",
            )
            self.assertEqual(plan.dialogue, "phaedo")
            self.assertEqual(plan.character_id, "crito")
            self.assertEqual(plan.target_text, "A target line.")
            self.assertEqual(plan.seeds, (44, 45))
            self.assertEqual(plan.reference_sha256, sha256_file(reference))

    def test_rejects_hash_mismatch(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference, sidecar = write_reference(root)
            payload = json.loads(sidecar.read_text())
            payload["wav"]["sha256"] = "0" * 64
            sidecar.write_text(json.dumps(payload))
            with self.assertRaisesRegex(AuditionError, "hash mismatch"):
                build_audition_plan(
                    reference=reference,
                    reference_sidecar=sidecar,
                    target_text="A line.",
                    seeds="44",
                    output_dir=root / "out",
                )

    def test_rejects_duplicate_or_invalid_seeds(self) -> None:
        for value in ("", "44,44", "-1", str(2**32)):
            with self.subTest(value=value), self.assertRaises(AuditionError):
                parse_seeds(value)
