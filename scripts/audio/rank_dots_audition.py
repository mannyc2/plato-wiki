#!/usr/bin/env python3
"""Rank a Dots audition with the pinned model's CAM++ speaker encoder."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

from audition_dots_reference import MODEL_REPO, MODEL_REVISION
from qa_dots_audition import load_cases


WINDOW_SECONDS = 8.0


class AuditionRankingError(ValueError):
    """Raised when speaker-similarity ranking inputs are inconsistent."""


def window_starts(sample_count: int, sample_rate: int, window_seconds: float = WINDOW_SECONDS) -> list[int]:
    if sample_count <= 0 or sample_rate <= 0 or window_seconds <= 0:
        raise AuditionRankingError("sample count, sample rate, and window duration must be positive")
    window_samples = round(sample_rate * window_seconds)
    return sorted(
        {
            0,
            max(0, (sample_count - window_samples) // 2),
            max(0, sample_count - window_samples),
        }
    )


def load_speaker_runtime(cache_dir: Path) -> Any:
    """Load the pinned Dots runtime once for one or more ranking reports."""

    import torch
    from dots_tts.runtime import DotsTtsRuntime

    if not torch.cuda.is_available():
        raise AuditionRankingError("CUDA is required for speaker-similarity ranking")
    return DotsTtsRuntime.from_pretrained(
        MODEL_REPO,
        revision=MODEL_REVISION,
        cache_dir=str(cache_dir),
        precision="bfloat16",
    )


def rank_audition_with_runtime(
    manifest_path: Path,
    *,
    runtime: Any,
    output: Path,
) -> dict[str, Any]:
    """Rank one audition using an already-loaded pinned Dots runtime."""

    import torch
    import torch.nn.functional as functional

    manifest, cases = load_cases(manifest_path)
    plan = manifest["plan"]
    if plan.get("model_repo") != MODEL_REPO or plan.get("model_revision") != MODEL_REVISION:
        raise AuditionRankingError("audition does not use the pinned Dots model revision")
    encoder = runtime.model.xvector_extractor.eval()
    sample_rate = int(encoder.sample_rate)
    window_samples = round(sample_rate * WINDOW_SECONDS)

    def embedding(audio_path: Path, start: int | None = None):
        audio = runtime._load_prompt_audio(str(audio_path))
        if start is not None:
            audio = audio[:, start : start + window_samples]
        with torch.inference_mode():
            value = encoder(audio.to(runtime.device))
        return functional.normalize(value.float(), dim=-1)

    reference_path = Path(cases[0]["path"])
    reference_embedding = embedding(reference_path)
    ranking: list[dict[str, Any]] = []
    output_by_name = {f"seed-{item['seed']}": item for item in manifest["outputs"]}
    for case in cases[1:]:
        item = output_by_name[case["name"]]
        audio_path = Path(case["path"])
        audio = runtime._load_prompt_audio(str(audio_path))
        starts = window_starts(int(audio.shape[-1]), sample_rate)
        similarities = [
            float(functional.cosine_similarity(reference_embedding, embedding(audio_path, start)).item())
            for start in starts
        ]
        record = {
            "seed": item["seed"],
            "file": item["file"],
            "windowStartsSeconds": [start / sample_rate for start in starts],
            "windowCosineSimilarities": similarities,
            "meanCosineSimilarity": sum(similarities) / len(similarities),
            "minimumCosineSimilarity": min(similarities),
            "maximumCosineSimilarity": max(similarities),
        }
        ranking.append(record)
        print(
            f"seed={item['seed']} mean={record['meanCosineSimilarity']:.4f} "
            f"min={record['minimumCosineSimilarity']:.4f}",
            flush=True,
        )
    ranking.sort(key=lambda item: (-item["meanCosineSimilarity"], item["seed"]))
    report = {
        "schemaVersion": 1,
        "status": "audition-ranking",
        "auditionPlanSha256": manifest["planSha256"],
        "modelRepository": MODEL_REPO,
        "modelRevision": MODEL_REVISION,
        "encoder": "CAM++ speaker x-vector",
        "referencePath": str(reference_path),
        "windowSeconds": WINDOW_SECONDS,
        "ranking": ranking,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(f".{output.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(output)
    return report


def rank_audition(manifest_path: Path, cache_dir: Path, output: Path) -> dict[str, Any]:
    runtime = load_speaker_runtime(cache_dir)
    return rank_audition_with_runtime(
        manifest_path,
        runtime=runtime,
        output=output,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--cache-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rank_audition(args.manifest, args.cache_dir, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
