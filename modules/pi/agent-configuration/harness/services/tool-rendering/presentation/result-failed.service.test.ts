import { expect, test } from "bun:test";
import { tmpdir } from "node:os";
import { DEFAULT_RUN_TIMEOUT_MS } from "../../../constants/tools/run/run-limits.constant.ts";
import { runShell } from "../../tools/run/run-shell.service.ts";
import { resultFailed } from "./result-failed.service.ts";

function runInTemporaryDirectory(command: string): Promise<string> {
  return runShell({
    cwd: tmpdir(),
    directory: tmpdir(),
    command,
    timeoutMs: DEFAULT_RUN_TIMEOUT_MS,
    missingCommandHint: "command not found",
    cancellation: { kind: "uncancellable" },
  });
}

test("a run that exits with code 0 is not a failure, with or without output", async () => {
  expect(resultFailed("bash", await runInTemporaryDirectory("true"))).toBe(false);
  expect(resultFailed("bash", await runInTemporaryDirectory("printf listed"))).toBe(false);
});

test("a run that exits with a nonzero code is a failure", async () => {
  expect(resultFailed("bash", await runInTemporaryDirectory("exit 1"))).toBe(true);
  expect(resultFailed("bash", await runInTemporaryDirectory("exit 10"))).toBe(true);
});
