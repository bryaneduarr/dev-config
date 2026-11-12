import { THEME_ACCENT, THEME_TEXT } from "../../../constants/split-view/theme-color.constant.ts";
import { CARD_BOX_TITLE, CARD_WORKING_LABEL } from "../../../constants/subagents/card/card.constant.ts";
import type { BuildSubagentCardFrameInput } from "../../../types/subagents/card/build-subagent-card-frame-input.interface.ts";
import type { ToolBoxFrame } from "../../../types/tool-rendering/box/tool-box-frame.interface.ts";
import { readToolActivity } from "../../activity/store/read-tool-activity.service.ts";
import { oneLine } from "../../tool-rendering/text/one-line.service.ts";
import { renderCallRows } from "./render-call-rows.service.ts";
import { renderFinalStatusLine } from "./render-final-status-line.service.ts";
import { renderIdleLines } from "./render-idle-lines.service.ts";
import { renderTotalTimeLine } from "./render-total-time-line.service.ts";
import { resolveCardCalls } from "./resolve-card-calls.service.ts";
import { resolveCardProgress } from "./resolve-card-progress.service.ts";
import { resolveCardStatus } from "./resolve-card-status.service.ts";
import { resolveCardTitle } from "./resolve-card-title.service.ts";

export function buildSubagentCardFrame(input: BuildSubagentCardFrameInput): ToolBoxFrame {
  const { theme, toolCallId, title, readProgress } = input;
  const now = Date.now();
  const progressLookup = readProgress();
  const activityLookup = readToolActivity({ state: "present", value: toolCallId });
  const current = resolveCardProgress(progressLookup, activityLookup);
  const taskStatus = resolveCardStatus(current, activityLookup);
  const calls = resolveCardCalls(progressLookup, activityLookup);
  const isWorking = taskStatus === "running";
  const statusLine = isWorking ? theme.fg("warning", CARD_WORKING_LABEL) : renderFinalStatusLine(theme, taskStatus);
  const activity =
    calls.length > 0 ? renderCallRows({ theme, calls, taskStatus, now }) : renderIdleLines(theme, taskStatus);
  const totalTime = renderTotalTimeLine({ theme, activityLookup, taskStatus, now });
  const boxTitle = theme.fg("toolTitle", theme.bold(CARD_BOX_TITLE));

  return {
    title: isWorking ? `${theme.fg(THEME_ACCENT, "/")} ${boxTitle}` : boxTitle,
    lines: [
      theme.fg(THEME_TEXT, oneLine(resolveCardTitle(current, title, activityLookup))),
      statusLine,
      ...activity,
      ...(totalTime.state === "present" ? [totalTime.value] : []),
    ],
    color: taskStatus === "error" ? "error" : THEME_ACCENT,
  };
}
