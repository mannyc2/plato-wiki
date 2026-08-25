#!/usr/bin/env python3
"""Build a deterministic, anonymous cross-video acoustic voice bank.

This is a review-only aggregation layer over the immutable v2 cluster proofs.
It performs no inference, network, GPU, audio extraction, character assignment,
or cast-registry write.  Every source proof is revalidated before its normalized
cluster centroid contributes to a complete-link cross-video family candidate.
"""

from __future__ import annotations

import argparse
import contextlib
import copy
import hashlib
import json
import math
import os
import re
import statistics
import sys
import tempfile
import wave
from collections import Counter, defaultdict
from collections.abc import Iterator, Sequence
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import parse_qs, urlparse

import cluster_audiobook_speakers_v2 as cluster_v2


REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT_PATH = Path(__file__).resolve()
DEFAULT_QUEUE = Path("scratch/audio-speaker-cluster-v2/queue.json")
DEFAULT_CAST = Path("audio/cast.json")
DEFAULT_OUTPUT_ROOT = Path("scratch/audio-cross-video-voice-bank")
EXPECTED_VIDEO_COUNT = 29
EXPECTED_CLUSTER_COUNT = 68
EXPECTED_UNCLUSTERED_SEGMENT_COUNT = 74
EXPECTED_LOCAL_BELOW_THRESHOLD_SEGMENT_COUNT = 40
FAMILY_COSINE_THRESHOLD = 0.92
NEAREST_RANKING_COUNT = 10
SOCRATES_DOMINANT_INTERVAL_COVERAGE = 0.95
SOCRATES_MAXIMUM_COMPETING_COVERAGE = 0.02
SOCRATES_MAXIMUM_UNCOVERED_COVERAGE = 0.03
SOCRATES_DURATION_TOLERANCE_SECONDS = 0.05
MAX_QUEUE_BYTES = 32 * 1024 * 1024
MAX_PLAN_BYTES = 16 * 1024 * 1024
MAX_MANIFEST_BYTES = 32 * 1024 * 1024
MAX_EMBEDDING_BYTES = 128 * 1024 * 1024
MAX_CAST_BYTES = 4 * 1024 * 1024
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
CLUSTER_ID_RE = re.compile(r"^anonymous-cluster-[0-9]{2}$")
FAMILY_ID_RE = re.compile(r"^anonymous-family-[0-9]{3}$")

STATUS = "anonymous-cross-video-voice-bank-review-v1"
IDENTITY_POLICY = {
    "clusterLabels": "anonymous-only",
    "familyLabels": "anonymous-only",
    "characterAssignmentAllowed": False,
    "castRegistryWritesAllowed": False,
    "castCompletionCredit": False,
    "sameActorGuaranteed": False,
    "singleSpeakerGuaranteed": False,
    "humanListeningRequired": True,
    "captionTextUsedForIdentity": False,
}
ALGORITHM = {
    "name": "deterministic-complete-link-centroid-families",
    "version": 1,
    "clusterCentroid": (
        "L2-normalize every source-order CAM++ vector, take its source-order "
        "binary64 arithmetic mean, then L2-normalize the mean"
    ),
    "familyLinkage": "complete-link",
    "familyCosineThreshold": FAMILY_COSINE_THRESHOLD,
    "oneClusterPerVideo": True,
    "mergePriority": [
        "highest cross-family minimum cosine",
        "highest cross-family arithmetic-mean cosine",
        "lexicographically smallest merged cluster-key tuple",
    ],
    "singleLinkChainingAllowed": False,
    "nearestCrossVideoRankingCount": NEAREST_RANKING_COUNT,
    "floatingPoint": "Python binary64; no diagnostic rounding",
}


class VoiceBankError(ValueError):
    """Raised when anonymous voice-bank evidence is stale or unsafe."""


def canonical_json(value: Any) -> bytes:
    return cluster_v2.canonical_json(value)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


@contextlib.contextmanager
def _repo_cwd(root: Path) -> Iterator[None]:
    previous = Path.cwd()
    os.chdir(root)
    try:
        yield
    finally:
        os.chdir(previous)


def _relative_path(value: Any, root: Path, label: str) -> Path:
    if not isinstance(value, str) or not value or "\\" in value:
        raise VoiceBankError(f"{label} must be a repository-relative POSIX path")
    pure = PurePosixPath(value)
    if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
        raise VoiceBankError(f"{label} is not confined")
    path = root.joinpath(*pure.parts)
    try:
        path.resolve(strict=False).relative_to(root)
    except ValueError as error:
        raise VoiceBankError(f"{label} escapes the repository") from error
    for parent in (path, *path.parents):
        if parent.exists() and parent.is_symlink():
            raise VoiceBankError(f"{label} traverses a symlink")
        if parent == root:
            break
    return path


def _input_file(path: Path, root: Path, label: str, maximum_bytes: int) -> Path:
    candidate = path if path.is_absolute() else root / path
    try:
        resolved = candidate.resolve(strict=True)
        resolved.relative_to(root)
    except FileNotFoundError as error:
        raise VoiceBankError(f"missing {label}: {path}") from error
    except ValueError as error:
        raise VoiceBankError(f"{label} escapes the repository: {path}") from error
    if candidate.is_symlink() or not resolved.is_file():
        raise VoiceBankError(f"{label} must be a regular non-symlink file")
    size = resolved.stat().st_size
    if not 0 < size <= maximum_bytes:
        raise VoiceBankError(f"{label} exceeds its 1..{maximum_bytes} byte bound")
    return resolved


