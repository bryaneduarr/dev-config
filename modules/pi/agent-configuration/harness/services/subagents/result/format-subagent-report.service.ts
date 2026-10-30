import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import { formatSubagentCapacity } from "./format-subagent-capacity.service.ts";

export function formatSubagentReport(resultText: string, capacity: SubagentCapacity): string {
  return [
    `Subagent finished: ${resultText}`,
    formatSubagentCapacity(capacity),
    "Launch the next subagent for any remaining independent work, or answer once everything has reported.",
  ].join("\n");
}
