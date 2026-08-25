#!/usr/bin/env python3
"""Find a pinned YouTube reference interval from its automatic captions."""

from __future__ import annotations

import argparse
import difflib
import html
import json
import math
import os
import re
import shlex
import shutil
import subprocess
import tempfile
import unicodedata
import weakref
from collections import OrderedDict, defaultdict
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Sequence

from materialize_youtube_reference import (
    SAFE_ID,
    VIDEO_ID,
    ReferenceMaterializationError,
    build_reference_plan,
    load_catalog,
    materialize_reference,
    sha256_file,
)


CAPTION_LANGUAGE = "en-orig"
CAPTION_FORMAT = "json3"
MIN_QUERY_WORDS = 4
DEFAULT_MIN_CONFIDENCE = 0.78
DEFAULT_AMBIGUITY_MARGIN = 0.035
DEFAULT_PADDING_BEFORE_SECONDS = 0.12
DEFAULT_PADDING_AFTER_SECONDS = 0.18
MAX_TOKEN_TAIL_MS = 1_500
MIN_TOKEN_TAIL_MS = 80


class ReferenceSearchError(ValueError):
    """Raised when a safe, unique caption match cannot be established."""


@dataclass(frozen=True)
class PinnedVideo:
    dialogue: str
    video_id: str
    title: str
    duration_seconds: int
    url: str


@dataclass(frozen=True)
class CaptionPiece:
    text: str
    start_ms: int
    end_ms: int


@dataclass(frozen=True)
class CaptionToken:
    normalized: str
    piece_index: int
    start_ms: int
    end_ms: int


@dataclass(frozen=True)
class CaptionDocument:
    pieces: tuple[CaptionPiece, ...]
    tokens: tuple[CaptionToken, ...]


@dataclass(frozen=True)
class AlignmentCandidate:
    start_token: int
    end_token_exclusive: int
    start_seconds: float
    end_seconds: float
    caption_transcript: str
    normalized_caption_transcript: str
    confidence: float
    edit_distance: float
    exact_token_ratio: float


@dataclass(frozen=True)
class AlignmentResult:
    match: AlignmentCandidate
    nearest_distinct_alternative: AlignmentCandidate | None


@dataclass
class _CaptionTokenIndex:
    """Identity-bound token index used by repeated searches in one caption."""

    document: weakref.ReferenceType[CaptionDocument]
    normalized_tokens: tuple[str, ...]
    positions: dict[str, tuple[int, ...]]
    token_lengths: frozenset[int]
    unequal_cost_lower_bounds: dict[str, float]


# Alignment campaigns search the same parsed caption thousands of times.  Key
# this deliberately small cache by object identity: CaptionDocument is frozen,
# but hashing it would itself walk every caption token on every lookup.
_TOKEN_INDEX_CACHE_LIMIT = 8
_TOKEN_INDEX_CACHE: OrderedDict[int, _CaptionTokenIndex] = OrderedDict()


def _is_number(value: Any) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and math.isfinite(value)
    )


def normalize_words(text: str) -> tuple[str, ...]:
    """Normalize case, diacritics, punctuation, and whitespace into word tokens."""

    normalized = unicodedata.normalize("NFKD", html.unescape(text)).casefold()
    characters: list[str] = []
    for character in normalized:
        if unicodedata.category(character).startswith("M"):
            continue
        if character in {"'", "\u2019"}:
            continue
        category = unicodedata.category(character)
        characters.append(character if category[0] in {"L", "N"} else " ")
    return tuple(re.findall(r"[^\W_]+", "".join(characters), flags=re.UNICODE))


def resolve_pinned_video(
    catalog: dict[str, Any], *, dialogue: str, video_id: str | None = None
) -> PinnedVideo:
    if not SAFE_ID.fullmatch(dialogue):
        raise ReferenceSearchError("dialogue must be a canonical lowercase identifier")
    rows = [
        row for row in catalog.get("dialogues", []) if row.get("dialogue") == dialogue
    ]
    if len(rows) != 1:
        raise ReferenceSearchError(
            f"source catalog has no unique dialogue entry for {dialogue}"
        )
    videos = rows[0].get("videos")
    if not isinstance(videos, list) or not videos:
        raise ReferenceSearchError(f"source catalog has no videos for {dialogue}")
    if video_id is None:
        if len(videos) != 1:
            raise ReferenceSearchError(
                f"{dialogue} has multiple source videos; pass --video-id"
            )
        selected = videos[0]
    else:
        if not VIDEO_ID.fullmatch(video_id):
            raise ReferenceSearchError("video_id is invalid")
        matches = [row for row in videos if row.get("videoId") == video_id]
        if len(matches) != 1:
            raise ReferenceSearchError(f"video {video_id} is not pinned for {dialogue}")
        selected = matches[0]

    selected_id = selected.get("videoId")
    title = selected.get("title")
    duration = selected.get("durationSeconds")
    url = selected.get("url")
    if (
        not isinstance(selected_id, str)
        or not VIDEO_ID.fullmatch(selected_id)
        or not isinstance(title, str)
        or not isinstance(duration, int)
        or isinstance(duration, bool)
        or duration <= 0
        or url != f"https://www.youtube.com/watch?v={selected_id}"
    ):
        raise ReferenceSearchError(f"pinned video metadata is malformed for {dialogue}")
    return PinnedVideo(dialogue, selected_id, title, duration, url)


