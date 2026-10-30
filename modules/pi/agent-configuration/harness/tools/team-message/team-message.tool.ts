import { defineTool } from "@earendil-works/pi-coding-agent";
import { TEAM_MESSAGE_TOOL_NAME } from "../../constants/subagents/team/team.constant.ts";
import {
  TEAM_MESSAGE_TOOL_DESCRIPTION,
  TEAM_MESSAGE_TOOL_GUIDELINES,
  TEAM_MESSAGE_TOOL_LABEL,
  TEAM_MESSAGE_TOOL_SNIPPET,
} from "../../constants/subagents/team/team-tool.constant.ts";
import { TeamMessageParams } from "../../schemas/subagents/team/team-message-params.schema.ts";
import { toTeamToolResult } from "../../services/subagents/team/to-team-tool-result.service.ts";
import type { TeamMailbox } from "../../types/subagents/team/team-mailbox.interface.ts";

export function createTeamMessageTool(mailbox: TeamMailbox, fromRunId: string) {
  return defineTool({
    name: TEAM_MESSAGE_TOOL_NAME,
    label: TEAM_MESSAGE_TOOL_LABEL,
    description: TEAM_MESSAGE_TOOL_DESCRIPTION,
    promptSnippet: TEAM_MESSAGE_TOOL_SNIPPET,
    promptGuidelines: [...TEAM_MESSAGE_TOOL_GUIDELINES],
    parameters: TeamMessageParams,
    async execute(_toolCallId, params) {
      const outcome = await mailbox.sendFromWorker({ fromRunId, to: params.to, message: params.message });

      return toTeamToolResult(outcome, params.to);
    },
  });
}
