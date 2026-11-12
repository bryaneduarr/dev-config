import { SUBAGENT_STATUS_REFRESH_INTERVAL_MS } from "../../../constants/subagents/registry/subagent-status.constant.ts";
import type { SettleWatchContext } from "../../../types/activity/events/settle-watch-context.interface.ts";
import type { SubagentSettleWatcher } from "../../../types/activity/events/subagent-settle-watcher.interface.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import { countWorkingSubagents } from "../../subagents/registry/count-working-subagents.service.ts";

export function createSubagentSettleWatcher(registry: Pick<SubagentRegistry, "capacity">): SubagentSettleWatcher {
  let timer: ValueState<ReturnType<typeof setInterval>> = { state: "absent" };

  const hasWorkingSubagents = (): boolean => countWorkingSubagents(registry.capacity()) > 0;
  const release = (): void => {
    if (timer.state === "present") clearInterval(timer.value);
    timer = { state: "absent" };
  };

  return {
    hasWorkingSubagents,
    holdUntilSettled(ctx: SettleWatchContext, settle: () => void) {
      release();
      timer = {
        state: "present",
        value: setInterval(() => {
          const isMainAgentBusy = !ctx.isIdle() || ctx.hasPendingMessages();
          if (hasWorkingSubagents() || isMainAgentBusy) return;

          release();
          settle();
        }, SUBAGENT_STATUS_REFRESH_INTERVAL_MS),
      };
    },
    release,
  };
}
