import { expect, test } from "bun:test";
import { readToolResultFields } from "../../activity/parsing/tool-result/read-tool-result-fields.service.ts";
import { createActivityStore } from "../../activity/store/create-activity-store.service.ts";
import { mirrorSubagentProgress } from "../../subagents/activity/mirror-subagent-progress.service.ts";
import { registryOf, runningProgress } from "../../subagents/tasks/run/report-finished-subagent.test-double.ts";
import { isReplyDuringSubagentRun } from "./is-reply-during-subagent-run.service.ts";

const LAUNCHED_AT = 10;
const TOOL_CALL_ID = "call-1";

function storeWithLaunchedSubagent() {
  const store = createActivityStore();
  const launched = runningProgress("run-1");
  store.begin({ id: TOOL_CALL_ID, toolName: "task", args: {}, cwd: "/tmp", startedAt: LAUNCHED_AT });
  store.finish(TOOL_CALL_ID, {
    ...readToolResultFields(launched),
    text: "Launched",
    status: "success",
    endedAt: LAUNCHED_AT,
  });

  return { store, launched };
}

test("a reply written while its subagent still runs is intermediate", () => {
  const { store, launched } = storeWithLaunchedSubagent();

  expect(
    isReplyDuringSubagentRun({
      activities: store.all(),
      registry: registryOf([launched]),
      replyTimestamp: LAUNCHED_AT + 5,
    }),
  ).toBe(true);
});

test("a reply written after every subagent finished is the final reply", () => {
  const { store, launched } = storeWithLaunchedSubagent();
  const finished = { ...launched, status: "success" as const };
  mirrorSubagentProgress({ store, toolCallId: TOOL_CALL_ID, progress: finished, endedAt: LAUNCHED_AT + 20 });

  expect(
    isReplyDuringSubagentRun({
      activities: store.all(),
      registry: registryOf([finished]),
      replyTimestamp: LAUNCHED_AT + 30,
    }),
  ).toBe(false);
});

test("a reply written before a subagent finished stays intermediate once it has finished", () => {
  const { store, launched } = storeWithLaunchedSubagent();
  const finished = { ...launched, status: "success" as const };
  mirrorSubagentProgress({ store, toolCallId: TOOL_CALL_ID, progress: finished, endedAt: LAUNCHED_AT + 20 });

  expect(
    isReplyDuringSubagentRun({
      activities: store.all(),
      registry: registryOf([finished]),
      replyTimestamp: LAUNCHED_AT + 5,
    }),
  ).toBe(true);
});

test("a reply written before any subagent launched is the final reply", () => {
  const { store, launched } = storeWithLaunchedSubagent();

  expect(
    isReplyDuringSubagentRun({
      activities: store.all(),
      registry: registryOf([launched]),
      replyTimestamp: LAUNCHED_AT - 5,
    }),
  ).toBe(false);
});
