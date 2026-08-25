from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from align_canonical_turn_references import canonical_json, sha256_bytes  # noqa: E402
from build_speaker_attribution_triage import (  # noqa: E402
    FORBIDDEN_ASSIGNMENT_KEYS,
    MAX_PACKET_FRAGMENTS,
    MAX_PACKET_UTF16_CODE_UNITS,
    TurnAlignmentError,
    build_corpus_triage,
    build_dialogue_triage,
    classify_neutral_glue,
    write_triage,
)


def _utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


def _evidence(
    *,
    path: str | None,
    relation: str,
    nearest: int | None = None,
    parent: int | None = None,
    quote_path: str | None = None,
    quote_depth: int = 0,
    raw_who: str | None = None,
) -> dict[str, object]:
    result: dict[str, object] = {
        "dom_node_path": path,
        "contributing_dom_node_paths": [],
        "dom_text_origin": "element-text",
        "nearest_said_ordinal": nearest,
        "parent_said_ordinal": parent,
        "quote_node_path": quote_path,
        "quote_depth": quote_depth,
        "said_text_relation": relation,
    }
    if raw_who is not None:
        result["raw_who"] = raw_who
    return result


def _scaffold(
    dialogue: str,
    rows: list[tuple[str, str, dict[str, object]]],
) -> tuple[str, dict[str, object]]:
    text = "".join(row[0] for row in rows)
    segments: list[dict[str, object]] = []
    offset = 0
    for ordinal, (atom_text, reason, evidence) in enumerate(rows, start=1):
        units = _utf16_length(atom_text)
        segments.append(
            {
                "id": f"scaffold-{ordinal:06d}",
                "start_char": offset,
                "end_char": offset + units,
                "status": "unresolved",
                "unresolved_reason": reason,
                "text_sha256": sha256_bytes(atom_text.encode("utf-8")),
                "utf16_code_units": units,
                "code_points": len(atom_text),
                "utf8_bytes": len(atom_text.encode("utf-8")),
                "preview": atom_text[:120],
                "source_evidence": evidence,
            }
        )
        offset += units
    payload: dict[str, object] = {
        "schema_version": 2,
        "artifact_kind": "speaker-attribution-scaffold",
        "editorial_status": "human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": dialogue,
        "source": {
            "english_sha256": sha256_bytes(text.encode("utf-8")),
            "english_utf16_code_units": _utf16_length(text),
        },
        "segments": segments,
    }
    payload["scaffold_sha256"] = sha256_bytes(canonical_json(payload))
    return text, payload


def _all_keys(value: object) -> set[str]:
    if isinstance(value, dict):
        return set(value) | {
            nested
            for child in value.values()
            for nested in _all_keys(child)
        }
    if isinstance(value, list):
        return {nested for child in value for nested in _all_keys(child)}
    return set()


