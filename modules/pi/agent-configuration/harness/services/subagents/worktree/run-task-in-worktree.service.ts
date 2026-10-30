import { join, relative } from "node:path";
import { WORKTREE_ISOLATION_NOTE } from "../../../constants/subagents/worktree/worktree.constant.ts";
import type { TaskResult } from "../../../types/subagents/result/task-result.interface.ts";
import type { RunTaskInput } from "../../../types/subagents/tasks/run/run-task-input.interface.ts";
import { runTask } from "../tasks/run/run-task.service.ts";
import { withSubagentWorktree } from "./with-subagent-worktree.service.ts";

export async function runTaskInWorktree(input: RunTaskInput, repoRoot: string): Promise<TaskResult> {
  const { request } = input;
  const { outcome, branch } = await withSubagentWorktree({
    repoRoot,
    id: input.id,
    title: request.title,
    run: (worktree) => {
      const existingContext = request.context.state === "present" ? `${request.context.value}\n\n` : "";

      return runTask({
        ...input,
        request: {
          ...request,
          cwd: join(worktree.path, relative(repoRoot, request.cwd)),
          context: { state: "present", value: `${existingContext}${WORKTREE_ISOLATION_NOTE}` },
        },
      });
    },
  });

  return { ...outcome, branch };
}
