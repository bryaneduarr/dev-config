import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { subagentRegistry } from "../../../stores/subagents/subagent-registry.store.ts";
import { teamMailbox } from "../../../stores/subagents/team-mailbox.store.ts";
import { createSubagentStatusTicker } from "./create-subagent-status-ticker.service.ts";

function clearSubagents(): void {
  subagentRegistry.clear();
  teamMailbox.clear();
}

export function installSubagentEvents(pi: ExtensionAPI): void {
  const statusTicker = createSubagentStatusTicker(subagentRegistry);

  pi.on("session_start", (_event, ctx) => {
    clearSubagents();
    statusTicker.start(ctx);
  });
  pi.on("session_shutdown", () => {
    clearSubagents();
    statusTicker.stop();
  });
  pi.on("agent_settled", (event) => {
    if (event.aborted) clearSubagents();
  });
}
