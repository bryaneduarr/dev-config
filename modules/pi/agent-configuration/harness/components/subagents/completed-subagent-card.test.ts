import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { renderPlainCard, resetCardStores, TEST_CWD } from "./subagent-card.test-double.ts";

beforeEach(resetCardStores);

test("a completed card lists each tool with its duration and the total time", () => {
  activityStore.begin({
    id: "done-call",
    toolName: "task",
    args: { title: "Locate pi harness" },
    cwd: TEST_CWD,
    startedAt: 1000,
  });
  const activity = [
    {
      id: "bash-1",
      toolName: "bash",
      args: { command: "pwd" },
      status: "success" as const,
      text: "done",
      startedAt: 1000,
      endedAt: { state: "present" as const, value: 1100 },
    },
    {
      id: "grep-1",
      toolName: "grep",
      args: {},
      status: "success" as const,
      text: "done",
      startedAt: 1000,
      endedAt: { state: "present" as const, value: 2200 },
    },
  ];

  activityStore.finish("done-call", {
    ...NO_TOOL_RESULT_FIELDS,
    sub: activity,
    text: "done",
    status: "success",
    endedAt: 35400,
  });

  const card = renderPlainCard("done-call", "Locate pi harness");
  const lines = card.render(80).join("\n");

  expect(lines).toContain("+-- SUBAGENT ");
  expect(lines).not.toContain("+-- / SUBAGENT ");
  expect(lines).toContain("Locate pi harness");
  expect(lines).toContain("Done 0.100s  BASH pwd");
  expect(lines).toContain("Done 1.200s  GREP");
  expect(lines).toContain("Completed");
  expect(lines).toContain("Time: 34.400s");
  expect(lines).not.toContain("Working...");
  expect(lines).not.toContain("Model");
  expect(lines).not.toContain("Task:");
});
