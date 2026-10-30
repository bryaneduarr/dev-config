import { Type } from "typebox";

export const ReplyTimestampSchema = Type.Object({
  /** Time the agent reply was created, in milliseconds since the epoch. */
  timestamp: Type.Number(),
});
