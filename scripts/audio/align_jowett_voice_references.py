#!/usr/bin/env python3
"""Align pinned channel-matching source turns to cached channel captions.

The lane is deliberately separate from the canonical English TEI aligner. The
Audiobooks Dimension recordings normally follow Jowett; Greater Hippias is a
pinned Fowler exception because that is what the recording actually reads.
Network access is disabled unless ``--fetch-transcripts`` is passed. Results
are evidence-only reference intervals; this script never reads or writes
``audio/cast.json``.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable, Sequence
from urllib.parse import urlparse

from find_youtube_reference import (
    CaptionDocument,
    ReferenceSearchError,
    align_caption_phrase,
    caption_cache_path,
    normalize_words,
    parse_json3_caption,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_REGISTRY = REPO_ROOT / "audio" / "jowett-transcript-sources.json"
DEFAULT_CHARACTERS = REPO_ROOT / "audio" / "characters.json"
DEFAULT_REFERENCES = REPO_ROOT / "audio" / "reference-sources.json"
DEFAULT_TRANSCRIPT_CACHE = (
    REPO_ROOT / "scratch" / "audio-references" / "jowett-transcript-cache"
)
DEFAULT_CAPTION_CACHE = REPO_ROOT / "scratch" / "audio-references" / "caption-cache"
DEFAULT_ARTIFACT_ROOT = REPO_ROOT / "scratch"
DEFAULT_OUTPUT = (
    REPO_ROOT / "scratch" / "audio-jowett-reference-alignment" / "report.json"
)

SAFE_ID = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
SHA256 = re.compile(r"[0-9a-f]{64}")
AVAILABLE_STATUSES = frozenset({"available-complete"})
TRANSLATION_MARKER = "Translated by Benjamin Jowett"
COMPLETE_MARKER = "THE END"
GUTENBERG_BODY_START = "PERSONS OF THE DIALOGUE"
GUTENBERG_BODY_END = "*** END OF THE PROJECT GUTENBERG EBOOK"
FOWLER_TRANSLATOR = "Harold North Fowler"
TRANSLATION_EXCEPTION = "channel-description-misattribution"
SOURCE_POLICY = {
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
}
SOURCE_FORMATS = frozenset(
    {
        "internet-classics-text-v1",
        "gutenberg-plain-text-v1",
        "bu-html-paragraphs-v1",
        "perseus-tei-said-v1",
    }
)
TEI_NAMESPACE = "http://www.tei-c.org/ns/1.0"
MAX_TRANSCRIPT_BYTES = 2 * 1024 * 1024
MAX_CAPTION_BYTES = 16 * 1024 * 1024
MAX_CAPTION_TOKENS = 500_000
MIN_QUERY_WORDS = 8
QUERY_WORDS = 20
WINDOW_STEP_WORDS = 12
MAX_WINDOWS_PER_TURN = 4
MIN_ALIGNMENT_CONFIDENCE = 0.90
MIN_EXACT_TOKEN_RATIO = 0.84
AMBIGUITY_MARGIN = 0.08
MIN_REFERENCE_SECONDS = 3.0
MAX_REFERENCE_SECONDS = 20.0
MAX_PROMPT_WORDS = 34
MAX_PROMPT_CHARACTERS = 280
MAX_CANDIDATES_PER_CHARACTER = 3
CANDIDATE_SELECTION_POLICY = "earliest-source-order-exact-caption-v1"
CAPTION_BOUNDARY_TOLERANCE_SECONDS = 0.02
QUOTE_CHARACTERS = frozenset({'"', "\u201c", "\u201d"})
MIN_PREFIX_CHARACTERS = 2
EDITORIAL_ONLY_CHARACTER_IDS = frozenset({"commentary-narrator"})
EDITORIAL_ONLY_ROLE_FLAGS = frozenset({"commentary-narrator"})


class JowettAlignmentError(ValueError):
    """Raised when provenance or an alignment invariant fails closed."""


@dataclass(frozen=True)
class TranscriptSource:
    dialogue: str
    status: str
    provider: str
    source_format: str
    translator: str
    encoding: str
    page_url: str
    transcript_url: str
    expected_bytes: int
    expected_sha256: str
    body_start_marker: str | None
    body_end_marker: str | None
    translation_exception: str | None
    media_omissions: tuple[dict[str, Any], ...]
    label_overrides: tuple[tuple[str, str], ...]
    reference_anchors: tuple[dict[str, Any], ...]


@dataclass(frozen=True)
class VideoSource:
    dialogue: str
    video_id: str
    title: str
    duration_seconds: float
    url: str


@dataclass(frozen=True)
class VoiceOwner:
    character_id: str
    display_name: str
    aliases: tuple[str, ...]


@dataclass(frozen=True)
class LabelMapping:
    character_id: str | None
    basis: str | None
    candidates: tuple[str, ...]


@dataclass(frozen=True)
class JowettTurn:
    ordinal: int
    character_id: str
    source_label: str
    mapping_basis: str
    text: str
    tokens: tuple[str, ...]
    normalized_text_sha256: str
    contains_quoted_speech: bool


@dataclass(frozen=True)
class ParsedTranscript:
    text: str
    turns: tuple[JowettTurn, ...]
    mapped_label_counts: tuple[tuple[str, int], ...]
    unmapped_label_counts: tuple[tuple[str, int], ...]
    ambiguous_label_counts: tuple[tuple[str, int], ...]
    completion_verified: bool


class _PreExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.current: list[str] = []
        self.blocks: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        del attrs
        if tag.casefold() == "pre":
            if self.depth == 0:
                self.current = []
            self.depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag.casefold() != "pre" or self.depth == 0:
            return
        self.depth -= 1
        if self.depth == 0:
            self.blocks.append("".join(self.current))

    def handle_data(self, data: str) -> None:
        if self.depth:
            self.current.append(data)


class _ParagraphExtractor(HTMLParser):
    """Extract BU's body paragraphs while preserving explicit BR boundaries."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.body_depth = 0
        self.paragraph_depth = 0
        self.current: list[str] = []
        self.paragraphs: list[str] = []
        self.closed_body = False
        self.closed_html = False

    def handle_starttag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        del attrs
        normalized = tag.casefold()
        if normalized == "body":
            self.body_depth += 1
        elif normalized == "p" and self.body_depth:
            if self.paragraph_depth == 0:
                self.current = []
            self.paragraph_depth += 1
        elif normalized == "br" and self.paragraph_depth:
            self.current.append("\n")

    def handle_startendtag(
        self, tag: str, attrs: list[tuple[str, str | None]]
    ) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        normalized = tag.casefold()
        if normalized == "p" and self.paragraph_depth:
            self.paragraph_depth -= 1
            if self.paragraph_depth == 0:
                paragraph = "\n".join(
                    " ".join(piece.split())
                    for piece in "".join(self.current).splitlines()
                    if piece.split()
                )
                if paragraph:
                    self.paragraphs.append(paragraph)
                self.current = []
        elif normalized == "body" and self.body_depth:
            self.body_depth -= 1
            if self.body_depth == 0:
                self.closed_body = True
        elif normalized == "html":
            self.closed_html = True

    def handle_data(self, data: str) -> None:
        if self.paragraph_depth:
            self.current.append(data)


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _read_json(path: Path, *, label: str) -> tuple[Any, str]:
    _require_regular_file(path, label=label)
    try:
        raw = path.read_bytes()
        return json.loads(raw), sha256_bytes(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise JowettAlignmentError(f"cannot read {label} {path}: {error}") from error


def _display_path(path: Path) -> str:
    absolute = path.absolute()
    try:
        return str(absolute.relative_to(REPO_ROOT))
    except ValueError:
        return str(absolute)


def _require_regular_file(path: Path, *, label: str) -> None:
    if path.is_symlink():
        raise JowettAlignmentError(f"{label} may not be a symlink: {path}")
    if not path.is_file():
        raise JowettAlignmentError(f"{label} is missing or not a file: {path}")


def _confined_path(root: Path, path: Path, *, label: str) -> Path:
    absolute_root = root.absolute()
    absolute_path = path.absolute()
    try:
        relative = absolute_path.relative_to(absolute_root)
    except ValueError as error:
        raise JowettAlignmentError(
            f"{label} must stay under artifact root {root}: {path}"
        ) from error
    current = absolute_root
    if current.exists() and current.is_symlink():
        raise JowettAlignmentError(f"artifact root may not be a symlink: {root}")
    for component in relative.parts:
        current = current / component
        if current.exists() and current.is_symlink():
            raise JowettAlignmentError(f"{label} may not traverse a symlink: {path}")
    try:
        absolute_path.resolve(strict=False).relative_to(
            absolute_root.resolve(strict=False)
        )
    except ValueError as error:
        raise JowettAlignmentError(
            f"{label} escapes artifact root through an existing parent: {path}"
        ) from error
    return absolute_path


def _direct_https_url(value: Any, *, label: str) -> tuple[str, Any]:
    if not isinstance(value, str) or not value:
        raise JowettAlignmentError(f"{label} must be a non-empty HTTPS URL")
    parsed = urlparse(value)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.port is not None
        or parsed.params
        or parsed.query
        or parsed.fragment
    ):
        raise JowettAlignmentError(f"{label} must be a direct HTTPS URL")
    return value, parsed


