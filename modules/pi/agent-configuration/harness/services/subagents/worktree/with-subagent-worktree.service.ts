import type { WithSubagentWorktreeInput } from "../../../types/subagents/worktree/with-subagent-worktree-input.interface.ts";
import type { WorktreeOutcome } from "../../../types/subagents/worktree/worktree-outcome.interface.ts";
import { createSubagentWorktree } from "./create-subagent-worktree.service.ts";
import { finishSubagentWorktree } from "./finish-subagent-worktree.service.ts";

export async function withSubagentWorktree<T>(input: WithSubagentWorktreeInput<T>): Promise<WorktreeOutcome<T>> {
  const worktree = await createSubagentWorktree(input.repoRoot, input.id);
  try {
    const outcome = await input.run(worktree);
    return { outcome, branch: await finishSubagentWorktree(worktree, input.title) };
  } catch (error) {
    await finishSubagentWorktree(worktree, input.title).catch(() => ({ state: "absent" }));
    throw error;
  }
}
