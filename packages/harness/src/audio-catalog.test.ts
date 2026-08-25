import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setRepoRootForTesting } from "./paths.js";
import {
  CAST_ACCEPTANCE_GATES,
  applyAcceptedActiveSpeakerPolicy,
  buildCharacterCatalogFromSpeakerCensus,
  parseCastCatalog,
  parseCharacterCatalog,
  reportedOnlyCharacterIdsForDialogue,
  reviewRequiredVoiceCharacterIdsForDialogue,
  validateAudioCatalogArtifacts,
  validateAuthoritativeCharacterCatalog,
  validateCastCatalog,
  validateCharacterCatalog,
  voiceOwnerCharacterIdsForDialogue,
  type CharacterCatalog,
} from "./audio-catalog.js";

const CHARACTER_PATH = "audio/characters.json";
const CAST_PATH = "audio/cast.json";
const HASH = "a".repeat(64);

function characterCatalog(overrides: Record<string, unknown> = {}): CharacterCatalog {
  return {
    schemaVersion: 3,
    status: "partial",
    updatedAt: "2026-07-12",
    source: { path: "audio/english-tei-speaker-census.json", sha256: HASH },
    dialogues: [
      {
        dialogue: "crito",
        editorialStatus: "required",
        sourceParticipantCount: 1,
        sourceSaidElementCount: 1,
        sourceAnomalyCount: 0,
        characterIds: ["socrates"],
      },
    ],
    characters: [
      {
        characterId: "socrates",
        displayName: "Socrates",
        identityStatus: "resolved",
        aliases: ["Socrates"],
        appearances: [
          {
            dialogue: "crito",
            editorialStatus: "resolved",
            performanceRole: "voice-owner",
            roleFlags: ["source-speaker"],
            sourceLabels: ["Socrates"],
            sourceAliases: ["Socrates"],
            sourceAttributions: ["#Socrates"],
          },
        ],
      },
    ],
    ...overrides,
  } as CharacterCatalog;
}

function voiceOwnerAndReportedCatalog(): CharacterCatalog {
  const catalog = structuredClone(characterCatalog());
  catalog.dialogues[0]!.characterIds = ["dream-woman", "socrates"];
  catalog.characters[0]!.identityStatus = "resolved";
  catalog.characters[0]!.appearances[0]!.editorialStatus = "resolved";
  catalog.characters.push({
    characterId: "dream-woman",
    displayName: "Dream Woman",
    identityStatus: "editorial-required",
    aliases: ["Dream Woman"],
    appearances: [
      {
        dialogue: "crito",
        editorialStatus: "required",
        performanceRole: "reported-only",
        roleFlags: ["dream-figure", "reported-speaker"],
        sourceLabels: [],
        sourceAliases: [],
        sourceAttributions: [],
        editorialNote: "The dream quotation remains in Socrates' active voice.",
      },
    ],
  });
  return catalog;
}

function selectedVoice(overrides: Record<string, unknown> = {}) {
  return {
    characterId: "socrates",
    displayName: "Socrates",
    status: "selected",
    engine: "dots.tts-soar",
    model: {
      repository: "rednote-hilab/dots.tts-soar",
      revision: "e3520f75254d0020a0406db31c51a79d00d22d55",
    },
    mode: "continuation-voice-cloning",
    seed: 44,
    reference: {
      sourceUrl: "https://www.youtube.com/watch?v=MNDfJMrH1XY",
      sourceRegistryPath: "audio/reference-sources.json",
      sourceRegistrySha256: HASH,
      sourceDialogue: "crito",
      sourceVideoId: "MNDfJMrH1XY",
      sourceCharacterId: "socrates",
      videoStartSeconds: 65.48,
      videoEndSeconds: 71.78,
      localDurationSeconds: 6.29,
      localSha256: HASH,
      promptText: "Why, Crito?",
      referenceAsr: {
        decision: "primary-zero-error",
        primaryExpectedWords: 8,
        primaryOrdinaryWordErrors: 0,
        primaryOrdinaryWordErrorRate: 0,
        primaryEvidencePath: "scratch/evidence/socrates-reference-asr.json",
        primaryEvidenceSha256: HASH,
      },
      speakerPurityEvidencePath: "scratch/evidence/socrates-purity.json",
      speakerPurityEvidenceSha256: HASH,
      speakerPurityProofRecordId: "existing-socrates-selection",
      speakerPuritySourceAgreementSha256: HASH,
      speakerPurityMethod: "jowett-caption-turn-alignment-v1",
      dominantSpeakerCoverage: 1,
      competingSpeakerCoverage: 0,
      uncoveredSpeakerCoverage: 0,
    },
    generation: {
      numSteps: 24,
      guidanceScale: 1.2,
      speakerScale: 1.5,
      language: "EN",
      precision: "bfloat16",
    },
    audition: {
      relativePath: "scratch/crito-audio/socrates.wav",
      sha256: HASH,
      durationSeconds: 20,
      expectedWords: 71,
      ordinaryWordErrors: 0,
      ordinaryWordErrorRate: 0,
      asrEvidencePath: "scratch/evidence/socrates-asr.json",
      asrEvidenceSha256: HASH,
      meanSpeakerCosineSimilarity: 0.89,
      minimumWindowSpeakerCosineSimilarity: 0.86,
      acousticEvidencePath: "scratch/evidence/socrates-acoustic.json",
      acousticEvidenceSha256: HASH,
      clippedSamples: 0,
      truePeakDbtp: -0.1,
      peakAmplitude: 0.95,
    },
    selection: {
      basis: "operator-authorized-deterministic-gates",
      policy: "cast-auto-accept-v1",
      acceptedAt: "2026-07-12",
      label: "dots-youtube-socrates-seed44",
      allGatesPassed: true,
      candidateSelection: "highest-ranked-passing",
      evaluatedCandidateCount: 1,
      passingCandidateCount: 1,
      selectedRank: 1,
      decisionPath: "audio/cast-decisions/socrates.json",
      decisionSha256: HASH,
      sourceAssignment: {
        kind: "same-character",
        authorizedBy: "operator",
        reason: "The source character matches the voice owner.",
      },
    },
    ...overrides,
  };
}

