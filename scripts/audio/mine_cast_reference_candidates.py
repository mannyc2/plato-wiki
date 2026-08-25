#!/usr/bin/env python3
"""Mine auditable cast-reference candidates from cached pinned captions."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shlex
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

from find_youtube_reference import (
    DEFAULT_AMBIGUITY_MARGIN,
    DEFAULT_MIN_CONFIDENCE,
    CaptionDocument,
    PinnedVideo,
    ReferenceSearchError,
    align_caption_phrase,
    caption_cache_path,
    ensure_caption,
    normalize_words,
    parse_json3_caption,
)
from materialize_youtube_reference import (
    MAX_CLIP_SECONDS,
    MIN_CLIP_SECONDS,
    SAFE_ID,
    VIDEO_ID,
    ReferenceMaterializationError,
    build_reference_plan,
    canonical_json,
    load_catalog,
    sha256_file,
)


CUE_VERBS = frozenset(
    {
        "added",
        "answered",
        "asked",
        "continued",
        "cried",
        "declared",
        "exclaimed",
        "interposed",
        "observed",
        "proceeded",
        "rejoined",
        "remarked",
        "replied",
        "responded",
        "said",
    }
)
CUE_PREFIXES = frozenset({"hereupon", "then", "thereupon"})
SUBJECT_PRONOUNS = frozenset({"he", "i", "she", "they", "we", "you"})
DEFAULT_MAX_CANDIDATES_PER_CHARACTER = 5
CUE_PLACEMENTS = frozenset({"preposed", "postposed", "medial"})
SPEAKER_SPAN_DIRECTIONS = frozenset({"before-cue", "after-cue"})
VALID_BOUNDARY_ASSERTIONS = frozenset(
    {
        ("preposed", "after-cue"),
        ("postposed", "before-cue"),
        ("medial", "before-cue"),
        ("medial", "after-cue"),
    }
)
PERFORMANCE_ROLES = frozenset({"voice-owner", "reported-only", "review-required"})
CAST_ENGINE_POLICY = {
    "defaultEngine": "dots.tts-soar",
    "exceptionsRequireRecordedQaFailure": True,
    "implicitFallbackVoice": False,
    "voiceOwnership": "one-voice-per-character",
    "reportedSpeech": "inherit-active-character",
    "acceptancePolicy": "operator-authorized-deterministic-v1",
    "manualListeningRequired": False,
    "acceptanceGates": {
        "referenceDuration": {
            "minimumSeconds": 3,
            "maximumSeconds": 15,
            "maximumIntervalDeltaSeconds": 0.05,
        },
        "speakerPurity": {
            "minimumDominantCoverage": 0.95,
            "maximumCompetingCoverage": 0.02,
            "maximumUncoveredCoverage": 0.03,
        },
        "asrFidelity": {
            "minimumReferenceExpectedWords": 8,
            "maximumReferenceOrdinaryWordErrors": 0,
            "maximumReferenceOrdinaryWordErrorRate": 0,
            "referenceFailureAdjudication": "exact-source-agreement-plus-pinned-independent-large-v3-zero-v1",
            "minimumExpectedWords": 40,
            "maximumOrdinaryWordErrors": 0,
            "maximumOrdinaryWordErrorRate": 0,
        },
        "acousticConsistency": {
            "minimumMeanCosineSimilarity": 0.85,
            "minimumWindowCosineSimilarity": 0.8,
        },
        "signalSafety": {
            "maximumClippedSamples": 0,
            "maximumTruePeakDbtp": 0,
            "maximumPeakAmplitude": 0.9999,
        },
        "auditionDuration": {
            "minimumSeconds": 8,
            "maximumSeconds": 60,
            "minimumWordsPerSecond": 1.5,
            "maximumWordsPerSecond": 4.5,
        },
    },
}


class CandidateMiningError(ValueError):
    """Raised when batch-miner inputs are malformed or inconsistent."""


@dataclass(frozen=True)
class CharacterAppearance:
    dialogue: str
    aliases: tuple[str, ...]
    role_flags: tuple[str, ...]
    performance_role: str


@dataclass(frozen=True)
class CharacterRecord:
    character_id: str
    display_name: str
    aliases: tuple[str, ...]
    appearances: tuple[CharacterAppearance, ...]


@dataclass(frozen=True)
class PhraseRequest:
    character_id: str
    dialogue: str
    phrase: str
    video_id: str | None
    cue_placement: str
    speaker_span_direction: str


@dataclass(frozen=True)
class NarratorCue:
    character_id: str
    alias: str
    verb: str
    pattern: str
    priority: int
    confidence: float
    start_token: int
    end_token_exclusive: int
    transcript: str


@dataclass(frozen=True)
class CueScan:
    cues: tuple[NarratorCue, ...]
    ambiguous_aliases_by_character: dict[str, tuple[str, ...]]
    suppressed_overlap_counts: dict[str, int]


def _read_json(path: Path, *, kind: str) -> tuple[Any, str]:
    try:
        raw = path.read_bytes()
        value = json.loads(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise CandidateMiningError(f"cannot read {kind} {path}: {error}") from error
    return value, hashlib.sha256(raw).hexdigest()


def _unique_strings(values: Iterable[Any], *, context: str) -> tuple[str, ...]:
    result: set[str] = set()
    for value in values:
        if not isinstance(value, str) or not value.strip():
            raise CandidateMiningError(
                f"{context} contains a blank or non-string alias"
            )
        result.add(" ".join(value.split()))
    return tuple(sorted(result, key=lambda value: (normalize_words(value), value)))


def load_characters(path: Path) -> tuple[tuple[CharacterRecord, ...], str]:
    payload, digest = _read_json(path, kind="character registry")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 3
        or payload.get("status") not in {"partial", "complete"}
        or not isinstance(payload.get("characters"), list)
    ):
        raise CandidateMiningError(f"unsupported character registry {path}")

    records: list[CharacterRecord] = []
    seen_ids: set[str] = set()
    for index, row in enumerate(payload["characters"]):
        if not isinstance(row, dict):
            raise CandidateMiningError(f"character {index} is not an object")
        character_id = row.get("characterId")
        display_name = row.get("displayName")
        appearances = row.get("appearances")
        raw_aliases = row.get("aliases")
        if (
            not isinstance(character_id, str)
            or not SAFE_ID.fullmatch(character_id)
            or character_id in seen_ids
            or not isinstance(display_name, str)
            or not display_name.strip()
            or row.get("identityStatus") != "resolved"
            or not isinstance(raw_aliases, list)
            or not isinstance(appearances, list)
            or not appearances
        ):
            raise CandidateMiningError(f"character {index} is incomplete or duplicated")
        seen_ids.add(character_id)
        aliases = _unique_strings(
            [display_name, *raw_aliases],
            context=f"character {character_id}",
        )
        parsed_appearances: list[CharacterAppearance] = []
        seen_dialogues: set[str] = set()
        for appearance_index, appearance in enumerate(appearances):
            if not isinstance(appearance, dict):
                raise CandidateMiningError(
                    f"character {character_id} appearance {appearance_index} is not an object"
                )
            dialogue = appearance.get("dialogue")
            if (
                not isinstance(dialogue, str)
                or not SAFE_ID.fullmatch(dialogue)
                or dialogue in seen_dialogues
                or appearance.get("editorialStatus") not in {"required", "resolved"}
            ):
                raise CandidateMiningError(
                    f"character {character_id} has an invalid or duplicate appearance"
                )
            seen_dialogues.add(dialogue)
            source_labels = appearance.get("sourceLabels")
            source_aliases = appearance.get("sourceAliases")
            source_attributions = appearance.get("sourceAttributions")
            role_flags = appearance.get("roleFlags")
            performance_role = appearance.get("performanceRole")
            editorial_note = appearance.get("editorialNote")
            if (
                not isinstance(source_labels, list)
                or not isinstance(source_aliases, list)
                or not isinstance(source_attributions, list)
            ):
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} has malformed aliases"
                )
            allowed_role_flags = {
                "source-speaker",
                "commentary-narrator",
                "dream-figure",
                "reported-speaker",
                "collective",
                "personification",
            }
            if (
                not isinstance(role_flags, list)
                or not role_flags
                or len(set(role_flags)) != len(role_flags)
                or any(flag not in allowed_role_flags for flag in role_flags)
            ):
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} has invalid roleFlags"
                )
            if performance_role not in PERFORMANCE_ROLES:
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} "
                    "has invalid performanceRole"
                )
            has_source_evidence = bool(
                source_labels or source_aliases or source_attributions
            )
            has_source_speaker = "source-speaker" in role_flags
            has_non_source_role = any(flag != "source-speaker" for flag in role_flags)
            has_editorial_note = isinstance(editorial_note, str) and bool(
                editorial_note.strip()
            )
            if (
                ("editorialNote" in appearance and not has_editorial_note)
                or has_source_speaker != has_source_evidence
                or has_non_source_role != has_editorial_note
            ):
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} has invalid role evidence"
                )
            if (
                "dream-figure" in role_flags or "personification" in role_flags
            ) and "reported-speaker" not in role_flags:
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} has invalid roleFlags"
                )
            if "commentary-narrator" in role_flags and len(role_flags) != 1:
                raise CandidateMiningError(
                    f"character {character_id} appearance {dialogue} has invalid roleFlags"
                )
            appearance_aliases = _unique_strings(
                [
                    *aliases,
                    *source_labels,
                    *source_aliases,
                ],
                context=f"character {character_id} appearance {dialogue}",
            )
            parsed_appearances.append(
                CharacterAppearance(
                    dialogue,
                    appearance_aliases,
                    tuple(role_flags),
                    performance_role,
                )
            )
        records.append(
            CharacterRecord(
                character_id=character_id,
                display_name=" ".join(display_name.split()),
                aliases=aliases,
                appearances=tuple(
                    sorted(parsed_appearances, key=lambda item: item.dialogue)
                ),
            )
        )
    return tuple(sorted(records, key=lambda item: item.character_id)), digest


def load_selected_character_ids(
    path: Path, known_ids: set[str]
) -> tuple[set[str], str]:
    payload, digest = _read_json(path, kind="cast registry")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 3
        or payload.get("status") not in {"partial", "complete"}
        or payload.get("enginePolicy") != CAST_ENGINE_POLICY
        or not isinstance(payload.get("voices"), list)
    ):
        raise CandidateMiningError(f"unsupported cast registry {path}")
    selected: set[str] = set()
    for index, voice in enumerate(payload["voices"]):
        if not isinstance(voice, dict) or not isinstance(voice.get("characterId"), str):
            raise CandidateMiningError(f"cast voice {index} is malformed")
        character_id = voice["characterId"]
        if character_id not in known_ids:
            raise CandidateMiningError(
                f"cast voice names unknown character {character_id}"
            )
        if voice.get("status") == "selected":
            if character_id in selected:
                raise CandidateMiningError(
                    f"cast selects {character_id} more than once"
                )
            selected.add(character_id)
    return selected, digest


def _catalog_videos(catalog: dict[str, Any]) -> dict[str, tuple[PinnedVideo, ...]]:
    result: dict[str, tuple[PinnedVideo, ...]] = {}
    seen_video_ids: set[str] = set()
    dialogues = catalog.get("dialogues")
    if not isinstance(dialogues, list):
        raise CandidateMiningError("reference source catalog has no dialogues")
    for row in dialogues:
        if not isinstance(row, dict) or not isinstance(row.get("dialogue"), str):
            raise CandidateMiningError(
                "reference source catalog has a malformed dialogue"
            )
        dialogue = row["dialogue"]
        videos = row.get("videos")
        if (
            not SAFE_ID.fullmatch(dialogue)
            or dialogue in result
            or not isinstance(videos, list)
            or not videos
        ):
            raise CandidateMiningError(
                f"reference source entry is malformed for {dialogue}"
            )
        parsed: list[PinnedVideo] = []
        for video in videos:
            if not isinstance(video, dict):
                raise CandidateMiningError(
                    f"reference video is malformed for {dialogue}"
                )
            video_id = video.get("videoId")
            title = video.get("title")
            duration = video.get("durationSeconds")
            url = video.get("url")
            if (
                not isinstance(video_id, str)
                or not VIDEO_ID.fullmatch(video_id)
                or not isinstance(title, str)
                or not isinstance(duration, int)
                or isinstance(duration, bool)
                or duration <= 0
                or video_id in seen_video_ids
                or url != f"https://www.youtube.com/watch?v={video_id}"
            ):
                raise CandidateMiningError(
                    f"reference video is malformed for {dialogue}"
                )
            seen_video_ids.add(video_id)
            parsed.append(PinnedVideo(dialogue, video_id, title, duration, url))
        result[dialogue] = tuple(sorted(parsed, key=lambda item: item.video_id))
    return result


def load_phrase_queue(
    path: Path | None,
    *,
    characters: dict[str, CharacterRecord],
    videos_by_dialogue: dict[str, tuple[PinnedVideo, ...]],
) -> tuple[tuple[PhraseRequest, ...], str | None]:
    if path is None:
        return (), None
    payload, digest = _read_json(path, kind="phrase queue")
    if (
        not isinstance(payload, dict)
        or payload.get("schemaVersion") != 1
        or not isinstance(payload.get("phrases"), list)
        or set(payload) != {"schemaVersion", "phrases"}
    ):
        raise CandidateMiningError(f"unsupported phrase queue {path}")
    requests: list[PhraseRequest] = []
    seen: set[tuple[str, str, str | None, tuple[str, ...], str, str]] = set()
    for index, row in enumerate(payload["phrases"]):
        required = {
            "characterId",
            "dialogue",
            "phrase",
            "cuePlacement",
            "speakerSpanDirection",
        }
        allowed = {*required, "videoId"}
        if (
            not isinstance(row, dict)
            or not required.issubset(row)
            or not set(row).issubset(allowed)
        ):
            raise CandidateMiningError(f"phrase queue entry {index} is malformed")
        character_id = row.get("characterId")
        dialogue = row.get("dialogue")
        phrase = row.get("phrase")
        video_id = row.get("videoId")
        cue_placement = row.get("cuePlacement")
        speaker_span_direction = row.get("speakerSpanDirection")
        if (
            not isinstance(character_id, str)
            or character_id not in characters
            or not isinstance(dialogue, str)
            or not isinstance(phrase, str)
            or len(normalize_words(phrase)) < 4
            or (
                video_id is not None
                and (not isinstance(video_id, str) or not VIDEO_ID.fullmatch(video_id))
            )
            or not isinstance(cue_placement, str)
            or cue_placement not in CUE_PLACEMENTS
            or not isinstance(speaker_span_direction, str)
            or speaker_span_direction not in SPEAKER_SPAN_DIRECTIONS
        ):
            raise CandidateMiningError(f"phrase queue entry {index} is incomplete")
        if (cue_placement, speaker_span_direction) not in VALID_BOUNDARY_ASSERTIONS:
            raise CandidateMiningError(
                f"phrase queue entry {index} has an inconsistent boundary assertion"
            )
        if dialogue not in {
            item.dialogue for item in characters[character_id].appearances
        }:
            raise CandidateMiningError(
                f"phrase queue entry {index} is not an appearance of {character_id}"
            )
        pinned_ids = {video.video_id for video in videos_by_dialogue.get(dialogue, ())}
        if video_id is not None and video_id not in pinned_ids:
            raise CandidateMiningError(
                f"phrase queue entry {index} names unpinned video {video_id}"
            )
        normalized_phrase = " ".join(phrase.split())
        key = (
            character_id,
            dialogue,
            video_id,
            normalize_words(normalized_phrase),
            cue_placement,
            speaker_span_direction,
        )
        if key in seen:
            raise CandidateMiningError(f"phrase queue entry {index} is duplicated")
        seen.add(key)
        requests.append(
            PhraseRequest(
                character_id,
                dialogue,
                normalized_phrase,
                video_id,
                cue_placement,
                speaker_span_direction,
            )
        )
    return (
        tuple(
            sorted(
                requests,
                key=lambda item: (
                    item.character_id,
                    item.dialogue,
                    item.video_id or "",
                    normalize_words(item.phrase),
                    item.cue_placement,
                    item.speaker_span_direction,
                ),
            )
        ),
        digest,
    )


def _transcript(document: CaptionDocument, start_token: int, end_token: int) -> str:
    if not 0 <= start_token < end_token <= len(document.tokens):
        raise CandidateMiningError("invalid caption token span")
    first_piece = document.tokens[start_token].piece_index
    last_piece = document.tokens[end_token - 1].piece_index
    return " ".join(
        " ".join(piece.text.split())
        for piece in document.pieces[first_piece : last_piece + 1]
        if piece.text.split()
    ).strip()


def _aliases_for_dialogue(
    characters: Sequence[CharacterRecord], dialogue: str
) -> tuple[
    dict[str, list[tuple[tuple[str, ...], str, str]]],
    dict[str, tuple[str, ...]],
]:
    owners: dict[tuple[str, ...], dict[str, set[str]]] = defaultdict(
        lambda: defaultdict(set)
    )
    for character in characters:
        appearance = next(
            (item for item in character.appearances if item.dialogue == dialogue), None
        )
        if appearance is None:
            continue
        for alias in appearance.aliases:
            normalized = normalize_words(alias)
            if normalized:
                owners[normalized][character.character_id].add(alias)

    by_first_token: dict[str, list[tuple[tuple[str, ...], str, str]]] = defaultdict(
        list
    )
    ambiguous_by_character: dict[str, set[str]] = defaultdict(set)
    for normalized, character_aliases in owners.items():
        if len(character_aliases) != 1:
            rendered = " ".join(normalized)
            for character_id in character_aliases:
                ambiguous_by_character[character_id].add(rendered)
            continue
        character_id, aliases = next(iter(character_aliases.items()))
        evidence_alias = sorted(aliases, key=lambda value: (len(value), value))[0]
        by_first_token[normalized[0]].append((normalized, character_id, evidence_alias))
    for rows in by_first_token.values():
        rows.sort(key=lambda item: (-len(item[0]), item[0], item[1], item[2]))
    return dict(by_first_token), {
        key: tuple(sorted(values))
        for key, values in sorted(ambiguous_by_character.items())
    }


def _raw_narrator_cues(
    document: CaptionDocument,
    aliases_by_first_token: dict[str, list[tuple[tuple[str, ...], str, str]]],
) -> list[NarratorCue]:
    words = tuple(token.normalized for token in document.tokens)
    raw: dict[tuple[int, int, str, str], NarratorCue] = {}
    for start, word in enumerate(words):
        for alias_tokens, character_id, alias in aliases_by_first_token.get(word, []):
            alias_end = start + len(alias_tokens)
            if words[start:alias_end] != alias_tokens:
                continue
            if start > 0 and words[start - 1] in CUE_VERBS:
                verb = words[start - 1]
                cue_start = start - 1
                if cue_start > 0 and words[cue_start - 1] in CUE_PREFIXES:
                    cue_start -= 1
                # In "he said Crito, I owe...", Crito is the addressee. A
                # subject pronoun before an inverted pattern makes it unsafe.
                if cue_start > 0 and words[cue_start - 1] in SUBJECT_PRONOUNS:
                    continue
                cue = NarratorCue(
                    character_id=character_id,
                    alias=alias,
                    verb=verb,
                    pattern="verb-alias",
                    priority=3,
                    confidence=0.96,
                    start_token=cue_start,
                    end_token_exclusive=alias_end,
                    transcript=_transcript(document, cue_start, alias_end),
                )
                raw[
                    (
                        cue.start_token,
                        cue.end_token_exclusive,
                        character_id,
                        cue.pattern,
                    )
                ] = cue
            if alias_end < len(words) and words[alias_end] in CUE_VERBS:
                verb = words[alias_end]
                cue_start = start
                if cue_start > 0 and words[cue_start - 1] in CUE_PREFIXES:
                    cue_start -= 1
                cue = NarratorCue(
                    character_id=character_id,
                    alias=alias,
                    verb=verb,
                    pattern="alias-verb",
                    priority=2,
                    confidence=0.90,
                    start_token=cue_start,
                    end_token_exclusive=alias_end + 1,
                    transcript=_transcript(document, cue_start, alias_end + 1),
                )
                raw[
                    (
                        cue.start_token,
                        cue.end_token_exclusive,
                        character_id,
                        cue.pattern,
                    )
                ] = cue
    return sorted(
        raw.values(),
        key=lambda cue: (
            cue.start_token,
            cue.end_token_exclusive,
            -cue.priority,
            cue.character_id,
            cue.alias,
        ),
    )


def _resolve_overlapping_cues(
    raw: Sequence[NarratorCue],
) -> tuple[tuple[NarratorCue, ...], dict[str, int]]:
    accepted: list[NarratorCue] = []
    suppressed: Counter[str] = Counter()
    index = 0
    while index < len(raw):
        group = [raw[index]]
        group_end = raw[index].end_token_exclusive
        index += 1
        while index < len(raw) and raw[index].start_token < group_end:
            group.append(raw[index])
            group_end = max(group_end, raw[index].end_token_exclusive)
            index += 1
        highest_priority = max(cue.priority for cue in group)
        strongest = [cue for cue in group if cue.priority == highest_priority]
        strongest_characters = {cue.character_id for cue in strongest}
        if len(strongest_characters) != 1:
            for cue in group:
                suppressed[cue.character_id] += 1
            continue
        winner = sorted(
            strongest,
            key=lambda cue: (
                -(cue.end_token_exclusive - cue.start_token),
                cue.character_id,
                cue.pattern,
                cue.alias,
            ),
        )[0]
        accepted.append(winner)
        for cue in group:
            if cue != winner:
                suppressed[cue.character_id] += 1
    return tuple(
        sorted(accepted, key=lambda cue: (cue.start_token, cue.end_token_exclusive))
    ), dict(sorted(suppressed.items()))


def scan_narrator_cues(
    document: CaptionDocument,
    *,
    characters: Sequence[CharacterRecord],
    dialogue: str,
) -> CueScan:
    aliases_by_first, ambiguous = _aliases_for_dialogue(characters, dialogue)
    cues, suppressed = _resolve_overlapping_cues(
        _raw_narrator_cues(document, aliases_by_first)
    )
    return CueScan(cues, ambiguous, suppressed)


def _cue_json(cue: NarratorCue, document: CaptionDocument) -> dict[str, Any]:
    first = document.tokens[cue.start_token]
    last = document.tokens[cue.end_token_exclusive - 1]
    return {
        "characterId": cue.character_id,
        "alias": cue.alias,
        "verb": cue.verb,
        "pattern": cue.pattern,
        "transcript": cue.transcript,
        "startSeconds": round(first.start_ms / 1000, 3),
        "endSeconds": round(last.end_ms / 1000, 3),
        "tokenSpan": {
            "start": cue.start_token,
            "endExclusive": cue.end_token_exclusive,
        },
    }


def _duration_quality(duration_seconds: float) -> float:
    if 6 <= duration_seconds <= 18:
        return 1.0
    if duration_seconds < 6:
        return max(0.0, duration_seconds / 6)
    return max(0.0, 1.0 - (duration_seconds - 18) / 2)


def _candidate_base(
    *,
    character_id: str,
    video: PinnedVideo,
    caption_path: Path,
    caption_sha256: str,
    reference_catalog_sha256: str,
    document: CaptionDocument,
    start_token: int,
    end_token: int,
    alignment_confidence: float,
    boundary_type: str,
    evidence: dict[str, Any],
    catalog: dict[str, Any],
    catalog_path: Path,
    output_root: Path,
) -> dict[str, Any]:
    first = document.tokens[start_token]
    last = document.tokens[end_token - 1]
    start_seconds = round(first.start_ms / 1000, 3)
    end_seconds = round(last.end_ms / 1000, 3)
    duration_seconds = round(end_seconds - start_seconds, 3)
    transcript = _transcript(document, start_token, end_token)
    try:
        plan = build_reference_plan(
            catalog,
            dialogue=video.dialogue,
            character_id=character_id,
            video_id=video.video_id,
            start_seconds=start_seconds,
            end_seconds=end_seconds,
            prompt_text=transcript,
            output_root=output_root,
        )
    except ReferenceMaterializationError as error:
        raise CandidateMiningError(
            f"candidate does not form a valid reference plan: {error}"
        ) from error
    command = [
        "uv",
        "run",
        "python",
        "scripts/audio/materialize_youtube_reference.py",
        "--catalog",
        str(catalog_path),
        "--dialogue",
        video.dialogue,
        "--character-id",
        character_id,
        "--video-id",
        video.video_id,
        "--start",
        f"{start_seconds:.3f}",
        "--end",
        f"{end_seconds:.3f}",
        "--prompt-text",
        transcript,
        "--output-root",
        str(output_root),
        "--materialize",
    ]
    rank_score = round(
        0.75 * alignment_confidence + 0.25 * _duration_quality(duration_seconds),
        6,
    )
    candidate: dict[str, Any] = {
        "status": "candidate-not-selected",
        "automaticSpeakerIdentity": False,
        "characterId": character_id,
        "dialogue": video.dialogue,
        "method": "explicit-phrase-boundary-asserted",
        "source": {
            "videoId": video.video_id,
            "title": video.title,
            "url": video.url,
            "durationSeconds": video.duration_seconds,
            "referenceCatalogSha256": reference_catalog_sha256,
        },
        "caption": {
            "language": "en-orig",
            "format": "json3",
            "path": str(caption_path),
            "sha256": caption_sha256,
        },
        "interval": {
            "startSeconds": start_seconds,
            "endSeconds": end_seconds,
            "durationSeconds": duration_seconds,
            "tokenSpan": {"start": start_token, "endExclusive": end_token},
        },
        "captionTranscript": transcript,
        "promptText": transcript,
        "promptStatus": "automatic-caption-uncorrected",
        "speakerIsolationStatus": "human-asserted-not-verified",
        "ranking": {
            "captionAlignment": round(alignment_confidence, 6),
            "durationQuality": round(_duration_quality(duration_seconds), 6),
            "rankScore": rank_score,
            "scoreType": "caption-alignment-and-duration-not-speaker-confidence",
        },
        "boundaryType": boundary_type,
        "evidence": evidence,
        "materializationPlan": asdict(plan),
        "materializationPlanStatus": "asserted-boundary-dry-plan-requires-exact-prompt-verification",
        "materializerCommand": shlex.join(command),
        "reviewRequired": (
            "The phrase queue asserts this cue placement and speaker span, but does not prove speaker identity. "
            "Listen for one character only, correct every audible prompt word, run Dots and ASR QA, "
            "and select the voice only by human listening."
        ),
    }
    identity_payload = {
        "characterId": character_id,
        "dialogue": video.dialogue,
        "method": "explicit-phrase-boundary-asserted",
        "videoId": video.video_id,
        "captionSha256": caption_sha256,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "promptText": transcript,
        "boundaryType": boundary_type,
        "evidence": evidence,
    }
    candidate["candidateId"] = (
        "reference-candidate-"
        + hashlib.sha256(canonical_json(identity_payload)).hexdigest()[:20]
    )
    return candidate


def _cue_hypothesis_base(
    *,
    character_id: str,
    video: PinnedVideo,
    caption_path: Path,
    caption_sha256: str,
    reference_catalog_sha256: str,
    document: CaptionDocument,
    start_token: int,
    end_token: int,
    evidence: dict[str, Any],
) -> dict[str, Any]:
    first = document.tokens[start_token]
    last = document.tokens[end_token - 1]
    start_seconds = round(first.start_ms / 1000, 3)
    end_seconds = round(last.end_ms / 1000, 3)
    transcript = _transcript(document, start_token, end_token)
    identity_payload = {
        "characterId": character_id,
        "dialogue": video.dialogue,
        "videoId": video.video_id,
        "captionSha256": caption_sha256,
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "captionTranscript": transcript,
        "evidence": evidence,
    }
    return {
        "status": "cue-hypothesis-not-candidate",
        "automaticSpeakerIdentity": False,
        "materializable": False,
        "candidateCompletionCredit": False,
        "characterId": character_id,
        "dialogue": video.dialogue,
        "method": "lexical-narrator-cue-hypothesis",
        "source": {
            "videoId": video.video_id,
            "title": video.title,
            "url": video.url,
            "durationSeconds": video.duration_seconds,
            "referenceCatalogSha256": reference_catalog_sha256,
        },
        "caption": {
            "language": "en-orig",
            "format": "json3",
            "path": str(caption_path),
            "sha256": caption_sha256,
        },
        "interval": {
            "startSeconds": start_seconds,
            "endSeconds": end_seconds,
            "durationSeconds": round(end_seconds - start_seconds, 3),
            "tokenSpan": {"start": start_token, "endExclusive": end_token},
        },
        "captionTranscript": transcript,
        "speakerIsolationStatus": "unknown-cue-direction-and-turn-boundaries",
        "boundaryType": "between-lexically-matched-cues",
        "evidence": evidence,
        "nonMaterializableReason": (
            "Named cues can be preposed, postposed, or medial, and automatic captions do not prove "
            "which speaker owns the intervening words. Add an explicit phrase-queue boundary assertion."
        ),
        "hypothesisId": (
            "cue-hypothesis-"
            + hashlib.sha256(canonical_json(identity_payload)).hexdigest()[:20]
        ),
    }


def _cue_hypotheses(
    *,
    character_id: str,
    video: PinnedVideo,
    caption_path: Path,
    caption_sha256: str,
    reference_catalog_sha256: str,
    document: CaptionDocument,
    cue_scan: CueScan,
) -> tuple[list[dict[str, Any]], Counter[str]]:
    hypotheses: list[dict[str, Any]] = []
    rejections: Counter[str] = Counter()
    target_cues = [cue for cue in cue_scan.cues if cue.character_id == character_id]
    if not target_cues:
        rejections["no-unambiguous-target-cue"] += 1
        return hypotheses, rejections
    for cue in target_cues:
        next_cue = next(
            (
                candidate
                for candidate in cue_scan.cues
                if candidate.start_token >= cue.end_token_exclusive
            ),
            None,
        )
        if next_cue is None:
            rejections["no-next-captioned-cue"] += 1
            continue
        start_token = cue.end_token_exclusive
        end_token = next_cue.start_token
        if start_token >= end_token:
            rejections["empty-cue-bounded-span"] += 1
            continue
        first = document.tokens[start_token]
        last = document.tokens[end_token - 1]
        duration = (last.end_ms - first.start_ms) / 1000
        if duration > MAX_CLIP_SECONDS:
            rejections["over-20s-cue-bounded-span"] += 1
            continue
        if duration < MIN_CLIP_SECONDS:
            rejections["under-3s-cue-bounded-span"] += 1
            continue
        evidence = {
            "targetCue": _cue_json(cue, document),
            "nextCue": _cue_json(next_cue, document),
        }
        hypotheses.append(
            _cue_hypothesis_base(
                character_id=character_id,
                video=video,
                caption_path=caption_path,
                caption_sha256=caption_sha256,
                reference_catalog_sha256=reference_catalog_sha256,
                document=document,
                start_token=start_token,
                end_token=end_token,
                evidence=evidence,
            )
        )
    return hypotheses, rejections


def _unresolved_transition_reason(
    document: CaptionDocument, start_token: int, end_token: int
) -> str | None:
    words = tuple(token.normalized for token in document.tokens)
    for index in range(start_token, end_token - 1):
        if words[index] in SUBJECT_PRONOUNS and words[index + 1] in CUE_VERBS:
            return (
                "phrase contains an unresolved pronoun narrator cue: "
                f"{words[index]} {words[index + 1]}"
            )
    transcript = _transcript(document, start_token, end_token)
    if re.search(r'["\u201d]\s+["\u201c]', transcript):
        return "phrase contains multiple quoted utterances"
    return None


def _phrase_candidate(
    *,
    request: PhraseRequest,
    video: PinnedVideo,
    caption_path: Path,
    caption_sha256: str,
    reference_catalog_sha256: str,
    document: CaptionDocument,
    cue_scan: CueScan,
    catalog: dict[str, Any],
    catalog_path: Path,
    output_root: Path,
    min_confidence: float,
    ambiguity_margin: float,
) -> dict[str, Any]:
    alignment = align_caption_phrase(
        document,
        request.phrase,
        min_confidence=min_confidence,
        ambiguity_margin=ambiguity_margin,
    )
    match = alignment.match
    containing_cues = [
        cue
        for cue in cue_scan.cues
        if cue.start_token < match.end_token_exclusive
        and cue.end_token_exclusive > match.start_token
    ]
    if containing_cues:
        raise ReferenceSearchError("phrase overlaps a narrator cue")
    transition_reason = _unresolved_transition_reason(
        document, match.start_token, match.end_token_exclusive
    )
    if transition_reason is not None:
        raise ReferenceSearchError(transition_reason)
    if request.speaker_span_direction == "after-cue":
        adjacent_cues = [
            cue for cue in cue_scan.cues if cue.end_token_exclusive == match.start_token
        ]
    else:
        adjacent_cues = [
            cue for cue in cue_scan.cues if cue.start_token == match.end_token_exclusive
        ]
    if len(adjacent_cues) != 1:
        raise ReferenceSearchError(
            "asserted speaker span is not adjacent to exactly one resolved named cue"
        )
    target_cue = adjacent_cues[0]
    if target_cue.character_id != request.character_id:
        raise ReferenceSearchError(
            "asserted speaker span is adjacent to a different character cue"
        )
    boundary_type = f"explicit-{request.cue_placement}-{request.speaker_span_direction}"
    duration = match.end_seconds - match.start_seconds
    if not MIN_CLIP_SECONDS <= duration <= MAX_CLIP_SECONDS:
        raise ReferenceSearchError(
            f"phrase interval must be {MIN_CLIP_SECONDS:g}-{MAX_CLIP_SECONDS:g}s; got {duration:.3f}s"
        )
    evidence = {
        "phrase": request.phrase,
        "normalizedPhrase": " ".join(normalize_words(request.phrase)),
        "alignmentConfidence": round(match.confidence, 6),
        "exactTokenRatio": round(match.exact_token_ratio, 6),
        "boundaryAssertion": {
            "cuePlacement": request.cue_placement,
            "speakerSpanDirection": request.speaker_span_direction,
        },
        "targetCue": _cue_json(target_cue, document),
    }
    return _candidate_base(
        character_id=request.character_id,
        video=video,
        caption_path=caption_path,
        caption_sha256=caption_sha256,
        reference_catalog_sha256=reference_catalog_sha256,
        document=document,
        start_token=match.start_token,
        end_token=match.end_token_exclusive,
        alignment_confidence=match.confidence,
        boundary_type=boundary_type,
        evidence=evidence,
        catalog=catalog,
        catalog_path=catalog_path,
        output_root=output_root,
    )


def _rank_key(candidate: dict[str, Any]) -> tuple[Any, ...]:
    return (
        -candidate["ranking"]["rankScore"],
        -candidate["interval"]["durationSeconds"],
        candidate["dialogue"],
        candidate["source"]["videoId"],
        candidate["interval"]["startSeconds"],
        candidate["candidateId"],
    )


def _deduplicate_candidates(
    candidates: Iterable[dict[str, Any]],
) -> list[dict[str, Any]]:
    by_interval: dict[tuple[Any, ...], dict[str, Any]] = {}
    for candidate in sorted(candidates, key=_rank_key):
        key = (
            candidate["characterId"],
            candidate["source"]["videoId"],
            candidate["interval"]["startSeconds"],
            candidate["interval"]["endSeconds"],
            candidate["captionTranscript"],
        )
        by_interval.setdefault(key, candidate)
    return sorted(by_interval.values(), key=_rank_key)


def _deduplicate_hypotheses(
    hypotheses: Iterable[dict[str, Any]],
) -> list[dict[str, Any]]:
    by_id = {hypothesis["hypothesisId"]: hypothesis for hypothesis in hypotheses}
    return sorted(
        by_id.values(),
        key=lambda hypothesis: (
            hypothesis["dialogue"],
            hypothesis["source"]["videoId"],
            hypothesis["interval"]["startSeconds"],
            hypothesis["interval"]["endSeconds"],
            hypothesis["hypothesisId"],
        ),
    )


def mine_candidates(
    *,
    characters_path: Path,
    sources_path: Path,
    cast_path: Path,
    caption_cache: Path,
    output_root: Path,
    phrase_queue_path: Path | None = None,
    only_character_ids: set[str] | None = None,
    max_candidates_per_character: int = DEFAULT_MAX_CANDIDATES_PER_CHARACTER,
    min_confidence: float = DEFAULT_MIN_CONFIDENCE,
    ambiguity_margin: float = DEFAULT_AMBIGUITY_MARGIN,
    populate_caption_cache: bool = False,
) -> dict[str, Any]:
    if max_candidates_per_character <= 0:
        raise CandidateMiningError("max_candidates_per_character must be positive")
    characters, characters_sha = load_characters(characters_path)
    known_character_ids = {character.character_id for character in characters}
    selected_ids, cast_sha = load_selected_character_ids(cast_path, known_character_ids)
    voice_owner_characters = tuple(
        CharacterRecord(
            character_id=character.character_id,
            display_name=character.display_name,
            aliases=character.aliases,
            appearances=tuple(
                appearance
                for appearance in character.appearances
                if appearance.performance_role == "voice-owner"
            ),
        )
        for character in characters
        if any(
            appearance.performance_role == "voice-owner"
            for appearance in character.appearances
        )
    )
    character_map = {
        character.character_id: character for character in voice_owner_characters
    }
    non_voice_owner_selections = selected_ids - set(character_map)
    if non_voice_owner_selections:
        raise CandidateMiningError(
            "cast selects non-voice-owner characters: "
            + ", ".join(sorted(non_voice_owner_selections))
        )
    catalog = load_catalog(sources_path)
    sources_sha = sha256_file(sources_path)
    videos_by_dialogue = _catalog_videos(catalog)
    missing_source_dialogues = sorted(
        {
            appearance.dialogue
            for character in voice_owner_characters
            for appearance in character.appearances
            if appearance.dialogue not in videos_by_dialogue
        }
    )
    if missing_source_dialogues:
        raise CandidateMiningError(
            "character appearances lack pinned sources: "
            + ", ".join(missing_source_dialogues)
        )
    phrase_requests, phrase_queue_sha = load_phrase_queue(
        phrase_queue_path,
        characters=character_map,
        videos_by_dialogue=videos_by_dialogue,
    )
    selected_phrase_characters = sorted(
        {request.character_id for request in phrase_requests} & selected_ids
    )
    if selected_phrase_characters:
        raise CandidateMiningError(
            "phrase queue contains already selected characters: "
            + ", ".join(selected_phrase_characters)
        )
    if populate_caption_cache:
        population_failures: list[str] = []
        for dialogue in sorted(videos_by_dialogue):
            for video in videos_by_dialogue[dialogue]:
                try:
                    ensure_caption(video, caption_cache, allow_download=True)
                except ReferenceSearchError as error:
                    population_failures.append(
                        f"{video.video_id} ({dialogue}): {error}"
                    )
        if population_failures:
            raise CandidateMiningError(
                "caption cache population failed:\n" + "\n".join(population_failures)
            )
    unknown_filter = (only_character_ids or set()) - set(character_map)
    if unknown_filter:
        raise CandidateMiningError(
            f"unknown --only-character values: {', '.join(sorted(unknown_filter))}"
        )
    unresolved = [
        character
        for character in voice_owner_characters
        if character.character_id not in selected_ids
        and (only_character_ids is None or character.character_id in only_character_ids)
    ]
    relevant_dialogues = {
        appearance.dialogue
        for character in unresolved
        for appearance in character.appearances
    }

    cache_entries: dict[
        tuple[str, str], tuple[PinnedVideo, Path, str, CaptionDocument, CueScan]
    ] = {}
    for dialogue in sorted(relevant_dialogues):
        for video in videos_by_dialogue.get(dialogue, ()):
            path = caption_cache_path(caption_cache, video.video_id)
            if not path.is_file():
                continue
            document = parse_json3_caption(path)
            cache_entries[(dialogue, video.video_id)] = (
                video,
                path,
                sha256_file(path),
                document,
                scan_narrator_cues(
                    document, characters=voice_owner_characters, dialogue=dialogue
                ),
            )

    requests_by_target: dict[tuple[str, str, str], list[PhraseRequest]] = defaultdict(
        list
    )
    for request in phrase_requests:
        for video in videos_by_dialogue.get(request.dialogue, ()):
            if request.video_id is None or request.video_id == video.video_id:
                requests_by_target[
                    (request.character_id, request.dialogue, video.video_id)
                ].append(request)

    report_characters: list[dict[str, Any]] = []
    all_retained_candidates: list[dict[str, Any]] = []
    all_cue_hypotheses: list[dict[str, Any]] = []
    total_discovered = 0
    cached_appearance_count = 0
    for character in unresolved:
        discovered: list[dict[str, Any]] = []
        character_hypotheses: list[dict[str, Any]] = []
        appearance_rows: list[dict[str, Any]] = []
        for appearance in character.appearances:
            source_rows: list[dict[str, Any]] = []
            for video in videos_by_dialogue.get(appearance.dialogue, ()):
                cached = cache_entries.get((appearance.dialogue, video.video_id))
                if cached is None:
                    source_rows.append(
                        {
                            "videoId": video.video_id,
                            "captionStatus": "not-cached",
                            "lexicalCueCount": 0,
                            "cueHypothesisCount": 0,
                            "cueHypothesisIds": [],
                            "discoveredCandidateCount": 0,
                            "candidateIds": [],
                            "rejectionCounts": {"caption-not-cached": 1},
                            "phraseFailures": [],
                        }
                    )
                    continue
                _, caption_path, caption_sha, document, cue_scan = cached
                cue_hypotheses, rejections = _cue_hypotheses(
                    character_id=character.character_id,
                    video=video,
                    caption_path=caption_path,
                    caption_sha256=caption_sha,
                    reference_catalog_sha256=sources_sha,
                    document=document,
                    cue_scan=cue_scan,
                )
                character_hypotheses.extend(cue_hypotheses)
                video_candidates: list[dict[str, Any]] = []
                phrase_failures: list[dict[str, Any]] = []
                for request in requests_by_target.get(
                    (character.character_id, appearance.dialogue, video.video_id), ()
                ):
                    try:
                        video_candidates.append(
                            _phrase_candidate(
                                request=request,
                                video=video,
                                caption_path=caption_path,
                                caption_sha256=caption_sha,
                                reference_catalog_sha256=sources_sha,
                                document=document,
                                cue_scan=cue_scan,
                                catalog=catalog,
                                catalog_path=sources_path,
                                output_root=output_root,
                                min_confidence=min_confidence,
                                ambiguity_margin=ambiguity_margin,
                            )
                        )
                    except (ReferenceSearchError, CandidateMiningError) as error:
                        rejections["phrase-rejected"] += 1
                        phrase_failures.append(
                            {
                                "phrase": request.phrase,
                                "cuePlacement": request.cue_placement,
                                "speakerSpanDirection": request.speaker_span_direction,
                                "reason": str(error),
                            }
                        )
                video_candidates = _deduplicate_candidates(video_candidates)
                discovered.extend(video_candidates)
                source_rows.append(
                    {
                        "videoId": video.video_id,
                        "captionStatus": "cached",
                        "captionSha256": caption_sha,
                        "lexicalCueCount": len(cue_scan.cues),
                        "targetCueCount": sum(
                            cue.character_id == character.character_id
                            for cue in cue_scan.cues
                        ),
                        "ambiguousAliases": list(
                            cue_scan.ambiguous_aliases_by_character.get(
                                character.character_id, ()
                            )
                        ),
                        "suppressedOverlappingCueCount": cue_scan.suppressed_overlap_counts.get(
                            character.character_id, 0
                        ),
                        "cueHypothesisCount": len(cue_hypotheses),
                        "cueHypothesisIds": [
                            hypothesis["hypothesisId"] for hypothesis in cue_hypotheses
                        ],
                        "discoveredCandidateCount": len(video_candidates),
                        "candidateIds": [
                            candidate["candidateId"] for candidate in video_candidates
                        ],
                        "rejectionCounts": dict(sorted(rejections.items())),
                        "phraseFailures": sorted(
                            phrase_failures,
                            key=lambda item: (item["phrase"], item["reason"]),
                        ),
                    }
                )
            if any(row["captionStatus"] == "cached" for row in source_rows):
                cached_appearance_count += 1
            appearance_rows.append(
                {
                    "dialogue": appearance.dialogue,
                    "performanceRole": appearance.performance_role,
                    "sources": source_rows,
                }
            )
        discovered = _deduplicate_candidates(discovered)
        character_hypotheses = _deduplicate_hypotheses(character_hypotheses)
        total_discovered += len(discovered)
        retained = discovered[:max_candidates_per_character]
        retained_ids = {candidate["candidateId"] for candidate in retained}
        for appearance_row in appearance_rows:
            for source_row in appearance_row["sources"]:
                source_row["candidateIds"] = [
                    candidate_id
                    for candidate_id in source_row["candidateIds"]
                    if candidate_id in retained_ids
                ]
        for rank, candidate in enumerate(retained, start=1):
            candidate["rank"] = rank
        all_retained_candidates.extend(retained)
        all_cue_hypotheses.extend(character_hypotheses)
        report_characters.append(
            {
                "characterId": character.character_id,
                "displayName": character.display_name,
                "status": (
                    "explicit-candidates-found"
                    if retained
                    else "unresolved-no-explicit-candidate"
                ),
                "appearanceCount": len(character.appearances),
                "discoveredCandidateCount": len(discovered),
                "retainedCandidateCount": len(retained),
                "cueHypothesisCount": len(character_hypotheses),
                "appearances": appearance_rows,
                "candidates": retained,
                "cueHypotheses": character_hypotheses,
            }
        )

    unresolved_appearance_count = sum(
        len(character.appearances) for character in unresolved
    )
    characters_with_candidates = sum(
        bool(row["candidates"]) for row in report_characters
    )
    characters_with_cue_hypotheses = sum(
        bool(row["cueHypotheses"]) for row in report_characters
    )
    report = {
        "schemaVersion": 3,
        "status": "explicit-candidate-coverage-not-cast-selection",
        "automaticSpeakerIdentity": False,
        "policy": {
            "captionMode": (
                "populate-pinned-captions-then-scan"
                if populate_caption_cache
                else "offline-cache-only"
            ),
            "candidateDurationSeconds": {
                "minimum": MIN_CLIP_SECONDS,
                "maximum": MAX_CLIP_SECONDS,
            },
            "cuePatterns": ["verb-alias", "alias-verb"],
            "targetPolicy": "Only appearances whose CharacterCatalog v3 performanceRole is voice-owner are cast-reference mining targets.",
            "cueHypothesisPolicy": "Lexical cue-bounded spans have unresolved cue direction and speaker boundaries. They are non-materializable hypotheses, carry no candidate credit, and expose no speaker-isolation confidence.",
            "candidatePolicy": "Only an explicit phrase-queue entry with a consistent cuePlacement and speakerSpanDirection assertion can create a candidate.",
            "selectionPolicy": "Every explicit candidate still requires prompt correction, Dots and ASR QA, and human listening; this report never selects a cast voice.",
            "promptPolicy": "Only asserted explicit-phrase candidates expose prompt text or a materialization plan. Automatic cue hypotheses never do.",
            "maxCandidatesPerCharacter": max_candidates_per_character,
        },
        "inputs": {
            "characters": {"path": str(characters_path), "sha256": characters_sha},
            "referenceSources": {"path": str(sources_path), "sha256": sources_sha},
            "castSelectionFilter": {"path": str(cast_path), "sha256": cast_sha},
            "phraseQueue": (
                None
                if phrase_queue_path is None
                else {"path": str(phrase_queue_path), "sha256": phrase_queue_sha}
            ),
            "captionCache": str(caption_cache),
            "materializationOutputRoot": str(output_root),
            "captionPopulationRequested": populate_caption_cache,
        },
        "summary": {
            "canonicalCharacterCount": len(characters),
            "voiceOwnerCharacterCount": len(voice_owner_characters),
            "nonVoiceOwnerCharacterCount": len(characters)
            - len(voice_owner_characters),
            "selectedCharacterCount": len(selected_ids),
            "corpusUnresolvedCharacterCount": len(characters) - len(selected_ids),
            "corpusUnresolvedVoiceOwnerCount": len(voice_owner_characters)
            - len(selected_ids & set(character_map)),
            "unresolvedCharacterCount": len(unresolved),
            "unresolvedAppearanceCount": unresolved_appearance_count,
            "cachedAppearanceCount": cached_appearance_count,
            "charactersWithCandidates": characters_with_candidates,
            "charactersWithoutCandidates": len(unresolved) - characters_with_candidates,
            "charactersWithCueHypotheses": characters_with_cue_hypotheses,
            "discoveredCandidateCount": total_discovered,
            "retainedCandidateCount": len(all_retained_candidates),
            "cueHypothesisCount": len(all_cue_hypotheses),
            "cachedVideoCount": len(cache_entries),
            "pinnedVideoCount": sum(
                len(videos) for videos in videos_by_dialogue.values()
            ),
        },
        "selectedCharactersExcluded": sorted(selected_ids),
        "characters": report_characters,
    }
    return report


def write_report(path: Path, report: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        temporary.write_text(
            json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
        os.replace(temporary, path)
    finally:
        temporary.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--characters", type=Path, default=Path("audio/characters.json")
    )
    parser.add_argument(
        "--sources", type=Path, default=Path("audio/reference-sources.json")
    )
    parser.add_argument("--cast", type=Path, default=Path("audio/cast.json"))
    parser.add_argument(
        "--caption-cache",
        type=Path,
        default=Path("scratch/audio-references/caption-cache"),
    )
    parser.add_argument(
        "--output-root", type=Path, default=Path("scratch/audio-references")
    )
    parser.add_argument("--phrase-queue", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument(
        "--populate-caption-cache",
        action="store_true",
        help="download only missing pinned en-orig JSON3 captions before mining",
    )
    parser.add_argument("--only-character", action="append", default=[])
    parser.add_argument(
        "--max-candidates-per-character",
        type=int,
        default=DEFAULT_MAX_CANDIDATES_PER_CHARACTER,
    )
    parser.add_argument("--min-confidence", type=float, default=DEFAULT_MIN_CONFIDENCE)
    parser.add_argument(
        "--ambiguity-margin", type=float, default=DEFAULT_AMBIGUITY_MARGIN
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    report = mine_candidates(
        characters_path=args.characters,
        sources_path=args.sources,
        cast_path=args.cast,
        caption_cache=args.caption_cache,
        output_root=args.output_root,
        phrase_queue_path=args.phrase_queue,
        only_character_ids=set(args.only_character) if args.only_character else None,
        max_candidates_per_character=args.max_candidates_per_character,
        min_confidence=args.min_confidence,
        ambiguity_margin=args.ambiguity_margin,
        populate_caption_cache=args.populate_caption_cache,
    )
    if args.output is not None:
        write_report(args.output, report)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
