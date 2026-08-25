from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

import finalize_dots_cast  # noqa: E402
from finalize_dots_cast import (  # noqa: E402
    CastFinalizationError,
    build_completion_report,
    finalize,
    prune_non_owner_voices,
)


def character(character_id: str, role: str = "voice-owner", *, resolved: bool = True):
    return {
        "characterId": character_id,
        "identityStatus": "resolved" if resolved else "editorial-required",
        "appearances": [
            {
                "dialogue": "fixture",
                "performanceRole": role,
                "editorialStatus": "resolved" if resolved else "required",
            }
        ],
    }


def characters(*rows):
    return {"schemaVersion": 3, "status": "complete", "characters": list(rows)}


def cast(*ids: str, status: str = "partial"):
    return {
        "schemaVersion": 3,
        "status": status,
        "voices": [
            {"characterId": character_id, "status": "selected"}
            for character_id in ids
        ],
    }


def fixture_tooling(root: Path, *, reject_catalog: bool = False) -> tuple[Path, Path]:
    directory = root / "scripts" / "audio"
    directory.mkdir(parents=True)
    validator = directory / "validate_character_catalog.ts"
    if reject_catalog:
        validator.write_text('throw new Error("fixture catalog rejected");\n', encoding="utf-8")
    else:
        validator.write_text(
            """import { readFileSync } from \"node:fs\";
const value = JSON.parse(readFileSync(process.argv[2], \"utf8\"));
if (value.schemaVersion !== 3 || value.status !== \"complete\") {
  throw new Error(\"fixture catalog rejected\");
}
""",
            encoding="utf-8",
        )
    finalizer = directory / "finalize_dots_cast.py"
    finalizer.write_text("# fixture finalizer\n", encoding="utf-8")
    catalog_implementation = root / "packages" / "harness" / "src" / "audio-catalog.ts"
    catalog_implementation.parent.mkdir(parents=True)
    catalog_implementation.write_text("// fixture catalog implementation\n", encoding="utf-8")
    (directory / "cast_acceptance.py").write_text(
        "# fixture cast acceptance implementation\n", encoding="utf-8"
    )
    return validator, finalizer


def implementation_paths(root: Path) -> tuple[Path, Path]:
    return (
        root / "packages" / "harness" / "src" / "audio-catalog.ts",
        root / "scripts" / "audio" / "cast_acceptance.py",
    )


def unsigned_plan_sha(plan: dict) -> str:
    unsigned = {key: value for key, value in plan.items() if key != "planSha256"}
    return hashlib.sha256(
        json.dumps(
            unsigned, ensure_ascii=False, separators=(",", ":"), sort_keys=True
        ).encode("utf-8")
    ).hexdigest()


def accepted_canonical_character_catalog() -> dict:
    bun = shutil.which("bun")
    if bun is None:
        raise RuntimeError("bun is required for the authoritative catalog fixture")
    program = """
import { readFileSync } from "node:fs";
import { applyAcceptedActiveSpeakerPolicy } from "./packages/harness/src/audio-catalog.ts";
const catalog = JSON.parse(readFileSync("audio/characters.json", "utf8"));
console.log(JSON.stringify(applyAcceptedActiveSpeakerPolicy(catalog)));
"""
    result = subprocess.run(
        [bun, "-e", program],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout)
    value = json.loads(result.stdout)
    if not isinstance(value, dict):
        raise RuntimeError("accepted CharacterCatalog fixture is not an object")
    return value