function castCatalog(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 3,
    status: "partial",
    updatedAt: "2026-07-12",
    enginePolicy: {
      defaultEngine: "dots.tts-soar",
      exceptionsRequireRecordedQaFailure: true,
      implicitFallbackVoice: false,
      voiceOwnership: "one-voice-per-character",
      reportedSpeech: "inherit-active-character",
      acceptancePolicy: "operator-authorized-deterministic-v1",
      manualListeningRequired: false,
      acceptanceGates: CAST_ACCEPTANCE_GATES,
    },
    voices: [selectedVoice()],
    ...overrides,
  };
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function materializeDecision(root: string, voice: ReturnType<typeof selectedVoice>) {
  const core = {
    schemaVersion: 1,
    status: "accepted-deterministic-cast-decision",
    policy: "cast-auto-accept-v1",
    acceptedAt: voice.selection.acceptedAt,
    characterId: voice.characterId,
    sourceCharacterId: voice.reference.sourceCharacterId,
    candidateSelection: voice.selection.candidateSelection,
    rankingPolicy: "fixture-ranking",
    inputs: {},
    reference: voice.reference,
    gates: CAST_ACCEPTANCE_GATES,
    candidates: [],
    selectedSeed: voice.seed,
    selectedPassingRank: voice.selection.selectedRank,
  };
  const decision = {
    ...core,
    decisionContentSha256: createHash("sha256").update(canonicalJson(core)).digest("hex"),
  };
  const content = JSON.stringify(decision);
  const decisionPath = join(root, voice.selection.decisionPath);
  mkdirSync(join(root, "audio/cast-decisions"), { recursive: true });
  writeFileSync(decisionPath, content, "utf8");
  voice.selection.decisionSha256 = createHash("sha256").update(content).digest("hex");
}

function issueCodes(issues: ReturnType<typeof validateCharacterCatalog>) {
  return issues.map((issue) => issue.code);
}

