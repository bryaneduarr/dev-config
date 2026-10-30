import type { ValueState } from "../../activity/value/value-state.interface.ts";

/** What an operation returned and the branch that holds its changes. */
export interface WorktreeOutcome<T> {
  /** Value the operation returned. */
  readonly outcome: T;
  /** Branch with the committed changes; absent when the operation changed nothing. */
  readonly branch: ValueState<string>;
}
