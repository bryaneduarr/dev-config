import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { TaskResult } from "../result/task-result.interface.ts";
import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";
import type { SubagentTiming } from "./subagent-timing.interface.ts";

/** Bookkeeping for a run held by the registry. */
export interface SubagentRun {
  /** Aborts the run when cancelled. */
  readonly controller: AbortController;
  /** Latest published progress of the run. */
  progress: TaskProgress;
  /** Settles with the final report of the run. */
  readonly result: Promise<TaskResult>;
  /** Name that lets teammates message the run; absent for an unnamed run. */
  readonly name: ValueState<string>;
  /** When the run was accepted and when it got a slot. */
  readonly timing: SubagentTiming;
}
