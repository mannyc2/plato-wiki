from __future__ import annotations

import copy
import hashlib
import json
import struct
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts/audio"))

import promote_audio_qa as promotion  # noqa: E402
from master_audio import inspect_rf64_pcm24  # noqa: E402


SAMPLE_RATE = 48_000


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_rf64(path: Path, frames: int) -> None:
    payload = b"\x01\x02\x03" * frames
    data_size = len(payload)
    padding = data_size & 1
    file_size = 80 + data_size + padding
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(
        b"".join(
            (
                b"RF64",
                struct.pack("<I", (1 << 32) - 1),
                b"WAVE",
                b"ds64",
                struct.pack("<IQQQI", 28, file_size - 8, data_size, frames, 0),
                b"fmt ",
                struct.pack(
                    "<IHHIIHH",
                    16,
                    1,
                    1,
                    SAMPLE_RATE,
                    SAMPLE_RATE * 3,
                    3,
                    24,
                ),
                b"data",
                struct.pack("<I", (1 << 32) - 1),
                payload,
                b"\x00" if padding else b"",
            )
        )
    )


def chapter(
    chapter_id: str,
    start_frame: int,
    end_frame: int,
    *,
    character_id: str,
    commentary_id: str,
) -> dict:
    return {
        "chapter_id": chapter_id,
        "source_coverage": {
            "expected_words": 2,
            "covered_words": 2,
            "uncovered_words": 0,
            "duplicated_words": 0,
            "passed": True,
        },
        "commentary_coverage": {
            "expected_ids": [commentary_id],
            "covered_ids": [commentary_id],
            "missing_ids": [],
            "duplicate_ids": [],
            "passed": True,
        },
        "cast": {
            "character_ids": [character_id],
            "unresolved_character_ids": [],
            "mismatched_character_ids": [],
            "passed": True,
        },
        "asr": {
            "expected_words": 2,
            "recognized_words": 2,
            "word_errors": 0,
            "ordinary_word_errors": 0,
            "word_error_rate": 0.0,
            "transcript_sha256": "a" * 64,
            "passed": True,
        },
        "audio_slice": {
            "working_master_path": "/artifact/master.wav",
            "working_master_sha256": "0" * 64,
            "start_frame": start_frame,
            "end_frame": end_frame,
            "start_seconds": start_frame / SAMPLE_RATE,
            "end_seconds": end_frame / SAMPLE_RATE,
            "renderer_chapter": {"chapter_id": chapter_id},
            "measurements": {
                "chapter_id": chapter_id,
                "working_master_sha256": "0" * 64,
                "start_frame": start_frame,
                "end_frame": end_frame,
                "start_seconds": start_frame / SAMPLE_RATE,
                "end_seconds": end_frame / SAMPLE_RATE,
                "commands": {"loudness": [], "silence": []},
                "pcm": {
                    "frames": end_frame - start_frame,
                    "duration_seconds": (end_frame - start_frame) / SAMPLE_RATE,
                    "sample_peak_dbfs": -2.0,
                    "clipped_samples": 0,
                },
                "loudness": {
                    "input_i": -19.0,
                    "input_tp": -1.2,
                    "input_lra": 1.0,
                    "input_thresh": -29.0,
                    "target_offset": 0.0,
                },
                "silence_segments": [],
                "max_silence_ms": 0,
                "unexpected_silence_segments": [],
                "gates": {
                    "loudness_passed": True,
                    "clipping_passed": True,
                    "silence_passed": True,
                },
            },
        },
        "listening": {"status": "not-performed", "passed": False},
        "accepted": False,
    }


