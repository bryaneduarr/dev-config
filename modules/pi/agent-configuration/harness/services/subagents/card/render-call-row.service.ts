import { THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import {
  CARD_CALL_RUNNING_LABEL,
  CARD_DONE_LABEL,
  CARD_TOOL_TARGET_FIELDS,
} from "../../../constants/subagents/card/card.constant.ts";
import { FAILED_LABEL } from "../../../constants/tool-rendering/presentation/presentation-label.constant.ts";
import type { SubToolActivity } from "../../../types/activity/parsing/subagent/sub-tool-activity.interface.ts";
import type { RenderCallRowInput } from "../../../types/subagents/card/render-call-row-input.interface.ts";
import { statusColor } from "../../inspector/labels/tool/status-color.service.ts";
import { formatDuration } from "../../time/format-duration.service.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";

function toolTarget(call: SubToolActivity): string {
  for (const key of CARD_TOOL_TARGET_FIELDS) {
    const targetValue = call.args[key];
    if (typeof targetValue === "string" && targetValue.trim()) return oneLine(targetValue);
  }

  return "";
}

function statusLabel(status: SubToolActivity["status"]): string {
  if (status === "running") return CARD_CALL_RUNNING_LABEL;
  if (status === "error") return FAILED_LABEL;

  return CARD_DONE_LABEL;
}

export function renderCallRow({ theme, call, taskStatus, now }: RenderCallRowInput): string {
  const isAbandoned = call.status === "running" && taskStatus !== "running";
  const status = isAbandoned ? "error" : call.status;
  const endedAt = call.endedAt.state === "present" ? call.endedAt.value : now;
  const duration = isAbandoned ? "" : ` ${formatDuration(endedAt - call.startedAt)}`;
  const target = toolTarget(call);
  const toolLabel = target ? `${call.toolName.toUpperCase()} ${target}` : call.toolName.toUpperCase();

  return `${theme.fg(statusColor(status), `${statusLabel(status)}${duration}`)}  ${theme.fg(THEME_TEXT, toolLabel)}`;
}
