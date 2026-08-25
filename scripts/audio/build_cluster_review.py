#!/usr/bin/env python3
"""Build a scratch-only human review UI for verified v2 speaker clusters.

Character choices are bound to CharacterCatalog v3 voice-owner appearances.
"""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import html
import json
import math
import os
import re
import shutil
import tempfile
from collections.abc import Iterator
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import quote

import cluster_audiobook_speakers_v2 as cluster_v2
from find_youtube_reference import (
    CaptionDocument,
    ReferenceSearchError,
    parse_json3_caption,
)


DEFAULT_QUEUE = Path("scratch/audio-speaker-cluster-v2/queue.json")
DEFAULT_CHARACTERS = Path("audio/characters.json")
DEFAULT_OUTPUT = Path("scratch/audio-speaker-cluster-review-v2")
REVIEW_STATUS = "anonymous-cluster-human-review-packet-v2"
DECISION_STATUS = "anonymous-cluster-human-review-decisions-v2"
MAX_QUEUE_BYTES = 32 * 1024 * 1024
MAX_CHARACTER_BYTES = 16 * 1024 * 1024
MAX_PLAN_BYTES = 16 * 1024 * 1024
MAX_MANIFEST_BYTES = 32 * 1024 * 1024
CAPTION_CONTEXT_SECONDS = 4.0
MAX_CAPTION_EXCERPT_CHARACTERS = 700
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
IDENTIFIER_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
ROLE_FLAGS = {
    "source-speaker",
    "commentary-narrator",
    "dream-figure",
    "reported-speaker",
    "collective",
    "personification",
}
PERFORMANCE_ROLES = {"voice-owner", "reported-only", "review-required"}
SPECIAL_CHOICES = ("unmapped", "mixed/impure")
EXECUTION_FIELDS = {
    "ffmpeg",
    "segmentationFfmpeg",
    "ffmpegMatchesSegmentation",
    "dotsSourceCommit",
    "torch",
    "cuda",
    "gpu",
    "embeddingDeterminism",
    "plannerScriptSha256",
    "coreScriptSha256",
}


class ClusterReviewError(ValueError):
    """Raised when evidence cannot support a provisional human review UI."""


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")


def _atomic_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_bytes(payload)
    temporary.replace(path)


def _read_json(path: Path, label: str, *, maximum_bytes: int) -> dict[str, Any]:
    if path.is_symlink():
        raise ClusterReviewError(f"{label} must not be a symlink: {path}")
    try:
        size = path.stat().st_size
    except FileNotFoundError as error:
        raise ClusterReviewError(f"missing {label}: {path}") from error
    if not path.is_file() or not 0 < size <= maximum_bytes:
        raise ClusterReviewError(
            f"{label} must be a regular 1..{maximum_bytes} byte file: {path}"
        )
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ClusterReviewError(f"cannot parse {label}: {path}: {error}") from error
    if not isinstance(payload, dict):
        raise ClusterReviewError(f"{label} must contain a JSON object")
    return payload


def _relative_repo_path(value: Any, root: Path, label: str) -> Path:
    if not isinstance(value, str) or not value or "\\" in value:
        raise ClusterReviewError(f"{label} must be a repository-relative POSIX path")
    pure = PurePosixPath(value)
    if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
        raise ClusterReviewError(f"{label} must be a confined repository path")
    candidate = root.joinpath(*pure.parts)
    try:
        resolved = candidate.resolve(strict=False)
        resolved.relative_to(root)
    except ValueError as error:
        raise ClusterReviewError(f"{label} escapes the repository: {value}") from error
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise ClusterReviewError(f"{label} traverses a symlink: {value}")
        if parent == root:
            break
    return candidate


def _input_path(path: Path, root: Path, label: str) -> Path:
    candidate = path if path.is_absolute() else root / path
    try:
        resolved = candidate.resolve(strict=True)
        resolved.relative_to(root)
    except FileNotFoundError as error:
        raise ClusterReviewError(f"missing {label}: {path}") from error
    except ValueError as error:
        raise ClusterReviewError(f"{label} escapes the repository: {path}") from error
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise ClusterReviewError(f"{label} traverses a symlink: {path}")
        if parent == root:
            break
    if not resolved.is_file():
        raise ClusterReviewError(f"{label} must be a regular non-symlink file")
    return resolved


def _scratch_output(path: Path, root: Path) -> Path:
    candidate = path if path.is_absolute() else root / path
    scratch = root / "scratch"
    scratch.mkdir(exist_ok=True)
    try:
        resolved = candidate.resolve(strict=False)
        relative = resolved.relative_to(scratch.resolve(strict=True))
    except ValueError as error:
        raise ClusterReviewError(
            "review output must remain below repository scratch/"
        ) from error
    if not relative.parts:
        raise ClusterReviewError("review output may not replace the scratch root")
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise ClusterReviewError("review output may not traverse symlinks")
        if parent == root:
            break
    if candidate.exists() and not candidate.is_dir():
        raise ClusterReviewError("review output must be a directory")
    return resolved


@contextlib.contextmanager
def _repo_cwd(root: Path) -> Iterator[None]:
    previous = Path.cwd()
    os.chdir(root)
    try:
        yield
    finally:
        os.chdir(previous)


def _verify_file_evidence(record: dict[str, Any], root: Path, label: str) -> Path:
    path = _relative_repo_path(record.get("path"), root, f"{label} path")
    if path.is_symlink() or not path.is_file():
        raise ClusterReviewError(f"missing or non-regular {label}: {path}")
    size = record.get("bytes")
    expected_hash = record.get("sha256")
    if (
        isinstance(size, bool)
        or not isinstance(size, int)
        or size <= 0
        or not isinstance(expected_hash, str)
        or SHA256_RE.fullmatch(expected_hash) is None
    ):
        raise ClusterReviewError(f"{label} has invalid byte or hash evidence")
    if path.stat().st_size != size:
        raise ClusterReviewError(f"{label} byte count is stale: {path}")
    if file_sha256(path) != expected_hash:
        raise ClusterReviewError(f"{label} SHA-256 mismatch: {path}")
    return path


