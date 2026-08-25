#!/usr/bin/env python3
"""Verify every public Plato source against its exact pinned upstream bytes."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
from urllib.request import urlopen


PERSEUS_COMMIT = "e37eed2e8a5fed710c3ab0d312249c3fb04d77e0"
JTAUBER_COMMIT = "3b482c7af8a43444a6e0316f8cb7044a18dbd094"
LEGACY_GREEK = (
    "apology",
    "crito",
    "euthyphro",
    "ion",
    "meno",
    "phaedo",
    "republic",
    "symposium",
)


def digest(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()


def binding(root: Path, relative: str) -> dict[str, str]:
    return {"path": relative, "sha256": digest((root / relative).read_bytes())}


def load_importer(root: Path):
    path = root / "scripts/import-plato-greek.py"
    spec = importlib.util.spec_from_file_location("plato_importer", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load importer: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def assert_local(root: Path, relative: str, generated: bytes) -> dict[str, str]:
    current = (root / relative).read_bytes()
    if current != generated:
        raise RuntimeError(
            f"{relative} does not reproduce from its pinned upstream "
            f"(local {digest(current)}, reproduced {digest(generated)})"
        )
    return {"path": relative, "sha256": digest(current)}


def legacy_records(root: Path) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for slug in LEGACY_GREEK:
        upstream_path = f"raw-text/{slug}.txt"
        url = (
            "https://raw.githubusercontent.com/jtauber/plato-texts/"
            f"{JTAUBER_COMMIT}/{upstream_path}"
        )
        with urlopen(url, timeout=30) as response:
            upstream = response.read()
        records.append(
            {
                **assert_local(root, f"raw/plato/greek/{slug}.txt", upstream),
                "language": "greek",
                "dialogue": slug,
                "upstream_repository": "jtauber/plato-texts",
                "upstream_commit": JTAUBER_COMMIT,
                "upstream_path": upstream_path,
                "upstream_sha256": digest(upstream),
                "edition": "learner-text",
                "acquisition": "byte-identical-copy",
                "modifications": [],
            }
        )
    return records


def perseus_records(root: Path, importer) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    for slug, work in importer.REQUESTED_WORKS.items():
        upstream = importer.fetch_work(work)
        generated = importer.convert_xml(upstream).encode()
        records.append(
            {
                **assert_local(root, f"raw/plato/greek/{slug}.txt", generated),
                "language": "greek",
                "dialogue": slug,
                "upstream_repository": "PerseusDL/canonical-greekLit",
                "upstream_commit": PERSEUS_COMMIT,
                "upstream_path": f"data/tlg0059/{work}/tlg0059.{work}.perseus-grc2.xml",
                "upstream_sha256": digest(upstream),
                "edition": "perseus-grc2",
                "acquisition": "tei-import",
                "modifications": [],
            }
        )
    for slug, (author, work) in importer.ENGLISH_WORKS.items():
        upstream = importer.fetch_edition(author, work, "perseus-eng2")
        generated = importer.apply_english_repairs(
            slug, importer.convert_xml(upstream)
        ).encode()
        modifications = []
        if slug == "greater-hippias":
            modifications.append(
                "Changed the first duplicated Stephanus marker 302e to 302d "
                "using the importer's exact one-occurrence assertion; prose unchanged."
            )
        records.append(
            {
                **assert_local(root, f"raw/plato/english/{slug}.txt", generated),
                "language": "english",
                "dialogue": slug,
                "upstream_repository": "PerseusDL/canonical-greekLit",
                "upstream_commit": PERSEUS_COMMIT,
                "upstream_path": f"data/{author}/{work}/{author}.{work}.perseus-eng2.xml",
                "upstream_sha256": digest(upstream),
                "edition": "perseus-eng2",
                "acquisition": "tei-import",
                "modifications": modifications,
            }
        )
    return records


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, help="Private JSON receipt path")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    importer = load_importer(root)
    records = sorted(
        legacy_records(root) + perseus_records(root, importer),
        key=lambda record: record["path"],
    )
    if len(records) != 54:
        raise RuntimeError(f"expected 54 public sources, verified {len(records)}")
    receipt = {
        "schema_version": 1,
        "artifact_kind": "plato-source-acquisition-receipts",
        "release_version": "2.0.0",
        "verifier": binding(root, "scripts/release/verify-source-acquisition.py"),
        "importer": binding(root, "scripts/import-plato-greek.py"),
        "sources_record": binding(root, "raw/plato/SOURCES.md"),
        "sources": records,
    }
    output = root / args.out
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(f"{output.name}.tmp-{os.getpid()}")
    temporary.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    print("source acquisition: 54/54 reproduced from exact pinned upstream bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
