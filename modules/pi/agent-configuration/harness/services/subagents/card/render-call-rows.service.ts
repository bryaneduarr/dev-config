import { THEME_MUTED } from "../../../constants/split-view/theme-color.constant.ts";
import { CARD_VISIBLE_CALLS } from "../../../constants/subagents/card/card.constant.ts";
import type { RenderCallRowsInput } from "../../../types/subagents/card/render-call-rows-input.interface.ts";
import { plural } from "../../tool-rendering/text/plural.service.ts";
import { renderCallRow } from "./render-call-row.service.ts";

export function renderCallRows({ theme, calls, taskStatus, now }: RenderCallRowsInput): string[] {
  const hiddenCount = Math.max(0, calls.length - CARD_VISIBLE_CALLS);
  const rows = calls.slice(hiddenCount).map((call) => renderCallRow({ theme, call, taskStatus, now }));
  if (hiddenCount === 0) return rows;

  return [theme.fg(THEME_MUTED, plural(hiddenCount, "earlier call")), ...rows];
}