def _verify_file_size(record: dict[str, Any], root: Path, label: str) -> Path:
    path = _relative_repo_path(record.get("path"), root, f"{label} path")
    if path.is_symlink() or not path.is_file():
        raise ClusterReviewError(f"missing or non-regular {label}: {path}")
    size = record.get("bytes")
    if isinstance(size, bool) or not isinstance(size, int) or size <= 0:
        raise ClusterReviewError(f"{label} has invalid byte evidence")
    if path.stat().st_size != size:
        raise ClusterReviewError(f"{label} byte count is stale: {path}")
    return path


def _validate_queue(path: Path, root: Path) -> dict[str, Any]:
    queue = _read_json(path, "v2 cluster queue", maximum_bytes=MAX_QUEUE_BYTES)
    expected_path = _relative_repo_path(
        queue.get("queuePath"), root, "queue payload path"
    )
    if path.resolve(strict=True) != expected_path.resolve(strict=True):
        raise ClusterReviewError("saved queue is not at its bound queuePath")
    try:
        cluster_v2.validate_queue(queue)
    except cluster_v2.CorpusClusterError as error:
        raise ClusterReviewError(f"invalid or stale v2 queue: {error}") from error
    return queue


def _string_array(value: Any, label: str) -> list[str]:
    if (
        not isinstance(value, list)
        or any(not isinstance(item, str) or not item for item in value)
        or len(set(value)) != len(value)
    ):
        raise ClusterReviewError(f"{label} must be a unique non-empty string array")
    return value


def _load_rosters(path: Path) -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]]]:
    catalog = _read_json(
        path, "canonical character catalog", maximum_bytes=MAX_CHARACTER_BYTES
    )
    if (
        set(catalog)
        != {
            "schemaVersion",
            "status",
            "updatedAt",
            "source",
            "dialogues",
            "characters",
        }
        or catalog.get("schemaVersion") != 3
    ):
        raise ClusterReviewError("canonical character catalog shape is unsupported")
    dialogues = catalog.get("dialogues")
    characters = catalog.get("characters")
    if not isinstance(dialogues, list) or not isinstance(characters, list):
        raise ClusterReviewError("canonical character catalog arrays are missing")

    roster_ids: dict[str, list[str]] = {}
    for index, row in enumerate(dialogues):
        if not isinstance(row, dict):
            raise ClusterReviewError(f"character roster {index} must be an object")
        dialogue = row.get("dialogue")
        if (
            not isinstance(dialogue, str)
            or IDENTIFIER_RE.fullmatch(dialogue) is None
            or dialogue in roster_ids
        ):
            raise ClusterReviewError(
                f"character roster {index} has an invalid dialogue"
            )
        ids = _string_array(row.get("characterIds"), f"{dialogue} characterIds")
        if any(IDENTIFIER_RE.fullmatch(item) is None for item in ids):
            raise ClusterReviewError(
                f"{dialogue} roster contains an invalid character id"
            )
        roster_ids[dialogue] = ids

    appearances: dict[str, dict[str, dict[str, Any]]] = {
        dialogue: {} for dialogue in roster_ids
    }
    character_ids: set[str] = set()
    for index, character in enumerate(characters):
        if not isinstance(character, dict) or set(character) != {
            "characterId",
            "displayName",
            "identityStatus",
            "aliases",
            "appearances",
        }:
            raise ClusterReviewError(f"canonical character {index} has invalid fields")
        character_id = character.get("characterId")
        display_name = character.get("displayName")
        _string_array(character.get("aliases"), f"character {index} aliases")
        raw_appearances = character.get("appearances")
        if (
            not isinstance(character_id, str)
            or IDENTIFIER_RE.fullmatch(character_id) is None
            or character_id in character_ids
            or not isinstance(display_name, str)
            or not display_name
            or not isinstance(raw_appearances, list)
            or not raw_appearances
        ):
            raise ClusterReviewError(f"canonical character {index} is invalid")
        character_ids.add(character_id)
        seen_dialogues: set[str] = set()
        for appearance_index, appearance in enumerate(raw_appearances):
            allowed = {
                "dialogue",
                "editorialStatus",
                "performanceRole",
                "roleFlags",
                "sourceLabels",
                "sourceAliases",
                "sourceAttributions",
                "editorialNote",
            }
            if not isinstance(appearance, dict) or not set(appearance) <= allowed:
                raise ClusterReviewError(
                    f"{character_id} appearance {appearance_index} has invalid fields"
                )
            dialogue = appearance.get("dialogue")
            performance_role = appearance.get("performanceRole")
            roles = _string_array(
                appearance.get("roleFlags"),
                f"{character_id} {dialogue} roleFlags",
            )
            for field in ("sourceLabels", "sourceAliases", "sourceAttributions"):
                _string_array(
                    appearance.get(field), f"{character_id} {dialogue} {field}"
                )
            if (
                dialogue not in roster_ids
                or dialogue in seen_dialogues
                or performance_role not in PERFORMANCE_ROLES
                or not roles
                or any(role not in ROLE_FLAGS for role in roles)
            ):
                raise ClusterReviewError(
                    f"{character_id} appearance {appearance_index} is invalid"
                )
            seen_dialogues.add(dialogue)
            appearances[dialogue][character_id] = {
                "characterId": character_id,
                "displayName": display_name,
                "performanceRole": performance_role,
                "roleFlags": roles,
                "editorialNote": appearance.get("editorialNote"),
            }

    rosters: dict[str, list[dict[str, Any]]] = {}
    for dialogue, ids in roster_ids.items():
        if set(ids) != set(appearances[dialogue]):
            raise ClusterReviewError(
                f"{dialogue} roster differs from canonical character appearances"
            )
        rosters[dialogue] = [appearances[dialogue][item] for item in ids]
    return catalog, rosters


