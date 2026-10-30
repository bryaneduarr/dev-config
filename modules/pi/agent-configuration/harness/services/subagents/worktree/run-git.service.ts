import { GIT_PROGRAM, WORKTREE_GIT_TIMEOUT_MS } from "../../../constants/subagents/worktree/worktree.constant.ts";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";
import { runCommand } from "../../tools/process/run-command.service.ts";

export function runGit(cwd: string, args: readonly string[]): Promise<ExecResult> {
  return runCommand({
    cwd,
    command: { form: "argv", argv: [GIT_PROGRAM, ...args] },
    timeoutMs: WORKTREE_GIT_TIMEOUT_MS,
    cancellation: { kind: "uncancellable" },
  });
}
