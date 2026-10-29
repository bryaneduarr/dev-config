import { readFileSync } from "node:fs";
import {
  OPTIONAL_HOST_TOOLS,
  OS_RELEASE_DEFAULT_ID,
  OS_RELEASE_DEFAULT_PRETTY_NAME,
  OS_RELEASE_PATH,
} from "../../../constants/tools/run/host-guidance.constant.ts";
import type { HostGuidance } from "../../../types/tools/run/host-guidance.interface.ts";
import { describeHostGuidance } from "./describe-host-guidance.service.ts";
import { findInstalledTools } from "./find-installed-tools.service.ts";
import { parseOsRelease } from "./parse-os-release.service.ts";

function readReleaseText(): string {
  try {
    return readFileSync(OS_RELEASE_PATH, "utf8");
  } catch {
    return `ID=${OS_RELEASE_DEFAULT_ID}\nPRETTY_NAME=${OS_RELEASE_DEFAULT_PRETTY_NAME}`;
  }
}

export function readHostGuidance(environment: NodeJS.ProcessEnv): HostGuidance {
  const pathValue = environment.PATH;
  const installedTools = pathValue === undefined ? [] : findInstalledTools(OPTIONAL_HOST_TOOLS, pathValue);
  return describeHostGuidance(parseOsRelease(readReleaseText()), installedTools);
}
