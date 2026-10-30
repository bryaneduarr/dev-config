import type { TaskProgress } from "../tasks/progress/task-progress.interface.ts";
import type { TaskResult } from "./task-result.interface.ts";

/** What a finished subagent tells the orchestrator. */
export interface SubagentReport {
  /** Message text the orchestrator reads. */
  readonly text: string;
  /** Final result, or the failed progress when the run did not produce one. */
  readonly details: TaskResult | TaskProgress;
}