def _validate_source_urls(
    *, dialogue: str, provider: str, page_value: Any, transcript_value: Any
) -> tuple[str, str]:
    page_url, page = _direct_https_url(page_value, label=f"{dialogue} pageUrl")
    transcript_url, transcript = _direct_https_url(
        transcript_value, label=f"{dialogue} transcriptUrl"
    )
    if provider == "internet-classics-archive":
        if (
            page.hostname != "classics.mit.edu"
            or transcript.hostname != "classics.mit.edu"
            or not page.path.startswith("/Plato/")
            or not transcript.path.startswith("/Plato/")
            or not transcript.path.endswith(".txt")
        ):
            raise JowettAlignmentError(
                f"{dialogue} Internet Classics URLs are outside the pinned provider"
            )
    elif provider == "project-gutenberg":
        page_match = re.fullmatch(r"/ebooks/([1-9][0-9]*)", page.path)
        transcript_match = re.fullmatch(
            r"/cache/epub/([1-9][0-9]*)/pg([1-9][0-9]*)\.txt",
            transcript.path,
        )
        if (
            page.hostname != "www.gutenberg.org"
            or transcript.hostname != "www.gutenberg.org"
            or page_match is None
            or transcript_match is None
            or page_match.group(1) != transcript_match.group(1)
            or transcript_match.group(1) != transcript_match.group(2)
        ):
            raise JowettAlignmentError(
                f"{dialogue} Project Gutenberg URLs do not pin one ebook"
            )
    elif provider == "boston-university-static":
        expected = "/wwildman/courses/wphil/readings/wphil_rdg01_phaedo_entire.htm"
        if (
            page.hostname != "people.bu.edu"
            or transcript.hostname != "people.bu.edu"
            or page.path != expected
            or transcript.path != expected
        ):
            raise JowettAlignmentError(
                f"{dialogue} BU source must be the pinned static Phaedo page"
            )
    elif provider == "perseus-pinned-git":
        expected_path = (
            "/PerseusDL/canonical-greekLit/"
            "e37eed2e8a5fed710c3ab0d312249c3fb04d77e0/"
            "data/tlg0059/tlg025/tlg0059.tlg025.perseus-eng2.xml"
        )
        if (
            page.hostname != "raw.githubusercontent.com"
            or transcript.hostname != "raw.githubusercontent.com"
            or page.path != expected_path
            or transcript.path != expected_path
        ):
            raise JowettAlignmentError(
                f"{dialogue} Perseus source must pin the audited git commit"
            )
    else:
        raise JowettAlignmentError(f"unsupported transcript provider {provider!r}")
    return page_url, transcript_url


def _parse_media_omissions(
    value: Any, *, dialogue: str
) -> tuple[dict[str, Any], ...]:
    if not isinstance(value, list):
        raise JowettAlignmentError(f"mediaOmissions must be an array for {dialogue}")
    expected = {
        "kind": "channel-recording-abridgement",
        "estimatedOmittedSourceWords": 2656,
        "effect": "alignment-coverage-only-not-speaker-impurity",
    }
    if dialogue == "sophist":
        if value != [expected]:
            raise JowettAlignmentError(
                "Sophist must record its channel abridgement as a media omission"
            )
    elif value:
        raise JowettAlignmentError(
            f"unexpected media omission declaration for {dialogue}"
        )
    return tuple(dict(row) for row in value)


def load_registry(path: Path) -> tuple[dict[str, TranscriptSource], str, dict[str, Any]]:
    payload, digest = _read_json(path, label="Jowett transcript registry")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 2
        or payload.get("status") != "source-registry"
        or not isinstance(payload.get("sourcePolicy"), dict)
        or not isinstance(payload.get("dialogues"), list)
    ):
        raise JowettAlignmentError(f"unsupported Jowett transcript registry {path}")
    policy = payload["sourcePolicy"]
    if policy != SOURCE_POLICY:
        raise JowettAlignmentError("Jowett registry source policy changed")

    result: dict[str, TranscriptSource] = {}
    for index, row in enumerate(payload["dialogues"]):
        if not isinstance(row, dict):
            raise JowettAlignmentError(f"malformed Jowett registry dialogue {index}")
        dialogue = row.get("dialogue")
        status = row.get("status")
        if (
            not isinstance(dialogue, str)
            or SAFE_ID.fullmatch(dialogue) is None
            or dialogue in result
            or status not in AVAILABLE_STATUSES
        ):
            raise JowettAlignmentError(f"malformed Jowett registry dialogue {index}")
        source_fields = ("provider", "format", "translator", "encoding")
        declared_source_fields = [field for field in source_fields if field in row]
        if declared_source_fields and len(declared_source_fields) != len(source_fields):
            raise JowettAlignmentError(
                f"{dialogue} must declare all source identity fields or use the default"
            )
        source_identity = (
            {field: row[field] for field in source_fields}
            if declared_source_fields
            else policy["defaultSource"]
        )
        provider = source_identity["provider"]
        source_format = source_identity["format"]
        translator = source_identity["translator"]
        encoding = source_identity["encoding"]
        if (
            not all(
                isinstance(value, str) and value
                for value in (provider, source_format, translator, encoding)
            )
            or source_format not in SOURCE_FORMATS
        ):
            raise JowettAlignmentError(f"invalid source identity for {dialogue}")
        expected_identity = {
            "internet-classics-text-v1": (
                "internet-classics-archive",
                "Benjamin Jowett",
                "utf-8",
            ),
            "gutenberg-plain-text-v1": (
                "project-gutenberg",
                "Benjamin Jowett",
                "utf-8-sig",
            ),
            "bu-html-paragraphs-v1": (
                "boston-university-static",
                "Benjamin Jowett",
                "windows-1252",
            ),
            "perseus-tei-said-v1": (
                "perseus-pinned-git",
                FOWLER_TRANSLATOR,
                "utf-8",
            ),
        }[source_format]
        if (provider, translator, encoding) != expected_identity:
            raise JowettAlignmentError(
                f"source provider/translator/encoding mismatch for {dialogue}"
            )
        if provider != policy["defaultSource"]["provider"] and not declared_source_fields:
            raise JowettAlignmentError(
                f"non-default provider must be explicit for {dialogue}"
            )
        page_url, transcript_url = _validate_source_urls(
            dialogue=dialogue,
            provider=provider,
            page_value=row.get("pageUrl"),
            transcript_value=row.get("transcriptUrl"),
        )
        expected_bytes = row.get("expectedBytes")
        expected_sha256 = row.get("expectedSha256")
        if (
            not isinstance(expected_bytes, int)
            or isinstance(expected_bytes, bool)
            or not 1 <= expected_bytes <= MAX_TRANSCRIPT_BYTES
            or not isinstance(expected_sha256, str)
            or SHA256.fullmatch(expected_sha256) is None
        ):
            raise JowettAlignmentError(
                f"invalid pinned transcript size/hash for {dialogue}"
            )
        body_start_marker = row.get("bodyStartMarker")
        body_end_marker = row.get("bodyEndMarker")
        if source_format == "gutenberg-plain-text-v1":
            if (
                body_start_marker != GUTENBERG_BODY_START
                or body_end_marker != GUTENBERG_BODY_END
            ):
                raise JowettAlignmentError(
                    f"invalid Gutenberg body markers for {dialogue}"
                )
        elif source_format == "bu-html-paragraphs-v1":
            if (
                body_start_marker != "Persons of the Dialogue:"
                or body_end_marker != "</html>"
            ):
                raise JowettAlignmentError(f"invalid BU body markers for {dialogue}")
        elif body_start_marker is not None or body_end_marker is not None:
            raise JowettAlignmentError(
                f"body markers are not permitted for {source_format}/{dialogue}"
            )
        translation_exception = row.get("translationException")
        if source_format == "perseus-tei-said-v1":
            if (
                dialogue != "greater-hippias"
                or translation_exception != TRANSLATION_EXCEPTION
            ):
                raise JowettAlignmentError(
                    "Fowler source requires the Greater Hippias channel-description exception"
                )
        elif translation_exception is not None:
            raise JowettAlignmentError(
                f"unexpected translation exception for {dialogue}"
            )
        media_omissions = _parse_media_omissions(
            row.get("mediaOmissions", []), dialogue=dialogue
        )
        overrides = row.get("labelOverrides", {})
        if not isinstance(overrides, dict):
            raise JowettAlignmentError(f"labelOverrides must be an object for {dialogue}")
        parsed_overrides: list[tuple[str, str]] = []
        normalized_override_labels: set[str] = set()
        for label, character_id in overrides.items():
            normalized_label = _normalize_label(label)
            if (
                not normalized_label
                or normalized_label in normalized_override_labels
                or not isinstance(character_id, str)
                or SAFE_ID.fullmatch(character_id) is None
            ):
                raise JowettAlignmentError(
                    f"malformed or duplicate label override for {dialogue}"
                )
            normalized_override_labels.add(normalized_label)
            parsed_overrides.append((label, character_id))
        anchors = row.get("referenceAnchors", [])
        if not isinstance(anchors, list):
            raise JowettAlignmentError(
                f"referenceAnchors must be an array for {dialogue}"
            )
        parsed_anchors: list[dict[str, Any]] = []
        anchor_ids: set[str] = set()
        for anchor_index, anchor in enumerate(anchors):
            if not isinstance(anchor, dict):
                raise JowettAlignmentError(
                    f"malformed reference anchor {dialogue}/{anchor_index}"
                )
            anchor_id = anchor.get("anchorId")
            character_id = anchor.get("characterId")
            video_id = anchor.get("videoId")
            start = anchor.get("requestedStartSeconds")
            end = anchor.get("requestedEndSeconds")
            prompt = anchor.get("expectedPrompt")
            if (
                not isinstance(anchor_id, str)
                or SAFE_ID.fullmatch(anchor_id) is None
                or anchor_id in anchor_ids
                or not isinstance(character_id, str)
                or SAFE_ID.fullmatch(character_id) is None
                or not isinstance(video_id, str)
                or not video_id
                or not isinstance(start, (int, float))
                or isinstance(start, bool)
                or not isinstance(end, (int, float))
                or isinstance(end, bool)
                or not 0 <= float(start) < float(end)
                or not isinstance(prompt, str)
                or len(normalize_words(prompt)) < MIN_QUERY_WORDS
            ):
                raise JowettAlignmentError(
                    f"malformed reference anchor {dialogue}/{anchor_index}"
                )
            anchor_ids.add(anchor_id)
            parsed_anchors.append(dict(anchor))
        result[dialogue] = TranscriptSource(
            dialogue=dialogue,
            status=status,
            provider=provider,
            source_format=source_format,
            translator=translator,
            encoding=encoding,
            page_url=page_url,
            transcript_url=transcript_url,
            expected_bytes=expected_bytes,
            expected_sha256=expected_sha256,
            body_start_marker=body_start_marker,
            body_end_marker=body_end_marker,
            translation_exception=translation_exception,
            media_omissions=media_omissions,
            label_overrides=tuple(sorted(parsed_overrides)),
            reference_anchors=tuple(parsed_anchors),
        )
    if not result:
        raise JowettAlignmentError("Jowett registry has no dialogues")
    return result, digest, policy