class PromotionFixture:
    def __init__(self, root: Path) -> None:
        root = root.resolve()
        self.repo = root / "repo"
        self.repo.mkdir()
        self.artifact_root = root / "artifacts"
        self.artifact_root.mkdir()
        self.dialogue = "crito"
        self.plan_sha = "4" * 64
        self.artifact_dir = self.artifact_root / "artifacts" / self.plan_sha
        self.artifact_dir.mkdir(parents=True)
        self.master = self.artifact_dir / "master.wav"
        write_rf64(self.master, SAMPLE_RATE * 2)
        self.publication = self.artifact_dir / "publication.mp3"
        self.publication.write_bytes(b"publication")
        self.result = self.artifact_dir / "mastering.json"
        self.result.write_text('{"result":true}\n', encoding="utf-8")
        self.mechanical = self.artifact_dir / "mechanical-qa.json"
        self.mechanical.write_text('{"mechanical":true}\n', encoding="utf-8")
        self.plan = self.artifact_root / "plans" / f"{self.plan_sha}.json"
        self.plan.parent.mkdir()
        self.plan.write_text('{"plan":true}\n', encoding="utf-8")

        cast_path = self.repo / "audio/cast.json"
        cast_path.parent.mkdir(parents=True)
        cast_path.write_text('{"cast":true}\n', encoding="utf-8")
        self.cast_sha = promotion.sha256_file(cast_path)
        self.screenplay = {
            "schema_version": 2,
            "dialogue": self.dialogue,
            "cast_sha256": self.cast_sha,
            "chapters": [
                {
                    "id": "first",
                    "commentary_id": "comm-first",
                    "title": "First",
                },
                {
                    "id": "second",
                    "commentary_id": "comm-second",
                    "title": "Second",
                },
            ],
            "entries": [],
        }
        screenplay_path = self.repo / "audio/scripts/crito.json"
        screenplay_path.parent.mkdir(parents=True)
        screenplay_path.write_text(json.dumps(self.screenplay) + "\n", encoding="utf-8")
        self.screenplay_sha = promotion.sha256_file(screenplay_path)

        chapters = [
            chapter(
                "first",
                0,
                SAMPLE_RATE,
                character_id="socrates",
                commentary_id="comm-first",
            ),
            chapter(
                "second",
                SAMPLE_RATE,
                SAMPLE_RATE * 2,
                character_id="crito",
                commentary_id="comm-second",
            ),
        ]
        master_sha = promotion.sha256_file(self.master)
        for item in chapters:
            item["audio_slice"]["working_master_sha256"] = master_sha
            item["audio_slice"]["measurements"]["working_master_sha256"] = master_sha
            item["audio_slice"]["working_master_path"] = str(self.master)
        self.handoff = {
            "schema_version": 2,
            "status": "production-audio-qa-handoff-unaccepted",
            "evidence_sha256": "e" * 64,
            "implementation": {"fixture": True},
            "measurement_policy": {"fixture": True},
            "dialogue": self.dialogue,
            "production": {
                "screenplay": {
                    "path": "audio/scripts/crito.json",
                    "sha256": self.screenplay_sha,
                    "schema_version": 2,
                },
                "cast": {"path": "audio/cast.json", "sha256": self.cast_sha},
                "render_graph": {"fixture": True},
                "renderer_assembly": {"fixture": True},
                "mastering": {
                    "plan": {
                        "path": str(self.plan),
                        "plan_sha256": self.plan_sha,
                        "artifact_sha256": promotion.sha256_file(self.plan),
                    },
                    "artifact_directory": str(self.artifact_dir),
                    "result_manifest_path": str(self.result),
                    "result_manifest_sha256": promotion.sha256_file(self.result),
                    "mechanical_qa_path": str(self.mechanical),
                    "mechanical_qa_sha256": promotion.sha256_file(self.mechanical),
                    "mechanical_evidence_sha256": "f" * 64,
                    "working_master_sha256": master_sha,
                    "publication_sha256": promotion.sha256_file(self.publication),
                },
                "full_master_asr": {
                    "path": str(root / "asr.json"),
                    "file_sha256": "a" * 64,
                    "evidence_sha256": "b" * 64,
                    "plan_sha256": "c" * 64,
                    "model_repository": "fixture/asr",
                    "model_revision": "d" * 40,
                },
                "bound_file_inventory": {"file_count": 1, "sha256": "a" * 64},
                "paths": {"fixture": True},
            },
            "source_coverage": {
                "passed": True,
                "expected_words": 4,
                "covered_words": 4,
                "uncovered_words": 0,
                "duplicated_words": 0,
                "repairs_verified": True,
            },
            "commentary_coverage": {
                "passed": True,
                "expected_ids": ["comm-first", "comm-second"],
                "covered_ids": ["comm-first", "comm-second"],
                "missing_ids": [],
                "duplicate_ids": [],
            },
            "asr": {
                "passed": True,
                "maximum_word_error_rate": 0.02,
                "maximum_ordinary_word_errors": 0,
                "expected_text_sha256": "1" * 64,
                "transcript_sha256": "2" * 64,
                "expected_words": 4,
                "recognized_words": 4,
                "word_errors": 0,
                "ordinary_word_errors": 0,
                "word_error_rate": 0.0,
                "exceptions": {"status": "complete-zero-errors", "items": []},
            },
            "audio": {
                "working_master_path": str(self.master),
                "working_master_sha256": master_sha,
                "duration_seconds": 2.0,
                "sample_rate_hz": SAMPLE_RATE,
                "channels": 1,
                "sample_format": "PCM_24",
                "target_lufs": -19,
                "tolerance_lu": 1,
                "integrated_lufs": -19.0,
                "true_peak_dbtp": -1.2,
                "clipped_samples": 0,
                "silence": {
                    "max_allowed_ms": 800,
                    "max_observed_ms": 0,
                    "unexpected_segments": [],
                },
                "mechanical_gates": {
                    "loudness_passed": True,
                    "clipping_passed": True,
                    "duration_passed": True,
                    "silence_passed": True,
                    "mechanical_passed": True,
                },
            },
            "cast_consistency": {
                "passed": True,
                "script_character_ids": ["crito", "socrates"],
                "selected_character_ids": ["crito", "socrates"],
                "unresolved_character_ids": [],
                "mismatched_character_ids": [],
                "recurring_voice_change_character_ids": [],
            },
            "chapters": chapters,
            "human_listening": {"status": "not-performed", "passed": False},
            "promotion": {"accepted": False},
            "acceptance": {"accepted": False},
        }
        self.review = {
            "schema_version": 2,
            "dialogue": self.dialogue,
            "handoff_evidence_sha256": self.handoff["evidence_sha256"],
            "working_master_sha256": master_sha,
            "acceptance_basis": promotion.ACTUAL_LISTENING_BASIS,
            "authorized_by": "fixture-reviewer",
            "authorized_at": "2026-07-16",
            "rationale": "The fixture reviewer completed the exact master review.",
            "listening_status": "performed",
            "accepted_chapter_ids": ["first", "second"],
            "disposition": "accepted",
            "findings": [],
            "asr_exceptions": [],
        }

    def write_draft_recording(self) -> tuple[Path, bytes, dict]:
        manifest = {
            "schema_version": 2,
            "recording_id": "crito-dots-review-seed44",
            "dialogue": self.dialogue,
            "status": "draft",
            "audio": {
                "path": f"artifacts/{self.plan_sha}/publication.mp3",
                "mime_type": "audio/mpeg",
                "duration_seconds": 2.0,
                "sha256": promotion.sha256_file(self.publication),
            },
            "chapters": [
                {
                    "chapter_id": "first",
                    "commentary_id": "comm-first",
                    "start_frame": 0,
                    "title": "First",
                },
                {
                    "chapter_id": "second",
                    "commentary_id": "comm-second",
                    "start_frame": SAMPLE_RATE,
                    "title": "Second",
                },
            ],
            "cast": [
                {
                    "character_id": "socrates",
                    "name": "Socrates",
                    "voice": "dots-youtube-socrates-seed44",
                },
                {
                    "character_id": "crito",
                    "name": "Crito",
                    "voice": "dots-youtube-crito-seed48",
                },
            ],
            "provenance": [
                {
                    "label": "Socrates voice reference",
                    "value": "Operator-supplied Plato audiobook channel",
                    "url": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                },
                {
                    "label": "Review state",
                    "value": "Draft review candidate pending production acceptance",
                },
            ],
        }
        path = self.repo / "wiki/recordings/crito.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        content = promotion.pretty_json(manifest)
        path.write_bytes(content)
        return path, content, manifest


