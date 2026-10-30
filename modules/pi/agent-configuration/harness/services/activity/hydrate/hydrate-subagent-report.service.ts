import { activityStore } from "../../../stores/activity/activity.store.ts";
import { mirrorSubagentProgress } from "../../subagents/activity/mirror-subagent-progress.service.ts";
import { readTaskProgress } from "../../subagents/tasks/progress/read-task-progress.service.ts";

export function hydrateSubagentReport(details: unknown, endedAt: number): void {
  const lookup = readTaskProgress(details);
  if (!lookup.found) return;

  const { progress } = lookup;
  const launchedCall = activityStore
    .all()
    .find((entry) => entry.details.state === "present" && entry.details.value.id === progress.id);
  if (launchedCall === undefined) return;

  mirrorSubagentProgress({ store: activityStore, toolCallId: launchedCall.id, progress, endedAt });
}