def transcript_cache_path(cache_root: Path, source: TranscriptSource) -> Path:
    return cache_root / f"{source.dialogue}.{source.expected_sha256}.txt"


def _validate_cached_transcript(path: Path, source: TranscriptSource) -> bytes:
    _require_regular_file(path, label="cached Jowett transcript")
    payload = path.read_bytes()
    if len(payload) > MAX_TRANSCRIPT_BYTES:
        raise JowettAlignmentError(
            f"cached Jowett transcript exceeds byte bound for {source.dialogue}"
        )
    actual_sha256 = sha256_bytes(payload)
    if len(payload) != source.expected_bytes or actual_sha256 != source.expected_sha256:
        raise JowettAlignmentError(
            f"cached Jowett transcript hash/size mismatch for {source.dialogue}: "
            f"expected {source.expected_bytes}/{source.expected_sha256}, "
            f"got {len(payload)}/{actual_sha256}"
        )
    return payload


def populate_transcript_cache(
    sources: Iterable[TranscriptSource],
    *,
    cache_root: Path,
    artifact_root: Path,
    allow_network: bool,
) -> None:
    if not allow_network:
        raise JowettAlignmentError(
            "transcript fetching requires the explicit --fetch-transcripts flag"
        )
    confined_cache = _confined_path(
        artifact_root, cache_root, label="Jowett transcript cache"
    )
    confined_cache.mkdir(parents=True, exist_ok=True)
    for source in sorted(sources, key=lambda item: item.dialogue):
        if source.status not in AVAILABLE_STATUSES:
            continue
        destination = transcript_cache_path(confined_cache, source)
        _confined_path(
            artifact_root, destination, label="Jowett transcript cache artifact"
        )
        if destination.exists():
            _validate_cached_transcript(destination, source)
            continue
        request = urllib.request.Request(
            source.transcript_url,
            headers={"User-Agent": "straussian-llm-wiki-audio-reference/1"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = response.read(MAX_TRANSCRIPT_BYTES + 1)
        except OSError as error:
            raise JowettAlignmentError(
                f"could not fetch pinned Jowett transcript for {source.dialogue}: {error}"
            ) from error
        if len(payload) > MAX_TRANSCRIPT_BYTES:
            raise JowettAlignmentError(
                f"downloaded Jowett transcript exceeds byte bound for {source.dialogue}"
            )
        actual_sha256 = sha256_bytes(payload)
        if len(payload) != source.expected_bytes or actual_sha256 != source.expected_sha256:
            raise JowettAlignmentError(
                f"downloaded Jowett transcript hash/size mismatch for {source.dialogue}: "
                f"expected {source.expected_bytes}/{source.expected_sha256}, "
                f"got {len(payload)}/{actual_sha256}"
            )
        temporary_handle = tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=f".{destination.name}.",
            dir=confined_cache,
            delete=False,
        )
        temporary = Path(temporary_handle.name)
        try:
            with temporary_handle:
                temporary_handle.write(payload)
                temporary_handle.flush()
                os.fsync(temporary_handle.fileno())
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)


def load_reference_videos(path: Path) -> tuple[dict[str, tuple[VideoSource, ...]], str]:
    payload, digest = _read_json(path, label="YouTube reference registry")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") not in {1, 2}
        or not isinstance(payload.get("dialogues"), list)
    ):
        raise JowettAlignmentError(f"unsupported YouTube reference registry {path}")
    result: dict[str, tuple[VideoSource, ...]] = {}
    for index, row in enumerate(payload["dialogues"]):
        dialogue = row.get("dialogue") if isinstance(row, dict) else None
        videos = row.get("videos") if isinstance(row, dict) else None
        if (
            not isinstance(dialogue, str)
            or SAFE_ID.fullmatch(dialogue) is None
            or dialogue in result
            or not isinstance(videos, list)
            or not videos
        ):
            raise JowettAlignmentError(f"malformed reference dialogue {index}")
        parsed: list[VideoSource] = []
        seen_ids: set[str] = set()
        for video_index, video in enumerate(videos):
            video_id = video.get("videoId") if isinstance(video, dict) else None
            title = video.get("title") if isinstance(video, dict) else None
            duration = video.get("durationSeconds") if isinstance(video, dict) else None
            url = video.get("url") if isinstance(video, dict) else None
            if (
                not isinstance(video_id, str)
                or not video_id
                or video_id in seen_ids
                or not isinstance(title, str)
                or not title
                or not isinstance(duration, (int, float))
                or isinstance(duration, bool)
                or float(duration) <= 0
                or not isinstance(url, str)
                or url != f"https://www.youtube.com/watch?v={video_id}"
            ):
                raise JowettAlignmentError(
                    f"malformed reference video {dialogue}/{video_index}"
                )
            seen_ids.add(video_id)
            parsed.append(
                VideoSource(
                    dialogue=dialogue,
                    video_id=video_id,
                    title=title,
                    duration_seconds=float(duration),
                    url=url,
                )
            )
        result[dialogue] = tuple(parsed)
    return result, digest


def load_voice_owners(path: Path) -> tuple[dict[str, tuple[VoiceOwner, ...]], str]:
    payload, digest = _read_json(path, label="character registry")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 3
        or not isinstance(payload.get("characters"), list)
    ):
        raise JowettAlignmentError(f"unsupported character registry {path}")
    by_dialogue: dict[str, list[VoiceOwner]] = defaultdict(list)
    seen_ids: set[str] = set()
    for index, row in enumerate(payload["characters"]):
        character_id = row.get("characterId") if isinstance(row, dict) else None
        display_name = row.get("displayName") if isinstance(row, dict) else None
        aliases = row.get("aliases") if isinstance(row, dict) else None
        appearances = row.get("appearances") if isinstance(row, dict) else None
        if (
            not isinstance(character_id, str)
            or SAFE_ID.fullmatch(character_id) is None
            or character_id in seen_ids
            or not isinstance(display_name, str)
            or not display_name.strip()
            or not isinstance(aliases, list)
            or not isinstance(appearances, list)
        ):
            raise JowettAlignmentError(f"malformed character registry row {index}")
        seen_ids.add(character_id)
        base_aliases = {display_name}
        for alias in aliases:
            if isinstance(alias, str) and alias.strip():
                base_aliases.add(" ".join(alias.split()))
        for appearance in appearances:
            if not isinstance(appearance, dict):
                raise JowettAlignmentError(
                    f"malformed appearance for character {character_id}"
                )
            if appearance.get("performanceRole") != "voice-owner":
                continue
            dialogue = appearance.get("dialogue")
            role_flags = appearance.get("roleFlags", [])
            if not isinstance(dialogue, str) or SAFE_ID.fullmatch(dialogue) is None:
                raise JowettAlignmentError(
                    f"malformed voice-owner appearance for character {character_id}"
                )
            if (
                not isinstance(role_flags, list)
                or any(
                    not isinstance(flag, str) or not flag.strip()
                    for flag in role_flags
                )
            ):
                raise JowettAlignmentError(
                    f"malformed roleFlags for character {character_id}/{dialogue}"
                )
            # Editorial narration has no speaker turn in a Jowett source.  Its
            # production voice is selected through an explicit cast source
            # reassignment, never inferred from a textual label such as
            # ``Com.`` (which Jowett uses for Companion).
            if (
                character_id in EDITORIAL_ONLY_CHARACTER_IDS
                or EDITORIAL_ONLY_ROLE_FLAGS.intersection(role_flags)
            ):
                continue
            appearance_aliases = set(base_aliases)
            for field in ("sourceLabels", "sourceAliases"):
                values = appearance.get(field, [])
                if not isinstance(values, list):
                    raise JowettAlignmentError(
                        f"malformed {field} for character {character_id}/{dialogue}"
                    )
                for alias in values:
                    if isinstance(alias, str) and alias.strip():
                        appearance_aliases.add(" ".join(alias.split()))
            by_dialogue[dialogue].append(
                VoiceOwner(
                    character_id=character_id,
                    display_name=display_name,
                    aliases=tuple(sorted(appearance_aliases)),
                )
            )
    return {
        dialogue: tuple(sorted(owners, key=lambda owner: owner.character_id))
        for dialogue, owners in by_dialogue.items()
    }, digest


