#!/usr/bin/env python3
"""Derive scratch-only gapless speaker drafts from canonical TEI scaffolds.

The derivation implements the edition's mechanical voice rule only. Explicit
top-level leaf ``<said who>`` spans retain their canonical voice owner, including the two
pinned TEI labels whose space-bearing ``who`` values resolve as one exact
catalog attribution. Every explicitly attributed or ownerless nested/reported
span inherits its active enclosing source speaker when the DOM ordinal chain
proves exactly one owner. Narration, structural glue, genuine multi-owner
spans, and every other ambiguity remain explicit unresolved ranges. These
artifacts are drafts, never accepted production attribution plans.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any, Sequence

from align_canonical_turn_references import (
    DEFAULT_ARTIFACT_ROOT,
    TurnAlignmentError,
    _confined_path,
    _require_regular_input,
    canonical_json,
    sha256_bytes,
    sha256_file,
)
from build_speaker_attribution_triage import _utf16_slice, _verify_scaffold


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_CHARACTERS = REPO_ROOT / "audio" / "characters.json"
DEFAULT_SCAFFOLD_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attributions"
DEFAULT_RAW_ROOT = REPO_ROOT / "raw" / "plato" / "english"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attribution-drafts"
SCAFFOLD_GENERATOR = REPO_ROOT / "scripts" / "audio" / "scaffold_speaker_attributions.py"
SAFE_DIALOGUE = re.compile(r"[a-z0-9][a-z0-9-]*")
INHERITABLE_REASONS = frozenset(
    {
        "contains_nested_said",
        "missing_source_attribution",
        "quoted_or_embedded_markup",
    }
)


def _read_json(path: Path, *, label: str) -> tuple[dict[str, Any], str]:
    _require_regular_input(path, label=label)
    raw = path.read_bytes()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as error:
        raise TurnAlignmentError(f"invalid {label} {path}: {error}") from error
    if not isinstance(payload, dict):
        raise TurnAlignmentError(f"{label} must be an object: {path}")
    return payload, sha256_bytes(raw)


def _display_path(path: Path, *, repo_root: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError:
        return str(path.resolve())


def _catalog_owners(
    payload: dict[str, Any],
) -> tuple[dict[str, set[str]], dict[str, set[str]], tuple[str, ...]]:
    if (
        payload.get("schemaVersion") != 3
        or payload.get("status") != "complete"
        or not isinstance(payload.get("dialogues"), list)
        or not isinstance(payload.get("characters"), list)
    ):
        raise TurnAlignmentError("structural drafts require complete CharacterCatalog v3")
    dialogue_ids = tuple(
        sorted(
            row["dialogue"]
            for row in payload["dialogues"]
            if isinstance(row, dict) and isinstance(row.get("dialogue"), str)
        )
    )
    if len(dialogue_ids) != len(payload["dialogues"]) or len(set(dialogue_ids)) != len(dialogue_ids):
        raise TurnAlignmentError("character catalog dialogue inventory is malformed")
    owners: dict[str, set[str]] = {dialogue: set() for dialogue in dialogue_ids}
    reported_source_speakers: dict[str, set[str]] = {
        dialogue: set() for dialogue in dialogue_ids
    }
    seen: set[str] = set()
    for character in payload["characters"]:
        character_id = character.get("characterId") if isinstance(character, dict) else None
        if not isinstance(character_id, str) or character_id in seen:
            raise TurnAlignmentError("character catalog IDs must be unique strings")
        seen.add(character_id)
        if character.get("identityStatus") != "resolved":
            continue
        for appearance in character.get("appearances", []):
            if not isinstance(appearance, dict):
                continue
            dialogue = appearance.get("dialogue")
            if (
                dialogue not in owners
                or appearance.get("editorialStatus") != "resolved"
                or "source-speaker" not in appearance.get("roleFlags", [])
            ):
                continue
            if appearance.get("performanceRole") == "voice-owner":
                owners[dialogue].add(character_id)
            elif appearance.get("performanceRole") == "reported-only":
                reported_source_speakers[dialogue].add(character_id)
    return owners, reported_source_speakers, dialogue_ids


def _verify_partition(
    scaffold: dict[str, Any], *, scaffold_path: Path, raw_path: Path
) -> tuple[str, list[dict[str, Any]]]:
    _verify_scaffold(scaffold, path=scaffold_path)
    raw = raw_path.read_bytes()
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(f"canonical English is not UTF-8: {raw_path}") from error
    source = scaffold.get("source")
    segments = scaffold.get("segments")
    if (
        not isinstance(source, dict)
        or source.get("english_sha256") != sha256_bytes(raw)
        or source.get("english_utf16_code_units")
        != len(text.encode("utf-16-le")) // 2
        or not isinstance(segments, list)
        or not segments
    ):
        raise TurnAlignmentError(f"scaffold source binding is stale: {scaffold_path}")
    expected_start = 0
    for segment in segments:
        start = segment.get("start_char")
        end = segment.get("end_char")
        if (
            not isinstance(start, int)
            or not isinstance(end, int)
            or start != expected_start
            or end <= start
        ):
            raise TurnAlignmentError(f"scaffold is not gapless: {scaffold_path}")
        atom = _utf16_slice(text, start, end)
        if (
            segment.get("utf16_code_units") != end - start
            or segment.get("text_sha256") != sha256_bytes(atom.encode("utf-8"))
        ):
            raise TurnAlignmentError(f"scaffold segment hash/range mismatch: {segment.get('id')}")
        expected_start = end
    if expected_start != source["english_utf16_code_units"]:
        raise TurnAlignmentError(f"scaffold does not cover canonical English: {scaffold_path}")
    return text, segments


def _ordinal_ownership(
    segments: list[dict[str, Any]],
    *,
    source_owners: set[str],
    reported_source_speakers: set[str],
) -> tuple[dict[int, str], dict[int, int]]:
    explicit: dict[int, str] = {}
    parents: dict[int, int] = {}
    inherited_reported: dict[int, tuple[str, int]] = {}
    for segment in segments:
        evidence = segment.get("source_evidence")
        if not isinstance(evidence, dict):
            raise TurnAlignmentError(f"segment lacks source evidence: {segment.get('id')}")
        ordinal = evidence.get("nearest_said_ordinal")
        parent = evidence.get("parent_said_ordinal")
        if ordinal is not None and not isinstance(ordinal, int):
            raise TurnAlignmentError(f"invalid said ordinal: {segment.get('id')}")
        if parent is not None and not isinstance(parent, int):
            raise TurnAlignmentError(f"invalid parent said ordinal: {segment.get('id')}")
        if isinstance(ordinal, int) and isinstance(parent, int):
            prior = parents.setdefault(ordinal, parent)
            if prior != parent:
                raise TurnAlignmentError(f"conflicting parent said ordinal: {ordinal}")
        candidates = evidence.get("candidate_character_ids", [])
        if candidates is None:
            candidates = []
        if not isinstance(candidates, list) or any(not isinstance(value, str) for value in candidates):
            raise TurnAlignmentError(f"invalid candidate owners: {segment.get('id')}")
        unique = set(candidates)
        if len(unique) == 1 and isinstance(ordinal, int):
            owner = next(iter(unique))
            if owner in source_owners:
                prior_owner = explicit.setdefault(ordinal, owner)
                if prior_owner != owner:
                    raise TurnAlignmentError(
                        f"conflicting explicit owners for said ordinal {ordinal}"
                    )
            elif owner in reported_source_speakers:
                if not isinstance(parent, int):
                    raise TurnAlignmentError(
                        f"top-level reported-only character {owner!r} cannot own source audio"
                    )
                prior_reported = inherited_reported.setdefault(ordinal, (owner, parent))
                if prior_reported != (owner, parent):
                    raise TurnAlignmentError(
                        f"conflicting reported-only evidence for said ordinal {ordinal}"
                    )
            else:
                raise TurnAlignmentError(
                    f"source evidence selects non-owning character {owner!r}"
                )
    for ordinal, (reported_character, parent) in inherited_reported.items():
        active_owner = _resolve_ordinal_owner(parent, explicit=explicit, parents=parents)
        if active_owner is None:
            raise TurnAlignmentError(
                "reported-only character "
                f"{reported_character!r} at said ordinal {ordinal} lacks a uniquely proven "
                "enclosing voice-owner"
            )
    return explicit, parents


def _resolve_ordinal_owner(
    ordinal: int,
    *,
    explicit: dict[int, str],
    parents: dict[int, int],
    stack: tuple[int, ...] = (),
) -> str | None:
    if ordinal in stack:
        raise TurnAlignmentError(f"cyclic nested said ancestry at ordinal {ordinal}")
    if ordinal in explicit:
        return explicit[ordinal]
    parent = parents.get(ordinal)
    if parent is None:
        return None
    return _resolve_ordinal_owner(
        parent, explicit=explicit, parents=parents, stack=(*stack, ordinal)
    )


def build_dialogue_draft(
    scaffold: dict[str, Any],
    *,
    scaffold_path: Path,
    scaffold_file_sha256: str,
    raw_path: Path,
    character_path: Path,
    character_sha256: str,
    source_owners: set[str],
    reported_source_speakers: set[str],
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    dialogue = scaffold.get("dialogue")
    if not isinstance(dialogue, str) or not SAFE_DIALOGUE.fullmatch(dialogue):
        raise TurnAlignmentError(f"invalid scaffold dialogue: {scaffold_path}")
    input_hashes = scaffold.get("input_hashes")
    if (
        not isinstance(input_hashes, dict)
        or input_hashes.get("characters_sha256") != character_sha256
        or input_hashes.get("generator_sha256") != sha256_file(SCAFFOLD_GENERATOR)
    ):
        raise TurnAlignmentError(
            f"scaffold is stale against CharacterCatalog or generator: {scaffold_path}"
        )
    _, segments = _verify_partition(scaffold, scaffold_path=scaffold_path, raw_path=raw_path)
    explicit, parents = _ordinal_ownership(
        segments,
        source_owners=source_owners,
        reported_source_speakers=reported_source_speakers,
    )
    rows: list[dict[str, Any]] = []
    basis_counts: Counter[str] = Counter()
    unresolved_counts: Counter[str] = Counter()
    prior_assigned = inherited = assigned_units = unresolved_units = 0
    for ordinal, segment in enumerate(segments, start=1):
        units = segment["end_char"] - segment["start_char"]
        owner: str | None = None
        basis: str | None = None
        evidence = segment["source_evidence"]
        parent = evidence.get("parent_said_ordinal")
        if isinstance(parent, int):
            owner = _resolve_ordinal_owner(parent, explicit=explicit, parents=parents)
            if owner is not None:
                basis = "reported-speech-inherits-active-source-speaker"
                inherited += units
                if segment.get("status") == "assigned":
                    prior_assigned += units
        if owner is None and segment.get("status") == "assigned":
            owner = segment.get("character_id")
            if owner not in source_owners:
                raise TurnAlignmentError(
                    f"assigned scaffold owner is not an active source voice owner: {owner}"
                )
            nearest = evidence.get("nearest_said_ordinal")
            if not isinstance(nearest, int) or explicit.get(nearest) != owner:
                raise TurnAlignmentError(f"assigned leaf lacks unique explicit owner: {segment.get('id')}")
            basis = "explicit-leaf-source-speaker"
            prior_assigned += units
        elif owner is None and segment.get("status") == "unresolved":
            reason = segment.get("unresolved_reason")
            nearest = evidence.get("nearest_said_ordinal")
            candidates = set(evidence.get("candidate_character_ids", []))
            if (
                reason == "multiple_source_attributions"
                and len(candidates) == 1
                and isinstance(nearest, int)
                and explicit.get(nearest) in candidates
            ):
                owner = next(iter(candidates))
                basis = "exact-catalog-owner-for-space-bearing-source-who"
                inherited += units
            elif reason in INHERITABLE_REASONS and isinstance(nearest, int):
                owner = _resolve_ordinal_owner(nearest, explicit=explicit, parents=parents)
                if owner is not None:
                    if reason == "contains_nested_said":
                        basis = "explicit-enclosing-source-speaker-around-nested-said"
                    else:
                        basis = "reported-speech-inherits-active-source-speaker"
                    inherited += units
            if owner is None:
                if not isinstance(reason, str):
                    raise TurnAlignmentError(f"unresolved segment lacks reason: {segment.get('id')}")
                unresolved_counts[reason] += units
        elif owner is None:
            raise TurnAlignmentError(f"invalid scaffold segment status: {segment.get('id')}")

        row: dict[str, Any] = {
            "id": f"draft-{ordinal:06d}",
            "source_segment_id": segment["id"],
            "start_char": segment["start_char"],
            "end_char": segment["end_char"],
            "text_sha256": segment["text_sha256"],
            "utf16_code_units": units,
            "source_evidence": segment["source_evidence"],
        }
        if owner is not None and basis is not None:
            row.update(
                {
                    "status": "assigned",
                    "character_id": owner,
                    "assignment_basis": basis,
                }
            )
            assigned_units += units
            basis_counts[basis] += units
        else:
            row.update(
                {
                    "status": "unresolved",
                    "unresolved_reason": segment["unresolved_reason"],
                }
            )
            unresolved_units += units
        rows.append(row)

    total = scaffold["source"]["english_utf16_code_units"]
    if assigned_units + unresolved_units != total:
        raise TurnAlignmentError(f"draft accounting is not gapless for {dialogue}")
    draft: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "structurally-proven-speaker-attribution-draft",
        "editorial_status": "mechanical-draft-human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "dialogue": dialogue,
        "source": {
            "english_path": scaffold["source"]["english_path"],
            "english_sha256": scaffold["source"]["english_sha256"],
            "english_utf16_code_units": total,
            "scaffold_path": _display_path(scaffold_path, repo_root=repo_root),
            "scaffold_file_sha256": scaffold_file_sha256,
            "scaffold_sha256": scaffold["scaffold_sha256"],
            "characters_path": _display_path(character_path, repo_root=repo_root),
            "characters_sha256": character_sha256,
        },
        "policy": {
            "voice_ownership": "one-voice-per-character",
            "reported_speech": "inherit-active-character",
            "offset_unit": "UTF-16 code units",
            "assignments": (
                "explicit unique source-speaker leaf spans plus ownerless nested/quoted "
                "spans and explicitly attributed reported spans with a unique enclosing "
                "source-speaker ordinal chain, plus exact "
                "catalog matches for pinned space-bearing source who values"
            ),
            "narration_or_framing_assigned": False,
            "human_acceptance_claimed": False,
            "production_write_allowed": False,
        },
        "summary": {
            "source_utf16_code_units": total,
            "prior_assigned_utf16_code_units": prior_assigned,
            "structurally_inherited_utf16_code_units": inherited,
            "assigned_utf16_code_units": assigned_units,
            "unresolved_utf16_code_units": unresolved_units,
            "assigned_coverage": assigned_units / total if total else 0,
            "coverage_delta": inherited / total if total else 0,
            "assignment_basis_utf16_counts": dict(sorted(basis_counts.items())),
            "unresolved_reason_utf16_counts": dict(sorted(unresolved_counts.items())),
            "segment_count": len(rows),
            "assigned_segment_count": sum(row["status"] == "assigned" for row in rows),
            "unresolved_segment_count": sum(row["status"] == "unresolved" for row in rows),
        },
        "segments": rows,
    }
    draft["draft_sha256"] = sha256_bytes(canonical_json(draft))
    return draft


def build_corpus_drafts(
    *,
    characters_path: Path = DEFAULT_CHARACTERS,
    scaffold_root: Path = DEFAULT_SCAFFOLD_ROOT,
    raw_root: Path = DEFAULT_RAW_ROOT,
    repo_root: Path = REPO_ROOT,
    dialogues: Sequence[str] | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    script_sha = sha256_file(SCRIPT_PATH)
    characters, character_sha = _read_json(characters_path, label="character catalog")
    owners, reported_source_speakers, catalog_dialogues = _catalog_owners(characters)
    selected = tuple(sorted(dialogues or catalog_dialogues))
    if len(set(selected)) != len(selected) or any(dialogue not in owners for dialogue in selected):
        raise TurnAlignmentError("requested dialogue inventory is unknown or duplicated")
    drafts: list[dict[str, Any]] = []
    scaffold_inventory: list[dict[str, str]] = []
    for dialogue in selected:
        scaffold_path = scaffold_root / f"{dialogue}.scaffold.json"
        scaffold, scaffold_file_sha = _read_json(scaffold_path, label="speaker scaffold")
        if scaffold.get("dialogue") != dialogue:
            raise TurnAlignmentError(f"scaffold dialogue mismatch: {scaffold_path}")
        raw_path = raw_root / f"{dialogue}.txt"
        draft = build_dialogue_draft(
            scaffold,
            scaffold_path=scaffold_path,
            scaffold_file_sha256=scaffold_file_sha,
            raw_path=raw_path,
            character_path=characters_path,
            character_sha256=character_sha,
            source_owners=owners[dialogue],
            reported_source_speakers=reported_source_speakers[dialogue],
            repo_root=repo_root,
        )
        drafts.append(draft)
        scaffold_inventory.append(
            {
                "dialogue": dialogue,
                "path": _display_path(scaffold_path, repo_root=repo_root),
                "file_sha256": scaffold_file_sha,
                "scaffold_sha256": scaffold["scaffold_sha256"],
            }
        )
    fields = (
        "source_utf16_code_units",
        "prior_assigned_utf16_code_units",
        "structurally_inherited_utf16_code_units",
        "assigned_utf16_code_units",
        "unresolved_utf16_code_units",
        "segment_count",
        "assigned_segment_count",
        "unresolved_segment_count",
    )
    totals = {
        field: sum(draft["summary"][field] for draft in drafts) for field in fields
    }
    unresolved: Counter[str] = Counter()
    bases: Counter[str] = Counter()
    for draft in drafts:
        unresolved.update(draft["summary"]["unresolved_reason_utf16_counts"])
        bases.update(draft["summary"]["assignment_basis_utf16_counts"])
    total = totals["source_utf16_code_units"]
    matrix: dict[str, Any] = {
        "schema_version": 1,
        "artifact_kind": "structural-speaker-draft-status-matrix",
        "editorial_status": "mechanical-draft-human-review-required",
        "accepted": False,
        "counts_as_production_attribution": False,
        "input_hashes": {
            "characters_sha256": character_sha,
            "generator_sha256": script_sha,
            "scaffolds": scaffold_inventory,
        },
        "policy": {
            "voice_ownership": "one-voice-per-character",
            "reported_speech": "inherit-active-character",
            "human_acceptance_claimed": False,
            "production_write_allowed": False,
        },
        "summary": {
            "dialogue_count": len(drafts),
            **totals,
            "assigned_coverage": totals["assigned_utf16_code_units"] / total if total else 0,
            "prior_assigned_coverage": totals["prior_assigned_utf16_code_units"] / total if total else 0,
            "coverage_delta": totals["structurally_inherited_utf16_code_units"] / total if total else 0,
            "assignment_basis_utf16_counts": dict(sorted(bases.items())),
            "unresolved_reason_utf16_counts": dict(sorted(unresolved.items())),
        },
        "dialogues": [
            {"dialogue": draft["dialogue"], "draft_sha256": draft["draft_sha256"], **draft["summary"]}
            for draft in drafts
        ],
    }
    matrix["matrix_sha256"] = sha256_bytes(canonical_json(matrix))
    if sha256_file(SCRIPT_PATH) != script_sha:
        raise TurnAlignmentError("structural draft generator changed while running")
    return drafts, matrix


def _write_json(path: Path, value: dict[str, Any], *, artifact_root: Path) -> None:
    destination = _confined_path(artifact_root, path, label="structural draft output")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(destination)


def write_corpus_drafts(
    drafts: list[dict[str, Any]],
    matrix: dict[str, Any],
    *,
    output_root: Path = DEFAULT_OUTPUT_ROOT,
    artifact_root: Path = DEFAULT_ARTIFACT_ROOT,
) -> None:
    root = _confined_path(artifact_root, output_root, label="structural draft root")
    for draft in drafts:
        _write_json(root / f"{draft['dialogue']}.draft.json", draft, artifact_root=artifact_root)
    _write_json(root / "status-matrix.json", matrix, artifact_root=artifact_root)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--scaffold-root", type=Path, default=DEFAULT_SCAFFOLD_ROOT)
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--dialogue", action="append")
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        drafts, matrix = build_corpus_drafts(
            characters_path=args.characters,
            scaffold_root=args.scaffold_root,
            raw_root=args.raw_root,
            dialogues=args.dialogue,
        )
        if args.write:
            write_corpus_drafts(drafts, matrix, output_root=args.output_root)
    except TurnAlignmentError as error:
        raise SystemExit(str(error)) from error
    print(json.dumps(matrix, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
