import { expect, test } from "bun:test";
import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { isSessionWorking } from "./is-session-working.service.ts";

type BusyFacts = Pick<ExtensionContext, "isIdle" | "hasPendingMessages" | "signal">;

const idleContext: BusyFacts = { isIdle: () => true, hasPendingMessages: () => false, signal: undefined };
const NO_SUBAGENTS = { running: 0, queued: 0, freeSlots: 8 };

test("an idle orchestrator with running subagents is still working", () => {
  expect(isSessionWorking(idleContext, false, { running: 4, queued: 0, freeSlots: 4 })).toBe(true);
});

test("an idle orchestrator with only queued subagents is still working", () => {
  expect(isSessionWorking(idleContext, false, { running: 0, queued: 2, freeSlots: 8 })).toBe(true);
});

test("an idle orchestrator without subagents is not working", () => {
  expect(isSessionWorking(idleContext, false, NO_SUBAGENTS)).toBe(false);
});

test("a busy orchestrator is working without subagents", () => {
  expect(isSessionWorking({ ...idleContext, isIdle: () => false }, false, NO_SUBAGENTS)).toBe(true);
});
