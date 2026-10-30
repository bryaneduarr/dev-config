import { MAX_RUNNING_SUBAGENTS } from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";

export function readSubagentCapacity(runs: readonly TaskProgress[]): SubagentCapacity {
  const running = runs.filter((run) => run.status === "running").length;

  return { running, freeSlots: Math.max(0, MAX_RUNNING_SUBAGENTS - running) };
}
