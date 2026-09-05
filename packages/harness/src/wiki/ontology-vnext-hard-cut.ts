import { getRepoRoot } from "../paths.js";
import { applyOntologyVNextMigration } from "./ontology-vnext-migration.js";
import { applySemanticRemediation } from "./semantic-remediation.js";

function observationId(key: string) {
  const prefix = "record:observation:";
  return key.startsWith(prefix) ? key.slice(prefix.length) : undefined;
}

/**
 * Executes the one-way ontology cutover as one repository change set.
 *
 * Semantic remediation must precede concept migration because atomic splits add
 * new accepted observation identities. The exact split replacement map defines
 * the proposal denominator for explicit concept-first membership decisions; it
 * never authorizes automatic membership inheritance.
 */
export function applyOntologyVNextHardCut({
  repoRoot = getRepoRoot(),
  packagePath,
  atomicSplitOverlayPath,
  sourceOmissionOverlayPath,
  relationDependencyOverlayPath,
  conceptAuditDirectory,
}: {
  repoRoot?: string;
  packagePath?: string;
  atomicSplitOverlayPath?: string;
  sourceOmissionOverlayPath?: string;
  relationDependencyOverlayPath?: string;
  conceptAuditDirectory?: string;
} = {}) {
  const semantic = applySemanticRemediation({
    repoRoot,
    ...(packagePath === undefined ? {} : { packagePath }),
    ...(atomicSplitOverlayPath === undefined ? {} : { atomicSplitOverlayPath }),
    ...(sourceOmissionOverlayPath === undefined ? {} : { sourceOmissionOverlayPath }),
    ...(relationDependencyOverlayPath === undefined ? {} : { relationDependencyOverlayPath }),
  });
  const splitMembershipProposalObservationIds = new Map<string, readonly string[]>();
  for (const [target, replacements] of semantic.plan.replacementTargets) {
    const targetId = observationId(target);
    if (!targetId) continue;
    const replacementIds = replacements.flatMap((replacement) => observationId(replacement) ?? []);
    if (replacementIds.length > 0) {
      splitMembershipProposalObservationIds.set(targetId, [...new Set(replacementIds)].sort());
    }
  }
  const ontology = applyOntologyVNextMigration({
    repoRoot,
    ...(conceptAuditDirectory === undefined ? {} : { conceptAuditDirectory }),
    splitMembershipProposalObservationIds,
  });
  return {
    semantic,
    ontology,
    splitMembershipProposalObservationIds,
  };
}
