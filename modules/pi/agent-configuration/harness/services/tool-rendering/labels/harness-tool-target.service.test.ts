import { expect, test } from "bun:test";
import { harnessToolTarget } from "./harness-tool-target.service.ts";

test("a run call shows its command under either key the model may send", () => {
  expect(harnessToolTarget("bash", { command: "npm test" })).toBe("npm test");
  expect(harnessToolTarget("bash", { run: "npm test" })).toBe("npm test");
});

test("a run call that is still streaming shows an empty target", () => {
  expect(harnessToolTarget("bash", {})).toBe("");
});