def _normalize_label(value: Any) -> str:
    if not isinstance(value, str):
        return ""
    return " ".join(normalize_words(value))


class LabelMapper:
    def __init__(
        self, owners: Sequence[VoiceOwner], overrides: Sequence[tuple[str, str]]
    ) -> None:
        eligible_owners = tuple(
            owner
            for owner in owners
            if owner.character_id not in EDITORIAL_ONLY_CHARACTER_IDS
        )
        self.owner_ids = {owner.character_id for owner in eligible_owners}
        self.aliases: dict[str, tuple[tuple[str, ...], ...]] = {}
        for owner in eligible_owners:
            normalized_aliases = {
                tuple(normalize_words(alias))
                for alias in owner.aliases
                if normalize_words(alias)
            }
            self.aliases[owner.character_id] = tuple(sorted(normalized_aliases))
        self.overrides: dict[str, str] = {}
        for label, character_id in overrides:
            normalized = _normalize_label(label)
            if character_id in EDITORIAL_ONLY_CHARACTER_IDS:
                raise JowettAlignmentError(
                    f"label override {label!r} targets editorial-only character "
                    f"{character_id}"
                )
            if character_id not in self.owner_ids:
                raise JowettAlignmentError(
                    f"label override {label!r} targets non-voice-owner {character_id}"
                )
            if normalized in self.overrides:
                raise JowettAlignmentError(f"duplicate normalized label override {label!r}")
            self.overrides[normalized] = character_id

    @staticmethod
    def _prefix_matches(label: tuple[str, ...], alias: tuple[str, ...]) -> bool:
        if not label or not alias:
            return False
        # One-letter labels are too weak to establish speaker identity even
        # when the current catalog happens to leave only one candidate.
        if sum(len(token) for token in label) < MIN_PREFIX_CHARACTERS:
            return False
        if len(label) == len(alias):
            return all(
                len(label_token) >= 1 and alias_token.startswith(label_token)
                for label_token, alias_token in zip(label, alias, strict=True)
            )
        if len(label) == 1 and len(label[0]) >= 2:
            compact_alias = "".join(alias)
            return compact_alias.startswith(label[0])
        return False

    def map(self, label: str) -> LabelMapping:
        normalized = _normalize_label(label)
        if not normalized:
            return LabelMapping(None, None, ())
        override = self.overrides.get(normalized)
        if override is not None:
            return LabelMapping(override, "registry-label-override", (override,))
        tokens = tuple(normalized.split())
        exact = tuple(
            sorted(
                character_id
                for character_id, aliases in self.aliases.items()
                if tokens in aliases
            )
        )
        if len(exact) == 1:
            return LabelMapping(exact[0], "exact-canonical-alias", exact)
        if len(exact) > 1:
            return LabelMapping(None, None, exact)
        prefix = tuple(
            sorted(
                character_id
                for character_id, aliases in self.aliases.items()
                if any(self._prefix_matches(tokens, alias) for alias in aliases)
            )
        )
        if len(prefix) == 1:
            return LabelMapping(prefix[0], "unique-canonical-prefix", prefix)
        return LabelMapping(None, None, prefix)


def _decode_source(payload: bytes, source: TranscriptSource) -> str:
    try:
        return payload.decode(source.encoding)
    except UnicodeDecodeError as error:
        raise JowettAlignmentError(
            f"{source.dialogue} transcript is not valid {source.encoding}"
        ) from error


