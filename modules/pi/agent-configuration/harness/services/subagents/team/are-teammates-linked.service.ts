import type { TeamMember } from "../../../types/subagents/team/team-member.interface.ts";

export function areTeammatesLinked(first: TeamMember, second: TeamMember): boolean {
  return first.talksTo.includes(second.name) || second.talksTo.includes(first.name);
}
