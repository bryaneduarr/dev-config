import type { TaskProgressLookup } from "../tasks/progress/task-progress-lookup.interface.ts";
import type { SubagentCardTheme } from "./subagent-card-theme.interface.ts";

/** Inputs that build what the box of one subagent tool call shows right now. */
export interface BuildSubagentCardFrameInput {
  /** Theme that colors the box text. */
  readonly theme: SubagentCardTheme;
  /** Identifier of the tool call the box belongs to. */
  readonly toolCallId: string;
  /** Title the parent gave the task. */
  readonly title: string;
  /** Reads the live progress of the run, when the registry still tracks it. */
  readonly readProgress: () => TaskProgressLookup;
}
