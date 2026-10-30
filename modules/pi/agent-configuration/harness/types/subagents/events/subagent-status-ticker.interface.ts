import type { SubagentStatusContext } from "./subagent-status-context.interface.ts";

/** Keeps the working-subagents status of one session current. */
export interface SubagentStatusTicker {
  /** Starts refreshing the status for the session, replacing any earlier refresh. */
  start(ctx: SubagentStatusContext): void;
  /** Stops refreshing and clears the status. */
  stop(): void;
}
