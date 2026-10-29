import {
  NIXOS_DESCRIPTION_NOTE,
  NIXOS_MISSING_COMMAND_HINT,
  NIXOS_RELEASE_ID,
} from "../../../constants/tools/run/host-guidance.constant.ts";
import type { HostGuidance } from "../../../types/tools/run/host-guidance.interface.ts";
import type { HostRelease } from "../../../types/tools/run/host-release.interface.ts";

function installedToolsGuideline(installedTools: readonly string[]): string {
  if (installedTools.length === 0) return "Check that a program exists on the host before depending on it.";

  return `Also installed: ${installedTools.map((tool) => `\`${tool}\``).join(", ")}.`;
}

export function describeHostGuidance(release: HostRelease, installedTools: readonly string[]): HostGuidance {
  const installedGuideline = installedToolsGuideline(installedTools);
  if (release.id === NIXOS_RELEASE_ID) {
    return {
      descriptionNote: NIXOS_DESCRIPTION_NOTE,
      installedToolsGuideline: installedGuideline,
      missingCommandHint: NIXOS_MISSING_COMMAND_HINT,
    };
  }

  return {
    descriptionNote: `The host is ${release.prettyName}.`,
    installedToolsGuideline: installedGuideline,
    missingCommandHint: `command not found: it is not installed on this host (${release.prettyName}).`,
  };
}
