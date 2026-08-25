from __future__ import annotations

import base64
import hashlib
import importlib
import json
import struct
import sys
import tempfile
import unittest
import wave
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))

from cast_acceptance import CAST_ACCEPTANCE_GATES, CAST_ENGINE_POLICY  # noqa: E402

from render_dots import (  # noqa: E402
    ASSEMBLY_SCHEMA_VERSION,
    BOUNDARY_POLICY,
    CHAPTER_CONTAINER_PROFILE,
    DOTS_PACKAGE_COMMIT,
    ENTRY_CHUNK_OVERRIDES,
    MODEL_REPOSITORY,
    MODEL_REVISION,
    MASTER_CONTAINER_PROFILE,
    MAX_CHUNK_CHARACTERS,
    PACKAGE_PINS,
    RENDER_CACHE_SCHEMA_VERSION,
    RENDERER_NAME,
    RENDERER_VERSION,
    SYNTHESIS_TEXT_OVERRIDES,
    RenderContractError,
    WAV_SUBTYPE,
    _atomic_assemble_master,
    _assembly_wav_metadata,
    _python_import_provenance_for_module,
    _trim_generated_audio,
    boundary_decision,
    boundary_frames,
    build_chapter_assembly_input,
    build_master_assembly_input,
    build_render_plan,
    cache_paths,
    cadence_ms,
    canonical_json,
    content_sha256,
    crossfade_weights,
    execute_render_plan,
    hash_dots_source_tree,
    load_accepted_render_inputs,
    load_render_plan_artifact,
    model_snapshot_provenance,
    render_plan_path,
    resolve_full_dialogue_assembly,
    resolve_model_snapshot,
    sha256_file,
    split_text,
    validate_cached_task,
    validate_cast_registry,
    validate_commentary_quality_manifest,
    validate_audio_screenplay_artifact,
    validate_render_plan,
    validate_runtime_provenance,
    validate_screenplay,
    write_render_plan,
)


