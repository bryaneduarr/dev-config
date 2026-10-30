import { expect, test } from "bun:test";
import type { TeamEscalation } from "../../../types/subagents/team/team-escalation.interface.ts";
import { createTeamMailbox } from "./create-team-mailbox.service.ts";
import { joinRecorded } from "./create-team-mailbox.test-double.ts";

test("a linked teammate receives the message labelled with the sender", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: ["fn-b"] });
  const beta = joinRecorded(mailbox, { runId: "run-b", name: "fn-b", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "fn-b", message: "use Result<T>" });

  expect(outcome).toEqual({ kind: "delivered" });
  expect(beta.received).toEqual(["[message from fn-a] use Result<T>"]);
  expect(alpha.received).toEqual([]);
});

test("a link declared by either side lets the other reply", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: ["fn-b"] });
  const beta = joinRecorded(mailbox, { runId: "run-b", name: "fn-b", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: beta.runId, to: "fn-a", message: "done" });

  expect(outcome.kind).toBe("delivered");
  expect(alpha.received).toEqual(["[message from fn-b] done"]);
});

test("a worker cannot message a teammate it is not linked to and is told to use the orchestrator", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });
  const gamma = joinRecorded(mailbox, { runId: "run-c", name: "fn-c", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "fn-c", message: "hi" });

  expect(outcome).toEqual({
    kind: "refused",
    reason: 'You are not linked to "fn-c". Message the orchestrator instead.',
  });
  expect(gamma.received).toEqual([]);
});

test("a message to a name nobody runs lists who is running", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "ghost", message: "hi" });

  expect(outcome.kind).toBe("refused");
  expect(JSON.stringify(outcome)).toContain("Running: fn-a");
});

test("a message to the orchestrator reaches its sink with the worker name", async () => {
  const mailbox = createTeamMailbox();
  const escalations: TeamEscalation[] = [];
  mailbox.routeToOrchestrator((escalation) => escalations.push(escalation));
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "blocked" });

  expect(outcome.kind).toBe("delivered");
  expect(escalations).toEqual([{ from: "fn-a", message: "blocked" }]);
});

test("without a route to the orchestrator the worker is told so", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "blocked" });

  expect(outcome).toEqual({ kind: "refused", reason: "The orchestrator cannot be reached." });
});

test("the orchestrator reaches a named worker, and a worker that left cannot be reached", async () => {
  const mailbox = createTeamMailbox();
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const reached = await mailbox.sendFromOrchestrator({ to: "fn-a", message: "use snake_case" });
  mailbox.leave(alpha.runId);
  const gone = await mailbox.sendFromOrchestrator({ to: "fn-a", message: "again" });

  expect(reached.kind).toBe("delivered");
  expect(alpha.received).toEqual(["[message from orchestrator] use snake_case"]);
  expect(gone.kind).toBe("refused");
});

test("a recipient that cannot take the message makes the send fail instead of throwing", async () => {
  const mailbox = createTeamMailbox();
  mailbox.join({
    runId: "run-a",
    name: "fn-a",
    talksTo: [],
    deliver: async () => {
      throw new Error("session closed");
    },
  });

  const outcome = await mailbox.sendFromOrchestrator({ to: "fn-a", message: "hi" });

  expect(outcome).toEqual({ kind: "refused", reason: "fn-a could not receive the message." });
});

test("clearing the mailbox removes every member", async () => {
  const mailbox = createTeamMailbox();
  joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  mailbox.clear();

  expect((await mailbox.sendFromOrchestrator({ to: "fn-a", message: "hi" })).kind).toBe("refused");
});
