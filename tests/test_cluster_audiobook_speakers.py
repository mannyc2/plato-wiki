from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch


SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

from cluster_audiobook_speakers import (  # noqa: E402
    DOTS_SOURCE_COMMIT,
    EMBEDDING_DIMENSION,
    MAX_SOURCE_BYTES,
    Segment,
    Silence,
    SpeakerClusterError,
    audit_representative_indices,
    build_plan,
    build_segments,
    candidate_boundaries,
    cluster_embeddings,
    execute_plan,
    load_plan_artifact,
    parse_caption_word_times,
    parse_silence_log,
    plan_sha256,
    representative_indices,
    sha256_file,
)


def caption_payload(starts: list[int]) -> dict:
    return {
        "events": [
            {
                "tStartMs": 0,
                "dDurationMs": max(starts) + 1000,
                "segs": [
                    {"utf8": f" word{index}", "tOffsetMs": start}
                    for index, start in enumerate(starts)
                ],
            }
        ]
    }


class CaptionAndSegmentationTests(unittest.TestCase):
    def test_caption_parser_returns_only_unique_timing_points(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "captions.json3"
            path.write_text(
                json.dumps(
                    {
                        "events": [
                            {
                                "tStartMs": 1000,
                                "dDurationMs": 3000,
                                "segs": [
                                    {"utf8": "Socrates", "tOffsetMs": 0},
                                    {"utf8": " two words", "tOffsetMs": 500},
                                    {"utf8": "!", "tOffsetMs": 700},
                                ],
                            },
                            {
                                "tStartMs": 2000,
                                "dDurationMs": 3000,
                                "segs": [{"utf8": "Crito", "tOffsetMs": 250}],
                            },
                            {
                                "tStartMs": 3000,
                                "dDurationMs": 3000,
                                "segs": [
                                    {"utf8": "more", "tOffsetMs": 0},
                                    {"utf8": "words", "tOffsetMs": 500},
                                ],
                            },
                        ]
                    }
                ),
                encoding="utf-8",
            )

            self.assertEqual(
                parse_caption_word_times(path),
                (1000, 1500, 2250, 3000, 3500),
            )

    def test_silence_parser_clamps_and_closes_trailing_silence(self) -> None:
        log = "\n".join(
            [
                "silence_start: 0",
                "silence_end: 0.5 | silence_duration: 0.5",
                "silence_start: 4.25",
            ]
        )
        self.assertEqual(
            parse_silence_log(log, media_duration=5.0),
            (Silence(0.0, 0.5), Silence(4.25, 5.0)),
        )

    def test_boundaries_and_segments_are_deterministic_non_overlapping_and_capped(self) -> None:
        words = tuple(range(500, 60_000, 500))
        silences = tuple(Silence(second, second + 0.4) for second in range(5, 60, 5))
        boundaries = candidate_boundaries(words, silences, 60.0)
        first = build_segments(words, boundaries, max_segments=5)
        second = build_segments(words, boundaries, max_segments=5)

        self.assertEqual(first, second)
        self.assertEqual(len(first), 5)
        self.assertTrue(
            all(3.0 <= item.duration_seconds <= 8.5 for item in first)
        )
        self.assertTrue(
            all(left.end_seconds <= right.start_seconds for left, right in zip(first, first[1:]))
        )
        self.assertTrue(
            all(item.start_boundary in {"media-edge", "silence", "caption-gap"} for item in first)
        )


class ClusteringTests(unittest.TestCase):
    def test_clusters_anonymous_vectors_deterministically(self) -> None:
        embeddings = [
            [1.0, 0.0, 0.0],
            [0.99, 0.05, 0.0],
            [0.98, -0.04, 0.0],
            [0.0, 1.0, 0.0],
            [0.05, 0.99, 0.0],
            [-0.04, 0.98, 0.0],
            [0.0, 0.0, 1.0],
        ]
        groups = cluster_embeddings(embeddings, threshold=0.8)
        self.assertEqual(groups, ((0, 1, 2), (3, 4, 5), (6,)))
        self.assertEqual(representative_indices(groups[0], embeddings, 2), (0, 2))
        self.assertEqual(audit_representative_indices(groups[0], embeddings, 1), (1,))

    def test_rejects_malformed_embedding_dimensions(self) -> None:
        with self.assertRaisesRegex(SpeakerClusterError, "share one"):
            cluster_embeddings([[1.0, 0.0], [1.0]], threshold=0.8)


class PlanAndResumeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.source = self.root / "MNDfJMrH1XY.media"
        self.captions = self.root / "MNDfJMrH1XY.en-orig.json3"
        self.output = self.root / "output"
        self.registry = self.root / "reference-sources.json"
        self.source.write_bytes(b"pinned-media")
        self.captions.write_text(
            json.dumps(caption_payload(list(range(500, 30_000, 500)))),
            encoding="utf-8",
        )
        self.registry.write_text(
            json.dumps(
                {
                    "dialogues": [
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
                        }
                    ]
                }
            ),
            encoding="utf-8",
        )
        self.path_patches = [
            patch("cluster_audiobook_speakers.DEFAULT_SOURCE", self.source),
            patch("cluster_audiobook_speakers.DEFAULT_CAPTIONS", self.captions),
            patch("cluster_audiobook_speakers.DEFAULT_OUTPUT", self.output),
            patch("cluster_audiobook_speakers.REFERENCE_SOURCES", self.registry),
            patch(
                "cluster_audiobook_speakers.execution_runtime_facts",
                return_value={"torch": "fixture", "cuda": "fixture", "gpu": "fixture"},
            ),
        ]
        for item in self.path_patches:
            item.start()

    def tearDown(self) -> None:
        for item in reversed(self.path_patches):
            item.stop()
        self.temporary.cleanup()

    def build(self) -> dict:
        with (
            patch(
                "cluster_audiobook_speakers.ffprobe_media",
                return_value=(30.0, len(b"pinned-media")),
            ),
            patch(
                "cluster_audiobook_speakers.detect_silences",
                return_value=(Silence(5.0, 5.5), Silence(15.0, 15.5)),
            ),
            patch(
                "cluster_audiobook_speakers.ffmpeg_version",
                return_value="ffmpeg version fixture",
            ),
        ):
            return build_plan(
                source=self.source,
                captions=self.captions,
                output_dir=self.output,
                max_segments=4,
            )

    @staticmethod
    def vectors(count: int) -> list[list[float]]:
        if count != 4:
            raise AssertionError(f"fixture expected four segments, got {count}")
        vectors: list[list[float]] = []
        for first, second in ((1.0, 0.0), (0.99995, 0.01), (0.99995, -0.01), (0.0, 1.0)):
            vector = [0.0] * EMBEDDING_DIMENSION
            vector[0] = first
            vector[1] = second
            vectors.append(vector)
        return vectors

    @staticmethod
    def write_wav(_source: Path, segment: Segment, output: Path) -> None:
        output.parent.mkdir(parents=True, exist_ok=True)
        frames = round(segment.duration_seconds * 48_000)
        with wave.open(str(output), "wb") as handle:
            handle.setnchannels(1)
            handle.setsampwidth(2)
            handle.setframerate(48_000)
            handle.writeframes(b"\0\0" * frames)

    def generate_output(self, plan: dict, *, ffmpeg: str = "ffmpeg version gpu") -> dict:
        vectors = self.vectors(len(plan["segmentation"]["segments"]))
        with (
            patch(
                "cluster_audiobook_speakers.extract_embeddings",
                return_value=vectors,
            ),
            patch(
                "cluster_audiobook_speakers._extract_representative_clip",
                side_effect=self.write_wav,
            ),
            patch("cluster_audiobook_speakers.importlib.metadata.version", return_value="fixture"),
        ):
            return execute_plan(
                plan,
                cache_dir=self.root / "unused-cache",
                execution_ffmpeg=ffmpeg,
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

    def test_dry_plan_pins_exact_artifact_inputs_commands_and_safety_policy(self) -> None:
        plan = self.build()

        self.assertEqual(plan["planSha256"], plan_sha256(plan))
        self.assertTrue(
            plan["planArtifact"].endswith(f"/{plan['planSha256']}.json")
        )
        self.assertEqual(
            plan["source"]["materializedEvidence"]["sha256"],
            sha256_file(self.source),
        )
        self.assertEqual(
            plan["source"]["materializedEvidence"]["claim"],
            "local-bytes-hash-only",
        )
        self.assertEqual(
            plan["source"]["registry"]["sha256"], sha256_file(self.registry)
        )
        self.assertEqual(plan["captions"]["sha256"], sha256_file(self.captions))
        self.assertEqual(plan["identityPolicy"]["clusterLabels"], "anonymous-only")
        self.assertFalse(plan["identityPolicy"]["characterMappingAllowed"])
        self.assertFalse(plan["identityPolicy"]["castRegistryWritesAllowed"])
        self.assertFalse(plan["segmentationPolicy"]["singleSpeakerGuaranteed"])
        self.assertEqual(plan["embedding"]["embeddingDtype"], "float32")
        serialized_segments = json.dumps(plan["segmentation"])
        self.assertNotIn("Socrates", serialized_segments)
        self.assertNotIn("Crito", serialized_segments)
        self.assertIn("--execute-plan", plan["gpuExecuteCommand"])
        self.assertNotIn(" --execute ", plan["gpuExecuteCommand"])
        self.assertIn("--expect-plan-sha256", plan["gpuExecuteCommand"])
        self.assertIn(plan["planArtifact"], plan["gpuTransferCommand"])
        self.assertIn(self.registry.as_posix(), plan["gpuTransferCommand"])
        self.assertFalse(self.output.exists())

    def test_plan_artifact_tamper_and_expected_hash_mismatch_are_rejected(self) -> None:
        plan = self.build()
        path = self.root / plan["planArtifact"]
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps(plan), encoding="utf-8")
        self.assertEqual(
            load_plan_artifact(path, expected_plan_sha256=plan["planSha256"]),
            plan,
        )

        tampered = copy.deepcopy(plan)
        tampered["segmentation"]["segments"][0]["end_seconds"] -= 0.1
        path.write_text(json.dumps(tampered), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "plan SHA-256"):
            load_plan_artifact(path, expected_plan_sha256=plan["planSha256"])

        path.write_text(json.dumps(plan), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "expect-plan"):
            load_plan_artifact(path, expected_plan_sha256="0" * 64)

    def test_expected_hash_mismatch_fails_before_media_tools(self) -> None:
        with patch("cluster_audiobook_speakers.ffprobe_media") as probe:
            with self.assertRaisesRegex(SpeakerClusterError, "source SHA-256 mismatch"):
                build_plan(
                    source=self.source,
                    captions=self.captions,
                    output_dir=self.output,
                    expected_source_sha256="0" * 64,
                )
        probe.assert_not_called()

    def test_maximum_segments_is_a_hard_cap(self) -> None:
        with self.assertRaisesRegex(SpeakerClusterError, "between 1 and 240"):
            build_plan(
                source=self.source,
                captions=self.captions,
                output_dir=self.output,
                max_segments=241,
            )

    def test_source_size_and_registry_duration_are_bounded(self) -> None:
        for metadata, message in (
            ((30.0, MAX_SOURCE_BYTES + 1), "byte ceiling"),
            ((100.0, len(b"pinned-media")), "duration disagrees"),
        ):
            with self.subTest(message=message), patch(
                "cluster_audiobook_speakers.ffprobe_media", return_value=metadata
            ), self.assertRaisesRegex(SpeakerClusterError, message):
                build_plan(
                    source=self.source,
                    captions=self.captions,
                    output_dir=self.output,
                )

    def test_wrong_cache_path_and_symlinked_output_are_rejected(self) -> None:
        alternate = self.root / "alternate" / self.source.name
        alternate.parent.mkdir()
        alternate.write_bytes(self.source.read_bytes())
        with self.assertRaisesRegex(SpeakerClusterError, "exact pinned"):
            build_plan(
                source=alternate,
                captions=self.captions,
                output_dir=self.output,
            )

        target = self.root / "outside-output"
        target.mkdir()
        self.output.symlink_to(target, target_is_directory=True)
        with self.assertRaisesRegex(SpeakerClusterError, "symlink"):
            self.build()

    def test_registry_change_fails_before_embedding_load(self) -> None:
        plan = self.build()
        self.registry.write_text('{"dialogues": []}\n', encoding="utf-8")
        with (
            patch("cluster_audiobook_speakers.extract_embeddings") as extract,
            self.assertRaisesRegex(SpeakerClusterError, "registry"),
        ):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )
        extract.assert_not_called()

    def test_plan_tamper_fails_before_embedding_load(self) -> None:
        plan = self.build()
        plan["segmentation"]["segments"][0]["end_seconds"] -= 0.1
        with (
            patch("cluster_audiobook_speakers.extract_embeddings") as extract,
            self.assertRaisesRegex(SpeakerClusterError, "plan SHA-256"),
        ):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )
        extract.assert_not_called()

    def test_exact_complete_resume_records_version_divergence_and_skips_gpu(self) -> None:
        plan = self.build()
        generated = self.generate_output(plan)
        self.assertFalse(generated["executionTools"]["ffmpegMatchesSegmentation"])
        self.assertEqual(
            generated["executionTools"]["segmentationFfmpeg"],
            "ffmpeg version fixture",
        )
        self.assertEqual(generated["executionTools"]["ffmpeg"], "ffmpeg version gpu")
        self.assertEqual(generated["executionTools"]["gpu"], "fixture")
        self.assertTrue(
            generated["executionTools"]["embeddingDeterminism"][
                "torchDeterministicAlgorithms"
            ]
        )
        self.assertFalse(generated["segmentationPolicy"]["singleSpeakerGuaranteed"])
        self.assertEqual(len(generated["clusters"][0]["auditRepresentatives"]), 1)

        with patch("cluster_audiobook_speakers.extract_embeddings") as extract:
            resumed = execute_plan(
                plan,
                cache_dir=self.root / "unused-cache",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )
        self.assertTrue(resumed["resumeVerified"])
        extract.assert_not_called()

        clip = self.output / generated["clusters"][0]["representatives"][0]["path"]
        clip.write_bytes(b"corrupt")
        with self.assertRaisesRegex(SpeakerClusterError, "missing or corrupt"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused-cache",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

    def test_skeletal_manifest_is_rejected_before_gpu(self) -> None:
        plan = self.build()
        self.output.mkdir()
        (self.output / "manifest.json").write_text("{}\n", encoding="utf-8")
        with (
            patch("cluster_audiobook_speakers.extract_embeddings") as extract,
            self.assertRaisesRegex(SpeakerClusterError, "invalid shape"),
        ):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )
        extract.assert_not_called()

    def test_absolute_and_parent_escape_artifact_paths_are_rejected(self) -> None:
        plan = self.build()
        generated = self.generate_output(plan)
        manifest_path = self.output / "manifest.json"
        pristine = json.loads(manifest_path.read_text(encoding="utf-8"))
        external = self.root / "outside.json"
        external.write_text("not an embedding payload", encoding="utf-8")
        mutations = (
            ("absolute embeddings", lambda value: value["embeddings"].__setitem__("path", str(external))),
            ("parent embeddings", lambda value: value["embeddings"].__setitem__("path", "../outside.json")),
            (
                "absolute representative",
                lambda value: value["clusters"][0]["representatives"][0].__setitem__("path", str(external)),
            ),
            (
                "parent representative",
                lambda value: value["clusters"][0]["representatives"][0].__setitem__("path", "../outside.wav"),
            ),
        )
        for label, mutate in mutations:
            with self.subTest(label=label):
                manifest = copy.deepcopy(pristine)
                mutate(manifest)
                manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
                with self.assertRaisesRegex(SpeakerClusterError, "path"):
                    execute_plan(
                        plan,
                        cache_dir=self.root / "unused",
                        execution_ffmpeg="ffmpeg version gpu",
                        execution_dots_commit=DOTS_SOURCE_COMMIT,
                    )
        self.assertEqual(generated["clusters"][0]["identity"], None)

    def test_manifest_policy_count_dimension_and_unit_norm_are_strict(self) -> None:
        plan = self.build()
        self.generate_output(plan)
        manifest_path = self.output / "manifest.json"
        embeddings_path = self.output / "embeddings.json"
        pristine_manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        pristine_embeddings = json.loads(embeddings_path.read_text(encoding="utf-8"))

        manifest = copy.deepcopy(pristine_manifest)
        manifest["identityPolicy"]["characterMappingAllowed"] = True
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "safety policy"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

        manifest = copy.deepcopy(pristine_manifest)
        manifest["embeddings"]["count"] -= 1
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "counts or dimensions"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

        manifest = copy.deepcopy(pristine_manifest)
        payload = copy.deepcopy(pristine_embeddings)
        payload["embeddings"][0]["vector"][0] = 0.5
        embeddings_path.write_text(json.dumps(payload), encoding="utf-8")
        manifest["embeddings"]["sha256"] = sha256_file(embeddings_path)
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "unit-normalized"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

    def test_representative_duration_must_match_its_segment(self) -> None:
        plan = self.build()
        generated = self.generate_output(plan)
        manifest_path = self.output / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        record = generated["clusters"][0]["representatives"][0]
        clip = self.output / record["path"]
        self.write_wav(
            self.source,
            Segment("fixture", 0.0, 1.0, "media-edge", "caption-gap", 5),
            clip,
        )
        manifest["clusters"][0]["representatives"][0]["sha256"] = sha256_file(clip)
        manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
        with self.assertRaisesRegex(SpeakerClusterError, "duration"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

    def test_unmanifested_output_file_is_rejected(self) -> None:
        plan = self.build()
        self.generate_output(plan)
        rogue = self.output / "representatives" / "rogue.wav"
        rogue.write_bytes(b"rogue")
        with self.assertRaisesRegex(SpeakerClusterError, "file inventory"):
            execute_plan(
                plan,
                cache_dir=self.root / "unused",
                execution_ffmpeg="ffmpeg version gpu",
                execution_dots_commit=DOTS_SOURCE_COMMIT,
            )

if __name__ == "__main__":
    unittest.main()
