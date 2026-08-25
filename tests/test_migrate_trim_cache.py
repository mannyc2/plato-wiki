from __future__ import annotations

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np
import soundfile as sf


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))
sys.path.insert(0, str(REPO_ROOT / "tests"))

import render_dots  # noqa: E402
from migrate_trim_cache import (  # noqa: E402
    TrimCacheMigrationError,
    migrate_trim_caches,
)
from test_render_dots import (  # noqa: E402
    acceptance,
    cast_registry,
    runtime_provenance,
    screenplay,
    write_wav,
)


def write_plan_artifact(plan: dict, outdir: Path) -> Path:
    path = outdir / "plans" / f"{plan['plan_sha256']}.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(plan, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return path


def old_plan_from(new_plan: dict) -> dict:
    old_plan = copy.deepcopy(new_plan)
    for task in old_plan["tasks"]:
        task["input"]["renderer"]["version"] = 3
        task["input"]["renderer"]["code_sha256"] = "0" * 64
        task["input"]["audio"]["trim_threshold_db"] = -60.0
        task["input_sha256"] = render_dots.content_sha256(task["input"])
    old_plan["plan_sha256"] = render_dots.content_sha256(
        {key: value for key, value in old_plan.items() if key != "plan_sha256"}
    )
    return old_plan


