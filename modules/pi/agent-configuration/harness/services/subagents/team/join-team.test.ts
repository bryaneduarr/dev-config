import { expect, test } from "bun:test";
import type { TaskRequest } from "../../../types/subagents/tasks/run/task-request.interface.ts";
import { absent, present } from "../roles/resolve-task-role.test-double.ts";
import { runningProgress } from "../tasks/run/report-finished-subagent.test-double.ts";
import { createTeamMailbox } from "./create-team-mailbox.service.ts";
import { joinTeam } from "./join-team.service.ts";

function requestOf(name: TaskRequest["name"], talksTo: TaskRequest["talksTo"]): TaskRequest {
  return {
    title: "t",
    mission: "m",
    role: absent,
    tools: absent,
    verificationCommands: absent,
    context: absent,
    model: absent,
    reasoning: absent,
    skills: absent,
    timeoutMs: absent,
    cwd: "/tmp",
    name,
    talksTo,
  };
}

test("a named worker receives messages through its session steer", async () => {
  const mailbox = createTeamMailbox();
  const steered: string[] = [];
  const session = {
    steer: async (text: string) => {
      steered.push(text);
      return "queued" as const;
    },
  };

  joinTeam({ mailbox, runId: runningProgress("run-1").id, request: requestOf(present("fn-a"), absent), session });
  await mailbox.sendFromOrchestrator({ to: "fn-a", message: "hello" });

  expect(steered).toEqual(["[message from orchestrator] hello"]);
});

test("an unnamed worker never joins the team", async () => {
  const mailbox = createTeamMailbox();
  const session = { steer: async () => "queued" as const };

  joinTeam({ mailbox, runId: "run-1", request: requestOf(absent, absent), session });

  expect((await mailbox.sendFromOrchestrator({ to: "fn-a", message: "hello" })).kind).toBe("refused");
});
