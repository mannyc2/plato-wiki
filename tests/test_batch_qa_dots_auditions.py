from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import batch_qa_dots_auditions as batch_qa  # noqa: E402
from batch_qa_dots_auditions import BatchQaError, run_batch  # noqa: E402
from qa_dots_audition import sha256_file  # noqa: E402


class BatchDotsQaTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.primary_cache = self.root / "primary-cache"
        self.independent_cache = self.root / "independent-cache"
        self.primary_cache.mkdir()
        self.independent_cache.mkdir()
        self.batch_path = self.root / "scratch/batch.json"
        self.batch_path.parent.mkdir(parents=True)
        items = [self.make_audition("alpha", 42), self.make_audition("beta", 43)]
        self.batch_path.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "artifactKind": "dots-cast-batch-dry-run",
                    "batchSha256": "b" * 64,
                    "items": items,
                }
            ),
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def make_audition(self, character_id: str, seed: int) -> dict:
        directory = self.root / f"scratch/items/{character_id}/audition"
        directory.mkdir(parents=True)
        reference = self.root / f"scratch/items/{character_id}/reference.wav"
        clone = directory / f"seed-{seed}.wav"
        reference.write_bytes(f"reference-{character_id}".encode())
        sidecar = self.root / f"scratch/items/{character_id}/reference.json"
        sidecar.write_text('{"schemaVersion":1}\n', encoding="utf-8")
        source_agreement = self.root / f"scratch/items/{character_id}/alignment.json"
        source_agreement.write_text('{"schemaVersion":1}\n', encoding="utf-8")
        clone.write_bytes(f"clone-{character_id}".encode())
        plan_sha = hashlib.sha256(character_id.encode()).hexdigest()
        (directory / "audition-manifest.json").write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "status": "audition",
                    "planSha256": plan_sha,
                    "plan": {
                        "reference_path": str(reference),
                        "reference_sha256": sha256_file(reference),
                        "prompt_text": "Reference words.",
                        "target_text": "Clone words.",
                        "model_repo": "rednote-hilab/dots.ocr",
                        "model_revision": "fixture",
                    },
                    "outputs": [
                        {"seed": seed, "file": clone.name, "sha256": sha256_file(clone)}
                    ],
                }
            ),
            encoding="utf-8",
        )
        relative = directory.relative_to(self.root).as_posix()
        return {
            "characterId": character_id,
            "alignmentReportPath": source_agreement.relative_to(self.root).as_posix(),
            "paths": {
                "auditionDir": relative,
                "asrQa": f"{relative}/asr-qa.json",
                "speakerRanking": f"{relative}/speaker-ranking.json",
                "referenceWav": reference.relative_to(self.root).as_posix(),
                "referenceSidecar": sidecar.relative_to(self.root).as_posix(),
                "referenceAsrIndependent": f"{relative}/reference-asr-independent.json",
                "referenceAsrAdjudication": f"{relative}/reference-asr-adjudication.json",
            },
        }

    @staticmethod
    def write_report(
        manifest: Path, output: Path, status: str, *, reference_errors: int = 0
    ) -> None:
        audition = json.loads(manifest.read_text())
        report = {
            "schemaVersion": 1,
            "status": status,
            "auditionPlanSha256": audition["planSha256"],
        }
        if status == "audition-qa":
            report["cases"] = {
                "youtube-reference": {
                    "kind": "reference",
                    "expected": audition["plan"]["prompt_text"],
                    "nameNormalizedWordErrorCount": reference_errors,
                }
            }
        output.write_text(json.dumps(report), encoding="utf-8")

    def test_loads_each_gpu_model_once_and_resumes_without_reloading(self) -> None:
        output = Path("scratch/batch-qa-summary.json")

        def asr(manifest, *, snapshot, transcriber, output):
            self.assertEqual(snapshot, Path("snapshot"))
            self.write_report(manifest, output, "audition-qa")

        def rank(manifest, *, runtime, output):
            self.write_report(manifest, output, "audition-ranking")

        with (
            mock.patch.object(
                batch_qa,
                "load_asr_transcriber",
                return_value=(Path("snapshot"), object()),
            ) as load_asr,
            mock.patch.object(
                batch_qa, "run_qa_with_transcriber", side_effect=asr
            ) as run_asr,
            mock.patch.object(
                batch_qa, "load_speaker_runtime", return_value=object()
            ) as load_rank,
            mock.patch.object(
                batch_qa, "rank_audition_with_runtime", side_effect=rank
            ) as run_rank,
            mock.patch.object(batch_qa, "release_cuda") as release,
        ):
            summary = run_batch(
                self.batch_path,
                repo_root=self.root,
                cache_dir=self.primary_cache,
                independent_cache_dir=self.independent_cache,
                output=output,
            )
        self.assertEqual(summary["status"], "complete")
        self.assertEqual(summary["characterCount"], 2)
        self.assertEqual(summary["modelsLoaded"], {"asr": 1, "speakerEncoder": 1})
        self.assertEqual(summary["referenceAsrAdjudicationQueue"], [])
        load_asr.assert_called_once()
        load_asr.assert_called_once_with(self.primary_cache)
        load_rank.assert_called_once()
        load_rank.assert_called_once_with(self.primary_cache)
        self.assertEqual(run_asr.call_count, 2)
        self.assertEqual(run_rank.call_count, 2)
        self.assertEqual(release.call_count, 2)

        with (
            mock.patch.object(batch_qa, "load_asr_transcriber") as load_asr_again,
            mock.patch.object(batch_qa, "load_speaker_runtime") as load_rank_again,
        ):
            resumed = run_batch(
                self.batch_path,
                repo_root=self.root,
                cache_dir=self.primary_cache,
                independent_cache_dir=self.independent_cache,
                output=output,
            )
        self.assertEqual(resumed["modelsLoaded"], {"asr": 0, "speakerEncoder": 0})
        load_asr_again.assert_not_called()
        load_rank_again.assert_not_called()

    def test_emits_exact_independent_asr_and_adjudication_queue(self) -> None:
        item = json.loads(self.batch_path.read_text())["items"][0]
        audition_dir = self.root / item["paths"]["auditionDir"]
        manifest = audition_dir / "audition-manifest.json"
        self.write_report(
            manifest,
            self.root / item["paths"]["asrQa"],
            "audition-qa",
            reference_errors=1,
        )
        self.write_report(
            manifest,
            self.root / item["paths"]["speakerRanking"],
            "audition-ranking",
        )

        def asr(other_manifest, *, snapshot, transcriber, output):
            self.write_report(other_manifest, output, "audition-qa")

        def rank(other_manifest, *, runtime, output):
            self.write_report(other_manifest, output, "audition-ranking")

        with (
            mock.patch.object(
                batch_qa,
                "load_asr_transcriber",
                return_value=(Path("snapshot"), object()),
            ),
            mock.patch.object(batch_qa, "run_qa_with_transcriber", side_effect=asr),
            mock.patch.object(batch_qa, "load_speaker_runtime", return_value=object()),
            mock.patch.object(batch_qa, "rank_audition_with_runtime", side_effect=rank),
            mock.patch.object(batch_qa, "release_cuda"),
        ):
            summary = run_batch(
                self.batch_path,
                repo_root=self.root,
                cache_dir=self.primary_cache,
                independent_cache_dir=self.independent_cache,
                output=Path("scratch/queue-summary.json"),
            )

        self.assertEqual(summary["referenceAsrAdjudicationQueueCount"], 1)
        queued = summary["referenceAsrAdjudicationQueue"][0]
        self.assertEqual(queued["characterId"], "alpha")
        self.assertEqual(queued["primaryOrdinaryWordErrors"], 1)
        self.assertIn("verify_reference_asr_adjudication.py run", queued["shell"])
        self.assertIn(
            "verify_reference_asr_adjudication.py adjudicate", queued["shell"]
        )
        self.assertIn("reference-asr-independent.json", queued["shell"])
        self.assertIn("reference-asr-adjudication.json", queued["shell"])
        run_argv = queued["commands"][0]["argv"]
        self.assertEqual(
            run_argv[run_argv.index("--cache-dir") + 1], str(self.independent_cache)
        )
        self.assertNotIn(str(self.primary_cache), run_argv)
        self.assertEqual(
            summary["modelCaches"],
            {
                "primaryWhisperSmallAndCampp": str(self.primary_cache),
                "independentWhisperLargeV3": str(self.independent_cache),
            },
        )

    def test_rejects_relative_missing_or_shared_cache_directories(self) -> None:
        cases = (
            (Path("relative"), self.independent_cache, "absolute canonical"),
            (self.primary_cache, Path("relative"), "absolute canonical"),
            (self.root / "missing", self.independent_cache, "does not exist"),
            (self.primary_cache, self.primary_cache, "must be distinct"),
        )
        for primary, independent, error in cases:
            with self.subTest(primary=primary, independent=independent):
                with self.assertRaisesRegex(BatchQaError, error):
                    run_batch(
                        self.batch_path,
                        repo_root=self.root,
                        cache_dir=primary,
                        independent_cache_dir=independent,
                        output=Path("scratch/summary.json"),
                    )

    def test_refuses_a_stale_existing_report(self) -> None:
        report = self.root / "scratch/items/alpha/audition/asr-qa.json"
        report.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "status": "audition-qa",
                    "auditionPlanSha256": "0" * 64,
                }
            ),
            encoding="utf-8",
        )
        with self.assertRaisesRegex(BatchQaError, "stale or unsupported"):
            run_batch(
                self.batch_path,
                repo_root=self.root,
                cache_dir=self.primary_cache,
                independent_cache_dir=self.independent_cache,
                output=Path("scratch/summary.json"),
            )


if __name__ == "__main__":
    unittest.main()
