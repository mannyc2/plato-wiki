import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AgentTool } from "@earendil-works/pi-agent-core";
import { Type } from "typebox";
import { getRepoRoot, normalizeRepoPath } from "../paths.js";
import { relationCandidateKey, type RelationCandidateTarget } from "../relations.js";
import { resolveSourceSpan } from "../source.js";
import type { TranscriptWriter } from "../transcript.js";
import type { HarnessRunCommand } from "../types.js";
import { withRepoWriteLock } from "../file-lock.js";
import { assertClaimWritePath, assertObservationWritePath, assertReadableWikiPath, assertRelationWritePath } from "./guards.js";
import {
  claimMarkdownBlocks,
  claimYamlBlocks,
  replaceClaimYamlBlocks,
} from "./claim-ledger.js";
import { formatClaimLedgerValidationError, validateClaimLedger } from "./claim-validator.js";
import {
  fieldValue,
  nestedFieldValue,
  observationMarkdownBlocks,
  observationYamlBlocks,
  replaceObservationYamlBlocks,
} from "./observation-ledger.js";
import { formatObservationLedgerValidationError, validateObservationLedger } from "./observation-validator.js";
import {
  relationMarkdownBlocks,
  relationYamlBlocks,
  replaceRelationYamlBlocks,
} from "./relation-ledger.js";
import { formatRelationLedgerValidationError, validateRelationLedger } from "./relation-validator.js";

function isReviewCommand(command: HarnessRunCommand) {
  return command === "review" || command === "review-segmented";
}

function isClaimCommand(command: HarnessRunCommand) {
  return command === "claims-segmented" || command === "claims-review-segmented";
}

function isRelationCommand(command: HarnessRunCommand) {
  return command === "relations-segmented" || command === "relations-review-segmented";
}

const SEGMENTED_SOURCE_SPAN_CALL_LIMIT = 6;
const CLAIM_SOURCE_SPAN_CALL_LIMIT = 80;
const RELATION_SOURCE_SPAN_CALL_LIMIT = 80;

function wikiResult(text: string, path: string, bytes: number) {
  return {
    content: [{ type: "text" as const, text }],
    details: { path, bytes },
  };
}

function observationIdsFromContent(content: string) {
  return observationYamlBlocks(content)
    .map((block) => fieldValue(block, "observation_id"))
    .filter((value): value is string => Boolean(value));
}

function reviewLedgerPreservationError(existingContent: string, nextContent: string) {
  const existingIds = observationIdsFromContent(existingContent);
  const nextIds = observationIdsFromContent(nextContent);
  if (existingIds.length !== nextIds.length) {
    return `Review observation writes must preserve ledger observation count (${existingIds.length}); received ${nextIds.length}.`;
  }

  for (const [index, existingId] of existingIds.entries()) {
    if (nextIds[index] === existingId) continue;

    return `Review observation writes must preserve observation ids and order; expected ${existingId} at index ${index + 1}, received ${nextIds[index] ?? "(missing)"}.`;
  }

  return undefined;
}

export type WikiToolOptions = {
  claimSegmentBounds?: {
    dialogue: string;
    span: string;
    startChar: number;
    endChar: number;
  };
  relationTargets?: readonly RelationCandidateTarget[] | undefined;
};

