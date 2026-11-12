import { expect, test } from "bun:test";
import { formatDuration } from "./format-duration.service.ts";

test("durations under a minute read as seconds and milliseconds", () => {
  expect(formatDuration(0)).toBe("0.000s");
  expect(formatDuration(450)).toBe("0.450s");
  expect(formatDuration(4512)).toBe("4.512s");
  expect(formatDuration(59_999.9)).toBe("59.999s");
});

test("durations of a minute or more read as minutes and seconds, then hours", () => {
  expect(formatDuration(60_000)).toBe("1m 00s");
  expect(formatDuration(65_400)).toBe("1m 05s");
  expect(formatDuration(3_723_000)).toBe("1h 02m 03s");
});

test("a negative duration reads as zero", () => {
  expect(formatDuration(-5)).toBe("0.000s");
});
