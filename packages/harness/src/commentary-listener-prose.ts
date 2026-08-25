const INTERNAL_RECORD_ID = /\b(?:comm|obs|claim|rel)_[a-z0-9][a-z0-9_-]*\d\b/giu;
const COMPLETE_SENTENCE_END = /[.!?…][\]})'"”’]*$/u;

export type CommentaryListenerProseIssue =
  | {
      code: "internal_record_id";
      internalRecordIds: string[];
      message: string;
    }
  | {
      code: "incomplete_sentence";
      message: string;
    };

export type CommentaryListenerProseInspectionOptions = {
  /** Titles may be listener-facing without being complete sentences. */
  requireCompleteSentence?: boolean;
};

export function inspectCommentaryListenerProse(
  value: string,
  options: CommentaryListenerProseInspectionOptions = {},
): CommentaryListenerProseIssue[] {
  const prose = value.trim();
  const issues: CommentaryListenerProseIssue[] = [];
  const internalIds = [...new Set(prose.match(INTERNAL_RECORD_ID) ?? [])].sort();
  if (internalIds.length > 0) {
    issues.push({
      code: "internal_record_id",
      internalRecordIds: internalIds,
      message: `exposes internal record ids in listener-facing prose: ${internalIds.join(", ")}`,
    });
  }
  if ((options.requireCompleteSentence ?? true) && !COMPLETE_SENTENCE_END.test(prose)) {
    issues.push({
      code: "incomplete_sentence",
      message: "must end at a complete sentence boundary",
    });
  }
  return issues;
}

export function validateCommentaryListenerProse(
  value: string,
  path: string,
  options: CommentaryListenerProseInspectionOptions = {},
) {
  const prose = value.trim();
  const issues = inspectCommentaryListenerProse(prose, options);
  if (issues.length > 0) {
    throw new Error(`${path} ${issues.map((issue) => issue.message).join("; ")}`);
  }
  return prose;
}
