import { APPROVED_COMMAND_TOOL } from "../../../../constants/subagents/roles/roles.constant.ts";
import { createApprovedCommandTool } from "../../../../tools/approved-command/approved-command.tool.ts";
import { createReadToolDefinition } from "../../../../tools/read/read.tool.ts";
import { createRunToolDefinition } from "../../../../tools/run/run.tool.ts";
import { createSearchToolDefinition } from "../../../../tools/search/search.tool.ts";
import type { ChildToolSet } from "../../../../types/subagents/tasks/run/child-tool-set.interface.ts";

const REPLACED_BY_SEARCH = ["grep", "find"];
const REPLACED_BY_HARNESS = ["read", "bash", ...REPLACED_BY_SEARCH, APPROVED_COMMAND_TOOL];

export function createChildToolSet(requested: readonly string[], approvedCommands: readonly string[]): ChildToolSet {
  const customTools = [
    ...(requested.includes("read") ? [createReadToolDefinition()] : []),
    ...(requested.includes("bash") ? [createRunToolDefinition("bash")] : []),
    ...(requested.some((tool) => REPLACED_BY_SEARCH.includes(tool)) ? [createSearchToolDefinition()] : []),
    ...(requested.includes(APPROVED_COMMAND_TOOL) ? [createApprovedCommandTool(approvedCommands)] : []),
  ];
  const builtIn = requested.filter((tool) => !REPLACED_BY_HARNESS.includes(tool));
  return { toolNames: [...builtIn, ...customTools.map((tool) => tool.name)], customTools };
}
