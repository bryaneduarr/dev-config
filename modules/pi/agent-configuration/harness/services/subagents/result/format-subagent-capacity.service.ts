import { MAX_RUNNING_SUBAGENTS } from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";

export function formatSubagentCapacity(capacity: SubagentCapacity): string {
  return `Subagents running: ${capacity.running} of ${MAX_RUNNING_SUBAGENTS}. Free slots: ${capacity.freeSlots}.`;
}
