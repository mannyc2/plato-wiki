#!/usr/bin/env python3
"""Plan or render reproducible Dots auditions from a materialized reference."""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import time
import wave
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable


MODEL_REPO = "rednote-hilab/dots.tts-soar"
MODEL_REVISION = "e3520f75254d0020a0406db31c51a79d00d22d55"
DOTS_SOURCE_COMMIT = "5ed719e3d36f5a3f6d8037ca9a7009d4fd0520ba"
SAMPLE_RATE = 48_000
SAFE_ID = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class AuditionError(ValueError):
    """Raised when an audition input or resumable artifact is unsafe."""


@dataclass(frozen=True)
class AuditionPlan:
    schema_version: int
    dialogue: str
    character_id: str
    video_id: str
    source_url: str
    reference_path: str
    reference_sha256: str
    reference_sidecar_sha256: str
    prompt_text: str
    target_text: str
    seeds: tuple[int, ...]
    model_repo: str
    model_revision: str
    dots_source_commit: str
    precision: str
    language: str
    num_steps: int
    guidance_scale: float
    speaker_scale: float
    max_generate_length: int
    output_dir: str


@dataclass(frozen=True)
class AuditionRuntime:
    """One loaded Dots runtime that may serve compatible audition plans."""

    runtime: Any
    torch: Any
    soundfile: Any
    seed_everything: Any
    model_repo: str
    model_revision: str
    precision: str
    max_generate_length: int


