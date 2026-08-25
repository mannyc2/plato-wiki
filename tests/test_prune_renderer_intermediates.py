from __future__ import annotations

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from master_audio import (  # noqa: E402
    MECHANICAL_ACCEPTANCE_REASON,
    _renderer_binding,
)
from prune_renderer_intermediates import (  # noqa: E402
    PruneContractError,
    build_prune_plan,
    execute_prune_plan,
    load_prune_plan,
    prune_receipt_path,
    write_prune_plan,
)
from render_dots import (  # noqa: E402
    ASSEMBLY_SCHEMA_VERSION,
    CHAPTER_CONTAINER_PROFILE,
    MASTER_CONTAINER_PROFILE,
    RENDER_CACHE_SCHEMA_VERSION,
    _assembly_wav_metadata,
    build_chapter_assembly_input,
    build_master_assembly_input,
    build_render_plan,
    cache_paths,
    content_sha256,
    resolve_full_dialogue_assembly,
    sha256_file,
    write_render_plan,
)
from tests.test_render_dots import (  # noqa: E402
    acceptance,
    cast_registry,
    runtime_provenance,
    screenplay,
    write_rf64_wav,
    write_wav,
)


def write_json(path: Path, value: object) -> str:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(value, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return sha256_file(path)


def materialize_fixture(root: Path) -> dict[str, object]:
    repo_root = root / "repo"
    renderer_outdir = root / "renderer"
    artifact_root = root / "recording-artifacts"
    repo_root.mkdir()
    renderer_outdir.mkdir()
    artifact_root.mkdir()

    reference = repo_root / "audio/references/socrates.wav"
    write_wav(reference, frames=144_000)
    cast = cast_registry(sha256_file(reference))
    cast_path = repo_root / "audio/cast.json"
    cast_sha = write_json(cast_path, cast)
    screenplay_value = screenplay(cast_sha)
    screenplay_path = repo_root / "audio/scripts/crito.json"
    screenplay_sha = write_json(screenplay_path, screenplay_value)

    render_plan = build_render_plan(
        screenplay_value,
        cast,
        acceptance=acceptance(
            cast_sha,
            screenplay_sha256=screenplay_sha,
        ),
        renderer_code_sha256="e" * 64,
        runtime_provenance=runtime_provenance(),
        repo_root=repo_root,
        reference_overrides={},
    )
    renderer_plan_path = write_render_plan(render_plan, renderer_outdir)
    task = render_plan["tasks"][0]
    task_directory, task_wav, task_sidecar_path = cache_paths(
        renderer_outdir, task["input_sha256"]
    )
    write_wav(task_wav, sample_width=3)
    task_sidecar = {
        "schema_version": RENDER_CACHE_SCHEMA_VERSION,
        "input_sha256": task["input_sha256"],
        "input": task["input"],
        "audio": {
            "sha256": sha256_file(task_wav),
            "channels": 1,
            "sample_rate": 48_000,
            "frames": 480,
            "sample_width_bytes": 3,
            "duration_seconds": 0.01,
            "peak_gpu_mib": 0.0,
        },
        "runtime": {
            "provenance": runtime_provenance(),
            "generation_seconds": 0.1,
        },
    }
    write_json(task_sidecar_path, task_sidecar)
    chapter_id = render_plan["chapters"][0]
    task_output = {
        "input_sha256": task["input_sha256"],
        "audio_sha256": sha256_file(task_wav),
        "frames": 480,
        "sidecar_sha256": sha256_file(task_sidecar_path),
    }
    chapter_input = build_chapter_assembly_input(
        chapter_id,
        render_plan["tasks"],
        [task_output],
    )
    chapter_digest = content_sha256(chapter_input)
    chapter_directory = (
        renderer_outdir / "units/chapters" / chapter_id / chapter_digest
    )
    chapter_wav = chapter_directory / "audio.wav"
    write_wav(chapter_wav, frames=480, sample_width=3)
    chapter_timing = [
        {
            **chapter_input["segments"][0],
            "start_frame": 0,
            "end_frame": 480,
            "start_seconds": 0.0,
            "end_seconds": 0.01,
        }
    ]
    chapter_sidecar = {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "input_sha256": chapter_digest,
        "input": chapter_input,
        "audio": {
            **_assembly_wav_metadata(
                chapter_wav, CHAPTER_CONTAINER_PROFILE
            ),
            "sha256": sha256_file(chapter_wav),
            "duration_seconds": 0.01,
        },
        "timing": chapter_timing,
        "timing_sha256": content_sha256(chapter_timing),
    }
    chapter_sidecar_path = chapter_directory / "render.json"
    write_json(chapter_sidecar_path, chapter_sidecar)

    master_input = build_master_assembly_input(
        "crito",
        [
            {
                "chapter_id": chapter_id,
                "input_sha256": chapter_digest,
                "audio_sha256": sha256_file(chapter_wav),
                "frames": 480,
                "timing_sha256": chapter_sidecar["timing_sha256"],
                "sidecar_sha256": sha256_file(chapter_sidecar_path),
            }
        ],
    )
    complete_digest = content_sha256(master_input)
    complete_directory = (
        renderer_outdir / "units/complete" / complete_digest
    )
    complete_wav = complete_directory / "audio.wav"
    write_rf64_wav(complete_wav, frames=480)
    master_timing = [
        {
            **master_input["segments"][0],
            "start_frame": 0,
            "end_frame": 480,
            "start_seconds": 0.0,
            "end_seconds": 0.01,
        }
    ]
    chapter_starts = [
        {
            "chapter_id": chapter_id,
            "input_sha256": chapter_digest,
            "audio_sha256": sha256_file(chapter_wav),
            "frames": 480,
            "timing_sha256": chapter_sidecar["timing_sha256"],
            "sidecar_sha256": sha256_file(chapter_sidecar_path),
            "start_frame": 0,
            "start_seconds": 0.0,
        }
    ]
    complete_sidecar = {
        "schema_version": ASSEMBLY_SCHEMA_VERSION,
        "input_sha256": complete_digest,
        "input": master_input,
        "audio": {
            **_assembly_wav_metadata(complete_wav, MASTER_CONTAINER_PROFILE),
            "sha256": sha256_file(complete_wav),
            "duration_seconds": 0.01,
        },
        "timing": master_timing,
        "timing_sha256": content_sha256(master_timing),
        "chapter_starts": chapter_starts,
        "chapter_starts_sha256": content_sha256(chapter_starts),
    }
    write_json(complete_directory / "render.json", complete_sidecar)
    assembly = resolve_full_dialogue_assembly(render_plan, renderer_outdir)
    renderer, timeline = _renderer_binding(assembly)
    renderer["render_plan_artifact_sha256"] = sha256_file(renderer_plan_path)
    timeline_sha = content_sha256(timeline)

    mastering_plan = {
        "schema_version": 5,
        "status": "full-dialogue-mastering-plan",
        "plan_sha256": "",
        "implementation": {
            "name": "plato-master-audio",
            "version": 4,
            "code_sha256": "1" * 64,
        },
        "analysis_runtime": {"fixture": True},
        "dialogue": "crito",
        "renderer": renderer,
        "chapter_timeline": timeline,
        "chapter_timeline_sha256": timeline_sha,
        "tools": {"fixture": True},
        "policy": {"fixture": True},
        "source_probe": {"fixture": True},
        "first_pass": {"fixture": True},
        "boundaries": [],
        "boundaries_sha256": content_sha256([]),
        "commands": {"fixture": True},
    }
    mastering_plan["plan_sha256"] = content_sha256(
        {
            key: value
            for key, value in mastering_plan.items()
            if key != "plan_sha256"
        }
    )
    mastering_sha = mastering_plan["plan_sha256"]
    plan_relative = f"plans/{mastering_sha}.json"
    result_relative = f"artifacts/{mastering_sha}/mastering.json"
    mechanical_relative = f"artifacts/{mastering_sha}/mechanical-qa.json"
    working_relative = f"artifacts/{mastering_sha}/master.wav"
    publication_relative = f"artifacts/{mastering_sha}/publication.mp3"
    mastering_plan_artifact_sha = write_json(
        artifact_root / plan_relative, mastering_plan
    )

    working_path = artifact_root / working_relative
    write_rf64_wav(
        working_path,
        frames=assembly["complete"]["frames"],
    )
    publication_path = artifact_root / publication_relative
    publication_path.write_bytes(b"fixture publication MP3 bytes")
    outputs = {
        "working_master": {
            "filename": "master.wav",
            "sha256": sha256_file(working_path),
        },
        "publication": {
            "filename": "publication.mp3",
            "sha256": sha256_file(publication_path),
        },
    }
    common = {
        "dialogue": "crito",
        "mastering_plan_sha256": mastering_sha,
        "renderer": renderer,
        "chapter_timeline": timeline,
        "chapter_timeline_sha256": timeline_sha,
    }
    mechanical_qa = {
        "schema_version": 5,
        "status": "mechanical-pass-unaccepted",
        **common,
        "gates": {
            "loudness_passed": True,
            "clipping_passed": True,
            "duration_passed": True,
            "silence_passed": True,
            "mechanical_passed": True,
        },
        "acceptance": {
            "accepted": False,
            "reason": MECHANICAL_ACCEPTANCE_REASON,
        },
        "asr": {"status": "not-performed"},
        "listening": {"status": "not-performed"},
        "outputs": outputs,
    }
    mechanical_sha = write_json(
        artifact_root / mechanical_relative, mechanical_qa
    )
    result = {
        "schema_version": 5,
        "status": "mastered-mechanical-evidence-only",
        **common,
        "outputs": outputs,
        "mechanical_qa_sha256": mechanical_sha,
        "mechanical_passed": True,
        "accepted": False,
    }
    result_sha = write_json(artifact_root / result_relative, result)

    accepted_qa = {
        "schema_version": 1,
        "dialogue": "crito",
        "status": "accepted",
        "script_sha256": screenplay_sha,
        "cast_sha256": cast_sha,
        "audio": {
            "master_path": working_relative,
            "master_sha256": sha256_file(working_path),
        },
        "chapters": [{"chapter_id": render_plan["chapters"][0]}],
    }
    qa_sha = write_json(repo_root / "audio/qa/crito.json", accepted_qa)
    production = {
        "screenplay_sha256": screenplay_sha,
        "qa_sha256": qa_sha,
        "mastering_plan_path": plan_relative,
        "mastering_plan_artifact_sha256": mastering_plan_artifact_sha,
        "mastering_plan_sha256": mastering_sha,
        "mastering_result_path": result_relative,
        "mastering_result_sha256": result_sha,
        "mechanical_qa_path": mechanical_relative,
        "mechanical_qa_sha256": mechanical_sha,
        "working_master_path": working_relative,
        "working_master_sha256": sha256_file(working_path),
        "publication_path": publication_relative,
        "publication_sha256": sha256_file(publication_path),
    }
    manifest = {
        "schema_version": 2,
        "recording_id": "rec_crito_fixture",
        "dialogue": "crito",
        "status": "accepted",
        "production": production,
        "audio": {
            "path": publication_relative,
            "mime_type": "audio/mpeg",
            "duration_seconds": assembly["complete"]["duration_seconds"],
            "sha256": sha256_file(publication_path),
        },
        "chapters": [
            {
                "chapter_id": screenplay_value["chapters"][0]["id"],
                "commentary_id": screenplay_value["chapters"][0][
                    "commentary_id"
                ],
                "start_frame": timeline[0]["start_frame"],
            }
        ],
    }
    manifest_path = repo_root / "wiki/recordings/crito.json"
    write_json(manifest_path, manifest)
    return {
        "repo_root": repo_root,
        "renderer_outdir": renderer_outdir,
        "artifact_root": artifact_root,
        "manifest_path": manifest_path,
        "task_directory": task_directory,
        "chapter_directory": chapter_directory,
        "complete_directory": complete_directory,
        "renderer_plan_path": renderer_plan_path,
        "working_path": working_path,
        "publication_path": publication_path,
    }


class RendererIntermediatePrunerTest(unittest.TestCase):
    def test_dry_plan_writes_nothing_and_execute_preserves_accepted_recording(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = materialize_fixture(Path(raw_root))
            receipt_root = fixture["renderer_outdir"] / "pruning"
            plan = build_prune_plan(
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
            )
            self.assertFalse(receipt_root.exists())
            for key in (
                "task_directory",
                "chapter_directory",
                "complete_directory",
            ):
                self.assertTrue(fixture[key].is_dir())

            plan_path = write_prune_plan(
                plan,
                renderer_outdir=fixture["renderer_outdir"],
                receipt_root=receipt_root,
            )
            saved = load_prune_plan(
                plan_path,
                expected_sha256=plan["plan_sha256"],
                receipt_root=receipt_root,
            )
            receipt, created = execute_prune_plan(
                saved,
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
                receipt_root=receipt_root,
            )
            self.assertTrue(created)
            self.assertTrue(receipt["accepted_recording_preserved"])
            for key in (
                "task_directory",
                "chapter_directory",
                "complete_directory",
            ):
                self.assertFalse(fixture[key].exists())
            for key in (
                "manifest_path",
                "renderer_plan_path",
                "working_path",
                "publication_path",
            ):
                self.assertTrue(fixture[key].is_file())
            self.assertTrue(
                prune_receipt_path(
                    receipt_root, "crito", plan["plan_sha256"]
                ).is_file()
            )

            resumed, resumed_created = execute_prune_plan(
                saved,
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
                receipt_root=receipt_root,
            )
            self.assertFalse(resumed_created)
            self.assertEqual(resumed, receipt)

    def test_unaccepted_manifest_fails_without_pruning(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = materialize_fixture(Path(raw_root))
            manifest = json.loads(
                fixture["manifest_path"].read_text(encoding="utf-8")
            )
            manifest["status"] = "draft"
            write_json(fixture["manifest_path"], manifest)
            with self.assertRaisesRegex(PruneContractError, "not an accepted"):
                build_prune_plan(
                    recording_manifest=fixture["manifest_path"],
                    repo_root=fixture["repo_root"],
                    renderer_outdir=fixture["renderer_outdir"],
                    recording_artifact_root=fixture["artifact_root"],
                )
            self.assertTrue(fixture["task_directory"].is_dir())
            self.assertTrue(fixture["complete_directory"].is_dir())

    def test_changed_renderer_bytes_fail_before_any_target_moves(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = materialize_fixture(Path(raw_root))
            receipt_root = fixture["renderer_outdir"] / "pruning"
            plan = build_prune_plan(
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
            )
            plan_path = write_prune_plan(
                plan,
                renderer_outdir=fixture["renderer_outdir"],
                receipt_root=receipt_root,
            )
            saved = load_prune_plan(
                plan_path,
                expected_sha256=plan["plan_sha256"],
                receipt_root=receipt_root,
            )
            task_wav = fixture["task_directory"] / "audio.wav"
            task_wav.write_bytes(task_wav.read_bytes() + b"tamper")
            with self.assertRaisesRegex(
                PruneContractError, "renderer plan or assembly validation failed"
            ):
                execute_prune_plan(
                    saved,
                    recording_manifest=fixture["manifest_path"],
                    repo_root=fixture["repo_root"],
                    renderer_outdir=fixture["renderer_outdir"],
                    recording_artifact_root=fixture["artifact_root"],
                    receipt_root=receipt_root,
                )
            self.assertTrue(fixture["task_directory"].is_dir())
            self.assertTrue(fixture["chapter_directory"].is_dir())
            self.assertTrue(fixture["complete_directory"].is_dir())

    def test_execute_plan_requires_the_exact_reviewed_hash(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = materialize_fixture(Path(raw_root))
            receipt_root = fixture["renderer_outdir"] / "pruning"
            plan = build_prune_plan(
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
            )
            plan_path = write_prune_plan(
                plan,
                renderer_outdir=fixture["renderer_outdir"],
                receipt_root=receipt_root,
            )
            with self.assertRaisesRegex(
                PruneContractError, "canonical content-addressed path"
            ):
                load_prune_plan(
                    plan_path,
                    expected_sha256="0" * 64,
                    receipt_root=receipt_root,
                )

    def test_interrupted_quarantine_resumes_from_bound_journal(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            fixture = materialize_fixture(Path(raw_root))
            receipt_root = fixture["renderer_outdir"] / "pruning"
            plan = build_prune_plan(
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
            )
            plan_path = write_prune_plan(
                plan,
                renderer_outdir=fixture["renderer_outdir"],
                receipt_root=receipt_root,
            )
            saved = load_prune_plan(
                plan_path,
                expected_sha256=plan["plan_sha256"],
                receipt_root=receipt_root,
            )
            target_paths = {
                fixture[key].resolve()
                for key in (
                    "task_directory",
                    "chapter_directory",
                    "complete_directory",
                )
            }
            real_replace = os.replace
            target_moves = 0

            def fail_second_target_move(source, destination) -> None:
                nonlocal target_moves
                source_path = Path(source).resolve(strict=False)
                if source_path in target_paths:
                    target_moves += 1
                    if target_moves == 2:
                        raise OSError("fixture interruption")
                real_replace(source, destination)

            with (
                patch(
                    "prune_renderer_intermediates.os.replace",
                    side_effect=fail_second_target_move,
                ),
                self.assertRaisesRegex(OSError, "fixture interruption"),
            ):
                execute_prune_plan(
                    saved,
                    recording_manifest=fixture["manifest_path"],
                    repo_root=fixture["repo_root"],
                    renderer_outdir=fixture["renderer_outdir"],
                    recording_artifact_root=fixture["artifact_root"],
                    receipt_root=receipt_root,
                )

            self.assertFalse(fixture["task_directory"].exists())
            self.assertTrue(fixture["chapter_directory"].exists())
            self.assertTrue(
                (
                    receipt_root
                    / "in-progress"
                    / f"{plan['plan_sha256']}.json"
                ).is_file()
            )
            receipt, created = execute_prune_plan(
                saved,
                recording_manifest=fixture["manifest_path"],
                repo_root=fixture["repo_root"],
                renderer_outdir=fixture["renderer_outdir"],
                recording_artifact_root=fixture["artifact_root"],
                receipt_root=receipt_root,
            )
            self.assertTrue(created)
            self.assertTrue(receipt["accepted_recording_preserved"])
            for key in (
                "task_directory",
                "chapter_directory",
                "complete_directory",
            ):
                self.assertFalse(fixture[key].exists())


if __name__ == "__main__":
    unittest.main()
