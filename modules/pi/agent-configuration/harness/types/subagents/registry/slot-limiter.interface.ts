/** Runs operations with a fixed number of them active at once, starting waiting ones in the order they were queued. */
export interface SlotLimiter {
  /** Waits for a free slot, runs the operation, and hands the slot to the next waiting operation when it settles. */
  run<T>(operation: () => Promise<T>): Promise<T>;
}
