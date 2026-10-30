import { expect, test } from "bun:test";
import { createSlotLimiter } from "./create-slot-limiter.service.ts";
import { createGate } from "./create-slot-limiter.test-double.ts";

test("a single slot runs operations one at a time", async () => {
  const limiter = createSlotLimiter(1);
  const firstStarted = createGate();
  const firstGate = createGate();
  const events: string[] = [];

  const first = limiter.run(async () => {
    events.push("first started");
    firstStarted.open();
    await firstGate.opened;
    events.push("first finished");
  });
  await firstStarted.opened;

  const second = limiter.run(async () => {
    events.push("second started");
  });
  await Promise.resolve();

  expect(events).toEqual(["first started"]);
  firstGate.open();
  await Promise.all([first, second]);

  expect(events).toEqual(["first started", "first finished", "second started"]);
});

test("a finished operation hands its slot to the next waiting one while the others keep running", async () => {
  const limiter = createSlotLimiter(2);
  const firstGate = createGate();
  const secondGate = createGate();
  const thirdGate = createGate();
  const started: string[] = [];
  const runGated = (name: string, gate: { readonly opened: Promise<void> }) =>
    limiter.run(async () => {
      started.push(name);
      await gate.opened;
    });

  const first = runGated("first", firstGate);
  const second = runGated("second", secondGate);
  const third = runGated("third", thirdGate);
  await Promise.resolve();

  expect(started).toEqual(["first", "second"]);

  secondGate.open();
  await second;
  await Promise.resolve();

  expect(started).toEqual(["first", "second", "third"]);

  firstGate.open();
  thirdGate.open();
  await Promise.all([first, third]);
});

test("a failed operation still frees its slot", async () => {
  const limiter = createSlotLimiter(1);

  const failed = limiter.run(async () => {
    throw new Error("failed");
  });
  const next = limiter.run(async () => "ran");

  expect(failed).rejects.toThrow("failed");
  expect(await next).toBe("ran");
});
