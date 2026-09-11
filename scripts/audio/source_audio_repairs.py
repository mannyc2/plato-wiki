"""Explicit utterance replacements layered over conservative source PCM cuts.

Replacement receipts preserve the changed synthesis provenance. They are never
renderer cache entries or production acceptance, and require fresh master QA.
"""
from __future__ import annotations

import copy
import os
from pathlib import Path
import tempfile
from typing import BinaryIO, TypedDict, cast

from pcm_edits import FrameInterval, PcmEditError, _copy_frames, _geometry, _header, file_sha256, map_frame, validate_cuts
from source_audio_edits import SourceEditManifest, _exact_keys, _geometry as project_cut_geometry, _hash, _integer, _rows, _text, execute_source_edit, manifest_sha256, validate_source_edit_manifest

KIND = "utterance-repaired-derived-pcm"
IMPLEMENTATION = {"source_audio_repairs_sha256": file_sha256(Path(__file__))}

class RepairManifest(TypedDict):
    schema_version: int
    kind: str
    implementation: dict[str, str]
    original: dict[str, object]
    base_edit: SourceEditManifest
    repairs: list[dict[str, object]]
    derived: dict[str, object]
    human_listening_performed: bool


def _absolute(value: object) -> Path:
    path = Path(_text(value))
    if not path.is_absolute():
        raise PcmEditError("repair evidence paths must be absolute")
    return path


def _verify_file(path: Path, digest: str) -> None:
    if path.is_symlink() or not path.is_file() or file_sha256(path) != digest:
        raise PcmEditError(f"repair evidence changed: {path}")


def _projection(base: SourceEditManifest, repairs: list[dict[str, object]]) -> dict[str, object]:
    validate_source_edit_manifest(base)
    frames = _integer(base["derived"]["frames"])
    chapters = _rows(base["derived"]["chapter_timeline"])
    boundaries = _rows(base["derived"]["boundaries"])
    cuts = [FrameInterval(_integer(row["start_frame"]), _integer(row["end_frame"])) for row in base["cuts"]]
    original_frames = _integer(base["original"]["frames"])
    spans = [FrameInterval(map_frame(_integer(row["start_frame"]), cuts, original_frames),
                           map_frame(_integer(row["end_frame"]), cuts, original_frames))
             for row in base["protected_spans"]]
    _, _, protected = project_cut_geometry(chapters, boundaries, [], spans, frames)
    intervals: list[FrameInterval] = []
    if not repairs:
        raise PcmEditError("utterance repair requires at least one replacement")
    for row in repairs:
        _exact_keys(row, {"start_frame", "end_frame", "audio_path", "audio_sha256", "frames",
                          "source_pcm_sha256", "entry_id", "canonical_text", "reason", "evidence"}, "utterance repair")
        intervals.append(FrameInterval(_integer(row["start_frame"]), _integer(row["end_frame"])))
        _absolute(row["audio_path"])
        _hash(row["audio_sha256"])
        _hash(row["source_pcm_sha256"])
        if _integer(row["frames"]) <= 0:
            raise PcmEditError("replacement audio is empty")
        for key in ("entry_id", "canonical_text", "reason"):
            _text(row[key])
        evidence = _rows(row["evidence"])
        roles: set[str] = set()
        for item in evidence:
            _exact_keys(item, {"path", "sha256", "role"}, "replacement evidence")
            _absolute(item["path"])
            _hash(item["sha256"])
            roles.add(_text(item["role"]))
        if not {"synthesis", "transcription", "source-task"}.issubset(roles):
            raise PcmEditError("replacement requires synthesis, transcription and source-task evidence")
    validate_cuts(intervals, frames, protected)

    def mapped(frame: int) -> int:
        if any(span.start < frame < span.end for span in intervals):
            raise PcmEditError("replacement intersects a projected source boundary")
        return frame + sum(_integer(row["frames"]) - (span.end - span.start)
                           for row, span in zip(repairs, intervals, strict=True) if span.end <= frame)

    projected_chapters: list[dict[str, object]] = []
    for row in chapters:
        start, end = mapped(_integer(row["start_frame"])), mapped(_integer(row["end_frame"]))
        projected_chapters.append({"chapter_id": row["chapter_id"], "start_frame": start, "end_frame": end,
                                   "frames": end - start, "start_seconds": start / 48000, "end_seconds": end / 48000})
    projected_boundaries: list[dict[str, object]] = []
    for row in boundaries:
        start, end = mapped(_integer(row["start_frame"])), mapped(_integer(row["end_frame"]))
        if end - start != _integer(row["end_frame"]) - _integer(row["start_frame"]):
            raise PcmEditError("replacement changes a declared pause")
        result = dict(row)
        result.update(start_frame=start, end_frame=end)
        if "start_seconds" in result:
            result["start_seconds"] = start / 48000
        if "end_seconds" in result:
            result["end_seconds"] = end / 48000
        projected_boundaries.append(result)
    output_frames = mapped(frames)
    return {"frames": output_frames, "removed_frames": _integer(base["original"]["frames"]) - output_frames,
            "chapter_timeline": projected_chapters, "chapter_timeline_sha256": manifest_sha256(projected_chapters),
            "boundaries": projected_boundaries, "boundaries_sha256": manifest_sha256(projected_boundaries)}