def _normalize_newlines(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n")


def _extract_internet_classics_text(
    payload: bytes, source: TranscriptSource
) -> str:
    decoded = _decode_source(payload, source)
    if "<pre" in decoded.casefold():
        parser = _PreExtractor()
        try:
            parser.feed(decoded)
            parser.close()
        except Exception as error:  # HTMLParser can surface malformed entities.
            raise JowettAlignmentError(
                f"cannot parse wrapped Jowett transcript: {error}"
            ) from error
        if not parser.blocks:
            raise JowettAlignmentError("wrapped Jowett transcript has no complete PRE")
        decoded = max(parser.blocks, key=len)
    normalized = _normalize_newlines(decoded)
    if TRANSLATION_MARKER not in normalized:
        raise JowettAlignmentError(
            f"Jowett transcript lacks exact marker {TRANSLATION_MARKER!r}"
        )
    if len(re.findall(r"(?m)^THE END\s*$", normalized)) != 1:
        raise JowettAlignmentError(
            f"pinned complete Jowett transcript has no unique {COMPLETE_MARKER!r} line"
        )
    return normalized


def _extract_gutenberg_text(payload: bytes, source: TranscriptSource) -> str:
    normalized = _normalize_newlines(_decode_source(payload, source))
    if TRANSLATION_MARKER not in normalized:
        raise JowettAlignmentError(
            f"Gutenberg source lacks exact marker {TRANSLATION_MARKER!r}"
        )
    lines = normalized.splitlines()
    starts = [
        index
        for index, line in enumerate(lines)
        if line.strip().startswith(source.body_start_marker or "\0")
    ]
    ends = [
        index
        for index, line in enumerate(lines)
        if line.strip().startswith(source.body_end_marker or "\0")
    ]
    if len(starts) != 1 or len(ends) != 1 or starts[0] >= ends[0]:
        raise JowettAlignmentError(
            f"Gutenberg body markers are missing, duplicated, or reversed for {source.dialogue}"
        )
    return "\n".join(lines[starts[0] : ends[0]]) + "\n"


def _extract_bu_html_text(payload: bytes, source: TranscriptSource) -> str:
    decoded = _decode_source(payload, source)
    if "Public Domain English Translation by Benjamin Jowett" not in decoded:
        raise JowettAlignmentError("BU Phaedo lacks its exact Jowett credit")
    if not decoded.rstrip().casefold().endswith((source.body_end_marker or "\0").casefold()):
        raise JowettAlignmentError("BU Phaedo lacks its pinned closing HTML marker")
    parser = _ParagraphExtractor()
    try:
        parser.feed(decoded)
        parser.close()
    except Exception as error:
        raise JowettAlignmentError(f"cannot parse BU Phaedo HTML: {error}") from error
    if not parser.closed_body or not parser.closed_html or not parser.paragraphs:
        raise JowettAlignmentError("BU Phaedo HTML is structurally incomplete")
    lines = "\n".join(parser.paragraphs).splitlines()
    starts = [
        index
        for index, line in enumerate(lines)
        if line.strip() == source.body_start_marker
    ]
    if len(starts) != 1:
        raise JowettAlignmentError("BU Phaedo has no unique dialogue body marker")
    return "\n".join(lines[starts[0] :]) + "\n"


def _tei_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def _tei_body_text(element: ET.Element) -> str:
    pieces: list[str] = []

    def visit(node: ET.Element) -> None:
        local = _tei_local_name(node.tag)
        if local in {"label", "note"}:
            return
        quoted = local == "q"
        if quoted:
            pieces.append("\u201c")
        if node.text:
            pieces.append(node.text)
        for child in node:
            visit(child)
            if child.tail:
                pieces.append(child.tail)
        if quoted:
            pieces.append("\u201d")

    if element.text:
        pieces.append(element.text)
    for child in element:
        visit(child)
        if child.tail:
            pieces.append(child.tail)
    return " ".join("".join(pieces).split())


def _extract_perseus_tei_text(payload: bytes, source: TranscriptSource) -> str:
    decoded = _decode_source(payload, source)
    try:
        root = ET.fromstring(decoded)
    except ET.ParseError as error:
        raise JowettAlignmentError(
            f"cannot parse pinned Perseus TEI for {source.dialogue}: {error}"
        ) from error
    namespace = {"tei": TEI_NAMESPACE}
    if root.tag != f"{{{TEI_NAMESPACE}}}TEI":
        raise JowettAlignmentError("pinned Perseus source is not TEI namespace XML")
    translators = {
        " ".join("".join(element.itertext()).split())
        for element in root.findall(
            ".//tei:titleStmt/tei:editor[@role='translator']", namespace
        )
    }
    if translators != {source.translator}:
        raise JowettAlignmentError(
            f"Perseus translator mismatch for {source.dialogue}: {sorted(translators)}"
        )
    text = root.find("./tei:text", namespace)
    body = root.find("./tei:text/tei:body", namespace)
    if text is None or body is None:
        raise JowettAlignmentError("pinned Perseus TEI has no complete text/body")
    lines: list[str] = []
    for said in body.findall(".//tei:said", namespace):
        who = said.get("who")
        label_element = said.find("./tei:label", namespace)
        label = (
            " ".join("".join(label_element.itertext()).split())
            if label_element is not None
            else ""
        )
        body_text = _tei_body_text(said)
        if not who or not who.startswith("#") or not label or not body_text:
            raise JowettAlignmentError(
                f"malformed Perseus speaker turn in {source.dialogue}"
            )
        lines.append(f"{label} {body_text}")
    if not lines:
        raise JowettAlignmentError("pinned Perseus TEI contains no speaker turns")
    return "\n".join(lines) + "\n"


def extract_jowett_text(payload: bytes, *, source: TranscriptSource) -> str:
    extractors = {
        "internet-classics-text-v1": _extract_internet_classics_text,
        "gutenberg-plain-text-v1": _extract_gutenberg_text,
        "bu-html-paragraphs-v1": _extract_bu_html_text,
        "perseus-tei-said-v1": _extract_perseus_tei_text,
    }
    try:
        extractor = extractors[source.source_format]
    except KeyError as error:
        raise JowettAlignmentError(
            f"unsupported transcript format {source.source_format!r}"
        ) from error
    return extractor(payload, source)


def _speaker_splits(
    line: str, mapper: LabelMapper
) -> tuple[list[tuple[str, str, LabelMapping]], str | None]:
    mapped: list[tuple[str, str, LabelMapping]] = []
    plausible: str | None = None
    for match in re.finditer(r"(?:\.\s+|:\s+)", line[:64]):
        label = line[: match.start()].strip()
        body = line[match.end() :].strip()
        if not label or not body or len(label) > 40:
            continue
        label_tokens = normalize_words(label)
        if not label_tokens or len(label_tokens) > 3:
            continue
        if not label[0].isupper():
            continue
        if plausible is None:
            plausible = label
        mapping = mapper.map(label)
        if mapping.character_id is not None:
            mapped.append((label, body, mapping))
        elif mapping.candidates:
            return [], label
    return mapped, plausible


def parse_jowett_transcript(
    payload: bytes,
    *,
    source: TranscriptSource,
    owners: Sequence[VoiceOwner],
) -> ParsedTranscript:
    text = extract_jowett_text(payload, source=source)
    complete = True
    mapper = LabelMapper(owners, source.label_overrides)
    turns: list[JowettTurn] = []
    mapped_labels: Counter[str] = Counter()
    unmapped_labels: Counter[str] = Counter()
    ambiguous_labels: Counter[str] = Counter()
    current_label: str | None = None
    current_mapping: LabelMapping | None = None
    current_pieces: list[str] = []

    def flush() -> None:
        nonlocal current_label, current_mapping, current_pieces
        if current_label is None or current_mapping is None:
            current_pieces = []
            return
        turn_text = " ".join(" ".join(current_pieces).split())
        tokens = normalize_words(turn_text)
        if tokens:
            normalized = " ".join(tokens)
            turns.append(
                JowettTurn(
                    ordinal=len(turns) + 1,
                    character_id=current_mapping.character_id or "",
                    source_label=current_label,
                    mapping_basis=current_mapping.basis or "",
                    text=turn_text,
                    tokens=tokens,
                    normalized_text_sha256=sha256_bytes(normalized.encode("utf-8")),
                    contains_quoted_speech=any(
                        quote in turn_text for quote in QUOTE_CHARACTERS
                    ),
                )
            )
        current_label = None
        current_mapping = None
        current_pieces = []

    for raw_line in text.splitlines():
        line = " ".join(raw_line.strip().split())
        if line == COMPLETE_MARKER or line.startswith("Copyright statement:"):
            flush()
            break
        if not line:
            continue
        splits, plausible = _speaker_splits(line, mapper)
        if splits:
            identities = {item[2].character_id for item in splits}
            if len(identities) != 1:
                flush()
                ambiguous_labels[plausible or splits[0][0]] += 1
                continue
            label, body, mapping = max(splits, key=lambda item: len(item[0]))
            flush()
            current_label = label
            current_mapping = mapping
            current_pieces = [body]
            mapped_labels[label] += 1
            continue
        if plausible is not None:
            mapping = mapper.map(plausible)
            if mapping.candidates:
                flush()
                ambiguous_labels[plausible] += 1
                continue
            # A short capitalized prefix ending in a period is treated as a
            # speaker boundary, not silently appended to the prior speaker.
            # False positives only reduce coverage; they cannot contaminate a
            # retained interval.
            if len(normalize_words(plausible)) <= 2:
                flush()
                unmapped_labels[plausible] += 1
                continue
        if current_label is not None:
            current_pieces.append(line)
    flush()
    return ParsedTranscript(
        text=text,
        turns=tuple(turns),
        mapped_label_counts=tuple(sorted(mapped_labels.items())),
        unmapped_label_counts=tuple(sorted(unmapped_labels.items())),
        ambiguous_label_counts=tuple(sorted(ambiguous_labels.items())),
        completion_verified=complete,
    )


def _piece_expanded_prompt(
    document: CaptionDocument, start: int, end: int
) -> tuple[int, int, str]:
    if not 0 <= start < end <= len(document.tokens):
        raise JowettAlignmentError("caption token span is out of bounds")
    first_piece = document.tokens[start].piece_index
    last_piece = document.tokens[end - 1].piece_index
    expanded_start = start
    while (
        expanded_start > 0
        and document.tokens[expanded_start - 1].piece_index == first_piece
    ):
        expanded_start -= 1
    expanded_end = end
    while (
        expanded_end < len(document.tokens)
        and document.tokens[expanded_end].piece_index == last_piece
    ):
        expanded_end += 1
    prompt = " ".join(
        " ".join(piece.text.split())
        for piece in document.pieces[first_piece : last_piece + 1]
        if piece.text.split()
    ).strip()
    if normalize_words(prompt) != tuple(
        token.normalized for token in document.tokens[expanded_start:expanded_end]
    ):
        raise JowettAlignmentError(
            "caption prompt does not exactly cover complete caption pieces"
        )
    return expanded_start, expanded_end, prompt


def _window_queries(turn: JowettTurn) -> tuple[tuple[int, tuple[str, ...]], ...]:
    count = len(turn.tokens)
    if count < MIN_QUERY_WORDS:
        return ()
    if count <= QUERY_WORDS:
        return ((0, turn.tokens),)
    starts = list(range(0, count - MIN_QUERY_WORDS + 1, WINDOW_STEP_WORDS))
    final_start = max(0, count - QUERY_WORDS)
    if final_start not in starts:
        starts.append(final_start)
    starts = sorted(starts)[:MAX_WINDOWS_PER_TURN]
    return tuple(
        (start, turn.tokens[start : min(count, start + QUERY_WORDS)])
        for start in starts
    )


def _candidate_overlap(left: dict[str, Any], right: dict[str, Any]) -> float:
    if left["videoId"] != right["videoId"]:
        return 0.0
    left_span = left["alignment"]["captionTokenSpan"]
    right_span = right["alignment"]["captionTokenSpan"]
    overlap = max(
        0,
        min(left_span["endExclusive"], right_span["endExclusive"])
        - max(left_span["start"], right_span["start"]),
    )
    shorter = min(
        left_span["endExclusive"] - left_span["start"],
        right_span["endExclusive"] - right_span["start"],
    )
    return overlap / shorter if shorter else 0.0


def _make_candidate(
    *,
    source: TranscriptSource,
    turn: JowettTurn,
    window_start: int,
    query: tuple[str, ...],
    video: VideoSource,
    document: CaptionDocument,
    caption_sha256: str,
    caption_path: Path,
    transcript_path: Path,
    registry_path: Path,
    characters_path: Path,
    references_path: Path,
    input_hashes: dict[str, str],
) -> tuple[dict[str, Any] | None, str | None]:
    try:
        result = align_caption_phrase(
            document,
            " ".join(query),
            min_confidence=MIN_ALIGNMENT_CONFIDENCE,
            ambiguity_margin=AMBIGUITY_MARGIN,
            exact_only=True,
        )
    except ReferenceSearchError:
        return None, "caption-alignment-rejected"
    match = result.match
    if match.confidence != 1.0 or match.exact_token_ratio != 1.0:
        return None, "non-exact-caption-match-rejected"
    if match.exact_token_ratio < MIN_EXACT_TOKEN_RATIO:
        return None, "exact-token-ratio-below-gate"
    expanded_start, expanded_end, prompt = _piece_expanded_prompt(
        document, match.start_token, match.end_token_exclusive
    )
    prompt_tokens = normalize_words(prompt)
    if prompt_tokens != query:
        return None, "complete-caption-piece-source-query-mismatch"
    if len(prompt_tokens) > MAX_PROMPT_WORDS:
        return None, "prompt-word-count-above-gate"
    if len(prompt) > MAX_PROMPT_CHARACTERS:
        return None, "prompt-character-count-above-gate"
    first = document.tokens[expanded_start]
    last = document.tokens[expanded_end - 1]
    start_seconds = round(first.start_ms / 1000 + 1e-10, 3)
    end_seconds = round(last.end_ms / 1000 + 1e-10, 3)
    duration_seconds = round(end_seconds - start_seconds + 1e-10, 3)
    if (
        start_seconds < 0
        or end_seconds > video.duration_seconds
        or not MIN_REFERENCE_SECONDS <= duration_seconds <= MAX_REFERENCE_SECONDS
    ):
        return None, "duration-outside-gate"
    prompt_sha256 = sha256_bytes(prompt.encode("utf-8"))
    query_sha256 = sha256_bytes(" ".join(query).encode("utf-8"))
    identity = {
        "dialogue": source.dialogue,
        "characterId": turn.character_id,
        "videoId": video.video_id,
        "transcriptSha256": source.expected_sha256,
        "captionSha256": caption_sha256,
        "turnOrdinal": turn.ordinal,
        "turnSha256": turn.normalized_text_sha256,
        "querySha256": query_sha256,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "promptSha256": prompt_sha256,
    }
    candidate_id = "jowett-caption-" + sha256_bytes(canonical_json(identity))[:24]
    source_agreement_identity = {
        "dialogue": source.dialogue,
        "characterId": turn.character_id,
        "videoId": video.video_id,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "sourceQuerySha256": query_sha256,
        "captionPromptSha256": prompt_sha256,
        "sourceTurnSha256": turn.normalized_text_sha256,
        "transcriptSha256": source.expected_sha256,
        "captionSha256": caption_sha256,
        "inputHashes": input_hashes,
    }
    source_agreement_sha256 = sha256_bytes(
        canonical_json(source_agreement_identity)
    )
    return {
        "candidateId": candidate_id,
        "status": "automatically-eligible-reference-interval",
        "dialogue": source.dialogue,
        "characterId": turn.character_id,
        "videoId": video.video_id,
        "sourceTurn": {
            "ordinal": turn.ordinal,
            "sourceLabel": turn.source_label,
            "labelMappingBasis": turn.mapping_basis,
            "normalizedTextSha256": turn.normalized_text_sha256,
            "normalizedWordCount": len(turn.tokens),
            "windowStartWord": window_start,
            "windowWordCount": len(query),
            "windowSha256": query_sha256,
            "containsQuotedSpeech": False,
            "fullTextPersisted": False,
        },
        "alignment": {
            "expectedPrompt": prompt,
            "expectedPromptSha256": prompt_sha256,
            "expectedPromptWordCount": len(prompt_tokens),
            "startSeconds": start_seconds,
            "endSeconds": end_seconds,
            "durationSeconds": duration_seconds,
            "captionTokenSpan": {
                "start": expanded_start,
                "endExclusive": expanded_end,
            },
            "confidence": round(match.confidence, 6),
            "exactTokenRatio": round(match.exact_token_ratio, 6),
            "nearestDistinctAlternativeConfidence": (
                None
                if result.nearest_distinct_alternative is None
                else round(result.nearest_distinct_alternative.confidence, 6)
            ),
        },
        "sourceAgreementSha256": source_agreement_sha256,
        "provenance": {
            "registryPath": _display_path(registry_path),
            "registrySha256": input_hashes["registrySha256"],
            "charactersPath": _display_path(characters_path),
            "charactersSha256": input_hashes["charactersSha256"],
            "referenceSourcesPath": _display_path(references_path),
            "referenceSourcesSha256": input_hashes["referenceSourcesSha256"],
            "transcriptPath": _display_path(transcript_path),
            "transcriptProvider": source.provider,
            "transcriptFormat": source.source_format,
            "transcriptUrl": source.transcript_url,
            "transcriptTranslator": source.translator,
            "translationException": source.translation_exception,
            "transcriptSha256": source.expected_sha256,
            "captionPath": _display_path(caption_path),
            "captionSha256": caption_sha256,
            "scriptPath": _display_path(SCRIPT_PATH),
            "scriptSha256": input_hashes["scriptSha256"],
            "inputBindingSha256": sha256_bytes(canonical_json(input_hashes)),
        },
        "safety": {
            "singleCharacterUnderEditionRule": True,
            "singleCharacterBasis": "complete-interval-inside-one-jowett-speaker-turn",
            "reportedSpeechExcluded": True,
            "captionPaddingSeconds": 0,
            "operatorListeningRequired": False,
            "acousticSpeakerPurityVerified": False,
            "castWritePerformed": False,
        },
    }, None


def _find_turn_for_anchor(
    parsed: ParsedTranscript, character_id: str, prompt: str
) -> JowettTurn | None:
    query = normalize_words(prompt)
    for turn in parsed.turns:
        if turn.character_id != character_id or turn.contains_quoted_speech:
            continue
        for start in range(0, len(turn.tokens) - len(query) + 1):
            if turn.tokens[start : start + len(query)] == query:
                return turn
    return None


def _tokens_overlapping_interval(
    document: CaptionDocument, start_seconds: float, end_seconds: float
) -> tuple[int, int]:
    indexes = [
        index
        for index, token in enumerate(document.tokens)
        if min(token.end_ms / 1000, end_seconds)
        - max(token.start_ms / 1000, start_seconds)
        > CAPTION_BOUNDARY_TOLERANCE_SECONDS
    ]
    if not indexes:
        raise JowettAlignmentError("reference anchor overlaps no caption tokens")
    return indexes[0], indexes[-1] + 1


def audit_reference_anchor(
    *,
    anchor: dict[str, Any],
    source: TranscriptSource,
    parsed: ParsedTranscript,
    video: VideoSource,
    document: CaptionDocument,
    caption_sha256: str,
    caption_path: Path,
    transcript_path: Path,
    registry_path: Path,
    characters_path: Path,
    references_path: Path,
    input_hashes: dict[str, str],
) -> dict[str, Any]:
    character_id = anchor["characterId"]
    prompt = " ".join(anchor["expectedPrompt"].split())
    turn = _find_turn_for_anchor(parsed, character_id, prompt)
    if turn is None:
        return {
            "anchorId": anchor["anchorId"],
            "characterId": character_id,
            "videoId": video.video_id,
            "status": "rejected-prompt-not-in-unquoted-character-turn",
        }
    try:
        result = align_caption_phrase(
            document,
            prompt,
            min_confidence=MIN_ALIGNMENT_CONFIDENCE,
            ambiguity_margin=AMBIGUITY_MARGIN,
        )
    except ReferenceSearchError as error:
        return {
            "anchorId": anchor["anchorId"],
            "characterId": character_id,
            "videoId": video.video_id,
            "status": "rejected-caption-alignment",
            "reason": str(error),
        }
    match = result.match
    safe_start, safe_end, caption_prompt = _piece_expanded_prompt(
        document, match.start_token, match.end_token_exclusive
    )
    requested_start = float(anchor["requestedStartSeconds"])
    requested_end = float(anchor["requestedEndSeconds"])
    requested_token_start, requested_token_end = _tokens_overlapping_interval(
        document, requested_start, requested_end
    )
    leading = tuple(
        token.normalized
        for token in document.tokens[
            requested_token_start : min(safe_start, requested_token_end)
        ]
    )
    trailing = tuple(
        token.normalized
        for token in document.tokens[
            max(safe_end, requested_token_start) : requested_token_end
        ]
    )
    requested_exact = (
        requested_token_start == safe_start and requested_token_end == safe_end
    )
    safe_start_seconds = round(document.tokens[safe_start].start_ms / 1000, 3)
    safe_end_seconds = round(document.tokens[safe_end - 1].end_ms / 1000, 3)
    source_agreement_identity = {
        "anchorId": anchor["anchorId"],
        "dialogue": source.dialogue,
        "characterId": character_id,
        "videoId": video.video_id,
        "requestedStartSeconds": requested_start,
        "requestedEndSeconds": requested_end,
        "safeStartSeconds": safe_start_seconds,
        "safeEndSeconds": safe_end_seconds,
        "expectedPromptSha256": sha256_bytes(prompt.encode("utf-8")),
        "sourceTurnSha256": turn.normalized_text_sha256,
        "transcriptSha256": source.expected_sha256,
        "captionSha256": caption_sha256,
        "inputHashes": input_hashes,
    }
    source_agreement_sha256 = sha256_bytes(
        canonical_json(source_agreement_identity)
    )
    return {
        "anchorId": anchor["anchorId"],
        "characterId": character_id,
        "videoId": video.video_id,
        "status": (
            "verified-exact-requested-interval"
            if requested_exact
            else "requested-boundaries-rejected-safe-inner-interval-emitted"
        ),
        "requestedInterval": {
            "startSeconds": requested_start,
            "endSeconds": requested_end,
            "captionTokenSpan": {
                "start": requested_token_start,
                "endExclusive": requested_token_end,
            },
            "exactPromptOnly": requested_exact,
            "leadingContaminatingTokens": list(leading),
            "trailingContaminatingTokens": list(trailing),
        },
        "safeInterval": {
            "startSeconds": safe_start_seconds,
            "endSeconds": safe_end_seconds,
            "durationSeconds": round(safe_end_seconds - safe_start_seconds, 3),
            "captionTokenSpan": {"start": safe_start, "endExclusive": safe_end},
            "expectedPrompt": prompt,
            "expectedPromptSha256": sha256_bytes(prompt.encode("utf-8")),
            "captionTranscript": caption_prompt,
            "captionTranscriptSha256": sha256_bytes(
                caption_prompt.encode("utf-8")
            ),
            "confidence": round(match.confidence, 6),
            "exactTokenRatio": round(match.exact_token_ratio, 6),
        },
        "sourceTurn": {
            "ordinal": turn.ordinal,
            "sourceLabel": turn.source_label,
            "labelMappingBasis": turn.mapping_basis,
            "normalizedTextSha256": turn.normalized_text_sha256,
            "containsQuotedSpeech": turn.contains_quoted_speech,
        },
        "captionSha256": caption_sha256,
        "sourceAgreementSha256": source_agreement_sha256,
        "provenance": {
            "registryPath": _display_path(registry_path),
            "registrySha256": input_hashes["registrySha256"],
            "charactersPath": _display_path(characters_path),
            "charactersSha256": input_hashes["charactersSha256"],
            "referenceSourcesPath": _display_path(references_path),
            "referenceSourcesSha256": input_hashes["referenceSourcesSha256"],
            "transcriptPath": _display_path(transcript_path),
            "transcriptProvider": source.provider,
            "transcriptFormat": source.source_format,
            "transcriptUrl": source.transcript_url,
            "transcriptTranslator": source.translator,
            "translationException": source.translation_exception,
            "transcriptSha256": source.expected_sha256,
            "captionPath": _display_path(caption_path),
            "captionSha256": caption_sha256,
            "scriptPath": _display_path(SCRIPT_PATH),
            "scriptSha256": input_hashes["scriptSha256"],
            "inputBindingSha256": sha256_bytes(canonical_json(input_hashes)),
        },
        "castWritePerformed": False,
    }


def _load_caption(
    path: Path, video: VideoSource
) -> tuple[CaptionDocument, str]:
    _require_regular_file(path, label="cached pinned YouTube captions")
    if path.stat().st_size > MAX_CAPTION_BYTES:
        raise JowettAlignmentError(
            f"cached caption exceeds byte bound for {video.video_id}"
        )
    before = sha256_file(path)
    try:
        document = parse_json3_caption(path)
    except ReferenceSearchError as error:
        raise JowettAlignmentError(
            f"cannot parse cached captions for {video.video_id}: {error}"
        ) from error
    if len(document.tokens) > MAX_CAPTION_TOKENS:
        raise JowettAlignmentError(
            f"cached caption token bound exceeded for {video.video_id}"
        )
    if sha256_file(path) != before:
        raise JowettAlignmentError(
            f"cached captions changed while parsed for {video.video_id}"
        )
    return document, before


def _retain_source_order_candidate(
    candidate: dict[str, Any],
    retained: list[dict[str, Any]],
    retained_per_character: Counter[str],
    rejection_counts: Counter[str],
) -> bool:
    """Retain the next passing candidate under the bounded source-order policy."""

    character_id = candidate["characterId"]
    if retained_per_character[character_id] >= MAX_CANDIDATES_PER_CHARACTER:
        raise JowettAlignmentError(
            "candidate search evaluated a character after its bounded quota"
        )
    conflicts = [
        prior for prior in retained if _candidate_overlap(candidate, prior) >= 0.5
    ]
    if any(prior["characterId"] != character_id for prior in conflicts):
        rejection_counts["cross-character-caption-overlap"] += 1
        return False
    if conflicts:
        rejection_counts["same-character-caption-overlap"] += 1
        return False
    retained.append(candidate)
    retained_per_character[character_id] += 1
    return True


def build_alignment_report(
    *,
    registry_path: Path = DEFAULT_REGISTRY,
    characters_path: Path = DEFAULT_CHARACTERS,
    references_path: Path = DEFAULT_REFERENCES,
    transcript_cache: Path = DEFAULT_TRANSCRIPT_CACHE,
    caption_cache: Path = DEFAULT_CAPTION_CACHE,
    dialogues: Sequence[str] | None = None,
) -> dict[str, Any]:
    registry, registry_sha256, source_policy = load_registry(registry_path)
    owners_by_dialogue, characters_sha256 = load_voice_owners(characters_path)
    videos_by_dialogue, references_sha256 = load_reference_videos(references_path)
    registry_dialogues = set(registry)
    reference_dialogues = set(videos_by_dialogue)
    if registry_dialogues != reference_dialogues:
        raise JowettAlignmentError(
            "Jowett registry dialogue set must exactly match YouTube reference registry: "
            f"missing={sorted(reference_dialogues - registry_dialogues)}, "
            f"extra={sorted(registry_dialogues - reference_dialogues)}"
        )
    selected = tuple(sorted(set(dialogues) if dialogues else registry_dialogues))
    unknown = set(selected) - registry_dialogues
    if unknown:
        raise JowettAlignmentError(f"unknown dialogue selection: {sorted(unknown)}")
    input_hashes = {
        "registrySha256": registry_sha256,
        "charactersSha256": characters_sha256,
        "referenceSourcesSha256": references_sha256,
        "scriptSha256": sha256_file(SCRIPT_PATH),
    }
    dialogue_rows: list[dict[str, Any]] = []
    missing_inputs: list[dict[str, str]] = []
    all_candidates: list[dict[str, Any]] = []
    all_anchor_audits: list[dict[str, Any]] = []
    global_rejections: Counter[str] = Counter()

    for dialogue in selected:
        source = registry[dialogue]
        owners = owners_by_dialogue.get(dialogue, ())
        base: dict[str, Any] = {
            "dialogue": dialogue,
            "sourceStatus": source.status,
            "sourceProvider": source.provider,
            "sourceFormat": source.source_format,
            "sourceTranslator": source.translator,
            "translationException": source.translation_exception,
            "mediaOmissions": [dict(row) for row in source.media_omissions],
            "voiceOwnerCount": len(owners),
        }
        transcript_path = transcript_cache_path(transcript_cache, source)
        if not transcript_path.is_file() or transcript_path.is_symlink():
            missing_inputs.append(
                {
                    "dialogue": dialogue,
                    "kind": "pinned-jowett-transcript",
                    "path": _display_path(transcript_path),
                }
            )
            base.update(
                {
                    "status": "missing-cached-jowett-transcript",
                    "candidateCount": 0,
                    "anchorAuditCount": 0,
                }
            )
            dialogue_rows.append(base)
            continue
        payload = _validate_cached_transcript(transcript_path, source)
        parsed = parse_jowett_transcript(payload, source=source, owners=owners)
        dialogue_candidates: list[dict[str, Any]] = []
        retained_per_character: Counter[str] = Counter()
        dialogue_anchors: list[dict[str, Any]] = []
        dialogue_rejections: Counter[str] = Counter()
        candidate_search_attempt_count = 0
        candidate_search_skipped_satisfied_turn_count = 0
        video_inputs: list[dict[str, Any]] = []
        caption_contexts: list[tuple[VideoSource, CaptionDocument, str]] = []
        for video in videos_by_dialogue[dialogue]:
            caption_path = caption_cache_path(caption_cache, video.video_id)
            if not caption_path.is_file() or caption_path.is_symlink():
                missing_inputs.append(
                    {
                        "dialogue": dialogue,
                        "kind": "pinned-youtube-caption",
                        "path": _display_path(caption_path),
                    }
                )
                continue
            document, caption_sha256 = _load_caption(caption_path, video)
            caption_contexts.append((video, document, caption_sha256))
            video_inputs.append(
                {
                    "videoId": video.video_id,
                    "url": video.url,
                    "captionPath": _display_path(caption_path),
                    "captionSha256": caption_sha256,
                    "captionTokenCount": len(document.tokens),
                }
            )
        if caption_contexts:
            for anchor in source.reference_anchors:
                contexts = [
                    context
                    for context in caption_contexts
                    if context[0].video_id == anchor["videoId"]
                ]
                if len(contexts) != 1:
                    dialogue_anchors.append(
                        {
                            "anchorId": anchor["anchorId"],
                            "characterId": anchor["characterId"],
                            "videoId": anchor["videoId"],
                            "status": "rejected-no-unique-cached-caption-context",
                        }
                    )
                    continue
                video, document, caption_sha256 = contexts[0]
                dialogue_anchors.append(
                    audit_reference_anchor(
                        anchor=anchor,
                        source=source,
                        parsed=parsed,
                        video=video,
                        document=document,
                        caption_sha256=caption_sha256,
                        caption_path=caption_cache_path(
                            caption_cache, video.video_id
                        ),
                        transcript_path=transcript_path,
                        registry_path=registry_path,
                        characters_path=characters_path,
                        references_path=references_path,
                        input_hashes=input_hashes,
                    )
                )

            for turn in parsed.turns:
                if (
                    retained_per_character[turn.character_id]
                    >= MAX_CANDIDATES_PER_CHARACTER
                ):
                    candidate_search_skipped_satisfied_turn_count += 1
                    continue
                if turn.contains_quoted_speech:
                    dialogue_rejections["turn-contains-quoted-speech"] += 1
                    continue
                windows = _window_queries(turn)
                if not windows:
                    dialogue_rejections["turn-too-short"] += 1
                    continue
                for video, document, caption_sha256 in caption_contexts:
                    for window_start, query in windows:
                        if (
                            retained_per_character[turn.character_id]
                            >= MAX_CANDIDATES_PER_CHARACTER
                        ):
                            break
                        candidate_search_attempt_count += 1
                        candidate, reason = _make_candidate(
                            source=source,
                            turn=turn,
                            window_start=window_start,
                            query=query,
                            video=video,
                            document=document,
                            caption_sha256=caption_sha256,
                            caption_path=caption_cache_path(
                                caption_cache, video.video_id
                            ),
                            transcript_path=transcript_path,
                            registry_path=registry_path,
                            characters_path=characters_path,
                            references_path=references_path,
                            input_hashes=input_hashes,
                        )
                        if candidate is None:
                            dialogue_rejections[reason or "candidate-rejected"] += 1
                        else:
                            _retain_source_order_candidate(
                                candidate,
                                dialogue_candidates,
                                retained_per_character,
                                dialogue_rejections,
                            )
                    if (
                        retained_per_character[turn.character_id]
                        >= MAX_CANDIDATES_PER_CHARACTER
                    ):
                        break
        retained = dialogue_candidates
        global_rejections.update(dialogue_rejections)
        all_candidates.extend(retained)
        all_anchor_audits.extend(dialogue_anchors)
        characters_with_candidates = sorted(
            {candidate["characterId"] for candidate in retained}
        )
        base.update(
            {
                "status": (
                    "aligned-complete-source"
                    if caption_contexts
                    else "missing-cached-youtube-caption"
                ),
                "transcript": {
                    "provider": source.provider,
                    "format": source.source_format,
                    "translator": source.translator,
                    "encoding": source.encoding,
                    "translationException": source.translation_exception,
                    "pageUrl": source.page_url,
                    "transcriptUrl": source.transcript_url,
                    "path": _display_path(transcript_path),
                    "sha256": source.expected_sha256,
                    "bytes": source.expected_bytes,
                    "completionVerified": parsed.completion_verified,
                },
                "mappedTurnCount": len(parsed.turns),
                "mappedLabelCounts": dict(parsed.mapped_label_counts),
                "unmappedLabelCounts": dict(parsed.unmapped_label_counts),
                "ambiguousLabelCounts": dict(parsed.ambiguous_label_counts),
                "videoInputs": video_inputs,
                "candidateCount": len(retained),
                "charactersWithCandidates": characters_with_candidates,
                "voiceOwnersWithoutCandidates": sorted(
                    {owner.character_id for owner in owners}
                    - set(characters_with_candidates)
                ),
                "anchorAuditCount": len(dialogue_anchors),
                "candidateSearch": {
                    "policy": CANDIDATE_SELECTION_POLICY,
                    "attemptCount": candidate_search_attempt_count,
                    "skippedSatisfiedTurnCount": (
                        candidate_search_skipped_satisfied_turn_count
                    ),
                    "satisfiedCharacterIds": sorted(
                        character_id
                        for character_id, count in retained_per_character.items()
                        if count >= MAX_CANDIDATES_PER_CHARACTER
                    ),
                },
                "rejectionCounts": dict(sorted(dialogue_rejections.items())),
            }
        )
        dialogue_rows.append(base)

    source_counts = Counter(source.status for source in registry.values())
    # Dialogues, turns, pinned videos, and windows are all traversed in a
    # deterministic order. Preserve that order: it is the selection basis,
    # rather than retroactively quality-ranking candidates that were never
    # needed by the bounded search.
    candidates = list(all_candidates)
    anchor_audits = sorted(
        all_anchor_audits,
        key=lambda row: (row["videoId"], row["anchorId"]),
    )
    report: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "jowett-caption-character-reference-alignment",
        "status": "reference-intervals-emitted-no-cast-writes",
        "policy": {
            "translation": "source-pinned",
            "translationPolicy": source_policy["translationPolicy"],
            "sourceCoveragePolicy": source_policy["coveragePolicy"],
            "networkDefault": "disabled",
            "captionFetchAllowed": False,
            "candidateSelection": {
                "policy": CANDIDATE_SELECTION_POLICY,
                "maximumPerCharacter": MAX_CANDIDATES_PER_CHARACTER,
                "matchRequirement": (
                    "normalized-caption-token-sequence-exact-and-unique"
                ),
                "ordering": [
                    "source-turn-ordinal",
                    "pinned-video-registry-order",
                    "turn-window-start-word",
                ],
                "stopCondition": (
                    "stop-character-search-after-maximum-clean-"
                    "non-overlapping-candidates"
                ),
            },
            "speakerMapping": "registry-overrides-then-unique-canonical-alias-prefix",
            "reportedSpeech": "excluded-at-whole-turn-quote-gate",
            "intervalDurationSeconds": {
                "minimum": MIN_REFERENCE_SECONDS,
                "maximum": MAX_REFERENCE_SECONDS,
            },
            "captionPaddingSeconds": 0,
            "captionBoundaryToleranceSeconds": CAPTION_BOUNDARY_TOLERANCE_SECONDS,
            "operatorListeningRequired": False,
            "automaticCastWrites": False,
            "acousticSpeakerPurityClaimed": False,
        },
        "inputs": {
            "registry": {
                "path": _display_path(registry_path),
                "sha256": registry_sha256,
            },
            "characters": {
                "path": _display_path(characters_path),
                "sha256": characters_sha256,
            },
            "referenceSources": {
                "path": _display_path(references_path),
                "sha256": references_sha256,
                "acceptedSchemaVersions": [1, 2],
            },
            "script": {
                "path": _display_path(SCRIPT_PATH),
                "sha256": input_hashes["scriptSha256"],
            },
        },
        "sourceCoverage": {
            "dialogueCount": len(registry),
            "availableCompleteCount": source_counts["available-complete"],
            "providerCounts": dict(
                sorted(Counter(source.provider for source in registry.values()).items())
            ),
            "translatorCounts": dict(
                sorted(Counter(source.translator for source in registry.values()).items())
            ),
            "translationExceptionDialogues": sorted(
                source.dialogue
                for source in registry.values()
                if source.translation_exception is not None
            ),
            "mediaOmissionDialogues": sorted(
                source.dialogue
                for source in registry.values()
                if source.media_omissions
            ),
        },
        "selection": {"dialogues": list(selected)},
        "summary": {
            "selectedDialogueCount": len(selected),
            "missingInputCount": len(missing_inputs),
            "candidateCount": len(candidates),
            "candidateCharacterCount": len(
                {candidate["characterId"] for candidate in candidates}
            ),
            "anchorAuditCount": len(anchor_audits),
            "exactAnchorCount": sum(
                row.get("status") == "verified-exact-requested-interval"
                for row in anchor_audits
            ),
            "boundaryRejectedAnchorCount": sum(
                row.get("status")
                == "requested-boundaries-rejected-safe-inner-interval-emitted"
                for row in anchor_audits
            ),
            "rejectionCounts": dict(sorted(global_rejections.items())),
        },
        "missingInputs": sorted(
            missing_inputs,
            key=lambda row: (row["dialogue"], row["kind"], row["path"]),
        ),
        "dialogues": dialogue_rows,
        "referenceAnchorAudits": anchor_audits,
        "candidates": candidates,
    }
    report["reportSha256"] = sha256_bytes(canonical_json(report))
    return report


