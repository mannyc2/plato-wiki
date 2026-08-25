#!/usr/bin/env python3
"""Build a hash-verified, blind listening page for one Dots audition."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import math
import os
import re
import wave
from pathlib import Path
from typing import Any
from urllib.parse import quote

from qa_dots_audition import ASR_REPO, ASR_REVISION, score_transcript


MAX_JSON_BYTES = 4 * 1024 * 1024
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


class AuditionReviewError(ValueError):
    """Raised when audition evidence cannot support a review packet."""


def canonical_json_sha256(value: Any) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _read_json(path: Path, label: str) -> dict[str, Any]:
    if path.is_symlink():
        raise AuditionReviewError(f"{label} must not be a symlink: {path}")
    try:
        size = path.stat().st_size
    except FileNotFoundError as error:
        raise AuditionReviewError(f"missing {label}: {path}") from error
    if size <= 0 or size > MAX_JSON_BYTES:
        raise AuditionReviewError(f"{label} must be 1..{MAX_JSON_BYTES} bytes: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise AuditionReviewError(f"invalid {label}: {path}: {error}") from error
    if not isinstance(value, dict):
        raise AuditionReviewError(f"{label} must contain a JSON object")
    return value


def _within_repo(
    path: Path, repo_root: Path, label: str, *, must_exist: bool = True
) -> Path:
    root = repo_root.resolve(strict=True)
    try:
        resolved = path.resolve(strict=must_exist)
    except FileNotFoundError as error:
        raise AuditionReviewError(f"missing {label}: {path}") from error
    try:
        resolved.relative_to(root)
    except ValueError as error:
        raise AuditionReviewError(f"{label} escapes the repository: {path}") from error
    if must_exist and path.is_symlink():
        raise AuditionReviewError(f"{label} must not be a symlink: {path}")
    return resolved


def _repo_artifact(value: Any, repo_root: Path, label: str) -> Path:
    if not isinstance(value, str) or not value.strip():
        raise AuditionReviewError(f"{label} must be a non-empty path")
    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = repo_root / candidate
    return _within_repo(candidate, repo_root, label)


def _sha256(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SHA256_RE.fullmatch(value):
        raise AuditionReviewError(f"{label} must be a lowercase SHA-256")
    return value


def _finite_similarity(value: Any, label: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise AuditionReviewError(f"{label} must be numeric")
    result = float(value)
    if not math.isfinite(result) or not -1.0 <= result <= 1.0:
        raise AuditionReviewError(f"{label} must be finite and between -1 and 1")
    return result


def _inspect_wav(
    path: Path,
    expected_duration: Any | None,
    label: str,
    *,
    allowed_sample_widths: tuple[int, ...] = (2,),
) -> dict[str, Any]:
    try:
        with wave.open(str(path), "rb") as audio:
            channels = audio.getnchannels()
            sample_rate = audio.getframerate()
            sample_width = audio.getsampwidth()
            frames = audio.getnframes()
    except (OSError, wave.Error) as error:
        raise AuditionReviewError(
            f"{label} is not a readable PCM WAV: {path}"
        ) from error
    if (
        channels != 1
        or sample_rate != 48_000
        or sample_width not in allowed_sample_widths
        or frames <= 0
    ):
        allowed_bits = ", ".join(str(width * 8) for width in allowed_sample_widths)
        raise AuditionReviewError(
            f"{label} must be non-empty mono 48 kHz PCM WAV "
            f"with bit depth in {{{allowed_bits}}}: {path}"
        )
    duration = frames / sample_rate
    if expected_duration is not None:
        if not isinstance(expected_duration, (int, float)) or isinstance(
            expected_duration, bool
        ):
            raise AuditionReviewError(f"{label} manifest duration must be numeric")
        if abs(duration - float(expected_duration)) > 0.025:
            raise AuditionReviewError(
                f"{label} duration mismatch: manifest={expected_duration}, wav={duration:.6f}"
            )
    return {
        "channels": channels,
        "sampleRate": sample_rate,
        "sampleWidthBits": sample_width * 8,
        "durationSeconds": round(duration, 6),
    }


def _resolve_case_path(value: Any, repo_root: Path, label: str) -> Path:
    return _repo_artifact(value, repo_root, label)


def verify_audition_evidence(
    manifest_path: Path,
    qa_path: Path,
    ranking_path: Path,
    repo_root: Path,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    manifest_path = _within_repo(manifest_path, root, "audition manifest")
    qa_path = _within_repo(qa_path, root, "ASR report")
    ranking_path = _within_repo(ranking_path, root, "speaker ranking")
    manifest = _read_json(manifest_path, "audition manifest")
    qa = _read_json(qa_path, "ASR report")
    ranking = _read_json(ranking_path, "speaker ranking")

    if manifest.get("schemaVersion") != 1 or manifest.get("status") != "audition":
        raise AuditionReviewError(
            "audition manifest must be schema 1 with status audition"
        )
    plan = manifest.get("plan")
    if not isinstance(plan, dict):
        raise AuditionReviewError("audition manifest plan must be an object")
    plan_sha = _sha256(manifest.get("planSha256"), "audition plan hash")
    if canonical_json_sha256(plan) != plan_sha:
        raise AuditionReviewError("audition plan hash does not match the embedded plan")
    for key in ("character_id", "dialogue", "prompt_text", "target_text"):
        if not isinstance(plan.get(key), str) or not plan[key].strip():
            raise AuditionReviewError(f"audition plan {key} must be non-empty")

    reference_path = _repo_artifact(plan.get("reference_path"), root, "reference WAV")
    reference_hash = _sha256(plan.get("reference_sha256"), "reference hash")
    if file_sha256(reference_path) != reference_hash:
        raise AuditionReviewError("reference WAV hash mismatch")
    reference_audio = _inspect_wav(
        reference_path,
        None,
        "reference WAV",
        allowed_sample_widths=(2, 3, 4),
    )

    raw_outputs = manifest.get("outputs")
    if not isinstance(raw_outputs, list) or not raw_outputs:
        raise AuditionReviewError("audition manifest must contain outputs")
    outputs: list[dict[str, Any]] = []
    seen_seeds: set[int] = set()
    seen_files: set[str] = set()
    for index, item in enumerate(raw_outputs):
        if not isinstance(item, dict):
            raise AuditionReviewError(f"output {index} must be an object")
        seed = item.get("seed")
        if (
            not isinstance(seed, int)
            or isinstance(seed, bool)
            or seed < 0
            or seed in seen_seeds
        ):
            raise AuditionReviewError(
                f"output {index} has an invalid or duplicate seed"
            )
        filename = item.get("file")
        if (
            not isinstance(filename, str)
            or not filename
            or Path(filename).name != filename
            or filename in seen_files
        ):
            raise AuditionReviewError(
                f"output {index} has an unsafe or duplicate filename"
            )
        path = _within_repo(manifest_path.parent / filename, root, f"seed {seed} WAV")
        expected_hash = _sha256(item.get("sha256"), f"seed {seed} hash")
        if file_sha256(path) != expected_hash:
            raise AuditionReviewError(f"seed {seed} WAV hash mismatch")
        if item.get("sampleRate") != 48_000:
            raise AuditionReviewError(f"seed {seed} manifest sample rate must be 48000")
        audio = _inspect_wav(path, item.get("durationSeconds"), f"seed {seed} WAV")
        outputs.append(
            {
                "seed": seed,
                "file": filename,
                "path": path,
                "sha256": expected_hash,
                "audio": audio,
            }
        )
        seen_seeds.add(seed)
        seen_files.add(filename)

    if qa.get("schemaVersion") != 1 or qa.get("status") != "audition-qa":
        raise AuditionReviewError("ASR report must be schema 1 with status audition-qa")
    if qa.get("auditionPlanSha256") != plan_sha:
        raise AuditionReviewError("ASR report is detached from the audition plan")
    if qa.get("asrRepo") != ASR_REPO or qa.get("asrRevision") != ASR_REVISION:
        raise AuditionReviewError("ASR report does not use the pinned Whisper revision")
    raw_cases = qa.get("cases")
    if not isinstance(raw_cases, dict) or not raw_cases:
        raise AuditionReviewError("ASR report cases must be a non-empty object")
    cases_by_path: dict[Path, dict[str, Any]] = {}
    for name, case in raw_cases.items():
        if not isinstance(name, str) or not isinstance(case, dict):
            raise AuditionReviewError("ASR report contains an invalid case")
        path = _resolve_case_path(case.get("path"), root, f"ASR case {name}")
        if path in cases_by_path:
            raise AuditionReviewError("ASR report repeats an artifact path")
        if case.get("passesOrdinaryWordGate") is not True:
            raise AuditionReviewError(
                f"ASR case {name} does not pass the ordinary-word gate"
            )
        expected = (
            plan["prompt_text"]
            if case.get("kind") == "reference"
            else plan["target_text"]
        )
        if case.get("expected") != expected:
            raise AuditionReviewError(
                f"ASR case {name} expected text does not match the audition plan"
            )
        transcript = case.get("transcript")
        if not isinstance(transcript, str) or not transcript.strip():
            raise AuditionReviewError(f"ASR case {name} transcript must be non-empty")
        recomputed = score_transcript(expected, transcript)
        for field, value in recomputed.items():
            if case.get(field) != value:
                raise AuditionReviewError(f"ASR case {name} has stale or false {field}")
        cases_by_path[path] = case
    if cases_by_path.get(reference_path, {}).get("kind") != "reference":
        raise AuditionReviewError("ASR report does not bind the reference WAV")
    expected_paths = {reference_path, *(item["path"] for item in outputs)}
    if set(cases_by_path) != expected_paths:
        raise AuditionReviewError(
            "ASR report artifact inventory does not match the audition"
        )
    for item in outputs:
        if cases_by_path[item["path"]].get("kind") != "clone":
            raise AuditionReviewError(f"seed {item['seed']} lacks a clone ASR case")

    if ranking.get("schemaVersion") != 1 or ranking.get("status") != "audition-ranking":
        raise AuditionReviewError(
            "speaker ranking must be schema 1 with status audition-ranking"
        )
    if ranking.get("auditionPlanSha256") != plan_sha:
        raise AuditionReviewError("speaker ranking is detached from the audition plan")
    if ranking.get("modelRepository") != plan.get("model_repo"):
        raise AuditionReviewError(
            "speaker ranking model repository does not match the plan"
        )
    if ranking.get("modelRevision") != plan.get("model_revision"):
        raise AuditionReviewError(
            "speaker ranking model revision does not match the plan"
        )
    ranking_reference = _repo_artifact(
        ranking.get("referencePath"), root, "speaker-ranking reference WAV"
    )
    if ranking_reference != reference_path:
        raise AuditionReviewError("speaker ranking uses a different reference WAV")
    raw_ranking = ranking.get("ranking")
    if not isinstance(raw_ranking, list) or len(raw_ranking) != len(outputs):
        raise AuditionReviewError(
            "speaker ranking count does not match audition outputs"
        )
    ranking_by_seed: dict[int, dict[str, Any]] = {}
    previous_sort_key: tuple[float, int] | None = None
    output_by_seed = {item["seed"]: item for item in outputs}
    for index, item in enumerate(raw_ranking):
        if not isinstance(item, dict):
            raise AuditionReviewError(f"speaker ranking row {index} must be an object")
        seed = item.get("seed")
        if seed not in output_by_seed or seed in ranking_by_seed:
            raise AuditionReviewError(
                "speaker ranking has an unknown or duplicate seed"
            )
        if item.get("file") != output_by_seed[seed]["file"]:
            raise AuditionReviewError(f"speaker ranking file mismatch for seed {seed}")
        minimum = _finite_similarity(
            item.get("minimumCosineSimilarity"), "minimum similarity"
        )
        mean = _finite_similarity(item.get("meanCosineSimilarity"), "mean similarity")
        maximum = _finite_similarity(
            item.get("maximumCosineSimilarity"), "maximum similarity"
        )
        if not minimum <= mean <= maximum:
            raise AuditionReviewError(
                f"speaker ranking summary is inconsistent for seed {seed}"
            )
        sort_key = (-mean, seed)
        if previous_sort_key is not None and sort_key < previous_sort_key:
            raise AuditionReviewError(
                "speaker ranking is not sorted by descending mean similarity"
            )
        previous_sort_key = sort_key
        ranking_by_seed[seed] = {
            "minimum": minimum,
            "mean": mean,
            "maximum": maximum,
        }
    if set(ranking_by_seed) != seen_seeds:
        raise AuditionReviewError(
            "speaker ranking seed inventory does not match the audition"
        )

    for item in outputs:
        item["asr"] = cases_by_path[item["path"]]
        item["similarity"] = ranking_by_seed[item["seed"]]
    return {
        "repoRoot": root,
        "manifestPath": manifest_path,
        "qaPath": qa_path,
        "rankingPath": ranking_path,
        "manifest": manifest,
        "plan": plan,
        "planSha256": plan_sha,
        "reference": {
            "path": reference_path,
            "sha256": reference_hash,
            "audio": reference_audio,
            "asr": cases_by_path[reference_path],
        },
        "outputs": outputs,
    }


def _relative_url(path: Path, output_parent: Path) -> str:
    relative = os.path.relpath(path, output_parent)
    return quote(relative.replace(os.sep, "/"), safe="/.-_~")


def _blind_order(outputs: list[dict[str, Any]], plan_sha: str) -> list[dict[str, Any]]:
    return sorted(
        outputs,
        key=lambda item: hashlib.sha256(
            f"{plan_sha}:{item['seed']}".encode()
        ).hexdigest(),
    )


def render_review_html(evidence: dict[str, Any], output_path: Path) -> str:
    plan = evidence["plan"]
    plan_sha = evidence["planSha256"]
    ordered = _blind_order(evidence["outputs"], plan_sha)
    cards: list[str] = []
    for index, item in enumerate(ordered):
        label = chr(ord("A") + index) if index < 26 else str(index + 1)
        seed = item["seed"]
        similarity = item["similarity"]
        audio_url = _relative_url(item["path"], output_path.parent)
        cards.append(
            f"""
      <article class="candidate" data-seed="{seed}">
        <h2>Candidate {label}</h2>
        <audio controls preload="metadata" src="{html.escape(audio_url, quote=True)}"></audio>
        <button type="button" class="choose" data-seed="{seed}">Choose candidate {label}</button>
        <p class="identity" hidden>Seed {seed}; mean similarity {similarity["mean"]:.4f};
          minimum {similarity["minimum"]:.4f}; ASR ordinary-word gate passed.</p>
      </article>"""
        )
    reference_url = _relative_url(evidence["reference"]["path"], output_path.parent)
    character = html.escape(plan["character_id"].replace("-", " ").title())
    dialogue = html.escape(plan["dialogue"].replace("-", " ").title())
    prompt = html.escape(plan["prompt_text"])
    target = html.escape(plan["target_text"])
    plan_sha_json = json.dumps(plan_sha)
    character_json = json.dumps(plan["character_id"], ensure_ascii=False).replace(
        "<", "\\u003c"
    )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Dots audition review: {character}</title>
  <style>
    :root {{ color-scheme: dark; font: 16px/1.5 system-ui, sans-serif; background: #101113; color: #f1efe9; }}
    body {{ max-width: 960px; margin: 0 auto; padding: 2rem 1rem 5rem; }}
    h1, h2 {{ line-height: 1.15; }}
    .notice, .source, .decision {{ padding: 1rem; border: 1px solid #45484f; border-radius: .75rem; background: #181a1e; }}
    .notice {{ border-color: #8b7235; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit,minmax(260px,1fr)); gap: 1rem; margin: 1rem 0; }}
    .candidate {{ border: 1px solid #45484f; border-radius: .75rem; padding: 1rem; background: #181a1e; }}
    .candidate.selected {{ border-color: #8fc6ff; box-shadow: 0 0 0 2px #2d6798 inset; }}
    audio {{ width: 100%; margin: .5rem 0 1rem; }}
    button {{ border: 1px solid #7c8490; border-radius: .5rem; padding: .65rem .9rem; background: #282c32; color: inherit; cursor: pointer; }}
    button:hover, button:focus-visible {{ background: #343a43; outline: 2px solid #8fc6ff; outline-offset: 2px; }}
    textarea {{ width: 100%; min-height: 6rem; box-sizing: border-box; background: #111318; color: inherit; border: 1px solid #60656e; border-radius: .5rem; padding: .75rem; }}
    .controls {{ display: flex; flex-wrap: wrap; gap: .75rem; margin: 1rem 0; }}
    .muted, .identity {{ color: #c5c8ce; }}
    code {{ overflow-wrap: anywhere; }}
  </style>
</head>
<body>
  <main>
    <h1>Blind Dots review: {character} in {dialogue}</h1>
    <p class="notice"><strong>Human decision required.</strong> This page cannot edit <code>audio/cast.json</code>. All source and candidate WAV hashes, the ASR report, and the CAM++ ranking were verified before this page was written.</p>
    <section class="source">
      <h2>Direct-video reference</h2>
      <audio controls preload="metadata" src="{html.escape(reference_url, quote=True)}"></audio>
      <p><strong>Reference words:</strong> {prompt}</p>
      <p><strong>Candidate passage:</strong> {target}</p>
    </section>
    <div class="controls">
      <button type="button" id="reveal">Reveal seeds and measurements</button>
      <button type="button" id="reject">None of these</button>
      <button type="button" id="clear">Clear review</button>
    </div>
    <section class="grid" aria-label="Voice candidates">
      {"".join(cards)}
    </section>
    <section class="decision">
      <h2>Review note</h2>
      <textarea id="note" aria-label="Review note" placeholder="What sounds right or wrong?"></textarea>
      <div class="controls"><button type="button" id="copy">Copy review decision</button></div>
      <p id="status" role="status" aria-live="polite">No candidate selected.</p>
      <p class="muted">Audition plan <code>{plan_sha}</code></p>
    </section>
  </main>
  <script>
  (() => {{
    const planSha256 = {plan_sha_json};
    const characterId = {character_json};
    const storageKey = `plato-audio-audition:${{planSha256}}`;
    const cards = [...document.querySelectorAll('.candidate')];
    const audios = [...document.querySelectorAll('audio')];
    const note = document.querySelector('#note');
    const status = document.querySelector('#status');
    let state = {{ selectedSeed: null, rejectedAll: false, note: '' }};
    try {{ state = {{ ...state, ...JSON.parse(localStorage.getItem(storageKey) || '{{}}') }}; }} catch {{}}
    const save = () => {{
      state.note = note.value;
      try {{ localStorage.setItem(storageKey, JSON.stringify(state)); }} catch {{}}
    }};
    const paint = () => {{
      cards.forEach(card => card.classList.toggle('selected', Number(card.dataset.seed) === state.selectedSeed));
      status.textContent = state.rejectedAll ? 'Decision: none of these.' : state.selectedSeed === null ? 'No candidate selected.' : 'One candidate selected; reveal seeds or copy the decision when ready.';
    }};
    note.value = state.note || '';
    note.addEventListener('input', save);
    audios.forEach(audio => audio.addEventListener('play', () => audios.forEach(other => {{ if (other !== audio) other.pause(); }})));
    document.querySelectorAll('.choose').forEach(button => button.addEventListener('click', () => {{
      state.selectedSeed = Number(button.dataset.seed); state.rejectedAll = false; save(); paint();
    }}));
    document.querySelector('#reject').addEventListener('click', () => {{ state.selectedSeed = null; state.rejectedAll = true; save(); paint(); }});
    document.querySelector('#clear').addEventListener('click', () => {{ state.selectedSeed = null; state.rejectedAll = false; state.note = ''; note.value = ''; save(); paint(); }});
    document.querySelector('#reveal').addEventListener('click', event => {{
      const hidden = document.querySelector('.identity').hidden;
      document.querySelectorAll('.identity').forEach(value => value.hidden = !hidden);
      event.currentTarget.textContent = hidden ? 'Hide seeds and measurements' : 'Reveal seeds and measurements';
    }});
    document.querySelector('#copy').addEventListener('click', async () => {{
      save();
      const decision = {{ schemaVersion: 1, status: state.rejectedAll ? 'rejected-all' : state.selectedSeed === null ? 'undecided' : 'selected', characterId, auditionPlanSha256: planSha256, selectedSeed: state.selectedSeed, note: state.note }};
      try {{ await navigator.clipboard.writeText(JSON.stringify(decision, null, 2)); status.textContent = 'Review decision copied. This still has not changed the cast registry.'; }}
      catch {{ status.textContent = 'Clipboard access failed; tell Codex the candidate label or seed directly.'; }}
    }});
    paint();
  }})();
  </script>
</body>
</html>
"""


