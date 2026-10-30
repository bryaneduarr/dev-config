import { ORCHESTRATOR_RECIPIENT } from "../../../constants/subagents/team/team.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readTeamNameRefusal(name: ValueState<string>, takenNames: readonly string[]): ValueState<string> {
  if (name.state === "absent") return { state: "absent" };
  if (name.value === ORCHESTRATOR_RECIPIENT) {
    return { state: "present", value: `The name "${ORCHESTRATOR_RECIPIENT}" is reserved.` };
  }
  if (takenNames.includes(name.value)) {
    return { state: "present", value: `A running subagent is already named "${name.value}".` };
  }

  return { state: "absent" };
}
