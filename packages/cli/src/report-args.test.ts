import { describe, expect, it } from "bun:test";
import { parseReportArgs, reportExitCode } from "./report-args.js";

describe("report arguments", () => {
  it("uses --target without colliding with provider --profile", () => {
    expect(parseReportArgs("completeness", ["--target", "corpus", "--allow-incomplete"]).target).toBe("corpus");
    expect(() => parseReportArgs("completeness", ["--profile", "corpus", "--target", "corpus"])).toThrow("Unknown report option");
  });

  it("rejects unknown targets, duplicates, and illegal mode pairs", () => {
    expect(() => parseReportArgs("completeness", ["--target", "unknown"])).toThrow("Unknown completeness target");
    expect(() => parseReportArgs("release", ["--target", "corpus"])).toThrow("Unknown release target");
    expect(() => parseReportArgs("completeness", ["--target", "corpus", "--target", "corpus"])).toThrow("Duplicate option");
    expect(() => parseReportArgs("completeness", ["--target", "corpus", "--write", "--json"])).toThrow("mutually exclusive");
  });

  it("accepts release inventory options only for release audit", () => {
    expect(parseReportArgs("release", ["--target", "knowledge-base", "--public-tree", "release/public", "--export-manifest", "release/private/manifest.json"])).toEqual(expect.objectContaining({ publicTree: "release/public", exportManifest: "release/private/manifest.json" }));
    expect(() => parseReportArgs("completeness", ["--target", "corpus", "--public-tree", "x"])).toThrow("release-audit options");
  });
});

describe("exit policy", () => {
  it("uses 0 for ready, 2 for incomplete, and changes only 2 with allow-incomplete", () => {
    expect(reportExitCode(true, false)).toBe(0);
    expect(reportExitCode(false, false)).toBe(2);
    expect(reportExitCode(false, true)).toBe(0);
  });
});

