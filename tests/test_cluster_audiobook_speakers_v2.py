from __future__ import annotations

import copy
import hashlib
import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

import cluster_audiobook_speakers_v2 as cluster_v2  # noqa: E402


def caption_payload(*, final_word_ms: int = 29_500) -> dict:
    starts = list(range(500, final_word_ms, 500)) + [final_word_ms]
    return {
        "events": [
            {
                "tStartMs": 0,
                "dDurationMs": final_word_ms + 500,
                "segs": [
                    {"utf8": f" word{index}", "tOffsetMs": start}
                    for index, start in enumerate(starts)
                ],
            }
        ]
    }


class FrozenCoreAndRegistryTests(unittest.TestCase):
    def test_v1_core_bytes_remain_exactly_frozen(self) -> None:
        core_path = SCRIPT_DIR / "cluster_audiobook_speakers.py"
        digest = hashlib.sha256(core_path.read_bytes()).hexdigest()

        self.assertEqual(digest, cluster_v2.FROZEN_CORE_SHA256)
        self.assertEqual(
            digest,
            "fbc00c2cf44557fdae5225a1dc2f0a8ae7be34eea63459abd2c0a3cb67df75d6",
        )
        with patch.object(
            cluster_v2.core,
            "sha256_file",
            side_effect=AssertionError("core digest must not authenticate itself"),
        ):
            self.assertEqual(cluster_v2.verify_frozen_core(), digest)

    def test_current_registry_has_the_exact_29_video_worklist(self) -> None:
        payload = json.loads(
            (
                Path(__file__).resolve().parents[1] / "audio" / "reference-sources.json"
            ).read_text(encoding="utf-8")
        )
        selections = cluster_v2.registry_selections(payload)

        self.assertEqual(len(selections), 29)
        self.assertEqual(len({item.dialogue for item in selections}), 27)
        self.assertEqual(sum(item.duration_seconds for item in selections), 247_213)
        self.assertEqual(
            [item.video_id for item in selections if item.dialogue == "laws"],
            ["uddowL-Bw_M", "QH-DQq-ToUQ"],
        )
        self.assertEqual(
            [item.video_id for item in selections if item.dialogue == "republic"],
            ["oOhwknoLwSc", "O82aan4EzHY"],
        )
        self.assertTrue(
            all(item.key == f"{item.dialogue}:{item.video_id}" for item in selections)
        )

    def test_generalized_module_never_names_the_cast_registry(self) -> None:
        source = (SCRIPT_DIR / "cluster_audiobook_speakers_v2.py").read_text(
            encoding="utf-8"
        )

        self.assertNotIn("audio/cast.json", source)
        self.assertNotIn("characterId", source)