describe("canonical audio character and cast catalogs", () => {
  let root = "";
  let restoreRepoRoot: (() => void) | undefined;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "audio-catalog-"));
    restoreRepoRoot = setRepoRootForTesting(root);
  });

  afterEach(() => {
    restoreRepoRoot?.();
    rmSync(root, { recursive: true, force: true });
  });

  it("parses strict typed character and cast catalogs", () => {
    const characters = parseCharacterCatalog(CHARACTER_PATH, JSON.stringify(characterCatalog()));
    const cast = parseCastCatalog(CAST_PATH, JSON.stringify(castCatalog()), characters);

    expect(characters.characters[0]?.characterId).toBe("socrates");
    expect(cast.voices[0]).toMatchObject({ characterId: "socrates", seed: 44 });
  });

  it("builds a deliberately incomplete census bootstrap with stable recurring identities", () => {
    const census = {
      dialogues: [
        {
          dialogue: "charmides",
          counts: { participants: 1, said_elements: 2, anomaly_records: 1 },
          participants: [{ labels: [{ raw_label: "Socrates" }] }],
          said_attributions: [{ raw_who: "#Socrates" }, { raw_who: "#Σωκράτης" }],
        },
        {
          dialogue: "crito",
          counts: { participants: 1, said_elements: 1, anomaly_records: 0 },
          participants: [{ labels: [{ raw_label: "Socrates" }] }],
          said_attributions: [{ raw_who: "#Socrates" }],
        },
      ],
    };

    const built = buildCharacterCatalogFromSpeakerCensus(JSON.stringify(census), "2026-07-12");

    expect(built.status).toBe("partial");
    expect(built.schemaVersion).toBe(3);
    expect(built.dialogues.every((dialogue) => dialogue.editorialStatus === "required")).toBe(true);
    expect(built.characters.map((character) => character.characterId)).toEqual([
      "commentary-narrator",
      "dream-woman",
      "laws-of-athens",
      "socrates",
    ]);
    const socrates = built.characters.find((character) => character.characterId === "socrates");
    expect(socrates).toMatchObject({
      characterId: "socrates",
      identityStatus: "editorial-required",
      aliases: ["Socrates", "Σωκράτης"],
    });
    expect(socrates?.appearances.map((appearance) => appearance.dialogue)).toEqual([
      "charmides",
      "crito",
    ]);
    expect(socrates?.appearances.every((appearance) => appearance.roleFlags[0] === "source-speaker")).toBe(true);
    expect(socrates?.appearances.every((appearance) => appearance.performanceRole === "review-required")).toBe(
      true,
    );
    expect(built.characters.find((character) => character.characterId === "commentary-narrator")).toMatchObject({
      aliases: ["Announcer", "Commentary Narrator", "Commentator"],
    });
    expect(built.dialogues.find((dialogue) => dialogue.dialogue === "crito")?.characterIds).toEqual([
      "commentary-narrator",
      "dream-woman",
      "laws-of-athens",
      "socrates",
    ]);
    expect(voiceOwnerCharacterIdsForDialogue(built, "crito")).toEqual(["commentary-narrator"]);
    expect(reportedOnlyCharacterIdsForDialogue(built, "crito")).toEqual(["dream-woman", "laws-of-athens"]);
    expect(reviewRequiredVoiceCharacterIdsForDialogue(built, "crito")).toEqual(["socrates"]);
  });

  it("reconciles narrator-owned reported speech while preserving Meletus as a direct speaker", () => {
    const preliminaryAppearances = [
      ["apology", "meletus"],
      ["euthydemus", "cleinias"],
      ["euthydemus", "ctesippus"],
      ["euthydemus", "dionysodorus"],
      ["euthydemus", "euthydemus"],
      ["lysis", "ctesippus"],
      ["lysis", "hippothales"],
      ["lysis", "lysis"],
      ["lysis", "lysis-and-menexenus"],
      ["lysis", "menexenus"],
      ["parmenides", "adeimantus"],
      ["protagoras", "alcibiades"],
      ["protagoras", "callias"],
      ["protagoras", "critias"],
      ["protagoras", "hippias"],
      ["protagoras", "hippocrates"],
      ["protagoras", "prodicus"],
      ["protagoras", "protagoras"],
    ] as const;
    const charactersById = new Map<string, CharacterCatalog["characters"][number]>();
    const addSourceAppearance = (dialogue: string, characterId: string) => {
      const displayName = characterId
        .split("-")
        .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
        .join(" ");
      const character = charactersById.get(characterId) ?? {
        characterId,
        displayName,
        identityStatus: "resolved" as const,
        aliases: [displayName],
        appearances: [],
      };
      if (character.appearances.some((appearance) => appearance.dialogue === dialogue)) return;
      character.appearances.push({
        dialogue,
        editorialStatus: "resolved",
        performanceRole: "voice-owner",
        roleFlags:
          characterId === "lysis-and-menexenus" ? ["source-speaker", "collective"] : ["source-speaker"],
        sourceLabels: [displayName],
        sourceAliases: [displayName],
        sourceAttributions: [`#${displayName}`],
        ...(characterId === "lysis-and-menexenus" ? { editorialNote: "Joint source attribution." } : {}),
      });
      charactersById.set(characterId, character);
    };
    for (const [dialogue, characterId] of preliminaryAppearances) {
      addSourceAppearance(dialogue, characterId);
    }
    for (const [dialogue, characterId] of [
      ["euthydemus", "socrates"],
      ["lysis", "socrates"],
      ["parmenides", "cephalus-of-clazomenae"],
      ["protagoras", "socrates"],
    ] as const) {
      addSourceAppearance(dialogue, characterId);
    }
    const dialogueIds = [...new Set(preliminaryAppearances.map(([dialogue]) => dialogue))];
    const catalog = characterCatalog({
      status: "complete",
      dialogues: dialogueIds.map((dialogue) => ({
        dialogue,
        editorialStatus: "resolved",
        sourceParticipantCount: [...charactersById.values()].filter((character) =>
          character.appearances.some((appearance) => appearance.dialogue === dialogue),
        ).length,
        sourceSaidElementCount: 1,
        sourceAnomalyCount: 0,
        characterIds: [...charactersById.values()]
          .filter((character) => character.appearances.some((appearance) => appearance.dialogue === dialogue))
          .map((character) => character.characterId)
          .sort((left, right) => left.localeCompare(right)),
      })),
      characters: [...charactersById.values()].map((character) => ({
        ...character,
        appearances: character.appearances.sort((left, right) => left.dialogue.localeCompare(right.dialogue)),
      })),
    });

    const reconciled = applyAcceptedActiveSpeakerPolicy(catalog);
    const policyKeys = new Set(
      preliminaryAppearances.map(([dialogue, characterId]) => `${dialogue}/${characterId}`),
    );
    const resolvedAppearances = reconciled.characters
      .flatMap((character) =>
        character.appearances.map((appearance) => ({
          key: `${appearance.dialogue}/${character.characterId}`,
          appearance,
        })),
      )
      .filter(({ key }) => policyKeys.has(key))
      .sort((left, right) => left.key.localeCompare(right.key));
    const meletus = resolvedAppearances.find(({ key }) => key === "apology/meletus")?.appearance;
    const reported = resolvedAppearances.filter(({ key }) => key !== "apology/meletus");

    expect(meletus).toMatchObject({
      performanceRole: "voice-owner",
      roleFlags: ["source-speaker"],
    });
    expect(meletus?.editorialNote).toBeUndefined();
    expect(reported.map(({ key }) => key)).toEqual(
      preliminaryAppearances
        .map(([dialogue, characterId]) => `${dialogue}/${characterId}`)
        .filter((key) => key !== "apology/meletus")
        .sort((left, right) => left.localeCompare(right)),
    );
    expect(reported.every(({ appearance }) => appearance.performanceRole === "reported-only")).toBe(true);
    expect(reported.every(({ appearance }) => appearance.roleFlags.includes("reported-speaker"))).toBe(true);
    expect(reported.every(({ appearance }) => appearance.editorialNote?.includes("inherit"))).toBe(true);
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(reconciled))).toEqual([]);

    const census = {
      dialogues: reconciled.dialogues.map((roster) => {
        const appearances = reconciled.characters.flatMap((character) =>
          character.appearances.filter((appearance) => appearance.dialogue === roster.dialogue),
        );
        return {
          dialogue: roster.dialogue,
          counts: {
            participants: roster.sourceParticipantCount,
            said_elements: roster.sourceSaidElementCount,
            anomaly_records: roster.sourceAnomalyCount,
          },
          participants: appearances.flatMap((appearance) =>
            appearance.sourceLabels.map((raw_label) => ({ labels: [{ raw_label }] })),
          ),
          said_attributions: appearances.flatMap((appearance) =>
            appearance.sourceAttributions.map((raw_who) => ({ raw_who })),
          ),
        };
      }),
    };
    const censusContent = JSON.stringify(census);
    reconciled.source.sha256 = createHash("sha256").update(censusContent).digest("hex");
    mkdirSync(join(root, "audio"), { recursive: true });
    writeFileSync(join(root, "audio/english-tei-speaker-census.json"), censusContent, "utf8");
    expect(validateAuthoritativeCharacterCatalog(CHARACTER_PATH, JSON.stringify(reconciled))).toEqual([]);

    const meletusDowngrade = structuredClone(reconciled);
    const downgradedMeletus = meletusDowngrade.characters
      .find((character) => character.characterId === "meletus")
      ?.appearances.find((appearance) => appearance.dialogue === "apology");
    if (!downgradedMeletus) throw new Error("Meletus fixture appearance missing");
    downgradedMeletus.performanceRole = "reported-only";
    downgradedMeletus.roleFlags.push("reported-speaker");
    downgradedMeletus.editorialNote = "Schema-valid malicious downgrade intended to make Meletus prunable.";
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(meletusDowngrade))).toEqual([]);
    expect(
      issueCodes(validateAuthoritativeCharacterCatalog(CHARACTER_PATH, JSON.stringify(meletusDowngrade))),
    ).toContain("invalid_editorial_evidence");

    const missingSocrates = structuredClone(catalog);
    missingSocrates.characters = missingSocrates.characters.filter(
      (character) => character.characterId !== "socrates",
    );
    for (const dialogue of missingSocrates.dialogues) {
      dialogue.characterIds = dialogue.characterIds.filter((characterId) => characterId !== "socrates");
    }
    expect(() => applyAcceptedActiveSpeakerPolicy(missingSocrates)).toThrow(
      "requires euthydemus/socrates to be a resolved voice-owner",
    );

    const missingPolicyAppearance = structuredClone(catalog);
    missingPolicyAppearance.characters = missingPolicyAppearance.characters.filter(
      (character) => character.characterId !== "protagoras",
    );
    const protagorasRoster = missingPolicyAppearance.dialogues.find(
      (dialogue) => dialogue.dialogue === "protagoras",
    );
    if (!protagorasRoster) throw new Error("Protagoras fixture roster missing");
    protagorasRoster.characterIds = protagorasRoster.characterIds.filter(
      (characterId) => characterId !== "protagoras",
    );
    expect(() => applyAcceptedActiveSpeakerPolicy(missingPolicyAppearance)).toThrow(
      "missing accepted active-speaker appearances: protagoras/protagoras",
    );
  });

  it("hard-cuts character schema v2 and cast schema v2 while requiring deterministic acceptance", () => {
    const legacy = { ...characterCatalog(), schemaVersion: 2 };
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(legacy)))).toContain(
      "invalid_schema_version",
    );

    const legacyCast = { ...castCatalog(), schemaVersion: 2 };
    expect(issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(legacyCast), characterCatalog()))).toContain(
      "invalid_schema_version",
    );

    const legacyPolicy = structuredClone(castCatalog());
    delete (legacyPolicy.enginePolicy as Partial<typeof legacyPolicy.enginePolicy>).voiceOwnership;
    expect(issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(legacyPolicy), characterCatalog()))).toContain(
      "invalid_engine_policy",
    );

    const listeningPolicy = structuredClone(castCatalog());
    listeningPolicy.enginePolicy.manualListeningRequired = true;
    expect(issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(listeningPolicy), characterCatalog()))).toContain(
      "invalid_engine_policy",
    );

    const listeningSelection = selectedVoice();
    listeningSelection.selection.basis = "human-listening" as never;
    expect(
      issueCodes(
        validateCastCatalog(
          CAST_PATH,
          JSON.stringify(castCatalog({ voices: [listeningSelection] })),
          characterCatalog(),
        ),
      ),
    ).toContain("invalid_dots_voice");

    const missingPerformanceRole = structuredClone(characterCatalog());
    delete (
      missingPerformanceRole.characters[0]!.appearances[0] as Partial<{ performanceRole: string }>
    ).performanceRole;
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(missingPerformanceRole)))).toContain(
      "invalid_shape",
    );
  });

  it("requires performance roles to agree with source, commentary, and reported-speech evidence", () => {
    const reviewRequired = structuredClone(characterCatalog());
    reviewRequired.characters[0]!.appearances[0]!.performanceRole = "review-required";
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(reviewRequired))).toEqual([]);

    const missingFlags = structuredClone(characterCatalog());
    delete (missingFlags.characters[0]!.appearances[0] as Partial<{ roleFlags: string[] }>).roleFlags;
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(missingFlags)))).toContain("invalid_shape");

    const unsupported = structuredClone(characterCatalog());
    unsupported.characters[0]!.appearances[0]!.roleFlags = ["invented-role" as never];
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(unsupported)))).toContain(
      "invalid_role_flags",
    );

    const productionRole = structuredClone(characterCatalog());
    const appearance = productionRole.characters[0]!.appearances[0]!;
    appearance.roleFlags = ["commentary-narrator"];
    appearance.performanceRole = "voice-owner";
    appearance.sourceLabels = [];
    appearance.sourceAliases = [];
    appearance.sourceAttributions = [];
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(productionRole)))).toContain(
      "invalid_editorial_evidence",
    );
    appearance.editorialNote = "Explicit edition-role evidence.";
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(productionRole))).toEqual([]);

    const dreamWithoutReportedSpeech = structuredClone(productionRole);
    dreamWithoutReportedSpeech.characters[0]!.appearances[0]!.roleFlags = ["dream-figure"];
    dreamWithoutReportedSpeech.characters[0]!.appearances[0]!.performanceRole = "reported-only";
    expect(
      issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(dreamWithoutReportedSpeech))),
    ).toContain("invalid_role_flags");

    const mixedNarrator = structuredClone(characterCatalog());
    mixedNarrator.characters[0]!.appearances[0]!.roleFlags = ["source-speaker", "commentary-narrator"];
    mixedNarrator.characters[0]!.appearances[0]!.editorialNote = "Invalid mixed role.";
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(mixedNarrator)))).toContain(
      "invalid_role_flags",
    );

    const reportedAsVoiceOwner = structuredClone(productionRole);
    reportedAsVoiceOwner.characters[0]!.appearances[0]!.roleFlags = ["reported-speaker"];
    reportedAsVoiceOwner.characters[0]!.appearances[0]!.performanceRole = "voice-owner";
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(reportedAsVoiceOwner)))).toContain(
      "invalid_role_flags",
    );

    const commentaryAsReported = structuredClone(productionRole);
    commentaryAsReported.characters[0]!.appearances[0]!.performanceRole = "reported-only";
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(commentaryAsReported)))).toContain(
      "invalid_role_flags",
    );

    const commentaryUnderReview = structuredClone(productionRole);
    commentaryUnderReview.characters[0]!.appearances[0]!.performanceRole = "review-required";
    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(commentaryUnderReview)))).toContain(
      "invalid_role_flags",
    );
  });

  it("rejects duplicate ids, aliases, appearances, and roster drift", () => {
    const base = characterCatalog();
    const duplicate = structuredClone(base.characters[0]!);
    duplicate.displayName = "Socrates Again";
    duplicate.aliases = ["Socrates Again"];
    duplicate.appearances = [structuredClone(duplicate.appearances[0]!), structuredClone(duplicate.appearances[0]!)];
    const aliasCollision = structuredClone(base.characters[0]!);
    aliasCollision.characterId = "another-socrates";
    aliasCollision.displayName = "Another Socrates";
    aliasCollision.aliases = ["Another Socrates", "sOcRaTeS"];
    const content = JSON.stringify({
      ...base,
      dialogues: [{ ...base.dialogues[0], characterIds: [] }],
      characters: [...base.characters, duplicate, aliasCollision],
    });

    const codes = issueCodes(validateCharacterCatalog(CHARACTER_PATH, content));
    expect(codes).toContain("duplicate_character_id");
    expect(codes).toContain("duplicate_alias");
    expect(codes).toContain("duplicate_appearance");
    expect(codes).toContain("roster_appearance_mismatch");
  });

  it("does not allow unresolved editorial work to claim a complete roster", () => {
    const content = JSON.stringify(characterCatalog({ status: "complete" }));

    expect(issueCodes(validateCharacterCatalog(CHARACTER_PATH, content))).toContain("invalid_completeness_claim");
  });

  it("requires exact Dots model, reference, hash, seed, and QA fields", () => {
    const voice = selectedVoice();
    const invalidVoice = {
      ...voice,
      seed: undefined,
      model: { repository: voice.model.repository },
      reference: { ...voice.reference, localSha256: "bad" },
    };

    const codes = issueCodes(
      validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [invalidVoice] })), characterCatalog()),
    );
    expect(codes).toContain("invalid_dots_voice");
  });

  it("requires every deterministic acceptance gate to pass conjunctively", () => {
    const cases = [
      selectedVoice({
        reference: { ...selectedVoice().reference, dominantSpeakerCoverage: 0.94, uncoveredSpeakerCoverage: 0.06 },
      }),
      selectedVoice({ audition: { ...selectedVoice().audition, ordinaryWordErrors: 1, ordinaryWordErrorRate: 1 / 71 } }),
      selectedVoice({ audition: { ...selectedVoice().audition, meanSpeakerCosineSimilarity: 0.84 } }),
      selectedVoice({ audition: { ...selectedVoice().audition, clippedSamples: 1 } }),
      selectedVoice({ audition: { ...selectedVoice().audition, durationSeconds: 7 } }),
      selectedVoice({ reference: { ...selectedVoice().reference, videoEndSeconds: 72 } }),
    ];
    for (const voice of cases) {
      expect(
        issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [voice] })), characterCatalog())),
      ).toContain("failed_cast_acceptance_gate");
    }
    const falsePrimaryExactClaim = selectedVoice({
      reference: {
        ...selectedVoice().reference,
        referenceAsr: {
          ...selectedVoice().reference.referenceAsr,
          primaryOrdinaryWordErrors: 1,
          primaryOrdinaryWordErrorRate: 0.125,
        },
      },
    });
    expect(
      issueCodes(
        validateCastCatalog(
          CAST_PATH,
          JSON.stringify(castCatalog({ voices: [falsePrimaryExactClaim] })),
          characterCatalog(),
        ),
      ),
    ).toContain("invalid_dots_voice");
  });

  it("binds source provenance to a canonical character appearance and registered YouTube id", () => {
    const wrongVideo = selectedVoice({
      reference: { ...selectedVoice().reference, sourceVideoId: "Y7gKpAFDuto" },
    });
    expect(
      issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [wrongVideo] })), characterCatalog())),
    ).toContain("invalid_dots_voice");

    const wrongDialogue = selectedVoice({
      reference: { ...selectedVoice().reference, sourceDialogue: "symposium" },
    });
    expect(
      issueCodes(
        validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [wrongDialogue] })), characterCatalog()),
      ),
    ).toContain("invalid_source_provenance");
  });

  it("allows a cross-dialogue source performer for a resolved global voice owner", () => {
    const characters = characterCatalog();
    characters.dialogues.push({
      dialogue: "euthydemus",
      editorialStatus: "resolved",
      sourceParticipantCount: 1,
      sourceSaidElementCount: 1,
      sourceAnomalyCount: 0,
      characterIds: ["cleinias"],
    });
    characters.characters.push({
      characterId: "cleinias",
      displayName: "Cleinias",
      identityStatus: "resolved",
      aliases: ["Cleinias"],
      appearances: [
        {
          dialogue: "euthydemus",
          editorialStatus: "resolved",
          performanceRole: "voice-owner",
          roleFlags: ["source-speaker"],
          sourceLabels: ["Cleinias"],
          sourceAliases: ["Cleinias"],
          sourceAttributions: ["#Cleinias"],
        },
      ],
    });
    const voice = selectedVoice({
      reference: {
        ...selectedVoice().reference,
        sourceDialogue: "euthydemus",
        sourceCharacterId: "cleinias",
      },
      selection: {
        ...selectedVoice().selection,
        sourceAssignment: {
          kind: "voice-source-reassignment",
          authorizedBy: "operator",
          reason: "Reuse this explicitly authorized source performance.",
        },
      },
    });

    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(characters))).toEqual([]);
    expect(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [voice] })), characters)).toEqual([]);
  });

  it("rejects a missing reassignment source and a target that is not globally resolved", () => {
    const characters = characterCatalog();
    characters.dialogues.push({
      dialogue: "euthydemus",
      editorialStatus: "resolved",
      sourceParticipantCount: 0,
      sourceSaidElementCount: 0,
      sourceAnomalyCount: 0,
      characterIds: [],
    });
    const reassigned = selectedVoice({
      reference: {
        ...selectedVoice().reference,
        sourceDialogue: "euthydemus",
        sourceCharacterId: "missing-source",
      },
      selection: {
        ...selectedVoice().selection,
        sourceAssignment: {
          kind: "voice-source-reassignment",
          authorizedBy: "operator",
          reason: "Reuse this explicitly authorized source performance.",
        },
      },
    });
    expect(
      issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [reassigned] })), characters)),
    ).toContain("invalid_source_provenance");

    const unresolvedTarget = structuredClone(characters);
    unresolvedTarget.characters[0]!.identityStatus = "editorial-required";
    expect(
      issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog()), unresolvedTarget)),
    ).toContain("cast_character_mismatch");
  });

  it("allows a strict optional local reference path but rejects path escape", () => {
    const valid = selectedVoice({
      reference: { ...selectedVoice().reference, relativePath: "scratch/references/socrates.wav" },
    });
    expect(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [valid] })), characterCatalog())).toEqual(
      [],
    );

    const invalid = selectedVoice({ reference: { ...selectedVoice().reference, relativePath: "../outside.wav" } });
    expect(
      issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [invalid] })), characterCatalog())),
    ).toContain("invalid_reference_path");
  });

  it("forbids implicit fallback, duplicate voices, and unregistered character ids", () => {
    const policy = { ...castCatalog().enginePolicy, implicitFallbackVoice: true };
    const unknownVoice = selectedVoice({
      characterId: "unregistered",
      reference: { ...selectedVoice().reference, sourceCharacterId: "unregistered" },
    });
    const content = JSON.stringify(castCatalog({ enginePolicy: policy, voices: [unknownVoice, unknownVoice] }));
    const codes = issueCodes(validateCastCatalog(CAST_PATH, content, characterCatalog()));

    expect(codes).toContain("implicit_fallback");
    expect(codes).toContain("duplicate_voice");
    expect(codes).toContain("missing_character");
  });

  it("selects voices only for characters that own a voice in at least one dialogue", () => {
    const characters = voiceOwnerAndReportedCatalog();
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(characters))).toEqual([]);

    const dreamVoice = selectedVoice({
      characterId: "dream-woman",
      displayName: "Dream Woman",
      reference: { ...selectedVoice().reference, sourceCharacterId: "dream-woman" },
    });
    expect(
      issueCodes(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [dreamVoice] })), characters)),
    ).toContain("cast_character_mismatch");

    const globallyOwned = structuredClone(characters);
    globallyOwned.characters[1]!.identityStatus = "resolved";
    globallyOwned.dialogues.push({
      dialogue: "apology",
      editorialStatus: "required",
      sourceParticipantCount: 1,
      sourceSaidElementCount: 1,
      sourceAnomalyCount: 0,
      characterIds: ["dream-woman"],
    });
    globallyOwned.characters[1]!.appearances.push({
      dialogue: "apology",
      editorialStatus: "resolved",
      performanceRole: "voice-owner",
      roleFlags: ["source-speaker"],
      sourceLabels: ["Dream Woman"],
      sourceAliases: ["Dream Woman"],
      sourceAttributions: ["#Dream Woman"],
    });
    expect(validateCharacterCatalog(CHARACTER_PATH, JSON.stringify(globallyOwned))).toEqual([]);
    expect(
      validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ voices: [dreamVoice] })), globallyOwned),
    ).toEqual([]);
  });

  it("completes a cast from resolved voice owners while ignoring reported-only editorial closure", () => {
    const characters = voiceOwnerAndReportedCatalog();
    expect(validateCastCatalog(CAST_PATH, JSON.stringify(castCatalog({ status: "complete" })), characters)).toEqual(
      [],
    );

    const missingVoice = validateCastCatalog(
      CAST_PATH,
      JSON.stringify(castCatalog({ status: "complete", voices: [] })),
      characters,
    );
    expect(issueCodes(missingVoice)).toContain("invalid_completeness_claim");

    const unresolvedIdentity = structuredClone(characters);
    unresolvedIdentity.characters[0]!.identityStatus = "editorial-required";
    expect(
      issueCodes(
        validateCastCatalog(
          CAST_PATH,
          JSON.stringify(castCatalog({ status: "complete" })),
          unresolvedIdentity,
        ),
      ),
    ).toContain("invalid_completeness_claim");

    const unresolvedAppearance = structuredClone(characters);
    unresolvedAppearance.characters[0]!.appearances[0]!.editorialStatus = "required";
    expect(
      issueCodes(
        validateCastCatalog(
          CAST_PATH,
          JSON.stringify(castCatalog({ status: "complete" })),
          unresolvedAppearance,
        ),
      ),
    ).toContain("invalid_completeness_claim");

    const ownershipReview = structuredClone(characters);
    ownershipReview.dialogues[0]!.characterIds.push("crito");
    ownershipReview.characters.push({
      characterId: "crito",
      displayName: "Crito",
      identityStatus: "editorial-required",
      aliases: ["Crito"],
      appearances: [
        {
          dialogue: "crito",
          editorialStatus: "required",
          performanceRole: "review-required",
          roleFlags: ["source-speaker"],
          sourceLabels: ["Crito"],
          sourceAliases: ["Crito"],
          sourceAttributions: ["#Crito"],
        },
      ],
    });
    expect(
      issueCodes(
        validateCastCatalog(
          CAST_PATH,
          JSON.stringify(castCatalog({ status: "complete" })),
          ownershipReview,
        ),
      ),
    ).toContain("invalid_completeness_claim");
  });

  it("validates optional on-disk catalogs against the pinned census hash and evidence", () => {
    expect(validateAudioCatalogArtifacts()).toEqual([]);
    mkdirSync(join(root, "audio"), { recursive: true });
    const census = {
      dialogues: [
        {
          dialogue: "crito",
          counts: { participants: 1, said_elements: 1, anomaly_records: 0 },
          participants: [{ labels: [{ raw_label: "Socrates" }] }],
          said_attributions: [{ raw_who: "#Socrates" }],
        },
      ],
    };
    const censusContent = JSON.stringify(census);
    const catalog = characterCatalog({
      source: {
        path: "audio/english-tei-speaker-census.json",
        sha256: createHash("sha256").update(censusContent).digest("hex"),
      },
    });
    const referenceSources = JSON.stringify({
      dialogues: [
        {
          dialogue: "crito",
          videos: [
            {
              videoId: "MNDfJMrH1XY",
              durationSeconds: 2014,
              url: "https://www.youtube.com/watch?v=MNDfJMrH1XY",
            },
          ],
        },
      ],
    });
    const castValue = castCatalog();
    castValue.voices[0]!.reference.sourceRegistrySha256 = createHash("sha256")
      .update(referenceSources)
      .digest("hex");
    materializeDecision(root, castValue.voices[0]!);
    writeFileSync(join(root, "audio/english-tei-speaker-census.json"), censusContent, "utf8");
    writeFileSync(join(root, "audio/reference-sources.json"), referenceSources, "utf8");
    writeFileSync(join(root, CHARACTER_PATH), JSON.stringify(catalog), "utf8");
    writeFileSync(join(root, CAST_PATH), JSON.stringify(castValue), "utf8");
    expect(validateAudioCatalogArtifacts()).toEqual([]);
    expect(validateAuthoritativeCharacterCatalog(CHARACTER_PATH, JSON.stringify(catalog))).toEqual([]);

    writeFileSync(join(root, "audio/english-tei-speaker-census.json"), `${censusContent}\n`, "utf8");
    expect(
      issueCodes(validateAuthoritativeCharacterCatalog(CHARACTER_PATH, JSON.stringify(catalog))),
    ).toContain("source_hash_mismatch");
    writeFileSync(join(root, "audio/english-tei-speaker-census.json"), censusContent, "utf8");

    catalog.dialogues[0]!.sourceSaidElementCount = 2;
    writeFileSync(join(root, CHARACTER_PATH), JSON.stringify(catalog), "utf8");
    expect(issueCodes(validateAudioCatalogArtifacts())).toContain("source_census_mismatch");
  });

  it("preserves excluded source participants without casting or false aliases", () => {
    mkdirSync(join(root, "audio"), { recursive: true });
    const census = {
      dialogues: [
        {
          dialogue: "crito",
          counts: { participants: 2, said_elements: 1, anomaly_records: 0 },
          participants: [
            { labels: [{ raw_label: "Socrates" }] },
            { labels: [{ raw_label: "Silent Witness" }] },
          ],
          said_attributions: [{ raw_who: "#Socrates" }],
        },
      ],
    };
    const censusContent = JSON.stringify(census);
    const catalog = characterCatalog({
      source: {
        path: "audio/english-tei-speaker-census.json",
        sha256: createHash("sha256").update(censusContent).digest("hex"),
      },
      dialogues: [
        {
          ...characterCatalog().dialogues[0],
          sourceParticipantCount: 2,
          excludedSourceLabels: [
            { value: "Silent Witness", reason: "Named in source metadata but has no attributable spoken line." },
          ],
        },
      ],
    });
    writeFileSync(join(root, "audio/english-tei-speaker-census.json"), censusContent, "utf8");
    writeFileSync(join(root, CHARACTER_PATH), JSON.stringify(catalog), "utf8");

    expect(validateAudioCatalogArtifacts()).toEqual([]);
    expect(catalog.characters[0]?.aliases).not.toContain("Silent Witness");

    const withoutExclusion = structuredClone(catalog);
    delete withoutExclusion.dialogues[0]!.excludedSourceLabels;
    writeFileSync(join(root, CHARACTER_PATH), JSON.stringify(withoutExclusion), "utf8");
    expect(issueCodes(validateAudioCatalogArtifacts())).toContain("source_census_mismatch");
  });
});
