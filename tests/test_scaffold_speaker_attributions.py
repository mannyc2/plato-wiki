from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from align_canonical_turn_references import (  # noqa: E402
    IMPORTER_PATH,
    TurnAlignmentError,
    _load_importer,
)
from scaffold_speaker_attributions import (  # noqa: E402
    PROTOTYPE_SCRIPTS,
    build_corpus_scaffolds,
    canonical_json,
    sha256_bytes,
    write_scaffolds,
)


def _character(character_id: str, raw_who: str) -> dict[str, object]:
    display_name = character_id.title()
    return {
        "characterId": character_id,
        "displayName": display_name,
        "identityStatus": "resolved",
        "aliases": [display_name],
        "appearances": [
            {
                "dialogue": "fixture",
                "editorialStatus": "required",
                "performanceRole": "voice-owner",
                "roleFlags": ["source-speaker"],
                "sourceLabels": [display_name],
                "sourceAliases": [display_name],
                "sourceAttributions": [raw_who],
            }
        ],
    }


class ScaffoldFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.audio = root / "audio"
        self.raw_root = root / "raw"
        self.tei_cache = root / "scratch" / "tei-cache"
        self.output_root = root / "scratch" / "scaffolds"
        for directory in (self.audio, self.raw_root, self.tei_cache):
            directory.mkdir(parents=True, exist_ok=True)

        self.xml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<TEI xmlns="http://www.tei-c.org/ns/1.0"><text><body>'
            '<div type="translation">'
            '<p>Unattributed preface.</p>'
            '<p><said who="#Alpha"><label>Alpha.</label> Plain assigned text.</said></p>'
            '<p><said who="#Alpha"><label>Alpha.</label> Frame '
            '<q>quoted speech</q> close.</said></p>'
            '<p><said who="#Alpha">Outer lead '
            '<said who="#Beta">deep leaf</said> outer close</said></p>'
            '<p><said who="#Alpha #Beta">Together.</said></p>'
            '<p><said who="#Ghost">Ghost.</said></p>'
            '<p><said>Unknown.</said></p>'
            "</div></body></text></TEI>"
        ).encode("utf-8")
        self.tei_sha = hashlib.sha256(self.xml).hexdigest()
        self.census = self.audio / "english-tei-speaker-census.json"
        self.characters = self.audio / "characters.json"
        self.census.write_text(
            json.dumps(
                {
                    "schema_version": 1,
                    "artifact_kind": "english-tei-raw-speaker-census",
                    "source": {
                        "repository": "https://example.invalid/source",
                        "commit": "a" * 40,
                        "edition_id": "perseus-eng2",
                    },
                    "dialogues": [
                        {
                            "dialogue": "fixture",
                            "source": {
                                "edition_id": "perseus-eng2",
                                "url": "https://example.invalid/fixture.xml",
                                "tei_sha256": self.tei_sha,
                            },
                        }
                    ],
                }
            ),
            encoding="utf-8",
        )
        self.characters.write_text(
            json.dumps(
                {
                    "schemaVersion": 3,
                    "status": "partial",
                    "characters": [
                        _character("alpha", "#Alpha"),
                        _character("beta", "#Beta"),
                    ],
                }
            ),
            encoding="utf-8",
        )
        (self.tei_cache / f"fixture.{self.tei_sha}.xml").write_bytes(self.xml)
        importer = _load_importer(IMPORTER_PATH)
        self.rendered = importer.apply_english_repairs(
            "fixture", importer.convert_xml(self.xml)
        )
        (self.raw_root / "fixture.txt").write_text(
            self.rendered, encoding="utf-8"
        )

    def build(self) -> tuple[list[dict[str, object]], dict[str, object]]:
        return build_corpus_scaffolds(
            census_path=self.census,
            characters_path=self.characters,
            raw_root=self.raw_root,
            tei_cache=self.tei_cache,
            artifact_root=self.root / "scratch",
        )