def canonical_json(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def parse_seeds(value: str | Iterable[int]) -> tuple[int, ...]:
    try:
        raw = [int(item.strip()) for item in value.split(",")] if isinstance(value, str) else list(value)
    except ValueError as error:
        raise AuditionError("seeds must be comma-separated integers") from error
    if not raw or len(raw) != len(set(raw)) or any(seed < 0 or seed > 2**32 - 1 for seed in raw):
        raise AuditionError("seeds must be unique unsigned 32-bit integers")
    return tuple(raw)


def _load_sidecar(path: Path) -> dict[str, Any]:
    try:
        sidecar = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AuditionError(f"cannot read reference sidecar {path}: {error}") from error
    if not isinstance(sidecar, dict) or sidecar.get("schemaVersion") != 1:
        raise AuditionError(f"unsupported reference sidecar {path}")
    return sidecar


def _verify_reference_wav(path: Path) -> None:
    try:
        with wave.open(str(path), "rb") as handle:
            valid = (
                handle.getnchannels() == 1
                and handle.getframerate() == SAMPLE_RATE
                and handle.getnframes() > 0
            )
    except (OSError, wave.Error) as error:
        raise AuditionError(f"cannot inspect reference WAV {path}: {error}") from error
    if not valid:
        raise AuditionError(f"reference must be a non-empty mono {SAMPLE_RATE} Hz WAV")


def build_audition_plan(
    *,
    reference: Path,
    reference_sidecar: Path,
    target_text: str,
    seeds: str | Iterable[int],
    output_dir: Path,
) -> AuditionPlan:
    if not reference.is_file():
        raise AuditionError(f"reference does not exist: {reference}")
    _verify_reference_wav(reference)
    sidecar = _load_sidecar(reference_sidecar)
    source_plan = sidecar.get("plan")
    wav = sidecar.get("wav")
    if not isinstance(source_plan, dict) or not isinstance(wav, dict):
        raise AuditionError("reference sidecar is missing plan or wav provenance")
    dialogue = source_plan.get("dialogue")
    character_id = source_plan.get("character_id")
    video_id = source_plan.get("video_id")
    source_url = source_plan.get("source_url")
    prompt_text = " ".join(str(source_plan.get("prompt_text", "")).split())
    expected_sha = wav.get("sha256")
    actual_sha = sha256_file(reference)
    if not isinstance(dialogue, str) or not SAFE_ID.fullmatch(dialogue):
        raise AuditionError("reference sidecar has an invalid dialogue")
    if not isinstance(character_id, str) or not SAFE_ID.fullmatch(character_id):
        raise AuditionError("reference sidecar has an invalid character_id")
    if not isinstance(video_id, str) or source_url != f"https://www.youtube.com/watch?v={video_id}":
        raise AuditionError("reference sidecar has invalid pinned source provenance")
    if not prompt_text:
        raise AuditionError("reference sidecar prompt_text is empty")
    if expected_sha != actual_sha:
        raise AuditionError(f"reference hash mismatch: expected {expected_sha}, got {actual_sha}")
    target = " ".join(target_text.split())
    if not target:
        raise AuditionError("target_text must be non-empty")
    return AuditionPlan(
        schema_version=1,
        dialogue=dialogue,
        character_id=character_id,
        video_id=video_id,
        source_url=source_url,
        reference_path=str(reference),
        reference_sha256=actual_sha,
        reference_sidecar_sha256=sha256_file(reference_sidecar),
        prompt_text=prompt_text,
        target_text=target,
        seeds=parse_seeds(seeds),
        model_repo=MODEL_REPO,
        model_revision=MODEL_REVISION,
        dots_source_commit=DOTS_SOURCE_COMMIT,
        precision="bfloat16",
        language="EN",
        num_steps=24,
        guidance_scale=1.2,
        speaker_scale=1.5,
        max_generate_length=800,
        output_dir=str(output_dir),
    )


def _plan_payload_and_sha(plan: AuditionPlan) -> tuple[dict[str, Any], str]:
    payload = asdict(plan)
    payload["seeds"] = list(plan.seeds)
    return payload, hashlib.sha256(canonical_json(payload)).hexdigest()


def inspect_completed_audition(plan: AuditionPlan) -> dict[str, Any] | None:
    """Return verified resumable output, or ``None`` when synthesis is pending."""

    output_dir = Path(plan.output_dir)
    manifest_path = output_dir / "audition-manifest.json"
    plan_payload, plan_sha = _plan_payload_and_sha(plan)
    if not manifest_path.exists():
        if output_dir.exists() and any(output_dir.iterdir()):
            raise AuditionError(
                f"audition output directory is non-empty without a matching manifest: {output_dir}"
            )
        return None
    try:
        existing = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AuditionError(f"cannot read audition manifest {manifest_path}: {error}") from error
    if existing.get("planSha256") != plan_sha or existing.get("plan") != plan_payload:
        raise AuditionError(f"existing audition manifest does not match this plan: {manifest_path}")
    outputs = existing.get("outputs")
    if (
        not isinstance(outputs, list)
        or not all(isinstance(item, dict) for item in outputs)
        or [item.get("seed") for item in outputs] != list(plan.seeds)
    ):
        raise AuditionError(f"existing audition manifest has incomplete or reordered seeds: {manifest_path}")
    for item in outputs:
        if not isinstance(item, dict) or not isinstance(item.get("file"), str):
            raise AuditionError(f"existing audition manifest has a malformed output: {manifest_path}")
        path = output_dir / item["file"]
        if not path.is_file() or sha256_file(path) != item.get("sha256"):
            raise AuditionError(f"existing audition output is missing or corrupt: {path}")
    return existing


def load_audition_runtime(plan: AuditionPlan, cache_dir: Path) -> AuditionRuntime:
    import soundfile as sf
    import torch
    from dots_tts.runtime import DotsTtsRuntime
    from dots_tts.utils.util import seed_everything

    if not torch.cuda.is_available():
        raise AuditionError("CUDA is required to render a Dots audition")
    runtime = DotsTtsRuntime.from_pretrained(
        plan.model_repo,
        revision=plan.model_revision,
        cache_dir=str(cache_dir),
        precision=plan.precision,
        max_generate_length=plan.max_generate_length,
    )
    return AuditionRuntime(
        runtime=runtime,
        torch=torch,
        soundfile=sf,
        seed_everything=seed_everything,
        model_repo=plan.model_repo,
        model_revision=plan.model_revision,
        precision=plan.precision,
        max_generate_length=plan.max_generate_length,
    )


def render_audition_with_runtime(
    plan: AuditionPlan, loaded: AuditionRuntime
) -> dict[str, Any]:
    existing = inspect_completed_audition(plan)
    if existing is not None:
        return existing
    expected_runtime = (
        plan.model_repo,
        plan.model_revision,
        plan.precision,
        plan.max_generate_length,
    )
    actual_runtime = (
        loaded.model_repo,
        loaded.model_revision,
        loaded.precision,
        loaded.max_generate_length,
    )
    if actual_runtime != expected_runtime:
        raise AuditionError("loaded Dots runtime does not match the audition plan")

    output_dir = Path(plan.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = output_dir / "audition-manifest.json"
    plan_payload, plan_sha = _plan_payload_and_sha(plan)
    outputs: list[dict[str, Any]] = []
    for seed in plan.seeds:
        loaded.seed_everything(seed)
        loaded.torch.cuda.reset_peak_memory_stats()
        started = time.perf_counter()
        result = loaded.runtime.generate(
            text=plan.target_text,
            prompt_audio_path=plan.reference_path,
            prompt_text=plan.prompt_text,
            language=plan.language,
            num_steps=plan.num_steps,
            guidance_scale=plan.guidance_scale,
            speaker_scale=plan.speaker_scale,
        )
        elapsed = time.perf_counter() - started
        audio = result["audio"].float().cpu().squeeze().numpy()
        sample_rate = int(result["sample_rate"])
        if sample_rate != SAMPLE_RATE or len(audio) == 0:
            raise AuditionError(f"Dots returned invalid audio for seed {seed}")
        filename = f"{plan.character_id}-{plan.video_id}-{plan_sha[:12]}-seed{seed}.wav"
        output = output_dir / filename
        temporary = output.with_name(f".{output.name}.{os.getpid()}.tmp.wav")
        try:
            loaded.soundfile.write(
                temporary, audio, sample_rate, format="WAV", subtype="PCM_16"
            )
            temporary.replace(output)
        finally:
            temporary.unlink(missing_ok=True)
        record = {
            "seed": seed,
            "file": filename,
            "sampleRate": sample_rate,
            "durationSeconds": len(audio) / sample_rate,
            "generationSeconds": elapsed,
            "peakGpuMiB": loaded.torch.cuda.max_memory_allocated() / 1024**2,
            "sha256": sha256_file(output),
        }
        outputs.append(record)
        print(f"WROTE {output} duration={record['durationSeconds']:.2f}s", flush=True)

    manifest = {
        "schemaVersion": 1,
        "status": "audition",
        "plan": plan_payload,
        "planSha256": plan_sha,
        "packages": {
            name: importlib.metadata.version(name)
            for name in ("dots.tts", "soundfile", "torch", "transformers")
        },
        "outputs": outputs,
    }
    temporary_manifest = manifest_path.with_name(f".{manifest_path.name}.{os.getpid()}.tmp")
    temporary_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary_manifest.replace(manifest_path)
    return manifest


def render_audition(plan: AuditionPlan, cache_dir: Path) -> dict[str, Any]:
    existing = inspect_completed_audition(plan)
    if existing is not None:
        return existing
    return render_audition_with_runtime(plan, load_audition_runtime(plan, cache_dir))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference", type=Path, required=True)
    parser.add_argument("--reference-sidecar", type=Path, required=True)
    parser.add_argument("--target-text", required=True)
    parser.add_argument("--seeds", default="42,43,44,45,46,47,48,49")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--render", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    plan = build_audition_plan(
        reference=args.reference,
        reference_sidecar=args.reference_sidecar,
        target_text=args.target_text,
        seeds=args.seeds,
        output_dir=args.output_dir,
    )
    result: Any = render_audition(plan, args.cache_dir) if args.render else asdict(plan)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
