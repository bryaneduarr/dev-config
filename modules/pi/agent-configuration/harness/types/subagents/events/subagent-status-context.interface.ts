import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/** The part of a Pi context the status ticker needs to show the working subagents. */
export interface SubagentStatusContext {
  /** Whether the session has a terminal UI that can show a status. */
  readonly hasUI: boolean;
  /** Terminal UI that shows the status text. */
  readonly ui: Pick<ExtensionContext["ui"], "setStatus">;
}
