import { expect, test } from "bun:test";
import { countWorkingSubagents } from "./count-working-subagents.service.ts";

test("running and queued subagents both count as working", () => {
  expect(countWorkingSubagents({ running: 3, queued: 2, freeSlots: 5 })).toBe(5);
});

test("no subagents means none are working", () => {
  expect(countWorkingSubagents({ running: 0, queued: 0, freeSlots: 8 })).toBe(0);
});
