from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/audio"))

import produce_corpus_audio as production  # noqa: E402
import promote_audio_qa as promotion  # noqa: E402
import promote_corpus_audio_qa as corpus  # noqa: E402


def digest(value: bytes | str) -> str:
    if isinstance(value, str):
        value = value.encode("utf-8")
    return hashlib.sha256(value).hexdigest()


def write_json(path: Path, value: object) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = (
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    ).encode()
    path.write_bytes(content)
    return digest(content)


class CorpusFixture:
    def __init__(self, root: Path) -> None:
        self.repo = root / "repo"
        self.repo.mkdir()
        self.handoff_root = root / "handoffs"
        self.handoff_root.mkdir()
        self.artifact_root = root / "mastering"
        self.artifact_root.mkdir()
        self.dialogues = tuple(sorted(production.CANONICAL_DIALOGUES))
        write_json(
            self.repo / "audio/characters.json",
            {
                "schemaVersion": 3,
                "status": "complete",
                "dialogues": [{"dialogue": dialogue} for dialogue in self.dialogues],
            },
        )
        rows = []
        for dialogue in self.dialogues:
            evidence = digest(f"handoff:{dialogue}")
            handoff_path = (
                self.handoff_root / "artifacts" / evidence / "qa-handoff.json"
            )
            handoff_file_sha = write_json(
                handoff_path,
                {"dialogue": dialogue, "evidence_sha256": evidence},
            )
            review_relative = f"scratch/audio-acceptance-reviews/{dialogue}.json"
            review_sha = write_json(
                self.repo / review_relative,
                {"dialogue": dialogue, "disposition": "accepted"},
            )
            rows.append(
                {
                    "dialogue": dialogue,
                    "receipt": {
                        "path": f"scratch/receipts/{dialogue}.json",
                        "file_sha256": digest(f"receipt-file:{dialogue}"),
                        "receipt_sha256": digest(f"receipt:{dialogue}"),
                    },
                    "asr": {
                        "plan_sha256": digest(f"asr-plan:{dialogue}"),
                        "evidence_sha256": digest(f"asr:{dialogue}"),
                        "path": f"/artifacts/asr/{dialogue}.json",
                        "file_sha256": digest(f"asr-file:{dialogue}"),
                        "word_errors": 0,
                        "ordinary_word_errors": 0,
                        "word_error_rate": 0.0,
                        "passed": True,
                    },
                    "handoff": {
                        "evidence_sha256": evidence,
                        "path": str(handoff_path),
                        "file_sha256": handoff_file_sha,
                        "mechanical_passed": True,
                        "promotion_blockers": [
                            "schema-v2-production-acceptance-review-not-provided"
                        ],
                        "accepted": False,
                        "human_listening": "not-performed",
                    },
                    "acceptance_review": {
                        "path": review_relative,
                        "status": "present-unvalidated",
                        "file_sha256": review_sha,
                    },
                    "next_stage": "validate-production-acceptance-review",
                }
            )
        core = {
            "schema_version": 2,
            "status": corpus.INDEX_STATUS,
            "accepted": False,
            "human_listening": "not-performed",
            "remote": {"host": "fixture"},
            "dialogue_count": len(rows),
            "canonical_corpus_complete": True,
            "mechanical_passed_count": len(rows),
            "asr_passed_count": len(rows),
            "acceptance_review_present_count": len(rows),
            "dialogues": rows,
        }
        index = {
            **core,
            "index_sha256": hashlib.sha256(corpus.canonical_json(core)).hexdigest(),
        }
        self.index = self.repo / "scratch/audio-corpus-postrender/handoff-index.json"
        write_json(self.index, index)

    def fake_plan_builder(self, **kwargs) -> dict:
        dialogue = kwargs["handoff"]["dialogue"]
        qa = {"dialogue": dialogue, "status": "accepted"}
        recording = {"dialogue": dialogue, "status": "accepted"}
        chapter_bytes = f"chapter:{dialogue}".encode()
        plan_sha = digest(f"plan:{dialogue}")
        return {
            "dialogue": dialogue,
            "plan_sha256": plan_sha,
            "qa_target": {
                "path": f"audio/qa/{dialogue}.json",
                "sha256": promotion.sha256_bytes(promotion.pretty_json(qa)),
            },
            "recording_target": {
                "path": f"wiki/recordings/{dialogue}.json",
                "sha256": promotion.sha256_bytes(promotion.pretty_json(recording)),
            },
            "qa": qa,
            "recording": recording,
            "chapter_artifacts": [
                {
                    "target_path": str(
                        self.artifact_root
                        / "artifacts"
                        / plan_sha
                        / "chapters"
                        / "chapter-1.wav"
                    ),
                    "relative_path": f"artifacts/{plan_sha}/chapters/chapter-1.wav",
                    "sha256": digest(chapter_bytes),
                }
            ],
        }

    def build(self):
        return corpus.build_corpus_promotion_plan(
            repo_root=self.repo,
            handoff_root=self.handoff_root,
            artifact_root=self.artifact_root,
            input_index_path=self.index,
            generated_at="2026-07-16T20:00:00Z",
            plan_builder=self.fake_plan_builder,
            plan_validator=lambda _plan: None,
        )

    def executor(self, plan, **_kwargs):
        qa_path = self.repo / plan["qa_target"]["path"]
        recording_path = self.repo / plan["recording_target"]["path"]
        qa_path.parent.mkdir(parents=True, exist_ok=True)
        recording_path.parent.mkdir(parents=True, exist_ok=True)
        qa_path.write_bytes(promotion.pretty_json(plan["qa"]))
        recording_path.write_bytes(promotion.pretty_json(plan["recording"]))
        for chapter in plan["chapter_artifacts"]:
            path = Path(chapter["target_path"])
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(f"chapter:{plan['dialogue']}".encode())
        return {
            "dialogue": plan["dialogue"],
            "chapter_count": len(plan["chapter_artifacts"]),
        }


