from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

import build_cluster_review as review  # noqa: E402
import cluster_audiobook_speakers_v2 as cluster_v2  # noqa: E402


def caption_payload() -> dict:
    starts = list(range(500, 29_500, 500)) + [29_500]
    return {
        "events": [
            {
                "tStartMs": 0,
                "dDurationMs": 30_000,
                "segs": [
                    {"utf8": f" word{index}", "tOffsetMs": start}
                    for index, start in enumerate(starts)
                ],
            }
        ]
    }


def character_catalog() -> dict:
    def character(
        character_id: str,
        display_name: str,
        *,
        performance_role: str = "voice-owner",
    ) -> dict:
        source_speaker = performance_role != "reported-only"
        return {
            "characterId": character_id,
            "displayName": display_name,
            "identityStatus": "canonical",
            "aliases": [display_name],
            "appearances": [
                {
                    "dialogue": "crito",
                    "editorialStatus": "confirmed",
                    "performanceRole": performance_role,
                    "roleFlags": (
                        ["source-speaker"] if source_speaker else ["reported-speaker"]
                    ),
                    "sourceLabels": [display_name] if source_speaker else [],
                    "sourceAliases": [display_name] if source_speaker else [],
                    "sourceAttributions": (
                        ["synthetic fixture"] if source_speaker else []
                    ),
                    **(
                        {
                            "editorialNote": "Embedded speech belongs to its active voice owner."
                        }
                        if not source_speaker
                        else {}
                    ),
                }
            ],
        }

    return {
        "schemaVersion": 3,
        "status": "canonical-character-catalog",
        "updatedAt": "fixture",
        "source": {"fixture": True},
        "dialogues": [
            {
                "dialogue": "crito",
                "characterIds": [
                    "crito",
                    "socrates",
                    "the-laws",
                    "unresolved-visitor",
                ],
            }
        ],
        "characters": [
            character("crito", "Crito"),
            character("socrates", "Socrates"),
            character("the-laws", "The Laws", performance_role="reported-only"),
            character(
                "unresolved-visitor",
                "Unresolved Visitor",
                performance_role="review-required",
            ),
        ],
    }


