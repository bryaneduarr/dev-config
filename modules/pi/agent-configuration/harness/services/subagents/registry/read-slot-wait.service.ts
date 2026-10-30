import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentTiming } from "../../../types/subagents/registry/subagent-timing.interface.ts";

export function readSlotWait(timing: SubagentTiming): ValueState<number> {
  if (timing.startedAt.state === "absent") return { state: "absent" };

  return { state: "present", value: timing.startedAt.value - timing.queuedAt };
}
