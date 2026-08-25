from __future__ import annotations

import json
import shlex
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/audio"))

import produce_corpus_audio as corpus  # noqa: E402


def ready_report(dialogue: str, character_id: str = "socrates") -> dict:
    return {
        "schema_version": 1,
        "artifact_class": "screenplay-generation-report",
        "dialogue": dialogue,
        "dry_run": True,
        "counts_as_production_screenplay": False,
        "screenplay_status": "production-contract-valid",
        "production_eligible": True,
        "blockers": [],
        "prospective_screenplay": {
            "dialogue": dialogue,
            "entries": [{"id": f"{dialogue}-1", "character_id": character_id}],
        },
    }


def blocked_report(dialogue: str) -> dict:
    return {
        "schema_version": 1,
        "artifact_class": "screenplay-generation-report",
        "dialogue": dialogue,
        "dry_run": True,
        "counts_as_production_screenplay": False,
        "screenplay_status": "blocked",
        "production_eligible": False,
        "blockers": [{"code": "missing_dependency", "message": "missing"}],
    }


def receipt_inputs() -> dict:
    references = [
        {
            "character_id": "socrates",
            "relative_path": "scratch/references/socrates.wav",
            "sha256": "3" * 64,
        }
    ]
    return {
        "screenplay_path": "audio/scripts/crito.json",
        "screenplay_sha256": "1" * 64,
        "cast_path": "audio/cast.json",
        "cast_sha256": "2" * 64,
        "reference_paths": references,
        "reference_paths_sha256": corpus.content_sha256(references),
    }


def complete_receipt() -> dict:
    render_sha = "4" * 64
    master_sha = "6" * 64
    return corpus.build_receipt(
        dialogue="crito",
        inputs=receipt_inputs(),
        render={
            "plan_sha256": render_sha,
            "plan_path": f"/mnt/models/artifacts/plato-audio/plans/{render_sha}.json",
            "complete_input_sha256": "5" * 64,
        },
        mastering={
            "plan_sha256": master_sha,
            "plan_path": (
                f"/mnt/models/artifacts/plato-audio/mastering/plans/{master_sha}.json"
            ),
            "complete_assembly_sha256": "7" * 64,
            "artifact_path": (
                f"/mnt/models/artifacts/plato-audio/mastering/artifacts/{master_sha}"
            ),
            "mechanical_passed": True,
        },
    )


class FakeRunner(corpus.CommandRunner):
    def __init__(self, reports: dict[str, dict] | None = None) -> None:
        self.reports = reports or {}
        self.calls: list[tuple[str, tuple[str, ...]]] = []
        self.next_json: dict | None = None

    def run(self, argv, *, cwd, label):
        self.calls.append(("run", tuple(argv)))
        return corpus.CompletedCommand(stdout="", stderr="", returncode=0)

    def json(self, argv, *, cwd, label):
        self.calls.append(("json", tuple(argv)))
        if argv[:2] == ["bun", "scripts/audio/generate_screenplay.ts"]:
            return self.reports[argv[2]]
        if self.next_json is None:
            raise AssertionError(f"unexpected JSON command: {argv}")
        return self.next_json


