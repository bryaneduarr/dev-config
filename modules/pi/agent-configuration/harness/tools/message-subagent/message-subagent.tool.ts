import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { MESSAGE_SUBAGENT_TOOL_NAME } from "../../constants/subagents/team/team.constant.ts";
import {
  MESSAGE_SUBAGENT_TOOL_DESCRIPTION,
  MESSAGE_SUBAGENT_TOOL_GUIDELINES,
  MESSAGE_SUBAGENT_TOOL_LABEL,
  MESSAGE_SUBAGENT_TOOL_SNIPPET,
} from "../../constants/subagents/team/team-tool.constant.ts";
import { TeamMessageParams } from "../../schemas/subagents/team/team-message-params.schema.ts";
import { toTeamToolResult } from "../../services/subagents/team/to-team-tool-result.service.ts";
import { teamMailbox } from "../../stores/subagents/team-mailbox.store.ts";

export function registerMessageSubagentTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: MESSAGE_SUBAGENT_TOOL_NAME,
    label: MESSAGE_SUBAGENT_TOOL_LABEL,
    description: MESSAGE_SUBAGENT_TOOL_DESCRIPTION,
    promptSnippet: MESSAGE_SUBAGENT_TOOL_SNIPPET,
    promptGuidelines: MESSAGE_SUBAGENT_TOOL_GUIDELINES,
    parameters: TeamMessageParams,
    async execute(_toolCallId, params) {
      const outcome = await teamMailbox.sendFromOrchestrator({ to: params.to, message: params.message });

      return toTeamToolResult(outcome, params.to);
    },
  });
}
