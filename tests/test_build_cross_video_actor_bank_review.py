from __future__ import annotations

import copy
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
sys.path.insert(0, str(SCRIPT_DIR))

import build_cross_video_actor_bank_review as actor_review  # noqa: E402


class SelectParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.current: str | None = None
        self.options: dict[str, list[str]] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "select" and "data-choice" in values:
            self.current = values.get("data-cluster-key")
            if self.current is not None:
                self.options[self.current] = []
        elif tag == "option" and self.current is not None:
            self.options[self.current].append(values.get("value") or "")

    def handle_endtag(self, tag: str) -> None:
        if tag == "select":
            self.current = None


class ActorBankSafetyUnitTests(unittest.TestCase):
    def test_only_voice_owner_roles_are_provisional_character_choices(self) -> None:
        roster = [
            {
                "characterId": "owner",
                "displayName": "Owner",
                "performanceRole": "voice-owner",
                "roleFlags": ["source-speaker"],
            },
            {
                "characterId": "reported",
                "displayName": "Reported",
                "performanceRole": "reported-only",
                "roleFlags": ["reported-speaker"],
            },
            {
                "characterId": "pending",
                "displayName": "Pending",
                "performanceRole": "review-required",
                "roleFlags": ["reported-speaker"],
            },
        ]
        artifact = {
            "clusters": [
                {
                    "clusterKey": "fixture:video:cluster",
                    "selectionKey": "fixture:video",
                    "familyId": "anonymous-family-001",
                    "dialogue": "fixture",
                    "videoId": "video",
                }
            ]
        }
        registry, _ = actor_review._decision_registry(
            artifact,
            {"fixture:video": {"roster": roster}},
        )
        self.assertEqual(registry[0]["allowedCharacterIds"], ["owner"])
        options = actor_review._roster_options(actor_review._voice_owner_roster(roster))
        self.assertIn('value="owner"', options)
        self.assertNotIn('value="reported"', options)
        self.assertNotIn('value="pending"', options)

        malformed = copy.deepcopy(roster)
        malformed[0].pop("performanceRole")
        with self.assertRaisesRegex(
            actor_review.ActorBankReviewError, "performance-role evidence"
        ):
            actor_review._voice_owner_roster(malformed)

    def test_tampered_voice_bank_signature_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory(dir=REPO_ROOT / "scratch") as temporary:
            proof = Path(temporary) / actor_review.PINNED_VOICE_BANK_SHA256
            proof.mkdir()
            source = REPO_ROOT / actor_review.DEFAULT_VOICE_BANK
            artifact = json.loads(source.read_text(encoding="utf-8"))
            artifact["summary"]["familyCount"] += 1
            path = proof / "voice-bank.json"
            path.write_text(json.dumps(artifact), encoding="utf-8")

            with self.assertRaisesRegex(actor_review.ActorBankReviewError, "signature"):
                actor_review._read_voice_bank(
                    path,
                    REPO_ROOT,
                    actor_review.PINNED_VOICE_BANK_SHA256,
                )

    def test_referenced_clip_hash_mismatch_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory(dir=REPO_ROOT / "scratch") as temporary:
            output = Path(temporary)
            clip = output / "representatives" / "clip.wav"
            clip.parent.mkdir()
            clip.write_bytes(b"verified-audio-fixture")
            record = {
                "path": "representatives/clip.wav",
                "sha256": "0" * 64,
            }

            with self.assertRaisesRegex(
                actor_review.ActorBankReviewError, "clip SHA-256"
            ):
                actor_review._verified_clip_fingerprint(
                    {"output": output}, record, REPO_ROOT
                )

    def test_non_scratch_or_protected_output_is_rejected(self) -> None:
        with self.assertRaisesRegex(
            actor_review.ActorBankReviewError, "below repository scratch"
        ):
            actor_review._scratch_output_root(Path("audio/review"), REPO_ROOT)
        with self.assertRaisesRegex(
            actor_review.ActorBankReviewError, "overlaps protected evidence"
        ):
            actor_review._scratch_output_root(
                Path("scratch/audio-speaker-clusters-v2/review"), REPO_ROOT
            )


class RealActorBankReviewProofTests(unittest.TestCase):
    def test_pre_cutover_actor_bank_review_is_rejected_without_canonical_writes(self) -> None:
        temporary = Path(
            tempfile.mkdtemp(
                prefix=".test-cross-video-actor-bank-", dir=REPO_ROOT / "scratch"
            )
        )
        cast_before = (REPO_ROOT / "audio/cast.json").read_bytes()
        characters_before = (REPO_ROOT / "audio/characters.json").read_bytes()
        try:
            with self.assertRaisesRegex(
                actor_review.ActorBankReviewError, "queue source registry changed"
            ):
                actor_review.build_review_site(
                    output_root=temporary,
                    repo_root=REPO_ROOT,
                )
            self.assertEqual(list(temporary.iterdir()), [])
            self.assertEqual((REPO_ROOT / "audio/cast.json").read_bytes(), cast_before)
            self.assertEqual(
                (REPO_ROOT / "audio/characters.json").read_bytes(),
                characters_before,
            )
        finally:
            shutil.rmtree(temporary)


if __name__ == "__main__":
    unittest.main()
