#!/usr/bin/env python3
"""Build and validate fail-closed narrative-cue reference research.

This lane closes research gaps left by direct Jowett speaker-label alignment.
It emits scratch evidence only: no media is materialized and no cast selection
is read or written.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import os
import re
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Sequence

from align_jowett_voice_references import (
    DEFAULT_CAPTION_CACHE,
    DEFAULT_TRANSCRIPT_CACHE,
    REPO_ROOT,
    _piece_expanded_prompt,
    extract_jowett_text,
    load_registry,
    sha256_file,
    transcript_cache_path,
)
from find_youtube_reference import (
    ReferenceSearchError,
    align_caption_phrase,
    caption_cache_path,
    normalize_words,
    parse_json3_caption,
)
from materialize_youtube_reference import load_catalog


SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_CHARACTERS = REPO_ROOT / "audio" / "characters.json"
DEFAULT_REFERENCES = REPO_ROOT / "audio" / "reference-sources.json"
DEFAULT_REGISTRY = REPO_ROOT / "audio" / "jowett-transcript-sources.json"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "scratch" / "audio-narrative-cue-references"
DEFAULT_OUTPUT = DEFAULT_OUTPUT_ROOT / "ledger.json"
DEFAULT_CANDIDATE_REPORT_ROOT = DEFAULT_OUTPUT_ROOT / "cast-candidate-reports"
SHA256 = re.compile(r"[0-9a-f]{64}")
MIN_DURATION_SECONDS = 3.0
MAX_DURATION_SECONDS = 15.0


class NarrativeCueError(ValueError):
    """Raised when narrative-cue evidence fails a deterministic invariant."""


@dataclass(frozen=True)
class CandidateSpec:
    character_id: str
    dialogue: str
    source_prompt: str
    caption_prompt: str
    cue: str
    cue_position: str
    attribution_basis: str
    state_rule: str
    required_preceding_caption_token: str | None = None


@dataclass(frozen=True)
class AttemptSpec:
    source_prompt: str
    caption_prompt: str
    attribution_basis: str


@dataclass(frozen=True)
class UnresolvedSpec:
    character_id: str
    dialogue: str
    attempts: tuple[AttemptSpec, ...]
    fail_reason: str
    fallback_character_id: str
    fallback_reason: str


CANDIDATE_SPECS = (
    CandidateSpec(
        "adeimantus",
        "parmenides",
        "is there anything which we can do for you in Athens",
        "is there anything which we can do for you in Athens",
        "said Adeimantus taking me by the hand",
        "before",
        "named-prose-cue",
        "The named Adeimantus cue introduces the remainder of his question.",
    ),
    CandidateSpec(
        "cephalus-of-clazomenae",
        "parmenides",
        "Yes that is why I am here I wish to ask a favour of you",
        "yes that is why I am here I wish to ask a favor of you",
        (
            "Welcome Cephalus said Adeimantus taking me by the hand is there "
            "anything which we can do for you in Athens"
        ),
        "before",
        "alternating-exchange",
        (
            "Cephalus is the first-person Clazomenian narrator and answers the "
            "named Adeimantus question before Adeimantus speaks again."
        ),
    ),
    CandidateSpec(
        "agathon",
        "symposium",
        (
            "I see no reason why I should not proceed with my speech as I shall "
            "have many other opportunities of conversing with Socrates"
        ),
        (
            "I see no reason why I should not proceed with my speech as I shall "
            "have many other opportunities of conversing with Socrates"
        ),
        "Very good Phaedrus said Agathon",
        "before",
        "named-prose-cue",
        "The prompt immediately continues the utterance named as Agathon's.",
    ),
    CandidateSpec(
        "aristophanes",
        "symposium",
        (
            "I will unsay my words but do you please not to watch me as I fear "
            "that in the speech which I am about to make"
        ),
        (
            "I will unsay my words but do you please not to watch me as I fear "
            "that in the speech which I'm about to make"
        ),
        "You are right said Aristophanes laughing",
        "before",
        "named-prose-cue",
        "The prompt immediately continues the utterance named as Aristophanes's.",
    ),
    CandidateSpec(
        "pausanias",
        "symposium",
        "And now my friends how can we drink with least injury to ourselves",
        "And now my friends how can we drink with least injury to ourselves",
        "when Pausanias said",
        "before",
        "named-prose-cue",
        "The named Pausanias cue directly introduces the question.",
    ),
    CandidateSpec(
        "callias",
        "protagoras",
        (
            "that Protagoras may fairly claim to speak in his own way just as "
            "you claim to speak in yours"
        ),
        (
            "that Protagoras may fairly claim to speak in his own way just as "
            "you claim to speak in yours"
        ),
        "But you see Socrates said Callias",
        "before",
        "named-prose-cue",
        "The prompt is the continuation after the named Callias cue.",
    ),
    CandidateSpec(
        "friend",
        "protagoras",
        "Where do you come from Socrates And yet I need hardly ask the question",
        "Where do you come from Socrates And yet I need hardly ask the question",
        "COMPANION",
        "before",
        "direct-source-label",
        "The complete source turn is explicitly labelled COMPANION.",
    ),
    CandidateSpec(
        "hippocrates",
        "protagoras",
        "Yes indeed he has Socrates of the wisdom which he keeps from me",
        "Yes indeed he has Socrates of the wisdom which he keeps from me",
        "I knew his voice and said Hippocrates is that you",
        "before",
        "alternating-exchange",
        (
            "The name establishes Hippocrates as Socrates's sole interlocutor; "
            "the prompt is his reply before that two-party exchange changes."
        ),
    ),
    CandidateSpec(
        "prodicus",
        "protagoras",
        (
            "seems to me to be well said for those who are present at such "
            "discussions ought to be impartial hearers of both the speakers"
        ),
        (
            "seems to me to be well said for those who are present at such "
            "discussions ought to be impartial hearers of both the speakers"
        ),
        "Prodicus added That Critias",
        "before",
        "named-prose-cue",
        "The named Prodicus cue directly introduces the retained continuation.",
    ),
    CandidateSpec(
        "cleinias",
        "euthydemus",
        (
            "that there are some composers of speeches who do not know how to "
            "use the speeches which they make"
        ),
        (
            "that there are some composers of speeches who do not know how to "
            "use the speeches which they make"
        ),
        "I should say no rejoined Cleinias",
        "before",
        "alternating-exchange",
        (
            "Cleinias is named in the immediately continuing Socrates-Cleinias "
            "exchange; the prompt follows his local 'he replied' cue."
        ),
        required_preceding_caption_token="replied",
    ),
    CandidateSpec(
        "ctesippus",
        "euthydemus",
        (
            "And I Socrates am ready to commit myself to the strangers they may "
            "skin me alive if they please"
        ),
        (
            "And I Socrates am ready to commit myself to the strangers they may "
            "skin me alive if they please"
        ),
        "Ctesippus said",
        "before",
        "named-prose-cue",
        "The named Ctesippus cue directly introduces the prompt.",
    ),
    CandidateSpec(
        "dionysodorus",
        "euthydemus",
        "Reflect Socrates you may have to deny your words",
        "Reflect Socrates you may have to deny your words",
        "Dionysodorus said",
        "before",
        "named-prose-cue",
        "The named Dionysodorus cue directly introduces the prompt.",
    ),
    CandidateSpec(
        "euthydemus",
        "euthydemus",
        (
            "There can be no objection Socrates if the young man is only willing "
            "to answer questions"
        ),
        (
            "There can be no objection Socrates if the young man is only willing "
            "to answer questions"
        ),
        (
            "Euthydemus in a manly and at the same time encouraging tone replied"
        ),
        "before",
        "named-prose-cue",
        "The named Euthydemus cue directly introduces the reply.",
    ),
    CandidateSpec(
        "clinias-of-crete",
        "laws",
        (
            "Yes Stranger and if we proceed onward we shall come to groves of "
            "cypresses which are of rare height and beauty"
        ),
        (
            "Yes Stranger and if we proceed onward we shall come to groves of "
            "cypresses which are of rare height and beauty"
        ),
        "Cle",
        "before",
        "direct-source-label",
        "The source turn is explicitly labelled Cle., the registry form of Clinias.",
    ),
    CandidateSpec(
        "eucleides",
        "theaetetus",
        (
            "He wanted to get home although I entreated and advised him to remain "
            "he would not listen to me"
        ),
        (
            "He wanted to get home although I entreated and advised him to remain "
            "he would not listen to me"
        ),
        "EUCLID",
        "before",
        "direct-source-label",
        "The complete source turn is explicitly labelled EUCLID.",
    ),
    CandidateSpec(
        "hippothales",
        "lysis",
        "No but I deny that I make verses or address compositions to him",
        "No but I deny that I make verses or address compositions to him",
        (
            "Nay Socrates he said you surely do not attach any importance to what "
            "he is saying"
        ),
        "before",
        "alternating-exchange",
        (
            "The named Hippothales exchange remains two-party through this reply, "
            "before Ctesippus is explicitly introduced."
        ),
    ),
    CandidateSpec(
        "lysis",
        "lysis",
        "I am sure that we have been wrong Socrates",
        "I am sure that we have been wrong Socrates",
        "said Lysis",
        "after",
        "named-prose-cue",
        "The trailing named Lysis cue explicitly attributes the complete prompt.",
    ),
    CandidateSpec(
        "meletus",
        "apology",
        "for he says that the sun is stone and the moon earth",
        "for he says that the sun is stone and the moon earth",
        "That is an extraordinary statement Meletus Why do you say that",
        "before",
        "alternating-exchange",
        (
            "Socrates names Meletus in the courtroom question; the prompt is the "
            "answer before Socrates addresses Meletus again."
        ),
    ),
)


UNRESOLVED_SPECS = (
    UnresolvedSpec(
        "menos-boy",
        "meno",
        (
            AttemptSpec(
                "Clearly Socrates it will be double",
                "Clearly Socrates it will be double",
                "direct-source-label",
            ),
            AttemptSpec(
                "Indeed Socrates I do not know",
                "Indeed Socrates I do not know",
                "direct-source-label",
            ),
        ),
        (
            "Every uniquely attributable Boy utterance is shorter than 3.0 "
            "seconds; extending one crosses a Socrates caption token."
        ),
        "cleinias",
        (
            "Use the resolved Cleinias youth reference as an explicit "
            "voice-source-reassignment if a distinct Meno's Boy clone is required."
        ),
    ),
    UnresolvedSpec(
        "lysis-and-menexenus",
        "lysis",
        (),
        (
            "The collective has only one-word joint replies ('Certainly') and "
            "narratorial reports ('They assented'); no 3.0-second joint speech "
            "interval is source-proven."
        ),
        "lysis",
        (
            "Reuse the resolved Lysis reference under an explicit "
            "voice-source-reassignment because Lysis is one constituent of the "
            "collective role."
        ),
    ),
    UnresolvedSpec(
        "sons-of-lysimachus-and-melesias",
        "laches",
        (
            AttemptSpec(
                "Certainly father this is he",
                "Certainly father this is he",
                "direct-source-label",
            ),
        ),
        (
            "The only explicitly labelled Sons utterance is shorter than 3.0 "
            "seconds; extending it crosses a Lysimachus caption token."
        ),
        "cleinias",
        (
            "Use the resolved Cleinias youth reference as an explicit "
            "voice-source-reassignment for the collective sons role."
        ),
    ),
)


EXPECTED_CHARACTER_IDS = tuple(
    sorted(
        [spec.character_id for spec in CANDIDATE_SPECS]
        + [spec.character_id for spec in UNRESOLVED_SPECS]
    )
)


def canonical_json(value: Any) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def pretty_json(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _display_path(path: Path) -> str:
    try:
        return str(path.absolute().relative_to(REPO_ROOT))
    except ValueError:
        return str(path.absolute())


def _occurrences(haystack: Sequence[str], needle: Sequence[str]) -> list[int]:
    if not needle:
        return []
    return [
        start
        for start in range(len(haystack) - len(needle) + 1)
        if tuple(haystack[start : start + len(needle)]) == tuple(needle)
    ]


def _select_cue(
    source_tokens: tuple[str, ...],
    cue_tokens: tuple[str, ...],
    *,
    prompt_start: int,
    prompt_end: int,
    position: str,
) -> tuple[int, int]:
    occurrences = _occurrences(source_tokens, cue_tokens)
    if position == "before":
        occurrences = [start for start in occurrences if start + len(cue_tokens) <= prompt_start]
        key = lambda start: prompt_start - (start + len(cue_tokens))
    elif position == "after":
        occurrences = [start for start in occurrences if start >= prompt_end]
        key = lambda start: start - prompt_end
    else:
        raise NarrativeCueError(f"unsupported cue position {position!r}")
    if not occurrences:
        raise NarrativeCueError("source cue has no occurrence on its required side")
    selected = min(occurrences, key=lambda start: (key(start), start))
    return selected, selected + len(cue_tokens)


def _source_context(
    source_tokens: tuple[str, ...], spec: CandidateSpec
) -> dict[str, Any]:
    prompt_tokens = normalize_words(spec.source_prompt)
    prompt_occurrences = _occurrences(source_tokens, prompt_tokens)
    if len(prompt_occurrences) != 1:
        raise NarrativeCueError(
            f"{spec.character_id} source prompt must occur exactly once; got "
            f"{len(prompt_occurrences)}"
        )
    prompt_start = prompt_occurrences[0]
    prompt_end = prompt_start + len(prompt_tokens)
    cue_tokens = normalize_words(spec.cue)
    cue_start, cue_end = _select_cue(
        source_tokens,
        cue_tokens,
        prompt_start=prompt_start,
        prompt_end=prompt_end,
        position=spec.cue_position,
    )
    context_start = max(0, min(prompt_start, cue_start) - 12)
    context_end = min(len(source_tokens), max(prompt_end, cue_end) + 12)
    context = " ".join(source_tokens[context_start:context_end])
    return {
        "textForm": "whitespace-and-punctuation-normalized-word-tokens-v1",
        "contextTokenSpan": {
            "start": context_start,
            "endExclusive": context_end,
        },
        "contextWordCount": context_end - context_start,
        "contextSha256": sha256_bytes(context.encode("utf-8")),
        "promptTokenSpan": {
            "start": prompt_start,
            "endExclusive": prompt_end,
        },
        "promptNormalized": " ".join(prompt_tokens),
        "promptSha256": sha256_bytes(" ".join(prompt_tokens).encode("utf-8")),
        "cueTokenSpan": {"start": cue_start, "endExclusive": cue_end},
        "cueNormalized": " ".join(cue_tokens),
        "cueSha256": sha256_bytes(" ".join(cue_tokens).encode("utf-8")),
    }


def _agreement(source_prompt: str, caption_prompt: str) -> dict[str, Any]:
    source_tokens = normalize_words(source_prompt)
    caption_tokens = normalize_words(caption_prompt)
    matcher = difflib.SequenceMatcher(
        None, source_tokens, caption_tokens, autojunk=False
    )
    differences = []
    for tag, source_start, source_end, caption_start, caption_end in matcher.get_opcodes():
        if tag == "equal":
            continue
        differences.append(
            {
                "operation": tag,
                "sourceTokens": list(source_tokens[source_start:source_end]),
                "captionTokens": list(caption_tokens[caption_start:caption_end]),
            }
        )
    return {
        "exactNormalizedTokens": source_tokens == caption_tokens,
        "tokenSequenceRatio": round(matcher.ratio(), 6),
        "differences": differences,
    }


def _video_rows(catalog: dict[str, Any], dialogue: str) -> list[dict[str, Any]]:
    rows = [row for row in catalog["dialogues"] if row["dialogue"] == dialogue]
    if len(rows) != 1:
        raise NarrativeCueError(f"no unique reference-source row for {dialogue}")
    return rows[0]["videos"]


def _caption_candidate(
    spec: CandidateSpec,
    *,
    catalog: dict[str, Any],
    caption_cache: Path,
) -> dict[str, Any]:
    matches: list[tuple[dict[str, Any], Any, Any, Path]] = []
    errors: list[dict[str, str]] = []
    for video in _video_rows(catalog, spec.dialogue):
        path = caption_cache_path(caption_cache, video["videoId"])
        if not path.is_file() or path.is_symlink():
            errors.append({"videoId": video["videoId"], "reason": "caption-cache-missing"})
            continue
        document = parse_json3_caption(path)
        try:
            result = align_caption_phrase(
                document, spec.caption_prompt, exact_only=True
            )
        except ReferenceSearchError as error:
            errors.append({"videoId": video["videoId"], "reason": str(error)})
            continue
        matches.append((video, document, result.match, path))
    if len(matches) != 1:
        raise NarrativeCueError(
            f"{spec.character_id} requires one exact caption match; got "
            f"{len(matches)} with errors={errors}"
        )
    video, document, match, path = matches[0]
    expanded_start, expanded_end, prompt = _piece_expanded_prompt(
        document, match.start_token, match.end_token_exclusive
    )
    if normalize_words(prompt) != normalize_words(spec.caption_prompt):
        raise NarrativeCueError(
            f"{spec.character_id} exact query does not cover complete caption pieces"
        )
    start_seconds = round(document.tokens[expanded_start].start_ms / 1000, 3)
    end_seconds = round(document.tokens[expanded_end - 1].end_ms / 1000, 3)
    duration_seconds = round(end_seconds - start_seconds, 3)
    if not MIN_DURATION_SECONDS <= duration_seconds <= MAX_DURATION_SECONDS:
        raise NarrativeCueError(
            f"{spec.character_id} duration {duration_seconds} is outside "
            f"{MIN_DURATION_SECONDS}-{MAX_DURATION_SECONDS} seconds"
        )
    boundary_audit = None
    if spec.required_preceding_caption_token is not None:
        if expanded_start == 0:
            raise NarrativeCueError(
                f"{spec.character_id} has no preceding caption token to audit"
            )
        preceding = document.tokens[expanded_start - 1]
        first = document.tokens[expanded_start]
        expected = normalize_words(spec.required_preceding_caption_token)
        if (
            expected != (preceding.normalized,)
            or preceding.end_ms != first.start_ms
            or round(preceding.end_ms / 1000, 3) != start_seconds
        ):
            raise NarrativeCueError(
                f"{spec.character_id} narrator-cue boundary is not exact"
            )
        boundary_audit = {
            "status": "preceding-narrator-cue-excluded-at-exact-token-boundary",
            "precedingCaptionToken": preceding.normalized,
            "precedingCaptionTokenIndex": expanded_start - 1,
            "precedingCaptionTokenEndSeconds": round(preceding.end_ms / 1000, 3),
            "candidateFirstCaptionToken": first.normalized,
            "candidateFirstCaptionTokenIndex": expanded_start,
            "candidateStartSeconds": start_seconds,
            "boundaryGapSeconds": round((first.start_ms - preceding.end_ms) / 1000, 3),
        }
    result = {
        "videoId": video["videoId"],
        "videoTitle": video["title"],
        "videoUrl": video["url"],
        "captionPath": _display_path(path),
        "captionSha256": sha256_file(path),
        "prompt": prompt,
        "promptNormalized": " ".join(normalize_words(prompt)),
        "promptSha256": sha256_bytes(prompt.encode("utf-8")),
        "captionTokenSpan": {
            "start": expanded_start,
            "endExclusive": expanded_end,
        },
        "startSeconds": start_seconds,
        "endSeconds": end_seconds,
        "durationSeconds": duration_seconds,
        "confidence": 1.0,
        "exactTokenRatio": 1.0,
        "nearestDistinctAlternativeConfidence": None,
    }
    if boundary_audit is not None:
        result["boundaryAudit"] = boundary_audit
    return result


def _attempt_rows(
    spec: UnresolvedSpec,
    *,
    catalog: dict[str, Any],
    caption_cache: Path,
) -> list[dict[str, Any]]:
    rows = []
    videos = _video_rows(catalog, spec.dialogue)
    for attempt in spec.attempts:
        hits = []
        failures = []
        for video in videos:
            path = caption_cache_path(caption_cache, video["videoId"])
            document = parse_json3_caption(path)
            try:
                match = align_caption_phrase(
                    document, attempt.caption_prompt, exact_only=True
                ).match
            except ReferenceSearchError as error:
                failures.append({"videoId": video["videoId"], "reason": str(error)})
                continue
            start = round(match.start_seconds, 3)
            end = round(match.end_seconds, 3)
            hits.append(
                {
                    "videoId": video["videoId"],
                    "startSeconds": start,
                    "endSeconds": end,
                    "durationSeconds": round(end - start, 3),
                    "captionTokenSpan": {
                        "start": match.start_token,
                        "endExclusive": match.end_token_exclusive,
                    },
                }
            )
        if any(
            MIN_DURATION_SECONDS <= hit["durationSeconds"] <= MAX_DURATION_SECONDS
            for hit in hits
        ):
            raise NarrativeCueError(
                f"unresolved {spec.character_id} has a duration-eligible attempt"
            )
        rows.append(
            {
                "sourcePromptNormalized": " ".join(
                    normalize_words(attempt.source_prompt)
                ),
                "captionPromptNormalized": " ".join(
                    normalize_words(attempt.caption_prompt)
                ),
                "attributionBasis": attempt.attribution_basis,
                "matches": hits,
                "failures": failures,
                "status": "rejected-duration-below-minimum",
            }
        )
    return rows


def build_ledger(
    *,
    characters_path: Path = DEFAULT_CHARACTERS,
    references_path: Path = DEFAULT_REFERENCES,
    registry_path: Path = DEFAULT_REGISTRY,
    transcript_cache: Path = DEFAULT_TRANSCRIPT_CACHE,
    caption_cache: Path = DEFAULT_CAPTION_CACHE,
) -> dict[str, Any]:
    catalog = load_catalog(references_path)
    registry, registry_sha256, _ = load_registry(registry_path)
    characters = json.loads(characters_path.read_text(encoding="utf-8"))
    canonical_ids = {row["characterId"] for row in characters["characters"]}
    if set(EXPECTED_CHARACTER_IDS) - canonical_ids:
        raise NarrativeCueError("research set contains a non-canonical character")

    source_cache: dict[str, tuple[Any, Path, tuple[str, ...], str]] = {}
    records = []
    candidate_ids: dict[str, str] = {}
    for spec in CANDIDATE_SPECS:
        if spec.dialogue not in source_cache:
            source = registry[spec.dialogue]
            path = transcript_cache_path(transcript_cache, source)
            if not path.is_file() or path.is_symlink():
                raise NarrativeCueError(f"missing transcript cache {path}")
            payload = path.read_bytes()
            if sha256_bytes(payload) != source.expected_sha256:
                raise NarrativeCueError(f"stale transcript cache {path}")
            extracted = extract_jowett_text(payload, source=source)
            tokens = normalize_words(extracted)
            source_cache[spec.dialogue] = (
                source,
                path,
                tokens,
                sha256_bytes(" ".join(tokens).encode("utf-8")),
            )
        source, transcript_path, source_tokens, normalized_source_sha = source_cache[
            spec.dialogue
        ]
        context = _source_context(source_tokens, spec)
        caption = _caption_candidate(
            spec, catalog=catalog, caption_cache=caption_cache
        )
        identity = {
            "characterId": spec.character_id,
            "dialogue": spec.dialogue,
            "videoId": caption["videoId"],
            "transcriptSha256": source.expected_sha256,
            "captionSha256": caption["captionSha256"],
            "sourcePromptSha256": context["promptSha256"],
            "captionPromptSha256": caption["promptSha256"],
            "startSeconds": caption["startSeconds"],
            "endSeconds": caption["endSeconds"],
        }
        candidate_id = "narrative-cue-" + sha256_bytes(canonical_json(identity))[:24]
        candidate_ids[spec.character_id] = candidate_id
        records.append(
            {
                "characterId": spec.character_id,
                "dialogue": spec.dialogue,
                "status": "attributable-reference-candidate",
                "candidateId": candidate_id,
                "confidence": {
                    "classification": "automatic-source-proof",
                    "captionMatch": 1.0,
                    "attributionBasis": spec.attribution_basis,
                    "stateRule": spec.state_rule,
                },
                "source": {
                    "provider": source.provider,
                    "format": source.source_format,
                    "transcriptUrl": source.transcript_url,
                    "translator": source.translator,
                    "translationException": source.translation_exception,
                    "transcriptPath": _display_path(transcript_path),
                    "transcriptSha256": source.expected_sha256,
                    "normalizedExtractedSourceSha256": normalized_source_sha,
                    "context": context,
                },
                "caption": caption,
                "sourceCaptionAgreement": _agreement(
                    spec.source_prompt, caption["prompt"]
                ),
                "safety": {
                    "manualListeningPerformed": False,
                    "materialized": False,
                    "castWritePerformed": False,
                    "acousticSpeakerPurityClaimed": False,
                    "promptContainsOnlyAttributedSpeechUnderSourceRule": True,
                },
            }
        )

    unresolved = []
    for spec in UNRESOLVED_SPECS:
        unresolved.append(
            {
                "characterId": spec.character_id,
                "dialogue": spec.dialogue,
                "status": "unresolved-no-duration-eligible-source-proof",
                "confidence": {
                    "classification": "unresolved",
                    "captionMatch": None,
                    "attributionBasis": None,
                },
                "failReason": spec.fail_reason,
                "attempts": _attempt_rows(
                    spec, catalog=catalog, caption_cache=caption_cache
                ),
                "proposedSourceReassignment": {
                    "status": "proposal-not-applied",
                    "reason": "voice-source-reassignment",
                    "sourceCharacterId": spec.fallback_character_id,
                    "sourceCandidateId": candidate_ids[spec.fallback_character_id],
                    "rationale": spec.fallback_reason,
                },
                "safety": {
                    "manualListeningPerformed": False,
                    "materialized": False,
                    "castWritePerformed": False,
                },
            }
        )

    inputs = {
        "characters": {
            "path": _display_path(characters_path),
            "sha256": sha256_file(characters_path),
        },
        "referenceSources": {
            "path": _display_path(references_path),
            "sha256": sha256_file(references_path),
        },
        "transcriptRegistry": {
            "path": _display_path(registry_path),
            "sha256": registry_sha256,
        },
        "alignmentScript": {
            "path": "scripts/audio/align_jowett_voice_references.py",
            "sha256": sha256_file(
                REPO_ROOT / "scripts" / "audio" / "align_jowett_voice_references.py"
            ),
        },
        "captionFinderScript": {
            "path": "scripts/audio/find_youtube_reference.py",
            "sha256": sha256_file(
                REPO_ROOT / "scripts" / "audio" / "find_youtube_reference.py"
            ),
        },
        "builderScript": {
            "path": _display_path(SCRIPT_PATH),
            "sha256": sha256_file(SCRIPT_PATH),
        },
    }
    ledger: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "narrative-cue-character-reference-research",
        "status": "research-complete-no-cast-writes",
        "policy": {
            "selectionPolicy": "source-explicit-cue-or-deterministic-exchange-v1",
            "minimumDurationSeconds": MIN_DURATION_SECONDS,
            "maximumDurationSeconds": MAX_DURATION_SECONDS,
            "captionMatch": "unique-exact-normalized-token-sequence",
            "manualListeningRequired": False,
            "automaticCastWrites": False,
            "unresolvedPolicy": "fail-closed-and-propose-source-reassignment",
        },
        "inputs": inputs,
        "summary": {
            "characterCount": len(EXPECTED_CHARACTER_IDS),
            "resolvedCount": len(records),
            "unresolvedCount": len(unresolved),
            "resolvedCharacterIds": sorted(candidate_ids),
            "unresolvedCharacterIds": sorted(
                row["characterId"] for row in unresolved
            ),
        },
        "records": sorted(
            records + unresolved, key=lambda row: row["characterId"]
        ),
    }
    ledger["ledgerSha256"] = sha256_bytes(canonical_json(ledger))
    return ledger


def validate_ledger(ledger: dict[str, Any], *, verify_live_inputs: bool = True) -> None:
    if ledger.get("schemaVersion") != 1:
        raise NarrativeCueError("ledger schemaVersion must be 1")
    if ledger.get("artifactKind") != "narrative-cue-character-reference-research":
        raise NarrativeCueError("ledger artifactKind is invalid")
    expected_hash = ledger.get("ledgerSha256")
    if not isinstance(expected_hash, str) or not SHA256.fullmatch(expected_hash):
        raise NarrativeCueError("ledgerSha256 is invalid")
    unsigned = {key: value for key, value in ledger.items() if key != "ledgerSha256"}
    if sha256_bytes(canonical_json(unsigned)) != expected_hash:
        raise NarrativeCueError("ledgerSha256 does not bind the unsigned ledger")
    records = ledger.get("records")
    if not isinstance(records, list):
        raise NarrativeCueError("ledger records must be an array")
    ids = [row.get("characterId") for row in records if isinstance(row, dict)]
    if ids != sorted(EXPECTED_CHARACTER_IDS):
        raise NarrativeCueError("ledger character coverage/order is not exact")
    for row in records:
        status = row.get("status")
        if status == "attributable-reference-candidate":
            caption = row.get("caption")
            if not isinstance(caption, dict):
                raise NarrativeCueError("resolved record has no caption evidence")
            duration = caption.get("durationSeconds")
            if not isinstance(duration, (int, float)) or not (
                MIN_DURATION_SECONDS <= duration <= MAX_DURATION_SECONDS
            ):
                raise NarrativeCueError("resolved record duration is outside gate")
            if caption.get("confidence") != 1.0 or caption.get("exactTokenRatio") != 1.0:
                raise NarrativeCueError("resolved record is not an exact caption match")
            if row.get("safety", {}).get("castWritePerformed") is not False:
                raise NarrativeCueError("resolved record claims a cast write")
            if row.get("characterId") == "cleinias":
                boundary = caption.get("boundaryAudit")
                if boundary != {
                    "status": "preceding-narrator-cue-excluded-at-exact-token-boundary",
                    "precedingCaptionToken": "replied",
                    "precedingCaptionTokenIndex": caption["captionTokenSpan"]["start"] - 1,
                    "precedingCaptionTokenEndSeconds": caption["startSeconds"],
                    "candidateFirstCaptionToken": "that",
                    "candidateFirstCaptionTokenIndex": caption["captionTokenSpan"]["start"],
                    "candidateStartSeconds": caption["startSeconds"],
                    "boundaryGapSeconds": 0.0,
                }:
                    raise NarrativeCueError(
                        "Cleinias does not exclude the narrator cue at an exact boundary"
                    )
        elif status == "unresolved-no-duration-eligible-source-proof":
            if not row.get("failReason") or row.get(
                "proposedSourceReassignment", {}
            ).get("status") != "proposal-not-applied":
                raise NarrativeCueError("unresolved record lacks fail-closed evidence")
        else:
            raise NarrativeCueError(f"invalid record status {status!r}")
    if verify_live_inputs:
        for value in ledger.get("inputs", {}).values():
            path = value.get("path")
            digest = value.get("sha256")
            if not isinstance(path, str) or not isinstance(digest, str):
                raise NarrativeCueError("ledger input binding is malformed")
            resolved = Path(path)
            if not resolved.is_absolute():
                resolved = REPO_ROOT / resolved
            if not resolved.is_file() or resolved.is_symlink():
                raise NarrativeCueError(f"ledger input is missing: {resolved}")
            if sha256_file(resolved) != digest:
                raise NarrativeCueError(f"ledger input hash is stale: {resolved}")
        rebuilt = build_ledger()
        if ledger != rebuilt:
            raise NarrativeCueError(
                "ledger does not equal a fresh deterministic rebuild from live evidence"
            )


def _candidate_report_inputs(
    ledger: dict[str, Any], *, ledger_path: Path
) -> dict[str, dict[str, Any]]:
    inputs = ledger["inputs"]
    return {
        "registry": dict(inputs["transcriptRegistry"]),
        "characters": dict(inputs["characters"]),
        "referenceSources": dict(inputs["referenceSources"]),
        "script": dict(inputs["builderScript"]),
        "researchLedger": {
            "path": _display_path(ledger_path),
            "sha256": sha256_bytes(pretty_json(ledger)),
        },
    }


def _normalized_candidate(
    row: dict[str, Any], *, report_inputs: dict[str, dict[str, Any]], ledger_sha: str
) -> dict[str, Any]:
    caption = row["caption"]
    source = row["source"]
    context = source["context"]
    prompt_span = context["promptTokenSpan"]
    context_span = context["contextTokenSpan"]
    source_agreement_identity = {
        "ledgerSha256": ledger_sha,
        "candidateId": row["candidateId"],
        "transcriptSha256": source["transcriptSha256"],
        "captionSha256": caption["captionSha256"],
        "sourceContextSha256": context["contextSha256"],
        "sourcePromptSha256": context["promptSha256"],
        "captionPromptSha256": caption["promptSha256"],
        "sourceCaptionAgreement": row["sourceCaptionAgreement"],
    }
    input_hashes = {
        name: record["sha256"] for name, record in report_inputs.items()
    }
    return {
        "candidateId": row["candidateId"],
        "status": "automatically-eligible-reference-interval",
        "dialogue": row["dialogue"],
        "characterId": row["characterId"],
        "videoId": caption["videoId"],
        "sourceTurn": {
            "evidenceKind": "narrative-cue-attributed-source-span",
            "attributionBasis": row["confidence"]["attributionBasis"],
            "stateRule": row["confidence"]["stateRule"],
            "sourceContextTokenSpan": context_span,
            "sourcePromptTokenSpan": prompt_span,
            "sourceCueTokenSpan": context["cueTokenSpan"],
            "normalizedTextSha256": context["contextSha256"],
            "normalizedWordCount": context["contextWordCount"],
            "windowStartWord": prompt_span["start"] - context_span["start"],
            "windowWordCount": prompt_span["endExclusive"] - prompt_span["start"],
            "windowSha256": context["promptSha256"],
            "containsQuotedSpeech": False,
            "fullTextPersisted": False,
        },
        "alignment": {
            "expectedPrompt": caption["prompt"],
            "expectedPromptSha256": caption["promptSha256"],
            "expectedPromptWordCount": len(normalize_words(caption["prompt"])),
            "startSeconds": caption["startSeconds"],
            "endSeconds": caption["endSeconds"],
            "durationSeconds": caption["durationSeconds"],
            "captionTokenSpan": caption["captionTokenSpan"],
            "confidence": caption["confidence"],
            "exactTokenRatio": caption["exactTokenRatio"],
            "nearestDistinctAlternativeConfidence": caption[
                "nearestDistinctAlternativeConfidence"
            ],
        },
        "sourceAgreement": row["sourceCaptionAgreement"],
        "sourceAgreementSha256": sha256_bytes(
            canonical_json(source_agreement_identity)
        ),
        "provenance": {
            "registryPath": report_inputs["registry"]["path"],
            "registrySha256": report_inputs["registry"]["sha256"],
            "charactersPath": report_inputs["characters"]["path"],
            "charactersSha256": report_inputs["characters"]["sha256"],
            "referenceSourcesPath": report_inputs["referenceSources"]["path"],
            "referenceSourcesSha256": report_inputs["referenceSources"]["sha256"],
            "transcriptPath": source["transcriptPath"],
            "transcriptProvider": source["provider"],
            "transcriptFormat": source["format"],
            "transcriptUrl": source["transcriptUrl"],
            "transcriptTranslator": source["translator"],
            "translationException": source["translationException"],
            "transcriptSha256": source["transcriptSha256"],
            "captionPath": caption["captionPath"],
            "captionSha256": caption["captionSha256"],
            "scriptPath": report_inputs["script"]["path"],
            "scriptSha256": report_inputs["script"]["sha256"],
            "researchLedgerPath": report_inputs["researchLedger"]["path"],
            "researchLedgerSha256": report_inputs["researchLedger"]["sha256"],
            "inputBindingSha256": sha256_bytes(canonical_json(input_hashes)),
        },
        "safety": {
            "singleCharacterUnderEditionRule": True,
            "singleCharacterBasis": (
                "source-explicit-cue-or-deterministic-exchange-v1"
            ),
            "reportedSpeechExcluded": True,
            "captionPaddingSeconds": 0,
            "operatorListeningRequired": False,
            "acousticSpeakerPurityVerified": False,
            "castWritePerformed": False,
        },
        **(
            {"boundaryAudit": caption["boundaryAudit"]}
            if "boundaryAudit" in caption
            else {}
        ),
    }


def build_candidate_reports(
    ledger: dict[str, Any], *, ledger_path: Path = DEFAULT_OUTPUT
) -> dict[str, dict[str, Any]]:
    validate_ledger(ledger, verify_live_inputs=False)
    report_inputs = _candidate_report_inputs(ledger, ledger_path=ledger_path)
    resolved = [
        row
        for row in ledger["records"]
        if row["status"] == "attributable-reference-candidate"
    ]
    unresolved = [
        {
            "characterId": row["characterId"],
            "dialogue": row["dialogue"],
            "status": row["status"],
            "failReason": row["failReason"],
            "proposedSourceReassignment": row["proposedSourceReassignment"],
        }
        for row in ledger["records"]
        if row["status"] == "unresolved-no-duration-eligible-source-proof"
    ]
    reports: dict[str, dict[str, Any]] = {}
    for dialogue in sorted({row["dialogue"] for row in resolved}):
        candidates = [
            _normalized_candidate(
                row,
                report_inputs=report_inputs,
                ledger_sha=ledger["ledgerSha256"],
            )
            for row in resolved
            if row["dialogue"] == dialogue
        ]
        report: dict[str, Any] = {
            "schemaVersion": 1,
            "artifactKind": "jowett-caption-character-reference-alignment",
            "status": "reference-intervals-emitted-no-cast-writes",
            "selection": {"dialogues": [dialogue]},
            "inputs": report_inputs,
            "missingInputs": [],
            "policy": {
                "candidateContract": "jowett-caption-cast-candidate-v1",
                "derivation": "source-explicit-cue-or-deterministic-exchange-v1",
                "captionMatch": "unique-exact-normalized-token-sequence",
                "manualListeningRequired": False,
                "automaticCastWrites": False,
            },
            "derivation": {
                "researchArtifactKind": ledger["artifactKind"],
                "researchLedgerSha256": ledger["ledgerSha256"],
                "unresolvedCharacterIds": ledger["summary"][
                    "unresolvedCharacterIds"
                ],
            },
            "candidates": candidates,
            "referenceAnchorAudits": [],
            "unresolved": unresolved,
            "summary": {
                "candidateCount": len(candidates),
                "candidateCharacterIds": sorted(
                    candidate["characterId"] for candidate in candidates
                ),
                "unresolvedCount": len(unresolved),
            },
        }
        report["reportSha256"] = sha256_bytes(canonical_json(report))
        reports[dialogue] = report
    validate_candidate_reports(
        reports, ledger=ledger, ledger_path=ledger_path, verify_live_inputs=False
    )
    return reports


def validate_candidate_reports(
    reports: dict[str, dict[str, Any]],
    *,
    ledger: dict[str, Any],
    ledger_path: Path = DEFAULT_OUTPUT,
    verify_live_inputs: bool = True,
) -> None:
    validate_ledger(ledger, verify_live_inputs=verify_live_inputs)
    expected_rows = {
        row["candidateId"]: row
        for row in ledger["records"]
        if row["status"] == "attributable-reference-candidate"
    }
    expected_dialogues = sorted({row["dialogue"] for row in expected_rows.values()})
    if sorted(reports) != expected_dialogues:
        raise NarrativeCueError("candidate report dialogue coverage is not exact")
    expected_inputs = _candidate_report_inputs(ledger, ledger_path=ledger_path)
    seen: set[str] = set()
    for dialogue, report in reports.items():
        frozen = {key: value for key, value in report.items() if key != "reportSha256"}
        if (
            report.get("schemaVersion") != 1
            or report.get("artifactKind")
            != "jowett-caption-character-reference-alignment"
            or report.get("status") != "reference-intervals-emitted-no-cast-writes"
            or report.get("selection") != {"dialogues": [dialogue]}
            or report.get("inputs") != expected_inputs
            or report.get("missingInputs") != []
            or report.get("reportSha256") != sha256_bytes(canonical_json(frozen))
        ):
            raise NarrativeCueError(f"invalid normalized candidate report {dialogue}")
        if report.get("derivation", {}).get("unresolvedCharacterIds") != ledger[
            "summary"
        ]["unresolvedCharacterIds"]:
            raise NarrativeCueError("candidate report dropped unresolved roles")
        for candidate in report.get("candidates", []):
            candidate_id = candidate.get("candidateId")
            source = expected_rows.get(candidate_id)
            if (
                source is None
                or candidate_id in seen
                or candidate.get("status")
                != "automatically-eligible-reference-interval"
                or candidate.get("dialogue") != dialogue
                or candidate.get("characterId") != source["characterId"]
                or candidate.get("videoId") != source["caption"]["videoId"]
                or candidate.get("alignment", {}).get("startSeconds")
                != source["caption"]["startSeconds"]
                or candidate.get("alignment", {}).get("endSeconds")
                != source["caption"]["endSeconds"]
                or candidate.get("safety", {}).get(
                    "singleCharacterUnderEditionRule"
                )
                is not True
                or candidate.get("safety", {}).get("reportedSpeechExcluded")
                is not True
                or candidate.get("safety", {}).get("operatorListeningRequired")
                is not False
                or candidate.get("safety", {}).get("castWritePerformed") is not False
                or not SHA256.fullmatch(
                    str(candidate.get("sourceAgreementSha256", ""))
                )
            ):
                raise NarrativeCueError(
                    f"candidate report contains an invalid candidate {candidate_id!r}"
                )
            seen.add(candidate_id)
    if seen != set(expected_rows):
        raise NarrativeCueError("candidate report candidate coverage is not exact")
    if verify_live_inputs:
        for name, record in expected_inputs.items():
            path = Path(record["path"])
            if not path.is_absolute():
                path = REPO_ROOT / path
            if not path.is_file() or path.is_symlink():
                raise NarrativeCueError(f"candidate report input is missing: {name}")
            if sha256_file(path) != record["sha256"]:
                raise NarrativeCueError(f"candidate report input is stale: {name}")


def load_candidate_reports(root: Path) -> dict[str, dict[str, Any]]:
    reports = {}
    for path in sorted(root.glob("*.report.json")):
        dialogue = path.name.removesuffix(".report.json")
        reports[dialogue] = json.loads(path.read_text(encoding="utf-8"))
    return reports


def write_candidate_reports(
    root: Path, reports: dict[str, dict[str, Any]]
) -> None:
    confined_root = DEFAULT_OUTPUT_ROOT.absolute()
    destination_root = root.absolute()
    try:
        destination_root.relative_to(confined_root)
    except ValueError as error:
        raise NarrativeCueError(
            f"candidate report root must remain under {confined_root}"
        ) from error
    destination_root.mkdir(parents=True, exist_ok=True)
    for dialogue, report in reports.items():
        destination = destination_root / f"{dialogue}.report.json"
        handle = tempfile.NamedTemporaryFile(
            mode="wb",
            prefix=f".{destination.name}.",
            dir=destination.parent,
            delete=False,
        )
        temporary = Path(handle.name)
        try:
            with handle:
                handle.write(pretty_json(report))
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary, destination)
        finally:
            temporary.unlink(missing_ok=True)


def write_ledger(path: Path, ledger: dict[str, Any]) -> None:
    root = DEFAULT_OUTPUT_ROOT.absolute()
    destination = path.absolute()
    try:
        destination.relative_to(root)
    except ValueError as error:
        raise NarrativeCueError(f"output must remain under {root}") from error
    destination.parent.mkdir(parents=True, exist_ok=True)
    handle = tempfile.NamedTemporaryFile(
        mode="w",
        encoding="utf-8",
        prefix=f".{destination.name}.",
        dir=destination.parent,
        delete=False,
    )
    temporary = Path(handle.name)
    try:
        with handle:
            handle.write(pretty_json(ledger).decode("utf-8"))
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--validate", type=Path)
    parser.add_argument(
        "--candidate-report-root", type=Path, default=DEFAULT_CANDIDATE_REPORT_ROOT
    )
    parser.add_argument("--validate-candidate-reports", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.validate is not None:
        payload = json.loads(args.validate.read_text(encoding="utf-8"))
        validate_ledger(payload)
        print(f"validated {args.validate}")
        return 0
    if args.validate_candidate_reports is not None:
        payload = json.loads(args.output.read_text(encoding="utf-8"))
        reports = load_candidate_reports(args.validate_candidate_reports)
        validate_candidate_reports(
            reports, ledger=payload, ledger_path=args.output
        )
        print(
            f"validated {len(reports)} candidate reports under "
            f"{args.validate_candidate_reports}"
        )
        return 0
    ledger = build_ledger()
    validate_ledger(ledger)
    reports = build_candidate_reports(ledger, ledger_path=args.output)
    write_ledger(args.output, ledger)
    write_candidate_reports(args.candidate_report_root, reports)
    validate_candidate_reports(reports, ledger=ledger, ledger_path=args.output)
    print(
        f"wrote {args.output}: resolved={ledger['summary']['resolvedCount']} "
        f"unresolved={ledger['summary']['unresolvedCount']} "
        f"candidateReports={len(reports)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
