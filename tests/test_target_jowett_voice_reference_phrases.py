from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT / "scripts" / "audio"))
sys.path.insert(0, str(REPO_ROOT / "tests"))

from accept_dots_cast_voice import _jowett_purity  # noqa: E402
from align_jowett_voice_references import (  # noqa: E402
    canonical_json,
    sha256_bytes,
    sha256_file,
)
from target_jowett_voice_reference_phrases import (  # noqa: E402
    TargetedPhraseError,
    build_targeted_report,
    write_report,
)
from test_align_jowett_voice_references import (  # noqa: E402
    JowettFixture,
    VIDEO_ID,
)


TARGET_PHRASE = "consider justice before choosing flight because reason alone"


class TargetedJowettPhraseTest(unittest.TestCase):
    def _workspace(
        self,
    ) -> tuple[tempfile.TemporaryDirectory[str], JowettFixture, Path, Path]:
        temporary = tempfile.TemporaryDirectory(dir=REPO_ROOT / "scratch")
        fixture = JowettFixture(Path(temporary.name))
        source_report = fixture.scratch / "source.report.json"
        source_report.write_text(
            json.dumps(fixture.build(), indent=2) + "\n", encoding="utf-8"
        )
        source = json.loads(source_report.read_text(encoding="utf-8"))
        source_candidate = next(
            candidate
            for candidate in source["candidates"]
            if candidate["characterId"] == "socrates"
        )
        queue = fixture.scratch / "phrase-queue.json"
        queue.write_text(
            json.dumps(
                {
                    "schemaVersion": 1,
                    "phrases": [
                        {
                            "characterId": "socrates",
                            "dialogue": "crito",
                            "videoId": VIDEO_ID,
                            "phrase": TARGET_PHRASE,
                            "sourceProofPath": source_report.relative_to(
                                REPO_ROOT
                            ).as_posix(),
                            "sourceProofRecordId": source_candidate["candidateId"],
                        }
                    ],
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        return temporary, fixture, source_report, queue

    @staticmethod
    def _rehash_report(report: dict[str, object]) -> None:
        report.pop("reportSha256", None)
        report["reportSha256"] = sha256_bytes(canonical_json(report))

    def test_targeted_subphrase_is_promoter_compatible_and_binds_derivation(
        self,
    ) -> None:
        temporary, fixture, source_report, queue = self._workspace()
        with temporary:
            report = build_targeted_report(phrase_queue_path=queue)
            output = fixture.scratch / "targeted.report.json"
            write_report(output, report, artifact_root=fixture.scratch)
            candidate = report["candidates"][0]
            alignment = candidate["alignment"]
            purity, proof_sha = _jowett_purity(
                output,
                dialogue="crito",
                source_character_id="socrates",
                video_id=VIDEO_ID,
                start_seconds=alignment["startSeconds"],
                end_seconds=alignment["endSeconds"],
                prompt_text=alignment["expectedPrompt"],
                registry_sha256=report["inputs"]["referenceSources"]["sha256"],
            )
            expected_proof_sha = sha256_file(output)

        self.assertEqual(report["schemaVersion"], 1)
        self.assertEqual(
            report["artifactKind"],
            "jowett-caption-character-reference-alignment",
        )
        self.assertEqual(report["summary"]["candidateCount"], 1)
        self.assertEqual(
            candidate["sourceTurn"]["targetedPhraseWordCount"],
            len(TARGET_PHRASE.split()),
        )
        self.assertEqual(
            candidate["provenance"]["sourceProofPath"],
            source_report.relative_to(REPO_ROOT).as_posix(),
        )
        self.assertEqual(
            candidate["provenance"]["phraseQueueSha256"],
            report["inputs"]["phraseQueue"]["sha256"],
        )
        self.assertEqual(
            purity["proofRecordId"],
            candidate["candidateId"],
        )
        self.assertEqual(proof_sha, expected_proof_sha)

    def test_phrase_must_be_uniquely_contained_in_the_source_proof_turn(
        self,
    ) -> None:
        temporary, _, source_report, queue = self._workspace()
        with temporary:
            source = json.loads(source_report.read_text(encoding="utf-8"))
            candidate = next(
                row
                for row in source["candidates"]
                if row["characterId"] == "socrates"
            )
            candidate["alignment"]["expectedPrompt"] = (
                f"{TARGET_PHRASE} separator {TARGET_PHRASE}"
            )
            self._rehash_report(source)
            source_report.write_text(
                json.dumps(source, indent=2) + "\n", encoding="utf-8"
            )

            with self.assertRaisesRegex(
                TargetedPhraseError,
                "exactly once in its source proof turn",
            ):
                build_targeted_report(phrase_queue_path=queue)

    def test_targeted_caption_span_must_stay_inside_the_source_proof_interval(
        self,
    ) -> None:
        temporary, _, source_report, queue = self._workspace()
        with temporary:
            source = json.loads(source_report.read_text(encoding="utf-8"))
            candidate = next(
                row
                for row in source["candidates"]
                if row["characterId"] == "socrates"
            )
            candidate["alignment"]["captionTokenSpan"]["endExclusive"] -= 2
            self._rehash_report(source)
            source_report.write_text(
                json.dumps(source, indent=2) + "\n", encoding="utf-8"
            )

            with self.assertRaisesRegex(
                TargetedPhraseError,
                "escapes its source proof caption interval",
            ):
                build_targeted_report(phrase_queue_path=queue)

    def test_source_proof_must_still_match_its_live_inputs(self) -> None:
        temporary, fixture, _, queue = self._workspace()
        with temporary:
            fixture.characters.write_text(
                fixture.characters.read_text(encoding="utf-8") + "\n",
                encoding="utf-8",
            )
            with self.assertRaisesRegex(
                TargetedPhraseError,
                "source proof is stale against its characters input",
            ):
                build_targeted_report(phrase_queue_path=queue)

    def test_queue_rejects_unknown_fields(self) -> None:
        temporary, _, _, queue = self._workspace()
        with temporary:
            payload = json.loads(queue.read_text(encoding="utf-8"))
            payload["phrases"][0]["speakerAssertion"] = "trust me"
            queue.write_text(json.dumps(payload), encoding="utf-8")
            with self.assertRaisesRegex(
                TargetedPhraseError,
                "phrase queue entry 0 is malformed",
            ):
                build_targeted_report(phrase_queue_path=queue)


if __name__ == "__main__":
    unittest.main()
