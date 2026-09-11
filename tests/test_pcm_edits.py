"""Frame edits must preserve retained PCM and fail closed on evidence drift."""

import hashlib
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch
from typing import BinaryIO

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))
import pcm_edits as edits


class PcmEditsTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.source = Path(self.directory.name) / "source.wav"
        self.output = Path(self.directory.name) / "edited.wav"
        self.samples = [(-1 if i % 2 else 1) * (i % 11) for i in range(6001)]
        self.write_source()

    def write_source(self) -> None:
        payload = b"".join(value.to_bytes(3, "little", signed=True) for value in self.samples)
        size = len(payload)
        header = (b"RF64" + struct.pack("<I", 0xFFFFFFFF) + b"WAVEds64"
                  + struct.pack("<IQQQI", 28, 72 + size + (size & 1), size, len(self.samples), 0)
                  + b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, 48000, 144000, 3, 24)
                  + b"data" + struct.pack("<I", 0xFFFFFFFF))
        self.source.write_bytes(header + payload + (b"\x00" if size & 1 else b""))
        self.digest = hashlib.sha256(self.source.read_bytes()).hexdigest()

    def apply(self, cuts: tuple[edits.FrameInterval, ...] = ()) -> edits.EditResult:
        return edits.write_edited_source(self.source, self.output,
                                         expected_sha256=self.digest, expected_frames=len(self.samples),
                                         cuts=cuts, max_abs_amplitude=10)

    def test_preserves_every_retained_byte_and_maps_chapter_offsets(self) -> None:
        cuts = (edits.FrameInterval(1500, 1700), edits.FrameInterval(3500, 3801))
        result = self.apply(cuts)
        expected = self.samples[:1500] + self.samples[1700:3500] + self.samples[3801:]
        pcm = b"".join(value.to_bytes(3, "little", signed=True) for value in expected)
        self.assertEqual(self.output.read_bytes()[80:80 + len(pcm)], pcm)
        self.assertEqual(result.frames, 5500)
        self.assertEqual(result.removed_frames, 501)
        self.assertEqual(result.sha256, hashlib.sha256(self.output.read_bytes()).hexdigest())
        self.assertEqual(edits.map_frame(4000, cuts, 6001), 3499)
        self.assertEqual(edits.map_frame(1600, cuts, 6001), 1500)
        self.assertEqual(edits.map_frame(6001, cuts, 6001), 5500)
        self.assertEqual(hashlib.sha256(self.source.read_bytes()).hexdigest(), self.digest)

    def test_zero_cuts_preserve_source_bytes(self) -> None:
        self.apply()
        self.assertEqual(self.source.read_bytes(), self.output.read_bytes())

    def test_hash_and_frame_mismatch(self) -> None:
        for digest, frames in (("0" * 64, 6001), (self.digest, 6000)):
            with self.subTest(digest=digest, frames=frames), self.assertRaises(edits.PcmEditError):
                edits.write_edited_source(self.source, self.output, expected_sha256=digest,
                                         expected_frames=frames, cuts=(), max_abs_amplitude=10)
        self.assertFalse(self.output.exists())

    def test_protected_overlap(self) -> None:
        with self.assertRaisesRegex(edits.PcmEditError, "protected"):
            edits.write_edited_source(self.source, self.output, expected_sha256=self.digest,
                                     expected_frames=6001, cuts=(edits.FrameInterval(2000, 2200),),
                                     protected=(edits.FrameInterval(2100, 2300),), max_abs_amplitude=10)

    def test_loud_deletion_and_retained_neighborhood(self) -> None:
        for frame in (2100, 1999, 2200):
            with self.subTest(frame=frame):
                self.samples = [0] * 6001
                self.samples[frame] = -11
                self.write_source()
                with self.assertRaisesRegex(edits.PcmEditError, "amplitude"):
                    self.apply((edits.FrameInterval(2000, 2200),))
                self.assertFalse(self.output.exists())

    def test_recipe_cannot_raise_the_quiet_ceiling_to_remove_voiced_pcm(self) -> None:
        self.samples = [0] * 6001
        self.samples[2100] = 1_000_000
        self.write_source()
        for requested in (edits.MAX_QUIET_PCM24 + 1, 8_388_607):
            with self.subTest(requested=requested), self.assertRaisesRegex(edits.PcmEditError, "quiet ceiling"):
                edits.write_edited_source(
                    self.source, self.output, expected_sha256=self.digest,
                    expected_frames=len(self.samples), cuts=(edits.FrameInterval(2000, 2200),),
                    max_abs_amplitude=requested,
                )
            self.assertFalse(self.output.exists())
        self.assertEqual(edits.file_sha256(self.source), self.digest)

    def test_malformed_ranges(self) -> None:
        for cuts in ((edits.FrameInterval(2, 2),), (edits.FrameInterval(-1, 2),),
                     (edits.FrameInterval(0, 6002),), (edits.FrameInterval(0, 6001),),
                     (edits.FrameInterval(10, 20), edits.FrameInterval(5, 8)),
                     (edits.FrameInterval(10, 20), edits.FrameInterval(19, 25))):
            with self.subTest(cuts=cuts), self.assertRaises(edits.PcmEditError):
                self.apply(cuts)

    def test_output_refuses_overwrite(self) -> None:
        self.output.write_bytes(b"keep")
        with self.assertRaises(edits.PcmEditError):
            self.apply()
        self.assertEqual(self.output.read_bytes(), b"keep")

    def test_source_mutation_during_copy_prevents_publication(self) -> None:
        original_copy = edits._copy_frames

        def mutating_copy(source: BinaryIO, output: BinaryIO, offset: int, start: int, end: int) -> None:
            original_copy(source, output, offset, start, end)
            with self.source.open("r+b") as changing:
                changing.seek(80)
                changing.write(b"\x01\x00\x00")

        with patch.object(edits, "_copy_frames", mutating_copy):
            with self.assertRaisesRegex(edits.PcmEditError, "mutated"):
                self.apply()
        self.assertFalse(self.output.exists())
        self.assertEqual(list(Path(self.directory.name).glob(".pcm-edit-*")), [])


if __name__ == "__main__":
    unittest.main()