class CorpusPromotionTests(unittest.TestCase):
    def test_builds_one_deterministic_review_hash_for_all_27_dialogues(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = CorpusFixture(Path(directory))
            first, plans = fixture.build()
            second, second_plans = fixture.build()
            self.assertEqual(first, second)
            self.assertEqual(plans, second_plans)
            self.assertEqual(first["schema_version"], 2)
            self.assertEqual(first["dialogue_count"], 27)
            self.assertEqual(
                [row["dialogue"] for row in first["dialogues"]],
                list(fixture.dialogues),
            )
            self.assertFalse((fixture.repo / "audio/qa/apology.json").exists())
            self.assertFalse((fixture.repo / "wiki/recordings/timaeus.json").exists())

    def test_hard_rejects_legacy_corpus_index_schema_v1(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = CorpusFixture(Path(directory))
            value = json.loads(fixture.index.read_text(encoding="utf-8"))
            value["schema_version"] = 1
            core = {key: entry for key, entry in value.items() if key != "index_sha256"}
            value["index_sha256"] = hashlib.sha256(
                corpus.canonical_json(core)
            ).hexdigest()
            write_json(fixture.index, value)
            with self.assertRaisesRegex(
                corpus.CorpusPromotionError, "identity or count is invalid"
            ):
                fixture.build()

    def test_refuses_an_incomplete_or_unreviewed_corpus_index(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = CorpusFixture(Path(directory))
            value = json.loads(fixture.index.read_text(encoding="utf-8"))
            value["dialogues"][0]["acceptance_review"] = {
                "path": "scratch/audio-acceptance-reviews/apology.json",
                "status": "missing",
            }
            core = {key: entry for key, entry in value.items() if key != "index_sha256"}
            value["index_sha256"] = hashlib.sha256(
                corpus.canonical_json(core)
            ).hexdigest()
            write_json(fixture.index, value)
            with self.assertRaisesRegex(
                corpus.CorpusPromotionError, "not ready for production-acceptance"
            ):
                fixture.build()

    def test_executes_all_dialogues_with_one_final_validator(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = CorpusFixture(Path(directory))
            plan, dialogue_plans = fixture.build()
            validations = []
            result = corpus.execute_corpus_promotion_plan(
                plan,
                dialogue_plans,
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                reviewed_plan_sha256=plan["plan_sha256"],
                executor=fixture.executor,
                validator=lambda: (validations.append("called") or 0, ""),
            )
            self.assertEqual(result["dialogue_count"], 27)
            self.assertEqual(result["chapter_count"], 27)
            self.assertEqual(validations, ["called"])
            self.assertTrue((fixture.repo / "audio/qa/apology.json").is_file())
            self.assertTrue((fixture.repo / "wiki/recordings/timaeus.json").is_file())

    def test_final_validation_failure_rolls_back_the_whole_batch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = CorpusFixture(Path(directory))
            plan, dialogue_plans = fixture.build()
            with self.assertRaisesRegex(
                corpus.CorpusPromotionError, "validator failed"
            ):
                corpus.execute_corpus_promotion_plan(
                    plan,
                    dialogue_plans,
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    reviewed_plan_sha256=plan["plan_sha256"],
                    executor=fixture.executor,
                    validator=lambda: (1, "fixture validator failed"),
                )
            for dialogue in fixture.dialogues:
                self.assertFalse((fixture.repo / f"audio/qa/{dialogue}.json").exists())
                self.assertFalse(
                    (fixture.repo / f"wiki/recordings/{dialogue}.json").exists()
                )


if __name__ == "__main__":
    unittest.main()
