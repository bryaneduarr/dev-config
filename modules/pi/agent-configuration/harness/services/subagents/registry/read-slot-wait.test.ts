import { expect, test } from "bun:test";
import { readSlotWait } from "./read-slot-wait.service.ts";
import { subagentRunOf } from "./subagent-run.test-double.ts";

test("a run that began reports the time between being accepted and getting a slot", () => {
  const run = subagentRunOf("run-1", 1000, { state: "present", value: 1250 });

  expect(readSlotWait(run.timing)).toEqual({ state: "present", value: 250 });
});

test("a run still waiting for a slot has no wait yet", () => {
  expect(readSlotWait(subagentRunOf("run-1", 1000, { state: "absent" }).timing)).toEqual({ state: "absent" });
});
