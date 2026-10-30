import { expect, test } from "bun:test";
import { runningProgress, succeededResult } from "../tasks/run/report-finished-subagent.test-double.ts";
import { formatTaskResult } from "./format-task-result.service.ts";

test("a result keeps its identity, status, and summary and leaves out empty sections", () => {
  const text = formatTaskResult(succeededResult(runningProgress("run-1")));

  expect(JSON.parse(text)).toEqual({ id: "run-1", title: "Task run-1", status: "success", summary: "done" });
});

test("a result lists only the sections that have items", () => {
  const text = formatTaskResult({
    ...succeededResult(runningProgress("run-1")),
    risks: ["slow"],
    checks: ["bun test"],
  });

  expect(JSON.parse(text)).toEqual({
    id: "run-1",
    title: "Task run-1",
    status: "success",
    summary: "done",
    checks: ["bun test"],
    risks: ["slow"],
  });
});

test("a result from a worker that ran in its own checkout names the branch holding its changes", () => {
  const text = formatTaskResult({
    ...succeededResult(runningProgress("run-1")),
    branch: { state: "present", value: "subagent/abcd1234" },
  });

  expect(JSON.parse(text)).toMatchObject({ branch: "subagent/abcd1234" });
});