export function createWikiTools(transcript: TranscriptWriter, command: HarnessRunCommand, options: WikiToolOptions = {}): AgentTool[] {
  let sourceSpanCallCount = 0;
  const stagedObservations = new Map<
    string,
    {
      content: string;
      bytes: number;
      observationCount: number;
    }
  >();
  const stagedClaims = new Map<
    string,
    {
      content: string;
      bytes: number;
      claimCount: number;
    }
  >();

  const readFileParameters = Type.Object({
    path: Type.String({
      description: "Repository-relative path.",
    }),
  });

  const sourceSpanParameters = Type.Object({
    dialogue: Type.String({ description: "Lowercase dialogue slug, for example euthyphro." }),
    stephanus_span: Type.String({ description: "Span such as 5d or 5d-5e." }),
    max_chars: Type.Optional(Type.Number({ description: "Maximum excerpt characters returned to the model." })),
  });

  const writeObservationParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/observations/*.md path." }),
    content: Type.String({ description: "Full markdown content to write." }),
  });

  const writeClaimParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/claims/*.md path." }),
    content: Type.String({ description: "Full markdown claim ledger content to write." }),
  });

  const updateReviewStatusesParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/observations/*.md path." }),
    updates: Type.Array(
      Type.Object({
        observation_id: Type.String({ description: "Existing observation id to update." }),
        review_status: Type.Union([
          Type.Literal("accepted"),
          Type.Literal("rejected"),
          Type.Literal("needs_split"),
        ]),
      }),
    ),
  });

  const updateClaimReviewStatusesParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/claims/*.md path." }),
    updates: Type.Array(
      Type.Object({
        claim_id: Type.String({ description: "Existing claim id to update." }),
        review_status: Type.Union([
          Type.Literal("accepted"),
          Type.Literal("rejected"),
          Type.Literal("needs_split"),
        ]),
      }),
    ),
  });

  const commitObservationParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/observations/*.md path previously staged." }),
  });

  const commitClaimParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/claims/*.md path previously staged." }),
  });

  const appendObservationParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/observations/*.md path." }),
    content: Type.String({ description: "New fenced yaml observation records to append." }),
  });

  const appendClaimParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/claims/*.md path." }),
    content: Type.String({ description: "New fenced yaml claim records to append." }),
  });

  const appendRelationParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/relations/*.md path." }),
    content: Type.String({ description: "New fenced yaml relation records to append." }),
  });

  const updateRelationReviewStatusesParameters = Type.Object({
    path: Type.String({ description: "Repository-relative wiki/relations/*.md path." }),
    updates: Type.Array(
      Type.Object({
        relation_id: Type.String({ description: "Existing relation id to update." }),
        review_status: Type.Union([
          Type.Literal("accepted"),
          Type.Literal("rejected"),
          Type.Literal("needs_split"),
        ]),
      }),
    ),
  });

  function validateObservation(relativePath: string, content: string) {
    const validationIssues = validateObservationLedger(relativePath, content);

    if (validationIssues.length > 0) {
      return { ok: false as const, validationIssues };
    }

    return {
      ok: true as const,
      content,
      bytes: Buffer.byteLength(content),
      observationCount: observationYamlBlocks(content).length,
    };
  }

  function validateClaim(relativePath: string, content: string) {
    const validationIssues = validateClaimLedger(relativePath, content);
    if (validationIssues.length > 0) {
      return { ok: false as const, validationIssues };
    }

    return {
      ok: true as const,
      content,
      bytes: Buffer.byteLength(content),
      claimCount: claimYamlBlocks(content).length,
    };
  }

  function validateRelation(relativePath: string, content: string) {
    const validationIssues = validateRelationLedger(relativePath, content);
    if (validationIssues.length > 0) {
      return { ok: false as const, validationIssues };
    }

    return {
      ok: true as const,
      content,
      bytes: Buffer.byteLength(content),
      relationCount: relationYamlBlocks(content).length,
    };
  }

  function rejectionEventName(base: "stage" | "write") {
    return base === "stage" ? "wiki_tool_stage_observation_rejected" : "wiki_tool_write_observation_rejected";
  }

  function observationIds(content: string) {
    return new Set(
      observationYamlBlocks(content)
        .map((block) => fieldValue(block, "observation_id"))
        .filter((id): id is string => id !== undefined),
    );
  }

  function claimIds(content: string) {
    return new Set(
      claimYamlBlocks(content)
        .map((block) => fieldValue(block, "claim_id"))
        .filter((id): id is string => id !== undefined),
    );
  }

  function relationIds(content: string) {
    return new Set(
      relationYamlBlocks(content)
        .map((block) => fieldValue(block, "relation_id"))
        .filter((id): id is string => id !== undefined),
    );
  }

  function escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  }

  function dialogueSlugFromObservationPath(relativePath: string) {
    return /^wiki\/observations\/([^/]+)\.md$/u.exec(relativePath)?.[1] ?? "observation";
  }

  function dialogueSlugFromClaimPath(relativePath: string) {
    return /^wiki\/claims\/([^/]+)\.md$/u.exec(relativePath)?.[1] ?? "claim";
  }

  function dialogueSlugFromRelationPath(relativePath: string) {
    return /^wiki\/relations\/([^/]+)\.md$/u.exec(relativePath)?.[1] ?? "relation";
  }

  function nextObservationNumber(existingContent: string, dialogueSlug: string) {
    const idPattern = new RegExp(`^obs_${escapeRegExp(dialogueSlug)}_(\\d+)$`, "u");
    let maxNumber = 0;

    for (const observationId of observationIds(existingContent)) {
      const match = idPattern.exec(observationId);
      if (!match) continue;
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }

    return maxNumber + 1;
  }

  function nextClaimNumber(existingContent: string, dialogueSlug: string) {
    const idPattern = new RegExp(`^claim_${escapeRegExp(dialogueSlug)}_(\\d+)$`, "u");
    let maxNumber = 0;

    for (const claimId of claimIds(existingContent)) {
      const match = idPattern.exec(claimId);
      if (!match) continue;
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }

    return maxNumber + 1;
  }

  function nextRelationNumber(existingContent: string, dialogueSlug: string) {
    const idPattern = new RegExp(`^rel_${escapeRegExp(dialogueSlug)}_(\\d+)$`, "u");
    let maxNumber = 0;

    for (const relationId of relationIds(existingContent)) {
      const match = idPattern.exec(relationId);
      if (!match) continue;
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }

    return maxNumber + 1;
  }

  function nextRelationPairNumber(existingContent: string, dialogueSlug: string) {
    const idPattern = new RegExp(`^pair_${escapeRegExp(dialogueSlug)}_(\\d{5})$`, "u");
    let maxNumber = 0;

    for (const block of relationYamlBlocks(existingContent)) {
      const pairId = fieldValue(block, "pair_id");
      const match = pairId ? idPattern.exec(pairId) : undefined;
      if (!match?.[1]) continue;
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }

    return maxNumber + 1;
  }

  function upsertObservationId(block: string, observationId: string) {
    const nextLine = `observation_id: ${observationId}`;
    if (/^observation_id:\s*/mu.test(block)) {
      return block.replace(/^observation_id:\s*.*$/mu, nextLine);
    }

    return `${nextLine}\n${block.trimStart()}`;
  }

  function upsertClaimId(block: string, claimId: string) {
    const nextLine = `claim_id: ${claimId}`;
    if (/^claim_id:\s*/mu.test(block)) {
      return block.replace(/^claim_id:\s*.*$/mu, nextLine);
    }

    return `${nextLine}\n${block.trimStart()}`;
  }

  function upsertRelationId(block: string, relationId: string) {
    const nextLine = `relation_id: ${relationId}`;
    if (/^relation_id:\s*/mu.test(block)) {
      return block.replace(/^relation_id:\s*.*$/mu, nextLine);
    }

    return `${nextLine}\n${block.trimStart()}`;
  }

  function upsertRelationPairId(block: string, pairId: string) {
    const nextLine = `pair_id: ${pairId}`;
    if (/^pair_id:\s*/mu.test(block)) {
      return block.replace(/^pair_id:\s*.*$/mu, nextLine);
    }

    if (/^relation_id:\s*.*$/mu.test(block)) {
      return block.replace(/^(relation_id:\s*.*)$/mu, `$1\n${nextLine}`);
    }

    return `${nextLine}\n${block.trimStart()}`;
  }

  function yamlScalarValue(line: string, field: string) {
    const match = new RegExp(`^\\s*${escapeRegExp(field)}:\\s*(.*?)\\s*$`, "u").exec(line);
    if (!match) return undefined;

    const value = match[1] ?? "";
    return value.replace(/^["'](.*)["']$/u, "$1");
  }

  function sourceRefYamlLines(dialogueSlug: string, span: string, indent: string) {
    const { source_ref } = resolveSourceSpan(dialogueSlug, span);
    return [
      `${indent}source_ref:`,
      `${indent}  source_path: ${source_ref.source_path}`,
      `${indent}  stephanus_span: ${source_ref.stephanus_span}`,
      `${indent}  start_marker: ${source_ref.start_marker}`,
      `${indent}  end_marker: ${source_ref.end_marker}`,
      `${indent}  start_char: ${source_ref.start_char}`,
      `${indent}  end_char: ${source_ref.end_char}`,
      `${indent}  text_sha256: "${source_ref.text_sha256}"`,
    ];
  }

  function sourceRefSectionEnd(lines: string[], sourceRefLineIndex: number, sourceRefIndentLength: number) {
    let end = sourceRefLineIndex + 1;
    while (end < lines.length) {
      const line = lines[end]!;
      if (line.trim().length === 0) break;

      const indentLength = /^ */u.exec(line)?.[0].length ?? 0;
      if (indentLength <= sourceRefIndentLength) break;
      end += 1;
    }

    return end;
  }

  function canonicalizeClaimBlockSourceRefs(dialogueSlug: string, block: string) {
    const lines = block.split("\n");
    const output: string[] = [];
    let claimSpan: string | undefined;
    let stanceEventSpan: string | undefined;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]!;
      const indent = /^ */u.exec(line)?.[0] ?? "";

      if (indent.length === 0) {
        const span = yamlScalarValue(line, "stephanus_span");
        if (span) claimSpan = span;
      } else if (indent.length === 4) {
        const span = yamlScalarValue(line, "stephanus_span");
        if (span) stanceEventSpan = span;
      }

      if (/^\s*source_ref:\s*$/u.test(line)) {
        const span = indent.length === 0 ? claimSpan : indent.length === 4 ? stanceEventSpan : undefined;
        if (span) {
          try {
            output.push(...sourceRefYamlLines(dialogueSlug, span, indent));
            index = sourceRefSectionEnd(lines, index, indent.length) - 1;
            continue;
          } catch {
            // Leave invalid spans unchanged so the validator can report the real issue.
          }
        }
      }

      output.push(line);
    }

    return output.join("\n");
  }

  function appendNewObservationBlocks(existingContent: string, newContent: string, relativePath: string) {
    const dialogueSlug = dialogueSlugFromObservationPath(relativePath);
    let nextNumber = nextObservationNumber(existingContent, dialogueSlug);
    const markdownBlocks = observationMarkdownBlocks(newContent);
    const newBlocks = markdownBlocks.map((block) => {
      const observationId = `obs_${dialogueSlug}_${String(nextNumber).padStart(4, "0")}`;
      nextNumber += 1;
      return `\`\`\`yaml\n${upsertObservationId(block.content, observationId).trim()}\n\`\`\``;
    });

    if (newBlocks.length === 0) {
      return {
        content: existingContent,
        appendedCount: 0,
        appendedBlocks: [],
        parsedBlockCount: markdownBlocks.length,
        sawBareObservation: /^observation_id:\s*/mu.test(newContent),
      };
    }

    const content = [existingContent.trimEnd(), newBlocks.join("\n\n")].filter((part) => part.length > 0).join("\n\n");
    return {
      content: `${content}\n`,
      appendedCount: newBlocks.length,
      appendedBlocks: newBlocks,
      parsedBlockCount: markdownBlocks.length,
      sawBareObservation: /^observation_id:\s*/mu.test(newContent),
    };
  }

  function appendNewClaimBlocks(existingContent: string, newContent: string, relativePath: string) {
    const dialogueSlug = dialogueSlugFromClaimPath(relativePath);
    let nextNumber = nextClaimNumber(existingContent, dialogueSlug);
    const markdownBlocks = claimMarkdownBlocks(newContent);
    const newBlocks = markdownBlocks.map((block) => {
      const claimId = `claim_${dialogueSlug}_${String(nextNumber).padStart(4, "0")}`;
      nextNumber += 1;
      const withClaimId = upsertClaimId(block.content, claimId);
      const canonicalized = canonicalizeClaimBlockSourceRefs(dialogueSlug, withClaimId);
      return `\`\`\`yaml\n${canonicalized.trim()}\n\`\`\``;
    });

    if (newBlocks.length === 0) {
      return {
        content: existingContent,
        appendedCount: 0,
        parsedBlockCount: markdownBlocks.length,
        sawBareClaim: /^claim_id:\s*/mu.test(newContent),
      };
    }

    const content = [existingContent.trimEnd(), newBlocks.join("\n\n")].filter((part) => part.length > 0).join("\n\n");
    return {
      content: `${content}\n`,
      appendedCount: newBlocks.length,
      appendedBlocks: newBlocks,
      parsedBlockCount: markdownBlocks.length,
      sawBareClaim: /^claim_id:\s*/mu.test(newContent),
    };
  }

  function claimSourceRefRanges(block: string) {
    const ranges: { startChar: number; endChar: number }[] = [];
    const lines = block.split("\n");

    for (const [index, line] of lines.entries()) {
      if (!/^\s*source_ref:\s*$/u.test(line)) continue;

      const sourceRefIndent = /^ */u.exec(line)?.[0].length ?? 0;
      let startChar: number | undefined;
      let endChar: number | undefined;

      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
        const nextLine = lines[nextIndex]!;
        if (nextLine.trim().length === 0) break;

        const indentLength = /^ */u.exec(nextLine)?.[0].length ?? 0;
        if (indentLength <= sourceRefIndent) break;

        const startMatch = /^\s*start_char:\s*(\d+)\s*$/u.exec(nextLine);
        if (startMatch?.[1]) startChar = Number(startMatch[1]);

        const endMatch = /^\s*end_char:\s*(\d+)\s*$/u.exec(nextLine);
        if (endMatch?.[1]) endChar = Number(endMatch[1]);
      }

      if (startChar !== undefined && endChar !== undefined) {
        ranges.push({ startChar, endChar });
      }
    }

    return ranges;
  }

  function claimSegmentBoundaryErrors(appendedBlocks: string[]) {
    const bounds = options.claimSegmentBounds;
    if (!bounds) return [];

    const errors: string[] = [];
    for (const block of claimYamlBlocks(appendedBlocks.join("\n\n"))) {
      const claimId = fieldValue(block, "claim_id") ?? "(new claim)";
      for (const range of claimSourceRefRanges(block)) {
        if (range.startChar < bounds.startChar || range.endChar > bounds.endChar) {
          errors.push(
            `${claimId} cites source_ref ${range.startChar}-${range.endChar} outside current claim segment ${bounds.span} (${bounds.startChar}-${bounds.endChar}).`,
          );
        }
      }
    }

    return errors;
  }

  function relationBlocksForTargets(
    markdownBlocks: ReturnType<typeof relationMarkdownBlocks>,
    dialogueSlug: string,
  ) {
    const targets = options.relationTargets;
    if (!targets) return markdownBlocks;

    const targetsByKey = new Map<string, RelationCandidateTarget>();
    for (const target of targets) {
      const expectedKey = relationCandidateKey(dialogueSlug, target.claimA, target.claimB);
      if (target.candidateKey !== expectedKey) {
        throw new Error(`Internal relation target key drift: ${target.candidateKey}`);
      }
      if (targetsByKey.has(target.candidateKey)) {
        throw new Error(`Internal duplicate relation target key: ${target.candidateKey}`);
      }
      targetsByKey.set(target.candidateKey, target);
    }

    const blocksByKey = new Map<string, ReturnType<typeof relationMarkdownBlocks>[number]>();
    for (const block of markdownBlocks) {
      const claimA = fieldValue(block.content, "claim_a");
      const claimB = fieldValue(block.content, "claim_b");
      if (!claimA || !claimB) {
        throw new Error("Relation append must include claim_a and claim_b for every target candidate.");
      }
      const candidateKey = relationCandidateKey(dialogueSlug, claimA, claimB);
      const target = targetsByKey.get(candidateKey);
      if (!target) {
        throw new Error(`Relation append contains non-target candidate: ${candidateKey}`);
      }
      if (claimA !== target.claimA || claimB !== target.claimB) {
        throw new Error(`Relation append must preserve target claim order for candidate: ${candidateKey}`);
      }
      if (blocksByKey.has(candidateKey)) {
        throw new Error(`Relation append contains duplicate target candidate: ${candidateKey}`);
      }
      blocksByKey.set(candidateKey, block);
    }

    const missing = targets.filter((target) => !blocksByKey.has(target.candidateKey));
    if (missing.length > 0) {
      throw new Error(`Relation append omitted target candidate(s): ${missing.map((target) => target.candidateKey).join(", ")}`);
    }

    return targets.map((target) => blocksByKey.get(target.candidateKey)!);
  }

  function appendNewRelationBlocks(existingContent: string, newContent: string, relativePath: string) {
    const dialogueSlug = dialogueSlugFromRelationPath(relativePath);
    let nextNumber = nextRelationNumber(existingContent, dialogueSlug);
    let nextPairNumber = nextRelationPairNumber(existingContent, dialogueSlug);
    const markdownBlocks = relationBlocksForTargets(relationMarkdownBlocks(newContent), dialogueSlug);
    const assignedPairIds: string[] = [];
    const newBlocks = markdownBlocks.map((block) => {
      const relationId = `rel_${dialogueSlug}_${String(nextNumber).padStart(4, "0")}`;
      if (nextPairNumber > 99_999) {
        throw new Error(`Relation pair_id capacity exhausted for ${dialogueSlug}.`);
      }
      const pairId = `pair_${dialogueSlug}_${String(nextPairNumber).padStart(5, "0")}`;
      nextNumber += 1;
      nextPairNumber += 1;
      assignedPairIds.push(pairId);
      return `\`\`\`yaml\n${upsertRelationPairId(upsertRelationId(block.content, relationId), pairId).trim()}\n\`\`\``;
    });

    if (newBlocks.length === 0) {
      return {
        content: existingContent,
        appendedCount: 0,
        assignedPairIds,
        parsedBlockCount: markdownBlocks.length,
        sawBareRelation: /^relation_id:\s*/mu.test(newContent) || /^pair_id:\s*/mu.test(newContent),
      };
    }

    const content = [existingContent.trimEnd(), newBlocks.join("\n\n")].filter((part) => part.length > 0).join("\n\n");
    return {
      content: `${content}\n`,
      appendedCount: newBlocks.length,
      assignedPairIds,
      parsedBlockCount: markdownBlocks.length,
      sawBareRelation: /^relation_id:\s*/mu.test(newContent) || /^pair_id:\s*/mu.test(newContent),
    };
  }

  function sourceObservationAnchorKeys(content: string) {
    return observationYamlBlocks(content)
      .map((block) => {
        const sourcePath = nestedFieldValue(block, "source_path");
        const sourceSpan = nestedFieldValue(block, "stephanus_span");
        const observation = fieldValue(block, "observation")?.replace(/\s+/gu, " ").trim();
        if (!sourcePath || !sourceSpan || !observation) return undefined;
        return `${sourcePath}::${sourceSpan}::${observation}`;
      })
      .filter((key): key is string => key !== undefined);
  }

  function duplicateAppendedSourceObservationAnchor(existingContent: string, appendedBlocks: string[]) {
    const existingKeys = new Set(sourceObservationAnchorKeys(existingContent));
    const appendedKeys = new Set<string>();

    for (const block of appendedBlocks) {
      const [key] = sourceObservationAnchorKeys(block);
      if (!key) continue;
      if (existingKeys.has(key) || appendedKeys.has(key)) return key;
      appendedKeys.add(key);
    }

    return undefined;
  }

  function upsertReviewStatus(block: string, status: "accepted" | "rejected" | "needs_split") {
    if (/^review_status:\s*\S+\s*$/mu.test(block)) {
      return block.replace(/^review_status:\s*\S+\s*$/mu, `review_status: ${status}`);
    }

    return `${block.trimEnd()}\nreview_status: ${status}`;
  }

  const sourceSpanTool: AgentTool<typeof sourceSpanParameters> = {
    name: "wiki_source_span",
    label: "Source Span",
    description:
      "Resolve a Plato dialogue Stephanus span to deterministic source metadata from raw/plato/greek/*.txt. Persist the returned source_ref, not the excerpt; the excerpt is only for choosing concise English fields and short greek_terms.",
    parameters: sourceSpanParameters,
    executionMode: "parallel",
    execute: async (_toolCallId, params) => {
      sourceSpanCallCount += 1;
      if (command === "ingest-segmented" && sourceSpanCallCount > SEGMENTED_SOURCE_SPAN_CALL_LIMIT) {
        transcript.write("wiki_tool_source_span_rejected", {
          dialogue: params.dialogue,
          stephanus_span: params.stephanus_span,
          callCount: sourceSpanCallCount,
          limit: SEGMENTED_SOURCE_SPAN_CALL_LIMIT,
          code: "source_span_call_limit",
        });
        throw new Error(
          `Segmented ingest source-span call limit exceeded (${sourceSpanCallCount}/${SEGMENTED_SOURCE_SPAN_CALL_LIMIT}). Append the selected records now, or stop if the segment has no extractable records.`,
        );
      }
      if (isClaimCommand(command) && sourceSpanCallCount > CLAIM_SOURCE_SPAN_CALL_LIMIT) {
        transcript.write("wiki_tool_source_span_rejected", {
          dialogue: params.dialogue,
          stephanus_span: params.stephanus_span,
          callCount: sourceSpanCallCount,
          limit: CLAIM_SOURCE_SPAN_CALL_LIMIT,
          code: "claim_source_span_call_limit",
        });
        throw new Error(
          `Claim source-span call limit exceeded (${sourceSpanCallCount}/${CLAIM_SOURCE_SPAN_CALL_LIMIT}). Append or review the selected claim records now, or stop if the segment has no extractable records.`,
        );
      }
      if (isRelationCommand(command) && sourceSpanCallCount > RELATION_SOURCE_SPAN_CALL_LIMIT) {
        transcript.write("wiki_tool_source_span_rejected", {
          dialogue: params.dialogue,
          stephanus_span: params.stephanus_span,
          callCount: sourceSpanCallCount,
          limit: RELATION_SOURCE_SPAN_CALL_LIMIT,
          code: "relation_source_span_call_limit",
        });
        throw new Error(
          `Relation source-span call limit exceeded (${sourceSpanCallCount}/${RELATION_SOURCE_SPAN_CALL_LIMIT}). Append or review the selected relation records now, or stop if the batch has no supported records.`,
        );
      }

      const { source_ref, text } = resolveSourceSpan(params.dialogue, params.stephanus_span);
      const maxChars = Math.max(0, params.max_chars ?? 1200);
      const excerpt = text.length > maxChars ? `${text.slice(0, maxChars)}\n[truncated ${text.length - maxChars} chars]` : text;

      transcript.write("wiki_tool_source_span", {
        ...source_ref,
        excerptBytes: Buffer.byteLength(excerpt),
        textBytes: Buffer.byteLength(text),
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                source_ref,
                excerpt,
                record_rule: isRelationCommand(command)
                  ? "Copy source_ref into resolution_ref.source_ref when required. Do not persist this excerpt or Greek passages."
                  : "Copy source_ref into the record. Do not persist this excerpt or Greek passages; keep Greek only in greek_terms.",
              },
              null,
              2,
            ),
          },
        ],
        details: {
          source_ref,
          textBytes: Buffer.byteLength(text),
          excerptBytes: Buffer.byteLength(excerpt),
        },
      };
    },
  };

  const readFileTool: AgentTool<typeof readFileParameters> = {
    name: "wiki_read_file",
    label: "Read Wiki File",
    description: "Read an allowed repository file: wiki observations or raw Plato Greek.",
    parameters: readFileParameters,
    executionMode: "parallel",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertReadableWikiPath(relativePath);

      if (!existsSync(absolutePath)) {
        throw new Error(`File not found: ${relativePath}`);
      }

      const content = readFileSync(absolutePath, "utf8");
      const bytes = Buffer.byteLength(content);
      transcript.write("wiki_tool_read", { path: relativePath, bytes });

      return wikiResult(content, relativePath, bytes);
    },
  };

  const writeObservationTool: AgentTool<typeof writeObservationParameters> = {
    name: "wiki_write_observation",
    label: "Write Observation",
    description:
      "Validate and write a complete source-bound observation page. The path must be wiki/observations/<dialogue>.md.",
    parameters: writeObservationParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertObservationWritePath(relativePath);
      const validation = validateObservation(relativePath, params.content);

      if (!validation.ok) {
        transcript.write(rejectionEventName("write"), {
          path: relativePath,
          issueCount: validation.validationIssues.length,
          issues: validation.validationIssues.slice(0, 12),
        });
        throw new Error(formatObservationLedgerValidationError(validation.validationIssues, "wiki_write_observation"));
      }

      if (isReviewCommand(command) && existsSync(absolutePath)) {
        const preservationError = reviewLedgerPreservationError(
          readFileSync(absolutePath, "utf8"),
          validation.content,
        );
        if (preservationError) {
          transcript.write(rejectionEventName("write"), {
            path: relativePath,
            issueCount: 1,
            issues: [
              {
                code: "review_observation_id_mismatch",
                message: preservationError,
              },
            ],
          });
          throw new Error(preservationError);
        }
      }

      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, validation.content, "utf8");
      transcript.write("wiki_tool_write_observation", {
        path: relativePath,
        bytes: validation.bytes,
        observationCount: validation.observationCount,
      });
      return wikiResult(`Wrote ${relativePath}.`, relativePath, validation.bytes);
    },
  };

  const updateReviewStatusesTool: AgentTool<typeof updateReviewStatusesParameters> = {
    name: "wiki_update_review_statuses",
    label: "Update Review Statuses",
    description:
      "Review tool. Update review_status for existing observation ids in wiki/observations/<dialogue>.md without rewriting, deleting, or reordering records. Use this for segmented review batches.",
    parameters: updateReviewStatusesParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertObservationWritePath(relativePath);
      if (!existsSync(absolutePath)) {
        throw new Error(`File not found: ${relativePath}`);
      }
      if (params.updates.length === 0) {
        throw new Error("wiki_update_review_statuses requires at least one update.");
      }

      const updates = new Map<string, "accepted" | "rejected" | "needs_split">();
      for (const update of params.updates) {
        if (updates.has(update.observation_id)) {
          throw new Error(`Duplicate review update for ${update.observation_id}.`);
        }
        updates.set(update.observation_id, update.review_status);
      }

      const existingContent = readFileSync(absolutePath, "utf8");
      const existingIds = new Set(observationIdsFromContent(existingContent));
      const unknownIds = [...updates.keys()].filter((id) => !existingIds.has(id));
      if (unknownIds.length > 0) {
        throw new Error(`Unknown observation id(s) for ${relativePath}: ${unknownIds.join(", ")}`);
      }

      const applied = new Set<string>();
      const nextContent = replaceObservationYamlBlocks(existingContent, (block, fullMatch) => {
        const observationId = fieldValue(block, "observation_id");
        if (!observationId) return fullMatch;
        const status = updates.get(observationId);
        if (!status) return fullMatch;
        applied.add(observationId);
        return `\`\`\`yaml\n${upsertReviewStatus(block, status)}\n\`\`\``;
      });

      const missingIds = [...updates.keys()].filter((id) => !applied.has(id));
      if (missingIds.length > 0) {
        throw new Error(`Review update did not apply to observation id(s): ${missingIds.join(", ")}`);
      }

      const validationIssues = validateObservationLedger(relativePath, nextContent);
      if (validationIssues.length > 0) {
        transcript.write("wiki_tool_update_review_statuses_rejected", {
          path: relativePath,
          issueCount: validationIssues.length,
          issues: validationIssues.slice(0, 12),
        });
        throw new Error(formatObservationLedgerValidationError(validationIssues, "wiki_update_review_statuses"));
      }

      writeFileSync(absolutePath, nextContent, "utf8");
      const bytes = Buffer.byteLength(nextContent);
      const statusCounts = Object.fromEntries(
        (["accepted", "rejected", "needs_split"] as const).map((status) => [
          status,
          [...updates.values()].filter((value) => value === status).length,
        ]),
      );
      transcript.write("wiki_tool_update_review_statuses", {
        path: relativePath,
        bytes,
        updateCount: updates.size,
        statuses: statusCounts,
      });

      return {
        ...wikiResult(
          `Updated ${updates.size} review status(es) in ${relativePath}; observation ids and non-status fields were preserved.`,
          relativePath,
          bytes,
        ),
        terminate: true,
      };
    },
  };

  const stageClaimTool: AgentTool<typeof writeClaimParameters> = {
    name: "wiki_stage_claims",
    label: "Stage Claims",
    description:
      "Validate and stage a complete claim ledger without writing wiki/claims. Use this for drafts and retries when preparing a whole claim ledger.",
    parameters: writeClaimParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { relativePath } = normalizeRepoPath(params.path);
      assertClaimWritePath(relativePath);
      const validation = validateClaim(relativePath, params.content);

      if (!validation.ok) {
        transcript.write("wiki_tool_stage_claims_rejected", {
          path: relativePath,
          issueCount: validation.validationIssues.length,
          issues: validation.validationIssues.slice(0, 12),
        });
        throw new Error(formatClaimLedgerValidationError(validation.validationIssues, "wiki_stage_claims"));
      }

      stagedClaims.set(relativePath, {
        content: validation.content,
        bytes: validation.bytes,
        claimCount: validation.claimCount,
      });
      transcript.write("wiki_tool_stage_claims", {
        path: relativePath,
        bytes: validation.bytes,
        claimCount: validation.claimCount,
      });

      return {
        content: [
          {
            type: "text",
            text: [
              `Staged ${relativePath}; no files were written.`,
              `Validated ${validation.claimCount} claim record(s).`,
              "When the full dialogue ledger is complete, call wiki_commit_claims with the same path.",
            ].join("\n"),
          },
        ],
        details: {
          path: relativePath,
          bytes: validation.bytes,
          claimCount: validation.claimCount,
        },
      };
    },
  };

  const commitClaimTool: AgentTool<typeof commitClaimParameters> = {
    name: "wiki_commit_claims",
    label: "Commit Claims",
    description:
      "Commit the latest staged claim ledger to wiki/claims/<dialogue>.md.",
    parameters: commitClaimParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertClaimWritePath(relativePath);
      const staged = stagedClaims.get(relativePath);
      if (!staged) {
        throw new Error(`No staged claim content found for ${relativePath}. Call wiki_stage_claims first.`);
      }

      return withRepoWriteLock({ paths: [relativePath], label: `wiki_commit_claims:${relativePath}` }, () => {
        mkdirSync(dirname(absolutePath), { recursive: true });
        writeFileSync(absolutePath, staged.content, "utf8");
        transcript.write("wiki_tool_commit_claims", {
          path: relativePath,
          bytes: staged.bytes,
          claimCount: staged.claimCount,
        });

        return wikiResult(
          `Committed ${staged.claimCount} claim record(s) to ${relativePath}.`,
          relativePath,
          staged.bytes,
        );
      });
    },
  };

  const appendClaimTool: AgentTool<typeof appendClaimParameters> = {
    name: "wiki_append_claims",
    label: "Append Claims",
    description:
      "Segmented claim-extraction tool. Append new fenced yaml claim records to wiki/claims/<dialogue>.md, treat incoming claim_id values as temporary, assign persisted claim_id values, and validate the full claim ledger.",
    parameters: appendClaimParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertClaimWritePath(relativePath);
      return withRepoWriteLock({ paths: [relativePath], label: `wiki_append_claims:${relativePath}` }, () => {
        const existingContent = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
        const appended = appendNewClaimBlocks(existingContent, params.content, relativePath);
        if (appended.appendedCount === 0) {
          if (appended.parsedBlockCount === 0 && appended.sawBareClaim) {
            transcript.write("wiki_tool_append_claims_rejected", {
              path: relativePath,
              issueCount: 1,
              issues: [
                {
                  code: "missing_fenced_yaml",
                  message: "Claim records must be fenced YAML blocks, not bare YAML.",
                },
              ],
            });
            throw new Error("Claim records must be fenced YAML blocks, not bare YAML.");
          }
          transcript.write("wiki_tool_append_claims_empty", {
            path: relativePath,
            bytes: Buffer.byteLength(existingContent),
          });
          return {
            ...wikiResult(`No new claims to append to ${relativePath}.`, relativePath, Buffer.byteLength(existingContent)),
            ...(command === "claims-segmented" && params.content.trim().length === 0 ? { terminate: true } : {}),
          };
        }

        const validation = validateClaim(relativePath, appended.content);
        if (!validation.ok) {
          transcript.write("wiki_tool_append_claims_rejected", {
            path: relativePath,
            issueCount: validation.validationIssues.length,
            issues: validation.validationIssues.slice(0, 12),
          });
          throw new Error(formatClaimLedgerValidationError(validation.validationIssues, "wiki_append_claims"));
        }

        const boundaryErrors = claimSegmentBoundaryErrors(appended.appendedBlocks ?? []);
        if (boundaryErrors.length > 0) {
          transcript.write("wiki_tool_append_claims_rejected", {
            path: relativePath,
            issueCount: boundaryErrors.length,
            issues: boundaryErrors.slice(0, 12).map((message) => ({
              code: "claim_segment_bounds",
              message,
            })),
          });
          throw new Error(`Claim source_ref outside current segment:\n${boundaryErrors.join("\n")}`);
        }

        mkdirSync(dirname(absolutePath), { recursive: true });
        writeFileSync(absolutePath, validation.content, "utf8");
        transcript.write("wiki_tool_append_claims", {
          path: relativePath,
          bytes: validation.bytes,
          appendedCount: appended.appendedCount,
          claimCount: validation.claimCount,
        });

        return {
          content: [
            {
              type: "text",
              text: `Appended ${appended.appendedCount} claim(s) to ${relativePath}; full ledger now has ${validation.claimCount} claim record(s).`,
            },
          ],
          details: {
            path: relativePath,
            bytes: validation.bytes,
            appendedCount: appended.appendedCount,
            claimCount: validation.claimCount,
          },
          ...(command === "claims-segmented" ? { terminate: true } : {}),
        };
      });
    },
  };

  const updateClaimReviewStatusesTool: AgentTool<typeof updateClaimReviewStatusesParameters> = {
    name: "wiki_update_claim_review_statuses",
    label: "Update Claim Review Statuses",
    description:
      "Review tool. Update review_status for existing claim ids in wiki/claims/<dialogue>.md without rewriting, deleting, reordering, or changing non-status fields.",
    parameters: updateClaimReviewStatusesParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertClaimWritePath(relativePath);
      if (params.updates.length === 0) {
        throw new Error("wiki_update_claim_review_statuses requires at least one update.");
      }

      const updates = new Map<string, "accepted" | "rejected" | "needs_split">();
      for (const update of params.updates) {
        if (updates.has(update.claim_id)) {
          throw new Error(`Duplicate review update for ${update.claim_id}.`);
        }
        updates.set(update.claim_id, update.review_status);
      }

      return withRepoWriteLock({ paths: [relativePath], label: `wiki_update_claim_review_statuses:${relativePath}` }, () => {
        if (!existsSync(absolutePath)) {
          throw new Error(`File not found: ${relativePath}`);
        }

        const existingContent = readFileSync(absolutePath, "utf8");
        const existingIds = claimIds(existingContent);
        const unknownIds = [...updates.keys()].filter((id) => !existingIds.has(id));
        if (unknownIds.length > 0) {
          throw new Error(`Unknown claim id(s) for ${relativePath}: ${unknownIds.join(", ")}`);
        }

        const applied = new Set<string>();
        const nextContent = replaceClaimYamlBlocks(existingContent, (block, fullMatch) => {
          const claimId = fieldValue(block, "claim_id");
          if (!claimId) return fullMatch;
          const status = updates.get(claimId);
          if (!status) return fullMatch;
          applied.add(claimId);
          return `\`\`\`yaml\n${upsertReviewStatus(block, status)}\n\`\`\``;
        });

        const missingIds = [...updates.keys()].filter((id) => !applied.has(id));
        if (missingIds.length > 0) {
          throw new Error(`Review update did not apply to claim id(s): ${missingIds.join(", ")}`);
        }

        const validationIssues = validateClaimLedger(relativePath, nextContent);
        if (validationIssues.length > 0) {
          transcript.write("wiki_tool_update_claim_review_statuses_rejected", {
            path: relativePath,
            issueCount: validationIssues.length,
            issues: validationIssues.slice(0, 12),
          });
          throw new Error(formatClaimLedgerValidationError(validationIssues, "wiki_update_claim_review_statuses"));
        }

        writeFileSync(absolutePath, nextContent, "utf8");
        const bytes = Buffer.byteLength(nextContent);
        const statusCounts = Object.fromEntries(
          (["accepted", "rejected", "needs_split"] as const).map((status) => [
            status,
            [...updates.values()].filter((value) => value === status).length,
          ]),
        );
        transcript.write("wiki_tool_update_claim_review_statuses", {
          path: relativePath,
          bytes,
          updateCount: updates.size,
          statuses: statusCounts,
        });

        return {
          ...wikiResult(
            `Updated ${updates.size} claim review status(es) in ${relativePath}; claim ids and non-status fields were preserved.`,
            relativePath,
            bytes,
          ),
          terminate: true,
        };
      });
    },
  };

  const appendRelationTool: AgentTool<typeof appendRelationParameters> = {
    name: "wiki_append_relations",
    label: "Append Relations",
    description:
      "Relation-adjudication tool. Append new fenced yaml relation records to wiki/relations/<scope>.md, match them to the injected claim-pair targets, assign persisted relation_id and unique ledger pair_id values, and validate the full relation ledger.",
    parameters: appendRelationParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertRelationWritePath(relativePath);
      return withRepoWriteLock({ paths: [relativePath], label: `wiki_append_relations:${relativePath}` }, () => {
        const existingContent = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
        const appended = appendNewRelationBlocks(existingContent, params.content, relativePath);
        if (appended.appendedCount === 0) {
          if (appended.parsedBlockCount === 0 && appended.sawBareRelation) {
            transcript.write("wiki_tool_append_relations_rejected", {
              path: relativePath,
              issueCount: 1,
              issues: [
                {
                  code: "missing_fenced_yaml",
                  message: "Relation records must be fenced YAML blocks, not bare YAML.",
                },
              ],
            });
            throw new Error("Relation records must be fenced YAML blocks, not bare YAML.");
          }
          transcript.write("wiki_tool_append_relations_empty", {
            path: relativePath,
            bytes: Buffer.byteLength(existingContent),
          });
          return {
            ...wikiResult(`No new relations to append to ${relativePath}.`, relativePath, Buffer.byteLength(existingContent)),
            ...(command === "relations-segmented" && params.content.trim().length === 0 ? { terminate: true } : {}),
          };
        }

        const validation = validateRelation(relativePath, appended.content);
        if (!validation.ok) {
          transcript.write("wiki_tool_append_relations_rejected", {
            path: relativePath,
            issueCount: validation.validationIssues.length,
            issues: validation.validationIssues.slice(0, 12),
          });
          throw new Error(formatRelationLedgerValidationError(validation.validationIssues, "wiki_append_relations"));
        }

        mkdirSync(dirname(absolutePath), { recursive: true });
        writeFileSync(absolutePath, validation.content, "utf8");
        transcript.write("wiki_tool_append_relations", {
          path: relativePath,
          bytes: validation.bytes,
          appendedCount: appended.appendedCount,
          assignedPairIds: appended.assignedPairIds,
          relationCount: validation.relationCount,
        });

        return {
          content: [
            {
              type: "text",
              text: `Appended ${appended.appendedCount} relation(s) to ${relativePath}; assigned ledger pair_id values ${appended.assignedPairIds.join(", ")}; full ledger now has ${validation.relationCount} relation record(s).`,
            },
          ],
          details: {
            path: relativePath,
            bytes: validation.bytes,
            appendedCount: appended.appendedCount,
            assignedPairIds: appended.assignedPairIds,
            relationCount: validation.relationCount,
          },
          ...(command === "relations-segmented" ? { terminate: true } : {}),
        };
      });
    },
  };

  const updateRelationReviewStatusesTool: AgentTool<typeof updateRelationReviewStatusesParameters> = {
    name: "wiki_update_relation_review_statuses",
    label: "Update Relation Review Statuses",
    description:
      "Review tool. Update review_status for existing relation ids in wiki/relations/<scope>.md without rewriting, deleting, reordering, or changing non-status fields.",
    parameters: updateRelationReviewStatusesParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertRelationWritePath(relativePath);
      if (params.updates.length === 0) {
        throw new Error("wiki_update_relation_review_statuses requires at least one update.");
      }

      const updates = new Map<string, "accepted" | "rejected" | "needs_split">();
      for (const update of params.updates) {
        if (updates.has(update.relation_id)) {
          throw new Error(`Duplicate review update for ${update.relation_id}.`);
        }
        updates.set(update.relation_id, update.review_status);
      }

      return withRepoWriteLock({ paths: [relativePath], label: `wiki_update_relation_review_statuses:${relativePath}` }, () => {
        if (!existsSync(absolutePath)) {
          throw new Error(`File not found: ${relativePath}`);
        }

        const existingContent = readFileSync(absolutePath, "utf8");
        const existingIds = relationIds(existingContent);
        const unknownIds = [...updates.keys()].filter((id) => !existingIds.has(id));
        if (unknownIds.length > 0) {
          throw new Error(`Unknown relation id(s) for ${relativePath}: ${unknownIds.join(", ")}`);
        }

        const applied = new Set<string>();
        const nextContent = replaceRelationYamlBlocks(existingContent, (block, fullMatch) => {
          const relationId = fieldValue(block, "relation_id");
          if (!relationId) return fullMatch;
          const status = updates.get(relationId);
          if (!status) return fullMatch;
          applied.add(relationId);
          return `\`\`\`yaml\n${upsertReviewStatus(block, status)}\n\`\`\``;
        });

        const missingIds = [...updates.keys()].filter((id) => !applied.has(id));
        if (missingIds.length > 0) {
          throw new Error(`Review update did not apply to relation id(s): ${missingIds.join(", ")}`);
        }

        const validationIssues = validateRelationLedger(relativePath, nextContent);
        if (validationIssues.length > 0) {
          transcript.write("wiki_tool_update_relation_review_statuses_rejected", {
            path: relativePath,
            issueCount: validationIssues.length,
            issues: validationIssues.slice(0, 12),
          });
          throw new Error(formatRelationLedgerValidationError(validationIssues, "wiki_update_relation_review_statuses"));
        }

        writeFileSync(absolutePath, nextContent, "utf8");
        const bytes = Buffer.byteLength(nextContent);
        const statusCounts = Object.fromEntries(
          (["accepted", "rejected", "needs_split"] as const).map((status) => [
            status,
            [...updates.values()].filter((value) => value === status).length,
          ]),
        );
        transcript.write("wiki_tool_update_relation_review_statuses", {
          path: relativePath,
          bytes,
          updateCount: updates.size,
          statuses: statusCounts,
        });

        return {
          ...wikiResult(
            `Updated ${updates.size} relation review status(es) in ${relativePath}; relation ids and non-status fields were preserved.`,
            relativePath,
            bytes,
          ),
          terminate: true,
        };
      });
    },
  };

  const stageObservationTool: AgentTool<typeof writeObservationParameters> = {
    name: "wiki_stage_observation",
    label: "Stage Observation",
    description:
      "Validate and stage a complete or growing source-bound observation page without writing wiki/observations. Use this during ingest for drafts and retries.",
    parameters: writeObservationParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { relativePath } = normalizeRepoPath(params.path);
      assertObservationWritePath(relativePath);
      const validation = validateObservation(relativePath, params.content);

      if (!validation.ok) {
        transcript.write(rejectionEventName("stage"), {
          path: relativePath,
          issueCount: validation.validationIssues.length,
          issues: validation.validationIssues.slice(0, 12),
        });
        throw new Error(formatObservationLedgerValidationError(validation.validationIssues, "wiki_stage_observation"));
      }

      stagedObservations.set(relativePath, {
        content: validation.content,
        bytes: validation.bytes,
        observationCount: validation.observationCount,
      });
      transcript.write("wiki_tool_stage_observation", {
        path: relativePath,
        bytes: validation.bytes,
        observationCount: validation.observationCount,
      });

      return wikiResult(
        `Staged ${relativePath}; no files were written. When the full dialogue ledger is complete, call wiki_commit_observation with the same path.`,
        relativePath,
        validation.bytes,
      );
    },
  };

  const commitObservationTool: AgentTool<typeof commitObservationParameters> = {
    name: "wiki_commit_observation",
    label: "Commit Observation",
    description:
      "Commit the latest staged observation page to wiki/observations/<dialogue>.md. Use this once at the end of ingest, after wiki_stage_observation has accepted the complete ledger.",
    parameters: commitObservationParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertObservationWritePath(relativePath);
      const staged = stagedObservations.get(relativePath);
      if (!staged) {
        throw new Error(`No staged observation content found for ${relativePath}. Call wiki_stage_observation first.`);
      }

      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, staged.content, "utf8");
      transcript.write("wiki_tool_commit_observation", {
        path: relativePath,
        bytes: staged.bytes,
        observationCount: staged.observationCount,
      });

      return wikiResult(`Committed ${relativePath}.`, relativePath, staged.bytes);
    },
  };

  const appendObservationTool: AgentTool<typeof appendObservationParameters> = {
    name: "wiki_append_observations",
    label: "Append Observations",
    description:
      "Segmented-ingest tool. Append new fenced yaml source-bound observation records to wiki/observations/<dialogue>.md, treat incoming observation_id values as temporary, assign persisted observation_id values to new records, reject exact duplicate source-bound records, and validate the full ledger.",
    parameters: appendObservationParameters,
    executionMode: "sequential",
    execute: async (_toolCallId, params) => {
      const { absolutePath, relativePath } = normalizeRepoPath(params.path);
      assertObservationWritePath(relativePath);
      return withRepoWriteLock({ paths: [relativePath], label: `wiki_append_observations:${relativePath}` }, () => {
        const existingContent = existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
        const appended = appendNewObservationBlocks(existingContent, params.content, relativePath);
        if (appended.appendedCount === 0) {
          if (appended.parsedBlockCount === 0 && appended.sawBareObservation) {
            transcript.write("wiki_tool_append_observations_rejected", {
              path: relativePath,
              issueCount: 1,
              issues: [
                {
                  code: "missing_fenced_yaml",
                  message: "Observation records must be fenced YAML blocks, not bare YAML.",
                },
              ],
            });
            throw new Error("Observation records must be fenced YAML blocks, not bare YAML.");
          }
          return {
            ...wikiResult(`No new observations to append to ${relativePath}.`, relativePath, Buffer.byteLength(existingContent)),
            ...(command === "ingest-segmented" && params.content.trim().length === 0 ? { terminate: true } : {}),
          };
        }

        const duplicateSourceObservationAnchor = duplicateAppendedSourceObservationAnchor(
          existingContent,
          appended.appendedBlocks,
        );
        if (duplicateSourceObservationAnchor) {
          transcript.write("wiki_tool_append_observations_rejected", {
            path: relativePath,
            issueCount: 1,
            issues: [
              {
                code: "duplicate_source_observation_anchor",
                message: `Duplicate source-bound observation in segmented append: ${duplicateSourceObservationAnchor}`,
              },
            ],
          });
          throw new Error(`Duplicate source-bound observation in segmented append: ${duplicateSourceObservationAnchor}`);
        }

        const validation = validateObservation(relativePath, appended.content);
        if (!validation.ok) {
          transcript.write("wiki_tool_append_observations_rejected", {
            path: relativePath,
            issueCount: validation.validationIssues.length,
            issues: validation.validationIssues.slice(0, 12),
          });
          throw new Error(formatObservationLedgerValidationError(validation.validationIssues, "wiki_append_observations"));
        }

        mkdirSync(dirname(absolutePath), { recursive: true });
        writeFileSync(absolutePath, validation.content, "utf8");
        transcript.write("wiki_tool_append_observations", {
          path: relativePath,
          bytes: validation.bytes,
          appendedCount: appended.appendedCount,
          observationCount: validation.observationCount,
        });

        return {
          content: [{ type: "text", text: `Appended ${appended.appendedCount} observation(s) to ${relativePath}.` }],
          details: {
            path: relativePath,
            bytes: validation.bytes,
            appendedCount: appended.appendedCount,
          },
          ...(command === "ingest-segmented" ? { terminate: true } : {}),
        };
      });
    },
  };

  const tools: AgentTool[] =
    command === "ingest"
      ? [sourceSpanTool, readFileTool, stageObservationTool, commitObservationTool]
        : command === "ingest-segmented"
          ? [sourceSpanTool, appendObservationTool]
        : command === "claims-segmented"
          ? [appendClaimTool]
          : command === "claims-review-segmented"
            ? [sourceSpanTool, updateClaimReviewStatusesTool]
            : command === "relations-segmented"
              ? [sourceSpanTool, appendRelationTool]
              : command === "relations-review-segmented"
                ? [sourceSpanTool, updateRelationReviewStatusesTool]
            : [sourceSpanTool, readFileTool, updateReviewStatusesTool, writeObservationTool];
  return tools;
}
