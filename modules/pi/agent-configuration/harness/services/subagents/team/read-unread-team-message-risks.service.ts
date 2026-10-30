import type { AgentSession } from "@earendil-works/pi-coding-agent";

export function readUnreadTeamMessageRisks(session: Pick<AgentSession, "getSteeringMessages">): readonly string[] {
  const unread = session.getSteeringMessages();
  if (unread.length === 0) return [];

  return [`The worker finished before reading ${unread.length} message(s): ${unread.join(" | ")}`];
}
