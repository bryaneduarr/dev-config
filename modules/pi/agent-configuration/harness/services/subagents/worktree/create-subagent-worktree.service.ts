import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  WORKTREE_BRANCH_ID_LENGTH,
  WORKTREE_BRANCH_PREFIX,
  WORKTREE_PARENT_DIRECTORY_NAME,
} from "../../../constants/subagents/worktree/worktree.constant.ts";
import type { SubagentWorktree } from "../../../types/subagents/worktree/subagent-worktree.interface.ts";
import { runGit } from "./run-git.service.ts";

export async function createSubagentWorktree(repoRoot: string, id: string): Promise<SubagentWorktree> {
  const shortId = id.slice(0, WORKTREE_BRANCH_ID_LENGTH);
  const branch = `${WORKTREE_BRANCH_PREFIX}${shortId}`;
  const path = join(tmpdir(), WORKTREE_PARENT_DIRECTORY_NAME, shortId);
  const added = await runGit(repoRoot, ["worktree", "add", "-b", branch, path, "HEAD"]);
  if (added.code !== 0) throw new Error(`Could not create a checkout for the subagent: ${added.stderr.trim()}`);

  return { repoRoot, path, branch };
}
