from __future__ import annotations

import itertools
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import qa_full_master_asr as full_master_asr  # noqa: E402
from qa_full_master_asr import (  # noqa: E402
    ASR_DISTRIBUTION_PINS,
    FullMasterAsrError,
    build_asr_plan,
    canonical_json,
    model_snapshot_provenance,
    normalized_words,
    reconstruct_expected_chapters,
    run_asr_with_transcriber,
    sha256_bytes,
    sha256_file,
    word_edit_distance,
    write_evidence,
)


class FakeTranscriber:
    def __init__(self, responses: list[str]) -> None:
        self.responses = iter(responses)
        self.calls: list[tuple[Path, float, float]] = []

    def __call__(
        self, audio_path: Path, *, start_seconds: float, end_seconds: float
    ) -> dict:
        self.calls.append((audio_path, start_seconds, end_seconds))
        return {
            "text": next(self.responses),
            "detected_language": "en",
            "language_probability": 1.0,
        }


def fixture_screenplay() -> dict:
    return {
        "schema_version": 2,
        "dialogue": "crito",
        "source_hashes": {"english": "1" * 64, "stephanus": "2" * 64},
        "commentary_sha256": "3" * 64,
        "commentary_quality_audit_sha256": "4" * 64,
        "cast_sha256": "5" * 64,
        "generator_version": f"screenplay-generator-v3+attribution.{'6' * 64}",
        "chapters": [
            {"id": "first", "commentary_id": "first-commentary"},
            {"id": "second", "commentary_id": "second-commentary"},
        ],
        "entries": [
            {
                "id": "first-source",
                "chapter_id": "first",
                "kind": "source",
                "character_id": "socrates",
                "text": "Alpha beta.",
                "anchor": {"stephanus": "43a"},
                "cadence_intent": "none",
            },
            {
                "id": "second-source",
                "chapter_id": "second",
                "kind": "source",
                "character_id": "crito",
                "text": "Gamma delta.",
                "anchor": {"stephanus": "43b"},
                "cadence_intent": "chapter",
            },
        ],
        "repairs": [],
        "coverage": {
            "source_words": 4,
            "source_words_covered": 4,
            "source_words_uncovered": 0,
            "source_words_duplicated": 0,
            "commentary_blocks_expected": 0,
            "commentary_blocks_covered": 0,
            "commentary_blocks_missing": 0,
            "commentary_blocks_duplicated": 0,
        },
    }


def fixture_timeline() -> list[dict]:
    return [
        {
            "chapter_id": "first",
            "start_frame": 0,
            "end_frame": 48_000,
            "start_seconds": 0.0,
            "end_seconds": 1.0,
        },
        {
            "chapter_id": "second",
            "start_frame": 48_000,
            "end_frame": 96_000,
            "start_seconds": 1.0,
            "end_seconds": 2.0,
        },
    ]


class FullMasterAsrTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.repo_root = self.root / "repo"
        self.repo_root.mkdir()
        self.master = self.root / "master.wav"
        self.master.write_bytes(b"fixture-master")
        self.snapshot = self.root / "snapshot"
        self.snapshot.mkdir()
        (self.snapshot / "model.bin").write_bytes(b"fixture-model")
        self.expected = reconstruct_expected_chapters(
            fixture_screenplay(), fixture_timeline()
        )
        self.runtime = {
            "model": model_snapshot_provenance(self.snapshot),
            "runtime": {
                "distributions": dict(sorted(ASR_DISTRIBUTION_PINS.items())),
                "python_version": sys.version,
                "python_executable": str(Path(sys.executable).resolve(strict=True)),
            },
        }
        self.production = {
            "repo_root": str(self.repo_root),
            "screenplay": {
                "path": "audio/scripts/crito.json",
                "sha256": "1" * 64,
                "schema_version": 2,
            },
            "render_plan": {
                "path": str(self.root / "render-plan.json"),
                "plan_sha256": "2" * 64,
                "artifact_sha256": "3" * 64,
            },
            "renderer": {
                "outdir": str(self.root / "renderer"),
                "complete_input_sha256": "4" * 64,
                "complete_audio_sha256": "5" * 64,
                "chapter_starts_sha256": "6" * 64,
            },
            "mastering_plan": {
                "path": str(self.root / "mastering-plan.json"),
                "plan_sha256": "7" * 64,
                "artifact_sha256": "8" * 64,
                "chapter_timeline_sha256": "9" * 64,
            },
            "mastering_result": {
                "directory": str(self.root / "mastering-result"),
                "manifest_sha256": "a" * 64,
                "mechanical_qa_sha256": "b" * 64,
                "working_master_path": str(self.master),
                "working_master_sha256": sha256_file(self.master),
                "accepted": False,
            },
            "files": [
                {
                    "label": "working-master",
                    "path": str(self.master),
                    "sha256": sha256_file(self.master),
                    "size_bytes": self.master.stat().st_size,
                }
            ],
        }
        self.plan = build_asr_plan(
            dialogue="crito",
            production=self.production,
            expected=self.expected,
            asr_runtime=self.runtime,
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    @staticmethod
    def dynamic_distance(left: list[str], right: list[str]) -> int:
        previous = list(range(len(right) + 1))
        for left_index, left_word in enumerate(left, start=1):
            current = [left_index]
            for right_index, right_word in enumerate(right, start=1):
                current.append(
                    min(
                        previous[right_index] + 1,
                        current[right_index - 1] + 1,
                        previous[right_index - 1] + (left_word != right_word),
                    )
                )
            previous = current
        return previous[-1]

    def test_bit_vector_distance_matches_dynamic_programming(self) -> None:
        sequences = [
            sequence
            for length in range(4)
            for sequence in itertools.product(("a", "b"), repeat=length)
        ]
        for left in sequences:
            for right in sequences:
                self.assertEqual(
                    word_edit_distance(list(left), list(right)),
                    self.dynamic_distance(list(left), list(right)),
                    (left, right),
                )

    def test_unicode_word_normalization_matches_audio_contract(self) -> None:
        self.assertEqual(
            normalized_words("Socrates’ λόγος, naïve 42 -- DON'T."),
            ["socrates", "λόγος", "naïve", "42", "don't"],
        )

    def test_reconstructs_exact_chapter_text_and_rejects_reordering(self) -> None:
        self.assertEqual(
            [chapter["expected_text"] for chapter in self.expected],
            ["Alpha beta.", "Gamma delta."],
        )
        reordered = list(reversed(fixture_timeline()))
        with self.assertRaisesRegex(FullMasterAsrError, "differs"):
            reconstruct_expected_chapters(fixture_screenplay(), reordered)

    def test_scores_every_chapter_with_one_reusable_fake_transcriber(self) -> None:
        transcriber = FakeTranscriber(["alpha bet", "gamma delta"])
        report = run_asr_with_transcriber(self.plan, self.expected, transcriber)

        self.assertEqual(len(transcriber.calls), 2)
        self.assertTrue(all(call[0] == self.master for call in transcriber.calls))
        self.assertEqual(
            [(call[1], call[2]) for call in transcriber.calls],
            [(0.0, 1.0), (1.0, 2.0)],
        )
        self.assertEqual(
            [chapter["word_errors"] for chapter in report["chapters"]], [1, 0]
        )
        self.assertEqual(
            [chapter["ordinary_word_errors"] for chapter in report["chapters"]],
            [1, 0],
        )
        self.assertEqual(
            report["corpus"],
            {
                "expected_text_sha256": sha256_bytes(b"Alpha beta. Gamma delta."),
                "transcript_sha256": sha256_bytes(b"alpha bet gamma delta"),
                "expected_words": 4,
                "recognized_words": 4,
                "word_errors": 1,
                "ordinary_word_errors": 1,
                "word_error_rate": 0.25,
            },
        )
        self.assertFalse(report["acceptance"]["accepted"])
        self.assertEqual(report["human_listening"], {"status": "not-performed"})
        core = {key: value for key, value in report.items() if key != "evidence_sha256"}
        self.assertEqual(report["evidence_sha256"], sha256_bytes(canonical_json(core)))

    def test_fails_closed_when_master_changes_before_transcription(self) -> None:
        self.master.write_bytes(b"changed-master")
        transcriber = FakeTranscriber(["unused", "unused"])
        with self.assertRaisesRegex(FullMasterAsrError, "SHA-256 is stale"):
            run_asr_with_transcriber(self.plan, self.expected, transcriber)
        self.assertEqual(transcriber.calls, [])

    def test_default_main_is_read_only_and_does_not_load_the_model(self) -> None:
        args = SimpleNamespace(
            render_plan=Path("render-plan.json"),
            expected_render_plan_sha256="1" * 64,
            renderer_outdir=Path("renderer"),
            mastering_plan=Path("mastering-plan.json"),
            expected_mastering_plan_sha256="2" * 64,
            mastering_outdir=Path("mastering"),
            repo_root=self.repo_root,
            cache_dir=Path("cache"),
            outdir=self.root / "unused-output",
            expected_asr_plan_sha256=None,
            execute=False,
        )
        with (
            mock.patch.object(full_master_asr, "parse_args", return_value=args),
            mock.patch.object(
                full_master_asr,
                "load_current_asr_plan",
                return_value=(self.plan, self.expected),
            ),
            mock.patch.object(full_master_asr, "load_pinned_transcriber") as load,
            mock.patch.object(full_master_asr, "write_evidence") as write,
        ):
            self.assertEqual(full_master_asr.main(), 0)
        load.assert_not_called()
        write.assert_not_called()

    def test_execute_requires_the_reviewed_plan_hash_before_model_load(self) -> None:
        args = SimpleNamespace(
            render_plan=Path("render-plan.json"),
            expected_render_plan_sha256="1" * 64,
            renderer_outdir=Path("renderer"),
            mastering_plan=Path("mastering-plan.json"),
            expected_mastering_plan_sha256="2" * 64,
            mastering_outdir=Path("mastering"),
            repo_root=self.repo_root,
            cache_dir=Path("cache"),
            outdir=self.root / "unused-output",
            expected_asr_plan_sha256=None,
            execute=True,
        )
        with (
            mock.patch.object(full_master_asr, "parse_args", return_value=args),
            mock.patch.object(
                full_master_asr,
                "load_current_asr_plan",
                return_value=(self.plan, self.expected),
            ),
            mock.patch.object(full_master_asr, "load_pinned_transcriber") as load,
        ):
            with self.assertRaisesRegex(SystemExit, "requires"):
                full_master_asr.main()
        load.assert_not_called()

    def test_writes_only_content_addressed_unaccepted_scratch_evidence(self) -> None:
        report = run_asr_with_transcriber(
            self.plan,
            self.expected,
            FakeTranscriber(["alpha beta", "gamma delta"]),
        )
        outdir = self.root / "scratch-asr"
        path, created = write_evidence(report, outdir=outdir, repo_root=self.repo_root)
        self.assertTrue(created)
        self.assertEqual(
            path,
            outdir / "artifacts" / report["evidence_sha256"] / "asr-evidence.json",
        )
        same, created_again = write_evidence(
            report, outdir=outdir, repo_root=self.repo_root
        )
        self.assertEqual(same, path)
        self.assertFalse(created_again)
        forbidden = self.repo_root / "audio/qa/full-master"
        with self.assertRaisesRegex(FullMasterAsrError, "cannot write"):
            write_evidence(report, outdir=forbidden, repo_root=self.repo_root)


if __name__ == "__main__":
    unittest.main()
