import type { Theme } from "@earendil-works/pi-coding-agent";
import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { ELAPSED_TIME_LABEL } from "../../../constants/tool-rendering/details/elapsed-label.constant.ts";
import type { ToolActivity } from "../../../types/activity/store/tool-activity.interface.ts";
import { formatDuration } from "../../time/format-duration.service.ts";

export function elapsedLine(entry: ToolActivity, theme: Theme): string {
  const endedAt = entry.endedAt.state === "present" ? entry.endedAt.value : Date.now();
  return theme.fg(THEME_MUTED, `${ELAPSED_TIME_LABEL}${formatDuration(endedAt - entry.startedAt)}`);
}