class CorpusPlanFixture(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.registry = self.root / "reference-sources.json"
        self.sources = self.root / "sources"
        self.captions = self.root / "captions"
        self.artifacts = self.root / "artifacts"
        self.plans = self.artifacts / "plans"
        self.queue_path = self.artifacts / "queue.json"
        self.outputs = self.root / "outputs"
        self.sources.mkdir()
        self.captions.mkdir()
        self.registry.write_text(
            json.dumps(
                {
                    "schemaVersion": 2,
                    "status": "source-pool",
                    "selectionPolicy": {
                        "automaticSelection": True,
                        "acceptancePolicy": "operator-authorized-deterministic-v1",
                    },
                    "dialogues": [
                        {
                            "dialogue": "laws",
                            "videos": [
                                {
                                    "videoId": "uddowL-Bw_M",
                                    "title": "Laws part one",
                                    "durationSeconds": 30,
                                    "url": "https://www.youtube.com/watch?v=uddowL-Bw_M",
                                },
                                {
                                    "videoId": "QH-DQq-ToUQ",
                                    "title": "Laws part two",
                                    "durationSeconds": 30,
                                    "url": "https://www.youtube.com/watch?v=QH-DQq-ToUQ",
                                },
                            ],
                        },
                        {
                            "dialogue": "crito",
                            "videos": [
                                {
                                    "videoId": "MNDfJMrH1XY",
                                    "title": "Pinned Crito fixture",
                                    "durationSeconds": 30,
                                    "url": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                                }
                            ],
                        },
                    ],
                }
            ),
            encoding="utf-8",
        )
        for video_id in ("MNDfJMrH1XY", "uddowL-Bw_M", "QH-DQq-ToUQ"):
            (self.captions / f"{video_id}.en-orig.json3").write_text(
                json.dumps(caption_payload()), encoding="utf-8"
            )
        self.source = self.sources / "MNDfJMrH1XY.media"
        self.source.write_bytes(b"pinned-media")
        self.patches = [
            patch.object(cluster_v2, "REGISTRY", self.registry),
            patch.object(cluster_v2, "SOURCE_ROOT", self.sources),
            patch.object(cluster_v2, "CAPTION_ROOT", self.captions),
            patch.object(cluster_v2, "ARTIFACT_ROOT", self.artifacts),
            patch.object(cluster_v2, "PLAN_ROOT", self.plans),
            patch.object(cluster_v2, "QUEUE_PATH", self.queue_path),
            patch.object(cluster_v2, "OUTPUT_ROOT", self.outputs),
            patch.object(cluster_v2, "EXPECTED_DIALOGUE_COUNT", 2),
            patch.object(cluster_v2, "EXPECTED_VIDEO_COUNT", 3),
            patch.object(cluster_v2, "EXPECTED_TOTAL_DURATION_SECONDS", 90),
            patch.object(
                cluster_v2.core,
                "ffprobe_media",
                side_effect=lambda path: (30.0, path.stat().st_size),
            ),
            patch.object(
                cluster_v2.core,
                "detect_silences",
                return_value=(
                    cluster_v2.core.Silence(5.0, 5.5),
                    cluster_v2.core.Silence(15.0, 15.5),
                ),
            ),
            patch.object(
                cluster_v2.core,
                "ffmpeg_version",
                return_value="ffmpeg version fixture",
            ),
        ]
        for item in self.patches:
            item.start()

    def tearDown(self) -> None:
        for item in reversed(self.patches):
            item.stop()
        self.temporary.cleanup()

    def selections(self) -> tuple[cluster_v2.VideoSelection, ...]:
        payload, _, _ = cluster_v2._registry_payload()
        return cluster_v2.registry_selections(payload)

    def crito(self) -> cluster_v2.VideoSelection:
        return cluster_v2.select_video(
            self.selections(), dialogue="crito", video_id="MNDfJMrH1XY"
        )


class SelectionAndBoundTests(CorpusPlanFixture):
    def test_multi_part_dialogue_requires_exact_video_id(self) -> None:
        selections = self.selections()

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "multiple videos"):
            cluster_v2.select_video(selections, dialogue="laws", video_id=None)
        selected = cluster_v2.select_video(
            selections, dialogue="laws", video_id="QH-DQq-ToUQ"
        )
        self.assertEqual(selected.part_index, 2)
        self.assertEqual(selected.part_count, 2)
        self.assertEqual(selected.key, "laws:QH-DQq-ToUQ")
        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "not pinned"):
            cluster_v2.select_video(selections, dialogue="laws", video_id="MNDfJMrH1XY")

    def test_caption_size_is_rejected_before_hashing(self) -> None:
        selection = self.crito()
        with (
            patch.object(cluster_v2, "MAX_CAPTION_BYTES", 4),
            patch.object(cluster_v2, "sha256_file") as sha,
        ):
            with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "outside"):
                cluster_v2._caption_evidence(selection)

        sha.assert_not_called()

    def test_source_size_is_rejected_before_ffprobe(self) -> None:
        selection = self.crito()
        with (
            patch.object(cluster_v2, "source_byte_ceiling", return_value=4),
            patch.object(cluster_v2.core, "ffprobe_media") as ffprobe,
        ):
            with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "outside"):
                cluster_v2._source_evidence(selection)

        ffprobe.assert_not_called()

    def test_symlinked_source_is_rejected(self) -> None:
        selection = cluster_v2.select_video(
            self.selections(), dialogue="laws", video_id="uddowL-Bw_M"
        )
        target = self.root / "outside.media"
        target.write_bytes(b"media")
        cluster_v2.source_path(selection).symlink_to(target)

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "symlink"):
            cluster_v2._source_evidence(selection)

    def test_caption_timing_must_fit_the_source_timeline(self) -> None:
        cluster_v2.caption_path(self.crito()).write_text(
            json.dumps(caption_payload(final_word_ms=45_500)), encoding="utf-8"
        )

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "source timeline"):
            cluster_v2.build_plan(self.crito(), max_segments=4)


