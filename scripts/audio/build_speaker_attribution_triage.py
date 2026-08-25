#!/usr/bin/env python3
"""Build deterministic, scratch-only speaker-attribution review packets.

This consumes schema-v2 speaker-attribution scaffolds.  It preserves every
unresolved scaffold atom, range, and hash, then partitions the atom text into
bounded review fragments.  The result is an editorial queue only: it never
proposes a speaker or character, never accepts an attribution, and its writer
is confined to ``scratch/``.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable, Sequence

from align_canonical_turn_references import (
    DEFAULT_ARTIFACT_ROOT,
    DEFAULT_RAW_ROOT,
    TurnAlignmentError,
    _confined_path,
    _display_path,
    _require_regular_input,
    canonical_json,
    sha256_bytes,
    sha256_file,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_SCAFFOLD_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attributions"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attribution-triage"
SAFE_DIALOGUE = re.compile(r"[a-z0-9][a-z0-9-]*")
SHA256 = re.compile(r"[0-9a-f]{64}")

# These are hard review-surface bounds.  A source atom longer than the text
# bound is losslessly split into child fragments while the exact parent atom
# range and hash remain recorded once in ``source_atoms``.
MAX_PACKET_FRAGMENTS = 24
MAX_PACKET_UTF16_CODE_UNITS = 4_000

LANES = (
    "physical-label-confirmation",
    "true-multi-owner",
    "missing-owner",
    "embedded-dialogue",
    "unattributed-longform",
)
LANE_ORDER = {lane: ordinal for ordinal, lane in enumerate(LANES)}

MISSING_OWNER_REASONS = frozenset(
    {
        "missing_source_attribution",
        "catalog_missing_attribution",
        "ambiguous_catalog_attribution",
    }
)
NEUTRAL_REASONS = frozenset(
    {
        "mixed_boundary_whitespace",
        "structural_separator",
    }
)
STRUCTURAL_MARKER = re.compile(r"\{(?:\d+[a-e]|p|sp\d+|b\d+)\}")
QUOTE_MARKER = re.compile(r"\{(/?)(q|quote)\}")
FORBIDDEN_ASSIGNMENT_KEYS = frozenset(
    {
        "character_id",
        "characterid",
        "candidate_character_ids",
        "speaker",
        "speaker_id",
        "proposed_character",
        "proposed_character_id",
        "proposed_speaker",
        "proposed_speaker_id",
    }
)
SOURCE_EVIDENCE_KEYS = (
    "dom_node_path",
    "contributing_dom_node_paths",
    "dom_text_origin",
    "nearest_said_ordinal",
    "parent_said_ordinal",
    "quote_node_path",
    "quote_depth",
    "said_text_relation",
    "raw_who",
)


def _utf16_length(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


def _utf16_slice(value: str, start: int, end: int) -> str:
    encoded = value.encode("utf-16-le")
    if start < 0 or end <= start or end * 2 > len(encoded):
        raise TurnAlignmentError(f"invalid UTF-16 source range: {start}:{end}")
    try:
        return encoded[start * 2 : end * 2].decode("utf-16-le")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(
            f"UTF-16 source range bisects a surrogate pair: {start}:{end}"
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


def _verify_scaffold(scaffold: dict[str, Any], *, path: Path) -> None:
    expected = scaffold.get("scaffold_sha256")
    unsigned = {
        key: value for key, value in scaffold.items() if key != "scaffold_sha256"
    }
    if expected != sha256_bytes(canonical_json(unsigned)):
        raise TurnAlignmentError(f"scaffold signature mismatch: {path}")
    if scaffold.get("schema_version") != 2:
        raise TurnAlignmentError(f"triage requires schema-v2 scaffold: {path}")
    if scaffold.get("artifact_kind") != "speaker-attribution-scaffold":
        raise TurnAlignmentError(f"unexpected scaffold artifact kind: {path}")
    if scaffold.get("accepted") is not False:
        raise TurnAlignmentError(f"triage refuses accepted scaffold input: {path}")
    if scaffold.get("counts_as_production_attribution") is not False:
        raise TurnAlignmentError(f"triage refuses production attribution input: {path}")


def _balanced_quote_identity(text: str, evidence: dict[str, Any]) -> bool:
    """Require balanced q/quote markers and a stable owning quote path."""

    markers = list(QUOTE_MARKER.finditer(text))
    if not markers or not isinstance(evidence.get("quote_node_path"), str):
        return False
    stack: list[str] = []
    for marker in markers:
        closing, kind = marker.groups()
        if not closing:
            stack.append(kind)
        elif not stack or stack.pop() != kind:
            return False
    return not stack


def classify_neutral_glue(
    text: str, evidence: dict[str, Any]
) -> tuple[bool, str | None]:
    """Name neutral formatting while keeping quote delimiters fail-closed."""

    quote_markers = list(QUOTE_MARKER.finditer(text))
    if quote_markers and not _balanced_quote_identity(text, evidence):
        return False, "unbalanced-or-unidentified-quote-delimiter"

    candidate = QUOTE_MARKER.sub("", text)
    candidate = STRUCTURAL_MARKER.sub("", candidate).strip()
    if not candidate:
        if quote_markers:
            return True, "balanced-quote-delimiters"
        if STRUCTURAL_MARKER.search(text):
            return True, "structural-markers"
        return True, "whitespace"
    if all(
        character.isspace()
        or unicodedata.category(character).startswith(("P", "S"))
        for character in candidate
    ):
        return True, "punctuation"
    return False, None


def _semantic_lane(
    reason: str, evidence: dict[str, Any], *, neutral_glue: bool
) -> str | None:
    if reason == "quoted_or_embedded_markup" or evidence.get("quote_depth", 0):
        return "embedded-dialogue"
    if reason == "multiple_source_attributions":
        return "true-multi-owner"
    if reason in MISSING_OWNER_REASONS:
        return "missing-owner"
    if reason == "contains_nested_said":
        if evidence.get("said_text_relation") == "direct-text":
            return "physical-label-confirmation"
        return "embedded-dialogue"
    if neutral_glue and reason in NEUTRAL_REASONS:
        return None
    return "unattributed-longform"


def _copy_source_evidence(segment: dict[str, Any]) -> dict[str, Any]:
    source = segment.get("source_evidence")
    if not isinstance(source, dict):
        raise TurnAlignmentError(
            f"scaffold atom lacks source_evidence: {segment.get('id')}"
        )
    missing = [
        key
        for key in SOURCE_EVIDENCE_KEYS[:-1]
        if key not in source
    ]
    if missing:
        raise TurnAlignmentError(
            f"scaffold atom lacks DOM provenance {', '.join(missing)}: "
            f"{segment.get('id')}"
        )
    return {key: source[key] for key in SOURCE_EVIDENCE_KEYS if key in source}


def _inherit_neutral_lanes(
    atoms: list[dict[str, Any]], segment_ordinals: dict[str, int]
) -> None:
    """Attach glue only across adjacent unresolved scaffold atoms."""

    for index, atom in enumerate(atoms):
        if atom["lane"] is not None:
            continue
        candidates: list[tuple[int, str]] = []
        for neighbor_index in (index - 1, index + 1):
            if not (0 <= neighbor_index < len(atoms)):
                continue
            neighbor = atoms[neighbor_index]
            if neighbor["lane"] is None:
                continue
            ordinal_gap = abs(
                segment_ordinals[neighbor["source_atom_id"]]
                - segment_ordinals[atom["source_atom_id"]]
            )
            if ordinal_gap == 1:
                candidates.append((neighbor_index, neighbor["lane"]))
        if candidates:
            # Prefer preceding context on a tie.  This changes only the review
            # lane, never the source evidence or an attribution.
            candidates.sort(key=lambda value: (abs(value[0] - index), value[0] > index))
            atom["lane"] = candidates[0][1]
        else:
            atom["lane"] = "unattributed-longform"


def _split_text(
    text: str, *, absolute_start: int
) -> list[tuple[int, int, str]]:
    fragments: list[tuple[int, int, str]] = []
    start = absolute_start
    current: list[str] = []
    current_units = 0
    for character in text:
        units = _utf16_length(character)
        if current and current_units + units > MAX_PACKET_UTF16_CODE_UNITS:
            fragment = "".join(current)
            fragments.append((start, start + current_units, fragment))
            start += current_units
            current = []
            current_units = 0
        current.append(character)
        current_units += units
    if current:
        fragment = "".join(current)
        fragments.append((start, start + current_units, fragment))
    return fragments


def _packetize(
    dialogue: str,
    atoms: list[dict[str, Any]],
    atom_text: dict[str, str],
) -> list[dict[str, Any]]:
    by_lane: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for atom in atoms:
        atom_id = atom["source_atom_id"]
        pieces = _split_text(atom_text[atom_id], absolute_start=atom["start_char"])
        reconstructed = "".join(piece[2] for piece in pieces)
        if sha256_bytes(reconstructed.encode("utf-8")) != atom["text_sha256"]:
            raise TurnAlignmentError(f"triage fragment drift for {atom_id}")
        for ordinal, (start, end, text) in enumerate(pieces, start=1):
            by_lane[atom["lane"]].append(
                {
                    "source_atom_id": atom_id,
                    "fragment_ordinal": ordinal,
                    "fragment_count": len(pieces),
                    "start_char": start,
                    "end_char": end,
                    "utf16_code_units": end - start,
                    "text_sha256": sha256_bytes(text.encode("utf-8")),
                    "text": text,
                }
            )

    packets: list[dict[str, Any]] = []
    for lane in LANES:
        fragments = sorted(
            by_lane.get(lane, []),
            key=lambda row: (
                row["start_char"],
                row["end_char"],
                row["source_atom_id"],
                row["fragment_ordinal"],
            ),
        )
        lane_packets: list[list[dict[str, Any]]] = []
        current: list[dict[str, Any]] = []
        current_units = 0
        for fragment in fragments:
            would_overflow = current and (
                len(current) >= MAX_PACKET_FRAGMENTS
                or current_units + fragment["utf16_code_units"]
                > MAX_PACKET_UTF16_CODE_UNITS
            )
            if would_overflow:
                lane_packets.append(current)
                current = []
                current_units = 0
            current.append(fragment)
            current_units += fragment["utf16_code_units"]
        if current:
            lane_packets.append(current)

        for ordinal, fragments_in_packet in enumerate(lane_packets, start=1):
            packet: dict[str, Any] = {
                "packet_id": f"{dialogue}-{lane}-{ordinal:04d}",
                "lane": lane,
                "editorial_status": "human-review-required",
                "accepted": False,
                "fragment_count": len(fragments_in_packet),
                "utf16_code_units": sum(
                    fragment["utf16_code_units"]
                    for fragment in fragments_in_packet
                ),
                "bounding_start_char": min(
                    fragment["start_char"] for fragment in fragments_in_packet
                ),
                "bounding_end_char": max(
                    fragment["end_char"] for fragment in fragments_in_packet
                ),
                "fragments": fragments_in_packet,
            }
            if packet["fragment_count"] > MAX_PACKET_FRAGMENTS:
                raise TurnAlignmentError("triage packet fragment bound exceeded")
            if packet["utf16_code_units"] > MAX_PACKET_UTF16_CODE_UNITS:
                raise TurnAlignmentError("triage packet text bound exceeded")
            packet["packet_sha256"] = sha256_bytes(canonical_json(packet))
            packets.append(packet)
    return packets


def _assert_no_assignment_fields(value: Any) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            if key.casefold() in FORBIDDEN_ASSIGNMENT_KEYS:
                raise TurnAlignmentError(
                    f"triage artifact contains forbidden assignment field: {key}"
                )
            _assert_no_assignment_fields(child)
    elif isinstance(value, list):
        for child in value:
            _assert_no_assignment_fields(child)


def build_dialogue_triage(
    scaffold: dict[str, Any],
    *,
    scaffold_file_sha256: str,
    raw_path: Path,
) -> dict[str, Any]:
    dialogue = scaffold.get("dialogue")
    if not isinstance(dialogue, str) or SAFE_DIALOGUE.fullmatch(dialogue) is None:
        raise TurnAlignmentError("scaffold has unsafe dialogue slug")
    _require_regular_input(raw_path, label="canonical English rendering")
    raw_bytes = raw_path.read_bytes()
    try:
        raw_text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(
            f"canonical English is not UTF-8 for {dialogue}: {error}"
        ) from error
    raw_sha = sha256_bytes(raw_bytes)
    source = scaffold.get("source")
    if not isinstance(source, dict) or source.get("english_sha256") != raw_sha:
        raise TurnAlignmentError(f"stale scaffold English hash for {dialogue}")
    if source.get("english_utf16_code_units") != _utf16_length(raw_text):
        raise TurnAlignmentError(f"stale scaffold English length for {dialogue}")

    segments = scaffold.get("segments")
    if not isinstance(segments, list) or not segments:
        raise TurnAlignmentError(f"scaffold segments missing for {dialogue}")
    expected_start = 0
    atoms: list[dict[str, Any]] = []
    atom_text: dict[str, str] = {}
    segment_ordinals: dict[str, int] = {}
    for segment_ordinal, segment in enumerate(segments, start=1):
        if not isinstance(segment, dict):
            raise TurnAlignmentError(f"invalid scaffold segment for {dialogue}")
        start = segment.get("start_char")
        end = segment.get("end_char")
        if not isinstance(start, int) or not isinstance(end, int):
            raise TurnAlignmentError(f"invalid scaffold range for {dialogue}")
        if start != expected_start or end <= start:
            raise TurnAlignmentError(f"non-gapless scaffold for {dialogue}")
        text = _utf16_slice(raw_text, start, end)
        text_sha = sha256_bytes(text.encode("utf-8"))
        if segment.get("text_sha256") != text_sha:
            raise TurnAlignmentError(
                f"scaffold text hash mismatch for {dialogue}:{segment.get('id')}"
            )
        expected_start = end
        if segment.get("status") != "unresolved":
            continue
        atom_id = segment.get("id")
        reason = segment.get("unresolved_reason")
        if not isinstance(atom_id, str) or not isinstance(reason, str):
            raise TurnAlignmentError(f"invalid unresolved atom for {dialogue}")
        evidence = _copy_source_evidence(segment)
        neutral, neutral_reason = classify_neutral_glue(text, evidence)
        atom: dict[str, Any] = {
            "source_atom_id": atom_id,
            "start_char": start,
            "end_char": end,
            "utf16_code_units": end - start,
            "code_points": len(text),
            "utf8_bytes": len(text.encode("utf-8")),
            "text_sha256": text_sha,
            "unresolved_reason": reason,
            "neutral_glue": neutral,
            "neutral_glue_reason": neutral_reason,
            "lane": _semantic_lane(reason, evidence, neutral_glue=neutral),
            "source_evidence": evidence,
        }
        atoms.append(atom)
        atom_text[atom_id] = text
        segment_ordinals[atom_id] = segment_ordinal
    if expected_start != _utf16_length(raw_text):
        raise TurnAlignmentError(f"scaffold does not cover English for {dialogue}")

    _inherit_neutral_lanes(atoms, segment_ordinals)
    if any(atom["lane"] not in LANE_ORDER for atom in atoms):
        raise TurnAlignmentError(f"unclassified triage atom for {dialogue}")
    packets = _packetize(dialogue, atoms, atom_text)

    represented_atom_ids = {
        fragment["source_atom_id"]
        for packet in packets
        for fragment in packet["fragments"]
    }
    expected_atom_ids = {atom["source_atom_id"] for atom in atoms}
    if represented_atom_ids != expected_atom_ids:
        raise TurnAlignmentError(f"triage packets omit unresolved atoms for {dialogue}")

    lane_atom_counts = Counter(atom["lane"] for atom in atoms)
    lane_utf16_counts = Counter(
        {lane: 0 for lane in LANES}
    )
    for atom in atoms:
        lane_utf16_counts[atom["lane"]] += atom["utf16_code_units"]
    triage: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-triage",
        "editorial_status": "human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": dialogue,
        "source": {
            "english_path": _display_path(raw_path),
            "english_sha256": raw_sha,
            "english_utf16_code_units": _utf16_length(raw_text),
        },
        "input_hashes": {
            "scaffold_sha256": scaffold["scaffold_sha256"],
            "scaffold_file_sha256": scaffold_file_sha256,
            "generator_sha256": sha256_file(SCRIPT_PATH),
        },
        "policy": {
            "offset_unit": "UTF-16 code units",
            "contains_proposed_speaker_or_character_assignment": False,
            "may_be_promoted_to_audio_speaker_attributions": False,
            "source_atom_preservation": (
                "Every unresolved scaffold atom, exact range, and text SHA-256 "
                "appears once in source_atoms; packet fragments losslessly cover it."
            ),
            "quote_delimiter_rule": (
                "q/quote delimiters are not neutral glue unless balanced and bound "
                "to a stable quote_node_path; delimiters are never discarded."
            ),
            "packet_bounds": {
                "max_fragments": MAX_PACKET_FRAGMENTS,
                "max_utf16_code_units": MAX_PACKET_UTF16_CODE_UNITS,
            },
            "required_editorial_action": (
                "Review source evidence and create a separate accepted attribution "
                "plan manually; this queue cannot supply an assignment."
            ),
        },
        "summary": {
            "unresolved_source_atom_count": len(atoms),
            "unresolved_utf16_code_units": sum(
                atom["utf16_code_units"] for atom in atoms
            ),
            "neutral_glue_atom_count": sum(atom["neutral_glue"] for atom in atoms),
            "packet_count": len(packets),
            "lane_source_atom_counts": {
                lane: lane_atom_counts[lane] for lane in LANES
            },
            "lane_utf16_code_unit_counts": {
                lane: lane_utf16_counts[lane] for lane in LANES
            },
        },
        "source_atoms": atoms,
        "packets": packets,
    }
    _assert_no_assignment_fields(triage)
    triage["triage_sha256"] = sha256_bytes(canonical_json(triage))
    return triage


def build_corpus_triage(
    *,
    scaffold_root: Path = DEFAULT_SCAFFOLD_ROOT,
    raw_root: Path = DEFAULT_RAW_ROOT,
    dialogues: Sequence[str] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    generator_sha = sha256_file(SCRIPT_PATH)
    if dialogues is None:
        requested = sorted(
            path.name.removesuffix(".scaffold.json")
            for path in scaffold_root.glob("*.scaffold.json")
        )
    else:
        requested = sorted(dialogues)
    if not requested:
        raise TurnAlignmentError(f"no scaffold inputs found under {scaffold_root}")
    if any(SAFE_DIALOGUE.fullmatch(dialogue) is None for dialogue in requested):
        raise TurnAlignmentError("dialogue slugs contain unsafe characters")

    triages: list[dict[str, Any]] = []
    for dialogue in requested:
        scaffold_path = scaffold_root / f"{dialogue}.scaffold.json"
        scaffold, scaffold_file_sha = _read_json(
            scaffold_path, label="speaker-attribution scaffold"
        )
        _verify_scaffold(scaffold, path=scaffold_path)
        if scaffold.get("dialogue") != dialogue:
            raise TurnAlignmentError(f"scaffold filename/dialogue mismatch: {scaffold_path}")
        triages.append(
            build_dialogue_triage(
                scaffold,
                scaffold_file_sha256=scaffold_file_sha,
                raw_path=raw_root / f"{dialogue}.txt",
            )
        )

    lane_atoms: Counter[str] = Counter()
    lane_utf16: Counter[str] = Counter()
    rows: list[dict[str, Any]] = []
    for triage in triages:
        lane_atoms.update(triage["summary"]["lane_source_atom_counts"])
        lane_utf16.update(triage["summary"]["lane_utf16_code_unit_counts"])
        rows.append(
            {
                "dialogue": triage["dialogue"],
                "triage_sha256": triage["triage_sha256"],
                **triage["summary"],
            }
        )
    corpus: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "speaker-attribution-triage-corpus",
        "editorial_status": "human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "policy": {
            "contains_proposed_speaker_or_character_assignment": False,
            "may_be_promoted_to_audio_speaker_attributions": False,
            "lanes": list(LANES),
            "packet_bounds": {
                "max_fragments": MAX_PACKET_FRAGMENTS,
                "max_utf16_code_units": MAX_PACKET_UTF16_CODE_UNITS,
            },
        },
        "input_hashes": {"generator_sha256": generator_sha},
        "summary": {
            "dialogue_count": len(triages),
            "unresolved_source_atom_count": sum(
                triage["summary"]["unresolved_source_atom_count"]
                for triage in triages
            ),
            "unresolved_utf16_code_units": sum(
                triage["summary"]["unresolved_utf16_code_units"]
                for triage in triages
            ),
            "packet_count": sum(
                triage["summary"]["packet_count"] for triage in triages
            ),
            "lane_source_atom_counts": {
                lane: lane_atoms[lane] for lane in LANES
            },
            "lane_utf16_code_unit_counts": {
                lane: lane_utf16[lane] for lane in LANES
            },
        },
        "dialogues": rows,
    }
    _assert_no_assignment_fields(corpus)
    corpus["corpus_triage_sha256"] = sha256_bytes(canonical_json(corpus))
    if sha256_file(SCRIPT_PATH) != generator_sha:
        raise TurnAlignmentError("triage generator changed while it was running")
    return triages, corpus


def _verify_signed_artifact(payload: dict[str, Any], field: str) -> None:
    expected = payload.get(field)
    unsigned = {key: value for key, value in payload.items() if key != field}
    if expected != sha256_bytes(canonical_json(unsigned)):
        raise TurnAlignmentError(f"{field} does not bind triage payload")


def _write_json(
    path: Path,
    payload: dict[str, Any],
    *,
    signature_field: str,
    artifact_root: Path,
) -> None:
    _verify_signed_artifact(payload, signature_field)
    _assert_no_assignment_fields(payload)
    destination = _confined_path(artifact_root, path, label="triage output")
    if destination.exists() and not destination.is_file():
        raise TurnAlignmentError(f"triage output is not a regular file: {destination}")
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


def write_triage(
    triages: Iterable[dict[str, Any]],
    corpus: dict[str, Any],
    *,
    output_root: Path,
    artifact_root: Path,
) -> None:
    if artifact_root.absolute().name != "scratch":
        raise TurnAlignmentError(
            f"triage artifact root must itself be a scratch directory: {artifact_root}"
        )
    root = _confined_path(artifact_root, output_root, label="triage output root")
    for triage in triages:
        _write_json(
            root / f"{triage['dialogue']}.triage.json",
            triage,
            signature_field="triage_sha256",
            artifact_root=artifact_root,
        )
    _write_json(
        root / "corpus-triage.json",
        corpus,
        signature_field="corpus_triage_sha256",
        artifact_root=artifact_root,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dialogues", nargs="*", help="dialogue slugs; defaults to all scaffolds")
    parser.add_argument("--scaffold-root", type=Path, default=DEFAULT_SCAFFOLD_ROOT)
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument(
        "--write",
        action="store_true",
        help="write review packets below scratch only",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        triages, corpus = build_corpus_triage(
            scaffold_root=args.scaffold_root,
            raw_root=args.raw_root,
            dialogues=args.dialogues or None,
        )
        if args.write:
            write_triage(
                triages,
                corpus,
                output_root=args.output_root,
                artifact_root=args.artifact_root,
            )
        payload = triages[0] if len(triages) == 1 else corpus
        print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except TurnAlignmentError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
