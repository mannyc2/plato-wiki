#!/usr/bin/env python3
"""Import selected Plato Greek texts from Perseus canonical-greekLit.

The repo keeps extraction sources as plain Greek text with lightweight markers:
Stephanus sections as ``{70a}``, book boundaries as ``{b1}``, and a small set
of TEI inline markers such as ``{q}`` and ``{del}``.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.request import urlopen
from xml.etree import ElementTree as ET


UPSTREAM_COMMIT = "e37eed2e8a5fed710c3ab0d312249c3fb04d77e0"
UPSTREAM_BASE_URL = (
    "https://raw.githubusercontent.com/PerseusDL/canonical-greekLit/"
    f"{UPSTREAM_COMMIT}/data"
)

REQUESTED_WORKS = {
    "cratylus": "tlg005",
    "theaetetus": "tlg006",
    "sophist": "tlg007",
    "statesman": "tlg008",
    "parmenides": "tlg009",
    "philebus": "tlg010",
    "phaedrus": "tlg012",
    "charmides": "tlg018",
    "laches": "tlg019",
    "lysis": "tlg020",
    "euthydemus": "tlg021",
    "protagoras": "tlg022",
    "gorgias": "tlg023",
    "greater-hippias": "tlg025",
    "lesser-hippias": "tlg026",
    "menexenus": "tlg028",
    "timaeus": "tlg031",
    "critias": "tlg032",
    "laws": "tlg034",
}

# English (perseus-eng2) spine sources for the commentary reading view.
# Rendering/commentary inputs only; never extraction inputs (see AGENTS.md).
ENGLISH_WORKS = {
    "apology": ("tlg0059", "tlg002"),
    "charmides": ("tlg0059", "tlg018"),
    "cratylus": ("tlg0059", "tlg005"),
    "critias": ("tlg0059", "tlg032"),
    "crito": ("tlg0059", "tlg003"),
    "euthydemus": ("tlg0059", "tlg021"),
    "euthyphro": ("tlg0059", "tlg001"),
    "gorgias": ("tlg0059", "tlg023"),
    "greater-hippias": ("tlg0059", "tlg025"),
    "ion": ("tlg0059", "tlg027"),
    "laches": ("tlg0059", "tlg019"),
    "laws": ("tlg0059", "tlg034"),
    "lesser-hippias": ("tlg0059", "tlg026"),
    "lysis": ("tlg0059", "tlg020"),
    "menexenus": ("tlg0059", "tlg028"),
    "meno": ("tlg0059", "tlg024"),
    "parmenides": ("tlg0059", "tlg009"),
    "phaedo": ("tlg0059", "tlg004"),
    "phaedrus": ("tlg0059", "tlg012"),
    "philebus": ("tlg0059", "tlg010"),
    "protagoras": ("tlg0059", "tlg022"),
    "republic": ("tlg0059", "tlg030"),
    "sophist": ("tlg0059", "tlg007"),
    "statesman": ("tlg0059", "tlg008"),
    "symposium": ("tlg0059", "tlg011"),
    "theaetetus": ("tlg0059", "tlg006"),
    "timaeus": ("tlg0059", "tlg031"),
}

# Enumerated upstream transcription repairs required for an order-preserving
# English Stephanus spine. Each old fragment must occur exactly once so an
# upstream change fails loudly instead of silently applying the wrong edit.
ENGLISH_REPAIRS = {
    "greater-hippias": [
        (
            "{302e} does not that which makes them beautiful belong to both and to each?",
            "{302d} does not that which makes them beautiful belong to both and to each?",
        ),
    ],
}

TEI_NS = "{http://www.tei-c.org/ns/1.0}"
MARKER_TAGS = {
    "add": "add",
    "corr": "corr",
    "del": "del",
    "name": "name",
    "persName": "pers",
    "placeName": "place",
    "q": "q",
    "quote": "quote",
    "rs": "rs",
    "sic": "sic",
}
SKIP_TAGS = {"bibl", "note"}


def local_name(tag: str) -> str:
    return tag.split("}", 1)[-1] if tag.startswith("{") else tag


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace("\u02bc", "\u2019"))


def append_text(pieces: list[str], text: str | None) -> None:
    if text:
        normalized = normalize_text(text)
        if normalized:
            pieces.append(normalized)


def append_marker(pieces: list[str], marker: str) -> None:
    pieces.append(f" {{{marker}}} ")


def apply_english_repairs(slug: str, content: str) -> str:
    for old, new in ENGLISH_REPAIRS.get(slug, []):
        occurrences = content.count(old)
        if occurrences != 1:
            raise ValueError(
                f"{slug}: expected one occurrence of English repair fragment, "
                f"found {occurrences}: {old!r}"
            )
        content = content.replace(old, new, 1)
    return content


def emit_milestone(pieces: list[str], element: ET.Element) -> None:
    unit = element.attrib.get("unit")
    marker = element.attrib.get("n")

    if unit == "section" and marker and re.fullmatch(r"\d+[a-e]", marker):
        append_marker(pieces, marker)
    elif unit == "para" and element.attrib.get("ed") == "P":
        append_marker(pieces, "p")
    elif unit == "speech" and marker:
        append_marker(pieces, f"sp{marker}")


def emit_element(pieces: list[str], element: ET.Element) -> None:
    name = local_name(element.tag)
    if name in SKIP_TAGS:
        return

    close_marker = MARKER_TAGS.get(name)
    if name == "div" and element.attrib.get("subtype") == "book":
        book = element.attrib.get("n")
        if book:
            pieces.append(f"\n{{b{book}}}\n")

    if name == "milestone":
        emit_milestone(pieces, element)
    elif close_marker:
        append_marker(pieces, close_marker)
        append_text(pieces, element.text)
    else:
        append_text(pieces, element.text)

    for child in element:
        emit_element(pieces, child)
        append_text(pieces, child.tail)

    if close_marker:
        append_marker(pieces, f"/{close_marker}")

    if name == "p":
        pieces.append("\n")


def find_edition(root: ET.Element) -> ET.Element:
    body = root.find(f".//{TEI_NS}body")
    if body is None:
        raise ValueError("TEI body not found")

    edition = body.find(f"{TEI_NS}div[@type='edition']")
    if edition is None:
        edition = body.find(f"{TEI_NS}div[@type='translation']")
    if edition is None:
        raise ValueError("TEI edition div not found")

    return edition


def format_output(raw: str) -> str:
    raw = raw.replace("\r\n", "\n")
    raw = re.sub(r"[ \t]+\n", "\n", raw)
    raw = re.sub(r"\n{3,}", "\n\n", raw)
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in raw.splitlines()]
    return "\n".join(line for line in lines if line) + "\n"


def convert_xml(xml: bytes) -> str:
    root = ET.fromstring(xml)
    pieces: list[str] = []
    emit_element(pieces, find_edition(root))
    return format_output("".join(pieces))


def fetch_edition(author: str, work_id: str, edition: str) -> bytes:
    url = f"{UPSTREAM_BASE_URL}/{author}/{work_id}/{author}.{work_id}.{edition}.xml"
    with urlopen(url, timeout=30) as response:
        return response.read()


def fetch_work(work_id: str) -> bytes:
    return fetch_edition("tlg0059", work_id, "perseus-grc2")


def marker_count(content: str) -> int:
    return len(re.findall(r"\{\d+[a-e]\}", content))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "slugs",
        nargs="*",
        help="Dialogue slugs to import. Defaults to every requested missing work.",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Write one converted work to stdout instead of raw/plato/greek.",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List supported slugs and source ids.",
    )
    parser.add_argument(
        "--english",
        action="store_true",
        help="Import perseus-eng2 English texts into raw/plato/english instead.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.list:
        for slug, work_id in REQUESTED_WORKS.items():
            print(f"{slug}\t{work_id}")
        for slug, (author, work_id) in ENGLISH_WORKS.items():
            print(f"{slug}\t{author}.{work_id}.perseus-eng2 (--english)")
        return 0

    works = ENGLISH_WORKS if args.english else REQUESTED_WORKS
    slugs = args.slugs or list(works)
    unknown = [slug for slug in slugs if slug not in works]
    if unknown:
        print(f"Unknown slug(s): {', '.join(unknown)}", file=sys.stderr)
        return 2
    if args.stdout and len(slugs) != 1:
        print("--stdout requires exactly one slug", file=sys.stderr)
        return 2

    repo_root = Path(__file__).resolve().parents[1]
    subdir = "english" if args.english else "greek"
    output_dir = repo_root / "raw" / "plato" / subdir
    output_dir.mkdir(parents=True, exist_ok=True)

    for slug in slugs:
        if args.english:
            author, work_id = ENGLISH_WORKS[slug]
            content = apply_english_repairs(
                slug,
                convert_xml(fetch_edition(author, work_id, "perseus-eng2")),
            )
        else:
            content = convert_xml(fetch_work(REQUESTED_WORKS[slug]))
        if args.stdout:
            sys.stdout.write(content)
            continue

        output_path = output_dir / f"{slug}.txt"
        output_path.write_text(content, encoding="utf-8")
        print(f"{slug}: {marker_count(content)} Stephanus markers -> {output_path.relative_to(repo_root)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
