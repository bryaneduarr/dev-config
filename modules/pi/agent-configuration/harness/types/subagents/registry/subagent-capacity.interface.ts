/** How many subagent slots are taken and free at one moment. */
export interface SubagentCapacity {
  /** Subagents that hold a slot and are working. */
  readonly running: number;
  /** Subagents accepted but still waiting for a slot. */
  readonly queued: number;
  /** Slots a new subagent could start in right away. */
  readonly freeSlots: number;
}
