#!/usr/bin/env python3
"""Build and validate the local, provisional speaker-attribution review UI.

The generated pages are deterministic scratch artifacts.  They validate the
entire scaffold -> triage -> source -> character-catalog hash chain before
writing, persist only provisional browser-local decisions, and export a signed
review JSON.  Neither this generator nor the browser app can write an accepted
``audio/speaker-attributions`` artifact.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable, Sequence

from align_canonical_turn_references import (
    DEFAULT_ARTIFACT_ROOT,
    DEFAULT_CHARACTERS,
    DEFAULT_RAW_ROOT,
    TurnAlignmentError,
    _confined_path,
    _require_regular_input,
    canonical_json,
    sha256_bytes,
    sha256_file,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
SCAFFOLD_GENERATOR = (
    REPO_ROOT / "scripts" / "audio" / "scaffold_speaker_attributions.py"
)
TRIAGE_GENERATOR = (
    REPO_ROOT / "scripts" / "audio" / "build_speaker_attribution_triage.py"
)
JS_ASSET = REPO_ROOT / "scripts" / "audio" / "speaker_attribution_review.js"
CSS_ASSET = REPO_ROOT / "scripts" / "audio" / "speaker_attribution_review.css"
DEFAULT_SCAFFOLD_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attributions"
DEFAULT_TRIAGE_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attribution-triage"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attribution-review"
SAFE_DIALOGUE = re.compile(r"[a-z0-9][a-z0-9-]*")
SHA256 = re.compile(r"[0-9a-f]{64}")

LANES = (
    "physical-label-confirmation",
    "true-multi-owner",
    "missing-owner",
    "embedded-dialogue",
    "unattributed-longform",
)
DECISION_KINDS = (
    "roster-character",
    "keep-unresolved",
    "outer-performer",
    "literary-quotation",
    "nonspoken-glue",
)
ROSTER_REQUIRED_DECISIONS = frozenset(
    {"roster-character", "outer-performer", "literary-quotation"}
)
NON_ROSTER_DECISIONS = frozenset({"keep-unresolved", "nonspoken-glue"})
MARKER_NAMES = (
    "add",
    "corr",
    "del",
    "name",
    "pers",
    "place",
    "q",
    "quote",
    "rs",
    "sic",
)
OPEN_MARKER = re.compile(rf"^\s*\{{({'|'.join(MARKER_NAMES)})\}}\s*$")
CLOSE_MARKER = re.compile(rf"^\s*\{{/({'|'.join(MARKER_NAMES)})\}}\s*$")
STRUCTURAL_MARKER = re.compile(r"^\s*\{(?:\d+[a-e]|p|sp\d+|b\d+)\}\s*$")
BOUNDARY_MARKERS = frozenset({"q", "quote"})
PERFORMANCE_ROLES = frozenset({"voice-owner", "reported-only", "review-required"})


REVIEW_SCHEMA: dict[str, Any] = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "speaker-attribution-review.schema.json",
    "title": "Provisional speaker-attribution review",
    "type": "object",
    "additionalProperties": False,
    "required": [
        "schema_version",
        "artifact_kind",
        "editorial_status",
        "accepted",
        "counts_as_production_attribution",
        "dialogue",
        "input_hashes",
        "review_policy",
        "summary",
        "decisions",
        "review_sha256",
    ],
    "properties": {
        "schema_version": {"const": 1},
        "artifact_kind": {"const": "speaker-attribution-review"},
        "editorial_status": {"const": "provisional-human-review"},
        "accepted": {"const": False},
        "counts_as_production_attribution": {"const": False},
        "dialogue": {"type": "string", "pattern": "^[a-z0-9][a-z0-9-]*$"},
        "input_hashes": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "triage_sha256",
                "scaffold_sha256",
                "english_sha256",
                "characters_sha256",
                "review_schema_sha256",
                "review_generator_sha256",
                "review_page_data_sha256",
            ],
            "properties": {
                key: {"type": "string", "pattern": "^[0-9a-f]{64}$"}
                for key in (
                    "triage_sha256",
                    "scaffold_sha256",
                    "english_sha256",
                    "characters_sha256",
                    "review_schema_sha256",
                    "review_generator_sha256",
                    "review_page_data_sha256",
                )
            },
        },
        "review_policy": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "decision_source",
                "automatic_nonspoken_source",
                "inherited_owner_inference",
                "production_write_allowed",
                "bulk_confirmation_lane",
                "bulk_confirmation_kind",
            ],
            "properties": {
                "decision_source": {"const": "explicit-human-review"},
                "automatic_nonspoken_source": {
                    "const": "deterministic-structural-policy"
                },
                "inherited_owner_inference": {"const": False},
                "production_write_allowed": {"const": False},
                "bulk_confirmation_lane": {"const": "physical-label-confirmation"},
                "bulk_confirmation_kind": {"const": "outer-performer"},
            },
        },
        "summary": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "expanded_atom_decision_count",
                "human_review_unit_count",
                "deterministic_nonspoken_atom_count",
                "bulk_confirmation_unit_count",
                "lane_human_review_unit_counts",
            ],
            "properties": {
                "expanded_atom_decision_count": {
                    "type": "integer",
                    "minimum": 0,
                },
                "human_review_unit_count": {"type": "integer", "minimum": 0},
                "deterministic_nonspoken_atom_count": {
                    "type": "integer",
                    "minimum": 0,
                },
                "bulk_confirmation_unit_count": {
                    "type": "integer",
                    "minimum": 0,
                },
                "lane_human_review_unit_counts": {
                    "type": "object",
                    "additionalProperties": False,
                    "required": list(LANES),
                    "properties": {
                        lane: {"type": "integer", "minimum": 0} for lane in LANES
                    },
                },
            },
        },
        "decisions": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "source_atom_id",
                    "review_unit_id",
                    "start_char",
                    "end_char",
                    "text_sha256",
                    "lane",
                    "decision_kind",
                    "decision_source",
                    "bulk_confirmation",
                ],
                "properties": {
                    "source_atom_id": {"type": "string"},
                    "review_unit_id": {"type": "string"},
                    "start_char": {"type": "integer", "minimum": 0},
                    "end_char": {"type": "integer", "minimum": 1},
                    "text_sha256": {
                        "type": "string",
                        "pattern": "^[0-9a-f]{64}$",
                    },
                    "lane": {"enum": list(LANES)},
                    "decision_kind": {"enum": list(DECISION_KINDS)},
                    "decision_source": {
                        "enum": [
                            "explicit-human-review",
                            "deterministic-structural-policy",
                        ]
                    },
                    "bulk_confirmation": {"type": "boolean"},
                    "character_id": {"type": "string", "minLength": 1},
                },
                "allOf": [
                    {
                        "if": {
                            "properties": {
                                "decision_kind": {
                                    "enum": sorted(ROSTER_REQUIRED_DECISIONS)
                                }
                            }
                        },
                        "then": {"required": ["character_id"]},
                        "else": {"not": {"required": ["character_id"]}},
                    }
                ],
            },
        },
        "review_sha256": {"type": "string", "pattern": "^[0-9a-f]{64}$"},
    },
}
REVIEW_SCHEMA_SHA256 = sha256_bytes(canonical_json(REVIEW_SCHEMA))


def _utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


def _utf16_slice(value: str, start: int, end: int) -> str:
    encoded = value.encode("utf-16-le")
    if start < 0 or end <= start or end * 2 > len(encoded):
        raise TurnAlignmentError(f"invalid UTF-16 review range: {start}:{end}")
    try:
        return encoded[start * 2 : end * 2].decode("utf-16-le")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(
            f"review range bisects a UTF-16 surrogate pair: {start}:{end}"
        ) from error


def _read_json(path: Path, *, label: str) -> tuple[dict[str, Any], str]:
    _require_regular_input(path, label=label)
    raw = path.read_bytes()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise TurnAlignmentError(f"invalid {label} {path}: {error}") from error
    if not isinstance(payload, dict):
        raise TurnAlignmentError(f"{label} is not an object: {path}")
    return payload, sha256_bytes(raw)


def _verify_signature(payload: dict[str, Any], field: str, *, label: str) -> None:
    expected = payload.get(field)
    unsigned = {key: value for key, value in payload.items() if key != field}
    if not isinstance(expected, str) or expected != sha256_bytes(
        canonical_json(unsigned)
    ):
        raise TurnAlignmentError(f"{label} {field} signature mismatch")


def _verify_current_generator(recorded: Any, path: Path, *, label: str) -> None:
    _require_regular_input(path, label=label)
    current = sha256_file(path)
    if recorded != current:
        raise TurnAlignmentError(
            f"stale {label} hash: recorded {recorded!r}, current {current}"
        )


def load_character_catalog(path: Path) -> tuple[dict[str, Any], str]:
    payload, file_sha = _read_json(path, label="character catalog")
    if payload.get("schemaVersion") != 3 or not isinstance(
        payload.get("characters"), list
    ):
        raise TurnAlignmentError("review UI requires CharacterCatalog v3")
    seen: set[str] = set()
    for character in payload["characters"]:
        if not isinstance(character, dict):
            raise TurnAlignmentError("invalid character catalog row")
        character_id = character.get("characterId")
        if (
            not isinstance(character_id, str)
            or not character_id
            or character_id in seen
        ):
            raise TurnAlignmentError(
                f"invalid or duplicate characterId: {character_id}"
            )
        seen.add(character_id)
        appearances = character.get("appearances")
        if not isinstance(appearances, list) or not appearances:
            raise TurnAlignmentError(f"character appearances missing: {character_id}")
        seen_dialogues: set[str] = set()
        for appearance in appearances:
            dialogue = (
                appearance.get("dialogue") if isinstance(appearance, dict) else None
            )
            performance_role = (
                appearance.get("performanceRole")
                if isinstance(appearance, dict)
                else None
            )
            if (
                not isinstance(dialogue, str)
                or not dialogue
                or dialogue in seen_dialogues
                or performance_role not in PERFORMANCE_ROLES
            ):
                raise TurnAlignmentError(
                    f"invalid performance role or duplicate appearance: "
                    f"{character_id}:{dialogue}"
                )
            seen_dialogues.add(dialogue)
    return payload, file_sha


def review_roles_for_dialogue(
    character_payload: dict[str, Any], dialogue: str
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    roster: list[dict[str, Any]] = []
    nonselectable_evidence: list[dict[str, Any]] = []
    for character in character_payload["characters"]:
        appearances = character.get("appearances")
        if not isinstance(appearances, list):
            continue
        matched = [
            appearance
            for appearance in appearances
            if isinstance(appearance, dict) and appearance.get("dialogue") == dialogue
        ]
        for appearance in matched:
            flags = appearance.get("roleFlags")
            if not isinstance(flags, list) or not all(
                isinstance(flag, str) for flag in flags
            ):
                raise TurnAlignmentError(
                    f"invalid role flags for {dialogue}:{character.get('characterId')}"
                )
            performance_role = appearance.get("performanceRole")
            if performance_role not in PERFORMANCE_ROLES:
                raise TurnAlignmentError(
                    f"invalid performance role for "
                    f"{dialogue}:{character.get('characterId')}"
                )
            if set(flags) == {"commentary-narrator"}:
                continue
            row = {
                "character_id": character["characterId"],
                "display_name": character.get("displayName"),
                "identity_status": character.get("identityStatus"),
                "performance_role": performance_role,
                "role_flags": sorted(flags),
            }
            if performance_role == "voice-owner":
                roster.append(row)
            else:
                editorial_note = appearance.get("editorialNote")
                nonselectable_evidence.append(
                    {
                        **row,
                        "editorial_note": (
                            editorial_note if isinstance(editorial_note, str) else None
                        ),
                    }
                )
    roster.sort(
        key=lambda row: (str(row["display_name"]).casefold(), row["character_id"])
    )
    nonselectable_evidence.sort(
        key=lambda row: (
            str(row["display_name"]).casefold(),
            row["character_id"],
        )
    )
    if not roster:
        raise TurnAlignmentError(
            f"no selectable voice-owner source-turn roster for {dialogue}"
        )
    return roster, nonselectable_evidence


def roster_for_dialogue(
    character_payload: dict[str, Any], dialogue: str
) -> list[dict[str, Any]]:
    """Return only source-turn roles allowed to own performed spans."""

    roster, _ = review_roles_for_dialogue(character_payload, dialogue)
    return roster


def _semantic_container(atom: dict[str, Any]) -> dict[str, Any]:
    evidence = atom["source_evidence"]
    quote_path = evidence.get("quote_node_path")
    if isinstance(quote_path, str) and quote_path:
        return {"kind": "quote-node", "container_id": quote_path}
    nearest_said = evidence.get("nearest_said_ordinal")
    if isinstance(nearest_said, int):
        return {
            "kind": "said-node",
            "container_id": f"said:{nearest_said}",
            "said_ordinal": nearest_said,
        }
    dom_path = evidence.get("dom_node_path")
    return {
        "kind": "dom-node",
        "container_id": dom_path if isinstance(dom_path, str) else "derived",
    }


def _marker_match(text: str) -> tuple[str, str] | None:
    opened = OPEN_MARKER.fullmatch(text)
    if opened:
        return "open", opened.group(1)
    closed = CLOSE_MARKER.fullmatch(text)
    if closed:
        return "close", closed.group(1)
    return None


def _automatic_nonspoken_atoms(
    atoms: Sequence[dict[str, Any]], raw_text: str
) -> dict[str, str]:
    """Classify only proven neutral/structural atoms; never infer a speaker."""

    automatic: dict[str, str] = {}
    marker_nodes: dict[str, list[tuple[dict[str, Any], str, str]]] = defaultdict(list)
    for atom in atoms:
        atom_id = atom["source_atom_id"]
        text = _utf16_slice(raw_text, atom["start_char"], atom["end_char"])
        if atom.get("neutral_glue") is True:
            reason = atom.get("neutral_glue_reason")
            automatic[atom_id] = (
                f"neutral-glue:{reason}" if isinstance(reason, str) else "neutral-glue"
            )
        if STRUCTURAL_MARKER.fullmatch(text):
            automatic[atom_id] = "structural-marker"
        marker = _marker_match(text)
        path = atom["source_evidence"].get("dom_node_path")
        if marker is not None and isinstance(path, str):
            marker_nodes[path].append((atom, marker[0], marker[1]))

    for path, rows in marker_nodes.items():
        opens = [row for row in rows if row[1] == "open"]
        closes = [row for row in rows if row[1] == "close"]
        if len(opens) != 1 or len(closes) != 1:
            continue
        opened, _, open_name = opens[0]
        closed, _, close_name = closes[0]
        if open_name != close_name or opened["start_char"] >= closed["end_char"]:
            continue
        context_fields = (
            "nearest_said_ordinal",
            "parent_said_ordinal",
            "quote_node_path",
            "quote_depth",
        )
        if any(
            opened["source_evidence"].get(field) != closed["source_evidence"].get(field)
            for field in context_fields
        ):
            continue
        automatic[opened["source_atom_id"]] = f"balanced-{open_name}-markup:{path}"
        automatic[closed["source_atom_id"]] = f"balanced-{open_name}-markup:{path}"
    return automatic


def _is_unit_boundary(atom: dict[str, Any], text: str) -> bool:
    evidence = atom["source_evidence"]
    origin = evidence.get("dom_text_origin")
    path = evidence.get("dom_node_path")
    marker = _marker_match(text)
    return bool(
        "\n" in text
        or STRUCTURAL_MARKER.fullmatch(text)
        or origin
        in {
            "block-separator",
            "milestone-marker",
            "structural-book-marker",
        }
        or (marker is not None and marker[1] in BOUNDARY_MARKERS)
        or (isinstance(path, str) and "/label[" in path)
    )


def build_review_units(
    atoms: list[dict[str, Any]],
    packets: Sequence[dict[str, Any]],
    raw_text: str,
    *,
    dialogue: str,
) -> list[dict[str, Any]]:
    """Collapse mechanical atoms into fail-closed homogeneous review units."""

    ordered = sorted(
        atoms,
        key=lambda atom: (
            atom["start_char"],
            atom["end_char"],
            atom["source_atom_id"],
        ),
    )
    previous_end = -1
    for atom in ordered:
        if atom["start_char"] < previous_end:
            raise TurnAlignmentError(f"overlapping triage atoms for {dialogue}")
        previous_end = atom["end_char"]

    packet_ids_by_atom: dict[str, set[str]] = defaultdict(set)
    for packet in packets:
        for fragment in packet["fragments"]:
            packet_ids_by_atom[fragment["source_atom_id"]].add(packet["packet_id"])

    automatic = _automatic_nonspoken_atoms(ordered, raw_text)
    for atom in ordered:
        atom_id = atom["source_atom_id"]
        atom["review_classification"] = {
            "automatic_nonspoken": atom_id in automatic,
            "automatic_nonspoken_reason": automatic.get(atom_id),
            "semantic_container": _semantic_container(atom),
        }

    pending_units: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None

    def finish_current() -> None:
        nonlocal current
        if current is not None:
            pending_units.append(current)
            current = None

    def start_deterministic(atom: dict[str, Any]) -> dict[str, Any]:
        return {
            "unit_kind": "deterministic-nonspoken",
            "decision_required": False,
            "lane": "deterministic-nonspoken",
            "semantic_container": atom["review_classification"]["semantic_container"],
            "semantic_key": None,
            "source_atom_ids": [atom["source_atom_id"]],
            "lexical_atom_ids": [],
            "automatic_nonspoken_atom_ids": [atom["source_atom_id"]],
        }

    def semantic_key(atom: dict[str, Any]) -> tuple[Any, ...]:
        container = atom["review_classification"]["semantic_container"]
        evidence = atom["source_evidence"]
        return (
            atom["lane"],
            container["kind"],
            container["container_id"],
            atom["unresolved_reason"],
            evidence.get("said_text_relation"),
        )

    def start_human(atom: dict[str, Any]) -> dict[str, Any]:
        return {
            "unit_kind": "human-decision",
            "decision_required": True,
            "lane": atom["lane"],
            "semantic_container": atom["review_classification"]["semantic_container"],
            "semantic_key": semantic_key(atom),
            "source_atom_ids": [atom["source_atom_id"]],
            "lexical_atom_ids": [atom["source_atom_id"]],
            "automatic_nonspoken_atom_ids": [],
        }

    previous_atom: dict[str, Any] | None = None
    for atom in ordered:
        atom_id = atom["source_atom_id"]
        text = _utf16_slice(raw_text, atom["start_char"], atom["end_char"])
        boundary = _is_unit_boundary(atom, text)
        gap = (
            previous_atom is not None
            and previous_atom["end_char"] != atom["start_char"]
        )
        if gap:
            finish_current()

        is_automatic = atom_id in automatic
        container = atom["review_classification"]["semantic_container"]
        if is_automatic:
            if boundary:
                finish_current()
                pending_units.append(start_deterministic(atom))
            elif (
                current is not None
                and current["semantic_container"] == container
                and previous_atom is not None
                and previous_atom["end_char"] == atom["start_char"]
            ):
                current["source_atom_ids"].append(atom_id)
                current["automatic_nonspoken_atom_ids"].append(atom_id)
            else:
                finish_current()
                current = start_deterministic(atom)
        else:
            key = semantic_key(atom)
            if boundary:
                finish_current()
                pending_units.append(start_human(atom))
            elif (
                current is not None
                and current["unit_kind"] == "human-decision"
                and current["semantic_key"] == key
            ):
                current["source_atom_ids"].append(atom_id)
                current["lexical_atom_ids"].append(atom_id)
            elif (
                current is not None
                and current["unit_kind"] == "deterministic-nonspoken"
                and current["semantic_container"] == container
            ):
                current["unit_kind"] = "human-decision"
                current["decision_required"] = True
                current["lane"] = atom["lane"]
                current["semantic_key"] = key
                current["lexical_atom_ids"].append(atom_id)
                current["source_atom_ids"].append(atom_id)
            else:
                finish_current()
                current = start_human(atom)
        previous_atom = atom
    finish_current()

    atom_by_id = {atom["source_atom_id"]: atom for atom in ordered}
    units: list[dict[str, Any]] = []
    represented: list[str] = []
    for ordinal, pending in enumerate(pending_units, start=1):
        source_ids = pending.pop("source_atom_ids")
        pending.pop("semantic_key", None)
        child_atoms = [atom_by_id[atom_id] for atom_id in source_ids]
        unit: dict[str, Any] = {
            "review_unit_id": f"{dialogue}-review-unit-{ordinal:06d}",
            **pending,
            "start_char": child_atoms[0]["start_char"],
            "end_char": child_atoms[-1]["end_char"],
            "source_atom_ids": source_ids,
            "source_atom_count": len(source_ids),
            "lexical_atom_count": len(pending["lexical_atom_ids"]),
            "automatic_nonspoken_atom_count": len(
                pending["automatic_nonspoken_atom_ids"]
            ),
            "original_packet_ids": sorted(
                {
                    packet_id
                    for atom_id in source_ids
                    for packet_id in packet_ids_by_atom[atom_id]
                }
            ),
        }
        if unit["decision_required"] and not unit["lexical_atom_ids"]:
            raise TurnAlignmentError(f"empty human review unit for {dialogue}")
        lexical_keys = {
            semantic_key(atom_by_id[atom_id]) for atom_id in unit["lexical_atom_ids"]
        }
        if len(lexical_keys) > 1:
            raise TurnAlignmentError(f"heterogeneous review unit for {dialogue}")
        unit["review_unit_sha256"] = sha256_bytes(canonical_json(unit))
        units.append(unit)
        represented.extend(source_ids)
    if represented != [atom["source_atom_id"] for atom in ordered]:
        raise TurnAlignmentError(
            f"review units do not preserve source order for {dialogue}"
        )
    return units


def _verify_scaffold_chain(
    scaffold_path: Path,
    *,
    expected_scaffold_sha256: str,
    expected_scaffold_file_sha256: str,
    english_sha256: str,
    characters_sha256: str,
) -> dict[str, Any]:
    scaffold, scaffold_file_sha = _read_json(
        scaffold_path, label="speaker-attribution scaffold"
    )
    _verify_signature(scaffold, "scaffold_sha256", label="speaker-attribution scaffold")
    if scaffold.get("schema_version") != 2:
        raise TurnAlignmentError("review UI requires schema-v2 scaffold")
    if (
        scaffold.get("accepted") is not False
        or scaffold.get("counts_as_production_attribution") is not False
    ):
        raise TurnAlignmentError("review UI refuses accepted/production scaffold")
    if scaffold.get("scaffold_sha256") != expected_scaffold_sha256:
        raise TurnAlignmentError("stale triage scaffold semantic hash")
    if scaffold_file_sha != expected_scaffold_file_sha256:
        raise TurnAlignmentError("stale triage scaffold file hash")
    if scaffold.get("source", {}).get("english_sha256") != english_sha256:
        raise TurnAlignmentError("scaffold/triage English hash mismatch")
    input_hashes = scaffold.get("input_hashes")
    if not isinstance(input_hashes, dict):
        raise TurnAlignmentError("scaffold input hashes missing")
    if input_hashes.get("characters_sha256") != characters_sha256:
        raise TurnAlignmentError("stale scaffold character catalog hash")
    _verify_current_generator(
        input_hashes.get("generator_sha256"),
        SCAFFOLD_GENERATOR,
        label="scaffold generator",
    )
    return scaffold


def _verify_triage_content(
    triage: dict[str, Any], raw_text: str, *, dialogue: str
) -> None:
    source_atoms = triage.get("source_atoms")
    packets = triage.get("packets")
    if not isinstance(source_atoms, list) or not isinstance(packets, list):
        raise TurnAlignmentError(f"triage atoms/packets missing for {dialogue}")

    atoms: dict[str, dict[str, Any]] = {}
    for atom in source_atoms:
        if not isinstance(atom, dict):
            raise TurnAlignmentError(f"invalid triage atom for {dialogue}")
        atom_id = atom.get("source_atom_id")
        start = atom.get("start_char")
        end = atom.get("end_char")
        if not isinstance(atom_id, str) or atom_id in atoms:
            raise TurnAlignmentError(f"duplicate/invalid triage atom for {dialogue}")
        if not isinstance(start, int) or not isinstance(end, int):
            raise TurnAlignmentError(
                f"invalid triage atom range for {dialogue}:{atom_id}"
            )
        text = _utf16_slice(raw_text, start, end)
        if atom.get("text_sha256") != sha256_bytes(text.encode("utf-8")):
            raise TurnAlignmentError(
                f"stale triage atom text hash for {dialogue}:{atom_id}"
            )
        if atom.get("utf16_code_units") != end - start:
            raise TurnAlignmentError(
                f"stale triage atom length for {dialogue}:{atom_id}"
            )
        if atom.get("lane") not in LANES:
            raise TurnAlignmentError(f"invalid triage lane for {dialogue}:{atom_id}")
        evidence = atom.get("source_evidence")
        if not isinstance(evidence, dict) or "dom_node_path" not in evidence:
            raise TurnAlignmentError(f"DOM provenance missing for {dialogue}:{atom_id}")
        atoms[atom_id] = atom

    fragments_by_atom: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for packet in packets:
        if not isinstance(packet, dict):
            raise TurnAlignmentError(f"invalid triage packet for {dialogue}")
        _verify_signature(packet, "packet_sha256", label="triage packet")
        if packet.get("accepted") is not False or packet.get("lane") not in LANES:
            raise TurnAlignmentError(f"invalid triage packet policy for {dialogue}")
        fragments = packet.get("fragments")
        if not isinstance(fragments, list) or packet.get("fragment_count") != len(
            fragments
        ):
            raise TurnAlignmentError(
                f"triage packet fragment count mismatch for {dialogue}"
            )
        packet_units = 0
        for fragment in fragments:
            if not isinstance(fragment, dict):
                raise TurnAlignmentError(f"invalid triage fragment for {dialogue}")
            atom_id = fragment.get("source_atom_id")
            if atom_id not in atoms:
                raise TurnAlignmentError(
                    f"triage fragment references unknown atom: {atom_id}"
                )
            if atoms[atom_id]["lane"] != packet["lane"]:
                raise TurnAlignmentError(f"triage packet/atom lane mismatch: {atom_id}")
            text = fragment.get("text")
            start = fragment.get("start_char")
            end = fragment.get("end_char")
            if (
                not isinstance(text, str)
                or not isinstance(start, int)
                or not isinstance(end, int)
            ):
                raise TurnAlignmentError(f"invalid triage fragment fields: {atom_id}")
            if fragment.get("text_sha256") != sha256_bytes(text.encode("utf-8")):
                raise TurnAlignmentError(
                    f"triage fragment text hash mismatch: {atom_id}"
                )
            if (
                _utf16_length(text) != end - start
                or fragment.get("utf16_code_units") != end - start
            ):
                raise TurnAlignmentError(f"triage fragment length mismatch: {atom_id}")
            if _utf16_slice(raw_text, start, end) != text:
                raise TurnAlignmentError(f"stale triage fragment source: {atom_id}")
            packet_units += end - start
            fragments_by_atom[atom_id].append(fragment)
        if packet.get("utf16_code_units") != packet_units:
            raise TurnAlignmentError(
                f"triage packet UTF-16 count mismatch for {dialogue}"
            )

    if set(fragments_by_atom) != set(atoms):
        raise TurnAlignmentError(
            f"triage packets do not preserve every atom for {dialogue}"
        )
    for atom_id, atom in atoms.items():
        fragments = sorted(
            fragments_by_atom[atom_id],
            key=lambda fragment: fragment["fragment_ordinal"],
        )
        if [fragment["fragment_ordinal"] for fragment in fragments] != list(
            range(1, len(fragments) + 1)
        ):
            raise TurnAlignmentError(
                f"triage fragment ordinals are not gapless: {atom_id}"
            )
        if any(fragment["fragment_count"] != len(fragments) for fragment in fragments):
            raise TurnAlignmentError(f"triage fragment_count mismatch: {atom_id}")
        if (
            fragments[0]["start_char"] != atom["start_char"]
            or fragments[-1]["end_char"] != atom["end_char"]
        ):
            raise TurnAlignmentError(f"triage fragments do not bound atom: {atom_id}")
        for left, right in zip(fragments, fragments[1:]):
            if left["end_char"] != right["start_char"]:
                raise TurnAlignmentError(f"triage fragment gap/overlap: {atom_id}")
        reconstructed = "".join(fragment["text"] for fragment in fragments)
        if sha256_bytes(reconstructed.encode("utf-8")) != atom["text_sha256"]:
            raise TurnAlignmentError(f"triage fragments drift from atom: {atom_id}")

    summary = triage.get("summary")
    if not isinstance(summary, dict):
        raise TurnAlignmentError(f"triage summary missing for {dialogue}")
    if summary.get("unresolved_source_atom_count") != len(atoms):
        raise TurnAlignmentError(f"triage atom summary mismatch for {dialogue}")
    if summary.get("packet_count") != len(packets):
        raise TurnAlignmentError(f"triage packet summary mismatch for {dialogue}")
    actual_lane_counts = Counter(atom["lane"] for atom in atoms.values())
    if summary.get("lane_source_atom_counts") != {
        lane: actual_lane_counts[lane] for lane in LANES
    }:
        raise TurnAlignmentError(f"triage lane summary mismatch for {dialogue}")


def load_dialogue_review_model(
    dialogue: str,
    *,
    triage_root: Path,
    scaffold_root: Path,
    raw_root: Path,
    character_payload: dict[str, Any],
    characters_sha256: str,
    expected_triage_sha256: str | None = None,
) -> dict[str, Any]:
    if SAFE_DIALOGUE.fullmatch(dialogue) is None:
        raise TurnAlignmentError(f"unsafe dialogue slug: {dialogue}")
    triage_path = triage_root / f"{dialogue}.triage.json"
    triage, triage_file_sha = _read_json(
        triage_path, label="speaker-attribution triage"
    )
    _verify_signature(triage, "triage_sha256", label="speaker-attribution triage")
    if triage.get("dialogue") != dialogue:
        raise TurnAlignmentError(f"triage filename/dialogue mismatch: {triage_path}")
    if (
        expected_triage_sha256 is not None
        and triage.get("triage_sha256") != expected_triage_sha256
    ):
        raise TurnAlignmentError(f"stale corpus triage hash for {dialogue}")
    if (
        triage.get("accepted") is not False
        or triage.get("counts_as_production_attribution") is not False
    ):
        raise TurnAlignmentError("review UI refuses accepted/production triage")

    input_hashes = triage.get("input_hashes")
    if not isinstance(input_hashes, dict):
        raise TurnAlignmentError(f"triage input hashes missing for {dialogue}")
    _verify_current_generator(
        input_hashes.get("generator_sha256"),
        TRIAGE_GENERATOR,
        label="triage generator",
    )

    raw_path = raw_root / f"{dialogue}.txt"
    _require_regular_input(raw_path, label="canonical English rendering")
    raw_bytes = raw_path.read_bytes()
    try:
        raw_text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(
            f"canonical English is not UTF-8: {raw_path}"
        ) from error
    english_sha = sha256_bytes(raw_bytes)
    source = triage.get("source")
    if not isinstance(source, dict) or source.get("english_sha256") != english_sha:
        raise TurnAlignmentError(f"stale triage source hash for {dialogue}")
    if source.get("english_utf16_code_units") != _utf16_length(raw_text):
        raise TurnAlignmentError(f"stale triage source length for {dialogue}")

    scaffold = _verify_scaffold_chain(
        scaffold_root / f"{dialogue}.scaffold.json",
        expected_scaffold_sha256=input_hashes.get("scaffold_sha256"),
        expected_scaffold_file_sha256=input_hashes.get("scaffold_file_sha256"),
        english_sha256=english_sha,
        characters_sha256=characters_sha256,
    )
    if scaffold.get("dialogue") != dialogue:
        raise TurnAlignmentError(f"scaffold filename/dialogue mismatch for {dialogue}")
    _verify_triage_content(triage, raw_text, dialogue=dialogue)

    roster, nonselectable_evidence = review_roles_for_dialogue(
        character_payload, dialogue
    )
    atoms = [
        {
            key: atom[key]
            for key in (
                "source_atom_id",
                "start_char",
                "end_char",
                "utf16_code_units",
                "text_sha256",
                "unresolved_reason",
                "neutral_glue",
                "neutral_glue_reason",
                "lane",
                "source_evidence",
            )
        }
        for atom in triage["source_atoms"]
    ]
    packets = [
        {
            "packet_id": packet["packet_id"],
            "lane": packet["lane"],
            "fragment_count": packet["fragment_count"],
            "utf16_code_units": packet["utf16_code_units"],
            "bounding_start_char": packet["bounding_start_char"],
            "bounding_end_char": packet["bounding_end_char"],
            "fragments": [
                {
                    key: fragment[key]
                    for key in (
                        "source_atom_id",
                        "fragment_ordinal",
                        "fragment_count",
                        "start_char",
                        "end_char",
                        "text_sha256",
                        "text",
                    )
                }
                for fragment in packet["fragments"]
            ],
        }
        for packet in triage["packets"]
    ]
    review_units = build_review_units(
        atoms,
        packets,
        raw_text,
        dialogue=dialogue,
    )
    human_units = [unit for unit in review_units if unit["decision_required"]]
    lane_unit_counts = Counter(unit["lane"] for unit in human_units)
    deterministic_atom_count = sum(
        atom["review_classification"]["automatic_nonspoken"] for atom in atoms
    )
    review_summary = {
        **triage["summary"],
        "human_review_unit_count": len(human_units),
        "deterministic_nonspoken_unit_count": sum(
            not unit["decision_required"] for unit in review_units
        ),
        "deterministic_nonspoken_atom_count": deterministic_atom_count,
        "lexical_atom_count": len(atoms) - deterministic_atom_count,
        "lane_human_review_unit_counts": {
            lane: lane_unit_counts[lane] for lane in LANES
        },
    }
    model: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-review-page-data",
        "editorial_status": "provisional-human-review",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": dialogue,
        "input_hashes": {
            "triage_sha256": triage["triage_sha256"],
            "triage_file_sha256": triage_file_sha,
            "scaffold_sha256": scaffold["scaffold_sha256"],
            "english_sha256": english_sha,
            "characters_sha256": characters_sha256,
            "review_schema_sha256": REVIEW_SCHEMA_SHA256,
            "review_generator_sha256": sha256_file(SCRIPT_PATH),
        },
        "policy": {
            "inherited_owner_inference": False,
            "roster_defaults_allowed": False,
            "production_write_allowed": False,
            "bulk_confirmation_lane": "physical-label-confirmation",
            "bulk_confirmation_kind": "outer-performer",
            "bulk_confirmation_requires_explicit_roster_choice": True,
            "automatic_nonspoken_policy": (
                "Only neutral glue, standalone structural markers, and balanced "
                "same-DOM-node markup delimiters"
            ),
            "human_unit_policy": (
                "All lexical children share one lane, unresolved reason, direct/descendant "
                "relation, and stable quote/said/DOM container; labels, structural markers, "
                "quote boundaries, assigned gaps, and container changes split units"
            ),
        },
        "summary": review_summary,
        "roster": roster,
        "nonselectable_evidence": nonselectable_evidence,
        "source_text": raw_text,
        "source_atoms": atoms,
        "review_units": review_units,
    }
    model["page_data_sha256"] = sha256_bytes(canonical_json(model))
    return model


def _verify_corpus_triage(corpus: dict[str, Any]) -> None:
    _verify_signature(
        corpus, "corpus_triage_sha256", label="speaker-attribution triage corpus"
    )
    if corpus.get("artifact_kind") != "speaker-attribution-triage-corpus":
        raise TurnAlignmentError("unexpected triage corpus artifact kind")
    if (
        corpus.get("accepted") is not False
        or corpus.get("counts_as_production_attribution") is not False
    ):
        raise TurnAlignmentError("review UI refuses accepted/production triage corpus")
    input_hashes = corpus.get("input_hashes")
    if not isinstance(input_hashes, dict):
        raise TurnAlignmentError("triage corpus input hashes missing")
    _verify_current_generator(
        input_hashes.get("generator_sha256"),
        TRIAGE_GENERATOR,
        label="triage generator",
    )
    dialogues = corpus.get("dialogues")
    summary = corpus.get("summary")
    if not isinstance(dialogues, list) or not isinstance(summary, dict):
        raise TurnAlignmentError("triage corpus dialogues/summary missing")
    names = [row.get("dialogue") for row in dialogues if isinstance(row, dict)]
    if len(names) != len(dialogues) or len(set(names)) != len(names):
        raise TurnAlignmentError("triage corpus dialogue rows invalid or duplicated")
    if summary.get("dialogue_count") != len(dialogues):
        raise TurnAlignmentError("triage corpus dialogue count mismatch")


def build_corpus_review_models(
    *,
    triage_root: Path = DEFAULT_TRIAGE_ROOT,
    scaffold_root: Path = DEFAULT_SCAFFOLD_ROOT,
    raw_root: Path = DEFAULT_RAW_ROOT,
    characters_path: Path = DEFAULT_CHARACTERS,
    dialogues: Sequence[str] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    generator_sha = sha256_file(SCRIPT_PATH)
    corpus_path = triage_root / "corpus-triage.json"
    corpus, corpus_file_sha = _read_json(
        corpus_path, label="speaker-attribution triage corpus"
    )
    _verify_corpus_triage(corpus)
    rows = {
        row["dialogue"]: row
        for row in corpus["dialogues"]
        if isinstance(row, dict) and isinstance(row.get("dialogue"), str)
    }
    requested = sorted(dialogues or rows)
    unknown = [dialogue for dialogue in requested if dialogue not in rows]
    if unknown:
        raise TurnAlignmentError(f"unknown triage dialogue(s): {', '.join(unknown)}")

    characters, characters_sha = load_character_catalog(characters_path)
    models = [
        load_dialogue_review_model(
            dialogue,
            triage_root=triage_root,
            scaffold_root=scaffold_root,
            raw_root=raw_root,
            character_payload=characters,
            characters_sha256=characters_sha,
            expected_triage_sha256=rows[dialogue].get("triage_sha256"),
        )
        for dialogue in requested
    ]
    js_sha = sha256_file(JS_ASSET)
    css_sha = sha256_file(CSS_ASSET)
    index: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-review-index",
        "editorial_status": "provisional-human-review",
        "accepted": False,
        "counts_as_production_attribution": False,
        "input_hashes": {
            "corpus_triage_sha256": corpus["corpus_triage_sha256"],
            "corpus_triage_file_sha256": corpus_file_sha,
            "characters_sha256": characters_sha,
            "review_schema_sha256": REVIEW_SCHEMA_SHA256,
            "review_generator_sha256": generator_sha,
            "review_js_sha256": js_sha,
            "review_css_sha256": css_sha,
        },
        "policy": {
            "browser_persistence": "localStorage keyed by exact triage and catalog hashes",
            "production_write_allowed": False,
            "inherited_owner_inference": False,
        },
        "summary": {
            "dialogue_count": len(models),
            "source_atom_count": sum(
                model["summary"]["unresolved_source_atom_count"] for model in models
            ),
            "packet_count": sum(model["summary"]["packet_count"] for model in models),
            "human_review_unit_count": sum(
                model["summary"]["human_review_unit_count"] for model in models
            ),
            "deterministic_nonspoken_atom_count": sum(
                model["summary"]["deterministic_nonspoken_atom_count"]
                for model in models
            ),
        },
        "dialogues": [
            {
                "dialogue": model["dialogue"],
                "page": f"dialogues/{model['dialogue']}.html",
                "page_data_sha256": model["page_data_sha256"],
                "triage_sha256": model["input_hashes"]["triage_sha256"],
                "roster_count": len(model["roster"]),
                "nonselectable_evidence_count": len(model["nonselectable_evidence"]),
                "source_atom_count": model["summary"]["unresolved_source_atom_count"],
                "packet_count": model["summary"]["packet_count"],
                "human_review_unit_count": model["summary"]["human_review_unit_count"],
                "deterministic_nonspoken_atom_count": model["summary"][
                    "deterministic_nonspoken_atom_count"
                ],
                "lane_source_atom_counts": model["summary"]["lane_source_atom_counts"],
                "lane_human_review_unit_counts": model["summary"][
                    "lane_human_review_unit_counts"
                ],
            }
            for model in models
        ],
    }
    index["review_index_sha256"] = sha256_bytes(canonical_json(index))
    if sha256_file(SCRIPT_PATH) != generator_sha:
        raise TurnAlignmentError("review generator changed while it was running")
    if sha256_file(characters_path) != characters_sha:
        raise TurnAlignmentError(
            "character catalog changed while review pages were built"
        )
    if sha256_file(JS_ASSET) != js_sha or sha256_file(CSS_ASSET) != css_sha:
        raise TurnAlignmentError("review UI assets changed while pages were built")
    return models, index


def _safe_script_json(value: Any) -> str:
    """Escape JSON so source text cannot close its application/json script."""

    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        .replace("&", "\\u0026")
        .replace("<", "\\u003c")
        .replace(">", "\\u003e")
        .replace("\u2028", "\\u2028")
        .replace("\u2029", "\\u2029")
    )


def _versioned_asset_href(path: str, sha256: Any) -> str:
    if not isinstance(sha256, str) or SHA256.fullmatch(sha256) is None:
        raise TurnAlignmentError(f"invalid review asset hash: {sha256!r}")
    return f"{path}?sha256={sha256}"


def render_dialogue_page(
    model: dict[str, Any],
    *,
    js_sha256: str | None = None,
    css_sha256: str | None = None,
) -> str:
    dialogue = model["dialogue"]
    if SAFE_DIALOGUE.fullmatch(dialogue) is None:
        raise TurnAlignmentError("unsafe dialogue in review page")
    js_href = _versioned_asset_href("../review.js", js_sha256 or sha256_file(JS_ASSET))
    css_href = _versioned_asset_href(
        "../review.css", css_sha256 or sha256_file(CSS_ASSET)
    )
    payload = _safe_script_json(model)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self'; connect-src 'none'; img-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'">
  <title>Speaker-attribution review: {html.escape(dialogue)}</title>
  <link rel="stylesheet" href="{css_href}">
</head>
<body>
  <header class="topbar">
    <a href="../index.html">Corpus index</a>
    <h1 id="page-title">Speaker-attribution review</h1>
    <p id="fatal-error" class="fatal" hidden></p>
  </header>
  <main id="app" aria-live="polite"></main>
  <script id="review-data" type="application/json">{payload}</script>
  <script src="{js_href}"></script>
</body>
</html>
"""


