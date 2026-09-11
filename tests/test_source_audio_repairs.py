"""Replacement splices preserve unchanged PCM and fail closed on stale evidence."""
from pathlib import Path
import copy
import sys
import tempfile
import unittest
from unittest.mock import patch
from typing import BinaryIO

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts" / "audio"))
from pcm_edits import PcmEditError, _geometry, _header, file_sha256
from source_audio_edits import Cut, EditPolicy, manifest_sha256, preview_source_edit
from source_audio_repairs import execute_source_repair, preview_source_repair, validate_source_repair_manifest

class SourceAudioRepairTests(unittest.TestCase):
    def setUp(self) -> None:
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.source = self.root / "original.wav"
        self.pcm = b"".join((i % 5 + 1).to_bytes(3, "little", signed=True) for i in range(10000))
        self.source.write_bytes(_header(10000) + self.pcm)
        self.replacement = self.root / "replacement.wav"
        self.spoken = (30000).to_bytes(3, "little", signed=True) * 900
        self.replacement.write_bytes(_header(900) + self.spoken)
        self.evidence = self.root / "evidence.json"
        self.evidence.write_text('{"accepted":false,"reason":"synthetic splice fixture"}\n')
        self.output = self.root / "repaired.wav"
        self.base = preview_source_edit(self.source, original_sha256=file_sha256(self.source), original_frames=10000,
            chapter_timeline=[{"chapter_id":"a", "start_frame":0, "end_frame":4800}, {"chapter_id":"b", "start_frame":5000,"end_frame":10000}],
            boundaries=[{"start_frame":4800,"end_frame":5000,"crossfade_ms":0,"pause_ms":200/48}],
            render_plan_artifact_sha256="a"*64, cuts=[Cut(2000,2200,"Exact quiet fixture")],
            policy=EditPolicy(5,960,"Quiet PCM fixture"))
        self.row: dict[str, object] = {"start_frame":1000,"end_frame":1400,"audio_path":str(self.replacement),
            "audio_sha256":file_sha256(self.replacement),"frames":900,"entry_id":"source-turn-1","canonical_text":"Yes.",
            "reason":"Synthetic non-silent replacement for splice testing", "evidence":[{"path":str(self.evidence),
                "sha256":file_sha256(self.evidence),"role":role} for role in ("synthesis","transcription","source-task")]}

    def test_replacement_and_cut_projection_preserve_exact_retained_pcm(self) -> None:
        document = preview_source_repair(self.base,[self.row])
        self.assertEqual(document['derived']['frames'],10300)
        self.assertEqual(document['derived']['removed_frames'],-300)
        self.assertEqual(document['derived']['boundaries'],[{"start_frame":5100,"end_frame":5300,"crossfade_ms":0,"pause_ms":200/48}])
        self.assertFalse(document['human_listening_performed'])
        self.assertFalse(self.output.exists())
        execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output)
        _,offset = _geometry(self.output)
        expected = self.pcm[:3000]+self.spoken+self.pcm[4200:6000]+self.pcm[6600:]
        self.assertEqual(self.output.read_bytes()[offset:],expected)
        self.assertEqual(self.source.read_bytes()[80:],self.pcm)
        self.assertEqual(execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output),self.output)

    def test_protected_pause_and_overlapping_replacements_rejected(self) -> None:
        for start,end in [(4500,4700),(4799,4900),(0,2),(9800,9900)]:
            with self.subTest(start=start),self.assertRaises(PcmEditError):
                preview_source_repair(self.base,[{**self.row,'start_frame':start,'end_frame':end}])
        with self.assertRaises(PcmEditError):
            preview_source_repair(self.base,[self.row,self.row])

    def test_stale_replacement_and_evidence_refuse_execution_and_resume(self) -> None:
        for target in (self.replacement,self.evidence,self.source):
            with self.subTest(path=target):
                before=target.read_bytes()
                document=preview_source_repair(self.base,[self.row])
                execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output)
                target.write_bytes(before+b'changed')
                with self.assertRaisesRegex(PcmEditError,'evidence changed'):
                    execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output)
                target.write_bytes(before)
                self.output.unlink()

    def test_review_hash_and_geometry_tampering_rejected(self) -> None:
        original=preview_source_repair(self.base,[self.row]);reviewed=manifest_sha256(original)
        for field,value in [('frames',10301),('removed_frames',0),('boundaries',[])]:
            document=copy.deepcopy(original);document['derived'][field]=value
            with self.subTest(field=field),self.assertRaises(PcmEditError):validate_source_repair_manifest(document)
        document=copy.deepcopy(original);document['repairs'][0]['reason']='different review'
        with self.assertRaisesRegex(PcmEditError,'reviewed repair manifest'):
            execute_source_repair(document,expected_manifest_sha256=reviewed,output=self.output)
        document=copy.deepcopy(original);document['repairs'][0]['source_pcm_sha256']='0'*64
        with self.assertRaisesRegex(PcmEditError,'source interval'):
            execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output)
        self.assertFalse(self.output.exists())

    def test_canonical_entry_text_and_frame_interior_must_match(self) -> None:
        from edit_source_audio import validate_canonical_repairs
        task={"input_sha256":"a"*64,"input":{"utterance":{"text":"Yes.","spans":[{"entry_id":"source-turn-1","part_count":1}]}}}
        plan={"tasks":[task]}
        assembly={"complete":{"chapter_starts":[{"start_frame":0}]},"chapters":[{"timing":[{
            "input_sha256":"a"*64,"entry_ids":["source-turn-1"],"start_frame":999,"end_frame":1401}]}]}
        validate_canonical_repairs([self.row],self.base,plan,assembly)
        for changes in ({"start_frame":1001},{"canonical_text":"No."},{"entry_id":"different-entry"}):
            with self.subTest(changes=changes),self.assertRaises(ValueError):
                validate_canonical_repairs([{**self.row,**changes}],self.base,plan,assembly)
        with self.assertRaises(ValueError):
            validate_canonical_repairs([self.row],self.base,{"tasks":[task,task]},assembly)

    def test_downstream_inventory_requires_every_replacement_receipt(self) -> None:
        from source_audio_repairs import source_repair_files
        from qa_full_master_asr import FullMasterAsrError, _validate_source_file_inventory
        document=preview_source_repair(self.base,[self.row])
        source={"audio_path":str(self.output),"audio_sha256":document["derived"]["audio_sha256"],
            "frames":document["derived"]["frames"],"renderer_chapter_timeline":[],"renderer_boundaries":[],
            "edit_manifest":{"path":str(self.root/"repair.json"),"sha256":"f"*64,"document":document}}
        files=[{"label":"mastering-source-audio","path":str(self.output),"sha256":source["audio_sha256"]},
               {"label":"source-edit-manifest","path":str(self.root/"repair.json"),"sha256":"f"*64}]
        files.extend({"label":label,"path":str(path),"sha256":digest} for label,path,digest in source_repair_files(document))
        _validate_source_file_inventory(source,files)
        for index in range(2,len(files)):
            with self.subTest(index=index),self.assertRaises(FullMasterAsrError):
                _validate_source_file_inventory(source,files[:index]+files[index+1:])

    def test_receipt_mutation_during_copy_prevents_publication(self) -> None:
        import source_audio_repairs
        document=preview_source_repair(self.base,[self.row]);copy_frames=source_audio_repairs._copy_frames
        mutated=False
        def mutate(source: BinaryIO, output: BinaryIO, offset: int, start: int, end: int) -> None:
            nonlocal mutated
            copy_frames(source, output, offset, start, end)
            if not mutated:
                self.evidence.write_text("changed during splicing")
                mutated=True
        with patch.object(source_audio_repairs,"_copy_frames",side_effect=mutate),self.assertRaisesRegex(PcmEditError,"evidence changed"):
            execute_source_repair(document,expected_manifest_sha256=manifest_sha256(document),output=self.output)
        self.assertFalse(self.output.exists())

    def test_missing_evidence_and_fabricated_listening_rejected(self) -> None:
        with self.assertRaisesRegex(PcmEditError,'requires synthesis'):
            preview_source_repair(self.base,[{**self.row,'evidence':[]}])
        document=preview_source_repair(self.base,[self.row]);document['human_listening_performed']=True
        with self.assertRaisesRegex(PcmEditError,'listening claim'):validate_source_repair_manifest(document)

if __name__=='__main__':unittest.main()
