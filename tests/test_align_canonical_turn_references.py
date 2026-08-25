from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from align_canonical_turn_references import (  # noqa: E402
    IMPORTER_PATH,
    TurnAlignmentError,
    _load_importer,
    build_review_queue,
    canonical_json,
    sha256_bytes,
    tei_cache_path,
    write_queue,
)
from find_youtube_reference import caption_cache_path  # noqa: E402


VIDEO_ID = "MNDfJMrH1XY"
SPEECH_WORDS = [
    "patient",
    "friends",
    "consider",
    "justice",
    "before",
    "choosing",
    "flight",
    "because",
    "reason",
    "alone",
    "should",
    "govern",
    "every",
    "decision",
    "while",
    "fear",
    "cannot",
    "teach",
    "wisdom",
    "either",
    "today",
    "tomorrow",
    "calmly",
    "together",
]


def _character(character_id: str, display_name: str, raw_who: str) -> dict[str, object]:
    return {
        "characterId": character_id,
        "displayName": display_name,
        "identityStatus": "resolved",
        "aliases": [display_name],
        "appearances": [
            {
                "dialogue": "crito",
                "editorialStatus": "required",
                "performanceRole": "voice-owner",
                "roleFlags": ["source-speaker"],
                "sourceLabels": [display_name],
                "sourceAliases": [display_name],
                "sourceAttributions": [raw_who],
            }
        ],
    }


