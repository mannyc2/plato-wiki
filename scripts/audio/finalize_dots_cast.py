#!/usr/bin/env python3
"""Close CastCatalog only when every resolved voice owner is selected."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

from cast_acceptance import (
    CastAcceptanceError,
    validate_cast_decision_artifacts,
    validate_cast_registry,
)


REPO_ROOT = Path(__file__).resolve().parents[2]
FINALIZER_PATH = Path(__file__).resolve()
CHARACTER_VALIDATOR = REPO_ROOT / "scripts/audio/validate_character_catalog.ts"
CHARACTER_CATALOG_IMPLEMENTATION = REPO_ROOT / "packages/harness/src/audio-catalog.ts"
CAST_ACCEPTANCE_IMPLEMENTATION = REPO_ROOT / "scripts/audio/cast_acceptance.py"
DATE = re.compile(r"\d{4}-\d{2}-\d{2}")


class CastFinalizationError(ValueError):
    """Raised when a cast completeness claim would be false."""


def _load_json_bytes(path: Path, label: str) -> tuple[dict[str, Any], bytes]:
    try:
        raw = path.read_bytes()
        value = json.loads(raw.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise CastFinalizationError(f"cannot read {label} {path}: {error}") from error
    if not isinstance(value, dict):
        raise CastFinalizationError(f"{label} must be a JSON object")
    return value, raw


def _json_bytes(value: dict[str, Any]) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )


def _sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _sha256_file(path: Path) -> str:
    return _sha256_bytes(path.read_bytes())


def _relative(repo_root: Path, path: Path) -> str:
    try:
        return path.resolve().relative_to(repo_root.resolve()).as_posix()
    except ValueError as error:
        raise CastFinalizationError(f"reconciliation path escapes repository: {path}") from error


def _resolve(repo_root: Path, path: Path) -> Path:
    return path.resolve() if path.is_absolute() else (repo_root / path).resolve()


def validate_character_catalog_with_bun(
    path: Path, *, repo_root: Path, validator_path: Path = CHARACTER_VALIDATOR
) -> None:
    bun = shutil.which("bun")
    if bun is None:
        raise CastFinalizationError("bun is required for canonical CharacterCatalog validation")
    validator = _resolve(repo_root, validator_path)
    if not validator.is_file():
        raise CastFinalizationError(f"missing canonical CharacterCatalog validator: {validator}")
    result = subprocess.run(
        [bun, str(validator), str(path), str(repo_root)],
        cwd=repo_root,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise CastFinalizationError(
            f"canonical CharacterCatalog validation failed: {detail or 'unknown error'}"
        )


def build_completion_report(
    cast: dict[str, Any], characters: dict[str, Any]
) -> dict[str, Any]:
    if (
        characters.get("schemaVersion") != 3
        or characters.get("status") != "complete"
        or not isinstance(characters.get("characters"), list)
    ):
        raise CastFinalizationError("canonical CharacterCatalog v3 must be complete")

    owner_ids: set[str] = set()
    unresolved: list[str] = []
    review_required: list[str] = []
    for character in characters["characters"]:
        if not isinstance(character, dict) or not isinstance(character.get("appearances"), list):
            raise CastFinalizationError("character catalog has a malformed character")
        character_id = character.get("characterId")
        if not isinstance(character_id, str) or not character_id:
            raise CastFinalizationError("character catalog has an invalid character ID")
        appearances = character["appearances"]
        for appearance in appearances:
            if not isinstance(appearance, dict):
                raise CastFinalizationError("character catalog has a malformed appearance")
            role = appearance.get("performanceRole")
            if role not in {"voice-owner", "reported-only", "review-required"}:
                raise CastFinalizationError(
                    f"character catalog has an invalid performance role for {character_id}"
                )
            if appearance.get("editorialStatus") not in {"resolved", "required"}:
                raise CastFinalizationError(
                    f"character catalog has an invalid editorial status for {character_id}"
                )
            if role == "review-required":
                review_required.append(f"{character_id}:{appearance.get('dialogue')}")
        voice_appearances = [
            appearance
            for appearance in appearances
            if appearance.get("performanceRole") == "voice-owner"
        ]
        if not voice_appearances:
            continue
        owner_ids.add(character_id)
        if character.get("identityStatus") != "resolved" or any(
            appearance.get("editorialStatus") != "resolved"
            for appearance in voice_appearances
        ):
            unresolved.append(character_id)

    voices = cast.get("voices")
    if cast.get("schemaVersion") != 3 or cast.get("status") not in {"partial", "complete"}:
        raise CastFinalizationError("unsupported CastCatalog; expected schema v3")
    if not isinstance(voices, list):
        raise CastFinalizationError("cast voices must be an array")
    voice_ids: list[str] = []
    for voice in voices:
        if (
            not isinstance(voice, dict)
            or voice.get("status") != "selected"
            or not isinstance(voice.get("characterId"), str)
        ):
            raise CastFinalizationError("every cast voice must be selected and identified")
        voice_ids.append(voice["characterId"])
    duplicates = sorted({item for item in voice_ids if voice_ids.count(item) > 1})
    selected = set(voice_ids)
    missing = sorted(owner_ids - selected)
    extra = sorted(selected - owner_ids)
    eligible = not duplicates and not missing and not extra and not unresolved and not review_required
    return {
        "schemaVersion": 1,
        "artifactKind": "dots-cast-completion-report",
        "eligible": eligible,
        "characterCatalogStatus": characters["status"],
        "castStatus": cast["status"],
        "voiceOwnerCount": len(owner_ids),
        "selectedVoiceCount": len(selected),
        "missingCharacterIds": missing,
        "extraCharacterIds": extra,
        "duplicateCharacterIds": duplicates,
        "unresolvedVoiceOwnerCharacterIds": sorted(unresolved),
        "reviewRequiredAppearanceIds": sorted(review_required),
        "writePerformed": False,
        "prunePerformed": False,
        "prunedCharacterIds": [],
        "reconciliationPlanPath": None,
        "reconciliationPlanSha256": None,
    }


def prune_non_owner_voices(
    cast: dict[str, Any], characters: dict[str, Any]
) -> tuple[dict[str, Any], list[str]]:
    report = build_completion_report(cast, characters)
    extras = set(report["extraCharacterIds"])
    if not extras:
        return cast, []
    voices = cast.get("voices")
    if not isinstance(voices, list):
        raise CastFinalizationError("cast voices must be an array")
    pruned = {
        **cast,
        "status": "partial",
        "voices": [voice for voice in voices if voice.get("characterId") not in extras],
    }
    return pruned, sorted(extras)


def build_reconciliation_plan(
    *,
    prior_cast_bytes: bytes,
    result_cast: dict[str, Any],
    cast_path: Path,
    characters_path: Path,
    character_catalog_bytes: bytes,
    removed_character_ids: list[str],
    reconciled_at: str,
    repo_root: Path,
    validator_path: Path = CHARACTER_VALIDATOR,
    finalizer_path: Path = FINALIZER_PATH,
    character_catalog_implementation_path: Path = CHARACTER_CATALOG_IMPLEMENTATION,
    cast_acceptance_implementation_path: Path = CAST_ACCEPTANCE_IMPLEMENTATION,
) -> dict[str, Any]:
    if DATE.fullmatch(reconciled_at) is None:
        raise CastFinalizationError("reconciled_at must use YYYY-MM-DD")
    prior_cast = json.loads(prior_cast_bytes)
    if not isinstance(prior_cast, dict):
        raise CastFinalizationError("prior cast must be a JSON object")
    plan: dict[str, Any] = {
        "schemaVersion": 1,
        "artifactKind": "dots-cast-owner-reconciliation-plan",
        "status": "planned",
        "reconciledAt": reconciled_at,
        "inputs": {
            "castPath": _relative(repo_root, cast_path),
            "priorCastSha256": _sha256_bytes(prior_cast_bytes),
            "characterCatalogPath": _relative(repo_root, characters_path),
            "characterCatalogSha256": _sha256_bytes(character_catalog_bytes),
            "finalizerPath": _relative(repo_root, finalizer_path),
            "finalizerSha256": _sha256_file(finalizer_path),
            "characterValidatorPath": _relative(repo_root, validator_path),
            "characterValidatorSha256": _sha256_file(validator_path),
            "characterCatalogImplementationPath": _relative(
                repo_root, character_catalog_implementation_path
            ),
            "characterCatalogImplementationSha256": _sha256_file(
                character_catalog_implementation_path
            ),
            "castAcceptanceImplementationPath": _relative(
                repo_root, cast_acceptance_implementation_path
            ),
            "castAcceptanceImplementationSha256": _sha256_file(
                cast_acceptance_implementation_path
            ),
        },
        "changes": {
            "removedCharacterIds": removed_character_ids,
            "statusBefore": prior_cast.get("status"),
            "statusAfter": result_cast.get("status"),
        },
        "result": {
            "castSha256": _sha256_bytes(_json_bytes(result_cast)),
            "selectedVoiceCount": len(result_cast.get("voices", [])),
        },
    }
    plan["planSha256"] = _sha256_bytes(
        json.dumps(plan, ensure_ascii=False, separators=(",", ":"), sort_keys=True).encode(
            "utf-8"
        )
    )
    return plan


def _atomic_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = _json_bytes(value).decode("utf-8")
    temporary: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=path.parent, delete=False
        ) as handle:
            handle.write(data)
            temporary = Path(handle.name)
        os.replace(temporary, path)
        temporary = None
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def _write_reconciliation_plan(
    *, plan: dict[str, Any], root: Path, repo_root: Path
) -> Path:
    _relative(repo_root, root)
    plan_sha = plan.get("planSha256")
    if not isinstance(plan_sha, str) or re.fullmatch(r"[0-9a-f]{64}", plan_sha) is None:
        raise CastFinalizationError("reconciliation plan has an invalid content hash")
    expected = _json_bytes(plan)
    path = root / f"{plan_sha}.json"
    if path.exists():
        try:
            actual = path.read_bytes()
        except OSError as error:
            raise CastFinalizationError(
                f"cannot read reconciliation plan {path}: {error}"
            ) from error
        if actual != expected:
            raise CastFinalizationError(
                f"content-addressed reconciliation plan collision at {path}"
            )
        return path
    _atomic_json(path, plan)
    return path


def _assert_unchanged(path: Path, expected: bytes, label: str) -> None:
    try:
        actual = path.read_bytes()
    except OSError as error:
        raise CastFinalizationError(f"cannot re-read {label} {path}: {error}") from error
    if actual != expected:
        raise CastFinalizationError(f"{label} changed during cast finalization")


def finalize(
    *,
    cast_path: Path,
    characters_path: Path,
    repo_root: Path,
    write: bool,
    prune_non_owners: bool = False,
    reconciled_at: str | None = None,
    reconciliation_root: Path = Path("audio/cast-reconciliations"),
    validator_path: Path = CHARACTER_VALIDATOR,
    finalizer_path: Path = FINALIZER_PATH,
    character_catalog_implementation_path: Path = CHARACTER_CATALOG_IMPLEMENTATION,
    cast_acceptance_implementation_path: Path = CAST_ACCEPTANCE_IMPLEMENTATION,
) -> dict[str, Any]:
    repo_root = repo_root.resolve()
    cast_path = _resolve(repo_root, cast_path)
    characters_path = _resolve(repo_root, characters_path)
    reconciliation_root = _resolve(repo_root, reconciliation_root)
    validator_path = _resolve(repo_root, validator_path)
    finalizer_path = _resolve(repo_root, finalizer_path)
    character_catalog_implementation_path = _resolve(
        repo_root, character_catalog_implementation_path
    )
    cast_acceptance_implementation_path = _resolve(
        repo_root, cast_acceptance_implementation_path
    )
    cast, prior_cast_bytes = _load_json_bytes(cast_path, "cast catalog")
    characters, character_catalog_bytes = _load_json_bytes(
        characters_path, "character catalog"
    )
    validate_character_catalog_with_bun(
        characters_path, repo_root=repo_root, validator_path=validator_path
    )
    _assert_unchanged(
        characters_path, character_catalog_bytes, "canonical character catalog"
    )
    try:
        validate_cast_registry(cast)
        validate_cast_decision_artifacts(cast, repo_root)
    except CastAcceptanceError as error:
        raise CastFinalizationError(str(error)) from error
    original_cast = cast
    report = build_completion_report(original_cast, characters)
    pruned_ids: list[str] = []
    reconciliation_changed = False
    if prune_non_owners:
        cast, pruned_ids = prune_non_owner_voices(cast, characters)
        report = build_completion_report(cast, characters)
        if not report["eligible"] and cast["status"] != "partial":
            cast = {**cast, "status": "partial"}
            report = build_completion_report(cast, characters)
        reconciliation_changed = cast != original_cast
        if reconciliation_changed:
            try:
                validate_cast_registry(cast)
                validate_cast_decision_artifacts(cast, repo_root)
            except CastAcceptanceError as error:
                raise CastFinalizationError(str(error)) from error
        report["prunedCharacterIds"] = pruned_ids
    else:
        report["prunedCharacterIds"] = []
    if not report["eligible"]:
        if write and not prune_non_owners:
            raise CastFinalizationError(
                "cast is not complete: "
                + json.dumps(
                    {
                        "missing": report["missingCharacterIds"],
                        "extra": report["extraCharacterIds"],
                        "duplicates": report["duplicateCharacterIds"],
                        "unresolved": report["unresolvedVoiceOwnerCharacterIds"],
                        "reviewRequired": report["reviewRequiredAppearanceIds"],
                    },
                    sort_keys=True,
                )
            )
    elif write and cast["status"] != "complete":
        cast = {**cast, "status": "complete"}

    cast_changed = cast != original_cast
    if not write or not cast_changed:
        return report

    if reconciliation_changed and reconciled_at is None:
        raise CastFinalizationError(
            "--reconciled-at YYYY-MM-DD is required when a prune write changes the cast"
        )

    try:
        validate_cast_registry(cast)
        validate_cast_decision_artifacts(cast, repo_root)
    except CastAcceptanceError as error:
        raise CastFinalizationError(str(error)) from error

    _assert_unchanged(cast_path, prior_cast_bytes, "cast catalog")
    _assert_unchanged(
        characters_path, character_catalog_bytes, "canonical character catalog"
    )

    plan_path: Path | None = None
    plan: dict[str, Any] | None = None
    if reconciliation_changed:
        assert reconciled_at is not None
        plan = build_reconciliation_plan(
            prior_cast_bytes=prior_cast_bytes,
            result_cast=cast,
            cast_path=cast_path,
            characters_path=characters_path,
            character_catalog_bytes=character_catalog_bytes,
            removed_character_ids=pruned_ids,
            reconciled_at=reconciled_at,
            repo_root=repo_root,
            validator_path=validator_path,
            finalizer_path=finalizer_path,
            character_catalog_implementation_path=character_catalog_implementation_path,
            cast_acceptance_implementation_path=cast_acceptance_implementation_path,
        )
        plan_path = _write_reconciliation_plan(
            plan=plan, root=reconciliation_root, repo_root=repo_root
        )
        _assert_unchanged(cast_path, prior_cast_bytes, "cast catalog")
        _assert_unchanged(
            characters_path, character_catalog_bytes, "canonical character catalog"
        )

    _atomic_json(cast_path, cast)
    report = build_completion_report(cast, characters)
    report["writePerformed"] = True
    report["prunedCharacterIds"] = pruned_ids
    report["prunePerformed"] = bool(pruned_ids)
    if plan_path is not None and plan is not None:
        report["reconciliationPlanPath"] = _relative(repo_root, plan_path)
        report["reconciliationPlanSha256"] = plan["planSha256"]
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cast", type=Path, default=Path("audio/cast.json"))
    parser.add_argument(
        "--characters", type=Path, default=Path("audio/characters.json")
    )
    parser.add_argument("--repo-root", type=Path, default=REPO_ROOT)
    parser.add_argument("--write", action="store_true")
    parser.add_argument(
        "--prune-non-owners",
        action="store_true",
        help="Remove selected voices that no longer own a voice in the complete character catalog before finalization.",
    )
    parser.add_argument(
        "--reconciled-at",
        help="YYYY-MM-DD provenance date required only when --prune-non-owners --write changes the cast.",
    )
    parser.add_argument(
        "--reconciliation-root",
        type=Path,
        default=Path("audio/cast-reconciliations"),
        help="Repository-relative directory for content-addressed reconciliation plans.",
    )
    args = parser.parse_args()
    try:
        report = finalize(
            cast_path=args.cast,
            characters_path=args.characters,
            repo_root=args.repo_root,
            write=args.write,
            prune_non_owners=args.prune_non_owners,
            reconciled_at=args.reconciled_at,
            reconciliation_root=args.reconciliation_root,
        )
    except CastFinalizationError as error:
        raise SystemExit(str(error)) from error
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
