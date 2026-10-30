import { MAX_RUNNING_SUBAGENTS } from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import type { SubagentRun } from "../../../types/subagents/registry/subagent-run.interface.ts";

export function readSubagentCapacity(runs: readonly SubagentRun[]): SubagentCapacity {
  const unfinished = runs.filter((run) => run.progress.status === "running");
  const running = unfinished.filter((run) => run.timing.startedAt.state === "present").length;

  return {
    running,
    queued: unfinished.length - running,
    freeSlots: Math.max(0, MAX_RUNNING_SUBAGENTS - running),
  };
}
