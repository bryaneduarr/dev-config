import type { TeamSendOutcome } from "../../../types/subagents/team/team-send-outcome.interface.ts";
import { toTextToolResult } from "../../tools/result/to-text-tool-result.service.ts";

export function toTeamToolResult(outcome: TeamSendOutcome, to: string) {
  const text =
    outcome.kind === "delivered" ? `Delivered to ${to}. Keep working; a reply arrives by itself.` : outcome.reason;

  return { ...toTextToolResult(text), isError: outcome.kind === "refused" };
}