def validate_source_repair_manifest(document: RepairManifest) -> None:
    try:
        _exact_keys(document, {"schema_version", "kind", "implementation", "original", "base_edit", "repairs",
                               "derived", "human_listening_performed"}, "source repair manifest")
        if type(document["schema_version"]) is not int or document["schema_version"] != 1 or document["kind"] != KIND:
            raise PcmEditError("unsupported utterance repair schema")
        if document["implementation"] != IMPLEMENTATION or document["human_listening_performed"] is not False:
            raise PcmEditError("repair implementation or listening claim differs")
        base = document["base_edit"]
        if document["original"] != base["original"]:
            raise PcmEditError("repair original differs from its verified base edit")
        derived = document["derived"]
        _exact_keys(derived, {"audio_sha256", "frames", "removed_frames", "chapter_timeline", "chapter_timeline_sha256",
                              "boundaries", "boundaries_sha256"}, "repair derived")
        _hash(derived["audio_sha256"])
        projection = _projection(base, _rows(document["repairs"]))
        if {key: value for key, value in derived.items() if key != "audio_sha256"} != projection:
            raise PcmEditError("repair derived geometry differs from its exact splice projection")
    except (KeyError, TypeError, AttributeError) as error:
        raise PcmEditError("malformed source repair manifest") from error


def _verify_inputs(base: SourceEditManifest, repairs: list[dict[str, object]]) -> None:
    _verify_file(_absolute(base["original"]["path"]), _hash(base["original"]["audio_sha256"]))
    for row in repairs:
        path = _absolute(row["audio_path"])
        _verify_file(path, _hash(row["audio_sha256"]))
        if _geometry(path)[0] != _integer(row["frames"]):
            raise PcmEditError("replacement PCM frame count changed")
        for item in _rows(row["evidence"]):
            _verify_file(_absolute(item["path"]), _hash(item["sha256"]))


def _pcm_digest(handle: BinaryIO, offset: int, start: int, end: int) -> str:
    import hashlib
    digest = hashlib.sha256()
    handle.seek(offset + start * 3)
    remaining = (end - start) * 3
    while remaining:
        part = handle.read(min(remaining, 196608))
        if not part:
            raise PcmEditError("repair source PCM was truncated")
        digest.update(part)
        remaining -= len(part)
    return digest.hexdigest()


def _write(base: SourceEditManifest, repairs: list[dict[str, object]], output: Path, *, planning: bool) -> None:
    projection = _projection(base, repairs)
    _verify_inputs(base, repairs)
    with tempfile.TemporaryDirectory(dir=output.parent, prefix=".repair-base-") as temporary:
        source = execute_source_edit(base, expected_manifest_sha256=manifest_sha256(base), output=Path(temporary) / "audio.wav")
        frames, offset = _geometry(source)
        output_frames = _integer(projection["frames"])
        with source.open("rb") as original, output.open("xb") as target:
            target.write(_header(output_frames))
            position = 0
            for row in repairs:
                start, end = _integer(row["start_frame"]), _integer(row["end_frame"])
                observed = _pcm_digest(original, offset, start, end)
                if planning:
                    row["source_pcm_sha256"] = observed
                elif observed != row["source_pcm_sha256"]:
                    raise PcmEditError("replacement source interval differs from preview")
                _copy_frames(original, target, offset, position, start)
                replacement = _absolute(row["audio_path"])
                replacement_frames, replacement_offset = _geometry(replacement)
                with replacement.open("rb") as audio:
                    _copy_frames(audio, target, replacement_offset, 0, replacement_frames)
                position = end
            _copy_frames(original, target, offset, position, frames)
            if output_frames & 1:
                target.write(b"\x00")
            target.flush()
            os.fsync(target.fileno())
        _verify_inputs(base, repairs)
        if _geometry(output)[0] != output_frames:
            raise PcmEditError("repaired PCM frame count differs")