class PromoteAudioQaTests(unittest.TestCase):
    def test_materialized_chapter_is_exact_rf64_frame_slice(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            target = Path(directory) / "chapter.wav"
            record = promotion.plan_chapter_artifact(
                fixture.master,
                target,
                start_frame=SAMPLE_RATE,
                end_frame=SAMPLE_RATE * 2,
            )
            self.assertFalse(target.exists())
            promotion.materialize_chapter_artifact(
                fixture.master,
                target,
                start_frame=SAMPLE_RATE,
                end_frame=SAMPLE_RATE * 2,
                expected_sha256=record["sha256"],
            )
            evidence = inspect_rf64_pcm24(target)
            self.assertEqual(evidence["sample_count"], SAMPLE_RATE)
            self.assertEqual(promotion.sha256_file(target), record["sha256"])

    def test_acceptance_review_must_bind_exact_master_and_all_chapters(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            promotion.validate_acceptance_review(fixture.review, fixture.handoff)
            bad = copy.deepcopy(fixture.review)
            bad["accepted_chapter_ids"].pop()
            with self.assertRaisesRegex(promotion.PromotionError, "chapter"):
                promotion.validate_acceptance_review(bad, fixture.handoff)
            bad = copy.deepcopy(fixture.review)
            bad["findings"] = [
                {
                    "code": "bad-cadence",
                    "severity": "failure",
                    "description": "Rerender required.",
                }
            ]
            with self.assertRaisesRegex(promotion.PromotionError, "failure"):
                promotion.validate_acceptance_review(bad, fixture.handoff)

    def test_builds_accepted_qa_and_recording_manifest_without_writing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            self.assertFalse((fixture.repo / "audio/qa/crito.json").exists())
            self.assertFalse((fixture.repo / "wiki/recordings/crito.json").exists())
            self.assertEqual(plan["qa"]["status"], "accepted")
            self.assertTrue(plan["qa"]["listening_review"]["passed"])
            self.assertEqual(
                plan["qa"]["production_acceptance"]["basis"],
                promotion.ACTUAL_LISTENING_BASIS,
            )
            self.assertEqual(plan["recording"]["status"], "accepted")
            self.assertEqual(
                [item["start_frame"] for item in plan["recording"]["chapters"]],
                [0, SAMPLE_RATE],
            )
            self.assertEqual(
                len({item["audio_path"] for item in plan["qa"]["chapters"]}), 2
            )
            result = subprocess.run(
                [
                    "bun",
                    "-e",
                    (
                        'import { validateAudioQa } from "./packages/harness/src/audio-production.ts";'
                        "const qa = await Bun.stdin.text();"
                        'console.log(JSON.stringify(validateAudioQa("audio/qa/crito.json", qa)));'
                    ),
                ],
                cwd=ROOT,
                input=json.dumps(plan["qa"]),
                text=True,
                capture_output=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(json.loads(result.stdout), [])

    def test_operator_waiver_is_truthful_and_cannot_bypass_production_gates(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            waiver = copy.deepcopy(fixture.review)
            waiver.update(
                {
                    "acceptance_basis": promotion.OPERATOR_WAIVER_BASIS,
                    "authorized_by": "cjpher",
                    "rationale": (
                        "The operator accepts the mechanically and ASR passing "
                        "production without complete-master human listening."
                    ),
                    "listening_status": "not-performed",
                    "disposition": "accepted-with-listening-waiver",
                }
            )
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=waiver,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            self.assertEqual(
                plan["qa"]["listening_review"],
                {
                    "status": "not-performed",
                    "passed": False,
                    "reviewer": None,
                    "reviewed_at": None,
                    "scope": "none",
                    "chapter_ids": [],
                    "disposition": "not-performed",
                    "findings": [],
                },
            )
            self.assertTrue(plan["qa"]["production_acceptance"]["passed"])
            self.assertEqual(
                plan["qa"]["production_acceptance"]["basis"],
                promotion.OPERATOR_WAIVER_BASIS,
            )
            self.assertTrue(
                all(
                    chapter["listening_passed"] is False
                    and chapter["listening_disposition"] == "not-performed"
                    for chapter in plan["qa"]["chapters"]
                )
            )

            contradictory = copy.deepcopy(waiver)
            contradictory["listening_status"] = "performed"
            with self.assertRaisesRegex(promotion.PromotionError, "not-performed"):
                promotion.validate_acceptance_review(contradictory, fixture.handoff)

            legacy = copy.deepcopy(waiver)
            legacy["schema_version"] = 1
            with self.assertRaisesRegex(promotion.PromotionError, "bind the exact"):
                promotion.validate_acceptance_review(legacy, fixture.handoff)

            fixture.handoff["source_coverage"]["passed"] = False
            with self.assertRaisesRegex(promotion.PromotionError, "gates"):
                promotion.build_promotion_plan(
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    handoff=fixture.handoff,
                    review=waiver,
                    generated_at="2026-07-16T16:00:00Z",
                    handoff_validator=lambda _value: None,
                )

    def test_promotes_hash_bound_draft_and_preserves_display_provenance(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            target, draft_bytes, draft = fixture.write_draft_recording()
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            self.assertEqual(
                plan["recording_target"]["expected_existing"],
                {
                    "status": "draft",
                    "recording_id": draft["recording_id"],
                    "sha256": sha256_bytes(draft_bytes),
                },
            )
            expected_voice_provenance = [draft["provenance"][0]]
            self.assertEqual(plan["recording"]["cast"], draft["cast"])
            self.assertEqual(
                plan["recording"]["provenance"],
                expected_voice_provenance,
            )

            result = promotion.execute_promotion_plan(
                plan,
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                reviewed_plan_sha256=plan["plan_sha256"],
                validator=lambda: (0, ""),
            )
            accepted = json.loads(target.read_text(encoding="utf-8"))
            self.assertEqual(accepted["status"], "accepted")
            self.assertEqual(accepted["cast"], draft["cast"])
            self.assertEqual(
                accepted["provenance"],
                expected_voice_provenance,
            )
            self.assertNotIn(
                "Review state",
                [row["label"] for row in accepted["provenance"]],
            )
            self.assertEqual(result["replaced_repo_file_count"], 1)

            repeated = promotion.execute_promotion_plan(
                plan,
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                reviewed_plan_sha256=plan["plan_sha256"],
                validator=lambda: (0, ""),
            )
            self.assertEqual(repeated["replaced_repo_file_count"], 0)

    def test_stale_or_different_draft_is_rejected_before_artifact_writes(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            target, _draft_bytes, draft = fixture.write_draft_recording()
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            changed = copy.deepcopy(draft)
            changed["cast"][0]["voice"] = "different-voice-after-review"
            changed_bytes = promotion.pretty_json(changed)
            target.write_bytes(changed_bytes)

            with self.assertRaisesRegex(promotion.PromotionError, "differs"):
                promotion.execute_promotion_plan(
                    plan,
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    reviewed_plan_sha256=plan["plan_sha256"],
                    validator=lambda: (0, ""),
                )
            self.assertEqual(target.read_bytes(), changed_bytes)
            self.assertFalse((fixture.repo / "audio/qa/crito.json").exists())
            self.assertFalse((fixture.artifact_dir / "chapters").exists())

    def test_failed_validation_restores_exact_draft_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            target, draft_bytes, _draft = fixture.write_draft_recording()
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )

            with self.assertRaisesRegex(promotion.PromotionError, "validator"):
                promotion.execute_promotion_plan(
                    plan,
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    reviewed_plan_sha256=plan["plan_sha256"],
                    validator=lambda: (1, "validator failed"),
                )
            self.assertEqual(target.read_bytes(), draft_bytes)
            self.assertFalse((fixture.repo / "audio/qa/crito.json").exists())
            self.assertFalse((fixture.artifact_dir / "chapters").exists())

    def test_execute_is_idempotent_and_rolls_back_repo_files_on_validation_failure(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            with self.assertRaisesRegex(promotion.PromotionError, "validator"):
                promotion.execute_promotion_plan(
                    plan,
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    reviewed_plan_sha256=plan["plan_sha256"],
                    validator=lambda: (1, "validator failed"),
                )
            self.assertFalse((fixture.repo / "audio/qa/crito.json").exists())
            self.assertFalse((fixture.repo / "wiki/recordings/crito.json").exists())
            self.assertFalse((fixture.artifact_dir / "chapters").exists())

            promotion.execute_promotion_plan(
                plan,
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                reviewed_plan_sha256=plan["plan_sha256"],
                validator=lambda: (0, ""),
            )
            promotion.execute_promotion_plan(
                plan,
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                reviewed_plan_sha256=plan["plan_sha256"],
                validator=lambda: (0, ""),
            )
            self.assertTrue((fixture.repo / "audio/qa/crito.json").is_file())
            self.assertTrue((fixture.repo / "wiki/recordings/crito.json").is_file())

    def test_changed_existing_canonical_target_fails_before_artifact_writes(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = PromotionFixture(Path(directory))
            plan = promotion.build_promotion_plan(
                repo_root=fixture.repo,
                artifact_root=fixture.artifact_root,
                handoff=fixture.handoff,
                review=fixture.review,
                generated_at="2026-07-16T16:00:00Z",
                handoff_validator=lambda _value: None,
            )
            target = fixture.repo / "audio/qa/crito.json"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text('{"different":true}\n', encoding="utf-8")
            with self.assertRaisesRegex(promotion.PromotionError, "differs"):
                promotion.execute_promotion_plan(
                    plan,
                    repo_root=fixture.repo,
                    artifact_root=fixture.artifact_root,
                    reviewed_plan_sha256=plan["plan_sha256"],
                    validator=lambda: (0, ""),
                )
            self.assertFalse((fixture.artifact_dir / "chapters").exists())


if __name__ == "__main__":
    unittest.main()
