import type { JoinTeamInput } from "../../../types/subagents/team/join-team-input.interface.ts";

export function joinTeam(input: JoinTeamInput): void {
  const { mailbox, runId, request, session } = input;
  if (request.name.state === "absent") return;

  mailbox.join({
    runId,
    name: request.name.value,
    talksTo: request.talksTo.state === "present" ? request.talksTo.value : [],
    deliver: async (text) => {
      await session.steer(text);
    },
  });
}
