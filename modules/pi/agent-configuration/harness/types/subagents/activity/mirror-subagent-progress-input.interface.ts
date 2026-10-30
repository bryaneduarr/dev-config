import type { ActivityStore } from "../../activity/store/activity-store.interface.ts";
import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";

/** Inputs that copy the progress of a background subagent onto the tool call that launched it. */
export interface MirrorSubagentProgressInput {
  /** Store that records the launching tool call. */
  readonly store: ActivityStore;
  /** Identifier of the task tool call that launched the subagent. */
  readonly toolCallId: string;
  /** Latest progress snapshot of the subagent. */
  readonly progress: TaskProgress;
  /** Time a finished subagent ended, in milliseconds since the epoch. */
  readonly endedAt: number;
}
