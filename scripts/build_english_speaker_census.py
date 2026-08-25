#!/usr/bin/env python3
"""Build a raw speaker-attribution census from the pinned English Plato TEI.

This deliberately does not produce an editorial cast. It records the source's
participant labels and ``<said who>`` strings verbatim enough for later human
reconciliation, and surfaces structural or exact-label mismatches instead of
guessing canonical identities.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from collections import Counter
from pathlib import Path
from types import ModuleType
from typing import Callable
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[1]
IMPORTER_PATH = Path(__file__).with_name("import-plato-greek.py")
DEFAULT_OUTPUT = REPO_ROOT / "audio" / "english-tei-speaker-census.json"
TEI_NAMESPACE = "http://www.tei-c.org/ns/1.0"
TEI_NS = f"{{{TEI_NAMESPACE}}}"
XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace"
EXPECTED_DIALOGUE_COUNT = 27
EDITION_ID = "perseus-eng2"
SOURCE_REPOSITORY = "https://github.com/PerseusDL/canonical-greekLit"


def load_pinned_importer() -> ModuleType:
    """Load the importer so this script cannot drift from its pinned sources."""

    spec = importlib.util.spec_from_file_location("plato_source_importer", IMPORTER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"could not load source importer: {IMPORTER_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def local_name(name: str) -> str:
    if name.startswith("{"):
        return name.split("}", 1)[1]
    return name


def attribute_name(name: str) -> str:
    if name.startswith(f"{{{XML_NAMESPACE}}}"):
        return f"xml:{local_name(name)}"
    if name.startswith(f"{{{TEI_NAMESPACE}}}"):
        return f"tei:{local_name(name)}"
    return name


def raw_element_text(element: ET.Element) -> str:
    """Keep source spelling and internal whitespace; drop XML indentation only."""

    return "".join(element.itertext()).strip()


def raw_attributes(element: ET.Element) -> dict[str, str]:
    return {
        attribute_name(name): value
        for name, value in sorted(element.attrib.items(), key=lambda item: attribute_name(item[0]))
    }


def participant_records(root: ET.Element) -> list[dict[str, object]]:
    participants: list[dict[str, object]] = []
    ordinal = 0
    for description in root.findall(f".//{TEI_NS}particDesc"):
        for element in description.iter():
            element_name = local_name(element.tag)
            if element_name not in {"person", "personGrp"}:
                continue
            ordinal += 1
            labels = []
            for descendant in element.iter():
                label_element = local_name(descendant.tag)
                if label_element not in {"persName", "name"}:
                    continue
                labels.append(
                    {
                        "element": label_element,
                        "raw_label": raw_element_text(descendant),
                        "attributes": raw_attributes(descendant),
                    }
                )
            participants.append(
                {
                    "ordinal": ordinal,
                    "element": element_name,
                    "attributes": raw_attributes(element),
                    "labels": labels,
                    "raw_text": raw_element_text(element),
                }
            )
    return participants


# A conservative XML-fragment-pointer check. It admits Unicode letters and the
# usual NCName continuation characters, but rejects whitespace and apostrophes.
FRAGMENT_POINTER = re.compile(r"#[^\W\d][\w.\-·]*", re.UNICODE)


def is_fragment_pointer(token: str) -> bool:
    return FRAGMENT_POINTER.fullmatch(token) is not None


def attribution_record(raw_who: str | None, occurrences: int) -> dict[str, object]:
    if raw_who is None:
        tokens: list[str] = []
        classification = "missing"
    else:
        tokens = raw_who.split()
        malformed = [token for token in tokens if not is_fragment_pointer(token)]
        if not tokens:
            classification = "empty"
        elif malformed:
            classification = "malformed"
        elif len(tokens) > 1:
            classification = "multiple-pointers"
        else:
            classification = "single-pointer"

    return {
        "raw_who": raw_who,
        "occurrences": occurrences,
        "classification": classification,
        "tokens": tokens,
        "malformed_tokens": [token for token in tokens if not is_fragment_pointer(token)],
    }


def attribution_sort_key(value: str | None) -> tuple[int, str]:
    return (0, "") if value is None else (1, value)


def exact_participant_labels(participants: list[dict[str, object]]) -> set[str]:
    labels: set[str] = set()
    for participant in participants:
        for label in participant["labels"]:  # type: ignore[index]
            raw_label = label["raw_label"]  # type: ignore[index]
            if raw_label:
                labels.add(raw_label)
    return labels


def source_fragments(raw_who: str | None) -> list[str]:
    """Return only source fragments, without normalizing or inventing aliases."""

    if raw_who is None or not raw_who:
        return []
    if raw_who.startswith("#") and "#" not in raw_who[1:]:
        # This whole-string candidate preserves malformed source labels such as
        # ``#Meno's Boy`` for exact comparison with a participant label.
        whole = raw_who[1:]
        if whole:
            return [whole]
    return [token[1:] for token in raw_who.split() if is_fragment_pointer(token)]


def anomaly_records(
    participants: list[dict[str, object]],
    attributions: list[dict[str, object]],
) -> list[dict[str, object]]:
    anomalies: list[dict[str, object]] = []
    labels = exact_participant_labels(participants)
    attributed_fragments: set[str] = set()

    for attribution in attributions:
        raw_who = attribution["raw_who"]
        occurrences = attribution["occurrences"]
        tokens = attribution["tokens"]
        malformed_tokens = attribution["malformed_tokens"]

        if raw_who is None:
            anomalies.append(
                {"code": "said-missing-who", "raw_who": None, "occurrences": occurrences}
            )
        elif not tokens:
            anomalies.append(
                {"code": "said-empty-who", "raw_who": raw_who, "occurrences": occurrences}
            )
        if len(tokens) > 1:
            anomalies.append(
                {
                    "code": "said-multiple-who-tokens",
                    "raw_who": raw_who,
                    "tokens": tokens,
                    "occurrences": occurrences,
                }
            )
        if malformed_tokens:
            anomalies.append(
                {
                    "code": "said-malformed-who-tokens",
                    "raw_who": raw_who,
                    "malformed_tokens": malformed_tokens,
                    "occurrences": occurrences,
                }
            )

        fragments = source_fragments(raw_who)  # type: ignore[arg-type]
        attributed_fragments.update(fragments)
        for fragment in fragments:
            if fragment not in labels:
                anomalies.append(
                    {
                        "code": "said-fragment-no-exact-participant-label",
                        "raw_who": raw_who,
                        "raw_fragment": fragment,
                        "occurrences": occurrences,
                    }
                )

    seen_labels: Counter[str] = Counter()
    for participant in participants:
        participant_labels = participant["labels"]  # type: ignore[index]
        if not participant_labels:
            anomalies.append(
                {
                    "code": "participant-missing-label",
                    "participant_ordinal": participant["ordinal"],
                }
            )
            continue
        for label in participant_labels:
            raw_label = label["raw_label"]  # type: ignore[index]
            if raw_label:
                seen_labels[raw_label] += 1
                if raw_label not in attributed_fragments:
                    anomalies.append(
                        {
                            "code": "participant-label-not-exactly-attributed",
                            "participant_ordinal": participant["ordinal"],
                            "raw_label": raw_label,
                        }
                    )
    for raw_label, occurrences in seen_labels.items():
        if occurrences > 1:
            anomalies.append(
                {
                    "code": "duplicate-participant-label",
                    "raw_label": raw_label,
                    "occurrences": occurrences,
                }
            )

    return sorted(
        anomalies,
        key=lambda anomaly: (
            str(anomaly["code"]),
            json.dumps(anomaly, ensure_ascii=False, sort_keys=True),
        ),
    )


def census_dialogue(slug: str, author_id: str, work_id: str, xml: bytes, source_url: str) -> dict[str, object]:
    root = ET.fromstring(xml)
    participants = participant_records(root)
    edition = root.find(f".//{TEI_NS}body/{TEI_NS}div[@type='translation']")
    if edition is None:
        edition = root.find(f".//{TEI_NS}body/{TEI_NS}div[@type='edition']")
    if edition is None:
        raise ValueError(f"{slug}: TEI translation or edition div not found")

    who_counts: Counter[str | None] = Counter(
        element.attrib.get("who")
        for element in edition.iter()
        if local_name(element.tag) == "said"
    )
    attributions = [
        attribution_record(raw_who, who_counts[raw_who])
        for raw_who in sorted(who_counts, key=attribution_sort_key)
    ]
    anomalies = anomaly_records(participants, attributions)
    return {
        "dialogue": slug,
        "source": {
            "author_id": author_id,
            "work_id": work_id,
            "edition_id": EDITION_ID,
            "url": source_url,
            "tei_sha256": hashlib.sha256(xml).hexdigest(),
        },
        "counts": {
            "participants": len(participants),
            "said_elements": sum(who_counts.values()),
            "unique_raw_who_values": len(who_counts),
            "anomaly_records": len(anomalies),
        },
        "participants": participants,
        "said_attributions": attributions,
        "anomalies": anomalies,
    }


def build_corpus_census(
    importer: ModuleType,
    fetcher: Callable[[str, str, str], bytes] | None = None,
) -> dict[str, object]:
    works = sorted(importer.ENGLISH_WORKS.items())
    if len(works) != EXPECTED_DIALOGUE_COUNT:
        raise ValueError(
            f"expected {EXPECTED_DIALOGUE_COUNT} pinned English works, found {len(works)}"
        )
    fetch = fetcher or importer.fetch_edition
    dialogues = []
    for slug, (author_id, work_id) in works:
        source_url = (
            f"{importer.UPSTREAM_BASE_URL}/{author_id}/{work_id}/"
            f"{author_id}.{work_id}.{EDITION_ID}.xml"
        )
        dialogues.append(
            census_dialogue(
                slug,
                author_id,
                work_id,
                fetch(author_id, work_id, EDITION_ID),
                source_url,
            )
        )

    return {
        "schema_version": 1,
        "artifact_kind": "english-tei-raw-speaker-census",
        "editorial_status": "raw-source-attribution-only",
        "scope_note": (
            "This deterministic census preserves TEI labels and attribution strings. "
            "It is evidence for, not a substitute for, the required editorial character census."
        ),
        "source": {
            "repository": SOURCE_REPOSITORY,
            "commit": importer.UPSTREAM_COMMIT,
            "edition_id": EDITION_ID,
        },
        "summary": {
            "dialogues": len(dialogues),
            "participants": sum(dialogue["counts"]["participants"] for dialogue in dialogues),
            "said_elements": sum(dialogue["counts"]["said_elements"] for dialogue in dialogues),
            "dialogue_unique_raw_who_values": sum(
                dialogue["counts"]["unique_raw_who_values"] for dialogue in dialogues
            ),
            "anomaly_records": sum(
                dialogue["counts"]["anomaly_records"] for dialogue in dialogues
            ),
            "dialogues_with_anomalies": sum(bool(dialogue["anomalies"]) for dialogue in dialogues),
        },
        "dialogues": dialogues,
    }


def render_census(census: dict[str, object]) -> str:
    return json.dumps(census, ensure_ascii=False, indent=2) + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Generated JSON path (default: {DEFAULT_OUTPUT.relative_to(REPO_ROOT)})",
    )
    action = parser.add_mutually_exclusive_group()
    action.add_argument("--stdout", action="store_true", help="Write the census to stdout")
    action.add_argument(
        "--check",
        action="store_true",
        help="Fail if the output is missing or differs from a fresh pinned-source build",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rendered = render_census(build_corpus_census(load_pinned_importer()))
    output_path = args.output.resolve()
    if args.stdout:
        sys.stdout.write(rendered)
        return 0
    if args.check:
        if not output_path.exists():
            print(f"missing generated census: {output_path}", file=sys.stderr)
            return 1
        if output_path.read_text(encoding="utf-8") != rendered:
            print(f"stale generated census: {output_path}", file=sys.stderr)
            return 1
        print(f"speaker census is current: {output_path.relative_to(REPO_ROOT)}")
        return 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(rendered, encoding="utf-8")
    print(f"wrote {output_path.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
