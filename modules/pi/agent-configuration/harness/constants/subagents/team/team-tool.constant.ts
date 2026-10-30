import { ORCHESTRATOR_RECIPIENT, TEAM_MESSAGE_MAX_CHARS, TEAM_MESSAGES_PER_WORKER } from "./team.constant.ts";

export const TEAM_MESSAGE_TOOL_LABEL = "Team message";
export const TEAM_MESSAGE_TOOL_DESCRIPTION = [
  `Send one short message to a teammate or to the ${ORCHESTRATOR_RECIPIENT}.`,
  "It never waits: you keep working and any reply arrives by itself before your next step.",
].join(" ");
export const TEAM_MESSAGE_TOOL_SNIPPET = `Message a teammate or the ${ORCHESTRATOR_RECIPIENT} when blocked`;
export const TEAM_MESSAGE_TOOL_GUIDELINES = [
  "Message only when you are blocked, or when a decision changes what a teammate must build. Never report progress or ask for confirmation; finish your mission and report instead.",
  `Keep it under ${TEAM_MESSAGE_MAX_CHARS} characters and state the exact question or fact. You may send ${TEAM_MESSAGES_PER_WORKER} messages in total.`,
];

export const MESSAGE_SUBAGENT_TOOL_LABEL = "Message subagent";
export const MESSAGE_SUBAGENT_TOOL_DESCRIPTION = [
  "Send one short message to a running named subagent.",
  "It never waits and the worker reads it before its next step.",
].join(" ");
export const MESSAGE_SUBAGENT_TOOL_SNIPPET = "Answer or redirect a running named subagent";
export const MESSAGE_SUBAGENT_TOOL_GUIDELINES = [
  "Answer a worker's message only when the answer unblocks it, or redirect a worker whose work is no longer needed. Do not narrate progress to workers.",
];
