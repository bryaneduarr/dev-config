import type { Static } from "typebox";
import type { TeamMessageParams } from "../../../schemas/subagents/team/team-message-params.schema.ts";

/** A message to a named recipient. */
export type TeamMessageInput = Static<typeof TeamMessageParams>;
