import type { ToolActivity } from "../../activity/store/tool-activity.interface.ts";
import type { SubagentRegistry } from "../../subagents/registry/subagent-registry.interface.ts";

/** Inputs that decide whether an agent reply was written while a subagent was still working. */
export interface ReplySubagentRunInput {
  /** Recorded tool calls, including the task calls that launched subagents. */
  readonly activities: readonly ToolActivity[];
  /** Registry that knows which subagents are still running. */
  readonly registry: SubagentRegistry;
  /** Time the agent reply was created, in milliseconds since the epoch. */
  readonly replyTimestamp: number;
}
