import { EXPLORATION_PROGRAMS, READ_ONLY_GIT_SUBCOMMANDS } from "../../../constants/tools/run/run-policy.constant.ts";

function isReadOnlyGit(args: readonly string[]): boolean {
  const subcommand = args.find((arg) => !arg.startsWith("-"));
  return subcommand !== undefined && READ_ONLY_GIT_SUBCOMMANDS.includes(subcommand);
}

export function isExplorationProgram(program: string, args: readonly string[]): boolean {
  if (program === "git") return isReadOnlyGit(args);
  if (program === "sed") return !args.some((arg) => /^-[A-Za-z]*i/.test(arg) || arg === "--in-place");

  return EXPLORATION_PROGRAMS.includes(program);
}
