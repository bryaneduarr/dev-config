import type { ToolActivityLookup } from "../../activity/store/tool-activity-lookup.interface.ts";
import type { TaskStatus } from "../tasks/progress/task-status.interface.ts";
import type { SubagentCardTheme } from "./subagent-card-theme.interface.ts";

/** Inputs that render the total time a subagent has worked. */
export interface RenderTotalTimeLineInput {
  /** Theme that colors the line. */
  readonly theme: SubagentCardTheme;
  /** Recorded task call whose start and end time the line reports. */
  readonly activityLookup: ToolActivityLookup;
  /** Lifecycle state of the subagent. */
  readonly taskStatus: TaskStatus;
  /** Current time, in milliseconds since the epoch. */
  readonly now: number;
}
