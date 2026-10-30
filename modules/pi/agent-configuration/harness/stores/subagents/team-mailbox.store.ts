import { createTeamMailbox } from "../../services/subagents/team/create-team-mailbox.service.ts";
import type { TeamMailbox } from "../../types/subagents/team/team-mailbox.interface.ts";

export const teamMailbox: TeamMailbox = createTeamMailbox();
