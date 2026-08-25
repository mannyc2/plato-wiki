#!/usr/bin/env python3
"""Align pinned English TEI turns to cached audiobook caption timings.

This is a conservative human-review queue builder, not a diarizer and not a
cast selector.  Its default invocation is read-only and writes the complete,
deterministic queue to stdout.  ``--write`` is required to persist the queue;
``--populate-tei-cache`` is required to fetch any pinned canonical TEI input.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import os
import re
import tempfile
import urllib.request
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from types import ModuleType
from typing import Any, Iterable, Sequence
from xml.etree import ElementTree as ET

from find_youtube_reference import (
    CaptionDocument,
    PinnedVideo,
    ReferenceSearchError,
    align_caption_phrase,
    caption_cache_path,
    normalize_words,
    parse_json3_caption,
    resolve_pinned_video,
)
from materialize_youtube_reference import (
    MAX_CLIP_SECONDS,
    MIN_CLIP_SECONDS,
    SAFE_ID,
    ReferenceMaterializationError,
    build_reference_plan,
    load_catalog,
)
from mine_cast_reference_candidates import (
    load_characters,
    load_selected_character_ids,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
IMPORTER_PATH = REPO_ROOT / "scripts" / "import-plato-greek.py"
DEFAULT_CENSUS = REPO_ROOT / "audio" / "english-tei-speaker-census.json"
DEFAULT_CHARACTERS = REPO_ROOT / "audio" / "characters.json"
DEFAULT_SOURCES = REPO_ROOT / "audio" / "reference-sources.json"
DEFAULT_CAST = REPO_ROOT / "audio" / "cast.json"
DEFAULT_RAW_ROOT = REPO_ROOT / "raw" / "plato" / "english"
DEFAULT_TEI_CACHE = REPO_ROOT / "scratch" / "audio-references" / "english-tei-cache"
DEFAULT_CAPTION_CACHE = REPO_ROOT / "scratch" / "audio-references" / "caption-cache"
DEFAULT_ARTIFACT_ROOT = REPO_ROOT / "scratch"
DEFAULT_MATERIALIZATION_ROOT = REPO_ROOT / "scratch" / "audio-references"
DEFAULT_OUTPUT = (
    REPO_ROOT / "scratch" / "audio-turn-reference-candidates" / "queue.json"
)

TEI_NAMESPACE = "http://www.tei-c.org/ns/1.0"
TEI_NS = f"{{{TEI_NAMESPACE}}}"
SHA256 = re.compile(r"[0-9a-f]{64}")
HTTPS_URL = re.compile(r"https://[^\s]+")

# These gates intentionally have no command-line weakening switches.  A later
# policy change should be a reviewed source change and therefore alter the
# script hash bound into every queue.
QUERY_WORDS = 24
MIN_QUERY_WORDS = 16
MAX_WINDOWS_PER_TURN = 5
ANCHOR_WORDS = 4
MIN_UNIQUE_ANCHORS = 2
MAX_OCCURRENCES_PER_ANCHOR = 8
MAX_ALIGNMENT_SEEDS = 96
LOCAL_CONTEXT_WORDS = 14
MIN_CONFIDENCE = 0.92
MIN_EXACT_TOKEN_RATIO = 0.88
MIN_QUERY_COVERAGE = 0.90
MIN_CONFIDENCE_MARGIN = 0.08
MAX_EXPECTED_PROMPT_WORDS = 32
MAX_EXPECTED_PROMPT_CHARACTERS = 240
MAX_CANONICAL_TEI_BYTES = 16 * 1024 * 1024
MAX_CAPTION_JSON_BYTES = 16 * 1024 * 1024
MAX_CAPTION_TOKENS_PER_VIDEO = 500_000
MAX_CANDIDATES_PER_APPEARANCE = 2
MAX_CANDIDATES_PER_CHARACTER = 3

SKIP_SPOKEN_ELEMENTS = frozenset({"bibl", "label", "note"})


class TurnAlignmentError(ValueError):
    """Raised when a queue cannot be built without weakening its evidence."""


@dataclass(frozen=True)
class EnglishSource:
    dialogue: str
    url: str
    tei_sha256: str


@dataclass(frozen=True)
class SourceTurn:
    dialogue: str
    character_id: str
    said_ordinal: int
    raw_who_sha256: str
    normalized_text_sha256: str
    tokens: tuple[str, ...]


@dataclass(frozen=True)
class CaptionContext:
    video: PinnedVideo
    path: Path
    sha256: str
    document: CaptionDocument


@dataclass(frozen=True)
class WindowMatch:
    video_index: int
    start_token: int
    end_token_exclusive: int
    confidence: float
    exact_token_ratio: float
    query_coverage: float
    unique_anchor_count: int


@dataclass(frozen=True)
class WindowResult:
    match: WindowMatch | None
    confidence_margin: float | None
    reason: str | None


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
    _require_regular_input(path, label=label)
    try:
        raw = path.read_bytes()
        return json.loads(raw), sha256_bytes(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise TurnAlignmentError(f"cannot read {label} {path}: {error}") from error


def _display_path(path: Path) -> str:
    absolute = path.absolute()
    try:
        return str(absolute.relative_to(REPO_ROOT))
    except ValueError:
        return str(absolute)


def _require_regular_input(path: Path, *, label: str) -> None:
    if path.is_symlink():
        raise TurnAlignmentError(f"{label} may not be a symlink: {path}")
    if not path.is_file():
        raise TurnAlignmentError(f"{label} is missing or not a file: {path}")


def _confined_path(artifact_root: Path, path: Path, *, label: str) -> Path:
    root = artifact_root.absolute()
    candidate = path.absolute()
    try:
        relative = candidate.relative_to(root)
    except ValueError as error:
        raise TurnAlignmentError(
            f"{label} must stay under artifact root {artifact_root}: {path}"
        ) from error
    if not relative.parts:
        return candidate
    current = root
    if current.exists() and current.is_symlink():
        raise TurnAlignmentError(f"artifact root may not be a symlink: {artifact_root}")
    for component in relative.parts:
        current = current / component
        if current.exists() and current.is_symlink():
            raise TurnAlignmentError(f"{label} may not traverse a symlink: {path}")
    resolved_root = root.resolve(strict=False)
    resolved_candidate = candidate.resolve(strict=False)
    try:
        resolved_candidate.relative_to(resolved_root)
    except ValueError as error:
        raise TurnAlignmentError(
            f"{label} escapes artifact root through an existing parent: {path}"
        ) from error
    return candidate


def _load_importer(path: Path) -> ModuleType:
    _require_regular_input(path, label="canonical English importer")
    spec = importlib.util.spec_from_file_location("plato_english_importer", path)
    if spec is None or spec.loader is None:
        raise TurnAlignmentError(f"cannot load canonical English importer {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    for name in ("convert_xml", "apply_english_repairs"):
        if not callable(getattr(module, name, None)):
            raise TurnAlignmentError(f"canonical English importer lacks {name}")
    return module


def load_english_sources(
    path: Path,
) -> tuple[dict[str, EnglishSource], str, dict[str, str]]:
    payload, digest = _read_json(path, label="English speaker census")
    if (
        not isinstance(payload, dict)
        or payload.get("schema_version") != 1
        or payload.get("artifact_kind") != "english-tei-raw-speaker-census"
        or not isinstance(payload.get("source"), dict)
        or not isinstance(payload.get("dialogues"), list)
    ):
        raise TurnAlignmentError(f"unsupported English speaker census {path}")
    source_policy = payload["source"]
    for field in ("repository", "commit", "edition_id"):
        if not isinstance(source_policy.get(field), str) or not source_policy[field]:
            raise TurnAlignmentError(f"English speaker census source lacks {field}")

    sources: dict[str, EnglishSource] = {}
    for index, row in enumerate(payload["dialogues"]):
        source = row.get("source") if isinstance(row, dict) else None
        dialogue = row.get("dialogue") if isinstance(row, dict) else None
        if (
            not isinstance(dialogue, str)
            or not SAFE_ID.fullmatch(dialogue)
            or dialogue in sources
            or not isinstance(source, dict)
            or not isinstance(source.get("url"), str)
            or not HTTPS_URL.fullmatch(source["url"])
            or not isinstance(source.get("tei_sha256"), str)
            or SHA256.fullmatch(source["tei_sha256"]) is None
            or source.get("edition_id") != source_policy["edition_id"]
        ):
            raise TurnAlignmentError(f"malformed English census dialogue {index}")
        sources[dialogue] = EnglishSource(
            dialogue=dialogue,
            url=source["url"],
            tei_sha256=source["tei_sha256"],
        )
    if not sources:
        raise TurnAlignmentError("English speaker census has no dialogues")
    return (
        sources,
        digest,
        {
            "repository": source_policy["repository"],
            "commit": source_policy["commit"],
            "editionId": source_policy["edition_id"],
        },
    )


def _unique_nonempty_strings(values: Any, *, label: str) -> tuple[str, ...]:
    if not isinstance(values, list):
        raise TurnAlignmentError(f"{label} must be an array")
    result: set[str] = set()
    for value in values:
        if not isinstance(value, str) or not value.strip():
            raise TurnAlignmentError(f"{label} contains a blank or non-string value")
        normalized = " ".join(value.split())
        if normalized in result:
            raise TurnAlignmentError(f"{label} contains duplicate {normalized!r}")
        result.add(normalized)
    return tuple(sorted(result))


def load_character_attributions(
    path: Path,
) -> tuple[dict[str, dict[str, tuple[str, ...]]], set[str], str]:
    characters, loader_digest = load_characters(path)
    payload, digest = _read_json(path, label="character registry")
    if digest != loader_digest:
        raise TurnAlignmentError("character registry changed while it was read")
    known_ids = {character.character_id for character in characters}
    by_character: dict[str, dict[str, tuple[str, ...]]] = {}
    rows_by_id = {
        row.get("characterId"): row
        for row in payload["characters"]
        if isinstance(row, dict)
    }
    if set(rows_by_id) != known_ids:
        raise TurnAlignmentError(
            "character registry identities changed during validation"
        )
    for character in characters:
        row = rows_by_id[character.character_id]
        appearances = row.get("appearances")
        if not isinstance(appearances, list):
            raise TurnAlignmentError(
                f"character {character.character_id} has malformed appearances"
            )
        dialogue_map: dict[str, tuple[str, ...]] = {}
        for appearance in appearances:
            if not isinstance(appearance, dict):
                raise TurnAlignmentError(
                    f"character {character.character_id} has malformed appearance"
                )
            dialogue = appearance.get("dialogue")
            if not isinstance(dialogue, str) or dialogue in dialogue_map:
                raise TurnAlignmentError(
                    f"character {character.character_id} has duplicate dialogue"
                )
            dialogue_map[dialogue] = _unique_nonempty_strings(
                appearance.get("sourceAttributions"),
                label=f"{character.character_id}/{dialogue} sourceAttributions",
            )
        by_character[character.character_id] = dialogue_map
    return by_character, known_ids, digest


def _catalog_videos(catalog: dict[str, Any]) -> dict[str, tuple[PinnedVideo, ...]]:
    result: dict[str, tuple[PinnedVideo, ...]] = {}
    dialogues = catalog.get("dialogues")
    if not isinstance(dialogues, list):
        raise TurnAlignmentError("reference source catalog has no dialogues")
    for row in dialogues:
        dialogue = row.get("dialogue") if isinstance(row, dict) else None
        videos = row.get("videos") if isinstance(row, dict) else None
        if (
            not isinstance(dialogue, str)
            or not SAFE_ID.fullmatch(dialogue)
            or dialogue in result
            or not isinstance(videos, list)
            or not videos
        ):
            raise TurnAlignmentError("reference source catalog has malformed dialogue")
        parsed = tuple(
            resolve_pinned_video(
                catalog, dialogue=dialogue, video_id=video.get("videoId")
            )
            for video in videos
            if isinstance(video, dict)
        )
        if len(parsed) != len(videos):
            raise TurnAlignmentError(
                f"reference source videos are malformed for {dialogue}"
            )
        result[dialogue] = parsed
    return result


def tei_cache_path(cache_root: Path, source: EnglishSource) -> Path:
    return cache_root / f"{source.dialogue}.{source.tei_sha256}.xml"


def populate_tei_cache(
    sources: Iterable[EnglishSource],
    *,
    cache_root: Path,
    artifact_root: Path,
) -> None:
    confined_cache = _confined_path(artifact_root, cache_root, label="TEI cache")
    confined_cache.mkdir(parents=True, exist_ok=True)
    for source in sorted(sources, key=lambda item: item.dialogue):
        destination = tei_cache_path(confined_cache, source)
        _confined_path(artifact_root, destination, label="TEI cache artifact")
        if destination.exists():
            _require_regular_input(destination, label="cached English TEI")
            if destination.stat().st_size > MAX_CANONICAL_TEI_BYTES:
                raise TurnAlignmentError(
                    f"cached English TEI exceeds byte bound for {source.dialogue}"
                )
            actual = sha256_file(destination)
            if actual != source.tei_sha256:
                raise TurnAlignmentError(
                    f"cached English TEI hash mismatch for {source.dialogue}: "
                    f"expected {source.tei_sha256}, got {actual}"
                )
            continue
        request = urllib.request.Request(
            source.url,
            headers={"User-Agent": "straussian-llm-wiki-audio-reference/1"},
        )
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                payload = response.read(MAX_CANONICAL_TEI_BYTES + 1)
        except OSError as error:
            raise TurnAlignmentError(
                f"could not fetch pinned English TEI for {source.dialogue}: {error}"
            ) from error
        if len(payload) > MAX_CANONICAL_TEI_BYTES:
            raise TurnAlignmentError(
                f"downloaded English TEI exceeds byte bound for {source.dialogue}"
            )
        actual = sha256_bytes(payload)
        if actual != source.tei_sha256:
            raise TurnAlignmentError(
                f"downloaded English TEI hash mismatch for {source.dialogue}: "
                f"expected {source.tei_sha256}, got {actual}"
            )
        temporary_handle = tempfile.NamedTemporaryFile(
            mode="wb", prefix=f".{destination.name}.", dir=confined_cache, delete=False
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


def _local_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if tag.startswith("{") else tag


def _append_spoken_text(element: ET.Element, pieces: list[str]) -> None:
    if element.text:
        pieces.append(element.text)
    for child in element:
        if _local_name(child.tag) not in SKIP_SPOKEN_ELEMENTS:
            _append_spoken_text(child, pieces)
        if child.tail:
            pieces.append(child.tail)


def _spoken_text(said: ET.Element) -> str:
    pieces: list[str] = []
    _append_spoken_text(said, pieces)
    return " ".join("".join(pieces).split())


def _attribution_owners(
    attributions: dict[str, dict[str, tuple[str, ...]]], dialogue: str
) -> dict[str, tuple[str, ...]]:
    owners: dict[str, list[str]] = defaultdict(list)
    for character_id, appearances in attributions.items():
        for raw_who in appearances.get(dialogue, ()):
            owners[raw_who].append(character_id)
    return {
        raw_who: tuple(sorted(character_ids))
        for raw_who, character_ids in owners.items()
    }


def parse_source_turns(
    xml_bytes: bytes,
    *,
    dialogue: str,
    attributions: dict[str, dict[str, tuple[str, ...]]],
    selected_ids: set[str],
) -> tuple[list[SourceTurn], Counter[str], Counter[str]]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as error:
        raise TurnAlignmentError(
            f"invalid cached English TEI for {dialogue}: {error}"
        ) from error
    said_elements = root.findall(f".//{TEI_NS}said")

    owners = _attribution_owners(attributions, dialogue)
    turns: list[SourceTurn] = []
    rejections: Counter[str] = Counter()
    attributed_counts: Counter[str] = Counter()
    for ordinal, said in enumerate(said_elements, start=1):
        # An outer ``said`` can contain narration plus explicitly attributed
        # quoted turns.  Treating its aggregate text as one speaker would be a
        # mixed-turn claim.  Leaf ``said`` elements remain independently
        # eligible under their own exact attribution.
        if said.findall(f".//{TEI_NS}said"):
            rejections["contains-nested-attributed-turn"] += 1
            continue
        raw_who = said.get("who")
        if raw_who is None or not raw_who.strip():
            rejections["missing-source-attribution"] += 1
            continue
        raw_who = " ".join(raw_who.split())
        if len(raw_who.split()) != 1:
            rejections["multiple-source-attributions"] += 1
            continue
        character_ids = owners.get(raw_who, ())
        if not character_ids:
            rejections["unmapped-source-attribution"] += 1
            continue
        if len(character_ids) != 1:
            rejections["ambiguous-source-attribution"] += 1
            continue
        character_id = character_ids[0]
        if character_id in selected_ids:
            rejections["selected-character-turn-excluded"] += 1
            continue
        spoken = _spoken_text(said)
        tokens = normalize_words(spoken)
        if len(tokens) < MIN_QUERY_WORDS:
            rejections["turn-too-short"] += 1
            continue
        attributed_counts[character_id] += 1
        normalized = " ".join(tokens)
        turns.append(
            SourceTurn(
                dialogue=dialogue,
                character_id=character_id,
                said_ordinal=ordinal,
                raw_who_sha256=sha256_bytes(raw_who.encode("utf-8")),
                normalized_text_sha256=sha256_bytes(normalized.encode("utf-8")),
                tokens=tokens,
            )
        )
    return turns, rejections, attributed_counts


def _window_starts(token_count: int) -> tuple[int, ...]:
    maximum_start = max(0, token_count - QUERY_WORDS)
    if maximum_start == 0:
        return (0,)
    desired_count = min(
        MAX_WINDOWS_PER_TURN,
        max(2, math.ceil(token_count / QUERY_WORDS)),
    )
    starts = {
        round(index * maximum_start / (desired_count - 1))
        for index in range(desired_count)
    }
    return tuple(sorted(starts))


def _ngram_positions(
    contexts: Sequence[CaptionContext],
) -> dict[tuple[str, ...], tuple[tuple[int, int], ...]]:
    pending: dict[tuple[str, ...], list[tuple[int, int]]] = defaultdict(list)
    for video_index, context in enumerate(contexts):
        tokens = tuple(token.normalized for token in context.document.tokens)
        for start in range(0, len(tokens) - ANCHOR_WORDS + 1):
            pending[tokens[start : start + ANCHOR_WORDS]].append((video_index, start))
    return {key: tuple(value) for key, value in pending.items()}


def _disjoint_unique_anchor_count(
    query: Sequence[str],
    positions: dict[tuple[str, ...], tuple[tuple[int, int], ...]],
    *,
    video_index: int | None = None,
    start_token: int | None = None,
    end_token_exclusive: int | None = None,
) -> int:
    accepted_query_starts: list[int] = []
    for query_start in range(0, len(query) - ANCHOR_WORDS + 1):
        ngram = tuple(query[query_start : query_start + ANCHOR_WORDS])
        occurrences = positions.get(ngram, ())
        if len(occurrences) != 1:
            continue
        if video_index is not None:
            occurrence_video, occurrence_start = occurrences[0]
            if occurrence_video != video_index:
                continue
            assert start_token is not None and end_token_exclusive is not None
            if not (
                start_token <= occurrence_start
                and occurrence_start + ANCHOR_WORDS <= end_token_exclusive
            ):
                continue
        if any(
            abs(query_start - prior) < ANCHOR_WORDS for prior in accepted_query_starts
        ):
            continue
        accepted_query_starts.append(query_start)
    return len(accepted_query_starts)


def _interval_overlap(left: WindowMatch, right: WindowMatch) -> float:
    if left.video_index != right.video_index:
        return 0.0
    overlap = max(
        0,
        min(left.end_token_exclusive, right.end_token_exclusive)
        - max(left.start_token, right.start_token),
    )
    shorter = min(
        left.end_token_exclusive - left.start_token,
        right.end_token_exclusive - right.start_token,
    )
    return overlap / shorter if shorter else 0.0


def align_window(
    query: tuple[str, ...],
    contexts: Sequence[CaptionContext],
    positions: dict[tuple[str, ...], tuple[tuple[int, int], ...]],
) -> WindowResult:
    if len(query) < MIN_QUERY_WORDS:
        return WindowResult(None, None, "query-too-short")
    unique_anchor_count = _disjoint_unique_anchor_count(query, positions)
    if unique_anchor_count < MIN_UNIQUE_ANCHORS:
        return WindowResult(None, None, "insufficient-unique-anchors")

    seeds: set[tuple[int, int]] = set()
    for query_start in range(0, len(query) - ANCHOR_WORDS + 1):
        ngram = tuple(query[query_start : query_start + ANCHOR_WORDS])
        occurrences = positions.get(ngram, ())
        if not 0 < len(occurrences) <= MAX_OCCURRENCES_PER_ANCHOR:
            continue
        for video_index, caption_start in occurrences:
            seeds.add((video_index, caption_start - query_start))
    if len(seeds) > MAX_ALIGNMENT_SEEDS:
        return WindowResult(None, None, "alignment-seed-overflow")

    discovered: dict[tuple[int, int, int], WindowMatch] = {}
    query_text = " ".join(query)
    for video_index, estimated_start in sorted(seeds):
        context = contexts[video_index]
        document = context.document
        left = max(0, estimated_start - LOCAL_CONTEXT_WORDS)
        right = min(
            len(document.tokens),
            estimated_start + len(query) + LOCAL_CONTEXT_WORDS,
        )
        if right - left < MIN_QUERY_WORDS:
            continue
        local_document = CaptionDocument(
            pieces=document.pieces,
            tokens=document.tokens[left:right],
        )
        try:
            alignment = align_caption_phrase(
                local_document,
                query_text,
                min_confidence=0.000001,
                ambiguity_margin=0.0,
            )
        except ReferenceSearchError:
            continue
        candidate = alignment.match
        start = left + candidate.start_token
        end = left + candidate.end_token_exclusive
        span_length = end - start
        coverage = min(len(query), span_length) / max(len(query), span_length)
        supported_unique_anchors = _disjoint_unique_anchor_count(
            query,
            positions,
            video_index=video_index,
            start_token=start,
            end_token_exclusive=end,
        )
        match = WindowMatch(
            video_index=video_index,
            start_token=start,
            end_token_exclusive=end,
            confidence=candidate.confidence,
            exact_token_ratio=candidate.exact_token_ratio,
            query_coverage=coverage,
            unique_anchor_count=supported_unique_anchors,
        )
        key = (video_index, start, end)
        previous = discovered.get(key)
        if previous is None or _match_sort_key(match) < _match_sort_key(previous):
            discovered[key] = match

    ordered = sorted(discovered.values(), key=_match_sort_key)
    distinct: list[WindowMatch] = []
    for match in ordered:
        if all(_interval_overlap(match, prior) < 0.5 for prior in distinct):
            distinct.append(match)
    if not distinct:
        return WindowResult(None, None, "no-caption-alignment")
    best = distinct[0]
    if best.confidence < MIN_CONFIDENCE:
        return WindowResult(None, None, "confidence-below-gate")
    if best.exact_token_ratio < MIN_EXACT_TOKEN_RATIO:
        return WindowResult(None, None, "exact-token-ratio-below-gate")
    if best.query_coverage < MIN_QUERY_COVERAGE:
        return WindowResult(None, None, "query-coverage-below-gate")
    if best.unique_anchor_count < MIN_UNIQUE_ANCHORS:
        return WindowResult(None, None, "unique-anchor-support-below-gate")
    alternative = distinct[1] if len(distinct) > 1 else None
    margin = 1.0 if alternative is None else best.confidence - alternative.confidence
    if margin < MIN_CONFIDENCE_MARGIN:
        return WindowResult(None, margin, "confidence-margin-below-gate")
    return WindowResult(best, margin, None)


def _match_sort_key(match: WindowMatch) -> tuple[float, float, float, int, int, int]:
    return (
        -round(match.confidence, 12),
        -round(match.exact_token_ratio, 12),
        -round(match.query_coverage, 12),
        -match.unique_anchor_count,
        match.video_index,
        match.start_token,
    )


def _piece_expanded_span(
    document: CaptionDocument, start: int, end: int
) -> tuple[int, int, str]:
    if not 0 <= start < end <= len(document.tokens):
        raise TurnAlignmentError("caption token span is out of bounds")
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
    prompt_tokens = normalize_words(prompt)
    caption_tokens = tuple(
        token.normalized for token in document.tokens[expanded_start:expanded_end]
    )
    if prompt_tokens != caption_tokens:
        raise TurnAlignmentError(
            "caption prompt does not exactly cover its complete caption pieces"
        )
    return expanded_start, expanded_end, prompt


def _candidate_sort_key(candidate: dict[str, Any]) -> tuple[Any, ...]:
    alignment = candidate["alignment"]
    return (
        -alignment["confidence"],
        -alignment["confidenceMargin"],
        -alignment["exactTokenRatio"],
        -alignment["uniqueAnchorCount"],
        candidate["dialogue"],
        candidate["videoId"],
        alignment["startSeconds"],
        candidate["sourceTurn"]["saidOrdinal"],
        candidate["sourceTurn"]["windowOrdinal"],
    )


def _candidate_interval_overlap(left: dict[str, Any], right: dict[str, Any]) -> float:
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


def _deduplicate_candidates(
    candidates: Sequence[dict[str, Any]],
) -> list[dict[str, Any]]:
    retained: list[dict[str, Any]] = []
    for candidate in sorted(candidates, key=_candidate_sort_key):
        if any(
            candidate["characterId"] == prior["characterId"]
            and _candidate_interval_overlap(candidate, prior) >= 0.8
            for prior in retained
        ):
            continue
        retained.append(candidate)
    return retained


def _make_candidate(
    *,
    turn: SourceTurn,
    window_ordinal: int,
    window_start: int,
    query: tuple[str, ...],
    result: WindowResult,
    contexts: Sequence[CaptionContext],
    catalog: dict[str, Any],
    catalog_path: Path,
    materialization_root: Path,
    input_hashes: dict[str, str],
) -> tuple[dict[str, Any] | None, str | None]:
    assert result.match is not None and result.confidence_margin is not None
    match = result.match
    context = contexts[match.video_index]
    document = context.document
    expanded_start, expanded_end, prompt = _piece_expanded_span(
        document, match.start_token, match.end_token_exclusive
    )
    prompt_tokens = normalize_words(prompt)
    if len(prompt_tokens) > MAX_EXPECTED_PROMPT_WORDS:
        return None, "expected-prompt-too-many-words"
    if len(prompt) > MAX_EXPECTED_PROMPT_CHARACTERS:
        return None, "expected-prompt-too-many-characters"
    first = document.tokens[expanded_start]
    last = document.tokens[expanded_end - 1]
    start_seconds = round(first.start_ms / 1000 + 1e-10, 3)
    end_seconds = round(last.end_ms / 1000 + 1e-10, 3)
    duration_seconds = round(end_seconds - start_seconds + 1e-10, 3)
    if (
        start_seconds < 0
        or end_seconds > context.video.duration_seconds
        or duration_seconds < MIN_CLIP_SECONDS
        or duration_seconds > MAX_CLIP_SECONDS
    ):
        return None, "clip-duration-outside-gate"
    try:
        reference_plan = build_reference_plan(
            catalog,
            dialogue=turn.dialogue,
            character_id=turn.character_id,
            video_id=context.video.video_id,
            start_seconds=start_seconds,
            end_seconds=end_seconds,
            prompt_text=prompt,
            output_root=materialization_root,
        )
    except ReferenceMaterializationError:
        return None, "materializer-plan-rejected"

    query_sha = sha256_bytes(" ".join(query).encode("utf-8"))
    prompt_sha = sha256_bytes(prompt.encode("utf-8"))
    identity = {
        "dialogue": turn.dialogue,
        "characterId": turn.character_id,
        "videoId": context.video.video_id,
        "captionSha256": context.sha256,
        "canonicalTeiSha256": input_hashes["canonicalTeiSha256"],
        "canonicalRawSha256": input_hashes["canonicalRawSha256"],
        "saidOrdinal": turn.said_ordinal,
        "turnTextSha256": turn.normalized_text_sha256,
        "querySha256": query_sha,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "expectedPromptSha256": prompt_sha,
    }
    candidate_id = "turn-caption-" + sha256_bytes(canonical_json(identity))[:24]
    plan_payload = asdict(reference_plan)
    return {
        "candidateId": candidate_id,
        "status": "candidate-not-selected",
        "dialogue": turn.dialogue,
        "characterId": turn.character_id,
        "videoId": context.video.video_id,
        "inputBindingSha256": sha256_bytes(canonical_json(input_hashes)),
        "sourceTurn": {
            "saidOrdinal": turn.said_ordinal,
            "rawWhoSha256": turn.raw_who_sha256,
            "normalizedTextSha256": turn.normalized_text_sha256,
            "normalizedWordCount": len(turn.tokens),
            "windowOrdinal": window_ordinal,
            "windowStartWord": window_start,
            "windowWordCount": len(query),
            "windowSha256": query_sha,
            "textPersisted": False,
        },
        "alignment": {
            "expectedPrompt": prompt,
            "expectedPromptSha256": prompt_sha,
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
            "queryCoverage": round(match.query_coverage, 6),
            "uniqueAnchorCount": match.unique_anchor_count,
            "confidenceMargin": round(result.confidence_margin, 6),
            "nearestAlternativeTextPersisted": False,
        },
        "safety": {
            "humanAuditRequired": True,
            "singleSpeakerGuaranteed": False,
            "mixedTurnClaim": False,
            "automaticCastSelection": False,
            "audioMaterialized": False,
            "reviewInstruction": (
                "Listen to the complete interval and reject it unless every audible "
                "word belongs to the intended character and expectedPrompt is exact."
            ),
        },
        "operatorActionAfterHumanAcceptance": {
            "tool": "scripts/audio/materialize_youtube_reference.py",
            "catalogPath": _display_path(catalog_path),
            "dialogue": turn.dialogue,
            "characterId": turn.character_id,
            "videoId": context.video.video_id,
            "startSeconds": start_seconds,
            "endSeconds": end_seconds,
            "promptField": "alignment.expectedPrompt",
            "outputRoot": _display_path(materialization_root),
            "plannedWavPath": _display_path(Path(plan_payload["wav_path"])),
            "plannedSidecarPath": _display_path(Path(plan_payload["sidecar_path"])),
            "automaticExecutionAllowed": False,
        },
    }, None


def _load_caption_contexts(
    videos: Sequence[PinnedVideo], caption_cache: Path
) -> tuple[list[CaptionContext], list[dict[str, Any]]]:
    contexts: list[CaptionContext] = []
    input_rows: list[dict[str, Any]] = []
    for video in videos:
        path = caption_cache_path(caption_cache, video.video_id)
        if not path.exists():
            input_rows.append(
                {
                    "videoId": video.video_id,
                    "status": "missing",
                    "path": _display_path(path),
                    "sha256": None,
                }
            )
            continue
        _require_regular_input(path, label="cached pinned YouTube captions")
        if path.stat().st_size > MAX_CAPTION_JSON_BYTES:
            raise TurnAlignmentError(
                f"caption byte bound exceeded for {video.video_id}: "
                f"{path.stat().st_size} > {MAX_CAPTION_JSON_BYTES}"
            )
        digest_before = sha256_file(path)
        document = parse_json3_caption(path)
        if len(document.tokens) > MAX_CAPTION_TOKENS_PER_VIDEO:
            raise TurnAlignmentError(
                f"caption token bound exceeded for {video.video_id}: "
                f"{len(document.tokens)} > {MAX_CAPTION_TOKENS_PER_VIDEO}"
            )
        digest = sha256_file(path)
        if digest != digest_before:
            raise TurnAlignmentError(
                f"cached captions changed while parsed for {video.video_id}"
            )
        contexts.append(CaptionContext(video, path, digest, document))
        input_rows.append(
            {
                "videoId": video.video_id,
                "status": "cached-and-hashed",
                "path": _display_path(path),
                "sha256": digest,
                "timedTokenCount": len(document.tokens),
            }
        )
    return contexts, input_rows


def build_review_queue(
    *,
    census_path: Path = DEFAULT_CENSUS,
    characters_path: Path = DEFAULT_CHARACTERS,
    sources_path: Path = DEFAULT_SOURCES,
    cast_path: Path = DEFAULT_CAST,
    raw_root: Path = DEFAULT_RAW_ROOT,
    tei_cache: Path = DEFAULT_TEI_CACHE,
    caption_cache: Path = DEFAULT_CAPTION_CACHE,
    artifact_root: Path = DEFAULT_ARTIFACT_ROOT,
    materialization_root: Path = DEFAULT_MATERIALIZATION_ROOT,
    importer_path: Path = IMPORTER_PATH,
    populate_source_cache: bool = False,
) -> dict[str, Any]:
    confined_tei_cache = _confined_path(artifact_root, tei_cache, label="TEI cache")
    confined_materialization_root = _confined_path(
        artifact_root,
        materialization_root,
        label="materialization output root",
    )
    sources, census_sha, source_policy = load_english_sources(census_path)
    attributions, known_ids, characters_sha = load_character_attributions(
        characters_path
    )
    selected_ids, cast_sha = load_selected_character_ids(cast_path, known_ids)
    catalog_payload, sources_sha = _read_json(
        sources_path, label="reference source catalog"
    )
    # Keep the existing materializer's schema validation in the evidence chain.
    catalog = load_catalog(sources_path)
    if catalog != catalog_payload:
        raise TurnAlignmentError("reference source catalog changed while it was read")
    if sha256_file(sources_path) != sources_sha:
        raise TurnAlignmentError("reference source catalog bytes changed while read")
    videos_by_dialogue = _catalog_videos(catalog)
    if set(sources) != set(videos_by_dialogue):
        raise TurnAlignmentError(
            "English source census and reference source catalog dialogue sets differ"
        )
    appearance_dialogues = {
        dialogue for appearances in attributions.values() for dialogue in appearances
    }
    unknown_appearance_dialogues = appearance_dialogues - set(sources)
    if unknown_appearance_dialogues:
        raise TurnAlignmentError(
            "character registry names dialogues absent from pinned sources: "
            + ", ".join(sorted(unknown_appearance_dialogues))
        )
    importer_sha = sha256_file(importer_path)
    importer = _load_importer(importer_path)
    if sha256_file(importer_path) != importer_sha:
        raise TurnAlignmentError("canonical English importer changed while loaded")
    script_sha = sha256_file(SCRIPT_PATH)
    if populate_source_cache:
        populate_tei_cache(
            sources.values(),
            cache_root=confined_tei_cache,
            artifact_root=artifact_root,
        )

    dialogue_rows: list[dict[str, Any]] = []
    discovered_candidates: list[dict[str, Any]] = []
    rejection_by_character: dict[str, Counter[str]] = defaultdict(Counter)
    attributed_by_character: Counter[str] = Counter()
    missing_inputs: list[dict[str, str]] = []
    total_eligible_turns = 0
    total_windows = 0
    cached_tei_count = 0
    cached_caption_count = 0

    for dialogue in sorted(sources):
        source = sources[dialogue]
        raw_path = raw_root / f"{dialogue}.txt"
        _require_regular_input(raw_path, label="canonical English rendering")
        raw_bytes = raw_path.read_bytes()
        raw_sha = sha256_bytes(raw_bytes)
        tei_path = tei_cache_path(confined_tei_cache, source)
        contexts, caption_inputs = _load_caption_contexts(
            videos_by_dialogue[dialogue], caption_cache
        )
        cached_caption_count += len(contexts)
        for row in caption_inputs:
            if row["status"] == "missing":
                missing_inputs.append(
                    {
                        "dialogue": dialogue,
                        "kind": "pinned-youtube-caption",
                        "path": row["path"],
                    }
                )
        dialogue_rejections: Counter[str] = Counter()
        turns: list[SourceTurn] = []
        attributed_counts: Counter[str] = Counter()
        tei_status = "missing"
        if not tei_path.exists():
            missing_inputs.append(
                {
                    "dialogue": dialogue,
                    "kind": "canonical-english-tei",
                    "path": _display_path(tei_path),
                }
            )
        else:
            _require_regular_input(tei_path, label="cached canonical English TEI")
            if tei_path.stat().st_size > MAX_CANONICAL_TEI_BYTES:
                raise TurnAlignmentError(
                    f"cached canonical English TEI exceeds byte bound for {dialogue}"
                )
            tei_bytes = tei_path.read_bytes()
            tei_sha = sha256_bytes(tei_bytes)
            if tei_sha != source.tei_sha256:
                raise TurnAlignmentError(
                    f"cached canonical English TEI hash mismatch for {dialogue}: "
                    f"expected {source.tei_sha256}, got {tei_sha}"
                )
            converted = importer.apply_english_repairs(
                dialogue, importer.convert_xml(tei_bytes)
            ).encode("utf-8")
            if converted != raw_bytes:
                raise TurnAlignmentError(
                    f"cached TEI does not reproduce canonical English bytes for {dialogue}"
                )
            cached_tei_count += 1
            tei_status = "cached-hash-and-rendering-verified"
            turns, dialogue_rejections, attributed_counts = parse_source_turns(
                tei_bytes,
                dialogue=dialogue,
                attributions=attributions,
                selected_ids=selected_ids,
            )
            total_eligible_turns += len(turns)
            attributed_by_character.update(attributed_counts)

        dialogue_candidates: list[dict[str, Any]] = []
        window_rejections: Counter[str] = Counter()
        if turns and contexts:
            positions = _ngram_positions(contexts)
            input_hashes = {
                "canonicalTeiSha256": source.tei_sha256,
                "canonicalRawSha256": raw_sha,
                "captionSetSha256": sha256_bytes(
                    canonical_json(
                        [
                            {
                                "videoId": context.video.video_id,
                                "sha256": context.sha256,
                            }
                            for context in contexts
                        ]
                    )
                ),
                "characterRegistrySha256": characters_sha,
                "referenceSourcesSha256": sources_sha,
                "castFilterSha256": cast_sha,
                "importerSha256": importer_sha,
                "scriptSha256": script_sha,
            }
            for turn in turns:
                for window_ordinal, window_start in enumerate(
                    _window_starts(len(turn.tokens)), start=1
                ):
                    query = turn.tokens[window_start : window_start + QUERY_WORDS]
                    total_windows += 1
                    result = align_window(query, contexts, positions)
                    if result.match is None:
                        assert result.reason is not None
                        window_rejections[result.reason] += 1
                        rejection_by_character[turn.character_id][result.reason] += 1
                        continue
                    candidate, rejection = _make_candidate(
                        turn=turn,
                        window_ordinal=window_ordinal,
                        window_start=window_start,
                        query=query,
                        result=result,
                        contexts=contexts,
                        catalog=catalog,
                        catalog_path=sources_path,
                        materialization_root=confined_materialization_root,
                        input_hashes=input_hashes,
                    )
                    if candidate is None:
                        assert rejection is not None
                        window_rejections[rejection] += 1
                        rejection_by_character[turn.character_id][rejection] += 1
                        continue
                    dialogue_candidates.append(candidate)
        elif turns:
            window_rejections["no-cached-caption"] += len(turns)
            for turn in turns:
                rejection_by_character[turn.character_id]["no-cached-caption"] += 1

        dialogue_candidates = _deduplicate_candidates(dialogue_candidates)
        discovered_candidates.extend(dialogue_candidates)
        dialogue_rows.append(
            {
                "dialogue": dialogue,
                "canonicalEnglish": {
                    "raw": {"path": _display_path(raw_path), "sha256": raw_sha},
                    "tei": {
                        "path": _display_path(tei_path),
                        "expectedSha256": source.tei_sha256,
                        "status": tei_status,
                    },
                },
                "captions": caption_inputs,
                "eligibleAttributedTurnCount": len(turns),
                "attributedTurnCounts": dict(sorted(attributed_counts.items())),
                "sourceTurnRejectionCounts": dict(sorted(dialogue_rejections.items())),
                "alignmentRejectionCounts": dict(sorted(window_rejections.items())),
                "discoveredCandidateCount": len(dialogue_candidates),
            }
        )

    # A caption interval claimed for two characters is not evidence for either.
    conflict_indices: set[int] = set()
    for left_index, left in enumerate(discovered_candidates):
        for right_index in range(left_index + 1, len(discovered_candidates)):
            right = discovered_candidates[right_index]
            if left["characterId"] == right["characterId"]:
                continue
            if _candidate_interval_overlap(left, right) >= 0.5:
                conflict_indices.update({left_index, right_index})
    conflict_count = len(conflict_indices)
    conflict_free: list[dict[str, Any]] = []
    for index, candidate in enumerate(discovered_candidates):
        if index in conflict_indices:
            rejection_by_character[candidate["characterId"]][
                "cross-character-caption-overlap"
            ] += 1
        else:
            conflict_free.append(candidate)

    by_character: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for candidate in conflict_free:
        by_character[candidate["characterId"]].append(candidate)
    retained_candidates: list[dict[str, Any]] = []
    for character_id in sorted(by_character):
        appearance_counts: Counter[str] = Counter()
        retained_for_character: list[dict[str, Any]] = []
        for candidate in sorted(by_character[character_id], key=_candidate_sort_key):
            dialogue = candidate["dialogue"]
            if appearance_counts[dialogue] >= MAX_CANDIDATES_PER_APPEARANCE:
                rejection_by_character[character_id]["appearance-retention-cap"] += 1
                continue
            if len(retained_for_character) >= MAX_CANDIDATES_PER_CHARACTER:
                rejection_by_character[character_id]["character-retention-cap"] += 1
                continue
            appearance_counts[dialogue] += 1
            retained_for_character.append(candidate)
        for rank, candidate in enumerate(retained_for_character, start=1):
            candidate["characterRank"] = rank
        retained_candidates.extend(retained_for_character)
    retained_candidates.sort(
        key=lambda candidate: (
            candidate["characterId"],
            candidate["characterRank"],
            candidate["candidateId"],
        )
    )

    candidate_ids_by_character: dict[str, list[str]] = defaultdict(list)
    candidate_ids_by_appearance: dict[tuple[str, str], list[str]] = defaultdict(list)
    for candidate in retained_candidates:
        candidate_ids_by_character[candidate["characterId"]].append(
            candidate["candidateId"]
        )
        candidate_ids_by_appearance[
            (candidate["characterId"], candidate["dialogue"])
        ].append(candidate["candidateId"])
    attributed_by_appearance = {
        (character_id, row["dialogue"]): count
        for row in dialogue_rows
        for character_id, count in row["attributedTurnCounts"].items()
    }

    character_rows: list[dict[str, Any]] = []
    for character_id in sorted(attributions):
        if character_id in selected_ids:
            status = "selected-character-excluded"
        elif candidate_ids_by_character[character_id]:
            status = "human-review-candidates-found"
        elif attributed_by_character[character_id] == 0:
            status = "no-eligible-source-attributed-turn"
        else:
            status = "no-candidate-passed-gates"
        appearances = []
        for dialogue, raw_attributions in sorted(attributions[character_id].items()):
            appearances.append(
                {
                    "dialogue": dialogue,
                    "sourceAttributionCount": len(raw_attributions),
                    "sourceAttributionsPersisted": False,
                    "eligibleAttributedTurnCount": attributed_by_appearance.get(
                        (character_id, dialogue), 0
                    ),
                    "candidateIds": candidate_ids_by_appearance[
                        (character_id, dialogue)
                    ],
                }
            )
        character_rows.append(
            {
                "characterId": character_id,
                "status": status,
                "candidateIds": candidate_ids_by_character[character_id],
                "rejectionCounts": dict(
                    sorted(rejection_by_character[character_id].items())
                ),
                "appearances": appearances,
            }
        )

    unresolved_ids = sorted(known_ids - selected_ids)
    characters_with_candidates = sum(
        bool(candidate_ids_by_character[character_id])
        for character_id in unresolved_ids
    )
    queue: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "canonical-turn-caption-reference-review-queue",
        "status": "human-review-required-no-cast-selection",
        "policy": {
            "dryRunDefault": True,
            "automaticCastSelection": False,
            "audioMaterialized": False,
            "humanAuditRequired": True,
            "singleSpeakerGuaranteed": False,
            "mixedTurnClaimAllowed": False,
            "captionTextPersistence": (
                "Only one bounded expectedPrompt required by Dots is persisted per "
                "candidate; no full caption, alternative text, or canonical query text "
                "is persisted."
            ),
            "canonicalAttribution": (
                "Only a single exact TEI said/@who value mapped to exactly one canonical "
                "character is eligible."
            ),
            "gates": {
                "queryWords": QUERY_WORDS,
                "minimumQueryWords": MIN_QUERY_WORDS,
                "maximumWindowsPerTurn": MAX_WINDOWS_PER_TURN,
                "anchorWords": ANCHOR_WORDS,
                "minimumDisjointGloballyUniqueAnchors": MIN_UNIQUE_ANCHORS,
                "minimumConfidence": MIN_CONFIDENCE,
                "minimumExactTokenRatio": MIN_EXACT_TOKEN_RATIO,
                "minimumQueryCoverage": MIN_QUERY_COVERAGE,
                "minimumConfidenceMargin": MIN_CONFIDENCE_MARGIN,
                "clipDurationSeconds": {
                    "minimum": MIN_CLIP_SECONDS,
                    "maximum": MAX_CLIP_SECONDS,
                },
                "expectedPromptWordsMaximum": MAX_EXPECTED_PROMPT_WORDS,
                "expectedPromptCharactersMaximum": MAX_EXPECTED_PROMPT_CHARACTERS,
                "canonicalTeiBytesMaximum": MAX_CANONICAL_TEI_BYTES,
                "captionJsonBytesMaximum": MAX_CAPTION_JSON_BYTES,
                "captionTimedTokensPerVideoMaximum": MAX_CAPTION_TOKENS_PER_VIDEO,
                "candidatesPerAppearanceMaximum": MAX_CANDIDATES_PER_APPEARANCE,
                "candidatesPerCharacterMaximum": MAX_CANDIDATES_PER_CHARACTER,
            },
        },
        "inputs": {
            "englishSpeakerCensus": {
                "path": _display_path(census_path),
                "sha256": census_sha,
                "source": source_policy,
            },
            "characters": {
                "path": _display_path(characters_path),
                "sha256": characters_sha,
            },
            "referenceSources": {
                "path": _display_path(sources_path),
                "sha256": sources_sha,
            },
            "castSelectionFilter": {
                "path": _display_path(cast_path),
                "sha256": cast_sha,
            },
            "canonicalEnglishImporter": {
                "path": _display_path(importer_path),
                "sha256": importer_sha,
            },
            "queueBuilder": {
                "path": _display_path(SCRIPT_PATH),
                "sha256": script_sha,
            },
            "canonicalEnglishRawRoot": _display_path(raw_root),
            "canonicalEnglishTeiCache": _display_path(confined_tei_cache),
            "pinnedCaptionCache": _display_path(caption_cache),
            "materializationOutputRoot": _display_path(confined_materialization_root),
            "sourceCachePopulationRequested": populate_source_cache,
        },
        "summary": {
            "dialogueCount": len(sources),
            "canonicalCharacterCount": len(known_ids),
            "selectedCharacterCount": len(selected_ids),
            "unresolvedCharacterCount": len(unresolved_ids),
            "pinnedVideoCount": sum(
                len(videos) for videos in videos_by_dialogue.values()
            ),
            "cachedAndHashedCaptionVideoCount": cached_caption_count,
            "cachedAndVerifiedCanonicalTeiDialogueCount": cached_tei_count,
            "missingInputCount": len(missing_inputs),
            "eligibleAttributedTurnCount": total_eligible_turns,
            "attemptedCanonicalWindowCount": total_windows,
            "discoveredCandidateCount": len(discovered_candidates),
            "crossCharacterConflictCandidateCount": conflict_count,
            "retainedCandidateCount": len(retained_candidates),
            "charactersWithCandidates": characters_with_candidates,
            "charactersWithoutCandidates": len(unresolved_ids)
            - characters_with_candidates,
        },
        "missingInputs": sorted(
            missing_inputs,
            key=lambda row: (row["dialogue"], row["kind"], row["path"]),
        ),
        "selectedCharactersExcluded": sorted(selected_ids),
        "dialogues": dialogue_rows,
        "characters": character_rows,
        "candidates": retained_candidates,
    }
    queue["queueSha256"] = sha256_bytes(canonical_json(queue))
    if sha256_file(SCRIPT_PATH) != script_sha:
        raise TurnAlignmentError("queue builder changed while the queue was built")
    return queue


def write_queue(path: Path, queue: dict[str, Any], *, artifact_root: Path) -> None:
    expected_sha = queue.get("queueSha256")
    unsigned = {key: value for key, value in queue.items() if key != "queueSha256"}
    if expected_sha != sha256_bytes(canonical_json(unsigned)):
        raise TurnAlignmentError("queueSha256 does not bind the queue payload")
    destination = _confined_path(artifact_root, path, label="queue output")
    if destination.exists() and not destination.is_file():
        raise TurnAlignmentError(f"queue output is not a regular file: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.name}.{os.getpid()}.tmp")
    try:
        temporary.write_text(
            json.dumps(queue, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--census", type=Path, default=DEFAULT_CENSUS)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--sources", type=Path, default=DEFAULT_SOURCES)
    parser.add_argument("--cast", type=Path, default=DEFAULT_CAST)
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--tei-cache", type=Path, default=DEFAULT_TEI_CACHE)
    parser.add_argument("--caption-cache", type=Path, default=DEFAULT_CAPTION_CACHE)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument(
        "--materialization-output-root",
        type=Path,
        default=DEFAULT_MATERIALIZATION_ROOT,
    )
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--populate-tei-cache",
        action="store_true",
        help="explicitly fetch missing pinned English TEI files and verify their hashes",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="atomically persist the queue under --artifact-root",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    queue = build_review_queue(
        census_path=args.census,
        characters_path=args.characters,
        sources_path=args.sources,
        cast_path=args.cast,
        raw_root=args.raw_root,
        tei_cache=args.tei_cache,
        caption_cache=args.caption_cache,
        artifact_root=args.artifact_root,
        materialization_root=args.materialization_output_root,
        populate_source_cache=args.populate_tei_cache,
    )
    if args.write:
        write_queue(args.output, queue, artifact_root=args.artifact_root)
    print(json.dumps(queue, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
