import { expect, test } from "bun:test";
import { TEAM_MESSAGE_MAX_CHARS, TEAM_MESSAGES_PER_WORKER } from "../../../constants/subagents/team/team.constant.ts";
import type { TeamEscalation } from "../../../types/subagents/team/team-escalation.interface.ts";
import { createTeamMailbox } from "./create-team-mailbox.service.ts";
import { joinRecorded } from "./create-team-mailbox.test-double.ts";

test("a worker may send only a fixed number of messages, and refused ones do not count", async () => {
  const mailbox = createTeamMailbox();
  mailbox.routeToOrchestrator(() => {});
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });
  await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "ghost", message: "refused, not counted" });

  for (let sent = 0; sent < TEAM_MESSAGES_PER_WORKER; sent += 1) {
    const outcome = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "q" });
    expect(outcome.kind).toBe("delivered");
  }
  const extra = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "q" });

  expect(extra.kind).toBe("refused");
});

test("empty and oversized messages are refused", async () => {
  const mailbox = createTeamMailbox();
  mailbox.routeToOrchestrator(() => {});
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const empty = await mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "  " });
  const long = await mailbox.sendFromWorker({
    fromRunId: alpha.runId,
    to: "orchestrator",
    message: "x".repeat(TEAM_MESSAGE_MAX_CHARS + 1),
  });

  expect([empty.kind, long.kind]).toEqual(["refused", "refused"]);
});

test("messages sent at the same moment cannot exceed the cap", async () => {
  const mailbox = createTeamMailbox();
  const escalations: TeamEscalation[] = [];
  mailbox.routeToOrchestrator((escalation) => escalations.push(escalation));
  const alpha = joinRecorded(mailbox, { runId: "run-a", name: "fn-a", talksTo: [] });

  const sends = Array.from({ length: TEAM_MESSAGES_PER_WORKER + 4 }, () =>
    mailbox.sendFromWorker({ fromRunId: alpha.runId, to: "orchestrator", message: "q" }),
  );
  await Promise.all(sends);

  expect(escalations).toHaveLength(TEAM_MESSAGES_PER_WORKER);
});
