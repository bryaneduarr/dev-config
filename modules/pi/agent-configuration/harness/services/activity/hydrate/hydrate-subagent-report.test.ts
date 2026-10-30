import { beforeEach, expect, test } from "bun:test";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { runningProgress } from "../../subagents/tasks/run/report-finished-subagent.test-double.ts";
import { hydrateSubagentReport } from "./hydrate-subagent-report.service.ts";
import { hydrateToolResult } from "./hydrate-tool-result.service.ts";

beforeEach(() => {
  activityStore.clear();
});

test("a stored report finishes the launched call it belongs to", () => {
  const launched = runningProgress("run-1");
  hydrateToolResult({
    id: "call-1",
    message: { role: "toolResult", toolName: "task", content: [], details: launched },
    cwd: "/tmp",
    startedAt: 1,
  });

  hydrateSubagentReport({ ...launched, status: "success", currentTask: "Completed" }, 9);

  const lookup = activityStore.lookup("call-1");
  expect(lookup.found && lookup.entry.details.state === "present" && lookup.entry.details.value.status).toBe("success");
});

test("a report for an unknown subagent changes nothing", () => {
  hydrateSubagentReport({ ...runningProgress("run-9"), status: "success" }, 9);

  expect(activityStore.all()).toEqual([]);
});
