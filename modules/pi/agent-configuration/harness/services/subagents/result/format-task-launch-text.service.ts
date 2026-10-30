import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";
import { formatSubagentCapacity } from "./format-subagent-capacity.service.ts";

export function formatTaskLaunchText(progress: TaskProgress, capacity: SubagentCapacity): string {
  return [
    `Launched subagent ${progress.id} ("${progress.title}"). It runs in the background and its result arrives later as a message.`,
    formatSubagentCapacity(capacity),
  ].join("\n");
}
