import { describe, expect, test } from "bun:test";
import { ruleAuditBoundariesSchema } from "./rule-audit-boundaries.schema.ts";

describe("ruleAuditBoundariesSchema", () => {
  test("turns table cells into boundaries", () => {
    const parsed = ruleAuditBoundariesSchema.safeParse({
      boundaries: [["boundary.ts", "nullable-union", "Pi value."]],
    });
    expect(parsed.success && parsed.data.boundaries).toEqual([
      { file: "boundary.ts", rule: "nullable-union", reason: "Pi value." },
    ]);
  });

  test("rejects rows with missing cells, empty cells, or unknown rules", () => {
    expect(ruleAuditBoundariesSchema.safeParse({ boundaries: [["boundary.ts", "nullable-union"]] }).success).toBe(
      false,
    );
    expect(ruleAuditBoundariesSchema.safeParse({ boundaries: [["boundary.ts", "nullable-union", ""]] }).success).toBe(
      false,
    );
    expect(ruleAuditBoundariesSchema.safeParse({ boundaries: [["boundary.ts", "made-up", "Reason."]] }).success).toBe(
      false,
    );
  });
});
