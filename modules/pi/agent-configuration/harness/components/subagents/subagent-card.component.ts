import type { Component } from "@earendil-works/pi-tui";
import { THEME_ACCENT } from "../../constants/split-view/theme-color.constant.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { buildSubagentCardFrame } from "../../services/subagents/card/build-subagent-card-frame.service.ts";
import type { ValueState } from "../../types/activity/value/value-state.interface.ts";
import type { RenderSubagentCardInput } from "../../types/subagents/card/render-subagent-card-input.interface.ts";
import type { SubagentCardTheme } from "../../types/subagents/card/subagent-card-theme.interface.ts";
import { ToolBox } from "../tool-rendering/tool-box.component.ts";

function reusableBox(theme: SubagentCardTheme, lastComponent: ValueState<Component>): ToolBox {
  if (lastComponent.state === "present" && lastComponent.value instanceof ToolBox) return lastComponent.value;

  return new ToolBox(theme, "", [], THEME_ACCENT, false);
}

export function renderSubagentCard(input: RenderSubagentCardInput): Component {
  const { theme, toolCallId, lastComponent } = input;
  const readFrame = () => buildSubagentCardFrame(input);
  const frame = readFrame();

  const box = reusableBox(theme, lastComponent);
  box.setContent({
    ...frame,
    toolCall: toValueState(toolCallId),
    liveFrame: { state: "present", value: readFrame },
  });
  return box;
}
