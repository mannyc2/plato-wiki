"""Hash-bound mechanical PCM edits, distinct from original renderer artifacts."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import asdict, dataclass
import hashlib
import json
import math
import os
from pathlib import Path
import tempfile
from typing import TypedDict

import pcm_edits
from pcm_edits import MAX_QUIET_PCM24, FrameInterval, PcmEditError, file_sha256, map_frame, validate_cuts, write_edited_source


@dataclass(frozen=True)
class Cut:
    start_frame: int
    end_frame: int
    reason: str


@dataclass(frozen=True)
class EditPolicy:
    max_abs_amplitude: int
    guard_frames: int
    mechanical_review_basis: str


class SourceEditManifest(TypedDict):
    schema_version: int
    kind: str
    implementation: dict[str, str]
    original: dict[str, object]
    cuts: list[dict[str, object]]
    policy: dict[str, object]
    protected_spans: list[dict[str, object]]
    protected_geometry: list[dict[str, object]]
    derived: dict[str, object]


_IMPLEMENTATION = {
    "source_audio_edits_sha256": file_sha256(Path(__file__)),
    "pcm_edits_sha256": file_sha256(Path(pcm_edits.__file__)),
}


def _canonical(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()


def manifest_sha256(value: object) -> str:
    return hashlib.sha256(_canonical(value)).hexdigest()


def _integer(value: object) -> int:
    if type(value) is not int:
        raise PcmEditError("expected an integer frame or policy value")
    return value


def _text(value: object) -> str:
    if not isinstance(value, str) or not value.strip():
        raise PcmEditError("expected nonempty evidence text")
    return value


def _hash(value: object) -> str:
    result = _text(value)
    if len(result) != 64 or any(c not in "0123456789abcdef" for c in result):
        raise PcmEditError("invalid SHA-256 evidence")
    return result


def _rows(value: object) -> list[dict[str, object]]:
    if not isinstance(value, list):
        raise PcmEditError("expected evidence rows")
    result: list[dict[str, object]] = []
    for row in value:
        if not isinstance(row, dict) or any(not isinstance(key, str) for key in row):
            raise PcmEditError("invalid evidence row")
        result.append({str(key): item for key, item in row.items()})
    return result


def _interval(row: Mapping[str, object], frames: int, *, empty: bool = False) -> FrameInterval:
    start, end = _integer(row["start_frame"]), _integer(row["end_frame"])
    if not 0 <= start <= end <= frames or (not empty and start == end):
        raise PcmEditError("invalid source evidence interval")
    return FrameInterval(start, end)


def _geometry(
    chapters: Sequence[Mapping[str, object]], boundaries: Sequence[Mapping[str, object]],
    cuts: Sequence[FrameInterval], spans: Sequence[FrameInterval], frames: int,
) -> tuple[list[dict[str, object]], list[dict[str, object]], list[FrameInterval]]:
    protected = list(spans)
    projected_chapters: list[dict[str, object]] = []
    previous_end = 0
    chapter_ids: set[str] = set()
    for row in chapters:
        interval = _interval(row, frames)
        chapter_id = _text(row["chapter_id"])
        if interval.start < previous_end or chapter_id in chapter_ids:
            raise PcmEditError("chapter rows must be ordered, disjoint and uniquely identified")
        chapter_ids.add(chapter_id)
        previous_end = interval.end
        for edge in (interval.start, interval.end):
            protected.append(FrameInterval(max(0, edge - 1), min(frames, edge + 1)))
        start, end = map_frame(interval.start, cuts, frames), map_frame(interval.end, cuts, frames)
        if end <= start:
            raise PcmEditError("edit deletes a chapter")
        projected_chapters.append({"chapter_id": chapter_id, "start_frame": start, "end_frame": end,
                                   "frames": end - start, "start_seconds": start / 48000, "end_seconds": end / 48000})
    if not chapters:
        raise PcmEditError("chapter evidence is required")
    projected_boundaries: list[dict[str, object]] = []
    for row in boundaries:
        interval = _interval(row, frames, empty=True)
        raw_crossfade = row.get("crossfade_ms", 0)
        if type(raw_crossfade) not in (int, float):
            raise PcmEditError("invalid crossfade duration")
        crossfade = float(raw_crossfade)
        if not math.isfinite(crossfade) or crossfade < 0:
            raise PcmEditError("invalid crossfade duration")
        expansion = math.ceil(crossfade * 48)
        # Both sides protect the overlap regardless of whether a renderer point
        # denotes the beginning or end of its crossfade interval.
        left, right = max(0, interval.start - max(1, expansion)), min(frames, interval.end + max(1, expansion))
        protected.append(FrameInterval(left, right))
        start, end = map_frame(interval.start, cuts, frames), map_frame(interval.end, cuts, frames)
        if end - start != interval.end - interval.start:
            raise PcmEditError("edit alters a declared pause")
        projected = dict(row)
        projected.update(start_frame=start, end_frame=end)
        if "start_seconds" in projected:
            projected["start_seconds"] = start / 48000
        if "end_seconds" in projected:
            projected["end_seconds"] = end / 48000
        projected_boundaries.append(projected)
    validate_cuts(cuts, frames, protected)
    return projected_chapters, projected_boundaries, protected


def preview_source_edit(
    original_source: Path, *, original_sha256: str, original_frames: int,
    chapter_timeline: Sequence[Mapping[str, object]], boundaries: Sequence[Mapping[str, object]],
    render_plan_artifact_sha256: str, cuts: Sequence[Cut], policy: EditPolicy,
    protected_spans: Sequence[FrameInterval] = (),
) -> SourceEditManifest:
    """Compute a reviewable manifest using only a temporary derived PCM file."""
    _hash(original_sha256)
    _hash(render_plan_artifact_sha256)
    _text(policy.mechanical_review_basis)
    intervals = [FrameInterval(cut.start_frame, cut.end_frame) for cut in cuts]
    for cut in cuts:
        _text(cut.reason)
    validate_cuts(intervals, original_frames, protected_spans)
    chapters = [dict(row) for row in chapter_timeline]
    original_boundaries = [dict(row) for row in boundaries]
    mapped_chapters, mapped_boundaries, protected = _geometry(chapters, original_boundaries, intervals, protected_spans, original_frames)
    with tempfile.TemporaryDirectory(prefix="source-edit-preview-") as temporary:
        result = write_edited_source(original_source, Path(temporary) / "audio.wav", expected_sha256=original_sha256,
                                     expected_frames=original_frames, cuts=intervals, protected=protected,
                                     max_abs_amplitude=policy.max_abs_amplitude, guard_frames=policy.guard_frames)
    return {
        "schema_version": 1, "kind": "mechanically-reviewed-derived-pcm",
        "implementation": dict(_IMPLEMENTATION),
        "original": {"path": str(original_source.resolve()), "audio_sha256": original_sha256, "frames": original_frames,
                     "render_plan_artifact_sha256": render_plan_artifact_sha256,
                     "chapter_timeline": chapters, "chapter_timeline_sha256": manifest_sha256(chapters),
                     "boundaries": original_boundaries, "boundaries_sha256": manifest_sha256(original_boundaries)},
        "cuts": [{"start_frame": cut.start_frame, "end_frame": cut.end_frame, "reason": cut.reason} for cut in cuts],
        "policy": {**asdict(policy), "human_listening_performed": False},
        "protected_spans": [{"start_frame": span.start, "end_frame": span.end} for span in protected_spans],
        "protected_geometry": [{"start_frame": span.start, "end_frame": span.end} for span in protected],
        "derived": {"audio_sha256": result.sha256, "frames": result.frames, "removed_frames": result.removed_frames,
                    "chapter_timeline": mapped_chapters, "chapter_timeline_sha256": manifest_sha256(mapped_chapters),
                    "boundaries": mapped_boundaries, "boundaries_sha256": manifest_sha256(mapped_boundaries)},
    }


def _exact_keys(value: object, fields: set[str], label: str) -> None:
    if not isinstance(value, dict) or set(value) != fields:
        raise PcmEditError(f"{label} fields are invalid")


def _validate_source_edit_manifest(manifest: SourceEditManifest) -> None:
    _exact_keys(manifest, {
        "schema_version", "kind", "implementation", "original", "cuts", "policy",
        "protected_spans", "protected_geometry", "derived",
    }, "source edit manifest")
    _exact_keys(manifest["original"], {
        "path", "audio_sha256", "frames", "render_plan_artifact_sha256",
        "chapter_timeline", "chapter_timeline_sha256", "boundaries", "boundaries_sha256",
    }, "source edit original")
    _exact_keys(manifest["derived"], {
        "audio_sha256", "frames", "removed_frames", "chapter_timeline",
        "chapter_timeline_sha256", "boundaries", "boundaries_sha256",
    }, "source edit derived")
    _exact_keys(manifest["policy"], {
        "max_abs_amplitude", "guard_frames", "mechanical_review_basis", "human_listening_performed",
    }, "source edit policy")
    for name, fields in (
        ("cuts", {"start_frame", "end_frame", "reason"}),
        ("protected_spans", {"start_frame", "end_frame"}),
        ("protected_geometry", {"start_frame", "end_frame"}),
    ):
        for row in _rows(manifest[name]):
            _exact_keys(row, fields, f"source edit {name}")
    if type(manifest["schema_version"]) is not int or manifest["schema_version"] != 1 or manifest["kind"] != "mechanically-reviewed-derived-pcm":
        raise PcmEditError("unsupported source edit manifest")
    if manifest["implementation"] != _IMPLEMENTATION:
        raise PcmEditError("source edit implementation binding changed")
    original, derived, policy = manifest["original"], manifest["derived"], manifest["policy"]
    frames = _integer(original["frames"])
    source = Path(_text(original["path"]))
    source_hash = _hash(original["audio_sha256"])
    _hash(original["render_plan_artifact_sha256"])
    _text(policy["mechanical_review_basis"])
    if policy["human_listening_performed"] is not False:
        raise PcmEditError("mechanical edit manifests cannot claim human listening")
    chapters, boundaries = _rows(original["chapter_timeline"]), _rows(original["boundaries"])
    intervals = [_interval(row, frames) for row in manifest["cuts"]]
    for row in manifest["cuts"]:
        _text(row["reason"])
    spans = [_interval(row, frames) for row in manifest["protected_spans"]]
    mapped_chapters, mapped_boundaries, protected = _geometry(chapters, boundaries, intervals, spans, frames)
    for evidence, rows, name in ((original, chapters, "chapter_timeline"), (original, boundaries, "boundaries"),
                                 (derived, mapped_chapters, "chapter_timeline"), (derived, mapped_boundaries, "boundaries")):
        if evidence[name] != rows or evidence[name + "_sha256"] != manifest_sha256(rows):
            raise PcmEditError("manifest geometry or evidence hash mismatch")
    if manifest["protected_geometry"] != [{"start_frame": span.start, "end_frame": span.end} for span in protected]:
        raise PcmEditError("manifest protection geometry mismatch")
    removed = sum(interval.end - interval.start for interval in intervals)
    if _integer(derived["frames"]) != frames - removed or _integer(derived["removed_frames"]) != removed:
        raise PcmEditError("derived frame arithmetic mismatch")
    expected_output_hash = _hash(derived["audio_sha256"])
    bound, guard = _integer(policy["max_abs_amplitude"]), _integer(policy["guard_frames"])
    if not 0 <= bound <= MAX_QUIET_PCM24 or guard < 960:
        raise PcmEditError("invalid amplitude or guard policy")


def validate_source_edit_manifest(manifest: SourceEditManifest) -> None:
    """Validate embedded hashes, policy and projected geometry without media I/O."""
    try:
        _validate_source_edit_manifest(manifest)
    except (KeyError, TypeError, AttributeError) as error:
        raise PcmEditError("malformed source edit manifest") from error


def execute_source_edit(manifest: SourceEditManifest, *, expected_manifest_sha256: str, output: Path) -> Path:
    """Execute the exact reviewed manifest or verify an already published result."""
    if manifest_sha256(manifest) != _hash(expected_manifest_sha256):
        raise PcmEditError("reviewed manifest hash mismatch")
    validate_source_edit_manifest(manifest)
    original, derived, policy = manifest["original"], manifest["derived"], manifest["policy"]
    frames = _integer(original["frames"])
    source = Path(_text(original["path"]))
    if output.resolve() == source.resolve():
        raise PcmEditError("derived output must not be the original source")
    source_hash = _hash(original["audio_sha256"])
    intervals = [_interval(row, frames) for row in manifest["cuts"]]
    protected = [_interval(row, frames) for row in manifest["protected_geometry"]]
    removed = sum(interval.end - interval.start for interval in intervals)
    expected_output_hash = _hash(derived["audio_sha256"])
    from master_audio import inspect_rf64_pcm24
    if source.is_symlink() or file_sha256(source) != source_hash or inspect_rf64_pcm24(source)["sample_count"] != frames:
        raise PcmEditError("original source evidence changed")
    # Even resumes validate current policy, not only the manifest's output digest.
    bound, guard = _integer(policy["max_abs_amplitude"]), _integer(policy["guard_frames"])
    if not 0 <= bound <= MAX_QUIET_PCM24 or guard < 960:
        raise PcmEditError("invalid amplitude or guard policy")
    if output.exists() or output.is_symlink():
        if output.is_symlink() or file_sha256(output) != expected_output_hash or inspect_rf64_pcm24(output)["sample_count"] != frames - removed:
            raise PcmEditError("existing derived output evidence changed")
        return output
    with tempfile.TemporaryDirectory(dir=output.parent, prefix=".source-edit-") as temporary:
        candidate = Path(temporary) / "audio.wav"
        result = write_edited_source(source, candidate, expected_sha256=source_hash, expected_frames=frames,
                                     cuts=intervals, protected=protected, max_abs_amplitude=bound, guard_frames=guard)
        if result.sha256 != expected_output_hash or result.frames != derived["frames"]:
            raise PcmEditError("derived output disagrees with reviewed preview")
        os.link(candidate, output)
    return output
