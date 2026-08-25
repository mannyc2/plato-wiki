from __future__ import annotations

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/audio"))

import prepare_corpus_audio_qa as preparation  # noqa: E402
import produce_corpus_audio as production  # noqa: E402


def make_repo(root: Path) -> tuple[Path, dict]:
    screenplay = root / "audio/scripts/crito.json"
    screenplay.parent.mkdir(parents=True)
    screenplay.write_text('{"dialogue":"crito"}\n', encoding="utf-8")
    cast = root / "audio/cast.json"
    cast.write_text('{"status":"complete"}\n', encoding="utf-8")
    reference = root / "scratch/references/socrates.wav"
    reference.parent.mkdir(parents=True)
    reference.write_bytes(b"reference")
    references = [
        {
            "character_id": "socrates",
            "relative_path": "scratch/references/socrates.wav",
            "sha256": production.sha256_file(reference),
        }
    ]
    inputs = {
        "screenplay_path": "audio/scripts/crito.json",
        "screenplay_sha256": production.sha256_file(screenplay),
        "cast_path": "audio/cast.json",
        "cast_sha256": production.sha256_file(cast),
        "reference_paths": references,
        "reference_paths_sha256": production.content_sha256(references),
    }
    receipt = production.build_receipt(
        dialogue="crito",
        inputs=inputs,
        render={
            "plan_sha256": "1" * 64,
            "plan_path": (
                "/mnt/models/artifacts/plato-audio/plans/" + "1" * 64 + ".json"
            ),
            "complete_input_sha256": "2" * 64,
        },
        mastering={
            "plan_sha256": "3" * 64,
            "plan_path": (
                "/mnt/models/artifacts/plato-audio/mastering/plans/"
                + "3" * 64
                + ".json"
            ),
            "complete_assembly_sha256": "4" * 64,
            "artifact_path": (
                "/mnt/models/artifacts/plato-audio/mastering/artifacts/" + "3" * 64
            ),
            "mechanical_passed": True,
        },
    )
    receipt_root = root / "scratch/audio-corpus-production/receipts"
    production.write_receipt(receipt, receipt_root)
    return receipt_root, receipt


class FakeRunner(production.CommandRunner):
    def __init__(self, values: list[dict], file_hashes: dict[str, str]) -> None:
        self.values = list(values)
        self.file_hashes = file_hashes
        self.calls: list[tuple[str, tuple[str, ...]]] = []

    def json(self, argv, *, cwd, label):
        self.calls.append(("json", tuple(argv)))
        if not self.values:
            raise AssertionError(f"unexpected JSON command: {argv}")
        return self.values.pop(0)

    def run(self, argv, *, cwd, label):
        self.calls.append(("run", tuple(argv)))
        # remote_argv shell-quotes one command as argv[3]; the final token is the path.
        import shlex

        command = shlex.split(argv[3])
        path = command[-1]
        digest = self.file_hashes[path]
        return production.CompletedCommand(
            stdout=f"{digest}  {path}\n", stderr="", returncode=0
        )


def stage_values() -> tuple[list[dict], dict[str, str]]:
    asr_sha = "5" * 64
    handoff_sha = "6" * 64
    asr_path = (
        "/mnt/models/artifacts/plato-audio/full-master-asr/artifacts/"
        f"{asr_sha}/asr-evidence.json"
    )
    handoff_path = (
        "/mnt/models/artifacts/plato-audio/qa-handoffs/artifacts/"
        f"{handoff_sha}/qa-handoff.json"
    )
    values = [
        {
            "dialogue": "crito",
            "asr_plan_sha256": "7" * 64,
            "chapter_count": 2,
            "expected_words": 12,
            "working_master_sha256": "8" * 64,
            "model_repository": "fixture/asr",
            "model_revision": "9" * 40,
            "writes": False,
            "accepted": False,
            "human_listening": "not-performed",
        },
        {
            "dialogue": "crito",
            "status": "written",
            "evidence_sha256": asr_sha,
            "evidence_path": asr_path,
            "word_errors": 0,
            "expected_words": 12,
            "word_error_rate": 0.0,
            "ordinary_word_errors": 0,
            "accepted": False,
            "human_listening": "not-performed",
        },
        {
            "dialogue": "crito",
            "handoff_sha256": handoff_sha,
            "chapter_count": 2,
            "mechanical_passed": True,
            "asr_passed": True,
            "promotion_blockers": [
                "schema-v2-production-acceptance-review-not-provided"
            ],
            "writes": False,
            "accepted": False,
            "human_listening": "not-performed",
        },
        {
            "dialogue": "crito",
            "status": "written",
            "handoff_sha256": handoff_sha,
            "handoff_path": handoff_path,
            "promotion_blockers": [
                "schema-v2-production-acceptance-review-not-provided"
            ],
            "accepted": False,
            "human_listening": "not-performed",
        },
    ]
    return values, {asr_path: "a" * 64, handoff_path: "b" * 64}


