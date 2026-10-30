import { expect, test } from "bun:test";
import { readUnreadTeamMessageRisks } from "./read-unread-team-message-risks.service.ts";

test("messages still queued when the worker ends are reported as a risk", () => {
  const risks = readUnreadTeamMessageRisks({ getSteeringMessages: () => ["[message from fn-b] hi"] });

  expect(risks).toEqual(["The worker finished before reading 1 message(s): [message from fn-b] hi"]);
});

test("a worker that read everything has no risk", () => {
  expect(readUnreadTeamMessageRisks({ getSteeringMessages: () => [] })).toEqual([]);
});