def _atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def build_review_packet(
    manifest_path: Path,
    qa_path: Path,
    ranking_path: Path,
    output_path: Path,
    repo_root: Path,
) -> dict[str, Any]:
    evidence = verify_audition_evidence(manifest_path, qa_path, ranking_path, repo_root)
    output_path = _within_repo(
        output_path, repo_root, "review output", must_exist=False
    )
    if output_path.suffix.lower() != ".html":
        raise AuditionReviewError("review output must use the .html extension")
    rendered = render_review_html(evidence, output_path)
    _atomic_write(output_path, rendered)
    page_hash = file_sha256(output_path)
    review_manifest = {
        "schemaVersion": 1,
        "status": "human-review-packet",
        "humanAuditRequired": True,
        "writesCastRegistry": False,
        "dialogue": evidence["plan"]["dialogue"],
        "characterId": evidence["plan"]["character_id"],
        "auditionPlanSha256": evidence["planSha256"],
        "inputs": {
            "auditionManifest": {
                "path": str(evidence["manifestPath"].relative_to(evidence["repoRoot"])),
                "sha256": file_sha256(evidence["manifestPath"]),
            },
            "asrReport": {
                "path": str(evidence["qaPath"].relative_to(evidence["repoRoot"])),
                "sha256": file_sha256(evidence["qaPath"]),
            },
            "speakerRanking": {
                "path": str(evidence["rankingPath"].relative_to(evidence["repoRoot"])),
                "sha256": file_sha256(evidence["rankingPath"]),
            },
        },
        "reference": {
            "path": str(
                evidence["reference"]["path"].relative_to(evidence["repoRoot"])
            ),
            "sha256": evidence["reference"]["sha256"],
        },
        "candidates": [
            {
                "blindLabel": chr(ord("A") + index) if index < 26 else str(index + 1),
                "seed": item["seed"],
                "path": str(item["path"].relative_to(evidence["repoRoot"])),
                "sha256": item["sha256"],
                "meanSpeakerCosineSimilarity": item["similarity"]["mean"],
                "passesOrdinaryWordGate": True,
            }
            for index, item in enumerate(
                _blind_order(evidence["outputs"], evidence["planSha256"])
            )
        ],
        "page": {
            "path": str(output_path.relative_to(evidence["repoRoot"])),
            "sha256": page_hash,
        },
    }
    review_manifest_path = output_path.with_name("review-manifest.json")
    _atomic_write(
        review_manifest_path,
        json.dumps(review_manifest, ensure_ascii=False, indent=2, sort_keys=True)
        + "\n",
    )
    return review_manifest


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--qa", type=Path, required=True)
    parser.add_argument("--ranking", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    report = build_review_packet(
        args.manifest,
        args.qa,
        args.ranking,
        args.output,
        args.repo_root,
    )
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