class FinalizeDotsCastTest(unittest.TestCase):
    def test_exact_resolved_voice_owner_set_is_eligible(self) -> None:
        report = build_completion_report(
            cast("socrates", "crito"),
            characters(
                character("socrates"),
                character("crito"),
                character("dream-woman", "reported-only"),
            ),
        )
        self.assertTrue(report["eligible"])
        self.assertEqual(report["voiceOwnerCount"], 2)
        self.assertEqual(report["selectedVoiceCount"], 2)

    def test_missing_extra_duplicate_and_unresolved_are_fail_closed(self) -> None:
        cases = (
            (cast("socrates"), characters(character("socrates"), character("crito")), "missingCharacterIds"),
            (cast("socrates", "nobody"), characters(character("socrates")), "extraCharacterIds"),
            (cast("socrates", "socrates"), characters(character("socrates")), "duplicateCharacterIds"),
            (cast("socrates"), characters(character("socrates", resolved=False)), "unresolvedVoiceOwnerCharacterIds"),
        )
        for catalog, people, field in cases:
            with self.subTest(field=field):
                report = build_completion_report(catalog, people)
                self.assertFalse(report["eligible"])
                self.assertTrue(report[field])

    def test_review_required_appearance_blocks_even_when_another_role_is_cast(self) -> None:
        people = characters(character("socrates"))
        people["characters"].append(character("unknown", "review-required"))
        report = build_completion_report(cast("socrates"), people)
        self.assertFalse(report["eligible"])
        self.assertEqual(report["reviewRequiredAppearanceIds"], ["unknown:fixture"])

    def test_prunes_only_selected_characters_that_no_longer_own_a_voice(self) -> None:
        catalog = cast("socrates", "reported-person", "crito", status="complete")
        pruned, removed = prune_non_owner_voices(
            catalog,
            characters(
                character("socrates"),
                character("crito"),
                character("reported-person", "reported-only"),
            ),
        )
        self.assertEqual(removed, ["reported-person"])
        self.assertEqual(
            [voice["characterId"] for voice in pruned["voices"]],
            ["socrates", "crito"],
        )
        self.assertEqual(pruned["status"], "partial")
        self.assertEqual(
            [voice["characterId"] for voice in catalog["voices"]],
            ["socrates", "reported-person", "crito"],
        )

    def test_prune_is_idempotent_when_no_extra_selection_exists(self) -> None:
        catalog = cast("socrates")
        pruned, removed = prune_non_owner_voices(
            catalog, characters(character("socrates"), character("dream", "reported-only"))
        )
        self.assertIs(pruned, catalog)
        self.assertEqual(removed, [])

    def test_rejects_an_unknown_performance_role_before_pruning(self) -> None:
        people = characters(character("socrates"))
        people["characters"][0]["appearances"][0]["performanceRole"] = "voice-owne"
        with self.assertRaisesRegex(CastFinalizationError, "invalid performance role"):
            prune_non_owner_voices(cast("socrates"), people)

    def test_prune_write_demotes_a_false_complete_cast_even_without_extras(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root)
            cast_path = root / "cast.json"
            characters_path = root / "characters.json"
            original = json.dumps(cast("socrates", status="complete")).encode()
            cast_path.write_bytes(original)
            characters_path.write_text(
                json.dumps(characters(character("socrates"), character("crito"))),
                encoding="utf-8",
            )
            with (
                patch("finalize_dots_cast.validate_cast_registry"),
                patch("finalize_dots_cast.validate_cast_decision_artifacts"),
            ):
                with self.assertRaisesRegex(CastFinalizationError, "reconciled-at"):
                    finalize(
                        cast_path=cast_path,
                        characters_path=characters_path,
                        repo_root=root,
                        write=True,
                        prune_non_owners=True,
                        validator_path=validator,
                        finalizer_path=finalizer,
                        character_catalog_implementation_path=implementation_paths(root)[0],
                        cast_acceptance_implementation_path=implementation_paths(root)[1],
                    )
                self.assertEqual(cast_path.read_bytes(), original)
                report = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="2026-07-16",
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
                second = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
            written = json.loads(cast_path.read_text(encoding="utf-8"))
            plan_path = root / report["reconciliationPlanPath"]
            plan_exists = plan_path.is_file()

        self.assertFalse(report["eligible"])
        self.assertEqual(report["missingCharacterIds"], ["crito"])
        self.assertTrue(report["writePerformed"])
        self.assertEqual(written["status"], "partial")
        self.assertTrue(plan_exists)
        self.assertFalse(second["writePerformed"])

    def test_prune_write_records_content_addressed_plan_then_writes_cast_once(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root)
            cast_path = root / "audio" / "cast.json"
            characters_path = root / "audio" / "characters.json"
            cast_path.parent.mkdir()
            prior = json.dumps(
                cast("socrates", "reported-person", status="complete")
            ).encode("utf-8")
            cast_path.write_bytes(prior)
            characters_path.write_text(
                json.dumps(
                    characters(
                        character("socrates"),
                        character("reported-person", "reported-only"),
                    )
                ),
                encoding="utf-8",
            )
            reconciliation_root = root / "audio" / "reconciliations"
            real_atomic = finalize_dots_cast._atomic_json
            with (
                patch("finalize_dots_cast.validate_cast_registry"),
                patch("finalize_dots_cast.validate_cast_decision_artifacts"),
                patch(
                    "finalize_dots_cast._atomic_json", wraps=real_atomic
                ) as atomic_json,
            ):
                report = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="2026-07-16",
                    reconciliation_root=reconciliation_root,
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
            destinations = [call.args[0] for call in atomic_json.call_args_list]
            plan_path = root / report["reconciliationPlanPath"]
            plan = json.loads(plan_path.read_text(encoding="utf-8"))
            written = json.loads(cast_path.read_text(encoding="utf-8"))
            written_bytes = cast_path.read_bytes()
            catalog_implementation_sha = hashlib.sha256(
                implementation_paths(root)[0].read_bytes()
            ).hexdigest()
            cast_acceptance_implementation_sha = hashlib.sha256(
                implementation_paths(root)[1].read_bytes()
            ).hexdigest()

        self.assertEqual(destinations, [plan_path.resolve(), cast_path.resolve()])
        self.assertEqual(destinations.count(cast_path.resolve()), 1)
        self.assertEqual(report["prunedCharacterIds"], ["reported-person"])
        self.assertTrue(report["prunePerformed"])
        self.assertTrue(report["eligible"])
        self.assertEqual(written["status"], "complete")
        self.assertEqual(
            [voice["characterId"] for voice in written["voices"]], ["socrates"]
        )
        self.assertEqual(plan["status"], "planned")
        self.assertEqual(plan["planSha256"], unsigned_plan_sha(plan))
        self.assertEqual(report["reconciliationPlanSha256"], plan["planSha256"])
        self.assertEqual(plan_path.name, f"{plan['planSha256']}.json")
        self.assertEqual(
            plan["inputs"]["priorCastSha256"], hashlib.sha256(prior).hexdigest()
        )
        self.assertEqual(
            plan["result"]["castSha256"],
            hashlib.sha256(written_bytes).hexdigest(),
        )
        self.assertEqual(plan["changes"]["removedCharacterIds"], ["reported-person"])
        self.assertEqual(plan["inputs"]["finalizerPath"], "scripts/audio/finalize_dots_cast.py")
        self.assertEqual(
            plan["inputs"]["characterValidatorPath"],
            "scripts/audio/validate_character_catalog.ts",
        )
        self.assertEqual(
            plan["inputs"]["characterCatalogImplementationPath"],
            "packages/harness/src/audio-catalog.ts",
        )
        self.assertEqual(
            plan["inputs"]["castAcceptanceImplementationPath"],
            "scripts/audio/cast_acceptance.py",
        )
        self.assertEqual(
            plan["inputs"]["characterCatalogImplementationSha256"],
            catalog_implementation_sha,
        )
        self.assertEqual(
            plan["inputs"]["castAcceptanceImplementationSha256"],
            cast_acceptance_implementation_sha,
        )

    def test_reconciled_at_is_not_required_for_dry_run_or_idempotent_write(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root)
            cast_path = root / "cast.json"
            characters_path = root / "characters.json"
            cast_path.write_text(
                json.dumps(cast("socrates", "reported", status="complete")),
                encoding="utf-8",
            )
            characters_path.write_text(
                json.dumps(
                    characters(
                        character("socrates"),
                        character("reported", "reported-only"),
                    )
                ),
                encoding="utf-8",
            )
            with (
                patch("finalize_dots_cast.validate_cast_registry"),
                patch("finalize_dots_cast.validate_cast_decision_artifacts"),
            ):
                dry = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=False,
                    prune_non_owners=True,
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
                first = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="2026-07-16",
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
                second = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )

        self.assertEqual(dry["prunedCharacterIds"], ["reported"])
        self.assertFalse(dry["writePerformed"])
        self.assertTrue(first["writePerformed"])
        self.assertFalse(second["writePerformed"])
        self.assertIsNone(second["reconciliationPlanPath"])

    def test_invalid_reconciliation_date_writes_neither_plan_nor_cast(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root)
            cast_path = root / "cast.json"
            characters_path = root / "characters.json"
            cast_path.write_text(
                json.dumps(cast("socrates", "reported", status="complete")),
                encoding="utf-8",
            )
            original = cast_path.read_bytes()
            characters_path.write_text(
                json.dumps(
                    characters(
                        character("socrates"),
                        character("reported", "reported-only"),
                    )
                ),
                encoding="utf-8",
            )
            with (
                patch("finalize_dots_cast.validate_cast_registry"),
                patch("finalize_dots_cast.validate_cast_decision_artifacts"),
                self.assertRaisesRegex(CastFinalizationError, "YYYY-MM-DD"),
            ):
                finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="July 16",
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )
            unchanged = cast_path.read_bytes()
            reconciliation_exists = (root / "audio" / "cast-reconciliations").exists()

        self.assertEqual(unchanged, original)
        self.assertFalse(reconciliation_exists)

    def test_ordinary_completion_does_not_require_reconciliation_provenance(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root)
            cast_path = root / "cast.json"
            characters_path = root / "characters.json"
            cast_path.write_text(json.dumps(cast("socrates")), encoding="utf-8")
            characters_path.write_text(
                json.dumps(characters(character("socrates"))), encoding="utf-8"
            )
            with (
                patch("finalize_dots_cast.validate_cast_registry"),
                patch("finalize_dots_cast.validate_cast_decision_artifacts"),
            ):
                report = finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    validator_path=validator,
                    finalizer_path=finalizer,
                    character_catalog_implementation_path=implementation_paths(root)[0],
                    cast_acceptance_implementation_path=implementation_paths(root)[1],
                )

        self.assertTrue(report["writePerformed"])
        self.assertEqual(report["castStatus"], "complete")
        self.assertIsNone(report["reconciliationPlanPath"])

    def test_authoritative_catalog_validator_failure_stops_before_cast_write(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            validator, finalizer = fixture_tooling(root, reject_catalog=True)
            cast_path = root / "cast.json"
            characters_path = root / "characters.json"
            cast_path.write_text(json.dumps(cast("socrates")), encoding="utf-8")
            characters_path.write_text(
                json.dumps(characters(character("socrates"))), encoding="utf-8"
            )
            original = cast_path.read_bytes()
            with self.assertRaisesRegex(
                CastFinalizationError, "canonical CharacterCatalog validation failed"
            ):
                finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    validator_path=validator,
                    finalizer_path=finalizer,
                )
            final_bytes = cast_path.read_bytes()

        self.assertEqual(final_bytes, original)

    def test_authoritative_validator_blocks_census_drift_and_meletus_pruning(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary).resolve()
            audio = root / "audio"
            audio.mkdir()
            characters_path = audio / "characters.json"
            cast_path = audio / "cast.json"
            census_path = audio / "english-tei-speaker-census.json"
            validator = REPO_ROOT / "scripts" / "audio" / "validate_character_catalog.ts"
            accepted = accepted_canonical_character_catalog()
            characters_path.write_text(json.dumps(accepted), encoding="utf-8")
            census_bytes = (REPO_ROOT / "audio" / "english-tei-speaker-census.json").read_bytes()
            census_path.write_bytes(census_bytes)

            owner_ids = sorted(
                {
                    row["characterId"]
                    for row in accepted["characters"]
                    if any(
                        appearance["performanceRole"] == "voice-owner"
                        for appearance in row["appearances"]
                    )
                }
            )
            cast_path.write_text(
                json.dumps(cast(*owner_ids, status="complete")), encoding="utf-8"
            )
            original_cast = cast_path.read_bytes()

            census_path.write_bytes(census_bytes + b"\n")
            with self.assertRaisesRegex(CastFinalizationError, "source_hash_mismatch"):
                finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="2026-07-16",
                    validator_path=validator,
                )
            census_path.write_bytes(census_bytes)

            downgrade = json.loads(json.dumps(accepted))
            meletus = next(
                row for row in downgrade["characters"] if row["characterId"] == "meletus"
            )
            apology = next(
                appearance
                for appearance in meletus["appearances"]
                if appearance["dialogue"] == "apology"
            )
            apology["performanceRole"] = "reported-only"
            apology["roleFlags"].append("reported-speaker")
            apology["editorialNote"] = "Schema-valid malicious downgrade."
            characters_path.write_text(json.dumps(downgrade), encoding="utf-8")
            with self.assertRaisesRegex(CastFinalizationError, "invalid_editorial_evidence"):
                finalize(
                    cast_path=cast_path,
                    characters_path=characters_path,
                    repo_root=root,
                    write=True,
                    prune_non_owners=True,
                    reconciled_at="2026-07-16",
                    validator_path=validator,
                )
            final_cast = cast_path.read_bytes()
            reconciliation_exists = (audio / "cast-reconciliations").exists()

        self.assertEqual(final_cast, original_cast)
        self.assertFalse(reconciliation_exists)

    def test_rejects_partial_character_catalog(self) -> None:
        people = characters(character("socrates"))
        people["status"] = "partial"
        with self.assertRaisesRegex(CastFinalizationError, "must be complete"):
            build_completion_report(cast("socrates"), people)


if __name__ == "__main__":
    unittest.main()
