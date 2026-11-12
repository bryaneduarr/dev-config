import type { SubToolActivity } from "../../activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { TaskStatus } from "../tasks/progress/task-status.interface.ts";
import type { SubagentCardTheme } from "./subagent-card-theme.interface.ts";

/** Inputs that render one tool call of a subagent as a line. */
export interface RenderCallRowInput {
  /** Theme that colors the line. */
  readonly theme: SubagentCardTheme;
  /** Tool call the line describes. */
  readonly call: SubToolActivity;
  /** Lifecycle state of the subagent that made the call. */
  readonly taskStatus: TaskStatus;
  /** Current time, in milliseconds since the epoch. */
  readonly now: number;
}
