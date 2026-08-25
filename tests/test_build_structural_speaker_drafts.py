from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_DIR = REPO_ROOT / "scripts" / "audio"
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from align_canonical_turn_references import (  # noqa: E402
    TurnAlignmentError,
    canonical_json,
    sha256_bytes,
    sha256_file,
)
from build_structural_speaker_drafts import (  # noqa: E402
    SCAFFOLD_GENERATOR,
    build_corpus_drafts,
    write_corpus_drafts,
)


def utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


class StructuralDraftFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.audio = root / "audio"
        self.raw = root / "raw"
        self.scaffolds = root / "scratch" / "scaffolds"
        for path in (self.audio, self.raw, self.scaffolds):
            path.mkdir(parents=True, exist_ok=True)
        self.characters = {
            "schemaVersion": 3,
            "status": "complete",
            "dialogues": [{"dialogue": "fixture"}],
            "characters": [self.character("alpha"), self.character("beta")],
        }
        self.character_path = self.audio / "characters.json"
        self.character_path.write_text(json.dumps(self.characters), encoding="utf-8")
        self.character_sha = sha256_file(self.character_path)
        self.parts = [
            (
                "Alpha says ",
                "assigned",
                "alpha",
                None,
                self.evidence(nearest=1, candidates=["alpha"]),
            ),
            (
                "{q}reported words{/q}",
                "unresolved",
                None,
                "quoted_or_embedded_markup",
                self.evidence(nearest=1, candidates=["alpha"], quote_depth=1),
            ),
            (
                " outer frame ",
                "unresolved",
                None,
                "contains_nested_said",
                self.evidence(nearest=1, candidates=["alpha"]),
            ),
            (
                "Beta leaf ",
                "assigned",
                "beta",
                None,
                self.evidence(nearest=2, parent=1, candidates=["beta"]),
            ),
            (
                "ownerless nested 💡",
                "unresolved",
                None,
                "missing_source_attribution",
                self.evidence(nearest=3, parent=1, candidates=[]),
            ),
            (
                " Space-bearing exact owner.",
                "unresolved",
                None,
                "multiple_source_attributions",
                self.evidence(nearest=4, candidates=["alpha"]),
            ),
            (
                " Narration remains.",
                "unresolved",
                None,
                "narrator_or_unattributed",
                self.evidence(),
            ),
        ]
        self.text = "".join(part[0] for part in self.parts)
        (self.raw / "fixture.txt").write_text(self.text, encoding="utf-8")
        self.scaffold = self.make_scaffold()
        self.scaffold_path = self.scaffolds / "fixture.scaffold.json"
        self.scaffold_path.write_text(json.dumps(self.scaffold), encoding="utf-8")

    @staticmethod
    def character(character_id: str) -> dict:
        return {
            "characterId": character_id,
            "displayName": character_id.title(),
            "identityStatus": "resolved",
            "appearances": [
                {
                    "dialogue": "fixture",
                    "editorialStatus": "resolved",
                    "performanceRole": "voice-owner",
                    "roleFlags": ["source-speaker"],
                }
            ],
        }

    @staticmethod
    def evidence(
        *,
        nearest: int | None = None,
        parent: int | None = None,
        candidates: list[str] | None = None,
        quote_depth: int = 0,
    ) -> dict:
        value = {
            "dom_node_path": "/TEI[1]/text[1]",
            "contributing_dom_node_paths": [],
            "dom_text_origin": "element-text",
            "said_text_relation": "direct-text" if nearest else "outside-said",
            "nearest_said_ordinal": nearest,
            "parent_said_ordinal": parent,
            "quote_node_path": "/TEI[1]/text[1]/q[1]" if quote_depth else None,
            "quote_depth": quote_depth,
        }
        if candidates is not None:
            value["candidate_character_ids"] = candidates
            value["raw_who"] = f"#{candidates[0].title()}" if candidates else None
        return value

    def make_scaffold(self) -> dict:
        segments = []
        offset = 0
        for ordinal, (text, status, owner, reason, evidence) in enumerate(self.parts, 1):
            units = utf16_length(text)
            segment = {
                "id": f"scaffold-{ordinal:06d}",
                "start_char": offset,
                "end_char": offset + units,
                "status": status,
                "text_sha256": sha256_bytes(text.encode("utf-8")),
                "utf16_code_units": units,
                "source_evidence": evidence,
            }
            if owner:
                segment["character_id"] = owner
            else:
                segment["unresolved_reason"] = reason
            segments.append(segment)
            offset += units
        scaffold = {
            "schema_version": 2,
            "artifact_kind": "speaker-attribution-scaffold",
            "editorial_status": "human-review-required",
            "accepted": False,
            "counts_as_production_attribution": False,
            "dialogue": "fixture",
            "source": {
                "english_path": "raw/fixture.txt",
                "english_sha256": sha256_bytes(self.text.encode("utf-8")),
                "english_utf16_code_units": utf16_length(self.text),
            },
            "input_hashes": {
                "characters_sha256": self.character_sha,
                "generator_sha256": sha256_file(SCAFFOLD_GENERATOR),
            },
            "segments": segments,
        }
        scaffold["scaffold_sha256"] = sha256_bytes(canonical_json(scaffold))
        return scaffold

    def build(self):
        return build_corpus_drafts(
            characters_path=self.character_path,
            scaffold_root=self.scaffolds,
            raw_root=self.raw,
            repo_root=self.root,
        )

    def set_performance_role(self, character_id: str, role: str) -> None:
        character = next(
            row
            for row in self.characters["characters"]
            if row["characterId"] == character_id
        )
        character["appearances"][0]["performanceRole"] = role
        self.character_path.write_text(json.dumps(self.characters), encoding="utf-8")
        self.character_sha = sha256_file(self.character_path)
        self.scaffold["input_hashes"]["characters_sha256"] = self.character_sha
        self.write_scaffold()

    def write_scaffold(self) -> None:
        self.scaffold.pop("scaffold_sha256", None)
        self.scaffold["scaffold_sha256"] = sha256_bytes(canonical_json(self.scaffold))
        self.scaffold_path.write_text(json.dumps(self.scaffold), encoding="utf-8")


