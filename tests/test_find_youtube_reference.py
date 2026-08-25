from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from find_youtube_reference import (  # noqa: E402
    CaptionDocument,
    CaptionPiece,
    CaptionToken,
    PinnedVideo,
    ReferenceSearchError,
    align_caption_phrase,
    caption_cache_path,
    ensure_caption,
    find_reference,
    normalize_words,
    parse_json3_caption,
    resolve_pinned_video,
    write_candidate_result,
)


VIDEO_ID = "MNDfJMrH1XY"


def token_document(words: list[str]) -> CaptionDocument:
    pieces = tuple(
        CaptionPiece(text=word, start_ms=index * 100, end_ms=(index + 1) * 100)
        for index, word in enumerate(words)
    )
    tokens = tuple(
        CaptionToken(
            normalized=word,
            piece_index=index,
            start_ms=index * 100,
            end_ms=(index + 1) * 100,
        )
        for index, word in enumerate(words)
    )
    return CaptionDocument(pieces=pieces, tokens=tokens)


def source_catalog() -> dict[str, object]:
    return {
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
                        "title": "Crito",
                        "durationSeconds": 2014,
                        "url": f"https://www.youtube.com/watch?v={VIDEO_ID}",
                    }
                ],
            },
            {
                "dialogue": "laws",
                "videos": [
                    {
                        "videoId": "uddowL-Bw_M",
                        "title": "Laws I",
                        "durationSeconds": 23301,
                        "url": "https://www.youtube.com/watch?v=uddowL-Bw_M",
                    },
                    {
                        "videoId": "QH-DQq-ToUQ",
                        "title": "Laws II",
                        "durationSeconds": 27668,
                        "url": "https://www.youtube.com/watch?v=QH-DQq-ToUQ",
                    },
                ],
            },
        ],
    }


def caption_payload(*, duplicate: bool = False) -> dict[str, object]:
    words = [
        ("Only", 0),
        (" SOCRATES,", 480),
        (" the", 1080),
        (" man", 1420),
        (" who", 1760),
        (" is", 2080),
        (" to", 2300),
        (" administer", 2540),
        (" the", 3300),
        (" poison.", 3540),
    ]
    events: list[dict[str, object]] = [
        {
            "tStartMs": 10_000,
            "dDurationMs": 4_800,
            "segs": [
                {"utf8": word, **({} if offset == 0 else {"tOffsetMs": offset})}
                for word, offset in words
            ],
        }
    ]
    if duplicate:
        events.append(
            {
                "tStartMs": 30_000,
                "dDurationMs": 4_800,
                "segs": [
                    {"utf8": word, **({} if offset == 0 else {"tOffsetMs": offset})}
                    for word, offset in words
                ],
            }
        )
    return {"wireMagic": "pb3", "events": events}


def write_caption(path: Path, *, duplicate: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(caption_payload(duplicate=duplicate)), encoding="utf-8")


