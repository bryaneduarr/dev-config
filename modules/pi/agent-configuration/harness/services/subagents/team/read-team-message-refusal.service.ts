import { TEAM_MESSAGE_MAX_CHARS } from "../../../constants/subagents/team/team.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function readTeamMessageRefusal(message: string): ValueState<string> {
  if (message.trim() === "") return { state: "present", value: "The message is empty." };
  if (message.length > TEAM_MESSAGE_MAX_CHARS) {
    return {
      state: "present",
      value: `The message is ${message.length} characters; the limit is ${TEAM_MESSAGE_MAX_CHARS}. Shorten it.`,
    };
  }

  return { state: "absent" };
}