def caption_cache_path(cache_root: Path, video_id: str) -> Path:
    if not VIDEO_ID.fullmatch(video_id):
        raise ReferenceSearchError("video_id is invalid")
    return cache_root / f"{video_id}.{CAPTION_LANGUAGE}.{CAPTION_FORMAT}"


def _compact_transcript(pieces: Sequence[CaptionPiece]) -> str:
    return " ".join(
        " ".join(piece.text.split()) for piece in pieces if piece.text.split()
    ).strip()


def parse_json3_caption(path: Path) -> CaptionDocument:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ReferenceSearchError(
            f"cannot read JSON3 captions {path}: {error}"
        ) from error
    events = payload.get("events") if isinstance(payload, dict) else None
    if not isinstance(events, list):
        raise ReferenceSearchError(f"JSON3 captions have no events array: {path}")

    pending: list[tuple[str, int, int]] = []
    previous_piece_start = -1
    for event_index, event in enumerate(events):
        if not isinstance(event, dict):
            raise ReferenceSearchError(f"caption event {event_index} is not an object")
        segments = event.get("segs")
        if segments is None:
            continue
        if not isinstance(segments, list):
            raise ReferenceSearchError(
                f"caption event {event_index} has malformed segments"
            )
        event_start = event.get("tStartMs")
        event_duration = event.get("dDurationMs", 0)
        if (
            not _is_number(event_start)
            or event_start < 0
            or not _is_number(event_duration)
            or event_duration < 0
        ):
            raise ReferenceSearchError(
                f"caption event {event_index} has invalid timing"
            )
        event_end_ms = round(event_start + event_duration)
        for segment_index, segment in enumerate(segments):
            if not isinstance(segment, dict) or not isinstance(
                segment.get("utf8"), str
            ):
                raise ReferenceSearchError(
                    f"caption event {event_index} segment {segment_index} is malformed"
                )
            text = html.unescape(segment["utf8"]).replace("\u200b", "")
            if not normalize_words(text):
                continue
            offset = segment.get("tOffsetMs", 0)
            if not _is_number(offset) or offset < 0:
                raise ReferenceSearchError(
                    f"caption event {event_index} segment {segment_index} has invalid timing"
                )
            start_ms = round(event_start + offset)
            if start_ms < previous_piece_start:
                raise ReferenceSearchError(
                    f"caption word timing moves backwards at event {event_index} segment {segment_index}"
                )
            previous_piece_start = start_ms
            pending.append((text, start_ms, max(start_ms, event_end_ms)))

    if not pending:
        raise ReferenceSearchError(f"JSON3 captions contain no timed words: {path}")

    next_later_starts: list[int | None] = [None] * len(pending)
    run_start = 0
    while run_start < len(pending):
        run_end = run_start + 1
        while run_end < len(pending) and pending[run_end][1] == pending[run_start][1]:
            run_end += 1
        later_start = pending[run_end][1] if run_end < len(pending) else None
        for index in range(run_start, run_end):
            next_later_starts[index] = later_start
        run_start = run_end

    pieces: list[CaptionPiece] = []
    for index, (text, start_ms, event_end_ms) in enumerate(pending):
        later_start = next_later_starts[index]
        bounds = [start_ms + MAX_TOKEN_TAIL_MS]
        if event_end_ms > start_ms:
            bounds.append(event_end_ms)
        if later_start is not None:
            bounds.append(later_start)
        end_ms = max(start_ms + MIN_TOKEN_TAIL_MS, min(bounds))
        pieces.append(CaptionPiece(text=text, start_ms=start_ms, end_ms=end_ms))

    tokens: list[CaptionToken] = []
    for piece_index, piece in enumerate(pieces):
        for word in normalize_words(piece.text):
            tokens.append(
                CaptionToken(
                    normalized=word,
                    piece_index=piece_index,
                    start_ms=piece.start_ms,
                    end_ms=piece.end_ms,
                )
            )
    if not tokens:
        raise ReferenceSearchError(
            f"JSON3 captions contain no normalized words: {path}"
        )
    return CaptionDocument(tuple(pieces), tuple(tokens))


