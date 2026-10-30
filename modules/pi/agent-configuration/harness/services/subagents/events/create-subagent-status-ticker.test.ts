import { afterEach, expect, jest, test } from "bun:test";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SUBAGENT_STATUS_REFRESH_INTERVAL_MS } from "../../../constants/subagents/registry/subagent-status.constant.ts";
import type { SubagentCapacity } from "../../../types/subagents/registry/subagent-capacity.interface.ts";
import { createSubagentStatusTicker } from "./create-subagent-status-ticker.service.ts";

type StatusText = Parameters<ExtensionContext["ui"]["setStatus"]>[1];

const FAKE_STATUS_TEXTS: StatusText[] = [];
const fakeContext = {
  hasUI: true,
  ui: {
    setStatus: (_key: string, text: StatusText) => {
      FAKE_STATUS_TEXTS.push(text);
    },
  },
};

function registryReporting(capacity: SubagentCapacity) {
  return { capacity: () => capacity };
}

afterEach(() => {
  FAKE_STATUS_TEXTS.length = 0;
  jest.useRealTimers();
});

test("shows how many subagents are working and clears the status when stopped", () => {
  jest.useFakeTimers();
  const ticker = createSubagentStatusTicker(registryReporting({ running: 3, queued: 1, freeSlots: 5 }));

  ticker.start(fakeContext);
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 3);
  ticker.stop();

  expect(FAKE_STATUS_TEXTS).toEqual(["Subagents: 4 working", undefined]);
});

test("shows nothing while no subagent is working", () => {
  jest.useFakeTimers();
  const ticker = createSubagentStatusTicker(registryReporting({ running: 0, queued: 0, freeSlots: 8 }));

  ticker.start(fakeContext);
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 2);

  expect(FAKE_STATUS_TEXTS).toEqual([]);
  ticker.stop();
});

test("does nothing without a terminal UI", () => {
  jest.useFakeTimers();
  const ticker = createSubagentStatusTicker(registryReporting({ running: 2, queued: 0, freeSlots: 6 }));

  ticker.start({ ...fakeContext, hasUI: false });
  jest.advanceTimersByTime(SUBAGENT_STATUS_REFRESH_INTERVAL_MS * 2);
  ticker.stop();

  expect(FAKE_STATUS_TEXTS).toEqual([]);
});