class PlanAndQueueTests(CorpusPlanFixture):
    def test_plan_is_content_addressed_anonymous_and_deterministic(self) -> None:
        first = cluster_v2.build_plan(self.crito(), max_segments=4)
        second = cluster_v2.build_plan(self.crito(), max_segments=4)

        self.assertEqual(first, second)
        self.assertEqual(first["selection"]["selectionKey"], "crito:MNDfJMrH1XY")
        self.assertEqual(first["identityPolicy"], cluster_v2.IDENTITY_POLICY)
        self.assertEqual(first["segmentationPolicy"], cluster_v2.SEGMENTATION_POLICY)
        self.assertEqual(
            first["tools"]["coreScriptSha256"], cluster_v2.FROZEN_CORE_SHA256
        )
        self.assertEqual(first["embedding"], cluster_v2.EMBEDDING)
        self.assertEqual(first["planSha256"], cluster_v2.plan_sha256(first))
        self.assertEqual(len(first["segmentation"]["segments"]), 4)
        self.assertEqual(
            first["outputDirectory"],
            (self.outputs / "crito" / "01-MNDfJMrH1XY").as_posix(),
        )
        self.assertIn("execute-plan", first["gpuExecuteCommand"])
        self.assertIn(first["planSha256"], first["gpuExecuteCommand"])
        self.assertFalse(first["identityPolicy"]["castRegistryWritesAllowed"])
        self.assertNotIn("characterId", json.dumps(first))

    def test_recomputed_plan_cannot_weaken_the_safety_policy(self) -> None:
        plan = cluster_v2.build_plan(self.crito(), max_segments=4)
        tampered = copy.deepcopy(plan)
        tampered["identityPolicy"]["characterMappingAllowed"] = True
        tampered["planSha256"] = cluster_v2.plan_sha256(tampered)
        tampered.update(cluster_v2._plan_operations(tampered))

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "safety policy"):
            cluster_v2.validate_plan(tampered)

    def test_execution_recounts_caption_words_for_every_segment(self) -> None:
        plan = cluster_v2.build_plan(self.crito(), max_segments=4)
        tampered = copy.deepcopy(plan)
        tampered["segmentation"]["segments"][0]["timed_word_count"] += 1
        tampered["planSha256"] = cluster_v2.plan_sha256(tampered)
        tampered.update(cluster_v2._plan_operations(tampered))

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "word count"):
            cluster_v2.validate_execution_inputs(tampered)

    def test_queue_is_exact_sorted_bounded_and_deterministic(self) -> None:
        first = cluster_v2.build_queue(max_segments=4)
        second = cluster_v2.build_queue(max_segments=4)

        self.assertEqual(first, second)
        self.assertEqual(
            cluster_v2.canonical_json(first), cluster_v2.canonical_json(second)
        )
        self.assertEqual(
            first["summary"],
            {
                "dialogueCount": 2,
                "videoCount": 3,
                "readyPlanCount": 1,
                "materializationRequiredCount": 2,
                "totalPinnedDurationSeconds": 90,
                "gpuJobsLaunched": 0,
            },
        )
        self.assertEqual(
            [item["selection"]["selectionKey"] for item in first["items"]],
            ["crito:MNDfJMrH1XY", "laws:uddowL-Bw_M", "laws:QH-DQq-ToUQ"],
        )
        ready = first["items"][0]
        self.assertEqual(ready["status"], "ready")
        self.assertIsNone(ready["commands"]["materializeSource"])
        missing = first["items"][1]
        self.assertEqual(missing["status"], "materialization-required")
        self.assertIsNone(missing["plan"])
        self.assertEqual(
            [
                missing["commands"][key]
                for key in ("gpuTransfer", "gpuExecute", "gpuFetch")
            ],
            [None, None, None],
        )
        self.assertIn("--max-filesize", missing["commands"]["materializeSource"])
        self.assertNotIn("sha256", missing["source"])

    def test_queue_cannot_omit_a_registry_video_even_with_a_new_hash(self) -> None:
        queue = cluster_v2.build_queue(max_segments=4)
        queue["items"].pop()
        queue["queueSha256"] = cluster_v2.queue_sha256(queue)

        with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "source registry"):
            cluster_v2.validate_queue(queue)

    def test_recomputed_queue_cannot_change_model_provenance(self) -> None:
        queue = cluster_v2.build_queue(max_segments=4)
        tampered = copy.deepcopy(queue)
        tampered["embedding"]["modelRevision"] = "0" * 40
        tampered["queueSha256"] = cluster_v2.queue_sha256(tampered)

        with self.assertRaisesRegex(
            cluster_v2.CorpusClusterError, "embedding provenance"
        ):
            cluster_v2.validate_queue(tampered)

    def test_written_queue_and_ready_plan_verify_byte_for_byte(self) -> None:
        queue = cluster_v2.build_queue(max_segments=4)
        path = cluster_v2.write_queue(queue)
        first_bytes = path.read_bytes()
        plan_path = Path(queue["items"][0]["plan"]["path"])
        first_plan_bytes = plan_path.read_bytes()

        verified = cluster_v2.verify_queue_artifact(path)
        cluster_v2.write_queue(queue)

        self.assertEqual(verified, queue)
        self.assertEqual(path.read_bytes(), first_bytes)
        self.assertEqual(plan_path.read_bytes(), first_plan_bytes)
        self.assertEqual(
            json.loads(plan_path.read_text(encoding="utf-8"))["planSha256"],
            queue["items"][0]["plan"]["sha256"],
        )

    def test_non_crito_execute_resume_and_inventory_rejection(self) -> None:
        selection = cluster_v2.select_video(
            self.selections(), dialogue="laws", video_id="QH-DQq-ToUQ"
        )
        cluster_v2.source_path(selection).write_bytes(b"pinned-laws-media")
        plan = cluster_v2.build_plan(selection, max_segments=4)
        dimension = cluster_v2.core.EMBEDDING_DIMENSION
        embeddings = [[1.0, *([0.0] * (dimension - 1))] for _ in range(4)]
        execution = {
            "ffmpeg": "ffmpeg version fixture",
            "segmentationFfmpeg": "ffmpeg version fixture",
            "ffmpegMatchesSegmentation": True,
            "dotsSourceCommit": cluster_v2.core.DOTS_SOURCE_COMMIT,
            "torch": "fixture",
            "cuda": "fixture",
            "gpu": "fixture",
            "embeddingDeterminism": cluster_v2.core.EMBEDDING_DETERMINISM,
            "plannerScriptSha256": plan["tools"]["plannerScriptSha256"],
            "coreScriptSha256": plan["tools"]["coreScriptSha256"],
        }

        def write_clip(
            _source: Path, segment: cluster_v2.core.Segment, output: Path
        ) -> None:
            frames = round(segment.duration_seconds * cluster_v2.core.CLIP_SAMPLE_RATE)
            with wave.open(str(output), "wb") as handle:
                handle.setnchannels(1)
                handle.setsampwidth(2)
                handle.setframerate(cluster_v2.core.CLIP_SAMPLE_RATE)
                handle.writeframes(b"\0\0" * frames)

        with (
            patch.object(cluster_v2, "_execution_tools", return_value=execution),
            patch.object(
                cluster_v2.core, "extract_embeddings", return_value=embeddings
            ),
            patch.object(
                cluster_v2.core,
                "_extract_representative_clip",
                side_effect=write_clip,
            ),
            patch.object(
                cluster_v2.importlib.metadata, "version", return_value="fixture"
            ),
        ):
            first = cluster_v2.execute_plan(plan, cache_dir=self.root / "model-cache")
            resumed = cluster_v2.execute_plan(plan, cache_dir=self.root / "model-cache")
            output = Path(plan["outputDirectory"])
            (output / "unexpected.bin").write_bytes(b"corrupt inventory")
            with self.assertRaisesRegex(cluster_v2.CorpusClusterError, "inventory"):
                cluster_v2.execute_plan(plan, cache_dir=self.root / "model-cache")

        self.assertFalse(first["resumeVerified"])
        self.assertTrue(resumed["resumeVerified"])
        self.assertEqual(first["selection"]["selectionKey"], "laws:QH-DQq-ToUQ")
        self.assertTrue(
            all(cluster["identity"] is None for cluster in first["clusters"])
        )


if __name__ == "__main__":
    unittest.main()
