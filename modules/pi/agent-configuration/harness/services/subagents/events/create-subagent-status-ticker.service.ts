import {
  SUBAGENT_STATUS_KEY,
  SUBAGENT_STATUS_REFRESH_INTERVAL_MS,
} from "../../../constants/subagents/registry/subagent-status.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentStatusContext } from "../../../types/subagents/events/subagent-status-context.interface.ts";
import type { SubagentStatusTicker } from "../../../types/subagents/events/subagent-status-ticker.interface.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import { countWorkingSubagents } from "../registry/count-working-subagents.service.ts";
import { formatWorkingSubagentsStatus } from "../result/format-working-subagents-status.service.ts";

export function createSubagentStatusTicker(registry: Pick<SubagentRegistry, "capacity">): SubagentStatusTicker {
  let timer: ValueState<ReturnType<typeof setInterval>> = { state: "absent" };
  let shownContext: ValueState<SubagentStatusContext> = { state: "absent" };
  let shownCount = 0;

  const showCount = (ctx: SubagentStatusContext, count: number): void => {
    shownCount = count;
    ctx.ui.setStatus(SUBAGENT_STATUS_KEY, count > 0 ? formatWorkingSubagentsStatus(count) : undefined);
  };

  const stop = (): void => {
    if (timer.state === "present") clearInterval(timer.value);
    if (shownContext.state === "present") showCount(shownContext.value, 0);
    timer = { state: "absent" };
    shownContext = { state: "absent" };
  };

  return {
    start(ctx) {
      stop();
      if (!ctx.hasUI) return;

      shownContext = { state: "present", value: ctx };
      timer = {
        state: "present",
        value: setInterval(() => {
          const count = countWorkingSubagents(registry.capacity());
          if (count !== shownCount) showCount(ctx, count);
        }, SUBAGENT_STATUS_REFRESH_INTERVAL_MS),
      };
    },
    stop,
  };
}
