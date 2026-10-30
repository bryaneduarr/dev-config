import type { TeamMailbox } from "../../../types/subagents/team/team-mailbox.interface.ts";
import type { TeamMember } from "../../../types/subagents/team/team-member.interface.ts";

/** A worker that joined a mailbox and keeps every message it was given. */
export interface RecordedMember {
  /** Identifier of the worker's run. */
  readonly runId: string;
  /** Texts delivered to the worker, oldest first. */
  readonly received: string[];
}

export function joinRecorded(mailbox: TeamMailbox, spec: Omit<TeamMember, "deliver">): RecordedMember {
  const received: string[] = [];
  const member: TeamMember = {
    ...spec,
    deliver: async (text) => {
      received.push(text);
    },
  };
  mailbox.join(member);

  return { runId: spec.runId, received };
}