def write_wav(
    path: Path,
    *,
    frames: int = 480,
    sample_rate: int = 48_000,
    sample_width: int = 2,
    sample_byte: int = 1,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(sample_width)
        handle.setframerate(sample_rate)
        handle.writeframes(
            (bytes([sample_byte]) + b"\x00" * (sample_width - 1)) * frames
        )


def write_rf64_wav(
    path: Path,
    *,
    frames: int = 480,
    sample_rate: int = 48_000,
    sample_byte: int = 1,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data = (bytes([sample_byte]) + b"\x00\x00") * frames
    padding = b"\x00" if len(data) & 1 else b""
    pcm_guid = bytes.fromhex("0100000000001000800000aa00389b71")
    format_payload = struct.pack(
        "<HHIIHHHHI16s",
        0xFFFE,
        1,
        sample_rate,
        sample_rate * 3,
        3,
        24,
        22,
        24,
        4,
        pcm_guid,
    )
    riff_size = (
        4 + (8 + 28) + (8 + len(format_payload)) + (8 + len(data)) + len(padding)
    )
    ds64_payload = struct.pack("<QQQI", riff_size, len(data), frames, 0)
    path.write_bytes(
        b"RF64"
        + struct.pack("<I", 0xFFFFFFFF)
        + b"WAVE"
        + b"ds64"
        + struct.pack("<I", len(ds64_payload))
        + ds64_payload
        + b"fmt "
        + struct.pack("<I", len(format_payload))
        + format_payload
        + b"data"
        + struct.pack("<I", 0xFFFFFFFF)
        + data
        + padding
    )


def cast_registry(reference_sha256: str, *, seed: int = 44) -> dict[str, object]:
    return {
        "schemaVersion": 3,
        "status": "partial",
        "updatedAt": "2026-07-12",
        "enginePolicy": CAST_ENGINE_POLICY,
        "voices": [
            {
                "characterId": "socrates",
                "displayName": "Socrates",
                "status": "selected",
                "engine": "dots.tts-soar",
                "model": {
                    "repository": MODEL_REPOSITORY,
                    "revision": MODEL_REVISION,
                },
                "mode": "continuation-voice-cloning",
                "seed": seed,
                "reference": {
                    "sourceUrl": "https://www.youtube.com/watch?v=MNDfJMrH1XY",
                    "sourceRegistryPath": "audio/reference-sources.json",
                    "sourceRegistrySha256": "3" * 64,
                    "sourceDialogue": "crito",
                    "sourceVideoId": "MNDfJMrH1XY",
                    "sourceCharacterId": "socrates",
                    "videoStartSeconds": 1.0,
                    "videoEndSeconds": 4.0,
                    "localDurationSeconds": 3.0,
                    "localSha256": reference_sha256,
                    "promptText": "The exact reference transcript.",
                    "relativePath": "audio/references/socrates.wav",
                    "referenceAsr": {
                        "decision": "primary-zero-error",
                        "primaryExpectedWords": 8,
                        "primaryOrdinaryWordErrors": 0,
                        "primaryOrdinaryWordErrorRate": 0,
                        "primaryEvidencePath": "scratch/evidence/reference-asr.json",
                        "primaryEvidenceSha256": "4" * 64,
                    },
                    "speakerPurityEvidencePath": "scratch/evidence/purity.json",
                    "speakerPurityEvidenceSha256": "5" * 64,
                    "speakerPurityProofRecordId": "existing-socrates-selection",
                    "speakerPuritySourceAgreementSha256": "7" * 64,
                    "speakerPurityMethod": "jowett-caption-turn-alignment-v1",
                    "dominantSpeakerCoverage": 1,
                    "competingSpeakerCoverage": 0,
                    "uncoveredSpeakerCoverage": 0,
                },
                "generation": {
                    "numSteps": 24,
                    "guidanceScale": 1.2,
                    "speakerScale": 1.5,
                    "language": "EN",
                    "precision": "bfloat16",
                },
                "audition": {
                    "relativePath": "scratch/auditions/socrates-seed44.wav",
                    "sha256": "1" * 64,
                    "durationSeconds": 20,
                    "expectedWords": 40,
                    "ordinaryWordErrors": 0,
                    "ordinaryWordErrorRate": 0,
                    "asrEvidencePath": "scratch/evidence/audition-asr.json",
                    "asrEvidenceSha256": "6" * 64,
                    "meanSpeakerCosineSimilarity": 0.9,
                    "minimumWindowSpeakerCosineSimilarity": 0.88,
                    "acousticEvidencePath": "scratch/evidence/acoustic.json",
                    "acousticEvidenceSha256": "7" * 64,
                    "clippedSamples": 0,
                    "truePeakDbtp": -1,
                    "peakAmplitude": 0.9,
                },
                "selection": {
                    "basis": "operator-authorized-deterministic-gates",
                    "policy": "cast-auto-accept-v1",
                    "acceptedAt": "2026-07-12",
                    "label": "fixture-seed44",
                    "allGatesPassed": True,
                    "candidateSelection": "operator-pinned",
                    "evaluatedCandidateCount": 8,
                    "passingCandidateCount": 8,
                    "selectedRank": 4,
                    "decisionPath": "audio/cast-decisions/socrates.json",
                    "decisionSha256": "8" * 64,
                    "sourceAssignment": {
                        "kind": "same-character",
                        "authorizedBy": "operator",
                        "reason": "The source character matches the voice owner.",
                    },
                },
            }
        ],
    }


def materialize_cast_decision(root: Path, cast: dict[str, object]) -> None:
    voice = cast["voices"][0]
    selection = voice["selection"]
    decision_core = {
        "schemaVersion": 1,
        "status": "accepted-deterministic-cast-decision",
        "policy": "cast-auto-accept-v1",
        "acceptedAt": selection["acceptedAt"],
        "characterId": voice["characterId"],
        "sourceCharacterId": voice["reference"]["sourceCharacterId"],
        "candidateSelection": selection["candidateSelection"],
        "rankingPolicy": "fixture-ranking",
        "inputs": {},
        "reference": voice["reference"],
        "gates": CAST_ACCEPTANCE_GATES,
        "candidates": [],
        "selectedSeed": voice["seed"],
        "selectedPassingRank": selection["selectedRank"],
    }
    decision = {
        **decision_core,
        "decisionContentSha256": hashlib.sha256(
            canonical_json(decision_core)
        ).hexdigest(),
    }
    payload = (json.dumps(decision, indent=2) + "\n").encode("utf-8")
    path = root / selection["decisionPath"]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)
    selection["decisionSha256"] = hashlib.sha256(payload).hexdigest()


def screenplay(
    cast_sha256: str, *, text: str = "Why have you come so early, Crito?"
) -> dict[str, object]:
    return {
        "schema_version": 2,
        "dialogue": "crito",
        "source_hashes": {"english": "a" * 64, "stephanus": "b" * 64},
        "commentary_sha256": "c" * 64,
        "commentary_quality_audit_sha256": "e" * 64,
        "cast_sha256": cast_sha256,
        "generator_version": f"screenplay-generator-v3+attribution.{'d' * 64}",
        "chapters": [
            {
                "id": "before-dawn",
                "commentary_id": "comm_crito_0001",
                "title": "Before dawn",
            }
        ],
        "entries": [
            {
                "id": "crito-0001",
                "chapter_id": "before-dawn",
                "kind": "source",
                "character_id": "socrates",
                "text": text,
                "anchor": {"stephanus": "43a"},
                "cadence_intent": "exchange",
            }
        ],
        "repairs": [],
        "coverage": {
            "source_words": len(text.split()),
            "source_words_covered": len(text.split()),
            "source_words_uncovered": 0,
            "source_words_duplicated": 0,
            "commentary_blocks_expected": 0,
            "commentary_blocks_covered": 0,
            "commentary_blocks_missing": 0,
            "commentary_blocks_duplicated": 0,
        },
    }


def commentary_quality_manifest(*, decision: str = "accepted") -> dict[str, object]:
    return {
        "schema_version": 1,
        "dialogue": "crito",
        "ledger": {},
        "protocol": {},
        "authoring": {},
        "units": [],
        "acceptance": {"decision": decision},
    }


def quality_validation_evidence() -> dict[str, str]:
    return {
        "authority": "packages/harness/src/wiki/commentary-quality-audit.ts",
        "helper_sha256": "1" * 64,
        "validator_sha256": "2" * 64,
        "harness_typescript_sha256": "3" * 64,
        "harness_javascript_shadow_sha256": "5" * 64,
        "bun_sha256": "4" * 64,
        "bun_version": "1.3.9",
    }


def screenplay_validation_evidence() -> dict[str, str]:
    return {
        **quality_validation_evidence(),
        "authority": "packages/harness/src/audio-production.ts",
        "helper_sha256": "5" * 64,
        "validator_sha256": "6" * 64,
    }


def runtime_provenance() -> dict[str, object]:
    model_files = [
        {
            "path": path,
            "sha256": digest * 64,
            "size_bytes": 1,
            "storage": "regular",
            "link_target": None,
        }
        for path, digest in (
            ("config.json", "7"),
            ("model.safetensors", "8"),
            ("vocoder.safetensors", "9"),
        )
    ]
    dots_files = [
        {
            "path": "__init__.py",
            "sha256": "c" * 64,
            "size_bytes": 1,
            "storage": "regular",
            "link_target": None,
        },
        {
            "path": "runtime.py",
            "sha256": "a" * 64,
            "size_bytes": 1,
            "storage": "regular",
            "link_target": None,
        },
    ]
    distribution_root = "/fixture/site-packages"
    dots_root = f"{distribution_root}/dots_tts"
    import_specs = (
        ("numpy", "numpy", "numpy/__init__.py", True, "1"),
        ("pydantic", "pydantic", "pydantic/__init__.py", True, "2"),
        ("yaml", "PyYAML", "yaml/__init__.py", True, "3"),
        ("safetensors", "safetensors", "safetensors/__init__.py", True, "4"),
        ("soundfile", "soundfile", "soundfile.py", False, "5"),
        ("torch", "torch", "torch/__init__.py", True, "6"),
        ("torchaudio", "torchaudio", "torchaudio/__init__.py", True, "7"),
        ("transformers", "transformers", "transformers/__init__.py", True, "8"),
        ("dots_tts", "dots.tts", "dots_tts/__init__.py", True, "c"),
        ("dots_tts.runtime", "dots.tts", "dots_tts/runtime.py", False, "a"),
    )
    python_imports = []
    for module, distribution, relative, is_package, digest_character in import_specs:
        python_imports.append(
            {
                "module": module,
                "distribution": distribution,
                "version": PACKAGE_PINS[distribution],
                "distribution_root": distribution_root,
                "distribution_file": relative,
                "distribution_file_count": 3,
                "distribution_inventory_sha256": content_sha256(
                    {"inventory": distribution}
                ),
                "distribution_record_sha256": content_sha256({"record": distribution}),
                "distribution_total_bytes": 3,
                "origin": f"{distribution_root}/{relative}",
                "origin_sha256": digest_character * 64,
                "size_bytes": 1,
                "loader": "_frozen_importlib_external.SourceFileLoader",
                "package_locations": (
                    [str(Path(distribution_root, relative).parent)]
                    if is_package
                    else []
                ),
            }
        )
    return {
        "schema_version": 3,
        "packages": PACKAGE_PINS,
        "model": {
            "repository": MODEL_REPOSITORY,
            "revision": MODEL_REVISION,
            "snapshot_path": f"/fixture/model/snapshots/{MODEL_REVISION}",
            "inventory_sha256": content_sha256(model_files),
            "file_count": len(model_files),
            "total_bytes": 3,
            "files": model_files,
        },
        "dots_source": {
            "package": "dots.tts",
            "version": PACKAGE_PINS["dots.tts"],
            "commit": DOTS_PACKAGE_COMMIT,
            "package_root": dots_root,
            "direct_url_sha256": "b" * 64,
            "inventory_sha256": content_sha256(dots_files),
            "runtime_wrapper_sha256": "a" * 64,
            "file_count": len(dots_files),
            "total_bytes": 2,
            "files": dots_files,
        },
        "python_imports": python_imports,
    }


def acceptance(cast_sha256: str, *, screenplay_sha256: str = "a" * 64) -> dict:
    return {
        "screenplay_path": "audio/scripts/crito.json",
        "screenplay_sha256": screenplay_sha256,
        "cast_path": "audio/cast.json",
        "cast_sha256": cast_sha256,
        "commentary_quality_audit_path": "wiki/commentary-audits/crito.json",
        "commentary_quality_audit_sha256": "e" * 64,
        "commentary_quality_validation": quality_validation_evidence(),
        "screenplay_validation": screenplay_validation_evidence(),
        "accepted_attribution_path": "audio/speaker-attributions/crito.json",
        "accepted_attribution_sha256": "d" * 64,
    }


def synthetic_task_outputs(tasks: list[dict]) -> list[dict]:
    return [
        {
            "input_sha256": task["input_sha256"],
            "audio_sha256": f"{index + 1:064x}",
            "frames": 480,
            "sidecar_sha256": f"{index + 101:064x}",
        }
        for index, task in enumerate(tasks)
    ]


def write_fake_distribution(
    site_packages: Path,
    *,
    name: str,
    version: str,
    files: dict[str, str],
) -> None:
    payloads: dict[str, bytes] = {}
    for relative, payload in files.items():
        path = site_packages / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(payload, encoding="utf-8")
        payloads[relative] = payload.encode("utf-8")
    normalized = name.replace(".", "_").replace("-", "_")
    metadata = site_packages / f"{normalized}-{version}.dist-info"
    metadata.mkdir(parents=True)
    metadata_relative = f"{metadata.name}/METADATA"
    metadata_payload = (
        f"Metadata-Version: 2.1\nName: {name}\nVersion: {version}\n"
    ).encode("utf-8")
    (metadata / "METADATA").write_bytes(metadata_payload)
    payloads[metadata_relative] = metadata_payload
    record_relative = f"{metadata.name}/RECORD"
    record_lines = []
    for relative, payload in sorted(payloads.items()):
        digest = base64.urlsafe_b64encode(hashlib.sha256(payload).digest()).rstrip(b"=")
        record_lines.append(
            f"{relative},sha256={digest.decode('ascii')},{len(payload)}\n"
        )
    record_lines.append(f"{record_relative},,\n")
    (metadata / "RECORD").write_text(
        "".join(record_lines),
        encoding="utf-8",
    )


class DotsRendererPureTest(unittest.TestCase):
    def test_trim_removes_low_level_onset_stall_but_keeps_safety_audio(self) -> None:
        import numpy as np

        low_level_onset = np.full(48_000, 0.0008, dtype=np.float32)
        speech = np.full(4_800, 0.5, dtype=np.float32)
        trimmed = _trim_generated_audio(
            np.concatenate((low_level_onset, speech)), 48_000
        )
        self.assertEqual(len(trimmed), 4_800 + round(48_000 * 0.03))
        self.assertTrue(np.all(trimmed[: round(48_000 * 0.03)] == 0.0008))

    def test_cast_registry_hard_cuts_to_character_voice_ownership(self) -> None:
        current = cast_registry("a" * 64)
        self.assertEqual(set(validate_cast_registry(current)), {"socrates"})

        legacy = deepcopy(current)
        legacy["schemaVersion"] = 1
        with self.assertRaisesRegex(RenderContractError, "expected 3"):
            validate_cast_registry(legacy)

        switching = deepcopy(current)
        switching["enginePolicy"]["reportedSpeech"] = "switch-to-reported-character"
        with self.assertRaisesRegex(
            RenderContractError, "operator-authorized deterministic policy"
        ):
            validate_cast_registry(switching)

    def test_canonical_hash_is_order_independent_and_content_sensitive(self) -> None:
        first = {"voice": {"seed": 44, "steps": 24}, "text": "hello"}
        reordered = {"text": "hello", "voice": {"steps": 24, "seed": 44}}
        changed = {"text": "hello", "voice": {"steps": 24, "seed": 45}}
        self.assertEqual(canonical_json(first), canonical_json(reordered))
        self.assertEqual(content_sha256(first), content_sha256(reordered))
        self.assertNotEqual(content_sha256(first), content_sha256(changed))

    def test_model_snapshot_provenance_rejects_directory_symlink_and_hashes_weights(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            cache = root / "hub"
            repository = cache / "models--rednote-hilab--dots.tts-soar"
            snapshot = repository / "snapshots" / MODEL_REVISION
            blobs = repository / "blobs"
            snapshot.mkdir(parents=True)
            blobs.mkdir()
            payloads = {
                "config.json": b"{}\n",
                "model.safetensors": b"model-v1",
                "vocoder.safetensors": b"vocoder-v1",
            }
            for index, (name, payload) in enumerate(payloads.items()):
                blob = blobs / f"blob-{index}"
                blob.write_bytes(payload)
                (snapshot / name).symlink_to(Path("../../blobs") / blob.name)

            first = model_snapshot_provenance(cache)
            self.assertEqual(first["file_count"], 3)
            self.assertEqual(
                {entry["storage"] for entry in first["files"]},
                {"hf-blob-symlink"},
            )
            (blobs / "blob-1").write_bytes(b"model-v2")
            second = model_snapshot_provenance(cache)
            self.assertNotEqual(first["inventory_sha256"], second["inventory_sha256"])

        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            cache = root / "hub"
            snapshot = (
                cache
                / "models--rednote-hilab--dots.tts-soar"
                / "snapshots"
                / MODEL_REVISION
            )
            actual = root / "forged-snapshot"
            actual.mkdir()
            for name in ("config.json", "model.safetensors", "vocoder.safetensors"):
                (actual / name).write_bytes(b"forged")
            snapshot.parent.mkdir(parents=True)
            snapshot.symlink_to(actual, target_is_directory=True)
            with self.assertRaisesRegex(RuntimeError, "directory symlink"):
                resolve_model_snapshot(cache)

    def test_dots_source_tree_hash_detects_code_changes_and_rejects_symlinks(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root) / "dots_tts"
            root.mkdir()
            (root / "__init__.py").write_text("", encoding="utf-8")
            runtime = root / "runtime.py"
            module = root / "model.py"
            runtime.write_text("class Runtime: pass\n", encoding="utf-8")
            module.write_text("WEIGHT = 1\n", encoding="utf-8")
            first = hash_dots_source_tree(root)
            module.write_text("WEIGHT = 2\n", encoding="utf-8")
            second = hash_dots_source_tree(root)
            self.assertNotEqual(first["inventory_sha256"], second["inventory_sha256"])

            target = root / "target.py"
            target.write_text("unsafe = True\n", encoding="utf-8")
            link = root / "linked.py"
            link.symlink_to(target)
            with self.assertRaisesRegex(RuntimeError, "contains a symlink"):
                hash_dots_source_tree(root)

    def test_python_import_provenance_rejects_path_shadows(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root).resolve()
            site_packages = root / "site-packages"
            shadow = root / "repo-shadow"
            shadow.mkdir()
            write_fake_distribution(
                site_packages,
                name="numpy",
                version=PACKAGE_PINS["numpy"],
                files={"numpy/__init__.py": "DISTRIBUTION = True\n"},
            )
            (shadow / "numpy.py").write_text("FORGED = True\n", encoding="utf-8")
            previous_numpy = sys.modules.pop("numpy", None)
            try:
                with (
                    patch.object(
                        sys,
                        "path",
                        [str(shadow), str(site_packages), *sys.path],
                    ),
                    patch(
                        "render_dots._trusted_python_distribution_roots",
                        return_value={site_packages},
                    ),
                    self.assertRaisesRegex(RuntimeError, "outside its distribution"),
                ):
                    importlib.invalidate_caches()
                    _python_import_provenance_for_module(
                        "numpy", "numpy", {"numpy": PACKAGE_PINS["numpy"]}
                    )
            finally:
                if previous_numpy is not None:
                    sys.modules["numpy"] = previous_numpy

        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root).resolve()
            site_packages = root / "site-packages"
            shadow = root / "repo-shadow"
            (shadow / "dots_tts").mkdir(parents=True)
            (shadow / "dots_tts/__init__.py").write_text(
                "FORGED = True\n", encoding="utf-8"
            )
            write_fake_distribution(
                site_packages,
                name="dots.tts",
                version=PACKAGE_PINS["dots.tts"],
                files={
                    "dots_tts/__init__.py": "DISTRIBUTION = True\n",
                    "dots_tts/runtime.py": "class DotsTtsRuntime: pass\n",
                },
            )
            previous_dots = sys.modules.pop("dots_tts", None)
            previous_runtime = sys.modules.pop("dots_tts.runtime", None)
            try:
                with (
                    patch.object(
                        sys,
                        "path",
                        [str(shadow), str(site_packages), *sys.path],
                    ),
                    patch(
                        "render_dots._trusted_python_distribution_roots",
                        return_value={site_packages},
                    ),
                    self.assertRaisesRegex(RuntimeError, "outside its distribution"),
                ):
                    importlib.invalidate_caches()
                    _python_import_provenance_for_module(
                        "dots_tts",
                        "dots.tts",
                        {"dots.tts": PACKAGE_PINS["dots.tts"]},
                    )
            finally:
                if previous_dots is not None:
                    sys.modules["dots_tts"] = previous_dots
                if previous_runtime is not None:
                    sys.modules["dots_tts.runtime"] = previous_runtime

    def test_python_import_provenance_verifies_full_distribution_inventory(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root).resolve()
            site_packages = root / "site-packages"
            native = site_packages / "numpy/_core/native.so"
            write_fake_distribution(
                site_packages,
                name="numpy",
                version=PACKAGE_PINS["numpy"],
                files={
                    "numpy/__init__.py": "DISTRIBUTION = True\n",
                    "numpy/_core/native.so": "verified-native-binary\n",
                },
            )
            previous_numpy = sys.modules.pop("numpy", None)
            try:
                with (
                    patch.object(sys, "path", [str(site_packages), *sys.path]),
                    patch(
                        "render_dots._trusted_python_distribution_roots",
                        return_value={site_packages},
                    ),
                ):
                    importlib.invalidate_caches()
                    evidence = _python_import_provenance_for_module(
                        "numpy", "numpy", {"numpy": PACKAGE_PINS["numpy"]}
                    )
                    self.assertEqual(evidence["distribution_file_count"], 4)

                    native.write_text("tampered-native-binary\n", encoding="utf-8")
                    with self.assertRaisesRegex(RuntimeError, "RECORD hash or size"):
                        _python_import_provenance_for_module(
                            "numpy", "numpy", {"numpy": PACKAGE_PINS["numpy"]}
                        )

                    native.write_text("verified-native-binary\n", encoding="utf-8")
                    (site_packages / "numpy/_core/forged.so").write_text(
                        "unrecorded-native-binary\n", encoding="utf-8"
                    )
                    with self.assertRaisesRegex(RuntimeError, "unrecorded file"):
                        _python_import_provenance_for_module(
                            "numpy", "numpy", {"numpy": PACKAGE_PINS["numpy"]}
                        )
            finally:
                if previous_numpy is not None:
                    sys.modules["numpy"] = previous_numpy

    def test_runtime_provenance_is_strict_and_content_addressed(self) -> None:
        valid = runtime_provenance()
        validate_runtime_provenance(valid)
        tampered = deepcopy(valid)
        tampered["model"]["files"][1]["sha256"] = "f" * 64
        with self.assertRaisesRegex(RenderContractError, "summary is inconsistent"):
            validate_runtime_provenance(tampered)
        tampered = deepcopy(valid)
        tampered["python_imports"][-1]["distribution_inventory_sha256"] = "f" * 64
        with self.assertRaisesRegex(
            RenderContractError, "repeated distribution evidence is inconsistent"
        ):
            validate_runtime_provenance(tampered)

    def test_chunker_is_lossless_bounded_and_prefers_semantic_boundaries(self) -> None:
        text = (
            "Crito has entered the prison before sunrise, and the watchman knows him. "
            "Socrates sleeps while his friend waits in silence; the ship is near. "
            "The argument has not yet begun."
        )
        chunks = split_text(text, limit=76)
        self.assertEqual(" ".join(chunks), text)
        self.assertTrue(all(len(chunk) <= 76 for chunk in chunks))
        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(chunk[-1] in ",.;?!" for chunk in chunks[:-1]))

    def test_chunker_rejects_an_unsplittable_token(self) -> None:
        with self.assertRaisesRegex(RenderContractError, "unsplittable token"):
            split_text("x" * 81, limit=80)

    def test_failed_asr_entries_bind_exact_fragments_and_case_only_synthesis(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            script = screenplay(cast_sha, text="A harmless preface.")
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
                        "text": " ".join(ENTRY_CHUNK_OVERRIDES[entry_id]),
                        "anchor": {"stephanus": "365a"},
                        "cadence_intent": "exchange",
                    }
                )
            words = sum(len(entry["text"].split()) for entry in script["entries"])
            script["coverage"]["source_words"] = words
            script["coverage"]["source_words_covered"] = words

            plan = build_render_plan(
                script,
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            validate_render_plan(plan)
            repair_tasks = {
                entry_id: [
                    task
                    for task in plan["tasks"]
                    if task["input"]["utterance"]["spans"][0]["entry_id"]
                    == entry_id
                ]
                for entry_id in ENTRY_CHUNK_OVERRIDES
            }
            self.assertEqual(
                [task["input"]["utterance"]["text"] for task in repair_tasks[
                    "lesser-hippias-source-turn-000125"
                ]],
                ENTRY_CHUNK_OVERRIDES["lesser-hippias-source-turn-000125"],
            )
            self.assertEqual(
                [task["input"]["utterance"]["text"] for task in repair_tasks[
                    "lesser-hippias-source-turn-000143"
                ]],
                ENTRY_CHUNK_OVERRIDES["lesser-hippias-source-turn-000143"],
            )
            first = repair_tasks["lesser-hippias-source-turn-000125"][0]
            self.assertEqual(
                first["input"]["utterance"]["text"],
                "in order that I may profit by learning something.",
            )
            self.assertEqual(
                first["input"]["utterance"]["synthesis_text"],
                SYNTHESIS_TEXT_OVERRIDES[
                    "lesser-hippias-source-turn-000125"
                ]["0"],
            )
            self.assertEqual(
                repair_tasks["lesser-hippias-source-turn-000125"][1]["input"]
                ["utterance"]["synthesis_text"],
                repair_tasks["lesser-hippias-source-turn-000125"][1]["input"]
                ["utterance"]["text"],
            )
            self.assertEqual(MAX_CHUNK_CHARACTERS, 320)

            tampered = deepcopy(plan)
            tampered_task = next(
                task
                for task in tampered["tasks"]
                if task["input"]["utterance"]["spans"][0]["entry_id"]
                == "lesser-hippias-source-turn-000125"
            )
            tampered_task["input"]["utterance"]["synthesis_text"] = (
                "In order that I may benefit by learning something."
            )
            tampered_task["input_sha256"] = content_sha256(tampered_task["input"])
            tampered["plan_sha256"] = content_sha256(
                {key: value for key, value in tampered.items() if key != "plan_sha256"}
            )
            with self.assertRaisesRegex(
                RenderContractError, "exact registered override"
            ):
                validate_render_plan(tampered)

    def test_cadence_is_semantic_punctuation_aware_and_never_one_second(self) -> None:
        self.assertEqual(cadence_ms("exchange", None, same_speaker=False), 0)
        self.assertEqual(
            cadence_ms("exchange", "Are you awake?", same_speaker=False), 140
        )
        self.assertEqual(cadence_ms("exchange", "I am awake.", same_speaker=False), 125)
        self.assertEqual(cadence_ms("short_reply", "Yes.", same_speaker=False), 105)
        self.assertEqual(cadence_ms("exchange", "I am awake.", same_speaker=True), 0)
        self.assertEqual(
            cadence_ms("commentary", "I am awake.", same_speaker=False), 280
        )
        self.assertEqual(cadence_ms("chapter", "I am awake.", same_speaker=False), 550)
        self.assertLess(
            max(
                cadence_ms(intent, "Is it so?", same_speaker=False)
                for intent in (
                    "continuation",
                    "short_reply",
                    "exchange",
                    "reflective",
                    "commentary",
                    "chapter",
                )
            ),
            1000,
        )

    def test_screenplay_validator_enforces_anchor_ids_and_cadence(self) -> None:
        valid = screenplay("d" * 64)
        validate_screenplay(valid)

        missing_anchor = deepcopy(valid)
        del missing_anchor["entries"][0]["anchor"]
        with self.assertRaisesRegex(RenderContractError, "missing fields: anchor"):
            validate_screenplay(missing_anchor)

        bad_cadence = deepcopy(valid)
        bad_cadence["entries"][0]["cadence_intent"] = "one-second-gap"
        with self.assertRaisesRegex(RenderContractError, "cadence_intent"):
            validate_screenplay(bad_cadence)

        duplicate = deepcopy(valid)
        duplicate["entries"].append(deepcopy(duplicate["entries"][0]))
        with self.assertRaisesRegex(RenderContractError, "duplicate id"):
            validate_screenplay(duplicate)

        legacy = deepcopy(valid)
        legacy["schema_version"] = 1
        with self.assertRaisesRegex(RenderContractError, "expected 2"):
            validate_screenplay(legacy)

        missing_quality = deepcopy(valid)
        del missing_quality["commentary_quality_audit_sha256"]
        with self.assertRaisesRegex(
            RenderContractError, "missing fields: commentary_quality_audit_sha256"
        ):
            validate_screenplay(missing_quality)

        legacy_generator = deepcopy(valid)
        legacy_generator["generator_version"] = (
            f"screenplay-generator-v1+attribution.{'d' * 64}"
        )
        with self.assertRaisesRegex(RenderContractError, "screenplay-generator-v3"):
            validate_screenplay(legacy_generator)

    def test_plan_verifies_cast_reference_and_hashes_every_voice_input(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            materialize_cast_decision(root, cast)
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            script = screenplay(cast_sha)

            plan = build_render_plan(
                script,
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            self.assertEqual(len(plan["tasks"]), 1)
            validate_render_plan(plan)
            self.assertEqual(
                content_sha256(
                    {key: value for key, value in plan.items() if key != "plan_sha256"}
                ),
                plan["plan_sha256"],
            )
            self.assertTrue(plan["cast_completion"]["complete_for_screenplay"])
            task = plan["tasks"][0]
            self.assertEqual(content_sha256(task["input"]), task["input_sha256"])
            self.assertEqual(task["input"]["voice"]["seed"], 44)
            self.assertEqual(
                task["input"]["voice"]["reference"]["sha256"],
                sha256_file(reference),
            )
            self.assertEqual(task["input"]["runtime_provenance"], runtime_provenance())

            changed_runtime = runtime_provenance()
            changed_runtime["model"]["files"][1]["sha256"] = "f" * 64
            changed_runtime["model"]["inventory_sha256"] = content_sha256(
                changed_runtime["model"]["files"]
            )
            changed_runtime_plan = build_render_plan(
                script,
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=changed_runtime,
                repo_root=root,
                reference_overrides={},
            )
            self.assertNotEqual(
                task["input_sha256"],
                changed_runtime_plan["tasks"][0]["input_sha256"],
            )

            changed_cast = cast_registry(sha256_file(reference), seed=45)
            changed_cast_path = root / "audio/changed-cast.json"
            changed_cast_path.write_text(
                json.dumps(changed_cast) + "\n", encoding="utf-8"
            )
            changed_cast_sha = sha256_file(changed_cast_path)
            changed_plan = build_render_plan(
                screenplay(changed_cast_sha),
                changed_cast,
                acceptance=acceptance(changed_cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            self.assertNotEqual(
                task["input_sha256"], changed_plan["tasks"][0]["input_sha256"]
            )

            with self.assertRaisesRegex(RenderContractError, "cast_sha256"):
                build_render_plan(
                    screenplay("f" * 64),
                    cast,
                    acceptance=acceptance(cast_sha),
                    renderer_code_sha256="e" * 64,
                    runtime_provenance=runtime_provenance(),
                    repo_root=root,
                    reference_overrides={},
                )

            reference.write_bytes(b"corrupt")
            with self.assertRaisesRegex(RenderContractError, "reference hash mismatch"):
                build_render_plan(
                    script,
                    cast,
                    acceptance=acceptance(cast_sha),
                    renderer_code_sha256="e" * 64,
                    runtime_provenance=runtime_provenance(),
                    repo_root=root,
                    reference_overrides={},
                )

    def test_accepted_loader_requires_canonical_files_and_current_dependencies(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            english = root / "raw/plato/english/crito.txt"
            stephanus = root / "derived/plato/stephanus-english/crito.toon"
            commentary = root / "wiki/commentary/crito.md"
            quality_audit = root / "wiki/commentary-audits/crito.json"
            for path, payload in (
                (english, b"canonical English source\n"),
                (stephanus, b"canonical Stephanus map\n"),
                (commentary, b"# Crito commentary\n"),
                (
                    quality_audit,
                    (json.dumps(commentary_quality_manifest()) + "\n").encode(),
                ),
            ):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(payload)

            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            materialize_cast_decision(root, cast)
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)

            attribution_path = root / "audio/speaker-attributions/crito.json"
            attribution_path.parent.mkdir(parents=True, exist_ok=True)
            attribution_path.write_text(
                json.dumps(
                    {
                        "schema_version": 2,
                        "voice_policy": "reported-speech-inherits-active-character-v1",
                        "status": "accepted",
                        "dialogue": "crito",
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            attribution_sha = sha256_file(attribution_path)
            script = screenplay(cast_sha)
            script["source_hashes"] = {
                "english": sha256_file(english),
                "stephanus": sha256_file(stephanus),
            }
            script["commentary_sha256"] = sha256_file(commentary)
            script["commentary_quality_audit_sha256"] = sha256_file(quality_audit)
            script["generator_version"] = (
                f"screenplay-generator-v3+attribution.{attribution_sha}"
            )
            script_path = root / "audio/scripts/crito.json"
            script_path.parent.mkdir(parents=True, exist_ok=True)
            script_path.write_text(json.dumps(script) + "\n", encoding="utf-8")

            validation_evidence = quality_validation_evidence()
            screenplay_evidence = screenplay_validation_evidence()
            with (
                patch(
                    "render_dots.validate_commentary_quality_manifest",
                    return_value=validation_evidence,
                ) as validate_quality,
                patch(
                    "render_dots.validate_audio_screenplay_artifact",
                    return_value=screenplay_evidence,
                ) as validate_script,
            ):
                loaded_script, loaded_cast, evidence = load_accepted_render_inputs(
                    Path("audio/scripts/crito.json"),
                    Path("audio/cast.json"),
                    repo_root=root,
                )
            self.assertEqual(loaded_script, script)
            self.assertEqual(loaded_cast, cast)
            self.assertEqual(evidence["screenplay_sha256"], sha256_file(script_path))
            self.assertEqual(
                evidence["commentary_quality_audit_sha256"],
                sha256_file(quality_audit),
            )
            self.assertEqual(
                evidence["commentary_quality_validation"], validation_evidence
            )
            self.assertEqual(evidence["screenplay_validation"], screenplay_evidence)
            self.assertEqual(evidence["accepted_attribution_sha256"], attribution_sha)
            validate_quality.assert_called_once_with(
                quality_audit.resolve(),
                dialogue="crito",
                repo_root=root.resolve(),
            )
            validate_script.assert_called_once_with(
                dialogue="crito",
                repo_root=root.resolve(),
            )

            scratch_script = root / "scratch/crito.json"
            scratch_script.parent.mkdir(parents=True)
            scratch_script.write_text(json.dumps(script) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(RenderContractError, "must be canonical"):
                load_accepted_render_inputs(
                    scratch_script,
                    cast_path,
                    repo_root=root,
                )

            original_quality = quality_audit.read_bytes()
            quality_audit.unlink()
            with self.assertRaisesRegex(
                RenderContractError, "missing accepted screenplay dependency"
            ):
                load_accepted_render_inputs(
                    Path("audio/scripts/crito.json"),
                    Path("audio/cast.json"),
                    repo_root=root,
                )

            quality_audit.write_bytes(original_quality + b" ")
            with self.assertRaisesRegex(
                RenderContractError, "commentary quality audit hash mismatch"
            ):
                load_accepted_render_inputs(
                    Path("audio/scripts/crito.json"),
                    Path("audio/cast.json"),
                    repo_root=root,
                )

            quality_audit.write_bytes(original_quality)
            english.write_text("tampered\n", encoding="utf-8")
            with self.assertRaisesRegex(RenderContractError, "english hash mismatch"):
                load_accepted_render_inputs(
                    Path("audio/scripts/crito.json"),
                    Path("audio/cast.json"),
                    repo_root=root,
                )

    def test_quality_preflight_rejects_pending_and_malformed_manifests(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest_path = root / "wiki/commentary-audits/crito.json"
            manifest_path.parent.mkdir(parents=True)
            manifest_path.write_text(
                json.dumps(commentary_quality_manifest(decision="pending")) + "\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(RenderContractError, "operator-delegated Luna sample accepted"):
                validate_commentary_quality_manifest(
                    manifest_path,
                    dialogue="crito",
                    repo_root=root,
                )

            manifest_path.write_text("{", encoding="utf-8")
            with self.assertRaisesRegex(RenderContractError, "cannot read JSON object"):
                validate_commentary_quality_manifest(
                    manifest_path,
                    dialogue="crito",
                    repo_root=root,
                )

    def test_quality_preflight_uses_authoritative_validator_and_rejects_stale(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            manifest_path = root / "wiki/commentary-audits/crito.json"
            helper = root / "scripts/audio/validate_commentary_quality_audit.ts"
            validator = root / "packages/harness/src/wiki/commentary-quality-audit.ts"
            harness_source = root / "packages/harness/src/paths.ts"
            fake_bun = root / "bin/bun"
            for path, payload in (
                (manifest_path, json.dumps(commentary_quality_manifest()) + "\n"),
                (helper, "// helper\n"),
                (validator, "// validator\n"),
                (harness_source, "// dependency\n"),
                (fake_bun, "#!/bin/sh\n"),
            ):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(payload, encoding="utf-8")

            version = Mock(returncode=0, stdout="1.3.9\n", stderr="")
            stale = Mock(
                returncode=1,
                stdout="",
                stderr="review_note_hash_mismatch\n",
            )
            with (
                patch("render_dots.shutil.which", return_value=str(fake_bun)),
                patch("render_dots.subprocess.run", side_effect=[version, stale]),
                self.assertRaisesRegex(
                    RenderContractError, "review_note_hash_mismatch"
                ),
            ):
                validate_commentary_quality_manifest(
                    manifest_path,
                    dialogue="crito",
                    repo_root=root,
                )

            receipt = Mock(
                returncode=0,
                stdout=json.dumps(
                    {
                        "schema_version": 1,
                        "dialogue": "crito",
                        "decision": "accepted",
                    }
                )
                + "\n",
                stderr="",
            )
            with (
                patch("render_dots.shutil.which", return_value=str(fake_bun)),
                patch(
                    "render_dots.subprocess.run",
                    side_effect=[version, receipt],
                ) as run,
            ):
                evidence = validate_commentary_quality_manifest(
                    manifest_path,
                    dialogue="crito",
                    repo_root=root,
                )
            self.assertEqual(evidence["bun_version"], "1.3.9")
            self.assertEqual(evidence["bun_sha256"], sha256_file(fake_bun))
            self.assertEqual(evidence["helper_sha256"], sha256_file(helper))
            self.assertEqual(evidence["validator_sha256"], sha256_file(validator))
            self.assertEqual(run.call_count, 2)

    def test_screenplay_preflight_rejects_altered_source_and_commentary_text(
        self,
    ) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            helper = root / "scripts/audio/validate_audio_screenplay.ts"
            validator = root / "packages/harness/src/audio-production.ts"
            harness_source = root / "packages/harness/src/paths.ts"
            fake_bun = root / "bin/bun"
            for path, payload in (
                (helper, "// helper\n"),
                (validator, "// validator\n"),
                (harness_source, "// dependency\n"),
                (fake_bun, "#!/bin/sh\n"),
            ):
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(payload, encoding="utf-8")

            javascript_shadow = validator.with_suffix(".js")
            javascript_shadow.write_text(
                "export const validateAudioScriptArtifact = () => [];\n",
                encoding="utf-8",
            )
            with (
                patch("render_dots.shutil.which", return_value=str(fake_bun)),
                patch("render_dots.subprocess.run") as run,
                self.assertRaisesRegex(
                    RenderContractError, "executable JavaScript shadow"
                ),
            ):
                validate_audio_screenplay_artifact(
                    dialogue="crito",
                    repo_root=root,
                )
            run.assert_not_called()
            javascript_shadow.unlink()

            for detail in (
                "source_coverage_failure: altered source entry text",
                "commentary_coverage_failure: altered commentary text or ID",
            ):
                with (
                    patch("render_dots.shutil.which", return_value=str(fake_bun)),
                    patch(
                        "render_dots.subprocess.run",
                        side_effect=[
                            Mock(returncode=0, stdout="1.3.9\n", stderr=""),
                            Mock(returncode=1, stdout="", stderr=detail),
                        ],
                    ),
                    self.assertRaisesRegex(RenderContractError, detail.split(":")[0]),
                ):
                    validate_audio_screenplay_artifact(
                        dialogue="crito",
                        repo_root=root,
                    )

            with (
                patch("render_dots.shutil.which", return_value=str(fake_bun)),
                patch(
                    "render_dots.subprocess.run",
                    side_effect=[
                        Mock(returncode=0, stdout="1.3.9\n", stderr=""),
                        Mock(
                            returncode=0,
                            stdout=json.dumps(
                                {
                                    "schema_version": 2,
                                    "dialogue": "crito",
                                    "valid": True,
                                }
                            )
                            + "\n",
                            stderr="",
                        ),
                    ],
                ),
            ):
                evidence = validate_audio_screenplay_artifact(
                    dialogue="crito",
                    repo_root=root,
                )
            self.assertEqual(
                evidence["authority"], "packages/harness/src/audio-production.ts"
            )

    def test_plan_rejects_an_incomplete_selected_cast(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            script = screenplay(cast_sha)
            crito_entry = deepcopy(script["entries"][0])
            crito_entry.update(
                {
                    "id": "crito-0002",
                    "character_id": "crito",
                    "text": "I came because the ship is near.",
                    "cadence_intent": "exchange",
                }
            )
            script["entries"].append(crito_entry)
            source_words = sum(
                len(entry["text"].split()) for entry in script["entries"]
            )
            script["coverage"]["source_words"] = source_words
            script["coverage"]["source_words_covered"] = source_words
            with self.assertRaisesRegex(
                RenderContractError, "character without cast entry: crito"
            ):
                build_render_plan(
                    script,
                    cast,
                    acceptance=acceptance(cast_sha),
                    renderer_code_sha256="e" * 64,
                    runtime_provenance=runtime_provenance(),
                    repo_root=root,
                    reference_overrides={},
                )

    def test_safe_same_speaker_units_and_explicit_boundaries(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            crito_voice = deepcopy(cast["voices"][0])
            crito_voice["characterId"] = "crito"
            crito_voice["displayName"] = "Crito"
            crito_voice["reference"]["sourceCharacterId"] = "crito"
            crito_voice["selection"]["label"] = "fixture-crito"
            crito_voice["audition"]["relativePath"] = "scratch/auditions/crito.wav"
            cast["voices"].append(crito_voice)
            cast_path = root / "audio/cast.json"
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            script = screenplay(cast_sha, text="Are you awake?")
            script["entries"].extend(
                [
                    {
                        "id": "crito-0002",
                        "chapter_id": "before-dawn",
                        "kind": "source",
                        "character_id": "socrates",
                        "text": "I have been awake for some time.",
                        "anchor": {"stephanus": "43a"},
                        "cadence_intent": "continuation",
                    },
                    {
                        "id": "crito-0003",
                        "chapter_id": "before-dawn",
                        "kind": "source",
                        "character_id": "socrates",
                        "text": "The question deserves reflection.",
                        "anchor": {"stephanus": "43b"},
                        "cadence_intent": "reflective",
                    },
                    {
                        "id": "crito-0004",
                        "chapter_id": "before-dawn",
                        "kind": "source",
                        "character_id": "crito",
                        "text": "Yes.",
                        "anchor": {"stephanus": "43b"},
                        "cadence_intent": "short_reply",
                    },
                ]
            )
            source_words = sum(
                len(entry["text"].split()) for entry in script["entries"]
            )
            script["coverage"]["source_words"] = source_words
            script["coverage"]["source_words_covered"] = source_words

            plan = build_render_plan(
                script,
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )

            self.assertEqual(len(plan["tasks"]), 3)
            self.assertEqual(
                plan["tasks"][0]["input"]["utterance"]["unit_kind"],
                "same-speaker-continuation",
            )
            self.assertEqual(
                [
                    entry["id"]
                    for entry in plan["tasks"][0]["input"]["screenplay"]["entries"]
                ],
                ["crito-0001", "crito-0002"],
            )
            for task in plan["tasks"]:
                self.assertEqual(
                    len(
                        {
                            entry["character_id"]
                            for entry in task["input"]["screenplay"]["entries"]
                        }
                    ),
                    1,
                )
            assembly = build_chapter_assembly_input(
                "before-dawn",
                plan["tasks"],
                synthetic_task_outputs(plan["tasks"]),
            )
            boundaries = [
                segment["boundary_before"] for segment in assembly["segments"]
            ]
            self.assertEqual(boundaries[0]["kind"], "start")
            self.assertEqual(
                boundaries[1],
                {
                    "kind": "same-speaker-continuation",
                    "pause_ms": 0,
                    "crossfade_ms": 18,
                },
            )
            self.assertEqual(boundaries[2]["kind"], "speaker-change")
            self.assertEqual(boundaries[2]["pause_ms"], 105)
            self.assertEqual(boundaries[2]["crossfade_ms"], 0)

    def test_boundary_frames_crossfade_and_chapter_policy_are_mechanical(self) -> None:
        prior = {
            "chapter_id": "one",
            "kind": "source",
            "character_id": "socrates",
            "text": "Is it so?",
            "cadence_intent": "exchange",
        }
        same = {**prior, "text": "It is.", "cadence_intent": "continuation"}
        changed = {**same, "character_id": "crito", "cadence_intent": "exchange"}
        commentary = {
            **changed,
            "kind": "commentary",
            "cadence_intent": "commentary",
        }
        chapter = {**changed, "chapter_id": "two", "cadence_intent": "chapter"}

        same_decision = boundary_decision(prior, same)
        self.assertEqual(boundary_frames(same_decision), (0, 864))
        self.assertEqual(boundary_decision(prior, changed)["pause_ms"], 140)
        self.assertEqual(boundary_decision(prior, commentary)["pause_ms"], 280)
        self.assertEqual(boundary_decision(prior, chapter)["pause_ms"], 550)
        self.assertLess(
            max(
                policy["pause_ms"]
                for name, policy in BOUNDARY_POLICY.items()
                if name != "schema_version"
            ),
            1000,
        )
        weights = crossfade_weights(4)
        self.assertEqual(weights, (0.2, 0.4, 0.6, 0.8))
        master = build_master_assembly_input(
            "crito",
            [
                {
                    "chapter_id": "one",
                    "input_sha256": "1" * 64,
                    "audio_sha256": "3" * 64,
                    "frames": 480,
                    "timing_sha256": "4" * 64,
                    "sidecar_sha256": "5" * 64,
                },
                {
                    "chapter_id": "two",
                    "input_sha256": "2" * 64,
                    "audio_sha256": "6" * 64,
                    "frames": 960,
                    "timing_sha256": "7" * 64,
                    "sidecar_sha256": "8" * 64,
                },
            ],
        )
        self.assertEqual(
            boundary_frames(master["segments"][1]["boundary_before"]),
            (26_400, 0),
        )

    def test_render_plan_artifact_is_deterministic_and_tamper_evident(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            arguments = {
                "acceptance": acceptance(cast_sha),
                "renderer_code_sha256": "e" * 64,
                "runtime_provenance": runtime_provenance(),
                "repo_root": root,
                "reference_overrides": {},
            }
            first = build_render_plan(screenplay(cast_sha), cast, **arguments)
            second = build_render_plan(screenplay(cast_sha), cast, **arguments)
            self.assertEqual(first, second)
            invalid_span = deepcopy(first)
            invalid_span["tasks"][0]["input"]["utterance"]["spans"][0][
                "end_character"
            ] -= 1
            invalid_span["tasks"][0]["input_sha256"] = content_sha256(
                invalid_span["tasks"][0]["input"]
            )
            invalid_span["plan_sha256"] = content_sha256(
                {
                    key: value
                    for key, value in invalid_span.items()
                    if key != "plan_sha256"
                }
            )
            with self.assertRaisesRegex(RenderContractError, "span offsets"):
                validate_render_plan(invalid_span)
            outdir = root / "renders"
            path = write_render_plan(first, outdir)
            original = path.read_bytes()
            self.assertEqual(write_render_plan(second, outdir), path)
            self.assertEqual(path.read_bytes(), original)
            self.assertEqual(
                path,
                render_plan_path(outdir, first["plan_sha256"]),
            )
            self.assertEqual(
                load_render_plan_artifact(
                    path,
                    expected_sha256=first["plan_sha256"],
                    current_plan=second,
                ),
                first,
            )

            tampered = json.loads(path.read_text(encoding="utf-8"))
            tampered["tasks"][0]["input"]["voice"]["seed"] = 45
            path.write_text(json.dumps(tampered) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(RenderContractError, "content address"):
                load_render_plan_artifact(
                    path,
                    expected_sha256=first["plan_sha256"],
                )

    def test_render_plan_write_rejects_a_precreated_symlink_temp(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            plan = build_render_plan(
                screenplay(cast_sha),
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            outdir = (root / "renders").resolve()
            plan_directory = outdir / "plans"
            plan_directory.mkdir(parents=True)
            uuid_hex = "a" * 32
            final = render_plan_path(outdir, plan["plan_sha256"])
            temporary = plan_directory / f".{final.name}.{uuid_hex}.tmp"
            target = root / "must-not-change.txt"
            target.write_text("untouched", encoding="utf-8")
            temporary.symlink_to(target)

            with (
                patch("render_dots.uuid.uuid4", return_value=Mock(hex=uuid_hex)),
                self.assertRaisesRegex(
                    RenderContractError, "temporary path already exists"
                ),
            ):
                write_render_plan(plan, outdir)

            self.assertEqual(target.read_text(encoding="utf-8"), "untouched")
            self.assertTrue(temporary.is_symlink())
            self.assertFalse(final.exists())

    def test_repository_never_restores_the_rejected_socrates_reference(self) -> None:
        cast = json.loads((REPO_ROOT / "audio/cast.json").read_text(encoding="utf-8"))
        matches = [
            voice for voice in cast["voices"] if voice["characterId"] == "socrates"
        ]
        self.assertLessEqual(len(matches), 1)
        if matches:
            socrates = matches[0]
            self.assertEqual(socrates["seed"], 44)
            self.assertEqual(
                socrates["selection"]["label"], "dots-crito-socrates-seed44"
            )
            self.assertEqual(socrates["reference"]["videoStartSeconds"], 65.92)
            self.assertEqual(socrates["reference"]["videoEndSeconds"], 72.28)

    def test_missing_cast_reference_has_actionable_override_error(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "reference.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            del cast["voices"][0]["reference"]["relativePath"]
            cast_path = root / "cast.json"
            cast_path.write_text(json.dumps(cast), encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            with self.assertRaisesRegex(
                RenderContractError, "pass --reference socrates="
            ):
                build_render_plan(
                    screenplay(cast_sha),
                    cast,
                    acceptance=acceptance(cast_sha),
                    renderer_code_sha256="e" * 64,
                    runtime_provenance=runtime_provenance(),
                    repo_root=root,
                    reference_overrides={},
                )

    def test_content_addressed_sidecar_and_wav_must_validate_as_a_pair(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            outdir = root / "renders"
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            task = build_render_plan(
                screenplay(cast_sha),
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )["tasks"][0]
            self.assertFalse(validate_cached_task(task, outdir))
            directory, wav_path, sidecar_path = cache_paths(
                outdir, task["input_sha256"]
            )
            write_wav(wav_path, sample_width=3)
            sidecar = {
                "schema_version": RENDER_CACHE_SCHEMA_VERSION,
                "input_sha256": task["input_sha256"],
                "input": task["input"],
                "audio": {
                    "sha256": sha256_file(wav_path),
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
            sidecar_path.write_text(json.dumps(sidecar) + "\n", encoding="utf-8")
            self.assertTrue(validate_cached_task(task, outdir))

            sidecar["audio"]["sha256"] = "0" * 64
            sidecar_path.write_text(json.dumps(sidecar) + "\n", encoding="utf-8")
            with self.assertRaisesRegex(RenderContractError, "WAV checksum mismatch"):
                validate_cached_task(task, outdir)

            sidecar["audio"]["sha256"] = sha256_file(wav_path)
            sidecar_path.write_text(json.dumps(sidecar) + "\n", encoding="utf-8")
            (directory / "unexpected.bin").write_bytes(b"not in sidecar")
            with self.assertRaisesRegex(
                RenderContractError, "partial content-addressed render"
            ):
                validate_cached_task(task, outdir)
            (directory / "unexpected.bin").unlink()

            sidecar_path.unlink()
            self.assertTrue(directory.exists())
            with self.assertRaisesRegex(
                RenderContractError, "partial content-addressed render"
            ):
                validate_cached_task(task, outdir)

    def test_fully_cached_execution_skips_runtime_and_still_assembles(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            plan = build_render_plan(
                screenplay(cast_sha),
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            chapter_digest = "a" * 64
            master_digest = "b" * 64
            with (
                patch(
                    "render_dots.validate_cached_task", return_value=True
                ) as validate_cache,
                patch("render_dots._load_dots_runtime") as load_runtime,
                patch(
                    "render_dots._atomic_assemble_chapter",
                    return_value=(chapter_digest, True),
                ) as assemble_chapter,
                patch(
                    "render_dots._atomic_assemble_master",
                    return_value=(master_digest, True),
                ) as assemble_master,
            ):
                result = execute_render_plan(
                    plan, root / "renders", runtime_provenance()
                )

            self.assertEqual(validate_cache.call_count, len(plan["tasks"]))
            load_runtime.assert_not_called()
            assemble_chapter.assert_called_once()
            assemble_master.assert_called_once()
            self.assertEqual(result["rendered_tasks"], 0)
            self.assertEqual(result["resumed_tasks"], len(plan["tasks"]))
            self.assertEqual(
                result["complete_unit"],
                {"input_sha256": master_digest, "status": "rendered"},
            )

    def test_corrupt_cache_fails_before_runtime_or_assembly(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            plan = build_render_plan(
                screenplay(cast_sha),
                cast,
                acceptance=acceptance(cast_sha),
                renderer_code_sha256="e" * 64,
                runtime_provenance=runtime_provenance(),
                repo_root=root,
                reference_overrides={},
            )
            with (
                patch(
                    "render_dots.validate_cached_task",
                    side_effect=RenderContractError(
                        "partial content-addressed render"
                    ),
                ),
                patch("render_dots._load_dots_runtime") as load_runtime,
                patch(
                    "render_dots._atomic_assemble_chapter"
                ) as assemble_chapter,
                self.assertRaisesRegex(
                    RenderContractError, "partial content-addressed render"
                ),
            ):
                execute_render_plan(
                    plan, root / "renders", runtime_provenance()
                )

            load_runtime.assert_not_called()
            assemble_chapter.assert_not_called()

    def test_complete_assembly_streams_forced_rf64_and_rejects_tamper(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            outdir = (root / "renders").resolve()
            chapter_refs = []
            source_frames: dict[str, int] = {}
            for index, (chapter_id, frames) in enumerate(
                (("first", 10), ("second", 12)), start=1
            ):
                scratch_wav = root / f"{chapter_id}.wav"
                write_wav(
                    scratch_wav,
                    frames=frames,
                    sample_width=3,
                    sample_byte=index,
                )
                segment = {
                    "input_sha256": f"{index:064x}",
                    "audio_sha256": sha256_file(scratch_wav),
                    "frames": frames,
                    "sidecar_sha256": f"{index + 10:064x}",
                    "entry_ids": [f"entry-{index}"],
                    "boundary_before": {
                        "kind": "start",
                        "pause_ms": 0,
                        "crossfade_ms": 0,
                    },
                }
                chapter_input = {
                    "schema_version": ASSEMBLY_SCHEMA_VERSION,
                    "renderer": {
                        "name": RENDERER_NAME,
                        "version": RENDERER_VERSION,
                        "sample_rate": 48_000,
                        "wav_subtype": WAV_SUBTYPE,
                    },
                    "boundary_policy": deepcopy(BOUNDARY_POLICY),
                    "container_profile": CHAPTER_CONTAINER_PROFILE,
                    "chapter_id": chapter_id,
                    "segments": [segment],
                }
                chapter_digest = content_sha256(chapter_input)
                chapter_dir = outdir / "units/chapters" / chapter_id / chapter_digest
                chapter_wav = chapter_dir / "audio.wav"
                write_wav(
                    chapter_wav,
                    frames=frames,
                    sample_width=3,
                    sample_byte=index,
                )
                timing = [
                    {
                        **segment,
                        "start_frame": 0,
                        "end_frame": frames,
                        "start_seconds": 0.0,
                        "end_seconds": frames / 48_000,
                    }
                ]
                metadata = _assembly_wav_metadata(
                    chapter_wav, CHAPTER_CONTAINER_PROFILE
                )
                sidecar = {
                    "schema_version": ASSEMBLY_SCHEMA_VERSION,
                    "input_sha256": chapter_digest,
                    "input": chapter_input,
                    "audio": {
                        **metadata,
                        "sha256": sha256_file(chapter_wav),
                        "duration_seconds": frames / 48_000,
                    },
                    "timing": timing,
                    "timing_sha256": content_sha256(timing),
                }
                (chapter_dir / "render.json").write_text(
                    json.dumps(sidecar) + "\n", encoding="utf-8"
                )
                chapter_refs.append(
                    {"chapter_id": chapter_id, "input_sha256": chapter_digest}
                )
                source_frames[str(chapter_wav)] = frames

            class FakeSamples(list):
                ndim = 1

            read_requests: list[int] = []
            output_opens: list[dict[str, object]] = []

            class FakeSoundFile:
                def __init__(
                    self,
                    path: Path,
                    mode: str,
                    *,
                    samplerate: int | None = None,
                    channels: int | None = None,
                    format: str | None = None,
                    subtype: str | None = None,
                ) -> None:
                    self.path = Path(path)
                    self.mode = mode
                    self.position = 0
                    if mode == "r":
                        self.samplerate = 48_000
                        self.channels = 1
                        self.frames = source_frames[str(self.path)]
                    else:
                        self.samplerate = samplerate
                        self.channels = channels
                        self.frames = 0
                        output_opens.append(
                            {
                                "format": format,
                                "subtype": subtype,
                                "samplerate": samplerate,
                                "channels": channels,
                            }
                        )

                def __enter__(self):
                    return self

                def __exit__(self, exc_type, exc, traceback) -> None:
                    del traceback
                    if self.mode == "w" and exc_type is None:
                        write_rf64_wav(self.path, frames=self.frames)

                def read(self, *, frames: int, dtype: str, always_2d: bool):
                    self.assert_read_arguments(dtype, always_2d)
                    read_requests.append(frames)
                    count = min(frames, self.frames - self.position)
                    self.position += count
                    return FakeSamples([0.0] * count)

                def assert_read_arguments(self, dtype: str, always_2d: bool) -> None:
                    if dtype != "float32" or always_2d:
                        raise AssertionError("stream read contract drifted")

                def write(self, samples) -> None:
                    self.frames += len(samples)

            fake_numpy = SimpleNamespace(
                float32="float32",
                zeros=lambda frames, dtype: FakeSamples([0.0] * frames),
            )
            fake_soundfile = SimpleNamespace(SoundFile=FakeSoundFile)
            policy = deepcopy(BOUNDARY_POLICY)
            policy["chapter_boundary"] = {"pause_ms": 1, "crossfade_ms": 0}
            with (
                patch.dict(
                    sys.modules,
                    {"numpy": fake_numpy, "soundfile": fake_soundfile},
                ),
                patch("render_dots.BOUNDARY_POLICY", policy),
                patch("render_dots.MASTER_STREAM_BLOCK_FRAMES", 4),
            ):
                master_digest, created = _atomic_assemble_master(
                    "crito", chapter_refs, outdir
                )
                self.assertTrue(created)
                self.assertEqual(
                    _atomic_assemble_master("crito", chapter_refs, outdir),
                    (master_digest, False),
                )
                master_dir = outdir / "units/complete" / master_digest
                master_sidecar = json.loads(
                    (master_dir / "render.json").read_text(encoding="utf-8")
                )
                self.assertEqual(
                    output_opens,
                    [
                        {
                            "format": "RF64",
                            "subtype": "PCM_24",
                            "samplerate": 48_000,
                            "channels": 1,
                        }
                    ],
                )
                self.assertTrue(read_requests)
                self.assertLessEqual(max(read_requests), 4)
                self.assertFalse(hasattr(fake_numpy, "concatenate"))
                self.assertEqual(
                    master_sidecar["audio"]["container_profile"],
                    MASTER_CONTAINER_PROFILE,
                )
                self.assertEqual(master_sidecar["audio"]["frames"], 70)
                self.assertEqual(master_sidecar["timing"][0]["end_frame"], 10)
                self.assertEqual(master_sidecar["timing"][1]["start_frame"], 58)
                self.assertEqual(master_sidecar["timing"][1]["end_frame"], 70)

                master_wav = master_dir / "audio.wav"
                tampered = bytearray(master_wav.read_bytes())
                tampered[20:28] = struct.pack("<Q", 0)
                master_wav.write_bytes(tampered)
                with self.assertRaisesRegex(RenderContractError, "ds64 evidence"):
                    _atomic_assemble_master("crito", chapter_refs, outdir)

    def test_full_dialogue_assembly_resolver_rejects_subset_and_tamper(self) -> None:
        with tempfile.TemporaryDirectory() as raw_root:
            root = Path(raw_root)
            reference = root / "audio/references/socrates.wav"
            write_wav(reference, frames=144_000)
            cast = cast_registry(sha256_file(reference))
            cast_path = root / "audio/cast.json"
            cast_path.parent.mkdir(parents=True, exist_ok=True)
            cast_path.write_text(json.dumps(cast) + "\n", encoding="utf-8")
            cast_sha = sha256_file(cast_path)
            arguments = {
                "acceptance": acceptance(cast_sha),
                "renderer_code_sha256": "e" * 64,
                "runtime_provenance": runtime_provenance(),
                "repo_root": root,
                "reference_overrides": {},
            }
            plan = build_render_plan(screenplay(cast_sha), cast, **arguments)
            outdir = (root / "renders").resolve()
            task = plan["tasks"][0]
            _, task_wav, task_sidecar_path = cache_paths(outdir, task["input_sha256"])
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
            task_sidecar_path.write_text(
                json.dumps(task_sidecar) + "\n", encoding="utf-8"
            )
            task_outputs = [
                {
                    "input_sha256": task["input_sha256"],
                    "audio_sha256": task_sidecar["audio"]["sha256"],
                    "frames": task_sidecar["audio"]["frames"],
                    "sidecar_sha256": sha256_file(task_sidecar_path),
                }
            ]
            chapter_input = build_chapter_assembly_input(
                "before-dawn", plan["tasks"], task_outputs
            )
            chapter_digest = content_sha256(chapter_input)
            chapter_dir = outdir / "units/chapters/before-dawn" / chapter_digest
            chapter_wav = chapter_dir / "audio.wav"
            write_wav(chapter_wav, sample_width=3)
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
                    "channels": 1,
                    "sample_rate": 48_000,
                    "frames": 480,
                    "sample_width_bytes": 3,
                    "container_profile": CHAPTER_CONTAINER_PROFILE,
                    "sha256": sha256_file(chapter_wav),
                    "duration_seconds": 0.01,
                },
                "timing": chapter_timing,
                "timing_sha256": content_sha256(chapter_timing),
            }
            chapter_sidecar_path = chapter_dir / "render.json"
            chapter_sidecar_path.write_text(
                json.dumps(chapter_sidecar) + "\n", encoding="utf-8"
            )

            master_input = build_master_assembly_input(
                "crito",
                [
                    {
                        "chapter_id": "before-dawn",
                        "input_sha256": chapter_digest,
                        "audio_sha256": chapter_sidecar["audio"]["sha256"],
                        "frames": chapter_sidecar["audio"]["frames"],
                        "timing_sha256": chapter_sidecar["timing_sha256"],
                        "sidecar_sha256": sha256_file(chapter_sidecar_path),
                    }
                ],
            )
            master_digest = content_sha256(master_input)
            master_dir = outdir / "units/complete" / master_digest
            master_wav = master_dir / "audio.wav"
            write_rf64_wav(master_wav)
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
                    key: master_input["segments"][0][key]
                    for key in (
                        "chapter_id",
                        "input_sha256",
                        "audio_sha256",
                        "frames",
                        "timing_sha256",
                        "sidecar_sha256",
                    )
                }
                | {"start_frame": 0, "start_seconds": 0.0}
            ]
            master_sidecar = {
                "schema_version": ASSEMBLY_SCHEMA_VERSION,
                "input_sha256": master_digest,
                "input": master_input,
                "audio": {
                    "channels": 1,
                    "sample_rate": 48_000,
                    "frames": 480,
                    "sample_width_bytes": 3,
                    "container_profile": MASTER_CONTAINER_PROFILE,
                    "sha256": sha256_file(master_wav),
                    "duration_seconds": 0.01,
                },
                "timing": master_timing,
                "timing_sha256": content_sha256(master_timing),
                "chapter_starts": chapter_starts,
                "chapter_starts_sha256": content_sha256(chapter_starts),
            }
            master_sidecar_path = master_dir / "render.json"
            master_sidecar_path.write_text(
                json.dumps(master_sidecar) + "\n", encoding="utf-8"
            )

            evidence = resolve_full_dialogue_assembly(plan, outdir)
            self.assertEqual(evidence["complete"]["input_sha256"], master_digest)
            self.assertEqual(evidence["chapters"][0]["input_sha256"], chapter_digest)
            self.assertEqual(evidence["complete"]["chapter_starts"], chapter_starts)
            self.assertEqual(
                evidence["complete"]["chapter_starts_sha256"],
                content_sha256(chapter_starts),
            )

            subset = build_render_plan(
                screenplay(cast_sha),
                cast,
                chapter_selection="before-dawn",
                **arguments,
            )
            with self.assertRaisesRegex(RenderContractError, "chapter subset"):
                resolve_full_dialogue_assembly(subset, outdir)

            write_wav(task_wav, sample_width=3, sample_byte=2)
            task_sidecar["audio"]["sha256"] = sha256_file(task_wav)
            task_sidecar_path.write_text(
                json.dumps(task_sidecar) + "\n", encoding="utf-8"
            )
            with self.assertRaisesRegex(
                RenderContractError, "missing completed chapter assembly"
            ):
                resolve_full_dialogue_assembly(plan, outdir)

            write_wav(task_wav, sample_width=3)
            task_sidecar["audio"]["sha256"] = sha256_file(task_wav)
            task_sidecar_path.write_text(
                json.dumps(task_sidecar) + "\n", encoding="utf-8"
            )
            write_wav(chapter_wav, sample_width=3, sample_byte=3)
            chapter_sidecar["audio"]["sha256"] = sha256_file(chapter_wav)
            chapter_sidecar_path.write_text(
                json.dumps(chapter_sidecar) + "\n", encoding="utf-8"
            )
            with self.assertRaisesRegex(
                RenderContractError, "missing completed full-dialogue assembly"
            ):
                resolve_full_dialogue_assembly(plan, outdir)

            write_wav(chapter_wav, sample_width=3)
            chapter_sidecar["audio"]["sha256"] = sha256_file(chapter_wav)
            chapter_sidecar_path.write_text(
                json.dumps(chapter_sidecar) + "\n", encoding="utf-8"
            )
            master_sidecar["chapter_starts"][0]["start_frame"] = 1
            master_sidecar["chapter_starts"][0]["start_seconds"] = 1 / 48_000
            master_sidecar["chapter_starts_sha256"] = content_sha256(
                master_sidecar["chapter_starts"]
            )
            master_sidecar_path.write_text(
                json.dumps(master_sidecar) + "\n", encoding="utf-8"
            )
            with self.assertRaisesRegex(RenderContractError, "chapter-start evidence"):
                resolve_full_dialogue_assembly(plan, outdir)

            master_sidecar["chapter_starts"] = deepcopy(chapter_starts)
            master_sidecar["chapter_starts_sha256"] = content_sha256(chapter_starts)
            master_sidecar["timing"][0]["end_frame"] = 479
            master_sidecar_path.write_text(
                json.dumps(master_sidecar) + "\n", encoding="utf-8"
            )
            with self.assertRaisesRegex(RenderContractError, "timing values"):
                resolve_full_dialogue_assembly(plan, outdir)


if __name__ == "__main__":
    unittest.main()
