import { MILLISECONDS_PER_SECOND } from "../../../constants/time/time-unit.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import { formatSubagentCapacity } from "./format-subagent-capacity.service.ts";

export function formatSubagentReport(
  resultText: string,
  capacity: SubagentCapacity,
  slotWait: ValueState<number>,
): string {
  const slotWaitLines =
    slotWait.state === "present"
      ? [`Waited ${(slotWait.value / MILLISECONDS_PER_SECOND).toFixed(1)} s for a slot.`]
      : [];

  return [
    `Subagent finished: ${resultText}`,
    ...slotWaitLines,
    formatSubagentCapacity(capacity),
    "Launch every subagent this result unblocks, plus any other ready independent work, or answer once everything has reported.",
  ].join("\n");
}
