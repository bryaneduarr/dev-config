import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MAX_READ_BATCH_CHARS } from "../../../constants/tools/read/read-limits.constant.ts";
import { readFiles } from "./read-files.service.ts";
import { toReadRequests } from "./to-read-requests.service.ts";

let directory = "";

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), "read-files-"));
  writeFileSync(join(directory, "a.ts"), "export const a = 1;\nexport const b = 2;\n");
  writeFileSync(join(directory, "b.ts"), `${"const filler = 0;\n".repeat(800)}`);
  writeFileSync(join(directory, "c.ts"), "export function third() {\n  return 3;\n}\n");
});

afterAll(() => rmSync(directory, { recursive: true, force: true }));

test("one path behaves as before and several files come back in one labelled result", async () => {
  const single = await readFiles(toReadRequests({ path: "a.ts" }, directory));
  expect(single).toContain("a.ts (2 lines)");

  const batch = await readFiles(toReadRequests({ files: ["a.ts", { path: "c.ts", symbol: "third" }] }, directory));
  expect(batch).toContain("a.ts (2 lines)");
  expect(batch).toContain("c.ts");
  expect(batch).toContain("return 3;");
});

test("a missing file reports its own error without hiding the others", async () => {
  const batch = await readFiles(toReadRequests({ files: ["missing.ts", "a.ts"] }, directory));
  expect(batch).toContain("Unable to read missing.ts");
  expect(batch).toContain("export const a = 1;");
});

test("the combined output stays within the batch limit by omitting later files", async () => {
  const requests = toReadRequests(
    { files: ["b.ts", "b.ts", "b.ts", "b.ts", "b.ts"].map((path) => ({ path, offset: 1, limit: 700 })) },
    directory,
  );
  const batch = await readFiles(requests);
  expect(batch.length).toBeLessThan(MAX_READ_BATCH_CHARS + 2000);
  expect(batch).toContain("omitted because the combined output reached its limit");
});

test("a directory path lists its entries, folders marked with a slash", async () => {
  mkdirSync(join(directory, "rules"));
  writeFileSync(join(directory, "rules", "code-style.md"), "# style\n");
  const listing = await readFiles(toReadRequests({ files: [".", "rules"] }, directory));
  expect(listing).toContain("rules/ (1 entries)\ncode-style.md");
  expect(listing).toContain("a.ts\nb.ts\nc.ts\nrules/");
});

test("asking for nothing says what to pass", async () => {
  expect(await readFiles(toReadRequests({}, directory))).toContain("read needs a path");
});
