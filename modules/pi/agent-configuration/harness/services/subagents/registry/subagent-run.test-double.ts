import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentRun } from "../../../types/subagents/registry/subagent-run.interface.ts";
import { runningProgress, succeededResult } from "../tasks/run/report-finished-subagent.test-double.ts";

export function subagentRunOf(id: string, queuedAt: number, startedAt: ValueState<number>): SubagentRun {
  const progress = runningProgress(id);

  return {
    controller: new AbortController(),
    progress,
    result: Promise.resolve(succeededResult(progress)),
    name: { state: "absent" },
    timing: { queuedAt, startedAt },
  };
}
