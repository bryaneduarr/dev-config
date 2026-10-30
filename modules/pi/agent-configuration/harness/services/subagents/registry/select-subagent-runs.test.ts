import { expect, test } from "bun:test";
import { createTeamMailbox } from "../team/create-team-mailbox.service.ts";
import { createSubagentRegistry } from "./create-subagent-registry.service.ts";
import { selectSubagentRuns } from "./select-subagent-runs.service.ts";

test("an empty registry yields no runs for an empty or unknown id", () => {
  const registry = createSubagentRegistry(createTeamMailbox());

  expect(selectSubagentRuns(registry, "")).toEqual([]);
  expect(selectSubagentRuns(registry, "missing")).toEqual([]);
});
