import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { READ_TOOL_NAME } from "../../constants/tools/active-tools/harness-tools.constant.ts";
import {
  READ_TOOL_DESCRIPTION,
  READ_TOOL_GUIDELINES,
  READ_TOOL_LABEL,
  READ_TOOL_PROMPT_SNIPPET,
} from "../../constants/tools/read/read-tool.constant.ts";
import { ReadParamsSchema } from "../../schemas/tools/read/read-parameters.schema.ts";
import { createHarnessRenderers } from "../../services/tool-rendering/renderers/create-harness-renderers.service.ts";
import { readFiles } from "../../services/tools/read/read-files.service.ts";
import { toReadRequests } from "../../services/tools/read/to-read-requests.service.ts";
import { toTextToolResult } from "../../services/tools/result/to-text-tool-result.service.ts";

export function createReadToolDefinition() {
  return defineTool({
    name: READ_TOOL_NAME,
    label: READ_TOOL_LABEL,
    description: READ_TOOL_DESCRIPTION,
    promptSnippet: READ_TOOL_PROMPT_SNIPPET,
    promptGuidelines: [...READ_TOOL_GUIDELINES],
    parameters: ReadParamsSchema,
    ...createHarnessRenderers(READ_TOOL_NAME),
    async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
      return toTextToolResult(await readFiles(toReadRequests(params, ctx.cwd)));
    },
  });
}

export function registerReadTool(pi: ExtensionAPI): void {
  pi.registerTool(createReadToolDefinition());
}
