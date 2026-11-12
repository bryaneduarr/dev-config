import type { SubToolActivity } from "../../activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { TaskStatus } from "../tasks/progress/task-status.interface.ts";
import type { SubagentCardTheme } from "./subagent-card-theme.interface.ts";

/** Inputs that render the tool calls of a subagent as lines. */
export interface RenderCallRowsInput {
  /** Theme that colors the lines. */
  readonly theme: SubagentCardTheme;
  /** Every tool call the subagent has made, oldest first. */
  readonly calls: readonly SubToolActivity[];
  /** Lifecycle state of the subagent that made the calls. */
  readonly taskStatus: TaskStatus;
  /** Current time, in milliseconds since the epoch. */
  readonly now: number;
}
