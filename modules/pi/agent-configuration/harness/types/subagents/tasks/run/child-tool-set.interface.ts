import type { ToolDefinition } from "@earendil-works/pi-coding-agent";

/** The tools a subagent session starts with. */
export interface ChildToolSet {
  /** Names of the tools the session activates, built-in and custom. */
  readonly toolNames: readonly string[];
  /** Harness tools that replace the built-in tools of the same name. */
  readonly customTools: readonly ToolDefinition[];
}