class CorpusQaPreparationTests(unittest.TestCase):
    def test_dry_run_is_local_and_writes_nothing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, receipt = make_repo(root)
            runner = FakeRunner([], {})
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=runner,
            )
            result = preparer.run(("crito",), execute=False)
            self.assertTrue(result["dry_run"])
            self.assertFalse(result["accepted"])
            self.assertEqual(result["ready_count"], 1)
            self.assertEqual(result["blocked_count"], 0)
            self.assertEqual(result["dialogues"][0]["receipt_sha256"], receipt["receipt_sha256"])
            self.assertEqual(runner.calls, [])
            self.assertFalse((root / "scratch/postrender").exists())

    def test_dry_run_reports_all_missing_receipts_without_remote_calls(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            runner = FakeRunner([], {})
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=root / "scratch/receipts",
                output_root=root / "scratch/postrender",
                runner=runner,
            )
            result = preparer.run(("apology", "crito"), execute=False)
            self.assertEqual(result["status"], "corpus-audio-qa-preparation-blocked")
            self.assertEqual(result["ready_count"], 0)
            self.assertEqual(result["blocked_count"], 2)
            self.assertEqual(
                [row["dialogue"] for row in result["dialogues"]],
                ["apology", "crito"],
            )
            self.assertEqual(runner.calls, [])

    def test_execute_orders_exact_asr_and_handoff_plans_and_writes_index(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, _ = make_repo(root)
            values, hashes = stage_values()
            runner = FakeRunner(values, hashes)
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=runner,
            )
            result = preparer.run(("crito",), execute=True)
            self.assertEqual(
                [kind for kind, _ in runner.calls],
                ["json", "json", "run", "json", "json", "run"],
            )
            json_commands = [command for kind, command in runner.calls if kind == "json"]
            self.assertIn("7" * 64, json_commands[1][3])
            self.assertIn("6" * 64, json_commands[3][3])
            self.assertIn(
                "--cache-dir /mnt/models/cache/huggingface",
                json_commands[0][3],
            )
            self.assertNotIn("/mnt/models/hf/hub", json_commands[0][3])
            index_path = root / result["index_path"]
            index = json.loads(index_path.read_text(encoding="utf-8"))
            unsigned = {key: value for key, value in index.items() if key != "index_sha256"}
            self.assertEqual(index["index_sha256"], preparation.content_sha256(unsigned))
            self.assertEqual(index["schema_version"], 2)
            self.assertFalse(index["accepted"])
            self.assertEqual(index["human_listening"], "not-performed")
            self.assertEqual(index["dialogues"][0]["acceptance_review"]["status"], "missing")
            self.assertFalse((root / "audio/qa/crito.json").exists())
            self.assertFalse((root / "wiki/recordings/crito.json").exists())

    def test_multiple_current_receipts_fail_instead_of_guessing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, first = make_repo(root)
            second = production.build_receipt(
                dialogue="crito",
                inputs=first["inputs"],
                render={
                    "plan_sha256": "c" * 64,
                    "plan_path": (
                        "/mnt/models/artifacts/plato-audio/plans/" + "c" * 64 + ".json"
                    ),
                    "complete_input_sha256": "d" * 64,
                },
                mastering={
                    "plan_sha256": "e" * 64,
                    "plan_path": (
                        "/mnt/models/artifacts/plato-audio/mastering/plans/"
                        + "e" * 64
                        + ".json"
                    ),
                    "complete_assembly_sha256": "f" * 64,
                    "artifact_path": (
                        "/mnt/models/artifacts/plato-audio/mastering/artifacts/"
                        + "e" * 64
                    ),
                    "mechanical_passed": True,
                },
            )
            production.write_receipt(second, receipt_root)
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError, "multiple current"
            ):
                preparation.select_current_receipt(root, receipt_root, "crito")

    def test_receipt_reference_cannot_escape_through_a_symlinked_parent(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "repo"
            root.mkdir()
            receipt_root, _ = make_repo(root)
            references = root / "scratch/references"
            external = Path(directory) / "external-references"
            shutil.move(references, external)
            references.symlink_to(external, target_is_directory=True)
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError,
                "no production receipt matches current screenplay/cast bytes",
            ):
                preparation.select_current_receipt(root, receipt_root, "crito")

    def test_execute_rejects_handoff_result_that_differs_from_preview(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, _ = make_repo(root)
            values, hashes = stage_values()
            mismatched_sha = "9" * 64
            mismatched_path = (
                "/mnt/models/artifacts/plato-audio/qa-handoffs/artifacts/"
                f"{mismatched_sha}/qa-handoff.json"
            )
            values[3]["handoff_sha256"] = mismatched_sha
            values[3]["handoff_path"] = mismatched_path
            hashes[mismatched_path] = "c" * 64
            runner = FakeRunner(values, hashes)
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=runner,
            )
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError,
                "executed handoff differs from reviewed preview",
            ):
                preparer.run(("crito",), execute=True)
            self.assertFalse((root / "scratch/postrender").exists())

    def test_refresh_binds_later_acceptance_review_without_remote_or_acceptance(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, _ = make_repo(root)
            values, hashes = stage_values()
            runner = FakeRunner(values, hashes)
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=runner,
            )
            first = preparer.run(("crito",), execute=True)
            review = root / "scratch/audio-acceptance-reviews/crito.json"
            review.parent.mkdir(parents=True)
            review.write_text('{"human":"supplied but not yet validated"}\n')
            calls_before = list(runner.calls)
            refreshed = preparer.refresh_acceptance_reviews(root / first["index_path"])
            self.assertEqual(runner.calls, calls_before)
            self.assertEqual(refreshed["acceptance_review_present_count"], 1)
            index = json.loads((root / refreshed["index_path"]).read_text())
            self.assertEqual(
                index["dialogues"][0]["acceptance_review"],
                {
                    "path": "scratch/audio-acceptance-reviews/crito.json",
                    "status": "present-unvalidated",
                    "file_sha256": preparation.sha256_file(review),
                },
            )
            self.assertFalse(index["accepted"])

    def test_refresh_rejects_index_outside_its_content_address(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, _ = make_repo(root)
            values, hashes = stage_values()
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=FakeRunner(values, hashes),
            )
            first = preparer.run(("crito",), execute=True)
            source = root / first["index_path"]
            alias = source.with_name("not-the-index-sha.json")
            alias.write_bytes(source.read_bytes())
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError,
                "not at its content-addressed path",
            ):
                preparer.refresh_acceptance_reviews(alias)

    def test_refresh_rejects_summary_counts_inconsistent_with_rows(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            receipt_root, _ = make_repo(root)
            values, hashes = stage_values()
            preparer = preparation.CorpusQaPreparer(
                repo_root=root,
                receipt_root=receipt_root,
                output_root=root / "scratch/postrender",
                runner=FakeRunner(values, hashes),
            )
            first = preparer.run(("crito",), execute=True)
            source = root / first["index_path"]
            forged = json.loads(source.read_text(encoding="utf-8"))
            forged["canonical_corpus_complete"] = True
            forged["mechanical_passed_count"] = 27
            forged["asr_passed_count"] = 27
            core = {
                key: value
                for key, value in forged.items()
                if key != "index_sha256"
            }
            forged["index_sha256"] = preparation.content_sha256(core)
            forged_path = source.with_name(f"{forged['index_sha256']}.json")
            forged_path.write_text(
                json.dumps(forged, ensure_ascii=False, indent=2, sort_keys=True)
                + "\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError,
                "corpus summary is inconsistent",
            ):
                preparer.refresh_acceptance_reviews(forged_path)

    def test_accepted_child_output_is_rejected(self) -> None:
        values, _ = stage_values()
        result = values[1]
        result["accepted"] = True
        with self.assertRaisesRegex(
            preparation.CorpusQaPreparationError, "contract failed"
        ):
            preparation.validate_asr_result(result, "crito")

    def test_output_root_cannot_impersonate_accepted_records(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaisesRegex(
                preparation.CorpusQaPreparationError, "accepted QA or recordings"
            ):
                preparation.CorpusQaPreparer(
                    repo_root=root,
                    receipt_root=root / "receipts",
                    output_root=root / "audio/qa/postrender",
                    runner=FakeRunner([], {}),
                )


if __name__ == "__main__":
    unittest.main()
