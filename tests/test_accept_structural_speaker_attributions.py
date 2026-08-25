from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import accept_structural_speaker_attributions as acceptance  # noqa: E402
from accept_structural_speaker_attributions import (  # noqa: E402
    TurnAlignmentError,
    build_corpus_acceptance,
    write_corpus_acceptance,
)
from align_canonical_turn_references import canonical_json, sha256_bytes, sha256_file  # noqa: E402


def utf16(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


class AcceptedAttributionFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.raw = root / "raw/plato/english/fixture.txt"
        self.raw.parent.mkdir(parents=True)
        self.draft_root = root / "scratch/drafts"
        self.draft_root.mkdir(parents=True)
        self.audio = root / "audio"
        self.audio.mkdir()
        self.script_root = root / "scripts/audio"
        self.script_root.mkdir(parents=True)
        self.draft_generator = self.script_root / "build_structural_speaker_drafts.py"
        self.acceptance_generator = self.script_root / "accept_structural_speaker_attributions.py"
        self.draft_generator.write_text("# fixture draft generator\n", encoding="utf-8")
        self.acceptance_generator.write_text("# fixture acceptance generator\n", encoding="utf-8")
        self.parts = [
            ("Fixture", "unresolved", None, "narrator_or_unattributed", self.evidence("/head[1]", "element-text")),
            (" {1a} ", "unresolved", None, "narrator_or_unattributed", self.evidence("/milestone[1]", "milestone-marker")),
            ("Alpha.", "assigned", "alpha", None, self.evidence("/said[1]/label[1]", "element-text", ["alpha"])),
            (" Hello.", "assigned", "alpha", None, self.evidence("/said[1]", "direct-text", ["alpha"])),
            (" {1b} ", "unresolved", None, "mixed_boundary_whitespace", self.evidence("/milestone[2]", "milestone-marker")),
            ("Beta.", "assigned", "beta", None, self.evidence("/said[2]/label[1]", "element-text", ["beta"])),
            (" Yes.", "assigned", "beta", None, self.evidence("/said[2]", "direct-text", ["beta"])),
            (" Together.", "unresolved", None, "multiple_source_attributions", self.evidence("/said[3]", "direct-text", ["alpha", "beta"], "#Alpha #Beta")),
            ("\n", "unresolved", None, "narrator_or_unattributed", self.evidence("/p[1]", "block-separator")),
        ]
        text = "".join(part[0] for part in self.parts)
        self.raw.write_text(text, encoding="utf-8")
        self.characters = {
            "schemaVersion": 3,
            "status": "complete",
            "dialogues": [{"dialogue": "fixture"}],
            "characters": [
                self.character("alpha", ["#Alpha"]),
                self.character("beta", ["#Beta"]),
                self.character("commentary-narrator", []),
            ],
        }
        self.character_path = self.audio / "characters.json"
        self.character_path.write_text(json.dumps(self.characters), encoding="utf-8")
        self.draft = self.make_draft(text)
        self.draft_path = self.draft_root / "fixture.draft.json"
        self.draft_path.write_text(json.dumps(self.draft), encoding="utf-8")
        self.matrix = {
            "schema_version": 1,
            "artifact_kind": "structural-speaker-draft-status-matrix",
            "input_hashes": {
                "characters_sha256": sha256_file(self.character_path),
                "generator_sha256": sha256_file(self.draft_generator),
            },
            "dialogues": [
                {"dialogue": "fixture", "draft_sha256": self.draft["draft_sha256"]}
            ],
        }
        self.matrix["matrix_sha256"] = sha256_bytes(canonical_json(self.matrix))
        self.matrix_path = self.draft_root / "status-matrix.json"
        self.matrix_path.write_text(json.dumps(self.matrix), encoding="utf-8")

    @staticmethod
    def character(character_id: str, attributions: list[str]) -> dict:
        return {
            "characterId": character_id,
            "displayName": character_id,
            "identityStatus": "resolved",
            "appearances": [
                {
                    "dialogue": "fixture",
                    "editorialStatus": "resolved",
                    "performanceRole": "voice-owner",
                    "roleFlags": ["source-speaker"],
                    "sourceAttributions": attributions,
                }
            ],
        }

    @staticmethod
    def evidence(
        suffix: str,
        origin: str,
        candidates: list[str] | None = None,
        raw_who: str | None = None,
    ) -> dict:
        value = {
            "dom_node_path": f"/TEI[1]/text[1]{suffix}",
            "dom_text_origin": origin,
        }
        if candidates is not None:
            value["candidate_character_ids"] = candidates
            value["raw_who"] = raw_who or f"#{candidates[0].title()}"
        return value

    def make_draft(self, text: str) -> dict:
        rows = []
        offset = 0
        for index, (atom, status, owner, reason, evidence) in enumerate(self.parts, start=1):
            row = {
                "id": f"draft-{index:06d}",
                "start_char": offset,
                "end_char": offset + utf16(atom),
                "text_sha256": sha256_bytes(atom.encode()),
                "utf16_code_units": utf16(atom),
                "source_evidence": evidence,
                "status": status,
            }
            if owner:
                row["character_id"] = owner
                row["assignment_basis"] = "fixture"
            else:
                row["unresolved_reason"] = reason
            rows.append(row)
            offset += utf16(atom)
        draft = {
            "schema_version": 1,
            "artifact_kind": "structurally-proven-speaker-attribution-draft",
            "dialogue": "fixture",
            "source": {
                "english_path": "raw/plato/english/fixture.txt",
                "english_sha256": sha256_bytes(text.encode()),
                "english_utf16_code_units": utf16(text),
            },
            "segments": rows,
        }
        draft["draft_sha256"] = sha256_bytes(canonical_json(draft))
        return draft

    def build(self):
        return build_corpus_acceptance(
            characters_path=self.character_path,
            matrix_path=self.matrix_path,
            draft_root=self.draft_root,
            repo_root=self.root,
            reviewed_at="2026-07-15",
            draft_generator_path=self.draft_generator,
            acceptance_generator_path=self.acceptance_generator,
        )


class AcceptStructuralSpeakerAttributionsTests(unittest.TestCase):
    def test_builds_gapless_accepted_plan_with_narrator_and_chorus_policy(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = AcceptedAttributionFixture(Path(temporary))
            plans, manifest = fixture.build()
            source_text = fixture.raw.read_text(encoding="utf-8")
        plan = plans[0]
        self.assertEqual(plan["status"], "accepted")
        self.assertEqual(plan["voice_policy"], "reported-speech-inherits-active-character-v1")
        self.assertEqual(
            [segment["character_id"] for segment in plan["segments"]],
            ["commentary-narrator", "alpha", "beta", "alpha"],
        )
        self.assertEqual(plan["segments"][0]["start_char"], 0)
        self.assertEqual(
            plan["segments"][-1]["end_char"],
            fixture.draft["source"]["english_utf16_code_units"],
        )
        self.assertEqual(manifest["dialogueCount"], 1)
        self.assertEqual(manifest["catalogDialogueCount"], 1)
        self.assertEqual(
            manifest["manifestSha256"],
            sha256_bytes(
                canonical_json(
                    {key: value for key, value in manifest.items() if key != "manifestSha256"}
                )
            ),
        )
        self.assertEqual(
            manifest["dialogues"][0]["outputSha256"],
            sha256_bytes(acceptance._pretty(plan)),
        )
        for segment in plan["segments"]:
            text = source_text[segment["start_char"] : segment["end_char"]]
            self.assertLessEqual(len(acceptance.STEPHANUS_TOKEN.findall(text)), 1)
        self.assertGreater(
            manifest["dialogues"][0]["resolutionUtf16Counts"][
                "chorus-to-first-source-listed-owner"
            ],
            0,
        )

    def test_rejects_stale_matrix_and_confines_production_writes(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = AcceptedAttributionFixture(Path(temporary))
            fixture.matrix["input_hashes"]["characters_sha256"] = "0" * 64
            fixture.matrix.pop("matrix_sha256")
            fixture.matrix["matrix_sha256"] = sha256_bytes(canonical_json(fixture.matrix))
            fixture.matrix_path.write_text(json.dumps(fixture.matrix), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "stale"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = AcceptedAttributionFixture(Path(temporary))
            plans, manifest = fixture.build()
            with self.assertRaisesRegex(TurnAlignmentError, "confined"):
                write_corpus_acceptance(
                    plans,
                    manifest,
                    output_root=fixture.root / "scratch/not-production",
                    manifest_path=fixture.root / "audio/speaker-attribution-acceptance.json",
                    repo_root=fixture.root,
                )

        with tempfile.TemporaryDirectory() as temporary:
            fixture = AcceptedAttributionFixture(Path(temporary))
            plans, manifest = fixture.build()
            manifest["catalogDialogueCount"] = 2
            manifest.pop("manifestSha256")
            manifest["manifestSha256"] = sha256_bytes(canonical_json(manifest))
            with self.assertRaisesRegex(TurnAlignmentError, "partial canonical"):
                write_corpus_acceptance(
                    plans,
                    manifest,
                    output_root=fixture.root / "audio/speaker-attributions",
                    manifest_path=fixture.root / "audio/speaker-attribution-acceptance.json",
                    repo_root=fixture.root,
                )

    def test_apology_assigns_only_the_live_meletus_replies_to_meletus(self) -> None:
        characters = json.loads((REPO_ROOT / "audio/characters.json").read_text(encoding="utf-8"))
        _, owners, source_refs = acceptance._catalog(characters)
        draft = json.loads(
            (
                REPO_ROOT
                / "scratch/audio-speaker-attribution-drafts/apology.draft.json"
            ).read_text(encoding="utf-8")
        )
        raw_path = REPO_ROOT / "raw/plato/english/apology.txt"
        raw_text = raw_path.read_text(encoding="utf-8")

        plan, resolutions = acceptance.build_dialogue_plan(
            draft,
            raw_path=raw_path,
            source_refs=source_refs["apology"],
            owners=owners["apology"],
            reviewed_at="2026-07-15",
        )

        expected_meletus_ranges = [
            (19427, 19441),
            (19964, 19982),
            (20106, 20147),
            (20256, 20275),
            (20313, 20326),
            (20470, 20490),
            (20519, 20546),
            (20673, 20692),
            (20816, 20861),
            (21999, 22018),
            (22211, 22234),
            (22366, 22393),
            (23912, 23955),
            (24543, 24611),
            (24750, 24837),
            (25390, 25440),
            (27021, 27043),
            (27574, 27593),
        ]
        self.assertEqual(
            [
                (segment["start_char"], segment["end_char"])
                for segment in plan["segments"]
                if segment["character_id"] == "meletus"
            ],
            expected_meletus_ranges,
        )
        self.assertEqual(
            resolutions,
            {
                "apology-live-meletus-reply": 574,
                "apology-unwrapped-defence-to-socrates": 62273,
                "source-title-to-commentary-narrator": 7,
            },
        )
        self.assertEqual(len(plan["segments"]), 162)
        self.assertEqual(plan["segments"][0]["start_char"], 0)
        self.assertEqual(plan["segments"][-1]["end_char"], utf16(raw_text))

        for start, end in ((25788, 25929), (26010, 26106)):
            matching = [
                segment
                for segment in plan["segments"]
                if segment["start_char"] <= start and segment["end_char"] >= end
            ]
            self.assertEqual(len(matching), 1)
            self.assertEqual(matching[0]["character_id"], "socrates")

        with self.assertRaisesRegex(TurnAlignmentError, "stale"):
            acceptance._apology_meletus_rows(
                draft["segments"], raw_text=raw_text + " ", owners=owners["apology"]
            )


if __name__ == "__main__":
    unittest.main()
