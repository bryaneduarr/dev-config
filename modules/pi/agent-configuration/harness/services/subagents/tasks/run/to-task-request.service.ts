import type { TaskInput } from "../../../../types/subagents/tasks/run/task-input.interface.ts";
import type { TaskRequest } from "../../../../types/subagents/tasks/run/task-request.interface.ts";
import { toValueState } from "../../../activity/value/to-value-state.service.ts";

export function toTaskRequest(input: TaskInput, cwd: string): TaskRequest {
  return {
    cwd,
    name: toValueState(input.name),
    talksTo: toValueState(input.talksTo),
    title: input.title,
    mission: input.mission,
    role: toValueState(input.role),
    tools: toValueState(input.tools),
    verificationCommands: toValueState(input.verificationCommands),
    context: toValueState(input.context),
    model: toValueState(input.model),
    reasoning: toValueState(input.reasoning),
    skills: toValueState(input.skills),
    timeoutMs: toValueState(input.timeoutMs),
  };
}
