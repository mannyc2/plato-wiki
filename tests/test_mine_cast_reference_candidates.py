from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from find_youtube_reference import caption_cache_path, parse_json3_caption  # noqa: E402
from mine_cast_reference_candidates import (  # noqa: E402
    CandidateMiningError,
    CharacterAppearance,
    CharacterRecord,
    load_characters,
    mine_candidates,
    scan_narrator_cues,
    write_report,
)


PHAEDO_VIDEO_ID = "2sZzVVwSOEU"


def character(
    character_id: str, display_name: str, appearances: list[str]
) -> dict[str, object]:
    return {
        "characterId": character_id,
        "displayName": display_name,
        "identityStatus": "resolved",
        "aliases": [display_name],
        "appearances": [
            {
                "dialogue": dialogue,
                "editorialStatus": "required",
                "performanceRole": "voice-owner",
                "roleFlags": ["source-speaker"],
                "sourceLabels": [display_name],
                "sourceAliases": [display_name],
                "sourceAttributions": [],
            }
            for dialogue in appearances
        ],
    }


def characters_payload() -> dict[str, object]:
    return {
        "schemaVersion": 3,
        "status": "partial",
        "characters": [
            character("crito", "Crito", ["crito", "phaedo"]),
            character("hermogenes", "Hermogenes", ["cratylus"]),
            character("socrates", "Socrates", ["crito", "cratylus", "phaedo"]),
        ],
    }


def sources_payload() -> dict[str, object]:
    return {
        "schemaVersion": 2,
        "status": "source-pool",
        "selectionPolicy": {
            "automaticSelection": True,
            "acceptancePolicy": "operator-authorized-deterministic-v1",
        },
        "dialogues": [
            {
                "dialogue": "cratylus",
                "videos": [
                    {
                        "videoId": "k2bqhEW3Y-c",
                        "title": "Cratylus",
                        "durationSeconds": 8000,
                        "url": "https://www.youtube.com/watch?v=k2bqhEW3Y-c",
                    }
                ],
            },
            {
                "dialogue": "crito",
                "videos": [
                    {
                        "videoId": "MNDfJMrH1XY",
                        "title": "Crito",
                        "durationSeconds": 2014,
                        "url": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                    }
                ],
            },
            {
                "dialogue": "phaedo",
                "videos": [
                    {
                        "videoId": PHAEDO_VIDEO_ID,
                        "title": "Phaedo",
                        "durationSeconds": 10560,
                        "url": f"https://www.youtube.com/watch?v={PHAEDO_VIDEO_ID}",
                    }
                ],
            },
        ],
    }


def cast_payload() -> dict[str, object]:
    return {
        "schemaVersion": 3,
        "status": "partial",
        "updatedAt": "2026-07-15",
        "enginePolicy": {
            "defaultEngine": "dots.tts-soar",
            "exceptionsRequireRecordedQaFailure": True,
            "implicitFallbackVoice": False,
            "voiceOwnership": "one-voice-per-character",
            "reportedSpeech": "inherit-active-character",
            "acceptancePolicy": "operator-authorized-deterministic-v1",
            "manualListeningRequired": False,
            "acceptanceGates": {
                "referenceDuration": {"minimumSeconds": 3, "maximumSeconds": 15, "maximumIntervalDeltaSeconds": 0.05},
                "speakerPurity": {"minimumDominantCoverage": 0.95, "maximumCompetingCoverage": 0.02, "maximumUncoveredCoverage": 0.03},
                "asrFidelity": {"minimumReferenceExpectedWords": 8, "maximumReferenceOrdinaryWordErrors": 0, "maximumReferenceOrdinaryWordErrorRate": 0, "referenceFailureAdjudication": "exact-source-agreement-plus-pinned-independent-large-v3-zero-v1", "minimumExpectedWords": 40, "maximumOrdinaryWordErrors": 0, "maximumOrdinaryWordErrorRate": 0},
                "acousticConsistency": {"minimumMeanCosineSimilarity": 0.85, "minimumWindowCosineSimilarity": 0.8},
                "signalSafety": {"maximumClippedSamples": 0, "maximumTruePeakDbtp": 0, "maximumPeakAmplitude": 0.9999},
                "auditionDuration": {"minimumSeconds": 8, "maximumSeconds": 60, "minimumWordsPerSecond": 1.5, "maximumWordsPerSecond": 4.5},
            },
        },
        "voices": [{"characterId": "socrates", "status": "selected"}],
    }


