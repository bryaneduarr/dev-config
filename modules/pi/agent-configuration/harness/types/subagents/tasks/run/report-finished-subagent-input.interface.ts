import type { SubagentHandle } from "../../registry/subagent-handle.interface.ts";
import type { SubagentRegistry } from "../../registry/subagent-registry.interface.ts";
import type { SubagentReport } from "../../result/subagent-report.interface.ts";

/** Inputs that turn the end of one background subagent run into a report. */
export interface ReportFinishedSubagentInput {
  /** Registry that tracks the run and the other running subagents. */
  readonly registry: SubagentRegistry;
  /** Started run to wait for. */
  readonly handle: SubagentHandle;
  /** Receives the report once the run finishes. */
  readonly onFinished: (report: SubagentReport) => void;
}
