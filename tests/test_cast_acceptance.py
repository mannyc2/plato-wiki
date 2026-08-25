from __future__ import annotations

import argparse
import copy
import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CRITO_REPORT = Path(
    "scratch/audio-jowett-reference-alignment/policy-899a2006/crito.report.json"
)
CRITO_REPORT_ABSOLUTE = REPO_ROOT / CRITO_REPORT
SOCRATES_POLICY_ADJUDICATION = Path(
    "scratch/audio-references/auditions/socrates-safe-seed44/"
    "reference-asr-adjudication-policy-899a2006.json"
)
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from accept_dots_cast_voice import (  # noqa: E402
    VoiceAcceptanceError,
    _jowett_purity,
    build_decision,
    canonical_json,
    pretty_json,
    sha256_file,
)
from cast_acceptance import (  # noqa: E402
    CastAcceptanceError,
    evaluate_gate_failures,
    validate_cast_decision_artifacts,
    validate_selected_voice,
)
from verify_reference_asr_adjudication import (  # noqa: E402
    ReferenceAsrAdjudicationError,
    build_adjudication,
    validate_adjudication,
    validate_independent_report,
)


def args_for(character_id: str, *, fallback: bool = False) -> argparse.Namespace:
    if character_id == "crito":
        sidecar = Path(
            "scratch/audio-references/crito/"
            "MNDfJMrH1XY-000296590-000303000-f1e4b2e6ab0a.json"
        )
        audition = Path("scratch/audio-references/auditions/crito-neutral-corrected")
        seed = None
    else:
        sidecar = Path(
            "scratch/audio-references/socrates/"
            "MNDfJMrH1XY-000065920-000072280-b577608ef05e.json"
        )
        audition = Path("scratch/audio-references/auditions/socrates-safe-seed44")
        seed = 44
    return argparse.Namespace(
        character_id=character_id,
        source_character_id=None,
        reassignment_reason=None,
        reference_sidecar=sidecar,
        speaker_purity=CRITO_REPORT,
        clone_manifest=audition / "audition-manifest.json",
        asr=audition / "asr-qa.json",
        acoustic=audition / "speaker-ranking.json",
        reference_asr_adjudication=(
            SOCRATES_POLICY_ADJUDICATION if fallback else None
        ),
        seed=seed,
        accepted_at="2026-07-15",
        decision_output=None,
        cast=Path("audio/cast.json"),
        characters=Path("audio/characters.json"),
        sources=Path("audio/reference-sources.json"),
        ffmpeg="ffmpeg",
        write=False,
    )


def cross_dialogue_args(
    target_character_id: str, *, source_character_id: str = "socrates"
) -> argparse.Namespace:
    args = args_for("socrates", fallback=True)
    args.character_id = target_character_id
    args.source_character_id = source_character_id
    args.reassignment_reason = "Reuse this explicitly authorized source performance."
    return args


class DeterministicCastAcceptanceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.crito_decision, cls.crito_voice = build_decision(args_for("crito"))
        cls.socrates_decision, cls.socrates_voice = build_decision(
            args_for("socrates", fallback=True)
        )

    def test_corrected_crito_batch_selects_highest_ranked_safe_seed(self) -> None:
        self.assertEqual(self.crito_voice["seed"], 43)
        self.assertEqual(
            self.crito_voice["reference"]["speakerPurityProofRecordId"],
            "corrected-crito-reference",
        )
        self.assertRegex(
            self.crito_voice["reference"][
                "speakerPuritySourceAgreementSha256"
            ],
            r"^[0-9a-f]{64}$",
        )
        self.assertEqual(
            self.crito_voice["selection"]["candidateSelection"],
            "highest-ranked-passing",
        )
        clipped_top = next(
            row for row in self.crito_decision["candidates"] if row["seed"] == 47
        )
        self.assertEqual(clipped_top["failures"], ["signal-safety"])
        self.assertEqual(clipped_top["audition"]["clippedSamples"], 3)
        self.assertEqual(
            self.crito_voice["selection"]["decisionSha256"],
            hashlib.sha256(pretty_json(self.crito_decision)).hexdigest(),
        )

    def test_safe_socrates_seed44_uses_semantically_verified_fallback(self) -> None:
        self.assertEqual(self.socrates_voice["seed"], 44)
        reference = self.socrates_voice["reference"]
        self.assertEqual(reference["videoStartSeconds"], 65.92)
        self.assertEqual(reference["videoEndSeconds"], 72.28)
        self.assertEqual(
            reference["referenceAsr"]["decision"],
            "independent-large-v3-zero-error",
        )
        self.assertEqual(
            reference["referenceAsr"]["sourceAgreementSha256"],
            "ebd601a99804f18ad1dc990da2c9de65b91207f3c029d9b7f7c66bcbe1901a39",
        )
        self.assertEqual(
            reference["speakerPurityProofRecordId"],
            "existing-socrates-selection",
        )
        self.assertEqual(
            reference["speakerPuritySourceAgreementSha256"],
            reference["referenceAsr"]["sourceAgreementSha256"],
        )

    def test_ordinary_direct_candidate_is_promotion_eligible_proof(self) -> None:
        report_path = CRITO_REPORT_ABSOLUTE
        report = json.loads(report_path.read_text(encoding="utf-8"))
        candidate = report["candidates"][0]
        alignment = candidate["alignment"]
        proof, proof_file_sha = _jowett_purity(
            report_path,
            dialogue=candidate["dialogue"],
            source_character_id=candidate["characterId"],
            video_id=candidate["videoId"],
            start_seconds=alignment["startSeconds"],
            end_seconds=alignment["endSeconds"],
            prompt_text=alignment["expectedPrompt"],
            registry_sha256=sha256_file(REPO_ROOT / "audio/reference-sources.json"),
        )
        self.assertEqual(
            proof["sourceAgreementSha256"], candidate["sourceAgreementSha256"]
        )
        self.assertEqual(proof["proofRecordId"], candidate["candidateId"])
        self.assertEqual(proof_file_sha, sha256_file(report_path))

    def test_candidate_cannot_shadow_a_duplicate_matching_anchor(self) -> None:
        report_path = CRITO_REPORT_ABSOLUTE
        report = json.loads(report_path.read_text(encoding="utf-8"))
        candidate = report["candidates"][0]
        alignment = candidate["alignment"]
        report["referenceAnchorAudits"].append(
            {
                "anchorId": "duplicate-test-anchor",
                "characterId": candidate["characterId"],
                "videoId": candidate["videoId"],
                "status": "verified-exact-requested-interval",
                "safeInterval": {
                    "startSeconds": alignment["startSeconds"],
                    "endSeconds": alignment["endSeconds"],
                    "expectedPrompt": alignment["expectedPrompt"],
                },
                "sourceTurn": {"containsQuotedSpeech": False},
                "sourceAgreementSha256": "f" * 64,
                "provenance": candidate["provenance"],
                "castWritePerformed": False,
            }
        )
        unsigned = {key: value for key, value in report.items() if key != "reportSha256"}
        report["reportSha256"] = hashlib.sha256(canonical_json(unsigned)).hexdigest()
        with tempfile.TemporaryDirectory() as raw_root:
            duplicate_path = Path(raw_root) / "duplicate.report.json"
            duplicate_path.write_text(json.dumps(report), encoding="utf-8")
            with self.assertRaisesRegex(VoiceAcceptanceError, "not uniquely proved"):
                _jowett_purity(
                    duplicate_path,
                    dialogue=candidate["dialogue"],
                    source_character_id=candidate["characterId"],
                    video_id=candidate["videoId"],
                    start_seconds=alignment["startSeconds"],
                    end_seconds=alignment["endSeconds"],
                    prompt_text=alignment["expectedPrompt"],
                    registry_sha256=sha256_file(
                        REPO_ROOT / "audio/reference-sources.json"
                    ),
                )

    def test_resigned_report_cannot_hide_stale_live_inputs(self) -> None:
        report_path = CRITO_REPORT_ABSOLUTE
        original = json.loads(report_path.read_text(encoding="utf-8"))
        candidate = original["candidates"][0]
        alignment = candidate["alignment"]
        provenance_fields = {
            "characters": "charactersSha256",
            "script": "scriptSha256",
        }
        for input_name, provenance_field in provenance_fields.items():
            with self.subTest(input_name):
                report = copy.deepcopy(original)
                report["inputs"][input_name]["sha256"] = "f" * 64
                report["candidates"][0]["provenance"][provenance_field] = "f" * 64
                unsigned = {
                    key: value for key, value in report.items() if key != "reportSha256"
                }
                report["reportSha256"] = hashlib.sha256(
                    canonical_json(unsigned)
                ).hexdigest()
                with tempfile.TemporaryDirectory() as raw_root:
                    stale_path = Path(raw_root) / "stale.report.json"
                    stale_path.write_text(json.dumps(report), encoding="utf-8")
                    with self.assertRaisesRegex(
                        VoiceAcceptanceError,
                        f"stale against its {input_name} input",
                    ):
                        _jowett_purity(
                            stale_path,
                            dialogue=candidate["dialogue"],
                            source_character_id=candidate["characterId"],
                            video_id=candidate["videoId"],
                            start_seconds=alignment["startSeconds"],
                            end_seconds=alignment["endSeconds"],
                            prompt_text=alignment["expectedPrompt"],
                            registry_sha256=sha256_file(
                                REPO_ROOT / "audio/reference-sources.json"
                            ),
                        )

    def test_resigned_record_cannot_drift_from_report_input_provenance(self) -> None:
        report_path = CRITO_REPORT_ABSOLUTE
        report = json.loads(report_path.read_text(encoding="utf-8"))
        candidate = report["candidates"][0]
        alignment = candidate["alignment"]
        report["candidates"][0]["provenance"]["scriptSha256"] = "f" * 64
        unsigned = {key: value for key, value in report.items() if key != "reportSha256"}
        report["reportSha256"] = hashlib.sha256(canonical_json(unsigned)).hexdigest()
        with tempfile.TemporaryDirectory() as raw_root:
            stale_path = Path(raw_root) / "stale-record.report.json"
            stale_path.write_text(json.dumps(report), encoding="utf-8")
            with self.assertRaisesRegex(
                VoiceAcceptanceError,
                "record provenance differs from its script input",
            ):
                _jowett_purity(
                    stale_path,
                    dialogue=candidate["dialogue"],
                    source_character_id=candidate["characterId"],
                    video_id=candidate["videoId"],
                    start_seconds=alignment["startSeconds"],
                    end_seconds=alignment["endSeconds"],
                    prompt_text=alignment["expectedPrompt"],
                    registry_sha256=sha256_file(
                        REPO_ROOT / "audio/reference-sources.json"
                    ),
                )

    def test_socrates_primary_failure_has_no_unverified_escape_hatch(self) -> None:
        with self.assertRaisesRegex(VoiceAcceptanceError, "has no adjudication"):
            build_decision(args_for("socrates", fallback=False))

    def test_rejected_socrates_boundaries_never_count_as_safe_interval(self) -> None:
        with self.assertRaisesRegex(VoiceAcceptanceError, "not uniquely proved"):
            _jowett_purity(
                CRITO_REPORT_ABSOLUTE,
                dialogue="crito",
                source_character_id="socrates",
                video_id="MNDfJMrH1XY",
                start_seconds=65.04,
                end_seconds=72.51,
                prompt_text=(
                    "Why, Crito, when a man has reached my age he ought not to be "
                    "repining at the prospect of death."
                ),
                registry_sha256=sha256_file(REPO_ROOT / "audio/reference-sources.json"),
            )

    def test_source_reassignment_requires_an_explicit_operator_reason(self) -> None:
        voice = copy.deepcopy(self.socrates_voice)
        voice["characterId"] = "narrator"
        voice["displayName"] = "Narrator"
        with self.assertRaisesRegex(CastAcceptanceError, "source identity mismatch"):
            validate_selected_voice(voice)
        voice["selection"]["sourceAssignment"] = {
            "kind": "voice-source-reassignment",
            "authorizedBy": "operator",
            "reason": "Use the explicitly authorized source performance.",
        }
        validate_selected_voice(voice)

    def test_cross_dialogue_source_reassignment_targets_a_global_voice_owner(self) -> None:
        decision, voice = build_decision(cross_dialogue_args("menos-boy"))

        self.assertEqual(voice["characterId"], "menos-boy")
        self.assertEqual(voice["reference"]["sourceDialogue"], "crito")
        self.assertEqual(voice["reference"]["sourceCharacterId"], "socrates")
        self.assertEqual(
            voice["selection"]["sourceAssignment"]["kind"],
            "voice-source-reassignment",
        )
        self.assertEqual(decision["sourceCharacterId"], "socrates")

    def test_cross_dialogue_reassignment_rejects_a_missing_source_character(self) -> None:
        with self.assertRaisesRegex(
            VoiceAcceptanceError, "source character 'missing-source' is absent"
        ):
            build_decision(
                cross_dialogue_args(
                    "menos-boy", source_character_id="missing-source"
                )
            )

    def test_cross_dialogue_reassignment_rejects_a_non_voice_owner_target(self) -> None:
        with self.assertRaisesRegex(
            VoiceAcceptanceError,
            "target character 'dream-woman' is not a globally resolved canonical voice owner",
        ):
            build_decision(cross_dialogue_args("dream-woman"))

    def test_same_character_source_still_requires_a_source_dialogue_appearance(
        self,
    ) -> None:
        with self.assertRaisesRegex(
            VoiceAcceptanceError,
            "target character 'menos-boy' has no unique crito appearance",
        ):
            build_decision(
                cross_dialogue_args(
                    "menos-boy", source_character_id="menos-boy"
                )
            )

    def test_proof_record_and_source_agreement_are_required_and_bound(self) -> None:
        for field in (
            "speakerPurityProofRecordId",
            "speakerPuritySourceAgreementSha256",
        ):
            with self.subTest(missing=field):
                voice = copy.deepcopy(self.crito_voice)
                del voice["reference"][field]
                with self.assertRaisesRegex(CastAcceptanceError, "invalid fields"):
                    validate_selected_voice(voice)

        voice = copy.deepcopy(self.crito_voice)
        voice["reference"]["speakerPurityProofRecordId"] = "not valid!"
        with self.assertRaisesRegex(CastAcceptanceError, "invalid proof record id"):
            validate_selected_voice(voice)

        voice = copy.deepcopy(self.socrates_voice)
        voice["reference"]["speakerPuritySourceAgreementSha256"] = "f" * 64
        with self.assertRaisesRegex(CastAcceptanceError, "source agreement differ"):
            validate_selected_voice(voice)

    def test_committed_decisions_are_byte_and_semantically_bound_to_cast(self) -> None:
        cast = json.loads((REPO_ROOT / "audio/cast.json").read_text(encoding="utf-8"))
        validate_cast_decision_artifacts(cast, REPO_ROOT)

        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            voice = copy.deepcopy(self.crito_voice)
            decision = copy.deepcopy(self.crito_decision)
            decision_path = root / voice["selection"]["decisionPath"]
            decision_path.parent.mkdir(parents=True)
            decision["characterId"] = "forged-character"
            unsigned = {
                key: value
                for key, value in decision.items()
                if key != "decisionContentSha256"
            }
            decision["decisionContentSha256"] = hashlib.sha256(
                canonical_json(unsigned)
            ).hexdigest()
            payload = pretty_json(decision)
            decision_path.write_bytes(payload)
            voice["selection"]["decisionSha256"] = hashlib.sha256(payload).hexdigest()
            forged_cast = {
                **cast,
                "voices": [voice],
            }
            with self.assertRaisesRegex(
                CastAcceptanceError, "stale or inconsistent"
            ):
                validate_cast_decision_artifacts(forged_cast, root)

    def test_each_machine_gate_fails_closed(self) -> None:
        reference = copy.deepcopy(self.crito_voice["reference"])
        audition = copy.deepcopy(self.crito_voice["audition"])
        mutations = {
            "reference-duration": lambda r, a: r.update(localDurationSeconds=2),
            "speaker-purity": lambda r, a: r.update(
                dominantSpeakerCoverage=0.9,
                competingSpeakerCoverage=0.1,
                uncoveredSpeakerCoverage=0,
            ),
            "asr-fidelity": lambda r, a: a.update(
                ordinaryWordErrors=1,
                ordinaryWordErrorRate=1 / a["expectedWords"],
            ),
            "acoustic-consistency": lambda r, a: a.update(
                meanSpeakerCosineSimilarity=0.7,
                minimumWindowSpeakerCosineSimilarity=0.6,
            ),
            "signal-safety": lambda r, a: a.update(clippedSamples=1),
            "audition-duration": lambda r, a: a.update(durationSeconds=2),
        }
        for expected_failure, mutate in mutations.items():
            with self.subTest(expected_failure):
                changed_reference = copy.deepcopy(reference)
                changed_audition = copy.deepcopy(audition)
                mutate(changed_reference, changed_audition)
                self.assertIn(
                    expected_failure,
                    evaluate_gate_failures(changed_reference, changed_audition),
                )

    def test_independent_artifact_claim_cannot_replace_transcript_semantics(self) -> None:
        path = REPO_ROOT / (
            "scratch/audio-references/auditions/socrates-safe-seed44/"
            "reference-asr-independent.json"
        )
        report = json.loads(path.read_text(encoding="utf-8"))
        report["transcript"] = "Aye, Crito, this is not the expected reference."
        frozen = {key: value for key, value in report.items() if key != "reportSha256"}
        report["reportSha256"] = hashlib.sha256(canonical_json(frozen)).hexdigest()
        with self.assertRaisesRegex(
            ReferenceAsrAdjudicationError, "not semantically zero-error"
        ):
            validate_independent_report(
                report,
                reference_sha256=self.socrates_voice["reference"]["localSha256"],
                expected_text=self.socrates_voice["reference"]["promptText"],
            )

    def test_adjudication_is_bound_to_the_jowett_source_agreement_digest(self) -> None:
        path = REPO_ROOT / (
            "scratch/audio-references/auditions/socrates-safe-seed44/"
            "reference-asr-adjudication.json"
        )
        adjudication = json.loads(path.read_text(encoding="utf-8"))
        with self.assertRaisesRegex(
            ReferenceAsrAdjudicationError, "stale or inconsistent"
        ):
            validate_adjudication(
                adjudication,
                adjudication_path=path,
                reference_sha256=self.socrates_voice["reference"]["localSha256"],
                expected_text=self.socrates_voice["reference"]["promptText"],
                primary_errors=1,
                source_agreement_sha256="0" * 64,
            )

    def test_resigned_adjudication_cannot_substitute_a_source_record_id(self) -> None:
        path = REPO_ROOT / (
            "scratch/audio-references/auditions/socrates-safe-seed44/"
            "reference-asr-adjudication.json"
        )
        adjudication = json.loads(path.read_text(encoding="utf-8"))
        adjudication["sourceAgreementRecordId"] = "forged-record-id"
        unsigned = {
            key: value
            for key, value in adjudication.items()
            if key != "adjudicationSha256"
        }
        adjudication["adjudicationSha256"] = hashlib.sha256(
            canonical_json(unsigned)
        ).hexdigest()
        with self.assertRaisesRegex(
            ReferenceAsrAdjudicationError, "stale or inconsistent"
        ):
            validate_adjudication(
                adjudication,
                adjudication_path=path,
                reference_sha256=self.socrates_voice["reference"]["localSha256"],
                expected_text=self.socrates_voice["reference"]["promptText"],
                primary_errors=1,
                source_agreement_sha256=self.socrates_voice["reference"][
                    "referenceAsr"
                ]["sourceAgreementSha256"],
            )

    def test_adjudication_constructor_reproduces_the_canonical_artifact(self) -> None:
        batch = Path("scratch/audio-references/auditions/socrates-safe-seed44")
        actual = json.loads(
            (REPO_ROOT / SOCRATES_POLICY_ADJUDICATION).read_text(encoding="utf-8")
        )
        rebuilt = build_adjudication(
            sidecar_path=Path(
                "scratch/audio-references/socrates/"
                "MNDfJMrH1XY-000065920-000072280-b577608ef05e.json"
            ),
            source_agreement_path=CRITO_REPORT,
            primary_asr_path=batch / "asr-qa.json",
            independent_path=batch / "reference-asr-independent.json",
        )
        self.assertEqual(rebuilt, actual)


if __name__ == "__main__":
    unittest.main()