class SpeakerAttributionScaffoldTest(unittest.TestCase):
    def test_exact_gapless_deterministic_partition_is_never_accepted(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ScaffoldFixture(Path(temporary))
            first_scaffolds, first_diagnostics = fixture.build()
            second_scaffolds, second_diagnostics = fixture.build()

        self.assertEqual(first_scaffolds, second_scaffolds)
        self.assertEqual(first_diagnostics, second_diagnostics)
        scaffold = first_scaffolds[0]
        self.assertFalse(scaffold["accepted"])
        self.assertFalse(scaffold["counts_as_production_attribution"])
        self.assertEqual(scaffold["editorial_status"], "human-review-required")
        self.assertEqual(
            scaffold["source"]["english_sha256"],
            hashlib.sha256(fixture.rendered.encode("utf-8")).hexdigest(),
        )
        self.assertEqual(scaffold["segments"][0]["start_char"], 0)
        for left, right in zip(scaffold["segments"], scaffold["segments"][1:]):
            self.assertEqual(left["end_char"], right["start_char"])
        self.assertEqual(
            scaffold["segments"][-1]["end_char"], len(fixture.rendered)
        )
        unsigned = {
            key: value
            for key, value in scaffold.items()
            if key != "scaffold_sha256"
        }
        self.assertEqual(
            scaffold["scaffold_sha256"], sha256_bytes(canonical_json(unsigned))
        )

    def test_only_unique_leaf_owners_assign_and_every_other_case_is_named(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            scaffold = ScaffoldFixture(Path(temporary)).build()[0][0]

        assigned = {
            row.get("character_id")
            for row in scaffold["segments"]
            if row["status"] == "assigned"
        }
        reasons = {
            row.get("unresolved_reason")
            for row in scaffold["segments"]
            if row["status"] == "unresolved"
        }
        self.assertEqual(assigned, {"alpha", "beta"})
        self.assertTrue(
            {
                "narrator_or_unattributed",
                "quoted_or_embedded_markup",
                "contains_nested_said",
                "multiple_source_attributions",
                "catalog_missing_attribution",
                "missing_source_attribution",
            }.issubset(reasons)
        )
        beta_rows = [
            row
            for row in scaffold["segments"]
            if row.get("character_id") == "beta"
        ]
        self.assertEqual(len(beta_rows), 1)
        self.assertEqual(beta_rows[0]["source_evidence"]["raw_who"], "#Beta")
        self.assertEqual(
            scaffold["catalog_gap_diagnostics"]["missing_source_attributions"],
            ["#Ghost"],
        )

    def test_dom_provenance_prevents_inherited_owner_shortcuts(self) -> None:
        """Crito/Phaedo/Republic-style quotes and Parmenides nesting stay explicit."""

        with tempfile.TemporaryDirectory() as temporary:
            scaffold = ScaffoldFixture(Path(temporary)).build()[0][0]

        self.assertEqual(scaffold["schema_version"], 2)
        quoted = [
            row
            for row in scaffold["segments"]
            if row.get("unresolved_reason") == "quoted_or_embedded_markup"
            and "quoted speech" in row["preview"]
        ]
        self.assertEqual(len(quoted), 1)
        quote_evidence = quoted[0]["source_evidence"]
        self.assertEqual(quote_evidence["nearest_said_ordinal"], 2)
        self.assertIsNone(quote_evidence["parent_said_ordinal"])
        self.assertEqual(quote_evidence["quote_depth"], 1)
        self.assertTrue(quote_evidence["quote_node_path"].endswith("/q[1]"))
        self.assertEqual(
            quote_evidence["said_text_relation"], "descendant-text"
        )
        self.assertEqual(quote_evidence["raw_who"], "#Alpha")

        beta = next(
            row for row in scaffold["segments"] if row.get("character_id") == "beta"
        )
        beta_evidence = beta["source_evidence"]
        self.assertEqual(beta_evidence["nearest_said_ordinal"], 4)
        self.assertEqual(beta_evidence["parent_said_ordinal"], 3)
        self.assertEqual(beta_evidence["said_text_relation"], "direct-text")
        self.assertTrue(beta_evidence["dom_node_path"].endswith("/said[1]"))

        outer_tail = next(
            row
            for row in scaffold["segments"]
            if row.get("unresolved_reason") == "contains_nested_said"
            and "outer close" in row["preview"]
        )
        outer_evidence = outer_tail["source_evidence"]
        self.assertEqual(outer_evidence["nearest_said_ordinal"], 3)
        self.assertIsNone(outer_evidence["parent_said_ordinal"])
        self.assertEqual(outer_evidence["said_text_relation"], "direct-text")
        self.assertTrue(
            outer_evidence["dom_text_origin"].startswith("child-tail-after:")
        )

    def test_changed_canonical_rendering_is_fatal(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ScaffoldFixture(Path(temporary))
            (fixture.raw_root / "fixture.txt").write_text(
                fixture.rendered + "changed", encoding="utf-8"
            )
            with self.assertRaisesRegex(
                TurnAlignmentError, "does not reproduce raw/plato/english bytes"
            ):
                fixture.build()

    def test_prototype_roles_are_reported_but_never_promoted(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ScaffoldFixture(Path(temporary))
            prototype = fixture.root / "scratch" / "prototype.json"
            prototype.write_text(
                json.dumps(
                    [
                        {"speaker": "Alpha", "text": "known"},
                        {"speaker": "Commentator", "text": "commentary"},
                        {"speaker": "Dream Woman", "text": "quoted"},
                    ]
                ),
                encoding="utf-8",
            )
            before = fixture.characters.read_bytes()
            with patch.dict(PROTOTYPE_SCRIPTS, {"fixture": prototype}, clear=True):
                scaffold = fixture.build()[0][0]
            after = fixture.characters.read_bytes()

        self.assertEqual(before, after)
        gaps = scaffold["catalog_gap_diagnostics"]["catalog_missing_roles"]
        self.assertEqual(
            [row["role_key"] for row in gaps],
            ["commentary-narrator", "dream-woman"],
        )
        self.assertTrue(all(row["catalog_character_ids"] == [] for row in gaps))

    def test_cataloged_prototype_roles_are_resolved_without_source_assignment(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ScaffoldFixture(Path(temporary))
            payload = json.loads(fixture.characters.read_text(encoding="utf-8"))
            payload["characters"].extend(
                [
                    {
                        "characterId": "commentary-narrator",
                        "displayName": "Commentary Narrator",
                        "identityStatus": "resolved",
                        "aliases": [
                            "Announcer",
                            "Commentary Narrator",
                            "Commentator",
                        ],
                        "appearances": [
                            {
                                "dialogue": "fixture",
                                "editorialStatus": "required",
                                "performanceRole": "voice-owner",
                                "roleFlags": ["commentary-narrator"],
                                "sourceLabels": [],
                                "sourceAliases": [],
                                "sourceAttributions": [],
                                "editorialNote": "Recurring edition role.",
                            }
                        ],
                    },
                    {
                        "characterId": "dream-woman",
                        "displayName": "Dream Woman",
                        "identityStatus": "resolved",
                        "aliases": ["Dream Woman"],
                        "appearances": [
                            {
                                "dialogue": "fixture",
                                "editorialStatus": "required",
                                "performanceRole": "reported-only",
                                "roleFlags": [
                                    "dream-figure",
                                    "reported-speaker",
                                ],
                                "sourceLabels": [],
                                "sourceAliases": [],
                                "sourceAttributions": [],
                                "editorialNote": "Embedded dream quotation.",
                            }
                        ],
                    },
                ]
            )
            fixture.characters.write_text(
                json.dumps(payload), encoding="utf-8"
            )
            prototype = fixture.root / "scratch" / "prototype.json"
            prototype.write_text(
                json.dumps(
                    [
                        {"speaker": "Commentator", "text": "commentary"},
                        {"speaker": "Dream Woman", "text": "quoted"},
                    ]
                ),
                encoding="utf-8",
            )
            with patch.dict(
                PROTOTYPE_SCRIPTS, {"fixture": prototype}, clear=True
            ):
                scaffold = fixture.build()[0][0]

        diagnostics = {
            row["role_key"]: row
            for row in scaffold["catalog_gap_diagnostics"]["production_roles"]
        }
        self.assertEqual(
            scaffold["catalog_gap_diagnostics"]["catalog_missing_roles"], []
        )
        self.assertEqual(
            diagnostics["commentary-narrator"]["catalog_character_ids"],
            ["commentary-narrator"],
        )
        self.assertEqual(
            diagnostics["dream-woman"]["catalog_character_ids"],
            ["dream-woman"],
        )
        assigned = {
            row.get("character_id")
            for row in scaffold["segments"]
            if row["status"] == "assigned"
        }
        self.assertNotIn("commentary-narrator", assigned)
        self.assertNotIn("dream-woman", assigned)

    def test_writes_are_confined_to_scratch(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ScaffoldFixture(Path(temporary))
            scaffolds, diagnostics = fixture.build()
            write_scaffolds(
                scaffolds,
                diagnostics,
                output_root=fixture.output_root,
                artifact_root=fixture.root / "scratch",
            )
            self.assertTrue(
                (fixture.output_root / "fixture.scaffold.json").is_file()
            )
            self.assertTrue(
                (fixture.output_root / "corpus-diagnostics.json").is_file()
            )
            production = fixture.root / "audio" / "speaker-attributions"
            with self.assertRaisesRegex(TurnAlignmentError, "must stay under"):
                write_scaffolds(
                    scaffolds,
                    diagnostics,
                    output_root=production,
                    artifact_root=fixture.root / "scratch",
                )
            self.assertFalse(production.exists())
            with self.assertRaisesRegex(
                TurnAlignmentError, "must itself be a scratch directory"
            ):
                write_scaffolds(
                    scaffolds,
                    diagnostics,
                    output_root=production,
                    artifact_root=fixture.root,
                )


if __name__ == "__main__":
    unittest.main()