class SyntheticReviewFixture(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.previous_cwd = Path.cwd()
        os.chdir(self.root)

        (self.root / "audio").mkdir()
        (self.root / "scripts" / "audio").mkdir(parents=True)
        (self.root / "scratch" / "audio-references" / "source-cache").mkdir(
            parents=True
        )
        (self.root / "scratch" / "audio-references" / "caption-cache").mkdir(
            parents=True
        )
        for name in (
            "cluster_audiobook_speakers.py",
            "cluster_audiobook_speakers_v2.py",
            "build_cluster_review.py",
        ):
            shutil.copyfile(SCRIPT_DIR / name, self.root / "scripts" / "audio" / name)

        self.registry = Path("audio/reference-sources.json")
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
                            "dialogue": "crito",
                            "videos": [
                                {
                                    "videoId": "MNDfJMrH1XY",
                                    "title": "Pinned Crito synthetic fixture",
                                    "durationSeconds": 30,
                                    "url": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                                }
                            ],
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        self.caption = Path(
            "scratch/audio-references/caption-cache/MNDfJMrH1XY.en-orig.json3"
        )
        self.caption.write_text(json.dumps(caption_payload()), encoding="utf-8")
        self.source = Path("scratch/audio-references/source-cache/MNDfJMrH1XY.media")
        self.source.write_bytes(b"pinned-media")
        self.characters = Path("audio/characters.json")
        self.characters.write_text(json.dumps(character_catalog()), encoding="utf-8")
        self.cast = Path("audio/cast.json")
        self.cast.write_bytes(b'{"sentinel":"must-not-change"}\n')
        self.output = Path("scratch/cluster-review")
        self.queue_path = Path("scratch/audio-speaker-cluster-v2/queue.json")
        self.generator = Path("scripts/audio/build_cluster_review.py")

        self.patches = [
            patch.object(cluster_v2, "REGISTRY", self.registry),
            patch.object(
                cluster_v2,
                "SOURCE_ROOT",
                Path("scratch/audio-references/source-cache"),
            ),
            patch.object(
                cluster_v2,
                "CAPTION_ROOT",
                Path("scratch/audio-references/caption-cache"),
            ),
            patch.object(
                cluster_v2,
                "ARTIFACT_ROOT",
                Path("scratch/audio-speaker-cluster-v2"),
            ),
            patch.object(
                cluster_v2,
                "PLAN_ROOT",
                Path("scratch/audio-speaker-cluster-v2/plans"),
            ),
            patch.object(cluster_v2, "QUEUE_PATH", self.queue_path),
            patch.object(
                cluster_v2,
                "OUTPUT_ROOT",
                Path("scratch/audio-speaker-clusters-v2"),
            ),
            patch.object(
                cluster_v2,
                "SCRIPT_PATH",
                Path("scripts/audio/cluster_audiobook_speakers_v2.py"),
            ),
            patch.object(
                cluster_v2,
                "CORE_PATH",
                Path("scripts/audio/cluster_audiobook_speakers.py"),
            ),
            patch.object(cluster_v2, "EXPECTED_DIALOGUE_COUNT", 1),
            patch.object(cluster_v2, "EXPECTED_VIDEO_COUNT", 1),
            patch.object(cluster_v2, "EXPECTED_TOTAL_DURATION_SECONDS", 30),
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

        queue = cluster_v2.build_queue(max_segments=4)
        cluster_v2.write_queue(queue)
        self.queue = queue
        self.plan = cluster_v2.load_plan_artifact(
            Path(queue["items"][0]["plan"]["path"]),
            expected_sha256=queue["items"][0]["plan"]["sha256"],
        )

    def tearDown(self) -> None:
        for item in reversed(self.patches):
            item.stop()
        os.chdir(self.previous_cwd)
        self.temporary.cleanup()

    def materialize_output(self) -> Path:
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
            "plannerScriptSha256": self.plan["tools"]["plannerScriptSha256"],
            "coreScriptSha256": self.plan["tools"]["coreScriptSha256"],
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
            cluster_v2.execute_plan(self.plan, cache_dir=Path("model-cache"))
        return Path(self.plan["outputDirectory"])

    def build(self) -> dict:
        return review.build_review_site(
            self.queue_path,
            self.characters,
            self.output,
            repo_root=self.root,
            generator_path=self.generator,
        )


class SyntheticReviewTests(SyntheticReviewFixture):
    def test_verified_site_is_deterministic_scratch_only_and_exportable(self) -> None:
        self.materialize_output()
        cast_before = self.cast.read_bytes()

        first = self.build()
        first_files = {
            path.relative_to(self.output).as_posix(): path.read_bytes()
            for path in self.output.rglob("*")
            if path.is_file()
        }
        second = self.build()
        second_files = {
            path.relative_to(self.output).as_posix(): path.read_bytes()
            for path in self.output.rglob("*")
            if path.is_file()
        }

        self.assertEqual(first, second)
        self.assertEqual(first_files, second_files)
        self.assertEqual(self.cast.read_bytes(), cast_before)
        self.assertEqual(
            first["summary"],
            {
                "videoCount": 1,
                "verifiedForReviewCount": 1,
                "awaitingOutputCount": 0,
                "materializationRequiredCount": 0,
                "clusterCount": 1,
            },
        )
        page = self.output / "videos" / "crito" / "MNDfJMrH1XY.html"
        source = page.read_text(encoding="utf-8")
        for expected in (
            "Human audit only",
            "Undecided — no provisional choice",
            'value="unmapped"',
            'value="mixed/impure"',
            'value="crito"',
            'value="socrates"',
            "Nonselectable character evidence",
            "The Laws",
            "reported-only",
            "Unresolved Visitor",
            "review-required",
            "Pinned caption context:",
            '"writesCastRegistry":false',
            '"automaticIdentityAssertions":false',
            "canonical-roster-provisional",
            "localStorage",
            "Download decision JSON",
        ):
            self.assertIn(expected, source)
        self.assertNotIn('value="the-laws"', source)
        self.assertNotIn('value="unresolved-visitor"', source)
        self.assertIn('"canonicalRosterCharacterIds":["crito","socrates"]', source)
        self.assertIn(
            '"allowedChoices":["unmapped","mixed/impure","crito","socrates"]',
            source,
        )
        self.assertNotIn("position: sticky", source)
        self.assertNotIn("bottom: .5rem", source)
        self.assertNotIn(
            "selected", source.split("<select", 1)[1].split("</select>", 1)[0]
        )
        manifest = json.loads(
            (self.output / "review-manifest.json").read_text(encoding="utf-8")
        )
        self.assertFalse(manifest["writesCastRegistry"])
        self.assertFalse(manifest["automaticIdentityAssertions"])
        self.assertEqual(
            manifest["inventory"],
            sorted(first_files),
        )
        self.assertEqual(
            manifest["videos"][0]["page"]["sha256"],
            hashlib.sha256(page.read_bytes()).hexdigest(),
        )
        self.assertFalse(any("review-decision" in name for name in first_files))

        node = shutil.which("node")
        if node is not None:
            script = re.search(r"<script>\s*(.*?)\s*</script>", source, re.DOTALL)
            self.assertIsNotNone(script)
            subprocess.run(
                [node, "--check"],
                input=script.group(1),
                text=True,
                check=True,
                capture_output=True,
            )

    def test_missing_expected_output_is_pending_not_an_error(self) -> None:
        manifest = self.build()

        self.assertEqual(manifest["summary"]["awaitingOutputCount"], 1)
        self.assertEqual(manifest["summary"]["verifiedForReviewCount"], 0)
        self.assertEqual(manifest["videos"][0]["state"], "awaiting-output")
        self.assertFalse((self.output / "videos").exists())
        self.assertIn(
            "awaiting fetched cluster output",
            (self.output / "index.html").read_text(encoding="utf-8"),
        )

    def test_review_output_cannot_overlap_clustering_artifacts(self) -> None:
        self.output = Path("scratch/audio-speaker-clusters-v2/review")

        with self.assertRaisesRegex(review.ClusterReviewError, "overlaps"):
            self.build()
        self.assertFalse(self.output.exists())

    def test_tampered_saved_queue_fails_before_writing_review_output(self) -> None:
        payload = json.loads(self.queue_path.read_text(encoding="utf-8"))
        payload["summary"]["readyPlanCount"] = 0
        self.queue_path.write_text(json.dumps(payload), encoding="utf-8")

        with self.assertRaisesRegex(review.ClusterReviewError, "invalid or stale"):
            self.build()
        self.assertFalse(self.output.exists())

    def test_character_catalog_requires_v3_performance_roles(self) -> None:
        payload = character_catalog()
        payload["schemaVersion"] = 2
        self.characters.write_text(json.dumps(payload), encoding="utf-8")

        with self.assertRaisesRegex(review.ClusterReviewError, "unsupported"):
            self.build()
        self.assertFalse(self.output.exists())

        payload = character_catalog()
        payload["characters"][0]["appearances"][0]["performanceRole"] = "actor"
        self.characters.write_text(json.dumps(payload), encoding="utf-8")

        with self.assertRaisesRegex(
            review.ClusterReviewError, "appearance 0 is invalid"
        ):
            self.build()
        self.assertFalse(self.output.exists())

    def test_tampered_pinned_caption_fails_before_writing_review_output(self) -> None:
        self.caption.write_text(
            self.caption.read_text(encoding="utf-8") + " ", encoding="utf-8"
        )

        with self.assertRaisesRegex(review.ClusterReviewError, "byte count is stale"):
            self.build()
        self.assertFalse(self.output.exists())

    def test_unexpected_fetched_file_fails_closed(self) -> None:
        fetched = self.materialize_output()
        (fetched / "unexpected.bin").write_bytes(b"not in the manifest")

        with self.assertRaisesRegex(review.ClusterReviewError, "inventory"):
            self.build()
        self.assertFalse(self.output.exists())

    def test_tampered_representative_fails_closed(self) -> None:
        fetched = self.materialize_output()
        representative = next((fetched / "representatives").glob("*.wav"))
        content = bytearray(representative.read_bytes())
        content[-1] ^= 1
        representative.write_bytes(content)

        with self.assertRaisesRegex(review.ClusterReviewError, "missing or corrupt"):
            self.build()
        self.assertFalse(self.output.exists())

    def test_partial_and_unbound_fetched_outputs_fail_closed(self) -> None:
        fetched = Path(self.plan["outputDirectory"])
        fetched.mkdir(parents=True)

        with self.assertRaisesRegex(review.ClusterReviewError, "missing.*manifest"):
            self.build()
        self.assertFalse(self.output.exists())

        fetched.rmdir()
        unbound = Path("scratch/audio-speaker-clusters-v2/not-a-dialogue")
        unbound.mkdir(parents=True)
        with self.assertRaisesRegex(review.ClusterReviewError, "unbound dialogue"):
            self.build()
        self.assertFalse(self.output.exists())


class RealApologyProofTests(unittest.TestCase):
    def test_pre_cutover_apology_output_is_rejected_as_stale(self) -> None:
        apology_output = (
            REPO_ROOT
            / "scratch"
            / "audio-speaker-clusters-v2"
            / "apology"
            / "01-GWygt-N_FB4"
        )
        self.assertTrue(
            (apology_output / "manifest.json").is_file(),
            "the pinned Apology fetched artifact is the required real proof fixture",
        )
        with tempfile.TemporaryDirectory(
            prefix="cluster-review-proof-", dir=REPO_ROOT / "scratch"
        ) as directory:
            output = Path(directory)
            with self.assertRaisesRegex(
                review.ClusterReviewError, "queue source registry changed"
            ):
                review.build_review_site(repo_root=REPO_ROOT, output_path=output)
            self.assertEqual(list(output.iterdir()), [])


if __name__ == "__main__":
    unittest.main()
