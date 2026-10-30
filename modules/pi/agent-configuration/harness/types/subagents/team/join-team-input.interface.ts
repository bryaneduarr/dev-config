import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { TaskRequest } from "../tasks/run/task-request.interface.ts";
import type { TeamMailbox } from "./team-mailbox.interface.ts";

/** Inputs that make a worker reachable by its teammates. */
export interface JoinTeamInput {
  /** Mailbox the team uses. */
  readonly mailbox: TeamMailbox;
  /** Identifier of the worker's run. */
  readonly runId: string;
  /** Request that may name the worker and link it to teammates. */
  readonly request: TaskRequest;
  /** Worker session that receives messages before its next step. */
  readonly session: Pick<AgentSession, "steer">;
}
