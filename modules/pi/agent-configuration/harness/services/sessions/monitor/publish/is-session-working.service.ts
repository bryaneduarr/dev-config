import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SubagentCapacity } from "../../../../types/subagents/registry/subagent-capacity.interface.ts";
import { countWorkingSubagents } from "../../../subagents/registry/count-working-subagents.service.ts";

export function isSessionWorking(
  ctx: Pick<ExtensionContext, "isIdle" | "hasPendingMessages" | "signal">,
  compacting: boolean,
  subagents: SubagentCapacity,
): boolean {
  const isAgentBusy = !ctx.isIdle();
  const hasQueuedMessages = ctx.hasPendingMessages();
  const hasActiveSignal = ctx.signal !== undefined;
  const hasWorkingSubagents = countWorkingSubagents(subagents) > 0;
  return isAgentBusy || hasQueuedMessages || compacting || hasActiveSignal || hasWorkingSubagents;
}
