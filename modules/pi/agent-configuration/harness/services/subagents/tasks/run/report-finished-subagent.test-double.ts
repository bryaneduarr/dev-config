import { MAX_RUNNING_SUBAGENTS } from "../../../../constants/subagents/tasks/run/task-limit.constant.ts";
import type { SubagentHandle } from "../../../../types/subagents/registry/subagent-handle.interface.ts";
import type { SubagentRegistry } from "../../../../types/subagents/registry/subagent-registry.interface.ts";
import type { TaskResult } from "../../../../types/subagents/result/task-result.interface.ts";
import type { TaskProgress } from "../../../../types/subagents/tasks/progress/task-progress.interface.ts";
import { resolveTaskRole } from "../../roles/resolve-task-role.service.ts";
import { absent } from "../../roles/resolve-task-role.test-double.ts";
import { createTaskProgress } from "../progress/create-task-progress.service.ts";

export function runningProgress(id: string): TaskProgress {
  const role = resolveTaskRole({ role: absent, tools: absent, verificationCommands: absent });

  return createTaskProgress(id, `Task ${id}`, role);
}

export function succeededResult(progress: TaskProgress): TaskResult {
  return {
    ...progress,
    status: "success",
    summary: "done",
    findings: [],
    unresolvedQuestions: [],
    checks: [],
    filesChanged: [],
    risks: [],
    errors: [],
    branch: { state: "absent" },
  };
}

export function registryOf(runs: readonly TaskProgress[]): SubagentRegistry {
  const running = runs.filter((candidate) => candidate.status === "running").length;

  const unavailable = (): never => {
    throw new Error("not used by this test");
  };

  return {
    create: unavailable,
    status(id) {
      const run = runs.find((candidate) => candidate.id === id);

      return run === undefined ? { found: false } : { found: true, progress: run };
    },
    list: () => runs,
    capacity: () => ({ running, queued: 0, freeSlots: MAX_RUNNING_SUBAGENTS - running }),
    slotWait: () => ({ state: "absent" }),
    cancel: unavailable,
    clear: unavailable,
  };
}

export function handleOf(progress: TaskProgress, result: Promise<TaskResult>): SubagentHandle {
  return { id: progress.id, progress, result };
}
