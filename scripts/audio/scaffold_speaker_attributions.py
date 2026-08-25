#!/usr/bin/env python3
"""Build conservative, scratch-only speaker-attribution scaffolds.

The scaffold is editorial input, never an accepted attribution plan.  It
re-renders the exact pinned English TEI, proves byte equality with
``raw/plato/english``, and partitions every UTF-16 character offset.  Only text
owned by a uniquely catalogued leaf ``<said who>`` is assigned automatically.
Narration, quotations, mixed/nested outer turns, malformed or missing owners,
and structural separators remain explicit human-review spans.

Default execution is read-only.  ``--write`` may write only below ``scratch/``;
it cannot write ``audio/speaker-attributions`` or any production registry.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any, Iterable, Sequence
from xml.etree import ElementTree as ET

from align_canonical_turn_references import (
    DEFAULT_ARTIFACT_ROOT,
    DEFAULT_CENSUS,
    DEFAULT_CHARACTERS,
    DEFAULT_RAW_ROOT,
    DEFAULT_TEI_CACHE,
    IMPORTER_PATH,
    EnglishSource,
    TurnAlignmentError,
    _attribution_owners,
    _confined_path,
    _load_importer,
    _require_regular_input,
    canonical_json,
    load_character_attributions,
    load_english_sources,
    populate_tei_cache,
    sha256_bytes,
    sha256_file,
    tei_cache_path,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attributions"
TEI_NAMESPACE = "http://www.tei-c.org/ns/1.0"
TEI_NS = f"{{{TEI_NAMESPACE}}}"
SKIP_TAGS = frozenset({"bibl", "note"})
MARKER_TAGS = {
    "add": "add",
    "corr": "corr",
    "del": "del",
    "name": "name",
    "persName": "pers",
    "placeName": "place",
    "q": "q",
    "quote": "quote",
    "rs": "rs",
    "sic": "sic",
}
QUOTE_TAGS = frozenset({"q", "quote"})
SAFE_DIALOGUE = re.compile(r"[a-z0-9][a-z0-9-]*")

# These are evidence inputs only.  Prototype speakers are compared with the
# production character registry and reported as resolved, missing, or
# ambiguous; they are never promoted into that registry or into source
# attribution.
PROTOTYPE_SCRIPTS = {
    "crito": REPO_ROOT / "scratch" / "crito-audio" / "script.json",
    "symposium": REPO_ROOT / "scratch" / "symposium-audio" / "script.json",
}
COMMENTARY_ROLE = {
    "role_key": "commentary-narrator",
    "display_name": "Commentary Narrator",
    "aliases": ("Announcer", "Commentary Narrator", "Commentator"),
    "evidence": {
        "kind": "edition-policy",
        "path": "docs/audio-edition-protocol.md",
        "requirement": "Every commentary entry requires a resolved recurring performed voice.",
    },
}


@dataclass(frozen=True)
class Provenance:
    status: str
    reason: str | None = None
    character_id: str | None = None
    candidate_character_ids: tuple[str, ...] = ()
    raw_who: str | None = None
    said_ordinal: int | None = None
    dom_node_path: str | None = None
    contributing_dom_node_paths: tuple[str, ...] = ()
    dom_text_origin: str | None = None
    nearest_said_ordinal: int | None = None
    parent_said_ordinal: int | None = None
    quote_node_path: str | None = None
    quote_depth: int = 0
    said_text_relation: str = "outside-said"


@dataclass(frozen=True)
class TaggedRun:
    text: str
    provenance: Provenance


@dataclass(frozen=True)
class SaidInfo:
    ordinal: int
    raw_who: str | None
    contains_nested_said: bool
    dom_node_path: str


STRUCTURAL = Provenance(status="unresolved", reason="structural_separator")
MIXED_WHITESPACE = Provenance(
    status="unresolved", reason="mixed_boundary_whitespace"
)
TRANSCRIPTION_REPAIR = Provenance(
    status="unresolved", reason="transcription_repair"
)


def _local_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if tag.startswith("{") else tag


def _utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


def _display_path(path: Path) -> str:
    absolute = path.absolute()
    try:
        return str(absolute.relative_to(REPO_ROOT))
    except ValueError:
        return str(absolute)


def _append_run(runs: list[TaggedRun], text: str, provenance: Provenance) -> None:
    if not text:
        return
    if runs and runs[-1].provenance == provenance:
        previous = runs[-1]
        runs[-1] = TaggedRun(previous.text + text, provenance)
    else:
        runs.append(TaggedRun(text, provenance))


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\u02bc", "\u2019"))


def _normalize_raw_who(value: str | None) -> str | None:
    if value is None:
        return None
    return " ".join(value.split())


def _said_base_provenance(
    info: SaidInfo,
    owners: dict[str, tuple[str, ...]],
) -> Provenance:
    raw_who = info.raw_who
    candidate_ids = owners.get(raw_who, ()) if raw_who else ()
    common = {
        "candidate_character_ids": candidate_ids,
        "raw_who": raw_who,
        "said_ordinal": info.ordinal,
    }
    if info.contains_nested_said:
        return Provenance(
            status="unresolved", reason="contains_nested_said", **common
        )
    if raw_who is None or not raw_who:
        return Provenance(
            status="unresolved", reason="missing_source_attribution", **common
        )
    if len(raw_who.split()) != 1:
        return Provenance(
            status="unresolved", reason="multiple_source_attributions", **common
        )
    if not candidate_ids:
        return Provenance(
            status="unresolved", reason="catalog_missing_attribution", **common
        )
    if len(candidate_ids) != 1:
        return Provenance(
            status="unresolved", reason="ambiguous_catalog_attribution", **common
        )
    return Provenance(
        status="assigned",
        character_id=candidate_ids[0],
        **common,
    )


def _dom_node_paths(root: ET.Element) -> dict[ET.Element, str]:
    """Return deterministic local-name XPath-like paths for every element."""

    paths: dict[ET.Element, str] = {}

    def visit(element: ET.Element, path: str) -> None:
        paths[element] = path
        sibling_counts: Counter[str] = Counter()
        for child in element:
            name = _local_name(child.tag)
            sibling_counts[name] += 1
            visit(child, f"{path}/{name}[{sibling_counts[name]}]")

    visit(root, f"/{_local_name(root.tag)}[1]")
    return paths


def _active_provenance(
    said_stack: Sequence[SaidInfo],
    quote_stack: Sequence[str],
    owners: dict[str, tuple[str, ...]],
    *,
    dom_node_path: str,
    dom_text_origin: str,
) -> Provenance:
    nearest_said = said_stack[-1] if said_stack else None
    parent_said = said_stack[-2] if len(said_stack) > 1 else None
    context = {
        "dom_node_path": dom_node_path,
        "dom_text_origin": dom_text_origin,
        "nearest_said_ordinal": (
            nearest_said.ordinal if nearest_said is not None else None
        ),
        "parent_said_ordinal": (
            parent_said.ordinal if parent_said is not None else None
        ),
        "quote_node_path": quote_stack[-1] if quote_stack else None,
        "quote_depth": len(quote_stack),
        "said_text_relation": (
            "outside-said"
            if nearest_said is None
            else "direct-text"
            if dom_node_path == nearest_said.dom_node_path
            else "descendant-text"
        ),
    }
    if not said_stack:
        if quote_stack:
            return Provenance(
                status="unresolved",
                reason="quoted_or_embedded_markup",
                **context,
            )
        return Provenance(
            status="unresolved",
            reason="narrator_or_unattributed",
            **context,
        )
    base = _said_base_provenance(nearest_said, owners)
    if quote_stack:
        return Provenance(
            status="unresolved",
            reason="quoted_or_embedded_markup",
            candidate_character_ids=base.candidate_character_ids,
            raw_who=base.raw_who,
            said_ordinal=base.said_ordinal,
            **context,
        )
    return replace(base, **context)


def _append_text(
    runs: list[TaggedRun], text: str | None, provenance: Provenance
) -> None:
    if text:
        normalized = _normalize_text(text)
        if normalized:
            _append_run(runs, normalized, provenance)


def _append_marker(
    runs: list[TaggedRun], marker: str, provenance: Provenance
) -> None:
    _append_run(runs, f" {{{marker}}} ", provenance)


def _emit_milestone(
    runs: list[TaggedRun], element: ET.Element, provenance: Provenance
) -> None:
    unit = element.attrib.get("unit")
    marker = element.attrib.get("n")
    if unit == "section" and marker and re.fullmatch(r"\d+[a-e]", marker):
        _append_marker(runs, marker, provenance)
    elif unit == "para" and element.attrib.get("ed") == "P":
        _append_marker(runs, "p", provenance)
    elif unit == "speech" and marker:
        _append_marker(runs, f"sp{marker}", provenance)


def _emit_element(
    runs: list[TaggedRun],
    element: ET.Element,
    *,
    said_stack: tuple[SaidInfo, ...],
    quote_stack: tuple[str, ...],
    said_infos: dict[ET.Element, SaidInfo],
    node_paths: dict[ET.Element, str],
    owners: dict[str, tuple[str, ...]],
) -> None:
    name = _local_name(element.tag)
    if name in SKIP_TAGS:
        return

    current_stack = said_stack
    if name == "said":
        current_stack = (*current_stack, said_infos[element])
    node_path = node_paths[element]
    current_quote_stack = quote_stack
    if name in QUOTE_TAGS:
        current_quote_stack = (*current_quote_stack, node_path)

    def provenance(origin: str) -> Provenance:
        return _active_provenance(
            current_stack,
            current_quote_stack,
            owners,
            dom_node_path=node_path,
            dom_text_origin=origin,
        )

    if name == "div" and element.attrib.get("subtype") == "book":
        book = element.attrib.get("n")
        if book:
            _append_run(
                runs,
                f"\n{{b{book}}}\n",
                replace(
                    STRUCTURAL,
                    dom_node_path=node_path,
                    dom_text_origin="structural-book-marker",
                ),
            )

    close_marker = MARKER_TAGS.get(name)
    if name == "milestone":
        _emit_milestone(runs, element, provenance("milestone-marker"))
    elif close_marker:
        _append_marker(runs, close_marker, provenance("open-marker"))
        _append_text(runs, element.text, provenance("element-text"))
    else:
        _append_text(runs, element.text, provenance("element-text"))

    for child in element:
        _emit_element(
            runs,
            child,
            said_stack=current_stack,
            quote_stack=current_quote_stack,
            said_infos=said_infos,
            node_paths=node_paths,
            owners=owners,
        )
        _append_text(
            runs,
            child.tail,
            provenance(f"child-tail-after:{node_paths[child]}"),
        )

    if close_marker:
        _append_marker(runs, f"/{close_marker}", provenance("close-marker"))
    if name == "p":
        _append_run(runs, "\n", provenance("block-separator"))


def _mixed_provenance(provenances: Iterable[Provenance]) -> Provenance:
    values = set(provenances)
    if len(values) == 1:
        return next(iter(values))
    semantic_values = {
        (
            value.status,
            value.reason,
            value.character_id,
            value.candidate_character_ids,
            value.raw_who,
            value.said_ordinal,
        )
        for value in values
    }
    if len(semantic_values) == 1:
        representative = next(iter(values))
        paths = tuple(
            sorted(
                {
                    path
                    for value in values
                    for path in (
                        *((value.dom_node_path,) if value.dom_node_path else ()),
                        *value.contributing_dom_node_paths,
                    )
                }
            )
        )

        def common(field: str) -> Any:
            candidates = {getattr(value, field) for value in values}
            return next(iter(candidates)) if len(candidates) == 1 else None

        relations = {value.said_text_relation for value in values}
        quote_depths = {value.quote_depth for value in values}
        return replace(
            representative,
            dom_node_path=paths[0] if len(paths) == 1 else None,
            contributing_dom_node_paths=paths,
            dom_text_origin="collapsed-whitespace",
            nearest_said_ordinal=common("nearest_said_ordinal"),
            parent_said_ordinal=common("parent_said_ordinal"),
            quote_node_path=common("quote_node_path"),
            quote_depth=(next(iter(quote_depths)) if len(quote_depths) == 1 else 0),
            said_text_relation=(
                next(iter(relations)) if len(relations) == 1 else "mixed-text"
            ),
        )
    return MIXED_WHITESPACE


def _collapse_line_whitespace(
    cells: list[tuple[str, Provenance]],
) -> list[tuple[str, Provenance]]:
    collapsed: list[tuple[str, Provenance]] = []
    index = 0
    while index < len(cells):
        character, provenance = cells[index]
        if character not in " \t":
            collapsed.append((character, provenance))
            index += 1
            continue
        end = index + 1
        while end < len(cells) and cells[end][0] in " \t":
            end += 1
        collapsed.append(
            (" ", _mixed_provenance(cell[1] for cell in cells[index:end]))
        )
        index = end
    while collapsed and collapsed[0][0] in " \t":
        collapsed.pop(0)
    while collapsed and collapsed[-1][0] in " \t":
        collapsed.pop()
    return collapsed


def _format_runs(runs: Sequence[TaggedRun]) -> list[tuple[str, Provenance]]:
    cells: list[tuple[str, Provenance]] = []
    for run in runs:
        cells.extend((character, run.provenance) for character in run.text)

    # Match the importer's removal of horizontal whitespace immediately before
    # a newline.  XML parsing already normalizes CRLF, but tolerate it here.
    without_trailing_space: list[tuple[str, Provenance]] = []
    for character, provenance in cells:
        if character == "\r":
            character = "\n"
        if character == "\n":
            while without_trailing_space and without_trailing_space[-1][0] in " \t":
                without_trailing_space.pop()
        without_trailing_space.append((character, provenance))

    source_lines: list[tuple[list[tuple[str, Provenance]], Provenance | None]] = []
    current: list[tuple[str, Provenance]] = []
    for character, provenance in without_trailing_space:
        if character == "\n":
            source_lines.append((current, provenance))
            current = []
        else:
            current.append((character, provenance))
    source_lines.append((current, None))

    rendered: list[tuple[str, Provenance]] = []
    for line, separator_provenance in source_lines:
        normalized = _collapse_line_whitespace(line)
        if not normalized:
            continue
        rendered.extend(normalized)
        rendered.append(("\n", separator_provenance or STRUCTURAL))
    return rendered


def _apply_repairs(
    cells: list[tuple[str, Provenance]], repairs: Sequence[tuple[str, str]]
) -> list[tuple[str, Provenance]]:
    result = cells
    for old, new in repairs:
        content = "".join(character for character, _ in result)
        if content.count(old) != 1:
            raise TurnAlignmentError(
                f"expected exactly one annotated English repair occurrence: {old!r}"
            )
        start = content.index(old)
        end = start + len(old)
        replaced = result[start:end]
        if len(old) == len(new):
            replacement = [
                (character, replaced[index][1])
                for index, character in enumerate(new)
            ]
        else:
            provenance = _mixed_provenance(cell[1] for cell in replaced)
            if provenance == MIXED_WHITESPACE:
                provenance = TRANSCRIPTION_REPAIR
            replacement = [(character, provenance) for character in new]
        result = [*result[:start], *replacement, *result[end:]]
    return result


def _find_edition(root: ET.Element) -> ET.Element:
    body = root.find(f".//{TEI_NS}body")
    if body is None:
        raise TurnAlignmentError("TEI body not found")
    edition = body.find(f"{TEI_NS}div[@type='edition']")
    if edition is None:
        edition = body.find(f"{TEI_NS}div[@type='translation']")
    if edition is None:
        raise TurnAlignmentError("TEI edition or translation div not found")
    return edition


def _render_annotated(
    xml_bytes: bytes,
    *,
    dialogue: str,
    owners: dict[str, tuple[str, ...]],
    importer: Any,
) -> list[tuple[str, Provenance]]:
    try:
        root = ET.fromstring(xml_bytes)
    except ET.ParseError as error:
        raise TurnAlignmentError(f"invalid English TEI for {dialogue}: {error}") from error
    said_elements = root.findall(f".//{TEI_NS}said")
    node_paths = _dom_node_paths(root)
    said_infos = {
        element: SaidInfo(
            ordinal=ordinal,
            raw_who=_normalize_raw_who(element.attrib.get("who")),
            contains_nested_said=bool(element.findall(f".//{TEI_NS}said")),
            dom_node_path=node_paths[element],
        )
        for ordinal, element in enumerate(said_elements, start=1)
    }
    runs: list[TaggedRun] = []
    _emit_element(
        runs,
        _find_edition(root),
        said_stack=(),
        quote_stack=(),
        said_infos=said_infos,
        node_paths=node_paths,
        owners=owners,
    )
    cells = _format_runs(runs)
    repairs = importer.ENGLISH_REPAIRS.get(dialogue, [])
    cells = _apply_repairs(cells, repairs)
    annotated = "".join(character for character, _ in cells)
    canonical = importer.apply_english_repairs(
        dialogue, importer.convert_xml(xml_bytes)
    )
    if annotated != canonical:
        raise TurnAlignmentError(
            f"annotated renderer drifted from canonical importer for {dialogue}"
        )
    return cells


def _preview(value: str) -> str:
    return " ".join(value.split())[:120]


def _segment_rows(
    cells: Sequence[tuple[str, Provenance]],
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    grouped: list[tuple[str, Provenance]] = []
    for character, provenance in cells:
        if grouped and grouped[-1][1] == provenance:
            grouped[-1] = (grouped[-1][0] + character, provenance)
        else:
            grouped.append((character, provenance))

    rows: list[dict[str, Any]] = []
    utf16_offset = 0
    assigned_utf16 = assigned_code_points = assigned_utf8 = 0
    reason_counts: Counter[str] = Counter()
    character_counts: Counter[str] = Counter()
    for ordinal, (text, provenance) in enumerate(grouped, start=1):
        utf16_units = _utf16_length(text)
        utf8_bytes = len(text.encode("utf-8"))
        row: dict[str, Any] = {
            "id": f"scaffold-{ordinal:06d}",
            "start_char": utf16_offset,
            "end_char": utf16_offset + utf16_units,
            "status": provenance.status,
            "text_sha256": sha256_bytes(text.encode("utf-8")),
            "utf16_code_units": utf16_units,
            "code_points": len(text),
            "utf8_bytes": utf8_bytes,
            "preview": _preview(text),
        }
        if provenance.status == "assigned":
            row["character_id"] = provenance.character_id
            assigned_utf16 += utf16_units
            assigned_code_points += len(text)
            assigned_utf8 += utf8_bytes
            character_counts[provenance.character_id or ""] += utf16_units
        else:
            row["unresolved_reason"] = provenance.reason
            reason_counts[provenance.reason or "unknown"] += utf16_units
        source_evidence: dict[str, Any] = {
            "dom_node_path": provenance.dom_node_path,
            "contributing_dom_node_paths": list(
                provenance.contributing_dom_node_paths
            ),
            "dom_text_origin": provenance.dom_text_origin,
            "said_text_relation": provenance.said_text_relation,
            "nearest_said_ordinal": provenance.nearest_said_ordinal,
            "parent_said_ordinal": provenance.parent_said_ordinal,
            "quote_node_path": provenance.quote_node_path,
            "quote_depth": provenance.quote_depth,
        }
        if provenance.said_ordinal is not None:
            source_evidence.update(
                {
                    "raw_who": provenance.raw_who,
                    "candidate_character_ids": list(
                        provenance.candidate_character_ids
                    ),
                }
            )
        row["source_evidence"] = source_evidence
        rows.append(row)
        utf16_offset += utf16_units

    total_text = "".join(character for character, _ in cells)
    summary = {
        "segment_count": len(rows),
        "assigned_segment_count": sum(row["status"] == "assigned" for row in rows),
        "unresolved_segment_count": sum(
            row["status"] == "unresolved" for row in rows
        ),
        "source_utf16_code_units": _utf16_length(total_text),
        "assigned_utf16_code_units": assigned_utf16,
        "unresolved_utf16_code_units": _utf16_length(total_text) - assigned_utf16,
        "source_code_points": len(total_text),
        "assigned_code_points": assigned_code_points,
        "unresolved_code_points": len(total_text) - assigned_code_points,
        "source_utf8_bytes": len(total_text.encode("utf-8")),
        "assigned_utf8_bytes": assigned_utf8,
        "unresolved_utf8_bytes": len(total_text.encode("utf-8")) - assigned_utf8,
        "assigned_character_utf16_counts": dict(sorted(character_counts.items())),
        "unresolved_reason_utf16_counts": dict(sorted(reason_counts.items())),
    }
    return rows, summary


def _normalized_role_name(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def _role_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")


def _catalog_role_owners(
    character_payload: dict[str, Any], dialogue: str
) -> dict[str, tuple[str, ...]]:
    owners: dict[str, list[str]] = defaultdict(list)
    for character in character_payload.get("characters", []):
        if not isinstance(character, dict):
            continue
        appearances = character.get("appearances")
        if not isinstance(appearances, list) or not any(
            isinstance(appearance, dict) and appearance.get("dialogue") == dialogue
            for appearance in appearances
        ):
            continue
        character_id = character.get("characterId")
        names = [character.get("displayName"), *(character.get("aliases") or [])]
        if not isinstance(character_id, str):
            continue
        for name in names:
            if isinstance(name, str) and _normalized_role_name(name):
                owners[_normalized_role_name(name)].append(character_id)
    return {
        name: tuple(sorted(set(character_ids)))
        for name, character_ids in owners.items()
    }


def _prototype_speakers(path: Path) -> tuple[list[str], str] | None:
    if not path.exists():
        return None
    _require_regular_input(path, label="prototype screenplay")
    raw = path.read_bytes()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise TurnAlignmentError(f"invalid prototype screenplay {path}: {error}") from error
    if not isinstance(payload, list):
        raise TurnAlignmentError(f"prototype screenplay must be an array: {path}")
    speakers = sorted(
        {
            row["speaker"]
            for row in payload
            if isinstance(row, dict)
            and isinstance(row.get("speaker"), str)
            and row["speaker"].strip()
        }
    )
    return speakers, sha256_bytes(raw)


def _catalog_missing_roles(
    character_payload: dict[str, Any], dialogue: str
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    owners = _catalog_role_owners(character_payload, dialogue)
    diagnostics: dict[str, dict[str, Any]] = {}

    commentary_aliases = tuple(COMMENTARY_ROLE["aliases"])
    commentary_owners = sorted(
        {
            character_id
            for alias in commentary_aliases
            for character_id in owners.get(_normalized_role_name(alias), ())
        }
    )
    commentary_status = (
        "catalog-missing"
        if not commentary_owners
        else "catalog-resolved"
        if len(commentary_owners) == 1
        else "catalog-ambiguous"
    )
    diagnostics[COMMENTARY_ROLE["role_key"]] = {
        "dialogue": dialogue,
        "role_key": COMMENTARY_ROLE["role_key"],
        "display_name": COMMENTARY_ROLE["display_name"],
        "aliases": list(commentary_aliases),
        "status": commentary_status,
        "catalog_character_ids": commentary_owners,
        "attribution_status": "not-source-attributed",
        "evidence": [COMMENTARY_ROLE["evidence"]],
    }

    prototype_path = PROTOTYPE_SCRIPTS.get(dialogue)
    prototype = _prototype_speakers(prototype_path) if prototype_path else None
    if prototype is not None and prototype_path is not None:
        speakers, prototype_sha = prototype
        for speaker in speakers:
            normalized = _normalized_role_name(speaker)
            if normalized in {
                _normalized_role_name(alias) for alias in commentary_aliases
            }:
                diagnostics[COMMENTARY_ROLE["role_key"]]["evidence"].append(
                    {
                        "kind": "prototype-screenplay",
                        "path": _display_path(prototype_path),
                        "sha256": prototype_sha,
                        "speaker": speaker,
                    }
                )
                continue
            character_ids = list(owners.get(normalized, ()))
            key = character_ids[0] if len(character_ids) == 1 else _role_key(speaker)
            diagnostics[key] = {
                "dialogue": dialogue,
                "role_key": key,
                "display_name": speaker,
                "aliases": [speaker],
                "status": (
                    "catalog-missing"
                    if not character_ids
                    else "catalog-resolved"
                    if len(character_ids) == 1
                    else "catalog-ambiguous"
                ),
                "catalog_character_ids": character_ids,
                "attribution_status": "not-auto-attributed",
                "evidence": [
                    {
                        "kind": "prototype-screenplay",
                        "path": _display_path(prototype_path),
                        "sha256": prototype_sha,
                        "speaker": speaker,
                    }
                ],
            }

    rows = sorted(diagnostics.values(), key=lambda row: row["role_key"])
    missing = [row for row in rows if row["status"] != "catalog-resolved"]
    return rows, missing


def build_dialogue_scaffold(
    source: EnglishSource,
    *,
    census_sha256: str,
    character_sha256: str,
    character_payload: dict[str, Any],
    attributions: dict[str, dict[str, tuple[str, ...]]],
    raw_root: Path,
    tei_cache: Path,
    importer: Any,
    importer_sha256: str,
) -> dict[str, Any]:
    raw_path = raw_root / f"{source.dialogue}.txt"
    tei_path = tei_cache_path(tei_cache, source)
    _require_regular_input(raw_path, label="canonical English rendering")
    _require_regular_input(tei_path, label="cached pinned English TEI")
    if sha256_file(tei_path) != source.tei_sha256:
        raise TurnAlignmentError(
            f"cached English TEI hash mismatch for {source.dialogue}"
        )
    xml_bytes = tei_path.read_bytes()
    raw_bytes = raw_path.read_bytes()
    try:
        raw_text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(
            f"canonical English is not UTF-8 for {source.dialogue}: {error}"
        ) from error

    owners = _attribution_owners(attributions, source.dialogue)
    cells = _render_annotated(
        xml_bytes,
        dialogue=source.dialogue,
        owners=owners,
        importer=importer,
    )
    rendered = "".join(character for character, _ in cells)
    if rendered.encode("utf-8") != raw_bytes:
        raise TurnAlignmentError(
            f"pinned TEI does not reproduce raw/plato/english bytes for {source.dialogue}"
        )

    segments, summary = _segment_rows(cells)
    expected_start = 0
    for segment in segments:
        if segment["start_char"] != expected_start or segment["end_char"] <= expected_start:
            raise TurnAlignmentError(
                f"non-gapless scaffold segment for {source.dialogue}: {segment['id']}"
            )
        expected_start = segment["end_char"]
    if expected_start != _utf16_length(raw_text):
        raise TurnAlignmentError(
            f"scaffold does not cover canonical English for {source.dialogue}"
        )

    role_diagnostics, missing_roles = _catalog_missing_roles(
        character_payload, source.dialogue
    )
    missing_source_attributions = sorted(
        {
            segment["source_evidence"]["raw_who"]
            for segment in segments
            if segment.get("unresolved_reason") == "catalog_missing_attribution"
            and segment.get("source_evidence", {}).get("raw_who")
        }
    )
    scaffold: dict[str, Any] = {
        "schema_version": 2,
        "artifact_kind": "speaker-attribution-scaffold",
        "editorial_status": "human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": source.dialogue,
        "source": {
            "english_path": _display_path(raw_path),
            "english_sha256": sha256_bytes(raw_bytes),
            "english_utf8_bytes": len(raw_bytes),
            "english_utf16_code_units": _utf16_length(raw_text),
            "tei_path": _display_path(tei_path),
            "tei_sha256": source.tei_sha256,
            "tei_url": source.url,
        },
        "input_hashes": {
            "census_sha256": census_sha256,
            "characters_sha256": character_sha256,
            "importer_sha256": importer_sha256,
            "generator_sha256": sha256_file(SCRIPT_PATH),
        },
        "policy": {
            "offset_unit": "UTF-16 code units",
            "automatic_assignment": "exact unique sourceAttributions owner of deepest leaf <said who> only",
            "dom_provenance": (
                "Stable local-name element paths plus nearest/parent said ordinals, "
                "quote path/depth, and direct-versus-descendant text relation"
            ),
            "quoted_markup_assigned": False,
            "narration_assigned": False,
            "production_write_allowed": False,
            "required_editorial_action": (
                "Review every unresolved span, split/merge as needed, add missing roles "
                "to the character catalog through a separate editorial change, and create "
                "a new accepted audio/speaker-attributions plan manually."
            ),
        },
        "summary": summary,
        "catalog_gap_diagnostics": {
            "missing_source_attributions": missing_source_attributions,
            "production_roles": role_diagnostics,
            "catalog_missing_roles": missing_roles,
        },
        "segments": segments,
    }
    scaffold["scaffold_sha256"] = sha256_bytes(canonical_json(scaffold))
    return scaffold


def _read_character_payload(path: Path) -> dict[str, Any]:
    _require_regular_input(path, label="character registry")
    try:
        payload = json.loads(path.read_bytes())
    except json.JSONDecodeError as error:
        raise TurnAlignmentError(f"invalid character registry {path}: {error}") from error
    if not isinstance(payload, dict):
        raise TurnAlignmentError(f"character registry is not an object: {path}")
    return payload


def build_corpus_scaffolds(
    *,
    census_path: Path = DEFAULT_CENSUS,
    characters_path: Path = DEFAULT_CHARACTERS,
    raw_root: Path = DEFAULT_RAW_ROOT,
    tei_cache: Path = DEFAULT_TEI_CACHE,
    artifact_root: Path = DEFAULT_ARTIFACT_ROOT,
    dialogues: Sequence[str] | None = None,
    populate_source_cache: bool = False,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    script_sha = sha256_file(SCRIPT_PATH)
    sources, census_sha, source_policy = load_english_sources(census_path)
    attributions, _, character_sha = load_character_attributions(characters_path)
    character_payload = _read_character_payload(characters_path)
    importer = _load_importer(IMPORTER_PATH)
    importer_sha = sha256_file(IMPORTER_PATH)

    requested = sorted(dialogues or sources)
    unknown = [dialogue for dialogue in requested if dialogue not in sources]
    if unknown:
        raise TurnAlignmentError(f"unknown dialogue(s): {', '.join(unknown)}")
    selected_sources = [sources[dialogue] for dialogue in requested]
    if populate_source_cache:
        populate_tei_cache(
            selected_sources,
            cache_root=tei_cache,
            artifact_root=artifact_root,
        )

    scaffolds = [
        build_dialogue_scaffold(
            source,
            census_sha256=census_sha,
            character_sha256=character_sha,
            character_payload=character_payload,
            attributions=attributions,
            raw_root=raw_root,
            tei_cache=tei_cache,
            importer=importer,
            importer_sha256=importer_sha,
        )
        for source in selected_sources
    ]
    summary_fields = (
        "segment_count",
        "assigned_segment_count",
        "unresolved_segment_count",
        "source_utf16_code_units",
        "assigned_utf16_code_units",
        "unresolved_utf16_code_units",
        "source_code_points",
        "assigned_code_points",
        "unresolved_code_points",
        "source_utf8_bytes",
        "assigned_utf8_bytes",
        "unresolved_utf8_bytes",
    )
    totals = {
        field: sum(scaffold["summary"][field] for scaffold in scaffolds)
        for field in summary_fields
    }
    unresolved_reasons: Counter[str] = Counter()
    missing_roles: list[dict[str, Any]] = []
    dialogue_rows: list[dict[str, Any]] = []
    for scaffold in scaffolds:
        unresolved_reasons.update(
            scaffold["summary"]["unresolved_reason_utf16_counts"]
        )
        missing_roles.extend(
            scaffold["catalog_gap_diagnostics"]["catalog_missing_roles"]
        )
        dialogue_rows.append(
            {
                "dialogue": scaffold["dialogue"],
                "scaffold_sha256": scaffold["scaffold_sha256"],
                **{
                    field: scaffold["summary"][field]
                    for field in summary_fields
                },
                "unresolved_reason_utf16_counts": scaffold["summary"][
                    "unresolved_reason_utf16_counts"
                ],
                "catalog_missing_role_keys": [
                    row["role_key"]
                    for row in scaffold["catalog_gap_diagnostics"][
                        "catalog_missing_roles"
                    ]
                ],
                "catalog_missing_source_attributions": scaffold[
                    "catalog_gap_diagnostics"
                ]["missing_source_attributions"],
            }
        )

    diagnostics: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-corpus-diagnostics",
        "editorial_status": "human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "source_policy": source_policy,
        "input_hashes": {
            "census_sha256": census_sha,
            "characters_sha256": character_sha,
            "importer_sha256": importer_sha,
            "generator_sha256": script_sha,
        },
        "summary": {
            "dialogue_count": len(scaffolds),
            **totals,
            "unresolved_reason_utf16_counts": dict(
                sorted(unresolved_reasons.items())
            ),
            "catalog_missing_role_count": len(missing_roles),
            "catalog_missing_role_keys": sorted(
                {row["role_key"] for row in missing_roles}
            ),
        },
        "catalog_missing_roles": sorted(
            missing_roles, key=lambda row: (row["dialogue"], row["role_key"])
        ),
        "dialogues": dialogue_rows,
    }
    diagnostics["diagnostics_sha256"] = sha256_bytes(canonical_json(diagnostics))
    if sha256_file(SCRIPT_PATH) != script_sha:
        raise TurnAlignmentError("scaffold generator changed while it was running")
    return scaffolds, diagnostics


def _verify_signed_artifact(payload: dict[str, Any], field: str) -> None:
    expected = payload.get(field)
    unsigned = {key: value for key, value in payload.items() if key != field}
    if expected != sha256_bytes(canonical_json(unsigned)):
        raise TurnAlignmentError(f"{field} does not bind scaffold payload")


def _write_json(path: Path, payload: dict[str, Any], *, artifact_root: Path) -> None:
    signature_field = (
        "scaffold_sha256"
        if payload.get("artifact_kind") == "speaker-attribution-scaffold"
        else "diagnostics_sha256"
    )
    _verify_signed_artifact(payload, signature_field)
    destination = _confined_path(artifact_root, path, label="scaffold output")
    if destination.exists() and not destination.is_file():
        raise TurnAlignmentError(f"scaffold output is not a regular file: {destination}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.name}.{os.getpid()}.tmp")
    try:
        temporary.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        os.replace(temporary, destination)
    finally:
        temporary.unlink(missing_ok=True)


def write_scaffolds(
    scaffolds: Sequence[dict[str, Any]],
    diagnostics: dict[str, Any],
    *,
    output_root: Path,
    artifact_root: Path,
) -> None:
    if artifact_root.absolute().name != "scratch":
        raise TurnAlignmentError(
            f"scaffold artifact root must itself be a scratch directory: {artifact_root}"
        )
    root = _confined_path(artifact_root, output_root, label="scaffold output root")
    for scaffold in scaffolds:
        _write_json(
            root / f"{scaffold['dialogue']}.scaffold.json",
            scaffold,
            artifact_root=artifact_root,
        )
    _write_json(
        root / "corpus-diagnostics.json", diagnostics, artifact_root=artifact_root
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dialogues", nargs="*", help="dialogue slugs; defaults to all 27")
    parser.add_argument("--census", type=Path, default=DEFAULT_CENSUS)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--tei-cache", type=Path, default=DEFAULT_TEI_CACHE)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--populate-tei-cache",
        action="store_true",
        help="fetch only missing pinned TEI cache files and verify exact hashes",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="write full scaffolds and diagnostics below scratch only",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        dialogues = args.dialogues or None
        if dialogues and any(SAFE_DIALOGUE.fullmatch(value) is None for value in dialogues):
            raise TurnAlignmentError("dialogue slugs contain unsafe characters")
        scaffolds, diagnostics = build_corpus_scaffolds(
            census_path=args.census,
            characters_path=args.characters,
            raw_root=args.raw_root,
            tei_cache=args.tei_cache,
            artifact_root=args.artifact_root,
            dialogues=dialogues,
            populate_source_cache=args.populate_tei_cache,
        )
        if args.write:
            write_scaffolds(
                scaffolds,
                diagnostics,
                output_root=args.output_root,
                artifact_root=args.artifact_root,
            )
        payload = scaffolds[0] if len(scaffolds) == 1 else diagnostics
        print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except TurnAlignmentError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
