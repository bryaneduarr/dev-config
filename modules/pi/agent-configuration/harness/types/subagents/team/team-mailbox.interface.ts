import type { TeamEscalationSink } from "./team-escalation.interface.ts";
import type { TeamMember } from "./team-member.interface.ts";
import type { TeamMessageInput } from "./team-message-input.interface.ts";
import type { TeamSendOutcome } from "./team-send-outcome.interface.ts";
import type { WorkerTeamMessageInput } from "./worker-team-message-input.interface.ts";

/** Routes short messages between the orchestrator and the named workers of a session. */
export interface TeamMailbox {
  /** Adds a running worker so teammates can reach it. */
  join(member: TeamMember): void;
  /** Removes a worker when its run ends. */
  leave(runId: string): void;
  /** Sends a message from a worker to a linked teammate or to the orchestrator. */
  sendFromWorker(input: WorkerTeamMessageInput): Promise<TeamSendOutcome>;
  /** Sends a message from the orchestrator to a running named worker. */
  sendFromOrchestrator(input: TeamMessageInput): Promise<TeamSendOutcome>;
  /** Sets where messages addressed to the orchestrator go. */
  routeToOrchestrator(sink: TeamEscalationSink): void;
  /** Forgets every member and message count. */
  clear(): void;
}
