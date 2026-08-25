#!/usr/bin/env python3
"""Run pinned Whisper intelligibility QA for a Dots audition manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any


ASR_REPO = "openai/whisper-small.en"
ASR_REVISION = "e8727524f962ee844a7319d92be39ac1bd25655a"
PROPER_NAME_ALIASES = {
    "credo": "crito",
    "creto": "crito",
    "krito": "crito",
    "socrate": "socrates",
}


class AuditionQaError(ValueError):
    """Raised when audition QA inputs or outputs are inconsistent."""


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def words(text: str, *, normalize_names: bool = False) -> list[str]:
    tokens = re.findall(r"[a-z0-9]+(?:'[a-z0-9]+)?", text.lower())
    if normalize_names:
        return [PROPER_NAME_ALIASES.get(token, token) for token in tokens]
    return tokens


def edit_distance(left: list[str], right: list[str]) -> int:
    previous = list(range(len(right) + 1))
    for left_index, left_word in enumerate(left, start=1):
        current = [left_index]
        for right_index, right_word in enumerate(right, start=1):
            current.append(
                min(
                    previous[right_index] + 1,
                    current[right_index - 1] + 1,
                    previous[right_index - 1] + (left_word != right_word),
                )
            )
        previous = current
    return previous[-1]


def score_transcript(expected: str, transcript: str) -> dict[str, Any]:
    expected_strict = words(expected)
    if not expected_strict:
        raise AuditionQaError("expected transcript has no words")
    transcript_strict = words(transcript)
    strict_distance = edit_distance(expected_strict, transcript_strict)
    normalized_distance = edit_distance(
        words(expected, normalize_names=True),
        words(transcript, normalize_names=True),
    )
    return {
        "expected": expected,
        "transcript": transcript,
        "expectedWordCount": len(expected_strict),
        "strictWordErrorCount": strict_distance,
        "strictWordErrorRate": strict_distance / len(expected_strict),
        "nameNormalizedWordErrorCount": normalized_distance,
        "nameNormalizedWordErrorRate": normalized_distance / len(expected_strict),
        "passesOrdinaryWordGate": normalized_distance == 0,
    }


def resolve_asr_snapshot(cache_dir: Path) -> Path:
    repository = ASR_REPO.replace("/", "--")
    candidates = (
        cache_dir / f"models--{repository}" / "snapshots" / ASR_REVISION,
        cache_dir / "hub" / f"models--{repository}" / "snapshots" / ASR_REVISION,
    )
    for candidate in candidates:
        if (candidate / "config.json").is_file() and (candidate / "preprocessor_config.json").is_file():
            return candidate
    raise AuditionQaError(
        f"pinned ASR snapshot {ASR_REPO}@{ASR_REVISION} is not materialized under {cache_dir}"
    )


def load_cases(manifest_path: Path) -> tuple[dict[str, Any], list[dict[str, str]]]:
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise AuditionQaError(f"cannot read audition manifest {manifest_path}: {error}") from error
    if manifest.get("schemaVersion") != 1 or manifest.get("status") != "audition":
        raise AuditionQaError("unsupported audition manifest")
    plan = manifest.get("plan")
    outputs = manifest.get("outputs")
    if not isinstance(plan, dict) or not isinstance(outputs, list) or not outputs:
        raise AuditionQaError("audition manifest is missing plan or outputs")
    reference = Path(str(plan.get("reference_path", "")))
    if not reference.is_file() or sha256_file(reference) != plan.get("reference_sha256"):
        raise AuditionQaError(f"audition reference is missing or corrupt: {reference}")
    cases = [
        {
            "name": "youtube-reference",
            "kind": "reference",
            "path": str(reference),
            "expected": str(plan.get("prompt_text", "")),
        }
    ]
    for item in outputs:
        output = manifest_path.parent / str(item.get("file", ""))
        if not output.is_file() or sha256_file(output) != item.get("sha256"):
            raise AuditionQaError(f"audition output is missing or corrupt: {output}")
        cases.append(
            {
                "name": f"seed-{item.get('seed')}",
                "kind": "clone",
                "path": str(output),
                "expected": str(plan.get("target_text", "")),
            }
        )
    return manifest, cases


def load_asr_transcriber(cache_dir: Path) -> tuple[Path, Any]:
    """Load the pinned ASR pipeline once for one or more audition reports."""

    import torch
    from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

    if not torch.cuda.is_available():
        raise AuditionQaError("CUDA is required for audition ASR QA")
    dtype = torch.float16
    snapshot = resolve_asr_snapshot(cache_dir)
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        snapshot,
        dtype=dtype,
        low_cpu_mem_usage=True,
        use_safetensors=True,
        local_files_only=True,
    ).to("cuda:0")
    processor = AutoProcessor.from_pretrained(
        snapshot,
        local_files_only=True,
    )
    transcriber = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        dtype=dtype,
        device=0,
    )
    return snapshot, transcriber


def run_qa_with_transcriber(
    manifest_path: Path,
    *,
    snapshot: Path,
    transcriber: Any,
    output: Path,
) -> dict[str, Any]:
    """Score one audition using an already-loaded pinned ASR pipeline."""

    manifest, cases = load_cases(manifest_path)
    results: dict[str, Any] = {}
    for case in cases:
        transcript = transcriber(case["path"])["text"].strip()
        result = score_transcript(case["expected"], transcript)
        result.update({"kind": case["kind"], "path": case["path"]})
        results[case["name"]] = result
        print(
            f"{case['name']}: normalized={result['nameNormalizedWordErrorCount']}/"
            f"{result['expectedWordCount']} {transcript!r}",
            flush=True,
        )
    report = {
        "schemaVersion": 1,
        "status": "audition-qa",
        "auditionPlanSha256": manifest["planSha256"],
        "asrRepo": ASR_REPO,
        "asrRevision": ASR_REVISION,
        "asrSnapshot": str(snapshot),
        "cases": results,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(f".{output.name}.{os.getpid()}.tmp")
    temporary.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(output)
    return report


def run_qa(manifest_path: Path, cache_dir: Path, output: Path) -> dict[str, Any]:
    snapshot, transcriber = load_asr_transcriber(cache_dir)
    return run_qa_with_transcriber(
        manifest_path,
        snapshot=snapshot,
        transcriber=transcriber,
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
    run_qa(args.manifest, args.cache_dir, args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
