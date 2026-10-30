import type { TeamMessageInput } from "./team-message-input.interface.ts";

/** A message a worker sends. */
export interface WorkerTeamMessageInput extends TeamMessageInput {
  /** Identifier of the sending worker's run. */
  readonly fromRunId: string;
}