def _validate_plans(
    queue: dict[str, Any], root: Path
) -> tuple[dict[str, dict[str, Any]], dict[str, Path], dict[str, Path]]:
    plans: dict[str, dict[str, Any]] = {}
    caption_paths: dict[str, Path] = {}
    source_paths: dict[str, Path] = {}
    for item in queue["items"]:
        key = item["selection"]["selectionKey"]
        caption_paths[key] = _verify_file_evidence(
            item["captions"], root, f"{key} pinned captions"
        )
        if item["status"] == "materialization-required":
            missing = _relative_repo_path(
                item["source"]["path"], root, f"{key} missing source path"
            )
            if missing.exists():
                raise ClusterReviewError(
                    f"queue is stale because {key} source is now materialized"
                )
            continue
        source_paths[key] = _verify_file_size(
            item["source"], root, f"{key} source media"
        )
        plan_record = item["plan"]
        plan_path = _relative_repo_path(plan_record["path"], root, f"{key} plan path")
        if plan_path.is_symlink() or not plan_path.is_file():
            raise ClusterReviewError(f"missing or non-regular {key} plan")
        if not 0 < plan_path.stat().st_size <= MAX_PLAN_BYTES:
            raise ClusterReviewError(f"{key} plan exceeds the JSON bound")
        try:
            plan = cluster_v2.load_plan_artifact(
                Path(plan_record["path"]),
                expected_sha256=plan_record["sha256"],
            )
        except cluster_v2.CorpusClusterError as error:
            raise ClusterReviewError(f"invalid or stale {key} plan: {error}") from error
        if (
            plan["selection"] != item["selection"]
            or plan["source"]["materializedEvidence"] != item["source"]
            or any(
                plan["captions"][field] != item["captions"][field]
                for field in ("path", "sha256", "bytes", "textUsedForIdentity")
            )
            or plan["outputDirectory"] != plan_record["outputDirectory"]
            or len(plan["segmentation"]["segments"]) != plan_record["segmentCount"]
        ):
            raise ClusterReviewError(f"{key} queue item is detached from its plan")
        plans[key] = plan
    return plans, caption_paths, source_paths


def _discover_outputs(plans: dict[str, dict[str, Any]], root: Path) -> set[Path]:
    expected = {
        _relative_repo_path(plan["outputDirectory"], root, f"{key} output path")
        for key, plan in plans.items()
    }
    output_root = _relative_repo_path(
        cluster_v2.OUTPUT_ROOT.as_posix(), root, "v2 cluster output root"
    )
    if not output_root.exists():
        return set()
    if output_root.is_symlink() or not output_root.is_dir():
        raise ClusterReviewError("v2 cluster output root must be a regular directory")
    discovered: set[Path] = set()
    expected_dialogue_directories = {path.parent for path in expected}
    for dialogue_dir in sorted(output_root.iterdir()):
        if dialogue_dir.is_symlink() or not dialogue_dir.is_dir():
            raise ClusterReviewError(
                f"unexpected file or symlink in v2 output root: {dialogue_dir}"
            )
        if dialogue_dir not in expected_dialogue_directories:
            raise ClusterReviewError(
                f"unbound dialogue directory in v2 output root: {dialogue_dir}"
            )
        for video_dir in sorted(dialogue_dir.iterdir()):
            if video_dir.is_symlink() or not video_dir.is_dir():
                raise ClusterReviewError(
                    f"unexpected file or symlink in v2 dialogue output: {video_dir}"
                )
            if video_dir not in expected:
                raise ClusterReviewError(f"unbound fetched v2 output: {video_dir}")
            discovered.add(video_dir)
    return discovered


def _validate_execution_provenance(
    manifest: dict[str, Any], plan: dict[str, Any], queue: dict[str, Any]
) -> dict[str, Any]:
    execution = manifest.get("executionTools")
    if not isinstance(execution, dict) or set(execution) != EXECUTION_FIELDS:
        raise ClusterReviewError("fetched manifest execution provenance is malformed")
    string_fields = ("ffmpeg", "segmentationFfmpeg", "torch", "cuda", "gpu")
    if any(
        not isinstance(execution[field], str) or not execution[field]
        for field in string_fields
    ):
        raise ClusterReviewError("fetched manifest execution strings are invalid")
    if (
        execution["segmentationFfmpeg"] != plan["tools"]["segmentationFfmpeg"]
        or execution["ffmpegMatchesSegmentation"]
        is not (execution["ffmpeg"] == execution["segmentationFfmpeg"])
        or execution["dotsSourceCommit"] != queue["embedding"]["dotsSourceCommit"]
        or execution["embeddingDeterminism"] != queue["embedding"]["determinism"]
        or execution["plannerScriptSha256"] != queue["tools"]["plannerScriptSha256"]
        or execution["coreScriptSha256"] != queue["tools"]["coreScriptSha256"]
    ):
        raise ClusterReviewError("fetched manifest execution provenance is detached")
    return execution


def _validate_fetched_output(
    item: dict[str, Any],
    plan: dict[str, Any],
    output: Path,
    caption_path: Path,
    roster: list[dict[str, Any]],
    queue: dict[str, Any],
) -> dict[str, Any]:
    key = item["selection"]["selectionKey"]
    manifest_path = output / "manifest.json"
    manifest = _read_json(
        manifest_path, f"{key} cluster manifest", maximum_bytes=MAX_MANIFEST_BYTES
    )
    execution = _validate_execution_provenance(manifest, plan, queue)
    try:
        cluster_v2.validate_execution_inputs(plan)
        verified = cluster_v2._verify_resume(output, plan, execution)
    except cluster_v2.CorpusClusterError as error:
        raise ClusterReviewError(
            f"invalid fetched output for {key}: {error}"
        ) from error
    if verified is None or verified != manifest:
        raise ClusterReviewError(f"fetched output for {key} did not verify exactly")
    try:
        captions = parse_json3_caption(caption_path)
    except ReferenceSearchError as error:
        raise ClusterReviewError(
            f"invalid pinned captions for {key}: {error}"
        ) from error
    return {
        "item": item,
        "plan": plan,
        "output": output,
        "manifest": manifest,
        "manifestPath": manifest_path,
        "manifestSha256": file_sha256(manifest_path),
        "captionPath": caption_path,
        "captions": captions,
        "roster": roster,
    }


