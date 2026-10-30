import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Value } from "typebox/value";
import {
  INPUT_CARD_RENDERER_KEY,
  INTERMEDIATE_REPLY_CHECK_KEY,
  MESSAGE_CARD_RENDERER_KEY,
} from "../../../constants/transcript/card/card-renderer-key.constant.ts";
import { TUI_MODE } from "../../../constants/ui-mode/tui-mode.constant.ts";
import { ReplyTimestampSchema } from "../../../schemas/transcript/card/reply-timestamp.schema.ts";
import { activityStore } from "../../../stores/activity/activity.store.ts";
import { subagentRegistry } from "../../../stores/subagents/subagent-registry.store.ts";
import { isReplyDuringSubagentRun } from "./is-reply-during-subagent-run.service.ts";
import { renderInputCard } from "./render-input-card.service.ts";
import { renderMessageCard } from "./render-message-card.service.ts";

function isIntermediateReply(reply: unknown): boolean {
  if (!Value.Check(ReplyTimestampSchema, reply)) return false;

  return isReplyDuringSubagentRun({
    activities: activityStore.all(),
    registry: subagentRegistry,
    replyTimestamp: reply.timestamp,
  });
}

export function installCardRenderers(pi: ExtensionAPI): void {
  pi.on("session_start", (_event, ctx) => {
    if (ctx.mode !== TUI_MODE) return;
    Reflect.set(globalThis, MESSAGE_CARD_RENDERER_KEY, renderMessageCard);
    Reflect.set(globalThis, INPUT_CARD_RENDERER_KEY, renderInputCard);
    Reflect.set(globalThis, INTERMEDIATE_REPLY_CHECK_KEY, isIntermediateReply);
  });

  pi.on("session_shutdown", () => {
    Reflect.deleteProperty(globalThis, MESSAGE_CARD_RENDERER_KEY);
    Reflect.deleteProperty(globalThis, INPUT_CARD_RENDERER_KEY);
    Reflect.deleteProperty(globalThis, INTERMEDIATE_REPLY_CHECK_KEY);
  });
}
