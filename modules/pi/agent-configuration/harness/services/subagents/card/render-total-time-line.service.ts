import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { CARD_TIME_LABEL } from "../../../constants/subagents/card/card.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { RenderTotalTimeLineInput } from "../../../types/subagents/card/render-total-time-line-input.interface.ts";
import { formatDuration } from "../../time/format-duration.service.ts";

export function renderTotalTimeLine({
  theme,
  activityLookup,
  taskStatus,
  now,
}: RenderTotalTimeLineInput): ValueState<string> {
  if (!activityLookup.found) return { state: "absent" };

  const { startedAt, endedAt } = activityLookup.entry;
  const stopsAt = taskStatus !== "running" && endedAt.state === "present" ? endedAt.value : now;

  return {
    state: "present",
    value: theme.fg(THEME_MUTED, `${CARD_TIME_LABEL} ${formatDuration(stopsAt - startedAt)}`),
  };
}
