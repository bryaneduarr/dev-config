import {
  WORKTREE_COMMIT_IDENTITY_ARGS,
  WORKTREE_COMMIT_MESSAGE_PREFIX,
} from "../../../constants/subagents/worktree/worktree.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentWorktree } from "../../../types/subagents/worktree/subagent-worktree.interface.ts";
import { runGit } from "./run-git.service.ts";

async function commitWorktreeChanges(worktree: SubagentWorktree, title: string): Promise<void> {
  const staged = await runGit(worktree.path, ["add", "-A"]);
  const committed = await runGit(worktree.path, [
    ...WORKTREE_COMMIT_IDENTITY_ARGS,
    "commit",
    "--no-verify",
    "-m",
    `${WORKTREE_COMMIT_MESSAGE_PREFIX}${title}`,
  ]);
  if (staged.code === 0 && committed.code === 0) return;

  throw new Error(
    `Could not commit the subagent changes; they remain uncommitted in ${worktree.path}: ${committed.stderr.trim() || staged.stderr.trim()}`,
  );
}

export async function finishSubagentWorktree(worktree: SubagentWorktree, title: string): Promise<ValueState<string>> {
  const status = await runGit(worktree.path, ["status", "--porcelain"]);
  const hasChanges = status.stdout.trim() !== "";
  if (hasChanges) await commitWorktreeChanges(worktree, title);

  await runGit(worktree.repoRoot, ["worktree", "remove", "--force", worktree.path]);
  if (hasChanges) return { state: "present", value: worktree.branch };

  await runGit(worktree.repoRoot, ["branch", "-D", worktree.branch]);
  return { state: "absent" };
}
