from __future__ import annotations

import copy
import hashlib
import json
import sys
import tempfile
import unittest
import wave
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from cast_acceptance import CAST_ENGINE_POLICY  # noqa: E402
import orchestrate_dots_cast_batch as orchestrator  # noqa: E402
from orchestrate_dots_cast_batch import (  # noqa: E402
    BatchOrchestrationError,
    SEEDS,
    TARGET_TEXT,
    _parse_candidate_ids,
    build_batch_manifest,
    canonical_json,
)


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class BatchFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        (root / "audio").mkdir(parents=True)
        (root / "scripts/audio").mkdir(parents=True)
        (root / "scratch/alignment").mkdir(parents=True)
        self.dialogue = "test-dialogue"
        self.video_id = "ABCDEFGHIJK"
        self.characters = {
            "schemaVersion": 3,
            "status": "complete",
            "characters": [
                self.character("alpha", ["source-speaker"]),
                self.character("commentary-narrator", ["commentary-narrator"]),
            ],
        }
        self.sources = {
            "schemaVersion": 2,
            "status": "source-pool",
            "selectionPolicy": {
                "automaticSelection": True,
                "acceptancePolicy": "operator-authorized-deterministic-v1",
            },
            "dialogues": [
                {
                    "dialogue": self.dialogue,
                    "videos": [
                        {
                            "videoId": self.video_id,
                            "url": f"https://www.youtube.com/watch?v={self.video_id}",
                            "title": "Pinned test source",
                            "durationSeconds": 600,
                        }
                    ],
                }
            ],
        }
        self.cast = {
            "schemaVersion": 3,
            "status": "partial",
            "updatedAt": "2026-07-15",
            "enginePolicy": copy.deepcopy(CAST_ENGINE_POLICY),
            "voices": [],
        }
        self.write_json("audio/characters.json", self.characters)
        self.write_json("audio/reference-sources.json", self.sources)
        self.write_json("audio/cast.json", self.cast)
        (root / "audio/jowett-transcript-sources.json").write_text("{}\n")
        (root / "scripts/audio/align_jowett_voice_references.py").write_text(
            "# pinned fixture\n"
        )

    def character(self, character_id: str, role_flags: list[str]) -> dict:
        return {
            "characterId": character_id,
            "displayName": character_id,
            "identityStatus": "resolved",
            "appearances": [
                {
                    "dialogue": self.dialogue,
                    "editorialStatus": "resolved",
                    "roleFlags": role_flags,
                    "performanceRole": "voice-owner",
                }
            ],
        }

    def write_json(self, relative: str, value: dict) -> None:
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")

    def candidate(
        self,
        character_id: str,
        candidate_id: str,
        *,
        start: float,
        duration: float,
    ) -> dict:
        inputs = self.input_records()
        return {
            "candidateId": candidate_id,
            "status": "automatically-eligible-reference-interval",
            "dialogue": self.dialogue,
            "characterId": character_id,
            "videoId": self.video_id,
            "sourceTurn": {"ordinal": 1},
            "alignment": {
                "expectedPrompt": "these words form a clean exact reference prompt for deterministic testing",
                "expectedPromptWordCount": 10,
                "startSeconds": start,
                "endSeconds": start + duration,
                "durationSeconds": duration,
                "exactTokenRatio": 1.0,
                "confidence": 1.0,
            },
            "sourceAgreementSha256": hashlib.sha256(
                f"{character_id}:{candidate_id}:{start}:{duration}".encode("utf-8")
            ).hexdigest(),
            "provenance": {
                "registryPath": inputs["registry"]["path"],
                "registrySha256": inputs["registry"]["sha256"],
                "charactersPath": inputs["characters"]["path"],
                "charactersSha256": inputs["characters"]["sha256"],
                "referenceSourcesPath": inputs["referenceSources"]["path"],
                "referenceSourcesSha256": inputs["referenceSources"]["sha256"],
                "scriptPath": inputs["script"]["path"],
                "scriptSha256": inputs["script"]["sha256"],
            },
            "safety": {
                "singleCharacterUnderEditionRule": True,
                "reportedSpeechExcluded": True,
                "operatorListeningRequired": False,
                "castWritePerformed": False,
            },
        }

    def input_records(self) -> dict:
        paths = {
            "registry": "audio/jowett-transcript-sources.json",
            "characters": "audio/characters.json",
            "referenceSources": "audio/reference-sources.json",
            "script": "scripts/audio/align_jowett_voice_references.py",
        }
        return {
            key: {"path": value, "sha256": sha256_file(self.root / value)}
            for key, value in paths.items()
        }

    def report(self, candidates: list[dict]) -> Path:
        report = {
            "schemaVersion": 1,
            "artifactKind": "jowett-caption-character-reference-alignment",
            "status": "reference-intervals-emitted-no-cast-writes",
            "selection": {"dialogues": [self.dialogue]},
            "inputs": self.input_records(),
            "missingInputs": [],
            "candidates": candidates,
            "referenceAnchorAudits": [],
        }
        report["reportSha256"] = hashlib.sha256(canonical_json(report)).hexdigest()
        path = self.root / "scratch/alignment/test-dialogue.report.json"
        path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        return path

    def build(self, report: Path, **overrides):
        arguments = {
            "phase": "materialize",
            "repo_root": self.root,
            "report_paths": [report],
            "batch_root": Path("scratch/audio-cast-batches"),
        }
        arguments.update(overrides)
        return build_batch_manifest(**arguments)

    def write_wav(
        self,
        path: Path,
        *,
        duration: float,
        sample_width: int = 3,
        byte: int = 0,
    ) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        frames = max(1, round(duration * 48_000))
        sample = bytes([byte]) * sample_width
        with wave.open(str(path), "wb") as handle:
            handle.setnchannels(1)
            handle.setsampwidth(sample_width)
            handle.setframerate(48_000)
            handle.writeframes(sample * frames)

    def materialize_auditions(self, manifest: dict) -> None:
        policy = orchestrator.AUDITION_GENERATION_POLICY
        for item in manifest["items"]:
            reference = item["referencePlan"]
            wav = self.root / item["paths"]["referenceWav"]
            sidecar = self.root / item["paths"]["referenceSidecar"]
            self.write_wav(
                wav,
                duration=reference["end_seconds"] - reference["start_seconds"],
            )
            self.write_json(
                item["paths"]["referenceSidecar"],
                {
                    "schemaVersion": 1,
                    "plan": reference,
                    "wav": {"sha256": sha256_file(wav)},
                },
            )
            audition_dir = self.root / item["paths"]["auditionDir"]
            audition_dir.mkdir(parents=True, exist_ok=True)
            audition_plan = {
                "schema_version": 1,
                "dialogue": reference["dialogue"],
                "character_id": item["sourceCharacterId"],
                "video_id": reference["video_id"],
                "source_url": reference["source_url"],
                "reference_path": item["paths"]["referenceWav"],
                "reference_sha256": sha256_file(wav),
                "reference_sidecar_sha256": sha256_file(sidecar),
                "prompt_text": reference["prompt_text"],
                "target_text": TARGET_TEXT,
                "seeds": list(SEEDS),
                "model_repo": policy["modelRepo"],
                "model_revision": policy["modelRevision"],
                "dots_source_commit": policy["dotsSourceCommit"],
                "precision": policy["precision"],
                "language": policy["language"],
                "num_steps": policy["numSteps"],
                "guidance_scale": policy["guidanceScale"],
                "speaker_scale": policy["speakerScale"],
                "max_generate_length": policy["maxGenerateLength"],
                "output_dir": item["paths"]["auditionDir"],
            }
            outputs = []
            for seed in SEEDS:
                output = audition_dir / f"{item['characterId']}-seed{seed}.wav"
                self.write_wav(
                    output,
                    duration=0.01,
                    sample_width=2,
                    byte=seed % 251,
                )
                outputs.append(
                    {
                        "seed": seed,
                        "file": output.name,
                        "sha256": sha256_file(output),
                    }
                )
            audition = {
                "schemaVersion": 1,
                "status": "audition",
                "plan": audition_plan,
                "planSha256": hashlib.sha256(
                    canonical_json(audition_plan)
                ).hexdigest(),
                "outputs": outputs,
            }
            self.write_json(
                f"{item['paths']['auditionDir']}/audition-manifest.json",
                audition,
            )


class OrchestrateDotsCastBatchTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.fixture = BatchFixture(self.root)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def complete_report(self) -> Path:
        return self.fixture.report(
            [
                self.fixture.candidate("alpha", "alpha-weaker", start=20, duration=7.0),
                self.fixture.candidate("alpha", "alpha-best", start=40, duration=8.1),
                self.fixture.candidate(
                    "commentary-narrator", "narrator-best", start=80, duration=8.2
                ),
            ]
        )

    def test_emits_stable_content_addressed_materialization_manifest(self) -> None:
        report = self.complete_report()
        first = self.fixture.build(report)
        second = self.fixture.build(report)
        self.assertEqual(first, second)
        self.assertEqual(first["identity"]["seeds"], list(SEEDS))
        self.assertGreaterEqual(first["identity"]["targetWordCount"], 60)
        self.assertEqual(first["identity"]["targetText"], TARGET_TEXT)
        self.assertEqual(first["identity"]["batchContentSha256"], first["batchSha256"])
        self.assertEqual(
            [item["candidateId"] for item in first["items"]],
            ["alpha-best", "narrator-best"],
        )
        self.assertEqual(first["promotionOrder"], [])
        self.assertEqual(
            {item["paths"]["referenceRoot"] for item in first["items"]},
            {"scratch/audio-references"},
        )
        for item in first["items"]:
            self.assertIn(first["batchSha256"], item["paths"]["itemDir"])
            self.assertEqual(item["phaseStatus"], "pending")
            self.assertEqual(len(item["commands"]), 1)
            self.assertIn(
                "scripts/audio/materialize_youtube_reference.py",
                item["commands"][0]["argv"],
            )
        frozen = {
            key: value
            for key, value in first.items()
            if key not in {"manifestSha256", "batchManifestPath"}
        }
        self.assertEqual(
            first["manifestSha256"], hashlib.sha256(canonical_json(frozen)).hexdigest()
        )
        self.assertIn(first["manifestSha256"], first["batchManifestPath"])

    def test_rejects_stale_alignment_provenance(self) -> None:
        report = self.complete_report()
        self.fixture.characters["characters"][0]["displayName"] = "changed"
        self.fixture.write_json("audio/characters.json", self.fixture.characters)
        with self.assertRaisesRegex(BatchOrchestrationError, "stale against"):
            self.fixture.build(report)

    def test_rejects_candidate_without_bound_source_agreement(self) -> None:
        candidate = self.fixture.candidate("alpha", "alpha", start=20, duration=8.0)
        candidate.pop("sourceAgreementSha256")
        report = self.fixture.report([candidate])
        with self.assertRaisesRegex(BatchOrchestrationError, "unsafe or noncanonical"):
            self.fixture.build(report, only_characters={"alpha"})

    def test_rejects_stale_supplemental_report_input(self) -> None:
        report = self.complete_report()
        ledger = self.root / "scratch/alignment/research-ledger.json"
        ledger.write_text('{"status":"pinned"}\n', encoding="utf-8")
        document = json.loads(report.read_text(encoding="utf-8"))
        document["inputs"]["researchLedger"] = {
            "path": "scratch/alignment/research-ledger.json",
            "sha256": sha256_file(ledger),
        }
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        self.fixture.build(report)
        ledger.write_text('{"status":"changed"}\n', encoding="utf-8")
        with self.assertRaisesRegex(BatchOrchestrationError, "stale against"):
            self.fixture.build(report)

    def test_validates_bound_source_proof_inventory(self) -> None:
        report = self.complete_report()
        source_proof = self.root / "scratch/alignment/source-proof.report.json"
        source_document = {
            "schemaVersion": 1,
            "artifactKind": "jowett-caption-character-reference-alignment",
            "status": "reference-intervals-emitted-no-cast-writes",
            "candidates": [],
        }
        source_document["reportSha256"] = hashlib.sha256(
            canonical_json(source_document)
        ).hexdigest()
        source_proof.write_text(
            json.dumps(source_document, indent=2) + "\n", encoding="utf-8"
        )
        document = json.loads(report.read_text(encoding="utf-8"))
        document["inputs"]["sourceProofs"] = [
            {
                "path": "scratch/alignment/source-proof.report.json",
                "sha256": sha256_file(source_proof),
                "reportSha256": source_document["reportSha256"],
            }
        ]
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        self.fixture.build(report)

        source_proof.write_text('{"status":"changed"}\n', encoding="utf-8")
        with self.assertRaisesRegex(BatchOrchestrationError, "stale against"):
            self.fixture.build(report)

    def test_explicit_candidate_pin_selects_across_same_dialogue_reports(self) -> None:
        first = self.fixture.report(
            [self.fixture.candidate("alpha", "alpha-auto", start=20, duration=8.0)]
        )
        second_document = json.loads(first.read_text(encoding="utf-8"))
        second_document["candidates"] = [
            self.fixture.candidate("alpha", "alpha-pinned", start=40, duration=6.0)
        ]
        second_document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {
                    key: value
                    for key, value in second_document.items()
                    if key != "reportSha256"
                }
            )
        ).hexdigest()
        second = self.root / "scratch/alignment/test-dialogue-targeted.report.json"
        second.write_text(
            json.dumps(second_document, indent=2) + "\n", encoding="utf-8"
        )

        manifest = self.fixture.build(
            first,
            report_paths=[first, second],
            only_characters={"alpha"},
            candidate_ids={"alpha": "alpha-pinned"},
        )
        self.assertEqual(manifest["items"][0]["candidateId"], "alpha-pinned")
        self.assertEqual(
            manifest["identity"]["candidatePins"],
            {"alpha": "alpha-pinned"},
        )

    def test_candidate_pin_parser_rejects_duplicates_and_malformed_values(self) -> None:
        self.assertEqual(
            _parse_candidate_ids(["alpha=one", "beta=two"]),
            {"alpha": "one", "beta": "two"},
        )
        for values in (["alpha"], ["=one"], ["alpha="], ["alpha=one", "alpha=two"]):
            with self.subTest(values=values):
                with self.assertRaisesRegex(
                    BatchOrchestrationError, "unique CHARACTER_ID=CANDIDATE_ID"
                ):
                    _parse_candidate_ids(values)

    def test_rejects_equal_quality_ambiguity(self) -> None:
        report = self.fixture.report(
            [
                self.fixture.candidate("alpha", "alpha-one", start=20, duration=8.0),
                self.fixture.candidate("alpha", "alpha-two", start=40, duration=8.0),
                self.fixture.candidate(
                    "commentary-narrator", "narrator", start=80, duration=8.2
                ),
            ]
        )
        with self.assertRaisesRegex(
            BatchOrchestrationError, "ambiguous equally ranked"
        ):
            self.fixture.build(report)

    def test_rejects_missing_owner_candidate_and_missing_prior_artifact(self) -> None:
        report = self.fixture.report(
            [self.fixture.candidate("alpha", "alpha", start=20, duration=8.0)]
        )
        with self.assertRaisesRegex(BatchOrchestrationError, "commentary-narrator"):
            self.fixture.build(report)

        report = self.complete_report()
        with self.assertRaisesRegex(
            BatchOrchestrationError, "requires materialized reference"
        ):
            self.fixture.build(report, phase="remote-render")

    def test_explicit_subset_can_progress_without_waiving_missing_owners(self) -> None:
        report = self.fixture.report(
            [self.fixture.candidate("alpha", "alpha", start=20, duration=8.0)]
        )
        manifest = self.fixture.build(report, only_characters={"alpha"})
        self.assertEqual([item["characterId"] for item in manifest["items"]], ["alpha"])
        self.assertEqual(
            manifest["identity"]["scope"],
            {
                "kind": "explicit-character-subset",
                "characterIds": ["alpha"],
                "allRemainingCharacterCount": 2,
            },
        )
        with self.assertRaisesRegex(
            BatchOrchestrationError, "not canonical voice owners"
        ):
            self.fixture.build(report, only_characters={"unknown"})

    def test_only_narrator_can_use_explicit_source_reassignment(self) -> None:
        report = self.fixture.report(
            [self.fixture.candidate("alpha", "alpha", start=20, duration=8.0)]
        )
        with self.assertRaisesRegex(BatchOrchestrationError, "explicit reason"):
            self.fixture.build(report, narrator_source_character_id="alpha")
        manifest = self.fixture.build(
            report,
            narrator_source_character_id="alpha",
            narrator_reassignment_reason="Operator authorizes alpha as the narrator source.",
        )
        narrator = next(
            item
            for item in manifest["items"]
            if item["characterId"] == "commentary-narrator"
        )
        self.assertEqual(narrator["sourceCharacterId"], "alpha")
        self.assertEqual(
            narrator["reassignmentReason"],
            "Operator authorizes alpha as the narrator source.",
        )

    def test_promotion_manifest_is_one_explicit_serial_chain(self) -> None:
        report = self.complete_report()

        def phase_command(**arguments):
            character_id = arguments["item"]["characterId"]
            command = {
                "argv": ["promote", character_id, "--write"],
                "shell": f"promote {character_id} --write",
                "executionHost": "local",
            }
            return "ready", [command]

        with mock.patch.object(
            orchestrator, "_phase_commands", side_effect=phase_command
        ):
            manifest = self.fixture.build(report, phase="promote")
        self.assertEqual(manifest["promotionOrder"], ["alpha", "commentary-narrator"])
        self.assertEqual(
            manifest["serialPromotion"]["shell"],
            "promote alpha --write && promote commentary-narrator --write",
        )
        self.assertFalse(manifest["executionPolicy"]["castWritePerformed"])

    def test_proof_rebase_does_not_change_audition_artifact_identity_or_path(
        self,
    ) -> None:
        report = self.complete_report()
        first = self.fixture.build(report)
        document = json.loads(report.read_text(encoding="utf-8"))
        for index, candidate in enumerate(document["candidates"]):
            candidate["candidateId"] += "-proof-rebase"
            candidate["sourceAgreementSha256"] = f"{index + 1:064x}"
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        second = self.fixture.build(report)

        self.assertNotEqual(first["batchSha256"], second["batchSha256"])
        first_by_id = {item["characterId"]: item for item in first["items"]}
        second_by_id = {item["characterId"]: item for item in second["items"]}
        for character_id in first_by_id:
            self.assertNotEqual(
                first_by_id[character_id]["candidateId"],
                second_by_id[character_id]["candidateId"],
            )
            self.assertEqual(
                first_by_id[character_id]["auditionArtifactIdentity"],
                second_by_id[character_id]["auditionArtifactIdentity"],
            )
            self.assertNotIn(
                "candidateId",
                second_by_id[character_id]["auditionArtifactIdentity"],
            )
            self.assertEqual(
                first_by_id[character_id]["auditionArtifactSha256"],
                second_by_id[character_id]["auditionArtifactSha256"],
            )
            self.assertEqual(
                first_by_id[character_id]["paths"]["auditionDir"],
                second_by_id[character_id]["paths"]["auditionDir"],
            )

    def test_modern_reuse_resumes_completed_audition_after_proof_id_rebase(
        self,
    ) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        original_by_character = {
            item["characterId"]: copy.deepcopy(item) for item in prior["items"]
        }
        self.fixture.materialize_auditions(prior)
        prior["manifestSha256"] = hashlib.sha256(
            canonical_json(
                {
                    key: value
                    for key, value in prior.items()
                    if key not in {"manifestSha256", "batchManifestPath"}
                }
            )
        ).hexdigest()
        prior_path = self.root / "scratch/pre-rebase.manifest.json"
        prior_path.write_text(json.dumps(prior, indent=2) + "\n", encoding="utf-8")

        document = json.loads(report.read_text(encoding="utf-8"))
        for index, candidate in enumerate(document["candidates"]):
            candidate["candidateId"] += "-catalog-rebase"
            candidate["sourceAgreementSha256"] = f"{index + 20:064x}"
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")

        reused = self.fixture.build(
            report,
            phase="remote-render",
            reuse_auditions_from=prior_path,
        )
        self.assertEqual(reused["phaseCommands"], [])
        for item in reused["items"]:
            old = original_by_character[item["characterId"]]
            reuse = item["artifactReuse"]
            self.assertEqual(item["phaseStatus"], "complete")
            self.assertEqual(item["commands"], [])
            self.assertEqual(item["paths"]["auditionDir"], old["paths"]["auditionDir"])
            self.assertEqual(
                item["auditionArtifactSha256"], old["auditionArtifactSha256"]
            )
            self.assertEqual(reuse["priorCandidateId"], old["candidateId"])
            self.assertEqual(reuse["currentCandidateId"], item["candidateId"])
            self.assertNotEqual(
                reuse["priorCandidateId"], reuse["currentCandidateId"]
            )
            self.assertEqual(
                reuse["reuseBasis"],
                "canonical-audition-inputs-byte-equivalent-v1",
            )
            self.assertEqual(
                reuse["reuseIdentitySha256"],
                hashlib.sha256(canonical_json(reuse["reuseIdentity"])).hexdigest(),
            )
            self.assertEqual(
                reuse["normalizedAuditionArtifactSha256"],
                item["auditionArtifactSha256"],
            )
            self.assertEqual(reuse["auditionOutputCount"], len(SEEDS))
            self.assertRegex(reuse["auditionManifestSha256"], r"^[0-9a-f]{64}$")
            self.assertRegex(
                reuse["reuseIdentity"]["materializedReference"]["wavSha256"],
                r"^[0-9a-f]{64}$",
            )

    def test_legacy_candidate_bearing_identity_normalizes_only_candidate_id(
        self,
    ) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        self.fixture.materialize_auditions(prior)
        prior_ids = {}
        for item in prior["items"]:
            prior_ids[item["characterId"]] = item["candidateId"]
            item["auditionArtifactIdentity"]["candidateId"] = item["candidateId"]
            item["auditionArtifactSha256"] = hashlib.sha256(
                canonical_json(item["auditionArtifactIdentity"])
            ).hexdigest()
        prior["manifestSha256"] = hashlib.sha256(
            canonical_json(
                {
                    key: value
                    for key, value in prior.items()
                    if key not in {"manifestSha256", "batchManifestPath"}
                }
            )
        ).hexdigest()
        prior_path = self.root / "scratch/legacy-candidate.manifest.json"
        prior_path.write_text(json.dumps(prior, indent=2) + "\n", encoding="utf-8")

        document = json.loads(report.read_text(encoding="utf-8"))
        for index, candidate in enumerate(document["candidates"]):
            candidate["candidateId"] += "-proof-rebase"
            candidate["sourceAgreementSha256"] = f"{index + 40:064x}"
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")

        reused = self.fixture.build(
            report,
            phase="remote-render",
            reuse_auditions_from=prior_path,
        )
        for item in reused["items"]:
            receipt = item["artifactReuse"]
            self.assertEqual(receipt["priorCandidateId"], prior_ids[item["characterId"]])
            self.assertEqual(receipt["currentCandidateId"], item["candidateId"])
            self.assertEqual(
                receipt["priorAuditionArtifactSha256"],
                next(
                    old["auditionArtifactSha256"]
                    for old in prior["items"]
                    if old["characterId"] == item["characterId"]
                ),
            )
            self.assertNotIn(
                "candidateId",
                receipt["reuseIdentity"]["auditionArtifactIdentity"],
            )

    def test_reuse_rejects_every_non_candidate_audio_identity_difference(self) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        document = json.loads(report.read_text(encoding="utf-8"))
        for index, candidate in enumerate(document["candidates"]):
            candidate["candidateId"] += "-proof-rebase"
            candidate["sourceAgreementSha256"] = f"{index + 60:064x}"
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")

        def reject_after(mutate, error: str = "inputs differ") -> None:
            # Round-trip so the repeated reference-plan value is represented
            # as independent manifest objects rather than Python aliases.
            changed = json.loads(json.dumps(prior))
            mutate(changed)
            changed["manifestSha256"] = hashlib.sha256(
                canonical_json(
                    {
                        key: value
                        for key, value in changed.items()
                        if key not in {"manifestSha256", "batchManifestPath"}
                    }
                )
            ).hexdigest()
            path = self.root / "scratch/reuse-mismatch.manifest.json"
            path.write_text(json.dumps(changed, indent=2) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(BatchOrchestrationError, error):
                self.fixture.build(report, reuse_auditions_from=path)

        reject_after(
            lambda value: value["items"][0].__setitem__(
                "sourceCharacterId", "different-source"
            )
        )
        reject_after(
            lambda value: value["identity"].__setitem__(
                "targetText", value["identity"]["targetText"] + " changed"
            )
        )
        reject_after(
            lambda value: value["identity"].__setitem__("seeds", [42, 43])
        )

        def changed_value(value):
            if isinstance(value, str):
                return value + "-changed"
            if isinstance(value, int):
                return value + 1
            if isinstance(value, float):
                return value + 0.125
            raise AssertionError(f"unsupported fixture value: {value!r}")

        for key in prior["items"][0]["referencePlan"]:
            with self.subTest(reference_plan_key=key):
                reject_after(
                    lambda value, key=key: value["items"][0][
                        "referencePlan"
                    ].__setitem__(
                        key,
                        changed_value(value["items"][0]["referencePlan"][key]),
                    )
                )

        for key in prior["auditionGenerationPolicy"]:
            with self.subTest(generation_policy_key=key):
                reject_after(
                    lambda value, key=key: value[
                        "auditionGenerationPolicy"
                    ].__setitem__(
                        key,
                        changed_value(value["auditionGenerationPolicy"][key]),
                    ),
                    "generation policy differs",
                )

        def mutate_recorded_identity(value, mutate) -> None:
            identity = value["items"][0]["auditionArtifactIdentity"]
            mutate(identity)
            value["items"][0]["auditionArtifactSha256"] = hashlib.sha256(
                canonical_json(identity)
            ).hexdigest()

        reject_after(
            lambda value: mutate_recorded_identity(
                value,
                lambda identity: identity["referencePlan"].__setitem__(
                    "end_seconds", 99.0
                ),
            ),
            "artifact identity differs",
        )
        reject_after(
            lambda value: mutate_recorded_identity(
                value,
                lambda identity: identity.__setitem__(
                    "candidateId", "inconsistent-prior-proof-id"
                ),
            ),
            "artifact candidate ID is inconsistent",
        )
        reject_after(
            lambda value: mutate_recorded_identity(
                value,
                lambda identity: identity.__setitem__("unexpectedField", True),
            ),
            "artifact identity differs",
        )

    def test_reuse_rejects_legacy_manifests_without_audio_identity_proof(self) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)

        def reject(changed: dict, error: str) -> None:
            changed["manifestSha256"] = hashlib.sha256(
                canonical_json(
                    {
                        key: value
                        for key, value in changed.items()
                        if key not in {"manifestSha256", "batchManifestPath"}
                    }
                )
            ).hexdigest()
            path = self.root / "scratch/unproven-reuse.manifest.json"
            path.write_text(json.dumps(changed, indent=2) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(BatchOrchestrationError, error):
                self.fixture.build(report, reuse_auditions_from=path)

        for missing_policy in (None, "absent", "not-an-object"):
            changed = json.loads(json.dumps(prior))
            if missing_policy == "absent":
                changed.pop("auditionGenerationPolicy")
            else:
                changed["auditionGenerationPolicy"] = missing_policy
            with self.subTest(generation_policy=missing_policy):
                reject(changed, "requires a recorded generation policy")

        for missing_identity in (None, "absent", "not-an-object"):
            changed = json.loads(json.dumps(prior))
            if missing_identity == "absent":
                changed["items"][0].pop("auditionArtifactIdentity")
            else:
                changed["items"][0]["auditionArtifactIdentity"] = missing_identity
            with self.subTest(artifact_identity=missing_identity):
                reject(changed, "requires a recorded artifact identity")

        for invalid_hash in (None, "absent", "not-a-sha256", "0" * 64):
            changed = json.loads(json.dumps(prior))
            if invalid_hash == "absent":
                changed["items"][0].pop("auditionArtifactSha256")
            else:
                changed["items"][0]["auditionArtifactSha256"] = invalid_hash
            with self.subTest(artifact_hash=invalid_hash):
                reject(changed, "artifact hash is inconsistent")

        for invalid_candidate in (None, "absent", "", ["not", "a", "string"]):
            changed = json.loads(json.dumps(prior))
            if invalid_candidate == "absent":
                changed["items"][0].pop("candidateId")
            else:
                changed["items"][0]["candidateId"] = invalid_candidate
            with self.subTest(prior_candidate_id=invalid_candidate):
                reject(changed, "candidate ID is malformed")

        for invalid_candidate in (None, "", ["not", "a", "string"]):
            changed = json.loads(json.dumps(prior))
            identity = changed["items"][0]["auditionArtifactIdentity"]
            identity["candidateId"] = invalid_candidate
            changed["items"][0]["auditionArtifactSha256"] = hashlib.sha256(
                canonical_json(identity)
            ).hexdigest()
            with self.subTest(artifact_candidate_id=invalid_candidate):
                reject(changed, "artifact candidate ID is malformed")

    def test_reuse_normalizes_null_independent_asr_path_and_rejects_garbage(
        self,
    ) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        self.fixture.materialize_auditions(prior)
        prior["items"][0]["paths"]["referenceAsrIndependent"] = None

        def write_prior() -> Path:
            prior["manifestSha256"] = hashlib.sha256(
                canonical_json(
                    {
                        key: value
                        for key, value in prior.items()
                        if key not in {"manifestSha256", "batchManifestPath"}
                    }
                )
            ).hexdigest()
            path = self.root / "scratch/reuse-with-legacy-independent-path.json"
            path.write_text(json.dumps(prior, indent=2) + "\n", encoding="utf-8")
            return path

        prior_path = write_prior()
        reused = self.fixture.build(
            report,
            phase="remote-render",
            reuse_auditions_from=prior_path,
        )
        reused_by_character = {item["characterId"]: item for item in reused["items"]}
        alpha_paths = reused_by_character["alpha"]["paths"]
        self.assertEqual(
            alpha_paths["referenceAsrIndependent"],
            f"{alpha_paths['auditionDir']}/reference-asr-independent.json",
        )
        prior["items"][0]["paths"].pop("referenceAsrIndependent")
        write_prior()
        missing_path_reuse = self.fixture.build(
            report,
            phase="remote-render",
            reuse_auditions_from=prior_path,
        )
        missing_alpha_paths = next(
            item["paths"]
            for item in missing_path_reuse["items"]
            if item["characterId"] == "alpha"
        )
        self.assertEqual(
            missing_alpha_paths["referenceAsrIndependent"],
            f"{missing_alpha_paths['auditionDir']}/reference-asr-independent.json",
        )

        prior["items"][0]["paths"]["referenceAsrIndependent"] = (
            "scratch/explicit/reference-asr-independent.json"
        )
        write_prior()
        with self.assertRaisesRegex(BatchOrchestrationError, "paths are incoherent"):
            self.fixture.build(report, reuse_auditions_from=prior_path)

        prior["items"][0]["paths"]["referenceAsrIndependent"] = ["not", "a", "path"]
        write_prior()
        with self.assertRaisesRegex(
            BatchOrchestrationError, "referenceAsrIndependent must be a non-empty path"
        ):
            self.fixture.build(report, reuse_auditions_from=prior_path)

    def test_reuse_requires_all_prior_paths_to_match_the_audition_directory(
        self,
    ) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        self.fixture.materialize_auditions(prior)
        keys = (
            "auditionDir",
            "referenceWav",
            "referenceSidecar",
            "asrQa",
            "speakerRanking",
            "referenceAsrAdjudication",
            "referenceAsrIndependent",
        )
        for key in keys:
            changed = json.loads(json.dumps(prior))
            changed["items"][0]["paths"][key] = f"scratch/external/{key}"
            changed["manifestSha256"] = hashlib.sha256(
                canonical_json(
                    {
                        field: value
                        for field, value in changed.items()
                        if field not in {"manifestSha256", "batchManifestPath"}
                    }
                )
            ).hexdigest()
            path = self.root / "scratch/incoherent-reuse-paths.manifest.json"
            path.write_text(json.dumps(changed, indent=2) + "\n", encoding="utf-8")
            with self.subTest(path_key=key), self.assertRaisesRegex(
                BatchOrchestrationError,
                "paths are incoherent|requires a materialized reference",
            ):
                self.fixture.build(report, reuse_auditions_from=path)

    def test_remote_reuse_rejects_tampered_reference_plan_and_output_bytes(
        self,
    ) -> None:
        report = self.complete_report()
        prior = self.fixture.build(report)
        self.fixture.materialize_auditions(prior)
        prior["manifestSha256"] = hashlib.sha256(
            canonical_json(
                {
                    key: value
                    for key, value in prior.items()
                    if key not in {"manifestSha256", "batchManifestPath"}
                }
            )
        ).hexdigest()
        prior_path = self.root / "scratch/tamper-source.manifest.json"
        prior_path.write_text(json.dumps(prior, indent=2) + "\n", encoding="utf-8")

        document = json.loads(report.read_text(encoding="utf-8"))
        for index, candidate in enumerate(document["candidates"]):
            candidate["candidateId"] += "-proof-rebase"
            candidate["sourceAgreementSha256"] = f"{index + 80:064x}"
        document["reportSha256"] = hashlib.sha256(
            canonical_json(
                {key: value for key, value in document.items() if key != "reportSha256"}
            )
        ).hexdigest()
        report.write_text(json.dumps(document, indent=2) + "\n", encoding="utf-8")
        alpha = next(item for item in prior["items"] if item["characterId"] == "alpha")

        def audition_manifest() -> Path:
            return (
                self.root
                / alpha["paths"]["auditionDir"]
                / "audition-manifest.json"
            )

        def rewrite_audition_plan(field: str, value) -> None:
            path = audition_manifest()
            artifact = json.loads(path.read_text(encoding="utf-8"))
            artifact["plan"][field] = value
            artifact["planSha256"] = hashlib.sha256(
                canonical_json(artifact["plan"])
            ).hexdigest()
            path.write_text(json.dumps(artifact, indent=2) + "\n", encoding="utf-8")

        def assert_rejected(mutate, error: str) -> None:
            self.fixture.materialize_auditions(prior)
            mutate()
            with self.assertRaisesRegex(BatchOrchestrationError, error):
                self.fixture.build(
                    report,
                    phase="remote-render",
                    reuse_auditions_from=prior_path,
                )

        assert_rejected(
            lambda: rewrite_audition_plan("target_text", TARGET_TEXT + " changed"),
            "stale audition manifest",
        )
        assert_rejected(
            lambda: rewrite_audition_plan("speaker_scale", 9.0),
            "stale audition manifest",
        )

        def tamper_sidecar() -> None:
            sidecar = self.root / alpha["paths"]["referenceSidecar"]
            value = json.loads(sidecar.read_text(encoding="utf-8"))
            value["nonAudioMutation"] = True
            sidecar.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")

        assert_rejected(tamper_sidecar, "stale audition manifest")

        def tamper_reference_wav() -> None:
            reference = alpha["referencePlan"]
            wav = self.root / alpha["paths"]["referenceWav"]
            self.fixture.write_wav(
                wav,
                duration=reference["end_seconds"] - reference["start_seconds"],
                byte=1,
            )
            sidecar = self.root / alpha["paths"]["referenceSidecar"]
            value = json.loads(sidecar.read_text(encoding="utf-8"))
            value["wav"]["sha256"] = sha256_file(wav)
            sidecar.write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")

        assert_rejected(tamper_reference_wav, "stale audition manifest")

        def tamper_output_wav() -> None:
            artifact = json.loads(audition_manifest().read_text(encoding="utf-8"))
            output = self.root / alpha["paths"]["auditionDir"] / artifact["outputs"][0]["file"]
            output.write_bytes(output.read_bytes() + b"tampered")

        assert_rejected(tamper_output_wav, "missing or corrupt")

    def test_qa_rank_emits_one_manifest_level_gpu_model_command(self) -> None:
        report = self.complete_report()

        with mock.patch.object(
            orchestrator,
            "_phase_commands",
            return_value=("pending", []),
        ):
            manifest = self.fixture.build(report, phase="qa-rank")

        self.assertTrue(all(item["commands"] == [] for item in manifest["items"]))
        gpu_commands = [
            command
            for command in manifest["phaseCommands"]
            if command["executionHost"] == "gpu"
        ]
        self.assertEqual(len(gpu_commands), 1)
        self.assertIn(
            "scripts/audio/batch_qa_dots_auditions.py",
            gpu_commands[0]["shell"],
        )
        self.assertNotIn("qa_dots_audition.py --manifest", gpu_commands[0]["shell"])
        self.assertNotIn("rank_dots_audition.py --manifest", gpu_commands[0]["shell"])
        self.assertIn("--cache-dir /mnt/models/hf", gpu_commands[0]["shell"])
        self.assertIn(
            "--independent-cache-dir /mnt/models/cache/huggingface",
            gpu_commands[0]["shell"],
        )
        self.assertEqual(manifest["remote"]["cache"], "/mnt/models/hf")
        self.assertEqual(
            manifest["remote"]["independentCache"],
            "/mnt/models/cache/huggingface",
        )
        self.assertEqual(
            manifest["batchManifestPath"],
            manifest["phaseCommands"][0]["argv"][2],
        )

    def test_rejects_relative_noncanonical_or_shared_remote_cache_paths(self) -> None:
        report = self.complete_report()
        cases = (
            ({"remote_cache": "relative/cache"}, "primary model cache"),
            (
                {"independent_cache_dir": "relative/cache"},
                "independent large-v3 model cache",
            ),
            ({"remote_cache": "/mnt/models/hf/"}, "primary model cache"),
            (
                {
                    "remote_cache": "/mnt/models/hf",
                    "independent_cache_dir": "/mnt/models/hf",
                },
                "must be distinct",
            ),
        )
        for overrides, error in cases:
            with self.subTest(overrides=overrides):
                with self.assertRaisesRegex(BatchOrchestrationError, error):
                    self.fixture.build(report, **overrides)

    def test_remote_render_emits_one_manifest_level_dots_command(self) -> None:
        report = self.complete_report()

        with mock.patch.object(
            orchestrator,
            "_phase_commands",
            return_value=("pending", []),
        ):
            manifest = self.fixture.build(report, phase="remote-render")

        self.assertTrue(all(item["commands"] == [] for item in manifest["items"]))
        gpu_commands = [
            command
            for command in manifest["phaseCommands"]
            if command["executionHost"] == "gpu"
        ]
        self.assertEqual(len(gpu_commands), 1)
        self.assertIn(
            "scripts/audio/batch_render_dots_auditions.py",
            gpu_commands[0]["shell"],
        )
        self.assertNotIn(
            "scripts/audio/audition_dots_reference.py",
            gpu_commands[0]["shell"],
        )
        self.assertEqual(
            manifest["batchManifestPath"],
            manifest["phaseCommands"][0]["argv"][2],
        )


if __name__ == "__main__":
    unittest.main()
