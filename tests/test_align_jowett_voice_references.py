from __future__ import annotations

import hashlib
import json
import re
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

import align_jowett_voice_references as alignment_module  # noqa: E402
from align_jowett_voice_references import (  # noqa: E402
    JowettAlignmentError,
    JowettTurn,
    LabelMapper,
    ParsedTranscript,
    VoiceOwner,
    _retain_source_order_candidate,
    build_alignment_report,
    canonical_json,
    extract_jowett_text,
    load_voice_owners,
    load_registry,
    parse_jowett_transcript,
    populate_transcript_cache,
    sha256_bytes,
    transcript_cache_path,
    write_report,
)
from find_youtube_reference import caption_cache_path  # noqa: E402


VIDEO_ID = "MNDfJMrH1XY"
SOCRATES_PROMPT = (
    "Patient friends consider justice before choosing flight because reason "
    "alone governs"
)
CRITO_PROMPT = (
    "Persons who, at no great cost, are willing to save you and bring you "
    "out of prison."
)


def _caption_payload(words: list[str], *, step_ms: int = 400) -> dict[str, object]:
    return {
        "events": [
            {
                "tStartMs": 1_000,
                "dDurationMs": len(words) * step_ms,
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


class JowettFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.audio = root / "audio"
        self.scratch = root / "scratch"
        self.transcript_cache = self.scratch / "jowett-cache"
        self.caption_cache = self.scratch / "caption-cache"
        for directory in (
            self.audio,
            self.transcript_cache,
            self.caption_cache,
        ):
            directory.mkdir(parents=True, exist_ok=True)

        self.socrates_words = SOCRATES_PROMPT.casefold().split()
        self.crito_words = [
            "there",
            "are",
            *CRITO_PROMPT.casefold().replace(",", "").replace(".", "").split(),
        ]
        transcript_text = f"""Provided by The Internet Classics Archive.

Crito
By Plato

Translated by Benjamin Jowett

----------------------------------------------------------------------

Socrates. {SOCRATES_PROMPT}.

Cr. There are {CRITO_PROMPT}

Soc. He said \"this reported voice is deliberately excluded from reference mining.\"

THE END

----------------------------------------------------------------------
"""
        self.transcript_bytes = transcript_text.encode("utf-8")
        self.transcript_sha = hashlib.sha256(self.transcript_bytes).hexdigest()
        self.registry = self.audio / "jowett-transcript-sources.json"
        self.characters = self.audio / "characters.json"
        self.references = self.audio / "reference-sources.json"

        caption_words = [
            "contamination",
            *self.socrates_words,
            "tail",
            "separator",
            "are",
            *CRITO_PROMPT.casefold().replace(",", "").replace(".", "").split(),
            "after",
        ]
        socrates_start = 1.0
        socrates_end = 1.0 + (len(self.socrates_words) + 2) * 0.4 - 0.1
        preceding_are_index = 1 + len(self.socrates_words) + 2
        crito_start = 1.0 + (preceding_are_index + 1) * 0.4 - 0.01
        crito_end = 1.0 + (
            preceding_are_index
            + 1
            + len(CRITO_PROMPT.casefold().replace(",", "").replace(".", "").split())
        ) * 0.4
        self.registry.write_text(
            json.dumps(
                {
                    "schemaVersion": 2,
                    "status": "source-registry",
                    "sourcePolicy": {
                        "fetchPolicy": "network-disabled-unless-explicitly-requested",
                        "cachePolicy": "content-addressed-sha256-under-scratch",
                        "coveragePolicy": "one-pinned-complete-source-per-dialogue",
                        "translationPolicy": "jowett-unless-explicit-channel-matching-exception",
                        "defaultSource": {
                            "provider": "internet-classics-archive",
                            "format": "internet-classics-text-v1",
                            "translator": "Benjamin Jowett",
                            "encoding": "utf-8",
                        },
                    },
                    "dialogues": [
                        {
                            "dialogue": "crito",
                            "status": "available-complete",
                            "pageUrl": "https://classics.mit.edu/Plato/crito.html",
                            "transcriptUrl": "https://classics.mit.edu/Plato/crito.1b.txt",
                            "expectedBytes": len(self.transcript_bytes),
                            "expectedSha256": self.transcript_sha,
                            "labelOverrides": {
                                "Socrates": "socrates",
                                "Soc": "socrates",
                                "Cr": "crito",
                            },
                            "referenceAnchors": [
                                {
                                    "anchorId": "existing-socrates-selection",
                                    "characterId": "socrates",
                                    "videoId": VIDEO_ID,
                                    "requestedStartSeconds": socrates_start,
                                    "requestedEndSeconds": socrates_end,
                                    "expectedPrompt": SOCRATES_PROMPT,
                                },
                                {
                                    "anchorId": "corrected-crito-reference",
                                    "characterId": "crito",
                                    "videoId": VIDEO_ID,
                                    "requestedStartSeconds": crito_start,
                                    "requestedEndSeconds": crito_end,
                                    "expectedPrompt": CRITO_PROMPT,
                                },
                            ],
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
                    "status": "complete",
                    "characters": [
                        {
                            "characterId": "socrates",
                            "displayName": "Socrates",
                            "aliases": ["Socrates"],
                            "appearances": [
                                {
                                    "dialogue": "crito",
                                    "performanceRole": "voice-owner",
                                    "sourceLabels": ["Socrates"],
                                    "sourceAliases": ["Socrates"],
                                }
                            ],
                        },
                        {
                            "characterId": "crito",
                            "displayName": "Crito",
                            "aliases": ["Crito"],
                            "appearances": [
                                {
                                    "dialogue": "crito",
                                    "performanceRole": "voice-owner",
                                    "sourceLabels": ["Crito"],
                                    "sourceAliases": ["Crito"],
                                }
                            ],
                        },
                        {
                            "characterId": "commentary-narrator",
                            "displayName": "Commentary Narrator",
                            "aliases": ["Commentator"],
                            "appearances": [
                                {
                                    "dialogue": "crito",
                                    "performanceRole": "voice-owner",
                                    "roleFlags": ["commentary-narrator"],
                                    "sourceLabels": [],
                                    "sourceAliases": [],
                                }
                            ],
                        },
                    ],
                }
            ),
            encoding="utf-8",
        )
        # Schema v2 is intentional: this lane must not inherit the legacy
        # materializer's v1-only coupling.
        self.references.write_text(
            json.dumps(
                {
                    "schemaVersion": 2,
                    "status": "source-pool",
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
        sources, _, _ = load_registry(self.registry)
        transcript_cache_path(
            self.transcript_cache, sources["crito"]
        ).write_bytes(self.transcript_bytes)
        caption_cache_path(self.caption_cache, VIDEO_ID).write_text(
            json.dumps(_caption_payload(caption_words)), encoding="utf-8"
        )

    def build(self) -> dict[str, object]:
        return build_alignment_report(
            registry_path=self.registry,
            characters_path=self.characters,
            references_path=self.references,
            transcript_cache=self.transcript_cache,
            caption_cache=self.caption_cache,
            dialogues=["crito"],
        )


class JowettVoiceReferenceAlignmentTest(unittest.TestCase):
    def test_editorial_narrator_is_never_a_textual_voice_owner(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            owners, _ = load_voice_owners(fixture.characters)

        self.assertEqual(
            [owner.character_id for owner in owners["crito"]],
            ["crito", "socrates"],
        )

    def test_prefix_mapping_fails_closed_on_ambiguity_and_one_letter_labels(self) -> None:
        mapper = LabelMapper(
            [
                VoiceOwner("meno", "Meno", ("Meno",)),
                VoiceOwner("menos-boy", "Meno's Boy", ("Meno's Boy",)),
                VoiceOwner("socrates", "Socrates", ("Socrates",)),
            ],
            [],
        )

        ambiguous = mapper.map("Men")
        self.assertIsNone(ambiguous.character_id)
        self.assertIsNone(ambiguous.basis)
        self.assertEqual(ambiguous.candidates, ("meno", "menos-boy"))
        self.assertEqual(mapper.map("S"), mapper.map("unknown"))
        self.assertEqual(mapper.map("Soc").character_id, "socrates")

    def test_override_cannot_target_editorial_narrator(self) -> None:
        with self.assertRaisesRegex(JowettAlignmentError, "editorial-only"):
            LabelMapper(
                [
                    VoiceOwner(
                        "commentary-narrator",
                        "Commentary Narrator",
                        ("Commentary Narrator", "Commentator"),
                    )
                ],
                [("Com", "commentary-narrator")],
            )

    def test_corpus_registry_pins_complete_multisource_coverage(self) -> None:
        sources, _, _ = load_registry(
            REPO_ROOT / "audio" / "jowett-transcript-sources.json"
        )

        self.assertEqual(len(sources), 27)
        self.assertEqual(
            sum(source.status == "available-complete" for source in sources.values()),
            27,
        )
        self.assertEqual(
            {
                provider: sum(
                    source.provider == provider for source in sources.values()
                )
                for provider in {source.provider for source in sources.values()}
            },
            {
                "internet-classics-archive": 14,
                "project-gutenberg": 11,
                "boston-university-static": 1,
                "perseus-pinned-git": 1,
            },
        )
        self.assertEqual(
            {
                dialogue: sources[dialogue].expected_sha256
                for dialogue in (
                    "cratylus",
                    "gorgias",
                    "philebus",
                    "protagoras",
                    "sophist",
                    "statesman",
                    "symposium",
                    "theaetetus",
                    "timaeus",
                    "lesser-hippias",
                    "menexenus",
                    "phaedo",
                    "greater-hippias",
                )
            },
            {
                "cratylus": "e5fe819c38e449ac686945b92aca54f3d4917e04ab1d47c576c54c9072e40acc",
                "gorgias": "379f2abb140332a49d5f86fd78f008f47de0e4fecb53a0a42b2b4cf6bfa4c133",
                "philebus": "f224a1bdbb919332313d0ffd81341cc580537fa1f05ed70b6dcac7217790149a",
                "protagoras": "7eb0299f5b11d13cb96ed1a1822c12c83f627c2488648d2013ac2e81eb5ab3ea",
                "sophist": "bd88e451d82d3e519c04ced512d006e51a2076ac0f1a99b1b11cb9b7b28dd1e3",
                "statesman": "171c09697bde2a26ad7cd4775929e780b0bc218ea47c4b4755cabe437610d3f4",
                "symposium": "8b5c599ea734ff0f5e8d83f399dead8c796800897b107c8d53fa909f74a05d6f",
                "theaetetus": "3d819c9137f018f31993ea6c340847e73a2e70db665fad5af12d841bcd50dfa8",
                "timaeus": "4f839b423198a80be946aeb7d4b0baef30862d12702a6026b2479be9718342d9",
                "lesser-hippias": "52df684dd14fa9f30fd616423defbfb9695b4c865253d78caab21007d5bd2525",
                "menexenus": "1a34580bfcb9aec8c9badf3f3812fffef65310a7950b3781a436733246339690",
                "phaedo": "b04718ed8d9db2e5993702b99fe142da56e780da12f11d7dfe25f0c032f9dcb1",
                "greater-hippias": "b4cdd3200494bca0dde6f064955b8b627f2d32a29649ea8f4bba18e21302803a",
            },
        )
        self.assertEqual(
            sources["greater-hippias"].translator, "Harold North Fowler"
        )
        self.assertEqual(
            sources["greater-hippias"].translation_exception,
            "channel-description-misattribution",
        )
        self.assertEqual(
            sources["sophist"].media_omissions,
            (
                {
                    "kind": "channel-recording-abridgement",
                    "estimatedOmittedSourceWords": 2656,
                    "effect": "alignment-coverage-only-not-speaker-impurity",
                },
            ),
        )
        self.assertEqual(
            sources["crito"].expected_sha256,
            "bd3101f532f1aa00d495094ef0d4260afe2d1a27099eee07ae333c1a82f0c8e9",
        )

    def test_gutenberg_parser_cuts_exact_body_and_maps_colon_turns(self) -> None:
        sources, _, _ = load_registry(
            REPO_ROOT / "audio" / "jowett-transcript-sources.json"
        )
        source = sources["cratylus"]
        payload = """\ufeffThe Project Gutenberg eBook
Translated by Benjamin Jowett
SOCRATES: introduction must never become a turn
PERSONS OF THE DIALOGUE: Socrates, Hermogenes, Cratylus.
SOCRATES: Patient friends consider justice before choosing flight because reason alone governs.
HERMOGENES: Names may be conventional while careful inquiry still tests their use.
*** END OF THE PROJECT GUTENBERG EBOOK CRATYLUS ***
SOCRATES: license text must never become a turn
""".encode("utf-8")
        owners = (
            VoiceOwner("hermogenes", "Hermogenes", ("Hermogenes",)),
            VoiceOwner("socrates", "Socrates", ("Socrates",)),
        )

        extracted = extract_jowett_text(payload, source=source)
        parsed = parse_jowett_transcript(payload, source=source, owners=owners)

        self.assertNotIn("introduction must never", extracted)
        self.assertNotIn("license text must never", extracted)
        self.assertEqual(
            [(turn.character_id, turn.source_label) for turn in parsed.turns],
            [("socrates", "SOCRATES"), ("hermogenes", "HERMOGENES")],
        )
        with self.assertRaisesRegex(JowettAlignmentError, "body markers"):
            extract_jowett_text(
                payload.replace(b"*** END OF THE PROJECT GUTENBERG EBOOK", b"END"),
                source=source,
            )

    def test_bu_html_parser_requires_complete_structure(self) -> None:
        sources, _, _ = load_registry(
            REPO_ROOT / "audio" / "jowett-transcript-sources.json"
        )
        source = sources["phaedo"]
        payload = """<html><body>
<p>Public Domain English Translation by Benjamin Jowett</p>
<p><b>Persons of the Dialogue:</b><br>PHAEDO<br>SOCRATES</p>
<p>Phaedo. Patient friends consider justice before choosing flight because reason alone governs.</p>
</body></html>""".encode("windows-1252")
        parsed = parse_jowett_transcript(
            payload,
            source=source,
            owners=(VoiceOwner("phaedo", "Phaedo", ("Phaedo",)),),
        )
        self.assertEqual(len(parsed.turns), 1)
        self.assertEqual(parsed.turns[0].character_id, "phaedo")
        with self.assertRaisesRegex(JowettAlignmentError, "closing HTML marker"):
            extract_jowett_text(payload.removesuffix(b"</html>"), source=source)

    def test_perseus_tei_parser_pins_fowler_and_marks_nested_quotes(self) -> None:
        sources, _, _ = load_registry(
            REPO_ROOT / "audio" / "jowett-transcript-sources.json"
        )
        source = sources["greater-hippias"]
        payload = """<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader><fileDesc><titleStmt><editor role="translator">Harold North Fowler</editor></titleStmt></fileDesc></teiHeader>
  <text><body><div><said who="#Socrates"><label>Soc.</label><p>Patient friends <note>editorial contamination</note>consider justice before <q type="spoken">choosing flight</q> because reason alone governs.</p></said></div></body></text>
</TEI>""".encode("utf-8")
        parsed = parse_jowett_transcript(
            payload,
            source=source,
            owners=(VoiceOwner("socrates", "Socrates", ("Socrates", "Soc")),),
        )
        self.assertEqual(len(parsed.turns), 1)
        self.assertNotIn("editorial contamination", parsed.turns[0].text)
        self.assertTrue(parsed.turns[0].contains_quoted_speech)
        with self.assertRaisesRegex(JowettAlignmentError, "translator mismatch"):
            extract_jowett_text(
                payload.replace(b"Harold North Fowler", b"Benjamin Jowett    "),
                source=source,
            )

    def test_deterministic_alignment_maps_variants_and_never_writes_cast(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            first = fixture.build()
            second = fixture.build()
            cast_path = fixture.audio / "cast.json"

        self.assertEqual(first, second)
        self.assertFalse(cast_path.exists())
        self.assertEqual(first["schemaVersion"], 1)
        self.assertEqual(
            first["artifactKind"],
            "jowett-caption-character-reference-alignment",
        )
        self.assertEqual(first["summary"]["missingInputCount"], 0)
        self.assertEqual(first["summary"]["candidateCharacterCount"], 1)
        self.assertEqual(
            first["policy"]["candidateSelection"],
            {
                "policy": "earliest-source-order-exact-caption-v1",
                "maximumPerCharacter": 3,
                "matchRequirement": "normalized-caption-token-sequence-exact-and-unique",
                "ordering": [
                    "source-turn-ordinal",
                    "pinned-video-registry-order",
                    "turn-window-start-word",
                ],
                "stopCondition": "stop-character-search-after-maximum-clean-non-overlapping-candidates",
            },
        )
        dialogue = first["dialogues"][0]
        self.assertEqual(dialogue["mappedLabelCounts"], {"Cr": 1, "Soc": 1, "Socrates": 1})
        self.assertEqual(dialogue["unmappedLabelCounts"], {})
        self.assertEqual(dialogue["ambiguousLabelCounts"], {})
        self.assertTrue(
            all(
                candidate["safety"]["singleCharacterUnderEditionRule"]
                and not candidate["safety"]["operatorListeningRequired"]
                and not candidate["safety"]["castWritePerformed"]
                and re.fullmatch(
                    r"[0-9a-f]{64}", candidate["sourceAgreementSha256"]
                )
                for candidate in first["candidates"]
            )
        )
        input_hashes = {
            "registrySha256": first["inputs"]["registry"]["sha256"],
            "charactersSha256": first["inputs"]["characters"]["sha256"],
            "referenceSourcesSha256": first["inputs"]["referenceSources"][
                "sha256"
            ],
            "scriptSha256": first["inputs"]["script"]["sha256"],
        }
        for candidate in first["candidates"]:
            alignment = candidate["alignment"]
            source_turn = candidate["sourceTurn"]
            provenance = candidate["provenance"]
            agreement_identity = {
                "dialogue": candidate["dialogue"],
                "characterId": candidate["characterId"],
                "videoId": candidate["videoId"],
                "startSeconds": alignment["startSeconds"],
                "endSeconds": alignment["endSeconds"],
                "sourceQuerySha256": source_turn["windowSha256"],
                "captionPromptSha256": alignment["expectedPromptSha256"],
                "sourceTurnSha256": source_turn["normalizedTextSha256"],
                "transcriptSha256": provenance["transcriptSha256"],
                "captionSha256": provenance["captionSha256"],
                "inputHashes": input_hashes,
            }
            self.assertEqual(
                candidate["sourceAgreementSha256"],
                hashlib.sha256(canonical_json(agreement_identity)).hexdigest(),
            )
        unsigned = {key: value for key, value in first.items() if key != "reportSha256"}
        self.assertEqual(
            first["reportSha256"], sha256_bytes(canonical_json(unsigned))
        )

    def test_complete_caption_piece_must_equal_exact_source_query(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            original = alignment_module._piece_expanded_prompt

            def contaminated_prompt(*args: object, **kwargs: object) -> tuple[int, int, str]:
                start, end, prompt = original(*args, **kwargs)
                return start, end, f"{prompt} intruder"

            with patch.object(
                alignment_module,
                "_piece_expanded_prompt",
                side_effect=contaminated_prompt,
            ):
                report = fixture.build()

        self.assertEqual(report["summary"]["candidateCount"], 0)
        self.assertGreater(
            report["summary"]["rejectionCounts"].get(
                "complete-caption-piece-source-query-mismatch", 0
            ),
            0,
        )

    def test_bounded_source_order_search_stops_after_three_clean_candidates(
        self,
    ) -> None:
        turns = tuple(
            JowettTurn(
                ordinal=ordinal,
                character_id="socrates",
                source_label="Soc",
                mapping_basis="registry-label-override",
                text=f"turn {ordinal}",
                tokens=tuple(f"token{ordinal}-{index}" for index in range(20)),
                normalized_text_sha256=f"{ordinal:064x}",
                contains_quoted_speech=False,
            )
            for ordinal in range(10)
        )
        parsed = ParsedTranscript(
            text="bounded fixture",
            turns=turns,
            mapped_label_counts=(("Soc", 10),),
            unmapped_label_counts=(),
            ambiguous_label_counts=(),
            completion_verified=True,
        )

        def fake_candidate(**arguments: object) -> tuple[dict[str, object], None]:
            turn = arguments["turn"]
            assert isinstance(turn, JowettTurn)
            video = arguments["video"]
            start = turn.ordinal * 100
            return (
                {
                    "candidateId": f"candidate-{turn.ordinal}",
                    "dialogue": "crito",
                    "characterId": turn.character_id,
                    "videoId": video.video_id,
                    "sourceTurn": {
                        "ordinal": turn.ordinal,
                        "windowStartWord": 0,
                    },
                    "alignment": {
                        "captionTokenSpan": {
                            "start": start,
                            "endExclusive": start + 20,
                        }
                    },
                },
                None,
            )

        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            with patch(
                "align_jowett_voice_references.parse_jowett_transcript",
                return_value=parsed,
            ), patch(
                "align_jowett_voice_references._make_candidate",
                side_effect=fake_candidate,
            ) as make_candidate:
                report = fixture.build()

        self.assertEqual(make_candidate.call_count, 3)
        self.assertEqual(
            [candidate["candidateId"] for candidate in report["candidates"]],
            ["candidate-0", "candidate-1", "candidate-2"],
        )
        search = report["dialogues"][0]["candidateSearch"]
        self.assertEqual(search["attemptCount"], 3)
        self.assertEqual(search["skippedSatisfiedTurnCount"], 7)
        self.assertEqual(search["satisfiedCharacterIds"], ["socrates"])

    def test_source_order_retention_rejects_cross_character_overlap(self) -> None:
        def candidate(character_id: str, start: int) -> dict[str, object]:
            return {
                "characterId": character_id,
                "videoId": VIDEO_ID,
                "alignment": {
                    "captionTokenSpan": {
                        "start": start,
                        "endExclusive": start + 20,
                    }
                },
            }

        retained: list[dict[str, object]] = []
        counts: Counter[str] = Counter()
        rejections: Counter[str] = Counter()
        self.assertTrue(
            _retain_source_order_candidate(
                candidate("socrates", 0), retained, counts, rejections
            )
        )
        self.assertFalse(
            _retain_source_order_candidate(
                candidate("crito", 5), retained, counts, rejections
            )
        )
        self.assertEqual(rejections["cross-character-caption-overlap"], 1)
        self.assertEqual([row["characterId"] for row in retained], ["socrates"])

    def test_anchor_audit_rejects_dirty_socrates_bounds_and_accepts_crito(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            report = JowettFixture(Path(raw_root)).build()

        audits = {row["anchorId"]: row for row in report["referenceAnchorAudits"]}
        socrates = audits["existing-socrates-selection"]
        self.assertEqual(
            socrates["status"],
            "requested-boundaries-rejected-safe-inner-interval-emitted",
        )
        self.assertEqual(
            socrates["requestedInterval"]["leadingContaminatingTokens"],
            ["contamination"],
        )
        self.assertEqual(
            socrates["requestedInterval"]["trailingContaminatingTokens"],
            ["tail"],
        )
        crito = audits["corrected-crito-reference"]
        self.assertEqual(crito["status"], "verified-exact-requested-interval")
        self.assertEqual(crito["safeInterval"]["expectedPrompt"], CRITO_PROMPT)
        self.assertNotIn("There are persons", crito["safeInterval"]["expectedPrompt"])
        self.assertEqual(
            crito["safeInterval"]["expectedPromptSha256"],
            hashlib.sha256(CRITO_PROMPT.encode("utf-8")).hexdigest(),
        )
        self.assertRegex(crito["sourceAgreementSha256"], r"^[0-9a-f]{64}$")
        self.assertEqual(
            crito["provenance"]["transcriptSha256"],
            report["dialogues"][0]["transcript"]["sha256"],
        )
        self.assertEqual(
            crito["provenance"]["captionSha256"], crito["captionSha256"]
        )

    def test_transcript_network_fetch_requires_explicit_authorization(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            sources, _, _ = load_registry(fixture.registry)
            for path in fixture.transcript_cache.iterdir():
                path.unlink()
            with self.assertRaisesRegex(
                JowettAlignmentError, "explicit --fetch-transcripts"
            ):
                populate_transcript_cache(
                    [sources["crito"]],
                    cache_root=fixture.transcript_cache,
                    artifact_root=fixture.scratch,
                    allow_network=False,
                )
            self.assertEqual(list(fixture.transcript_cache.iterdir()), [])

    def test_cached_transcript_hash_mismatch_is_fatal(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            path = next(fixture.transcript_cache.iterdir())
            path.write_bytes(path.read_bytes() + b"changed")
            with self.assertRaisesRegex(
                JowettAlignmentError, "hash/size mismatch"
            ):
                fixture.build()

    def test_report_write_is_confined_to_scratch(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = JowettFixture(Path(raw_root))
            report = fixture.build()
            output = fixture.scratch / "reports" / "crito.json"
            write_report(output, report, artifact_root=fixture.scratch)
            self.assertEqual(
                json.loads(output.read_text(encoding="utf-8")), report
            )
            outside = fixture.root / "outside.json"
            with self.assertRaisesRegex(JowettAlignmentError, "must stay under"):
                write_report(outside, report, artifact_root=fixture.scratch)
            self.assertFalse(outside.exists())


if __name__ == "__main__":
    unittest.main()
