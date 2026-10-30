import type { SlotLimiter } from "../../../types/subagents/registry/slot-limiter.interface.ts";

export function createSlotLimiter(capacity: number): SlotLimiter {
  let occupiedSlots = 0;
  const waitingForSlot: Array<() => void> = [];

  const releaseSlot = (): void => {
    const nextWaiting = waitingForSlot.shift();
    if (nextWaiting === undefined) {
      occupiedSlots -= 1;
      return;
    }

    nextWaiting();
  };

  const runAndRelease = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
      return await operation();
    } finally {
      releaseSlot();
    }
  };

  return {
    run<T>(operation: () => Promise<T>): Promise<T> {
      if (occupiedSlots < capacity) {
        occupiedSlots += 1;
        return runAndRelease(operation);
      }

      return new Promise<void>((resolve) => {
        waitingForSlot.push(resolve);
      }).then(() => runAndRelease(operation));
    },
  };
}