class CorpusAudioProductionTests(unittest.TestCase):
    def make_repo(self, root: Path, *, cast_status: str = "partial") -> None:
        (root / "audio").mkdir(parents=True)
        (root / "audio/characters.json").write_text(
            json.dumps(
                {
                    "dialogues": [
                        {"dialogue": dialogue}
                        for dialogue in corpus.CANONICAL_DIALOGUES
                    ]
                }
            ),
            encoding="utf-8",
        )
        reference = root / "scratch/references/socrates.wav"
        reference.parent.mkdir(parents=True)
        reference.write_bytes(b"reference bytes")
        (root / "audio/cast.json").write_text(
            json.dumps(
                {
                    "status": cast_status,
                    "voices": [
                        {
                            "characterId": "socrates",
                            "reference": {
                                "relativePath": "scratch/references/socrates.wav",
                                "localSha256": corpus.sha256_file(reference),
                            },
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )

    def test_json_stdout_must_be_exactly_one_object(self) -> None:
        self.assertEqual(
            corpus._parse_json_stdout('{"ok": true}\n', "test"), {"ok": True}
        )
        with self.assertRaisesRegex(corpus.CorpusProductionError, "exactly one JSON"):
            corpus._parse_json_stdout('warning\n{"ok": true}\n', "test")
        with self.assertRaisesRegex(
            corpus.CorpusProductionError, "expected a JSON object"
        ):
            corpus._parse_json_stdout("[]", "test")

    def test_remote_command_is_one_shell_quoted_ssh_gpu_command(self) -> None:
        command = corpus.remote_argv(["python", "/a path/tool.py", "--value", "x y"])
        self.assertEqual(command[:3], ["ssh", "gpu", "--"])
        self.assertEqual(
            shlex.split(command[3]),
            [
                "/usr/bin/env",
                f"PATH={corpus.REMOTE_EXEC_PATH}",
                "python",
                "/a path/tool.py",
                "--value",
                "x y",
            ],
        )

    def test_render_plan_uses_only_returned_content_address(self) -> None:
        digest = "a" * 64
        value = {
            "status": "dots-render-plan-summary",
            "dialogue": "crito",
            "scope": "full-dialogue",
            "plan_sha256": digest,
            "plan_path": f"/mnt/models/artifacts/plato-audio/plans/{digest}.json",
            "task_count": 8,
            "cached": 3,
            "pending": 5,
        }
        self.assertEqual(
            corpus.validate_render_plan_summary(value, "crito"),
            {"plan_sha256": digest, "plan_path": value["plan_path"]},
        )
        value["plan_path"] = "/mnt/models/artifacts/plato-audio/plans/latest.json"
        with self.assertRaisesRegex(
            corpus.CorpusProductionError, "content-addressed path"
        ):
            corpus.validate_render_plan_summary(value, "crito")

    def test_mastering_must_remain_mechanical_and_unaccepted(self) -> None:
        digest = "b" * 64
        value = {
            "dialogue": "crito",
            "mastering_plan_sha256": digest,
            "render_plan_sha256": "a" * 64,
            "complete_assembly_sha256": "c" * 64,
            "writes_audio": False,
            "accepted": False,
            "plan_path": (
                f"/mnt/models/artifacts/plato-audio/mastering/plans/{digest}.json"
            ),
        }
        corpus.validate_mastering_plan_summary(
            value, "crito", "a" * 64, require_path=True
        )
        value["accepted"] = True
        with self.assertRaisesRegex(corpus.CorpusProductionError, "unaccepted"):
            corpus.validate_mastering_plan_summary(
                value, "crito", "a" * 64, require_path=True
            )

    def test_receipts_are_content_addressed_and_idempotent(self) -> None:
        receipt = complete_receipt()
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = corpus.write_receipt(receipt, root)
            second = corpus.write_receipt(receipt, root)
            self.assertEqual(first, second)
            self.assertEqual(first.name, f"{receipt['receipt_sha256']}.json")
            self.assertEqual(corpus.load_receipts(root, "crito"), [receipt])

    def test_tampered_receipt_fails_closed(self) -> None:
        receipt = complete_receipt()
        receipt["mastering"]["accepted"] = True
        with self.assertRaises(corpus.CorpusProductionError):
            corpus.validate_receipt(receipt)

    def test_default_status_is_read_only_and_never_contacts_gpu(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_repo(root)
            runner = FakeRunner({"crito": ready_report("crito")})
            producer = corpus.CorpusProducer(
                repo_root=root,
                receipt_root=root / "scratch/receipts",
                runner=runner,
            )
            result = producer.run(("crito",), execute=False)
            self.assertTrue(result["dry_run"])
            self.assertFalse(result["writes_audio"])
            self.assertEqual(result["ready_count"], 1)
            self.assertEqual(
                runner.calls,
                [
                    (
                        "json",
                        ("bun", "scripts/audio/generate_screenplay.ts", "crito"),
                    )
                ],
            )
            self.assertFalse((root / "scratch/receipts").exists())

    def test_execute_refuses_all_writes_if_preflight_is_blocked(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_repo(root)
            runner = FakeRunner({"crito": blocked_report("crito")})
            producer = corpus.CorpusProducer(
                repo_root=root,
                receipt_root=root / "scratch/receipts",
                runner=runner,
            )
            with self.assertRaisesRegex(
                corpus.CorpusProductionError, "before any production write"
            ):
                producer.run(("crito",), execute=True)
            self.assertEqual(len(runner.calls), 1)
            self.assertFalse((root / "audio/scripts").exists())

    def test_snapshot_sync_preserves_reference_relative_paths_without_delete(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_repo(root)
            runner = FakeRunner()
            producer = corpus.CorpusProducer(
                repo_root=root,
                receipt_root=root / "scratch/receipts",
                runner=runner,
            )
            producer.sync_snapshot(
                [
                    {
                        "character_id": "socrates",
                        "relative_path": "scratch/references/socrates.wav",
                        "sha256": "a" * 64,
                    }
                ]
            )
            commands = [call[1] for call in runner.calls]
            rsync_reference = next(
                command for command in commands if command[:2] == ("rsync", "-aR")
            )
            self.assertIn("./scratch/references/socrates.wav", rsync_reference)
            self.assertNotIn(
                "--delete", [item for command in commands for item in command]
            )

    def test_receipt_root_cannot_impersonate_accepted_qa(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaisesRegex(
                corpus.CorpusProductionError, "accepted QA or recording"
            ):
                corpus.CorpusProducer(
                    repo_root=root,
                    receipt_root=root / "audio/qa/corpus",
                    runner=FakeRunner(),
                )

    def test_malformed_resume_probe_does_not_trigger_gpu_render(self) -> None:
        class ProbeProducer(corpus.CorpusProducer):
            rendered = False

            def render_plan(self, dialogue):
                digest = "a" * 64
                return {
                    "plan_sha256": digest,
                    "plan_path": (
                        f"/mnt/models/artifacts/plato-audio/plans/{digest}.json"
                    ),
                }

            def mastering_plan(self, dialogue, render, *, write):
                raise corpus.CorpusProductionError("malformed JSON contract")

            def render_execute(self, dialogue, plan):
                self.rendered = True
                return {"complete_input_sha256": "b" * 64}

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            producer = ProbeProducer(
                repo_root=root,
                receipt_root=root / "receipts",
                runner=FakeRunner(),
            )
            with self.assertRaisesRegex(corpus.CorpusProductionError, "malformed"):
                producer.execute_dialogue("crito", receipt_inputs())
            self.assertFalse(producer.rendered)

    def test_dialogue_pipeline_is_strictly_ordered_and_receipted(self) -> None:
        class OrderedProducer(corpus.CorpusProducer):
            def __init__(self, **kwargs):
                super().__init__(**kwargs)
                self.events: list[str] = []

            def render_plan(self, dialogue):
                self.events.append("render-plan")
                digest = "a" * 64
                return {
                    "plan_sha256": digest,
                    "plan_path": (
                        f"/mnt/models/artifacts/plato-audio/plans/{digest}.json"
                    ),
                }

            def mastering_plan(self, dialogue, render, *, write):
                self.events.append("master-write" if write else "master-probe")
                if not write:
                    raise corpus.CommandExecutionError("assembly absent")
                digest = "c" * 64
                return {
                    "plan_sha256": digest,
                    "plan_path": (
                        "/mnt/models/artifacts/plato-audio/mastering/plans/"
                        f"{digest}.json"
                    ),
                    "complete_assembly_sha256": "d" * 64,
                }

            def render_execute(self, dialogue, plan):
                self.events.append("render")
                return {"complete_input_sha256": "b" * 64}

            def mastering_execute(self, dialogue, render, mastering):
                self.events.append("master-execute")
                return {
                    "artifact_path": (
                        "/mnt/models/artifacts/plato-audio/mastering/artifacts/"
                        f"{mastering['plan_sha256']}"
                    ),
                    "mechanical_passed": True,
                }

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            producer = OrderedProducer(
                repo_root=root,
                receipt_root=root / "receipts",
                runner=FakeRunner(),
            )
            receipt, path, resumed = producer.execute_dialogue(
                "crito", receipt_inputs()
            )
            self.assertEqual(
                producer.events,
                [
                    "render-plan",
                    "master-probe",
                    "render",
                    "master-write",
                    "master-execute",
                ],
            )
            self.assertFalse(resumed)
            self.assertTrue(path.is_file())
            self.assertFalse(receipt["accepted"])


if __name__ == "__main__":
    unittest.main()