class TrimCacheFixture:
    def __init__(self, root: Path, *, long_screenplay: bool = False) -> None:
        self.root = root
        self.outdir = root / "renders"
        self.outdir.mkdir()
        reference = root / "audio/references/socrates.wav"
        write_wav(reference, frames=144_000)
        cast = cast_registry(render_dots.sha256_file(reference))
        cast_path = root / "audio/cast.json"
        cast_path.parent.mkdir(parents=True, exist_ok=True)
        cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
        cast_sha256 = render_dots.sha256_file(cast_path)
        text = (
            " ".join(f"word{index}" for index in range(100))
            if long_screenplay
            else "Why have you come so early, Crito?"
        )
        self.new_plan = render_dots.build_render_plan(
            screenplay(cast_sha256, text=text),
            cast,
            acceptance=acceptance(cast_sha256),
            renderer_code_sha256=render_dots.sha256_file(
                Path(render_dots.__file__).resolve()
            ),
            runtime_provenance=runtime_provenance(),
            repo_root=root,
            reference_overrides={},
        )
        self.old_plan = old_plan_from(self.new_plan)
        self.new_plan_path = write_plan_artifact(self.new_plan, self.outdir)
        self.old_plan_path = write_plan_artifact(self.old_plan, self.outdir)
        for task in self.old_plan["tasks"]:
            self.write_old_cache(task)

    def pinned_plan_shas(self):
        return patch.multiple(
            "migrate_trim_cache",
            REQUIRED_OLD_PLAN_SHA256=self.old_plan["plan_sha256"],
            REQUIRED_NEW_PLAN_SHA256=self.new_plan["plan_sha256"],
        )

    def rewrite_old_plan(self) -> None:
        self.old_plan["plan_sha256"] = render_dots.content_sha256(
            {
                key: value
                for key, value in self.old_plan.items()
                if key != "plan_sha256"
            }
        )
        self.old_plan_path.unlink()
        self.old_plan_path = write_plan_artifact(self.old_plan, self.outdir)

    def write_old_cache(self, task: dict) -> None:
        _, wav_path, sidecar_path = render_dots.cache_paths(
            self.outdir, task["input_sha256"]
        )
        wav_path.parent.mkdir(parents=True)
        # 0.001 is above the v3 threshold but below the v4 threshold when the
        # utterance peak is 0.5.  The v4 safety window retains only its tail.
        samples = np.concatenate(
            (
                np.full(2_400, 0.001, dtype=np.float32),
                np.full(480, 0.5, dtype=np.float32),
            )
        )
        sf.write(wav_path, samples, 48_000, format="WAV", subtype="PCM_24")
        metadata = render_dots._wav_metadata(wav_path)
        sidecar = {
            "schema_version": render_dots.RENDER_CACHE_SCHEMA_VERSION,
            "input_sha256": task["input_sha256"],
            "input": task["input"],
            "audio": {
                **metadata,
                "sha256": render_dots.sha256_file(wav_path),
                "duration_seconds": metadata["frames"] / 48_000,
                "peak_gpu_mib": 123.5,
            },
            "runtime": {
                "provenance": copy.deepcopy(task["input"]["runtime_provenance"]),
                "generation_seconds": 4.25,
            },
        }
        sidecar_path.write_text(
            json.dumps(sidecar, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )


class TrimCacheMigrationTest(unittest.TestCase):
    def test_migrates_then_skips_current_valid_cache_and_preserves_synthesis_metrics(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = TrimCacheFixture(Path(raw_root))
            with fixture.pinned_plan_shas():
                result = migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            self.assertEqual(result["migrated"], 1)
            self.assertEqual(result["skipped"], 0)
            new_task = fixture.new_plan["tasks"][0]
            self.assertTrue(render_dots.validate_cached_task(new_task, fixture.outdir))
            _, _, sidecar_path = render_dots.cache_paths(
                fixture.outdir, new_task["input_sha256"]
            )
            sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
            self.assertLess(sidecar["audio"]["frames"], 2_880)
            self.assertEqual(sidecar["audio"]["peak_gpu_mib"], 123.5)
            self.assertEqual(sidecar["runtime"]["generation_seconds"], 4.25)

            with fixture.pinned_plan_shas():
                rerun = migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            self.assertEqual(rerun["migrated"], 0)
            self.assertEqual(rerun["skipped"], 1)

    def test_rejects_any_task_input_change_outside_the_three_pinned_fields(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = TrimCacheFixture(Path(raw_root))
            task = fixture.old_plan["tasks"][0]
            task["input"]["voice"]["seed"] += 1
            task["input_sha256"] = render_dots.content_sha256(task["input"])
            fixture.rewrite_old_plan()
            with self.assertRaisesRegex(
                TrimCacheMigrationError, "outside the permitted trim policy fields"
            ), fixture.pinned_plan_shas():
                migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            for new_task in fixture.new_plan["tasks"]:
                self.assertFalse(
                    render_dots.cache_paths(
                        fixture.outdir, new_task["input_sha256"]
                    )[0].exists()
                )

    def test_preflights_all_old_cache_hashes_before_publishing_any_destination(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = TrimCacheFixture(Path(raw_root), long_screenplay=True)
            self.assertGreater(len(fixture.old_plan["tasks"]), 1)
            corrupt_task = fixture.old_plan["tasks"][-1]
            _, corrupt_wav, _ = render_dots.cache_paths(
                fixture.outdir, corrupt_task["input_sha256"]
            )
            with corrupt_wav.open("ab") as handle:
                handle.write(b"corrupt")
            with self.assertRaisesRegex(
                TrimCacheMigrationError, "WAV checksum mismatch"
            ), fixture.pinned_plan_shas():
                migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            for new_task in fixture.new_plan["tasks"]:
                self.assertFalse(
                    render_dots.cache_paths(
                        fixture.outdir, new_task["input_sha256"]
                    )[0].exists()
                )

    def test_rejects_any_plan_other_than_the_exact_pinned_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = TrimCacheFixture(Path(raw_root))
            with self.assertRaisesRegex(
                TrimCacheMigrationError,
                "old plan SHA-256 is not the required pinned plan",
            ):
                migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            with patch(
                "migrate_trim_cache.REQUIRED_OLD_PLAN_SHA256",
                fixture.old_plan["plan_sha256"],
            ), self.assertRaisesRegex(
                TrimCacheMigrationError,
                "new plan SHA-256 is not the required pinned plan",
            ):
                migrate_trim_caches(
                    old_plan_path=fixture.old_plan_path,
                    new_plan_path=fixture.new_plan_path,
                    outdir=fixture.outdir,
                )
            for new_task in fixture.new_plan["tasks"]:
                self.assertFalse(
                    render_dots.cache_paths(
                        fixture.outdir, new_task["input_sha256"]
                    )[0].exists()
                )


if __name__ == "__main__":
    unittest.main()
