from __future__ import annotations

import json
import re
import sys
import tempfile
import unittest
from collections import Counter
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from align_canonical_turn_references import (  # noqa: E402
    TurnAlignmentError,
    canonical_json,
    sha256_bytes,
    sha256_file,
)
from build_speaker_attribution_review import (  # noqa: E402
    CSS_ASSET,
    JS_ASSET,
    LANES,
    REVIEW_SCHEMA,
    REVIEW_SCHEMA_SHA256,
    SCAFFOLD_GENERATOR,
    TRIAGE_GENERATOR,
    _expected_export_input_hashes,
    build_review_units,
    build_corpus_review_models,
    render_dialogue_page,
    sign_review_export,
    validate_review_export,
    write_review_ui,
)


def _utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


class ReviewFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.scratch = root / "scratch"
        self.triage_root = self.scratch / "triage"
        self.scaffold_root = self.scratch / "scaffolds"
        self.raw_root = root / "raw"
        self.characters_path = root / "audio" / "characters.json"
        for path in (
            self.triage_root,
            self.scaffold_root,
            self.raw_root,
            self.characters_path.parent,
        ):
            path.mkdir(parents=True, exist_ok=True)

        self.dialogue = "fixture"
        self.specs = [
            {
                "text": "Ceph. said ",
                "lane": "physical-label-confirmation",
                "reason": "contains_nested_said",
                "dom_path": "/TEI[1]/text[1]/said[1]",
                "origin": "element-text",
                "said": 1,
                "quote_path": None,
                "quote_depth": 0,
                "relation": "direct-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": "he",
                "lane": "physical-label-confirmation",
                "reason": "contains_nested_said",
                "dom_path": "/TEI[1]/text[1]/said[1]",
                "origin": "element-tail",
                "said": 1,
                "quote_path": None,
                "quote_depth": 0,
                "relation": "direct-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": " {q} ",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "origin": "open-marker",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": "</script><img src=x onerror=alert(1)>\u2028dream voice",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "origin": "element-text",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": ".",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "origin": "element-text",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": True,
                "neutral_reason": "punctuation",
            },
            {
                "text": " {/q} ",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "origin": "close-marker",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[1]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": "{43a}",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/milestone[1]",
                "origin": "milestone-marker",
                "said": None,
                "quote_path": None,
                "quote_depth": 0,
                "relation": "outside-said",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": " {q} ",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "origin": "open-marker",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": "The Laws answer Socrates",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "origin": "element-text",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
            {
                "text": " {/q} ",
                "lane": "embedded-dialogue",
                "reason": "quoted_or_embedded_markup",
                "dom_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "origin": "close-marker",
                "said": 2,
                "quote_path": "/TEI[1]/text[1]/said[2]/q[2]",
                "quote_depth": 1,
                "relation": "descendant-text",
                "neutral": False,
                "neutral_reason": None,
            },
        ]
        self.texts = [spec["text"] for spec in self.specs]
        self.raw_text = "".join(self.texts)
        (self.raw_root / "fixture.txt").write_text(self.raw_text, encoding="utf-8")
        self.english_sha = sha256_bytes(self.raw_text.encode("utf-8"))

        characters = {
            "schemaVersion": 3,
            "status": "partial",
            "characters": [
                {
                    "characterId": "alpha",
                    "displayName": "Alpha </script><img>",
                    "identityStatus": "resolved",
                    "aliases": ["Alpha"],
                    "appearances": [
                        {
                            "dialogue": "fixture",
                            "editorialStatus": "required",
                            "performanceRole": "voice-owner",
                            "roleFlags": ["source-speaker"],
                            "sourceLabels": ["Alpha"],
                            "sourceAliases": ["Alpha"],
                            "sourceAttributions": ["#Alpha"],
                        }
                    ],
                },
                {
                    "characterId": "beta",
                    "displayName": "Beta",
                    "identityStatus": "resolved",
                    "aliases": ["Beta"],
                    "appearances": [
                        {
                            "dialogue": "fixture",
                            "editorialStatus": "required",
                            "performanceRole": "reported-only",
                            "roleFlags": ["reported-speaker"],
                            "sourceLabels": [],
                            "sourceAliases": [],
                            "sourceAttributions": [],
                            "editorialNote": "Embedded voice.",
                        }
                    ],
                },
                {
                    "characterId": "gamma",
                    "displayName": "Gamma",
                    "identityStatus": "resolved",
                    "aliases": ["Gamma"],
                    "appearances": [
                        {
                            "dialogue": "fixture",
                            "editorialStatus": "required",
                            "performanceRole": "review-required",
                            "roleFlags": ["reported-speaker"],
                            "sourceLabels": [],
                            "sourceAliases": [],
                            "sourceAttributions": [],
                            "editorialNote": "Performance ownership unresolved.",
                        }
                    ],
                },
                {
                    "characterId": "commentary-narrator",
                    "displayName": "Commentary Narrator",
                    "identityStatus": "resolved",
                    "aliases": ["Commentator"],
                    "appearances": [
                        {
                            "dialogue": "fixture",
                            "editorialStatus": "required",
                            "performanceRole": "voice-owner",
                            "roleFlags": ["commentary-narrator"],
                            "sourceLabels": [],
                            "sourceAliases": [],
                            "sourceAttributions": [],
                            "editorialNote": "Not a source role.",
                        }
                    ],
                },
            ],
        }
        self.characters_path.write_text(json.dumps(characters), encoding="utf-8")
        self.characters_sha = sha256_file(self.characters_path)

        self.source_atoms: list[dict[str, object]] = []
        scaffold_segments: list[dict[str, object]] = []
        offset = 0
        for ordinal, spec in enumerate(self.specs, start=1):
            text = spec["text"]
            lane = spec["lane"]
            reason = spec["reason"]
            units = _utf16_length(text)
            atom_id = f"scaffold-{ordinal:06d}"
            evidence = {
                "dom_node_path": spec["dom_path"],
                "contributing_dom_node_paths": [],
                "dom_text_origin": spec["origin"],
                "nearest_said_ordinal": spec["said"],
                "parent_said_ordinal": None,
                "quote_node_path": spec["quote_path"],
                "quote_depth": spec["quote_depth"],
                "said_text_relation": spec["relation"],
                "raw_who": "#Alpha" if spec["said"] is not None else None,
            }
            text_sha = sha256_bytes(text.encode("utf-8"))
            atom = {
                "source_atom_id": atom_id,
                "start_char": offset,
                "end_char": offset + units,
                "utf16_code_units": units,
                "code_points": len(text),
                "utf8_bytes": len(text.encode("utf-8")),
                "text_sha256": text_sha,
                "unresolved_reason": reason,
                "neutral_glue": spec["neutral"],
                "neutral_glue_reason": spec["neutral_reason"],
                "lane": lane,
                "source_evidence": evidence,
            }
            self.source_atoms.append(atom)
            scaffold_segments.append(
                {
                    "id": atom_id,
                    "start_char": offset,
                    "end_char": offset + units,
                    "status": "unresolved",
                    "unresolved_reason": reason,
                    "text_sha256": text_sha,
                    "utf16_code_units": units,
                    "code_points": len(text),
                    "utf8_bytes": len(text.encode("utf-8")),
                    "preview": text[:120],
                    "source_evidence": evidence,
                }
            )
            offset += units

        scaffold: dict[str, object] = {
            "schema_version": 2,
            "artifact_kind": "speaker-attribution-scaffold",
            "editorial_status": "human-review-required",
            "accepted": False,
            "counts_as_production_attribution": False,
            "dialogue": "fixture",
            "source": {
                "english_sha256": self.english_sha,
                "english_utf16_code_units": _utf16_length(self.raw_text),
            },
            "input_hashes": {
                "characters_sha256": self.characters_sha,
                "generator_sha256": sha256_file(SCAFFOLD_GENERATOR),
            },
            "segments": scaffold_segments,
        }
        scaffold["scaffold_sha256"] = sha256_bytes(canonical_json(scaffold))
        self.scaffold_path = self.scaffold_root / "fixture.scaffold.json"
        self.scaffold_path.write_text(json.dumps(scaffold), encoding="utf-8")
        scaffold_file_sha = sha256_file(self.scaffold_path)

        packets: list[dict[str, object]] = []
        for ordinal, (atom, text) in enumerate(
            zip(self.source_atoms, self.texts), start=1
        ):
            fragment = {
                "source_atom_id": atom["source_atom_id"],
                "fragment_ordinal": 1,
                "fragment_count": 1,
                "start_char": atom["start_char"],
                "end_char": atom["end_char"],
                "utf16_code_units": atom["utf16_code_units"],
                "text_sha256": atom["text_sha256"],
                "text": text,
            }
            packet: dict[str, object] = {
                "packet_id": f"fixture-{atom['lane']}-{ordinal:04d}",
                "lane": atom["lane"],
                "editorial_status": "human-review-required",
                "accepted": False,
                "fragment_count": 1,
                "utf16_code_units": atom["utf16_code_units"],
                "bounding_start_char": atom["start_char"],
                "bounding_end_char": atom["end_char"],
                "fragments": [fragment],
            }
            packet["packet_sha256"] = sha256_bytes(canonical_json(packet))
            packets.append(packet)
        self.packets = packets

        lane_counts = Counter(atom["lane"] for atom in self.source_atoms)
        lane_units = Counter()
        for atom in self.source_atoms:
            lane_units[atom["lane"]] += atom["utf16_code_units"]
        triage: dict[str, object] = {
            "schema_version": 1,
            "artifact_kind": "speaker-attribution-triage",
            "editorial_status": "human-review-required",
            "accepted": False,
            "counts_as_production_attribution": False,
            "dialogue": "fixture",
            "source": {
                "english_sha256": self.english_sha,
                "english_utf16_code_units": _utf16_length(self.raw_text),
            },
            "input_hashes": {
                "scaffold_sha256": scaffold["scaffold_sha256"],
                "scaffold_file_sha256": scaffold_file_sha,
                "generator_sha256": sha256_file(TRIAGE_GENERATOR),
            },
            "summary": {
                "unresolved_source_atom_count": len(self.source_atoms),
                "unresolved_utf16_code_units": _utf16_length(self.raw_text),
                "neutral_glue_atom_count": sum(
                    atom["neutral_glue"] is True for atom in self.source_atoms
                ),
                "packet_count": len(packets),
                "lane_source_atom_counts": {lane: lane_counts[lane] for lane in LANES},
                "lane_utf16_code_unit_counts": {
                    lane: lane_units[lane] for lane in LANES
                },
            },
            "source_atoms": self.source_atoms,
            "packets": packets,
        }
        triage["triage_sha256"] = sha256_bytes(canonical_json(triage))
        self.triage_path = self.triage_root / "fixture.triage.json"
        self.triage_path.write_text(json.dumps(triage), encoding="utf-8")

        corpus: dict[str, object] = {
            "schema_version": 1,
            "artifact_kind": "speaker-attribution-triage-corpus",
            "editorial_status": "human-review-required",
            "accepted": False,
            "counts_as_production_attribution": False,
            "policy": {},
            "input_hashes": {"generator_sha256": sha256_file(TRIAGE_GENERATOR)},
            "summary": {"dialogue_count": 1},
            "dialogues": [
                {
                    "dialogue": "fixture",
                    "triage_sha256": triage["triage_sha256"],
                }
            ],
        }
        corpus["corpus_triage_sha256"] = sha256_bytes(canonical_json(corpus))
        self.corpus_path = self.triage_root / "corpus-triage.json"
        self.corpus_path.write_text(json.dumps(corpus), encoding="utf-8")

    def build(self) -> tuple[list[dict[str, object]], dict[str, object]]:
        return build_corpus_review_models(
            triage_root=self.triage_root,
            scaffold_root=self.scaffold_root,
            raw_root=self.raw_root,
            characters_path=self.characters_path,
        )


def _complete_export(model: dict[str, object]) -> dict[str, object]:
    unit_by_atom = {
        atom_id: unit
        for unit in model["review_units"]
        for atom_id in unit["source_atom_ids"]
    }
    human_units = [unit for unit in model["review_units"] if unit["decision_required"]]
    lane_counts = Counter(unit["lane"] for unit in human_units)
    bulk_units: set[str] = set()
    decisions: list[dict[str, object]] = []
    for atom in sorted(
        model["source_atoms"], key=lambda row: (row["start_char"], row["end_char"])
    ):
        unit = unit_by_atom[atom["source_atom_id"]]
        automatic = atom["review_classification"]["automatic_nonspoken"]
        if automatic:
            kind = "nonspoken-glue"
            decision_source = "deterministic-structural-policy"
            character_id = None
            bulk = False
        elif unit["lane"] == "physical-label-confirmation":
            kind = "outer-performer"
            decision_source = "explicit-human-review"
            character_id = "alpha"
            bulk = unit["lexical_atom_count"] > 1
        else:
            kind = "literary-quotation"
            decision_source = "explicit-human-review"
            character_id = "alpha"
            bulk = False
        decision = {
            "source_atom_id": atom["source_atom_id"],
            "review_unit_id": unit["review_unit_id"],
            "start_char": atom["start_char"],
            "end_char": atom["end_char"],
            "text_sha256": atom["text_sha256"],
            "lane": atom["lane"],
            "decision_kind": kind,
            "decision_source": decision_source,
            "bulk_confirmation": bulk,
        }
        if character_id is not None:
            decision["character_id"] = character_id
        decisions.append(decision)
        if bulk:
            bulk_units.add(unit["review_unit_id"])
    unsigned = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-review",
        "editorial_status": "provisional-human-review",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": model["dialogue"],
        "input_hashes": _expected_export_input_hashes(model),
        "review_policy": {
            "decision_source": "explicit-human-review",
            "automatic_nonspoken_source": "deterministic-structural-policy",
            "inherited_owner_inference": False,
            "production_write_allowed": False,
            "bulk_confirmation_lane": "physical-label-confirmation",
            "bulk_confirmation_kind": "outer-performer",
        },
        "summary": {
            "expanded_atom_decision_count": len(decisions),
            "human_review_unit_count": len(human_units),
            "deterministic_nonspoken_atom_count": sum(
                atom["review_classification"]["automatic_nonspoken"]
                for atom in model["source_atoms"]
            ),
            "bulk_confirmation_unit_count": len(bulk_units),
            "lane_human_review_unit_counts": {
                lane: lane_counts[lane] for lane in LANES
            },
        },
        "decisions": decisions,
    }
    return sign_review_export(unsigned)


