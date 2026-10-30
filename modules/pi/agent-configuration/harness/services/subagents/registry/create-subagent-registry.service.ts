import { randomUUID } from "node:crypto";
import { IMPLEMENT_TASK_ROLE } from "../../../constants/subagents/roles/roles.constant.ts";
import {
  CANCELLED_BEFORE_START_ERROR_MESSAGE,
  STOPPED_TASK_LABEL,
} from "../../../constants/subagents/tasks/progress/progress.constant.ts";
import {
  MAX_RUNNING_IMPLEMENT_SUBAGENTS,
  MAX_RUNNING_SUBAGENTS,
} from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { SubagentRun } from "../../../types/subagents/registry/subagent-run.interface.ts";
import type { SubagentTiming } from "../../../types/subagents/registry/subagent-timing.interface.ts";
import type { TaskProgress } from "../../../types/subagents/tasks/progress/task-progress.interface.ts";
import type { TeamMailbox } from "../../../types/subagents/team/team-mailbox.interface.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { createTaskProgress } from "../tasks/progress/create-task-progress.service.ts";
import { runTask } from "../tasks/run/run-task.service.ts";
import { readTeamNameRefusal } from "../team/read-team-name-refusal.service.ts";
import { findGitRoot } from "../worktree/find-git-root.service.ts";
import { runTaskInWorktree } from "../worktree/run-task-in-worktree.service.ts";
import { createSlotLimiter } from "./create-slot-limiter.service.ts";
import { readSlotWait } from "./read-slot-wait.service.ts";
import { readSubagentCapacity } from "./read-subagent-capacity.service.ts";

const absentRoot: ValueState<string> = { state: "absent" };

function runningNameOf(run: SubagentRun): readonly string[] {
  return run.progress.status === "running" && run.name.state === "present" ? [run.name.value] : [];
}

export function createSubagentRegistry(mailbox: TeamMailbox): SubagentRegistry {
  const runningSlots = createSlotLimiter(MAX_RUNNING_SUBAGENTS);
  const implementSlots = createSlotLimiter(MAX_RUNNING_IMPLEMENT_SUBAGENTS);
  const runsById = new Map<string, SubagentRun>();

  const cancel = (id: string): boolean => {
    const run = runsById.get(id);
    if (run === undefined) return false;
    if (run.progress.status !== "running") return false;

    run.controller.abort();
    return true;
  };

  return {
    create(request, ctx, onProgress) {
      const nameRefusal = readTeamNameRefusal(request.name, [...runsById.values()].flatMap(runningNameOf));
      if (nameRefusal.state === "present") throw new Error(nameRefusal.value);

      const id = randomUUID();
      const controller = new AbortController();
      const resolvedRole = resolveTaskRole(request);
      const progress = createTaskProgress(id, request.title, resolvedRole);
      const repoRoot = resolvedRole.role === IMPLEMENT_TASK_ROLE ? findGitRoot(request.cwd) : absentRoot;
      const timing: SubagentTiming = { queuedAt: Date.now(), startedAt: { state: "absent" } };
      const runInSlot = async () => {
        if (controller.signal.aborted) throw new Error(CANCELLED_BEFORE_START_ERROR_MESSAGE);

        timing.startedAt = { state: "present", value: Date.now() };

        const input = {
          id,
          request,
          ctx,
          mailbox,
          signal: controller.signal,
          onProgress: (nextProgress: TaskProgress) => {
            const run = runsById.get(id);
            if (run !== undefined) run.progress = nextProgress;
            onProgress(nextProgress);
          },
        };

        return repoRoot.state === "present" ? runTaskInWorktree(input, repoRoot.value) : runTask(input);
      };
      const execute = () => runningSlots.run(runInSlot);
      const needsImplementLane = resolvedRole.role === IMPLEMENT_TASK_ROLE && repoRoot.state === "absent";
      const result = needsImplementLane ? implementSlots.run(execute) : execute();

      runsById.set(id, { controller, progress, result, timing, name: request.name });

      void result.catch(() => {
        const run = runsById.get(id);
        if (!run) return;

        run.progress = {
          ...run.progress,
          currentTask: STOPPED_TASK_LABEL,
          status: "error",
        };
      });

      return { id, progress, result };
    },
    status(id) {
      const run = runsById.get(id);
      if (!run) return { found: false };

      return { found: true, progress: run.progress };
    },
    list() {
      return [...runsById.values()].map((run) => run.progress);
    },
    capacity() {
      return readSubagentCapacity([...runsById.values()]);
    },
    slotWait(id) {
      const run = runsById.get(id);
      if (run === undefined) return { state: "absent" };

      return readSlotWait(run.timing);
    },
    cancel,
    clear() {
      for (const id of runsById.keys()) {
        cancel(id);
      }
      runsById.clear();
    },
  };
}