def ensure_caption(
    video: PinnedVideo, cache_root: Path, *, allow_download: bool = True
) -> Path:
    """Return a validated cached caption, fetching only the pinned URL when allowed."""

    destination = caption_cache_path(cache_root, video.video_id)
    if destination.exists():
        parse_json3_caption(destination)
        return destination
    if not allow_download:
        raise ReferenceSearchError(
            f"caption is not cached for offline search: {destination}"
        )

    cache_root.mkdir(parents=True, exist_ok=True)
    temporary_root = Path(
        tempfile.mkdtemp(prefix=f".{video.video_id}.", dir=cache_root)
    )
    try:
        output_template = temporary_root / f"{video.video_id}.%(ext)s"
        result = subprocess.run(
            [
                "yt-dlp",
                "--no-playlist",
                "--skip-download",
                "--write-auto-subs",
                "--sub-langs",
                CAPTION_LANGUAGE,
                "--sub-format",
                CAPTION_FORMAT,
                "--output",
                str(output_template),
                video.url,
            ],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip().splitlines()
            suffix = f": {detail[-1]}" if detail else ""
            raise ReferenceSearchError(
                f"yt-dlp could not fetch {CAPTION_LANGUAGE} captions{suffix}"
            )
        candidates = list(
            temporary_root.glob(f"{video.video_id}.{CAPTION_LANGUAGE}.{CAPTION_FORMAT}")
        )
        if len(candidates) != 1:
            raise ReferenceSearchError(
                f"pinned video {video.video_id} did not provide one {CAPTION_LANGUAGE} JSON3 caption"
            )
        parse_json3_caption(candidates[0])
        os.replace(candidates[0], destination)
        return destination
    finally:
        shutil.rmtree(temporary_root, ignore_errors=True)


@lru_cache(maxsize=16_384)
def _substitution_cost(query_token: str, caption_token: str) -> float:
    if query_token == caption_token:
        return 0.0
    ratio = difflib.SequenceMatcher(
        None, query_token, caption_token, autojunk=False
    ).ratio()
    return 1.0 - ratio if ratio >= 0.55 else 1.0


def _caption_token_index(document: CaptionDocument) -> _CaptionTokenIndex:
    """Return an O(1)-lookup token index without value-hashing the document."""

    key = id(document)
    cached = _TOKEN_INDEX_CACHE.get(key)
    if cached is not None and cached.document() is document:
        _TOKEN_INDEX_CACHE.move_to_end(key)
        return cached
    if cached is not None:
        # Guard against CPython reusing the id of an expired document.
        del _TOKEN_INDEX_CACHE[key]

    normalized_tokens = tuple(token.normalized for token in document.tokens)
    pending_positions: defaultdict[str, list[int]] = defaultdict(list)
    for position, token in enumerate(normalized_tokens):
        pending_positions[token].append(position)
    index = _CaptionTokenIndex(
        document=weakref.ref(document),
        normalized_tokens=normalized_tokens,
        positions={
            token: tuple(positions) for token, positions in pending_positions.items()
        },
        token_lengths=frozenset(len(token) for token in pending_positions),
        unequal_cost_lower_bounds={},
    )
    _TOKEN_INDEX_CACHE[key] = index
    _TOKEN_INDEX_CACHE.move_to_end(key)
    while len(_TOKEN_INDEX_CACHE) > _TOKEN_INDEX_CACHE_LIMIT:
        _TOKEN_INDEX_CACHE.popitem(last=False)
    return index


def _exact_occurrences(
    index: _CaptionTokenIndex, query_tokens: tuple[str, ...]
) -> tuple[int, ...]:
    """Find exact token-sequence occurrences through the rarest query token."""

    anchor = min(
        range(len(query_tokens)),
        key=lambda position: (
            len(index.positions.get(query_tokens[position], ())),
            position,
        ),
    )
    starts: list[int] = []
    for caption_position in index.positions.get(query_tokens[anchor], ()):
        start = caption_position - anchor
        end = start + len(query_tokens)
        if (
            start >= 0
            and end <= len(index.normalized_tokens)
            and index.normalized_tokens[start:end] == query_tokens
        ):
            starts.append(start)
    return tuple(starts)


def _unequal_substitution_cost_lower_bound(
    index: _CaptionTokenIndex, query_token: str
) -> float:
    """Bound every unequal token substitution using only possible lengths.

    SequenceMatcher cannot match more than the shorter token's character count;
    equal-length unequal strings cannot match more than ``length - 1``.  The
    resulting bound is intentionally conservative, but unlike a heuristic it
    is sufficient for proving that a near-duplicate must contain an exact token
    anchor before taking the indexed fast path.
    """

    cached = index.unequal_cost_lower_bounds.get(query_token)
    if cached is not None:
        return cached
    query_length = len(query_token)
    bounds: list[float] = []
    for caption_length in index.token_lengths:
        if caption_length == query_length:
            maximum_ratio = (
                (query_length - 1) / query_length if query_length > 1 else 0.0
            )
        else:
            maximum_ratio = (
                2.0
                * min(query_length, caption_length)
                / (query_length + caption_length)
            )
        bounds.append(1.0 - maximum_ratio if maximum_ratio >= 0.55 else 1.0)
    # Caption documents are required to contain at least one normalized token.
    lower_bound = min(bounds)
    index.unequal_cost_lower_bounds[query_token] = lower_bound
    return lower_bound


def _potential_ambiguous_span_lengths(
    query_length: int, ambiguity_margin: float
) -> tuple[int, ...]:
    """Return every span length whose length delta alone permits ambiguity."""

    if ambiguity_margin <= 0:
        return ()
    lower = max(1, math.floor(query_length * (1.0 - ambiguity_margin)) - 1)
    upper = math.ceil(query_length / (1.0 - ambiguity_margin)) + 1
    return tuple(
        span_length
        for span_length in range(lower, upper + 1)
        if abs(query_length - span_length)
        < ambiguity_margin * max(query_length, span_length)
    )


def _candidate_from_span(
    document: CaptionDocument,
    index: _CaptionTokenIndex,
    query_tokens: tuple[str, ...],
    *,
    start_token: int,
    end_token_exclusive: int,
    edit_distance: float,
) -> AlignmentCandidate:
    span = index.normalized_tokens[start_token:end_token_exclusive]
    first = document.tokens[start_token]
    last = document.tokens[end_token_exclusive - 1]
    matched_pieces = document.pieces[first.piece_index : last.piece_index + 1]
    return AlignmentCandidate(
        start_token=start_token,
        end_token_exclusive=end_token_exclusive,
        start_seconds=first.start_ms / 1000,
        end_seconds=last.end_ms / 1000,
        caption_transcript=_compact_transcript(matched_pieces),
        normalized_caption_transcript=" ".join(span),
        confidence=max(
            0.0,
            1.0
            - edit_distance
            / max(len(query_tokens), end_token_exclusive - start_token),
        ),
        edit_distance=edit_distance,
        exact_token_ratio=difflib.SequenceMatcher(
            None, query_tokens, span, autojunk=False
        ).ratio(),
    )


def _single_indel_distance(
    query_tokens: tuple[str, ...],
    caption_tokens: tuple[str, ...],
    *,
    cutoff: float = math.inf,
) -> float:
    """Return exact weighted distance whenever a sub-2 path is possible."""

    query_length = len(query_tokens)
    caption_length = len(caption_tokens)
    if caption_length == query_length:
        distance = 0.0
        for query_token, caption_token in zip(query_tokens, caption_tokens):
            distance += _substitution_cost(query_token, caption_token)
            if distance >= cutoff:
                return distance
        return distance
    if caption_length == query_length + 1:
        aligned_before = [
            _substitution_cost(query_tokens[index], caption_tokens[index])
            for index in range(query_length)
        ]
        aligned_after = [
            _substitution_cost(query_tokens[index], caption_tokens[index + 1])
            for index in range(query_length)
        ]
        prefix = [0.0]
        for cost in aligned_before:
            prefix.append(prefix[-1] + cost)
        suffix = [0.0] * (query_length + 1)
        for index in range(query_length - 1, -1, -1):
            suffix[index] = suffix[index + 1] + aligned_after[index]
        return 1.0 + min(
            prefix[skipped_caption] + suffix[skipped_caption]
            for skipped_caption in range(caption_length)
        )
    if caption_length + 1 == query_length:
        aligned_before = [
            _substitution_cost(query_tokens[index], caption_tokens[index])
            for index in range(caption_length)
        ]
        aligned_after = [
            _substitution_cost(query_tokens[index + 1], caption_tokens[index])
            for index in range(caption_length)
        ]
        prefix = [0.0]
        for cost in aligned_before:
            prefix.append(prefix[-1] + cost)
        suffix = [0.0] * (caption_length + 1)
        for index in range(caption_length - 1, -1, -1):
            suffix[index] = suffix[index + 1] + aligned_after[index]
        return 1.0 + min(
            prefix[skipped_query] + suffix[skipped_query]
            for skipped_query in range(query_length)
        )
    return math.inf


def _certifying_anchor_positions(
    index: _CaptionTokenIndex,
    query_tokens: tuple[str, ...],
    *,
    maximum_ambiguous_distance: float,
) -> tuple[int, ...] | None:
    """Select cheap anchors whose absence proves a match cannot be ambiguous."""

    ranked: list[tuple[float, int, float, int]] = []
    for query_position, query_token in enumerate(query_tokens):
        lower_bound = _unequal_substitution_cost_lower_bound(index, query_token)
        frequency = len(index.positions.get(query_token, ()))
        ranked.append(
            (frequency / lower_bound, frequency, -lower_bound, query_position)
        )
    selected: list[int] = []
    accumulated_bound = 0.0
    for _, _, negative_bound, query_position in sorted(ranked):
        selected.append(query_position)
        accumulated_bound += -negative_bound
        if accumulated_bound + 1e-12 >= maximum_ambiguous_distance:
            return tuple(selected)
    return None


def _try_certified_exact_alignment(
    document: CaptionDocument,
    query_tokens: tuple[str, ...],
    *,
    min_confidence: float,
    ambiguity_margin: float,
) -> AlignmentResult | None:
    """Accept a unique exact match only after ruling out near alternatives.

    The fast path is intentionally a proof, not a heuristic.  It is used only
    while every ambiguity-causing edit path costs less than two, so such a path
    contains at most one insertion or deletion.  Length-derived substitution
    lower bounds then prove that it must contain one of a small set of exact
    anchors.  The inverted token index enumerates every span containing those
    anchors; all other cases fall back to the full dynamic program.
    """

    index = _caption_token_index(document)
    exact_starts = _exact_occurrences(index, query_tokens)
    if not exact_starts:
        return None
    if len(exact_starts) > 1:
        first = _candidate_from_span(
            document,
            index,
            query_tokens,
            start_token=exact_starts[0],
            end_token_exclusive=exact_starts[0] + len(query_tokens),
            edit_distance=0.0,
        )
        second = _candidate_from_span(
            document,
            index,
            query_tokens,
            start_token=exact_starts[1],
            end_token_exclusive=exact_starts[1] + len(query_tokens),
            edit_distance=0.0,
        )
        raise ReferenceSearchError(
            f"ambiguous caption match: 1.000 at "
            f"{first.start_seconds:.3f}-{first.end_seconds:.3f}s and "
            f"1.000 at {second.start_seconds:.3f}-{second.end_seconds:.3f}s"
        )

    span_lengths = _potential_ambiguous_span_lengths(
        len(query_tokens), ambiguity_margin
    )
    if not span_lengths:
        return None
    maximum_ambiguous_distance = max(
        ambiguity_margin * max(len(query_tokens), span_length)
        for span_length in span_lengths
    )
    if maximum_ambiguous_distance >= 2.0:
        return None
    if any(abs(len(query_tokens) - span_length) > 1 for span_length in span_lengths):
        return None
    anchors = _certifying_anchor_positions(
        index,
        query_tokens,
        maximum_ambiguous_distance=maximum_ambiguous_distance,
    )
    if anchors is None:
        return None

    exact_start = exact_starts[0]
    exact = _candidate_from_span(
        document,
        index,
        query_tokens,
        start_token=exact_start,
        end_token_exclusive=exact_start + len(query_tokens),
        edit_distance=0.0,
    )
    possible_spans: set[tuple[int, int]] = set()
    for query_position in anchors:
        for caption_position in index.positions.get(
            query_tokens[query_position], ()
        ):
            for span_length in span_lengths:
                if span_length == len(query_tokens):
                    starts = (caption_position - query_position,)
                elif span_length == len(query_tokens) + 1:
                    starts = (
                        caption_position - query_position,
                        caption_position - query_position - 1,
                    )
                else:
                    starts = (
                        caption_position - query_position,
                        caption_position - query_position + 1,
                    )
                for start in starts:
                    if 0 <= start and start + span_length <= len(index.normalized_tokens):
                        possible_spans.add((start, start + span_length))

    ambiguous: list[AlignmentCandidate] = []
    for start, end in possible_spans:
        if start == exact.start_token and end == exact.end_token_exclusive:
            continue
        overlap = max(
            0,
            min(end, exact.end_token_exclusive) - max(start, exact.start_token),
        )
        if overlap / min(end - start, len(query_tokens)) >= 0.5:
            continue
        distance = _single_indel_distance(
            query_tokens,
            index.normalized_tokens[start:end],
            cutoff=ambiguity_margin * max(len(query_tokens), end - start),
        )
        confidence = max(
            0.0, 1.0 - distance / max(len(query_tokens), end - start)
        )
        if (
            confidence >= min_confidence
            and exact.confidence - confidence < ambiguity_margin
        ):
            ambiguous.append(
                _candidate_from_span(
                    document,
                    index,
                    query_tokens,
                    start_token=start,
                    end_token_exclusive=end,
                    edit_distance=distance,
                )
            )
    if ambiguous:
        alternative = min(
            ambiguous,
            key=lambda candidate: (
                -candidate.confidence,
                -candidate.exact_token_ratio,
                candidate.start_token,
                candidate.end_token_exclusive,
            ),
        )
        raise ReferenceSearchError(
            f"ambiguous caption match: {exact.confidence:.3f} at "
            f"{exact.start_seconds:.3f}-{exact.end_seconds:.3f}s and "
            f"{alternative.confidence:.3f} at "
            f"{alternative.start_seconds:.3f}-{alternative.end_seconds:.3f}s"
        )
    return AlignmentResult(exact, None)


def _align_unique_exact_only(
    document: CaptionDocument, query_tokens: tuple[str, ...]
) -> AlignmentResult:
    """Align one exact occurrence without invoking fuzzy dynamic programming."""

    index = _caption_token_index(document)
    exact_starts = _exact_occurrences(index, query_tokens)
    if not exact_starts:
        raise ReferenceSearchError("captions contain no exact token-sequence match")
    if len(exact_starts) > 1:
        first = _candidate_from_span(
            document,
            index,
            query_tokens,
            start_token=exact_starts[0],
            end_token_exclusive=exact_starts[0] + len(query_tokens),
            edit_distance=0.0,
        )
        second = _candidate_from_span(
            document,
            index,
            query_tokens,
            start_token=exact_starts[1],
            end_token_exclusive=exact_starts[1] + len(query_tokens),
            edit_distance=0.0,
        )
        raise ReferenceSearchError(
            f"ambiguous exact caption match: 1.000 at "
            f"{first.start_seconds:.3f}-{first.end_seconds:.3f}s and "
            f"1.000 at {second.start_seconds:.3f}-{second.end_seconds:.3f}s"
        )
    start = exact_starts[0]
    return AlignmentResult(
        _candidate_from_span(
            document,
            index,
            query_tokens,
            start_token=start,
            end_token_exclusive=start + len(query_tokens),
            edit_distance=0.0,
        ),
        None,
    )


def _choice_key(
    option: tuple[float, int], *, end: int, query_prefix_length: int
) -> tuple[float, int, int]:
    cost, start = option
    return (round(cost, 12), abs((end - start) - query_prefix_length), start)


def _alignment_candidates(
    document: CaptionDocument, query_tokens: tuple[str, ...]
) -> list[AlignmentCandidate]:
    caption_tokens = tuple(token.normalized for token in document.tokens)
    token_count = len(caption_tokens)
    previous_cost = [0.0] * (token_count + 1)
    previous_start = list(range(token_count + 1))

    for query_index, query_token in enumerate(query_tokens, start=1):
        current_cost = [float(query_index)] + [0.0] * token_count
        current_start = [0] * (token_count + 1)
        for caption_index, caption_token in enumerate(caption_tokens, start=1):
            options = (
                (previous_cost[caption_index] + 1.0, previous_start[caption_index]),
                (
                    current_cost[caption_index - 1] + 1.0,
                    current_start[caption_index - 1],
                ),
                (
                    previous_cost[caption_index - 1]
                    + _substitution_cost(query_token, caption_token),
                    previous_start[caption_index - 1],
                ),
            )
            cost, start = min(
                options,
                key=lambda option: _choice_key(
                    option, end=caption_index, query_prefix_length=query_index
                ),
            )
            current_cost[caption_index] = cost
            current_start[caption_index] = start
        previous_cost, previous_start = current_cost, current_start

    candidates: list[AlignmentCandidate] = []
    for end_token in range(1, token_count + 1):
        start_token = previous_start[end_token]
        span_length = end_token - start_token
        if span_length <= 0:
            continue
        distance = previous_cost[end_token]
        confidence = max(0.0, 1.0 - distance / max(len(query_tokens), span_length))
        first = document.tokens[start_token]
        last = document.tokens[end_token - 1]
        matched_pieces = document.pieces[first.piece_index : last.piece_index + 1]
        transcript = _compact_transcript(matched_pieces)
        normalized_transcript = " ".join(
            token.normalized for token in document.tokens[start_token:end_token]
        )
        exact_ratio = difflib.SequenceMatcher(
            None,
            query_tokens,
            caption_tokens[start_token:end_token],
            autojunk=False,
        ).ratio()
        candidates.append(
            AlignmentCandidate(
                start_token=start_token,
                end_token_exclusive=end_token,
                start_seconds=first.start_ms / 1000,
                end_seconds=last.end_ms / 1000,
                caption_transcript=transcript,
                normalized_caption_transcript=normalized_transcript,
                confidence=confidence,
                edit_distance=distance,
                exact_token_ratio=exact_ratio,
            )
        )
    return candidates


def _overlap_ratio(left: AlignmentCandidate, right: AlignmentCandidate) -> float:
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


def align_caption_phrase(
    document: CaptionDocument,
    phrase: str,
    *,
    min_confidence: float = DEFAULT_MIN_CONFIDENCE,
    ambiguity_margin: float = DEFAULT_AMBIGUITY_MARGIN,
    exact_only: bool = False,
) -> AlignmentResult:
    query_tokens = normalize_words(phrase)
    if len(query_tokens) < MIN_QUERY_WORDS:
        raise ReferenceSearchError(
            f"phrase must contain at least {MIN_QUERY_WORDS} normalized words; got {len(query_tokens)}"
        )
    if not 0 < min_confidence <= 1:
        raise ReferenceSearchError(
            "min_confidence must be greater than zero and at most one"
        )
    if not 0 <= ambiguity_margin < 1:
        raise ReferenceSearchError(
            "ambiguity_margin must be non-negative and less than one"
        )
    if not isinstance(exact_only, bool):
        raise ReferenceSearchError("exact_only must be a boolean")

    if exact_only:
        return _align_unique_exact_only(document, query_tokens)

    certified_exact = _try_certified_exact_alignment(
        document,
        query_tokens,
        min_confidence=min_confidence,
        ambiguity_margin=ambiguity_margin,
    )
    if certified_exact is not None:
        return certified_exact

    ordered = sorted(
        _alignment_candidates(document, query_tokens),
        key=lambda candidate: (
            -candidate.confidence,
            -candidate.exact_token_ratio,
            candidate.start_token,
            candidate.end_token_exclusive,
        ),
    )
    distinct: list[AlignmentCandidate] = []
    for candidate in ordered:
        if all(_overlap_ratio(candidate, accepted) < 0.5 for accepted in distinct):
            distinct.append(candidate)
        if len(distinct) >= 8:
            break
    if not distinct:
        raise ReferenceSearchError("captions contain no alignment candidate")
    best = distinct[0]
    if best.confidence < min_confidence:
        raise ReferenceSearchError(
            f"weak caption match: confidence {best.confidence:.3f} is below {min_confidence:.3f} "
            f"at {best.start_seconds:.3f}-{best.end_seconds:.3f}s"
        )
    alternative = distinct[1] if len(distinct) > 1 else None
    if (
        alternative is not None
        and alternative.confidence >= min_confidence
        and best.confidence - alternative.confidence < ambiguity_margin
    ):
        raise ReferenceSearchError(
            f"ambiguous caption match: {best.confidence:.3f} at "
            f"{best.start_seconds:.3f}-{best.end_seconds:.3f}s and "
            f"{alternative.confidence:.3f} at "
            f"{alternative.start_seconds:.3f}-{alternative.end_seconds:.3f}s"
        )
    return AlignmentResult(best, alternative)


def _rounded_seconds(value: float) -> float:
    return round(value + 1e-10, 3)


def write_candidate_result(path: Path, result: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        temporary.write_text(
            json.dumps(result, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def _materializer_arguments(
    *,
    catalog_path: Path,
    dialogue: str,
    character_id: str,
    video_id: str,
    start_seconds: float,
    end_seconds: float,
    prompt_text: str,
    output_root: Path,
) -> list[str]:
    return [
        "uv",
        "run",
        "python",
        "scripts/audio/materialize_youtube_reference.py",
        "--catalog",
        str(catalog_path),
        "--dialogue",
        dialogue,
        "--character-id",
        character_id,
        "--video-id",
        video_id,
        "--start",
        f"{start_seconds:.3f}",
        "--end",
        f"{end_seconds:.3f}",
        "--prompt-text",
        prompt_text,
        "--output-root",
        str(output_root),
        "--materialize",
    ]


def find_reference(
    *,
    catalog_path: Path,
    dialogue: str,
    phrase: str,
    caption_cache: Path,
    video_id: str | None = None,
    character_id: str | None = None,
    output_root: Path = Path("scratch/audio-references"),
    allow_caption_download: bool = True,
    min_confidence: float = DEFAULT_MIN_CONFIDENCE,
    ambiguity_margin: float = DEFAULT_AMBIGUITY_MARGIN,
    padding_before_seconds: float = DEFAULT_PADDING_BEFORE_SECONDS,
    padding_after_seconds: float = DEFAULT_PADDING_AFTER_SECONDS,
) -> tuple[dict[str, Any], list[str] | None]:
    if not _is_number(padding_before_seconds) or padding_before_seconds < 0:
        raise ReferenceSearchError(
            "padding_before_seconds must be finite and non-negative"
        )
    if not _is_number(padding_after_seconds) or padding_after_seconds < 0:
        raise ReferenceSearchError(
            "padding_after_seconds must be finite and non-negative"
        )
    if character_id is not None and not SAFE_ID.fullmatch(character_id):
        raise ReferenceSearchError(
            "character_id must be a canonical lowercase identifier"
        )

    catalog = load_catalog(catalog_path)
    video = resolve_pinned_video(catalog, dialogue=dialogue, video_id=video_id)
    caption_path = ensure_caption(
        video, caption_cache, allow_download=allow_caption_download
    )
    document = parse_json3_caption(caption_path)
    alignment = align_caption_phrase(
        document,
        phrase,
        min_confidence=min_confidence,
        ambiguity_margin=ambiguity_margin,
    )
    match = alignment.match
    previous_token_end = (
        document.tokens[match.start_token - 1].end_ms / 1000
        if match.start_token > 0
        else 0.0
    )
    next_token_start = (
        document.tokens[match.end_token_exclusive].start_ms / 1000
        if match.end_token_exclusive < len(document.tokens)
        else float(video.duration_seconds)
    )
    # Padding is useful only when captions expose a gap. Crossing an adjacent
    # token would make the exact prompt transcript false, so clamp to the safe
    # caption boundaries rather than silently including another spoken word.
    clip_start = _rounded_seconds(
        max(previous_token_end, match.start_seconds - padding_before_seconds, 0.0)
    )
    clip_end = _rounded_seconds(
        min(
            next_token_start,
            match.end_seconds + padding_after_seconds,
            video.duration_seconds,
        )
    )
    clip_duration = _rounded_seconds(clip_end - clip_start)
    applied_padding_before = _rounded_seconds(match.start_seconds - clip_start)
    applied_padding_after = _rounded_seconds(clip_end - match.end_seconds)

    materializer_arguments: list[str] | None = None
    materializer_error: str | None = None
    if character_id is not None:
        try:
            build_reference_plan(
                catalog,
                dialogue=dialogue,
                character_id=character_id,
                video_id=video.video_id,
                start_seconds=clip_start,
                end_seconds=clip_end,
                prompt_text=match.caption_transcript,
                output_root=output_root,
            )
            materializer_arguments = _materializer_arguments(
                catalog_path=catalog_path,
                dialogue=dialogue,
                character_id=character_id,
                video_id=video.video_id,
                start_seconds=clip_start,
                end_seconds=clip_end,
                prompt_text=match.caption_transcript,
                output_root=output_root,
            )
        except ReferenceMaterializationError as error:
            materializer_error = str(error)

    alternative = alignment.nearest_distinct_alternative
    result: dict[str, Any] = {
        "schemaVersion": 1,
        "status": "candidate-not-selected",
        "source": {
            "dialogue": video.dialogue,
            "videoId": video.video_id,
            "title": video.title,
            "durationSeconds": video.duration_seconds,
            "url": video.url,
        },
        "caption": {
            "language": CAPTION_LANGUAGE,
            "format": CAPTION_FORMAT,
            "path": str(caption_path),
            "sha256": sha256_file(caption_path),
        },
        "query": {
            "phrase": " ".join(phrase.split()),
            "normalized": " ".join(normalize_words(phrase)),
            "wordCount": len(normalize_words(phrase)),
        },
        "match": {
            "startSeconds": _rounded_seconds(match.start_seconds),
            "endSeconds": _rounded_seconds(match.end_seconds),
            "durationSeconds": _rounded_seconds(
                match.end_seconds - match.start_seconds
            ),
            "captionTranscript": match.caption_transcript,
            "normalizedCaptionTranscript": match.normalized_caption_transcript,
            "confidence": round(match.confidence, 6),
            "editDistance": round(match.edit_distance, 6),
            "exactTokenRatio": round(match.exact_token_ratio, 6),
            "tokenSpan": {
                "start": match.start_token,
                "endExclusive": match.end_token_exclusive,
            },
        },
        "nearestDistinctAlternative": (
            None
            if alternative is None
            else {
                "startSeconds": _rounded_seconds(alternative.start_seconds),
                "endSeconds": _rounded_seconds(alternative.end_seconds),
                "confidence": round(alternative.confidence, 6),
            }
        ),
        "clip": {
            "startSeconds": clip_start,
            "endSeconds": clip_end,
            "durationSeconds": clip_duration,
            "requestedPaddingBeforeSeconds": padding_before_seconds,
            "requestedPaddingAfterSeconds": padding_after_seconds,
            "appliedPaddingBeforeSeconds": applied_padding_before,
            "appliedPaddingAfterSeconds": applied_padding_after,
        },
        "materializerCommand": (
            shlex.join(materializer_arguments)
            if materializer_arguments is not None
            else None
        ),
        "materializerError": materializer_error,
        "reviewRequired": (
            "Automatic captions locate words, not speakers. Confirm that the complete clip contains only "
            "the intended character and that its prompt transcribes every audible word before a Dots "
            "audition or cast selection."
        ),
    }
    return result, materializer_arguments


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--catalog", type=Path, default=Path("audio/reference-sources.json")
    )
    parser.add_argument("--dialogue", required=True)
    parser.add_argument("--phrase", required=True)
    parser.add_argument("--video-id")
    parser.add_argument("--character-id")
    parser.add_argument(
        "--caption-cache",
        type=Path,
        default=Path("scratch/audio-references/caption-cache"),
    )
    parser.add_argument(
        "--output-root", type=Path, default=Path("scratch/audio-references")
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="refuse network access if captions are not cached",
    )
    parser.add_argument("--min-confidence", type=float, default=DEFAULT_MIN_CONFIDENCE)
    parser.add_argument(
        "--ambiguity-margin", type=float, default=DEFAULT_AMBIGUITY_MARGIN
    )
    parser.add_argument(
        "--padding-before", type=float, default=DEFAULT_PADDING_BEFORE_SECONDS
    )
    parser.add_argument(
        "--padding-after", type=float, default=DEFAULT_PADDING_AFTER_SECONDS
    )
    parser.add_argument("--command-only", action="store_true")
    parser.add_argument("--materialize", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if (args.command_only or args.materialize) and args.character_id is None:
        raise ReferenceSearchError(
            "--command-only and --materialize require --character-id"
        )
    if args.command_only and args.materialize:
        raise ReferenceSearchError(
            "--command-only and --materialize are mutually exclusive"
        )
    result, command = find_reference(
        catalog_path=args.catalog,
        dialogue=args.dialogue,
        phrase=args.phrase,
        caption_cache=args.caption_cache,
        video_id=args.video_id,
        character_id=args.character_id,
        output_root=args.output_root,
        allow_caption_download=not args.offline,
        min_confidence=args.min_confidence,
        ambiguity_margin=args.ambiguity_margin,
        padding_before_seconds=args.padding_before,
        padding_after_seconds=args.padding_after,
    )
    if args.command_only:
        if command is None:
            raise ReferenceSearchError(
                result["materializerError"] or "match is not materializable"
            )
        print(shlex.join(command))
        return 0
    if args.materialize:
        if command is None:
            raise ReferenceSearchError(
                result["materializerError"] or "match is not materializable"
            )
        catalog = load_catalog(args.catalog)
        plan = build_reference_plan(
            catalog,
            dialogue=args.dialogue,
            character_id=args.character_id,
            video_id=result["source"]["videoId"],
            start_seconds=result["clip"]["startSeconds"],
            end_seconds=result["clip"]["endSeconds"],
            prompt_text=result["match"]["captionTranscript"],
            output_root=args.output_root,
        )
        result["materialization"] = materialize_reference(plan)
        candidate_path = Path(plan.sidecar_path).with_suffix(".candidate.json")
        result["candidateSearchPath"] = str(candidate_path)
        write_candidate_result(candidate_path, result)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
