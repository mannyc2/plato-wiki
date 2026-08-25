from __future__ import annotations

import hashlib
import json
import os
import sys
import tempfile
import unittest
import wave
from contextlib import contextmanager
from dataclasses import asdict
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from audition_dots_reference import canonical_json, sha256_file  # noqa: E402
from batch_render_dots_auditions import (  # noqa: E402
    BatchRenderError,
    load_jobs,
    run_batch,
)


@contextmanager
def working_directory(path: Path):
    previous = Path.cwd()
    os.chdir(path)
    try:
        yield
    finally:
        os.chdir(previous)


def write_reference(root: Path, character_id: str, video_id: str) -> tuple[Path, Path]:
    directory = root / "refs" / character_id
    directory.mkdir(parents=True, exist_ok=True)
    wav = directory / f"{video_id}.wav"
    with wave.open(str(wav), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(48_000)
        handle.writeframes(b"\0\0" * 48_000)
    sidecar = directory / f"{video_id}.json"
    sidecar.write_text(
        json.dumps(
            {
                "schemaVersion": 1,
                "plan": {
                    "dialogue": "lysis",
                    "character_id": character_id,
                    "video_id": video_id,
                    "source_url": f"https://www.youtube.com/watch?v={video_id}",
                    "prompt_text": "This is an exact source prompt with enough words.",
                },
                "wav": {"sha256": sha256_file(wav)},
            }
        ),
        encoding="utf-8",
    )
    return wav, sidecar


def write_batch(root: Path, *, source_override: str | None = None) -> Path:
    items = []
    for target, source, video in (
        ("commentary-narrator", "lysis", "video-one"),
        ("lysis", "lysis", "video-one"),
    ):
        wav, sidecar = write_reference(root, source, video)
        output = root / "batch" / target / "audition"
        items.append(
            {
                "characterId": target,
                "sourceCharacterId": source_override or source,
                "paths": {
                    "referenceWav": wav.relative_to(root).as_posix(),
                    "referenceSidecar": sidecar.relative_to(root).as_posix(),
                    "auditionDir": output.relative_to(root).as_posix(),
                },
            }
        )
    payload = {
        "schemaVersion": 1,
        "artifactKind": "dots-cast-batch-dry-run",
        "phase": "remote-render",
        "batchSha256": "a" * 64,
        "identity": {
            "policy": "remaining-canonical-dots-cast-v1",
            "batchContentSha256": "a" * 64,
            "scope": {
                "kind": "explicit-character-subset",
                "characterIds": ["commentary-narrator", "lysis"],
            },
            "targetText": "A shared audition target with enough words for deterministic testing.",
            "seeds": list(range(42, 50)),
        },
        "items": items,
    }
    payload["manifestSha256"] = hashlib.sha256(canonical_json(payload)).hexdigest()
    payload["batchManifestPath"] = "batch/manifest.json"
    path = root / "batch" / "manifest.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path


def fake_render(plan, _runtime):
    output_dir = Path(plan.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    plan_payload = asdict(plan)
    plan_payload["seeds"] = list(plan.seeds)
    plan_sha = hashlib.sha256(canonical_json(plan_payload)).hexdigest()
    outputs = []
    for seed in plan.seeds:
        path = output_dir / f"seed-{seed}.wav"
        path.write_bytes(f"audio-{seed}".encode())
        outputs.append({"seed": seed, "file": path.name, "sha256": sha256_file(path)})
    manifest = {
        "schemaVersion": 1,
        "status": "audition",
        "plan": plan_payload,
        "planSha256": plan_sha,
        "packages": {},
        "outputs": outputs,
    }
    (output_dir / "audition-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    return manifest


class BatchRenderDotsAuditionsTest(unittest.TestCase):
    def test_dry_run_plans_every_pending_item_without_loading_cuda(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest = write_batch(root)
            loads = []
            with working_directory(root):
                result = run_batch(
                    manifest,
                    repo_root=root,
                    cache_dir=root / "cache",
                    execute=False,
                    runtime_loader=lambda *_: loads.append(True),
                )
            self.assertEqual(result["status"], "planned-no-gpu-execution")
            self.assertEqual(result["completedCount"], 0)
            self.assertEqual(result["pendingCharacterIds"], ["commentary-narrator", "lysis"])
            self.assertEqual(loads, [])

    def test_execute_loads_dots_once_and_resumes_without_reloading(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest = write_batch(root)
            loads = []

            def loader(*_):
                loads.append(True)
                return object()

            with working_directory(root):
                first = run_batch(
                    manifest,
                    repo_root=root,
                    cache_dir=root / "cache",
                    execute=True,
                    runtime_loader=loader,
                    renderer=fake_render,
                )
            self.assertEqual(first["status"], "complete")
            self.assertEqual(first["completedCount"], 2)
            self.assertEqual(first["runtimeLoadCount"], 1)
            self.assertEqual(loads, [True])

            with working_directory(root):
                second = run_batch(
                    manifest,
                    repo_root=root,
                    cache_dir=root / "cache",
                    execute=True,
                    runtime_loader=loader,
                    renderer=fake_render,
                )
            self.assertEqual(second["completedCount"], 2)
            self.assertEqual(second["runtimeLoadCount"], 0)
            self.assertEqual(loads, [True])

    def test_rejects_tampered_manifest_before_inspecting_outputs(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest = write_batch(root)
            payload = json.loads(manifest.read_text())
            payload["identity"]["seeds"] = [44]
            manifest.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaisesRegex(BatchRenderError, "self hash differs"):
                load_jobs(manifest, root)

    def test_rejects_reference_source_identity_mismatch(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest = write_batch(root, source_override="socrates")
            with self.assertRaisesRegex(BatchRenderError, "source identity differs"):
                load_jobs(manifest, root)


if __name__ == "__main__":
    unittest.main()