def _read_bound_json(
    path: Path, *, root: Path, label: str, maximum_bytes: int
) -> tuple[dict[str, Any], str]:
    file_path = _input_file(path, root, label, maximum_bytes)
    raw = file_path.read_bytes()
    try:
        payload = json.loads(raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise VoiceBankError(f"cannot parse {label}: {path}: {error}") from error
    if not isinstance(payload, dict):
        raise VoiceBankError(f"{label} must contain a JSON object")
    return payload, sha256_bytes(raw)


def _normalize(vector: Sequence[float], label: str) -> list[float]:
    if not vector:
        raise VoiceBankError(f"{label} is empty")
    values: list[float] = []
    for value in vector:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise VoiceBankError(f"{label} is non-numeric")
        number = float(value)
        if not math.isfinite(number):
            raise VoiceBankError(f"{label} is non-finite")
        values.append(number)
    norm = math.sqrt(sum(value * value for value in values))
    if not math.isfinite(norm) or norm <= 0:
        raise VoiceBankError(f"{label} has an invalid norm")
    return [value / norm for value in values]


def _centroid(vectors: Sequence[Sequence[float]], label: str) -> list[float]:
    if not vectors:
        raise VoiceBankError(f"{label} has no members")
    normalized = [
        _normalize(vector, f"{label} member {index}")
        for index, vector in enumerate(vectors)
    ]
    dimension = len(normalized[0])
    if any(len(vector) != dimension for vector in normalized):
        raise VoiceBankError(f"{label} dimensions differ")
    mean = [
        sum(vector[index] for vector in normalized) / len(normalized)
        for index in range(dimension)
    ]
    return _normalize(mean, f"{label} mean")


def _cosine(left: Sequence[float], right: Sequence[float]) -> float:
    if len(left) != len(right):
        raise VoiceBankError("cosine vectors have different dimensions")
    return sum(a * b for a, b in zip(left, right, strict=True))


def _centroid_record(vector: list[float]) -> dict[str, Any]:
    return {
        "dimension": len(vector),
        "normalized": True,
        "l2Norm": math.sqrt(sum(value * value for value in vector)),
        "vectorSha256": sha256_bytes(canonical_json(vector)),
        "vector": vector,
    }


def _validate_execution_provenance(
    manifest: dict[str, Any], plan: dict[str, Any], queue: dict[str, Any]
) -> dict[str, Any]:
    execution = manifest.get("executionTools")
    required = {
        "ffmpeg",
        "segmentationFfmpeg",
        "ffmpegMatchesSegmentation",
        "dotsSourceCommit",
        "torch",
        "cuda",
        "gpu",
        "embeddingDeterminism",
        "plannerScriptSha256",
        "coreScriptSha256",
    }
    if not isinstance(execution, dict) or set(execution) != required:
        raise VoiceBankError("fetched execution provenance is malformed")
    if (
        execution["segmentationFfmpeg"] != plan["tools"]["segmentationFfmpeg"]
        or execution["ffmpegMatchesSegmentation"]
        is not (execution["ffmpeg"] == execution["segmentationFfmpeg"])
        or execution["dotsSourceCommit"] != queue["embedding"]["dotsSourceCommit"]
        or execution["embeddingDeterminism"]
        != queue["embedding"]["determinism"]
        or execution["plannerScriptSha256"]
        != queue["tools"]["plannerScriptSha256"]
        or execution["coreScriptSha256"] != queue["tools"]["coreScriptSha256"]
    ):
        raise VoiceBankError("fetched execution provenance is detached")
    return execution


def _discover_exact_outputs(
    expected: set[Path], *, root: Path, output_root: Path
) -> None:
    base = output_root if output_root.is_absolute() else root / output_root
    try:
        base = base.resolve(strict=True)
        base.relative_to(root)
    except FileNotFoundError as error:
        raise VoiceBankError("v2 output root is missing") from error
    except ValueError as error:
        raise VoiceBankError("v2 output root escapes the repository") from error
    if not base.is_dir() or base.is_symlink():
        raise VoiceBankError("v2 output root is missing or unsafe")
    discovered: set[Path] = set()
    for dialogue in sorted(base.iterdir()):
        if dialogue.is_symlink() or not dialogue.is_dir():
            raise VoiceBankError(f"unexpected v2 output entry: {dialogue}")
        for video in sorted(dialogue.iterdir()):
            if video.is_symlink() or not video.is_dir():
                raise VoiceBankError(f"unexpected v2 video output entry: {video}")
            discovered.add(video.resolve(strict=True))
    expected_resolved = {path.resolve(strict=True) for path in expected}
    if discovered != expected_resolved:
        missing = len(expected_resolved - discovered)
        extra = len(discovered - expected_resolved)
        raise VoiceBankError(
            f"fetched v2 output inventory differs: {missing} missing, {extra} extra"
        )


def load_verified_clusters(
    queue_path: Path = DEFAULT_QUEUE,
    *,
    repo_root: Path = REPO_ROOT,
) -> dict[str, Any]:
    """Fail closed over the exact queue, plans, manifests, and embeddings."""

    root = repo_root.resolve(strict=True)
    queue_file = _input_file(queue_path, root, "v2 cluster queue", MAX_QUEUE_BYTES)
    queue_raw = queue_file.read_bytes()
    try:
        queue = json.loads(queue_raw)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise VoiceBankError(f"cannot parse v2 cluster queue: {error}") from error
    if not isinstance(queue, dict):
        raise VoiceBankError("v2 cluster queue must be an object")

    with _repo_cwd(root):
        try:
            cluster_v2.validate_queue(queue)
        except cluster_v2.CorpusClusterError as error:
            raise VoiceBankError(f"invalid or stale v2 queue: {error}") from error
        bound_queue = _relative_path(queue.get("queuePath"), root, "queuePath")
        if queue_file != bound_queue.resolve(strict=True):
            raise VoiceBankError("queue is not stored at its exact bound path")
        summary = queue.get("summary")
        items = queue.get("items")
        if (
            not isinstance(summary, dict)
            or not isinstance(items, list)
            or summary.get("videoCount") != EXPECTED_VIDEO_COUNT
            or summary.get("readyPlanCount") != EXPECTED_VIDEO_COUNT
            or summary.get("materializationRequiredCount") != 0
            or len(items) != EXPECTED_VIDEO_COUNT
            or any(item.get("status") != "ready" for item in items)
        ):
            raise VoiceBankError(
                f"voice bank requires all {EXPECTED_VIDEO_COUNT} fetched ready outputs"
            )

        expected_outputs: set[Path] = set()
        clusters: list[dict[str, Any]] = []
        evidence_inventory: list[dict[str, Any]] = []
        final_hash_checks: list[tuple[Path, str, str]] = []
        for item in items:
            selection = item["selection"]
            selection_key = selection["selectionKey"]
            plan_record = item["plan"]
            plan_file = _input_file(
                Path(plan_record["path"]), root, f"{selection_key} plan", MAX_PLAN_BYTES
            )
            try:
                plan = cluster_v2.load_plan_artifact(
                    Path(plan_record["path"]),
                    expected_sha256=plan_record["sha256"],
                )
                cluster_v2.validate_execution_inputs(plan)
            except cluster_v2.CorpusClusterError as error:
                raise VoiceBankError(
                    f"invalid or stale {selection_key} plan: {error}"
                ) from error
            if (
                plan["selection"] != selection
                or plan["source"]["materializedEvidence"] != item["source"]
                or any(
                    plan["captions"][field] != item["captions"][field]
                    for field in ("path", "sha256", "bytes", "textUsedForIdentity")
                )
                or plan["outputDirectory"] != plan_record["outputDirectory"]
                or len(plan["segmentation"]["segments"])
                != plan_record["segmentCount"]
            ):
                raise VoiceBankError(f"{selection_key} queue/plan binding drifted")

            output = _relative_path(
                plan["outputDirectory"], root, f"{selection_key} output"
            )
            expected_outputs.add(output)
            manifest_file = _input_file(
                output / "manifest.json",
                root,
                f"{selection_key} manifest",
                MAX_MANIFEST_BYTES,
            )
            manifest_raw = manifest_file.read_bytes()
            try:
                manifest = json.loads(manifest_raw)
            except (UnicodeDecodeError, json.JSONDecodeError) as error:
                raise VoiceBankError(
                    f"cannot parse {selection_key} manifest: {error}"
                ) from error
            if not isinstance(manifest, dict):
                raise VoiceBankError(f"{selection_key} manifest is not an object")
            execution = _validate_execution_provenance(manifest, plan, queue)
            try:
                verified = cluster_v2._verify_resume(output, plan, execution)
                vectors, embedding_path = cluster_v2._load_embedding_payload(
                    output, manifest, plan
                )
            except cluster_v2.CorpusClusterError as error:
                raise VoiceBankError(
                    f"invalid fetched output for {selection_key}: {error}"
                ) from error
            if verified is None or verified != manifest:
                raise VoiceBankError(
                    f"fetched output for {selection_key} did not resume-verify exactly"
                )
            embedding_path = embedding_path.resolve(strict=True)
            if embedding_path.stat().st_size > MAX_EMBEDDING_BYTES:
                raise VoiceBankError(f"{selection_key} embeddings exceed byte bound")
            manifest_sha = sha256_bytes(manifest_raw)
            embedding_sha = sha256_file(embedding_path)
            plan_file_sha = sha256_file(plan_file)
            final_hash_checks.extend(
                (
                    (manifest_file, manifest_sha, f"{selection_key} manifest"),
                    (embedding_path, embedding_sha, f"{selection_key} embeddings"),
                    (plan_file, plan_file_sha, f"{selection_key} plan"),
                )
            )

            segment_index = {
                segment["segmentId"]: index
                for index, segment in enumerate(manifest["segments"])
            }
            for cluster in manifest["clusters"]:
                cluster_id = cluster["clusterId"]
                if (
                    not isinstance(cluster_id, str)
                    or CLUSTER_ID_RE.fullmatch(cluster_id) is None
                    or cluster.get("identity") is not None
                ):
                    raise VoiceBankError(
                        f"{selection_key} cluster identity is not anonymous"
                    )
                members = [
                    segment
                    for segment in manifest["segments"]
                    if segment["clusterId"] == cluster_id
                ]
                indices = [segment_index[member["segmentId"]] for member in members]
                centroid = _centroid(
                    [vectors[index] for index in indices],
                    f"{selection_key}:{cluster_id} centroid",
                )
                local_threshold = plan["segmentation"]["parameters"][
                    "clusterCosineThreshold"
                ]
                outliers = [
                    member["segmentId"]
                    for member, vector_index in zip(members, indices, strict=True)
                    if _cosine(
                        _normalize(
                            vectors[vector_index],
                            f"{selection_key}:{cluster_id}:{member['segmentId']}",
                        ),
                        centroid,
                    )
                    < local_threshold
                ]
                cluster_key = f"{selection_key}:{cluster_id}"
                clusters.append(
                    {
                        "clusterKey": cluster_key,
                        "selectionKey": selection_key,
                        "dialogue": selection["dialogue"],
                        "videoId": selection["video"]["videoId"],
                        "clusterId": cluster_id,
                        "segmentCount": len(members),
                        "segmentIds": [member["segmentId"] for member in members],
                        "centroid": _centroid_record(centroid),
                        "localClusterDiagnostics": copy.deepcopy(
                            cluster["diagnostics"]
                        ),
                        "localMemberDiagnostics": [
                            {
                                "segmentId": member["segmentId"],
                                "startSeconds": member["startSeconds"],
                                "endSeconds": member["endSeconds"],
                                "centroidCosine": member["centroidCosine"],
                                "nearestCompetingCentroidCosine": member[
                                    "nearestCompetingCentroidCosine"
                                ],
                                "centroidMargin": member["centroidMargin"],
                            }
                            for member in members
                        ],
                        "localBelowThresholdSegmentIds": outliers,
                        "sourceBindings": {
                            "planSha256": plan["planSha256"],
                            "planFileSha256": plan_file_sha,
                            "manifestSha256": manifest_sha,
                            "embeddingsSha256": embedding_sha,
                        },
                    }
                )
            evidence_inventory.append(
                {
                    "selectionKey": selection_key,
                    "planSha256": plan["planSha256"],
                    "planFileSha256": plan_file_sha,
                    "manifestSha256": manifest_sha,
                    "embeddingsSha256": embedding_sha,
                    "clusterCount": len(manifest["clusters"]),
                    "localBelowThresholdSegmentCount": sum(
                        cluster["diagnostics"]["belowThresholdSegmentCount"]
                        for cluster in manifest["clusters"]
                    ),
                    "unclusteredSegmentCount": manifest["unclusteredSegmentCount"],
                    "unclusteredSegmentIds": [
                        segment["segmentId"]
                        for segment in manifest["segments"]
                        if segment["clusterId"] is None
                    ],
                }
            )

        _discover_exact_outputs(
            expected_outputs, root=root, output_root=cluster_v2.OUTPUT_ROOT
        )
        if len(clusters) != EXPECTED_CLUSTER_COUNT:
            raise VoiceBankError(
                f"expected {EXPECTED_CLUSTER_COUNT} verified clusters, got {len(clusters)}"
            )
        local_below_threshold_count = sum(
            len(cluster["localBelowThresholdSegmentIds"]) for cluster in clusters
        )
        if (
            local_below_threshold_count
            != EXPECTED_LOCAL_BELOW_THRESHOLD_SEGMENT_COUNT
        ):
            raise VoiceBankError(
                "verified local below-threshold member count changed: "
                f"expected {EXPECTED_LOCAL_BELOW_THRESHOLD_SEGMENT_COUNT}, "
                f"got {local_below_threshold_count}"
            )
        unclustered_count = sum(
            record["unclusteredSegmentCount"] for record in evidence_inventory
        )
        if unclustered_count != EXPECTED_UNCLUSTERED_SEGMENT_COUNT:
            raise VoiceBankError(
                "verified unclustered segment count changed: "
                f"expected {EXPECTED_UNCLUSTERED_SEGMENT_COUNT}, "
                f"got {unclustered_count}"
            )
        queue_sha = sha256_bytes(queue_raw)
        if sha256_file(queue_file) != queue_sha:
            raise VoiceBankError("queue changed while voice bank was built")
        for path, expected, label in final_hash_checks:
            if sha256_file(path) != expected:
                raise VoiceBankError(f"{label} changed while voice bank was built")

    clusters.sort(key=lambda cluster: cluster["clusterKey"])
    evidence_inventory.sort(key=lambda record: record["selectionKey"])
    return {
        "queue": queue,
        "queuePath": queue_file,
        "queueFileSha256": sha256_bytes(queue_raw),
        "clusters": clusters,
        "evidenceInventory": evidence_inventory,
        "evidenceInventorySha256": sha256_bytes(canonical_json(evidence_inventory)),
    }


def complete_link_families(
    clusters: Sequence[dict[str, Any]],
    *,
    threshold: float = FAMILY_COSINE_THRESHOLD,
) -> tuple[list[tuple[str, ...]], list[dict[str, Any]]]:
    """Deterministic complete-link grouping with no same-video family merge."""

    if not 0 < threshold < 1:
        raise VoiceBankError("family threshold must be in (0,1)")
    by_key = {cluster["clusterKey"]: cluster for cluster in clusters}
    if len(by_key) != len(clusters):
        raise VoiceBankError("cluster keys are duplicated")
    families = [(key,) for key in sorted(by_key)]
    merge_trace: list[dict[str, Any]] = []

    while True:
        candidates: list[tuple[float, float, tuple[str, ...], int, int]] = []
        for left_index, left in enumerate(families):
            left_videos = {by_key[key]["videoId"] for key in left}
            for right_index in range(left_index + 1, len(families)):
                right = families[right_index]
                if left_videos & {by_key[key]["videoId"] for key in right}:
                    continue
                scores = [
                    _cosine(
                        by_key[left_key]["centroid"]["vector"],
                        by_key[right_key]["centroid"]["vector"],
                    )
                    for left_key in left
                    for right_key in right
                ]
                minimum = min(scores)
                if minimum >= threshold:
                    candidates.append(
                        (
                            minimum,
                            sum(scores) / len(scores),
                            tuple(sorted((*left, *right))),
                            left_index,
                            right_index,
                        )
                    )
        if not candidates:
            break
        minimum, mean, merged, left_index, right_index = sorted(
            candidates,
            key=lambda candidate: (
                -candidate[0],
                -candidate[1],
                candidate[2],
            ),
        )[0]
        merge_trace.append(
            {
                "step": len(merge_trace) + 1,
                "leftClusterKeys": list(families[left_index]),
                "rightClusterKeys": list(families[right_index]),
                "crossMinimumCosine": minimum,
                "crossMeanCosine": mean,
                "mergedClusterKeys": list(merged),
            }
        )
        families = [
            family
            for index, family in enumerate(families)
            if index not in {left_index, right_index}
        ]
        families.append(merged)
        families.sort()
    return sorted(families), merge_trace


def _pairwise_records(clusters: Sequence[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    records: list[dict[str, Any]] = []
    same_video = 0
    for left_index, left in enumerate(clusters):
        for right in clusters[left_index + 1 :]:
            if left["videoId"] == right["videoId"]:
                same_video += 1
                continue
            records.append(
                {
                    "leftClusterKey": left["clusterKey"],
                    "rightClusterKey": right["clusterKey"],
                    "cosine": _cosine(
                        left["centroid"]["vector"], right["centroid"]["vector"]
                    ),
                }
            )
    records.sort(
        key=lambda record: (
            -record["cosine"],
            record["leftClusterKey"],
            record["rightClusterKey"],
        )
    )
    for rank, record in enumerate(records, start=1):
        record["rank"] = rank
        record["meetsFamilyThreshold"] = (
            record["cosine"] >= FAMILY_COSINE_THRESHOLD
        )
    return records, same_video


def _family_records(
    clusters: list[dict[str, Any]], families: list[tuple[str, ...]]
) -> list[dict[str, Any]]:
    by_key = {cluster["clusterKey"]: cluster for cluster in clusters}
    family_by_cluster: dict[str, str] = {}
    family_centroids: dict[str, list[float]] = {}
    ids: list[tuple[str, tuple[str, ...]]] = []
    for index, members in enumerate(families, start=1):
        family_id = f"anonymous-family-{index:03d}"
        ids.append((family_id, members))
        family_centroids[family_id] = _centroid(
            [by_key[key]["centroid"]["vector"] for key in members],
            f"{family_id} centroid",
        )
        for key in members:
            family_by_cluster[key] = family_id

    records: list[dict[str, Any]] = []
    for family_id, members in ids:
        internal = [
            _cosine(
                by_key[left]["centroid"]["vector"],
                by_key[right]["centroid"]["vector"],
            )
            for index, left in enumerate(members)
            for right in members[index + 1 :]
        ]
        external_pairs = [
            (
                _cosine(
                    by_key[member]["centroid"]["vector"],
                    by_key[external]["centroid"]["vector"],
                ),
                member,
                external,
            )
            for member in members
            for external in by_key
            if external not in members
            and by_key[member]["videoId"] != by_key[external]["videoId"]
        ]
        nearest_external_pair = (
            max(external_pairs, key=lambda value: (value[0], value[1], value[2]))
            if external_pairs
            else None
        )
        competing_family_centroids = [
            (
                _cosine(family_centroids[family_id], family_centroids[other_id]),
                other_id,
            )
            for other_id, _ in ids
            if other_id != family_id
        ]
        nearest_family = (
            max(competing_family_centroids, key=lambda value: (value[0], value[1]))
            if competing_family_centroids
            else None
        )
        complete_link_floor = min(internal) if internal else None
        external_maximum = nearest_external_pair[0] if nearest_external_pair else None
        records.append(
            {
                "familyId": family_id,
                "status": (
                    "recurrent-acoustic-candidate"
                    if len(members) > 1
                    else "singleton-unlinked"
                ),
                "memberCount": len(members),
                "videoCount": len({by_key[key]["videoId"] for key in members}),
                "dialogueCount": len({by_key[key]["dialogue"] for key in members}),
                "clusterKeys": list(members),
                "centroid": _centroid_record(family_centroids[family_id]),
                "internalPairwiseCosine": {
                    "minimum": complete_link_floor,
                    "median": statistics.median(internal) if internal else None,
                    "maximum": max(internal) if internal else None,
                },
                "nearestExternalClusterPair": (
                    {
                        "cosine": nearest_external_pair[0],
                        "memberClusterKey": nearest_external_pair[1],
                        "externalClusterKey": nearest_external_pair[2],
                    }
                    if nearest_external_pair
                    else None
                ),
                "completeLinkSeparationMargin": (
                    complete_link_floor - external_maximum
                    if complete_link_floor is not None
                    and external_maximum is not None
                    else None
                ),
                "nearestExternalFamilyCentroid": (
                    {"familyId": nearest_family[1], "cosine": nearest_family[0]}
                    if nearest_family
                    else None
                ),
                "uncertainty": {
                    "identityResolved": False,
                    "sameActorGuaranteed": False,
                    "singleSpeakerGuaranteed": False,
                    "humanListeningRequired": True,
                    "castCompletionCredit": False,
                },
            }
        )

    for cluster in clusters:
        key = cluster["clusterKey"]
        family_id = family_by_cluster[key]
        family_vector = family_centroids[family_id]
        external = [
            (
                _cosine(
                    cluster["centroid"]["vector"],
                    other["centroid"]["vector"],
                ),
                other["clusterKey"],
            )
            for other in clusters
            if other["clusterKey"] != key
            and other["videoId"] != cluster["videoId"]
            and family_by_cluster[other["clusterKey"]] != family_id
        ]
        external.sort(key=lambda value: (-value[0], value[1]))
        own = _cosine(cluster["centroid"]["vector"], family_vector)
        cluster["familyId"] = family_id
        cluster["familyCentroidCosine"] = own
        cluster["nearestExternalCluster"] = (
            {"clusterKey": external[0][1], "cosine": external[0][0]}
            if external
            else None
        )
        cluster["familyMargin"] = own - external[0][0] if external else None
        all_ranked = [
            (
                _cosine(
                    cluster["centroid"]["vector"],
                    other["centroid"]["vector"],
                ),
                other["clusterKey"],
                family_by_cluster[other["clusterKey"]],
            )
            for other in clusters
            if other["clusterKey"] != key
            and other["videoId"] != cluster["videoId"]
        ]
        all_ranked.sort(key=lambda value: (-value[0], value[1]))
        top = all_ranked[:NEAREST_RANKING_COUNT]
        cluster["nearestCrossVideo"] = [
            {
                "rank": rank,
                "clusterKey": candidate_key,
                "familyId": candidate_family,
                "cosine": cosine,
                "deltaFromTop": top[0][0] - cosine,
                "sameFamily": candidate_family == family_id,
                "meetsFamilyThreshold": cosine >= FAMILY_COSINE_THRESHOLD,
            }
            for rank, (cosine, candidate_key, candidate_family) in enumerate(
                top, start=1
            )
        ]
        cluster["uncertainty"] = {
            "identityResolved": False,
            "sameActorGuaranteed": False,
            "singleSpeakerGuaranteed": False,
            "humanListeningRequired": True,
            "castCompletionCredit": False,
        }
    return records


def _youtube_video_id(url: str) -> str | None:
    parsed = urlparse(url)
    if parsed.netloc not in {"youtube.com", "www.youtube.com"}:
        return None
    values = parse_qs(parsed.query).get("v", [])
    return values[0] if len(values) == 1 else None


def _wav_duration(path: Path) -> tuple[float, int, int, int]:
    try:
        with wave.open(str(path), "rb") as handle:
            frames = handle.getnframes()
            sample_rate = handle.getframerate()
            channels = handle.getnchannels()
            sample_width = handle.getsampwidth()
    except (wave.Error, OSError) as error:
        raise VoiceBankError(f"selected cast reference WAV is invalid: {error}") from error
    if sample_rate <= 0:
        raise VoiceBankError("selected cast reference WAV has invalid sample rate")
    return frames / sample_rate, sample_rate, channels, sample_width


def _socrates_reference_comparison(
    cast_path: Path | None,
    *,
    repo_root: Path,
    verified: dict[str, Any],
    family_by_cluster: dict[str, str],
) -> tuple[dict[str, Any] | None, dict[str, Any] | None, dict[str, str | None]]:
    if cast_path is None:
        return None, None, {"castSha256": None, "castReferenceWavSha256": None}
    cast, cast_sha = _read_bound_json(
        cast_path, root=repo_root, label="cast registry", maximum_bytes=MAX_CAST_BYTES
    )
    voices = cast.get("voices")
    if not isinstance(voices, list):
        raise VoiceBankError("cast registry voices are missing")
    candidates = [
        voice
        for voice in voices
        if isinstance(voice, dict)
        and voice.get("characterId") == "socrates"
        and voice.get("status") == "selected"
    ]
    if len(candidates) != 1:
        raise VoiceBankError("exactly one selected Socrates cast voice is required")
    voice = candidates[0]
    reference = voice.get("reference")
    if not isinstance(reference, dict):
        raise VoiceBankError("selected Socrates reference evidence is missing")
    required = (
        "sourceUrl",
        "videoStartSeconds",
        "videoEndSeconds",
        "localDurationSeconds",
        "localSha256",
        "relativePath",
        "promptText",
    )
    if any(field not in reference for field in required):
        raise VoiceBankError("selected Socrates reference evidence is incomplete")
    video_id = _youtube_video_id(reference["sourceUrl"])
    start = reference["videoStartSeconds"]
    end = reference["videoEndSeconds"]
    if (
        video_id is None
        or isinstance(start, bool)
        or not isinstance(start, (int, float))
        or isinstance(end, bool)
        or not isinstance(end, (int, float))
        or not math.isfinite(float(start))
        or not math.isfinite(float(end))
        or not 0 <= start < end
        or not isinstance(reference["localSha256"], str)
        or SHA256_RE.fullmatch(reference["localSha256"]) is None
    ):
        raise VoiceBankError("selected Socrates interval evidence is malformed")
    reference_path = _input_file(
        Path(reference["relativePath"]),
        repo_root,
        "selected Socrates reference WAV",
        512 * 1024 * 1024,
    )
    reference_sha = sha256_file(reference_path)
    if reference_sha != reference["localSha256"]:
        raise VoiceBankError("selected Socrates reference WAV hash changed")
    wav_duration, sample_rate, channels, sample_width = _wav_duration(reference_path)
    if abs(wav_duration - float(reference["localDurationSeconds"])) > 0.001:
        raise VoiceBankError("selected Socrates reference WAV duration changed")

    crito_item = next(
        (
            item
            for item in verified["queue"]["items"]
            if item["selection"]["selectionKey"] == f"crito:{video_id}"
        ),
        None,
    )
    if crito_item is None:
        raise VoiceBankError("selected Socrates video is not the pinned Crito source")
    output = _relative_path(
        crito_item["plan"]["outputDirectory"], repo_root, "Crito output"
    )
    manifest, _ = _read_bound_json(
        output / "manifest.json",
        root=repo_root,
        label="Crito cluster manifest",
        maximum_bytes=MAX_MANIFEST_BYTES,
    )
    interval_duration = float(end) - float(start)
    overlaps: list[dict[str, Any]] = []
    grouped: dict[str | None, float] = defaultdict(float)
    for segment in manifest["segments"]:
        overlap = max(
            0.0,
            min(float(end), segment["endSeconds"])
            - max(float(start), segment["startSeconds"]),
        )
        if overlap <= 0:
            continue
        grouped[segment["clusterId"]] += overlap
        overlaps.append(
            {
                "segmentId": segment["segmentId"],
                "clusterId": segment["clusterId"],
                "startSeconds": segment["startSeconds"],
                "endSeconds": segment["endSeconds"],
                "overlapSeconds": overlap,
                "referenceIntervalCoverage": overlap / interval_duration,
                "segmentCoverage": overlap
                / (segment["endSeconds"] - segment["startSeconds"]),
            }
        )
    clustered = sorted(
        ((duration, cluster_id) for cluster_id, duration in grouped.items() if cluster_id),
        reverse=True,
    )
    dominant_duration, dominant_cluster_id = clustered[0] if clustered else (0.0, None)
    competing_duration = sum(duration for duration, _ in clustered[1:])
    covered = sum(grouped.values())
    uncovered = max(0.0, interval_duration - covered)
    duration_delta = abs(wav_duration - interval_duration)
    reasons: list[str] = []
    if dominant_duration / interval_duration < SOCRATES_DOMINANT_INTERVAL_COVERAGE:
        reasons.append("dominant anonymous cluster covers less than 95% of interval")
    if competing_duration / interval_duration > SOCRATES_MAXIMUM_COMPETING_COVERAGE:
        reasons.append("more than 2% of interval overlaps competing anonymous clusters")
    if uncovered / interval_duration > SOCRATES_MAXIMUM_UNCOVERED_COVERAGE:
        reasons.append("more than 3% of interval is outside verified clustered segments")
    if duration_delta > SOCRATES_DURATION_TOLERANCE_SECONDS:
        reasons.append("local reference duration does not match the recorded video interval")
    target_key = (
        f"crito:{video_id}:{dominant_cluster_id}" if dominant_cluster_id else None
    )
    if target_key not in family_by_cluster:
        reasons.append("dominant interval cluster is not in the verified voice bank")
    comparison = {
        "status": "external-comparison-only" if reasons else "anchor-gate-passed",
        "characterClaimSource": "selected cast registry only",
        "characterId": "socrates",
        "castVoiceLabel": voice.get("selection", {}).get("label"),
        "castSha256": cast_sha,
        "referenceWav": {
            "path": reference["relativePath"],
            "sha256": reference_sha,
            "durationSeconds": wav_duration,
            "sampleRate": sample_rate,
            "channels": channels,
            "sampleWidthBytes": sample_width,
        },
        "videoId": video_id,
        "videoStartSeconds": float(start),
        "videoEndSeconds": float(end),
        "videoIntervalSeconds": interval_duration,
        "durationDeltaSeconds": duration_delta,
        "overlaps": overlaps,
        "dominantClusterKey": target_key,
        "dominantIntervalCoverage": dominant_duration / interval_duration,
        "competingIntervalCoverage": competing_duration / interval_duration,
        "uncoveredIntervalCoverage": uncovered / interval_duration,
        "anchorGate": {
            "minimumDominantIntervalCoverage": SOCRATES_DOMINANT_INTERVAL_COVERAGE,
            "maximumCompetingIntervalCoverage": SOCRATES_MAXIMUM_COMPETING_COVERAGE,
            "maximumUncoveredIntervalCoverage": SOCRATES_MAXIMUM_UNCOVERED_COVERAGE,
            "maximumDurationDeltaSeconds": SOCRATES_DURATION_TOLERANCE_SECONDS,
            "passed": not reasons,
            "rejectionReasons": reasons,
        },
        "limitations": {
            "directReferenceEmbeddingAvailable": False,
            "clusterIdentityInferred": False,
            "familyIdentityInferred": False,
            "castCompletionCredit": False,
        },
    }
    anchor = None
    if not reasons and target_key is not None:
        anchor = {
            "status": "evidence-bound-provisional-anchor",
            "characterId": "socrates",
            "clusterKey": target_key,
            "familyId": family_by_cluster[target_key],
            "basis": "exclusive selected-cast interval overlap only",
            "humanAuditRequired": True,
            "castCompletionCredit": False,
            "comparisonSha256": sha256_bytes(canonical_json(comparison)),
        }
    return comparison, anchor, {
        "castSha256": cast_sha,
        "castReferenceWavSha256": reference_sha,
    }


def build_voice_bank(
    queue_path: Path = DEFAULT_QUEUE,
    cast_path: Path | None = DEFAULT_CAST,
    *,
    repo_root: Path = REPO_ROOT,
    generator_path: Path = SCRIPT_PATH,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    generator = _input_file(
        generator_path, root, "voice-bank generator", 4 * 1024 * 1024
    )
    generator_sha = sha256_file(generator)
    verified = load_verified_clusters(queue_path, repo_root=root)
    clusters = copy.deepcopy(verified["clusters"])
    families, merge_trace = complete_link_families(clusters)
    pairwise, excluded_same_video = _pairwise_records(clusters)
    family_records = _family_records(clusters, families)
    family_by_cluster = {
        key: family["familyId"]
        for family in family_records
        for key in family["clusterKeys"]
    }
    comparison, anchor, cast_hashes = _socrates_reference_comparison(
        cast_path,
        repo_root=root,
        verified=verified,
        family_by_cluster=family_by_cluster,
    )
    if sha256_file(generator) != generator_sha:
        raise VoiceBankError("voice-bank generator changed while running")

    local_outliers = sum(
        len(cluster["localBelowThresholdSegmentIds"]) for cluster in clusters
    )
    unclustered = sum(
        record["unclusteredSegmentCount"]
        for record in verified["evidenceInventory"]
    )
    recurrent = [family for family in family_records if family["memberCount"] > 1]
    artifact: dict[str, Any] = {
        "schemaVersion": 1,
        "status": STATUS,
        "accepted": False,
        "provisionalOnly": True,
        "countsAsCastCredit": False,
        "inputHashes": {
            "queueSha256": verified["queue"]["queueSha256"],
            "queueFileSha256": verified["queueFileSha256"],
            "generatorSha256": generator_sha,
            "v2PlannerSha256": verified["queue"]["tools"][
                "plannerScriptSha256"
            ],
            "frozenCoreSha256": verified["queue"]["tools"]["coreScriptSha256"],
            "evidenceInventorySha256": verified["evidenceInventorySha256"],
            **cast_hashes,
        },
        "identityPolicy": copy.deepcopy(IDENTITY_POLICY),
        "algorithm": copy.deepcopy(ALGORITHM),
        "summary": {
            "videoCount": len(verified["evidenceInventory"]),
            "clusterCount": len(clusters),
            "familyCount": len(family_records),
            "recurrentFamilyCount": len(recurrent),
            "recurrentlyLinkedClusterCount": sum(
                family["memberCount"] for family in recurrent
            ),
            "singletonFamilyCount": sum(
                family["memberCount"] == 1 for family in family_records
            ),
            "localBelowThresholdSegmentCount": local_outliers,
            "unclusteredSegmentCount": unclustered,
            "crossVideoPairCount": len(pairwise),
            "sameVideoPairCountExcluded": excluded_same_video,
            "socratesAnchorCount": int(anchor is not None),
        },
        "evidenceInventory": verified["evidenceInventory"],
        "mergeTrace": merge_trace,
        "families": family_records,
        "clusters": clusters,
        "crossVideoPairwiseRanking": pairwise,
        "socratesReferenceComparison": comparison,
        "socratesAnchor": anchor,
    }
    artifact["voiceBankSha256"] = sha256_bytes(canonical_json(artifact))
    validate_voice_bank(artifact)
    return artifact


def _contains_identity_claim(value: Any) -> bool:
    if isinstance(value, dict):
        return any(
            key in {"characterId", "identity"}
            or _contains_identity_claim(child)
            for key, child in value.items()
        )
    if isinstance(value, list):
        return any(_contains_identity_claim(child) for child in value)
    return False


def validate_voice_bank(artifact: dict[str, Any]) -> None:
    expected_keys = {
        "schemaVersion",
        "status",
        "accepted",
        "provisionalOnly",
        "countsAsCastCredit",
        "inputHashes",
        "identityPolicy",
        "algorithm",
        "summary",
        "evidenceInventory",
        "mergeTrace",
        "families",
        "clusters",
        "crossVideoPairwiseRanking",
        "socratesReferenceComparison",
        "socratesAnchor",
        "voiceBankSha256",
    }
    if not isinstance(artifact, dict) or set(artifact) != expected_keys:
        raise VoiceBankError("voice-bank artifact shape is invalid")
    signature = artifact.get("voiceBankSha256")
    if not isinstance(signature, str) or SHA256_RE.fullmatch(signature) is None:
        raise VoiceBankError("voice-bank signature is malformed")
    unsigned = {key: value for key, value in artifact.items() if key != "voiceBankSha256"}
    if sha256_bytes(canonical_json(unsigned)) != signature:
        raise VoiceBankError("voice-bank signature does not match exact content")
    if (
        artifact["schemaVersion"] != 1
        or artifact["status"] != STATUS
        or artifact["accepted"] is not False
        or artifact["provisionalOnly"] is not True
        or artifact["countsAsCastCredit"] is not False
        or artifact["identityPolicy"] != IDENTITY_POLICY
        or artifact["algorithm"] != ALGORITHM
    ):
        raise VoiceBankError("voice-bank safety policy or algorithm changed")
    clusters = artifact["clusters"]
    families = artifact["families"]
    evidence_inventory = artifact["evidenceInventory"]
    merge_trace = artifact["mergeTrace"]
    if (
        not isinstance(clusters, list)
        or not isinstance(families, list)
        or not isinstance(evidence_inventory, list)
        or not isinstance(merge_trace, list)
    ):
        raise VoiceBankError("voice-bank clusters/families must be arrays")
    selection_keys = [record.get("selectionKey") for record in evidence_inventory]
    if (
        selection_keys != sorted(selection_keys)
        or len(selection_keys) != len(set(selection_keys))
        or any(
            not isinstance(record, dict)
            or set(record)
            != {
                "selectionKey",
                "planSha256",
                "planFileSha256",
                "manifestSha256",
                "embeddingsSha256",
                "clusterCount",
                "localBelowThresholdSegmentCount",
                "unclusteredSegmentCount",
                "unclusteredSegmentIds",
            }
            or any(
                not isinstance(record[field], str)
                or SHA256_RE.fullmatch(record[field]) is None
                for field in (
                    "planSha256",
                    "planFileSha256",
                    "manifestSha256",
                    "embeddingsSha256",
                )
            )
            or not isinstance(record["unclusteredSegmentIds"], list)
            or len(record["unclusteredSegmentIds"])
            != record["unclusteredSegmentCount"]
            for record in evidence_inventory
        )
    ):
        raise VoiceBankError("voice-bank evidence inventory is malformed")
    cluster_keys = [cluster.get("clusterKey") for cluster in clusters]
    if (
        cluster_keys != sorted(cluster_keys)
        or len(set(cluster_keys)) != len(cluster_keys)
        or any(
            _contains_identity_claim(cluster)
            for cluster in clusters
        )
    ):
        raise VoiceBankError("voice-bank cluster labels are invalid or non-anonymous")
    for cluster in clusters:
        centroid = cluster.get("centroid")
        if not isinstance(centroid, dict) or set(centroid) != {
            "dimension",
            "normalized",
            "l2Norm",
            "vectorSha256",
            "vector",
        }:
            raise VoiceBankError("cluster centroid record is malformed")
        vector = centroid["vector"]
        normalized = _normalize(vector, f"{cluster['clusterKey']} centroid")
        norm = math.sqrt(sum(value * value for value in vector))
        if (
            centroid["dimension"] != len(vector)
            or centroid["normalized"] is not True
            or not math.isclose(norm, 1.0, rel_tol=0.0, abs_tol=1e-12)
            or not math.isclose(
                centroid["l2Norm"], norm, rel_tol=0.0, abs_tol=1e-15
            )
            or any(
                not math.isclose(actual, expected, rel_tol=0.0, abs_tol=1e-15)
                for actual, expected in zip(vector, normalized, strict=True)
            )
        ):
            raise VoiceBankError("cluster centroid is not normalized")
        if centroid["vectorSha256"] != sha256_bytes(canonical_json(vector)):
            raise VoiceBankError("cluster centroid hash mismatch")
    if any(not isinstance(family, dict) for family in families):
        raise VoiceBankError("anonymous family record is malformed")
    represented = [key for family in families for key in family["clusterKeys"]]
    if sorted(represented) != cluster_keys or len(represented) != len(set(represented)):
        raise VoiceBankError("anonymous families do not partition clusters")
    if [family["familyId"] for family in families] != [
        f"anonymous-family-{index:03d}" for index in range(1, len(families) + 1)
    ] or any(
        FAMILY_ID_RE.fullmatch(family["familyId"]) is None
        or _contains_identity_claim(family)
        for family in families
    ):
        raise VoiceBankError("anonymous family labels are invalid")
    base_clusters = copy.deepcopy(clusters)
    derived_cluster_keys = {
        "familyId",
        "familyCentroidCosine",
        "nearestExternalCluster",
        "familyMargin",
        "nearestCrossVideo",
        "uncertainty",
    }
    for cluster in base_clusters:
        if not derived_cluster_keys.issubset(cluster):
            raise VoiceBankError("cluster family diagnostics are incomplete")
        for key in derived_cluster_keys:
            del cluster[key]
    rebuilt, rebuilt_trace = complete_link_families(base_clusters)
    if rebuilt != [tuple(family["clusterKeys"]) for family in families]:
        raise VoiceBankError("family membership differs from complete-link recomputation")
    if merge_trace != rebuilt_trace:
        raise VoiceBankError("complete-link merge trace changed")
    rebuilt_family_records = _family_records(base_clusters, rebuilt)
    if rebuilt_family_records != families or base_clusters != clusters:
        raise VoiceBankError("family diagnostics differ from exact recomputation")
    expected_pairwise, excluded = _pairwise_records(clusters)
    if artifact["crossVideoPairwiseRanking"] != expected_pairwise:
        raise VoiceBankError("cross-video pairwise diagnostics changed")
    summary = artifact["summary"]
    recurrent = [family for family in families if family["memberCount"] > 1]
    expected_summary = {
        "videoCount": len(artifact["evidenceInventory"]),
        "clusterCount": len(clusters),
        "familyCount": len(families),
        "recurrentFamilyCount": len(recurrent),
        "recurrentlyLinkedClusterCount": sum(
            family["memberCount"] for family in recurrent
        ),
        "singletonFamilyCount": sum(family["memberCount"] == 1 for family in families),
        "localBelowThresholdSegmentCount": sum(
            len(cluster["localBelowThresholdSegmentIds"]) for cluster in clusters
        ),
        "unclusteredSegmentCount": sum(
            record["unclusteredSegmentCount"]
            for record in artifact["evidenceInventory"]
        ),
        "crossVideoPairCount": len(expected_pairwise),
        "sameVideoPairCountExcluded": excluded,
        "socratesAnchorCount": int(artifact["socratesAnchor"] is not None),
    }
    if summary != expected_summary:
        raise VoiceBankError("voice-bank summary changed")
    anchor = artifact["socratesAnchor"]
    comparison = artifact["socratesReferenceComparison"]
    if comparison is None:
        if anchor is not None:
            raise VoiceBankError("Socrates anchor has no reference comparison")
    elif not isinstance(comparison, dict):
        raise VoiceBankError("Socrates reference comparison is malformed")
    else:
        gate = comparison.get("anchorGate")
        if not isinstance(gate, dict) or not isinstance(gate.get("passed"), bool):
            raise VoiceBankError("Socrates reference gate is malformed")
        if gate["passed"] is not (anchor is not None):
            raise VoiceBankError("Socrates anchor and interval gate disagree")
        expected_status = (
            "anchor-gate-passed" if gate["passed"] else "external-comparison-only"
        )
        if comparison.get("status") != expected_status:
            raise VoiceBankError("Socrates comparison status disagrees with its gate")
    if anchor is not None:
        if (
            not isinstance(comparison, dict)
            or not comparison.get("anchorGate", {}).get("passed")
            or anchor.get("characterId") != "socrates"
            or anchor.get("clusterKey") not in cluster_keys
            or anchor.get("familyId")
            != next(
                cluster["familyId"]
                for cluster in clusters
                if cluster["clusterKey"] == anchor["clusterKey"]
            )
            or anchor.get("castCompletionCredit") is not False
            or anchor.get("comparisonSha256")
            != sha256_bytes(canonical_json(comparison))
        ):
            raise VoiceBankError("Socrates anchor lacks its exclusive overlap proof")


def render_report(artifact: dict[str, Any]) -> str:
    summary = artifact["summary"]
    lines = [
        "# Anonymous cross-video acoustic voice bank",
        "",
        "> Review-only acoustic recurrence evidence. These families are not character "
        "identities, do not guarantee one actor, and confer no cast-completion credit.",
        "",
        f"Voice-bank SHA-256: `{artifact['voiceBankSha256']}`",
        "",
        "## Summary",
        "",
        f"- Verified videos: {summary['videoCount']}",
        f"- Anonymous source clusters: {summary['clusterCount']}",
        f"- Anonymous families: {summary['familyCount']}",
        f"- Recurrent family candidates: {summary['recurrentFamilyCount']}",
        f"- Clusters linked recurrently: {summary['recurrentlyLinkedClusterCount']}",
        f"- Singleton families: {summary['singletonFamilyCount']}",
        f"- Preserved local below-threshold members: {summary['localBelowThresholdSegmentCount']}",
        f"- Verified segments excluded from local clusters: {summary['unclusteredSegmentCount']}",
        "",
        "## Method",
        "",
        f"Complete-link agglomeration requires every cross-video member pair to meet "
        f"cosine `{FAMILY_COSINE_THRESHOLD}` and permits at most one cluster from a "
        "video in a family. Single-link chaining is forbidden. Every cluster centroid "
        "is recomputed from the exact queue-bound CAM++ vectors and stored in full in "
        "the JSON artifact.",
        "",
        "## Selected Socrates reference comparison",
        "",
    ]
    comparison = artifact["socratesReferenceComparison"]
    if comparison is None:
        lines.append("No selected-cast comparison was requested.")
    else:
        gate = comparison["anchorGate"]
        lines.extend(
            [
                f"- Result: **{comparison['status']}**",
                f"- Dominant interval coverage: {comparison['dominantIntervalCoverage']:.6f}",
                f"- Competing-cluster coverage: {comparison['competingIntervalCoverage']:.6f}",
                f"- Uncovered coverage: {comparison['uncoveredIntervalCoverage']:.6f}",
                f"- Anchor gate passed: {str(gate['passed']).lower()}",
            ]
        )
        for reason in gate["rejectionReasons"]:
            lines.append(f"- Rejection: {reason}")
        lines.extend(
            [
                "",
                "This comparison is external to the anonymous family model. It does not "
                "label the dominant cluster or its family.",
            ]
        )
    lines.extend(
        [
            "",
            "## Anonymous families",
            "",
            "| Family | Status | Members | Complete-link minimum | Separation margin |",
            "|---|---|---:|---:|---:|",
        ]
    )
    for family in artifact["families"]:
        minimum = family["internalPairwiseCosine"]["minimum"]
        margin = family["completeLinkSeparationMargin"]
        lines.append(
            "| `{}` | {} | {} | {} | {} |".format(
                family["familyId"],
                family["status"],
                family["memberCount"],
                f"{minimum:.6f}" if minimum is not None else "n/a",
                f"{margin:.6f}" if margin is not None else "n/a",
            )
        )
        lines.extend(f"  - `{key}`" for key in family["clusterKeys"])
    lines.extend(
        [
            "",
            "## Highest cross-video centroid similarities",
            "",
            "| Rank | Left | Right | Cosine |",
            "|---:|---|---|---:|",
        ]
    )
    for pair in artifact["crossVideoPairwiseRanking"][:100]:
        lines.append(
            f"| {pair['rank']} | `{pair['leftClusterKey']}` | "
            f"`{pair['rightClusterKey']}` | {pair['cosine']:.6f} |"
        )
    return "\n".join(lines) + "\n"


def _artifact_output_root(path: Path, repo_root: Path) -> Path:
    root = repo_root.resolve(strict=True)
    scratch = (root / "scratch").resolve(strict=True)
    candidate = path if path.is_absolute() else root / path
    try:
        resolved = candidate.resolve(strict=False)
        relative = resolved.relative_to(scratch)
    except ValueError as error:
        raise VoiceBankError("voice-bank output must remain below scratch/") from error
    if not relative.parts:
        raise VoiceBankError("voice-bank output may not replace scratch/")
    for parent in (candidate, *candidate.parents):
        if parent.exists() and parent.is_symlink():
            raise VoiceBankError("voice-bank output may not traverse symlinks")
        if parent == root:
            break
    return resolved


def write_voice_bank(
    artifact: dict[str, Any],
    *,
    output_root: Path = DEFAULT_OUTPUT_ROOT,
    repo_root: Path = REPO_ROOT,
) -> tuple[Path, str]:
    validate_voice_bank(artifact)
    base = _artifact_output_root(output_root, repo_root)
    destination = base / artifact["voiceBankSha256"]
    json_bytes = (
        json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    report_bytes = render_report(artifact).encode("utf-8")
    expected = {"voice-bank.json": json_bytes, "report.md": report_bytes}
    if destination.exists():
        if destination.is_symlink() or not destination.is_dir():
            raise VoiceBankError("existing voice-bank artifact is not a safe directory")
        actual_names = {
            path.relative_to(destination).as_posix()
            for path in destination.rglob("*")
            if path.is_file()
        }
        if actual_names != set(expected) or any(
            (destination / name).read_bytes() != payload
            for name, payload in expected.items()
        ):
            raise VoiceBankError("existing content-addressed voice-bank artifact differs")
        return destination, "verified-existing"
    base.mkdir(parents=True, exist_ok=True)
    temporary = Path(
        tempfile.mkdtemp(prefix=f".{artifact['voiceBankSha256']}.", dir=base)
    )
    try:
        for name, payload in expected.items():
            (temporary / name).write_bytes(payload)
        temporary.replace(destination)
    finally:
        if temporary.exists():
            for child in temporary.iterdir():
                child.unlink()
            temporary.rmdir()
    return destination, "written"


def verify_written_voice_bank(
    path: Path,
    *,
    queue_path: Path = DEFAULT_QUEUE,
    cast_path: Path | None = DEFAULT_CAST,
    repo_root: Path = REPO_ROOT,
    generator_path: Path = SCRIPT_PATH,
) -> dict[str, Any]:
    root = repo_root.resolve(strict=True)
    payload, _ = _read_bound_json(
        path, root=root, label="voice-bank artifact", maximum_bytes=64 * 1024 * 1024
    )
    validate_voice_bank(payload)
    if path.parent.name != payload["voiceBankSha256"]:
        raise VoiceBankError("voice-bank artifact is not in its content-addressed directory")
    rebuilt = build_voice_bank(
        queue_path,
        cast_path,
        repo_root=root,
        generator_path=generator_path,
    )
    if rebuilt != payload:
        raise VoiceBankError("written voice bank differs from current verified inputs")
    if (path.parent / "report.md").read_bytes() != render_report(payload).encode("utf-8"):
        raise VoiceBankError("written voice-bank report differs")
    return payload


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--queue", type=Path, default=DEFAULT_QUEUE)
    parser.add_argument("--cast", type=Path, default=DEFAULT_CAST)
    parser.add_argument("--without-cast-comparison", action="store_true")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--write", action="store_true")
    parser.add_argument("--verify", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    cast_path = None if args.without_cast_comparison else args.cast
    try:
        if args.verify is not None:
            artifact = verify_written_voice_bank(
                args.verify,
                queue_path=args.queue,
                cast_path=cast_path,
            )
            print(
                json.dumps(
                    {
                        "valid": True,
                        "voiceBankSha256": artifact["voiceBankSha256"],
                        "summary": artifact["summary"],
                    },
                    sort_keys=True,
                )
            )
            return 0
        artifact = build_voice_bank(args.queue, cast_path)
        if args.write:
            destination, disposition = write_voice_bank(
                artifact, output_root=args.output_root
            )
            print(
                json.dumps(
                    {
                        "disposition": disposition,
                        "artifactDirectory": destination.relative_to(REPO_ROOT).as_posix(),
                        "voiceBankSha256": artifact["voiceBankSha256"],
                        "summary": artifact["summary"],
                    },
                    indent=2,
                    sort_keys=True,
                )
            )
        else:
            print(json.dumps(artifact, ensure_ascii=False, indent=2, sort_keys=True))
        return 0
    except (VoiceBankError, cluster_v2.CorpusClusterError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
