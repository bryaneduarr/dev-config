import {
  FIND_ACTION_FLAGS,
  FIND_ADVICE_MESSAGE,
  GREP_ADVICE_MESSAGE,
  MAX_SLEEP_SECONDS,
  READ_ADVICE_MESSAGE,
  SLEEP_REDIRECT_MESSAGE,
} from "../../../constants/tools/run/run-policy.constant.ts";
import type { RunPolicyVerdict } from "../../../types/tools/run/run-policy-verdict.interface.ts";

const ALLOWED: RunPolicyVerdict = { verdict: "allowed" };
const SECONDS_PER_UNIT: Readonly<Record<string, number>> = { m: 60, h: 3600 };
const DURATION_PATTERN = /^\d+(?:\.\d+)?[smh]?$/;
const RECURSIVE_FLAG_PATTERN = /^(?:--recursive|-[A-Za-z]*[rR][A-Za-z]*)$/;
const QUIET_FLAG_PATTERN = /^(?:--quiet|--silent|-[A-Za-z]*n[A-Za-z]*)$/;
const FOLLOW_FLAG_PATTERN = /^(?:--follow(?:=\w+)?|-[A-Za-z]*[fF][A-Za-z]*)$/;

function redirected(message: string): RunPolicyVerdict {
  return { verdict: "redirected", message };
}

function advised(message: string): RunPolicyVerdict {
  return { verdict: "advised", message };
}

function operandsOf(args: readonly string[]): readonly string[] {
  return args.filter((arg) => !arg.startsWith("-") && !arg.startsWith(">") && !arg.startsWith("<"));
}

function readsFiles(program: string, args: readonly string[]): boolean {
  const hasRedirect = args.some((arg) => arg.startsWith(">") || arg.startsWith("<"));
  const names = operandsOf(args).filter((operand) => !/^\d+$/.test(operand));
  const isFollowing = program === "tail" && args.some((arg) => FOLLOW_FLAG_PATTERN.test(arg));
  return !hasRedirect && !isFollowing && names.length > 0;
}

function sedPrintsFile(args: readonly string[]): boolean {
  const printsOnly = args.some((arg) => QUIET_FLAG_PATTERN.test(arg)) && !args.includes("-i");
  return printsOnly && operandsOf(args).length >= 2;
}

function grepsFiles(args: readonly string[]): boolean {
  return args.some((arg) => RECURSIVE_FLAG_PATTERN.test(arg)) || operandsOf(args).length >= 2;
}

function secondsOf(duration: string): number {
  const seconds = Number.parseFloat(duration);
  const multiplier = SECONDS_PER_UNIT[duration.slice(-1)];
  return multiplier === undefined ? seconds : seconds * multiplier;
}

function sleepsTooLong(args: readonly string[]): boolean {
  const duration = operandsOf(args).join("");
  return DURATION_PATTERN.test(duration) && secondsOf(duration) >= MAX_SLEEP_SECONDS;
}

export function checkShellProgram(program: string, args: readonly string[]): RunPolicyVerdict {
  const isFileRead = ["cat", "head", "tail"].includes(program) && readsFiles(program, args);
  if (isFileRead || (program === "sed" && sedPrintsFile(args))) return advised(READ_ADVICE_MESSAGE);
  if (["grep", "egrep", "fgrep"].includes(program) && grepsFiles(args)) return advised(GREP_ADVICE_MESSAGE);
  const listsOnly = !args.some((arg) => FIND_ACTION_FLAGS.includes(arg));
  if (program === "find" && listsOnly) return advised(FIND_ADVICE_MESSAGE);
  if (program === "sleep" && sleepsTooLong(args)) return redirected(SLEEP_REDIRECT_MESSAGE);

  return ALLOWED;
}
