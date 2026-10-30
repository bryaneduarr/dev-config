import { expect, test } from "bun:test";
import { SUBAGENT_NOT_RUNNING_MESSAGE } from "../../../constants/subagents/registry/subagent-command.constant.ts";
import { createTeamMailbox } from "../team/create-team-mailbox.service.ts";
import { cancelSubagent } from "./cancel-subagent.service.ts";
import { createSubagentRegistry } from "./create-subagent-registry.service.ts";

test("cancelling an unknown subagent says none is running", () => {
  expect(cancelSubagent(createSubagentRegistry(createTeamMailbox()), "missing")).toBe(SUBAGENT_NOT_RUNNING_MESSAGE);
});
