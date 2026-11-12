import type { Component } from "@earendil-works/pi-tui";
import type { ValueState } from "../../activity/value/value-state.interface.ts";
import type { BuildSubagentCardFrameInput } from "./build-subagent-card-frame-input.interface.ts";

/** Inputs that render the box of one subagent tool call. */
export interface RenderSubagentCardInput extends BuildSubagentCardFrameInput {
  /** Component Pi rendered for this call before, reused when it is a box. */
  readonly lastComponent: ValueState<Component>;
}
