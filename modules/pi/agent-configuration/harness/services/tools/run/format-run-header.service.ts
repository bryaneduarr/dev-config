import { COMMAND_NOT_FOUND_EXIT_CODE } from "../../../constants/tools/process/process.constant.ts";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";

const MISSING_PROGRAM_PATTERN = /not found|ENOENT/;

export function formatRunHeader(result: ExecResult, missingCommandHint: string): string {
  const isTerminated = result.killed && !result.timedOut;
  const isMissingCommand = result.code === COMMAND_NOT_FOUND_EXIT_CODE && MISSING_PROGRAM_PATTERN.test(result.stderr);
  return [
    `exit: ${result.code}`,
    result.timedOut ? "timed out" : "",
    isTerminated ? "terminated" : "",
    isMissingCommand ? missingCommandHint : "",
  ]
    .filter(Boolean)
    .join("\n");
}
