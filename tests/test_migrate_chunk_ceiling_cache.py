from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))
sys.path.insert(0, str(REPO_ROOT / "tests"))

import migrate_chunk_ceiling_cache as migration  # noqa: E402
import render_dots  # noqa: E402
from test_render_dots import (  # noqa: E402
    acceptance,
    cast_registry,
    runtime_provenance,
    screenplay,
    write_wav,
)


OLD_CODE = "1" * 64
NEW_CODE = render_dots.sha256_file(Path(render_dots.__file__).resolve())


def write_plan(plan: dict, outdir: Path) -> Path:
    path = outdir / "plans" / f"{plan['plan_sha256']}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(plan) + "\n", encoding="utf-8")
    return path


class ChunkCeilingFixture:
    def __init__(self, root: Path) -> None:
        self.root = root
        self.outdir = root / "artifacts"
        self.outdir.mkdir()
        reference = root / "audio/references/socrates.wav"
        write_wav(reference, frames=144_000)
        cast = cast_registry(render_dots.sha256_file(reference))
        cast_path = root / "audio/cast.json"
        cast_path.parent.mkdir(parents=True, exist_ok=True)
        cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
        cast_sha = render_dots.sha256_file(cast_path)
        script = screenplay(cast_sha, text="A short unchanged entry.")
        for entry_id in (
            "lesser-hippias-source-turn-000125",
            "lesser-hippias-source-turn-000143",
        ):
            script["entries"].append(
                {
                    "id": entry_id,
                    "chapter_id": "before-dawn",
                    "kind": "source",
                    "character_id": "socrates",
                    "text": " ".join(render_dots.ENTRY_CHUNK_OVERRIDES[entry_id]),
                    "anchor": {"stephanus": "365a"},
                    "cadence_intent": "exchange",
                }
            )
        words = sum(len(entry["text"].split()) for entry in script["entries"])
        script["coverage"]["source_words"] = words
        script["coverage"]["source_words_covered"] = words
        with (
            patch.object(render_dots, "RENDERER_VERSION", 4),
            patch.object(render_dots, "ENTRY_CHUNK_OVERRIDES", {}),
            patch.object(render_dots, "SYNTHESIS_TEXT_OVERRIDES", {}),
        ):
            self.old_plan = render_dots.build_render_plan(
                script,
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256=OLD_CODE,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
        for task in self.old_plan["tasks"]:
            task["input"]["renderer"].pop("entry_chunk_overrides")
            task["input"]["renderer"].pop("synthesis_text_overrides")
            task["input"]["utterance"].pop("synthesis_text")
            task["input_sha256"] = render_dots.content_sha256(task["input"])
        self.old_plan["plan_sha256"] = render_dots.content_sha256(
            {
                key: value
                for key, value in self.old_plan.items()
                if key != "plan_sha256"
            }
        )
        self.new_plan = render_dots.build_render_plan(
            script,
            cast,
            acceptance=acceptance(cast_sha),
            renderer_code_sha256=NEW_CODE,
            runtime_provenance=runtime_provenance(),
            repo_root=root,
            reference_overrides={},
        )
        self.old_path = write_plan(self.old_plan, self.outdir)
        self.new_path = write_plan(self.new_plan, self.outdir)
        for task in self.old_plan["tasks"]:
            self.write_cache(task)

    def write_cache(self, task: dict) -> None:
        _, wav, sidecar_path = render_dots.cache_paths(
            self.outdir, task["input_sha256"]
        )
        wav.parent.mkdir(parents=True)
        write_wav(wav, frames=4_800, sample_width=3)
        metadata = render_dots._wav_metadata(wav)
        sidecar = {
            "schema_version": render_dots.RENDER_CACHE_SCHEMA_VERSION,
            "input_sha256": task["input_sha256"],
            "input": task["input"],
            "audio": {
                **metadata,
                "sha256": render_dots.sha256_file(wav),
                "duration_seconds": metadata["frames"] / render_dots.SAMPLE_RATE,
                "peak_gpu_mib": 100.0,
            },
            "runtime": {
                "provenance": copy.deepcopy(task["input"]["runtime_provenance"]),
                "generation_seconds": 1.0,
            },
        }
        sidecar_path.write_text(json.dumps(sidecar) + "\n", encoding="utf-8")

    def pins(self):
        return patch.multiple(
            migration,
            REQUIRED_OLD_PLAN_SHA256=self.old_plan["plan_sha256"],
            REQUIRED_OLD_CODE_SHA256=OLD_CODE,
            REQUIRED_NEW_CODE_SHA256=NEW_CODE,
        )


class ChunkCeilingMigrationTests(unittest.TestCase):
    def test_reuses_only_unchanged_units_and_leaves_split_units_pending(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = ChunkCeilingFixture(Path(directory))
            with fixture.pins():
                result = migration.migrate_chunk_ceiling_caches(
                    old_plan_path=fixture.old_path,
                    new_plan_path=fixture.new_path,
                    outdir=fixture.outdir,
                )
            self.assertEqual(result["reusable_task_count"], 1)
            self.assertEqual(result["migrated"], 1)
            self.assertEqual(result["rerender_task_count"], 4)
            self.assertEqual(
                result["status"],
                "dots-targeted-repair-cache-migration-complete",
            )
            self.assertTrue(
                render_dots.validate_cached_task(
                    fixture.new_plan["tasks"][0], fixture.outdir
                )
            )
            self.assertTrue(
                all(
                    not render_dots.validate_cached_task(task, fixture.outdir)
                    for task in fixture.new_plan["tasks"][1:]
                )
            )

    def test_refuses_reuse_when_voice_input_changes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            fixture = ChunkCeilingFixture(Path(directory))
            fixture.new_plan["tasks"][0]["input"]["voice"] = copy.deepcopy(
                fixture.new_plan["tasks"][0]["input"]["voice"]
            )
            fixture.new_plan["tasks"][0]["input"]["voice"]["seed"] += 1
            fixture.new_plan["tasks"][0]["input_sha256"] = render_dots.content_sha256(
                fixture.new_plan["tasks"][0]["input"]
            )
            fixture.new_plan["plan_sha256"] = render_dots.content_sha256(
                {
                    key: value
                    for key, value in fixture.new_plan.items()
                    if key != "plan_sha256"
                }
            )
            fixture.new_path.unlink()
            fixture.new_path = write_plan(fixture.new_plan, fixture.outdir)
            with fixture.pins(), self.assertRaisesRegex(
                migration.ChunkCeilingMigrationError,
                "must reuse some tasks",
            ):
                migration.reusable_pairs(fixture.old_plan, fixture.new_plan)


if __name__ == "__main__":
    unittest.main()
