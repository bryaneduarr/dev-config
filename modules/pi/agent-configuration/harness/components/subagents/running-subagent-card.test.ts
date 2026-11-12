import { beforeEach, expect, test } from "bun:test";
import { NO_TOOL_RESULT_FIELDS } from "../../constants/activity/record/no-tool-result-fields.constant.ts";
import { activityStore } from "../../stores/activity/activity.store.ts";
import { renderPlainCard, resetCardStores, TEST_CWD } from "./subagent-card.test-double.ts";

beforeEach(resetCardStores);

test("a running subagent keeps reading as working between tool calls and lists every call with its time", () => {
  const now = Date.now();
  activityStore.begin({
    id: "call-1",
    toolName: "task",
    args: { title: "Inspect parser" },
    cwd: TEST_CWD,
    startedAt: now - 12_000,
  });
  activityStore.update("call-1", {
    ...NO_TOOL_RESULT_FIELDS,
    text: "",
    status: { state: "absent" },
    sub: [
      {
        id: "read-1",
        toolName: "read",
        args: { path: "parser.ts" },
        status: "success",
        text: "done",
        startedAt: now - 10_000,
        endedAt: { state: "present", value: now - 9_600 },
      },
      {
        id: "bash-1",
        toolName: "bash",
        args: { command: "npm test" },
        status: "running",
        text: "",
        startedAt: now - 3_000,
        endedAt: { state: "absent" },
      },
    ],
  });

  const lines = renderPlainCard("call-1", "Inspect parser").render(80).join("\n");

  expect(lines).toContain("+-- / SUBAGENT ");
  expect(lines).toContain("Working...");
  expect(lines).toContain("Done 0.400s  READ parser.ts");
  expect(lines).toMatch(/Running 3\.\d{3}s {2}BASH npm test/);
  expect(lines).toMatch(/Time: 12\.\d{3}s/);
  expect(lines).not.toContain("Completed");
});

test("a running subagent that has made no call yet reads as starting", () => {
  activityStore.begin({ id: "call-1", toolName: "task", args: {}, cwd: TEST_CWD, startedAt: Date.now() });

  const lines = renderPlainCard("call-1", "Inspect parser").render(80).join("\n");

  expect(lines).toContain("Working...");
  expect(lines).toContain("Starting");
});

test("only the latest calls are listed and the earlier ones are counted", () => {
  const now = Date.now();
  activityStore.begin({ id: "call-1", toolName: "task", args: {}, cwd: TEST_CWD, startedAt: now - 10_000 });
  const sub = Array.from({ length: 8 }, (_unused, index) => ({
    id: `read-${index}`,
    toolName: "read",
    args: { path: `file-${index}.ts` },
    status: "success" as const,
    text: "done",
    startedAt: now - 9_000 + index * 100,
    endedAt: { state: "present" as const, value: now - 9_000 + index * 100 + 50 },
  }));
  activityStore.update("call-1", { ...NO_TOOL_RESULT_FIELDS, text: "", status: { state: "absent" }, sub });

  const lines = renderPlainCard("call-1", "Inspect parser").render(80).join("\n");

  expect(lines).toContain("2 earlier calls");
  expect(lines).not.toContain("file-1.ts");
  expect(lines).toContain("file-7.ts");
});
