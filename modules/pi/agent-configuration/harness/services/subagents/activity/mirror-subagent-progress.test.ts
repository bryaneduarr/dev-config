import { expect, test } from "bun:test";
import { createActivityStore } from "../../activity/store/create-activity-store.service.ts";
import { runningProgress } from "../tasks/run/report-finished-subagent.test-double.ts";
import { mirrorSubagentProgress } from "./mirror-subagent-progress.service.ts";

const TOOL_CALL_ID = "call-1";

function storeWithLaunchedCall() {
  const store = createActivityStore();
  store.begin({ id: TOOL_CALL_ID, toolName: "task", args: {}, cwd: "/tmp", startedAt: 1 });
  store.finish(TOOL_CALL_ID, {
    details: { state: "absent" },
    sub: [],
    usage: { usageState: "unreported" },
    model: { state: "absent" },
    thinkingLevel: { state: "absent" },
    text: "Launched",
    status: "success",
    endedAt: 2,
  });

  return store;
}

test("progress after the launch call has ended fills in the model and keeps the call running", () => {
  const store = storeWithLaunchedCall();
  const progress = {
    ...runningProgress("run-1"),
    model: {
      state: "present" as const,
      value: {
        provider: "p",
        id: "m",
        name: { state: "absent" as const },
        reasoning: { state: "absent" as const },
        contextWindow: { state: "absent" as const },
      },
    },
  };

  mirrorSubagentProgress({ store, toolCallId: TOOL_CALL_ID, progress, endedAt: 3 });

  const lookup = store.lookup(TOOL_CALL_ID);
  expect(lookup.found && lookup.entry.status).toBe("running");
  expect(lookup.found && lookup.entry.model.state).toBe("present");
});

test("a finished subagent ends the call with its final status", () => {
  const store = storeWithLaunchedCall();

  mirrorSubagentProgress({
    store,
    toolCallId: TOOL_CALL_ID,
    progress: { ...runningProgress("run-1"), status: "cancelled", currentTask: "Stopped" },
    endedAt: 3,
  });

  const lookup = store.lookup(TOOL_CALL_ID);
  expect(lookup.found && lookup.entry.status).toBe("error");
  expect(lookup.found && lookup.entry.details.state === "present" && lookup.entry.details.value.status).toBe(
    "cancelled",
  );
});