def render_index_page(index: dict[str, Any], *, css_sha256: str | None = None) -> str:
    expected_css_sha256 = index.get("input_hashes", {}).get("review_css_sha256")
    css_href = _versioned_asset_href("review.css", css_sha256 or expected_css_sha256)
    rows = []
    for row in index["dialogues"]:
        dialogue = html.escape(row["dialogue"])
        page = html.escape(row["page"], quote=True)
        lanes = ", ".join(
            f"{html.escape(lane)}: {count:,}"
            for lane, count in row["lane_source_atom_counts"].items()
            if count
        )
        rows.append(
            "<tr>"
            f'<th scope="row"><a href="{page}">{dialogue}</a></th>'
            f"<td>{row['human_review_unit_count']:,}</td>"
            f"<td>{row['source_atom_count']:,}</td>"
            f"<td>{row['deterministic_nonspoken_atom_count']:,}</td>"
            f"<td>{row['packet_count']:,}</td>"
            f"<td>{row['roster_count']:,}</td>"
            f"<td>{lanes}</td>"
            "</tr>"
        )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; base-uri 'none'; object-src 'none'">
  <title>Plato speaker-attribution review</title>
  <link rel="stylesheet" href="{css_href}">
</head>
<body>
  <main class="index-shell">
    <h1>Plato speaker-attribution review</h1>
    <p>This is a provisional, browser-local review surface. It cannot write production attributions and never inherits a speaker from TEI ownership.</p>
    <p><strong>{index["summary"]["dialogue_count"]}</strong> dialogues · <strong>{index["summary"]["human_review_unit_count"]:,}</strong> human decisions · <strong>{index["summary"]["deterministic_nonspoken_atom_count"]:,}</strong> deterministic nonspoken atoms · <strong>{index["summary"]["source_atom_count"]:,}</strong> preserved unresolved atoms</p>
    <table>
      <thead><tr><th>Dialogue</th><th>Human decisions</th><th>Atoms</th><th>Automatic nonspoken</th><th>Source packets</th><th>Roster</th><th>Lanes</th></tr></thead>
      <tbody>{"".join(rows)}</tbody>
    </table>
  </main>
