import { STOPPED_TASK_LABEL } from "../../../../constants/subagents/tasks/progress/progress.constant.ts";
import type { SubagentReport } from "../../../../types/subagents/result/subagent-report.interface.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { ReportFinishedSubagentInput } from "../../../../types/subagents/tasks/run/report-finished-subagent-input.interface.ts";
import { readSubagentCapacity } from "../../registry/read-subagent-capacity.service.ts";
import { formatSubagentReport } from "../../result/format-subagent-report.service.ts";
import { formatTaskErrorResult } from "../../result/format-task-error-result.service.ts";
import { formatTaskResult } from "../../result/format-task-result.service.ts";

export function reportFinishedSubagent(input: ReportFinishedSubagentInput): void {
  const { registry, handle, onFinished } = input;

  const report = (resultText: string, details: SubagentReport["details"]): void => {
    const text = formatSubagentReport(resultText, readSubagentCapacity(registry.list()));
    onFinished({ text, details });
  };

  void handle.result.then(
    (taskResult) => {
      if (!registry.status(handle.id).found) return;

      report(formatTaskResult(taskResult), taskResult);
    },
    (error) => {
      const run = registry.status(handle.id);
      if (!run.found) return;

      const message = error instanceof Error ? error.message : String(error);
      const failedProgress: TaskProgress = { ...run.progress, currentTask: STOPPED_TASK_LABEL, status: "error" };
      report(formatTaskErrorResult(failedProgress.id, failedProgress.title, message), failedProgress);
    },
  );
}
