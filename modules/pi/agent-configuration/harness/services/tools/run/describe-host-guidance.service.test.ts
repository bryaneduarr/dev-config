import { expect, test } from "bun:test";
import type { ExecResult } from "../../../types/tools/process/exec-result.interface.ts";
import { describeHostGuidance } from "./describe-host-guidance.service.ts";
import { formatRunHeader } from "./format-run-header.service.ts";
import { parseOsRelease } from "./parse-os-release.service.ts";

const UBUNTU_RELEASE = 'PRETTY_NAME="Ubuntu 26.04.1 LTS"\nNAME="Ubuntu"\nID=ubuntu\nID_LIKE=debian\n';

function failedResult(stderr: string): ExecResult {
  return { stdout: "", stderr, code: 127, killed: false, timedOut: false };
}

test("parses the id and pretty name, and falls back to the specification defaults", () => {
  expect(parseOsRelease(UBUNTU_RELEASE)).toEqual({ id: "ubuntu", prettyName: "Ubuntu 26.04.1 LTS" });
  expect(parseOsRelease("")).toEqual({ id: "linux", prettyName: "Linux" });
});

test("names the Nix workflow only on NixOS", () => {
  const nixos = describeHostGuidance({ id: "nixos", prettyName: "NixOS 25.11" }, []);
  const ubuntu = describeHostGuidance(parseOsRelease(UBUNTU_RELEASE), ["xxd", "lsof"]);

  expect(nixos.descriptionNote).toContain("nix shell");
  expect(ubuntu.descriptionNote).toBe("The host is Ubuntu 26.04.1 LTS.");
  expect(ubuntu.missingCommandHint).not.toContain("nix");
  expect(ubuntu.installedToolsGuideline).toBe("Also installed: `xxd`, `lsof`.");
});

test("adds the missing-command hint only when the output says the program is missing", () => {
  expect(formatRunHeader(failedResult("sh: 1: gh: not found"), "HINT")).toContain("HINT");
  expect(formatRunHeader(failedResult("spawn x ENOENT"), "HINT")).toContain("HINT");
  expect(formatRunHeader(failedResult("container exited with 127"), "HINT")).not.toContain("HINT");
});
