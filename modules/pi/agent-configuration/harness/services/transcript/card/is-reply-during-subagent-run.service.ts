import { TASK_TOOL_NAME } from "../../../constants/subagents/roles/roles.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { ReplySubagentRunInput } from "../../../types/transcript/card/reply-subagent-run-input.interface.ts";

function isSubagentStillRunning(entry: ToolActivity, registry: SubagentRegistry): boolean {
  if (entry.status === "running") return true;
  if (entry.details.state === "absent") return false;

  const run = registry.status(entry.details.value.id);
  return run.found && run.progress.status === "running";
}

function endedAfter(entry: ToolActivity, timestamp: number): boolean {
  return entry.endedAt.state === "present" && entry.endedAt.value > timestamp;
}

export function isReplyDuringSubagentRun(input: ReplySubagentRunInput): boolean {
  const { activities, registry, replyTimestamp } = input;

  return activities.some((entry) => {
    const isSubagentLaunch = entry.toolName === TASK_TOOL_NAME;
    const startedBeforeReply = entry.startedAt < replyTimestamp;
    const wasWorkingAtReply = isSubagentStillRunning(entry, registry) || endedAfter(entry, replyTimestamp);

    return isSubagentLaunch && startedBeforeReply && wasWorkingAtReply;
  });
}
