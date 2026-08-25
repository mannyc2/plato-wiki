#!/usr/bin/env python3
"""Accept deterministic corpus speaker plans under the operator-authorized policy.

The accepted plans preserve the edition rule that reported speech inherits the
active character. They consume the gapless structural drafts, resolve source
titles to the commentary narrator, assign the Apology's unwrapped defence to
Socrates except for its pinned live replies by Meletus, attach source-only
markup to the following proven turn, and reduce the one genuine two-speaker
chorus in Euthydemus to the first source-listed speaker. No listening or model
judgment is involved.
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
    TurnAlignmentError,
    canonical_json,
    sha256_bytes,
    sha256_file,
)
from build_speaker_attribution_triage import _utf16_slice


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DRAFT_GENERATOR = REPO_ROOT / "scripts" / "audio" / "build_structural_speaker_drafts.py"
DEFAULT_CHARACTERS = REPO_ROOT / "audio" / "characters.json"
DEFAULT_MATRIX = REPO_ROOT / "scratch" / "audio-speaker-attribution-drafts" / "status-matrix.json"
DEFAULT_DRAFT_ROOT = REPO_ROOT / "scratch" / "audio-speaker-attribution-drafts"
DEFAULT_OUTPUT_ROOT = REPO_ROOT / "audio" / "speaker-attributions"
DEFAULT_MANIFEST = REPO_ROOT / "audio" / "speaker-attribution-acceptance.json"
COMMENTARY_NARRATOR = "commentary-narrator"
VOICE_POLICY = "reported-speech-inherits-active-character-v1"
REVIEWER = "operator-authorized-deterministic-v1"
SAFE_DIALOGUE = re.compile(r"[a-z0-9][a-z0-9-]*")
DATE = re.compile(r"\d{4}-\d{2}-\d{2}")
BRACE_TOKEN = re.compile(r"\{[^{}]+\}")
SOURCE_REFERENCE = re.compile(r"#[^#]+?(?=\s+#|$)")
STEPHANUS_TOKEN = re.compile(r"\{\d+[a-e]\}")
STRUCTURAL_ORIGINS = {
    "block-separator",
    "collapsed-whitespace",
    "milestone-marker",
    "structural-separator",
}
APOLOGY_ENGLISH_SHA256 = "04bf6411654f814bc016d5a0f649d1c50aef4d0dcbeeb1820910ecf8d2107046"
APOLOGY_MELETUS_QUOTE_NODE_PATHS = frozenset(
    {
        *(
            f"/TEI[1]/text[1]/body[1]/div[1]/div[8]/p[1]/q[{index}]"
            for index in range(1, 6)
        ),
        *(
            f"/TEI[1]/text[1]/body[1]/div[1]/div[9]/p[1]/q[{index}]"
            for index in range(1, 8)
        ),
        *(
            f"/TEI[1]/text[1]/body[1]/div[1]/div[10]/p[1]/q[{index}]"
            for index in range(1, 5)
        ),
        "/TEI[1]/text[1]/body[1]/div[1]/div[11]/p[1]/q[3]",
        "/TEI[1]/text[1]/body[1]/div[1]/div[11]/p[1]/q[4]",
    }
)
APOLOGY_MELETUS_RAW_UTF16_CODE_UNITS = 574


def _read_json(path: Path, label: str) -> tuple[dict[str, Any], str]:
    try:
        raw = path.read_bytes()
        value = json.loads(raw)
    except (OSError, json.JSONDecodeError) as error:
        raise TurnAlignmentError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise TurnAlignmentError(f"{label} must be an object: {path}")
    return value, sha256_bytes(raw)


def _repo_path(repo_root: Path, value: str, label: str) -> Path:
    path = (repo_root / value).resolve()
    try:
        path.relative_to(repo_root.resolve())
    except ValueError as error:
        raise TurnAlignmentError(f"{label} escapes the repository: {value}") from error
    if not path.is_file():
        raise TurnAlignmentError(f"missing {label}: {value}")
    return path


def _relative(repo_root: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError as error:
        raise TurnAlignmentError(f"path escapes the repository: {path}") from error


def _verify_self_hash(value: dict[str, Any], field: str, label: str) -> None:
    expected = value.get(field)
    frozen = {key: item for key, item in value.items() if key != field}
    if not isinstance(expected, str) or expected != sha256_bytes(canonical_json(frozen)):
        raise TurnAlignmentError(f"invalid {label} self hash")


def _catalog(
    payload: dict[str, Any],
) -> tuple[tuple[str, ...], dict[str, set[str]], dict[str, dict[str, set[str]]]]:
    if (
        payload.get("schemaVersion") != 3
        or payload.get("status") != "complete"
        or not isinstance(payload.get("dialogues"), list)
        or not isinstance(payload.get("characters"), list)
    ):
        raise TurnAlignmentError("acceptance requires complete CharacterCatalog v3")
    dialogues = tuple(sorted(row["dialogue"] for row in payload["dialogues"]))
    if len(dialogues) != len(payload["dialogues"]) or len(set(dialogues)) != len(dialogues):
        raise TurnAlignmentError("character dialogue inventory is malformed")
    owners = {dialogue: set() for dialogue in dialogues}
    source_refs: dict[str, dict[str, set[str]]] = {
        dialogue: {} for dialogue in dialogues
    }
    seen: set[str] = set()
    for character in payload["characters"]:
        character_id = character.get("characterId") if isinstance(character, dict) else None
        if not isinstance(character_id, str) or character_id in seen:
            raise TurnAlignmentError("character IDs must be unique strings")
        seen.add(character_id)
        if character.get("identityStatus") != "resolved":
            continue
        for appearance in character.get("appearances", []):
            if not isinstance(appearance, dict):
                continue
            dialogue = appearance.get("dialogue")
            if dialogue not in owners or appearance.get("editorialStatus") != "resolved":
                continue
            if appearance.get("performanceRole") == "voice-owner":
                owners[dialogue].add(character_id)
            for source_ref in appearance.get("sourceAttributions", []):
                if not isinstance(source_ref, str):
                    raise TurnAlignmentError("source attribution must be a string")
                source_refs[dialogue].setdefault(source_ref, set()).add(character_id)
    for dialogue in dialogues:
        if COMMENTARY_NARRATOR not in owners[dialogue]:
            raise TurnAlignmentError(f"{dialogue} lacks the canonical commentary narrator")
    return dialogues, owners, source_refs


def _is_title(row: dict[str, Any]) -> bool:
    evidence = row["source_evidence"]
    path = evidence.get("dom_node_path")
    return isinstance(path, str) and "/head[" in path


def _is_content_atom(text: str, row: dict[str, Any]) -> bool:
    evidence = row["source_evidence"]
    path = evidence.get("dom_node_path")
    if isinstance(path, str) and "/label[" in path:
        return False
    return bool(re.search(r"[A-Za-z0-9]", BRACE_TOKEN.sub(" ", text)))


def _is_reassignable_source_glue(row: dict[str, Any]) -> bool:
    origin = row["source_evidence"].get("dom_text_origin")
    return origin in STRUCTURAL_ORIGINS or row.get("unresolved_reason") in {
        "mixed_boundary_whitespace",
        "narrator_or_unattributed",
        "structural_separator",
    }


def _chorus_owner(
    row: dict[str, Any], *, source_refs: dict[str, set[str]], owners: set[str]
) -> str:
    evidence = row["source_evidence"]
    raw_who = evidence.get("raw_who")
    candidates = evidence.get("candidate_character_ids")
    if not isinstance(raw_who, str) or not isinstance(candidates, list) or len(set(candidates)) < 2:
        raise TurnAlignmentError("multi-speaker source span lacks explicit candidates")
    references = SOURCE_REFERENCE.findall(raw_who)
    if len(references) < 2:
        raise TurnAlignmentError(f"cannot parse multi-speaker source attribution: {raw_who}")
    source_owners = source_refs.get(references[0], set())
    if len(source_owners) != 1:
        raise TurnAlignmentError(
            f"first source-listed chorus attribution is ambiguous: {references[0]}"
        )
    owner = next(iter(source_owners))
    if owner not in set(candidates) or owner not in owners:
        raise TurnAlignmentError(f"first source-listed chorus owner is unresolved: {raw_who}")
    return owner


def _apology_meletus_rows(
    rows: list[dict[str, Any]], *, raw_text: str, owners: set[str]
) -> set[str]:
    if sha256_bytes(raw_text.encode("utf-8")) != APOLOGY_ENGLISH_SHA256:
        raise TurnAlignmentError("Apology live-speaker policy is stale for the English source")
    if not {"socrates", "meletus"}.issubset(owners):
        raise TurnAlignmentError("Apology lacks canonical Socrates or Meletus voice owner")

    selected_paths: set[str] = set()
    selected_units = 0
    for row in rows:
        evidence = row.get("source_evidence")
        path = evidence.get("quote_node_path") if isinstance(evidence, dict) else None
        if path not in APOLOGY_MELETUS_QUOTE_NODE_PATHS:
            continue
        units = row.get("utf16_code_units")
        if not isinstance(units, int) or units <= 0:
            raise TurnAlignmentError("Apology live Meletus row is malformed")
        selected_paths.add(path)
        selected_units += units

    if selected_paths != APOLOGY_MELETUS_QUOTE_NODE_PATHS:
        missing = sorted(APOLOGY_MELETUS_QUOTE_NODE_PATHS - selected_paths)
        extra = sorted(selected_paths - APOLOGY_MELETUS_QUOTE_NODE_PATHS)
        raise TurnAlignmentError(
            f"Apology live Meletus quote paths drifted (missing={missing}, extra={extra})"
        )
    if selected_units != APOLOGY_MELETUS_RAW_UTF16_CODE_UNITS:
        raise TurnAlignmentError(
            "Apology live Meletus quote extent drifted: "
            f"expected {APOLOGY_MELETUS_RAW_UTF16_CODE_UNITS}, got {selected_units}"
        )
    return selected_paths


def _provisional_owners(
    dialogue: str,
    rows: list[dict[str, Any]],
    *,
    raw_text: str,
    source_refs: dict[str, set[str]],
    owners: set[str],
) -> tuple[list[str], Counter[str]]:
    provisional: list[str | None] = []
    resolutions: Counter[str] = Counter()
    apology_meletus_paths = (
        _apology_meletus_rows(rows, raw_text=raw_text, owners=owners)
        if dialogue == "apology"
        else set()
    )
    for row in rows:
        if _is_title(row):
            provisional.append(COMMENTARY_NARRATOR)
            resolutions["source-title-to-commentary-narrator"] += row["utf16_code_units"]
            continue
        if dialogue == "apology":
            evidence = row.get("source_evidence")
            quote_path = evidence.get("quote_node_path") if isinstance(evidence, dict) else None
            if quote_path in apology_meletus_paths:
                provisional.append("meletus")
                resolutions["apology-live-meletus-reply"] += row["utf16_code_units"]
            else:
                provisional.append("socrates")
                resolutions["apology-unwrapped-defence-to-socrates"] += row[
                    "utf16_code_units"
                ]
            continue
        status = row.get("status")
        if status == "assigned":
            owner = row.get("character_id")
            if owner not in owners:
                raise TurnAlignmentError(f"draft assigns non-owner {owner!r} in {dialogue}")
            provisional.append(owner)
            resolutions["structural-draft"] += row["utf16_code_units"]
            continue
        if status != "unresolved":
            raise TurnAlignmentError(f"invalid draft row status in {dialogue}")
        reason = row.get("unresolved_reason")
        if reason == "multiple_source_attributions":
            provisional.append(
                _chorus_owner(row, source_refs=source_refs, owners=owners)
            )
            resolutions["chorus-to-first-source-listed-owner"] += row["utf16_code_units"]
        elif reason in {
            "mixed_boundary_whitespace",
            "narrator_or_unattributed",
            "structural_separator",
        }:
            provisional.append(None)
        else:
            raise TurnAlignmentError(
                f"unsupported unresolved reason {reason!r} remains in {dialogue}"
            )

    next_owner: str | None = None
    for index in range(len(provisional) - 1, -1, -1):
        if provisional[index] is not None:
            next_owner = provisional[index]
        elif next_owner is not None:
            provisional[index] = next_owner
            resolutions["source-glue-to-following-owner"] += rows[index]["utf16_code_units"]
    previous_owner: str | None = None
    for index, owner in enumerate(provisional):
        if owner is not None:
            previous_owner = owner
        elif previous_owner is not None:
            provisional[index] = previous_owner
            resolutions["trailing-source-glue-to-previous-owner"] += rows[index]["utf16_code_units"]
    if any(owner is None for owner in provisional):
        raise TurnAlignmentError(f"cannot attach every source-glue span in {dialogue}")
    return [str(owner) for owner in provisional], resolutions


def _group_segments(
    raw_text: str, rows: list[dict[str, Any]], owners: list[str]
) -> list[dict[str, Any]]:
    groups: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for row, owner in zip(rows, owners, strict=True):
        text = _utf16_slice(raw_text, row["start_char"], row["end_char"])
        content = _is_content_atom(text, row)
        reassignable = _is_reassignable_source_glue(row)
        milestone = STEPHANUS_TOKEN.fullmatch(text.strip()) is not None
        should_split = current is not None and (
            owner != current["character_id"] or (milestone and current["has_content"])
        )
        if should_split:
            if not current["has_content"]:
                if not current["reassignable"]:
                    raise TurnAlignmentError(
                        "owner boundary leaves a source-only empty segment at "
                        f"{current['start_char']}-{current['end_char']} before {row.get('id')} "
                        f"({current['character_id']} -> {owner})"
                    )
                current["character_id"] = owner
                current["end_char"] = row["end_char"]
                current["has_content"] = content
                current["reassignable"] = current["reassignable"] and reassignable
                continue
            groups.append(current)
            current = None
        if current is None:
            current = {
                "start_char": row["start_char"],
                "end_char": row["end_char"],
                "character_id": owner,
                "has_content": content,
                "reassignable": reassignable,
            }
        else:
            current["end_char"] = row["end_char"]
            current["has_content"] = current["has_content"] or content
            current["reassignable"] = current["reassignable"] and reassignable
    if current is None:
        raise TurnAlignmentError("draft has no segments")
    if not current["has_content"]:
        if not groups or groups[-1]["character_id"] != current["character_id"]:
            raise TurnAlignmentError("trailing source-only span cannot be merged")
        groups[-1]["end_char"] = current["end_char"]
    else:
        groups.append(current)
    result = [
        {
            "id": f"turn-{index:06d}",
            "start_char": group["start_char"],
            "end_char": group["end_char"],
            "character_id": group["character_id"],
        }
        for index, group in enumerate(groups, start=1)
    ]
    cursor = 0
    for segment in result:
        if segment["start_char"] != cursor or segment["end_char"] <= cursor:
            raise TurnAlignmentError("accepted segments are not a gapless partition")
        cursor = segment["end_char"]
    expected = len(raw_text.encode("utf-16-le")) // 2
    if cursor != expected:
        raise TurnAlignmentError("accepted segments do not cover the English source")
    return result


def build_dialogue_plan(
    draft: dict[str, Any],
    *,
    raw_path: Path,
    source_refs: dict[str, set[str]],
    owners: set[str],
    reviewed_at: str,
) -> tuple[dict[str, Any], dict[str, int]]:
    _verify_self_hash(draft, "draft_sha256", "structural draft")
    dialogue = draft.get("dialogue")
    source = draft.get("source")
    rows = draft.get("segments")
    if (
        draft.get("schema_version") != 1
        or draft.get("artifact_kind") != "structurally-proven-speaker-attribution-draft"
        or not isinstance(dialogue, str)
        or not SAFE_DIALOGUE.fullmatch(dialogue)
        or not isinstance(source, dict)
        or not isinstance(rows, list)
        or not rows
    ):
        raise TurnAlignmentError("unsupported structural draft")
    raw = raw_path.read_bytes()
    try:
        raw_text = raw.decode("utf-8")
    except UnicodeDecodeError as error:
        raise TurnAlignmentError(f"English source is not UTF-8: {raw_path}") from error
    if (
        source.get("english_sha256") != sha256_bytes(raw)
        or source.get("english_utf16_code_units") != len(raw_text.encode("utf-16-le")) // 2
    ):
        raise TurnAlignmentError(f"draft English binding is stale for {dialogue}")
    cursor = 0
    for row in rows:
        start = row.get("start_char")
        end = row.get("end_char")
        if not isinstance(start, int) or not isinstance(end, int) or start != cursor or end <= start:
            raise TurnAlignmentError(f"draft partition is not gapless for {dialogue}")
        atom = _utf16_slice(raw_text, start, end)
        if row.get("text_sha256") != sha256_bytes(atom.encode("utf-8")):
            raise TurnAlignmentError(f"draft atom hash mismatch for {dialogue}")
        cursor = end
    provisional, resolutions = _provisional_owners(
        dialogue,
        rows,
        raw_text=raw_text,
        source_refs=source_refs,
        owners=owners,
    )
    segments = _group_segments(raw_text, rows, provisional)
    plan = {
        "schema_version": 2,
        "dialogue": dialogue,
        "english_sha256": sha256_bytes(raw),
        "voice_policy": VOICE_POLICY,
        "status": "accepted",
        "reviewer": REVIEWER,
        "reviewed_at": reviewed_at,
        "commentary_character_id": COMMENTARY_NARRATOR,
        "segments": segments,
    }
    return plan, dict(sorted(resolutions.items()))


def _pretty(value: dict[str, Any]) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )


def build_corpus_acceptance(
    *,
    characters_path: Path = DEFAULT_CHARACTERS,
    matrix_path: Path = DEFAULT_MATRIX,
    draft_root: Path = DEFAULT_DRAFT_ROOT,
    repo_root: Path = REPO_ROOT,
    reviewed_at: str,
    dialogues: Sequence[str] | None = None,
    draft_generator_path: Path = DRAFT_GENERATOR,
    acceptance_generator_path: Path = SCRIPT_PATH,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if DATE.fullmatch(reviewed_at) is None:
        raise TurnAlignmentError("reviewed_at must use YYYY-MM-DD")
    repo_root = repo_root.resolve()
    characters, character_sha = _read_json(characters_path, "character catalog")
    catalog_dialogues, owners, source_refs = _catalog(characters)
    matrix, matrix_file_sha = _read_json(matrix_path, "structural draft matrix")
    _verify_self_hash(matrix, "matrix_sha256", "structural draft matrix")
    inputs = matrix.get("input_hashes")
    if (
        matrix.get("artifact_kind") != "structural-speaker-draft-status-matrix"
        or not isinstance(inputs, dict)
        or inputs.get("characters_sha256") != character_sha
        or inputs.get("generator_sha256") != sha256_file(draft_generator_path)
        or not isinstance(matrix.get("dialogues"), list)
    ):
        raise TurnAlignmentError("structural draft matrix is stale")
    selected = tuple(sorted(dialogues or catalog_dialogues))
    matrix_rows = {row.get("dialogue"): row for row in matrix["dialogues"]}
    if len(set(selected)) != len(selected) or any(dialogue not in owners for dialogue in selected):
        raise TurnAlignmentError("requested dialogue inventory is unknown or duplicated")
    plans: list[dict[str, Any]] = []
    records: list[dict[str, Any]] = []
    for dialogue in selected:
        matrix_row = matrix_rows.get(dialogue)
        if not isinstance(matrix_row, dict):
            raise TurnAlignmentError(f"matrix lacks {dialogue}")
        draft_path = draft_root / f"{dialogue}.draft.json"
        draft, draft_file_sha = _read_json(draft_path, "structural draft")
        if matrix_row.get("draft_sha256") != draft.get("draft_sha256"):
            raise TurnAlignmentError(f"matrix draft binding is stale for {dialogue}")
        source = draft.get("source")
        if not isinstance(source, dict) or not isinstance(source.get("english_path"), str):
            raise TurnAlignmentError(f"draft lacks English source path for {dialogue}")
        raw_path = _repo_path(repo_root, source["english_path"], "English source")
        plan, resolutions = build_dialogue_plan(
            draft,
            raw_path=raw_path,
            source_refs=source_refs[dialogue],
            owners=owners[dialogue],
            reviewed_at=reviewed_at,
        )
        plan_bytes = _pretty(plan)
        plans.append(plan)
        records.append(
            {
                "dialogue": dialogue,
                "draftPath": _relative(repo_root, draft_path),
                "draftFileSha256": draft_file_sha,
                "draftSha256": draft["draft_sha256"],
                "outputPath": f"audio/speaker-attributions/{dialogue}.json",
                "outputSha256": sha256_bytes(plan_bytes),
                "segmentCount": len(plan["segments"]),
                "resolutionUtf16Counts": resolutions,
            }
        )
    manifest: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "operator-authorized-speaker-attribution-acceptance",
        "status": "accepted",
        "reviewer": REVIEWER,
        "reviewedAt": reviewed_at,
        "manualListeningRequired": False,
        "policy": {
            "voiceOwnership": "one-voice-per-character",
            "reportedSpeech": "inherit-active-character",
            "sourceTitles": "commentary-narrator",
            "apologyUnwrappedSpeech": "socrates-except-pinned-live-meletus-replies",
            "sourceGlue": "following-proven-owner-else-previous",
            "multiSpeakerChorus": "first-source-listed-owner",
        },
        "inputs": {
            "charactersPath": _relative(repo_root, characters_path),
            "charactersSha256": character_sha,
            "draftMatrixPath": _relative(repo_root, matrix_path),
            "draftMatrixFileSha256": matrix_file_sha,
            "draftMatrixSha256": matrix["matrix_sha256"],
            "draftGeneratorPath": _relative(repo_root, draft_generator_path),
            "draftGeneratorSha256": sha256_file(draft_generator_path),
            "acceptanceGeneratorPath": _relative(repo_root, acceptance_generator_path),
            "acceptanceGeneratorSha256": sha256_file(acceptance_generator_path),
        },
        "catalogDialogueCount": len(catalog_dialogues),
        "dialogueCount": len(plans),
        "dialogues": records,
    }
    manifest["manifestSha256"] = sha256_bytes(canonical_json(manifest))
    return plans, manifest


def _atomic_write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_bytes(data)
    temporary.replace(path)


def write_corpus_acceptance(
    plans: list[dict[str, Any]],
    manifest: dict[str, Any],
    *,
    output_root: Path = DEFAULT_OUTPUT_ROOT,
    manifest_path: Path = DEFAULT_MANIFEST,
    repo_root: Path = REPO_ROOT,
) -> None:
    repo_root = repo_root.resolve()
    allowed_output = (repo_root / "audio/speaker-attributions").resolve()
    allowed_manifest = (repo_root / "audio/speaker-attribution-acceptance.json").resolve()
    if output_root.resolve() != allowed_output or manifest_path.resolve() != allowed_manifest:
        raise TurnAlignmentError("accepted attribution writes are confined to canonical audio paths")
    _verify_self_hash(manifest, "manifestSha256", "speaker attribution acceptance manifest")
    dialogue_count = manifest.get("dialogueCount")
    catalog_dialogue_count = manifest.get("catalogDialogueCount")
    records = manifest.get("dialogues")
    if (
        not isinstance(dialogue_count, int)
        or not isinstance(catalog_dialogue_count, int)
        or not isinstance(records, list)
        or dialogue_count != len(plans)
        or dialogue_count != len(records)
    ):
        raise TurnAlignmentError("speaker attribution acceptance manifest inventory is malformed")
    if dialogue_count != catalog_dialogue_count:
        raise TurnAlignmentError(
            "refusing partial canonical attribution write; rebuild the complete catalog dialogue inventory"
        )
    records_by_dialogue = {
        record.get("dialogue"): record for record in records if isinstance(record, dict)
    }
    if len(records_by_dialogue) != dialogue_count:
        raise TurnAlignmentError("speaker attribution acceptance manifest has duplicate dialogue records")
    for plan in plans:
        dialogue = plan.get("dialogue")
        record = records_by_dialogue.get(dialogue)
        if (
            not isinstance(dialogue, str)
            or not isinstance(record, dict)
            or record.get("outputPath") != f"audio/speaker-attributions/{dialogue}.json"
            or record.get("outputSha256") != sha256_bytes(_pretty(plan))
        ):
            raise TurnAlignmentError(f"speaker attribution plan binding is invalid for {dialogue!r}")
        _atomic_write(output_root / f"{plan['dialogue']}.json", _pretty(plan))
    _atomic_write(manifest_path, _pretty(manifest))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--characters", type=Path, default=DEFAULT_CHARACTERS)
    parser.add_argument("--matrix", type=Path, default=DEFAULT_MATRIX)
    parser.add_argument("--draft-root", type=Path, default=DEFAULT_DRAFT_ROOT)
    parser.add_argument("--accepted-at", required=True)
    parser.add_argument("--dialogue", action="append")
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        plans, manifest = build_corpus_acceptance(
            characters_path=args.characters,
            matrix_path=args.matrix,
            draft_root=args.draft_root,
            reviewed_at=args.accepted_at,
            dialogues=args.dialogue,
        )
        if args.write:
            write_corpus_acceptance(plans, manifest)
    except TurnAlignmentError as error:
        raise SystemExit(str(error)) from error
    print(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
