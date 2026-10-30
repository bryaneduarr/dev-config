import { randomUUID } from "node:crypto";
import { IMPLEMENT_TASK_ROLE } from "../../../constants/subagents/roles/roles.constant.ts";
import { STOPPED_TASK_LABEL } from "../../../constants/subagents/tasks/progress/progress.constant.ts";
import {
  MAX_RUNNING_IMPLEMENT_SUBAGENTS,
  MAX_RUNNING_SUBAGENTS,
} from "../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { SubagentRun } from "../../../types/subagents/registry/subagent-run.interface.ts";
import { resolveTaskRole } from "../roles/resolve-task-role.service.ts";
import { createTaskProgress } from "../tasks/progress/create-task-progress.service.ts";
import { runTask } from "../tasks/run/run-task.service.ts";
import { createSlotLimiter } from "./create-slot-limiter.service.ts";

export function createSubagentRegistry(): SubagentRegistry {
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
    create(request, ctx) {
      const id = randomUUID();
      const controller = new AbortController();
      const resolvedRole = resolveTaskRole(request);
      const progress = createTaskProgress(id, request.title, resolvedRole);
      const runInSlot = () =>
        runTask({
          id,
          request,
          ctx,
          signal: controller.signal,
          onProgress: (nextProgress) => {
            const run = runsById.get(id);
            if (!run) return;

            run.progress = nextProgress;
          },
        });
      const execute = () => runningSlots.run(runInSlot);
      const result = resolvedRole.role === IMPLEMENT_TASK_ROLE ? implementSlots.run(execute) : execute();

      runsById.set(id, { controller, progress, result });

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
    cancel,
    clear() {
      for (const id of runsById.keys()) {
        cancel(id);
      }
      runsById.clear();
    },
  };
}