class YoutubeReferenceFinderTest(unittest.TestCase):
    def test_certified_exact_fast_path_matches_full_dynamic_program(self) -> None:
        query = tuple(f"anchor{index}" for index in range(20))
        document = token_document(["filler"] * 500 + list(query) + ["filler"] * 500)

        fast = align_caption_phrase(
            document,
            " ".join(query),
            min_confidence=0.90,
            ambiguity_margin=0.08,
        )
        with patch(
            "find_youtube_reference._try_certified_exact_alignment",
            return_value=None,
        ):
            slow = align_caption_phrase(
                document,
                " ".join(query),
                min_confidence=0.90,
                ambiguity_margin=0.08,
            )

        self.assertEqual(fast.match, slow.match)
        self.assertEqual(fast.match.confidence, 1.0)

    def test_certified_fast_path_preserves_near_alternative_rejection(self) -> None:
        query = tuple(f"w{index:02d}" for index in range(20))
        near = list(query)
        near[10] = "w10x"
        document = token_document(
            list(query) + ["separator"] * 30 + near
        )

        with patch(
            "find_youtube_reference._alignment_candidates",
            side_effect=AssertionError("certified exact case fell through to full DP"),
        ):
            with self.assertRaisesRegex(
                ReferenceSearchError, "ambiguous caption match"
            ):
                align_caption_phrase(
                    document,
                    " ".join(query),
                    min_confidence=0.90,
                    ambiguity_margin=0.08,
                )
        with patch(
            "find_youtube_reference._try_certified_exact_alignment",
            return_value=None,
        ):
            with self.assertRaisesRegex(
                ReferenceSearchError, "ambiguous caption match"
            ):
                align_caption_phrase(
                    document,
                    " ".join(query),
                    min_confidence=0.90,
                    ambiguity_margin=0.08,
                )

    def test_exact_match_on_large_caption_does_not_run_full_dynamic_program(
        self,
    ) -> None:
        query = tuple(f"marker{index:02d}" for index in range(20))
        words = ["ordinary"] * 25_000 + list(query) + ["ordinary"] * 25_000
        document = token_document(words)

        started = time.monotonic()
        with patch(
            "find_youtube_reference._alignment_candidates",
            side_effect=AssertionError("large exact match invoked full DP"),
        ):
            result = align_caption_phrase(
                document,
                " ".join(query),
                min_confidence=0.90,
                ambiguity_margin=0.08,
            )
        elapsed = time.monotonic() - started

        self.assertEqual(result.match.start_token, 25_000)
        self.assertLess(elapsed, 1.0)

    def test_exact_only_mode_never_falls_back_to_fuzzy_alignment(self) -> None:
        query = tuple(f"exact{index}" for index in range(8))
        document = token_document(list(query) + ["separator"] + list(query))
        with patch(
            "find_youtube_reference._alignment_candidates",
            side_effect=AssertionError("exact-only mode invoked fuzzy DP"),
        ):
            with self.assertRaisesRegex(
                ReferenceSearchError, "ambiguous exact caption match"
            ):
                align_caption_phrase(
                    document,
                    " ".join(query),
                    exact_only=True,
                )
            with self.assertRaisesRegex(
                ReferenceSearchError, "no exact token-sequence match"
            ):
                align_caption_phrase(
                    document,
                    "one two three four five six seven eight",
                    exact_only=True,
                )

    def test_writes_candidate_search_provenance_atomically(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "candidate.json"
            result = {"schemaVersion": 1, "match": {"confidence": 1.0}}
            write_candidate_result(path, result)
            self.assertEqual(json.loads(path.read_text()), result)
            self.assertEqual(list(path.parent.glob(".*.tmp")), [])

    def test_normalizes_unicode_case_punctuation_and_apostrophes(self) -> None:
        self.assertEqual(
            normalize_words("  CRÍTO’s—Poison... &amp; SOCRATES!  "),
            ("critos", "poison", "socrates"),
        )

    def test_parses_json3_timing_and_fuzzy_aligns_a_contiguous_phrase(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "caption.json3"
            write_caption(path)
            document = parse_json3_caption(path)
            result = align_caption_phrase(
                document,
                "Only, Socrates, the man who is to be the administrator of the poison",
                min_confidence=0.70,
            )

        self.assertGreater(result.match.confidence, 0.70)
        self.assertEqual(result.match.start_seconds, 10.0)
        self.assertEqual(result.match.end_seconds, 14.8)
        self.assertEqual(
            result.match.caption_transcript,
            "Only SOCRATES, the man who is to administer the poison.",
        )
        self.assertEqual(
            result.match.normalized_caption_transcript,
            "only socrates the man who is to administer the poison",
        )

    def test_rejects_repeated_and_weak_matches_instead_of_guessing(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            repeated_path = Path(raw_root) / "repeated.json3"
            write_caption(repeated_path, duplicate=True)
            repeated = parse_json3_caption(repeated_path)
            with self.assertRaisesRegex(
                ReferenceSearchError, "ambiguous caption match"
            ):
                align_caption_phrase(
                    repeated, "Only Socrates the man who is to administer the poison"
                )

            unique_path = Path(raw_root) / "unique.json3"
            write_caption(unique_path)
            unique = parse_json3_caption(unique_path)
            with self.assertRaisesRegex(ReferenceSearchError, "weak caption match"):
                align_caption_phrase(
                    unique, "justice requires escaping from this prison immediately"
                )

    def test_rejects_short_queries_and_backwards_caption_timing(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            path = Path(raw_root) / "caption.json3"
            write_caption(path)
            document = parse_json3_caption(path)
            with self.assertRaisesRegex(ReferenceSearchError, "at least 4"):
                align_caption_phrase(document, "administer the poison")

            malformed = Path(raw_root) / "backwards.json3"
            malformed.write_text(
                json.dumps(
                    {
                        "events": [
                            {
                                "tStartMs": 1000,
                                "dDurationMs": 500,
                                "segs": [{"utf8": "first"}],
                            },
                            {
                                "tStartMs": 900,
                                "dDurationMs": 500,
                                "segs": [{"utf8": "second"}],
                            },
                        ]
                    }
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(ReferenceSearchError, "moves backwards"):
                parse_json3_caption(malformed)

    def test_resolves_only_pinned_sources_and_requires_a_multi_part_id(self) -> None:
        video = resolve_pinned_video(source_catalog(), dialogue="crito")
        self.assertEqual(video.video_id, VIDEO_ID)
        self.assertEqual(video.url, f"https://www.youtube.com/watch?v={VIDEO_ID}")

        with self.assertRaisesRegex(ReferenceSearchError, "multiple source videos"):
            resolve_pinned_video(source_catalog(), dialogue="laws")
        selected = resolve_pinned_video(
            source_catalog(), dialogue="laws", video_id="QH-DQq-ToUQ"
        )
        self.assertEqual(selected.video_id, "QH-DQq-ToUQ")
        with self.assertRaisesRegex(ReferenceSearchError, "not pinned"):
            resolve_pinned_video(
                source_catalog(), dialogue="crito", video_id="aaaaaaaaaaa"
            )

    def test_uses_a_validated_cached_caption_without_network(self) -> None:
        video = PinnedVideo(
            dialogue="crito",
            video_id=VIDEO_ID,
            title="Crito",
            duration_seconds=2014,
            url=f"https://www.youtube.com/watch?v={VIDEO_ID}",
        )
        with tempfile.TemporaryDirectory() as raw_root:
            cache = Path(raw_root)
            expected = caption_cache_path(cache, VIDEO_ID)
            write_caption(expected)
            with patch("find_youtube_reference.subprocess.run") as run:
                actual = ensure_caption(video, cache, allow_download=False)
            self.assertEqual(actual, expected)
            run.assert_not_called()

    def test_fetches_en_orig_json3_to_an_atomic_cache_without_media(self) -> None:
        video = PinnedVideo(
            dialogue="crito",
            video_id=VIDEO_ID,
            title="Crito",
            duration_seconds=2014,
            url=f"https://www.youtube.com/watch?v={VIDEO_ID}",
        )

        def fake_run(
            command: list[str], **_: object
        ) -> subprocess.CompletedProcess[str]:
            self.assertIn("--skip-download", command)
            self.assertEqual(command[command.index("--sub-langs") + 1], "en-orig")
            self.assertEqual(command[-1], video.url)
            template = command[command.index("--output") + 1]
            downloaded = Path(template.replace("%(ext)s", "en-orig.json3"))
            write_caption(downloaded)
            return subprocess.CompletedProcess(command, 0, "", "")

        with tempfile.TemporaryDirectory() as raw_root:
            cache = Path(raw_root) / "captions"
            with patch(
                "find_youtube_reference.subprocess.run", side_effect=fake_run
            ) as run:
                actual = ensure_caption(video, cache)
            self.assertEqual(actual, caption_cache_path(cache, VIDEO_ID))
            self.assertTrue(actual.is_file())
            self.assertEqual(run.call_count, 1)
            self.assertEqual(list(cache.glob(f".{VIDEO_ID}.*")), [])

    def test_outputs_exact_materializer_command_and_caption_provenance_offline(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            catalog_path = root / "reference-sources.json"
            catalog_path.write_text(json.dumps(source_catalog()), encoding="utf-8")
            cache = root / "caption-cache"
            write_caption(caption_cache_path(cache, VIDEO_ID))
            result, command = find_reference(
                catalog_path=catalog_path,
                dialogue="crito",
                phrase="Only Socrates the man who is to administer the poison",
                caption_cache=cache,
                character_id="crito",
                output_root=root / "references",
                allow_caption_download=False,
            )

        self.assertEqual(result["status"], "candidate-not-selected")
        self.assertEqual(result["source"]["videoId"], VIDEO_ID)
        self.assertEqual(result["match"]["confidence"], 1.0)
        self.assertEqual(result["clip"]["startSeconds"], 9.88)
        self.assertEqual(result["clip"]["endSeconds"], 14.98)
        self.assertIsNotNone(command)
        assert command is not None
        self.assertEqual(command[-1], "--materialize")
        self.assertEqual(
            command[command.index("--prompt-text") + 1],
            "Only SOCRATES, the man who is to administer the poison.",
        )
        self.assertIn("--materialize", result["materializerCommand"])
        self.assertIn(
            "Automatic captions locate words, not speakers", result["reviewRequired"]
        )

    def test_non_materializable_short_match_remains_a_reviewable_candidate(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            payload = {
                "events": [
                    {
                        "tStartMs": 1000,
                        "dDurationMs": 500,
                        "segs": [
                            {"utf8": "that"},
                            {"utf8": " shall", "tOffsetMs": 100},
                            {"utf8": " be", "tOffsetMs": 200},
                            {"utf8": " done", "tOffsetMs": 300},
                        ],
                    }
                ]
            }
            catalog_path = root / "catalog.json"
            catalog_path.write_text(json.dumps(source_catalog()), encoding="utf-8")
            cache = root / "captions"
            cached = caption_cache_path(cache, VIDEO_ID)
            cached.parent.mkdir(parents=True)
            cached.write_text(json.dumps(payload), encoding="utf-8")
            result, command = find_reference(
                catalog_path=catalog_path,
                dialogue="crito",
                phrase="that shall be done",
                caption_cache=cache,
                character_id="crito",
                allow_caption_download=False,
            )

        self.assertIsNone(command)
        self.assertIsNone(result["materializerCommand"])
        self.assertIn("3-20 seconds", result["materializerError"])

    def test_padding_is_clamped_before_adjacent_caption_words(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            payload = caption_payload()
            payload["events"] = [
                {"tStartMs": 9000, "dDurationMs": 1000, "segs": [{"utf8": "Crito"}]},
                *payload["events"],
                {"tStartMs": 14_800, "dDurationMs": 500, "segs": [{"utf8": "and"}]},
            ]
            catalog_path = root / "catalog.json"
            catalog_path.write_text(json.dumps(source_catalog()), encoding="utf-8")
            cache = root / "captions"
            cached = caption_cache_path(cache, VIDEO_ID)
            cached.parent.mkdir(parents=True)
            cached.write_text(json.dumps(payload), encoding="utf-8")
            result, command = find_reference(
                catalog_path=catalog_path,
                dialogue="crito",
                phrase="Only Socrates the man who is to administer the poison",
                caption_cache=cache,
                character_id="crito",
                allow_caption_download=False,
                padding_before_seconds=0.5,
                padding_after_seconds=0.5,
            )

        self.assertIsNotNone(command)
        self.assertEqual(result["clip"]["startSeconds"], 10.0)
        self.assertEqual(result["clip"]["endSeconds"], 14.8)
        self.assertEqual(result["clip"]["appliedPaddingBeforeSeconds"], 0.0)
        self.assertEqual(result["clip"]["appliedPaddingAfterSeconds"], 0.0)


if __name__ == "__main__":
    unittest.main()