SPEECH_WORDS = [
    "the",
    "attendant",
    "who",
    "is",
    "to",
    "give",
    "you",
    "the",
    "poison",
    "has",
    "been",
    "telling",
    "me",
    "this",
]


def caption_words(
    *, repeat_speech: bool = False, long_speech: bool = False
) -> list[str]:
    spoken = [f"word{index}" for index in range(60)] if long_speech else SPEECH_WORDS
    words = ["only", "this", "Socrates", "replied", "Crito", *spoken]
    if repeat_speech:
        words.extend(["then", "said", "Socrates", *spoken])
    words.extend(["then", "said", "Socrates", "let", "him", "mind", "his", "business"])
    return words


def write_caption(path: Path, words: list[str], *, step_ms: int = 400) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "events": [
            {
                "tStartMs": 10_000,
                "dDurationMs": len(words) * step_ms + step_ms,
                "segs": [
                    {
                        "utf8": word if index == 0 else f" {word}",
                        **({} if index == 0 else {"tOffsetMs": index * step_ms}),
                    }
                    for index, word in enumerate(words)
                ],
            }
        ]
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


class BatchCandidateMinerTest(unittest.TestCase):
    def _workspace(
        self,
        raw_root: str,
        *,
        words: list[str] | None = None,
        phrase_queue: dict[str, object] | None = None,
    ) -> dict[str, Path]:
        root = Path(raw_root)
        paths = {
            "characters": root / "characters.json",
            "sources": root / "reference-sources.json",
            "cast": root / "cast.json",
            "cache": root / "caption-cache",
            "output_root": root / "references",
            "queue": root / "phrase-queue.json",
        }
        paths["characters"].write_text(
            json.dumps(characters_payload()), encoding="utf-8"
        )
        paths["sources"].write_text(json.dumps(sources_payload()), encoding="utf-8")
        paths["cast"].write_text(json.dumps(cast_payload()), encoding="utf-8")
        write_caption(
            caption_cache_path(paths["cache"], PHAEDO_VIDEO_ID),
            words or caption_words(),
        )
        if phrase_queue is not None:
            paths["queue"].write_text(json.dumps(phrase_queue), encoding="utf-8")
        return paths

    def _mine(self, paths: dict[str, Path], **overrides: object) -> dict[str, object]:
        arguments: dict[str, object] = {
            "characters_path": paths["characters"],
            "sources_path": paths["sources"],
            "cast_path": paths["cast"],
            "caption_cache": paths["cache"],
            "output_root": paths["output_root"],
        }
        arguments.update(overrides)
        return mine_candidates(**arguments)  # type: ignore[arg-type]

    def test_character_loader_enforces_the_v3_role_evidence_contract(self) -> None:
        cases = (
            (
                "unknown performance role",
                {
                    "performanceRole": "actor",
                },
                "invalid performanceRole",
            ),
            (
                "blank source-only note",
                {
                    "roleFlags": ["source-speaker"],
                    "sourceLabels": ["Role"],
                    "sourceAliases": ["Role"],
                    "sourceAttributions": ["#Role"],
                    "editorialNote": "",
                },
                "invalid role evidence",
            ),
            (
                "dream without reported-speaker",
                {
                    "roleFlags": ["dream-figure"],
                    "sourceLabels": [],
                    "sourceAliases": [],
                    "sourceAttributions": [],
                    "editorialNote": "Embedded dream quotation.",
                },
                "invalid roleFlags",
            ),
            (
                "mixed commentary and source role",
                {
                    "roleFlags": ["source-speaker", "commentary-narrator"],
                    "sourceLabels": ["Role"],
                    "sourceAliases": ["Role"],
                    "sourceAttributions": ["#Role"],
                    "editorialNote": "Invalid mixed role.",
                },
                "invalid roleFlags",
            ),
        )
        for name, appearance_overrides, expected in cases:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as root:
                row = character("role", "Role", ["phaedo"])
                row["appearances"][0].update(appearance_overrides)  # type: ignore[index,union-attr]
                path = Path(root) / "characters.json"
                path.write_text(
                    json.dumps(
                        {
                            "schemaVersion": 3,
                            "status": "partial",
                            "characters": [row],
                        }
                    ),
                    encoding="utf-8",
                )
                with self.assertRaisesRegex(CandidateMiningError, expected):
                    load_characters(path)

    def test_cue_only_span_is_non_materializable_hypothesis_with_no_candidate_credit(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            caption_sha = hashlib.sha256(
                caption_cache_path(paths["cache"], PHAEDO_VIDEO_ID).read_bytes()
            ).hexdigest()
            first = self._mine(paths)
            second = self._mine(paths)
            alternate_root = self._mine(
                paths, output_root=Path(raw_root) / "different-reference-root"
            )

        self.assertEqual(first, second)
        self.assertEqual(first["schemaVersion"], 3)
        self.assertFalse(first["automaticSpeakerIdentity"])
        self.assertEqual(first["summary"]["canonicalCharacterCount"], 3)
        self.assertEqual(first["summary"]["selectedCharacterCount"], 1)
        self.assertEqual(first["summary"]["unresolvedCharacterCount"], 2)
        self.assertEqual(first["summary"]["unresolvedAppearanceCount"], 3)
        self.assertEqual(first["summary"]["discoveredCandidateCount"], 0)
        self.assertEqual(first["summary"]["retainedCandidateCount"], 0)
        self.assertEqual(first["summary"]["charactersWithCandidates"], 0)
        self.assertEqual(first["summary"]["charactersWithCueHypotheses"], 1)
        self.assertEqual(first["selectedCharactersExcluded"], ["socrates"])

        crito = next(
            row for row in first["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["candidates"], [])
        hypothesis = crito["cueHypotheses"][0]
        alternate_crito = next(
            row for row in alternate_root["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(
            hypothesis["hypothesisId"],
            alternate_crito["cueHypotheses"][0]["hypothesisId"],
        )
        self.assertEqual(hypothesis["method"], "lexical-narrator-cue-hypothesis")
        self.assertEqual(hypothesis["captionTranscript"], " ".join(SPEECH_WORDS))
        self.assertEqual(
            hypothesis["evidence"]["targetCue"]["transcript"], "replied Crito"
        )
        self.assertEqual(
            hypothesis["evidence"]["nextCue"]["transcript"], "then said Socrates"
        )
        self.assertEqual(hypothesis["boundaryType"], "between-lexically-matched-cues")
        self.assertFalse(hypothesis["automaticSpeakerIdentity"])
        self.assertFalse(hypothesis["materializable"])
        self.assertFalse(hypothesis["candidateCompletionCredit"])
        self.assertEqual(hypothesis["caption"]["sha256"], caption_sha)
        for forbidden in (
            "confidence",
            "ranking",
            "promptText",
            "promptStatus",
            "materializationPlan",
            "materializationPlanStatus",
            "materializerCommand",
        ):
            self.assertNotIn(forbidden, hypothesis)

        hermogenes = next(
            row for row in first["characters"] if row["characterId"] == "hermogenes"
        )
        self.assertEqual(hermogenes["status"], "unresolved-no-explicit-candidate")
        self.assertEqual(
            hermogenes["appearances"][0]["sources"][0]["captionStatus"],
            "not-cached",
        )

    def test_only_voice_owner_appearances_are_mined_for_a_mixed_identity(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            payload = characters_payload()
            crito = next(
                row
                for row in payload["characters"]  # type: ignore[union-attr]
                if row["characterId"] == "crito"
            )
            reported = crito["appearances"][0]
            reported.update(
                {
                    "performanceRole": "reported-only",
                    "roleFlags": ["reported-speaker"],
                    "sourceLabels": [],
                    "sourceAliases": [],
                    "sourceAttributions": [],
                    "editorialNote": "Crito is reported here by the active character.",
                }
            )
            paths["characters"].write_text(json.dumps(payload), encoding="utf-8")
            report = self._mine(paths)

            queue = {
                "schemaVersion": 1,
                "phrases": [
                    {
                        "characterId": "crito",
                        "dialogue": "crito",
                        "phrase": "a sufficiently long candidate phrase",
                        "cuePlacement": "preposed",
                        "speakerSpanDirection": "after-cue",
                    }
                ],
            }
            paths["queue"].write_text(json.dumps(queue), encoding="utf-8")
            with self.assertRaisesRegex(CandidateMiningError, "not an appearance"):
                self._mine(paths, phrase_queue_path=paths["queue"])

        crito_row = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(
            [appearance["dialogue"] for appearance in crito_row["appearances"]],
            ["phaedo"],
        )
        self.assertEqual(crito_row["appearances"][0]["performanceRole"], "voice-owner")

    def test_cast_v2_requires_explicit_voice_ownership_policy(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            cast = cast_payload()
            cast["enginePolicy"]["reportedSpeech"] = "switch-to-reported-character"  # type: ignore[index]
            paths["cast"].write_text(json.dumps(cast), encoding="utf-8")
            with self.assertRaisesRegex(CandidateMiningError, "unsupported cast"):
                self._mine(paths)

    def test_performance_role_not_legacy_role_flags_controls_mining_targets(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            payload = characters_payload()
            payload["characters"].extend(  # type: ignore[union-attr]
                [
                    {
                        "characterId": "commentary-narrator",
                        "displayName": "Commentary Narrator",
                        "identityStatus": "resolved",
                        "aliases": [
                            "Announcer",
                            "Commentary Narrator",
                            "Commentator",
                        ],
                        "appearances": [
                            {
                                "dialogue": "phaedo",
                                "editorialStatus": "required",
                                "performanceRole": "voice-owner",
                                "roleFlags": ["commentary-narrator"],
                                "sourceLabels": [],
                                "sourceAliases": [],
                                "sourceAttributions": [],
                                "editorialNote": "Recurring edition role.",
                            }
                        ],
                    },
                    {
                        "characterId": "reported-figure",
                        "displayName": "Reported Figure",
                        "identityStatus": "resolved",
                        "aliases": ["Reported Figure"],
                        "appearances": [
                            {
                                "dialogue": "phaedo",
                                "editorialStatus": "required",
                                "performanceRole": "reported-only",
                                "roleFlags": ["reported-speaker"],
                                "sourceLabels": [],
                                "sourceAliases": [],
                                "sourceAttributions": [],
                                "editorialNote": "Quoted by an active character.",
                            }
                        ],
                    },
                ]
            )
            paths["characters"].write_text(json.dumps(payload), encoding="utf-8")
            report = self._mine(paths)

        self.assertEqual(report["summary"]["canonicalCharacterCount"], 5)
        self.assertEqual(report["summary"]["voiceOwnerCharacterCount"], 4)
        self.assertEqual(report["summary"]["nonVoiceOwnerCharacterCount"], 1)
        self.assertEqual(report["summary"]["corpusUnresolvedCharacterCount"], 4)
        self.assertEqual(report["summary"]["corpusUnresolvedVoiceOwnerCount"], 3)
        rows = {row["characterId"]: row for row in report["characters"]}
        self.assertIn("commentary-narrator", rows)
        self.assertNotIn("reported-figure", rows)
        self.assertEqual(
            rows["commentary-narrator"]["appearances"][0]["performanceRole"],
            "voice-owner",
        )

    def test_explicit_phrase_queue_wins_deduplication_and_preserves_alignment(
        self,
    ) -> None:
        phrase = " ".join(SPEECH_WORDS)
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "videoId": PHAEDO_VIDEO_ID,
                    "phrase": phrase,
                    "cuePlacement": "medial",
                    "speakerSpanDirection": "after-cue",
                }
            ],
        }
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, phrase_queue=queue)
            queue_sha = hashlib.sha256(paths["queue"].read_bytes()).hexdigest()
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["retainedCandidateCount"], 1)
        candidate = crito["candidates"][0]
        self.assertEqual(candidate["method"], "explicit-phrase-boundary-asserted")
        self.assertEqual(candidate["evidence"]["alignmentConfidence"], 1.0)
        self.assertEqual(candidate["evidence"]["exactTokenRatio"], 1.0)
        self.assertEqual(
            candidate["evidence"]["boundaryAssertion"],
            {"cuePlacement": "medial", "speakerSpanDirection": "after-cue"},
        )
        self.assertEqual(
            candidate["speakerIsolationStatus"], "human-asserted-not-verified"
        )
        self.assertNotIn("confidence", candidate)
        self.assertEqual(
            report["inputs"]["phraseQueue"]["sha256"],
            queue_sha,
        )

    def test_preposed_boundary_assertion_creates_only_an_unselected_candidate(
        self,
    ) -> None:
        phrase = " ".join(SPEECH_WORDS)
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "videoId": PHAEDO_VIDEO_ID,
                    "phrase": phrase,
                    "cuePlacement": "preposed",
                    "speakerSpanDirection": "after-cue",
                }
            ],
        }
        words = [
            "Crito",
            "said",
            *SPEECH_WORDS,
            "then",
            "Socrates",
            "said",
            "enough",
        ]
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=words, phrase_queue=queue)
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        candidate = crito["candidates"][0]
        self.assertEqual(candidate["status"], "candidate-not-selected")
        self.assertEqual(candidate["boundaryType"], "explicit-preposed-after-cue")
        self.assertIn("materializationPlan", candidate)
        self.assertIn("--materialize", candidate["materializerCommand"])

    def test_postposed_boundary_assertion_uses_phrase_before_target_cue(self) -> None:
        phrase = " ".join(SPEECH_WORDS)
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "videoId": PHAEDO_VIDEO_ID,
                    "phrase": phrase,
                    "cuePlacement": "postposed",
                    "speakerSpanDirection": "before-cue",
                }
            ],
        }
        words = [
            *SPEECH_WORDS,
            "replied",
            "Crito",
            "then",
            "Socrates",
            "said",
            "enough",
        ]
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=words, phrase_queue=queue)
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        candidate = crito["candidates"][0]
        self.assertEqual(candidate["boundaryType"], "explicit-postposed-before-cue")
        self.assertEqual(
            candidate["evidence"]["targetCue"]["transcript"], "replied Crito"
        )

    def test_multi_speaker_phrase_with_pronoun_cue_is_rejected(self) -> None:
        speech = [
            "first",
            "speaker",
            "words",
            "continue",
            "he",
            "said",
            "second",
            "speaker",
            "words",
            "continue",
            "through",
            "the",
            "ending",
        ]
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "videoId": PHAEDO_VIDEO_ID,
                    "phrase": " ".join(speech),
                    "cuePlacement": "preposed",
                    "speakerSpanDirection": "after-cue",
                }
            ],
        }
        words = ["Crito", "said", *speech, "then", "Socrates", "said"]
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=words, phrase_queue=queue)
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["candidates"], [])
        source = next(
            appearance
            for appearance in crito["appearances"]
            if appearance["dialogue"] == "phaedo"
        )["sources"][0]
        self.assertRegex(source["phraseFailures"][0]["reason"], "pronoun narrator cue")

    def test_charmides_style_adjacent_quoted_turns_are_rejected(self) -> None:
        speech = [
            '"First',
            "speaker",
            "continues",
            "through",
            'this."',
            '"Second',
            "speaker",
            "has",
            "different",
            "words",
            "through",
            "the",
            'ending."',
        ]
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "videoId": PHAEDO_VIDEO_ID,
                    "phrase": " ".join(speech),
                    "cuePlacement": "preposed",
                    "speakerSpanDirection": "after-cue",
                }
            ],
        }
        words = ["Crito", "said", *speech, "then", "Socrates", "said"]
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=words, phrase_queue=queue)
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["candidates"], [])
        source = next(
            appearance
            for appearance in crito["appearances"]
            if appearance["dialogue"] == "phaedo"
        )["sources"][0]
        self.assertRegex(source["phraseFailures"][0]["reason"], "multiple quoted")

    def test_postposed_next_speaker_words_remain_hypothesis_not_candidate(self) -> None:
        words = [
            "said",
            "Crito",
            *SPEECH_WORDS,
            "Nay",
            "replied",
            "Socrates",
            "reply",
        ]
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=words)
            report = self._mine(paths)

        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["candidates"], [])
        hypothesis = crito["cueHypotheses"][0]
        self.assertTrue(hypothesis["captionTranscript"].endswith("Nay"))
        self.assertFalse(hypothesis["materializable"])
        self.assertNotIn("materializerCommand", hypothesis)

    def test_phrase_alignment_failure_is_reported_without_aborting_coverage(
        self,
    ) -> None:
        queue = {
            "schemaVersion": 1,
            "phrases": [
                {
                    "characterId": "crito",
                    "dialogue": "phaedo",
                    "phrase": "justice requires escaping from this prison immediately",
                    "cuePlacement": "medial",
                    "speakerSpanDirection": "after-cue",
                }
            ],
        }
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, phrase_queue=queue)
            report = self._mine(paths, phrase_queue_path=paths["queue"])

        phaedo_source = next(
            appearance
            for appearance in report["characters"][0]["appearances"]
            if appearance["dialogue"] == "phaedo"
        )["sources"][0]
        self.assertEqual(phaedo_source["rejectionCounts"]["phrase-rejected"], 1)
        self.assertRegex(
            phaedo_source["phraseFailures"][0]["reason"], "weak caption match"
        )

    def test_rejects_subject_pronoun_vocative_as_a_speaker_cue(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "caption.json3"
            write_caption(
                path,
                [
                    "he",
                    "said",
                    "Crito",
                    "I",
                    "owe",
                    "a",
                    "cock",
                    "then",
                    "said",
                    "Socrates",
                ],
            )
            document = parse_json3_caption(path)
        characters = (
            CharacterRecord(
                "crito",
                "Crito",
                ("Crito",),
                (
                    CharacterAppearance(
                        "phaedo", ("Crito",), ("source-speaker",), "voice-owner"
                    ),
                ),
            ),
            CharacterRecord(
                "socrates",
                "Socrates",
                ("Socrates",),
                (
                    CharacterAppearance(
                        "phaedo", ("Socrates",), ("source-speaker",), "voice-owner"
                    ),
                ),
            ),
        )
        scan = scan_narrator_cues(document, characters=characters, dialogue="phaedo")
        self.assertNotIn("crito", {cue.character_id for cue in scan.cues})
        self.assertIn("socrates", {cue.character_id for cue in scan.cues})

    def test_named_subject_asked_vocative_never_gets_automatic_candidate_credit(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(
                raw_root,
                words=[
                    "Socrates",
                    "asked",
                    "Crito",
                    *SPEECH_WORDS,
                    "then",
                    "said",
                    "Socrates",
                ],
            )
            report = self._mine(paths)
        crito = next(
            row for row in report["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["candidates"], [])
        self.assertEqual(crito["cueHypothesisCount"], 1)
        self.assertFalse(crito["cueHypotheses"][0]["materializable"])
        self.assertEqual(report["summary"]["discoveredCandidateCount"], 0)

    def test_rejects_overlong_and_unbounded_cue_spans(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root, words=caption_words(long_speech=True))
            overlong = self._mine(paths)
        crito = next(
            row for row in overlong["characters"] if row["characterId"] == "crito"
        )
        source = next(
            appearance
            for appearance in crito["appearances"]
            if appearance["dialogue"] == "phaedo"
        )["sources"][0]
        self.assertEqual(source["discoveredCandidateCount"], 0)
        self.assertEqual(source["rejectionCounts"]["over-20s-cue-bounded-span"], 1)

        with tempfile.TemporaryDirectory() as raw_root:
            words = ["Socrates", "replied", "Crito", *SPEECH_WORDS]
            paths = self._workspace(raw_root, words=words)
            unbounded = self._mine(paths)
        crito = next(
            row for row in unbounded["characters"] if row["characterId"] == "crito"
        )
        source = next(
            appearance
            for appearance in crito["appearances"]
            if appearance["dialogue"] == "phaedo"
        )["sources"][0]
        self.assertEqual(source["discoveredCandidateCount"], 0)
        self.assertEqual(source["rejectionCounts"]["no-next-captioned-cue"], 1)

    def test_ambiguous_aliases_are_not_used_as_cues(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "caption.json3"
            write_caption(path, ["said", "Stranger", *SPEECH_WORDS])
            document = parse_json3_caption(path)
        characters = (
            CharacterRecord(
                "first-stranger",
                "First Stranger",
                ("Stranger",),
                (
                    CharacterAppearance(
                        "phaedo", ("Stranger",), ("source-speaker",), "voice-owner"
                    ),
                ),
            ),
            CharacterRecord(
                "second-stranger",
                "Second Stranger",
                ("Stranger",),
                (
                    CharacterAppearance(
                        "phaedo", ("Stranger",), ("source-speaker",), "voice-owner"
                    ),
                ),
            ),
        )
        scan = scan_narrator_cues(document, characters=characters, dialogue="phaedo")
        self.assertEqual(scan.cues, ())
        self.assertEqual(
            scan.ambiguous_aliases_by_character["first-stranger"], ("stranger",)
        )
        self.assertEqual(
            scan.ambiguous_aliases_by_character["second-stranger"], ("stranger",)
        )

    def test_invalid_phrase_queue_and_unknown_filter_fail_loudly(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(
                raw_root,
                phrase_queue={
                    "schemaVersion": 1,
                    "phrases": [
                        {
                            "characterId": "crito",
                            "dialogue": "phaedo",
                            "videoId": "aaaaaaaaaaa",
                            "phrase": "a sufficiently long candidate phrase",
                            "cuePlacement": "preposed",
                            "speakerSpanDirection": "after-cue",
                        }
                    ],
                },
            )
            with self.assertRaisesRegex(CandidateMiningError, "unpinned video"):
                self._mine(paths, phrase_queue_path=paths["queue"])
            with self.assertRaisesRegex(
                CandidateMiningError, "unknown --only-character"
            ):
                self._mine(paths, only_character_ids={"nobody"})

    def test_phrase_queue_requires_consistent_boundary_assertion(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(
                raw_root,
                phrase_queue={
                    "schemaVersion": 1,
                    "phrases": [
                        {
                            "characterId": "crito",
                            "dialogue": "phaedo",
                            "phrase": "a sufficiently long candidate phrase",
                        }
                    ],
                },
            )
            with self.assertRaisesRegex(CandidateMiningError, "malformed"):
                self._mine(paths, phrase_queue_path=paths["queue"])

        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(
                raw_root,
                phrase_queue={
                    "schemaVersion": 1,
                    "phrases": [
                        {
                            "characterId": "crito",
                            "dialogue": "phaedo",
                            "phrase": "a sufficiently long candidate phrase",
                            "cuePlacement": "preposed",
                            "speakerSpanDirection": "before-cue",
                        }
                    ],
                },
            )
            with self.assertRaisesRegex(
                CandidateMiningError, "inconsistent boundary assertion"
            ):
                self._mine(paths, phrase_queue_path=paths["queue"])

    def test_report_write_is_byte_stable_and_atomic(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            report = self._mine(paths)
            output = Path(raw_root) / "reports" / "coverage.json"
            write_report(output, report)
            first = output.read_bytes()
            write_report(output, report)
            second = output.read_bytes()
            self.assertEqual(first, second)
            self.assertEqual(json.loads(first), report)
            self.assertEqual(list(output.parent.glob(".*.tmp")), [])

    def test_population_mode_requests_only_every_pinned_caption(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            paths = self._workspace(raw_root)
            with patch(
                "mine_cast_reference_candidates.ensure_caption"
            ) as ensure_caption:
                report = self._mine(paths, populate_caption_cache=True)

        self.assertEqual(ensure_caption.call_count, 3)
        self.assertEqual(
            {call.args[0].video_id for call in ensure_caption.call_args_list},
            {PHAEDO_VIDEO_ID, "MNDfJMrH1XY", "k2bqhEW3Y-c"},
        )
        self.assertTrue(
            all(
                call.kwargs == {"allow_download": True}
                for call in ensure_caption.call_args_list
            )
        )
        self.assertEqual(
            report["policy"]["captionMode"], "populate-pinned-captions-then-scan"
        )
        self.assertTrue(report["inputs"]["captionPopulationRequested"])
        self.assertEqual(report["summary"]["pinnedVideoCount"], 3)


if __name__ == "__main__":
    unittest.main()
