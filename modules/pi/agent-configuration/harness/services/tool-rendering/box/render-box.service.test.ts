import { expect, test } from "bun:test";
import { renderBox } from "./render-box.service.ts";

const ANSI_ESCAPE = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");

test("a line wider than the box ends with an ellipsis instead of being cut silently", () => {
  const text = renderBox("RUN", ["x".repeat(100)], 30)
    .join("\n")
    .replace(ANSI_ESCAPE, "");

  expect(text).toContain(`| ${"x".repeat(23)}... |`);
});
