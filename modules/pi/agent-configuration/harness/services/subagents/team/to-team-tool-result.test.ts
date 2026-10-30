import { expect, test } from "bun:test";
import { toTeamToolResult } from "./to-team-tool-result.service.ts";

test("a delivered message is a successful result naming the recipient", () => {
  const result = toTeamToolResult({ kind: "delivered" }, "fn-b");

  expect(result.isError).toBe(false);
  expect(result.content.map((part) => part.text).join("")).toContain("Delivered to fn-b");
});

test("a refusal becomes an error result carrying the reason", () => {
  const result = toTeamToolResult({ kind: "refused", reason: "No running teammate." }, "fn-b");

  expect(result.isError).toBe(true);
  expect(result.content.map((part) => part.text).join("")).toBe("No running teammate.");
});