class StructuralSpeakerDraftTests(unittest.TestCase):
    def test_exact_gapless_partition_assigns_only_structurally_proven_spans(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            drafts, matrix = fixture.build()
        draft = drafts[0]
        self.assertFalse(draft["accepted"])
        self.assertFalse(draft["counts_as_production_attribution"])
        self.assertEqual(draft["editorial_status"], "mechanical-draft-human-review-required")
        self.assertEqual(
            [(row["start_char"], row["end_char"], row["text_sha256"]) for row in draft["segments"]],
            [(row["start_char"], row["end_char"], row["text_sha256"]) for row in fixture.scaffold["segments"]],
        )
        self.assertEqual(
            [row.get("character_id") for row in draft["segments"]],
            ["alpha", "alpha", "alpha", "alpha", "alpha", "alpha", None],
        )
        self.assertEqual(
            draft["segments"][-1]["unresolved_reason"], "narrator_or_unattributed"
        )
        self.assertEqual(
            draft["segments"][-2]["assignment_basis"],
            "exact-catalog-owner-for-space-bearing-source-who",
        )
        self.assertGreater(draft["summary"]["coverage_delta"], 0)
        self.assertEqual(matrix["summary"]["dialogue_count"], 1)
        self.assertEqual(matrix["dialogues"][0]["dialogue"], "fixture")

    def test_explicit_nested_speaker_is_voiced_by_the_active_enclosing_speaker(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            draft = fixture.build()[0][0]
        explicit_nested = draft["segments"][3]
        self.assertEqual(explicit_nested["character_id"], "alpha")
        self.assertEqual(
            explicit_nested["assignment_basis"],
            "reported-speech-inherits-active-source-speaker",
        )

    def test_explicit_nested_reported_only_candidate_inherits_enclosing_voice_owner(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            fixture.set_performance_role("beta", "reported-only")
            draft = fixture.build()[0][0]
        explicit_nested = draft["segments"][3]
        self.assertEqual(explicit_nested["source_evidence"]["candidate_character_ids"], ["beta"])
        self.assertEqual(explicit_nested["character_id"], "alpha")
        self.assertEqual(
            explicit_nested["assignment_basis"],
            "reported-speech-inherits-active-source-speaker",
        )

    def test_top_level_reported_only_candidate_cannot_own_source_audio(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            fixture.set_performance_role("alpha", "reported-only")
            with self.assertRaisesRegex(
                TurnAlignmentError, "top-level reported-only character 'alpha'"
            ):
                fixture.build()

    def test_nested_reported_only_candidate_requires_proven_enclosing_voice_owner(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            fixture.set_performance_role("beta", "reported-only")
            fixture.scaffold["segments"][3]["source_evidence"][
                "parent_said_ordinal"
            ] = 999
            fixture.write_scaffold()
            with self.assertRaisesRegex(
                TurnAlignmentError, "lacks a uniquely proven enclosing voice-owner"
            ):
                fixture.build()

    def test_ownerless_nested_said_inherits_through_parent_ordinal_only(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            draft = fixture.build()[0][0]
        ownerless = draft["segments"][4]
        self.assertEqual(ownerless["character_id"], "alpha")
        self.assertEqual(
            ownerless["assignment_basis"],
            "reported-speech-inherits-active-source-speaker",
        )
        self.assertEqual(ownerless["source_evidence"]["nearest_said_ordinal"], 3)
        self.assertEqual(ownerless["source_evidence"]["parent_said_ordinal"], 1)

    def test_stale_catalog_or_unresolved_source_owner_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            fixture.characters["characters"][0]["displayName"] = "Changed"
            fixture.character_path.write_text(json.dumps(fixture.characters), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "stale against"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            fixture.set_performance_role("alpha", "review-required")
            with self.assertRaisesRegex(TurnAlignmentError, "non-owning character"):
                fixture.build()

    def test_writes_remain_confined_to_scratch(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = StructuralDraftFixture(Path(temporary))
            drafts, matrix = fixture.build()
            scratch = fixture.root / "scratch"
            output = scratch / "drafts"
            write_corpus_drafts(drafts, matrix, output_root=output, artifact_root=scratch)
            self.assertTrue((output / "fixture.draft.json").is_file())
            self.assertTrue((output / "status-matrix.json").is_file())
            with self.assertRaisesRegex(TurnAlignmentError, "must stay under"):
                write_corpus_drafts(
                    drafts,
                    matrix,
                    output_root=fixture.root / "audio/speaker-attributions",
                    artifact_root=scratch,
                )


if __name__ == "__main__":
    unittest.main()
