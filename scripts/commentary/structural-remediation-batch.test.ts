import { describe, expect, it } from "bun:test";
import { planStructuralOperations } from "./structural-remediation-batch.js";

const brief = { commentaryIds: ["comm_fixture_0002", "comm_fixture_0001"] };

describe("structural remediation batch planning", () => {
  it("projects remove and rewrite findings into canonical ledger order", () => {
    const operations = planStructuralOperations(brief, {
      blocks: [
        {
          commentary_id: "comm_fixture_0001",
          disposition: "rewrite",
        },
        {
          commentary_id: "comm_fixture_0002",
          disposition: "remove",
        },
      ],
    } as never);
    expect(operations).toEqual([
      { operation: "remove", commentaryId: "comm_fixture_0002" },
      { operation: "remove", commentaryId: "comm_fixture_0001", rewriteResolution: "reject-original" },
    ]);
  });

  it("does not invent reanchors and ignores only pass findings", () => {
    const operations = planStructuralOperations(
      { commentaryIds: ["comm_fixture_0001", "comm_fixture_0002", "comm_fixture_0003"] },
      {
        blocks: [
          { commentary_id: "comm_fixture_0001", disposition: "pass" },
          { commentary_id: "comm_fixture_0002", disposition: "rewrite" },
          { commentary_id: "comm_fixture_0003", disposition: "remove" },
        ],
      } as never,
    );
    expect(operations).toEqual([
      { operation: "remove", commentaryId: "comm_fixture_0002", rewriteResolution: "reject-original" },
      { operation: "remove", commentaryId: "comm_fixture_0003" },
    ]);
    expect(operations.every((operation) => operation.operation === "remove")).toBe(true);
  });

  it("fails closed on split findings instead of inventing a resolution", () => {
    expect(() => planStructuralOperations(
      { commentaryIds: ["comm_fixture_0001"] },
      { blocks: [{ commentary_id: "comm_fixture_0001", disposition: "split" }] } as never,
    )).toThrow("refuses split finding");
  });

  it("fails closed when a current unit audit omits a ledger ID", () => {
    expect(() => planStructuralOperations(
      { commentaryIds: ["comm_fixture_0001", "comm_fixture_0002"] },
      { blocks: [{ commentary_id: "comm_fixture_0001", disposition: "remove" }] } as never,
    )).toThrow("missing comm_fixture_0002");
  });
});
