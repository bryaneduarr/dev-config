import type { TaskResult } from "../result/task-result.interface.ts";
import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";

/** Reference to a started subagent run. */
export interface SubagentHandle {
  /** Identifier of the run. */
  readonly id: string;
  /** Progress of the run at the moment it started. */
  readonly progress: TaskProgress;
  /** Settles with the final report of the run. */
  readonly result: Promise<TaskResult>;
}
