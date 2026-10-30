/** How many subagent slots are taken and free at one moment. */
export interface SubagentCapacity {
  /** Subagents running or waiting for a slot. */
  readonly running: number;
  /** Slots a new subagent could start in right away. */
  readonly freeSlots: number;
}
