import { MAX_RUNNING_SUBAGENTS } from "./task-limit.constant.ts";

export const TASK_TOOL_DESCRIPTION = [
  "Run an isolated subagent with a mission, optional role, context, model, reasoning, tools, and skills.",
  "Explore and verify roles stay read-only, and implementation workers run one at a time.",
  `Returns immediately: the subagent runs in the background and its structured result arrives later as a message. At most ${MAX_RUNNING_SUBAGENTS} subagents run at once; a launch beyond that waits for a free slot.`,
  "Subagents use the same read, search, and bash tools as you, including their batching.",
].join(" ");

export const TASK_PROMPT_GUIDELINES = [
  "Keep orchestration thin: delegate the work, do not repeat it. Read a subagent's result instead of re-reading the files it already summarised, and do cheap lookups yourself instead of starting a subagent for them.",
  "Use task for bounded independent work. Give it a short title and one specific mission.",
  "Choose explore, implement, or verify when the mission fits that role. Omit role to keep generic task behavior. Use explore or verify for reviews and audits; do not give review workers edit or write tools.",
  "Set model to a cheaper model for explore and verify workers; keep the strongest model for implement workers and for your own decisions.",
  "Specify only the context, tools, and skills the subagent needs. It does not inherit this conversation, so name the files, rules, and commands it needs in the mission.",
  "List exact verificationCommands for implement or verify workers that need to run checks.",
  `Keep up to ${MAX_RUNNING_SUBAGENTS} subagents running. Launch as many independent missions as there are free slots, in one response. Each task call reports the running count and free slots.`,
  "Do not poll or wait for subagents. When nothing else needs doing, end your turn; each result arrives as a message. When one arrives, read it, then launch a replacement for any remaining independent work. Give the final answer only after every launched subagent has reported.",
  "Implement workers share one slot.",
];

export const TASK_TOOL_LABEL = "Subagent";
export const TASK_PROMPT_SNIPPET = "Delegate a bounded mission to a subagent with a selected role";
