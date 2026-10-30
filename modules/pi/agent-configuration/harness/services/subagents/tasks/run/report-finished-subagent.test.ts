import { expect, test } from "bun:test";
import type { SubagentReport } from "../../../../types/subagents/result/subagent-report.interface.ts";
import { reportFinishedSubagent } from "./report-finished-subagent.service.ts";
import { handleOf, registryOf, runningProgress, succeededResult } from "./report-finished-subagent.test-double.ts";

function collectReports(): {
  readonly reports: SubagentReport[];
  readonly onFinished: (report: SubagentReport) => void;
} {
  const reports: SubagentReport[] = [];

  return { reports, onFinished: (report) => reports.push(report) };
}

test("a finished subagent reports its result and how many slots are free", async () => {
  const finished = runningProgress("run-1");
  const stillRunning = runningProgress("run-2");
  const result = Promise.resolve(succeededResult(finished));
  const { reports, onFinished } = collectReports();

  reportFinishedSubagent({
    registry: registryOf([{ ...finished, status: "success" }, stillRunning]),
    handle: handleOf(finished, result),
    onFinished,
  });
  await result;

  expect(reports).toHaveLength(1);
  expect(reports.map((report) => report.text).join("\n")).toContain("Subagent finished:");
  expect(reports.map((report) => report.text).join("\n")).toContain("Subagents running: 1 of 8. Free slots: 7.");
});

test("a failed subagent reports an error with its title", async () => {
  const failed = runningProgress("run-1");
  const result = Promise.reject(new Error("model unavailable"));
  const { reports, onFinished } = collectReports();

  reportFinishedSubagent({ registry: registryOf([failed]), handle: handleOf(failed, result), onFinished });
  await result.catch(() => {});

  expect(reports).toHaveLength(1);
  expect(reports.map((report) => report.text).join("\n")).toContain("model unavailable");
  expect(reports.map((report) => report.details.status)).toEqual(["error"]);
});

test("a subagent the registry no longer knows reports nothing", async () => {
  const forgotten = runningProgress("run-1");
  const result = Promise.resolve(succeededResult(forgotten));
  const { reports, onFinished } = collectReports();

  reportFinishedSubagent({ registry: registryOf([]), handle: handleOf(forgotten, result), onFinished });
  await result;

  expect(reports).toEqual([]);
});