def preview_source_repair(base: SourceEditManifest, repairs: list[dict[str, object]]) -> RepairManifest:
    base = copy.deepcopy(base)
    repairs = copy.deepcopy(repairs)
    for row in repairs:
        row["source_pcm_sha256"] = "0" * 64
    projection = _projection(base, repairs)
    with tempfile.TemporaryDirectory(prefix="utterance-repair-preview-") as temporary:
        output = Path(temporary) / "audio.wav"
        _write(base, repairs, output, planning=True)
        digest = file_sha256(output)
    result: RepairManifest = {"schema_version": 1, "kind": KIND, "implementation": dict(IMPLEMENTATION),
        "original": copy.deepcopy(base["original"]), "base_edit": base, "repairs": repairs,
        "derived": {"audio_sha256": digest, **projection}, "human_listening_performed": False}
    validate_source_repair_manifest(result)
    return result


def execute_source_repair(document: RepairManifest, *, expected_manifest_sha256: str, output: Path) -> Path:
    validate_source_repair_manifest(document)
    if manifest_sha256(document) != _hash(expected_manifest_sha256):
        raise PcmEditError("reviewed repair manifest hash mismatch")
    base, repairs = document["base_edit"], document["repairs"]
    _verify_inputs(base, repairs)
    if output.resolve() in {_absolute(base["original"]["path"]).resolve(), *(_absolute(row["audio_path"]).resolve() for row in repairs)}:
        raise PcmEditError("repair output aliases source audio")
    expected_hash = _hash(document["derived"]["audio_sha256"])
    if output.exists() or output.is_symlink():
        _verify_file(output, expected_hash)
        if _geometry(output)[0] != document["derived"]["frames"]:
            raise PcmEditError("existing repair output frame count differs")
        return output
    with tempfile.TemporaryDirectory(dir=output.parent, prefix=".source-repair-") as temporary:
        candidate = Path(temporary) / "audio.wav"
        _write(base, repairs, candidate, planning=False)
        if file_sha256(candidate) != expected_hash:
            raise PcmEditError("repaired PCM differs from the exact preview")
        os.link(candidate, output)
    return output


def source_repair_files(document: RepairManifest) -> list[tuple[str, Path, str]]:
    """Inventory every replacement and receipt for downstream before/after checks."""
    validate_source_repair_manifest(document)
    files: list[tuple[str, Path, str]] = []
    for index, row in enumerate(document["repairs"]):
        files.append((f"replacement-{index:04d}-audio", _absolute(row["audio_path"]), _hash(row["audio_sha256"])))
        for evidence_index, item in enumerate(_rows(row["evidence"])):
            files.append((f"replacement-{index:04d}-evidence-{evidence_index:04d}", _absolute(item["path"]), _hash(item["sha256"])))
    return files


def verify_source_repair_inputs(document: RepairManifest) -> None:
    validate_source_repair_manifest(document)
    _verify_inputs(document["base_edit"], document["repairs"])


def validate_canonical_repairs(repairs: list[dict[str, object]], base: SourceEditManifest,
                               plan: dict[str, object], assembly: dict[str, object]) -> None:
    cuts = [FrameInterval(_integer(row["start_frame"]), _integer(row["end_frame"])) for row in base["cuts"]]
    frames = _integer(base["original"]["frames"])
    complete = cast(dict[str, object], assembly["complete"])
    chapters = _rows(assembly["chapters"])
    starts = _rows(complete["chapter_starts"])
    tasks = _rows(plan["tasks"])
    for repair in repairs:
        matches: list[dict[str, object]] = []
        for task in tasks:
            utterance = cast(dict[str, object], cast(dict[str, object], task["input"])["utterance"])
            spans = _rows(utterance["spans"])
            if any(span["entry_id"] == repair["entry_id"] for span in spans):
                if len(spans) != 1 or spans[0]["part_count"] != 1 or utterance["text"] != repair["canonical_text"]:
                    raise ValueError("replacement text must match one complete canonical utterance")
                matches.append(task)
        if len(matches) != 1:
            raise ValueError("replacement requires one uniquely identified canonical utterance")
        task = matches[0]
        intervals: list[tuple[int, int]] = []
        for chapter, start in zip(chapters, starts, strict=True):
            for timing in _rows(chapter["timing"]):
                if timing["input_sha256"] == task["input_sha256"] and timing["entry_ids"] == [repair["entry_id"]]:
                    offset = _integer(start["start_frame"])
                    # Keep the immutable source samples adjacent to declared boundaries.
                    left = map_frame(offset + _integer(timing["start_frame"]) + 1, cuts, frames)
                    right = map_frame(offset + _integer(timing["end_frame"]) - 1, cuts, frames)
                    intervals.append((left, right))
        if len(intervals) != 1 or intervals[0] != (repair["start_frame"], repair["end_frame"]):
            raise ValueError("replacement interval differs from the canonical utterance interior")
