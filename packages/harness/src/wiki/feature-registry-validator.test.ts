import { describe, expect, it } from "bun:test";
import {
  formatFeatureRegistryValidationError,
  validateFeatureRegistry,
  type FeatureRegistryValidationIssue,
} from "./feature-registry-validator.js";

const knownObservationIds = new Set(["obs_euthyphro_0001", "obs_euthyphro_0002", "obs_euthyphro_0003"]);

type TestValidationOptions = {
  mode?: "ingest" | "review";
  previousContent?: string;
};

function validate(
  content: string,
  observationFeatureIds = new Map([["obs_euthyphro_0001", "feature_candidate_001"]]),
  options: TestValidationOptions = {},
) {
  return validateFeatureRegistry(content, {
    knownObservationIds,
    observationFeatureIds,
    ...options,
  });
}

function issueCodes(issues: FeatureRegistryValidationIssue[]) {
  return issues.map((issue) => issue.code);
}

describe("validateFeatureRegistry", () => {
  it("accepts a complete registry file", () => {
    const issues = validate(`# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`);

    expect(issues).toEqual([]);
  });

  it("rejects duplicate proposed names and unknown observations", () => {
    const issues = validate(
      `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.

### feature_candidate_002
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_9999
- **notes:** Duplicate name with a stale observation.
`,
    );

    expect(issueCodes(issues)).toContain("duplicate_proposed_name");
    expect(issueCodes(issues)).toContain("unknown_observation");
  });

  it("scopes duplicate proposed names by family", () => {
    const issues = validate(
      `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.

### feature_candidate_002
- **family:** turn_geometry
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0002
- **notes:** Same subtype label under a different observation family.
`,
      new Map([
        ["obs_euthyphro_0001", "feature_candidate_001"],
        ["obs_euthyphro_0002", "feature_candidate_002"],
      ]),
    );

    expect(issues).toEqual([]);
  });

  it("rejects unnormalized registry family names when present", () => {
    const issues = validate(`# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** Dramatic Case Setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`);

    expect(issueCodes(issues)).toContain("invalid_family");
  });

  it("rejects stale empty placeholders after features exist", () => {
    const issues = validate(`# Features So Far

## Feature Candidates

None yet.

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`);

    expect(issueCodes(issues)).toContain("stale_empty_placeholder");
  });

  it("rejects observation feature ids missing from the registry", () => {
    const issues = validate(
      `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`,
      new Map([["obs_euthyphro_0002", "feature_candidate_002"]]),
    );

    expect(issueCodes(issues)).toContain("unknown_feature_reference");
    expect(formatFeatureRegistryValidationError(issues)).toContain("Feature registry rejected");
  });

  it("rejects registry observation links that point at the wrong feature id", () => {
    const issues = validate(
      `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0002
- **notes:** A speaker corrects another speaker's term.

### feature_candidate_002
- **family:** dramatic_case_setup
- **proposed_name:** accusation_stated
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A charge is stated.
`,
      new Map([
        ["obs_euthyphro_0001", "feature_candidate_001"],
        ["obs_euthyphro_0002", "feature_candidate_002"],
      ]),
    );

    expect(issueCodes(issues)).toContain("mismatched_feature_observation");
  });

  it("allows ingest to add observations to existing features and add new candidates", () => {
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`;
    const nextContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001, obs_euthyphro_0002
- **notes:** A speaker corrects another speaker's term.

### feature_candidate_002
- **family:** dramatic_case_setup
- **proposed_name:** civic_charge_before_definition
- **status:** candidate
- **observations:** obs_euthyphro_0003
- **notes:** A legal charge is established before a definition attempt.
`;

    const issues = validate(
      nextContent,
      new Map([
        ["obs_euthyphro_0001", "feature_candidate_001"],
        ["obs_euthyphro_0002", "feature_candidate_001"],
        ["obs_euthyphro_0003", "feature_candidate_002"],
      ]),
      {
        mode: "ingest",
        previousContent,
      },
    );

    expect(issues).toEqual([]);
  });

  it("rejects ingest edits to existing feature fields", () => {
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`;
    const nextContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** revised_term_correction
- **status:** accepted
- **observations:** obs_euthyphro_0001
- **notes:** Revised note.
`;

    const issues = validate(nextContent, new Map([["obs_euthyphro_0001", "feature_candidate_001"]]), {
      mode: "ingest",
      previousContent,
    });

    expect(issueCodes(issues)).toContain("mutated_existing_feature");
  });

  it("rejects ingest removal of existing feature observations", () => {
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001, obs_euthyphro_0002
- **notes:** A speaker corrects another speaker's term.
`;
    const nextContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`;

    const issues = validate(
      nextContent,
      new Map([
        ["obs_euthyphro_0001", "feature_candidate_001"],
        ["obs_euthyphro_0002", "feature_candidate_001"],
      ]),
      {
        mode: "ingest",
        previousContent,
      },
    );

    expect(issueCodes(issues)).toContain("removed_existing_observation");
  });

  it("rejects new ingest features that do not start as candidates", () => {
    const previousContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.
`;
    const nextContent = `# Features So Far

## Feature Candidates

### feature_candidate_001
- **family:** dramatic_case_setup
- **proposed_name:** term_correction
- **status:** candidate
- **observations:** obs_euthyphro_0001
- **notes:** A speaker corrects another speaker's term.

### feature_candidate_002
- **family:** dramatic_case_setup
- **proposed_name:** civic_charge_before_definition
- **status:** accepted
- **observations:** obs_euthyphro_0002
- **notes:** A legal charge is established before a definition attempt.
`;

    const issues = validate(
      nextContent,
      new Map([
        ["obs_euthyphro_0001", "feature_candidate_001"],
        ["obs_euthyphro_0002", "feature_candidate_002"],
      ]),
      {
        mode: "ingest",
        previousContent,
      },
    );

    expect(issueCodes(issues)).toContain("invalid_new_feature_status");
  });
});