</body>
</html>
"""


def _write_bytes(path: Path, data: bytes, *, artifact_root: Path) -> None:
    destination = _confined_path(artifact_root, path, label="review UI output")
    if destination.exists() and not destination.is_file():
        raise TurnAlignmentError(
            f"review UI output is not a regular file: {destination}"
        )
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.name}.{os.getpid()}.tmp")
    try:
        temporary.write_bytes(data)
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def write_review_ui(
    models: Iterable[dict[str, Any]],
    index: dict[str, Any],
    *,
    output_root: Path,
    artifact_root: Path,
) -> None:
    if artifact_root.absolute().name != "scratch":
        raise TurnAlignmentError(
            f"review artifact root must itself be a scratch directory: {artifact_root}"
        )
    root = _confined_path(artifact_root, output_root, label="review UI output root")
    js_bytes = JS_ASSET.read_bytes()
    css_bytes = CSS_ASSET.read_bytes()
    js_sha = sha256_bytes(js_bytes)
    css_sha = sha256_bytes(css_bytes)
    expected_assets = index.get("input_hashes")
    if not isinstance(expected_assets, dict) or (
        expected_assets.get("review_js_sha256") != js_sha
        or expected_assets.get("review_css_sha256") != css_sha
    ):
        raise TurnAlignmentError("review UI asset hashes changed before write")
    _write_bytes(root / "review.js", js_bytes, artifact_root=artifact_root)
    _write_bytes(root / "review.css", css_bytes, artifact_root=artifact_root)
    _write_bytes(
        root / "review-schema.json",
        json.dumps(REVIEW_SCHEMA, ensure_ascii=False, indent=2, sort_keys=True).encode(
            "utf-8"
        )
        + b"\n",
        artifact_root=artifact_root,
    )
    _write_bytes(
        root / "corpus-index.json",
        json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True).encode("utf-8")
        + b"\n",
        artifact_root=artifact_root,
    )
    _write_bytes(
        root / "index.html",
        render_index_page(index, css_sha256=css_sha).encode("utf-8"),
        artifact_root=artifact_root,
    )
    for model in models:
        _write_bytes(
            root / "dialogues" / f"{model['dialogue']}.html",
            render_dialogue_page(
                model,
                js_sha256=js_sha,
                css_sha256=css_sha,
            ).encode("utf-8"),
            artifact_root=artifact_root,
        )


def _expected_export_input_hashes(model: dict[str, Any]) -> dict[str, str]:
    return {
        "triage_sha256": model["input_hashes"]["triage_sha256"],
        "scaffold_sha256": model["input_hashes"]["scaffold_sha256"],
        "english_sha256": model["input_hashes"]["english_sha256"],
        "characters_sha256": model["input_hashes"]["characters_sha256"],
        "review_schema_sha256": REVIEW_SCHEMA_SHA256,
        "review_generator_sha256": model["input_hashes"]["review_generator_sha256"],
        "review_page_data_sha256": model["page_data_sha256"],
    }


def sign_review_export(unsigned: dict[str, Any]) -> dict[str, Any]:
    if "review_sha256" in unsigned:
        raise TurnAlignmentError(
            "cannot sign review payload that already has a signature"
        )
    return {**unsigned, "review_sha256": sha256_bytes(canonical_json(unsigned))}


def validate_review_export(payload: dict[str, Any], model: dict[str, Any]) -> None:
    _verify_signature(payload, "review_sha256", label="speaker-attribution review")
    top_keys = {
        "schema_version",
        "artifact_kind",
        "editorial_status",
        "accepted",
        "counts_as_production_attribution",
        "dialogue",
        "input_hashes",
        "review_policy",
        "summary",
        "decisions",
        "review_sha256",
    }
    if set(payload) != top_keys:
        raise TurnAlignmentError("review export fields do not match schema")
    if (
        payload.get("schema_version") != 1
        or payload.get("artifact_kind") != "speaker-attribution-review"
        or payload.get("editorial_status") != "provisional-human-review"
        or payload.get("accepted") is not False
        or payload.get("counts_as_production_attribution") is not False
        or payload.get("dialogue") != model["dialogue"]
    ):
        raise TurnAlignmentError("review export policy/header mismatch")
    if payload.get("input_hashes") != _expected_export_input_hashes(model):
        raise TurnAlignmentError("stale review export input hashes")
    expected_policy = {
        "decision_source": "explicit-human-review",
        "automatic_nonspoken_source": "deterministic-structural-policy",
        "inherited_owner_inference": False,
        "production_write_allowed": False,
        "bulk_confirmation_lane": "physical-label-confirmation",
        "bulk_confirmation_kind": "outer-performer",
    }
    if payload.get("review_policy") != expected_policy:
        raise TurnAlignmentError(
            "review export policy permits inference or production write"
        )

    decisions = payload.get("decisions")
    if not isinstance(decisions, list):
        raise TurnAlignmentError("review export decisions must be an array")
    atoms = {atom["source_atom_id"]: atom for atom in model["source_atoms"]}
    units = {unit["review_unit_id"]: unit for unit in model["review_units"]}
    unit_by_atom: dict[str, dict[str, Any]] = {}
    for unit in units.values():
        _verify_signature(unit, "review_unit_sha256", label="review unit")
        for atom_id in unit["source_atom_ids"]:
            if atom_id in unit_by_atom or atom_id not in atoms:
                raise TurnAlignmentError(f"invalid review-unit atom: {atom_id}")
            unit_by_atom[atom_id] = unit
    if set(unit_by_atom) != set(atoms):
        raise TurnAlignmentError("review units do not partition source atoms")
    roster = model.get("roster")
    if not isinstance(roster, list) or any(
        not isinstance(row, dict)
        or row.get("performance_role") != "voice-owner"
        or not isinstance(row.get("role_flags"), list)
        or "commentary-narrator" in row.get("role_flags", [])
        for row in roster
    ):
        raise TurnAlignmentError("review model roster contains a non-voice-owner role")
    roster_ids = {row["character_id"] for row in roster}
    seen: set[str] = set()
    human_unit_decisions: dict[str, set[tuple[Any, ...]]] = defaultdict(set)
    bulk_units: set[str] = set()
    previous_start = -1
    for decision in decisions:
        if not isinstance(decision, dict):
            raise TurnAlignmentError("review decision must be an object")
        atom_id = decision.get("source_atom_id")
        if not isinstance(atom_id, str) or atom_id in seen or atom_id not in atoms:
            raise TurnAlignmentError(f"duplicate or unknown review atom: {atom_id}")
        seen.add(atom_id)
        atom = atoms[atom_id]
        common_keys = {
            "source_atom_id",
            "review_unit_id",
            "start_char",
            "end_char",
            "text_sha256",
            "lane",
            "decision_kind",
            "decision_source",
            "bulk_confirmation",
        }
        kind = decision.get("decision_kind")
        expected_keys = common_keys | (
            {"character_id"} if kind in ROSTER_REQUIRED_DECISIONS else set()
        )
        if set(decision) != expected_keys:
            raise TurnAlignmentError(f"review decision fields invalid: {atom_id}")
        unit = unit_by_atom[atom_id]
        if decision.get("review_unit_id") != unit["review_unit_id"]:
            raise TurnAlignmentError(
                f"review decision unit binding mismatch: {atom_id}"
            )
        for key in ("start_char", "end_char", "text_sha256", "lane"):
            if decision.get(key) != atom[key]:
                raise TurnAlignmentError(
                    f"review decision source binding mismatch: {atom_id}"
                )
        if kind not in DECISION_KINDS:
            raise TurnAlignmentError(f"unknown review decision kind: {atom_id}")
        bulk = decision.get("bulk_confirmation")
        if not isinstance(bulk, bool):
            raise TurnAlignmentError(f"invalid bulk flag: {atom_id}")
        automatic = atom["review_classification"]["automatic_nonspoken"]
        if automatic:
            if (
                kind != "nonspoken-glue"
                or decision.get("decision_source") != "deterministic-structural-policy"
                or "character_id" in decision
                or bulk
            ):
                raise TurnAlignmentError(
                    f"deterministic nonspoken decision was altered: {atom_id}"
                )
        else:
            if decision.get("decision_source") != "explicit-human-review":
                raise TurnAlignmentError(
                    f"forbidden automatic/inherited assignment: {atom_id}"
                )
            if kind in ROSTER_REQUIRED_DECISIONS:
                if decision.get("character_id") not in roster_ids:
                    raise TurnAlignmentError(
                        f"review decision lacks explicit roster choice: {atom_id}"
                    )
            elif kind in NON_ROSTER_DECISIONS and "character_id" in decision:
                raise TurnAlignmentError(
                    f"non-roster decision carries character: {atom_id}"
                )
            if bulk and not (
                unit["lane"] == "physical-label-confirmation"
                and kind == "outer-performer"
                and decision.get("character_id") in roster_ids
            ):
                raise TurnAlignmentError(f"forbidden bulk autoassignment: {atom_id}")
            signature = (
                kind,
                decision.get("character_id"),
                bulk,
            )
            human_unit_decisions[unit["review_unit_id"]].add(signature)
            if bulk:
                bulk_units.add(unit["review_unit_id"])
        if atom["start_char"] < previous_start:
            raise TurnAlignmentError("review decisions are not in source order")
        previous_start = atom["start_char"]

    if seen != set(atoms):
        missing = sorted(set(atoms) - seen)
        raise TurnAlignmentError(
            f"review decisions incomplete: {len(missing)} atoms missing"
        )
    human_units = [unit for unit in units.values() if unit["decision_required"]]
    if set(human_unit_decisions) != {
        unit["review_unit_id"] for unit in human_units
    } or any(len(values) != 1 for values in human_unit_decisions.values()):
        raise TurnAlignmentError(
            "expanded atom decisions disagree within a review unit"
        )
    lane_counts = Counter(unit["lane"] for unit in human_units)
    expected_summary = {
        "expanded_atom_decision_count": len(atoms),
        "human_review_unit_count": len(human_units),
        "deterministic_nonspoken_atom_count": sum(
            atom["review_classification"]["automatic_nonspoken"]
            for atom in atoms.values()
        ),
        "bulk_confirmation_unit_count": len(bulk_units),
        "lane_human_review_unit_counts": {lane: lane_counts[lane] for lane in LANES},
    }
    if payload.get("summary") != expected_summary:
        raise TurnAlignmentError("review export decision summary mismatch")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "dialogues", nargs="*", help="dialogue slugs; defaults to corpus"
    )
    parser.add_argument("--triage-root", type=Path, default=DEFAULT_TRIAGE_ROOT)
    parser.add_argument("--scaffold-root", type=Path, default=DEFAULT_SCAFFOLD_ROOT)
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--write", action="store_true", help="write the complete local UI below scratch"
    )
    parser.add_argument(
        "--validate-review",
        type=Path,
        help="validate one exported provisional review JSON against current inputs",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        requested = args.dialogues or None
        if args.validate_review is not None:
            payload, _ = _read_json(args.validate_review, label="review export")
            dialogue = payload.get("dialogue")
            if not isinstance(dialogue, str):
                raise TurnAlignmentError("review export dialogue missing")
            if requested and requested != [dialogue]:
                raise TurnAlignmentError("--validate-review requires its one dialogue")
            requested = [dialogue]
        models, index = build_corpus_review_models(
            triage_root=args.triage_root,
            scaffold_root=args.scaffold_root,
            raw_root=args.raw_root,
            characters_path=args.characters,
            dialogues=requested,
        )
        if args.validate_review is not None:
            payload, _ = _read_json(args.validate_review, label="review export")
            validate_review_export(payload, models[0])
            print(
                json.dumps(
                    {
                        "valid": True,
                        "dialogue": models[0]["dialogue"],
                        "review_sha256": payload["review_sha256"],
                    },
                    sort_keys=True,
                )
            )
            return 0
        if args.write:
            write_review_ui(
                models,
                index,
                output_root=args.output_root,
                artifact_root=args.artifact_root,
            )
        print(json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except TurnAlignmentError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
