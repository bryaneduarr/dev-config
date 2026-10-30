import { expect, test } from "bun:test";
import { runningProgress } from "../tasks/run/report-finished-subagent.test-double.ts";
import { readSubagentCapacity } from "./read-subagent-capacity.service.ts";

test("finished runs free their slots", () => {
  const runs = [runningProgress("run-1"), { ...runningProgress("run-2"), status: "success" as const }];

  expect(readSubagentCapacity(runs)).toEqual({ running: 1, freeSlots: 7 });
});

test("more waiting runs than slots leave no free slots and never go negative", () => {
  const runs = Array.from({ length: 10 }, (_, index) => runningProgress(`run-${index}`));

  expect(readSubagentCapacity(runs)).toEqual({ running: 10, freeSlots: 0 });
});
