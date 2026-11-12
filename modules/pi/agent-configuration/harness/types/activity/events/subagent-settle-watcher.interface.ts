import type { SettleWatchContext } from "./settle-watch-context.interface.ts";

/** Keeps the main agent reading as working until its subagents have finished. */
export interface SubagentSettleWatcher {
  /** Reports whether any subagent is still running or queued. */
  hasWorkingSubagents(): boolean;
  /** Calls settle once no subagent is working and the main agent is idle with nothing queued. */
  holdUntilSettled(ctx: SettleWatchContext, settle: () => void): void;
  /** Stops holding, as when the main agent starts a new turn or the session ends. */
  release(): void;
}