def _resign(payload: dict[str, object]) -> dict[str, object]:
    unsigned = json.loads(json.dumps(payload))
    unsigned.pop("review_sha256", None)
    return sign_review_export(unsigned)


def _first_decision(
    payload: dict[str, object],
    model: dict[str, object],
    *,
    automatic: bool,
    lane: str | None = None,
) -> dict[str, object]:
    atoms = {atom["source_atom_id"]: atom for atom in model["source_atoms"]}
    return next(
        decision
        for decision in payload["decisions"]
        if atoms[decision["source_atom_id"]]["review_classification"][
            "automatic_nonspoken"
        ]
        is automatic
        and (lane is None or decision["lane"] == lane)
    )


class SpeakerAttributionReviewTest(unittest.TestCase):
    def test_page_escapes_source_and_roster_html_and_uses_text_content(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            model = ReviewFixture(Path(temporary)).build()[0][0]
            page = render_dialogue_page(model)

        data_match = re.search(
            r'<script id="review-data" type="application/json">(.*?)</script>',
            page,
            flags=re.DOTALL,
        )
        self.assertIsNotNone(data_match)
        embedded = data_match.group(1)
        self.assertNotIn("</script>", embedded.casefold())
        self.assertNotIn("<img", embedded.casefold())
        self.assertNotIn("\u2028", embedded)
        parsed = json.loads(embedded)
        self.assertIn("</script><img", parsed["source_text"])
        self.assertEqual(parsed["page_data_sha256"], model["page_data_sha256"])
        self.assertEqual(
            [row["character_id"] for row in parsed["roster"]],
            ["alpha"],
        )
        self.assertTrue(
            all(row["performance_role"] == "voice-owner" for row in parsed["roster"])
        )
        self.assertEqual(
            {
                row["character_id"]: row["performance_role"]
                for row in parsed["nonselectable_evidence"]
            },
            {"beta": "reported-only", "gamma": "review-required"},
        )
        javascript = JS_ASSET.read_text(encoding="utf-8")
        js_sha = sha256_file(JS_ASSET)
        css_sha = sha256_file(CSS_ASSET)
        self.assertNotIn("innerHTML", javascript)
        self.assertIn("textContent", javascript)
        self.assertIn("const PAGE_SIZE = 100", javascript)
        self.assertIn('laneFilter.value = "human"', javascript)
        self.assertIn('row.performance_role !== "voice-owner"', javascript)
        self.assertIn("nonselectable_evidence", javascript)
        self.assertIn(f"../review.js?sha256={js_sha}", page)
        self.assertIn(f"../review.css?sha256={css_sha}", page)

    def test_catalog_v3_performance_roles_are_required(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            payload = json.loads(fixture.characters_path.read_text(encoding="utf-8"))
            payload["schemaVersion"] = 2
            fixture.characters_path.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "CharacterCatalog v3"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            payload = json.loads(fixture.characters_path.read_text(encoding="utf-8"))
            payload["characters"][0]["appearances"][0]["performanceRole"] = "actor"
            fixture.characters_path.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "invalid performance role"):
                fixture.build()

    def test_stale_source_triage_packet_and_corpus_hashes_fail_closed(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            fixture.build()
            (fixture.raw_root / "fixture.txt").write_text(
                fixture.raw_text + "tamper", encoding="utf-8"
            )
            with self.assertRaisesRegex(TurnAlignmentError, "stale triage source hash"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            payload = json.loads(fixture.triage_path.read_text(encoding="utf-8"))
            payload["packets"][0]["fragments"][0]["text"] = "tamper"
            fixture.triage_path.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "triage_sha256 signature"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            triage = json.loads(fixture.triage_path.read_text(encoding="utf-8"))
            packet = triage["packets"][0]
            packet["fragments"][0]["text"] = "tamper"
            triage["triage_sha256"] = sha256_bytes(
                canonical_json(
                    {
                        key: value
                        for key, value in triage.items()
                        if key != "triage_sha256"
                    }
                )
            )
            fixture.triage_path.write_text(json.dumps(triage), encoding="utf-8")
            corpus = json.loads(fixture.corpus_path.read_text(encoding="utf-8"))
            corpus["dialogues"][0]["triage_sha256"] = triage["triage_sha256"]
            corpus["corpus_triage_sha256"] = sha256_bytes(
                canonical_json(
                    {
                        key: value
                        for key, value in corpus.items()
                        if key != "corpus_triage_sha256"
                    }
                )
            )
            fixture.corpus_path.write_text(json.dumps(corpus), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "triage packet.*signature"):
                fixture.build()

        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            corpus = json.loads(fixture.corpus_path.read_text(encoding="utf-8"))
            corpus["dialogues"][0]["triage_sha256"] = "0" * 64
            corpus["corpus_triage_sha256"] = sha256_bytes(
                canonical_json(
                    {
                        key: value
                        for key, value in corpus.items()
                        if key != "corpus_triage_sha256"
                    }
                )
            )
            fixture.corpus_path.write_text(json.dumps(corpus), encoding="utf-8")
            with self.assertRaisesRegex(TurnAlignmentError, "stale corpus triage hash"):
                fixture.build()

    def test_export_rejects_inherited_or_forbidden_bulk_assignment(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            model = ReviewFixture(Path(temporary)).build()[0][0]
        valid = _complete_export(model)
        validate_review_export(valid, model)

        inherited = json.loads(json.dumps(valid))
        _first_decision(
            inherited,
            model,
            automatic=False,
        )["decision_source"] = "inherited-owner"
        inherited = _resign(inherited)
        with self.assertRaisesRegex(TurnAlignmentError, "automatic/inherited"):
            validate_review_export(inherited, model)

        forbidden_bulk = json.loads(json.dumps(valid))
        embedded = _first_decision(
            forbidden_bulk,
            model,
            automatic=False,
            lane="embedded-dialogue",
        )
        embedded["bulk_confirmation"] = True
        forbidden_bulk["summary"]["bulk_confirmation_unit_count"] += 1
        forbidden_bulk = _resign(forbidden_bulk)
        with self.assertRaisesRegex(TurnAlignmentError, "forbidden bulk"):
            validate_review_export(forbidden_bulk, model)

        deterministic_tamper = json.loads(json.dumps(valid))
        auto = _first_decision(
            deterministic_tamper,
            model,
            automatic=True,
        )
        auto.update(
            {
                "decision_kind": "roster-character",
                "decision_source": "explicit-human-review",
                "character_id": "alpha",
            }
        )
        deterministic_tamper = _resign(deterministic_tamper)
        with self.assertRaisesRegex(
            TurnAlignmentError, "deterministic nonspoken decision was altered"
        ):
            validate_review_export(deterministic_tamper, model)

    def test_export_requires_complete_current_schema_bound_decisions(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            model = ReviewFixture(Path(temporary)).build()[0][0]
        valid = _complete_export(model)
        self.assertEqual(
            valid["input_hashes"]["review_schema_sha256"],
            REVIEW_SCHEMA_SHA256,
        )
        self.assertEqual(
            REVIEW_SCHEMA_SHA256, sha256_bytes(canonical_json(REVIEW_SCHEMA))
        )
        validate_review_export(valid, model)

        incomplete = json.loads(json.dumps(valid))
        incomplete["decisions"].pop()
        incomplete["summary"]["expanded_atom_decision_count"] -= 1
        incomplete = _resign(incomplete)
        with self.assertRaisesRegex(TurnAlignmentError, "decisions incomplete"):
            validate_review_export(incomplete, model)

        stale = json.loads(json.dumps(valid))
        stale["input_hashes"]["triage_sha256"] = "0" * 64
        stale = _resign(stale)
        with self.assertRaisesRegex(TurnAlignmentError, "stale review export"):
            validate_review_export(stale, model)

        no_roster = json.loads(json.dumps(valid))
        _first_decision(
            no_roster,
            model,
            automatic=False,
        )["character_id"] = "not-in-roster"
        no_roster = _resign(no_roster)
        with self.assertRaisesRegex(TurnAlignmentError, "explicit roster choice"):
            validate_review_export(no_roster, model)

        reported_only = json.loads(json.dumps(valid))
        _first_decision(
            reported_only,
            model,
            automatic=False,
        )["character_id"] = "beta"
        reported_only = _resign(reported_only)
        with self.assertRaisesRegex(TurnAlignmentError, "explicit roster choice"):
            validate_review_export(reported_only, model)

        malformed_model = json.loads(json.dumps(model))
        malformed_model["roster"].append(malformed_model["nonselectable_evidence"][0])
        with self.assertRaisesRegex(TurnAlignmentError, "non-voice-owner"):
            validate_review_export(valid, malformed_model)

        disagreement = json.loads(json.dumps(valid))
        physical_rows = [
            decision
            for decision in disagreement["decisions"]
            if decision["lane"] == "physical-label-confirmation"
        ]
        self.assertEqual(len(physical_rows), 2)
        physical_rows[1]["decision_kind"] = "roster-character"
        physical_rows[1]["bulk_confirmation"] = False
        disagreement = _resign(disagreement)
        with self.assertRaisesRegex(
            TurnAlignmentError, "disagree within a review unit"
        ):
            validate_review_export(disagreement, model)

    def test_crito_style_dream_and_laws_quotes_form_distinct_human_units(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            model = fixture.build()[0][0]

        human_units = [
            unit for unit in model["review_units"] if unit["decision_required"]
        ]
        self.assertEqual(len(human_units), 3)
        physical = [
            unit
            for unit in human_units
            if unit["lane"] == "physical-label-confirmation"
        ]
        quotations = [
            unit for unit in human_units if unit["lane"] == "embedded-dialogue"
        ]
        self.assertEqual(len(physical), 1)
        self.assertEqual(physical[0]["lexical_atom_count"], 2)
        self.assertEqual(len(quotations), 2)
        self.assertEqual(
            [unit["semantic_container"]["container_id"] for unit in quotations],
            [
                "/TEI[1]/text[1]/said[2]/q[1]",
                "/TEI[1]/text[1]/said[2]/q[2]",
            ],
        )
        self.assertEqual(
            model["summary"]["deterministic_nonspoken_atom_count"],
            6,
        )
        self.assertLess(
            model["summary"]["human_review_unit_count"],
            model["summary"]["unresolved_source_atom_count"],
        )
        represented = [
            atom_id
            for unit in model["review_units"]
            for atom_id in unit["source_atom_ids"]
        ]
        self.assertEqual(
            represented,
            [atom["source_atom_id"] for atom in model["source_atoms"]],
        )

    def test_expanded_export_partitions_every_raw_atom_exactly(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            model = ReviewFixture(Path(temporary)).build()[0][0]
        payload = _complete_export(model)
        validate_review_export(payload, model)

        atoms = sorted(
            model["source_atoms"],
            key=lambda row: (row["start_char"], row["end_char"]),
        )
        self.assertEqual(
            [
                (
                    decision["source_atom_id"],
                    decision["start_char"],
                    decision["end_char"],
                    decision["text_sha256"],
                )
                for decision in payload["decisions"]
            ],
            [
                (
                    atom["source_atom_id"],
                    atom["start_char"],
                    atom["end_char"],
                    atom["text_sha256"],
                )
                for atom in atoms
            ],
        )
        automatic_ids = {
            atom["source_atom_id"]
            for atom in atoms
            if atom["review_classification"]["automatic_nonspoken"]
        }
        automatic_rows = [
            decision
            for decision in payload["decisions"]
            if decision["source_atom_id"] in automatic_ids
        ]
        self.assertTrue(automatic_rows)
        self.assertTrue(
            all(
                decision["decision_kind"] == "nonspoken-glue"
                and decision["decision_source"] == "deterministic-structural-policy"
                and decision["bulk_confirmation"] is False
                and "character_id" not in decision
                for decision in automatic_rows
            )
        )

    def test_unbalanced_quote_markers_fail_closed_to_human_review(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            atoms = json.loads(json.dumps(fixture.source_atoms))
            close = atoms[5]
            close["source_evidence"]["dom_node_path"] = "/TEI[1]/text[1]/said[2]/q[99]"
            units = build_review_units(
                atoms,
                fixture.packets,
                fixture.raw_text,
                dialogue=fixture.dialogue,
            )

        atom_by_id = {atom["source_atom_id"]: atom for atom in atoms}
        for index in (2, 5):
            self.assertFalse(
                atom_by_id[f"scaffold-{index + 1:06d}"]["review_classification"][
                    "automatic_nonspoken"
                ]
            )
        unit_by_atom = {
            atom_id: unit for unit in units for atom_id in unit["source_atom_ids"]
        }
        self.assertTrue(unit_by_atom["scaffold-000003"]["decision_required"])
        self.assertTrue(unit_by_atom["scaffold-000006"]["decision_required"])

    def test_writer_is_scratch_only_and_materializes_schema_and_pages(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            fixture = ReviewFixture(Path(temporary))
            models, index = fixture.build()
            output = fixture.scratch / "review"
            write_review_ui(
                models,
                index,
                output_root=output,
                artifact_root=fixture.scratch,
            )
            self.assertTrue((output / "index.html").is_file())
            self.assertTrue((output / "dialogues" / "fixture.html").is_file())
            self.assertEqual(
                json.loads((output / "review-schema.json").read_text(encoding="utf-8")),
                REVIEW_SCHEMA,
            )
            self.assertEqual(sha256_file(output / "review.js"), sha256_file(JS_ASSET))
            self.assertEqual(sha256_file(output / "review.css"), sha256_file(CSS_ASSET))
            index_page = (output / "index.html").read_text(encoding="utf-8")
            dialogue_page = (output / "dialogues" / "fixture.html").read_text(
                encoding="utf-8"
            )
            js_sha = sha256_file(JS_ASSET)
            css_sha = sha256_file(CSS_ASSET)
            self.assertIn(f"review.css?sha256={css_sha}", index_page)
            self.assertIn(f"../review.css?sha256={css_sha}", dialogue_page)
            self.assertIn(f"../review.js?sha256={js_sha}", dialogue_page)

            stale_index = json.loads(json.dumps(index))
            stale_index["input_hashes"]["review_js_sha256"] = "0" * 64
            stale_output = fixture.scratch / "stale-review"
            with self.assertRaisesRegex(
                TurnAlignmentError, "asset hashes changed before write"
            ):
                write_review_ui(
                    models,
                    stale_index,
                    output_root=stale_output,
                    artifact_root=fixture.scratch,
                )
            self.assertFalse(stale_output.exists())

            production = fixture.root / "audio" / "speaker-attributions"
            with self.assertRaisesRegex(TurnAlignmentError, "must stay under"):
                write_review_ui(
                    models,
                    index,
                    output_root=production,
                    artifact_root=fixture.scratch,
                )
            self.assertFalse(production.exists())
            with self.assertRaisesRegex(
                TurnAlignmentError, "must itself be a scratch directory"
            ):
                write_review_ui(
                    models,
                    index,
                    output_root=production,
                    artifact_root=fixture.root,
                )


if __name__ == "__main__":
    unittest.main()
