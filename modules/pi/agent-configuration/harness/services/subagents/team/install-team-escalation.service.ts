import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SUBAGENT_MESSAGE_TYPE } from "../../../constants/subagents/team/team.constant.ts";
import { teamMailbox } from "../../../stores/subagents/team-mailbox.store.ts";
import { formatTeamMessage } from "./format-team-message.service.ts";

export function installTeamEscalation(pi: ExtensionAPI): void {
  teamMailbox.routeToOrchestrator((escalation) =>
    pi.sendMessage(
      {
        customType: SUBAGENT_MESSAGE_TYPE,
        content: formatTeamMessage(escalation.from, escalation.message),
        display: false,
        details: escalation,
      },
      { triggerTurn: true, deliverAs: "followUp" },
    ),
  );
}
