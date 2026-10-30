import { MAX_RUNNING_SUBAGENTS } from "./task-limit.constant.ts";

export const TASK_TOOL_DESCRIPTION = [
  "Run an isolated subagent with a mission, optional role, context, working directory, model, reasoning, tools, and skills.",
  "Explore and verify roles stay read-only. In a git repository each implement worker edits its own checkout on its own branch, so implement workers run in parallel.",
  `Returns immediately: the subagent runs in the background and its structured result arrives later as a message. At most ${MAX_RUNNING_SUBAGENTS} subagents run at once; a launch beyond that waits for a free slot.`,
  "Subagents use the same read, search, and bash tools as you, including their batching.",
].join(" ");

export const TASK_PROMPT_GUIDELINES = [
  "Give each worker one goal, a short title, and only the files, rules, and context it needs; it does not inherit this conversation.",
  "A mission that needs another's result or edits waits for that result, and you pass what it needs in its context. Missions that edit the same files do not run in parallel.",
  `Launch ready missions together in one response, up to ${MAX_RUNNING_SUBAGENTS} slots. Each result arrives as a message, so do not poll.`,
  "Write exact signatures, names, and file ownership into every mission up front. Name a worker only if it may need to coordinate: it then gets message_team, an unnamed one cannot message anyone. Set talksTo to the teammates it depends on. Answer a worker with message_subagent only when that unblocks it.",
  "Implement workers run in parallel, each in a private git checkout of the current commit (without uncommitted changes), and report a branch: merge it with git merge, one at a time, and resolve conflicts before launching dependent work. Outside a git repository they run one at a time.",
  "Choose explore, implement, or verify when it fits; reviews are read-only. Leave model and reasoning unset to inherit yours; set either only when the user named it, and use exactly that.",
  "Set cwd to run a worker in a project folder. List exact verificationCommands for workers that run checks; a reviewer needs read-only commands such as git status and git diff approved.",
];

export const TASK_TOOL_LABEL = "Subagent";
export const TASK_PROMPT_SNIPPET = "Run a bounded mission in a subagent with a selected role";
