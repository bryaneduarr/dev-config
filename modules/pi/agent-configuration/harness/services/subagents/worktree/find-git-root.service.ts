import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { GIT_METADATA_ENTRY } from "../../../constants/subagents/worktree/worktree.constant.ts";
import type { ValueState } from "../../../types/activity/value/value-state.interface.ts";

export function findGitRoot(startDirectory: string): ValueState<string> {
  let directory = startDirectory;
  while (!existsSync(join(directory, GIT_METADATA_ENTRY))) {
    const parent = dirname(directory);
    if (parent === directory) return { state: "absent" };

    directory = parent;
  }

  return { state: "present", value: directory };
}
