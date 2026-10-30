import { expect, test } from "bun:test";
import { runningProgress } from "../tasks/run/report-finished-subagent.test-double.ts";
import { readSubagentCapacity } from "./read-subagent-capacity.service.ts";
import { subagentRunOf } from "./subagent-run.test-double.ts";

const STARTED = { state: "present", value: 1 } as const;
const WAITING = { state: "absent" } as const;

test("finished runs free their slots", () => {
  const finished = {
    ...subagentRunOf("run-2", 0, STARTED),
    progress: { ...runningProgress("run-2"), status: "success" as const },
  };

  expect(readSubagentCapacity([subagentRunOf("run-1", 0, STARTED), finished])).toEqual({
    running: 1,
    queued: 0,
    freeSlots: 7,
  });
});

test("runs waiting for a slot are queued, not running, and never make free slots negative", () => {
  const runs = Array.from({ length: 10 }, (_, index) =>
    subagentRunOf(`run-${index}`, 0, index < 8 ? STARTED : WAITING),
  );

  expect(readSubagentCapacity(runs)).toEqual({ running: 8, queued: 2, freeSlots: 0 });
});
