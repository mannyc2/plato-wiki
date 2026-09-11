#!/usr/bin/env python3
"""Preview or execute source PCM cuts against a verified original render assembly."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import cast

from master_audio import _renderer_binding, expected_boundaries
from render_dots import load_accepted_render_inputs, load_render_plan_artifact, resolve_full_dialogue_assembly, sha256_file
from source_audio_repairs import KIND as REPAIR_KIND, RepairManifest, execute_source_repair, preview_source_repair, validate_canonical_repairs
from source_audio_edits import Cut, EditPolicy, SourceEditManifest, execute_source_edit, manifest_sha256, preview_source_edit


def read_object(path: Path) -> dict[str, object]:
    value: object = json.loads(path.read_text())
    if not isinstance(value, dict) or any(not isinstance(key, str) for key in value):
        raise ValueError("input must be a JSON object")
    return cast(dict[str, object], value)


def output_directory(root: Path, *parts: str) -> Path:
    current = root
    for part in parts:
        current = current / part
        if current.is_symlink() or (current.exists() and not current.is_dir()):
            raise ValueError("output directories must be regular and not symlinked")
        current.mkdir(parents=current == root / parts[0], exist_ok=True)
    return current




def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--render-plan", type=Path, required=True)
    parser.add_argument("--expected-render-plan-sha256", required=True)
    parser.add_argument("--renderer-outdir", type=Path, required=True)
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--outdir", type=Path, required=True)
    parser.add_argument("--recipe", type=Path)
    parser.add_argument("--write-plan", action="store_true")
    parser.add_argument("--execute-plan", type=Path)
    parser.add_argument("--expected-edit-plan-sha256")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    if args.execute:
        if args.recipe or args.write_plan or not args.execute_plan or not args.expected_edit_plan_sha256:
            parser.error("execute requires only --execute-plan and its --expected-edit-plan-sha256")
    elif not args.recipe or args.execute_plan or args.expected_edit_plan_sha256:
        parser.error("preview requires --recipe; execution references are separate")
    plan = load_render_plan_artifact(args.render_plan, expected_sha256=args.expected_render_plan_sha256)
    acceptance = plan["acceptance"]
    _, _, current = load_accepted_render_inputs(Path(acceptance["screenplay_path"]),
        Path(acceptance["cast_path"]), repo_root=args.repo_root)
    if acceptance != current:
        raise ValueError("render plan differs from current canonical inputs")
    assembly = resolve_full_dialogue_assembly(plan, args.renderer_outdir)
    _, timeline = _renderer_binding(assembly)
    boundaries = expected_boundaries(assembly)
    complete = assembly["complete"]
    source = Path(complete["audio_path"]).resolve()
    if args.execute:
        document = cast(SourceEditManifest | RepairManifest, read_object(args.execute_plan))
        original = document["original"]
        if (original["path"] != str(source) or original["audio_sha256"] != complete["audio_sha256"]
                or original["frames"] != complete["frames"] or original["chapter_timeline"] != timeline
                or original["boundaries"] != boundaries
                or original["render_plan_artifact_sha256"] != sha256_file(args.render_plan)):
            raise ValueError("reviewed edit differs from current original renderer")
        if manifest_sha256(document) != args.expected_edit_plan_sha256:
            raise ValueError("reviewed edit manifest hash mismatch")
    else:
        recipe = read_object(args.recipe)
        if set(recipe) not in ({"cuts", "policy"}, {"cuts", "policy", "repairs"}) or not isinstance(recipe["cuts"], list) or not isinstance(recipe["policy"], dict):
            raise ValueError("recipe requires cuts and policy")
        cuts = [Cut(**row) for row in recipe["cuts"]]
        policy = EditPolicy(**recipe["policy"])
        base_document = preview_source_edit(source, original_sha256=complete["audio_sha256"],
            original_frames=complete["frames"], chapter_timeline=timeline, boundaries=boundaries,
            render_plan_artifact_sha256=sha256_file(args.render_plan), cuts=cuts, policy=policy)
        document = base_document
        if "repairs" in recipe:
            if not isinstance(recipe["repairs"], list):
                raise ValueError("repairs must be an array")
            repairs = cast(list[dict[str, object]], recipe["repairs"])
            validate_canonical_repairs(repairs, base_document, plan, assembly)
            document = preview_source_repair(base_document, repairs)
    if document.get("kind") == REPAIR_KIND:
        repair_document = cast(RepairManifest, document)
        validate_canonical_repairs(repair_document["repairs"], repair_document["base_edit"], plan, assembly)
    digest = manifest_sha256(document)
    outdir = args.outdir.expanduser()
    if outdir.is_symlink() or (outdir.exists() and not outdir.is_dir()):
        raise ValueError("output root must be a regular directory")
    outdir = outdir.resolve()
    for protected in (args.renderer_outdir / "cache", args.renderer_outdir / "units",
                      args.repo_root / "audio/qa", args.repo_root / "wiki/recordings"):
        protected = protected.resolve()
        if outdir == protected or protected in outdir.parents:
            raise ValueError("edited outputs must be separate from renderer artifacts")
    result: dict[str, object] = {"dialogue": plan["dialogue"], "edit_plan_sha256": digest,
        "derived": document["derived"], "accepted": False, "human_listening_performed": False}
    if args.write_plan:
        directory = output_directory(outdir, "plans")
        target = directory / f"{digest}.json"
        text = json.dumps(document, sort_keys=True, indent=2, ensure_ascii=False) + "\n"
        if target.exists():
            if target.is_symlink() or target.read_text() != text:
                raise ValueError("existing edit plan differs")
        else:
            with target.open("x") as handle:
                handle.write(text)
        result.update(plan_path=str(target), plan_file_sha256=sha256_file(target))
    if args.execute:
        directory = output_directory(outdir, "artifacts", digest)
        if document.get("kind") == REPAIR_KIND:
            output = execute_source_repair(cast(RepairManifest, document), expected_manifest_sha256=digest, output=directory / "audio.wav")
        else:
            output = execute_source_edit(cast(SourceEditManifest, document), expected_manifest_sha256=digest, output=directory / "audio.wav")
        result["audio_path"] = str(output)
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