def _caption_payload(word_sequences: list[list[str]]) -> dict[str, object]:
    words = ["privateintrozero", "privateintroone"]
    for sequence in word_sequences:
        words.extend(sequence)
        words.append("separationtoken")
    words.extend(["privateoutrozero", "privateoutroone"])
    step_ms = 400
    return {
        "events": [
            {
                "tStartMs": 1_000,
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


class CanonicalTurnReferenceFixture:
    def __init__(
        self,
        root: Path,
        *,
        repeated_caption: bool = False,
        near_alternative_caption: bool = False,
        second_character: bool = False,
        mixed_attribution: bool = False,
    ) -> None:
        self.root = root
        self.audio = root / "audio"
        self.raw_root = root / "raw"
        self.artifact_root = root / "scratch"
        self.tei_cache = self.artifact_root / "tei-cache"
        self.caption_cache = self.artifact_root / "caption-cache"
        self.materialization_root = self.artifact_root / "references"
        for directory in (
            self.audio,
            self.raw_root,
            self.tei_cache,
            self.caption_cache,
        ):
            directory.mkdir(parents=True, exist_ok=True)

        said_rows = [
            (
                "#Socrates",
                "Socrates.",
                "selected voice words do not enter the unresolved queue at all",
            ),
            ("#Crito", "Crito.", " ".join(SPEECH_WORDS)),
        ]
        characters = [
            _character("crito", "Crito", "#Crito"),
            _character("socrates", "Socrates", "#Socrates"),
        ]
        if second_character:
            said_rows.append(("#Hermogenes", "Hermogenes.", " ".join(SPEECH_WORDS)))
            characters.append(_character("hermogenes", "Hermogenes", "#Hermogenes"))
        if mixed_attribution:
            said_rows.append(
                (
                    "#Crito #Hermogenes",
                    "Crito and Hermogenes.",
                    " ".join(SPEECH_WORDS),
                )
            )

        said_xml = "".join(
            f'<p><said who="{raw_who}"><label>{label}</label> {text}</said></p>'
            for raw_who, label, text in said_rows
        )
        self.tei_bytes = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f'<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body>'
            f'<div type="translation">{said_xml}</div>'
            "</body></text></TEI>"
        ).encode("utf-8")
        self.tei_sha = hashlib.sha256(self.tei_bytes).hexdigest()

        self.census = self.audio / "english-tei-speaker-census.json"
        self.characters = self.audio / "characters.json"
        self.sources = self.audio / "reference-sources.json"
        self.cast = self.audio / "cast.json"
        self.census.write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "artifact_kind": "english-tei-raw-speaker-census",
                    "editorial_status": "raw-source-attribution-only",
                    "source": {
                        "repository": "https://example.invalid/canonical",
                        "commit": "a" * 40,
                        "edition_id": "perseus-eng2",
                    },
                    "dialogues": [
                        {
                            "dialogue": "crito",
                            "source": {
                                "edition_id": "perseus-eng2",
                                "url": "https://example.invalid/crito.xml",
                                "tei_sha256": self.tei_sha,
                            },
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        self.characters.write_text(
            json.dumps(
                {
                    "schemaVersion": 3,
                    "status": "partial",
                    "characters": characters,
                }
            ),
            encoding="utf-8",
        )
        self.sources.write_text(
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
                                    "videoId": VIDEO_ID,
                                    "title": "Pinned Crito",
                                    "durationSeconds": 100,
                                    "url": f"https://www.youtube.com/watch?v={VIDEO_ID}",
                                }
                            ],
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        self.cast.write_text(
            json.dumps(
                {
                    "schemaVersion": 3,
                    "status": "partial",
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
            ),
            encoding="utf-8",
        )

        source = type(
            "FixtureSource",
            (),
            {"dialogue": "crito", "tei_sha256": self.tei_sha},
        )()
        tei_cache_path(self.tei_cache, source).write_bytes(self.tei_bytes)
        importer = _load_importer(IMPORTER_PATH)
        rendered = importer.apply_english_repairs(
            "crito", importer.convert_xml(self.tei_bytes)
        )
        (self.raw_root / "crito.txt").write_text(rendered, encoding="utf-8")
        sequences = [SPEECH_WORDS]
        if repeated_caption:
            sequences.append(SPEECH_WORDS)
        if near_alternative_caption:
            alternative = list(SPEECH_WORDS)
            alternative[3] = "justices"
            alternative[15] = "fears"
            sequences.append(alternative)
        caption_cache_path(self.caption_cache, VIDEO_ID).write_text(
            json.dumps(_caption_payload(sequences)), encoding="utf-8"
        )

    def build(self) -> dict[str, object]:
        return build_review_queue(
            census_path=self.census,
            characters_path=self.characters,
            sources_path=self.sources,
            cast_path=self.cast,
            raw_root=self.raw_root,
            tei_cache=self.tei_cache,
            caption_cache=self.caption_cache,
            artifact_root=self.artifact_root,
            materialization_root=self.materialization_root,
        )

    def replace_tei(self, payload: bytes) -> None:
        for path in self.tei_cache.glob("*.xml"):
            path.unlink()
        self.tei_bytes = payload
        self.tei_sha = hashlib.sha256(payload).hexdigest()
        census = json.loads(self.census.read_text(encoding="utf-8"))
        census["dialogues"][0]["source"]["tei_sha256"] = self.tei_sha
        self.census.write_text(json.dumps(census), encoding="utf-8")
        source = type(
            "FixtureSource",
            (),
            {"dialogue": "crito", "tei_sha256": self.tei_sha},
        )()
        tei_cache_path(self.tei_cache, source).write_bytes(payload)
        importer = _load_importer(IMPORTER_PATH)
        rendered = importer.apply_english_repairs(
            "crito", importer.convert_xml(payload)
        )
        (self.raw_root / "crito.txt").write_text(rendered, encoding="utf-8")


class CanonicalTurnReferenceAlignmentTest(unittest.TestCase):
    def test_deterministic_queue_binds_inputs_and_never_selects_or_writes(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(Path(raw_root))
            before = sorted(
                path.relative_to(fixture.root) for path in fixture.root.rglob("*")
            )
            first = fixture.build()
            second = fixture.build()
            after = sorted(
                path.relative_to(fixture.root) for path in fixture.root.rglob("*")
            )

        self.assertEqual(first, second)
        self.assertEqual(before, after)
        self.assertEqual(first["status"], "human-review-required-no-cast-selection")
        self.assertFalse(first["policy"]["automaticCastSelection"])
        self.assertFalse(first["policy"]["singleSpeakerGuaranteed"])
        self.assertEqual(first["summary"]["retainedCandidateCount"], 1)
        self.assertEqual(first["selectedCharactersExcluded"], ["socrates"])
        candidate = first["candidates"][0]
        self.assertEqual(candidate["characterId"], "crito")
        self.assertEqual(
            candidate["alignment"]["expectedPrompt"], " ".join(SPEECH_WORDS)
        )
        self.assertEqual(candidate["alignment"]["confidence"], 1.0)
        self.assertEqual(candidate["alignment"]["exactTokenRatio"], 1.0)
        self.assertGreaterEqual(candidate["alignment"]["uniqueAnchorCount"], 2)
        self.assertTrue(candidate["safety"]["humanAuditRequired"])
        self.assertFalse(candidate["safety"]["singleSpeakerGuaranteed"])
        self.assertFalse(candidate["safety"]["mixedTurnClaim"])
        self.assertFalse(candidate["safety"]["automaticCastSelection"])
        self.assertFalse(candidate["safety"]["audioMaterialized"])
        unsigned = {key: value for key, value in first.items() if key != "queueSha256"}
        self.assertEqual(first["queueSha256"], sha256_bytes(canonical_json(unsigned)))

    def test_queue_persists_no_caption_text_outside_the_bounded_prompt(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            queue = CanonicalTurnReferenceFixture(Path(raw_root)).build()

        encoded = json.dumps(queue, ensure_ascii=False)
        self.assertNotIn("privateintrozero", encoded)
        self.assertNotIn("privateintroone", encoded)
        self.assertNotIn("privateoutrozero", encoded)
        self.assertNotIn("privateoutroone", encoded)
        self.assertEqual(encoded.count(" ".join(SPEECH_WORDS)), 1)
        candidate = queue["candidates"][0]
        self.assertLessEqual(candidate["alignment"]["expectedPromptWordCount"], 32)
        self.assertLessEqual(len(candidate["alignment"]["expectedPrompt"]), 240)
        self.assertFalse(candidate["sourceTurn"]["textPersisted"])
        self.assertFalse(candidate["alignment"]["nearestAlternativeTextPersisted"])

    def test_repeated_caption_phrase_fails_the_uniqueness_gate(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            queue = CanonicalTurnReferenceFixture(
                Path(raw_root), repeated_caption=True
            ).build()

        self.assertEqual(queue["summary"]["retainedCandidateCount"], 0)
        crito = next(
            row for row in queue["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["rejectionCounts"]["insufficient-unique-anchors"], 1)

    def test_near_alternative_fails_the_confidence_margin_gate(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            queue = CanonicalTurnReferenceFixture(
                Path(raw_root), near_alternative_caption=True
            ).build()

        self.assertEqual(queue["summary"]["retainedCandidateCount"], 0)
        crito = next(
            row for row in queue["characters"] if row["characterId"] == "crito"
        )
        self.assertEqual(crito["rejectionCounts"]["confidence-margin-below-gate"], 1)

    def test_same_interval_for_two_characters_is_rejected_for_both(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            queue = CanonicalTurnReferenceFixture(
                Path(raw_root), second_character=True
            ).build()

        self.assertEqual(queue["summary"]["discoveredCandidateCount"], 2)
        self.assertEqual(queue["summary"]["crossCharacterConflictCandidateCount"], 2)
        self.assertEqual(queue["summary"]["retainedCandidateCount"], 0)
        for character_id in ("crito", "hermogenes"):
            row = next(
                item
                for item in queue["characters"]
                if item["characterId"] == character_id
            )
            self.assertEqual(
                row["rejectionCounts"]["cross-character-caption-overlap"], 1
            )

    def test_multiple_source_attribution_is_never_treated_as_one_turn(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            queue = CanonicalTurnReferenceFixture(
                Path(raw_root), second_character=True, mixed_attribution=True
            ).build()

        dialogue = queue["dialogues"][0]
        self.assertEqual(
            dialogue["sourceTurnRejectionCounts"]["multiple-source-attributions"],
            1,
        )

    def test_mixed_outer_said_is_excluded_while_exact_leaf_turn_remains_eligible(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(
                Path(raw_root), second_character=True
            )
            speech = " ".join(SPEECH_WORDS)
            fixture.replace_tei(
                (
                    '<?xml version="1.0" encoding="UTF-8"?>'
                    '<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body>'
                    '<div type="translation"><p><said who="#Crito">'
                    "<label>Crito.</label> Narrated lead "
                    f'<said who="#Hermogenes">{speech}</said>'
                    " narrated close</said></p></div></body></text></TEI>"
                ).encode("utf-8")
            )
            queue = fixture.build()

        dialogue = queue["dialogues"][0]
        self.assertEqual(
            dialogue["sourceTurnRejectionCounts"]["contains-nested-attributed-turn"],
            1,
        )
        self.assertEqual(queue["summary"]["retainedCandidateCount"], 1)
        self.assertEqual(queue["candidates"][0]["characterId"], "hermogenes")

    def test_changed_tei_or_canonical_rendering_is_fatal(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(Path(raw_root))
            tei_path = next(fixture.tei_cache.glob("*.xml"))
            tei_path.write_bytes(fixture.tei_bytes + b"changed")
            with self.assertRaisesRegex(TurnAlignmentError, "TEI hash mismatch"):
                fixture.build()

        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(Path(raw_root))
            (fixture.raw_root / "crito.txt").write_text(
                "changed canonical rendering\n", encoding="utf-8"
            )
            with self.assertRaisesRegex(
                TurnAlignmentError, "does not reproduce canonical English bytes"
            ):
                fixture.build()

    def test_missing_tei_is_an_explicit_coverage_gap_not_a_candidate(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(Path(raw_root))
            next(fixture.tei_cache.glob("*.xml")).unlink()
            queue = fixture.build()

        self.assertEqual(queue["summary"]["missingInputCount"], 1)
        self.assertEqual(queue["summary"]["retainedCandidateCount"], 0)
        self.assertEqual(queue["missingInputs"][0]["kind"], "canonical-english-tei")

    def test_queue_write_requires_confined_regular_output(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = CanonicalTurnReferenceFixture(Path(raw_root))
            queue = fixture.build()
            output = fixture.artifact_root / "queue" / "review.json"
            write_queue(output, queue, artifact_root=fixture.artifact_root)
            persisted = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(persisted, queue)
            outside = fixture.root / "outside.json"
            with self.assertRaisesRegex(TurnAlignmentError, "must stay under"):
                write_queue(outside, queue, artifact_root=fixture.artifact_root)
            self.assertFalse(outside.exists())


if __name__ == "__main__":
    unittest.main()