def inspect_review_corpus(
    queue_path: Path = DEFAULT_QUEUE,
    characters_path: Path = DEFAULT_CHARACTERS,
    *,
    repo_root: Path,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    queue_file = _input_path(queue_path, root, "v2 queue")
    characters_file = _input_path(characters_path, root, "canonical character catalog")
    with _repo_cwd(root):
        queue = _validate_queue(queue_file, root)
        catalog, rosters = _load_rosters(characters_file)
        plans, caption_paths, source_paths = _validate_plans(queue, root)
        outputs = _discover_outputs(plans, root)
        videos: list[dict[str, Any]] = []
        for item in queue["items"]:
            selection = item["selection"]
            key = selection["selectionKey"]
            dialogue = selection["dialogue"]
            if dialogue not in rosters:
                raise ClusterReviewError(
                    f"queue dialogue {dialogue} has no canonical character roster"
                )
            if item["status"] != "ready":
                videos.append(
                    {
                        "item": item,
                        "state": "materialization-required",
                        "reason": "source materialization required",
                    }
                )
                continue
            plan = plans[key]
            output = _relative_repo_path(plan["outputDirectory"], root, f"{key} output")
            if output not in outputs:
                videos.append(
                    {
                        "item": item,
                        "plan": plan,
                        "state": "awaiting-output",
                        "reason": "awaiting fetched cluster output",
                    }
                )
                continue
            verified = _validate_fetched_output(
                item,
                plan,
                output,
                caption_paths[key],
                rosters[dialogue],
                queue,
            )
            videos.append({**verified, "state": "verified-for-review"})
    return {
        "repoRoot": root,
        "queuePath": queue_file,
        "queue": queue,
        "charactersPath": characters_file,
        "characters": catalog,
        "plans": plans,
        "captionPaths": caption_paths,
        "sourcePaths": source_paths,
        "videos": videos,
    }


def _caption_excerpt(
    document: CaptionDocument, start_seconds: float, end_seconds: float
) -> str:
    lower = max(0, math.floor((start_seconds - CAPTION_CONTEXT_SECONDS) * 1000))
    upper = math.ceil((end_seconds + CAPTION_CONTEXT_SECONDS) * 1000)
    text = " ".join(
        piece.text
        for piece in document.pieces
        if piece.end_ms >= lower and piece.start_ms <= upper
    )
    compact = " ".join(html.unescape(text).split())
    if not compact:
        return "No pinned caption text overlaps this clip."
    if len(compact) > MAX_CAPTION_EXCERPT_CHARACTERS:
        return compact[: MAX_CAPTION_EXCERPT_CHARACTERS - 1].rstrip() + "…"
    return compact


def _relative_url(path: Path, output_parent: Path) -> str:
    relative = os.path.relpath(path, output_parent)
    return quote(relative.replace(os.sep, "/"), safe="/.-_~")


def _format_seconds(value: float) -> str:
    total_milliseconds = round(value * 1000)
    total_seconds, milliseconds = divmod(total_milliseconds, 1000)
    minutes, seconds = divmod(total_seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours:d}:{minutes:02d}:{seconds:02d}.{milliseconds:03d}"
    return f"{minutes:d}:{seconds:02d}.{milliseconds:03d}"


def _format_metric(value: Any) -> str:
    if value is None:
        return "not applicable"
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
    ):
        raise ClusterReviewError("verified cluster diagnostics became non-numeric")
    if isinstance(value, int):
        return str(value)
    return f"{value:.6f}"


def _script_json(value: Any) -> str:
    return (
        json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        .replace("&", "\\u0026")
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
    )


def _render_clip(
    record: dict[str, Any],
    *,
    output: Path,
    page_path: Path,
    captions: CaptionDocument,
) -> str:
    clip_path = output / record["path"]
    audio_url = _relative_url(clip_path, page_path.parent)
    excerpt = _caption_excerpt(captions, record["startSeconds"], record["endSeconds"])
    timing = (
        f"{_format_seconds(record['startSeconds'])}–"
        f"{_format_seconds(record['endSeconds'])}"
    )
    label = (
        "Nearest-centroid representative"
        if record["selection"] == "nearest-centroid"
        else "Farthest-centroid audit clip"
    )
    return f"""
          <article class="clip" data-selection="{html.escape(record["selection"])}">
            <h4>{label} {record["rank"]}</h4>
            <audio controls preload="metadata" src="{html.escape(audio_url, quote=True)}"></audio>
            <p><strong>{html.escape(record["segmentId"])}</strong> · {timing}</p>
            <p class="caption"><span>Pinned caption context:</span> {html.escape(excerpt)}</p>
            <details><summary>Verified clip SHA-256</summary><code>{record["sha256"]}</code></details>
          </article>"""


