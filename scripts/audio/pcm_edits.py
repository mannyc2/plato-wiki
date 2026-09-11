"""Conservative frame-exact silence edits for canonical production RF64 audio."""

from __future__ import annotations

import hashlib
import os
from pathlib import Path
import struct
import tempfile
from dataclasses import dataclass
from collections.abc import Sequence
from typing import BinaryIO

from master_audio import inspect_rf64_pcm24


# About -65 dBFS: recipes can tighten this ceiling, never authorize speech removal.
MAX_QUIET_PCM24 = 4717


class PcmEditError(ValueError):
    """An edit cannot preserve the declared audio contract."""


@dataclass(frozen=True)
class FrameInterval:
    start: int
    end: int


@dataclass(frozen=True)
class EditResult:
    path: Path
    sha256: str
    source_sha256: str
    source_frames: int
    frames: int
    removed_frames: int


def validate_cuts(
    cuts: Sequence[FrameInterval],
    source_frames: int,
    protected: Sequence[FrameInterval] = (),
) -> tuple[FrameInterval, ...]:
    """Validate half-open intervals without silently sorting or merging them."""
    if type(source_frames) is not int or source_frames <= 0:
        raise PcmEditError("source frame count must be a positive integer")
    for interval in (*cuts, *protected):
        if (
            type(interval.start) is not int
            or type(interval.end) is not int
            or not 0 <= interval.start < interval.end <= source_frames
        ):
            raise PcmEditError("frame interval is empty or outside the source")
    previous_end = 0
    for cut in cuts:
        if cut.start < previous_end:
            raise PcmEditError("cuts must be sorted and disjoint")
        if any(cut.start < item.end and item.start < cut.end for item in protected):
            raise PcmEditError("cut intersects a protected interval")
        previous_end = cut.end
    if sum(cut.end - cut.start for cut in cuts) >= source_frames:
        raise PcmEditError("edits must retain at least one frame")
    return tuple(cuts)


def map_frame(frame: int, cuts: Sequence[FrameInterval], source_frames: int) -> int:
    """Map boundaries to the edited timeline; deleted positions collapse to the splice."""
    validated = validate_cuts(cuts, source_frames)
    if type(frame) is not int or not 0 <= frame <= source_frames:
        raise PcmEditError("frame position is outside the source timeline")
    return frame - sum(max(0, min(frame, cut.end) - cut.start) for cut in validated)


def file_sha256(path: Path) -> str:
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest()


def _source_identity(path: Path) -> tuple[int, int, int, int, int]:
    stat = path.stat()
    return stat.st_dev, stat.st_ino, stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns


def _geometry(path: Path) -> tuple[int, int]:
    evidence = inspect_rf64_pcm24(path)
    frames: object = evidence["sample_count"]
    offset: object = evidence["data_offset_bytes"]
    if type(frames) is not int or type(offset) is not int:
        raise PcmEditError("RF64 geometry is not integral")
    return frames, offset


def _header(frames: int) -> bytes:
    size = frames * 3
    return (
        b"RF64" + struct.pack("<I", 0xFFFFFFFF) + b"WAVEds64"
        + struct.pack("<IQQQI", 28, 72 + size + (size & 1), size, frames, 0)
        + b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, 48000, 144000, 3, 24)
        + b"data" + struct.pack("<I", 0xFFFFFFFF)
    )


def _quiet(handle: BinaryIO, offset: int, start: int, end: int, bound: int) -> None:
    handle.seek(offset + start * 3)
    remaining = (end - start) * 3
    while remaining:
        payload = handle.read(min(remaining, 3 * 65536))
        if not payload or len(payload) % 3:
            raise PcmEditError("source changed or was truncated during quiet scan")
        if any(abs(int.from_bytes(payload[i:i + 3], "little", signed=True)) > bound
               for i in range(0, len(payload), 3)):
            raise PcmEditError("cut or retained splice neighborhood exceeds amplitude bound")
        remaining -= len(payload)


def _copy_frames(source: BinaryIO, output: BinaryIO, offset: int, start: int, end: int) -> None:
    source.seek(offset + start * 3)
    remaining = (end - start) * 3
    while remaining:
        payload = source.read(min(remaining, 1024 * 1024))
        if not payload:
            raise PcmEditError("source changed or was truncated during copying")
        output.write(payload)
        remaining -= len(payload)


def write_edited_source(
    source: Path,
    output: Path,
    *,
    expected_sha256: str,
    expected_frames: int,
    cuts: Sequence[FrameInterval],
    max_abs_amplitude: int,
    protected: Sequence[FrameInterval] = (),
    guard_frames: int = 960,
) -> EditResult:
    """Publish a new RF64 only after rechecking source bytes and output geometry.

    Amplitude bounds are integer PCM24 sample magnitudes. Retained splice guards
    are at least 20 ms, shortened only by source edges or neighboring cuts.
    """
    validated = validate_cuts(cuts, expected_frames, protected)
    if type(max_abs_amplitude) is not int or not 0 <= max_abs_amplitude <= MAX_QUIET_PCM24:
        raise PcmEditError("amplitude bound exceeds the conservative PCM24 quiet ceiling")
    if type(guard_frames) is not int or guard_frames < 960:
        raise PcmEditError("splice guards must cover at least 20 ms")
    if output.exists() or output.is_symlink():
        raise PcmEditError("output already exists")
    before = _source_identity(source)
    frames, offset = _geometry(source)
    if frames != expected_frames or file_sha256(source) != expected_sha256:
        raise PcmEditError("source hash or frame count mismatch")
    removed = sum(cut.end - cut.start for cut in validated)
    output_frames = frames - removed
    temporary: Path | None = None
    try:
        with source.open("rb") as handle:
            for index, cut in enumerate(validated):
                left = validated[index - 1].end if index else 0
                right = validated[index + 1].start if index + 1 < len(validated) else frames
                _quiet(handle, offset, max(left, cut.start - guard_frames),
                       min(right, cut.end + guard_frames), max_abs_amplitude)
            with tempfile.NamedTemporaryFile(dir=output.parent, prefix=".pcm-edit-", delete=False) as target:
                temporary = Path(target.name)
                target.write(_header(output_frames))
                position = 0
                for cut in validated:
                    _copy_frames(handle, target, offset, position, cut.start)
                    position = cut.end
                _copy_frames(handle, target, offset, position, frames)
                if output_frames * 3 & 1:
                    target.write(b"\x00")
                target.flush()
                os.fsync(target.fileno())
        if _geometry(temporary)[0] != output_frames:
            raise PcmEditError("edited output frame count mismatch")
        result_hash = file_sha256(temporary)
        if (file_sha256(source) != expected_sha256 or _geometry(source)[0] != frames
                or _source_identity(source) != before):
            raise PcmEditError("source mutated while applying edits")
        # An exclusive hard-link publication also refuses a concurrently created output.
        os.link(temporary, output)
        return EditResult(output, result_hash, expected_sha256, frames, output_frames, removed)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
