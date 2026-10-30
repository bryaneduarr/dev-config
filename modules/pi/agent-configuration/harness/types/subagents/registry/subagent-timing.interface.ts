import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** When a run was accepted and when it got a slot. */
export interface SubagentTiming {
  /** Time the run was accepted, in milliseconds since the epoch. */
  readonly queuedAt: number;
  /** Time the run got a slot and began, in milliseconds since the epoch; absent while it waits. */
  startedAt: ValueState<number>;
}
