import { basename, resolve } from "node:path";
import {
  EDIT_TOOL_NAME,
  READ_TOOL_NAME,
  RUN_TOOL_NAME,
  SEARCH_TOOL_NAME,
} from "../../../constants/tools/active-tools/harness-tools.constant.ts";
import type { HarnessTool } from "../../../types/tools/active-tools/harness-tool.interface.ts";
import { splitLeadingCd } from "../../tools/run/split-leading-cd.service.ts";
import { oneLine } from "../text/one-line.service.ts";
import { readTarget } from "./read-target.service.ts";
import { searchTarget } from "./search-target.service.ts";

function stringArg(args: Record<string, unknown>, key: string): string {
  const argument = args[key];
  return typeof argument === "string" ? argument : "";
}

function runTarget(command: string, cwd: string): string {
  const leadingCd = cwd ? { kind: "none" as const } : splitLeadingCd(command);
  const shownCommand = leadingCd.kind === "split" ? leadingCd.command : command;
  const directory = leadingCd.kind === "split" ? leadingCd.directory : cwd;
  const isSessionDirectory = !directory || resolve(directory) === process.cwd();
  const directoryLabel = isSessionDirectory ? "" : ` (in ${basename(directory)})`;
  return `${oneLine(shownCommand)}${directoryLabel}`;
}

export function harnessToolTarget(tool: HarnessTool, args: Record<string, unknown>): string {
  switch (tool) {
    case SEARCH_TOOL_NAME:
      return searchTarget(args);
    case READ_TOOL_NAME:
      return readTarget(args);
    case EDIT_TOOL_NAME: {
      const from = stringArg(args, "from") || stringArg(args, "path");
      const to = stringArg(args, "to");
      return to ? `${from} -> ${to}` : oneLine(from);
    }
    case RUN_TOOL_NAME:
      return runTarget(stringArg(args, "command"), stringArg(args, "cwd"));
    default:
      return tool satisfies never;
  }
}
