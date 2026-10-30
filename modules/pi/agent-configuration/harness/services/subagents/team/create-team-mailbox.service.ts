import {
  MESSAGE_ORCHESTRATOR_INSTEAD,
  ORCHESTRATOR_RECIPIENT,
  TEAM_MESSAGES_PER_WORKER,
} from "../../../constants/subagents/team/team.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { TeamEscalationSink } from "../../../types/subagents/team/team-escalation.interface.ts";
import type { TeamMailbox } from "../../../types/subagents/team/team-mailbox.interface.ts";
import type { TeamMember } from "../../../types/subagents/team/team-member.interface.ts";
import type { TeamSendOutcome } from "../../../types/subagents/team/team-send-outcome.interface.ts";
import { areTeammatesLinked } from "./are-teammates-linked.service.ts";
import { formatTeamMessage } from "./format-team-message.service.ts";
import { readTeamMessageRefusal } from "./read-team-message-refusal.service.ts";

const DELIVERED: TeamSendOutcome = { kind: "delivered" };

function refused(reason: string): TeamSendOutcome {
  return { kind: "refused", reason };
}

export function createTeamMailbox(): TeamMailbox {
  const membersByRunId = new Map<string, TeamMember>();
  const sentByRunId = new Map<string, number>();
  let escalationSink: ValueState<TeamEscalationSink> = { state: "absent" };

  const listNames = (): string => [...membersByRunId.values()].map((member) => member.name).join(", ") || "none";
  const findByName = (name: string): ValueState<TeamMember> => {
    const member = [...membersByRunId.values()].find((candidate) => candidate.name === name);

    return member === undefined ? { state: "absent" } : { state: "present", value: member };
  };

  const deliverTo = async (recipient: TeamMember, from: string, message: string): Promise<TeamSendOutcome> => {
    try {
      await recipient.deliver(formatTeamMessage(from, message));
      return DELIVERED;
    } catch {
      return refused(`${recipient.name} could not receive the message.`);
    }
  };

  const routeWorkerMessage = async (sender: TeamMember, to: string, message: string): Promise<TeamSendOutcome> => {
    if (to === ORCHESTRATOR_RECIPIENT) {
      if (escalationSink.state === "absent") return refused("The orchestrator cannot be reached.");

      escalationSink.value({ from: sender.name, message });
      return DELIVERED;
    }

    const lookup = findByName(to);
    if (lookup.state === "absent" || lookup.value.runId === sender.runId) {
      return refused(`No running teammate named "${to}". Running: ${listNames()}. ${MESSAGE_ORCHESTRATOR_INSTEAD}`);
    }
    const peer = lookup.value;
    if (!areTeammatesLinked(sender, peer)) {
      return refused(`You are not linked to "${to}". ${MESSAGE_ORCHESTRATOR_INSTEAD}`);
    }

    return deliverTo(peer, sender.name, message);
  };

  return {
    join(member) {
      membersByRunId.set(member.runId, member);
      sentByRunId.set(member.runId, 0);
    },
    leave(runId) {
      membersByRunId.delete(runId);
      sentByRunId.delete(runId);
    },
    async sendFromWorker({ fromRunId, to, message }) {
      const sender = membersByRunId.get(fromRunId);
      const sent = sentByRunId.get(fromRunId);
      if (sender === undefined || sent === undefined) return refused("You are not part of a team.");

      const messageRefusal = readTeamMessageRefusal(message);
      if (messageRefusal.state === "present") return refused(messageRefusal.value);
      if (sent >= TEAM_MESSAGES_PER_WORKER) {
        return refused(`You used all ${TEAM_MESSAGES_PER_WORKER} messages. Finish your mission and report.`);
      }

      sentByRunId.set(fromRunId, sent + 1);
      const outcome = await routeWorkerMessage(sender, to, message);
      const afterSending = sentByRunId.get(fromRunId);
      if (outcome.kind === "refused" && afterSending !== undefined) sentByRunId.set(fromRunId, afterSending - 1);
      return outcome;
    },
    async sendFromOrchestrator({ to, message }) {
      const messageRefusal = readTeamMessageRefusal(message);
      if (messageRefusal.state === "present") return refused(messageRefusal.value);

      const recipient = findByName(to);
      if (recipient.state === "absent") return refused(`No running subagent named "${to}". Running: ${listNames()}.`);

      return deliverTo(recipient.value, ORCHESTRATOR_RECIPIENT, message);
    },
    routeToOrchestrator(sink) {
      escalationSink = { state: "present", value: sink };
    },
    clear() {
      membersByRunId.clear();
      sentByRunId.clear();
    },
  };
}