def render_video_html(
    evidence: dict[str, Any],
    page_path: Path,
    *,
    queue_sha256: str,
    characters_sha256: str,
) -> str:
    item = evidence["item"]
    selection = item["selection"]
    plan = evidence["plan"]
    manifest = evidence["manifest"]
    roster = evidence["roster"]
    selectable_roster = [
        character
        for character in roster
        if character["performanceRole"] == "voice-owner"
    ]
    nonselectable_evidence = [
        character
        for character in roster
        if character["performanceRole"] != "voice-owner"
    ]
    title = selection["video"]["title"]
    dialogue_label = selection["dialogue"].replace("-", " ").title()
    manifest_sha256 = evidence["manifestSha256"]

    option_rows = [
        '<option value="">Undecided — no provisional choice</option>',
        '<option value="unmapped">Unmapped — no canonical roster match</option>',
        '<option value="mixed/impure">Mixed / impure — do not map this cluster</option>',
    ]
    for character in selectable_roster:
        flags = ", ".join(character["roleFlags"])
        option_rows.append(
            '<option value="{}">{} ({}) — {}</option>'.format(
                html.escape(character["characterId"], quote=True),
                html.escape(character["displayName"]),
                html.escape(character["characterId"]),
                html.escape(flags),
            )
        )
    options = "".join(option_rows)

    cluster_cards: list[str] = []
    for cluster in manifest["clusters"]:
        diagnostics = cluster["diagnostics"]
        cosine = diagnostics["centroidCosine"]
        nearest = "".join(
            _render_clip(
                record,
                output=evidence["output"],
                page_path=page_path,
                captions=evidence["captions"],
            )
            for record in cluster["representatives"]
        )
        farthest = "".join(
            _render_clip(
                record,
                output=evidence["output"],
                page_path=page_path,
                captions=evidence["captions"],
            )
            for record in cluster["auditRepresentatives"]
        )
        cluster_id = cluster["clusterId"]
        cluster_cards.append(
            f"""
      <article class="cluster" data-cluster-id="{cluster_id}">
        <header>
          <div><p class="eyebrow">Anonymous acoustic grouping</p><h2>{cluster_id}</h2></div>
          <p class="count">{cluster["segmentCount"]} segments</p>
        </header>
        <dl class="diagnostics">
          <div><dt>First segment</dt><dd>{html.escape(cluster["firstSegmentId"])}</dd></div>
          <div><dt>Centroid cosine min</dt><dd>{_format_metric(cosine["minimum"])}</dd></div>
          <div><dt>Centroid cosine median</dt><dd>{_format_metric(cosine["median"])}</dd></div>
          <div><dt>Centroid cosine max</dt><dd>{_format_metric(cosine["maximum"])}</dd></div>
          <div><dt>Below threshold</dt><dd>{_format_metric(diagnostics["belowThresholdSegmentCount"])}</dd></div>
          <div><dt>Max cross-cluster member cosine</dt><dd>{_format_metric(diagnostics["crossClusterMemberCosineMaximum"])}</dd></div>
          <div><dt>Nearest competing centroid</dt><dd>{_format_metric(diagnostics["nearestCompetingCentroidCosine"])}</dd></div>
        </dl>
        <section class="clips" aria-label="Representative clips for {cluster_id}">
          {nearest}{farthest}
        </section>
        <section class="choice">
          <h3>Provisional human classification</h3>
          <label for="choice-{cluster_id}">Roster choice, exception, or undecided</label>
          <select id="choice-{cluster_id}" data-choice-for="{cluster_id}">{options}</select>
          <label for="note-{cluster_id}">Review note</label>
          <textarea id="note-{cluster_id}" data-note-for="{cluster_id}" maxlength="2000" placeholder="Record what you hear, ambiguity, or why this cluster should remain unmapped."></textarea>
        </section>
      </article>"""
        )

    roster_rows = "".join(
        "<li><strong>{}</strong> <code>{}</code><span>{}</span></li>".format(
            html.escape(character["displayName"]),
            html.escape(character["characterId"]),
            html.escape(", ".join(character["roleFlags"])),
        )
        for character in selectable_roster
    )
    nonselectable_rows = "".join(
        "<li><strong>{}</strong> <code>{}</code>"
        "<span><strong>{}</strong> · {}</span>{}</li>".format(
            html.escape(character["displayName"]),
            html.escape(character["characterId"]),
            html.escape(character["performanceRole"]),
            html.escape(", ".join(character["roleFlags"])),
            (
                "<span>{}</span>".format(html.escape(character["editorialNote"]))
                if isinstance(character["editorialNote"], str)
                and character["editorialNote"]
                else ""
            ),
        )
        for character in nonselectable_evidence
    )
    nonselectable_section = (
        f"""
    <section class="roster role-evidence">
      <h2>Nonselectable character evidence</h2>
      <p class="muted"><strong>reported-only</strong> and <strong>review-required</strong> appearances are retained for audit context, but they cannot own a provisional cluster choice.</p>
      <ul>{nonselectable_rows}</ul>
    </section>"""
        if nonselectable_rows
        else ""
    )
    cluster_ids = [cluster["clusterId"] for cluster in manifest["clusters"]]
    allowed_choices = [
        *SPECIAL_CHOICES,
        *(row["characterId"] for row in selectable_roster),
    ]
    storage_key = ":".join(
        (
            "plato-anonymous-cluster-review-v2",
            queue_sha256,
            plan["planSha256"],
            manifest_sha256,
            characters_sha256,
        )
    )
    decision_config = {
        "schemaVersion": 1,
        "status": DECISION_STATUS,
        "provisionalOnly": True,
        "humanAuditRequired": True,
        "writesCastRegistry": False,
        "automaticIdentityAssertions": False,
        "selectionKey": selection["selectionKey"],
        "dialogue": selection["dialogue"],
        "videoId": selection["video"]["videoId"],
        "queueSha256": queue_sha256,
        "planSha256": plan["planSha256"],
        "manifestSha256": manifest_sha256,
        "charactersSha256": characters_sha256,
        "canonicalRosterCharacterIds": [
            row["characterId"] for row in selectable_roster
        ],
        "clusterIds": cluster_ids,
        "allowedChoices": allowed_choices,
        "storageKey": storage_key,
        "downloadFilename": (
            f"{selection['dialogue']}-{selection['video']['videoId']}"
            ".review-decision.json"
        ),
    }
    decision_json = _script_json(decision_config)
    video_url = selection["video"]["url"]
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Anonymous cluster review: {html.escape(dialogue_label)}</title>
  <style>
    :root {{ color-scheme: dark; font: 15px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; background: #0d1117; color: #e6edf3; }}
    * {{ box-sizing: border-box; }}
    body {{ max-width: 1180px; margin: 0 auto; padding: 2rem 1rem 6rem; }}
    a {{ color: #8fc8ff; }}
    h1, h2, h3, h4 {{ line-height: 1.15; }}
    code {{ overflow-wrap: anywhere; }}
    .notice, .metadata, .roster, .export, .cluster {{ border: 1px solid #39414d; border-radius: .8rem; background: #151b23; padding: 1rem; }}
    .notice {{ border-color: #c08a37; background: #211b12; font-size: 1.05rem; }}
    .metadata {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(230px,1fr)); gap: .55rem 1rem; margin: 1rem 0; }}
    .metadata p {{ margin: 0; }}
    .roster ul {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: .55rem 1rem; padding: 0; list-style: none; }}
    .roster li {{ display: grid; gap: .1rem; padding: .55rem; background: #0f141b; border-radius: .5rem; }}
    .roster span, .muted, .caption, details {{ color: #aeb8c4; }}
    .cluster {{ margin: 1.25rem 0; }}
    .cluster > header {{ display: flex; justify-content: space-between; gap: 1rem; align-items: start; }}
    .cluster h2, .eyebrow {{ margin: 0; }}
    .eyebrow {{ text-transform: uppercase; letter-spacing: .08em; color: #8ca1b8; font-size: .76rem; }}
    .count {{ background: #253243; border-radius: 2rem; padding: .35rem .75rem; white-space: nowrap; }}
    .diagnostics {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(175px,1fr)); gap: .5rem; }}
    .diagnostics div {{ background: #0f141b; border-radius: .5rem; padding: .65rem; }}
    .diagnostics dt {{ color: #9eabb9; font-size: .8rem; }}
    .diagnostics dd {{ margin: .15rem 0 0; font-variant-numeric: tabular-nums; }}
    .clips {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(270px,1fr)); gap: .75rem; margin: 1rem 0; }}
    .clip {{ border: 1px solid #303846; border-radius: .65rem; padding: .8rem; background: #10151c; }}
    .clip h4, .clip p {{ margin: .25rem 0 .55rem; }}
    audio {{ width: 100%; }}
    .caption span {{ color: #e6edf3; font-weight: 650; }}
    .choice {{ display: grid; gap: .5rem; border-top: 1px solid #39414d; padding-top: 1rem; }}
    select, textarea {{ width: 100%; border: 1px solid #566171; border-radius: .5rem; background: #0c1117; color: inherit; padding: .7rem; }}
    textarea {{ min-height: 6rem; resize: vertical; }}
    button {{ border: 1px solid #69778a; border-radius: .5rem; background: #253243; color: inherit; padding: .65rem .9rem; cursor: pointer; }}
    button:hover, button:focus-visible, select:focus-visible, textarea:focus-visible {{ outline: 2px solid #8fc8ff; outline-offset: 2px; }}
    .controls {{ display: flex; flex-wrap: wrap; gap: .65rem; margin: .8rem 0; }}
    .export {{ margin-top: 1.25rem; }}
    pre {{ max-height: 16rem; overflow: auto; white-space: pre-wrap; background: #090d12; padding: .75rem; border-radius: .5rem; }}
  </style>
</head>
<body>
  <main>
    <p><a href="../../index.html">← Corpus review index</a></p>
    <h1>{html.escape(dialogue_label)}: anonymous acoustic clusters</h1>
    <p>{html.escape(title)} · part {selection["partIndex"]} of {selection["partCount"]} · <a href="{html.escape(video_url, quote=True)}">pinned source video</a></p>
    <p class="notice"><strong>Human audit only.</strong> These are anonymous acoustic groupings, not speaker identities. Every choice is provisional. This page never updates <code>audio/cast.json</code>, never asserts identity automatically, and treats captions only as nearby timing context.</p>
    <section class="metadata" aria-label="Verified artifact provenance">
      <p><strong>Selection:</strong> <code>{html.escape(selection["selectionKey"])}</code></p>
      <p><strong>Clusters:</strong> {len(manifest["clusters"])}</p>
      <p><strong>Unclustered segments:</strong> {manifest["unclusteredSegmentCount"]}</p>
      <p><strong>Queue:</strong> <code>{queue_sha256}</code></p>
      <p><strong>Plan:</strong> <code>{plan["planSha256"]}</code></p>
      <p><strong>Manifest:</strong> <code>{manifest_sha256}</code></p>
      <p><strong>Character catalog:</strong> <code>{characters_sha256}</code></p>
      <p><strong>Source media:</strong> <code>{plan["source"]["materializedEvidence"]["sha256"]}</code></p>
      <p><strong>Pinned captions:</strong> <code>{plan["captions"]["sha256"]}</code></p>
    </section>
    <section class="roster">
      <h2>Voice-owner roster — provisional choices only</h2>
      <p class="muted">Only CharacterCatalog v3 <strong>voice-owner</strong> appearances are selectable. The two explicit exceptions are <strong>unmapped</strong> and <strong>mixed / impure</strong>. Nothing is preselected.</p>
      <ul>{roster_rows}</ul>
    </section>
    {nonselectable_section}
    <section aria-label="Anonymous clusters">{"".join(cluster_cards)}</section>
    <section class="export">
      <h2>Local draft and decision export</h2>
      <p class="muted">Selections and notes persist only in this browser under hashes for this exact queue, plan, manifest, and roster. Exported JSON remains a provisional review record and performs no repository write.</p>
      <div class="controls">
        <button type="button" id="copy-decision">Copy decision JSON</button>
        <button type="button" id="download-decision">Download decision JSON</button>
        <button type="button" id="clear-decision">Clear local draft</button>
      </div>
      <p id="review-progress" role="status" aria-live="polite"></p>
      <details><summary>Decision JSON preview</summary><pre id="decision-preview"></pre></details>
    </section>
  </main>
  <script>
  (() => {{
    'use strict';
    const config = {decision_json};
    const allowed = new Set(config.allowedChoices);
    const blankState = () => ({{
      choices: Object.fromEntries(config.clusterIds.map(id => [id, ''])),
      notes: Object.fromEntries(config.clusterIds.map(id => [id, '']))
    }});
    let state = blankState();
    try {{
      const stored = JSON.parse(localStorage.getItem(config.storageKey) || 'null');
      if (stored && typeof stored === 'object') {{
        for (const id of config.clusterIds) {{
          const choice = stored.choices && stored.choices[id];
          const note = stored.notes && stored.notes[id];
          if (choice === '' || allowed.has(choice)) state.choices[id] = choice;
          if (typeof note === 'string') state.notes[id] = note.slice(0, 2000);
        }}
      }}
    }} catch {{}}

    const selectors = Object.fromEntries(
      [...document.querySelectorAll('[data-choice-for]')].map(node => [node.dataset.choiceFor, node])
    );
    const notes = Object.fromEntries(
      [...document.querySelectorAll('[data-note-for]')].map(node => [node.dataset.noteFor, node])
    );
    const status = document.querySelector('#review-progress');
    const preview = document.querySelector('#decision-preview');

    const choiceKind = choice => choice === '' ? 'undecided'
      : choice === 'unmapped' ? 'unmapped'
      : choice === 'mixed/impure' ? 'mixed-or-impure'
      : 'canonical-roster-provisional';
    const decision = () => {{
      const completed = config.clusterIds.filter(id => state.choices[id] !== '').length;
      return {{
        schemaVersion: config.schemaVersion,
        status: config.status,
        reviewStatus: completed === config.clusterIds.length ? 'complete' : 'draft',
        provisionalOnly: config.provisionalOnly,
        humanAuditRequired: config.humanAuditRequired,
        writesCastRegistry: config.writesCastRegistry,
        automaticIdentityAssertions: config.automaticIdentityAssertions,
        selectionKey: config.selectionKey,
        dialogue: config.dialogue,
        videoId: config.videoId,
        queueSha256: config.queueSha256,
        planSha256: config.planSha256,
        manifestSha256: config.manifestSha256,
        charactersSha256: config.charactersSha256,
        canonicalRosterCharacterIds: config.canonicalRosterCharacterIds,
        decisions: config.clusterIds.map(clusterId => ({{
          clusterId,
          provisionalChoice: state.choices[clusterId] || null,
          choiceKind: choiceKind(state.choices[clusterId]),
          note: state.notes[clusterId]
        }}))
      }};
    }};
    const save = () => {{
      try {{ localStorage.setItem(config.storageKey, JSON.stringify(state)); }} catch {{}}
      const completed = config.clusterIds.filter(id => state.choices[id] !== '').length;
      status.textContent = `${{completed}} of ${{config.clusterIds.length}} clusters classified provisionally.`;
      preview.textContent = JSON.stringify(decision(), null, 2);
    }};

    for (const id of config.clusterIds) {{
      selectors[id].value = state.choices[id];
      notes[id].value = state.notes[id];
      selectors[id].addEventListener('change', event => {{
        state.choices[id] = allowed.has(event.target.value) ? event.target.value : '';
        save();
      }});
      notes[id].addEventListener('input', event => {{
        state.notes[id] = event.target.value.slice(0, 2000);
        save();
      }});
    }}
    const audios = [...document.querySelectorAll('audio')];
    audios.forEach(audio => audio.addEventListener('play', () => {{
      audios.forEach(other => {{ if (other !== audio) other.pause(); }});
    }}));
    document.querySelector('#copy-decision').addEventListener('click', async () => {{
      const payload = JSON.stringify(decision(), null, 2) + '\\n';
      try {{
        await navigator.clipboard.writeText(payload);
        status.textContent = 'Decision JSON copied. No cast or identity record was changed.';
      }} catch {{
        status.textContent = 'Clipboard access failed. The complete JSON remains in the preview.';
      }}
    }});
    document.querySelector('#download-decision').addEventListener('click', () => {{
      const blob = new Blob([JSON.stringify(decision(), null, 2) + '\\n'], {{type: 'application/json'}});
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = config.downloadFilename;
      anchor.click();
      URL.revokeObjectURL(url);
      status.textContent = 'Provisional decision JSON downloaded. No cast or identity record was changed.';
    }});
    document.querySelector('#clear-decision').addEventListener('click', () => {{
      state = blankState();
      for (const id of config.clusterIds) {{ selectors[id].value = ''; notes[id].value = ''; }}
      try {{ localStorage.removeItem(config.storageKey); }} catch {{}}
      save();
    }});
    save();
  }})();
  </script>
</body>
</html>
"""


def render_index_html(review_manifest: dict[str, Any]) -> str:
    summary = review_manifest["summary"]
    rows: list[str] = []
    for video in review_manifest["videos"]:
        if video["state"] == "verified-for-review":
            state = '<span class="ready">verified for review</span>'
            title = (
                f'<a href="{html.escape(video["page"]["path"], quote=True)}">'
                f"{html.escape(video['title'])}</a>"
            )
            detail = f"{video['clusterCount']} anonymous cluster(s)"
        else:
            state = f'<span class="pending">{html.escape(video["state"])}</span>'
            title = html.escape(video["title"])
            detail = html.escape(video["reason"])
        rows.append(
            f"""
        <tr>
          <td>{video["queueIndex"] + 1}</td>
          <td>{html.escape(video["dialogue"])}</td>
          <td>{title}<br><code>{html.escape(video["videoId"])}</code></td>
          <td>{video["partIndex"]} / {video["partCount"]}</td>
          <td>{state}<br><small>{detail}</small></td>
        </tr>"""
        )
    queue = review_manifest["inputs"]["queue"]
    characters = review_manifest["inputs"]["characters"]
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Plato anonymous cluster human review</title>
  <style>
    :root {{ color-scheme: dark; font: 15px/1.5 Inter, ui-sans-serif, system-ui, sans-serif; background: #0d1117; color: #e6edf3; }}
    body {{ max-width: 1180px; margin: 0 auto; padding: 2rem 1rem 6rem; }}
    h1 {{ line-height: 1.1; }}
    a {{ color: #8fc8ff; }} code {{ overflow-wrap: anywhere; }}
    .notice, .summary, .provenance {{ border: 1px solid #39414d; border-radius: .8rem; background: #151b23; padding: 1rem; }}
    .notice {{ border-color: #c08a37; background: #211b12; }}
    .summary {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: .75rem; margin: 1rem 0; }}
    .summary div {{ background: #0e141b; border-radius: .6rem; padding: .8rem; }}
    .summary strong {{ display: block; font-size: 1.65rem; }}
    .table {{ overflow-x: auto; margin: 1rem 0; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ text-align: left; vertical-align: top; border-bottom: 1px solid #303846; padding: .65rem; }}
    th {{ color: #aeb8c4; }}
    .ready {{ color: #71d69f; }} .pending {{ color: #e9bd6f; }} small {{ color: #aeb8c4; }}
  </style>
</head>
<body>
  <main>
    <h1>Anonymous speaker-cluster human review</h1>
    <p class="notice"><strong>This is a scratch-only provisional review surface.</strong> It never maps a cluster automatically, never writes <code>audio/cast.json</code>, and refuses stale, missing, partial, or tampered fetched outputs. A missing expected output remains visibly pending.</p>
    <section class="summary" aria-label="Corpus status">
      <div><strong>{summary["videoCount"]}</strong> queued videos</div>
      <div><strong>{summary["verifiedForReviewCount"]}</strong> verified for review</div>
      <div><strong>{summary["awaitingOutputCount"]}</strong> awaiting output</div>
      <div><strong>{summary["materializationRequiredCount"]}</strong> source materialization required</div>
      <div><strong>{summary["clusterCount"]}</strong> anonymous clusters available</div>
    </section>
    <section class="provenance">
      <p><strong>Queue payload SHA-256:</strong> <code>{queue["payloadSha256"]}</code></p>
      <p><strong>Queue file SHA-256:</strong> <code>{queue["sha256"]}</code></p>
      <p><strong>Character catalog SHA-256:</strong> <code>{characters["sha256"]}</code></p>
    </section>
    <div class="table">
      <table>
        <thead><tr><th>#</th><th>Dialogue</th><th>Pinned video</th><th>Part</th><th>State</th></tr></thead>
        <tbody>{"".join(rows)}</tbody>
      </table>
    </div>
    <p><a href="review-manifest.json">Machine-readable review packet manifest</a></p>
  </main>
</body>
</html>
"""


def _protected_artifact_roots(root: Path) -> list[Path]:
    return [
        (root / cluster_v2.ARTIFACT_ROOT).resolve(strict=False),
        (root / cluster_v2.OUTPUT_ROOT).resolve(strict=False),
        (root / cluster_v2.SOURCE_ROOT).resolve(strict=False),
        (root / cluster_v2.CAPTION_ROOT).resolve(strict=False),
    ]


def _ensure_review_output_is_separate(output: Path, root: Path) -> None:
    for protected in _protected_artifact_roots(root):
        if (
            output == protected
            or output.is_relative_to(protected)
            or protected.is_relative_to(output)
        ):
            raise ClusterReviewError(
                f"review output overlaps a protected clustering artifact root: {protected}"
            )


def _install_directory(temporary: Path, output: Path) -> None:
    backup = output.with_name(f".{output.name}.previous-{os.getpid()}")
    if backup.exists():
        raise ClusterReviewError(f"stale review build backup blocks install: {backup}")
    replaced = False
    try:
        if output.exists():
            output.replace(backup)
            replaced = True
        temporary.replace(output)
    except OSError:
        if replaced and backup.exists() and not output.exists():
            backup.replace(output)
        raise
    finally:
        if backup.exists():
            shutil.rmtree(backup)


def build_review_site(
    queue_path: Path = DEFAULT_QUEUE,
    characters_path: Path = DEFAULT_CHARACTERS,
    output_path: Path = DEFAULT_OUTPUT,
    *,
    repo_root: Path,
    generator_path: Path | None = None,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    evidence = inspect_review_corpus(queue_path, characters_path, repo_root=root)
    output = _scratch_output(output_path, root)
    _ensure_review_output_is_separate(output, root)
    generator = _input_path(generator_path or Path(__file__), root, "review generator")
    queue_sha256 = evidence["queue"]["queueSha256"]
    characters_sha256 = file_sha256(evidence["charactersPath"])

    page_payloads: dict[str, bytes] = {}
    video_rows: list[dict[str, Any]] = []
    for queue_index, video in enumerate(evidence["videos"]):
        item = video["item"]
        selection = item["selection"]
        row: dict[str, Any] = {
            "queueIndex": queue_index,
            "selectionKey": selection["selectionKey"],
            "dialogue": selection["dialogue"],
            "partIndex": selection["partIndex"],
            "partCount": selection["partCount"],
            "videoId": selection["video"]["videoId"],
            "title": selection["video"]["title"],
            "state": video["state"],
        }
        plan_record = item.get("plan")
        if isinstance(plan_record, dict):
            row["planSha256"] = plan_record["sha256"]
        if video["state"] != "verified-for-review":
            row["reason"] = video["reason"]
            video_rows.append(row)
            continue
        relative_page = PurePosixPath(
            "videos", selection["dialogue"], f"{selection['video']['videoId']}.html"
        )
        final_page = output.joinpath(*relative_page.parts)
        page = render_video_html(
            video,
            final_page,
            queue_sha256=queue_sha256,
            characters_sha256=characters_sha256,
        ).encode("utf-8")
        relative_text = relative_page.as_posix()
        page_payloads[relative_text] = page
        row.update(
            {
                "manifestSha256": video["manifestSha256"],
                "clusterCount": len(video["manifest"]["clusters"]),
                "page": {
                    "path": relative_text,
                    "sha256": hashlib.sha256(page).hexdigest(),
                },
            }
        )
        video_rows.append(row)

    summary = {
        "videoCount": len(video_rows),
        "verifiedForReviewCount": sum(
            row["state"] == "verified-for-review" for row in video_rows
        ),
        "awaitingOutputCount": sum(
            row["state"] == "awaiting-output" for row in video_rows
        ),
        "materializationRequiredCount": sum(
            row["state"] == "materialization-required" for row in video_rows
        ),
        "clusterCount": sum(row.get("clusterCount", 0) for row in video_rows),
    }
    inventory = sorted(["index.html", "review-manifest.json", *page_payloads])
    review_manifest = {
        "schemaVersion": 1,
        "status": REVIEW_STATUS,
        "humanAuditRequired": True,
        "provisionalOnly": True,
        "writesCastRegistry": False,
        "automaticIdentityAssertions": False,
        "inputs": {
            "queue": {
                "path": evidence["queuePath"].relative_to(root).as_posix(),
                "sha256": file_sha256(evidence["queuePath"]),
                "payloadSha256": queue_sha256,
            },
            "characters": {
                "path": evidence["charactersPath"].relative_to(root).as_posix(),
                "sha256": characters_sha256,
            },
            "generator": {
                "path": generator.relative_to(root).as_posix(),
                "sha256": file_sha256(generator),
            },
        },
        "summary": summary,
        "videos": video_rows,
        "inventory": inventory,
    }

    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(prefix=f".{output.name}.build-", dir=output.parent)
    )
    try:
        for relative, payload in page_payloads.items():
            _atomic_bytes(temporary / relative, payload)
        _atomic_bytes(temporary / "review-manifest.json", _json_bytes(review_manifest))
        _atomic_bytes(
            temporary / "index.html",
            render_index_html(review_manifest).encode("utf-8"),
        )
        actual_inventory = sorted(
            path.relative_to(temporary).as_posix()
            for path in temporary.rglob("*")
            if path.is_file()
        )
        if actual_inventory != inventory:
            raise ClusterReviewError("review packet inventory is not deterministic")
        _install_directory(temporary, output)
    except Exception:
        if temporary.exists():
            shutil.rmtree(temporary)
        raise
    return review_manifest


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Build a scratch-only human review UI from strictly verified v2 "
            "anonymous cluster outputs."
        )
    )
    parser.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[2],
    )
    return parser


def main() -> int:
    parser = _parser()
    arguments = parser.parse_args()
    try:
        manifest = build_review_site(
            arguments.queue,
            arguments.characters,
            arguments.output,
            repo_root=arguments.repo_root,
        )
    except ClusterReviewError as error:
        parser.error(str(error))
    print(json.dumps(manifest["summary"], sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
