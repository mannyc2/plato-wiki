from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from build_audition_review import (  # noqa: E402
    AuditionReviewError,
    build_review_packet,
    canonical_json_sha256,
    verify_audition_evidence,
)
from qa_dots_audition import ASR_REPO, ASR_REVISION, score_transcript  # noqa: E402


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_wav(path: Path, frames: int = 4_800) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(48_000)
        audio.writeframes(b"\x00\x00" * frames)


def qa_case(kind: str, path: Path, root: Path, expected: str) -> dict[str, object]:
    return {
        "kind": kind,
        "path": str(path.relative_to(root)),
        **score_transcript(expected, expected),
    }


class AuditionReviewTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.audition = self.root / "scratch" / "audition"
        self.audition.mkdir(parents=True)
        self.reference = self.root / "scratch" / "reference.wav"
        self.seed_4 = self.audition / "seed-4.wav"
        self.seed_8 = self.audition / "seed-8.wav"
        for path in (self.reference, self.seed_4, self.seed_8):
            write_wav(path)
        self.plan = {
            "character_id": "crito",
            "dialogue": "crito",
            "model_repo": "rednote-hilab/dots.tts-soar",
            "model_revision": "e" * 40,
            "prompt_text": "Reference words.",
            "reference_path": str(self.reference.relative_to(self.root)),
            "reference_sha256": sha256(self.reference),
            "target_text": "Candidate words.",
        }
        self.plan_sha = canonical_json_sha256(self.plan)
        self.manifest_path = self.audition / "audition-manifest.json"
        self.qa_path = self.audition / "asr-qa.json"
        self.ranking_path = self.audition / "ranking.json"
        self.manifest = {
            "schemaVersion": 1,
            "status": "audition",
            "plan": self.plan,
            "planSha256": self.plan_sha,
            "outputs": [
                {
                    "seed": 4,
                    "file": self.seed_4.name,
                    "sha256": sha256(self.seed_4),
                    "sampleRate": 48_000,
                    "durationSeconds": 0.1,
                },
                {
                    "seed": 8,
                    "file": self.seed_8.name,
                    "sha256": sha256(self.seed_8),
                    "sampleRate": 48_000,
                    "durationSeconds": 0.1,
                },
            ],
        }
        self.qa = {
            "schemaVersion": 1,
            "status": "audition-qa",
            "auditionPlanSha256": self.plan_sha,
            "asrRepo": ASR_REPO,
            "asrRevision": ASR_REVISION,
            "cases": {
                "reference": qa_case(
                    "reference", self.reference, self.root, self.plan["prompt_text"]
                ),
                "seed-4": qa_case(
                    "clone", self.seed_4, self.root, self.plan["target_text"]
                ),
                "seed-8": qa_case(
                    "clone", self.seed_8, self.root, self.plan["target_text"]
                ),
            },
        }
        self.ranking = {
            "schemaVersion": 1,
            "status": "audition-ranking",
            "auditionPlanSha256": self.plan_sha,
            "modelRepository": self.plan["model_repo"],
            "modelRevision": self.plan["model_revision"],
            "referencePath": str(self.reference.relative_to(self.root)),
            "ranking": [
                {
                    "seed": 8,
                    "file": self.seed_8.name,
                    "minimumCosineSimilarity": 0.7,
                    "meanCosineSimilarity": 0.9,
                    "maximumCosineSimilarity": 0.95,
                },
                {
                    "seed": 4,
                    "file": self.seed_4.name,
                    "minimumCosineSimilarity": 0.6,
                    "meanCosineSimilarity": 0.8,
                    "maximumCosineSimilarity": 0.9,
                },
            ],
        }
        self.write_evidence()

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def write_evidence(self) -> None:
        self.manifest_path.write_text(json.dumps(self.manifest), encoding="utf-8")
        self.qa_path.write_text(json.dumps(self.qa), encoding="utf-8")
        self.ranking_path.write_text(json.dumps(self.ranking), encoding="utf-8")

    def verify(self):
        return verify_audition_evidence(
            self.manifest_path,
            self.qa_path,
            self.ranking_path,
            self.root,
        )

    def test_builds_deterministic_blind_review_without_writing_cast(self) -> None:
        output = self.audition / "listening" / "review.html"
        report = build_review_packet(
            self.manifest_path,
            self.qa_path,
            self.ranking_path,
            output,
            self.root,
        )
        first_html = output.read_bytes()
        first_manifest = output.with_name("review-manifest.json").read_bytes()
        second = build_review_packet(
            self.manifest_path,
            self.qa_path,
            self.ranking_path,
            output,
            self.root,
        )
        self.assertEqual(first_html, output.read_bytes())
        self.assertEqual(
            first_manifest, output.with_name("review-manifest.json").read_bytes()
        )
        self.assertEqual(report, second)
        self.assertTrue(report["humanAuditRequired"])
        self.assertFalse(report["writesCastRegistry"])
        self.assertEqual({item["seed"] for item in report["candidates"]}, {4, 8})
        page = output.read_text(encoding="utf-8")
        self.assertIn("Candidate A", page)
        self.assertIn("Candidate B", page)
        self.assertIn("This page cannot edit", page)
        self.assertIn("Copy review decision", page)
        self.assertIn("Clear review", page)
        self.assertIn("minimum 0.7000", page)
        self.assertNotIn('f"minimum', page)
        self.assertNotIn(str(self.root), page)
        self.assertFalse((self.root / "audio" / "cast.json").exists())
        script = re.search(r"<script>\s*(.*?)\s*</script>", page, re.DOTALL)
        self.assertIsNotNone(script)
        syntax = subprocess.run(
            ["node", "--check", "-"],
            input=script.group(1),
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(syntax.returncode, 0, syntax.stderr)

    def test_rejects_a_tampered_plan(self) -> None:
        self.manifest["plan"]["target_text"] = "Changed."
        self.write_evidence()
        with self.assertRaises(AuditionReviewError):
            self.verify()

    def test_rejects_a_tampered_reference(self) -> None:
        self.reference.write_bytes(self.reference.read_bytes() + b"x")
        with self.assertRaises(AuditionReviewError):
            self.verify()

    def test_rejects_a_tampered_candidate(self) -> None:
        self.seed_4.write_bytes(self.seed_4.read_bytes() + b"x")
        with self.assertRaises(AuditionReviewError):
            self.verify()

    def test_rejects_detached_or_incomplete_qa(self) -> None:
        self.qa["auditionPlanSha256"] = "0" * 64
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "detached"):
            self.verify()
        self.qa["auditionPlanSha256"] = self.plan_sha
        self.qa["cases"]["seed-4"]["passesOrdinaryWordGate"] = False
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "does not pass"):
            self.verify()

    def test_recomputes_qa_instead_of_trusting_a_pass_flag(self) -> None:
        case = self.qa["cases"]["seed-4"]
        case["transcript"] = "different words"
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "stale or false"):
            self.verify()

    def test_rejects_ranking_drift_and_nonfinite_values(self) -> None:
        self.ranking["ranking"][0]["file"] = "seed-4.wav"
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "file mismatch"):
            self.verify()
        self.ranking["ranking"][0]["file"] = "seed-8.wav"
        self.ranking["ranking"][0]["meanCosineSimilarity"] = float("nan")
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "finite"):
            self.verify()

    def test_rejects_unsafe_paths_and_wav_shapes(self) -> None:
        self.manifest["outputs"][0]["file"] = "../seed-4.wav"
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "unsafe"):
            self.verify()
        self.manifest["outputs"][0]["file"] = "seed-4.wav"
        with wave.open(str(self.seed_4), "wb") as audio:
            audio.setnchannels(2)
            audio.setsampwidth(2)
            audio.setframerate(48_000)
            audio.writeframes(b"\x00\x00\x00\x00" * 100)
        self.manifest["outputs"][0]["sha256"] = sha256(self.seed_4)
        self.write_evidence()
        with self.assertRaisesRegex(AuditionReviewError, "mono"):
            self.verify()


if __name__ == "__main__":
    unittest.main()
