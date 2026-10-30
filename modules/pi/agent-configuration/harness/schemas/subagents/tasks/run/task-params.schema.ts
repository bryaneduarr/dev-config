import { StringEnum } from "@earendil-works/pi-ai";
import { Type } from "typebox";
import { SUBAGENT_TOOLS, TASK_ROLES } from "../../../../constants/subagents/roles/roles.constant.ts";
import { REASONING_LEVELS } from "../../../../constants/subagents/tasks/model/reasoning.constant.ts";
import {
  TASK_TIMEOUT_MAX_MS,
  TASK_TIMEOUT_MIN_MS,
  TASK_TITLE_MAX_LENGTH,
} from "../../../../constants/subagents/tasks/run/task-limit.constant.ts";
import { TEAM_MESSAGE_TOOL_NAME, TEAM_NAME_PATTERN } from "../../../../constants/subagents/team/team.constant.ts";

export const TaskParams = Type.Object({
  /** Label shown for the worker in the conversation and status list. */
  title: Type.String({
    minLength: 1,
    maxLength: TASK_TITLE_MAX_LENGTH,
    description: "Short title shown in the conversation.",
  }),
  /** Instruction the isolated worker carries out. */
  mission: Type.String({
    minLength: 1,
    description: "One concrete mission for this isolated worker.",
  }),
  /** Role that selects the worker's instructions and default tools. */
  role: Type.Optional(
    StringEnum(TASK_ROLES, {
      description: "Worker role. Defaults to the legacy generic task behavior when omitted.",
    }),
  ),
  /** Background the worker needs; the parent transcript is never inherited. */
  context: Type.Optional(
    Type.String({
      description: "Only the background needed for this mission. No parent transcript is inherited.",
    }),
  ),
  /** Name that lets teammates and the orchestrator message the worker. */
  name: Type.Optional(
    Type.String({
      pattern: TEAM_NAME_PATTERN,
      description: `Short lowercase name, unique among running subagents. Set only for a worker that may need to coordinate; it then gets the ${TEAM_MESSAGE_TOOL_NAME} tool.`,
    }),
  ),
  /** Names of the teammates the worker may message. */
  talksTo: Type.Optional(
    Type.Array(Type.String({ pattern: TEAM_NAME_PATTERN }), {
      uniqueItems: true,
      description: "Names of the teammates this worker depends on or must agree with. The link works both ways.",
    }),
  ),
  /** Directory the worker runs in. */
  cwd: Type.Optional(
    Type.String({
      description: "Directory the worker runs in, absolute or relative to the current directory. Defaults to it.",
    }),
  ),
  /** Provider and model identifier for the worker. */
  model: Type.Optional(
    Type.String({
      description:
        "Provider/model ID. Set only when the user named a model; otherwise omit to inherit the current one.",
    }),
  ),
  /** Reasoning level for the worker. */
  reasoning: Type.Optional(
    StringEnum(REASONING_LEVELS, {
      description: "Reasoning level. Set only when the user named one; otherwise omit to inherit the current one.",
    }),
  ),
  /** Tools the worker may call. */
  tools: Type.Optional(
    Type.Array(
      StringEnum(SUBAGENT_TOOLS, {
        description: "Exact tools this worker may call. The selected role can reject incompatible tools.",
      }),
      {
        uniqueItems: true,
        description: "Defaults to the selected role's tool set.",
      },
    ),
  ),
  /** Shell commands the worker may run through the approved command tool. */
  verificationCommands: Type.Optional(
    Type.Array(Type.String({ minLength: 1 }), {
      uniqueItems: true,
      description: "Exact shell commands approved for implement or verify workers.",
    }),
  ),
  /** Discoverable skills the worker may read. */
  skills: Type.Optional(
    Type.Array(Type.String(), {
      uniqueItems: true,
      description: "Names of discoverable skills this worker may read. Defaults to none.",
    }),
  ),
  /** Maximum runtime of the worker before it is aborted. */
  timeoutMs: Type.Optional(
    Type.Integer({
      minimum: TASK_TIMEOUT_MIN_MS,
      maximum: TASK_TIMEOUT_MAX_MS,
      description: "Maximum runtime in milliseconds.",
    }),
  ),
});
