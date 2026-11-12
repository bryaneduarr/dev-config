import type { ThemeColor } from "@earendil-works/pi-coding-agent";
import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { ToolBoxFrame } from "./tool-box-frame.interface.ts";

/** Content shown by a tool box; setting it replaces the previous content. */
export interface ToolBoxContent {
  /** Title shown in the top border of the box. */
  readonly title: string;
  /** Body lines shown inside the box. */
  readonly lines: readonly string[];
  /** Tool call whose recorded activity the box follows. */
  readonly toolCall: ValueState<string>;
  /** Color of the border and text. */
  readonly color: ThemeColor;
  /** Reads the current frame on every render, for a box whose content changes without a new tool update. */
  readonly liveFrame: ValueState<() => ToolBoxFrame>;
}
