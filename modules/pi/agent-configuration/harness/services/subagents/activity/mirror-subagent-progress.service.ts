import type { MirrorSubagentProgressInput } from "../../../types/subagents/activity/mirror-subagent-progress-input.interface.ts";
import { readToolResultFields } from "../../activity/parsing/tool-result/read-tool-result-fields.service.ts";

export function mirrorSubagentProgress(input: MirrorSubagentProgressInput): void {
  const { store, toolCallId, progress, endedAt } = input;
  const fields = { ...readToolResultFields(progress), text: progress.currentTask };

  if (progress.status === "running") {
    store.update(toolCallId, { ...fields, status: { state: "present", value: "running" } });
    return;
  }

  store.finish(toolCallId, {
    ...fields,
    status: progress.status === "success" ? "success" : "error",
    endedAt,
  });
}