def write_report(path: Path, report: dict[str, Any], *, artifact_root: Path) -> None:
    destination = _confined_path(artifact_root, path, label="alignment report")
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and (destination.is_symlink() or not destination.is_file()):
        raise JowettAlignmentError(
            f"alignment report destination must be a regular file: {destination}"
        )
    temporary_handle = tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        prefix=f".{destination.name}.",
        dir=destination.parent,
        delete=False,
    )
    temporary = Path(temporary_handle.name)
    try:
        with temporary_handle:
            json.dump(report, temporary_handle, ensure_ascii=False, indent=2)
            temporary_handle.write("\n")
            temporary_handle.flush()
            os.fsync(temporary_handle.fileno())
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", type=Path, default=DEFAULT_REGISTRY)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--references", type=Path, default=DEFAULT_REFERENCES)
    parser.add_argument("--transcript-cache", type=Path, default=DEFAULT_TRANSCRIPT_CACHE)
    parser.add_argument("--caption-cache", type=Path, default=DEFAULT_CAPTION_CACHE)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--dialogue",
        action="append",
        dest="dialogues",
        help="limit work to one canonical dialogue; may be repeated",
    )
    parser.add_argument(
        "--fetch-transcripts",
        action="store_true",
        help="explicitly permit pinned transcript-source downloads",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="persist the deterministic report under --artifact-root",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    registry, _, _ = load_registry(args.registry)
    selected = sorted(set(args.dialogues) if args.dialogues else registry)
    unknown = set(selected) - set(registry)
    if unknown:
        raise JowettAlignmentError(f"unknown dialogue selection: {sorted(unknown)}")
    if args.fetch_transcripts:
        populate_transcript_cache(
            (registry[dialogue] for dialogue in selected),
            cache_root=args.transcript_cache,
            artifact_root=args.artifact_root,
            allow_network=True,
        )
    report = build_alignment_report(
        registry_path=args.registry,
        characters_path=args.characters,
        references_path=args.references,
        transcript_cache=args.transcript_cache,
        caption_cache=args.caption_cache,
        dialogues=selected,
    )
    if args.write:
        write_report(args.output, report, artifact_root=args.artifact_root)
    else:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
