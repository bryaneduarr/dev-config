import { Type } from "typebox";
import { ORCHESTRATOR_RECIPIENT, TEAM_MESSAGE_MAX_CHARS } from "../../../constants/subagents/team/team.constant.ts";

export const TeamMessageParams = Type.Object({
  /** Name of the teammate, or the orchestrator, that receives the message. */
  to: Type.String({ minLength: 1, description: `Name of a linked teammate, or ${ORCHESTRATOR_RECIPIENT}.` }),
  /** Text of the message. */
  message: Type.String({
    minLength: 1,
    maxLength: TEAM_MESSAGE_MAX_CHARS,
    description: "One short, specific message.",
  }),
});
