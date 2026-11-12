import { afterEach, expect, jest, test } from "bun:test";
import { SUBAGENT_STATUS_REFRESH_INTERVAL_MS } from "../../../constants/subagents/registry/subagent-status.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import { createSubagentSettleWatcher } from "./create-subagent-settle-watcher.service.ts";

const IDLE_CONTEXT = { isIdle: () => true, hasPendingMessages: () => false };

afterEach(() => {
  jest.useRealTimers();
});

test("settles only after the last subagent has finished", () => {
  jest.useFakeTimers();
  let capacity: SubagentCapacity = { running: 2, queued: 0, freeSlots: 6 };
  const watcher = createSubagentSettleWatcher({ capacity: () => capacity });
  let settled = 0;

  expect(watcher.hasWorkingSubagents()).toBe(true);
  watcher.holdUntilSettled(IDLE_CONTEXT, () => settled++);
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 3);
  expect(settled).toBe(0);

  capacity = { running: 0, queued: 0, freeSlots: 8 };
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 3);
  expect(settled).toBe(1);
  expect(watcher.hasWorkingSubagents()).toBe(false);
});

test("waits while the main agent is busy with the report of a finished subagent", () => {
  jest.useFakeTimers();
  let isIdle = false;
  const watcher = createSubagentSettleWatcher({ capacity: () => ({ running: 0, queued: 0, freeSlots: 8 }) });
  let settled = 0;

  watcher.holdUntilSettled({ isIdle: () => isIdle, hasPendingMessages: () => false }, () => settled++);
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 2);
  expect(settled).toBe(0);

  isIdle = true;
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS);
  expect(settled).toBe(1);
});

test("never settles after it was released", () => {
  jest.useFakeTimers();
  const watcher = createSubagentSettleWatcher({ capacity: () => ({ running: 0, queued: 0, freeSlots: 8 }) });
  let settled = 0;

  watcher.holdUntilSettled(IDLE_CONTEXT, () => settled++);
  watcher.release();
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 3);

  expect(settled).toBe(0);
});
