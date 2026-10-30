import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { renderSubagentCard } from "../../components/subagents/subagent-card.component.ts";
import { EMPTY } from "../../components/tool-rendering/empty.component.ts";
import { SUBAGENT_REPORT_MESSAGE_TYPE } from "../../constants/subagents/registry/subagent-report.constant.ts";
import { TASK_TOOL_NAME } from "../../constants/subagents/roles/roles.constant.ts";
import {
  TASK_PROMPT_GUIDELINES,
  TASK_PROMPT_SNIPPET,
  TASK_TOOL_DESCRIPTION,
  TASK_TOOL_LABEL,
} from "../../constants/subagents/tasks/run/tool-description.constant.ts";
import { TaskParams } from "../../schemas/subagents/tasks/run/task-params.schema.ts";
import { toValueState } from "../../services/activity/value/to-value-state.service.ts";
import { resolveLiveTaskProgress } from "../../services/subagents/card/resolve-live-task-progress.service.ts";
import { readSubagentCapacity } from "../../services/subagents/registry/read-subagent-capacity.service.ts";
import { formatTaskLaunchText } from "../../services/subagents/result/format-task-launch-text.service.ts";
import { readTaskProgress } from "../../services/subagents/tasks/progress/read-task-progress.service.ts";
import { reportFinishedSubagent } from "../../services/subagents/tasks/run/report-finished-subagent.service.ts";
import { toTaskRequest } from "../../services/subagents/tasks/run/to-task-request.service.ts";
import { subagentRegistry } from "../../stores/subagents/subagent-registry.store.ts";

export function registerTaskTool(pi: ExtensionAPI): void {
  pi.registerTool({
    name: TASK_TOOL_NAME,
    label: TASK_TOOL_LABEL,
    description: TASK_TOOL_DESCRIPTION,
    promptSnippet: TASK_PROMPT_SNIPPET,
    promptGuidelines: TASK_PROMPT_GUIDELINES,
    parameters: TaskParams,
    executionMode: "parallel",
    renderShell: "self",
    renderCall(args, theme, context) {
      const isPreparingCall = context.isPartial && !context.executionStarted;
      if (!isPreparingCall) return EMPTY;

      return renderSubagentCard({
        theme,
        toolCallId: context.toolCallId,
        title: args.title,
        progressLookup: { found: false },
        lastComponent: toValueState(context.lastComponent),
      });
    },
    renderResult(toolResult, _options, theme, context) {
      return renderSubagentCard({
        theme,
        toolCallId: context.toolCallId,
        title: context.args.title,
        progressLookup: resolveLiveTaskProgress(subagentRegistry, readTaskProgress(toolResult.details)),
        lastComponent: toValueState(context.lastComponent),
      });
    },
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      const handle = subagentRegistry.create(toTaskRequest(params), ctx);
      reportFinishedSubagent({
        registry: subagentRegistry,
        handle,
        onFinished: (report) =>
          pi.sendMessage(
            { customType: SUBAGENT_REPORT_MESSAGE_TYPE, content: report.text, display: false, details: report.details },
            { triggerTurn: true, deliverAs: "followUp" },
          ),
      });
      const capacity = readSubagentCapacity(subagentRegistry.list());

      return {
        content: [{ type: "text", text: formatTaskLaunchText(handle.progress, capacity) }],
        details: handle.progress,
      };
    },
  });
}
