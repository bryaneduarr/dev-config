import type { ToolDefinition } from "@earendil-works/pi-coding-agent";
import { createTeamMessageTool } from "../../../tools/team-message/team-message.tool.ts";
import type { TaskRequest } from "../../../types/subagents/tasks/run/task-request.interface.ts";
import type { TeamMailbox } from "../../../types/subagents/team/team-mailbox.interface.ts";

export function createTeamTools(mailbox: TeamMailbox, runId: string, request: TaskRequest): readonly ToolDefinition[] {
  return request.name.state === "present" ? [createTeamMessageTool(mailbox, runId)] : [];
}
