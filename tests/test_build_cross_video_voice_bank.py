from __future__ import annotations

import copy
import json
import math
import shutil
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

import build_cross_video_voice_bank as voice_bank  # noqa: E402
from test_build_cluster_review import SyntheticReviewFixture  # noqa: E402


def acoustic_cluster(key: str, video_id: str, angle_degrees: float) -> dict:
    radians = math.radians(angle_degrees)
    vector = [math.cos(radians), math.sin(radians)]
    return {
        "clusterKey": key,
        "videoId": video_id,
        "dialogue": key.split(":", 1)[0],
        "centroid": voice_bank._centroid_record(vector),
    }


class CompleteLinkTests(unittest.TestCase):
    def test_complete_link_does_not_single_link_chain(self) -> None:
        clusters = [
            acoustic_cluster("a:video-a:anonymous-cluster-00", "video-a", -18),
            acoustic_cluster("b:video-b:anonymous-cluster-00", "video-b", 0),
            acoustic_cluster("c:video-c:anonymous-cluster-00", "video-c", 18),
        ]

        families, trace = voice_bank.complete_link_families(clusters)
        reversed_families, reversed_trace = voice_bank.complete_link_families(
            list(reversed(clusters))
        )

        self.assertEqual(families, reversed_families)
        self.assertEqual(trace, reversed_trace)
        self.assertEqual(sorted(map(len, families)), [1, 2])
        self.assertEqual(len(trace), 1)
        self.assertGreater(trace[0]["crossMinimumCosine"], 0.92)

    def test_complete_link_forbids_two_clusters_from_one_video(self) -> None:
        clusters = [
            acoustic_cluster("a:shared:anonymous-cluster-00", "shared", 0),
            acoustic_cluster("a:shared:anonymous-cluster-01", "shared", 0),
        ]

        families, trace = voice_bank.complete_link_families(clusters)

        self.assertEqual(
            families,
            [(clusters[0]["clusterKey"],), (clusters[1]["clusterKey"],)],
        )
        self.assertEqual(trace, [])


class SyntheticVoiceBankTests(SyntheticReviewFixture):
    def setUp(self) -> None:
        super().setUp()
        self.generator = Path("scripts/audio/build_cross_video_voice_bank.py")
        shutil.copyfile(SCRIPT_DIR / self.generator.name, self.generator)
        self.voice_bank_output = Path("scratch/voice-bank-proof")
        self.voice_bank_patches = [
            patch.object(voice_bank, "EXPECTED_VIDEO_COUNT", 1),
            patch.object(voice_bank, "EXPECTED_CLUSTER_COUNT", 1),
            patch.object(voice_bank, "EXPECTED_UNCLUSTERED_SEGMENT_COUNT", 0),
            patch.object(
                voice_bank, "EXPECTED_LOCAL_BELOW_THRESHOLD_SEGMENT_COUNT", 0
            ),
        ]
        for item in self.voice_bank_patches:
            item.start()

    def tearDown(self) -> None:
        for item in reversed(self.voice_bank_patches):
            item.stop()
        super().tearDown()

    def build_voice_bank(self) -> dict:
        return voice_bank.build_voice_bank(
            self.queue_path,
            None,
            repo_root=self.root,
            generator_path=self.generator,
        )

    def test_verified_voice_bank_is_deterministic_anonymous_and_scratch_only(
        self,
    ) -> None:
        self.materialize_output()
        cast_before = self.cast.read_bytes()

        first = self.build_voice_bank()
        second = self.build_voice_bank()
        destination, disposition = voice_bank.write_voice_bank(
            first,
            output_root=self.voice_bank_output,
            repo_root=self.root,
        )
        repeated_destination, repeated_disposition = voice_bank.write_voice_bank(
            second,
            output_root=self.voice_bank_output,
            repo_root=self.root,
        )

        self.assertEqual(first, second)
        self.assertEqual(destination, repeated_destination)
        self.assertEqual(disposition, "written")
        self.assertEqual(repeated_disposition, "verified-existing")
        self.assertEqual(self.cast.read_bytes(), cast_before)
        self.assertEqual(
            first["summary"],
            {
                "videoCount": 1,
                "clusterCount": 1,
                "familyCount": 1,
                "recurrentFamilyCount": 0,
                "recurrentlyLinkedClusterCount": 0,
                "singletonFamilyCount": 1,
                "localBelowThresholdSegmentCount": 0,
                "unclusteredSegmentCount": 0,
                "crossVideoPairCount": 0,
                "sameVideoPairCountExcluded": 0,
                "socratesAnchorCount": 0,
            },
        )
        self.assertEqual(first["identityPolicy"], voice_bank.IDENTITY_POLICY)
        self.assertIsNone(first["socratesReferenceComparison"])
        self.assertIsNone(first["socratesAnchor"])
        self.assertFalse(voice_bank._contains_identity_claim(first["clusters"]))
        self.assertFalse(voice_bank._contains_identity_claim(first["families"]))
        self.assertEqual(
            json.loads((destination / "voice-bank.json").read_text(encoding="utf-8")),
            first,
        )

    def test_tampered_embedding_and_saved_queue_fail_closed(self) -> None:
        fetched = self.materialize_output()
        embedding = fetched / "embeddings.json"
        embedding.write_bytes(embedding.read_bytes() + b" ")

        with self.assertRaisesRegex(voice_bank.VoiceBankError, "missing or corrupt"):
            self.build_voice_bank()

        shutil.rmtree(fetched)
        payload = json.loads(self.queue_path.read_text(encoding="utf-8"))
        payload["summary"]["readyPlanCount"] = 0
        self.queue_path.write_text(json.dumps(payload), encoding="utf-8")
        with self.assertRaisesRegex(voice_bank.VoiceBankError, "invalid or stale"):
            self.build_voice_bank()

    def test_resigned_family_diagnostic_tamper_is_rejected(self) -> None:
        self.materialize_output()
        artifact = self.build_voice_bank()
        tampered = copy.deepcopy(artifact)
        tampered["clusters"][0]["familyCentroidCosine"] = 0.25
        unsigned = {
            key: value
            for key, value in tampered.items()
            if key != "voiceBankSha256"
        }
        tampered["voiceBankSha256"] = voice_bank.sha256_bytes(
            voice_bank.canonical_json(unsigned)
        )

        with self.assertRaisesRegex(
            voice_bank.VoiceBankError, "family diagnostics"
        ):
            voice_bank.validate_voice_bank(tampered)

    def test_writer_rejects_non_scratch_destination(self) -> None:
        self.materialize_output()
        artifact = self.build_voice_bank()

        with self.assertRaisesRegex(voice_bank.VoiceBankError, "below scratch"):
            voice_bank.write_voice_bank(
                artifact,
                output_root=Path("audio/voice-bank"),
                repo_root=self.root,
            )


class RealVoiceBankProofTests(unittest.TestCase):
    def test_pre_cutover_fetched_outputs_cannot_build_a_current_voice_bank(self) -> None:
        with self.assertRaisesRegex(
            voice_bank.VoiceBankError, "queue source registry changed"
        ):
            voice_bank.build_voice_bank(repo_root=REPO_ROOT)
