import type { SlotLimiter } from "../../../types/subagents/registry/slot-limiter.interface.ts";

export function createSlotLimiter(capacity: number): SlotLimiter {
  let occupiedSlots = 0;
  const waitingForSlot: Array<() => void> = [];

  const acquireSlot = async (): Promise<void> => {
    if (occupiedSlots < capacity) {
      occupiedSlots += 1;
      return;
    }

    await new Promise<void>((resolve) => {
      waitingForSlot.push(resolve);
    });
  };

  const releaseSlot = (): void => {
    const nextWaiting = waitingForSlot.shift();
    if (nextWaiting === undefined) {
      occupiedSlots -= 1;
      return;
    }

    nextWaiting();
  };

  return {
    async run<T>(operation: () => Promise<T>): Promise<T> {
      await acquireSlot();

      try {
        return await operation();
      } finally {
        releaseSlot();
      }
    },
  };
}
