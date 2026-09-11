"""Source editing preserves original provenance and refuses tampered resume state."""

import copy
from pathlib import Path
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))
from pcm_edits import MAX_QUIET_PCM24, FrameInterval, PcmEditError, file_sha256
from source_audio_edits import Cut, EditPolicy, SourceEditManifest, execute_source_edit, manifest_sha256, preview_source_edit, validate_source_edit_manifest


class SourceAudioEditTests(unittest.TestCase):
    def setUp(self) -> None:
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.source = Path(self.directory.name) / "source.wav"
        self.output = Path(self.directory.name) / "edited.wav"
        frames = 10000
        size = frames * 3
        self.source.write_bytes(b"RF64" + struct.pack("<I", 0xFFFFFFFF) + b"WAVEds64"
                                + struct.pack("<IQQQI", 28, 72 + size, size, frames, 0)
                                + b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, 48000, 144000, 3, 24)
                                + b"data" + struct.pack("<I", 0xFFFFFFFF) + b"\x01\x00\x00" * frames)
        self.chapters: list[dict[str, object]] = [
            {"chapter_id": "a", "start_frame": 0, "end_frame": 4800, "audio_sha256": "a" * 64},
            {"chapter_id": "b", "start_frame": 5000, "end_frame": 10000, "audio_sha256": "b" * 64}]
        self.boundaries: list[dict[str, object]] = [
            {"start_frame": 4800, "end_frame": 5000, "crossfade_ms": 0, "pause_ms": 200 / 48, "kind": "chapter-boundary"},
            {"start_frame": 7500, "end_frame": 7500, "crossfade_ms": 18, "pause_ms": 0, "kind": "same-speaker-continuation"}]

    def preview(self, cuts: tuple[Cut, ...] = (Cut(2000, 2200, "Verified quiet interior"),)) -> SourceEditManifest:
        return preview_source_edit(self.source, original_sha256=file_sha256(self.source), original_frames=10000,
                                   chapter_timeline=self.chapters, boundaries=self.boundaries,
                                   render_plan_artifact_sha256="c" * 64, cuts=cuts,
                                   policy=EditPolicy(2, 960, "Conservative sample-amplitude review"))

    def test_preview_execution_resume_and_projected_geometry(self) -> None:
        manifest = self.preview()
        self.assertFalse(self.output.exists())
        self.assertEqual(manifest["original"]["chapter_timeline"], self.chapters)
        expected = [{"chapter_id": "a", "start_frame": 0, "end_frame": 4600, "frames": 4600,
                     "start_seconds": 0, "end_seconds": 4600 / 48000},
                    {"chapter_id": "b", "start_frame": 4800, "end_frame": 9800, "frames": 5000,
                     "start_seconds": 4800 / 48000, "end_seconds": 9800 / 48000}]
        self.assertEqual(manifest["derived"]["chapter_timeline"], expected)
        reviewed = manifest_sha256(manifest)
        execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)
        self.assertEqual(file_sha256(self.output), manifest["derived"]["audio_sha256"])
        self.assertEqual(execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output), self.output)
        self.assertEqual(file_sha256(self.source), manifest["original"]["audio_sha256"])

    def test_cut_tampering_invalidates_review(self) -> None:
        manifest = self.preview()
        reviewed = manifest_sha256(manifest)
        manifest["cuts"][0]["end_frame"] = 2300
        with self.assertRaisesRegex(PcmEditError, "manifest hash"):
            execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)

    def test_source_tampering_prevents_execution_and_resume(self) -> None:
        manifest = self.preview()
        reviewed = manifest_sha256(manifest)
        execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)
        with self.source.open("r+b") as handle:
            handle.seek(80)
            handle.write(b"\x02")
        with self.assertRaisesRegex(PcmEditError, "source evidence"):
            execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)

    def test_output_tampering_refuses_resume(self) -> None:
        manifest = self.preview()
        reviewed = manifest_sha256(manifest)
        execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)
        with self.output.open("r+b") as handle:
            handle.seek(80)
            handle.write(b"\x02")
        with self.assertRaisesRegex(PcmEditError, "output evidence"):
            execute_source_edit(manifest, expected_manifest_sha256=reviewed, output=self.output)

    def test_geometry_and_evidence_hashes_recomputed(self) -> None:
        original = self.preview()
        for section, field, value in (("original", "boundaries_sha256", "0" * 64),
                                      ("derived", "frames", 9900),
                                      ("derived", "chapter_timeline", [])):
            manifest = copy.deepcopy(original)
            manifest[section][field] = value
            with self.subTest(field=field), self.assertRaises(PcmEditError):
                execute_source_edit(manifest, expected_manifest_sha256=manifest_sha256(manifest), output=self.output)

    def test_pause_crossfade_chapter_edge_and_protected_span(self) -> None:
        for start, end in ((4799, 4801), (4900, 4910), (7000, 7010), (4999, 5001)):
            with self.subTest(start=start), self.assertRaises(PcmEditError):
                self.preview((Cut(start, end, "must fail"),))
        with self.assertRaises(PcmEditError):
            preview_source_edit(self.source, original_sha256=file_sha256(self.source), original_frames=10000,
                                chapter_timeline=self.chapters, boundaries=self.boundaries,
                                render_plan_artifact_sha256="c" * 64, cuts=(Cut(2000, 2200, "must fail"),),
                                policy=EditPolicy(2, 960, "mechanical review"),
                                protected_spans=(FrameInterval(2000, 2200),))

    def test_pure_validation_does_not_read_media(self) -> None:
        manifest = self.preview()
        self.source.unlink()
        with patch("source_audio_edits.file_sha256", side_effect=AssertionError("unexpected I/O")):
            validate_source_edit_manifest(manifest)

    def test_malformed_keys_hashes_and_stale_implementation(self) -> None:
        manifest = self.preview()
        missing = copy.deepcopy(manifest)
        del missing["policy"]["guard_frames"]
        invalid_hash = copy.deepcopy(manifest)
        invalid_hash["original"]["render_plan_artifact_sha256"] = "bad"
        stale = copy.deepcopy(manifest)
        stale["implementation"]["pcm_edits_sha256"] = "0" * 64
        changed_projection = copy.deepcopy(manifest)
        changed_projection["derived"]["boundaries"] = []
        for candidate in (missing, invalid_hash, stale, changed_projection):
            with self.subTest(candidate=candidate), self.assertRaises(PcmEditError):
                validate_source_edit_manifest(candidate)

    def test_manifest_cannot_raise_quiet_ceiling_even_on_resume(self) -> None:
        manifest = self.preview()
        execute_source_edit(manifest, expected_manifest_sha256=manifest_sha256(manifest), output=self.output)
        for value in (MAX_QUIET_PCM24 + 1, 8_388_607):
            changed = copy.deepcopy(manifest)
            changed["policy"]["max_abs_amplitude"] = value
            with self.subTest(value=value), self.assertRaisesRegex(PcmEditError, "amplitude"):
                execute_source_edit(changed, expected_manifest_sha256=manifest_sha256(changed), output=self.output)
        self.assertEqual(file_sha256(self.output), manifest["derived"]["audio_sha256"])

    def test_manifest_rejects_unknown_top_and_nested_fields(self) -> None:
        manifest = self.preview()
        for location in ("top", "original", "derived", "policy", "cuts", "protected_spans", "protected_geometry"):
            changed = copy.deepcopy(manifest)
            if location == "top":
                changed["accepted"] = True
            elif location in ("original", "derived", "policy"):
                changed[location]["accepted"] = True
            elif location == "protected_spans":
                changed[location] = [{"start_frame": 10, "end_frame": 20, "accepted": True}]
            else:
                changed[location][0]["accepted"] = True
            with self.subTest(location=location), self.assertRaisesRegex(PcmEditError, "fields"):
                validate_source_edit_manifest(changed)

    def test_derived_hash_checked_before_publication(self) -> None:
        manifest = self.preview()
        manifest["derived"]["audio_sha256"] = "0" * 64
        with self.assertRaisesRegex(PcmEditError, "reviewed preview"):
            execute_source_edit(manifest, expected_manifest_sha256=manifest_sha256(manifest), output=self.output)
        self.assertFalse(self.output.exists())


if __name__ == "__main__":
    unittest.main()
