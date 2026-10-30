import { MAX_RUNNING_SUBAGENTS } from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";

export function formatSubagentCapacity(capacity: SubagentCapacity): string {
  const queuedText = capacity.queued > 0 ? ` Queued for a slot: ${capacity.queued}.` : "";

  return `Subagents running: ${capacity.running} of ${MAX_RUNNING_SUBAGENTS}.${queuedText} Free slots: ${capacity.freeSlots}.`;
}
