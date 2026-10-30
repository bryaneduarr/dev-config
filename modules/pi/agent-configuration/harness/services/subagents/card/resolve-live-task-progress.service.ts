import type { SubagentRegistry } from "../../../types/subagents/registry/subagent-registry.interface.ts";
import type { TaskProgressLookup } from "../../../types/subagents/tasks/progress/task-progress-lookup.interface.ts";

export function resolveLiveTaskProgress(registry: SubagentRegistry, recorded: TaskProgressLookup): TaskProgressLookup {
  if (!recorded.found) return recorded;

  const live = registry.status(recorded.progress.id);

  return live.found ? live : recorded;
}