class SpeakerAttributionTriageTest(unittest.TestCase):
    def test_preserves_every_atom_and_builds_all_bounded_lanes(self) -> None:
        rows = [
            (
                "Ceph. said he, ",
                "contains_nested_said",
                _evidence(
                    path="/TEI[1]/text[1]/said[1]",
                    relation="direct-text",
                    nearest=1,
                    raw_who="#Cephalos",
                ),
            ),
            (
                "Together.",
                "multiple_source_attributions",
                _evidence(
                    path="/TEI[1]/text[1]/said[2]",
                    relation="direct-text",
                    nearest=2,
                    raw_who="#Alpha #Beta",
                ),
            ),
            (
                "Actual Parmenides words.",
                "missing_source_attribution",
                _evidence(
                    path="/TEI[1]/text[1]/said[1]/said[1]",
                    relation="direct-text",
                    nearest=3,
                    parent=1,
                ),
            ),
            (
                " {q} ",
                "quoted_or_embedded_markup",
                _evidence(
                    path="/TEI[1]/text[1]/said[4]/q[1]",
                    relation="descendant-text",
                    nearest=4,
                    quote_path="/TEI[1]/text[1]/said[4]/q[1]",
                    quote_depth=1,
                    raw_who="#Socrates",
                ),
            ),
            (
                "the Laws answer Socrates",
                "quoted_or_embedded_markup",
                _evidence(
                    path="/TEI[1]/text[1]/said[4]/q[1]",
                    relation="descendant-text",
                    nearest=4,
                    quote_path="/TEI[1]/text[1]/said[4]/q[1]",
                    quote_depth=1,
                    raw_who="#Socrates",
                ),
            ),
            (
                " {/q} ",
                "quoted_or_embedded_markup",
                _evidence(
                    path="/TEI[1]/text[1]/said[4]/q[1]",
                    relation="descendant-text",
                    nearest=4,
                    quote_path="/TEI[1]/text[1]/said[4]/q[1]",
                    quote_depth=1,
                    raw_who="#Socrates",
                ),
            ),
            (
                ("Long unattributed 💡 passage. " * 300),
                "narrator_or_unattributed",
                _evidence(
                    path="/TEI[1]/text[1]/p[1]",
                    relation="outside-said",
                ),
            ),
            (
                "\n",
                "structural_separator",
                _evidence(path=None, relation="outside-said"),
            ),
        ]
        text, scaffold = _scaffold("fixture", rows)

        with tempfile.TemporaryDirectory() as temporary:
            raw_path = Path(temporary) / "fixture.txt"
            raw_path.write_text(text, encoding="utf-8")
            triage = build_dialogue_triage(
                scaffold,
                scaffold_file_sha256="f" * 64,
                raw_path=raw_path,
            )

        source_segments = scaffold["segments"]
        atoms = triage["source_atoms"]
        self.assertEqual(len(atoms), len(source_segments))
        self.assertEqual(
            [
                (atom["source_atom_id"], atom["start_char"], atom["end_char"], atom["text_sha256"])
                for atom in atoms
            ],
            [
                (segment["id"], segment["start_char"], segment["end_char"], segment["text_sha256"])
                for segment in source_segments
            ],
        )
        self.assertEqual(
            {atom["lane"] for atom in atoms},
            {
                "physical-label-confirmation",
                "true-multi-owner",
                "missing-owner",
                "embedded-dialogue",
                "unattributed-longform",
            },
        )
        self.assertFalse(triage["accepted"])
        self.assertFalse(triage["counts_as_production_attribution"])
        self.assertFalse(
            triage["policy"]["contains_proposed_speaker_or_character_assignment"]
        )
        self.assertFalse(
            triage["policy"]["may_be_promoted_to_audio_speaker_attributions"]
        )
        self.assertTrue(
            _all_keys(triage).isdisjoint(FORBIDDEN_ASSIGNMENT_KEYS)
        )

        fragments_by_atom: dict[str, list[dict[str, object]]] = {}
        for packet in triage["packets"]:
            self.assertLessEqual(packet["fragment_count"], MAX_PACKET_FRAGMENTS)
            self.assertLessEqual(
                packet["utf16_code_units"], MAX_PACKET_UTF16_CODE_UNITS
            )
            for fragment in packet["fragments"]:
                fragments_by_atom.setdefault(fragment["source_atom_id"], []).append(
                    fragment
                )
        for source_atom, (_, _, _), segment in zip(atoms, rows, source_segments):
            fragments = sorted(
                fragments_by_atom[source_atom["source_atom_id"]],
                key=lambda fragment: fragment["fragment_ordinal"],
            )
            reconstructed = "".join(fragment["text"] for fragment in fragments)
            self.assertEqual(
                sha256_bytes(reconstructed.encode("utf-8")),
                segment["text_sha256"],
            )
            self.assertEqual(fragments[0]["start_char"], segment["start_char"])
            self.assertEqual(fragments[-1]["end_char"], segment["end_char"])

    def test_quote_delimiters_require_balanced_node_identity(self) -> None:
        evidence = {"quote_node_path": "/TEI[1]/said[1]/q[1]"}
        self.assertEqual(
            classify_neutral_glue(" {q} ", evidence),
            (False, "unbalanced-or-unidentified-quote-delimiter"),
        )
        self.assertEqual(
            classify_neutral_glue(" {q} {/q} ", evidence),
            (True, "balanced-quote-delimiters"),
        )
        self.assertEqual(
            classify_neutral_glue(" {q} {/q} ", {}),
            (False, "unbalanced-or-unidentified-quote-delimiter"),
        )

    def test_crito_republic_and_phaedo_quotes_never_inherit_socrates(self) -> None:
        quote_path = "/TEI[1]/text[1]/said[1]/q[1]"
        for dialogue in ("crito", "republic", "phaedo"):
            with self.subTest(dialogue=dialogue), tempfile.TemporaryDirectory() as temporary:
                rows = [
                    (
                        "reported voice",
                        "quoted_or_embedded_markup",
                        _evidence(
                            path=quote_path,
                            relation="descendant-text",
                            nearest=1,
                            quote_path=quote_path,
                            quote_depth=1,
                            raw_who="#Socrates",
                        ),
                    )
                ]
                text, scaffold = _scaffold(dialogue, rows)
                raw_path = Path(temporary) / f"{dialogue}.txt"
                raw_path.write_text(text, encoding="utf-8")
                triage = build_dialogue_triage(
                    scaffold,
                    scaffold_file_sha256="e" * 64,
                    raw_path=raw_path,
                )
                atom = triage["source_atoms"][0]
                self.assertEqual(atom["lane"], "embedded-dialogue")
                self.assertEqual(atom["source_evidence"]["raw_who"], "#Socrates")
                self.assertTrue(
                    _all_keys(triage).isdisjoint(FORBIDDEN_ASSIGNMENT_KEYS)
                )

    def test_corpus_writer_is_confined_to_scratch(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            scratch = root / "scratch"
            scaffold_root = scratch / "scaffolds"
            raw_root = root / "raw"
            scaffold_root.mkdir(parents=True)
            raw_root.mkdir()
            rows = [
                (
                    "Unknown.",
                    "missing_source_attribution",
                    _evidence(
                        path="/TEI[1]/said[1]",
                        relation="direct-text",
                        nearest=1,
                    ),
                )
            ]
            text, scaffold = _scaffold("fixture", rows)
            (raw_root / "fixture.txt").write_text(text, encoding="utf-8")
            (scaffold_root / "fixture.scaffold.json").write_text(
                json.dumps(scaffold), encoding="utf-8"
            )
            triages, corpus = build_corpus_triage(
                scaffold_root=scaffold_root,
                raw_root=raw_root,
            )
            output_root = scratch / "triage"
            write_triage(
                triages,
                corpus,
                output_root=output_root,
                artifact_root=scratch,
            )
            self.assertTrue((output_root / "fixture.triage.json").is_file())
            self.assertTrue((output_root / "corpus-triage.json").is_file())

            production = root / "audio" / "speaker-attributions"
            with self.assertRaisesRegex(TurnAlignmentError, "must stay under"):
                write_triage(
                    triages,
                    corpus,
                    output_root=production,
                    artifact_root=scratch,
                )
            self.assertFalse(production.exists())
            with self.assertRaisesRegex(
                TurnAlignmentError, "must itself be a scratch directory"
            ):
                write_triage(
                    triages,
                    corpus,
                    output_root=production,
                    artifact_root=root,
                )


if __name__ == "__main__":
    unittest.main()
