import { resolve } from "node:path";
import type { ValueState } from "../../../../types/activity/value/value-state.interface.ts";
import type { TaskCwd } from "../../../../types/subagents/tasks/run/task-cwd.interface.ts";
import { isDirectory } from "../../../tools/path/is-directory.service.ts";

export async function resolveTaskCwd(baseDirectory: string, requested: ValueState<string>): Promise<TaskCwd> {
  if (requested.state === "absent") return { state: "valid", path: baseDirectory };

  const path = resolve(baseDirectory, requested.value);
  if (!(await isDirectory(path))) {
    return { state: "invalid", message: `The cwd is not an existing directory: ${path}` };
  }

  return { state: "valid", path };
}
