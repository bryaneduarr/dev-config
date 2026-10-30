import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";

export function countWorkingSubagents(capacity: SubagentCapacity): number {
  return capacity.running + capacity.queued;
}
